# Color schemes

All theming lives in `tokens/themes.css` (this repo) as CSS custom
properties, scoped per theme under `:root[data-theme="..."]`. The active
theme is just an attribute on `<html>`, switched at runtime by `useTheme()` from
`teaz_pro_ui` and persisted to `localStorage`.

`tokens/themes.css` is the source of truth. Consumers keep a verbatim copy:

- `teaz_pro_ui`: `src/styles/themes.css` (apps import it as
  `@teeetime/teaz-pro-ui/themes.css`, no copy of their own)
- the Keycloak login theme: `keycloak-themes/teaz/login/resources/css/tokens.css`

Change tokens here first, then copy the file to every consumer (keep each
copy's one-line header). See rule 4.

Three themes exist today: `light`, `dark`, `dark-blue` (a navy-tinted dark
theme — same structure as `dark`, different hue).

## Token reference

| Token                    | Purpose                                              |
| ------------------------ | ----------------------------------------------------- |
| `--color-bg`             | Page background, behind all surfaces.                |
| `--color-surface`        | Default background for cards/tiles/panels.            |
| `--color-surface-hover`  | Hover state for an interactive surface.               |
| `--color-surface-active` | Pressed/active state for an interactive surface.      |
| `--color-border`         | Hairline borders on surfaces.                         |
| `--color-text-primary`   | Default body/heading text.                            |
| `--color-text-secondary` | De-emphasized text (captions, descriptions).          |
| `--color-text-on-accent` | Text color placed on top of `--color-accent`.         |
| `--color-accent`         | Primary interactive/brand color (active states, CTAs).|
| `--color-accent-hover`   | Hover state for anything colored with `--color-accent`.|
| `--color-status-good`    | Reserved for positive state, used as **text** (e.g. a stat tile's up-delta) — sized for 4.5:1+ contrast. Never reused for brand/interactive accents or chart series — see rule 3 below. |
| `--color-status-warning` | Reserved for degraded state, used as a small **swatch mark**, always paired with a visible text label (see rule 3). |
| `--color-status-critical`| Reserved for failed/down state, used as a small **swatch mark**, always paired with a visible text label. |
| `--color-shadow`         | Resting elevation shadow color (use with low blur).   |
| `--color-shadow-strong`  | Raised/hover elevation shadow color.                  |

Shape tokens (`--radius-sm`, `--radius-md`, `--radius-lg` — all `0`, see
`STYLE_GUIDE.md`) and `--font-sans` are defined once on bare `:root` —
they're shared geometry/typography, not part of color switching.

## Current values

| Token                     | light     | dark      | dark-blue |
| -------------------------- | --------- | --------- | --------- |
| `--color-bg`               | `#f3f4f7` | `#15171c` | `#0b1420` |
| `--color-surface`          | `#ffffff` | `#1e2127` | `#101f32` |
| `--color-surface-hover`    | `#eef0f4` | `#262a32` | `#15283f` |
| `--color-surface-active`   | `#e6e9f0` | `#2c313a` | `#1a3049` |
| `--color-border`           | `#e1e4ea` | `#2d313a` | `#1c3350` |
| `--color-text-primary`     | `#1a1d24` | `#e9eaed` | `#e6edf7` |
| `--color-text-secondary`   | `#5c6472` | `#9aa1ad` | `#8da3c0` |
| `--color-text-on-accent`   | `#ffffff` | `#0b1020` | `#061018` |
| `--color-accent`           | `#3b6df0` | `#5b8cff` | `#4da3ff` |
| `--color-accent-hover`     | `#2f5bd6` | `#7aa0ff` | `#6fb6ff` |
| `--color-status-good`      | `#006300` | `#0ca30c` | `#0ca30c` |
| `--color-status-warning`   | `#fab219` | `#fab219` | `#fab219` |
| `--color-status-critical`  | `#d03b3b` | `#d03b3b` | `#d03b3b` |

## Rules for staying consistent

1. **Components never hardcode colors.** Every color in a component's
   `<style>` must be one of the tokens above (`var(--color-...)`). If a
   component needs a color that doesn't exist yet, add the token to all
   three themes in `themes.css` first, then use it — don't invent a one-off
   value.
2. **Adding a new theme** means adding a new `:root[data-theme="..."]`
   block in `themes.css` that defines every token in the reference table
   above, and adding the theme's name to the `THEMES` tuple in each app's
   `useTheme.ts` and to `THEMES`/`LABELS` in the Keycloak theme's
   `resources/js/theme.js`. Missing a token means that theme silently falls back to
   nothing (unstyled) for whatever uses it.
3. **Adding a new component that needs a new kind of token** (e.g. a
   semantic "danger" or "success" color): add it to the token reference
   table in this doc and to all three themes at the same time, so no theme
   lags behind. Keep naming semantic (`--color-danger`), not literal
   (`--color-red`). Status colors (`--color-status-*`) are a special case:
   per the `dataviz` skill's reference palette, they're reserved for state
   and deliberately distinct from `--color-accent`/chart series colors, so
   a status color never gets mistaken for a brand action or a data series.
   They also don't need a distinct `dark-blue` value the way most tokens
   do — `dark` and `dark-blue` share the same status values, only `light`
   differs (status colors are "fixed," not re-themed per dark variant).
   `--color-status-warning` is genuinely low-contrast as a lone mark on a
   light surface (1.83:1, below the 3:1 mark floor) — any UI using it must
   pair the swatch with a visible text label, never rely on the color
   alone to carry meaning (see `StatusListTile.vue` in `teaz_pro_ui` for the pattern).
4. **Keep every copy in sync.** After changing `tokens/themes.css`, copy
   it to `teaz_pro_ui`'s `src/styles/themes.css` (then release it and
   bump the version in each app, see [UI library](UI_LIBRARY.md#changing-tokens))
   and to the Keycloak theme's `tokens.css` (see the list at the top), so
   the apps and the login pages at `auth.teaz.pro` never drift apart.
5. **Don't theme shape/spacing per color-scheme.** Radius, spacing, and
   transition timing are intentionally theme-independent — only color
   tokens vary between `light` / `dark` / `dark-blue`.
