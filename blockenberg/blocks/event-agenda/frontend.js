(function () {
    'use strict';

    document.querySelectorAll('.bkbg-ea-wrapper').forEach(function (wrapper) {
        var tabBar = wrapper.querySelector('.bkbg-ea-tab-bar');
        if (!tabBar) return;

        var tabs   = tabBar.querySelectorAll('.bkbg-ea-tab-btn');
        var panels = wrapper.querySelectorAll('.bkbg-ea-day-panel');

        function showDay(idx) {
            tabs.forEach(function (t, i) {
                t.classList.toggle('is-active', i === idx);
                t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
                t.setAttribute('tabindex', i === idx ? '0' : '-1');
            });
            panels.forEach(function (p, i) {
                p.classList.toggle('is-active', i === idx);
                p.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
                p.style.display = i === idx ? 'block' : 'none';
            });
        }

        tabs.forEach(function (tab, idx) {
            tab.addEventListener('click', function () { showDay(idx); });
        });

        /* Keyboard navigation */
        tabBar.addEventListener('keydown', function (e) {
            var active = tabBar.querySelector('[aria-selected="true"]');
            var idx = Array.prototype.indexOf.call(tabs, active);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                var next = (idx + 1) % tabs.length;
                showDay(next);
                tabs[next].focus();
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                var prev = (idx - 1 + tabs.length) % tabs.length;
                showDay(prev);
                tabs[prev].focus();
                e.preventDefault();
            }
        });

        /* Session card entrance animation */
        if ('IntersectionObserver' in window) {
            var sessions = wrapper.querySelectorAll('.bkbg-ea-session');
            sessions.forEach(function (s) {
                s.style.opacity = '0';
                s.style.transform = 'translateX(-12px)';
                s.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            });

            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var el = entry.target;
                    el.style.opacity = '1';
                    el.style.transform = 'translateX(0)';
                    io.unobserve(el);
                });
            }, { threshold: 0.08 });

            sessions.forEach(function (s) { io.observe(s); });
        }
    });
})();
