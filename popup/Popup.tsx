import React, { useEffect, useState } from "react"
import DomainTree from "./DomainTree"

export default function Popup() {
  const [master, setMaster] = useState("")
  const [logged, setLogged] = useState(false)
  const [entries, setEntries] = useState({})

  useEffect(() => {
    if (logged) {
      chrome.runtime.sendMessage({ cmd: "list" }, (res) => {
        if (res?.entries) setEntries(res.entries)
      })
    }
  }, [logged])

  const login = () => {
    chrome.runtime.sendMessage({ cmd: "login", master }, (res) => {
      if (res?.ok) setLogged(true)
    })
  }

  const logout = () => {
    chrome.runtime.sendMessage({ cmd: "logout" }, () => setLogged(false))
  }

  return logged ? (
    <div style={{ minWidth: 200 }}>
      <button onClick={logout}>Logout</button>
      <DomainTree entries={entries} />
    </div>
  ) : (
    <div style={{ minWidth: 200 }}>
      <input
        type="password"
        placeholder="Master password"
        value={master}
        onChange={(e) => setMaster(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  )
}

