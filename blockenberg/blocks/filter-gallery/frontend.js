/* Filter Gallery — frontend.js */
( function () {
  function initFilter( wrap ) {
    const buttons = Array.from( wrap.querySelectorAll( '.bkfg-btn' ) );
    const items   = Array.from( wrap.querySelectorAll( '.bkfg-item' ) );
    if ( ! buttons.length || ! items.length ) return;

    buttons.forEach( function ( btn ) {
      btn.addEventListener( 'click', function () {
        // Update active button
        buttons.forEach( b => b.classList.remove( 'bkfg-active' ) );
        btn.classList.add( 'bkfg-active' );

        const filter = ( btn.dataset.filter || '*' ).trim();

        items.forEach( function ( item ) {
          if ( filter === '*' ) {
            item.classList.remove( 'bkfg-hidden' );
          } else {
            const tags = ( item.dataset.tags || '' ).split( ',' ).map( t => t.trim() );
            if ( tags.includes( filter ) ) {
              item.classList.remove( 'bkfg-hidden' );
            } else {
              item.classList.add( 'bkfg-hidden' );
            }
          }
        } );
      } );
    } );
  }

  function init() {
    document.querySelectorAll( '.bkfg-wrap[data-filter]' ).forEach( initFilter );
  }

  if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', init );
  } else {
    init();
  }
}() );
