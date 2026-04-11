# LINE Seed JP Japanese Font — Design

## Goal

Add LINE Seed JP as the Japanese font for all Japanese text (station names, basin names, river names) in the app, without modifying any component code.

## Problem

`next/font/google` does not include LINE Seed JP in its bundled font catalog (as of Next.js 16). A direct Google Fonts CDN link is required.

## Design

### Loading — `app/layout.tsx`

Add a `<head>` block inside `<html>` with three link tags:

1. `<link rel="preconnect" href="https://fonts.googleapis.com" />` — reduces DNS/TLS handshake time
2. `<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />` — preconnects to font file host
3. `<link href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@400;700&display=swap" rel="stylesheet" />` — loads weights 400 and 700 with `display=swap` (non-blocking)

### Font stack — `app/globals.css`

Update `@theme`:

```css
--font-sans: var(--font-inter), 'LINE Seed JP', system-ui, sans-serif;
```

### Why this works without component changes

Google Fonts serves LINE Seed JP with `@font-face` rules that include `unicode-range` covering hiragana, katakana, and CJK unified ideographs (kanji). Inter's `@font-face` covers only Latin ranges. When the browser encounters a Japanese character:

- Inter's unicode-range does not match → Inter skipped
- LINE Seed JP's unicode-range matches → LINE Seed JP used

Result: Latin text renders in Inter; Japanese text (including kanji, which LINE Seed JP renders in Japanese variant glyphs — not Chinese variant) renders in LINE Seed JP. No fallback to system Chinese fonts.

## Files changed

- `app/layout.tsx` — add `<head>` with three link tags
- `app/globals.css` — update `--font-sans` in `@theme`
