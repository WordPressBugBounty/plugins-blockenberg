( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
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

    // ── Generate unique block ID ─────────────────────────────────────────────────
    function generateId() {
        return 'bq' + Math.random().toString(36).substr(2, 8);
    }

    // ── Decorative quote mark SVG ────────────────────────────────────────────────
    // Uses SVG <text> elements for authentic typographic marks.
    function buildMarkSVG(markStyle, markSize, markColor) {
        var base = {
            xmlns: 'http://www.w3.org/2000/svg',
            'aria-hidden': 'true',
            focusable: 'false',
            style: { display: 'block' }
        };

        if (markStyle === 'fancy') {
            // Typographic open-double-quote " (U+201C) — curly serif
            return el('svg', Object.assign({}, base, { viewBox: '0 0 120 100', width: markSize, height: Math.round(markSize * 0.84) }),
                el('text', { x: '4', y: '96', fontSize: '140', fontFamily: 'Georgia,"Times New Roman",serif', fill: markColor }, '\u201C')
            );
        }
        if (markStyle === 'simple') {
            // Straight double quote "
            return el('svg', Object.assign({}, base, { viewBox: '0 0 80 70', width: markSize, height: Math.round(markSize * 0.875) }),
                el('text', { x: '2', y: '66', fontSize: '100', fontFamily: 'Arial,Helvetica,sans-serif', fill: markColor }, '"')
            );
        }
        if (markStyle === 'chevron') {
            // Double angle quotation mark »
            return el('svg', Object.assign({}, base, { viewBox: '0 0 80 64', width: markSize, height: Math.round(markSize * 0.8) }),
                el('text', { x: '0', y: '60', fontSize: '88', fontFamily: 'Georgia,serif', fill: markColor }, '\u00BB')
            );
        }
        if (markStyle === 'ornate') {
            // Heavy double turned comma quotation mark ❝ (U+275D)
            return el('svg', Object.assign({}, base, { viewBox: '0 0 100 88', width: markSize, height: Math.round(markSize * 0.88) }),
                el('text', { x: '0', y: '84', fontSize: '120', fontFamily: 'Georgia,serif', fill: markColor }, '\u275D')
            );
        }
        // lines: two horizontal rectangular strokes (typographic em-dash pair)
        var lh = Math.max(3, Math.round(markSize * 0.07));
        var lw = Math.round(markSize * 0.8);
        var gap = lh * 2.5;
        return el('svg', Object.assign({}, base, { viewBox: '0 0 ' + (lw + 2) + ' ' + (lh * 2 + gap), width: lw + 2, height: lh * 2 + gap }),
            el('rect', { x: 0, y: 0,         width: lw,              height: lh, rx: lh / 2, fill: markColor }),
            el('rect', { x: 0, y: lh + gap,  width: Math.round(lw * 0.6), height: lh, rx: lh / 2, fill: markColor })
        );
    }

    // ── CSS custom properties on wrapper ────────────────────────────────────────
    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-bq-accent-color':  a.accentColor,
            '--bkbg-bq-accent-w':      a.accentLineWidth + 'px',
            '--bkbg-bq-accent-r':      a.accentLineRadius + 'px',
            '--bkbg-bq-bg':            a.bgColor,
            '--bkbg-bq-radius':        a.borderRadius + 'px',
            '--bkbg-bq-pad-t':         a.paddingTop + 'px',
            '--bkbg-bq-pad-r':         a.paddingRight + 'px',
            '--bkbg-bq-pad-b':         a.paddingBottom + 'px',
            '--bkbg-bq-pad-l':         a.paddingLeft + 'px',
            '--bkbg-bq-mark-opacity':  (a.markOpacity / 100),
            '--bkbg-bq-mark-side-gap': a.markOpacity + 'px',
            '--bkbg-bq-shadow':        a.enableShadow ? '0 4px 28px rgba(0,0,0,0.09)' : 'none',
            '--bkbg-bq-quote-color':   a.quoteColor,
            '--bkbg-bq-quote-spacing': a.quoteSpacing + 'px',
            '--bkbg-bq-name-color':    a.nameColor,
            '--bkbg-bq-role-color':    a.roleColor,
            '--bkbg-bq-photo-size':    a.photoSize + 'px',
            '--bkbg-bq-photo-border':  a.photoBorder ? ('2px solid ' + a.photoBorderColor) : 'none',
            '--bkbg-bq-gap-photo':     a.gapPhotoText + 'px'
        }, _tv(a.typoQuote, '--bkbg-bq-quote-'), _tv(a.typoName, '--bkbg-bq-name-'), _tv(a.typoRole, '--bkbg-bq-role-'));
    }

    registerBlockType('blockenberg/blockquote', {
        title: __('Blockquote / Pull Quote', 'blockenberg'),
        icon: 'format-quote',
        category: 'bkbg-content',
        description: __('Stylish blockquote with accent line, decorative marks, author photo and role.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            // ── Generate blockId on first mount ──────────────────────────────
            useEffect(function () {
                if (!a.blockId) { setAttributes({ blockId: generateId() }); }
            }, []);

            // ── Color picker state (one open at a time) ────────────────────────
            var openColorKeyState = useState(null);
            var openColorKey      = openColorKeyState[0];
            var setOpenColorKey   = openColorKeyState[1];

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
                                width: '28px', height: '28px', borderRadius: '4px',
                                border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                                cursor: 'pointer', padding: 0, display: 'block',
                                background: value || '#ffffff', flexShrink: 0
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

            // ── Open wp.media for author photo ───────────────────────────────
            function openPhotoLibrary() {
                var frame = wp.media({
                    title: __('Select Author Photo', 'blockenberg'),
                    button: { text: __('Use as Author Photo', 'blockenberg') },
                    multiple: false,
                    library: { type: 'image' }
                });
                frame.on('select', function () {
                    var att = frame.state().get('selection').first().toJSON();
                    setAttributes({ photoUrl: att.url, photoAlt: att.alt || att.title || '' });
                });
                frame.open();
            }

            // ── Option lists ──────────────────────────────────────────────────
            var quoteStyleOptions = [
                { label: __('Line — left accent bar',   'blockenberg'), value: 'line'     },
                { label: __('Quotes — mark centred',    'blockenberg'), value: 'quotes'   },
                { label: __('Card — boxed background',  'blockenberg'), value: 'card'     },
                { label: __('Minimal — clean type',     'blockenberg'), value: 'minimal'  },
                { label: __('Bordered — full border',   'blockenberg'), value: 'bordered' },
                { label: __('Top Bar — header accent',  'blockenberg'), value: 'top-bar'  }
            ];

            var quoteAlignOptions = [
                { label: __('Left',   'blockenberg'), value: 'left'   },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right',  'blockenberg'), value: 'right'  }
            ];

            var markStyleOptions = [
                { label: __('Fancy — curly serif "',   'blockenberg'), value: 'fancy'   },
                { label: __('Simple — straight "',     'blockenberg'), value: 'simple'  },
                { label: __('Chevron — »',             'blockenberg'), value: 'chevron' },
                { label: __('Ornate — ❝ heavy',       'blockenberg'), value: 'ornate'  },
                { label: __('Lines — two strokes',     'blockenberg'), value: 'lines'   }
            ];

            var markPositionOptions = [
                { label: __('Side (left of text)',   'blockenberg'), value: 'float' },
                { label: __('Side (right of text)',  'blockenberg'), value: 'right' },
                { label: __('Above quote text',       'blockenberg'), value: 'above' }
            ];

            var authorLayoutOptions = [
                { label: __('Horizontal — photo left',  'blockenberg'), value: 'horizontal'       },
                { label: __('Horizontal — photo right', 'blockenberg'), value: 'horizontal-right' },
                { label: __('Vertical — photo above',   'blockenberg'), value: 'vertical'         }
            ];

            var photoShapeOptions = [
                { label: __('Circle',  'blockenberg'), value: 'circle'  },
                { label: __('Rounded', 'blockenberg'), value: 'rounded' },
                { label: __('Square',  'blockenberg'), value: 'square'  }
            ];

            var fontWeightOptions = [
                { label: '300 — Light',      value: 300 },
                { label: '400 — Regular',    value: 400 },
                { label: '500 — Medium',     value: 500 },
                { label: '600 — Semi Bold',  value: 600 },
                { label: '700 — Bold',       value: 700 },
                { label: '800 — Extra Bold', value: 800 }
            ];

            var quoteFontStyleOptions = [
                { label: __('Italic', 'blockenberg'), value: 'italic' },
                { label: __('Normal', 'blockenberg'), value: 'normal' }
            ];

            var hasAccentLineControl = (
                a.quoteStyle === 'line'    ||
                a.quoteStyle === 'bordered'||
                a.quoteStyle === 'top-bar'
            );

            // ── Inspector panels ──────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Style ─────────────────────────────────────────────────────
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Quote Style', 'blockenberg'),
                        value: a.quoteStyle,
                        options: quoteStyleOptions,
                        onChange: function (v) { setAttributes({ quoteStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'),
                        value: a.quoteAlign,
                        options: quoteAlignOptions,
                        onChange: function (v) { setAttributes({ quoteAlign: v }); }
                    }),
                    el('hr', {}),
                    el(ToggleControl, {
                        label: __('Show Decorative Mark', 'blockenberg'),
                        checked: a.showMark,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showMark: v }); }
                    }),
                    a.showMark && el(Fragment, {},
                        el(SelectControl, {
                            label: __('Mark Style', 'blockenberg'),
                            value: a.markStyle,
                            options: markStyleOptions,
                            onChange: function (v) { setAttributes({ markStyle: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Mark Position', 'blockenberg'),
                            value: a.markPosition,
                            options: markPositionOptions,
                            onChange: function (v) { setAttributes({ markPosition: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Mark Size (px)', 'blockenberg'),
                            value: a.markSize,
                            min: 32,
                            max: 200,
                            onChange: function (v) { setAttributes({ markSize: v }); }
                        }),
                        a.markPosition === 'float' && el(RangeControl, {
                            label: __('Gap between mark and text (px)', 'blockenberg'),
                            value: a.markOpacity,
                            min: 0,
                            max: 60,
                            onChange: function (v) { setAttributes({ markOpacity: v }); }
                        }),
                        a.markPosition === 'right' && el(RangeControl, {
                            label: __('Gap between text and mark (px)', 'blockenberg'),
                            value: a.markOpacity,
                            min: 0,
                            max: 60,
                            onChange: function (v) { setAttributes({ markOpacity: v }); }
                        })
                    )
                ),

                // ── Typography ────────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Quote Text', 'blockenberg'), value: a.typoQuote, onChange: function (v) { setAttributes({ typoQuote: v }); } }),
                    el(getTypographyControl(), { label: __('Author Name', 'blockenberg'), value: a.typoName, onChange: function (v) { setAttributes({ typoName: v }); } }),
                    el(getTypographyControl(), { label: __('Role / Title', 'blockenberg'), value: a.typoRole, onChange: function (v) { setAttributes({ typoRole: v }); } })
                ),

                // ── Author ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Author', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Author', 'blockenberg'),
                        checked: a.showAuthor,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showAuthor: v }); }
                    }),
                    a.showAuthor && el(Fragment, {},
                        el(SelectControl, {
                            label: __('Author Layout', 'blockenberg'),
                            value: a.authorLayout,
                            options: authorLayoutOptions,
                            onChange: function (v) { setAttributes({ authorLayout: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Role / Title', 'blockenberg'),
                            checked: a.showRole,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showRole: v }); }
                        }),
                        el('hr', {}),
                        el(ToggleControl, {
                            label: __('Show Author Photo', 'blockenberg'),
                            checked: a.showPhoto,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showPhoto: v }); }
                        }),
                        a.showPhoto && el(Fragment, {},
                            el(SelectControl, {
                                label: __('Photo Shape', 'blockenberg'),
                                value: a.photoShape,
                                options: photoShapeOptions,
                                onChange: function (v) { setAttributes({ photoShape: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Photo Size (px)', 'blockenberg'),
                                value: a.photoSize, min: 24, max: 120,
                                onChange: function (v) { setAttributes({ photoSize: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Gap photo → text (px)', 'blockenberg'),
                                value: a.gapPhotoText, min: 0, max: 48,
                                onChange: function (v) { setAttributes({ gapPhotoText: v }); }
                            }),
                            el(ToggleControl, {
                                label: __('Photo Border', 'blockenberg'),
                                checked: a.photoBorder,
                                __nextHasNoMarginBottom: true,
                                onChange: function (v) { setAttributes({ photoBorder: v }); }
                            }),
                            el('div', { style: { marginTop: '8px' } },
                                a.photoUrl
                                    ? el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                                        el('img', {
                                            src: a.photoUrl, alt: '',
                                            style: { width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #ddd', flexShrink: 0 }
                                        }),
                                        el(Button, {
                                            isSecondary: true, isSmall: true,
                                            onClick: openPhotoLibrary
                                        }, __('Change', 'blockenberg')),
                                        el(Button, {
                                            isDestructive: true, isSmall: true,
                                            onClick: function () { setAttributes({ photoUrl: '', photoAlt: '' }); }
                                        }, __('Remove', 'blockenberg'))
                                    )
                                    : el(Button, {
                                        isPrimary: true, isSmall: true,
                                        onClick: openPhotoLibrary
                                    }, __('Choose Author Photo', 'blockenberg'))
                            )
                        )
                    )
                ),

                // ── Colors ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                        __('Quote', 'blockenberg')
                    ),
                    renderColorControl('quoteColor', __('Quote text', 'blockenberg'), a.quoteColor,
                        function (c) { setAttributes({ quoteColor: c }); }),

                    el('hr', {}),
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                        __('Accent', 'blockenberg')
                    ),
                    renderColorControl('accentColor', __('Accent / border color', 'blockenberg'), a.accentColor,
                        function (c) { setAttributes({ accentColor: c }); }),

                    a.showMark && el(Fragment, {},
                        el('hr', {}),
                        el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                            __('Quote Mark', 'blockenberg')
                        ),
                        renderColorControl('markColor', __('Mark color', 'blockenberg'), a.markColor,
                            function (c) { setAttributes({ markColor: c }); })
                    ),

                    el('hr', {}),
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                        __('Author', 'blockenberg')
                    ),
                    renderColorControl('nameColor', __('Author name', 'blockenberg'), a.nameColor,
                        function (c) { setAttributes({ nameColor: c }); }),
                    a.showRole && renderColorControl('roleColor', __('Role / title', 'blockenberg'), a.roleColor,
                        function (c) { setAttributes({ roleColor: c }); }),

                    el('hr', {}),
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                        __('Block', 'blockenberg')
                    ),
                    renderColorControl('bgColor', __('Background', 'blockenberg'), a.bgColor,
                        function (c) { setAttributes({ bgColor: c }); }),
                    a.showPhoto && a.photoBorder && renderColorControl('photoBorderColor', __('Photo border', 'blockenberg'), a.photoBorderColor,
                        function (c) { setAttributes({ photoBorderColor: c }); })
                ),

                // ── Layout & Spacing ──────────────────────────────────────────
                el(PanelBody, { title: __('Layout & Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 120, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                    el(RangeControl, { label: __('Padding Right (px)',  'blockenberg'), value: a.paddingRight,  min: 0, max: 120, onChange: function (v) { setAttributes({ paddingRight: v }); } }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 120, onChange: function (v) { setAttributes({ paddingBottom: v }); } }),
                    el(RangeControl, { label: __('Padding Left (px)',   'blockenberg'), value: a.paddingLeft,   min: 0, max: 120, onChange: function (v) { setAttributes({ paddingLeft: v }); } }),
                    el('hr', {}),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 48,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Drop Shadow', 'blockenberg'),
                        checked: a.enableShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ enableShadow: v }); }
                    }),
                    el('hr', {}),
                    el(RangeControl, {
                        label: __('Gap after quote text (px)', 'blockenberg'),
                        value: a.quoteSpacing, min: 0, max: 80,
                        onChange: function (v) { setAttributes({ quoteSpacing: v }); }
                    }),
                    hasAccentLineControl && el(Fragment, {},
                        el(RangeControl, {
                            label: __('Accent Line Width (px)', 'blockenberg'),
                            value: a.accentLineWidth, min: 1, max: 16,
                            onChange: function (v) { setAttributes({ accentLineWidth: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Accent Line Radius (px)', 'blockenberg'),
                            value: a.accentLineRadius, min: 0, max: 8,
                            onChange: function (v) { setAttributes({ accentLineRadius: v }); }
                        })
                    )
                )
            );

            // ── Build sub-elements ────────────────────────────────────────────
            var markEl = a.showMark
                ? el('span', { className: 'bkbg-bq-mark', 'aria-hidden': 'true' },
                    buildMarkSVG(a.markStyle, a.markSize, a.markColor))
                : null;

            // Author photo: real img or click-to-upload placeholder in editor
            var photoEl = a.showPhoto
                ? el('div', { className: 'bkbg-bq-photo-wrap', 'data-shape': a.photoShape },
                    a.photoUrl
                        ? el('img', { className: 'bkbg-bq-photo', src: a.photoUrl, alt: a.photoAlt })
                        : el('div', {
                            className: 'bkbg-bq-photo-placeholder',
                            onClick: openPhotoLibrary,
                            title: __('Click to add author photo', 'blockenberg'),
                            style: { cursor: 'pointer' }
                          }, '+')
                  )
                : null;

            var authorEl = a.showAuthor
                ? el('div', { className: 'bkbg-bq-author', 'data-layout': a.authorLayout },
                    a.showPhoto && photoEl,
                    el('div', { className: 'bkbg-bq-info' },
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-bq-name',
                            value: a.authorName,
                            onChange: function (v) { setAttributes({ authorName: v }); },
                            placeholder: __('Author name…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                        }),
                        a.showRole && el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-bq-role',
                            value: a.authorRole,
                            onChange: function (v) { setAttributes({ authorRole: v }); },
                            placeholder: __('Role or title…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                        })
                    )
                  )
                : null;

            // ── Edit render ───────────────────────────────────────────────────
            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Blockquote'
            });

            return el('div', blockProps,
                inspector,
                el('figure', Object.assign(
                    { className: 'bkbg-bq-wrap', style: buildWrapStyle(a) },
                    {
                        'data-style':         a.quoteStyle,
                        'data-quote-align':   a.quoteAlign,
                        'data-mark-pos':      a.showMark ? a.markPosition : 'none',
                        'data-photo-shape':   a.photoShape,
                        'data-author-layout': a.authorLayout
                    }
                ),
                    // Float mark = flex row, mark on left
                    a.showMark && a.markPosition === 'float' && markEl,
                    // Right mark = flex row, mark on right (inserted after body via CSS order)
                    a.showMark && a.markPosition === 'right' && markEl,
                    el('div', { className: 'bkbg-bq-body' },
                        // Above mark = in-flow before quote text
                        a.showMark && a.markPosition === 'above' && markEl,
                        el(RichText, {
                            tagName: 'blockquote',
                            className: 'bkbg-bq-text',
                            value: a.quoteText,
                            onChange: function (v) { setAttributes({ quoteText: v }); },
                            placeholder: __('Type your quote here…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/text-color', 'core/link']
                        }),
                        authorEl
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            var markEl = a.showMark
                ? el('span', { className: 'bkbg-bq-mark', 'aria-hidden': 'true' },
                    buildMarkSVG(a.markStyle, a.markSize, a.markColor))
                : null;

            var photoEl = a.showPhoto && a.photoUrl
                ? el('div', { className: 'bkbg-bq-photo-wrap', 'data-shape': a.photoShape },
                    el('img', { className: 'bkbg-bq-photo', src: a.photoUrl, alt: a.photoAlt }))
                : null;

            var authorEl = a.showAuthor
                ? el('div', { className: 'bkbg-bq-author', 'data-layout': a.authorLayout },
                    a.showPhoto && photoEl,
                    el('div', { className: 'bkbg-bq-info' },
                        el(RichTextContent, { tagName: 'p', className: 'bkbg-bq-name', value: a.authorName }),
                        a.showRole && el(RichTextContent, { tagName: 'p', className: 'bkbg-bq-role', value: a.authorRole })
                    )
                  )
                : null;

            return el('figure', Object.assign(
                { className: 'bkbg-bq-wrap', style: buildWrapStyle(a) },
                {
                    'data-style':         a.quoteStyle,
                    'data-quote-align':   a.quoteAlign,
                    'data-mark-pos':      a.showMark ? a.markPosition : 'none',
                    'data-photo-shape':   a.photoShape,
                    'data-author-layout': a.authorLayout
                }
            ),
                a.showMark && a.markPosition === 'float' && markEl,
                a.showMark && a.markPosition === 'right' && markEl,
                el('div', { className: 'bkbg-bq-body' },
                    a.showMark && a.markPosition === 'above' && markEl,
                    el(RichTextContent, {
                        tagName: 'blockquote',
                        className: 'bkbg-bq-text',
                        value: a.quoteText
                    }),
                    authorEl
                )
            );
        }
    });
}() );
