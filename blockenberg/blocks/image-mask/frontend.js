(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function init() {
        if (reducedMotion()) return;

        var imgs = document.querySelectorAll('.bkim-img[data-hover]');
        imgs.forEach(function (img) {
            var scale = parseFloat(img.dataset.scale) || 108;
            var hover = img.dataset.hover;

            // Set CSS custom property so CSS calc() can use the dynamic scale
            img.style.setProperty('--bkim-scale', scale);

            if (hover === 'none') {
                img.style.transition = 'none';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
