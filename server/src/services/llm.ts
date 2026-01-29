import OpenAI from 'openai';

console.log('API Key:', process.env.KIMI_API_KEY ? 'Loaded' : 'MISSING')

const client = new OpenAI({
    apiKey: process.env['KIMI_API_KEY'],
    baseURL: 'https://api.moonshot.ai/v1'
});

export async function callLLM(systemPrompt: string, userInput: string): Promise<string> {
    const response = await client.chat.completions.create({
        model: "kimi-k2.5",
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput }
        ],
    });

    return response.choices[0].message.content || 'failed to get response';
}