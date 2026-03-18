( function () {
  document.querySelectorAll( '.bkml-wrap' ).forEach( function ( wrap ) {
    if ( wrap.dataset.animate !== '1' ) return;
    var ring = wrap.querySelector( '.bkml-ring' );
    if ( !ring ) return;

    var current   = parseFloat( wrap.dataset.current ) || 0;
    var goal      = parseFloat( wrap.dataset.goal ) || 100;
    var pct       = Math.min( 1, current / goal );
    var r         = parseFloat( ring.getAttribute( 'r' ) );
    var circ      = 2 * Math.PI * r;
    var finalOff  = circ * ( 1 - pct );

    /* Start from fully offset */
    ring.style.strokeDashoffset = circ;

    var observed = false;
    var io = new IntersectionObserver( function ( entries ) {
      entries.forEach( function ( entry ) {
        if ( entry.isIntersecting && !observed ) {
          observed = true;
          ring.style.strokeDashoffset = finalOff;
        }
      } );
    }, { threshold: 0.4 } );
    io.observe( wrap );
  } );
} )();
