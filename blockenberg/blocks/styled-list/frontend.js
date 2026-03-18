(function () {
    'use strict';

    /**
     * Styled List — frontend script
     *
     * The block is primarily CSS-driven. This script handles:
     *  1. Hover background colour — we read the CSS var and apply it so
     *     browsers that don't support CSS colour-mix still get the effect.
     *  2. A small entrance animation (optional — only when the wrap has
     *     data-animate="1", reserved for future use via the editor toggle).
     */

    function toArray(nl) {
        return Array.prototype.slice.call(nl || []);
    }

    function initStyledList(wrap) {
        // Nothing interactive is required right now.
        // The hover state and dividers are handled entirely via CSS.
        // This function is intentionally kept for future extension points
        // (e.g. animate-on-scroll, click-to-expand description, etc.).
    }

    function init() {
        toArray(document.querySelectorAll('.bkbg-sl-wrap')).forEach(initStyledList);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
