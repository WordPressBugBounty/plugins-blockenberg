function typoCssVarsForEl(typo, prefix, el) {
    if (!typo || typeof typo !== 'object') return;
    var map = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        transform: 'text-transform', decoration: 'text-decoration',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        sizeUnit: null,
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        lineHeightUnit: null,
        letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
        letterSpacingUnit: null,
        wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m',
        wordSpacingUnit: null
    };
    var sizeU = typo.sizeUnit || 'px';
    var lhU   = typo.lineHeightUnit || '';
    var lsU   = typo.letterSpacingUnit || 'px';
    var wsU   = typo.wordSpacingUnit || 'px';
    Object.keys(map).forEach(function (k) {
        var css = map[k]; if (!css) return;
        var v = typo[k]; if (v === undefined || v === '' || v === null) return;
        if (/size|spacing/i.test(k)) {
            var u = /letterSpacing/.test(k) ? lsU : /wordSpacing/.test(k) ? wsU : /lineHeight/.test(k) ? lhU : sizeU;
            v = v + u;
        }
        el.style.setProperty(prefix + css, v);
    });
}

wp.domReady(function () {
    document.querySelectorAll('.bkbg-cu-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var target    = parseFloat(opts.value)    || 0;
        var prefix    = opts.prefix               || '';
        var suffix    = opts.suffix               || '';
        var duration  = parseInt(opts.duration)   || 2000;
        var separator = opts.separator !== undefined ? opts.separator : ',';
        var decimals  = parseInt(opts.decimals)   || 0;

        // Build DOM
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cu-wrap';
        if (opts.bgColor) wrap.style.background = opts.bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 48) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 48) + 'px';

        typoCssVarsForEl(opts.typoValue, '--bkbg-cu-val-', wrap);
        typoCssVarsForEl(opts.typoLabel, '--bkbg-cu-lbl-', wrap);

        var inner = document.createElement('div');
        inner.className = 'bkbg-cu-inner';
        inner.style.maxWidth  = (opts.maxWidth || 360) + 'px';
        inner.style.textAlign = opts.textAlign || 'center';

        var iconEl, valueEl, labelEl;

        if (opts.showIcon && opts.icon) {
            iconEl = document.createElement('div');
            iconEl.className = 'bkbg-cu-icon';
            iconEl.style.fontSize = (opts.iconSize || 40) + 'px';
            iconEl.style.color    = opts.iconColor || '#7c3aed';
            iconEl.textContent    = opts.icon;
            inner.appendChild(iconEl);
        }

        valueEl = document.createElement('div');
        valueEl.className = 'bkbg-cu-value';
        valueEl.style.color    = opts.valueColor || '#7c3aed';
        valueEl.textContent    = prefix + formatNumber(0, decimals, separator) + suffix;
        inner.appendChild(valueEl);

        if (opts.showLabel && opts.label) {
            labelEl = document.createElement('div');
            labelEl.className = 'bkbg-cu-label';
            labelEl.style.color    = opts.labelColor || '#374151';
            labelEl.textContent    = opts.label;
            inner.appendChild(labelEl);
        }

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);

        // Animate on scroll into view
        var started = false;

        function formatNumber(num, dec, sep) {
            var fixed = num.toFixed(dec);
            if (!sep) return fixed;
            var parts = fixed.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
            return parts.join('.');
        }

        function animate(startTime) {
            var elapsed  = performance.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // easeOutCubic
            var ease     = 1 - Math.pow(1 - progress, 3);
            var current  = ease * target;
            valueEl.textContent = prefix + formatNumber(current, decimals, separator) + suffix;
            if (progress < 1) {
                requestAnimationFrame(function () { animate(startTime); });
            }
        }

        function formatNumber(num, dec, sep) {
            var fixed = num.toFixed(dec);
            if (!sep) return fixed;
            var parts = fixed.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
            return parts.join('.');
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !started) {
                    started = true;
                    requestAnimationFrame(function (ts) { animate(ts); });
                    io.disconnect();
                }
            });
        }, { threshold: 0.3 });

        io.observe(wrap);
    });
});
