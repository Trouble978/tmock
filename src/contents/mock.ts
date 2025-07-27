import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.zhihu.com/"]
}

// 保存原始的 fetch 函数引用
const originalFetch = window.fetch

console.log('请求拦截器已安装',originalFetch)