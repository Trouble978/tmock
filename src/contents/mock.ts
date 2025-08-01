// src/contents/mock.ts
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_start"
}

export {}

console.log('Mock interceptor loaded!')

// 保存原始的方法引用
const originalXHR = window.XMLHttpRequest
const originalFetch = window.fetch

// 重写 XMLHttpRequest
window.XMLHttpRequest = function() {
  const xhr = new originalXHR()
  
  // 保存原始的open和send方法
  const originalOpen = xhr.open
  const originalSend = xhr.send
  
  // 存储请求信息
  let method: string
  let url: string
  let requestBody: any
  
  // 重写open方法
  xhr.open = function(...args: any[]) {
    method = args[0]
    url = args[1]
    console.log(`[XHR] 请求方法: ${method}, URL: ${url}`)
    
    // 调用原始的open方法
    return originalOpen.apply(xhr, args)
  }
  
  // 重写send方法
  xhr.send = function(body?: any) {
    requestBody = body
    console.log(`[XHR] 请求体:`, body)
    
    // 监听响应
    xhr.addEventListener('load', function() {
      console.log(`[XHR] 响应状态: ${xhr.status}`)
      console.log(`[XHR] 响应内容:`, xhr.responseText)
    })
    
    // 调用原始的send方法
    return originalSend.call(xhr, body)
  }
  
  return xhr
} as any

// 重写 fetch
window.fetch = async function(...args: any[]) {
  const [input, init] = args
  
  // 获取URL
  const url = typeof input === 'string' ? input : input.url
  
  // 获取请求方法
  const method = init?.method || 'GET'
  
  // 获取请求体
  let requestBody = init?.body
  
  console.log(`[Fetch] T-mock 请求方法: ${method}, URL: ${url}`)
  console.log(`[Fetch] T-mock 请求体:`, requestBody)
  
  // 如果是FormData或其他特殊类型，尝试转换
  if (requestBody instanceof FormData) {
    const formDataObj: Record<string, any> = {}
    for (const [key, value] of requestBody.entries()) {
      formDataObj[key] = value
    }
    console.log(`[Fetch] T-mock FormData内容:`, formDataObj)
  }
  
  try {
    // 调用原始的fetch
    const response = await originalFetch.apply(window, args)
    
    // 克隆响应以便读取内容
    const clonedResponse = response.clone()
    
    // 尝试读取响应内容
    try {
      const responseText = await clonedResponse.text()
      console.log(`[Fetch] T-mock 响应状态: ${response.status}`)
      console.log(`[Fetch] T-mock 响应内容:`, responseText)
      
      // 尝试解析为JSON
      try {
        const responseJson = JSON.parse(responseText)
        console.log(`[Fetch] T-mock 响应JSON:`, responseJson)
      } catch (e) {
        // 不是JSON格式，忽略
      }
    } catch (e) {
      console.log(`[Fetch] T-mock 无法读取响应内容`)
    }
    
    return response
  } catch (error) {
    console.error(`[Fetch] T-mock 请求失败:`, error)
    throw error
  }
}

console.log('请求拦截器初始化完成！')