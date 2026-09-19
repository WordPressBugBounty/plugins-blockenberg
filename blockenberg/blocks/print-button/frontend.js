/* Print / PDF Button — frontend */
( function () {
	'use strict';

	function onClick( e ) {
		var btn = e.target.closest( '[data-bkbg-print="1"]' );
		if ( ! btn ) {
			return;
		}
		e.preventDefault();
		window.print();
	}

	function init() {
		document.addEventListener( 'click', onClick );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
}() );
