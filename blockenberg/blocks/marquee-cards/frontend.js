(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function initMarqueeCards(outer) {
        var cfg = {
            speed:      parseFloat(outer.dataset.speed)     || 40,
            direction:  outer.dataset.direction             || 'left',
            pause:      outer.dataset.pause                 !== 'false',
            cardWidth:  parseInt(outer.dataset.cardWidth)   || 280,
            cardGap:    parseInt(outer.dataset.cardGap)     || 20,
            hoverLift:  outer.dataset.hoverLift             !== 'false',
            fade:       outer.dataset.fade                  !== 'false',
        };

        if (reducedMotion()) return;

        var tracks = Array.prototype.slice.call(outer.querySelectorAll('.bkmc-track'));

        tracks.forEach(function (track, rowIdx) {
            var isReverse = track.dataset.reverse === 'true';
            var dir = isReverse
                ? (cfg.direction === 'left' ? 'right' : 'left')
                : cfg.direction;

            // Set gap between cards
            var cards = track.querySelectorAll('.bkmc-card');
            cards.forEach(function (card) {
                card.style.marginRight = cfg.cardGap + 'px';
                card.style.width = cfg.cardWidth + 'px';
            });

            // Calculate animation duration based on speed and total width
            var totalWidth = cfg.cardWidth * (cards.length / 2) + cfg.cardGap * (cards.length / 2);
            var duration = totalWidth / cfg.speed;

            track.dataset.anim = dir;
            track.style.animationDuration = duration + 's';

            // Pause on hover
            if (cfg.pause) {
                outer.addEventListener('mouseenter', function () {
                    track.style.animationPlayState = 'paused';
                });
                outer.addEventListener('mouseleave', function () {
                    track.style.animationPlayState = 'running';
                });
            }
        });

        // Set fade color from parent background if available
        if (cfg.fade) {
            var bg = window.getComputedStyle(outer.parentElement || outer).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                outer.style.setProperty('--bkmc-fade-bg', bg);
            }
        }
    }

    function init() {
        var outers = document.querySelectorAll('.bkmc-outer[data-speed]');
        outers.forEach(function (outer) { initMarqueeCards(outer); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
