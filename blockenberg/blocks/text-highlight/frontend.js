(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function revealMarks(marks) {
        marks.forEach(function (mark, i) {
            // Delay staggered by index using CSS-custom-property delay set inline
            var delay = parseFloat(mark.dataset.bkthI || 0) * parseFloat(getComputedStyle(mark.closest('[data-threshold]') || document.documentElement).getPropertyValue('--bkth-hl-delay') || 80);
            setTimeout(function () {
                mark.classList.add('bkth-revealed');
            }, delay);
        });
    }

    function hideMarks(marks) {
        marks.forEach(function (mark) {
            mark.classList.remove('bkth-revealed');
        });
    }

    function initBlock(wrap) {
        if (wrap.dataset.animate !== '1') {
            // Static: reveal immediately
            wrap.querySelectorAll('.bkth-hl.bkth-animate').forEach(function (m) {
                m.classList.add('bkth-revealed');
            });
            return;
        }

        var marks = Array.prototype.slice.call(wrap.querySelectorAll('.bkth-hl.bkth-animate'));
        if (!marks.length) return;

        if (reducedMotion()) {
            marks.forEach(function (m) { m.classList.add('bkth-revealed'); });
            return;
        }

        var threshold = parseFloat(wrap.dataset.threshold) || 0.2;
        var repeat    = wrap.dataset.repeat === '1';

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    revealMarks(marks);
                    if (!repeat) observer.unobserve(wrap);
                } else if (repeat) {
                    hideMarks(marks);
                }
            });
        }, { threshold: threshold });

        observer.observe(wrap);
    }

    function init() {
        document.querySelectorAll('.bkth-wrap').forEach(initBlock);
    }

    if (typeof IntersectionObserver === 'undefined') {
        document.querySelectorAll('.bkth-hl').forEach(function (m) { m.classList.add('bkth-revealed'); });
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
