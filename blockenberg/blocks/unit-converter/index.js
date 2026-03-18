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
    var CheckboxControl   = wp.components.CheckboxControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkuc-tt-');
        _tvf(v, 'subtitleTypo', attrs, '--bkuc-st-');
        return v;
    }

    /* ── Conversion data ────────────────────────────────────────────────────── */
    var CATEGORIES = {
        length: {
            label: 'Length',
            units: {
                meter:       { label: 'Meter (m)',          toBase: 1 },
                kilometer:   { label: 'Kilometer (km)',     toBase: 1000 },
                centimeter:  { label: 'Centimeter (cm)',    toBase: 0.01 },
                millimeter:  { label: 'Millimeter (mm)',    toBase: 0.001 },
                mile:        { label: 'Mile (mi)',          toBase: 1609.344 },
                yard:        { label: 'Yard (yd)',          toBase: 0.9144 },
                foot:        { label: 'Foot (ft)',          toBase: 0.3048 },
                inch:        { label: 'Inch (in)',          toBase: 0.0254 },
                nautical_mile: { label: 'Nautical Mile',   toBase: 1852 },
            },
            defaultFrom: 'meter',
            defaultTo:   'foot',
        },
        weight: {
            label: 'Weight',
            units: {
                kilogram:    { label: 'Kilogram (kg)',      toBase: 1 },
                gram:        { label: 'Gram (g)',           toBase: 0.001 },
                milligram:   { label: 'Milligram (mg)',     toBase: 0.000001 },
                pound:       { label: 'Pound (lb)',         toBase: 0.453592 },
                ounce:       { label: 'Ounce (oz)',         toBase: 0.0283495 },
                ton:         { label: 'Metric Ton (t)',     toBase: 1000 },
                stone:       { label: 'Stone (st)',         toBase: 6.35029 },
            },
            defaultFrom: 'kilogram',
            defaultTo:   'pound',
        },
        temperature: {
            label: 'Temperature',
            units: {
                celsius:    { label: 'Celsius (°C)',    toBase: null },
                fahrenheit: { label: 'Fahrenheit (°F)', toBase: null },
                kelvin:     { label: 'Kelvin (K)',      toBase: null },
            },
            defaultFrom: 'celsius',
            defaultTo:   'fahrenheit',
        },
        volume: {
            label: 'Volume',
            units: {
                liter:      { label: 'Liter (L)',       toBase: 1 },
                milliliter: { label: 'Milliliter (mL)', toBase: 0.001 },
                cubic_meter:{ label: 'Cubic Meter (m³)',toBase: 1000 },
                gallon_us:  { label: 'Gallon (US)',     toBase: 3.78541 },
                gallon_uk:  { label: 'Gallon (UK)',     toBase: 4.54609 },
                quart:      { label: 'Quart (US)',      toBase: 0.946353 },
                pint:       { label: 'Pint (US)',       toBase: 0.473176 },
                cup:        { label: 'Cup (US)',        toBase: 0.236588 },
                fluid_oz:   { label: 'Fluid Oz (US)',   toBase: 0.0295735 },
                tablespoon: { label: 'Tablespoon',      toBase: 0.0147868 },
                teaspoon:   { label: 'Teaspoon',        toBase: 0.00492892 },
            },
            defaultFrom: 'liter',
            defaultTo:   'gallon_us',
        },
        area: {
            label: 'Area',
            units: {
                sqmeter:    { label: 'Square Meter (m²)',   toBase: 1 },
                sqkilometer:{ label: 'Square Km (km²)',     toBase: 1000000 },
                sqcentimeter:{ label:'Square Cm (cm²)',     toBase: 0.0001 },
                sqfoot:     { label: 'Square Foot (ft²)',   toBase: 0.092903 },
                sqinch:     { label: 'Square Inch (in²)',   toBase: 0.00064516 },
                sqyard:     { label: 'Square Yard (yd²)',   toBase: 0.836127 },
                squaremile: { label: 'Square Mile (mi²)',   toBase: 2589988 },
                acre:       { label: 'Acre',                toBase: 4046.86 },
                hectare:    { label: 'Hectare (ha)',        toBase: 10000 },
            },
            defaultFrom: 'sqmeter',
            defaultTo:   'sqfoot',
        },
        speed: {
            label: 'Speed',
            units: {
                ms:     { label: 'Meter/second (m/s)',  toBase: 1 },
                kmh:    { label: 'Km/hour (km/h)',      toBase: 0.277778 },
                mph:    { label: 'Mile/hour (mph)',     toBase: 0.44704 },
                knot:   { label: 'Knot (kn)',           toBase: 0.514444 },
                fts:    { label: 'Foot/second (ft/s)',  toBase: 0.3048 },
                mach:   { label: 'Mach',                toBase: 343 },
            },
            defaultFrom: 'kmh',
            defaultTo:   'mph',
        },
    };

    function convertValue(cat, fromKey, toKey, value) {
        if (isNaN(value) || value === '') return '';
        var num = parseFloat(value);
        if (cat === 'temperature') {
            var c;
            if (fromKey === 'celsius')    c = num;
            else if (fromKey === 'fahrenheit') c = (num - 32) * 5 / 9;
            else c = num - 273.15;

            if (toKey === 'celsius')    return c;
            if (toKey === 'fahrenheit') return c * 9 / 5 + 32;
            return c + 273.15;
        }
        var units = CATEGORIES[cat].units;
        var base  = num * units[fromKey].toBase;
        return base / units[toKey].toBase;
    }

    function fmtResult(val, dp) {
        if (val === '' || isNaN(val)) return '—';
        var n = parseFloat(val);
        if (Math.abs(n) < 1e-10 && n !== 0) return n.toExponential(4);
        return parseFloat(n.toFixed(dp)).toLocaleString('en-US', { maximumFractionDigits: dp });
    }

    /* ── Preview component ──────────────────────────────────────────────────── */
    function ConverterPreview(props) {
        var a    = props.attrs;
        var cats = (a.enabledCategories && a.enabledCategories.length) ? a.enabledCategories : ['length', 'weight', 'temperature'];

        var catState  = useState(a.defaultCategory || 'length');
        var activeCat = catState[0]; var setActiveCat = catState[1];

        var cat = CATEGORIES[activeCat] || CATEGORIES['length'];
        var unitKeys = Object.keys(cat.units);

        var fromState = useState(cat.defaultFrom);
        var fromKey = fromState[0]; var setFromKey = fromState[1];
        var toState   = useState(cat.defaultTo);
        var toKey   = toState[0]; var setToKey   = toState[1];
        var valState  = useState('1');
        var value   = valState[0]; var setValue   = valState[1];

        var result = convertValue(activeCat, fromKey, toKey, value);
        var resultFmt = fmtResult(result, a.decimalPlaces || 4);

        var accent    = a.accentColor       || '#6c3fb5';
        var cRadius   = (a.cardRadius || 16) + 'px';

        var cardStyle = {
            background:    a.cardBg        || '#ffffff',
            borderRadius:  cRadius,
            padding:       '32px',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:      (a.maxWidth || 640) + 'px',
            margin:        '0 auto',
            paddingTop:    (a.paddingTop    || 60) + 'px',
            paddingBottom: (a.paddingBottom || 60) + 'px',
            boxSizing: 'border-box',
        };

        var unitOptions = unitKeys.map(function(k) { return { label: cat.units[k].label, value: k }; });

        return el('div', { className: 'bkbg-uc-card', style: cardStyle },
            a.showTitle && el('h2', { className: 'bkbg-uc-title', style: { color: a.titleColor || '#1e1b4b' } }, a.title || 'Unit Converter'),
            a.showSubtitle && el('p', { className: 'bkbg-uc-subtitle', style: { color: a.subtitleColor || '#6b7280' } }, a.subtitle),

            /* Category tabs */
            a.showCategoryTabs && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px', justifyContent: 'center' } },
                cats.map(function(catKey) {
                    var isActive = activeCat === catKey;
                    var catDef = CATEGORIES[catKey];
                    if (!catDef) return null;
                    return el('button', {
                        key: catKey,
                        onClick: function() {
                            setActiveCat(catKey);
                            setFromKey(CATEGORIES[catKey].defaultFrom);
                            setToKey(CATEGORIES[catKey].defaultTo);
                        },
                        style: {
                            padding: '6px 14px',
                            borderRadius: '99px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '13px',
                            background: isActive ? (a.tabActiveBg || accent) : (a.tabInactiveBg || '#f3f4f6'),
                            color: isActive ? (a.tabActiveColor || '#fff') : (a.tabInactiveColor || '#374151'),
                            transition: 'all 0.2s',
                        }
                    }, catDef.label);
                })
            ),

            /* From / To row */
            el('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'end', marginBottom: '20px' } },
                el('div', null,
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('From', 'blockenberg')),
                    el('select', {
                        value: fromKey,
                        onChange: function(e) { setFromKey(e.target.value); },
                        style: { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', background: '#fff' }
                    }, unitOptions.map(function(o) { return el('option', { key: o.value, value: o.value }, o.label); }))
                ),
                el('button', {
                    onClick: function() { var tmp = fromKey; setFromKey(toKey); setToKey(tmp); },
                    style: { background: 'none', border: '1.5px solid ' + accent, borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', color: accent, fontWeight: 700, fontSize: '18px', lineHeight: 1 }
                }, '⇄'),
                el('div', null,
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('To', 'blockenberg')),
                    el('select', {
                        value: toKey,
                        onChange: function(e) { setToKey(e.target.value); },
                        style: { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', background: '#fff' }
                    }, unitOptions.map(function(o) { return el('option', { key: o.value, value: o.value }, o.label); }))
                )
            ),

            /* Value input */
            el('div', { style: { marginBottom: '20px' } },
                el('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '6px' } }, __('Value', 'blockenberg')),
                el('input', {
                    type: 'number',
                    value: value,
                    onChange: function(e) { setValue(e.target.value); },
                    style: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '18px', boxSizing: 'border-box', outline: 'none' }
                })
            ),

            /* Result */
            el('div', {
                style: {
                    background: a.resultBg || '#f5f3ff',
                    border: '1.5px solid ' + (a.resultBorder || '#ede9fe'),
                    borderRadius: cRadius,
                    padding: '20px 24px',
                    textAlign: 'center',
                }
            },
                el('div', { style: { fontSize: '13px', color: '#9ca3af', marginBottom: '4px' } }, (cat.units[fromKey] ? cat.units[fromKey].label : fromKey) + ' → ' + (cat.units[toKey] ? cat.units[toKey].label : toKey)),
                el('div', {
                    style: { fontSize: (a.resultSize || 40) + 'px', fontWeight: 800, color: a.resultColor || accent, lineHeight: 1.1 }
                }, resultFmt),
                el('div', { style: { fontSize: '14px', color: '#6b7280', marginTop: '4px' } }, cat.units[toKey] ? cat.units[toKey].label : '')
            )
        );
    }

    registerBlockType('blockenberg/unit-converter', {
        edit: function(props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () { var _tv = getTypoCssVars(a); var s = {}; Object.assign(s, _tv); if (a.bgColor) s.background = a.bgColor; return { style: s }; })());

            var ALL_CATS = ['length', 'weight', 'temperature', 'volume', 'area', 'speed'];

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function(v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function(v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function(v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function(v) { setAttr({ subtitle: v }); } }),
                        el(SelectControl, { label: __('Default Category', 'blockenberg'), value: a.defaultCategory, options: ALL_CATS.map(function(k) { return { label: CATEGORIES[k].label, value: k }; }), onChange: function(v) { setAttr({ defaultCategory: v }); } }),
                        el(RangeControl, { label: __('Decimal Places', 'blockenberg'), value: a.decimalPlaces, min: 0, max: 10, onChange: function(v) { setAttr({ decimalPlaces: v }); } })
                    ),

                    el(PanelBody, { title: __('Enabled Categories', 'blockenberg'), initialOpen: false },
                        ALL_CATS.map(function(k) {
                            var enabled = (a.enabledCategories || ALL_CATS).includes(k);
                            return el(CheckboxControl, {
                                key: k,
                                label: CATEGORIES[k].label,
                                checked: enabled,
                                __nextHasNoMarginBottom: true,
                                onChange: function(v) {
                                    var cur = (a.enabledCategories || ALL_CATS).filter(function(x) { return x !== k; });
                                    if (v) cur.push(k);
                                    setAttr({ enabledCategories: ALL_CATS.filter(function(x) { return cur.includes(x); }) });
                                }
                            });
                        })
                    ),

                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Category Tabs', 'blockenberg'), checked: a.showCategoryTabs, onChange: function(v) { setAttr({ showCategoryTabs: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Swap Button', 'blockenberg'), checked: a.showSwapButton, onChange: function(v) { setAttr({ showSwapButton: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Title', 'blockenberg'), 'titleTypo', a, setAttr),
                        getTypoControl(__('Subtitle', 'blockenberg'), 'subtitleTypo', a, setAttr),
                        el(RangeControl, { label: __('Result Number Size (px)', 'blockenberg'), value: a.resultSize, min: 24, max: 80, onChange: function(v) { setAttr({ resultSize: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),         value: a.accentColor,      onChange: function(v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Result Number Color', 'blockenberg'),   value: a.resultColor,      onChange: function(v) { setAttr({ resultColor: v || '#6c3fb5' }); } },
                            { label: __('Active Tab Background', 'blockenberg'), value: a.tabActiveBg,      onChange: function(v) { setAttr({ tabActiveBg: v || '#6c3fb5' }); } },
                            { label: __('Active Tab Text', 'blockenberg'),       value: a.tabActiveColor,   onChange: function(v) { setAttr({ tabActiveColor: v || '#ffffff' }); } },
                            { label: __('Card Background', 'blockenberg'),       value: a.cardBg,           onChange: function(v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Result Background', 'blockenberg'),     value: a.resultBg,         onChange: function(v) { setAttr({ resultBg: v || '#f5f3ff' }); } },
                            { label: __('Section Background', 'blockenberg'),    value: a.bgColor,          onChange: function(v) { setAttr({ bgColor: v || '' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function(v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 320, max: 1200, onChange: function(v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function(v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function(v) { setAttr({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el(ConverterPreview, { attrs: a })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () { var _tv = getTypoCssVars(a); var s = {}; Object.assign(s, _tv); if (a.bgColor) s.background = a.bgColor; return { style: s }; })());
            var opts = JSON.stringify(a);
            return el('div', blockProps,
                el('div', { className: 'bkbg-uc-app', 'data-opts': opts },
                    el('p', { className: 'bkbg-uc-loading' }, 'Loading converter…')
                )
            );
        }
    });
}() );
