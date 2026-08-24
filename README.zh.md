[![English](https://img.shields.io/badge/English-README-green)](README.md)

# 微信小程序七彩灯控制示例

本仓库是一个微信小程序 Demo，通过颜色圆环控制 MQTT 联网的 RGB 灯。程序可发布电源、颜色和状态查询指令，并显示经过校验的设备 RGB 状态。

## 功能

- RGB 颜色圆环以及红、绿、蓝快捷按钮
- 开灯、关灯和状态同步
- 基于安全 WebSocket（`wxs://`）的 MQTT 连接
- 对接收的 RGB 数值进行格式和范围校验
- 页面卸载时主动释放 MQTT 连接

## 在微信开发者工具中运行

1. 安装微信开发者工具，将本仓库作为小程序项目导入。
2. 将 `project.config.json` 中的 `touristappid` 替换为你有权使用的 AppID。
3. 在 `config/mqtt.js` 中填写 MQTT 服务签发的安全 WebSocket 地址、客户端 ID、用户名和密码。
4. 量产使用前，在小程序后台把 MQTT 主机加入合法 socket 域名；不要依赖仅用于开发的域名校验关闭选项。
5. 编译后连接兼容设备，核对订阅和发布 Topic，再测试实际负载。

示例使用 `/light/deviceIn` 发送指令，使用 `/light/deviceOut` 接收状态。状态消息必须包含 0–255 范围内的整数 `Red`、`Green` 和 `Blue` 字段。

## 安全说明

原示例包含公开的测试 Broker 凭据，现已移除，这些凭据应视为已经泄露并立即吊销。禁止提交量产凭据；正式产品应由可信后端签发短期凭据，避免把长期密码打包进小程序。

## 文档

- [代码入口与消息流](docs/CODE_ENTRY.zh.md)
- [架构与边界](docs/ARCHITECTURE.zh.md)
- [验证记录](docs/VALIDATION.zh.md)

## 限制

仓库检查只验证项目结构和应用逻辑约束，不能替代微信开发者工具编译、MQTT 服务联调、设备固件验证、网络安全审查或硬件/电气验收。
