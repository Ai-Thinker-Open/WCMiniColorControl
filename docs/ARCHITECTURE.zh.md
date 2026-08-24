[![English](https://img.shields.io/badge/English-Docs-green)](ARCHITECTURE.md)

# 架构与边界

```text
index.wxml / index.wxss
          |
          v
pages/index/index.js ----> utils/util.js
          |
          +----> config/mqtt.js
          +----> 随附的 utils/mqtt.min.js
          |
          v
 MQTT 安全 WebSocket Broker <----> 兼容 RGB 设备
```

- **展示层：** WXML 和 WXSS 定义颜色圆环与指令按钮。
- **页面控制层：** `index.js` 管理生命周期、MQTT 状态、输入校验和指令生成。
- **颜色工具层：** `utils/util.js` 转换 RGB/HSL 并绘制圆环与指示点。
- **传输层：** 随附的压缩版 MQTT.js 管理 WebSocket MQTT。
- **配置层：** `config/mqtt.js` 只保留部署占位符，不包含可用的公开凭据。

仓库不包含 Broker 服务和设备固件。Topic 授权、TLS 信任、凭据签发、速率限制、保留消息和设备端指令校验都属于外部安全边界。压缩版 MQTT 依赖没有随附包元数据和可复现依赖构建，量产前应审查并升级。
