(() => {
  const pages = window.BOOK_PAGES || [];
  const total = pages.length;
  const spreads = [];
  spreads.push({left:null,right:1});
  for(let p=2;p<=total;p+=2) spreads.push({left:p,right:(p+1<=total)?p+1:null});

  const imgLeft = document.querySelector("#pageLeft img");
  const imgRight = document.querySelector("#pageRight img");
  const btnPrev = document.getElementById("prev");
  const btnNext = document.getElementById("next");
  const progress = document.getElementById("progress");
  const flipLayer = document.getElementById("flipLayer");
  const sound = document.getElementById("flipSound");

  let spreadIndex=0, animating=false, audioUnlocked=false;

  function pageSrc(n){ return n ? pages[n-1] : null; }
  function setImg(el,n){ const s=pageSrc(n); if(!s){el.removeAttribute("src"); el.style.opacity=0; return;} el.src=s; el.style.opacity=1; }

  function render(){
    const sp=spreads[spreadIndex];
    setImg(imgLeft, sp.left);
    setImg(imgRight, sp.right);
    btnPrev.disabled=(spreadIndex===0)||animating;
    btnNext.disabled=(spreadIndex===spreads.length-1)||animating;
    if(spreadIndex===0) progress.textContent=`Cover (1 / ${total})`;
    else progress.textContent=`${sp.left}${sp.right?("–"+sp.right):""} / ${total}`;
  }

  function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast._tm); toast._tm=setTimeout(()=>t.classList.remove("show"),1600); }

  function unlockAudio(){
    if(audioUnlocked) return;
    sound.volume=0.9; sound.currentTime=0;
    sound.play().then(()=>{ sound.pause(); sound.currentTime=0; audioUnlocked=true; }).catch(()=>{});
  }
  window.addEventListener("pointerdown", unlockAudio, {once:false});
  window.addEventListener("keydown", unlockAudio, {once:false});

  function playFlip(){
    sound.volume=0.9; sound.currentTime=0;
    sound.play().catch(()=>{ if(!audioUnlocked) toast("Click once to enable sound 🔊"); });
  }

  function clearFlip(){ flipLayer.innerHTML=""; }

  function animateNext(){
    if(animating||spreadIndex>=spreads.length-1) return;
    animating=true; btnPrev.disabled=btnNext.disabled=true;
    const cur=spreads[spreadIndex], nxt=spreads[spreadIndex+1];

    const flip=document.createElement("div");
    flip.className="flipPage right";

    const front=document.createElement("div"); front.className="flipFace front";
    const fi=document.createElement("img"); fi.src=pageSrc(cur.right)||""; front.appendChild(fi);

    const back=document.createElement("div"); back.className="flipFace back";
    const bi=document.createElement("img"); bi.src=pageSrc(nxt.left)||""; back.appendChild(bi);

    flip.appendChild(front); flip.appendChild(back); flipLayer.appendChild(flip);

    setImg(imgLeft, nxt.left); setImg(imgRight, nxt.right);

    requestAnimationFrame(()=>{
      flip.style.transition="transform 800ms cubic-bezier(.2,.85,.2,1)";
      flip.style.transform="rotateY(-180deg)";
      playFlip();
    });

    flip.addEventListener("transitionend", ()=>{
      clearFlip(); spreadIndex++; animating=false; render();
    }, {once:true});
  }

  function animatePrev(){
    if(animating||spreadIndex<=0) return;
    animating=true; btnPrev.disabled=btnNext.disabled=true;
    const cur=spreads[spreadIndex], prv=spreads[spreadIndex-1];

    // Flip the CURRENT left page back to the right
    const flip=document.createElement("div");
    flip.className="flipPage left";
    flip.style.transform="rotateY(0deg)";

    const front=document.createElement("div"); front.className="flipFace front";
    const fi=document.createElement("img"); fi.src=pageSrc(cur.left)||""; front.appendChild(fi);

    const back=document.createElement("div"); back.className="flipFace back";
    const bi=document.createElement("img"); bi.src=pageSrc(prv.right)||""; back.appendChild(bi);

    flip.appendChild(front); flip.appendChild(back); flipLayer.appendChild(flip);

    // Destination spread underneath
    setImg(imgLeft, prv.left); setImg(imgRight, prv.right);

    requestAnimationFrame(()=>{
      flip.style.transition="transform 800ms cubic-bezier(.2,.85,.2,1)";
      flip.style.transform="rotateY(180deg)";
      playFlip();
    });

    flip.addEventListener("transitionend", ()=>{
      clearFlip(); spreadIndex--; animating=false; render();
    }, {once:true});
  }

  btnNext.addEventListener("click", animateNext);
("click", animateNext);
  btnPrev.addEventListener("click", animatePrev);

  window.addEventListener("keydown",(e)=>{
    if(e.key==="ArrowRight"||e.key==="PageDown") animateNext();
    if(e.key==="ArrowLeft"||e.key==="PageUp") animatePrev();
  });

  document.getElementById("stage").addEventListener("click",(e)=>{
    const r=e.currentTarget.getBoundingClientRect();
    const x=e.clientX-r.left;
    if(x>r.width*0.55) animateNext();
    else if(x<r.width*0.45) animatePrev();
  });

  render();
})();