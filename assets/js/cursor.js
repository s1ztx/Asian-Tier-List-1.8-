/* ============================================================
   ASIAN TIER LIST — CUSTOM CURSOR
   A small dot + trailing ring that follows the pointer, tinted
   to the active theme's accent color. Expands on hover over
   interactive elements. Disabled entirely on touch devices.
   ============================================================ */
(function(){
  if(window.matchMedia('(pointer: coarse)').matches) return; // touch device — leave native behavior alone
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'atl-cursor-dot';
  ring.className = 'atl-cursor-ring';
  document.documentElement.classList.add('atl-custom-cursor');
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx=0, my=0, rx=0, ry=0;
  window.addEventListener('mousemove', (e)=>{
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    dot.classList.add('visible'); ring.classList.add('visible');
  }, { passive:true });

  function loop(){
    rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('mousedown', ()=> ring.classList.add('press'));
  window.addEventListener('mouseup', ()=> ring.classList.remove('press'));
  document.addEventListener('mouseleave', ()=>{ dot.classList.remove('visible'); ring.classList.remove('visible'); });

  const HOVER_SELECTOR = 'a, button, .btn, .nav-link, .panel-tab, .theme-option, .ticket-item, input, textarea, select, [onclick], .card-hover';
  document.addEventListener('mouseover', (e)=>{
    if(e.target.closest && e.target.closest(HOVER_SELECTOR)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', (e)=>{
    if(e.target.closest && e.target.closest(HOVER_SELECTOR)) ring.classList.remove('hover');
  });
})();
