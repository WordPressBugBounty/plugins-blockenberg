wp.domReady(function () {

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    document.querySelectorAll('.bkbg-dual-heading-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var tag    = opts.tag       || 'h2';
        var layout = opts.layout    || 'stacked';
        var align  = opts.textAlign || 'center';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-dh-wrap';
        if (opts.bgColor) wrap.style.background = opts.bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 16) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 16) + 'px';
        wrap.style.setProperty('--bkbg-dh-l1-fs', (opts.line1Size || 52) + 'px');
        wrap.style.setProperty('--bkbg-dh-l2-fs', (opts.line2Size || 52) + 'px');
        wrap.style.setProperty('--bkbg-dh-sub-fs', (opts.subtextSize || 18) + 'px');
        typoCssVarsForEl(opts.typoLine1, '--bkbg-dh-l1-', wrap);
        typoCssVarsForEl(opts.typoLine2, '--bkbg-dh-l2-', wrap);
        typoCssVarsForEl(opts.typoSubtext, '--bkbg-dh-sub-', wrap);

        var inner = document.createElement('div');
        inner.className = 'bkbg-dh-inner';
        inner.style.maxWidth  = (opts.maxWidth || 900) + 'px';
        inner.style.textAlign = align;

        var heading = document.createElement(tag);
        heading.className = 'bkbg-dh-heading';
        heading.style.margin = '0';

        var linesWrap = document.createElement('span');
        linesWrap.className = 'bkbg-dh-lines-wrap bkbg-dh--' + layout;
        if (layout === 'stacked') {
            linesWrap.style.gap = (opts.lineGap || 4) + 'px';
        } else {
            linesWrap.style.gap = '0 12px';
            linesWrap.style.justifyContent = align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start');
        }

        function buildLine(text, color, effect, effectColor, effectColor2, strokeColor, strokeWidth, lineNum) {
            var span = document.createElement('span');
            span.className = 'bkbg-dh-line bkbg-dh-line-' + lineNum;
            span.innerHTML = text || '';

            if (effect === 'gradient') {
                span.classList.add('bkbg-dh-line--gradient');
                span.style.setProperty('--bkbg-dh-grad', 'linear-gradient(90deg, ' + effectColor + ', ' + effectColor2 + ')');
            } else if (effect === 'highlight') {
                span.classList.add('bkbg-dh-line--highlight');
                span.style.setProperty('--bkbg-dh-hl', effectColor);
            } else if (effect === 'marker') {
                span.classList.add('bkbg-dh-line--marker');
                span.style.setProperty('--bkbg-dh-hl', effectColor);
            } else if (effect === 'stroke') {
                span.classList.add('bkbg-dh-line--stroke');
                span.style.setProperty('--bkbg-dh-stroke-w', (strokeWidth || 1) + 'px');
                span.style.setProperty('--bkbg-dh-stroke-c', strokeColor || '#7c3aed');
            } else {
                span.style.color = color;
            }
            return span;
        }

        var l1 = buildLine(
            opts.line1, opts.line1Color || '#111827',
            opts.line1Effect || 'none',
            opts.effectColor || '#fef08a', opts.effectColor2 || '#f97316',
            opts.strokeColor || '#7c3aed', opts.strokeWidth || 1, 1
        );

        var l2 = buildLine(
            opts.line2, opts.line2Color || '#7c3aed',
            opts.line2Effect || 'none',
            opts.effectColor || '#fef08a', opts.effectColor2 || '#f97316',
            opts.strokeColor || '#7c3aed', opts.strokeWidth || 1, 2
        );

        linesWrap.appendChild(l1);
        if (layout === 'inline') {
            var sp = document.createTextNode(' ');
            linesWrap.appendChild(sp);
        }
        linesWrap.appendChild(l2);
        heading.appendChild(linesWrap);
        inner.appendChild(heading);

        if (opts.showSubtext && opts.subtext) {
            var p = document.createElement('p');
            p.className = 'bkbg-dh-subtext';
            p.style.color    = opts.subtextColor || '#6b7280';
            p.innerHTML = opts.subtext;
            inner.appendChild(p);
        }

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
});
