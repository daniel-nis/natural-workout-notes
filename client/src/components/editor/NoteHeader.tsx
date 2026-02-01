import type { Note } from '../../types';
import styles from './NoteHeader.module.css';

interface Props {
  note: Note;
  updateNote: (note: Note) => void;
}

export default function NoteHeader({ note, updateNote }: Props) {
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={styles.header}>
      <input
        className={styles.titleInput}
        value={note.title}
        onChange={(e) => updateNote({ ...note, title: e.target.value })}
        placeholder="Untitled"
      />
      <div className={styles.metadata}>
        <span>Updated {formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
}
