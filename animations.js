/* =============================================================
   ANIMATIONS.JS — Shared Animation Engine
   =============================================================
   Handles:
   1. Intersection Observer scroll-reveal (staggered)
   2. Toast notification system
   3. Image modal (gallery lightbox)
   4. Mobile nav toggle
   5. Navbar scroll-state
   6. Card parallax tilt micro-interaction
   7. Poster dynamic glow
   ============================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initScrollReveal();
    initToastSystem();
    initImageModal();
    initMobileNav();
    initNavbarScroll();
    initCardTilt();
    initPosterGlow();
    initGalleryTilt();
  }

  /* ==========================================================
     1. SCROLL REVEAL — Intersection Observer + Stagger
     ========================================================== */
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.game-card, .reveal, .info-card, .member-card'
    );

    if (!targets.length || !('IntersectionObserver' in window)) {
      // Fallback: make everything visible
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -30px 0px'
    });

    // Apply stagger delay to sibling groups
    const groups = {};
    targets.forEach(el => {
      const parent = el.parentElement;
      if (!parent) return;

      const key = parent.className || 'default';
      if (!groups[key]) groups[key] = [];
      groups[key].push(el);
    });

    Object.values(groups).forEach(group => {
      group.forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.08}s`;
        observer.observe(el);
      });
    });
  }

  /* ==========================================================
     2. TOAST NOTIFICATION SYSTEM
     ========================================================== */
  let toastContainer = null;

  function getToastContainer() {
    if (toastContainer) return toastContainer;

    toastContainer = document.createElement('div');
    toastContainer.className = 'toast';
    toastContainer.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showToast(message, type = 'success') {
    const container = getToastContainer();
    const item = document.createElement('div');
    item.className = 'toast__item';

    const icons = { success: '✅', cart: '🛒', info: 'ℹ️' };
    if (type === 'info' || type === 'success') {
      item.classList.add('toast__item--cyan');
    }

    item.innerHTML = `<span class="toast__icon">${icons[type] || '🎮'}</span> ${message}`;
    container.appendChild(item);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        item.classList.add('toast__item--show');
      });
    });

    // Auto-dismiss
    setTimeout(() => {
      item.classList.remove('toast__item--show');
      setTimeout(() => item.remove(), 400);
    }, 3200);
  }

  // Expose globally
  window.showToast = showToast;

  function initToastSystem() {
    // Pre-create container on page load
    getToastContainer();
  }

  /* ==========================================================
     3. IMAGE MODAL (Gallery Lightbox)
     ========================================================== */
  function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const closeBtn = modal ? modal.querySelector('.modal__close') : null;

    if (!modal || !modalImg) return;

    // Open modal from gallery items
    document.querySelectorAll('.gallery__item[data-modal-src]').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.dataset.modalSrc;
        modalImg.src = src;
        modal.classList.add('modal--open');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close modal
    function closeModal() {
      modal.classList.remove('modal--open');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
        closeModal();
      }
    });
  }

  /* ==========================================================
     4. MOBILE NAV TOGGLE
     ========================================================== */
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('header__nav--open');
      toggle.classList.toggle('header__toggle--open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click (mobile)
    nav.querySelectorAll('.header__link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('header__nav--open');
        toggle.classList.remove('header__toggle--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================================
     5. NAVBAR SCROLL STATE
     ========================================================== */
  function initNavbarScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('header--scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==========================================================
     6. CARD PARALLAX TILT
     ========================================================== */
  function initCardTilt() {
    // Only on non-touch devices
    if ('ontouchstart' in window) return;

    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) scale(1.02) perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================
     7. POSTER DYNAMIC GLOW
     ========================================================== */
  function initPosterGlow() {
    const poster = document.querySelector('.sidebar__poster');
    if (!poster || 'ontouchstart' in window) return;

    poster.addEventListener('mousemove', (e) => {
      const rect = poster.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      poster.style.boxShadow = `
        ${(x - 50) * -0.4}px ${(y - 50) * -0.4}px 40px rgba(255,45,85,.12),
        0 12px 40px rgba(0,0,0,.5)
      `;
    });

    poster.addEventListener('mouseleave', () => {
      poster.style.boxShadow = '';
    });
  }

  /* ==========================================================
     8. GALLERY IMAGE TILT
     ========================================================== */
  function initGalleryTilt() {
    if ('ontouchstart' in window) return;

    document.querySelectorAll('.gallery__item').forEach(item => {
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const img = item.querySelector('img');
        if (img) {
          img.style.transform = `scale(1.1) perspective(400px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        }
      });

      item.addEventListener('mouseleave', () => {
        const img = item.querySelector('img');
        if (img) img.style.transform = '';
      });
    });
  }

})();
