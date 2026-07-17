# Asian Tier List [1.8+]

A static frontend for a Minecraft 1.8 PvP competitive tier list platform. Pure HTML/CSS/JS — no build step, no backend.

## Run it
Open `index.html` directly, or serve the folder (recommended, so Discord OAuth redirect and relative paths behave the same as production):

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Structure
```
index.html                  Home
rules.html                  Rules
announcements.html          Announcements
staff.html                  Staff roster
testers.html                Testers roster + test request form
leaderboards.html           Per-gamemode leaderboards
reviews.html                Member reviews (one per Discord account)
profile.html                Player profile (Discord identity + tier history)
tester-panel.html           Tester Panel (role-gated: Tester+)
owner-panel.html            Owner Panel (role-gated: Owner+)
staff-applications.html     Recruitment form
discord-callback.html       Placeholder OAuth2 redirect target
404.html                    Not found page

assets/css/tokens.css       Design tokens (color, type, radii, shadows)
assets/css/components.css   All shared UI components
assets/css/main.css         Font import + combines the two above

assets/js/data.js           Tiers / gamemodes / roles reference data
assets/js/session.js        OAuth2 URL builder + local session/demo storage
assets/js/nav.js            Shared nav/footer, tier-hex badge, toasts
assets/js/backgrounds.js    Canvas engine, unique animated background per page
```

## Discord OAuth2
The login button redirects to your Cloudflare Worker's `/login` route,
which redirects to Discord, then back to `/callback` on the Worker.
The Worker is the only place the Client Secret ever lives — never in
this static frontend. See `worker/worker.js` for the full flow and
required environment variables.

## Shared data (Cloudflare Worker + KV)
Staff, Testers, Announcements, Reviews, Leaderboards, and Applications
are **not** stored in the browser anymore — they're read and written
through the same Worker via a small `/api/store` endpoint backed by
Cloudflare KV. That means what one person adds in the Owner/Tester
Panel is visible to every visitor, not just their own browser.

Requirements on the Worker side:
- A KV namespace bound as `ATL_KV` (Worker → Settings → Bindings → Add
  → KV Namespace, variable name `ATL_KV`)
- `assets/js/session.js`'s `OAUTH_WORKER_URL` constant pointed at your
  deployed Worker (it's also the base URL used for the store API)

Note: the store API currently has no write authentication — anyone
who can reach the Worker can write to any store key. That matches the
original brief (frontend-only role gating, no backend authorization
yet) but is worth locking down before this handles anything sensitive
— e.g. requiring the Worker's own signed session on write requests.

## Reviewing role-gated UI before a backend exists
Every page's footer has a **"⚙ Preview role (design QA)"** button. It's
a clearly-labeled frontend-only tool (not real auth) that sets a local
role so you can click through Guest → Member → Tester → Testing Manager
→ Senior Tester → Owner → Founder and see the Tester Panel / Owner
Panel / restricted nav links change accordingly. Note: this preview
role is stored locally and does not affect what the shared stores
return — it only changes what the current browser is allowed to see
and do in the UI.

## Data
No staff, testers, reviews, leaderboard entries, or announcements are
pre-filled. The Owner Panel and Tester Panel write to the shared KV
store described above, so the whole CRUD flow is real and visible to
every visitor once the Worker is deployed and configured.

## Tier system
Only these fourteen tiers are ever used, high to low:
S, S-, A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-.
