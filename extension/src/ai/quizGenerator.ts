import OpenAI from "openai";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

export async function generateQuiz(topic: string): Promise<QuizQuestion[]> {
    const client = new OpenAI({
        apiKey: OPENAI_API_KEY,
    });

    const response = await client.responses.create({
        model: "gpt-4o",
        instructions: `You are a quiz generator assistant that generates well rounded multiple-choice questions. Generate 3 multiple-choice questions (with 4 options each) on the topic the user provides.
        Format the output as JSON with this structure:
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

    try {
        return JSON.parse(content);
    } catch {
        console.error("OpenAI quiz format error:", content);
        return [];
    }
}
