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
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _cchkTC, _cchkTV;
    function _tc() { return _cchkTC || (_cchkTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cchkTV || (_cchkTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    function hexToRgb(hex) {
        hex = hex.replace('#','');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16) };
    }
    function luminance(hex) {
        var rgb = hexToRgb(hex);
        var vals = [rgb.r, rgb.g, rgb.b].map(function(v) {
            v = v / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
    }
    function contrastRatio(fg, bg) {
        var l1 = luminance(fg), l2 = luminance(bg);
        var lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    var WCAG = [
        { id: 'aa-normal',  label: 'AA',  sub: 'Normal text',  min: 4.5 },
        { id: 'aa-large',   label: 'AA',  sub: 'Large text',   min: 3.0 },
        { id: 'aaa-normal', label: 'AAA', sub: 'Normal text',  min: 7.0 },
        { id: 'aaa-large',  label: 'AAA', sub: 'Large text',   min: 4.5 }
    ];

    function RatioDisplay(props) {
        var r = props.ratio;
        var pass = r >= 4.5 ? 'Excellent' : r >= 3 ? 'Good' : r >= 2 ? 'Poor' : 'Fail';
        var col = r >= 4.5 ? props.passColor : r >= 3 ? '#d97706' : props.failColor;
        return el('div', { className: 'bkbg-cc-ratio-box', style: { borderColor: col + '44', background: col + '10' } },
            el('div', { className: 'bkbg-cc-ratio-val', style: { color: col } }, r.toFixed(2) + ':1'),
            el('div', { className: 'bkbg-cc-ratio-lbl', style: { color: props.labelColor } }, 'Contrast Ratio'),
            el('div', { className: 'bkbg-cc-ratio-grade', style: { background: col, color: '#fff' } }, pass)
        );
    }

    function WcagRow(props) {
        var pass = props.ratio >= props.level.min;
        var col  = pass ? props.passColor : props.failColor;
        return el('div', { className: 'bkbg-cc-wcag-row', style: { borderColor: col + '33', background: col + '09' } },
            el('div', { className: 'bkbg-cc-wcag-badge', style: { background: col, color: '#fff' } }, props.level.label),
            el('div', { className: 'bkbg-cc-wcag-info' },
                el('div', { className: 'bkbg-cc-wcag-sub', style: { color: props.labelColor } }, props.level.sub),
                el('div', { className: 'bkbg-cc-wcag-req', style: { color: '#9ca3af' } }, 'Min ' + props.level.min + ':1')
            ),
            el('div', { className: 'bkbg-cc-wcag-status', style: { color: col } },
                pass ? '✓ Pass' : '✗ Fail'
            )
        );
    }

    function Editor(props) {
        var a = props.attributes, sa = props.setAttributes;
        var fg = useState(a.defaultFg || '#1e1b4b'); var fgVal = fg[0]; var setFg = fg[1];
        var bg = useState(a.defaultBg || '#ffffff');  var bgVal = bg[0]; var setBg = bg[1];
        var ratio  = contrastRatio(fgVal, bgVal);
        var lc = a.labelColor || '#374151';

        var blockProps = useBlockProps({ className: 'bkbg-cc-app', style: Object.assign({}, _tv(a.typoTitle, '--bkcchk-title-'), _tv(a.typoSubtitle, '--bkcchk-sub-')) });

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content'), initialOpen: true },
                    el(TextControl, { label: __('Title'),    value: a.title    || '', onChange: function(v){ sa({ title: v }); } }),
                    el(TextControl, { label: __('Subtitle'), value: a.subtitle || '', onChange: function(v){ sa({ subtitle: v }); } }),
                    el(TextControl, { label: __('Preview Text'), value: a.previewText || '', onChange: function(v){ sa({ previewText: v }); } }),
                    el(TextControl, { label: __('Default Foreground Color'), value: a.defaultFg || '#1e1b4b', onChange: function(v){ sa({ defaultFg: v }); setFg(v); } }),
                    el(TextControl, { label: __('Default Background Color'), value: a.defaultBg || '#ffffff',  onChange: function(v){ sa({ defaultBg: v }); setBg(v); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Text Preview'), checked: a.showPreview !== false, onChange: function(v){ sa({ showPreview: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Color Suggestions'), checked: a.showSuggestions !== false, onChange: function(v){ sa({ showSuggestions: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function(v){ sa({ typoTitle: v }); } }),
                    _tc() && el(_tc(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function(v){ sa({ typoSubtitle: v }); } }),
                    el(RangeControl, { label: __('Sample text font size (px)'), value: a.sampleFontSize || 16, min: 11, max: 28, onChange: function(v){ sa({ sampleFontSize: v }); }, __nextHasNoMarginBottom: true })
                ),
el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.passColor     ||'#16a34a', onChange: function(v){ sa({ passColor: v }); },     label: 'Pass Badge' },
                        { value: a.failColor     ||'#dc2626', onChange: function(v){ sa({ failColor: v }); },     label: 'Fail Badge' },
                        { value: a.accentColor   ||'#6c3fb5', onChange: function(v){ sa({ accentColor: v }); },   label: 'Accent' },
                        { value: a.cardBg        ||'#ffffff', onChange: function(v){ sa({ cardBg: v }); },        label: 'Card Background' },
                        { value: a.sectionBg     ||'#f5f3ff', onChange: function(v){ sa({ sectionBg: v }); },     label: 'Section Background' },
                        { value: a.titleColor    ||'#111827', onChange: function(v){ sa({ titleColor: v }); },    label: 'Title' },
                        { value: a.subtitleColor ||'#6b7280', onChange: function(v){ sa({ subtitleColor: v }); }, label: 'Subtitle' },
                        { value: a.labelColor    ||'#374151', onChange: function(v){ sa({ labelColor: v }); },    label: 'Labels' }
                    ]
                }),
                el(PanelBody, { title: __('Sizing'), initialOpen: false },
                    el(RangeControl, { label: __('Max Width (px)'), value: a.contentMaxWidth || 680, min: 360, max: 1400, step: 10, onChange: function(v){ sa({ contentMaxWidth: v }); } })
                )
            ),

            el('div', blockProps,
                el('div', { className: 'bkbg-cc-card', style: { background: a.cardBg||'#fff', maxWidth: (a.contentMaxWidth||680)+'px' } },
                    el('h2', { className: 'bkbg-cc-title', style: { color: a.titleColor||'#111827' } },
                        a.title || 'Color Contrast Checker'
                    ),
                    el('p', { className: 'bkbg-cc-subtitle', style: { color: a.subtitleColor||'#6b7280' } },
                        a.subtitle || 'Test accessibility compliance with WCAG 2.1 standards'
                    ),

                    // Color pickers
                    el('div', { className: 'bkbg-cc-pickers', style: { background: a.sectionBg||'#f5f3ff' } },
                        el('div', { className: 'bkbg-cc-picker-group' },
                            el('label', { className: 'bkbg-cc-label', style: { color: lc } }, '🅰 Foreground Color'),
                            el('div', { className: 'bkbg-cc-color-row' },
                                el('input', { type: 'color', className: 'bkbg-cc-color-input', value: fgVal, onChange: function(e){ setFg(e.target.value); } }),
                                el('span', { className: 'bkbg-cc-hex', style: { color: lc } }, fgVal.toUpperCase())
                            )
                        ),
                        el('button', { className: 'bkbg-cc-swap', style: { background: a.accentColor||'#6c3fb5' }, onClick: function(){ var t=fgVal; setFg(bgVal); setBg(t); } }, '⇆'),
                        el('div', { className: 'bkbg-cc-picker-group' },
                            el('label', { className: 'bkbg-cc-label', style: { color: lc } }, '◻ Background Color'),
                            el('div', { className: 'bkbg-cc-color-row' },
                                el('input', { type: 'color', className: 'bkbg-cc-color-input', value: bgVal, onChange: function(e){ setBg(e.target.value); } }),
                                el('span', { className: 'bkbg-cc-hex', style: { color: lc } }, bgVal.toUpperCase())
                            )
                        )
                    ),

                    // Preview
                    a.showPreview !== false && el('div', { className: 'bkbg-cc-preview', style: { background: bgVal } },
                        el('p', { className: 'bkbg-cc-preview-normal', style: { color: fgVal, fontSize: (a.sampleFontSize || 16) + 'px' } }, a.previewText || 'Normal text sample — 16px'),
                        el('p', { className: 'bkbg-cc-preview-large',  style: { color: fgVal, fontSize: Math.round((a.sampleFontSize || 16) * 1.5) + 'px' } }, a.previewText || 'Large text sample — 24px'),
                        el('p', { className: 'bkbg-cc-preview-bold',   style: { color: fgVal } }, a.previewText || 'Bold text — 14px bold')
                    ),

                    // Ratio display
                    el(RatioDisplay, { ratio: ratio, passColor: a.passColor||'#16a34a', failColor: a.failColor||'#dc2626', labelColor: lc }),

                    // WCAG levels
                    el('div', { className: 'bkbg-cc-wcag-grid' },
                        WCAG.map(function(level) {
                            return el(WcagRow, { key: level.id, ratio: ratio, level: level, passColor: a.passColor||'#16a34a', failColor: a.failColor||'#dc2626', labelColor: lc });
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/contrast-checker', {
        edit: Editor,
        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
