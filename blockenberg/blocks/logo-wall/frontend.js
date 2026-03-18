/* Logo Wall — frontend */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initGrid(grid) {
        if (grid._bklwInit) { return; }
        grid._bklwInit = true;

        var grayscale   = grid.getAttribute('data-grayscale')   !== '0';
        var colorHover  = grid.getAttribute('data-color-hover') !== '0';
        var opacity     = parseInt(grid.getAttribute('data-opacity'), 10) / 100 || 0.6;
        var hoverFx     = grid.getAttribute('data-hover-fx') || 'lift';
        var cardBg      = grid.getAttribute('data-card-bg')    || 'transparent';
        var cardHover   = grid.getAttribute('data-card-hover') || '#f9fafb';

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.bklw-card'));

        cards.forEach(function (card) {
            var img = card.querySelector('.bklw-img');

            card.addEventListener('mouseenter', function () {
                if (reducedMotion) { return; }

                /* bg swap */
                card.style.background = cardHover;

                /* hover effect */
                if (hoverFx === 'lift') {
                    card.style.transform = 'translateY(-4px)';
                    card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                } else if (hoverFx === 'scale') {
                    card.style.transform = 'scale(1.04)';
                } else if (hoverFx === 'glow') {
                    card.style.boxShadow = '0 0 0 3px rgba(108,63,181,0.25)';
                }

                /* image effect */
                if (img) {
                    if (grayscale && colorHover) {
                        img.style.filter = 'grayscale(0%)';
                    }
                    img.style.opacity = '1';
                }
            });

            card.addEventListener('mouseleave', function () {
                /* restore */
                card.style.background = cardBg;
                card.style.transform  = '';
                card.style.boxShadow  = '';

                if (img) {
                    if (grayscale) {
                        img.style.filter = 'grayscale(100%)';
                    }
                    img.style.opacity = opacity.toString();
                }
            });
        });
    }

    function init() {
        document.querySelectorAll('.bklw-grid[data-grayscale]').forEach(initGrid);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
