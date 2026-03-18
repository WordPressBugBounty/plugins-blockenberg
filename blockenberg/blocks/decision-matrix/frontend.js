(function () {
    'use strict';

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
    function mkTh(content, styles) {
        var th = (typeof content === 'string') ? mkText('th', '', content, styles) : mk('th', '', styles);
        if (typeof content !== 'string' && content) th.appendChild(content);
        return th;
    }
    function mkTd(content, styles) {
        var td = (typeof content === 'string') ? mkText('td', '', content, styles) : mk('td', '', styles);
        if (typeof content !== 'string' && content) td.appendChild(content);
        return td;
    }

    function calcTotals(options, criteria) {
        return options.map(function (opt) {
            var total = 0;
            criteria.forEach(function (crit, ci) {
                total += (opt.scores[ci] || 0) * (crit.weight || 1);
            });
            return total;
        });
    }

    function winnerIdx(totals) {
        var maxVal = -1, maxIdx = -1;
        totals.forEach(function (t, i) { if (t > maxVal) { maxVal = t; maxIdx = i; } });
        return maxIdx;
    }

    function init() {
        document.querySelectorAll('.bkbg-decision-matrix-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                blockTitle:         opts.blockTitle        || 'Decision Matrix',
                showTitle:          opts.showTitle         !== false,
                blockSubtitle:      opts.blockSubtitle     || '',
                showSubtitle:       opts.showSubtitle      !== false,
                options:            opts.options           || [],
                criteria:           opts.criteria          || [],
                showWeights:        opts.showWeights       !== false,
                showRawScores:      opts.showRawScores     !== false,
                showWinner:         opts.showWinner        !== false,
                showProgressBars:   opts.showProgressBars  || false,
                fontSize:           opts.fontSize          !== undefined ? opts.fontSize          : 14,
                titleFontSize:      opts.titleFontSize     !== undefined ? opts.titleFontSize     : 24,
                borderRadius:       opts.borderRadius      !== undefined ? opts.borderRadius      : 10,
                bgColor:            opts.bgColor           || '',
                headerBg:           opts.headerBg          || '#1e293b',
                headerColor:        opts.headerColor       || '#ffffff',
                criteriaLabelBg:    opts.criteriaLabelBg   || '#f1f5f9',
                criteriaLabelColor: opts.criteriaLabelColor|| '#475569',
                cellBg:             opts.cellBg            || '#ffffff',
                cellColor:          opts.cellColor         || '#374151',
                borderColor:        opts.borderColor       || '#e2e8f0',
                winnerBg:           opts.winnerBg          || '#eff6ff',
                winnerColor:        opts.winnerColor       || '#1d4ed8',
                winnerBorderColor:  opts.winnerBorderColor || '#3b82f6',
                totalRowBg:         opts.totalRowBg        || '#f8fafc',
                totalRowColor:      opts.totalRowColor     || '#0f172a',
                accentColor:        opts.accentColor       || '#3b82f6',
                titleColor:         opts.titleColor        || '#0f172a',
                subtitleColor:      opts.subtitleColor     || '#64748b'
            };

            if (!o.options.length || !o.criteria.length) return;

            var totals = calcTotals(o.options, o.criteria);
            var winner = o.showWinner ? winnerIdx(totals) : -1;
            var maxTotal = Math.max.apply(null, totals);

            /* ── Outer block ─────────────────────────────────── */
            var block = mk('div', 'bkbg-dm-block');
            if (o.bgColor) block.style.background = o.bgColor;
            block.style.setProperty('--bkbg-dm-border', o.borderColor);
            /* Typography CSS vars */
            block.style.setProperty('--bkbg-dm-ttl-fs', o.titleFontSize + 'px');
            block.style.setProperty('--bkbg-dm-sub-fs', (opts.subtitleFontSize || 14) + 'px');
            block.style.setProperty('--bkbg-dm-cel-fs', o.fontSize + 'px');
            if (opts.typoTitle) typoCssVarsForEl(opts.typoTitle, '--bkbg-dm-ttl-', block);
            if (opts.typoSubtitle) typoCssVarsForEl(opts.typoSubtitle, '--bkbg-dm-sub-', block);
            if (opts.typoCell) typoCssVarsForEl(opts.typoCell, '--bkbg-dm-cel-', block);
            /* ── Header ──────────────────────────────────────── */
            if ((o.showTitle && o.blockTitle) || (o.showSubtitle && o.blockSubtitle)) {
                var header = mk('div', 'bkbg-dm-header', { marginBottom: '20px' });
                if (o.showTitle && o.blockTitle) {
                    header.appendChild(mkText('h3', 'bkbg-dm-title', o.blockTitle, {
                        color: o.titleColor, margin: '0 0 6px'
                    }));
                }
                if (o.showSubtitle && o.blockSubtitle) {
                    header.appendChild(mkText('p', 'bkbg-dm-subtitle', o.blockSubtitle, {
                        color: o.subtitleColor, margin: '0'
                    }));
                }
                block.appendChild(header);
            }

            /* ── Winner banner ───────────────────────────────── */
            if (o.showWinner && winner >= 0) {
                var banner = mk('div', 'bkbg-dm-winner-banner', {
                    background: o.winnerBg, border: '1px solid ' + o.winnerBorderColor,
                    borderRadius: o.borderRadius + 'px', marginBottom: '16px'
                });
                banner.appendChild(mkText('span', '', '🏆', { fontSize: '20px' }));
                banner.appendChild(mkText('span', '', o.options[winner].name + ' wins with ' + totals[winner] + ' points', {
                    fontWeight: '700', color: o.winnerColor, fontSize: '15px'
                }));
                block.appendChild(banner);
            }

            /* ── Table ───────────────────────────────────────── */
            var tableWrap = mk('div', 'bkbg-dm-table-wrap', { overflowX: 'auto' });
            var table = mk('table', 'bkbg-dm-table', {
                width: '100%', borderCollapse: 'collapse',
                border: '1px solid ' + o.borderColor, borderRadius: o.borderRadius + 'px', overflow: 'hidden'
            });

            /* Head */
            var thead = mk('thead', '');
            var headRow = mk('tr', '');

            // Criterion header
            var thCrit = mkText('th', '', 'Criterion', {
                background: o.headerBg, color: o.headerColor,
                padding: '12px 16px', textAlign: 'left', fontWeight: '700',
                border: '1px solid rgba(255,255,255,.1)'
            });
            headRow.appendChild(thCrit);

            // Weight header
            if (o.showWeights) {
                headRow.appendChild(mkText('th', '', 'Weight', {
                    background: o.headerBg, color: o.headerColor,
                    padding: '12px 10px', textAlign: 'center', fontWeight: '600', fontSize: '12px',
                    border: '1px solid rgba(255,255,255,.1)'
                }));
            }

            // Option headers
            o.options.forEach(function (opt, oi) {
                var isWin = oi === winner;
                var thOpt = mk('th', isWin ? 'is-winner' : '', {
                    background: isWin ? o.winnerBorderColor : o.headerBg,
                    color: o.headerColor, padding: '12px 16px', textAlign: 'center', fontWeight: '700',
                    border: '1px solid rgba(255,255,255,.1)'
                });
                thOpt.textContent = opt.name + (isWin ? ' 🏆' : '');
                headRow.appendChild(thOpt);
            });

            thead.appendChild(headRow);
            table.appendChild(thead);

            /* Body */
            var tbody = mk('tbody', '');

            o.criteria.forEach(function (crit, ci) {
                var row = mk('tr', '');

                row.appendChild(mkText('td', '', crit.label, {
                    background: o.criteriaLabelBg, color: o.criteriaLabelColor,
                    padding: '10px 16px', fontWeight: '600',
                    border: '1px solid ' + o.borderColor
                }));

                if (o.showWeights) {
                    row.appendChild(mkText('td', '', '×' + (crit.weight || 1), {
                        background: o.criteriaLabelBg, color: o.accentColor,
                        padding: '10px', textAlign: 'center', fontWeight: '700', fontSize: '13px',
                        border: '1px solid ' + o.borderColor
                    }));
                }

                o.options.forEach(function (opt, oi) {
                    var isWin = oi === winner;
                    var raw = opt.scores[ci] || 0;
                    var weighted = raw * (crit.weight || 1);

                    var td = mk('td', isWin ? 'is-winner' : '', {
                        background: isWin ? o.winnerBg : o.cellBg,
                        color: o.cellColor, padding: '10px 16px', textAlign: 'center',
                        border: '1px solid ' + o.borderColor
                    });

                    var cellContent = mk('div', '', { lineHeight: '1' });
                    var scoreSpan = mkText('span', 'bkbg-dm-score', String(raw), { fontWeight: '600' });
                    cellContent.appendChild(scoreSpan);

                    if (o.showRawScores) {
                        cellContent.appendChild(mkText('span', 'bkbg-dm-weighted', '(' + weighted + ')', {
                            fontSize: '11px', color: o.accentColor, marginLeft: '4px', opacity: '.85'
                        }));
                    }

                    if (o.showProgressBars) {
                        var barWrap = mk('div', 'bkbg-dm-bar-wrap');
                        var barFill = mk('div', 'bkbg-dm-bar-fill', {
                            width: (raw / 10 * 100) + '%',
                            background: isWin ? o.winnerBorderColor : o.accentColor
                        });
                        barWrap.appendChild(barFill);
                        cellContent.appendChild(barWrap);
                    }

                    td.appendChild(cellContent);
                    row.appendChild(td);
                });

                tbody.appendChild(row);
            });

            /* Total row */
            var totalRow = mk('tr', 'bkbg-dm-total-row');
            var labelTdColspan = o.showWeights ? 2 : 1;
            var labelTd = mk('td', '', {
                padding: '12px 16px', fontWeight: '700', fontSize: '13px',
                color: o.totalRowColor, textTransform: 'uppercase', letterSpacing: '.05em',
                background: o.totalRowBg, border: '1px solid ' + o.borderColor
            });
            labelTd.colSpan = labelTdColspan;
            labelTd.textContent = '🏁 Weighted Total';
            totalRow.appendChild(labelTd);

            totals.forEach(function (t, i) {
                var isWin = i === winner;
                totalRow.appendChild(mkText('td', isWin ? 'is-winner' : '', String(t), {
                    padding: '12px 16px', textAlign: 'center', fontWeight: '800', fontSize: '16px',
                    color: isWin ? o.winnerColor : o.totalRowColor,
                    background: isWin ? o.winnerBg : o.totalRowBg,
                    border: '1px solid ' + o.borderColor
                }));
            });
            tbody.appendChild(totalRow);

            table.appendChild(tbody);
            tableWrap.appendChild(table);
            block.appendChild(tableWrap);

            /* ── Insert ──────────────────────────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
