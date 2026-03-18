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
    var TextareaControl    = wp.components.TextareaControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/statistics-calculator', {
        edit: function (props) {
            var attributes  = props.attributes;
            var setAttributes = props.setAttributes;

            var tv = getTypoCssVars();
            var blockProps = useBlockProps({ style: (function () {
                var s = {
                    background:    attributes.sectionBg,
                    paddingTop:    attributes.paddingTop    + 'px',
                    paddingBottom: attributes.paddingBottom + 'px',
                    '--bkstc-tt-sz': attributes.titleSize + 'px',
                    '--bkstc-tt-wt': attributes.titleFontWeight || '800',
                    '--bkstc-tt-lh': attributes.titleLineHeight,
                    '--bkstc-st-sz': (attributes.subtitleFontSize || 14) + 'px',
                    '--bkstc-st-lh': attributes.subtitleLineHeight
                };
                Object.assign(s, tv(attributes.titleTypo, '--bkstc-tt-'));
                Object.assign(s, tv(attributes.subtitleTypo, '--bkstc-st-'));
                return s;
            }()) });

            function togCtrl(label, key) {
                return el(ToggleControl, {
                    __nextHasNoMarginBottom: true,
                    label:   label,
                    checked: attributes[key],
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
                { label: 'Accent',           value: attributes.accentColor,   onChange: function (v) { setAttributes({ accentColor: v   }); } },
                { label: 'Mean color',        value: attributes.meanColor,     onChange: function (v) { setAttributes({ meanColor: v     }); } },
                { label: 'Median color',      value: attributes.medianColor,   onChange: function (v) { setAttributes({ medianColor: v   }); } },
                { label: 'Mode color',        value: attributes.modeColor,     onChange: function (v) { setAttributes({ modeColor: v     }); } },
                { label: 'Std Dev color',     value: attributes.stdDevColor,   onChange: function (v) { setAttributes({ stdDevColor: v   }); } },
                { label: 'Bar / histogram',   value: attributes.barColor,      onChange: function (v) { setAttributes({ barColor: v      }); } },
                { label: 'Section BG',        value: attributes.sectionBg,     onChange: function (v) { setAttributes({ sectionBg: v     }); } },
                { label: 'Card BG',           value: attributes.cardBg,        onChange: function (v) { setAttributes({ cardBg: v        }); } },
                { label: 'Stat card BG',      value: attributes.statCardBg,    onChange: function (v) { setAttributes({ statCardBg: v    }); } },
                { label: 'Title',             value: attributes.titleColor,    onChange: function (v) { setAttributes({ titleColor: v    }); } },
                { label: 'Subtitle',          value: attributes.subtitleColor, onChange: function (v) { setAttributes({ subtitleColor: v }); } },
                { label: 'Label',             value: attributes.labelColor,    onChange: function (v) { setAttributes({ labelColor: v    }); } },
                { label: 'Input BG',          value: attributes.inputBg,       onChange: function (v) { setAttributes({ inputBg: v       }); } },
                { label: 'Input border',      value: attributes.inputBorder,   onChange: function (v) { setAttributes({ inputBorder: v   }); } }
            ];

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
                        el(TextControl, {
                            __nextHasNoMarginBottom: true, label: 'Default dataset (comma/space sep.)',
                            value: attributes.defaultData,
                            onChange: function (v) { setAttributes({ defaultData: v }); }
                        }),
                        rng('Decimal places', 'decimalPlaces', 0, 10)
                    ),
                    el(PanelBody, { title: 'Display', initialOpen: false },
                        togCtrl('Show histogram', 'showHistogram'),
                        togCtrl('Show box plot',  'showBoxPlot'),
                        togCtrl('Show sorted list','showSortedList')
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl()({ label: __('Title', 'blockenberg'), value: attributes.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        getTypoControl()({ label: __('Subtitle', 'blockenberg'), value: attributes.subtitleTypo, onChange: function (v) { setAttributes({ subtitleTypo: v }); } })
                    ),
                    el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colors }),
                    el(PanelBody, { title: 'Sizing', initialOpen: false },
                        rng('Max width (px)',       'maxWidth',       400, 1200, 10),
                        rng('Card radius (px)',     'cardRadius',     0,   32),
                        rng('Stat radius (px)',     'statRadius',     0,   24),
                        rng('Input radius (px)',    'inputRadius',    0,   24),
                        rng('Padding top (px)',     'paddingTop',     0,   160, 4),
                        rng('Padding bottom (px)',  'paddingBottom',  0,   160, 4)
                    )
                ),
                el('div', blockProps,
                    el('div', {
                        style: {
                            background: attributes.cardBg, borderRadius: attributes.cardRadius + 'px',
                            maxWidth: attributes.maxWidth + 'px', margin: '0 auto', padding: '40px 36px',
                            boxShadow: '0 4px 32px rgba(0,0,0,0.08)'
                        }
                    },
                        attributes.showTitle && el('div', {
                            className: 'bkbg-stc-title',
                            style: { color: attributes.titleColor, marginBottom: '6px' }
                        }, attributes.title),
                        attributes.showSubtitle && el('div', {
                            className: 'bkbg-stc-subtitle',
                            style: { color: attributes.subtitleColor, marginBottom: '24px' }
                        }, attributes.subtitle),
                        el('div', { style: { fontSize: '13px', color: attributes.labelColor, fontWeight: '600', marginBottom: '6px' } }, 'Dataset'),
                        el('div', {
                            style: {
                                background: attributes.inputBg, border: '1.5px solid ' + attributes.inputBorder,
                                borderRadius: attributes.inputRadius + 'px', padding: '12px 14px',
                                fontFamily: 'monospace', fontSize: '14px', color: '#374151'
                            }
                        }, attributes.defaultData),
                        el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '24px' } },
                            [
                                { label: 'Mean',    color: attributes.meanColor,   val: '—' },
                                { label: 'Median',  color: attributes.medianColor, val: '—' },
                                { label: 'Mode',    color: attributes.modeColor,   val: '—' },
                                { label: 'Std Dev', color: attributes.stdDevColor, val: '—' },
                                { label: 'Min',     color: attributes.accentColor, val: '—' },
                                { label: 'Max',     color: attributes.accentColor, val: '—' }
                            ].map(function (s) {
                                return el('div', {
                                    key: s.label,
                                    style: {
                                        background: attributes.statCardBg, borderRadius: attributes.statRadius + 'px',
                                        padding: '14px 12px', textAlign: 'center',
                                        borderTop: '3px solid ' + s.color
                                    }
                                },
                                    el('div', { style: { fontSize: '11px', fontWeight: '700', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, s.label),
                                    el('div', { style: { fontSize: '22px', fontWeight: '800', color: s.color } }, s.val)
                                );
                            })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-stc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
