export class ShootingStar {
	constructor(width, height) {
		const edge = Math.floor(Math.random() * 4);
		const pad = 80;
		if (edge === 0) {
			this.x = Math.random() * width;
			this.y = -pad;
		} else if (edge === 1) {
			this.x = width + pad;
			this.y = Math.random() * height;
		} else if (edge === 2) {
			this.x = Math.random() * width;
			this.y = height + pad;
		} else {
			this.x = -pad;
			this.y = Math.random() * height;
		}

		const angle = Math.PI * (0.15 + Math.random() * 0.7);
		const speed = 650 + Math.random() * 650;
		this.vx = Math.cos(angle) * speed;
		this.vy = Math.sin(angle) * speed;
		this.length = 320 + Math.random() * 360;
		this.width = 1.4 + Math.random() * 1.8;
		this.life = 0;
		this.maxLife = 950 + Math.random() * 750;
	}

	update(dtMs) {
		this.life += dtMs;
		const dt = dtMs / 1000;
		this.x += this.vx * dt;
		this.y += this.vy * dt;
	}

	isDead() {
		return this.life >= this.maxLife;
	}

	draw(ctx) {
		const isLight = document.body.classList.contains('light-mode');
		const headX = this.x;
		const headY = this.y;
		const vLen = Math.hypot(this.vx, this.vy) || 1;
		const nx = this.vx / vLen;
		const ny = this.vy / vLen;
		const tailX = headX - nx * this.length;
		const tailY = headY - ny * this.length;

		const fadeIn = Math.min(1, this.life / 120);
		const fadeOut = Math.max(0, 1 - (this.life - (this.maxLife - 180)) / 180);
		const alpha = Math.max(0, Math.min(1, fadeIn * fadeOut));

		const glow = isLight ? 'rgba(0, 82, 163, 1)' : 'rgba(0, 243, 255, 1)';
		const core = isLight ? 'rgba(26, 36, 46, 1)' : 'rgba(255, 255, 255, 1)';
		const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
		grad.addColorStop(0, 'rgba(0,0,0,0)');
		grad.addColorStop(0.45, glow);
		grad.addColorStop(1, core);

		ctx.save();
		ctx.globalAlpha = alpha * (isLight ? 1.0 : 0.85);
		ctx.lineCap = 'round';
		ctx.shadowBlur = isLight ? 10 : 14;
		ctx.shadowColor = isLight ? 'rgba(0, 82, 163, 0.55)' : 'rgba(0, 243, 255, 0.45)';
		ctx.strokeStyle = grad;
		ctx.lineWidth = this.width * (isLight ? 1.25 : 1.0);
		ctx.beginPath();
		ctx.moveTo(tailX, tailY);
		ctx.lineTo(headX, headY);
		ctx.stroke();
		ctx.restore();
	}
}
