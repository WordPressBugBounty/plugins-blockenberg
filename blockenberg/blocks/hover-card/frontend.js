/* Hover Card — frontend.js */
/* Primary reveal is CSS-driven. This adds touch-device support. */
( function () {
  function init() {
    document.querySelectorAll( '.bkhc-card' ).forEach( function ( card ) {
      card.addEventListener( 'touchstart', function () {
        card.classList.toggle( 'bkhc-touch-active' );
      }, { passive: true } );
    } );

    // Close touch-active when tapping outside
    document.addEventListener( 'touchstart', function ( e ) {
      document.querySelectorAll( '.bkhc-card.bkhc-touch-active' ).forEach( function ( card ) {
        if ( ! card.contains( e.target ) ) {
          card.classList.remove( 'bkhc-touch-active' );
        }
      } );
    }, { passive: true } );
  }

  if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', init );
  } else {
    init();
  }
} )();
