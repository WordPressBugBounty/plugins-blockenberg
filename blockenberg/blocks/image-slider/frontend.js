(function () {
    'use strict';

    function initSlider(wrapper) {
        var slider      = wrapper.querySelector('.bkbg-is-slider');
        if (!slider) return;

        var slides      = Array.prototype.slice.call(wrapper.querySelectorAll('.bkbg-is-slide'));
        var dots        = Array.prototype.slice.call(wrapper.querySelectorAll('.bkbg-is-dot'));
        var prevBtn     = wrapper.querySelector('.bkbg-is-arrow-prev');
        var nextBtn     = wrapper.querySelector('.bkbg-is-arrow-next');
        var total       = slides.length;
        if (total < 2) return;

        var current     = 0;
        var autoplay    = wrapper.dataset.autoplay === '1';
        var speed       = parseInt(wrapper.dataset.speed, 10) || 4000;
        var loop        = wrapper.dataset.loop === '1';
        var pauseHover  = wrapper.dataset.pauseHover === '1';
        var transition  = wrapper.dataset.transition || 'slide';
        var timer       = null;
        var touching    = false;
        var touchStartX = 0;

        function goTo(n) {
            if (!loop && (n < 0 || n >= total)) return;
            var prev = current;
            current = (n + total) % total;
            if (prev === current) return;

            slides[prev].classList.remove('bkbg-is-slide-active');
            if (transition === 'slide') slides[prev].classList.add('bkbg-is-slide-exit');

            slides[current].classList.add('bkbg-is-slide-active');
            if (dots[prev]) dots[prev].classList.remove('bkbg-is-dot-active');
            if (dots[current]) dots[current].classList.add('bkbg-is-dot-active');

            if (transition === 'slide') {
                var exPrev = prev;
                setTimeout(function () { slides[exPrev].classList.remove('bkbg-is-slide-exit'); }, 600);
            }
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function startTimer() {
            if (!autoplay) return;
            timer = setInterval(next, speed);
        }

        function stopTimer() { clearInterval(timer); timer = null; }

        if (nextBtn) nextBtn.addEventListener('click', function () { stopTimer(); next(); startTimer(); });
        if (prevBtn) prevBtn.addEventListener('click', function () { stopTimer(); prev(); startTimer(); });

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () { stopTimer(); goTo(idx); startTimer(); });
        });

        if (pauseHover) {
            wrapper.addEventListener('mouseenter', stopTimer);
            wrapper.addEventListener('mouseleave', function () { if (autoplay) startTimer(); });
        }

        /* Touch/swipe */
        wrapper.addEventListener('touchstart', function (e) {
            touching = true;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        wrapper.addEventListener('touchend', function (e) {
            if (!touching) return;
            touching = false;
            var delta = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 40) {
                stopTimer();
                delta > 0 ? next() : prev();
                startTimer();
            }
        });

        /* Keyboard support */
        wrapper.setAttribute('tabindex', '0');
        wrapper.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft')  { stopTimer(); prev(); startTimer(); }
            if (e.key === 'ArrowRight') { stopTimer(); next(); startTimer(); }
        });

        startTimer();
    }

    function init() {
        document.querySelectorAll('.bkbg-is-wrapper').forEach(initSlider);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
