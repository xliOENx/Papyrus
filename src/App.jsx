import { useState, useEffect } from 'react'
import './App.css'
import NoteList from './components/NoteList'
import NoteEditor from './components/NoteEditor'

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('papyrus-notes')
    return saved ? JSON.parse(saved) : []
  })
  const [search, setSearch] = useState('')
  const [editingNote, setEditingNote] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('papyrus-theme') === 'dark'
  })

  useEffect(() => {
    localStorage.setItem('papyrus-notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem('papyrus-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: '',
      text: '',
      tags: [],
      color: 'yellow',
      pinned: false,
      drawing: null,
      isNew: true,
    }
    setNotes([newNote, ...notes])
    setEditingNote(newNote)
  }

  const updateNote = (updated) => {
    setNotes(notes.map(n => n.id === updated.id ? updated : n))
    setEditingNote(updated)
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id))
    setEditingNote(null)
  }

  const togglePin = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <NoteList
        notes={notes}
        search={search}
        onDelete={deleteNote}
        onTogglePin={togglePin}
        onEdit={setEditingNote}
        onSearch={setSearch}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
      />
      <NoteEditor
        note={editingNote}
        onSave={updateNote}
        onClose={() => setEditingNote(null)}
        onAdd={addNote}
        darkMode={darkMode}
      />
    </div>
  )
}

export default App