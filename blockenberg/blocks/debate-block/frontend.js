(function () {
    'use strict';

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
    function hexToRgba(hex, alpha) {
        if (!hex || hex.length < 7) return 'rgba(180,180,180,' + alpha + ')';
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

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

    function buildSide(o, side) {
        var isLeft   = side === 'left';
        var label    = isLeft ? o.leftLabel    : o.rightLabel;
        var icon     = isLeft ? o.leftIcon     : o.rightIcon;
        var points   = isLeft ? o.leftPoints   : o.rightPoints;
        var color    = isLeft ? o.leftColor    : o.rightColor;
        var bg       = isLeft ? o.leftBg       : o.rightBg;
        var borderCol = hexToRgba(color, 0.35);

        var card = mk('div', 'bkbg-db-side', {
            background: o.style === 'minimal' ? 'transparent' : bg,
            border: o.style === 'minimal' ? 'none' : '1px solid ' + borderCol,
            boxShadow: o.style === 'card' ? '0 2px 12px rgba(0,0,0,.07)' : 'none'
        });

        // Header
        var header = mk('div', 'bkbg-db-side-header', {
            background: color,
            padding: '14px ' + o.gap + 'px'
        });

        if (o.showIcons && icon) {
            var iconEl = mkText('span', 'bkbg-db-side-icon', icon);
            header.appendChild(iconEl);
        }

        var labelEl = mkText('span', 'bkbg-db-side-label', label, {
            color: o.headerTextColor
        });
        header.appendChild(labelEl);
        card.appendChild(header);

        // Points
        var pointsList = mk('ul', 'bkbg-db-points', { padding: '12px ' + o.gap + 'px' });

        (points || []).forEach(function (point, idx) {
            var li = mk('li', 'bkbg-db-point');

            if (o.showBullets) {
                var bullet = mkText('span', 'bkbg-db-bullet', isLeft ? '✓' : '✗', { color: color });
                li.appendChild(bullet);
            }

            var text = mkText('span', 'bkbg-db-point-text', point, {
                color: o.textColor
            });
            li.appendChild(text);
            pointsList.appendChild(li);
        });

        card.appendChild(pointsList);
        return card;
    }

    function init() {
        document.querySelectorAll('.bkbg-debate-block-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                blockTitle:    opts.blockTitle   || 'The Great Debate',
                showTitle:     opts.showTitle    !== false,
                blockSubtitle: opts.blockSubtitle || '',
                showSubtitle:  opts.showSubtitle !== false,
                leftLabel:     opts.leftLabel    || 'For',
                rightLabel:    opts.rightLabel   || 'Against',
                leftIcon:      opts.leftIcon     || '👍',
                rightIcon:     opts.rightIcon    || '👎',
                leftPoints:    opts.leftPoints   || [],
                rightPoints:   opts.rightPoints  || [],
                verdict:       opts.verdict      || '',
                showVerdict:   opts.showVerdict  !== false,
                verdictLabel:  opts.verdictLabel || '💡 Verdict',
                layout:        opts.layout       || 'columns',
                style:         opts.style        || 'card',
                showIcons:     opts.showIcons    !== false,
                showBullets:   opts.showBullets  !== false,
                borderRadius:  opts.borderRadius !== undefined ? opts.borderRadius : 12,
                gap:           opts.gap          !== undefined ? opts.gap : 20,
                fontSize:      opts.fontSize     !== undefined ? opts.fontSize : 14,
                headerFontSize:opts.headerFontSize !== undefined ? opts.headerFontSize : 18,
                leftColor:         opts.leftColor         || '#22c55e',
                rightColor:        opts.rightColor        || '#ef4444',
                bgColor:           opts.bgColor           || '#f8fafc',
                leftBg:            opts.leftBg            || '#f0fdf4',
                rightBg:           opts.rightBg           || '#fef2f2',
                textColor:         opts.textColor         || '#374151',
                headerTextColor:   opts.headerTextColor   || '#ffffff',
                titleColor:        opts.titleColor        || '#0f172a',
                subtitleColor:     opts.subtitleColor     || '#64748b',
                verdictBg:         opts.verdictBg         || '#fffbeb',
                verdictColor:      opts.verdictColor      || '#92400e',
                verdictBorderColor:opts.verdictBorderColor|| '#fcd34d'
            };

            /* ── Block wrapper ───────────────────────────────── */
            var block = mk('div', 'bkbg-db-block', {
                background: o.bgColor,
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden'
            });

            /* ── Typography CSS vars ─────────────────────────── */
            block.style.setProperty('--bkbg-db-ttl-fs', (opts.blockTitleFontSize || 22) + 'px');
            block.style.setProperty('--bkbg-db-sub-fs', (opts.blockSubtitleFontSize || 14) + 'px');
            block.style.setProperty('--bkbg-db-hdr-fs', (o.headerFontSize) + 'px');
            block.style.setProperty('--bkbg-db-pt-fs', (o.fontSize) + 'px');
            if (opts.typoTitle) typoCssVarsForEl(opts.typoTitle, '--bkbg-db-ttl-', block);
            if (opts.typoSubtitle) typoCssVarsForEl(opts.typoSubtitle, '--bkbg-db-sub-', block);
            if (opts.typoHeader) typoCssVarsForEl(opts.typoHeader, '--bkbg-db-hdr-', block);
            if (opts.typoPoint) typoCssVarsForEl(opts.typoPoint, '--bkbg-db-pt-', block);

            /* ── Title / intro ───────────────────────────────── */
            if (o.showTitle || o.showSubtitle) {
                var intro = mk('div', 'bkbg-db-intro', {
                    padding: '28px ' + o.gap + 'px ' + o.gap + 'px',
                    borderBottom: '1px solid #f1f5f9'
                });
                if (o.showTitle && o.blockTitle) {
                    intro.appendChild(mkText('h3', 'bkbg-db-title', o.blockTitle, { color: o.titleColor }));
                }
                if (o.showSubtitle && o.blockSubtitle) {
                    intro.appendChild(mkText('p', 'bkbg-db-subtitle', o.blockSubtitle, { color: o.subtitleColor }));
                }
                block.appendChild(intro);
            }

            /* ── Sides ───────────────────────────────────────── */
            var sidesClass = 'bkbg-db-sides' + (o.layout === 'stacked' ? ' is-stacked' : '');
            var sidesWrap = mk('div', sidesClass);

            sidesWrap.appendChild(buildSide(o, 'left'));

            if (o.layout === 'columns') {
                var vs = mk('div', 'bkbg-db-vs', { background: '#f1f5f9', color: '#64748b' });
                vs.textContent = 'VS';
                sidesWrap.appendChild(vs);
            }

            sidesWrap.appendChild(buildSide(o, 'right'));
            block.appendChild(sidesWrap);

            /* ── Verdict ─────────────────────────────────────── */
            if (o.showVerdict && o.verdict) {
                var verdict = mk('div', 'bkbg-db-verdict', {
                    margin: o.gap + 'px',
                    background: o.verdictBg,
                    borderColor: o.verdictBorderColor,
                    borderRadius: o.borderRadius + 'px',
                    padding: '16px ' + o.gap + 'px',
                    color: o.verdictColor
                });
                verdict.appendChild(mkText('div', 'bkbg-db-verdict-label', o.verdictLabel, { color: o.verdictColor }));
                verdict.appendChild(mkText('div', 'bkbg-db-verdict-text', o.verdict, {
                    color: o.verdictColor
                }));
                block.appendChild(verdict);
            }

            /* ── Insert ──────────────────────────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
