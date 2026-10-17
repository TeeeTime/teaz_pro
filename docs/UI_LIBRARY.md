# UI library (`teaz_pro_ui`)

Every app's frontend builds on the shared Vue component library
**`teaz_pro_ui`** (`https://github.com/TeeeTime/teaz_pro_ui`), npm package
`@teeetime/teaz-pro-ui`. It holds everything that looks or behaves the same
in every app: the top bar, the grid, icons, dashboard tiles, theme
switching and the theme tokens. Apps install it, they don't copy from it.

## What's in it

| Export | What |
| ------ | ---- |
| `TopBar` | App header. Left slot for the app's name/branding, avatar menu with built-in theme cycling, `menuItems` prop, emits `select`. See [Style guide](STYLE_GUIDE.md#topbar). |
| `GridLayout`, `GridItem` | Square-cell, container-query-driven grid (`columns`, `gap`, `colSpan`, `rowSpan`, `clickable`). |
| `Icon` | `<Icon name="box" />`, name-based lookup over Lucide. See [Style guide](STYLE_GUIDE.md#no-emoji). |
| `AppTile`, `AgendaTile`, `StatSparklineTile`, `StatusListTile`, `ProgressListTile`, `SearchFieldTile` | Presentational tile contents, meant to sit inside a `GridItem`. List tiles page through rows that don't fit. |
| `NoAccessTile` | Stand-in for an app's tile when the user lacks its role; put it in a non-clickable `GridItem`. |
| `useTheme()`, `THEMES`, `THEME_LABELS` | Shared theme state (`light` / `dark` / `dark-blue`) on `<html data-theme>`, saved in `localStorage`. |
| `AppStat`, `AgendaEvent`, `StatusRow`, `*Props` | TypeScript types. |
| `themes.css` | The tokens from [`tokens/themes.css`](../tokens/themes.css). |
| `base.css` | House reset and `body` styles (font, background, colors). |
| `style.css` | The compiled styles of all components. |

The library's own README lists the details per component, and
`src/components/grid/README.md` there explains the grid's sizing.

## Setting up an app

**1. Install**, pinned to a release tag (the library's README and its
GitHub tags show the newest one):

```sh
cd frontend
npm install github:TeeeTime/teaz_pro_ui#v0.3.0
```

`package.json` then contains:

```json
"@teeetime/teaz-pro-ui": "github:TeeeTime/teaz_pro_ui#v0.3.0"
```

npm clones the repo and builds it on install (its `prepare` script), so
there's no registry and no token involved. `@lucide/vue` comes along as a
dependency of the library; apps don't add it themselves.

**2. Load tokens and styles.** `src/assets/main.css`:

```css
@import '@teeetime/teaz-pro-ui/themes.css';
@import '@teeetime/teaz-pro-ui/base.css';

#app {
  min-height: 100vh;
}
```

`src/main.ts`:

```ts
import './assets/main.css'
import '@teeetime/teaz-pro-ui/style.css'
```

All three are required: without `themes.css` every color is unset,
without `style.css` the components render unstyled. Apps don't keep their
own copy of `themes.css` or `base.css`.

**3. Use `TopBar` and `useTheme()` in `App.vue`:**

```vue
<script setup lang="ts">
import { TopBar, useTheme } from '@teeetime/teaz-pro-ui'
import type { TopBarMenuItem } from '@teeetime/teaz-pro-ui'
import { useAuth } from '@/auth'

// Applies the saved/system theme to <html data-theme> before first render.
useTheme()

const auth = useAuth()

function onMenuSelect(item: TopBarMenuItem) {
  if (item.label === 'Sign out') auth.logout()
}
</script>

<template>
  <TopBar :user-name="auth.user.value?.name" @select="onMenuSelect">
    <span class="app-name">Teaz Inventory</span>
  </TopBar>
  <!-- app content -->
</template>
```

Everything else is imported the same way, by name from the package root:

```ts
import { GridLayout, GridItem, AppTile, Icon } from '@teeetime/teaz-pro-ui'
```

**4. Docker build.** The library comes from GitHub, so the build stage needs
`git` (not included in `node:*-alpine`):

```dockerfile
COPY package.json package-lock.json ./
RUN apk add --no-cache git && npm ci
```

Portal's `frontend/Dockerfile` already does this.

## Rules

- **Use, don't copy.** If a component exists in the library, import it.
  Don't copy a library component into an app to tweak it: either the
  change is useful everywhere (then make it in the library, see below) or
  it's app-specific (then wrap the library component or use its slots).
- **App-specific stays in the app.** Anything that knows which app it's in
  (texts like "Search ecosystem…", app data, API calls, forms of one app)
  is passed in via props/slots or lives in the app. Portal's
  `QuickFormTile.vue` is an example of a tile that stays in the app.
- **Generic goes to the library.** A new component that a second app would
  use the same way (no app knowledge, only props/slots/events) belongs in
  `teaz_pro_ui`, not in the app that happens to need it first. Ask: "does
  this know anything about what app it's in?"
- **Everything the [Style guide](STYLE_GUIDE.md) requires** applies to the
  library as well: tokens only, no rounded corners, Lucide icons via
  `Icon`, works at ~375px and ~700px.
- **Pin a tag, never a branch.** `#v0.3.0`, not `#main`: a branch reference
  changes under you on the next `npm install`, a tag doesn't.

## Changing the library

1. Make the change in `teaz_pro_ui` and run `npm run build` and
   `npm run type-check` there.
2. Try it in an app before releasing, from that app's `frontend/`:

   ```sh
   npm install ../../teaz_pro_ui
   npm run dev
   ```

   This temporarily points `package.json` at the local folder. Don't commit
   it like this.
3. Release (in `teaz_pro_ui`):

   ```sh
   # bump "version" in package.json, commit, then:
   git tag v0.2.0
   git push --follow-tags
   ```

   Versions follow semver: patch for fixes, minor for new components or
   props, major (or, while below 1.0, minor) for breaking changes such as a
   renamed prop or export. Breaking changes get a line in the commit
   message so apps know what to adjust.
4. Update each app, from its `frontend/`:

   ```sh
   npm install github:TeeeTime/teaz_pro_ui#v0.3.0
   ```

   This sets the tag in `package.json` and the commit in
   `package-lock.json`. Only editing the tag in `package.json` and running
   a plain `npm install` is **not** enough: npm keeps the old commit from
   the lock file. Check the app, commit `package.json` and
   `package-lock.json` together, deploy with `--build`.

Apps update when they want to; an older tag keeps working.

## Changing tokens

[`tokens/themes.css`](../tokens/themes.css) in this repo stays the source of
truth. After changing it, copy it to `src/styles/themes.css` in
`teaz_pro_ui` (keep the one-line header), release a new library version,
and update the apps. The Keycloak theme keeps its own copy, see
[Color schemes](COLOR_SCHEMES.md).
