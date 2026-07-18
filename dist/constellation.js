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
    
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const scale = Math.min(cw, ch) / 45;
    const cx = cw / 2;
    const cy = ch / 2 - 20;

    for (let i = 0; i < TOTAL_STARS; i++) {
        // Calculate the parameter t for the heart equation
        // We want a full loop from 0 to 2PI. 
        // We offset it so the first point is at the top cleft and draws downwards.
        let t = (i / TOTAL_STARS) * Math.PI * 2;
        
        // Parametric Heart Equation
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)); // negative because y goes down in screen space
        
        let targetX = cx + hx * scale;
        let targetY = cy + hy * scale;

        // Start them in the shape of an 'S'
        let R = Math.min(cw, ch) * 0.16; // Radius for the arcs
        let sx, sy;
        let yOffset = 50; 
        
        // Use a continuous parameter 'p' from 0 to 1 across the total 540 degree sweep
        // This ensures perfectly even spacing across both arcs and prevents overlapping stars
        let p = i / 17;
        let angleInSweep = p * 540; 
        
        if (angleInSweep <= 240) {
            // Top Arc: 240 degree sweep, starting at -30 deg going counter-clockwise
            let deg = -30 - angleInSweep;
            let rad = deg * Math.PI / 180;
            sx = cx + Math.cos(rad) * R;
            sy = (cy - R) + Math.sin(rad) * R;
        } else {
            // Bottom Arc: 300 degree sweep, starting at -90 deg going clockwise
            let excess = angleInSweep - 240;
            let deg = -90 + excess;
            let rad = deg * Math.PI / 180;
            sx = cx + Math.cos(rad) * R;
            sy = (cy + R) + Math.sin(rad) * R;
        }
        
        sy += yOffset; // Apply offset to clear the heading text

        // Almost zero jitter so the curves stay perfectly clean
        let startX = sx + (Math.random() - 0.5) * 6;
        let startY = sy + (Math.random() - 0.5) * 6;

        const starEl = document.createElement('div');
        starEl.className = 'c-star';
        // Add actual star shape
        starEl.innerHTML = `<svg viewBox="0 0 24 24" class="star-icon"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        
        // Position them at their random start positions
        gsap.set(starEl, { x: startX, y: startY });
        
        starContainer.appendChild(starEl);

        const starObj = { el: starEl, targetX, targetY, startX, startY, ignited: false };
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
    // Hide the prompt - must remove animation so opacity takes effect
    promptEl.style.animation = 'none';
    promptEl.style.opacity = 0;
    
    // Play a final sweeping chord
    setTimeout(() => {
        for(let i=0; i<6; i++) {
            setTimeout(() => playChime(i * 2 + 3), i * 150);
        }
    }, 1000);

    // 1. Move all stars to their heart formation smoothly
    stars.forEach((s, i) => {
        gsap.to(s.el, {
            x: s.targetX,
            y: s.targetY,
            duration: 2.5,
            ease: "power3.inOut",
            delay: 0.5 // small dramatic pause before they move
        });
    });

    // 2. Build the SVG path that forms the heart
    let d = `M ${stars[0].targetX} ${stars[0].targetY} `;
    for(let i=1; i<TOTAL_STARS; i++) {
        d += `L ${stars[i].targetX} ${stars[i].targetY} `;
    }
    d += 'Z'; // Close the heart

    constPath.setAttribute('d', d);
    
    // Calculate path length for the drawing animation
    const pathLength = constPath.getTotalLength();
    gsap.set(constPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

    // 3. Animate the line drawing, tracing the heart
    gsap.to(constPath, {
        strokeDashoffset: 0,
        duration: 3,
        ease: "power2.inOut",
        delay: 3 // Start drawing after they finish moving into position
    });

    // 4. The Cinematic Shift (Translate the heart to the left)
    const isMobile = window.innerWidth < 768;
    const shiftX = isMobile ? 0 : -window.innerWidth * 0.25;
    const shiftY = isMobile ? -window.innerHeight * 0.2 : 0;
    const scaleDown = isMobile ? 0.6 : 0.7;
    
    gsap.to([starContainer, svgContainer], {
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

    // 6. Hold for reading, then transition seamlessly
    gsap.delayedCall(11, () => {
        // Start the next scene (Envelope) underneath
        if (typeof window.go === 'function') window.go(2);
        else if (typeof go === 'function') go(2);
        
        // Force constellation page to stay visible above the new page
        gsap.set('#constellationPage', { display: 'flex', zIndex: 999 });
        
        // Slowly fade it out for a cinematic crossfade
        gsap.to('#constellationPage', {
            opacity: 0,
            duration: 2.0,
            ease: "power2.inOut",
            onComplete: () => {
                // Cleanup and reset
                gsap.set('#constellationPage', { display: '', zIndex: '', opacity: 1 });
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
