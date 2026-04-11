import { prefersLightScheme } from './utils/media.js';
import { resolveThemeFromStorage, resolveThemeFromUrl, setTheme } from './theme/theme.js';
import { BackgroundParticles } from './background/BackgroundParticles.js';
import { initPullSwitch } from './ui/pullSwitch.js';
import { initLayoutMetrics } from './layout/metrics.js';

function normalizeRouteFromLocation() {
	const raw = String(window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
	if (!raw) return 'home';
	if (raw === 'projects') return 'projects';
	return 'home';
}

function setActiveView(viewName) {
	const views = document.querySelectorAll('[data-view]');
	views.forEach((el) => {
		const isActive = el.getAttribute('data-view') === viewName;
		if (isActive) el.removeAttribute('hidden');
		else el.setAttribute('hidden', '');
	});

	const projectsBtn = document.querySelector('[data-nav="projects"]');
	if (projectsBtn) {
		if (viewName === 'projects') projectsBtn.setAttribute('aria-current', 'page');
		else projectsBtn.removeAttribute('aria-current');
	}
}

function initSpaNavigation() {
	const homeBtn = document.querySelector('[data-nav="home"]');
	if (homeBtn) {
		homeBtn.addEventListener('click', () => {
			if (normalizeRouteFromLocation() === 'home') {
				setActiveView('home');
				return;
			}
			window.location.hash = '';
			setActiveView('home');
		});
	}

	const projectsBtn = document.querySelector('[data-nav="projects"]');
	if (projectsBtn) {
		projectsBtn.addEventListener('click', () => {
			if (normalizeRouteFromLocation() === 'projects') return;
			window.location.hash = '#projects';
		});
	}

	window.addEventListener('hashchange', () => {
		setActiveView(normalizeRouteFromLocation());
	});

	setActiveView(normalizeRouteFromLocation());
}

export function boot() {
	window.addEventListener('DOMContentLoaded', () => {
		initLayoutMetrics();

		const theme = resolveThemeFromUrl() || resolveThemeFromStorage();
		if (theme === 'light') setTheme('light');
		else if (theme === 'dark') setTheme('dark');
		else if (prefersLightScheme()) setTheme('light');
		else setTheme('dark');

		const particles = new BackgroundParticles();
		initPullSwitch({ particles });
		initSpaNavigation();
	});
}

boot();
