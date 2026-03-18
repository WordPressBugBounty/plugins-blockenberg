( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var IP = function () { return window.bkbgIconPicker; };

    function buildCircleSVG(attr, size) {
        var values      = attr.values;
        var n           = values.length;
        if (n === 0) return null;

        var cx         = size / 2;
        var cy         = size / 2;
        var OR         = (size / 2) * (attr.orbitRadius / 100);
        var CR         = (size / 2) * (attr.centerRadius / 100);
        var nodeR      = CR * 0.75;
        var lineStyle  = attr.lineStyle === 'solid' ? '' : '6 4';

        var svgNS = 'http://www.w3.org/2000/svg';

        var nodes = values.map(function (v, i) {
            var angle = (2 * Math.PI * i / n) - Math.PI / 2;
            return {
                x: cx + OR * Math.cos(angle),
                y: cy + OR * Math.sin(angle),
                value: v, angle: angle
            };
        });

        var svgEl = el('svg', {
            xmlns: svgNS,
            viewBox: '0 0 ' + size + ' ' + size,
            width: '100%',
            height: 'auto',
            style: { maxWidth: size + 'px', overflow: 'visible', display: 'block', margin: '0 auto' }
        },
            /* connector lines */
            nodes.map(function (node, i) {
                return el('line', { key: 'l' + i,
                    x1: cx, y1: cy, x2: node.x, y2: node.y,
                    stroke: attr.lineColor, strokeWidth: 1.5,
                    strokeDasharray: lineStyle, opacity: 0.7
                });
            }),
            /* orbit ring */
            el('circle', { cx: cx, cy: cy, r: OR,
                fill: 'none', stroke: attr.lineColor, strokeWidth: 1,
                strokeDasharray: '4 6', opacity: 0.4
            }),
            /* center circle */
            el('circle', { cx: cx, cy: cy, r: CR, fill: attr.centerBg }),
            el('text', { x: cx, y: cy + (attr.centerTextSize * 0.35),
                textAnchor: 'middle', dominantBaseline: 'middle',
                fontSize: attr.centerTextSize, fontWeight: 700,
                fill: attr.centerColor, fontFamily: 'inherit'
            }, attr.centerText),
            /* value nodes */
            nodes.map(function (node, i) {
                var labelX = node.x + (node.x > cx ? 1 : -1) * (nodeR + 8);
                var ta = node.x > cx + 5 ? 'start' : node.x < cx - 5 ? 'end' : 'middle';
                var _iType = node.value.iconType || 'custom-char';
                var _iconEl;
                if (_iType !== 'custom-char' && IP()) {
                    var _built = IP().buildEditorIcon(_iType, node.value.icon, node.value.iconDashicon, node.value.iconImageUrl, node.value.iconDashiconColor);
                    if (_built) {
                        _iconEl = el('foreignObject', { x: node.x - nodeR * 0.5, y: node.y - nodeR * 0.5, width: nodeR, height: nodeR },
                            el('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: (attr.iconSize * 0.55) + 'px', lineHeight: '1' } }, _built));
                    }
                }
                if (!_iconEl) {
                    _iconEl = el('text', { x: node.x, y: node.y + (attr.iconSize * 0.35),
                        textAnchor: 'middle', dominantBaseline: 'middle',
                        fontSize: attr.iconSize * 0.55, fontFamily: 'inherit'
                    }, node.value.icon);
                }
                return el('g', { key: 'n' + i },
                    el('circle', { cx: node.x, cy: node.y, r: nodeR, fill: attr.nodeBg }),
                    _iconEl,
                    el('text', { x: labelX, y: node.y - (attr.descSize + 2),
                        textAnchor: ta, fontSize: attr.labelSize, fontWeight: 700,
                        fill: attr.labelColor, fontFamily: 'inherit'
                    }, node.value.label),
                    attr.showDescription && el('text', { x: labelX, y: node.y + attr.descSize,
                        textAnchor: ta, fontSize: attr.descSize,
                        fill: attr.descColor, fontFamily: 'inherit'
                    }, node.value.description)
                );
            })
        );

        return svgEl;
    }

    registerBlockType('blockenberg/values-circle', {
        title:    __('Values Circle'),
        icon:     'chart-pie',
        category: 'bkbg-business',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps({ className: 'bkbg-vc-wrap' });

            function updateValue(idx, field, val) {
                var values = attr.values.map(function (v, i) {
                    return i === idx ? Object.assign({}, v, { [field]: val }) : v;
                });
                setAttr({ values: values });
            }
            function addValue() {
                setAttr({ values: attr.values.concat([{ icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: 'New Value', description: 'Description' }]) });
            }
            function removeValue(idx) {
                if (attr.values.length <= 2) return;
                setAttr({ values: attr.values.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Values'), initialOpen: true },
                    attr.values.map(function (v, idx) {
                        return el(PanelBody, { key: idx, title: v.label || 'Value ' + (idx + 1), initialOpen: false },
                            el(IP().IconPickerControl, IP().iconPickerProps(v, function(patch) {
                                var values = attr.values.map(function(val, i) { return i === idx ? Object.assign({}, val, patch) : val; });
                                setAttr({ values: values });
                            }, { label: __('Icon (emoji)'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                            el(TextControl, { label: __('Label'), value: v.label || '',
                                onChange: function (val) { updateValue(idx, 'label', val); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Description'), value: v.description || '',
                                onChange: function (val) { updateValue(idx, 'description', val); },
                                __nextHasNoMarginBottom: true }),
                            attr.values.length > 2 && el(Button, {
                                isDestructive: true, variant: 'secondary',
                                onClick: function () { removeValue(idx); },
                                style: { marginTop: 8 }
                            }, __('Remove'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addValue,
                        style: { marginTop: 8, width: '100%' }
                    }, __('+ Add Value'))
                ),

                el(PanelBody, { title: __('Center'), initialOpen: false },
                    el(TextControl, { label: __('Center Text'), value: attr.centerText,
                        onChange: function (v) { setAttr({ centerText: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Center Radius (% of half)'), value: attr.centerRadius,
                        min: 10, max: 35,
                        onChange: function (v) { setAttr({ centerRadius: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(RangeControl, { label: __('Diagram Size (px)'), value: attr.size,
                        min: 300, max: 900, step: 20,
                        onChange: function (v) { setAttr({ size: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Orbit Radius (% of half)'), value: attr.orbitRadius,
                        min: 25, max: 60,
                        onChange: function (v) { setAttr({ orbitRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Icon Size (px)'), value: attr.iconSize,
                        min: 16, max: 64,
                        onChange: function (v) { setAttr({ iconSize: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Descriptions'), checked: attr.showDescription,
                        onChange: function (v) { setAttr({ showDescription: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Connector Style'), value: attr.lineStyle,
                        options: [
                            { label: __('Dashed'), value: 'dashed' },
                            { label: __('Solid'),  value: 'solid' }
                        ],
                        onChange: function (v) { setAttr({ lineStyle: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Animate on Scroll'), checked: attr.animate,
                        onChange: function (v) { setAttr({ animate: v }); },
                        __nextHasNoMarginBottom: true }),
                    attr.animate && el(RangeControl, { label: __('Animation Duration (ms)'), value: attr.animateDuration,
                        min: 200, max: 2000, step: 100,
                        onChange: function (v) { setAttr({ animateDuration: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(RangeControl, { label: __('Center Text Size (px)'), value: attr.centerTextSize,
                                            min: 10, max: 40,
                                            onChange: function (v) { setAttr({ centerTextSize: v }); },
                                            __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Label Size (px)'), value: attr.labelSize,
                                            min: 10, max: 22,
                                            onChange: function (v) { setAttr({ labelSize: v }); },
                                            __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Description Size (px)'), value: attr.descSize,
                                            min: 8, max: 16,
                                            onChange: function (v) { setAttr({ descSize: v }); },
                                            __nextHasNoMarginBottom: true })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Node BG'), value: attr.nodeBg,
                          onChange: function (v) { setAttr({ nodeBg: v || '#6366f1' }); } },
                        { label: __('Center BG'), value: attr.centerBg,
                          onChange: function (v) { setAttr({ centerBg: v || '#0f172a' }); } },
                        { label: __('Center Text'), value: attr.centerColor,
                          onChange: function (v) { setAttr({ centerColor: v || '#ffffff' }); } },
                        { label: __('Connector Lines'), value: attr.lineColor,
                          onChange: function (v) { setAttr({ lineColor: v || '#cbd5e1' }); } },
                        { label: __('Label Text'), value: attr.labelColor,
                          onChange: function (v) { setAttr({ labelColor: v || '#0f172a' }); } },
                        { label: __('Description Text'), value: attr.descColor,
                          onChange: function (v) { setAttr({ descColor: v || '#64748b' }); } }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    attr.sectionBg && el('style', {}, '.bkbg-vc-wrap{background:' + attr.sectionBg + '}'),
                    buildCircleSVG(attr, attr.size)
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            return el('div', bp,
                el('div', { className: 'bkbg-vc-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
