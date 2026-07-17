/* ============================================================
   ASIAN TIER LIST — SESSION & OAUTH2 PREP
   Real backend (code exchange, role sync) is not part of this
   static frontend. This module:
   1) Builds the real Discord OAuth2 authorize URL for the
      configured application and starts the real redirect flow.
   2) Maintains a local "session" object so every page can render
      role-gated UI consistently once a backend attaches a real
      session (same shape, swap the storage source later).
   3) Provides a clearly-labeled Developer Preview switcher so the
      role-gated UI can be reviewed before OAuth is wired up.
   ============================================================ */
window.ATL_SESSION = (function(){
  // Set this to your deployed Worker's URL once it's live, e.g.
  // 'https://atl-oauth.yoursubdomain.workers.dev'
  const OAUTH_WORKER_URL = 'https://atl-oauth.rekhaahlawat25.workers.dev';
  const STORAGE_KEY = 'atl_session_v1';
  const STORE_PREFIX = 'atl_store_';

  function loginWithDiscord(){
    window.location.href = OAUTH_WORKER_URL + '/login';
  }

  function get(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch(e){ return null; }
  }
  function set(session){ localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }
  function clear(){ localStorage.removeItem(STORAGE_KEY); }

  function logout(){ clear(); window.location.href = 'index.html'; }

  // Called once on discord-callback.html to read the session the
  // Worker appended as a URL hash (never a query string, so it never
  // hits server logs or gets forwarded via Referer), store it, and
  // clean the URL. Returns { ok:true } or { ok:false, error }.
  function consumeCallbackHash(){
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    const errorParam = params.get('atl_error');
    const sessionParam = params.get('atl_session');
    history.replaceState(null, '', window.location.pathname);
    if(errorParam) return { ok:false, error: errorParam };
    if(!sessionParam) return { ok:false, error: 'no_session' };
    try{
      const b64 = sessionParam.replace(/-/g,'+').replace(/_/g,'/');
      const json = decodeURIComponent(escape(atob(b64)));
      const session = JSON.parse(json);
      set(session);
      return { ok:true, session };
    }catch(e){ return { ok:false, error:'decode_failed' }; }
  }

  function current(){
    const s = get();
    if(!s || !s.authenticated) return { authenticated:false, role:'Guest', user:null, preview:false };
    return s;
  }

  // ---- Shared store (Cloudflare Worker + KV) so Staff/Testers/
  // Announcements/Reviews/Leaderboards/Applications are visible to
  // every visitor, not just the browser that added them. ----
  async function loadStore(key, fallback){
    try{
      const resp = await fetch(`${OAUTH_WORKER_URL}/api/store?key=${encodeURIComponent(key)}`);
      if(!resp.ok){
        console.error(`[ATL_SESSION] loadStore('${key}') failed: HTTP ${resp.status} from ${OAUTH_WORKER_URL}/api/store`);
        return fallback || [];
      }
      const data = await resp.json();
      return (data.value !== null && data.value !== undefined) ? data.value : (fallback || []);
    }catch(e){
      console.error(`[ATL_SESSION] loadStore('${key}') threw — likely CORS, wrong OAUTH_WORKER_URL, or the Worker is unreachable:`, e);
      return fallback || [];
    }
  }
  async function saveStore(key, value){
    try{
      const resp = await fetch(`${OAUTH_WORKER_URL}/api/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if(!resp.ok){
        console.error(`[ATL_SESSION] saveStore('${key}') failed: HTTP ${resp.status} from ${OAUTH_WORKER_URL}/api/store`);
        return false;
      }
      return true;
    }catch(e){
      console.error(`[ATL_SESSION] saveStore('${key}') threw — likely CORS, wrong OAUTH_WORKER_URL, or the Worker is unreachable:`, e);
      return false;
    }
  }

  return { loginWithDiscord, current, logout, loadStore, saveStore, consumeCallbackHash };
})();
