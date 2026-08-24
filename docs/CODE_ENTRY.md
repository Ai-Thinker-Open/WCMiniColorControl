[![中文](https://img.shields.io/badge/中文-文档-blue)](CODE_ENTRY.zh.md)

# Code entry and message flow

The Mini Program starts from `app.js` and loads the single page declared in `app.json`: `pages/index/index`.

1. `Page.onLoad()` initializes the color canvases and calls `mqttConnect()`.
2. `mqttConnect()` rejects an empty configuration, then creates the MQTT client.
3. The `connect` handler subscribes to `/light/deviceOut` and publishes a state query.
4. The `message` handler parses JSON, accepts only integer RGB values from 0 to 255, updates the displayed state, and moves the color marker.
5. Button and color-ring handlers publish JSON commands to `/light/deviceIn`.
6. `Page.onUnload()` force-closes the client so reconnect timers do not survive page teardown.

UI events are bound in `pages/index/index.wxml`; page behavior is implemented in `pages/index/index.js`; color conversion and drawing helpers live in `utils/util.js`.
