# I Miei Pensieri 🧠

App privata e personale per raccogliere i tuoi pensieri: li scrivi, vengono **classificati
automaticamente per tema**, raccolti in un'unica cronologia e allo stesso tempo in **documenti
Google Docs specifici per tema**, con una **mappa mentale** che funziona da indice visivo.
Funziona sul telefono (installabile come app, PWA) e da PC via browser, con copia rapida negli
appunti ed esportazione stampabile in **Word (.docx)**.

I tuoi dati vivono esclusivamente nel tuo Google Drive personale: l'app non ha alcun server o
database proprio. Nessun altro (nemmeno chi ospita l'app) può leggerli.

## Come funziona

- Scrivi un pensiero → viene classificato in automatico in uno di questi temi: Lavoro, Famiglia,
  Relazioni, Salute, Progetti & Idee, Obiettivi, Emozioni, Varie (vedi `src/lib/themes.ts` per le
  parole chiave usate).
- Ogni pensiero viene salvato in `indice.json` dentro una cartella **"I Miei Pensieri (App)"** nel
  tuo Google Drive, e aggiunto sia al Google Doc **"Raccolta completa"** sia al Google Doc del suo
  tema (es. **"Tema - Lavoro"**), che puoi aprire e leggere anche dall'app Google Docs, su
  qualsiasi dispositivo.
- La mappa mentale mostra un nodo per tema (dimensione proporzionale al numero di pensieri):
  toccandolo apre il documento di quel tema.
- Da ogni vista puoi copiare un singolo pensiero o l'intero documento negli appunti, oppure
  esportarlo come file Word pronto per la stampa.
- Se scrivi offline, il pensiero resta in coda sul dispositivo e viene sincronizzato
  automaticamente appena torna la connessione.

## Configurazione (una tantum, la fai tu perché serve il tuo account Google)

L'app usa il tuo Google Drive, quindi serve un Client ID OAuth creato nel **tuo** progetto Google
Cloud (gratuito). Non è possibile automatizzare questo passaggio da remoto perché richiede il tuo
login Google.

1. Vai su [Google Cloud Console](https://console.cloud.google.com/) e crea un nuovo progetto (es.
   "I Miei Pensieri").
2. `API e servizi → Libreria`: attiva **Google Drive API** e **Google Docs API**.
3. `API e servizi → Schermata consenso OAuth`: tipo "Esterno", aggiungi te stesso come utente di
   test (basta il tuo indirizzo email — l'app resta privata, nessun altro potrà collegarsi).
4. `API e servizi → Credenziali → Crea credenziali → ID client OAuth`, tipo "Applicazione web".
5. In "Origini JavaScript autorizzate" aggiungi l'URL dove pubblicherai l'app (es.
   `https://<tuo-utente-github>.github.io`) e, per lo sviluppo locale, `http://localhost:5173`.
6. Copia il Client ID generato: lo incollerai nella schermata **Impostazioni** dell'app stessa (resta
   salvato solo nel browser che usi, non nel codice).

## Sviluppo locale

```bash
npm install
npm run dev
```

## Deploy su GitHub Pages (accesso da PC e da telefono)

Il repository include un workflow GitHub Actions (`.github/workflows/deploy.yml`) che builda e
pubblica l'app su GitHub Pages ad ogni push sul branch `main`.

Per attivarlo (una tantum):

1. Nel repository GitHub: `Settings → Pages → Build and deployment → Source` → seleziona
   **GitHub Actions**.
2. Fai il merge di questo branch su `main` (o esegui manualmente il workflow da `Actions →
   Deploy su GitHub Pages → Run workflow`).
3. Dopo il primo deploy l'app sarà raggiungibile su
   `https://<tuo-utente-github>.github.io/i-miei-pensieri/`.
4. Apri quell'indirizzo da telefono e usa "Aggiungi a schermata Home" (Safari/Chrome) per
   installarla come app; da PC basta il browser.
5. Vai in **Impostazioni** dentro l'app e incolla il Client ID Google (vedi sopra).

Se pubblichi altrove o con un percorso diverso da `/i-miei-pensieri/`, imposta la variabile
d'ambiente `VITE_BASE_PATH` in fase di build (es. `VITE_BASE_PATH=/ npm run build` per servire dalla
radice di un dominio).

## Privacy

- Nessun server terzo: solo Google Drive/Docs del tuo account.
- Scope OAuth `drive.file`: l'app può leggere/scrivere **solo** i file che crea lei stessa, non
  l'intero Drive.
- Il Client ID e il token di accesso restano solo sul tuo dispositivo (localStorage/sessionStorage
  del browser).
