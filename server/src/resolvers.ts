import { parseWorkoutText } from './services/parser'
import { ParsedExercise } from './types'

interface ParseWorkoutArgs {
  input: string
}

export const resolvers = {
  Mutation: {
    parseWorkout: async (
      _parent: unknown,
      args: ParseWorkoutArgs
    ): Promise<ParsedExercise[]> => {
      return parseWorkoutText(args.input)
    },
  },
}