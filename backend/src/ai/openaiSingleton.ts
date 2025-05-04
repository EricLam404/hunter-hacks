import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/config/config";


const openaiClient = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

export default openaiClient;