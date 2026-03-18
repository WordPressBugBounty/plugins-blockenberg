(function () {
    // Icon Box is CSS-driven — no JS required for basic functionality.
    // This stub exists to allow future enhancements (e.g. scroll-reveal, tilt effects).
    function initIconBox(wrap) {
        // Reserved for future interactivity.
        void wrap;
    }

    function init() {
        var wraps = document.querySelectorAll('.bkbg-ib-wrap');
        for (var i = 0; i < wraps.length; i++) {
            initIconBox(wraps[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
