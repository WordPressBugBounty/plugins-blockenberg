(function(){'use strict';
 function boot(){document.querySelectorAll('[data-bkbg-marquee]').forEach(function(track){
  if(track.dataset.ready)return;
  var items=Array.from(track.children),width=track.scrollWidth,copies=0;
  if(!items.length||width<=0)return;
  track.dataset.ready='1';
  while(width<window.innerWidth*2 && copies++<12){items.forEach(function(e){var c=e.cloneNode(true);c.setAttribute('aria-hidden','true');track.appendChild(c);});width=track.scrollWidth;}
  var half=track.scrollWidth;
  Array.from(track.children).forEach(function(e){var c=e.cloneNode(true);c.setAttribute('aria-hidden','true');track.appendChild(c);});
  track.style.setProperty('--bkbg-marquee-duration',(half/Math.max(1,Number(track.dataset.bkbgMarquee)||60))+'s');
 });}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
 window.addEventListener('load',boot,{once:true});
})();
/* Native backgrounds and form submission: no Elementor or CF7 runtime. */
(function(){'use strict';
 function boot(){
  document.querySelectorAll('[data-bkbg-slideshow]').forEach(function(root){if(root.dataset.bkbgReady)return;root.dataset.bkbgReady='1';var cfg={};try{cfg=JSON.parse(root.dataset.bkbgSlideshow);}catch(e){}var slides=Array.from(root.children),index=0,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
   root.style.setProperty('--bkbg-slide-transition',(cfg.transition??500)+'ms');root.style.setProperty('--bkbg-slide-duration',((cfg.duration||5000)+(cfg.transition??500))+'ms');if(cfg.kenBurns&&!reduce)root.classList.add(cfg.zoomOut?'bkbg-kenburns-out':'bkbg-kenburns-in');
   if(cfg.effect&&cfg.effect!=='fade')root.classList.add('bkbg-background-'+cfg.effect.replace('_','-'));if(slides.length<2||reduce)return;function next(){if(!root.isConnected)return;if(!document.hidden){if(index===slides.length-1&&!cfg.loop)return;root.dataset.bkbgAdvancing='1';var previous=slides[index];previous.classList.remove('is-active');if(cfg.effect&&cfg.effect!=='fade'){previous.classList.add('is-leaving');setTimeout(function(){previous.classList.remove('is-leaving');},Math.max(0,cfg.transition??500));}index=(index+1)%slides.length;slides[index].classList.add('is-active');}setTimeout(next,Math.max(1000,cfg.duration||5000));}setTimeout(next,Math.max(1000,cfg.duration||5000));
  });
  document.querySelectorAll('[data-bkbg-form]').forEach(function(form){if(form.dataset.bkbgReady)return;form.dataset.bkbgReady='1';form.addEventListener('submit',async function(event){event.preventDefault();if(form.dataset.bkbgSending||!form.reportValidity())return;var result=form.querySelector('.bkbg-template-form-result'),buttons=Array.from(form.querySelectorAll('[type=submit]')),values={};new FormData(form).forEach(function(v,k){if(typeof v==='string')values[k]=v;});form.dataset.bkbgSending='1';buttons.forEach(function(b){b.disabled=true;});result.hidden=true;
   try{var response=await fetch(form.dataset.bkbgEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({schema:form.dataset.bkbgSchema,signature:form.dataset.bkbgSignature,website:values.bkbg_website||'',values:values})}),data=await response.json();if(!response.ok||!data.success)throw new Error(data.message||form.dataset.bkbgError);result.textContent=form.dataset.bkbgSuccess;form.reset();}catch(error){result.textContent=error.message||form.dataset.bkbgError;}finally{result.hidden=false;buttons.forEach(function(b){b.disabled=false;});delete form.dataset.bkbgSending;}
  });});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
