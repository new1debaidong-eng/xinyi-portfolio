(()=>{
 const h=document.querySelector('.particle-heading');if(!h)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');h.append(canvas);
 const ctx=canvas.getContext('2d'),sample=document.createElement('canvas'),sc=sample.getContext('2d',{willReadFrequently:true});
 let points=[],w=0,ht=0,mouse=null,visible=true,raf=0;
 function build(){
  h.classList.remove('ready');const box=h.getBoundingClientRect();w=box.width;ht=box.height;if(!w||!ht)return;
  const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(ht*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);sample.width=Math.ceil(w);sample.height=Math.ceil(ht);sc.clearRect(0,0,w,ht);points=[];
  for(const line of h.querySelectorAll(':scope > span,:scope > em')){
   const s=getComputedStyle(line),r=line.getBoundingClientRect(),size=parseFloat(s.fontSize),lh=parseFloat(s.lineHeight);sc.font=`${s.fontStyle} ${s.fontWeight} ${size}px ${s.fontFamily}`;sc.fillStyle=s.color;sc.textBaseline='alphabetic';if('letterSpacing' in sc)sc.letterSpacing=s.letterSpacing;sc.fillText(line.textContent,r.left-box.left,r.top-box.top+(lh-size)/2+size*.8);
  }
  const data=sc.getImageData(0,0,sample.width,sample.height).data;
  for(let y=0;y<ht;y+=2)for(let x=0;x<w;x+=2){const i=(y*sample.width+x)*4;if(data[i+3]>100)points.push({x,y,ox:x,oy:y,vx:0,vy:0,c:`rgba(${data[i]},${data[i+1]},${data[i+2]},${Math.min(1,data[i+3]/200)})`});}
  if(points.length&&!reduced.matches)h.classList.add('ready');
 }
 function animate(){raf=requestAnimationFrame(animate);if(reduced.matches||!visible||document.hidden)return;ctx.clearRect(0,0,w,ht);
  for(const p of points){if(mouse){const dx=p.x-mouse.x,dy=p.y-mouse.y,dist=Math.hypot(dx,dy);if(dist<65&&dist>0){const force=(1-dist/65)*.62;p.vx+=dx/dist*force;p.vy+=dy/dist*force;}}p.vx+=(p.ox-p.x)*.018;p.vy+=(p.oy-p.y)*.018;p.vx*=.88;p.vy*=.88;p.x+=p.vx;p.y+=p.vy;ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,1.9,1.9);}
 }
 let sound=false,audioContext=null,lastNote=0,noteIndex=0;const button=document.querySelector('#sound-toggle');
 button.addEventListener('click',async()=>{sound=!sound;button.setAttribute('aria-pressed',String(sound));button.textContent=sound?'♫ 声音：开':'♫ 声音：关';if(sound){try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();await audioContext.resume();}catch{sound=false;button.setAttribute('aria-pressed','false');button.textContent='声音不可用';}}else if(audioContext)await audioContext.suspend();});
 function tone(){if(!sound||!audioContext||performance.now()-lastNote<1200)return;lastNote=performance.now();const frequencies=[523.25,659.25,783.99,587.33,880,659.25];const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=frequencies[noteIndex++%frequencies.length];const t=audioContext.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.018,t+.08);gain.gain.exponentialRampToValueAtTime(.0001,t+1.9);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+2);}
 h.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=h.getBoundingClientRect();mouse={x:e.clientX-r.left,y:e.clientY-r.top};tone();});h.addEventListener('pointerleave',()=>mouse=null);
 new IntersectionObserver(es=>visible=es[0].isIntersecting).observe(h);let timer;new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(build,100)}).observe(h);reduced.addEventListener('change',build);document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioContext)audioContext.suspend();else if(sound&&audioContext)audioContext.resume()});document.fonts.ready.then(()=>{build();animate()});
})();
