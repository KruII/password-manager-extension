import React, { useState } from "react"
import type { StoredEntry } from "~utils/storage"

interface Props {
  entries: Record<string, StoredEntry>
}

const group = (entries: Record<string, StoredEntry>) => {
  const res: Record<string, Record<string, StoredEntry>> = {}
  for (const [host, e] of Object.entries(entries)) {
    const parts = host.split(".")
    const base = parts.slice(-2).join(".")
    const sub = parts.length > 2 ? parts.slice(0, -2).join(".") : ""
    if (!res[base]) res[base] = {}
    res[base][sub] = e
  }
  return res
}

export default function DomainTree({ entries }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [refresh, setRefresh] = useState(0)
  const groups = group(entries)

  const reload = () => setRefresh((r) => r + 1)

  const remove = (host: string) => {
    chrome.runtime.sendMessage({ cmd: "delete-credentials", host }, reload)
  }

  const updateFields = (host: string, data: StoredEntry) => {
    chrome.runtime.sendMessage(
      {
        cmd: "update-fields",
        host,
        fields: data.fields,
        enabled: data.enabled,
        selector: data.selector
      },
      reload
    )
  }

  return (
    <div>
      {Object.entries(groups).map(([base, subs]) => (
        <div key={base}>
          <div
            style={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={() => setOpen({ ...open, [base]: !open[base] })}
          >
            {base}
          </div>
          {open[base] && (
            <div style={{ marginLeft: 12 }}>
              {Object.entries(subs).map(([sub, e]) => (
                <div key={sub} style={{ marginBottom: 6 }}>
                  <div>
                    {sub ? `${sub} - ${e.user}` : e.user}
                    <button style={{ marginLeft: 6 }} onClick={() => remove(sub ? `${sub}.${base}` : base)}>
                      delete
                    </button>
                    <button
                      style={{ marginLeft: 6 }}
                      onClick={() => {
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                          chrome.tabs.sendMessage(tabs[0].id!, { cmd: 'start-picker' }, (res) => {
                            if (!res) return
                            e.selector = res.selector
                            updateFields(sub ? `${sub}.${base}` : base, e)
                          })
                        })
                      }}
                    >
                      pick field
                    </button>
                  </div>
                  {e.fields && (
                    <div style={{ marginLeft: 10 }}>
                      {Object.entries(e.fields).map(([name, value]) => (
                        <label key={name} style={{ display: 'block' }}>
                          <input
                            type="checkbox"
                            checked={e.enabled?.[name] ?? true}
                            onChange={() => {
                              if (!e.enabled) e.enabled = {}
                              e.enabled[name] = !e.enabled[name]
                              updateFields(sub ? `${sub}.${base}` : base, e)
                            }}
                          />
                          {name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

