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
The login button builds a real Discord authorize URL using the provided
Client ID (`1518971939073429708`) and redirects to Discord. No client
secret or bot token is anywhere in this codebase — code exchange and
role sync need a backend, which isn't part of this frontend brief.
`discord-callback.html` is the placeholder redirect target: point your
backend's OAuth callback here (or replace it) once it exists.

## Reviewing role-gated UI before a backend exists
Every page's footer has a **"⚙ Preview role (design QA)"** button. It's
a clearly-labeled frontend-only tool (not real auth) that sets a local
role so you can click through Guest → Member → Tester → Testing Manager
→ Senior Tester → Owner → Founder and see the Tester Panel / Owner
Panel / restricted nav links change accordingly. Swap `session.js`'s
storage source for a real backend session later — every page already
reads from the same `ATL_SESSION.current()` shape.

## Data
No staff, testers, reviews, leaderboard entries, or announcements are
pre-filled. The Owner Panel and Tester Panel write to localStorage
(`atl_store_*` keys) so the whole CRUD flow is demonstrable in the
browser; swap those calls for real API calls once a backend exists.

## Tier system
Only these fourteen tiers are ever used, high to low:
S, S-, A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-.
