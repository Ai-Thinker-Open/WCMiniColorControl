[![中文](https://img.shields.io/badge/中文-README-blue)](README.zh.md)

# WeChat Mini Program Color Control Demo

This repository contains a WeChat Mini Program demo that displays a color wheel and controls an MQTT-connected RGB light. It can publish power, color, and state-query commands and display validated RGB status messages from the device.

## Features

- interactive RGB color ring and preset red/green/blue buttons
- light on/off and state synchronization controls
- MQTT over secure WebSocket (`wxs://`)
- input validation for received RGB values
- explicit MQTT cleanup when the page is unloaded

## Run in WeChat DevTools

1. Install WeChat DevTools and import this repository as a Mini Program project.
2. Replace `touristappid` in `project.config.json` with an AppID you are authorized to use.
3. Fill `config/mqtt.js` with the secure WebSocket endpoint, client ID, username, and password issued by your MQTT service.
4. Add the MQTT host to the Mini Program's permitted socket domains for production use. Do not rely on the development-only domain-check bypass.
5. Compile, connect a compatible device, and verify subscribe/publish topics before testing a load.

The demo uses `/light/deviceIn` for commands and `/light/deviceOut` for status. A status payload must contain integer `Red`, `Green`, and `Blue` fields in the range 0–255.

## Security

The original demo contained public test broker credentials. They have been removed and must be considered exposed and revoked. Never commit production credentials; for maintained products, obtain short-lived credentials from a trusted backend instead of packaging long-lived passwords in a Mini Program.

## Documentation

- [Code entry and message flow](docs/CODE_ENTRY.md)
- [Architecture and boundaries](docs/ARCHITECTURE.md)
- [Validation record](docs/VALIDATION.md)

## Limitations

Repository checks validate project structure and application logic invariants. They do not replace WeChat DevTools compilation, MQTT service testing, device firmware verification, network security review, or hardware/electrical acceptance.
