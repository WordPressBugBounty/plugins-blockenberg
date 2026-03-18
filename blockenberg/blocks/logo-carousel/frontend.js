(function () {
    function init(root) {
        if (!root) return;
        var track = root.querySelector('.bkbg-lc-track');
        if (!track) return;

        var infiniteEnabled = root.getAttribute('data-bkbg-infinite') !== '0';
        var autoScrollEnabled = root.getAttribute('data-bkbg-autoscroll') === '1';
        var autoScrollSpeed = parseFloat(root.getAttribute('data-bkbg-autoscroll-speed') || '40');
        if (!isFinite(autoScrollSpeed) || autoScrollSpeed < 0) autoScrollSpeed = 40;
        var autoScrollPauseOnHover = root.getAttribute('data-bkbg-autoscroll-hover') !== '0';

        var dots = root.querySelectorAll('[data-bkbg-dot]');
        var progressBar = root.querySelector('.bkbg-lc-progress-bar');
        var fractionCurrent = root.querySelector('[data-bkbg-fraction="current"]');
        var fractionTotal = root.querySelector('[data-bkbg-fraction="total"]');

        var prev = root.querySelector('[data-bkbg-nav="prev"]');
        var next = root.querySelector('[data-bkbg-nav="next"]');

        var baseCount = 0;
        var didClone = false;
        var isNormalizing = false;
        var segmentStart = 0;
        var segmentWidth = 0;

        function disableTabbing(el) {
            try {
                var focusables = el.querySelectorAll('a, button, input, textarea, select');
                for (var i = 0; i < focusables.length; i++) {
                    focusables[i].setAttribute('tabindex', '-1');
                }
            } catch (e) { }
        }

        function setupInfinite() {
            if (!infiniteEnabled) return;

            var slides = getSlides();
            baseCount = slides.length;
            if (baseCount < 2) return;
            if (didClone) return;

            var originals = Array.prototype.slice.call(slides);
            var before = [];
            var after = [];

            for (var i = 0; i < originals.length; i++) {
                var c1 = originals[i].cloneNode(true);
                c1.classList.add('is-clone');
                c1.setAttribute('aria-hidden', 'true');
                disableTabbing(c1);
                after.push(c1);

                var c2 = originals[i].cloneNode(true);
                c2.classList.add('is-clone');
                c2.setAttribute('aria-hidden', 'true');
                disableTabbing(c2);
                before.push(c2);
            }

            // Prepend in reverse order so the sequence stays correct.
            for (var j = before.length - 1; j >= 0; j--) {
                track.insertBefore(before[j], track.firstChild);
            }
            for (var k = 0; k < after.length; k++) {
                track.appendChild(after[k]);
            }

            didClone = true;

            // Jump to the middle copy.
            window.requestAnimationFrame(function () {
                measureInfinite(true);
                syncIndicators();
            });
        }

        function measureInfinite(recenter) {
            if (!infiniteEnabled || !didClone || !baseCount) return;
            var slides = getSlides();
            if (!slides || slides.length < baseCount * 3) return;

            var middleFirst = slides[baseCount];
            var afterFirst = slides[baseCount * 2];
            if (!middleFirst || !afterFirst) return;

            var nextStart = middleFirst.offsetLeft;
            var nextWidth = afterFirst.offsetLeft - middleFirst.offsetLeft;
            if (!isFinite(nextStart) || !isFinite(nextWidth) || nextWidth <= 0) return;

            if (recenter) {
                // Preserve local offset when dimensions change.
                var local = track.scrollLeft - segmentStart;
                if (segmentWidth > 0) {
                    local = local % segmentWidth;
                    if (local < 0) local += segmentWidth;
                } else {
                    local = 0;
                }
                segmentStart = nextStart;
                segmentWidth = nextWidth;
                track.scrollLeft = segmentStart + local;
            } else {
                segmentStart = nextStart;
                segmentWidth = nextWidth;
            }
        }

        function normalizeInfiniteScroll() {
            if (!infiniteEnabled || !didClone) return;
            if (!segmentWidth || !isFinite(segmentWidth)) {
                measureInfinite(false);
            }
            if (!segmentWidth) return;

            // Keep scrollLeft inside the middle copy to avoid hitting the max scroll clamp.
            if (track.scrollLeft < (segmentStart - 1) || track.scrollLeft >= (segmentStart + segmentWidth + 1)) {
                var local = track.scrollLeft - segmentStart;
                local = local % segmentWidth;
                if (local < 0) local += segmentWidth;
                isNormalizing = true;
                track.scrollLeft = segmentStart + local;
                isNormalizing = false;
            }
        }

        function getSlides() {
            return track.querySelectorAll('.bkbg-lc-slide');
        }

        function getCurrentIndex() {
            var slides = getSlides();
            if (!slides.length) return 0;

            var trackRect = track.getBoundingClientRect();
            var currentIndex = 0;
            for (var i = 0; i < slides.length; i++) {
                var r = slides[i].getBoundingClientRect();
                if (r.left >= trackRect.left - 10) {
                    currentIndex = i;
                    break;
                }
            }
            return currentIndex;
        }

        function scrollToIndex(index) {
            var slides = getSlides();
            if (!slides.length) return;
            var i = Math.max(0, Math.min(slides.length - 1, index));
            slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }

        function scrollToBaseIndex(index) {
            if (!infiniteEnabled || !didClone || !baseCount) {
                scrollToIndex(index);
                return;
            }

            var slides = getSlides();
            if (!slides.length) return;
            var idx = index % baseCount;
            if (idx < 0) idx += baseCount;
            var target = baseCount + idx;
            if (target < 0) target = 0;
            if (target > slides.length - 1) target = slides.length - 1;
            slides[target].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }

        function scrollByOne(dir) {
            var slides = getSlides();
            if (!slides.length) return;
            var currentIndex = getCurrentIndex();
            scrollToIndex(currentIndex + dir);
        }

        function syncIndicators() {
            var slides = getSlides();
            if (!slides.length) return;

            var idx = getCurrentIndex();
            var total = slides.length;
            if (infiniteEnabled && didClone && baseCount) {
                total = baseCount;
                idx = idx % baseCount;
                if (idx < 0) idx += baseCount;
            }

            if (dots && dots.length) {
                for (var i = 0; i < dots.length; i++) {
                    if (i === idx) dots[i].classList.add('is-active');
                    else dots[i].classList.remove('is-active');
                }
            }

            if (progressBar) {
                var pct = 0;
                if (infiniteEnabled && didClone) {
                    if (!segmentWidth) measureInfinite(false);
                    var local = track.scrollLeft - segmentStart;
                    if (segmentWidth > 0) {
                        local = local % segmentWidth;
                        if (local < 0) local += segmentWidth;
                    }
                    var maxLocal = segmentWidth - track.clientWidth;
                    pct = maxLocal > 0 ? (local / maxLocal) * 100 : 0;
                } else {
                    var max = track.scrollWidth - track.clientWidth;
                    pct = max > 0 ? (track.scrollLeft / max) * 100 : 0;
                }
                if (pct < 0) pct = 0;
                if (pct > 100) pct = 100;
                progressBar.style.width = pct + '%';
            }

            if (fractionCurrent) fractionCurrent.textContent = String(idx + 1);
            if (fractionTotal) fractionTotal.textContent = String(total);
        }

        if (prev) prev.addEventListener('click', function (e) { e.preventDefault(); scrollByOne(-1); });
        if (next) next.addEventListener('click', function (e) { e.preventDefault(); scrollByOne(1); });

        if (dots && dots.length) {
            for (var i = 0; i < dots.length; i++) {
                (function (btn) {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        var idx = parseInt(btn.getAttribute('data-bkbg-dot') || '0', 10);
                        scrollToBaseIndex(idx);
                    });
                })(dots[i]);
            }
        }

        // Autoplay (optional)
        var autoplay = root.getAttribute('data-bkbg-autoplay') === '1';
        var delay = parseInt(root.getAttribute('data-bkbg-autoplay-delay') || '3000', 10);
        var pauseOnHover = root.getAttribute('data-bkbg-autoplay-hover') !== '0';
        var timer = null;
        var paused = false;

        function start() {
            if (!autoplay) return;
            if (timer) return;
            if (!delay || delay < 800) delay = 800;
            timer = window.setInterval(function () {
                if (paused) return;
                var slides = getSlides();
                if (!slides.length) return;
                var idx = getCurrentIndex();
                var nextIdx = idx + 1;
                if (nextIdx >= slides.length) nextIdx = 0;
                scrollToIndex(nextIdx);
            }, delay);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (autoplay) {
            start();
            if (pauseOnHover) {
                root.addEventListener('mouseenter', function () { paused = true; });
                root.addEventListener('mouseleave', function () { paused = false; });
            }
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) stop();
                else start();
            });
        }

        // Auto-scroll (continuous, optional). Takes precedence over autoplay.
        var rafId = null;
        var lastTs = 0;
        var autoPaused = false;
        var originalSnap = track.style.scrollSnapType;

        function tick(ts) {
            if (!autoScrollEnabled) return;
            if (!lastTs) lastTs = ts;
            var dt = ts - lastTs;
            lastTs = ts;

            if (!document.hidden && !autoPaused) {
                var d = (autoScrollSpeed * dt) / 1000;
                track.scrollLeft += d;
                normalizeInfiniteScroll();
                syncIndicators();
            }

            rafId = window.requestAnimationFrame(tick);
        }

        function startAutoScroll() {
            if (!autoScrollEnabled) return;
            if (rafId) return;

            // Disable snap so the motion stays smooth.
            track.style.scrollSnapType = 'none';
            lastTs = 0;
            rafId = window.requestAnimationFrame(tick);
        }

        function stopAutoScroll() {
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
            track.style.scrollSnapType = originalSnap;
            lastTs = 0;
        }

        if (autoScrollEnabled) {
            // Disable step autoplay if continuous auto-scroll is on.
            autoplay = false;
            stop();
            startAutoScroll();

            if (autoScrollPauseOnHover) {
                root.addEventListener('mouseenter', function () { autoPaused = true; });
                root.addEventListener('mouseleave', function () { autoPaused = false; });
            }
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) stopAutoScroll();
                else startAutoScroll();
            });
        }

        setupInfinite();

        // Re-measure after images load / layout changes to avoid a visible jump.
        try {
            var imgs = track.querySelectorAll('img');
            for (var ii = 0; ii < imgs.length; ii++) {
                (function (img) {
                    if (!img) return;
                    if (img.complete) return;
                    img.addEventListener('load', function () {
                        window.requestAnimationFrame(function () {
                            measureInfinite(true);
                            syncIndicators();
                        });
                    }, { passive: true });
                })(imgs[ii]);
            }
        } catch (e) { }

        window.addEventListener('resize', function () {
            window.requestAnimationFrame(function () {
                measureInfinite(true);
                syncIndicators();
            });
        }, { passive: true });

        syncIndicators();
        track.addEventListener('scroll', function () {
            normalizeInfiniteScroll();
            if (isNormalizing) return;
            syncIndicators();
        }, { passive: true });
    }

    function boot() {
        var blocks = document.querySelectorAll('.wp-block-blockenberg-logo-carousel');
        for (var i = 0; i < blocks.length; i++) init(blocks[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
