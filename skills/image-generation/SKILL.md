---
name: image-generation
description: Generate images (hero shots, illustrations, OG images, banners) via the OpenRouter Dedicated Image API through our local proxy. CLI: `claude-imagegen "prompt" [--model ...] [--ratio 16:9] [--out path]`. Default model google/gemini-3.1-flash-lite-image (cheap, ~3-4 cents). Use when the project needs new imagery that cannot be taken from stock or existing assets.
---

# Image generation (OpenRouter, via local proxy)

## Usage
```
claude-imagegen "A photorealistic hero image of a minimal SaaS dashboard with a green decision report card, soft depth of field" --ratio 16:9 --out /tmp/hero.png
```
The script prints the absolute output path (and cost to stderr). It proxies through 127.0.0.1:8890 (openrouter-proxy) — no direct internet to openrouter.ai from RU datacenter.

## Model selection
| Task | Model |
|---|---|
| Default, almost everything | `google/gemini-3.1-flash-lite-image` (low cost) |
| Higher resolution control | `google/gemini-3.1-flash-image` (512/1K/2K/4K) |
| Editing / many references | `openai/gpt-image-2` (expensive, best prompt fidelity) |
| Transparent background | `openai/gpt-image-1-mini` (only one with background: transparent) |
| Cheap bulk cards | `krea/krea-2-medium-turbo` |
| Photo realism, unusual ratios | `x-ai/grok-imagine-image-quality` |

## Prompt writing (from our Hermes image-generation skill)
1. Order: **background/scene → subject → key details → constraints**.
2. Materiality: not "jacket" but "navy blue tweed jacket"; describe texture, shape, material.
3. Semantic positives instead of negatives: say what SHOULD be in frame, not what should not.
4. Text inside image: quote the literal string ("VESQOR"), describe typography, keep it short (headline + one subline max).
5. Aspect ratio: pass `--ratio` (supported values vary by model; 16:9, 1:1, 4:5, 3:2, 21:9 usually OK).

## Operational facts
- Response returns `b64_json` or a URL; script downloads and writes the file. Extension follows `media_type` (not hardcoded).
- If a parameter is unsupported the endpoint silently drops it (no error) — check output matches intent.
- Invalid enum value (e.g. ratio the model lacks) → hard 400. When in doubt use a ratio the model supports.
- Billing is all-or-nothing: a failed generation returns 502 and is not charged.
- Copy the produced file somewhere durable right away if you need it later (script writes under /tmp by default).

## Cost notes
Actual `cost_usd` is printed to stderr — read it. Never estimate from token pricing (100x off); use the returned cost.