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

    var _tc, _tv;
    function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var _IP;
    function IP() { return _IP || (_IP = window.bkbgIconPicker); }

    var STYLES = [
        { value: 'bordered',  label: 'Bordered (left accent)' },
        { value: 'filled',    label: 'Filled card' },
        { value: 'minimal',   label: 'Minimal (text only)' },
        { value: 'sticky',    label: 'Sticky note' }
    ];

    var POSITIONS = [
        { value: 'right',  label: 'Float Right' },
        { value: 'left',   label: 'Float Left' },
        { value: 'inline', label: 'Inline (no float)' }
    ];

    registerBlockType('blockenberg/sidenote', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tvf = getTV();
                var s = { padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px' };
                if (_tvf) {
                    Object.assign(s, _tvf(attr.labelTypo, '--bksdn-lt-'));
                    Object.assign(s, _tvf(attr.textTypo, '--bksdn-tt-'));
                }
                return { style: s };
            })());

            /* preview wrapper mirrors frontend */
            var wrapStyle = {
                width: attr.position === 'inline' ? '100%' : attr.width + 'px',
                float: attr.position === 'right' ? 'right' : attr.position === 'left' ? 'left' : 'none',
                margin: attr.position === 'right' ? '4px 0 12px 20px' : attr.position === 'left' ? '4px 20px 12px 0' : '0',
                boxSizing: 'border-box',
                background: attr.bgColor,
                borderRadius: attr.borderRadius + 'px',
                color: attr.textColor,
                overflow: 'hidden'
            };

            if (attr.style === 'bordered' || attr.style === 'filled') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '10px 13px';
            }
            if (attr.style === 'bordered') {
                wrapStyle.borderLeft = '4px solid ' + attr.accentColor;
            }
            if (attr.style === 'minimal') {
                wrapStyle.borderLeft = '3px solid ' + attr.accentColor;
                wrapStyle.paddingLeft = '10px';
                wrapStyle.background = 'transparent';
            }
            if (attr.style === 'sticky') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '10px 13px 16px';
                wrapStyle.boxShadow = '2px 3px 8px rgba(0,0,0,0.10)';
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Sidenote', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Position', 'blockenberg'), value: attr.position, __nextHasNoMarginBottom: true,
                        options: POSITIONS,
                        onChange: function (v) { set({ position: v }); }
                    }),
                    attr.position !== 'inline' && el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Width (px)', 'blockenberg'), value: attr.width, min: 140, max: 480, __nextHasNoMarginBottom: true, onChange: function (v) { set({ width: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(SelectControl, {
                            label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                            options: STYLES,
                            onChange: function (v) { set({ style: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(ToggleControl, { label: __('Show Label', 'blockenberg'), checked: attr.showLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLabel: v }); } })
                    ),
                    attr.showLabel && el('div', { style: { marginTop: '6px' } },
                        el(TextControl, { label: __('Label Text', 'blockenberg'), value: attr.label, __nextHasNoMarginBottom: true, onChange: function (v) { set({ label: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIcon: v }); } })
                    ),
                    attr.showIcon && el('div', { style: { marginTop: '6px' } },
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, set))
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTC(), { label: 'Label', value: attr.labelTypo, onChange: function (v) { set({ labelTypo: v }); } }),
                    el(getTC(), { label: 'Text', value: attr.textTypo, onChange: function (v) { set({ textTypo: v }); } })
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 60, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 60, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#fffbeb' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#fbbf24' }); } },
                        { label: __('Accent / Left Strip', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#d97706' }); } },
                        { label: __('Label', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#92400e' }); } },
                        { label: __('Text', 'blockenberg'), value: attr.textColor, onChange: function (v) { set({ textColor: v || '#78350f' }); } },
                        { label: __('Icon', 'blockenberg'), value: attr.iconColor, onChange: function (v) { set({ iconColor: v || '#d97706' }); } }
                    ]
                })
            );

            var labelRow = (attr.showLabel || attr.showIcon) && el('div', { className: 'bkbg-sdn-label-row', style: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' } },
                attr.showIcon && IP().buildEditorIcon(attr.iconType, attr.icon, attr.iconDashicon, attr.iconImageUrl, { dashiconColor: attr.iconDashiconColor, className: 'bkbg-sdn-icon', style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, color: attr.iconColor, fontSize: '14px' } }),
                attr.showLabel && el('span', { className: 'bkbg-sdn-label', style: { color: attr.labelColor } }, attr.label)
            );

            var textEl = el(RichText, {
                tagName: 'p',
                className: 'bkbg-sdn-text',
                value: attr.text,
                allowedFormats: ['core/bold', 'core/italic', 'core/link'],
                placeholder: __('Side note or annotation text…', 'blockenberg'),
                style: { margin: 0, color: attr.textColor },
                onChange: function (v) { set({ text: v }); }
            });

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    labelRow,
                    textEl
                ),
                attr.position !== 'inline' && el('div', { style: { clear: 'both', height: 0 } })
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-sdn-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
