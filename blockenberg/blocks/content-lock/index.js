( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _TC, _tv;
    Object.defineProperty(window, '_bkbgCLgetTC', { get: function () { return _TC || (_TC = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_bkbgCLgetTV', { get: function () { return _tv || (_tv = window.bkbgTypoCssVars); } });

    var LOCK_TYPE_OPTIONS = [
        { label: 'Email Opt-in',     value: 'email' },
        { label: 'Password',         value: 'password' },
        { label: 'Click to Reveal',  value: 'click' },
    ];

    var LOCK_STYLE_OPTIONS = [
        { label: 'Blur preview',     value: 'blur' },
        { label: 'Hide completely',  value: 'hide' },
        { label: 'Fade out',         value: 'fade' },
    ];

    registerBlockType('blockenberg/content-lock', {
        title: __('Content Lock', 'blockenberg'),
        icon: 'lock',
        category: 'bkbg-marketing',
        description: __('Gate content behind an email opt-in, password, or click-reveal.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = window._bkbgCLgetTC;
            var tv = window._bkbgCLgetTV || function () { return {}; };
            var previewState = useState('locked');
            var previewMode = previewState[0];
            var setPreviewMode = previewState[1];

            var blockProps = useBlockProps();

            var gateStyle = Object.assign({
                background: a.gateBg,
                borderRadius: a.borderRadius + 'px',
                padding: a.padding + 'px',
                maxWidth: a.maxWidth + 'px',
                margin: '0 auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            }, tv(a.typoHeading, '--bkcl-head-'), tv(a.typoButton, '--bkcl-btn-'));

            var contentStyle = {
                filter: a.lockStyle === 'blur' ? 'blur(' + a.blurAmount + 'px)' : 'none',
                userSelect: 'none',
                pointerEvents: 'none',
                position: 'relative',
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Lock Type Panel
                    el(PanelBody, { title: 'Lock Type', initialOpen: true },
                        el(SelectControl, {
                            label: 'Gate Method',
                            value: a.lockType,
                            options: LOCK_TYPE_OPTIONS,
                            onChange: function (v) { set({ lockType: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(SelectControl, {
                            label: 'Content Lock Style',
                            value: a.lockStyle,
                            options: LOCK_STYLE_OPTIONS,
                            onChange: function (v) { set({ lockStyle: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.lockStyle === 'blur' && el(Fragment, null,
                            el('div', { style: { height: 12 } }),
                            el(RangeControl, {
                                label: 'Blur Amount (px)',
                                value: a.blurAmount,
                                min: 1, max: 20,
                                onChange: function (v) { set({ blurAmount: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 12 } }),
                            el(RangeControl, {
                                label: 'Visible preview lines',
                                value: a.teaserLines,
                                min: 1, max: 10,
                                onChange: function (v) { set({ teaserLines: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 12 } }),
                        a.lockType === 'email' && el(Fragment, null,
                            el(ToggleControl, {
                                label: 'Remember unlock (localStorage)',
                                checked: a.rememberUnlock,
                                onChange: function (v) { set({ rememberUnlock: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Storage Key (unique per block)',
                                value: a.storageKey,
                                placeholder: 'e.g. guide-2024',
                                onChange: function (v) { set({ storageKey: v }); },
                                help: 'Unique ID so each lock is remembered separately.',
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Webhook URL (optional)',
                                value: a.webhookUrl,
                                placeholder: 'https://hooks.zapier.com/...',
                                onChange: function (v) { set({ webhookUrl: v }); },
                                help: 'POST email to this URL (Zapier, Make, etc.)',
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        a.lockType === 'password' && el(Fragment, null,
                            el(TextControl, {
                                label: 'Password',
                                value: a.password,
                                type: 'text',
                                onChange: function (v) { set({ password: v }); },
                                help: 'Password is stored in HTML. Not for sensitive content.',
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Locked Content Panel
                    el(PanelBody, { title: 'Locked Content', initialOpen: true },
                        el('p', { style: { fontSize: 12, color: '#6b7280', margin: '0 0 8px' } },
                            'Paste or type the content that will be locked. HTML is supported.'
                        ),
                        el(TextareaControl, {
                            label: 'Locked Content (HTML)',
                            value: a.lockedContent,
                            rows: 6,
                            onChange: function (v) { set({ lockedContent: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Gate UI Panel
                    el(PanelBody, { title: 'Gate Appearance', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Icon',
                            checked: a.showIcon,
                            onChange: function (v) { set({ showIcon: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showIcon && el(TextControl, {
                            label: 'Icon (emoji)',
                            value: a.icon,
                            onChange: function (v) { set({ icon: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, {
                            label: 'Show Eyebrow Label',
                            checked: a.showEyebrow,
                            onChange: function (v) { set({ showEyebrow: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showEyebrow && el(TextControl, {
                            label: 'Eyebrow Text',
                            value: a.eyebrow,
                            onChange: function (v) { set({ eyebrow: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 10 } }),
                        el(TextControl, {
                            label: 'Heading',
                            value: a.heading,
                            onChange: function (v) { set({ heading: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 10 } }),
                        el(TextControl, {
                            label: 'Sub-text',
                            value: a.subText,
                            onChange: function (v) { set({ subText: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Max Width (px)',
                            value: a.maxWidth,
                            min: 300, max: 900,
                            onChange: function (v) { set({ maxWidth: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Padding (px)',
                            value: a.padding,
                            min: 16, max: 80,
                            onChange: function (v) { set({ padding: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Border Radius (px)',
                            value: a.borderRadius,
                            min: 0, max: 40,
                            onChange: function (v) { set({ borderRadius: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Input Border Radius (px)',
                            value: a.inputRadius,
                            min: 0, max: 32,
                            onChange: function (v) { set({ inputRadius: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Form fields Panel
                    el(PanelBody, { title: 'Form Labels', initialOpen: false },
                        a.lockType === 'email' && el(Fragment, null,
                            el(TextControl, {
                                label: 'Email Placeholder',
                                value: a.emailPlaceholder,
                                onChange: function (v) { set({ emailPlaceholder: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Submit Button Label',
                                value: a.submitLabel,
                                onChange: function (v) { set({ submitLabel: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(ToggleControl, {
                                label: 'Show Privacy Note',
                                checked: a.showPrivacy,
                                onChange: function (v) { set({ showPrivacy: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            a.showPrivacy && el(TextControl, {
                                label: 'Privacy Note',
                                value: a.privacyNote,
                                onChange: function (v) { set({ privacyNote: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Success Heading',
                                value: a.successHeading,
                                onChange: function (v) { set({ successHeading: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Success Text',
                                value: a.successText,
                                onChange: function (v) { set({ successText: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        a.lockType === 'password' && el(Fragment, null,
                            el(TextControl, {
                                label: 'Password Input Placeholder',
                                value: a.passwordPlaceholder,
                                onChange: function (v) { set({ passwordPlaceholder: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Submit Button Label',
                                value: a.passwordSubmitLabel,
                                onChange: function (v) { set({ passwordSubmitLabel: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Error Message',
                                value: a.passwordErrorMsg,
                                onChange: function (v) { set({ passwordErrorMsg: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        a.lockType === 'click' && el(Fragment, null,
                            el(TextControl, {
                                label: 'Reveal Button Label',
                                value: a.clickButtonLabel,
                                onChange: function (v) { set({ clickButtonLabel: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Button Icon (emoji)',
                                value: a.clickButtonIcon,
                                onChange: function (v) { set({ clickButtonIcon: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Colors Panel
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Heading', 'blockenberg'), value: a.typoHeading, onChange: function (v) { set({ typoHeading: v }); } }),
                        TC && el(TC, { label: __('Button', 'blockenberg'), value: a.typoButton, onChange: function (v) { set({ typoButton: v }); } }),
                        el(RangeControl, { label: __('Eyebrow Size (px)', 'blockenberg'), value: a.eyebrowSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ eyebrowSize: v }); } }),
                        el(RangeControl, { label: __('Sub-text Size (px)', 'blockenberg'), value: a.subTextSize, min: 12, max: 36, __nextHasNoMarginBottom: true, onChange: function (v) { set({ subTextSize: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Gate Card Background', value: a.gateBg, onChange: function (v) { set({ gateBg: v || '#ffffff' }); } },
                            { label: 'Eyebrow Color', value: a.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#6366f1' }); } },
                            { label: 'Heading Color', value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                            { label: 'Text Color', value: a.textColor, onChange: function (v) { set({ textColor: v || '#6b7280' }); } },
                            { label: 'Input Background', value: a.inputBg, onChange: function (v) { set({ inputBg: v || '#f9fafb' }); } },
                            { label: 'Input Border', value: a.inputBorder, onChange: function (v) { set({ inputBorder: v || '#e5e7eb' }); } },
                            { label: 'Input Focus Border', value: a.inputFocusBorder, onChange: function (v) { set({ inputFocusBorder: v || '#6366f1' }); } },
                            { label: 'Button Background', value: a.btnBg, onChange: function (v) { set({ btnBg: v || '#6366f1' }); } },
                            { label: 'Button Text Color', value: a.btnColor, onChange: function (v) { set({ btnColor: v || '#ffffff' }); } },
                            { label: 'Privacy Note Color', value: a.privacyColor, onChange: function (v) { set({ privacyColor: v || '#9ca3af' }); } },
                        ]
                    })
                ),

                // Editor Preview
                el('div', blockProps,
                    // Preview toggle
                    el('div', { style: { display: 'flex', gap: 8, marginBottom: 12 } },
                        el(Button, {
                            onClick: function () { setPreviewMode('locked'); },
                            variant: previewMode === 'locked' ? 'primary' : 'secondary',
                            size: 'small',
                            __nextHasNoMarginBottom: true,
                        }, '🔒 Locked view'),
                        el(Button, {
                            onClick: function () { setPreviewMode('unlocked'); },
                            variant: previewMode === 'unlocked' ? 'primary' : 'secondary',
                            size: 'small',
                            __nextHasNoMarginBottom: true,
                        }, '🔓 Unlocked view')
                    ),

                    // Locked view
                    previewMode === 'locked' && el('div', { className: 'bkbg-cl-locked-preview', style: { position: 'relative' } },
                        // Blurred content behind
                        a.lockStyle !== 'hide' && el('div', { style: contentStyle },
                            el('div', { dangerouslySetInnerHTML: { __html: a.lockedContent } })
                        ),
                        // Gate overlay
                        el('div', {
                            style: {
                                position: a.lockStyle !== 'hide' ? 'absolute' : 'static',
                                inset: a.lockStyle !== 'hide' ? '0' : 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: a.lockStyle !== 'hide' ? '20px' : '0',
                                background: a.lockStyle !== 'hide' ? 'linear-gradient(transparent 0%, rgba(255,255,255,0.95) 40%)' : 'transparent',
                            }
                        },
                            el('div', { style: gateStyle },
                                a.showIcon && a.icon && el('div', { style: { fontSize: 40 } }, a.icon),
                                a.showEyebrow && a.eyebrow && el('div', {
                                    style: {
                                        fontSize: (a.eyebrowSize || 11),
                                        fontWeight: 700,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        color: a.eyebrowColor,
                                    }
                                }, a.eyebrow),
                                el('h3', { className: 'bkbg-cl-heading', style: { margin: 0, color: a.headingColor } }, a.heading),
                                a.subText && el('p', { style: { margin: 0, fontSize: (a.subTextSize || 14), color: a.textColor, lineHeight: 1.6 } }, a.subText),
                                // Form preview (readonly)
                                a.lockType === 'email' && el('div', { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 } },
                                    el('input', {
                                        type: 'email',
                                        placeholder: a.emailPlaceholder,
                                        disabled: true,
                                        style: {
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: a.inputRadius + 'px',
                                            border: '1px solid ' + a.inputBorder,
                                            background: a.inputBg,
                                            fontSize: 15,
                                            boxSizing: 'border-box',
                                        }
                                    }),
                                    el('button', {
                                        disabled: true,
                                        className: 'bkbg-cl-btn',
                                        style: {
                                            padding: '12px 24px',
                                            borderRadius: a.inputRadius + 'px',
                                            background: a.btnBg,
                                            color: a.btnColor,
                                            border: 'none',
                                            cursor: 'not-allowed',
                                        }
                                    }, a.submitLabel),
                                    a.showPrivacy && el('p', { style: { margin: 0, fontSize: 12, color: a.privacyColor } }, a.privacyNote)
                                ),
                                a.lockType === 'password' && el('div', { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 } },
                                    el('input', {
                                        type: 'password',
                                        placeholder: a.passwordPlaceholder,
                                        disabled: true,
                                        style: {
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: a.inputRadius + 'px',
                                            border: '1px solid ' + a.inputBorder,
                                            background: a.inputBg,
                                            fontSize: 15,
                                            boxSizing: 'border-box',
                                        }
                                    }),
                                    el('button', {
                                        disabled: true,
                                        className: 'bkbg-cl-btn',
                                        style: {
                                            padding: '12px 24px',
                                            borderRadius: a.inputRadius + 'px',
                                            background: a.btnBg,
                                            color: a.btnColor,
                                            border: 'none',
                                            cursor: 'not-allowed',
                                        }
                                    }, a.passwordSubmitLabel)
                                ),
                                a.lockType === 'click' && el('button', {
                                    disabled: true,
                                    className: 'bkbg-cl-btn',
                                    style: {
                                        padding: '14px 28px',
                                        borderRadius: a.inputRadius + 'px',
                                        background: a.btnBg,
                                        color: a.btnColor,
                                        border: 'none',
                                        cursor: 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }
                                }, a.clickButtonIcon + ' ' + a.clickButtonLabel)
                            )
                        )
                    ),

                    // Unlocked view
                    previewMode === 'unlocked' && el('div', null,
                        el('div', {
                            style: {
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: 8,
                                padding: '8px 14px',
                                marginBottom: 12,
                                fontSize: 13,
                                color: '#166534',
                            }
                        }, '✅ ' + a.successHeading + ' — ' + a.successText),
                        el('div', { dangerouslySetInnerHTML: { __html: a.lockedContent } })
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-cl-app',
                    'data-opts': JSON.stringify(props.attributes),
                })
            );
        }
    });
}() );
