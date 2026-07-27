import type { StoredThought } from '../lib/drive'
import { getTheme } from '../lib/themes'
import { useToast } from '../lib/toast'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })
}

export function ThoughtCard({
  thought,
  pending,
  showTheme = true,
}: {
  thought: StoredThought
  pending?: boolean
  showTheme?: boolean
}) {
  const { showToast } = useToast()
  const theme = getTheme(thought.themeId)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(thought.text)
      showToast('Copiato negli appunti')
    } catch {
      showToast('Impossibile copiare automaticamente')
    }
  }

  return (
    <div className="card thought-card">
      <div className="thought-meta">
        <span className="thought-date">{formatDate(thought.createdAt)}</span>
        {showTheme && (
          <span className="chip" style={{ background: theme.color, color: theme.accent }}>
            {theme.emoji} {theme.name}
          </span>
        )}
        {pending && <span className="pending-badge">In attesa di sincronizzazione</span>}
      </div>
      <p className="thought-text">{thought.text}</p>
      <div className="thought-actions">
        <button className="btn btn-ghost btn-sm" onClick={copy}>
          📋 Copia
        </button>
      </div>
    </div>
  )
}
