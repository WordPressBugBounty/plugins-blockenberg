(function () {
    'use strict';

    function initWordFlip(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        var words    = (opts.words && opts.words.length) ? opts.words : ['designers'];
        var mode     = opts.flipMode   || 'roll';
        var interval = opts.interval   || 2200;
        var speed    = opts.flipSpeed  || 420;

        // ── Build outer ───────────────────────────────────────────────
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-wf-wrap';
        wrap.style.padding = (opts.paddingV || 32) + 'px ' + (opts.paddingH || 24) + 'px';
        wrap.style.backgroundColor = opts.showBg ? (opts.bgColor || '#fff') : '';
        wrap.style.borderRadius = (opts.borderRadius || 0) + 'px';
        wrap.style.textAlign = opts.textAlign || 'center';

        var heading = document.createElement(opts.tag || 'h2');
        heading.className = 'bkbg-wf-heading';
        heading.style.color = opts.staticColor || '#0f172a';

        if (opts.staticBefore) {
            var before = document.createElement('span');
            before.textContent = opts.staticBefore;
            heading.appendChild(before);
        }

        // Slot
        var modeClass = { 'flip-3d': 'bkbg-wf-flip3d', 'fade-up': 'bkbg-wf-fadeup', 'zoom': 'bkbg-wf-zoom', 'roll': 'bkbg-wf-roll' };
        var slot = document.createElement('span');
        slot.className = 'bkbg-wf-slot ' + (modeClass[mode] || 'bkbg-wf-roll');
        slot.style.setProperty('--bkbg-wf-speed', speed + 'ms');
        slot.style.setProperty('--bkbg-wf-underline', opts.underlineColor || '#7c3aed');
        slot.style.color = opts.flipColor || '#7c3aed';
        slot.style.padding = '0 ' + (opts.flipPaddingH || 8) + 'px';
        slot.style.borderRadius = (opts.flipBorderRadius || 4) + 'px';
        slot.style.backgroundColor = opts.flipBg || 'transparent';

        // Underline decoration
        var ul = opts.underlineStyle || 'none';
        if (ul === 'solid')  { slot.style.textDecoration = 'underline solid'; slot.style.textDecorationColor = opts.underlineColor || '#7c3aed'; slot.style.textUnderlineOffset = '4px'; }
        if (ul === 'wavy')   { slot.classList.add('bkbg-wf-underline-wavy'); slot.style.textDecorationColor = opts.underlineColor || '#7c3aed'; }
        if (ul === 'dashed') { slot.style.textDecoration = 'underline dashed'; slot.style.textDecorationColor = opts.underlineColor || '#7c3aed'; slot.style.textUnderlineOffset = '4px'; }
        if (ul === 'highlight') { slot.classList.add('bkbg-wf-underline-highlight'); slot.style.position = 'relative'; slot.style.zIndex = '0'; }

        var inner = document.createElement('span');
        inner.className = 'bkbg-wf-inner bkbg-wf-active';
        inner.style.transition = 'transform ' + speed + 'ms cubic-bezier(0.23,1,0.32,1), opacity ' + speed + 'ms ease';
        inner.textContent = words[0];
        slot.appendChild(inner);

        heading.appendChild(slot);

        if (opts.staticAfter) {
            var after = document.createElement('span');
            after.textContent = ' ' + opts.staticAfter;
            heading.appendChild(after);
        }

        wrap.appendChild(heading);
        appEl.parentNode.replaceChild(wrap, appEl);

        // ── Flip logic ────────────────────────────────────────────────
        // Pre-compute dimensions to avoid resize flicker
        var idx = 0;

        function flipTo(nextWord) {
            var next = document.createElement('span');
            next.className = 'bkbg-wf-inner bkbg-wf-enter';
            next.style.transition = inner.style.transition;
            next.style.position = 'absolute'; next.style.top = '0'; next.style.left = '0'; next.style.width = '100%';
            next.textContent = nextWord;
            slot.appendChild(next);

            // Current dimensions
            slot.style.width = inner.offsetWidth + 'px';
            slot.style.height = inner.offsetHeight + 'px';
            slot.style.position = 'relative';
            slot.style.overflow = 'hidden';

            void next.offsetWidth; // reflow
            // Animate current out
            inner.classList.remove('bkbg-wf-active');
            inner.classList.add('bkbg-wf-exit');
            next.classList.remove('bkbg-wf-enter');
            next.classList.add('bkbg-wf-active');
            next.style.position = '';

            var oldInner = inner;
            inner = next;

            setTimeout(function () {
                oldInner.remove();
                // Update slot width
                slot.style.width = '';
                slot.style.height = '';
            }, speed + 20);
        }

        setInterval(function () {
            idx = (idx + 1) % words.length;
            flipTo(words[idx]);
        }, interval);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-wf-app').forEach(initWordFlip);
    });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-wf-app').forEach(initWordFlip);
    }
})();
