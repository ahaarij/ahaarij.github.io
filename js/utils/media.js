export function prefersReducedMotion() {
	try {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	} catch {
		return false;
	}
}

export function prefersLightScheme() {
	try {
		return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
	} catch {
		return false;
	}
}
