import React, { useState, useEffect } from "react"
import DomainTree from "~popup/DomainTree"
import type { StoredEntry } from "~utils/storage"

export default function Options() {
  const [host, setHost] = useState("")
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [entries, setEntries] = useState<Record<string, StoredEntry>>({})

  const refresh = () => {
    chrome.runtime.sendMessage({ cmd: "list" }, (res) => {
      if (res?.entries) setEntries(res.entries)
    })
  }

  useEffect(refresh, [])

  const save = () => {
    chrome.runtime.sendMessage(
      { cmd: "save-credentials", host, user, pass },
      () => {
        setHost("")
        setUser("")
        setPass("")
        refresh()
      }
    )
  }

  const gen = () => {
    const arr = crypto.getRandomValues(new Uint8Array(16))
    setPass(btoa(String.fromCharCode(...arr)))
  }

  const remove = (h: string) => {
    chrome.runtime.sendMessage({ cmd: "delete-entry", host: h }, () => {
      const cp = { ...entries }
      delete cp[h]
      setEntries(cp)
    })
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Credential</h2>
      <input
        placeholder="host"
        value={host}
        onChange={(e) => setHost(e.target.value)}
      />
      <input
        placeholder="user"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <input
        placeholder="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <button onClick={gen}>Generate</button>
      <button onClick={save}>Save</button>
      <h2 style={{ marginTop: 20 }}>Stored</h2>
      <DomainTree entries={entries} onDelete={remove} />
    </div>
  )
}

