export {}

console.log("this is background powered by TMock plasmo")

chrome.runtime.onInstalled.addListener(() => {
  
  // 定义拦截规则：拦截百度，返回"你好"
  const rules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
        redirect: {
          url: "data:text/plain;charset=utf-8,你好！请求被拦截了"
        }
      },
      condition: {
        urlFilter: "*://*.baidu.com/*",
        resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType]
      }
    }
  ];

  // 应用规则
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules
  });
  
  console.log("✅ 拦截规则已设置");
});

// 监听请求完成事件
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

// 监听请求错误事件
chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    console.log("❌ Request failed:", details.url, "Error:", details.error)
  },
  { urls: ["<all_urls>"] }
)