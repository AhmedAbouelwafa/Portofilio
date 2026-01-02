document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
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

        // Update trail color immediately
        updateTrailColor();
    });

    // --- Mobile Menu ---
    // (Simplistic implementation)
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileBtn.addEventListener('click', () => {
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


    // --- Mouse Effects ---
    const cursorGlow = document.getElementById('cursor-glow');
    const canvas = document.getElementById('trail-canvas');
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;

    let points = [];
    let mouse = { x: 0, y: 0 };

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });
    resizeObserver.observe(document.body);

    // Initial size
    canvas.width = width;
    canvas.height = height;

    // Track mouse
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Move Glow
        // Use requestAnimationFrame for smoother DOM updates if needed, 
        // but direct style update is usually fine for simple transforms
        cursorGlow.style.left = `${mouse.x}px`;
        cursorGlow.style.top = `${mouse.y}px`;

        // Add point to trail
        points.push({
            x: mouse.x,
            y: mouse.y,
            age: 0
        });
    });

    let trailColor = 'rgba(99, 102, 241, 0.5)'; // Default Primary

    function updateTrailColor() {
        const computedStyle = getComputedStyle(document.body);
        // We can grab the primary color variable
        // However, converting it to RGB for canvas might be tricky if it's hex
        // Let's just switch based on class
        if (document.body.classList.contains('light-mode')) {
            trailColor = 'rgba(79, 70, 229, 0.5)'; // Indigo 600
        } else {
            trailColor = 'rgba(99, 102, 241, 0.5)'; // Indigo 500
        }
    }

    updateTrailColor();

    function animateTrail() {
        ctx.clearRect(0, 0, width, height);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                // Draw quadratic curve for smoothness
                // const xc = (points[i].x + points[i + 1].x) / 2;
                // const yc = (points[i].y + points[i + 1].y) / 2;
                // ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);

                // Simple line for now
                ctx.lineTo(points[i].x, points[i].y);
            }
            // stroke whole path? No, we need fading segments. 
            // Actually drawing segments individually allows varying opacity.
        }

        // approach 2: Draw individual segments to handle fading
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            // Calculate opacity based on age
            // Max age = 50 frames
            const opacity = 1 - (p1.age / 40);

            if (opacity <= 0) continue;

            ctx.strokeStyle = trailColor.replace('0.5)', `${opacity})`).replace('1)', `${opacity})`);
            ctx.lineWidth = 3 * opacity; // shrink width too
            ctx.stroke();
        }

        // Update points
        for (let i = 0; i < points.length; i++) {
            points[i].age++;
        }

        // Remove old points
        points = points.filter(p => p.age < 40);

        requestAnimationFrame(animateTrail);
    }

    animateTrail();

    // --- Scroll Progress Button ---
    const progressPath = document.querySelector('.progress-wrap path');
    const pathLength = progressPath.getTotalLength();

    progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
    progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

    const updateProgress = function () {
        const scroll = window.scrollY || window.pageYOffset;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = pathLength - (scroll * pathLength / height);
        progressPath.style.strokeDashoffset = progress;
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress);

    const offset = 50;
    const duration = 550;

    window.addEventListener('scroll', function () {
        if (window.scrollY > offset) {
            document.querySelector('.progress-wrap').classList.add('active-progress');
        } else {
            document.querySelector('.progress-wrap').classList.remove('active-progress');
        }
    });

    document.querySelector('.progress-wrap').addEventListener('click', function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
    });

    // --- Smooth Scroll & Click Animation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault(); // Prevent default instant jump

            // Add animation if it's a nav link
            if (this.closest('.nav-links')) {
                this.classList.add('click-anim');
                setTimeout(() => {
                    this.classList.remove('click-anim');
                }, 300);
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const startPosition = window.pageYOffset;
                const offsetPosition = elementPosition + startPosition - headerOffset;
                const distance = offsetPosition - startPosition;

                let startTime = null;
                const duration = 1000;

                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const run = ease(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }

                function ease(t, b, c, d) {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t * t + b;
                    t -= 2;
                    return c / 2 * (t * t * t + 2) + b;
                }

                requestAnimationFrame(animation);
            }
        });
    });

    // --- Scroll Reveal Logic ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));
});
