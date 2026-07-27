import { getAccessToken } from './googleAuth'
import { APP_FOLDER_NAME, COLLECTION_DOC_NAME, INDEX_FILE_NAME } from './config'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const DOCS_API = 'https://docs.googleapis.com/v1'

export interface StoredThought {
  id: string
  text: string
  themeId: string
  createdAt: string // ISO
}

export interface IndexData {
  version: 1
  thoughts: StoredThought[]
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken()
  return { Authorization: `Bearer ${token}` }
}

async function driveRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = { ...(await authHeaders()), ...(init.headers ?? {}) }
  const res = await fetch(`${DRIVE_API}${path}`, { ...init, headers })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Drive API error ${res.status}: ${body}`)
  }
  return res
}

async function docsRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...(init.headers ?? {}),
  }
  const res = await fetch(`${DOCS_API}${path}`, { ...init, headers })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Docs API error ${res.status}: ${body}`)
  }
  return res
}

function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

async function findFile(query: string): Promise<{ id: string; name: string } | null> {
  const q = encodeURIComponent(query)
  const res = await driveRequest(
    `/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=10`,
  )
  const data = (await res.json()) as { files: { id: string; name: string }[] }
  return data.files[0] ?? null
}

export async function ensureAppFolder(): Promise<string> {
  const name = escapeQueryValue(APP_FOLDER_NAME)
  const existing = await findFile(
    `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false and 'root' in parents`,
  )
  if (existing) return existing.id

  const res = await driveRequest('/files?fields=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root'],
    }),
  })
  const data = (await res.json()) as { id: string }
  return data.id
}

function buildMultipartBody(
  metadata: Record<string, unknown>,
  content: string,
  contentType: string,
): { body: string; boundary: string } {
  const boundary = `pensieri-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${contentType}\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`
  return { body, boundary }
}

async function createFileWithContent(
  name: string,
  parentId: string,
  content: string,
  contentType: string,
): Promise<string> {
  const { body, boundary } = buildMultipartBody(
    { name, parents: [parentId] },
    content,
    contentType,
  )
  const headers = {
    ...(await authHeaders()),
    'Content-Type': `multipart/related; boundary=${boundary}`,
  }
  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers,
    body,
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Drive upload error ${res.status}: ${errBody}`)
  }
  const data = (await res.json()) as { id: string }
  return data.id
}

async function updateFileContent(fileId: string, content: string): Promise<void> {
  const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' }
  const res = await fetch(`${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers,
    body: content,
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Drive update error ${res.status}: ${errBody}`)
  }
}

export async function readIndex(folderId: string): Promise<{ fileId: string | null; data: IndexData }> {
  const name = escapeQueryValue(INDEX_FILE_NAME)
  const existing = await findFile(
    `name='${name}' and trashed=false and '${folderId}' in parents`,
  )
  if (!existing) {
    return { fileId: null, data: { version: 1, thoughts: [] } }
  }
  const res = await driveRequest(`/files/${existing.id}?alt=media`)
  const data = (await res.json()) as IndexData
  return { fileId: existing.id, data }
}

export async function writeIndex(
  folderId: string,
  fileId: string | null,
  data: IndexData,
): Promise<string> {
  const content = JSON.stringify(data, null, 2)
  if (fileId) {
    await updateFileContent(fileId, content)
    return fileId
  }
  return createFileWithContent(INDEX_FILE_NAME, folderId, content, 'application/json')
}

async function moveToFolder(fileId: string, folderId: string): Promise<void> {
  await driveRequest(`/files/${fileId}?addParents=${folderId}&removeParents=root`, {
    method: 'PATCH',
  })
}

async function createGoogleDoc(title: string, folderId: string): Promise<string> {
  const res = await docsRequest('/documents', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
  const data = (await res.json()) as { documentId: string }
  await moveToFolder(data.documentId, folderId)
  return data.documentId
}

async function findGoogleDoc(name: string, folderId: string): Promise<string | null> {
  const escaped = escapeQueryValue(name)
  const existing = await findFile(
    `name='${escaped}' and mimeType='application/vnd.google-apps.document' and trashed=false and '${folderId}' in parents`,
  )
  return existing?.id ?? null
}

async function appendToDoc(documentId: string, text: string): Promise<void> {
  const res = await docsRequest(`/documents/${documentId}?fields=body(content(endIndex))`)
  const doc = (await res.json()) as { body: { content: { endIndex: number }[] } }
  const content = doc.body.content
  const endIndex = content.length > 0 ? content[content.length - 1].endIndex - 1 : 1
  const insertIndex = Math.max(endIndex, 1)

  await docsRequest(`/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{ insertText: { location: { index: insertIndex }, text } }],
    }),
  })
}

export async function ensureThemeDoc(
  folderId: string,
  themeName: string,
): Promise<string> {
  const docName = `Tema - ${themeName}`
  const existing = await findGoogleDoc(docName, folderId)
  if (existing) return existing
  const documentId = await createGoogleDoc(docName, folderId)
  await appendToDoc(documentId, `${docName}\n${'—'.repeat(30)}\n\n`)
  return documentId
}

export async function ensureCollectionDoc(folderId: string): Promise<string> {
  const existing = await findGoogleDoc(COLLECTION_DOC_NAME, folderId)
  if (existing) return existing
  const documentId = await createGoogleDoc(COLLECTION_DOC_NAME, folderId)
  await appendToDoc(documentId, `${COLLECTION_DOC_NAME}\n${'—'.repeat(30)}\n\n`)
  return documentId
}

function formatEntry(thought: StoredThought): string {
  const date = new Date(thought.createdAt)
  const formatted = date.toLocaleString('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  return `[${formatted}]\n${thought.text}\n\n`
}

export async function appendThoughtToDocs(
  folderId: string,
  themeName: string,
  thought: StoredThought,
): Promise<void> {
  const [themeDocId, collectionDocId] = await Promise.all([
    ensureThemeDoc(folderId, themeName),
    ensureCollectionDoc(folderId),
  ])
  const entry = formatEntry(thought)
  await Promise.all([appendToDoc(themeDocId, entry), appendToDoc(collectionDocId, entry)])
}

export async function getDocWebLink(folderId: string, docName: string): Promise<string | null> {
  const escaped = escapeQueryValue(docName)
  const existing = await findFile(
    `name='${escaped}' and mimeType='application/vnd.google-apps.document' and trashed=false and '${folderId}' in parents`,
  )
  return existing ? `https://docs.google.com/document/d/${existing.id}/edit` : null
}
