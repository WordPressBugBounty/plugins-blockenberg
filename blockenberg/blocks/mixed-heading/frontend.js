(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-mhd-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                segments: [],
                tag: 'h2',
                textAlign: 'center',
                fontSize: 48,
                lineHeight: 1.15,
                letterSpacing: 0,
                maxWidth: 800,
                paddingTop: 0,
                paddingBottom: 0,
                strokeWidth: 2,
                badgeRadius: 6,
                badgePaddingX: 8,
                badgePaddingY: 3,
                gradientDir: 'to right',
            }, opts);

            if (!o.segments || !o.segments.length) return;

            /* Set CSS vars on wrapper (blockProps parent) */
            var wrap = appEl.parentNode;
            typoCssVarsForEl(wrap, o.headingTypo, '--bkbg-mhd-hd-');

            var effSize = (o.headingTypo && o.headingTypo.sizeDesktop) || o.fontSize;

            var outer = document.createElement('div');
            outer.className = 'bkbg-mhd-outer';

            var heading = document.createElement(o.tag);
            heading.className = 'bkbg-mhd-heading';
            heading.style.textAlign = o.textAlign;
            heading.style.maxWidth = o.maxWidth + 'px';
            heading.style.margin = '0 auto';
            heading.style.paddingTop = o.paddingTop + 'px';
            heading.style.paddingBottom = o.paddingBottom + 'px';
            heading.style.fontWeight = 'normal';

            o.segments.forEach(function (s) {
                var span = document.createElement('span');
                span.className = 'bkbg-mhd-seg style-' + (s.style || 'normal');
                span.textContent = s.text || '';

                // Font attrs
                span.style.fontWeight = s.weight || '700';
                if (s.italic) span.style.fontStyle = 'italic';
                if (s.underline) span.style.textDecoration = 'underline';
                if (s.spacing) span.style.letterSpacing = s.spacing + 'em';
                if (s.scale && s.scale !== 1) span.style.fontSize = (effSize * s.scale) + 'px';

                if (s.style === 'gradient') {
                    span.style.backgroundImage = 'linear-gradient(' + o.gradientDir + ', ' + s.color + ', ' + (s.color2 || '#ec4899') + ')';
                    span.style.webkitBackgroundClip = 'text';
                    span.style.backgroundClip = 'text';
                    span.style.webkitTextFillColor = 'transparent';
                    span.style.color = 'transparent';

                } else if (s.style === 'highlight') {
                    span.style.color = s.color || '#111827';
                    span.style.background = (s.bg && s.bg !== 'transparent') ? s.bg : '#ede9fe';
                    span.style.borderRadius = '4px';
                    span.style.padding = '0 4px';

                } else if (s.style === 'stroke') {
                    span.style.color = 'transparent';
                    span.style.webkitTextStroke = (o.strokeWidth || 2) + 'px ' + (s.color || '#6366f1');
                    span.style.textStroke = (o.strokeWidth || 2) + 'px ' + (s.color || '#6366f1');
                    span.style.webkitTextFillColor = 'transparent';

                } else if (s.style === 'badge') {
                    span.style.color = s.color || '#6366f1';
                    span.style.background = (s.bg && s.bg !== 'transparent') ? s.bg : '#f1f5f9';
                    span.style.borderRadius = (o.badgeRadius || 6) + 'px';
                    span.style.padding = (o.badgePaddingY || 3) + 'px ' + (o.badgePaddingX || 8) + 'px';
                    span.style.display = 'inline-block';
                    span.style.verticalAlign = 'middle';

                } else if (s.style === 'mono') {
                    span.style.color = s.color || '#374151';
                    span.style.fontFamily = "'Courier New', Courier, monospace";
                    span.style.background = (s.bg && s.bg !== 'transparent') ? s.bg : '#f8f8f8';
                    span.style.borderRadius = '4px';
                    span.style.padding = '2px 6px';
                    span.style.fontSize = '0.88em';

                } else if (s.style === 'ghost') {
                    span.style.color = s.color || '#111827';
                    span.style.opacity = '0.35';

                } else {
                    // normal
                    span.style.color = s.color || '#111827';
                }

                heading.appendChild(span);
            });

            outer.appendChild(heading);
            appEl.parentNode.insertBefore(outer, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
