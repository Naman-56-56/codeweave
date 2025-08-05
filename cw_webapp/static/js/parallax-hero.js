// Optimized Parallax System for Hero Section
// This file contains performance-optimized parallax effects that only run when the section is in view

gsap.registerPlugin(ScrollTrigger);

class HeroParallax {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.heroContent = document.querySelector('.hero__content');
    this.hero3DElements = document.querySelector('.hero__3d-elements');
    this.backgroundElements = document.querySelectorAll('.hero__cube, .hero__sphere, .hero__float');
    this.titleSpans = document.querySelectorAll('.hero__title span');
    this.subtitle = document.querySelector('.hero__subtitle');
    this.cta = document.querySelector('.hero__cta');
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    
    // Performance tracking
    this.isInView = false;
    this.animations = new Map();
    this.mouseParallaxActive = false;
    
    this.init();
  }

  init() {
    if (!this.hero) return;
    
    this.setupViewportDetection();
    this.setupParallaxBackground();
    this.setupMouseParallax();
    this.setupHoverEffects();
    this.setupScrollAnimations();
    this.setup3DElements();
    this.setupTextAnimations();
  }

  setupViewportDetection() {
    // Create a ScrollTrigger to detect when hero is in view
    ScrollTrigger.create({
      trigger: this.hero,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        this.isInView = true;
        this.resumeAnimations();
      },
      onLeave: () => {
        this.isInView = false;
        this.pauseAnimations();
      },
      onEnterBack: () => {
        this.isInView = true;
        this.resumeAnimations();
      },
      onLeaveBack: () => {
        this.isInView = false;
        this.pauseAnimations();
      }
    });
  }

  pauseAnimations() {
    // Pause all floating animations when out of view
    this.animations.forEach((animation, key) => {
      if (animation && animation.pause) {
        animation.pause();
      }
    });
    
    // Stop mouse parallax
    this.mouseParallaxActive = false;
    
    // Reduce opacity of 3D elements when out of view for performance
    gsap.to(this.hero3DElements, {
      opacity: 0.3,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  resumeAnimations() {
    // Resume all floating animations when in view
    this.animations.forEach((animation, key) => {
      if (animation && animation.resume) {
        animation.resume();
      }
    });
    
    // Restart mouse parallax
    this.mouseParallaxActive = true;
    
    // Restore opacity of 3D elements
    gsap.to(this.hero3DElements, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  setupParallaxBackground() {
    // Create multiple background layers with different parallax speeds
    const backgroundLayers = [
      { selector: '.hero__cube--1', speed: 0.1, depth: 50 },
      { selector: '.hero__cube--2', speed: 0.15, depth: 100 },
      { selector: '.hero__cube--3', speed: 0.2, depth: 150 },
      { selector: '.hero__sphere--1', speed: 0.08, depth: 30 },
      { selector: '.hero__sphere--2', speed: 0.12, depth: 80 },
      { selector: '.hero__float--1', speed: 0.05, depth: 20 },
      { selector: '.hero__float--2', speed: 0.18, depth: 120 },
      { selector: '.hero__float--3', speed: 0.25, depth: 200 }
    ];

    backgroundLayers.forEach(layer => {
      const element = document.querySelector(layer.selector);
      if (!element) return;

      // Initial position setup
      gsap.set(element, {
        z: layer.depth,
        transformStyle: 'preserve-3d'
      });

      // Scroll-based parallax with viewport control
      const scrollAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: this.hero,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            // Only update if in view
            if (!this.isInView) {
              self.progress = 0;
            }
          }
        }
      })
      .to(element, {
        yPercent: -50 * layer.speed,
        xPercent: 20 * layer.speed,
        rotation: 360 * layer.speed,
        scale: 1 + (layer.speed * 0.5),
        ease: 'none'
      });

      // Store animation for control
      this.animations.set(`scroll_${layer.selector}`, scrollAnimation);

      // Mouse-based parallax (only when in view)
      this.setupMouseParallaxForElement(element, layer.speed, layer.depth);
    });
  }

  setupMouseParallax() {
    // Track mouse movement only when in view
    document.addEventListener('mousemove', (e) => {
      if (!this.isInView || !this.mouseParallaxActive) return;
      
      this.mouseX = (e.clientX / this.windowWidth - 0.5) * 2;
      this.mouseY = (e.clientY / this.windowHeight - 0.5) * 2;
    });

    // Update window dimensions on resize
    window.addEventListener('resize', () => {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    });
  }

  setupMouseParallaxForElement(element, speed, depth) {
    // Create mouse parallax animation that only runs when in view
    const mouseAnimation = gsap.to(element, {
      x: () => this.isInView && this.mouseParallaxActive ? this.mouseX * speed * 100 : 0,
      y: () => this.isInView && this.mouseParallaxActive ? this.mouseY * speed * 100 : 0,
      rotationX: () => this.isInView && this.mouseParallaxActive ? this.mouseY * speed * 30 : 0,
      rotationY: () => this.isInView && this.mouseParallaxActive ? this.mouseX * speed * 30 : 0,
      scale: () => this.isInView && this.mouseParallaxActive ? 1 + Math.abs(this.mouseX + this.mouseY) * speed * 0.3 : 1,
      duration: 0.1,
      ease: 'power2.out',
      repeat: -1
    });

    // Store animation for control
    this.animations.set(`mouse_${element.className}`, mouseAnimation);
  }

  setupHoverEffects() {
    // Enhanced hover effects for title spans (only when in view)
    this.titleSpans.forEach((span, index) => {
      const hoverEffect = {
        scale: 1.4,
        rotationY: 15,
        rotationX: 5,
        z: 50,
        duration: 0.3,
        ease: 'power2.out'
      };

      // Add hover event listeners
      span.addEventListener('mouseenter', () => {
        if (!this.isInView) return;
        
        gsap.to(span, {
          ...hoverEffect,
          color: '#ef5d36',
          textShadow: '0 0 20px rgba(239, 93, 54, 0.9)',
          zIndex: 100
        });

        // Create ripple effect
        this.createRippleEffect(span);
      });

      span.addEventListener('mouseleave', () => {
        gsap.to(span, {
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          color: '#fff',
          textShadow: 'none',
          zIndex: 10,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      // Add click effect
      span.addEventListener('click', () => {
        if (!this.isInView) return;
        
        gsap.to(span, {
          scale: 1.6,
          rotationY: 25,
          rotationX: 10,
          duration: 0.1,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        });
      });
    });

    // Enhanced CTA hover effects
    if (this.cta) {
      this.cta.addEventListener('mouseenter', () => {
        if (!this.isInView) return;
        
        gsap.to(this.cta, {
          scale: 1.05,
          y: -5,
          boxShadow: '0 15px 40px rgba(239, 93, 54, 0.4)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      this.cta.addEventListener('mouseleave', () => {
        gsap.to(this.cta, {
          scale: 1,
          y: 0,
          boxShadow: '0 10px 30px rgba(239, 93, 54, 0.3)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    }
  }

  createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(239, 93, 54, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: -1;
    `;

    element.style.position = 'relative';
    element.appendChild(ripple);

    gsap.to(ripple, {
      width: '120px',
      height: '120px',
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        ripple.remove();
      }
    });
  }

  setupScrollAnimations() {
    // Hero content entrance animation
    if (this.heroContent) {
      const contentAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: this.hero,
          start: 'top bottom',
          end: 'center center',
          scrub: true,
          onUpdate: (self) => {
            if (!this.isInView) {
              self.progress = 0;
            }
          }
        }
      })
      .from(this.heroContent, {
        yPercent: 30,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: 'power2.out'
      });

      this.animations.set('content_animation', contentAnimation);
    }

    // Subtitle animation
    if (this.subtitle) {
      const subtitleAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: this.subtitle,
          start: 'top bottom',
          end: 'center center',
          scrub: true,
          onUpdate: (self) => {
            if (!this.isInView) {
              self.progress = 0;
            }
          }
        }
      })
      .from(this.subtitle, {
        yPercent: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });

      this.animations.set('subtitle_animation', subtitleAnimation);
    }
  }

  setup3DElements() {
    // Create floating 3D elements with viewport-controlled animation
    const floatingElements = document.querySelectorAll('.hero__cube, .hero__sphere');
    
    floatingElements.forEach((element, index) => {
      const floatSpeed = 2 + (index * 0.5);
      const floatDistance = 20 + (index * 10);
      
      // Floating animation that pauses when out of view
      const floatAnimation = gsap.to(element, {
        y: -floatDistance,
        rotation: 360,
        duration: floatSpeed,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: !this.isInView // Start paused if not in view
      });

      // Store animation for control
      this.animations.set(`float_${index}`, floatAnimation);

      // Add hover interaction (only when in view)
      element.addEventListener('mouseenter', () => {
        if (!this.isInView) return;
        
        gsap.to(element, {
          scale: 1.2,
          rotation: '+=180',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  setupTextAnimations() {
    // Split text animations for title
    if (this.titleSpans.length > 0) {
      const titleContainer = this.titleSpans[0].parentElement;
      
      const textAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: titleContainer,
          start: 'top bottom',
          end: 'center center',
          scrub: true,
          onUpdate: (self) => {
            if (!this.isInView) {
              self.progress = 0;
            }
          }
        }
      })
      .from(this.titleSpans, {
        yPercent: 100,
        opacity: 0,
        rotationX: 90,
        stagger: {
          each: 0.05,
          from: 'start'
        },
        ease: 'power2.out'
      });

      this.animations.set('text_animation', textAnimation);
    }
  }

  // Method to add new parallax elements dynamically
  addParallaxElement(element, options = {}) {
    const {
      speed = 0.1,
      depth = 50,
      enableMouseParallax = true
    } = options;

    gsap.set(element, {
      z: depth,
      transformStyle: 'preserve-3d'
    });

    // Scroll parallax with viewport control
    const scrollAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: this.hero,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          if (!this.isInView) {
            self.progress = 0;
          }
        }
      }
    })
    .to(element, {
      yPercent: -50 * speed,
      xPercent: 20 * speed,
      rotation: 360 * speed,
      scale: 1 + (speed * 0.5),
      ease: 'none'
    });

    this.animations.set(`dynamic_${element.className}`, scrollAnimation);

    // Mouse parallax
    if (enableMouseParallax) {
      this.setupMouseParallaxForElement(element, speed, depth);
    }
  }

  // Method to refresh parallax on window resize
  refresh() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    ScrollTrigger.refresh();
  }

  // Method to completely destroy animations for cleanup
  destroy() {
    this.animations.forEach((animation, key) => {
      if (animation && animation.kill) {
        animation.kill();
      }
    });
    this.animations.clear();
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger === this.hero) {
        trigger.kill();
      }
    });
  }
}

// Initialize the parallax system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const heroParallax = new HeroParallax();
  
  // Make it globally available for potential external use
  window.heroParallax = heroParallax;
  
  // Refresh on window resize
  window.addEventListener('resize', () => {
    heroParallax.refresh();
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    heroParallax.destroy();
  });
});

// Export for module use
export default HeroParallax; 