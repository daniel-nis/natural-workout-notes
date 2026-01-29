import { parseWorkoutText } from './services/parser'

export const resolvers = {
    Mutation: {
        parseWorkout: async (_, { input }) => {
            return parseWorkoutText(input);
        }
    }
};