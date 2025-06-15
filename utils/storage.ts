// utils/storage.ts

export interface Encrypted {
  iv: number[]
  buf: number[]
}

export interface StoredEntry {
  user: string
  data: Encrypted
}

const KEY = "pm-data"

export async function getEntries(): Promise<Record<string, StoredEntry>> {
  const res = await chrome.storage.local.get(KEY)
  return res[KEY] ?? {}
}

export async function setEntries(data: Record<string, StoredEntry>): Promise<void> {
  await chrome.storage.local.set({[KEY]: data})
}

export async function updateEntry(host: string, entry: StoredEntry): Promise<void> {
  const entries = await getEntries()
  entries[host] = entry
  await setEntries(entries)
}
