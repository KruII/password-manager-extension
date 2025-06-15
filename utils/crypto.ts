// utils/crypto.ts
// derive key using PBKDF2 to avoid external dependencies

export async function deriveKey(master: string) {
  const enc = new TextEncoder().encode(master)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const baseKey = await crypto.subtle.importKey("raw", enc, "PBKDF2", false, ["deriveKey"])
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encrypt(data: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder().encode(data)
  const buf = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, enc)
  return {iv: Array.from(iv), buf: Array.from(new Uint8Array(buf))}
}

export async function decrypt(enc: {iv: number[], buf: number[]}, key: CryptoKey) {
  const iv = new Uint8Array(enc.iv)
  const buf = new Uint8Array(enc.buf)
  const dec = await crypto.subtle.decrypt({name:"AES-GCM", iv}, key, buf)
  return new TextDecoder().decode(dec)
}
