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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var PRESETS = [
        { label: '⚡ Electric Blue',   value: 'electric-blue',  tube: '#00d4ff', glow: '#00d4ff', second: '#0055ff', bg: '#0a0a12' },
        { label: '🔴 Hot Pink',        value: 'hot-pink',       tube: '#ff0080', glow: '#ff0080', second: '#ff4000', bg: '#0d000a' },
        { label: '🟢 Matrix Green',    value: 'matrix-green',   tube: '#00ff41', glow: '#00ff41', second: '#00aa00', bg: '#000d03' },
        { label: '🟡 Golden Amber',    value: 'golden-amber',   tube: '#ffaa00', glow: '#ffaa00', second: '#ff5500', bg: '#0d0800' },
        { label: '🟣 Purple Haze',     value: 'purple-haze',    tube: '#c800ff', glow: '#c800ff', second: '#6600ff', bg: '#08000d' },
        { label: '🔵 Ocean Teal',      value: 'ocean-teal',     tube: '#00ffcc', glow: '#00ffcc', second: '#0066ff', bg: '#000d0a' },
        { label: '🌹 Rose Gold',       value: 'rose-gold',      tube: '#ff6b9d', glow: '#ff3366', second: '#c0392b', bg: '#0d0205' },
        { label: '🟠 Toxic Orange',    value: 'toxic-orange',   tube: '#ff6600', glow: '#ff8800', second: '#ffcc00', bg: '#0d0400' },
    ];

    var FLICKER_MODES = [
        { label: 'Soft (gentle breathe)',  value: 'soft'    },
        { label: 'Classic (on/off blink)', value: 'classic' },
        { label: 'Broken (random stutter)', value: 'broken' },
        { label: 'None',                   value: 'none'    },
    ];

    var TAGS = [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' }, { label: 'p',  value: 'p'  }, { label: 'div', value: 'div' },
    ];
    var WEIGHTS = [
        { label: '300 Light', value: '300' }, { label: '400 Regular', value: '400' },
        { label: '600 Semi-Bold', value: '600' }, { label: '700 Bold', value: '700' },
        { label: '800 Extra-Bold', value: '800' },
    ];
    var TRANSFORMS = [
        { label: 'UPPERCASE', value: 'uppercase' }, { label: 'lowercase', value: 'lowercase' },
        { label: 'Capitalize', value: 'capitalize' }, { label: 'None', value: 'none' },
    ];

    function makeNeonShadow(a, boost) {
        var tube   = a.tubeColor   || '#00d4ff';
        var glow   = a.glowColor   || '#00d4ff';
        var second = a.secondGlow  || '#0055ff';
        var int    = (a.glowIntensity || 3) * (boost || 1);
        var spread = a.glowSpread   || 40;

        var layers = [
            '0 0 ' + Math.round(spread * 0.1) + 'px ' + tube,
            '0 0 ' + Math.round(spread * 0.3) + 'px ' + tube,
            '0 0 ' + Math.round(spread * 0.6 * int) + 'px ' + glow,
            '0 0 ' + Math.round(spread * 1.0 * int) + 'px ' + glow,
            '0 0 ' + Math.round(spread * 2.0 * int) + 'px ' + second,
            '0 0 ' + Math.round(spread * 3.0 * int) + 'px ' + second,
        ];
        return layers.join(', ');
    }

    function applyPreset(preset, set) {
        var p = PRESETS.find(function (x) { return x.value === preset; });
        if (!p) return;
        set({ preset: p.value, tubeColor: p.tube, glowColor: p.glow, secondGlow: p.second, backgroundColor: p.bg });
    }

    function NeonPreview(props) {
        var a = props.attributes;

        var wrapStyle = {
            background: a.backgroundColor,
            padding: a.paddingV + 'px ' + a.paddingH + 'px',
            borderRadius: a.borderRadius + 'px',
            textAlign: a.textAlign,
            position: 'relative',
            overflow: 'hidden',
        };
        var textStyle = {
            color: a.tubeColor,
            textShadow: makeNeonShadow(a),
            margin: 0,
            display: 'block',
        };

        var Tag = a.tag || 'h2';

        return el('div', { className: 'bkbg-nt-wrap', style: wrapStyle },
            a.showBorderSign && el('div', { style: {
                position: 'absolute', inset: '12px',
                border: '3px solid ' + a.borderSignColor,
                borderRadius: Math.max(0, a.borderRadius - 6) + 'px',
                boxShadow: '0 0 12px ' + a.borderSignColor + ', inset 0 0 12px ' + a.borderSignColor + '22',
                pointerEvents: 'none',
            }}),
            a.showScanlines && el('div', { style: {
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
                pointerEvents: 'none',
                borderRadius: 'inherit',
            }}),
            el(Tag, { className: 'bkbg-nt-text', style: textStyle }, a.text || 'NEON SIGN'),
            a.showSubText && a.subText && el('p', { className: 'bkbg-nt-sub', style: { color: a.tubeColor, textShadow: makeNeonShadow(a, 0.6), marginTop: '12px', position: 'relative', zIndex: 2 } }, a.subText),
            a.showGlowFloor && el('div', { style: {
                position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '2px',
                background: 'radial-gradient(ellipse at center, ' + a.glowColor + '55 0%, transparent 70%)',
                filter: 'blur(8px)',
                pointerEvents: 'none',
            }})
        );
    }

    registerBlockType('blockenberg/neon-text', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* Text */
                    el(PanelBody, { title: 'Text', initialOpen: true },
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Main text', value: a.text, onChange: function (v) { set({ text: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show subtitle', checked: a.showSubText, onChange: function (v) { set({ showSubText: v }); } }),
                        a.showSubText && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Subtitle', value: a.subText, onChange: function (v) { set({ subText: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'HTML tag', value: a.tag, options: TAGS, onChange: function (v) { set({ tag: v }); } }),
                    ),
                    /* Colors & Preset */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), { label: __('Heading', 'blockenberg'), value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                        el(getTypoControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { set({ subtitleTypo: v }); } })
                    ),
el(PanelBody, { title: 'Neon Color', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Color preset', value: a.preset, options: PRESETS.map(function (p) { return { label: p.label, value: p.value }; }), onChange: function (v) { applyPreset(v, set); } }),
                        el('p', { style: { fontSize: '12px', color: '#888', margin: '4px 0 12px' } }, 'Or customize colors below:'),
                    ),
                    el(PanelColorSettings, {
                        title: 'Custom Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: a.tubeColor,       onChange: function (v) { set({ tubeColor: v || '#00d4ff',   preset: 'custom' }); }, label: 'Tube / text color' },
                            { value: a.glowColor,       onChange: function (v) { set({ glowColor: v || '#00d4ff',   preset: 'custom' }); }, label: 'Inner glow color' },
                            { value: a.secondGlow,      onChange: function (v) { set({ secondGlow: v || '#0055ff',  preset: 'custom' }); }, label: 'Outer glow color' },
                            { value: a.backgroundColor, onChange: function (v) { set({ backgroundColor: v || '#0a0a12' }); },              label: 'Background' },
                            { value: a.borderSignColor, onChange: function (v) { set({ borderSignColor: v || '#ff0080' }); },              label: 'Sign border color' },
                        ],
                    }),
                    /* Glow */
                    el(PanelBody, { title: 'Glow Settings', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Glow intensity', value: a.glowIntensity, min: 0.5, max: 8, step: 0.5, onChange: function (v) { set({ glowIntensity: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Glow spread (px)', value: a.glowSpread, min: 5, max: 120, step: 5, onChange: function (v) { set({ glowSpread: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show glow floor reflection', checked: a.showGlowFloor, onChange: function (v) { set({ showGlowFloor: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show CRT scanlines overlay', checked: a.showScanlines, onChange: function (v) { set({ showScanlines: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show neon sign border', checked: a.showBorderSign, onChange: function (v) { set({ showBorderSign: v }); } }),
                    ),
                    /* Animation */
                    el(PanelBody, { title: 'Animation', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Flicker mode', value: a.flickerMode, options: FLICKER_MODES, onChange: function (v) { set({ flickerMode: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Broken letter index (-1 = random)', value: a.flickerLetter, min: -1, max: 20, onChange: function (v) { set({ flickerLetter: v }); }, help: 'For "broken" mode: which character appears faulty (-1 = random)' }),
                    ),
                    /* Layout */
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Vertical padding (px)', value: a.paddingV, min: 0, max: 160, onChange: function (v) { set({ paddingV: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Horizontal padding (px)', value: a.paddingH, min: 0, max: 160, onChange: function (v) { set({ paddingH: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border radius (px)', value: a.borderRadius, min: 0, max: 64, onChange: function (v) { set({ borderRadius: v }); } }),
                    ),
                ),
                el('div', useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = {};
                    Object.assign(s, _tvf(a.headingTypo, '--bkbg-nt-hd-'));
                    Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-nt-sb-'));
                    return { style: s };
                })()),
                    el(NeonPreview, { attributes: a })
                )
            );
        },
        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                return el('div', wp.blockEditor.useBlockProps.save(),
                    el('div', { className: 'bkbg-nt-app', 'data-opts': JSON.stringify(a) })
                );
            }
        }],
        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.headingTypo, '--bkbg-nt-hd-'));
                Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-nt-sb-'));
                return { style: s };
            })());
            return el('div', blockProps,
                el('div', { className: 'bkbg-nt-app', 'data-opts': JSON.stringify(a) })
            );
        },
    });
}() );
