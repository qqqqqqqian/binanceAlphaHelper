// Background Service Worker for Chrome Extension

console.log("Background Service Worker 已启动")

// 全局运行状态
let isRunning = false
let currentCount = 0

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log("扩展已安装/更新:", details.reason)

  if (details.reason === "install") {
    // 首次安装，初始化状态
    chrome.storage.local.set({
      enabled: true,
      installDate: new Date().toISOString(),
      count: 0,
      status: "就绪",
      isRunning: false,
      amount: "",
      loopCount: ""
    })
  } else if (details.reason === "update") {
    console.log("扩展已更新")
  }
})

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background 收到消息:", request)

  if (request.action === "getData") {
    chrome.storage.local.get(null, (data) => {
      sendResponse({ success: true, data })
    })
    return true // 异步响应
  }

  if (request.action === "start") {
    // 开始执行逻辑
    isRunning = true
    console.log("开始执行，参数:", {
      amount: request.amount,
      loopCount: request.loopCount
    })

    // 这里添加你的实际执行逻辑
    // 例如：定时任务、API 调用等

    sendResponse({ success: true })
    return true
  }

  if (request.action === "pause") {
    // 暂停执行逻辑
    isRunning = false
    console.log("暂停执行")

    sendResponse({ success: true })
    return true
  }

  if (request.action === "showNotification") {
    // 向当前活动标签页发送消息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showNotification",
          message: request.message || "Hello!"
        })
      }
    })
    sendResponse({ success: true })
    return true
  }

  return false
})

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log("标签页加载完成:", tab.url)
  }
})

// 监听标签页激活
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      console.log("当前活动标签页:", tab.url)
    }
  })
})

export {}
