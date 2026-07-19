/* =====================================================
   SCENE 6 — THE VINYL ROOM
   vinyl.js
   ===================================================== */

// ==========================================
// LYRICS TIMING CONFIGURATION
// Fine-tune the milliseconds for each line here.
// ==========================================
const LYRICS_TIMING_CONFIG = {
    track1: [
        { time: 0, text: "Haan pehli nazar mein, kaisa jadoo kar diya" },
        { time: 7, text: "Tera ban baitha hai, mera jiya" },
        { time: 12, text: "Ho... jaane kya hoga, kya hoga kya pata" },
        { time: 19, text: " hai Is pal ko milke aa jee le zara" },
        { time: 25, text: "Main hoon yahan, tu hai wahan" },
        { time: 32, text: "Meri bahon mein aa, aa bhi ja" },
        { time: 37, text: "Ho jaane jaan, dono yahan" },
        { time: 43, text: "Meri bahon mein aa, aa bhi ja" },
        { time: 50, text: "Wo ho ho... ho ho ho..." },
        { time: 62, text: "Meri bahon mein aa, aa bhi ja" }
    ],
    track2: [
        { time: 0, text: "Ho baatein zaroori hai" },
        { time: 3, text: "Mera milna bhi zaroori" },
        { time: 7, text: "Ho maine mita deni" },
        { time: 11, text: "Ye jo teri meri doori" },
        { time: 15, text: "Ho baatein zaroori hai" },
        { time: 18, text: "Tera milna bhi zaroori" },
        { time: 22, text: "Ho maine mita deni" },
        { time: 26, text: "Ye jo teri meri doori" },
        { time: 30, text: "Ho jhoothi hai wo rahe sari duniya ki" },
        { time: 34, text: "Ishq jahan na chale" },
        { time: 38, text: "Tera hona mera hona kya hona hai" },
        { time: 42, text: "Agar na dono mile" },
        { time: 47, text: "Tu pehla pehla pyar hai, mera" },
        { time: 54, text: "Tu pehla pehla pyar hai, mera" }
    ]
};
// ==========================================

let currentAudio = null;
let currentLyrics = LYRICS_TIMING_CONFIG.track1;
let isVinylPlaying = false;
let vinylHasStarted = false;

function startVinylTransition(shell) {
    const vinylDisc = document.getElementById('vinylDisc');
    const vinylContainer = document.querySelector('.vinyl-container');
    
    // Stop all other scroll triggers
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(st => st.kill());
    }

    // Hide UI elements initially
    const uiElements = [
        document.querySelector('.lyrics-header'),
        document.getElementById('vinylArm'),
        document.querySelector('.lyrics-col'),
        document.querySelector('.track-switcher')
    ];
    gsap.set(uiElements, { opacity: 0 });

    // 1. Cinematic Crossfade of Pages
    const oldPage = document.getElementById('petalPathPage');
    const newPage = document.getElementById('vinylRoomPage');
    
    // Capture heart's current position before we move it or hide the old page
    const startRect = shell.getBoundingClientRect();
    
    // Fix the heart at its current screen position in the body so it stays visible!
    gsap.set(shell, {
        position: 'fixed',
        top: startRect.top,
        left: startRect.left,
        width: startRect.width,
        height: startRect.height,
        margin: 0,
        zIndex: 9999,
        xPercent: 0,
        yPercent: 0
    });
    
    document.body.appendChild(shell);
    
    // Sequence: Fade out old page completely first
    gsap.to(oldPage, { 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power2.inOut',
        onComplete: () => {
            if (typeof window.go === 'function') {
                newPage.style.opacity = '0';
                window.go(4);
                oldPage.style.opacity = '';
            } else {
                oldPage.classList.remove('active');
                oldPage.style.opacity = '';
                newPage.style.opacity = '0';
                newPage.classList.add('active');
            }
            
            // Calculate center now that newPage is active
            const containerRect = vinylContainer.getBoundingClientRect();
            const heartSize = Math.min(containerRect.width, containerRect.height) * 0.30;
            const targetTop = containerRect.top + (containerRect.height / 2);
            const targetLeft = containerRect.left + (containerRect.width / 2);
            
            gsap.to(newPage, { opacity: 1, duration: 1, ease: 'power2.inOut', onComplete: () => {
                // Now fly the heart
                gsap.to(shell, {
                    top: targetTop,
                    left: targetLeft,
                    xPercent: -50,
                    yPercent: -50,
                    width: heartSize,
                    height: heartSize,
                    duration: 1.8,
                    ease: 'power3.inOut',
                    onComplete: finishFlight
                });
            }});
        }
    });
    
    // Hide the disc — it will grow from below after heart lands
    gsap.set(vinylDisc, { scale: 0, opacity: 0, y: 80 });

    function finishFlight() {
            // === TURN THE HEART GOLDEN ===
            const photo = shell.querySelector('.scratch-photo');
            const canvas = shell.querySelector('.scratch-canvas');
            if (photo) photo.style.display = 'none';
            if (canvas) canvas.style.display = 'none';
            
            shell.style.background = 'linear-gradient(135deg, #fceabb 0%, #f8b500 20%, #d4a017 40%, #c8932a 55%, #f0d060 70%, #ffe88a 85%, #f8b500 100%)';
            shell.style.boxShadow = 'inset 0 -4px 12px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,255,255,0.4)';
            shell.style.filter = 'drop-shadow(0 0 30px rgba(255, 200, 50, 0.9)) drop-shadow(0 0 80px rgba(255, 160, 20, 0.5))';
            
            // Seamless handoff: reparent into the container now that it has landed dead-center
            shell.style.position = 'absolute';
            shell.style.top = '50%';
            shell.style.left = '50%';
            shell.style.width = '30%';
            shell.style.height = '30%';
            shell.style.zIndex = '5';
            
            // Ensure GSAP knows it is centered so subsequent animations (like scale) don't jump
            gsap.set(shell, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
            
            vinylContainer.appendChild(shell);
            
            // 3. Grow the disc from below, underneath the heart
            gsap.to(vinylDisc, {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: 'back.out(1.2)',
                onComplete: () => {
                    gsap.to(shell, {
                        scale: 1.05,
                        duration: 2,
                        ease: 'sine.inOut',
                        yoyo: true,
                        repeat: -1,
                        transformOrigin: 'center center'
                    });
                    
                    // Finally, fade in all UI elements
                    gsap.to(uiElements, { opacity: 1, duration: 1, stagger: 0.1, ease: 'power2.out', onComplete: initVinylPlayer });
                }
            });
    }
}

function initVinylPlayer() {
    const arm = document.getElementById('vinylArm');
    const disc = document.getElementById('vinylDisc');
    const controlBtn = document.getElementById('vinylControlBtn');
    
    // Show the explicit play button after transition
    setTimeout(() => {
        if (!vinylHasStarted) {
            controlBtn.classList.add('visible');
        }
        // Show the "Next Game" button 5 seconds later
        setTimeout(() => {
            const nextBtn = document.getElementById('vinylNextGameBtn');
            if (nextBtn) nextBtn.classList.add('visible');
        }, 5000);
    }, 1500);
    
    // Handle all playback states
    controlBtn.addEventListener('click', function togglePlay() {
        const btnText = controlBtn.querySelector('span');
        
        if (!vinylHasStarted) {
            // First time play (Drop the Needle)
            vinylHasStarted = true;
            isVinylPlaying = true;
            
            // Move needle onto record
            arm.classList.add('playing');
            btnText.innerText = 'PAUSE';
            controlBtn.classList.add('playing-state');
            
            setTimeout(() => {
                // Setup Audio & Lyrics if not already done
                if (!currentAudio) {
                    currentAudio = document.getElementById('audioTrack1');
                    currentLyrics = LYRICS_TIMING_CONFIG.track1;
                    setupLyrics();
                }

                // Wait for audio to be ready before spinning
                const attemptPlay = () => {
                    if (currentAudio.readyState >= 3) {
                        btnText.innerText = 'PAUSE';
                        disc.classList.add('spinning');
                        currentAudio.play().catch(e => console.log("Audio autoplay blocked", e));
                        currentAudio.addEventListener('timeupdate', syncLyrics);
                    } else {
                        btnText.innerText = 'LOADING...';
                        currentAudio.load();
                        currentAudio.addEventListener('canplaythrough', attemptPlay, { once: true });
                    }
                };
                attemptPlay();
            }, 1200);
        } else {
            // Toggle play/pause
            if (isVinylPlaying) {
                // PAUSE
                isVinylPlaying = false;
                arm.classList.remove('playing'); // swings off
                disc.classList.remove('spinning'); // stops spinning
                if (currentAudio) currentAudio.pause();
                
                btnText.innerText = 'PLAY';
                controlBtn.classList.remove('playing-state');
                controlBtn.classList.add('paused-state');
            } else {
                // RESUME
                isVinylPlaying = true;
                arm.classList.add('playing'); // swings on
                btnText.innerText = 'PAUSE';
                controlBtn.classList.remove('paused-state');
                controlBtn.classList.add('playing-state');
                
                setTimeout(() => {
                    disc.classList.add('spinning'); // resume spinning
                    if (currentAudio) currentAudio.play();
                }, 1200);
            }
        }
    });
    
    // Setup Track Switchers
    document.getElementById('track1Btn').addEventListener('click', () => switchTrack(1));
    document.getElementById('track2Btn').addEventListener('click', () => switchTrack(2));
}

function setupLyrics() {
    const inner = document.getElementById('lyricsInner');
    inner.innerHTML = '';
    
    currentLyrics.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'lyric-line';
        div.id = 'lyric-' + index;
        div.innerText = line.text;
        inner.appendChild(div);
    });
}

function syncLyrics() {
    if (!currentAudio) return;
    
    const time = currentAudio.currentTime;
    let activeIndex = -1;
    
    for (let i = 0; i < currentLyrics.length; i++) {
        if (time >= currentLyrics[i].time) {
            activeIndex = i;
        }
    }
    
    if (activeIndex !== -1) {
        document.querySelectorAll('.lyric-line').forEach(el => el.classList.remove('active'));
        
        const activeEl = document.getElementById('lyric-' + activeIndex);
        if (activeEl && !activeEl.classList.contains('active')) {
            activeEl.classList.add('active');
            
            // Auto-scroll the container so the active lyric stays centered
            const container = document.getElementById('lyricsContainer');
            if (container) {
                const scrollOffset = activeEl.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
                container.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' });
            }
        }
    }
}

function switchTrack(trackNum) {
    // Determine the target audio and lyrics
    let nextAudio = document.getElementById(trackNum === 1 ? 'audioTrack1' : 'audioTrack2');
    let nextLyrics = trackNum === 1 ? LYRICS_TIMING_CONFIG.track1 : LYRICS_TIMING_CONFIG.track2;

    // Update buttons UI
    document.getElementById('track1Btn').classList.toggle('active', trackNum === 1);
    document.getElementById('track2Btn').classList.toggle('active', trackNum === 2);

    const controlBtn = document.getElementById('vinylControlBtn');
    const btnText = controlBtn.querySelector('span');
    const disc = document.getElementById('vinylDisc');
    const arm = document.getElementById('vinylArm');

    // Fade out current audio if it's already playing
    let needDelay = false;
    if (currentAudio) {
        currentAudio.removeEventListener('timeupdate', syncLyrics);
        const oldAudio = currentAudio;
        gsap.to(oldAudio, { volume: 0, duration: 1, onComplete: () => {
            oldAudio.pause();
            oldAudio.currentTime = 0;
            oldAudio.volume = 1;
        }});
        needDelay = true;
    }

    // Set new current state
    currentAudio = nextAudio;
    currentLyrics = nextLyrics;
    currentAudio.currentTime = 0;
    setupLyrics();

    // Make sure control button is visible and marks player as started
    controlBtn.classList.add('visible');
    vinylHasStarted = true;
    isVinylPlaying = true;

    // Reset visual state instantly to prepare for switch
    arm.classList.remove('playing');
    disc.classList.remove('spinning');
    btnText.innerText = 'PAUSE';
    controlBtn.classList.remove('paused-state');
    controlBtn.classList.add('playing-state');
    
    // If we were already playing something, wait a tiny bit for the arm to retract,
    // otherwise if this is the very first interaction, start instantly.
    const delay = needDelay ? 1500 : 100;

    setTimeout(() => {
        arm.classList.add('playing');
        setTimeout(() => {
            const attemptPlay = () => {
                if (currentAudio.readyState >= 3) {
                    btnText.innerText = 'PAUSE';
                    disc.classList.add('spinning');
                    currentAudio.play().catch(e => console.log(e));
                    currentAudio.addEventListener('timeupdate', syncLyrics);
                } else {
                    btnText.innerText = 'LOADING...';
                    currentAudio.load();
                    currentAudio.addEventListener('canplaythrough', attemptPlay, { once: true });
                }
            };
            attemptPlay();
        }, 1000);
    }, delay);
}

// === FALLBACK: Always ensure buttons appear when vinyl page is active ===
(function observeVinylPage() {
    const vinylPage = document.getElementById('vinylRoomPage');
    if (!vinylPage) return;
    
    let vinylTimerStarted = false;
    
    function showVinylButtons() {
        if (vinylTimerStarted) return;
        vinylTimerStarted = true;
        
        // Show play button immediately
        const controlBtn = document.getElementById('vinylControlBtn');
        if (controlBtn && !controlBtn.classList.contains('visible')) {
            setTimeout(() => controlBtn.classList.add('visible'), 1500);
        }
        
        // Show Next Game after 5 seconds
        setTimeout(() => {
            const nextBtn = document.getElementById('vinylNextGameBtn');
            if (nextBtn) nextBtn.classList.add('visible');
        }, 5000);
    }
    
    // Check if already active
    if (vinylPage.classList.contains('active')) {
        showVinylButtons();
    }
    
    // Watch for class changes
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.attributeName === 'class' && vinylPage.classList.contains('active')) {
                showVinylButtons();
            }
        }
    });
    observer.observe(vinylPage, { attributes: true });
})();

window.startVinylTransition = startVinylTransition;
