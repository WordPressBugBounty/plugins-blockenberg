/* Content Slider — frontend.js */
( function () {
  function initSlider( wrap ) {
    const track  = wrap.querySelector( '.bkcs-track' );
    const slides = track ? Array.from( track.querySelectorAll( '.bkcs-slide' ) ) : [];
    if ( slides.length < 2 ) return;

    const autoplay = wrap.dataset.autoplay === '1';
    const speed    = parseInt( wrap.dataset.speed ) || 4000;
    const isSlide  = wrap.classList.contains( 'bkcs-transition-slide' );

    let current = 0;
    let timer   = null;

    /* Dots */
    const dotsWrap = wrap.querySelector( '.bkcs-dots' );
    if ( dotsWrap ) {
      slides.forEach( (_, i) => {
        const dot = document.createElement('button');
        dot.className = 'bkcs-dot' + (i===0?' bkcs-dot-active':'');
        dot.addEventListener('click', () => { clearInterval(timer); goTo(i); startAutoplay(); });
        dotsWrap.appendChild(dot);
      });
    }
    function updateDots() {
      wrap.querySelectorAll('.bkcs-dot').forEach((d,i)=>d.classList.toggle('bkcs-dot-active',i===current));
    }

    function goTo(idx) {
      const prev = current;
      current = (idx + slides.length) % slides.length;
      if (isSlide) {
        slides[prev].classList.add('bkcs-leaving');
        slides[prev].classList.remove('bkcs-active');
        slides[current].classList.add('bkcs-active');
        setTimeout(()=>slides[prev].classList.remove('bkcs-leaving'), 600);
      } else {
        slides[prev].classList.remove('bkcs-active');
        slides[current].classList.add('bkcs-active');
      }
      updateDots();
    }

    const prevBtn = wrap.querySelector('.bkcs-prev');
    const nextBtn = wrap.querySelector('.bkcs-next');
    if (prevBtn) prevBtn.addEventListener('click', ()=>{ clearInterval(timer); goTo(current-1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', ()=>{ clearInterval(timer); goTo(current+1); startAutoplay(); });

    /* Touch */
    let tx = 0;
    wrap.addEventListener('touchstart', e=>{tx=e.changedTouches[0].clientX;},{passive:true});
    wrap.addEventListener('touchend',   e=>{ const dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50){clearInterval(timer);goTo(dx<0?current+1:current-1);startAutoplay();}},{passive:true});

    wrap.addEventListener('mouseenter', ()=>clearInterval(timer));
    wrap.addEventListener('mouseleave', startAutoplay);

    function startAutoplay() {
      if (!autoplay) return;
      clearInterval(timer);
      timer = setInterval(()=>goTo(current+1), speed);
    }
    startAutoplay();
  }

  function init() {
    document.querySelectorAll('.bkcs-wrap[data-autoplay]').forEach(initSlider);
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
}() );
