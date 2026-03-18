( function () {
    var el = React.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    /* ── typography lazy-getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars || function () { return {}; }; }

    var ANIM_TYPES = [
        { value: 'shift',   label: 'Shift — gradient slides' },
        { value: 'pulse',   label: 'Pulse — gradient breathes' },
        { value: 'wave',    label: 'Wave — per-character wave' },
        { value: 'rainbow', label: 'Rainbow — full spectrum cycle' },
        { value: 'reveal',  label: 'Reveal — sweeping spotlight' },
        { value: 'glitch',  label: 'Glitch — RGB displacement' }
    ];

    var DIRECTIONS = [
        { value: 'horizontal', label: 'Horizontal →' },
        { value: 'diagonal',   label: 'Diagonal ↘' },
        { value: 'radial',     label: 'Radial ○' }
    ];

    var TAGS = [
        { value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' },
        { value: 'h3', label: 'H3' }, { value: 'h4', label: 'H4' },
        { value: 'h5', label: 'H5' }, { value: 'h6', label: 'H6' },
        { value: 'p',  label: 'P (paragraph)' },
        { value: 'div',label: 'div' }
    ];

    var WEIGHTS = [
        { value: '300', label: 'Light 300' }, { value: '400', label: 'Regular 400' },
        { value: '600', label: 'SemiBold 600' }, { value: '700', label: 'Bold 700' },
        { value: '800', label: 'ExtraBold 800' }, { value: '900', label: 'Black 900' }
    ];

    var FONT_FAMILIES = [
        { value: 'inherit',         label: 'Theme Default' },
        { value: 'serif',           label: 'Serif' },
        { value: 'sans-serif',      label: 'Sans-Serif' },
        { value: 'monospace',       label: 'Monospace' },
        { value: 'Georgia, serif',  label: 'Georgia' },
        { value: "'Playfair Display', Georgia, serif", label: 'Playfair Display' },
        { value: "'Oswald', sans-serif",               label: 'Oswald' }
    ];

    function buildGradientCss(attr) {
        var colors = [attr.color1, attr.color2];
        if (attr.stopCount >= 3) colors.push(attr.color3);
        if (attr.stopCount >= 4) colors.push(attr.color4);
        var dir = attr.direction === 'radial' ? 'circle'
                : attr.direction === 'diagonal' ? '135deg' : '90deg';
        if (attr.direction === 'radial') {
            return 'radial-gradient(' + dir + ', ' + colors.join(', ') + ')';
        }
        return 'linear-gradient(' + dir + ', ' + colors.join(', ') + ')';
    }

    function GradientTextPreview(props) {
        var attr = props.attr;
        var gradCss = buildGradientCss(attr);
        var animClass = 'bkbg-gta-anim-' + (attr.animationType || 'shift');
        var speed = (attr.animationSpeed || 4) + 's';

        var textStyle = {
            textAlign: attr.textAlign || 'center',
            background: gradCss,
            backgroundSize: attr.animationType === 'shift' || attr.animationType === 'rainbow' ? '300% 300%' : '200% 200%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            margin: 0,
            padding: 0,
            display: 'inline-block',
            width: '100%'
        };

        if (attr.glowEffect) {
            textStyle.filter = 'drop-shadow(0 0 ' + (attr.glowBlur || 20) + 'px ' + attr.color1 + ')';
        }

        return el('div', {
            className: 'bkbg-gta-app',
            style: {
                padding: (attr.paddingV || 24) + 'px ' + (attr.paddingH || 24) + 'px',
                backgroundColor: attr.showBg ? (attr.bgColor || '#0f172a') : 'transparent',
                borderRadius: (attr.borderRadius || 0) + 'px',
                textAlign: attr.textAlign || 'center',
                overflow: 'hidden'
            }
        },
            el(attr.tag || 'h2', {
                className: 'bkbg-gta-el ' + animClass,
                style: Object.assign(textStyle, { animationDuration: speed })
            }, attr.text || 'Animated Gradient Text')
        );
    }

    registerBlockType('blockenberg/gradient-text-animator', {
        title: 'Gradient Text Animator',
        icon: 'editor-textcolor',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    // Text
                    el(PanelBody, { title: 'Text Content', initialOpen: true },
                        el(TextareaControl, { __nextHasNoMarginBottom: true, label: 'Text', value: attr.text, onChange: function (v) { setAttr({ text: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'HTML Tag', value: attr.tag, options: TAGS, onChange: function (v) { setAttr({ tag: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Text Align', value: attr.textAlign, options: [{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}], onChange: function (v) { setAttr({ textAlign: v }); } })
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        _tc() && el(_tc(), { label:'Text', value:attr.typoText, onChange:function(v){ setAttr({typoText:v}); } })
                    ),
                    // Animation
                    el(PanelBody, { title: 'Animation', initialOpen: true },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Animation Type', value: attr.animationType, options: ANIM_TYPES, onChange: function (v) { setAttr({ animationType: v }); } }),
                        el(RangeControl,  { __nextHasNoMarginBottom: true, label: 'Speed (seconds per cycle)', value: attr.animationSpeed, min: 0.5, max: 20, step: 0.5, onChange: function (v) { setAttr({ animationSpeed: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Direction', value: attr.direction, options: DIRECTIONS, onChange: function (v) { setAttr({ direction: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Pause on Hover', checked: attr.pauseOnHover, onChange: function (v) { setAttr({ pauseOnHover: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Reverse on Hover', checked: attr.reverseOnHover, onChange: function (v) { setAttr({ reverseOnHover: v }); } })
                    ),
                    // Glow
                    el(PanelBody, { title: 'Glow Effect', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Enable Glow', checked: attr.glowEffect, onChange: function (v) { setAttr({ glowEffect: v }); } }),
                        attr.glowEffect && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Glow Blur (px)', value: attr.glowBlur, min: 4, max: 80, onChange: function (v) { setAttr({ glowBlur: v }); } }),
                        attr.glowEffect && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Glow Opacity', value: attr.glowOpacity, min: 0.1, max: 1, step: 0.05, onChange: function (v) { setAttr({ glowOpacity: v }); } })
                    ),
                    // Background
                    el(PanelBody, { title: 'Background', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Background', checked: attr.showBg, onChange: function (v) { setAttr({ showBg: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Padding Vertical (px)', value: attr.paddingV, min: 0, max: 120, onChange: function (v) { setAttr({ paddingV: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Padding Horizontal (px)', value: attr.paddingH, min: 0, max: 120, onChange: function (v) { setAttr({ paddingH: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius (px)', value: attr.borderRadius, min: 0, max: 60, onChange: function (v) { setAttr({ borderRadius: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Gradient Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: attr.color1, onChange: function (v) { setAttr({ color1: v || '#f59e0b' }); }, label: 'Color 1' },
                            { value: attr.color2, onChange: function (v) { setAttr({ color2: v || '#ec4899' }); }, label: 'Color 2' },
                            { value: attr.color3, onChange: function (v) { setAttr({ color3: v || '#8b5cf6' }); }, label: 'Color 3 (3+ stops)' },
                            { value: attr.color4, onChange: function (v) { setAttr({ color4: v || '#06b6d4' }); }, label: 'Color 4 (4 stops)' },
                            attr.showBg && { value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); }, label: 'Background Color' }
                        ].filter(Boolean)
                    }),
                    el(PanelBody, { title: 'Color Stops', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Number of Color Stops', value: attr.stopCount, min: 2, max: 4, onChange: function (v) { setAttr({ stopCount: v }); } })
                    )
                ),

                el('div', useBlockProps({ style: _tv()(attr.typoText, '--bkbg-gta-tt-') }),
                    el(GradientTextPreview, { attr: attr })
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-gta-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
