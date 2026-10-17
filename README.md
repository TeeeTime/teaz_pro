# teaz_pro

Hub of the Teaz ecosystem: the overview of all repos, plus everything
shared between them (conventions, design rules, color tokens, the Keycloak
login theme).

## Repos

| Repo | What | URL |
| ---- | ---- | --- |
| `teaz_pro` | This hub: shared docs, tokens, Keycloak theme. | – |
| `teaz_pro_ui` | Shared Vue component library (`@teeetime/teaz-pro-ui`): TopBar, grid, icons, tiles, `useTheme`, tokens. Installed by apps from GitHub. | – |
| `teaz_pro_template` | Template repo for a new app: the stack from `docs/TECH_STACK.md`, ready to go, plus an init script for the app name. | – |
| `teaz_pro_portal` | Portal, the entry point linking to every app. Reference implementation of the stack. | `https://portal.teaz.pro` |

Login for every app: Keycloak at `https://auth.teaz.pro`, realm `teazpro`.

## Shared

| Path | What |
| ---- | ---- |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Stack, scaffolding a new app, local dev, auth, deployment. Start here. |
| [`docs/UI_LIBRARY.md`](docs/UI_LIBRARY.md) | Using the shared component library `teaz_pro_ui` in an app, and changing/releasing it. |
| [`docs/STYLE_GUIDE.md`](docs/STYLE_GUIDE.md) | House visual rules: sharp corners, Lucide icons, IBM Plex Sans, responsive. |
| [`docs/COLOR_SCHEMES.md`](docs/COLOR_SCHEMES.md) | Token reference and rules for the light / dark / dark-blue themes. |
| [`tokens/themes.css`](tokens/themes.css) | The color and shape tokens: **source of truth**, copied into `teaz_pro_ui` (which apps install) and the Keycloak theme. |
| [`keycloak-themes/`](keycloak-themes/README.md) | `teaz` login theme for `auth.teaz.pro`. |
