# 币安 Alpha 自动刷分助手 (Binance Alpha Helper)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Framework-React-61DAFB.svg)](https://reactjs.org/)
[![Plasmo](https://img.shields.io/badge/Built%20With-Plasmo-purple.svg)](https://www.plasmo.com/)

**作者推特**: [https://x.com/qian_feifei](https://x.com/qian_feifei)

一个基于 Chrome 扩展程序的自动化交易辅助工具，专为币安 (Binance) Alpha 活动页面设计。通过智能算法监控价格波动，自动寻找最佳买卖点，帮助用户高效完成交易量任务，同时将损耗控制在极低范围。

## ✨ 主要功能

*   **🤖 全自动交易**：设置好成交额和交易次数后，插件全自动运行。
*   **🧠 智能策略算法**：
    *   基于 30秒 窗口的实时价格监控。
    *   **Uptrend (上升趋势)**：捕捉短期上涨动能，顺势而为。
    *   **Sideways (横盘震荡)**：识别箱体震荡，低吸高抛。
    *   多维度指标分析：结合波动率、买卖压力、成交量变化、MA均线趋势。
*   **⚡ 超短线操作**：毫秒级响应，买入后 1秒 自动卖出，追求极速进出。
*   **🛡️ 风险控制**：
    *   严格的信号过滤机制（信心度评分）。
    *   实时损耗统计与显示。
    *   支持手动暂停/继续，随时干预。
*   **📊 数据可视化**：
    *   实时显示运行状态。
    *   详细的交易日志输出。

## 🛠️ 技术栈

*   **核心框架**: [Plasmo](https://docs.plasmo.com/) (现代化的浏览器扩展开发框架)
*   **语言**: TypeScript
*   **UI 库**: React
*   **样式**: SCSS / CSS Modules
*   **构建工具**: Parcel (Plasmo 内置)

## 🚀 安装与使用

### 开发环境运行

1.  **克隆项目**
    ```bash
    git clone https://github.com/yourusername/binance-alpha-auto.git
    cd binance-alpha-auto
    ```

2.  **安装依赖**
    ```bash
    yarn
    ```

3.  **启动开发服务器**
    ```bash
    yarn dev
    ```

4.  **加载扩展**
    *   打开 Chrome 浏览器，访问 `chrome://extensions/`。
    *   开启右上角的 "开发者模式" (Developer mode)。
    *   点击 "加载已解压的扩展程序" (Load unpacked)。
    *   选择项目目录下的 `build/chrome-mv3-dev` 文件夹。

### 打包

```bash
pnpm build
# 生成的文件位于 build/chrome-mv3-prod
```

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## ⚠️ 免责声明

本工具仅供学习交流使用，使用本工具产生的任何后果由使用者自行承担。请遵守当地法律法规，理性投资，风险自负
