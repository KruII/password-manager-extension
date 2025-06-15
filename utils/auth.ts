export interface AuthData {
  salt: number[]
  hash: number[]
}

const KEY = "pm-auth"

async function digest(pass: string, salt: Uint8Array) {
  const enc = new TextEncoder().encode(pass)
  const data = new Uint8Array(enc.length + salt.length)
  data.set(enc)
  data.set(salt, enc.length)
  const buf = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(buf))
}

export async function hasAccount(): Promise<boolean> {
  const res = await chrome.storage.local.get(KEY)
  return !!res[KEY]
}

export async function register(master: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await digest(master, salt)
  await chrome.storage.local.set({ [KEY]: { salt: Array.from(salt), hash } })
}

export async function verify(master: string): Promise<boolean> {
  const res = await chrome.storage.local.get(KEY)
  const data = res[KEY] as AuthData | undefined
  if (!data) return false
  const salt = new Uint8Array(data.salt)
  const hash = await digest(master, salt)
  return hash.every((v, i) => v === data.hash[i])
}

export async function clearAccount(): Promise<void> {
  await chrome.storage.local.remove(KEY)
}
