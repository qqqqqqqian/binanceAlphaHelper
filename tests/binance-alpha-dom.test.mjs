import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import vm from "node:vm"

import ts from "typescript"

function loadDomHelpers() {
  const source = fs.readFileSync(
    new URL("../lib/binance-alpha-dom.ts", import.meta.url),
    "utf8"
  )
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  })
  const module = { exports: {} }
  vm.runInNewContext(outputText, {
    exports: module.exports,
    module,
    Object,
    console
  })
  return module.exports
}

class FakeElement {
  constructor(tagName, attrs = {}, children = [], text = "") {
    this.tagName = tagName.toUpperCase()
    this.attrs = attrs
    this.children = children
    this.parentElement = null
    this.disabled = Boolean(attrs.disabled)
    this.readOnly = Boolean(attrs.readOnly)
    this.value = attrs.value || ""
    this.ownText = text

    for (const child of children) {
      child.parentElement = this
    }
  }

  get textContent() {
    return `${this.ownText}${this.children
      .map((child) => child.textContent)
      .join("")}`
  }

  getAttribute(name) {
    return this.attrs[name] ?? null
  }

  querySelectorAll(selector) {
    const descendants = []
    const visit = (element) => {
      for (const child of element.children) {
        descendants.push(child)
        visit(child)
      }
    }
    visit(this)

    if (selector === "*") {
      return descendants
    }

    if (selector === "input") {
      return descendants.filter((element) => element.tagName === "INPUT")
    }

    throw new Error(`Unsupported selector in fake DOM: ${selector}`)
  }
}

const input = (attrs) => new FakeElement("input", attrs)
const field = (label, child) => new FakeElement("div", {}, [child], label)
const div = (children = [], text = "", attrs = {}) =>
  new FakeElement("div", attrs, children, text)

test("findLimitSellInput supports Binance Alpha's new reverse-order sell price placeholder", () => {
  const { findLimitSellInput } = loadDomHelpers()
  const turnoverInput = input({
    id: "limitTotal",
    placeholder: "最小 0.1",
    type: "text"
  })
  const sellPriceInput = input({
    id: "limitTotal",
    placeholder: "限价卖单价格",
    type: "text"
  })
  const panel = new FakeElement("div", {}, [
    field("成交额USDT", turnoverInput),
    field("反向订单价格USDT", sellPriceInput)
  ])

  assert.equal(findLimitSellInput(panel), sellPriceInput)
})

test("findLimitSellInput falls back to the reverse-order price label when placeholder changes again", () => {
  const { findLimitSellInput } = loadDomHelpers()
  const turnoverInput = input({
    id: "limitTotal",
    placeholder: "最小 0.1",
    type: "text"
  })
  const sellPriceInput = input({
    id: "limitTotal",
    placeholder: "0.00000000",
    type: "text"
  })
  const panel = new FakeElement("div", {}, [
    field("成交额USDT", turnoverInput),
    field("反向订单价格USDT", sellPriceInput)
  ])

  assert.equal(findLimitSellInput(panel), sellPriceInput)
})

test("findUSDTBalance parses the available balance from Binance Alpha's current nested balance row", () => {
  const { findUSDTBalance } = loadDomHelpers()
  const availableLabel = div([], "可用")
  const balanceValue = div([], "1,102.76083127 USDT")
  const balanceRow = div([
    div([div([div([div([div([availableLabel])])])])]),
    div([balanceValue])
  ])
  const panel = div([
    field("成交额USDT", input({ id: "limitTotal", type: "text" })),
    field("反向订单价格USDT", input({ id: "limitTotal", type: "text" })),
    balanceRow
  ])

  assert.equal(findUSDTBalance(panel), 1102.76083127)
})

test("findUSDTBalance does not confuse input suffixes with the available balance", () => {
  const { findUSDTBalance } = loadDomHelpers()
  const panel = div([
    div([], "价格建议价格$0.47625937USDT"),
    field("成交额USDT", input({ id: "limitTotal", type: "text" })),
    div([
      div([], "可用"),
      div([], "999.5 USDT")
    ])
  ])

  assert.equal(findUSDTBalance(panel), 999.5)
})
