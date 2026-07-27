interface SpeechRecognitionController {
  start(): void
  stop(): void
}

interface SpeechRecognitionHandlers {
  onInterim(text: string): void
  onFinal(text: string): void
  onEnd(): void
  onError(message: string): void
}

export function isSpeechRecognitionSupported(): boolean {
  const w = window as unknown as Record<string, unknown>
  return typeof window !== 'undefined' && Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition)
}

export function createSpeechRecognition(
  handlers: SpeechRecognitionHandlers,
): SpeechRecognitionController | null {
  const w = window as unknown as Record<string, unknown>
  const SpeechRecognitionCtor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => any) // eslint-disable-line @typescript-eslint/no-explicit-any
    | undefined
  if (!SpeechRecognitionCtor) return null

  const recognition = new SpeechRecognitionCtor()
  recognition.lang = 'it-IT'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const text = result[0].transcript as string
      if (result.isFinal) {
        handlers.onFinal(text)
      } else {
        interim += text
      }
    }
    handlers.onInterim(interim)
  }
  recognition.onerror = (event: any) => handlers.onError(event.error ?? 'Errore sconosciuto') // eslint-disable-line @typescript-eslint/no-explicit-any
  recognition.onend = () => handlers.onEnd()

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  }
}
