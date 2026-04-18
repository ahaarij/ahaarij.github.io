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

function setMetaContent(selector, content) {
	const el = document.head.querySelector(selector);
	if (!el) return;
	if (content) el.setAttribute('content', content);
}

function setCanonicalHref(href) {
	let link = document.head.querySelector('link[rel="canonical"]');
	if (!link) {
		link = document.createElement('link');
		link.setAttribute('rel', 'canonical');
		document.head.appendChild(link);
	}
	link.setAttribute('href', href);
}

function absolutizeUrl(url) {
	try {
		return new URL(url, window.location.href).toString();
	} catch {
		return url;
	}
}

function setSeoForView(viewName) {
	const baseUrl = `${window.location.origin}${window.location.pathname}`;
	const pageUrl = viewName === 'projects' ? `${baseUrl}#projects` : baseUrl;
	const imageUrl = absolutizeUrl('images/DSC_0563.JPG');

	const title = viewName === 'projects' ? 'Ahmed Aarij — Projects' : 'Ahmed Aarij — Portfolio';
	const description =
		viewName === 'projects'
			? "Projects by Ahmed Aarij: ft_transcendence, CCTV face recognition pipeline, Wildfire Tracker, and ft_irc."
			: "Ahmed Aarij's software portfolio featuring projects in TypeScript, Python, and C++ including ft_transcendence, a CCTV face recognition pipeline, a Wildfire Tracker, and ft_irc.";

	document.title = title;
	setMetaContent('meta[name="description"]', description);

	setCanonicalHref(baseUrl);

	setMetaContent('meta[property="og:title"]', title);
	setMetaContent('meta[property="og:description"]', description);
	setMetaContent('meta[property="og:url"]', pageUrl);
	setMetaContent('meta[property="og:image"]', imageUrl);

	setMetaContent('meta[name="twitter:title"]', title);
	setMetaContent('meta[name="twitter:description"]', description);
	setMetaContent('meta[name="twitter:image"]', imageUrl);
}

function setActiveView(viewName) {
	const views = document.querySelectorAll('[data-view]');
	views.forEach((el) => {
		const isActive = el.getAttribute('data-view') === viewName;
		if (isActive) el.removeAttribute('hidden');
		else el.setAttribute('hidden', '');
	});

	setSeoForView(viewName);

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
