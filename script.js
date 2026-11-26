const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
document.documentElement.classList.add('motion-ready');

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.focus();
  }
});

const products = [...document.querySelectorAll('.product-card')];
let productIndex = 0;
const updateProducts = (direction) => {
  productIndex = (productIndex + direction + products.length) % products.length;
  products.forEach((product, index) => {
    product.style.order = (index - productIndex + products.length) % products.length;
  });
};
document.querySelector('.slider-next')?.addEventListener('click', () => updateProducts(1));
document.querySelector('.slider-prev')?.addEventListener('click', () => updateProducts(-1));

const revealElements = [...document.querySelectorAll('.reveal')];
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('visible'));
} else {
  const initialReveals = revealElements.filter((element) => element.matches('.hero-copy, .hero-art'));
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      initialReveals.forEach((element) => element.classList.add('visible'));
    });
  });

  const staggeredGroups = new Set(['feature-row', 'timeline', 'product-slider', 'gallery-grid']);
  const revealOrder = new Map();

  revealElements.forEach((element) => {
    const group = element.parentElement;
    if (!staggeredGroups.has(group.classList[0])) return;

    const order = revealOrder.get(group) || 0;
    element.style.setProperty('--reveal-delay', `${Math.min(order * 90, 360)}ms`);
    revealOrder.set(group, order + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  revealElements
    .filter((element) => !initialReveals.includes(element))
    .forEach((element) => observer.observe(element));
}

if (supportsHover && !prefersReducedMotion) {
  const heroArt = document.querySelector('.hero-art');
  let scrollFrame = 0;

  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      const offset = Math.min(window.scrollY * 0.035, 22);
      heroArt?.style.setProperty('--scroll-shift', `${-offset}px`);
      scrollFrame = 0;
    });
  }, { passive: true });
}

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCloseButton = document.querySelector('.lightbox-close');
let previouslyFocusedElement = null;
const closeLightbox = () => {
  lightbox.classList.remove('open');
  lightboxImage.src = '';
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  previouslyFocusedElement?.focus();
};
document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    previouslyFocusedElement = document.activeElement;
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector('img').alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxCloseButton.focus();
  });
});
lightboxCloseButton.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

if (supportsHover && !prefersReducedMotion) {
  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.1;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.1;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });
}
