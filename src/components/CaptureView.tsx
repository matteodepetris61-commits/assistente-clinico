import { useEffect, useRef, useState } from 'react'
import { usePensieriStore } from '../lib/store'
import { classifyThought, getTheme } from '../lib/themes'
import { ThoughtCard } from './ThoughtCard'
import { useToast } from '../lib/toast'
import { createSpeechRecognition, isIOS, isSpeechRecognitionSupported } from '../lib/speechRecognition'

export function CaptureView() {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null)
  const thoughts = usePensieriStore((s) => s.thoughts)
  const pendingIds = usePensieriStore((s) => s.pendingIds)
  const addThought = usePensieriStore((s) => s.addThought)
  const { showToast } = useToast()

  const speechSupported = isSpeechRecognitionSupported()

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

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

  const toggleDictation = () => {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const controller = createSpeechRecognition({
      onInterim: (chunk) => setInterim(chunk),
      onFinal: (chunk) => {
        const clean = chunk.trim()
        if (!clean) return
        setText((prev) => (prev.trim() ? `${prev.trim()} ${clean}` : clean))
        setInterim('')
      },
      onEnd: () => {
        setListening(false)
        setInterim('')
      },
      onError: (message) => {
        setListening(false)
        setInterim('')
        showToast(message === 'not-allowed' ? 'Permesso microfono negato' : 'Errore microfono')
      },
    })

    if (!controller) {
      showToast('Dettatura vocale non supportata su questo browser')
      return
    }

    recognitionRef.current = controller
    controller.start()
    setListening(true)
  }

  return (
    <div>
      <h1 className="page-title">Cosa hai in mente?</h1>

      <div className="card capture-card">
        <div className="capture-textarea-wrap">
          <textarea
            className="capture-textarea"
            placeholder="Scrivi qui il tuo pensiero… viene salvato e classificato automaticamente per tema."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
          />
          {speechSupported && (
            <button
              type="button"
              className={`mic-btn${listening ? ' mic-btn-active' : ''}`}
              onClick={toggleDictation}
              title={listening ? 'Ferma dettatura' : 'Detta a voce'}
              aria-label={listening ? 'Ferma dettatura' : 'Detta a voce'}
            >
              🎙️
            </button>
          )}
        </div>
        {listening && (
          <p className="dictation-hint">
            🔴 In ascolto… {interim && <span className="dictation-interim">{interim}</span>}
          </p>
        )}
        {!speechSupported && isIOS() && (
          <p className="dictation-hint">
            💡 Su iPhone puoi dettare col microfono della tastiera di sistema: tocca dentro il
            campo di testo, poi l'icona 🎤 sulla tastiera.
          </p>
        )}
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
