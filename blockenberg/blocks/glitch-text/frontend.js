/* Glitch Text — frontend */
(function () {
    'use strict';

    /* ── utilities ──────────────────────────────────────────────────────────── */
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
        return Math.floor(rand(min, max));
    }

    /* ── chromatic effect: inject clone elements ─────────────────────────────── */
    function injectClones(outer, textEl) {
        if (outer._bkglClones) { return; }
        outer._bkglClones = true;

        var redClone  = textEl.cloneNode(true);
        var blueClone = textEl.cloneNode(true);

        redClone.className  = (redClone.className  || '') + ' bkgl-clone bkgl-clone-red';
        blueClone.className = (blueClone.className || '') + ' bkgl-clone bkgl-clone-blue';
        redClone.setAttribute('aria-hidden', 'true');
        blueClone.setAttribute('aria-hidden', 'true');
        redClone.style.position  = 'absolute';
        blueClone.style.position = 'absolute';
        redClone.style.top       = '0';
        blueClone.style.top      = '0';
        redClone.style.width     = '100%';
        blueClone.style.width    = '100%';

        outer.appendChild(redClone);
        outer.appendChild(blueClone);
    }

    /* ── noise/scramble effect ─────────────────────────────────────────────── */
    function scramble(outer, textEl, charset, intensity, ms) {
        if (outer._bkglScrambling) { return; }
        outer._bkglScrambling = true;

        var original = textEl.textContent || '';
        var chars    = charset.split('');
        var steps    = Math.max(4, Math.floor(ms / 60));
        var stepMs   = ms / steps;
        var frame = 0;

        function tick() {
            if (frame >= steps) {
                textEl.textContent = original;
                outer._bkglScrambling = false;
                return;
            }
            var progress = frame / steps;
            var result   = original.split('').map(function (ch, i) {
                if (ch === ' ') { return ch; }
                /* reveal characters left to right as animation progresses */
                if (i < Math.floor(original.length * progress)) { return ch; }
                return chars[randInt(0, chars.length)];
            }).join('');
            textEl.textContent = result;
            frame++;
            setTimeout(tick, stepMs);
        }

        tick();
    }

    /* ── play a glitch burst ────────────────────────────────────────────────── */
    function playBurst(outer, ms) {
        outer.classList.add('bkgl-playing');
        setTimeout(function () {
            outer.classList.remove('bkgl-playing');
        }, ms);
    }

    /* ── init one block ─────────────────────────────────────────────────────── */
    function initBlock(outer) {
        if (outer._bkglInit) { return; }
        outer._bkglInit = true;

        var textEl   = outer.querySelector('.bkgl-text');
        if (!textEl) { return; }

        var type       = outer.getAttribute('data-type')    || 'chromatic';
        var trigger    = outer.getAttribute('data-trigger') || 'always';
        var ms         = parseInt(outer.getAttribute('data-ms'), 10) || 800;
        var intensity  = parseInt(outer.getAttribute('data-intensity'), 10) || 6;
        var intervalMs = parseInt(outer.getAttribute('data-interval'), 10) || 4000;
        var burstMs    = parseInt(outer.getAttribute('data-burst'), 10) || 600;
        var charset    = outer.getAttribute('data-charset') || '!<>-_\\/[]{}—=+*^?#';
        var colorRed   = outer.getAttribute('data-color-red') || outer.style.getPropertyValue('--bkgl-red') || '#ff0040';
        var colorBlue  = outer.getAttribute('data-color-blue') || outer.style.getPropertyValue('--bkgl-blue') || '#00e5ff';

        /* make sure CSS vars are set on the outer element */
        outer.style.setProperty('--bkgl-red',   colorRed);
        outer.style.setProperty('--bkgl-blue',  colorBlue);
        outer.style.setProperty('--bkgl-ms',    ms + 'ms');
        outer.style.setProperty('--bkgl-shift', intensity + 'px');

        /* inject clones for chromatic & digital */
        if (type === 'chromatic' || type === 'digital') {
            injectClones(outer, textEl);
        }

        /* trigger logic */
        if (trigger === 'hover') {
            /* CSS handles play-state via :hover — nothing extra needed for chromatic */
            if (type === 'noise' || type === 'digital') {
                outer.addEventListener('mouseenter', function () {
                    scramble(outer, textEl, charset, intensity, ms);
                });
            }

        } else if (trigger === 'click') {
            outer.style.cursor = 'pointer';
            outer.addEventListener('click', function () {
                if (type === 'noise' || type === 'digital') {
                    scramble(outer, textEl, charset, intensity, ms);
                }
                playBurst(outer, burstMs);
            });

        } else if (trigger === 'interval') {
            setInterval(function () {
                if (type === 'noise' || type === 'digital') {
                    scramble(outer, textEl, charset, intensity, burstMs);
                }
                playBurst(outer, burstMs);
            }, intervalMs);

        }
        /* trigger === 'always' → CSS handles it automatically */
    }

    function init() {
        document.querySelectorAll('.bkgl-outer[data-type]').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
