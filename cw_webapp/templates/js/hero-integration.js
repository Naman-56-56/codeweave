// Hero Integration Script
// Connects existing animation logic to animate components on scroll

// Import utility function
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
  });
};

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);

// Animation configuration
const ANIMATION_CONFIG = {
  durations: {
    fast: 0.6,
    normal: 1.2,
    slow: 2.0
  },
  easings: {
    smooth: 'power2.out',
    bouncy: 'back.out(1.7)',
    sine: 'sine'
  },
  staggers: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2
  }
};

// Helper function to determine if element is on left or right side
const isLeftSide = (element) => {
  const elementCenter = element.getBoundingClientRect().left + element.offsetWidth / 2;
  const viewportCenter = window.innerWidth / 2;
  return elementCenter < viewportCenter;
};

// Get all animation elements
const getAnimationElements = () => {
  return {
    // Hero elements
    heroTitle: document.querySelector('.hero__title'),
    heroSubtitle: document.querySelector('.hero__subtitle'),
    heroCta: document.querySelector('.hero__cta'),
    heroCubes: document.querySelectorAll('.hero__cube'),
    heroSpheres: document.querySelectorAll('.hero__sphere'),
    heroFloats: document.querySelectorAll('.hero__float'),
    textElement: document.querySelector('.text'),

    // Transition elements
    transitionTitle: document.querySelector('.transition__title'),
    transitionSubtitle: document.querySelector('.transition__subtitle'),
    transitionCircle: document.querySelector('.transition__circle'),
    transitionLine: document.querySelector('.transition__line'),
    transitionDots: document.querySelectorAll('.transition__dot'),
    transitionStats: document.querySelectorAll('.transition__stat'),
    transitionFeatures: document.querySelectorAll('.transition__feature'),
    transitionCodeLines: document.querySelectorAll('.transition__code-line'),

    // Alternate section elements
    alternateSections: document.querySelectorAll('.alternate-section'),
    alternateTitles: document.querySelectorAll('.alternate-section__title'),
    alternateSubtitles: document.querySelectorAll('.alternate-section__subtitle'),
    alternateStats: document.querySelectorAll('.alternate-section__stat'),
    alternateFeatures: document.querySelectorAll('.alternate-section__feature'),
    alternateCodeLines: document.querySelectorAll('.alternate-section__code-line'),

    // Inspiration elements
    inspirationTitle: document.querySelector('.inspiration__title'),
    inspirationSubtitle: document.querySelector('.inspiration__subtitle'),
    inspirationCards: document.querySelectorAll('.inspiration__card'),
    inspirationLines: document.querySelectorAll('.inspiration__line'),
    inspirationDots: document.querySelectorAll('.inspiration__dot')
  };
};

// Create split text instances
const createSplitTexts = (elements) => {
  const splitTexts = {};
  
  if (elements.heroTitle) {
    splitTexts.heroTitle = new SplitText(elements.heroTitle, {type: 'chars'});
  }
  if (elements.heroSubtitle) {
    splitTexts.heroSubtitle = new SplitText(elements.heroSubtitle, {type: 'words'});
  }
  if (elements.textElement) {
    splitTexts.textElement = new SplitText(elements.textElement, {type: 'chars'});
  }
  if (elements.transitionTitle) {
    splitTexts.transitionTitle = new SplitText(elements.transitionTitle, {type: 'chars'});
  }
  if (elements.transitionSubtitle) {
    splitTexts.transitionSubtitle = new SplitText(elements.transitionSubtitle, {type: 'words'});
  }
  if (elements.inspirationTitle) {
    splitTexts.inspirationTitle = new SplitText(elements.inspirationTitle, {type: 'chars'});
  }
  if (elements.inspirationSubtitle) {
    splitTexts.inspirationSubtitle = new SplitText(elements.inspirationSubtitle, {type: 'words'});
  }

  // Split text for alternate sections
  splitTexts.alternateTitles = elements.alternateTitles.map(title => new SplitText(title, {type: 'chars'}));
  splitTexts.alternateSubtitles = elements.alternateSubtitles.map(subtitle => new SplitText(subtitle, {type: 'words'}));

  return splitTexts;
};

// Hero entrance animation
const animateHero = (elements, splitTexts) => {
  if (!elements.heroTitle) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top 80%',
      end: 'center center',
      scrub: false,
      toggleActions: "play none none reverse"
    }
  })
  .from(splitTexts.heroTitle.chars, {
    duration: 2.0,
    yPercent: 400,
    autoAlpha: 0,
    rotationX: -90,
    ease: 'sine',
    stagger: {
      each: 0.05,
      from: 'center'
    }
  })
  .from(splitTexts.heroSubtitle.words, {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.1,
    ease: "power2.out"
  }, '-=0.5')
  .from(elements.heroCta, {
    duration: 0.8,
    y: 30,
    opacity: 0,
    scale: 0.8,
    ease: "back.out(1.7)"
  }, '-=0.3')
  .from(elements.heroCubes, {
    duration: 1.5,
    y: 80,
    opacity: 0,
    rotationY: 180,
    stagger: 0.1,
    ease: "back.out(1.7)"
  }, '-=0.8')
  .from(elements.heroSpheres, {
    duration: 1.2,
    y: 60,
    opacity: 0,
    scale: 0,
    stagger: 0.15,
    ease: "back.out(1.7)"
  }, '-=1')
  .from(elements.heroFloats, {
    duration: 1,
    y: 40,
    opacity: 0,
    stagger: 0.1,
    ease: "power2.out"
  }, '-=0.8');
};

// Continuous 3D animation
const animate3DElements = (elements) => {
  // Rotate cubes continuously
  gsap.to(elements.heroCubes, {
    duration: 20,
    rotationY: "+=360",
    ease: "none",
    repeat: -1
  });

  // Float spheres
  gsap.to(elements.heroSpheres, {
    duration: 3,
    y: -20,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1
  });

  // Pulse floats
  gsap.to(elements.heroFloats, {
    duration: 2,
    scale: 1.2,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.5
  });
};

// Transition section animation
const animateTransition = (elements, splitTexts) => {
  if (!elements.transitionTitle) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: '.transition',
      start: 'top 80%',
      end: 'center center',
      scrub: false,
      toggleActions: "play none none reverse"
    }
  })
  .from(splitTexts.transitionTitle.chars, {
    duration: 1.5,
    y: 120,
    opacity: 0,
    rotationX: -30,
    stagger: 0.04,
    ease: "back.out(1.7)"
  })
  .from(splitTexts.transitionSubtitle.words, {
    duration: 1.2,
    y: 60,
    opacity: 0,
    scale: 0.8,
    stagger: 0.12,
    ease: "power2.out"
  }, '-=0.6')
  .from(elements.transitionCircle, {
    duration: 1.8,
    y: 100,
    opacity: 0,
    scale: 0,
    rotation: 360,
    ease: "back.out(1.7)"
  }, '-=0.8')
  .from(elements.transitionLine, {
    duration: 1.2,
    y: 80,
    opacity: 0,
    scaleY: 0,
    rotationZ: 90,
    ease: "power2.out"
  }, '-=0.6')
  .from(elements.transitionDots, {
    duration: 1.4,
    y: 90,
    opacity: 0,
    scale: 0,
    rotation: 180,
    stagger: 0.15,
    ease: "back.out(1.7)"
  }, '-=0.4')
  .from(elements.transitionStats, {
    duration: 1.1,
    y: 50,
    opacity: 0,
    scale: 0.9,
    stagger: 0.12,
    ease: "power2.out"
  }, '-=0.3')
  .from(elements.transitionFeatures, {
    duration: 1.3,
    y: 70,
    opacity: 0,
    scale: 0.7,
    rotationY: 15,
    stagger: 0.1,
    ease: "back.out(1.7)"
  }, '-=0.2')
  .from(elements.transitionCodeLines, {
    duration: 1.2,
    x: -120,
    opacity: 0,
    scale: 0.8,
    stagger: 0.15,
    ease: "power2.out"
  }, '-=0.4');
};

// Alternate sections animation
const animateAlternateSections = (elements, splitTexts) => {
  elements.alternateSections.forEach((section, index) => {
    const title = splitTexts.alternateTitles[index];
    const subtitle = splitTexts.alternateSubtitles[index];
    const sectionStats = section.querySelectorAll('.alternate-section__stat');
    const sectionFeatures = section.querySelectorAll('.alternate-section__feature');
    const sectionCodeLines = section.querySelectorAll('.alternate-section__code-line');
    const sectionCircle = section.querySelector('.alternate-section__circle');
    const sectionLine = section.querySelector('.alternate-section__line');
    const sectionDots = section.querySelectorAll('.alternate-section__dot');

    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'center center',
        scrub: false,
        toggleActions: "play none none reverse"
      }
    })
    .from(title.chars, {
      duration: 1.6,
      y: 130,
      opacity: 0,
      rotationX: -25,
      stagger: 0.05,
      ease: "back.out(1.7)"
    })
    .from(subtitle.words, {
      duration: 1.3,
      y: 70,
      opacity: 0,
      scale: 0.8,
      stagger: 0.15,
      ease: "power2.out"
    }, '-=0.7')
    .from(sectionCircle, {
      duration: 2.0,
      y: 110,
      opacity: 0,
      scale: 0,
      rotation: 720,
      ease: "back.out(1.7)"
    }, '-=0.9')
    .from(sectionLine, {
      duration: 1.4,
      y: 90,
      opacity: 0,
      scaleY: 0,
      rotationZ: 45,
      ease: "power2.out"
    }, '-=0.7')
    .from(sectionDots, {
      duration: 1.6,
      y: 100,
      opacity: 0,
      scale: 0,
      rotation: 360,
      stagger: 0.2,
      ease: "back.out(1.7)"
    }, '-=0.5')
    .from(sectionStats, {
      duration: 1.2,
      y: 60,
      opacity: 0,
      scale: 0.9,
      stagger: 0.15,
      ease: "power2.out"
    }, '-=0.4')
    .from(sectionFeatures, {
      duration: 1.5,
      y: 80,
      opacity: 0,
      scale: 0.6,
      rotationY: 20,
      stagger: 0.12,
      ease: "back.out(1.7)"
    }, '-=0.3')
    .from(sectionCodeLines, {
      duration: 1.3,
      x: index % 2 === 0 ? -140 : 140,
      opacity: 0,
      scale: 0.7,
      rotationY: index % 2 === 0 ? -15 : 15,
      stagger: 0.18,
      ease: "power2.out"
    }, '-=0.5');
  });
};

// Inspiration section animation
const animateInspiration = (elements, splitTexts) => {
  if (!elements.inspirationTitle) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: '.inspiration',
      start: 'top 80%',
      end: 'center center',
      scrub: false,
    }
  })
  .from(splitTexts.inspirationTitle.chars, {
    duration: 2.0,
    y: 150,
    opacity: 0,
    rotationX: -60,
    scale: 0.8,
    stagger: 0.06,
    ease: "back.out(1.7)"
  })
  .from(splitTexts.inspirationSubtitle.words, {
    duration: 1.7,
    y: 90,
    opacity: 0,
    scale: 0.7,
    stagger: 0.15,
    ease: "power2.out"
  }, '-=1.0')
  .from(elements.inspirationCards, {
    duration: 1.5,
    y: 140,
    opacity: 0,
    scale: 0.5,
    rotationY: 25,
    stagger: 0.3,
    ease: "back.out(1.7)"
  }, '-=0.7')
  .from(elements.inspirationLines, {
    duration: 3.0,
    scaleX: 0,
    opacity: 0,
    rotationZ: 90,
    stagger: 0.5,
    ease: "power2.out"
  }, '-=1.5')
  .from(elements.inspirationDots, {
    duration: 1.5,
    scale: 0,
    opacity: 0,
    rotation: 360,
    stagger: 0.3,
    ease: "back.out(1.7)"
  }, '-=2.0');
};

// Statistics count-up animation
const animateStatistics = () => {
  const allStats = document.querySelectorAll('.transition__stat, .alternate-section__stat');
  
  allStats.forEach(stat => {
    const numberElement = stat.querySelector('.transition__number, .alternate-section__number');
    if (!numberElement) return;
    
    const finalNumber = numberElement.textContent;
    
    gsap.timeline({
      scrollTrigger: {
        trigger: stat,
        start: 'top 90%',
        end: 'center center',
        scrub: false,
      }
    })
    .from(stat, {
      duration: 1.2,
      y: 50,
      opacity: 0,
      scale: 0.7,
      rotationY: 15,
      ease: "back.out(1.7)"
    })
    .to(numberElement, {
      duration: 2.5,
      textContent: finalNumber,
      roundProps: "textContent",
      ease: "power2.out",
      snap: { textContent: 1 }
    }, '-=0.5');
  });
};

// Text animation
const animateTextElement = (elements, splitTexts) => {
  if (!elements.textElement) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: elements.textElement,
      start: 'top bottom',
      end: 'center center-=25%',
      scrub: true,
    }
  })
  .from(splitTexts.textElement.chars, {
    ease: 'sine',
    yPercent: 400,
    autoAlpha: 0,
    rotationX: -90,
    stagger: {
      each: 0.05,
      from: 'center'
    }
  });
};

// Hero parallax animation
const animateHeroParallax = () => {
  gsap.to('.hero__content', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: -100,
    opacity: 0.8,
    ease: 'none'
  });

  gsap.to('.hero__3d-elements', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: -200,
    rotationY: 15,
    ease: 'none'
  });
};

// Enhanced scroll animations for CODEWEAVE title
const addEnhancedAnimations = () => {
  const titleLetters = document.querySelectorAll('.hero__title span');
  const heroSection = document.querySelector('.hero');
  
  if (!titleLetters.length || !heroSection) return;
  
  const handleScroll = () => {
    const scrollTop = window.pageYOffset;
    const heroHeight = heroSection.offsetHeight;
    const scrollProgress = Math.max(0, Math.min(1, scrollTop / heroHeight));
    
    if (scrollTop <= 10) {
      titleLetters.forEach((letter) => {
        letter.style.transform = 'translateX(0px) translateY(0px) rotateY(0deg) scale(1)';
        letter.style.color = 'var(--color-title)';
        letter.style.textShadow = 'none';
      });
      return;
    }
    
    titleLetters.forEach((letter, index) => {
      const baseSpacing = 0;
      const maxSpacing = 30;
      const spacing = baseSpacing + (scrollProgress * maxSpacing);
      const letterVariation = Math.sin((index / titleLetters.length) * Math.PI) * 10;
      const finalSpacing = spacing + letterVariation;
      const waveOffset = Math.sin(scrollProgress * Math.PI + index * 0.5) * 5;
      
      letter.style.transform = `
        translateX(${finalSpacing + waveOffset}px) 
        translateY(${waveOffset * 0.5}px)
        rotateY(${scrollProgress * 10 * (index - 4)}deg)
        scale(${1 + (scrollProgress * 0.3)})
      `;
      
      const colorIntensity = Math.min(255, 255 - (scrollProgress * 100));
      letter.style.color = `rgb(${colorIntensity}, ${colorIntensity}, ${colorIntensity})`;
      
      const shadowIntensity = scrollProgress * 20;
      letter.style.textShadow = `0 0 ${shadowIntensity}px rgba(239, 93, 54, ${scrollProgress})`;
    });
  };
  
  let ticking = false;
  const throttledHandleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', throttledHandleScroll);
  handleScroll();
};

// Initialize all animations
const initHeroAnimations = () => {
  const elements = getAnimationElements();
  const splitTexts = createSplitTexts(elements);
  
  animateHero(elements, splitTexts);
  animate3DElements(elements);
  animateHeroParallax();
  animateTransition(elements, splitTexts);
  animateAlternateSections(elements, splitTexts);
  animateInspiration(elements, splitTexts);
  animateStatistics();
  animateTextElement(elements, splitTexts);
  addEnhancedAnimations();
};

// Preload images and initialize
preloadImages('.grid__item-img, .hero__cube, .hero__sphere, .hero__float').then(() => {
  document.body.classList.remove('loading');
  initHeroAnimations();
  window.scrollTo(0, 0);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initHeroAnimations,
    preloadImages,
    ANIMATION_CONFIG
  };
} 