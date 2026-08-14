/* ============================================================
   ASIAN TIER LIST — DISCORD OAUTH2 WORKER
   Deploy on Cloudflare Workers (free tier). This is the only
   piece that ever sees the Client Secret — never put it in the
   static frontend.

   Flow:
   1. Frontend "Login with Discord" -> GET  /login
        sets a short-lived CSRF `state` cookie, redirects to Discord
   2. Discord -> GET /callback?code=...&state=...
        verifies state, exchanges code for a token, reads the user's
        identity + guild member roles, maps roles -> our role names,
        redirects to the static site with the session in a URL hash
        (never a query string / never logged server-side)

   Required environment variables / secrets (set in the Cloudflare
   dashboard -> Workers -> your worker -> Settings -> Variables):

     DISCORD_CLIENT_ID       1518971939073429708
     DISCORD_CLIENT_SECRET   (from Discord Developer Portal, "Secret")
     DISCORD_GUILD_ID        your server's ID
     ROLE_MAP                JSON string mapping Discord role ID -> our
                              role name, e.g.
                              {"111":"Founder","222":"Owner","333":"Testing Manager",
                               "444":"Senior Tester","555":"Tester"}
     SITE_URL                https://s1ztx.github.io/Asian-Tier-List-1.8-
     WORKER_URL               https://<your-worker-subdomain>.workers.dev
                              (must match exactly what you register in
                              Discord's OAuth2 Redirects as WORKER_URL + "/callback")

   Also required: a KV namespace bound as ATL_KV
   (Worker -> Settings -> Bindings -> Add -> KV Namespace -> variable
   name "ATL_KV", pick or create a namespace). This is the shared
   database every visitor's browser reads/writes through instead of
   localStorage, so Staff/Testers/Announcements/Reviews/Leaderboards/
   Applications are visible to everyone, not just your own browser.

   ---- Popular Servers statistics (NOT yet connected) ----
   The Stats page and Compare page's stat rows call GET /api/server-stats
   and GET /api/player-stats?username=X on this Worker. Both currently
   return { configured:false } because there is no known public API
   for any specific server, and this Worker never invents one.
   To wire it up for real, tell the developer:
     1. The base URL of that server's stats API (if it has one), or
        confirm there isn't one and a plugin/webhook needs to push data
        into this Worker's KV store instead.
     2. Any auth required (API key, header name, etc.) — set it as a
        Worker secret (e.g. FROST_API_KEY), never in frontend code.
     3. Which fields it actually returns (player count, ELO, W/L, K/D,
        per-gamemode stats, etc.) so the frontend can be built around
        real field names instead of guessed ones.
   Once that's known, handlePopularServerStats/handlePlayerServerStats below are
   exactly where the real fetch calls go.
   ============================================================ */

const SCOPE = 'identify guilds guilds.members.read';

function jsonResponse(obj, status, env) {
  const resp = new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' }
  });
  return cors(resp, env);
}

async function handleStoreGet(request, env) {
  const key = new URL(request.url).searchParams.get('key');
  if (!key) return jsonResponse({ error: 'missing_key' }, 400, env);
  const raw = await env.ATL_KV.get('store:' + key);
  return jsonResponse({ key, value: raw ? JSON.parse(raw) : null }, 200, env);
}

async function handleStoreSet(request, env) {
  let body;
  try { body = await request.json(); } catch (e) { return jsonResponse({ error: 'bad_json' }, 400, env); }
  if (!body || !body.key) return jsonResponse({ error: 'missing_key' }, 400, env);
  await env.ATL_KV.put('store:' + body.key, JSON.stringify(body.value ?? null));
  return jsonResponse({ ok: true }, 200, env);
}

// Live Minecraft server status (online players, MOTD, version) via the
// real, public mcsrvstat.us API — proxied through the Worker because
// (a) it requires a descriptive User-Agent header browsers can't set
// themselves, and (b) it keeps every third-party call in one place.
async function handleMcServerStatus(request, env) {
  const ip = new URL(request.url).searchParams.get('ip');
  if (!ip) return jsonResponse({ error: 'missing_ip' }, 400, env);
  try {
    const resp = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(ip)}`, {
      headers: { 'User-Agent': 'AsianTierList-Worker/1.0 (+https://s1ztx.github.io/Asian-Tier-List-1.8-)' }
    });
    if (!resp.ok) return jsonResponse({ error: 'upstream_error' }, 502, env);
    const data = await resp.json();
    return jsonResponse(data, 200, env);
  } catch (e) {
    return jsonResponse({ error: 'fetch_failed' }, 502, env);
  }
}
// Returns { configured:false } until FROST_API_URL is actually set —
// never fabricates numbers. Fill in the real fetch once you have the
// API details (see the header comment above).
async function handlePopularServerStats(request, env) {
  if (!env.FROST_API_URL) return jsonResponse({ configured: false }, 200, env);
  try {
    const headers = env.FROST_API_KEY ? { Authorization: `Bearer ${env.FROST_API_KEY}` } : {};
    const resp = await fetch(env.FROST_API_URL, { headers });
    if (!resp.ok) return jsonResponse({ configured: true, error: 'upstream_error' }, 502, env);
    const data = await resp.json();
    return jsonResponse({ configured: true, data }, 200, env);
  } catch (e) {
    return jsonResponse({ configured: true, error: 'fetch_failed' }, 502, env);
  }
}

// Per-player stats (ELO, W/L, K/D, per-gamemode) for Compare and Stats.
// Same "never invent data" rule applies.
async function handlePlayerServerStats(request, env) {
  const username = new URL(request.url).searchParams.get('username');
  if (!username) return jsonResponse({ error: 'missing_username' }, 400, env);
  if (!env.FROST_API_URL) return jsonResponse({ configured: false }, 200, env);
  try {
    const headers = env.FROST_API_KEY ? { Authorization: `Bearer ${env.FROST_API_KEY}` } : {};
    const resp = await fetch(`${env.FROST_API_URL}/player/${encodeURIComponent(username)}`, { headers });
    if (resp.status === 404) return jsonResponse({ configured: true, found: false }, 200, env);
    if (!resp.ok) return jsonResponse({ configured: true, error: 'upstream_error' }, 502, env);
    const data = await resp.json();
    return jsonResponse({ configured: true, found: true, data }, 200, env);
  } catch (e) {
    return jsonResponse({ configured: true, error: 'fetch_failed' }, 502, env);
  }
}

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

function b64urlEncode(obj) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function cors(resp, env) {
  const origin = new URL(env.SITE_URL).origin;
  resp.headers.set('Access-Control-Allow-Origin', origin);
  resp.headers.set('Access-Control-Allow-Credentials', 'true');
  resp.headers.append('Vary', 'Origin');
  return resp;
}

async function handleLogin(request, env) {
  const state = randomState();
  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    redirect_uri: env.WORKER_URL + '/callback',
    response_type: 'code',
    scope: SCOPE,
    state
  });
  const discordUrl = 'https://discord.com/oauth2/authorize?' + params.toString();

  const resp = Response.redirect(discordUrl, 302);
  const newResp = new Response(resp.body, resp);
  newResp.headers.set(
    'Set-Cookie',
    `atl_oauth_state=${state}; Max-Age=600; Path=/; Secure; HttpOnly; SameSite=Lax`
  );
  return newResp;
}

function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return match ? match[1] : null;
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const err = url.searchParams.get('error');
  const cookieState = readCookie(request, 'atl_oauth_state');

  const fail = (reason) => Response.redirect(
    env.SITE_URL + '/discord-callback.html#atl_error=' + encodeURIComponent(reason), 302
  );

  if (err) return fail(err);
  if (!code) return fail('missing_code');
  if (!state || !cookieState || state !== cookieState) return fail('invalid_state');

  // 1) exchange code for an access token
  const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.WORKER_URL + '/callback'
    })
  });
  if (!tokenResp.ok) return fail('token_exchange_failed');
  const token = await tokenResp.json();

  // 2) identify the user
  const userResp = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  if (!userResp.ok) return fail('identify_failed');
  const user = await userResp.json();

  // 3) read their roles in the server (requires guilds.members.read)
  let member = null;
  const memberResp = await fetch(
    `https://discord.com/api/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );
  if (memberResp.ok) member = await memberResp.json();

  // 4) map Discord role IDs -> our internal role names
  const DEFAULT_ROLE_MAP = JSON.stringify({
    '1523608986878742598': 'Founder',
    '1519008236794024168': 'Owner',
    '1520418461950672936': 'Testing Manager',
    '1520418192885809362': 'Senior Tester',
    '1520417914275102770': 'Tester'
  });
  const roleMap = JSON.parse(env.ROLE_MAP || DEFAULT_ROLE_MAP);
  const HIERARCHY = ['Guest', 'Member', 'Tester', 'Testing Manager', 'Senior Tester', 'Owner', 'Founder'];
  let matchedRoles = [];
  if (member && Array.isArray(member.roles)) {
    matchedRoles = member.roles.map(id => roleMap[id]).filter(Boolean);
  }
  let highestRole = 'Guest';
  if (member) {
    highestRole = 'Member';
    for (const r of matchedRoles) {
      if (HIERARCHY.indexOf(r) > HIERARCHY.indexOf(highestRole)) highestRole = r;
    }
  }

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 6n}.png`;

  const session = {
    authenticated: true,
    preview: false,
    role: highestRole,
    user: {
      id: user.id,
      username: user.username,
      display: user.global_name || user.username,
      discriminator: user.discriminator || '0',
      avatar: avatarUrl,
      joined: member && member.joined_at ? member.joined_at.slice(0, 10) : null,
      roles: matchedRoles.length ? matchedRoles : (member ? ['Member'] : []),
      highestRole,
      verified: !!user.verified
    }
  };

  const redirectUrl = env.SITE_URL + '/discord-callback.html#atl_session=' + b64urlEncode(session);
  const resp = Response.redirect(redirectUrl, 302);
  const newResp = new Response(resp.body, resp);
  // clear the state cookie now that it's been used
  newResp.headers.append('Set-Cookie', 'atl_oauth_state=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax');
  return newResp;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      const resp = new Response(null, { status: 204 });
      resp.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      resp.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return cors(resp, env);
    }

    if (url.pathname === '/login') return handleLogin(request, env);
    if (url.pathname === '/callback') return handleCallback(request, env);
    if (url.pathname === '/api/store' && request.method === 'GET') return handleStoreGet(request, env);
    if (url.pathname === '/api/store' && request.method === 'POST') return handleStoreSet(request, env);
    if (url.pathname === '/api/server-stats' && request.method === 'GET') return handlePopularServerStats(request, env);
    if (url.pathname === '/api/player-stats' && request.method === 'GET') return handlePlayerServerStats(request, env);
    if (url.pathname === '/api/mc-server-status' && request.method === 'GET') return handleMcServerStatus(request, env);

    return new Response('Asian Tier List OAuth2 worker. Use /login to start sign-in.', { status: 200 });
  }
};
