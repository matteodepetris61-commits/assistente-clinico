import { useState } from 'react'
import { usePensieriStore } from '../lib/store'
import { getClientId, setClientId as saveClientId } from '../lib/config'
import { useToast } from '../lib/toast'

export function SettingsView() {
  const [clientIdInput, setClientIdInput] = useState(getClientId() ?? '')
  const status = usePensieriStore((s) => s.status)
  const error = usePensieriStore((s) => s.error)
  const folderId = usePensieriStore((s) => s.folderId)
  const pendingIds = usePensieriStore((s) => s.pendingIds)
  const connect = usePensieriStore((s) => s.connect)
  const disconnect = usePensieriStore((s) => s.disconnect)
  const retrySync = usePensieriStore((s) => s.retrySync)
  const init = usePensieriStore((s) => s.init)
  const { showToast } = useToast()

  const saveAndConnect = async () => {
    if (!clientIdInput.trim()) return
    saveClientId(clientIdInput)
    await init()
    showToast('Client ID salvato')
  }

  const statusLabel: Record<string, string> = {
    'no-client-id': 'Configurazione richiesta',
    disconnected: 'Non connesso a Google Drive',
    loading: 'Connessione in corso…',
    ready: 'Connesso e sincronizzato',
    error: 'Errore di connessione',
  }

  return (
    <div>
      <h1 className="page-title">Impostazioni</h1>

      <div className="card settings-section">
        <h3>Stato</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`status-dot ${status}`} />
          <span>{statusLabel[status] ?? status}</span>
        </div>
        {error && <p style={{ color: '#c0554f', fontSize: '0.85rem' }}>{error}</p>}
        {pendingIds.size > 0 && (
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            {pendingIds.size} pensier{pendingIds.size === 1 ? 'o' : 'i'} in attesa di sincronizzazione.
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {status === 'ready' ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => void retrySync()}>
                🔄 Sincronizza ora
              </button>
              <button className="btn btn-ghost btn-sm" onClick={disconnect}>
                Disconnetti
              </button>
            </>
          ) : (
            status !== 'no-client-id' && (
              <button className="btn btn-primary btn-sm" onClick={() => void connect()}>
                Connetti a Google Drive
              </button>
            )
          )}
        </div>
        {folderId && (
          <a
            href={`https://drive.google.com/drive/folders/${folderId}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: '0.85rem' }}
          >
            Apri la cartella su Google Drive ↗
          </a>
        )}
      </div>

      <div className="card settings-section">
        <h3>Google Client ID</h3>
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: 0 }}>
          Serve un Client ID OAuth Google tuo personale per collegare l'app al tuo Drive privato.
          Resta salvato solo su questo dispositivo/browser.
        </p>
        <input
          className="settings-input"
          type="text"
          placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
          value={clientIdInput}
          onChange={(e) => setClientIdInput(e.target.value)}
        />
        <div>
          <button className="btn btn-primary btn-sm" onClick={saveAndConnect} disabled={!clientIdInput.trim()}>
            Salva e connetti
          </button>
        </div>
      </div>

      <div className="card settings-section">
        <h3>Come ottenere il Client ID (una tantum)</h3>
        <ol className="setup-steps">
          <li>
            Vai su{' '}
            <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">
              Google Cloud Console
            </a>{' '}
            e crea un nuovo progetto (es. "I Miei Pensieri").
          </li>
          <li>
            Menu → <code>API e servizi → Libreria</code>: attiva <code>Google Drive API</code> e{' '}
            <code>Google Docs API</code>.
          </li>
          <li>
            <code>API e servizi → Schermata consenso OAuth</code>: tipo "Esterno", aggiungi te stesso come
            utente di test (basta il tuo indirizzo email).
          </li>
          <li>
            <code>API e servizi → Credenziali → Crea credenziali → ID client OAuth</code>, tipo
            "Applicazione web".
          </li>
          <li>
            In "Origini JavaScript autorizzate" aggiungi l'indirizzo dell'app (es.{' '}
            <code>https://tuoutente.github.io</code>) e anche <code>http://localhost:5173</code> per lo
            sviluppo.
          </li>
          <li>Copia il Client ID generato e incollalo qui sopra.</li>
        </ol>
      </div>
    </div>
  )
}
