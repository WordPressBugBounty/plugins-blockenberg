(function () {
    'use strict';

    /**
     * Blockenberg Google Map — frontend script
     *
     * Minimal enhancement:
     * - Ensures every iframe has a title for accessibility (in case a theme strips it).
     * - Adds keyboard focusability to the iframe so keyboard users can interact.
     */
    function initMaps() {
        var maps = document.querySelectorAll('.bkbg-gm-wrap iframe');
        if (!maps.length) return;

        maps.forEach(function (iframe) {
            // Ensure title attribute exists (accessibility/screen-readers)
            if (!iframe.getAttribute('title')) {
                iframe.setAttribute('title', 'Google Map');
            }

            // Make iframe keyboard-focusable if it isn't already
            if (!iframe.hasAttribute('tabindex')) {
                iframe.setAttribute('tabindex', '0');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMaps);
    } else {
        initMaps();
    }
})();
