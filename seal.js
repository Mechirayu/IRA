function initSeal() {
    const sealPage = document.getElementById('sealPage');
    const envelope = document.getElementById('envelopeBackground');
    const container = document.getElementById('sealContainer');
    const sealLeft = document.getElementById('sealLeft');
    const sealRight = document.getElementById('sealRight');
    const prompt = document.getElementById('sealPrompt');
    const goldenBurst = document.getElementById('goldenBurst');
    
    // Reset state in case they navigate back and forth
    gsap.killTweensOf([envelope, container, sealLeft, sealRight, prompt, goldenBurst, sealPage]);
    gsap.set(goldenBurst, { opacity: 0, scale: 0.01 });
    gsap.set(sealLeft, { x: 0, rotation: 0 });
    gsap.set(sealRight, { x: 0, rotation: 0 });
    gsap.set(prompt, { opacity: 0 });
    gsap.set(container, { opacity: 0, scale: 0.5 });
    
    // The Morph: Fade in the envelope and drop the seal in
    gsap.to(envelope, { opacity: 1, duration: 2 });
    gsap.to(container, { opacity: 1, scale: 1, duration: 1.5, ease: "back.out(1.5)", delay: 0.5 });
    
    // Fade in prompt
    gsap.to(prompt, { opacity: 1, duration: 1, delay: 2 });
    
    let broken = false;
    
    // Setup drag/swipe tracking
    let startX = 0;
    
    function handleStart(e) {
        if (broken) return;
        startX = e.clientX || (e.touches && e.touches[0].clientX);
    }
    
    function handleMove(e) {
        if (broken || !startX) return;
        const currentX = e.clientX || (e.touches && e.touches[0].clientX);
        const diffX = Math.abs(currentX - startX);
        
        // If swiped more than 50px horizontally, break the seal!
        if (diffX > 50) {
            broken = true;
            startX = 0;
            triggerSealBreak();
        }
    }
    
    function handleEnd() {
        startX = 0;
    }
    
    // Attach listeners
    container.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    container.addEventListener('touchstart', handleStart, {passive: true});
    document.addEventListener('touchmove', handleMove, {passive: true});
    document.addEventListener('touchend', handleEnd);
    
    // Cleanup listeners when leaving page
    container._cleanupSeal = () => {
        container.removeEventListener('mousedown', handleStart);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        container.removeEventListener('touchstart', handleStart);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
    };
}

function triggerSealBreak() {
    const container = document.getElementById('sealContainer');
    const sealLeft = document.getElementById('sealLeft');
    const sealRight = document.getElementById('sealRight');
    const prompt = document.getElementById('sealPrompt');
    const flyingEnvelope = document.getElementById('flyingEnvelope');
    
    if(container._cleanupSeal) container._cleanupSeal();
    
    // Audio Snap (Sharp crack)
    playSnapSound();
    
    // Hide prompt
    prompt.style.animation = 'none';
    gsap.to(prompt, { opacity: 0, duration: 0.2 });
    
    // Animate the seal breaking apart
    gsap.to(sealLeft, { x: -40, rotation: -15, duration: 0.5, ease: "power2.out" });
    gsap.to(sealRight, { x: 40, rotation: 15, duration: 0.5, ease: "power2.out" });
    
    // The Pop-Out Envelope Climax
    setTimeout(() => {
        gsap.to(flyingEnvelope, {
            opacity: 1,
            scale: 25, // Scale massively to cover screen
            y: 500, // Fly downwards/towards camera
            duration: 1.5,
            ease: "power2.in",
            onComplete: () => {
                // Transition to next scene (Memories)
                if (typeof go === 'function') {
                    go(3);
                }
            }
        });
    }, 300); // Small delay so you see the seal break before the pop out
}

function playSnapSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a sharp, high-frequency snap/crack (like breaking hard wax)
    const bufferSize = audioCtx.sampleRate * 0.1; // 100ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02)); 
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Highpass filter to make it sound sharp
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    noiseSource.connect(filter);
    filter.connect(audioCtx.destination);
    noiseSource.start();
    
    // Low punchy thump simultaneously
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
}
