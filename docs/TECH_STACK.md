# Tech stack & conventions

Every app in the Teaz ecosystem shares the same stack and conventions. This
doc is the reference for that stack — what each app is built from, how it's
scaffolded, how it's run, and the decisions that should carry over to the
next app rather than being re-derived or re-debated each time.

`teaz_pro_portal` was the first app and is the reference implementation:
when this doc says "see portal", look there for working code.

## Stack

| Layer    | Choice                                              |
| -------- | ---------------------------------------------------- |
| Frontend | Vue 3 + TypeScript, scaffolded via `create-vue`, built with Vite |
| Backend  | Spring Boot (Maven), Java 21                          |
| Layout   | One repo per app, each with a `frontend/` and `backend/` folder |
| Shared   | This repo (`teaz_pro_assets`): docs, color tokens, Keycloak theme |

Versions in portal, as of this writing: Vue `^3.5`, Vite `^8.2`,
TypeScript `~6.0`, Spring Boot `4.1.1`, Java `21`. Pin whatever the
Initializr/`create-vue` default is at scaffold time for a new app — don't
chase matching portal's exact versions later.

## Scaffolding a new app

Replace `<app>` below with the new app's name (lowercase, matches
`artifactId`).

**Frontend:**

```sh
npm create vue@latest frontend -- --typescript
```

Only `--typescript` is used — no router/Pinia/ESLint/testing added by
default. Add those per-app only if that app actually needs them (e.g. a
multi-page app needs `--router`); don't add them reflexively.

Then copy `tokens/themes.css` from this repo to
`frontend/src/styles/themes.css` and import it first in `src/assets/main.css`
(see [Color schemes](COLOR_SCHEMES.md)).

**Backend**, via Spring Initializr (check `https://start.spring.io/metadata/client`
first for the current default `bootVersion` — it moves, and the Initializr
only serves `.zip`s for currently-supported Spring Boot versions, not
arbitrary past ones):

```sh
curl -s https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=<current default from metadata> \
  -d baseDir=backend \
  -d groupId=pro.teaz \
  -d artifactId=<app> \
  -d name=<app> \
  -d packageName=pro.teaz.<app> \
  -d javaVersion=21 \
  -d dependencies=web \
  -o backend.zip && unzip -q backend.zip -d . && rm backend.zip
```

- `groupId` is always `pro.teaz`.
- `artifactId`/`packageName` match the app name.
- Add more `-d dependencies=` values (comma-separated) only for what that
  app actually needs (e.g. `web,data-jpa,postgresql` if it has a database).

**House convention:** rename the generated main class from
`<App>Application` to plain `Application` (and its test class to
`ApplicationTests`). Keeps the entry point name uniform across every app
regardless of app name.

```sh
cd backend
mv src/main/java/pro/teaz/<app>/<App>Application.java src/main/java/pro/teaz/<app>/Application.java
mv src/test/java/pro/teaz/<app>/<App>ApplicationTests.java src/test/java/pro/teaz/<app>/ApplicationTests.java
sed -i '' 's/<App>Application/Application/g' src/main/java/pro/teaz/<app>/Application.java src/test/java/pro/teaz/<app>/ApplicationTests.java
```

Verify both halves build before moving on:

```sh
cd backend && ./mvnw -q compile
cd frontend && npm install && npm run build
```

## Running locally

No Docker for local dev — it's unnecessary overhead for a Vite dev server
and a Spring Boot app that both already hot-reload on their own. Plain:

```sh
cd backend && ./mvnw spring-boot:run
cd frontend && npm run dev
```

### IntelliJ

Each app checks in three run configs under `.idea/runConfigurations/`, so
they show up in IntelliJ's Run dropdown without manual setup:

- **Backend (Spring Boot)** — Maven run config, goal `spring-boot:run`,
  working dir `backend/`.
- **Frontend (npm run dev)** — npm run config, script `dev`, package.json
  in `frontend/`.
- **Run All (Frontend + Backend)** — compound config launching both.

For a new app, copy the three XML files from portal, rename them and the
`name=` attributes inside. The `$PROJECT_DIR$/backend` /
`$PROJECT_DIR$/frontend` paths stay correct as long as the app follows the
same folder layout.

Everything else under `.idea/` is machine-local and gitignored, via the
root `.gitignore`:

```gitignore
/.idea/*
!/.idea/.gitignore
!/.idea/runConfigurations/
*.iml
```

That includes `misc.xml`, so set the project SDK yourself on each machine:
**Project Structure → Project → SDK**, any locally installed JDK 21.

## Frontend conventions

- **Visual style**: simple over decorative, functionality/usability first —
  no rounded corners, no emoji (Lucide icons instead), IBM Plex Sans as the
  house typeface, every layout designed to work at mobile widths and at a
  half-desktop-screen width, not just full desktop. Full guide, including
  the reasoning and the icon/token mechanics: [Style guide](STYLE_GUIDE.md).
- **Theming**: every themeable value is a CSS custom property from
  `tokens/themes.css` in this repo, scoped per theme under
  `:root[data-theme="..."]`. Three themes exist today: `light`, `dark`,
  `dark-blue`. Components never hardcode a color. Full token reference and
  the checklist for adding a theme/token: [Color schemes](COLOR_SCHEMES.md).
- **Reusable layout primitives**: generic, app-agnostic components (in
  portal: `GridLayout.vue` + `GridItem.vue`, `TopBar.vue`) are kept free of
  any app-specific knowledge on purpose — they're candidates to be pulled
  into a standalone component library shared across apps later. When
  building a new generic UI piece, ask "does this know anything about what
  app it's in?" — if yes, that knowledge belongs in a wrapper component
  (e.g. portal's `AppTile.vue`) or a slot, not the primitive itself. See
  portal's `frontend/src/components/grid/README.md` for a worked example.
- Scaffolding note: `create-vue`'s default boilerplate (welcome page, demo
  icons, Vue-green theme in `base.css`) gets deleted, not kept around — it
  isn't part of this stack's conventions.

## Auth

Login goes through the shared Keycloak at `https://auth.teaz.pro`, realm
`teazpro`, styled with the `teaz` login theme from this repo
(`keycloak-themes/`). Apps never build their own login screen; they
redirect to Keycloak's hosted login page. Local dev stays offline and
login-free via a mock, prod uses the real integration, and both sit behind
the same interface. Portal is the template to copy:

- **Frontend** (`frontend/src/auth/`): components only call `useAuth()`
  (`user`, `logout()`, `getToken()`). `index.ts` picks `keycloakAuth.ts`
  (`keycloak-js`) when `VITE_KEYCLOAK_URL` is set, otherwise `mockAuth.ts`.
  `.env.production` sets it, so `npm run build` gets Keycloak and
  `npm run dev` gets the mock. Keycloak runs in `login-required` mode with
  PKCE: the app only mounts after a successful login.
- **Backend** (`backend/.../security/`): with the `prod` Spring profile,
  `SecurityConfig` makes every request require a Keycloak Bearer JWT
  (issuer from `application-prod.properties`). Without it,
  `MockSecurityConfig` permits everything.

Keycloak client setup for an app (Clients → Create client in realm `teazpro`):

- Client ID = app name (e.g. `portal`), **Client authentication off**
  (public client), only **Standard flow** enabled.
- Advanced → **PKCE Method `S256`**.
- Valid redirect URIs `https://<app>.teaz.pro/*`, Valid post logout
  redirect URIs `https://<app>.teaz.pro/*`, Web origins
  `https://<app>.teaz.pro`.

To test against the real Keycloak from your machine, add
`http://localhost:5173/*` and `http://localhost:5173` to the client
temporarily and run `npm run dev -- --mode production`.

## Deployment

- One server hosts every app in the ecosystem.
- Each app gets its own subdomain (e.g. `portal.teaz.pro`,
  `inventory.teaz.pro`); a single shared **Traefik** instance on the server
  routes by `Host` header to whichever app's containers claim it. Traefik
  was the pick over hand-written Nginx server blocks specifically because
  adding the next app means adding Docker labels to its own compose file,
  not editing a shared proxy config.
- Apps don't run their own reverse proxy — they join the external Docker
  network `proxy` and label their containers with their subdomain and the
  cert resolver `le`.
- Each app has a `compose.yml` at its repo root and is deployed with
  `git pull && docker compose up -d --build`. The frontend is built with
  Vite and served by nginx (SPA fallback); the backend runs as a Spring
  Boot jar with `SPRING_PROFILES_ACTIVE=prod` under `/api` on the same
  host, so no CORS is needed. Portal's `compose.yml` and Dockerfiles are
  the template.
- No database unless an app actually needs one. A database, if needed,
  belongs to that app's own compose file, not a shared instance.

Docker is for deployment only. Local dev stays Docker-free.
