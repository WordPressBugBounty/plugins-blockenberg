// Star Rating — CSS-only block. No JS required on frontend.
(function () {
    'use strict';
    // Reserved for future interactivity (e.g. animated fill on scroll).
    function initStarRating() {
        // no-op
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStarRating);
    } else {
        initStarRating();
    }
})();
