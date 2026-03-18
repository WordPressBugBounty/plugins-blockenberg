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

    function getSevStyle(s, o) {
        if (s === 'critical') return { background: o.criticalBg, color: o.criticalColor };
        if (s === 'high')     return { background: o.highBg,     color: o.highColor     };
        if (s === 'medium')   return { background: o.mediumBg,   color: o.mediumColor   };
        return                       { background: o.lowBg,      color: o.lowColor      };
    }

    function getSevLabel(s) {
        if (s === 'critical') return '🔴 Critical';
        if (s === 'high')     return '🟠 High';
        if (s === 'medium')   return '🟡 Medium';
        return '🟢 Low';
    }

    function init() {
        document.querySelectorAll('.bkbg-troubleshooting-guide-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                blockTitle:         opts.blockTitle        || 'Troubleshooting Guide',
                showTitle:          opts.showTitle         !== false,
                blockSubtitle:      opts.blockSubtitle     || '',
                showSubtitle:       opts.showSubtitle      !== false,
                issues:             opts.issues            || [],
                layout:             opts.layout            || 'cards',
                style:              opts.style             || 'bordered',
                showCause:          opts.showCause         !== false,
                showSeverity:       opts.showSeverity      !== false,
                showNumbers:        opts.showNumbers       !== false,
                enableSearch:       opts.enableSearch      !== false,
                searchPlaceholder:  opts.searchPlaceholder || 'Search issues…',
                collapsible:        opts.collapsible       || false,
                borderRadius:       opts.borderRadius      !== undefined ? opts.borderRadius      : 10,
                gap:                opts.gap               !== undefined ? opts.gap               : 14,
                fontSize:           opts.fontSize          !== undefined ? opts.fontSize          : 14,
                problemFontSize:    opts.problemFontSize   !== undefined ? opts.problemFontSize   : 16,
                titleFontSize:      opts.titleFontSize     !== undefined ? opts.titleFontSize     : 26,
                bgColor:            opts.bgColor           || '',
                cardBg:             opts.cardBg            || '#ffffff',
                borderColor:        opts.borderColor       || '#e2e8f0',
                titleColor:         opts.titleColor        || '#0f172a',
                subtitleColor:      opts.subtitleColor     || '#64748b',
                problemColor:       opts.problemColor      || '#1e293b',
                causeColor:         opts.causeColor        || '#475569',
                solutionColor:      opts.solutionColor     || '#374151',
                solutionBg:         opts.solutionBg        || '#f0fdf4',
                solutionBorderColor:opts.solutionBorderColor || '#86efac',
                labelColor:         opts.labelColor        || '#64748b',
                criticalBg:         opts.criticalBg        || '#fee2e2',
                criticalColor:      opts.criticalColor     || '#991b1b',
                highBg:             opts.highBg            || '#ffedd5',
                highColor:          opts.highColor         || '#9a3412',
                mediumBg:           opts.mediumBg          || '#fef9c3',
                mediumColor:        opts.mediumColor       || '#854d0e',
                lowBg:              opts.lowBg             || '#f0fdf4',
                lowColor:           opts.lowColor          || '#166534'
            };

            var isCompact    = o.layout === 'compact';
            var isLeftAccent = o.style  === 'left-accent';
            var isFlat       = o.style  === 'flat';

            /* ── Outer block ─────────────────────────────────── */
            var block = mk('div', 'bkbg-tg-block');
            if (o.bgColor) block.style.background = o.bgColor;

            /* ── Header ──────────────────────────────────────── */
            if ((o.showTitle && o.blockTitle) || (o.showSubtitle && o.blockSubtitle)) {
                var header = mk('div', 'bkbg-tg-header', { marginBottom: '20px' });
                if (o.showTitle && o.blockTitle) {
                    header.appendChild(mkText('h3', 'bkbg-tg-title', o.blockTitle, {
                        color: o.titleColor, margin: '0 0 8px'
                    }));
                }
                if (o.showSubtitle && o.blockSubtitle) {
                    header.appendChild(mkText('p', 'bkbg-tg-subtitle', o.blockSubtitle, {
                        fontSize: '15px', color: o.subtitleColor, margin: '0'
                    }));
                }
                block.appendChild(header);
            }

            /* ── Search ──────────────────────────────────────── */
            var searchInput = null;
            if (o.enableSearch) {
                var searchWrap = mk('div', 'bkbg-tg-search-wrap', { marginBottom: o.gap + 'px' });
                searchInput = mk('input', 'bkbg-tg-search', {
                    width: '100%', padding: '10px 14px 10px 38px', boxSizing: 'border-box',
                    border: '1px solid ' + o.borderColor, borderRadius: o.borderRadius + 'px',
                    fontSize: '14px', fontFamily: 'inherit'
                });
                searchInput.type = 'text';
                searchInput.placeholder = o.searchPlaceholder;
                searchWrap.appendChild(searchInput);
                block.appendChild(searchWrap);
            }

            /* ── Issues ──────────────────────────────────────── */
            var list = mk('div', 'bkbg-tg-list' + (isCompact ? ' is-compact' : ''), {
                display: 'flex', flexDirection: 'column', gap: o.gap + 'px'
            });
            list.style.setProperty('--bkbg-tg-border', o.borderColor);

            var issueEls = o.issues.map(function (iss, idx) {
                var sevStyle = getSevStyle(iss.severity || 'medium', o);

                var card = mk('div', 'bkbg-tg-issue' + (isFlat ? ' is-flat' : '') + (o.collapsible ? ' is-collapsible' : ''));
                card.style.background = o.cardBg;
                if (!isFlat) {
                    card.style.border = '1px solid ' + o.borderColor;
                    card.style.borderRadius = o.borderRadius + 'px';
                }
                if (isLeftAccent) { card.style.borderLeft = '4px solid ' + sevStyle.color; }

                /* Track search text on element for filtering */
                card.dataset.searchText = ((iss.problem || '') + ' ' + (iss.cause || '') + ' ' + (iss.solution || '')).toLowerCase();

                /* Problem row */
                var problemRow = mk('div', 'bkbg-tg-problem-row');
                problemRow.style.borderBottom = '1px solid ' + o.borderColor;

                if (o.showNumbers) {
                    problemRow.appendChild(mkText('span', 'bkbg-tg-number-badge', String(idx + 1), {
                        background: o.borderColor, color: o.problemColor
                    }));
                }

                problemRow.appendChild(mkText('span', 'bkbg-tg-problem-text', iss.problem || '', {
                    color: o.problemColor
                }));

                if (o.showSeverity) {
                    problemRow.appendChild(mkText('span', 'bkbg-tg-severity', getSevLabel(iss.severity || 'medium'), sevStyle));
                }

                if (o.collapsible) {
                    var toggleBtn = mk('button', 'bkbg-tg-toggle');
                    toggleBtn.textContent = 'Details';
                    var arrow = mkText('span', 'bkbg-tg-arrow', '▸');
                    toggleBtn.appendChild(arrow);
                    problemRow.appendChild(toggleBtn);
                }

                card.appendChild(problemRow);

                /* Body (cause + solution) */
                var body = mk('div', 'bkbg-tg-body');

                if (o.showCause && iss.cause) {
                    var causeCol = mk('div', 'bkbg-tg-cause-col', {
                        padding: '10px 18px',
                        borderBottom: '1px solid ' + o.borderColor
                    });
                    causeCol.appendChild(mkText('span', 'bkbg-tg-col-label', 'Cause', { color: o.labelColor }));
                    causeCol.appendChild(mkText('span', 'bkbg-tg-cause-text', iss.cause, {
                        color: o.causeColor, display: 'block'
                    }));
                    body.appendChild(causeCol);
                }

                if (iss.solution) {
                    var solCol = mk('div', 'bkbg-tg-solution-col', {
                        padding: '10px 18px',
                        background: o.solutionBg,
                        borderTop: '1px solid ' + o.solutionBorderColor
                    });
                    solCol.appendChild(mkText('span', 'bkbg-tg-col-label', '✔ Solution', { color: '#166534' }));
                    solCol.appendChild(mkText('span', 'bkbg-tg-solution-text', iss.solution, {
                        color: o.solutionColor, display: 'block'
                    }));
                    body.appendChild(solCol);
                }

                card.appendChild(body);

                /* Collapsible toggle */
                if (o.collapsible) {
                    body.style.maxHeight = '0';
                    body.style.overflow = 'hidden';
                    body.style.transition = 'max-height .3s ease';

                    var toggleBtnRef = problemRow.querySelector('.bkbg-tg-toggle');
                    toggleBtnRef.addEventListener('click', function () {
                        var isOpen = card.classList.contains('is-open');
                        if (isOpen) {
                            body.style.maxHeight = '0';
                            card.classList.remove('is-open');
                        } else {
                            body.style.maxHeight = body.scrollHeight + 'px';
                            card.classList.add('is-open');
                        }
                    });
                }

                return card;
            });

            issueEls.forEach(function (el) { list.appendChild(el); });

            /* No-results message */
            var noResults = mkText('div', 'bkbg-tg-no-results', 'No matching issues found.', {
                textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '14px', display: 'none'
            });
            list.appendChild(noResults);

            block.appendChild(list);

            /* ── Search filtering ────────────────────────────── */
            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    var q = searchInput.value.toLowerCase().trim();
                    var visible = 0;
                    issueEls.forEach(function (card) {
                        var match = !q || card.dataset.searchText.indexOf(q) !== -1;
                        card.style.display = match ? '' : 'none';
                        if (match) visible++;
                    });
                    noResults.style.display = visible === 0 ? 'block' : 'none';
                });
            }

            /* ── Insert ──────────────────────────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
