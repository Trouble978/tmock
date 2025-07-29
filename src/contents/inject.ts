import type { PlasmoCSConfig } from "plasmo"
import type { TabData } from '../type/data'

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  run_at: "document_start"
}

const originalFetch = window.fetch
// 暂存
// 使用 Chrome 原生存储 API
async function getStorageData(key: string): Promise<any> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key])
    })
  })
}

// 监听存储变化
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes['browser-extension-tabs-group']) {
    console.log('T-mock: 存储数据已更新', changes['browser-extension-tabs-group'].newValue)
  }
})

window.fetch = async function(...args) {
  const [url, options] = args
  
  console.log("T-mock catch URL:", url.toString())
  
  try {
    const groups: TabData[] = await getStorageData("browser-extension-tabs-group")
    console.log("T-mock Groups:", groups)
    
    if (groups && Array.isArray(groups) && groups.length > 0) {
      // 处理你的 mock 逻辑
      console.log("T-mock: 找到存储数据，可以进行 mock 处理")
    } else {
      console.log("T-mock: 存储数据为空或未初始化")
    }
    
  } catch (error) {
    console.error("T-mock: 获取存储数据失败", error)
  }
  
  return originalFetch.apply(this, args)
}