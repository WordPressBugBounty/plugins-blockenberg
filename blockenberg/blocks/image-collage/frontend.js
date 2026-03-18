(function () {
    'use strict';

    function initCollage() {
        var collages = document.querySelectorAll('.bkbg-image-collage[data-animate-in="1"]');
        if (!collages.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('bkbg-ic--visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        collages.forEach(function (collage) { io.observe(collage); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCollage);
    } else {
        initCollage();
    }
}());
