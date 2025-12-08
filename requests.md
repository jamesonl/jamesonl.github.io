---
layout: page
title: Requests
permalink: /requests/
---

Have a request? Email it to me at [jameson.lee@emergence.studio](mailto:jameson.lee@emergence.studio)!

<div class="request-aurora-card">
  <canvas id="request-aurora" aria-hidden="true"></canvas>
  <div class="request-aurora-copy">
    <h2>Send your spark</h2>
    <p>Move your cursor (or tap) to stir glowing ribbons that fade into the ether while you dream up the next request.</p>
  </div>
</div>

<style>
  .request-aurora-card {
    position: relative;
    margin: 2rem 0;
    min-height: 320px;
    border-radius: 18px;
    overflow: hidden;
    background: radial-gradient(circle at 20% 20%, rgba(111, 196, 255, 0.25), transparent 35%),
                radial-gradient(circle at 80% 0%, rgba(255, 144, 214, 0.25), transparent 30%),
                #0b1026;
    color: #e8f1ff;
    box-shadow: 0 14px 45px rgba(11, 16, 38, 0.35);
  }

  #request-aurora {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .request-aurora-copy {
    position: relative;
    z-index: 1;
    padding: 2.5rem;
    max-width: 520px;
    text-shadow: 0 1px 12px rgba(11, 16, 38, 0.45);
  }

  .request-aurora-copy h2 {
    margin-top: 0;
    font-size: 1.9rem;
    letter-spacing: 0.02em;
  }

  .request-aurora-copy p {
    margin-bottom: 0;
    line-height: 1.7;
    font-size: 1.03rem;
  }

  @media (max-width: 640px) {
    .request-aurora-card {
      min-height: 260px;
    }

    .request-aurora-copy {
      padding: 1.8rem;
    }

    .request-aurora-copy h2 {
      font-size: 1.5rem;
    }
  }
</style>

<script>
  (() => {
    const canvas = document.getElementById('request-aurora');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const palette = [
      '#6fc4ff',
      '#ff90d6',
      '#a0ffcb',
      '#7c6dff',
      '#f6ff8f'
    ];

    const particles = [];
    let width = 0;
    let height = 0;
    let deviceScale = Math.min(window.devicePixelRatio || 1, 2);

    const pointer = { x: 0, y: 0, active: false };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = Math.random() * 60 + 60;
        this.size = Math.random() * 2.4 + 1.1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.7 + 0.4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.hue = palette[Math.floor(Math.random() * palette.length)];
        this.swing = Math.random() * 0.18 + 0.02;
        this.theta = Math.random() * Math.PI * 2;
      }

      update() {
        this.life -= 1;
        this.theta += this.swing;
        this.x += this.vx + Math.cos(this.theta) * 0.45;
        this.y += this.vy + Math.sin(this.theta) * 0.4;
        this.size *= 0.995;
      }

      draw() {
        const alpha = Math.max(this.life / 120, 0);
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 14);
        gradient.addColorStop(0, `${this.hue}aa`);
        gradient.addColorStop(1, `${this.hue}00`);
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size * 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `${this.hue}${Math.floor(alpha * 200 + 40).toString(16).padStart(2, '0')}`;
        ctx.arc(this.x, this.y, this.size * 3.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      deviceScale = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * deviceScale;
      canvas.height = height * deviceScale;
      ctx.resetTransform();
      ctx.scale(deviceScale, deviceScale);
    }

    function spawn(count = 10, origin) {
      const rect = canvas.getBoundingClientRect();
      const baseX = origin ? origin.x : rect.width / 2 + Math.random() * rect.width * 0.2 - rect.width * 0.1;
      const baseY = origin ? origin.y : rect.height / 2 + Math.random() * rect.height * 0.2 - rect.height * 0.1;
      for (let i = 0; i < count; i += 1) {
        particles.push(new Particle(baseX, baseY));
      }
    }

    function tick() {
      ctx.fillStyle = 'rgba(9, 12, 28, 0.2)';
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0 || p.size < 0.2 || p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(tick);
    }

    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      spawn(6, pointer);
    });

    canvas.addEventListener('pointerleave', () => {
      pointer.active = false;
    });

    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      spawn(16, pointer);
    });

    window.addEventListener('resize', resize);

    resize();
    spawn(80);
    tick();
  })();
</script>
