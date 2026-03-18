(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function initBlob(section) {
        var speed  = parseFloat(section.dataset.speed) || 10;
        var paused = section.dataset.paused === 'true';

        if (reducedMotion()) {
            // CSS handles it via @media, but also set JS flag
            section.setAttribute('data-paused', 'true');
            return;
        }

        // Sync animation speed from data attribute to CSS custom property
        section.style.setProperty('--bkgb-speed', speed + 's');

        if (paused) {
            section.setAttribute('data-paused', 'true');
        }
    }

    function init() {
        document.querySelectorAll('.bkgb-section[data-speed]').forEach(initBlob);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
