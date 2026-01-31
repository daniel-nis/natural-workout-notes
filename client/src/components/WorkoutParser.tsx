import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { PARSE_WORKOUT } from "../graphql/mutations";

interface ParsedExercise {
  exercise: string;
  weight?: string;
  sets?: string;
  reps?: string;
  duration?: string;
};

interface ParseWorkoutData {
  parseWorkout: ParsedExercise[];
};

export function WorkoutParser() {
  const [input, setInput] = useState<string>("");
  const [parseWorkout, { loading, error, data }] =
    useMutation<ParseWorkoutData>(PARSE_WORKOUT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    parseWorkout({ variables: { input } });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter workout"
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Parsing..." : "Submit"}
        </button>
      </form>

      {error && <p>Error: {error.message}</p>}

      {data?.parseWorkout && (
        <div>
          <h3>Parsed Workout:</h3>
          {data.parseWorkout.map((exercise, index) => (
            <div key={index} style={{ marginBottom: "1em" }}>
              <p>
                <strong>Exercise:</strong> {exercise.exercise}
              </p>
              {exercise.weight && (
                <p>
                  <strong>Weight:</strong> {exercise.weight}
                </p>
              )}
              {exercise.sets && (
                <p>
                  <strong>Sets:</strong> {exercise.sets}
                </p>
              )}
              {exercise.reps && (
                <p>
                  <strong>Reps:</strong> {exercise.reps}
                </p>
              )}
              {exercise.duration && (
                <p>
                  <strong>Duration:</strong> {exercise.duration}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
