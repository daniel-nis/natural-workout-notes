import OpenAI from 'openai'
import { config } from '../config'
import { LLMError } from '../errors'

const client = new OpenAI({
  apiKey: config.llm.apiKey,
  baseURL: config.llm.baseURL,
})

export interface LLMClient {
  call(systemPrompt: string, userInput: string): Promise<string>
}

export const llmClient: LLMClient = {
  async call(systemPrompt: string, userInput: string): Promise<string> {
    try {
      const response = await client.chat.completions.create({
        model: config.llm.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new LLMError('LLM returned empty response')
      }

      return content
    } catch (error) {
      if (error instanceof LLMError) throw error
      throw new LLMError('LLM request failed', error)
    }
  },
}