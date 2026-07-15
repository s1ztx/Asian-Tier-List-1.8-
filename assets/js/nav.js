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
      <stop offset="0" stop-color="#e63946"/><stop offset="1" stop-color="#3a86ff"/>
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
  </div>`;
  document.body.prepend(nav);

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
        <a href="#" id="footerDiscordLink">Discord Server</a><a href="tester-panel.html">Tester Panel</a><a href="owner-panel.html">Owner Panel</a>
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
