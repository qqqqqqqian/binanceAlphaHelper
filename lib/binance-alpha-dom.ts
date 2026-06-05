const LIMIT_SELL_PRICE_PLACEHOLDERS = ["限价卖出", "限价卖单价格"]
const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "hidden",
  "radio",
  "range",
  "reset",
  "submit"
])
const AVAILABLE_USDT_BALANCE_PATTERN = /可用([\d,]+(?:\.\d+)?)USDT/i

function normalizeText(text: string | null | undefined): string {
  return (text || "").replace(/\s+/g, "")
}

function isEditableTextInput(input: HTMLInputElement): boolean {
  const type = (input.getAttribute("type") || "text").toLowerCase()
  return !NON_TEXT_INPUT_TYPES.has(type) && !input.disabled && !input.readOnly
}

function nearestSingleInputAncestorTextIncludes(
  element: HTMLElement,
  keywords: string[],
  maxDepth = 6
): boolean {
  let current: HTMLElement | null = element

  for (let depth = 0; current && depth <= maxDepth; depth++) {
    const text = normalizeText(current.textContent)
    const inputCount = current.querySelectorAll("input").length
    if (
      inputCount === 1 &&
      keywords.every((keyword) => text.includes(keyword))
    ) {
      return true
    }

    current = current.parentElement
  }

  return false
}

function parseAvailableUSDTBalance(text: string | null | undefined): number | null {
  const match = normalizeText(text).match(AVAILABLE_USDT_BALANCE_PATTERN)
  if (!match?.[1]) {
    return null
  }

  const balance = parseFloat(match[1].replace(/,/g, ""))
  return Number.isNaN(balance) ? null : balance
}

export function findLimitSellInput(panel: ParentNode): HTMLInputElement | null {
  const inputs = Array.from(
    panel.querySelectorAll<HTMLInputElement>("input")
  ).filter(isEditableTextInput)

  const inputByPlaceholder = inputs.find((input) => {
    const placeholder = (input.getAttribute("placeholder") || "").trim()
    return LIMIT_SELL_PRICE_PLACEHOLDERS.includes(placeholder)
  })

  if (inputByPlaceholder) {
    return inputByPlaceholder
  }

  return (
    inputs.find((input) =>
      nearestSingleInputAncestorTextIncludes(input, ["反向订单", "价格"])
    ) || null
  )
}

export function findUSDTBalance(panel: ParentNode): number | null {
  const availableElements = Array.from(
    panel.querySelectorAll<HTMLElement>("*")
  ).filter((element) => normalizeText(element.textContent).includes("可用"))

  for (const element of availableElements) {
    let current: HTMLElement | null = element

    for (let depth = 0; current && depth <= 8; depth++) {
      const balance = parseAvailableUSDTBalance(current.textContent)
      if (balance !== null) {
        return balance
      }

      current = current.parentElement
    }
  }

  return parseAvailableUSDTBalance((panel as Node).textContent)
}

export function setNativeInputValue(
  input: HTMLInputElement,
  value: string | number
): void {
  const nextValue = String(value)
  const valueSetter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(input),
    "value"
  )?.set

  if (valueSetter) {
    valueSetter.call(input, nextValue)
  } else {
    input.value = nextValue
  }

  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}
