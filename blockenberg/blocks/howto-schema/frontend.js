(function () {
    'use strict';

    // Staggered entrance animation for HowTo steps
    if (!('IntersectionObserver' in window)) return;

    document.querySelectorAll('.bkbg-hs-steps').forEach(function (ol) {
        var steps = ol.querySelectorAll('.bkbg-hs-step');
        if (!steps.length) return;

        // Mark each step for animation
        steps.forEach(function (step) {
            step.setAttribute('data-animate', '');
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var step = entry.target;
                // Get the index to stagger
                var idx = Array.prototype.indexOf.call(steps, step);
                setTimeout(function () {
                    step.setAttribute('data-animate', 'in');
                }, idx * 100);
                io.unobserve(step);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        steps.forEach(function (step) {
            io.observe(step);
        });
    });
})();
