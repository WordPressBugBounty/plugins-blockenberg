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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Tax math ───────────────────────────────────── */
    function calcSalesTax(amount, rate) {
        var tax   = amount * (rate / 100);
        var total = amount + tax;
        return { net: amount, tax: tax, total: total };
    }
    function calcReverse(totalWithTax, rate) {
        var net   = totalWithTax / (1 + rate / 100);
        var tax   = totalWithTax - net;
        return { net: net, tax: tax, total: totalWithTax };
    }

    function fmtM(val, cur, pos) {
        return pos === 'after' ? val.toFixed(2) + cur : cur + val.toFixed(2);
    }

    /* ── Preview ────────────────────────────────────── */
    function TaxPreview(props) {
        var a   = props.attrs;
        var res = calcSalesTax(a.defaultAmount, a.defaultRate);
        var cur = a.currency, pos = a.currencyPos;

        var wrapStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', background: a.sectionBg || undefined };
        var cardStyle = { background: a.cardBg, borderRadius: a.cardRadius + 'px', padding: '32px', maxWidth: a.maxWidth + 'px', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' };

        /* mode tabs */
        var modeTabs = el('div', { style: { display: 'flex', gap: 8, marginBottom: 24 } },
            ['sales', 'reverse'].map(function (m) {
                var active = a.mode === m;
                var label  = m === 'sales' ? 'Add Tax →' : '← Remove Tax';
                return el('button', {
                    key: m,
                    style: { flex: 1, padding: '9px', border: 'none', borderRadius: a.inputRadius + 'px', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: active ? a.accentColor : a.statCardBg, color: active ? '#fff' : a.labelColor }
                }, label);
            })
        );

        /* preset chips */
        var presetChips = a.showPresets ? el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 } },
            a.presetRates.map(function (p, i) {
                return el('button', {
                    key: i,
                    style: { padding: '4px 10px', border: '1px solid ' + a.accentColor, borderRadius: 20, fontSize: 12, cursor: 'pointer', background: 'transparent', color: a.accentColor }
                }, p.label);
            })
        ) : null;

        function inputRow(label, val, pfx, sfx) {
            return el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' } },
                el('label', { style: { color: a.labelColor, fontSize: 14 } }, label),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    pfx ? el('span', { style: { color: a.subtitleColor, fontSize: 13 } }, pfx) : null,
                    el('input', { readOnly: true, value: val, type: 'number', style: { width: 100, textAlign: 'right', border: '1px solid #d1d5db', borderRadius: a.inputRadius + 'px', padding: '4px 8px', fontSize: 14 } }),
                    sfx ? el('span', { style: { color: a.subtitleColor, fontSize: 13 } }, sfx) : null
                )
            );
        }

        /* result */
        var resultBox = el('div', { style: { background: a.resultBg, border: '2px solid ' + a.resultBorder, borderRadius: a.cardRadius + 'px', padding: '20px 24px', margin: '24px 0' } },
            el('div', { style: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 } },
                el('div', { style: { textAlign: 'center', flex: 1 } },
                    el('div', { style: { fontSize: 11, fontWeight: 600, color: a.subtitleColor, textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Net Price'),
                    el('div', { style: { fontSize: a.resultSize * 0.55 + 'px', fontWeight: 800, color: a.netColor } }, fmtM(res.net, cur, pos))
                ),
                el('div', { style: { textAlign: 'center', flex: 1 } },
                    el('div', { style: { fontSize: 11, fontWeight: 600, color: a.subtitleColor, textTransform: 'uppercase', letterSpacing: '0.06em' } }, a.taxLabel),
                    el('div', { style: { fontSize: a.resultSize * 0.55 + 'px', fontWeight: 800, color: a.taxColor } }, fmtM(res.tax, cur, pos))
                ),
                el('div', { style: { textAlign: 'center', flex: 1 } },
                    el('div', { style: { fontSize: 11, fontWeight: 600, color: a.subtitleColor, textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Total Price'),
                    el('div', { style: { fontSize: a.resultSize * 0.7 + 'px', fontWeight: 900, color: a.totalColor } }, fmtM(res.total, cur, pos))
                )
            )
        );

        return el('div', { style: wrapStyle },
            (a.showTitle || a.showSubtitle) ? el('div', { style: { textAlign: 'center', maxWidth: a.maxWidth + 'px', margin: '0 auto 32px' } },
                a.showTitle    ? el('h3', { className: 'bkbg-tax-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title) : null,
                a.showSubtitle ? el('p',  { style: { color: a.subtitleColor, margin: 0 } }, a.subtitle) : null
            ) : null,
            el('div', { style: cardStyle },
                modeTabs,
                presetChips,
                inputRow(a.mode === 'reverse' ? 'Total Price (with tax)' : 'Original Amount', a.defaultAmount, cur),
                inputRow('Tax Rate (' + a.taxLabel + ')', a.defaultRate, null, '%'),
                resultBox
            )
        );
    }

    /* ── Edit ────────────────────────────────────────── */
    function TaxEdit(props) {
        var a   = props.attributes;
        var set = props.setAttributes;
        var blockProps = useBlockProps( (function () {
            var _tvf = getTypoCssVars();
            var s = {};
            if (_tvf) Object.assign(s, _tvf(a.titleTypo, '--bktxc-tt-'));
            return { className: 'bkbg-tax-editor', style: s };
        })() );

        function s(k)  { return function (v) { var o = {}; o[k] = v; set(o); }; }
        function n(k)  { return function (v) { var o = {}; o[k] = Number(v) || 0; set(o); }; }
        function nf(k) { return function (v) { var o = {}; o[k] = parseFloat(v) || 0; set(o); }; }
        function t(k)  { return function (v) { var o = {}; o[k] = v; set(o); }; }

        function updatePreset(i, field, val) {
            var p = a.presetRates.slice();
            p[i] = Object.assign({}, p[i]);
            p[i][field] = field === 'rate' ? (parseFloat(val) || 0) : val;
            set({ presetRates: p });
        }
        function addPreset()    { set({ presetRates: a.presetRates.concat([{ label: 'Custom', rate: 5 }]) }); }
        function removePreset(i){ set({ presetRates: a.presetRates.filter(function (_, idx) { return idx !== i; }) }); }

        return el(Fragment, null,
            el(InspectorControls, null,

                el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: t('showTitle'), __nextHasNoMarginBottom: true }),
                    a.showTitle    ? el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: s('title') }) : null,
                    el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: t('showSubtitle'), __nextHasNoMarginBottom: true }),
                    a.showSubtitle ? el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: s('subtitle') }) : null
                ),

                el(PanelBody, { title: __('Calculator Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Default Mode', 'blockenberg'), value: a.mode, options: [
                        { label: 'Add Tax (price → total)', value: 'sales' },
                        { label: 'Remove Tax (total → price)', value: 'reverse' }
                    ], onChange: s('mode') }),
                    el(TextControl, { label: __('Tax Label', 'blockenberg'), value: a.taxLabel, onChange: s('taxLabel'), help: 'e.g. Sales Tax, VAT, GST' }),
                    el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.currency, onChange: s('currency') }),
                    el(SelectControl, { label: __('Currency Position', 'blockenberg'), value: a.currencyPos, options: [{ label: 'Before ($100)', value: 'before' }, { label: 'After (100€)', value: 'after' }], onChange: s('currencyPos') }),
                    el(TextControl, { label: __('Default Amount', 'blockenberg'), value: String(a.defaultAmount), onChange: nf('defaultAmount'), type: 'number' }),
                    el(TextControl, { label: __('Default Tax Rate (%)', 'blockenberg'), value: String(a.defaultRate), onChange: nf('defaultRate'), type: 'number', step: '0.001' })
                ),

                el(PanelBody, { title: __('Preset Rate Chips', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Preset Buttons', 'blockenberg'), checked: a.showPresets, onChange: t('showPresets'), __nextHasNoMarginBottom: true }),
                    a.showPresets ? el(Fragment, null,
                        a.presetRates.map(function (p, i) {
                            return el('div', { key: i, style: { background: '#f9f9f9', borderRadius: 8, padding: '8px 12px', marginBottom: 8 } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
                                    el('strong', { style: { fontSize: 12 } }, 'Preset ' + (i + 1)),
                                    el(Button, { isDestructive: true, isSmall: true, onClick: function () { removePreset(i); } }, '✕')
                                ),
                                el(TextControl, { label: 'Label', value: p.label, onChange: function (v) { updatePreset(i, 'label', v); } }),
                                el(TextControl, { label: 'Rate (%)', value: String(p.rate), onChange: function (v) { updatePreset(i, 'rate', v); }, type: 'number', step: '0.001' })
                            );
                        }),
                        el(Button, { isPrimary: true, onClick: addPreset, style: { marginTop: 8 } }, __('+ Add Preset', 'blockenberg'))
                    ) : null
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                    el(RangeControl, { label: __('Result Size (px)', 'blockenberg'), value: a.resultSize, onChange: n('resultSize'), min: 24, max: 80 }),
                    el(SelectControl, { label: __('Result Font Weight', 'blockenberg'), value: a.resultFontWeight, options: [{label:'400 Regular',value:'400'},{label:'500 Medium',value:'500'},{label:'600 Semi-bold',value:'600'},{label:'700 Bold',value:'700'},{label:'800 Extra Bold',value:'800'}], __nextHasNoMarginBottom: true, onChange: n('resultFontWeight') })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor,  onChange: s('accentColor'),  label: __('Accent', 'blockenberg') },
                        { value: a.cardBg,        onChange: s('cardBg'),        label: __('Card Background', 'blockenberg') },
                        { value: a.resultBg,      onChange: s('resultBg'),      label: __('Result Box BG', 'blockenberg') },
                        { value: a.resultBorder,  onChange: s('resultBorder'),  label: __('Result Box Border', 'blockenberg') },
                        { value: a.taxColor,      onChange: s('taxColor'),      label: __('Tax Amount', 'blockenberg') },
                        { value: a.totalColor,    onChange: s('totalColor'),    label: __('Total Price', 'blockenberg') },
                        { value: a.netColor,      onChange: s('netColor'),      label: __('Net Price', 'blockenberg') },
                        { value: a.statCardBg,    onChange: s('statCardBg'),    label: __('Stat Card BG', 'blockenberg') },
                        { value: a.titleColor,    onChange: s('titleColor'),    label: __('Title Color', 'blockenberg') },
                        { value: a.subtitleColor, onChange: s('subtitleColor'), label: __('Subtitle Color', 'blockenberg') },
                        { value: a.labelColor,    onChange: s('labelColor'),    label: __('Label Color', 'blockenberg') },
                        { value: a.sectionBg,     onChange: s('sectionBg'),     label: __('Section Background', 'blockenberg') }
                    ]
                }),

                el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, onChange: n('cardRadius'), min: 0, max: 32 }),
                    el(RangeControl, { label: __('Input Radius (px)', 'blockenberg'), value: a.inputRadius, onChange: n('inputRadius'), min: 0, max: 20 }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, onChange: n('maxWidth'), min: 320, max: 900, step: 20 }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, onChange: n('paddingTop'), min: 0, max: 160 }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, onChange: n('paddingBottom'), min: 0, max: 160 })
                )
            ),

            el('div', blockProps,
                el(TaxPreview, { attrs: a })
            )
        );
    }

    registerBlockType('blockenberg/tax-calculator', {
        edit: TaxEdit,
        save: function (props) {
            var _tvf = getTypoCssVars();
            var s = {};
            if (_tvf) Object.assign(s, _tvf(props.attributes.titleTypo, '--bktxc-tt-'));
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-tax-app',
                style: s,
                'data-opts': JSON.stringify(props.attributes)
            }));
        }
    });
}() );
