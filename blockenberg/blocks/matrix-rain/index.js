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
    var useRef             = wp.element.useRef;
    var useEffect          = wp.element.useEffect;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var CHAR_SETS = [
        { label: 'Matrix (Katakana + digits)', value: 'matrix' },
        { label: 'Binary (0 and 1)',           value: 'binary' },
        { label: 'Hexadecimal',                value: 'hex'    },
        { label: 'Latin alphabet',             value: 'latin'  },
        { label: 'Custom',                     value: 'custom' },
    ];

    var COLOR_STYLES = [
        { label: '🟢 Classic Green / White  head',  value: 'classic-green'  },
        { label: '🔵 Cyan / White head',            value: 'cyan'            },
        { label: '🔴 Red / Pink head',              value: 'red'             },
        { label: '🟡 Gold / White head',            value: 'gold'            },
        { label: '🟣 Purple / White head',          value: 'purple'          },
        { label: '🌈 Rainbow columns',              value: 'rainbow'         },
        { label: '🎨 Custom colors',               value: 'custom'          },
    ];

    var STYLE_COLORS = {
        'classic-green': { primary: '#00ff41', head: '#ffffff', bg: '#000000' },
        'cyan':          { primary: '#00e5ff', head: '#ffffff', bg: '#000a0d' },
        'red':           { primary: '#ff0040', head: '#ffaaaa', bg: '#0d0000' },
        'gold':          { primary: '#ffcc00', head: '#ffffff', bg: '#080600' },
        'purple':        { primary: '#cc44ff', head: '#ffffff', bg: '#060008' },
        'rainbow':       { primary: '#00ff41', head: '#ffffff', bg: '#000000' },
        'custom':        null,
    };

    function applyStyle(val, set) {
        var c = STYLE_COLORS[val];
        if (c) set({ colorStyle: val, primaryColor: c.primary, headColor: c.head, bgColor: c.bg });
        else   set({ colorStyle: val });
    }

    /* live canvas preview in editor */
    function MatrixCanvas(props) {
        var a      = props.attributes;
        var canRef = useRef(null);

        useEffect(function () {
            var canvas = canRef.current;
            if (!canvas) return;
            var ctx    = canvas.getContext('2d');
            canvas.width  = canvas.offsetWidth  || 600;
            canvas.height = a.height;

            var cols  = Math.floor(canvas.width / (a.fontSize || 16));
            var drops = [];
            for (var i = 0; i < cols; i++) {
                drops[i] = a.randomStart ? Math.floor(Math.random() * -canvas.height / a.fontSize) : 0;
            }

            var chars = getChars(a);
            var raf;
            var lastTime = 0;

            function draw(ts) {
                var interval = 1000 / ((a.speed || 50) / 10 + 5);
                if (ts - lastTime > interval) {
                    lastTime = ts;
                    ctx.fillStyle = hexToRgba(a.bgColor || '#000', (a.bgOpacity || 8) / 100);
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    for (var i = 0; i < drops.length; i++) {
                        var ch = chars[Math.floor(Math.random() * chars.length)];
                        var y  = drops[i] * (a.fontSize || 16);
                        if (y > 0) {
                            ctx.font = (a.fontSize || 16) + 'px monospace';
                            ctx.fillStyle = a.headColor || '#ffffff';
                            ctx.fillText(ch, i * (a.fontSize || 16), y);
                        }
                        if (Math.random() > 0.975) drops[i] = 0;
                        drops[i]++;
                    }
                }
                raf = requestAnimationFrame(draw);
            }
            raf = requestAnimationFrame(draw);
            return function () { cancelAnimationFrame(raf); };
        }, [a.height, a.fontSize, a.speed, a.bgColor, a.bgOpacity, a.primaryColor, a.headColor, a.charSet, a.customChars, a.randomStart]);

        return el('canvas', { ref: canRef, style: { width: '100%', height: a.height + 'px', display: 'block', borderRadius: '0' } });
    }

    function getChars(a) {
        if (a.charSet === 'binary')  return ['0','1'];
        if (a.charSet === 'hex')     return '0123456789ABCDEF'.split('');
        if (a.charSet === 'latin')   return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
        if (a.charSet === 'custom')  return (a.customChars || '01').split('');
        /* matrix: katakana + digits */
        var kata = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        return (kata + '0123456789').split('');
    }

    function hexToRgba(hex, alpha) {
        var r = 0, g = 0, b = 0;
        if (hex && hex.startsWith('#')) {
            var h = hex.slice(1);
            if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
            r = parseInt(h.slice(0,2),16);
            g = parseInt(h.slice(2,4),16);
            b = parseInt(h.slice(4,6),16);
        }
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    registerBlockType('blockenberg/matrix-rain', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* Canvas */
                    el(PanelBody, { title: 'Canvas', initialOpen: true },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Height (px)', value: a.height, min: 100, max: 900, step: 20, onChange: function (v) { set({ height: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Speed', value: a.speed, min: 1, max: 100, onChange: function (v) { set({ speed: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Density (%)', value: a.density, min: 10, max: 100, onChange: function (v) { set({ density: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Fade trail length', value: a.fadeLength, min: 1, max: 80, onChange: function (v) { set({ fadeLength: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Glow effect', checked: a.glowEffect, onChange: function (v) { set({ glowEffect: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Random start positions', checked: a.randomStart, onChange: function (v) { set({ randomStart: v }); } }),
                    ),
                    /* Characters */
                    el(PanelBody, { title: 'Characters', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Character set', value: a.charSet, options: CHAR_SETS, onChange: function (v) { set({ charSet: v }); } }),
                        a.charSet === 'custom' && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Custom characters', value: a.customChars, onChange: function (v) { set({ customChars: v }); }, help: 'Type the characters to use (no spaces needed)' }),
                    ),
                    /* Colors */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Canvas font size (px)', value: a.fontSize, min: 8, max: 40, onChange: function (v) { set({ fontSize: v }); } }),
                        a.showOverlay && getTypoControl() && el(getTypoControl(), { label: 'Overlay Title', value: a.overlayTypo || {}, onChange: function (v) { set({ overlayTypo: v }); } }),
                        a.showOverlay && getTypoControl() && el(getTypoControl(), { label: 'Overlay Subtext', value: a.subtextTypo || {}, onChange: function (v) { set({ subtextTypo: v }); } })
                    ),
el(PanelBody, { title: 'Colors', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Color preset', value: a.colorStyle, options: COLOR_STYLES, onChange: function (v) { applyStyle(v, set); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Background opacity (fade trail)', value: a.bgOpacity, min: 1, max: 40, onChange: function (v) { set({ bgOpacity: v }); } }),
                    ),
                    el(PanelColorSettings, {
                        title: 'Custom Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: a.primaryColor, onChange: function (v) { set({ primaryColor: v || '#00ff41', colorStyle: 'custom' }); }, label: 'Rain color' },
                            { value: a.headColor,    onChange: function (v) { set({ headColor: v || '#ffffff',   colorStyle: 'custom' }); }, label: 'Head (leading char) color' },
                            { value: a.bgColor,      onChange: function (v) { set({ bgColor: v || '#000000',     colorStyle: 'custom' }); }, label: 'Background color' },
                        ],
                    }),
                    /* Overlay */
                    el(PanelBody, { title: 'Text Overlay', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show text overlay', checked: a.showOverlay, onChange: function (v) { set({ showOverlay: v }); } }),
                        a.showOverlay && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Main text', value: a.overlayText, onChange: function (v) { set({ overlayText: v }); } }),
                        a.showOverlay && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Subtext', value: a.overlaySubtext, onChange: function (v) { set({ overlaySubtext: v }); } }),
                    ),
                    a.showOverlay && el(PanelColorSettings, {
                        title: 'Overlay Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: a.overlayTextColor, onChange: function (v) { set({ overlayTextColor: v || '#00ff41' }); }, label: 'Overlay text color' },
                            { value: a.overlayBg,        onChange: function (v) { set({ overlayBg: v || 'rgba(0,0,0,0.35)' }); }, label: 'Overlay background' },
                        ],
                    }),
                    /* Interaction */
                    el(PanelBody, { title: 'Interaction', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Click to pause/resume', checked: a.clickToPause, onChange: function (v) { set({ clickToPause: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Pause on hover', checked: a.pauseOnHover, onChange: function (v) { set({ pauseOnHover: v }); } }),
                    ),
                ),
                el('div', useBlockProps((function () {
                    var tv = getTypoCssVars();
                    var s = { position: 'relative', overflow: 'hidden' };
                    Object.assign(s, tv(a.overlayTypo, '--bkbg-mr-ot-'));
                    Object.assign(s, tv(a.subtextTypo, '--bkbg-mr-os-'));
                    return { style: s };
                })()),
                    el(MatrixCanvas, { attributes: a }),
                    a.showOverlay && el('div', {
                        className: 'bkbg-mr-overlay',
                        style: {
                            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: a.overlayBg, pointerEvents: 'none',
                        },
                    },
                        el('h2', { className: 'bkbg-mr-overlay-title', style: { color: a.overlayTextColor, margin: '0 0 12px' } },
                            a.overlayText),
                        a.overlaySubtext && el('p', { className: 'bkbg-mr-overlay-sub', style: { color: a.overlayTextColor, opacity: 0.7, margin: 0 } },
                            a.overlaySubtext)
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.overlayTypo, '--bkbg-mr-ot-'));
                Object.assign(s, tv(a.subtextTypo, '--bkbg-mr-os-'));
                return { style: s };
            })()),
                el('div', { className: 'bkbg-mr-app', 'data-opts': JSON.stringify(a) })
            );
        },
    });
}() );
