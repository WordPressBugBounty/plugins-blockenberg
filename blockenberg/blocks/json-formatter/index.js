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
    var SelectControl      = wp.components.SelectControl;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/json-formatter', {
        edit: function (props) {
            var attributes    = props.attributes;
            var setAttributes = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {
                    background:    attributes.sectionBg,
                    paddingTop:    attributes.paddingTop    + 'px',
                    paddingBottom: attributes.paddingBottom + 'px'
                };
                Object.assign(s, _tv(attributes.titleTypo, '--bkbg-jf-tt-'));
                return { style: s };
            })());

            function togCtrl(label, key) {
                return el(ToggleControl, {
                    __nextHasNoMarginBottom: true,
                    label: label, checked: attributes[key],
                    onChange: function (v) { var o = {}; o[key] = v; setAttributes(o); }
                });
            }
            function rng(label, key, min, max, step) {
                return el(RangeControl, {
                    __nextHasNoMarginBottom: true,
                    label: label, value: attributes[key], min: min, max: max, step: step || 1,
                    onChange: function (v) { var o = {}; o[key] = v; setAttributes(o); }
                });
            }

            var colors = [
                { label: 'Accent / buttons',  value: attributes.accentColor,   onChange: function (v) { setAttributes({ accentColor:   v }); } },
                { label: 'Key color',         value: attributes.keyColor,      onChange: function (v) { setAttributes({ keyColor:      v }); } },
                { label: 'String color',      value: attributes.stringColor,   onChange: function (v) { setAttributes({ stringColor:   v }); } },
                { label: 'Number color',      value: attributes.numberColor,   onChange: function (v) { setAttributes({ numberColor:   v }); } },
                { label: 'Bool / null color', value: attributes.boolNullColor, onChange: function (v) { setAttributes({ boolNullColor: v }); } },
                { label: 'Punctuation',       value: attributes.punctColor,    onChange: function (v) { setAttributes({ punctColor:    v }); } },
                { label: 'Section BG',        value: attributes.sectionBg,     onChange: function (v) { setAttributes({ sectionBg:     v }); } },
                { label: 'Card BG',           value: attributes.cardBg,        onChange: function (v) { setAttributes({ cardBg:        v }); } },
                { label: 'Editor BG',         value: attributes.editorBg,      onChange: function (v) { setAttributes({ editorBg:      v }); } },
                { label: 'Editor text',       value: attributes.editorText,    onChange: function (v) { setAttributes({ editorText:    v }); } },
                { label: 'Line num BG',       value: attributes.lineNumBg,     onChange: function (v) { setAttributes({ lineNumBg:     v }); } },
                { label: 'Line num color',    value: attributes.lineNumColor,  onChange: function (v) { setAttributes({ lineNumColor:  v }); } },
                { label: 'Error BG',          value: attributes.errorBg,       onChange: function (v) { setAttributes({ errorBg:       v }); } },
                { label: 'Error text',        value: attributes.errorColor,    onChange: function (v) { setAttributes({ errorColor:    v }); } },
                { label: 'Success',           value: attributes.successColor,  onChange: function (v) { setAttributes({ successColor:  v }); } },
                { label: 'Title',             value: attributes.titleColor,    onChange: function (v) { setAttributes({ titleColor:    v }); } },
                { label: 'Subtitle',          value: attributes.subtitleColor, onChange: function (v) { setAttributes({ subtitleColor: v }); } }
            ];

            /* Editor preview */
            var sampleOutput = '{\n  "name": "Blockenberg",\n  "version": 1,\n  "features": [\n    "WYSIWYG",\n    "rich settings",\n    "frontend rendering"\n  ]\n}';

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        togCtrl('Show title',    'showTitle'),
                        attributes.showTitle && el(TextControl, {
                            __nextHasNoMarginBottom: true, label: 'Title', value: attributes.title,
                            onChange: function (v) { setAttributes({ title: v }); }
                        }),
                        togCtrl('Show subtitle', 'showSubtitle'),
                        attributes.showSubtitle && el(TextControl, {
                            __nextHasNoMarginBottom: true, label: 'Subtitle', value: attributes.subtitle,
                            onChange: function (v) { setAttributes({ subtitle: v }); }
                        }),
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true, label: 'Indent size',
                            value: attributes.indentSize.toString(),
                            options: [
                                { label: '2 spaces', value: '2' },
                                { label: '4 spaces', value: '4' },
                                { label: '1 tab',    value: '1' }
                            ],
                            onChange: function (v) { setAttributes({ indentSize: parseInt(v) }); }
                        })
                    ),
                    el(PanelBody, { title: 'Display', initialOpen: false },
                        togCtrl('Show line numbers', 'showLineNums'),
                        togCtrl('Show stats bar',    'showStats'),
                        rng('Editor font size (px)', 'editorFontSize', 10, 20),
                        rng('Editor height (px)',    'editorHeight',   180, 800, 10)
                    ),
                    el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colors }),
                    el(PanelBody, { title: 'Sizing', initialOpen: false },
                        rng('Max width (px)',       'maxWidth',       400, 1400, 10),
                        rng('Card radius (px)',     'cardRadius',     0,   32),
                        rng('Editor radius (px)',   'editorRadius',   0,   20),
                        rng('Title size (px)',      'titleSize',      18,  48),
                        rng('Padding top (px)',     'paddingTop',     0,   160, 4),
                        rng('Padding bottom (px)',  'paddingBottom',  0,   160, 4)
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: 'Title', value: attributes.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el('p', { style: { margin: '16px 0 4px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#1e1e1e' } }, 'Output / Code'),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Size (px)', value: attributes.outputFontSize, min: 8, max: 72, onChange: function(v){ setAttributes({ outputFontSize: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Weight', value: attributes.outputFontWeight, min: 100, max: 900, step: 100, onChange: function(v){ setAttributes({ outputFontWeight: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Line Height', value: attributes.outputLineHeight, min: 0.8, max: 3, step: 0.1, onChange: function(v){ setAttributes({ outputLineHeight: v }); } })
                    ),

                ),
                el('div', blockProps,
                    el('div', {
                        style: {
                            background: attributes.cardBg, borderRadius: attributes.cardRadius + 'px',
                            maxWidth: attributes.maxWidth + 'px', margin: '0 auto', padding: '36px 32px',
                            boxShadow: '0 4px 32px rgba(0,0,0,0.08)'
                        }
                    },
                        attributes.showTitle && el('div', {
                            className: 'bkbg-jf-title',
                            style: { color: attributes.titleColor, marginBottom: '6px', textAlign: 'center' }
                        }, attributes.title),
                        attributes.showSubtitle && el('div', {
                            style: { fontSize: '14px', color: attributes.subtitleColor, marginBottom: '24px', textAlign: 'center' }
                        }, attributes.subtitle),
                        /* Toolbar buttons preview */
                        el('div', { style: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' } },
                            ['Format', 'Minify', 'Validate', 'Copy', 'Clear'].map(function (t, i) {
                                var isPrimary = i <= 1;
                                return el('div', {
                                    key: t,
                                    style: {
                                        padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                                        background: isPrimary ? attributes.accentColor : '#f3f4f6',
                                        color: isPrimary ? '#fff' : '#374151',
                                        display: 'inline-block'
                                    }
                                }, t);
                            })
                        ),
                        /* Editor preview */
                        el('div', {
                            style: {
                                background: attributes.editorBg, borderRadius: attributes.editorRadius + 'px',
                                padding: '16px', fontFamily: 'monospace', fontSize: attributes.editorFontSize + 'px',
                                color: attributes.editorText, height: '160px', overflow: 'hidden',
                                whiteSpace: 'pre', lineHeight: '1.6'
                            }
                        }, sampleOutput)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-jf-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
