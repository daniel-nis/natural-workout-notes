import { ParsedExercise, validateParsedExercises } from '../types'
import { ParserError, ValidationError } from '../errors'
import { LLMClient, llmClient as defaultLLMClient } from './llm'

const SYSTEM_PROMPT = `You parse workout notes into structured JSON.

OUTPUT: JSON array only. No markdown, no explanation.

SCHEMA:
{
  "exercise": string,   // Full name with equipment (e.g., "Barbell Bench Press")
  "weight": number,     // Pounds. 0 for bodyweight.
  "sets": number,
  "reps": number | null,      // null for timed exercises
  "duration": number | null   // seconds, null for rep-based
}

RULES:
- Expand abbreviations: bb=Barbell, db=Dumbbell, ohp=Overhead Press, rdl=Romanian Deadlift
- Always include equipment type when applicable (Barbell, Dumbbell, Cable, Machine)
- Convert kg to lbs: multiply by 2.2, round to nearest 5
- Bodyweight exercises: weight = 0
- Timed exercises (plank, holds): use duration in seconds, reps = null
- Rep-based exercises: use reps, duration = null
- If unparseable, return []

EXAMPLES:
"bb bench 135 3x10" → [{"exercise": "Barbell Bench Press", "weight": 135, "sets": 3, "reps": 10, "duration": null}]
"pullups 4x8" → [{"exercise": "Pull-ups", "weight": 0, "sets": 4, "reps": 8, "duration": null}]
"plank 3x30s" → [{"exercise": "Plank", "weight": 0, "sets": 3, "reps": null, "duration": 30}]
"squat 60kg 5x5" → [{"exercise": "Barbell Back Squat", "weight": 135, "sets": 5, "reps": 5, "duration": null}]`

export async function parseWorkoutText(
  input: string,
  llm: LLMClient = defaultLLMClient
): Promise<ParsedExercise[]> {
  const trimmedInput = input.trim()
  
  if (!trimmedInput) {
    return []
  }

  try {
    const response = await llm.call(SYSTEM_PROMPT, trimmedInput)
    const parsed = parseJSON(response)
    return validateParsedExercises(parsed)
  } catch (error) {
    if (error instanceof ValidationError) throw error
    if (error instanceof ParserError) throw error
    throw new ParserError('Failed to parse workout text', error)
  }
}

function parseJSON(text: string): unknown {
  try {
    // Handle potential markdown code blocks
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    return JSON.parse(cleaned)
  } catch (error) {
    throw new ValidationError('LLM returned invalid JSON', error)
  }
}