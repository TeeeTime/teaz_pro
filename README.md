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
| `teaz_pro_pulse` | Pulse: status, uptime and start/stop/restart of every container (apps, Traefik, Keycloak, Postgres); `/api/health` for other apps. | `https://pulse.teaz.pro` |
| `teaz_pro_study` | Study: upload lecture material, Claude turns it into lectures with interactive study pages, tasks, progress and a chat per lecture. | `https://study.teaz.pro` |
| `teaz_pro_transit` | Transit: each user picks a stop or station and sees its live departure board (GTFS from gtfs.de, all of Germany, with realtime); `/api/board` for a Portal tile. | `https://transit.teaz.pro` |
| `teaz_pro_fitness` | Fitness: each user links their Strava account and sees their latest runs and a weekly-kilometers chart; `/api/runs/latest` and `/api/runs/weekly` for Portal tiles. | `https://fitness.teaz.pro` |
| `teaz_pro_calendar` | Calendar: each user connects their Apple (iCloud) calendar over CalDAV and sees their events by day, week and month; synced into its own database every 15 minutes. | `https://calendar.teaz.pro` |
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
| [`assets/favicon.ico`](assets/favicon.ico) | The Teaz favicon (16 + 32 px): **source of truth**, copied to every app's `frontend/public/favicon.ico` (the template has it) and the Keycloak theme's `resources/img/`. Change it here, then copy it again. |
| [`keycloak-themes/`](keycloak-themes/README.md) | `teaz` login theme for `auth.teaz.pro`. |
