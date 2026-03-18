( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl } = window.wp.components;
    const { __ } = window.wp.i18n;

    /* ── Typography lazy getters ──────────────────────────────── */
    var _ttTC, _ttTV;
    function _tc() { return _ttTC || (_ttTC = window.bkbgTypographyControl); }
    function _tv() { return _ttTV || (_ttTV = window.bkbgTypoCssVars); }

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DAY_LABELS = ['','Mon','','Wed','','Fri',''];

    // Deterministic pseudo-random from seed
    function seededRand(seed) {
        let s = seed;
        return function () {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            return (s >>> 0) / 0xffffffff;
        };
    }

    // Generate 365-day activity data
    function genData(year, seed, maxVal) {
        const rand = seededRand(seed);
        const start = new Date(year, 0, 1);
        const days = [];
        let d = new Date(start);
        while (d.getFullYear() === year) {
            // cluster activity — busier mid-week
            const dow = d.getDay(); // 0=Sun
            const weekBias = (dow >= 1 && dow <= 5) ? 1.4 : 0.5;
            const r = rand();
            const val = r < 0.35 ? 0 : Math.round(r * weekBias * maxVal);
            days.push({ date: new Date(d), value: Math.min(val, maxVal) });
            d.setDate(d.getDate() + 1);
        }
        return days;
    }

    // Group days into weeks (columns), each starting Sunday
    function buildWeeks(days) {
        const weeks = [];
        // Pad so first day is on its correct DOW
        const firstDow = days[0].date.getDay(); // 0=Sun
        let week = Array(firstDow).fill(null);
        days.forEach(day => {
            week.push(day);
            if (week.length === 7) { weeks.push(week); week = []; }
        });
        if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }
        return weeks;
    }

    function levelColor(val, maxVal, a) {
        if (val === 0)              return a.color0;
        if (val <= maxVal * 0.25)   return a.color1;
        if (val <= maxVal * 0.50)   return a.color2;
        if (val <= maxVal * 0.75)   return a.color3;
        return a.color4;
    }

    // Month label positions (week index where month starts)
    function monthPositions(weeks) {
        const pos = [];
        weeks.forEach((week, wi) => {
            const firstReal = week.find(d => d);
            if (!firstReal) return;
            const d = firstReal.date;
            if (d.getDate() <= 7) {
                pos.push({ label: MONTHS[d.getMonth()], week: wi });
            }
        });
        return pos;
    }

    // ── Render the grid (used in both edit & save) ─────────────────────
    function renderGrid(a) {
        const days  = genData(a.year, a.seed, a.maxValue);
        const weeks = buildWeeks(days);
        const cs    = a.cellSize;
        const gap   = a.cellGap;
        const dayLabelW = a.showDayLabels ? 28 : 0;
        const monthLabelH = a.showMonths ? 20 : 0;
        const totalW = dayLabelW + weeks.length * (cs + gap);
        const totalH = monthLabelH + 7 * (cs + gap);
        const mPos   = monthPositions(weeks);

        return el('div', { className: 'bkbg-hmc-grid-wrap', style: { overflowX: 'auto' } },
            el('div', {
                className: 'bkbg-hmc-grid',
                style: { display: 'inline-flex', flexDirection: 'column', position: 'relative' }
            },
                // Month row
                a.showMonths && el('div', {
                    className: 'bkbg-hmc-months',
                    style: { display: 'flex', marginLeft: dayLabelW + 'px', marginBottom: '4px', height: '16px', position: 'relative' }
                },
                    mPos.map((m, i) =>
                        el('span', {
                            key: i,
                            style: {
                                position: 'absolute',
                                left: m.week * (cs + gap) + 'px',
                                fontSize: '12px',
                                color: a.labelColor,
                                fontFamily: 'inherit',
                                whiteSpace: 'nowrap',
                            }
                        }, m.label)
                    )
                ),
                // Day labels + columns row
                el('div', { style: { display: 'flex', gap: '0' } },
                    // Day-of-week labels
                    a.showDayLabels && el('div', {
                        style: { display: 'flex', flexDirection: 'column', width: dayLabelW + 'px', marginRight: '0' }
                    },
                        DAY_LABELS.map((lbl, i) =>
                            el('div', {
                                key: i,
                                style: {
                                    height: (cs + gap) + 'px', lineHeight: (cs + gap) + 'px',
                                    fontSize: '11px', color: a.labelColor,
                                    textAlign: 'right', paddingRight: '6px',
                                    fontFamily: 'inherit',
                                }
                            }, lbl)
                        )
                    ),
                    // Weeks columns
                    weeks.map((week, wi) =>
                        el('div', {
                            key: wi,
                            style: { display: 'flex', flexDirection: 'column', gap: gap + 'px', marginRight: gap + 'px' }
                        },
                            week.map((day, di) =>
                                el('div', {
                                    key: di,
                                    title: day ? `${day.date.toDateString()}: ${day.value}` : '',
                                    style: {
                                        width: cs + 'px', height: cs + 'px',
                                        borderRadius: a.cellRadius + 'px',
                                        background: day ? levelColor(day.value, a.maxValue, a) : 'transparent',
                                        flexShrink: 0,
                                    }
                                })
                            )
                        )
                    )
                )
            )
        );
    }

    // ── Legend ─────────────────────────────────────────────────────────
    function renderLegend(a) {
        const cs = a.cellSize;
        return el('div', { className: 'bkbg-hmc-legend', style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' } },
            el('span', { style: { fontSize: '12px', color: a.labelColor } }, __('Less')),
            [a.color0, a.color1, a.color2, a.color3, a.color4].map((c, i) =>
                el('div', {
                    key: i,
                    style: { width: cs + 'px', height: cs + 'px', borderRadius: a.cellRadius + 'px', background: c }
                })
            ),
            el('span', { style: { fontSize: '12px', color: a.labelColor } }, __('More')),
        );
    }

    // ── Wrapper style ──────────────────────────────────────────────────
    function wrapStyle(a) {
        return Object.assign({
            background: a.bgColor,
            borderRadius: a.borderRadius + 'px',
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            paddingLeft: '28px',
            paddingRight: '28px',
        }, _tv() && _tv()(a.typoTitle, '--bkbg-hmc-tt-'), _tv() && _tv()(a.typoSubtitle, '--bkbg-hmc-st-'));
    }

    registerBlockType('blockenberg/heatmap-calendar', {
        edit: function ({ attributes: a, setAttributes }) {
            const blockProps = useBlockProps({ style: wrapStyle(a) });

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Content'), initialOpen: true },
                        el(TextControl, { label: __('Title'), value: a.title, onChange: v => setAttributes({ title: v }) }),
                        el(ToggleControl, { label: __('Show title'), checked: a.showTitle, onChange: v => setAttributes({ showTitle: v }) }),
                        el(TextControl, { label: __('Subtitle'), value: a.subtitle, onChange: v => setAttributes({ subtitle: v }) }),
                        el(ToggleControl, { label: __('Show subtitle'), checked: a.showSubtitle, onChange: v => setAttributes({ showSubtitle: v }) }),
                        el(TextControl, { label: __('Legend label'), value: a.legendLabel, onChange: v => setAttributes({ legendLabel: v }) }),
                        el(ToggleControl, { label: __('Show legend'), checked: a.showLegend, onChange: v => setAttributes({ showLegend: v }) }),
                        el(RangeControl, { label: __('Year'), value: a.year, min: 2010, max: 2030, onChange: v => setAttributes({ year: v }) }),
                        el(RangeControl, { label: __('Max value'), value: a.maxValue, min: 5, max: 50, onChange: v => setAttributes({ maxValue: v }) }),
                        el(RangeControl, { label: __('Data seed (changes pattern)'), value: a.seed, min: 1, max: 999, onChange: v => setAttributes({ seed: v }) }),
                    ),
                    el(PanelBody, { title: __('Grid'), initialOpen: false },
                        el(RangeControl, { label: __('Cell size (px)'), value: a.cellSize, min: 8, max: 20, onChange: v => setAttributes({ cellSize: v }) }),
                        el(RangeControl, { label: __('Cell gap (px)'), value: a.cellGap, min: 1, max: 8, onChange: v => setAttributes({ cellGap: v }) }),
                        el(RangeControl, { label: __('Cell radius (px)'), value: a.cellRadius, min: 0, max: 6, onChange: v => setAttributes({ cellRadius: v }) }),
                        el(ToggleControl, { label: __('Show month labels'), checked: a.showMonths, onChange: v => setAttributes({ showMonths: v }) }),
                        el(ToggleControl, { label: __('Show day labels'), checked: a.showDayLabels, onChange: v => setAttributes({ showDayLabels: v }) }),
                    ),
                    el(PanelBody, { title: __('Spacing'), initialOpen: false },
                        el(RangeControl, { label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, onChange: v => setAttributes({ borderRadius: v }) }),
                        el(RangeControl, { label: __('Padding top'), value: a.paddingTop, min: 0, max: 120, onChange: v => setAttributes({ paddingTop: v }) }),
                        el(RangeControl, { label: __('Padding bottom'), value: a.paddingBottom, min: 0, max: 120, onChange: v => setAttributes({ paddingBottom: v }) }),
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        _tc() && _tc()({ label: __('Title','blockenberg'), value: a.typoTitle, onChange: v => setAttributes({ typoTitle: v }) }),
                        _tc() && _tc()({ label: __('Subtitle','blockenberg'), value: a.typoSubtitle, onChange: v => setAttributes({ typoSubtitle: v }) })
                    ),
                    el(PanelColorSettings, {
                        title: __('Heat Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Level 0 (empty)'), value: a.color0, onChange: v => setAttributes({ color0: v || '#ebedf0' }) },
                            { label: __('Level 1 (low)'),   value: a.color1, onChange: v => setAttributes({ color1: v || '#9be9a8' }) },
                            { label: __('Level 2'),          value: a.color2, onChange: v => setAttributes({ color2: v || '#40c463' }) },
                            { label: __('Level 3'),          value: a.color3, onChange: v => setAttributes({ color3: v || '#30a14e' }) },
                            { label: __('Level 4 (high)'),  value: a.color4, onChange: v => setAttributes({ color4: v || '#216e39' }) },
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('UI Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),  value: a.bgColor,       onChange: v => setAttributes({ bgColor:       v || '#ffffff' }) },
                            { label: __('Title'),       value: a.titleColor,    onChange: v => setAttributes({ titleColor:    v || '#0f172a' }) },
                            { label: __('Subtitle'),    value: a.subtitleColor, onChange: v => setAttributes({ subtitleColor: v || '#64748b' }) },
                            { label: __('Labels'),      value: a.labelColor,    onChange: v => setAttributes({ labelColor:    v || '#6b7280' }) },
                        ]
                    }),
                ),

                a.showTitle && el('h3', { className: 'bkbg-hmc-title', style: { color: a.titleColor, margin: '0 0 6px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-hmc-subtitle', style: { color: a.subtitleColor, margin: '0 0 20px' } }, a.subtitle),
                renderGrid(a),
                a.showLegend && renderLegend(a),
            );
        },

        save: function ({ attributes: a }) {
            return el('div', {
                className: 'bkbg-hmc-wrap',
                style: wrapStyle(a),
            },
                a.showTitle && el('h3', { className: 'bkbg-hmc-title', style: { color: a.titleColor, margin: '0 0 6px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-hmc-subtitle', style: { color: a.subtitleColor, margin: '0 0 20px' } }, a.subtitle),
                renderGrid(a),
                a.showLegend && renderLegend(a),
            );
        }
    });
}() );
