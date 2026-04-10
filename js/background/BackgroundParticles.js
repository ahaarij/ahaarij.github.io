import { prefersReducedMotion } from '../utils/media.js';
import { Particle } from './Particle.js';
import { ShootingStar } from './ShootingStar.js';

export class BackgroundParticles {
	constructor() {
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'global-bg-canvas';
		this.canvas.style.position = 'fixed';
		this.canvas.style.top = '0';
		this.canvas.style.left = '0';
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.style.zIndex = '-1';
		this.canvas.style.pointerEvents = 'none';
		this.canvas.style.opacity = '0.8';
		document.body.appendChild(this.canvas);

		const context = this.canvas.getContext('2d');
		if (!context) throw new Error('Could not get 2d context');
		this.ctx = context;

		this.width = 0;
		this.height = 0;
		this.particles = [];
		this.shootingStars = [];
		this.nebulaBlobs = [];
		this.flares = [];
		this.nextFlareAt = 0;
		this.nextShootingStarAt = 0;
		this.lastFrameAt = 0;
		this.animationFrameId = null;

		this.resize = this.resize.bind(this);
		this.animate = this.animate.bind(this);

		window.addEventListener('resize', this.resize);
		this.resize();
		this.initParticles();
		this.nebulaBlobs = this.createNebulaBlobs();
		this.nextShootingStarAt = performance.now() + 2500 + Math.random() * 3500;
		this.lastFrameAt = performance.now();
		this.nextFlareAt = performance.now() + 1800 + Math.random() * 3200;

		if (!prefersReducedMotion()) this.animate();
		else this.drawOnce();
	}

	refreshOnce() {
		if (prefersReducedMotion()) this.drawOnce();
	}

	resize() {
		const oldWidth = this.width;
		const oldHeight = this.height;

		this.width = this.canvas.width = window.innerWidth;
		this.height = this.canvas.height = window.innerHeight;

		if (oldWidth > 0 && oldHeight > 0) {
			const scaleX = this.width / oldWidth;
			const scaleY = this.height / oldHeight;
			this.particles.forEach((p) => {
				p.x *= scaleX;
				p.y *= scaleY;
			});
		}
	}

	createNebulaBlobs() {
		return [
			{ x: 0.22, y: 0.28, r: 520, drift: 0.00009, hue: 0 },
			{ x: 0.76, y: 0.22, r: 640, drift: 0.00007, hue: 1 },
			{ x: 0.55, y: 0.72, r: 760, drift: 0.00005, hue: 2 },
		];
	}

	initParticles() {
		this.particles = [];
		for (let i = 0; i < 55; i++) {
			this.particles.push(new Particle(this.width, this.height));
		}
	}

	drawNebula(nowMs) {
		const isLight = document.body.classList.contains('light-mode');
		const t = (nowMs || 0) * 0.001;

		this.ctx.save();
		this.ctx.globalCompositeOperation = 'screen';
		this.ctx.globalAlpha = isLight ? 0.14 : 0.12;

		for (const blob of this.nebulaBlobs) {
			const dx = Math.sin(t * (0.55 + blob.hue * 0.12)) * blob.r * blob.drift * 1200;
			const dy = Math.cos(t * (0.48 + blob.hue * 0.1)) * blob.r * blob.drift * 1200;
			const cx = blob.x * this.width + dx;
			const cy = blob.y * this.height + dy;
			const r = blob.r;

			const g = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
			if (isLight) {
				g.addColorStop(0, blob.hue === 1 ? 'rgba(0, 82, 163, 0.55)' : 'rgba(38, 56, 74, 0.55)');
				g.addColorStop(0.55, blob.hue === 2 ? 'rgba(0, 82, 163, 0.22)' : 'rgba(38, 56, 74, 0.18)');
				g.addColorStop(1, 'rgba(0,0,0,0)');
			} else {
				g.addColorStop(0, blob.hue === 1 ? 'rgba(0, 243, 255, 0.55)' : 'rgba(255, 0, 255, 0.32)');
				g.addColorStop(0.6, blob.hue === 2 ? 'rgba(0, 243, 255, 0.18)' : 'rgba(255, 0, 255, 0.12)');
				g.addColorStop(1, 'rgba(0,0,0,0)');
			}

			this.ctx.fillStyle = g;
			this.ctx.beginPath();
			this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
			this.ctx.fill();
		}

		this.ctx.restore();
	}

	maybeSpawnFlare(nowMs) {
		if (prefersReducedMotion()) return;
		if (nowMs < this.nextFlareAt) return;
		if (!this.particles.length) return;
		let bestIndex = Math.floor(Math.random() * this.particles.length);
		let bestScore = -1;
		for (let i = 0; i < 10; i++) {
			const idx = Math.floor(Math.random() * this.particles.length);
			const p = this.particles[idx];
			const score = (p.size || 0) * 0.9 + (p.alpha || 0) * 1.2;
			if (score > bestScore) {
				bestScore = score;
				bestIndex = idx;
			}
		}

		this.flares.push({ idx: bestIndex, start: nowMs, dur: 420 + Math.random() * 520 });
		this.nextFlareAt = nowMs + (2200 + Math.random() * 5200);
	}

	drawFlares(nowMs, drawOffsetX = 0, drawOffsetY = 0) {
		if (!this.flares.length) return;
		const isLight = document.body.classList.contains('light-mode');
		for (let i = this.flares.length - 1; i >= 0; i--) {
			const f = this.flares[i];
			const p = this.particles[f.idx];
			if (!p) {
				this.flares.splice(i, 1);
				continue;
			}
			const t = (nowMs - f.start) / f.dur;
			if (t >= 1) {
				this.flares.splice(i, 1);
				continue;
			}

			const pulse = Math.sin(t * Math.PI);
			const strength = pulse * pulse;
			const cx = p.x + drawOffsetX;
			const cy = p.y + drawOffsetY;
			const r = (isLight ? 26 : 30) + (p.size || 1) * 10;
			const g = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
			if (isLight) {
				g.addColorStop(0, `rgba(0, 82, 163, ${0.22 * strength})`);
				g.addColorStop(0.5, `rgba(38, 56, 74, ${0.12 * strength})`);
				g.addColorStop(1, 'rgba(0,0,0,0)');
			} else {
				g.addColorStop(0, `rgba(0, 243, 255, ${0.2 * strength})`);
				g.addColorStop(0.55, `rgba(255, 255, 255, ${0.08 * strength})`);
				g.addColorStop(1, 'rgba(0,0,0,0)');
			}

			this.ctx.save();
			this.ctx.globalCompositeOperation = 'screen';
			this.ctx.fillStyle = g;
			this.ctx.beginPath();
			this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.restore();
		}
	}

	drawHorizonFog() {
		const isLight = document.body.classList.contains('light-mode');
		const h = Math.max(140, Math.min(260, this.height * 0.28));
		const y0 = this.height - h;
		const g = this.ctx.createLinearGradient(0, y0, 0, this.height);
		if (isLight) {
			g.addColorStop(0, 'rgba(220, 227, 234, 0)');
			g.addColorStop(0.45, 'rgba(220, 227, 234, 0.12)');
			g.addColorStop(1, 'rgba(220, 227, 234, 0.28)');
		} else {
			g.addColorStop(0, 'rgba(5, 5, 5, 0)');
			g.addColorStop(0.55, 'rgba(5, 5, 5, 0.22)');
			g.addColorStop(1, 'rgba(5, 5, 5, 0.48)');
		}
		this.ctx.save();
		this.ctx.globalCompositeOperation = 'source-over';
		this.ctx.fillStyle = g;
		this.ctx.fillRect(0, y0, this.width, h);
		this.ctx.restore();
	}

	maybeSpawnShootingStar(nowMs) {
		if (nowMs < this.nextShootingStarAt) return;
		this.shootingStars.push(new ShootingStar(this.width, this.height));
		this.nextShootingStarAt = nowMs + (5000 + Math.random() * 9000);
	}

	drawFrame(nowMs) {
		const isLight = document.body.classList.contains('light-mode');
		this.canvas.style.opacity = isLight ? '1' : '0.8';
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.maybeSpawnShootingStar(nowMs);
		this.maybeSpawnFlare(nowMs);
		const dt = Math.max(0, Math.min(50, nowMs - this.lastFrameAt));
		this.lastFrameAt = nowMs;

		this.drawNebula(nowMs);

		this.particles.forEach((p) => {
			p.update(this.width, this.height);
			p.draw(this.ctx, nowMs);
		});

		for (let i = this.shootingStars.length - 1; i >= 0; i--) {
			const star = this.shootingStars[i];
			star.update(dt);
			star.draw(this.ctx);
			if (star.isDead()) this.shootingStars.splice(i, 1);
		}

		this.drawFlares(nowMs);
		this.ctx.strokeStyle = isLight ? 'rgba(0, 82, 163, 0.22)' : 'rgba(255, 255, 255, 0.12)';
		for (let i = 0; i < this.particles.length; i++) {
			for (let j = i + 1; j < this.particles.length; j++) {
				const dx = this.particles[i].x - this.particles[j].x;
				const dy = this.particles[i].y - this.particles[j].y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < 120) {
					this.ctx.beginPath();
					this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
					this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
					this.ctx.stroke();
				}
			}
		}

		this.drawHorizonFog();
	}

	drawOnce() {
		const isLight = document.body.classList.contains('light-mode');
		this.canvas.style.opacity = isLight ? '0.95' : '0.8';
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.drawNebula(0);
		this.particles.forEach((p) => p.draw(this.ctx, 0));
		this.drawHorizonFog();
	}

	animate() {
		this.drawFrame(performance.now());
		this.animationFrameId = requestAnimationFrame(this.animate);
	}
}
