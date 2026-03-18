( function () {
  document.querySelectorAll( '.bksb-form' ).forEach( function ( form ) {
    var input   = form.querySelector( '.bksb-input' );
    var results = form.querySelector( '.bksb-results' );
    if ( !input || !results || input.dataset.live !== '1' ) return;

    var timer;
    var cache = {};

    function doSearch( q ) {
      if ( cache[ q ] ) { render( cache[ q ] ); return; }
      fetch( '/wp-json/wp/v2/search?search=' + encodeURIComponent( q ) + '&per_page=6&_embed' )
        .then( function (r) { return r.json(); } )
        .then( function ( data ) {
          cache[ q ] = data;
          render( data );
        } )
        .catch( function () {} );
    }

    function render( items ) {
      results.innerHTML = '';
      if ( !items || items.length === 0 ) {
        results.innerHTML = '<div class="bksb-results-empty">No results found.</div>';
        results.classList.add( 'bksb-open' );
        return;
      }
      items.forEach( function ( item ) {
        var a = document.createElement( 'a' );
        a.className = 'bksb-result-item';
        a.href = item.url || item.link || '#';
        var thumb = item._embedded && item._embedded['wp:featuredmedia'] && item._embedded['wp:featuredmedia'][0];
        a.innerHTML = ( thumb ? '<img src="' + (thumb.media_details && thumb.media_details.sizes && thumb.media_details.sizes.thumbnail ? thumb.media_details.sizes.thumbnail.source_url : thumb.source_url) + '" alt="" />' : '' ) +
          '<div><div class="bksb-result-title">' + ( item.title && item.title.rendered ? item.title.rendered : item.title ) + '</div>' +
          '<div class="bksb-result-type">' + ( item.subtype || item.type || '' ) + '</div></div>';
        results.appendChild( a );
      } );
      results.classList.add( 'bksb-open' );
    }

    input.addEventListener( 'input', function () {
      clearTimeout( timer );
      var q = input.value.trim();
      if ( q.length < 2 ) { results.classList.remove( 'bksb-open' ); return; }
      timer = setTimeout( function () { doSearch( q ); }, 300 );
    } );

    document.addEventListener( 'click', function ( e ) {
      if ( !form.contains( e.target ) ) results.classList.remove( 'bksb-open' );
    } );
  } );
} )();
