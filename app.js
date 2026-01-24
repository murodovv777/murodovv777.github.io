// Portfolio JavaScript

// --- Telegram contact configuration (client-side) ---
const TELEGRAM_BOT_TOKEN = '8439590858:AAGRQKTzLsSiBllOgTr_SK2Jrjo-i11fh3Q'; // bot token (embedded client-side - insecure)
const TELEGRAM_CHAT_ID  = '7140946566'; // numeric chat id where messages will be sent
// ---------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavbar();
    initSmoothScrolling();
    initScrollAnimations();
    initDownloadCV();
    initContactForm();
    initMobileMenu();
});

// Sticky Navbar
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Add sticky class on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink();
    });

    // Set initial active link
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`.nav-link[href*=${sectionId}]`).classList.add('active');
        } else {
            document.querySelector(`.nav-link[href*=${sectionId}]`).classList.remove('active');
        }
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }

            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    document.querySelectorAll('.section, .skill-item, .achievement-card, .project-card').forEach(el => {
        observer.observe(el);
    });
}

// Download CV Functionality
function initDownloadCV() {
    const downloadBtn = document.getElementById('download-cv-btn');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Create a simple CV content
            const cvContent = `CURRICULUM VITAE

[Your Full Name]
[Your Profession/Title]

CONTACT INFORMATION
Email: [Your Email]
Phone: [Your Phone]
Location: [Your Location]
Website: [Your Website]

PROFESSIONAL SUMMARY
[Write a brief professional summary highlighting your key strengths and experience]

PROFESSIONAL EXPERIENCE

[Job Title]
[Company Name] | [Start Date] - [End Date]
• [Key responsibility/achievement 1]
• [Key responsibility/achievement 2]
• [Key responsibility/achievement 3]

[Previous Job Title]
[Previous Company Name] | [Start Date] - [End Date]
• [Key responsibility/achievement 1]
• [Key responsibility/achievement 2]

EDUCATION

[Degree/Program]
[Institution Name] | [Graduation Date]
[GPA/Additional details]

[Previous Degree]
[Institution Name] | [Graduation Date]

SKILLS
• [Skill 1]
• [Skill 2]
• [Skill 3]
• [Skill 4]
• [Skill 5]

CERTIFICATIONS
• [Certification 1] - [Issuing Organization] ([Date])
• [Certification 2] - [Issuing Organization] ([Date])

LANGUAGES
• [Language 1] - [Proficiency Level]
• [Language 2] - [Proficiency Level]
`;

            // Create and download the file
            const blob = new Blob([cvContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '[Your Name]_CV.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
}

// Helper: escape HTML for safe Telegram HTML parse_mode
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Contact Form Handling (updated to send message via Telegram bot)
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Simple form validation
            if (!data.name || !data.email || !data.subject || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^s@]+@[^s@]+\.[^s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Warn if token/chat not configured (should be set above)
            if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
                alert('Telegram bot configuration is missing. Please configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.');
                return;
            }

            // Prepare message text (HTML)
            const messageText =
                `<b>New portfolio message</b>\n` +
                `<b>Name:</b> ${escapeHtml(data.name)}\n` +
                `<b>Email:</b> ${escapeHtml(data.email)}\n` +
                `<b>Subject:</b> ${escapeHtml(data.subject)}\n` +
                `<b>Message:</b>\n${escapeHtml(data.message)}`;

            const apiUrl = `https://api.telegram.org/bot${encodeURIComponent(TELEGRAM_BOT_TOKEN)}/sendMessage`;

            try {
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: messageText,
                        parse_mode: 'HTML'
                    })
                });

                const json = await res.json();

                if (res.ok && json.ok) {
                    alert('Thank you! Your message was sent via Telegram.');
                    this.reset();
                } else {
                    console.error('Telegram API error', json);
                    alert('Failed to send message via Telegram. Please check console for details.');
                }
            } catch (err) {
                console.error('Network error sending to Telegram', err);
                alert('Network error while sending message. Please try again later.');
            }
        });
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');

    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');

    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');

    // Animate hamburger menu
    const bars = document.querySelectorAll('.bar');
    if (navMenu.classList.contains('active')) {
        bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    }
}

// Typing Animation for Hero Title (Optional enhancement)
function initTypingAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    const text = heroTitle.textContent;
    heroTitle.textContent = '';

    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, 100);
}

// Add some interactive hover effects
function initHoverEffects() {
    // Add hover effect to skill items
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add hover effect to achievement cards
    document.querySelectorAll('.achievement-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotate(1deg)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0deg)';
        });
    });
}

// Initialize additional effects
document.addEventListener('DOMContentLoaded', function() {
    initHoverEffects();

    // Add loading animation
});