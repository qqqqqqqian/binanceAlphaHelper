import { useState, useEffect } from "react"

import styles from "./popup.module.scss"

function IndexPopup() {
  const [count, setCount] = useState(0)
  const [url, setUrl] = useState("")
  const [amount, setAmount] = useState("1100")
  const [loopCount, setLoopCount] = useState("15")
  const [status, setStatus] = useState("就绪")
  const [isRunning, setIsRunning] = useState(false)
  const [totalVolume, setTotalVolume] = useState(0)
  const [roundLoss, setRoundLoss] = useState(0)
  const [currentTradeCount, setCurrentTradeCount] = useState(0)
  const [maxTradeCount, setMaxTradeCount] = useState(15)

  // 从 storage 加载保存的状态
  const loadState = async () => {
    const result = await chrome.storage.local.get([
      "count",
      "amount",
      "loopCount",
      "status",
      "isRunning",
      "totalVolume",
      "roundLoss",
      "currentTradeCount",
      "maxTradeCount"
    ])

    if (result.count !== undefined) setCount(result.count)
    // 只有当 storage 中有值时才加载，否则使用默认值
    if (result.amount !== undefined && result.amount !== "") setAmount(result.amount)
    if (result.loopCount !== undefined && result.loopCount !== "") setLoopCount(result.loopCount)
    if (result.status !== undefined) setStatus(result.status)
    if (result.isRunning !== undefined) setIsRunning(result.isRunning)
    if (result.totalVolume !== undefined) setTotalVolume(result.totalVolume)
    if (result.roundLoss !== undefined) setRoundLoss(result.roundLoss)
    if (result.currentTradeCount !== undefined) setCurrentTradeCount(result.currentTradeCount)
    if (result.maxTradeCount !== undefined) setMaxTradeCount(result.maxTradeCount)
  }

  // 保存状态到 storage
  const saveState = async (newState: any) => {
    await chrome.storage.local.set(newState)
  }

  // 获取当前标签页 URL
  const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.url) {
      setUrl(tab.url)
    }
  }

  // 组件挂载时加载状态和 URL
  useEffect(() => {
    loadState()
    getCurrentTab()

    // 监听 storage 变化，实时同步状态
    const handleStorageChange = (changes: any, namespace: string) => {
      if (namespace === "local") {
        if (changes.count) setCount(changes.count.newValue)
        if (changes.status) setStatus(changes.status.newValue)
        if (changes.isRunning) setIsRunning(changes.isRunning.newValue)
        if (changes.amount) setAmount(changes.amount.newValue)
        if (changes.loopCount) setLoopCount(changes.loopCount.newValue)
        if (changes.totalVolume) setTotalVolume(changes.totalVolume.newValue)
        if (changes.roundLoss) setRoundLoss(changes.roundLoss.newValue)
        if (changes.currentTradeCount) setCurrentTradeCount(changes.currentTradeCount.newValue)
        if (changes.maxTradeCount) setMaxTradeCount(changes.maxTradeCount.newValue)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    // 清理监听器
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const handleStart = async () => {
    const newCount = count + 1
    setIsRunning(true)
    setStatus("运行中...")
    setCount(newCount)
    
    // 保存状态
    await saveState({
      count: newCount,
      status: "运行中...",
      isRunning: true,
      amount,
      loopCount
    })

    // 获取当前标签页并发送消息给 content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: "start",
          amount,
          loopCount
        },
        (response) => {
          // 处理来自 content script 的响应
          if (response && !response.success && response.error) {
            // 如果执行失败，显示错误信息
            setStatus(response.error)
            setIsRunning(false)
            saveState({
              status: response.error,
              isRunning: false
            })
          } else if (response && response.success) {
            // 执行成功
            setStatus("执行完成")
            setIsRunning(false)
            saveState({
              status: "执行完成",
              isRunning: false
            })
          }
        }
      )
    }

    // 发送消息给 background 开始执行
    chrome.runtime.sendMessage({
      action: "start",
      amount,
      loopCount
    })
  }

  const handlePause = async () => {
    setIsRunning(false)
    setStatus("已暂停")
    
    // 保存状态
    await saveState({
      status: "已暂停",
      isRunning: false
    })

    // 获取当前标签页并发送消息给 content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "pause"
      })
    }

    // 发送消息给 background 暂停执行
    chrome.runtime.sendMessage({
      action: "pause"
    })
  }

  // 重置所有数据
  const handleReset = async () => {
    // 立即停止当前任务
    setIsRunning(false)
    
    // 获取当前标签页并发送消息给 content script 重置任务
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "reset"
      })
    }

    // 发送消息给 background 重置执行
    chrome.runtime.sendMessage({
      action: "reset"
    })

    // 重置所有状态
    setCurrentTradeCount(0)
    setTotalVolume(0)
    setRoundLoss(0)
    setStatus("已重置")
    
    // 保存重置后的状态
    await saveState({
      currentTradeCount: 0,
      totalVolume: 0,
      roundLoss: 0,
      status: "已重置",
      isRunning: false
    })

    console.log("✅ 已重置所有数据")
  }

  return (
    <div className={styles.popupContainer}>
      <div className={styles.header}>
        <h1>币安alpha自动刷分v1.0</h1>
        <a 
          href="https://x.com/qian_feifei" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.authorLink}
        >
          作者推特:飞飞要努力🔶BNB丨1000xGEM
        </a>
      </div>

      <div className={styles.content}>
        <div className={styles.infoCard}>
          <h2>设置</h2>
          
          <div className={styles.inputGroup}>
            <label htmlFor="amount" className={styles.label}>
              成交额
            </label>
            <input
              id="amount"
              type="number"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入成交额"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="loopCount" className={styles.label}>
              交易次数
            </label>
            <input
              id="loopCount"
              type="number"
              className={styles.input}
              value={loopCount}
              onChange={(e) => setLoopCount(e.target.value)}
              placeholder="请输入交易次数"
            />
          </div>
        </div>

        <div className={styles.counter}>
          <button onClick={handleStart} className={styles.btnPrimary} disabled={isRunning}>
            开始
          </button>
          <button onClick={handlePause} className={styles.btnPause} disabled={!isRunning}>
            暂停
          </button>
          <button onClick={handleReset} className={styles.btnReset}>
            重置
          </button>
        </div>

        <div className={styles.statusBox}>
          <div className={styles.statusHeader}>
            <span className={styles.statusLabel}>运行状态</span>
            <span className={`${styles.statusIndicator} ${isRunning ? styles.running : ''}`}></span>
          </div>
          <div className={styles.statusContent}>
            <p className={styles.statusText}>{status}</p>
            <p className={styles.statusInfo}>当前交易次数: {currentTradeCount}/{maxTradeCount}</p>
            <p className={styles.statusInfo}>累计交易量: {totalVolume.toFixed(2)}</p>
            <p className={styles.statusInfo}>累计交易损耗: {roundLoss.toFixed(8)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
