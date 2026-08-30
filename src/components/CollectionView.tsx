import { useMemo, useState } from 'react'
import { usePensieriStore } from '../lib/store'
import { ThoughtCard } from './ThoughtCard'
import { exportThoughtsToWord } from '../lib/docxExport'
import { useToast } from '../lib/toast'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function CollectionView() {
  const thoughts = usePensieriStore((s) => s.thoughts)
  const pendingIds = usePensieriStore((s) => s.pendingIds)
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return thoughts
    return thoughts.filter((t) => normalize(t.text).includes(q))
  }, [thoughts, query])

  const copyAll = async () => {
    const text = [...filtered]
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
      await exportThoughtsToWord(query.trim() ? `Raccolta completa - "${query.trim()}"` : 'Raccolta completa', filtered)
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
            {query.trim()
              ? `${filtered.length} di ${thoughts.length} pensieri`
              : `${thoughts.length} pensier${thoughts.length === 1 ? 'o' : 'i'} in totale`}
          </span>
        </div>
        <div className="theme-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={copyAll} disabled={filtered.length === 0}>
            📋 Copia {query.trim() ? 'risultati' : 'tutto'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportWord} disabled={filtered.length === 0 || exporting}>
            {exporting ? 'Esporto…' : '📄 Esporta Word'}
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="search"
          className="settings-input"
          placeholder="🔎 Cerca una parola o un concetto nei tuoi pensieri…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {thoughts.length === 0 ? (
        <div className="empty-state card">Non hai ancora scritto nessun pensiero.</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">Nessun pensiero contiene "{query.trim()}".</div>
      ) : (
        <div className="recent-list">
          {filtered.map((t) => (
            <ThoughtCard key={t.id} thought={t} pending={pendingIds.has(t.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
