(function () {
    'use strict';

    var LOTTIE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';

    function loadScript(src, cb) {
        if (window.lottie) { cb(); return; }
        var s = document.createElement('script');
        s.src = src;
        s.onload = cb;
        s.onerror = function () { console.warn('Blockenberg: failed to load Lottie from', src); };
        document.head.appendChild(s);
    }

    function initLottie(outer) {
        var src       = outer.dataset.src || '';
        var trigger   = outer.dataset.trigger   || 'autoplay';
        var loop      = outer.dataset.loop      !== '0';
        var speed     = parseFloat(outer.dataset.speed || '1') || 1;
        var direction = parseInt(outer.dataset.direction || '1', 10) || 1;
        var keepFrame = outer.dataset.keepFrame === '1';

        if (!src) return;

        var container = outer.querySelector('.bkbg-lt-player');
        if (!container) return;

        var anim = null;

        function createAnim(autoStart) {
            anim = window.lottie.loadAnimation({
                container : container,
                renderer  : 'svg',
                loop      : loop,
                autoplay  : autoStart,
                path      : src
            });
            anim.setSpeed(speed);
            anim.setDirection(direction);

            if (keepFrame) {
                anim.addEventListener('complete', function () {
                    anim.goToAndStop(anim.totalFrames - 1, true);
                });
            }
        }

        if (trigger === 'autoplay') {
            createAnim(true);

        } else if (trigger === 'hover') {
            createAnim(false);
            outer.addEventListener('mouseenter', function () { anim && anim.play(); });
            outer.addEventListener('mouseleave', function () { anim && anim.pause(); });

        } else if (trigger === 'click') {
            createAnim(false);
            var isPlaying = false;
            outer.addEventListener('click', function () {
                if (!anim) return;
                if (isPlaying) {
                    anim.pause();
                    isPlaying = false;
                } else {
                    anim.play();
                    isPlaying = true;
                }
            });

        } else if (trigger === 'scroll') {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        if (!anim) {
                            createAnim(true);
                        } else {
                            anim.play();
                        }
                        if (!loop) io.unobserve(outer);
                    } else if (anim) {
                        anim.pause();
                    }
                });
            }, { threshold: 0.25 });
            io.observe(outer);
        }
    }

    function init() {
        var wrappers = document.querySelectorAll('.bkbg-lt-outer[data-src]');
        if (!wrappers.length) return;
        loadScript(LOTTIE_CDN, function () {
            wrappers.forEach(initLottie);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
