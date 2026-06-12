(function () {
  // Accent colour per page — used to pick the right iris colour on exit
  const PAGE_COLORS = {
    'index.html':     '#faf9f7',
    'about.html':     '#e8e3f5',
    'education.html': '#ddf0e8',
    'projects.html':  '#fde8dc',
    'contact.html':   '#dceef8',
    'flights.html':   '#05060a',
    'trisolaris.html': '#030208',
  };

  function ease(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }

  function makeCanvas(zIndex) {
    const cv = document.createElement('canvas');
    cv.className = 'iris-canvas';
    cv.style.cssText = `position:fixed;inset:0;width:100%;height:100%;z-index:${zIndex};pointer-events:none;`;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    document.body.appendChild(cv);
    return cv;
  }

  function drawIris(ctx, color, holeRadius) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    if (holeRadius > 0) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, holeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  // Entrance: full overlay → hole grows from centre → overlay removed
  function irisOpen(color) {
    const cv = makeCanvas(50);
    const ctx = cv.getContext('2d');
    const maxR = Math.hypot(cv.width / 2, cv.height / 2) * 1.05;
    const dur = 540, t0 = performance.now();

    (function tick(now) {
      const t = Math.min((now - t0) / dur, 1);
      drawIris(ctx, color, ease(t) * maxR);
      t < 1 ? requestAnimationFrame(tick) : cv.remove();
    })(performance.now());
  }

  // Exit: full hole (content visible) → hole shrinks to centre → navigate
  function irisClose(color, href) {
    const cv = makeCanvas(100);
    const ctx = cv.getContext('2d');
    const maxR = Math.hypot(cv.width / 2, cv.height / 2) * 1.05;
    const dur = 420, t0 = performance.now();

    (function tick(now) {
      const t = Math.min((now - t0) / dur, 1);
      drawIris(ctx, color, (1 - ease(t)) * maxR);
      t < 1 ? requestAnimationFrame(tick) : (window.location.href = href);
    })(performance.now());
  }

  // Call once per sub-page: plays entrance iris and wires up all local links
  function init(pageColor) {
    irisOpen(pageColor);

    let leaving = false;

    // Back/forward-cache restores the page exactly as it was mid-exit: covered
    // by the solid iris canvas, with `leaving` stuck true. Clean up and replay
    // the entrance so the Back button lands on a working page.
    window.addEventListener('pageshow', e => {
      if (!e.persisted) return;
      leaving = false;
      document.querySelectorAll('canvas.iris-canvas').forEach(c => c.remove());
      irisOpen(pageColor);
    });
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
      a.addEventListener('click', e => {
        e.preventDefault();
        if (leaving) return;
        leaving = true;
        const dest = href.split('?')[0].split('#')[0];
        irisClose(PAGE_COLORS[dest] || pageColor, href);
      });
    });
  }

  window.SiteTransitions = { init, irisOpen, irisClose };
})();
