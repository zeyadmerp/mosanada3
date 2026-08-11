/**
 * Mosanada — Main application script
 * Handles: language switching, navigation, scroll effects, reveal animations, counters
 */
(function () {
  'use strict';

  const sites = [...document.querySelectorAll('.site')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Format numbers with locale separators */
  const formatNumber = (n) => n.toLocaleString('en-US');

  /** Get currently visible language site */
  function getActiveSite() {
    return document.querySelector('.site:not([hidden])') || sites[0] || null;
  }

  /** Open / close mobile menu */
  function setMenuOpen(open) {
    const site = getActiveSite();
    const burger = site?.querySelector('.burger');
    const mnav = site?.querySelector('.mnav');

    document.body.classList.toggle('menu-open', open);

    if (burger) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (mnav) {
      mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    if (open) {
      const firstLink = mnav?.querySelector('.mnav__links a');
      if (firstLink && window.innerWidth <= 1180) {
        setTimeout(() => mnav.querySelector('.mnav__close')?.focus(), 120);
      }
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleMenu() {
    setMenuOpen(!document.body.classList.contains('menu-open'));
  }

  /** Highlight active section in mobile nav */
  function updateActiveNavLink(site) {
    if (!site) return;

    const links = site.querySelectorAll('.mnav__links a[href^="#"]');
    if (!links.length) return;

    const scrollPos = window.scrollY + 120;
    let currentId = links[0].getAttribute('href').slice(1);

    links.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (section && section.offsetTop <= scrollPos) {
        currentId = id;
      }
    });

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  /** Animate a counter element to its target value */
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';

    const target = parseFloat(el.dataset.count) || 0;
    const prefix = el.dataset.pre || '';
    const suffix = el.dataset.suf || '';

    if (prefersReducedMotion) {
      el.textContent = prefix + formatNumber(target) + suffix;
      return;
    }

    let startTime = null;
    const duration = 1500;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + formatNumber(Math.round(target * eased)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /** Intersection-based reveal for scroll animations */
  function initReveal(root) {
    const targets = root.querySelectorAll('.rv, .tech, .stats__grid');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => {
        el.classList.add('is-in');
        el.querySelectorAll('.num').forEach(animateCounter);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          entry.target.querySelectorAll('.num').forEach(animateCounter);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /** Initialize per-language site instance */
  function initSite(site) {
    if (site.dataset.ready) return;
    site.dataset.ready = '1';

    const burger = site.querySelector('.burger');
    const mobileNavLinks = site.querySelectorAll('.mnav__links a[href^="#"]');
    const mnav = site.querySelector('.mnav');

    if (mnav) {
      mnav.setAttribute('aria-hidden', 'true');
    }

    if (burger) {
      burger.addEventListener('click', toggleMenu);
    }

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    initReveal(site);
    updateActiveNavLink(site);
  }

  /** Sticky header + active nav on scroll */
  function onScroll() {
    sites.forEach((site) => {
      const header = site.querySelector('.hdr');
      if (header) header.classList.toggle('is-stuck', window.scrollY > 24);
    });

    updateActiveNavLink(getActiveSite());
  }

  /** Show one language site, hide others */
  function showLanguage(lang) {
    let activeSite = null;

    sites.forEach((site) => {
      const isActive = site.dataset.lang === lang;
      site.hidden = !isActive;
      if (isActive) activeSite = site;
    });

    if (!activeSite) return;

    closeMenu();

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = activeSite.dataset.title;

    initSite(activeSite);
    onScroll();

    if (window.__cartRender) window.__cartRender();

    try {
      localStorage.setItem('mosanada-lang', lang);
    } catch (_) {
      /* localStorage unavailable */
    }
  }

  /** Global click handlers */
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-close]')) {
      closeMenu();
      return;
    }

    const switchBtn = e.target.closest('[data-switch]');
    if (switchBtn) {
      e.preventDefault();
      const scrollY = window.scrollY;
      showLanguage(switchBtn.getAttribute('data-switch'));
      window.scrollTo(0, Math.min(scrollY, document.body.scrollHeight));
      return;
    }

    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const id = anchor.getAttribute('href');
    if (id.length < 2) return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const headerOffset = window.innerWidth > 680 ? 82 : 70;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /** Close mobile menu on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !document.body.classList.contains('menu-open')) return;
    closeMenu();
    const burger = getActiveSite()?.querySelector('.burger');
    if (burger) burger.focus();
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1180 && document.body.classList.contains('menu-open')) {
      closeMenu();
    }
  });

  /* Restore saved language preference */
  let savedLang = null;
  try {
    savedLang = localStorage.getItem('mosanada-lang');
  } catch (_) {
    /* localStorage unavailable */
  }

  showLanguage(savedLang === 'en' ? 'en' : 'ar');
})();
