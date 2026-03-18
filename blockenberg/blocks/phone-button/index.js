( function () {
    var el               = wp.element.createElement;
    var __               = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps    = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody        = wp.components.PanelBody;
    var TextControl      = wp.components.TextControl;
    var TextareaControl  = wp.components.TextareaControl;
    var SelectControl    = wp.components.SelectControl;
    var RangeControl     = wp.components.RangeControl;
    var ToggleControl    = wp.components.ToggleControl;

    var _tcCache, _tvCache;
    function getTypoControl() { return _tcCache || (_tcCache = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tvCache || (_tvCache = window.bkbgTypoCssVars); }

    var MODE_ICON = { phone: '📞', whatsapp: '💬', both: '📞💬' };

    registerBlockType('blockenberg/phone-button', {
        title:    __('Phone Button'),
        icon:     'phone',
        category: 'bkbg-marketing',

        edit: function (props) {
            var attr       = props.attributes;
            var setAttr    = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(attr.labelTypo, '--bkbg-phb-lb-'));
                return { className: 'bkbg-phb-editor-wrap', style: s };
            })());

            var showPhone     = attr.mode !== 'whatsapp';
            var showWhatsapp  = attr.mode !== 'phone';
            var isFloating    = attr.layout === 'floating';

            /* ── Editor preview ──────────────────────────────────────── */
            var preview = el('div', {
                className: 'bkbg-phb-preview',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '24px',
                    background: '#f1f5f9',
                    borderRadius: '12px'
                }
            },
                el('div', {
                    style: {
                        fontSize: '13px',
                        color: '#64748b',
                        marginBottom: '6px',
                        fontWeight: 600
                    }
                }, isFloating
                    ? __('Floating button — fixed position on frontend')
                    : __('Inline button — displayed in page flow')
                ),
                el('div', {
                    style: {
                        display: 'flex',
                        gap: attr.gap + 'px',
                        alignItems: 'center'
                    }
                },
                    showPhone && el('a', {
                        href:      'tel:' + attr.phoneNumber,
                        className: 'bkbg-phb-btn bkbg-phb-phone',
                        style: {
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            width:  attr.buttonSize + 'px',
                            height: attr.buttonSize + 'px',
                            borderRadius: attr.borderRadius + 'px',
                            background:   attr.phoneBg,
                            color:        attr.phoneColor,
                            fontSize:     attr.iconSize + 'px',
                            textDecoration: 'none',
                            boxShadow: '0 4px 18px rgba(0,0,0,0.18)'
                        }
                    }, '📞'),
                    showWhatsapp && el('a', {
                        href:      '#',
                        className: 'bkbg-phb-btn bkbg-phb-whatsapp',
                        style: {
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            width:  attr.buttonSize + 'px',
                            height: attr.buttonSize + 'px',
                            borderRadius: attr.borderRadius + 'px',
                            background:   attr.whatsappBg,
                            color:        attr.whatsappColor,
                            fontSize:     attr.iconSize + 'px',
                            textDecoration: 'none',
                            boxShadow: '0 4px 18px rgba(0,0,0,0.18)'
                        }
                    }, '💬')
                ),
                attr.showPulse && el('div', {
                    style: { fontSize: '12px', color: '#6366f1' }
                }, __('✦ Pulse animation enabled'))
            );

            /* ── Inspector ───────────────────────────────────────────── */
            var inspector = el(InspectorControls, {},
                /* Contact Details */
                el(PanelBody, { title: __('Contact Details'), initialOpen: true },
                    el(SelectControl, {
                        label:   __('Mode'),
                        value:   attr.mode,
                        options: [
                            { label: __('Phone only'),     value: 'phone' },
                            { label: __('WhatsApp only'),  value: 'whatsapp' },
                            { label: __('Both'),           value: 'both' }
                        ],
                        onChange: function (v) { setAttr({ mode: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    (attr.mode !== 'whatsapp') && el(TextControl, {
                        label:    __('Phone Number'),
                        value:    attr.phoneNumber,
                        onChange: function (v) { setAttr({ phoneNumber: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    (attr.mode !== 'phone') && el(TextControl, {
                        label:    __('WhatsApp Number (intl format)'),
                        value:    attr.whatsappNumber,
                        onChange: function (v) { setAttr({ whatsappNumber: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    (attr.mode !== 'phone') && el(TextareaControl, {
                        label:    __('WhatsApp Pre-filled Message'),
                        value:    attr.whatsappMessage,
                        rows:     3,
                        onChange: function (v) { setAttr({ whatsappMessage: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label:   __('Layout'),
                        value:   attr.layout,
                        options: [
                            { label: __('Floating (fixed)'), value: 'floating' },
                            { label: __('Inline'),           value: 'inline' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.layout === 'floating' && el(SelectControl, {
                        label:   __('Screen Position'),
                        value:   attr.position,
                        options: [
                            { label: __('Bottom Right'), value: 'bottom-right' },
                            { label: __('Bottom Left'),  value: 'bottom-left' },
                            { label: __('Bottom Center'), value: 'bottom-center' },
                            { label: __('Top Right'),    value: 'top-right' },
                            { label: __('Top Left'),     value: 'top-left' }
                        ],
                        onChange: function (v) { setAttr({ position: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label:    __('Show Pulse Animation'),
                        checked:  attr.showPulse,
                        onChange: function (v) { setAttr({ showPulse: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label:    __('Show Button Label'),
                        checked:  attr.showText,
                        onChange: function (v) { setAttr({ showText: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showText && el(TextControl, {
                        label:    __('Label Text'),
                        value:    attr.buttonText,
                        onChange: function (v) { setAttr({ buttonText: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label:    __('Button Size (px)'),
                        value:    attr.buttonSize,
                        min: 36, max: 100,
                        onChange: function (v) { setAttr({ buttonSize: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label:    __('Icon Size (px)'),
                        value:    attr.iconSize,
                        min: 14, max: 56,
                        onChange: function (v) { setAttr({ iconSize: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label:    __('Border Radius (px)'),
                        value:    attr.borderRadius,
                        min: 0, max: 999,
                        onChange: function (v) { setAttr({ borderRadius: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.mode === 'both' && el(RangeControl, {
                        label:    __('Gap Between Buttons (px)'),
                        value:    attr.gap,
                        min: 4, max: 40,
                        onChange: function (v) { setAttr({ gap: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label:    __('Shadow Strength (%)'),
                        value:    attr.shadowStrength,
                        min: 0, max: 80,
                        onChange: function (v) { setAttr({ shadowStrength: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.layout === 'floating' && el(RangeControl, {
                        label:    __('Show After Scroll (px, 0 = always)'),
                        value:    attr.scrollOffset,
                        min: 0, max: 1000, step: 10,
                        onChange: function (v) { setAttr({ scrollOffset: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    el(getTypoControl(), { label: __('Label'), value: attr.labelTypo, onChange: function(v) { setAttr({ labelTypo: v }); } })
                ),

                /* Colors */
                el(PanelColorSettings, {
                    title:               __('Colors'),
                    initialOpen:         false,
                    colorSettings: [
                        {
                            label:    __('Phone Button BG'),
                            value:    attr.phoneBg,
                            onChange: function (v) { setAttr({ phoneBg: v || '#6366f1' }); }
                        },
                        {
                            label:    __('Phone Button Icon'),
                            value:    attr.phoneColor,
                            onChange: function (v) { setAttr({ phoneColor: v || '#ffffff' }); }
                        },
                        {
                            label:    __('Phone Pulse Color'),
                            value:    attr.phonePulseBg,
                            onChange: function (v) { setAttr({ phonePulseBg: v || '#6366f1' }); }
                        },
                        {
                            label:    __('WhatsApp Button BG'),
                            value:    attr.whatsappBg,
                            onChange: function (v) { setAttr({ whatsappBg: v || '#25d366' }); }
                        },
                        {
                            label:    __('WhatsApp Button Icon'),
                            value:    attr.whatsappColor,
                            onChange: function (v) { setAttr({ whatsappColor: v || '#ffffff' }); }
                        },
                        {
                            label:    __('WhatsApp Pulse Color'),
                            value:    attr.whatsappPulseBg,
                            onChange: function (v) { setAttr({ whatsappPulseBg: v || '#25d366' }); }
                        },
                        {
                            label:    __('Label Background'),
                            value:    attr.labelBg,
                            onChange: function (v) { setAttr({ labelBg: v || '#1e1b4b' }); }
                        },
                        {
                            label:    __('Label Text Color'),
                            value:    attr.labelColor,
                            onChange: function (v) { setAttr({ labelColor: v || '#ffffff' }); }
                        }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', blockProps, preview)
            );
        },

        save: function (props) {
            var attr       = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                phoneNumber:     attr.phoneNumber,
                whatsappNumber:  attr.whatsappNumber,
                whatsappMessage: attr.whatsappMessage,
                mode:            attr.mode,
                layout:          attr.layout,
                position:        attr.position,
                showPulse:       attr.showPulse,
                buttonText:      attr.buttonText,
                showText:        attr.showText,
                buttonSize:      attr.buttonSize,
                iconSize:        attr.iconSize,
                borderRadius:    attr.borderRadius,
                gap:             attr.gap,
                shadowStrength:  attr.shadowStrength,
                scrollOffset:    attr.scrollOffset,
                phoneBg:         attr.phoneBg,
                phoneColor:      attr.phoneColor,
                phonePulseBg:    attr.phonePulseBg,
                whatsappBg:      attr.whatsappBg,
                whatsappColor:   attr.whatsappColor,
                whatsappPulseBg: attr.whatsappPulseBg,
                labelBg:         attr.labelBg,
                labelColor:      attr.labelColor,
                labelTypo:       attr.labelTypo
            };
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-phb-app',
                    'data-opts': JSON.stringify(opts)
                })
            );
        }
    });
}() );
