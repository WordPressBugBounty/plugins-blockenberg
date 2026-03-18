( function () {
    var el = wp.element.createElement;
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

    var _cuTC, _cuTV;
    function _tc() { return _cuTC || (_cuTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cuTV || (_cuTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    registerBlockType('blockenberg/count-up', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({ className: 'bkbg-cu-editor', style: Object.assign({}, _tv(attr.typoValue, '--bkbg-cu-val-'), _tv(attr.typoLabel, '--bkbg-cu-lbl-')) });

            var previewStyle = {
                background: attr.bgColor || 'transparent',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px',
                textAlign: attr.textAlign
            };

            var preview = el('div', { style: previewStyle },
                el('div', {
                    style: {
                        maxWidth: attr.maxWidth + 'px',
                        margin: '0 auto',
                        textAlign: attr.textAlign
                    }
                },
                    attr.showIcon && el('div', {
                        className: 'bkbg-cu-icon',
                        style: { fontSize: attr.iconSize + 'px', color: attr.iconColor, marginBottom: '12px' }
                    }, attr.icon),
                    el('div', {
                        className: 'bkbg-cu-value',
                        style: { color: attr.valueColor, lineHeight: 1.1 }
                    }, attr.prefix + attr.value.toLocaleString() + attr.suffix),
                    attr.showLabel && el('div', {
                        className: 'bkbg-cu-label',
                        style: { color: attr.labelColor, marginTop: '8px' }
                    }, attr.label)
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Counter Settings', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Target Number', 'blockenberg'),
                        type: 'number',
                        value: attr.value,
                        onChange: function (v) { setAttr({ value: parseFloat(v) || 0 }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Prefix', 'blockenberg'),
                        value: attr.prefix,
                        onChange: function (v) { setAttr({ prefix: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Suffix', 'blockenberg'),
                        value: attr.suffix,
                        onChange: function (v) { setAttr({ suffix: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Thousands Separator', 'blockenberg'),
                        value: attr.separator,
                        options: [
                            { label: 'Comma (1,000)', value: ',' },
                            { label: 'Period (1.000)', value: '.' },
                            { label: 'None (1000)', value: '' }
                        ],
                        onChange: function (v) { setAttr({ separator: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Decimal Places', 'blockenberg'),
                        value: attr.decimals,
                        min: 0, max: 4,
                        onChange: function (v) { setAttr({ decimals: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Animation Duration (ms)', 'blockenberg'),
                        value: attr.duration,
                        min: 500, max: 5000, step: 100,
                        onChange: function (v) { setAttr({ duration: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Icon & Label', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Icon', 'blockenberg'),
                        checked: attr.showIcon,
                        onChange: function (v) { setAttr({ showIcon: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showIcon && el(TextControl, {
                        label: __('Icon (emoji or text)', 'blockenberg'),
                        value: attr.icon,
                        onChange: function (v) { setAttr({ icon: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showIcon && el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'),
                        value: attr.iconSize,
                        min: 16, max: 100,
                        onChange: function (v) { setAttr({ iconSize: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Label', 'blockenberg'),
                        checked: attr.showLabel,
                        onChange: function (v) { setAttr({ showLabel: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showLabel && el(TextControl, {
                        label: __('Label Text', 'blockenberg'),
                        value: attr.label,
                        onChange: function (v) { setAttr({ label: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Value', 'blockenberg'), value: attr.typoValue, onChange: function (v) { setAttr({ typoValue: v }); } }),
                    _tc() && el(_tc(), { label: __('Label', 'blockenberg'), value: attr.typoLabel, onChange: function (v) { setAttr({ typoLabel: v }); } }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: attr.textAlign,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ],
                        onChange: function (v) { setAttr({ textAlign: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Value Color', 'blockenberg'), value: attr.valueColor, onChange: function (v) { setAttr({ valueColor: v || '' }); } },
                        { label: __('Label Color', 'blockenberg'), value: attr.labelColor, onChange: function (v) { setAttr({ labelColor: v || '' }); } },
                        { label: __('Icon Color', 'blockenberg'), value: attr.iconColor, onChange: function (v) { setAttr({ iconColor: v || '' }); } },
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth,
                        min: 200, max: 900,
                        onChange: function (v) { setAttr({ maxWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop,
                        min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom,
                        min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                )
            );

            return el('div', blockProps,
                controls,
                preview
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-cu-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
