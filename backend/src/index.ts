import express from "express";
import {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME,
    OPENAI_API_KEY,
} from "./utils/config/config";
import { Request, Response, Router } from "express";
import dotenv from 'dotenv';
dotenv.config();

import {
    S3Client,
    ListBucketsCommand,
    CreateBucketCommand,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import imageRouter from "./routes/images";
import openaiClient from "./ai/openaiSingleton";
import { loggingHandler } from "./utils/middleware/loggingHandler";
import "./utils/config/logging";

const app = express();
const port = 3000;

app.use(express.json({ limit: "2mb" }));
app.use(loggingHandler);

app.get("/", (_req, res) => {
    res.send("Hello!");
});

// const s3Client = new S3Client({
//     region: "us-east-1",
//     credentials: {
//         accessKeyId: AWS_ACCESS_KEY_ID,
//         secretAccessKey: AWS_SECRET_ACCESS_KEY,
//     },
// });

app.use("/api", imageRouter);

let sessionData = {
    originalUrl: "",
    topic: "",
};

app.post("/save-session", (req: any, res: any) => {
    const { original_url, topic } = req.body;
    console.log("📥 Saving session:", req.body);

    if (original_url) sessionData.originalUrl = original_url;
    if (topic) sessionData.topic = topic;

    console.log("Session saved:", sessionData);
    res.json({ message: "Session data saved", sessionData });
});

// app.post("/test", async (req, res) => {
//     await s3Client.send(
//         new PutObjectCommand({
//             Bucket: AWS_S3_BUCKET_NAME,
//             Key: "my-first-object.txt",
//             Body: "Hello JavaScript SDK!",
//         })
//     );
//     console.log("Successfully uploaded object: my-first-object.txt");

//     const { Body } = await s3Client.send(
//         new GetObjectCommand({
//             Bucket: AWS_S3_BUCKET_NAME,
//             Key: "my-first-object.txt",
//         })
//     );
//     if (Body == null) {
//         console.log("Body is null");
//         res.status(500).send("Body is null");
//         return;
//     }

//     console.log(await Body.transformToString());

//     res.send("Test endpoint");
// });

// app.post("/api/generate", async (req, res) => {
//     const { topic } = req.body;

//     const response = await openaiClient.responses.create({
//         model: "gpt-4.1-nano-2025-04-14",
//         instructions: `You are a quiz generator assistant that generates well rounded multiple-choice questions. Generate 3 multiple-choice questions (with 4 options each) on the topic the user provides.
//         Return only the raw JSON with no Markdown or explanation. The answer must match one of the options exactly. Format the output as JSON with this structure, do not wrap the json codes in JSON markers:
//         [
//             {
//                 "question": "...",
//                 "options": ["A", "B", "C", "D"],
//                 "answer": "A"
//             }
//         ]`,
//         input: topic,
//     });

//     const content = response.output_text;

//     console.log(content);
//     try {
//         const quiz = JSON.parse(content);
//         res.json(quiz);
//     } catch {
//         console.error("OpenAI quiz format error:", content);
//         res.status(500).json({ error: "OpenAI quiz format error" });
//     }
// });

app.post("/api/generate", async (req: any, res: Response) => {
    const { topic } = req.body;

    try {
        const response = await openaiClient.responses.create({
            model: "gpt-4.1-nano-2025-04-14",
            instructions: `You are a quiz generator assistant that returns only raw JSON multiple-choice questions.

    Given a topic, return exactly 3 multiple-choice questions in a JSON array.

    Each question must have 4 options and a correct answer. Format:

    [
    {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "answer": "B"
    }
    ]

    Do NOT explain anything. Do NOT include markdown. ONLY return the raw JSON array.`,
            input: topic,
        });

        const content = response.output_text;
        console.log(content);

        const quiz = JSON.parse(content);
        res.json(quiz);
    } catch (error) {
        console.error("OpenAI quiz format error:", error);
        res.status(500).json({ error: "OpenAI quiz format error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Define the shape of the request body
interface VerifyActivityBody {
    url: string;
    screenshot: string;
}
const router = Router();

router.post(
    "/verify-activity",
    async (
        req: Request<{}, {}, VerifyActivityBody>,
        res: Response
    ): Promise<void> => {
        const { url, screenshot } = req.body;

        if (!url || !screenshot) {
            res.status(400).json({ error: "Missing URL or screenshot" });
            return;
        }

        console.log("🔍 Received screenshot for:", url);

        const { topic } = sessionData;
        console.log("🧠 Stored session topic:", sessionData.topic);

        const prompt = `
            You are a content relevance checker.

            Based on this website URL: "${url}"
            And the user's topic of focus: "${topic}"

            Determine if this webpage is likely related to the topic. Respond with just "YES" or "NO".
        `;

        const aiResponse = await openaiClient.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a relevance-checking assistant.",
                },
                { role: "user", content: prompt },
            ],
        });

        const choice = aiResponse.choices?.[0];
        const result = choice?.message?.content?.trim() || "NO RESPONSE";
        const isRelevant = result.toLowerCase().includes("yes");

        console.log(`✅ Topic relevance: ${isRelevant ? "MATCH" : "NO MATCH"}`);
        res.json({ isRelevant, result });
    }
);

app.use("/", router);
