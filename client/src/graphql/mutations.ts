import { gql } from '@apollo/client'

export const PARSE_WORKOUT = gql`
  mutation ParseWorkout($input: String!) {
    parseWorkout(input: $input) {
      exercise
      weight
      sets
      reps
      duration
    }
  }
`