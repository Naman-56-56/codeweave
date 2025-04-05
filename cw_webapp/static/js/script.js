// Initialize GSAP animations
gsap.from('.hero-content', {duration: 1, y: -50, opacity: 0});
gsap.from('.feature-card', {duration: 1, y: 50, opacity: 0, stagger: 0.2});
gsap.from('.timeline li', {duration: 1, x: -50, opacity: 0, stagger: 0.2});
gsap.from('.testimonial-carousel', {duration: 1, y: 50, opacity: 0});

// ScrollReveal for animations
ScrollReveal().reveal('.feature-card', { duration: 1000, distance: '50px', easing: 'ease-in-out', interval: 200 });
ScrollReveal().reveal('.timeline', { duration: 1000, origin: 'left', distance: '50px' });
ScrollReveal().reveal('.testimonial-carousel', { duration: 1000, origin: 'bottom', distance: '50px' });

// Typewriter effect with cursor animation
const codeLines = document.querySelectorAll('.code-line .code-text');
let currentLine = 0;

function typeWriter(line, text, i) {
    if (i < text.length) {
        line.textContent += text.charAt(i);
        i++;
        setTimeout(() => typeWriter(line, text, i), 50);
    } else {
        line.style.animation = 'none';
        currentLine++;
        if (currentLine < codeLines.length) {
            typeWriter(codeLines[currentLine], codeLines[currentLine].textContent, 0);
        }
    }
}

if (codeLines.length > 0) {
    codeLines.forEach(line => line.textContent = '');
    typeWriter(codeLines[0], codeLines[0].dataset.text || codeLines[0].textContent, 0);
}

// New Typewriter Effect
const text = "Welcome to the Smart Resume Customizer!";
const typewriterElement = document.getElementById('typewriter');
let index = 0;

function newTypeWriter() {
    if (index < text.length) {
        typewriterElement.innerHTML += text.charAt(index);
        index++;
        setTimeout(newTypeWriter, 100);
    }
}

window.onload = newTypeWriter;
