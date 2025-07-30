export {}

console.log("this is background powered by TMock plasmo")

// 等待 chrome API 初始化完成
// function initializeWebRequestListener() {
//   try {
//     // 检查 chrome.webRequest 是否可用
//     if (
//       typeof chrome !== "undefined" &&
//       chrome.webRequest &&
//       chrome.webRequest.onBeforeRequest
//     ) {
//       console.log("Chrome WebRequest API is available")

//       // 拦截百度相关请求
//       chrome.webRequest.onBeforeRequest.addListener(
//         (details) => {
//           console.log("🚫 Intercepting Baidu request:", details.url)

//           // 返回自定义响应 "你好"
//           return {
//             redirectUrl: `data:text/html;charset=utf-8,${encodeURIComponent(`
//               <!DOCTYPE html>
//               <html>
//               <head>
//                 <meta charset="UTF-8">
//                 <title>TMock 拦截</title>
//                 <style>
//                   body {
//                     font-family: Arial, sans-serif;
//                     display: flex;
//                     justify-content: center;
//                     align-items: center;
//                     height: 100vh;
//                     margin: 0;
//                     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                     color: white;
//                   }
//                   .container {
//                     text-align: center;
//                     padding: 40px;
//                     background: rgba(255, 255, 255, 0.1);
//                     border-radius: 20px;
//                     backdrop-filter: blur(10px);
//                     box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
//                   }
//                   h1 {
//                     font-size: 3em;
//                     margin-bottom: 20px;
//                     text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
//                   }
//                   p {
//                     font-size: 1.2em;
//                     opacity: 0.9;
//                   }
//                 </style>
//               </head>
//               <body>
//                 <div class="container">
//                   <h1>你好 👋</h1>
//                   <p>此请求已被 TMock 插件拦截</p>
//                   <p>原始URL: ${details.url}</p>
//                 </div>
//               </body>
//               </html>
//             `)}`
//           }
//         },
//         {
//           urls: [
//             "*://*.baidu.com/*",
//             "*://baidu.com/*",
//             "*://*.bdstatic.com/*",
//             "*://*.baidubce.com/*"
//           ]
//         },
//         ["blocking"] // 必须包含 "blocking" 才能修改请求
//       )

//       // 也可以拦截其他百度相关的API请求，返回JSON响应
//       chrome.webRequest.onBeforeRequest.addListener(
//         (details) => {
//           console.log("🚫 Intercepting Baidu API request:", details.url)

//           // 如果是API请求，返回JSON格式的 "你好"
//           if (details.url.includes("/api/") || details.url.includes("json")) {
//             return {
//               redirectUrl: `data:application/json;charset=utf-8,${encodeURIComponent(
//                 JSON.stringify({
//                   message: "你好",
//                   status: "intercepted_by_tmock",
//                   original_url: details.url,
//                   timestamp: new Date().toISOString()
//                 })
//               )}`
//             }
//           }

//           // 其他请求返回简单文本
//           return {
//             redirectUrl: `data:text/plain;charset=utf-8,${encodeURIComponent("你好")}`
//           }
//         },
//         {
//           urls: [
//             "*://*.baidu.com/api/*",
//             "*://baidu.com/api/*",
//             "*://*.baidu.com/*/api/*"
//           ]
//         },
//         ["blocking"]
//       )

//       // 监听所有请求以便调试
//       chrome.webRequest.onBeforeRequest.addListener(
//         (details) => {
//           if (details.url.includes("baidu")) {
//             console.log("🔍 Detected Baidu request:", details.url)
//           }
//         },
//         { urls: ["<all_urls>"] }
//       )

//       console.log("✅ WebRequest listeners set up successfully")
//     } else {
//       console.error("Chrome WebRequest API is not available")
//       // 延迟重试
//       setTimeout(initializeWebRequestListener, 1000)
//     }
//   } catch (error) {
//     console.error("Error initializing WebRequest listener:", error)
//     // 延迟重试
//     setTimeout(initializeWebRequestListener, 1000)
//   }
// }

// 立即尝试初始化
// initializeWebRequestListener()
// 监听所有请求以便调试
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log("[WEBREQUEST] Intercepting:", details.url); // 调试日志
  },
  { urls: ["<all_urls>"] },["blocking"]
);
// 监听请求完成事件（可选）
chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log(
      "✅ Request completed:",
      details.url,
      "Status:",
      details.statusCode
    )
  },
  { urls: ["<all_urls>"] }
)

// 监听请求错误事件（可选）
chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    console.log("❌ Request failed:", details.url, "Error:", details.error)
  },
  { urls: ["<all_urls>"] }
)
