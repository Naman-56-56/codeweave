// Additional scroll animations for text elements
// This file contains enhanced scroll animations for various text elements

// Function to create a typewriter effect for text
const createTypewriterEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    speed = 0.05,
    delay = 0,
    ease = 'power2.out'
  } = options;
  
  const splitText = new SplitText(element, { type: 'chars' });
  
  gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .from(splitText.chars, {
    autoAlpha: 0,
    yPercent: 100,
    stagger: {
      each: speed,
      from: 'start'
    },
    ease: ease,
    delay: delay
  });
};

// Function to create a reveal effect for text
const createRevealEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    direction = 'left',
    distance = 100,
    stagger = 0.02,
    ease = 'power2.out'
  } = options;
  
  const splitText = new SplitText(element, { type: 'chars' });
  
  let xPercent = 0;
  let yPercent = 0;
  
  switch (direction) {
    case 'left':
      xPercent = -distance;
      break;
    case 'right':
      xPercent = distance;
      break;
    case 'up':
      yPercent = -distance;
      break;
    case 'down':
      yPercent = distance;
      break;
  }
  
  gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .from(splitText.chars, {
    xPercent: xPercent,
    yPercent: yPercent,
    autoAlpha: 0,
    stagger: {
      each: stagger,
      from: 'start'
    },
    ease: ease
  });
};

// Function to create a 3D flip effect for text
const create3DFlipEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    rotation = 90,
    stagger = 0.03,
    ease = 'power2.out'
  } = options;
  
  const splitText = new SplitText(element, { type: 'chars' });
  
  gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .from(splitText.chars, {
    rotationX: rotation,
    autoAlpha: 0,
    stagger: {
      each: stagger,
      from: 'start'
    },
    ease: ease
  });
};

// Function to create a wave effect for text
const createWaveEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    amplitude = 50,
    frequency = 0.1,
    stagger = 0.02,
    ease = 'power2.out'
  } = options;
  
  const splitText = new SplitText(element, { type: 'chars' });
  
  gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .from(splitText.chars, {
    yPercent: (index) => Math.sin(index * frequency) * amplitude,
    autoAlpha: 0,
    stagger: {
      each: stagger,
      from: 'start'
    },
    ease: ease
  });
};

// Function to create a magnetic effect for text
const createMagneticEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    strength = 0.3,
    stagger = 0.01,
    ease = 'power2.out'
  } = options;
  
  const splitText = new SplitText(element, { type: 'chars' });
  
  gsap.timeline({
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'center center',
      scrub: true,
    }
  })
  .from(splitText.chars, {
    scale: 0,
    autoAlpha: 0,
    stagger: {
      each: stagger,
      from: 'center'
    },
    ease: ease
  })
  .to(splitText.chars, {
    scale: 1 + strength,
    stagger: {
      each: stagger,
      from: 'center'
    },
    ease: ease,
    yoyo: true,
    repeat: 1
  }, '+=0.2');
};

// Export all animation functions
export {
  createTypewriterEffect,
  createRevealEffect,
  create3DFlipEffect,
  createWaveEffect,
  createMagneticEffect
}; 