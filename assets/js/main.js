// Guluzada Studio - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (icon) { // If using FontAwesome/Iconify
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // 2. Dark Mode Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    // Check localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        if (icon) icon.className = 'fas fa-moon'; // Show moon icon for dark mode switch
    } else {
        body.removeAttribute('data-theme'); // Default to dark
        if (icon) icon.className = 'fas fa-sun'; // Show sun icon for light mode switch
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = body.getAttribute('data-theme') === 'light';
            
            if (isLight) {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                if (icon) icon.className = 'fas fa-sun';
            } else {
                body.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if (icon) icon.className = 'fas fa-moon';
            }
        });
    }

    // 3. Scroll Animations (Fade In Up)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => observer.observe(el));

    // 4. Contact Form Validation
    // 4. Contact Form Validation & EmailJS
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const inputs = contactForm.querySelectorAll('input, select, textarea');
            let isValid = true;
            
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = 'var(--color-border)';
                }
            });

            if (!isValid) {
                alert('Please fill in all required fields.'); // Debugging: feedback on validation
                return;
            }

            if (isValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;

                // Loading State
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                // Send Email
                console.log('Attempting to send email...'); // Debug
                if (typeof CONFIG === 'undefined') {
                    console.error('CONFIG is missing! Cannot send email.');
                    alert('Configuration error. Please contact the administrator.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                emailjs.sendForm(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, this)
                    .then(function() {
                        console.log('Email sent successfully'); // Debug
                        // Success Message
                        let successMsg = contactForm.querySelector('.success-message');
                        if (!successMsg) {
                            successMsg = document.createElement('div');
                            successMsg.className = 'success-message';
                            successMsg.style.color = 'var(--color-accent)';
                            successMsg.style.marginTop = '1rem';
                            successMsg.style.fontWeight = 'bold';
                            contactForm.appendChild(successMsg);
                        }
                        
                        successMsg.textContent = "Thanks for reaching out! We'll be in touch shortly.";
                        contactForm.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        alert('Message Sent Successfully!'); // Explicit Success Alert
                        
                        // Remove message after 5 seconds
                        setTimeout(() => {
                            if (successMsg) successMsg.remove();
                        }, 5000);

                    }, function(error) {
                        console.error('EmailJS Error:', error);
                        // Detailed error alert
                        alert('Failed to send message: ' + JSON.stringify(error)); 
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    });
            }
        });
    }
    
    // 5. Active Link Highlighting
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-link');
    
    navItems.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '/' && linkPath === 'index.html') || (currentPath.endsWith('/') && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // 6. Hero Parallax Effect
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroGlow = document.querySelector('.hero-bg-glow');

    if (hero && heroContent && heroGlow) {
        let rafId = null;
        
        hero.addEventListener('mousemove', (e) => {
             if (rafId) return;

             rafId = requestAnimationFrame(() => {
                const x = (window.innerWidth - e.pageX * 2) / 100;
                const y = (window.innerHeight - e.pageY * 2) / 100;

                // Disable transition during movement to prevent flickering (fight between CSS transition and JS frame update)
                heroContent.style.transition = 'none';
                heroGlow.style.transition = 'none';

                heroContent.style.transform = `translateY(${y * 0.5}px)`; 
                heroGlow.style.transform = `translate(${x * 2}px, ${y * 2}px)`; 
                
                rafId = null;
             });
        });
        
        // Reset on mouse leave
        hero.addEventListener('mouseleave', () => {
             if (rafId) {
                 cancelAnimationFrame(rafId);
                 rafId = null;
             }
             
             // Restore transition for smooth return
             heroContent.style.transition = 'transform 0.5s ease';
             heroGlow.style.transition = 'transform 0.5s ease';
             
             heroContent.style.transform = 'translateY(0)';
             heroGlow.style.transform = 'translate(0, 0)';
             
             // Clean up inline transition after it finishes to return to stylesheet defaults (optional but good practice)
             setTimeout(() => {
                 heroContent.style.transition = '';
                 heroGlow.style.transition = '';
             }, 500);
        });
    }

    // 7. Preloader Logic (Existing)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Check if already shown in this session
        const hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader');
        
        if (hasSeenPreloader) {
            preloader.style.display = 'none';
            document.body.style.overflow = ''; // Failsafe: Ensure scroll is enabled
        } else {
            // First time, play animation
            // Disable scroll
            document.body.style.overflow = 'hidden';
            
            // Wait for animations to finish (approx 2s total for premium feel)
            setTimeout(() => {
                preloader.classList.add('hidden'); // Triggers slide up
                setTimeout(() => {
                    document.body.style.overflow = ''; // Re-enable scroll after slide
                }, 800); // Wait for CSS transition (0.8s)
                sessionStorage.setItem('hasSeenPreloader', 'true');
            }, 2400); // Extended slightly for the pulse effect
        }
    }

    // 8. Premium Features Initialization
    


    // B. Magnetic Buttons - Removed per user request

    // C. Page Transitions
    const transitionOverlay = document.querySelector('.page-transition');
    if (transitionOverlay) {
        // Handle internal links
        document.querySelectorAll('a').forEach(link => {
            if (link.hostname === window.location.hostname && 
                link.getAttribute('href').indexOf('#') === -1 &&
                link.getAttribute('target') !== '_blank') {
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = link.getAttribute('href');

                    // Animate overlay up
                    if (typeof gsap !== 'undefined') {
                        gsap.to(transitionOverlay, {
                            duration: 0.6,
                            y: '0%',
                            ease: 'power3.inOut',
                            onComplete: () => {
                                window.location.href = target;
                            }
                        });
                    } else {
                        // Fallback
                        window.location.href = target;
                    }
                });
            }
        });

        // Animate overlay away on load
        if (typeof gsap !== 'undefined') {
            gsap.set(transitionOverlay, { y: '0%' });
            gsap.to(transitionOverlay, {
                duration: 0.8,
                y: '-100%',
                ease: 'power3.inOut',
                delay: 0.2
            });
        }
    }

    // D. Particles.js Configuration
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#6366f1" }, // Primary color
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": true },
                "size": { "value": 3, "random": true },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#6366f1",
                    "opacity": 0.1,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 0.4 } }
                }
            },
            "retina_detect": true
        });
    }
    // NUCLEAR FAILSAFE: Ensure scrolling is enabled no matter what
    setTimeout(() => {
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('overflow');
        document.body.style.overflowY = 'visible';
        document.documentElement.style.overflowY = 'visible';
    }, 1000); 

    // 9. Language Configuration
    const langToggle = document.getElementById('lang-toggle');
    const langToggleMobile = document.getElementById('lang-toggle-mobile'); // For mobile menu if needed

    function setLanguage(lang) {
        if (typeof translations === 'undefined') return;
        
        // Update Content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        // Update Button Text
        if (langToggle) {
             langToggle.innerHTML = lang === 'en' ? 'AZ' : 'EN'; // Show the OTHER option
             langToggle.setAttribute('aria-label', lang === 'en' ? 'Switch to Azerbaijani' : 'Switch to English');
        }

        // Save Preference
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    }

    // Initialize
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    // Event Listeners
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const currentLang = localStorage.getItem('language') || 'en';
            const newLang = currentLang === 'en' ? 'az' : 'en';
            setLanguage(newLang);
        });
    }

});
