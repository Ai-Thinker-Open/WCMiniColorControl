[![中文](https://img.shields.io/badge/中文-文档-blue)](ARCHITECTURE.zh.md)

# Architecture and boundaries

```text
index.wxml / index.wxss
          |
          v
pages/index/index.js ----> utils/util.js
          |
          +----> config/mqtt.js
          +----> bundled utils/mqtt.min.js
          |
          v
 MQTT secure WebSocket broker <----> compatible RGB device
```

- **Presentation:** WXML and WXSS define the color wheel and command buttons.
- **Page controller:** `index.js` owns page lifecycle, MQTT state, validation, and command creation.
- **Color utilities:** `utils/util.js` converts RGB/HSL values and draws the ring and marker.
- **Transport:** the bundled minified MQTT.js artifact manages WebSocket MQTT.
- **Configuration:** `config/mqtt.js` contains deployment-specific placeholders, not usable public credentials.

The repository does not contain the broker service or device firmware. Topic authorization, TLS trust, credential issuance, rate limits, retained messages, and device-side command validation remain external security boundaries. The minified MQTT dependency is bundled without its package metadata or a reproducible dependency build, so it should be reviewed and upgraded before production use.
