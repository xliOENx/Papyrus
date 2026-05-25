import { useEffect, useMemo, useRef, useState } from 'react'

const TAG_OPTIONS = ['work', 'study', 'personal']
const COLOR_OPTIONS = [
  { key: 'yellow', label: 'Yellow', value: '#facc15' },
  { key: 'blue', label: 'Blue', value: '#60a5fa' },
  { key: 'pink', label: 'Pink', value: '#f472b6' },
  { key: 'green', label: 'Green', value: '#4ade80' },
  { key: 'violet', label: 'Violet', value: '#a78bfa' },
]

function createDraft() {
  return {
    id: Date.now(),
    title: '',
    text: '',
    tags: [],
    color: 'yellow',
    pinned: false,
    drawing: null,
  }
}

function NoteEditor({ note, onSave, onClose, onAdd, darkMode }) {
  const [draft, setDraft] = useState(note ?? createDraft())
  const [brushColor, setBrushColor] = useState('#7c3aed')
  const [brushSize, setBrushSize] = useState(4)
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef(null)

  useEffect(() => {
    setDraft(note ? { ...note, tags: [...note.tags] } : createDraft())
  }, [note])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)

    if (!draft.drawing) {
      context.fillStyle = darkMode ? '#111827' : '#f8fafc'
      context.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    const image = new Image()
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    image.src = draft.drawing
  }, [draft.drawing, darkMode])

  const canvasSize = useMemo(() => ({ width: 760, height: 240 }), [])

  function getPoint(event) {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvasSize.width,
      y: ((event.clientY - rect.top) / rect.height) * canvasSize.height,
    }
  }

  function beginDrawing(event) {
    const point = getPoint(event)
    if (!point) return

    isDrawing.current = true
    lastPoint.current = point

    const context = canvasRef.current.getContext('2d')
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.lineWidth = brushSize
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = brushColor
  }

  function draw(event) {
    if (!isDrawing.current) return

    const point = getPoint(event)
    if (!point || !lastPoint.current) return

    const context = canvasRef.current.getContext('2d')
    context.lineWidth = brushSize
    context.strokeStyle = brushColor
    context.beginPath()
    context.moveTo(lastPoint.current.x, lastPoint.current.y)
    context.lineTo(point.x, point.y)
    context.stroke()

    lastPoint.current = point
  }

  function stopDrawing() {
    if (!isDrawing.current || !canvasRef.current) return

    isDrawing.current = false
    lastPoint.current = null
    const dataUrl = canvasRef.current.toDataURL('image/png')
    setDraft((current) => ({ ...current, drawing: dataUrl }))
  }

  function toggleTag(tag) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }))
  }

  function handleSave() {
    if (!draft.title.trim() && !draft.text.trim()) return
    onSave({ ...draft, isNew: false })
    onClose()
  }

  const modeLabel = draft.isNew ? 'Creating a new note' : 'Editing an existing note'

  if (!note) {
    return (
      <section className="note-editor">
        <div className="toolbar">
          <div>
            <h2>Editor</h2>
            <p>Create a note and start adding your ideas.</p>
          </div>
          <button type="button" onClick={onAdd}>Create note</button>
        </div>

        <div className="empty-state">
          <strong>No note selected.</strong>
          <p>Choose a note from the list or create a new one to begin editing.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="note-editor">
      <div className="toolbar">
        <div>
          <h2>Editor</h2>
          <p>Edit the selected note, change tags, colors, and draw directly on the canvas.</p>
        </div>
        <button type="button" onClick={onAdd}>Create note</button>
      </div>

      <div className="editor-stack">
        <p className="field-hint">{modeLabel}</p>
        <input
          type="text"
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder="Note title"
          aria-label="Note title"
        />

        <textarea
          value={draft.text}
          onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))}
          placeholder="Write your note in Markdown"
          aria-label="Note text"
        />

        <div className="controls">
          <label>
            <span>Color</span>
            <select
              value={draft.color}
              onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
            >
              {COLOR_OPTIONS.map((color) => (
                <option key={color.key} value={color.key}>
                  {color.label}
                </option>
              ))}
            </select>
          </label>

          <button type="button" onClick={() => setDraft((current) => ({ ...current, pinned: !current.pinned }))}>
            {draft.pinned ? 'Unpin note' : 'Pin note'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>Close</button>
          <button type="button" onClick={handleSave}>Save note</button>
        </div>

        <div className="tag-row">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={draft.tags.includes(tag) ? 'chip' : 'chip'}
              onClick={() => toggleTag(tag)}
              style={{
                background: draft.tags.includes(tag) ? 'var(--accent-soft)' : 'var(--chip-bg)',
              }}
            >
              {draft.tags.includes(tag) ? '✓ ' : ''}
              {tag}
            </button>
          ))}
        </div>

        <div className="canvas-panel">
          <h3>Hand-drawn sketch</h3>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onPointerDown={beginDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
          <div className="canvas-tools">
            <label>
              Brush color
              <input
                type="color"
                value={brushColor}
                onChange={(event) => setBrushColor(event.target.value)}
              />
            </label>
            <label>
              Brush size
              <input
                type="range"
                min="1"
                max="14"
                value={brushSize}
                onChange={(event) => setBrushSize(Number(event.target.value))}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const canvas = canvasRef.current
                if (!canvas) return
                const context = canvas.getContext('2d')
                context.clearRect(0, 0, canvas.width, canvas.height)
                setDraft((current) => ({ ...current, drawing: null }))
              }}
            >
              Clear canvas
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NoteEditor
