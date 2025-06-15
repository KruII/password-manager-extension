import React, { useEffect, useState } from "react"
import DomainTree from "./DomainTree"

export default function Popup() {
  const [master, setMaster] = useState("")
  const [logged, setLogged] = useState(false)
  const [hasAccount, setHasAccount] = useState(true)
  const [entries, setEntries] = useState({})

  useEffect(() => {
    chrome.runtime.sendMessage({ cmd: "has-account" }, (res) => {
      setHasAccount(res?.exists)
    })
    if (logged) {
      chrome.runtime.sendMessage({ cmd: "list" }, (res) => {
        if (res?.entries) setEntries(res.entries)
      })
    }
  }, [logged])

  const login = () => {
    chrome.runtime.sendMessage({ cmd: hasAccount ? "login" : "signup", master }, (res) => {
      if (res?.ok) setLogged(true)
    })
  }

  const logout = () => {
    chrome.runtime.sendMessage({ cmd: "logout" }, () => setLogged(false))
  }

  return logged ? (
    <div style={{ minWidth: 220, padding: 10 }}>
      <button onClick={logout}>Logout</button>
      <DomainTree entries={entries} />
    </div>
  ) : (
    <div style={{ minWidth: 220, padding: 10 }}>
      <input
        type="password"
        placeholder="Master password"
        value={master}
        onChange={(e) => setMaster(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={login}>{hasAccount ? "Login" : "Sign Up"}</button>
    </div>
  )
}

