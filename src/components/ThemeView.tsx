import { useMemo, useState } from 'react'
import { usePensieriStore } from '../lib/store'
import { getTheme } from '../lib/themes'
import { ThoughtCard } from './ThoughtCard'
import { exportThoughtsToWord } from '../lib/docxExport'
import { useToast } from '../lib/toast'
import { navigate } from '../lib/useHashRoute'

export function ThemeView({ themeId }: { themeId: string }) {
  const theme = getTheme(themeId)
  const thoughts = usePensieriStore((s) => s.thoughts)
  const pendingIds = usePensieriStore((s) => s.pendingIds)
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)

  const themeThoughts = useMemo(
    () => thoughts.filter((t) => t.themeId === themeId),
    [thoughts, themeId],
  )

  const copyAll = async () => {
    const text = [...themeThoughts]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((t) => `[${new Date(t.createdAt).toLocaleString('it-IT')}]\n${t.text}`)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      showToast('Documento copiato negli appunti')
    } catch {
      showToast('Impossibile copiare automaticamente')
    }
  }

  const exportWord = async () => {
    setExporting(true)
    try {
      await exportThoughtsToWord(`Tema - ${theme.name}`, themeThoughts)
      showToast('Documento Word esportato')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 12 }}>
        ← Mappa mentale
      </button>

      <div className="theme-header">
        <span className="emoji">{theme.emoji}</span>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            {theme.name}
          </h1>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {themeThoughts.length} pensier{themeThoughts.length === 1 ? 'o' : 'i'}
          </span>
        </div>
        <div className="theme-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={copyAll} disabled={themeThoughts.length === 0}>
            📋 Copia tutto
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportWord} disabled={themeThoughts.length === 0 || exporting}>
            {exporting ? 'Esporto…' : '📄 Esporta Word'}
          </button>
        </div>
      </div>

      {themeThoughts.length === 0 ? (
        <div className="empty-state card">Nessun pensiero ancora in questo tema.</div>
      ) : (
        <div className="recent-list">
          {themeThoughts.map((t) => (
            <ThoughtCard key={t.id} thought={t} pending={pendingIds.has(t.id)} showTheme={false} />
          ))}
        </div>
      )}
    </div>
  )
}
