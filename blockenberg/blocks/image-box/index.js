(function () {
    var el = window.wp.element.createElement;
    var __ = function (s) { return s; };
    var registerBlockType  = window.wp.blocks.registerBlockType;
    var InspectorControls  = window.wp.blockEditor.InspectorControls;
    var MediaUpload        = window.wp.blockEditor.MediaUpload;
    var MediaUploadCheck   = window.wp.blockEditor.MediaUploadCheck;
    var PanelBody          = window.wp.components.PanelBody;
    var ToggleControl      = window.wp.components.ToggleControl;
    var SelectControl      = window.wp.components.SelectControl;
    var RangeControl       = window.wp.components.RangeControl;
    var TextControl        = window.wp.components.TextControl;
    var Button             = window.wp.components.Button;
    var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var shadowMap = {
        none: 'none',
        sm:   '0 1px 3px rgba(0,0,0,0.12)',
        md:   '0 4px 12px rgba(0,0,0,0.18)',
        lg:   '0 10px 30px rgba(0,0,0,0.25)',
    };

    registerBlockType('blockenberg/image-box', {
        title: __('Image Box'),
        description: __('A clickable image card with overlay, hover effects, and a link.'),
        category: 'bkbg-media',
        icon: el('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 24, height: 24 },
            el('path', { d: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-5.5-7l-3 3.86-2.5-2.5-3.5 4.64H19l-3.5-5z' })
        ),

        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;

            var ratioOptions = [
                { label: '16:9',    value: '56.25' },
                { label: '4:3',     value: '75' },
                { label: '1:1',     value: '100' },
                { label: '3:4',     value: '133' },
                { label: '21:9',    value: '42.85' },
            ];

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Image'), initialOpen: true },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function (media) {
                                setA({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' });
                            },
                            allowedTypes: ['image'],
                            value: a.imageId,
                            render: function (ref) {
                                return el('div', null,
                                    a.imageUrl && el('img', {
                                        src:   a.imageUrl,
                                        alt:   a.imageAlt,
                                        style: { width: '100%', borderRadius: 6, marginBottom: 8 }
                                    }),
                                    el(Button, {
                                        onClick:    ref.open,
                                        variant:    a.imageId ? 'secondary' : 'primary',
                                        style:      { marginBottom: 8 },
                                    }, a.imageId ? __('Replace Image') : __('Select Image')),
                                    a.imageId && el(Button, {
                                        onClick:  function () { setA({ imageUrl: '', imageId: 0, imageAlt: '' }); },
                                        variant:  'link',
                                        isDestructive: true,
                                    }, __('Remove Image'))
                                );
                            }
                        })
                    ),
                    el(SelectControl, {
                        label:    __('Aspect Ratio'),
                        value:    a.imageRatio,
                        options:  ratioOptions,
                        onChange: function (v) { setA({ imageRatio: v }); },
                    })
                ),
                el(PanelBody, { title: __('Content'), initialOpen: true },
                    el(TextControl, {
                        label:    __('Title'),
                        value:    a.title,
                        onChange: function (v) { setA({ title: v }); },
                    }),
                    el(TextControl, {
                        label:    __('Subtitle'),
                        value:    a.subtitle,
                        onChange: function (v) { setA({ subtitle: v }); },
                    }),
                    el(TextControl, {
                        label:    __('Link URL'),
                        value:    a.linkUrl,
                        onChange: function (v) { setA({ linkUrl: v }); },
                    }),
                    el(SelectControl, {
                        label:    __('Link Target'),
                        value:    a.linkTarget,
                        options:  [
                            { label: 'Same tab',  value: '_self' },
                            { label: 'New tab',   value: '_blank' },
                        ],
                        onChange: function (v) { setA({ linkTarget: v }); },
                    }),
                    el(SelectControl, {
                        label:    __('Title Position'),
                        value:    a.titlePosition,
                        options:  [
                            { label: 'Overlay – Bottom', value: 'over-bottom' },
                            { label: 'Overlay – Center', value: 'over-center' },
                            { label: 'Below image',      value: 'below' },
                        ],
                        onChange: function (v) { setA({ titlePosition: v }); },
                    }),
                    ),
                el(PanelBody, { title: __('Style'), initialOpen: false },
                    el(SelectControl, {
                        label:    __('Hover Effect'),
                        value:    a.hoverEffect,
                        options:  [
                            { label: 'Zoom',    value: 'zoom' },
                            { label: 'Fade',    value: 'fade' },
                            { label: 'Lift',    value: 'lift' },
                            { label: 'Overlay', value: 'overlay' },
                            { label: 'None',    value: 'none' },
                        ],
                        onChange: function (v) { setA({ hoverEffect: v }); },
                    }),
                    el(SelectControl, {
                        label:    __('Box Shadow'),
                        value:    a.shadow,
                        options:  [
                            { label: 'None',   value: 'none' },
                            { label: 'Small',  value: 'sm' },
                            { label: 'Medium', value: 'md' },
                            { label: 'Large',  value: 'lg' },
                        ],
                        onChange: function (v) { setA({ shadow: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Border Radius'), value: a.borderRadius, min: 0, max: 40,
                        onChange: function (v) { setA({ borderRadius: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Width (%)'), value: a.width, min: 20, max: 100, step: 5,
                        onChange: function (v) { setA({ width: v }); },
                    }),
                    el(ToggleControl, {
                        label: __('Show overlay'),
                        checked: a.overlay,
                        onChange: function (v) { setA({ overlay: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    a.overlay && el(RangeControl, {
                        label: __('Overlay Hover Opacity (%)'), value: a.overlayHoverOpacity, min: 0, max: 100,
                        onChange: function (v) { setA({ overlayHoverOpacity: v }); },
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypographyControl() && el( getTypographyControl(), { label: __( 'Title' ), value: a.titleTypo || {}, onChange: function(v){ setA({ titleTypo: v }); } }),
                    getTypographyControl() && el( getTypographyControl(), { label: __( 'Subtitle' ), value: a.subtitleTypo || {}, onChange: function(v){ setA({ subtitleTypo: v }); } })
                ),
el(PanelBody, { title: __('Colors'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Text Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Title Color'),    value: a.titleColor,    onChange: function (v) { setA({ titleColor:    v || '#ffffff' }); } },
                            { label: __('Subtitle Color'), value: a.subtitleColor, onChange: function (v) { setA({ subtitleColor: v || 'rgba(255,255,255,0.85)' }); } },
                        ],
                    })
                )
            );

            /* Editor preview */
            var below = a.titlePosition === 'below';

            var innerStyle = {
                position:     'relative',
                overflow:     'hidden',
                borderRadius: a.borderRadius + 'px',
                width:        a.width + '%',
                boxShadow:    shadowMap[a.shadow] || 'none',
                display:      'inline-block',
                verticalAlign:'top',
                cursor:       a.linkUrl ? 'pointer' : 'default',
            };

            var ratioBox = {
                paddingBottom:  a.imageRatio + '%',
                position:       'relative',
                overflow:       'hidden',
                background:     a.imageUrl ? 'transparent' : '#e5e7eb',
            };

            var imgStyle = {
                position:   'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit:  'cover',
            };

            var overlayStyle = a.overlay ? {
                position:   'absolute', inset: 0,
                background: a.overlayColor,
            } : {};

            var textJustify = a.titlePosition === 'over-center' ? 'center' : 'flex-start';
            var textAlign   = a.titlePosition === 'over-center' ? 'center' : 'left';

            var textOverlayStyle = {
                position:       'absolute',
                left: 0, right: 0, padding: '16px',
                display:        'flex', flexDirection: 'column',
                justifyContent: textJustify,
                alignItems:     textJustify,
                textAlign:      textAlign,
            };
            if (a.titlePosition === 'over-bottom') {
                textOverlayStyle.bottom = 0;
            } else if (a.titlePosition === 'over-center') {
                textOverlayStyle.top = '50%';
                textOverlayStyle.transform = 'translateY(-50%)';
            }

            return el('div', { className: 'bkbg-imgb-editor', style: (function(){
                var s = { maxWidth: '100%' };
                if (a.titleSize) s['--bkbg-imgb-title-sz'] = a.titleSize + 'px';
                if (a.titleWeight) s['--bkbg-imgb-title-w'] = String(a.titleWeight);
                if (a.titleLineHeight) s['--bkbg-imgb-title-lh'] = String(a.titleLineHeight);
                if (a.subtitleSize) s['--bkbg-imgb-sub-sz'] = a.subtitleSize + 'px';
                if (a.subtitleFontWeight) s['--bkbg-imgb-sub-w'] = String(a.subtitleFontWeight);
                if (a.subtitleLineHeight) s['--bkbg-imgb-sub-lh'] = String(a.subtitleLineHeight);
                var _tv2 = getTypoCssVars();
                if (_tv2) {
                    Object.assign(s, _tv2(a.titleTypo, '--bkbg-imgb-tt-'));
                    Object.assign(s, _tv2(a.subtitleTypo, '--bkbg-imgb-st-'));
                }
                return s;
            })() },
                inspector,
                el('div', { style: innerStyle },
                    el('div', { style: ratioBox },
                        a.imageUrl
                            ? el('img', { src: a.imageUrl, alt: a.imageAlt, style: imgStyle })
                            : el('div', { style: Object.assign({}, imgStyle, { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }) }, __('Select an image in the sidebar')),
                        a.overlay && el('div', { style: overlayStyle }),
                        !below && el('div', { style: textOverlayStyle },
                            el('span', { className: 'bkbg-imgb-title', style: { color: a.titleColor, display: 'block' } }, a.title),
                            a.subtitle && el('span', { className: 'bkbg-imgb-subtitle', style: { color: a.subtitleColor, marginTop: 4 } }, a.subtitle)
                        )
                    ),
                    below && el('div', { style: { padding: '12px' } },
                        el('span', { className: 'bkbg-imgb-title', style: { color: '#111827', display: 'block' } }, a.title),
                        a.subtitle && el('span', { className: 'bkbg-imgb-subtitle', style: { color: '#6b7280', marginTop: 4, display: 'block' } }, a.subtitle)
                    )
                )
            );
        },

        save: function (props) {
            var a    = props.attributes;
            var below = a.titlePosition === 'below';

            var Tag      = a.linkUrl ? 'a' : 'div';
            var linkAttrs = a.linkUrl ? { href: a.linkUrl, target: a.linkTarget, rel: a.linkTarget === '_blank' ? 'noopener noreferrer' : undefined } : {};

            var wrapProps = Object.assign({}, linkAttrs, {
                className: 'bkbg-imgb-wrap bkbg-imgb-hover--' + a.hoverEffect + ' bkbg-imgb-shadow--' + a.shadow,
                style: (function(){
                    var s = {
                        '--bkbg-imgb-radius':    a.borderRadius + 'px',
                        '--bkbg-imgb-width':     a.width + '%',
                        '--bkbg-imgb-hover-opa': a.overlayHoverOpacity / 100,
                    };
                    if (a.titleSize) s['--bkbg-imgb-title-sz'] = a.titleSize + 'px';
                    if (a.titleWeight) s['--bkbg-imgb-title-w'] = String(a.titleWeight);
                    if (a.titleLineHeight) s['--bkbg-imgb-title-lh'] = String(a.titleLineHeight);
                    if (a.subtitleSize) s['--bkbg-imgb-sub-sz'] = a.subtitleSize + 'px';
                    if (a.subtitleFontWeight) s['--bkbg-imgb-sub-w'] = String(a.subtitleFontWeight);
                    if (a.subtitleLineHeight) s['--bkbg-imgb-sub-lh'] = String(a.subtitleLineHeight);
                    var _tv2 = getTypoCssVars();
                    if (_tv2) {
                        Object.assign(s, _tv2(a.titleTypo, '--bkbg-imgb-tt-'));
                        Object.assign(s, _tv2(a.subtitleTypo, '--bkbg-imgb-st-'));
                    }
                    return s;
                })()
            });

            return el(Tag, wrapProps,
                el('div', { className: 'bkbg-imgb-media', style: { paddingBottom: a.imageRatio + '%' } },
                    a.imageUrl && el('img', { src: a.imageUrl, alt: a.imageAlt, className: 'bkbg-imgb-img', loading: 'lazy' }),
                    a.overlay && el('div', { className: 'bkbg-imgb-overlay', style: { background: a.overlayColor } }),
                    !below && el('div', { className: 'bkbg-imgb-text bkbg-imgb-text--' + a.titlePosition },
                        el('span', { className: 'bkbg-imgb-title', style: { color: a.titleColor } }, a.title),
                        a.subtitle && el('span', { className: 'bkbg-imgb-subtitle', style: { color: a.subtitleColor } }, a.subtitle)
                    )
                ),
                below && el('div', { className: 'bkbg-imgb-caption' },
                    el('span', { className: 'bkbg-imgb-title' }, a.title),
                    a.subtitle && el('span', { className: 'bkbg-imgb-subtitle' }, a.subtitle)
                )
            );
        },
    });
})();
