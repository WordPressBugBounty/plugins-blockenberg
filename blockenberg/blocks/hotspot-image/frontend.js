/* Hotspot Image — frontend.js */
( function () {
  function init() {
    document.querySelectorAll( '.bkhi-wrap' ).forEach( function ( wrap ) {
      const trigger = wrap.dataset.trigger || 'hover';
      const pins    = Array.from( wrap.querySelectorAll( '.bkhi-pin' ) );

      if ( trigger === 'click' ) {
        pins.forEach( function ( pin ) {
          pin.querySelector( '.bkhi-dot' ).addEventListener( 'click', function (e) {
            e.stopPropagation();
            const isActive = pin.classList.contains( 'bkhi-active' );
            // close all
            pins.forEach( p => p.classList.remove( 'bkhi-active' ) );
            if ( ! isActive ) pin.classList.add( 'bkhi-active' );
          } );
        } );
        // click outside closes
        document.addEventListener( 'click', function () {
          pins.forEach( p => p.classList.remove( 'bkhi-active' ) );
        } );
      }
      // hover is handled by CSS :hover
    } );
  }

  if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', init );
  } else {
    init();
  }
}() );
