import { preloadImages } from './utils.js'; // Import utility function to preload images

// Custom scroll trigger implementation for Anime.js
class ScrollTrigger {
  constructor() {
    this.triggers = [];
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll());
    window.addEventListener('resize', () => this.handleScroll());
  }

  add(options) {
    this.triggers.push({
      ...options,
      isActive: false,
      progress: 0
    });
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    this.triggers.forEach(trigger => {
      const element = trigger.trigger;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementBottom = elementTop + rect.height;

      // Parse start and end positions
      const start = this.parsePosition(trigger.start, elementTop, windowHeight);
      const end = this.parsePosition(trigger.end, elementBottom, windowHeight);

      // Calculate progress
      const scrollProgress = (scrollY - start) / (end - start);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

      if (clampedProgress !== trigger.progress) {
        trigger.progress = clampedProgress;
        if (trigger.onUpdate) {
          trigger.onUpdate(clampedProgress);
        }
      }

      // Handle enter/leave callbacks
      if (clampedProgress > 0 && !trigger.isActive) {
        trigger.isActive = true;
        if (trigger.onEnter) trigger.onEnter();
      } else if (clampedProgress === 0 && trigger.isActive) {
        trigger.isActive = false;
        if (trigger.onLeave) trigger.onLeave();
      }
    });
  }

  parsePosition(position, elementPos, windowHeight) {
    if (typeof position === 'string') {
      const parts = position.split(' ');
      let result = elementPos;

      if (parts.includes('top')) result = elementPos;
      if (parts.includes('center')) result = elementPos - windowHeight / 2;
      if (parts.includes('bottom')) result = elementPos - windowHeight;

      // Handle offset like 'bottom+=10%'
      const offsetMatch = position.match(/([+-]\d+%?)/);
      if (offsetMatch) {
        const offset = offsetMatch[1];
        if (offset.includes('%')) {
          const percentage = parseFloat(offset.replace('%', '')) / 100;
          result += windowHeight * percentage;
        } else {
          result += parseFloat(offset);
        }
      }

      return result;
    }
    return position;
  }
}

const scrollTrigger = new ScrollTrigger();

// Utility function to split text into characters (simplified version of SplitText)
const splitText = (element, options = { type: 'chars' }) => {
  if (!element) return { chars: [] };
  
  const text = element.textContent;
  const chars = [];
  
  // Clear the element
  element.innerHTML = '';
  
  // Create span for each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space for spaces
    span.style.display = 'inline-block';
    element.appendChild(span);
    chars.push(span);
  }
  
  return { chars };
};

const grid = document.querySelector('.grid'); // Select the container that holds all grid items
const gridImages = grid.querySelectorAll('.grid__item-imgwrap'); // Select all elements with the class '.grid__item-imgwrap'

const marqueeInner = document.querySelector('.mark > .mark__inner'); // Select the inner element of the marquee

const textElement = document.querySelector('.text'); // Select the text element
let splitTextEl = null;
if (textElement) {
  splitTextEl = splitText(textElement, { type: 'chars' }); // Split the text into individual characters for animation
}

const gridFull = document.querySelector('.grid--full'); // Select the full grid container

const creditsTexts = document.querySelectorAll('.credits'); // Select all elements with the class '.credits'

// New text elements for animation
const introTitle = document.querySelector('.intro__title'); // Select the intro title
const introInfo = document.querySelector('.intro__info'); // Select the intro info text

// Helper function to determine if the element is on the left or right side of the viewport
const isLeftSide = (element) => {
  const elementCenter = element.getBoundingClientRect().left + element.offsetWidth / 2; // Calculate the center of the element
  const viewportCenter = window.innerWidth / 2; // Calculate the center of the viewport
  return elementCenter < viewportCenter; // Return true if the element's center is to the left of the viewport's center
};

// Function to animate the intro title with a dramatic entrance
const animateIntroTitle = () => {
  if (!introTitle) return;
  
  const splitIntroTitle = splitText(introTitle, { type: 'chars' });
  
  // Set initial state
  anime.set(splitIntroTitle.chars, {
    translateY: '200%',
    rotateX: 90,
    opacity: 0
  });

  scrollTrigger.add({
    trigger: introTitle,
    start: 'top bottom',
    end: 'center center',
    onUpdate: (progress) => {
      anime({
        targets: splitIntroTitle.chars,
        translateY: `${200 - (200 * progress)}%`,
        rotateX: 90 - (90 * progress),
        opacity: progress,
        delay: anime.stagger(20, { start: 0 }),
        easing: 'easeOutQuad',
        duration: 0
      });
    }
  });
};

// Function to animate the intro info text
const animateIntroInfo = () => {
  if (!introInfo) return;
  
  const splitIntroInfo = splitText(introInfo, { type: 'chars' });
  
  // Set initial state
  anime.set(splitIntroInfo.chars, {
    translateY: '100%',
    opacity: 0
  });

  scrollTrigger.add({
    trigger: introInfo,
    start: 'top bottom',
    end: 'center center',
    onUpdate: (progress) => {
      anime({
        targets: splitIntroInfo.chars,
        translateY: `${100 - (100 * progress)}%`,
        opacity: progress,
        delay: anime.stagger(30, { start: 0 }),
        easing: 'easeOutQuad',
        duration: 0
      });
    }
  });
};

// Function to animate the grid items as they scroll into and out of view
const animateScrollGrid = () => {
  gridImages.forEach(imageWrap => {
    const imgEl = imageWrap.querySelector('.grid__item-img'); // Select the image element inside the grid item
    const leftSide = isLeftSide(imageWrap); // Check if the element is on the left side of the viewport

    // Set initial state
    anime.set(imageWrap, {
      translateZ: 300,
      rotateX: 70,
      rotateZ: leftSide ? 5 : -5,
      translateX: leftSide ? '-40%' : '40%',
      skewX: leftSide ? -20 : 20,
      translateY: '100%',
      filter: 'blur(7px) brightness(0%) contrast(400%)',
      opacity: 1
    });

    anime.set(imgEl, {
      scaleY: 1.8
    });

    scrollTrigger.add({
      trigger: imageWrap,
      start: 'top bottom+=10%',
      end: 'bottom top-=25%',
      onUpdate: (progress) => {
        // Calculate mid-point for the animation phases
        const midPoint = 0.5;
        
        if (progress <= midPoint) {
          // First half: animate in
          const localProgress = progress / midPoint;
          
          anime({
            targets: imageWrap,
            translateZ: 300 - (300 * localProgress),
            rotateX: 70 - (70 * localProgress),
            rotateZ: leftSide ? 5 - (5 * localProgress) : -5 + (5 * localProgress),
            translateX: leftSide ? `${-40 + (40 * localProgress)}%` : `${40 - (40 * localProgress)}%`,
            skewX: leftSide ? -20 + (20 * localProgress) : 20 - (20 * localProgress),
            translateY: `${100 - (100 * localProgress)}%`,
            filter: `blur(${7 - (7 * localProgress)}px) brightness(${100 * localProgress}%) contrast(${400 - (300 * localProgress)}%)`,
            duration: 0,
            easing: 'linear'
          });

          anime({
            targets: imgEl,
            scaleY: 1.8 - (0.8 * localProgress),
            duration: 0,
            easing: 'linear'
          });
        } else {
          // Second half: animate out
          const localProgress = (progress - midPoint) / (1 - midPoint);
          
          anime({
            targets: imageWrap,
            translateZ: 300,
            rotateX: -50 * localProgress,
            rotateZ: leftSide ? -1 * localProgress : 1 * localProgress,
            translateX: leftSide ? `${-20 * localProgress}%` : `${20 * localProgress}%`,
            skewX: leftSide ? 10 * localProgress : -10 * localProgress,
            filter: `blur(${4 * localProgress}px) brightness(${100 - (100 * localProgress)}%) contrast(${100 + (400 * localProgress)}%)`,
            duration: 0,
            easing: 'linear'
          });

          anime({
            targets: imgEl,
            scaleY: 1 + (0.8 * localProgress),
            duration: 0,
            easing: 'linear'
          });
        }
      }
    });
  });
};

// Function to animate the horizontal marquee as the user scrolls
const animateMarquee = () => {
  if (!marqueeInner) return;

  // Set initial state
  anime.set(marqueeInner, {
    translateX: '100vw'
  });

  scrollTrigger.add({
    trigger: grid,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (progress) => {
      anime({
        targets: marqueeInner,
        translateX: `${100 - (210 * progress)}vw`, // From 100vw to -110vw
        duration: 0,
        easing: 'linear'
      });
    }
  });
};

// Function to animate text (split into characters) as it scrolls into view
const animateTextElement = () => {
  if (!textElement || !splitTextEl) return;

  // Set initial state
  anime.set(splitTextEl.chars, {
    translateY: '300%',
    opacity: 0
  });

  scrollTrigger.add({
    trigger: textElement,
    start: 'top bottom',
    end: 'center center-=25%',
    onUpdate: (progress) => {
      splitTextEl.chars.forEach((char, index) => {
        const delay = Math.abs(index - (splitTextEl.chars.length / 2)) * 40;
        const charProgress = Math.max(0, progress - (delay / 1000));
        
        anime({
          targets: char,
          translateY: `${300 - (300 * charProgress)}%`,
          opacity: charProgress,
          duration: 0,
          easing: 'linear'
        });
      });
    }
  });
};

// Function to animate the full grid with staggered delays per column
const animateGridFull = () => {
  if (!gridFull) return;

  const gridFullItems = gridFull.querySelectorAll('.grid__item'); // Select all items in the full grid
  
  // Calculate the number of columns in the grid--full
  const numColumns = getComputedStyle(gridFull).getPropertyValue('grid-template-columns').split(' ').length;
  const middleColumnIndex = Math.floor(numColumns / 2); // Find the index of the center column

  // Organize items by columns
  const columns = Array.from({ length: numColumns }, () => []); // Initialize empty arrays for each column
  gridFullItems.forEach((item, index) => {
    const columnIndex = index % numColumns; // Determine which column the item belongs to
    columns[columnIndex].push(item); // Add the item to the respective column
  });

  // Set initial state for all items
  gridFullItems.forEach(item => {
    const img = item.querySelector('.grid__item-img');
    anime.set(item, {
      translateY: '450%',
      opacity: 0
    });
    if (img) {
      anime.set(img, {
        transformOrigin: '50% 0%'
      });
    }
  });

  scrollTrigger.add({
    trigger: gridFull,
    start: 'top bottom',
    end: 'center center',
    onUpdate: (progress) => {
      columns.forEach((columnItems, columnIndex) => {
        const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2;
        const adjustedProgress = Math.max(0, progress - delayFactor);

        columnItems.forEach(item => {
          const img = item.querySelector('.grid__item-img');
          
          anime({
            targets: item,
            translateY: `${450 - (450 * adjustedProgress)}%`,
            opacity: adjustedProgress,
            duration: 0,
            easing: 'linear'
          });

          if (img) {
            anime({
              targets: img,
              duration: 0,
              easing: 'linear'
            });
          }
        });
      });
    }
  });
};

const animateCredits = () => {
  creditsTexts.forEach(creditsText => {
    const splitCredits = splitText(creditsText, { type: 'chars' }); // Split each credits text into characters

    // Set initial state with spread out characters
    splitCredits.chars.forEach((char, index) => {
      anime.set(char, {
        translateX: index * 80 - ((splitCredits.chars.length * 80) / 2)
      });
    });

    scrollTrigger.add({
      trigger: creditsText,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (progress) => {
        splitCredits.chars.forEach((char, index) => {
          const initialX = index * 80 - ((splitCredits.chars.length * 80) / 2);
          anime({
            targets: char,
            translateX: initialX - (initialX * progress), // Animate back to 0
            duration: 0,
            easing: 'linear'
          });
        });
      }
    });
  });
};

// Main initialization function
const init = () => {
  animateIntroTitle();    // Animate the intro title
  animateIntroInfo();     // Animate the intro info text
  animateScrollGrid();    // Animate the grid items on scroll
  animateMarquee();       // Animate the marquee on scroll
  animateTextElement();   // Animate the split text on scroll
  animateGridFull();      // Animate the full grid with staggered delay
  animateCredits();       // Call the credits animation
};

// Preload images and initialize animations after the images have loaded
preloadImages('.grid__item-img').then(() => {
  document.body.classList.remove('loading'); // Remove the 'loading' class from the body
  init(); // Initialize the animations
  window.scrollTo(0, 0); // Scroll to the top of the page on load
});