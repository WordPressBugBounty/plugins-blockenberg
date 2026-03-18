(function () {
    'use strict';

    document.querySelectorAll('.bkbg-sf-wrapper').forEach(function (wrapper) {
        var grid = wrapper.querySelector('.bkbg-sf-grid');
        if (!grid) return;

        /* Responsive columns from data attrs */
        var colsTablet = grid.getAttribute('data-cols-tablet') || '2';
        var colsMobile = grid.getAttribute('data-cols-mobile') || '1';

        var styleEl = document.createElement('style');
        styleEl.textContent = [
            '@media(max-width:900px){.bkbg-sf-grid[data-cols-tablet="' + colsTablet + '"]{grid-template-columns:repeat(' + colsTablet + ',1fr)}}',
            '@media(max-width:600px){.bkbg-sf-grid[data-cols-mobile="' + colsMobile + '"]{grid-template-columns:repeat(' + colsMobile + ',1fr)}}',
        ].join('');
        document.head.appendChild(styleEl);

        /* Staggered entrance animation */
        var cards = grid.querySelectorAll('.bkbg-sf-card');
        if (!cards.length || !('IntersectionObserver' in window)) return;

        cards.forEach(function (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(18px)';
            card.style.transition = 'opacity 0.48s ease, transform 0.48s ease';
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var card = entry.target;
                var idx = Array.prototype.indexOf.call(cards, card);
                setTimeout(function () {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, idx * 70);
                io.unobserve(card);
            });
        }, { threshold: 0.12 });

        cards.forEach(function (card) { io.observe(card); });
    });
})();
