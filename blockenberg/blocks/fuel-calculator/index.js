( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _fuelTC, _fuelTV;
    function _tc() { return _fuelTC || (_fuelTC = window.bkbgTypographyControl); }
    function _tv() { return _fuelTV || (_fuelTV = window.bkbgTypoCssVars); }

    /* ── Unit definitions ──────────────────────────── */
    var UNITS = {
        mpg:    { distLabel: 'Distance (miles)', effLabel: 'Fuel Economy (MPG)', priceLabel: 'Fuel Price (per gallon)', volUnit: 'gal', distUnit: 'mi' },
        lper100:{ distLabel: 'Distance (km)', effLabel: 'Fuel Economy (L/100km)', priceLabel: 'Fuel Price (per litre)', volUnit: 'L', distUnit: 'km' },
        kmpl:   { distLabel: 'Distance (km)', effLabel: 'Fuel Economy (km/L)', priceLabel: 'Fuel Price (per litre)', volUnit: 'L', distUnit: 'km' }
    };

    function calcFuel(dist, eff, price, unit) {
        var litres = 0;
        if (unit === 'mpg') {
            /* 1 US gallon = 3.78541 L, 1 mile = 1.60934 km */
            var gallons = eff > 0 ? dist / eff : 0;
            litres = gallons * 3.78541;
            return { cost: gallons * price, litres: litres, gallons: gallons };
        } else if (unit === 'lper100') {
            litres = eff > 0 ? (dist / 100) * eff : 0;
            return { cost: litres * price, litres: litres, gallons: litres / 3.78541 };
        } else { /* kmpl */
            litres = eff > 0 ? dist / eff : 0;
            return { cost: litres * price, litres: litres, gallons: litres / 3.78541 };
        }
    }

    /* CO2: gasoline ≈ 2.31 kg/L, diesel ≈ 2.68 kg/L — use gasoline */
    function co2Kg(litres) { return litres * 2.31; }

    /* ── Preview ────────────────────────────────────── */
    function FuelPreview(props) {
        var a = props.attrs;
        var u = UNITS[a.unit] || UNITS.mpg;
        var res = calcFuel(a.defaultDist, a.defaultEff, a.defaultPrice, a.unit);
        var totalCost = res.cost;
        var perPerson = a.defaultPassengers > 0 ? totalCost / a.defaultPassengers : totalCost;
        var co2 = co2Kg(res.litres);

        var wrapStyle = {
            paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px',
            background: a.sectionBg || undefined
        };
        var cardStyle = {
            background: a.cardBg, borderRadius: a.cardRadius + 'px',
            padding: '32px', maxWidth: a.maxWidth + 'px', margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        };

        function inputRow(label, val, suffix) {
            return el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' } },
                el('label', { style: { color: a.labelColor, fontSize: 14 } }, label),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    el('input', { type: 'number', value: val, readOnly: true, style: { width: 80, textAlign: 'right', border: '1px solid #d1d5db', borderRadius: a.inputRadius + 'px', padding: '4px 8px', fontSize: 14 } }),
                    el('span', { style: { color: a.subtitleColor, fontSize: 13 } }, suffix)
                )
            );
        }

        function statCard(label, val, color) {
            return el('div', { style: { background: a.statCardBg, borderRadius: 12, padding: '16px', textAlign: 'center', flex: 1 } },
                el('div', { style: { fontSize: 20, fontWeight: 700, color: color || a.labelColor } }, val),
                el('div', { style: { fontSize: 12, color: a.subtitleColor, marginTop: 4 } }, label)
            );
        }

        return el('div', { style: wrapStyle },
            (a.showTitle || a.showSubtitle) ? el('div', { style: { textAlign: 'center', marginBottom: 32, maxWidth: a.maxWidth + 'px', margin: '0 auto 32px' } },
                a.showTitle    ? el('h3', { className: 'bkbg-fuel-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title) : null,
                a.showSubtitle ? el('p',  { className: 'bkbg-fuel-subtitle', style: { color: a.subtitleColor, margin: 0 } }, a.subtitle) : null
            ) : null,
            el('div', { style: cardStyle },

                /* Unit toggle */
                el('div', { style: { display: 'flex', gap: 8, marginBottom: 24 } },
                    ['mpg', 'lper100', 'kmpl'].map(function (k) {
                        return el('button', {
                            key: k,
                            style: { flex: 1, padding: '8px', border: 'none', borderRadius: a.inputRadius + 'px', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: a.unit === k ? a.accentColor : a.statCardBg, color: a.unit === k ? '#fff' : a.labelColor }
                        }, k === 'lper100' ? 'L/100km' : k.toUpperCase());
                    })
                ),

                /* Inputs */
                inputRow(u.distLabel, a.defaultDist, u.distUnit),
                inputRow(u.effLabel, a.defaultEff, u.unit === 'mpg' ? 'mpg' : u.unit === 'lper100' ? 'L/100km' : 'km/L'),
                inputRow(u.priceLabel, a.defaultPrice.toFixed(2), a.currency + '/' + u.volUnit),
                a.showPerPerson ? inputRow('Passengers', a.defaultPassengers, 'people') : null,

                /* Result */
                el('div', { style: { background: a.resultBg, border: '2px solid ' + a.resultBorder, borderRadius: a.cardRadius + 'px', padding: '24px', textAlign: 'center', margin: '24px 0' } },
                    el('div', { style: { fontSize: 13, color: a.subtitleColor, marginBottom: 4 } }, 'Total Fuel Cost'),
                    el('div', { className: 'bkbg-fuel-result-value', style: { color: a.totalColor } }, a.currency + totalCost.toFixed(2)),
                    a.showRoundTrip ? el('div', { style: { fontSize: 12, color: a.subtitleColor, marginTop: 4 } }, 'one way  ·  ' + a.currency + (totalCost * 2).toFixed(2) + ' round trip') : null
                ),

                /* Stat cards */
                el('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
                    a.showLitres ? statCard(res.litres > 0 ? (res.litres.toFixed(1) + ' L / ' + res.gallons.toFixed(1) + ' gal') : '—', 'Fuel Used', a.labelColor) : null,
                    a.showPerPerson ? statCard('Per Person', a.currency + perPerson.toFixed(2), a.accentColor) : null,
                    a.showCO2 ? statCard('CO₂ Emitted', co2.toFixed(1) + ' kg', a.co2Color) : null
                )
            )
        );
    }

    /* ── Edit ────────────────────────────────────────── */
    function FuelEdit(props) {
        var a = props.attributes;
        var set = props.setAttributes;
        var blockProps = useBlockProps({ className: 'bkbg-fuel-editor', style: Object.assign({}, _tv()(a.typoTitle, '--bkbg-fuel-tt-'), _tv()(a.typoSubtitle, '--bkbg-fuel-st-'), _tv()(a.typoResult, '--bkbg-fuel-rs-')) });

        function s(key) { return function (v) { var o = {}; o[key] = v; set(o); }; }
        function n(key) { return function (v) { var o = {}; o[key] = Number(v) || 0; set(o); }; }
        function nf(key) { return function (v) { var o = {}; o[key] = parseFloat(v) || 0; set(o); }; }
        function t(key) { return function (v) { var o = {}; o[key] = v; set(o); }; }

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Header */
                el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: t('showTitle'), __nextHasNoMarginBottom: true }),
                    a.showTitle    ? el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: s('title') }) : null,
                    el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: t('showSubtitle'), __nextHasNoMarginBottom: true }),
                    a.showSubtitle ? el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: s('subtitle') }) : null
                ),

                /* Calculator Defaults */
                el(PanelBody, { title: __('Calculator Defaults', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Fuel Unit System', 'blockenberg'), value: a.unit, options: [
                        { label: 'MPG (US)', value: 'mpg' },
                        { label: 'L/100km', value: 'lper100' },
                        { label: 'km/L', value: 'kmpl' }
                    ], onChange: s('unit') }),
                    el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.currency, onChange: s('currency') }),
                    el(TextControl, { label: __('Default Distance', 'blockenberg'), value: String(a.defaultDist), onChange: n('defaultDist'), type: 'number' }),
                    el(TextControl, { label: __('Default Fuel Efficiency', 'blockenberg'), value: String(a.defaultEff), onChange: n('defaultEff'), type: 'number' }),
                    el(TextControl, { label: __('Default Fuel Price', 'blockenberg'), value: String(a.defaultPrice), onChange: nf('defaultPrice'), type: 'number', step: '0.01' }),
                    el(TextControl, { label: __('Default Passengers', 'blockenberg'), value: String(a.defaultPassengers), onChange: n('defaultPassengers'), type: 'number' })
                ),

                /* Display */
                el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Round-Trip Cost', 'blockenberg'), checked: a.showRoundTrip, onChange: t('showRoundTrip'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Cost Per Person', 'blockenberg'), checked: a.showPerPerson, onChange: t('showPerPerson'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Fuel Used (L / gal)', 'blockenberg'), checked: a.showLitres, onChange: t('showLitres'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show CO₂ Emissions', 'blockenberg'), checked: a.showCO2, onChange: t('showCO2'), __nextHasNoMarginBottom: true })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc()({ label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                    _tc()({ label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { set({ typoSubtitle: v }); } }),
                    _tc()({ label: __('Result Value', 'blockenberg'), value: a.typoResult, onChange: function (v) { set({ typoResult: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor,   onChange: s('accentColor'),   label: __('Accent', 'blockenberg') },
                        { value: a.cardBg,         onChange: s('cardBg'),         label: __('Card Background', 'blockenberg') },
                        { value: a.resultBg,       onChange: s('resultBg'),       label: __('Result Box BG', 'blockenberg') },
                        { value: a.resultBorder,   onChange: s('resultBorder'),   label: __('Result Box Border', 'blockenberg') },
                        { value: a.totalColor,     onChange: s('totalColor'),     label: __('Total Cost Color', 'blockenberg') },
                        { value: a.statCardBg,     onChange: s('statCardBg'),     label: __('Stat Card BG', 'blockenberg') },
                        { value: a.co2Color,       onChange: s('co2Color'),       label: __('CO₂ Color', 'blockenberg') },
                        { value: a.titleColor,     onChange: s('titleColor'),     label: __('Title Color', 'blockenberg') },
                        { value: a.subtitleColor,  onChange: s('subtitleColor'),  label: __('Subtitle Color', 'blockenberg') },
                        { value: a.labelColor,     onChange: s('labelColor'),     label: __('Label Color', 'blockenberg') },
                        { value: a.sectionBg,      onChange: s('sectionBg'),      label: __('Section Background', 'blockenberg') }
                    ]
                }),

                /* Sizing */
                el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, onChange: n('cardRadius'), min: 0, max: 32 }),
                    el(RangeControl, { label: __('Input Radius (px)', 'blockenberg'), value: a.inputRadius, onChange: n('inputRadius'), min: 0, max: 20 }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, onChange: n('maxWidth'), min: 320, max: 960, step: 20 }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, onChange: n('paddingTop'), min: 0, max: 160 }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, onChange: n('paddingBottom'), min: 0, max: 160 })
                )
            ),

            el('div', blockProps,
                el(FuelPreview, { attrs: a })
            )
        );
    }

    registerBlockType('blockenberg/fuel-calculator', {
        edit: FuelEdit,
        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-fuel-app',
                'data-opts': JSON.stringify(a)
            }));
        }
    });
}() );
