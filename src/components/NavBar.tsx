import { navigate } from '../lib/useHashRoute'

interface NavItem {
  path: string
  label: string
  emoji: string
}

const ITEMS: NavItem[] = [
  { path: '/nuovo', label: 'Scrivi', emoji: '✍️' },
  { path: '/', label: 'Mappa', emoji: '🧠' },
  { path: '/raccolta', label: 'Raccolta', emoji: '📖' },
  { path: '/impostazioni', label: 'Impostazioni', emoji: '⚙️' },
]

export function NavBar({ current }: { current: string }) {
  return (
    <nav className="nav-bar">
      {ITEMS.map((item) => {
        const active = current === item.path
        return (
          <button
            key={item.path}
            className={`nav-item${active ? ' nav-item-active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-emoji">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
