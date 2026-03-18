(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initFeatureTabs();
    });

    function initFeatureTabs() {
        document.querySelectorAll('.bkbg-ftb-wrapper').forEach(function (wrapper) {
            var tabBtns    = wrapper.querySelectorAll('.bkbg-ftb-tab-btn');
            var panels     = wrapper.querySelectorAll('.bkbg-ftb-panel');
            var animate    = wrapper.dataset.animate === '1';

            if (!tabBtns.length || !panels.length) return;

            function activateTab(btn, idx) {
                tabBtns.forEach(function (b) {
                    b.classList.remove('is-active');
                    b.setAttribute('aria-selected', 'false');
                });
                panels.forEach(function (p) {
                    p.classList.remove('is-active');
                    p.setAttribute('aria-hidden', 'true');
                });

                btn.classList.add('is-active');
                btn.setAttribute('aria-selected', 'true');

                var target = Array.from(panels).find(function (p) {
                    return p.dataset.panel === btn.dataset.tab;
                });
                if (target) {
                    target.classList.add('is-active');
                    target.setAttribute('aria-hidden', 'false');
                }
            }

            tabBtns.forEach(function (btn, idx) {
                btn.addEventListener('click', function () {
                    activateTab(btn, idx);
                });
            });
        });
    }
})();
