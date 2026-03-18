( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var Button            = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var STYLE_OPTIONS = [
        { label: __('Horizontal (image left)',  'blockenberg'), value: 'horizontal' },
        { label: __('Vertical (image top)',     'blockenberg'), value: 'vertical'   },
        { label: __('Minimal (no image)',       'blockenberg'), value: 'minimal'    },
        { label: __('Large banner (top image)', 'blockenberg'), value: 'large'      },
    ];

    function CardPreview(props) {
        var a = props.attributes;
        var isHorizontal = a.cardStyle === 'horizontal';
        var isVertical   = a.cardStyle === 'vertical';
        var isLarge      = a.cardStyle === 'large';
        var isMinimal    = a.cardStyle === 'minimal';

        var wrapStyle = {
            display:        'flex',
            flexDirection:  isHorizontal ? 'row' : 'column',
            background:     a.bgColor,
            border:         a.borderWidth + 'px solid ' + a.borderColor,
            borderRadius:   a.borderRadius + 'px',
            overflow:       'hidden',
            boxShadow:      a.shadow ? '0 2px 16px rgba(0,0,0,0.09)' : 'none',
            maxWidth:       a.maxWidth + 'px',
            cursor:         'pointer',
            textDecoration: 'none',
            transition:     'transform 0.2s, box-shadow 0.2s',
        };

        var imageEl = null;
        if (a.showImage && !isMinimal) {
            var imgStyle = {};
            if (isHorizontal) {
                imgStyle = { minWidth: a.imageWidth + 'px', maxWidth: a.imageWidth + 'px', height: '100%', minHeight: a.imageHeight + 'px', objectFit: 'cover', display: 'block' };
            } else if (isLarge) {
                imgStyle = { width: '100%', height: (a.imageHeight * 1.5) + 'px', objectFit: 'cover', display: 'block' };
            } else {
                imgStyle = { width: '100%', height: a.imageHeight + 'px', objectFit: 'cover', display: 'block' };
            }

            imageEl = a.imageUrl
                ? el('img', { src: a.imageUrl, alt: a.imageAlt, style: imgStyle })
                : el('div', { style: Object.assign({}, imgStyle, { background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }) }, __('Image', 'blockenberg'));
        }

        var textPad = isLarge ? '20px 24px 24px' : isHorizontal ? '20px' : '16px 20px 20px';

        var textContent = el('div', { style: { padding: textPad, flex: 1, minWidth: 0 } },
            // Domain row
            (a.showFavicon || a.showDomain) && el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' } },
                a.showFavicon && (
                    a.faviconUrl
                    ? el('img', { src: a.faviconUrl, style: { width: '14px', height: '14px', borderRadius: '2px' } })
                    : el('span', { style: { width: '14px', height: '14px', background: a.domainColor, borderRadius: '2px', display: 'inline-block', opacity: 0.5 } })
                ),
                a.showDomain && el('span', {
                    style: { fontSize: '12px', color: a.domainColor, fontWeight: 600, letterSpacing: '0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                }, a.domain || a.siteName || 'example.com'),
                a.siteName && a.domain && el('span', { style: { color: '#d1d5db', fontSize: '11px' } }, '·'),
                a.siteName && a.domain && el('span', { style: { fontSize: '12px', color: '#9ca3af' } }, a.siteName)
            ),
            // Title
            el('p', {
                className: 'bklp-title',
                style: { color: a.titleColor }
            }, a.title || __('Link title', 'blockenberg')),
            // Description
            a.showDesc && el('p', {
                className: 'bklp-desc',
                style: { margin: '6px 0 0', color: a.descColor }
            }, a.description || __('Description text…', 'blockenberg'))
        );

        return el('div', { className: 'bklp-card bklp-style-' + a.cardStyle, style: wrapStyle },
            isHorizontal && imageEl,
            textContent,
            !isHorizontal && imageEl && el(Fragment, null)  // images at top are rendered above text
        );
    }

    registerBlockType('blockenberg/link-preview', {
        title: __('Link Preview', 'blockenberg'),
        description: __('OG-style link preview card with image, domain, title, and description.', 'blockenberg'),
        category: 'bkbg-content',
        icon: 'admin-links',

        edit: function (props) {
            var attributes    = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps    = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attributes.titleTypo, '--bklp-tt-'));
                    Object.assign(s, _tvFn(attributes.descTypo, '--bklp-d-'));
                }
                return { className: 'bklp-editor-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* ── Link / URL ───────────────────────────────────────── */
                    el(PanelBody, { title: __('Link', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            label: __('URL', 'blockenberg'),
                            value: attributes.url,
                            type:  'url',
                            placeholder: 'https://example.com/article',
                            onChange: function (v) { setAttributes({ url: v }); },
                        }),
                        el(ToggleControl, {
                            label:   __('Open in new tab', 'blockenberg'),
                            checked: attributes.openNewTab,
                            onChange: function (v) { setAttributes({ openNewTab: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Content ──────────────────────────────────────────── */
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'blockenberg'),
                            value: attributes.title,
                            onChange: function (v) { setAttributes({ title: v }); },
                        }),
                        el(TextareaControl, {
                            label: __('Description', 'blockenberg'),
                            value: attributes.description,
                            rows:  3,
                            onChange: function (v) { setAttributes({ description: v }); },
                        }),
                        el(TextControl, {
                            label: __('Domain (e.g. github.com)', 'blockenberg'),
                            value: attributes.domain,
                            onChange: function (v) { setAttributes({ domain: v }); },
                        }),
                        el(TextControl, {
                            label: __('Site name (e.g. GitHub)', 'blockenberg'),
                            value: attributes.siteName,
                            onChange: function (v) { setAttributes({ siteName: v }); },
                        }),
                        el(ToggleControl, {
                            label:   __('Show description', 'blockenberg'),
                            checked: attributes.showDesc,
                            onChange: function (v) { setAttributes({ showDesc: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Image ────────────────────────────────────────────── */
                    el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label:   __('Show image', 'blockenberg'),
                            checked: attributes.showImage,
                            onChange: function (v) { setAttributes({ showImage: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showImage && el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttributes({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                                allowedTypes: ['image'],
                                value: attributes.imageId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        attributes.imageUrl && el('img', { src: attributes.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '8px', display: 'block' } }),
                                        el(Button, { onClick: r.open, variant: 'secondary', style: { width: '100%' } },
                                            attributes.imageUrl ? __('Change image', 'blockenberg') : __('Select image', 'blockenberg')
                                        ),
                                        attributes.imageUrl && el(Button, {
                                            onClick: function () { setAttributes({ imageUrl: '', imageId: 0 }); },
                                            variant: 'link', isDestructive: true,
                                            style: { marginTop: '4px' }
                                        }, __('Remove image', 'blockenberg'))
                                    );
                                },
                            })
                        ),
                        attributes.showImage && el(RangeControl, {
                            label: __('Image height (px)', 'blockenberg'),
                            value: attributes.imageHeight,
                            min: 80, max: 480,
                            onChange: function (v) { setAttributes({ imageHeight: v }); },
                        }),
                        attributes.showImage && attributes.cardStyle === 'horizontal' && el(RangeControl, {
                            label: __('Image width — horizontal (px)', 'blockenberg'),
                            value: attributes.imageWidth,
                            min: 100, max: 400,
                            onChange: function (v) { setAttributes({ imageWidth: v }); },
                        })
                    ),
                    /* ── Favicon ──────────────────────────────────────────── */
                    el(PanelBody, { title: __('Favicon', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label:   __('Show favicon', 'blockenberg'),
                            checked: attributes.showFavicon,
                            onChange: function (v) { setAttributes({ showFavicon: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showFavicon && el(ToggleControl, {
                            label:   __('Show domain', 'blockenberg'),
                            checked: attributes.showDomain,
                            onChange: function (v) { setAttributes({ showDomain: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        attributes.showFavicon && el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttributes({ faviconUrl: m.url, faviconId: m.id }); },
                                allowedTypes: ['image'],
                                value: attributes.faviconId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        attributes.faviconUrl && el('img', { src: attributes.faviconUrl, style: { width: '20px', height: '20px', objectFit: 'cover', marginBottom: '6px', display: 'block' } }),
                                        el(Button, { onClick: r.open, variant: 'secondary', style: { width: '100%' } },
                                            attributes.faviconUrl ? __('Change favicon', 'blockenberg') : __('Select favicon', 'blockenberg')
                                        )
                                    );
                                },
                            })
                        )
                    ),
                    /* ── Style & Layout ───────────────────────────────────── */
                    el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label:   __('Card style', 'blockenberg'),
                            value:   attributes.cardStyle,
                            options: STYLE_OPTIONS,
                            onChange: function (v) { setAttributes({ cardStyle: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Max width (px)', 'blockenberg'),
                            value: attributes.maxWidth,
                            min: 240, max: 1000,
                            onChange: function (v) { setAttributes({ maxWidth: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)', 'blockenberg'),
                            value: attributes.borderRadius,
                            min: 0, max: 32,
                            onChange: function (v) { setAttributes({ borderRadius: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Border width (px)', 'blockenberg'),
                            value: attributes.borderWidth,
                            min: 0, max: 4,
                            onChange: function (v) { setAttributes({ borderWidth: v }); },
                        }),
                        el(ToggleControl, {
                            label:   __('Drop shadow', 'blockenberg'),
                            checked: attributes.shadow,
                            onChange: function (v) { setAttributes({ shadow: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el(ToggleControl, {
                            label:   __('Hover lift effect', 'blockenberg'),
                            checked: attributes.hoverLift,
                            onChange: function (v) { setAttributes({ hoverLift: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Colors ───────────────────────────────────────────── */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title'), value: attributes.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Description'), value: attributes.descTypo || {}, onChange: function (v) { setAttributes({ descTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: attributes.bgColor,     onChange: function (v) { setAttributes({ bgColor:     v || '#ffffff' }); }, label: __('Background',   'blockenberg') },
                            { value: attributes.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e5e7eb' }); }, label: __('Border',       'blockenberg') },
                            { value: attributes.titleColor,  onChange: function (v) { setAttributes({ titleColor:  v || '#111827' }); }, label: __('Title',        'blockenberg') },
                            { value: attributes.descColor,   onChange: function (v) { setAttributes({ descColor:   v || '#6b7280' }); }, label: __('Description',  'blockenberg') },
                            { value: attributes.domainColor, onChange: function (v) { setAttributes({ domainColor: v || '#6c3fb5' }); }, label: __('Domain / accent', 'blockenberg') },
                        ],
                    })
                ),
                el('div', blockProps,
                    el(CardPreview, { attributes: attributes })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var imageEl = null;
            if (a.showImage && a.imageUrl && a.cardStyle !== 'minimal') {
                var imgH = a.cardStyle === 'large' ? (a.imageHeight * 1.5) : a.imageHeight;
                imageEl = el('img', {
                    className: 'bklp-image',
                    src:   a.imageUrl,
                    alt:   a.imageAlt,
                    style: {
                        width:      '100%',
                        height:     imgH + 'px',
                        objectFit:  'cover',
                        display:    'block',
                        maxWidth:   a.cardStyle === 'horizontal' ? a.imageWidth + 'px' : undefined,
                    },
                    loading: 'lazy',
                });
            }

            return el('a', {
                className: 'bklp-card bklp-style-' + a.cardStyle + (a.hoverLift ? ' bklp-hover-lift' : ''),
                href:   a.url || '#',
                target: a.openNewTab ? '_blank' : undefined,
                rel:    a.openNewTab ? 'noopener noreferrer' : undefined,
                style: (function () {
                    var _tvFn = getTypoCssVars();
                    var s = {
                        '--bklp-bg':     a.bgColor,
                        '--bklp-border': a.borderColor,
                        '--bklp-title':  a.titleColor,
                        '--bklp-desc':   a.descColor,
                        '--bklp-domain': a.domainColor,
                        '--bklp-radius': a.borderRadius + 'px',
                        '--bklp-bw':     a.borderWidth + 'px',
                        '--bklp-shadow': a.shadow ? '0 2px 16px rgba(0,0,0,0.09)' : 'none',
                        '--bklp-img-w':  a.imageWidth + 'px',
                        maxWidth:        a.maxWidth + 'px',
                    };
                    if (_tvFn) {
                        Object.assign(s, _tvFn(a.titleTypo, '--bklp-tt-'));
                        Object.assign(s, _tvFn(a.descTypo, '--bklp-d-'));
                    }
                    return s;
                })(),
            },
                a.cardStyle === 'horizontal' && imageEl,
                !a.cardStyle || a.cardStyle !== 'horizontal' && imageEl,
                el('div', { className: 'bklp-text' },
                    (a.showFavicon || a.showDomain) && el('div', { className: 'bklp-meta' },
                        a.showFavicon && a.faviconUrl && el('img', {
                            className: 'bklp-favicon',
                            src: a.faviconUrl, alt: '', width: 14, height: 14
                        }),
                        a.showDomain && el('span', { className: 'bklp-domain' }, a.domain || a.siteName),
                        a.siteName && a.domain && el('span', { className: 'bklp-dot', 'aria-hidden': 'true' }, '·'),
                        a.siteName && a.domain && el('span', { className: 'bklp-sitename' }, a.siteName)
                    ),
                    el('p', { className: 'bklp-title' }, a.title),
                    a.showDesc && el('p', { className: 'bklp-desc' }, a.description)
                )
            );
        },
    });
}() );
