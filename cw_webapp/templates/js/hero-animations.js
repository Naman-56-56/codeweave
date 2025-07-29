// Hero Animations Integration
// Connects the existing animation logic to animate components on scroll

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

// Hero elements
const heroTitle = document.querySelector('.hero__title');
const heroSubtitle = document.querySelector('.hero__subtitle');
const heroCta = document.querySelector('.hero__cta');
const heroCubes = document.querySelectorAll('.hero__cube');
const heroSpheres = document.querySelectorAll('.hero__sphere');
const heroFloats = document.querySelectorAll('.hero__float');
const textElement = document.querySelector('.text');

// Transition elements
const transitionTitle = document.querySelector('.transition__title');
const transitionSubtitle = document.querySelector('.transition__subtitle');
const transitionCircle = document.querySelector('.transition__circle');
const transitionLine = document.querySelector('.transition__line');
const transitionDots = document.querySelectorAll('.transition__dot');
const transitionStats = document.querySelectorAll('.transition__stat');
const transitionFeatures = document.querySelectorAll('.transition__feature');
const transitionCodeLines = document.querySelectorAll('.transition__code-line');

// Alternate section elements
const alternateSections = document.querySelectorAll('.alternate-section');
const alternateTitles = document.querySelectorAll('.alternate-section__title');
const alternateSubtitles = document.querySelectorAll('.alternate-section__subtitle');
const alternateStats = document.querySelectorAll('.alternate-section__stat');
const alternateFeatures = document.querySelectorAll('.alternate-section__feature');
const alternateCodeLines = document.querySelectorAll('.alternate-section__code-line');

// Inspiration elements
const inspirationTitle = document.querySelector('.inspiration__title');
const inspirationSubtitle = document.querySelector('.inspiration__subtitle');
const inspirationCards = document.querySelectorAll('.inspiration__card');
const inspirationLines = document.querySelectorAll('.inspiration__line');
const inspirationDots = document.querySelectorAll('.inspiration__dot');

// Split text for animation
const splitTitle = heroTitle ? new SplitText(heroTitle, {type: 'chars'}) : null;
const splitSubtitle = heroSubtitle ? new SplitText(heroSubtitle, {type: 'words'}) : null;
const splitTextEl = textElement ? new SplitText(textElement, {type: 'chars'}) : null;
const splitTransitionTitle = transitionTitle ? new SplitText(transitionTitle, {type: 'chars'}) : null;
const splitTransitionSubtitle = transitionSubtitle ? new SplitText(transitionSubtitle, {type: 'words'}) : null;
const splitInspirationTitle = inspirationTitle ? new SplitText(inspirationTitle, {type: 'chars'}) : null;
const splitInspirationSubtitle = inspirationSubtitle ? new SplitText(inspirationSubtitle, {type: 'words'}) : null;

// Split text for alternate sections
const splitAlternateTitles = alternateTitles.map(title => new SplitText(title, {type: 'chars'}));
const splitAlternateSubtitles = alternateSubtitles.map(subtitle => new SplitText(subtitle, {type: 'words'}));

// Hero entrance animation
const animateHero = () => {
  if (!heroTitle) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top 80%',
      end: 'center center',
      scrub: false,
      toggleActions: "play none none reverse"
    }
  })
  .from(splitTitle.chars, {
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
  .from(splitSubtitle.words, {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.1,
    ease: "power2.out"
  }, '-=0.5')
  .from(heroCta, {
    duration: 0.8,
    y: 30,
    opacity: 0,
    scale: 0.8,
    ease: "back.out(1.7)"
  }, '-=0.3')
  .from(heroCubes, {
    duration: 1.5,
    y: 80,
    opacity: 0,
    rotationY: 180,
    stagger: 0.1,
    ease: "back.out(1.7)"
  }, '-=0.8')
  .from(heroSpheres, {
    duration: 1.2,
    y: 60,
    opacity: 0,
    scale: 0,
    stagger: 0.15,
    ease: "back.out(1.7)"
  }, '-=1')
  .from(heroFloats, {
    duration: 1,
    y: 40,
    opacity: 0,
    stagger: 0.1,
    ease: "power2.out"
  }, '-=0.8');
};

// Continuous 3D animation
const animate3DElements = () => {
  // Rotate cubes continuously
  gsap.to(heroCubes, {
    duration: 20,
    rotationY: "+=360",
    ease: "none",
    repeat: -1
  });

  // Float spheres
  gsap.to(heroSpheres, {
    duration: 3,
    y: -20,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1
  });

  // Pulse floats
  gsap.to(heroFloats, {
    duration: 2,
    scale: 1.2,
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1,
    stagger: 0.5
  });
};

// Transition section animation
const animateTransition = () => {
  if (!transitionTitle) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: '.transition',
      start: 'top 80%',
      end: 'center center',
      scrub: false,
      toggleActions: "play none none reverse"
    }
  })
  .from(splitTransitionTitle.chars, {
    duration: 1.5,
    y: 120,
    opacity: 0,
    rotationX: -30,
    stagger: 0.04,
    ease: "back.out(1.7)"
  })
  .from(splitTransitionSubtitle.words, {
    duration: 1.2,
    y: 60,
    opacity: 0,
    scale: 0.8,
    stagger: 0.12,
    ease: "power2.out"
  }, '-=0.6')
  .from(transitionCircle, {
    duration: 1.8,
    y: 100,
    opacity: 0,
    scale: 0,
    rotation: 360,
    ease: "back.out(1.7)"
  }, '-=0.8')
  .from(transitionLine, {
    duration: 1.2,
    y: 80,
    opacity: 0,
    scaleY: 0,
    rotationZ: 90,
    ease: "power2.out"
  }, '-=0.6')
  .from(transitionDots, {
    duration: 1.4,
    y: 90,
    opacity: 0,
    scale: 0,
    rotation: 180,
    stagger: 0.15,
    ease: "back.out(1.7)"
  }, '-=0.4')
  .from(transitionStats, {
    duration: 1.1,
    y: 50,
    opacity: 0,
    scale: 0.9,
    stagger: 0.12,
    ease: "power2.out"
  }, '-=0.3')
  .from(transitionFeatures, {
    duration: 1.3,
    y: 70,
    opacity: 0,
    scale: 0.7,
    rotationY: 15,
    stagger: 0.1,
    ease: "back.out(1.7)"
  }, '-=0.2')
  .from(transitionCodeLines, {
    duration: 1.2,
    x: -120,
    opacity: 0,
    scale: 0.8,
    stagger: 0.15,
    ease: "power2.out"
  }, '-=0.4');
};

// Alternate sections animation
const animateAlternateSections = () => {
  alternateSections.forEach((section, index) => {
    const title = splitAlternateTitles[index];
    const subtitle = splitAlternateSubtitles[index];
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
const animateInspiration = () => {
  if (!inspirationTitle) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: '.inspiration',
      start: 'top 80%',
      end: 'center center',
      scrub: false,
    }
  })
  .from(splitInspirationTitle.chars, {
    duration: 2.0,
    y: 150,
    opacity: 0,
    rotationX: -60,
    scale: 0.8,
    stagger: 0.06,
    ease: "back.out(1.7)"
  })
  .from(splitInspirationSubtitle.words, {
    duration: 1.7,
    y: 90,
    opacity: 0,
    scale: 0.7,
    stagger: 0.15,
    ease: "power2.out"
  }, '-=1.0')
  .from(inspirationCards, {
    duration: 1.5,
    y: 140,
    opacity: 0,
    scale: 0.5,
    rotationY: 25,
    stagger: 0.3,
    ease: "back.out(1.7)"
  }, '-=0.7')
  .from(inspirationLines, {
    duration: 3.0,
    scaleX: 0,
    opacity: 0,
    rotationZ: 90,
    stagger: 0.5,
    ease: "power2.out"
  }, '-=1.5')
  .from(inspirationDots, {
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
const animateTextElement = () => {
  if (!textElement) return;
  
  gsap.timeline({
    scrollTrigger: {
      trigger: textElement,
      start: 'top bottom',
      end: 'center center-=25%',
      scrub: true,
    }
  })
  .from(splitTextEl.chars, {
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

// Initialize animations
const init = () => {
  animateHero();
  animate3DElements();
  animateHeroParallax();
  animateTransition();
  animateAlternateSections();
  animateInspiration();
  animateStatistics();
  animateTextElement();
  addEnhancedAnimations();
};

// Preload images and initialize
preloadImages('.grid__item-img, .hero__cube, .hero__sphere, .hero__float').then(() => {
  document.body.classList.remove('loading');
  init();
  window.scrollTo(0, 0);
}); 