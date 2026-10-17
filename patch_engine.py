import os
base = r'd:\APK to WEB\fireworks-studio\src'
BT = chr(96)

path = os.path.join(base, 'services', 'engine.ts')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: The draw method redraws background EVERY frame which erases particles
# Change: use a persistent background and only draw it once, then use semi-transparent overlay
old = """  private draw(time: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    this.drawBackground(time);
    ctx.fillStyle = 'rgba(5, 5, 26, 0.15)';
    ctx.fillRect(0, 0, w, h);"""

new = """  private draw(time: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    // Semi-transparent overlay for trail persistence (don't fully clear)
    ctx.fillStyle = 'rgba(5, 5, 26, 0.25)';
    ctx.fillRect(0, 0, w, h);
    // Redraw background stars only (very faint, under the overlay)
    this.drawStarsOnly(time);"""

content = content.replace(old, new)

# Add a drawStarsOnly method that only draws stars faintly
old2 = """  private drawBackground(time: number) {"""
new2 = """  private drawStarsOnly(time: number) {
    const ctx = this.ctx;
    for (const star of this.stars) {
      const twinkle = Math.sin(time * star.speed * 0.001 + star.twinkle) * 0.5 + 0.5;
      const alpha = 0.15 + twinkle * 0.35;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * (0.7 + twinkle * 0.3), 0, Math.PI * 2);
""" + f"      ctx.fillStyle = {BT}rgba(255, 255, 255, ${{alpha}}){BT};\n" + """      ctx.fill();
    }
  }

  private drawInitialBackground() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#05051a');
    grad.addColorStop(0.3, '#0a0a2e');
    grad.addColorStop(0.6, '#0d1137');
    grad.addColorStop(0.85, '#111640');
    grad.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0a0a15';
    ctx.beginPath();
    ctx.moveTo(0, h);
    const buildings = 30;
    const bw = w / buildings;
    for (let i = 0; i <= buildings; i++) {
      const bh = 20 + Math.sin(i * 1.7) * 15 + Math.cos(i * 0.8) * 25;
      ctx.lineTo(i * bw, h - bh);
      if (i < buildings) ctx.lineTo((i + 0.9) * bw, h - bh);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  private drawBackground(time: number) {"""

content = content.replace(old2, new2)

# Fix the start method to draw initial background
old3 = """  start() {
    const loop = (time: number) => {
      this.update();
      this.draw(time);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }"""

new3 = """  start() {
    this.drawInitialBackground();
    const loop = (time: number) => {
      this.update();
      this.draw(time);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }"""

content = content.replace(old3, new3)

# Fix particle lifetimes to be longer
content = content.replace('life: 60 + Math.random() * 80', 'life: 120 + Math.random() * 120')
content = content.replace('decay: 0.008 + Math.random() * 0.008', 'decay: 0.004 + Math.random() * 0.006')

# Fix launch speed to be faster (negative vy should be stronger)  
content = content.replace('vy: -(8 + Math.random() * 4)', 'vy: -(12 + Math.random() * 6)')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('OK: engine.ts patched for visible fireworks')
