(function () {
    'use strict';

    // Floating Stats — card reveal + numeric count-up animation

    function parseNumber(str) {
        // Extract leading number from strings like "10,000+" or "99.9%" or "4.9"
        var clean = str.replace(/,/g, '').match(/[\d.]+/);
        return clean ? parseFloat(clean[0]) : null;
    }

    function formatNumber(num, original) {
        // Restore formatting similar to original
        var hasComma = original.indexOf(',') !== -1;
        var suffix = original.replace(/[\d,. ]/g, '');
        var prefix = '';
        // detect prefix like $ £ €
        var prefixMatch = original.match(/^[^0-9]*/);
        if (prefixMatch && prefixMatch[0]) prefix = prefixMatch[0];
        var formatted = hasComma ? num.toLocaleString('en-US', { maximumFractionDigits: 1 }) : (Number.isInteger(num) ? num.toString() : num.toFixed(1));
        return prefix + formatted + suffix;
    }

    function animateCountUp(el, duration) {
        var original = el.textContent.trim();
        var target = parseNumber(original);
        if (target === null || target === 0) return;

        var start = null;
        var startVal = 0;

        function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = startVal + (target - startVal) * eased;

            // Format matches original (integer vs decimal)
            var isInt = Number.isInteger(target);
            var displayVal = isInt ? Math.round(current) : parseFloat(current.toFixed(1));
            el.textContent = formatNumber(displayVal, original);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = original; // restore exact original
            }
        }

        requestAnimationFrame(step);
    }

    function initFloatingStats() {
        var wraps = document.querySelectorAll('.bkbg-floating-stats');
        if (!wraps.length) return;

        if (!('IntersectionObserver' in window)) {
            wraps.forEach(function (wrap) {
                wrap.querySelectorAll('.bkbg-floating-card').forEach(function (card) {
                    card.classList.add('is-visible');
                });
            });
            return;
        }

        var cardObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                cardObs.unobserve(entry.target);
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });

        var wrapObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var wrap = entry.target;
                var doCountUp = wrap.getAttribute('data-count-up') === '1';
                if (doCountUp) {
                    wrap.querySelectorAll('.bkbg-floating-card__value').forEach(function (el) {
                        animateCountUp(el, 1600);
                    });
                }
                wrapObs.unobserve(wrap);
            });
        }, { threshold: 0.25 });

        wraps.forEach(function (wrap) {
            wrap.querySelectorAll('.bkbg-floating-card').forEach(function (card) {
                cardObs.observe(card);
            });
            wrapObs.observe(wrap);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloatingStats);
    } else {
        initFloatingStats();
    }
}());
