document.documentElement.classList.add('motion-ready');

const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const header = document.querySelector('.site-header');

let savedTheme = null;
try { savedTheme = localStorage.getItem('smd-theme'); } catch (_) {}
if (savedTheme) root.dataset.theme = savedTheme;

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function syncThemeIcon() {
  const icon = themeToggle?.querySelector('svg, i');
  if (!icon) return;
  const next = root.dataset.theme === 'dark' ? 'sun' : 'moon';
  icon.outerHTML = `<i data-lucide="${next}"></i>`;
  refreshIcons();
}

themeToggle?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('smd-theme', root.dataset.theme); } catch (_) {}
  syncThemeIcon();
});

menuToggle?.addEventListener('click', () => {
  const open = mobileNav?.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
});

mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 18);
}, { passive: true });

// Calm entrance motion. Content remains visible if JavaScript or observers fail.
document.querySelectorAll('[data-delay]').forEach(el => {
  el.style.setProperty('--delay', `${el.dataset.delay}ms`);
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -28px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
}

// CV modal
const cvModal = document.getElementById('cvModal');
document.querySelectorAll('[data-open-cv]').forEach(btn => {
  btn.addEventListener('click', () => cvModal?.showModal());
});
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('dialog')?.close());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
});

// Self-running simulated journey map. It loops without depending on page scroll.
const journeyMap = document.getElementById('journeyMap');
const journeyStops = [...document.querySelectorAll('#journeyMap .sim-stop')];
const activePlace = document.getElementById('activePlace');
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
let journeyIndex = 0;
let journeyTimer = null;

function setJourneyStop(index) {
  if (!journeyMap || !journeyStops.length) return;
  journeyIndex = (index + journeyStops.length) % journeyStops.length;
  const target = journeyStops[journeyIndex];
  journeyStops.forEach((stop, i) => {
    const active = i === journeyIndex;
    stop.classList.toggle('is-active', active);
    stop.setAttribute('aria-pressed', String(active));
  });
  journeyMap.dataset.activeRegion = target.dataset.region || '';
  if (activePlace) activePlace.textContent = target.dataset.place || target.textContent.trim();
}

function restartJourneyLoop() {
  if (reducedMotion || !journeyStops.length) return;
  window.clearInterval(journeyTimer);
  journeyTimer = window.setInterval(() => setJourneyStop(journeyIndex + 1), 3000);
}

if (journeyStops.length) {
  setJourneyStop(0);
  journeyStops.forEach((stop, index) => {
    stop.addEventListener('click', () => {
      setJourneyStop(index);
      restartJourneyLoop();
    });
  });
  restartJourneyLoop();
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

refreshIcons();
syncThemeIcon();

// Gallery filters. Grouped collages remain intact as single gallery entries.
const galleryFilterButtons = [...document.querySelectorAll('[data-gallery-filter]')];
const galleryItems = [...document.querySelectorAll('#galleryGrid .gallery-item[data-category]')];

galleryFilterButtons.forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
  button.addEventListener('click', () => {
    const filter = button.dataset.galleryFilter || 'all';
    galleryFilterButtons.forEach(other => {
      const active = other === button;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    galleryItems.forEach(item => {
      item.hidden = filter !== 'all' && item.dataset.category !== filter;
    });
  });
});
