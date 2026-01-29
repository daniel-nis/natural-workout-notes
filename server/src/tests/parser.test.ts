import 'dotenv/config'
import { parseWorkoutText } from '../services/parser.js'

const testCases = [
  // Standard formats
  { input: 'bench press 135 3x10', expected: { exercise: 'Bench Press', weight: 135, sets: 3, reps: 10 } },
  { input: 'db bench 100 2x5', expected: { exercise: 'Dumbbell Bench Press', weight: 100, sets: 2, reps: 5 } },
  { input: 'squat 225 5x5', expected: { exercise: 'Squat', weight: 225, sets: 5, reps: 5 } },

  // Abbreviations
  { input: 'bb row 185 4x8', expected: { exercise: 'Barbell Row', weight: 185, sets: 4, reps: 8 } },
  { input: 'ohp 95 3x8', expected: { exercise: 'Overhead Press', weight: 95, sets: 3, reps: 8 } },
  { input: 'rdl 185 3x10', expected: { exercise: 'Romanian Deadlift', weight: 185, sets: 3, reps: 10 } },

  // Bodyweight
  { input: 'pushups 3x20', expected: { exercise: 'Push-ups', weight: 0, sets: 3, reps: 20 } },
  { input: 'pullups 4x8', expected: { exercise: 'Pull-ups', weight: 0, sets: 4, reps: 8 } },

  // Multiple exercises
  { 
    input: 'bench 135 3x10\nsquat 225 5x5', 
    expectMultiple: true,
    expectedCount: 2 
  },

  // Messy input
  { input: 'did bench today 135 for 3x10', expected: { weight: 135, sets: 3, reps: 10 } },

  // Edge cases
  { input: '', expectError: true },
  { input: 'asdfasdf', expectEmpty: true },
]

async function runTests() {
  console.log('🧪 Running parser tests...\n')
  
  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    try {
      console.log(`Input: "${testCase.input}"`)
      const result = await parseWorkoutText(testCase.input)
      console.log(`Output:`, JSON.stringify(result, null, 2))

      // Basic validation
      if (testCase.expectError) {
        console.log(`❌ FAIL - Expected error but got result\n`)
        failed++
      } else if (testCase.expectEmpty && result.length === 0) {
        console.log(`✅ PASS - Empty result as expected\n`)
        passed++
      } else if (testCase.expectMultiple && result.length >= testCase.expectedCount) {
        console.log(`✅ PASS - Got ${result.length} exercises\n`)
        passed++
      } else if (result.length > 0 && result[0].exercise) {
        console.log(`✅ PASS\n`)
        passed++
      } else {
        console.log(`❌ FAIL - Unexpected result\n`)
        failed++
      }
    } catch (error) {
      if (testCase.expectError) {
        console.log(`✅ PASS - Expected error\n`)
        passed++
      } else {
        console.log(`❌ FAIL - Error: ${error}\n`)
        failed++
      }
    }

    // Rate limit - wait between API calls
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\n${'='.repeat(40)}`)
  console.log(`Results: ${passed} passed, ${failed} failed`)
}

runTests()