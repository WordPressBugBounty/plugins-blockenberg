( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody    = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function () { return {}; };
    }
    function _tv(typoObj, prefix) { return getTypoCssVars()(typoObj || {}, prefix); }

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

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-cf-bg'          : a.bgColor,
            '--bkbg-cf-label-color' : a.labelColor,
            '--bkbg-cf-field-bg'    : a.fieldBg,
            '--bkbg-cf-field-border': a.fieldBorderColor,
            '--bkbg-cf-field-focus' : a.fieldFocusColor,
            '--bkbg-cf-btn-bg'      : a.btnBg,
            '--bkbg-cf-btn-color'   : a.btnColor,
            '--bkbg-cf-radius'      : a.fieldRadius + 'px',
            '--bkbg-cf-btn-radius'  : a.btnRadius + 'px',
            '--bkbg-cf-pad'         : a.fieldPadding + 'px',
            '--bkbg-cf-label-sz'    : a.labelSize + 'px',
            '--bkbg-cf-field-sz'    : a.fieldSize + 'px',
            maxWidth: a.maxWidth + 'px',
            width: '100%'
        }, _tv(a.typoLabel, '--bkcf-label-'), _tv(a.typoButton, '--bkcf-btn-'));
    }

    /* simple field preview */
    function previewField(label, placeholder, type) {
        return el('div', { className: 'bkbg-cf-field-group' },
            el('label', { className: 'bkbg-cf-label' }, label),
            type === 'textarea'
                ? el('textarea', { className: 'bkbg-cf-field bkbg-cf-textarea', placeholder: placeholder, rows: 5, readOnly: true })
                : el('input', { className: 'bkbg-cf-field', type: type || 'text', placeholder: placeholder, readOnly: true })
        );
    }

    registerBlockType('blockenberg/contact-form', {
        title: __('Contact Form', 'blockenberg'),
        icon: 'email-alt',
        category: 'bkbg-business',
        description: __('A styled contact form that sends email via WordPress — no plugin needed.', 'blockenberg'),

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

            var blockProps = useBlockProps({ className: 'bkbg-cf-wrapper', style: buildWrapStyle(a) });

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Fields', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Name Field', 'blockenberg'),    checked: a.showName,    onChange: function (v) { sa({ showName: v }); } }),
                    el(ToggleControl, { label: __('Email Field', 'blockenberg'),   checked: a.showEmail,   onChange: function (v) { sa({ showEmail: v }); } }),
                    el(ToggleControl, { label: __('Phone Field', 'blockenberg'),   checked: a.showPhone,   onChange: function (v) { sa({ showPhone: v }); } }),
                    el(ToggleControl, { label: __('Message Field', 'blockenberg'), checked: a.showMessage, onChange: function (v) { sa({ showMessage: v }); } }),
                    el(ToggleControl, { label: __('GDPR Checkbox', 'blockenberg'), checked: a.showGdpr,    onChange: function (v) { sa({ showGdpr: v }); } })
                ),

                el(PanelBody, { title: __('Labels & Placeholders', 'blockenberg'), initialOpen: false },
                    a.showName && el(Fragment, {},
                        el(TextControl, { label: __('Name Label', 'blockenberg'),        value: a.labelName,        onChange: function (v) { sa({ labelName: v }); } }),
                        el(TextControl, { label: __('Name Placeholder', 'blockenberg'),  value: a.placeholderName,  onChange: function (v) { sa({ placeholderName: v }); } })
                    ),
                    a.showEmail && el(Fragment, {},
                        el(TextControl, { label: __('Email Label', 'blockenberg'),       value: a.labelEmail,       onChange: function (v) { sa({ labelEmail: v }); } }),
                        el(TextControl, { label: __('Email Placeholder', 'blockenberg'), value: a.placeholderEmail, onChange: function (v) { sa({ placeholderEmail: v }); } })
                    ),
                    a.showPhone && el(Fragment, {},
                        el(TextControl, { label: __('Phone Label', 'blockenberg'),       value: a.labelPhone,       onChange: function (v) { sa({ labelPhone: v }); } }),
                        el(TextControl, { label: __('Phone Placeholder', 'blockenberg'), value: a.placeholderPhone, onChange: function (v) { sa({ placeholderPhone: v }); } })
                    ),
                    a.showMessage && el(Fragment, {},
                        el(TextControl, { label: __('Message Label', 'blockenberg'),       value: a.labelMessage,       onChange: function (v) { sa({ labelMessage: v }); } }),
                        el(TextControl, { label: __('Message Placeholder', 'blockenberg'), value: a.placeholderMessage, onChange: function (v) { sa({ placeholderMessage: v }); } })
                    ),
                    a.showGdpr && el(TextControl, { label: __('GDPR Label', 'blockenberg'), value: a.labelGdpr, onChange: function (v) { sa({ labelGdpr: v }); } })
                ),

                el(PanelBody, { title: __('Email Settings', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Submit Button Label', 'blockenberg'), value: a.submitLabel,   onChange: function (v) { sa({ submitLabel: v }); } }),
                    el(TextControl, { label: __('Recipient Email (blank = admin)', 'blockenberg'), value: a.recipientEmail, onChange: function (v) { sa({ recipientEmail: v }); }, type: 'email', help: __('Leave blank to use the WordPress admin email.', 'blockenberg') }),
                    el(TextControl, { label: __('Email Subject', 'blockenberg'), value: a.emailSubject, onChange: function (v) { sa({ emailSubject: v }); } }),
                    el(TextControl, { label: __('Success Message', 'blockenberg'), value: a.successMessage, onChange: function (v) { sa({ successMessage: v }); } }),
                    el(TextControl, { label: __('Error Message', 'blockenberg'), value: a.errorMessage, onChange: function (v) { sa({ errorMessage: v }); } })
                ),

                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 300, max: 1200, onChange: function (v) { sa({ maxWidth: v }); } }),
                    el(RangeControl, { label: __('Field Padding (px)', 'blockenberg'), value: a.fieldPadding, min: 6, max: 24, onChange: function (v) { sa({ fieldPadding: v }); } }),
                    el(RangeControl, { label: __('Field Border Radius (px)', 'blockenberg'), value: a.fieldRadius, min: 0, max: 24, onChange: function (v) { sa({ fieldRadius: v }); } }),
                    el(RangeControl, { label: __('Button Border Radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 40, onChange: function (v) { sa({ btnRadius: v }); } }),
                    el(SelectControl, {
                        label: __('Button Style', 'blockenberg'), value: a.btnStyle,
                        options: [{ label: 'Primary (solid)', value: 'primary' }, { label: 'Outline', value: 'outline' }, { label: 'Full Width', value: 'full' }],
                        onChange: function (v) { sa({ btnStyle: v }); }
                    }),
                    cc('bgColor', __('Form Background', 'blockenberg'), 'bgColor'),
                    cc('labelColor', __('Label Color', 'blockenberg'), 'labelColor'),
                    cc('fieldBg', __('Field Background', 'blockenberg'), 'fieldBg'),
                    cc('fieldBorderColor', __('Field Border Color', 'blockenberg'), 'fieldBorderColor'),
                    cc('fieldFocusColor', __('Field Focus Color', 'blockenberg'), 'fieldFocusColor'),
                    cc('btnBg', __('Button Background', 'blockenberg'), 'btnBg'),
                    cc('btnColor', __('Button Text Color', 'blockenberg'), 'btnColor')
                ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                        return el(Fragment, {},
                            el(TC, {
                                label: __('Labels', 'blockenberg'),
                                value: a.typoLabel || {},
                                onChange: function (v) { sa({ typoLabel: v }); }
                            }),
                            el(TC, {
                                label: __('Submit Button', 'blockenberg'),
                                value: a.typoButton || {},
                                onChange: function (v) { sa({ typoButton: v }); }
                            })
                        );
                    })()
                )
            );

            /* ── Editor Preview ─────────────────────────────────────────── */
            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('form', { className: 'bkbg-cf-form', onSubmit: function (e) { e.preventDefault(); } },
                        a.showName    && previewField(a.labelName,    a.placeholderName,    'text'),
                        a.showEmail   && previewField(a.labelEmail,   a.placeholderEmail,   'email'),
                        a.showPhone   && previewField(a.labelPhone,   a.placeholderPhone,   'tel'),
                        a.showMessage && previewField(a.labelMessage, a.placeholderMessage, 'textarea'),
                        a.showGdpr && el('div', { className: 'bkbg-cf-field-group bkbg-cf-gdpr' },
                            el('label', { className: 'bkbg-cf-gdpr-label' },
                                el('input', { type: 'checkbox', readOnly: true }),
                                el('span', {}, a.labelGdpr)
                            )
                        ),
                        el('button', { className: 'bkbg-cf-submit bkbg-cf-btn-' + a.btnStyle, type: 'button' }, a.submitLabel)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function fld(label, name, type, placeholder, required) {
                if (type === 'textarea') {
                    return el('div', { className: 'bkbg-cf-field-group' },
                        el('label', { className: 'bkbg-cf-label', htmlFor: 'bkbg-cf-' + name }, label),
                        el('textarea', { className: 'bkbg-cf-field bkbg-cf-textarea', id: 'bkbg-cf-' + name, name: name, placeholder: placeholder, rows: 5, required: required || undefined })
                    );
                }
                return el('div', { className: 'bkbg-cf-field-group' },
                    el('label', { className: 'bkbg-cf-label', htmlFor: 'bkbg-cf-' + name }, label),
                    el('input', { className: 'bkbg-cf-field', id: 'bkbg-cf-' + name, type: type, name: name, placeholder: placeholder, required: required || undefined })
                );
            }

            var saveProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-cf-wrapper',
                style: Object.assign({
                    '--bkbg-cf-bg'          : a.bgColor,
                    '--bkbg-cf-label-color' : a.labelColor,
                    '--bkbg-cf-field-bg'    : a.fieldBg,
                    '--bkbg-cf-field-border': a.fieldBorderColor,
                    '--bkbg-cf-field-focus' : a.fieldFocusColor,
                    '--bkbg-cf-btn-bg'      : a.btnBg,
                    '--bkbg-cf-btn-color'   : a.btnColor,
                    '--bkbg-cf-radius'      : a.fieldRadius + 'px',
                    '--bkbg-cf-btn-radius'  : a.btnRadius + 'px',
                    '--bkbg-cf-pad'         : a.fieldPadding + 'px',
                    '--bkbg-cf-label-sz'    : a.labelSize + 'px',
                    '--bkbg-cf-field-sz'    : a.fieldSize + 'px',
                    maxWidth: a.maxWidth + 'px',
                    width: '100%'
                }, _tv(a.typoLabel, '--bkcf-label-'), _tv(a.typoButton, '--bkcf-btn-')),
                'data-recipient': a.recipientEmail,
                'data-subject'  : a.emailSubject,
                'data-success'  : a.successMessage,
                'data-error'    : a.errorMessage
            });

            return el('div', saveProps,
                el('form', { className: 'bkbg-cf-form', noValidate: true },
                    a.showName    && fld(a.labelName,    'name',    'text',     a.placeholderName,    true),
                    a.showEmail   && fld(a.labelEmail,   'email',   'email',    a.placeholderEmail,   true),
                    a.showPhone   && fld(a.labelPhone,   'phone',   'tel',      a.placeholderPhone,   false),
                    a.showMessage && fld(a.labelMessage, 'message', 'textarea', a.placeholderMessage, true),
                    // Honeypot
                    el('div', { className: 'bkbg-cf-hp', 'aria-hidden': 'true', style: { display: 'none' } },
                        el('input', { type: 'text', name: 'website', tabIndex: '-1', autoComplete: 'off' })
                    ),
                    a.showGdpr && el('div', { className: 'bkbg-cf-field-group bkbg-cf-gdpr' },
                        el('label', { className: 'bkbg-cf-gdpr-label' },
                            el('input', { type: 'checkbox', name: 'gdpr', required: true }),
                            el('span', {}, a.labelGdpr)
                        )
                    ),
                    el('div', { className: 'bkbg-cf-status', role: 'status', 'aria-live': 'polite' }),
                    el('button', { className: 'bkbg-cf-submit bkbg-cf-btn-' + a.btnStyle, type: 'submit' }, a.submitLabel)
                )
            );
        }
    });
}() );
