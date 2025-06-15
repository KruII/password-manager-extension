// background/index.ts
import { deriveKey, encrypt, decrypt } from "~utils/crypto"
import { getEntries, updateEntry, setEntries } from "~utils/storage"
import { hasAccount, register, verify } from "~utils/auth"

let sessionKey: CryptoKey | null = null

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  ;(async () => {
    switch (msg.cmd) {
      case "has-account": {
        const has = await hasAccount()
        sendResponse({ has })
        break
      }
      case "register": {
        await register(msg.master)
        sessionKey = await deriveKey(msg.master)
        sendResponse({ ok: true })
        break
      }
      case "login": {
        if (await verify(msg.master)) {
          sessionKey = await deriveKey(msg.master)
          sendResponse({ ok: true })
        } else {
          sendResponse({ ok: false })
        }
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
        await updateEntry(msg.host, { user: msg.user, data })
        sendResponse({ ok: true })
        break
      }
      case "list": {
        const entries = await getEntries()
        sendResponse({ entries })
        break
      }
      case "delete-entry": {
        const entries = await getEntries()
        delete entries[msg.host]
        await setEntries(entries)
        sendResponse({ ok: true })
        break
      }
    }
  })()
  return true
})
