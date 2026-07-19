const nicknames = [
    "Cutie", "Cutie",
    "Rasmalai", "Rasmalai",
    "Sweetheart", "Sweetheart",
    "Moto", "Moto",
    "Jaan", "Jaan",
    "Mast Billo", "Mast Billo"
];

let flippedCards = [];
let matchedPairs = 0;
let isBoardLocked = false;

function initMemoryMatch() {
    const grid = document.getElementById('memoryGrid');
    grid.className = 'memory-grid';
    grid.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    isBoardLocked = false;

    // Shuffle
    const shuffled = [...nicknames].sort(() => 0.5 - Math.random());

    shuffled.forEach((name, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.name = name;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-back"></div>
                <div class="memory-card-front">
                    <span class="italic-script">${name}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });

    // Wait for DOM to render cards, then calculate and apply scale if needed
    requestAnimationFrame(() => {
        scaleMemoryGridToFit();
    });
}

// Function to scale the grid down if it exceeds available vertical space
function scaleMemoryGridToFit() {
    const grid = document.querySelector('.memory-grid');
    const colLeft = document.querySelector('.memory-col-left');
    
    if (!grid || !colLeft) return;
    
    // Reset transform to measure natural height
    grid.style.transform = 'none';
    
    const gridHeight = grid.scrollHeight;
    const availableHeight = colLeft.clientHeight;
    
    // If grid is taller than available space minus a small padding
    if (gridHeight > availableHeight && availableHeight > 0) {
        const padding = 10; // 5px top and bottom
        const scale = (availableHeight - padding) / gridHeight;
        
        if (scale < 1) {
            grid.style.transform = `scale(${scale})`;
            grid.style.transformOrigin = 'center center';
        }
    }
}

// Listen for window resize to recalculate scale
window.addEventListener('resize', () => {
    if (document.getElementById('memoryMatchPage').classList.contains('active')) {
        scaleMemoryGridToFit();
    }
});

function flipCard(card) {
    if (isBoardLocked) return;
    if (card === flippedCards[0]) return;
    if (card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    isBoardLocked = true;
    const card1 = flippedCards[0];
    const card2 = flippedCards[1];

    if (card1.dataset.name === card2.dataset.name) {
        // Match
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            matchedPairs++;
            
            if (matchedPairs === 6) {
                winMemoryGame();
            }
            
            resetBoard();
        }, 300);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            resetBoard();
        }, 800);
    }
}

function resetBoard() {
    flippedCards = [];
    isBoardLocked = false;
}

function winMemoryGame() {
    setTimeout(() => {
        const cards = document.querySelectorAll('.memory-card');
        const gridContainer = document.querySelector('.memory-grid-container');
        const rightCol = document.querySelector('.memory-col-right');
        
        const tl = gsap.timeline();
        
        // Target drop point for seeds (bottom center of the screen)
        const dropX = window.innerWidth / 2;
        const dropY = window.innerHeight;

        // 1. Fade out right column
        tl.to(rightCol, { opacity: 0, duration: 0.5 }, 0);
        
        // 2. Shatter cards into seeds
        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            // Instantly hide the actual card
            gsap.set(card, { opacity: 0, delay: 0.2 });
            
            // Create 4 seeds per card
            for(let i = 0; i < 4; i++) {
                const seed = document.createElement('div');
                seed.className = 'golden-seed';
                
                // Random offset within the card
                const startX = cardCenterX + (Math.random() - 0.5) * 60;
                const startY = cardCenterY + (Math.random() - 0.5) * 80;
                
                seed.style.left = startX + 'px';
                seed.style.top = startY + 'px';
                document.body.appendChild(seed);
                
                // Animate seed exploding slightly then falling
                tl.to(seed, {
                    x: (Math.random() - 0.5) * 100, // explode out
                    y: (Math.random() - 0.5) * 100,
                    scale: Math.random() * 1.5 + 0.5,
                    duration: 0.4 + Math.random() * 0.2,
                    ease: "power2.out"
                }, 0.2); // Start after right col fades
                
                // Fall to bottom center
                tl.to(seed, {
                    left: dropX,
                    top: dropY,
                    x: 0,
                    y: 0,
                    opacity: 0,
                    duration: 1.2 + Math.random() * 0.5,
                    ease: "power1.in",
                    onComplete: () => seed.remove()
                }, 0.6 + Math.random() * 0.2);
            }
        });
        
        // 3. Trigger Bouquet Scene after seeds hit the bottom
        // The longest fall animation takes about ~2.5 seconds total
        setTimeout(() => {
            if (typeof startBouquetAnimation === 'function') {
                startBouquetAnimation();
            }
        }, 2200);

    }, 500); // 0.5s delay after the final match
}

function startBouquetAnimation() {
    // Just use the main navigation function which handles display/opacity safely
    if (typeof go === 'function') {
        go(6);
    }
}

function startMemoryMatchTransition() {
    initMemoryMatch();
    
    const vinylPage = document.getElementById('vinylRoomPage');
    const memoryPage = document.getElementById('memoryMatchPage');
    const gridContainer = document.querySelector('.memory-grid-container');
    const rightCol = document.querySelector('.memory-col-right');

    // Fade out Vinyl Room
    gsap.to(vinylPage, { 
        opacity: 0, 
        duration: 1,
        onComplete: () => {
            vinylPage.style.display = 'none';
            vinylPage.classList.remove('active');
        }
    });

    // Stop all playing audio gracefully
    document.querySelectorAll('audio').forEach(audioEl => {
        gsap.to(audioEl, { volume: 0, duration: 1, onComplete: () => { 
            audioEl.pause(); 
            audioEl.currentTime = 0; 
            audioEl.volume = 1; 
        }});
    });

    // Collect ambient particles (stars and hearts)
    const ambientParticles = document.querySelectorAll('.star, .heart');
    
    // Prepare Memory Game elements
    memoryPage.style.display = 'block';
    memoryPage.style.opacity = '1';
    memoryPage.style.pointerEvents = 'auto';
    memoryPage.style.zIndex = '10';
    memoryPage.classList.add('active'); 
    
    // Update global nav state manually to avoid go() instantly hiding the previous page
    if (typeof current !== 'undefined') current = 5;
    if (typeof dots !== 'undefined') dots.forEach((d,i)=>d.classList.toggle('active',i===5));
    
    // Make sure it sits on top of vinyl and vinyl doesn't block clicks
    vinylPage.style.position = 'absolute';
    vinylPage.style.pointerEvents = 'none';
    
    gsap.set(gridContainer, { opacity: 0, scale: 0.8 });
    gsap.set(rightCol, { opacity: 0, x: 30 });

    const timeline = gsap.timeline();

    // Swirl particles into center
    timeline.to(ambientParticles, {
        top: '50%',
        left: '50%',
        scale: 2,
        duration: 1.5,
        ease: 'power4.in',
        stagger: {
            amount: 0.5,
            from: "random"
        }
    });

    // Central flash & Reveal
    timeline.to(ambientParticles, {
        scale: 10,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
            ambientParticles.forEach(p => p.remove()); // Clean them up
        }
    });

    // Fade in Grid and Right Column
    timeline.to(gridContainer, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'back.out(1.2)'
    }, "-=0.1");
    
    timeline.to(rightCol, {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power3.out'
    }, "-=0.8");
}

window.startMemoryMatchTransition = startMemoryMatchTransition;
window.startBouquetAnimation = startBouquetAnimation;
window.initMemoryMatch = initMemoryMatch;
