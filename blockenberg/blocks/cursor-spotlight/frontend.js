(function () {
    'use strict';

    function hexToRgbStr(hex) {
        hex = (hex || '#000').replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
        var n = parseInt(hex, 16) || 0;
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
    }

    /* ── Typography CSS-var helper ─────────────────────────────────────── */
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            transform:'text-transform', decoration:'text-decoration',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', sizeUnit:'font-size-unit',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', lineHeightUnit:'line-height-unit',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', letterSpacingUnit:'letter-spacing-unit',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m', wordSpacingUnit:'word-spacing-unit'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                var css = map[k];
                if (css.indexOf('size-d') !== -1 || css.indexOf('size-t') !== -1 || css.indexOf('size-m') !== -1 ||
                    css.indexOf('height-d') !== -1 || css.indexOf('height-t') !== -1 || css.indexOf('height-m') !== -1 ||
                    css.indexOf('spacing-d') !== -1 || css.indexOf('spacing-t') !== -1 || css.indexOf('spacing-m') !== -1) {
                    var unitKey = css.replace(/-[dtm]$/, '-unit');
                    var unit = '';
                    Object.keys(map).forEach(function(k2) { if (map[k2] === unitKey && typo[k2]) unit = typo[k2]; });
                    if (!unit) unit = css.indexOf('size') !== -1 ? 'px' : '';
                    v = v + unit;
                }
                el.style.setProperty(prefix + css, v);
            }
        });
    }

    function initCursorSpotlight(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        var spotR   = opts.spotlightSize  || 280;
        var blur    = opts.spotlightBlur  || 40;
        var dimRgb  = hexToRgbStr(opts.dimColor  || '#000000');
        var dimA    = opts.dimOpacity      || 0.92;
        var bgColor = opts.bgColor         || '#0c0a1e';
        var smooth  = opts.followSmooth !== false;
        var idleMode = opts.idleMode || 'center';

        // ── Build section ─────────────────────────────────────────────
        var section = document.createElement('div');
        section.className = 'bkbg-cs-section';
        section.style.height = (opts.sectionHeight || 500) + 'px';
        section.style.borderRadius = (opts.borderRadius || 16) + 'px';
        section.style.backgroundColor = bgColor;
        section.style.overflow = 'hidden';
        section.style.position = 'relative';

        // BG image
        if (opts.bgImage) {
            var bgImg = document.createElement('img');
            bgImg.src = opts.bgImage;
            bgImg.className = 'bkbg-cs-bg';
            bgImg.alt = '';
            bgImg.style.opacity = opts.bgImageOpacity || 0.5;
            section.appendChild(bgImg);
        }

        // Dim overlay
        var dim = document.createElement('div');
        dim.className = 'bkbg-cs-dim';
        section.appendChild(dim);

        // Content
        var content = document.createElement('div');
        content.className = 'bkbg-cs-content';
        content.style.textAlign = opts.textAlign || 'center';
        content.style.color = opts.textColor || '#ffffff';

        var heading = document.createElement(opts.tag || 'h2');
        heading.className = 'bkbg-cs-heading';
        heading.style.color = opts.textColor || '#ffffff';
        heading.textContent = opts.heading || 'Move your cursor to reveal';
        content.appendChild(heading);

        if (opts.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-cs-subtext';
            sub.textContent = opts.subtext;
            sub.style.color = opts.textColor || '#ffffff';
            content.appendChild(sub);
        }

        section.appendChild(content);

        if (opts.showHint) {
            var hint = document.createElement('div');
            hint.className = 'bkbg-cs-hint';
            hint.style.color = opts.accentColor || '#a78bfa';
            hint.textContent = opts.hintText || 'Move cursor to reveal';
            section.appendChild(hint);
        }

        // Custom cursor dot
        var dot = document.createElement('div');
        dot.className = 'bkbg-cs-cursor-dot';
        dot.style.display = 'none';
        section.appendChild(dot);

        appEl.parentNode.replaceChild(section, appEl);

        /* Apply typography CSS vars on section */
        section.style.setProperty('--bkbg-cs-hdg-fs', (opts.fontSize || 48) + 'px');
        section.style.setProperty('--bkbg-cs-hdg-fw', opts.fontWeight || '800');
        section.style.setProperty('--bkbg-cs-sub-fs', (opts.subtextSize || 18) + 'px');
        typoCssVarsForEl(opts.typoHeading, '--bkbg-cs-hdg-', section);
        typoCssVarsForEl(opts.typoSubtext, '--bkbg-cs-sub-', section);

        // ── Spotlight position ────────────────────────────────────────
        var mx = -9999, my = -9999;
        var cx = -9999, cy = -9999;

        function buildMask(x, y) {
            if (idleMode === 'full' && x < 0) {
                return 'none';
            }
            if (idleMode === 'dark' && x < 0) {
                return 'radial-gradient(circle 0px at 50% 50%, transparent 0%, rgba(' + dimRgb + ',' + dimA + ') 1px)';
            }
            var px = x < 0 ? '50%' : x + 'px';
            var py = y < 0 ? '50%' : y + 'px';
            return 'radial-gradient(circle ' + spotR + 'px at ' + px + ' ' + py + ', transparent 0%, rgba(' + dimRgb + ',' + dimA + ') ' + (spotR + blur) + 'px)';
        }

        function applyDim(x, y) {
            dim.style.background = buildMask(x, y);
            dot.style.left = x + 'px';
            dot.style.top  = y + 'px';
        }

        // Initial idle state
        applyDim(-1, -1);

        var raf;
        if (smooth) {
            function lerp(a, b, t) { return a + (b - a) * t; }
            function loop() {
                cx = lerp(cx < -1000 ? mx : cx, mx, 0.15);
                cy = lerp(cy < -1000 ? my : cy, my, 0.15);
                applyDim(cx, cy);
                raf = requestAnimationFrame(loop);
            }
            raf = requestAnimationFrame(loop);
        }

        section.addEventListener('mouseenter', function () {
            section.classList.add('bkbg-cs-active');
            dot.style.display = 'block';
        });

        section.addEventListener('mouseleave', function () {
            section.classList.remove('bkbg-cs-active');
            dot.style.display = 'none';
            mx = -1; my = -1;
            if (!smooth) applyDim(-1, -1);
        });

        section.addEventListener('mousemove', function (e) {
            var rect = section.getBoundingClientRect();
            mx = e.clientX - rect.left;
            my = e.clientY - rect.top;
            if (!smooth) applyDim(mx, my);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-cs-app').forEach(initCursorSpotlight);
    });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-cs-app').forEach(initCursorSpotlight);
    }
})();
