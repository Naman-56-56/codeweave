// Interactive text effects and mouse interactions
// This file contains additional interactive animations for text elements

// Function to create a magnetic text effect that follows the mouse
const createMagneticText = (element, options = {}) => {
  if (!element) return;
  
  const {
    strength = 0.3,
    maxDistance = 100
  } = options;
  
  let mouseX = 0;
  let mouseY = 0;
  let elementX = 0;
  let elementY = 0;
  
  // Get element position
  const updateElementPosition = () => {
    const rect = element.getBoundingClientRect();
    elementX = rect.left + rect.width / 2;
    elementY = rect.top + rect.height / 2;
  };
  
  // Update mouse position
  const updateMousePosition = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  
  // Calculate distance and apply magnetic effect
  const applyMagneticEffect = () => {
    const deltaX = mouseX - elementX;
    const deltaY = mouseY - elementY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      const moveX = deltaX * force * strength;
      const moveY = deltaY * force * strength;
      
      gsap.to(element, {
        x: moveX,
        y: moveY,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };
  
  // Add event listeners
  document.addEventListener('mousemove', updateMousePosition);
  window.addEventListener('resize', updateElementPosition);
  
  // Initial position update
  updateElementPosition();
  
  // Apply effect on mouse move
  document.addEventListener('mousemove', applyMagneticEffect);
  
  // Clean up function
  return () => {
    document.removeEventListener('mousemove', updateMousePosition);
    document.removeEventListener('mousemove', applyMagneticEffect);
    window.removeEventListener('resize', updateElementPosition);
  };
};

// Function to create a ripple effect on text click
const createRippleEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    color = '#fff',
    duration = 0.6,
    scale = 2
  } = options;
  
  element.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: ${color};
      border-radius: 50%;
      transform: scale(0);
      opacity: 0.6;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    gsap.to(ripple, {
      scale: scale,
      opacity: 0,
      duration: duration,
      ease: 'power2.out',
      onComplete: () => {
        ripple.remove();
      }
    });
  });
};

// Function to create a text scramble effect
const createTextScramble = (element, options = {}) => {
  if (!element) return;
  
  const {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
    speed = 50,
    duration = 2000
  } = options;
  
  const originalText = element.textContent;
  let interval;
  let currentIndex = 0;
  
  const scrambleText = () => {
    let scrambledText = '';
    for (let i = 0; i < originalText.length; i++) {
      if (i < currentIndex) {
        scrambledText += originalText[i];
      } else {
        scrambledText += characters[Math.floor(Math.random() * characters.length)];
      }
    }
    element.textContent = scrambledText;
  };
  
  const startScramble = () => {
    currentIndex = 0;
    interval = setInterval(() => {
      scrambleText();
      currentIndex++;
      if (currentIndex > originalText.length) {
        clearInterval(interval);
        element.textContent = originalText;
      }
    }, speed);
  };
  
  // Start scramble on hover
  element.addEventListener('mouseenter', startScramble);
  
  return () => {
    if (interval) {
      clearInterval(interval);
    }
    element.textContent = originalText;
  };
};

// Function to create a text glitch effect
const createTextGlitch = (element, options = {}) => {
  if (!element) return;
  
  const {
    intensity = 0.1,
    frequency = 2000
  } = options;
  
  const originalText = element.textContent;
  let glitchInterval;
  
  const applyGlitch = () => {
    if (Math.random() < intensity) {
      const glitchText = originalText.split('').map(char => {
        if (Math.random() < 0.1) {
          return '█';
        }
        return char;
      }).join('');
      
      element.textContent = glitchText;
      
      setTimeout(() => {
        element.textContent = originalText;
      }, 50);
    }
  };
  
  glitchInterval = setInterval(applyGlitch, frequency);
  
  return () => {
    if (glitchInterval) {
      clearInterval(glitchInterval);
    }
    element.textContent = originalText;
  };
};

// Function to create a text breathing effect
const createBreathingEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    minScale = 0.95,
    maxScale = 1.05,
    duration = 2
  } = options;
  
  gsap.to(element, {
    scale: maxScale,
    duration: duration,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1
  });
};

// Function to create a text wave effect on mouse move
const createWaveEffect = (element, options = {}) => {
  if (!element) return;
  
  const {
    amplitude = 20,
    frequency = 0.1
  } = options;
  
  const splitText = new SplitText(element, { type: 'chars' });
  
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    splitText.chars.forEach((char, index) => {
      const charRect = char.getBoundingClientRect();
      const charCenterX = charRect.left + charRect.width / 2;
      const charCenterY = charRect.top + charRect.height / 2;
      
      const distanceX = mouseX - charCenterX;
      const distanceY = mouseY - charCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      const waveOffset = Math.sin(index * frequency) * amplitude;
      const mouseInfluence = Math.max(0, (200 - distance) / 200);
      
      gsap.to(char, {
        y: waveOffset * mouseInfluence,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
};

// Export all interactive functions
export {
  createMagneticText,
  createRippleEffect,
  createTextScramble,
  createTextGlitch,
  createBreathingEffect,
  createWaveEffect
}; 