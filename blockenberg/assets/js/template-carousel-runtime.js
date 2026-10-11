/** Shared template carousel runtime: frontend and Gutenberg use the same layout, pagination and transitions. */
(function () {
    'use strict';
    const instances = new WeakMap();
    const selector = '[data-bkbg-component]';
    const number = (v, fallback) => v !== '' && v != null && Number.isFinite(Number(v)) ? Number(v) : fallback;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const bool = (v, fallback) => v == null ? fallback : v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
    const all = (root, query) => Array.from(root.querySelectorAll(query)).filter(el => el.closest(selector) === root);
    const one = (root, query) => all(root, query)[0];
    function carousel(root, input, environment = {}) {
        instances.get(root)?.destroy();
        const document = root.ownerDocument, window = document.defaultView;
        const getComputedStyle = window.getComputedStyle.bind(window);
        const requestAnimationFrame = window.requestAnimationFrame.bind(window);
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const controllers = [], disposers = [];
        let alive = true;
        function listen(target, type, handler, options) {
            target.addEventListener(type, handler, options);
            disposers.push(() => target.removeEventListener(type, handler, options));
        }
        function button(el, label, activate) {
            if (!el.matches('button,input,a[href],summary')) { el.setAttribute('role', 'button'); el.tabIndex = 0; }
            if (el.matches('button')) el.type = 'button';
            if (label && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', label);
            listen(el, 'click', e => { e.preventDefault(); activate(e); });
            if (!el.matches('button,input,summary')) listen(el, 'keydown', e => {
                if (e.target === el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(e); }
            });
        }
        all(root, '.swiper-wrapper').forEach((track, trackIndex) => {
            const viewport = track.parentElement;
            const initialIndex = environment.initialIndices?.[trackIndex] || 0;
            const opts = Object.assign({}, input), source = opts.sourceSettings || {};
            const aliases = {autoplay:['autoplay'], delay:['autoplay_speed','autoplay_delay'], loop:['infinite','loop'], speed:['speed','transition_speed'], carouselSlides:['slides_to_show','slides_per_view'], carouselSlidesTablet:['slides_to_show_tablet','slides_per_view_tablet'], carouselSlidesMobile:['slides_to_show_mobile','slides_per_view_mobile']};
            Object.keys(aliases).forEach(key => {if(opts[key]==null){const name=aliases[key].find(k=>source[k]!=null&&source[k]!=='');if(name)opts[key]=source[name];}});
            const restored = [];
            // React owns original slides. Restore only attributes this runtime changes.
            if (environment.editor) {
                [viewport, track, ...root.querySelectorAll('.swiper-slide,.swiper-pagination,.bkbg-catalog-swiper-pagination,.swiper-button-prev,.swiper-button-next,.bkbg-tpl-swiper-button-prev,.bkbg-tpl-swiper-button-next,[class*="-nav-prev"],[class*="-nav-next"],.bkbg-catalog-button-prev,.bkbg-catalog-button-next')].forEach(node => {
                    const names=['style','class','tabindex','role','aria-label','aria-roledescription','aria-hidden','inert','aria-current','aria-disabled','data-bkbg-carousel-index','data-bkbg-carousel-pages','data-bkbg-carousel-config'];
                    const values=names.map(name=>[name,node.getAttribute(name)]);
                    restored.push(()=>values.forEach(([name,value])=>{if(value===null)node.removeAttribute(name);else node.setAttribute(name,value);}));
                });
            }
            const sourceKind = root.dataset.bkbgKind || '';
            // Older imported blocks retain the original settings, even when their
            // first conversion omitted zero delay or used the wrong hover default.
            if (opts.carouselRuntimeVersion !== 2) {
                if (sourceKind === 'image-carousel') {
                    opts.delay = number(source.autoplay_speed, number(opts.delay, 5000));
                    opts.pauseOnHover = bool(source.pause_on_hover, true);
                    opts.disableOnInteraction = bool(source.pause_on_interaction, true);
                } else if (sourceKind.startsWith('king-addons-') && !viewport.dataset.slidestoshow) {
                    opts.pauseOnHover = Object.entries(source).some(([k,v]) => /pause.*(?:hover|mouseenter)/i.test(k) && bool(v, false));
                    opts.disableOnInteraction = false;
                    opts.reverseDirection = Object.entries(source).some(([k,v]) => /autoplay_reversedirection_switcher$/.test(k) && bool(v, false));
                }
            }
            if (viewport.dataset.slidestoshow) {
                const fallback={carouselSlides:number(viewport.dataset.slidestoshow,3),carouselSlidesTablet:2,carouselSlidesMobile:1,carouselGap:number(viewport.dataset.swiperSpaceBetween,0),speed:number(viewport.dataset.swiperSpeed,500),delay:number(viewport.dataset.swiperDelay,5000),autoplay:bool(viewport.dataset.autoplay,false),loop:bool(viewport.dataset.loop,false),pauseOnHover:bool(viewport.dataset.swiperPoh,false)};
                fallback.carouselGapTablet=fallback.carouselGapMobile=fallback.carouselGap;
                Object.keys(fallback).forEach(key=>{if(opts[key]==null)opts[key]=fallback[key];});
            }
            const outer = viewport.closest('.bkbg-catalog-timeline-outer-container'); if (outer) outer.style.opacity='1';
            const slides = Array.from(track.children).filter(s => s.classList.contains('swiper-slide') && !s.classList.contains('swiper-slide-duplicate') && !s.classList.contains('bkbg-carousel-repeat'));
            if (!slides.length) return;
            Array.from(track.children).filter(s => s.classList.contains('swiper-slide-duplicate')).forEach(s => {if(environment.editor)s.style.display='none';else s.remove();});
            const loop = bool(opts.loop, false), delay = clamp(number(opts.delay,5000),0,3600000), speed=clamp(number(opts.speed,400),0,60000);
            const autoplay = bool(opts.autoplay,false), group=Math.max(1,Math.floor(number(opts.carouselGroup,1)));
            const easing = getComputedStyle(track).transitionTimingFunction === 'linear' || Object.entries(source).some(([k,v]) => /autoplay_like_ticker_switcher$/.test(k)&&bool(v,false)) || delay<=10 ? 'linear' : 'ease';
            let perView=1,gap=0,slideWidth=0,snaps=[0],index=0,physical=0,prefix=0,clones=[];
            let timer,finishTimer,transitioning=false,hover=false,focused=false,interacted=false,startX=null,suppressClick=false,revision=0;
            const prev = all(root,'.swiper-button-prev,.bkbg-tpl-swiper-button-prev,[class*="-nav-prev"],.bkbg-catalog-button-prev');
            const next = all(root,'.swiper-button-next,.bkbg-tpl-swiper-button-next,[class*="-nav-next"],.bkbg-catalog-button-next');
            const pagination = one(root,'.swiper-pagination,.bkbg-catalog-swiper-pagination');
            const paginationType = opts.paginationType || (viewport.dataset.slidestoshow || Object.entries(source).some(([k,v])=>k.endsWith('_pag_type')&&v==='progressbar') ? 'progressbar' : 'bullets');
            let progress=null,dots=[];
            const originalPagination = environment.editor && pagination ? Array.from(pagination.childNodes) : [];
            let observer;
            const controller = {go: value => go(value,true), next:()=>go(index+1,true), previous:()=>go(index-1,true), refresh:()=>resizeCarousel(), reveal:slideIndex=>{
                const page=snaps.reduce((best,start,i)=>start<=slideIndex?i:best,0);
                go(page,true,true);return slides[slideIndex];
            }, state:()=>({index,perView,gap,speed,delay,loop,autoplay,pages:snaps.length,count:slides.length,paginationType})};
            controllers.push(controller);
            viewport.classList.add('swiper-initialized','swiper-horizontal');
            viewport.style.overflow='hidden';viewport.style.touchAction='pan-y';
            if (!viewport.hasAttribute('tabindex')) viewport.tabIndex=0;
            viewport.setAttribute('aria-roledescription','carousel');
            track.style.display='flex';track.style.flexWrap='nowrap';track.style.width='100%';track.style.gap='0px';
            function sizing() {
                const width=window.innerWidth;
                const count=width<=767?number(opts.carouselSlidesMobile,1):width<=1024?number(opts.carouselSlidesTablet,number(opts.carouselSlides,1)):number(opts.carouselSlides,1);
                perView=clamp(count,1,100);
                gap=Math.max(0,number(width<=767?opts.carouselGapMobile:width<=1024?opts.carouselGapTablet:opts.carouselGap,number(opts.carouselGap,0)));
                const st=getComputedStyle(viewport),w=viewport.clientWidth-(parseFloat(st.paddingLeft)||0)-(parseFloat(st.paddingRight)||0);
                slideWidth=Math.max(1,(w-(perView-1)*gap)/perView);
                const end=loop?slides.length-1:Math.max(0,slides.length-perView);
                snaps=[];for(let i=0;i<=end+.00001;i+=group)snaps.push(i);
                if(!loop&&Math.abs(snaps[snaps.length-1]-end)>.00001)snaps.push(end);
            }
            function sizeSlide(s) {s.style.flex='0 0 '+slideWidth+'px';s.style.width=slideWidth+'px';s.style.marginRight=gap+'px';s.style.boxSizing='border-box';}
            function cloneSlide(s,n) {
                const clone=s.cloneNode(true);clone.classList.remove('swiper-slide-active','swiper-slide-next','swiper-slide-prev');clone.classList.add('bkbg-carousel-repeat');clone.setAttribute('aria-hidden','true');clone.inert=true;
                if(environment.editor){
                    clone.dataset.bkbgEditorOriginal=String(slides.indexOf(s));
                    clone.querySelectorAll('[contenteditable]').forEach(node=>{node.setAttribute('contenteditable','false');node.setAttribute('aria-readonly','true');});
                    clone.querySelectorAll('input,textarea,select,button,a').forEach(node=>node.tabIndex=-1);
                }
                const descendants=[clone,...clone.querySelectorAll('*')],ids=new Map();
                descendants.forEach(e=>{if(e.id){const old=e.id;e.id=old+'-repeat-'+n;ids.set(old,e.id);}e.removeAttribute('data-bkbg-id');e.removeAttribute('data-bkbg-component');});
                descendants.forEach(e=>Array.from(e.attributes).forEach(a=>{let value=a.value;ids.forEach((id,old)=>{value=value.replaceAll('url(#'+old+')','url(#'+id+')');if(value==='#'+old)value='#'+id;if(['for','aria-controls','aria-labelledby','aria-describedby'].includes(a.name))value=value.split(/\s+/).map(v=>v===old?id:v).join(' ');});if(value!==a.value)e.setAttribute(a.name,value);}));
                sizeSlide(clone);return clone;
            }
            function repeatSlides() {
                clones.forEach(s=>s.remove());clones=[];prefix=0;
                if(!loop)return;
                prefix=Math.ceil(perView)+group;
                const before=document.createDocumentFragment(),after=document.createDocumentFragment();
                for(let i=0;i<prefix;i++){
                    const left=cloneSlide(slides[((slides.length-prefix+i)%slides.length+slides.length)%slides.length],'before-'+i),right=cloneSlide(slides[i%slides.length],'after-'+i);
                    before.append(left);after.append(right);clones.push(left,right);
                }
                track.prepend(before);track.append(after);
            }
            function buildPagination() {
                if(!pagination)return;
                pagination.replaceChildren();dots=[];progress=null;
                pagination.classList.remove('swiper-pagination-bullets','swiper-pagination-progressbar');
                pagination.classList.add('swiper-pagination-horizontal',paginationType==='progressbar'?'swiper-pagination-progressbar':'swiper-pagination-bullets');
                if(paginationType==='progressbar'){progress=document.createElement('span');progress.className='swiper-pagination-progressbar-fill';pagination.append(progress);}
                else snaps.forEach((_,i)=>{const dot=document.createElement('button');dot.type='button';dot.className='swiper-pagination-bullet';dot.setAttribute('aria-label','Go to slide '+(i*group+1));dot.addEventListener('click',()=>go(i,true));pagination.append(dot);dots.push(dot);});
            }
            function paint() {
                const position=snaps[index],first=Math.floor(position);
                environment.onChange?.(trackIndex,index);
                slides.forEach((s,i)=>{const visible=prefix+i+1>prefix+physical+.00001&&prefix+i<prefix+physical+perView-.00001;s.classList.toggle('swiper-slide-active',i===first);s.classList.toggle('swiper-slide-prev',i===(first-1+slides.length)%slides.length);s.classList.toggle('swiper-slide-next',i===(first+1)%slides.length);s.inert=!visible;s.setAttribute('aria-hidden',String(!visible));});
                clones.forEach(s=>{const i=Array.prototype.indexOf.call(track.children,s),visible=i+1>prefix+physical+.00001&&i<prefix+physical+perView-.00001;s.inert=!visible;s.setAttribute('aria-hidden',String(!visible));});
                if(progress){progress.style.transition=motion.matches?'none':'transform '+speed+'ms '+easing;progress.style.transform='scaleX('+((index+1)/snaps.length)+')';}
                dots.forEach((d,i)=>{d.classList.toggle('swiper-pagination-bullet-active',i===index);d.setAttribute('aria-current',i===index?'true':'false');});
                prev.forEach(b=>{b.setAttribute('aria-disabled',String(!loop&&index===0));b.classList.toggle('swiper-button-disabled',!loop&&index===0);});
                next.forEach(b=>{b.setAttribute('aria-disabled',String(!loop&&index===snaps.length-1));b.classList.toggle('swiper-button-disabled',!loop&&index===snaps.length-1);});
                viewport.dataset.bkbgCarouselIndex=String(index);viewport.dataset.bkbgCarouselPages=String(snaps.length);
                viewport.dataset.bkbgCarouselConfig=JSON.stringify({perView,gap,speed,delay,loop,autoplay,pauseOnHover:bool(opts.pauseOnHover,true),disableOnInteraction:bool(opts.disableOnInteraction,false),reverseDirection:bool(opts.reverseDirection,false),paginationType:pagination?paginationType:'none',stopOnLastSlide:bool(opts.stopOnLastSlide,false),easing});
            }
            function translate(pos,animate) {
                const rtl=getComputedStyle(viewport).direction==='rtl';
                track.style.transition=animate&&!motion.matches?'transform '+speed+'ms '+easing:'none';
                track.style.transform='translateX('+((rtl?1:-1)*(prefix+pos)*(slideWidth+gap))+'px)';
            }
            function schedule() {
                clearTimeout(timer);
                if(!alive||environment.paused?.()||!root.isConnected||!autoplay||motion.matches||hover||focused||interacted||document.hidden||snaps.length<2||transitioning||(!loop&&bool(opts.stopOnLastSlide,false)&&(bool(opts.reverseDirection,false)?index===0:index===snaps.length-1)))return;
                timer=setTimeout(()=>{let target=index+(bool(opts.reverseDirection,false)?-1:1);if(!loop&&(target<0||target>=snaps.length))target=target<0?snaps.length-1:0;go(target,false);},delay);
            }
            function finishTransition() {
                if(!transitioning)return;transitioning=false;clearTimeout(finishTimer);
                if(physical!==snaps[index]){physical=snaps[index];translate(physical,false);paint();
                    // Commit the equivalent loop position before a zero-delay
                    // ticker starts its next transition. Otherwise CSS can
                    // merge both transforms into a long backward jump.
                    void track.offsetWidth;
                }
                schedule();
            }
            function go(value,manual,immediate=false) {
                clearTimeout(timer);clearTimeout(finishTimer);
                if(manual&&bool(opts.disableOnInteraction,false))interacted=true;
                const old=index,newIndex=loop?((value%snaps.length)+snaps.length)%snaps.length:clamp(value,0,snaps.length-1);
                const changed=old!==newIndex;
                index=newIndex;physical=snaps[index];
                if(loop&&changed){if(value>=snaps.length)physical+=slides.length;else if(value<0)physical-=slides.length;}
                transitioning=!immediate&&changed&&speed>0&&!motion.matches;
                if(!transitioning)physical=snaps[index];
                paint();translate(physical,transitioning);
                if(transitioning)finishTimer=setTimeout(finishTransition,speed+34);else schedule();
            }
            listen(track,'transitionend',e=>{if(e.target===track&&e.propertyName==='transform')finishTransition();});
            prev.forEach(b=>button(b,'Previous slide',()=>go(index-1,true)));next.forEach(b=>button(b,'Next slide',()=>go(index+1,true)));
            listen(viewport,'keydown',e=>{
                if(e.target.matches('input,textarea,select')||e.target.isContentEditable||e.target.closest('[contenteditable="true"]'))return;
                const rtl=getComputedStyle(viewport).direction==='rtl';
                if(e.key==='Home'||e.key==='End'){e.preventDefault();go(e.key==='Home'?0:snaps.length-1,true);return;}
                if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(index+((e.key==='ArrowRight')!==rtl?1:-1),true);}
            });
            listen(viewport,'pointerdown',e=>{if(!e.isPrimary||e.button!==0||e.target.closest('button,input,textarea,select,a,[role="button"],[role="textbox"],[contenteditable="true"]')||(environment.editor&&e.target.closest('img')))return;suppressClick=false;startX=e.clientX;if(!environment.editor)viewport.setPointerCapture(e.pointerId);});
            listen(viewport,'pointerup',e=>{if(startX===null)return;const d=e.clientX-startX;startX=null;if(Math.abs(d)>40){suppressClick=true;go(index+((d<0)!==(getComputedStyle(viewport).direction==='rtl')?1:-1),true);setTimeout(()=>{suppressClick=false;},0);}});
            listen(viewport,'pointercancel',()=>{startX=null;});
            listen(viewport,'click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();}},{capture:true});
            listen(root,'pointerenter',()=>{hover=bool(opts.pauseOnHover,true);schedule();});listen(root,'pointerleave',()=>{hover=false;schedule();});
            listen(root,'focusin',()=>{focused=true;schedule();});listen(root,'focusout',e=>{focused=root.contains(e.relatedTarget);schedule();});
            listen(document,'visibilitychange',schedule);listen(motion,'change',()=>{clearTimeout(finishTimer);transitioning=false;physical=snaps[index];paint();translate(physical,false);schedule();});
            function resizeCarousel() {
                const current=snaps[index]||0,token=++revision;
                clearTimeout(timer);clearTimeout(finishTimer);transitioning=false;
                sizing();slides.forEach(sizeSlide);repeatSlides();buildPagination();
                index=snaps.reduce((best,n,i)=>Math.abs(n-current)<Math.abs(snaps[best]-current)?i:best,0);physical=snaps[index];paint();translate(physical,false);
                // A first CSS transition needs a committed non-animated position.
                requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===revision)schedule();}));
            }
            slides.forEach((s,i)=>{s.setAttribute('role','group');s.setAttribute('aria-label',(i+1)+' of '+slides.length);});
            listen(window,'resize',resizeCarousel);
            if(window.ResizeObserver){let observedWidth=viewport.clientWidth;observer=new window.ResizeObserver(()=>{const width=viewport.clientWidth;if(Math.abs(width-observedWidth)>.1){observedWidth=width;resizeCarousel();}});observer.observe(viewport);}
            if(environment.editor) listen(root,'click',event=>{
                const repeat=event.target.closest('.bkbg-carousel-repeat');
                if(!repeat||repeat.parentElement!==track)return;
                event.preventDefault();event.stopPropagation();
                const field=(event.target.closest('[data-bkbg-editor-field]')||event.target.querySelector('[data-bkbg-editor-field]'))?.dataset.bkbgEditorField;
                const original=controller.reveal(Number(repeat.dataset.bkbgEditorOriginal));
                const editable=field?Array.from(original.querySelectorAll('[data-bkbg-editor-field]')).find(n=>n.dataset.bkbgEditorField===field&&n.isContentEditable):null;
                if(editable?.isContentEditable)editable.focus();else original.closest('[data-block]')?.focus();
            },{capture:true});
            document.fonts?.ready.then(()=>{if(alive)resizeCarousel();});
            disposers.push(()=>{
                clearTimeout(timer);clearTimeout(finishTimer);revision++;
                observer?.disconnect();clones.forEach(s=>s.remove());
                if(environment.editor&&pagination)pagination.replaceChildren(...originalPagination);
                restored.reverse().forEach(restore=>restore());
            });
            resizeCarousel();
            if(initialIndex)go(clamp(initialIndex,0,snaps.length-1),false,true);
        });
    
        const instance = {controllers, destroy(){
            if(!alive)return;alive=false;
            disposers.reverse().forEach(dispose=>dispose());
            if(instances.get(root)===instance)instances.delete(root);
        }};
        instances.set(root,instance);
        return instance;
    }
    window.bkbgTemplateCarousel = carousel;
})();
