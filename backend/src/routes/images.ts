import express from "express";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME,
} from "../utils/config/config";
import { v4 as uuidv4 } from "uuid";
import openaiClient from "../ai/openaiSingleton";

const router = express.Router();

// const s3Client = new S3Client({
//     region: "us-east-1",
//     credentials: {
//         accessKeyId: AWS_ACCESS_KEY_ID!,
//         secretAccessKey: AWS_SECRET_ACCESS_KEY!,
//     },
// });

// router.post("/upload-image", async (req: any, res: any) => {
//     const { imageBase64 } = req.body;

//     if (!imageBase64) {
//         return res.status(400).json({ error: "Missing image data" });
//     }

//     try {
//         // Extract and decode image
//         const buffer = Buffer.from(
//             imageBase64.replace(/^data:image\/\w+;base64,/, ""),
//             "base64"
//         );
//         const fileType = imageBase64.match(/^data:image\/(\w+);base64,/)[1];
//         const fileName = `hunterhacks/${uuidv4()}.${fileType}`;
//         const contentType = `image/${fileType}`;

//         // Upload to S3
//         const putCommand = new PutObjectCommand({
//             Bucket: process.env.AWS_S3_BUCKET_NAME,
//             Key: fileName,
//             Body: buffer,
//             ContentType: contentType,
//         });

//         await s3Client.send(putCommand);

//         // Generate signed GET URL (valid for 5 mins)
//         const getCommand = new GetObjectCommand({
//             Bucket: process.env.AWS_S3_BUCKET_NAME,
//             Key: fileName,
//         });

//         const signedUrl = await getSignedUrl(s3Client, getCommand, {
//             expiresIn: 60 * 5,
//         });

//         res.json({ imageUrl: signedUrl });
//     } catch (err) {
//         console.error("S3 upload failed:", err);
//         res.status(500).json({
//             error: "Image upload or URL generation failed",
//         });
//     }
// });

router.post("/analyze", async (req, res) => {
    const { topic, imageUrl } = req.body;

    const response = await openaiClient.responses.create({
        model: "gpt-4o",
        instructions: `Is this image of the user screen, provided by the imageURL related to the topic "${topic}"? Respond with these 3 following choices, "related", "unsure" or "unrelated".
        Return only the raw JSON with no Markdown text or explanation. Format the output as JSON with this structure exactly, do not wrap the json codes in JSON markers:
        {
            "response": "related|unsure|unrelated",
            "confidence": 0.0-1.0,
            "explanation": "..."
        }`,
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_image",
                        image_url: imageUrl,
                        detail: "low",
                    },
                ],
            },
        ],
    });

    const content = response.output_text;

    console.log(content);
    try {
        const answer = JSON.parse(content);
        res.json(answer);
    } catch {
        console.error("OpenAI quiz format error:", content);
        res.status(500).json({ error: "OpenAI quiz format error" });
    }
});

export default router;
