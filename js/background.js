/* ============================================================
   ASIAN TIER LIST — ANIMATED BACKGROUND ENGINE
   Each page mounts a distinct combination of lightweight canvas
   effects. All effects share one engine (resize/rAF/reduced-motion).
   ============================================================ */
(function(){
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(effects){
    const host = document.createElement('div');
    host.className = 'bg-layer';
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);
    document.body.prepend(host);
    const vign = document.createElement('div');
    vign.className = 'bg-vignette';
    document.body.prepend(vign);
    document.body.prepend(host); // keep canvas behind vignette

    const ctx = canvas.getContext('2d');
    let w,h,dpr;
    function resize(){
      dpr = Math.min(window.devicePixelRatio||1, 2);
      w = canvas.width = innerWidth*dpr;
      h = canvas.height = innerHeight*dpr;
      canvas.style.width = innerWidth+'px';
      canvas.style.height = innerHeight+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      layers.forEach(l=> l.resize && l.resize(innerWidth, innerHeight));
    }
    const layers = effects.map(fn=> fn());
    resize();
    window.addEventListener('resize', resize);

    let t=0;
    function frame(){
      const cw = innerWidth, ch = innerHeight;
      ctx.clearRect(0,0,cw,ch);
      layers.forEach(l=> l.draw(ctx, cw, ch, t));
      t += 1;
      if(!REDUCE) requestAnimationFrame(frame);
    }
    frame();
    if(REDUCE){ // draw a single static-ish frame occasionally
      setInterval(()=>{ t+=1; const cw=innerWidth,ch=innerHeight; ctx.clearRect(0,0,cw,ch); layers.forEach(l=>l.draw(ctx,cw,ch,t)); }, 4000);
    }
  }

  const rand = (a,b)=> a + Math.random()*(b-a);

  /* ---------------- HOME: aurora + hex grid + particles + beams ---------------- */
  function auroraLayer(){
    const bands = Array.from({length:3},(_,i)=>({
      hueA: ['#e63946','#3a86ff','#2ec4b6'][i],
      phase: rand(0,1000), amp: rand(60,110), speed: rand(.002,.004), yBase: .18+i*.16
    }));
    return { draw(ctx,w,h,t){
      ctx.save(); ctx.globalCompositeOperation='screen';
      bands.forEach(b=>{
        const grad = ctx.createLinearGradient(0,0,w,0);
        grad.addColorStop(0,'transparent'); grad.addColorStop(.5,b.hueA+'33'); grad.addColorStop(1,'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0,h*b.yBase);
        for(let x=0;x<=w;x+=24){
          const y = h*b.yBase + Math.sin((x*.006)+t*b.speed+b.phase)*b.amp;
          ctx.lineTo(x,y);
        }
        ctx.lineTo(w,0); ctx.lineTo(0,0); ctx.closePath(); ctx.fill();
      });
      ctx.restore();
    }};
  }
  function hexGridLayer(){
    const size=46;
    return { draw(ctx,w,h,t){
      ctx.save();
      ctx.strokeStyle='rgba(120,150,200,.07)'; ctx.lineWidth=1;
      const hw=size, hh=size*.87;
      const drift = (t*.05)%(hw*3);
      for(let y=-hh; y<h+hh; y+=hh){
        for(let x=-hw*2; x<w+hw*2; x+=hw*1.5){
          const off = (Math.round(y/hh)%2)*hw*.75;
          const cx = x+off-drift, cy=y;
          ctx.beginPath();
          for(let i=0;i<6;i++){
            const a=Math.PI/3*i;
            const px=cx+Math.cos(a)*hw*.5, py=cy+Math.sin(a)*hw*.5;
            i? ctx.lineTo(px,py):ctx.moveTo(px,py);
          }
          ctx.closePath(); ctx.stroke();
        }
      }
      ctx.restore();
    }};
  }
  function particlesLayer(n=70, palette=['#e63946','#3a86ff','#ffd60a']){
    let pts=[];
    return {
      resize(w,h){ pts = Array.from({length:n},()=>({ x:rand(0,w), y:rand(0,h), r:rand(.6,2.1), vy:rand(.06,.22), vx:rand(-.06,.06), c:palette[Math.floor(Math.random()*palette.length)], a:rand(.2,.8) })); },
      draw(ctx,w,h){
        pts.forEach(p=>{
          p.y-=p.vy; p.x+=p.vx;
          if(p.y<-5){ p.y=h+5; p.x=rand(0,w); }
          ctx.beginPath(); ctx.fillStyle=p.c; ctx.globalAlpha=p.a;
          ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
        });
        ctx.globalAlpha=1;
      }
    };
  }
  function beamsLayer(){
    const beams = Array.from({length:5},(_,i)=>({ x: rand(0,1), w: rand(60,160), speed: rand(.0015,.003), phase: i*40 }));
    return { draw(ctx,w,h,t){
      ctx.save(); ctx.globalCompositeOperation='screen';
      beams.forEach(b=>{
        const bx = w*b.x + Math.sin(t*b.speed+b.phase)*w*.15;
        const grad = ctx.createLinearGradient(bx-b.w,0,bx+b.w,0);
        grad.addColorStop(0,'transparent'); grad.addColorStop(.5,'rgba(255,255,255,.035)'); grad.addColorStop(1,'transparent');
        ctx.fillStyle=grad; ctx.fillRect(bx-b.w,0,b.w*2,h);
      });
      ctx.restore();
    }};
  }

  /* ---------------- RULES: blueprint grid + digital lines ---------------- */
  function blueprintLayer(){
    return { draw(ctx,w,h){
      ctx.save();
      ctx.strokeStyle='rgba(58,134,255,.10)'; ctx.lineWidth=1;
      const step=40;
      for(let x=0;x<w;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for(let y=0;y<h;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
      ctx.strokeStyle='rgba(58,134,255,.18)';
      for(let x=0;x<w;x+=step*5){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for(let y=0;y<h;y+=step*5){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
      ctx.restore();
    }};
  }
  function digitalLinesLayer(){
    let lines=[];
    return {
      resize(w,h){ lines = Array.from({length:16},()=>({ x: rand(0,w), len: rand(60,220), speed: rand(.4,1.4), y: rand(0,h) })); },
      draw(ctx,w,h){
        ctx.save(); ctx.strokeStyle='rgba(46,196,182,.28)'; ctx.lineWidth=1.4;
        lines.forEach(l=>{
          l.y += l.speed; if(l.y-l.len>h) l.y=-10;
          const grad=ctx.createLinearGradient(0,l.y-l.len,0,l.y);
          grad.addColorStop(0,'transparent'); grad.addColorStop(1,'rgba(46,196,182,.55)');
          ctx.strokeStyle=grad;
          ctx.beginPath(); ctx.moveTo(l.x,l.y-l.len); ctx.lineTo(l.x,l.y); ctx.stroke();
        });
        ctx.restore();
      }
    };
  }

  /* ---------------- ANNOUNCEMENTS: news glow + floating cards ---------------- */
  function newsGlowLayer(){
    return { draw(ctx,w,h,t){
      const grad = ctx.createRadialGradient(w*.8,h*.1,50, w*.8,h*.1, w*.7);
      grad.addColorStop(0,'rgba(230,57,70,.16)'); grad.addColorStop(1,'transparent');
      ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      const grad2 = ctx.createRadialGradient(w*.15,h*.85,40, w*.15,h*.85, w*.55);
      grad2.addColorStop(0,'rgba(58,134,255,.12)'); grad2.addColorStop(1,'transparent');
      ctx.fillStyle=grad2; ctx.fillRect(0,0,w,h);
    }};
  }
  function floatingCardsLayer(){
    let cards=[];
    return {
      resize(w,h){ cards = Array.from({length:9},()=>({ x:rand(0,w), y:rand(0,h), w:rand(30,60), hh:rand(40,80), vy:rand(.05,.15), rot:rand(-.15,.15) })); },
      draw(ctx,w,h){
        cards.forEach(c=>{
          c.y -= c.vy; if(c.y<-100){ c.y=h+100; }
          ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot);
          ctx.strokeStyle='rgba(255,255,255,.07)'; ctx.fillStyle='rgba(255,255,255,.02)';
          ctx.lineWidth=1;
          const r=8;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-c.w/2,-c.hh/2,c.w,c.hh,r) : ctx.rect(-c.w/2,-c.hh/2,c.w,c.hh);
          ctx.fill(); ctx.stroke();
          ctx.restore();
        });
      }
    };
  }

  /* ---------------- STAFF: luxury spotlight + glass panels ---------------- */
  function spotlightLayer(color='255,214,10'){
    return { draw(ctx,w,h,t){
      const x = w*.5, y=0;
      const grad = ctx.createRadialGradient(x,y,10,x,y, h*.9);
      grad.addColorStop(0, `rgba(${color},.14)`); grad.addColorStop(1,'transparent');
      ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      ctx.save(); ctx.globalAlpha=.05;
      for(let i=-2;i<3;i++){
        ctx.save(); ctx.translate(x,y); ctx.rotate(i*.12+Math.sin(t*.003)*.03);
        const g2=ctx.createLinearGradient(0,0,0,h);
        g2.addColorStop(0,`rgba(${color},.5)`); g2.addColorStop(1,'transparent');
        ctx.fillStyle=g2; ctx.fillRect(-40,0,80,h);
        ctx.restore();
      }
      ctx.restore();
    }};
  }
  function glassPanelsLayer(){
    let panels=[];
    return {
      resize(w,h){ panels = Array.from({length:6},(_,i)=>({ x: (i+.5)*w/6, w: rand(90,160), vy:rand(.02,.06), phase:rand(0,10) })); },
      draw(ctx,w,h,t){
        panels.forEach(p=>{
          const y = (Math.sin(t*p.vy+p.phase)*.5+.5)*h*.6;
          ctx.fillStyle='rgba(255,255,255,.02)';
          ctx.strokeStyle='rgba(255,255,255,.05)';
          ctx.fillRect(p.x-p.w/2,y,p.w,h*.5);
          ctx.strokeRect(p.x-p.w/2,y,p.w,h*.5);
        });
      }
    };
  }

  /* ---------------- TESTERS: pvp energy + floating hexagons ---------------- */
  function pvpEnergyLayer(){
    let sparks=[];
    return {
      resize(w,h){ sparks = Array.from({length:26},()=>({ x:rand(0,w), y:rand(0,h), vx:rand(-1.4,1.4), vy:rand(-1.4,1.4), life:rand(0,100) })); },
      draw(ctx,w,h){
        sparks.forEach(s=>{
          s.x+=s.vx; s.y+=s.vy; s.life+=1;
          if(s.life>140 || s.x<0||s.x>w||s.y<0||s.y>h){ s.x=rand(0,w); s.y=rand(0,h); s.life=0; }
          const a = 1-Math.abs((s.life/140)*2-1);
          ctx.strokeStyle=`rgba(230,57,70,${a*.55})`; ctx.lineWidth=1.2;
          ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*8,s.y-s.vy*8); ctx.stroke();
        });
      }
    };
  }
  function floatingHexLayer(){
    let hexes=[];
    return {
      resize(w,h){ hexes = Array.from({length:14},()=>({ x:rand(0,w), y:rand(0,h), r:rand(10,26), vy:rand(.1,.35), rot:rand(0,6) })); },
      draw(ctx,w,h){
        hexes.forEach(hx=>{
          hx.y-=hx.vy; if(hx.y<-40) hx.y=h+40;
          ctx.save(); ctx.translate(hx.x,hx.y); ctx.rotate(hx.rot);
          ctx.strokeStyle='rgba(58,134,255,.22)'; ctx.lineWidth=1.2;
          ctx.beginPath();
          for(let i=0;i<6;i++){ const a=Math.PI/3*i; const px=Math.cos(a)*hx.r, py=Math.sin(a)*hx.r; i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
          ctx.closePath(); ctx.stroke();
          ctx.restore();
        });
      }
    };
  }

  /* ---------------- LEADERBOARDS: data streams + futuristic rankings ---------------- */
  function dataStreamsLayer(){
    let cols=[];
    return {
      resize(w,h){ cols = Array.from({length: Math.floor(w/26)},(_,i)=>({ x:i*26, y:rand(-h,0), speed:rand(2,6), len:rand(6,16) })); },
      draw(ctx,w,h){
        ctx.font='11px monospace';
        cols.forEach(c=>{
          c.y+=c.speed; if(c.y-c.len*14>h) c.y=rand(-h*.5,0);
          for(let i=0;i<c.len;i++){
            const a = 1-i/c.len;
            ctx.fillStyle=`rgba(46,196,182,${a*.4})`;
            ctx.fillText(Math.random()>.5?'1':'0', c.x, c.y-i*14);
          }
        });
      }
    };
  }
  function futuristicRankingsLayer(){
    return { draw(ctx,w,h,t){
      ctx.save();
      const cx=w*.5, cy=h*.5;
      for(let i=0;i<3;i++){
        const r = 120+i*90 + Math.sin(t*.006+i)*8;
        ctx.strokeStyle=`rgba(58,134,255,${.06-i*.015})`;
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }};
  }

  /* ---------------- REVIEWS: soft glow + stars ---------------- */
  function softGlowLayer(){
    return { draw(ctx,w,h){
      const g=ctx.createRadialGradient(w*.5,h*.4,10,w*.5,h*.4,w*.6);
      g.addColorStop(0,'rgba(255,214,10,.08)'); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    }};
  }
  function starsLayer(){
    let stars=[];
    return {
      resize(w,h){ stars = Array.from({length:90},()=>({ x:rand(0,w), y:rand(0,h), r:rand(.4,1.6), tw:rand(0,10) })); },
      draw(ctx,w,h,t){
        stars.forEach(s=>{
          const a = .3+Math.sin(t*.02+s.tw)*.3;
          ctx.fillStyle=`rgba(255,255,255,${Math.max(0,a)})`;
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill();
        });
      }
    };
  }

  /* ---------------- PROFILE: energy rings + particle trails ---------------- */
  function energyRingsLayer(){
    return { draw(ctx,w,h,t){
      const cx=w*.5, cy=h*.42;
      for(let i=0;i<4;i++){
        const r = 60+i*46 + (t*.4+i*30)%180;
        const a = Math.max(0,.22-(r/300));
        ctx.strokeStyle=`rgba(230,57,70,${a})`; ctx.lineWidth=1.4;
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      }
    }};
  }
  function particleTrailsLayer(){
    let pts=[];
    return {
      resize(w,h){ pts = Array.from({length:40},()=>({ x:rand(0,w), y:rand(0,h), a:rand(0,7), sp:rand(.4,1.2) })); },
      draw(ctx,w,h,t){
        pts.forEach(p=>{
          p.a += p.sp*.01;
          const x = p.x + Math.cos(p.a)*30, y = p.y+Math.sin(p.a)*30;
          ctx.fillStyle='rgba(58,134,255,.35)';
          ctx.beginPath(); ctx.arc(x,y,1.4,0,7); ctx.fill();
        });
      }
    };
  }

  /* ---------------- TESTER PANEL: cyber dashboard + holographic grid ---------------- */
  function cyberDashboardLayer(){
    let blips=[];
    return {
      resize(w,h){ blips = Array.from({length:20},()=>({ x:rand(0,w), y:rand(0,h), life:rand(0,200) })); },
      draw(ctx,w,h){
        blips.forEach(b=>{
          b.life+=1; if(b.life>200) b.life=0;
          const a = Math.sin((b.life/200)*Math.PI);
          ctx.strokeStyle=`rgba(46,196,182,${a*.5})`; ctx.lineWidth=1;
          ctx.strokeRect(b.x-10,b.y-10,20,20);
        });
      }
    };
  }
  function holoGridLayer(){
    return { draw(ctx,w,h,t){
      ctx.save();
      const persp = 200;
      ctx.strokeStyle='rgba(58,134,255,.14)';
      for(let i=0;i<14;i++){
        const y = h*.55 + i*i*1.3 + (t*.5)%20;
        if(y>h) continue;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
      }
      ctx.restore();
    }};
  }

  /* ---------------- OWNER PANEL: command center + neon network ---------------- */
  function commandCenterLayer(){
    return { draw(ctx,w,h,t){
      const cx=w*.5, cy=h*.5;
      ctx.save(); ctx.strokeStyle='rgba(230,57,70,.16)'; ctx.lineWidth=1;
      for(let r=80;r<Math.max(w,h);r+=90){ ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke(); }
      const angle = t*.004;
      ctx.strokeStyle='rgba(230,57,70,.35)';
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(angle)*Math.max(w,h), cy+Math.sin(angle)*Math.max(w,h)); ctx.stroke();
      ctx.restore();
    }};
  }
  function neonNetworkLayer(){
    let nodes=[];
    return {
      resize(w,h){ nodes = Array.from({length:22},()=>({ x:rand(0,w), y:rand(0,h), vx:rand(-.2,.2), vy:rand(-.2,.2) })); },
      draw(ctx,w,h){
        nodes.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; });
        for(let i=0;i<nodes.length;i++){
          for(let j=i+1;j<nodes.length;j++){
            const d = Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y);
            if(d<140){ ctx.strokeStyle=`rgba(58,134,255,${.14*(1-d/140)})`; ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke(); }
          }
        }
        nodes.forEach(n=>{ ctx.fillStyle='rgba(58,134,255,.6)'; ctx.beginPath(); ctx.arc(n.x,n.y,2,0,7); ctx.fill(); });
      }
    };
  }

  /* ---------------- STAFF APPLICATIONS: recruitment + floating docs + spotlight ---------------- */
  function floatingDocsLayer(){
    let docs=[];
    return {
      resize(w,h){ docs = Array.from({length:8},()=>({ x:rand(0,w), y:rand(0,h), vy:rand(.08,.2), r:rand(-.2,.2) })); },
      draw(ctx,w,h){
        docs.forEach(d=>{
          d.y-=d.vy; if(d.y<-60) d.y=h+60;
          ctx.save(); ctx.translate(d.x,d.y); ctx.rotate(d.r);
          ctx.strokeStyle='rgba(255,214,10,.14)'; ctx.fillStyle='rgba(255,214,10,.03)';
          ctx.fillRect(-16,-20,32,40); ctx.strokeRect(-16,-20,32,40);
          ctx.strokeStyle='rgba(255,214,10,.2)';
          for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(-9,-10+i*7); ctx.lineTo(9,-10+i*7); ctx.stroke(); }
          ctx.restore();
        });
      }
    };
  }

  /* ---------------- 404: glitch void ---------------- */
  function voidGlitchLayer(){
    return { draw(ctx,w,h,t){
      if(Math.random()>.92){
        ctx.fillStyle=`rgba(230,57,70,.06)`;
        ctx.fillRect(0, rand(0,h), w, rand(2,14));
      }
      ctx.strokeStyle='rgba(58,134,255,.05)';
      for(let i=0;i<3;i++){ const y=(h*.3)+i*80+Math.sin(t*.01+i)*20; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    }};
  }

  const REGISTRY = {
    home: ()=> [auroraLayer, hexGridLayer, ()=>particlesLayer(70), beamsLayer],
    rules: ()=> [blueprintLayer, digitalLinesLayer],
    announcements: ()=> [newsGlowLayer, floatingCardsLayer],
    staff: ()=> [()=>spotlightLayer('255,214,10'), glassPanelsLayer],
    testers: ()=> [pvpEnergyLayer, floatingHexLayer],
    leaderboards: ()=> [dataStreamsLayer, futuristicRankingsLayer],
    reviews: ()=> [softGlowLayer, starsLayer],
    profile: ()=> [energyRingsLayer, particleTrailsLayer],
    'tester-panel': ()=> [cyberDashboardLayer, holoGridLayer],
    'owner-panel': ()=> [commandCenterLayer, neonNetworkLayer],
    'staff-applications': ()=> [()=>spotlightLayer('255,214,10'), floatingDocsLayer],
    '404': ()=> [voidGlitchLayer, ()=>particlesLayer(30,['#e63946'])]
  };

  window.ATL_mountBackground = function(page){
    const fns = (REGISTRY[page] || REGISTRY.home)();
    mount(fns);
  };
})();
