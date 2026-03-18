(function () {
    'use strict';

    function initFeatureGrid(wrapper) {
        var cards = wrapper.querySelectorAll('.bkbg-fg-card.bkbg-fg-anim');
        if (!cards.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('bkbg-fg-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        cards.forEach(function (card) {
            io.observe(card);
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-fg-wrapper').forEach(initFeatureGrid);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
