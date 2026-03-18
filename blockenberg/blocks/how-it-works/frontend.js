(function () {
    'use strict';

    document.querySelectorAll('.bkbg-hiw-wrapper').forEach(function (wrap) {
        var steps = wrap.querySelectorAll('.bkbg-hiw-anim');
        if (!steps.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var delay = parseFloat(el.getAttribute('data-delay') || 0);
                    setTimeout(function () {
                        el.classList.add('bkbg-hiw-visible');
                    }, delay);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.15 });

        steps.forEach(function (step, i) {
            step.setAttribute('data-delay', i * 120);
            observer.observe(step);
        });
    });
})();
