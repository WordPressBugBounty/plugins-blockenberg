( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody    = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange }))
                )
            )
        );
    }

    function buildCSS(a) {
        var s = {
            '--bkbg-nl-bg'           : a.bgColor,
            '--bkbg-nl-text'         : a.textColor,
            '--bkbg-nl-heading-color': a.headingColor,
            '--bkbg-nl-sub-color'    : a.subtitleColor,
            '--bkbg-nl-field-bg'     : a.fieldBg,
            '--bkbg-nl-field-border' : a.fieldBorderColor,
            '--bkbg-nl-btn-bg'       : a.btnBg,
            '--bkbg-nl-btn-color'    : a.btnColor,
            '--bkbg-nl-radius'       : a.borderRadius + 'px',
            '--bkbg-nl-btn-radius'   : a.btnRadius + 'px',
            '--bkbg-nl-pad'          : a.padding + 'px',
            '--bkbg-nl-heading-sz'   : a.headingSize + 'px',
            '--bkbg-nl-sub-sz'       : a.subtitleSize + 'px',
            '--bkbg-nl-heading-fw'   : a.headingFontWeight || 700,
            '--bkbg-nl-heading-lh'   : a.headingLineHeight || 1.2,
            '--bkbg-nl-sub-fw'       : a.subtitleFontWeight || 400,
            '--bkbg-nl-sub-lh'       : a.subtitleLineHeight || 1.5,
            maxWidth: a.maxWidth + 'px',
            width: '100%'
        };
        var _tvf = getTypoCssVars();
        if (_tvf) {
            Object.assign(s, _tvf(a.headingTypo, '--bkbg-nl-ht-'));
            Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-nl-st-'));
        }
        return s;
    }

    registerBlockType('blockenberg/newsletter', {
        title: __('Newsletter Signup', 'blockenberg'),
        icon: 'email',
        category: 'bkbg-marketing',
        description: __('Email opt-in form connected to the built-in subscriber endpoint.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorState = useState(null);
            var openColorKey = openColorState[0];
            var setOpenColorKey = openColorState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function sa(obj) { setAttributes(obj); }

            var blockProps = useBlockProps({
                className: 'bkbg-nl-wrapper bkbg-nl-layout-' + a.layout + ' bkbg-nl-style-' + a['style'],
                style: buildCSS(a)
            });

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: a.showIcon, onChange: function (v) { sa({ showIcon: v }); } }),
                    el(ToggleControl, { label: __('Show Name Field', 'blockenberg'), checked: a.showName, onChange: function (v) { sa({ showName: v }); } }),
                    a.showName && el(TextControl, { label: __('Name Placeholder', 'blockenberg'), value: a.placeholderName, onChange: function (v) { sa({ placeholderName: v }); } }),
                    el(TextControl, { label: __('Email Placeholder', 'blockenberg'), value: a.placeholderEmail, onChange: function (v) { sa({ placeholderEmail: v }); } }),
                    el(TextControl, { label: __('Button Label', 'blockenberg'), value: a.submitLabel, onChange: function (v) { sa({ submitLabel: v }); } }),
                    el(TextControl, { label: __('Success Message', 'blockenberg'), value: a.successMessage, onChange: function (v) { sa({ successMessage: v }); } }),
                    el(TextControl, { label: __('Error Message', 'blockenberg'), value: a.errorMessage, onChange: function (v) { sa({ errorMessage: v }); } })
                ),

                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Form Layout', 'blockenberg'), value: a.layout,
                        options: [{ label: __('Vertical (stacked)', 'blockenberg'), value: 'vertical' }, { label: __('Horizontal (inline)', 'blockenberg'), value: 'horizontal' }],
                        onChange: function (v) { sa({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: a['style'],
                        options: [
                            { label: __('Card (with background)', 'blockenberg'),  value: 'card' },
                            { label: __('Box (white card)',        'blockenberg'),  value: 'box' },
                            { label: __('Minimal (no background)', 'blockenberg'), value: 'minimal' },
                            { label: __('Inline (banner)',         'blockenberg'),  value: 'inline' }
                        ],
                        onChange: function (v) { sa({ style: v }); }
                    }),
                    el(RangeControl, { label: __('Max Width  (px)', 'blockenberg'), value: a.maxWidth, min: 200, max: 1200, onChange: function (v) { sa({ maxWidth: v }); } }),
                    el(RangeControl, { label: __('Padding (px)', 'blockenberg'), value: a.padding, min: 0, max: 80, onChange: function (v) { sa({ padding: v }); } }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 40, onChange: function (v) { sa({ borderRadius: v }); } }),
                    el(RangeControl, { label: __('Button Radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 40, onChange: function (v) { sa({ btnRadius: v }); } }),
                    ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Heading Typography', 'blockenberg'), value: a.headingTypo, onChange: function (v) { sa({ headingTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Subtitle Typography', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { sa({ subtitleTypo: v }); } })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    cc('bgColor',          __('Background', 'blockenberg'),       'bgColor'),
                    cc('headingColor',     __('Heading Color', 'blockenberg'),    'headingColor'),
                    cc('subtitleColor',    __('Subtitle Color', 'blockenberg'),   'subtitleColor'),
                    cc('fieldBg',          __('Field Background', 'blockenberg'), 'fieldBg'),
                    cc('fieldBorderColor', __('Field Border', 'blockenberg'),     'fieldBorderColor'),
                    cc('btnBg',            __('Button Background', 'blockenberg'),'btnBg'),
                    cc('btnColor',         __('Button Text', 'blockenberg'),      'btnColor')
                )
            );

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-nl-inner' },
                        el('div', { className: 'bkbg-nl-copy' },
                            a.showIcon && el('div', { className: 'bkbg-nl-icon' }, '✉️'),
                            el(RichText, {
                                tagName: 'h2', className: 'bkbg-nl-heading',
                                value: a.heading, placeholder: 'Heading…',
                                onChange: function (v) { sa({ heading: v }); },
                                allowedFormats: ['core/bold', 'core/italic']
                            }),
                            el(RichText, {
                                tagName: 'p', className: 'bkbg-nl-subtitle',
                                value: a.subheading, placeholder: 'Subtitle…',
                                onChange: function (v) { sa({ subheading: v }); },
                                allowedFormats: ['core/bold', 'core/italic']
                            })
                        ),
                        el('form', { className: 'bkbg-nl-form', onSubmit: function (e) { e.preventDefault(); } },
                            a.showName && el('input', { className: 'bkbg-nl-field', type: 'text', placeholder: a.placeholderName, readOnly: true }),
                            el('input', { className: 'bkbg-nl-field', type: 'email', placeholder: a.placeholderEmail, readOnly: true }),
                            el('button', { className: 'bkbg-nl-btn', type: 'button' }, a.submitLabel)
                        )
                    )
                )
            );
        },

        deprecated: [
            {
                attributes: wp.blocks.getBlockType('blockenberg/newsletter') ? wp.blocks.getBlockType('blockenberg/newsletter').attributes : {},
                save: function (props) {
                    var a = props.attributes;
                    var saveProps = wp.blockEditor.useBlockProps.save({
                        className: 'bkbg-nl-wrapper bkbg-nl-layout-' + a.layout + ' bkbg-nl-style-' + a['style'],
                        style: buildCSS(a),
                        'data-success': a.successMessage,
                        'data-error'  : a.errorMessage
                    });
                    return el('div', saveProps,
                        el('div', { className: 'bkbg-nl-inner' },
                            el('div', { className: 'bkbg-nl-copy' },
                                a.showIcon && el('div', { className: 'bkbg-nl-icon', 'aria-hidden': 'true' }, '✉️'),
                                el(RichText.Content, { tagName: 'h2', className: 'bkbg-nl-heading', value: a.heading }),
                                el(RichText.Content, { tagName: 'p',  className: 'bkbg-nl-subtitle', value: a.subheading })
                            ),
                            el('form', { className: 'bkbg-nl-form', noValidate: true },
                                a.showName && el('input', { className: 'bkbg-nl-field', type: 'text', name: 'name', placeholder: a.placeholderName, autoComplete: 'name' }),
                                el('input', { className: 'bkbg-nl-field', type: 'email', name: 'email', placeholder: a.placeholderEmail, required: true, autoComplete: 'email' }),
                                el('input', { type: 'text', name: 'website', style: { display: 'none' }, tabIndex: '-1', autoComplete: 'off' }),
                                el('div', { className: 'bkbg-nl-status', role: 'status', 'aria-live': 'polite' }),
                                el('button', { className: 'bkbg-nl-btn', type: 'submit' }, a.submitLabel)
                            )
                        )
                    );
                }
            }
        ],

        save: function (props) {
            var a = props.attributes;

            var saveProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-nl-wrapper bkbg-nl-layout-' + a.layout + ' bkbg-nl-style-' + a['style'],
                style: buildCSS(a),
                'data-success': a.successMessage,
                'data-error'  : a.errorMessage
            });

            return el('div', saveProps,
                el('div', { className: 'bkbg-nl-inner' },
                    el('div', { className: 'bkbg-nl-copy' },
                        a.showIcon && el('div', { className: 'bkbg-nl-icon', 'aria-hidden': 'true' }, '✉️'),
                        el(RichText.Content, { tagName: 'h2', className: 'bkbg-nl-heading', value: a.heading }),
                        el(RichText.Content, { tagName: 'p',  className: 'bkbg-nl-subtitle', value: a.subheading })
                    ),
                    el('form', { className: 'bkbg-nl-form', noValidate: true },
                        a.showName && el('input', { className: 'bkbg-nl-field', type: 'text', name: 'name', placeholder: a.placeholderName, autoComplete: 'name' }),
                        el('input', { className: 'bkbg-nl-field', type: 'email', name: 'email', placeholder: a.placeholderEmail, required: true, autoComplete: 'email' }),
                        // Honeypot
                        el('input', { type: 'text', name: 'website', style: { display: 'none' }, tabIndex: '-1', autoComplete: 'off' }),
                        el('div', { className: 'bkbg-nl-status', role: 'status', 'aria-live': 'polite' }),
                        el('button', { className: 'bkbg-nl-btn', type: 'submit' }, a.submitLabel)
                    )
                )
            );
        }
    });
}() );
