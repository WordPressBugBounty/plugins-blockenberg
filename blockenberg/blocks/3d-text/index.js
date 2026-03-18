( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var __                 = wp.i18n.__;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;

    /* ── lazy typography helpers ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    Object.defineProperty(window, '__bk3dt_tvf', { get: function () { delete window.__bk3dt_tvf; return (window.__bk3dt_tvf = window.bkbgTypoCssVars || function () { return {}; }); } });
    function getTypoCssVars(a) {
        return window.__bk3dt_tvf(a.textTypo || {}, '--bk3dt-tx-');
    }

    var STYLES_3D = [
        { label: 'Extrude (stacked shadow)',    value: 'extrude' },
        { label: 'Long shadow',                 value: 'longshadow' },
        { label: 'Retro (outline + shadow)',    value: 'retro' },
        { label: 'Isometric',                   value: 'isometric' },
        { label: 'Emboss',                      value: 'emboss' },
    ];
    var ANIMATIONS = [
        { label: 'None',      value: 'none' },
        { label: 'Float up/down', value: 'float' },
        { label: 'Pulse depth',   value: 'pulse' },
        { label: 'Shimmer',       value: 'shimmer' },
    ];
    var HOVERS = [
        { label: 'Tilt (3D rotate)', value: 'tilt' },
        { label: 'Press (depth collapse)', value: 'press' },
        { label: 'Lift (shadow grows)',    value: 'lift' },
        { label: 'None',                   value: 'none' },
    ];
    var TAGS = [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' }, { label: 'p',  value: 'p'  }, { label: 'div', value: 'div' },
    ];
    var WEIGHTS = [
        { label: '400 Regular', value: '400' }, { label: '600 Semi-Bold', value: '600' },
        { label: '700 Bold', value: '700' }, { label: '800 Extra-Bold', value: '800' },
        { label: '900 Black', value: '900' },
    ];
    var TRANSFORMS = [
        { label: 'UPPERCASE', value: 'uppercase' }, { label: 'lowercase', value: 'lowercase' },
        { label: 'Capitalize', value: 'capitalize' }, { label: 'None', value: 'none' },
    ];
    var ALIGNS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];

    /* build CSS text-shadow string for the 3D effect */
    function make3dShadow(a) {
        var depth    = a.depth   || 8;
        var angle    = (a.angle  || 45) * Math.PI / 180;
        var dx       = Math.cos(angle);
        var dy       = Math.sin(angle);
        var shadows  = [];

        if (a.style3d === 'extrude') {
            for (var i = 1; i <= depth; i++) {
                shadows.push((dx * i).toFixed(1) + 'px ' + (dy * i).toFixed(1) + 'px 0 ' + a.depthColor);
            }
            shadows.push((dx * depth + 4).toFixed(1) + 'px ' + (dy * depth + 6).toFixed(1) + 'px 8px ' + a.shadowColor);
        } else if (a.style3d === 'longshadow') {
            var steps = depth * 4;
            for (var i = 1; i <= steps; i++) {
                shadows.push(i + 'px ' + i + 'px 0 ' + a.depthColor);
            }
        } else if (a.style3d === 'retro') {
            for (var i = 1; i <= depth; i++) {
                shadows.push(i + 'px ' + i + 'px 0 ' + a.depthColor);
            }
            shadows.push('0 0 0 3px ' + a.depthColor);
            shadows.push((depth + 4) + 'px ' + (depth + 6) + 'px 10px ' + a.shadowColor);
        } else if (a.style3d === 'isometric') {
            for (var i = 1; i <= depth; i++) {
                shadows.push(i + 'px ' + Math.round(i * 0.5) + 'px 0 ' + a.depthColor);
            }
            shadows.push((depth + 3) + 'px ' + Math.round(depth * 0.5 + 4) + 'px 8px ' + a.shadowColor);
        } else if (a.style3d === 'emboss') {
            shadows.push('-1px -1px 2px rgba(255,255,255,0.3)');
            shadows.push('1px 1px 2px rgba(0,0,0,0.5)');
            for (var i = 1; i <= depth; i++) {
                shadows.push(i + 'px ' + i + 'px 0 ' + a.depthColor);
            }
        }
        return shadows.join(', ');
    }

    function buildTextStyle(a) {
        var ts = make3dShadow(a);
        var style = {
            textAlign: a.textAlign,
            textShadow: ts,
            margin: 0,
            display: 'block',
            cursor: 'default',
        };
        if (a.gradientText) {
            Object.assign(style, {
                background: 'linear-gradient(135deg, ' + a.gradientFrom + ' 0%, ' + a.gradientTo + ' 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
            });
        } else {
            style.color = a.textColor;
        }
        return style;
    }

    function buildWrapStyle(a) {
        return {
            background: a.showBg ? a.backgroundColor : 'transparent',
            padding: a.paddingV + 'px ' + a.paddingH + 'px',
            borderRadius: a.borderRadius + 'px',
            textAlign: a.textAlign,
        };
    }

    registerBlockType('blockenberg/text-3d', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var Tag = a.tag || 'h2';
            var textStyle = buildTextStyle(a);
            var wrapStyle = buildWrapStyle(a);

            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(a);
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* Text */
                    el(PanelBody, { title: 'Text', initialOpen: true },
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Text', value: a.text, onChange: function (v) { set({ text: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'HTML tag', value: a.tag, options: TAGS, onChange: function (v) { set({ tag: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Text transform', value: a.textTransform, options: TRANSFORMS, onChange: function (v) { set({ textTransform: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Alignment', value: a.textAlign, options: ALIGNS, onChange: function (v) { set({ textAlign: v }); } }),
                        ),
                    /* 3D Effect */
                    el(PanelBody, { title: '3D Effect', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: '3D style', value: a.style3d, options: STYLES_3D, onChange: function (v) { set({ style3d: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Depth (px)', value: a.depth, min: 1, max: 40, onChange: function (v) { set({ depth: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Shadow angle (°)', value: a.angle, min: 0, max: 360, onChange: function (v) { set({ angle: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Gradient text fill', checked: a.gradientText, onChange: function (v) { set({ gradientText: v }); } }),
                    ),
                    /* Animation */
                    el(PanelBody, { title: 'Animation', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Idle animation', value: a.animation, options: ANIMATIONS, onChange: function (v) { set({ animation: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Hover effect', value: a.hoverEffect, options: HOVERS, onChange: function (v) { set({ hoverEffect: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show reflection', checked: a.showReflection, onChange: function (v) { set({ showReflection: v }); } }),
                    ),
                    /* Layout */
                    el(PanelBody, { title: 'Layout & Background', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show background', checked: a.showBg, onChange: function (v) { set({ showBg: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Vertical padding (px)', value: a.paddingV, min: 0, max: 120, onChange: function (v) { set({ paddingV: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Horizontal padding (px)', value: a.paddingH, min: 0, max: 120, onChange: function (v) { set({ paddingH: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border radius (px)', value: a.borderRadius, min: 0, max: 48, onChange: function (v) { set({ borderRadius: v }); } }),
                    ),
                    /* Colors */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Text', 'blockenberg'), value: a.textTypo || {}, onChange: function (v) { set({ textTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: a.textColor,       onChange: function (v) { set({ textColor: v || '#6366f1' }); },         label: 'Text color' },
                            { value: a.depthColor,      onChange: function (v) { set({ depthColor: v || '#312e81' }); },        label: 'Depth / extrude color' },
                            { value: a.shadowColor,     onChange: function (v) { set({ shadowColor: v || 'rgba(0,0,0,0.25)' }); }, label: 'Drop shadow color' },
                            { value: a.backgroundColor, onChange: function (v) { set({ backgroundColor: v || '#0f172a' }); },   label: 'Background' },
                            { value: a.gradientFrom,    onChange: function (v) { set({ gradientFrom: v || '#a78bfa' }); },      label: 'Gradient start' },
                            { value: a.gradientTo,      onChange: function (v) { set({ gradientTo: v || '#60a5fa' }); },        label: 'Gradient end' },
                        ],
                    }),
                ),
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el(Tag, { className: 'bkbg-3dt-text', style: textStyle }, a.text || '3D TEXT'),
                        a.showReflection && el(Tag, {
                            className: 'bkbg-3dt-text bkbg-3dt-reflection',
                            style: Object.assign({}, textStyle, {
                                transform: 'scaleY(-1)',
                                opacity: 0.18,
                                marginTop: '4px',
                                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 70%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 70%)',
                                display: 'block',
                                pointerEvents: 'none',
                            }),
                        }, a.text || '3D TEXT')
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            var sv = getTypoCssVars(a);
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-3dt-app', 'data-opts': JSON.stringify(a), style: sv })
            );
        },
    });
}() );
