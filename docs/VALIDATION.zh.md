[![English](https://img.shields.io/badge/English-Docs-green)](VALIDATION.md)

# 验证记录

执行仓库检查：

```bash
python tools/validate_repository.py
node --check pages/index/index.js
node tools/test_util.js
```

检查覆盖中英文文档配对和链接、小程序必要文件、WXML 事件处理器、MQTT 生命周期约束、RGB 校验、仅占位符配置、历史 Broker 凭据是否已移除、JavaScript 语法，以及 8 个工具逻辑用例。

当前环境没有微信开发者工具，因此没有执行官方小程序编译、预览、上传、手机测试、Broker 连接或实体灯具测试，这些仍是发布门槛。随附的压缩版 MQTT 库按不透明第三方产物记录。
