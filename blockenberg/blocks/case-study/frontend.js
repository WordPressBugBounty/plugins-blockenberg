(function () {
    /* ── Utilities ─────────────────────────────────────────────────── */
    function extractNumber(str) {
        var m = (str || '').match(/[\d,]+\.?\d*/);
        return m ? parseFloat(m[0].replace(/,/g,'')) : null;
    }

    function formatNumber(n, original) {
        /* Preserve suffix/prefix from original string */
        var hasDecimal = original.indexOf('.') !== -1;
        var prefix = original.replace(/[\d,. ]+.*/, '');
        var suffix = original.replace(/.*[\d.]+/, '');
        if (hasDecimal) {
            var decimals = (original.split('.')[1] || '').replace(/\D+/,'').length;
            return prefix + n.toFixed(decimals) + suffix;
        }
        return prefix + Math.round(n).toLocaleString() + suffix;
    }

    function animateCount(el, originalText, duration) {
        duration = duration || 1200;
        var targetNum = extractNumber(originalText);
        if (targetNum === null) return;
        var start = null;
        function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
            el.textContent = formatNumber(eased * targetNum, originalText);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = originalText;
        }
        requestAnimationFrame(step);
    }

    /* ── Init entrance + count-up ──────────────────────────────────── */
    function initCaseStudy(wrapper) {
        /* Staggered entrance for main sections */
        var animEls = wrapper.querySelectorAll('.bkbg-cs-client-bar, .bkbg-cs-card, .bkbg-cs-metric, .bkbg-cs-quote, .bkbg-cs-cta-row');
        animEls.forEach(function (el, i) {
            el.style.opacity    = '0';
            el.style.transform  = 'translateY(20px)';
            el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
            el.style.transitionDelay = (i * 80) + 'ms';
        });

        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                obs.unobserve(entry.target);

                var el = entry.target;
                el.style.opacity   = '1';
                el.style.transform = 'none';

                /* Count-up for metric values */
                if (el.classList.contains('bkbg-cs-metric')) {
                    var valueEl = el.querySelector('.bkbg-cs-metric-value');
                    if (valueEl) {
                        var original = valueEl.textContent;
                        animateCount(valueEl, original, 1400);
                    }
                }
            });
        }, { threshold: 0.25 });

        animEls.forEach(function (el) { io.observe(el); });
    }

    function init() {
        var wrappers = document.querySelectorAll('.bkbg-cs-wrapper');
        wrappers.forEach(initCaseStudy);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
