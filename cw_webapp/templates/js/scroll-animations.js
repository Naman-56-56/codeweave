// Scroll Animations for CodeWeave Components
// This file connects the existing animation logic to animate components on scroll

import { preloadImages } from './utils.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);

// Animation configuration
const ANIMATION_CONFIG = {
  // Timing configurations
  durations: {
    fast: 0.6,
    normal: 1.2,
    slow: 2.0,
    verySlow: 3.0
  },
  
  // Easing functions
  easings: {
    smooth: 'power2.out',
    bouncy: 'back.out(1.7)',
    elastic: 'elastic.out(1, 0.3)',
    sine: 'sine'
  },
  
  // Stagger configurations
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

// Helper function to create scroll trigger configuration
const createScrollTrigger = (trigger, start = 'top 80%', end = 'center center', scrub = false) => ({
  trigger,
  start,
  end,
  scrub,
  toggleActions: scrub ? undefined : "play none none reverse"
});

// Component Animation Classes
class ComponentAnimator {
  constructor() {
    this.animations = new Map();
    this.initialized = false;
  }

  // Initialize all animations
  init() {
    if (this.initialized) return;
    
    this.animateHeroSection();
    this.animateTransitionSection();
    this.animateAlternateSections();
    this.animateInspirationSection();
    this.animateStatistics();
    this.animateFeatureCards();
    this.animateCodeElements();
    this.animateFloatingElements();
    this.animateTextElements();
    this.animateParallaxElements();
    
    this.initialized = true;
  }

  // Hero Section Animations
  animateHeroSection() {
    const heroTitle = document.querySelector('.hero__title');
    const heroSubtitle = document.querySelector('.hero__subtitle');
    const heroCta = document.querySelector('.hero__cta');
    const hero3DElements = document.querySelectorAll('.hero__cube, .hero__sphere, .hero__float');

    if (!heroTitle) return;

    // Split text for animation
    const splitTitle = new SplitText(heroTitle, { type: 'chars' });
    const splitSubtitle = new SplitText(heroSubtitle, { type: 'words' });

    // Hero entrance animation
    gsap.timeline({
      scrollTrigger: createScrollTrigger('.hero', 'top 80%', 'center center')
    })
    .from(splitTitle.chars, {
      duration: ANIMATION_CONFIG.durations.slow,
      yPercent: 400,
      autoAlpha: 0,
      rotationX: -90,
      ease: ANIMATION_CONFIG.easings.sine,
      stagger: {
        each: ANIMATION_CONFIG.staggers.fast,
        from: 'center'
      }
    })
    .from(splitSubtitle.words, {
      duration: ANIMATION_CONFIG.durations.normal,
      y: 50,
      opacity: 0,
      stagger: ANIMATION_CONFIG.staggers.normal,
      ease: ANIMATION_CONFIG.easings.smooth
    }, '-=0.5')
    .from(heroCta, {
      duration: ANIMATION_CONFIG.durations.fast,
      y: 30,
      opacity: 0,
      scale: 0.8,
      ease: ANIMATION_CONFIG.easings.bouncy
    }, '-=0.3')
    .from(hero3DElements, {
      duration: ANIMATION_CONFIG.durations.normal,
      y: 80,
      opacity: 0,
      rotationY: 180,
      stagger: ANIMATION_CONFIG.staggers.normal,
      ease: ANIMATION_CONFIG.easings.bouncy
    }, '-=0.8');

    // Continuous 3D animations
    this.animateContinuous3D(hero3DElements);
  }

  // Transition Section Animations
  animateTransitionSection() {
    const transitionTitle = document.querySelector('.transition__title');
    const transitionSubtitle = document.querySelector('.transition__subtitle');
    const transitionStats = document.querySelectorAll('.transition__stat');
    const transitionFeatures = document.querySelectorAll('.transition__feature');
    const transitionVisual = document.querySelector('.transition__visual');

    if (!transitionTitle) return;

    const splitTitle = new SplitText(transitionTitle, { type: 'chars' });
    const splitSubtitle = new SplitText(transitionSubtitle, { type: 'words' });

    gsap.timeline({
      scrollTrigger: createScrollTrigger('.transition')
    })
    .from(splitTitle.chars, {
      duration: ANIMATION_CONFIG.durations.normal,
      y: 120,
      opacity: 0,
      rotationX: -30,
      stagger: 0.04,
      ease: ANIMATION_CONFIG.easings.bouncy
    })
    .from(splitSubtitle.words, {
      duration: ANIMATION_CONFIG.durations.normal,
      y: 60,
      opacity: 0,
      scale: 0.8,
      stagger: 0.12,
      ease: ANIMATION_CONFIG.easings.smooth
    }, '-=0.6')
    .from(transitionStats, {
      duration: ANIMATION_CONFIG.durations.fast,
      y: 50,
      opacity: 0,
      scale: 0.9,
      stagger: 0.12,
      ease: ANIMATION_CONFIG.easings.smooth
    }, '-=0.3')
    .from(transitionFeatures, {
      duration: ANIMATION_CONFIG.durations.normal,
      y: 70,
      opacity: 0,
      scale: 0.7,
      rotationY: 15,
      stagger: 0.1,
      ease: ANIMATION_CONFIG.easings.bouncy
    }, '-=0.2')
    .from(transitionVisual, {
      duration: ANIMATION_CONFIG.durations.slow,
      y: 100,
      opacity: 0,
      scale: 0,
      rotation: 360,
      ease: ANIMATION_CONFIG.easings.bouncy
    }, '-=0.8');
  }

  // Alternate Sections Animations
  animateAlternateSections() {
    const alternateSections = document.querySelectorAll('.alternate-section');
    
    alternateSections.forEach((section, index) => {
      const title = section.querySelector('.alternate-section__title');
      const subtitle = section.querySelector('.alternate-section__subtitle');
      const stats = section.querySelectorAll('.alternate-section__stat');
      const features = section.querySelectorAll('.alternate-section__feature');
      const visual = section.querySelector('.alternate-section__visual');

      if (!title) return;

      const splitTitle = new SplitText(title, { type: 'chars' });
      const splitSubtitle = new SplitText(subtitle, { type: 'words' });

      gsap.timeline({
        scrollTrigger: createScrollTrigger(section)
      })
      .from(splitTitle.chars, {
        duration: ANIMATION_CONFIG.durations.normal,
        y: 130,
        opacity: 0,
        rotationX: -25,
        stagger: 0.05,
        ease: ANIMATION_CONFIG.easings.bouncy
      })
      .from(splitSubtitle.words, {
        duration: ANIMATION_CONFIG.durations.normal,
        y: 70,
        opacity: 0,
        scale: 0.8,
        stagger: 0.15,
        ease: ANIMATION_CONFIG.easings.smooth
      }, '-=0.7')
      .from(stats, {
        duration: ANIMATION_CONFIG.durations.fast,
        y: 60,
        opacity: 0,
        scale: 0.9,
        stagger: 0.15,
        ease: ANIMATION_CONFIG.easings.smooth
      }, '-=0.4')
      .from(features, {
        duration: ANIMATION_CONFIG.durations.normal,
        y: 80,
        opacity: 0,
        scale: 0.6,
        rotationY: 20,
        stagger: 0.12,
        ease: ANIMATION_CONFIG.easings.bouncy
      }, '-=0.3')
      .from(visual, {
        duration: ANIMATION_CONFIG.durations.slow,
        y: 110,
        opacity: 0,
        scale: 0,
        rotation: 720,
        ease: ANIMATION_CONFIG.easings.bouncy
      }, '-=0.9');
    });
  }

  // Inspiration Section Animations
  animateInspirationSection() {
    const inspirationTitle = document.querySelector('.inspiration__title');
    const inspirationSubtitle = document.querySelector('.inspiration__subtitle');
    const inspirationCards = document.querySelectorAll('.inspiration__card');

    if (!inspirationTitle) return;

    const splitTitle = new SplitText(inspirationTitle, { type: 'chars' });
    const splitSubtitle = new SplitText(inspirationSubtitle, { type: 'words' });

    gsap.timeline({
      scrollTrigger: createScrollTrigger('.inspiration')
    })
    .from(splitTitle.chars, {
      duration: ANIMATION_CONFIG.durations.slow,
      y: 150,
      opacity: 0,
      rotationX: -60,
      scale: 0.8,
      stagger: 0.06,
      ease: ANIMATION_CONFIG.easings.bouncy
    })
    .from(splitSubtitle.words, {
      duration: ANIMATION_CONFIG.durations.normal,
      y: 90,
      opacity: 0,
      scale: 0.7,
      stagger: 0.15,
      ease: ANIMATION_CONFIG.easings.smooth
    }, '-=1.0')
    .from(inspirationCards, {
      duration: ANIMATION_CONFIG.durations.normal,
      y: 140,
      opacity: 0,
      scale: 0.5,
      rotationY: 25,
      stagger: 0.3,
      ease: ANIMATION_CONFIG.easings.bouncy
    }, '-=0.7');
  }

  // Statistics Count-up Animation
  animateStatistics() {
    const allStats = document.querySelectorAll('.transition__stat, .alternate-section__stat');
    
    allStats.forEach(stat => {
      const numberElement = stat.querySelector('.transition__number, .alternate-section__number');
      if (!numberElement) return;
      
      const finalNumber = parseInt(numberElement.textContent);
      
      gsap.timeline({
        scrollTrigger: createScrollTrigger(stat, 'top 90%')
      })
      .from(stat, {
        duration: ANIMATION_CONFIG.durations.fast,
        y: 50,
        opacity: 0,
        scale: 0.7,
        rotationY: 15,
        ease: ANIMATION_CONFIG.easings.bouncy
      })
      .to(numberElement, {
        duration: 2.5,
        textContent: finalNumber,
        roundProps: "textContent",
        ease: ANIMATION_CONFIG.easings.smooth,
        snap: { textContent: 1 }
      }, '-=0.5');
    });
  }

  // Feature Cards Animation
  animateFeatureCards() {
    const allFeatures = document.querySelectorAll('.transition__feature, .alternate-section__feature');
    
    allFeatures.forEach((feature, index) => {
      gsap.timeline({
        scrollTrigger: createScrollTrigger(feature, 'top 95%')
      })
      .from(feature, {
        duration: ANIMATION_CONFIG.durations.fast,
        y: 60,
        opacity: 0,
        scale: 0.6,
        rotationY: 20,
        rotationX: 10,
        ease: ANIMATION_CONFIG.easings.bouncy
      })
      .from(feature.querySelector('.transition__feature-icon, .alternate-section__feature-icon'), {
        duration: 0.9,
        scale: 0,
        rotation: 360,
        ease: ANIMATION_CONFIG.easings.bouncy
      }, '-=0.3');
    });
  }

  // Code Elements Animation
  animateCodeElements() {
    const codeElements = document.querySelectorAll('.transition__code-line, .alternate-section__code-line');
    
    codeElements.forEach((line, index) => {
      gsap.timeline({
        scrollTrigger: createScrollTrigger(line, 'top 90%')
      })
      .from(line, {
        duration: ANIMATION_CONFIG.durations.fast,
        x: index % 2 === 0 ? -140 : 140,
        opacity: 0,
        scale: 0.7,
        rotationY: index % 2 === 0 ? -15 : 15,
        ease: ANIMATION_CONFIG.easings.smooth
      });
    });
  }

  // Floating Elements Animation
  animateFloatingElements() {
    const floatingElements = document.querySelectorAll('.hero__float, .transition__dot, .alternate-section__dot');
    
    floatingElements.forEach((element, index) => {
      gsap.timeline({
        scrollTrigger: createScrollTrigger(element, 'top 90%')
      })
      .from(element, {
        duration: ANIMATION_CONFIG.durations.normal,
        y: 100,
        opacity: 0,
        scale: 0,
        rotation: 360,
        ease: ANIMATION_CONFIG.easings.bouncy
      });

      // Continuous floating animation
      gsap.to(element, {
        duration: 3,
        y: -20,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
        delay: index * 0.5
      });
    });
  }

  // Text Elements Animation
  animateTextElements() {
    const textElements = document.querySelectorAll('.text');
    
    textElements.forEach(textElement => {
      const splitText = new SplitText(textElement, { type: 'chars' });
      
      gsap.timeline({
        scrollTrigger: createScrollTrigger(textElement, 'top bottom', 'center center-=25%', true)
      })
      .from(splitText.chars, {
        ease: ANIMATION_CONFIG.easings.sine,
        yPercent: 400,
        autoAlpha: 0,
        rotationX: -90,
        stagger: {
          each: 0.05,
          from: 'center'
        }
      });
    });
  }

  // Parallax Elements Animation
  animateParallaxElements() {
    // Hero content parallax
    const heroContent = document.querySelector('.hero__content');
    if (heroContent) {
      gsap.to(heroContent, {
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
    }

    // 3D elements parallax
    const hero3DElements = document.querySelector('.hero__3d-elements');
    if (hero3DElements) {
      gsap.to(hero3DElements, {
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
    }
  }

  // Continuous 3D Animation
  animateContinuous3D(elements) {
    // Rotate cubes continuously
    const cubes = Array.from(elements).filter(el => el.classList.contains('hero__cube'));
    gsap.to(cubes, {
      duration: 20,
      rotationY: "+=360",
      ease: "none",
      repeat: -1
    });

    // Float spheres
    const spheres = Array.from(elements).filter(el => el.classList.contains('hero__sphere'));
    gsap.to(spheres, {
      duration: 3,
      y: -20,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    // Pulse floats
    const floats = Array.from(elements).filter(el => el.classList.contains('hero__float'));
    gsap.to(floats, {
      duration: 2,
      scale: 1.2,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    });
  }

  // Enhanced scroll animations for CODEWEAVE title
  addEnhancedTitleAnimations() {
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
  }

  // Cleanup animations
  destroy() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    this.animations.clear();
    this.initialized = false;
  }
}

// Create global animator instance
const componentAnimator = new ComponentAnimator();

// Initialize animations when DOM is ready
const initScrollAnimations = () => {
  // Preload images and initialize animations
  preloadImages('.grid__item-img, .hero__cube, .hero__sphere, .hero__float').then(() => {
    document.body.classList.remove('loading');
    componentAnimator.init();
    componentAnimator.addEnhancedTitleAnimations();
    window.scrollTo(0, 0);
  });
};

// Export for use in other modules
export { ComponentAnimator, componentAnimator, initScrollAnimations };

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }
} 