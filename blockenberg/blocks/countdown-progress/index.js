( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _cdpTC, _cdpTV;
    function _tc() { return _cdpTC || (_cdpTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cdpTV || (_cdpTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    /* Helpers for the editor SVG preview */
    function svgRing(pct, radius, strokeWidth, ringBg, ringColor, num, unit, labelColor, numColor, showLabel) {
        var cx = radius + strokeWidth;
        var cy = radius + strokeWidth;
        var size = (radius + strokeWidth) * 2;
        var circumference = 2 * Math.PI * radius;
        var dash = pct * circumference;
        return el('div', { className: 'bkbg-cdp-ring-wrap' },
            el('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, xmlns: 'http://www.w3.org/2000/svg' },
                el('circle', { cx: cx, cy: cy, r: radius, stroke: ringBg, strokeWidth: strokeWidth, fill: 'none', strokeLinecap: 'round' }),
                el('circle', { cx: cx, cy: cy, r: radius, stroke: ringColor, strokeWidth: strokeWidth, fill: 'none', strokeLinecap: 'round', strokeDasharray: circumference, strokeDashoffset: circumference - dash, style: { transform: 'rotate(-90deg)', transformOrigin: 'center' } })
            ),
            el('div', { className: 'bkbg-cdp-ring-labels', style: { color: numColor } },
                el('span', { className: 'bkbg-cdp-num' }, String(num).padStart(2, '0')),
                showLabel && el('span', { className: 'bkbg-cdp-unit', style: { color: labelColor } }, unit)
            )
        );
    }

    function barUnit(pct, barBg, barColor, num, unit, labelColor, numColor, showLabel) {
        return el('div', { className: 'bkbg-cdp-bar-unit' },
            el('div', { className: 'bkbg-cdp-bar-num', style: { color: numColor } }, String(num).padStart(2, '0')),
            showLabel && el('div', { className: 'bkbg-cdp-bar-label', style: { color: labelColor } }, unit),
            el('div', { className: 'bkbg-cdp-bar-track', style: { background: barBg } },
                el('div', { className: 'bkbg-cdp-bar-fill', style: { background: barColor, width: (pct * 100) + '%' } })
            )
        );
    }

    registerBlockType('blockenberg/countdown-progress', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            /* Static preview: show a sample of 14d 6h 30m 45s */
            var previewData = [
                { show: attr.showDays, pct: 14/30, num: 14, unit: 'Days' },
                { show: attr.showHours, pct: 6/24, num: 6, unit: 'Hours' },
                { show: attr.showMins, pct: 30/60, num: 30, unit: 'Mins' },
                { show: attr.showSecs, pct: 45/60, num: 45, unit: 'Secs' }
            ];

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Heading', 'blockenberg'), value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Subtext', 'blockenberg'), value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('End Date (YYYY-MM-DDTHH:mm:ss)', 'blockenberg'), value: attr.endDate, onChange: function (v) { setAttr({ endDate: v }); }, placeholder: '2025-12-31T23:59:59', __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Display Style', 'blockenberg'), value: attr.style, options: [{ label: 'Rings (SVG)', value: 'ring' }, { label: 'Bars', value: 'bar' }], onChange: function (v) { setAttr({ style: v }); }, __nextHasNoMarginBottom: true }),
                        attr.style === 'ring' && el(RangeControl, { label: __('Ring Radius', 'blockenberg'), value: attr.radius, min: 30, max: 100, onChange: function (v) { setAttr({ radius: v }); }, __nextHasNoMarginBottom: true }),
                        attr.style === 'ring' && el(RangeControl, { label: __('Stroke Width', 'blockenberg'), value: attr.strokeWidth, min: 4, max: 20, onChange: function (v) { setAttr({ strokeWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width', 'blockenberg'), value: attr.maxWidth, min: 400, max: 1400, step: 20, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Units', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Days', 'blockenberg'), checked: attr.showDays, onChange: function (v) { setAttr({ showDays: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Hours', 'blockenberg'), checked: attr.showHours, onChange: function (v) { setAttr({ showHours: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Minutes', 'blockenberg'), checked: attr.showMins, onChange: function (v) { setAttr({ showMins: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Seconds', 'blockenberg'), checked: attr.showSecs, onChange: function (v) { setAttr({ showSecs: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Labels', 'blockenberg'), checked: attr.showLabels, onChange: function (v) { setAttr({ showLabels: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); } },
                            { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#ffffff' }); } },
                            { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#94a3b8' }); } },
                            { label: __('Ring / Bar Fill', 'blockenberg'), value: attr.ringColor, onChange: function (v) { setAttr({ ringColor: v || '#6366f1', barColor: v || '#6366f1' }); } },
                            { label: __('Ring / Bar Track', 'blockenberg'), value: attr.ringBg, onChange: function (v) { setAttr({ ringBg: v || '#1e293b', barBg: v || '#1e293b' }); } },
                            { label: __('Number', 'blockenberg'), value: attr.numColor, onChange: function (v) { setAttr({ numColor: v || '#ffffff' }); } },
                            { label: __('Unit Label', 'blockenberg'), value: attr.labelColor, onChange: function (v) { setAttr({ labelColor: v || '#94a3b8' }); } }
                        ]
                    }),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Heading', 'blockenberg'), value: attr.typoHeading, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                        _tc() && el(_tc(), { label: __('Subtext', 'blockenberg'), value: attr.typoSub, onChange: function (v) { setAttr({ typoSub: v }); } }),
                        _tc() && el(_tc(), { label: __('Number', 'blockenberg'), value: attr.typoNum, onChange: function (v) { setAttr({ typoNum: v }); } }),
                        _tc() && el(_tc(), { label: __('Unit Label', 'blockenberg'), value: attr.typoUnit, onChange: function (v) { setAttr({ typoUnit: v }); } })
                    )
                ),
                el('div', Object.assign(useBlockProps({ className: 'bkbg-cdp-editor', style: Object.assign({ background: attr.bgColor }, _tv(attr.typoHeading, '--bkbg-cdp-h-'), _tv(attr.typoSub, '--bkbg-cdp-sub-'), _tv(attr.typoNum, '--bkbg-cdp-num-'), _tv(attr.typoUnit, '--bkbg-cdp-unit-')) })),
                    el('div', { className: 'bkbg-cdp-inner', style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: attr.paddingTop + 'px 24px ' + attr.paddingBottom + 'px', textAlign: 'center' } },
                        el(RichText, { tagName: 'h2', className: 'bkbg-cdp-heading', style: { color: attr.headingColor }, value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg') }),
                        el(RichText, { tagName: 'p', className: 'bkbg-cdp-sub', style: { color: attr.subColor }, value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg') }),
                        el('div', { className: 'bkbg-cdp-units style-' + attr.style },
                            previewData.map(function (d, i) {
                                if (!d.show) return null;
                                return attr.style === 'ring'
                                    ? svgRing(d.pct, attr.radius, attr.strokeWidth, attr.ringBg, attr.ringColor, d.num, d.unit, attr.labelColor, attr.numColor, attr.showLabels)
                                    : barUnit(d.pct, attr.barBg, attr.barColor, d.num, d.unit, attr.labelColor, attr.numColor, attr.showLabels);
                            })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cdp-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
