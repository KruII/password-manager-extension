import React, { useEffect, useState } from "react"
import DomainTree from "./DomainTree"

export default function Popup() {
  const [master, setMaster] = useState("")
  const [logged, setLogged] = useState(false)
  const [entries, setEntries] = useState({})
  const [hasAccount, setHasAccount] = useState(false)
  const [inputs, setInputs] = useState<any[]>([])
  const [userIdx, setUserIdx] = useState<number | null>(null)
  const [passIdx, setPassIdx] = useState<number | null>(null)

  const refresh = () => {
    chrome.runtime.sendMessage({ cmd: "list" }, (res) => {
      if (res?.entries) setEntries(res.entries)
    })
  }

  useEffect(() => {
    chrome.runtime.sendMessage({ cmd: "has-account" }, (res) => {
      setHasAccount(!!res?.has)
    })
    if (logged) refresh()
  }, [logged])

  const login = () => {
    const cmd = hasAccount ? "login" : "register"
    chrome.runtime.sendMessage({ cmd, master }, (res) => {
      if (res?.ok) setLogged(true)
    })
  }

  const logout = () => {
    chrome.runtime.sendMessage({ cmd: "logout" }, () => setLogged(false))
  }

  const activeTab = (cb: (tab: chrome.tabs.Tab) => void) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) cb(tabs[0])
    })
  }

  const capture = () => {
    activeTab((tab) => {
      if (!tab.id) return
      chrome.tabs.sendMessage(tab.id, { cmd: "get-inputs" }, (res) => {
        setInputs(res?.inputs || [])
      })
    })
  }

  const highlight = (idx: number) => {
    activeTab((tab) => {
      if (tab.id) chrome.tabs.sendMessage(tab.id, { cmd: "highlight", idx })
    })
  }

  const saveCurrent = () => {
    activeTab((tab) => {
      if (!tab.url) return
      const host = new URL(tab.url).hostname
      const user = inputs.find((i) => i.idx === userIdx)?.value || ""
      const pass = inputs.find((i) => i.idx === passIdx)?.value || ""
      chrome.runtime.sendMessage(
        { cmd: "save-credentials", host, user, pass },
        () => {
          setInputs([])
          setUserIdx(null)
          setPassIdx(null)
          refresh()
        }
      )
    })
  }

  const remove = (h: string) => {
    chrome.runtime.sendMessage({ cmd: "delete-entry", host: h }, () => {
      const cp = { ...entries }
      delete cp[h]
      setEntries(cp)
    })
  }

  return logged ? (
    <div style={{ minWidth: 220, padding: 10 }}>
      <button onClick={logout}>Logout</button>
      <button onClick={capture} style={{ marginLeft: 10 }}>
        Capture
      </button>
      {inputs.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {inputs.map((inp) => (
            <div key={inp.idx} onMouseEnter={() => highlight(inp.idx)}>
              <label style={{ marginRight: 8 }}>
                <input
                  type="radio"
                  name="user"
                  checked={userIdx === inp.idx}
                  onChange={() => setUserIdx(inp.idx)}
                />
                U
              </label>
              <label style={{ marginRight: 8 }}>
                <input
                  type="radio"
                  name="pass"
                  checked={passIdx === inp.idx}
                  onChange={() => setPassIdx(inp.idx)}
                />
                P
              </label>
              {inp.name || inp.id || `input ${inp.idx}`}
            </div>
          ))}
          <button onClick={saveCurrent} disabled={userIdx === null || passIdx === null}>
            Save
          </button>
        </div>
      )}
      <DomainTree entries={entries} onDelete={remove} />
    </div>
  ) : (
    <div style={{ minWidth: 200, padding: 10 }}>
      <input
        type="password"
        placeholder={hasAccount ? "Master password" : "Create password"}
        value={master}
        onChange={(e) => setMaster(e.target.value)}
      />
      <button onClick={login}>{hasAccount ? "Login" : "Create"}</button>
    </div>
  )
}

