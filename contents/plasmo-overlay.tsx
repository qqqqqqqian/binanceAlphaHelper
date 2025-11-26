import type { PlasmoCSConfig } from "plasmo"

import { useEffect, useState } from "react"

// 配置 Content Script
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

const PlasmoOverlay = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // 监听来自 background 或 popup 的消息
    const messageListener = (
      request: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (request.action === "showNotification") {
        setMessage(request.message || "Hello from Content Script!")
        setIsVisible(true)

        // 3秒后自动隐藏
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)

        sendResponse({ success: true })
      }
      return true
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 999999,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "16px 24px",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        animation: "slideIn 0.3s ease-out",
        maxWidth: "350px"
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>🚀</span>
        <span>{message}</span>
      </div>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  )
}

export default PlasmoOverlay
