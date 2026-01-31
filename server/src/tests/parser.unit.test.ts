import { describe, it, expect } from 'vitest'
import { parseWorkoutText } from '../services/parser'
import { LLMClient } from '../services/llm'
import { ValidationError } from '../errors'

// Mock LLM that returns predefined responses
function createMockLLM(response: string): LLMClient {
  return {
    call: async () => response,
  }
}

describe('parseWorkoutText', () => {
  describe('standard formats', () => {
    it('parses bench press with weight and sets x reps', async () => {
      const mockLLM = createMockLLM(
        '[{"exercise": "Barbell Bench Press", "weight": 135, "sets": 3, "reps": 10, "duration": null}]'
      )
      const result = await parseWorkoutText('bench press 135 3x10', mockLLM)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        exercise: 'Barbell Bench Press',
        weight: 135,
        sets: 3,
        reps: 10,
        duration: null,
      })
    })

    it('parses dumbbell exercises', async () => {
      const mockLLM = createMockLLM(
        '[{"exercise": "Dumbbell Bench Press", "weight": 100, "sets": 2, "reps": 5, "duration": null}]'
      )
      const result = await parseWorkoutText('db bench 100 2x5', mockLLM)
      
      expect(result[0]).toMatchObject({
        exercise: 'Dumbbell Bench Press',
        weight: 100,
        sets: 2,
        reps: 5,
      })
    })
  })

  describe('bodyweight exercises', () => {
    it('parses with zero weight', async () => {
      const mockLLM = createMockLLM(
        '[{"exercise": "Push-ups", "weight": 0, "sets": 3, "reps": 20, "duration": null}]'
      )
      const result = await parseWorkoutText('pushups 3x20', mockLLM)
      
      expect(result[0]).toMatchObject({
        exercise: 'Push-ups',
        weight: 0,
        sets: 3,
        reps: 20,
      })
    })
  })

  describe('timed exercises', () => {
    it('parses plank with duration', async () => {
      const mockLLM = createMockLLM(
        '[{"exercise": "Plank", "weight": 0, "sets": 3, "reps": null, "duration": 30}]'
      )
      const result = await parseWorkoutText('plank 3x30s', mockLLM)
      
      expect(result[0]).toMatchObject({
        exercise: 'Plank',
        weight: 0,
        sets: 3,
        reps: null,
        duration: 30,
      })
    })
  })

  describe('multiple exercises', () => {
    it('parses multiple exercises', async () => {
      const mockLLM = createMockLLM(
        '[{"exercise": "Barbell Bench Press", "weight": 135, "sets": 3, "reps": 10, "duration": null}, {"exercise": "Barbell Back Squat", "weight": 225, "sets": 5, "reps": 5, "duration": null}]'
      )
      const result = await parseWorkoutText('bench 135 3x10\nsquat 225 5x5', mockLLM)
      
      expect(result).toHaveLength(2)
      expect(result[0].exercise).toBe('Barbell Bench Press')
      expect(result[1].exercise).toBe('Barbell Back Squat')
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty input', async () => {
      const mockLLM = createMockLLM('[]')
      const result = await parseWorkoutText('', mockLLM)
      
      expect(result).toEqual([])
    })

    it('returns empty array for whitespace-only input', async () => {
      const mockLLM = createMockLLM('[]')
      const result = await parseWorkoutText('   ', mockLLM)
      
      expect(result).toEqual([])
    })

    it('handles LLM returning empty array for unparseable input', async () => {
      const mockLLM = createMockLLM('[]')
      const result = await parseWorkoutText('asdfasdf', mockLLM)
      
      expect(result).toEqual([])
    })
  })

  describe('validation', () => {
    it('throws ValidationError for invalid JSON', async () => {
      const mockLLM = createMockLLM('not valid json')
      
      await expect(parseWorkoutText('bench 135 3x10', mockLLM)).rejects.toThrow(
        ValidationError
      )
    })

    it('throws for missing required fields', async () => {
      const mockLLM = createMockLLM('[{"exercise": "Bench"}]') // missing weight, sets, reps
      
      await expect(parseWorkoutText('bench 135 3x10', mockLLM)).rejects.toThrow()
    })

    it('throws for invalid field types', async () => {
      const mockLLM = createMockLLM(
        '[{"exercise": "Bench", "weight": "heavy", "sets": 3, "reps": 10, "duration": null}]'
      )
      
      await expect(parseWorkoutText('bench 135 3x10', mockLLM)).rejects.toThrow()
    })

    it('handles markdown code blocks in response', async () => {
      const mockLLM = createMockLLM(
        '```json\n[{"exercise": "Bench Press", "weight": 135, "sets": 3, "reps": 10, "duration": null}]\n```'
      )
      const result = await parseWorkoutText('bench 135 3x10', mockLLM)
      
      expect(result).toHaveLength(1)
      expect(result[0].exercise).toBe('Bench Press')
    })
  })
})