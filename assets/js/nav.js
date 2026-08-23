/* ============================================================
   ASIAN TIER LIST — SHELL (NAV + FOOTER + TOASTS + BADGES)
   ============================================================ */

window.ATL_hex = function(tier, size){
  size = size || 'md';
  const cssVar = window.ATL_DATA.TIER_CSS_VAR[tier] || '--tier-B';
  const cls = size==='sm' ? 'sm' : size==='lg' ? 'lg' : '';
  return `<span class="tier-hex ${cls}" style="--tc:var(${cssVar})">
    <svg viewBox="0 0 100 112" preserveAspectRatio="none">
      <defs>
        <linearGradient id="hg-${tier}-${size}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(${cssVar})"/>
          <stop offset="1" stop-color="var(${cssVar})" stop-opacity=".65"/>
        </linearGradient>
      </defs>
      <polygon points="50,2 96,27 96,85 50,110 4,85 4,27" fill="url(#hg-${tier}-${size})" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
      <polygon points="50,10 89,31 89,81 50,102 11,81 11,31" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="1"/>
    </svg>
    <span class="tc-letter">${tier}</span>
  </span>`;
};

window.ATL_roleBadge = function(role){
  const slug = window.ATL_DATA.roleSlug(role);
  return `<span class="role-badge role-${slug}">${role}</span>`;
};

window.ATL_toast = function(msg, type){
  let stack = document.querySelector('.toast-stack');
  if(!stack){ stack = document.createElement('div'); stack.className='toast-stack'; document.body.appendChild(stack); }
  const el = document.createElement('div');
  el.className = `toast ${type||''}`;
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateX(30px)'; el.style.transition='all .3s'; setTimeout(()=>el.remove(),300); }, 3200);
};

const NAV_ITEMS = [
  { href:'index.html', label:'Home' },
  { href:'rules.html', label:'Rules' },
  { href:'announcements.html', label:'Announcements' },
  { href:'staff.html', label:'Staff' },
  { href:'testers.html', label:'Testers' },
  { href:'leaderboards.html', label:'Leaderboards' },
  { href:'search.html', label:'Search' },
  { href:'compare.html', label:'Compare' },
  { href:'stats.html', label:'Stats' },
  { href:'reviews.html', label:'Reviews' },
  { href:'support.html', label:'Support' },
  { href:'asianai.html', label:'Asian AI' },
  { href:'profile.html', label:'Player Profile' },
  { href:'tester-panel.html', label:'Tester Panel', minRole:'Tester' },
  { href:'owner-panel.html', label:'Owner Panel', minRole:'Owner' },
  { href:'staff-applications.html', label:'Applications' },
];

function discordIconSvg(){
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.9-1.52.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.26a18.3 18.3 0 0 0-5.48 0 12.6 12.6 0 0 0-.63-1.26.08.08 0 0 0-.07-.04 19.7 19.7 0 0 0-4.9 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1 0-.13c.13-.09.25-.19.37-.28a.07.07 0 0 1 .08 0c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08 0c.12.1.24.19.37.28a.08.08 0 0 1 0 .13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.78 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.94 2.42-2.15 2.42zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.93 2.42-2.15 2.42z"/></svg>`;
}
function menuIconSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>`; }
function closeIconSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>`; }
window.ATL_brandFallback = function(img){
  // If assets/images/logo.png isn't there (or hasn't been uploaded yet),
  // fall back to a simple gradient "A" mark instead of a broken image icon.
  const span = document.createElement('span');
  span.className = 'brand-mark';
  span.style.cssText = 'display:flex;align-items:center;justify-content:center;border-radius:8px;background:linear-gradient(135deg,var(--red-500),var(--blue-500));color:#0a0e15;font-family:Orbitron,sans-serif;font-weight:800;font-size:15px;';
  span.textContent = 'A';
  img.replaceWith(span);
};
function brandMarkSvg(){
  // Uses your uploaded logo at assets/images/logo.png — change the src
  // below if you used a different filename or an .svg instead.
  return `<img class="brand-mark" src="assets/images/logo.png" alt="Asian Tier List logo" onerror="ATL_brandFallback(this)">`;
}

function avatarUrl(user){
  if(user && user.avatar) return user.avatar;
  const seed = user ? user.username : 'guest';
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=141a29`;
}

const ATL_THEMES = [
  { id:'crimson', label:'Crimson',       colors:['#e63946','#3a86ff'] },
  { id:'violet',  label:'Violet Storm',  colors:['#8b5cf6','#ec4899'] },
  { id:'cyber',   label:'Cyber Neon',    colors:['#06b6d4','#f97316'] },
  { id:'emerald', label:'Emerald',       colors:['#22c55e','#a855f7'] },
];
// Applied as soon as this script loads (before the nav renders) to
// minimize any flash of the default theme on load.
(function(){
  const saved = localStorage.getItem('atl_theme');
  if(saved && ATL_THEMES.some(t=>t.id===saved)) document.documentElement.dataset.theme = saved;
})();
function paletteIconSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="10.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="7.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="10.5" cy="14.5" r="1.4" fill="currentColor" stroke="none"/><path d="M12 22a10 10 0 0 1 0-20 5 5 0 0 1 0 10c-1.1 0-2 .9-2 2a2 2 0 0 0 2 2 2 2 0 0 1 2 2 2 2 0 0 1-2 4z" fill="none"/></svg>`; }
function bellIconSvg(){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`; }

const NOTIF_STORAGE_KEY = 'atl_notif_seen';
function loadNotifSeen(){
  try{ return JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY)) || {}; }catch(e){ return {}; }
}
function saveNotifSeen(v){ localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(v)); }

// Builds the current user's unread notifications by diffing the shared
// tier_log / tickets / applications stores against what this browser
// has already marked as seen. Fire-and-forget from ATL_initShell so it
// never blocks nav rendering.
async function computeNotifications(session){
  const seen = loadNotifSeen();
  seen.ticketsLastRead = seen.ticketsLastRead || {};
  seen.appsSeen = seen.appsSeen || {};
  const items = [];

  try{
    const tierLog = await window.ATL_SESSION.loadStore('tier_log', []);
    const mine = tierLog.filter(t => t.player && t.player.toLowerCase() === session.user.username.toLowerCase());
    const seenCount = seen.tierLogCount || 0;
    mine.slice(seenCount).forEach(t=>{
      const gmLabel = (window.ATL_DATA.GAMEMODES.find(g=>g.id===t.gamemode)||{label:t.gamemode}).label;
      items.push({ icon:'tier', text:`You were assigned ${t.tier} in ${gmLabel}`, link:'profile.html', ts:t.date, key:'tier'+seenCount });
    });
  }catch(e){}

  try{
    const tickets = await window.ATL_SESSION.loadStore('tickets', []);
    tickets.filter(t=>t.userId===session.user.id).forEach(t=>{
      const lastStaffMsg = [...t.messages].reverse().find(m=>m.from==='staff');
      if(lastStaffMsg){
        const lastRead = seen.ticketsLastRead[t.id] || 0;
        if(new Date(lastStaffMsg.at).getTime() > new Date(lastRead).getTime()){
          items.push({ icon:'ticket', text:`New reply on "${t.subject}"`, link:'support.html', ts:lastStaffMsg.at, key:'ticket'+t.id+lastStaffMsg.at });
        }
      }
    });
  }catch(e){}

  try{
    const apps = await window.ATL_SESSION.loadStore('applications', []);
    apps.filter(a=>a.username && a.username.toLowerCase()===session.user.username.toLowerCase() && a.status!=='pending').forEach((a,i)=>{
      const appKey = a.id || (a.username+i);
      if(seen.appsSeen[appKey] !== a.status){
        items.push({ icon:'app', text:`Your ${a.track} application was ${a.status}`, link: a.track==='staff' ? 'staff-applications.html' : 'staff-applications.html', ts:a.submitted, key:'app'+appKey });
      }
    });
  }catch(e){}

  items.sort((a,b)=> new Date(b.ts) - new Date(a.ts));
  return items;
}

function markAllNotifsRead(session, items){
  const seen = loadNotifSeen();
  seen.ticketsLastRead = seen.ticketsLastRead || {};
  seen.appsSeen = seen.appsSeen || {};
  window.ATL_SESSION.loadStore('tier_log', []).then(tierLog=>{
    const mine = tierLog.filter(t => t.player && t.player.toLowerCase() === session.user.username.toLowerCase());
    seen.tierLogCount = mine.length;
    saveNotifSeen(seen);
  });
  window.ATL_SESSION.loadStore('tickets', []).then(tickets=>{
    tickets.filter(t=>t.userId===session.user.id).forEach(t=>{
      const lastMsg = t.messages[t.messages.length-1];
      if(lastMsg) seen.ticketsLastRead[t.id] = lastMsg.at;
    });
    saveNotifSeen(seen);
  });
  window.ATL_SESSION.loadStore('applications', []).then(apps=>{
    apps.filter(a=>a.username && a.username.toLowerCase()===session.user.username.toLowerCase()).forEach((a,i)=>{
      const appKey = a.id || (a.username+i);
      seen.appsSeen[appKey] = a.status;
    });
    saveNotifSeen(seen);
  });
}

window.ATL_initShell = function(activePage){
  const session = window.ATL_SESSION.current();
  const role = session.role;
  const canSee = (item)=> !item.minRole || window.ATL_DATA.hasAtLeast(role, item.minRole);

  const linksHtml = NAV_ITEMS.map(item=>{
    const active = item.href === activePage ? ' active' : '';
    const restricted = canSee(item) ? '' : ' restricted';
    return `<a class="nav-link${active}${restricted}" href="${item.href}" ${canSee(item)?'':'title="Requires higher role"'}>${item.label}</a>`;
  }).join('');

  const authArea = session.authenticated
    ? `<div class="user-chip" id="userChip">
         <img src="${avatarUrl(session.user)}" alt="">
         <span>
           <span class="u-name">${session.user.display}</span><br>
           <span class="u-role">${session.role}</span>
         </span>
       </div>`
    : `<button class="discord-btn" id="loginBtn">${discordIconSvg()}Login with Discord</button>`;

  const currentTheme = document.documentElement.dataset.theme || 'crimson';
  const themeOptionsHtml = (suffix)=> ATL_THEMES.map(t=>`
    <div class="theme-option ${t.id===currentTheme?'active':''}" data-theme-pick="${t.id}${suffix}" style="color:${t.colors[0]}">
      <span class="theme-swatch" style="background:linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})"></span>
      <span style="color:var(--text-1);">${t.label}</span>
    </div>`).join('');

  const nav = document.createElement('div');
  nav.innerHTML = `
  <nav class="nav">
    <div class="nav-inner">
      <a class="brand" href="index.html">
        ${brandMarkSvg()}
        <span class="brand-text">ASIAN TIER LIST<small>1.8+ &nbsp;•&nbsp; PvP Competitive</small></span>
      </a>
      <div class="nav-links">${linksHtml}</div>
      <div class="nav-actions">
        ${session.authenticated ? `
        <div class="theme-switcher" style="position:relative;">
          <button class="theme-toggle" id="notifToggle" aria-label="Notifications">${bellIconSvg()}<span class="notif-dot hidden" id="notifDot"></span></button>
          <div class="glass theme-dropdown" id="notifDropdown" style="width:300px;">
            <div class="flex-between" style="padding:4px 6px 8px;">
              <span class="eyebrow" style="padding:0;">Notifications</span>
              <button class="btn btn-ghost btn-sm" id="notifMarkRead" style="text-transform:none; padding:4px 8px; font-size:11px;">Mark all read</button>
            </div>
            <div id="notifList" style="max-height:280px; overflow-y:auto;"></div>
          </div>
        </div>` : ''}
        <div class="theme-switcher" style="position:relative;">
          <button class="theme-toggle" id="themeToggle" aria-label="Switch theme">${paletteIconSvg()}</button>
          <div class="glass theme-dropdown" id="themeDropdown">
            <div class="eyebrow" style="padding:4px 10px 8px;">Theme</div>
            ${themeOptionsHtml('')}
          </div>
        </div>
        ${authArea}
        <button class="nav-menu-toggle" id="menuToggle" aria-label="Open menu">${menuIconSvg()}</button>
      </div>
    </div>
  </nav>
  <div class="drawer-backdrop" id="drawerBackdrop"></div>
  <div class="nav-drawer" id="navDrawer">
    <div class="flex-between" style="margin-bottom:16px;">
      <span class="eyebrow">Menu</span>
      <button class="modal-close" id="drawerClose">${closeIconSvg()}</button>
    </div>
    ${linksHtml}
    <div class="mt-24">${authArea}</div>
    <div class="eyebrow mt-24" style="margin-bottom:8px;">Theme</div>
    ${themeOptionsHtml('-drawer')}
  </div>`;
  document.body.prepend(nav);

  if(session.authenticated){
    const notifToggle = document.getElementById('notifToggle');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifDot = document.getElementById('notifDot');
    const notifList = document.getElementById('notifList');
    let currentNotifs = [];

    const NOTIF_ICON = {
      tier: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/></svg>',
      ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      app: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>'
    };

    async function refreshNotifs(){
      currentNotifs = await computeNotifications(session);
      notifDot.classList.toggle('hidden', currentNotifs.length===0);
      notifList.innerHTML = currentNotifs.length ? currentNotifs.map(n=>`
        <a href="${n.link}" class="theme-option" style="align-items:flex-start;">
          <span style="width:16px;height:16px;flex-shrink:0;margin-top:2px;">${NOTIF_ICON[n.icon]}</span>
          <span style="color:var(--text-1); font-weight:500;">${n.text}</span>
        </a>
      `).join('') : '<p class="text-sm text-muted" style="padding:10px 6px;">Nothing new.</p>';
    }
    refreshNotifs();
    setInterval(refreshNotifs, 15000);

    notifToggle.addEventListener('click', (e)=>{ e.stopPropagation(); notifDropdown.classList.toggle('open'); });
    document.addEventListener('click', (e)=>{ if(!notifDropdown.contains(e.target) && e.target!==notifToggle && !notifToggle.contains(e.target)) notifDropdown.classList.remove('open'); });
    document.getElementById('notifMarkRead').addEventListener('click', ()=>{
      markAllNotifsRead(session, currentNotifs);
      notifDot.classList.add('hidden');
      notifList.innerHTML = '<p class="text-sm text-muted" style="padding:10px 6px;">Nothing new.</p>';
    });
  }

  function applyTheme(id){
    document.documentElement.dataset.theme = id;
    localStorage.setItem('atl_theme', id);
    document.querySelectorAll('[data-theme-pick]').forEach(el=>{
      const pickId = el.dataset.themePick.replace('-drawer','');
      el.classList.toggle('active', pickId===id);
    });
  }
  document.querySelectorAll('[data-theme-pick]').forEach(el=>{
    el.addEventListener('click', ()=>{
      applyTheme(el.dataset.themePick.replace('-drawer',''));
      document.getElementById('themeDropdown').classList.remove('open');
    });
  });
  const themeToggle = document.getElementById('themeToggle');
  const themeDropdown = document.getElementById('themeDropdown');
  themeToggle.addEventListener('click', (e)=>{ e.stopPropagation(); themeDropdown.classList.toggle('open'); });
  document.addEventListener('click', (e)=>{ if(!themeDropdown.contains(e.target) && e.target!==themeToggle) themeDropdown.classList.remove('open'); });

  document.getElementById('menuToggle').addEventListener('click', ()=>{
    document.getElementById('navDrawer').classList.add('open');
    document.getElementById('drawerBackdrop').classList.add('open');
  });
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  document.getElementById('drawerBackdrop').addEventListener('click', closeDrawer);
  function closeDrawer(){
    document.getElementById('navDrawer').classList.remove('open');
    document.getElementById('drawerBackdrop').classList.remove('open');
  }

  const loginBtn = document.getElementById('loginBtn');
  if(loginBtn) loginBtn.addEventListener('click', window.ATL_SESSION.loginWithDiscord);
  const userChip = document.getElementById('userChip');
  if(userChip) userChip.addEventListener('click', ()=> window.location.href='profile.html');

  // ---- footer ----
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <div class="brand" style="margin-bottom:14px;">${brandMarkSvg()}<span class="brand-text">ASIAN TIER LIST<small>1.8+ &nbsp;•&nbsp; PvP Competitive</small></span></div>
        <p class="text-sm text-muted" style="max-width:320px;">The competitive PvP tier list ranking Asia's best 1.8 combat players across seven gamemodes.</p>
      </div>
      <div class="footer-col"><h4>Platform</h4>
        <a href="rules.html">Rules</a><a href="leaderboards.html">Leaderboards</a><a href="search.html">Search</a><a href="compare.html">Compare</a><a href="stats.html">Stats</a><a href="announcements.html">Announcements</a><a href="reviews.html">Reviews</a>
      </div>
      <div class="footer-col"><h4>Community</h4>
        <a href="staff.html">Staff</a><a href="testers.html">Testers</a><a href="staff-applications.html">Applications</a><a href="profile.html">Player Profile</a>
      </div>
      <div class="footer-col"><h4>Account</h4>
        <a href="#" id="footerDiscordLink">Discord Server</a><a href="support.html">Support</a><a href="asianai.html">Asian AI</a><a href="tester-panel.html">Tester Panel</a><a href="owner-panel.html">Owner Panel</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2026 Asian Tier List and s1ztx, All Rights Reserved.</span>
    </div>
  </div>`;
  document.body.appendChild(footer);

  const discordServerHref = 'https://discord.com/';
  const fdl = document.getElementById('footerDiscordLink');
  if(fdl) fdl.href = discordServerHref;

  return session;
};
