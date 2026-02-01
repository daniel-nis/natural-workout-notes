import type { Note, WorkoutLine as WorkoutLineType } from '../../types';
import WorkoutLine from './WorkoutLine';
import NoteHeader from './NoteHeader';
import styles from './Editor.module.css';

type EditorProps = {
    note: Note | null;
    updateNote: (note: Note) => void;
}

export default function Editor({ note, updateNote }: EditorProps) {
    if (!note) {
        return (
            <div className={styles.editor}>
                <div className={styles.container}>
                    <p className={styles.emptyState}>Select a note or create a new one</p>
                </div>
            </div>
        );
    }

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
        <div className={styles.editor}>
            <div className={styles.container}>
                <NoteHeader note={note} updateNote={updateNote} />

                <div className={styles.linesContainer}>
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
        </div>
    );
}