// ===== Intersection Observer for Scroll Animations =====
document.addEventListener('DOMContentLoaded', () => {
    // Reveal on Scroll
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
    
    // Stagger Animation for Cards
    const cardGroups = document.querySelectorAll('.specialties-grid, .testimonials-slider');
    
    cardGroups.forEach(group => {
        const cards = group.querySelectorAll('.specialty-card, .testimonial-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        });
        
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cards.forEach(card => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        cardObserver.observe(group);
    });
});

// ===== Mouse Move Parallax =====
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    const parallaxElements = document.querySelectorAll('.floating-badge, .card-overlay');
    
    parallaxElements.forEach(el => {
        const speed = 20;
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        
        el.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
});

// ===== Text Scramble Effect =====
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// ===== Apply Text Scramble =====
const titles = document.querySelectorAll('.section-title .title-main');
titles.forEach(title => {
    const originalText = title.innerText;
    const fx = new TextScramble(title);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fx.setText(originalText);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(title);
});

// ===== Magnetic Button Effect =====
const buttons = document.querySelectorAll('.btn');

buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

// ===== Cursor Effect =====
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-outline"></div>';
document.body.appendChild(cursor);

const cursorDot = cursor.querySelector('.cursor-dot');
const cursorOutline = cursor.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: 'forwards' });
});

// Add hover effect for interactive elements
const interactiveElements = document.querySelectorAll('a, button, .card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.opacity = '0.5';
    });
    
    el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.opacity = '1';
    });
});

// ===== Loading Screen =====
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// ===== Typing Effect =====
class TypingEffect {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentText = '';
        this.index = 0;
    }
    
    type() {
        if (this.index < this.text.length) {
            this.currentText += this.text.charAt(this.index);
            this.element.textContent = this.currentText;
            this.index++;
            setTimeout(() => this.type(), this.speed);
        }
    }
}

// ===== Initialize Typing Effects =====
const typingElements = document.querySelectorAll('[data-type]');
typingElements.forEach(el => {
    const text = el.dataset.type;
    const speed = parseInt(el.dataset.speed) || 100;
    const typing = new TypingEffect(el, text, speed);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typing.type();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(el);
});

// ===== Particle Effect (Optional) =====
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.cssText = `
        position: fixed;
        width: 5px;
        height: 5px;
        background: #D4AF37;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(particle);
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 100 + 50;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
        duration: 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
    }).onfinish = () => particle.remove();
}

// Add click particle effect
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn')) {
        for (let i = 0; i < 8; i++) {
            createParticle(e.clientX, e.clientY);
        }
    }
});

// ===== Smooth Page Transitions =====
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/"]');
    if (link && !link.target === '_blank') {
        e.preventDefault();
        const href = link.getAttribute('href');
        
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }
});

// ===== Progress Bar =====
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #D4AF37, #8B0000);
        z-index: 10000;
        width: 0%;
        transition: width 0.1s;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

createProgressBar();

// ===== Add to Cart Animation =====
function addToCartAnimation(element) {
    const cart = document.querySelector('.cart-icon');
    if (!cart) return;
    
    const rect = element.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();
    
    const flyer = document.createElement('div');
    flyer.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        width: 30px;
        height: 30px;
        background: #D4AF37;
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
    `;
    
    document.body.appendChild(flyer);
    
    flyer.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { 
            transform: `translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px) scale(0.3)`,
            opacity: 0.5
        }
    ], {
        duration: 600,
        easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'
    }).onfinish = () => {
        flyer.remove();
        cart.classList.add('pulse');
        setTimeout(() => cart.classList.remove('pulse'), 300);
    };
}