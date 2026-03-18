( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var __                 = wp.i18n.__;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function () { return {}; };
    }
    function _tv(typoObj, prefix) { return getTypoCssVars()(typoObj || {}, prefix); }
    var IP = function () { return window.bkbgIconPicker; };

    var CONFETTI_STYLES = [
        { label: '🎉 Burst (from button)',     value: 'burst'   },
        { label: '🌧 Rain (from top)',         value: 'rain'    },
        { label: '🎊 Sides (from left+right)', value: 'sides'   },
        { label: '🚀 Cannon (angled up)',      value: 'cannon'  },
        { label: '🌀 Spiral',                  value: 'spiral'  },
    ];

    var SHAPES = [
        { label: 'Mixed (rectangles + circles)', value: 'mixed'   },
        { label: 'Rectangles only',             value: 'rect'    },
        { label: 'Circles only',                value: 'circle'  },
        { label: 'Stars',                       value: 'star'    },
    ];

    var ALIGNS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];

    function ButtonPreview(props) {
        var a = props.attributes;
        var wrapStyle = {
            textAlign: a.align || 'center',
            padding: '24px',
        };
        var btnStyle = {
            display:      a.fullWidth ? 'block' : 'inline-flex',
            alignItems:   'center',
            justifyContent: 'center',
            gap:          '6px',
            width:        a.fullWidth ? '100%' : 'auto',
            maxWidth:     !a.fullWidth && a.maxWidth ? a.maxWidth + 'px' : undefined,
            background:   a.buttonBg,
            color:        a.buttonColor,
            borderRadius: a.buttonRadius + 'px',
            padding:      a.buttonPaddingV + 'px ' + a.buttonPaddingH + 'px',
            border:       'none',
            cursor:       'pointer',
            boxShadow:    a.showShadow ? '0 8px 24px ' + a.buttonBg + '55, 0 4px 8px rgba(0,0,0,0.15)' : 'none',
            lineHeight:   1.3,
            transition:   'transform 0.15s, box-shadow 0.15s',
        };
        var beforeType = a.iconBeforeType || 'custom-char';
        var afterType  = a.iconAfterType  || 'custom-char';
        var hasBefore  = beforeType !== 'custom-char' ? true : !!a.iconBefore;
        var hasAfter   = afterType  !== 'custom-char' ? true : !!a.iconAfter;
        return el('div', { style: wrapStyle },
            el('button', { className: 'bkbg-cb-btn', style: btnStyle },
                hasBefore && el('span', { className: 'bkbg-cb-icon-before' },
                    beforeType !== 'custom-char' ? IP().buildEditorIcon(beforeType, a.iconBefore, a.iconBeforeDashicon, a.iconBeforeImageUrl, a.iconBeforeDashiconColor) : a.iconBefore
                ),
                el('span', null, a.text || '🎉 Celebrate!'),
                hasAfter && el('span', { className: 'bkbg-cb-icon-after' },
                    afterType !== 'custom-char' ? IP().buildEditorIcon(afterType, a.iconAfter, a.iconAfterDashicon, a.iconAfterImageUrl, a.iconAfterDashiconColor) : a.iconAfter
                )
            ),
            a.showSubText && a.subText && el('p', { style: { marginTop: '8px', fontSize: '13px', color: '#64748b', opacity: 0.8 } }, a.subText)
        );
    }

    registerBlockType('blockenberg/confetti-button', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* Button */
                    el(PanelBody, { title: 'Button Text', initialOpen: true },
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Button label', value: a.text, onChange: function (v) { set({ text: v }); } }),
                        el('p', { style: { fontSize: '11px', fontWeight: 600, marginTop: '12px' } }, 'Icon before'),
                        el(IP().IconPickerControl, IP().iconPickerProps(a, set, { charAttr: 'iconBefore', typeAttr: 'iconBeforeType', dashiconAttr: 'iconBeforeDashicon', imageUrlAttr: 'iconBeforeImageUrl', colorAttr: 'iconBeforeDashiconColor' })),
                        el('p', { style: { fontSize: '11px', fontWeight: 600, marginTop: '12px' } }, 'Icon after'),
                        el(IP().IconPickerControl, IP().iconPickerProps(a, set, { charAttr: 'iconAfter', typeAttr: 'iconAfterType', dashiconAttr: 'iconAfterDashicon', imageUrlAttr: 'iconAfterImageUrl', colorAttr: 'iconAfterDashiconColor' })),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show sub-text', checked: a.showSubText, onChange: function (v) { set({ showSubText: v }); } }),
                        a.showSubText && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Sub-text', value: a.subText, onChange: function (v) { set({ subText: v }); } }),
                    ),
                    /* Link */
                    el(PanelBody, { title: 'Link', initialOpen: false },
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'URL (leave empty for click-only)', value: a.url, onChange: function (v) { set({ url: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Open in new tab', checked: a.openInNewTab, onChange: function (v) { set({ openInNewTab: v }); } }),
                    ),
                    /* Confetti */
                    el(PanelBody, { title: 'Confetti Settings', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Confetti style', value: a.confettiStyle, options: CONFETTI_STYLES, onChange: function (v) { set({ confettiStyle: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Particle shapes', value: a.shapes, options: SHAPES, onChange: function (v) { set({ shapes: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Particle count', value: a.particleCount, min: 20, max: 500, step: 10, onChange: function (v) { set({ particleCount: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Spread angle', value: a.spread, min: 10, max: 180, onChange: function (v) { set({ spread: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Gravity', value: a.gravity, min: 0.1, max: 3, step: 0.1, onChange: function (v) { set({ gravity: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Particle size (px)', value: a.particleSize, min: 4, max: 24, onChange: function (v) { set({ particleSize: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Duration (ms)', value: a.duration, min: 500, max: 8000, step: 250, onChange: function (v) { set({ duration: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Allow repeat clicks', checked: a.repeat, onChange: function (v) { set({ repeat: v }); } }),
                    ),
                    /* Button Style */
                    el(PanelBody, { title: 'Button Style', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Text alignment', value: a.align, options: ALIGNS, onChange: function (v) { set({ align: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Full width', checked: a.fullWidth, onChange: function (v) { set({ fullWidth: v }); } }),
                        !a.fullWidth && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Max width (px)', value: a.maxWidth, min: 100, max: 800, step: 10, onChange: function (v) { set({ maxWidth: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border radius (px)', value: a.buttonRadius, min: 0, max: 100, onChange: function (v) { set({ buttonRadius: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Vertical padding (px)', value: a.buttonPaddingV, min: 4, max: 48, onChange: function (v) { set({ buttonPaddingV: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Horizontal padding (px)', value: a.buttonPaddingH, min: 8, max: 120, onChange: function (v) { set({ buttonPaddingH: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Button shadow', checked: a.showShadow, onChange: function (v) { set({ showShadow: v }); } }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(TC, {
                                label: __('Button Text', 'blockenberg'),
                                value: a.typoButton || {},
                                onChange: function (v) { set({ typoButton: v }); }
                            });
                        })()
                    ),
el(PanelColorSettings, {
                        title: 'Button Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: a.buttonBg,      onChange: function (v) { set({ buttonBg: v || '#6366f1' }); },     label: 'Button background' },
                            { value: a.buttonHoverBg, onChange: function (v) { set({ buttonHoverBg: v || '#4f46e5' }); }, label: 'Button hover background' },
                            { value: a.buttonColor,   onChange: function (v) { set({ buttonColor: v || '#ffffff' }); },   label: 'Button text' },
                        ],
                    }),
                ),
                el('div', useBlockProps({ style: Object.assign({}, _tv(a.typoButton, '--bkcb-btn-')) }),
                    el(ButtonPreview, { attributes: a })
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save({ style: Object.assign({}, _tv(a.typoButton, '--bkcb-btn-')) }),
                el('div', { className: 'bkbg-cb-app', 'data-opts': JSON.stringify(a) })
            );
        },
    });
}() );
