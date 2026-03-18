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
    var SelectControl      = wp.components.SelectControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _dpcTC, _dpcTV;
    function _tc() { return _dpcTC || (_dpcTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_dpcTV || (_dpcTV = window.bkbgTypoCssVars)) ? _dpcTV(t, p) : {}; }

    var DEFAULT_DEBTS = [
        {id:1, name:'Credit Card A', balance:5000, rate:22.99, minPay:100},
        {id:2, name:'Credit Card B', balance:2800, rate:17.49, minPay:60},
        {id:3, name:'Personal Loan', balance:8500, rate:11.5,  minPay:180}
    ];
    var nextId = 10;

    function calcPayoff(debts, extraMonthly, strategy) {
        if (!debts.length) return {months:0, totalInterest:0, schedule:[]};
        var list = debts.map(function(d){ return {name:d.name, balance:parseFloat(d.balance)||0, rate:(parseFloat(d.rate)||0)/100/12, min:parseFloat(d.minPay)||0}; });
        list = list.filter(function(d){ return d.balance > 0; });
        if (!list.length) return {months:0, totalInterest:0, schedule:[]};

        var minTotal = list.reduce(function(s,d){ return s+d.min; }, 0);
        var budget = minTotal + (extraMonthly||0);

        // sort by strategy
        var sorted = list.slice().sort(function(a,b){
            return strategy === 'avalanche' ? b.rate - a.rate : a.balance - b.balance;
        });

        var schedule = [];
        var totalInterest = 0;
        var months = 0;
        var MAX = 600;

        while (sorted.some(function(d){ return d.balance > 0; }) && months < MAX) {
            months++;
            var available = budget;
            var row = {month: months, debts:[], totalBalance:0};

            // pay minimums first
            sorted.forEach(function(d){
                if (d.balance <= 0) return;
                var interest = d.balance * d.rate;
                totalInterest += interest;
                d.balance += interest;
                var pay = Math.min(d.min, d.balance);
                d.balance -= pay;
                available -= pay;
                if (d.balance < 0.01) d.balance = 0;
            });

            // apply extra to priority debt
            for (var i=0; i<sorted.length; i++) {
                if (sorted[i].balance > 0 && available > 0) {
                    var extra = Math.min(available, sorted[i].balance);
                    sorted[i].balance -= extra;
                    available -= extra;
                    if (sorted[i].balance < 0.01) sorted[i].balance = 0;
                }
            }

            sorted.forEach(function(d){ row.totalBalance += d.balance; });
            row.totalInterest = Math.round(totalInterest*100)/100;
            if (schedule.length < 120) schedule.push(row);
        }

        return {months: months, totalInterest: Math.round(totalInterest*100)/100, schedule: schedule};
    }

    function fmt(n, cur) { return (cur||'$') + Math.abs(n).toLocaleString('en', {minimumFractionDigits:2,maximumFractionDigits:2}); }

    function DPCPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';
        var cur    = a.currency || '$';

        var _debts = useState(DEFAULT_DEBTS.map(function(d){ return Object.assign({},d); }));
        var debts = _debts[0]; var setDebts = _debts[1];

        var _extra = useState(200);
        var extra = _extra[0]; var setExtra = _extra[1];

        var _strat = useState(a.defaultStrategy || 'avalanche');
        var strat = _strat[0]; var setStrat = _strat[1];

        var avResult = calcPayoff(debts, extra, 'avalanche');
        var sbResult = calcPayoff(debts, extra, 'snowball');
        var curResult = strat === 'avalanche' ? avResult : sbResult;

        var inpStyle = {padding:'6px 8px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderRadius:(a.inputRadius||8)+'px',fontSize:'14px',fontFamily:'inherit',outline:'none',width:'100%',boxSizing:'border-box'};
        var lblStyle = {fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',display:'block',marginBottom:'3px'};

        function updateDebt(id, field, val) {
            setDebts(debts.map(function(d){ return d.id===id ? Object.assign({},d,{[field]:val}) : d; }));
        }

        return el('div',{style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div',{style:{background:a.cardBg||'#fff',borderRadius:(a.cardRadius||16)+'px',padding:'28px',maxWidth:(a.maxWidth||700)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'20px'}},
                    a.showTitle    && el('div',{className:'bkbg-dpc-title',style:{color:a.titleColor,marginBottom:'4px'}},(a.title)),
                    a.showSubtitle && el('div',{className:'bkbg-dpc-subtitle',style:{color:a.subtitleColor}},(a.subtitle))
                ),

                // Strategy tabs
                el('div',{style:{display:'flex',gap:'8px',marginBottom:'20px'}},
                    [{id:'avalanche',label:'⬇ Avalanche (highest rate first)',color:a.avalancheColor||'#8b5cf6'},
                     {id:'snowball', label:'⛄ Snowball (lowest balance first)',color:a.snowballColor||'#3b82f6'}].map(function(s){
                        var active = strat===s.id;
                        return el('button',{key:s.id,onClick:function(){setStrat(s.id);},style:{flex:1,padding:'8px 12px',border:'2px solid '+(active?s.color:'#e5e7eb'),borderRadius:'8px',background:active?s.color+'18':'#fff',color:active?s.color:'#6b7280',fontWeight:active?700:500,cursor:'pointer',fontSize:'13px',fontFamily:'inherit',transition:'all .2s'}},s.label);
                    })
                ),

                // Debt rows header
                el('div',{style:{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 36px',gap:'6px',padding:'4px 8px',marginBottom:'4px'}},
                    ['Name','Balance','APR %','Min Pay',''].map(function(h){
                        return el('div',{key:h,style:lblStyle},h);
                    })
                ),

                debts.map(function(d){
                    return el('div',{key:d.id,style:{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 36px',gap:'6px',alignItems:'center',background:a.rowBg||'#f9fafb',border:'1px solid '+(a.rowBorder||'#e5e7eb'),borderRadius:'8px',padding:'7px 8px',marginBottom:'6px'}},
                        el('input',{type:'text',value:d.name,placeholder:'Debt name',style:inpStyle,onChange:function(e){updateDebt(d.id,'name',e.target.value);}}),
                        el('input',{type:'number',value:d.balance,min:0,style:inpStyle,onChange:function(e){updateDebt(d.id,'balance',e.target.value);}}),
                        el('input',{type:'number',value:d.rate,min:0,max:100,step:0.01,style:inpStyle,onChange:function(e){updateDebt(d.id,'rate',e.target.value);}}),
                        el('input',{type:'number',value:d.minPay,min:0,style:inpStyle,onChange:function(e){updateDebt(d.id,'minPay',e.target.value);}}),
                        el('button',{onClick:function(){setDebts(debts.filter(function(x){return x.id!==d.id;}));},style:{border:'none',background:'#fee2e2',color:'#ef4444',borderRadius:'6px',cursor:'pointer',padding:'4px 8px',fontWeight:700,fontSize:'14px',fontFamily:'inherit',width:'36px',height:'32px'}},'×')
                    );
                }),

                el('div',{style:{display:'flex',gap:'12px',marginTop:'8px',marginBottom:'20px',flexWrap:'wrap',alignItems:'flex-end'}},
                    el('button',{onClick:function(){nextId++;setDebts(debts.concat({id:nextId,name:'New Debt',balance:1000,rate:15,minPay:25}));},style:{padding:'8px 16px',background:accent,color:'#fff',border:'none',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}},'+ Add Debt'),
                    el('div',{style:{flex:1,minWidth:'160px'}},
                        el('label',{style:lblStyle},'Extra Monthly Payment ('+cur+')'),
                        el('input',{type:'number',value:extra,min:0,style:{...inpStyle,maxWidth:'180px'},onChange:function(e){setExtra(parseFloat(e.target.value)||0);}})
                    )
                ),

                // Results
                el('div',{style:{background:a.resultBg||'#f5f3ff',border:'1px solid '+(a.resultBorder||'#ede9fe'),borderRadius:'12px',padding:'18px',marginBottom:'16px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:700,color:strat==='avalanche'?(a.avalancheColor||'#8b5cf6'):(a.snowballColor||'#3b82f6'),textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'12px'}},
                        (strat==='avalanche'?'Avalanche':'Snowball')+' Strategy Results'
                    ),
                    el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}},
                        [{label:'Months to Payoff',val:curResult.months+' mo'},
                         {label:'Years to Payoff', val:(curResult.months/12).toFixed(1)+' yr'},
                         {label:'Total Interest',  val:fmt(curResult.totalInterest,cur)}
                        ].map(function(item){
                            return el('div',{key:item.label,style:{textAlign:'center',background:'#fff',borderRadius:'8px',padding:'12px 8px'}},
                                el('div',{style:{fontSize:(a.resultNumFontSize||22)+'px',fontWeight:800,color:accent}},(item.val)),
                                el('div',{style:{fontSize:'12px',color:'#6b7280',marginTop:'2px'}},(item.label))
                            );
                        })
                    )
                ),

                // Comparison
                a.showComparison && el('div',{style:{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px',marginBottom:'16px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'12px'}},'Strategy Comparison'),
                    el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}},
                        [{label:'Avalanche',res:avResult,color:a.avalancheColor||'#8b5cf6'},
                         {label:'Snowball', res:sbResult, color:a.snowballColor||'#3b82f6'}].map(function(s){
                            return el('div',{key:s.label,style:{background:s.color+'0d',border:'2px solid '+s.color+'44',borderRadius:'10px',padding:'12px',textAlign:'center'}},
                                el('div',{style:{color:s.color,fontWeight:800,fontSize:(a.stratLabelFontSize||15)+'px',marginBottom:'4px'}},s.label),
                                el('div',{style:{fontSize:'20px',fontWeight:800,color:'#1f2937'}},s.res.months+' mo'),
                                el('div',{style:{fontSize:'13px',color:'#6b7280'}},'Interest: '+fmt(s.res.totalInterest,cur))
                            );
                        })
                    ),
                    avResult.months > 0 && sbResult.months > 0 && el('div',{style:{marginTop:'12px',textAlign:'center',fontSize:'14px',color:'#374151',background:'#f9fafb',borderRadius:'8px',padding:'10px'}},
                        avResult.totalInterest <= sbResult.totalInterest
                            ? '💡 Avalanche saves '+fmt(sbResult.totalInterest-avResult.totalInterest,cur)+' in interest vs. Snowball'
                            : '💡 Snowball saves '+fmt(avResult.totalInterest-sbResult.totalInterest,cur)+' in interest vs. Avalanche'
                    )
                ),

                // Schedule preview
                a.showSchedule && curResult.schedule.length > 0 && el('div',null,
                    el('div',{style:{fontSize:'13px',fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'8px'}},'Payoff Schedule (first '+(a.scheduleRows||12)+' months)'),
                    el('div',{style:{overflowX:'auto'}},
                        el('table',{style:{width:'100%',borderCollapse:'collapse',fontSize:(a.tableFontSize||13)+'px'}},
                            el('thead',null,
                                el('tr',null,
                                    ['Month','Remaining Balance','Total Interest Paid'].map(function(h){
                                        return el('th',{key:h,style:{textAlign:'left',padding:'6px 10px',background:'#f3f4f6',color:'#374151',fontWeight:600,borderBottom:'2px solid #e5e7eb',whiteSpace:'nowrap'}},h);
                                    })
                                )
                            ),
                            el('tbody',null,
                                curResult.schedule.slice(0,a.scheduleRows||12).map(function(row,i){
                                    return el('tr',{key:row.month,style:{background:i%2===0?'#fff':'#f9fafb'}},
                                        el('td',{style:{padding:'6px 10px',color:'#374151',borderBottom:'1px solid #f3f4f6'}},row.month),
                                        el('td',{style:{padding:'6px 10px',color:'#374151',fontWeight:600,borderBottom:'1px solid #f3f4f6'}},fmt(row.totalBalance,cur)),
                                        el('td',{style:{padding:'6px 10px',color:'#ef4444',borderBottom:'1px solid #f3f4f6'}},fmt(row.totalInterest,cur))
                                    );
                                })
                            )
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/debt-payoff-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign(
                { '--bkbg-dpc-ttl-fs': (a.titleSize || 28) + 'px',
                  '--bkbg-dpc-sub-fs': (a.subtitleFontSize || 15) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-dpc-ttl-'),
                _tv(a.typoSubtitle || {}, '--bkbg-dpc-sub-')
            ) });
            var colorSettings = [
                {value:a.accentColor,    onChange:function(v){set({accentColor:v});},    label:'Accent Color'},
                {value:a.cardBg,         onChange:function(v){set({cardBg:v});},          label:'Card Background'},
                {value:a.avalancheColor, onChange:function(v){set({avalancheColor:v});},  label:'Avalanche Strategy Color'},
                {value:a.snowballColor,  onChange:function(v){set({snowballColor:v});},   label:'Snowball Strategy Color'},
                {value:a.resultBg,       onChange:function(v){set({resultBg:v});},        label:'Results Background'},
                {value:a.resultBorder,   onChange:function(v){set({resultBorder:v});},    label:'Results Border'},
                {value:a.rowBg,          onChange:function(v){set({rowBg:v});},           label:'Debt Row Background'},
                {value:a.rowBorder,      onChange:function(v){set({rowBorder:v});},       label:'Debt Row Border'},
                {value:a.inputBorder,    onChange:function(v){set({inputBorder:v});},     label:'Input Border'},
                {value:a.labelColor,     onChange:function(v){set({labelColor:v});},      label:'Label Color'},
                {value:a.titleColor,     onChange:function(v){set({titleColor:v});},      label:'Title Color'},
                {value:a.subtitleColor,  onChange:function(v){set({subtitleColor:v});},   label:'Subtitle Color'},
                {value:a.sectionBg,      onChange:function(v){set({sectionBg:v});},       label:'Section Background'}
            ];
            return el(Fragment,null,
                el(InspectorControls,null,
                    el(PanelBody,{title:'Header',initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,   onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle,onChange:function(v){set({subtitle:v});}})
                    ),
                    el(PanelBody,{title:'Calculator Settings',initialOpen:true},
                        el(TextControl,{label:'Currency Symbol',value:a.currency,onChange:function(v){set({currency:v});}}),
                        el(SelectControl,{label:'Default Strategy',value:a.defaultStrategy,options:[{label:'Avalanche (highest rate first)',value:'avalanche'},{label:'Snowball (lowest balance first)',value:'snowball'}],onChange:function(v){set({defaultStrategy:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Strategy Comparison',checked:a.showComparison,onChange:function(v){set({showComparison:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Payment Schedule',  checked:a.showSchedule,  onChange:function(v){set({showSchedule:v});}}),
                        el(RangeControl,{label:'Schedule Rows to Show',value:a.scheduleRows,min:6,max:60,step:6,onChange:function(v){set({scheduleRows:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && _tc()({ label: __('Title typography', 'blockenberg'), value: a.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); } }),
                        _tc() && _tc()({ label: __('Subtitle typography', 'blockenberg'), value: a.typoSubtitle || {}, onChange: function (v) { set({ typoSubtitle: v }); } }),
                        el(RangeControl,{label:'Result number size (px)',value:a.resultNumFontSize,min:14,max:36,step:1,onChange:function(v){set({resultNumFontSize:v});},  __nextHasNoMarginBottom:true}),
                        el(RangeControl,{label:'Strategy label size (px)',value:a.stratLabelFontSize,min:11,max:22,step:1,onChange:function(v){set({stratLabelFontSize:v});},__nextHasNoMarginBottom:true}),
                        el(RangeControl,{label:'Table font size (px)',value:a.tableFontSize,    min:10,max:18,step:1,   onChange:function(v){set({tableFontSize:v});},        __nextHasNoMarginBottom:true})
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius,  min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Radius',      value:a.inputRadius, min:0, max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',    value:a.maxWidth,    min:360,max:1100,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',       value:a.paddingTop,  min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',    value:a.paddingBottom,min:0,max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div',blockProps, el(DPCPreview,{attributes:a}))
            );
        },
        save: function(props){
            var a = props.attributes;
            return el('div',wp.blockEditor.useBlockProps.save(),
                el('div',{className:'bkbg-dpc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
