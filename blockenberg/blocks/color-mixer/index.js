( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    function mixHex(hexA, hexB, t) {
        function p(h, s, e) { return parseInt(h.slice(s, e), 16); }
        var r = Math.round(p(hexA,1,3) + (p(hexB,1,3) - p(hexA,1,3)) * t);
        var g = Math.round(p(hexA,3,5) + (p(hexB,3,5) - p(hexA,3,5)) * t);
        var b = Math.round(p(hexA,5,7) + (p(hexB,5,7) - p(hexA,5,7)) * t);
        function h(x) { return x.toString(16).padStart(2,'0'); }
        return '#' + h(r) + h(g) + h(b);
    }

    registerBlockType('blockenberg/color-mixer', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var bpStyle = {};
            Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-cm-tt'));
            Object.assign(bpStyle, _tv(a.typoSubtitle, '--bkbg-cm-st'));
            var blockProps = useBlockProps({ className: 'bkbg-cm-editor-wrap', style: bpStyle });

            var ratio = a.defaultRatio / 100;
            var mixed = mixHex(a.colorA, a.colorB, ratio);

            var containerStyle = {
                background: a.sectionBg,
                borderRadius: '12px',
                padding: '28px',
                maxWidth: a.contentMaxWidth + 'px',
                margin: '0 auto',
                fontFamily: 'system-ui, sans-serif'
            };

            var cardStyle = {
                background: a.cardBg,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            };

            function swatchBox(color, label) {
                return el('div', { style: { textAlign: 'center' } },
                    el('div', { style: { width: '100%', height: '80px', backgroundColor: color, borderRadius: '8px', marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' } }),
                    el('code', { style: { fontSize: '13px', color: a.labelColor } }, color),
                    el('div', { style: { fontSize: '12px', color: a.subtitleColor, marginTop: '2px' } }, label)
                );
            }

            return el(
                Fragment,
                null,
                el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'blockenberg'),
                            value: a.title,
                            onChange: function (v) { setAttributes({ title: v }); }
                        }),
                        el(TextControl, {
                            label: __('Subtitle', 'blockenberg'),
                            value: a.subtitle,
                            onChange: function (v) { setAttributes({ subtitle: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Title', 'blockenberg'),
                            checked: a.showTitle,
                            onChange: function (v) { setAttributes({ showTitle: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Subtitle', 'blockenberg'),
                            checked: a.showSubtitle,
                            onChange: function (v) { setAttributes({ showSubtitle: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(
                        PanelBody,
                        { title: __('Colors & Defaults', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            label: __('Default Color A', 'blockenberg'),
                            value: a.colorA,
                            onChange: function (v) { setAttributes({ colorA: v }); }
                        }),
                        el(TextControl, {
                            label: __('Default Color B', 'blockenberg'),
                            value: a.colorB,
                            onChange: function (v) { setAttributes({ colorB: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Default Mix Ratio (%)', 'blockenberg'),
                            value: a.defaultRatio,
                            min: 0,
                            max: 100,
                            onChange: function (v) { setAttributes({ defaultRatio: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Color Harmonies', 'blockenberg'),
                            checked: a.showHarmonies,
                            onChange: function (v) { setAttributes({ showHarmonies: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Gradient Strip', 'blockenberg'),
                            checked: a.showGradient,
                            onChange: function (v) { setAttributes({ showGradient: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show HEX/RGB/HSL Formats', 'blockenberg'),
                            checked: a.showFormats,
                            onChange: function (v) { setAttributes({ showFormats: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(
                        PanelBody,
                        { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { setAttributes({ typoSubtitle: v }); } })
                    ),
                    el(
                        PanelBody,
                        { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Max Width (px)', 'blockenberg'),
                            value: a.contentMaxWidth,
                            min: 320,
                            max: 1200,
                            onChange: function (v) { setAttributes({ contentMaxWidth: v }); }
                        })
                    ),
                    el(
                        PanelColorSettings,
                        {
                            title: __('UI Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: a.accentColor,   onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); },   label: __('Accent Color', 'blockenberg') },
                                { value: a.sectionBg,     onChange: function (v) { setAttributes({ sectionBg: v || '#f5f3ff' }); },     label: __('Section Background', 'blockenberg') },
                                { value: a.cardBg,        onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); },        label: __('Card Background', 'blockenberg') },
                                { value: a.titleColor,    onChange: function (v) { setAttributes({ titleColor: v || '#3730a3' }); },    label: __('Title Color', 'blockenberg') },
                                { value: a.subtitleColor, onChange: function (v) { setAttributes({ subtitleColor: v || '#6b7280' }); }, label: __('Subtitle Color', 'blockenberg') },
                                { value: a.labelColor,    onChange: function (v) { setAttributes({ labelColor: v || '#374151' }); },    label: __('Label Color', 'blockenberg') }
                            ]
                        }
                    )
                ),
                el(
                    'div',
                    blockProps,
                    el(
                        'div',
                        { style: containerStyle },
                        a.showTitle && el('div', { className: 'bkbg-cm-title', style: { color: a.titleColor, marginBottom: '6px' } }, a.title),
                        a.showSubtitle && el('div', { className: 'bkbg-cm-subtitle', style: { color: a.subtitleColor, marginBottom: '20px' } }, a.subtitle),
                        // Color pickers row
                        el('div', { style: Object.assign({}, cardStyle, { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }) },
                            swatchBox(a.colorA, 'Color A'),
                            el('div', { style: { textAlign: 'center', color: a.labelColor, fontWeight: '700', fontSize: '18px' } }, '+'),
                            swatchBox(a.colorB, 'Color B')
                        ),
                        // Ratio + Mixed result
                        el('div', { style: cardStyle },
                            el('div', { style: { marginBottom: '14px' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: a.labelColor, marginBottom: '6px' } },
                                    el('span', null, 'A (' + (100 - a.defaultRatio) + '%)'),
                                    el('span', { style: { fontWeight: '600' } }, 'Mix Ratio'),
                                    el('span', null, 'B (' + a.defaultRatio + '%)')
                                ),
                                el('input', { type: 'range', min: 0, max: 100, defaultValue: a.defaultRatio, style: { width: '100%', accentColor: a.accentColor } })
                            ),
                            el('div', { style: { height: '60px', background: mixed, borderRadius: '8px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' } }),
                            el('div', { style: { textAlign: 'center', fontFamily: 'monospace', fontSize: '18px', fontWeight: '700', color: a.labelColor } }, mixed)
                        ),
                        // Gradient strip
                        a.showGradient && el('div', { style: Object.assign({}, cardStyle, { padding: '16px' }) },
                            el('div', { style: { fontSize: '13px', fontWeight: '600', color: a.labelColor, marginBottom: '10px' } }, 'Gradient'),
                            el('div', { style: { height: '32px', borderRadius: '8px', background: 'linear-gradient(to right, ' + a.colorA + ', ' + a.colorB + ')' } })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-cm-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
