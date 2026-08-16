# Forno — React + Supabase setup

Your static `forno-redesign.html` is now a React app with a Supabase-backed
menu and an admin CMS at `/admin`. Nothing about the visual design changed:
the Tailwind tokens and your `<style>` block were carried over verbatim.

---

## 0. Install Node.js (one time)

Node isn't installed on this machine yet. Get the **LTS** build from
<https://nodejs.org/en/download> (Windows Installer, x64), accept the defaults,
then **open a new terminal** and check:

```bash
node -v
```

Anything 18.x or newer is fine.

---

## 1. Install the project dependencies

From `D:\2026\fiono\forn`:

```bash
npm install
```

---

## 2. Create the Supabase project

1. Go to <https://supabase.com> → **New project**.
2. Name it `forno`, pick a region close to Qatar (**Frankfurt** or **Mumbai**),
   and set a strong database password (save it in your password manager).
3. Wait ~2 minutes for provisioning.

---

## 3. Create the tables, security rules and storage

In the Supabase dashboard open **SQL Editor → New query**, then run these three
files **in order**. Paste the whole file, press **Run**, confirm "Success", move
to the next.

| Order | File | What it does |
|---|---|---|
| 1 | `supabase/01_schema.sql` | `categories` + `menu_items` tables, indexes, and Row Level Security (public can read, only signed-in users can write) |
| 2 | `supabase/02_storage.sql` | the public `menu-images` bucket + its upload policies |
| 3 | `supabase/03_seed.sql` | your existing **15 categories and 67 dishes**, with the same prices and photo URLs |

`03_seed.sql` is safe to re-run — it skips dishes that already exist.

> If `02_storage.sql` errors with **"must be owner of table objects"**, some
> projects lock down `storage.objects` from the SQL editor. Create the bucket
> through the UI instead — the fallback steps are written at the top of that
> file.

---

## 4. Create the owner's login

**Authentication → Users → Add user → Create new user**

- Email: the client's address (e.g. `owner@forno-qa.site`)
- Password: something strong
- ✅ tick **Auto Confirm User** (otherwise they must click a confirmation email)

That's the only account that can edit the menu. Add more the same way.

> There is no public sign-up page on purpose. If you want to be extra safe,
> go to **Authentication → Providers → Email** and turn **Enable sign-ups** off.

---

## 5. Point the app at your project

```bash
cp .env.example .env
```

(on Windows PowerShell: `Copy-Item .env.example .env`)

Open `.env` and fill in two values from **Project Settings → Data API** and
**Project Settings → API Keys**:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_SUPABASE_IMAGE_BUCKET=menu-images
```

- The **anon key is meant to be public** — RLS is what protects the data.
- **Never** put the `service_role` key in `.env`; it bypasses RLS entirely.
- `.env` is already in `.gitignore`.

---

## 6. Run it

```bash
npm run dev
```

- Website → <http://localhost:5173>
- Admin CMS → <http://localhost:5173/admin>

---

## Where your CSS and assets live

| What | Where it went | Notes |
|---|---|---|
| The `<style>` block from `forno-redesign.html` | `src/styles/custom.css` | Copied **verbatim** — `.arch`, `.ember`, `.glass`, `.btn-amber`, `.reveal`, `.lift`, `.tab-active`, the RTL rule, the reduced-motion block, all unchanged |
| The `tailwind.config` object | `tailwind.config.js` | Same tokens: `ink`, `char`, `stone`, `amber`, `ember`, `cream`, `muted`, `font-display`/`font-sans`/`font-ar`, `max-w-shell` |
| Google Fonts `<link>` | `index.html` `<head>` | Bodoni Moda + Manrope + IBM Plex Sans Arabic, unchanged |
| `img/logo.png` | `public/img/logo.png` | Referenced as `/img/logo.png` |

### Adding more CSS

Paste it at the **bottom** of `src/styles/custom.css`, under the marked line.
It loads after Tailwind, so your rules win without needing `!important`.

### Adding more images or fonts

Drop files into `public/` — e.g. `public/img/hero.jpg` → use `src="/img/hero.jpg"`,
`public/fonts/MyFont.woff2` → `url('/fonts/MyFont.woff2')` inside `custom.css`.
Files in `public/` are copied to the build as-is and are never renamed.

> Your `main.css` and `main.js` in the project root are **byte-identical copies of
> the Tailwind CDN bundle**, not your own code. Tailwind is now compiled properly
> at build time, so those two files are unused — you can delete them.

---

## What the client can do at `/admin`

**Menu items** (`/admin`)

- Create, edit and delete dishes
- Upload a photo (stored in Supabase Storage; the public URL is written to the row)
- Or paste an external image URL instead
- Flip **Enabled / Disabled** with one click — the change is optimistic,
  so it looks instant, and the site picks it up on the next load
- Filter by category, search by name
- English **and** Arabic name/description per dish

**Categories** (`/admin/categories`)

- Add, rename, reorder (`sort_order`, lowest first) and delete categories
- **Shown / Hidden** hides a category from the website without deleting it
- Deleting a category deletes its dishes too (`ON DELETE CASCADE`)

### What Enabled / Disabled does

Disabling a dish **removes it from the website**. It disappears from its
category on the public menu, and its card and WhatsApp order link go with it.
It stays in `/admin` — greyed switch, "Disabled" label — so the client can
switch it back on at any time. Nothing is deleted, and the row keeps its
photo, price and description.

Use it for a dish that's off the menu this week; use **Delete** for one
that's gone for good.

The column behind it is `menu_items.is_enabled` (boolean, default true), and
the filter is one line in `src/components/MenuSection.jsx`:

```js
const visible = useMemo(
  () => (items.data ?? []).filter((i) => i.category_id === activeId && i.is_enabled),
  [items.data, activeId],
);
```

If you'd rather disabled dishes stay visible as "sold out" instead of
vanishing, drop the `&& i.is_enabled` here and render a badge in
`MenuItem.jsx` — commit `6e4b349` has that version if you want it back.

---

## Project structure

```
index.html                  Vite entry — <head>, fonts, #root
vite.config.js
tailwind.config.js          your CDN config, unchanged
postcss.config.js
.env                        your keys (git-ignored)
public/
  img/logo.png
  _redirects                SPA fallback for Netlify
supabase/
  01_schema.sql  02_storage.sql  03_seed.sql
src/
  main.jsx                  imports Tailwind then custom.css
  App.jsx                   routes + React Query + Auth providers
  styles/
    tailwind.css            @tailwind directives
    custom.css              ← YOUR ORIGINAL CSS
  lib/
    supabase.js             the client (swap point if you ever move to Firebase)
    constants.js            phone, WhatsApp, social links, hero photos, reviews
    utils.js
  api/menu.js               every Supabase read/write/upload call
  hooks/
    useMenu.js              React Query hooks
    useReveal.js            the IntersectionObserver scroll reveal
    useCounter.js           the animated stat counters
  context/
    LanguageContext.jsx     EN/AR toggle (replaces the data-i18n DOM swap)
    BookingContext.jsx      booking modal state
    AuthContext.jsx         Supabase session
  i18n/translations.js      EN + AR strings, same keys as the old data-i18n
  components/
    Header.jsx  Hero.jsx  Story.jsx  MenuSection.jsx  CategoryTabs.jsx
    MenuItem.jsx  WhyForno.jsx  Reviews.jsx  Contact.jsx  BookingForm.jsx
    Footer.jsx  BookingModal.jsx
    admin/  AdminShell.jsx  ItemFormModal.jsx  ConfirmDialog.jsx  ProtectedRoute.jsx
  pages/
    Home.jsx
    admin/  Login.jsx  Dashboard.jsx  Categories.jsx
```

---

## Deploying

```bash
npm run build      # → dist/
npm run preview    # check the production build locally
```

Add the same two env vars in your host's dashboard (Vercel: Settings →
Environment Variables; Netlify: Site configuration → Environment variables),
then deploy `dist/`.

Because `/admin` is a client-side route, the host must serve `index.html` for
unknown paths. That's already handled: `vercel.json` for Vercel,
`public/_redirects` for Netlify. On Apache/Nginx you need the equivalent
rewrite rule, or `/admin` will 404 on refresh.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| `Missing Supabase env vars` on startup | No `.env`, or you didn't restart `npm run dev` after creating it |
| Menu is empty but there's no error | `03_seed.sql` wasn't run, or every category is set to **Hidden** |
| `new row violates row-level security policy` when saving | You're signed out — go to `/admin/login` |
| Image uploads fail with a 403 | `02_storage.sql` wasn't run, or the bucket name in `.env` doesn't match |
| `/admin` 404s after a refresh in production | Missing SPA rewrite on the host (see Deploying) |
| Fonts look wrong | The Google Fonts `<link>` in `index.html` was removed or is blocked |

### Empty categories disappear too

A category is only shown on the website while it has at least one **enabled**
dish. Disable the last one and the whole tab goes, so nobody clicks through
to an empty grid; enable any dish in it and the tab comes straight back.

`/admin` always lists every category regardless, so nothing becomes
unreachable in the CMS.
