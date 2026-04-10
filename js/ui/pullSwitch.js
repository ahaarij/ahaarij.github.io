import { prefersReducedMotion } from '../utils/media.js';
import { restartAnimationClass } from '../utils/dom.js';
import { getTheme, toggleThemeWithTransition } from '../theme/theme.js';

export function initPullSwitch({ particles } = {}) {
	const pullSwitch = document.getElementById('pull-switch');
	const handle = document.getElementById('pull-handle');
	if (!pullSwitch || !handle) return;

	const UI_SCALE = 0.6;
	const maxPull = Math.round(30 / UI_SCALE);
	const threshold = Math.round(25 / UI_SCALE);
	const maxWiggleX = 2 / UI_SCALE;
	let dragging = false;
	let moved = false;
	let clicking = false;
	let startY = 0;
	let startX = 0;
	let pull = 0;
	let wiggleX = 0;
	let pointerId = null;

	const cordLen = 110;
	const maxTiltDeg = 7;
	const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
	const setPull = (dy, dx = 0) => {
		pull = clamp(dy, 0, maxPull);
		wiggleX = clamp(dx, -maxWiggleX, maxWiggleX);
		pullSwitch.style.setProperty('--pull', `${pull}px`);
		pullSwitch.style.setProperty('--wiggle', `${wiggleX}px`);

		let tilt = 0;
		if (pull > 2) {
			const effectiveLen = cordLen + pull + 24;
			tilt = (Math.atan2(-wiggleX, Math.max(1, effectiveLen)) * 180) / Math.PI;
			tilt = clamp(tilt, -maxTiltDeg, maxTiltDeg);
		}
		pullSwitch.style.setProperty('--tilt', `${tilt}deg`);
	};

	const syncAria = () => {
		pullSwitch.setAttribute('aria-checked', getTheme() === 'light' ? 'true' : 'false');
	};

	const release = (didToggle, { swing = true } = {}) => {
		pullSwitch.classList.add('is-animating');
		setPull(0, 0);
		setTimeout(() => pullSwitch.classList.remove('is-animating'), 320);
		if (didToggle && swing && !prefersReducedMotion()) restartAnimationClass(pullSwitch, 'is-swinging');
		if (!didToggle) {
			particles?.refreshOnce?.();
			syncAria();
		}
	};

	const clickPull = () => {
		if (clicking) return;
		if (prefersReducedMotion()) {
			const next = getTheme() === 'light' ? 'dark' : 'light';
			const rect = handle.getBoundingClientRect();
			toggleThemeWithTransition(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }).finally(() => {
				particles?.refreshOnce?.();
				syncAria();
			});
			release(true);
			return;
		}
		clicking = true;
		pullSwitch.classList.add('is-clicking');
		pullSwitch.classList.remove('is-animating');
		setPull(0, 0);

		const cordEl = pullSwitch.querySelector('.pullSwitch__cord');
		const dragEl = pullSwitch.querySelector('.pullSwitch__drag');
		if (!cordEl || !dragEl) {
			clicking = false;
			pullSwitch.classList.remove('is-clicking');
			release(true);
			return;
		}

		const baseCordHeight = parseFloat(getComputedStyle(cordEl).height) || cordLen;
		const down = Math.round(maxPull * 0.94);
		const bounceDown = Math.round(down * 0.2);
		const duration = 1750;
		const riseOffset = 0.68;
		const bounceDownOffset = 0.78;
		const bounceUpOffset = 0.88;
		cordEl.style.height = `${baseCordHeight + down}px`;
		handle.style.transform = `translate(-50%, ${down}px)`;
		const rect = handle.getBoundingClientRect();
		const next = getTheme() === 'light' ? 'dark' : 'light';
		toggleThemeWithTransition(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }).finally(() => {
			particles?.refreshOnce?.();
			syncAria();
		});
		if (!prefersReducedMotion()) restartAnimationClass(pullSwitch, 'is-swinging');

		requestAnimationFrame(() => {
			const cordAnim = cordEl.animate(
				[
					{ height: `${baseCordHeight + down}px`, offset: 0, easing: 'cubic-bezier(0.2, 0.0, 0.2, 1)' },
					{ height: `${baseCordHeight}px`, offset: riseOffset, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
					{ height: `${baseCordHeight + bounceDown}px`, offset: bounceDownOffset, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
					{ height: `${baseCordHeight}px`, offset: bounceUpOffset, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
					{ height: `${baseCordHeight}px`, offset: 1, easing: 'ease-out' },
				],
				{ duration, easing: 'linear' }
			);

			const handleAnim = handle.animate(
				[
					{ transform: `translate(-50%, ${down}px)`, offset: 0, easing: 'cubic-bezier(0.2, 0.0, 0.2, 1)' },
					{ transform: 'translate(-50%, 0px)', offset: riseOffset, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
					{ transform: `translate(-50%, ${bounceDown}px)`, offset: bounceDownOffset, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
					{ transform: 'translate(-50%, 0px)', offset: bounceUpOffset, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
					{ transform: 'translate(-50%, 0px)', offset: 1, easing: 'ease-out' },
				],
				{ duration, easing: 'linear' }
			);

			const wobbleAnim = dragEl.animate(
				[
					{ transform: 'translateX(0px) rotate(0deg)', offset: 0 },
					{ transform: `translateX(${1.2 / UI_SCALE}px) rotate(1.6deg)`, offset: 0.28 },
					{ transform: `translateX(${-1.0 / UI_SCALE}px) rotate(-1.3deg)`, offset: 0.52 },
					{ transform: `translateX(${0.8 / UI_SCALE}px) rotate(1.0deg)`, offset: 0.74 },
					{ transform: `translateX(${-0.5 / UI_SCALE}px) rotate(-0.6deg)`, offset: 0.88 },
					{ transform: 'translateX(0px) rotate(0deg)', offset: 1 },
				],
				{ duration, easing: 'ease-in-out' }
			);

			Promise.all([
				cordAnim.finished.catch(() => undefined),
				handleAnim.finished.catch(() => undefined),
				wobbleAnim.finished.catch(() => undefined),
			]).then(() => {
				clicking = false;
				pullSwitch.classList.remove('is-clicking');
				cordEl.style.height = '';
				handle.style.transform = '';
				setPull(0, 0);
			});
		});
	};

	syncAria();

	handle.addEventListener('pointerdown', (e) => {
		e.preventDefault();
		if (clicking) return;
		dragging = true;
		moved = false;
		pointerId = e.pointerId;
		startY = e.clientY;
		startX = e.clientX;
		pullSwitch.classList.remove('is-animating');
		handle.setPointerCapture(pointerId);
	});

	handle.addEventListener('pointermove', (e) => {
		e.preventDefault();
		if (clicking) return;
		if (!dragging) return;
		if (pointerId !== null && e.pointerId !== pointerId) return;
		const dy = e.clientY - startY;
		const dx = e.clientX - startX;
		if (Math.abs(dy) > 2 || Math.abs(dx) > 2) moved = true;
		setPull(dy, dx);
	});

	const onPointerUp = () => {
		if (clicking) return;
		if (!dragging) return;
		dragging = false;
		if (!moved) {
			pointerId = null;
			clickPull();
			return;
		}

		const didToggle = pull >= threshold;
		if (didToggle) {
			const rect = handle.getBoundingClientRect();
			const next = getTheme() === 'light' ? 'dark' : 'light';
			toggleThemeWithTransition(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }).finally(() => {
				particles?.refreshOnce?.();
				syncAria();
			});
		}
		pointerId = null;
		release(didToggle);
	};

	handle.addEventListener('pointerup', onPointerUp);
	handle.addEventListener('pointercancel', onPointerUp);
}
