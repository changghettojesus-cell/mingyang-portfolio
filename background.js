
(() => {
  const canvas = document.querySelector(".background-dots");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const spacing = 23;
  const radius = 132;
  const pointer = { x: 0, y: 0, active: false };
  let width, height, points, base, glow;
  let frame = 0;

  function layout() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = [];
    base = new Path2D();
    for (let y = 10; y < height + spacing; y += spacing) {
      for (let x = 10; x < width + spacing; x += spacing) {
        points.push({ x, y, dx: 0, dy: 0, vx: 0, vy: 0, light: 0 });
        base.moveTo(x + 1.05, y);
        base.arc(x, y, 1.05, 0, Math.PI * 2);
      }
    }
    glow = document.createElement("canvas");
    glow.width = glow.height = 240;
    const halo = glow.getContext("2d");
    const gradient = halo.createRadialGradient(120,120,0,120,120,120);
    gradient.addColorStop(0,"#eab87916");
    gradient.addColorStop(.6,"#c6814710");
    gradient.addColorStop(1,"#c6814700");
    halo.fillStyle = gradient;
    halo.fillRect(0,0,240,240);
    draw(0,false);
  }

  function draw(time, animate) {
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = "#b7966928";
    ctx.fill(base);
    if (!animate) return false;
    if (pointer.active) ctx.drawImage(glow,pointer.x-120,pointer.y-120);
    let settling = false;
    for (const point of points) {
      const x = point.x - pointer.x;
      const y = point.y - pointer.y;
      const distance = pointer.active && Math.abs(x)<radius && Math.abs(y)<radius ? Math.hypot(x,y) : radius;
      const weight = Math.max(0,1-distance/radius);
      if (!weight && Math.abs(point.dx)+Math.abs(point.dy)+point.light < .035) continue;

      const wave = Math.sin(distance*.078-time*.009) * weight * 10;
      const twist = weight * 6;
      const normal = distance || 1;
      const targetX = (x*wave-y*twist)/normal;
      const targetY = (y*wave+x*twist)/normal;
      point.vx = (point.vx+(targetX-point.dx)*.16)*.73;
      point.vy = (point.vy+(targetY-point.dy)*.16)*.73;
      point.dx += point.vx;
      point.dy += point.vy;
      point.light += (weight-point.light)*.18;
      const hue = 36 + Math.sin(time*.003+distance*.066)*12;
      ctx.fillStyle = "hsla("+hue+",82%,65%,"+Math.min(.95,point.light*.86)+")";
      ctx.beginPath();
      ctx.arc(point.x+point.dx,point.y+point.dy,1+point.light*2.5,0,Math.PI*2);
      ctx.fill();
      settling = true;
    }
    return settling;
  }

  function tick(time) {
    frame = 0;
    if (draw(time,true) || pointer.active) schedule();
    else draw(0,false);
  }

  function schedule() {
    if (!frame && !reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function follow(event) {
    if (!event.isPrimary || reducedMotion.matches) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    schedule();
  }

  function release() {
    pointer.active = false;
    schedule();
  }

  window.addEventListener("pointermove",follow,{passive:true});
  window.addEventListener("pointerdown",follow,{passive:true});
  window.addEventListener("pointerup",event => { if (event.pointerType !== "mouse") release(); },{passive:true});
  window.addEventListener("pointercancel",release,{passive:true});
  window.addEventListener("pointerout",event => { if (!event.relatedTarget) release(); },{passive:true});
  window.addEventListener("blur",release);
  window.addEventListener("resize",layout);
  document.addEventListener("visibilitychange",() => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer.active = false;
    } else {
      schedule();
    }
  });
  reducedMotion.addEventListener("change",() => {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer.active = false;
    layout();
  });
  layout();
})();