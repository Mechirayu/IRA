/* ===== CINEMATIC TITLE CARD & SEQUENCE PLAYER ===== */
// 1. Text Animation Choreography
if (document.getElementById('welcomePage').classList.contains('active')) {
    const tl = gsap.timeline();
    tl.to('#wel1, #wel2', { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }, 1.0)
      .to('#wel3', { opacity: 1, duration: 1.5, ease: 'power2.out' }, 2.5)
      .to('#wel4, #wel5', { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }, 4.0);
}

// 2. Press & Hold Interaction Logic
const holdBtn = document.getElementById('wel5');
const holdHeart = document.getElementById('holdHeart');
let holdTimer;
let holdStartTime;
let isHolding = false;

function startHold(e) {
    if (e.type === 'touchstart') e.preventDefault(); // prevent long press menu
    if (isHolding) return;
    isHolding = true;
    holdHeart.classList.remove('heartbeat-idle');
    holdHeart.classList.add('heartbeat-fast');
    
    // Haptic feedback loop for Android
    if (navigator.vibrate) navigator.vibrate(50);
    const hapticInterval = setInterval(() => {
        if(isHolding && navigator.vibrate) navigator.vibrate(50);
    }, 200);

    holdStartTime = Date.now();
    holdTimer = setTimeout(() => {
        clearInterval(hapticInterval);
        triggerBurst();
    }, 2000); // 2 second hold
}

function stopHold() {
    if (!isHolding) return;
    isHolding = false;
    clearTimeout(holdTimer);
    holdHeart.classList.remove('heartbeat-fast');
    holdHeart.classList.add('heartbeat-idle');
}

if (holdBtn) {
    holdBtn.addEventListener('mousedown', startHold);
    holdBtn.addEventListener('touchstart', startHold, { passive: false });
    window.addEventListener('mouseup', stopHold);
    window.addEventListener('touchend', stopHold);
}

function triggerBurst() {
    isHolding = false;
    
    // Audio Check (Fade in Volume)
    const bgMusic = document.getElementById('bg-music');
    const mB = document.getElementById('musicBtn');
    const mL = document.getElementById('musicLabel');
    if(bgMusic.paused) {
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
            mB.classList.add('playing');
            mL.textContent = 'Pause';
            gsap.to(bgMusic, { volume: 0.4, duration: 3, ease: 'power1.inOut' });
        }).catch(e => console.log('Audio autoplay prevented'));
    }

    // Hide UI
    gsap.to('#welcomePage', { 
        opacity: 0, 
        duration: 0.5,
        onComplete: () => {
            const wp = document.getElementById('welcomePage');
            if(wp) {
                wp.style.display = 'none';
                wp.style.pointerEvents = 'none';
            }
        }
    });

    // Start Canvas Physics
    startFloralPhysics();
}

function startFloralPhysics() {
    const canvas = document.getElementById('floralCanvas');
    canvas.style.opacity = '1';
    const ctx = canvas.getContext('2d');
    let cw = canvas.width = window.innerWidth;
    let ch = canvas.height = window.innerHeight;

    // Fix "Stuck" Issue: Procedurally draw a beautiful vector rose petal instead of relying on external URLs
    const petalCanvas = document.createElement('canvas');
    petalCanvas.width = 40;
    petalCanvas.height = 40;
    const pCtx = petalCanvas.getContext('2d');
    
    // Draw a curved petal shape
    pCtx.translate(20, 20);
    pCtx.rotate(Math.PI / 4);
    const grad = pCtx.createLinearGradient(-15, -15, 15, 15);
    grad.addColorStop(0, '#ff0a33');
    grad.addColorStop(1, '#7a0014');
    pCtx.fillStyle = grad;
    pCtx.beginPath();
    pCtx.moveTo(0, -15);
    pCtx.bezierCurveTo(15, -15, 15, 15, 0, 15);
    pCtx.bezierCurveTo(-15, 15, -15, -15, 0, -15);
    pCtx.fill();

    // Cache Blurred Versions for Depth of Field
    const caches = {
        sharp: createPetalCache(petalCanvas, 0, 0.6),
        blurMid: createPetalCache(petalCanvas, 3, 1.2),
        blurHeavy: createPetalCache(petalCanvas, 8, 3.0)
    };

    function createPetalCache(img, blur, scale) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        const w = img.width * scale;
        const h = img.height * scale;
        const pad = blur * 2 + 10;
        offCanvas.width = w + pad * 2;
        offCanvas.height = h + pad * 2;
        offCtx.filter = `blur(${blur}px)`;
        offCtx.drawImage(img, pad, pad, w, h);
        return { cvs: offCanvas, pad: pad };
    }

    let petals = [];
    let isWiping = false;

    // Phase 1: 360 Burst
    for(let i=0; i<200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 5;
        petals.push({
            cache: caches.sharp,
            x: cw / 2,
            y: ch / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            scale: Math.random() * 0.5 + 0.5,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() * 0.2 - 0.1),
            type: 'burst',
            life: 1.0
        });
    }

    // Phase 2: Slow Falling Curtain (Depth of Field)
    setTimeout(() => {
        isWiping = true;
        const types = [
            { count: 100, cache: caches.sharp, sizeRange: [0.3, 0.6], speedY: [3, 6], z: 'bg' },
            { count: 60, cache: caches.blurMid, sizeRange: [0.8, 1.2], speedY: [6, 12], z: 'mid' },
            { count: 15, cache: caches.blurHeavy, sizeRange: [1.5, 2.5], speedY: [15, 25], z: 'fg' }
        ];

        types.forEach(t => {
            for(let i=0; i<t.count; i++) {
                petals.push({
                    cache: t.cache,
                    x: Math.random() * cw,
                    y: -50 - Math.random() * 400, // spawn them just above the screen so they appear instantly!
                    vx: Math.random() * 2 - 1,
                    vy: Math.random() * (t.speedY[1] - t.speedY[0]) + t.speedY[0],
                    scale: Math.random() * (t.sizeRange[1] - t.sizeRange[0]) + t.sizeRange[0],
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() * 0.1 - 0.05),
                    type: 'fall',
                    z: t.z
                });
            }
        });

        // Fail-safe: Force the next screen to start loading after 1.5 seconds regardless of falling speed
        setTimeout(() => {
            if (!sequenceStarted) {
                sequenceStarted = true;
                if (typeof window.go === 'function') window.go(1);
                else if (typeof go === 'function') go(1);
            }
        }, 1500);

    }, 800); // Trigger falling petals 0.8s after burst

    let frameReq;
    let sequenceStarted = false;

    function loop() {
        ctx.clearRect(0, 0, cw, ch);
        let wipeFallen = 0;
        let totalWipe = 0;
        
        for (let i = petals.length - 1; i >= 0; i--) {
            let p = petals[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotSpeed;

            if (p.type === 'burst') {
                p.vy += 0.2; // gravity
                p.vx *= 0.96; // friction
                p.life -= 0.02;
                if (p.life <= 0) {
                    petals.splice(i, 1);
                    continue;
                }
                ctx.globalAlpha = Math.max(0, p.life);
            } else {
                // Falling wipe logic
                ctx.globalAlpha = 1;
                totalWipe++;
                // Add gentle wind sway
                p.vx += Math.sin(p.y * 0.01) * 0.05; 
                p.vx *= 0.95; 

                if (p.y > ch + 200) {
                    wipeFallen++;
                }
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(p.scale, p.scale);
            const imgW = p.cache.cvs.width;
            const imgH = p.cache.cvs.height;
            ctx.drawImage(p.cache.cvs, -imgW/2, -imgH/2);
            ctx.restore();
        }

        // Handoff to Sequence
        if (isWiping && totalWipe > 0) {
            // Reveal the next page once petals cover the screen
            if (wipeFallen > 10 && !sequenceStarted) {
                sequenceStarted = true;
                if (typeof window.go === 'function') window.go(1);
                else if (typeof go === 'function') go(1);
            }

            // End transition when all falling petals pass the screen
            if (wipeFallen >= totalWipe) {
                cancelAnimationFrame(frameReq);
                canvas.style.opacity = '0';
                setTimeout(() => {
                    canvas.style.display = 'none';
                    // Reset welcome opacity in case of back nav
                    gsap.set('#welcomePage', { opacity: 1 });
                }, 300);
                return;
            }
        }

        frameReq = requestAnimationFrame(loop);
    }
    loop();
}

window.startCinematicIntro = function() {}; // stub to prevent reference errors if old button was clicked
