// 通用 CSS/SCSS Module 类型声明
declare module '*.module.scss' {
  const classes: {
    readonly [key: string]: string
  }
  export default classes
}

declare module '*.module.css' {
  const classes: {
    readonly [key: string]: string
  }
  export default classes
}

// popup.module.scss 的具体类型定义
declare module './popup.module.scss' {
  const classes: {
    readonly popupContainer: string
    readonly header: string
    readonly subtitle: string
    readonly content: string
    readonly infoCard: string
    readonly counterCard: string
    readonly inputGroup: string
    readonly label: string
    readonly input: string
    readonly url: string
    readonly counter: string
    readonly actions: string
    readonly button: string
    readonly btnPrimary: string
    readonly btnPause: string
    readonly btnSecondary: string
    readonly statusBox: string
    readonly statusHeader: string
    readonly statusLabel: string
    readonly statusIndicator: string
    readonly running: string
    readonly statusContent: string
    readonly statusText: string
    readonly statusInfo: string
    readonly footer: string
  }
  export default classes
}

// 普通 CSS/SCSS 文件
declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: string
  export default content
}
