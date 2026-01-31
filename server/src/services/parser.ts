import { ParsedExercise, validateParsedExercises } from '../types.js'
import { ParserError, ValidationError } from '../errors.js'
import { LLMClient, llmClient as defaultLLMClient } from './llm.js'

const SYSTEM_PROMPT = `You parse informal workout notes into structured JSON.

OUTPUT: JSON array only. No markdown, no explanation.

SCHEMA:
{
  "exercise": string,         // Full name with equipment type
  "weight": number | null,    // Pounds. 0 for bodyweight. null if not specified.
  "sets": number | null,      // null if not specified
  "reps": number | null,      // null if not specified or timed exercise
  "duration": number | null   // seconds, null if not specified or rep-based
}

ABBREVIATIONS:
- bb = Barbell
- db = Dumbbell
- ohp = Overhead Press
- rdl = Romanian Deadlift
- dl = Deadlift

INFERENCE RULES:
- Extract whatever information IS present
- "for X" or "x reps" without sets → sets = 1
- "PR", "max", "1rm", "one rep max" → sets = 1, reps = 1
- "X sets" without reps → sets = X, reps = null
- Just weight with no sets/reps context → sets = null, reps = null
- Bodyweight exercises (pullups, pushups, dips): weight = 0
- Timed exercises (plank, holds, carries): use duration in seconds
- Convert kg to lbs: multiply by 2.2, round to nearest 5
- Include equipment type when applicable (Barbell, Dumbbell, Cable, Machine)
- If completely unparseable, return []

EXAMPLES:

Standard format:
"bb bench 135 3x10" → [{"exercise": "Barbell Bench Press", "weight": 135, "sets": 3, "reps": 10, "duration": null}]
"squat 225 5x5" → [{"exercise": "Barbell Back Squat", "weight": 225, "sets": 5, "reps": 5, "duration": null}]
"db curls 35 3x12" → [{"exercise": "Dumbbell Bicep Curl", "weight": 35, "sets": 3, "reps": 12, "duration": null}]

Partial info (infer what's possible):
"front squat 315" → [{"exercise": "Front Squat", "weight": 315, "sets": null, "reps": null, "duration": null}]
"bench 135 for 10" → [{"exercise": "Barbell Bench Press", "weight": 135, "sets": 1, "reps": 10, "duration": null}]
"3 sets of bench 135" → [{"exercise": "Barbell Bench Press", "weight": 135, "sets": 3, "reps": null, "duration": null}]
"did squats today" → [{"exercise": "Barbell Back Squat", "weight": null, "sets": null, "reps": null, "duration": null}]
"db curls" → [{"exercise": "Dumbbell Bicep Curl", "weight": null, "sets": null, "reps": null, "duration": null}]

PR / max attempts:
"hit a 315 squat PR" → [{"exercise": "Barbell Back Squat", "weight": 315, "sets": 1, "reps": 1, "duration": null}]
"bench max 225" → [{"exercise": "Barbell Bench Press", "weight": 225, "sets": 1, "reps": 1, "duration": null}]
"1rm deadlift 405" → [{"exercise": "Conventional Deadlift", "weight": 405, "sets": 1, "reps": 1, "duration": null}]

Bodyweight:
"pullups 4x8" → [{"exercise": "Pull-ups", "weight": 0, "sets": 4, "reps": 8, "duration": null}]
"pushups" → [{"exercise": "Push-ups", "weight": 0, "sets": null, "reps": null, "duration": null}]
"dips 3x10" → [{"exercise": "Dips", "weight": 0, "sets": 3, "reps": 10, "duration": null}]

Timed:
"plank 3x30s" → [{"exercise": "Plank", "weight": 0, "sets": 3, "reps": null, "duration": 30}]
"farmer carry 50lbs 60s" → [{"exercise": "Farmer Carry", "weight": 50, "sets": 1, "reps": null, "duration": 60}]

Unit conversion:
"squat 60kg 5x5" → [{"exercise": "Barbell Back Squat", "weight": 135, "sets": 5, "reps": 5, "duration": null}]
"bench 100kg" → [{"exercise": "Barbell Bench Press", "weight": 220, "sets": null, "reps": null, "duration": null}]

Messy/conversational:
"hit 225 on bench today" → [{"exercise": "Barbell Bench Press", "weight": 225, "sets": null, "reps": null, "duration": null}]
"did bench today 135 for 3x10" → [{"exercise": "Barbell Bench Press", "weight": 135, "sets": 3, "reps": 10, "duration": null}]
"legs were toast after 315 squats" → [{"exercise": "Barbell Back Squat", "weight": 315, "sets": null, "reps": null, "duration": null}]

Multiple exercises:
"bench 135 3x10, squat 225 5x5" → [{"exercise": "Barbell Bench Press", "weight": 135, "sets": 3, "reps": 10, "duration": null}, {"exercise": "Barbell Back Squat", "weight": 225, "sets": 5, "reps": 5, "duration": null}]`

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