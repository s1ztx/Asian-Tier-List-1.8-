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
  { href:'reviews.html', label:'Reviews' },
  { href:'support.html', label:'Support' },
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
function brandMarkSvg(){
  return `<svg class="brand-mark" viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:var(--red-500)"/><stop offset="1" style="stop-color:var(--blue-500)"/>
    </linearGradient></defs>
    <polygon points="50,2 96,27 96,85 50,110 4,85 4,27" fill="url(#bm)" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
    <text x="50" y="70" text-anchor="middle" font-family="Orbitron, sans-serif" font-weight="800" font-size="42" fill="#0a0e15">A</text>
  </svg>`;
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
        <a href="rules.html">Rules</a><a href="leaderboards.html">Leaderboards</a><a href="announcements.html">Announcements</a><a href="reviews.html">Reviews</a>
      </div>
      <div class="footer-col"><h4>Community</h4>
        <a href="staff.html">Staff</a><a href="testers.html">Testers</a><a href="staff-applications.html">Applications</a><a href="profile.html">Player Profile</a>
      </div>
      <div class="footer-col"><h4>Account</h4>
        <a href="#" id="footerDiscordLink">Discord Server</a><a href="support.html">Support</a><a href="tester-panel.html">Tester Panel</a><a href="owner-panel.html">Owner Panel</a>
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
