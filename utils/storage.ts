// utils/storage.ts

export interface Encrypted {
  iv: number[]
  buf: number[]
}

export interface StoredEntry {
  user: string
  data: Encrypted
  fields?: Record<string, string>
  enabled?: Record<string, boolean>
  selector?: string
}

export interface MasterInfo {
  salt: number[]
  hash: number[]
}

const KEY = "pm-data"
const MASTER_KEY = "pm-master"

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

export async function getMasterInfo(): Promise<MasterInfo | null> {
  const res = await chrome.storage.local.get(MASTER_KEY)
  return res[MASTER_KEY] ?? null
}

export async function setMasterInfo(info: MasterInfo): Promise<void> {
  await chrome.storage.local.set({ [MASTER_KEY]: info })
}

export async function hasAccount(): Promise<boolean> {
  const res = await chrome.storage.local.get(MASTER_KEY)
  return Boolean(res[MASTER_KEY])
}
