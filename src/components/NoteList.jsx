import ReactMarkdown from 'react-markdown'

const colorMap = {
  yellow: '#facc15',
  blue: '#60a5fa',
  pink: '#f472b6',
  green: '#4ade80',
  violet: '#a78bfa',
}

function NoteList({
  notes,
  search,
  onDelete,
  onTogglePin,
  onEdit,
  onSearch,
  darkMode,
  onToggleDarkMode,
}) {
  const filteredNotes = notes
    .slice()
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .filter((note) => {
      const query = search.trim().toLowerCase()
      if (!query) return true

      return [note.title, note.text, note.tags.join(' ')].some((value) =>
        String(value).toLowerCase().includes(query),
      )
    })

  return (
    <div className="note-list">
      <div className="toolbar">
        <div>
          <h1>Papyrus</h1>
          <p>Capture ideas, keep tasks organized, and switch themes instantly.</p>
        </div>
        <button type="button" className="theme-switch" onClick={onToggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <input
        className="search"
        type="search"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search notes by title, text, or tags"
        aria-label="Search notes"
      />

      <div className="note-grid">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <strong>No notes yet.</strong>
            <p>Create a note in the editor to start organizing your thoughts.</p>
          </div>
        ) : (   
          filteredNotes.map((note) => (
            <article
              key={note.id}
              data-note-card
              className={note.pinned ? 'pinned' : ''}
              style={{ borderLeft: `6px solid ${colorMap[note.color] || colorMap.yellow}` }}
            >
              <div className="note-card-header">
                <div>
                  <div className="note-title-row">
                    <h3>{note.title || 'Untitled note'}</h3>
                    {note.pinned ? (
                      <span
                        className="pinned-badge"
                        style={{ backgroundColor: colorMap[note.color] || colorMap.yellow, color: '#111827' }}
                      >
                        Pinned
                      </span>
                    ) : null}
                  </div>
                  <p>
                    {note.tags.length > 0 ? note.tags.join(' • ') : 'No tags'}
                  </p>
                </div>
                <div className="note-card-actions">
                  <button type="button" onClick={() => onTogglePin(note.id)}>
                    {note.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button type="button" onClick={() => onEdit(note)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(note.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="markdown">
                <ReactMarkdown>{note.text || '_Add details to this note._'}</ReactMarkdown>
              </div>
              {note.drawing && (
                <div className="note-preview-canvas">
                  <img
                    src={note.drawing}
                    alt="Note drawing preview"
                    style={{
                      width: '100%',
                      maxHeight: 120,
                      objectFit: 'contain',
                      borderRadius: 12,
                      marginTop: 10,
                      background: 'rgba(255,255,255,0.7)',
                      border: '1px solid #e2cfa1',
                    }}
                  />
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default NoteList
