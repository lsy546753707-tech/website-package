# 李淑雁 / WENTING 视觉作品集

个人视觉作品集网站（前台 + 可编辑后台）。

## 项目结构

- `index.html`：网站前台入口（HTTP 版，含缓存版本参数）
- `index-file.html`：前台 file:// 双击打开版（与 index.html 同步）
- `styles.css`：前台样式与响应式布局
- `script.js`：开场三幕动画（序列帧）、滚动驱动、水面拖尾水波、动态渐变背景（WebGL）、五卡能力展示、作品弹窗
- `site-config.js`：全站默认配置（文案、字号、颜色、间距、过渡速度）
- `admin.html` + `admin.css` + `admin.js`：后台编辑页（可修改前端所有文案与样式，保存后写入 localStorage，前台刷新生效）
- `assets/`：开场序列帧（`cover_01/`、`cover_02/`）与社交平台截图（`social-*.png/webp`）
- `启动网站.bat`：一键启动本地服务器（`python -m http.server 3000`）
- `_backup/`：版本备份与归档（回滚依据，勿删）

## 使用方式

### 启动

双击 `启动网站.bat`，访问 http://127.0.0.1:3000/ 查看前台。

### 后台编辑

打开 http://127.0.0.1:3000/admin.html 可修改文案、字体大小、标题比例、间距、颜色与过渡速度。保存后刷新前台即可生效。

### 直接打开

双击 `index-file.html` 可直接在浏览器中查看（file:// 模式）。

## 主要功能

- 开场三幕：滚动驱动序列帧过渡（cover_01/cover_02），文案随滚动渐显，无硬切
- 第二页：精选作品 + 五模块能力卡（01-05，悬停荧光绿填充动效）
- 自媒体区：抖音 / 小红书 / 哔哩哔哩 三平台主页展示
- 背景：WebGL 动态渐变（第四页起），主色 #fea9c8
- 鼠标交互：水面拖尾水波、光标光晕

## 说明

- 修改 `styles.css` / `script.js` / `site-config.js` 后，需同步更新 `index.html` 中对应的 `?v=` 版本参数，避免浏览器读取缓存。
- `index-file.html` 与 `index.html` 内容需保持一致（区别仅为缓存参数）。
