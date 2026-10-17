# Keycloak themes

Login theme `teaz` for the shared Keycloak at `auth.teaz.pro`, following
the same rules as the apps (`docs/STYLE_GUIDE.md`,
`docs/COLOR_SCHEMES.md`): sharp corners, IBM Plex Sans, colors
only from the house tokens, light / dark / dark-blue.

## How it works

`teaz/login` extends Keycloak's built-in `keycloak.v2` login theme
(PatternFly 5) instead of replacing its templates. That way every login
page (login, reset password, OTP, required actions, errors, ...) is
covered, and Keycloak upgrades keep working.

| File | Role |
| ---- | ---- |
| `theme.properties` | Parent theme, stylesheets, script; turns off keycloak.v2's own dark mode. |
| `resources/css/tokens.css` | **Verbatim copy** of `tokens/themes.css` in this repo. When the tokens change there, copy the file here again (keep the one-line header). |
| `resources/css/teaz.css` | Maps PatternFly's variables onto the tokens, plus a few layout tweaks. Never hardcode a color here either. |
| `resources/js/theme.js` | Applies the theme before first paint and adds the theme toggle (top right, cycles like the TopBar). Stored in `localStorage` on the auth domain, default follows the OS setting. |

## Deploying

Mount the folder into the Keycloak container (in Keycloak's own compose file):

```yaml
volumes:
  - /path/to/teaz_pro/keycloak-themes/teaz:/opt/keycloak/themes/teaz:ro
```

Then in the admin console, realm `teazpro`:

- **Realm settings → Themes → Login theme:** `teaz`
- **Realm settings → General → Display name:** e.g. `Teaz` (shown above the card)

Keycloak caches themes in production mode, so restart the container after
changing theme files.

## Developing locally

Start Keycloak in dev mode (theme caching off) with the theme mounted,
create a test realm with `loginTheme=teaz`, and open
`http://localhost:<port>/realms/<realm>/account`. CSS and JS changes show
up on reload.
