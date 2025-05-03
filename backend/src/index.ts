import express from 'express';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from './utils/config/config';
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello!');
});

const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
    const { topic, image } = req.body;


});

app.post("/generate", async (req, res) => {
    const { topic } = req.body;

    const response = await client.responses.create({
        model: "gpt-4.1-nano-2025-04-14",
        instructions: `You are a quiz generator assistant that generates well rounded multiple-choice questions. Generate 3 multiple-choice questions (with 4 options each) on the topic the user provides.
        Return only the raw JSON with no Markdown or explanation. Format the output as JSON with this structure:
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

    console.log(content)
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
