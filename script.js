const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.parentElement.offsetHeight;

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン';
const matrix = letters.split('');

const fontSize = 14;
const columns = canvas.width / fontSize;

const drops = [];
for (let x = 0; x < columns; x++) {
    drops[x] = 1; 
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#22c55e'; 
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = matrix[Math.floor(Math.random() * matrix.length)];
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
const observerOptions = {
    root: null,
    rootMargin: '0px', 
    threshold: 0.15
};
const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const hiddenElements = document.querySelectorAll('.reveal-hidden');
    hiddenElements.forEach((el) => scrollObserver.observe(el));
});

// --- TERMINAL BOOT PRELOADER ---
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const bootLog = document.getElementById('boot-log');
    const loadingBar = document.getElementById('loading-bar');
    const percentageText = document.getElementById('loading-percentage');

    // The text sequence that will "type" out
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
            
                setTimeout(() => {
                    preloader.remove();
                }, 700); 
            }, 500);
        }
    }
    runBootSequence();
});