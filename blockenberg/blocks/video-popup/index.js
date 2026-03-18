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

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'buttonTypo',  attrs, '--bkvpo-bt-');
        _tvf(v, 'subtextTypo', attrs, '--bkvpo-st-');
        return v;
    }

    // ── Color swatch control (same pattern as google-map / blockquote) ──────────
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

    // ── Section sub-header ───────────────────────────────────────────────────────
    function sectionLabel(text) {
        return el('p', {
            style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '.5px' }
        }, text);
    }

    // ── Build play icon SVG element ──────────────────────────────────────────────
    function buildPlayIconEl(a) {
        var sz = a.iconSize + 'px';
        if (a.iconStyle === 'circle') {
            // Circle with play triangle inside
            return el('svg', {
                viewBox: '0 0 40 40', width: sz, height: sz,
                style: { display: 'block', flexShrink: 0 },
                xmlns: 'http://www.w3.org/2000/svg'
            },
                el('circle', { cx: '20', cy: '20', r: '19', fill: 'rgba(255,255,255,0.2)', stroke: a.iconColor, strokeWidth: '1.5' }),
                el('polygon', { points: '16,13 16,27 28,20', fill: a.iconColor })
            );
        }
        if (a.iconStyle === 'circle-filled') {
            return el('svg', {
                viewBox: '0 0 40 40', width: sz, height: sz,
                style: { display: 'block', flexShrink: 0 },
                xmlns: 'http://www.w3.org/2000/svg'
            },
                el('circle', { cx: '20', cy: '20', r: '20', fill: a.iconColor }),
                el('polygon', { points: '16,13 16,27 28,20', fill: 'currentColor' })
            );
        }
        // 'triangle' — simple play triangle
        return el('svg', {
            viewBox: '0 0 24 24', width: sz, height: sz,
            style: { display: 'block', flexShrink: 0, fill: a.iconColor },
            xmlns: 'http://www.w3.org/2000/svg'
        },
            el('path', { d: 'M8 5v14l11-7z' })
        );
    }

    // ── Compute button inline style ──────────────────────────────────────────────
    function buildButtonStyle(a) {
        var isOutline   = a.buttonStyle === 'outline' || a.buttonStyle === 'outline-pill';
        var isPill      = a.buttonStyle === 'pill' || a.buttonStyle === 'outline-pill';
        var isGradient  = a.buttonStyle === 'gradient';
        var isGhost     = a.buttonStyle === 'ghost';

        var bg, color, border;
        if (isGhost) {
            bg     = 'rgba(255,255,255,0.15)';
            color  = a.buttonTextColor;
            border = '1px solid rgba(255,255,255,0.35)';
        } else if (isGradient) {
            bg     = 'linear-gradient(' + a.gradientAngle + 'deg, ' + a.gradientFrom + ', ' + a.gradientTo + ')';
            color  = a.buttonTextColor;
            border = a.buttonBorderWidth + 'px solid transparent';
        } else if (isOutline) {
            bg     = 'transparent';
            color  = a.buttonBorderColor;
            border = a.buttonBorderWidth + 'px solid ' + a.buttonBorderColor;
        } else {
            // solid / pill
            bg     = a.buttonBg;
            color  = a.buttonTextColor;
            border = a.buttonBorderWidth + 'px solid ' + a.buttonBg;
        }

        var radius = isPill ? '9999px' : (a.buttonBorderRadius + 'px');
        var shadow = a.showButtonShadow
            ? '0 ' + a.buttonShadowV + 'px ' + a.buttonShadowBlur + 'px ' + a.buttonShadowSpread + 'px ' + a.buttonShadowColor
            : 'none';

        var style = {
            display:         'inline-flex',
            alignItems:      'center',
            justifyContent:  'center',
            gap:             Math.round(a.buttonFontSize * 0.5) + 'px',
            padding:         a.buttonPaddingV + 'px ' + a.buttonPaddingH + 'px',
            background:      bg,
            color:           color,
            border:          border,
            borderRadius:    radius,
            cursor:          'pointer',
            boxShadow:       shadow,
            transition:      'all 0.22s cubic-bezier(.4,0,.2,1)',
            whiteSpace:      'nowrap',
            userSelect:      'none'
        };

        if (isGhost) {
            style.backdropFilter       = 'blur(10px)';
            style.WebkitBackdropFilter = 'blur(10px)';
        }

        return style;
    }

    // ── Get aspect-ratio padding-bottom percentage ───────────────────────────────
    function aspectPadding(ratio) {
        var map = { '16-9': '56.25%', '4-3': '75%', '1-1': '100%', '21-9': '42.86%' };
        return map[ratio] || '56.25%';
    }

    // ────────────────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/video-popup', {
        title:    __('Video Popup Button', 'blockenberg'),
        icon:     'controls-play',
        category: 'bkbg-media',

        edit: function (props) {
            var a             = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey      = openColorKeyState[0];
            var setOpenColorKey   = openColorKeyState[1];
            var renderColorControl = makeColorControl(openColorKey, setOpenColorKey);

            // Button style options
            var buttonStyleOptions = [
                { label: __('Solid',       'blockenberg'), value: 'solid' },
                { label: __('Outline',     'blockenberg'), value: 'outline' },
                { label: __('Pill (solid)','blockenberg'), value: 'pill' },
                { label: __('Pill (outline)','blockenberg'), value: 'outline-pill' },
                { label: __('Gradient',    'blockenberg'), value: 'gradient' },
                { label: __('Ghost (glass)','blockenberg'), value: 'ghost' }
            ];

            var buttonSizeOptions = [
                { label: __('Small',       'blockenberg'), value: 'sm' },
                { label: __('Medium',      'blockenberg'), value: 'md' },
                { label: __('Large',       'blockenberg'), value: 'lg' },
                { label: __('Extra Large', 'blockenberg'), value: 'xl' }
            ];

            var buttonAlignOptions = [
                { label: __('Left',   'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right',  'blockenberg'), value: 'right' }
            ];

            var fontWeightOptions = [
                { label: '300 — Light',     value: 300 },
                { label: '400 — Regular',   value: 400 },
                { label: '500 — Medium',    value: 500 },
                { label: '600 — Semi Bold', value: 600 },
                { label: '700 — Bold',      value: 700 },
                { label: '800 — ExtraBold', value: 800 },
                { label: '900 — Black',     value: 900 }
            ];

            var textTransformOptions = [
                { label: __('None',       'blockenberg'), value: 'none' },
                { label: __('Uppercase',  'blockenberg'), value: 'uppercase' },
                { label: __('Capitalize', 'blockenberg'), value: 'capitalize' },
                { label: __('Lowercase',  'blockenberg'), value: 'lowercase' }
            ];

            var iconStyleOptions = [
                { label: __('Circle outline + play', 'blockenberg'), value: 'circle' },
                { label: __('Circle filled + play',  'blockenberg'), value: 'circle-filled' },
                { label: __('Triangle only',         'blockenberg'), value: 'triangle' }
            ];

            var iconPositionOptions = [
                { label: __('Left of text',  'blockenberg'), value: 'left' },
                { label: __('Right of text', 'blockenberg'), value: 'right' }
            ];

            var aspectRatioOptions = [
                { label: __('16:9 — Widescreen (default)', 'blockenberg'), value: '16-9' },
                { label: __('21:9 — Ultrawide',            'blockenberg'), value: '21-9' },
                { label: __('4:3  — Classic',              'blockenberg'), value: '4-3' },
                { label: __('1:1  — Square',               'blockenberg'), value: '1-1' }
            ];

            // Size preset handler
            function applySize(v) {
                var presets = {
                    sm: { buttonSize: 'sm', buttonFontSize: 13, buttonPaddingV: 8,  buttonPaddingH: 18 },
                    md: { buttonSize: 'md', buttonFontSize: 15, buttonPaddingV: 13, buttonPaddingH: 26 },
                    lg: { buttonSize: 'lg', buttonFontSize: 18, buttonPaddingV: 16, buttonPaddingH: 32 },
                    xl: { buttonSize: 'xl', buttonFontSize: 22, buttonPaddingV: 20, buttonPaddingH: 44 }
                };
                setAttributes(presets[v] || { buttonSize: v });
            }

            var isOutline  = a.buttonStyle === 'outline' || a.buttonStyle === 'outline-pill';
            var isGradient = a.buttonStyle === 'gradient';
            var isGhost    = a.buttonStyle === 'ghost';

            var btnStyle   = buildButtonStyle(a);
            var iconEl     = a.showIcon ? buildPlayIconEl(a) : null;

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Video Source ──────────────────────────────────────────────
                el(PanelBody, { title: __('Video Source', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label:    __('Video URL', 'blockenberg'),
                        help:     __('YouTube, Vimeo, or any direct video/embed URL.', 'blockenberg'),
                        value:    a.videoUrl,
                        onChange: function (v) { setAttributes({ videoUrl: v }); }
                    }),
                    a.videoUrl && el(Notice, { status: 'info', isDismissible: false },
                        __('Preview is shown in the editor. Popup opens on the frontend.', 'blockenberg')
                    ),
                    el('hr', {}),
                    el(ToggleControl, {
                        label:    __('Autoplay when popup opens', 'blockenberg'),
                        checked:  a.autoplay,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ autoplay: v }); }
                    }),
                    el(ToggleControl, {
                        label:    __('Muted', 'blockenberg'),
                        help:     __('Start muted (needed for autoplay in some browsers).', 'blockenberg'),
                        checked:  a.muted,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ muted: v }); }
                    })
                ),

                // ── Button Style ──────────────────────────────────────────────
                el(PanelBody, { title: __('Button Style', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label:    __('Button Style', 'blockenberg'),
                        value:    a.buttonStyle,
                        options:  buttonStyleOptions,
                        onChange: function (v) { setAttributes({ buttonStyle: v }); }
                    }),
                    isGhost && el(Notice, { status: 'warning', isDismissible: false, style: { margin: '0 0 8px' } },
                        __('Ghost style looks best over dark/image backgrounds.', 'blockenberg')
                    ),
                    el(SelectControl, {
                        label:    __('Size Preset', 'blockenberg'),
                        value:    a.buttonSize,
                        options:  buttonSizeOptions,
                        onChange: applySize
                    }),
                    el(SelectControl, {
                        label:    __('Alignment', 'blockenberg'),
                        value:    a.buttonAlign,
                        options:  buttonAlignOptions,
                        onChange: function (v) { setAttributes({ buttonAlign: v }); }
                    }),
                    el('hr', {}),
                    sectionLabel(__('Spacing & Shape', 'blockenberg')),
                    el(RangeControl, {
                        label:    __('Padding Vertical (px)', 'blockenberg'),
                        value:    a.buttonPaddingV, min: 4, max: 40,
                        onChange: function (v) { setAttributes({ buttonPaddingV: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Padding Horizontal (px)', 'blockenberg'),
                        value:    a.buttonPaddingH, min: 8, max: 80,
                        onChange: function (v) { setAttributes({ buttonPaddingH: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Border Radius (px)', 'blockenberg'),
                        help:     __('Ignored for Pill styles (always fully rounded).', 'blockenberg'),
                        value:    a.buttonBorderRadius, min: 0, max: 40,
                        onChange: function (v) { setAttributes({ buttonBorderRadius: v }); }
                    })
                ),

                // ── Button Colors ─────────────────────────────────────────────
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl(__('Button Text', 'blockenberg'), 'buttonTypo', a, setAttributes),
                    a.showSubtext && el(Fragment, {},
                                            getTypoControl(__('Subtext', 'blockenberg'), 'subtextTypo', a, setAttributes),
                                            renderColorControl('subtextColor', __('Text Color', 'blockenberg'), a.subtextColor, function (c) { setAttributes({ subtextColor: c }); }),
                                            el(RangeControl, {
                                                label:    __('Spacing Above (px)', 'blockenberg'),
                                                value:    a.subtextSpacing, min: 4, max: 32,
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
                            renderColorControl('buttonTextColor', __('Text Color', 'blockenberg'), a.buttonTextColor, function (c) { setAttributes({ buttonTextColor: c }); })
                        )
                        : el(Fragment, {},
                            isOutline
                                ? el(Fragment, {},
                                    renderColorControl('buttonBorderColor', __('Border & Text Color', 'blockenberg'), a.buttonBorderColor, function (c) { setAttributes({ buttonBorderColor: c }); }),
                                    el(RangeControl, {
                                        label:    __('Border Width (px)', 'blockenberg'),
                                        value:    a.buttonBorderWidth, min: 1, max: 8,
                                        onChange: function (v) { setAttributes({ buttonBorderWidth: v }); }
                                    })
                                )
                                : isGhost
                                    ? el(Fragment, {},
                                        renderColorControl('buttonTextColor', __('Text Color', 'blockenberg'), a.buttonTextColor, function (c) { setAttributes({ buttonTextColor: c }); })
                                    )
                                    : el(Fragment, {},
                                        renderColorControl('buttonBg',        __('Background',         'blockenberg'), a.buttonBg,        function (c) { setAttributes({ buttonBg:        c }); }),
                                        renderColorControl('buttonBgHover',   __('Background (hover)', 'blockenberg'), a.buttonBgHover,   function (c) { setAttributes({ buttonBgHover:   c }); }),
                                        renderColorControl('buttonTextColor', __('Text Color',         'blockenberg'), a.buttonTextColor, function (c) { setAttributes({ buttonTextColor: c }); }),
                                        renderColorControl('buttonTextColorHover', __('Text Color (hover)', 'blockenberg'), a.buttonTextColorHover, function (c) { setAttributes({ buttonTextColorHover: c }); })
                                    )
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
                        el(RangeControl, { label: __('Vertical (px)', 'blockenberg'), value: a.buttonShadowV,      min: -20, max: 40, onChange: function (v) { setAttributes({ buttonShadowV:      v }); } }),
                        el(RangeControl, { label: __('Blur (px)',     'blockenberg'), value: a.buttonShadowBlur,   min: 0,   max: 80, onChange: function (v) { setAttributes({ buttonShadowBlur:   v }); } }),
                        el(RangeControl, { label: __('Spread (px)',   'blockenberg'), value: a.buttonShadowSpread, min: -10, max: 30, onChange: function (v) { setAttributes({ buttonShadowSpread: v }); } })
                    )
                ),

                // ── Play Icon ─────────────────────────────────────────────────
                el(PanelBody, { title: __('Play Icon', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Show Play Icon', 'blockenberg'),
                        checked:  a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    a.showIcon && el(Fragment, {},
                        el(SelectControl, {
                            label:    __('Icon Style', 'blockenberg'),
                            value:    a.iconStyle,
                            options:  iconStyleOptions,
                            onChange: function (v) { setAttributes({ iconStyle: v }); }
                        }),
                        el(SelectControl, {
                            label:    __('Position', 'blockenberg'),
                            value:    a.iconPosition,
                            options:  iconPositionOptions,
                            onChange: function (v) { setAttributes({ iconPosition: v }); }
                        }),
                        el(RangeControl, {
                            label:    __('Icon Size (px)', 'blockenberg'),
                            value:    a.iconSize, min: 12, max: 48,
                            onChange: function (v) { setAttributes({ iconSize: v }); }
                        }),
                        renderColorControl('iconColor', __('Icon Color', 'blockenberg'), a.iconColor, function (c) { setAttributes({ iconColor: c }); })
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
                    ),

                // ── Popup Settings ────────────────────────────────────────────
                el(PanelBody, { title: __('Popup Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label:    __('Aspect Ratio', 'blockenberg'),
                        value:    a.aspectRatio,
                        options:  aspectRatioOptions,
                        onChange: function (v) { setAttributes({ aspectRatio: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Max Width (px)', 'blockenberg'),
                        value:    a.popupMaxWidth, min: 320, max: 1600, step: 10,
                        onChange: function (v) { setAttributes({ popupMaxWidth: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Content Border Radius (px)', 'blockenberg'),
                        value:    a.popupBorderRadius, min: 0, max: 32,
                        onChange: function (v) { setAttributes({ popupBorderRadius: v }); }
                    }),
                    el('hr', {}),
                    sectionLabel(__('Overlay', 'blockenberg')),
                    renderColorControl('overlayColor', __('Overlay Color', 'blockenberg'), a.overlayColor, function (c) { setAttributes({ overlayColor: c }); }),
                    el(ToggleControl, {
                        label:    __('Backdrop Blur', 'blockenberg'),
                        checked:  a.overlayBlur,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ overlayBlur: v }); }
                    }),
                    a.overlayBlur && el(RangeControl, {
                        label:    __('Blur Amount (px)', 'blockenberg'),
                        value:    a.overlayBlurAmount, min: 2, max: 24,
                        onChange: function (v) { setAttributes({ overlayBlurAmount: v }); }
                    }),
                    el('hr', {}),
                    sectionLabel(__('Close Button', 'blockenberg')),
                    renderColorControl('closeButtonColor', __('Close Icon Color', 'blockenberg'), a.closeButtonColor, function (c) { setAttributes({ closeButtonColor: c }); }),
                    el(ToggleControl, {
                        label:    __('Close on overlay click', 'blockenberg'),
                        checked:  a.closeOnOverlay,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ closeOnOverlay: v }); }
                    })
                )
            );

            // ── Editor output ─────────────────────────────────────────────────
            return el(Fragment, {},
                inspector,
                el('div', useBlockProps((function () {
                    var s = getTypoCssVars(a);
                    return { style: s, className: 'bkbg-vp-outer' };
                })()),
                    el('div', { className: 'bkbg-vp-btn-outer', style: { textAlign: a.buttonAlign } },
                        el('div', { className: 'bkbg-vp-btn-wrap' },
                            el('button', { className: 'bkbg-vp-btn', type: 'button', style: btnStyle },
                                a.showIcon && a.iconPosition === 'left' && iconEl,
                                el(RichText, {
                                    tagName:        'span',
                                    className:      'bkbg-vp-btn-label',
                                    value:          a.buttonText,
                                    onChange:       function (v) { setAttributes({ buttonText: v }); },
                                    allowedFormats: [],
                                    placeholder:    __('Button label…', 'blockenberg')
                                }),
                                a.showIcon && a.iconPosition === 'right' && iconEl
                            ),
                            a.showSubtext && el(RichText, {
                                tagName:        'p',
                                className:      'bkbg-vp-subtext',
                                value:          a.subtext,
                                onChange:       function (v) { setAttributes({ subtext: v }); },
                                allowedFormats: ['core/bold', 'core/italic', 'core/link'],
                                placeholder:    __('e.g. No credit card required', 'blockenberg'),
                                style: {
                                    color:      a.subtextColor,
                                    marginTop:  a.subtextSpacing + 'px',
                                    marginBottom: 0,
                                    padding: 0,
                                    textAlign: a.buttonAlign
                                }
                            })
                        )
                    )
                )
            );
        },

        // ── Save ────────────────────────────────────────────────────────────────
        save: function (props) {
            var a               = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;
            var btnStyle        = buildButtonStyle(a);

            // Build play icon for save (returns string-safe SVG via el)
            var iconEl = null;
            if (a.showIcon) {
                var sz = a.iconSize + 'px';
                if (a.iconStyle === 'circle') {
                    iconEl = el('svg', { viewBox: '0 0 40 40', width: sz, height: sz, style: { display: 'block', flexShrink: 0 }, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
                        el('circle', { cx: '20', cy: '20', r: '19', fill: 'rgba(255,255,255,0.2)', stroke: a.iconColor, strokeWidth: '1.5' }),
                        el('polygon', { points: '16,13 16,27 28,20', fill: a.iconColor })
                    );
                } else if (a.iconStyle === 'circle-filled') {
                    iconEl = el('svg', { viewBox: '0 0 40 40', width: sz, height: sz, style: { display: 'block', flexShrink: 0 }, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
                        el('circle', { cx: '20', cy: '20', r: '20', fill: a.iconColor }),
                        el('polygon', { points: '16,13 16,27 28,20', fill: '#fff' })
                    );
                } else {
                    iconEl = el('svg', { viewBox: '0 0 24 24', width: sz, height: sz, style: { display: 'block', flexShrink: 0, fill: a.iconColor }, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' },
                        el('path', { d: 'M8 5v14l11-7z' })
                    );
                }
            }

            return el('div', wp.blockEditor.useBlockProps.save((function () {
                var s = getTypoCssVars(a);
                return {
                className: 'bkbg-vp-outer',
                style: s,
                'data-vp-url':           a.videoUrl,
                'data-vp-autoplay':      a.autoplay      ? '1' : '0',
                'data-vp-muted':         a.muted         ? '1' : '0',
                'data-vp-max-width':     String(a.popupMaxWidth),
                'data-vp-radius':        String(a.popupBorderRadius),
                'data-vp-ratio':         a.aspectRatio,
                'data-vp-overlay':       a.overlayColor,
                'data-vp-blur':          a.overlayBlur ? String(a.overlayBlurAmount) : '0',
                'data-vp-close-overlay': a.closeOnOverlay ? '1' : '0',
                'data-vp-close-color':   a.closeButtonColor
            }; })()),
                el('div', { className: 'bkbg-vp-btn-outer', style: { textAlign: a.buttonAlign } },
                    el('div', { className: 'bkbg-vp-btn-wrap' },
                        el('button', {
                            className:        'bkbg-vp-btn',
                            type:             'button',
                            style:            btnStyle,
                            'aria-haspopup':  'dialog',
                            'aria-label':     (a.buttonText ? a.buttonText.replace(/<[^>]+>/g, '') : 'Watch video') + ' — opens video popup',
                            'data-vp-bg-hover':   a.buttonBgHover,
                            'data-vp-text-hover': a.buttonTextColorHover
                        },
                            a.showIcon && a.iconPosition === 'left' && iconEl,
                            el(RichTextContent, { tagName: 'span', className: 'bkbg-vp-btn-label', value: a.buttonText }),
                            a.showIcon && a.iconPosition === 'right' && iconEl
                        ),
                        a.showSubtext && el(RichTextContent, {
                            tagName:   'p',
                            className: 'bkbg-vp-subtext',
                            value:     a.subtext,
                            style: {
                                color:       a.subtextColor,
                                marginTop:   a.subtextSpacing + 'px',
                                marginBottom: 0,
                                padding: 0,
                                textAlign: a.buttonAlign
                            }
                        })
                    )
                )
            );
        }
    });
}() );
