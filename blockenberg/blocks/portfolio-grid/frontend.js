wp.domReady(function () {
    /* ── Filter ─────────────────────────────────────────────────────────────── */
    document.querySelectorAll('.bkbg-pg-wrapper').forEach(function (wrapper) {
        var filterBtns = wrapper.querySelectorAll('.bkbg-pg-filter-btn');
        var cards = wrapper.querySelectorAll('.bkbg-pg-card');

        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.getAttribute('data-filter');

                filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
                btn.classList.add('is-active');

                cards.forEach(function (card) {
                    if (filter === '*') {
                        card.classList.remove('bkbg-pg-hidden');
                    } else {
                        var cat = card.getAttribute('data-category') || '';
                        if (cat === filter) {
                            card.classList.remove('bkbg-pg-hidden');
                        } else {
                            card.classList.add('bkbg-pg-hidden');
                        }
                    }
                });
            });
        });

        /* ── Animate on scroll ──────────────────────────────────────────────── */
        var animCards = wrapper.querySelectorAll('.bkbg-pg-anim');
        if (!animCards.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, idx) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        entry.target.classList.add('bkbg-pg-visible');
                    }, idx * 80);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animCards.forEach(function (card) { io.observe(card); });
    });
});
