(function () {
    'use strict';

    document.querySelectorAll('.bkbg-csw-wrapper').forEach(function (wrap) {
        var btns   = wrap.querySelectorAll('.bkbg-csw-switch-btn');
        var panels = wrap.querySelectorAll('.bkbg-csw-panel');
        var animEls= wrap.querySelectorAll('.bkbg-csw-anim');

        function showPanel(targetId) {
            panels.forEach(function (panel) {
                var isTarget = panel.getAttribute('data-panel') === targetId;
                panel.style.display = isTarget ? '' : 'none';
                panel.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
            });
            btns.forEach(function (btn) {
                var isActive = btn.getAttribute('data-target') === targetId;
                btn.classList.toggle('is-active', isActive);
            });
        }

        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                showPanel(btn.getAttribute('data-target'));
            });
        });

        /* Scroll-in animation */
        if (animEls.length) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('bkbg-csw-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            animEls.forEach(function (el) { observer.observe(el); });
        }
    });
})();
