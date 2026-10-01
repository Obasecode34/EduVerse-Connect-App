# App assets

`app.json` already points at every file listed below. Drop them in with these
exact filenames and the app picks them up — no config changes needed.

Until these exist, Expo falls back to its own default icons. That's fine for
development, but a production build (`eas build`) will fail or ship with the
Expo logo, so these need to be real before release.

| File | Size | Notes |
|---|---|---|
| `icon.png` | 1024×1024 | Main app/store icon. **No transparency** — iOS rejects alpha channels. No rounded corners either; the OS applies its own mask. |
| `adaptive-icon.png` | 1024×1024 | Android foreground layer. Keep all meaningful content inside the **center 66%** (roughly a 676×676 circle) — Android crops the edges differently per device/launcher shape. Transparency IS expected here, since `backgroundColor` (#111827) sits behind it. |
| `splash.png` | 1284×2778 | Or just a centered logo (~1200×1200) on a transparent background — `resizeMode: "contain"` and the #111827 background handle the rest. |
| `favicon.png` | 196×196 | Used by Expo's web build target. (The separate Vite web app has its own favicon in `web/public/` — see that folder's README.) |

## Background color

`#111827` is set in `app.json` for both the adaptive icon and the splash
screen. If your logo is dark, change that value or the icon will disappear
into it.
