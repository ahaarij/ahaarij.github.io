const PROJECT_GALLERIES = {
	transcendence: {
		title: 'ft_transcendence',
		images: [],
	},
	recognaize: {
		title: 'RecognAIze',
		images: [],
	},
	wildfire: {
		title: 'Wildfire-Tracker',
		images: [],
	},
	ft_irc: {
		title: 'ft_irc',
		images: [],
	},
};

function normalizeGalleryImages(images) {
	if (!Array.isArray(images)) return [];
	return images
		.map((img) => {
			if (!img || typeof img !== 'object') return null;
			const src = typeof img.src === 'string' ? img.src.trim() : '';
			if (!src) return null;
			return {
				src,
				alt: typeof img.alt === 'string' ? img.alt : '',
			};
		})
		.filter(Boolean);
}

export function initProjectGallery() {
	const dialog = document.getElementById('project-gallery');
	const titleEl = document.getElementById('project-gallery-title');
	const contentEl = document.getElementById('project-gallery-content');
	if (!dialog || !titleEl || !contentEl) return;

	const buttons = document.querySelectorAll('[data-gallery]');
	if (!buttons.length) return;

	const setEmpty = (msg) => {
		contentEl.innerHTML = '';
		const p = document.createElement('p');
		p.className = 'project-gallery__empty';
		p.textContent = msg;
		contentEl.appendChild(p);
	};

	const closeDialog = () => {
		if (typeof dialog.close === 'function') dialog.close();
		else dialog.removeAttribute('open');
	};

	const openGallery = (projectId) => {
		const gallery = PROJECT_GALLERIES[projectId];
		if (!gallery) return;

		titleEl.textContent = gallery.title ? `${gallery.title} — images` : 'Project images';
		contentEl.innerHTML = '';

		const images = normalizeGalleryImages(gallery.images);
		if (!images.length) {
			setEmpty('No images added for this project yet.');
		} else {
			images.forEach(({ src, alt }) => {
				const img = document.createElement('img');
				img.loading = 'lazy';
				img.decoding = 'async';
				img.referrerPolicy = 'no-referrer';
				img.alt = alt;
				img.src = src;
				img.addEventListener('error', () => {
					img.remove();
					if (!contentEl.querySelector('img')) setEmpty('Could not load any images for this project.');
				});
				contentEl.appendChild(img);
			});
		}

		if (typeof dialog.showModal === 'function') dialog.showModal();
		else dialog.setAttribute('open', '');
	};

	buttons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const projectId = btn.getAttribute('data-gallery');
			if (!projectId) return;
			openGallery(projectId);
		});
	});

	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) closeDialog();
	});
}
