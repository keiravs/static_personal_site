(function () {
  const canvas = document.getElementById('pond');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#c4b8ea', '#a8d8c0', '#f4bfa3', '#a8cfe8', '#f0b8cc', '#f0e4a0'];
  const BG = '#faf9f7';

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Ripple {
    constructor(x, y, color) {
      this.x = x; this.y = y; this.color = color;
      this.r = 5; this.alpha = 0.45;
    }
    update() { this.r += 0.65; this.alpha *= 0.93; }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
    dead() { return this.alpha < 0.015; }
  }

  class Strider {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.size = Math.random() * 3 + 3.5;
      this.vx = 0; this.vy = 0;
      this.idle = true;
      this.countdown = this._idleTime();
    }
    _idleTime() { return Math.random() * 220 + 80; }
    dart(ripples) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.idle = false;
      ripples.push(new Ripple(this.x, this.y, this.color));
    }
    update(ripples) {
      if (this.idle) {
        this.vx += (Math.random() - 0.5) * 0.12;
        this.vy += (Math.random() - 0.5) * 0.12;
        this.vx *= 0.82; this.vy *= 0.82;
        this.countdown--;
        if (this.countdown <= 0) this.dart(ripples);
      } else {
        this.vx *= 0.90; this.vy *= 0.90;
        if (Math.hypot(this.vx, this.vy) < 0.25) {
          this.vx = 0; this.vy = 0;
          this.idle = true;
          this.countdown = Math.random() < 0.3
            ? Math.random() * 40 + 15
            : this._idleTime();
          ripples.push(new Ripple(this.x, this.y, this.color));
        }
      }
      this.x += this.vx; this.y += this.vy;
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.beginPath();
      ctx.ellipse(this.x + 1, this.y + this.size * 0.9, this.size * 0.85, this.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  const count = Math.min(18, Math.max(10, Math.floor(window.innerWidth / 80)));
  const striders = Array.from({ length: count }, () => new Strider());
  const ripples = [];

  function frame() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update(); ripples[i].draw();
      if (ripples[i].dead()) ripples.splice(i, 1);
    }
    for (const s of striders) { s.update(ripples); s.draw(); }
    requestAnimationFrame(frame);
  }
  frame();
})();
