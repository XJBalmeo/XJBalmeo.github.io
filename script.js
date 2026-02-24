document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. TERMINAL BOOT PRELOADER
    // ==========================================
    const preloader = document.getElementById('preloader');
    const bootLog = document.getElementById('boot-log');
    const loadingBar = document.getElementById('loading-bar');
    const percentageText = document.getElementById('loading-percentage');

    if (preloader && bootLog && loadingBar && percentageText) {
        const bootSequence = [
            "kernel: initializing...",
            "mounting virtual drives... [OK]",
            "loading logic_gates.sys...",
            "compiling java_swing_environment...",
            "establishing secure connection...",
            "USER IDENTIFIED: XEON_JAMIR_BALMEO",
            "access granted."
        ];

        let step = 0;

        function runBootSequence() {
            if (step < bootSequence.length) {
                const newLine = document.createElement('p');
                newLine.innerText = '> ' + bootSequence[step];
                bootLog.appendChild(newLine);

                const progress = Math.floor(((step + 1) / bootSequence.length) * 100);
                loadingBar.style.width = progress + '%';
                percentageText.innerText = progress + '%';

                step++;
                const randomDelay = Math.floor(Math.random() * 250) + 150;
                setTimeout(runBootSequence, randomDelay);
            } else {
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    setTimeout(() => preloader.remove(), 700); 
                }, 500);
            }
        }
        runBootSequence();
    }

    // ==========================================
    // 2. INFINITE TYPING LOOP
    // ==========================================
    const typeTarget = document.getElementById('typewriter-text');
    
    if (typeTarget) {
        const phrases = [
            "2nd-Year CS Student.",
            "Java Developer.",
            "Python Developer.",
            "Data Scientist.",
            "Web Developer.",
            "Video Gamer."
        ];
        
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeLoop() {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }

            typeTarget.innerText = currentPhrase.substring(0, charIndex);

            let typingSpeed = isDeleting ? 50 : 100; 

            if (!isDeleting && charIndex === currentPhrase.length) {
                typingSpeed = 2000; 
                isDeleting = true; // <-- THE MISSING LINE! This triggers the backspace.
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length; 
                typingSpeed = 500; 
            }

            setTimeout(typeLoop, typingSpeed);
        }
        setTimeout(typeLoop, 3500); 
    }

    // ==========================================
    // 3. MATRIX RAIN BACKGROUND
    // ==========================================
    const canvas = document.getElementById('matrix-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン'.split('');
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#22c55e'; 
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        setInterval(drawMatrix, 33);

        window.addEventListener('resize', () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        });
    }

    // ==========================================
    // 4. SCROLL RADAR (INTERSECTION OBSERVER)
    // ==========================================
    const hiddenElements = document.querySelectorAll('.reveal-hidden');
    if (hiddenElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, { threshold: 0.15 });

        hiddenElements.forEach((el) => scrollObserver.observe(el));
    }
});