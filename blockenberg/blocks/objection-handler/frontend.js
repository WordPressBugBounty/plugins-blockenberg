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

    function makeEl(tag, className, styles) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (styles) Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
        return el;
    }

    function makeText(tag, className, text, styles) {
        var el = makeEl(tag, className, styles);
        el.textContent = text;
        return el;
    }

    function init() {
        document.querySelectorAll('.bkbg-oh-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                headline: 'Still have questions?',
                subheadline: '',
                showHeadline: true,
                objections: [],
                layout: 'stack',
                style: 'split',
                showIcon: true,
                objectionLabel: 'Concern',
                responseLabel: 'Our Answer',
                borderRadius: 12,
                gap: 16,
                bgColor: '#ffffff',
                headlineColor: '#0f172a',
                subColor: '#64748b',
                objectionBg: '#fff7ed',
                objectionColor: '#9a3412',
                objectionBorderColor: '#fed7aa',
                responseBg: '#f0fdf4',
                responseColor: '#166534',
                responseBorderColor: '#bbf7d0',
                labelColor: '#64748b',
                iconBg: '#f1f5f9'
            }, opts);

            var block = makeEl('div', 'bkbg-oh-block', { background: o.bgColor });
            typoCssVarsForEl(block, o.headlineTypo, '--bkbg-oh-hl-');
            typoCssVarsForEl(block, o.bodyTypo, '--bkbg-oh-bd-');

            // Headline
            if (o.showHeadline) {
                if (o.headline) block.appendChild(makeText('h2', 'bkbg-oh-headline', o.headline, { color: o.headlineColor }));
                if (o.subheadline) block.appendChild(makeText('p', 'bkbg-oh-sub', o.subheadline, { color: o.subColor }));
            }

            // List
            var listClass = 'bkbg-oh-list bkbg-oh-layout-' + o.layout + ' bkbg-oh-style-' + o.style;
            var list = makeEl('div', listClass, { gap: o.gap + 'px' });

            o.objections.forEach(function (obj) {
                var pair = makeEl('div', 'bkbg-oh-pair', { borderRadius: o.borderRadius + 'px' });

                var isCard = o.style === 'card';
                var objRadius = isCard ? o.borderRadius + 'px' : o.borderRadius + 'px 0 0 ' + o.borderRadius + 'px';
                var resRadius = isCard ? o.borderRadius + 'px' : '0 ' + o.borderRadius + 'px ' + o.borderRadius + 'px 0';

                // Objection side
                var objSide = makeEl('div', 'bkbg-oh-objection', {
                    background: o.objectionBg,
                    color: o.objectionColor,
                    borderColor: o.objectionBorderColor,
                    borderRadius: objRadius
                });

                var objHeader = makeEl('div', 'bkbg-oh-side-header');
                if (o.showIcon) {
                    var iconEl = makeEl('span', 'bkbg-oh-icon', { background: o.iconBg });
                    iconEl.textContent = obj.icon || '❓';
                    objHeader.appendChild(iconEl);
                }
                objHeader.appendChild(makeText('span', 'bkbg-oh-side-label', o.objectionLabel, { color: o.labelColor }));
                objSide.appendChild(objHeader);
                objSide.appendChild(makeText('p', 'bkbg-oh-objection-text', '"' + obj.objection + '"'));

                // Arrow (split style)
                if (o.style === 'split') {
                    var arrow = makeEl('div', 'bkbg-oh-arrow', { color: o.responseBg });
                    arrow.textContent = '▶';
                    pair.appendChild(objSide);
                    pair.appendChild(arrow);
                } else {
                    pair.appendChild(objSide);
                }

                // Response side
                var resSide = makeEl('div', 'bkbg-oh-response', {
                    background: o.responseBg,
                    color: o.responseColor,
                    borderColor: o.responseBorderColor,
                    borderRadius: resRadius
                });

                var resHeader = makeEl('div', 'bkbg-oh-side-header');
                var check = makeEl('span', 'bkbg-oh-check', { background: o.responseColor });
                check.textContent = '✓';
                resHeader.appendChild(check);
                resHeader.appendChild(makeText('span', 'bkbg-oh-side-label', o.responseLabel, { color: o.labelColor }));
                resSide.appendChild(resHeader);
                resSide.appendChild(makeText('p', 'bkbg-oh-response-text', obj.response));

                pair.appendChild(resSide);
                list.appendChild(pair);
            });

            block.appendChild(list);

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
