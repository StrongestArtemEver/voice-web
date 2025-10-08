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
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = section.offsetTop - headerHeight - extraOffset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    } else {
        console.error('Section not found:', sectionId);
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

// Make "Начать бесплатно" button scroll to #contact
const navStartBtn = document.getElementById('navStartBtn');
if (navStartBtn) {
    navStartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection('contact', 20);
        if (navMenu) {
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
}

// Form type switcher
document.querySelectorAll('.form-type-option').forEach(option => {
    option.addEventListener('click', function() {
        const formType = this.dataset.type;
        const radioInput = this.querySelector('input[type="radio"]');
        
        // Update active state
        document.querySelectorAll('.form-type-option').forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        radioInput.checked = true;
        
        // Toggle fields
        const auditFields = document.getElementById('auditFields');
        const demoFields = document.getElementById('demoFields');
        const submitBtn = document.getElementById('submitBtn');
        const formNote = document.getElementById('formNote');
        const audioFile = document.getElementById('audioFile');
        const company = document.getElementById('company');
        const callVolume = document.getElementById('callVolume');
        
        if (formType === 'audit') {
            auditFields.style.display = 'block';
            demoFields.style.display = 'none';
            submitBtn.textContent = 'Получить анализ за 24 часа';
            formNote.textContent = 'Отчёт придёт на email в течение 24 часов';
            if (audioFile) audioFile.setAttribute('required', '');
            if (company) company.removeAttribute('required');
            if (callVolume) callVolume.removeAttribute('required');
        } else {
            auditFields.style.display = 'none';
            demoFields.style.display = 'block';
            submitBtn.textContent = 'Записаться на демо';
            formNote.textContent = 'Перезвоним в течение 2 часов';
            if (audioFile) audioFile.removeAttribute('required');
            if (company) company.setAttribute('required', '');
            if (callVolume) callVolume.setAttribute('required', '');
        }
    });
});

// Unified form submission
document.getElementById('unifiedForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formType = document.querySelector('input[name="formType"]:checked').value;
    const formData = new FormData(this);
    
    try {
        let response;
        if (formType === 'audit') {
            // Send as multipart for file upload
            response = await fetch('/api/send-audit', {
                method: 'POST',
                body: formData
            });
        } else {
            // Send as JSON for demo
            const data = Object.fromEntries(formData);
            // Очистка от ненужных полей
            delete data.audio;
            delete data.formType;
            
            response = await fetch('/api/send-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        if (result.ok) {
            const message = formType === 'audit' ? 
                'Файл отправлен! Отчёт придёт в течение 24 часов' : 
                'Заявка принята! Перезвоним в течение 2 часов';
            showNotification(message, 'success');
            
            // Analytics tracking
            const eventName = formType === 'audit' ? 'audit_form_submit' : 'demo_form_submit';
            const eventLabel = formType === 'audit' ? 'Бесплатный анализ' : 'Запись на демо';
            
            // Google Analytics 4
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    'event_category': 'Form',
                    'event_label': eventLabel,
                    'value': 1
                });
            }
            
            // Yandex.Metrika
            if (typeof ym !== 'undefined' && window.YM_COUNTER_ID) {
                ym(window.YM_COUNTER_ID, 'reachGoal', eventName);
            }
            
            this.reset();
            // Reset file label
            const fileLabel = document.getElementById('fileLabel');
            if (fileLabel) fileLabel.textContent = 'Загрузите звонок (MP3/WAV, до 50 МБ)';
        } else {
            showNotification('Ошибка отправки. Проверьте данные и попробуйте снова.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Ошибка сети. Попробуйте еще раз.', 'error');
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
    // Hero buttons - alternative to onclick
    const demoBtn = document.querySelector('.hero-buttons .btn-primary');
    const auditBtn = document.querySelector('.hero-buttons .btn-secondary');
    
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Analytics: CTA button click
            if (typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    'event_category': 'Button',
                    'event_label': 'Hero - Получить анализ',
                    'value': 1
                });
            }
            if (typeof ym !== 'undefined' && window.YM_COUNTER_ID) {
                ym(window.YM_COUNTER_ID, 'reachGoal', 'hero_cta_audit');
            }
            
            scrollToSection('contact');
        });
    }
    
    if (auditBtn) {
        auditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Analytics: Demo button click
            if (typeof gtag !== 'undefined') {
                gtag('event', 'demo_click', {
                    'event_category': 'Button',
                    'event_label': 'Hero - Смотреть демо',
                    'value': 1
                });
            }
            if (typeof ym !== 'undefined' && window.YM_COUNTER_ID) {
                ym(window.YM_COUNTER_ID, 'reachGoal', 'hero_demo_view');
            }
            
            scrollToSection('demo-video');
        });
    }
    
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
                    const container = video.closest('.demo-video-container');
                    const poster = container ? container.querySelector('.video-poster') : null;
                    
                    // Обработчик клика по постеру для загрузки видео
                    if (poster && !poster.dataset.clickHandlerAdded) {
                        poster.dataset.clickHandlerAdded = 'true';
                        poster.addEventListener('click', () => {
                            const source = video.querySelector('source');
                            if (source && source.dataset.src && !source.src) {
                                // Показать loader
                                if (container) container.classList.add('loading');
                                
                                // Загрузить видео
                                source.src = source.dataset.src;
                                video.load();
                                
                                video.addEventListener('canplay', () => { 
                                    video.classList.add('loaded');
                                    if (container) container.classList.remove('loading');
                                    // Автоматически начать воспроизведение после загрузки
                                    video.play().catch(() => {});
                                }, { once: true });
                            }
                        });
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

// FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Close other open items
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
            }
        });
        // Toggle current item
        item.classList.toggle('active');
    });
});

// File upload label update
const audioFileInput = document.getElementById('audioFile');
if (audioFileInput) {
    audioFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const fileLabel = document.getElementById('fileLabel');
        const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        
        if (file) {
            if (!allowedTypes.includes(file.type)) {
                showNotification('Пожалуйста, выберите файл в формате MP3 или WAV.', 'error');
                this.value = '';
                if (fileLabel) fileLabel.textContent = 'Загрузите звонок (MP3/WAV, до 50 МБ)';
                return;
            }
            if (file.size > maxSize) {
                showNotification('Размер файла не должен превышать 50MB.', 'error');
                this.value = '';
                if (fileLabel) fileLabel.textContent = 'Загрузите звонок (MP3/WAV, до 50 МБ)';
                return;
            }
            if (fileLabel) {
                fileLabel.textContent = `✓ ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} МБ)`;
            }
            showNotification('Файл готов к отправке!', 'success');
        }
    });
} 
