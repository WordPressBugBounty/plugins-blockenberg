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
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    function fmtMoney(val, currency, pos) {
        var s = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return pos === 'after' ? s + currency : currency + s;
    }

    /* ── Preview component ────────────────────────────────────────────────── */
    function TipPreview(props) {
        var a = props.attrs;
        var billState  = useState(a.defaultBill   || 50);
        var bill = billState[0]; var setBill = billState[1];
        var tipState   = useState(a.defaultTip    || 15);
        var tipPct = tipState[0]; var setTipPct = tipState[1];
        var custState  = useState('');
        var customTip = custState[0]; var setCustomTip = custState[1];
        var pplState   = useState(a.defaultPeople || 2);
        var people = pplState[0]; var setPeople = pplState[1];

        var effectiveTip = customTip !== '' ? parseFloat(customTip) : tipPct;
        var tipAmt  = bill * effectiveTip / 100;
        var total   = bill + tipAmt;
        var perPerson = people > 0 ? total / people : total;

        var quickTips = a.quickTips || [10, 15, 18, 20, 25];
        var accent    = a.accentColor    || '#6c3fb5';
        var cur       = a.currency       || '$';
        var pos       = a.currencyPos    || 'before';
        var cRadius   = (a.cardRadius    || 16) + 'px';
        var btnR      = (a.btnRadius     || 8)  + 'px';

        var cardStyle = {
            background:    a.cardBg || '#ffffff',
            borderRadius:  cRadius,
            padding:       '32px',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:      (a.maxWidth     || 520) + 'px',
            margin:        '0 auto',
            paddingTop:    (a.paddingTop   || 60)  + 'px',
            paddingBottom: (a.paddingBottom|| 60)  + 'px',
            boxSizing:     'border-box',
        };

        var inputStyle = {
            width: '100%', padding: '12px 14px', borderRadius: '8px',
            border: '1.5px solid #e5e7eb', fontSize: '18px',
            boxSizing: 'border-box', outline: 'none',
        };

        return el('div', { style: cardStyle },
            a.showTitle && el('h2', { className: 'bkbg-tc-title', style: { color: a.titleColor || '#1e1b4b', textAlign: 'center', marginTop: 0, marginBottom: 8 } }, a.title || __('Tip Calculator', 'blockenberg')),
            a.showSubtitle && el('p', { style: { color: a.subtitleColor || '#6b7280', textAlign: 'center', marginTop: 0, marginBottom: 28 } }, a.subtitle),

            /* Bill input */
            el('div', { style: { marginBottom: '20px' } },
                el('label', { style: { display: 'block', fontWeight: 600, fontSize: '13px', color: a.labelColor || '#374151', marginBottom: '6px' } }, __('Bill Amount', 'blockenberg')),
                el('div', { style: { position: 'relative' } },
                    el('span', { style: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '16px', pointerEvents: 'none' } }, pos === 'before' ? cur : ''),
                    el('input', {
                        type: 'number', value: bill, min: 0,
                        onChange: function(e) { setBill(parseFloat(e.target.value) || 0); },
                        style: Object.assign({}, inputStyle, { paddingLeft: pos === 'before' ? '32px' : '14px' })
                    })
                )
            ),

            /* Quick tip buttons */
            el('div', { style: { marginBottom: '20px' } },
                el('label', { style: { display: 'block', fontWeight: 600, fontSize: '13px', color: a.labelColor || '#374151', marginBottom: '8px' } }, __('Tip Percentage', 'blockenberg')),
                el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                    quickTips.map(function(pct) {
                        var isActive = customTip === '' && tipPct === pct;
                        return el('button', {
                            key: pct,
                            onClick: function() { setTipPct(pct); setCustomTip(''); },
                            style: {
                                padding: '8px 16px',
                                borderRadius: btnR,
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '14px',
                                background: isActive ? (a.activeBtnBg || accent) : (a.quickBtnBg || '#f3f4f6'),
                                color: isActive ? (a.activeBtnColor || '#fff') : (a.quickBtnColor || '#374151'),
                                transition: 'all 0.2s',
                            }
                        }, pct + '%');
                    }),
                    a.allowCustomTip && el('input', {
                        type: 'number', value: customTip, placeholder: __('Custom %', 'blockenberg'), min: 0, max: 100,
                        onChange: function(e) { setCustomTip(e.target.value); },
                        style: {
                            width: '90px', padding: '8px 12px', borderRadius: btnR,
                            border: '1.5px solid ' + (customTip !== '' ? accent : '#e5e7eb'),
                            fontSize: '14px', outline: 'none'
                        }
                    })
                )
            ),

            /* People */
            a.showSplitter && el('div', { style: { marginBottom: '28px' } },
                el('label', { style: { display: 'block', fontWeight: 600, fontSize: '13px', color: a.labelColor || '#374151', marginBottom: '8px' } }, __('Number of People', 'blockenberg')),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                    el('button', {
                        onClick: function() { setPeople(Math.max(1, people - 1)); },
                        style: { width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid ' + accent, background: '#fff', color: accent, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontWeight: 700 }
                    }, '−'),
                    el('span', { style: { fontSize: '20px', fontWeight: 700, minWidth: '28px', textAlign: 'center', color: a.titleColor || '#1e1b4b' } }, people),
                    el('button', {
                        onClick: function() { setPeople(people + 1); },
                        style: { width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid ' + accent, background: accent, color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontWeight: 700 }
                    }, '+')
                )
            ),

            /* Results */
            el('div', {
                style: {
                    background: a.resultBg || '#f5f3ff',
                    border: '1.5px solid ' + (a.resultBorder || '#ede9fe'),
                    borderRadius: cRadius,
                    padding: '24px',
                    display: 'grid',
                    gridTemplateColumns: a.showSplitter && a.showPerPerson ? '1fr 1fr' : '1fr',
                    gap: '16px',
                }
            },
                a.showTipAmount && el('div', { style: { textAlign: 'center', gridColumn: (a.showTotal || (a.showSplitter && a.showPerPerson)) ? undefined : '1 / -1' } },
                    el('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' } }, __('Tip Amount', 'blockenberg')),
                    el('div', { style: { fontSize: '28px', fontWeight: 800, color: accent } }, fmtMoney(tipAmt, cur, pos))
                ),
                a.showTotal && el('div', { style: { textAlign: 'center' } },
                    el('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' } }, __('Total', 'blockenberg')),
                    el('div', { style: { fontSize: '28px', fontWeight: 800, color: a.titleColor || '#1e1b4b' } }, fmtMoney(total, cur, pos))
                ),
                a.showSplitter && a.showPerPerson && el('div', { style: { textAlign: 'center', gridColumn: '1 / -1', paddingTop: '12px', borderTop: '1px solid ' + (a.resultBorder || '#ede9fe') } },
                    el('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' } }, __('Per Person', 'blockenberg')),
                    el('div', { className: 'bkbg-tc-result-value bkbg-tc-per-person-value', style: { color: a.resultNumColor || accent } }, fmtMoney(perPerson, cur, pos))
                )
            )
        );
    }

    registerBlockType('blockenberg/tip-calculator', {
        edit: function(props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = { background: a.bgColor || undefined };
                Object.assign(s, _tvf(a.titleTypo, '--bktpc-tt-'), _tvf(a.resultTypo, '--bktpc-rt-'));
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function(v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function(v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function(v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function(v) { setAttr({ subtitle: v }); } }),
                        el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.currency, onChange: function(v) { setAttr({ currency: v }); } }),
                        el(SelectControl, { label: __('Currency Position', 'blockenberg'), value: a.currencyPos, options: [{ label: __('Before ($50)', 'blockenberg'), value: 'before' }, { label: __('After (50$)', 'blockenberg'), value: 'after' }], onChange: function(v) { setAttr({ currencyPos: v }); } })
                    ),

                    el(PanelBody, { title: __('Defaults', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Default Bill Amount', 'blockenberg'), value: a.defaultBill, min: 0, max: 10000, onChange: function(v) { setAttr({ defaultBill: v }); } }),
                        el(RangeControl, { label: __('Default Tip %', 'blockenberg'), value: a.defaultTip, min: 0, max: 100, onChange: function(v) { setAttr({ defaultTip: v }); } }),
                        el(RangeControl, { label: __('Default People', 'blockenberg'), value: a.defaultPeople, min: 1, max: 20, onChange: function(v) { setAttr({ defaultPeople: v }); } })
                    ),

                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Tip Amount', 'blockenberg'), checked: a.showTipAmount, onChange: function(v) { setAttr({ showTipAmount: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Total', 'blockenberg'), checked: a.showTotal, onChange: function(v) { setAttr({ showTotal: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Bill Splitter', 'blockenberg'), checked: a.showSplitter, onChange: function(v) { setAttr({ showSplitter: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Per Person Amount', 'blockenberg'), checked: a.showPerPerson, onChange: function(v) { setAttr({ showPerPerson: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Allow Custom Tip Input', 'blockenberg'), checked: a.allowCustomTip, onChange: function(v) { setAttr({ allowCustomTip: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function(v) { setAttr({ titleTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Result Number Typography', 'blockenberg'),
                            value: a.resultTypo || {},
                            onChange: function(v) { setAttr({ resultTypo: v }); }
                        })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),         value: a.accentColor,    onChange: function(v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Active Button Background', 'blockenberg'), value: a.activeBtnBg, onChange: function(v) { setAttr({ activeBtnBg: v || '#6c3fb5' }); } },
                            { label: __('Active Button Text', 'blockenberg'),    value: a.activeBtnColor, onChange: function(v) { setAttr({ activeBtnColor: v || '#ffffff' }); } },
                            { label: __('Quick Button Background', 'blockenberg'), value: a.quickBtnBg,  onChange: function(v) { setAttr({ quickBtnBg: v || '#f3f4f6' }); } },
                            { label: __('Per Person Number Color', 'blockenberg'), value: a.resultNumColor, onChange: function(v) { setAttr({ resultNumColor: v || '#6c3fb5' }); } },
                            { label: __('Result Background', 'blockenberg'),     value: a.resultBg,       onChange: function(v) { setAttr({ resultBg: v || '#f5f3ff' }); } },
                            { label: __('Card Background', 'blockenberg'),       value: a.cardBg,         onChange: function(v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Section Background', 'blockenberg'),    value: a.bgColor,        onChange: function(v) { setAttr({ bgColor: v || '' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function(v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Button Radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 40, onChange: function(v) { setAttr({ btnRadius: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 300, max: 900, onChange: function(v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function(v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function(v) { setAttr({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el(TipPreview, { attrs: a })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var s = { background: a.bgColor || undefined };
                Object.assign(s, _tvf(a.titleTypo, '--bktpc-tt-'), _tvf(a.resultTypo, '--bktpc-rt-'));
                return { style: s };
            })());
            return el('div', blockProps,
                el('div', { className: 'bkbg-tc-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-tc-loading' }, 'Loading calculator…')
                )
            );
        }
    });
}() );
