/* Post Slider — frontend.js */
( function () {
  function initSlider( wrap ) {
    const track    = wrap.querySelector( '.bkps-track' );
    const slides   = Array.from( track ? track.querySelectorAll( '.bkps-slide' ) : [] );
    if ( slides.length < 2 ) return;

    const autoplay  = wrap.dataset.autoplay === '1';
    const speed     = parseInt( wrap.dataset.speed ) || 4000;
    const isSlide   = wrap.classList.contains( 'bkps-transition-slide' );
    const showDots  = wrap.dataset.dots === '1';

    let current = 0;
    let timer   = null;

    /* Build dots dynamically */
    if ( showDots ) {
      const dotsWrap = wrap.querySelector( '.bkps-dots' );
      if ( dotsWrap ) {
        slides.forEach( (_, i) => {
          const dot = document.createElement( 'button' );
          dot.className = 'bkps-dot' + ( i === 0 ? ' bkps-dot-active' : '' );
          dot.addEventListener( 'click', () => { clearInterval(timer); goTo(i); startAutoplay(); } );
          dotsWrap.appendChild( dot );
        } );
      }
    }

    function updateDots() {
      wrap.querySelectorAll( '.bkps-dot' ).forEach( (d,i) => d.classList.toggle('bkps-dot-active', i === current) );
    }

    function goTo( idx ) {
      const prev = current;
      current = ( idx + slides.length ) % slides.length;

      if ( isSlide ) {
        slides[prev].classList.add('bkps-prev-slide');
        slides[prev].classList.remove('bkps-active');
        slides[current].classList.add('bkps-active');
        setTimeout( () => slides[prev].classList.remove('bkps-prev-slide'), 650 );
      } else {
        slides[prev].classList.remove('bkps-active');
        slides[current].classList.add('bkps-active');
      }
      updateDots();
    }

    /* Arrows */
    const prevBtn = wrap.querySelector('.bkps-prev');
    const nextBtn = wrap.querySelector('.bkps-next');
    if ( prevBtn ) prevBtn.addEventListener('click', () => { clearInterval(timer); goTo(current-1); startAutoplay(); });
    if ( nextBtn ) nextBtn.addEventListener('click', () => { clearInterval(timer); goTo(current+1); startAutoplay(); });

    /* Touch swipe */
    let touchX = 0;
    wrap.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, {passive:true});
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if ( Math.abs(dx) > 50 ) { clearInterval(timer); goTo( dx < 0 ? current+1 : current-1 ); startAutoplay(); }
    }, {passive:true});

    /* Keyboard */
    wrap.setAttribute('tabindex', '0');
    wrap.addEventListener('keydown', e => {
      if (e.key==='ArrowLeft')  { clearInterval(timer); goTo(current-1); startAutoplay(); }
      if (e.key==='ArrowRight') { clearInterval(timer); goTo(current+1); startAutoplay(); }
    });

    function startAutoplay() {
      if ( !autoplay ) return;
      clearInterval(timer);
      timer = setInterval( () => goTo(current+1), speed );
    }

    wrap.addEventListener('mouseenter', () => clearInterval(timer));
    wrap.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  function init() {
    document.querySelectorAll('.bkps-wrap[data-autoplay]').forEach( initSlider );
  }

  if ( document.readyState === 'loading' ) {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}() );
