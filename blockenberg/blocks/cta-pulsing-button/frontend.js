(function () {
    'use strict';

    function init() {
        var blocks = document.querySelectorAll('.bkbg-pb-outer');

        blocks.forEach(function (block) {
            var btn = block.querySelector('.bkbg-pb-btn');
            if (!btn) return;

            // ── Hover color swap ───────────────────────────────────────────────
            var hoverBg   = btn.dataset.pbBgHover;
            var hoverText = btn.dataset.pbTextHover;

            if (hoverBg || hoverText) {
                var cachedBg    = btn.style.background   || btn.style.backgroundColor;
                var cachedColor = btn.style.color;
                var cachedFilter = btn.style.filter;

                btn.addEventListener('mouseenter', function () {
                    if (hoverBg)   { btn.style.background = hoverBg;   }
                    if (hoverText) { btn.style.color       = hoverText; }
                    btn.style.filter = ''; // disable CSS brightness override during colour swap
                });

                btn.addEventListener('mouseleave', function () {
                    btn.style.background = cachedBg;
                    btn.style.color      = cachedColor;
                    btn.style.filter     = cachedFilter;
                });
            }

            // ── Reduced-motion: pause pulse animations ─────────────────────────
            var pulseWrap = block.querySelector('.bkbg-pb-pulse-wrap');
            if (pulseWrap) {
                var mq = window.matchMedia('(prefers-reduced-motion: reduce)');

                function applyMotionPref() {
                    var paused = mq.matches ? 'paused' : 'running';
                    pulseWrap.style.setProperty('animation-play-state', paused);
                    var before  = window.getComputedStyle(pulseWrap, '::before');
                    // set it on the wrapper's pseudo-element via a class toggle
                    if (mq.matches) {
                        pulseWrap.classList.add('bkbg-pb-reduced-motion');
                    } else {
                        pulseWrap.classList.remove('bkbg-pb-reduced-motion');
                    }
                }

                applyMotionPref();
                try { mq.addEventListener('change', applyMotionPref); }
                catch (e) { mq.addListener(applyMotionPref); } // Safari 13 compat
            }
        });
    }

    // ── Boot ───────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
