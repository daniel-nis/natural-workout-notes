import 'dotenv/config'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const config = {
  llm: {
    apiKey: requireEnv('KIMI_API_KEY'),
    baseURL: 'https://api.moonshot.ai/v1',
    model: 'kimi-k2.5',
  },
  server: {
    port: parseInt(process.env.PORT || '4000', 10),
  },
} as const