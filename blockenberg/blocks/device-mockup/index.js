( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
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

    /* Frame color presets */
    var FRAME_COLORS = {
        'silver':     '#d4d4d8',
        'space-gray': '#374151',
        'gold':       '#d4a853',
        'white':      '#f9fafb',
        'black':      '#111827',
        'custom':     null,
    };

    function getFrameColor(a) {
        return a.frameColor === 'custom' ? a.frameColorCustom : (FRAME_COLORS[a.frameColor] || '#d4d4d8');
    }

    /* Aspect ratios */
    var ASPECTS = { phone: 9 / 19.5, tablet: 4 / 3, laptop: 16 / 10, browser: 16 / 10 };

    var PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23e5e7eb"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em">Screenshot</text></svg>';

    /* ── Device preview (shared edit + save) ───────────────────────────────── */
    function DevicePreview(props) {
        var a = props.a;
        var imgUrl = a.imageUrl || PLACEHOLDER;
        var frameColor = getFrameColor(a);
        var aspect = ASPECTS[a.deviceType] || (9 / 19.5);
        var sw = a.maxWidth;
        var sh = Math.round(sw / aspect);
        var fs = a.frameStroke;
        var or = a.outerRadius;
        var sr = a.screenRadius;
        var dur = a.transitionDuration || 400;

        /* Shadow */
        var shadowVal = a.shadow
            ? '0 ' + Math.round(sw * 0.06) + 'px ' + Math.round(sw * 0.14) + 'px rgba(0,0,0,' + (a.shadowIntensity / 100) + ')'
            : 'none';

        /* Perspective tilt */
        var transform3d = '';
        if (a.tiltX !== 0 || a.tiltY !== 0) {
            transform3d = 'perspective(1200px) rotateX(' + a.tiltY + 'deg) rotateY(' + a.tiltX + 'deg)';
        }

        var scale = (a.scale || 100) / 100;

        var outerStyle = {
            display: 'inline-block',
            transform: transform3d + (scale !== 1 ? ' scale(' + scale + ')' : ''),
            transformOrigin: 'center top',
        };

        /* ── PHONE / TABLET ── */
        if (a.deviceType === 'phone' || a.deviceType === 'tablet') {
            var deviceStyle = {
                position: 'relative',
                width: sw + 'px',
                boxSizing: 'border-box',
                background: frameColor,
                borderRadius: or + 'px',
                padding: fs + 'px',
                boxShadow: shadowVal,
            };

            var screenStyle = {
                position: 'relative',
                width: '100%',
                paddingBottom: (100 / aspect) + '%',
                borderRadius: sr + 'px',
                overflow: 'hidden',
                background: '#000',
            };

            var imgStyle = {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
            };

            /* Notch */
            var notchEl = (a.showNotch && a.deviceType === 'phone') ? el('div', {
                className: 'bkdv-notch',
                style: {
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '28%',
                    height: '20px',
                    background: frameColor,
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    zIndex: 3,
                }
            }) : null;

            /* Home indicator */
            var homeEl = (a.showHomeIndicator && a.deviceType === 'phone') ? el('div', {
                style: {
                    position: 'absolute',
                    bottom: Math.round(fs / 2) + 'px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '35%',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'rgba(255,255,255,0.6)',
                    zIndex: 3,
                }
            }) : null;

            /* Side buttons */
            var sidesEl = el('div', null,
                el('div', { style: { position: 'absolute', right: '-3px', top: '18%', width: '3px', height: '10%', borderRadius: '0 2px 2px 0', background: frameColor, filter: 'brightness(0.8)' } }),
                el('div', { style: { position: 'absolute', left: '-3px', top: '16%', width: '3px', height: '8%', borderRadius: '2px 0 0 2px', background: frameColor, filter: 'brightness(0.8)' } }),
                el('div', { style: { position: 'absolute', left: '-3px', top: '26%', width: '3px', height: '8%', borderRadius: '2px 0 0 2px', background: frameColor, filter: 'brightness(0.8)' } })
            );

            /* Reflection */
            var reflectionEl = a.showReflection ? el('div', {
                style: {
                    position: 'absolute',
                    inset: 0,
                    borderRadius: sr + 'px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)',
                    pointerEvents: 'none',
                    zIndex: 2,
                }
            }) : null;

            return el('div', { style: outerStyle },
                el('div', { style: deviceStyle },
                    sidesEl,
                    homeEl,
                    el('div', { style: screenStyle },
                        notchEl,
                        el('img', { src: imgUrl, alt: a.imageAlt, style: imgStyle }),
                        reflectionEl
                    )
                )
            );
        }

        /* ── LAPTOP ── */
        if (a.deviceType === 'laptop') {
            var lidW = sw;
            var lidH = Math.round(lidW * 0.6);
            var keyW = Math.round(lidW * 1.15);
            var keyH = Math.round(lidW * 0.08);

            var lidStyle = {
                width: lidW + 'px',
                height: lidH + 'px',
                background: frameColor,
                borderRadius: '12px 12px 0 0',
                padding: '10px 10px 6px',
                boxSizing: 'border-box',
                position: 'relative',
                boxShadow: shadowVal,
                margin: '0 auto',
            };

            var screenAreaStyle = {
                width: '100%',
                height: '100%',
                background: '#000',
                borderRadius: sr + 'px',
                overflow: 'hidden',
                position: 'relative',
            };

            var keybaseStyle = {
                width: keyW + 'px',
                height: keyH + 'px',
                background: frameColor,
                filter: 'brightness(0.88)',
                borderRadius: '0 0 8px 8px',
                margin: '0 auto',
                position: 'relative',
            };

            var hinge = el('div', {
                style: {
                    width: Math.round(lidW * 0.15) + 'px',
                    height: '4px',
                    background: frameColor,
                    filter: 'brightness(0.7)',
                    margin: '0 auto',
                }
            });

            return el('div', { style: outerStyle },
                el('div', { style: lidStyle },
                    el('div', { style: screenAreaStyle },
                        el('img', { src: imgUrl, alt: a.imageAlt, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }),
                        a.showReflection ? el('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%)', pointerEvents: 'none' } }) : null
                    )
                ),
                hinge,
                el('div', { style: keybaseStyle },
                    el('div', { style: { position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', width: '30%', height: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '3px' } })
                )
            );
        }

        /* ── BROWSER ── */
        if (a.deviceType === 'browser') {
            var chromeH = a.showBrowserChrome ? 38 : 0;
            var containerStyle = {
                width: sw + 'px',
                borderRadius: or + 'px',
                overflow: 'hidden',
                boxShadow: shadowVal,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(0,0,0,0.12)',
            };

            var chromeBarStyle = {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 12px',
                height: chromeH + 'px',
                background: a.frameColor === 'black' ? '#1f2937' : '#f3f4f6',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                flexShrink: 0,
            };

            var dot = function (color) { return el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: color, flexShrink: 0 } }); };

            var urlBarStyle = {
                flex: 1,
                height: '22px',
                background: '#fff',
                borderRadius: '4px',
                border: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '8px',
                fontSize: (a.urlBarFontSize || 11) + 'px',
                color: '#6b7280',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontFamily: 'monospace',
            };

            var viewportStyle = {
                width: '100%',
                paddingBottom: (100 / (ASPECTS.browser)) + '%',
                position: 'relative',
                background: '#fff',
            };

            return el('div', { style: outerStyle },
                el('div', { style: containerStyle },
                    a.showBrowserChrome ? el('div', { style: chromeBarStyle },
                        dot('#ef4444'), dot('#f59e0b'), dot('#22c55e'),
                        el('div', { style: urlBarStyle }, a.browserUrl || 'https://example.com')
                    ) : null,
                    el('div', { style: viewportStyle },
                        el('img', { src: imgUrl, alt: a.imageAlt, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }),
                        a.showReflection ? el('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%)', pointerEvents: 'none' } }) : null
                    )
                )
            );
        }

        return null;
    }

    /* ── Register ──────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/device-mockup', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkdv-wrap' });

            var wrapStyle = {
                textAlign: (props.attributes.align === 'right' ? 'right' : props.attributes.align === 'center' ? 'center' : 'left'),
            };

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,

                    /* Device */
                    el(PanelBody, { title: __('Device', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Device Type', 'blockenberg'),
                            value: a.deviceType,
                            options: [
                                { label: __('Phone', 'blockenberg'),   value: 'phone'   },
                                { label: __('Tablet', 'blockenberg'),  value: 'tablet'  },
                                { label: __('Laptop', 'blockenberg'),  value: 'laptop'  },
                                { label: __('Browser', 'blockenberg'), value: 'browser' },
                            ],
                            onChange: function (v) { set({ deviceType: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Frame Color', 'blockenberg'),
                            value: a.frameColor,
                            options: [
                                { label: __('Silver', 'blockenberg'),     value: 'silver'     },
                                { label: __('Space Gray', 'blockenberg'), value: 'space-gray' },
                                { label: __('Gold', 'blockenberg'),        value: 'gold'       },
                                { label: __('White', 'blockenberg'),      value: 'white'      },
                                { label: __('Black', 'blockenberg'),      value: 'black'      },
                                { label: __('Custom', 'blockenberg'),     value: 'custom'     },
                            ],
                            onChange: function (v) { set({ frameColor: v }); }
                        }),
                        a.frameColor === 'custom' ? el(wp.components.ColorPicker, {
                            color: a.frameColorCustom,
                            onChange: function (v) { set({ frameColorCustom: v }); },
                            enableAlpha: false,
                        }) : null,
                        el(RangeControl, {
                            label: __('Max Width (px)', 'blockenberg'),
                            value: a.maxWidth,
                            min: 120, max: 900,
                            onChange: function (v) { set({ maxWidth: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Scale (%)', 'blockenberg'),
                            value: a.scale,
                            min: 20, max: 200,
                            onChange: function (v) { set({ scale: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Frame Border Width (px)', 'blockenberg'),
                            value: a.frameStroke,
                            min: 4, max: 32,
                            onChange: function (v) { set({ frameStroke: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Outer Radius (px)', 'blockenberg'),
                            value: a.outerRadius,
                            min: 0, max: 80,
                            onChange: function (v) { set({ outerRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Screen Radius (px)', 'blockenberg'),
                            value: a.screenRadius,
                            min: 0, max: 24,
                            onChange: function (v) { set({ screenRadius: v }); }
                        })
                    ),

                    /* Screenshot */
                    el(PanelBody, { title: __('Screenshot / Image', 'blockenberg'), initialOpen: true },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) { set({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); },
                                allowedTypes: ['image'],
                                value: a.imageId,
                                render: function (ref) {
                                    return el(Button, {
                                        onClick: ref.open,
                                        variant: a.imageUrl ? 'secondary' : 'primary',
                                        style: { marginBottom: '8px' }
                                    }, a.imageUrl ? __('Replace Screenshot', 'blockenberg') : __('Choose Screenshot', 'blockenberg'));
                                }
                            })
                        ),
                        a.imageUrl ? el(Button, {
                            variant: 'tertiary',
                            isDestructive: true,
                            onClick: function () { set({ imageUrl: '', imageId: 0, imageAlt: '' }); }
                        }, __('Remove Screenshot', 'blockenberg')) : null
                    ),

                    /* Tilt & Shadow */
                    el(PanelBody, { title: __('3D Tilt & Shadow', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Tilt Y (rotateX °)', 'blockenberg'),
                            value: a.tiltX,
                            min: -30, max: 30,
                            onChange: function (v) { set({ tiltX: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Tilt X (rotateY °)', 'blockenberg'),
                            value: a.tiltY,
                            min: -30, max: 30,
                            onChange: function (v) { set({ tiltY: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Drop Shadow', 'blockenberg'),
                            checked: a.shadow,
                            onChange: function (v) { set({ shadow: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.shadow ? el(RangeControl, {
                            label: __('Shadow Intensity (%)', 'blockenberg'),
                            value: a.shadowIntensity,
                            min: 5, max: 70,
                            onChange: function (v) { set({ shadowIntensity: v }); }
                        }) : null,
                        el(ToggleControl, {
                            label: __('Reflection', 'blockenberg'),
                            checked: a.showReflection,
                            onChange: function (v) { set({ showReflection: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Hover Lift Effect', 'blockenberg'),
                            checked: a.hoverLift,
                            onChange: function (v) { set({ hoverLift: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Animate on Scroll', 'blockenberg'),
                            checked: a.animateOnScroll,
                            onChange: function (v) { set({ animateOnScroll: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    /* Device-specific */
                    (a.deviceType === 'phone' || a.deviceType === 'tablet') ? el(PanelBody, { title: __('Phone / Tablet Details', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Notch', 'blockenberg'),
                            checked: a.showNotch,
                            onChange: function (v) { set({ showNotch: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Home Indicator', 'blockenberg'),
                            checked: a.showHomeIndicator,
                            onChange: function (v) { set({ showHomeIndicator: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ) : null,

                    a.deviceType === 'browser' ? el(PanelBody, { title: __('Browser Details', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Browser Chrome', 'blockenberg'),
                            checked: a.showBrowserChrome,
                            onChange: function (v) { set({ showBrowserChrome: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showBrowserChrome ? el(TextControl, {
                            label: __('URL Bar Text', 'blockenberg'),
                            value: a.browserUrl,
                            onChange: function (v) { set({ browserUrl: v }); }
                        }) : null
                    ) : null,

                    /* Typography */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('URL bar font size (px)', 'blockenberg'), value: a.urlBarFontSize, min: 9, max: 16, onChange: function (v) { set({ urlBarFontSize: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                /* Canvas */
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el(DevicePreview, { a: a })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkdv-wrap' });

            return el('div', Object.assign({}, blockProps, {
                'data-device':        a.deviceType,
                'data-frame-color':   a.frameColor,
                'data-frame-custom':  a.frameColorCustom,
                'data-max-width':     a.maxWidth,
                'data-scale':         a.scale,
                'data-tilt-x':        a.tiltX,
                'data-tilt-y':        a.tiltY,
                'data-shadow':        String(a.shadow),
                'data-shadow-int':    a.shadowIntensity,
                'data-reflection':    String(a.showReflection),
                'data-hover-lift':    String(a.hoverLift),
                'data-scroll-anim':   String(a.animateOnScroll),
                'data-frame-stroke':  a.frameStroke,
                'data-screen-radius': a.screenRadius,
                'data-outer-radius':  a.outerRadius,
                'data-notch':         String(a.showNotch),
                'data-home-ind':      String(a.showHomeIndicator),
                'data-browser-chrome':String(a.showBrowserChrome),
                'data-browser-url':   a.browserUrl,
                'data-img-url':       a.imageUrl,
                'data-img-alt':       a.imageAlt,
                'data-align':         props.attributes.align || 'center',
            }));
        }
    });
}() );
