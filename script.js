document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. FUTURISTIC PORTAL PRELOADER
    // ==========================================
    const preloader = document.getElementById('preloader');
    const nameContainer = document.getElementById('loading-name');
    const portalFlash = document.getElementById('portal-flash');

    if (preloader && nameContainer && portalFlash) {
        const myName = "XEON BALMEO";
        const letters = myName.split("");
        
        nameContainer.innerHTML = letters.map(char => {
            if (char === " ") return `<span class="w-4 md:w-8"></span>`; 
            return `<span class="opacity-0 text-gray-900 transition-all duration-300">${char}</span>`;
        }).join("");

        const spanElements = nameContainer.querySelectorAll('span:not(.w-4)'); 
        let delay = 0;
        
        spanElements.forEach((span) => {
            setTimeout(() => {
                span.classList.remove('opacity-0', 'text-gray-900');
                span.classList.add('opacity-100', 'text-green-400');
                span.style.textShadow = "0 0 10px #22c55e, 0 0 20px #22c55e, 0 0 40px #22c55e";
            }, delay);
            delay += 150;
        });

        const totalLightingTime = delay + 500; 

        setTimeout(() => {
            portalFlash.classList.remove('opacity-0');
            portalFlash.classList.add('opacity-30'); 
            
            setTimeout(() => {
                portalFlash.classList.remove('opacity-30');
                portalFlash.classList.add('opacity-0');
                
                nameContainer.style.transform = "scale(30)";
                nameContainer.style.opacity = "0";
                nameContainer.style.filter = "blur(10px)";
                
                preloader.style.opacity = "0";
                
                setTimeout(() => {
                    preloader.remove();
                }, 1000); 
                
            }, 150); 
            
        }, totalLightingTime);
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

    // ==========================================
    // 5. DYNAMIC REVIEWS MARQUEE
    // ==========================================
    
    const reviewTrack = document.getElementById('review-track');
    if (reviewTrack) {
        const reviewsData = [
            {
                name: "Nathanielle Paz",
                role: "Colossal Titan",
                img: "images/nath.jpg",
                stars: 3,
                text: "> Solid yang tropa ko. 10/10."
            },
            {
                name: "JM Castillo",
                role: "Dormie",
                img: "images/jm.jpg",
                stars: 4,
                text: "> Halimaw sa kama yan"
            },
            {
                name: "Gab Evaristo",
                role: "The Joker",
                img: "images/gab.png",
                stars: 5,
                text: "> magaling yang hayop nayan. Katulong ko yan gumawa ng Roblox game, nag-AI lang."
            }
        ];

    function createCardHTML(review) {
            let starHTML = '';
            for (let i = 0; i < 5; i++) {
                starHTML += `<i class="fa-${i < review.stars ? 'solid' : 'regular'} fa-star"></i>`;
            }

        return `
            <div class="w-[500px] max-w-[90vw] h-full flex-shrink-0 flex items-start gap-6 bg-black/80 p-8 mx-4 border border-green-900 rounded-lg hover:border-green-500 transition-colors duration-300 backdrop-blur-md">
                <div class="flex-shrink-0">
                    <img src="${review.img}" alt="${review.name}" class="w-20 h-20 rounded-full border-2 border-green-800 object-cover brightness-90">
                </div>
                <div class="flex flex-col justify-center">
                    <h4 class="text-green-400 font-bold text-xl">${review.name}</h4>
                    <span class="text-green-800 text-xs uppercase tracking-wider font-mono mb-2">${review.role}</span>
                    <div class="flex text-green-500 text-xs mb-3 gap-1">${starHTML}</div>
                    <p class="text-green-600/90 text-base font-mono leading-relaxed">${review.text}</p>
                </div>
            </div>`;
        }

        const baseTrack = [...reviewsData, ...reviewsData, ...reviewsData, ...reviewsData];
        const seamlessTrack = [...baseTrack, ...baseTrack];
        reviewTrack.innerHTML = seamlessTrack.map(createCardHTML).join('');
    }