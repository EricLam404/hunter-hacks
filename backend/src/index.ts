import express from "express";
import {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME,
    OPENAI_API_KEY,
} from "./utils/config/config";
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

const app = express();
const port = 3000;

app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
    res.send("Hello!");
});

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

app.use('/api', imageRouter);

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

app.post("/api/generate", async (req, res) => {
    const { topic } = req.body;

    const response = await openaiClient.responses.create({
        model: "gpt-4.1-nano-2025-04-14",
        instructions: `You are a quiz generator assistant that generates well rounded multiple-choice questions. Generate 3 multiple-choice questions (with 4 options each) on the topic the user provides.
        Return only the raw JSON with no Markdown or explanation. The answer must match one of the options exactly. Format the output as JSON with this structure, do not wrap the json codes in JSON markers:
        [
            {
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "answer": "A"
            }
        ]`,
        input: topic,
    });

    const content = response.output_text;

    console.log(content);
    try {
        const quiz = JSON.parse(content);
        res.json(quiz);
    } catch {
        console.error("OpenAI quiz format error:", content);
        res.status(500).json({ error: "OpenAI quiz format error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
