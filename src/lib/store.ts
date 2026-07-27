import { create } from 'zustand'
import {
  ensureAppFolder,
  readIndex,
  writeIndex,
  appendThoughtToDocs,
  type StoredThought,
} from './drive'
import { classifyThought, getTheme } from './themes'
import { getClientId } from './config'
import { isConnected, requestAccessToken, signOut } from './googleAuth'
import { getQueue, enqueue, clearFromQueue } from './offlineQueue'

export type SyncStatus = 'no-client-id' | 'disconnected' | 'loading' | 'ready' | 'error'

interface PensieriState {
  status: SyncStatus
  error: string | null
  folderId: string | null
  indexFileId: string | null
  thoughts: StoredThought[]
  pendingIds: Set<string>
  syncing: boolean

  init(): Promise<void>
  connect(): Promise<void>
  disconnect(): void
  addThought(text: string): Promise<void>
  retrySync(): Promise<void>
}

function sortNewestFirst(thoughts: StoredThought[]): StoredThought[] {
  return [...thoughts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const usePensieriStore = create<PensieriState>((set, get) => ({
  status: 'no-client-id',
  error: null,
  folderId: null,
  indexFileId: null,
  thoughts: [],
  pendingIds: new Set(),
  syncing: false,

  async init() {
    if (!getClientId()) {
      set({ status: 'no-client-id' })
      return
    }
    const pending = await getQueue()
    if (!isConnected()) {
      set({ status: 'disconnected', thoughts: sortNewestFirst(pending), pendingIds: new Set(pending.map((t) => t.id)) })
      return
    }
    await get().connect()
  },

  async connect() {
    set({ status: 'loading', error: null })
    try {
      await requestAccessToken()
      const folderId = await ensureAppFolder()
      const { fileId, data } = await readIndex(folderId)
      const pending = await getQueue()
      const pendingIds = new Set(pending.map((t) => t.id))
      const merged = [...data.thoughts, ...pending.filter((p) => !data.thoughts.some((t) => t.id === p.id))]
      set({
        status: 'ready',
        folderId,
        indexFileId: fileId,
        thoughts: sortNewestFirst(merged),
        pendingIds,
      })
      void get().retrySync()
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : String(err) })
    }
  },

  disconnect() {
    signOut()
    set({ status: 'disconnected', folderId: null, indexFileId: null })
  },

  async addThought(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const themeId = classifyThought(trimmed)
    const thought: StoredThought = {
      id: crypto.randomUUID(),
      text: trimmed,
      themeId,
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      thoughts: sortNewestFirst([thought, ...state.thoughts]),
      pendingIds: new Set(state.pendingIds).add(thought.id),
    }))

    if (get().status !== 'ready') {
      await enqueue(thought)
      return
    }

    try {
      await syncSingleThought(thought)
      set((state) => {
        const next = new Set(state.pendingIds)
        next.delete(thought.id)
        return { pendingIds: next }
      })
    } catch {
      await enqueue(thought)
    }
  },

  async retrySync() {
    if (get().syncing || get().status !== 'ready') return
    set({ syncing: true })
    try {
      const queue = await getQueue()
      const synced: string[] = []
      for (const thought of queue) {
        try {
          await syncSingleThought(thought)
          synced.push(thought.id)
        } catch {
          // resta in coda, verrà ritentato più tardi
        }
      }
      if (synced.length > 0) {
        await clearFromQueue(synced)
        set((state) => {
          const next = new Set(state.pendingIds)
          synced.forEach((id) => next.delete(id))
          return { pendingIds: next }
        })
      }
    } finally {
      set({ syncing: false })
    }
  },
}))

async function syncSingleThought(thought: StoredThought): Promise<void> {
  const state = usePensieriStore.getState()
  let folderId = state.folderId
  if (!folderId) {
    folderId = await ensureAppFolder()
  }
  const { fileId, data } = await readIndex(folderId)
  if (!data.thoughts.some((t) => t.id === thought.id)) {
    data.thoughts.push(thought)
  }
  const newFileId = await writeIndex(folderId, fileId, data)
  const themeName = getTheme(thought.themeId).name
  await appendThoughtToDocs(folderId, themeName, thought)
  usePensieriStore.setState({ folderId, indexFileId: newFileId })
}
