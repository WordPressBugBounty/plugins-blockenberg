(function () {
    'use strict';

    document.querySelectorAll('.bkbg-faqc-wrapper').forEach(function (wrap) {
        var allowMultiple = wrap.getAttribute('data-allow-multiple') === '1';
        var iconType      = wrap.getAttribute('data-icon-type') || 'plus';
        var navBtns       = [].slice.call(wrap.querySelectorAll('.bkbg-faqc-nav-item'));
        var panels        = [].slice.call(wrap.querySelectorAll('.bkbg-faqc-panel'));
        var faqItems      = [].slice.call(wrap.querySelectorAll('.bkbg-faqc-item'));
        var searchEl      = wrap.querySelector('.bkbg-faqc-search-global, .bkbg-faqc-search');

        function iconFor(open) {
            if (iconType === 'chevron') return open ? '▲' : '▼';
            if (iconType === 'arrow')   return open ? '↑' : '↓';
            return open ? '−' : '+';
        }

        /* ── Category nav ──────────────────────────────────────────────── */
        function showCategory(catId) {
            navBtns.forEach(function (btn) {
                var isTarget = btn.getAttribute('data-cat') === catId;
                btn.classList.toggle('is-active', isTarget);
                btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
            });
            panels.forEach(function (panel) {
                var isTarget = panel.getAttribute('data-cat') === catId;
                panel.style.display  = isTarget ? '' : 'none';
                panel.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
            });
        }

        navBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                showCategory(btn.getAttribute('data-cat'));
            });
        });

        /* ── FAQ accordion ─────────────────────────────────────────────── */
        faqItems.forEach(function (item) {
            var qBtn   = item.querySelector('.bkbg-faqc-q');
            var aEl    = item.querySelector('.bkbg-faqc-a');
            var iconEl = item.querySelector('.bkbg-faqc-icon');
            if (!qBtn || !aEl) return;

            /* Respect initial state saved in HTML */
            var startOpen = item.getAttribute('data-open') === '1';
            aEl.style.display    = startOpen ? '' : 'none';
            aEl.setAttribute('aria-hidden', startOpen ? 'false' : 'true');
            qBtn.setAttribute('aria-expanded', startOpen ? 'true' : 'false');
            if (iconEl) iconEl.textContent = iconFor(startOpen);

            qBtn.addEventListener('click', function () {
                var isExpanded = qBtn.getAttribute('aria-expanded') === 'true';

                /* Close siblings in same panel if !allowMultiple */
                if (!allowMultiple && !isExpanded) {
                    var parentPanel = item.closest('.bkbg-faqc-panel') || wrap;
                    parentPanel.querySelectorAll('.bkbg-faqc-item').forEach(function (sibling) {
                        if (sibling === item) return;
                        var sq = sibling.querySelector('.bkbg-faqc-q');
                        var sa = sibling.querySelector('.bkbg-faqc-a');
                        var si = sibling.querySelector('.bkbg-faqc-icon');
                        if (sq && sa) {
                            sa.style.display = 'none';
                            sa.setAttribute('aria-hidden', 'true');
                            sq.setAttribute('aria-expanded', 'false');
                            if (si) si.textContent = iconFor(false);
                        }
                    });
                }

                var nextOpen = !isExpanded;
                aEl.style.display = nextOpen ? '' : 'none';
                aEl.setAttribute('aria-hidden', nextOpen ? 'false' : 'true');
                qBtn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
                if (iconEl) iconEl.textContent = iconFor(nextOpen);
            });
        });

        /* ── Search ────────────────────────────────────────────────────── */
        if (searchEl) {
            searchEl.addEventListener('input', function () {
                var query = searchEl.value.toLowerCase().trim();

                /* If there's a global search, we search across ALL panels */
                var isGlobal = searchEl.classList.contains('bkbg-faqc-search-global');

                if (isGlobal && query) {
                    /* Show all panels temporarily so items are searchable */
                    panels.forEach(function (p) { p.style.display = ''; p.setAttribute('aria-hidden', 'false'); });
                    navBtns.forEach(function (b) { b.classList.remove('is-active'); });
                }

                faqItems.forEach(function (item) {
                    var q = item.querySelector('.bkbg-faqc-q');
                    var a = item.querySelector('.bkbg-faqc-a');
                    var qText = (q && q.textContent)  || '';
                    var aText = (a && a.textContent)   || '';
                    var match = !query || qText.toLowerCase().indexOf(query) !== -1 || aText.toLowerCase().indexOf(query) !== -1;
                    item.classList.toggle('is-hidden', !match);
                });

                /* Restore nav/panel state when search cleared */
                if (isGlobal && !query) {
                    var firstBtn = navBtns[0];
                    if (firstBtn) showCategory(firstBtn.getAttribute('data-cat'));
                    faqItems.forEach(function (item) { item.classList.remove('is-hidden'); });
                }
            });
        }
    });
})();
