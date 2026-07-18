// 18 Snaps and Notes
const memoriesData = [
    { video: "video-snaps/VN20260717_033554.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_033929.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_034038.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_034318.mp4", orientation: "portrait" }, // index 3
    { video: "video-snaps/VN20260717_034652.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_035013.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_035258.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_042216.mp4", orientation: "portrait" }, // index 7
    { video: "video-snaps/VN20260717_042620.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_042713.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_042805.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_042933.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_043042.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_043156.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_043319.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_043613.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_043722.mp4", orientation: "landscape" },
    { video: "video-snaps/VN20260717_120339.mp4", orientation: "landscape" }
];

// Global Asset Cache & Queue
let openedCount = 0;

// Envelope Clone Pool to prevent GC spikes
const EnvelopeClonePool = {
    pool: [],
    acquire: function(originalNode) {
        if (this.pool.length > 0) {
            const clone = this.pool.pop();
            clone.innerHTML = originalNode.innerHTML;
            return clone;
        }
        return originalNode.cloneNode(true);
    },
    release: function(cloneNode) {
        if (cloneNode.parentNode) cloneNode.parentNode.removeChild(cloneNode);
        cloneNode.style.cssText = '';
        cloneNode.className = 'mini-envelope';
        this.pool.push(cloneNode);
    }
};

// Media Manager (Singleton)
const MediaManager = {
    queue: [],
    cache: new Map(),
    pending: new Map(),
    isProcessing: false,
    
    init: function() {
        this.queue = memoriesData.map((_, i) => i);
        this.processQueue();
    },
    
    reprioritize: function(targetIndex) {
        // Sort queue by absolute distance from the tapped envelope
        this.queue.sort((a, b) => Math.abs(a - targetIndex) - Math.abs(b - targetIndex));
    },
    
    processQueue: async function() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            const nextIndex = this.queue.shift();
            try {
                await this.getMedia(nextIndex, false); // silent background load
            } catch(e) {
                console.warn("Background preload failed for index", nextIndex, e);
            }
        }
        this.isProcessing = false;
    },
    
    getMedia: function(index, showLoader = false) {
        const memory = memoriesData[index];
        const id = memory.video || memory.image;
        
        if (this.cache.has(id)) return Promise.resolve(this.cache.get(id));
        
        const loader = document.getElementById('memory-loading-overlay');
        
        if (this.pending.has(id)) {
            if (showLoader && loader) loader.style.display = 'flex';
            return this.pending.get(id);
        }
        
        if (showLoader && loader) loader.style.display = 'flex';
        
        // Remove from pending queue if we are manually requesting it
        this.queue = this.queue.filter(i => i !== index);
        
        const loadPromise = new Promise((resolve, reject) => {
            const isVid = !!memory.video;
            
            // 10 second timeout fallback
            const timeoutId = setTimeout(() => {
                this.pending.delete(id);
                reject(new Error("Media load timeout"));
            }, 10000);
            
            if (isVid) {
                const video = document.createElement("video");
                video.preload = "auto";
                video.playsInline = true;
                video.muted = true;
                video.src = memory.video;
                
                const checkReady = async () => {
                    if (video.readyState >= 3) {
                        video.removeEventListener('loadeddata', checkReady);
                        clearTimeout(timeoutId);
                        
                        // Fallback orientation detection
                        let orientation = memory.orientation;
                        if (!orientation) {
                            orientation = video.videoWidth > video.videoHeight ? 'landscape' : 'portrait';
                        }
                        
                        // Safe decoder warming
                        video.currentTime = 0.01;
                        video.pause();
                        try {
                            await video.play();
                            video.pause();
                        } catch(e) {} // Ignore autoplay block during warming
                        
                        const result = { element: video, orientation, isVid: true };
                        this.cache.set(id, result);
                        this.pending.delete(id);
                        if (showLoader && loader) loader.style.display = 'none';
                        resolve(result);
                    }
                };
                
                video.addEventListener('loadeddata', checkReady);
                video.load();
                if (video.readyState >= 3) checkReady();
                
                video.onerror = (e) => {
                    clearTimeout(timeoutId);
                    this.pending.delete(id);
                    reject(e);
                };
            } else {
                const img = new Image();
                img.src = memory.image;
                img.onload = () => {
                    clearTimeout(timeoutId);
                    const result = { element: img, orientation: memory.orientation || 'landscape', isVid: false };
                    this.cache.set(id, result);
                    this.pending.delete(id);
                    if (showLoader && loader) loader.style.display = 'none';
                    resolve(result);
                };
                img.onerror = (e) => {
                    clearTimeout(timeoutId);
                    this.pending.delete(id);
                    reject(e);
                };
            }
        });
        
        this.pending.set(id, loadPromise);
        return loadPromise;
    }
};

function initMemories() {
    const bigEnvelope = document.getElementById('bigEnvelopeContainer');
    const beFrontLayer = document.getElementById('beFrontLayer');
    const beBackLayer = document.getElementById('beBackLayer');
    const desk = document.getElementById('memoriesDesk');
    const prompt = document.getElementById('bePrompt');
    const collectorHeart = document.getElementById('collectorHeart');
    
    // Reset state
    desk.innerHTML = '';
    openedCount = 0;
    gsap.killTweensOf('*');
    gsap.set(bigEnvelope, { opacity: 0, scale: 0.8 });
    gsap.set([beFrontLayer, beBackLayer], { opacity: 1, y: 0, rotation: 0, scale: 1 });
    gsap.set(prompt, { opacity: 0 });
    gsap.set(collectorHeart, { opacity: 0, scale: 0, pointerEvents: 'none' });
    collectorHeart.onclick = null;
    bigEnvelope.style.pointerEvents = 'auto';
    
    // Slide in big envelope from bottom
    gsap.fromTo(bigEnvelope, 
        { opacity: 0, scale: 0.5, y: 500 }, 
        { 
            opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "back.out(1)", delay: 0.5,
            onComplete: () => {
                // Breathing effect for big envelope
                gsap.to(bigEnvelope, { scale: 1.04, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
            }
        }
    );
    gsap.to(prompt, { opacity: 1, duration: 1, delay: 1.5 });
    
    // Attach single click listener to entire envelope container
    bigEnvelope.onclick = () => {
        bigEnvelope.onclick = null; // Prevent double click
        bigEnvelope.style.pointerEvents = 'none'; // stop further clicks on the container itself
        
        gsap.killTweensOf(bigEnvelope); // stop breathing effect
        gsap.killTweensOf(prompt); // stop any scheduled fade-in
        
        // Hide prompt completely
        prompt.style.display = 'none';
        
        playSnapSound();
        
        // TEAR EFFECT: The entire envelope layers drop down and disappear, leaving the desk untouched!
        gsap.to(beFrontLayer, {
            y: '100vh',
            rotation: -25,
            opacity: 0,
            duration: 1.2,
            ease: "power2.in"
        });
        
        gsap.to(beBackLayer, {
            y: '100vh',
            rotation: 15,
            opacity: 0,
            duration: 1.5,
            delay: 0.1,
            ease: "power2.in"
        });
        
        // Fade in the new Heading Block
        const headingBlock = document.getElementById('memoriesHeadingBlock');
        gsap.to(headingBlock, { opacity: 1, y: 10, duration: 2, delay: 0.5 });
        
        // Trigger scatter immediately
        triggerScatterExplosion();
    };
}

async function triggerScatterExplosion() {
    console.log("Entering gallery");
    const desk = document.getElementById('memoriesDesk');
    
    console.log("Creating grid");
    // 1. Populate immutable grid IMMEDIATELY (Do not block on preload)
    memoriesData.forEach((memory, index) => {
        const env = document.createElement('div');
        env.className = 'mini-envelope';
        
        env.innerHTML = `
            <svg viewBox="0 0 400 250" style="width:100%; height:100%; position:absolute; inset:0; pointer-events:none;">
                <rect x="10" y="10" width="380" height="230" rx="15" fill="#ff6699" stroke="#800020" stroke-width="8" />
                <path d="M 10,25 L 170,140 L 10,235 Z" fill="#ff3377" stroke="#800020" stroke-width="8" stroke-linejoin="round" />
                <path d="M 390,25 L 230,140 L 390,235 Z" fill="#ff3377" stroke="#800020" stroke-width="8" stroke-linejoin="round" />
                <path d="M 10,235 L 200,100 L 390,235 Z" fill="#ff4d88" stroke="#800020" stroke-width="8" stroke-linejoin="round" />
                <path d="M 10,15 L 200,150 L 390,15 Z" fill="#ff80a6" stroke="#800020" stroke-width="8" stroke-linejoin="round" />
                <path d="M 200,165 C 200,165 170,140 170,115 C 170,95 195,95 200,115 C 205,95 230,95 230,115 C 230,140 200,165 200,165 Z" fill="#ff1a53" stroke="#800020" stroke-width="6" stroke-linejoin="round" />
            </svg>
        `;
        
        const num = document.createElement('div');
        num.className = 'me-num';
        num.innerText = index + 1;
        env.appendChild(num);
        
        // Random resting rotation
        const randomRot = (Math.random() * 14) - 7;
        gsap.set(env, { rotation: randomRot, opacity: 0 }); // start hidden for the clone animation
        desk.appendChild(env);
        
        env.addEventListener('click', async () => {
            if(!window.activePolaroid && !env.isAnimating) {
                env.isAnimating = true;
                window.activePolaroid = true;
                
                // Read and SAVE bounding rect once (do not recalculate)
                const rect = env.getBoundingClientRect();
                
                // Acquire clone from pool
                const clone = EnvelopeClonePool.acquire(env);
                clone.style.position = 'absolute'; 
                clone.style.left = rect.left + 'px';
                clone.style.top = rect.top + 'px';
                clone.style.width = rect.width + 'px';
                clone.style.height = rect.height + 'px';
                clone.style.margin = '0';
                clone.style.opacity = '1';
                
                // Copy computed rotation manually
                const rot = gsap.getProperty(env, "rotation") || 0;
                gsap.set(clone, { rotation: rot, transformOrigin: "center center" });
                
                const animLayer = document.getElementById('animation-layer') || document.body;
                animLayer.appendChild(clone);
                
                // Safely hide original using class (opacity 0, pointer-events none)
                env.classList.add('is-opening');
                
                // Immediate Tap Feedback on Clone (100ms)
                await gsap.to(clone, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
                
                // Clone flies to center
                const cx = window.innerWidth / 2;
                const cy = window.innerHeight / 2;
                const dx = cx - (rect.left + rect.width / 2);
                const dy = cy - (rect.top + rect.height / 2);
                
                await gsap.to(clone, {
                    x: dx,
                    y: dy,
                    rotation: 0,
                    scale: 2.5,
                    duration: 0.4,
                    ease: "power2.out"
                });
                
                // Reprioritize the background queue
                MediaManager.reprioritize(index);
                
                // Fetch safely (displays loader if not ready)
                let mediaObj;
                try {
                    mediaObj = await MediaManager.getMedia(index, true);
                } catch(e) {
                    console.error("Failed to load memory media", e);
                    env.classList.remove('is-opening');
                    env.isAnimating = false;
                    window.activePolaroid = false;
                    return;
                }
                
                if (!env.classList.contains('opened')) {
                    env.classList.add('opened');
                    openedCount++;
                }
                
                // Fade Backdrop
                const backdrop = document.getElementById('polaroidBackdrop');
                backdrop.style.opacity = '1';
                backdrop.style.pointerEvents = 'auto';
                
                openPolaroidStrict(mediaObj, env, index, clone, rot);
            }
        });
    });
    
    console.log("Grid created");
    
    // Initialize Smart Preloading
    console.log("Starting Smart Preload");
    MediaManager.init();
        
    // 5. Clone Intro Scatter Animation
    // This allows us to animate an explosion WITHOUT mutating the real grid DOM
    requestAnimationFrame(() => {
        const animLayer = document.getElementById('animation-layer') || document.body;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const realEnvs = desk.querySelectorAll('.mini-envelope');
        
        realEnvs.forEach((env, index) => {
            const rect = env.getBoundingClientRect();
            
            const clone = EnvelopeClonePool.acquire(env);
            clone.style.position = 'absolute'; 
            clone.style.left = rect.left + 'px';
            clone.style.top = rect.top + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.margin = '0';
            clone.style.opacity = '1';
            
            const rot = gsap.getProperty(env, "rotation") || 0;
            
            // Distance from screen center to the envelope's natural grid center
            const dx = centerX - (rect.left + rect.width / 2);
            const dy = centerY - (rect.top + rect.height / 2);
            
            animLayer.appendChild(clone);
            
            gsap.fromTo(clone, {
                x: dx,
                y: dy,
                scale: 0,
                rotation: (Math.random() * 360)
            }, {
                x: 0,
                y: 0,
                scale: 1,
                rotation: rot,
                duration: 0.7 + Math.random() * 0.3, 
                delay: index * 0.06,
                ease: "back.out(1.2)",
                onComplete: () => {
                    // Destroy clone and reveal the actual grid item
                    EnvelopeClonePool.release(clone);
                    gsap.set(env, { opacity: 1 }); 
                }
            });
        });
    });
    
    // Add flying hearts!
    createBurstingHearts(desk, desk.getBoundingClientRect());
}

function createBurstingHearts(container, deskRect) {
    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'absolute';
        heart.style.left = '50%';
        heart.style.top = '50%';
        heart.style.fontSize = Math.random() * 20 + 20 + 'px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = 150;
        heart.style.transform = 'translate(-50%, -50%) scale(0)';
        
        container.appendChild(heart);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 100;
        
        gsap.to(heart, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity - 100, // Move generally upwards
            scale: 1,
            opacity: 0,
            rotation: (Math.random() * 90 - 45),
            duration: 1.5 + Math.random() * 1,
            ease: "power2.out",
            onComplete: () => {
                heart.remove();
            }
        });
    }
}

function checkAllOpened() {
    if (openedCount === memoriesData.length) {
        const collectorHeart = document.getElementById('collectorHeart');
        collectorHeart.style.pointerEvents = 'auto';
        
        // Ensure it is perfectly centered and scaled to 0 initially
        gsap.set(collectorHeart, { xPercent: -50, yPercent: -50, scale: 0 });
        
        // Animate it springing up while staying perfectly centered
        gsap.to(collectorHeart, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, duration: 1, delay: 0.5, ease: "back.out(1.5)" });
        
        // Pulse effect
        gsap.to(collectorHeart, { scale: 1.15, xPercent: -50, yPercent: -50, duration: 0.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.5 });
        
        // Vacuum transition
        collectorHeart.onclick = () => {
            collectorHeart.onclick = null;
            collectorHeart.style.pointerEvents = 'none';
            gsap.killTweensOf(collectorHeart); // Stop pulsing
            
            // Hide the text so it doesn't get massively scaled up
            gsap.to('#chText', { opacity: 0, duration: 0.3 });
            
            const polaroids = document.querySelectorAll('.desk-polaroid-wrapper');
            
            // Suck all polaroids into the heart (x: 0, y: 0 is exactly the center since they are left: 50%, top: 50%)
            polaroids.forEach((p, i) => {
                gsap.killTweensOf(p); // Stop floating
                gsap.to(p, {
                    x: 0,
                    y: 0,
                    rotation: "+=" + ((Math.random() * 180) - 90),
                    scale: 0,
                    opacity: 0,
                    duration: 0.8,
                    delay: i * 0.05,
                    ease: "power2.in"
                });
            });
            
            // Wait for all polaroids to be sucked in
            const totalSuckTime = 0.8 + (polaroids.length * 0.05);
            
            // Heartbeat then shatter explosion
            setTimeout(() => {
                // 1. One deep heartbeat before exploding
                gsap.to(collectorHeart, {
                    scale: 1.5,
                    duration: 0.15,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        // 2. Hide heart
                        gsap.set(collectorHeart, { opacity: 0, scale: 0 });
                        // Sound removed per request
                        
                        // 3. Create Particle Shatter Explosion (Optimized for zero lag)
                        const particleCount = 50; // Reduced for performance
                        const particles = [];
                        const colors = ['#ff0a33', '#ff6699', '#ffcc00', '#ffd700', '#ffffff'];
                        
                        // Document fragment for faster DOM insertion
                        const frag = document.createDocumentFragment();
                        
                        for (let i = 0; i < particleCount; i++) {
                            const p = document.createElement('div');
                            p.className = 'burst-particle';
                            
                            // Randomize size and color
                            const size = Math.random() * 8 + 4;
                            const color = colors[Math.floor(Math.random() * colors.length)];
                            
                            p.style.width = size + 'px';
                            p.style.height = size + 'px';
                            p.style.backgroundColor = color;
                            // Removed box-shadow: glowing box-shadows on 50+ moving elements causes massive GPU raster lag!
                            
                            // Start at center
                            p.style.left = '50%';
                            p.style.top = '50%';
                            p.style.transform = 'translate(-50%, -50%) scale(1)';
                            
                            frag.appendChild(p);
                            particles.push(p);
                        }
                        
                        document.body.appendChild(frag);
                        
                        // Animate all particles
                        particles.forEach(p => {
                            // Random spherical explosion trajectory
                            const angle = Math.random() * Math.PI * 2;
                            const velocity = Math.random() * window.innerWidth * 0.8 + 100;
                            const depthScale = Math.random() * 4 + 1; 
                            
                            gsap.to(p, {
                                x: Math.cos(angle) * velocity,
                                y: Math.sin(angle) * velocity,
                                scale: depthScale,
                                opacity: 0,
                                duration: 0.8 + Math.random() * 0.4,
                                ease: "power3.out",
                                force3D: true, // GPU acceleration
                                onComplete: () => p.remove()
                            });
                        });
                        
                        // 4. Transition to next screen fast
                        setTimeout(() => {
                            if (typeof go === 'function') go(3);
                        }, 300);
                    }
                });
            }, totalSuckTime * 1000);
        };
    }
}

function openPolaroidStrict(mediaObj, envElement, index, cloneElement, originalRot) {
    const modalRoot = document.getElementById('modal-root') || document.body;
    const backdrop = document.getElementById('polaroidBackdrop');
    
    // Create polaroid wrapper
    const polaroidWrapper = document.createElement('div');
    polaroidWrapper.className = 'desk-polaroid-wrapper is-open';
    polaroidWrapper.innerHTML = `
        <div class="desk-polaroid-inner">
            <div class="vid-container" style="width: 100%; height: 100%;"></div>
        </div>
    `;
    
    const displayNode = mediaObj.element;
    const isVid = mediaObj.isVid;
    
    // Set dynamic orientation layout based on MediaManager calculation
    polaroidWrapper.classList.add(mediaObj.orientation || 'landscape');
    
    // Pause background animations for GPU headroom
    document.body.classList.add('is-paused-background');
    
    displayNode.style.cssText = "width: 100%; height: auto; max-height: 85vh; display: block; border-radius: 4px; object-fit: contain; pointer-events: auto;";
    polaroidWrapper.querySelector('.vid-container').replaceChildren(displayNode);
    
    if (isVid) {
        const playPromise = displayNode.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Autoplay prevented, fallback to controls:', e);
                displayNode.controls = true; // allow manual play if blocked by Low Power Mode
            });
        }
    }
    
    // Start modal hidden
    gsap.set(polaroidWrapper, { opacity: 0, scale: 0.8 });
    modalRoot.appendChild(polaroidWrapper);
    
    // Fade out clone, Fade in Modal (scaled to 0.9 to be 10% smaller)
    gsap.to(cloneElement, { opacity: 0, duration: 0.2 });
    gsap.to(polaroidWrapper, { opacity: 1, scale: 0.9, duration: 0.3, ease: "back.out(1.2)" });
    
    // Play snap sound (if it's a photo)
    if (!isVid) playSnapSound();
    
    // Close function
    const closeIt = () => {
        // Resume background animations instantly
        document.body.classList.remove('is-paused-background');
        
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
        
        // Hide modal
        gsap.to(polaroidWrapper, { 
            opacity: 0, 
            scale: 0.8, 
            duration: 0.2, 
            onComplete: () => {
                if (isVid) {
                    displayNode.pause();
                    // Detach safely AFTER animation ends to prevent flickering
                    displayNode.remove();
                }
                
                polaroidWrapper.remove();
                
                // Show clone and fly it back
                gsap.set(cloneElement, { opacity: 1 });
                gsap.to(cloneElement, {
                    x: 0, // Reset delta to 0 (which returns it to its original rect position)
                    y: 0,
                    scale: 1,
                    rotation: originalRot,
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        // Return to pool
                        EnvelopeClonePool.release(cloneElement);
                        
                        // Show original by removing class
                        envElement.classList.remove('is-opening');
                        
                        envElement.isAnimating = false;
                        window.activePolaroid = false;
                        
                        checkAllOpened();
                    }
                });
            }
        });
    };
    
    polaroidWrapper.onclick = (e) => {
        e.stopPropagation();
        closeIt();
    };
    backdrop.onclick = closeIt;
}

// Audio logic for the snap
function playSnapSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioCtx.sampleRate * 0.1; 
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02)); 
        }
        
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        noiseSource.connect(filter);
        filter.connect(audioCtx.destination);
        noiseSource.start();
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
}

// Removed devOpenAll to strictly enforce grid immutability.

// Ensure closed polaroids reflow correctly if the device is rotated or window is resized
window.addEventListener('resize', () => {
    if (!document.getElementById('memoriesPage').classList.contains('active')) return;
    
    document.querySelectorAll('.desk-polaroid-wrapper:not(.is-open)').forEach(pw => {
        const env = pw._envElement;
        if (env) {
            const rect = env.getBoundingClientRect();
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            gsap.set(pw, { 
                x: (rect.left + rect.width / 2) - cx, 
                y: (rect.top + rect.height / 2) - cy 
            });
        }
    });
});
