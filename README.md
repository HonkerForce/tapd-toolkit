# TAPD Helper

为 TAPD 提供暗色模式支持，让夜间工作更舒适。

## 安装方法

### 方法一：加载已解压的扩展（开发/测试）

1. 打开 Chrome 浏览器，进入 `chrome://extensions`
2. 开启右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择本项目的 `tapd-helper` 目录
5. 扩展即加载完成，访问 `*.tapd.cn` 即可生效

### 方法二：打包安装

1. 在 `chrome://extensions` 中点击 **打包扩展程序**
2. 扩展根目录：选择 `tapd-helper` 文件夹
3. 私钥文件：留空（首次打包会自动生成 `.pem` 文件，请妥善保管）
4. 点击 **打包扩展程序**，生成 `.crx` 文件
5. 将 `.crx` 文件拖入 `chrome://extensions` 页面安装

### 方法三：使用构建脚本

```bash
# 运行构建脚本，生成 zip 发布包
powershell -File build.ps1
```

生成的 `tapd-helper-v1.0.0.zip` 可直接解压后按方法一加载。

## 使用方法

| 操作 | 方式 |
|------|------|
| 开关暗色模式 | 点击浏览器工具栏的 TAPD Helper 图标，或点击页面右下角的浮动按钮 |
| 调节亮度/对比度/色温 | 点击浏览器工具栏图标 → 拖动滑块；或右键图标 → 选项 |
| 跟随系统 | 在弹窗或设置页中开启"跟随系统"，自动匹配 OS 暗色模式 |

## 功能

- 暗色模式开关（一键切换）
- 跟随系统偏好（自动检测 OS 暗色模式）
- 亮度调节（-100 ~ +100）
- 对比度调节（-100 ~ +100）
- 色温调节（-100 ~ +100，暖色护眼 / 冷色清爽）
- 页面右下角浮动切换按钮
- 实时预览设置效果
- 打印自动恢复亮色模式

## 覆盖页面

- 工作台（my_worktable）
- 需求（Stories）
- 迭代（Iterations）
- 缺陷（Bugs）
- Wiki
- 故事墙（Kanban）
- 登录页
- 所有弹窗、抽屉、下拉框、日期选择器等动态组件

## 项目结构

```
tapd-helper/
├── manifest.json           # 扩展清单
├── background.js           # Service Worker
├── content_script.js       # 页面注入脚本
├── lib/
│   └── dark-theme.js       # CSS 生成器（核心样式）
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── images/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 开发

### CSS 变量体系

所有颜色通过 CSS 变量控制，见 `dark-theme.js` 中的 `C` 对象：

```js
bgPrimary: '#1e1e1e',    // 主背景
bgSecondary: '#252526',   // 次要背景
bgElevated: '#2d2d2d',   // 浮起层
textPrimary: '#d4d4d4',  // 主文本
textSecondary: '#9d9d9d', // 次要文本
border: '#3e3e3e',       // 边框
accent: '#4a9eff',       // 强调色
```

新增页面模块只需在 `dark-theme.js` 的 `generateThemeCSS` 函数中添加对应的 CSS 选择器即可。

## 许可

MIT
