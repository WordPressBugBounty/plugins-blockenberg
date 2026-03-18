( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var TAG_OPTIONS = [
        { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' }, { label: 'H5', value: 'h5' },
        { label: 'p',  value: 'p'  },
    ];

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function hexToRgba(hex, opacity) {
        if (!hex) return 'rgba(139,92,246,' + opacity / 100 + ')';
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        var r = parseInt(hex.substring(0,2), 16);
        var g = parseInt(hex.substring(2,4), 16);
        var b = parseInt(hex.substring(4,6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity / 100) + ')';
    }

    function buildCardStyle(a) {
        var tv = getTypoCssVars();
        var s = {
            background: a.cardBg,
            border: a.showBorder ? a.borderWidth + 'px solid ' + a.cardBorder : 'none',
            borderRadius: a.cardRadius + 'px',
            padding: a.cardPadding + 'px',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
            '--bkspot-color': hexToRgba(a.spotlightColor, a.spotlightOpacity),
            '--bkspot-size': a.spotlightSize + 'px',
            '--bkspot-hd-sz': a.headingSize + 'px',
            '--bkspot-hd-w': String(a.headingFontWeight || '700'),
            '--bkspot-hd-lh': String(a.headingLineHeight || 1.3),
            '--bkspot-tx-sz': a.textSize + 'px',
            '--bkspot-tx-lh': String(a.textLineHeight || 1.6),
        };
        Object.assign(s, tv(a.headingTypo, '--bkspot-hd-'));
        Object.assign(s, tv(a.textTypo, '--bkspot-tx-'));
        Object.assign(s, tv(a.linkTypo, '--bkspot-lk-'));
        return s;
    }

    function CardPreview(a) {
        return el('div', { className: 'bkspot-card', style: buildCardStyle(a) },
            /* spotlight overlay - shown statically in editor */
            el('div', {
                style: {
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                    background: 'radial-gradient(circle at 50% 30%, ' + hexToRgba(a.spotlightColor, a.spotlightOpacity) + ', transparent ' + a.spotlightSize + 'px)',
                    borderRadius: a.cardRadius + 'px',
                    opacity: 0.5,
                }
            }),
            a.showBadge && a.badgeText && el('span', {
                style: {
                    position: 'absolute', top: '16px', right: '16px', zIndex: 1,
                    background: a.badgeBg, color: a.badgeColor,
                    fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                }
            }, a.badgeText),

            a.showImage && a.imageUrl && el('div', {
                style: {
                    backgroundImage: 'url(' + a.imageUrl + ')', backgroundSize: 'cover',
                    backgroundPosition: 'center', height: a.imageHeight + 'px',
                    borderRadius: (a.cardRadius - 4) + 'px', marginBottom: '16px', position: 'relative', zIndex: 1,
                }
            }),

            el('div', { style: { position: 'relative', zIndex: 1 } },
                a.showIcon && !a.showImage && el('span', {
                    className: 'dashicons dashicons-' + a.icon,
                    style: { fontSize: a.iconSize + 'px', width: a.iconSize + 'px', height: a.iconSize + 'px', lineHeight: 1, color: a.iconColor, marginBottom: '12px', display: 'block' }
                }),
                el(RichText.Content || 'div', null), /* placeholder for editor richtext */
                el(a.tag || 'h3', { style: { margin: '0 0 8px', color: a.headingColor, fontSize: a.headingSize + 'px', fontWeight: 700, lineHeight: 1.3 } }, a.heading || __('Spotlight Card', 'blockenberg')),
                el('p', { style: { margin: '0 0 16px', color: a.textColor, fontSize: a.textSize + 'px', lineHeight: 1.6 } }, a.text),
                a.showLink && el('a', {
                    href: a.linkUrl,
                    style: { color: a.linkColor, fontWeight: 600, textDecoration: 'none', fontSize: a.textSize + 'px' }
                }, a.linkLabel),
            ),
        );
    }

    registerBlockType('blockenberg/spotlight-card', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps();

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Heading Tag'), value: a.tag, options: TAG_OPTIONS,
                            onChange: function (v) { set({ tag: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Icon & Image', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Icon'), checked: a.showIcon,
                            onChange: function (v) { set({ showIcon: v, showImage: v ? false : a.showImage }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showIcon && el(TextControl, {
                            label: __('Dashicon Name'), value: a.icon,
                            onChange: function (v) { set({ icon: v }); }
                        }),
                        a.showIcon && el(RangeControl, {
                            label: __('Icon Size (px)'), value: a.iconSize, min: 20, max: 80,
                            onChange: function (v) { set({ iconSize: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Image'), checked: a.showImage,
                            onChange: function (v) { set({ showImage: v, showIcon: v ? false : a.showIcon }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showImage && el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { set({ imageUrl: m.url, imageId: m.id }); },
                                allowedTypes: ['image'], value: a.imageId,
                                render: function (ref) {
                                    return el(Button, {
                                        onClick: ref.open, variant: 'secondary',
                                        style: { width: '100%', justifyContent: 'center', marginBottom: '6px' }
                                    }, a.imageUrl ? __('Change Image') : __('Select Image'));
                                }
                            })
                        ),
                        a.showImage && el(RangeControl, {
                            label: __('Image Height (px)'), value: a.imageHeight, min: 80, max: 400,
                            onChange: function (v) { set({ imageHeight: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Badge & Link', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Badge'), checked: a.showBadge,
                            onChange: function (v) { set({ showBadge: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.showBadge && el(TextControl, {
                            label: __('Badge Text'), value: a.badgeText,
                            onChange: function (v) { set({ badgeText: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Link'), checked: a.showLink,
                            onChange: function (v) { set({ showLink: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.showLink && el(TextControl, {
                            label: __('Link Label'), value: a.linkLabel,
                            onChange: function (v) { set({ linkLabel: v }); }
                        }),
                        a.showLink && el(TextControl, {
                            label: __('Link URL'), value: a.linkUrl,
                            onChange: function (v) { set({ linkUrl: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Spotlight Effect', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Spotlight Size (px)'), value: a.spotlightSize, min: 100, max: 700,
                            onChange: function (v) { set({ spotlightSize: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Spotlight Opacity %'), value: a.spotlightOpacity, min: 2, max: 60,
                            onChange: function (v) { set({ spotlightOpacity: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Border Radius (px)'), value: a.cardRadius, min: 0, max: 40,
                            onChange: function (v) { set({ cardRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding (px)'), value: a.cardPadding, min: 8, max: 64,
                            onChange: function (v) { set({ cardPadding: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Border'), checked: a.showBorder,
                            onChange: function (v) { set({ showBorder: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.showBorder && el(RangeControl, {
                            label: __('Border Width (px)'), value: a.borderWidth, min: 1, max: 4,
                            onChange: function (v) { set({ borderWidth: v }); }
                        }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl()({ label: __('Heading', 'blockenberg'), value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                        getTypoControl()({ label: __('Text', 'blockenberg'), value: a.textTypo, onChange: function (v) { set({ textTypo: v }); } }),
                        getTypoControl()({ label: __('Link', 'blockenberg'), value: a.linkTypo, onChange: function (v) { set({ linkTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Spotlight'), value: a.spotlightColor, onChange: function (v) { set({ spotlightColor: v || '#8b5cf6' }); } },
                            { label: __('Card Background'), value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#1e1b2e' }); } },
                            { label: __('Card Border'), value: a.cardBorder, onChange: function (v) { set({ cardBorder: v || '#2d2a4a' }); } },
                            { label: __('Heading'), value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#f1f5f9' }); } },
                            { label: __('Body Text'), value: a.textColor, onChange: function (v) { set({ textColor: v || '#94a3b8' }); } },
                            { label: __('Icon'), value: a.iconColor, onChange: function (v) { set({ iconColor: v || '#6c3fb5' }); } },
                            { label: __('Link'), value: a.linkColor, onChange: function (v) { set({ linkColor: v || '#6c3fb5' }); } },
                            a.showBadge && { label: __('Badge Background'), value: a.badgeBg, onChange: function (v) { set({ badgeBg: v || '#6c3fb5' }); } },
                            a.showBadge && { label: __('Badge Text'), value: a.badgeColor, onChange: function (v) { set({ badgeColor: v || '#ffffff' }); } },
                        ].filter(Boolean)
                    }),
                ),
                /* Editor live preview */
                el('div', { style: buildCardStyle(a), className: 'bkspot-card' },
                    el('div', {
                        style: {
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(circle at 50% 30%, ' + hexToRgba(a.spotlightColor, a.spotlightOpacity) + ', transparent ' + a.spotlightSize + 'px)',
                            borderRadius: a.cardRadius + 'px', opacity: 0.7,
                        }
                    }),
                    a.showBadge && a.badgeText && el('span', {
                        style: {
                            position: 'absolute', top: '16px', right: '16px', zIndex: 1,
                            background: a.badgeBg, color: a.badgeColor,
                            fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                        }
                    }, a.badgeText),
                    a.showImage && a.imageUrl && el('div', {
                        style: {
                            backgroundImage: 'url(' + a.imageUrl + ')', backgroundSize: 'cover',
                            backgroundPosition: 'center', height: a.imageHeight + 'px',
                            borderRadius: (a.cardRadius - 4) + 'px', marginBottom: '16px', position: 'relative', zIndex: 1,
                        }
                    }),
                    el('div', { style: { position: 'relative', zIndex: 1 } },
                        a.showIcon && !a.showImage && el('span', {
                            className: 'dashicons dashicons-' + a.icon,
                            style: { fontSize: a.iconSize + 'px', width: a.iconSize + 'px', height: a.iconSize + 'px', lineHeight: 1, color: a.iconColor, marginBottom: '12px', display: 'block' }
                        }),
                        el(RichText, {
                            tagName: a.tag,
                            value: a.heading,
                            onChange: function (v) { set({ heading: v }); },
                            placeholder: __('Heading…'),
                            className: 'bkspot-heading',
                            style: { margin: '0 0 8px', color: a.headingColor },
                            allowedFormats: ['core/bold', 'core/italic'],
                        }),
                        el(RichText, {
                            tagName: 'p',
                            value: a.text,
                            onChange: function (v) { set({ text: v }); },
                            placeholder: __('Card text…'),
                            className: 'bkspot-text',
                            style: { margin: '0 0 16px', color: a.textColor },
                        }),
                        a.showLink && el('a', {
                            href: a.linkUrl,
                            className: 'bkspot-link',
                            style: { color: a.linkColor }
                        }, a.linkLabel),
                    ),
                ),
            );
        },

        save: function (props) {
            var a = props.attributes;
            var tv = getTypoCssVars();
            var h = a.spotlightColor ? a.spotlightColor.replace('#', '') : '8b5cf6';
            if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
            var r = parseInt(h.substring(0,2),16), g = parseInt(h.substring(2,4),16), b = parseInt(h.substring(4,6),16);
            var rgba = 'rgba(' + r + ',' + g + ',' + b + ',' + (a.spotlightOpacity / 100) + ')';

            var wrapStyle = {
                background: a.cardBg,
                border: a.showBorder ? a.borderWidth + 'px solid ' + a.cardBorder : 'none',
                borderRadius: a.cardRadius + 'px',
                padding: a.cardPadding + 'px',
                position: 'relative',
                overflow: 'hidden',
                '--bkspot-color': rgba,
                '--bkspot-size': a.spotlightSize + 'px',
                '--bkspot-hd-sz': a.headingSize + 'px',
                '--bkspot-hd-w': String(a.headingFontWeight || '700'),
                '--bkspot-hd-lh': String(a.headingLineHeight || 1.3),
                '--bkspot-tx-sz': a.textSize + 'px',
                '--bkspot-tx-lh': String(a.textLineHeight || 1.6),
            };
            Object.assign(wrapStyle, tv(a.headingTypo, '--bkspot-hd-'));
            Object.assign(wrapStyle, tv(a.textTypo, '--bkspot-tx-'));
            Object.assign(wrapStyle, tv(a.linkTypo, '--bkspot-lk-'));

            return el('div', {
                className: 'bkspot-card',
                style: wrapStyle
            },
                el('div', { className: 'bkspot-glow', 'aria-hidden': 'true' }),
                a.showBadge && a.badgeText && el('span', {
                    className: 'bkspot-badge',
                    style: {
                        position: 'absolute', top: '16px', right: '16px', zIndex: 1,
                        background: a.badgeBg, color: a.badgeColor,
                        fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px',
                    }
                }, a.badgeText),
                a.showImage && a.imageUrl && el('div', {
                    className: 'bkspot-img',
                    style: {
                        backgroundImage: 'url(' + a.imageUrl + ')', backgroundSize: 'cover',
                        backgroundPosition: 'center', height: a.imageHeight + 'px',
                        borderRadius: (a.cardRadius - 4) + 'px', marginBottom: '16px', position: 'relative', zIndex: 1,
                    }
                }),
                el('div', { className: 'bkspot-body', style: { position: 'relative', zIndex: 1 } },
                    a.showIcon && !a.showImage && el('span', {
                        className: 'bkspot-icon dashicons dashicons-' + a.icon,
                        'aria-hidden': 'true',
                        style: { fontSize: a.iconSize + 'px', width: a.iconSize + 'px', height: a.iconSize + 'px', lineHeight: 1, color: a.iconColor, marginBottom: '12px', display: 'block' }
                    }),
                    el(RichText.Content, {
                        tagName: a.tag, value: a.heading, className: 'bkspot-heading',
                        style: { margin: '0 0 8px', color: a.headingColor }
                    }),
                    el(RichText.Content, {
                        tagName: 'p', value: a.text, className: 'bkspot-text',
                        style: { margin: '0 0 16px', color: a.textColor }
                    }),
                    a.showLink && el('a', {
                        href: a.linkUrl, className: 'bkspot-link',
                        style: { color: a.linkColor }
                    }, a.linkLabel),
                ),
            );
        }
    });
}() );
