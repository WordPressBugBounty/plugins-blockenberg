( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, TextareaControl } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo',    attrs, '--bkvenn-tt-');
        _tvf(v, 'subtitleTypo', attrs, '--bkvenn-st-');
        return v;
    }

    // ── SVG geometry ──────────────────────────────────────────────────
    // Two-circle venn
    function renderVenn2(a) {
        const S = a.svgSize;
        const r = S * 0.36;
        const cy = S * 0.5;
        const cx1 = S * 0.35, cx2 = S * 0.65;
        const op = a.circleOpacity;
        const fs = a.fontSize;

        return el('svg', { viewBox: `0 0 ${S} ${S}`, width: '100%', style: { maxWidth: S + 'px', display: 'block', margin: '0 auto' } },
            // Circles
            el('circle', { cx: cx1, cy, r, fill: a.circleA.color, opacity: op }),
            el('circle', { cx: cx2, cy, r, fill: a.circleB.color, opacity: op }),
            // Outlines
            el('circle', { cx: cx1, cy, r, fill: 'none', stroke: a.circleA.color, strokeWidth: 2, opacity: 0.6 }),
            el('circle', { cx: cx2, cy, r, fill: 'none', stroke: a.circleB.color, strokeWidth: 2, opacity: 0.6 }),
            // Labels
            a.showCircleLabels && el('text', { x: cx1 - r * 0.35, y: cy, textAnchor: 'middle', fill: a.circleA.color, fontSize: a.labelSize, fontWeight: 700, fontFamily: 'inherit', dominantBaseline: 'middle' }, a.circleA.label),
            a.showCircleLabels && el('text', { x: cx2 + r * 0.35, y: cy, textAnchor: 'middle', fill: a.circleB.color, fontSize: a.labelSize, fontWeight: 700, fontFamily: 'inherit', dominantBaseline: 'middle' }, a.circleB.label),
            // Overlap text
            a.showOverlapText && el('text', { x: S * 0.5, y: cy, textAnchor: 'middle', fill: a.textColor, fontSize: a.overlapSize, fontWeight: 700, fontFamily: 'inherit', dominantBaseline: 'middle' }, a.overlapAB),
        );
    }

    // Three-circle venn
    function renderVenn3(a) {
        const S = a.svgSize;
        const r = S * 0.34;
        // Centres of 3 circles arranged in a triangle
        const cpx = S / 2;
        const cpy = S / 2 - S * 0.04;
        const angle = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI / 3), -Math.PI / 2 + (4 * Math.PI / 3)];
        const dist = r * 0.6;
        const cx = [cpx + dist * Math.cos(angle[0]), cpx + dist * Math.cos(angle[1]), cpx + dist * Math.cos(angle[2])];
        const cy = [cpy + dist * Math.sin(angle[0]), cpy + dist * Math.sin(angle[1]), cpy + dist * Math.sin(angle[2])];
        const op = a.circleOpacity;
        const circles = [
            { cx: cx[0], cy: cy[0], color: a.circleA.color, label: a.circleA.label },
            { cx: cx[1], cy: cy[1], color: a.circleB.color, label: a.circleB.label },
            { cx: cx[2], cy: cy[2], color: a.circleC.color, label: a.circleC.label },
        ];
        // Overlap label positions (midpoint between circle centres + slightly toward centre)
        function midOut(i, j, pullFrac) {
            const mx = (cx[i] + cx[j]) / 2;
            const my = (cy[i] + cy[j]) / 2;
            return { x: mx + (cpx - mx) * pullFrac, y: my + (cpy - my) * pullFrac };
        }
        const pAB  = midOut(0, 1, 0.3);
        const pBC  = midOut(1, 2, 0.3);
        const pAC  = midOut(0, 2, 0.3);
        const pABC = { x: cpx, y: cpy + r * 0.05 };

        // Label positions (outside the overlapping area)
        function labelPos(i) {
            const fromCenter = r * 1.05;
            return { x: cpx + fromCenter * Math.cos(angle[i]), y: cpy + fromCenter * Math.sin(angle[i]) };
        }

        return el('svg', { viewBox: `0 0 ${S} ${S}`, width: '100%', style: { maxWidth: S + 'px', display: 'block', margin: '0 auto' } },
            // Filled circles
            circles.map((c, i) => el('circle', { key: 'f' + i, cx: c.cx, cy: c.cy, r, fill: c.color, opacity: op })),
            // Stroke outlines
            circles.map((c, i) => el('circle', { key: 'o' + i, cx: c.cx, cy: c.cy, r, fill: 'none', stroke: c.color, strokeWidth: 2, opacity: 0.6 })),
            // Circle main labels
            a.showCircleLabels && circles.map((c, i) => {
                const lp = labelPos(i);
                return el('text', {
                    key: 'lbl' + i, x: lp.x, y: lp.y,
                    textAnchor: 'middle', dominantBaseline: 'middle',
                    fill: c.color, fontSize: a.labelSize, fontWeight: 700, fontFamily: 'inherit'
                }, c.label);
            }),
            // Overlap labels
            a.showOverlapText && [
                el('text', { key: 'oAB',  x: pAB.x,  y: pAB.y,  textAnchor: 'middle', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.overlapSize, fontWeight: 600, fontFamily: 'inherit', opacity: 0.85 }, a.overlapAB),
                el('text', { key: 'oBC',  x: pBC.x,  y: pBC.y,  textAnchor: 'middle', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.overlapSize, fontWeight: 600, fontFamily: 'inherit', opacity: 0.85 }, a.overlapBC),
                el('text', { key: 'oAC',  x: pAC.x,  y: pAC.y,  textAnchor: 'middle', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.overlapSize, fontWeight: 600, fontFamily: 'inherit', opacity: 0.85 }, a.overlapAC),
                el('text', { key: 'oABC', x: pABC.x, y: pABC.y, textAnchor: 'middle', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.overlapSize + 1, fontWeight: 700, fontFamily: 'inherit' }, a.overlapABC),
            ],
        );
    }

    // ── Circle items legend ───────────────────────────────────────────
    function renderItems(a) {
        const cols = a.mode === 'three' ? [a.circleA, a.circleB, a.circleC] : [a.circleA, a.circleB];
        return el('div', { className: 'bkbg-venn-items', style: { display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '24px' } },
            cols.map((c, i) =>
                el('div', { key: i, style: { minWidth: '140px', flex: '1' } },
                    el('div', { style: { fontWeight: 700, fontSize: a.labelSize + 'px', color: c.color, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' } },
                        el('span', { style: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: c.color } }),
                        c.label
                    ),
                    (c.items || []).map((item, j) =>
                        el('div', { key: j, style: { fontSize: a.fontSize + 'px', color: a.subtitleColor, marginBottom: '4px', paddingLeft: '16px' } }, '· ' + item)
                    )
                )
            )
        );
    }

    function wrapStyle(a) {
        return { background: a.bgColor, borderRadius: a.borderRadius + 'px', paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', paddingLeft: '32px', paddingRight: '32px' };
    }

    // ── Circle editor panel ───────────────────────────────────────────
    function circlePanel(label, circle, onChange, __, el, TextControl, TextareaControl, PanelBody) {
        return el(PanelBody, { title: label, initialOpen: false },
            el(TextControl, { label: __('Label'), value: circle.label, onChange: v => onChange({ ...circle, label: v }) }),
            el('div', { style: { marginBottom: '8px' } },
                el('label', { style: { display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' } }, __('Circle Color')),
                el('input', { type: 'color', value: circle.color, style: { width: '100%', height: '36px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }, onChange: e => onChange({ ...circle, color: e.target.value }) })
            ),
            el(TextareaControl, { label: __('Items (one per line)'), value: (circle.items || []).join('\n'), rows: 4, onChange: v => onChange({ ...circle, items: v.split('\n').filter(s => s.trim()) }) }),
        );
    }

    registerBlockType('blockenberg/venn-diagram', {
        edit: function ({ attributes: a, setAttributes }) {
            const blockProps = useBlockProps((function () {
                var s = wrapStyle(a);
                Object.assign(s, getTypoCssVars(a));
                return { style: s };
            })());
            const is3 = a.mode === 'three';
            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Content'), initialOpen: true },
                        el(TextControl, { label: __('Title'), value: a.title, onChange: v => setAttributes({ title: v }) }),
                        el(ToggleControl, { label: __('Show title'), checked: a.showTitle, onChange: v => setAttributes({ showTitle: v }) }),
                        el(TextControl, { label: __('Subtitle'), value: a.subtitle, onChange: v => setAttributes({ subtitle: v }) }),
                        el(ToggleControl, { label: __('Show subtitle'), checked: a.showSubtitle, onChange: v => setAttributes({ showSubtitle: v }) }),
                        el(SelectControl, { label: __('Mode'), value: a.mode, options: [{ value: 'two', label: 'Two circles' }, { value: 'three', label: 'Three circles' }], onChange: v => setAttributes({ mode: v }) }),
                        el(ToggleControl, { label: __('Show circle labels'), checked: a.showCircleLabels, onChange: v => setAttributes({ showCircleLabels: v }) }),
                        el(ToggleControl, { label: __('Show overlap text'), checked: a.showOverlapText, onChange: v => setAttributes({ showOverlapText: v }) }),
                        el(ToggleControl, { label: __('Show item lists'), checked: a.showCircleItems, onChange: v => setAttributes({ showCircleItems: v }) }),
                    ),
                    el(PanelBody, { title: __('Overlap Text'), initialOpen: false },
                        el(TextControl, { label: is3 ? __('A ∩ B') : __('Overlap label'), value: a.overlapAB, onChange: v => setAttributes({ overlapAB: v }) }),
                        is3 && el(TextControl, { label: __('B ∩ C'), value: a.overlapBC, onChange: v => setAttributes({ overlapBC: v }) }),
                        is3 && el(TextControl, { label: __('A ∩ C'), value: a.overlapAC, onChange: v => setAttributes({ overlapAC: v }) }),
                        is3 && el(TextControl, { label: __('A ∩ B ∩ C (centre)'), value: a.overlapABC, onChange: v => setAttributes({ overlapABC: v }) }),
                    ),
                    circlePanel(__('Circle A'), a.circleA, v => setAttributes({ circleA: v }), __, el, TextControl, TextareaControl, PanelBody),
                    circlePanel(__('Circle B'), a.circleB, v => setAttributes({ circleB: v }), __, el, TextControl, TextareaControl, PanelBody),
                    is3 && circlePanel(__('Circle C'), a.circleC, v => setAttributes({ circleC: v }), __, el, TextControl, TextareaControl, PanelBody),
                    el(PanelBody, { title: __('Appearance'), initialOpen: false },
                        el(RangeControl, { label: __('Diagram size'), value: a.svgSize, min: 240, max: 600, onChange: v => setAttributes({ svgSize: v }) }),
                        el(RangeControl, { label: __('Circle opacity'), value: Math.round(a.circleOpacity * 100), min: 5, max: 60, onChange: v => setAttributes({ circleOpacity: v / 100 }) }),
                        el(RangeControl, { label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, onChange: v => setAttributes({ borderRadius: v }) }),
                        el(RangeControl, { label: __('Padding top'), value: a.paddingTop, min: 0, max: 120, onChange: v => setAttributes({ paddingTop: v }) }),
                        el(RangeControl, { label: __('Padding bottom'), value: a.paddingBottom, min: 0, max: 120, onChange: v => setAttributes({ paddingBottom: v }) }),
                    ),
                    
        el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
            getTypoControl(__('Title', 'blockenberg'), 'titleTypo', a, setAttributes),
            getTypoControl(__('Subtitle', 'blockenberg'), 'subtitleTypo', a, setAttributes),
            el(RangeControl, { label: __('Label font size'), value: a.labelSize, min: 10, max: 28, onChange: v => setAttributes({ labelSize: v }) }),
            el(RangeControl, { label: __('Overlap font size'), value: a.overlapSize, min: 8, max: 22, onChange: v => setAttributes({ overlapSize: v }) }),
            el(RangeControl, { label: __('Item font size'), value: a.fontSize, min: 10, max: 20, onChange: v => setAttributes({ fontSize: v }) })
        ),
el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),  value: a.bgColor,       onChange: v => setAttributes({ bgColor:       v || '#ffffff' }) },
                            { label: __('Title'),       value: a.titleColor,    onChange: v => setAttributes({ titleColor:    v || '#0f172a' }) },
                            { label: __('Subtitle'),    value: a.subtitleColor, onChange: v => setAttributes({ subtitleColor: v || '#64748b' }) },
                            { label: __('Text / overlaps'), value: a.textColor, onChange: v => setAttributes({ textColor:    v || '#1e293b' }) },
                        ]
                    }),
                ),

                a.showTitle && el('h3', { className: 'bkbg-venn-title', style: { color: a.titleColor, textAlign: 'center', margin: '0 0 8px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-venn-subtitle', style: { color: a.subtitleColor, textAlign: 'center', margin: '0 0 20px' } }, a.subtitle),
                is3 ? renderVenn3(a) : renderVenn2(a),
                a.showCircleItems && renderItems(a),
            );
        },

        save: function ({ attributes: a }) {
            const is3 = a.mode === 'three';
            var _saveStyle = wrapStyle(a);
            Object.assign(_saveStyle, getTypoCssVars(a));
            return el('div', { className: 'bkbg-venn-wrap', style: _saveStyle },
                a.showTitle && el('h3', { className: 'bkbg-venn-title', style: { color: a.titleColor, textAlign: 'center', margin: '0 0 8px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-venn-subtitle', style: { color: a.subtitleColor, textAlign: 'center', margin: '0 0 20px' } }, a.subtitle),
                is3 ? renderVenn3(a) : renderVenn2(a),
                a.showCircleItems && renderItems(a),
            );
        }
    });
}() );
