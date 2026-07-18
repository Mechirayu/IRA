const constellationPage = document.getElementById('constellationPage');
const starContainer = document.getElementById('starContainer');
const svgContainer = document.getElementById('constellationSvg');
const promptEl = document.getElementById('constellationPrompt');
const flashEl = document.getElementById('constellationFlash');

let audioCtx = null;
let stars = [];
let clickedCount = 0;
const TOTAL_STARS = 18;

// Create an SVG gradient for the connecting lines
svgContainer.innerHTML = `
  <defs>
    <linearGradient id="constGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFC2D2" />
      <stop offset="50%" stop-color="#FF7E9D" />
      <stop offset="100%" stop-color="#E8C07D" />
    </linearGradient>
  </defs>
  <path id="constPath" class="const-line" />
`;
const constPath = document.getElementById('constPath');

// Audio Context Synthesizer for magical chimes
function playChime(index) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Pentatonic scale frequencies for a magical harp-like sound
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    const baseFreq = scale[index % scale.length] * (1 + Math.floor(index / scale.length) * 0.5);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 1.5);
}

// Generate the 18 points of the heart
function initConstellation() {
    starContainer.innerHTML = '';
    stars = [];
    clickedCount = 0;
    promptEl.innerText = `Tap to light up these 18 stars, representing 18 beautiful chapters of your life. (0/${TOTAL_STARS})`;
    constPath.setAttribute('d', '');
    
    const cw = 500;
    const ch = 500;
    const scale = Math.min(cw, ch) / 45;
    const cx = cw / 2;
    const cy = ch / 2 - 20;

    // Perfectly spaced 't' values to prevent clustering at the cleft/bottom
    const heartT = [
        0, 0.3, 0.6, 0.9, 1.25, 1.57, 1.95, 2.35, 2.75, // Right side
        Math.PI, // Bottom
        3.53, 3.93, 4.33, 4.71, 5.03, 5.38, 5.68, 5.98 // Left side
    ];

    for (let i = 0; i < TOTAL_STARS; i++) {
        let t = heartT[i];
        
        // Parametric Heart Equation
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)); 
        
        let targetX = cx + hx * scale;
        let targetY = cy + hy * scale;

        // Start them in the shape of an 'S'
        let R = Math.min(cw, ch) * 0.16; 
        let sx, sy;
        let yOffset = 50; 
        
        let p = i / 17;
        let angleInSweep = p * 540; 
        
        if (angleInSweep <= 240) {
            let deg = -30 - angleInSweep;
            let rad = deg * Math.PI / 180;
            sx = cx + Math.cos(rad) * R;
            sy = (cy - R) + Math.sin(rad) * R;
        } else {
            let excess = angleInSweep - 240;
            let deg = -90 + excess;
            let rad = deg * Math.PI / 180;
            sx = cx + Math.cos(rad) * R;
            sy = (cy + R) + Math.sin(rad) * R;
        }
        
        sy += yOffset; 

        // Almost zero jitter so the curves stay perfectly clean
        let startX = sx + (Math.random() - 0.5) * 6;
        let startY = sy + (Math.random() - 0.5) * 6;

        const starEl = document.createElement('div');
        starEl.className = 'c-star';
        // Add actual star shape
        starEl.innerHTML = `<svg viewBox="0 0 24 24" class="star-icon"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        
        let startPctX = (startX / cw) * 100;
        let startPctY = (startY / ch) * 100;
        let targetPctX = (targetX / cw) * 100;
        let targetPctY = (targetY / ch) * 100;

        // Position them using percentage for responsive scaling
        gsap.set(starEl, { left: startPctX + '%', top: startPctY + '%' });
        
        starContainer.appendChild(starEl);

        const starObj = { el: starEl, targetPctX, targetPctY, startPctX, startPctY, ignited: false };
        stars.push(starObj);

        // Click interaction
        starEl.addEventListener('click', () => {
            if (starObj.ignited || clickedCount >= TOTAL_STARS) return;
            starObj.ignited = true;
            clickedCount++;
            starEl.classList.add('ignited');
            playChime(clickedCount - 1);
            promptEl.innerText = `Tap to light up these 18 stars, representing 18 beautiful chapters of your life. (${clickedCount}/${TOTAL_STARS})`;

            if (clickedCount === TOTAL_STARS) {
                climaxConstellation();
            }
        });
    }
}

function climaxConstellation() {
    // Hide the prompt
    promptEl.style.animation = 'none';
    promptEl.style.opacity = 0;
    
    // Play a final sweeping chord
    setTimeout(() => {
        for(let i=0; i<6; i++) {
            setTimeout(() => playChime(i * 2 + 3), i * 150);
        }
    }, 1000);

    // 1. Move all stars to their heart formation smoothly with a stagger
    stars.forEach((s, i) => {
        gsap.to(s.el, {
            left: s.targetPctX + '%',
            top: s.targetPctY + '%',
            duration: 3,
            ease: "power2.inOut",
            delay: 0.5 + (i * 0.04) // Buttery smooth staggered wave effect
        });
    });

    // 2. Build the SVG path that forms a PERFECT smooth heart (100 points)
    const cw = 500;
    const ch = 500;
    const scale = Math.min(cw, ch) / 45;
    const cx = cw / 2;
    const cy = ch / 2 - 20;

    let d = '';
    for(let i = 0; i <= 100; i++) {
        let t = (i / 100) * Math.PI * 2;
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        let px = cx + hx * scale;
        let py = cy + hy * scale;
        if (i === 0) d += `M ${px} ${py} `;
        else d += `L ${px} ${py} `;
    }
    d += 'Z'; // Close the perfect heart

    constPath.setAttribute('d', d);
    
    // Calculate path length for the drawing animation
    const pathLength = constPath.getTotalLength();
    gsap.set(constPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

    // 3. Animate the line drawing, tracing the heart
    gsap.to(constPath, {
        strokeDashoffset: 0,
        duration: 2.5,
        ease: "power2.inOut",
        delay: 3 // Start drawing just as stars settle
    });

    // 4. The Cinematic Shift (Translate the heart to the left)
    const isMobile = window.innerWidth < 768;
    const shiftX = isMobile ? 0 : -window.innerWidth * 0.25;
    const shiftY = isMobile ? -window.innerHeight * 0.2 : 0;
    const scaleDown = isMobile ? 0.6 : 0.7;
    
    gsap.to('.constellation-wrapper', {
        x: shiftX,
        y: shiftY,
        scale: scaleDown,
        transformOrigin: "center center",
        duration: 2.5,
        delay: 6.5,
        ease: "power2.inOut"
    });

    // 5. Fade in the romantic message (Cinematic Word-by-Word Reveal)
    const msgEl = document.getElementById('constellationMessage');
    
    // Split the text into individual span elements for staggered animation
    if (!msgEl.dataset.split) {
        const words = msgEl.innerText.split(' ');
        msgEl.innerHTML = words.map(w => `<span class="msg-word" style="display:inline-block; opacity:0; filter:blur(8px); transform:translateY(15px); margin-right: 8px;">${w}</span>`).join('');
        msgEl.dataset.split = "true";
    }
    
    // Show the container immediately, but let the words animate in
    gsap.set(msgEl, { opacity: 1 });

    // Staggered reveal for each word
    gsap.to('.msg-word', {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 1.5,
        stagger: 0.12, // 120ms delay between each word
        delay: 7.5, // Start as soon as the heart shifts
        ease: "power2.out"
    });

    // 6. Hold for reading, then transition sequentially
    gsap.delayedCall(11, () => {
        // Fade out completely before initializing the next scene
        gsap.to('#constellationPage', {
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                // Total cleanup of current scene GSAP
                gsap.killTweensOf('#constellationPage');
                gsap.killTweensOf('.c-prompt');
                gsap.killTweensOf('.v-prompt');
                
                // Hide current scene completely from DOM layout
                gsap.set('#constellationPage', { display: 'none', zIndex: '-1', opacity: 0, pointerEvents: 'none' });
                document.getElementById('constellationPage').classList.remove('active');

                // ONLY THEN initialize the next scene
                if (typeof window.go === 'function') window.go(2);
                else if (typeof go === 'function') go(2);
            }
        });
    });
}

// Re-initialize if window is resized (to prevent weird off-center hearts)
window.addEventListener('resize', () => {
    if (clickedCount < TOTAL_STARS && constellationPage.classList.contains('active')) {
        // Only redraw if we haven't finished the interaction
        initConstellation();
    }
});

// To hook it into the navigation system:
// We need to call initConstellation() when go(1) is triggered.
// Since script.js handles page transitions, we can monkey-patch or listen.
document.addEventListener('DOMContentLoaded', () => {
    // Override the go() function in script.js to inject initialization
    if (typeof window.go === 'function') {
        const originalGo = window.go;
        window.go = function(idx) {
            originalGo(idx);
            if (idx === 1) {
                initConstellation();
            }
        };
    }
});
