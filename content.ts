// content script for autofill and capture

function collectInputs(form?: HTMLFormElement) {
  const inputs = Array.from((form || document).querySelectorAll('input')) as HTMLInputElement[]
  const fields: Record<string, string> = {}
  const enabled: Record<string, boolean> = {}
  inputs.forEach((input, idx) => {
    const name = input.name || input.id || `field${idx}`
    fields[name] = input.value
    enabled[name] = true
  })
  return { fields, enabled }
}

function autofill(user: string, pass: string, selector?: string) {
  let u = document.querySelector('input[type="email"],input[name*=user]') as HTMLInputElement | null
  let p = document.querySelector('input[type="password"]') as HTMLInputElement | null
  if (selector) {
    const el = document.querySelector(selector) as HTMLInputElement | null
    if (el) p = el
  }
  if (u && p) {
    u.value = user
    p.value = pass
    ;(p.form as HTMLFormElement)?.submit()
  }
}

chrome.runtime.sendMessage({ cmd: 'get-credentials', host: location.hostname }, ({ user, pass, selector }) => {
  if (user && pass) autofill(user, pass, selector)
})

document.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement
  const { fields, enabled } = collectInputs(form)
  const userInput = form.querySelector('input[type="email"],input[name*=user]') as HTMLInputElement | null
  const passInput = form.querySelector('input[type="password"]') as HTMLInputElement | null
  if (!userInput || !passInput) return
  chrome.runtime.sendMessage({
    cmd: 'save-credentials',
    host: location.hostname,
    user: userInput.value,
    pass: passInput.value,
    fields,
    enabled
  })
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.cmd === 'capture-fields') {
    const { fields } = collectInputs()
    sendResponse({ fields })
  } else if (msg.cmd === 'start-picker') {
    startPicker(sendResponse)
    return true
  }
})

function cssPath(el: HTMLElement) {
  const path = []
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase()
    if (el.id) {
      selector += '#' + el.id
      path.unshift(selector)
      break
    } else {
      let sib = el, nth = 1
      while ((sib = sib.previousElementSibling as HTMLElement)) {
        if (sib.nodeName.toLowerCase() === selector) nth++
      }
      selector += `:nth-of-type(${nth})`
    }
    path.unshift(selector)
    el = el.parentElement as HTMLElement
  }
  return path.join(' > ')
}

function startPicker(cb: (res: any) => void) {
  const highlight = document.createElement('style')
  highlight.innerHTML = `.pm-picker-highlight{outline:2px solid red !important;}`
  document.head.appendChild(highlight)
  const over = (e: Event) => {
    if (e.target instanceof HTMLElement) e.target.classList.add('pm-picker-highlight')
  }
  const out = (e: Event) => {
    if (e.target instanceof HTMLElement) e.target.classList.remove('pm-picker-highlight')
  }
  const click = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    cleanup()
    if (e.target instanceof HTMLElement) {
      const sel = cssPath(e.target)
      cb({ selector: sel })
    } else {
      cb({})
    }
  }
  function cleanup() {
    document.removeEventListener('mouseover', over, true)
    document.removeEventListener('mouseout', out, true)
    document.removeEventListener('click', click, true)
    highlight.remove()
  }
  document.addEventListener('mouseover', over, true)
  document.addEventListener('mouseout', out, true)
  document.addEventListener('click', click, true)
}

