( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    /* ── Build SVG path string ── */
    function buildPath(attr) {
        var W = attr.svgWidth, H = attr.svgHeight;
        var type = attr.pathType;

        if (type === 'arc') {
            var r = attr.arcRadius;
            var cx = W / 2;
            var cy = attr.arcDirection === 'top' ? r + 20 : H - r - 20;
            // Large arc from left to right
            var x1 = cx - r, x2 = cx + r;
            var sweep = attr.arcDirection === 'top' ? 1 : 0;
            return 'M ' + x1 + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + x2 + ' ' + cy;
        }

        if (type === 'wave') {
            var amp  = attr.waveAmplitude;
            var freq = attr.waveFrequency;
            var midY = H / 2;
            var step = W / (freq * 2);
            var d = 'M 0 ' + midY;
            for (var i = 0; i < freq * 2; i++) {
                var cpX = step * (i + 0.5);
                var cpY = i % 2 === 0 ? midY - amp : midY + amp;
                var eX  = step * (i + 1);
                var eY  = midY;
                d += ' Q ' + cpX + ' ' + cpY + ' ' + eX + ' ' + eY;
            }
            return d;
        }

        if (type === 'circle') {
            var cr = Math.min(W, H) / 2 - 20;
            var ccx = W / 2, ccy = H / 2;
            return 'M ' + (ccx - cr) + ' ' + ccy +
                   ' A ' + cr + ' ' + cr + ' 0 1 1 ' + (ccx + cr) + ' ' + ccy +
                   ' A ' + cr + ' ' + cr + ' 0 1 1 ' + (ccx - cr) + ' ' + ccy;
        }

        if (type === 'scurve') {
            var midX = W / 2, sH = H;
            return 'M 0 ' + (sH * 0.7) + ' C ' + (midX * 0.5) + ' ' + (sH * 0.7) + ' ' + (midX * 0.5) + ' ' + (sH * 0.3) + ' ' + midX + ' ' + (sH * 0.5) + ' S ' + (midX + midX * 0.5) + ' ' + (sH * 0.8) + ' ' + W + ' ' + (sH * 0.3);
        }

        return 'M 0 ' + (H / 2) + ' L ' + W + ' ' + (H / 2);
    }

    /* ── Build SVG preview ── */
    function buildSVGPreview(attr) {
        var W = attr.svgWidth, H = attr.svgHeight;
        var pathId = 'bkbg-tp-path-preview';
        var pathD = buildPath(attr);

        var pathEl = el('path', {
            id: pathId,
            d: pathD,
            fill: 'none',
            stroke: attr.showPath ? attr.pathStrokeColor : 'none',
            strokeWidth: attr.showPath ? attr.pathStrokeWidth : 0
        });

        var textOnPath = el('text', {
            fill: attr.textColor
        },
            el('textPath', {
                href: '#' + pathId,
                startOffset: attr.startOffset + '%',
                textAnchor: attr.textAnchor
            }, attr.text)
        );

        return el('svg', {
            viewBox: '0 0 ' + W + ' ' + H,
            width: '100%',
            height: H + 'px',
            xmlns: 'http://www.w3.org/2000/svg',
            style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' }
        }, pathEl, textOnPath);
    }

    registerBlockType('blockenberg/text-path', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = { background: attr.sectionBg || undefined, textAlign: attr.align2 || 'center' };
                Object.assign(s, _tvf(attr.titleTypo, '--bktp-tt-'));
                return { style: s };
            })());

            var inspector = el(InspectorControls, {},
                /* Text & Path */
                el(PanelBody, { title: __('Text & Path', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Text', 'blockenberg'),
                        value: attr.text,
                        onChange: function (v) { setAttr({ text: v }); },
                        help: __('Add • or | between repetitions for circular paths.', 'blockenberg'),
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '12px' } }),
                    el(SelectControl, {
                        label: __('Path Shape', 'blockenberg'),
                        value: attr.pathType,
                        options: [
                            { label: 'Arc (Bow)', value: 'arc' },
                            { label: 'Wave', value: 'wave' },
                            { label: 'Circle', value: 'circle' },
                            { label: 'S-Curve', value: 'scurve' }
                        ],
                        onChange: function (v) { setAttr({ pathType: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } }),
                    attr.pathType === 'arc' && el('div', {},
                        el(RangeControl, { label: __('Arc Radius (px)', 'blockenberg'), value: attr.arcRadius, min: 50, max: 600, onChange: function (v) { setAttr({ arcRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: '8px' } }),
                        el(SelectControl, {
                            label: __('Arc Direction', 'blockenberg'),
                            value: attr.arcDirection,
                            options: [{ label: 'Bow Up (text on top)', value: 'top' }, { label: 'Bow Down (text underneath)', value: 'bottom' }],
                            onChange: function (v) { setAttr({ arcDirection: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    attr.pathType === 'wave' && el('div', {},
                        el(RangeControl, { label: __('Wave Amplitude (px)', 'blockenberg'), value: attr.waveAmplitude, min: 5, max: 120, onChange: function (v) { setAttr({ waveAmplitude: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: '8px' } }),
                        el(RangeControl, { label: __('Wave Frequency', 'blockenberg'), value: attr.waveFrequency, min: 1, max: 6, onChange: function (v) { setAttr({ waveFrequency: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('SVG Width (px)', 'blockenberg'), value: attr.svgWidth, min: 300, max: 1400, onChange: function (v) { setAttr({ svgWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('SVG Height (px)', 'blockenberg'), value: attr.svgHeight, min: 80, max: 600, onChange: function (v) { setAttr({ svgHeight: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Text Start Offset (%)', 'blockenberg'), value: attr.startOffset, min: 0, max: 100, onChange: function (v) { setAttr({ startOffset: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(SelectControl, {
                        label: __('Text Anchor', 'blockenberg'),
                        value: attr.textAnchor,
                        options: [{ label: 'Start', value: 'start' }, { label: 'Middle', value: 'middle' }, { label: 'End', value: 'end' }],
                        onChange: function (v) { setAttr({ textAnchor: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && getTypoControl()({
                        label: __('Text', 'blockenberg'),
                        value: attr.titleTypo || {},
                        onChange: function (v) { setAttr({ titleTypo: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'),
                        value: attr.align2,
                        options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }],
                        onChange: function (v) { setAttr({ align2: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                /* Path Stroke */
                el(PanelBody, { title: __('Path Stroke', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Path Line', 'blockenberg'), checked: attr.showPath, onChange: function (v) { setAttr({ showPath: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showPath && el('div', {},
                        el('div', { style: { marginTop: '8px' } }),
                        el(RangeControl, { label: __('Stroke Width (px)', 'blockenberg'), value: attr.pathStrokeWidth, min: 1, max: 10, onChange: function (v) { setAttr({ pathStrokeWidth: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),
                /* Animation */
                el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Animate Text Along Path', 'blockenberg'), checked: attr.animate, onChange: function (v) { setAttr({ animate: v }); }, __nextHasNoMarginBottom: true }),
                    attr.animate && el('div', {},
                        el('div', { style: { marginTop: '8px' } }),
                        el(RangeControl, { label: __('Animation Duration (s)', 'blockenberg'), value: attr.animateDuration, min: 2, max: 60, onChange: function (v) { setAttr({ animateDuration: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: '8px' } }),
                        el(SelectControl, {
                            label: __('Repeat', 'blockenberg'),
                            value: attr.repeatCount,
                            options: [{ label: 'Infinite', value: 'indefinite' }, { label: '1×', value: '1' }, { label: '2×', value: '2' }, { label: '3×', value: '3' }],
                            onChange: function (v) { setAttr({ repeatCount: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    )
                ),
                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Text Color', 'blockenberg'), value: attr.textColor, onChange: function (v) { setAttr({ textColor: v || '#0f172a' }); } },
                        { label: __('Path Stroke Color', 'blockenberg'), value: attr.pathStrokeColor, onChange: function (v) { setAttr({ pathStrokeColor: v || '#e2e8f0' }); } },
                        { label: __('Section Background', 'blockenberg'), value: attr.sectionBg, onChange: function (v) { setAttr({ sectionBg: v || '' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-tp-wrap', style: { textAlign: attr.align2 || 'center' } },
                    buildSVGPreview(attr)
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = useBlockProps.save((function () {
                var s = {};
                Object.assign(s, _tvf(attr.titleTypo, '--bktp-tt-'));
                return { style: s };
            })());
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-tp-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
