( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var Notice = wp.components.Notice;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ────────────────── helpers ────────────────── */
    function hexWithAlpha(hex, opacityPercent) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacityPercent / 100).toFixed(2) + ')';
    }

    function triggerLabel(t) {
        if (t === 'delay')  return 'Time delay';
        if (t === 'scroll') return 'Scroll depth';
        if (t === 'both')   return 'Delay + Scroll';
        return t;
    }

    /* ────────────────── editor preview ────────────────── */
    function PopupPreview(props) {
        var a = props.attributes;
        var hasImage = a.imageUrl && a.imagePosition !== 'none';
        var isTopImage = a.imagePosition === 'top';
        var isSide = a.imagePosition === 'left' || a.imagePosition === 'right';

        var boxStyle = {
            background: a.popupBg,
            borderRadius: a.borderRadius + 'px',
            padding: a.padding + 'px',
            maxWidth: a.maxWidth + 'px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)',
            display: isSide ? 'flex' : 'block',
            alignItems: 'stretch',
            overflow: 'hidden'
        };

        var contentStyle = { flex: 1 };

        var sideImgStyle = {
            width: '42%',
            flexShrink: 0,
            backgroundImage: 'url(' + a.imageUrl + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: (a.imagePosition === 'left' ? a.borderRadius + 'px 0 0 ' + a.borderRadius : '0 ' + a.borderRadius + ' ' + a.borderRadius + ' 0') + 'px',
            margin: '-' + a.padding + 'px'
        };
        if (a.imagePosition === 'left') {
            sideImgStyle.marginRight = a.padding + 'px';
        } else {
            sideImgStyle.marginLeft = a.padding + 'px';
        }

        var topImgStyle = {
            width: 'calc(100% + ' + (a.padding * 2) + 'px)',
            height: '180px',
            backgroundImage: 'url(' + a.imageUrl + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            margin: '-' + a.padding + 'px -' + a.padding + 'px ' + (a.padding / 2) + 'px'
        };

        var closeBtn = a.showClose ? el('div', {
            style: {
                position: 'absolute', top: '12px', right: '12px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: a.closeBg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', fontSize: '14px',
                color: a.closeColor, fontWeight: 700, lineHeight: 1
            }
        }, '×') : null;

        var heading = el('div', {
            className: 'bkbg-nlpop-heading',
            style: {
                color: a.headingColor,
                marginBottom: '10px'
            }
        }, a.heading || 'Popup Heading');

        var subtext = el('div', {
            className: 'bkbg-nlpop-subtext',
            style: {
                color: a.textColor,
                marginBottom: '20px'
            }
        }, a.subtext || 'Your newsletter description goes here.');

        var emailRow = el('div', {
            style: { display: 'flex', gap: '8px', alignItems: 'stretch' }
        },
            el('input', {
                type: 'email',
                placeholder: a.emailPlaceholder,
                readOnly: true,
                style: {
                    flex: 1, padding: '10px 14px',
                    borderRadius: '8px', border: '1.5px solid ' + a.inputBorder,
                    background: a.inputBg, color: a.inputColor,
                    fontSize: '14px', outline: 'none'
                }
            }),
            el('button', {
                style: {
                    background: a.buttonBg, color: a.buttonColor,
                    border: 'none', borderRadius: '8px',
                    padding: '10px 18px', fontWeight: 700,
                    fontSize: a.ctaSize + 'px', cursor: 'pointer',
                    whiteSpace: 'nowrap'
                }
            }, a.buttonLabel || 'Subscribe')
        );

        var trigger = el('div', {
            style: {
                marginTop: '12px', fontSize: '11px',
                color: '#9ca3af', textAlign: 'center'
            }
        }, '⚡ Trigger: ' + triggerLabel(a.triggerType) + (
            a.triggerType !== 'scroll' ? ' · ' + a.delaySeconds + 's delay' : ''
        ) + (
            a.triggerType !== 'delay' ? ' · ' + a.scrollPercent + '% scroll' : ''
        ) + ' · cookie ' + a.cookieDays + ' days');

        var content = el(Fragment, {},
            closeBtn,
            hasImage && isTopImage ? el('div', { style: topImgStyle }) : null,
            el('div', { style: contentStyle },
                heading,
                subtext,
                emailRow,
                trigger
            ),
            hasImage && isSide && a.imagePosition === 'right' ? el('div', { style: sideImgStyle }) : null
        );

        if (isSide && a.imagePosition === 'left') {
            content = el(Fragment, {},
                el('div', { style: Object.assign({}, sideImgStyle, { margin: '-' + a.padding + 'px ' + a.padding + 'px -' + a.padding + 'px -' + a.padding + 'px', borderRadius: a.borderRadius + 'px 0 0 ' + a.borderRadius + 'px' }) }),
                closeBtn,
                el('div', { style: contentStyle },
                    heading, subtext, emailRow, trigger
                )
            );
        }

        return el('div', {
            style: {
                background: hexWithAlpha(a.overlayBg, Math.round(a.overlayOpacity * 0.3)),
                borderRadius: '8px',
                padding: '30px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
            }
        },
            el('div', { style: boxStyle }, content)
        );
    }

    /* ────────────────── register ────────────────── */
    registerBlockType('blockenberg/newsletter-popup', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(a.headingTypo, '--bkbg-nlpop-ht-'));
                    Object.assign(s, _tvf(a.subtextTypo, '--bkbg-nlpop-st-'));
                }
                return { className: 'bkbg-nlpop-editor-wrap', style: s };
            })());

            return el(Fragment, {},

                el(InspectorControls, {},

                    /* ── Content ── */
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Heading', 'blockenberg'),
                            value: a.heading,
                            onChange: function (v) { setAttributes({ heading: v }); }
                        }),
                        el('div', { style: { marginTop: '12px' } },
                            el('label', { style: { display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '12px' } },
                                __('Subtext', 'blockenberg')
                            ),
                            el('textarea', {
                                value: a.subtext,
                                rows: 3,
                                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical' },
                                onChange: function (e) { setAttributes({ subtext: e.target.value }); }
                            })
                        )
                    ),

                    /* ── Form ── */
                    el(PanelBody, { title: __('Email Form', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Input placeholder', 'blockenberg'),
                            value: a.emailPlaceholder,
                            onChange: function (v) { setAttributes({ emailPlaceholder: v }); }
                        }),
                        el('div', { style: { marginTop: '10px' } },
                            el(TextControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Button label', 'blockenberg'),
                                value: a.buttonLabel,
                                onChange: function (v) { setAttributes({ buttonLabel: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' } },
                            el(TextControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Success message', 'blockenberg'),
                                value: a.successMessage,
                                onChange: function (v) { setAttributes({ successMessage: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(TextControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Success sub-message', 'blockenberg'),
                                value: a.successSubtext,
                                onChange: function (v) { setAttributes({ successSubtext: v }); }
                            })
                        )
                    ),

                    /* ── Image ── */
                    el(PanelBody, { title: __('Decorative Image', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Image position', 'blockenberg'),
                            value: a.imagePosition,
                            options: [
                                { label: 'No image', value: 'none' },
                                { label: 'Top banner', value: 'top' },
                                { label: 'Left side', value: 'left' },
                                { label: 'Right side', value: 'right' }
                            ],
                            onChange: function (v) { setAttributes({ imagePosition: v }); }
                        }),
                        a.imagePosition !== 'none' ? el('div', { style: { marginTop: '12px' } },
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (media) {
                                        setAttributes({ imageUrl: media.url, imageId: media.id });
                                    },
                                    allowedTypes: ['image'],
                                    value: a.imageId,
                                    render: function (ref) {
                                        return el(Fragment, {},
                                            a.imageUrl ? el('img', {
                                                src: a.imageUrl,
                                                style: { width: '100%', borderRadius: '6px', marginBottom: '8px', display: 'block', maxHeight: '120px', objectFit: 'cover' }
                                            }) : null,
                                            el(Button, {
                                                onClick: ref.open,
                                                variant: a.imageUrl ? 'secondary' : 'primary',
                                                style: { marginRight: '8px' }
                                            }, a.imageUrl ? __('Replace image', 'blockenberg') : __('Select image', 'blockenberg')),
                                            a.imageUrl ? el(Button, {
                                                onClick: function () { setAttributes({ imageUrl: '', imageId: 0 }); },
                                                variant: 'tertiary',
                                                isDestructive: true
                                            }, __('Remove', 'blockenberg')) : null
                                        );
                                    }
                                })
                            )
                        ) : null
                    ),

                    /* ── Trigger ── */
                    el(PanelBody, { title: __('Trigger', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Trigger type', 'blockenberg'),
                            value: a.triggerType,
                            options: [
                                { label: 'Time delay', value: 'delay' },
                                { label: 'Scroll depth', value: 'scroll' },
                                { label: 'Both (delay + scroll)', value: 'both' }
                            ],
                            onChange: function (v) { setAttributes({ triggerType: v }); }
                        }),
                        (a.triggerType === 'delay' || a.triggerType === 'both') ? el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Delay (seconds)', 'blockenberg'),
                                value: a.delaySeconds,
                                min: 1, max: 60,
                                onChange: function (v) { setAttributes({ delaySeconds: v }); }
                            })
                        ) : null,
                        (a.triggerType === 'scroll' || a.triggerType === 'both') ? el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Scroll depth (%)', 'blockenberg'),
                                value: a.scrollPercent,
                                min: 5, max: 95,
                                onChange: function (v) { setAttributes({ scrollPercent: v }); }
                            })
                        ) : null,
                        el('div', { style: { marginTop: '12px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Also trigger on exit intent (mobile: 15s)', 'blockenberg'),
                                checked: a.exitIntent,
                                onChange: function (v) { setAttributes({ exitIntent: v }); }
                            })
                        )
                    ),

                    /* ── Behaviour ── */
                    el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Cookie name', 'blockenberg'),
                            help: __('Unique key to remember dismissed state. Change to re-show to returning visitors.', 'blockenberg'),
                            value: a.cookieName,
                            onChange: function (v) { setAttributes({ cookieName: v }); }
                        }),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Suppress for (days)', 'blockenberg'),
                                value: a.cookieDays,
                                min: 0, max: 365,
                                onChange: function (v) { setAttributes({ cookieDays: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '12px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show close button', 'blockenberg'),
                                checked: a.showClose,
                                onChange: function (v) { setAttributes({ showClose: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '4px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Close on overlay click', 'blockenberg'),
                                checked: a.overlayClickClose,
                                onChange: function (v) { setAttributes({ overlayClickClose: v }); }
                            })
                        )
                    ),

                    /* ── Appearance ── */
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Max width (px)', 'blockenberg'),
                            value: a.maxWidth,
                            min: 300, max: 900,
                            onChange: function (v) { setAttributes({ maxWidth: v }); }
                        }),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Border radius (px)', 'blockenberg'),
                                value: a.borderRadius,
                                min: 0, max: 40,
                                onChange: function (v) { setAttributes({ borderRadius: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Padding (px)', 'blockenberg'),
                                value: a.padding,
                                min: 12, max: 80,
                                onChange: function (v) { setAttributes({ padding: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Overlay opacity (%)', 'blockenberg'),
                                value: a.overlayOpacity,
                                min: 0, max: 95,
                                onChange: function (v) { setAttributes({ overlayOpacity: v }); }
                            })
                        )
                    ),

                    /* ── Colors ── */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Heading Typography', 'blockenberg'), value: a.headingTypo, onChange: function (v) { setAttributes({ headingTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Subtext Typography', 'blockenberg'), value: a.subtextTypo, onChange: function (v) { setAttributes({ subtextTypo: v }); } }),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, { __nextHasNoMarginBottom: true, label: __('CTA Button Font Size', 'blockenberg'), value: a.ctaSize || 15, min: 10, max: 28, onChange: function (v) { setAttributes({ ctaSize: v }); } })
                        )
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Overlay background', 'blockenberg'), value: a.overlayBg, onChange: function (v) { setAttributes({ overlayBg: v || '#000000' }); } },
                            { label: __('Popup background', 'blockenberg'), value: a.popupBg, onChange: function (v) { setAttributes({ popupBg: v || '#ffffff' }); } },
                            { label: __('Heading color', 'blockenberg'), value: a.headingColor, onChange: function (v) { setAttributes({ headingColor: v || '#111827' }); } },
                            { label: __('Body text color', 'blockenberg'), value: a.textColor, onChange: function (v) { setAttributes({ textColor: v || '#6b7280' }); } },
                            { label: __('Input background', 'blockenberg'), value: a.inputBg, onChange: function (v) { setAttributes({ inputBg: v || '#f9fafb' }); } },
                            { label: __('Input border', 'blockenberg'), value: a.inputBorder, onChange: function (v) { setAttributes({ inputBorder: v || '#d1d5db' }); } },
                            { label: __('Input text color', 'blockenberg'), value: a.inputColor, onChange: function (v) { setAttributes({ inputColor: v || '#374151' }); } },
                            { label: __('Button background', 'blockenberg'), value: a.buttonBg, onChange: function (v) { setAttributes({ buttonBg: v || '#6366f1' }); } },
                            { label: __('Button text color', 'blockenberg'), value: a.buttonColor, onChange: function (v) { setAttributes({ buttonColor: v || '#ffffff' }); } },
                            { label: __('Close button background', 'blockenberg'), value: a.closeBg, onChange: function (v) { setAttributes({ closeBg: v || '#f3f4f6' }); } },
                            { label: __('Close button color', 'blockenberg'), value: a.closeColor, onChange: function (v) { setAttributes({ closeColor: v || '#6b7280' }); } }
                        ]
                    })
                ),

                /* ────── editor canvas ────── */
                el('div', blockProps,
                    el('div', {
                        style: {
                            background: '#f8fafc',
                            border: '2px dashed #c7d2fe',
                            borderRadius: '10px',
                            padding: '20px',
                            fontFamily: 'system-ui, sans-serif'
                        }
                    },
                        el('div', {
                            style: {
                                fontSize: '11px', color: '#6366f1', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px'
                            }
                        },
                            el('span', {}, '◉'),
                            el('span', {}, 'Newsletter Popup — Preview'),
                            el('span', { style: { marginLeft: 'auto', fontWeight: 400, color: '#9ca3af' } },
                                'Appears as overlay on frontend'
                            )
                        ),
                        el(PopupPreview, { attributes: a })
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-nlpop-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
