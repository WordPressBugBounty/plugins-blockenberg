/* Parallax Section — frontend */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── collect all parallax sections ──────────────────────────────────────── */
    var sections = [];

    function collectSections() {
        sections = Array.prototype.slice.call(
            document.querySelectorAll('.bkps-outer[data-parallax="1"]')
        ).map(function (outer) {
            var bg = outer.querySelector('.bkps-bg');
            var speed = parseFloat(outer.getAttribute('data-speed')) || 0.4;
            return { outer: outer, bg: bg, speed: speed };
        }).filter(function (s) { return s.bg; });
    }

    /* ── rAF update loop ─────────────────────────────────────────────────────── */
    var ticking = false;

    function updateAll() {
        var scrollY = window.pageYOffset;

        sections.forEach(function (s) {
            var rect   = s.outer.getBoundingClientRect();
            var vh     = window.innerHeight;

            /* only update when on screen */
            if (rect.bottom < 0 || rect.top > vh) { return; }

            /* relative scroll position: 0 when section top at screen bottom, 1 when section bottom at screen top */
            var progress = (scrollY + vh - (s.outer.offsetTop)) / (vh + s.outer.offsetHeight);
            progress     = Math.max(0, Math.min(1, progress));

            /* movement range: ±(speed * 30)% of outer height  */
            var shift    = (progress - 0.5) * s.speed * s.outer.offsetHeight;

            s.bg.style.transform = 'translate3d(0, ' + shift + 'px, 0)';
        });
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateAll);
        }
    }

    /* ── init ────────────────────────────────────────────────────────────────── */
    function init() {
        if (reducedMotion) { return; }
        collectSections();
        if (!sections.length) { return; }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', function () {
            collectSections(); /* recollect offsets on resize */
            updateAll();
        });
        /* initial position */
        requestAnimationFrame(updateAll);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
