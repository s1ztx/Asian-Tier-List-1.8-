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
  const DISCORD_CLIENT_ID = '1518971939073429708';
  const STORAGE_KEY = 'atl_session_v1';
  const STORE_PREFIX = 'atl_store_';

  function getRedirectUri(){
    return window.location.origin + window.location.pathname.replace(/[^/]+$/, '') + 'discord-callback.html';
  }

  function buildAuthorizeUrl(){
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: getRedirectUri(),
      response_type: 'code',
      scope: 'identify guilds guilds.members.read'
    });
    return 'https://discord.com/oauth2/authorize?' + params.toString();
  }

  function loginWithDiscord(){
    window.location.href = buildAuthorizeUrl();
  }

  function get(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
    catch(e){ return null; }
  }
  function set(session){ localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }
  function clear(){ localStorage.removeItem(STORAGE_KEY); }

  function logout(){ clear(); window.location.href = 'index.html'; }

  // ---- Developer Preview (design-review only, clearly labeled) ----
  const PREVIEW_USERS = {
    'Guest': null,
    'Member': { username:'kairo_ace', display:'Kairo', discriminator:'0', id:'482910384756201984', avatar:null, joined:'2025-02-11', roles:['Member'], highestRole:'Member', verified:true },
    'Tester': { username:'nyx_tests', display:'Nyx', discriminator:'0', id:'618234098172634001', avatar:null, joined:'2024-11-03', roles:['Tester','Member'], highestRole:'Tester', verified:true },
    'Testing Manager': { username:'vega_tm', display:'Vega', discriminator:'0', id:'778213409981234771', avatar:null, joined:'2024-05-19', roles:['Testing Manager','Tester','Member'], highestRole:'Testing Manager', verified:true },
    'Senior Tester': { username:'ryuze', display:'Ryuze', discriminator:'0', id:'910384756123409981', avatar:null, joined:'2024-03-02', roles:['Senior Tester','Tester','Member'], highestRole:'Senior Tester', verified:true },
    'Owner': { username:'s1ztx.admin', display:'Meridian', discriminator:'0', id:'234098172634001918', avatar:null, joined:'2023-09-14', roles:['Owner','Senior Tester','Member'], highestRole:'Owner', verified:true },
    'Founder': { username:'s1ztx', display:'s1ztx', discriminator:'0', id:'100000000000000001', avatar:null, joined:'2023-01-01', roles:['Founder','Owner','Member'], highestRole:'Founder', verified:true },
  };

  function setPreviewRole(role){
    if(role === 'Guest'){ clear(); }
    else {
      set({ authenticated:true, preview:true, role, user: PREVIEW_USERS[role] });
    }
    window.location.reload();
  }

  function current(){
    const s = get();
    if(!s || !s.authenticated) return { authenticated:false, role:'Guest', user:null, preview:false };
    return s;
  }

  // ---- Local demo persistence for Owner/Tester panel CRUD ----
  function loadStore(key, fallback){
    try{
      const raw = localStorage.getItem(STORE_PREFIX+key);
      return raw ? JSON.parse(raw) : (fallback || []);
    }catch(e){ return fallback || []; }
  }
  function saveStore(key, value){ localStorage.setItem(STORE_PREFIX+key, JSON.stringify(value)); }

  return { buildAuthorizeUrl, loginWithDiscord, current, logout, setPreviewRole, PREVIEW_USERS, loadStore, saveStore, getRedirectUri };
})();
