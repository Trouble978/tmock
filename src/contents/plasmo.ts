import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*", "https://www.baidu.com/"]
}
// 保存原始的 fetch 函数引用
const originalFetch = window.fetch

console.log("请求拦截器已安装", originalFetch)
window.addEventListener("load", () => {
  console.log("content script loaded")
  const indicator = document.createElement("div")
  indicator.style.cssText =
    "position:fixed;top:0;left:0;background:red;color:white;padding:5px;z-index:9999;"
  console.log("请求拦截器已安装", originalFetch)
  indicator.textContent = "请求拦截中"
  document.body.appendChild(indicator)
})
