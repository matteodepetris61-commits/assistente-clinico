export interface ThemeDef {
  id: string
  name: string
  emoji: string
  color: string // pastel background
  accent: string // slightly stronger accent for text/borders
  keywords: string[]
}

// Temi predefiniti con parole chiave per la classificazione automatica.
// "varie" è sempre il tema di ripiego quando nessuna parola chiave corrisponde.
export const THEMES: ThemeDef[] = [
  {
    id: 'lavoro',
    name: 'Lavoro',
    emoji: '💼',
    color: '#dbeafe',
    accent: '#3b6ea5',
    keywords: [
      'lavoro', 'ufficio', 'progetto', 'riunione', 'capo', 'collega', 'colleghi', 'scadenza',
      'cliente', 'email', 'mail', 'presentazione', 'call', 'meeting', 'stipendio', 'carriera',
      'azienda', 'contratto', 'colloquio', 'turno', 'straordinari',
    ],
  },
  {
    id: 'famiglia',
    name: 'Famiglia',
    emoji: '👨‍👩‍👧',
    color: '#ffe4ec',
    accent: '#b3577a',
    keywords: [
      'famiglia', 'mamma', 'papà', 'padre', 'madre', 'figlio', 'figlia', 'fratello', 'sorella',
      'nonno', 'nonna', 'moglie', 'marito', 'genitori', 'zio', 'zia', 'cugino', 'cugina', 'casa',
      'figli', 'nipote',
    ],
  },
  {
    id: 'relazioni',
    name: 'Relazioni',
    emoji: '💞',
    color: '#ffe8f0',
    accent: '#c15c8a',
    keywords: [
      'amore', 'amico', 'amica', 'amici', 'coppia', 'fidanzato', 'fidanzata', 'partner',
      'relazione', 'appuntamento', 'litigio', 'conflitto', 'amicizia', 'fiducia', 'gelosia',
    ],
  },
  {
    id: 'salute',
    name: 'Salute',
    emoji: '🌿',
    color: '#d9f2e3',
    accent: '#3f8a63',
    keywords: [
      'salute', 'medico', 'dottore', 'dottoressa', 'malattia', 'dolore', 'stanchezza', 'stanco',
      'stanca', 'sonno', 'dormire', 'palestra', 'allenamento', 'dieta', 'ansia', 'sintomo',
      'visita', 'terapia', 'farmaco', 'corpo',
    ],
  },
  {
    id: 'progetti',
    name: 'Progetti & Idee',
    emoji: '💡',
    color: '#fff3cd',
    accent: '#a1791f',
    keywords: [
      'idea', 'progetto', 'creare', 'creativo', 'inventare', 'costruire', 'piano', 'business',
      'startup', 'app', 'scrivere', 'disegnare', 'design', 'innovazione', 'brainstorm',
    ],
  },
  {
    id: 'obiettivi',
    name: 'Obiettivi',
    emoji: '🎯',
    color: '#e0e7ff',
    accent: '#4c53a8',
    keywords: [
      'obiettivo', 'obiettivi', 'traguardo', 'meta', 'futuro', 'sogno', 'sogni', 'ambizione',
      'crescita', 'migliorare', 'cambiamento', 'proposito', 'motivazione', 'disciplina',
    ],
  },
  {
    id: 'emozioni',
    name: 'Emozioni',
    emoji: '🌊',
    color: '#e0f2fe',
    accent: '#2b6f8e',
    keywords: [
      'felice', 'felicità', 'triste', 'tristezza', 'paura', 'rabbia', 'arrabbiato', 'ansioso',
      'ansiosa', 'gioia', 'emozione', 'emozioni', 'sereno', 'serena', 'nostalgia', 'solitudine',
      'preoccupato', 'preoccupata', 'grato', 'gratitudine',
    ],
  },
  {
    id: 'varie',
    name: 'Varie',
    emoji: '🌸',
    color: '#f3e8ff',
    accent: '#7c4fa0',
    keywords: [],
  },
]

export const DEFAULT_THEME_ID = 'varie'

export function getTheme(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!
}

/**
 * Classificazione automatica basata su corrispondenza di parole chiave.
 * Il tema con più corrispondenze vince; a parità, vince il primo in ordine di definizione.
 * Se nessuna parola chiave corrisponde, il pensiero va in "Varie".
 */
export function classifyThought(text: string): string {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // rimuove accenti per un match più permissivo

  let bestId = DEFAULT_THEME_ID
  let bestScore = 0

  for (const theme of THEMES) {
    if (theme.keywords.length === 0) continue
    let score = 0
    for (const keyword of theme.keywords) {
      const kw = keyword
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
      if (normalized.includes(kw)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestId = theme.id
    }
  }

  return bestScore > 0 ? bestId : DEFAULT_THEME_ID
}
