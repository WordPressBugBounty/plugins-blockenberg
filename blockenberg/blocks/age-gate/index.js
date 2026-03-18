( function () {
    var el                = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText          = wp.blockEditor.RichText;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var Fragment          = wp.element.Fragment;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    registerBlockType('blockenberg/age-gate', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-ag-editor-wrap bkbg-ag-wrap', style: (function () {
                var s = {};
                var _tv = getTypoCssVars();
                Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-ag-title-'));
                Object.assign(s, _tv(a.messageTypo || {}, '--bkbg-ag-message-'));
                s['--bkbg-ag-title-sz'] = (a.titleSize || 26) + 'px';
                s['--bkbg-ag-message-sz'] = (a.messageSize || 15) + 'px';
                return s;
            })() });

            // Editor preview
            var previewCard = el('div', { className: 'bkbg-ag-preview',
                style: { background: a.overlayBg || 'rgba(0,0,0,0.75)', borderRadius: 10,
                    padding: '40px 20px', textAlign: 'center', position: 'relative' }
            },
                el('div', { className: 'bkbg-ag-card',
                    style: {
                        background: a.cardBg || '#ffffff',
                        borderRadius: (a.cardRadius || 16) + 'px',
                        padding: (a.cardPadding || 48) + 'px',
                        maxWidth: (a.cardMaxWidth || 480) + 'px',
                        margin: '0 auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
                    }
                },
                    a.logoUrl && el('div', { style: { marginBottom: 16 } },
                        el('img', { src: a.logoUrl, style: { maxHeight: (a.logoSize || 80) + 'px', margin: '0 auto', display: 'block' } })
                    ),
                    el(RichText, {
                        tagName: 'h3', value: a.title, placeholder: 'Age Verification Required',
                        className: 'bkbg-ag-title',
                        style: { margin: '0 0 16px',
                            color: a.titleColor || '#1e1b4b' },
                        onChange: function (v) { set({ title: v }); }
                    }),
                    el(RichText, {
                        tagName: 'p', value: a.message, placeholder: 'Enter your age verification message...',
                        className: 'bkbg-ag-message',
                        style: { margin: '0 0 28px',
                            color: a.messageColor || '#64748b' },
                        onChange: function (v) { set({ message: v }); }
                    }),
                    // Verification mode preview
                    a.verificationMode === 'dob'
                        ? el('div', { style: { marginBottom: 20 } },
                            el('label', { style: { fontSize: 13, color: a.messageColor || '#64748b', display: 'block', marginBottom: 6 } }, 'Date of Birth'),
                            el('input', { type: 'date', disabled: true,
                                style: { border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 14px',
                                    fontSize: 15, width: '100%', color: a.titleColor || '#1e1b4b' } })
                          )
                        : null,
                    el('div', { className: 'bkbg-ag-btns', style: { display: 'flex', gap: 12, flexDirection: 'column' } },
                        el('div', { style: { background: a.confirmBg || '#6366f1', color: a.confirmColor || '#ffffff',
                            borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 15, textAlign: 'center' }
                        }, a.confirmText || 'Yes, I am old enough'),
                        el('div', { style: { background: a.denyBg || '#f1f5f9', color: a.denyColor || '#64748b',
                            borderRadius: 10, padding: '10px 24px', fontSize: 14, textAlign: 'center' }
                        }, a.denyText || 'No, take me back')
                    ),
                    a.disclaimer && el('p', { style: { marginTop: 20, fontSize: 11, color: a.messageColor || '#64748b',
                        opacity: 0.65, lineHeight: 1.5 } }, a.disclaimer),
                    el('p', { style: { marginTop: 12, fontSize: 11, opacity: 0.4, color: a.titleColor || '#1e1b4b' } },
                        'ℹ️ This overlay will appear on the frontend. Remembered for ' + (a.rememberDays || 30) + ' days.')
                )
            );

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(TextControl, { label: 'Confirm button text', value: a.confirmText || '',
                            onChange: function (v) { set({ confirmText: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Deny button text', value: a.denyText || '',
                            onChange: function (v) { set({ denyText: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Deny redirect URL (optional)', value: a.denyRedirectUrl || '',
                            onChange: function (v) { set({ denyRedirectUrl: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Disclaimer text', value: a.disclaimer || '',
                            onChange: function (v) { set({ disclaimer: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Gate Settings', initialOpen: false },
                        el(SelectControl, { label: 'Verification mode', value: a.verificationMode || 'yesno',
                            options: [
                                { label: 'Yes / No buttons', value: 'yesno' },
                                { label: 'Date of birth input', value: 'dob' }
                            ],
                            onChange: function (v) { set({ verificationMode: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Minimum age', value: a.minimumAge || 18,
                            onChange: function (v) { set({ minimumAge: v }); }, min: 13, max: 21, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Remember choice for (days)', value: a.rememberDays || 30,
                            onChange: function (v) { set({ rememberDays: v }); }, min: 0, max: 365, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Logo URL (optional)', value: a.logoUrl || '',
                            onChange: function (v) { set({ logoUrl: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Logo max height (px)', value: a.logoSize || 80,
                            onChange: function (v) { set({ logoSize: v }); }, min: 30, max: 200, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Card Style', initialOpen: false },
                        el(RangeControl, { label: 'Card max-width (px)', value: a.cardMaxWidth || 480,
                            onChange: function (v) { set({ cardMaxWidth: v }); }, min: 300, max: 800, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Card padding', value: a.cardPadding || 48,
                            onChange: function (v) { set({ cardPadding: v }); }, min: 16, max: 80, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Card border radius', value: a.cardRadius || 16,
                            onChange: function (v) { set({ cardRadius: v }); }, min: 0, max: 40, __nextHasNoMarginBottom: true }),
                        ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', null, 'Typography control not loaded.');
                            return el(Fragment, null,
                                el(TC, { label: 'Title Typography', value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                                el(TC, { label: 'Message Typography', value: a.messageTypo || {}, onChange: function (v) { set({ messageTypo: v }); } })
                            );
                        })()
                    ),
el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Overlay background', value: a.overlayBg, onChange: function (v) { set({ overlayBg: v || 'rgba(0,0,0,0.75)' }); } },
                            { label: 'Card background',    value: a.cardBg,   onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Title color',        value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#1e1b4b' }); } },
                            { label: 'Message color',      value: a.messageColor, onChange: function (v) { set({ messageColor: v || '#64748b' }); } },
                            { label: 'Confirm button bg',  value: a.confirmBg, onChange: function (v) { set({ confirmBg: v || '#6366f1' }); } },
                            { label: 'Confirm text color', value: a.confirmColor, onChange: function (v) { set({ confirmColor: v || '#ffffff' }); } },
                            { label: 'Deny button bg',     value: a.denyBg, onChange: function (v) { set({ denyBg: v || '#f1f5f9' }); } },
                            { label: 'Deny text color',    value: a.denyColor, onChange: function (v) { set({ denyColor: v || '#64748b' }); } }
                        ],
                        enableAlpha: true,
                        disableCustomGradients: true
                    })
                ),
                previewCard
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                minimumAge:       a.minimumAge       || 18,
                verificationMode: a.verificationMode || 'yesno',
                logoUrl:          a.logoUrl          || '',
                confirmText:      a.confirmText      || 'Yes, I am old enough',
                denyText:         a.denyText         || 'No, take me back',
                denyRedirectUrl:  a.denyRedirectUrl  || '',
                rememberDays:     a.rememberDays      >= 0 ? a.rememberDays : 30,
                disclaimer:       a.disclaimer       || '',
                cardRadius:       a.cardRadius       || 16,
                cardPadding:      a.cardPadding       || 48,
                cardMaxWidth:     a.cardMaxWidth      || 480,
                logoSize:         a.logoSize          || 80,
                titleSize:        a.titleSize         || 26,
                messageSize:      a.messageSize       || 15,
                overlayBg:        a.overlayBg         || 'rgba(0,0,0,0.75)',
                cardBg:           a.cardBg            || '#ffffff',
                titleColor:       a.titleColor        || '#1e1b4b',
                messageColor:     a.messageColor      || '#64748b',
                confirmBg:        a.confirmBg         || '#6366f1',
                confirmColor:     a.confirmColor      || '#ffffff',
                denyBg:           a.denyBg            || '#f1f5f9',
                denyColor:        a.denyColor         || '#64748b',
                titleTypo:        a.titleTypo         || {},
                messageTypo:      a.messageTypo       || {}
            };

            return el('div', blockProps,
                el('div', { className: 'bkbg-ag-app', 'data-opts': JSON.stringify(opts) },
                    el(RichText.Content, { tagName: 'div', className: 'bkbg-ag-title-src', value: a.title }),
                    el(RichText.Content, { tagName: 'div', className: 'bkbg-ag-message-src', value: a.message })
                )
            );
        }
    });
}() );
