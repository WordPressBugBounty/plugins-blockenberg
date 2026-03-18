/* ====================================================
   Use Case Section — frontend.js
   Handles: tabs display mode switching
   ==================================================== */
(function () {
    'use strict';

    document.querySelectorAll('.bkbg-usec-wrap[data-display-style="tabs"]').forEach(function (wrap) {
        var grid = wrap.querySelector('.bkbg-usec-grid--tabs');
        if (!grid) return;

        var cards = Array.from(grid.querySelectorAll('.bkbg-usec-card'));
        if (cards.length === 0) return;

        /* Build tab nav */
        var nav = document.createElement('div');
        nav.className = 'bkbg-usec-tabs-nav';

        cards.forEach(function (card, idx) {
            var label = card.dataset.tabLabel || ('Tab ' + (idx + 1));
            var btn   = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'bkbg-usec-tab-btn' + (idx === 0 ? ' is-active' : '');
            btn.textContent = label;

            btn.addEventListener('click', function () {
                /* Deactivate all */
                nav.querySelectorAll('.bkbg-usec-tab-btn').forEach(function (b) { b.classList.remove('is-active'); });
                cards.forEach(function (c) { c.classList.remove('is-active'); });
                /* Activate selected */
                btn.classList.add('is-active');
                cards[idx].classList.add('is-active');
            });

            nav.appendChild(btn);
        });

        /* Insert nav before grid */
        grid.parentNode.insertBefore(nav, grid);

        /* Show first card */
        cards[0].classList.add('is-active');
    });
})();
