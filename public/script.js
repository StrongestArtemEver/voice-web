// Navigation menu functionality
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navMenu = document.querySelector('#navMenu');
const navClose = document.querySelector('.nav-close');

// Toggle mobile menu
if (hamburgerMenu && navMenu) {
    hamburgerMenu.addEventListener('click', () => {
        navMenu.classList.add('active');
        document.body.classList.add('no-scroll');
    });
}

if (navClose && navMenu) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
}

// Close menu when clicking on a link
document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

// Smooth scrolling function with header offset
function scrollToSection(sectionId, extraOffset = 20) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - extraOffset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
}

// Per-section extra offsets
const sectionOffsets = { service: 60 };

// Handle nav links: smooth scroll + close menu
document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.slice(1);
            const extra = sectionOffsets[targetId] || 20;
            scrollToSection(targetId, extra);
        }
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

// Make "Заказать демонстрацию" button scroll to #demo
const navDemoBtn = document.querySelector('#navMenu .btn.btn-outline');
if (navDemoBtn) {
    navDemoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection('demo', 20);
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
}

// Form submission handlers
document.getElementById('demoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    try {
        const response = await fetch('/demo-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification(result.message, 'success');
            this.reset();
        } else {
            showNotification('Произошла ошибка. Попробуйте еще раз.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Произошла ошибка. Попробуйте еще раз.', 'error');
    }
});

document.getElementById('auditForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    try {
        const response = await fetch('/audit-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showNotification(result.message, 'success');
            this.reset();
        } else {
            showNotification('Произошла ошибка. Попробуйте еще раз.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Произошла ошибка. Попробуйте еще раз.', 'error');
    }
});

// File upload validation
document.getElementById('audioFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file) {
        if (!allowedTypes.includes(file.type)) {
            showNotification('Пожалуйста, выберите файл в формате MP3 или WAV.', 'error');
            this.value = '';
            return;
        }
        if (file.size > maxSize) {
            showNotification('Размер файла не должен превышать 50MB.', 'error');
            this.value = '';
            return;
        }
        showNotification('Файл успешно загружен!', 'success');
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 8px;
        color: white; font-weight: 500; z-index: 10000; transform: translateX(100%);
        transition: transform 0.3s ease; max-width: 300px;`;
    switch (type) {
        case 'success': notification.style.background = '#28a745'; break;
        case 'error': notification.style.background = '#dc3545'; break;
        case 'warning': notification.style.background = '#ffc107'; notification.style.color = '#212529'; break;
        default: notification.style.background = '#17a2b8';
    }
    document.body.appendChild(notification);
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => { document.body.removeChild(notification); }, 300);
    }, 5000);
}

// Optimized Intersection Observer for reveal animations
const observerOptions = { threshold: 0.05, rootMargin: '0px 0px -20px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Hero video
    const heroVideo = document.querySelector('.hero-visual video.lazy-video');
    if (heroVideo) {
        heroVideo.addEventListener('canplay', () => { heroVideo.classList.add('loaded'); }, { once: true });
        heroVideo.play().catch(() => {});
    }
    // Animate elements
    const animatedElements = document.querySelectorAll('.feature-card, .service-feature, .platform-feature, .metric-card, .form');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        observer.observe(el);
    });
    // Lazy videos
    const lazyVideos = document.querySelectorAll('video.lazy-video:not(.hero-visual video)');
    if (lazyVideos.length > 0) {
        const videoLoader = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    const source = video.querySelector('source');
                    if (source && source.dataset.src && !source.src) {
                        source.src = source.dataset.src;
                        video.load();
                        video.addEventListener('canplay', () => { video.classList.add('loaded'); }, { once: true });
                        video.play().catch(() => {});
                    }
                    videoLoader.unobserve(video);
                }
            });
        }, { threshold: 0.1 });
        lazyVideos.forEach(v => videoLoader.observe(v));
    }
});

// Header scroll effect with throttling for better performance
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'var(--white)';
                header.style.backdropFilter = 'none';
            }
            ticking = false;
        });
        ticking = true;
    }
}); 