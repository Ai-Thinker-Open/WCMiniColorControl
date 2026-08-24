[![English](https://img.shields.io/badge/English-Docs-green)](CODE_ENTRY.md)

# 代码入口与消息流

小程序从 `app.js` 启动，并加载 `app.json` 声明的唯一页面 `pages/index/index`。

1. `Page.onLoad()` 初始化颜色画布并调用 `mqttConnect()`。
2. `mqttConnect()` 拒绝空配置，然后创建 MQTT 客户端。
3. `connect` 回调订阅 `/light/deviceOut`，并发送一次状态查询。
4. `message` 回调解析 JSON，只接受 0–255 范围内的整数 RGB 值，再更新显示状态和颜色指示位置。
5. 按钮和颜色圆环处理函数向 `/light/deviceIn` 发布 JSON 指令。
6. `Page.onUnload()` 强制关闭客户端，避免页面销毁后重连定时器继续运行。

UI 事件绑定位于 `pages/index/index.wxml`，页面行为位于 `pages/index/index.js`，颜色转换和绘制工具位于 `utils/util.js`。
