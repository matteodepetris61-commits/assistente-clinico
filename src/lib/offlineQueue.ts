import { get, set } from 'idb-keyval'
import type { StoredThought } from './drive'

const QUEUE_KEY = 'pensieri.pendingQueue'

export async function getQueue(): Promise<StoredThought[]> {
  return (await get<StoredThought[]>(QUEUE_KEY)) ?? []
}

export async function enqueue(thought: StoredThought): Promise<void> {
  const queue = await getQueue()
  queue.push(thought)
  await set(QUEUE_KEY, queue)
}

export async function clearFromQueue(ids: string[]): Promise<void> {
  const queue = await getQueue()
  const remaining = queue.filter((t) => !ids.includes(t.id))
  await set(QUEUE_KEY, remaining)
}
