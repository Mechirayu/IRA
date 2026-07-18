/* =====================================================
   SCENE 4 — GOLDEN SCRATCH-OFF MEMORIES (RED GLOSS UPDATE)
   petalpath.js
   ===================================================== */

function initPetalPath() {
    if (window.petalPathInitialized) return;
    window.petalPathInitialized = true;

    // ---- Entrance animation for each row ----
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        document.querySelectorAll('.scratch-row').forEach((row, i) => {
            // note side floats in from the outer edge
            const note = row.querySelector('.scratch-note-inner');
            const card = row.querySelector('.scratch-card-shell');
            const isRight = row.classList.contains('row-right');

            // Add a slight random tilt between -2 and +2 degrees
            const randomRotation = (Math.random() * 4) - 2;

            gsap.set(note, { opacity: 0, x: isRight ? -40 : 40 });
            gsap.set(card, { opacity: 0, scale: 0.88, rotation: randomRotation });

            const st = {
                trigger: row,
                scroller: '#petalPathPage',
                start: 'top 78%',
                toggleActions: 'play none none reverse'
            };

            gsap.to(card, { opacity: 1, scale: 1, rotation: randomRotation, duration: 0.9, ease: 'back.out(1.2)', scrollTrigger: st });
            gsap.to(note, { opacity: 1, x: 0, duration: 0.9, delay: 0.15, ease: 'power3.out', scrollTrigger: st });
        });
    }

    // ---- Scratch-off Canvas Setup ----
    document.querySelectorAll('.scratch-card-shell').forEach((shell, index) => {
        const canvas = shell.querySelector('.scratch-canvas');
        if (!canvas) return;

        // Wait for the shell to have a rendered size before setting canvas dims
        const init = () => {
            const w = shell.offsetWidth;
            const h = shell.offsetHeight;
            if (w === 0) { requestAnimationFrame(init); return; }

            canvas.width  = w * window.devicePixelRatio;
            canvas.height = h * window.devicePixelRatio;
            canvas.style.width  = '100%';
            canvas.style.height = '100%';

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            paintRedBokehFoil(ctx, w, h);

            // Brush settings for erasing
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = Math.max(w, h) * 0.22; // ~22% of heart width = 2-3 swipes

            let isDrawing = false;
            let isRevealed = false;
            let checkThrottle = 0;

            const pos = (e) => {
                const rect = canvas.getBoundingClientRect();
                const src  = e.touches ? e.touches[0] : e;
                return {
                    x: (src.clientX - rect.left),
                    y: (src.clientY - rect.top)
                };
            };

            const start = (e) => {
                if (isRevealed) return;
                isDrawing = true;
                const p = pos(e);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
            };

            const draw = (e) => {
                if (!isDrawing || isRevealed) return;
                e.preventDefault();
                const p = pos(e);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);

                checkThrottle++;
                if (checkThrottle % 8 === 0) checkPercent(ctx, canvas, w, h);
            };

            const stop = () => { isDrawing = false; ctx.beginPath(); };

            canvas.addEventListener('mousedown',  start);
            canvas.addEventListener('mousemove',  draw);
            canvas.addEventListener('mouseup',    stop);
            canvas.addEventListener('mouseleave', stop);
            canvas.addEventListener('touchstart', start, { passive: false });
            canvas.addEventListener('touchmove',  draw,  { passive: false });
            canvas.addEventListener('touchend',   stop);
            canvas.addEventListener('touchcancel',stop);

            // Auto-reveal when >20% scratched
            const checkPercent = (ctx, canvas, w, h) => {
                if (isRevealed) return;
                const data   = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let  trans   = 0;
                const stride = 16; // sample every 16th pixel for perf
                const total  = data.length / 4;
                for (let i = 3; i < data.length; i += 4 * stride) {
                    if (data[i] === 0) trans++;
                }
                if (trans / (total / stride) > 0.20) {
                    isRevealed = true;
                    if (typeof gsap !== 'undefined') {
                        gsap.to(canvas, {
                            opacity: 0, duration: 0.55, ease: 'power2.out',
                            onComplete: () => { canvas.style.pointerEvents = 'none'; }
                        });
                    } else {
                        canvas.style.opacity = '0';
                        canvas.style.pointerEvents = 'none';
                    }
                    // Celebration sparkle on the shell
                    shell.style.filter = 'drop-shadow(0 0 30px rgba(255,215,0,0.9)) drop-shadow(0 0 60px rgba(255,105,180,0.5))';
                    setTimeout(() => {
                        shell.style.transition = 'filter 1.5s ease';
                        shell.style.filter = 'drop-shadow(0 0 25px rgba(255, 200, 50, 0.8)) drop-shadow(0 0 60px rgba(255, 100, 20, 0.5))';
                    }, 600);
                    
                    // IF THIS IS THE 5TH MEMORY (index 4) - Trigger the transition!
                    if (index === 4) {
                        setTimeout(() => {
                            if (typeof window.startVinylTransition === 'function') {
                                window.startVinylTransition(shell);
                            } else if (typeof startVinylTransition === 'function') {
                                startVinylTransition(shell);
                            } else if (typeof window.go === 'function') {
                                window.go(4);
                            }
                        }, 1500);
                    }
                }
            };
        };

        requestAnimationFrame(init);
    });

    // ---- Dynamic Path Canvas Setup ----
    initDynamicPath();
}

/* ---- Paints the rich glossy red bokeh heart ---- */
let cachedFoilCanvas = null;

function paintRedBokehFoil(ctx, w, h) {
    if (!cachedFoilCanvas || cachedFoilCanvas.width !== w || cachedFoilCanvas.height !== h) {
        cachedFoilCanvas = document.createElement('canvas');
        cachedFoilCanvas.width = w;
        cachedFoilCanvas.height = h;
        const octx = cachedFoilCanvas.getContext('2d');
        
        // Base gradient: Deep glossy red/wine
        const cx = w / 2;
        const cy = h / 2.5; // High center for light source
        const grad = octx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
        grad.addColorStop(0, '#e83e60'); // Bright center
        grad.addColorStop(0.4, '#ba0a32');
        grad.addColorStop(0.8, '#6b0015');
        grad.addColorStop(1, '#3a0009'); // Deep edge shadow
        
        octx.fillStyle = grad;
        octx.fillRect(0, 0, w, h);

        // Draw bokeh lights
        octx.globalCompositeOperation = 'screen';
        
        // Generate ~40 bokeh circles
        for (let i = 0; i < 40; i++) {
            // Cluster more near the center, spread out occasionally
            const x = cx + (Math.random() - 0.5) * w * 0.7;
            const y = cy + (Math.random() - 0.5) * h * 0.7;
            const r = Math.random() * (w * 0.08) + 10;
            
            // Random golden/white colors
            const colors = [
                {r: 255, g: 230, b: 150, a: 0.4}, 
                {r: 255, g: 200, b: 100, a: 0.3}, 
                {r: 255, g: 255, b: 255, a: 0.2}, 
                {r: 255, g: 180, b: 150, a: 0.2}
            ];
            const c = colors[Math.floor(Math.random() * colors.length)];
            
            const bokeh = octx.createRadialGradient(x, y, 0, x, y, r);
            bokeh.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
            bokeh.addColorStop(0.7, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a * 0.5})`);
            bokeh.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
            
            octx.beginPath();
            octx.arc(x, y, r, 0, Math.PI * 2);
            octx.fillStyle = bokeh;
            octx.fill();
        }
        
        // Add inner glossy highlight (3D rim light)
        octx.globalCompositeOperation = 'overlay';
        const rimGrad = octx.createLinearGradient(0, 0, 0, h);
        rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        rimGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
        rimGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
        rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        octx.fillStyle = rimGrad;
        octx.fillRect(0, 0, w, h);

        // "scratch to reveal" elegant text
        octx.globalCompositeOperation = 'source-over';
        octx.fillStyle = 'rgba(255, 255, 255, 1)';
        octx.shadowColor = 'rgba(255, 200, 100, 1)';
        octx.shadowBlur = 15;
        octx.font = `italic ${Math.max(36, w * 0.09)}px "Cormorant Garamond", serif`;
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillText('scratch to reveal', cx, cy + (h * 0.08));
        octx.shadowBlur = 0; // reset
    }
    
    // Draw the cached canvas onto the actual scratch context instantly!
    ctx.drawImage(cachedFoilCanvas, 0, 0);
}

/* ---- Dynamic Path Canvas Engine ---- */
function initDynamicPath() {
    const canvas = document.getElementById('pathCanvas');
    const timeline = document.getElementById('scratchTimeline');
    if (!canvas || !timeline) return;

    let ctx = canvas.getContext('2d');
    let width, height;
    
    // We will collect the points of the bezier curves to use for scattering
    let points = [];
    
    function drawPath() {
        width = timeline.offsetWidth;
        height = timeline.offsetHeight;
        
        // Match device pixel ratio for crisp lines
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Reset points so we don't accumulate on resize
        points = [];
        
        ctx.clearRect(0, 0, width, height);
        
        // Build waypoints at the CENTER of each heart
        // Row layout: right, left, right, left, right
        // Hearts are vertically centered in each row
        const segments = 5;
        const rowH = height / segments;
        const leftX = width * 0.25;
        const rightX = width * 0.75;
        
        // Waypoints: where each heart's center is
        const waypoints = [];
        for (let i = 0; i < segments; i++) {
            const centerY = rowH * i + rowH * 0.5; // vertical center of this row
            const x = (i % 2 === 0) ? rightX : leftX; // alternating sides
            waypoints.push({x, y: centerY});
        }
        
        // Draw the path: start from top, curve through each waypoint, end at bottom
        ctx.beginPath();
        // Start above the first waypoint
        ctx.moveTo(waypoints[0].x, 0);
        
        // Line to first waypoint
        const firstWp = waypoints[0];
        ctx.quadraticCurveTo(firstWp.x, firstWp.y * 0.5, firstWp.x, firstWp.y);
        
        // Save first segment for scattering
        points.push(
            {x: firstWp.x, y: 0},
            {x: firstWp.x, y: firstWp.y * 0.25},
            {x: firstWp.x, y: firstWp.y * 0.75},
            {x: firstWp.x, y: firstWp.y}
        );
        
        // Curve through each pair of waypoints
        for (let i = 0; i < waypoints.length - 1; i++) {
            const p0 = waypoints[i];
            const p1 = waypoints[i + 1];
            
            // Control points: keep X at each side's position for a wide smooth S
            const cp1X = p0.x;
            const cp1Y = p0.y + (p1.y - p0.y) * 0.45;
            const cp2X = p1.x;
            const cp2Y = p1.y - (p1.y - p0.y) * 0.45;
            
            ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, p1.x, p1.y);
            
            points.push(
                {x: p0.x, y: p0.y},
                {x: cp1X, y: cp1Y},
                {x: cp2X, y: cp2Y},
                {x: p1.x, y: p1.y}
            );
        }
        
        // Continue from last waypoint to bottom
        const lastWp = waypoints[waypoints.length - 1];
        ctx.quadraticCurveTo(lastWp.x, height - rowH * 0.2, lastWp.x, height);
        
        points.push(
            {x: lastWp.x, y: lastWp.y},
            {x: lastWp.x, y: lastWp.y + (height - lastWp.y) * 0.3},
            {x: lastWp.x, y: lastWp.y + (height - lastWp.y) * 0.7},
            {x: lastWp.x, y: height}
        );
        
        // Draw the 3D golden ribbon — proportional to screen
        const baseWidth = Math.max(50, Math.min(width * 0.06, 90));
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // 1. Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 8;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = baseWidth;
        ctx.stroke();
        ctx.restore();

        // 2. Dark gold edge
        ctx.strokeStyle = '#7a5510';
        ctx.lineWidth = baseWidth;
        ctx.stroke();
        
        // 3. Main gold body
        ctx.strokeStyle = '#c49a37';
        ctx.lineWidth = baseWidth * 0.88;
        ctx.stroke();

        // 4. Bright gold highlight
        ctx.strokeStyle = '#e8c95e';
        ctx.lineWidth = baseWidth * 0.55;
        ctx.stroke();

        // 5. Core light reflection
        ctx.strokeStyle = '#f5e6a8';
        ctx.lineWidth = baseWidth * 0.18;
        ctx.stroke();

        // 6. Glowing dust trail
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 230, 150, 0.7)';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255, 200, 80, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
        
        // Scatter Petals along the path
        scatterPetals();
    }
    
    // We sample points along the Bezier curves to scatter petals
    function scatterPetals() {
        // Subtle shadow for red diamonds
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(200, 0, 50, 0.3)';
        
        // Use the saved curve segments to scatter petals
        for (let i = 0; i < points.length; i += 4) {
            const p0 = points[i];
            const p1 = points[i+1];
            const p2 = points[i+2];
            const p3 = points[i+3];
            
            if (!p3) break;
            
            // Seeded random for consistent scattering (so petals don't jitter on resize)
            // Or just allow random, but since drawPath is only called on resize/init, it's fine.
            for (let t = 0; t <= 1; t += 0.025) {
                // Bezier calculation
                const omt = 1 - t;
                const omt3 = omt * omt * omt;
                const omt2 = omt * omt;
                const t3 = t * t * t;
                const t2 = t * t;
                
                const x = omt3 * p0.x + 3 * omt2 * t * p1.x + 3 * omt * t2 * p2.x + t3 * p3.x;
                const y = omt3 * p0.y + 3 * omt2 * t * p1.y + 3 * omt * t2 * p2.y + t3 * p3.y;
                
                // Keep diamonds close to the ribbon
                const offsetX = (Math.random() - 0.5) * 50;
                const offsetY = (Math.random() - 0.5) * 50;
                
                // Draw a red diamond
                drawPetal(x + offsetX, y + offsetY, Math.random() * Math.PI * 2, Math.random() * 0.5 + 0.5);
                
                // Draw golden sparkle dust close to the path
                if (Math.random() > 0.5) {
                    ctx.fillStyle = `rgba(255, 220, 100, ${0.4 + Math.random() * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    function drawPetal(x, y, rotation, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        // Make the diamonds small and sharp
        ctx.scale(scale * 0.4, scale * 0.4);
        
        // Deep red/ruby diamond color
        ctx.fillStyle = '#c70a2f';
        if (Math.random() > 0.6) ctx.fillStyle = '#e81742'; // some brighter ruby
        
        ctx.beginPath();
        // Diamond shape
        ctx.moveTo(0, -10);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // Initial draw
    setTimeout(drawPath, 100);
    setTimeout(drawPath, 1000); // safety catch after images load
    
    // Re-draw on resize
    window.addEventListener('resize', drawPath);
}
