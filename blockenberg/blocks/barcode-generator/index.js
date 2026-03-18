( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    /* ---- Minimal Code128-B encoder (editor preview only) ---- */
    function makeBarPattern(text) {
        // Returns a simple alternating bar pattern based on char codes for preview
        var bits = [];
        for (var i = 0; i < Math.min(text.length, 20); i++) {
            var c = text.charCodeAt(i);
            bits.push(c % 2 === 0 ? [2,1,2,1,1] : [1,2,1,2,2]);
        }
        return bits;
    }

    function BarcodePreview(props) {
        var text = props.text || 'SAMPLE';
        var barH = props.barHeight || 60;
        var barW = props.barWidth  || 2;
        var barColor = props.barColor || '#000';
        var bgColor  = props.bgColor  || '#fff';
        var showLabel = props.showLabel;
        var pattern = makeBarPattern(text);

        var bars = [];
        var x = 4;
        var isBar = true;
        for (var g = 0; g < pattern.length; g++) {
            for (var b = 0; b < pattern[g].length; b++) {
                var w = pattern[g][b] * barW;
                if (isBar) {
                    bars.push(el('rect', { key: x + '-' + b, x: x, y: 4, width: w, height: barH, fill: barColor }));
                }
                x += w;
                isBar = !isBar;
            }
        }
        var totalW = x + 4;
        var totalH = barH + (showLabel ? 20 : 8);

        return el('div', { style: { background: bgColor, display: 'inline-block', padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb' } },
            el('svg', { width: totalW, height: totalH, style: { display: 'block' } },
                el('rect', { x: 0, y: 0, width: totalW, height: totalH, fill: bgColor }),
                bars,
                showLabel ? el('text', {
                    x: totalW / 2, y: barH + 16,
                    textAnchor: 'middle', fill: barColor,
                    fontSize: 11, fontFamily: 'monospace'
                }, text) : null
            )
        );
    }

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var TC = getTypographyControl();
        var _tv = getTypoCssVars();
        var blockProps = useBlockProps({ style: Object.assign({ background: a.sectionBg, borderRadius: 16, padding: '28px 20px' }, _tv(a.titleTypo || {}, '--bkbg-brc-title-'), _tv(a.subtitleTypo || {}, '--bkbg-brc-sub-')) });

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Default Text / Number', 'blockenberg'),
                        value: a.defaultText,
                        onChange: function (v) { setAttributes({ defaultText: v }); }
                    })
                ),
                el(PanelBody, { title: __('Barcode Settings', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Bar Height (px)', 'blockenberg'),
                        value: a.barHeight, min: 30, max: 200,
                        onChange: function (v) { setAttributes({ barHeight: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Bar Width Multiplier', 'blockenberg'),
                        value: a.barWidth, min: 1, max: 5,
                        onChange: function (v) { setAttributes({ barWidth: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Text Label', 'blockenberg'),
                        checked: a.showLabel,
                        onChange: function (v) { setAttributes({ showLabel: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Download Button', 'blockenberg'),
                        checked: a.showDownload,
                        onChange: function (v) { setAttributes({ showDownload: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Copy Button', 'blockenberg'),
                        checked: a.showCopy,
                        onChange: function (v) { setAttributes({ showCopy: v }); }
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v){ setAttributes({titleTypo: v}); } }),
                    TC && el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function(v){ setAttributes({subtitleTypo: v}); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#1f2937' }); } },
                        { label: __('Bar Color', 'blockenberg'), value: a.barColor, onChange: function (v) { setAttributes({ barColor: v || '#000000' }); } },
                        { label: __('Barcode Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f9fafb' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#111827' }); } },
                        { label: __('Button Color', 'blockenberg'), value: a.buttonBg, onChange: function (v) { setAttributes({ buttonBg: v || '#1f2937' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, {
                    tagName: 'h3',
                    className: 'bkbg-brc-title',
                    value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Block Title', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 6px', textAlign: 'center' }
                }),
                el(RichText, {
                    tagName: 'p',
                    className: 'bkbg-brc-subtitle',
                    value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Subtitle', 'blockenberg'),
                    style: { color: a.titleColor + 'bb', textAlign: 'center', margin: '0 0 16px' }
                }),
                el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 } },
                    el('input', {
                        type: 'text',
                        readOnly: true,
                        value: a.defaultText,
                        className: 'bkbg-brc-input',
                        style: {
                            width: 280, padding: '10px 14px', borderRadius: 8,
                            border: '2px solid #e5e7eb', fontSize: 15,
                            fontFamily: 'monospace', textAlign: 'center',
                            background: '#fff', color: '#111'
                        }
                    }),
                    el(BarcodePreview, {
                        text: a.defaultText,
                        barHeight: a.barHeight,
                        barWidth: a.barWidth,
                        barColor: a.barColor,
                        bgColor: a.bgColor,
                        showLabel: a.showLabel
                    }),
                    el('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' } },
                        el('button', {
                            style: {
                                background: a.buttonBg, color: '#fff', border: 'none',
                                borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: 'default'
                            }
                        }, 'Generate'),
                        a.showDownload && el('button', {
                            style: {
                                background: a.buttonBg + '22', color: a.buttonBg, border: '2px solid ' + a.buttonBg,
                                borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: 'default'
                            }
                        }, '⬇ Download'),
                        a.showCopy && el('button', {
                            style: {
                                background: a.buttonBg + '22', color: a.buttonBg, border: '2px solid ' + a.buttonBg,
                                borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: 'default'
                            }
                        }, '📋 Copy')
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/barcode-generator', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-brc-app',
                    'data-opts': JSON.stringify(a)
                },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-brc-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p',  className: 'bkbg-brc-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
