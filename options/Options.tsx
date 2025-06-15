import React, { useState } from "react"

export default function Options() {
  const [host, setHost] = useState("")
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")

  const save = () => {
    chrome.runtime.sendMessage(
      { cmd: "save-credentials", host, user, pass },
      () => {
        setHost("")
        setUser("")
        setPass("")
      }
    )
  }

  const gen = () => {
    const arr = crypto.getRandomValues(new Uint8Array(16))
    setPass(btoa(String.fromCharCode(...arr)))
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
    </div>
  )
}

