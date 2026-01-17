document.addEventListener('DOMContentLoaded', () => {

    // --- GSAP & ScrollTrigger Registration (if using ScrollTrigger, but we use IntersectionObserver mostly) ---
    // gsap.registerPlugin(ScrollTrigger); 

    // --- 1. THEME TOGGLE (Liquid Transition) ---
    // --- 1. THEME TOGGLE (Liquid Transition) ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeOverlay = document.getElementById('theme-transition-overlay');
    const icon = themeToggle.querySelector('i');

    // Init Theme
    const savedTheme = localStorage.getItem('theme');
    // Default to 'light' if no preference, or if explicitly 'light'
    if (!savedTheme || savedTheme === 'light') {
        body.classList.add('light-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        // Explicitly dark
        body.classList.remove('light-mode');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    themeToggle.addEventListener('click', (e) => {
        // Prevent multiple clicks during animation
        if (gsap.isTweening(themeOverlay)) return;

        // Get button position
        const rect = themeToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Determine Target Theme & Color
        const isCurrentlyLight = body.classList.contains('light-mode');
        // If currently Light (going Dark), overlay should be Dark (#0f172a)
        // If currently Dark (going Light), overlay should be Light (#f8fafc)
        const overlayColor = isCurrentlyLight ? '#0f172a' : '#f8fafc';

        themeOverlay.style.backgroundColor = overlayColor;

        const tl = gsap.timeline();

        // 1. Expand circle to cover screen
        tl.set(themeOverlay, {
            top: y,
            left: x,
            xPercent: -50,
            yPercent: -50,
            width: '1px',
            height: '1px',
            opacity: 1,
            scale: 1,
            borderRadius: '50%'
        })
            .to(themeOverlay, {
                scale: Math.max(window.innerWidth, window.innerHeight) * 2.5, // Ensure coverage
                duration: 1,
                ease: "circ.inOut", // Sharper feeling
            })
            .call(() => {
                // TOGGLE THEME AT MIDPOINT (Full Coverage)
                body.classList.toggle('light-mode');
                if (body.classList.contains('light-mode')) {
                    localStorage.setItem('theme', 'light');
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    localStorage.setItem('theme', 'dark');
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            })
            .to(themeOverlay, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out"
            })
            .set(themeOverlay, { scale: 0 }); // Reset
    });

    // --- 2. CUSTOM CURSOR (Smoother) ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    if (window.matchMedia("(pointer: fine)").matches) {

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Dot follows instantly (Native feel)
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        });

        // Outline uses a simple loop for buttery smooth lag
        // Using gsap.ticker for better performance than setInterval or recursive tween
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());

            const currentX = parseFloat(gsap.getProperty(cursorOutline, "x")) || 0;
            const currentY = parseFloat(gsap.getProperty(cursorOutline, "y")) || 0;

            const dx = mouseX - currentX;
            const dy = mouseY - currentY;

            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                gsap.set(cursorOutline, {
                    x: currentX + dx * 0.15, // 0.15 = lag factor
                    y: currentY + dy * 0.15
                });
            }
        });

        // Hover Effects
        const hoverTargets = document.querySelectorAll('a, button, .service-card, .glass-testimonial-card, .btn-icon, .theme-toggle-btn');

        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const isProject = el.classList.contains('service-card');
                cursorOutline.classList.add('cursor-hover');

                if (isProject) {
                    cursorOutline.classList.add('project-hover'); // Special class for text
                    cursorOutline.innerHTML = '<span class="cursor-text">VIEW</span>';
                } else {
                    cursorOutline.innerHTML = '';
                }
            });

            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('cursor-hover');
                cursorOutline.classList.remove('project-hover');
                cursorOutline.innerHTML = '';
            });
        });
    }


    // --- 3. ABOUT ME: VS CODE TYPEWRITER ---
    const aboutSection = document.getElementById('about');
    const codeContainer = document.getElementById('code-content-container');
    const sourceTemplate = document.getElementById('profile-cs-source');
    const runBtn = document.getElementById('run-profile-btn');
    const terminal = document.getElementById('about-terminal');
    const terminalContent = document.getElementById('about-terminal-content');

    let hasTyped = false;

    // Build the DOM from string, then type it
    function typeWriterEffect() {
        if (hasTyped) return;
        hasTyped = true;

        // Parse the HTML from template
        const wrapper = document.createElement('div');
        wrapper.innerHTML = sourceTemplate.innerHTML.trim();

        // Clear container
        codeContainer.innerHTML = '';

        const fullHTML = sourceTemplate.innerHTML;
        // Hacky but effective for "Code" look:
        // Hybrid: We will create the structure, hide text, type text.

        codeContainer.innerHTML = '';

        // Split by newlines (assuming the template is formatted with newlines)
        const rawLines = fullHTML.trim().split('\n');

        let lineIndex = 0;

        function typeLine() {
            if (lineIndex >= rawLines.length) return;

            const lineStr = rawLines[lineIndex].trim();
            const div = document.createElement('div');
            div.className = 'line indent'; // defaulting to indent for simplicity, or detect spacing

            div.innerHTML = lineStr; // Set full HTML
            div.style.opacity = 0;
            div.style.transform = 'translateY(5px)';
            codeContainer.appendChild(div);

            gsap.to(div, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                onComplete: () => {
                    lineIndex++;
                    setTimeout(typeLine, 100); // 100ms delay between lines
                }
            });
        }

        typeLine();
    }

    // Trigger on Scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeWriterEffect();
                observer.unobserve(aboutSection);
            }
        });
    }, { threshold: 0.3 });

    if (aboutSection) observer.observe(aboutSection);

    // Run Button Logic
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            terminal.classList.add('active');
            terminalContent.innerHTML = '';

            const log = (msg, cls = '') => {
                const div = document.createElement('div');
                div.className = `terminal-row ${cls}`;
                div.textContent = msg;
                terminalContent.appendChild(div);
                terminalContent.scrollTop = terminalContent.scrollHeight;
            };

            log('> dotnet run');

            setTimeout(() => {
                log('Build succeeded.', 'terminal-success');

                setTimeout(() => {
                    // The Output
                    const response = {
                        name: "Ahmed Abouelwafa",
                        title: "Full Stack .NET & Angular Developer",
                        location: "Cairo, Egypt",
                        status: "Open for Work",
                        quote: "Let's code something amazing together!"
                    };

                    const pre = document.createElement('pre');
                    pre.className = 'terminal-row terminal-success';
                    pre.style.fontFamily = 'monospace';
                    pre.textContent = JSON.stringify(response, null, 2);
                    terminalContent.appendChild(pre);
                    terminalContent.scrollTop = terminalContent.scrollHeight;

                }, 600);

            }, 600);
        });
    }


    // --- 4. PROJECT MODAL & DATA ---
    const projectsData = {
        "aseeralkotb": {
            title: "AseerElKotb - Bookstore App",
            tags: ["ASP.NET Core", "Angular", "Clean Architecture", "CQRS"],
            challenge: "Creating a scalable e-commerce platform that handles complex inventory management and integrates modern AI features for user engagement, all while maintaining high performance.",
            decision: "Chose Clean Architecture with CQRS to separate read/write concerns, improving scalability. Integrated OpenAI for RAG-based book recommendations to enhance user experience beyond simple search.",
            implementation: "Backend: .NET 8 Web API, MediatR, EF Core. Frontend: Angular 16+ with standalone components. Features include realtime notifications (SignalR) and secure payment gateway integration.",
            result: "Achieved a 40% improvement in query response times compared to traditional layered architecture. The AI recommendation system increased session duration by 25%.",
            github: "https://github.com/AhmedAbouelwafa/AseerElKotb",
            live: "https://aseeralkotb.vercel.app/"
        },
        "booking": {
            title: "Service Booking System",
            tags: [".NET 6", "Angular", "Scheduler", "Admin Panel"],
            challenge: "Businesses needed a flexible way to manage appointment slots, handle double-booking prevention, and manage staff schedules dynamically.",
            decision: "Implemented a custom scheduling algorithm rather than off-the-shelf libraries to allow for complex business rules (buffers, holidays, specific staff availability).",
            implementation: "Built a robust REST API for managing slots. Frontend uses a custom calendar component. Role-based auth (JWT) ensures secure admin access.",
            result: "Reduced booking conflicts to near zero. Simplified the administrative workflow, saving managers approx. 5 hours a week.",
            github: "https://github.com/AhmedAbouelwafa/ServiceBookingSystem",
            live: "#"
        },
        "jalabizo": {
            title: "JALABIZO - Fashion Store",
            tags: ["Full Stack", "AI Virtual Try-On", "E-Commerce"],
            challenge: "Online fashion suffers from high return rates due to fit issues. The goal was to provide a virtual try-on experience.",
            decision: "Leveraged generative AI models to overlay clothing items onto user-uploaded photos, providing a realistic preview.",
            implementation: "Integrated python-based AI microservices communicating with the .NET Core backend via message queues. Angular frontend handles image manipulation.",
            result: "Increased conversion rates and engaged users with the interactive try-on feature.",
            github: "https://github.com/AhmedAbouelwafa/JALABIZO",
            live: "#"
        },
        "ecompany": {
            title: "ECompanyHub",
            tags: ["Enterprise", "C#", "Backend"],
            challenge: "Managing disparate company data sources (HR, Inventory, Sales) in a unified system.",
            decision: "Focused on a centralized API gateway approach to aggregate data from various services.",
            implementation: "Pure Backend solution using C# and .NET Core, focusing on API performance, caching (Redis), and background jobs (Hangfire).",
            result: "Streamlined data access for external frontend clients and mobile apps.",
            github: "https://github.com/AhmedAbouelwafa/EcompanyHub_BackEnd",
            live: "#"
        },
        "huroof": {
            title: "Huroof Extension",
            tags: ["JavaScript", "Chrome Extension", "Productivity"],
            challenge: "Bilingual users often type in the wrong keyboard layout (e.g., typing Arabic when English is selected).",
            decision: "Created a pure client-side browser extension to map characters instantly without network calls for privacy and speed.",
            implementation: "DOM manipulation and Key event listeners. Smart mapping algorithm to convert 'ghl' to 'فعل' etc.",
            result: "500+ Active users. Saves users the frustration of re-typing messages.",
            github: "https://github.com/AhmedAbouelwafa/Huroof_Extension",
            live: "#"
        },
        "pcbundle": {
            title: "PCBundle Store",
            tags: ["HTML/CSS", "Vanilla JS", "Basics"],
            challenge: "Creating a lightweight, fast-loading store for hardware bundles without heavy framework overhead.",
            decision: "Opted for Vanilla JS and CSS to ensure maximum performance and learn core web fundamentals.",
            implementation: "Custom cart logic using LocalStorage. Responsive grid layout using CSS Grid.",
            result: "100/100 Google Lighthouse score for performance.",
            github: "https://github.com/AhmedAbouelwafa/PCBundle_Store",
            live: "#"
        }
    };

    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalTags = document.getElementById('modal-tags');
    const modalChallenge = document.getElementById('modal-challenge');
    const modalDecision = document.getElementById('modal-decision');
    const modalImplementation = document.getElementById('modal-implementation');
    const modalResult = document.getElementById('modal-result');
    const modalGithub = document.getElementById('modal-github-btn');
    const modalLive = document.getElementById('modal-live-btn');

    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = card.getAttribute('data-project-id');
            const data = projectsData[projectId];

            if (data) {
                // Populate Modal
                modalTitle.textContent = data.title;
                modalTags.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join('');
                modalChallenge.textContent = data.challenge;
                modalDecision.textContent = data.decision;
                modalImplementation.textContent = data.implementation;
                modalResult.textContent = data.result;

                modalGithub.href = data.github;
                if (data.live && data.live !== '#') {
                    modalLive.style.display = 'inline-flex';
                    modalLive.href = data.live;
                } else {
                    modalLive.style.display = 'none';
                }

                // Open Modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock Scroll
            }
        });
    });

    // Close Modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }


    // --- 5. SWIPER (Testimonials) ---
    if (document.querySelector('.testimonialSwiper')) {
        const swiper = new Swiper(".testimonialSwiper", {
            slidesPerView: 1,
            spaceBetween: 30,
            centeredSlides: true,
            loop: true,
            grabCursor: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40
                }
            },
            loop: true,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
        });
    }

    // --- 6. Original Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (observer) observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // --- 7. Mobile Menu ---
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'var(--bg-color)';
                navLinks.style.padding = '2rem';
                navLinks.style.borderBottom = '1px solid var(--border-color)';
            }
        });
    }

    // --- 8. Back to Top ---
    const progressWrap = document.getElementById('progress-wrap');
    if (progressWrap) {
        progressWrap.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                progressWrap.classList.add('active-progress');
            } else {
                progressWrap.classList.remove('active-progress');
            }
        });
    }

    // --- 9. WhatsApp Button & Chatbot ---
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const chatbotPopup = document.getElementById('chatbot-popup');
    const closeChatBtn = document.getElementById('close-chat');

    if (whatsappBtn && chatbotPopup) {
        whatsappBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatbotPopup.classList.toggle('active');
        });

        // Close on clicking X
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                chatbotPopup.classList.remove('active');
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!chatbotPopup.contains(e.target) && !whatsappBtn.contains(e.target)) {
                chatbotPopup.classList.remove('active');
            }
        });
    }
});
