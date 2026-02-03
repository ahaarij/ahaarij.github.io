(function () {
  const VIEWS = ['home', 'projects', 'hackathons'];

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function setActiveView(viewName) {
    $all('.view').forEach((view) => {
      view.style.display = 'none';
      view.setAttribute('aria-hidden', 'true');
    });

    const target = document.getElementById(`view-${viewName}`);
    if (!target) return;

    target.style.display = 'block';
    target.setAttribute('aria-hidden', 'false');

    // Reset scroll for non-home views.
    if (viewName !== 'home') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }

  function sectionToView(id) {
    const map = {
      header: 'home',
      about: 'home',
      portfolio: 'home',
      contact: 'home',
    };
    return map[id] || (VIEWS.includes(id) ? id : 'home');
  }

  // Expose for legacy onclicks and deep links.
  window.navigateTo = function navigateTo(id, updateHistory = true) {
    const viewName = sectionToView(id);
    setActiveView(viewName);

    // Scroll to section for home sections.
    if (viewName === 'home' && ['header', 'about', 'portfolio', 'contact'].includes(id)) {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (updateHistory) {
      history.pushState(null, '', `#${id || 'home'}`);
    }

    closemenu();
  };

  // Tabs (About)
  window.opentab = function opentab(tabId, triggerEl) {
    const tabLinks = $all('.tab-links');
    const tabContents = $all('.tab-contents');

    tabLinks.forEach((el) => el.classList.remove('active-link'));
    tabContents.forEach((el) => el.classList.remove('active-tab'));

    if (triggerEl) triggerEl.classList.add('active-link');
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active-tab');
  };

  // Mobile menu
  const sidemenu = () => document.getElementById('sidemenu');

  window.openmenu = function openmenu() {
    const menu = sidemenu();
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    const toggle = $('.nav__toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  };

  window.closemenu = function closemenu() {
    const menu = sidemenu();
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    const toggle = $('.nav__toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  };

  // Scroll reveal
  function initReveal() {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      $all('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    $all('[data-reveal]').forEach((el) => observer.observe(el));
  }

  // Terminal typing
  function initTerminal() {
    const term = $('#mini-terminal');
    if (!term) return;

    const lines = [
      { prompt: 'ahmed@portfolio', cmd: 'whoami', out: 'Software developer · 42 Abu Dhabi' },
      { prompt: 'ahmed@portfolio', cmd: 'focus', out: 'Low-level systems, graphics, and clean UI' },
      { prompt: 'ahmed@portfolio', cmd: 'status', out: 'Open to internships / junior roles' },
    ];

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderLine = (line) => {
      const row = document.createElement('div');
      row.className = 'terminal__row';
      row.innerHTML = `
        <span class="terminal__prompt">${line.prompt}</span>
        <span class="terminal__sep">:</span>
        <span class="terminal__path">~</span>
        <span class="terminal__dollar">$</span>
        <span class="terminal__cmd">${line.cmd}</span>
      `;
      const out = document.createElement('div');
      out.className = 'terminal__out';
      out.textContent = line.out;
      term.appendChild(row);
      term.appendChild(out);
    };

    if (prefersReduced) {
      lines.forEach(renderLine);
      return;
    }

    let i = 0;
    const tick = () => {
      if (i >= lines.length) return;
      renderLine(lines[i]);
      i += 1;
      setTimeout(tick, 650);
    };

    setTimeout(tick, 400);
  }

  // Contact form (Google Apps Script)
  function initContactForm() {
    const scriptURL =
        'https://script.google.com/macros/s/AKfycbxsfPRkScFuGkeosQS9Wn3E4ReujHSKh0OvKHesxxsxaaun0LvgnHS5rYkSa1IN6iA/exec';

    const form = document.forms['submit-to-google-sheet'];
    const msg = document.getElementById('msg');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const defaultBtnText = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (msg) msg.textContent = 'Sending…';

      try {
        const body = new URLSearchParams(new FormData(form));
        await fetch(scriptURL, {
          method: 'POST',
          body,
          mode: 'no-cors',
        });

        form.reset();
        if (msg) msg.textContent = 'Message sent. If you don’t hear back, email me at ahmedaarij05@gmail.com.';
        setTimeout(() => {
          if (msg) msg.textContent = '';
        }, 7000);
      } catch (error) {
        console.error('Error!', error);
        if (msg) msg.textContent = 'Couldn’t send. Please email me at ahmedaarij05@gmail.com.';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultBtnText;
        }
      }
    });
  }

  function initNavBindings() {
    $all('[data-nav]').forEach((a) => {
      a.addEventListener('click', () => closemenu());
    });

    $all('[data-view]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.getAttribute('data-view');
        if (!view) return;
        window.navigateTo(view);
      });
    });

    const toggle = $('.nav__toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const menu = sidemenu();
        if (!menu) return;
        menu.classList.contains('is-open') ? closemenu() : openmenu();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closemenu();
    });
  }

  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    window.navigateTo(hash, false);
  });

  window.addEventListener('DOMContentLoaded', () => {
    initNavBindings();
    initReveal();
    initTerminal();
    initContactForm();

    const hash = window.location.hash.replace('#', '') || 'home';
    window.navigateTo(hash, false);

    closemenu();

    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
