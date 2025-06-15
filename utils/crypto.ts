// utils/crypto.ts
import {argon2id} from "argon2-browser"

export async function deriveKey(master: string) {
  const {hash} = await argon2id({
    pass: master,
    salt: await crypto.getRandomValues(new Uint8Array(16)),
    time: 3, mem: 2**16, hashLen: 32, parallelism: 1
  })
  return crypto.subtle.importKey(
    "raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]
  )
}

export async function encrypt(data: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder().encode(data)
  const buf = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, enc)
  return {iv: Array.from(iv), buf: Array.from(new Uint8Array(buf))}
}
