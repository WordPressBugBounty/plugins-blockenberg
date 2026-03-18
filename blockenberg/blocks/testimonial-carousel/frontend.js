/* Testimonial Carousel — frontend.js */
( function () {
  function initCarousel( wrap ) {
    const slides = wrap.querySelectorAll( '.bktc-slide' );
    if ( ! slides.length ) return;

    const autoplay   = wrap.dataset.autoplay === '1';
    const speed      = parseInt( wrap.dataset.speed  ) || 3500;
    const loop       = wrap.dataset.loop   === '1';
    const pauseHover = wrap.dataset.hover  === '1';
    const showDots   = wrap.dataset.dots   === '1';

    let current = 0;
    let timer   = null;

    /* Build dots */
    if ( showDots ) {
      const dotsWrap = wrap.querySelector( '.bktc-dots' );
      if ( dotsWrap ) {
        slides.forEach( (_, i) => {
          const dot = document.createElement( 'button' );
          dot.className = 'bktc-dot' + ( i === 0 ? ' bktc-dot-active' : '' );
          dot.addEventListener( 'click', () => goTo(i) );
          dotsWrap.appendChild( dot );
        } );
      }
    }

    function updateDots() {
      const dots = wrap.querySelectorAll( '.bktc-dot' );
      dots.forEach( (d, i) => d.classList.toggle( 'bktc-dot-active', i === current ) );
    }

    function goTo( idx ) {
      slides[ current ].classList.remove( 'bktc-active' );
      if ( loop ) {
        current = ( idx + slides.length ) % slides.length;
      } else {
        current = Math.max( 0, Math.min( idx, slides.length - 1 ) );
      }
      slides[ current ].classList.add( 'bktc-active' );
      updateDots();
    }

    function next() { goTo( current + 1 ); }
    function prev() { goTo( current - 1 ); }

    /* Arrows */
    const prevBtn = wrap.querySelector( '.bktc-prev' );
    const nextBtn = wrap.querySelector( '.bktc-next' );
    if ( prevBtn ) prevBtn.addEventListener( 'click', () => { clearInterval(timer); prev(); startAutoplay(); } );
    if ( nextBtn ) nextBtn.addEventListener( 'click', () => { clearInterval(timer); next(); startAutoplay(); } );

    /* Keyboard */
    wrap.setAttribute( 'tabindex', '0' );
    wrap.addEventListener( 'keydown', function (e) {
      if ( e.key === 'ArrowLeft'  ) { clearInterval(timer); prev(); startAutoplay(); }
      if ( e.key === 'ArrowRight' ) { clearInterval(timer); next(); startAutoplay(); }
    } );

    /* Touch swipe */
    let touchStartX = 0;
    wrap.addEventListener( 'touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true } );
    wrap.addEventListener( 'touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if ( Math.abs(dx) > 40 ) { clearInterval(timer); ( dx < 0 ? next : prev )(); startAutoplay(); }
    }, { passive: true } );

    function startAutoplay() {
      if ( ! autoplay ) return;
      clearInterval( timer );
      timer = setInterval( next, speed );
    }

    if ( pauseHover ) {
      wrap.addEventListener( 'mouseenter', () => clearInterval(timer) );
      wrap.addEventListener( 'mouseleave', startAutoplay );
    }

    startAutoplay();
  }

  function init() {
    document.querySelectorAll( '.bktc-wrap[data-autoplay]' ).forEach( initCarousel );
  }

  if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', init );
  } else {
    init();
  }
} )();
