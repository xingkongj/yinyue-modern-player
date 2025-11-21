# 现代音乐播放器（YinYue Modern Player）

现代简约、流线型、深色设计的 Web 音乐播放器，支持播放控制、流光渐变进度条、频谱可视化、主题切换、目录保存与滚动播放列表。

## 特性
- 深色为主可切换浅色主题，金属质感与磨砂层次
- 播放/暂停、上一曲、下一曲、快进/快退，键盘快捷键（Space/←/→/↑/↓）
- 流光渐变播放进度条，拖拽定位
- Web Audio + Canvas 频谱可视化（柱形+光点融合风格）
- 播放列表固定高度、滚动展示，新增条目自动滚动到底部
- 金属质感音量旋钮（拖拽与数字显示同步）
- 通过浏览器文件系统权限将导入音频保存到已选择目录

## 快速开始
1. 下载仓库或克隆：`git clone https://github.com/xingkongj/yinyue-modern-player.git`
2. 直接用浏览器打开 `index.html`
3. 点击右上角 `选择存储目录`，建议选择本地目录（如 `music file`）并授予读写权限
4. 点击 `添加音频` 导入本地文件（MP3/AAC/WAV），列表将自动新增并滚动到底部

## 浏览器支持
- 目录选择与写入依赖 File System Access API，仅在 Chromium 系列浏览器（Chrome、Edge、Brave 等）可用
- 其他浏览器仍可播放本地选择的音频，但无法保存到目录

## 文件结构
- `index.html`：页面结构与组件布局
- `styles.css`：主题变量、金属与磨砂质感、渐变与动效
- `app.js`：播放控制、播放列表、进度拖拽、频谱动画、背景能量同步、音量旋钮、目录保存
- `assets/icons/controls/*`：上一曲、快退、快进、下一曲 SVG 图标

## 部署
- 静态站点，无需后端，直接部署到任意静态托管（如 GitHub Pages、Netlify、Vercel）
- GitHub Pages：项目 Settings → Pages → Source 选择 `main` 分支 `/(root)`，稍候即可访问 `https://<你的用户名>.github.io/yinyue-modern-player/`

## 许可
- 本项目现采用 **PolyForm Noncommercial License 1.0.0**，仅允许非商业目的使用，完整条款见 `LICENSE` 或官方页面：https://polyformproject.org/licenses/noncommercial/1.0.0/
- 该许可证不属于 OSI 开源定义，若需商业使用，请先联系作者以获取单独授权。

## 鸣谢与说明
- 项目通过 MCP 工具创建与推送
- 图标为自制线性样式，若替换第三方图库（如 Lucide/Phosphor），建议选用 24×24 网格、1.8–2.0px 描边、单色银灰风格以保持一致性
