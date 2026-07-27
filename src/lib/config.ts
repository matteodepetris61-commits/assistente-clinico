const CLIENT_ID_KEY = 'pensieri.googleClientId'

export function getClientId(): string | null {
  return localStorage.getItem(CLIENT_ID_KEY)
}

export function setClientId(clientId: string): void {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim())
}

export function clearClientId(): void {
  localStorage.removeItem(CLIENT_ID_KEY)
}

// drive.file: l'app vede/gestisce solo i file che crea lei stessa (nessun accesso al resto del Drive).
// documents: necessario per creare e aggiornare i Google Docs tematici.
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
].join(' ')

export const APP_FOLDER_NAME = 'I Miei Pensieri (App)'
export const INDEX_FILE_NAME = 'indice.json'
export const COLLECTION_DOC_NAME = 'Raccolta completa'
