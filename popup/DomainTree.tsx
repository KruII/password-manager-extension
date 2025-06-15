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
  const groups = group(entries)

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
                <div key={sub}>{sub ? `${sub} - ${e.user}` : e.user}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

