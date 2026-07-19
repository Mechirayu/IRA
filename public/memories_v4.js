// ─────────────────────────────────────────────────────────
// MEMORY CONFIG — single source of truth
// Landscape: 1920×860 (ratio ≈ 2.23:1) | Portrait: 860×1920
// ─────────────────────────────────────────────────────────
const MEMORY_CONFIG = {
    1:  { video: "video-snaps/VN20260717_033554.mp4", frame: "landscape" },
    2:  { video: "video-snaps/VN20260717_033929.mp4", frame: "landscape" },
    3:  { video: "video-snaps/VN20260717_034038.mp4", frame: "landscape" },
    4:  { video: "video-snaps/VN20260717_034318.mp4?v=99", frame: "portrait"  },
    5:  { video: "video-snaps/VN20260717_034652.mp4", frame: "landscape" },
    6:  { video: "video-snaps/VN20260717_035013.mp4", frame: "landscape" },
    7:  { video: "video-snaps/VN20260717_035258.mp4", frame: "landscape" },
    8:  { video: "video-snaps/VN20260717_042216.mp4?v=99", frame: "portrait"  },
    9:  { video: "video-snaps/VN20260717_042620.mp4", frame: "landscape" },
    10: { video: "video-snaps/VN20260717_042713.mp4", frame: "landscape" },
    11: { video: "video-snaps/VN20260717_042805.mp4", frame: "landscape" },
    12: { video: "video-snaps/VN20260717_042933.mp4", frame: "landscape" },
    13: { video: "video-snaps/VN20260717_043042.mp4", frame: "landscape" },
    14: { video: "video-snaps/VN20260717_043156.mp4", frame: "landscape" },
    15: { video: "video-snaps/VN20260717_043319.mp4", frame: "landscape" },
    16: { video: "video-snaps/VN20260717_043613.mp4", frame: "landscape" },
    17: { video: "video-snaps/VN20260717_043722.mp4", frame: "landscape" },
    18: { video: "video-snaps/VN20260717_120339.mp4", frame: "landscape" },
};

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
let openedCount = 0;

// ─────────────────────────────────────────────────────────
// ENVELOPE CLONE POOL — prevents GC spikes
// ─────────────────────────────────────────────────────────
const EnvelopeClonePool = {
    pool: [],
    acquire(original) {
        const clone = this.pool.length > 0 ? this.pool.pop() : original.cloneNode(true);
        clone.innerHTML = original.innerHTML;
        return clone;
    },
    release(clone) {
        if (clone.parentNode) clone.parentNode.removeChild(clone);
        clone.style.cssText = '';
        clone.className = 'mini-envelope';
        this.pool.push(clone);
    }
};

// ─────────────────────────────────────────────────────────
// MEDIA MANAGER — AssetLoader Integration
// ─────────────────────────────────────────────────────────
const MediaManager = {
    init() {
        console.log('[MediaManager] Eagerly queueing media for background load...');
        for (let i = 1; i <= Object.keys(MEMORY_CONFIG).length; i++) {
            const mem = MEMORY_CONFIG[i];
            const id = mem.video || mem.image;
            if (mem.video) {
                window.AssetLoader.loadAsset(id, id, 'video');
            } else if (mem.image) {
                window.AssetLoader.loadAsset(id, id, 'image');
            }
        }
    },

    get(memKey) {
        const k   = typeof memKey === 'number' ? memKey : Number(memKey);
        const mem = MEMORY_CONFIG[k];
        const id  = mem.video || mem.image;
        
        return { src: id, isVid: !!mem.video, frame: mem.frame };
    },
};

// ─────────────────────────────────────────────────────────
// INIT MEMORIES PAGE
// ─────────────────────────────────────────────────────────
function initMemories() {
    const bigEnvelope   = document.getElementById('bigEnvelopeContainer');
    const beFrontLayer  = document.getElementById('beFrontLayer');
    const beBackLayer   = document.getElementById('beBackLayer');
    const desk          = document.getElementById('memoriesDesk');
    const prompt        = document.getElementById('bePrompt');
    const collectorHeart = document.getElementById('collectorHeart');

    desk.innerHTML = '';
    openedCount = 0;
    gsap.killTweensOf('*');
    gsap.set(bigEnvelope, { opacity: 0, scale: 0.8 });
    gsap.set([beFrontLayer, beBackLayer], { opacity: 1, y: 0, rotation: 0, scale: 1 });
    gsap.set(prompt, { opacity: 0 });
    gsap.set(collectorHeart, { opacity: 0, scale: 0, pointerEvents: 'none' });
    collectorHeart.onclick = null;
    bigEnvelope.style.pointerEvents = 'auto';

    gsap.fromTo(bigEnvelope,
        { opacity: 0, scale: 0.5, y: 500 },
        {
            opacity: 1, scale: 1, y: 0, duration: 1.5, ease: 'back.out(1)', delay: 0.5,
            onComplete: () => {
                gsap.to(bigEnvelope, { scale: 1.04, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
            }
        }
    );
    gsap.to(prompt, { opacity: 1, duration: 1, delay: 1.5 });

    bigEnvelope.onclick = () => {
        bigEnvelope.onclick = null;
        bigEnvelope.style.pointerEvents = 'none';
        gsap.killTweensOf(bigEnvelope);
        gsap.killTweensOf(prompt);
        prompt.style.display = 'none';

        playSnapSound();

        gsap.to(beFrontLayer, { y: '100vh', rotation: -25, opacity: 0, duration: 1.2, ease: 'power2.in' });
        gsap.to(beBackLayer,  { y: '100vh', rotation: 15,  opacity: 0, duration: 1.5, delay: 0.1, ease: 'power2.in' });

        const headingBlock = document.getElementById('memoriesHeadingBlock');
        gsap.to(headingBlock, { opacity: 1, y: 10, duration: 2, delay: 0.5 });

        triggerScatterExplosion();
    };
}

// ─────────────────────────────────────────────────────────
// SCATTER EXPLOSION + GRID BUILD
// ─────────────────────────────────────────────────────────
async function triggerScatterExplosion() {
    const desk = document.getElementById('memoriesDesk');

    // Build the grid immediately
    Object.values(MEMORY_CONFIG).forEach((memory, index) => {
        const memKey = index + 1;
        const env = document.createElement('div');
        env.className = 'mini-envelope';

        env.innerHTML = `
            <svg viewBox="0 0 400 250" style="width:100%;height:100%;position:absolute;inset:0;pointer-events:none;">
                <rect x="10" y="10" width="380" height="230" rx="15" fill="#ff6699" stroke="#800020" stroke-width="8"/>
                <path d="M 10,25 L 170,140 L 10,235 Z" fill="#ff3377" stroke="#800020" stroke-width="8" stroke-linejoin="round"/>
                <path d="M 390,25 L 230,140 L 390,235 Z" fill="#ff3377" stroke="#800020" stroke-width="8" stroke-linejoin="round"/>
                <path d="M 10,235 L 200,100 L 390,235 Z" fill="#ff4d88" stroke="#800020" stroke-width="8" stroke-linejoin="round"/>
                <path d="M 10,15 L 200,150 L 390,15 Z" fill="#ff80a6" stroke="#800020" stroke-width="8" stroke-linejoin="round"/>
                <path d="M 200,165 C 200,165 170,140 170,115 C 170,95 195,95 200,115 C 205,95 230,95 230,115 C 230,140 200,165 200,165 Z" fill="#ff1a53" stroke="#800020" stroke-width="6" stroke-linejoin="round"/>
            </svg>
        `;

        const num = document.createElement('div');
        num.className = 'me-num';
        num.innerText = memKey;
        env.appendChild(num);

        const randomRot = (Math.random() * 14) - 7;
        gsap.set(env, { rotation: randomRot, opacity: 0 });
        desk.appendChild(env);

        env.addEventListener('click', async () => {
            if (window.activePolaroid || env.isAnimating) return;
            env.isAnimating = true;
            window.activePolaroid = true;

            const rect = env.getBoundingClientRect();
            const clone = EnvelopeClonePool.acquire(env);
            clone.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;opacity:1;`;

            const rot = gsap.getProperty(env, 'rotation') || 0;
            gsap.set(clone, { rotation: rot, transformOrigin: 'center center' });

            const animLayer = document.getElementById('animation-layer') || document.body;
            animLayer.appendChild(clone);
            env.classList.add('is-opening');

            // Tap feedback
            await gsap.to(clone, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });

            // Fly to center
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = cx - (rect.left + rect.width / 2);
            const dy = cy - (rect.top + rect.height / 2);
            await gsap.to(clone, { x: dx, y: dy, rotation: 0, scale: 2.5, duration: 0.4, ease: 'power2.out' });

            // Get media (instant — cached or fallback URL)
            const mediaObj = MediaManager.get(memKey);

            if (!env.classList.contains('opened')) {
                env.classList.add('opened');
                openedCount++;
            }

            const backdrop = document.getElementById('polaroidBackdrop');
            backdrop.style.opacity  = '1';
            backdrop.style.pointerEvents = 'auto';

            openPolaroidStrict(mediaObj, env, memKey, clone, rot);
        });
    });

    // Kick off background preloading AFTER grid is built
    MediaManager.init();

    // Scatter intro animation
    requestAnimationFrame(() => {
        const animLayer = document.getElementById('animation-layer') || document.body;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const envs = desk.querySelectorAll('.mini-envelope');

        envs.forEach((env, i) => {
            const rect = env.getBoundingClientRect();
            const clone = EnvelopeClonePool.acquire(env);
            clone.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;opacity:1;`;
            const rot = gsap.getProperty(env, 'rotation') || 0;
            const dx = cx - (rect.left + rect.width / 2);
            const dy = cy - (rect.top + rect.height / 2);
            animLayer.appendChild(clone);

            gsap.fromTo(clone,
                { x: dx, y: dy, scale: 0, rotation: Math.random() * 360 },
                {
                    x: 0, y: 0, scale: 1, rotation: rot,
                    duration: 0.7 + Math.random() * 0.3,
                    delay: i * 0.06,
                    ease: 'back.out(1.2)',
                    onComplete: () => {
                        EnvelopeClonePool.release(clone);
                        gsap.set(env, { opacity: 1 });
                    }
                }
            );
        });
    });

    createBurstingHearts(desk, desk.getBoundingClientRect());
}

// ─────────────────────────────────────────────────────────
// OPEN POLAROID — rock-solid mobile video lifecycle
// ─────────────────────────────────────────────────────────
function openPolaroidStrict(mediaObj, envElement, memKey, cloneElement, originalRot) {
    // Use overlay-root (position:fixed) for reliable full-viewport centering
    const overlayRoot = document.getElementById('overlay-root') || document.body;
    const backdrop    = document.getElementById('polaroidBackdrop');
    const isVid       = mediaObj.isVid;
    const frame       = mediaObj.frame; // 'landscape' or 'portrait'

    // ── Build wrapper ──────────────────────────────────────
    const wrapper = document.createElement('div');
    wrapper.className = 'mem-modal-wrapper';

    // ── Build frame ────────────────────────────────────────
    const frameEl = document.createElement('div');
    frameEl.className = `mem-video-frame ${frame}`;
    wrapper.appendChild(frameEl);

    // ── Build close button ─────────────────────────────────
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mem-close-btn';
    closeBtn.setAttribute('aria-label', 'Close memory');
    closeBtn.innerHTML = '✕';
    wrapper.appendChild(closeBtn);

    // Spinner shown while loading
    const spinner = document.createElement('div');
    spinner.className = 'mem-spinner';
    spinner.innerHTML = '❤️';
    frameEl.appendChild(spinner);

    // ── Build media element asynchronously ────────────────────────────────
    let mediaEl;

    window.AssetLoader.loadAsset(mediaObj.src, mediaObj.src, isVid ? 'video' : 'image').then(loadedEl => {
        if (spinner) spinner.style.display = 'none';
        
        mediaEl = loadedEl.cloneNode();
        if (isVid) {
            mediaEl.src = loadedEl.src;
            mediaEl.muted       = true;
            mediaEl.loop        = true;
            mediaEl.playsInline = true;
            mediaEl.className   = 'mem-media';
            frameEl.appendChild(mediaEl);

            if (mediaEl.readyState >= 1) {
                try { mediaEl.play(); } catch(e) {}
            }
            if (mediaEl.readyState === 0) {
                mediaEl.load();
                mediaEl.play();
            }
        } else {
            mediaEl.className = 'mem-media';
            frameEl.appendChild(mediaEl);
            
            gsap.fromTo(mediaEl,
                { opacity: 0, filter: 'blur(8px)' },
                { opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', delay: 0.1 }
            );
        }
    });

    // ── Add to DOM and animate in ──────────────────────────
    document.body.classList.add('is-paused-background');
    gsap.set(wrapper, { opacity: 0, scale: 0.85 });
    document.body.appendChild(wrapper);  // Use document.body to avoid nested fixed positioning issues

    gsap.to(cloneElement, { opacity: 0, duration: 0.15 });
    gsap.to(wrapper, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.2)' });

    if (!isVid) playSnapSound();

    // ── Close logic ────────────────────────────────────────
    let closed = false;
    const closeIt = () => {
        if (closed) return;
        closed = true;

        document.body.classList.remove('is-paused-background');
        backdrop.style.opacity      = '0';
        backdrop.style.pointerEvents = 'none';

        gsap.to(wrapper, {
            opacity: 0, scale: 0.85, duration: 0.2,
            onComplete: () => {
                if (isVid) {
                    mediaEl.pause();
                    // IMPORTANT: Do NOT reset src or destroy the element! 
                    // Simply remove it from the DOM. 
                    // MediaManager holds the reference, so it will instantly play next time!
                    mediaEl.remove();
                }
                wrapper.remove();

                gsap.set(cloneElement, { opacity: 1 });
                gsap.to(cloneElement, {
                    x: 0, y: 0, scale: 1, rotation: originalRot,
                    duration: 0.4, ease: 'power2.out',
                    onComplete: () => {
                        EnvelopeClonePool.release(cloneElement);
                        envElement.classList.remove('is-opening');
                        envElement.isAnimating = false;
                        window.activePolaroid  = false;
                        checkAllOpened();
                    }
                });
            }
        });
    };

    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeIt(); });
    backdrop.onclick = closeIt;
    // Tap anywhere on the frame (outside video) also closes
    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) closeIt();
    });
}

// ─────────────────────────────────────────────────────────
// BURSTING HEARTS
// ─────────────────────────────────────────────────────────
function createBurstingHearts(container) {
    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `position:absolute;left:50%;top:50%;font-size:${Math.random()*20+20}px;pointer-events:none;z-index:150;transform:translate(-50%,-50%) scale(0)`;
        container.appendChild(heart);
        const angle = Math.random() * Math.PI * 2;
        const v     = Math.random() * 150 + 100;
        gsap.to(heart, {
            x: Math.cos(angle) * v,
            y: Math.sin(angle) * v - 100,
            scale: 1, opacity: 0,
            rotation: Math.random() * 90 - 45,
            duration: 1.5 + Math.random(),
            ease: 'power2.out',
            onComplete: () => heart.remove()
        });
    }
}

// ─────────────────────────────────────────────────────────
// CHECK ALL OPENED
// ─────────────────────────────────────────────────────────
function checkAllOpened() {
    if (openedCount < Object.keys(MEMORY_CONFIG).length) return;

    const ch = document.getElementById('collectorHeart');
    ch.style.pointerEvents = 'auto';
    gsap.set(ch, { xPercent: -50, yPercent: -50, scale: 0 });
    gsap.to(ch, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, duration: 1, delay: 0.5, ease: 'back.out(1.5)' });
    gsap.to(ch, { scale: 1.15, xPercent: -50, yPercent: -50, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.5 });

    ch.onclick = () => {
        ch.onclick = null;
        ch.style.pointerEvents = 'none';
        gsap.killTweensOf(ch);
        gsap.to('#chText', { opacity: 0, duration: 0.3 });

        const polaroids = document.querySelectorAll('.mem-modal-wrapper');
        polaroids.forEach((p, i) => {
            gsap.killTweensOf(p);
            gsap.to(p, { x: 0, y: 0, rotation: '+=' + (Math.random() * 180 - 90), scale: 0, opacity: 0, duration: 0.8, delay: i * 0.05, ease: 'power2.in' });
        });

        const totalSuckTime = 0.8 + (polaroids.length * 0.05);
        setTimeout(() => {
            gsap.to(ch, {
                scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut',
                onComplete: () => {
                    gsap.set(ch, { opacity: 0, scale: 0 });
                    const particleCount = 50;
                    const colors = ['#ff0a33', '#ff6699', '#ffcc00', '#ffd700', '#ffffff'];
                    const frag   = document.createDocumentFragment();
                    const parts  = [];
                    for (let i = 0; i < particleCount; i++) {
                        const p = document.createElement('div');
                        p.className = 'burst-particle';
                        const sz  = Math.random() * 8 + 4;
                        p.style.cssText = `width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]};left:50%;top:50%;transform:translate(-50%,-50%)`;
                        frag.appendChild(p);
                        parts.push(p);
                    }
                    document.body.appendChild(frag);
                    parts.forEach(p => {
                        const a = Math.random() * Math.PI * 2;
                        const v = Math.random() * window.innerWidth * 0.8 + 100;
                        gsap.to(p, { x: Math.cos(a)*v, y: Math.sin(a)*v, scale: Math.random()*4+1, opacity: 0, duration: 0.8+Math.random()*0.4, ease: 'power3.out', force3D: true, onComplete: () => p.remove() });
                    });
                    setTimeout(() => { if (typeof go === 'function') go(3); }, 300);
                }
            });
        }, totalSuckTime * 1000);
    };
}

// ─────────────────────────────────────────────────────────
// SNAP SOUND
// ─────────────────────────────────────────────────────────
function playSnapSound() {
    try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const len  = ctx.sampleRate * 0.1;
        const buf  = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.02));
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass'; f.frequency.value = 2000;
        src.connect(f); f.connect(ctx.destination);
        src.start();
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
        g.gain.setValueAtTime(1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
}

// ─────────────────────────────────────────────────────────
// RESIZE HANDLER
// ─────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    if (!document.getElementById('memoriesPage')?.classList.contains('active')) return;
    // Nothing to reposition — modal is flex-centered via CSS
});
