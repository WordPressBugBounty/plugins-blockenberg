(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // angle = 0 → left (min), angle = 180 → right (max)
    function polarToCartesian(cx, cy, r, angleDeg) {
        var rad = (angleDeg * Math.PI) / 180;
        return {
            x: cx - r * Math.cos(rad),
            y: cy - r * Math.sin(rad)
        };
    }

    // Ease-out cubic
    function easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function animateGauge(wrap) {
        var value     = parseFloat(wrap.dataset.value)     || 0;
        var minValue  = parseFloat(wrap.dataset.min)       || 0;
        var maxValue  = parseFloat(wrap.dataset.max)       || 100;
        var duration  = parseFloat(wrap.dataset.duration)  || 1200;
        var perimeter = parseFloat(wrap.dataset.perimeter) || 0;
        var unit      = wrap.dataset.unit                  || '';
        var showNeedle= wrap.dataset.showNeedle === '1';
        var r         = parseFloat(wrap.dataset.r)         || 0;
        var cx        = parseFloat(wrap.dataset.cx)        || 0;
        var cy        = parseFloat(wrap.dataset.cy)        || 0;

        var fraction = Math.min(1, Math.max(0, (value - minValue) / (maxValue - minValue)));
        var finalOffset = (1 - fraction) * perimeter;

        var fillArc   = wrap.querySelector('.bkgc-fill');
        var valueText = wrap.querySelector('.bkgc-value-text');
        var needle    = wrap.querySelector('.bkgc-needle');

        if (!fillArc && !valueText && !needle) return;

        // Needle tip radius (derived from geometry stored in data attributes)
        // r = cx - sw * 1.5 - 2  →  sw = (cx - r - 2) / 1.5
        var sw = (cx - r - 2) / 1.5;
        var needleTipR = r - sw - 4;

        if (reducedMotion()) {
            if (fillArc)   fillArc.style.strokeDashoffset = finalOffset;
            if (valueText) valueText.textContent = Math.round(value) + unit;
            if (needle && showNeedle) {
                var tip = polarToCartesian(cx, cy, needleTipR, fraction * 180);
                needle.setAttribute('x2', tip.x);
                needle.setAttribute('y2', tip.y);
            }
            return;
        }

        var startTime = null;

        function step(ts) {
            if (!startTime) startTime = ts;
            var elapsed = ts - startTime;
            var t       = Math.min(1, elapsed / duration);
            var eased   = easeOut(t);

            // Arc fill — stroke-dashoffset from perimeter (empty) to finalOffset
            if (fillArc) {
                fillArc.style.strokeDashoffset = perimeter - eased * (perimeter - finalOffset);
            }

            // Count-up value text
            if (valueText) {
                var displayed = minValue + eased * (value - minValue);
                valueText.textContent = Math.round(displayed) + unit;
            }

            // Needle sweep from angle=0 (left/min) to fraction*180
            if (needle && showNeedle) {
                var currentAngle = eased * fraction * 180;
                var nTip = polarToCartesian(cx, cy, needleTipR, currentAngle);
                needle.setAttribute('x2', nTip.x);
                needle.setAttribute('y2', nTip.y);
            }

            if (t < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function initGauge(wrap) {
        if (typeof IntersectionObserver === 'undefined') {
            animateGauge(wrap);
            return;
        }

        var triggered = false;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !triggered) {
                    triggered = true;
                    observer.unobserve(wrap);
                    animateGauge(wrap);
                }
            });
        }, { threshold: 0.25 });

        observer.observe(wrap);
    }

    function init() {
        document.querySelectorAll('.bkgc-wrap[data-value]').forEach(initGauge);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
