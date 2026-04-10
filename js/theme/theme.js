import { prefersReducedMotion } from '../utils/media.js';
import { canUseViewTransitions } from '../utils/dom.js';

export function stripThemeParamFromUrl() {
	try {
		const url = new URL(window.location.href);
		if (!url.searchParams.has('theme')) return;
		url.searchParams.delete('theme');
		history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
	} catch {
	}
}

export function resolveThemeFromUrl() {
	try {
		const t = new URLSearchParams(window.location.search).get('theme');
		if (!t) return null;
		const v = String(t).trim().toLowerCase();
		stripThemeParamFromUrl();
		if (v === 'light' || v === 'dark') return v;
		return null;
	} catch {
		return null;
	}
}

export function resolveThemeFromStorage() {
	try {
		const t = localStorage.getItem('theme');
		if (!t) return null;
		const v = String(t).trim().toLowerCase();
		if (v === 'light' || v === 'dark') return v;
		return null;
	} catch {
		return null;
	}
}

export function setTheme(next) {
	const v = String(next || '').toLowerCase() === 'light' ? 'light' : 'dark';
	if (v === 'light') {
		document.body.classList.add('light-mode');
		document.body.classList.remove('dark-mode');
	} else {
		document.body.classList.add('dark-mode');
		document.body.classList.remove('light-mode');
	}
	try {
		document.documentElement.style.colorScheme = v;
	} catch {
	}
	try {
		localStorage.setItem('theme', v);
	} catch {
	}
}

export function getTheme() {
	return document.body.classList.contains('light-mode') ? 'light' : 'dark';
}

export function toggleThemeWithTransition(nextTheme, origin) {
	const next = String(nextTheme || '').toLowerCase() === 'light' ? 'light' : 'dark';
	if (prefersReducedMotion() || !canUseViewTransitions()) {
		setTheme(next);
		return Promise.resolve();
	}

	const root = document.documentElement;
	const x = origin && Number.isFinite(origin.x) ? origin.x : window.innerWidth / 2;
	const y = origin && Number.isFinite(origin.y) ? origin.y : window.innerHeight / 2;

	root.style.setProperty('--theme-x', `${x}px`);
	root.style.setProperty('--theme-y', `${y}px`);
	root.classList.add('theme-transitioning');

	try {
		const transition = document.startViewTransition(() => {
			setTheme(next);
		});
		return transition.finished
			.catch(() => undefined)
			.finally(() => {
				root.classList.remove('theme-transitioning');
				root.style.removeProperty('--theme-x');
				root.style.removeProperty('--theme-y');
			});
	} catch {
		root.classList.remove('theme-transitioning');
		root.style.removeProperty('--theme-x');
		root.style.removeProperty('--theme-y');
		setTheme(next);
		return Promise.resolve();
	}
}
