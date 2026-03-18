(function () {
    'use strict';

    /* ── Numeric count-up ── */
    function parseValue(str) {
        /* Extract leading/trailing non-numeric parts and the numeric core */
        var match = str.match(/^([^0-9-]*)(-?[\d,\.]+)([^0-9]*)$/);
        if (!match) return null;
        return {
            prefix: match[1],
            number: parseFloat(match[2].replace(/,/g, '')),
            suffix: match[3],
            raw: match[2],
            hasComma: match[2].indexOf(',') !== -1,
            decimals: (match[2].split('.')[1] || '').length,
        };
    }

    function formatNumber(n, info) {
        var fixed = n.toFixed(info.decimals);
        if (info.hasComma) {
            var parts = fixed.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            fixed = parts.join('.');
        }
        return info.prefix + fixed + info.suffix;
    }

    function countUp(el, info, duration) {
        var start = 0;
        var end = info.number;
        var startTime = null;
        el.classList.add('bkbg-counting');

        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            /* Ease out */
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = formatNumber(start + (end - start) * eased, info);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = formatNumber(end, info);
                el.classList.remove('bkbg-counting');
            }
        }
        requestAnimationFrame(step);
    }

    function initCard(card) {
        var valueEl = card.querySelector('.bkbg-metric-value');
        if (!valueEl) return;
        var info = parseValue(valueEl.textContent.trim());
        if (!info || isNaN(info.number)) return;
        countUp(valueEl, info, 1200);
    }

    function observeCards() {
        var cards = document.querySelectorAll('.bkbg-metric-card');
        if (!cards.length) return;

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        io.unobserve(entry.target);
                        initCard(entry.target);
                    }
                });
            }, { threshold: 0.25 });
            cards.forEach(function (card) { io.observe(card); });
        } else {
            cards.forEach(initCard);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeCards);
    } else {
        observeCards();
    }
}());
