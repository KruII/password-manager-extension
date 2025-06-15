// background/index.ts
import { deriveKey, encrypt, decrypt, hashMaster } from "~utils/crypto"
import {
  getEntries,
  updateEntry,
  getMasterInfo,
  setMasterInfo,
  hasAccount,
  setEntries
} from "~utils/storage"

let sessionKey: CryptoKey | null = null
let sessionSalt: Uint8Array | null = null

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  ;(async () => {
    switch (msg.cmd) {
      case "has-account": {
        sendResponse({ exists: await hasAccount() })
        break
      }
      case "signup": {
        if (await hasAccount()) {
          sendResponse({ ok: false })
          break
        }
        sessionSalt = crypto.getRandomValues(new Uint8Array(16))
        const hash = await hashMaster(msg.master, sessionSalt)
        await setMasterInfo({ salt: Array.from(sessionSalt), hash })
        sessionKey = await deriveKey(msg.master, sessionSalt)
        sendResponse({ ok: true })
        break
      }
      case "login": {
        const info = await getMasterInfo()
        if (!info) {
          sendResponse({ ok: false })
          break
        }
        sessionSalt = new Uint8Array(info.salt)
        const hash = await hashMaster(msg.master, sessionSalt)
        const match = hash.every((b, i) => b === info.hash[i])
        if (!match) {
          sendResponse({ ok: false })
          break
        }
        sessionKey = await deriveKey(msg.master, sessionSalt)
        sendResponse({ ok: true })
        break
      }
      case "logout": {
        sessionKey = null
        sendResponse({ ok: true })
        break
      }
      case "get-credentials": {
        if (!sessionKey) {
          sendResponse({})
          break
        }
        const entries = await getEntries()
        const entry = entries[msg.host]
        if (entry) {
          const pass = await decrypt(entry.data, sessionKey)
          sendResponse({ user: entry.user, pass })
        } else {
          sendResponse({})
        }
        break
      }
      case "save-credentials": {
        if (!sessionKey) {
          sendResponse({ ok: false })
          break
        }
        const data = await encrypt(msg.pass, sessionKey)
        await updateEntry(msg.host, {
          user: msg.user,
          data,
          fields: msg.fields,
          enabled: msg.enabled,
          selector: msg.selector
        })
        sendResponse({ ok: true })
        break
      }
      case "list": {
        const entries = await getEntries()
        sendResponse({ entries })
        break
      }
      case "delete-credentials": {
        const entries = await getEntries()
        delete entries[msg.host]
        await setEntries(entries)
        sendResponse({ ok: true })
        break
      }
      case "update-fields": {
        const entries = await getEntries()
        const e = entries[msg.host]
        if (e) {
          e.fields = msg.fields
          e.enabled = msg.enabled
          e.selector = msg.selector
          await updateEntry(msg.host, e)
        }
        sendResponse({ ok: true })
        break
      }
    }
  })()
  return true
})
