// content/autofill.ts
chrome.runtime.sendMessage({cmd:"get-credentials", host:location.hostname},
  ({user, pass})=>{
    if (!user) return
    const u = document.querySelector('input[type="email"],input[name*=user]') as HTMLInputElement
    const p = document.querySelector('input[type="password"]') as HTMLInputElement
    if(u&&p){ u.value=user; p.value=pass; }
    // Opcjonalnie automatyczne submit:
    (p.form as HTMLFormElement)?.submit()
})
