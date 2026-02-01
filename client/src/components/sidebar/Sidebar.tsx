import type { Note} from '../../types';

type SidebarProps = {
    notes: Note[];
    activeNoteId: string | null;
    setActiveNoteId: (id: string) => void;
    createNote: () => void;
}

export default function Sidebar({ notes, activeNoteId, setActiveNoteId, createNote }: SidebarProps) {
    return (
        <div style={{ 
            width: '250px', 
            borderRight: '1px solid #333', 
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            }}>
            <button onClick={createNote} style={{ marginBottom: '1rem', borderRadius: '12px' }}>
                + New Note
            </button>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {notes.length === 0 && <p style={{ color: '#666' }}>No notes yet</p>}
                
                {notes.map(note => (
                <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    backgroundColor: note.id === activeNoteId ? '#333' : 'transparent',
                    }}
                >
                    <div style={{ fontWeight: 500 }}>{note.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}