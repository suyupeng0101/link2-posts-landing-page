export function openLoginDialog() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("login-dialog:open"))
}
