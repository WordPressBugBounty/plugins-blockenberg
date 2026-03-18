( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var MODES = [
        { id: 'paragraphs', label: 'Paragraphs' },
        { id: 'sentences',  label: 'Sentences'  },
        { id: 'words',      label: 'Words'       },
        { id: 'list',       label: 'List'        }
    ];

    registerBlockType('blockenberg/lorem-ipsum-generator', {
        edit: function (props) {
            var attributes    = props.attributes;
            var setAttributes = props.setAttributes;
            var activeMode    = useState(attributes.defaultMode || 'paragraphs');
            var mode = activeMode[0]; var setMode = activeMode[1];

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {
                    background:    attributes.sectionBg,
                    paddingTop:    attributes.paddingTop    + 'px',
                    paddingBottom: attributes.paddingBottom + 'px'
                };
                if (_tvFn) {
                    Object.assign(s, _tvFn(attributes.titleTypo, '--bkbg-lig-tt-'));
                    Object.assign(s, _tvFn(attributes.subtitleTypo, '--bkbg-lig-st-'));
                    Object.assign(s, _tvFn(attributes.outputTypo, '--bkbg-lig-out-'));
                }
                return { style: s };
            })());

            function togCtrl(label, key) {
                return el(ToggleControl, {
                    __nextHasNoMarginBottom: true, label: label, checked: attributes[key],
                    onChange: function (v) { var o = {}; o[key] = v; setAttributes(o); }
                });
            }
            function rng(label, key, min, max, step) {
                return el(RangeControl, {
                    __nextHasNoMarginBottom: true, label: label, value: attributes[key], min: min, max: max, step: step || 1,
                    onChange: function (v) { var o = {}; o[key] = v; setAttributes(o); }
                });
            }

            var colors = [
                { label: 'Accent / buttons', value: attributes.accentColor,     onChange: function (v) { setAttributes({ accentColor:     v }); } },
                { label: 'Section BG',       value: attributes.sectionBg,       onChange: function (v) { setAttributes({ sectionBg:       v }); } },
                { label: 'Card BG',          value: attributes.cardBg,          onChange: function (v) { setAttributes({ cardBg:          v }); } },
                { label: 'Output BG',        value: attributes.outputBg,        onChange: function (v) { setAttributes({ outputBg:        v }); } },
                { label: 'Output border',    value: attributes.outputBorder,    onChange: function (v) { setAttributes({ outputBorder:    v }); } },
                { label: 'Output text',      value: attributes.outputTextColor, onChange: function (v) { setAttributes({ outputTextColor: v }); } },
                { label: 'Title',            value: attributes.titleColor,      onChange: function (v) { setAttributes({ titleColor:      v }); } },
                { label: 'Subtitle',         value: attributes.subtitleColor,   onChange: function (v) { setAttributes({ subtitleColor:   v }); } },
                { label: 'Label',            value: attributes.labelColor,      onChange: function (v) { setAttributes({ labelColor:      v }); } },
                { label: 'Tab BG',           value: attributes.tabBg,           onChange: function (v) { setAttributes({ tabBg:           v }); } }
            ];

            var accent = attributes.accentColor || '#6c3fb5';
            var label = { paragraphs: 'paragraphs', sentences: 'sentences', words: 'words', list: 'items' }[mode] || 'paragraphs';

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
                            __nextHasNoMarginBottom: true, label: 'Default mode',
                            value: attributes.defaultMode,
                            options: MODES,
                            onChange: function (v) { setAttributes({ defaultMode: v }); }
                        }),
                        rng('Default count', 'defaultCount', 1, 20)
                    ),
                    el(PanelBody, { title: 'Options', initialOpen: false },
                        togCtrl('Start with "Lorem ipsum…"', 'startWithLorem'),
                        togCtrl('Show HTML toggle',          'showHtmlToggle'),
                        togCtrl('Show word/char stats',      'showStats'),
                        rng('Output height (px)',    'outputHeight',   120, 600, 10)
                    ),
                    el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colors }),
                    el(PanelBody, { title: 'Sizing', initialOpen: false },
                        rng('Max width (px)',      'maxWidth',      400, 1400, 10),
                        rng('Card radius (px)',    'cardRadius',    0,   32),
                        rng('Output radius (px)', 'outputRadius',  0,   24),
                        rng('Padding top (px)',    'paddingTop',    0,   160, 4),
                        rng('Padding bottom (px)', 'paddingBottom', 0,   160, 4)
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypoControl(), { label: 'Title', value: attributes.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el(getTypoControl(), { label: 'Subtitle', value: attributes.subtitleTypo, onChange: function (v) { setAttributes({ subtitleTypo: v }); } }),
                        el(getTypoControl(), { label: 'Output Text', value: attributes.outputTypo, onChange: function (v) { setAttributes({ outputTypo: v }); } })
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
                            className: 'bkbg-lig-title',
                            style: { color: attributes.titleColor, textAlign: 'center', marginBottom: '6px' }
                        }, attributes.title),
                        attributes.showSubtitle && el('div', {
                            className: 'bkbg-lig-subtitle',
                            style: { color: attributes.subtitleColor, textAlign: 'center', marginBottom: '24px' }
                        }, attributes.subtitle),
                        /* Mode tabs */
                        el('div', { style: { display: 'flex', background: attributes.tabBg, borderRadius: '10px', padding: '4px', marginBottom: '20px', gap: '4px' } },
                            MODES.map(function (m) {
                                var active = m.id === mode;
                                return el('button', {
                                    key: m.id,
                                    onClick: function () { setMode(m.id); },
                                    style: {
                                        flex: '1', padding: '9px', fontSize: '13px', fontWeight: '700',
                                        background: active ? accent : 'transparent',
                                        color: active ? '#fff' : '#6b7280',
                                        border: 'none', borderRadius: '7px', cursor: 'pointer',
                                        transition: 'all 0.18s'
                                    }
                                }, m.label);
                            })
                        ),
                        /* Count & buttons row */
                        el('div', { style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' } },
                            el('div', {
                                style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: attributes.tabBg, borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }
                            }, attributes.defaultCount + ' ' + label),
                            el('div', { style: { display: 'flex', gap: '8px' } },
                                ['Generate', '📋 Copy'].map(function (t, i) {
                                    return el('div', {
                                        key: t,
                                        style: {
                                            padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                                            background: i === 0 ? accent : '#f3f4f6',
                                            color: i === 0 ? '#fff' : '#374151', display: 'inline-block'
                                        }
                                    }, t);
                                })
                            )
                        ),
                        /* Output preview */
                        el('div', {
                            className: 'bkbg-lig-output',
                            style: {
                                background: attributes.outputBg, border: '1.5px solid ' + attributes.outputBorder,
                                borderRadius: attributes.outputRadius + 'px', padding: '16px 18px',
                                color: attributes.outputTextColor, height: attributes.outputHeight + 'px',
                                overflow: 'hidden'
                            }
                        }, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat…')
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-lig-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
