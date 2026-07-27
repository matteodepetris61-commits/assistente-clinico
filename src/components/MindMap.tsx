import { useMemo } from 'react'
import { usePensieriStore } from '../lib/store'
import { THEMES } from '../lib/themes'
import { navigate } from '../lib/useHashRoute'

const SIZE = 560
const CENTER = SIZE / 2
const RADIUS = 200

export function MindMap() {
  const thoughts = usePensieriStore((s) => s.thoughts)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of thoughts) {
      map.set(t.themeId, (map.get(t.themeId) ?? 0) + 1)
    }
    return map
  }, [thoughts])

  const themesWithData = useMemo(
    () =>
      THEMES.map((theme) => ({ theme, count: counts.get(theme.id) ?? 0 })).sort(
        (a, b) => b.count - a.count,
      ),
    [counts],
  )

  const total = thoughts.length

  const nodes = themesWithData.map((entry, i) => {
    const angle = (i / themesWithData.length) * Math.PI * 2 - Math.PI / 2
    const x = CENTER + RADIUS * Math.cos(angle)
    const y = CENTER + RADIUS * Math.sin(angle)
    const nodeRadius = 34 + Math.min(30, entry.count * 4)
    return { ...entry, x, y, nodeRadius }
  })

  return (
    <div>
      <h1 className="page-title">La tua mappa mentale</h1>
      <p className="muted" style={{ marginTop: -10, marginBottom: 18 }}>
        {total === 0
          ? 'Ancora nessun pensiero: inizia a scrivere e vedrai i temi prendere forma qui.'
          : `${total} pensier${total === 1 ? 'o' : 'i'} raccolt${total === 1 ? 'o' : 'i'}, organizzati per tema. Tocca un tema per aprirne il documento.`}
      </p>

      <div className="mindmap-wrap">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mindmap-svg" role="img" aria-label="Mappa mentale dei temi">
          {nodes.map((n) => (
            <line
              key={`link-${n.theme.id}`}
              className="mindmap-link"
              x1={CENTER}
              y1={CENTER}
              x2={n.x}
              y2={n.y}
              stroke={n.theme.accent}
            />
          ))}

          <g className="mindmap-center">
            <circle cx={CENTER} cy={CENTER} r={54} />
            <text x={CENTER} y={CENTER + 5}>
              I miei
            </text>
            <text x={CENTER} y={CENTER + 22} style={{ fontSize: 13, fontWeight: 700 }}>
              pensieri
            </text>
          </g>

          {nodes.map((n) => (
            <g
              key={n.theme.id}
              className="mindmap-node"
              transform={`translate(${n.x}, ${n.y})`}
              onClick={() => navigate(`/tema/${n.theme.id}`)}
            >
              <circle r={n.nodeRadius} fill={n.theme.color} />
              <text className="mindmap-label" y={-2}>
                {n.theme.emoji}
              </text>
              <text className="mindmap-label" y={n.nodeRadius + 18}>
                {n.theme.name}
              </text>
              <text className="mindmap-count" y={n.nodeRadius + 32}>
                {n.count} pensier{n.count === 1 ? 'o' : 'i'}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
