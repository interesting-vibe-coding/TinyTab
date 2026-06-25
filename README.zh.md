# TinyTab

[English](README.md)

面向 Atlas 与现代 Chromium 浏览器的小型、可预测标签页清理器。

TinyTab 默认关闭闲置 30 分钟的标签页，同时保护活跃标签、固定标签、媒体播放、近期页面活动、已编辑表单与白名单域名。

<p align="center"><img src="assets/hero.png" width="480" alt="TinyTab 弹窗"></p>

## 安装

```sh
npm ci
npm run build
```

打开 Atlas、Chrome、Edge 或 Brave 的 `chrome://extensions`，启用开发者模式，选择「加载已解压的扩展程序」，加载 `dist/`。

## 使用

- 默认闲置时间：30 分钟
- Smart Close：默认开启
- 活跃标签、固定标签：默认跳过
- Popup：暂停、打开标签数、今日关闭数
- Settings：超时、白名单、安全偏好

白名单支持精确域名与子域通配：

```text
github.com
*.github.com
localhost
127.0.0.1
```

## 隐私

零分析、零远程请求。TinyTab 不读取页面正文、表单值、请求内容，也不上传浏览数据。完整说明见 [PRIVACY.md](PRIVACY.md)。

## 开发

```sh
npm run verify
```

需要 Node.js 20.19+。

## 许可证

[MIT](LICENSE)
