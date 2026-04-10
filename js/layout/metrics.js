function setCssVarPx(name, px) {
	try {
		document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(px))}px`);
	} catch {
	}
}

function parsePx(value) {
	const n = parseFloat(String(value || '').trim());
	return Number.isFinite(n) ? n : 0;
}

export function initLayoutMetrics() {
	const panels = document.querySelector('.site-panels');
	const content = document.querySelector('.site-content');
	const body = document.body;
	if (!panels) return;

	const update = () => {
		const rect = panels.getBoundingClientRect();
		setCssVarPx('--panels-h', rect.height);
		const rootStyles = getComputedStyle(document.documentElement);
		const panelsBottom = parsePx(rootStyles.getPropertyValue('--panels-bottom')) || 36;
		const panelsGap = parsePx(rootStyles.getPropertyValue('--panels-gap')) || 28;
		const contentTop = content ? parsePx(getComputedStyle(content).top) || 140 : 140;
		const available = window.innerHeight - contentTop - (panelsBottom + rect.height + panelsGap);
		const shouldFlow = available < 220;
		if (body) body.classList.toggle('layout-flow', shouldFlow);
	};

	update();

	if (typeof ResizeObserver !== 'undefined') {
		const ro = new ResizeObserver(() => update());
		ro.observe(panels);
		window.addEventListener('beforeunload', () => ro.disconnect(), { once: true });
	} else {
		window.addEventListener('resize', update);
	}
}
