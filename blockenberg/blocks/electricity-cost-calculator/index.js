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

    var _ecTC, _ecTV;
    function _tc() { return _ecTC || (_ecTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_ecTV || (_ecTV = window.bkbgTypoCssVars)) ? _ecTV(t, p) : {}; }

    var PRESETS = [
        { name: 'Refrigerator',    watts: 150,  hours: 24  },
        { name: 'LED TV 55"',      watts: 100,  hours: 5   },
        { name: 'Washing Machine', watts: 500,  hours: 1   },
        { name: 'Air Conditioner', watts: 1500, hours: 8   },
        { name: 'LED Light Bulb',  watts: 10,   hours: 6   },
        { name: 'Laptop',          watts: 60,   hours: 8   },
        { name: 'Desktop PC',      watts: 300,  hours: 6   },
        { name: 'Microwave',       watts: 1000, hours: 0.5 }
    ];

    var SAMPLE = [
        { name: 'Refrigerator', watts: 150,  hours: 24 },
        { name: 'Laptop',       watts: 60,   hours: 8  },
        { name: 'LED TV 55"',   watts: 100,  hours: 5  }
    ];

    function calcCost(watts, hours, rate) {
        var kwhDay = watts / 1000 * hours;
        return {
            kwhDay: kwhDay,
            kwhMonth: kwhDay * 30.44,
            costDay: kwhDay * rate,
            costMonth: kwhDay * 30.44 * rate,
            costYear: kwhDay * 365 * rate
        };
    }

    function fmt(n, cur) { return cur + n.toFixed(2); }

    registerBlockType('blockenberg/electricity-cost-calculator', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-ec-editor-wrap', style: Object.assign({}, _tv(a.typoTitle || {}, '--bkbg-ec-ttl-'), _tv(a.typoSubtitle || {}, '--bkbg-ec-sub-')) });

            var rate = a.defaultRate;
            var totalCostMonth = SAMPLE.reduce(function (acc, item) {
                return acc + calcCost(item.watts, item.hours, rate).costMonth;
            }, 0);

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

            var inputStyle = {
                background: a.inputBg,
                border: '1px solid #fcd34d',
                borderRadius: '6px',
                padding: '7px 10px',
                fontSize: '14px',
                width: '80px'
            };

            var btnStyle = {
                background: a.accentColor,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
            };

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
                        { title: __('Calculator Settings', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            label: __('Currency Symbol', 'blockenberg'),
                            value: a.currency,
                            onChange: function (v) { setAttributes({ currency: v }); }
                        }),
                        el(TextControl, {
                            label: __('Default Rate per kWh', 'blockenberg'),
                            type: 'number',
                            value: String(a.defaultRate),
                            onChange: function (v) { setAttributes({ defaultRate: parseFloat(v) || 0.12 }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Preset Appliances', 'blockenberg'),
                            checked: a.showPresets,
                            onChange: function (v) { setAttributes({ showPresets: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Carbon Footprint', 'blockenberg'),
                            checked: a.showCarbon,
                            onChange: function (v) { setAttributes({ showCarbon: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Cost Chart', 'blockenberg'),
                            checked: a.showChart,
                            onChange: function (v) { setAttributes({ showChart: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(
                        PanelBody,
                        { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: function (v) { setAttributes({ typoTitle: v }); }, defaultSize: a.titleFontSize || 26 }),
                        _tc() && el(_tc(), { label: __('Subtitle'), typo: a.typoSubtitle || {}, onChange: function (v) { setAttributes({ typoSubtitle: v }); }, defaultSize: a.subtitleFontSize || 15 })
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
                            title: __('Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: a.accentColor,   onChange: function (v) { setAttributes({ accentColor: v || '#f59e0b' }); },   label: __('Accent / Button', 'blockenberg') },
                                { value: a.sectionBg,     onChange: function (v) { setAttributes({ sectionBg: v || '#fffbeb' }); },     label: __('Section Background', 'blockenberg') },
                                { value: a.cardBg,        onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); },        label: __('Card Background', 'blockenberg') },
                                { value: a.inputBg,       onChange: function (v) { setAttributes({ inputBg: v || '#fef9c3' }); },       label: __('Input Background', 'blockenberg') },
                                { value: a.lowCostColor,  onChange: function (v) { setAttributes({ lowCostColor: v || '#22c55e' }); },  label: __('Low Cost Color', 'blockenberg') },
                                { value: a.highCostColor, onChange: function (v) { setAttributes({ highCostColor: v || '#ef4444' }); }, label: __('High Cost Color', 'blockenberg') },
                                { value: a.titleColor,    onChange: function (v) { setAttributes({ titleColor: v || '#92400e' }); },    label: __('Title Color', 'blockenberg') },
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
                        a.showTitle && el('div', { className: 'bkbg-ec-title', style: { color: a.titleColor } }, a.title),
                        a.showSubtitle && el('div', { className: 'bkbg-ec-subtitle', style: { color: a.subtitleColor, marginBottom: '20px' } }, a.subtitle),
                        // Rate card
                        el('div', { style: Object.assign({}, cardStyle, { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }) },
                            el('div', { style: { color: a.labelColor, fontWeight: '600', fontSize: '14px' } }, 'Rate per kWh:'),
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                                el('span', { style: { color: a.labelColor } }, a.currency),
                                el('input', { style: inputStyle, type: 'number', value: a.defaultRate, readOnly: true }),
                                el('span', { style: { color: a.labelColor, fontSize: '13px' } }, '/ kWh')
                            )
                        ),
                        // Appliances card
                        el('div', { style: cardStyle },
                            el('div', { style: { fontSize: '15px', fontWeight: '700', color: a.labelColor, marginBottom: '14px' } }, 'Appliances'),
                            SAMPLE.map(function (item, i) {
                                var cost = calcCost(item.watts, item.hours, rate);
                                return el('div', {
                                    key: i,
                                    style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }
                                },
                                    el('input', { style: Object.assign({}, inputStyle, { width: '140px' }), type: 'text', value: item.name, readOnly: true }),
                                    el('input', { style: inputStyle, type: 'number', value: item.watts, readOnly: true }),
                                    el('span', { style: { color: a.subtitleColor, fontSize: '12px' } }, 'W'),
                                    el('input', { style: inputStyle, type: 'number', value: item.hours, readOnly: true }),
                                    el('span', { style: { color: a.subtitleColor, fontSize: '12px' } }, 'h/day'),
                                    el('span', { style: { color: a.accentColor, fontWeight: '600', fontSize: '14px', marginLeft: 'auto' } }, fmt(cost.costMonth, a.currency) + '/mo')
                                );
                            }),
                            el('button', {
                                style: Object.assign({}, btnStyle, { marginTop: '12px', width: '100%' })
                            }, '+ Add Appliance')
                        ),
                        // Total summary card
                        el('div', { style: Object.assign({}, cardStyle, { background: a.accentColor }) },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' } },
                                ['Daily', 'Monthly', 'Yearly'].map(function (label, i) {
                                    var mult = [1, 30.44, 365][i];
                                    var dayTotal = SAMPLE.reduce(function (acc, item) { return acc + calcCost(item.watts, item.hours, rate).costDay; }, 0);
                                    return el('div', { key: label, style: { textAlign: 'center', color: '#fff' } },
                                        el('div', { style: { fontSize: '22px', fontWeight: '700' } }, fmt(dayTotal * mult, a.currency)),
                                        el('div', { style: { fontSize: '12px', opacity: 0.85 } }, label)
                                    );
                                })
                            )
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
                    className: 'bkbg-ec-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
