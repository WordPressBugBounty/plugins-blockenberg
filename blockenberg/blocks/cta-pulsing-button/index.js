( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var useState          = wp.element.useState;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var RichText          = wp.blockEditor.RichText;
    var PanelBody         = wp.components.PanelBody;
    var ColorPicker       = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;
    var Button            = wp.components.Button;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Notice            = wp.components.Notice;

    var _pbTC, _pbTV;
    function _tc() { return _pbTC || (_pbTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _pbTV || (_pbTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    // ── Color swatch control ────────────────────────────────────────────────────
    function makeColorControl(openKey, setOpenKey) {
        return function renderColorControl(key, label, value, onChange) {
            var isOpen = openKey === key;
            return el('div', {
                key: key,
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' }
            },
                el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
                el('div', { style: { position: 'relative', flexShrink: 0 } },
                    el('button', {
                        type: 'button',
                        title: value || 'none',
                        onClick: function () { setOpenKey(isOpen ? null : key); },
                        style: {
                            width: '28px', height: '28px', borderRadius: '4px',
                            border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                            cursor: 'pointer', padding: 0, display: 'block',
                            background: value || '#ffffff', flexShrink: 0
                        }
                    }),
                    isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                        el('div', { style: { padding: '8px' }, onMouseDown: function (e) { e.stopPropagation(); } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                                el('strong', { style: { fontSize: '12px' } }, label),
                                el(Button, { icon: 'no-alt', isSmall: true, onClick: function () { setOpenKey(null); } })
                            ),
                            el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                        )
                    )
                )
            );
        };
    }

    // ── Section sub-label ───────────────────────────────────────────────────────
    function sectionLabel(text) {
        return el('p', {
            style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '.5px' }
        }, text);
    }

    // ── Icon SVG paths ──────────────────────────────────────────────────────────
    var ICON_PATHS = {
        'arrow-right': 'M5 12h14M12 5l7 7-7 7',
        'chevron':     'M9 18l6-6-6-6',
        'play':        'M5 3l14 9-14 9V3z',
        'star':        'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        'fire':        'M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z',
        'external':    'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3'
    };

    function buildIconSvg(a, size) {
        var s    = (size || a.iconSize) + 'px';
        var path = ICON_PATHS[a.iconType] || ICON_PATHS['arrow-right'];
        var isPlay = a.iconType === 'play';
        return el('svg', {
            viewBox:    '0 0 24 24',
            width:      s,
            height:     s,
            fill:       isPlay ? a.iconColor : 'none',
            stroke:     isPlay ? 'none' : a.iconColor,
            strokeWidth: '2',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            style:      { display: 'block', flexShrink: 0, transition: 'transform 0.22s' },
            xmlns:      'http://www.w3.org/2000/svg',
            'aria-hidden': 'true'
        },
            el('path', { d: path })
        );
    }

    // ── Button inline style ─────────────────────────────────────────────────────
    function buildButtonStyle(a) {
        var isOutline  = a.buttonStyle === 'outline' || a.buttonStyle === 'outline-pill';
        var isPill     = a.buttonStyle === 'pill' || a.buttonStyle === 'outline-pill';
        var isGradient = a.buttonStyle === 'gradient';
        var isGhost    = a.buttonStyle === 'ghost';
        var radius     = isPill ? '9999px' : a.buttonBorderRadius + 'px';

        var bg, color, border;
        if (isGhost) {
            bg     = 'rgba(255,255,255,0.15)';
            color  = a.buttonTextColor;
            border = '2px solid rgba(255,255,255,0.35)';
        } else if (isGradient) {
            bg     = 'linear-gradient(' + a.gradientAngle + 'deg, ' + a.gradientFrom + ', ' + a.gradientTo + ')';
            color  = a.buttonTextColor;
            border = 'none';
        } else if (isOutline) {
            bg     = 'transparent';
            color  = a.buttonBorderColor;
            border = a.buttonBorderWidth + 'px solid ' + a.buttonBorderColor;
        } else {
            bg     = a.buttonBg;
            color  = a.buttonTextColor;
            border = a.buttonBorderWidth + 'px solid ' + a.buttonBg;
        }

        var shadow = a.showButtonShadow
            ? a.buttonShadowH + 'px ' + a.buttonShadowV + 'px ' + a.buttonShadowBlur + 'px ' + a.buttonShadowSpread + 'px ' + a.buttonShadowColor
            : 'none';

        return {
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            Math.round(a.buttonFontSize * 0.45) + 'px',
            padding:        a.buttonPaddingV + 'px ' + a.buttonPaddingH + 'px',
            background:     bg,
            color:          color,
            border:         border,
            borderRadius:   radius,
            lineHeight:     '1.2',
            cursor:         'pointer',
            boxShadow:      shadow,
            textDecoration: 'none',
            fontFamily:     'inherit',
            whiteSpace:     'nowrap',
            position:       'relative',
            userSelect:     'none'
        };
    }

    // ── Pulse wrapper style (CSS vars for animation) ────────────────────────────
    function buildPulseWrapStyle(a) {
        return Object.assign({
            display:          'inline-block',
            position:         'relative',
            verticalAlign:    'top',
            '--bkbg-pb-pulse-color':  a.pulseColor,
            '--bkbg-pb-pulse-speed':  a.pulseSpeed + 'ms',
            '--bkbg-pb-pulse-scale':  a.pulseScale,
            '--bkbg-pb-border-radius': a.buttonBorderRadius + 'px',
            '--bkbg-pb-btn-fs': a.buttonFontSize + 'px',
            '--bkbg-pb-btn-fw': a.buttonFontWeight,
            '--bkbg-pb-btn-ls': a.buttonLetterSpacing + 'px',
            '--bkbg-pb-btn-tt': a.buttonTextTransform,
            '--bkbg-pb-sub-fs': a.subtextSize + 'px',
        }, _tv(a.typoButton, '--bkbg-pb-btn-'), _tv(a.typoSubtext, '--bkbg-pb-sub-'));
    }

    // ────────────────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/cta-pulsing-button', {
        title:    __('CTA Pulsing Button', 'blockenberg'),
        icon:     'button',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a             = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey      = openColorKeyState[0];
            var setOpenColorKey   = openColorKeyState[1];
            var renderColorControl = makeColorControl(openColorKey, setOpenColorKey);

            // ── Select options ─────────────────────────────────────────────────
            var buttonStyleOptions = [
                { label: __('Solid',             'blockenberg'), value: 'solid'       },
                { label: __('Outline',           'blockenberg'), value: 'outline'     },
                { label: __('Pill (solid)',       'blockenberg'), value: 'pill'        },
                { label: __('Pill (outline)',     'blockenberg'), value: 'outline-pill'},
                { label: __('Gradient',          'blockenberg'), value: 'gradient'    },
                { label: __('Ghost (glass)',      'blockenberg'), value: 'ghost'       }
            ];

            var buttonSizeOptions = [
                { label: __('Small',       'blockenberg'), value: 'sm' },
                { label: __('Medium',      'blockenberg'), value: 'md' },
                { label: __('Large',       'blockenberg'), value: 'lg' },
                { label: __('Extra Large', 'blockenberg'), value: 'xl' }
            ];

            var alignOptions = [
                { label: __('Left',   'blockenberg'), value: 'left'   },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right',  'blockenberg'), value: 'right'  }
            ];

            var fontWeightOptions = [
                { label: '300 — Light',     value: 300 },
                { label: '400 — Regular',   value: 400 },
                { label: '500 — Medium',    value: 500 },
                { label: '600 — Semi Bold', value: 600 },
                { label: '700 — Bold',      value: 700 },
                { label: '800 — Extra Bold',value: 800 },
                { label: '900 — Black',     value: 900 }
            ];

            var textTransformOptions = [
                { label: __('None',       'blockenberg'), value: 'none'      },
                { label: __('Uppercase',  'blockenberg'), value: 'uppercase' },
                { label: __('Capitalize', 'blockenberg'), value: 'capitalize'},
                { label: __('Lowercase',  'blockenberg'), value: 'lowercase' }
            ];

            var iconTypeOptions = [
                { label: __('Arrow Right',    'blockenberg'), value: 'arrow-right' },
                { label: __('Chevron Right',  'blockenberg'), value: 'chevron'     },
                { label: __('Play triangle',  'blockenberg'), value: 'play'        },
                { label: __('Star',           'blockenberg'), value: 'star'        },
                { label: __('Fire',           'blockenberg'), value: 'fire'        },
                { label: __('External link',  'blockenberg'), value: 'external'    }
            ];

            var iconPositionOptions = [
                { label: __('Left of text',  'blockenberg'), value: 'left'  },
                { label: __('Right of text', 'blockenberg'), value: 'right' }
            ];

            var pulseEffectOptions = [
                { label: __('None',        'blockenberg'), value: 'none'        },
                { label: __('Ring',        'blockenberg'), value: 'ring'        },
                { label: __('Double Ring', 'blockenberg'), value: 'double-ring' },
                { label: __('Ripple',      'blockenberg'), value: 'ripple'      },
                { label: __('Glow',        'blockenberg'), value: 'glow'        },
                { label: __('Wave',        'blockenberg'), value: 'wave'        },
                { label: __('Breath',      'blockenberg'), value: 'breath'      },
                { label: __('Neon',        'blockenberg'), value: 'neon'        },
                { label: __('Heartbeat',   'blockenberg'), value: 'heartbeat'   },
                { label: __('Float',       'blockenberg'), value: 'float'       }
            ];

            var pulseRingsOptions = [
                { label: __('Single ring',  'blockenberg'), value: 'single' },
                { label: __('Double rings', 'blockenberg'), value: 'double' }
            ];

            // Size preset
            function applySize(v) {
                var presets = {
                    sm: { buttonSize: 'sm', buttonFontSize: 13, buttonPaddingV: 10, buttonPaddingH: 22 },
                    md: { buttonSize: 'md', buttonFontSize: 17, buttonPaddingV: 16, buttonPaddingH: 36 },
                    lg: { buttonSize: 'lg', buttonFontSize: 20, buttonPaddingV: 20, buttonPaddingH: 48 },
                    xl: { buttonSize: 'xl', buttonFontSize: 24, buttonPaddingV: 24, buttonPaddingH: 60 }
                };
                setAttributes(presets[v] || { buttonSize: v });
            }

            var isOutline  = a.buttonStyle === 'outline' || a.buttonStyle === 'outline-pill';
            var isGradient = a.buttonStyle === 'gradient';
            var isGhost    = a.buttonStyle === 'ghost';
            var hasPulse   = a.pulseEffect !== 'none';

            var btnStyle      = buildButtonStyle(a);
            var pulseWrapStyle = buildPulseWrapStyle(a);
            var iconEl         = a.showIcon ? buildIconSvg(a) : null;

            // ── Pulse class for editor preview ─────────────────────────────────
            var pulseClass = 'bkbg-pb-pulse-wrap';
            if (hasPulse) {
                pulseClass += ' bkbg-pb-pulse--' + a.pulseEffect;
                if (a.pulseEffect === 'ring' && a.pulseRings === 'double') {
                    pulseClass += ' bkbg-pb-pulse--double-rings';
                }
            }

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Button & Link ─────────────────────────────────────────────
                el(PanelBody, { title: __('Button & Link', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label:    __('URL', 'blockenberg'),
                        value:    a.url,
                        type:     'url',
                        placeholder: 'https://',
                        onChange: function (v) { setAttributes({ url: v }); }
                    }),
                    el(ToggleControl, {
                        label:    __('Open in new tab', 'blockenberg'),
                        checked:  a.urlNewTab,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ urlNewTab: v }); }
                    }),
                    el(ToggleControl, {
                        label:    __('Add rel="nofollow"', 'blockenberg'),
                        checked:  a.urlNoFollow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ urlNoFollow: v }); }
                    }),
                    el('hr', {}),
                    el(SelectControl, {
                        label:    __('Alignment', 'blockenberg'),
                        value:    a.alignment,
                        options:  alignOptions,
                        onChange: function (v) { setAttributes({ alignment: v }); }
                    })
                ),

                // ── Button Style ──────────────────────────────────────────────
                el(PanelBody, { title: __('Button Style', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label:    __('Style', 'blockenberg'),
                        value:    a.buttonStyle,
                        options:  buttonStyleOptions,
                        onChange: function (v) { setAttributes({ buttonStyle: v }); }
                    }),
                    el(SelectControl, {
                        label:    __('Size Preset', 'blockenberg'),
                        value:    a.buttonSize,
                        options:  buttonSizeOptions,
                        onChange: applySize
                    }),
                    el('hr', {}),
                    sectionLabel(__('Typography', 'blockenberg')),
                    el(SelectControl, {
                        label:    __('Text Transform', 'blockenberg'),
                        value:    a.buttonTextTransform,
                        options:  textTransformOptions,
                        onChange: function (v) { setAttributes({ buttonTextTransform: v }); }
                    }),
                    el('hr', {}),
                    sectionLabel(__('Spacing & Shape', 'blockenberg')),
                    el(RangeControl, {
                        label:    __('Padding Vertical (px)', 'blockenberg'),
                        value:    a.buttonPaddingV, min: 4, max: 48,
                        onChange: function (v) { setAttributes({ buttonPaddingV: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Padding Horizontal (px)', 'blockenberg'),
                        value:    a.buttonPaddingH, min: 8, max: 100,
                        onChange: function (v) { setAttributes({ buttonPaddingH: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Border Radius (px)', 'blockenberg'),
                        help:     __('Pill styles always use full rounding.', 'blockenberg'),
                        value:    a.buttonBorderRadius, min: 0, max: 60,
                        onChange: function (v) { setAttributes({ buttonBorderRadius: v }); }
                    })
                ),

                // ── Button Colors ─────────────────────────────────────────────
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Button Text', 'blockenberg'), value: a.typoButton, onChange: function (v) { setAttributes({ typoButton: v }); } }),
                    _tc() && el(_tc(), { label: __('Subtext', 'blockenberg'), value: a.typoSubtext, onChange: function (v) { setAttributes({ typoSubtext: v }); } }),
                    el(RangeControl, {
                        label:    __('Badge Font Size (px)', 'blockenberg'),
                        value:    a.badgeFontSize, min: 8, max: 18,
                        onChange: function (v) { setAttributes({ badgeFontSize: v }); }
                    }),
                    a.showSubtext && el(Fragment, {},
                        renderColorControl('subtextColor', __('Subtext Color', 'blockenberg'), a.subtextColor, function (c) { setAttributes({ subtextColor: c }); }),
                        el(RangeControl, {
                            label:    __('Subtext Spacing Above (px)', 'blockenberg'),
                            value:    a.subtextSpacing, min: 4, max: 40,
                            onChange: function (v) { setAttributes({ subtextSpacing: v }); }
                        })
                    )
                ),
el(PanelBody, { title: __('Button Colors', 'blockenberg'), initialOpen: false },
                    isGradient
                        ? el(Fragment, {},
                            sectionLabel(__('Gradient', 'blockenberg')),
                            renderColorControl('gradientFrom', __('Gradient From', 'blockenberg'), a.gradientFrom, function (c) { setAttributes({ gradientFrom: c }); }),
                            renderColorControl('gradientTo',   __('Gradient To',   'blockenberg'), a.gradientTo,   function (c) { setAttributes({ gradientTo:   c }); }),
                            el(RangeControl, {
                                label:    __('Gradient Angle (deg)', 'blockenberg'),
                                value:    a.gradientAngle, min: 0, max: 360,
                                onChange: function (v) { setAttributes({ gradientAngle: v }); }
                            }),
                            el('hr', {}),
                            renderColorControl('buttonTextColor', __('Text Color', 'blockenberg'), a.buttonTextColor, function (c) { setAttributes({ buttonTextColor: c }); }),
                            renderColorControl('buttonTextColorHover', __('Text Color (hover)', 'blockenberg'), a.buttonTextColorHover, function (c) { setAttributes({ buttonTextColorHover: c }); })
                          )
                        : isOutline
                            ? el(Fragment, {},
                                renderColorControl('buttonBorderColor',     __('Border & Text Color',      'blockenberg'), a.buttonBorderColor,     function (c) { setAttributes({ buttonBorderColor:     c }); }),
                                renderColorControl('buttonBgHover',         __('Background (hover)',        'blockenberg'), a.buttonBgHover,         function (c) { setAttributes({ buttonBgHover:         c }); }),
                                renderColorControl('buttonTextColorHover',  __('Text Color (hover)',        'blockenberg'), a.buttonTextColorHover,  function (c) { setAttributes({ buttonTextColorHover:  c }); }),
                                el(RangeControl, {
                                    label:    __('Border Width (px)', 'blockenberg'),
                                    value:    a.buttonBorderWidth, min: 1, max: 8,
                                    onChange: function (v) { setAttributes({ buttonBorderWidth: v }); }
                                })
                              )
                            : isGhost
                                ? el(Fragment, {},
                                    renderColorControl('buttonTextColor',      __('Text Color',               'blockenberg'), a.buttonTextColor,      function (c) { setAttributes({ buttonTextColor:      c }); }),
                                    renderColorControl('buttonTextColorHover', __('Text Color (hover)',        'blockenberg'), a.buttonTextColorHover, function (c) { setAttributes({ buttonTextColorHover: c }); })
                                  )
                                : el(Fragment, {},
                                    renderColorControl('buttonBg',             __('Background',               'blockenberg'), a.buttonBg,             function (c) { setAttributes({ buttonBg:             c }); }),
                                    renderColorControl('buttonBgHover',        __('Background (hover)',        'blockenberg'), a.buttonBgHover,        function (c) { setAttributes({ buttonBgHover:        c }); }),
                                    renderColorControl('buttonTextColor',      __('Text Color',               'blockenberg'), a.buttonTextColor,      function (c) { setAttributes({ buttonTextColor:      c }); }),
                                    renderColorControl('buttonTextColorHover', __('Text Color (hover)',        'blockenberg'), a.buttonTextColorHover, function (c) { setAttributes({ buttonTextColorHover: c }); })
                                  )
                ),

                // ── Button Shadow ─────────────────────────────────────────────
                el(PanelBody, { title: __('Button Shadow', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Enable Shadow', 'blockenberg'),
                        checked:  a.showButtonShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showButtonShadow: v }); }
                    }),
                    a.showButtonShadow && el(Fragment, {},
                        renderColorControl('buttonShadowColor', __('Shadow Color', 'blockenberg'), a.buttonShadowColor, function (c) { setAttributes({ buttonShadowColor: c }); }),
                        el(RangeControl, { label: __('Horizontal (px)', 'blockenberg'), value: a.buttonShadowH,      min: -30, max: 30, onChange: function (v) { setAttributes({ buttonShadowH:      v }); } }),
                        el(RangeControl, { label: __('Vertical (px)',   'blockenberg'), value: a.buttonShadowV,      min: -20, max: 50, onChange: function (v) { setAttributes({ buttonShadowV:      v }); } }),
                        el(RangeControl, { label: __('Blur (px)',       'blockenberg'), value: a.buttonShadowBlur,   min: 0,   max: 80, onChange: function (v) { setAttributes({ buttonShadowBlur:   v }); } }),
                        el(RangeControl, { label: __('Spread (px)',     'blockenberg'), value: a.buttonShadowSpread, min: -10, max: 30, onChange: function (v) { setAttributes({ buttonShadowSpread: v }); } })
                    )
                ),

                // ── Pulse Animation ───────────────────────────────────────────
                el(PanelBody, { title: __('Pulse Animation', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label:    __('Effect', 'blockenberg'),
                        value:    a.pulseEffect,
                        options:  pulseEffectOptions,
                        onChange: function (v) { setAttributes({ pulseEffect: v }); }
                    }),
                    a.pulseEffect !== 'none' && el(Fragment, {},
                        renderColorControl('pulseColor', __('Pulse Color', 'blockenberg'), a.pulseColor, function (c) { setAttributes({ pulseColor: c }); }),
                        el(RangeControl, {
                            label:    __('Speed (ms)', 'blockenberg'),
                            help:     __('Lower = faster pulse.', 'blockenberg'),
                            value:    a.pulseSpeed, min: 600, max: 4000, step: 100,
                            onChange: function (v) { setAttributes({ pulseSpeed: v }); }
                        }),
                        (a.pulseEffect === 'ring' || a.pulseEffect === 'ripple') && el(RangeControl, {
                            label:    __('Ring Scale', 'blockenberg'),
                            help:     __('How far the rings expand (1.0 = no expansion).', 'blockenberg'),
                            value:    a.pulseScale, min: 1.0, max: 3.0, step: 0.05,
                            onChange: function (v) { setAttributes({ pulseScale: v }); }
                        }),
                        a.pulseEffect === 'ring' && el(SelectControl, {
                            label:    __('Ring Count', 'blockenberg'),
                            value:    a.pulseRings,
                            options:  pulseRingsOptions,
                            onChange: function (v) { setAttributes({ pulseRings: v }); }
                        })
                    )
                ),

                // ── Icon ──────────────────────────────────────────────────────
                el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Show Icon', 'blockenberg'),
                        checked:  a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    a.showIcon && el(Fragment, {},
                        el(SelectControl, {
                            label:    __('Icon Style', 'blockenberg'),
                            value:    a.iconType,
                            options:  iconTypeOptions,
                            onChange: function (v) { setAttributes({ iconType: v }); }
                        }),
                        el(SelectControl, {
                            label:    __('Position', 'blockenberg'),
                            value:    a.iconPosition,
                            options:  iconPositionOptions,
                            onChange: function (v) { setAttributes({ iconPosition: v }); }
                        }),
                        el(RangeControl, {
                            label:    __('Size (px)', 'blockenberg'),
                            value:    a.iconSize, min: 10, max: 40,
                            onChange: function (v) { setAttributes({ iconSize: v }); }
                        }),
                        renderColorControl('iconColor', __('Color', 'blockenberg'), a.iconColor, function (c) { setAttributes({ iconColor: c }); }),
                        el(ToggleControl, {
                            label:    __('Nudge icon on hover', 'blockenberg'),
                            checked:  a.iconMoveOnHover,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ iconMoveOnHover: v }); }
                        })
                    )
                ),

                // ── Badge ─────────────────────────────────────────────────────
                el(PanelBody, { title: __('Badge', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Show Badge', 'blockenberg'),
                        help:     __('Small tag attached to the top-right corner of the button.', 'blockenberg'),
                        checked:  a.showBadge,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showBadge: v }); }
                    }),
                    a.showBadge && el(Fragment, {},
                        el(TextControl, {
                            label:    __('Badge Text', 'blockenberg'),
                            value:    a.badgeText,
                            onChange: function (v) { setAttributes({ badgeText: v }); }
                        }),
                        renderColorControl('badgeBg',    __('Badge Background', 'blockenberg'), a.badgeBg,    function (c) { setAttributes({ badgeBg:    c }); }),
                        renderColorControl('badgeColor', __('Badge Text Color', 'blockenberg'), a.badgeColor, function (c) { setAttributes({ badgeColor: c }); })
                    )
                ),

                // ── Subtext ───────────────────────────────────────────────────
                el(PanelBody, { title: __('Subtext Below Button', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Show Subtext', 'blockenberg'),
                        checked:  a.showSubtext,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSubtext: v }); }
                    }),
                    )
            );

            // ── Build badge element ────────────────────────────────────────────
            var badgeEl = a.showBadge && a.badgeText
                ? el('span', { className: 'bkbg-pb-badge', style: {
                    position:    'absolute',
                    top:         '-10px',
                    right:       '-12px',
                    background:  a.badgeBg,
                    color:       a.badgeColor,
                    fontSize:    a.badgeFontSize + 'px',
                    fontWeight:  700,
                    lineHeight:  1,
                    padding:     '3px 7px',
                    borderRadius:'10px',
                    whiteSpace:  'nowrap',
                    zIndex:      2
                  } }, a.badgeText)
                : null;

            // ── Icon element with proper flex order ───────────────────────────
            var iconLeft  = a.showIcon && a.iconPosition === 'left'  ? iconEl : null;
            var iconRight = a.showIcon && a.iconPosition === 'right' ? iconEl : null;

            // ── Editor output ─────────────────────────────────────────────────
            return el(Fragment, {},
                inspector,
                el('div', useBlockProps({ className: 'bkbg-pb-outer' }),
                    el('div', { className: 'bkbg-pb-align-wrap', style: { textAlign: a.alignment } },
                        el('div', { className: pulseClass, style: pulseWrapStyle },
                            el('button', { className: 'bkbg-pb-btn' + (a.iconMoveOnHover ? ' bkbg-pb-icon-hover' : ''), type: 'button', style: btnStyle },
                                iconLeft,
                                el(RichText, {
                                    tagName:        'span',
                                    className:      'bkbg-pb-label',
                                    value:          a.buttonText,
                                    onChange:       function (v) { setAttributes({ buttonText: v }); },
                                    allowedFormats: [],
                                    placeholder:    __('Button text…', 'blockenberg')
                                }),
                                iconRight,
                                badgeEl
                            )
                        ),
                        a.showSubtext && el(RichText, {
                            tagName:        'p',
                            className:      'bkbg-pb-subtext',
                            value:          a.subtext,
                            onChange:       function (v) { setAttributes({ subtext: v }); },
                            allowedFormats: ['core/bold', 'core/italic', 'core/link'],
                            placeholder:    __('e.g. No credit card required', 'blockenberg'),
                            style: {
                                color:      a.subtextColor,
                                marginTop:  a.subtextSpacing + 'px',
                                marginBottom: 0,
                                padding:    0,
                                textAlign:  a.alignment
                            }
                        })
                    )
                )
            );
        },

        // ── Save ────────────────────────────────────────────────────────────────
        save: function (props) {
            var a               = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;
            var btnStyle        = buildButtonStyle(a);

            var pulseWrapStyle = buildPulseWrapStyle(a);
            var pulseClass = 'bkbg-pb-pulse-wrap';
            if (a.pulseEffect !== 'none') {
                pulseClass += ' bkbg-pb-pulse--' + a.pulseEffect;
                if (a.pulseEffect === 'ring' && a.pulseRings === 'double') {
                    pulseClass += ' bkbg-pb-pulse--double-rings';
                }
            }

            // Icon
            var iconEl = null;
            if (a.showIcon) {
                iconEl = el('svg', {
                    viewBox: '0 0 24 24',
                    width:   a.iconSize + 'px',
                    height:  a.iconSize + 'px',
                    fill:    a.iconType === 'play' ? a.iconColor : 'none',
                    stroke:  a.iconType === 'play' ? 'none' : a.iconColor,
                    strokeWidth: '2',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    style:   { display: 'block', flexShrink: 0 },
                    xmlns:   'http://www.w3.org/2000/svg',
                    'aria-hidden': 'true',
                    className: 'bkbg-pb-icon'
                },
                    el('path', { d: ({ 'arrow-right': 'M5 12h14M12 5l7 7-7 7', 'chevron': 'M9 18l6-6-6-6', 'play': 'M5 3l14 9-14 9V3z', 'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'fire': 'M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z', 'external': 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3' })[a.iconType] || 'M5 12h14M12 5l7 7-7 7' })
                );
            }

            var iconLeft  = a.showIcon && a.iconPosition === 'left'  ? iconEl : null;
            var iconRight = a.showIcon && a.iconPosition === 'right' ? iconEl : null;

            // Badge
            var badgeEl = a.showBadge && a.badgeText
                ? el('span', { className: 'bkbg-pb-badge', style: {
                    position: 'absolute', top: '-10px', right: '-12px',
                    background: a.badgeBg, color: a.badgeColor,
                    fontSize: a.badgeFontSize + 'px', fontWeight: 700,
                    lineHeight: 1, padding: '3px 7px', borderRadius: '10px',
                    whiteSpace: 'nowrap', zIndex: 2
                  } }, a.badgeText)
                : null;

            // Link attrs
            var linkAttrs = {
                className: 'bkbg-pb-btn' + (a.iconMoveOnHover ? ' bkbg-pb-icon-hover' : ''),
                href:      a.url || '#',
                style:     btnStyle,
                'data-pb-bg-hover':   a.buttonBgHover,
                'data-pb-text-hover': a.buttonTextColorHover
            };
            if (a.urlNewTab)  { linkAttrs.target = '_blank'; }
            if (a.urlNoFollow){ linkAttrs.rel    = 'nofollow' + (a.urlNewTab ? ' noopener noreferrer' : ''); }
            else if (a.urlNewTab) { linkAttrs.rel = 'noopener noreferrer'; }

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-pb-outer' }),
                el('div', { className: 'bkbg-pb-align-wrap', style: { textAlign: a.alignment } },
                    el('div', { className: pulseClass, style: pulseWrapStyle },
                        el('a', linkAttrs,
                            iconLeft,
                            el(RichTextContent, { tagName: 'span', className: 'bkbg-pb-label', value: a.buttonText }),
                            iconRight,
                            badgeEl
                        )
                    ),
                    a.showSubtext && el(RichTextContent, {
                        tagName:   'p',
                        className: 'bkbg-pb-subtext',
                        value:     a.subtext,
                        style: {
                            color:       a.subtextColor,
                            marginTop:   a.subtextSpacing + 'px',
                            marginBottom: 0,
                            padding:     0,
                            textAlign:   a.alignment
                        }
                    })
                )
            );
        }
    });
}() );
