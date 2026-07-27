import { useState } from 'react'
import { usePensieriStore } from '../lib/store'
import { ThoughtCard } from './ThoughtCard'
import { exportThoughtsToWord } from '../lib/docxExport'
import { useToast } from '../lib/toast'

export function CollectionView() {
  const thoughts = usePensieriStore((s) => s.thoughts)
  const pendingIds = usePensieriStore((s) => s.pendingIds)
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)

  const copyAll = async () => {
    const text = [...thoughts]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((t) => `[${new Date(t.createdAt).toLocaleString('it-IT')}]\n${t.text}`)
      .join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      showToast('Raccolta copiata negli appunti')
    } catch {
      showToast('Impossibile copiare automaticamente')
    }
  }

  const exportWord = async () => {
    setExporting(true)
    try {
      await exportThoughtsToWord('Raccolta completa', thoughts)
      showToast('Documento Word esportato')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="theme-header">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Raccolta completa
          </h1>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {thoughts.length} pensier{thoughts.length === 1 ? 'o' : 'i'} in totale
          </span>
        </div>
        <div className="theme-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={copyAll} disabled={thoughts.length === 0}>
            📋 Copia tutto
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportWord} disabled={thoughts.length === 0 || exporting}>
            {exporting ? 'Esporto…' : '📄 Esporta Word'}
          </button>
        </div>
      </div>

      {thoughts.length === 0 ? (
        <div className="empty-state card">Non hai ancora scritto nessun pensiero.</div>
      ) : (
        <div className="recent-list">
          {thoughts.map((t) => (
            <ThoughtCard key={t.id} thought={t} pending={pendingIds.has(t.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
