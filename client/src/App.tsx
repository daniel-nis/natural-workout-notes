import { useState } from 'react';
import Sidebar from './components/sidebar/Sidebar';
import Editor from './components/editor/Editor';
import type { Note } from './types';

import './App.css'

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      lines: [{ id: crypto.randomUUID(), rawInput: "", status: "editing", content: null, error: null }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        setActiveNoteId={setActiveNoteId}
        createNote={createNote}
      />
      <Editor
        note={activeNote}
        updateNote={updateNote}
      />
    </div>
  )
}

export default App
