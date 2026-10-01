---
title: Foundations
description: The scales everything else is built from.
---

# Foundations

| Page | Settled? |
|---|---|
| [Tokens, brands and Figma sync](tokens-and-brands.md) | ✅ |
| [Grid, spacing and radius](grid-spacing-and-radius.md) | ✅ |
| [Typography](typography.md) | ✅ |
| [Colour](colour.md) | ✅ brand ramp settled on the repo values (`brand/600` #007FAB) |
| [Elevation](elevation.md) | ✅ five shadow steps and six layer tokens |
| [Motion](motion.md) | ⚠️ colour transitions only — no duration or easing scale yet |
| [Icons](icons.md) | ✅ Lucide, one scale — `.rtl-mirror` is defined but unused |
| [Accessibility](accessibility.md) | ✅ WCAG 2.1 AA, gated by `npm test` |

Every number on these pages comes from `packages/tokens/`. If one disagrees with
a token, the token is right and this page is stale — raise it.
