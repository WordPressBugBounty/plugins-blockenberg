( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InnerBlocks = wp.blockEditor.InnerBlocks;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    var TEMPLATE = [
        ['core/heading', { level: 2, placeholder: __('Section Heading', 'blockenberg') }],
        ['core/paragraph', { placeholder: __('Add your content here…', 'blockenberg') }],
    ];

    var DIR_OPTIONS = [
        { label: __('Left Low → Right High', 'blockenberg'), value: 'left-low'  },
        { label: __('Left High → Right Low', 'blockenberg'), value: 'left-high' },
    ];

    /**
     * Build a clip-path polygon string for a skewed section.
     * top edge: controlled by skewTop + topAngle + topDirection
     * bottom edge: controlled by skewBottom + bottomAngle + bottomDirection
     * Angle is expressed in degrees; we convert to a % offset on the Y axis.
     */
    function buildClipPath(a) {
        // We use percentage-based polygon points.
        // Y axis: 0% = top, 100% = bottom
        // We express the skew offset as a percentage of height.
        // The tangent of the angle times the width gives the height offset, but since
        // we're working in % and the width ≫ relevant height we use a simplified
        // linear approach: angle degrees → percent offset (1° ≈ 1.77% for 16:9-ish).
        var topLeft, topRight, botLeft, botRight;
        var tOff = a.topAngle; // degrees treated as % shift for simplicity
        var bOff = a.bottomAngle;

        if (a.skewTop) {
            if (a.topDirection === 'left-low') {
                topLeft  = tOff + '%';
                topRight = '0%';
            } else {
                topLeft  = '0%';
                topRight = tOff + '%';
            }
        } else {
            topLeft  = '0%';
            topRight = '0%';
        }

        if (a.skewBottom) {
            if (a.bottomDirection === 'left-low') {
                botLeft  = '100%';
                botRight = (100 - bOff) + '%';
            } else {
                botLeft  = (100 - bOff) + '%';
                botRight = '100%';
            }
        } else {
            botLeft  = '100%';
            botRight = '100%';
        }

        return 'polygon(0 ' + topLeft + ', 100% ' + topRight + ', 100% ' + botRight + ', 0 ' + botLeft + ')';
    }

    function buildBackground(a) {
        if (a.backgroundImageUrl) {
            return {
                backgroundImage: (a.overlayOpacity > 0
                    ? 'linear-gradient(rgba(' + hexToRgb(a.overlayColor) + ',' + (a.overlayOpacity / 100) + '),rgba(' + hexToRgb(a.overlayColor) + ',' + (a.overlayOpacity / 100) + ')),url(' + a.backgroundImageUrl + ')'
                    : 'url(' + a.backgroundImageUrl + ')'),
                backgroundSize: a.backgroundSize,
                backgroundPosition: a.backgroundPosition,
            };
        }
        if (a.useGradient) {
            return { background: 'linear-gradient(' + a.gradientAngle + 'deg,' + a.backgroundColor + ',' + a.gradientEnd + ')' };
        }
        return { background: a.backgroundColor };
    }

    function hexToRgb(hex) {
        if (!hex || hex.charAt(0) !== '#') return '0,0,0';
        return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16);
    }

    registerBlockType('blockenberg/skewed-section', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var clipPath = buildClipPath(a);
            var bgStyles = buildBackground(a);

            var extraPadTop    = (a.skewTop && a.paddingExtraForSkew)    ? (a.topAngle * 6) : 0;
            var extraPadBottom = (a.skewBottom && a.paddingExtraForSkew) ? (a.bottomAngle * 6) : 0;

            var sectionStyle = Object.assign({}, bgStyles, {
                position:      'relative',
                minHeight:     a.minHeight + 'px',
                paddingTop:    (a.paddingTop + extraPadTop) + 'px',
                paddingBottom: (a.paddingBottom + extraPadBottom) + 'px',
                color:         a.textColor,
                clipPath:      clipPath,
                WebkitClipPath: clipPath,
                overflow:      'visible',
                boxSizing:     'border-box',
            });

            var contentStyle = {
                position:  'relative',
                zIndex:    2,
                maxWidth:  a.contentMaxWidth + 'px',
                margin:    '0 auto',
                padding:   '0 24px',
                textAlign: a.textAlign,
                color:     a.textColor,
            };

            var blockProps = useBlockProps({ className: 'bksk-wrap', style: sectionStyle });

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,

                    /* Skew Shape */
                    el(PanelBody, { title: __('Skew Shape', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, {
                            label: __('Skew Top Edge', 'blockenberg'),
                            checked: a.skewTop,
                            onChange: function (v) { set({ skewTop: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.skewTop ? el(RangeControl, {
                            label: __('Top Angle (°)', 'blockenberg'),
                            value: a.topAngle,
                            min: 1, max: 15,
                            onChange: function (v) { set({ topAngle: v }); }
                        }) : null,
                        a.skewTop ? el(SelectControl, {
                            label: __('Top Direction', 'blockenberg'),
                            value: a.topDirection,
                            options: DIR_OPTIONS,
                            onChange: function (v) { set({ topDirection: v }); }
                        }) : null,
                        el(ToggleControl, {
                            label: __('Skew Bottom Edge', 'blockenberg'),
                            checked: a.skewBottom,
                            onChange: function (v) { set({ skewBottom: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.skewBottom ? el(RangeControl, {
                            label: __('Bottom Angle (°)', 'blockenberg'),
                            value: a.bottomAngle,
                            min: 1, max: 15,
                            onChange: function (v) { set({ bottomAngle: v }); }
                        }) : null,
                        a.skewBottom ? el(SelectControl, {
                            label: __('Bottom Direction', 'blockenberg'),
                            value: a.bottomDirection,
                            options: DIR_OPTIONS,
                            onChange: function (v) { set({ bottomDirection: v }); }
                        }) : null,
                        el(ToggleControl, {
                            label: __('Add Extra Padding for Skew', 'blockenberg'),
                            checked: a.paddingExtraForSkew,
                            onChange: function (v) { set({ paddingExtraForSkew: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    /* Background */
                    el(PanelBody, { title: __('Background', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Use Gradient', 'blockenberg'),
                            checked: a.useGradient,
                            onChange: function (v) { set({ useGradient: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.useGradient ? el(RangeControl, {
                            label: __('Gradient Angle (°)', 'blockenberg'),
                            value: a.gradientAngle,
                            min: 0, max: 360,
                            onChange: function (v) { set({ gradientAngle: v }); }
                        }) : null,

                        /* Background Image */
                        el('p', { style: { fontWeight: 600, marginBottom: '4px' } }, __('Background Image', 'blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) { set({ backgroundImageUrl: media.url, backgroundImageId: media.id }); },
                                allowedTypes: ['image'],
                                value: a.backgroundImageId,
                                render: function (ref) {
                                    return el(Button, {
                                        onClick: ref.open,
                                        variant: a.backgroundImageUrl ? 'secondary' : 'primary',
                                        style: { marginBottom: '6px' }
                                    }, a.backgroundImageUrl ? __('Replace Image', 'blockenberg') : __('Set Background Image', 'blockenberg'));
                                }
                            })
                        ),
                        a.backgroundImageUrl ? el(Button, {
                            variant: 'tertiary', isDestructive: true,
                            onClick: function () { set({ backgroundImageUrl: '', backgroundImageId: 0 }); }
                        }, __('Remove Image', 'blockenberg')) : null,
                        a.backgroundImageUrl ? el(SelectControl, {
                            label: __('Background Size', 'blockenberg'),
                            value: a.backgroundSize,
                            options: [
                                { label: 'Cover',   value: 'cover'    },
                                { label: 'Contain', value: 'contain'  },
                                { label: 'Auto',    value: 'auto'     },
                            ],
                            onChange: function (v) { set({ backgroundSize: v }); }
                        }) : null,
                        a.backgroundImageUrl ? el(RangeControl, {
                            label: __('Image Overlay Opacity (%)', 'blockenberg'),
                            value: a.overlayOpacity,
                            min: 0, max: 100,
                            onChange: function (v) { set({ overlayOpacity: v }); }
                        }) : null
                    ),

                    /* Layout */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Min Height (px)', 'blockenberg'),
                            value: a.minHeight,
                            min: 80, max: 1200,
                            onChange: function (v) { set({ minHeight: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Top (px)', 'blockenberg'),
                            value: a.paddingTop,
                            min: 0, max: 300,
                            onChange: function (v) { set({ paddingTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Bottom (px)', 'blockenberg'),
                            value: a.paddingBottom,
                            min: 0, max: 300,
                            onChange: function (v) { set({ paddingBottom: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Content Max Width (px)', 'blockenberg'),
                            value: a.contentMaxWidth,
                            min: 200, max: 1600,
                            onChange: function (v) { set({ contentMaxWidth: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Text Align', 'blockenberg'),
                            value: a.textAlign,
                            options: [
                                { label: __('Left',   'blockenberg'), value: 'left'   },
                                { label: __('Center', 'blockenberg'), value: 'center' },
                                { label: __('Right',  'blockenberg'), value: 'right'  },
                            ],
                            onChange: function (v) { set({ textAlign: v }); }
                        })
                    ),

                    /* Colors */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.backgroundColor, onChange: function (v) { set({ backgroundColor: v || '#1e40af' }); }, label: __('Background', 'blockenberg') },
                            a.useGradient ? { value: a.gradientEnd, onChange: function (v) { set({ gradientEnd: v || '#7c3aed' }); }, label: __('Gradient End', 'blockenberg') } : null,
                            a.backgroundImageUrl ? { value: a.overlayColor, onChange: function (v) { set({ overlayColor: v || '#1e40af' }); }, label: __('Overlay Color', 'blockenberg') } : null,
                            { value: a.textColor, onChange: function (v) { set({ textColor: v || '#ffffff' }); }, label: __('Text Color', 'blockenberg') },
                        ].filter(Boolean)
                    })
                ),

                /* Canvas */
                el('div', blockProps,
                    el('div', { style: contentStyle },
                        el(InnerBlocks, { template: TEMPLATE, __experimentalCaptureToolbars: true })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bksk-wrap' });

            return el('div', Object.assign({}, blockProps, {
                'data-skew-top':        String(a.skewTop),
                'data-skew-bottom':     String(a.skewBottom),
                'data-top-angle':       a.topAngle,
                'data-bottom-angle':    a.bottomAngle,
                'data-top-dir':         a.topDirection,
                'data-bottom-dir':      a.bottomDirection,
                'data-bg':              a.backgroundColor,
                'data-gradient':        String(a.useGradient),
                'data-bg-end':          a.gradientEnd,
                'data-grad-angle':      a.gradientAngle,
                'data-bg-img':          a.backgroundImageUrl,
                'data-bg-size':         a.backgroundSize,
                'data-bg-pos':          a.backgroundPosition,
                'data-overlay-color':   a.overlayColor,
                'data-overlay-opacity': a.overlayOpacity,
                'data-min-height':      a.minHeight,
                'data-pt':              a.paddingTop,
                'data-pb':              a.paddingBottom,
                'data-extra-pad':       String(a.paddingExtraForSkew),
                'data-max-width':       a.contentMaxWidth,
                'data-text-color':      a.textColor,
                'data-text-align':      a.textAlign,
            }),
                el('div', { className: 'bksk-content' },
                    el(InnerBlocks.Content, null)
                )
            );
        }
    });
}() );
