export const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type ParsedExercise {
    exercise: String
    weight: Int
    sets: Int
    reps: Int
  }

  type Mutation {
    parseWorkout(input: String!): [ParsedExercise]
  }

  type Query {
    _empty: String
  }
`;