import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { PARSE_WORKOUT } from '../../graphql/mutations';
import type { WorkoutLine as WorkoutLineType, ParsedExercise } from '../../types';
import styles from './WorkoutLine.module.css';

type WorkoutLineProps = {
    line: WorkoutLineType;
    onUpdate: (line: WorkoutLineType) => void;
    onEnter: () => void;
    autoFocus?: boolean;
};

export default function WorkoutLine({ line, onUpdate, onEnter, autoFocus }: WorkoutLineProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(line.rawInput);
    const [justParsed, setJustParsed] = useState(false);

    const [parseWorkout] = useMutation(PARSE_WORKOUT, {
        onCompleted: (data) => {
            console.log('Mutation completed:', data)
            onUpdate({
                ...line,
                status: 'parsed',
                content: data.parseWorkout,
                error: null,
            })
            setJustParsed(true);
            setTimeout(() => setJustParsed(false), 600);
        },
        onError: (error) => {
            console.log('Mutation error:', error)
            onUpdate({
                ...line,
                status: 'error',
                error: error.message,
            })
        },
    });

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            
            console.log('Enter pressed, localValue:', localValue)
            console.log('Current line status:', line.status)
            
            if (localValue.trim()) {
            console.log('Triggering mutation...')
            onUpdate({
                ...line,
                rawInput: localValue,
                status: 'processing',
            })
            parseWorkout({ variables: { input: localValue } })
            }
            
            onEnter()
        }
    };

    // Processing state
    if (line.status === 'processing') {
        return (
            <div className={styles.line}>
                <div className={styles.processing}>
                    <div className={styles.spinner} />
                    <span>{line.rawInput}</span>
                </div>
            </div>
        );
    }

    // Parsed state
    if (line.status === 'parsed' && line.content) {
        return (
            <div className={styles.line}>
                <div className={styles.parsed}>
                    {line.content.map((ex, idx) => (
                        <div
                            key={idx}
                            className={`${styles.exerciseCard} ${justParsed ? styles.justParsed : ''}`}
                        >
                            <span className={styles.exerciseName}>{ex.exercise}</span>
                            <div className={styles.exerciseStats}>
                                {ex.weight !== undefined && ex.weight !== null && ex.weight > 0 && (
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{ex.weight}</span>
                                        <span className={styles.statLabel}>lbs</span>
                                    </div>
                                )}
                                {ex.sets !== undefined && ex.sets !== null && ex.reps !== undefined && ex.reps !== null && (
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{ex.sets}×{ex.reps}</span>
                                    </div>
                                )}
                                {ex.duration !== undefined && ex.duration !== null && (
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{ex.duration}</span>
                                        <span className={styles.statLabel}>s</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Editing state
    return (
        <div className={styles.line}>
            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    className={styles.input}
                    data-error={line.status === 'error'}
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Bench press 100 3x10..."
                />
            </div>
            {line.status === 'error' && line.error && (
                <div className={styles.errorBanner}>
                    <div className={styles.errorIcon}>!</div>
                    <span className={styles.errorMessage}>{line.error}</span>
                </div>
            )}
        </div>
    );
}