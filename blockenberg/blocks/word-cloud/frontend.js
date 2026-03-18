/* Word Cloud — frontend */
(function () {
    'use strict';

    /* CSS handles scale hover via [data-hover="scale"]:hover.
       No JS needed unless we add click-to-filter in future.
       This file intentionally minimal — kept for future extension. */

    function init() {
        /* Nothing to initialise: all effects are pure CSS.
           Words with links are <a> tags; others are <span>. */
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
