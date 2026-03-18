( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }
    /* ── Shape definitions ─────────────────────────────────────────────────── */
    var SHAPES = {
        circle:   'circle(50% at 50% 50%)',
        hexagon:  'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
        blob:     'path("M180,32C230,0,290,20,310,70s10,110-30,150s-100,70-160,60s-110-50-100-110S130,64,180,32z")',
        star:     'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        diamond:  'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        cross:    'polygon(33% 0%, 67% 0%, 67% 33%, 100% 33%, 100% 67%, 67% 67%, 67% 100%, 33% 100%, 33% 67%, 0% 67%, 0% 33%, 33% 33%)',
        heart:    'path("M256,460C256,460,32,338,32,180a96,96,0,0,1,181-45,96,96,0,0,1,181,45C394,338,256,460,256,460Z")',
        pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
        triangle: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        squircle: 'path("M180,20C240,0,340,0,360,100s0,200-50,240s-180,60-230,20S0,200,0,140S120,40,180,20Z")',
    };

    var SHAPE_OPTIONS = Object.keys(SHAPES).map(function (k) {
        return { label: k.charAt(0).toUpperCase() + k.slice(1), value: k };
    });

    var PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="%23e5e7eb"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em">Choose Image</text></svg>';

    /* ── Build clip-path value (blob/heart/squircle use path(), others polygon) */
    function getClip(shape) {
        return SHAPES[shape] || SHAPES.circle;
    }

    /* ── Shared render ─────────────────────────────────────────────────────── */
    function MaskPreview(props) {
        var a = props.a;
        var isEdit = props.isEdit;

        var size   = a.size;
        var clip   = getClip(a.shape);
        var shadow = a.showShadow
            ? '0 20px 40px rgba(' + hexRgb(a.shadowColor || '#000') + ',' + (a.shadowIntensity / 100) + ')'
            : 'none';
        var transform = a.rotation ? 'rotate(' + a.rotation + 'deg)' : '';
        var transition = isEdit ? 'none' : ('transform ' + a.transitionDuration + 'ms ease');

        var wrapStyle = {
            display:   'inline-block',
            position:  'relative',
            textAlign: 'center',
        };

        var outerStyle = {
            display: 'inline-block',
            position: 'relative',
            width: size + 'px',
            height: size + 'px',
            transform: transform,
        };

        /* Border ring — rendered as a same-shape div BEHIND the image */
        var borderEl = null;
        if (a.showBorder) {
            var bOff = a.borderOffset || 8;
            var bW   = a.borderWidth || 4;
            var bSize = size + bOff * 2 + bW * 2;
            borderEl = el('div', {
                className: 'bkim-border',
                style: {
                    position:   'absolute',
                    top:        -(bOff + bW) + 'px',
                    left:       -(bOff + bW) + 'px',
                    width:      bSize + 'px',
                    height:     bSize + 'px',
                    background: a.borderColor || '#6c3fb5',
                    clipPath:   clip,
                    WebkitClipPath: clip,
                    zIndex: 0,
                    transition: transition,
                }
            });
        }

        var imgStyle = {
            display:         'block',
            width:           size + 'px',
            height:          size + 'px',
            objectFit:       'cover',
            objectPosition:  a.objectPosition || 'center center',
            clipPath:        clip,
            WebkitClipPath:  clip,
            filter:          shadow !== 'none' ? 'drop-shadow(0 15px 25px rgba(' + hexRgb(a.shadowColor || '#000') + ',' + (a.shadowIntensity / 100) + '))' : 'none',
            transition:      transition,
            position:        'relative',
            zIndex:          1,
        };

        var img = el('img', {
            src: a.imageUrl || PLACEHOLDER,
            alt: a.imageAlt || '',
            style: imgStyle,
            className: 'bkim-img',
        });

        var caption = (a.showCaption && a.caption) ? el('p', {
            className: 'bkim-caption',
            style: {
                marginTop:   '12px',
                fontSize:    (a.captionSize || 14) + 'px',
                color:       a.captionColor || '#374151',
                textAlign:   a.captionAlign || 'center',
                fontStyle:   'italic',
                lineHeight:  '1.4',
            }
        }, a.caption) : null;

        var innerEl = el('div', { style: outerStyle }, borderEl, img);

        if (a.linkUrl && !isEdit) {
            innerEl = el('a', {
                href: a.linkUrl,
                target: a.linkNewTab ? '_blank' : undefined,
                rel:    a.linkNewTab ? 'noopener noreferrer' : undefined,
                style: { display: 'inline-block' }
            }, innerEl);
        }

        return el('figure', { style: wrapStyle, className: 'bkim-figure' }, innerEl, caption);
    }

    function hexRgb(hex) {
        if (!hex || hex.charAt(0) !== '#') return '0,0,0';
        return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16);
    }

    /* ── Register ──────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/image-mask', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps({
                className: 'bkim-wrap',
                style: (function () {
                    var s = { textAlign: a.align || 'center' };
                    var fn = getTypoCssVars();
                    if (fn) { Object.assign(s, fn(a.titleTypo, '--bkim-tt-'), fn(a.subtitleTypo, '--bkim-st-'), fn(a.captionTypo, '--bkim-cp-')); }
                    return s;
                })()
            });

            return el(wp.element.Fragment, null,

                el(InspectorControls, null,

                    /* Image */
                    el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: true },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) { set({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); },
                                allowedTypes: ['image'],
                                value: a.imageId,
                                render: function (ref) {
                                    return el(Button, {
                                        onClick: ref.open,
                                        variant: a.imageUrl ? 'secondary' : 'primary',
                                        style: { width: '100%', justifyContent: 'center', marginBottom: '8px' }
                                    }, a.imageUrl ? __('Replace Image', 'blockenberg') : __('Choose Image', 'blockenberg'));
                                }
                            })
                        ),
                        a.imageUrl ? el(Button, {
                            variant: 'tertiary', isDestructive: true,
                            onClick: function () { set({ imageUrl: '', imageId: 0, imageAlt: '' }); }
                        }, __('Remove Image', 'blockenberg')) : null,
                        el(TextControl, {
                            label: __('Alt Text', 'blockenberg'),
                            value: a.imageAlt,
                            onChange: function (v) { set({ imageAlt: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Image Focus Point', 'blockenberg'),
                            value: a.objectPosition,
                            options: [
                                { label: __('Center',        'blockenberg'), value: 'center center'  },
                                { label: __('Top',           'blockenberg'), value: 'center top'     },
                                { label: __('Bottom',        'blockenberg'), value: 'center bottom'  },
                                { label: __('Left',          'blockenberg'), value: 'left center'    },
                                { label: __('Right',         'blockenberg'), value: 'right center'   },
                                { label: __('Top Left',      'blockenberg'), value: 'left top'       },
                                { label: __('Top Right',     'blockenberg'), value: 'right top'      },
                                { label: __('Bottom Left',   'blockenberg'), value: 'left bottom'    },
                                { label: __('Bottom Right',  'blockenberg'), value: 'right bottom'   },
                            ],
                            onChange: function (v) { set({ objectPosition: v }); }
                        })
                    ),

                    /* Shape */
                    el(PanelBody, { title: __('Shape', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Mask Shape', 'blockenberg'),
                            value: a.shape,
                            options: SHAPE_OPTIONS,
                            onChange: function (v) { set({ shape: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Size (px)', 'blockenberg'),
                            value: a.size,
                            min: 80, max: 800,
                            onChange: function (v) { set({ size: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Rotation (°)', 'blockenberg'),
                            value: a.rotation,
                            min: -180, max: 180,
                            onChange: function (v) { set({ rotation: v }); }
                        })
                    ),

                    /* Border */
                    el(PanelBody, { title: __('Shape Border', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Border Ring', 'blockenberg'),
                            checked: a.showBorder,
                            onChange: function (v) { set({ showBorder: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showBorder ? el(RangeControl, {
                            label: __('Border Width (px)', 'blockenberg'),
                            value: a.borderWidth,
                            min: 1, max: 20,
                            onChange: function (v) { set({ borderWidth: v }); }
                        }) : null,
                        a.showBorder ? el(RangeControl, {
                            label: __('Border Offset (px)', 'blockenberg'),
                            value: a.borderOffset,
                            min: 0, max: 40,
                            onChange: function (v) { set({ borderOffset: v }); }
                        }) : null
                    ),

                    /* Shadow & Hover */
                    el(PanelBody, { title: __('Shadow & Hover', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Drop Shadow', 'blockenberg'),
                            checked: a.showShadow,
                            onChange: function (v) { set({ showShadow: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showShadow ? el(RangeControl, {
                            label: __('Shadow Intensity (%)', 'blockenberg'),
                            value: a.shadowIntensity,
                            min: 5, max: 70,
                            onChange: function (v) { set({ shadowIntensity: v }); }
                        }) : null,
                        el(SelectControl, {
                            label: __('Hover Effect', 'blockenberg'),
                            value: a.hoverEffect,
                            options: [
                                { label: __('Zoom In',    'blockenberg'), value: 'zoom'    },
                                { label: __('Zoom Out',   'blockenberg'), value: 'zoom-out'},
                                { label: __('Rotate',     'blockenberg'), value: 'rotate'  },
                                { label: __('None',       'blockenberg'), value: 'none'    },
                            ],
                            onChange: function (v) { set({ hoverEffect: v }); }
                        }),
                        a.hoverEffect === 'zoom' || a.hoverEffect === 'zoom-out' ? el(RangeControl, {
                            label: __('Hover Scale (%)', 'blockenberg'),
                            value: a.hoverScale,
                            min: 80, max: 150,
                            onChange: function (v) { set({ hoverScale: v }); }
                        }) : null,
                        el(RangeControl, {
                            label: __('Transition (ms)', 'blockenberg'),
                            value: a.transitionDuration,
                            min: 0, max: 1000, step: 50,
                            onChange: function (v) { set({ transitionDuration: v }); }
                        })
                    ),

                    /* Caption */
                    el(PanelBody, { title: __('Caption', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Caption', 'blockenberg'),
                            checked: a.showCaption,
                            onChange: function (v) { set({ showCaption: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showCaption ? el(TextControl, {
                            label: __('Caption Text', 'blockenberg'),
                            value: a.caption,
                            onChange: function (v) { set({ caption: v }); }
                        }) : null,
                        a.showCaption ? el(SelectControl, {
                            label: __('Caption Align', 'blockenberg'),
                            value: a.captionAlign,
                            options: [
                                { label: __('Left',   'blockenberg'), value: 'left'   },
                                { label: __('Center', 'blockenberg'), value: 'center' },
                                { label: __('Right',  'blockenberg'), value: 'right'  },
                            ],
                            onChange: function (v) { set({ captionAlign: v }); }
                        }) : null,
                        a.showCaption ? el(RangeControl, {
                            label: __('Caption Size (px)', 'blockenberg'),
                            value: a.captionSize,
                            min: 10, max: 24,
                            onChange: function (v) { set({ captionSize: v }); }
                        }) : null
                    ),

                    /* Link */
                    el(PanelBody, { title: __('Link', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            label: __('Link URL', 'blockenberg'),
                            type: 'url',
                            value: a.linkUrl,
                            onChange: function (v) { set({ linkUrl: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Open in New Tab', 'blockenberg'),
                            checked: a.linkNewTab,
                            onChange: function (v) { set({ linkNewTab: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    /* Colors */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.borderColor,  onChange: function (v) { set({ borderColor: v || '#6c3fb5' }); },  label: __('Border Ring Color', 'blockenberg') },
                            { value: a.shadowColor,  onChange: function (v) { set({ shadowColor: v || '#000000' }); },  label: __('Shadow Color', 'blockenberg') },
                            { value: a.captionColor, onChange: function (v) { set({ captionColor: v || '#374151' }); }, label: __('Caption Color', 'blockenberg') },
                        ]
                    }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { set({ subtitleTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Caption', 'blockenberg'), value: a.captionTypo, onChange: function (v) { set({ captionTypo: v }); } })
                    ),

                ),

                /* Canvas */
                el('div', blockProps,
                    el(MaskPreview, { a: a, isEdit: true })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkim-wrap',
                style: (function () {
                    var s = {};
                    var fn = getTypoCssVars();
                    if (fn) { Object.assign(s, fn(a.titleTypo, '--bkim-tt-'), fn(a.subtitleTypo, '--bkim-st-'), fn(a.captionTypo, '--bkim-cp-')); }
                    return s;
                })()
            });
            var clip = getClip(a.shape);

            var imgStyle = [
                'width:' + a.size + 'px',
                'height:' + a.size + 'px',
                'object-fit:cover',
                'object-position:' + (a.objectPosition || 'center center'),
                'clip-path:' + clip,
                '-webkit-clip-path:' + clip,
                'display:block',
                'position:relative',
                'z-index:1',
                a.showShadow ? 'filter:drop-shadow(0 15px 25px rgba(' + hexRgb(a.shadowColor || '#000') + ',' + (a.shadowIntensity / 100) + '))' : '',
                'transition:transform ' + a.transitionDuration + 'ms ease',
            ].filter(Boolean).join(';');

            var outerStyle = 'display:inline-block;position:relative;width:' + a.size + 'px;height:' + a.size + 'px;' + (a.rotation ? 'transform:rotate(' + a.rotation + 'deg);' : '');

            var borderEl = null;
            if (a.showBorder) {
                var bOff  = a.borderOffset || 8;
                var bW    = a.borderWidth || 4;
                var bSize = a.size + bOff * 2 + bW * 2;
                var bStyle = 'position:absolute;top:' + -(bOff + bW) + 'px;left:' + -(bOff + bW) + 'px;width:' + bSize + 'px;height:' + bSize + 'px;background:' + (a.borderColor || '#6c3fb5') + ';clip-path:' + clip + ';-webkit-clip-path:' + clip + ';z-index:0;';
                borderEl = el('div', { className: 'bkim-border', style: bStyle });
            }

            var imgEl = el('img', {
                src: a.imageUrl || '',
                alt: a.imageAlt || '',
                className: 'bkim-img',
                style: imgStyle,
                'data-hover': a.hoverEffect,
                'data-scale': a.hoverScale,
            });

            var caption = (a.showCaption && a.caption) ? el('p', {
                className: 'bkim-caption',
                style: 'margin-top:12px;color:' + (a.captionColor || '#374151') + ';text-align:' + (a.captionAlign || 'center') + ';font-style:italic;',
            }, a.caption) : null;

            var inner = el('div', { style: outerStyle }, borderEl, imgEl);

            if (a.linkUrl) {
                inner = el('a', {
                    href: a.linkUrl,
                    target: a.linkNewTab ? '_blank' : undefined,
                    rel:    a.linkNewTab ? 'noopener noreferrer' : undefined,
                    style: 'display:inline-block;'
                }, inner);
            }

            return el('div', blockProps,
                el('figure', { className: 'bkim-figure', style: 'display:inline-block;text-align:' + (a.captionAlign || 'center') + ';' },
                    inner, caption
                )
            );
        }
    });

    function hexRgb(hex) {
        if (!hex || hex.charAt(0) !== '#') return '0,0,0';
        return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16);
    }

    function getClip(shape) {
        return SHAPES[shape] || SHAPES.circle;
    }
}() );
