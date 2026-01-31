import { describe, it, expect } from 'vitest'
import { parseWorkoutText } from '../services/parser.js'

// These tests call the real LLM API
// Run separately: npm run test:integration
// Slower, may have rate limits, but tests actual behavior

describe('parseWorkoutText integration', () => {
  describe('standard formats', () => {
    it('parses bench press', async () => {
      const result = await parseWorkoutText('bench press 135 3x10')
      
      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(135)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBe(10)
      // Exercise name may vary slightly, just check it exists
      expect(result[0].exercise).toBeTruthy()
    })

    it('parses dumbbell bench', async () => {
      const result = await parseWorkoutText('db bench 100 2x5')
      
      expect(result[0]).toMatchObject({
        weight: 100,
        sets: 2,
        reps: 5,
      })
      expect(result[0].exercise.toLowerCase()).toContain('dumbbell')
    })

    it('parses squat', async () => {
      const result = await parseWorkoutText('squat 225 5x5')
      
      expect(result[0]).toMatchObject({
        weight: 225,
        sets: 5,
        reps: 5,
      })
    })
  })

  describe('abbreviations', () => {
    it('expands bb row', async () => {
      const result = await parseWorkoutText('bb row 185 4x8')
      
      expect(result[0].weight).toBe(185)
      expect(result[0].exercise.toLowerCase()).toContain('barbell')
    })

    it('expands ohp', async () => {
      const result = await parseWorkoutText('ohp 95 3x8')
      
      expect(result[0].weight).toBe(95)
      expect(result[0].exercise.toLowerCase()).toMatch(/overhead|press|shoulder/)
    })

    it('expands rdl', async () => {
      const result = await parseWorkoutText('rdl 185 3x10')
      
      expect(result[0].weight).toBe(185)
      expect(result[0].exercise.toLowerCase()).toMatch(/romanian|deadlift/)
    })
  })

  describe('bodyweight exercises', () => {
    it('parses pushups with zero weight', async () => {
      const result = await parseWorkoutText('pushups 3x20')
      
      expect(result[0]).toMatchObject({
        weight: 0,
        sets: 3,
        reps: 20,
      })
    })

    it('parses pullups with zero weight', async () => {
      const result = await parseWorkoutText('pullups 4x8')
      
      expect(result[0]).toMatchObject({
        weight: 0,
        sets: 4,
        reps: 8,
      })
    })
  })

  describe('timed exercises', () => {
    it('parses plank with duration', async () => {
      const result = await parseWorkoutText('plank 3x30s')
      
      expect(result[0].sets).toBe(3)
      expect(result[0].duration).toBe(30)
      expect(result[0].reps).toBeNull()
    })
  })

  describe('unit conversion', () => {
    it('converts kg to lbs', async () => {
      const result = await parseWorkoutText('squat 60kg 5x5')
      
      // 60kg * 2.2 = 132, rounded to nearest 5 = 130 or 135
      expect(result[0].weight).toBeGreaterThanOrEqual(130)
      expect(result[0].weight).toBeLessThanOrEqual(135)
    })
  })

  describe('multiple exercises', () => {
    it('parses multiple exercises', async () => {
      const result = await parseWorkoutText('bench 135 3x10\nsquat 225 5x5')
      
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('messy input', () => {
    it('extracts data from conversational text', async () => {
      const result = await parseWorkoutText('did bench today 135 for 3x10')
      
      expect(result[0]).toMatchObject({
        weight: 135,
        sets: 3,
        reps: 10,
      })
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty string', async () => {
      const result = await parseWorkoutText('')
      
      expect(result).toEqual([])
    })

    it('returns empty array for gibberish', async () => {
      const result = await parseWorkoutText('asdfasdf')
      
      expect(result).toEqual([])
    })
  })
})