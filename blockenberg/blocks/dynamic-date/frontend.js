( function () {
  var FORMAT_MAP = {
    'long-date':    { opts: { weekday:'long', year:'numeric', month:'long', day:'numeric' } },
    'short-date':   { opts: { year:'numeric', month:'short', day:'numeric' } },
    'numeric-date': { opts: { year:'numeric', month:'2-digit', day:'2-digit' } },
    'year-only':    null,
    'time-12':      { opts: { hour:'numeric', minute:'2-digit', hour12: true } },
    'time-24':      { opts: { hour:'2-digit', minute:'2-digit', hour12: false } },
    'datetime':     { opts: { year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' } }
  };

  function formatDate( format, tz ) {
    var now = new Date();
    if ( format === 'year-only' ) return String( now.getFullYear() );
    var entry = FORMAT_MAP[ format ];
    if ( !entry ) return now.toLocaleDateString();
    try {
      var opts = Object.assign( {}, entry.opts );
      if ( tz && tz !== 'site' && tz !== 'utc' ) opts.timeZone = tz;
      if ( tz === 'utc' ) opts.timeZone = 'UTC';
      return now.toLocaleString( navigator.language || 'en', opts );
    } catch (e) {
      return now.toLocaleString();
    }
  }

  document.querySelectorAll( '.bkdd-wrap' ).forEach( function ( wrap ) {
    var format = wrap.dataset.format || 'long-date';
    var tz     = wrap.dataset.tz || 'site';
    var live   = wrap.dataset.live === '1';
    var dateEl = wrap.querySelector( '.bkdd-date' );
    if ( !dateEl ) return;

    function update() {
      dateEl.textContent = formatDate( format, tz );
    }
    update();

    if ( live ) {
      setInterval( update, 1000 );
    }
  } );
} )();
