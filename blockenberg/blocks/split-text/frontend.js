(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function reveal(units) {
        // CSS stagger is driven by --bkst-i custom property; just add class
        units.forEach(function (unit) {
            unit.classList.add('bkst-revealed');
        });
    }

    function hide(units) {
        units.forEach(function (unit) {
            unit.classList.remove('bkst-revealed');
        });
    }

    function getUnits(section) {
        var split = section.dataset.split || 'words';
        var sel = split === 'chars' ? '.bkst-char' : split === 'lines' ? '.bkst-line' : '.bkst-word';
        return Array.prototype.slice.call(section.querySelectorAll(sel));
    }

    function initSection(section) {
        var threshold = parseFloat(section.dataset.threshold) || 0.15;
        var repeat    = section.dataset.repeat === 'true';

        if (reducedMotion()) {
            // Show all immediately
            var allUnits = Array.prototype.slice.call(section.querySelectorAll('.bkst-word,.bkst-char,.bkst-line'));
            reveal(allUnits);
            return;
        }

        var units   = getUnits(section);
        var stagger = parseFloat(section.dataset.stagger) || 80;

        // Set CSS custom property --bkst-i on each unit for stagger timing
        units.forEach(function (unit, i) {
            unit.style.setProperty('--bkst-i', i);
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    reveal(units);
                    if (!repeat) observer.unobserve(section);
                } else if (repeat) {
                    hide(units);
                }
            });
        }, { threshold: threshold });

        observer.observe(section);
    }

    function init() {
        document.querySelectorAll('.bkst-section[data-animation]').forEach(initSection);
    }

    if (typeof IntersectionObserver === 'undefined') {
        // Fallback for very old browsers
        document.querySelectorAll('.bkst-word,.bkst-char,.bkst-line').forEach(function (el) {
            el.classList.add('bkst-revealed');
        });
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
