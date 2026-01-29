import { ParsedExercise } from '../types';
import { callLLM } from './llm';

const SYSTEM_PROMPT = `You are a workout parser. Convert raw workout notes into structured JSON.

INPUT: Informal workout text (e.g., "db bench 100 2x5")

OUTPUT: JSON array only. No markdown, no explanation. Just valid JSON.

Each exercise should have:
- exercise: Full canonical name (e.g., "Dumbbell Bench Press" not "db bench")
- weight: Number only, assume lbs unless specified
- sets: Number
- reps: Number

EXAMPLES:

Input: "db bench 100 2x5"
Output: [{"exercise": "Dumbbell Bench Press", "weight": 100, "sets": 2, "reps": 5}]

Input: "squat 225 3x8
lat pulldown 120 4x10"
Output: [{"exercise": "Barbell Back Squat", "weight": 225, "sets": 3, "reps": 8}, {"exercise": "Lat Pulldown", "weight": 120, "sets": 4, "reps": 10}]

Input: "pushups 3x20"
Output: [{"exercise": "Push-ups", "weight": 0, "sets": 3, "reps": 20}]

Return ONLY the JSON array. No other text.`

export async function parseWorkoutText(input: string): Promise<ParsedExercise[]> {
    const response = await callLLM(SYSTEM_PROMPT, input);
    return JSON.parse(response);
};