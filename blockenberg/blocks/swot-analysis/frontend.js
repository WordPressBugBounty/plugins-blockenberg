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

    var COLORS = ['strengthsColor', 'weaknessesColor', 'opportunitiesColor', 'threatsColor'];

    function hexToRgba(hex, alpha) {
        if (!hex || hex.length < 7) return 'rgba(0,0,0,' + alpha + ')';
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function getBullet(listStyle, idx) {
        if (listStyle === 'number') return (idx + 1) + '.';
        if (listStyle === 'check') return '✓';
        if (listStyle === 'dash') return '—';
        if (listStyle === 'none') return '';
        return '•';
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

    function init() {
        document.querySelectorAll('.bkbg-swot-analysis-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var defaultQuadrants = [
                { id: 'strengths', label: 'Strengths', icon: '💪', items: ['Strength item 1', 'Strength item 2'] },
                { id: 'weaknesses', label: 'Weaknesses', icon: '⚠️', items: ['Weakness item 1', 'Weakness item 2'] },
                { id: 'opportunities', label: 'Opportunities', icon: '🚀', items: ['Opportunity item 1', 'Opportunity item 2'] },
                { id: 'threats', label: 'Threats', icon: '🛡️', items: ['Threat item 1', 'Threat item 2'] }
            ];

            var o = {
                blockTitle:     opts.blockTitle     || 'SWOT Analysis',
                showTitle:      opts.showTitle      !== false,
                quadrants:      opts.quadrants      || defaultQuadrants,
                showIcons:      opts.showIcons      !== false,
                listStyle:      opts.listStyle      || 'bullet',
                borderRadius:   opts.borderRadius   !== undefined ? opts.borderRadius : 12,
                gap:            opts.gap            !== undefined ? opts.gap : 16,
                headerPaddingV: opts.headerPaddingV !== undefined ? opts.headerPaddingV : 16,
                headerPaddingH: opts.headerPaddingH !== undefined ? opts.headerPaddingH : 20,
                bodyPaddingV:   opts.bodyPaddingV   !== undefined ? opts.bodyPaddingV : 16,
                bodyPaddingH:   opts.bodyPaddingH   !== undefined ? opts.bodyPaddingH : 20,
                headerFontSize: opts.headerFontSize !== undefined ? opts.headerFontSize : 16,
                headerFontWeight: opts.headerFontWeight !== undefined ? opts.headerFontWeight : 700,
                itemFontSize:   opts.itemFontSize   !== undefined ? opts.itemFontSize : 14,
                titleFontSize:  opts.titleFontSize  !== undefined ? opts.titleFontSize : 24,
                enableShadow:   opts.enableShadow   !== false,
                strengthsColor:    opts.strengthsColor    || '#22c55e',
                weaknessesColor:   opts.weaknessesColor   || '#ef4444',
                opportunitiesColor:opts.opportunitiesColor|| '#3b82f6',
                threatsColor:      opts.threatsColor      || '#f59e0b',
                bgColor:         opts.bgColor        || '#ffffff',
                borderColor:     opts.borderColor    || '#e2e8f0',
                titleColor:      opts.titleColor     || '#1e293b',
                textColor:       opts.textColor      || '#374151',
                headerTextColor: opts.headerTextColor || '#ffffff'
            };

            var quadColors = [o.strengthsColor, o.weaknessesColor, o.opportunitiesColor, o.threatsColor];

            /* ── Outer block ─────────────────────────────────── */
            var block = mk('div', 'bkbg-swot-block');

            typoCssVarsForEl(block, o.titleTypo, '--bkswa-tt-');
            typoCssVarsForEl(block, o.headerTypo, '--bkswa-ht-');
            typoCssVarsForEl(block, o.itemTypo, '--bkswa-it-');

            /* ── Title ───────────────────────────────────────── */
            if (o.showTitle && o.blockTitle) {
                var titleEl = mkText('h3', 'bkbg-swot-title', o.blockTitle, {
                    color: o.titleColor
                });
                block.appendChild(titleEl);
            }

            /* ── Grid ────────────────────────────────────────── */
            var grid = mk('div', 'bkbg-swot-grid', { gap: o.gap + 'px' });
            block.appendChild(grid);

            o.quadrants.forEach(function (quad, i) {
                var color = quadColors[i] || '#3b82f6';
                var bodyBg = hexToRgba(color, 0.06);
                var borderCol = hexToRgba(color, 0.3);

                /* Quadrant card */
                var card = mk('div', 'bkbg-swot-quadrant', {
                    background: o.bgColor,
                    border: '1px solid ' + borderCol,
                    borderRadius: o.borderRadius + 'px',
                    boxShadow: o.enableShadow ? '0 2px 12px rgba(0,0,0,0.07)' : 'none'
                });

                /* Header */
                var header = mk('div', 'bkbg-swot-header', {
                    background: color,
                    padding: o.headerPaddingV + 'px ' + o.headerPaddingH + 'px',
                    color: o.headerTextColor
                });

                if (o.showIcons && quad.icon) {
                    var iconEl = mkText('span', 'bkbg-swot-icon', quad.icon);
                    header.appendChild(iconEl);
                }

                var labelEl = mkText('span', 'bkbg-swot-label', quad.label);
                header.appendChild(labelEl);
                card.appendChild(header);

                /* Body */
                var body = mk('div', 'bkbg-swot-body', {
                    background: bodyBg,
                    padding: o.bodyPaddingV + 'px ' + o.bodyPaddingH + 'px'
                });

                (quad.items || []).forEach(function (item, itemIdx) {
                    var row = mk('div', 'bkbg-swot-item');

                    var bullet = getBullet(o.listStyle, itemIdx);
                    if (bullet) {
                        var bulletEl = mkText('span', 'bkbg-swot-bullet', bullet, {
                            color: color
                        });
                        row.appendChild(bulletEl);
                    }

                    var textEl = mkText('span', 'bkbg-swot-item-text', item, {
                        color: o.textColor
                    });
                    row.appendChild(textEl);
                    body.appendChild(row);
                });

                card.appendChild(body);
                grid.appendChild(card);
            });

            /* ── Insert & hide placeholder ───────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
