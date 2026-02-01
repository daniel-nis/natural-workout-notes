import type { Note } from '../../types';
import styles from './Sidebar.module.css';

type SidebarProps = {
    notes: Note[];
    activeNoteId: string | null;
    setActiveNoteId: (id: string) => void;
    createNote: () => void;
}

export default function Sidebar({ notes, activeNoteId, setActiveNoteId, createNote }: SidebarProps) {
    const formatDate = (iso: string) => {
        const date = new Date(iso);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) return 'Today';
        if (diffHours < 48) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getLineCount = (note: Note) => {
        return note.lines.filter(line => line.status === 'parsed').length;
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.logo}>Easy Lift Notes</div>
                <button onClick={createNote} className={styles.newNoteButton}>
                    <span className={styles.newNoteIcon}>+</span>
                    <span className={styles.newNoteText}>New Note</span>
                </button>
            </div>

            <div className={styles.notesList}>
                {notes.length === 0 && (
                    <div className={styles.emptyState}>No notes yet. Create one to get started.</div>
                )}

                {notes.map(note => (
                    <div
                        key={note.id}
                        onClick={() => setActiveNoteId(note.id)}
                        className={`${styles.noteItem} ${note.id === activeNoteId ? styles.active : ''}`}
                    >
                        <div className={styles.noteTitle}>{note.title}</div>
                        <div className={styles.noteMetadata}>
                            <span className={styles.noteDate}>{formatDate(note.updatedAt)}</span>
                            {getLineCount(note) > 0 && (
                                <span className={styles.noteCount}>{getLineCount(note)} exercises</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}