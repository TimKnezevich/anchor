# Axis Icon Spec

## Purpose
This spec defines one source SVG and deterministic exports for the Axis extension icon set.

## Source of Truth
- Source file: `assets/brand/axis-mark.svg`
- Build from source only. Do not hand-edit exported PNG files.

## Mark Concept
- Capital `A` made from straight edge segments.
- Include visible node points at segment joints/endpoints.
- Shape intent: line path goes up, down, upper-left, then crosses the `A`.
- Overall feel: graph nodes + edges, half-star geometry.

## Artboard and Geometry
- Artboard: `1024 x 1024`.
- Coordinate system origin: top-left.
- Primary points:
  - `P0 = (256, 832)` left base
  - `P1 = (512, 192)` apex
  - `P2 = (768, 832)` right base
  - `P3 = (352, 544)` left upper interior
  - `P4 = (672, 544)` right upper interior
- Draw straight segments in this exact order:
  1. `P0 -> P1` (up)
  2. `P1 -> P2` (down)
  3. `P2 -> P3` (upper-left)
  4. `P3 -> P4` (crosses the A)

## Visual Rules
- Stroke:
  - Color: `#0B1220`
  - Width: `72`
  - Line cap: `round`
  - Line join: `round`
- Nodes (circles at `P0..P4`):
  - Radius: `42`
  - Fill: `#F97316`
  - Stroke: `#0B1220`
  - Stroke width: `20`
- Background:
  - Square background fill `#F5F7FA` (full artboard).
- Padding:
  - Keep all visible mark content inside a `96px` safe inset from each edge.

## Small-Size Behavior
- Minimum readable raster size: `32 x 32`.
- For `<= 32px` exports:
  - Keep same geometry.
  - Simplify by reducing node stroke width to `0`.
  - Use node radius scaled proportionally with export size.

## Export Set
Export PNGs from the source SVG to:
- `extension/media/icon-16.png` (16x16)
- `extension/media/icon-32.png` (32x32)
- `extension/media/icon-48.png` (48x48)
- `extension/media/icon-64.png` (64x64)
- `extension/media/icon-128.png` (128x128) (VS Code extension icon)
- `extension/media/icon-256.png` (256x256)
- `extension/media/icon-512.png` (512x512) (marketplace/repo)

## File Wiring
- Extension manifest icon should point to:
  - `extension/package.json` -> `"icon": "media/icon-128.png"`

## Naming and Versioning
- Base mark name: `axis-mark`.
- Export naming pattern: `icon-{size}.png`.
- If geometry changes, update this spec and regenerate all exports.

## Acceptance Criteria
- Source SVG exists at `assets/brand/axis-mark.svg` and matches this geometry.
- All export files exist at required paths/sizes.
- `extension/package.json` references `media/icon-128.png`.
- Icon appears correctly in local VSIX install.
