( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Calculation helpers ──────────────────────────────────────────────
    function calcMarginMode(cost, margin) {
        if (cost <= 0 || margin >= 100) return null;
        var sellingPrice = cost / (1 - margin / 100);
        var profit       = sellingPrice - cost;
        var markup       = cost > 0 ? (profit / cost) * 100 : 0;
        return { sellingPrice: sellingPrice, profit: profit, margin: margin, markup: markup };
    }
    function calcMarkupMode(cost, markup) {
        if (cost <= 0) return null;
        var sellingPrice = cost * (1 + markup / 100);
        var profit       = sellingPrice - cost;
        var margin       = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
        return { sellingPrice: sellingPrice, profit: profit, margin: margin, markup: markup };
    }
    function calcRevenueMode(revenue, cost) {
        if (revenue <= 0) return null;
        var profit = revenue - cost;
        var margin = (profit / revenue) * 100;
        var markup = cost > 0 ? (profit / cost) * 100 : 0;
        return { sellingPrice: revenue, profit: profit, margin: margin, markup: markup };
    }
    function fmt(n, decimals) {
        return n.toFixed(decimals !== undefined ? decimals : 2);
    }

    // ── Editor preview component ─────────────────────────────────────────
    function EditorPreview(props) {
        var a      = props.attributes;
        var mode   = a.defaultMode;
        var cost   = parseFloat(a.defaultCost)   || 0;
        var margin = parseFloat(a.defaultMargin)  || 0;
        var rev    = parseFloat(a.defaultRevenue) || 0;
        var result = mode === 'margin'  ? calcMarginMode(cost, margin)
                   : mode === 'markup'  ? calcMarkupMode(cost, margin)
                   : calcRevenueMode(rev, cost);

        var wrapStyle = {
            background:    a.sectionBg,
            borderRadius:  '12px',
            padding:       '32px 24px',
            maxWidth:      a.contentMaxWidth + 'px',
            margin:        '0 auto',
            fontFamily:    'inherit',
            boxSizing:     'border-box'
        };
        var tabsRow = el('div', { style: { display:'flex', gap:'8px', marginBottom:'20px' } },
            ['margin','markup','revenue'].map(function(m) {
                var active = m === mode;
                return el('button', {
                    key:   m,
                    style: {
                        padding:      '8px 18px',
                        borderRadius: '8px',
                        border:       '2px solid ' + (active ? a.accentColor : '#d1d5db'),
                        background:   active ? a.accentColor : a.cardBg,
                        color:        active ? '#fff' : a.labelColor,
                        fontWeight:   active ? '700' : '400',
                        cursor:       'pointer',
                        fontSize:     '14px',
                        textTransform:'capitalize'
                    }
                }, m === 'margin' ? 'Margin %' : m === 'markup' ? 'Markup %' : 'Revenue');
            })
        );

        var inputStyle = {
            background:   a.inputBg,
            border:       '1.5px solid #e5e7eb',
            borderRadius: '8px',
            padding:      '10px 14px',
            fontSize:     '15px',
            width:        '100%',
            boxSizing:    'border-box',
            color:        a.labelColor
        };
        var labelStyle = { fontSize:'13px', fontWeight:'600', color:a.labelColor, marginBottom:'4px', display:'block' };

        var inputsRow = el('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' } },
            el('div', null,
                el('span', { style: labelStyle }, mode === 'revenue' ? 'Revenue (' + a.currency + ')' : 'Cost Price (' + a.currency + ')'),
                el('input', { style: inputStyle, readOnly: true, value: mode === 'revenue' ? fmt(rev, 2) : fmt(cost, 2) })
            ),
            el('div', null,
                el('span', { style: labelStyle },
                    mode === 'margin'  ? 'Target Margin (%)' :
                    mode === 'markup'  ? 'Markup (%)' :
                    'Cost Price (' + a.currency + ')'
                ),
                el('input', { style: inputStyle, readOnly: true,
                    value: mode === 'margin' ? fmt(margin, 1) :
                           mode === 'markup' ? fmt(margin, 1) :
                           fmt(cost, 2)
                })
            )
        );

        var cards = result ? [
            { label:'Selling Price', value: a.currency + fmt(result.sellingPrice, 2), bg: a.resultBg,   color: a.accentColor },
            { label:'Gross Profit',  value: a.currency + fmt(result.profit, 2),       bg: a.resultBg,   color: a.profitColor },
            { label:'Margin %',      value: fmt(result.margin, 1) + '%',              bg: '#f0fdf4',     color: a.profitColor },
            { label:'Markup %',      value: fmt(result.markup, 1) + '%',              bg: '#f0fdf4',     color: a.accentColor }
        ] : [];

        var cardsRow = el('div', { style:{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px', marginBottom:'20px' } },
            cards.map(function(c) {
                return el('div', {
                    key:   c.label,
                    style: { background: c.bg, borderRadius:'10px', padding:'14px 16px', borderLeft:'4px solid '+c.color }
                },
                    el('div', { style:{ fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' } }, c.label),
                    el('div', { style:{ fontSize:'22px', fontWeight:'700', color: c.color } }, c.value)
                );
            })
        );

        var barSection = null;
        if (a.showBar && result && result.sellingPrice > 0) {
            var costPct   = Math.max(0, Math.min(100, (result.sellingPrice - result.profit) / result.sellingPrice * 100));
            var profitPct = 100 - costPct;
            barSection = el('div', { style:{ marginBottom:'20px' } },
                el('div', { style:{ fontSize:'12px', fontWeight:'600', color:a.labelColor, marginBottom:'6px' } }, 'Price Breakdown'),
                el('div', { style:{ display:'flex', borderRadius:'8px', overflow:'hidden', height:'28px' } },
                    el('div', { style:{ width: costPct+'%', background: a.costColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'11px', fontWeight:'700' } },
                        costPct > 15 ? fmt(costPct,0)+'% Cost' : ''
                    ),
                    el('div', { style:{ width: profitPct+'%', background: a.profitColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'11px', fontWeight:'700' } },
                        profitPct > 15 ? fmt(profitPct,0)+'% Profit' : ''
                    )
                ),
                el('div', { style:{ display:'flex', gap:'16px', marginTop:'6px' } },
                    el('span', { style:{ fontSize:'12px', color: a.costColor, fontWeight:'600' } }, '● Cost: ' + a.currency + fmt(result.sellingPrice - result.profit, 2)),
                    el('span', { style:{ fontSize:'12px', color: a.profitColor, fontWeight:'600' } }, '● Profit: ' + a.currency + fmt(result.profit, 2))
                )
            );
        }

        var scaleSection = null;
        if (a.showMarginScale && result) {
            var m = result.margin;
            var scaleColor = m < 10 ? '#ef4444' : m < 25 ? '#f59e0b' : m < 50 ? '#10b981' : '#6c3fb5';
            var scaleLabel = m < 10 ? 'Low margin' : m < 25 ? 'Moderate margin' : m < 50 ? 'Healthy margin' : 'High margin';
            scaleSection = el('div', { style:{ background: a.cardBg, borderRadius:'10px', padding:'14px 16px', border:'1.5px solid #e5e7eb' } },
                el('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:'8px' } },
                    el('span', { style:{ fontSize:'13px', fontWeight:'600', color: a.labelColor } }, 'Margin Health'),
                    el('span', { style:{ fontSize:'13px', fontWeight:'700', color: scaleColor } }, scaleLabel)
                ),
                el('div', { style:{ background:'#e5e7eb', borderRadius:'999px', height:'8px', overflow:'hidden' } },
                    el('div', { style:{ width: Math.min(m, 100)+'%', background: scaleColor, height:'100%', borderRadius:'999px', transition:'width 0.4s' } })
                ),
                el('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:'4px' } },
                    el('span', { style:{ fontSize:'11px', color:'#9ca3af' } }, '0%'),
                    el('span', { style:{ fontSize:'11px', color:'#9ca3af' } }, '50%'),
                    el('span', { style:{ fontSize:'11px', color:'#9ca3af' } }, '100%')
                )
            );
        }

        return el('div', { style: wrapStyle },
            el(RichText, { tagName:'h3', value: a.title, onChange: function(v){ props.setAttributes({ title: v }); },
                className: 'bkbg-mgc-title',
                style:{ color: a.titleColor, margin:'0 0 6px 0' },
                placeholder: 'Block title...'
            }),
            el(RichText, { tagName:'p', value: a.subtitle, onChange: function(v){ props.setAttributes({ subtitle: v }); },
                className: 'bkbg-mgc-subtitle',
                style:{ color: a.subtitleColor, margin:'0 0 24px 0' },
                placeholder: 'Subtitle...'
            }),
            tabsRow,
            inputsRow,
            cardsRow,
            barSection,
            scaleSection
        );
    }

    // ── Register block ───────────────────────────────────────────────────
    registerBlockType('blockenberg/margin-calculator', {
        edit: function(props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var colorControls = [
                { value: a.accentColor,   onChange: function(v){ setAttributes({ accentColor:   v||'#10b981' }); }, label: 'Accent color'    },
                { value: a.profitColor,   onChange: function(v){ setAttributes({ profitColor:   v||'#10b981' }); }, label: 'Profit color'    },
                { value: a.costColor,     onChange: function(v){ setAttributes({ costColor:     v||'#f43f5e' }); }, label: 'Cost color'      },
                { value: a.sectionBg,     onChange: function(v){ setAttributes({ sectionBg:     v||'#f0fdf4' }); }, label: 'Section background' },
                { value: a.cardBg,        onChange: function(v){ setAttributes({ cardBg:        v||'#ffffff' }); }, label: 'Card background'    },
                { value: a.inputBg,       onChange: function(v){ setAttributes({ inputBg:       v||'#f9fafb' }); }, label: 'Input background'   },
                { value: a.resultBg,      onChange: function(v){ setAttributes({ resultBg:      v||'#dcfce7' }); }, label: 'Result background'  },
                { value: a.titleColor,    onChange: function(v){ setAttributes({ titleColor:    v||'#111827' }); }, label: 'Title color'      },
                { value: a.subtitleColor, onChange: function(v){ setAttributes({ subtitleColor: v||'#6b7280' }); }, label: 'Subtitle color'   },
                { value: a.labelColor,    onChange: function(v){ setAttributes({ labelColor:    v||'#374151' }); }, label: 'Label color'      }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Calculator Settings', initialOpen: true },
                        el(SelectControl, {
                            label: 'Default Mode',
                            value: a.defaultMode,
                            options: [
                                { label: 'Margin % (Cost → Price)', value: 'margin'  },
                                { label: 'Markup % (Cost → Price)', value: 'markup'  },
                                { label: 'Revenue (Revenue + Cost)', value: 'revenue' }
                            ],
                            onChange: function(v){ setAttributes({ defaultMode: v }); }
                        }),
                        el(TextControl, {
                            label:    'Currency Symbol',
                            value:    a.currency,
                            onChange: function(v){ setAttributes({ currency: v }); }
                        }),
                        el(TextControl, {
                            label:    'Default Cost ($)',
                            type:     'number',
                            value:    String(a.defaultCost),
                            onChange: function(v){ setAttributes({ defaultCost: parseFloat(v)||0 }); }
                        }),
                        el(TextControl, {
                            label:    'Default Margin / Markup (%)',
                            type:     'number',
                            value:    String(a.defaultMargin),
                            onChange: function(v){ setAttributes({ defaultMargin: parseFloat(v)||0 }); }
                        }),
                        el(TextControl, {
                            label:    'Default Revenue ($)',
                            type:     'number',
                            value:    String(a.defaultRevenue),
                            onChange: function(v){ setAttributes({ defaultRevenue: parseFloat(v)||0 }); }
                        })
                    ),
                    el(PanelBody, { title: 'Display Options', initialOpen: false },
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label:    'Show Breakdown Bar',
                            checked:  a.showBar,
                            onChange: function(v){ setAttributes({ showBar: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label:    'Show Markup %',
                            checked:  a.showMarkup,
                            onChange: function(v){ setAttributes({ showMarkup: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label:    'Show Margin Health Scale',
                            checked:  a.showMarginScale,
                            onChange: function(v){ setAttributes({ showMarginScale: v }); }
                        })
                    ),
                    el(PanelBody, { title: 'Sizing', initialOpen: false },
                        el(RangeControl, {
                            label:    'Max Width (px)',
                            value:    a.contentMaxWidth,
                            min:      400, max: 1200, step: 20,
                            onChange: function(v){ setAttributes({ contentMaxWidth: v }); }
                        })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () { var C = getTypoControl(); return C ? el(C, { label: 'Title', value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }) : null; })(),
                        (function () { var C = getTypoControl(); return C ? el(C, { label: 'Subtitle', value: a.subtitleTypo, onChange: function (v) { setAttributes({ subtitleTypo: v }); } }) : null; })()
                    ),
el(PanelColorSettings, {
                        title:                  'Colors',
                        initialOpen:            false,
                        disableCustomGradients: true,
                        colorSettings:          colorControls
                    })
                ),
                el('div', useBlockProps((function () {
                    var _tvFn = getTypoCssVars();
                    var s = {};
                    if (_tvFn) {
                        Object.assign(s, _tvFn(a.titleTypo, '--bkbg-mgc-tt-'));
                        Object.assign(s, _tvFn(a.subtitleTypo, '--bkbg-mgc-st-'));
                    }
                    return { style: s };
                })()),
                    el(EditorPreview, { attributes: a, setAttributes: setAttributes })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            var _tvFn = getTypoCssVars();
            return el('div', useBlockProps.save((function () {
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo, '--bkbg-mgc-tt-'));
                    Object.assign(s, _tvFn(a.subtitleTypo, '--bkbg-mgc-st-'));
                }
                return { style: s };
            })()),
                el('div', {
                    className:    'bkbg-mgc-app',
                    'data-opts':  JSON.stringify({
                        title:          a.title,
                        subtitle:       a.subtitle,
                        currency:       a.currency,
                        defaultMode:    a.defaultMode,
                        defaultCost:    a.defaultCost,
                        defaultMargin:  a.defaultMargin,
                        defaultRevenue: a.defaultRevenue,
                        showMarkup:     a.showMarkup,
                        showBar:        a.showBar,
                        showMarginScale: a.showMarginScale,
                        accentColor:    a.accentColor,
                        profitColor:    a.profitColor,
                        costColor:      a.costColor,
                        sectionBg:      a.sectionBg,
                        cardBg:         a.cardBg,
                        inputBg:        a.inputBg,
                        resultBg:       a.resultBg,
                        titleColor:     a.titleColor,
                        subtitleColor:  a.subtitleColor,
                        labelColor:     a.labelColor,
                        titleTypo:      a.titleTypo,
                        subtitleTypo:   a.subtitleTypo,
                        contentMaxWidth: a.contentMaxWidth
                    })
                })
            );
        }
    });
}() );
