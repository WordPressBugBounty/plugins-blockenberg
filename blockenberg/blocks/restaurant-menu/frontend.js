(function () {
    'use strict';

    document.querySelectorAll('.bkbg-rm-wrapper').forEach(function (wrapper) {
        var tabBar = wrapper.querySelector('.bkbg-rm-tab-bar');
        if (!tabBar) return;

        var tabs = tabBar.querySelectorAll('.bkbg-rm-tab-btn');
        var panels = wrapper.querySelectorAll('.bkbg-rm-category-section');

        function showTab(idx) {
            tabs.forEach(function (t, i) {
                t.classList.toggle('is-active', i === idx);
                t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
            });
            panels.forEach(function (p, i) {
                p.classList.toggle('is-active', i === idx);
                p.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
            });
        }

        tabs.forEach(function (tab, idx) {
            tab.addEventListener('click', function () { showTab(idx); });
            tab.setAttribute('tabindex', idx === 0 ? '0' : '-1');
        });

        /* Keyboard navigation */
        tabBar.addEventListener('keydown', function (e) {
            var active = tabBar.querySelector('[aria-selected="true"]');
            var idx = Array.prototype.indexOf.call(tabs, active);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                showTab((idx + 1) % tabs.length);
                tabs[(idx + 1) % tabs.length].focus();
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                showTab((idx - 1 + tabs.length) % tabs.length);
                tabs[(idx - 1 + tabs.length) % tabs.length].focus();
                e.preventDefault();
            }
        });
    });
})();
