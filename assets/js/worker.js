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
   ============================================================ */

const SCOPE = 'identify guilds guilds.members.read';

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
  resp.headers.set('Access-Control-Allow-Origin', env.SITE_URL);
  resp.headers.set('Access-Control-Allow-Credentials', 'true');
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
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), env);

    if (url.pathname === '/login') return handleLogin(request, env);
    if (url.pathname === '/callback') return handleCallback(request, env);

    return new Response('Asian Tier List OAuth2 worker. Use /login to start sign-in.', { status: 200 });
  }
};
