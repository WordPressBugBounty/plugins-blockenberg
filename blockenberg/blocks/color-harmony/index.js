( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var ColorPicker = wp.components.ColorPicker;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    var HARMONIES = {
        complementary:       'Complementary',
        triadic:             'Triadic',
        analogous:           'Analogous',
        splitComplementary:  'Split-Complementary',
        tetradic:            'Tetradic',
        square:              'Square'
    };

    /* ---- HSL ↔ Hex helpers ---- */
    function hexToHsl(hex) {
        var r = parseInt(hex.slice(1,3),16)/255;
        var g = parseInt(hex.slice(3,5),16)/255;
        var b = parseInt(hex.slice(5,7),16)/255;
        var max = Math.max(r,g,b), min = Math.min(r,g,b);
        var h, s, l = (max+min)/2;
        if (max === min) { h = s = 0; }
        else {
            var d = max - min;
            s = l > 0.5 ? d/(2-max-min) : d/(max+min);
            switch(max){
                case r: h = ((g-b)/d + (g<b?6:0))/6; break;
                case g: h = ((b-r)/d + 2)/6; break;
                default: h = ((r-g)/d + 4)/6; break;
            }
        }
        return { h: h*360, s: s*100, l: l*100 };
    }

    function hslToHex(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s /= 100; l /= 100;
        var a = s * Math.min(l, 1-l);
        function f(n) {
            var k = (n + h/30) % 12;
            var c = l - a * Math.max(-1, Math.min(k-3, 9-k, 1));
            return Math.round(255*c).toString(16).padStart(2,'0');
        }
        return '#' + f(0) + f(8) + f(4);
    }

    function getHarmony(baseHex, type) {
        var hsl = hexToHsl(baseHex);
        var h = hsl.h, s = hsl.s, l = hsl.l;
        var res = [baseHex];
        switch (type) {
            case 'complementary':      res.push(hslToHex(h+180,s,l)); break;
            case 'triadic':            res.push(hslToHex(h+120,s,l), hslToHex(h+240,s,l)); break;
            case 'analogous':          res.push(hslToHex(h-30,s,l), hslToHex(h+30,s,l), hslToHex(h-60,s,l), hslToHex(h+60,s,l)); break;
            case 'splitComplementary': res.push(hslToHex(h+150,s,l), hslToHex(h+210,s,l)); break;
            case 'tetradic':           res.push(hslToHex(h+90,s,l), hslToHex(h+180,s,l), hslToHex(h+270,s,l)); break;
            case 'square':             res.push(hslToHex(h+90,s,l), hslToHex(h+180,s,l), hslToHex(h+270,s,l)); break;
            default:                   res.push(hslToHex(h+180,s,l)); break;
        }
        return res;
    }

    function SwatchRow(props) {
        var colors = getHarmony(props.base, props.harmony);
        var size = props.swatchSize || 80;

        return el('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' } },
            colors.map(function (hex, i) {
                return el('div', { key: i, style: { textAlign: 'center' } },
                    el('div', {
                        style: {
                            width: size, height: size, borderRadius: 12,
                            background: hex, border: '2px solid rgba(0,0,0,0.08)',
                            cursor: 'copy', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            marginBottom: 6
                        },
                        title: 'Click to copy ' + hex
                    }),
                    props.showHex && el('div', { style: { fontSize: 12, fontFamily: 'monospace', color: '#374151' } }, hex.toUpperCase()),
                    i === 0 && el('div', { style: { fontSize: 10, color: '#9ca3af', marginTop: 2 } }, 'Base')
                );
            })
        );
    }

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var bpStyle = { background: a.sectionBg, borderRadius: 16, padding: '28px 20px' };
        Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-coh-tt'));
        Object.assign(bpStyle, _tv(a.typoSubtitle, '--bkbg-coh-st'));
        var blockProps = useBlockProps({ style: bpStyle });

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Palette Settings', 'blockenberg'), initialOpen: false },
                    el('div', { style: { marginBottom: 12 } },
                        el('p', { style: { fontSize: 12, fontWeight: 600, margin: '0 0 8px' } }, __('Default Base Color', 'blockenberg')),
                        el(ColorPicker, {
                            color: a.defaultColor,
                            onChange: function (v) { setAttributes({ defaultColor: v }); },
                            enableAlpha: false
                        })
                    ),
                    el(SelectControl, {
                        label: __('Default Harmony Type', 'blockenberg'),
                        value: a.defaultHarmony,
                        options: Object.keys(HARMONIES).map(function (k) { return { label: HARMONIES[k], value: k }; }),
                        onChange: function (v) { setAttributes({ defaultHarmony: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Swatch Size (px)', 'blockenberg'),
                        value: a.swatchSize, min: 48, max: 140,
                        onChange: function (v) { setAttributes({ swatchSize: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Hex Values', 'blockenberg'),
                        checked: a.showHex,
                        onChange: function (v) { setAttributes({ showHex: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show RGB Values', 'blockenberg'),
                        checked: a.showRgb,
                        onChange: function (v) { setAttributes({ showRgb: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Export Button', 'blockenberg'),
                        checked: a.showExport,
                        onChange: function (v) { setAttributes({ showExport: v }); }
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { setAttributes({ typoSubtitle: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f8fafc' }); } },
                        { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, {
                    tagName: 'h3', className: 'bkbg-coh-title',
                    value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Title', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 4px', textAlign: 'center' }
                }),
                el(RichText, {
                    tagName: 'p', className: 'bkbg-coh-subtitle',
                    value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Subtitle', 'blockenberg'),
                    style: { color: a.titleColor + 'bb', textAlign: 'center', margin: '0 0 20px' }
                }),
                // Harmony type tabs
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 } },
                    Object.keys(HARMONIES).map(function (k) {
                        var active = k === a.defaultHarmony;
                        return el('div', {
                            key: k,
                            style: {
                                padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'default',
                                border: '2px solid ' + a.accentColor,
                                background: active ? a.accentColor : 'transparent',
                                color: active ? '#fff' : a.accentColor
                            }
                        }, HARMONIES[k]);
                    })
                ),
                // Swatch row
                el('div', { style: { background: a.cardBg, borderRadius: 14, padding: '20px', marginBottom: 14 } },
                    el(SwatchRow, { base: a.defaultColor || '#6366f1', harmony: a.defaultHarmony, swatchSize: a.swatchSize, showHex: a.showHex })
                ),
                // Color picker preview
                el('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 14 } },
                    el('div', {
                        style: { width: 44, height: 44, borderRadius: 50, background: a.defaultColor, border: '3px solid ' + a.accentColor }
                    }),
                    el('div', { style: { fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: a.titleColor } },
                        (a.defaultColor || '#6366f1').toUpperCase()
                    )
                ),
                a.showExport && el('button', {
                    style: {
                        background: a.accentColor, color: '#fff', border: 'none', borderRadius: 10,
                        padding: '10px 24px', fontWeight: 700, cursor: 'default', fontSize: 14
                    }
                }, '📋 Export Palette')
            )
        );
    }

    registerBlockType('blockenberg/color-harmony', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-coh-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-coh-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p',  className: 'bkbg-coh-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
