/* Progress Circle — frontend */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── ease helpers ────────────────────────────────────────────────────────── */
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    function easeOut(t)   { return 1 - Math.pow(1 - t, 3); }
    function easeIn(t)    { return t * t * t; }
    function linear(t)    { return t; }

    function getEaseFn(name) {
        if (name === 'ease-out')  return easeOut;
        if (name === 'ease-in')   return easeIn;
        if (name === 'linear')    return linear;
        return easeInOut; /* ease-in-out default */
    }

    /* ── animate one ring ───────────────────────────────────────────────────── */
    function animateRing(ring, circumference, fromOffset, toOffset, duration, easeFn, onProgress) {
        if (reducedMotion) {
            ring.style.strokeDashoffset = toOffset;
            if (onProgress) { onProgress(1); }
            return;
        }
        var start = null;
        function step(ts) {
            if (!start) { start = ts; }
            var elapsed = Math.min(ts - start, duration);
            var t = easeFn(elapsed / duration);
            ring.style.strokeDashoffset = fromOffset + (toOffset - fromOffset) * t;
            if (onProgress) { onProgress(t); }
            if (elapsed < duration) { requestAnimationFrame(step); }
            else { ring.style.strokeDashoffset = toOffset; if (onProgress) { onProgress(1); } }
        }
        requestAnimationFrame(step);
    }

    /* ── animate counter text ───────────────────────────────────────────────── */
    function animateCounter(el, from, to, suffix, duration, easeFn) {
        if (reducedMotion) { el.textContent = to + suffix; return; }
        var start = null;
        function step(ts) {
            if (!start) { start = ts; }
            var elapsed = Math.min(ts - start, duration);
            var t = easeFn(elapsed / duration);
            el.textContent = Math.round(from + (to - from) * t) + suffix;
            if (elapsed < duration) { requestAnimationFrame(step); }
            else { el.textContent = to + suffix; }
        }
        requestAnimationFrame(step);
    }

    /* ── init one item ───────────────────────────────────────────────────────── */
    function initItem(item, grid) {
        if (item._bkpcInit) { return; }
        item._bkpcInit = true;

        var pct      = parseFloat(item.getAttribute('data-pct'))  || 0;
        var size     = parseFloat(item.getAttribute('data-size')) || 140;
        var sw       = parseFloat(item.getAttribute('data-sw'))   || 10;
        var color    = item.getAttribute('data-color')  || '#6c3fb5';
        var track    = item.getAttribute('data-track')  || '#e5e7eb';
        var linecap  = item.getAttribute('data-linecap') || 'round';
        var gradient = item.getAttribute('data-gradient') === '1';
        var gradEnd  = item.getAttribute('data-grad-end') || '#ec4899';
        var shadow   = item.getAttribute('data-shadow') === '1';

        var animate  = grid.getAttribute('data-animate')  !== '0';
        var duration = parseInt(grid.getAttribute('data-duration'), 10) || 1200;
        var easing   = grid.getAttribute('data-easing') || 'ease-in-out';
        var counter  = grid.getAttribute('data-counter') !== '0';
        var suffix   = grid.getAttribute('data-suffix') || '%';

        var easeFn = getEaseFn(easing);
        var r      = (size - sw) / 2;
        var circ   = 2 * Math.PI * r;
        var ring   = item.querySelector('.bkpc-ring');
        if (!ring) { return; }

        /* patch gradient defs if needed */
        if (gradient) {
            var svg = item.querySelector('svg');
            if (svg) {
                var uid = 'bkpc-g-fe-' + Math.random().toString(36).slice(2, 7);
                var defs = svg.querySelector('defs');
                if (defs) {
                    var lg = defs.querySelector('linearGradient');
                    if (lg) {
                        lg.id = uid;
                        ring.style.stroke = 'url(#' + uid + ')';
                        ring.setAttribute('stroke', 'url(#' + uid + ')');
                    }
                }
            }
        }

        var targetOffset = circ - circ * (pct / 100);

        if (animate) {
            /* start rings at full offset (empty) */
            ring.style.strokeDashoffset = circ;

            /* counter element */
            var pctEl = item.querySelector('.bkpc-pct, .bkpc-pct-inner');

            animateRing(ring, circ, circ, targetOffset, duration, easeFn, null);
            if (counter && pctEl) {
                animateCounter(pctEl, 0, pct, suffix, duration, easeFn);
            }
        } else {
            ring.style.strokeDashoffset = targetOffset;
        }
    }

    /* ── init one grid ───────────────────────────────────────────────────────── */
    function initGrid(grid) {
        if (grid._bkpcInit) { return; }
        grid._bkpcInit = true;

        var animate = grid.getAttribute('data-animate') !== '0';
        var items   = Array.prototype.slice.call(grid.querySelectorAll('.bkpc-item[data-pct]'));

        if (!animate || reducedMotion) {
            items.forEach(function (item) { initItem(item, grid); });
            return;
        }

        /* observe the grid */
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        items.forEach(function (item) { initItem(item, grid); });
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            obs.observe(grid);
        } else {
            items.forEach(function (item) { initItem(item, grid); });
        }
    }

    /* ── boot ────────────────────────────────────────────────────────────────── */
    function init() {
        document.querySelectorAll('.bkpc-grid[data-animate]').forEach(initGrid);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
