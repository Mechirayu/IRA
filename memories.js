// 18 Snaps and Notes
const memoriesData = [
    { video: "video-snaps/VN20260717_033554.mp4" },
    { video: "video-snaps/VN20260717_033929.mp4" },
    { video: "video-snaps/VN20260717_034038.mp4" },
    { video: "video-snaps/VN20260717_034318.mp4" },
    { video: "video-snaps/VN20260717_034652.mp4" },
    { video: "video-snaps/VN20260717_035013.mp4" },
    { video: "video-snaps/VN20260717_035258.mp4" },
    { video: "video-snaps/VN20260717_042216.mp4" },
    { video: "video-snaps/VN20260717_042620.mp4" },
    { video: "video-snaps/VN20260717_042713.mp4" },
    { video: "video-snaps/VN20260717_042805.mp4" },
    { video: "video-snaps/VN20260717_042933.mp4" },
    { video: "video-snaps/VN20260717_043042.mp4" },
    { video: "video-snaps/VN20260717_043156.mp4" },
    { video: "video-snaps/VN20260717_043319.mp4" },
    { video: "video-snaps/VN20260717_043613.mp4" },
    { video: "video-snaps/VN20260717_043722.mp4" },
    { video: "video-snaps/VN20260717_120339.mp4" }
];

let openedCount = 0;

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

function triggerScatterExplosion() {
    const desk = document.getElementById('memoriesDesk');
    const btnContinue = document.getElementById('btnContinue');
    const deskRect = desk.getBoundingClientRect();
    
    // Pre-calculated positions as percentage offsets from center (0,0).
    // Arranged in a clean perimeter: 6 top, 3 left-middle, 3 right-middle, 6 bottom.
    // The entire center is left completely empty for the collector heart.
    const W = window.innerWidth;
    const H = window.innerHeight;
    
    // We position relative to the center of the desk (which is at 50%, 50%).
    // Values are pixel offsets from center.
    let slotPositions = [];
    if (W <= 768) {
        // Mobile Layout: 3 cols x 6 rows (18 items)
        const cols = 3;
        const rows = 6;
        const spacingX = W * 0.28; 
        const spacingY = H * 0.12; 
        const startX = -spacingX * 1; 
        const startY = -spacingY * 2.5; 
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                slotPositions.push({ x: startX + c*spacingX, y: startY + r*spacingY });
            }
        }
    } else {
        // Desktop Layout: 6 top, 3 left, 3 right, 6 bottom
        slotPositions = [
            { x: -W * 0.40, y: -H * 0.15 }, { x: -W * 0.24, y: -H * 0.15 }, { x: -W * 0.08, y: -H * 0.15 }, { x:  W * 0.08, y: -H * 0.15 }, { x:  W * 0.24, y: -H * 0.15 }, { x:  W * 0.40, y: -H * 0.15 },
            { x: -W * 0.40, y:  H * 0.08 }, { x: -W * 0.24, y:  H * 0.08 }, { x: -W * 0.08, y:  H * 0.08 }, { x:  W * 0.08, y:  H * 0.08 }, { x:  W * 0.24, y:  H * 0.08 }, { x:  W * 0.40, y:  H * 0.08 },
            { x: -W * 0.40, y:  H * 0.30 }, { x: -W * 0.24, y:  H * 0.30 }, { x: -W * 0.08, y:  H * 0.30 }, { x:  W * 0.08, y:  H * 0.30 }, { x:  W * 0.24, y:  H * 0.30 }, { x:  W * 0.40, y:  H * 0.30 }
        ];
    }
    
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
        
        env.addEventListener('click', () => {
            if(!env.classList.contains('opened')) {
                env.classList.add('opened');
                openedCount++;
                openPolaroid(memory, env, index);
            }
        });
        
        desk.appendChild(env);
        
        const slot = slotPositions[index];
        const randomRot = (Math.random() * 14) - 7;
        
        // Store position on the element for polaroid return
        env._slotX = slot.x;
        env._slotY = slot.y;
        
        gsap.to(env, {
            x: slot.x,
            y: slot.y,
            xPercent: -50,
            yPercent: -50,
            rotation: randomRot,
            scale: 1,
            opacity: 1,
            duration: 0.7 + Math.random() * 0.3, 
            delay: index * 0.06,
            ease: "back.out(1.2)"
        });
    });
    
    // Add flying hearts!
    createBurstingHearts(desk, deskRect);
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

function openPolaroid(memoryData, envElement, index) {
    const desk = document.getElementById('memoriesDesk');
    const backdrop = document.getElementById('polaroidBackdrop');
    
    // Stop envelope animations
    gsap.killTweensOf(envElement);
    
    // Get its current position values from GSAP
    const startX = gsap.getProperty(envElement, "x");
    const startY = gsap.getProperty(envElement, "y");
    const rot = gsap.getProperty(envElement, "rotation");
    
    // Shrink envelope
    gsap.to(envElement, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.2)"
    });
    
    // Create polaroid wrapper
    const polaroidWrapper = document.createElement('div');
    polaroidWrapper.className = 'desk-polaroid-wrapper is-open';
    
    polaroidWrapper.innerHTML = `
        <div class="desk-polaroid-inner" style="pointer-events: none; padding: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); background: #fff; border-radius: 8px; aspect-ratio: 9/16; overflow: hidden;">
            <div class="video-loader"></div><video src="${memoryData.video}" autoplay loop muted playsinline style="width: 100%; height: 100%; display: block; border-radius: 4px; object-fit: cover; pointer-events: auto;" onplaying="this.previousElementSibling.style.display='none'"></video>
        </div>
    `;
    
    const page = document.getElementById('memoriesPage');
    page.appendChild(polaroidWrapper);
    
    const inner = polaroidWrapper.querySelector('.desk-polaroid-inner');
    const video = polaroidWrapper.querySelector('video');
    
    // Pause video immediately to prevent lag during the GSAP zoom animation
    video.pause();
    
    // Show Backdrop
    backdrop.style.opacity = '1';
    backdrop.style.pointerEvents = 'auto';
    
    // Set polaroid starting position and z-index to be strictly over the backdrop
    gsap.set(polaroidWrapper, { x: startX, y: startY, rotation: rot, scale: 0, opacity: 0, zIndex: 500 });
    
    // The user requested videos 4 and 8 to be vertical. (Index 3 and 7)
    const isVertical = (index === 3 || index === 7);
    const targetRotation = isVertical ? 0 : -90;
    
    const startHeight = polaroidWrapper.offsetHeight || ((polaroidWrapper.offsetWidth || 100) * 1.77);
    
    let targetScale;
    if (isVertical) {
        // Fit 75% of screen height for vertical videos
        const targetHeight = window.innerHeight * 0.75;
        targetScale = targetHeight / startHeight;
    } else {
        // Fit 60% of screen width for horizontal videos
        const targetWidth = window.innerWidth * 0.60;
        targetScale = targetWidth / startHeight;
    }
    
    // Animate polaroid TO CENTER
    gsap.to(polaroidWrapper, { 
        x: 0, 
        y: 0, 
        rotation: targetRotation, 
        scale: targetScale, 
        opacity: 1, 
        duration: 0.6, 
        delay: 0.1, 
        ease: "back.out(1.2)",
        onComplete: () => {
            video.play();
        }
    });
    
    // Handle close function
    const closeIt = () => {
        polaroidWrapper.classList.remove('is-open'); // Re-enable CSS hover
        video.pause(); // Pause video when returning to desk to prevent lag
        
        // Hide Backdrop
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
        
        inner.style.pointerEvents = 'auto'; // allow hover
        
        const endRot = rot + (Math.random() * 10 - 5);
        
        // Animate BACK TO DESK
        gsap.to(polaroidWrapper, {
            x: startX, 
            y: startY, 
            rotation: endRot, 
            scale: 1, 
            xPercent: -50,
            yPercent: -50,
            zIndex: 50,
            duration: 0.6, 
            ease: "back.out(1.2)",
            onComplete: () => {
                // Add subtle floating effect for polaroid on desk
                gsap.to(polaroidWrapper, {
                    y: "+=10",
                    rotation: endRot + (Math.random() * 4 - 2),
                    duration: 2 + Math.random(),
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
                     checkAllOpened(); // Trigger heart check here!
                
                // Allow reopening the polaroid from the desk!
                polaroidWrapper.onclick = (e) => {
                    e.stopPropagation();
                    if (polaroidWrapper.classList.contains('is-open')) {
                        closeIt();
                        return;
                    }
                    polaroidWrapper.classList.add('is-open');

                    
                    gsap.killTweensOf(polaroidWrapper);
                    
                    const currentX = gsap.getProperty(polaroidWrapper, "x");
                    const currentY = gsap.getProperty(polaroidWrapper, "y");
                    const currentRot = gsap.getProperty(polaroidWrapper, "rotation");
                    
                    // Show Backdrop
                    backdrop.style.opacity = '1';
                    backdrop.style.pointerEvents = 'auto';
                    
                    // Reassign backdrop click
                    backdrop.onclick = closeIt;
                    
                    gsap.to(polaroidWrapper, {
                        x: 0, y: 0, xPercent: -50, yPercent: -50, scale: targetScale, zIndex: 500, rotation: targetRotation,
                        duration: 0.6, ease: "back.out(1.2)",
                        onComplete: () => {
                            video.play();
                        }
                    });
                };
            }
        });
    };
    
    // Bind click to close initially
    polaroidWrapper.onclick = (e) => {
        e.stopPropagation();
        if (polaroidWrapper.classList.contains('is-open')) {
            closeIt();
        }
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

// Dev tool to open all un-opened envelopes instantly
function devOpenAll() {
    const envs = document.querySelectorAll('.mini-envelope:not(.opened)');
    const page = document.getElementById('memoriesPage');
    
    envs.forEach((env) => {
        env.classList.add('opened');
        
        // Find index
        const indexStr = env.querySelector('.me-num').innerText;
        const index = parseInt(indexStr) - 1;
        const memoryData = memoriesData[index];
        
        const startX = gsap.getProperty(env, "x");
        const startY = gsap.getProperty(env, "y");
        const rot = gsap.getProperty(env, "rotation");
        
        gsap.killTweensOf(env);
        env.remove();
        
        const polaroidWrapper = document.createElement('div');
        polaroidWrapper.className = 'desk-polaroid-wrapper';
        
        polaroidWrapper.innerHTML = `
            <div class="desk-polaroid-inner" style="pointer-events: auto;">
                <div class="dp-photo" style="background-image: url('${memoryData.image}')"></div>
            </div>
        `;
        
        page.appendChild(polaroidWrapper);
        
        const endRot = rot + (Math.random() * 10 - 5);
        
        gsap.set(polaroidWrapper, {
            x: startX,
            y: startY,
            xPercent: -50,
            yPercent: -50,
            rotation: endRot,
            scale: 1,
            zIndex: 50,
            opacity: 1
        });
        
        gsap.to(polaroidWrapper, {
            y: "+=10",
            rotation: endRot + (Math.random() * 4 - 2),
            duration: 2 + Math.random(),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
        
        // Allow reopening the polaroid from the desk!
        polaroidWrapper.onclick = () => {
            if (polaroidWrapper.classList.contains('is-open')) return;
            polaroidWrapper.classList.add('is-open');
            
            gsap.killTweensOf(polaroidWrapper);
            
            const currentX = gsap.getProperty(polaroidWrapper, "x");
            const currentY = gsap.getProperty(polaroidWrapper, "y");
            const currentRot = gsap.getProperty(polaroidWrapper, "rotation");
            
            // Show Backdrop
            const backdrop = document.getElementById('polaroidBackdrop');
            backdrop.style.opacity = '1';
            backdrop.style.pointerEvents = 'auto';
            
            // Re-add close button
            const btn = document.createElement('button');
            btn.className = 'pm-close';
            btn.style.cssText = "position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%); white-space: nowrap; padding: 10px 20px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: #fff; border-radius: 20px; font-family: 'Quicksand', sans-serif; cursor: pointer; opacity: 0; pointer-events: auto;";
            btn.innerText = 'Close';
            polaroidWrapper.appendChild(btn);
            
            gsap.to(polaroidWrapper, {
                x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 2.2, zIndex: 500, rotation: (Math.random()*6-3),
                duration: 0.6, ease: "back.out(1.2)"
            });
            
            gsap.to(btn, { opacity: 1, duration: 0.3, delay: 0.6 });
            
            btn.onclick = (e) => {
                e.stopPropagation(); // prevent reopening click
                polaroidWrapper.classList.remove('is-open');
                backdrop.style.opacity = '0';
                backdrop.style.pointerEvents = 'none';
                
                gsap.to(btn, { opacity: 0, duration: 0.2, onComplete: () => btn.remove() });
                
                const newEndRot = currentRot + (Math.random() * 10 - 5);
                gsap.to(polaroidWrapper, {
                    x: currentX, y: currentY, rotation: newEndRot, scale: 1, xPercent: -50, yPercent: -50, zIndex: 50, duration: 0.6, ease: "back.out(1.2)",
                    onComplete: () => {
                        gsap.to(polaroidWrapper, {
                            y: "+=10", rotation: newEndRot + (Math.random() * 4 - 2), duration: 2 + Math.random(), yoyo: true, repeat: -1, ease: "sine.inOut"
                        });
                    }
                });
            };
        };
        
        openedCount++;
    });
    
    checkAllOpened();
}
