import { Configuration, OpenAIApi } from 'https://esm.sh/openai';
import { GPT3Tokenizer } from 'https://esm.sh/gpt3-tokenizer';

export const openAiConfiguration = new Configuration({
    organization: process.env.OPENAI_ORG_KEY,
    apiKey: process.env.OPENAI_API_KEY,
});

export const openAi = new OpenAIApi(openAiConfiguration);

export const gpt3Tokenizer = new GPT3Tokenizer({ type: 'gpt3' });