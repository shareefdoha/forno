# Forno — React + MySQL

Your static `forno-redesign.html` is now a React app with a MySQL-backed menu
and an admin CMS at `/admin`. The visual design is unchanged: the Tailwind
tokens and your `<style>` block were carried over verbatim.

**No cloud account is involved.** The database is MySQL — locally that is the
one bundled with XAMPP; on the host it is the MySQL the hosting plan includes.

---

## Running it

You need a MySQL server running locally (XAMPP's is fine) and a database for
the app to use. Create it once:

```sql
CREATE DATABASE forno_local
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then point `.env` at it — these five are what `server/db.js` reads:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=forno_local
```

The tables are created for you on first start (`migrate()` in `server/db.js`),
then seeded with the 15 categories and 67 dishes.

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
Browser  ──>  Vite (5173)  ──proxy──>  Express API (3001)  ──>  MySQL
                                              │
                                              └──>  server/data/uploads (photos)
```

The database is **MySQL**, reached through `mysql2`'s connection pool. Route
handlers are still written with Postgres-style `$1, $2` placeholders — `db.js`
rewrites them to MySQL's `?` in `toMysql()`, so the call sites did not all have
to be rewritten by hand when the project moved off PostgreSQL.

Two consequences of that move worth knowing when reading the code:

- MySQL has no `RETURNING`, so `exec()` hands back the result header
  (`insertId`, `affectedRows`) and anything needing the written row does a
  follow-up `one()` by id.
- `DATETIME` columns want `'YYYY-MM-DD HH:MM:SS'`, so `auth.js` converts
  through `toMysqlDatetime()` rather than passing an ISO string.

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
node server/reset-password.mjs you@example.com 'your-new-password'
```

It creates the account, or updates the password if the email already exists, and
deletes that user's existing sessions so any old login stops working.

Use it when the generated first-run password is lost — it is the only way back
in, since the password is stored as a scrypt hash and cannot be read back.

---

## Project structure

```
index.html                  Vite entry — <head>, fonts, #root
vite.config.js              proxies /api and /uploads to the API server
tailwind.config.js          your CDN config, unchanged
.env                        DB_* connection vars, optional ADMIN_EMAIL /
                            ADMIN_PASSWORD and DATA_DIR (git-ignored)

server/
  index.js                  Express API — auth, CRUD, uploads
  db.js                     MySQL pool + schema, $1 → ? translation
  auth.js                   scrypt password hashing, session tokens
  seed.js                   loads the 15 categories and 67 dishes
  env.js                    loads .env before anything reads process.env
  reset-password.mjs        create a user / reset a password from the CLI
  data/                     uploaded photos (git-ignored)

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

A backup is **two** things now, because the database is no longer a folder:

1. **The database** — dump it:

   ```bash
   mysqldump -u root forno_local > forno-backup.sql
   ```

   Restore with `mysql -u root forno_local < forno-backup.sql`.

2. **The uploaded photos** — copy `server/data/uploads/` (or `$DATA_DIR/uploads/`
   if `DATA_DIR` is set, which it is on the host).

Both are git-ignored, so neither is in your repository. Back them up separately.

> Copying `server/data/` alone used to be a complete backup, when the database
> was a PGlite folder inside it. It no longer is — that folder now holds only
> photos, and a backup without the dump above has no menu, categories or logins
> in it.

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
2. Create a MySQL database and user in hPanel's **Databases** section, then set
   the environment variables — either in the panel or in a `.env` file inside
   the app folder (`server/env.js` reads it, and real environment variables win
   over the file, so don't set the same name in both):

   | Variable | Value |
   |---|---|
   | `DB_HOST` | `127.0.0.1` |
   | `DB_PORT` | `3306` |
   | `DB_USER` | the database user hPanel created |
   | `DB_PASSWORD` | its password |
   | `DB_NAME` | the database hPanel created |
   | `DATA_DIR` | `/home/<user>/forno-data` — outside the app folder, so a redeploy can't wipe the photos |
   | `ADMIN_EMAIL` | the owner's login |
   | `ADMIN_PASSWORD` | set it here, never in a committed file |
   | `NODE_ENV` | `production` |

   Leave `PORT` alone — the panel injects it and the server reads it.

   Fill in `ADMIN_EMAIL` / `ADMIN_PASSWORD` or leave them out entirely. Copying
   the example file's `<your-email>` placeholders verbatim creates an account
   literally named `<your-email>`, which you cannot receive mail at.
3. Upload the frontend. `dist/` is git-ignored, so a `git pull` on the host will
   never produce or update it — build locally and copy it up:

   ```
   npm run build
   tar czf - dist | ssh -p <port> <user>@<host> "cd ~/<app-folder> && tar xzf -"
   ```

   Repeat after every change under `src/`. Because `dist/` is ignored rather
   than tracked, an uploaded copy survives later pulls.

   Building on the host with `npm run build:host` also works if you'd rather —
   it exists because `NODE_ENV=production` makes `npm install` skip
   devDependencies, Vite among them, so plain `npm run build` there fails with
   `vite: not found`. `build:host` reinstalls them first.
4. Restart the app, then check `https://<your-domain>/api/health`. It should
   return `{"ok":true,"database":"mysql","categories":15,"items":67}`.

If the site 404s but `/api/health` answers, `dist/` is missing — step 3 didn't
run. The startup log says so explicitly.

If the app dies at startup with `ER_ACCESS_DENIED_ERROR` for user `''`, the
`DB_*` variables never reached it: `db.js` fell back to its defaults with an
empty user. Check the panel variables, or that `.env` sits in the app root.

### Data and backups

Persistent state is split in two: the menu, categories, users and sessions live
in **MySQL**, and uploaded photos live under **`DATA_DIR/uploads`**. Keep
`DATA_DIR` outside the deploy folder so a redeploy cannot wipe it, and back up
both halves (see *Backing up* above) — neither is in the repository.

Unlike the PGlite setup this replaced, MySQL is a real server and handles
concurrent connections, so the app is no longer limited to a single instance.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Cannot reach the API server" | The API isn't running — use `npm run dev`, not `npm run dev:web` |
| API won't start, `ER_ACCESS_DENIED_ERROR` | Wrong or missing `DB_*` vars in `.env`. An empty user (`''@'localhost'`) means they were never set at all |
| API won't start, `ER_BAD_DB_ERROR` | `DB_NAME` points at a database that doesn't exist — create it, the tables build themselves |
| API won't start, `ECONNREFUSED` | MySQL isn't running (start it in XAMPP), or `DB_PORT` is wrong |
| Menu empty, no error | Database seeded but every dish is disabled, or every category hidden |
| Login says "Wrong email or password" | Wrong credentials, or `DB_NAME` points at a fresh database whose first run generated different ones — reset with `server/reset-password.mjs` |
| Signed out unexpectedly | Session older than 14 days, or the database was reset |
| Uploads fail | `server/data/uploads` (or `$DATA_DIR/uploads`) isn't writable |
| Deploy says `No output directory found after build` | Deployed as a static site — use the Node.js app instead (see Deploying) |
| Live site 404s but `/api/health` answers | `dist/` was never built on the host — run `npm run build:host` |
| `vite: not found` on the host | `NODE_ENV=production` skipped devDependencies — use `build:host`, not `build` |
| Port 3001 in use | Set `API_PORT` in `.env` and update the proxy target in `vite.config.js` |
