/* stars */
const starWrap=document.getElementById('stars');
for(let i=0;i<55;i++){
    const s=document.createElement('div');
    s.className='star';
    const sz=Math.random()*2.4+1;
    s.style.width=s.style.height=sz+'px';
    s.style.left=Math.random()*100+'vw';
    s.style.top=Math.random()*100+'vh';
    s.style.animationDelay=(Math.random()*3.4)+'s';
    starWrap.appendChild(s);
}

/* nav */
const pages=document.querySelectorAll('.page');
const TOTAL=pages.length;
let current=0;
const dotsWrap=document.getElementById('dots');
for(let i=0;i<TOTAL;i++){
    const d=document.createElement('span');
    d.className='dot';
    dotsWrap.appendChild(d);
}
const dots=dotsWrap.querySelectorAll('.dot');
const backBtn=document.getElementById('backBtn');
const BQ=6; // Bouquet page is index 6

function go(n){
    // STRICT SCENE ISOLATION
    pages.forEach((p, i) => {
        if (i === n) {
            p.classList.add('active');
            p.style.display = 'flex';
            p.style.opacity = '1';
            p.style.pointerEvents = 'auto';
            p.style.zIndex = '10';
        } else {
            p.classList.remove('active');
            p.style.display = 'none';
            p.style.opacity = '0';
            p.style.pointerEvents = 'none';
            p.style.zIndex = '-1';
        }
    });
    
    current=n;
    const pg=pages[current];
    void pg.offsetWidth; // trigger reflow
    
    dots.forEach((d,i)=>d.classList.toggle('active',i===current));
    backBtn.classList.toggle('hidden',current===0);
    scrollTo(0,0);
    
    if(n===BQ) buildBouquet();
    
    if(n===1 && typeof initConstellation === 'function') initConstellation();
    if(n===2 && typeof initMemories === 'function') initMemories();
    if(n===3 && typeof initPetalPath === 'function') initPetalPath();
}
window.go = go;
window.skipNext = () => { if(current < TOTAL-1) go(current+1); };
window.skipScene = () => {
    const envelope = document.getElementById('vintageEnvelopeContainer');
    const finale = document.getElementById('finale-container');
    const promise = document.getElementById('promise-scene');
    
    // Check if we are in the end-game overlays
    if (finale && finale.style.display !== 'none' && promise && promise.style.display !== 'none') {
        acceptPromise();
    } else if (envelope && envelope.style.display !== 'none') {
        startFinale();
    } else {
        // We are in the .page flow
        if (current < TOTAL - 1) {
            go(current + 1);
        } else {
            if (typeof transitionToLetterGrid === 'function') transitionToLetterGrid();
        }
    }
};
go(0);
backBtn.addEventListener('click',()=>{
    if(current>0) go(current-1);
});

/* hearts */
const hChars=['💖','💕','💗','🩷','💞','🌸','🌹'];
function spawnHeart(){
    const h=document.createElement('div');
    h.className='heart';
    h.textContent=hChars[Math.floor(Math.random()*hChars.length)];
    h.style.left=Math.random()*100+'vw';
    h.style.fontSize=(15+Math.random()*22)+'px';
    h.style.animationDuration=(7+Math.random()*7)+'s';
    document.getElementById('hearts').appendChild(h);
    setTimeout(()=>h.remove(),14000);
}
setInterval(spawnHeart,720);

/* confetti */
const canvas=document.getElementById('confetti'),ctx=canvas.getContext('2d');
let pieces=[];
function rz(){canvas.width=innerWidth;canvas.height=innerHeight;}
rz();
addEventListener('resize',rz);
const cc=['#FF7E9D','#FFC2D2','#E8C07D','#C8264F','#B574AE','#FFFFFF'];

function burst(n=140,sp=false){
    for(let i=0;i<n;i++){
        pieces.push({
            x:canvas.width/2+(sp?(Math.random()-.5)*canvas.width:0),
            y:sp?-20:canvas.height/3,
            vx:(Math.random()-.5)*9,
            vy:Math.random()*-9-4,
            g:.18+Math.random()*.1,
            size:6+Math.random()*7,
            color:cc[Math.floor(Math.random()*cc.length)],
            rot:Math.random()*6.28,
            vr:(Math.random()-.5)*.3,
            life:140+Math.random()*60
        });
    }
}
function cloop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{
        p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.life--;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle=p.color;
        ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.6);
        ctx.restore();
    });
    pieces=pieces.filter(p=>p.life>0&&p.y<canvas.height+40);
    requestAnimationFrame(cloop);
}
cloop();

function bigBurst(){burst(240,true);}
window.bigBurst = bigBurst;

/* music */
const bgMusic = document.getElementById('bg-music');
const mB = document.getElementById('musicBtn');
const mL = document.getElementById('musicLabel');
let isPlaying = false;

mB.addEventListener('click', () => {
    if(!isPlaying) {
        bgMusic.volume = 0.4;
        bgMusic.play().then(() => {
            isPlaying = true;
            mB.classList.add('playing');
            mL.textContent = 'Pause';
        }).catch(e => console.log('Audio autoplay prevented'));
    } else {
        bgMusic.pause();
        isPlaying = false;
        mB.classList.remove('playing');
        mL.textContent = 'Music';
    }
});

/* yes/no running button */
const noLines=["Aww are you sure? 🥺","Pretty pleaseee? 🐰💕","Don't be like that 😳","My heart can't take it 💔","Okayy I'll keep asking… 🙈","Say yes, you cutie 😤💗","Fine… 'No' is running! 🏃💨"];
function setupNo(no,yes,re){
    const nb=document.getElementById(no), yb=document.getElementById(yes), r=document.getElementById(re);
    if (!nb || !yb || !r) return; // FIX: Prevents crash if element is missing
    let t=0, run=false;
    
    nb.addEventListener('click', () => {
        t++;
        r.textContent=noLines[Math.min(t-1,noLines.length-1)];
        yb.style.fontSize=(16*Math.min(1+t*0.16,1.9))+'px';
        nb.style.fontSize=(16*Math.max(1-t*0.13,0.45))+'px';
        burst(28);
        if(t>=4 && !run){
            run=true;
            nb.addEventListener('mouseover', e => dodge(e.currentTarget));
        }
        if(t>=4) dodge(nb);
    });
}
function dodge(el){
    el.style.position='relative';
    el.style.transform='translate('+((Math.random()-.5)*170)+'px,'+((Math.random()-.5)*66)+'px) scale(.6)';
}
setupNo('q1no','q1yes','q1react');

/* ===== GENERATE GALLERIES ===== */
// Her Gallery (Horizontal 15-20 photos)
const herGallery = document.getElementById('her-gallery');
const herCaptions = [
    "My Cutie", "That smile", "Beautiful", "Mast Billo", "My Rasmalai", 
    "Perfect", "Angel", "My world", "Stunning", "Gorgeous",
    "Mine", "Precious", "Cutest", "Sunshine", "My love"
];
if(herGallery) {
    for(let i=1; i<=15; i++) {
        const p = document.createElement('div');
        p.className = 'polaroid';
        p.style.transform = `rotate(${(Math.random() - 0.5) * 6}deg)`;
        p.innerHTML = `
            <img src="her${i}.jpg" onerror="this.src='placeholder_eyes.jpg'" style="height:250px;">
            <div class="polaroid-caption">${herCaptions[i-1] || "My love"}</div>
        `;
        herGallery.appendChild(p);
    }
}

// Our Deck (Stacked 5 photos)
const usDeck = document.getElementById('us-deck');
const usCaptions = ["Together", "Never leaving", "My best friend", "Always", "Us ❤️"];
if (usDeck) {
    for(let i=5; i>=1; i--) { // Reverse order so 1 is on top
        const c = document.createElement('div');
        c.className = 'polaroid deck-card';
        const rotation = (Math.random() - 0.5) * 10;
        c.style.transform = `rotate(${rotation}deg)`;
        c.style.zIndex = (6-i);
        c.innerHTML = `
            <img src="us${i}.jpg" onerror="this.src='placeholder_eyes.jpg'" style="height:280px;">
            <div class="polaroid-caption">${usCaptions[i-1]}</div>
        `;
        
        // Tap to swipe
        c.addEventListener('click', function() {
            this.classList.add('swiped');
            // If last card is swiped, automatically advance
            if(i === 1) setTimeout(() => go(7), 800);
        });
        usDeck.appendChild(c);
    }
}

/* ===== BOUQUET BUILDER ===== */
const bqSvg=document.getElementById('bqSvg');
const palettes=[
    ['#A11539','#C8264F','#E2557A','#F6A7BE'],['#E06E96','#EE92B2','#F8BBD0','#FFE2EC'],
    ['#B83C5E','#CF6480','#E596AC','#F6CCD8'],['#D9713F','#E89568','#F4BD98','#FCE0CC'],
    ['#8E1C3C','#AE2C53','#C95878','#E89BB2'],['#B574AE','#C794C2','#DDB8D9','#F1E0EF'],
    ['#CDA876','#E2C49C','#F1DEC4','#FBF1E4']
];
const KN={x:200,y:392};
const flowers=[
    {cx:114,cy:152,r:37,p:0,o:0},{cx:286,cy:152,r:37,p:4,o:1},{cx:150,cy:182,r:34,p:3,o:2},
    {cx:250,cy:182,r:34,p:2,o:3},{cx:152,cy:110,r:40,p:1,o:4},{cx:248,cy:110,r:40,p:5,o:5},
    {cx:200,cy:146,r:38,p:6,o:6},{cx:200,cy:80,r:46,p:0,o:7}
];

function pp(rx,ry){return `M0 0 C ${-rx} ${-ry*0.32}, ${-rx} ${-ry}, 0 ${-ry} C ${rx} ${-ry}, ${rx} ${-ry*0.32}, 0 0 Z`;}
function ring(c,rx,ry,g,ro){
    let s='';
    for(let i=0;i<c;i++){
        const a=ro+i*(360/c);
        s+=`<g transform="rotate(${a})"><path d="${pp(rx,ry)}" fill="url(#${g})" stroke="#3a0f1e" stroke-opacity="0.18" stroke-width="0.6"/></g>`;
    }
    return s;
}
function spiral(R){
    const tn=2.3,st=46;
    let d='';
    for(let i=0;i<=st;i++){
        const t=i/st,an=t*tn*2*Math.PI,rd=t*R;
        d+=(i===0?'M':'L')+(Math.cos(an)*rd).toFixed(1)+' '+(Math.sin(an)*rd).toFixed(1)+' ';
    }
    return d;
}
function rose(r,p){
    let s='';
    s+=ring(7,r*0.42,r*0.98,'gO'+p,0);
    s+=ring(6,r*0.36,r*0.70,'gO'+p,26);
    s+=ring(5,r*0.28,r*0.46,'gI'+p,14);
    s+=`<path d="${spiral(r*0.22)}" fill="none" stroke="${palettes[p][0]}" stroke-width="${(r*0.05).toFixed(2)}" stroke-linecap="round" opacity="0.8"/>`;
    s+=`<circle r="${(r*0.07).toFixed(2)}" fill="${palettes[p][3]}"/>`;
    return s;
}

function buildBouquet(){
  if(bqSvg.innerHTML !== "") return; // Prevent rebuilding
  
  let grads='';
  palettes.forEach((c,i)=>{
      grads+=`<radialGradient id="gO${i}" cx="50%" cy="32%" r="72%"><stop offset="0" stop-color="${c[2]}"/><stop offset="0.55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[0]}"/></radialGradient><radialGradient id="gI${i}" cx="50%" cy="34%" r="72%"><stop offset="0" stop-color="${c[3]}"/><stop offset="1" stop-color="${c[1]}"/></radialGradient>`;
  });
  
  const defs=`<defs>${grads}<linearGradient id="stemGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3c6b4c"/><stop offset="1" stop-color="#5f9670"/></linearGradient><linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#62996f"/><stop offset="1" stop-color="#3f6b4e"/></linearGradient><linearGradient id="wrapGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3552"/><stop offset="1" stop-color="#3a1325"/></linearGradient><linearGradient id="wrapGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c4c6c"/><stop offset="1" stop-color="#56233e"/></linearGradient><linearGradient id="bowGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4D79B"/><stop offset="1" stop-color="#C99B57"/></linearGradient></defs>`;
  const wrap=`<g class="wrap"><path d="M200 372 L138 540 Q200 558 262 540 Z" fill="url(#wrapGrad)"/><path d="M200 372 L156 540 Q200 552 244 540 Z" fill="url(#wrapGrad2)" opacity="0.92"/></g>`;
  
  let stems='';
  flowers.forEach(f=>{
      const by=f.cy+f.r*0.6,cxC=(KN.x+f.cx)/2+(f.cx-200)*0.22,cyC=(KN.y+by)/2,dl=(0.4+f.o*0.5).toFixed(2);
      stems+=`<path class="stem" d="M${KN.x} ${KN.y} Q${cxC} ${cyC.toFixed(1)} ${f.cx} ${by.toFixed(1)}" style="animation-delay:${dl}s"/>`;
  });
  
  function leaf(x,y,rot,dl,fl){
      const d=fl?"M0 0 C 26 -8 50 4 60 26 C 34 26 10 18 0 2 Z":"M0 0 C -26 -8 -50 4 -60 26 C -34 26 -10 18 0 2 Z";
      return `<g class="leaf" style="animation-delay:${dl}s" transform="translate(${x},${y}) rotate(${rot})"><path d="${d}" fill="url(#leafGrad)"/></g>`;
  }
  
  const leaves=leaf(196,318,18,1.9,false)+leaf(204,318,-18,2.3,true)+leaf(192,348,8,2.7,false);
  let heads='';
  flowers.forEach(f=>{
      const dl=(0.4+f.o*0.5+0.5).toFixed(2);
      heads+=`<g transform="translate(${f.cx},${f.cy})"><g class="bloom" style="animation-delay:${dl}s">${rose(f.r,f.p)}</g></g>`;
  });
  
  const bd=(0.4+flowers.length*0.5+0.2).toFixed(2);
  const bow=`<g class="bowpart" style="animation-delay:${bd}s"><path d="M200 388 Q150 362 138 394 Q150 424 200 400 Z" fill="url(#bowGrad)"/><path d="M200 388 Q250 362 262 394 Q250 424 200 400 Z" fill="url(#bowGrad)"/><path d="M196 398 Q176 452 158 470 L172 472 Q190 442 200 404 Z" fill="#D9A95E"/><path d="M204 398 Q224 452 242 470 L228 472 Q210 442 200 404 Z" fill="#D9A95E"/><circle cx="200" cy="394" r="11" fill="#F0CC84"/></g>`;
  
  bqSvg.innerHTML=defs+wrap+stems+leaves+heads+bow;
  
  // Hack to force SVG animation re-trigger
  const grp=document.createElementNS('http://www.w3.org/2000/svg','g');
  [...bqSvg.childNodes].forEach(n=>{if(n.nodeName!=='defs')grp.appendChild(n);});
  bqSvg.appendChild(grp);
  
  const cap=document.getElementById('bqCap');
  cap.style.animation='none';
  void cap.offsetWidth;
  cap.style.animation='';
}

function transitionToLetterGrid() {
    const tl = gsap.timeline();
    const bqHeader = document.getElementById('bqHeader');
    const bqCap = document.getElementById('bqCap');
    const bqEyebrow = document.getElementById('bqEyebrow');
    const bqSvg = document.getElementById('bqSvg');
    const bqWrap = document.getElementById('bqWrap');
    
    // Optimization: Remove the extremely heavy double drop-shadows before animating
    if (bqWrap) {
        bqWrap.style.filter = 'none';
        bqWrap.classList.remove('bouquet-glow');
    }
    
    // Optimization: Hint to browser
    gsap.set(bqSvg, { willChange: "transform, filter, opacity" });
    
    // Fade out text elements and completely hide the original button
    tl.to([bqHeader, bqCap, bqEyebrow], {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
            if (bqCap) bqCap.style.display = 'none';
        }
    }, 0);
    
    // Scale and blur the bouquet with optimized values
    tl.to(bqSvg, {
        scale: 4,
        filter: "blur(15px)", // Reduced from 25px to prevent GPU thrashing
        opacity: 0.4, // Fading it down creates the bokeh effect without needing as much blur
        duration: 1.5, // Slightly faster to feel more responsive
        ease: "power2.inOut"
    }, 0.2);
    
    // Show the modal
    const overlay = document.getElementById('letterGridOverlay');
    const modal = document.getElementById('letterModal');
    const cards = document.querySelectorAll('.letter-card');
    
    tl.call(() => {
        overlay.style.display = 'flex';
    }, null, 1.0);
    
    tl.to(modal, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
    }, 1.0);
    
    tl.fromTo(cards, 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.1, duration: 0.5, ease: "back.out(1.5)" },
        1.2
    );
}

let envelopeHoverTween = null;

function transitionToEnvelope(e) {
    if (e) e.stopPropagation();
    const tl = gsap.timeline();
    const modal = document.getElementById('letterModal');
    const envelopeContainer = document.getElementById('vintageEnvelopeContainer');
    const promptText = document.getElementById('envelopePrompt');
    
    // 1. Fade out the grid modal smoothly and slide down
    tl.to(modal, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => { modal.style.display = 'none'; }
    });
    
    // 2. Show the envelope container
    tl.call(() => {
        envelopeContainer.style.display = 'flex';
    }, null, 0.5);
    
    tl.to(envelopeContainer, {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, 0.6);
    
    // 3. Fade in the text prompt
    tl.to(promptText, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
    }, 1.2);
}

function openWaxSeal() {
    const seal = document.getElementById('waxSeal');
    const flap = document.querySelector('.envelope-flap-top');
    const scroll = document.getElementById('paperLetterContent');
    const wrapper = document.querySelector('.envelope-wrapper');
    const promptText = document.getElementById('envelopePrompt');
    const paragraphs = scroll.querySelectorAll('.letter-para');
    const doodles = scroll.querySelectorAll('.ink-doodle');
    
    // Prevent double clicks and remove cursor pointer
    wrapper.onclick = null;
    wrapper.style.cursor = 'default';
    
    const tl = gsap.timeline();
    
    // 1. Break the seal & fade prompt
    tl.to(seal, { scale: 1.3, opacity: 0, duration: 0.5, ease: "power2.in" }, 0);
    tl.to(promptText, { 
        opacity: 0, 
        duration: 0.5,
        onComplete: () => { promptText.remove(); }
    }, 0);
    tl.set(seal, { display: 'none' });
    
    // 2. Open the flap (rotateX 180)
    tl.to(flap, {
        rotateX: 180,
        duration: 1.2,
        ease: "power3.inOut"
    }, 0.5);
    
    // 3. Slide the scroll UP out of the envelope
    tl.to(scroll, {
        yPercent: -80, // move up
        duration: 1.5,
        ease: "power2.inOut"
    }, 1.2);
    
    // 4. Fade out envelope physical parts AND immediately disable pointer-events
    tl.to('.envelope-back, .envelope-front-pocket, .envelope-flap-top', {
        opacity: 0,
        duration: 0.8,
        onStart: () => {
            // Immediately kill pointer-events so they can't block the letter content
            document.querySelectorAll('.envelope-back, .envelope-front-pocket, .envelope-flap-top').forEach(el => {
                el.style.pointerEvents = 'none';
            });
        }
    }, 2.5);
    
    // 5. Expand wrapper AND scroll to full size seamlessly
    tl.set(wrapper, { animation: 'none' }, 2.8);
    
    tl.to(wrapper, {
        width: '80vw',
        maxWidth: 'none',
        height: '80vh',
        duration: 1.2,
        ease: "power2.inOut"
    }, 2.8);

    tl.to(scroll, {
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        yPercent: 0,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => { 
            const textContainer = scroll.querySelector('.letter-text-container');
            if (textContainer) {
                textContainer.style.overflowY = 'auto'; 
                textContainer.style.overflowX = 'hidden'; 
            }
        }
    }, 2.8);

    // Fade in clipboard clip
    tl.to('.clipboard-clip', {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
    }, 3.5);
    
    // 6. Text bleed animation (opacity and blur)
    tl.to(paragraphs, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.5,
        duration: 1.2,
        ease: "power2.out"
    }, 3.8);
    
    // 7. Fade in ink doodles and button
    tl.to(doodles, {
        opacity: 1,
        stagger: 0.3,
        duration: 1.2,
        ease: "power1.out"
    }, 4.8);

    tl.to('.letter-keep-going', {
        opacity: 1,
        duration: 1.2,
        ease: "power1.out",
        onComplete: () => {
            // Ensure button is definitely clickable
            const btn = document.getElementById('letterPromiseBtn');
            if (btn) {
                btn.style.pointerEvents = 'auto';
                btn.style.zIndex = '100';
            }
        }
    }, 4.8);
}

function closePaperLetter() {
    const envelopeContainer = document.getElementById('vintageEnvelopeContainer');
    
    gsap.to(envelopeContainer, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
            envelopeContainer.style.display = 'none';
            // Transition to Scene 6 (Our Moments stacked deck)
            const scene6 = document.querySelector('.page:nth-child(8)'); 
            // We just trigger go() to navigate
            go(5); 
        }
    });
}

/* =========================================
   FINALE LOGIC (Cake, Promise, End)
   ========================================= */

function startFinale() {
    const envelopeContainer = document.getElementById('vintageEnvelopeContainer');
    const finaleContainer = document.getElementById('finale-container');
    const promiseScene = document.getElementById('promise-scene');
    
    // Fade out letter
    gsap.to(envelopeContainer, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            envelopeContainer.style.display = 'none';
            // Start finale
            finaleContainer.style.display = 'block';
            promiseScene.style.display = 'flex';
            promiseScene.style.opacity = 0;
            finaleContainer.classList.remove('finale-hidden');
            
            // Fade in finale container (shows promise scene directly)
            gsap.to(finaleContainer, {
                opacity: 1,
                duration: 1.5,
                ease: "power2.inOut"
            });
            
            gsap.to(promiseScene, { 
                opacity: 1, 
                duration: 1.5,
                ease: "power2.inOut" 
            });
        }
    });
}

// Runaway Button Logic
const runawayBtn = document.getElementById('runawayBtn');
const promiseYesBtn = document.getElementById('promiseYesBtn');
const promiseReact = document.getElementById('promiseReact');

if (runawayBtn && promiseYesBtn && promiseReact) {
    const noLines=["Aww are you sure? 🥺","Pretty pleaseee? 🐰💕","Don't be like that 😳","My heart can't take it 💔","Okayy I'll keep asking… 🙈","Say yes, you cutie 😤💗","Fine… 'No' is running! 🏃💨"];
    let t = 0;
    let isRunning = false;
    
    const dodge = () => {
        runawayBtn.style.position = 'absolute';
        const randomX = Math.floor(Math.random() * 80); // 0 to 80%
        const randomY = Math.floor(Math.random() * 80); // 0 to 80%
        runawayBtn.style.left = randomX + '%';
        runawayBtn.style.top = randomY + '%';
        runawayBtn.style.transform = `scale(${Math.max(1 - t * 0.13, 0.45)})`;
    };
    
    runawayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        t++;
        promiseReact.textContent = noLines[Math.min(t - 1, noLines.length - 1)];
        
        // Scale buttons
        promiseYesBtn.style.transform = `scale(${Math.min(1 + t * 0.16, 1.9)})`;
        if (t < 4) runawayBtn.style.transform = `scale(${Math.max(1 - t * 0.13, 0.45)})`;
        
        // Add confetti burst
        if (typeof confetti === 'function') {
            confetti({ particleCount: 28, spread: 50, origin: { y: 0.6 } });
        }
        
        if (t >= 4 && !isRunning) {
            isRunning = true;
            runawayBtn.addEventListener('mouseover', dodge);
            runawayBtn.addEventListener('touchstart', (evt) => {
                evt.preventDefault();
                dodge();
            }, { passive: false });
        }
        if (t >= 4) dodge();
    });
}

function acceptPromise() {
    const promiseScene = document.getElementById('promise-scene');
    const endScene = document.getElementById('end-scene');
    
    gsap.to(promiseScene, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            promiseScene.style.display = 'none';
            endScene.style.display = 'flex';
            endScene.style.opacity = 0;
            gsap.to(endScene, { opacity: 1, duration: 2 });
            
            // Also fade out the dark background to reveal stars behind it
            gsap.to('#finale-container', { backgroundColor: 'rgba(0,0,0,0)', duration: 2 });
        }
    });
}

function startFallingPetals() {
    const container = document.getElementById('animation-layer') || document.body;
    const petals = ['🌸', '🌹', '🌺', '🌷', '💮'];
    
    // Create petal styles if they don't exist
    if (!document.getElementById('petal-styles')) {
        const style = document.createElement('style');
        style.id = 'petal-styles';
        style.innerHTML = `
            @keyframes petalFall {
                0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translateY(110vh) rotate(360deg) scale(1.2); opacity: 0; }
            }
            @keyframes petalDrift {
                0% { transform: translateX(0px); }
                50% { transform: translateX(80px); }
                100% { transform: translateX(-80px); }
            }
            .falling-petal {
                position: fixed;
                top: 0;
                z-index: 9105;
                pointer-events: none;
                user-select: none;
                will-change: transform, opacity;
                font-size: clamp(20px, 4vw, 32px);
                animation: petalFall linear forwards;
            }
            .falling-petal-inner {
                animation: petalDrift ease-in-out infinite alternate;
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }

    function spawnPetal() {
        const outer = document.createElement('div');
        outer.className = 'falling-petal';
        outer.style.left = Math.random() * 100 + 'vw';
        
        // Randomize fall duration (4s to 10s)
        const fallDuration = 4 + Math.random() * 6;
        outer.style.animationDuration = fallDuration + 's';
        
        const inner = document.createElement('div');
        inner.className = 'falling-petal-inner';
        inner.textContent = petals[Math.floor(Math.random() * petals.length)];
        
        // Randomize drift duration (2s to 5s)
        const driftDuration = 2 + Math.random() * 3;
        inner.style.animationDuration = driftDuration + 's';
        
        // Randomize initial drift position
        inner.style.animationDelay = -(Math.random() * driftDuration) + 's';
        
        outer.appendChild(inner);
        container.appendChild(outer);
        
        // Remove from DOM when animation ends
        setTimeout(() => {
            if (outer.parentNode) outer.remove();
        }, fallDuration * 1000 + 100);
    }
    
    // Spawn continuously for 15 seconds
    const interval = setInterval(spawnPetal, 150);
    setTimeout(() => clearInterval(interval), 15000);
}

window.startFinale = startFinale;
window.transitionToLetterGrid = transitionToLetterGrid;
window.acceptPromise = acceptPromise;
window.startFallingPetals = startFallingPetals;

// Attach event listener for the Promise button
(function() {
    const promiseBtn = document.getElementById('letterPromiseBtn');
    if (promiseBtn) {
        promiseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startFinale();
        });
    }
})();
