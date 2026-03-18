(function () {
    'use strict';

    function animateBars() {
        var fills = document.querySelectorAll('.bkbg-rs-fill');
        if (!fills.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var pct = parseFloat(el.getAttribute('data-pct')) || 0;
                    el.style.width = pct + '%';
                    io.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        fills.forEach(function (fill) {
            fill.style.width = '0%';
            fill.style.transition = 'width 0.9s ease';
            io.observe(fill);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateBars);
    } else {
        animateBars();
    }
}());
