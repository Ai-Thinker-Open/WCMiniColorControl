#!/usr/bin/env python3
"""Validate documentation, Mini Program layout, and application safety invariants."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
LINK_RE = re.compile(r"(?<!!)\[[^]]*\]\(([^)]+)\)")


def pair_for(path: Path) -> Path:
    if path.name.endswith(".zh.md"):
        return path.with_name(path.name.removesuffix(".zh.md") + ".md")
    return path.with_name(path.stem + ".zh.md")


def check(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_docs(errors: list[str]) -> None:
    markdown = sorted(ROOT.rglob("*.md"))
    check(len(markdown) == 8, f"expected 8 Markdown files, found {len(markdown)}", errors)
    for path in markdown:
        relative = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        first = text.splitlines()[0] if text else ""
        check(pair_for(path).is_file(), f"missing bilingual pair for {relative}", errors)
        is_zh = path.name.endswith(".zh.md")
        is_root = relative in {"README.md", "README.zh.md"}
        badge = ("English-README-green" if is_root else "English-Docs-green") if is_zh else (
            "中文-README-blue" if is_root else "中文-文档-blue"
        )
        check(badge in first, f"incorrect badge in {relative}", errors)
        for raw in LINK_RE.findall(text):
            target = raw.strip().split()[0].strip("<>")
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            local = unquote(target.split("#", 1)[0])
            check(not local or (path.parent / local).resolve().exists(), f"broken link in {relative}: {target}", errors)


def validate_project(errors: list[str]) -> None:
    required = (
        "app.js", "app.json", "project.config.json", "pages/index/index.js",
        "pages/index/index.wxml", "pages/index/index.wxss", "utils/util.js",
        "utils/mqtt.min.js", "config/mqtt.js",
    )
    for relative in required:
        check((ROOT / relative).is_file(), f"missing required file: {relative}", errors)

    page = (ROOT / "pages/index/index.js").read_text(encoding="utf-8")
    view = (ROOT / "pages/index/index.wxml").read_text(encoding="utf-8")
    util = (ROOT / "utils/util.js").read_text(encoding="utf-8")
    config = (ROOT / "config/mqtt.js").read_text(encoding="utf-8")
    combined = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in ROOT.rglob("*.js"))

    handlers = set(re.findall(r"bind(?:tap|touchstart|touchmove|touchend)=\"([A-Za-z_$][\w$]*)\"", view))
    for handler in sorted(handlers):
        check(re.search(rf"\b{re.escape(handler)}\s*:\s*function\b", page) is not None,
              f"WXML handler is missing from page: {handler}", errors)

    invariants = (
        "that.mqttSubTopic()", "JSON.parse(String(payload))", "util.isRgbPayload(data)",
        "onUnload: function()", "this.data.client.end(true)", "mqttConfig.host",
    )
    for token in invariants:
        check(token in page, f"page lifecycle invariant missing: {token}", errors)
    check("Number.isInteger(value[key])" in util and "value[key] <= 255" in util,
          "RGB integer/range validation is missing", errors)
    for field in ("host", "clientId", "username", "password"):
        check(re.search(rf"{field}:\s*''", config) is not None, f"config placeholder is not empty: {field}", errors)
    for exposed in ("a0je61a", "OHiLItaGMsEx0cwh", "wx610ea582556c983e"):
        check(exposed not in combined and exposed not in (ROOT / "project.config.json").read_text(encoding="utf-8"),
              "historical public credential or AppID remains", errors)


def main() -> int:
    errors: list[str] = []
    validate_docs(errors)
    validate_project(errors)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("Repository validation passed: 4 bilingual pairs, links, 9 required files, UI handlers, MQTT lifecycle, and RGB validation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
