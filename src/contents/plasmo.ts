import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"]
}
window.addEventListener("load", () => {
  const indicator = document.createElement("div")
  indicator.style.cssText =
    "position:fixed;top:0;left:0;background:red;color:white;padding:5px;z-index:9999;"
  indicator.textContent = "请求拦截中"
  document.body.appendChild(indicator)
})
