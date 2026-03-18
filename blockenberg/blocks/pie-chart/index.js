( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ---- SVG pie math ---- */
    function buildPieSlices(slices, cx, cy, r) {
        const total = slices.reduce((s, sl) => s + (Number(sl.value) || 0), 0);
        if (!total) return [];
        let ang = -Math.PI / 2;
        return slices.map(sl => {
            const frac = (Number(sl.value) || 0) / total;
            const sweep = frac * 2 * Math.PI;
            const end = ang + sweep;
            const x1 = cx + r * Math.cos(ang),   y1 = cy + r * Math.sin(ang);
            const x2 = cx + r * Math.cos(end),    y2 = cy + r * Math.sin(end);
            const large = sweep > Math.PI ? 1 : 0;
            const mid = ang + sweep / 2;
            const lx = cx + (r * 0.62) * Math.cos(mid);
            const ly = cy + (r * 0.62) * Math.sin(mid);
            const pct = Math.round(frac * 100);
            const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
            ang = end;
            return { path, color: sl.color, label: sl.label, pct, lx: lx.toFixed(2), ly: ly.toFixed(2) };
        });
    }

    function renderSVG(a) {
        const half = a.size / 2;
        const r = half - 4;
        const slices = buildPieSlices(a.slices, half, half, r);
        return el('svg', {
            className: 'bkbg-piec-svg',
            width: a.size, height: a.size,
            viewBox: `0 0 ${a.size} ${a.size}`,
        },
            slices.map((s, i) =>
                el('path', {
                    key: i,
                    d: s.path,
                    fill: s.color,
                    stroke: a.strokeColor,
                    strokeWidth: a.strokeWidth,
                })
            ),
            a.showLabels && a.showPercentages && slices.map((s, i) =>
                s.pct > 5 && el('text', {
                    key: 'lbl-' + i,
                    x: s.lx, y: s.ly,
                    textAnchor: 'middle',
                    dominantBaseline: 'middle',
                    fill: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                }, s.pct + '%')
            ),
        );
    }

    function renderLegend(a) {
        return el('ul', { className: 'bkbg-piec-legend' },
            a.slices.map((s, i) =>
                el('li', { key: i, className: 'bkbg-piec-legend-item' },
                    el('span', { className: 'bkbg-piec-legend-dot', style: { background: s.color } }),
                    el('span', { className: 'bkbg-piec-legend-label' }, s.label),
                )
            )
        );
    }

    function wrapStyle(a) {
        return {
            '--bkbg-piec-bg':         a.bgColor,
            '--bkbg-piec-title-c':    a.titleColor,
            '--bkbg-piec-sub-c':      a.subtitleColor,
            '--bkbg-piec-legend-c':   a.legendColor,
            '--bkbg-piec-radius':     a.borderRadius + 'px',
            '--bkbg-piec-pt':         a.paddingTop + 'px',
            '--bkbg-piec-pb':         a.paddingBottom + 'px',
        };
    }

    function wrapStyleLegacy(a) {
        return {
            '--bkbg-piec-bg':         a.bgColor,
            '--bkbg-piec-title-c':    a.titleColor,
            '--bkbg-piec-sub-c':      a.subtitleColor,
            '--bkbg-piec-legend-c':   a.legendColor,
            '--bkbg-piec-title-sz':   a.titleSize + 'px',
            '--bkbg-piec-title-w':    a.titleWeight,
            '--bkbg-piec-sub-sz':     a.subtitleSize + 'px',
            '--bkbg-piec-legend-sz':  a.legendSize + 'px',
            '--bkbg-piec-radius':     a.borderRadius + 'px',
            '--bkbg-piec-pt':         a.paddingTop + 'px',
            '--bkbg-piec-pb':         a.paddingBottom + 'px',
        };
    }

    const LEGEND_POSITIONS = [
        { label: 'Right',   value: 'right' },
        { label: 'Bottom',  value: 'bottom' },
        { label: 'Left',    value: 'left' },
        { label: 'Top',     value: 'top' },
    ];
    const LAYOUTS = [
        { label: 'Side (chart + legend)',    value: 'side' },
        { label: 'Stacked (chart on top)',   value: 'stacked' },
    ];
    const ALIGNS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];

    registerBlockType('blockenberg/pie-chart', {
        edit: function (props) {
            const { attributes: a, setAttributes } = props;

            function updateSlice(i, key, val) {
                const next = a.slices.slice();
                next[i] = Object.assign({}, next[i], { [key]: val });
                setAttributes({ slices: next });
            }
            function removeSlice(i) { setAttributes({ slices: a.slices.filter((_, x) => x !== i) }); }
            function addSlice() {
                const colors = ['#6c3fb5','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
                setAttributes({ slices: [...a.slices, { label: 'New Slice', value: 10, color: colors[a.slices.length % colors.length] }] });
            }

            const blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = wrapStyle(a);
                Object.assign(s, tv(a.titleTypo, '--bkbg-piec-tt-'));
                Object.assign(s, tv(a.subtitleTypo, '--bkbg-piec-st-'));
                Object.assign(s, tv(a.legendTypo, '--bkbg-piec-lg-'));
                return { className: 'bkbg-piec-wrap bkbg-piec-layout--' + a.layout + ' bkbg-piec-title-align--' + a.titleAlign, style: s };
            })());

            return el('div', blockProps,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Chart Data'), initialOpen: true },
                        a.slices.map((sl, i) =>
                            el('div', { key: i, style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px', marginBottom: 8 } },
                                el(TextControl, { label: __('Label'), value: sl.label, onChange: v => updateSlice(i, 'label', v) }),
                                el(RangeControl, { label: __('Value'), value: sl.value, min: 1, max: 10000, onChange: v => updateSlice(i, 'value', v) }),
                                el('div', { style: { marginBottom: 8 } },
                                    el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, __('Color')),
                                    el('input', { type: 'color', value: sl.color, onChange: e => updateSlice(i, 'color', e.target.value), style: { width: '100%', height: 32, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' } }),
                                ),
                                a.slices.length > 2 && el(Button, { isDestructive: true, isSmall: true, onClick: () => removeSlice(i) }, __('Remove')),
                            )
                        ),
                        el(Button, { variant: 'secondary', onClick: addSlice, style: { width: '100%', justifyContent: 'center', marginTop: 8 } }, __('+ Add Slice')),
                    ),

                    el(PanelBody, { title: __('Title & Labels'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Title'), checked: a.showTitle, onChange: v => setAttributes({ showTitle: v }), __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title'), value: a.title, onChange: v => setAttributes({ title: v }) }),
                        el(ToggleControl, { label: __('Show Subtitle'), checked: a.showSubtitle, onChange: v => setAttributes({ showSubtitle: v }), __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle'), value: a.subtitle, onChange: v => setAttributes({ subtitle: v }) }),
                        el(SelectControl, { label: __('Title Align'), value: a.titleAlign, options: ALIGNS, onChange: v => setAttributes({ titleAlign: v }) }),
                        el(ToggleControl, { label: __('Show % Labels on Slices'), checked: a.showLabels && a.showPercentages, onChange: v => setAttributes({ showLabels: v, showPercentages: v }), __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Legend'), checked: a.showLegend, onChange: v => setAttributes({ showLegend: v }), __nextHasNoMarginBottom: true }),
                        a.showLegend && el(SelectControl, { label: __('Legend Position'), value: a.legendPosition, options: LEGEND_POSITIONS, onChange: v => setAttributes({ legendPosition: v }) }),
                    ),

                    el(PanelBody, { title: __('Chart Dimensions'), initialOpen: false },
                        el(RangeControl, { label: __('Chart Diameter (px)'), value: a.size, min: 140, max: 500, onChange: v => setAttributes({ size: v }) }),
                        el(RangeControl, { label: __('Stroke Width'), value: a.strokeWidth, min: 0, max: 8, onChange: v => setAttributes({ strokeWidth: v }) }),
                        el(SelectControl, { label: __('Layout'), value: a.layout, options: LAYOUTS, onChange: v => setAttributes({ layout: v }) }),
                    ),

                    el(PanelBody, { title: __('Spacing & Style'), initialOpen: false },
                        el(RangeControl, { label: __('Border Radius (px)'), value: a.borderRadius, min: 0, max: 32, onChange: v => setAttributes({ borderRadius: v }) }),
                        el(RangeControl, { label: __('Padding Top (px)'), value: a.paddingTop, min: 0, max: 160, onChange: v => setAttributes({ paddingTop: v }) }),
                        el(RangeControl, { label: __('Padding Bottom (px)'), value: a.paddingBottom, min: 0, max: 160, onChange: v => setAttributes({ paddingBottom: v }) }),

                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        el(getTypoControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: v => setAttributes({ subtitleTypo: v }) }),
                        el(getTypoControl(), { label: __('Legend', 'blockenberg'), value: a.legendTypo, onChange: v => setAttributes({ legendTypo: v }) })
                    ),
el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),    value: a.bgColor,       onChange: v => setAttributes({ bgColor:       v || '#ffffff' }) },
                            { label: __('Title'),         value: a.titleColor,    onChange: v => setAttributes({ titleColor:    v || '#0f172a' }) },
                            { label: __('Subtitle'),      value: a.subtitleColor, onChange: v => setAttributes({ subtitleColor: v || '#64748b' }) },
                            { label: __('Legend Text'),   value: a.legendColor,   onChange: v => setAttributes({ legendColor:   v || '#374151' }) },
                            { label: __('Slice Stroke'),  value: a.strokeColor,   onChange: v => setAttributes({ strokeColor:   v || '#ffffff' }) },
                        ]
                    }),
                ),

                /* ---- Canvas ---- */
                a.showTitle && el('h3', { className: 'bkbg-piec-title' }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-piec-subtitle' }, a.subtitle),
                el('div', { className: 'bkbg-piec-chart-row bkbg-piec-legend-pos--' + a.legendPosition },
                    renderSVG(a),
                    a.showLegend && renderLegend(a),
                ),
            );
        },

        save: function ({ attributes: a }) {
            var tv = getTypoCssVars();
            var s = wrapStyle(a);
            Object.assign(s, tv(a.titleTypo, '--bkbg-piec-tt-'));
            Object.assign(s, tv(a.subtitleTypo, '--bkbg-piec-st-'));
            Object.assign(s, tv(a.legendTypo, '--bkbg-piec-lg-'));
            return el('div', {
                className: 'bkbg-piec-wrap bkbg-piec-layout--' + a.layout + ' bkbg-piec-title-align--' + a.titleAlign,
                style: s,
            },
                a.showTitle && el('h3', { className: 'bkbg-piec-title' }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-piec-subtitle' }, a.subtitle),
                el('div', { className: 'bkbg-piec-chart-row bkbg-piec-legend-pos--' + a.legendPosition },
                    renderSVG(a),
                    a.showLegend && el('ul', { className: 'bkbg-piec-legend' },
                        a.slices.map((s, i) =>
                            el('li', { key: i, className: 'bkbg-piec-legend-item' },
                                el('span', { className: 'bkbg-piec-legend-dot', style: { background: s.color } }),
                                el('span', { className: 'bkbg-piec-legend-label' }, s.label),
                            )
                        )
                    ),
                ),
            );
        },

        deprecated: [
            {
                attributes: {
                    title:            { type: 'string',  default: 'Revenue by Channel' },
                    showTitle:        { type: 'boolean', default: true },
                    subtitle:         { type: 'string',  default: 'Q1 2025 breakdown' },
                    showSubtitle:     { type: 'boolean', default: true },
                    slices:           { type: 'array',   default: [{label:'Organic Search',value:42,color:'#6c3fb5'},{label:'Direct',value:28,color:'#3b82f6'},{label:'Referral',value:18,color:'#10b981'},{label:'Social Media',value:12,color:'#f59e0b'}] },
                    size:             { type: 'integer', default: 280 },
                    showLabels:       { type: 'boolean', default: true },
                    showPercentages:  { type: 'boolean', default: true },
                    showLegend:       { type: 'boolean', default: true },
                    legendPosition:   { type: 'string',  default: 'right' },
                    strokeWidth:      { type: 'integer', default: 2 },
                    strokeColor:      { type: 'string',  default: '#ffffff' },
                    layout:           { type: 'string',  default: 'side' },
                    titleAlign:       { type: 'string',  default: 'center' },
                    borderRadius:     { type: 'integer', default: 16 },
                    paddingTop:       { type: 'integer', default: 48 },
                    paddingBottom:    { type: 'integer', default: 48 },
                    titleSize:        { type: 'integer', default: 24 },
                    titleWeight:      { type: 'integer', default: 700 },
                    subtitleSize:     { type: 'integer', default: 15 },
                    legendSize:       { type: 'integer', default: 14 },
                    bgColor:          { type: 'string',  default: '#ffffff' },
                    titleColor:       { type: 'string',  default: '#0f172a' },
                    subtitleColor:    { type: 'string',  default: '#64748b' },
                    legendColor:      { type: 'string',  default: '#374151' },
                    titleFontWeight:  { type: 'string',  default: '700' },
                    subtitleFontWeight: { type: 'string', default: '400' },
                },
                save: function ({ attributes: a }) {
                    return el('div', {
                        className: 'bkbg-piec-wrap bkbg-piec-layout--' + a.layout + ' bkbg-piec-title-align--' + a.titleAlign,
                        style: wrapStyleLegacy(a),
                    },
                        a.showTitle && el('h3', { className: 'bkbg-piec-title' }, a.title),
                        a.showSubtitle && el('p', { className: 'bkbg-piec-subtitle' }, a.subtitle),
                        el('div', { className: 'bkbg-piec-chart-row bkbg-piec-legend-pos--' + a.legendPosition },
                            renderSVG(a),
                            a.showLegend && el('ul', { className: 'bkbg-piec-legend' },
                                a.slices.map((s, i) =>
                                    el('li', { key: i, className: 'bkbg-piec-legend-item' },
                                        el('span', { className: 'bkbg-piec-legend-dot', style: { background: s.color } }),
                                        el('span', { className: 'bkbg-piec-legend-label', style: { color: a.legendColor, fontSize: a.legendSize + 'px' } }, s.label),
                                    )
                                )
                            ),
                        ),
                    );
                }
            }
        ]
    });
}() );
