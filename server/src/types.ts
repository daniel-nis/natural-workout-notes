import { z } from 'zod'

// Zod schema - single source of truth for validation
export const ParsedExerciseSchema = z.object({
  exercise: z.string(),
  weight: z.number().int().min(0),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1).nullable(),
  duration: z.number().int().min(1).nullable(),
})

export const ParsedExerciseArraySchema = z.array(ParsedExerciseSchema)

// TypeScript type derived from Zod schema
export type ParsedExercise = z.infer<typeof ParsedExerciseSchema>

// Validation helper
export function validateParsedExercises(data: unknown): ParsedExercise[] {
  return ParsedExerciseArraySchema.parse(data)
}