(function () {
    'use strict';

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

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function mkText(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }

    function renderRow(spec, sIdx, o, isCard) {
        var isHighlighted = o.showHighlight && spec.highlight;
        var isStripe = o.style === 'striped' && sIdx % 2 === 1;
        var rowBg = isHighlighted ? o.highlightBg : isStripe ? o.stripeBg : o.bgColor;
        var keyCol = isHighlighted ? o.highlightColor : o.keyColor;
        var valCol = isHighlighted ? o.highlightColor : o.valueColor;
        var borderB = '1px solid ' + o.borderColor;

        var tr = mk('tr', 'bkbg-ps-row');

        var keyTd = mk('td', 'bkbg-ps-key', {
            padding: '10px 16px',
            color: keyCol, background: rowBg, borderBottom: borderB
        });
        keyTd.textContent = spec.key;
        tr.appendChild(keyTd);

        var valTd = mk('td', 'bkbg-ps-value', {
            padding: '10px 16px',
            color: valCol, background: rowBg, borderBottom: borderB
        });
        valTd.textContent = spec.value;
        tr.appendChild(valTd);

        return tr;
    }

    function renderCardGroup(group, gIdx, o) {
        var card = mk('div', 'bkbg-ps-card', {
            borderColor: o.borderColor
        });

        if (o.showGroupTitles) {
            var gTitle = mkText('div', 'bkbg-ps-group-title', group.title, {
                background: o.groupTitleBg, padding: '8px 14px',
                color: o.groupTitleColor, borderBottom: '1px solid ' + o.borderColor
            });
            card.appendChild(gTitle);
        }

        (group.specs || []).forEach(function (spec, sIdx) {
            var isHighlighted = o.showHighlight && spec.highlight;
            var isStripe = o.style === 'striped' && sIdx % 2 === 1;
            var rowBg = isHighlighted ? o.highlightBg : isStripe ? o.stripeBg : o.bgColor;
            var keyCol = isHighlighted ? o.highlightColor : o.keyColor;
            var valCol = isHighlighted ? o.highlightColor : o.valueColor;

            var row = mk('div', '', {
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 14px',
                background: rowBg, borderBottom: '1px solid ' + o.borderColor
            });

            var keyEl = mkText('span', 'bkbg-ps-key', spec.key, { color: keyCol });
            var valEl = mkText('span', 'bkbg-ps-value', spec.value, {
                color: valCol,
                textAlign: 'right', maxWidth: '55%'
            });

            row.appendChild(keyEl);
            row.appendChild(valEl);
            card.appendChild(row);
        });

        return card;
    }

    function init() {
        document.querySelectorAll('.bkbg-product-spec-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                productName:    opts.productName    || 'Product Name',
                productTagline: opts.productTagline || '',
                showHeader:     opts.showHeader     !== false,
                showGroupTitles:opts.showGroupTitles !== false,
                groups:         opts.groups         || [],
                layout:         opts.layout         || 'table',
                style:          opts.style          || 'striped',
                showHighlight:  opts.showHighlight  !== false,
                borderRadius:   opts.borderRadius   !== undefined ? opts.borderRadius : 12,
                headerTypo:     opts.headerTypo     || {},
                groupTitleTypo: opts.groupTitleTypo || {},
                rowTypo:        opts.rowTypo        || {},
                bgColor:         opts.bgColor         || '#ffffff',
                borderColor:     opts.borderColor     || '#e2e8f0',
                headerBg:        opts.headerBg        || '#1e293b',
                headerColor:     opts.headerColor     || '#ffffff',
                groupTitleBg:    opts.groupTitleBg    || '#f1f5f9',
                groupTitleColor: opts.groupTitleColor || '#475569',
                keyColor:        opts.keyColor        || '#64748b',
                valueColor:      opts.valueColor      || '#0f172a',
                stripeBg:        opts.stripeBg        || '#f8fafc',
                highlightBg:     opts.highlightBg     || '#eff6ff',
                highlightColor:  opts.highlightColor  || '#1e40af',
                accentColor:     opts.accentColor     || '#3b82f6'
            };

            /* ── Outer wrapper ───────────────────────────────── */
            var block = mk('div', 'bkbg-ps-block', {
                border: '1px solid ' + o.borderColor,
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden',
                boxSizing: 'border-box'
            });

            /* ── Product header ──────────────────────────────── */
            if (o.showHeader) {
                var header = mk('div', 'bkbg-ps-header', {
                    background: o.headerBg,
                    color: o.headerColor,
                    padding: '20px 24px'
                });
                var nameEl = mkText('div', 'bkbg-ps-product-name', o.productName, {
                    color: o.headerColor
                });
                header.appendChild(nameEl);
                if (o.productTagline) {
                    var tagEl = mkText('div', 'bkbg-ps-tagline', o.productTagline, { color: o.headerColor });
                    header.appendChild(tagEl);
                }
                block.appendChild(header);
            }

            /* ── Content ─────────────────────────────────────── */
            if (o.layout === 'cards') {
                var cardsWrap = mk('div', 'bkbg-ps-cards', {
                    gridTemplateColumns: '1fr 1fr'
                });
                o.groups.forEach(function (group, gIdx) {
                    cardsWrap.appendChild(renderCardGroup(group, gIdx, o));
                });
                block.appendChild(cardsWrap);
            } else {
                /* Table layout (also used for compact) */
                var table = mk('table', 'bkbg-ps-table');
                var tbody = document.createElement('tbody');

                o.groups.forEach(function (group, gIdx) {
                    if (o.showGroupTitles) {
                        var titleTr = document.createElement('tr');
                        var titleTd = mk('td', 'bkbg-ps-group-title', {
                            background: o.groupTitleBg, padding: '8px 16px',
                            color: o.groupTitleColor, borderBottom: '1px solid ' + o.borderColor
                        });
                        titleTd.colSpan = 2;
                        titleTd.textContent = group.title;
                        titleTr.appendChild(titleTd);
                        tbody.appendChild(titleTr);
                    }

                    (group.specs || []).forEach(function (spec, sIdx) {
                        tbody.appendChild(renderRow(spec, sIdx, o, false));
                    });
                });

                table.appendChild(tbody);
                block.appendChild(table);
            }

            /* ── Insert ──────────────────────────────────────── */
            typoCssVarsForEl(block, o.headerTypo, '--bkbg-pspec-hd-');
            typoCssVarsForEl(block, o.groupTitleTypo, '--bkbg-pspec-gt-');
            typoCssVarsForEl(block, o.rowTypo, '--bkbg-pspec-rw-');

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
