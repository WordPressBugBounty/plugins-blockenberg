(function () {
    'use strict';

    document.querySelectorAll('.bkbg-lc-wrapper').forEach(function (wrapper) {
        /* ── Staggered card entrance animation ───────────────────── */
        if (!('IntersectionObserver' in window)) return;

        var cards = wrapper.querySelectorAll('.bkbg-lc-card');
        cards.forEach(function (card, i) {
            card.style.opacity  = '0';
            card.style.transform = 'translateY(24px)';
            card.style.transition = 'opacity 0.45s ease ' + (i * 0.08) + 's, transform 0.45s ease ' + (i * 0.08) + 's';
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity  = '1';
                entry.target.style.transform = 'translateY(0)';
                io.unobserve(entry.target);
            });
        }, { threshold: 0.08 });

        cards.forEach(function (card) { io.observe(card); });

        /* ── Directions button → open Google Maps ────────────────── */
        wrapper.querySelectorAll('.bkbg-lc-btn-directions[data-address]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var addr = btn.getAttribute('data-address');
                if (!addr) return;
                window.open('https://www.google.com/maps/search/' + encodeURIComponent(addr), '_blank', 'noopener');
            });
        });
    });
})();
