( function () {
    var el                 = wp.element.createElement;
    var registerBlockType  = wp.blocks.registerBlockType;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var SelectControl      = wp.components.SelectControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/magnetic-button', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = { textAlign: a.align || 'center' };
                if (_tvFn) Object.assign(s, _tvFn(a.textTypo, '--bkbg-mgb-tx-'));
                return { style: s };
            })());

            var isOutline = a.buttonStyle === 'outline';
            var isGhost   = a.buttonStyle === 'ghost';

            var btnStyle = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: (a.paddingY || 18) + 'px ' + (a.paddingX || 40) + 'px',
                borderRadius: (a.borderRadius || 999) + 'px',
                cursor: 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
                background: isOutline || isGhost ? 'transparent' : (a.btnBg || '#6366f1'),
                color: isOutline || isGhost ? (a.btnBg || '#6366f1') : (a.btnColor || '#ffffff'),
                border: isGhost ? 'none' : (a.borderWidth || 2) + 'px solid ' + (a.btnBorderColor || '#6366f1'),
                boxShadow: isOutline || isGhost ? 'none' : '0 4px 20px ' + (a.shadowColor || 'rgba(99,102,241,0.4)'),
                userSelect: 'none',
                WebkitUserSelect: 'none',
                flexDirection: 'column'
            };

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Button Content', initialOpen: true },
                        el(TextControl, { label: 'Sub-text (optional)', value: a.subtext || '',
                            onChange: function (v) { set({ subtext: v }); },
                            help: 'Smaller text shown below main label', __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Link URL', value: a.href || '',
                            onChange: function (v) { set({ href: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Link target', value: a.target || '_self',
                            options: [{ label: 'Same tab', value: '_self' }, { label: 'New tab', value: '_blank' }],
                            onChange: function (v) { set({ target: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show arrow icon', checked: a.showArrow === true,
                            onChange: function (v) { set({ showArrow: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Magnetic Effect', initialOpen: false },
                        el(RangeControl, { label: 'Magnetic pull strength (px)', value: a.magnetStrength || 40,
                            onChange: function (v) { set({ magnetStrength: v }); }, min: 0, max: 100, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Activation radius (px)', value: a.magnetRadius || 120,
                            onChange: function (v) { set({ magnetRadius: v }); }, min: 40, max: 400, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Click ripple effect', checked: a.ripple !== false,
                            onChange: function (v) { set({ ripple: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Style', initialOpen: false },
                        el(SelectControl, { label: 'Button style', value: a.buttonStyle || 'filled',
                            options: [
                                { label: 'Filled', value: 'filled' },
                                { label: 'Outline', value: 'outline' },
                                { label: 'Ghost (no border)', value: 'ghost' }
                            ],
                            onChange: function (v) { set({ buttonStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Alignment', value: a.align || 'center',
                            options: [
                                { label: 'Left', value: 'left' },
                                { label: 'Center', value: 'center' },
                                { label: 'Right', value: 'right' }
                            ],
                            onChange: function (v) { set({ align: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Padding horizontal', value: a.paddingX || 40,
                            onChange: function (v) { set({ paddingX: v }); }, min: 12, max: 100, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Padding vertical', value: a.paddingY || 18,
                            onChange: function (v) { set({ paddingY: v }); }, min: 6, max: 60, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Border radius', value: a.borderRadius || 999,
                            onChange: function (v) { set({ borderRadius: v }); }, min: 0, max: 999, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Border width (px)', value: a.borderWidth || 2,
                            onChange: function (v) { set({ borderWidth: v }); }, min: 0, max: 8, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        (function () { var C = getTypoControl(); return C ? el(C, { label: 'Button Text', value: a.textTypo, onChange: function (v) { set({ textTypo: v }); } }) : null; })()
                    ),
el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Button background', value: a.btnBg,         onChange: function (v) { set({ btnBg:         v || '#6366f1' }); } },
                            { label: 'Button text',       value: a.btnColor,      onChange: function (v) { set({ btnColor:      v || '#ffffff' }); } },
                            { label: 'Border color',      value: a.btnBorderColor,onChange: function (v) { set({ btnBorderColor:v || '#6366f1' }); } },
                            { label: 'Hover background',  value: a.hoverBg,       onChange: function (v) { set({ hoverBg:       v || '#4f46e5' }); } },
                            { label: 'Hover text',        value: a.hoverColor,    onChange: function (v) { set({ hoverColor:    v || '#ffffff' }); } },
                            { label: 'Ripple color',      value: a.rippleColor,   onChange: function (v) { set({ rippleColor:   v || 'rgba(255,255,255,0.35)' }); } },
                            { label: 'Shadow / glow',     value: a.shadowColor,   onChange: function (v) { set({ shadowColor:   v || 'rgba(99,102,241,0.4)' }); } }
                        ],
                        disableCustomGradients: true
                    })
                ),

                // Editor preview
                el('div', { style: { textAlign: a.align || 'center' } },
                    el('div', { className: 'bkbg-mgb-btn', style: btnStyle },
                        el(RichText, {
                            tagName: 'span', value: a.text,
                            onChange: function (v) { set({ text: v }); },
                            placeholder: 'Button text…',
                            className: 'bkbg-mgb-text'
                        }),
                        a.subtext && el('span', { className: 'bkbg-mgb-sub' }, a.subtext),
                        a.showArrow && el('span', { className: 'bkbg-mgb-arrow' }, '→')
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvFn = getTypoCssVars();
            var blockProps = useBlockProps.save((function () {
                var s = { textAlign: a.align || 'center' };
                if (_tvFn) Object.assign(s, _tvFn(a.textTypo, '--bkbg-mgb-tx-'));
                return { style: s };
            })());
            var opts = {
                magnetStrength: a.magnetStrength || 40,
                magnetRadius:   a.magnetRadius   || 120,
                ripple:         a.ripple         !== false,
                btnBg:          a.btnBg          || '#6366f1',
                btnColor:       a.btnColor       || '#ffffff',
                hoverBg:        a.hoverBg        || '#4f46e5',
                hoverColor:     a.hoverColor     || '#ffffff',
                rippleColor:    a.rippleColor    || 'rgba(255,255,255,0.35)',
                shadowColor:    a.shadowColor    || 'rgba(99,102,241,0.4)',
                borderRadius:   a.borderRadius   || 999,
                borderWidth:    a.borderWidth    || 2,
                btnBorderColor: a.btnBorderColor || '#6366f1',
                buttonStyle:    a.buttonStyle    || 'filled',
                paddingX:       a.paddingX       || 40,
                paddingY:       a.paddingY       || 18,
                textTypo:       a.textTypo
            };
            return el('div', blockProps,
                el('div', { className: 'bkbg-mgb-wrap', 'data-opts': JSON.stringify(opts) },
                    el('a', {
                        className: 'bkbg-mgb-btn',
                        href: a.href || '#',
                        target: a.target || '_self',
                        rel: a.target === '_blank' ? 'noopener noreferrer' : undefined
                    },
                        el(RichText.Content, { tagName: 'span', value: a.text, className: 'bkbg-mgb-text' }),
                        a.subtext && el('span', { className: 'bkbg-mgb-sub' }, a.subtext),
                        a.showArrow && el('span', { className: 'bkbg-mgb-arrow' }, '→')
                    )
                )
            );
        }
    });
}() );
