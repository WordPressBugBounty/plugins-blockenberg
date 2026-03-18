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

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var items       = opts.items           || [];
        var position    = opts.position        || 'right';
        var dotShape    = opts.dotShape        || 'circle';
        var dotSize     = opts.dotSize         || 12;
        var dotGap      = opts.dotGap          || 14;
        var edgeOffset  = opts.edgeOffset      || 24;
        var scrollOff   = opts.scrollOffset    || 0;
        var showTips    = opts.showTooltips     !== false;
        var animDots    = opts.animateDots      !== false;
        var progLine    = opts.progressLine     !== false;
        var dotColor    = opts.dotColor         || '#d1d5db';
        var activeColor = opts.activeDotColor   || '#6366f1';
        var hoverColor  = opts.hoverDotColor    || '#a5b4fc';
        var progColor   = opts.progressLineColor || '#6366f1';
        var tipBg       = opts.tooltipBg        || '#1e1b4b';
        var tipColor    = opts.tooltipColor     || '#ffffff';

        if (!items.length) return;

        // ---- Build nav ---- //
        var nav = document.createElement('nav');
        nav.className = 'bkbg-opn-nav bkbg-opn-' + position;
        if (dotShape === 'diamond') nav.classList.add('bkbg-opn-diamond');
        if (dotShape === 'square')  nav.classList.add('bkbg-opn-square');
        nav.setAttribute('aria-label', 'Page navigation');
        nav.style.cssText = [
            (position === 'right' ? 'right' : 'left') + ':' + edgeOffset + 'px',
            '--bkbg-opn-dot:' + dotColor,
            '--bkbg-opn-active:' + activeColor,
            '--bkbg-opn-hover:' + hoverColor
        ].join(';');

        typoCssVarsForEl(nav, opts.tooltipTypo, '--bkbg-opn-tp-');

        // Progress line track
        var track, trackFill;
        if (progLine) {
            track = document.createElement('div');
            track.className = 'bkbg-opn-track';
            trackFill = document.createElement('div');
            trackFill.className = 'bkbg-opn-track-fill';
            trackFill.style.background = progColor;
            track.appendChild(trackFill);
            nav.appendChild(track);
        }

        var dotEls = [];

        items.forEach(function (item, i) {
            var wrapper = document.createElement('div');
            wrapper.className = 'bkbg-opn-item';
            if (animDots) wrapper.classList.add('bkbg-opn-animate');
            wrapper.style.padding = Math.round(dotGap / 2) + 'px 0';
            wrapper.setAttribute('aria-label', item.label);
            wrapper.setAttribute('role', 'button');
            wrapper.setAttribute('tabindex', '0');

            // Dot
            var dot = document.createElement('div');
            dot.className = 'bkbg-opn-dot';
            dot.style.cssText = 'width:' + dotSize + 'px;height:' + dotSize + 'px;';
            wrapper.appendChild(dot);

            // Tooltip
            if (showTips) {
                var tip = document.createElement('div');
                tip.className = 'bkbg-opn-tooltip';
                tip.textContent = item.label;
                tip.style.cssText = 'background:' + tipBg + ';color:' + tipColor + ';';
                wrapper.appendChild(tip);
            }

            dotEls.push(wrapper);
            nav.appendChild(wrapper);

            // Click + keyboard
            function scrollToSection() {
                var el = document.getElementById(item.targetId);
                if (!el) return;
                var top = el.getBoundingClientRect().top + window.pageYOffset + scrollOff;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
            wrapper.addEventListener('click', scrollToSection);
            wrapper.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') scrollToSection();
            });
        });

        document.body.appendChild(nav);

        // ---- Active dot tracking ---- //
        var ticking = false;
        var activeIndex = 0;

        function findActiveIndex() {
            var winH   = window.innerHeight;
            var scrollY = window.pageYOffset;
            var best   = 0;

            items.forEach(function (item, i) {
                var el = document.getElementById(item.targetId);
                if (!el) return;
                var top = el.getBoundingClientRect().top + scrollY;
                // Activate when section top is in upper 60% of viewport
                if (scrollY + winH * 0.4 >= top) {
                    best = i;
                }
            });
            return best;
        }

        function updateNav() {
            var idx = findActiveIndex();
            if (idx === activeIndex && ticking === false) {
                // no change but still update progress if first time
            }
            activeIndex = idx;

            dotEls.forEach(function (el, i) {
                if (i === idx) { el.classList.add('bkbg-opn-active'); }
                else { el.classList.remove('bkbg-opn-active'); }
            });

            // Progress line: fill from first dot to active dot
            if (trackFill && dotEls.length > 1) {
                var pct = idx / (dotEls.length - 1) * 100;
                trackFill.style.height = pct + '%';
            }

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateNav();
    }

    document.querySelectorAll('.bkbg-opn-app').forEach(function (root) {
        initBlock(root);
    });
})();
