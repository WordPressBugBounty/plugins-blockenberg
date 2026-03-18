/* Product Tour — frontend.js (tab switching) */
(function () {
    function initTour(wrap) {
        var tabs   = Array.prototype.slice.call(wrap.querySelectorAll('.bkbg-ptour-tab'));
        var panels = Array.prototype.slice.call(wrap.querySelectorAll('.bkbg-ptour-panel'));

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('bkbg-ptour-tab--active'); });
                panels.forEach(function (p) { p.classList.remove('bkbg-ptour-panel--active'); });
                tab.classList.add('bkbg-ptour-tab--active');
                if (panels[i]) panels[i].classList.add('bkbg-ptour-panel--active');
            });
        });
    }

    document.querySelectorAll('.bkbg-ptour-wrap').forEach(initTour);
})();
