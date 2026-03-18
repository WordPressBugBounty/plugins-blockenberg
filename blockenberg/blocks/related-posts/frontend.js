( function () {
  /* Get current post ID and taxonomy data from body classes or JSON */
  var bodyEl   = document.body;
  var postId   = null;
  var bodyClass = bodyEl.className || '';

  /* Try to get postid from body class: "postid-123" */
  var pidMatch = bodyClass.match(/postid-(\d+)/);
  if ( pidMatch ) postId = parseInt( pidMatch[1], 10 );

  document.querySelectorAll( '.bkrp-wrap' ).forEach( function ( wrap ) {
    var grid      = wrap.querySelector( '.bkrp-grid' );
    if ( !grid || !postId ) return;

    var relation    = wrap.dataset.relation || 'category';
    var count       = parseInt( wrap.dataset.count, 10 ) || 3;
    var showImage   = wrap.dataset.showImage === '1';
    var showExcerpt = wrap.dataset.showExcerpt === '1';
    var showDate    = wrap.dataset.showDate === '1';
    var imageRatio  = wrap.dataset.imageRatio || '16/9';

    /* First get current post's terms */
    var postUrl = '/wp-json/wp/v2/posts/' + postId;
    fetch( postUrl )
      .then( function (r) { return r.json(); } )
      .then( function ( post ) {
        var cats = post.categories || [];
        var tags = post.tags || [];
        var param = '';
        if ( relation === 'category' && cats.length ) {
          param = '&categories=' + cats.join(',');
        } else if ( relation === 'tag' && tags.length ) {
          param = '&tags=' + tags.join(',');
        } else {
          if ( cats.length ) param += '&categories=' + cats.join(',');
          if ( tags.length ) param += '&tags=' + tags.join(',');
        }
        return fetch( '/wp-json/wp/v2/posts?per_page=' + ( count + 1 ) + '&_embed&exclude=' + postId + param );
      } )
      .then( function (r) { return r.json(); } )
      .then( function ( posts ) {
        if ( !posts || !posts.length ) { grid.innerHTML = '<p style="color:#9ca3af;font-size:.9em">No related posts found.</p>'; return; }
        posts = posts.slice( 0, count );
        grid.classList.remove( 'bkrp-loading' );
        grid.innerHTML = '';
        posts.forEach( function ( post ) {
          var thumb    = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
          var thumbUrl = thumb && thumb.source_url ? thumb.source_url : '';
          var date     = post.date ? new Date( post.date ).toLocaleDateString() : '';
          var excerpt  = post.excerpt && post.excerpt.rendered ? post.excerpt.rendered.replace(/<[^>]+>/g,'') : '';
          excerpt = excerpt.length > 100 ? excerpt.slice(0,100) + '…' : excerpt;

          var a = document.createElement( 'a' );
          a.className = 'bkrp-card';
          a.href = post.link;
          var html = '';
          if ( showImage ) {
            html += '<div class="bkrp-img-wrap" style="aspect-ratio:' + imageRatio + '">' +
              ( thumbUrl ? '<img src="' + thumbUrl + '" alt="' + post.title.rendered + '" loading="lazy" />' : '' ) +
              '</div>';
          }
          html += '<div class="bkrp-body">';
          if ( showDate ) html += '<div class="bkrp-date">' + date + '</div>';
          html += '<div class="bkrp-title">' + post.title.rendered + '</div>';
          if ( showExcerpt && excerpt ) html += '<p class="bkrp-excerpt">' + excerpt + '</p>';
          html += '</div>';
          a.innerHTML = html;
          grid.appendChild( a );
        } );
      } )
      .catch( function () {
        grid.innerHTML = '<p style="color:#9ca3af;font-size:.9em">Unable to load related posts.</p>';
      } );
  } );
} )();
