import { useEffect } from 'react'
import './App.css'
import { useHashRoute } from './lib/useHashRoute'
import { usePensieriStore } from './lib/store'
import { ToastProvider } from './lib/toast'
import { NavBar } from './components/NavBar'
import { CaptureView } from './components/CaptureView'
import { MindMap } from './components/MindMap'
import { ThemeView } from './components/ThemeView'
import { CollectionView } from './components/CollectionView'
import { SettingsView } from './components/SettingsView'

function Header() {
  const status = usePensieriStore((s) => s.status)
  return (
    <div className="app-header">
      <span className="app-brand">
        🧠 I Miei Pensieri
        <span className={`status-dot ${status}`} title={status} />
      </span>
    </div>
  )
}

function Content({ route }: { route: string }) {
  if (route === '/' || route === '') return <MindMap />
  if (route === '/nuovo') return <CaptureView />
  if (route === '/raccolta') return <CollectionView />
  if (route === '/impostazioni') return <SettingsView />
  if (route.startsWith('/tema/')) return <ThemeView themeId={route.slice('/tema/'.length)} />
  return <MindMap />
}

function AppInner() {
  const route = useHashRoute()
  const init = usePensieriStore((s) => s.init)
  const retrySync = usePensieriStore((s) => s.retrySync)
  const status = usePensieriStore((s) => s.status)

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    const onOnline = () => void retrySync()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [retrySync])

  useEffect(() => {
    if (status !== 'ready') return
    const id = window.setInterval(() => void retrySync(), 45_000)
    return () => window.clearInterval(id)
  }, [status, retrySync])

  return (
    <div className="app-shell">
      <Header />
      <Content route={route} />
      <NavBar current={route === '' ? '/' : route.startsWith('/tema/') ? '' : route} />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}

export default App
