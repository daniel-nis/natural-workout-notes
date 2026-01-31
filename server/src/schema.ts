export const typeDefs = `#graphql
  type ParsedExercise {
    exercise: String!
    weight: Int
    sets: Int
    reps: Int
    duration: Int
  }

  type Mutation {
    parseWorkout(input: String!): [ParsedExercise!]!
  }

  type Query {
    _empty: String
  }
`