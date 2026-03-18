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
    var Fragment = wp.element.Fragment;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    registerBlockType('blockenberg/affiliate-disclosure', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps();

            /* Compute wrapper style from style attribute */
            var wrapStyle = {
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                borderRadius: attr.borderRadius + 'px',
                background: attr.bgColor, borderColor: attr.borderColor
            };
            if (attr.style === 'banner') {
                wrapStyle.borderTop = '3px solid ' + attr.accentColor;
                wrapStyle.borderLeft = 'none';
                wrapStyle.padding = '14px 18px';
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.borderTop = '3px solid ' + attr.accentColor;
            } else if (attr.style === 'left-bar') {
                wrapStyle.borderLeft = '4px solid ' + attr.accentColor;
                wrapStyle.padding = '12px 16px';
                wrapStyle.borderRadius = '0 ' + attr.borderRadius + 'px ' + attr.borderRadius + 'px 0';
            } else if (attr.style === 'box') {
                wrapStyle.border = '2px solid ' + attr.borderColor;
                wrapStyle.padding = '16px 20px';
            } else { /* minimal */
                wrapStyle.background = 'transparent';
                wrapStyle.border = 'none';
                wrapStyle.padding = '8px 0';
                wrapStyle.borderRadius = '0';
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Icon (emoji)', 'blockenberg'), value: attr.icon, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ icon: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIcon: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, {
                            label: __('Label (bold prefix)', 'blockenberg'), value: attr.label, __nextHasNoMarginBottom: true,
                            onChange: function (v) { set({ label: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Label', 'blockenberg'), checked: attr.showLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Collapsible', 'blockenberg'), checked: attr.collapsible, __nextHasNoMarginBottom: true, onChange: function (v) { set({ collapsible: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Policy Link', 'blockenberg'), checked: attr.showLink, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLink: v }); } })
                    ),
                    attr.showLink && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Link Text', 'blockenberg'), value: attr.linkText, __nextHasNoMarginBottom: true, onChange: function (v) { set({ linkText: v }); } }),
                        el('div', { style: { marginTop: '8px' } },
                            el(TextControl, { label: __('Link URL', 'blockenberg'), value: attr.linkUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ linkUrl: v }); } })
                        )
                    )
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Visual Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [
                            { label: 'Banner (top accent border)', value: 'banner' },
                            { label: 'Left Bar (left accent)', value: 'left-bar' },
                            { label: 'Box (solid border)', value: 'box' },
                            { label: 'Minimal (no background)', value: 'minimal' }
                        ],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                        return el(Fragment, {},
                            el(TC, { label: __('Text', 'blockenberg'), value: attr.textTypo || {}, onChange: function (v) { set({ textTypo: v }); } }),
                            el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: attr.iconFontSize, min: 12, max: 32, __nextHasNoMarginBottom: true, onChange: function (v) { set({ iconFontSize: v }); } })
                        );
                    })()
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#fffbeb' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#fcd34d' }); } },
                        { label: __('Accent (top/left bar)', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#d97706' }); } },
                        { label: __('Text', 'blockenberg'), value: attr.textColor, onChange: function (v) { set({ textColor: v || '#78350f' }); } },
                        { label: __('Label', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#92400e' }); } },
                        { label: __('Link', 'blockenberg'), value: attr.linkColor, onChange: function (v) { set({ linkColor: v || '#d97706' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { className: 'bkbg-afd-wrap bkbg-afd-' + attr.style, style: (function () {
                    var s = Object.assign({}, wrapStyle, {
                        '--bkbg-afd-text-sz': (attr.textFontSize || 13) + 'px'
                    });
                    var _tv = getTypoCssVars();
                    Object.assign(s, _tv(attr.textTypo || {}, '--bkbg-afd-text-'));
                    return s;
                })() },
                    attr.showIcon && el('span', { className: 'bkbg-afd-icon', style: { fontSize: (attr.iconFontSize || 18) + 'px', flexShrink: 0, marginTop: '1px' } }, attr.icon),
                    el('div', { className: 'bkbg-afd-body', style: { flex: 1 } },
                        el('div', { style: { color: attr.textColor } },
                            attr.showLabel && el('strong', { style: { color: attr.labelColor, marginRight: '4px' } }, attr.label + ':'),
                            el(RichText, {
                                tagName: 'span', value: attr.text, placeholder: __('Disclosure text…', 'blockenberg'),
                                style: { color: attr.textColor },
                                onChange: function (v) { set({ text: v }); }
                            })
                        ),
                        attr.showLink && el('a', { href: '#', style: { display: 'block', marginTop: '6px', fontSize: '12px', color: attr.linkColor, textDecoration: 'underline' } }, attr.linkText)
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-afd-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
