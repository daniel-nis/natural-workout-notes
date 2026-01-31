export class ParserError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'ParserError'
  }
}

export class LLMError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'LLMError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}