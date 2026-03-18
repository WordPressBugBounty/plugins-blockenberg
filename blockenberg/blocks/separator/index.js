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

    var _TC, _tv;
    function getTC() { return _TC || (_TC = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── SVG icon paths (24×24 viewBox) ──────────────────────────────────────────
    var ICONS = {
        star:      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        heart:     'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
        diamond:   'M12 2l9 10-9 10L3 12z',
        bolt:      'M13 2L4.5 13.5H11L10 22l9.5-12H13z',
        moon:      'M12 3a9 9 0 0 0 0 18 9 9 0 0 0 7.13-14.47A7 7 0 0 1 12 3z',
        star8:     'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
        cross:     'M19 11H13V5h-2v6H5v2h6v6h2v-6h6z',
        leaf:      'M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22 7 19.46c.61.34 1.3.54 2 .54 9 0 12-8 12-8s-3.5.5-5.5-2.5S17 8 17 8z',
        snowflake: 'M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z',
        circle:    null // handled separately with <circle> element
    };

    // ── Generate unique block ID ─────────────────────────────────────────────────
    function generateId() {
        return 'sep' + Math.random().toString(36).substr(2, 8);
    }

    // ── Build icon SVG element ───────────────────────────────────────────────────
    function buildIconSVG(iconName, iconColor, iconSize) {
        var isCircle = iconName === 'circle';
        var shape = isCircle
            ? el('circle', { cx: '12', cy: '12', r: '10', fill: iconColor })
            : el('path', { d: ICONS[iconName] || ICONS.star, fill: iconColor });
        return el('svg', {
            viewBox: '0 0 24 24',
            xmlns: 'http://www.w3.org/2000/svg',
            width: iconSize,
            height: iconSize,
            'aria-hidden': 'true',
            style: { display: 'block', flexShrink: 0 }
        }, shape);
    }

    // ── Build wave path string ───────────────────────────────────────────────────
    function buildWavePath(svgH) {
        var mid = svgH / 2;
        var amp = Math.max(1, mid - 2);
        return 'M0,' + mid
            + ' C100,' + (mid - amp) + ' 200,' + (mid + amp) + ' 300,' + mid
            + ' C400,' + (mid - amp) + ' 500,' + (mid + amp) + ' 600,' + mid
            + ' C700,' + (mid - amp) + ' 800,' + (mid + amp) + ' 900,' + mid
            + ' C1000,' + (mid - amp) + ' 1100,' + (mid + amp) + ' 1200,' + mid;
    }

    // ── Build zigzag path string ─────────────────────────────────────────────────
    function buildZigzagPath(svgH) {
        var mid = svgH / 2;
        var amp = Math.max(1, mid - 2);
        var d = 'M0,' + mid;
        for (var i = 1; i <= 20; i++) {
            d += ' L' + (i * 60) + ',' + (i % 2 === 1 ? (mid - amp) : (mid + amp));
        }
        d += ' L1200,' + mid;
        return d;
    }

    // ── Scallop: repeated arcs pointing up (fish-scale / petal pattern) ──────────
    function buildScallopPath(svgH) {
        var d = 'M0,' + svgH;
        for (var i = 0; i < 20; i++) {
            var x1 = i * 60 + 30;
            var x2 = (i + 1) * 60;
            d += ' Q' + x1 + ',0 ' + x2 + ',' + svgH;
        }
        return d;
    }

    // ── Arrows: open right-pointing chevrons >>>> ────────────────────────────────
    function buildArrowsPath(svgH) {
        var mid = svgH / 2;
        var amp = Math.max(2, mid - 2);
        // Each chevron: 24px wide, 55px pitch → 22 chevrons across 1200px
        var d = '';
        for (var i = 0; i < 22; i++) {
            var x = i * 55 + 3;
            d += (d ? ' ' : '') + 'M' + x + ',' + (mid - amp)
                + ' L' + (x + 24) + ',' + mid
                + ' L' + x + ',' + (mid + amp);
        }
        return d;
    }

    // ── Brush: organic calligraphy-style stroke ───────────────────────────────────
    function buildBrushPath(svgH) {
        var mid = svgH / 2;
        var amp = mid * 0.85;
        return 'M0,' + mid
            + ' C60,'  + (mid - amp * 0.9) + ' 110,' + (mid + amp * 0.5)  + ' 170,' + (mid - amp * 0.15)
            + ' C230,' + (mid + amp * 0.8) + ' 280,' + (mid - amp * 0.6)  + ' 340,' + (mid + amp * 0.3)
            + ' C400,' + (mid - amp * 0.4) + ' 450,' + (mid + amp * 0.75) + ' 510,' + (mid - amp * 0.1)
            + ' C570,' + (mid - amp * 0.7) + ' 620,' + (mid + amp * 0.55) + ' 680,' + (mid + amp * 0.2)
            + ' C740,' + (mid - amp * 0.85)+ ' 790,' + (mid - amp * 0.3)  + ' 850,' + (mid + amp * 0.65)
            + ' C910,' + (mid + amp * 0.4) + ' 960,' + (mid - amp * 0.8)  + ' 1020,'+ (mid - amp * 0.05)
            + ' C1080,'+ (mid + amp * 0.6) + ' 1130,'+ (mid - amp * 0.45) + ' 1200,'+ mid;
    }

    // ── Heartbeat / EKG ──────────────────────────────────────────────────────────
    function buildHeartbeatPath(svgH) {
        var mid = svgH / 2;
        var amp = Math.max(3, svgH * 0.46);
        // Period = 200px, 6 full cycles in 1200px
        var d = 'M0,' + mid;
        for (var i = 0; i < 6; i++) {
            var o = i * 200; // offset
            d += ' L'+(o+25)+','+mid                        // flat
               + ' L'+(o+35)+','+(mid - amp*0.28)           // P-wave up
               + ' L'+(o+45)+','+mid                        // baseline
               + ' L'+(o+58)+','+(mid + amp*0.18)           // Q dip
               + ' L'+(o+68)+','+(mid - amp)                // R spike (tall)
               + ' L'+(o+80)+','+(mid + amp*0.55)           // S dip below
               + ' L'+(o+95)+','+mid                        // baseline
               + ' L'+(o+110)+','+(mid - amp*0.22)          // T-wave bump
               + ' L'+(o+130)+','+mid;                      // flat exit
        }
        d += ' L1200,' + mid;
        return d;
    }

    // ── Build one line segment ───────────────────────────────────────────────────
    // side: 'l' | 'r' | 'full'
    // flexValue: CSS flex shorthand string
    var SVG_TYPES = ['wave', 'zigzag', 'scallop', 'arrows', 'brush', 'heartbeat'];

    function buildLineSeg(a, side, flexValue) {
        var type      = a.dividerType;
        var segStyle  = { flex: flexValue || '1', minWidth: 0 };
        var isSvgType = SVG_TYPES.indexOf(type) !== -1;

        var svgEl = null;
        if (isSvgType) {
            var d;
            if      (type === 'wave')      { d = buildWavePath(a.svgHeight); }
            else if (type === 'zigzag')    { d = buildZigzagPath(a.svgHeight); }
            else if (type === 'scallop')   { d = buildScallopPath(a.svgHeight); }
            else if (type === 'arrows')    { d = buildArrowsPath(a.svgHeight); }
            else if (type === 'brush')     { d = buildBrushPath(a.svgHeight); }
            else                           { d = buildHeartbeatPath(a.svgHeight); }
            svgEl = el('svg', {
                viewBox: '0 0 1200 ' + a.svgHeight,
                preserveAspectRatio: 'none',
                xmlns: 'http://www.w3.org/2000/svg',
                width: '100%',
                height: a.svgHeight,
                style: { display: 'block', overflow: 'visible' }
            }, el('path', {
                d: d,
                fill: 'none',
                stroke: a.lineColor,
                strokeWidth: a.lineThickness,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
            }));
        }

        if (isSvgType) {
            Object.assign(segStyle, { display: 'block', overflow: 'hidden' });
        }

        return el('span', {
            key: 'seg-' + side,
            className: 'bkbg-div-seg bkbg-div-seg--' + side,
            'aria-hidden': 'true',
            style: segStyle
        }, svgEl);
    }

    // ── Build middle element (icon or text) ────────────────────────────────────
    // In edit mode, text uses RichText; in save mode, caller passes a pre-built element.
    function buildIconMiddle(a) {
        var iconSvg = buildIconSVG(a.iconName, a.iconColor, a.iconSize);
        var hasBg = a.iconBgShape !== 'none';

        if (!hasBg) {
            return el('span', {
                className: 'bkbg-div-mid-icon',
                'aria-hidden': 'true'
            }, iconSvg);
        }

        var radius = a.iconBgShape === 'circle' ? '50%' : '8px';
        return el('span', {
            className: 'bkbg-div-mid-icon bkbg-div-mid-icon--bg',
            'aria-hidden': 'true',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: a.iconBgSize + 'px',
                height: a.iconBgSize + 'px',
                borderRadius: radius,
                background: a.iconBgColor,
                flexShrink: 0
            }
        }, iconSvg);
    }

    // ── CSS vars for wrapper ─────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        return {
            '--bkbg-div-color':       a.lineColor,
            '--bkbg-div-thickness':   a.lineThickness + 'px',
            '--bkbg-div-svgh':        a.svgHeight + 'px',
            '--bkbg-div-dot-spacing': a.dotSpacing + 'px',
            '--bkbg-div-gap':         a.gapAroundMiddle + 'px',
            '--bkbg-div-width':       a.widthPercent + '%',
            '--bkbg-div-mt':          a.marginTop + 'px',
            '--bkbg-div-mb':          a.marginBottom + 'px',
            '--bkbg-div-text-size':   a.textSize + 'px',
            '--bkbg-div-text-weight': a.textWeight,
            '--bkbg-div-text-color':  a.textColor,
            '--bkbg-div-text-bg':     a.textBgColor,
            '--bkbg-div-text-ph':     a.textPaddingH + 'px',
            '--bkbg-div-text-pv':     a.textPaddingV + 'px',
            '--bkbg-div-text-radius': a.textRadius + 'px'
        };
    }

    registerBlockType('blockenberg/separator', {
        title: __('Separator / Divider', 'blockenberg'),
        icon: 'minus',
        category: 'bkbg-layout',
        description: __('Decorative divider: line, wave, zigzag or dot pattern — optionally with an icon or text in the centre.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            // ── Generate blockId on first mount ──────────────────────────────
            useEffect(function () {
                if (!a.blockId) { setAttributes({ blockId: generateId() }); }
            }, []);

            // ── Color picker state (one open at a time) ───────────────────────
            var openColorKeyState = useState(null);
            var openColorKey      = openColorKeyState[0];
            var setOpenColorKey   = openColorKeyState[1];

            // ── Alpha-enabled color control ───────────────────────────────────
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

            // ── Option lists ──────────────────────────────────────────────────
            var dividerTypeOptions = [
                { label: __('Line',      'blockenberg'), value: 'line'      },
                { label: __('Dashed',    'blockenberg'), value: 'dashed'    },
                { label: __('Dotted',    'blockenberg'), value: 'dotted'    },
                { label: __('Double',    'blockenberg'), value: 'double'    },
                { label: __('Triple',    'blockenberg'), value: 'triple'    },
                { label: __('Gradient',  'blockenberg'), value: 'gradient'  },
                { label: __('Dots',      'blockenberg'), value: 'dots'      },
                { label: __('Wave',      'blockenberg'), value: 'wave'      },
                { label: __('Zigzag',    'blockenberg'), value: 'zigzag'    },
                { label: __('Scallop',   'blockenberg'), value: 'scallop'   },
                { label: __('Arrows',    'blockenberg'), value: 'arrows'    },
                { label: __('Brush',     'blockenberg'), value: 'brush'     },
                { label: __('Heartbeat', 'blockenberg'), value: 'heartbeat' }
            ];

            var middleTypeOptions = [
                { label: __('None',  'blockenberg'), value: 'none' },
                { label: __('Icon',  'blockenberg'), value: 'icon' },
                { label: __('Text',  'blockenberg'), value: 'text' }
            ];

            var middlePosOptions = [
                { label: __('Left',   'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right',  'blockenberg'), value: 'right' }
            ];

            var iconOptions = [
                { label: __('Star',      'blockenberg'), value: 'star' },
                { label: __('Heart',     'blockenberg'), value: 'heart' },
                { label: __('Diamond',   'blockenberg'), value: 'diamond' },
                { label: __('Bolt',      'blockenberg'), value: 'bolt' },
                { label: __('Moon',      'blockenberg'), value: 'moon' },
                { label: __('8-Point Star', 'blockenberg'), value: 'star8' },
                { label: __('Cross (+)', 'blockenberg'), value: 'cross' },
                { label: __('Leaf',      'blockenberg'), value: 'leaf' },
                { label: __('Snowflake', 'blockenberg'), value: 'snowflake' },
                { label: __('Circle',    'blockenberg'), value: 'circle' }
            ];

            var iconBgShapeOptions = [
                { label: __('None',   'blockenberg'), value: 'none' },
                { label: __('Circle', 'blockenberg'), value: 'circle' },
                { label: __('Square', 'blockenberg'), value: 'square' }
            ];

            var fontWeightOptions = [
                { label: '300 — Light',      value: 300 },
                { label: '400 — Regular',    value: 400 },
                { label: '500 — Medium',     value: 500 },
                { label: '600 — Semi Bold',  value: 600 },
                { label: '700 — Bold',       value: 700 },
                { label: '800 — Extra Bold', value: 800 }
            ];

            var isSvgType  = SVG_TYPES.indexOf(a.dividerType) !== -1;
            var isDotsType = a.dividerType === 'dots';
            var hasMiddle  = a.middleType !== 'none';

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Divider ───────────────────────────────────────────────────
                el(PanelBody, { title: __('Divider', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Type', 'blockenberg'),
                        value: a.dividerType,
                        options: dividerTypeOptions,
                        onChange: function (v) { setAttributes({ dividerType: v }); }
                    }),
                    el(RangeControl, {
                        label: isSvgType
                            ? __('Stroke Width (px)', 'blockenberg')
                            : (isDotsType ? __('Dot Radius (px)', 'blockenberg') : __('Thickness (px)', 'blockenberg')),
                        value: a.lineThickness,
                        min: 1,
                        max: isSvgType ? 8 : 12,
                        onChange: function (v) { setAttributes({ lineThickness: v }); }
                    }),
                    (isSvgType || isDotsType) && el(RangeControl, {
                        label: isSvgType
                            ? __('Height (px)', 'blockenberg')
                            : __('Row Height (px)', 'blockenberg'),
                        value: a.svgHeight,
                        min: 8,
                        max: 80,
                        onChange: function (v) { setAttributes({ svgHeight: v }); }
                    }),
                    isDotsType && el(RangeControl, {
                        label: __('Dot Spacing (px)', 'blockenberg'),
                        value: a.dotSpacing,
                        min: 4,
                        max: 60,
                        onChange: function (v) { setAttributes({ dotSpacing: v }); }
                    })
                ),

                // ── Layout ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Width (%)', 'blockenberg'),
                        value: a.widthPercent,
                        min: 10,
                        max: 100,
                        onChange: function (v) { setAttributes({ widthPercent: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Margin Top (px)', 'blockenberg'),
                        value: a.marginTop,
                        min: 0,
                        max: 120,
                        onChange: function (v) { setAttributes({ marginTop: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Margin Bottom (px)', 'blockenberg'),
                        value: a.marginBottom,
                        min: 0,
                        max: 120,
                        onChange: function (v) { setAttributes({ marginBottom: v }); }
                    })
                ),

                // ── Centrepiece ───────────────────────────────────────────────
                el(PanelBody, { title: __('Centrepiece', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Centrepiece', 'blockenberg'),
                        value: a.middleType,
                        options: middleTypeOptions,
                        onChange: function (v) { setAttributes({ middleType: v }); }
                    }),

                    hasMiddle && el(Fragment, {},
                        el(SelectControl, {
                            label: __('Position', 'blockenberg'),
                            value: a.middlePosition,
                            options: middlePosOptions,
                            onChange: function (v) { setAttributes({ middlePosition: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Gap around centrepiece (px)', 'blockenberg'),
                            value: a.gapAroundMiddle,
                            min: 0,
                            max: 60,
                            onChange: function (v) { setAttributes({ gapAroundMiddle: v }); }
                        }),

                        // Icon-specific controls
                        a.middleType === 'icon' && el(Fragment, {},
                            el('hr', {}),
                            el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                                __('Icon', 'blockenberg')
                            ),
                            el(SelectControl, {
                                label: __('Icon', 'blockenberg'),
                                value: a.iconName,
                                options: iconOptions,
                                onChange: function (v) { setAttributes({ iconName: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Icon Size (px)', 'blockenberg'),
                                value: a.iconSize,
                                min: 12,
                                max: 80,
                                onChange: function (v) { setAttributes({ iconSize: v }); }
                            }),
                            el('hr', {}),
                            el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                                __('Icon Background', 'blockenberg')
                            ),
                            el(SelectControl, {
                                label: __('Shape', 'blockenberg'),
                                value: a.iconBgShape,
                                options: iconBgShapeOptions,
                                onChange: function (v) { setAttributes({ iconBgShape: v }); }
                            }),
                            a.iconBgShape !== 'none' && el(RangeControl, {
                                label: __('Background Size (px)', 'blockenberg'),
                                value: a.iconBgSize,
                                min: a.iconSize,
                                max: 120,
                                onChange: function (v) { setAttributes({ iconBgSize: v }); }
                            })
                        ),

                        // Text-specific controls
                        a.middleType === 'text' && el(Fragment, {},
                            el('hr', {}),
                            el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                                __('Text Style', 'blockenberg')
                            ),
                            el(RangeControl, {
                                label: __('Padding Horizontal (px)', 'blockenberg'),
                                value: a.textPaddingH,
                                min: 0,
                                max: 48,
                                onChange: function (v) { setAttributes({ textPaddingH: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Padding Vertical (px)', 'blockenberg'),
                                value: a.textPaddingV,
                                min: 0,
                                max: 32,
                                onChange: function (v) { setAttributes({ textPaddingV: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Border Radius (px)', 'blockenberg'),
                                value: a.textRadius,
                                min: 0,
                                max: 50,
                                onChange: function (v) { setAttributes({ textRadius: v }); }
                            })
                        )
                    )
                ),

                // ── Colors ────────────────────────────────────────────────────
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                        __('Line', 'blockenberg')
                    ),
                    renderColorControl('lineColor', __('Line / stroke color', 'blockenberg'), a.lineColor,
                        function (c) { setAttributes({ lineColor: c }); }
                    ),

                    a.middleType === 'icon' && el(Fragment, {},
                        el('hr', {}),
                        el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                            __('Icon', 'blockenberg')
                        ),
                        renderColorControl('iconColor', __('Icon fill', 'blockenberg'), a.iconColor,
                            function (c) { setAttributes({ iconColor: c }); }
                        ),
                        a.iconBgShape !== 'none' && renderColorControl('iconBgColor', __('Icon background', 'blockenberg'), a.iconBgColor,
                            function (c) { setAttributes({ iconBgColor: c }); }
                        )
                    ),

                    a.middleType === 'text' && el(Fragment, {},
                        el('hr', {}),
                        el('p', { style: { margin: '4px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } },
                            __('Text', 'blockenberg')
                        ),
                        renderColorControl('textColor', __('Text color', 'blockenberg'), a.textColor,
                            function (c) { setAttributes({ textColor: c }); }
                        ),
                        renderColorControl('textBgColor', __('Text background', 'blockenberg'), a.textBgColor,
                            function (c) { setAttributes({ textBgColor: c }); }
                        )
                    )
                ),

                // ── Typography ───────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTC(), { label: __('Centrepiece Text', 'blockenberg'), value: a.textTypo, onChange: function (v) { setAttributes({ textTypo: v }); } })
                )
            );

            // ── Build line segments ───────────────────────────────────────────
            var segLFlex = !hasMiddle ? '1'
                : a.middlePosition === 'left'  ? '0 0 20px'
                : '1';
            var segRFlex = !hasMiddle ? '0 0 0px'
                : a.middlePosition === 'right' ? '0 0 20px'
                : '1';

            // When no middle: single full-width segment
            var segments;
            if (!hasMiddle) {
                segments = [buildLineSeg(a, 'full', '1')];
            } else {
                var leftSeg  = buildLineSeg(a, 'l', segLFlex);
                var rightSeg = buildLineSeg(a, 'r', segRFlex);

                var middleEl;
                if (a.middleType === 'icon') {
                    middleEl = el('span', { key: 'middle', className: 'bkbg-div-middle' },
                        buildIconMiddle(a)
                    );
                } else {
                    // text — RichText in edit
                    middleEl = el('span', { key: 'middle', className: 'bkbg-div-middle' },
                        el(RichText, {
                            tagName: 'span',
                            className: 'bkbg-div-mid-text',
                            value: a.middleText,
                            onChange: function (v) { setAttributes({ middleText: v }); },
                            placeholder: __('Text…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                        })
                    );
                }
                segments = [leftSeg, middleEl, rightSeg];
            }

            // ── Edit render ───────────────────────────────────────────────────
            var blockProps = useBlockProps((function () {
                var _tvFn = getTV();
                var s = {};
                Object.assign(s, _tvFn(a.textTypo, '--bkdv-tt-'));
                return {
                    className: 'bkbg-editor-wrap',
                    'data-block-label': 'Separator',
                    style: s
                };
            })());

            return el('div', blockProps,
                inspector,
                el('div', {
                    className: 'bkbg-div-outer',
                    style: { marginTop: a.marginTop + 'px', marginBottom: a.marginBottom + 'px' }
                },
                    el('div', Object.assign(
                        { className: 'bkbg-div-wrap', style: buildWrapStyle(a) },
                        { 'data-type': a.dividerType, 'data-middle': a.middleType }
                    ), segments)
                )
            );
        },

        deprecated: [{
            attributes: {"blockId":{"type":"string","default":""},"dividerType":{"type":"string","default":"line"},"lineColor":{"type":"string","default":"#d1d5db"},"lineThickness":{"type":"number","default":1},"svgHeight":{"type":"number","default":24},"dotSpacing":{"type":"number","default":14},"marginTop":{"type":"number","default":24},"marginBottom":{"type":"number","default":24},"widthPercent":{"type":"number","default":100},"middleType":{"type":"string","default":"none"},"middlePosition":{"type":"string","default":"center"},"gapAroundMiddle":{"type":"number","default":16},"iconName":{"type":"string","default":"star"},"iconSize":{"type":"number","default":20},"iconColor":{"type":"string","default":"#9ca3af"},"iconBgColor":{"type":"string","default":"transparent"},"iconBgShape":{"type":"string","default":"none"},"iconBgSize":{"type":"number","default":36},"middleText":{"type":"string","default":"§"},"textSize":{"type":"number","default":14},"textWeight":{"type":"number","default":400},"textColor":{"type":"string","default":"#9ca3af"},"textBgColor":{"type":"string","default":"transparent"},"textPaddingH":{"type":"number","default":12},"textPaddingV":{"type":"number","default":4},"textRadius":{"type":"number","default":4}},
            save: function (props) {
                var a = props.attributes;
                var RichTextContent = wp.blockEditor.RichText.Content;
                var hasMiddle = a.middleType !== 'none';
                var segLFlex  = !hasMiddle ? '1' : a.middlePosition === 'left'  ? '0 0 20px' : '1';
                var segRFlex  = !hasMiddle ? '0 0 0px' : a.middlePosition === 'right' ? '0 0 20px' : '1';
                var segments;
                if (!hasMiddle) {
                    segments = [buildLineSeg(a, 'full', '1')];
                } else {
                    var leftSeg  = buildLineSeg(a, 'l', segLFlex);
                    var rightSeg = buildLineSeg(a, 'r', segRFlex);
                    var middleEl;
                    if (a.middleType === 'icon') {
                        middleEl = el('span', { key: 'middle', className: 'bkbg-div-middle' }, buildIconMiddle(a));
                    } else {
                        middleEl = el('span', { key: 'middle', className: 'bkbg-div-middle' },
                            el(RichTextContent, { tagName: 'span', className: 'bkbg-div-mid-text', value: a.middleText })
                        );
                    }
                    segments = [leftSeg, middleEl, rightSeg];
                }
                return el('div', {
                    className: 'bkbg-div-outer',
                    style: { marginTop: a.marginTop + 'px', marginBottom: a.marginBottom + 'px' }
                },
                    el('div', Object.assign(
                        { className: 'bkbg-div-wrap', style: buildWrapStyle(a) },
                        { 'data-type': a.dividerType, 'data-middle': a.middleType }
                    ), segments)
                );
            }
        }],

        // ── Save ─────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            var hasMiddle = a.middleType !== 'none';
            var segLFlex  = !hasMiddle ? '1'
                : a.middlePosition === 'left'  ? '0 0 20px'
                : '1';
            var segRFlex  = !hasMiddle ? '0 0 0px'
                : a.middlePosition === 'right' ? '0 0 20px'
                : '1';

            var segments;
            if (!hasMiddle) {
                segments = [buildLineSeg(a, 'full', '1')];
            } else {
                var leftSeg  = buildLineSeg(a, 'l', segLFlex);
                var rightSeg = buildLineSeg(a, 'r', segRFlex);

                var middleEl;
                if (a.middleType === 'icon') {
                    middleEl = el('span', { key: 'middle', className: 'bkbg-div-middle' },
                        buildIconMiddle(a)
                    );
                } else {
                    // text: use RichText.Content
                    middleEl = el('span', { key: 'middle', className: 'bkbg-div-middle' },
                        el(RichTextContent, {
                            tagName: 'span',
                            className: 'bkbg-div-mid-text',
                            value: a.middleText
                        })
                    );
                }
                segments = [leftSeg, middleEl, rightSeg];
            }

            var wStyle = buildWrapStyle(a);
            var _tvFn = window.bkbgTypoCssVars;
            if (_tvFn) {
                Object.assign(wStyle, _tvFn(a.textTypo || {}, '--bkdv-tt-'));
            }

            return el('div', {
                className: 'bkbg-div-outer',
                style: { marginTop: a.marginTop + 'px', marginBottom: a.marginBottom + 'px' }
            },
                el('div', Object.assign(
                    { className: 'bkbg-div-wrap', style: wStyle },
                    { 'data-type': a.dividerType, 'data-middle': a.middleType }
                ), segments)
            );
        }
    });
}() );
