// content/autofill.ts
chrome.runtime.sendMessage({ cmd: "get-credentials", host: location.hostname }, ({ user, pass }) => {
  if (!user) return
  const u = document.querySelector('input[type="email"],input[name*=user]') as HTMLInputElement
  const p = document.querySelector('input[type="password"]') as HTMLInputElement
  if (u && p) {
    u.value = user
    p.value = pass
  }
  ;(p.form as HTMLFormElement)?.submit()
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.cmd === "get-inputs") {
    const inputs = Array.from(document.querySelectorAll("input")).map((el, i) => ({
      idx: i,
      id: el.id,
      name: (el as HTMLInputElement).name,
      type: (el as HTMLInputElement).type,
      value: (el as HTMLInputElement).value
    }))
    sendResponse({ inputs })
  } else if (msg.cmd === "highlight") {
    const el = document.querySelectorAll("input")[msg.idx] as HTMLElement
    if (el) {
      const old = el.style.outline
      el.style.outline = "2px solid red"
      setTimeout(() => (el.style.outline = old), 1000)
    }
  }
  return true
})
