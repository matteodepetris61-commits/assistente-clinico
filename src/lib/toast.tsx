import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ToastContextValue {
  showToast(message: string): void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setMessage(null), 2200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <div className="toast">{message}</div>}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve essere usato dentro ToastProvider')
  return ctx
}
