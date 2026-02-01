import type { Note, WorkoutLine as WorkoutLineType } from '../../types';
import WorkoutLine from './WorkoutLine';

type EditorProps = {
    note: Note | null;
    updateNote: (note: Note) => void;
}

export default function Editor({ note, updateNote }: EditorProps) {
    if (!note) {
        return (
            <div style={{ flex: 1, padding: '2em', color: '#666' }}>
                <p>Select a note or create a new one</p>
            </div>
        );
    };

    const updateLine = (updatedLine: WorkoutLineType) => {
        updateNote({
            ...note,
            updatedAt: new Date().toISOString(),
            lines: note.lines.map(l => l.id === updatedLine.id ? updatedLine : l),
        })
    }

    const addNewLine = () => {
        updateNote({
            ...note,
            updatedAt: new Date().toISOString(),
            lines: [
                ...note.lines,
                { id: crypto.randomUUID(), rawInput: '', status: 'editing', content: null, error: null }
            ]
        })
    }

    return (
        <div style={{ flex: 1, padding: '2rem', maxWidth: '800px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{note.title}</h2>
            
            <div>
                {note.lines.map((line, index) => (
                    <WorkoutLine
                        key={line.id}
                        line={line}
                        onUpdate={updateLine}
                        onEnter={addNewLine}
                        autoFocus={index === note.lines.length - 1}
                    />
                ))}
            </div>
        </div>
    );
}