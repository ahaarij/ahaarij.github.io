import { prefersLightScheme } from './utils/media.js';
import { resolveThemeFromStorage, resolveThemeFromUrl, setTheme } from './theme/theme.js';
import { BackgroundParticles } from './background/BackgroundParticles.js';
import { initPullSwitch } from './ui/pullSwitch.js';
import { initLayoutMetrics } from './layout/metrics.js';

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
	});
}

boot();
