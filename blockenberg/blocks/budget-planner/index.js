( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var DEFAULT_CATEGORIES = [
        { name:'Housing',      amount:1200, icon:'🏠' },
        { name:'Food',         amount:400,  icon:'🍔' },
        { name:'Transport',    amount:250,  icon:'🚗' },
        { name:'Utilities',    amount:150,  icon:'💡' },
        { name:'Healthcare',   amount:100,  icon:'🏥' },
        { name:'Entertainment',amount:200,  icon:'🎬' }
    ];

    function EditorPreview(props) {
        var a   = props.attributes;
        var cur = a.currency;

        var totalExpenses = DEFAULT_CATEGORIES.reduce(function(s,c){ return s+c.amount; }, 0);
        var totalIncome   = a.defaultIncome;
        var savings       = a.showSavingsGoal ? a.defaultSavings : 0;
        var surplus       = totalIncome - totalExpenses - savings;
        var surplusColor  = surplus >= 0 ? a.surplusColor : a.expenseColor;

        var wrapStyle = {
            background: a.sectionBg, borderRadius:'14px', padding:'32px 24px',
            maxWidth: a.contentMaxWidth+'px', margin:'0 auto', fontFamily:'inherit', boxSizing:'border-box'
        };
        var cardStyle = {
            background:a.cardBg, borderRadius:'12px', padding:'16px 18px',
            border:'1.5px solid #e5e7eb', marginBottom:'12px'
        };

        // Summary cards
        var summaryCards = [
            { label:'Total Income',   value: cur+totalIncome.toLocaleString(),           color: a.accentColor  },
            { label:'Total Expenses', value: cur+totalExpenses.toLocaleString(),          color: a.expenseColor },
            { label:'Savings Goal',   value: cur+(a.defaultSavings||0).toLocaleString(), color: a.savingsColor, hide: !a.showSavingsGoal },
            { label:'Surplus / Deficit', value: (surplus>=0?'+':'')+cur+Math.abs(surplus).toLocaleString(), color: surplusColor }
        ].filter(function(c){ return !c.hide; });

        // Balance bar
        var expPct  = totalIncome > 0 ? Math.min(100, (totalExpenses/totalIncome)*100) : 0;
        var savPct  = totalIncome > 0 ? Math.min(100-expPct, (savings/totalIncome)*100) : 0;
        var surPct  = 100 - expPct - savPct;

        return el('div', { style: wrapStyle },
            el(RichText, { tagName:'h3', className:'bkbg-bp-title', value:a.title, onChange:function(v){ props.setAttributes({title:v}); },
                style:{ color:a.titleColor, margin:'0 0 6px 0' }, placeholder:'Block title...' }),
            el(RichText, { tagName:'p', className:'bkbg-bp-subtitle', value:a.subtitle, onChange:function(v){ props.setAttributes({subtitle:v}); },
                style:{ color:a.subtitleColor, margin:'0 0 24px 0' }, placeholder:'Subtitle...' }),

            // Income row
            el('div', { style: Object.assign({}, cardStyle, { display:'flex', alignItems:'center', gap:'16px' }) },
                el('span', { style:{ fontSize:'22px' } }, '💰'),
                el('div', { style:{ flex:1 } },
                    el('div', { style:{ fontSize:'12px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em' } }, 'Monthly Income'),
                    el('div', { style:{ fontSize:'22px', fontWeight:'700', color:a.accentColor } }, cur + Number(a.defaultIncome).toLocaleString())
                ),
                el('input', { type:'number', readOnly:true, value:a.defaultIncome,
                    style:{ width:'120px', border:'1.5px solid #e5e7eb', borderRadius:'8px', padding:'8px 12px', fontSize:'15px', background:a.inputBg, color:a.labelColor } })
            ),

            // Expense categories
            el('div', { style:{ marginBottom:'16px' } },
                el('div', { style:{ fontSize:'13px', fontWeight:'700', color:a.labelColor, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' } }, 'Expense Categories'),
                DEFAULT_CATEGORIES.map(function(cat) {
                    return el('div', { key:cat.name, style:{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', background:a.cardBg, borderRadius:'9px', marginBottom:'7px', border:'1.5px solid #f3f4f6' } },
                        el('span', { style:{ fontSize:'18px', minWidth:'26px' } }, cat.icon),
                        el('span', { style:{ flex:1, fontSize:'14px', fontWeight:'500', color:a.labelColor } }, cat.name),
                        el('span', { style:{ fontSize:'14px', fontWeight:'700', color:a.expenseColor } }, cur + cat.amount.toLocaleString())
                    );
                })
            ),

            // Savings goal
            a.showSavingsGoal && el('div', { style: Object.assign({}, cardStyle, { display:'flex', alignItems:'center', gap:'16px', borderColor:'#e9d5ff' }) },
                el('span', { style:{ fontSize:'22px' } }, '🎯'),
                el('div', { style:{ flex:1 } },
                    el('div', { style:{ fontSize:'12px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', color:'#6b7280' } }, 'Savings Goal'),
                    el('div', { style:{ fontSize:'20px', fontWeight:'700', color:a.savingsColor } }, cur + (a.defaultSavings||0).toLocaleString())
                )
            ),

            // Summary cards
            el('div', { style:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'10px', margin:'16px 0' } },
                summaryCards.map(function(c) {
                    return el('div', { key:c.label, style:{ background:a.cardBg, borderRadius:'10px', padding:'12px 14px', borderLeft:'4px solid '+c.color } },
                        el('div', { style:{ fontSize:'11px', fontWeight:'600', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px' } }, c.label),
                        el('div', { style:{ fontSize:'18px', fontWeight:'700', color:c.color } }, c.value)
                    );
                })
            ),

            // Balance bar
            a.showPieBreakdown && el('div', { style:{ marginBottom:'8px' } },
                el('div', { style:{ fontSize:'12px', fontWeight:'700', color:a.labelColor, marginBottom:'8px' } }, 'Income Allocation'),
                el('div', { style:{ display:'flex', borderRadius:'999px', overflow:'hidden', height:'22px' } },
                    el('div', { style:{ width:expPct+'%', background:a.expenseColor, transition:'width 0.4s' }, title:'Expenses' }),
                    el('div', { style:{ width:savPct+'%', background:a.savingsColor, transition:'width 0.4s' }, title:'Savings'  }),
                    el('div', { style:{ width:Math.max(0,surPct)+'%', background:a.surplusColor, transition:'width 0.4s' }, title:'Surplus' })
                ),
                el('div', { style:{ display:'flex', gap:'16px', marginTop:'6px', flexWrap:'wrap' } },
                    el('span', { style:{ fontSize:'12px', color:a.expenseColor, fontWeight:'600' } }, '● Expenses ' + Math.round(expPct)+'%'),
                    el('span', { style:{ fontSize:'12px', color:a.savingsColor, fontWeight:'600' } }, '● Savings ' + Math.round(savPct)+'%'),
                    el('span', { style:{ fontSize:'12px', color:a.surplusColor, fontWeight:'600' } }, '● Surplus ' + Math.max(0,Math.round(surPct))+'%')
                )
            )
        );
    }

    registerBlockType('blockenberg/budget-planner', {
        edit: function(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { value:a.accentColor,   onChange:function(v){ set({accentColor:   v||'#22c55e'}); }, label:'Income color'     },
                { value:a.expenseColor,  onChange:function(v){ set({expenseColor:  v||'#f43f5e'}); }, label:'Expense color'    },
                { value:a.savingsColor,  onChange:function(v){ set({savingsColor:  v||'#8b5cf6'}); }, label:'Savings color'    },
                { value:a.surplusColor,  onChange:function(v){ set({surplusColor:  v||'#0ea5e9'}); }, label:'Surplus color'    },
                { value:a.sectionBg,     onChange:function(v){ set({sectionBg:     v||'#f0fdf4'}); }, label:'Section background'},
                { value:a.cardBg,        onChange:function(v){ set({cardBg:        v||'#ffffff'}); }, label:'Card background'  },
                { value:a.inputBg,       onChange:function(v){ set({inputBg:       v||'#f9fafb'}); }, label:'Input background' },
                { value:a.titleColor,    onChange:function(v){ set({titleColor:    v||'#111827'}); }, label:'Title color'      },
                { value:a.subtitleColor, onChange:function(v){ set({subtitleColor: v||'#6b7280'}); }, label:'Subtitle color'   },
                { value:a.labelColor,    onChange:function(v){ set({labelColor:    v||'#374151'}); }, label:'Label color'      }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Budget Settings', initialOpen:true },
                        el(TextControl, { label:'Currency Symbol', value:a.currency, onChange:function(v){ set({currency:v}); } }),
                        el(TextControl, { label:'Default Monthly Income ($)', type:'number', value:String(a.defaultIncome), onChange:function(v){ set({defaultIncome:parseFloat(v)||0}); } }),
                        el(TextControl, { label:'Default Savings Goal ($)',   type:'number', value:String(a.defaultSavings), onChange:function(v){ set({defaultSavings:parseFloat(v)||0}); } })
                    ),
                    el(PanelBody, { title:'Display Options', initialOpen:false },
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show Savings Goal row',     checked:a.showSavingsGoal,  onChange:function(v){ set({showSavingsGoal: v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show allocation bar',       checked:a.showPieBreakdown, onChange:function(v){ set({showPieBreakdown:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show budgeting tips',       checked:a.showTips,         onChange:function(v){ set({showTips:        v}); } })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max Width (px)',  value:a.contentMaxWidth, min:400, max:1200, step:20, onChange:function(v){ set({contentMaxWidth:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { set({ typoSubtitle: v }); } })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', useBlockProps({ style: Object.assign({}, _tv(a.typoTitle, '--bkbg-bp-title-'), _tv(a.typoSubtitle, '--bkbg-bp-sub-')) }),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-bp-app',
                    'data-opts': JSON.stringify({
                        title:           a.title,
                        subtitle:        a.subtitle,
                        currency:        a.currency,
                        showSavingsGoal: a.showSavingsGoal,
                        showPieBreakdown:a.showPieBreakdown,
                        showTips:        a.showTips,
                        defaultIncome:   a.defaultIncome,
                        defaultSavings:  a.defaultSavings,
                        accentColor:     a.accentColor,
                        expenseColor:    a.expenseColor,
                        savingsColor:    a.savingsColor,
                        surplusColor:    a.surplusColor,
                        sectionBg:       a.sectionBg,
                        cardBg:          a.cardBg,
                        inputBg:         a.inputBg,
                        titleColor:      a.titleColor,
                        subtitleColor:   a.subtitleColor,
                        labelColor:      a.labelColor,
                        titleFontSize:   a.titleFontSize,
                        contentMaxWidth: a.contentMaxWidth,
                        typoTitle:       a.typoTitle,
                        typoSubtitle:    a.typoSubtitle
                    })
                })
            );
        }
    });
}() );
