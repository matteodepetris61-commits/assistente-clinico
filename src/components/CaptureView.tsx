import { useState } from 'react'
import { usePensieriStore } from '../lib/store'
import { classifyThought, getTheme } from '../lib/themes'
import { ThoughtCard } from './ThoughtCard'
import { useToast } from '../lib/toast'

export function CaptureView() {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const thoughts = usePensieriStore((s) => s.thoughts)
  const pendingIds = usePensieriStore((s) => s.pendingIds)
  const addThought = usePensieriStore((s) => s.addThought)
  const { showToast } = useToast()

  const preview = text.trim() ? getTheme(classifyThought(text)) : null

  const save = async () => {
    const value = text.trim()
    if (!value) return
    setSaving(true)
    setText('')
    try {
      await addThought(value)
      showToast('Pensiero salvato')
    } finally {
      setSaving(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void save()
    }
  }

  return (
    <div>
      <h1 className="page-title">Cosa hai in mente?</h1>

      <div className="card capture-card">
        <textarea
          className="capture-textarea"
          placeholder="Scrivi qui il tuo pensiero… viene salvato e classificato automaticamente per tema."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <div className="capture-actions">
          {preview && (
            <span
              className="chip"
              style={{ background: preview.color, color: preview.accent, marginRight: 'auto' }}
            >
              {preview.emoji} {preview.name}
            </span>
          )}
          <button className="btn btn-primary" onClick={save} disabled={!text.trim() || saving}>
            {saving ? 'Salvataggio…' : 'Salva pensiero'}
          </button>
        </div>
      </div>

      {thoughts.length > 0 && (
        <div className="recent-list">
          <h3 className="muted" style={{ margin: '0 0 4px' }}>
            Ultimi pensieri
          </h3>
          {thoughts.slice(0, 8).map((t) => (
            <ThoughtCard key={t.id} thought={t} pending={pendingIds.has(t.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
