---
name: visual-inspection
description: Look at UI screenshots and web pages when the active model cannot see images (API error 400 "this model does not support image input") or when you simply need to view an image file. Routes images to our local vision model (kimi-k2.6 via MCP tool `describe_image` or CLI `claude_vision`) and returns a text description. NEVER pass images to the main model on a non-vision backend (hard 400 and conversation stall).
---

# Visual inspection without model vision

## When to use
- You get `API Error: 400 this model does not support image input` while trying to review a screenshot.
- You need to verify UI (landing, app pages, Figma exports) and the current backend is text-only (e.g. deepseek-v4-flash).
- You saved a screenshot to disk (Playwright/Chrome DevTools) and need to know what it shows.

## Rules
1. **Never send image bytes to the main model** on a non-vision backend — it always fails with 400 and wastes a turn. Save the image to a file first.
2. Use the MCP tool if available: `describe_image(path, question)` (server `claude-vision`, stdio, installed at user scope).
3. If MCP is not configured, use the CLI: `claude_vision <path> [question]` — same engine, same model.
4. Treat the returned description as the source of truth for visual state, but sanity-check obvious claims against the DOM/HTML when reviewing code.

## Verification checklist to ask the vision model
For UI screenshots ask: headline text verbatim, layout/section order, colours and contrast, visible buttons and their labels, overflow/cut-off text, broken images or blank blocks, footer content, mobile vs desktop issues.
For model-specific page checks prepend context: "This is a pricing page — list the price cards and CTAs exactly as rendered."

## Supported images
PNG, JPEG, WebP, GIF. Pass the absolute path.

## Cost/performance
Local model via ollama-proxy — no external cost, a few seconds per image.