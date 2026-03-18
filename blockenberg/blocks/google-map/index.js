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
    var TextareaControl   = wp.components.TextareaControl;
    var Notice            = wp.components.Notice;

    var _gmTC, _gmTV;
    function _tc() { return _gmTC || (_gmTC = window.bkbgTypographyControl); }
    function _tv() { return _gmTV || (_gmTV = window.bkbgTypoCssVars); }

    // ── Color swatch control (same pattern as flip-card / blockquote) ───────────
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

    // ── Build Google Maps embed URL ─────────────────────────────────────────────
    // With API key: uses Embed API v1 (full zoom + maptype support)
    // Without API key: uses legacy iframe embed (limited but no key needed)
    function buildEmbedUrl(a) {
        var q = encodeURIComponent(a.address || 'New York');
        if (a.apiKey) {
            return 'https://www.google.com/maps/embed/v1/place'
                + '?key=' + encodeURIComponent(a.apiKey)
                + '&q=' + q
                + '&zoom=' + a.zoom
                + '&maptype=' + a.mapType
                + '&language=en';
        }
        // Fallback: legacy Maps embed (zoom and type work with some limitations)
        var typeMap = { roadmap: 'm', satellite: 'k', terrain: 'p', hybrid: 'h' };
        return 'https://maps.google.com/maps'
            + '?q=' + q
            + '&z=' + a.zoom
            + '&t=' + (typeMap[a.mapType] || 'm')
            + '&output=embed'
            + '&hl=en';
    }

    // ── Build box-shadow css value ───────────────────────────────────────────────
    function buildShadow(a) {
        if (!a.showShadow) return 'none';
        return a.shadowH + 'px ' + a.shadowV + 'px ' + a.shadowBlur + 'px ' + a.shadowSpread + 'px ' + a.shadowColor;
    }

    // ── Build wrapper inline style ───────────────────────────────────────────────
    function buildWrapStyle(a) {
        return {
            height: a.mapHeight + 'px',
            borderRadius: a.borderRadius + 'px',
            overflow: 'hidden',
            border: a.showBorder ? (a.borderWidth + 'px ' + a.borderStyle + ' ' + a.borderColor) : 'none',
            boxShadow: buildShadow(a),
            maxWidth: a.maxWidth > 0 ? a.maxWidth + 'px' : '100%',
            margin: '0 auto'
        };
    }

    // ────────────────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/google-map', {
        title: __('Google Map', 'blockenberg'),
        icon: 'location-alt',
        category: 'bkbg-business',

        edit: function (props) {
            var a             = props.attributes;
            var setAttributes = props.setAttributes;

            // Color picker popover state
            var openColorKeyState = useState(null);
            var openColorKey      = openColorKeyState[0];
            var setOpenColorKey   = openColorKeyState[1];
            var renderColorControl = makeColorControl(openColorKey, setOpenColorKey);

            // ── Options ───────────────────────────────────────────────────────
            var mapTypeOptions = [
                { label: __('Roadmap (default)', 'blockenberg'), value: 'roadmap' },
                { label: __('Satellite', 'blockenberg'),          value: 'satellite' },
                { label: __('Hybrid (satellite + labels)', 'blockenberg'), value: 'hybrid' },
                { label: __('Terrain', 'blockenberg'),            value: 'terrain' }
            ];
            var borderStyleOptions = [
                { label: __('Solid',  'blockenberg'), value: 'solid'  },
                { label: __('Dashed', 'blockenberg'), value: 'dashed' },
                { label: __('Dotted', 'blockenberg'), value: 'dotted' }
            ];
            var textAlignOptions = [
                { label: __('Left',   'blockenberg'), value: 'left'   },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right',  'blockenberg'), value: 'right'  }
            ];
            var fontWeightOptions = [
                { label: '300 — Light',      value: 300 },
                { label: '400 — Regular',    value: 400 },
                { label: '500 — Medium',     value: 500 },
                { label: '600 — Semi Bold',  value: 600 },
                { label: '700 — Bold',       value: 700 }
            ];

            var embedUrl  = buildEmbedUrl(a);
            var wrapStyle = buildWrapStyle(a);

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Map Settings ──────────────────────────────────────────────
                el(PanelBody, { title: __('Map Settings', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label:    __('Address or Place Name', 'blockenberg'),
                        help:     __('Any address, city, landmark, or coordinates.', 'blockenberg'),
                        value:    a.address,
                        onChange: function (v) { setAttributes({ address: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Zoom Level', 'blockenberg'),
                        help:     __('1 = world, 14 = street, 20 = building', 'blockenberg'),
                        value:    a.zoom, min: 1, max: 21,
                        onChange: function (v) { setAttributes({ zoom: v }); }
                    }),
                    el(SelectControl, {
                        label:    __('Map Type', 'blockenberg'),
                        value:    a.mapType,
                        options:  mapTypeOptions,
                        onChange: function (v) { setAttributes({ mapType: v }); }
                    }),
                    el('hr', {}),
                    el(ToggleControl, {
                        label:    __('Allow fullscreen', 'blockenberg'),
                        checked:  a.allowFullscreen,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ allowFullscreen: v }); }
                    }),
                    el(ToggleControl, {
                        label:    __('Lazy-load iframe', 'blockenberg'),
                        help:     __('Defers loading until the map is near the viewport.', 'blockenberg'),
                        checked:  a.lazyLoad,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ lazyLoad: v }); }
                    }),
                    el('hr', {}),
                    el(TextControl, {
                        label:    __('Google Maps API Key (optional)', 'blockenberg'),
                        help:     __('Required for satellite/terrain/hybrid types and precise zoom. Leave empty for basic embed.', 'blockenberg'),
                        value:    a.apiKey,
                        type:     'password',
                        onChange: function (v) { setAttributes({ apiKey: v }); }
                    })
                ),

                // ── Dimensions ────────────────────────────────────────────────
                el(PanelBody, { title: __('Dimensions', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label:    __('Map Height (px)', 'blockenberg'),
                        value:    a.mapHeight, min: 150, max: 900,
                        onChange: function (v) { setAttributes({ mapHeight: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Max Width (px, 0 = full)', 'blockenberg'),
                        help:     __('Set a max-width and the map will be centered.', 'blockenberg'),
                        value:    a.maxWidth, min: 0, max: 1600, step: 10,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        label:    __('Corner Radius (px)', 'blockenberg'),
                        value:    a.borderRadius, min: 0, max: 48,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    })
                ),

                // ── Border & Shadow ───────────────────────────────────────────
                el(PanelBody, { title: __('Border & Shadow', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Show Border', 'blockenberg'),
                        checked:  a.showBorder,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showBorder: v }); }
                    }),
                    a.showBorder && el(Fragment, {},
                        renderColorControl('borderColor', __('Border Color', 'blockenberg'), a.borderColor, function (c) { setAttributes({ borderColor: c }); }),
                        el(RangeControl, {
                            label:    __('Border Width (px)', 'blockenberg'),
                            value:    a.borderWidth, min: 1, max: 12,
                            onChange: function (v) { setAttributes({ borderWidth: v }); }
                        }),
                        el(SelectControl, {
                            label:    __('Border Style', 'blockenberg'),
                            value:    a.borderStyle,
                            options:  borderStyleOptions,
                            onChange: function (v) { setAttributes({ borderStyle: v }); }
                        })
                    ),
                    el('hr', {}),
                    el(ToggleControl, {
                        label:    __('Show Shadow', 'blockenberg'),
                        checked:  a.showShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showShadow: v }); }
                    }),
                    a.showShadow && el(Fragment, {},
                        renderColorControl('shadowColor', __('Shadow Color', 'blockenberg'), a.shadowColor, function (c) { setAttributes({ shadowColor: c }); }),
                        el(RangeControl, { label: __('Horizontal (px)', 'blockenberg'), value: a.shadowH,      min: -60, max: 60, onChange: function (v) { setAttributes({ shadowH:      v }); } }),
                        el(RangeControl, { label: __('Vertical (px)',   'blockenberg'), value: a.shadowV,      min: -60, max: 60, onChange: function (v) { setAttributes({ shadowV:      v }); } }),
                        el(RangeControl, { label: __('Blur (px)',       'blockenberg'), value: a.shadowBlur,   min: 0,   max: 80, onChange: function (v) { setAttributes({ shadowBlur:   v }); } }),
                        el(RangeControl, { label: __('Spread (px)',     'blockenberg'), value: a.shadowSpread, min: -20, max: 40, onChange: function (v) { setAttributes({ shadowSpread: v }); } })
                    )
                ),

                // ── Caption ───────────────────────────────────────────────────
                el(PanelBody, { title: __('Caption', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label:    __('Show Caption', 'blockenberg'),
                        checked:  a.showCaption,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCaption: v }); }
                    }),
                    ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    a.showCaption && el(Fragment, {},
                                            _tc()({ label: __('Caption', 'blockenberg'), value: a.typoCaption, onChange: function (v) { setAttributes({ typoCaption: v }); } }),
                                            renderColorControl('captionColor', __('Text Color', 'blockenberg'), a.captionColor, function (c) { setAttributes({ captionColor: c }); }),
                                            el(SelectControl, {
                                                label:    __('Alignment', 'blockenberg'),
                                                value:    a.captionAlign,
                                                options:  textAlignOptions,
                                                onChange: function (v) { setAttributes({ captionAlign: v }); }
                                            }),
                                            el(RangeControl, {
                                                label:    __('Spacing Above (px)', 'blockenberg'),
                                                value:    a.captionSpacing, min: 0, max: 40,
                                                onChange: function (v) { setAttributes({ captionSpacing: v }); }
                                            })
                                        )
                )
            );

            // ── Editor preview ────────────────────────────────────────────────
            return el(Fragment, {},
                inspector,
                el('div', useBlockProps({ className: 'bkbg-gm-outer', style: Object.assign({}, _tv()(a.typoCaption, '--bkbg-gm-cap-')) }),
                    el('div', { className: 'bkbg-gm-wrap', style: wrapStyle },
                        el('iframe', {
                            src:             embedUrl,
                            width:           '100%',
                            height:          '100%',
                            style:           { border: 'none', display: 'block' },
                            allowFullScreen: a.allowFullscreen,
                            loading:         a.lazyLoad ? 'lazy' : 'eager',
                            referrerPolicy:  'no-referrer-when-downgrade',
                            title:           a.address || 'Google Map'
                        })
                    ),
                    a.showCaption && el(RichText, {
                        tagName:        'p',
                        className:      'bkbg-gm-caption',
                        value:          a.caption,
                        placeholder:    __('Caption text…', 'blockenberg'),
                        onChange:       function (v) { setAttributes({ caption: v }); },
                        allowedFormats: ['core/bold', 'core/italic', 'core/link'],
                        style: {
                            color:      a.captionColor,
                            textAlign:  a.captionAlign,
                            marginTop:  a.captionSpacing + 'px',
                            marginBottom: 0,
                            padding: 0
                        }
                    })
                )
            );
        },

        // ── Save ────────────────────────────────────────────────────────────────
        save: function (props) {
            var a             = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;
            var embedUrl      = buildEmbedUrl(a);
            var wrapStyle     = buildWrapStyle(a);

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-gm-outer', style: Object.assign({}, _tv()(a.typoCaption, '--bkbg-gm-cap-')) }),
                el('div', { className: 'bkbg-gm-wrap', style: wrapStyle },
                    el('iframe', {
                        src:             embedUrl,
                        width:           '100%',
                        height:          '100%',
                        style:           { border: 'none', display: 'block' },
                        allowFullScreen: a.allowFullscreen ? true : undefined,
                        loading:         a.lazyLoad ? 'lazy' : 'eager',
                        referrerPolicy:  'no-referrer-when-downgrade',
                        title:           a.address || 'Google Map'
                    })
                ),
                a.showCaption && el(RichTextContent, {
                    tagName:   'p',
                    className: 'bkbg-gm-caption',
                    value:     a.caption,
                    style: {
                        color:        a.captionColor,
                        textAlign:    a.captionAlign,
                        marginTop:    a.captionSpacing + 'px',
                        marginBottom: 0,
                        padding: 0
                    }
                })
            );
        }
    });
}() );
