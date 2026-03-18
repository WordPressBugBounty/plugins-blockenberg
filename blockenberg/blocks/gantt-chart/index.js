( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _gantTC, _gantTV;
    function _tc() { return _gantTC || (_gantTC = window.bkbgTypographyControl); }
    function _tv() { return _gantTV || (_gantTV = window.bkbgTypoCssVars); }

    /* ── Date helpers ── */
    function parseDate(s) {
        var p = s.split('-');
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

    function toDateStr(d) {
        return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
    }

    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function getChartBounds(tasks) {
        if (!tasks || tasks.length === 0) {
            var now = new Date();
            var s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
            var e = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 3, 0));
            return { start: s, end: e };
        }
        var earliest = null, latest = null;
        tasks.forEach(function (t) {
            try {
                var s = parseDate(t.startDate), e = parseDate(t.endDate);
                if (!earliest || s < earliest) earliest = s;
                if (!latest || e > latest) latest = e;
            } catch (err) {}
        });
        if (!earliest) {
            earliest = new Date();
            latest = addDays(earliest, 60);
        }
        /* Pad 3 days on each side */
        var chartStart = addDays(earliest, -3);
        var chartEnd = addDays(latest, 3);
        return { start: chartStart, end: chartEnd };
    }

    function getMonthHeaders(start, end) {
        var headers = [];
        var cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
        var chartStart = start;
        while (cur <= end) {
            var monthStart = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), 1));
            var monthEnd = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 0));
            var segStart = monthStart < chartStart ? chartStart : monthStart;
            var segEnd = monthEnd > end ? end : monthEnd;
            headers.push({
                label: MONTHS[cur.getUTCMonth()] + ' ' + cur.getUTCFullYear(),
                startDay: daysBetween(chartStart, segStart),
                days: daysBetween(segStart, segEnd) + 1
            });
            cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
        }
        return headers;
    }

    function getTaskPosition(task, chartStart, totalDays) {
        try {
            var s = parseDate(task.startDate);
            var e = parseDate(task.endDate);
            var left = daysBetween(chartStart, s) / totalDays * 100;
            var width = Math.max(1, (daysBetween(s, e) + 1) / totalDays * 100);
            return { left: Math.max(0, left), width: Math.min(width, 100 - Math.max(0, left)) };
        } catch (err) {
            return { left: 0, width: 5 };
        }
    }

    /* ── GanttPreview ── */
    function GanttPreview(props) {
        var a = props.attributes;
        var tasks = a.tasks || [];
        var bounds = getChartBounds(tasks);
        var totalDays = daysBetween(bounds.start, bounds.end) + 1;
        var headers = getMonthHeaders(bounds.start, bounds.end);
        var labelW = a.labelWidth || 200;
        var rowH = a.rowHeight || 40;
        var today = new Date();
        var todayLeft = daysBetween(bounds.start, new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))) / totalDays * 100;
        var showToday = a.highlightToday && todayLeft >= 0 && todayLeft <= 100;

        /* Group by phase */
        var rows = [];
        if (a.showPhases) {
            var phases = [];
            var phaseMap = {};
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

        var previewStyle = Object.assign({
            overflowX: 'auto',
            background: a.bgColor || '',
            paddingTop: (a.paddingTop || 0) + 'px',
            paddingBottom: (a.paddingBottom || 0) + 'px'
        }, _tv()(a.typoLabel, '--bkbg-gant-lb-'), _tv()(a.typoHeader, '--bkbg-gant-hd-'));

        return el('div', { className: 'bkbg-gant-outer', style: previewStyle },
            el('div', { style: { display: 'flex', minWidth: labelW + 400 + 'px' } },
                /* Label column */
                el('div', { style: { width: labelW + 'px', flexShrink: 0, borderRight: '1px solid ' + (a.gridColor || '#e5e7eb') } },
                    /* Header space */
                    el('div', { style: { height: '36px', background: a.headerBg || '#f3f4f6', borderBottom: '1px solid ' + (a.gridColor || '#e5e7eb') } }),
                    /* Task labels */
                    rows.map(function (row, ri) {
                        if (row.type === 'phase') {
                            return el('div', { key: ri, className: 'bkbg-gant-label-cell is-phase', style: { height: rowH + 'px', display: 'flex', alignItems: 'center', paddingLeft: '8px', paddingRight: '8px', background: a.headerBg || '#f3f4f6', borderBottom: '1px solid ' + (a.gridColor || '#e5e7eb'), color: a.phaseColor || '#6b7280', boxSizing: 'border-box' } }, row.label);
                        }
                        var t = row.task;
                        return el('div', { key: ri, className: 'bkbg-gant-label-cell is-task', style: { height: rowH + 'px', display: 'flex', alignItems: 'center', paddingLeft: t.milestone ? '8px' : '16px', paddingRight: '8px', color: a.labelColor || '#111827', borderBottom: '1px solid ' + (a.gridColor || '#e5e7eb'), boxSizing: 'border-box', background: ri % 2 === 0 ? (a.rowBg || '#fff') : (a.rowAltBg || '#f9fafb') } },
                            el('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 } }, (t.milestone ? '◆ ' : '') + (t.name || '')),
                            a.showAssignee && t.assignee && el('span', { style: { fontSize: '10px', color: '#9ca3af', marginLeft: '6px', flexShrink: 0 } }, t.assignee)
                        );
                    })
                ),

                /* Chart area */
                el('div', { style: { flex: 1, position: 'relative', overflow: 'hidden' } },
                    /* Month headers */
                    el('div', { style: { display: 'flex', height: '36px', background: a.headerBg || '#f3f4f6', borderBottom: '1px solid ' + (a.gridColor || '#e5e7eb'), position: 'relative' } },
                        headers.map(function (h, hi) {
                            return el('div', {
                                key: hi,
                                className: 'bkbg-gant-col-header',
                                style: {
                                    flex: h.days,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: a.headerColor || '#374151',
                                    borderLeft: hi > 0 ? '1px solid ' + (a.gridColor || '#e5e7eb') : 'none',
                                    overflow: 'hidden', whiteSpace: 'nowrap', paddingLeft: '4px'
                                }
                            }, h.label);
                        })
                    ),

                    /* Task rows (grid + bars) */
                    el('div', { style: { position: 'relative' } },
                        rows.map(function (row, ri) {
                            var isPhase = row.type === 'phase';
                            var bg = isPhase ? (a.headerBg || '#f3f4f6') : (ri % 2 === 0 ? (a.rowBg || '#fff') : (a.rowAltBg || '#f9fafb'));

                            if (isPhase) {
                                return el('div', { key: ri, style: { height: rowH + 'px', background: bg, borderBottom: '1px solid ' + (a.gridColor || '#e5e7eb'), position: 'relative' } });
                            }

                            var t = row.task;
                            var pos = getTaskPosition(t, bounds.start, totalDays);

                            if (t.milestone) {
                                return el('div', { key: ri, style: { height: rowH + 'px', background: bg, borderBottom: '1px solid ' + (a.gridColor || '#e5e7eb'), position: 'relative' } },
                                    el('div', {
                                        style: {
                                            position: 'absolute',
                                            left: 'calc(' + pos.left + '% - 8px)',
                                            top: '50%', transform: 'translateY(-50%) rotate(45deg)',
                                            width: '14px', height: '14px',
                                            background: t.color || (a.milestoneColor || '#f59e0b'),
                                            zIndex: 1
                                        }
                                    })
                                );
                            }

                            return el('div', { key: ri, style: { height: rowH + 'px', background: bg, borderBottom: '1px solid ' + (a.gridColor || '#e5e7eb'), position: 'relative', display: 'flex', alignItems: 'center' } },
                                el('div', {
                                    style: {
                                        position: 'absolute',
                                        left: pos.left + '%',
                                        width: pos.width + '%',
                                        height: rowH * 0.55 + 'px',
                                        background: t.color || '#6366f1',
                                        borderRadius: (a.taskRadius || 4) + 'px',
                                        overflow: 'hidden',
                                        zIndex: 1
                                    }
                                },
                                    /* Progress fill */
                                    a.showProgress && t.completed > 0 && el('div', {
                                        style: {
                                            position: 'absolute', left: 0, top: 0, bottom: 0,
                                            width: t.completed + '%',
                                            background: 'rgba(0,0,0,0.2)'
                                        }
                                    })
                                )
                            );
                        }),

                        /* Today line */
                        showToday && el('div', {
                            style: {
                                position: 'absolute',
                                top: 0, bottom: 0,
                                left: todayLeft + '%',
                                width: '2px',
                                background: a.todayLine || '#ef4444',
                                zIndex: 2,
                                pointerEvents: 'none'
                            }
                        })
                    )
                )
            ),

            /* Legend */
            a.showLegend && el('div', { style: { marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', paddingLeft: '4px' } },
                el('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    el('div', { style: { width: '24px', height: '8px', background: '#6366f1', borderRadius: '4px' } }),
                    'Task bar'
                ),
                el('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    el('div', { style: { width: '10px', height: '10px', background: a.milestoneColor || '#f59e0b', transform: 'rotate(45deg)' } }),
                    'Milestone'
                ),
                a.highlightToday && el('span', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    el('div', { style: { width: '2px', height: '14px', background: a.todayLine || '#ef4444' } }),
                    'Today'
                )
            )
        );
    }

    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function moveItem(arr, from, to) {
        var a = arr.slice();
        var item = a.splice(from, 1)[0];
        a.splice(to, 0, item);
        return a;
    }

    /* ── TaskEditor ── */
    function TaskEditor(props) {
        var tasks = props.tasks;
        var onChange = props.onChange;
        var activeIdx = props.activeIdx;
        var setActiveIdx = props.setActiveIdx;

        function addTask() {
            var today = new Date();
            var start = today.getUTCFullYear() + '-' + pad2(today.getUTCMonth() + 1) + '-' + pad2(today.getUTCDate());
            var endD = addDays(today, 7);
            var end = endD.getUTCFullYear() + '-' + pad2(endD.getUTCMonth() + 1) + '-' + pad2(endD.getUTCDate());
            onChange(tasks.concat([{ id: 't' + Date.now(), name: 'New Task', phase: 'Phase 1', startDate: start, endDate: end, color: '#6366f1', milestone: false, completed: 0, assignee: '' }]));
            setActiveIdx(tasks.length);
        }

        return el(Fragment, null,
            tasks.map(function (t, idx) {
                var isOpen = idx === activeIdx;
                return el('div', {
                    key: idx,
                    style: { border: '1px solid ' + (isOpen ? '#6366f1' : '#e5e7eb'), borderRadius: '6px', marginBottom: '4px', overflow: 'hidden' }
                },
                    el('div', {
                        style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', background: isOpen ? '#f0f0ff' : '#f9fafb', cursor: 'pointer' },
                        onClick: function () { setActiveIdx(isOpen ? -1 : idx); }
                    },
                        el('div', { style: { width: '10px', height: '10px', borderRadius: t.milestone ? '0' : '3px', background: t.color || '#6366f1', flexShrink: 0, transform: t.milestone ? 'rotate(45deg)' : 'none' } }),
                        el('span', { style: { flex: 1, fontSize: '11px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, t.name || 'Task ' + (idx + 1)),
                        el('span', { style: { fontSize: '10px', color: '#9ca3af', flexShrink: 0 } }, t.phase),
                        el(Button, { icon: 'arrow-up-alt2', isSmall: true, disabled: idx === 0, onClick: function (e) { e.stopPropagation(); onChange(moveItem(tasks, idx, idx - 1)); setActiveIdx(idx - 1); } }),
                        el(Button, { icon: 'arrow-down-alt2', isSmall: true, disabled: idx === tasks.length - 1, onClick: function (e) { e.stopPropagation(); onChange(moveItem(tasks, idx, idx + 1)); setActiveIdx(idx + 1); } }),
                        el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var a = tasks.slice(); a.splice(idx, 1); onChange(a); setActiveIdx(-1); } })
                    ),
                    isOpen && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                        el(TextControl, { label: __('Task Name', 'blockenberg'), value: t.name || '', onChange: function (v) { onChange(updateItem(tasks, idx, 'name', v)); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Phase / Group', 'blockenberg'), value: t.phase || '', onChange: function (v) { onChange(updateItem(tasks, idx, 'phase', v)); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { display: 'flex', gap: '8px' } },
                            el('div', { style: { flex: 1 } },
                                el(TextControl, { label: __('Start Date', 'blockenberg'), value: t.startDate || '', placeholder: 'YYYY-MM-DD', onChange: function (v) { onChange(updateItem(tasks, idx, 'startDate', v)); }, __nextHasNoMarginBottom: true })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(TextControl, { label: __('End Date', 'blockenberg'), value: t.endDate || '', placeholder: 'YYYY-MM-DD', onChange: function (v) { onChange(updateItem(tasks, idx, 'endDate', v)); }, __nextHasNoMarginBottom: true })
                            )
                        ),
                        el('div', { style: { display: 'flex', gap: '8px', alignItems: 'flex-end' } },
                            el('div', { style: { flex: 1 } },
                                el('label', { style: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' } }, __('Color', 'blockenberg')),
                                el('input', { type: 'color', value: t.color || '#6366f1', onChange: function (e) { onChange(updateItem(tasks, idx, 'color', e.target.value)); }, style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' } })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, { label: __('Progress %', 'blockenberg'), value: t.completed || 0, min: 0, max: 100, onChange: function (v) { onChange(updateItem(tasks, idx, 'completed', v)); }, __nextHasNoMarginBottom: true })
                            )
                        ),
                        el(ToggleControl, { label: __('Milestone (diamond marker)', 'blockenberg'), checked: !!t.milestone, onChange: function (v) { onChange(updateItem(tasks, idx, 'milestone', v)); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Assignee (optional)', 'blockenberg'), value: t.assignee || '', onChange: function (v) { onChange(updateItem(tasks, idx, 'assignee', v)); }, __nextHasNoMarginBottom: true })
                    )
                );
            }),
            el(Button, { variant: 'secondary', onClick: addTask, style: { marginTop: '6px', width: '100%', justifyContent: 'center' } }, __('+ Add Task', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/gantt-chart', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var taskIdxState = useState(-1);
            var taskIdx = taskIdxState[0];
            var setTaskIdx = taskIdxState[1];

            var blockProps = useBlockProps({ style: { overflowX: 'auto' } });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Tasks', 'blockenberg'), initialOpen: true },
                    el(TaskEditor, {
                        tasks: a.tasks,
                        onChange: function (v) { set({ tasks: v }); },
                        activeIdx: taskIdx,
                        setActiveIdx: setTaskIdx
                    })
                ),

                el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('View', 'blockenberg'),
                        value: a.view,
                        options: [{ value: 'month', label: 'Monthly' }, { value: 'week', label: 'Weekly' }],
                        onChange: function (v) { set({ view: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Phase Groups', 'blockenberg'), checked: a.showPhases, onChange: function (v) { set({ showPhases: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Milestones', 'blockenberg'), checked: a.showMilestones, onChange: function (v) { set({ showMilestones: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Progress Fill', 'blockenberg'), checked: a.showProgress, onChange: function (v) { set({ showProgress: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Assignee', 'blockenberg'), checked: a.showAssignee, onChange: function (v) { set({ showAssignee: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Highlight Today', 'blockenberg'), checked: a.highlightToday, onChange: function (v) { set({ highlightToday: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Legend', 'blockenberg'), checked: a.showLegend, onChange: function (v) { set({ showLegend: v }); }, __nextHasNoMarginBottom: true })
                ),

                el(PanelBody, { title: __('Dimensions', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Row Height (px)', 'blockenberg'), value: a.rowHeight, min: 28, max: 80, onChange: function (v) { set({ rowHeight: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Label Column Width (px)', 'blockenberg'), value: a.labelWidth, min: 100, max: 400, step: 10, onChange: function (v) { set({ labelWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Task Bar Radius', 'blockenberg'), value: a.taskRadius, min: 0, max: 20, onChange: function (v) { set({ taskRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Max Width (0 = full)', 'blockenberg'), value: a.maxWidth, min: 0, max: 1400, step: 20, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc()({ label: __('Task Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { set({ typoLabel: v }); } }),
                    _tc()({ label: __('Header', 'blockenberg'), value: a.typoHeader, onChange: function (v) { set({ typoHeader: v }); } })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v }); }, label: __('Section Background', 'blockenberg') },
                        { value: a.headerBg, onChange: function (v) { set({ headerBg: v }); }, label: __('Header / Phase Background', 'blockenberg') },
                        { value: a.rowBg, onChange: function (v) { set({ rowBg: v }); }, label: __('Row Background', 'blockenberg') },
                        { value: a.rowAltBg, onChange: function (v) { set({ rowAltBg: v }); }, label: __('Alternating Row Background', 'blockenberg') },
                        { value: a.gridColor, onChange: function (v) { set({ gridColor: v }); }, label: __('Grid Lines', 'blockenberg') },
                        { value: a.headerColor, onChange: function (v) { set({ headerColor: v }); }, label: __('Header Text', 'blockenberg') },
                        { value: a.labelColor, onChange: function (v) { set({ labelColor: v }); }, label: __('Task Label Color', 'blockenberg') },
                        { value: a.phaseColor, onChange: function (v) { set({ phaseColor: v }); }, label: __('Phase Label Color', 'blockenberg') },
                        { value: a.todayLine, onChange: function (v) { set({ todayLine: v }); }, label: __('Today Indicator', 'blockenberg') },
                        { value: a.milestoneColor, onChange: function (v) { set({ milestoneColor: v }); }, label: __('Milestone Color', 'blockenberg') }
                    ]
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el(GanttPreview, { attributes: a })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-gant-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
