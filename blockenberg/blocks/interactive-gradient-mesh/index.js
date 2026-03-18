( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var ColorPicker        = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var BLEND_MODES = ['screen','multiply','lighten','overlay','color-dodge','hard-light'].map(function (v) {
        return { label: v, value: v };
    });

    /* Color row for editing the mesh colors array */
    function ColorRow(props) {
        var colors  = props.colors;
        var onChange = props.onChange;
        var st = useState(-1); var openIdx = st[0]; var setOpenIdx = st[1];

        function update(idx, val) {
            var next = colors.slice();
            next[idx] = val;
            onChange(next);
        }
        function addColor() { onChange(colors.concat(['#a855f7'])); }
        function removeColor(idx) {
            if (colors.length <= 2) return;
            onChange(colors.filter(function (_, i) { return i !== idx; }));
        }

        return el('div', {},
            el('p', { style: { margin: '0 0 6px', fontWeight: 600, fontSize: 12 } }, __('Mesh Colors')),
            colors.map(function (c, idx) {
                return el('div', { key: idx, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', position: 'relative' }},
                    el('button', { type: 'button',
                        style: { width: 36, height: 36, border: '1px solid #ccc', padding: 0, cursor: 'pointer', borderRadius: 4, background: c, flexShrink: 0 },
                        onClick: function () { setOpenIdx(openIdx === idx ? -1 : idx); }
                    }),
                    el('span', { style: { flex: 1, fontSize: '12px', fontFamily: 'monospace', color: '#555' } }, c),
                    colors.length > 2 && el(Button, { isDestructive: true, size: 'small',
                        onClick: function () { removeColor(idx); }
                    }, '✕'),
                    openIdx === idx && el(Popover, { onClose: function () { setOpenIdx(-1); } },
                        el('div', { style: { padding: '8px' } },
                            el(ColorPicker, { color: c, enableAlpha: true, onChange: function (v) { update(idx, v); } })
                        )
                    )
                );
            }),
            el(Button, { variant: 'secondary', onClick: addColor,
                style: { width: '100%', marginTop: 4 }
            }, __('+ Add Color'))
        );
    }

    registerBlockType('blockenberg/interactive-gradient-mesh', {
        title:    __('Interactive Gradient Mesh'),
        icon:     'art',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps((function () {
                var s = {};
                var _tv = getTypoCssVars();
                Object.assign(s, _tv(attr.headingTypo, '--bkbg-igm-h-'));
                Object.assign(s, _tv(attr.subheadingTypo, '--bkbg-igm-sh-'));
                return { className: 'bkbg-igm-wrap', style: s };
            })());

            var inspector = el(InspectorControls, {},
                /* Mesh */
                el(PanelBody, { title: __('Mesh'), initialOpen: true },
                    el(ColorRow, { colors: attr.colors,
                        onChange: function (v) { setAttr({ colors: v }); }
                    }),
                    el(RangeControl, { label: __('Blob Count'), value: attr.blobCount,
                        min: 2, max: 10,
                        onChange: function (v) { setAttr({ blobCount: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Blob Size (% of container)'), value: attr.blobSize,
                        min: 20, max: 100,
                        onChange: function (v) { setAttr({ blobSize: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Blur Amount (px)'), value: attr.blurAmount,
                        min: 20, max: 200,
                        onChange: function (v) { setAttr({ blurAmount: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Blend Mode'), value: attr.blendMode,
                        options: BLEND_MODES,
                        onChange: function (v) { setAttr({ blendMode: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Mouse Influence (px)'), value: attr.mouseInfluence,
                        min: 0, max: 100,
                        onChange: function (v) { setAttr({ mouseInfluence: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Auto Animate'), checked: attr.autoAnimate,
                        onChange: function (v) { setAttr({ autoAnimate: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Animate Speed'), value: attr.animateSpeed,
                        min: 0.1, max: 3, step: 0.1,
                        onChange: function (v) { setAttr({ animateSpeed: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Container */
                el(PanelBody, { title: __('Container'), initialOpen: false },
                    el(RangeControl, { label: __('Height (px)'), value: attr.height,
                        min: 120, max: 900, step: 20,
                        onChange: function (v) { setAttr({ height: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Base BG (pick via color panel)'), value: 0,
                        min: 0, max: 0, onChange: function () {},
                        __nextHasNoMarginBottom: true
                    })
                ),

                /* Content */
                el(PanelBody, { title: __('Content Overlay'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Content'), checked: attr.showContent,
                        onChange: function (v) { setAttr({ showContent: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Heading'), value: attr.heading,
                        onChange: function (v) { setAttr({ heading: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Subheading'), value: attr.subheading,
                        onChange: function (v) { setAttr({ subheading: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('CTA Button Text'), value: attr.ctaText,
                        onChange: function (v) { setAttr({ ctaText: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('CTA URL'), value: attr.ctaUrl,
                        onChange: function (v) { setAttr({ ctaUrl: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('CTA Radius (px)'), value: attr.ctaRadius,
                        min: 0, max: 100,
                        onChange: function (v) { setAttr({ ctaRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Content Align'), value: attr.contentAlign,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ],
                        onChange: function (v) { setAttr({ contentAlign: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypographyControl() && el(getTypographyControl(), { label: __('Heading'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Subheading'), value: attr.subheadingTypo, onChange: function (v) { setAttr({ subheadingTypo: v }); } }),
                    el(RangeControl, { label: __('CTA Size (px)', 'blockenberg'), value: attr.ctaSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { setAttr({ ctaSize: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Base BG'), value: attr.baseBg,
                          onChange: function (v) { setAttr({ baseBg: v || '#0f172a' }); } },
                        { label: __('Heading'), value: attr.headingColor,
                          onChange: function (v) { setAttr({ headingColor: v || '#ffffff' }); } },
                        { label: __('Subheading'), value: attr.subheadingColor,
                          onChange: function (v) { setAttr({ subheadingColor: v }); } },
                        { label: __('CTA BG'), value: attr.ctaBg,
                          onChange: function (v) { setAttr({ ctaBg: v || '#ffffff' }); } },
                        { label: __('CTA Text'), value: attr.ctaColor,
                          onChange: function (v) { setAttr({ ctaColor: v || '#0f172a' }); } }
                    ]
                })
            );

            /* Editor preview */
            var gradients = attr.colors.map(function (c, i) {
                var pos = ((i / attr.colors.length) * 100);
                var pos2 = (((i + 1) / attr.colors.length) * 100);
                return 'radial-gradient(ellipse at ' + pos + '% ' + pos2 + '%, ' + c + ' 0%, transparent 70%)';
            });

            var previewBg = attr.baseBg + '; background-image: ' + gradients.join(', ');

            return el(Fragment, {}, inspector,
                el('div', bp,
                    el('div', {
                        style: {
                            height: attr.height + 'px',
                            background: attr.baseBg,
                            backgroundImage: gradients.join(', '),
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: attr.contentAlign === 'center' ? 'center' : attr.contentAlign === 'right' ? 'flex-end' : 'flex-start',
                            padding: '40px 48px'
                        }
                    },
                        attr.showContent && el('div', {
                            className: 'bkbg-igm-inner',
                            style: {
                                textAlign: attr.contentAlign,
                                position: 'relative', zIndex: 2
                            }
                        },
                            el('h2', { className: 'bkbg-igm-heading', style: {
                                color: attr.headingColor, margin: '0 0 16px'
                            }}, attr.heading),
                            el('p', { className: 'bkbg-igm-subheading', style: {
                                color: attr.subheadingColor, margin: '0 0 24px'
                            }}, attr.subheading),
                            attr.ctaText && el('a', { href: '#', style: {
                                display: 'inline-block',
                                background: attr.ctaBg, color: attr.ctaColor,
                                padding: '12px 28px',
                                borderRadius: attr.ctaRadius + 'px',
                                fontWeight: 700, textDecoration: 'none', fontSize: (attr.ctaSize || 15)
                            }}, attr.ctaText)
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            return el('div', bp,
                el('div', { className: 'bkbg-igm-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
