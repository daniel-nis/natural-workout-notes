import { describe, it, expect } from 'vitest'
import { parseWorkoutText } from '../services/parser.js'

// These tests call the real LLM API
// Run separately: npm run test:integration
// Slower, may have rate limits, but tests actual behavior

describe('parseWorkoutText integration', () => {

  // ── 1. Standard formats ──────────────────────────────────────────────

  describe('standard formats', () => {
    it('parses bench press with full info', async () => {
      const result = await parseWorkoutText('bench press 135 3x10')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(135)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBe(10)
      expect(result[0].exercise.toLowerCase()).toContain('bench')
    })

    it('parses squat', async () => {
      const result = await parseWorkoutText('squat 225 5x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 225, sets: 5, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toContain('squat')
    })

    it('parses deadlift', async () => {
      const result = await parseWorkoutText('deadlift 315 1x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 315, sets: 1, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toContain('deadlift')
    })

    it('parses dumbbell bench', async () => {
      const result = await parseWorkoutText('db bench 100 2x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 100, sets: 2, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toContain('dumbbell')
    })

    it('parses dumbbell curls', async () => {
      const result = await parseWorkoutText('db curls 35 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 35, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toContain('dumbbell')
    })

    it('parses overhead press', async () => {
      const result = await parseWorkoutText('overhead press 95 4x6')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 95, sets: 4, reps: 6 })
      expect(result[0].exercise.toLowerCase()).toMatch(/overhead|press/)
    })
  })

  // ── 2. Exercise variations / compound variants ────────────────────────

  describe('exercise variations', () => {
    it('parses incline bench', async () => {
      const result = await parseWorkoutText('incline bench 155 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 155, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toMatch(/incline.*bench|bench.*incline/)
    })

    it('parses decline bench', async () => {
      const result = await parseWorkoutText('decline bench 185 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 185, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/decline.*bench|bench.*decline/)
    })

    it('parses close grip bench', async () => {
      const result = await parseWorkoutText('close grip bench 135 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 135, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/close.*grip|bench/)
    })

    it('parses sumo deadlift', async () => {
      const result = await parseWorkoutText('sumo deadlift 365 3x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 365, sets: 3, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toContain('sumo')
    })

    it('parses trap bar deadlift', async () => {
      const result = await parseWorkoutText('trap bar deadlift 275 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 275, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toMatch(/trap.*bar|hex/)
    })

    it('parses front squat', async () => {
      const result = await parseWorkoutText('front squat 225 3x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 225, sets: 3, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toContain('front')
    })

    it('parses paused squat', async () => {
      const result = await parseWorkoutText('paused squat 185 3x3')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 185, sets: 3, reps: 3 })
      expect(result[0].exercise.toLowerCase()).toMatch(/pause|squat/)
    })

    it('parses deficit deadlift', async () => {
      const result = await parseWorkoutText('deficit deadlift 315 3x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 315, sets: 3, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toMatch(/deficit|deadlift/)
    })

    it('parses wide grip pulldown', async () => {
      const result = await parseWorkoutText('wide grip pulldown 120 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 120, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/pulldown|pull/)
    })
  })

  // ── 3. Isolation exercises ────────────────────────────────────────────

  describe('isolation exercises', () => {
    it('parses lateral raise', async () => {
      const result = await parseWorkoutText('lateral raise 20 4x15')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 20, sets: 4, reps: 15 })
      expect(result[0].exercise.toLowerCase()).toMatch(/lateral|raise/)
    })

    it('parses rear delt fly', async () => {
      const result = await parseWorkoutText('rear delt fly 15 3x15')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 15, sets: 3, reps: 15 })
      expect(result[0].exercise.toLowerCase()).toMatch(/rear.*delt|fly|flye/)
    })

    it('parses bicep curl', async () => {
      const result = await parseWorkoutText('bicep curl 30 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 30, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/bicep|curl/)
    })

    it('parses tricep extension', async () => {
      const result = await parseWorkoutText('tricep extension 40 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 40, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toMatch(/tricep|extension/)
    })

    it('parses leg extension', async () => {
      const result = await parseWorkoutText('leg extension 100 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 100, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toMatch(/leg.*extension/)
    })

    it('parses leg curl', async () => {
      const result = await parseWorkoutText('leg curl 80 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 80, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toMatch(/leg.*curl|hamstring/)
    })

    it('parses calf raise', async () => {
      const result = await parseWorkoutText('calf raise 200 4x15')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 200, sets: 4, reps: 15 })
      expect(result[0].exercise.toLowerCase()).toMatch(/calf|raise/)
    })

    it('parses preacher curl', async () => {
      const result = await parseWorkoutText('preacher curl 60 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 60, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/preacher|curl/)
    })

    it('parses skull crushers', async () => {
      const result = await parseWorkoutText('skull crushers 65 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 65, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/skull.*crush|lying.*tricep|tricep/)
    })

    it('parses hip thrust', async () => {
      const result = await parseWorkoutText('hip thrust 225 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 225, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toMatch(/hip.*thrust/)
    })
  })

  // ── 4. Machine exercises ──────────────────────────────────────────────

  describe('machine exercises', () => {
    it('parses leg press', async () => {
      const result = await parseWorkoutText('leg press 400 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 400, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/leg.*press/)
    })

    it('parses hack squat', async () => {
      const result = await parseWorkoutText('hack squat 270 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 270, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toMatch(/hack.*squat/)
    })

    it('parses smith machine bench', async () => {
      const result = await parseWorkoutText('smith machine bench 135 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 135, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/smith|bench/)
    })

    it('parses cable row', async () => {
      const result = await parseWorkoutText('cable row 120 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 120, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/cable.*row|row/)
    })

    it('parses tricep pushdown', async () => {
      const result = await parseWorkoutText('tricep pushdown 60 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 60, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toMatch(/tricep|pushdown/)
    })

    it('parses lat pulldown', async () => {
      const result = await parseWorkoutText('lat pulldown 130 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 130, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/lat.*pulldown|pulldown/)
    })
  })

  // ── 5. Abbreviations ─────────────────────────────────────────────────

  describe('abbreviations', () => {
    it('expands bb bench', async () => {
      const result = await parseWorkoutText('bb bench 225 3x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 225, sets: 3, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toContain('barbell')
    })

    it('expands db row', async () => {
      const result = await parseWorkoutText('db row 60 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 60, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toContain('dumbbell')
    })

    it('expands ohp', async () => {
      const result = await parseWorkoutText('ohp 135 3x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 135, sets: 3, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toMatch(/overhead|press|shoulder/)
    })

    it('expands rdl', async () => {
      const result = await parseWorkoutText('rdl 225 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 225, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toMatch(/romanian|deadlift/)
    })

    it('expands dl', async () => {
      const result = await parseWorkoutText('dl 405 1x3')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 405, sets: 1, reps: 3 })
      expect(result[0].exercise.toLowerCase()).toContain('deadlift')
    })

    it('expands inc db press', async () => {
      const result = await parseWorkoutText('inc db press 70 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 70, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toMatch(/incline/)
      expect(result[0].exercise.toLowerCase()).toMatch(/dumbbell/)
    })
  })

  // ── 6. Bodyweight exercises ───────────────────────────────────────────

  describe('bodyweight exercises', () => {
    it('parses pushups with sets/reps', async () => {
      const result = await parseWorkoutText('pushups 3x20')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 0, sets: 3, reps: 20 })
    })

    it('parses pullups with sets/reps', async () => {
      const result = await parseWorkoutText('pullups 4x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 0, sets: 4, reps: 8 })
    })

    it('parses dips with sets/reps', async () => {
      const result = await parseWorkoutText('dips 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 0, sets: 3, reps: 10 })
    })

    it('parses chin ups', async () => {
      const result = await parseWorkoutText('chin ups 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 0, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toMatch(/chin/)
    })

    it('parses inverted rows', async () => {
      const result = await parseWorkoutText('inverted rows 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 0, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toMatch(/inverted|row/)
    })

    it('parses pushups without sets/reps', async () => {
      const result = await parseWorkoutText('pushups')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(0)
      expect(result[0].sets).toBeNull()
      expect(result[0].reps).toBeNull()
    })

    it('parses bodyweight squats', async () => {
      const result = await parseWorkoutText('bodyweight squats 3x20')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 0, sets: 3, reps: 20 })
      expect(result[0].exercise.toLowerCase()).toContain('squat')
    })
  })

  // ── 7. Weighted bodyweight ────────────────────────────────────────────

  describe('weighted bodyweight exercises', () => {
    it('parses weighted pullups', async () => {
      const result = await parseWorkoutText('weighted pullups 45 3x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 45, sets: 3, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toMatch(/pull.*up/)
    })

    it('parses dips with plus notation', async () => {
      const result = await parseWorkoutText('dips +25 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 25, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toContain('dip')
    })

    it('parses weighted dips', async () => {
      const result = await parseWorkoutText('weighted dips 35 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 35, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toContain('dip')
    })
  })

  // ── 8. Partial info / nullable fields ─────────────────────────────────

  describe('partial info - nullable fields', () => {
    it('parses weight only without sets/reps', async () => {
      const result = await parseWorkoutText('front squat 315')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(315)
      expect(result[0].exercise.toLowerCase()).toContain('squat')
      expect(result[0].sets).toBeNull()
      expect(result[0].reps).toBeNull()
    })

    it('infers sets=1 from "for X" pattern', async () => {
      const result = await parseWorkoutText('bench 135 for 10')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(135)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(10)
    })

    it('infers sets from "X sets" pattern', async () => {
      const result = await parseWorkoutText('3 sets of bench 135')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(135)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBeNull()
    })

    it('parses exercise only', async () => {
      const result = await parseWorkoutText('did squats today')

      expect(result).toHaveLength(1)
      expect(result[0].exercise.toLowerCase()).toContain('squat')
      expect(result[0].weight).toBeNull()
      expect(result[0].sets).toBeNull()
      expect(result[0].reps).toBeNull()
    })

    it('parses exercise name only without context', async () => {
      const result = await parseWorkoutText('db curls')

      expect(result).toHaveLength(1)
      expect(result[0].exercise.toLowerCase()).toMatch(/dumbbell|curl/)
      expect(result[0].weight).toBeNull()
      expect(result[0].sets).toBeNull()
      expect(result[0].reps).toBeNull()
    })

    it('infers sets=1 from "X reps of" pattern', async () => {
      const result = await parseWorkoutText('10 reps of bench 135')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(135)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(10)
    })
  })

  // ── 9. PR / max inference ─────────────────────────────────────────────

  describe('PR / max inference', () => {
    it('infers 1x1 for PR', async () => {
      const result = await parseWorkoutText('hit a 315 squat PR')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(315)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(1)
    })

    it('infers 1x1 for max', async () => {
      const result = await parseWorkoutText('bench max 225')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(225)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(1)
    })

    it('infers 1x1 for 1rm', async () => {
      const result = await parseWorkoutText('1rm deadlift 405')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(405)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(1)
    })

    it('infers 1x1 for new PR', async () => {
      const result = await parseWorkoutText('new PR squat 335')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(335)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(1)
    })

    it('infers 1x1 for one rep max', async () => {
      const result = await parseWorkoutText('one rep max bench 275')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(275)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(1)
    })
  })

  // ── 10. Timed exercises ───────────────────────────────────────────────

  describe('timed exercises', () => {
    it('parses plank with duration', async () => {
      const result = await parseWorkoutText('plank 3x30s')

      expect(result).toHaveLength(1)
      expect(result[0].sets).toBe(3)
      expect(result[0].duration).toBe(30)
      expect(result[0].reps).toBeNull()
    })

    it('parses farmer carry with weight and duration', async () => {
      const result = await parseWorkoutText('farmer carry 50lbs 60s')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(50)
      expect(result[0].duration).toBe(60)
    })

    it('parses dead hang', async () => {
      const result = await parseWorkoutText('dead hang 3x45s')

      expect(result).toHaveLength(1)
      expect(result[0].sets).toBe(3)
      expect(result[0].duration).toBe(45)
      expect(result[0].weight).toBe(0)
      expect(result[0].reps).toBeNull()
    })

    it('parses wall sit', async () => {
      const result = await parseWorkoutText('wall sit 2x60s')

      expect(result).toHaveLength(1)
      expect(result[0].sets).toBe(2)
      expect(result[0].duration).toBe(60)
      expect(result[0].reps).toBeNull()
    })
  })

  // ── 11. Unit conversion (kg → lbs) ───────────────────────────────────

  describe('unit conversion', () => {
    it('converts kg to lbs with sets/reps', async () => {
      const result = await parseWorkoutText('squat 60kg 5x5')

      expect(result).toHaveLength(1)
      // 60kg * 2.2 = 132, rounded to nearest 5 = 130 or 135
      expect(result[0].weight).toBeGreaterThanOrEqual(130)
      expect(result[0].weight).toBeLessThanOrEqual(135)
      expect(result[0].sets).toBe(5)
      expect(result[0].reps).toBe(5)
    })

    it('converts kg to lbs without sets/reps', async () => {
      const result = await parseWorkoutText('bench 100kg')

      expect(result).toHaveLength(1)
      // 100kg * 2.2 = 220
      expect(result[0].weight).toBeGreaterThanOrEqual(215)
      expect(result[0].weight).toBeLessThanOrEqual(225)
    })

    it('converts heavy kg to lbs', async () => {
      const result = await parseWorkoutText('deadlift 180kg 1x1')

      expect(result).toHaveLength(1)
      // 180kg * 2.2 = 396, rounded to nearest 5 = 395 or 400
      expect(result[0].weight).toBeGreaterThanOrEqual(395)
      expect(result[0].weight).toBeLessThanOrEqual(400)
      expect(result[0].sets).toBe(1)
      expect(result[0].reps).toBe(1)
    })

    it('converts dumbbell kg to lbs', async () => {
      const result = await parseWorkoutText('db press 30kg 3x8')

      expect(result).toHaveLength(1)
      // 30kg * 2.2 = 66, rounded to nearest 5 = 65 or 70
      expect(result[0].weight).toBeGreaterThanOrEqual(65)
      expect(result[0].weight).toBeLessThanOrEqual(70)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBe(8)
    })
  })

  // ── 12. Multiple exercises ────────────────────────────────────────────

  describe('multiple exercises', () => {
    it('parses comma-separated exercises', async () => {
      const result = await parseWorkoutText('bench 135 3x10, squat 225 5x5')

      expect(result.length).toBeGreaterThanOrEqual(2)

      const bench = result.find(e => e.exercise.toLowerCase().includes('bench'))
      const squat = result.find(e => e.exercise.toLowerCase().includes('squat'))

      expect(bench).toBeDefined()
      expect(bench!.weight).toBe(135)
      expect(squat).toBeDefined()
      expect(squat!.weight).toBe(225)
    })

    it('parses newline-separated exercises', async () => {
      const result = await parseWorkoutText('bench 135 3x10\nsquat 225 5x5')

      expect(result.length).toBeGreaterThanOrEqual(2)

      const bench = result.find(e => e.exercise.toLowerCase().includes('bench'))
      const squat = result.find(e => e.exercise.toLowerCase().includes('squat'))

      expect(bench).toBeDefined()
      expect(squat).toBeDefined()
    })

    it('parses full workout log with 5+ exercises', async () => {
      const input = [
        'bench 135 3x10',
        'squat 225 5x5',
        'rdl 185 3x10',
        'ohp 95 3x8',
        'pullups 4x8',
        'face pulls 50 3x15',
      ].join('\n')

      const result = await parseWorkoutText(input)

      expect(result.length).toBeGreaterThanOrEqual(5)

      // Verify at least some exercises parsed correctly
      const bench = result.find(e => e.exercise.toLowerCase().includes('bench'))
      expect(bench).toBeDefined()
      expect(bench!.weight).toBe(135)

      const squat = result.find(e => e.exercise.toLowerCase().includes('squat'))
      expect(squat).toBeDefined()
      expect(squat!.weight).toBe(225)
    })

    it('parses mixed format exercises', async () => {
      const input = 'bench 135 3x10, pullups 4x8, plank 3x30s'

      const result = await parseWorkoutText(input)

      expect(result.length).toBeGreaterThanOrEqual(3)

      const bench = result.find(e => e.exercise.toLowerCase().includes('bench'))
      expect(bench).toBeDefined()
      expect(bench!.weight).toBe(135)

      const pullups = result.find(e => e.exercise.toLowerCase().match(/pull.*up/))
      expect(pullups).toBeDefined()
      expect(pullups!.weight).toBe(0)

      const plank = result.find(e => e.exercise.toLowerCase().includes('plank'))
      expect(plank).toBeDefined()
      expect(plank!.duration).toBe(30)
    })
  })

  // ── 13. Messy / conversational input ──────────────────────────────────

  describe('messy/conversational input', () => {
    it('extracts data from conversational text', async () => {
      const result = await parseWorkoutText('did bench today 135 for 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 135, sets: 3, reps: 10 })
    })

    it('handles "hit X on exercise" pattern', async () => {
      const result = await parseWorkoutText('hit 225 on bench today')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(225)
      expect(result[0].exercise.toLowerCase()).toContain('bench')
    })

    it('handles casual leg day notes', async () => {
      const result = await parseWorkoutText('legs were toast after 315 squats')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(315)
      expect(result[0].exercise.toLowerCase()).toContain('squat')
    })

    it('handles "plates" slang for bench', async () => {
      const result = await parseWorkoutText('finally got 2 plates on bench for 3x5')

      expect(result).toHaveLength(1)
      expect(result[0].exercise.toLowerCase()).toContain('bench')
      // 2 plates = 225 lbs
      expect(result[0].weight).toBe(225)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBe(5)
    })

    it('handles "worked up to" pattern', async () => {
      const result = await parseWorkoutText('worked up to 275 on squat')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(275)
      expect(result[0].exercise.toLowerCase()).toContain('squat')
    })

    it('handles casual set mention', async () => {
      const result = await parseWorkoutText('just did some light curls 25lbs 3 sets')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(25)
      expect(result[0].sets).toBe(3)
      expect(result[0].exercise.toLowerCase()).toContain('curl')
    })

    it('handles labeled workout with colon separator', async () => {
      const result = await parseWorkoutText('back day: rows 135 4x8, pulldowns 100 3x10')

      expect(result.length).toBeGreaterThanOrEqual(2)

      const rows = result.find(e => e.exercise.toLowerCase().includes('row'))
      expect(rows).toBeDefined()
      expect(rows!.weight).toBe(135)
      expect(rows!.sets).toBe(4)

      const pulldowns = result.find(e => e.exercise.toLowerCase().includes('pulldown'))
      expect(pulldowns).toBeDefined()
      expect(pulldowns!.weight).toBe(100)
    })
  })

  // ── 14. Niche exercises ───────────────────────────────────────────────

  describe('niche exercises', () => {
    it('handles hamstring curl', async () => {
      const result = await parseWorkoutText('hammy curl 130 3x8')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 130, sets: 3, reps: 8 })
      expect(result[0].exercise.toLowerCase()).toMatch(/hamstring|curl/)
    })

    it('handles face pulls', async () => {
      const result = await parseWorkoutText('face pulls 50 4x15')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 50, sets: 4, reps: 15 })
      expect(result[0].exercise.toLowerCase()).toMatch(/face.*pull/)
    })

    it('handles cable flyes', async () => {
      const result = await parseWorkoutText('cable flyes 30 3x12')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 30, sets: 3, reps: 12 })
      expect(result[0].exercise.toLowerCase()).toMatch(/cable|fly|flye/)
    })

    it('handles landmine press', async () => {
      const result = await parseWorkoutText('landmine press 90 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 90, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toContain('landmine')
    })

    it('handles good mornings', async () => {
      const result = await parseWorkoutText('good mornings 135 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 135, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/good.*morning/)
    })

    it('handles rack pulls', async () => {
      const result = await parseWorkoutText('rack pulls 315 3x5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 315, sets: 3, reps: 5 })
      expect(result[0].exercise.toLowerCase()).toMatch(/rack.*pull/)
    })

    it('handles t-bar row', async () => {
      const result = await parseWorkoutText('t-bar row 90 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 90, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/t.?bar|row/)
    })

    it('handles reverse fly', async () => {
      const result = await parseWorkoutText('reverse fly 20 3x15')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 20, sets: 3, reps: 15 })
      expect(result[0].exercise.toLowerCase()).toMatch(/reverse|fly|rear/)
    })

    it('handles shrugs', async () => {
      const result = await parseWorkoutText('shrugs 225 3x15')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 225, sets: 3, reps: 15 })
      expect(result[0].exercise.toLowerCase()).toMatch(/shrug/)
    })

    it('handles ab wheel', async () => {
      const result = await parseWorkoutText('ab wheel 3x10')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 0, sets: 3, reps: 10 })
      expect(result[0].exercise.toLowerCase()).toMatch(/ab.*wheel|ab.*rollout/)
    })
  })

  // ── 15. Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('returns empty array for empty string', async () => {
      const result = await parseWorkoutText('')
      expect(result).toEqual([])
    })

    it('returns empty array for gibberish', async () => {
      const result = await parseWorkoutText('asdfasdf jkl;')
      expect(result).toEqual([])
    })

    it('returns empty array for numbers only', async () => {
      const result = await parseWorkoutText('135 3x10')
      expect(result).toEqual([])
    })

    it('returns empty array for just a number', async () => {
      const result = await parseWorkoutText('225')
      expect(result).toEqual([])
    })

    it('returns empty array for non-workout text', async () => {
      const result = await parseWorkoutText('went to the grocery store')
      expect(result).toEqual([])
    })

    it('extracts workout from mixed text', async () => {
      const result = await parseWorkoutText('had a great day, bench 225 3x5')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(225)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBe(5)
    })
  })

  // ── 16. Format variations ─────────────────────────────────────────────

  describe('format variations', () => {
    it('parses "X sets Y reps" format', async () => {
      const result = await parseWorkoutText('bench 135 3 sets 10 reps')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 135, sets: 3, reps: 10 })
    })

    it('parses "for X sets of Y" format', async () => {
      const result = await parseWorkoutText('squat 225 for 5 sets of 5')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ weight: 225, sets: 5, reps: 5 })
    })

    it('parses colon-separated format', async () => {
      const result = await parseWorkoutText('bench: 135, 3x10')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(135)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBe(10)
    })

    it('parses dash-separated format', async () => {
      const result = await parseWorkoutText('bench - 135 - 3x10')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(135)
      expect(result[0].sets).toBe(3)
      expect(result[0].reps).toBe(10)
    })

    it('parses inverted notation (10x3)', async () => {
      const result = await parseWorkoutText('10x3 bench 225')

      expect(result).toHaveLength(1)
      expect(result[0].weight).toBe(225)
      // LLM should interpret as sets x reps regardless of order
      expect(result[0].sets! * result[0].reps!).toBe(30)
    })
  })

  // ── 17. Consistency tests ─────────────────────────────────────────────

  describe('consistency - same input produces same output', () => {
    async function assertConsistent(
      input: string,
      validateResult: (result: Awaited<ReturnType<typeof parseWorkoutText>>) => void
    ) {
      // Run sequentially to avoid hitting API concurrency limits
      const results = [
        await parseWorkoutText(input),
        await parseWorkoutText(input),
        await parseWorkoutText(input),
      ]

      // Each individual result should be valid
      for (const result of results) {
        validateResult(result)
      }

      // All results should have the same length
      expect(results[0].length).toBe(results[1].length)
      expect(results[1].length).toBe(results[2].length)

      // Numeric fields should match across all runs
      for (let i = 0; i < results[0].length; i++) {
        const weights = [results[0][i].weight, results[1][i].weight, results[2][i].weight]
        const sets = [results[0][i].sets, results[1][i].sets, results[2][i].sets]
        const reps = [results[0][i].reps, results[1][i].reps, results[2][i].reps]
        const durations = [results[0][i].duration, results[1][i].duration, results[2][i].duration]

        expect(new Set(weights).size).toBe(1)
        expect(new Set(sets).size).toBe(1)
        expect(new Set(reps).size).toBe(1)
        expect(new Set(durations).size).toBe(1)
      }
    }

    it('standard input is consistent', async () => {
      await assertConsistent('bench 225 3x5', (result) => {
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ weight: 225, sets: 3, reps: 5 })
      })
    })

    it('abbreviation input is consistent', async () => {
      await assertConsistent('rdl 185 3x10', (result) => {
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ weight: 185, sets: 3, reps: 10 })
      })
    })

    it('bodyweight input is consistent', async () => {
      await assertConsistent('pushups 3x20', (result) => {
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ weight: 0, sets: 3, reps: 20 })
      })
    })

    it('timed input is consistent', async () => {
      await assertConsistent('plank 3x30s', (result) => {
        expect(result).toHaveLength(1)
        expect(result[0].sets).toBe(3)
        expect(result[0].duration).toBe(30)
      })
    })

    it('PR inference input is consistent', async () => {
      await assertConsistent('hit a 315 squat PR', (result) => {
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ weight: 315, sets: 1, reps: 1 })
      })
    })

    it('kg conversion input is consistent', async () => {
      // Run sequentially to avoid hitting API concurrency limits
      const results = [
        await parseWorkoutText('squat 60kg 5x5'),
        await parseWorkoutText('squat 60kg 5x5'),
        await parseWorkoutText('squat 60kg 5x5'),
      ]

      for (const result of results) {
        expect(result).toHaveLength(1)
        expect(result[0].weight).toBeGreaterThanOrEqual(130)
        expect(result[0].weight).toBeLessThanOrEqual(135)
        expect(result[0].sets).toBe(5)
        expect(result[0].reps).toBe(5)
      }

      // All 3 runs should produce the same weight
      expect(results[0][0].weight).toBe(results[1][0].weight)
      expect(results[1][0].weight).toBe(results[2][0].weight)
    })
  })
})
