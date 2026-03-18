( function () {
  document.querySelectorAll( '.bkco-wrap[data-dismissible="1"]' ).forEach( function ( wrap ) {
    var btn = wrap.querySelector( '.bkco-close' );
    if ( btn ) {
      btn.addEventListener( 'click', function () {
        wrap.classList.add( 'bkco-hidden' );
      } );
    }
  } );
} )();
