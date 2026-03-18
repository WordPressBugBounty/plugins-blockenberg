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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/net-worth-calculator', {
        edit: function (props) {
            var attributes    = props.attributes;
            var setAttributes = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {
                    background:    attributes.sectionBg,
                    paddingTop:    attributes.paddingTop    + 'px',
                    paddingBottom: attributes.paddingBottom + 'px'
                };
                if (_tvf) {
                    Object.assign(s, _tvf(attributes.titleTypo, '--bkbg-nwc-tt-'));
                    Object.assign(s, _tvf(attributes.subtitleTypo, '--bkbg-nwc-st-'));
                }
                return { className: 'bkbg-nwc-wrap', style: s };
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
                { label: 'Accent',          value: attributes.accentColor,      onChange: function (v) { setAttributes({ accentColor:      v }); } },
                { label: 'Asset bar',       value: attributes.assetColor,       onChange: function (v) { setAttributes({ assetColor:       v }); } },
                { label: 'Liability bar',   value: attributes.liabilityColor,   onChange: function (v) { setAttributes({ liabilityColor:   v }); } },
                { label: 'Net positive',    value: attributes.netPositiveColor,  onChange: function (v) { setAttributes({ netPositiveColor: v }); } },
                { label: 'Net negative',    value: attributes.netNegativeColor,  onChange: function (v) { setAttributes({ netNegativeColor: v }); } },
                { label: 'Cash color',      value: attributes.cashColor,        onChange: function (v) { setAttributes({ cashColor:        v }); } },
                { label: 'Investments',     value: attributes.investColor,      onChange: function (v) { setAttributes({ investColor:      v }); } },
                { label: 'Real estate',     value: attributes.realEstateColor,  onChange: function (v) { setAttributes({ realEstateColor:  v }); } },
                { label: 'Vehicles',        value: attributes.vehicleColor,     onChange: function (v) { setAttributes({ vehicleColor:     v }); } },
                { label: 'Other assets',    value: attributes.otherAssetColor,  onChange: function (v) { setAttributes({ otherAssetColor:  v }); } },
                { label: 'Section BG',      value: attributes.sectionBg,        onChange: function (v) { setAttributes({ sectionBg:        v }); } },
                { label: 'Card BG',         value: attributes.cardBg,           onChange: function (v) { setAttributes({ cardBg:           v }); } },
                { label: 'Panel BG',        value: attributes.panelBg,          onChange: function (v) { setAttributes({ panelBg:          v }); } },
                { label: 'Title',           value: attributes.titleColor,       onChange: function (v) { setAttributes({ titleColor:       v }); } },
                { label: 'Subtitle',        value: attributes.subtitleColor,    onChange: function (v) { setAttributes({ subtitleColor:    v }); } },
                { label: 'Label',           value: attributes.labelColor,       onChange: function (v) { setAttributes({ labelColor:       v }); } },
                { label: 'Input BG',        value: attributes.inputBg,          onChange: function (v) { setAttributes({ inputBg:          v }); } },
                { label: 'Input border',    value: attributes.inputBorder,      onChange: function (v) { setAttributes({ inputBorder:      v }); } }
            ];

            var assetC = attributes.assetColor || '#10b981';
            var liabC  = attributes.liabilityColor || '#ef4444';

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
                            __nextHasNoMarginBottom: true, label: 'Currency symbol', value: attributes.currency,
                            onChange: function (v) { setAttributes({ currency: v }); }
                        })
                    ),
                    el(PanelBody, { title: 'Display', initialOpen: false },
                        togCtrl('Show bar chart',   'showChart'),
                        togCtrl('Show breakdown',   'showBreakdown')
                    ),
                    el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colors }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: 'Title Typography', value: attributes.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Subtitle Typography', value: attributes.subtitleTypo, onChange: function (v) { setAttributes({ subtitleTypo: v }); } })
                    ),
                    el(PanelBody, { title: 'Sizing', initialOpen: false },
                        rng('Max width (px)',       'maxWidth',       400, 1200, 10),
                        rng('Card radius (px)',     'cardRadius',     0,   32),
                        rng('Panel radius (px)',    'panelRadius',    0,   24),
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
                        attributes.showTitle && el('div', { className: 'bkbg-nwc-title', style: { color: attributes.titleColor, textAlign: 'center', marginBottom: '6px' } }, attributes.title),
                        attributes.showSubtitle && el('div', { className: 'bkbg-nwc-subtitle', style: { color: attributes.subtitleColor, textAlign: 'center', marginBottom: '28px' } }, attributes.subtitle),
                        el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' } },
                            el('div', { style: { background: attributes.panelBg, borderRadius: attributes.panelRadius + 'px', padding: '20px', borderTop: '3px solid ' + assetC } },
                                el('div', { style: { fontSize: '13px', fontWeight: '700', color: assetC, marginBottom: '12px' } }, '💰 Assets'),
                                ['Cash & Bank', 'Investments', 'Real Estate', 'Vehicles', 'Other'].map(function (label) {
                                    return el('div', { key: label, style: { marginBottom: '10px' } },
                                        el('div', { style: { fontSize: '12px', fontWeight: '600', color: attributes.labelColor, marginBottom: '4px' } }, label),
                                        el('div', { style: { background: attributes.inputBg, border: '1.5px solid ' + attributes.inputBorder, borderRadius: attributes.inputRadius + 'px', padding: '8px 12px', fontSize: '14px', color: '#9ca3af' } }, attributes.currency + '0')
                                    );
                                })
                            ),
                            el('div', { style: { background: attributes.panelBg, borderRadius: attributes.panelRadius + 'px', padding: '20px', borderTop: '3px solid ' + liabC } },
                                el('div', { style: { fontSize: '13px', fontWeight: '700', color: liabC, marginBottom: '12px' } }, '💳 Liabilities'),
                                ['Mortgage', 'Car Loans', 'Credit Cards', 'Student Loans', 'Other Debts'].map(function (label) {
                                    return el('div', { key: label, style: { marginBottom: '10px' } },
                                        el('div', { style: { fontSize: '12px', fontWeight: '600', color: attributes.labelColor, marginBottom: '4px' } }, label),
                                        el('div', { style: { background: attributes.inputBg, border: '1.5px solid ' + attributes.inputBorder, borderRadius: attributes.inputRadius + 'px', padding: '8px 12px', fontSize: '14px', color: '#9ca3af' } }, attributes.currency + '0')
                                    );
                                })
                            )
                        ),
                        el('div', { style: { background: assetC + '15', border: '2px solid ' + assetC + '44', borderRadius: '12px', padding: '20px', textAlign: 'center' } },
                            el('div', { style: { fontSize: '12px', fontWeight: '700', color: assetC, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' } }, 'Net Worth'),
                            el('div', { style: { fontSize: '40px', fontWeight: '900', color: assetC } }, attributes.currency + '0'),
                            el('div', { style: { fontSize: '13px', color: '#6b7280', marginTop: '4px' } }, 'Total assets minus total liabilities')
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-nwc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
