import type { PlasmoCSConfig } from "plasmo"

// 仅在币安 Alpha 页面运行
export const config: PlasmoCSConfig = {
  matches: ["https://www.binance.com/zh-CN/alpha*"],
  all_frames: false
}

console.log("币安 Alpha 自动脚本已加载")

// 查找目标 DOM 节点的函数
function findTargetElement() {
  // 使用 XPath 查找包含"成交记录"文本的 div 元素
  const xpath = './/div[contains(text(), "成交记录")]'
  const result = document.evaluate(
    xpath,
    document.body,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )

  const tradeRecordDiv = result.singleNodeValue as HTMLElement

  if (!tradeRecordDiv) {
    return null
  }

  // 获取其父元素的父元素的父元素
  let parentElement: HTMLElement | null = tradeRecordDiv.parentElement
  
  if (!parentElement) {
    return null
  }
  
  parentElement = parentElement.parentElement
  if (!parentElement) {
    return null
  }
  
  parentElement = parentElement.parentElement
  if (!parentElement) {
    return null
  }

  // 在父元素的父元素的父元素的子元素中查找 ReactVirtualized__Grid__innerScrollContainer
  const container = parentElement.querySelector(
    ".ReactVirtualized__Grid__innerScrollContainer"
  ) as HTMLElement

  if (!container) {
    return null
  }

  // 获取容器下的第一个子节点
  const firstChild = container.children[0]
  if (!firstChild) {
    return null
  }

  // 获取第一个子节点下的第二个子节点（价格）
  const secondGrandChild = firstChild.children[1]
  if (!secondGrandChild) {
    return null
  }

  // 获取第一个子节点下的第三个子节点（数量）
  const thirdGrandChild = firstChild.children[2]
  if (!thirdGrandChild) {
    return null
  }

  return { priceElement: secondGrandChild, quantityElement: thirdGrandChild }
}

// 查找包含"反向订单"文本的节点
function findReverseOrderNode() {
  // 使用 XPath 查找包含"反向订单"文本的所有元素
  const xpath = "//*[contains(text(), '反向订单')]"
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )

  const targetNode = result.singleNodeValue as HTMLElement | null
  if (!targetNode) {
    console.log("未找到包含'反向订单'的节点")
    return null
  }
  // 获取父节点的父节点的父节点
  let parent: HTMLElement | null = targetNode
  for (let i = 1; i <= 3; i++) {
    parent = parent?.parentElement
    if (!parent) {
      console.log(`没有第${i}层父节点`)
      return null
    }
  }
  // 获取第三层父节点的第一个子节点
  const firstChild = parent.children[0]
  if (!firstChild) {
    console.log("第三层父节点没有子节点")
    return null
  }
  return firstChild
}

// 抽取限价面板节点（反向订单节点的第6层父节点）
function findLimitPanelNode() {
  const xpath = "//*[contains(text(), '反向订单')]"
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )
  const targetNode = result.singleNodeValue as HTMLElement | null
  if (!targetNode) {
    console.log("未找到包含'反向订单'的节点")
    return null
  }
  let parent: HTMLElement | null = targetNode
  for (let i = 1; i <= 6; i++) {
    parent = parent?.parentElement
    if (!parent) {
      console.log(`没有第${i}层父节点 (限价面板)`)
      return null
    }
  }
  return parent
}

// 检查元素是否为已选中的 checkbox
function isCheckboxChecked(element: Element): boolean {
  const elem = element as HTMLElement

  // 1. 如果是原生 input[type=checkbox]
  if (elem instanceof HTMLInputElement && elem.type === "checkbox") {
    return elem.checked
  }

  // 2. 检查 ARIA 属性：role=checkbox + aria-checked
  const role = elem.getAttribute("role")
  const ariaChecked = elem.getAttribute("aria-checked")
  if (role === "checkbox" && ariaChecked !== null) {
    return ariaChecked === "true"
  }

  // 3. 检查常见的选中状态类名
  const className = elem.className || ""
  if (typeof className === "string") {
    if (className.includes("checked") || className.includes("is-checked")) {
      return true
    }
  }

  // 4. 在元素内部查找 input[type=checkbox]
  const innerInput = elem.querySelector<HTMLInputElement>(
    'input[type="checkbox"]'
  )
  if (innerInput) {
    return innerInput.checked
  }

  // 5. 在元素内部查找 ARIA checkbox
  const innerAria = elem.querySelector<HTMLElement>('[role="checkbox"]')
  if (innerAria) {
    const innerAriaChecked = innerAria.getAttribute("aria-checked")
    if (innerAriaChecked !== null) {
      return innerAriaChecked === "true"
    }
  }

  return false
}

// 模拟点击元素
function clickElement(element: Element): void {
  const elem = element as HTMLElement

  // 触发完整的点击事件序列，模拟真实用户操作
  try {
    // 触发 mousedown
    elem.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true })
    )

    // 触发 mouseup
    elem.dispatchEvent(
      new MouseEvent("mouseup", { bubbles: true, cancelable: true })
    )

    // 触发 click
    elem.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true })
    )
  } catch (error) {
    console.error("❌ 点击元素时出错:", error)
  }
}

// 确保"反向订单" checkbox 被选中
function ensureReverseOrderChecked(): {
  found: boolean
  wasChecked?: boolean
  isChecked?: boolean
  clicked?: boolean
} {
  const node = findReverseOrderNode()

  if (!node) {
    console.log("❌ 未找到'反向订单'节点")
    return { found: false }
  }

  // 检查当前是否已选中
  const wasChecked = isCheckboxChecked(node)
  console.log(
    `📋 '反向订单' checkbox 当前状态: ${wasChecked ? "✅ 已选中" : "⬜ 未选中"}`
  )

  if (wasChecked) {
    console.log("✅ '反向订单'已经是选中状态，无需操作")
    return {
      found: true,
      wasChecked: true,
      isChecked: true,
      clicked: false
    }
  }

  // 未选中，需要点击
  console.log("🖱️  '反向订单'未选中，正在模拟点击...")
  clickElement(node)

  // 等待一小段时间后再次检查状态
  setTimeout(() => {
    const isCheckedNow = isCheckboxChecked(node)
    console.log(`🔄 点击后状态: ${isCheckedNow ? "✅ 已选中" : "⚠️ 仍未选中"}`)
  }, 100)

  return {
    found: true,
    wasChecked: false,
    isChecked: true, // 假设点击成功
    clicked: true
  }
}

// 价格历史记录，存储 {timestamp, price, quantity, side} 对象
interface PriceRecord {
  timestamp: number
  price: number
  quantity: number
  side: "buy" | "sell"
}
const priceHistory: PriceRecord[] = []

// 全局标志：是否正在执行交易
let isExecutingTrade = false
// 全局标志：是否启用自动交易
let autoTradeEnabled = false
// 全局变量：成交额
let turnoverAmount = 1100
// 全局变量：交易次数限制
let maxTradeCount = 15
// 全局变量：当前已执行的交易次数
let currentTradeCount = 0
// 全局变量：每轮交易开始时的初始余额
let initialBalance: number | null = null
// 全局变量：记录上一次的 USDT 余额，用于判断差值是否过大
let lastUsdtBalance: number | null = null
// 全局变量：记录最近一次的余额差值，用于阈值判断
let lastBalanceDelta: number | null = null

// ============= 数据记录配置 =============
// 用于存储所有价格数据，方便后续分析
let allPriceData: PriceRecord[] = []
// 数据记录开关
let isRecordingData = false

// 将数据保存到本地存储
async function saveDataToStorage() {
  if (allPriceData.length === 0) return
  
  try {
    // 生成文件名（包含日期时间）
    const now = new Date()
    const filename = `price_data_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.json`
    
    // 转换为 JSON 字符串
    const dataStr = JSON.stringify(allPriceData, null, 2)
    
    // 创建 Blob 并下载
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    console.log(`📁 已保存 ${allPriceData.length} 条价格数据到文件: ${filename}`)
  } catch (error) {
    console.error('❌ 保存数据失败:', error)
  }
}

// 定期保存数据（每100条记录保存一次）
function recordPriceData(record: PriceRecord) {
  if (!isRecordingData) return
  
  allPriceData.push(record)
  
  // 每100条数据保存一次
  if (allPriceData.length % 100 === 0) {
    console.log(`📊 已记录 ${allPriceData.length} 条价格数据`)
  }
}

// ============= 交易策略配置 =============
// 优化后的双策略组合：uptrend + sideways（基于回测数据优化）
// 回测结果：优化以减少亏损风险
const DETECTION_WINDOW = 30      // 检测时间窗口（秒）- 从10秒扩展到30秒提高准确率
const MIN_SAMPLES = 5            // 最少需要的样本数
const UPTREND_THRESHOLD = 0.58   // uptrend策略阈值（从50%提高到58%，减少亏损）
const SIDEWAYS_THRESHOLD = 0.62  // sideways策略阈值（62%过滤低质量信号）

// ============= 优化后的双策略交易函数 =============

/**
 * 双策略分析：uptrend（上升趋势）+ sideways（横盘震荡）
 * 策略1 - uptrend: 捕捉上升趋势中的交易机会（主要盈利来源）
 * 策略2 - sideways: 捕捉横盘震荡中的高质量反弹机会（辅助策略）
 * 已禁用rebound策略（回测显示平均收益为负）
 */
function analyzeUltraShortTermOpportunity(trades: PriceRecord[]): { 
  suitable: boolean; 
  confidence: number;
  buyPrice: number;
  expectedSellPrice: number;
  reason: string;
} {
  if (trades.length < MIN_SAMPLES) {
    return { 
      suitable: false, 
      confidence: 0, 
      buyPrice: 0, 
      expectedSellPrice: 0,
      reason: "数据不足"
    }
  }

  const now = Date.now()
  const windowStart = now - (DETECTION_WINDOW * 1000)
  
  // 获取时间窗口内的交易
  const recentTrades = trades.filter(t => t.timestamp >= windowStart)
  
  if (recentTrades.length < MIN_SAMPLES) {
    return { 
      suitable: false, 
      confidence: 0, 
      buyPrice: 0, 
      expectedSellPrice: 0,
      reason: "窗口内数据不足"
    }
  }

  // 获取当前价格
  const currentPrice = recentTrades[recentTrades.length - 1].price
  
  // 1. 价格波动率分析
  const prices = recentTrades.map(t => t.price)
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const priceStd = Math.sqrt(
    prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
  )
  const volatility = (priceStd / avgPrice) * 100 // 波动率百分比
  
  // 2. 价格趋势分析（简单移动平均）- 30秒窗口使用更长周期
  const recent5Prices = prices.slice(-5)
  const recent10Prices = prices.slice(-10)
  const ma5 = recent5Prices.reduce((sum, p) => sum + p, 0) / recent5Prices.length
  const ma10 = recent10Prices.length > 0 ? recent10Prices.reduce((sum, p) => sum + p, 0) / recent10Prices.length : ma5
  
  // 3. 买卖压力分析
  const buyVolume = recentTrades.filter(t => t.side === 'buy').reduce((sum, t) => sum + t.quantity, 0)
  const sellVolume = recentTrades.filter(t => t.side === 'sell').reduce((sum, t) => sum + t.quantity, 0)
  const totalVolume = buyVolume + sellVolume
  const buyRatio = totalVolume > 0 ? buyVolume / totalVolume : 0.5
  
  // 4. 价格位置分析
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const priceRange = maxPrice - minPrice
  const pricePosition = priceRange > 0 ? (currentPrice - minPrice) / priceRange : 0.5
  
  // 5. 预测卖出价格（基于历史波动）
  // 在当前价格基础上，寻找一个可能在0.01%范围内的目标价
  const targetSpread = 0.005 // 目标0.005%的价差
  const expectedSellPrice = currentPrice * (1 + targetSpread / 100)
  
  // ========== 策略1: uptrend（上升趋势交易）==========
  // 优化以减少亏损风险
  let uptrendConfidence = 0
  const uptrendReasons: string[] = []
  
  // 波动率适中（提高下限到0.008%）
  if (volatility >= 0.008 && volatility <= 0.05) {
    uptrendConfidence += 0.25
    uptrendReasons.push(`波动适中(${volatility.toFixed(4)}%)`)
  }
  
  // 价格动量（增加稳定性检查）
  const priceChange1 = prices[prices.length - 1] - prices[prices.length - 2]
  const priceChange2 = prices[prices.length - 2] - prices[prices.length - 3]
  const momentum = priceChange1 - priceChange2
  
  // 确保当前价格在上涨
  if (ma5 > ma10 && momentum > 0 && priceChange1 > 0) {
    uptrendConfidence += 0.25
    uptrendReasons.push("上升加速")
  } else if (ma5 > ma10 && priceChange1 > 0) {
    uptrendConfidence += 0.12
    uptrendReasons.push("上升趋势")
  }
  
  // 买方压力（提高阈值）
  if (buyRatio > 0.65) {
    uptrendConfidence += 0.18
    uptrendReasons.push(`强买压(${(buyRatio * 100).toFixed(1)}%)`)
  } else if (buyRatio > 0.58) {
    uptrendConfidence += 0.10
    uptrendReasons.push(`买压(${(buyRatio * 100).toFixed(1)}%)`)
  }
  
  // 价格位置（低位更好）
  if (pricePosition < 0.4) {
    uptrendConfidence += 0.15
    uptrendReasons.push(`低位${(pricePosition * 100).toFixed(1)}%`)
  } else if (pricePosition < 0.6) {
    uptrendConfidence += 0.05
    uptrendReasons.push(`中位${(pricePosition * 100).toFixed(1)}%`)
  }
  
  // 成交量放大（30秒窗口使用更多样本）
  const last5Trades = recentTrades.slice(-5)
  const avgVolume = recentTrades.reduce((sum, t) => sum + t.quantity, 0) / recentTrades.length
  const recentAvgVolume = last5Trades.reduce((sum, t) => sum + t.quantity, 0) / last5Trades.length
  if (recentAvgVolume > avgVolume * 1.2) {
    uptrendConfidence += 0.10
    uptrendReasons.push("量增")
  }
  
  // ========== 策略2: sideways（横盘震荡交易）==========
  // 回测结果：1信号，100%成功率，0.0000%收益（高质量辅助策略）
  let sidewaysConfidence = 0
  const sidewaysReasons: string[] = []
  
  if (volatility < 0.01 && priceRange > 0) {
    const rangeRatio = (priceRange / avgPrice) * 100
    
    // 横盘震荡：振幅小于0.015%
    if (rangeRatio < 0.015) {
      sidewaysConfidence = 0.30
      sidewaysReasons.push(`横盘震荡(振幅${rangeRatio.toFixed(4)}%)`)
      
      // 价格在区间边缘
      if (pricePosition < 0.25) {
        sidewaysConfidence += 0.18
        sidewaysReasons.push("接近下沿")
      } else if (pricePosition > 0.75) {
        sidewaysConfidence += 0.12
        sidewaysReasons.push("接近上沿")
      }
      
      // 反弹迹象
      if (prices.length >= 2 && prices[prices.length - 1] > prices[prices.length - 2]) {
        sidewaysConfidence += 0.12
        sidewaysReasons.push("反弹迹象")
      }
      
      // 买卖平衡（横盘特征）
      if (buyRatio > 0.48 && buyRatio < 0.52) {
        sidewaysConfidence += 0.10
        sidewaysReasons.push("买卖平衡")
      }
    }
  }
  
  // 选择信心度最高的策略
  let confidence = 0
  let reasons: string[] = []
  let strategyType = 'none'
  let thresholdToUse = UPTREND_THRESHOLD
  
  if (uptrendConfidence >= sidewaysConfidence) {
    confidence = uptrendConfidence
    reasons = uptrendReasons
    strategyType = 'uptrend'
    thresholdToUse = UPTREND_THRESHOLD
  } else {
    confidence = sidewaysConfidence
    reasons = sidewaysReasons
    strategyType = 'sideways'
    thresholdToUse = SIDEWAYS_THRESHOLD
  }
  
  // 根据策略类型使用不同的阈值
  const suitable = confidence >= thresholdToUse
  
  const reason = suitable 
    ? `✅ [${strategyType}] ${reasons.join(" | ")}` 
    : `❌ [${strategyType}] 信心不足(${(confidence * 100).toFixed(0)}%/${(thresholdToUse * 100).toFixed(0)}%) - ${reasons.join(" | ")}`
  
  return {
    suitable,
    confidence,
    buyPrice: currentPrice,
    expectedSellPrice,
    reason
  }
}



// 实时输出节点值
function outputNodeValue() {
  const result = findTargetElement()

  if (result) {
    const { priceElement, quantityElement } = result
    const currentValue = priceElement.textContent?.trim() || ""
    const quantityValue = quantityElement.textContent?.trim() || ""

    // 获取 style 属性中的 color 值
    const styleAttr = priceElement.getAttribute("style") || ""
    const colorMatch = styleAttr.match(/color:\s*var\(--color-(Buy|Sell)\)/i)

    // 判断是 Buy 还是 Sell
    let priceType = ""
    let emoji = ""
    let side: "buy" | "sell" = "buy"
    if (colorMatch) {
      const type = colorMatch[1]
      if (type.toLowerCase() === "buy") {
        priceType = "BUY"
        emoji = "🟢"
        side = "buy"
      } else if (type.toLowerCase() === "sell") {
        priceType = "SELL"
        emoji = "🔴"
        side = "sell"
      }
    }

    // 构建完整的输出值
    const fullValue = priceType ? `${priceType} ${currentValue}` : currentValue

    // 提取数字价格
    const priceMatch = currentValue.match(/[\d.]+/)
    const price = priceMatch ? parseFloat(priceMatch[0]) : null

    // 提取数量（处理 k 单位，如 "1.5k" = 1500）
    const quantityMatch = quantityValue.match(/[\d.]+/)
    let quantity = quantityMatch ? parseFloat(quantityMatch[0]) : 0
    
    // 如果包含 "k" 或 "K"，则乘以 1000
    if (quantityValue.toLowerCase().includes('k')) {
      quantity = quantity * 1000
    }

    if (price !== null && !isNaN(price)) {
      const now = Date.now()

      // 创建价格记录对象
      const priceRecord: PriceRecord = { timestamp: now, price, quantity, side }

      // 添加当前价格、数量和交易方向到历史记录
      priceHistory.push(priceRecord)
      
      // 记录数据到本地文件（用于后续回测分析）
      // recordPriceData(priceRecord)

      // 移除40秒之前的记录（保留比检测窗口更长的历史数据）
      const fortySecondsAgo = now - 40000
      while (
        priceHistory.length > 0 &&
        priceHistory[0].timestamp < fortySecondsAgo
      ) {
        priceHistory.shift()
      }

      // 使用超短线交易策略检查是否符合入场条件
      if (priceHistory.length >= MIN_SAMPLES) {
        const opportunity = analyzeUltraShortTermOpportunity(priceHistory)
        
        if (opportunity.suitable) {
          console.log("🎯🎯🎯 发现超短线交易机会 🎯🎯🎯")
          console.log(`💎 信心度: ${(opportunity.confidence * 100).toFixed(1)}%`)
          console.log(`💰 买入价格: ${opportunity.buyPrice.toFixed(8)}`)
          console.log(`🎯 预期卖出: ${opportunity.expectedSellPrice.toFixed(8)}`)
          console.log(`📊 价差: ${(((opportunity.expectedSellPrice - opportunity.buyPrice) / opportunity.buyPrice) * 100).toFixed(4)}%`)
          console.log(`📝 原因: ${opportunity.reason}`)

          // 如果启用了自动交易且当前没有正在执行的交易
          if (autoTradeEnabled && !isExecutingTrade) {
              isExecutingTrade = true
              console.log("🚀 触发超短线自动交易...")

              // 暂停 observer 监听
              if (observer) {
                observer.disconnect()
                console.log("⏸️ 已暂停价格监听")
              }

              // 使用检测到的买入价格
              console.log(`📍 执行价格: ${opportunity.buyPrice}`)
              autoTradeEnabled = false // 关闭自动交易，防止重复触发
              // 异步执行交易逻辑
              executeAutoTrade(opportunity.buyPrice)
                .then(() => {
                  console.log("✅ 自动交易完成，等待下一个合适刷点...")
                  isExecutingTrade = false

                  // 恢复 observer 监听（仅在未达到上限且启用自动交易时）
                  if (autoTradeEnabled && currentTradeCount < maxTradeCount) {
                    startMonitoring()
                    console.log("▶️ 已恢复价格监听")
                  } else if (currentTradeCount >= maxTradeCount) {
                    console.log("🎉 所有交易已完成，不再监听价格")
                  }
                })
                .catch(async (error: Error) => {
                  console.error("❌ 自动交易失败，自动暂停:", error.message)

                  // 交易失败，自动暂停
                  autoTradeEnabled = false
                  isExecutingTrade = false

                  // 增加计数器
                  currentTradeCount++

                  // 更新 popup 状态，显示具体错误原因
                  try {
                    await chrome.storage.local.set({
                      currentTradeCount: currentTradeCount,
                      maxTradeCount: maxTradeCount,
                      status: `❌ 已暂停 ${currentTradeCount}/${maxTradeCount} - ${error.message}`,
                      isRunning: false
                    })
                    console.log(`🛑 已自动暂停交易 - 原因: ${error.message}`)
                  } catch (updateError) {
                    console.error("❌ 更新 popup 状态失败:", updateError)
                  }
                })
          }
        }
      }
    }

    console.log("═══════════════════════════════════")
    console.log("⏰ 时间:", new Date().toLocaleTimeString())
    console.log(`${emoji} 价格:`, fullValue)
    console.log(`${emoji} 数量:`, quantityValue)
    console.log("═══════════════════════════════════")
  }
}

// 全局变量：存储监听器引用，用于停止监听
let observer: MutationObserver | null = null
let intervalId: number | null = null

// 开始监听价格变化
function startMonitoring() {
  // 如果已经在监听，先停止
  stopMonitoring()

  // 使用 XPath 查找包含"成交记录"文本的 div 元素
  const xpath = './/div[contains(text(), "成交记录")]'
  const result = document.evaluate(
    xpath,
    document.body,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )

  const tradeRecordDiv = result.singleNodeValue as HTMLElement

  if (!tradeRecordDiv) {
    console.error('❌ 未找到"成交记录"元素')
    return
  }

  // 获取其父元素的父元素的父元素
  let parentElement: HTMLElement | null = tradeRecordDiv.parentElement

  if (!parentElement) {
    console.error("❌ 未找到父元素")
    return
  }
  
  parentElement = parentElement.parentElement
  if (!parentElement) {
    console.error("❌ 未找到父元素的父元素")
    return
  }
  
  parentElement = parentElement.parentElement
  if (!parentElement) {
    console.error("❌ 未找到父元素的父元素的父元素")
    return
  }

  // 在父元素的父元素的父元素的子元素中查找 ReactVirtualized__Grid__innerScrollContainer
  const container = parentElement.querySelector(
    ".ReactVirtualized__Grid__innerScrollContainer"
  ) as HTMLElement

  if (!container) {
    console.error("❌ 未找到 ReactVirtualized__Grid__innerScrollContainer 节点")
    return
  }

  console.log("✅ 找到目标容器节点，开始监听...")

  // 使用 MutationObserver 监听 DOM 变化
  observer = new MutationObserver(() => {
    outputNodeValue() // 每次 DOM 变化时都尝试输出
  })

  // 开始观察 ReactVirtualized__Grid__innerScrollContainer 的子节点变化
  observer.observe(container, {
    childList: true,
    subtree: true,
    characterData: true, // 监听文本内容变化
    attributes: true // 监听属性变化
  })

  console.log(
    "🚀 开始实时监听 ReactVirtualized__Grid__innerScrollContainer 子节点变化..."
  )

  //   // 立即输出一次
  //   setTimeout(() => {
  //     outputNodeValue()
  //   }, 100)
}

// 停止监听
function stopMonitoring() {
  if (observer) {
    observer.disconnect()
    observer = null
    console.log("⏹️ 已停止监听")
  }

  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// 设置限价面板下 limitPrice 输入框的值
function setLimitPriceInputValue(value: string | number) {
  const panel = findLimitPanelNode()
  if (!panel) {
    console.log("❌ 未找到限价面板节点")
    return false
  }
  const input = panel.querySelector<HTMLInputElement>("#limitPrice")
  if (!input) {
    console.log("❌ 未找到 id=limitPrice 的输入框")
    return false
  }
  input.value = String(value)
  // 触发 input 和 change 事件，确保页面能感知到变更
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
  console.log(`✅ 已将限价输入框的值设置为: ${value}`)
  return true
}

// 设置限价面板下 placeholder="限价卖出" 的输入框的值
function setLimitSellInputValue(value: string | number) {
  const panel = findLimitPanelNode()
  if (!panel) {
    console.log("❌ 未找到限价面板节点")
    return false
  }
  const input = panel.querySelector<HTMLInputElement>(
    'input[placeholder="限价卖出"]'
  )
  if (!input) {
    console.log("❌ 未找到 placeholder='限价卖出' 的输入框")
    return false
  }
  input.value = String(value)
  // 触发 input 和 change 事件，确保页面能感知到变更
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
  console.log(`✅ 已将限价卖出输入框的值设置为: ${value}`)
  return true
}

// 设置"成交额"输入框的值
async function setTurnoverInputValue(value: string | number): Promise<boolean> {
  const panel = findLimitPanelNode()
  if (!panel) {
    console.log("❌ 未找到限价面板节点")
    return false
  }

  // 使用 XPath 在限价面板内查找包含"成交额"文本的 div 元素
  const xpath = './/div[contains(text(), "成交额")]'
  const result = document.evaluate(
    xpath,
    panel,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )

  const turnoverDiv = result.singleNodeValue as HTMLElement | null
  if (!turnoverDiv) {
    console.log("❌ 未找到包含'成交额'的 div 标签")
    return false
  }

  // 获取父节点的父节点
  const parent1 = turnoverDiv.parentElement
  if (!parent1) {
    console.log("❌ '成交额' div 没有父节点")
    return false
  }

  const parent2 = parent1.parentElement
  if (!parent2) {
    console.log("❌ 没有第二层父节点")
    return false
  }

  // 获取第二层父节点的第二个子节点
  const secondChild = parent2.children[1]
  if (!secondChild) {
    console.log("❌ 第二层父节点没有第二个子节点")
    return false
  }

  // 获取第二个子节点的第一个子节点（应该是 input）
  const firstGrandChild = secondChild.children[0]
  if (!firstGrandChild) {
    console.log("❌ 第二个子节点没有第一个子节点")
    return false
  }

  // 确保是 input 元素
  if (!(firstGrandChild instanceof HTMLInputElement)) {
    // 尝试在其内部查找 input
    const innerInput = firstGrandChild.querySelector<HTMLInputElement>("input")
    if (innerInput) {
      innerInput.value = String(value)
      innerInput.dispatchEvent(new Event("input", { bubbles: true }))
      innerInput.dispatchEvent(new Event("change", { bubbles: true }))

      // 等待一小段时间确保值已设置
      await new Promise((resolve) => setTimeout(resolve, 100))
      console.log(`✅ 已将成交额输入框的值设置为: ${value}`)
      return true
    } else {
      console.log("❌ 未找到 input 元素")
      return false
    }
  }

  // 设置 input 的值
  const input = firstGrandChild as HTMLInputElement
  input.value = String(value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))

  // 等待一小段时间确保值已设置
  await new Promise((resolve) => setTimeout(resolve, 100))
  console.log(`✅ 已将成交额输入框的值设置为: ${value}`)
  return true
}

// 点击限价面板中的买入按钮
function clickBuyButton() {
  const panel = findLimitPanelNode()
  if (!panel) {
    console.log("❌ 未找到限价面板节点")
    return false
  }

  // 查找 class 中包含 bn-button__buy 的按钮
  const buyButton = panel.querySelector<HTMLElement>(
    '[class*="bn-button__buy"]'
  )
  if (!buyButton) {
    console.log("❌ 未找到 class 包含 'bn-button__buy' 的按钮")
    return false
  }

  // 模拟点击
  clickElement(buyButton)

  console.log("✅ 已点击买入按钮")
  return true
}

// 获取数字的小数位数
function getDecimalPlaces(num: number): number {
  const str = num.toString()
  const decimalIndex = str.indexOf(".")
  if (decimalIndex === -1) {
    return 0
  }
  return str.length - decimalIndex - 1
}

// 获取 USDT 余额
async function getUSDTBalance(): Promise<number | null> {
  // 等待 500ms 让 UI 更新余额
  await new Promise((resolve) => setTimeout(resolve, 500))

  const panel = findLimitPanelNode()
  if (!panel) {
    console.log("❌ 未找到限价面板节点")
    return null
  }

  // 使用 XPath 在限价面板内查找包含"可用"文本的 div 元素
  const xpath = './/div[contains(text(), "可用")]'
  const result = document.evaluate(
    xpath,
    panel,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  )

  const availableDiv = result.singleNodeValue as HTMLElement | null
  if (!availableDiv) {
    console.log("❌ 未找到包含'可用'的 div 标签")
    return null
  }

  // 获取5层父节点
  let parent: HTMLElement | null = availableDiv
  for (let i = 1; i <= 5; i++) {
    parent = parent?.parentElement
    if (!parent) {
      console.log(`❌ 没有第${i}层父节点`)
      return null
    }
  }

  // 获取第5层父节点的第二个子元素
  const secondChild = parent.children[1]
  if (!secondChild) {
    console.log("❌ 第5层父节点没有第二个子元素")
    return null
  }

  // 在第二个子元素中查找包含 "USDT" 的文本
  const textContent = secondChild.textContent || ""

  // 提取 USDT 前面的数字
  const usdtMatch = textContent.match(/([\d,.]+)\s*USDT/)
  if (usdtMatch && usdtMatch[1]) {
    // 移除逗号并转换为数字
    const balanceStr = usdtMatch[1].replace(/,/g, "")
    const balance = parseFloat(balanceStr)

    if (!isNaN(balance)) {
      console.log(`💵 USDT 余额: ${balance}`)
      return balance
    }
  }

  console.log("❌ 未能提取 USDT 余额")
  return null
}

// 执行自动交易
async function executeAutoTrade(currentPrice: number): Promise<void> {
  console.log("═══════════════════════════════════")
  console.log("🤖 开始执行自动交易")
  console.log(`💰 基准价格: ${currentPrice}`)

  // 获取基准价格的小数位数
  const decimalPlaces = getDecimalPlaces(currentPrice)
  console.log(`🔢 小数位数: ${decimalPlaces}`)

  // 计算买入价格：当前价格上涨 0.015%，0.1%滑点，防止买入失败，卖出同理
  let buyPrice = (currentPrice * (1 + 0.1 / 100)).toFixed(decimalPlaces)
  console.log(`📈 买入价格: ${buyPrice} (上涨 0.015%)`)

  // 计算卖出价格：当前价格下跌 0.015%
  let sellPrice = (currentPrice * (1 - 0.1 / 100)).toFixed(decimalPlaces)
  console.log(`📉 卖出价格: ${sellPrice} (下跌 0.015%)`)

  // 检查 buyPrice 是否等于 sellPrice
  if (buyPrice === sellPrice) {
    console.log("⚠️ 买入价格等于卖出价格，进行调整...")

    // 计算最小单位（例如小数位数为3，则最小单位为0.001）
    const minUnit = Math.pow(10, -decimalPlaces)

    // buyPrice 最后一位加1
    buyPrice = (parseFloat(buyPrice) + minUnit).toFixed(decimalPlaces)
    console.log(`📈 调整后买入价格: ${buyPrice} (+${minUnit})`)

    // sellPrice 最后一位减1
    sellPrice = (parseFloat(sellPrice) - minUnit).toFixed(decimalPlaces)
    console.log(`📉 调整后卖出价格: ${sellPrice} (-${minUnit})`)
  }

  console.log("═══════════════════════════════════")

  // 1. 设置限价买入价格
  console.log("1️⃣ 设置限价买入价格...")
  setLimitPriceInputValue(buyPrice)

  // 2. 确保"反向订单" checkbox 被选中
  console.log("2️⃣ 确保'反向订单'被选中...")
  const checkResult = ensureReverseOrderChecked()

  if (!checkResult.found) {
    throw new Error("未找到反向订单节点")
  }

  // 3. 设置限价卖出价格
  console.log("3️⃣ 设置限价卖出价格...")
  setLimitSellInputValue(sellPrice)

  // 3.5. 获取 USDT 余额
  console.log("3️⃣.5️⃣ 获取 USDT 余额...")
  let usdtBalanceBefore = await getUSDTBalance()

  // 检查余额差值是否过大，如果过大则重新获取一次
  if (
    usdtBalanceBefore !== null &&
    lastUsdtBalance !== null &&
    lastBalanceDelta !== null
  ) {
    const currentDelta = Math.abs(usdtBalanceBefore - lastUsdtBalance)
    const deltaThreshold = Math.abs(lastBalanceDelta) * 3 // 如果差值超过上次差值的3倍，则认为异常

    if (currentDelta > deltaThreshold && deltaThreshold > 0) {
      console.log(
        `⚠️ 余额差值异常: 当前差值 ${currentDelta.toFixed(8)}, 上次差值 ${lastBalanceDelta.toFixed(8)}`
      )
      console.log(`🔄 重新获取余额...`)

      // 重新获取一次
      const retryCounted = await getUSDTBalance()
      if (retryCounted !== null) {
        usdtBalanceBefore = retryCounted
        console.log(`✅ 重新获取成功: ${usdtBalanceBefore}`)
      } else {
        console.log(`⚠️ 重新获取失败，使用原值`)
      }
    }
  }

  if (usdtBalanceBefore !== null) {
    console.log(`✅ 交易前 USDT 余额: ${usdtBalanceBefore}`)

    // 更新上次余额和差值
    if (lastUsdtBalance !== null) {
      lastBalanceDelta = usdtBalanceBefore - lastUsdtBalance
    }
    lastUsdtBalance = usdtBalanceBefore
    console.log(
      `🔔 余额差值更新为: ${lastBalanceDelta !== null ? lastBalanceDelta.toFixed(8) : "N/A"}`
    )
  } else {
    console.log("⚠️ 无法获取 USDT 余额")
  }

  // 4. 设置成交额
  console.log("4️⃣ 设置成交额...")
  let finalTurnoverAmount = turnoverAmount

  // 检查成交额是否大于可用余额
  if (usdtBalanceBefore !== null && turnoverAmount > usdtBalanceBefore) {
    // 向下取整
    finalTurnoverAmount = Math.floor(usdtBalanceBefore)
    console.log(`⚠️ 成交额 ${turnoverAmount} 大于可用余额 ${usdtBalanceBefore}`)
    console.log(`📉 使用向下取整后的余额作为成交额: ${finalTurnoverAmount}`)

    // 更新全局变量
    turnoverAmount = finalTurnoverAmount

    // 更新到 popup 的成交额输入框
    try {
      await chrome.storage.local.set({ amount: String(finalTurnoverAmount) })
      console.log(`✅ 已更新 popup 中的成交额为: ${finalTurnoverAmount}`)
    } catch (error) {
      console.error("❌ 更新 popup 成交额失败:", error)
    }
  }
  // 等待100ms确保所有值都已设置
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await setTurnoverInputValue(finalTurnoverAmount)

  // 等待100ms确保所有值都已设置
  await new Promise((resolve) => setTimeout(resolve, 100))

  // 5. 点击买入按钮（最多重试3次）
  console.log("5️⃣ 点击买入按钮...")
  let buyClicked = false
  let buyAttempts = 0
  const maxBuyAttempts = 3

  while (!buyClicked && buyAttempts < maxBuyAttempts) {
    buyAttempts++
    console.log(`🖱️  第 ${buyAttempts} 次尝试点击买入按钮...`)
    buyClicked = clickBuyButton()

    if (buyClicked) {
      console.log(`✅ 第 ${buyAttempts} 次点击成功`)
      break
    } else {
      console.log(`⚠️ 第 ${buyAttempts} 次点击失败`)
      if (buyAttempts < maxBuyAttempts) {
        console.log("⏳ 等待 500ms 后重试...")
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }

  if (!buyClicked) {
    throw new Error(`买入按钮点击失败（已重试 ${maxBuyAttempts} 次）`)
  }

  // 5.5. 开始监听交易成功通知（在点击确认之前就开始监听）
  console.log("5️⃣.5️⃣ 开始监听交易成功通知...")
  const tradeResultPromise = checkTradeSuccess()

  // 6. 等待并点击确认对话框（不检测是否成功，继续执行）
  console.log("6️⃣ 尝试点击确认对话框...")
  await checkAndClickConfirmDialog()
  console.log("✅ 确认对话框处理完成，继续等待交易结果")

  // 7. 等待交易结果
  console.log("7️⃣ 等待交易完成...")
  const tradeResult = await tradeResultPromise

  if (tradeResult.buySuccess && tradeResult.sellSuccess) {
    console.log("🎉 交易成功！买单和卖单都已成交")

    // 交易成功，增加计数器
    currentTradeCount++
    console.log(`📊 当前交易次数: ${currentTradeCount}/${maxTradeCount}`)

    // 计算累计交易量：成交额 × 4
    const volumeIncrease = finalTurnoverAmount * 4
    console.log(
      `📈 本次交易量: ${volumeIncrease} (成交额 ${finalTurnoverAmount} × 4)`
    )

    // 从 storage 获取当前的累计数据
    const storageResult = await chrome.storage.local.get(["totalVolume"])
    const currentTotalVolume = storageResult.totalVolume || 0

    // 计算新的累计交易量
    const newTotalVolume = currentTotalVolume + volumeIncrease

    console.log(
      `📊 累计交易量: ${currentTotalVolume.toFixed(2)} → ${newTotalVolume.toFixed(2)}`
    )

    // 更新 popup 中的交易量数据
    try {
      await chrome.storage.local.set({
        currentTradeCount: currentTradeCount,
        maxTradeCount: maxTradeCount,
        totalVolume: newTotalVolume,
        status: `运行中 - ${currentTradeCount}/${maxTradeCount}`
      })
      console.log("✅ 已更新 popup 数据")
    } catch (error) {
      console.error("❌ 更新 popup 数据失败:", error)
    }

    // 检查是否达到交易次数上限
    if (currentTradeCount >= maxTradeCount) {
      console.log("🎉 已达到交易次数上限，停止自动交易")
      autoTradeEnabled = false

      // 保存价格数据
      // if (isRecordingData && allPriceData.length > 0) {
      //   await saveDataToStorage()
      // }
      isRecordingData = false

      // 计算累计交易总损耗
      console.log("💰 计算累计交易总损耗...")
      console.log("⏳ 等待余额更新...")

      // 多次尝试获取余额，确保获取到最新的余额
      let finalBalance: number | null = null
      let attempts = 0
      const maxAttempts = 5

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000)) // 每次等待2秒
        finalBalance = await getUSDTBalance()

        if (finalBalance !== null) {
          console.log(`✅ 第 ${attempts + 1} 次尝试获取到余额: ${finalBalance}`)

          // 更新余额追踪
          if (lastUsdtBalance !== null) {
            lastBalanceDelta = finalBalance - lastUsdtBalance
          }
          lastUsdtBalance = finalBalance

          break
        } else {
          attempts++
          console.log(
            `⚠️ 第 ${attempts} 次获取余额失败，${attempts < maxAttempts ? "继续尝试..." : "已达到最大尝试次数"}`
          )
        }
      }

      if (initialBalance !== null && finalBalance !== null) {
        const currentRoundLoss = initialBalance - finalBalance
        console.log(
          `📉 本次交易余额变化: ${initialBalance.toFixed(8)} → ${finalBalance.toFixed(8)}`
        )
        console.log(`💸 本次交易损耗: ${currentRoundLoss.toFixed(8)}`)

        // 从 storage 获取累计交易损耗并累加
        try {
          const storageResult = await chrome.storage.local.get(["roundLoss"])
          const previousRoundLoss = storageResult.roundLoss || 0
          const totalRoundLoss = previousRoundLoss + currentRoundLoss
          
          console.log(`💰 累计交易损耗: ${previousRoundLoss.toFixed(8)} + ${currentRoundLoss.toFixed(8)} = ${totalRoundLoss.toFixed(8)}`)
          
          await chrome.storage.local.set({
            roundLoss: totalRoundLoss,
            status: `✅ 已完成 ${currentTradeCount}/${maxTradeCount} 次交易`,
            isRunning: false,
            isCompleted: true // 标记为自然完成
          })
          console.log("✅ 已更新累计交易损耗")
        } catch (error) {
          console.error("❌ 更新累计交易损耗失败:", error)
        }
      } else {
        console.log("⚠️ 无法计算累计交易损耗（余额获取失败）")
        // 更新状态为完成
        try {
          await chrome.storage.local.set({
            status: `✅ 已完成 ${currentTradeCount}/${maxTradeCount} 次交易（余额获取失败）`,
            isRunning: false,
            isCompleted: true // 标记为自然完成
          })
        } catch (error) {
          console.error("❌ 更新完成状态失败:", error)
        }
      }
    } else {
      // 随机延迟 0-500ms 后执行下一次交易
      const randomDelay = Math.floor(Math.random() * 1000)
      console.log(`🔄 准备执行下一次交易... (延迟 ${randomDelay}ms)`)

      await new Promise((resolve) => setTimeout(resolve, randomDelay))
      autoTradeEnabled = true
      console.log("✅ 延迟结束，可以执行下一次交易")
    }
  } else {
    console.log("⚠️ 交易未完全成功，自动暂停")
    console.log(
      `   买单状态: ${tradeResult.buySuccess ? "✅ 已成交" : "❌ 未成交"}`
    )
    console.log(
      `   卖单状态: ${tradeResult.sellSuccess ? "✅ 已成交" : "❌ 未成交"}`
    )

    // 交易未完全成功，自动暂停
    autoTradeEnabled = false
    isExecutingTrade = false

    // 增加计数器（记录失败的交易）
    currentTradeCount++
    console.log(`📊 当前交易次数: ${currentTradeCount}/${maxTradeCount}`)

    // 确定具体的失败原因
    let failureReason = ""
    if (!tradeResult.buySuccess && !tradeResult.sellSuccess) {
      failureReason = "买单和卖单都未成交"
    } else if (!tradeResult.buySuccess) {
      failureReason = "买单未成交"
    } else if (!tradeResult.sellSuccess) {
      failureReason = "卖单未成交"
    }

    // 更新 popup 中的交易次数显示并标记为已暂停
    try {
      await chrome.storage.local.set({
        currentTradeCount: currentTradeCount,
        maxTradeCount: maxTradeCount,
        status: `❌ 已暂停 ${currentTradeCount}/${maxTradeCount} - ${failureReason}`,
        isRunning: false
      })
      console.log(`🛑 已自动暂停交易 - 原因: ${failureReason}`)
    } catch (error) {
      console.error("❌ 更新 popup 交易次数失败:", error)
    }
  }

  console.log("═══════════════════════════════════")
  console.log("✅ 自动交易流程完成")
  console.log("═══════════════════════════════════")
}

// 检查交易是否成功（监听通知区域）
function checkTradeSuccess(): Promise<{
  buySuccess: boolean
  sellSuccess: boolean
}> {
  return new Promise((resolve) => {
    console.log("👀 开始监听交易成功通知...")

    let buyOrderFilled = false
    let sellOrderFilled = false
    let checkCount = 0
    const maxCheckTime = 20000 // 最多等待20秒
    const startTime = Date.now()
    let notifyObserver: MutationObserver | null = null
    let appObserver: MutationObserver | null = null
    let timeoutCheck: ReturnType<typeof setInterval> | null = null

    // 查找 __APP 元素
    const appElement = document.querySelector<HTMLElement>("#__APP")

    if (!appElement) {
      console.log("⚠️ 未找到 #__APP 元素")
      resolve({ buySuccess: false, sellSuccess: false })
      return
    }

    console.log("✅ 找到 #__APP 元素，开始监听通知容器的生成...")

    // 检查通知内容的函数
    const checkNotificationContent = (node: Node) => {
      if (node instanceof HTMLElement) {
        const textContent = node.textContent || ""

        // 检查是否是通知节点（包含成交信息）
        if (
          textContent.includes("限价买单已成交") ||
          textContent.includes("限价卖单已成交")
        ) {
          console.log("🔔 检测到交易通知:", textContent)

          // 检查是否包含"限价买单已成交"
          if (textContent.includes("限价买单已成交")) {
            console.log("✅ 限价买单已成交！")
            buyOrderFilled = true
          }

          // 检查是否包含"限价卖单已成交"
          if (textContent.includes("限价卖单已成交")) {
            console.log("✅ 限价卖单已成交！")
            sellOrderFilled = true
          }

          // 如果两个订单都成交了，停止监听并返回结果
          if (buyOrderFilled && sellOrderFilled) {
            console.log("🎉 买卖单都已成交！")
            if (notifyObserver) notifyObserver.disconnect()
            if (appObserver) appObserver.disconnect()
            if (timeoutCheck) clearInterval(timeoutCheck)
            resolve({ buySuccess: true, sellSuccess: true })
          }
        }
      }
    }

    // 监听已存在的通知容器
    const observeNotifyContainer = (container: HTMLElement) => {
      // 先检查已存在的通知
      container.querySelectorAll("*").forEach((node) => {
        checkNotificationContent(node)
      })

      // 如果已经找到了两个订单，直接返回
      if (buyOrderFilled && sellOrderFilled) {
        return
      }

      // 创建 MutationObserver 监听通知容器的变化
      if (notifyObserver) {
        notifyObserver.disconnect()
      }

      notifyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              checkNotificationContent(node)
            })
          }
        })
      })

      // 开始观察通知容器
      notifyObserver.observe(container, {
        childList: true,
        subtree: true
      })
    }

    // 查找并监听通知容器
    const findAndObserveNotifyContainer = () => {
      const notifyContainer = document.querySelector<HTMLElement>(
        ".bn-layer-notifies-wrap"
      )
      if (notifyContainer) {
        console.log("✅ 找到通知容器 .bn-layer-notifies-wrap")
        observeNotifyContainer(notifyContainer)
      }
    }

    // 立即尝试查找一次
    findAndObserveNotifyContainer()

    // 监听 #__APP 的 DOM 变化，动态查找通知容器
    appObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // 检查新添加的节点是否是通知容器
              if (node.classList.contains("bn-layer-notifies-wrap")) {
                console.log("🆕 检测到新的通知容器生成")
                observeNotifyContainer(node)
              }
              // 检查新添加的节点内部是否包含通知容器
              const innerNotifyContainer = node.querySelector<HTMLElement>(
                ".bn-layer-notifies-wrap"
              )
              if (innerNotifyContainer) {
                console.log("🆕 检测到新的通知容器生成（内部）")
                observeNotifyContainer(innerNotifyContainer)
              }
            }
          })
        }
      })
    })

    // 开始观察 #__APP
    appObserver.observe(appElement, {
      childList: true,
      subtree: true
    })

    // 设置超时检查
    timeoutCheck = setInterval(() => {
      checkCount++
      const elapsed = Date.now() - startTime

      if (elapsed >= maxCheckTime) {
        console.log("⚠️ 等待交易成功超时")
        if (timeoutCheck) clearInterval(timeoutCheck)
        if (notifyObserver) notifyObserver.disconnect()
        if (appObserver) appObserver.disconnect()
        resolve({ buySuccess: buyOrderFilled, sellSuccess: sellOrderFilled })
      }

      // 每5秒输出一次当前状态
      if (checkCount % 50 === 0) {
        console.log(
          `⏳ 等待交易成功... 买单: ${buyOrderFilled ? "✅" : "⏳"}, 卖单: ${sellOrderFilled ? "✅" : "⏳"}`
        )
      }
    }, 100)
  })
}

// 检查并点击确认对话框中的"确认"按钮
function checkAndClickConfirmDialog(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log("⏳ 等待确认对话框弹出...")

    let attempts = 0
    const maxAttempts = 20 // 最多检查20次（2秒）

    const checkInterval = setInterval(() => {
      attempts++

      // 查找 role="presentation" 的 div 节点
      const dialog = document.querySelector<HTMLElement>(
        'div[role="presentation"]'
      )

      if (dialog) {
        clearInterval(checkInterval)

        // 在对话框中查找文本为"确认"的 button
        const confirmButton = Array.from(
          dialog.querySelectorAll<HTMLButtonElement>("button")
        ).find((btn) => btn.textContent?.trim() === "确认")

        if (confirmButton) {
          // 点击确认按钮
          clickElement(confirmButton)

          console.log("✅ 已点击'确认'按钮")
          resolve(true)
        } else {
          console.log("⚠️ 在对话框中未找到'确认'按钮")
          resolve(false)
        }
      } else if (attempts >= maxAttempts) {
        console.log("⚠️ 超时：未检测到确认对话框")
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100) // 每100ms检查一次
  })
}

// 检查页面是否完全加载
function checkPageLoaded(): { loaded: boolean; message: string } {
  console.log("🔍 检查页面加载状态...")

  // 1. 检查限价面板是否存在
  const panel = findLimitPanelNode()
  if (!panel) {
    return {
      loaded: false,
      message: "限价面板未加载完成，请等待页面加载完成后再试"
    }
  }

  // 2. 检查限价输入框是否存在
  const limitPriceInput = panel.querySelector<HTMLInputElement>("#limitPrice")
  if (!limitPriceInput) {
    return {
      loaded: false,
      message: "限价输入框未加载完成，请等待页面加载完成后再试"
    }
  }

  // 3. 检查限价卖出输入框是否存在
  const limitSellInput = panel.querySelector<HTMLInputElement>(
    'input[placeholder="限价卖出"]'
  )
  if (!limitSellInput) {
    return {
      loaded: false,
      message: "限价卖出输入框未加载完成，请等待页面加载完成后再试"
    }
  }

  // 4. 检查买入按钮是否存在
  const buyButton = panel.querySelector<HTMLElement>(
    '[class*="bn-button__buy"]'
  )
  if (!buyButton) {
    return {
      loaded: false,
      message: "买入按钮未加载完成，请等待页面加载完成后再试"
    }
  }

  // 5. 检查"反向订单"节点是否存在
  const reverseOrderNode = findReverseOrderNode()
  if (!reverseOrderNode) {
    return {
      loaded: false,
      message: "反向订单选项未加载完成，请等待页面加载完成后再试"
    }
  }

  console.log("✅ 页面已完全加载")
  return {
    loaded: true,
    message: "页面加载完成"
  }
}

// 监听来自 popup 或 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content Script 收到消息:", request)

  if (request.action === "findElement") {
    const result = findTargetElement()
    sendResponse({
      success: !!result,
      element: result
        ? {
            priceElement: {
              tagName: result.priceElement.tagName,
              className: result.priceElement.className,
              textContent: result.priceElement.textContent,
              innerHTML: result.priceElement.innerHTML
            },
            quantityElement: {
              tagName: result.quantityElement.tagName,
              className: result.quantityElement.className,
              textContent: result.quantityElement.textContent,
              innerHTML: result.quantityElement.innerHTML
            }
          }
        : null
    })
  }

  if (request.action === "findReverseOrder") {
    const reverseOrderNode = findReverseOrderNode()
    sendResponse({
      success: !!reverseOrderNode,
      element: reverseOrderNode
        ? {
            tagName: reverseOrderNode.tagName,
            className: reverseOrderNode.className,
            textContent: reverseOrderNode.textContent,
            innerHTML: reverseOrderNode.innerHTML
          }
        : null
    })
  }

  if (request.action === "start") {
    ;(async () => {
      console.log("开始执行任务，参数:", request)

      // 0. 检查页面是否完全加载
      const pageCheck = checkPageLoaded()
      if (!pageCheck.loaded) {
        console.error("❌ 页面未完全加载:", pageCheck.message)
        sendResponse({
          success: false,
          error: pageCheck.message
        })
        return
      }

      // 设置全局参数
      if (request.amount !== undefined) {
        turnoverAmount = parseFloat(request.amount) || 1100
        console.log(`💰 设置成交额: ${turnoverAmount}`)
      }

      if (request.loopCount !== undefined) {
        maxTradeCount = parseInt(request.loopCount) || 15
        
        // 检查上次是否自然完成，决定是重置还是继续
        try {
          const storageResult = await chrome.storage.local.get(["currentTradeCount", "isCompleted"])
          const isCompleted = storageResult.isCompleted || false
          
          if (isCompleted) {
            // 上次自然完成，重置交易次数
            currentTradeCount = 0
            console.log(`🔄 上次交易已完成，重置交易次数: 0/${maxTradeCount}`)
            // 清除完成标志
            await chrome.storage.local.set({ isCompleted: false })
          } else {
            // 暂停后继续，恢复交易次数
            currentTradeCount = storageResult.currentTradeCount || 0
            console.log(`▶️ 从暂停状态恢复，当前已完成: ${currentTradeCount}/${maxTradeCount}`)
          }
        } catch (error) {
          console.error("❌ 恢复交易次数失败，从0开始:", error)
          currentTradeCount = 0
        }
        
        console.log(`🔢 设置交易次数上限: ${maxTradeCount}`)

        // 记录初始余额用于计算每轮交易损耗
        initialBalance = await getUSDTBalance()
        if (initialBalance !== null) {
          console.log(
            `💰 记录本次交易初始余额: ${initialBalance.toFixed(8)} USDT`
          )

          // 初始化余额追踪（新一轮开始时重置）
          lastUsdtBalance = initialBalance
          lastBalanceDelta = null // 第一次没有差值
        } else {
          console.log(`⚠️ 无法获取初始余额，损耗计算可能不准确`)
        }

        // 更新 popup 中的交易次数显示（保留当前次数）
        try {
          await chrome.storage.local.set({
            currentTradeCount: currentTradeCount,
            maxTradeCount: maxTradeCount,
            status: "运行中 - " + currentTradeCount + "/" + maxTradeCount
          })
        } catch (error) {
          console.error("❌ 初始化 popup 交易次数失败:", error)
        }
      }

      // 启用自动交易模式
      autoTradeEnabled = true
      isExecutingTrade = false
      console.log("🤖 已启用自动交易模式")

      // 启用数据记录
      isRecordingData = true
      console.log("📊 已启用价格数据记录")

      // 启动价格监听
      startMonitoring()
    })()

    return true // 保持消息通道打开以便异步 sendResponse
  }

  if (request.action === "pause") {
    ;(async () => {
      console.log("⏸️ 暂停执行任务")

      // 禁用自动交易模式
      autoTradeEnabled = false
      isExecutingTrade = false
      console.log("🛑 已禁用自动交易模式")

      // 计算并记录交易损耗
      if (initialBalance !== null) {
        console.log("💰 计算暂停时的交易损耗...")
        console.log("⏳ 等待余额更新...")

        // 多次尝试获取余额
        let finalBalance: number | null = null
        let attempts = 0
        const maxAttempts = 3

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          finalBalance = await getUSDTBalance()

          if (finalBalance !== null) {
            console.log(`✅ 第 ${attempts + 1} 次尝试获取到余额: ${finalBalance}`)
            break
          } else {
            attempts++
            console.log(`⚠️ 第 ${attempts} 次获取余额失败${attempts < maxAttempts ? "，继续尝试..." : ""}`)
          }
        }

        if (finalBalance !== null) {
          const currentRoundLoss = initialBalance - finalBalance
          console.log(`📉 本次交易余额变化: ${initialBalance.toFixed(8)} → ${finalBalance.toFixed(8)}`)
          console.log(`💸 本次交易损耗: ${currentRoundLoss.toFixed(8)}`)

          // 从 storage 获取累计交易损耗并累加
          try {
            const storageResult = await chrome.storage.local.get(["roundLoss"])
            const previousRoundLoss = storageResult.roundLoss || 0
            const totalRoundLoss = previousRoundLoss + currentRoundLoss
            
            console.log(`💰 累计交易损耗: ${previousRoundLoss.toFixed(8)} + ${currentRoundLoss.toFixed(8)} = ${totalRoundLoss.toFixed(8)}`)
            
            await chrome.storage.local.set({
              roundLoss: totalRoundLoss,
              status: `⏸️ 已手动暂停 ${currentTradeCount}/${maxTradeCount}`,
              isRunning: false,
              isCompleted: false
            })
            console.log("✅ 已更新累计交易损耗到 popup")
          } catch (error) {
            console.error("❌ 更新累计交易损耗失败:", error)
          }
        } else {
          console.log("⚠️ 无法获取余额，跳过损耗计算")
          // 更新状态但不更新损耗
          try {
            await chrome.storage.local.set({
              status: `⏸️ 已手动暂停 ${currentTradeCount}/${maxTradeCount}`,
              isRunning: false,
              isCompleted: false
            })
          } catch (error) {
            console.error("❌ 更新暂停状态失败:", error)
          }
        }
      } else {
        console.log("⚠️ 没有初始余额记录，跳过损耗计算")
        // 更新状态
        try {
          await chrome.storage.local.set({
            status: `⏸️ 已手动暂停 ${currentTradeCount}/${maxTradeCount}`,
            isRunning: false,
            isCompleted: false
          })
          console.log("✅ 已更新暂停状态到 popup")
        } catch (error) {
          console.error("❌ 更新暂停状态失败:", error)
        }
      }

      // 重置初始余额
      initialBalance = null

      // 保存并停止数据记录
      // if (isRecordingData && allPriceData.length > 0) {
      //   await saveDataToStorage()
      // }
      isRecordingData = false
      console.log("📊 已停止价格数据记录")

      // 停止价格监听
      stopMonitoring()

      sendResponse({ success: true })
    })()
  }

  if (request.action === "reset") {
    ;(async () => {
      console.log("🔄 重置执行任务")

      // 禁用自动交易模式
      autoTradeEnabled = false
      isExecutingTrade = false
      initialBalance = null // 重置初始余额
      currentTradeCount = 0 // 重置交易次数
      console.log("🛑 已禁用自动交易模式")

      // 保存数据、清空记录并停止记录
      // if (isRecordingData && allPriceData.length > 0) {
      //   await saveDataToStorage()
      // }
      allPriceData = [] // 清空所有数据
      isRecordingData = false
      console.log("📊 已停止价格数据记录并清空数据")

      // 停止价格监听
      stopMonitoring()

      // 更新 popup 状态为已重置，并重置累计交易损耗和交易次数
      try {
        await chrome.storage.local.set({
          status: "已重置",
          isRunning: false,
          roundLoss: 0, // 重置累计交易损耗
          currentTradeCount: 0, // 重置交易次数
          isCompleted: false // 清除完成标志
        })
        console.log("✅ 已更新重置状态到 popup")
      } catch (error) {
        console.error("❌ 更新重置状态失败:", error)
      }

      sendResponse({ success: true })
    })()
  }

  return true
})

console.log("✅ 币安 Alpha 自动脚本准备就绪，等待用户点击'开始'按钮...")

export {}
