export function restartAnimationClass(el, className) {
	if (!el) return;
	el.classList.remove(className);
	void el.offsetWidth;
	el.classList.add(className);
}

export function canUseViewTransitions() {
	return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
}
