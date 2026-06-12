/* ===== NekoZ Note 共通エフェクト：星空 + マウス/タッチで晴れる雲 ===== */
(function () {
  /* ----- 星空 ----- */
  const canvas = document.getElementById('stars');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [], w, h;
    function makeStars() {
      const count = Math.floor((w * h) / 1400);
      stars = [];
      for (let i = 0; i < count; i++) stars.push({
        x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.2+0.2,
        base: Math.random()*0.5+0.3, tw: Math.random()*0.02+0.005, phase: Math.random()*Math.PI*2,
        hue: Math.random()<0.15 ? (Math.random()<0.5?'200,220,255':'255,240,210') : '255,255,255'
      });
    }
    function resize(){ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; makeStars(); }
    window.addEventListener('resize', resize); resize();
    let t = 0;
    function draw(){
      ctx.clearRect(0,0,w,h); t++;
      for (const s of stars){
        const alpha = Math.max(0, Math.min(1, s.base + Math.sin(t*s.tw+s.phase)*0.3));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = 'rgba('+s.hue+','+alpha+')';
        if (s.r>1){ ctx.shadowColor='rgba('+s.hue+',0.8)'; ctx.shadowBlur=4; } else { ctx.shadowBlur=0; }
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ----- マウス/タッチで雲が晴れる ----- */
  const clouds = document.getElementById('clouds');
  if (clouds) {
    // PC：マウス位置
    window.addEventListener('mousemove', e => {
      clouds.style.setProperty('--mx', e.clientX+'px');
      clouds.style.setProperty('--my', e.clientY+'px');
    });
    document.addEventListener('mouseleave', () => {
      clouds.style.setProperty('--mx','-500px');
      clouds.style.setProperty('--my','-500px');
    });
    // スマホ：指で触れた・動かした位置
    function touchClear(e) {
      if (e.touches && e.touches.length > 0) {
        const t = e.touches[0];
        clouds.style.setProperty('--mx', t.clientX+'px');
        clouds.style.setProperty('--my', t.clientY+'px');
      }
    }
    window.addEventListener('touchstart', touchClear, { passive: true });
    window.addEventListener('touchmove', touchClear, { passive: true });
  }
})();
