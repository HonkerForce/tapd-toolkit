# tapd-toolkit 🧰

> 腾讯 TAPD 协作平台效率工具集 — 提供暗色模式、显示调节等增强功能，让 TAPD 的使用体验更上一层楼。

[![Chrome 扩展](https://img.shields.io/badge/Chrome-扩展-v3?logo=googlechrome&color=4a9eff)](https://chrome.google.com)
[![版本](https://img.shields.io/badge/版本-1.0.0-4a9eff)](https://github.com/HonkerForce/tapd-toolkit)
[![许可证](https://img.shields.io/badge/许可证-MIT-green)](LICENSE.txt)

---

## 📖 简介

tapd-toolkit 是一款 Chrome 浏览器扩展（Manifest V3），专为腾讯 TAPD 协作平台打造的效率工具集。目前提供沉浸式暗色模式及亮度、对比度、色温的精细化调节功能，后续将持续扩展更多实用工具，提升 TAPD 的日常使用体验。

暗色模式采用多层 CSS 覆盖策略，深度覆盖 TAPD 的所有页面模块，包括工作台、需求、迭代、缺陷、Wiki、故事墙等。

## ✨ 功能特性

### 🎨 暗色模式
- **一键切换** — 点击浏览器工具栏图标或页面右下角浮动按钮，即刻切换暗色/亮色模式
- **跟随系统** — 自动检测操作系统暗色模式偏好，无缝适配
- **过渡动画** — 切换时带有平滑的滑出动画效果

### 🎛️ 显示调节
| 调节项 | 范围 | 说明 |
|--------|------|------|
| 亮度 | -100 ~ +100 | 调整背景明暗程度 |
| 对比度 | -100 ~ +100 | 调整文本与背景的对比度 |
| 色温 | -100 ~ +100 | 暖色护眼 / 冷色清爽 |

### 🖥️ 覆盖页面
- ✅ 工作台（my_worktable）
- ✅ 需求（Stories）
- ✅ 迭代（Iterations）
- ✅ 缺陷（Bugs）
- ✅ Wiki
- ✅ 故事墙（Kanban / Story Wall）
- ✅ 登录页
- ✅ 消息中心
- ✅ 所有弹窗、抽屉、下拉框、日期选择器、富文本编辑器等动态组件

### 🛡️ 智能处理
- **打印自动恢复亮色模式** — 打印时自动切换为亮色，确保打印清晰
- **图片智能调暗** — 大图自动降低亮度，小图标保持原样
- **动态内容覆盖** — 通过 MutationObserver 实时检测并处理 SPA 动态加载的元素
- **内联样式覆盖** — 智能识别并覆盖 TAPD 通过 JavaScript 设置的暗色/蓝色内联样式

## 📦 安装方法

### 方法一：加载已解压的扩展（开发/测试）

1. 打开 Chrome 浏览器，进入 `chrome://extensions`
2. 开启右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择本项目目录
5. 扩展即加载完成，访问 `*.tapd.cn` 即可生效

### 方法二：打包安装

1. 在 `chrome://extensions` 中点击 **打包扩展程序**
2. 扩展根目录：选择本项目目录
3. 私钥文件：留空（首次打包会自动生成 `.pem` 文件，请妥善保管）
4. 点击 **打包扩展程序**，生成 `.crx` 文件
5. 将 `.crx` 文件拖入 `chrome://extensions` 页面安装

### 方法三：使用构建脚本

```bash
# 运行构建脚本，生成 zip 发布包
powershell -File build.ps1
```

生成的 `dist/tapd-helper-v1.0.0.zip` 可直接解压后按方法一加载。

## 🚀 使用方法

| 操作 | 方式 |
|------|------|
| 开关暗色模式 | 点击浏览器工具栏的 tapd-toolkit 图标，或点击页面右下角的浮动按钮 |
| 调节亮度/对比度/色温 | 点击浏览器工具栏图标 → 拖动滑块；或右键图标 → 选项 |
| 跟随系统 | 在弹窗或设置页中开启"跟随系统"，自动匹配 OS 暗色模式 |
| 高级设置 | 右键扩展图标 → 选项，或点击弹窗底部的"高级设置" |

## 🗂️ 项目结构

```
tapd-toolkit/
├── manifest.json            # 扩展清单（Manifest V3）
├── background.js            # Service Worker（初始化默认设置）
├── content_script.js        # 页面注入脚本（主题管理、浮动按钮、动态覆盖）
├── lib/
│   └── dark-theme.js        # 核心 CSS 生成器（7层覆盖策略）
├── popup/
│   ├── popup.html           # 弹窗界面
│   ├── popup.js             # 弹窗逻辑
│   └── popup.css            # 弹窗样式
├── options/
│   ├── options.html         # 设置页面
│   ├── options.js           # 设置逻辑（含实时预览）
│   └── options.css          # 设置页样式
├── images/
│   ├── icon16.png           # 16x16 图标
│   ├── icon48.png           # 48x48 图标
│   └── icon128.png          # 128x128 图标
├── dist/
│   └── tapd-helper-v1.0.0.zip  # 构建产物
├── build.ps1                # 构建脚本（生成发布包）
├── README.md                # 项目说明（本文件）
└── LICENSE.txt              # MIT 许可证
```

## 🔧 开发指南

### CSS 变量体系

所有颜色通过 CSS 变量控制，定义在 `dark-theme.js` 的 `generateThemeCSS` 函数中：

```js
const C = {
  bgPrimary:   '#1a1a1a',   // 主背景（最暗层）
  bgSecondary: '#222222',   // 次要背景（侧边栏、工具栏）
  bgElevated:  '#2a2a2a',   // 浮起层（卡片、弹窗、下拉菜单）
  bgHover:     '#333333',   // 悬停状态
  bgInput:     '#3a3a3a',   // 输入框背景
  bgOverlay:   'rgba(0,0,0,0.65)',  // 遮罩层
  textPrimary: '#e0e0e0',   // 主文本颜色
  textSecondary: '#aaaaaa', // 次要文本
  textMuted:   '#777777',   // 弱化文本
  border:      '#3a3a3a',   // 边框颜色
  accent:      '#4a9eff',   // 强调色（蓝色高亮）
  danger:      '#f14c4c',   // 危险/错误色
  success:     '#4caf50',   // 成功色
  warning:     '#ff9800',   // 警告色
};
```

### 7 层 CSS 覆盖策略

`dark-theme.js` 采用多层覆盖策略，确保所有 TAPD 页面元素都能被正确暗化：

| 层 | 名称 | 说明 |
|----|------|------|
| 1 | **CSS 变量** | 定义全套暗色主题 CSS 变量 |
| 2 | **根元素** | 覆盖 `html`、`body` 背景和文字颜色 |
| 3 | **通用元素** | 覆盖所有 `div`、`span`、`table` 等元素，确保无白色残留 |
| 4 | **模式匹配** | 通过 `[class*="..."]` 通配符批量覆盖 TAPD 组件族 |
| 5 | **具体类名** | 覆盖已知的 TAPD 具体 CSS 类名 |
| 6 | **内联样式** | 通过 `[style*="..."]` 属性选择器覆盖 JS 设置的内联样式 |
| 7 | **SVG/图表** | 处理 SVG 图标、图表、滚动条等特殊元素 |

### 如何添加新页面的暗色支持

1. 打开 `lib/dark-theme.js`
2. 在 `generateThemeCSS` 函数中找到对应的层级
3. 添加新页面的 CSS 选择器覆盖规则

大多数情况下，Layer 4 的模式匹配规则已经能够覆盖新增页面。如果遇到未被覆盖的元素，检查其 CSS 类名并在对应层级中添加即可。

### 构建发布包

```bash
# 默认版本号（1.0.0）
powershell -File build.ps1

# 指定版本号
powershell -File build.ps1 -Version "1.1.0"
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！在提交代码前，请确保：

1. 测试覆盖所有 TAPD 主要页面
2. 确保暗色模式下没有纯白/纯蓝背景残留
3. 确认亮度/对比度/色温调节功能正常

## 📄 许可证

[MIT](LICENSE.txt) © 2026 tapd-toolkit
