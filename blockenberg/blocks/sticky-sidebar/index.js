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
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var SIDEBAR_WIDTH_OPTIONS = [
        { label: '25% sidebar / 75% content', value: '25' },
        { label: '30% sidebar / 70% content', value: '30' },
        { label: '33% sidebar / 67% content', value: '33' },
        { label: '40% sidebar / 60% content', value: '40' },
    ];

    var SIDEBAR_STYLE_OPTIONS = [
        { label: 'Card (bg + shadow)',  value: 'card' },
        { label: 'Border only',         value: 'border' },
        { label: 'Flat (no styling)',   value: 'flat' },
    ];

    var HEADING_TAG_OPTIONS = [
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
    ];

    var CTA_STYLE_OPTIONS = [
        { label: 'Filled',   value: 'filled' },
        { label: 'Outline',  value: 'outline' },
        { label: 'Ghost',    value: 'ghost' },
    ];

    var IMAGE_STYLE_OPTIONS = [
        { label: 'Circle',   value: 'circle' },
        { label: 'Rounded',  value: 'rounded' },
        { label: 'Square',   value: 'square' },
        { label: 'Full width', value: 'full' },
    ];

    function getSidebarStyle(a) {
        var s = {
            padding: a.sidebarPadding + 'px',
            borderRadius: a.borderRadius + 'px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        };
        if (a.sidebarStyle === 'card') {
            s.background = a.sidebarBg;
            s.boxShadow = '0 1px 12px rgba(0,0,0,0.08)';
            s.border = '1px solid ' + a.sidebarBorderColor;
        } else if (a.sidebarStyle === 'border') {
            s.border = '1px solid ' + a.sidebarBorderColor;
        }
        return s;
    }

    function renderSidebarPreview(a, set) {
        var imgBr = a.imageStyle === 'circle' ? '50%' : a.imageStyle === 'rounded' ? '10px' : '0';
        var imgW = a.imageStyle === 'full' ? '100%' : a.imageSize + 'px';
        var imgH = a.imageStyle === 'full' ? 'auto' : a.imageSize + 'px';

        return el('div', { style: getSidebarStyle(a) },
            // Image
            a.showImage && a.imageUrl && el('div', { style: { textAlign: 'center' } },
                el('img', {
                    src: a.imageUrl,
                    alt: a.imageAlt,
                    style: {
                        width: imgW,
                        height: imgH,
                        objectFit: 'cover',
                        borderRadius: imgBr,
                        display: 'block',
                        margin: '0 auto',
                    }
                })
            ),
            // Heading
            a.showHeading && a.heading && el(a.headingTag, {
                className: 'bkbg-ss-heading',
                style: { margin: 0, color: a.headingColor }
            }, a.heading),
            // Sub text
            a.showSubText && a.subText && el('p', {
                className: 'bkbg-ss-subtext',
                style: { margin: 0, color: a.textColor }
            }, a.subText),
            // Rating
            a.showRatingBox && el('div', {
                style: {
                    background: 'rgba(0,0,0,0.04)',
                    borderRadius: 8,
                    padding: '10px 14px',
                }
            },
                el('div', { style: { color: a.starColor, fontSize: 18, letterSpacing: 2 } },
                    '★'.repeat(Math.round(a.ratingStars)) + '☆'.repeat(5 - Math.round(a.ratingStars))
                ),
                el('div', { style: { fontWeight: 700, color: a.headingColor, fontSize: 15, marginTop: 2 } }, a.ratingCount),
                el('div', { style: { color: a.textColor, fontSize: 12, opacity: 0.7 } }, a.ratingLabel)
            ),
            // Bullets
            a.showBullets && a.bullets.length > 0 && el('ul', {
                style: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }
            },
                a.bullets.map(function (b, i) {
                    return el('li', {
                        key: i,
                        style: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: a.textColor }
                    },
                        el('span', { style: { color: a.bulletIconColor, fontWeight: 700, flexShrink: 0 } }, a.bulletIcon),
                        el('span', null, b.text)
                    );
                })
            ),
            // Contact info
            a.showContactInfo && el('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 } },
                a.contactPhone && el('div', { style: { color: a.textColor } }, '📞 ' + a.contactPhone),
                a.contactEmail && el('div', { style: { color: a.linkColor } }, '✉️ ' + a.contactEmail)
            ),
            // CTA button
            a.showCta && a.ctaLabel && (function () {
                var btnStyle = {
                    display: 'block',
                    textAlign: 'center',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    border: '2px solid ' + a.ctaBg,
                };
                if (a.ctaStyle === 'filled') {
                    btnStyle.background = a.ctaBg;
                    btnStyle.color = a.ctaColor;
                } else if (a.ctaStyle === 'outline') {
                    btnStyle.background = 'transparent';
                    btnStyle.color = a.ctaBg;
                } else {
                    btnStyle.background = 'transparent';
                    btnStyle.color = a.ctaBg;
                    btnStyle.border = 'none';
                }
                return el('a', { href: a.ctaUrl, style: btnStyle }, a.ctaLabel);
            })()
        );
    }

    registerBlockType('blockenberg/sticky-sidebar', {
        title: __('Sticky Sidebar', 'blockenberg'),
        icon: 'columns',
        category: 'bkbg-layout',
        description: __('Two-column layout with a rich sticky sidebar — perfect for articles, docs, and long-form content.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function() {
                var _tvf = getTypoCssVars();
                var s = { background: a.containerBg || 'transparent' };
                if (_tvf) {
                    Object.assign(s, _tvf(a.headingTypo, '--bkssb-hd-'));
                    Object.assign(s, _tvf(a.subTextTypo, '--bkssb-st-'));
                }
                s['--bkssb-heading-color'] = a.headingColor || '#111827';
                s['--bkssb-text-color'] = a.textColor || '#374151';
                s['--bkssb-st-fw'] = a.subTextFontWeight || '400';
                s['--bkssb-st-lh'] = a.subTextLineHeight || 1.5;
                return { style: s };
            })());

            var sidebarFlex = parseInt(a.sidebarWidth) || 30;
            var mainFlex = 100 - sidebarFlex;

            var sidebarCol = el('div', {
                style: {
                    flex: '0 0 ' + sidebarFlex + '%',
                    maxWidth: sidebarFlex + '%',
                    minWidth: '200px',
                }
            }, renderSidebarPreview(a, set));

            var mainCol = el('div', {
                style: {
                    flex: '1',
                    minWidth: 0,
                    background: a.mainBg || 'transparent',
                }
            },
                el(RichText, {
                    tagName: 'div',
                    value: a.mainContent,
                    onChange: function (v) { set({ mainContent: v }); },
                    placeholder: __('Add your main content here...', 'blockenberg'),
                    style: { minHeight: 200, lineHeight: 1.7 },
                    multiline: 'p',
                })
            );

            var cols = a.sidebarSide === 'left'
                ? [sidebarCol, mainCol]
                : [mainCol, sidebarCol];

            function addBullet() {
                set({ bullets: a.bullets.concat([{ text: 'New item' }]) });
            }
            function removeBullet(i) {
                set({ bullets: a.bullets.filter(function (_, idx) { return idx !== i; }) });
            }
            function updateBullet(i, val) {
                var updated = a.bullets.map(function (b, idx) {
                    if (idx !== i) return b;
                    var p = {}; p['text'] = val;
                    return Object.assign({}, b, p);
                });
                set({ bullets: updated });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Layout Panel
                    el(PanelBody, { title: 'Layout', initialOpen: true },
                        el(SelectControl, {
                            label: 'Sidebar Side',
                            value: a.sidebarSide,
                            options: [
                                { label: 'Left', value: 'left' },
                                { label: 'Right', value: 'right' },
                            ],
                            onChange: function (v) { set({ sidebarSide: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(SelectControl, {
                            label: 'Width Split',
                            value: a.sidebarWidth,
                            options: SIDEBAR_WIDTH_OPTIONS,
                            onChange: function (v) { set({ sidebarWidth: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Sticky Top Offset (px)',
                            value: a.stickyTop,
                            min: 0, max: 200,
                            onChange: function (v) { set({ stickyTop: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Column Gap (px)',
                            value: a.gap,
                            min: 8, max: 100,
                            onChange: function (v) { set({ gap: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Container Padding (px)',
                            value: a.containerPadding,
                            min: 0, max: 80,
                            onChange: function (v) { set({ containerPadding: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Sidebar Style Panel
                    el(PanelBody, { title: 'Sidebar Style', initialOpen: false },
                        el(SelectControl, {
                            label: 'Visual Style',
                            value: a.sidebarStyle,
                            options: SIDEBAR_STYLE_OPTIONS,
                            onChange: function (v) { set({ sidebarStyle: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Sidebar Padding (px)',
                            value: a.sidebarPadding,
                            min: 0, max: 60,
                            onChange: function (v) { set({ sidebarPadding: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Border Radius (px)',
                            value: a.borderRadius,
                            min: 0, max: 32,
                            onChange: function (v) { set({ borderRadius: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Image Panel
                    el(PanelBody, { title: 'Sidebar Image', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Image',
                            checked: a.showImage,
                            onChange: function (v) { set({ showImage: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showImage && el(Fragment, null,
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (media) {
                                        set({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' });
                                    },
                                    allowedTypes: ['image'],
                                    value: a.imageId,
                                    render: function (ref) {
                                        return el(Button, {
                                            onClick: ref.open,
                                            variant: a.imageUrl ? 'secondary' : 'primary',
                                            __nextHasNoMarginBottom: true,
                                        }, a.imageUrl ? 'Change Image' : 'Select Image');
                                    }
                                })
                            ),
                            el('div', { style: { height: 12 } }),
                            el(SelectControl, {
                                label: 'Image Style',
                                value: a.imageStyle,
                                options: IMAGE_STYLE_OPTIONS,
                                onChange: function (v) { set({ imageStyle: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            a.imageStyle !== 'full' && el(Fragment, null,
                                el('div', { style: { height: 12 } }),
                                el(RangeControl, {
                                    label: 'Image Size (px)',
                                    value: a.imageSize,
                                    min: 40, max: 200,
                                    onChange: function (v) { set({ imageSize: v }); },
                                    __nextHasNoMarginBottom: true,
                                })
                            )
                        )
                    ),

                    // Sidebar Content Panel
                    el(PanelBody, { title: 'Sidebar Content', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Heading',
                            checked: a.showHeading,
                            onChange: function (v) { set({ showHeading: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showHeading && el(Fragment, null,
                            el(TextControl, {
                                label: 'Heading',
                                value: a.heading,
                                onChange: function (v) { set({ heading: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(SelectControl, {
                                label: 'Heading Tag',
                                value: a.headingTag,
                                options: HEADING_TAG_OPTIONS,
                                onChange: function (v) { set({ headingTag: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Show Sub-text',
                            checked: a.showSubText,
                            onChange: function (v) { set({ showSubText: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showSubText && el(TextControl, {
                            label: 'Sub-text',
                            value: a.subText,
                            onChange: function (v) { set({ subText: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Show Rating Box',
                            checked: a.showRatingBox,
                            onChange: function (v) { set({ showRatingBox: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showRatingBox && el(Fragment, null,
                            el(RangeControl, {
                                label: 'Rating Stars',
                                value: a.ratingStars,
                                min: 1, max: 5,
                                onChange: function (v) { set({ ratingStars: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Rating Score Text',
                                value: a.ratingCount,
                                onChange: function (v) { set({ ratingCount: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Rating Label',
                                value: a.ratingLabel,
                                onChange: function (v) { set({ ratingLabel: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Bullets Panel
                    el(PanelBody, { title: 'Bullet Points', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Bullets',
                            checked: a.showBullets,
                            onChange: function (v) { set({ showBullets: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showBullets && el(Fragment, null,
                            el(TextControl, {
                                label: 'Bullet Icon (emoji/symbol)',
                                value: a.bulletIcon,
                                onChange: function (v) { set({ bulletIcon: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            a.bullets.map(function (b, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 } },
                                    el(TextControl, {
                                        value: b.text,
                                        onChange: function (v) { updateBullet(i, v); },
                                        style: { margin: 0, flex: 1 },
                                        __nextHasNoMarginBottom: true,
                                    }),
                                    el(Button, {
                                        onClick: function () { removeBullet(i); },
                                        isDestructive: true,
                                        variant: 'tertiary',
                                        __nextHasNoMarginBottom: true,
                                    }, '✕')
                                );
                            }),
                            el(Button, {
                                onClick: addBullet,
                                variant: 'secondary',
                                style: { width: '100%', justifyContent: 'center', marginTop: 4 },
                                __nextHasNoMarginBottom: true,
                            }, '+ Add Bullet')
                        )
                    ),

                    // CTA Panel
                    el(PanelBody, { title: 'CTA Button', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show CTA',
                            checked: a.showCta,
                            onChange: function (v) { set({ showCta: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showCta && el(Fragment, null,
                            el(TextControl, {
                                label: 'Button Label',
                                value: a.ctaLabel,
                                onChange: function (v) { set({ ctaLabel: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Button URL',
                                value: a.ctaUrl,
                                onChange: function (v) { set({ ctaUrl: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(SelectControl, {
                                label: 'Button Style',
                                value: a.ctaStyle,
                                options: CTA_STYLE_OPTIONS,
                                onChange: function (v) { set({ ctaStyle: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(ToggleControl, {
                                label: 'Open in new tab',
                                checked: a.ctaNewTab,
                                onChange: function (v) { set({ ctaNewTab: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Contact Panel
                    el(PanelBody, { title: 'Contact Info', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Contact Info',
                            checked: a.showContactInfo,
                            onChange: function (v) { set({ showContactInfo: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showContactInfo && el(Fragment, null,
                            el(TextControl, {
                                label: 'Phone Number',
                                value: a.contactPhone,
                                onChange: function (v) { set({ contactPhone: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Email Address',
                                value: a.contactEmail,
                                onChange: function (v) { set({ contactEmail: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Colors Panel
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: __('Heading', 'blockenberg'), value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Sub-text', 'blockenberg'), value: a.subTextTypo, onChange: function (v) { set({ subTextTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Container Background', value: a.containerBg, onChange: function (v) { set({ containerBg: v || '' }); } },
                            { label: 'Main Content Bg', value: a.mainBg, onChange: function (v) { set({ mainBg: v || '' }); } },
                            { label: 'Sidebar Background', value: a.sidebarBg, onChange: function (v) { set({ sidebarBg: v || '#f8fafc' }); } },
                            { label: 'Sidebar Border', value: a.sidebarBorderColor, onChange: function (v) { set({ sidebarBorderColor: v || '#e2e8f0' }); } },
                            { label: 'Heading Color', value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                            { label: 'Text Color', value: a.textColor, onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Bullet Icon Color', value: a.bulletIconColor, onChange: function (v) { set({ bulletIconColor: v || '#6366f1' }); } },
                            { label: 'CTA Background', value: a.ctaBg, onChange: function (v) { set({ ctaBg: v || '#6366f1' }); } },
                            { label: 'CTA Text Color', value: a.ctaColor, onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } },
                            { label: 'Star Color', value: a.starColor, onChange: function (v) { set({ starColor: v || '#f59e0b' }); } },
                            { label: 'Link Color', value: a.linkColor, onChange: function (v) { set({ linkColor: v || '#6366f1' }); } },
                        ]
                    })
                ),

                // Editor Preview
                el('div', blockProps,
                    el('div', {
                        style: {
                            display: 'flex',
                            gap: a.gap + 'px',
                            padding: a.containerPadding + 'px',
                            alignItems: 'flex-start',
                        }
                    }, ...cols)
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-ss-app',
                    'data-opts': JSON.stringify(props.attributes),
                })
            );
        }
    });
}() );
