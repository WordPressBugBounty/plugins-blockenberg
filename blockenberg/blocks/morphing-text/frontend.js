(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }

    function initMorphingText(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        var words       = (opts.words && opts.words.length) ? opts.words : ['animate'];
        var mode        = opts.morphMode     || 'blur';
        var totalDur    = opts.duration      || 2500;
        var pause       = opts.pauseDuration || 1500;
        var loop        = opts.loop !== false;
        var useGrad     = opts.useGradient !== false;

        // ── Build outer ───────────────────────────────────────────────
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-mt-wrap';
        wrap.style.padding = (opts.paddingV || 32) + 'px ' + (opts.paddingH || 24) + 'px';
        wrap.style.backgroundColor = opts.showBg ? (opts.bgColor || '#fff') : '';
        wrap.style.borderRadius = (opts.borderRadius || 0) + 'px';
        wrap.style.textAlign = opts.textAlign || 'center';

        var heading = document.createElement(opts.tag || 'h2');
        heading.className = 'bkbg-mt-heading';
        heading.style.margin = '0';
        heading.style.color = opts.staticColor || '#1e293b';

        // Static before
        if (opts.staticBefore) {
            var before = document.createElement('span');
            before.textContent = opts.staticBefore;
            heading.appendChild(before);
        }

        // Morphing word
        var morphSpan = document.createElement('span');
        morphSpan.className = 'bkbg-mt-morph-word';
        morphSpan.style.marginLeft = '0.3em';
        if (useGrad) {
            morphSpan.classList.add('bkbg-mt-gradient');
            morphSpan.style.background = 'linear-gradient(90deg,' + (opts.morphColor || '#7c3aed') + ',' + (opts.morphColor2 || '#ec4899') + ')';
        } else {
            morphSpan.style.color = opts.morphColor || '#7c3aed';
        }
        morphSpan.textContent = words[0];
        heading.appendChild(morphSpan);

        // Static after
        if (opts.staticAfter) {
            var after = document.createElement('span');
            after.textContent = ' ' + opts.staticAfter;
            heading.appendChild(after);
        }

        // Cursor
        if (opts.cursor) {
            var effSize = (opts.headingTypo && opts.headingTypo.sizeDesktop) || opts.fontSize || 56;
            var cursor = document.createElement('span');
            cursor.className = 'bkbg-mt-cursor';
            cursor.style.height = effSize * 0.8 + 'px';
            cursor.style.marginLeft = '4px';
            heading.appendChild(cursor);
        }

        wrap.appendChild(heading);
        appEl.parentNode.replaceChild(wrap, appEl);

        // Set typography CSS vars on the blockProps wrapper
        typoCssVarsForEl(wrap.parentNode, opts.headingTypo, '--bkbg-mrt-hd-');

        // ── Animation ─────────────────────────────────────────────────
        var idx = 0;

        function outClass() {
            if (mode === 'crossfade') return 'bkbg-mt-out-fade';
            if (mode === 'slide-up')  return 'bkbg-mt-out-slideup';
            if (mode === 'slide-down')return 'bkbg-mt-out-slidedown';
            return 'bkbg-mt-out-blur';
        }
        function inClass() {
            if (mode === 'crossfade') return 'bkbg-mt-in-fade';
            if (mode === 'slide-up')  return 'bkbg-mt-in-slideup';
            if (mode === 'slide-down')return 'bkbg-mt-in-slidedown';
            return 'bkbg-mt-in-blur';
        }

        function typeWriter(text, done) {
            morphSpan.textContent = '';
            var i = 0;
            var interval = setInterval(function () {
                morphSpan.textContent += text[i];
                i++;
                if (i >= text.length) { clearInterval(interval); setTimeout(done, pause); }
            }, totalDur / (text.length + 1));
        }

        function next() {
            idx = (idx + 1) % words.length;
            if (!loop && idx === 0) return;

            if (mode === 'typewriter') {
                // erase then type
                var current = morphSpan.textContent;
                var j = current.length;
                var erase = setInterval(function () {
                    morphSpan.textContent = current.slice(0, j--);
                    if (j < 0) { clearInterval(erase); typeWriter(words[idx], next); }
                }, Math.max(30, totalDur / (current.length + 1) * 0.5));
                return;
            }

            // transition out
            var oc = outClass();
            morphSpan.classList.remove(inClass());
            morphSpan.classList.add(oc);

            var transitionDur = 380;
            setTimeout(function () {
                morphSpan.textContent = words[idx];
                morphSpan.classList.remove(oc);
                // Force reflow
                void morphSpan.offsetWidth;
                morphSpan.classList.add(inClass());
                setTimeout(next, pause + totalDur);
            }, transitionDur);
        }

        if (mode === 'typewriter') {
            morphSpan.classList.add(inClass());
            setTimeout(next, pause);
        } else {
            morphSpan.classList.add(inClass());
            setTimeout(next, pause + totalDur);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-mt-app').forEach(initMorphingText);
    });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-mt-app').forEach(initMorphingText);
    }
})();
