(function () {
    'use strict';

    document.querySelectorAll('.bkbg-gl-list').forEach(function (list) {
        var opts = {};
        try { opts = JSON.parse(list.dataset.opts || '{}'); } catch (e) {}

        var items = list.querySelectorAll('.bkbg-gl-item');

        /* --- Expandable accordion --- */
        if (opts.expandable) {
            items.forEach(function (item) {
                var term = item.querySelector('.bkbg-gl-term');
                var def  = item.querySelector('.bkbg-gl-def');
                if (!term || !def) return;
                def.style.display = 'none';
                term.setAttribute('role', 'button');
                term.setAttribute('aria-expanded', 'false');
                term.style.cursor = 'pointer';
                term.addEventListener('click', function () {
                    var open = def.style.display !== 'none';
                    def.style.display = open ? 'none' : '';
                    term.setAttribute('aria-expanded', String(!open));
                });
            });
        }

        /* --- Alpha nav smooth scroll --- */
        var wrap = list.closest('[class*="bkbg-gl"]') || list.parentElement;
        var nav = wrap && wrap.querySelector('.bkbg-gl-alpha-nav');
        if (nav) {
            nav.querySelectorAll('.bkbg-gl-nav-btn.active').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    var href = btn.getAttribute('href');
                    if (!href) return;
                    e.preventDefault();
                    var target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        }
    });

    /* --- Search --- (listens on the search input above the list) */
    document.querySelectorAll('.bkbg-gl-search').forEach(function (input) {
        var wrap     = input.closest('[class*="bkbg-gl"]') || input.parentElement;
        var listEl   = wrap && wrap.querySelector('.bkbg-gl-list');
        if (!listEl) return;

        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            var items = listEl.querySelectorAll('.bkbg-gl-item');
            items.forEach(function (item) {
                var term = (item.dataset.term || '').toLowerCase();
                var def  = (item.querySelector('.bkbg-gl-def') || {}).textContent || '';
                var match = !q || term.indexOf(q) !== -1 || def.toLowerCase().indexOf(q) !== -1;
                item.classList.toggle('hidden', !match);
            });
            // Hide empty letter sections
            if (listEl) {
                listEl.querySelectorAll('.bkbg-gl-letter-section').forEach(function (section) {
                    var visible = section.querySelectorAll('.bkbg-gl-item:not(.hidden)').length > 0;
                    section.style.display = visible ? '' : 'none';
                });
            }
        });
    });
})();
