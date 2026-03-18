( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    // ── Typography helpers ──────────────────────────────────────────────────
    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    // ── Helper: compute background CSS value ────────────────────────────────────
    function computeBg(a) {
        if (a.bgType === 'none') return 'none';
        if (a.bgType === 'color') return a.bgColor;
        if (a.bgType === 'gradient') {
            return 'linear-gradient(' + a.bgGradientAngle + 'deg, ' + a.bgGradientFrom + ', ' + a.bgGradientTo + ')';
        }
        if (a.bgType === 'image' && a.bgImageUrl) {
            return 'url(' + a.bgImageUrl + ')';
        }
        return 'none';
    }

    // ── Helper: wrap CSS vars + inline styles ───────────────────────────────────
    function buildWrapStyle(a) {
        var style = {
            '--bkbg-cta-headline-color': a.headlineColor,
            '--bkbg-cta-headline-spacing': a.headlineSpacing + 'px',
            '--bkbg-cta-sub-color': a.subColor,
            '--bkbg-cta-sub-spacing': a.subSpacing + 'px',
            '--bkbg-cta-padding': a.paddingTop + 'px ' + a.paddingRight + 'px ' + a.paddingBottom + 'px ' + a.paddingLeft + 'px',
            '--bkbg-cta-radius': a.borderRadius + 'px',
            '--bkbg-cta-max-width': a.contentMaxWidth + 'px',
            '--bkbg-cta-gap': a.gap + 'px',
            '--bkbg-cta-text-align': a.textAlign,
            '--bkbg-cta-overlay-color': a.bgOverlayColor,
            '--bkbg-cta-btn1-bg': a.btn1Bg,
            '--bkbg-cta-btn1-color': a.btn1Color,
            '--bkbg-cta-btn1-bg-hover': a.btn1BgHover,
            '--bkbg-cta-btn1-color-hover': a.btn1ColorHover,
            '--bkbg-cta-btn1-brd-color': a.btn1BorderColor,
            '--bkbg-cta-btn1-brd-w': a.btn1BorderWidth + 'px',
            '--bkbg-cta-btn1-size': a.btn1Size + 'px',
            '--bkbg-cta-btn1-weight': a.btn1Weight,
            '--bkbg-cta-btn1-radius': a.btn1Radius + 'px',
            '--bkbg-cta-btn1-padding': a.btn1PaddingV + 'px ' + a.btn1PaddingH + 'px',
            '--bkbg-cta-btn2-bg': a.btn2Bg,
            '--bkbg-cta-btn2-color': a.btn2Color,
            '--bkbg-cta-btn2-bg-hover': a.btn2BgHover,
            '--bkbg-cta-btn2-color-hover': a.btn2ColorHover,
            '--bkbg-cta-btn2-brd-color': a.btn2BorderColor,
            '--bkbg-cta-btn2-brd-w': a.btn2BorderWidth + 'px',
            '--bkbg-cta-btn2-size': a.btn2Size + 'px',
            '--bkbg-cta-btn2-weight': a.btn2Weight,
            '--bkbg-cta-btn2-radius': a.btn2Radius + 'px',
            '--bkbg-cta-btn2-padding': a.btn2PaddingV + 'px ' + a.btn2PaddingH + 'px'
        };

        var bg = computeBg(a);

        if (a.bgType === 'image' && a.bgImageUrl) {
            style['backgroundImage'] = bg;
            style['backgroundSize'] = a.bgImageSize;
            style['backgroundPosition'] = a.bgImagePosition;
            style['backgroundRepeat'] = 'no-repeat';
        } else if (a.bgType !== 'none') {
            style['background'] = bg;
        }

        Object.assign(style, _tv(a.typoHeadline, '--bkbg-cta-h-'), _tv(a.typoSub, '--bkbg-cta-s-'));
        return style;
    }

    registerBlockType('blockenberg/call-to-action', {
        title: __('Call to Action', 'blockenberg'),
        icon: 'megaphone',
        category: 'bkbg-marketing',
        description: __('Headline + sub-headline + 1–2 buttons with optional background.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            // ── Color picker state (one open at a time) ────────────────────
            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            // ── Color control helper with alpha support ────────────────────────
            function renderColorControl(key, label, value, onChange) {
                var isOpen = openColorKey === key;
                return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
                    el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
                    el('div', { style: { position: 'relative', flexShrink: 0 } },
                        el('button', {
                            type: 'button',
                            title: value || 'none',
                            onClick: function () { setOpenColorKey(isOpen ? null : key); },
                            style: {
                                width: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'block',
                                background: value || '#ffffff',
                                flexShrink: 0
                            }
                        }),
                        isOpen && el(Popover, {
                            position: 'bottom left',
                            onClose: function () { setOpenColorKey(null); }
                        },
                            el('div', {
                                style: { padding: '8px' },
                                onMouseDown: function (e) { e.stopPropagation(); }
                            },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                                    el('strong', { style: { fontSize: '12px' } }, label),
                                    el(Button, { icon: 'no-alt', isSmall: true, onClick: function () { setOpenColorKey(null); } })
                                ),
                                el(ColorPicker, {
                                    color: value,
                                    enableAlpha: true,
                                    onChange: function (c) { onChange(c); }
                                })
                            )
                        )
                    )
                );
            }

            // ── Open media library for background image ────────────────────────
            function openBgMediaLibrary() {
                var frame = wp.media({
                    title: __('Select Background Image', 'blockenberg'),
                    button: { text: __('Use as Background', 'blockenberg') },
                    multiple: false,
                    library: { type: 'image' }
                });
                frame.on('select', function () {
                    var attachment = frame.state().get('selection').first().toJSON();
                    setAttributes({ bgImageUrl: attachment.url });
                });
                frame.open();
            }

            // ── Option lists ───────────────────────────────────────────────────
            var titleTagOptions = [
                { label: 'H1', value: 'h1' },
                { label: 'H2', value: 'h2' },
                { label: 'H3', value: 'h3' },
                { label: 'H4', value: 'h4' },
                { label: 'P', value: 'p' }
            ];

            var textAlignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var btnLayoutOptions = [
                { label: __('Row (side by side)', 'blockenberg'), value: 'row' },
                { label: __('Column (stacked)', 'blockenberg'), value: 'column' }
            ];

            var bgTypeOptions = [
                { label: __('None', 'blockenberg'), value: 'none' },
                { label: __('Solid Color', 'blockenberg'), value: 'color' },
                { label: __('Gradient', 'blockenberg'), value: 'gradient' },
                { label: __('Image', 'blockenberg'), value: 'image' }
            ];

            var bgImageSizeOptions = [
                { label: __('Cover', 'blockenberg'), value: 'cover' },
                { label: __('Contain', 'blockenberg'), value: 'contain' },
                { label: __('Auto', 'blockenberg'), value: 'auto' }
            ];

            var btnStyleOptions = [
                { label: __('Solid Button', 'blockenberg'), value: 'solid' },
                { label: __('Outline Button', 'blockenberg'), value: 'outline' },
                { label: __('Ghost / Subtle', 'blockenberg'), value: 'ghost' },
                { label: __('Plain Link', 'blockenberg'), value: 'text' }
            ];

            var targetOptions = [
                { label: __('Same Tab', 'blockenberg'), value: '_self' },
                { label: __('New Tab', 'blockenberg'), value: '_blank' }
            ];

            // ── Inspector Controls ─────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Layout ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'),
                        value: a.textAlign,
                        options: textAlignOptions,
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Button Layout', 'blockenberg'),
                        value: a.btnLayout,
                        options: btnLayoutOptions,
                        onChange: function (v) { setAttributes({ btnLayout: v }); }
                    }),
                    el('hr', {}),
                    el('p', { style: { margin: '0 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Padding', 'blockenberg')),
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' } },
                        el(RangeControl, { label: __('Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Right', 'blockenberg'), value: a.paddingRight, min: 0, max: 160, onChange: function (v) { setAttributes({ paddingRight: v }); } }),
                        el(RangeControl, { label: __('Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function (v) { setAttributes({ paddingBottom: v }); } }),
                        el(RangeControl, { label: __('Left', 'blockenberg'), value: a.paddingLeft, min: 0, max: 160, onChange: function (v) { setAttributes({ paddingLeft: v }); } })
                    ),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 60,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Content Max Width (px)', 'blockenberg'),
                        value: a.contentMaxWidth,
                        min: 320,
                        max: 1400,
                        step: 10,
                        onChange: function (v) { setAttributes({ contentMaxWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap between elements', 'blockenberg'),
                        value: a.gap,
                        min: 0,
                        max: 60,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    })
                ),

                // ── Background ────────────────────────────────────────────────
                el(PanelBody, { title: __('Background', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Background Type', 'blockenberg'),
                        value: a.bgType,
                        options: bgTypeOptions,
                        onChange: function (v) { setAttributes({ bgType: v }); }
                    }),
                    a.bgType === 'color' && el('div', { style: { padding: '4px 0 8px' } },
                        renderColorControl('bgColor', __('Color', 'blockenberg'), a.bgColor, function (c) { setAttributes({ bgColor: c }); })
                    ),
                    a.bgType === 'gradient' && el(Fragment, {},
                        el('div', { style: { padding: '4px 0 8px' } },
                            renderColorControl('bgGradientFrom', __('From', 'blockenberg'), a.bgGradientFrom, function (c) { setAttributes({ bgGradientFrom: c }); }),
                            renderColorControl('bgGradientTo', __('To', 'blockenberg'), a.bgGradientTo, function (c) { setAttributes({ bgGradientTo: c }); })
                        ),
                        el(RangeControl, {
                            label: __('Angle (deg)', 'blockenberg'),
                            value: a.bgGradientAngle,
                            min: 0,
                            max: 360,
                            onChange: function (v) { setAttributes({ bgGradientAngle: v }); }
                        })
                    ),
                    a.bgType === 'image' && el(Fragment, {},
                        a.bgImageUrl && el('div', { style: { marginBottom: '8px' } },
                            el('img', { src: a.bgImageUrl, alt: '', style: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', display: 'block' } })
                        ),
                        el('div', { style: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' } },
                            el(Button, {
                                variant: 'secondary',
                                isSmall: true,
                                onClick: openBgMediaLibrary
                            }, a.bgImageUrl ? __('Replace Image', 'blockenberg') : __('Select Image', 'blockenberg')),
                            a.bgImageUrl && el(Button, {
                                isSmall: true,
                                isDestructive: true,
                                onClick: function () { setAttributes({ bgImageUrl: '' }); }
                            }, __('Remove', 'blockenberg'))
                        ),
                        el(SelectControl, {
                            label: __('Image Size', 'blockenberg'),
                            value: a.bgImageSize,
                            options: bgImageSizeOptions,
                            onChange: function (v) { setAttributes({ bgImageSize: v }); }
                        }),
                        el(TextControl, {
                            label: __('Image Position', 'blockenberg'),
                            value: a.bgImagePosition,
                            help: __('e.g. center center, top left, 50% 30%', 'blockenberg'),
                            onChange: function (v) { setAttributes({ bgImagePosition: v }); }
                        }),
                        el('hr', {}),
                        el(ToggleControl, {
                            label: __('Color Overlay', 'blockenberg'),
                            checked: a.bgOverlay,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ bgOverlay: v }); }
                        }),
                        a.bgOverlay && el('div', { style: { padding: '4px 0 8px' } },
                            renderColorControl('bgOverlayColor', __('Overlay', 'blockenberg'), a.bgOverlayColor, function (c) { setAttributes({ bgOverlayColor: c }); })
                        )
                    )
                ),

                // ── Typography ────────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Headline Tag', 'blockenberg'),
                        value: a.titleTag,
                        options: titleTagOptions,
                        onChange: function (v) { setAttributes({ titleTag: v }); }
                    }),
                    el('p', { style: { margin: '12px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Headline', 'blockenberg')),
                    el(getTypographyControl(), {
                        label: __('Headline Typography', 'blockenberg'),
                        value: a.typoHeadline,
                        onChange: function (v) { setAttributes({ typoHeadline: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Spacing Below', 'blockenberg'),
                        value: a.headlineSpacing,
                        min: 0,
                        max: 60,
                        onChange: function (v) { setAttributes({ headlineSpacing: v }); }
                    }),
                    el('hr', {}),
                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Sub-headline', 'blockenberg')),
                    el(getTypographyControl(), {
                        label: __('Sub-headline Typography', 'blockenberg'),
                        value: a.typoSub,
                        onChange: function (v) { setAttributes({ typoSub: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Spacing Below', 'blockenberg'),
                        value: a.subSpacing,
                        min: 0,
                        max: 80,
                        onChange: function (v) { setAttributes({ subSpacing: v }); }
                    }),
                    el('hr', {}),
                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Button 1', 'blockenberg')),
                    el(RangeControl, {
                        label: __('Font Size', 'blockenberg'),
                        value: a.btn1Size,
                        min: 10,
                        max: 28,
                        onChange: function (v) { setAttributes({ btn1Size: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Font Weight', 'blockenberg'),
                        value: a.btn1Weight,
                        min: 100,
                        max: 900,
                        step: 100,
                        onChange: function (v) { setAttributes({ btn1Weight: v }); }
                    }),
                    el('hr', {}),
                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Button 2', 'blockenberg')),
                    el(RangeControl, {
                        label: __('Font Size', 'blockenberg'),
                        value: a.btn2Size,
                        min: 10,
                        max: 28,
                        onChange: function (v) { setAttributes({ btn2Size: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Font Weight', 'blockenberg'),
                        value: a.btn2Weight,
                        min: 100,
                        max: 900,
                        step: 100,
                        onChange: function (v) { setAttributes({ btn2Weight: v }); }
                    })
                ),

                // ── Button 1 ──────────────────────────────────────────────────
                el(PanelBody, { title: __('Button 1 (Primary)', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Button Text', 'blockenberg'),
                        value: a.btn1Text,
                        onChange: function (v) { setAttributes({ btn1Text: v }); }
                    }),
                    el(TextControl, {
                        label: __('URL', 'blockenberg'),
                        value: a.btn1Url,
                        type: 'url',
                        placeholder: 'https://',
                        onChange: function (v) { setAttributes({ btn1Url: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Open In', 'blockenberg'),
                        value: a.btn1Target,
                        options: targetOptions,
                        onChange: function (v) { setAttributes({ btn1Target: v }); }
                    }),
                    el('hr', {}),
                    el(SelectControl, {
                        label: __('Button Style', 'blockenberg'),
                        value: a.btn1Style,
                        options: btnStyleOptions,
                        onChange: function (v) { setAttributes({ btn1Style: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.btn1Radius,
                        min: 0,
                        max: 50,
                        onChange: function (v) { setAttributes({ btn1Radius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Vertical', 'blockenberg'),
                        value: a.btn1PaddingV,
                        min: 4,
                        max: 36,
                        onChange: function (v) { setAttributes({ btn1PaddingV: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Horizontal', 'blockenberg'),
                        value: a.btn1PaddingH,
                        min: 8,
                        max: 80,
                        onChange: function (v) { setAttributes({ btn1PaddingH: v }); }
                    }),
                    (a.btn1Style === 'outline' || a.btn1Style === 'ghost') && el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.btn1BorderWidth,
                        min: 1,
                        max: 4,
                        onChange: function (v) { setAttributes({ btn1BorderWidth: v }); }
                    })
                ),

                // ── Button 2 ──────────────────────────────────────────────────
                el(PanelBody, { title: __('Button 2 (Secondary)', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Second Button', 'blockenberg'),
                        checked: a.btn2Enabled,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ btn2Enabled: v }); }
                    }),
                    a.btn2Enabled && el(Fragment, {},
                        el(TextControl, {
                            label: __('Button Text', 'blockenberg'),
                            value: a.btn2Text,
                            onChange: function (v) { setAttributes({ btn2Text: v }); }
                        }),
                        el(TextControl, {
                            label: __('URL', 'blockenberg'),
                            value: a.btn2Url,
                            type: 'url',
                            placeholder: 'https://',
                            onChange: function (v) { setAttributes({ btn2Url: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Open In', 'blockenberg'),
                            value: a.btn2Target,
                            options: targetOptions,
                            onChange: function (v) { setAttributes({ btn2Target: v }); }
                        }),
                        el('hr', {}),
                        el(SelectControl, {
                            label: __('Button Style', 'blockenberg'),
                            value: a.btn2Style,
                            options: btnStyleOptions,
                            onChange: function (v) { setAttributes({ btn2Style: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border Radius', 'blockenberg'),
                            value: a.btn2Radius,
                            min: 0,
                            max: 50,
                            onChange: function (v) { setAttributes({ btn2Radius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Vertical', 'blockenberg'),
                            value: a.btn2PaddingV,
                            min: 4,
                            max: 36,
                            onChange: function (v) { setAttributes({ btn2PaddingV: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Horizontal', 'blockenberg'),
                            value: a.btn2PaddingH,
                            min: 8,
                            max: 80,
                            onChange: function (v) { setAttributes({ btn2PaddingH: v }); }
                        }),
                        (a.btn2Style === 'outline' || a.btn2Style === 'ghost') && el(RangeControl, {
                            label: __('Border Width', 'blockenberg'),
                            value: a.btn2BorderWidth,
                            min: 1,
                            max: 4,
                            onChange: function (v) { setAttributes({ btn2BorderWidth: v }); }
                        })
                    )
                ),

                // ── Colors ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Text', 'blockenberg')),
                    renderColorControl('headlineColor', __('Headline', 'blockenberg'), a.headlineColor, function (c) { setAttributes({ headlineColor: c }); }),
                    renderColorControl('subColor', __('Sub-headline', 'blockenberg'), a.subColor, function (c) { setAttributes({ subColor: c }); }),
                    el('hr', {}),
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Button 1', 'blockenberg')),
                    renderColorControl('btn1Bg', __('Background', 'blockenberg'), a.btn1Bg, function (c) { setAttributes({ btn1Bg: c }); }),
                    renderColorControl('btn1Color', __('Text', 'blockenberg'), a.btn1Color, function (c) { setAttributes({ btn1Color: c }); }),
                    renderColorControl('btn1BgHover', __('Background (Hover)', 'blockenberg'), a.btn1BgHover, function (c) { setAttributes({ btn1BgHover: c }); }),
                    renderColorControl('btn1ColorHover', __('Text (Hover)', 'blockenberg'), a.btn1ColorHover, function (c) { setAttributes({ btn1ColorHover: c }); }),
                    renderColorControl('btn1BorderColor', __('Border', 'blockenberg'), a.btn1BorderColor, function (c) { setAttributes({ btn1BorderColor: c }); }),
                    a.btn2Enabled && el(Fragment, {},
                        el('hr', {}),
                        el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __('Button 2', 'blockenberg')),
                        renderColorControl('btn2Bg', __('Background', 'blockenberg'), a.btn2Bg, function (c) { setAttributes({ btn2Bg: c }); }),
                        renderColorControl('btn2Color', __('Text', 'blockenberg'), a.btn2Color, function (c) { setAttributes({ btn2Color: c }); }),
                        renderColorControl('btn2BgHover', __('Background (Hover)', 'blockenberg'), a.btn2BgHover, function (c) { setAttributes({ btn2BgHover: c }); }),
                        renderColorControl('btn2ColorHover', __('Text (Hover)', 'blockenberg'), a.btn2ColorHover, function (c) { setAttributes({ btn2ColorHover: c }); }),
                        renderColorControl('btn2BorderColor', __('Border', 'blockenberg'), a.btn2BorderColor, function (c) { setAttributes({ btn2BorderColor: c }); })
                    )
                )
            );

            // ── data-attributes ────────────────────────────────────────────────────
            var wrapDataAttrs = {
                'data-bg-type': a.bgType,
                'data-text-align': a.textAlign,
                'data-btn-layout': a.btnLayout,
                'data-has-overlay': (a.bgType === 'image' && a.bgOverlay) ? 'true' : 'false'
            };

            // ── Edit render ────────────────────────────────────────────────────────
            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Call to Action'
            });

            return el('div', blockProps,
                inspector,
                el('div', Object.assign({ className: 'bkbg-cta-wrap', style: buildWrapStyle(a) }, wrapDataAttrs),
                    // Overlay for image backgrounds
                    a.bgType === 'image' && a.bgOverlay && el('div', {
                        className: 'bkbg-cta-overlay',
                        'aria-hidden': 'true'
                    }),

                    // Inner content wrapper (max-width limiter)
                    el('div', { className: 'bkbg-cta-inner' },
                        el(RichText, {
                            tagName: a.titleTag,
                            className: 'bkbg-cta-headline',
                            value: a.headline,
                            onChange: function (v) { setAttributes({ headline: v }); },
                            placeholder: __('Your Headline…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                        }),
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-cta-sub',
                            value: a.subheadline,
                            onChange: function (v) { setAttributes({ subheadline: v }); },
                            placeholder: __('Supporting text…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/link', 'core/text-color']
                        }),
                        el('div', { className: 'bkbg-cta-btns', 'data-layout': a.btnLayout },
                            // Button 1
                            el('span', {
                                className: 'bkbg-cta-btn bkbg-cta-btn1',
                                'data-style': a.btn1Style,
                                title: a.btn1Url ? a.btn1Url : __('(no URL set)', 'blockenberg')
                            }, a.btn1Text || __('Button Text', 'blockenberg')),
                            // Button 2
                            a.btn2Enabled && el('span', {
                                className: 'bkbg-cta-btn bkbg-cta-btn2',
                                'data-style': a.btn2Style,
                                title: a.btn2Url ? a.btn2Url : __('(no URL set)', 'blockenberg')
                            }, a.btn2Text || __('Button Text', 'blockenberg'))
                        )
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            var wrapDataAttrs = {
                'data-bg-type': a.bgType,
                'data-text-align': a.textAlign,
                'data-btn-layout': a.btnLayout,
                'data-has-overlay': (a.bgType === 'image' && a.bgOverlay) ? 'true' : 'false'
            };

            return el('div', Object.assign({ className: 'bkbg-cta-wrap', style: buildWrapStyle(a) }, wrapDataAttrs),
                // Overlay
                a.bgType === 'image' && a.bgOverlay && el('div', {
                    className: 'bkbg-cta-overlay',
                    'aria-hidden': 'true'
                }),

                // Inner
                el('div', { className: 'bkbg-cta-inner' },
                    el(RichTextContent, {
                        tagName: a.titleTag,
                        className: 'bkbg-cta-headline',
                        value: a.headline
                    }),
                    el(RichTextContent, {
                        tagName: 'p',
                        className: 'bkbg-cta-sub',
                        value: a.subheadline
                    }),
                    el('div', { className: 'bkbg-cta-btns', 'data-layout': a.btnLayout },
                        // Button 1
                        el('a', {
                            href: a.btn1Url || '#',
                            className: 'bkbg-cta-btn bkbg-cta-btn1',
                            'data-style': a.btn1Style,
                            target: a.btn1Target,
                            rel: a.btn1Target === '_blank' ? 'noopener noreferrer' : undefined
                        }, a.btn1Text || 'Get Started'),
                        // Button 2
                        a.btn2Enabled && el('a', {
                            href: a.btn2Url || '#',
                            className: 'bkbg-cta-btn bkbg-cta-btn2',
                            'data-style': a.btn2Style,
                            target: a.btn2Target,
                            rel: a.btn2Target === '_blank' ? 'noopener noreferrer' : undefined
                        }, a.btn2Text || 'Learn More')
                    )
                )
            );
        }
    });
}() );
