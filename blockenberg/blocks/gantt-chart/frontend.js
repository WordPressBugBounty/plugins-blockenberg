(function () {
    'use strict';

    /* ── Date helpers ── */
    function parseDate(s) {
        var p = String(s).split('-');
        return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    }

    function addDays(d, n) {
        var r = new Date(d.getTime());
        r.setUTCDate(r.getUTCDate() + n);
        return r;
    }

    function daysBetween(a, b) {
        return Math.round((b - a) / 86400000);
    }

    var MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    function getChartBounds(tasks) {
        var earliest = null, latest = null;
        tasks.forEach(function (t) {
            try {
                var s = parseDate(t.startDate), e = parseDate(t.endDate);
                if (!earliest || s < earliest) earliest = s;
                if (!latest || e > latest) latest = e;
            } catch (err) {}
        });
        if (!earliest) {
            var now = new Date();
            earliest = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
            latest = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
        }
        return { start: addDays(earliest, -3), end: addDays(latest, 3) };
    }

    function getMonthHeaders(start, end) {
        var headers = [];
        var cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        while (cur <= end) {
            var mStart = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), 1));
            var mEnd   = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 0));
            var segStart = mStart < start ? start : mStart;
            var segEnd   = mEnd > end   ? end   : mEnd;
            var days = daysBetween(segStart, segEnd) + 1;
            headers.push({
                label: MONTHS_SHORT[cur.getUTCMonth()] + ' ' + cur.getUTCFullYear(),
                startDay: daysBetween(start, segStart),
                days: days
            });
            cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
        }
        return headers;
    }

    function getWeekHeaders(start, end) {
        var headers = [];
        /* Align to Monday */
        var cur = new Date(start.getTime());
        var dow = cur.getUTCDay();
        cur = addDays(cur, dow === 0 ? -6 : 1 - dow);
        while (cur <= end) {
            var wEnd = addDays(cur, 6);
            var segStart = cur < start ? start : cur;
            var segEnd   = wEnd > end  ? end   : wEnd;
            var days = daysBetween(segStart, segEnd) + 1;
            headers.push({
                label: MONTHS_SHORT[cur.getUTCMonth()] + ' ' + cur.getUTCDate(),
                startDay: daysBetween(start, segStart),
                days: days
            });
            cur = addDays(cur, 7);
        }
        return headers;
    }

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    function makeEl(tag, className, styles) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (styles) applyCSS(el, styles);
        return el;
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', style: 'font-style',
            decoration: 'text-decoration', transform: 'text-transform',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) {
                    v = v + (typo.sizeUnit || 'px');
                } else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) {
                    v = v + (typo.lineHeightUnit || '');
                } else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.letterSpacingUnit || 'px');
                } else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.wordSpacingUnit || 'px');
                }
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-gant-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                tasks: [],
                view: 'month',
                showPhases: true,
                showMilestones: true,
                showAssignee: false,
                showProgress: true,
                highlightToday: true,
                showLegend: true,
                showWeekends: true,
                rowHeight: 40,
                taskRadius: 4,
                labelWidth: 200,
                maxWidth: 0,
                paddingTop: 0,
                paddingBottom: 0,
                bgColor: '',
                headerBg: '#f3f4f6',
                rowBg: '#ffffff',
                rowAltBg: '#f9fafb',
                weekendBg: '#f0f0f5',
                todayLine: '#ef4444',
                gridColor: '#e5e7eb',
                headerColor: '#374151',
                labelColor: '#111827',
                phaseColor: '#6b7280',
                milestoneColor: '#f59e0b'
            }, opts);

            var tasks = o.tasks;
            if (!tasks || tasks.length === 0) return;

            var bounds = getChartBounds(tasks);
            var totalDays = daysBetween(bounds.start, bounds.end) + 1;
            var headers = o.view === 'week' ? getWeekHeaders(bounds.start, bounds.end) : getMonthHeaders(bounds.start, bounds.end);

            /* Group rows */
            var rows = [];
            if (o.showPhases) {
                var phases = [], phaseMap = {};
                tasks.forEach(function (t) {
                    var ph = t.phase || 'Tasks';
                    if (!phaseMap[ph]) { phaseMap[ph] = []; phases.push(ph); }
                    phaseMap[ph].push(t);
                });
                phases.forEach(function (ph) {
                    rows.push({ type: 'phase', label: ph });
                    phaseMap[ph].forEach(function (t) { rows.push({ type: 'task', task: t }); });
                });
            } else {
                tasks.forEach(function (t) { rows.push({ type: 'task', task: t }); });
            }

            /* ── Container ── */
            var container = makeEl('div', 'bkbg-gant-outer', {
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px',
                background: o.bgColor || ''
            });

            typoCssVarsForEl(o.typoLabel, '--bkbg-gant-lb-', container);
            typoCssVarsForEl(o.typoHeader, '--bkbg-gant-hd-', container);

            var inner = container;
            if (o.maxWidth > 0) {
                inner = makeEl('div', '', { maxWidth: o.maxWidth + 'px', margin: '0 auto', overflowX: 'auto' });
                container.appendChild(inner);
            }

            /* (Today calculations) */
            var nowUTC = new Date();
            var todayD = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate()));
            var todayOffset = daysBetween(bounds.start, todayD);
            var todayPct = (todayOffset / totalDays) * 100;
            var showToday = o.highlightToday && todayOffset >= 0 && todayOffset <= totalDays;

            /* ── Layout row ── */
            var layout = makeEl('div', 'bkbg-gant-layout');
            inner.appendChild(layout);

            /* LABELS column */
            var labelsCol = makeEl('div', 'bkbg-gant-labels', { width: o.labelWidth + 'px', flexShrink: 0, borderRight: '1px solid ' + o.gridColor });
            layout.appendChild(labelsCol);

            /* Header placeholder */
            var labelHeader = makeEl('div', 'bkbg-gant-header-cell', {
                height: '36px',
                background: o.headerBg,
                borderBottom: '1px solid ' + o.gridColor,
                color: o.headerColor
            });
            labelHeader.textContent = 'Task';
            labelsCol.appendChild(labelHeader);

            /* Task label cells */
            rows.forEach(function (row, ri) {
                var cell = makeEl('div', 'bkbg-gant-label-cell ' + (row.type === 'phase' ? 'is-phase' : 'is-task'), {
                    height: o.rowHeight + 'px',
                    background: row.type === 'phase' ? o.headerBg : (ri % 2 === 0 ? o.rowBg : o.rowAltBg),
                    borderBottom: '1px solid ' + o.gridColor,
                    color: row.type === 'phase' ? o.phaseColor : o.labelColor,
                    boxSizing: 'border-box'
                });
                var textEl = makeEl('span', 'bkbg-gant-label-text');
                textEl.textContent = row.type === 'phase' ? row.label : ((row.task.milestone ? '◆ ' : '') + (row.task.name || ''));
                cell.appendChild(textEl);

                if (row.type === 'task' && o.showAssignee && row.task.assignee) {
                    var asgn = makeEl('span', 'bkbg-gant-assignee');
                    asgn.textContent = row.task.assignee;
                    cell.appendChild(asgn);
                }
                labelsCol.appendChild(cell);
            });

            /* GRID column */
            var gridCol = makeEl('div', 'bkbg-gant-grid', { position: 'relative', flex: '1' });
            layout.appendChild(gridCol);

            /* Column headers (months or weeks) */
            var colHeadersRow = makeEl('div', 'bkbg-gant-col-headers', {
                background: o.headerBg,
                borderBottom: '1px solid ' + o.gridColor,
                height: '36px'
            });
            headers.forEach(function (h, hi) {
                var hCell = makeEl('div', 'bkbg-gant-col-header', {
                    flex: h.days,
                    color: o.headerColor,
                    borderLeft: hi > 0 ? '1px solid ' + o.gridColor : 'none',
                    height: '36px'
                });
                hCell.textContent = h.label;
                colHeadersRow.appendChild(hCell);
            });
            gridCol.appendChild(colHeadersRow);

            /* Rows area */
            var rowsArea = makeEl('div', 'bkbg-gant-rows', { position: 'relative' });
            gridCol.appendChild(rowsArea);

            /* Vertical grid lines (one per column header segment) */
            var colLinesEl = makeEl('div', 'bkbg-gant-col-lines', { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 });
            headers.forEach(function (h, hi) {
                var line = makeEl('div', 'bkbg-gant-col-line', {
                    flex: h.days,
                    borderLeft: hi > 0 ? '1px solid ' + o.gridColor : 'none',
                    boxSizing: 'border-box'
                });
                colLinesEl.appendChild(line);
            });
            rowsArea.appendChild(colLinesEl);

            /* Task rows */
            rows.forEach(function (row, ri) {
                var rowEl = makeEl('div', 'bkbg-gant-row', {
                    height: o.rowHeight + 'px',
                    background: row.type === 'phase' ? o.headerBg : (ri % 2 === 0 ? o.rowBg : o.rowAltBg),
                    borderBottom: '1px solid ' + o.gridColor,
                    position: 'relative',
                    boxSizing: 'border-box'
                });

                if (row.type === 'task') {
                    var t = row.task;
                    try {
                        var tStart = parseDate(t.startDate);
                        var tEnd   = parseDate(t.endDate);
                        var leftPct  = (daysBetween(bounds.start, tStart) / totalDays * 100);
                        var widthPct = Math.max(0.5, (daysBetween(tStart, tEnd) + 1) / totalDays * 100);
                        leftPct = Math.max(0, leftPct);
                        widthPct = Math.min(widthPct, 100 - leftPct);

                        if (t.milestone && o.showMilestones) {
                            var diamond = makeEl('div', 'bkbg-gant-milestone', {
                                left: 'calc(' + leftPct + '% - ' + Math.round(o.rowHeight * 0.3) + 'px)',
                                width: Math.round(o.rowHeight * 0.5) + 'px',
                                height: Math.round(o.rowHeight * 0.5) + 'px',
                                background: t.color || o.milestoneColor
                            });
                            diamond.title = t.name || '';
                            rowEl.appendChild(diamond);
                        } else if (!t.milestone) {
                            var barH = Math.round(o.rowHeight * 0.55);
                            var bar = makeEl('div', 'bkbg-gant-bar', {
                                left: leftPct + '%',
                                width: widthPct + '%',
                                height: barH + 'px',
                                background: t.color || '#6366f1',
                                borderRadius: o.taskRadius + 'px'
                            });
                            bar.title = (t.name || '') + (t.assignee ? ' — ' + t.assignee : '') + (t.completed ? ' (' + t.completed + '%)' : '');

                            if (o.showProgress && t.completed > 0) {
                                var prog = makeEl('div', 'bkbg-gant-bar-progress', {
                                    width: Math.min(100, t.completed) + '%'
                                });
                                bar.appendChild(prog);
                            }
                            rowEl.appendChild(bar);
                        }
                    } catch (err) {}
                }

                rowsArea.appendChild(rowEl);
            });

            /* Today line */
            if (showToday) {
                var todayEl = makeEl('div', 'bkbg-gant-today', {
                    left: todayPct + '%',
                    background: o.todayLine
                });
                rowsArea.appendChild(todayEl);
            }

            /* ── Legend ── */
            if (o.showLegend) {
                var legend = makeEl('div', 'bkbg-gant-legend');

                /* Task bar */
                var lBar = makeEl('div', 'bkbg-gant-legend-item');
                var lBarSwatch = makeEl('div', 'bkbg-gant-legend-bar', { background: '#6366f1' });
                var lBarLabel = makeEl('span');
                lBarLabel.textContent = 'Task';
                lBar.appendChild(lBarSwatch);
                lBar.appendChild(lBarLabel);
                legend.appendChild(lBar);

                /* Milestone */
                if (o.showMilestones) {
                    var lMs = makeEl('div', 'bkbg-gant-legend-item');
                    var lMsSwatch = makeEl('div', 'bkbg-gant-legend-diamond', { background: o.milestoneColor });
                    var lMsLabel = makeEl('span');
                    lMsLabel.textContent = 'Milestone';
                    lMs.appendChild(lMsSwatch);
                    lMs.appendChild(lMsLabel);
                    legend.appendChild(lMs);
                }

                /* Today */
                if (showToday) {
                    var lTd = makeEl('div', 'bkbg-gant-legend-item');
                    var lTdLine = makeEl('div', 'bkbg-gant-legend-today', { background: o.todayLine });
                    var lTdLabel = makeEl('span');
                    lTdLabel.textContent = 'Today';
                    lTd.appendChild(lTdLine);
                    lTd.appendChild(lTdLabel);
                    legend.appendChild(lTd);
                }

                inner.appendChild(legend);
            }

            appEl.parentNode.insertBefore(container, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
