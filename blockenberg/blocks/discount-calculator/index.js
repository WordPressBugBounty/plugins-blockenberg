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

    var _discTC, _discTV;
    function _tc() { return _discTC || (_discTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_discTV || (_discTV = window.bkbgTypoCssVars)) ? _discTV(t, p) : {}; }

    var MODE_LABELS = {
        sale_price:    'Find Sale Price',
        discount_pct:  'Find Discount %',
        orig_price:    'Find Original Price'
    };

    function calcSalePrice(orig, pct) {
        var savings  = orig * (pct / 100);
        var sale     = orig - savings;
        return { orig: orig, sale: sale, savings: savings, pct: pct };
    }
    function calcDiscountPct(orig, sale) {
        if (orig <= 0) return { orig: orig, sale: sale, savings: 0, pct: 0 };
        var savings = orig - sale;
        var pct     = (savings / orig) * 100;
        return { orig: orig, sale: sale, savings: savings, pct: pct };
    }
    function calcOrigPrice(sale, pct) {
        if (pct >= 100) return { orig: sale, sale: sale, savings: 0, pct: pct };
        var orig    = sale / (1 - pct / 100);
        var savings = orig - sale;
        return { orig: orig, sale: sale, savings: savings, pct: pct };
    }

    function fmtM(val, cur, pos) {
        var s = parseFloat(val).toFixed(2);
        return pos === 'after' ? s + cur : cur + s;
    }

    function DiscountPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;

        var _s       = useState(a.mode);
        var mode     = _s[0]; var setMode = _s[1];
        var _orig    = useState(a.defaultOriginal);
        var orig     = _orig[0]; var setOrig = _orig[1];
        var _pct     = useState(a.defaultDiscount);
        var pct      = _pct[0]; var setPct = _pct[1];
        var _sale    = useState(a.defaultSale);
        var sale     = _sale[0]; var setSale = _sale[1];

        function getResult() {
            if (mode === 'sale_price')   return calcSalePrice(parseFloat(orig) || 0, parseFloat(pct) || 0);
            if (mode === 'discount_pct') return calcDiscountPct(parseFloat(orig) || 0, parseFloat(sale) || 0);
            return calcOrigPrice(parseFloat(sale) || 0, parseFloat(pct) || 0);
        }
        var r = getResult();

        var badgePct = Math.round(r.pct * 10) / 10;
        var savingsFrac = r.orig > 0 ? Math.min(1, r.savings / r.orig) : 0;

        var containerStyle = {
            background:    a.sectionBg || undefined,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            fontFamily:    'inherit'
        };
        var cardStyle = {
            background:   a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding:      '36px 32px',
            maxWidth:     a.maxWidth + 'px',
            margin:       '0 auto',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.09)'
        };

        // Mode tabs
        var modes = ['sale_price', 'discount_pct', 'orig_price'];

        return el('div', { className: 'bkbg-disc-editor', style: containerStyle },
            el('div', { style: cardStyle },

                // Title / subtitle
                (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '20px' } },
                    a.showTitle && el('div', {
                        className: 'bkbg-disc-title',
                        style: { color: a.titleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { setAttributes({ title: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.title }
                    }),
                    a.showSubtitle && el('div', {
                        className: 'bkbg-disc-subtitle',
                        style: { color: a.subtitleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { setAttributes({ subtitle: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.subtitle }
                    })
                ),

                // Mode tabs
                el('div', { style: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' } },
                    modes.map(function(m) {
                        var active = mode === m;
                        return el('button', {
                            key: m,
                            className: 'bkbg-disc-mode-btn' + (active ? ' active' : ''),
                            style: {
                                flex: '1 1 auto',
                                padding: '9px 14px',
                                borderRadius: '8px',
                                border: '2px solid ' + (active ? a.accentColor : '#e5e7eb'),
                                background: active ? a.accentColor : 'transparent',
                                color: active ? '#fff' : a.accentColor,
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all .15s'
                            },
                            onClick: function() { setMode(m); }
                        }, MODE_LABELS[m]);
                    })
                ),

                // Inputs based on mode
                el('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' } },

                    // Original price (not shown in orig_price mode)
                    mode !== 'orig_price' && el('div', { className: 'bkbg-disc-input-row' },
                        el('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '5px' } },
                            'Original Price'
                        ),
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                            a.currencyPos === 'before' && el('span', { style: { color: a.labelColor, fontWeight: 700, fontSize: '16px' } }, a.currency),
                            el('input', {
                                type: 'number', value: orig, min: 0, step: 0.01,
                                style: { flex: 1, padding: '10px 14px', borderRadius: a.inputRadius + 'px', border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none' },
                                onChange: function(e) { setOrig(e.target.value); }
                            }),
                            a.currencyPos === 'after' && el('span', { style: { color: a.labelColor, fontWeight: 700, fontSize: '16px' } }, a.currency)
                        )
                    ),

                    // Discount % (not shown in discount_pct mode)
                    mode !== 'discount_pct' && el('div', { className: 'bkbg-disc-input-row' },
                        el('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '5px' } },
                            'Discount Percentage'
                        ),
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                            el('input', {
                                type: 'number', value: pct, min: 0, max: 100, step: 0.1,
                                style: { flex: 1, padding: '10px 14px', borderRadius: a.inputRadius + 'px', border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none' },
                                onChange: function(e) { setPct(e.target.value); }
                            }),
                            el('span', { style: { color: a.labelColor, fontWeight: 700, fontSize: '16px' } }, '%')
                        )
                    ),

                    // Sale price (only for discount_pct and orig_price modes)
                    mode !== 'sale_price' && el('div', { className: 'bkbg-disc-input-row' },
                        el('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '5px' } },
                            'Sale Price'
                        ),
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                            a.currencyPos === 'before' && el('span', { style: { color: a.labelColor, fontWeight: 700, fontSize: '16px' } }, a.currency),
                            el('input', {
                                type: 'number', value: sale, min: 0, step: 0.01,
                                style: { flex: 1, padding: '10px 14px', borderRadius: a.inputRadius + 'px', border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none' },
                                onChange: function(e) { setSale(e.target.value); }
                            }),
                            a.currencyPos === 'after' && el('span', { style: { color: a.labelColor, fontWeight: 700, fontSize: '16px' } }, a.currency)
                        )
                    )
                ),

                // Result card
                el('div', {
                    style: {
                        background: a.resultBg,
                        border: '2px solid ' + a.resultBorder,
                        borderRadius: a.cardRadius + 'px',
                        padding: '24px 28px',
                        textAlign: 'center'
                    }
                },
                    // Badge
                    a.showBadge && r.pct > 0 && el('div', {
                        style: {
                            display: 'inline-block',
                            background: a.badgeBg,
                            color: a.badgeColor,
                            fontWeight: 800,
                            fontSize: '14px',
                            padding: '4px 14px',
                            borderRadius: '100px',
                            marginBottom: '14px',
                            letterSpacing: '0.03em'
                        }
                    }, badgePct + '% OFF'),

                    // Sale price big
                    el('div', {
                        style: {
                            fontSize: a.salePriceSize + 'px',
                            fontWeight: 800,
                            color: a.salePriceColor,
                            lineHeight: 1.1,
                            marginBottom: '6px'
                        }
                    }, fmtM(r.sale, a.currency, a.currencyPos)),

                    // Cross-out original
                    r.orig !== r.sale && el('div', {
                        style: {
                            fontSize: Math.round(a.salePriceSize * 0.4) + 'px',
                            color: a.origPriceColor,
                            textDecoration: 'line-through',
                            marginBottom: '10px'
                        }
                    }, fmtM(r.orig, a.currency, a.currencyPos)),

                    // Savings label
                    r.savings > 0 && el('div', {
                        style: {
                            fontSize: '16px',
                            fontWeight: 700,
                            color: a.savingsColor,
                            marginBottom: '16px'
                        }
                    }, 'You Save: ' + fmtM(r.savings, a.currency, a.currencyPos)),

                    // Savings bar
                    a.showSavingsBar && r.orig > 0 && el(Fragment, null,
                        el('div', { style: { fontSize: '12px', color: a.labelColor, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' } },
                            el('span', null, 'Original'),
                            el('span', null, 'Savings')
                        ),
                        el('div', {
                            style: {
                                height: '10px',
                                borderRadius: '100px',
                                background: a.barBg,
                                overflow: 'hidden'
                            }
                        },
                            el('div', {
                                style: {
                                    height: '100%',
                                    width: (savingsFrac * 100).toFixed(1) + '%',
                                    background: a.barFill,
                                    borderRadius: '100px',
                                    transition: 'width .3s'
                                }
                            })
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/discount-calculator', {
        edit: function(props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign(
                { '--bkbg-disc-ttl-fs': (a.titleSize || 28) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-disc-ttl-'),
                _tv(a.typoSubtitle || {}, '--bkbg-disc-sub-')
            ) });

            var colorSettings = [
                { value: a.accentColor,    onChange: function(v) { set({ accentColor: v }); },    label: 'Accent / Mode Tabs' },
                { value: a.cardBg,         onChange: function(v) { set({ cardBg: v }); },         label: 'Card Background' },
                { value: a.resultBg,       onChange: function(v) { set({ resultBg: v }); },       label: 'Result Background' },
                { value: a.resultBorder,   onChange: function(v) { set({ resultBorder: v }); },   label: 'Result Border' },
                { value: a.salePriceColor, onChange: function(v) { set({ salePriceColor: v }); }, label: 'Sale Price Color' },
                { value: a.origPriceColor, onChange: function(v) { set({ origPriceColor: v }); }, label: 'Original Price (strikethrough)' },
                { value: a.savingsColor,   onChange: function(v) { set({ savingsColor: v }); },   label: 'Savings Color' },
                { value: a.badgeBg,        onChange: function(v) { set({ badgeBg: v }); },        label: 'Badge Background' },
                { value: a.badgeColor,     onChange: function(v) { set({ badgeColor: v }); },     label: 'Badge Text' },
                { value: a.barFill,        onChange: function(v) { set({ barFill: v }); },        label: 'Savings Bar Fill' },
                { value: a.barBg,          onChange: function(v) { set({ barBg: v }); },          label: 'Savings Bar Background' },
                { value: a.titleColor,     onChange: function(v) { set({ titleColor: v }); },     label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v) { set({ subtitleColor: v }); },  label: 'Subtitle Color' },
                { value: a.labelColor,     onChange: function(v) { set({ labelColor: v }); },     label: 'Label / Text Color' },
                { value: a.sectionBg,      onChange: function(v) { set({ sectionBg: v }); },      label: 'Section Background' }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Header
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title', checked: a.showTitle, onChange: function(v) { set({ showTitle: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v) { set({ showSubtitle: v }); } }),
                        el(TextControl, { label: 'Title', value: a.title, onChange: function(v) { set({ title: v }); } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function(v) { set({ subtitle: v }); } })
                    ),

                    // Calculator Settings
                    el(PanelBody, { title: 'Calculator Settings', initialOpen: true },
                        el(SelectControl, {
                            label: 'Default Mode',
                            value: a.mode,
                            options: [
                                { label: 'Find Sale Price',       value: 'sale_price' },
                                { label: 'Find Discount %',       value: 'discount_pct' },
                                { label: 'Find Original Price',   value: 'orig_price' }
                            ],
                            onChange: function(v) { set({ mode: v }); }
                        }),
                        el(TextControl, { label: 'Currency Symbol', value: a.currency, onChange: function(v) { set({ currency: v }); } }),
                        el(SelectControl, {
                            label: 'Currency Position',
                            value: a.currencyPos,
                            options: [
                                { label: 'Before ($100)', value: 'before' },
                                { label: 'After (100$)',  value: 'after' }
                            ],
                            onChange: function(v) { set({ currencyPos: v }); }
                        }),
                        el(TextControl, {
                            label: 'Default Original Price', type: 'number',
                            value: String(a.defaultOriginal),
                            onChange: function(v) { set({ defaultOriginal: parseFloat(v) || 0 }); }
                        }),
                        el(TextControl, {
                            label: 'Default Discount %', type: 'number',
                            value: String(a.defaultDiscount),
                            onChange: function(v) { set({ defaultDiscount: parseFloat(v) || 0 }); }
                        }),
                        el(TextControl, {
                            label: 'Default Sale Price', type: 'number',
                            value: String(a.defaultSale),
                            onChange: function(v) { set({ defaultSale: parseFloat(v) || 0 }); }
                        }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Savings Bar', checked: a.showSavingsBar, onChange: function(v) { set({ showSavingsBar: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Discount Badge', checked: a.showBadge, onChange: function(v) { set({ showBadge: v }); } })
                    ),

                    // Colors
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: function(v) { set({ typoTitle: v }); }, defaultSize: a.titleSize || 28 }),
                        _tc() && el(_tc(), { label: __('Subtitle'), typo: a.typoSubtitle || {}, onChange: function(v) { set({ typoSubtitle: v }); }, defaultSize: 15 }),
                        el(RangeControl, { label: 'Sale Price Size', value: a.salePriceSize, min: 28, max: 96, step: 2, onChange: function(v) { set({ salePriceSize: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: colorSettings
                    }),

                    // Sizing
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius, min: 0, max: 40, step: 1, onChange: function(v) { set({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Input Border Radius', value: a.inputRadius, min: 0, max: 24, step: 1, onChange: function(v) { set({ inputRadius: v }); } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 300, max: 900, step: 10, onChange: function(v) { set({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Padding Top (px)', value: a.paddingTop, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingTop: v }); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)', value: a.paddingBottom, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingBottom: v }); } })
                    )
                ),
                el('div', blockProps,
                    el(DiscountPreview, { attributes: a, setAttributes: set })
                )
            );
        },
        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', { className: 'bkbg-disc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
