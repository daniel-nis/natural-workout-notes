export interface WorkoutLine {
    id: string;
    rawInput: string;
    status: 'editing' | 'processing' | 'parsed' | 'error';
    content: ParsedExercise[] | null;
    error: string | null;
}

export interface ParsedExercise {
    exercise: string;
    weight?: number;
    sets?: number;
    reps?: number;
    duration?: number;
};

export interface Note {
    id: string;
    title: string;
    lines: WorkoutLine[];
    createdAt: string;
    updatedAt: string;
};