// Hero Animations Integration (Anime.js version)
// Connects the existing animation logic to animate components on scroll
// Loads Anime.js if not present
import './anime-loader.js';

// Import utility function
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
  });
};

// Animation configuration (Anime.js)
// You can add custom config here if needed

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

// Split text for animation (Anime.js works with spans)
const splitTitle = heroTitle ? heroTitle.querySelectorAll('span') : null;
const splitSubtitle = heroSubtitle ? heroSubtitle.querySelectorAll('span, .word') : null;
const splitTextEl = textElement ? textElement.querySelectorAll('span') : null;
const splitTransitionTitle = transitionTitle ? transitionTitle.querySelectorAll('span') : null;
const splitTransitionSubtitle = transitionSubtitle ? transitionSubtitle.querySelectorAll('span, .word') : null;
const splitInspirationTitle = inspirationTitle ? inspirationTitle.querySelectorAll('span') : null;
const splitInspirationSubtitle = inspirationSubtitle ? inspirationSubtitle.querySelectorAll('span, .word') : null;
const splitAlternateTitles = alternateTitles ? Array.from(alternateTitles).map(title => title.querySelectorAll('span')) : [];
const splitAlternateSubtitles = alternateSubtitles ? Array.from(alternateSubtitles).map(subtitle => subtitle.querySelectorAll('span, .word')) : [];

// Hero entrance animation
const animateHero = () => {
  if (!heroTitle) return;
  anime({
    targets: splitTitle,
    translateY: [400, 0],
    opacity: [0, 1],
    rotateX: [-90, 0],
    easing: 'easeOutSine',
    delay: anime.stagger(50, {start: 0, from: 'center'})
  });
  anime({
    targets: splitSubtitle,
    translateY: [50, 0],
    opacity: [0, 1],
    easing: 'easeOutQuad',
    delay: anime.stagger(100, {start: 0})
  });
  anime({
    targets: heroCta,
    translateY: [30, 0],
    opacity: [0, 1],
    scale: [0.8, 1],
    easing: 'easeOutBack',
    duration: 800
  });
  anime({
    targets: heroCubes,
    translateY: [80, 0],
    opacity: [0, 1],
    rotateY: [180, 0],
    easing: 'easeOutBack',
    delay: anime.stagger(100, {start: 0})
  });
  anime({
    targets: heroSpheres,
    translateY: [60, 0],
    opacity: [0, 1],
    scale: [0, 1],
    easing: 'easeOutBack',
    delay: anime.stagger(150, {start: 0})
  });
  anime({
    targets: heroFloats,
    translateY: [40, 0],
    opacity: [0, 1],
    easing: 'easeOutQuad',
    delay: anime.stagger(100, {start: 0})
  });
};

// Continuous 3D animation
const animate3DElements = () => {
  anime({
    targets: heroCubes,
    rotateY: 360,
    duration: 20000,
    easing: 'linear',
    loop: true
  });
  anime({
    targets: heroSpheres,
    translateY: [-20, 0],
    direction: 'alternate',
    duration: 3000,
    easing: 'easeInOutQuad',
    loop: true
  });
  anime({
    targets: heroFloats,
    scale: [1, 1.2],
    direction: 'alternate',
    duration: 2000,
    easing: 'easeInOutQuad',
    loop: true,
    delay: anime.stagger(500, {start: 0})
  });
};

// Transition section animation
const animateTransition = () => {
  if (!transitionTitle) return;
  anime({
    targets: splitTransitionTitle,
    translateY: [120, 0],
    opacity: [0, 1],
    rotateX: [-30, 0],
    easing: 'easeOutBack',
    delay: anime.stagger(40, {start: 0})
  });
  anime({
    targets: splitTransitionSubtitle,
    translateY: [60, 0],
    opacity: [0, 1],
    scale: [0.8, 1],
    easing: 'easeOutQuad',
    delay: anime.stagger(120, {start: 0})
  });
  anime({
    targets: transitionCircle,
    translateY: [100, 0],
    opacity: [0, 1],
    scale: [0, 1],
    rotate: [360, 0],
    easing: 'easeOutBack',
    duration: 1800
  });
  anime({
    targets: transitionLine,
    translateY: [80, 0],
    opacity: [0, 1],
    scaleY: [0, 1],
    rotateZ: [90, 0],
    easing: 'easeOutQuad',
    duration: 1200
  });
  anime({
    targets: transitionDots,
    translateY: [90, 0],
    opacity: [0, 1],
    scale: [0, 1],
    rotate: [180, 0],
    easing: 'easeOutBack',
    delay: anime.stagger(150, {start: 0})
  });
  anime({
    targets: transitionStats,
    translateY: [50, 0],
    opacity: [0, 1],
    scale: [0.9, 1],
    easing: 'easeOutQuad',
    delay: anime.stagger(120, {start: 0})
  });
  anime({
    targets: transitionFeatures,
    translateY: [70, 0],
    opacity: [0, 1],
    scale: [0.7, 1],
    rotateY: [15, 0],
    easing: 'easeOutBack',
    delay: anime.stagger(100, {start: 0})
  });
  anime({
    targets: transitionCodeLines,
    translateX: [-120, 0],
    opacity: [0, 1],
    scale: [0.8, 1],
    easing: 'easeOutQuad',
    delay: anime.stagger(150, {start: 0})
  });
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

    anime({
      targets: title,
      translateY: [130, 0],
      opacity: [0, 1],
      rotateX: [-25, 0],
      easing: 'easeOutBack',
      delay: anime.stagger(50, {start: 0})
    });
    anime({
      targets: subtitle,
      translateY: [70, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      easing: 'easeOutQuad',
      delay: anime.stagger(150, {start: 0})
    });
    anime({
      targets: sectionCircle,
      translateY: [110, 0],
      opacity: [0, 1],
      scale: [0, 1],
      rotate: [720, 0],
      easing: 'easeOutBack',
      duration: 2000
    });
    anime({
      targets: sectionLine,
      translateY: [90, 0],
      opacity: [0, 1],
      scaleY: [0, 1],
      rotateZ: [45, 0],
      easing: 'easeOutQuad',
      duration: 1400
    });
    anime({
      targets: sectionDots,
      translateY: [100, 0],
      opacity: [0, 1],
      scale: [0, 1],
      rotate: [360, 0],
      easing: 'easeOutBack',
      delay: anime.stagger(200, {start: 0})
    });
    anime({
      targets: sectionStats,
      translateY: [60, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      easing: 'easeOutQuad',
      delay: anime.stagger(150, {start: 0})
    });
    anime({
      targets: sectionFeatures,
      translateY: [80, 0],
      opacity: [0, 1],
      scale: [0.6, 1],
      rotateY: [20, 0],
      easing: 'easeOutBack',
      delay: anime.stagger(120, {start: 0})
    });
    anime({
      targets: sectionCodeLines,
      translateX: [index % 2 === 0 ? -140 : 140, 0],
      opacity: [0, 1],
      scale: [0.7, 1],
      rotateY: [index % 2 === 0 ? -15 : 15, 0],
      easing: 'easeOutQuad',
      delay: anime.stagger(180, {start: 0})
    });
  });
};

// Inspiration section animation
const animateInspiration = () => {
  if (!inspirationTitle) return;
  anime({
    targets: splitInspirationTitle,
    translateY: [150, 0],
    opacity: [0, 1],
    rotateX: [-60, 0],
    scale: [0.8, 1],
    easing: 'easeOutBack',
    delay: anime.stagger(60, {start: 0})
  });
  anime({
    targets: splitInspirationSubtitle,
    translateY: [90, 0],
    opacity: [0, 1],
    scale: [0.7, 1],
    easing: 'easeOutQuad',
    delay: anime.stagger(150, {start: 0})
  });
  anime({
    targets: inspirationCards,
    translateY: [140, 0],
    opacity: [0, 1],
    scale: [0.5, 1],
    rotateY: [25, 0],
    easing: 'easeOutBack',
    delay: anime.stagger(300, {start: 0})
  });
  anime({
    targets: inspirationLines,
    scaleX: [0, 1],
    opacity: [0, 1],
    rotateZ: [90, 0],
    easing: 'easeOutQuad',
    delay: anime.stagger(500, {start: 0})
  });
  anime({
    targets: inspirationDots,
    scale: [0, 1],
    opacity: [0, 1],
    rotate: [360, 0],
    easing: 'easeOutBack',
    delay: anime.stagger(300, {start: 0})
  });
};

// Statistics count-up animation
const animateStatistics = () => {
  anime({
    targets: heroCubes,
    rotateY: 360,
    duration: 20000,
    easing: 'linear',
    loop: true
  });
  anime({
    targets: heroSpheres,
    translateY: [-20, 0],
    direction: 'alternate',
    duration: 3000,
    easing: 'easeInOutQuad',
    loop: true
  });
  anime({
    targets: heroFloats,
    scale: [1, 1.2],
    direction: 'alternate',
    duration: 2000,
    easing: 'easeInOutQuad',
    loop: true,
    delay: anime.stagger(500, {start: 0})
  });
};
// Text animation
const animateTextElement = () => {
  if (!textElement) return;
  anime({
    targets: splitTextEl,
    translateY: [400, 0],
    opacity: [0, 1],
    rotateX: [-90, 0],
    easing: 'easeOutSine',
    delay: anime.stagger(50, {start: 0, from: 'center'})
  });
};

// Hero parallax animation
const animateHeroParallax = () => {
  // Removed scroll-based parallax for smoother native scroll
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
      ticking = true;
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
    }
  };
  
  // Attach the throttled handler and run once to initialize
  window.addEventListener('scroll', throttledHandleScroll);
  handleScroll();
};

// Initialize all animations and enhanced behaviors
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
// Enable native smooth scroll
document.documentElement.style.scrollBehavior = 'smooth';
preloadImages('.grid__item-img, .hero__cube, .hero__sphere, .hero__float').then(() => {
  document.body.classList.remove('loading');
  init();
  window.scrollTo(0, 0);
});