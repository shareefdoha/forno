# Forno — React + local PostgreSQL

Your static `forno-redesign.html` is now a React app with a PostgreSQL-backed
menu and an admin CMS at `/admin`. The visual design is unchanged: the Tailwind
tokens and your `<style>` block were carried over verbatim.

**No cloud account is involved.** The database runs on this machine.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

That starts both halves at once:

| | |
|---|---|
| Website | <http://localhost:5173> |
| Admin CMS | <http://localhost:5173/admin> |
| API | <http://localhost:3001> |

Run them separately with `npm run dev:api` and `npm run dev:web` if you prefer.

### Your login

The account is created the first time the API starts. Set `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in `.env` (git-ignored) before that first run to choose them;
otherwise a random password is generated and printed once in the API console.

Credentials are deliberately **not** written down in this file — it is tracked
in git. To change the password later, see *Managing the admin account* below.

---

## How it fits together

```
Browser  ──>  Vite (5173)  ──proxy──>  Express API (3001)  ──>  PostgreSQL
                                              │
                                              └──>  server/data/uploads (photos)
```

The database is **PGlite** — genuine PostgreSQL compiled to WebAssembly,
running inside the Node process and persisting to `server/data/pgdata`. Same
SQL, same types, same constraints as a server install, but nothing to install
and no administrator rights needed.

Everything the CMS writes goes into that database and survives restarts.
Nothing is stored in the browser except your session token.

---

## Where your CSS and assets live

| What | Where it went | Notes |
|---|---|---|
| The `<style>` block from `forno-redesign.html` | `src/styles/custom.css` | Copied **verbatim** — `.arch`, `.ember`, `.glass`, `.btn-amber`, `.reveal`, `.lift`, `.tab-active`, the RTL rule, the reduced-motion block, all unchanged |
| The `tailwind.config` object | `tailwind.config.js` | Same tokens: `ink`, `char`, `stone`, `amber`, `ember`, `cream`, `muted`, `font-display`/`font-sans`/`font-ar`, `max-w-shell` |
| Google Fonts `<link>` | `index.html` `<head>` | Bodoni Moda + Manrope + IBM Plex Sans Arabic, unchanged |
| `img/logo.png` | `public/img/logo.png` | Referenced as `/img/logo.png` |

**Adding more CSS** — paste it at the bottom of `src/styles/custom.css`, under
the marked line. It loads after Tailwind, so your rules win without `!important`.

**Adding images or fonts** — drop them in `public/`: `public/img/hero.jpg` →
`src="/img/hero.jpg"`. Files there are copied to the build untouched.

> `main.css` and `main.js` in the project root are byte-identical copies of the
> Tailwind CDN bundle, not your code. Tailwind is compiled at build time now, so
> both are unused and safe to delete.

---

## What the client can do at `/admin`

**Menu items** (`/admin`)

- Create, edit and delete dishes
- Upload a photo — stored in `server/data/uploads`, served from `/uploads`
- Or paste an external image URL instead
- Flip **Enabled / Disabled** with one click
- Filter by category, search by name
- English **and** Arabic name and description per dish

**Categories** (`/admin/categories`)

- Add, rename, reorder (`sort_order`, lowest first) and delete
- **Shown / Hidden** hides a category from the website without deleting it
- Deleting a category deletes its dishes too (`ON DELETE CASCADE`)

### What Enabled / Disabled does

Disabling a dish **removes it from the website** — card and WhatsApp order link
both go. It stays in `/admin` with a greyed switch so it can be switched back
on. Nothing is deleted; price, photo and description are kept.

Use it for a dish that's off this week. Use **Delete** for one that's gone.

### Empty categories disappear too

A category only appears on the website while it has at least one **enabled**
dish. Disable the last one and the tab goes, so nobody clicks through to an
empty grid. `/admin` always lists every category.

---

## Managing the admin account

Sessions last 14 days and are stored in the `sessions` table.

To add a user or change a password without losing your menu, run this from the
project root:

```bash
node -e "import('./server/db.js').then(async m => { await m.db.waitReady; await m.migrate(); const a = await import('./server/auth.js'); console.log(await a.createUser('you@example.com','your-new-password')); process.exit(0) })"
```

It creates the account, or updates the password if the email already exists.

---

## Project structure

```
index.html                  Vite entry — <head>, fonts, #root
vite.config.js              proxies /api and /uploads to the API server
tailwind.config.js          your CDN config, unchanged
.env                        optional ADMIN_EMAIL / ADMIN_PASSWORD (git-ignored)

server/
  index.js                  Express API — auth, CRUD, uploads
  db.js                     PGlite (PostgreSQL) + schema
  auth.js                   scrypt password hashing, session tokens
  seed.js                   loads the 15 categories and 67 dishes
  data/                     the database and uploaded photos (git-ignored)

supabase/                   unused leftovers from the Supabase attempt;
                            safe to delete

src/
  main.jsx                  imports Tailwind then custom.css
  App.jsx                   routes, React Query, auth provider
  styles/
    tailwind.css            @tailwind directives
    custom.css              ← YOUR ORIGINAL CSS
  lib/
    apiClient.js            fetch wrapper + session token
    constants.js            phone, WhatsApp, social links, hero photos, reviews
    demoData.js             the original 67 dishes — used by the server seed
    utils.js
  api/menu.js               every API call the app makes
  hooks/
    useMenu.js              React Query hooks
    useReveal.js            the IntersectionObserver scroll reveal
    useCounter.js           the animated stat counters
  context/
    LanguageContext.jsx     EN/AR toggle (replaces the data-i18n DOM swap)
    BookingContext.jsx      booking modal state
    AuthContext.jsx         session handling
  i18n/translations.js      EN + AR strings, same keys as the old data-i18n
  components/
    Header  Hero  Story  MenuSection  CategoryTabs  MenuItem
    WhyForno  Reviews  Contact  BookingForm  Footer  BookingModal
    admin/  AdminShell  ItemFormModal  ConfirmDialog  ProtectedRoute
  pages/
    Home.jsx
    admin/  Login.jsx  Dashboard.jsx  Categories.jsx
```

---

## Backing up

Everything lives in **`server/data/`** — the database and every uploaded photo.
Copy that folder and you have a complete backup. Restore by copying it back.

It's git-ignored, so it is **not** in your repository. Back it up separately.

---

## Deploying

This is **not** a static site. The browser gets every dish from `/api`, so a
host that only publishes `dist/` gives you an empty menu, the message "Cannot
reach the API server", and a dead admin login. It needs a host that runs Node.

`server/index.js` already serves `dist/` itself, so one process is the whole
site — no separate web server, no reverse proxy to configure.

### Hostinger (Node.js app)

Use hPanel's **Node.js app** section. Do *not* use the GitHub/static website
deploy — that pipeline builds the project, looks for a folder to publish, and
fails with `No output directory found after build`. Even when pointed at
`dist/` it only uploads the frontend and leaves the API behind.

1. **Node.js app** → application root = the project folder, **startup file =
   `server/index.js`**, Node version **20 or newer**.
2. Set the environment variables in the panel:

   | Variable | Value |
   |---|---|
   | `DATA_DIR` | `/home/<user>/forno-data` — outside the app folder, so a redeploy can't wipe it |
   | `ADMIN_EMAIL` | the owner's login |
   | `ADMIN_PASSWORD` | set it here, never in a committed file |
   | `NODE_ENV` | `production` |

   Leave `PORT` alone — the panel injects it and the server reads it.
3. Build the frontend over SSH, from the app folder:

   ```
   npm run build:host
   ```

   Use that script rather than `npm run build`. `NODE_ENV=production` makes
   `npm install` skip devDependencies, and Vite is one of them — plain
   `npm run build` fails with `vite: not found`. `build:host` reinstalls them
   first.
4. Restart the app, then check `https://<your-domain>/api/health`. It should
   return `{"ok":true, ... "categories":15,"items":67}`.

If the site 404s but `/api/health` answers, `dist/` is missing — step 3 didn't
run. The startup log says so explicitly.

### Data and backups

Everything persistent lives under `DATA_DIR`: the database in `pgdata/` and
uploaded photos in `uploads/`. Keep it outside the deploy folder and back it up
separately — it is not in the repository.

PGlite is **single-process**. If the panel ever runs more than one instance of
the app, two processes opening the same `pgdata/` will corrupt it. Keep the
instance count at 1, or move to the MySQL server the hosting plan already
includes.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Cannot reach the API server" | The API isn't running — use `npm run dev`, not `npm run dev:web` |
| Menu empty, no error | Database seeded but every dish is disabled, or every category hidden |
| Login says "Wrong email or password" | Wrong credentials, or `server/data/pgdata` was deleted and rebuilt with different ones |
| Signed out unexpectedly | Session older than 14 days, or the database was reset |
| Uploads fail | `server/data/uploads` isn't writable |
| Deploy says `No output directory found after build` | Deployed as a static site — use the Node.js app instead (see Deploying) |
| Live site 404s but `/api/health` answers | `dist/` was never built on the host — run `npm run build:host` |
| `vite: not found` on the host | `NODE_ENV=production` skipped devDependencies — use `build:host`, not `build` |
| Port 3001 in use | Set `API_PORT` in `.env` and update the proxy target in `vite.config.js` |
