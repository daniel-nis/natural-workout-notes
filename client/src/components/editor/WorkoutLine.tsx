import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { PARSE_WORKOUT } from '../../graphql/mutations';
import type { WorkoutLine as WorkoutLineType, ParsedExercise } from '../../types';

type WorkoutLineProps = {
    line: WorkoutLineType;
    onUpdate: (line: WorkoutLineType) => void;
    onEnter: () => void;
    autoFocus?: boolean;
};

function formatParsedContent(exercises: ParsedExercise[]): string {
    return exercises.map(ex => {
        const parts = [ex.exercise];
        if (ex.weight !== null) parts.push(`${ex.weight} lbs`);
        if (ex.sets !== null && ex.reps !== null) parts.push(`${ex.sets}x${ex.reps}`);
        else if (ex.sets !== null) parts.push(`${ex.sets} sets`);
        else if (ex.reps !== null) parts.push(`${ex.reps} reps`);
        if (ex.duration !== null) parts.push(`${ex.duration}s`);
        return parts.join(' - ');
    }).join(', ');
};

export default function WorkoutLine({ line, onUpdate, onEnter, autoFocus }: WorkoutLineProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Compute display value from line prop
    const displayValue = line.status === 'parsed' && line.content 
        ? formatParsedContent(line.content) 
        : line.rawInput;
    
    const [localValue, setLocalValue] = useState(displayValue);

    const [parseWorkout] = useMutation(PARSE_WORKOUT, {
        onCompleted: (data) => {
            console.log('Mutation completed:', data)
            onUpdate({
            ...line,
            status: 'parsed',
            content: data.parseWorkout,
            error: null,
            })
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

    // Sync localValue when displayValue changes (when line is parsed)
    useEffect(() => {
        setLocalValue(displayValue);
    }, [displayValue]);

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

    if (line.status === 'processing') {
        return (
            <div style={{ padding: '0.5em', fontStyle: 'italic', color: '#888' }}>
                {line.rawInput} ⏳
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <input
                ref={inputRef}
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ 
                    width: '100%', 
                    padding: '0.5em',
                    backgroundColor: line.status === 'error' ? '#ffe6e6' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #2e2e2eff',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'inherit',
                 }}
                placeholder="Enter workout line..."
            />
            {line.status === 'error' && (
                <div style={{ color: 'red', cursor: 'help' }}>
                    {line.error} ⚠️
                </div>
            )}
        </div>
    )
}