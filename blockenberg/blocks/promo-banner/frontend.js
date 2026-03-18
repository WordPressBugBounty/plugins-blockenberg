( function () {
  function getCookie( name ) {
    var match = document.cookie.match( new RegExp( '(?:^|; )' + name.replace( /[.$?*|{}()[\]\\/+^]/g, '\\$&' ) + '=([^;]*)' ) );
    return match ? decodeURIComponent( match[1] ) : null;
  }
  function setCookie( name, value, days ) {
    var expires = '';
    if ( days ) {
      var d = new Date();
      d.setTime( d.getTime() + days * 86400000 );
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent( value ) + expires + '; path=/';
  }

  document.querySelectorAll( '.bkpb-wrap' ).forEach( function ( wrap, idx ) {
    var cookieKey = 'bkpb_closed_' + idx;
    var cookieDays = parseInt( wrap.dataset.cookie, 10 ) || 0;

    /* Check if the user dismissed */
    if ( cookieDays > 0 && getCookie( cookieKey ) === '1' ) {
      wrap.classList.add( 'bkpb-hidden' );
      return;
    }

    /* Animation */
    var anim = wrap.dataset.animation || 'none';
    if ( anim !== 'none' ) {
      wrap.classList.add( 'bkpb-anim-' + anim );
    }

    /* Shift body if fixed top */
    if ( wrap.classList.contains( 'bkpb-pos-top' ) ) {
      document.body.style.paddingTop = ( parseInt( document.body.style.paddingTop, 10 ) || 0 ) + wrap.offsetHeight + 'px';
    }
    if ( wrap.classList.contains( 'bkpb-pos-bottom' ) ) {
      document.body.style.paddingBottom = ( parseInt( document.body.style.paddingBottom, 10 ) || 0 ) + wrap.offsetHeight + 'px';
    }

    /* Close button */
    var btn = wrap.querySelector( '.bkpb-close' );
    if ( btn ) {
      btn.addEventListener( 'click', function () {
        wrap.classList.add( 'bkpb-hidden' );
        if ( cookieDays > 0 ) {
          setCookie( cookieKey, '1', cookieDays );
        }
      } );
    }
  } );
} )();
