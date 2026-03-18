( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── SVG ring helper ──────────────────────────────────────────────────────── */
    function CircleRing(props) {
        var size = props.size, sw = props.sw, pct = props.pct, color = props.color,
            track = props.track, linecap = props.linecap, gradient = props.gradient, gradEnd = props.gradEnd, shadow = props.shadow;
        var r = (size - sw) / 2;
        var cx = size / 2, cy = size / 2;
        var circ = 2 * Math.PI * r;
        var dash = circ * (pct / 100);
        var uid = 'bkpc-g-' + color.replace('#', '');

        return el('svg', {
            width: size, height: size, viewBox: '0 0 ' + size + ' ' + size,
            style: { display: 'block', margin: '0 auto', filter: shadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none' }
        },
            gradient && el('defs', null,
                el('linearGradient', { id: uid, x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
                    el('stop', { offset: '0%', stopColor: color }),
                    el('stop', { offset: '100%', stopColor: gradEnd })
                )
            ),
            el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: track, strokeWidth: sw }),
            el('circle', {
                cx: cx, cy: cy, r: r, fill: 'none',
                stroke: gradient ? 'url(#' + uid + ')' : color,
                strokeWidth: sw,
                strokeLinecap: linecap,
                strokeDasharray: circ,
                strokeDashoffset: circ - dash,
                transform: 'rotate(-90 ' + cx + ' ' + cy + ')'
            })
        );
    }

    /* ── single card ─────────────────────────────────────────────────────────── */
    function CircleCard(props) {
        var a = props.attr, item = props.item, idx = props.idx, isEdit = props.isEdit;
        var onUpdate = props.onUpdate, onRemove = props.onRemove;
        var colorState = useState(false);
        var showColorPicker = colorState[0], setShowColorPicker = colorState[1];

        var linecap = a.ringStyle === 'round' ? 'round' : a.ringStyle === 'square' ? 'square' : 'butt';

        var cardStyle = {};
        if (a.showBackground) {
            cardStyle = {
                background: a.backgroundColor,
                borderRadius: a.backgroundRadius + 'px',
                padding: a.backgroundPadding + 'px',
                boxShadow: a.backgroundShadow ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
            };
        }

        return el('div', { className: 'bkpc-item', style: { textAlign: a.textAlign, ...cardStyle } },
            isEdit && el('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '4px' } },
                el(Button, {
                    isSmall: true, variant: 'tertiary', style: { position: 'relative' },
                    onClick: function () { setShowColorPicker(!showColorPicker); }
                }, '🎨'),
                showColorPicker && el(Popover, { onClose: function () { setShowColorPicker(false); }, placement: 'bottom-start' },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: item.color, onChange: function (v) { onUpdate(idx, 'color', v); } })
                    )
                ),
                el(Button, {
                    isSmall: true, variant: 'tertiary', isDestructive: true,
                    onClick: function () { onRemove(idx); }
                }, '×')
            ),
            el(CircleRing, {
                size: a.size, sw: a.strokeWidth, pct: item.percentage,
                color: item.color, track: a.trackColor, linecap: linecap,
                gradient: a.showGradient, gradEnd: a.gradientEnd, shadow: a.showShadow
            }),
            el('div', { className: 'bkpc-center-text', style: { textAlign: a.textAlign } },
                isEdit
                    ? el('div', { style: {
                            position: 'relative', marginTop: '-' + (a.size / 2 + 16) + 'px',
                            height: (a.size / 2 + 16) + 'px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
                        }},
                        a.showPercentage && el('div', {
                            className: 'bkpc-pct',
                            style: { color: a.percentageColor }
                        }, item.percentage + (a.suffix || '%'))
                    )
                    : null,
                isEdit && el(RangeControl, {
                    label: __('Percentage', 'blockenberg'), value: item.percentage, min: 0, max: 100,
                    onChange: function (v) { onUpdate(idx, 'percentage', v); }
                }),
                isEdit && el(TextControl, {
                    label: __('Label', 'blockenberg'), value: item.label,
                    onChange: function (v) { onUpdate(idx, 'label', v); }
                }),
                isEdit && a.showSubtext && el(TextControl, {
                    label: __('Subtext', 'blockenberg'), value: item.subtext || '',
                    onChange: function (v) { onUpdate(idx, 'subtext', v); }
                })
            ),
            !isEdit && a.showLabel && a.labelPosition === 'below' && el('p', {
                className: 'bkpc-label',
                style: { color: a.labelColor, margin: '8px 0 0' }
            }, item.label),
            !isEdit && a.showSubtext && item.subtext && el('p', {
                className: 'bkpc-subtext',
                style: { color: a.subtextColor, margin: '2px 0 0' }
            }, item.subtext)
        );
    }

    registerBlockType('blockenberg/progress-circle', {
        title: __('Progress Circle', 'blockenberg'),
        icon: 'chart-pie',
        category: 'bkbg-content',
        description: __('Animated SVG circular progress rings.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            function updateItem(idx, key, val) {
                var arr = a.items.slice();
                arr[idx] = Object.assign({}, arr[idx]);
                arr[idx][key] = val;
                setAttributes({ items: arr });
            }
            function addItem() {
                var palette = ['#6c3fb5','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
                setAttributes({ items: a.items.concat([{ label: 'New Skill', percentage: 70, color: palette[a.items.length % palette.length], subtext: '' }]) });
            }
            function removeItem(idx) {
                setAttributes({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            var ringStyleOptions = [
                { label: __('Round caps', 'blockenberg'), value: 'round' },
                { label: __('Square caps', 'blockenberg'), value: 'square' },
                { label: __('Flat caps', 'blockenberg'), value: 'flat' },
            ];
            var easingOptions = [
                { label: 'ease-in-out', value: 'ease-in-out' },
                { label: 'ease-out',    value: 'ease-out' },
                { label: 'ease-in',     value: 'ease-in' },
                { label: 'linear',      value: 'linear' },
            ];
            var alignOptions = [
                { label: __('Left', 'blockenberg'),   value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
            ];
            var labelPosOptions = [
                { label: __('Below ring', 'blockenberg'),  value: 'below' },
                { label: __('Inside ring', 'blockenberg'), value: 'inside' },
            ];
            var TC = getTypoControl();

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.pctTypo || {}, '--bkpc-pct-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkpc-lb-'));
                    Object.assign(s, _tv(a.subtextTypo || {}, '--bkpc-st-'));
                }
                return { className: 'bkpc-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    /* — Items — */
                    el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: true },
                        el('p', { style: { fontSize: '12px', color: '#6b7280', margin: '0 0 12px' } },
                            __('Edit each ring directly in the canvas below. Use the + to add more.', 'blockenberg')
                        ),
                        el(Button, { variant: 'primary', onClick: addItem, style: { width: '100%' } },
                            __('+ Add Ring', 'blockenberg'))
                    ),

                    /* — Layout — */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 8, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl, { label: __('Ring Size (px)', 'blockenberg'), value: a.size, min: 60, max: 300, onChange: function (v) { setAttributes({ size: v }); } }),
                        el(RangeControl, { label: __('Stroke Width', 'blockenberg'), value: a.strokeWidth, min: 2, max: 40, onChange: function (v) { setAttributes({ strokeWidth: v }); } }),
                        el(SelectControl, { label: __('Ring Style', 'blockenberg'), value: a.ringStyle, options: ringStyleOptions, onChange: function (v) { setAttributes({ ringStyle: v }); } }),
                        el(SelectControl, { label: __('Text Align', 'blockenberg'), value: a.textAlign, options: alignOptions, onChange: function (v) { setAttributes({ textAlign: v }); } }),
                        el(RangeControl, { label: __('Column Gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 80, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(TextControl, { label: __('Suffix (e.g. % or pts)', 'blockenberg'), value: a.suffix, onChange: function (v) { setAttributes({ suffix: v }); } })
                    ),

                    /* — Typography — */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Percentage', 'blockenberg'), checked: a.showPercentage, onChange: function (v) { setAttributes({ showPercentage: v }); }, __nextHasNoMarginBottom: true }),
                        el('hr', { style: { margin: '12px 0' } }),
                        el(ToggleControl, { label: __('Show Label', 'blockenberg'), checked: a.showLabel, onChange: function (v) { setAttributes({ showLabel: v }); }, __nextHasNoMarginBottom: true }),
                        a.showLabel && el(SelectControl, { label: __('Label Position', 'blockenberg'), value: a.labelPosition, options: labelPosOptions, onChange: function (v) { setAttributes({ labelPosition: v }); } }),
                        el('hr', { style: { margin: '12px 0' } }),
                        el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: a.showSubtext, onChange: function (v) { setAttributes({ showSubtext: v }); }, __nextHasNoMarginBottom: true }),
                        TC && a.showPercentage && el(TC, { label: __('Percentage', 'blockenberg'), value: a.pctTypo || {}, onChange: function (v) { setAttributes({ pctTypo: v }); } }),
                        TC && a.showLabel && el(TC, { label: __('Label', 'blockenberg'), value: a.labelTypo || {}, onChange: function (v) { setAttributes({ labelTypo: v }); } }),
                        TC && a.showSubtext && el(TC, { label: __('Subtext', 'blockenberg'), value: a.subtextTypo || {}, onChange: function (v) { setAttributes({ subtextTypo: v }); } })
                    ),

                    /* — Style — */
                    el(PanelBody, { title: __('Ring Style', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Gradient Fill', 'blockenberg'), checked: a.showGradient, onChange: function (v) { setAttributes({ showGradient: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Drop Shadow', 'blockenberg'), checked: a.showShadow, onChange: function (v) { setAttributes({ showShadow: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    /* — Card Background — */
                    el(PanelBody, { title: __('Card Background', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Card Background', 'blockenberg'), checked: a.showBackground, onChange: function (v) { setAttributes({ showBackground: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBackground && el(RangeControl, { label: __('Corner Radius', 'blockenberg'), value: a.backgroundRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ backgroundRadius: v }); } }),
                        a.showBackground && el(RangeControl, { label: __('Padding', 'blockenberg'), value: a.backgroundPadding, min: 0, max: 60, onChange: function (v) { setAttributes({ backgroundPadding: v }); } }),
                        a.showBackground && el(ToggleControl, { label: __('Card Shadow', 'blockenberg'), checked: a.backgroundShadow, onChange: function (v) { setAttributes({ backgroundShadow: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    /* — Animation — */
                    el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Animate on Scroll', 'blockenberg'), checked: a.animateOnScroll, onChange: function (v) { setAttributes({ animateOnScroll: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Counter Animation', 'blockenberg'), checked: a.counterAnimation, onChange: function (v) { setAttributes({ counterAnimation: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Duration (ms)', 'blockenberg'), value: a.animationDuration, min: 300, max: 3000, step: 100, onChange: function (v) { setAttributes({ animationDuration: v }); } }),
                        el(SelectControl, { label: __('Easing', 'blockenberg'), value: a.animationEasing, options: easingOptions, onChange: function (v) { setAttributes({ animationEasing: v }); } })
                    ),

                    /* — Colors — */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Track Color', 'blockenberg'), value: a.trackColor, onChange: function (v) { setAttributes({ trackColor: v || '#e5e7eb' }); } },
                            { label: __('Percentage Color', 'blockenberg'), value: a.percentageColor, onChange: function (v) { setAttributes({ percentageColor: v || '#1e1e1e' }); } },
                            { label: __('Label Color', 'blockenberg'), value: a.labelColor, onChange: function (v) { setAttributes({ labelColor: v || '#374151' }); } },
                            { label: __('Subtext Color', 'blockenberg'), value: a.subtextColor, onChange: function (v) { setAttributes({ subtextColor: v || '#9ca3af' }); } },
                            { label: __('Gradient End Color', 'blockenberg'), value: a.gradientEnd, onChange: function (v) { setAttributes({ gradientEnd: v || '#ec4899' }); } },
                            { label: __('Card Background', 'blockenberg'), value: a.backgroundColor, onChange: function (v) { setAttributes({ backgroundColor: v || '#ffffff' }); } },
                        ]
                    })
                ),

                /* ── Canvas ─────────────────────────────────────────────────── */
                el('div', blockProps,
                    el('div', {
                        className: 'bkpc-grid',
                        style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }
                    },
                        a.items.map(function (item, idx) {
                            return el(CircleCard, { key: idx, attr: a, item: item, idx: idx, isEdit: true, onUpdate: updateItem, onRemove: removeItem });
                        })
                    ),
                    el('div', { style: { textAlign: 'center', marginTop: '12px' } },
                        el(Button, { variant: 'primary', onClick: addItem }, __('+ Add Ring', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.pctTypo || {}, '--bkpc-pct-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkpc-lb-'));
                    Object.assign(s, _tv(a.subtextTypo || {}, '--bkpc-st-'));
                }
                return { className: 'bkpc-wrap', style: s };
            })());
            var linecap = a.ringStyle === 'round' ? 'round' : a.ringStyle === 'square' ? 'square' : 'butt';

            return el('div', blockProps,
                el('div', {
                    className: 'bkpc-grid',
                    'data-animate': a.animateOnScroll ? '1' : '0',
                    'data-duration': a.animationDuration,
                    'data-easing': a.animationEasing,
                    'data-counter': a.counterAnimation ? '1' : '0',
                    'data-suffix': a.suffix,
                    style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }
                },
                    a.items.map(function (item, idx) {
                        var cardStyle = {};
                        if (a.showBackground) {
                            cardStyle = {
                                background: a.backgroundColor,
                                borderRadius: a.backgroundRadius + 'px',
                                padding: a.backgroundPadding + 'px',
                                boxShadow: a.backgroundShadow ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                            };
                        }
                        var circ = 2 * Math.PI * ((a.size - a.strokeWidth) / 2);
                        var uid = 'bkpc-g-' + idx + '-' + item.color.replace('#', '');
                        return el('div', {
                            key: idx, className: 'bkpc-item',
                            'data-pct': item.percentage, 'data-linecap': linecap,
                            'data-size': a.size, 'data-sw': a.strokeWidth,
                            'data-color': item.color, 'data-track': a.trackColor,
                            'data-gradient': a.showGradient ? '1' : '0',
                            'data-grad-end': a.gradientEnd, 'data-shadow': a.showShadow ? '1' : '0',
                            style: { textAlign: a.textAlign, ...cardStyle }
                        },
                            /* SVG ring */
                            el('svg', {
                                className: 'bkpc-svg',
                                width: a.size, height: a.size, viewBox: '0 0 ' + a.size + ' ' + a.size,
                                style: { display: 'block', margin: '0 auto', filter: a.showShadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none' }
                            },
                                a.showGradient && el('defs', null,
                                    el('linearGradient', { id: uid, x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
                                        el('stop', { offset: '0%', stopColor: item.color }),
                                        el('stop', { offset: '100%', stopColor: a.gradientEnd })
                                    )
                                ),
                                el('circle', { className: 'bkpc-track', cx: a.size/2, cy: a.size/2, r: (a.size - a.strokeWidth)/2, fill: 'none', stroke: a.trackColor, strokeWidth: a.strokeWidth }),
                                el('circle', {
                                    className: 'bkpc-ring',
                                    cx: a.size/2, cy: a.size/2, r: (a.size - a.strokeWidth)/2,
                                    fill: 'none',
                                    stroke: a.showGradient ? 'url(#' + uid + ')' : item.color,
                                    strokeWidth: a.strokeWidth,
                                    strokeLinecap: linecap,
                                    strokeDasharray: circ,
                                    strokeDashoffset: a.animateOnScroll ? circ : circ - circ * (item.percentage / 100),
                                    transform: 'rotate(-90 ' + a.size/2 + ' ' + a.size/2 + ')',
                                    style: { transition: 'stroke-dashoffset ' + (a.animationDuration/1000) + 's ' + a.animationEasing }
                                })
                            ),
                            /* center text overlay — absolutely positioned via CSS */
                            a.showPercentage && a.labelPosition !== 'inside' && el('div', {
                                className: 'bkpc-pct',
                                style: { color: a.percentageColor, marginTop: '8px' }
                            }, item.percentage + (a.suffix || '%')),
                            a.labelPosition === 'inside' && el('div', {
                                className: 'bkpc-inside',
                                style: { marginTop: '-' + (a.size / 2 + a.strokeWidth) + 'px', height: a.size + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }
                            },
                                a.showPercentage && el('span', {
                                    className: 'bkpc-pct-inner',
                                    style: { color: a.percentageColor }
                                }, item.percentage + (a.suffix || '%')),
                                a.showLabel && el('span', {
                                    className: 'bkpc-label-inner',
                                    style: { color: a.labelColor, marginTop: '4px' }
                                }, item.label)
                            ),
                            a.showLabel && a.labelPosition === 'below' && el('p', {
                                className: 'bkpc-label',
                                style: { color: a.labelColor, margin: '8px 0 0' }
                            }, item.label),
                            a.showSubtext && item.subtext && el('p', {
                                className: 'bkpc-subtext',
                                style: { color: a.subtextColor, margin: '2px 0 0' }
                            }, item.subtext)
                        );
                    })
                )
            );
        },

        deprecated: [{
            attributes: {
                items: { type: 'array', default: [{ label: 'Design', percentage: 90, color: '#6c3fb5' }, { label: 'Development', percentage: 82, color: '#3b82f6' }, { label: 'Marketing', percentage: 74, color: '#10b981' }, { label: 'Strategy', percentage: 68, color: '#f59e0b' }] },
                columns: { type: 'number', default: 4 },
                size: { type: 'number', default: 140 },
                strokeWidth: { type: 'number', default: 10 },
                ringStyle: { type: 'string', default: 'round' },
                trackColor: { type: 'string', default: '#e5e7eb' },
                showPercentage: { type: 'boolean', default: true },
                percentageColor: { type: 'string', default: '#1e1e1e' },
                percentageSize: { type: 'number', default: 26 },
                percentageWeight: { type: 'number', default: 700 },
                showLabel: { type: 'boolean', default: true },
                labelColor: { type: 'string', default: '#374151' },
                labelSize: { type: 'number', default: 14 },
                labelWeight: { type: 'number', default: 600 },
                labelPosition: { type: 'string', default: 'below' },
                showSubtext: { type: 'boolean', default: false },
                subtextColor: { type: 'string', default: '#9ca3af' },
                subtextSize: { type: 'number', default: 12 },
                gap: { type: 'number', default: 32 },
                animateOnScroll: { type: 'boolean', default: true },
                animationDuration: { type: 'number', default: 1200 },
                animationEasing: { type: 'string', default: 'ease-in-out' },
                showGradient: { type: 'boolean', default: false },
                gradientEnd: { type: 'string', default: '#ec4899' },
                showShadow: { type: 'boolean', default: false },
                showBackground: { type: 'boolean', default: false },
                backgroundColor: { type: 'string', default: '#ffffff' },
                backgroundRadius: { type: 'number', default: 16 },
                backgroundPadding: { type: 'number', default: 20 },
                backgroundShadow: { type: 'boolean', default: true },
                textAlign: { type: 'string', default: 'center' },
                counterAnimation: { type: 'boolean', default: true },
                suffix: { type: 'string', default: '%' }
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkpc-wrap' });
                var linecap = a.ringStyle === 'round' ? 'round' : a.ringStyle === 'square' ? 'square' : 'butt';
                return el('div', blockProps,
                    el('div', {
                        className: 'bkpc-grid',
                        'data-animate': a.animateOnScroll ? '1' : '0',
                        'data-duration': a.animationDuration,
                        'data-easing': a.animationEasing,
                        'data-counter': a.counterAnimation ? '1' : '0',
                        'data-suffix': a.suffix,
                        style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }
                    },
                        a.items.map(function (item, idx) {
                            var cardStyle = {};
                            if (a.showBackground) {
                                cardStyle = {
                                    background: a.backgroundColor,
                                    borderRadius: a.backgroundRadius + 'px',
                                    padding: a.backgroundPadding + 'px',
                                    boxShadow: a.backgroundShadow ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                                };
                            }
                            var circ = 2 * Math.PI * ((a.size - a.strokeWidth) / 2);
                            var uid = 'bkpc-g-' + idx + '-' + item.color.replace('#', '');
                            return el('div', {
                                key: idx, className: 'bkpc-item',
                                'data-pct': item.percentage, 'data-linecap': linecap,
                                'data-size': a.size, 'data-sw': a.strokeWidth,
                                'data-color': item.color, 'data-track': a.trackColor,
                                'data-gradient': a.showGradient ? '1' : '0',
                                'data-grad-end': a.gradientEnd, 'data-shadow': a.showShadow ? '1' : '0',
                                style: { textAlign: a.textAlign, ...cardStyle }
                            },
                                el('svg', {
                                    className: 'bkpc-svg',
                                    width: a.size, height: a.size, viewBox: '0 0 ' + a.size + ' ' + a.size,
                                    style: { display: 'block', margin: '0 auto', filter: a.showShadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none' }
                                },
                                    a.showGradient && el('defs', null,
                                        el('linearGradient', { id: uid, x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
                                            el('stop', { offset: '0%', stopColor: item.color }),
                                            el('stop', { offset: '100%', stopColor: a.gradientEnd })
                                        )
                                    ),
                                    el('circle', { className: 'bkpc-track', cx: a.size/2, cy: a.size/2, r: (a.size - a.strokeWidth)/2, fill: 'none', stroke: a.trackColor, strokeWidth: a.strokeWidth }),
                                    el('circle', {
                                        className: 'bkpc-ring',
                                        cx: a.size/2, cy: a.size/2, r: (a.size - a.strokeWidth)/2,
                                        fill: 'none',
                                        stroke: a.showGradient ? 'url(#' + uid + ')' : item.color,
                                        strokeWidth: a.strokeWidth,
                                        strokeLinecap: linecap,
                                        strokeDasharray: circ,
                                        strokeDashoffset: a.animateOnScroll ? circ : circ - circ * (item.percentage / 100),
                                        transform: 'rotate(-90 ' + a.size/2 + ' ' + a.size/2 + ')',
                                        style: { transition: 'stroke-dashoffset ' + (a.animationDuration/1000) + 's ' + a.animationEasing }
                                    })
                                ),
                                a.showPercentage && a.labelPosition !== 'inside' && el('div', {
                                    className: 'bkpc-pct',
                                    style: { fontSize: a.percentageSize + 'px', fontWeight: a.percentageWeight, color: a.percentageColor, marginTop: '8px', lineHeight: 1 }
                                }, item.percentage + (a.suffix || '%')),
                                a.labelPosition === 'inside' && el('div', {
                                    className: 'bkpc-inside',
                                    style: { marginTop: '-' + (a.size / 2 + a.strokeWidth) + 'px', height: a.size + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }
                                },
                                    a.showPercentage && el('span', {
                                        className: 'bkpc-pct-inner',
                                        style: { fontSize: a.percentageSize + 'px', fontWeight: a.percentageWeight, color: a.percentageColor, lineHeight: 1 }
                                    }, item.percentage + (a.suffix || '%')),
                                    a.showLabel && el('span', {
                                        className: 'bkpc-label-inner',
                                        style: { fontSize: a.labelSize + 'px', fontWeight: a.labelWeight, color: a.labelColor, marginTop: '4px', lineHeight: 1 }
                                    }, item.label)
                                ),
                                a.showLabel && a.labelPosition === 'below' && el('p', {
                                    className: 'bkpc-label',
                                    style: { fontSize: a.labelSize + 'px', fontWeight: a.labelWeight, color: a.labelColor, margin: '8px 0 0' }
                                }, item.label),
                                a.showSubtext && item.subtext && el('p', {
                                    className: 'bkpc-subtext',
                                    style: { fontSize: a.subtextSize + 'px', color: a.subtextColor, margin: '2px 0 0' }
                                }, item.subtext)
                            );
                        })
                    )
                );
            }
        }]
    });
}() );
