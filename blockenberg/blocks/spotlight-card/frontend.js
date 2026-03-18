/* Spotlight Card — mouse-tracking spotlight frontend */
(function () {
    function init() {
        document.querySelectorAll('.bkspot-card').forEach(function (card) {
            if (card._bkspotInit) return;
            card._bkspotInit = true;

            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                card.style.setProperty('--bkspot-x', x + 'px');
                card.style.setProperty('--bkspot-y', y + 'px');
            });

            card.addEventListener('mouseleave', function () {
                card.style.setProperty('--bkspot-x', '-9999px');
                card.style.setProperty('--bkspot-y', '-9999px');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
