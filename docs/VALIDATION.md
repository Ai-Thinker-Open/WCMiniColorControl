[![中文](https://img.shields.io/badge/中文-文档-blue)](VALIDATION.zh.md)

# Validation record

Run the repository checks with:

```bash
python tools/validate_repository.py
node --check pages/index/index.js
node tools/test_util.js
```

The checks verify bilingual document pairs and links, required Mini Program files, WXML event handlers, MQTT lifecycle invariants, RGB validation, placeholder-only configuration, removal of the historical broker credentials, JavaScript syntax, and eight utility logic cases.

The current environment does not include WeChat DevTools, so no official Mini Program compile, preview, upload, phone test, broker connection, or physical light test was performed. Those remain release gates. The bundled minified MQTT library is treated as an opaque third-party artifact.
