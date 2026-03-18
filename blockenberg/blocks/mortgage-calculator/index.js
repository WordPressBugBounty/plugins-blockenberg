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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var TERM_OPTIONS = [
        { value: 10, label: '10 years' }, { value: 15, label: '15 years' },
        { value: 20, label: '20 years' }, { value: 25, label: '25 years' },
        { value: 30, label: '30 years' },
    ];

    function calcMortgage(price, downPct, rate, years) {
        var down     = price * downPct / 100;
        var principal= price - down;
        var n        = years * 12;
        var r        = rate / 100 / 12;
        var monthly;
        if (r === 0) {
            monthly = principal / n;
        } else {
            monthly = principal * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
        }
        var totalPaid = monthly * n;
        var totalInterest = totalPaid - principal;

        /* Amortization by year */
        var rows = [];
        var balance = principal;
        for (var y = 1; y <= years; y++) {
            var yearPrincipal = 0, yearInterest = 0;
            for (var m = 0; m < 12; m++) {
                var iPayment = balance * r;
                var pPayment = monthly - iPayment;
                yearInterest  += iPayment;
                yearPrincipal += pPayment;
                balance       -= pPayment;
            }
            rows.push({ year: y, principal: yearPrincipal, interest: yearInterest, balance: Math.max(0, balance) });
        }
        return { monthly: monthly, totalPaid: totalPaid, totalInterest: totalInterest, principal: principal, down: down, rows: rows };
    }

    function fmtMoney(val, cur, pos) {
        return pos === 'after' ? Math.round(val).toLocaleString('en-US') + ' ' + cur : cur + Math.round(val).toLocaleString('en-US');
    }

    function MortgagePreview(props) {
        var a       = props.attributes;
        var setAttr = props.setAttributes;
        var _s      = useState({ price: a.defaultPrice, down: a.defaultDown, rate: a.defaultRate, term: a.defaultTerm });
        var state   = _s[0], setState = _s[1];
        function set(k, v) { setState(function(p){ var o=Object.assign({},p); o[k]=v; return o; }); }

        var accent  = a.accentColor || '#6c3fb5';
        var cRadius = (a.cardRadius || 16) + 'px';
        var iRadius = (a.inputRadius|| 8)  + 'px';
        var maxW    = (a.maxWidth   || 680) + 'px';
        var ptop    = (a.paddingTop || 60) + 'px';
        var pbot    = (a.paddingBottom || 60) + 'px';
        var cur     = a.currency || '$';
        var curPos  = a.currencyPos || 'before';
        var fmt     = function (v) { return fmtMoney(v, cur, curPos); };

        var calc = calcMortgage(state.price, state.down, state.rate, state.term);
        var ltv  = Math.round(calc.principal / state.price * 100);
        var showPMI = a.showPMI && state.down < 20;
        var pmi  = showPMI ? (calc.principal * (a.pmiRate||0.5) / 100 / 12) : 0;
        var totalMonthly = calc.monthly + pmi;

        var inpStyle = { width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius: iRadius, fontSize:'15px', boxSizing:'border-box', outline:'none', background:'#fff', color: a.labelColor||'#374151' };
        var lblStyle = { fontSize:'13px', fontWeight:600, color: a.labelColor||'#374151', display:'block', marginBottom:'4px' };

        function numInput(val, onCh, min, max, step) {
            return el('input', { type:'number', value:val, min:min, max:max, step:step, style:inpStyle, onChange: function(e){ onCh(parseFloat(e.target.value)||0); } });
        }
        function row(label, input) {
            return el('div', { style:{ marginBottom:'14px' } }, el('label', {style:lblStyle}, label), input);
        }

        /* Breakdown cards */
        function statCard(label, value, color) {
            return el('div', { style:{ background:'#fff', borderRadius:'10px', padding:'14px 12px', border:'1.5px solid #e5e7eb', textAlign:'center' } },
                el('div', { style:{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.05em', color:'#9ca3af', marginBottom:'4px' } }, label),
                el('div', { style:{ fontSize:'20px', fontWeight:800, color: color } }, value)
            );
        }

        var tableRows = (a.tableRows || 10);

        return el('div', { style:{ background:a.cardBg||'#fff', borderRadius:cRadius, maxWidth:maxW, margin:'0 auto', paddingTop:ptop, paddingBottom:pbot, paddingLeft:'32px', paddingRight:'32px' } },
            a.showTitle !== false && a.title && el('h2', { className: 'bkbg-mtg-title', style:{ color:a.titleColor||'#1e1b4b', textAlign:'center', marginTop:0, marginBottom:'8px' } }, a.title),
            a.showSubtitle !== false && a.subtitle && el('p', { className: 'bkbg-mtg-subtitle', style:{ color:a.subtitleColor||'#6b7280', textAlign:'center', marginTop:0, marginBottom:'24px' } }, a.subtitle),

            /* Inputs */
            row('Home Price (' + cur + ')', numInput(state.price, function(v){set('price',v);}, 10000, 10000000, 1000)),
            row('Down Payment (%)',          numInput(state.down,  function(v){set('down',Math.min(99,Math.max(0,v)));}, 0, 99, 0.5)),
            row('Annual Interest Rate (%)',  numInput(state.rate,  function(v){set('rate',v);}, 0.1, 30, 0.1)),
            row('Loan Term',
                el('select', { value:state.term, style:Object.assign({},inpStyle,{appearance:'auto'}), onChange:function(e){set('term',parseInt(e.target.value));}},
                    TERM_OPTIONS.map(function(o){ return el('option',{key:o.value,value:o.value},o.label); })
                )
            ),

            /* Result */
            el('div', { style:{ background:a.resultBg||'#f5f3ff', border:'1.5px solid '+(a.resultBorder||'#ede9fe'), borderRadius:cRadius, padding:'24px', textAlign:'center', marginBottom:'20px' } },
                el('div', { style:{ fontSize:'13px', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' } }, 'Monthly Payment'),
                el('div', { className: 'bkbg-mtg-monthly', style:{ color:a.totalColor||accent, marginBottom:'4px' } }, fmt(totalMonthly)),
                el('div', { style:{ fontSize:'13px', color:'#9ca3af' } }, 'per month' + (showPMI?' (incl. PMI)':'')),
                showPMI && el('div', { style:{ marginTop:'8px', fontSize:'13px', color:a.pmiColor||'#f59e0b' } }, 'PMI: ' + fmt(pmi) + '/mo (down < 20%)')
            ),

            /* Breakdown stats */
            a.showBreakdown !== false && el('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'20px' } },
                statCard('Loan Amount',    fmt(calc.principal),     a.principalColor||'#3b82f6'),
                statCard('Total Interest', fmt(calc.totalInterest), a.interestColor||'#ef4444'),
                statCard('Total Cost',     fmt(calc.totalPaid),     a.totalColor||accent)
            ),

            /* LTV */
            a.showLTV !== false && el('div', { style:{ textAlign:'center', marginBottom:'20px', fontSize:'14px', color:a.labelColor||'#374151' } },
                'Loan-to-Value (LTV): ',
                el('strong', { style:{ color: ltv >= 80 ? (a.interestColor||'#ef4444') : (a.principalColor||'#3b82f6') } }, ltv + '%'),
                ltv >= 80 ? ' — PMI may apply' : ' — no PMI required'
            ),

            /* Year table */
            a.showYearTable !== false && el('div', { style:{ overflowX:'auto' } },
                el('table', { style:{ width:'100%', borderCollapse:'collapse', fontSize:'13px' } },
                    el('thead', null,
                        el('tr', { style:{ background:a.tableBg||'#fafafa' } },
                            ['Year','Balance','Principal Paid','Interest Paid'].map(function(h,i){
                                return el('th',{key:i,style:{padding:'10px 8px',textAlign:i===0?'left':'right',fontWeight:700,color:a.labelColor||'#374151',borderBottom:'2px solid #e5e7eb'}},h);
                            })
                        )
                    ),
                    el('tbody', null,
                        calc.rows.slice(0, tableRows).map(function(row, idx){
                            var last = idx === Math.min(calc.rows.length, tableRows) - 1;
                            return el('tr', { key:idx, style:{ background:idx%2===0?'#fff':a.tableBg||'#fafafa', fontWeight:last?700:'normal', borderBottom:'1px solid #f0f0f0' } },
                                el('td',{style:{padding:'9px 8px',color:a.labelColor||'#374151'}},'Year '+row.year),
                                el('td',{style:{padding:'9px 8px',textAlign:'right',color:a.totalColor||accent}},fmt(row.balance)),
                                el('td',{style:{padding:'9px 8px',textAlign:'right',color:a.principalColor||'#3b82f6'}},fmt(row.principal)),
                                el('td',{style:{padding:'9px 8px',textAlign:'right',color:a.interestColor||'#ef4444'}},fmt(row.interest))
                            );
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/mortgage-calculator', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mtg-tt-'));
                Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-mtg-st-'));
                Object.assign(s, _tvf(a.resultTypo, '--bkbg-mtg-rs-'));
                return { className: 'bkbg-mortgage-calculator-block bkbg-mtg-app', style: s };
            })());

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, {label:'Title',    value:a.title,    onChange:function(v){setAttr({title:v}); } }),
                        el(ToggleControl, {label:'Show title',    checked:a.showTitle,    onChange:function(v){setAttr({showTitle:v});},    __nextHasNoMarginBottom:true }),
                        el(TextControl, {label:'Subtitle', value:a.subtitle, onChange:function(v){setAttr({subtitle:v}); } }),
                        el(ToggleControl, {label:'Show subtitle', checked:a.showSubtitle, onChange:function(v){setAttr({showSubtitle:v});}, __nextHasNoMarginBottom:true }),
                        el(TextControl, {label:'Currency symbol', value:a.currency, onChange:function(v){setAttr({currency:v}); } }),
                        el(SelectControl, {label:'Currency position', value:a.currencyPos, options:[{label:'Before',value:'before'},{label:'After',value:'after'}], onChange:function(v){setAttr({currencyPos:v}); } }),
                    ),
                    el(PanelBody, { title: __('Defaults', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {label:'Default home price', value:a.defaultPrice, min:50000, max:5000000, step:10000, onChange:function(v){setAttr({defaultPrice:v});} }),
                        el(RangeControl, {label:'Default down payment %', value:a.defaultDown, min:0, max:50, step:0.5, onChange:function(v){setAttr({defaultDown:v});} }),
                        el(RangeControl, {label:'Default rate %', value:a.defaultRate, min:0.5, max:25, step:0.1, onChange:function(v){setAttr({defaultRate:v});} }),
                        el(SelectControl, {label:'Default term', value:a.defaultTerm, options:TERM_OPTIONS.map(function(o){return {label:o.label,value:o.value};}), onChange:function(v){setAttr({defaultTerm:parseInt(v)});} }),
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {label:'Show PMI',          checked:a.showPMI,      onChange:function(v){setAttr({showPMI:v});},      __nextHasNoMarginBottom:true }),
                        a.showPMI && el(RangeControl, {label:'PMI rate %', value:a.pmiRate, min:0.1, max:2, step:0.1, onChange:function(v){setAttr({pmiRate:v});} }),
                        el(ToggleControl, {label:'Show breakdown',    checked:a.showBreakdown,onChange:function(v){setAttr({showBreakdown:v});}, __nextHasNoMarginBottom:true }),
                        el(ToggleControl, {label:'Show LTV ratio',    checked:a.showLTV,      onChange:function(v){setAttr({showLTV:v});},       __nextHasNoMarginBottom:true }),
                        el(ToggleControl, {label:'Show year table',   checked:a.showYearTable,onChange:function(v){setAttr({showYearTable:v});}, __nextHasNoMarginBottom:true }),
                        a.showYearTable && el(RangeControl, {label:'Table rows',value:a.tableRows, min:5, max:30, onChange:function(v){setAttr({tableRows:v});} }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { setAttr({ subtitleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Result Number', 'blockenberg'), value: a.resultTypo, onChange: function (v) { setAttr({ resultTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false, colorSettings: [
                            { label:'Accent',          value:a.accentColor,     onChange:function(v){setAttr({accentColor:v});} },
                            { label:'Card background', value:a.cardBg,          onChange:function(v){setAttr({cardBg:v});} },
                            { label:'Result background',value:a.resultBg,       onChange:function(v){setAttr({resultBg:v});} },
                            { label:'Result border',   value:a.resultBorder,    onChange:function(v){setAttr({resultBorder:v});} },
                            { label:'Total / main',    value:a.totalColor,      onChange:function(v){setAttr({totalColor:v});} },
                            { label:'Principal',       value:a.principalColor,  onChange:function(v){setAttr({principalColor:v});} },
                            { label:'Interest',        value:a.interestColor,   onChange:function(v){setAttr({interestColor:v});} },
                            { label:'PMI',             value:a.pmiColor,        onChange:function(v){setAttr({pmiColor:v});} },
                            { label:'Title',           value:a.titleColor,      onChange:function(v){setAttr({titleColor:v});} },
                            { label:'Table background',value:a.tableBg,         onChange:function(v){setAttr({tableBg:v});} },
                        ],
                    }),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {label:'Max width (px)',   value:a.maxWidth,      min:340, max:1200, step:10, onChange:function(v){setAttr({maxWidth:v});} }),
                        el(RangeControl, {label:'Padding top',      value:a.paddingTop,    min:0,   max:120,           onChange:function(v){setAttr({paddingTop:v});} }),
                        el(RangeControl, {label:'Padding bottom',   value:a.paddingBottom, min:0,   max:120,           onChange:function(v){setAttr({paddingBottom:v});} }),
                        el(RangeControl, {label:'Card radius (px)', value:a.cardRadius,    min:0,   max:32,            onChange:function(v){setAttr({cardRadius:v});} }),
                        el(RangeControl, {label:'Input radius (px)',value:a.inputRadius,   min:0,   max:20,            onChange:function(v){setAttr({inputRadius:v});} }),
                    )
                ),
                el(MortgagePreview, { attributes: a, setAttributes: setAttr })
            );
        },

        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-mortgage-calculator-block' });
                return el('div', Object.assign({}, blockProps, {
                    className: (blockProps.className || '') + ' bkbg-mtg-app',
                    'data-opts': JSON.stringify(a),
                }));
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mtg-tt-'));
                Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-mtg-st-'));
                Object.assign(s, _tvf(a.resultTypo, '--bkbg-mtg-rs-'));
                return { className: 'bkbg-mortgage-calculator-block', style: s };
            })());
            return el('div', Object.assign({}, blockProps, {
                className: (blockProps.className || '') + ' bkbg-mtg-app',
                'data-opts': JSON.stringify(a),
            }));
        },
    });
}() );
