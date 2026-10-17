# Style guide

House visual direction for every app in the ecosystem. Component paths
below (`src/components/...`) point into `teaz_pro_ui`, the shared component
library.
Adopted 2026-10-13, in reaction to the dashboard reading as generic/"AI
slop" — the fix wasn't a redesign, it was removing the defaults that cause
that look (rounded corners everywhere, emoji as icons, an unconsidered
font) and replacing them with a small, deliberate set of choices.

## The core rule

**Simple is good. Functionality and usability come first.** Every choice
below exists to reduce visual noise, not add personality. If a future
addition makes a screen busier without making it more usable, that's a
signal to cut it, not to find a tasteful way to fit it in.

## No rounded corners

`--radius-sm` / `--radius-md` / `--radius-lg` in `tokens/themes.css`
are all `0`. They still exist as tokens — components still write
`border-radius: var(--radius-md)` rather than hardcoding `0` — so the
decision lives in one place and (if ever revisited) changes in one place,
not by hunting through every component.

This targets UI chrome: cards, buttons, inputs, menus, and is **unrelated
to how an icon's own glyph is drawn** — an icon's internal curves (a
circle for a magnifying glass, Lucide's rounded stroke caps) are a
separate concern, not a stray rounded corner. See the icon system below.

**One deliberate exception: the profile avatar is round** (`border-radius:
50%` in `TopBar.vue`), not sharp. An avatar is conventionally circular
strongly enough that fighting it reads as an oversight rather than a
considered choice — this is the one piece of UI chrome where the
convention wins over the house default. It's explicit and commented in
`TopBar.vue` so it doesn't get "fixed" back to square by someone applying
the no-rounded-corners rule mechanically.

Chart marks are a deliberate exception too: a sparkline's line/end-dot use
`round` linecap/linejoin, per the `dataviz` skill's own mark spec — that's
an established, considered data-visualization convention, not a stray
rounded corner.

## No emoji

Every icon comes from [Lucide](https://lucide.dev) (`@lucide/vue`),
referenced by name through `src/components/icons/Icon.vue`
(`<Icon name="box" />`), never a Unicode emoji character in markup or mock
data. Emoji render inconsistently across platforms, carry an informal/
decorative tone, and are a large part of what reads as generic
AI-generated UI.

`Icon.vue` maps a small set of short names (`analytics`, `box`, `card`,
`calendar`, `search`, `bell`, ...) to Lucide components, so call sites
(`<Icon name="..." />` in mock data and templates) don't need to know
Lucide's own `PascalCase` export names or import anything themselves.
Icon **size** is controlled by the consumer via CSS (`.foo__icon { width:
28px; height: 28px; }`) — a CSS rule always wins over Lucide's `size` prop
default, so this works without passing `size` anywhere. Lucide's own
stroke defaults (width 2, round caps/joins) are kept as-is — that's the
library's visual identity, deliberately not fought.

To add an icon: import it from `@lucide/vue` and add a `name: Component`
entry to the `ICONS` map in `Icon.vue`.

(History: icons were originally a small hand-drawn SVG set with no
external dependency; the project switched to Lucide by request. The
`name`-based `<Icon name="..." />` API didn't change across that swap —
only `Icon.vue`'s internals did — which is why it's worth keeping that
indirection even though Lucide alone could be called directly.)

Status indicators (the Status tile's good/warning/critical rows) are the
one place emoji used to carry meaning (🟢/🟡/🔴) and now don't: a small
square swatch (`--color-status-good` / `-warning` / `-critical`) paired
with a **visible text label** ("Operational" / "Degraded" / "Down"), never
color alone — see `COLOR_SCHEMES.md` for why the label isn't optional
(the warning swatch is genuinely low-contrast as a lone mark on light
surfaces).

## Typography

**IBM Plex Sans**, loaded via Google Fonts in `index.html` (weights 400,
500, 600, 700) and referenced everywhere through the `--font-sans` token
in `themes.css` — never hardcode a font-family in a component. Chosen for
being professional and legible without being the default-everywhere choice
(Inter) that's become a visual shorthand for generic SaaS/AI-generated UI.

Fallback stack after Plex: system UI fonts (`-apple-system`,
`BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, `Helvetica`, `Arial`,
`sans-serif`) — not a second web font, so a slow/blocked font load
degrades to the platform's native sans rather than a mismatched look.

## Responsive and flexible by default

Design and test against the full range a user might actually have open,
not just a full desktop window:

- **Mobile widths** (~360–420px) — the common case, not an edge case.
- **Partial desktop width** (~640–900px) — someone with the window at
  half their screen, snapped next to another app. This is a real, common
  way these apps get used and isn't "the mobile breakpoint happens to
  also catch it" — design for it explicitly.
- **Full desktop width** — the default assumption, but not the only one.

`GridLayout` already does this correctly and is the model to follow:
container-query-driven (responds to the space it actually has, not
`window.innerWidth`, so it also works correctly if ever nested somewhere
narrower than the full page), not a fixed set of device breakpoints bolted
on afterward. See `src/components/grid/README.md`.

When building a new layout piece: ask what it looks like at 375px and at
~700px before considering it done, the same way `GridLayout`'s container
queries were verified at exactly those widths (see its README's
verification section).

## TopBar

`src/components/layout/TopBar.vue` is meant to be reused, unmodified,
across every app in the ecosystem — it carries no portal-specific content.
Currently: a round avatar (initials, generated from `userName`) that opens
a menu on click (closes on outside click or Escape), and on the left the
app's short name (`appName`: "Portal", "Pulse", without "Teaz"; the default
slot replaces it if an app ever needs custom branding). Every app except
the portal also passes `homeUrl="https://portal.teaz.pro"`, which puts a
home button before the name, so there's always one click back to the
portal.

The menu has two parts:

- **Theme**, fixed at the top, separated by a divider — cycles
  light → dark → dark-blue on repeated clicks (`useTheme()`'s
  `cycleTheme()`) and shows the current theme's name. Built into `TopBar`
  itself, not passed in via props, specifically so every app gets working
  theme switching for free just by using the component — no per-app wiring,
  no risk of one app forgetting it or implementing it differently. Clicking
  it does **not** close the menu (unlike the items below) — cycling is
  non-destructive and likely to get clicked a few times in a row to compare
  themes, so closing-then-requiring-a-reopen per click would be annoying.
  There used to be a separate 3-button `ThemeSwitcher` component sitting in
  the dashboard's own page header; it's gone, replaced by this.
- **App-provided items** below the divider — `menuItems` prop (default
  Profile/Settings/Sign out, each `{ label, icon? }`). Emits `select` with
  the clicked item and closes the menu — the app decides what happens,
  `TopBar` doesn't.

Props: `appName`, `homeUrl` (see above), `userName` (default `'Guest User'`),
`menuItems` (see above).

Scope is still deliberately narrow beyond avatar+menu+theme — don't fold in
search or notifications here without that being asked for.

## Checklist for new components

1. Colors from `themes.css` custom properties only — never a hardcoded
   hex (see `COLOR_SCHEMES.md`).
2. `border-radius` from `--radius-*` tokens, which are `0` — don't
   hardcode a corner radius, don't add a new rounded element. The avatar's
   `border-radius: 50%` is the one explicit, documented exception — it
   doesn't set a precedent for adding more.
3. Icons from `Icon.vue` by name — never an emoji character, in markup or
   mock data.
4. Font from `--font-sans` — never hardcode a `font-family`.
5. Check the component's own layout at ~375px and ~700px wide before
   calling it done, not just full desktop width.
6. If it knows nothing about the app it's in, it goes into `teaz_pro_ui`,
   not into the app (see [UI library](UI_LIBRARY.md#rules)).
