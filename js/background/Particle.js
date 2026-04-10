export class Particle {
	constructor(width, height) {
		this.x = Math.random() * width;
		this.y = Math.random() * height;
		this.vx = (Math.random() - 0.5) * 0.2;
		this.vy = (Math.random() - 0.5) * 0.2;
		this.isPrimary = Math.random() > 0.5;
		const r = Math.random();
		this.size = 0.4 + Math.pow(r, 2.2) * 2.2;
		this.alpha = 0.28 + Math.pow(Math.random(), 1.35) * 0.8;
		this.twinkleSpeed = Math.random() < 0.22 ? 0.6 + Math.random() * 1.4 : 0;
		this.twinklePhase = Math.random() * Math.PI * 2;
	}

	update(width, height) {
		this.x += this.vx;
		this.y += this.vy;

		if (this.x < 0) this.x = width;
		if (this.x > width) this.x = 0;
		if (this.y < 0) this.y = height;
		if (this.y > height) this.y = 0;
	}

	draw(ctx, timeMs) {
		const isLight = document.body.classList.contains('light-mode');
		const color = isLight ? (this.isPrimary ? '#0052a3' : '#26384a') : this.isPrimary ? '#00f3ff' : '#ffffff';

		let a = this.alpha;
		if (isLight) a = Math.min(1, a * 1.35);
		if (this.twinkleSpeed) {
			const t = (timeMs || 0) * 0.001;
			const tw = 0.5 + 0.5 * Math.sin(this.twinklePhase + t * this.twinkleSpeed * 2.0);
			a *= 0.75 + tw * 0.35;
		}

		ctx.save();
		ctx.globalAlpha = Math.max(0, Math.min(1, a));
		ctx.fillStyle = color;
		ctx.beginPath();
		const radius = isLight ? this.size * 1.45 : this.size;
		ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}
