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
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;

    var _ccTC, _ccTV;
    function _tc() { return _ccTC || (_ccTC = window.bkbgTypographyControl); }
    function _tv(typo, prefix) { return _ccTV ? _ccTV(typo, prefix) : ((_ccTV = window.bkbgTypoCssVars) ? _ccTV(typo, prefix) : {}); }

    /* ── Static indicative rates (USD base) ─────────────────────────────────── */
    var USD_RATES = {
        USD:1,EUR:0.92,GBP:0.79,JPY:149.5,CAD:1.36,AUD:1.53,CHF:0.90,CNY:7.24,
        INR:83.1,MXN:17.15,BRL:4.97,KRW:1325,SGD:1.34,HKD:7.82,NOK:10.58,SEK:10.42,
        DKK:6.88,NZD:1.63,ZAR:18.63,TRY:32.6,RUB:90.5,PLN:4.03,THB:35.1,MYR:4.72,
        IDR:15650,PHP:56.5,AED:3.67,SAR:3.75,EGP:30.9,NGN:1490,
    };

    var CURRENCIES = Object.keys(USD_RATES).map(function(k) { return { value: k, label: k + ' — ' + getCurrencyName(k) }; });

    function getCurrencyName(code) {
        var names = { USD:'US Dollar',EUR:'Euro',GBP:'British Pound',JPY:'Japanese Yen',CAD:'Canadian Dollar',AUD:'Australian Dollar',CHF:'Swiss Franc',CNY:'Chinese Yuan',INR:'Indian Rupee',MXN:'Mexican Peso',BRL:'Brazilian Real',KRW:'South Korean Won',SGD:'Singapore Dollar',HKD:'Hong Kong Dollar',NOK:'Norwegian Krone',SEK:'Swedish Krona',DKK:'Danish Krone',NZD:'New Zealand Dollar',ZAR:'South African Rand',TRY:'Turkish Lira',RUB:'Russian Ruble',PLN:'Polish Zloty',THB:'Thai Baht',MYR:'Malaysian Ringgit',IDR:'Indonesian Rupiah',PHP:'Philippine Peso',AED:'UAE Dirham',SAR:'Saudi Riyal',EGP:'Egyptian Pound',NGN:'Nigerian Naira' };
        return names[code] || code;
    }

    function convert(amount, from, to) {
        if (!USD_RATES[from] || !USD_RATES[to]) return 0;
        var usd = amount / USD_RATES[from];
        return usd * USD_RATES[to];
    }

    function fmtResult(val) {
        if (isNaN(val)) return '—';
        if (val >= 1000) return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }

    /* ── Preview component ────────────────────────────────────────────────── */
    function ConverterPreview(props) {
        var a      = props.attrs;
        var accent = a.accentColor || '#6c3fb5';
        var cRadius = (a.cardRadius || 16) + 'px';
        var btnR   = (a.btnRadius  || 8)  + 'px';

        var fromState = useState(a.defaultFrom   || 'USD');
        var from = fromState[0]; var setFrom = fromState[1];
        var toState   = useState(a.defaultTo     || 'EUR');
        var to   = toState[0]; var setTo   = toState[1];
        var amtState  = useState(a.defaultAmount || 100);
        var amount = amtState[0]; var setAmount = amtState[1];

        var result = convert(amount, from, to);
        var rate   = convert(1, from, to);

        var quickPairs = a.quickPairs || [['USD','EUR'],['USD','GBP'],['USD','JPY']];

        var cardStyle = {
            background:    a.cardBg        || '#ffffff',
            borderRadius:  cRadius,
            padding:       '32px',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:      (a.maxWidth     || 580) + 'px',
            margin:        '0 auto',
            paddingTop:    (a.paddingTop   || 60)  + 'px',
            paddingBottom: (a.paddingBottom|| 60)  + 'px',
            boxSizing:     'border-box',
        };

        var wrapStyle = Object.assign({},
            cardStyle,
            { '--bkbg-cc-ttl-fs': (a.titleSize || 26) + 'px', '--bkbg-cc-res-fs': (a.resultSize || 40) + 'px' },
            _tv(a.typoTitle, '--bkbg-cc-ttl-'),
            _tv(a.typoResult, '--bkbg-cc-res-')
        );

        return el('div', { style: wrapStyle },
            a.showTitle && el('h2', { className: 'bkbg-cc-title', style: { color: a.titleColor || '#1e1b4b', textAlign: 'center', marginTop: 0, marginBottom: 8 } }, a.title || __('Currency Converter', 'blockenberg')),
            a.showSubtitle && el('p', { style: { color: a.subtitleColor || '#6b7280', textAlign: 'center', marginTop: 0, marginBottom: 24 } }, a.subtitle),

            /* Quick pairs */
            a.showQuickPairs && quickPairs && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px', justifyContent: 'center' } },
                quickPairs.map(function(pair, i) {
                    return el('button', {
                        key: i,
                        onClick: function() { setFrom(pair[0]); setTo(pair[1]); },
                        style: {
                            padding: '5px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600,
                            background: (from === pair[0] && to === pair[1]) ? accent : (a.quickPairBg || '#f3f4f6'),
                            color:      (from === pair[0] && to === pair[1]) ? '#fff' : (a.quickPairColor || '#374151'),
                        }
                    }, pair[0] + '/' + pair[1]);
                })
            ),

            /* Amount + From/To */
            el('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'end', marginBottom: '24px' } },
                el('div', null,
                    el('label', { style: { display: 'block', fontSize: (a.labelFontSize || 12) + 'px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('Amount', 'blockenberg')),
                    el('input', {
                        type: 'number', value: amount, min: 0, step: 'any',
                        onChange: function(e) { setAmount(parseFloat(e.target.value) || 0); },
                        style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }
                    })
                ),
                a.showSwapBtn
                    ? el('button', {
                        onClick: function() { var tmp = from; setFrom(to); setTo(tmp); },
                        style: { background: 'none', border: '1.5px solid ' + accent, borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', color: accent, fontWeight: 700, fontSize: '18px', lineHeight: 1 }
                    }, '⇄')
                    : el('div', null, '→'),
                el('div', null,
                    el('label', { style: { display: 'block', fontSize: (a.labelFontSize || 12) + 'px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('To', 'blockenberg')),
                    el('select', {
                        value: to, onChange: function(e) { setTo(e.target.value); },
                        style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', background: '#fff' }
                    }, CURRENCIES.map(function(c) { return el('option', { key: c.value, value: c.value }, c.label); }))
                )
            ),

            /* From select — full width */
            el('div', { style: { marginBottom: '20px' } },
                el('label', { style: { display: 'block', fontSize: (a.labelFontSize || 12) + 'px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('From Currency', 'blockenberg')),
                el('select', {
                    value: from, onChange: function(e) { setFrom(e.target.value); },
                    style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', background: '#fff' }
                }, CURRENCIES.map(function(c) { return el('option', { key: c.value, value: c.value }, c.label); }))
            ),

            /* Result */
            el('div', {
                style: {
                    background: a.resultBg || '#f5f3ff',
                    border: '1.5px solid ' + (a.resultBorder || '#ede9fe'),
                    borderRadius: cRadius,
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '12px',
                }
            },
                el('div', { style: { fontSize: '13px', color: '#9ca3af', marginBottom: '6px' } },
                    amount + ' ' + from + ' equals'
                ),
                el('div', { className: 'bkbg-cc-result-num', style: { color: a.resultColor || accent } },
                    fmtResult(result) + ' ' + to
                ),
                el('div', { style: { fontSize: '13px', color: '#9ca3af', marginTop: '8px' } },
                    '1 ' + from + ' = ' + fmtResult(rate) + ' ' + to
                )
            ),

            /* Disclaimer */
            a.showDisclaimer && el('p', { style: { margin: 0, color: '#9ca3af', fontSize: '12px', textAlign: 'center' } }, a.disclaimer)
        );
    }

    registerBlockType('blockenberg/currency-converter', {
        edit: function(props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ style: { background: a.bgColor || undefined } });

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function(v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function(v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function(v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function(v) { setAttr({ subtitle: v }); } })
                    ),

                    el(PanelBody, { title: __('Defaults', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Default From Currency', 'blockenberg'), value: a.defaultFrom, options: CURRENCIES, onChange: function(v) { setAttr({ defaultFrom: v }); } }),
                        el(SelectControl, { label: __('Default To Currency', 'blockenberg'), value: a.defaultTo, options: CURRENCIES, onChange: function(v) { setAttr({ defaultTo: v }); } }),
                        el(RangeControl, { label: __('Default Amount', 'blockenberg'), value: a.defaultAmount, min: 1, max: 100000, onChange: function(v) { setAttr({ defaultAmount: v }); } })
                    ),

                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Swap Button', 'blockenberg'), checked: a.showSwapBtn, onChange: function(v) { setAttr({ showSwapBtn: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Quick Pair Buttons', 'blockenberg'), checked: a.showQuickPairs, onChange: function(v) { setAttr({ showQuickPairs: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Disclaimer', 'blockenberg'), checked: a.showDisclaimer, onChange: function(v) { setAttr({ showDisclaimer: v }); }, __nextHasNoMarginBottom: true }),
                        a.showDisclaimer && el(TextareaControl, { label: __('Disclaimer Text', 'blockenberg'), value: a.disclaimer, onChange: function(v) { setAttr({ disclaimer: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title', 'blockenberg'), typo: a.typoTitle || {}, onChange: function(v) { setAttr({ typoTitle: v }); } }),
                        _tc() && el(_tc(), { label: __('Result Number', 'blockenberg'), typo: a.typoResult || {}, onChange: function(v) { setAttr({ typoResult: v }); } }),
                        el(RangeControl, { label: __('Label font size (px)', 'blockenberg'), value: a.labelFontSize, min: 10, max: 18, onChange: function(v) { setAttr({ labelFontSize: v }); }, __nextHasNoMarginBottom: true })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),      value: a.accentColor,    onChange: function(v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Result Number Color', 'blockenberg'), value: a.resultColor,  onChange: function(v) { setAttr({ resultColor: v || '#6c3fb5' }); } },
                            { label: __('Quick Pair Background', 'blockenberg'), value: a.quickPairBg, onChange: function(v) { setAttr({ quickPairBg: v || '#f3f4f6' }); } },
                            { label: __('Result Background', 'blockenberg'),   value: a.resultBg,     onChange: function(v) { setAttr({ resultBg: v || '#f5f3ff' }); } },
                            { label: __('Card Background', 'blockenberg'),     value: a.cardBg,       onChange: function(v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Section Background', 'blockenberg'),  value: a.bgColor,      onChange: function(v) { setAttr({ bgColor: v || '' }); } },
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
            var blockProps = wp.blockEditor.useBlockProps.save({ style: { background: a.bgColor || undefined } });
            return el('div', blockProps,
                el('div', { className: 'bkbg-cc-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-cc-loading' }, 'Loading currency converter…')
                )
            );
        }
    });
}() );
