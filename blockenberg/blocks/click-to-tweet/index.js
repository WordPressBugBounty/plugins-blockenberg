( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    function xIcon() {
        return el('svg', {
            viewBox: '0 0 24 24',
            width: 16,
            height: 16,
            fill: 'currentColor',
            style: { display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }
        },
            el('path', { d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z' })
        );
    }

    registerBlockType('blockenberg/click-to-tweet', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({ className: 'bkbg-ctt-editor', style: Object.assign({}, _tv(attr.typoQuote, '--bkbg-ctt-q-')) });

            function cardStyle() {
                var base = {
                    background: attr.bgColor,
                    borderRadius: attr.borderRadius + 'px',
                    padding: '28px 32px',
                    maxWidth: attr.maxWidth + 'px',
                    margin: '0 auto'
                };
                if (attr.cardStyle === 'bordered') {
                    base.border = '2px solid ' + attr.borderColor;
                    base.background = '#fff';
                }
                if (attr.cardStyle === 'minimal') {
                    base.background = 'transparent';
                    base.borderLeft = '4px solid ' + attr.accentColor;
                    base.borderRadius = '0';
                    base.paddingLeft = '24px';
                }
                return base;
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Quote Settings', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Attribution', 'blockenberg'),
                        value: attr.attribution,
                        onChange: function (v) { setAttr({ attribution: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Attribution', 'blockenberg'),
                        checked: attr.showAttribution,
                        onChange: function (v) { setAttr({ showAttribution: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Quote Icon (")', 'blockenberg'),
                        checked: attr.showQuoteIcon,
                        onChange: function (v) { setAttr({ showQuoteIcon: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'),
                        value: attr.cardStyle,
                        options: [
                            { label: 'Card (with background)', value: 'card' },
                            { label: 'Bordered', value: 'bordered' },
                            { label: 'Minimal (left accent bar)', value: 'minimal' }
                        ],
                        onChange: function (v) { setAttr({ cardStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: attr.borderRadius,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ borderRadius: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Share Button', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Button Label', 'blockenberg'),
                        value: attr.buttonLabel,
                        onChange: function (v) { setAttr({ buttonLabel: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Include Page URL in tweet', 'blockenberg'),
                        checked: attr.includeUrl,
                        onChange: function (v) { setAttr({ includeUrl: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Quote', 'blockenberg'), value: attr.typoQuote, onChange: function (v) { setAttr({ typoQuote: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Quote Text', 'blockenberg'), value: attr.quoteColor, onChange: function (v) { setAttr({ quoteColor: v || '#111827' }); } },
                        { label: __('Attribution', 'blockenberg'), value: attr.attributionColor, onChange: function (v) { setAttr({ attributionColor: v || '#6b7280' }); } },
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#f9fafb' }); } },
                        { label: __('Border / Accent', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                        { label: __('Accent Color', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Button Background', 'blockenberg'), value: attr.buttonBg, onChange: function (v) { setAttr({ buttonBg: v || '#000' }); } },
                        { label: __('Button Text', 'blockenberg'), value: attr.buttonColor, onChange: function (v) { setAttr({ buttonColor: v || '#fff' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth,
                        min: 300, max: 1200,
                        onChange: function (v) { setAttr({ maxWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop,
                        min: 0, max: 120,
                        onChange: function (v) { setAttr({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom,
                        min: 0, max: 120,
                        onChange: function (v) { setAttr({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                )
            );

            var preview = el('div', { style: { paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } },
                el('div', { style: cardStyle() },
                    attr.showQuoteIcon && el('div', { className: 'bkbg-ctt-quote-icon', style: { color: attr.accentColor, fontSize: '48px', lineHeight: 1, marginBottom: '8px', opacity: 0.4 } }, '"'),
                    el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-ctt-quote',
                        style: {
                            color: attr.quoteColor,
                            margin: '0 0 16px'
                        },
                        value: attr.quote,
                        onChange: function (v) { setAttr({ quote: v }); },
                        placeholder: __('Enter a quote to share…', 'blockenberg')
                    }),
                    attr.showAttribution && attr.attribution && el('p', {
                        style: { fontSize: '14px', color: attr.attributionColor, margin: '0 0 20px', fontWeight: 500 }
                    }, '— ' + attr.attribution),
                    el('div', { className: 'bkbg-ctt-footer' },
                        el('span', {
                            style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: attr.buttonBg,
                                color: attr.buttonColor,
                                padding: '8px 16px',
                                borderRadius: '999px',
                                fontSize: '14px',
                                fontWeight: '600',
                                gap: '6px',
                                cursor: 'default'
                            }
                        }, xIcon(), attr.buttonLabel)
                    )
                )
            );

            return el('div', blockProps, controls, preview);
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-ctt-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
