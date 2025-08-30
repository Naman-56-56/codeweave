import anime from 'animejs/lib/anime.es.js';

// Utility to split text into spans for character animation
const splitText = (element) => {
  if (!element) return [];
  const text = element.textContent;
  element.innerHTML = '';
  return Array.from(text).map(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    element.appendChild(span);
    return span;
  });
};

// Simple scroll trigger for elements
const onScrollTrigger = (element, callback, offset = 0) => {
  const handler = () => {
    const rect = element.getBoundingClientRect();
    if (rect.top <= window.innerHeight - offset && rect.bottom >= offset) {
      callback();
    }
  };
  window.addEventListener('scroll', handler);
  window.addEventListener('resize', handler);
  handler();
};

// Typewriter effect
const createTypewriterEffect = (element, options = {}) => {
  if (!element) return;
  const { speed = 50, delay = 0, easing = 'easeOutQuad' } = options;
  const chars = splitText(element);
  anime.set(chars, { opacity: 0, translateY: '100%' });
  onScrollTrigger(element, () => {
    anime({
      targets: chars,
      opacity: 1,
      translateY: 0,
      delay: anime.stagger(speed, { start: delay }),
      duration: 600,
      easing
    });
  });
};

// Reveal effect
const createRevealEffect = (element, options = {}) => {
  if (!element) return;
  const { direction = 'left', distance = 100, stagger = 20, easing = 'easeOutQuad' } = options;
  const chars = splitText(element);
  let translateX = 0, translateY = 0;
  if (direction === 'left') translateX = -distance;
  if (direction === 'right') translateX = distance;
  if (direction === 'up') translateY = -distance;
  if (direction === 'down') translateY = distance;
  anime.set(chars, { opacity: 0, translateX, translateY });
  onScrollTrigger(element, () => {
    anime({
      targets: chars,
      opacity: 1,
      translateX: 0,
      translateY: 0,
      delay: anime.stagger(stagger),
      duration: 600,
      easing
    });
  });
};

// 3D flip effect
const create3DFlipEffect = (element, options = {}) => {
  if (!element) return;
  const { rotation = 90, stagger = 30, easing = 'easeOutQuad' } = options;
  const chars = splitText(element);
  anime.set(chars, { opacity: 0, rotateX: rotation });
  onScrollTrigger(element, () => {
    anime({
      targets: chars,
      opacity: 1,
      rotateX: 0,
      delay: anime.stagger(stagger),
      duration: 600,
      easing
    });
  });
};

// Wave effect
const createWaveEffect = (element, options = {}) => {
  if (!element) return;
  const { amplitude = 50, frequency = 0.2, stagger = 20, easing = 'easeOutQuad' } = options;
  const chars = splitText(element);
  anime.set(chars, {
    opacity: 0,
    translateY: (el, i) => Math.sin(i * frequency) * amplitude
  });
  onScrollTrigger(element, () => {
    anime({
      targets: chars,
      opacity: 1,
      translateY: 0,
      delay: anime.stagger(stagger),
      duration: 600,
      easing
    });
  });
};

// Magnetic effect
const createMagneticEffect = (element, options = {}) => {
  if (!element) return;
  const { strength = 0.3, stagger = 10, easing = 'easeOutQuad' } = options;
  const chars = splitText(element);
  anime.set(chars, { opacity: 0, scale: 0 });
  onScrollTrigger(element, () => {
    anime({
      targets: chars,
      opacity: 1,
      scale: 1 + strength,
      delay: anime.stagger(stagger, { from: 'center' }),
      duration: 600,
      easing,
      direction: 'alternate'
    });
  });
};

// Scroll effect for feature images (scale, fade-in, parallax)
const createFeatureImageScrollEffect = (imageSelector = '.feature__img', options = {}) => {
  const images = document.querySelectorAll(imageSelector);
  images.forEach(img => {
    // Set initial state
    anime.set(img, {
      opacity: 0,
      scale: 0.8,
      translateY: 60
    });

    // Parallax and fade/scale on scroll
    const handler = () => {
      const rect = img.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= windowHeight - 60 && rect.bottom >= 0) {
        const progress = Math.min(1, Math.max(0, 1 - (rect.top / windowHeight)));
        anime({
          targets: img,
          opacity: progress,
          scale: 0.8 + 0.2 * progress,
          translateY: 60 - 60 * progress,
          duration: 0,
          easing: 'linear'
        });
      }
    };
    window.addEventListener('scroll', handler);
    window.addEventListener('resize', handler);
    handler();
  });
};

export {
  createTypewriterEffect,
  createRevealEffect,
  create3DFlipEffect,
  createWaveEffect,
  createMagneticEffect,
  createFeatureImageScrollEffect
};