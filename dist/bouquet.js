/* ===== BOUQUET BUILDER ===== */
let bouquetBuilt = false;

function buildBouquet(){
  console.log("buildBouquet called! bouquetBuilt:", bouquetBuilt);
  if(bouquetBuilt) return; // Prevent rebuilding
  bouquetBuilt = true;

  const bqSvg=document.getElementById('bqSvg');
  console.log("bqSvg element:", bqSvg);
  if(!bqSvg) return;

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

  function pp(rx,ry){
      return `M0 0 C ${-rx} ${-ry*0.32}, ${-rx} ${-ry}, 0 ${-ry} C ${rx} ${-ry}, ${rx} ${-ry*0.32}, 0 0 Z`;
  }
  
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
  
  const grp=document.createElementNS('http://www.w3.org/2000/svg','g');
  [...bqSvg.childNodes].forEach(n=>{if(n.nodeName!=='defs')grp.appendChild(n);});
  bqSvg.appendChild(grp);
  
  const cap=document.getElementById('bqCap');
  if (cap) {
      cap.style.animation='none';
      void cap.offsetWidth;
      cap.style.animation='';
  }
}
