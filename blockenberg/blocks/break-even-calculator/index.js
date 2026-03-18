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
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    function calcBEP(fixedCosts, pricePerUnit, varCostUnit, unitsToSell) {
        var contribution    = pricePerUnit - varCostUnit;
        var bepUnits        = contribution > 0 ? fixedCosts / contribution : Infinity;
        var bepRevenue      = bepUnits * pricePerUnit;
        var profitAtUnits   = unitsToSell * contribution - fixedCosts;
        var marginRatio     = pricePerUnit > 0 ? (contribution / pricePerUnit) * 100 : 0;
        return {
            bepUnits: Math.ceil(bepUnits),
            bepRevenue: bepRevenue,
            contribution: contribution,
            profitAtUnits: profitAtUnits,
            marginRatio: marginRatio,
            revenue: unitsToSell * pricePerUnit,
            totalCosts: fixedCosts + unitsToSell * varCostUnit
        };
    }

    function fmt(n, cur) {
        return cur + Math.abs(n).toLocaleString('en-US', {minimumFractionDigits:0,maximumFractionDigits:0});
    }

    function BEPPreview(props) {
        var a = props.attributes;
        var accent    = a.accentColor || '#6c3fb5';
        var profitClr = a.profitColor || '#10b981';
        var lossClr   = a.lossColor   || '#ef4444';
        var cur       = a.currency    || '$';

        var _fixed    = useState(a.defaultFixedCosts   || 10000); var fixed    = _fixed[0];    var setFixed    = _fixed[1];
        var _price    = useState(a.defaultPricePerUnit || 50);    var price    = _price[0];    var setPrice    = _price[1];
        var _varCost  = useState(a.defaultVarCostUnit  || 20);    var varCost  = _varCost[0];  var setVarCost  = _varCost[1];
        var _units    = useState(a.defaultUnitsToSell  || 500);   var units    = _units[0];    var setUnits    = _units[1];

        var r = calcBEP(parseFloat(fixed)||0, parseFloat(price)||0, parseFloat(varCost)||0, parseFloat(units)||0);
        var profitable = r.profitAtUnits >= 0;
        var progress   = r.bepUnits > 0 && isFinite(r.bepUnits)
            ? Math.min(100, (parseFloat(units)/r.bepUnits)*100) : 0;

        var inputStyle = {padding:'9px 12px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'14px',fontFamily:'inherit',outline:'none',width:'100%',background:'#fff'};
        var lblStyle   = {display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.05em'};
        var statStyle  = {background:a.statBg||'#f3f4f6',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 12px',textAlign:'center',flex:1};

        function CurrencyInput(lbl, val, setter) {
            return el('div', null,
                el('label', {style:lblStyle}, lbl),
                el('div', {style:{position:'relative'}},
                    el('span', {style:{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',fontSize:'14px',color:'#6b7280',pointerEvents:'none'}}, cur),
                    el('input', {type:'number',value:val,min:0,style:{...inputStyle,paddingLeft:'26px'},onChange:function(e){setter(e.target.value);}})
                )
            );
        }

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||580)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'24px'}},
                    a.showTitle    && el('div',{className:'bkbg-bep-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-bep-subtitle',style:{color:a.subtitleColor}},a.subtitle)
                ),

                // Inputs grid
                el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}},
                    el(CurrencyInput,'Fixed Costs',         fixed, setFixed),
                    el('div',null, el('label',{style:lblStyle},'Units to Sell'),
                        el('input',{type:'number',value:units,min:0,style:inputStyle,onChange:function(e){setUnits(e.target.value);}}))
                ),
                el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'20px'}},
                    el(CurrencyInput,'Price per Unit',      price,   setPrice),
                    el(CurrencyInput,'Variable Cost / Unit',varCost, setVarCost)
                ),

                // BEP result card
                el('div',{style:{background:a.resultBg||accent,borderRadius:'12px',padding:'20px 24px',textAlign:'center',color:a.resultColor||'#fff',marginBottom:'18px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:600,opacity:.8,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'4px'}},'Break-Even Point'),
                    el('div',{style:{fontSize:(a.resultSize||46)+'px',fontWeight:800,lineHeight:1}},
                        isFinite(r.bepUnits) ? r.bepUnits.toLocaleString() + ' units' : '∞'),
                    el('div',{style:{fontSize:'15px',opacity:.85,marginTop:'6px'}},
                        isFinite(r.bepRevenue) ? 'Revenue needed: ' + fmt(r.bepRevenue, cur) : 'Check your inputs')
                ),

                // Progress toward BEP
                a.showProfitZone && isFinite(r.bepUnits) && el('div',{style:{marginBottom:'18px'}},
                    el('div',{style:{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'6px',fontWeight:600,color:a.labelColor||'#374151'}},
                        el('span',null,'0 units'),
                        el('span',{style:{color:profitable?profitClr:lossClr}},parseFloat(units).toLocaleString()+' units sold → '+(profitable?'PROFIT':'LOSS'))
                    ),
                    el('div',{style:{background:a.barBg||'#e5e7eb',borderRadius:'20px',height:'12px',overflow:'hidden',position:'relative'}},
                        el('div',{style:{width:progress+'%',height:'100%',background:profitable?profitClr:lossClr,borderRadius:'20px',transition:'width .4s ease'}}),
                        isFinite(r.bepUnits) && el('div',{style:{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',height:'100%',width:'2px',background:'rgba(0,0,0,.18)'}})
                    ),
                    el('div',{style:{textAlign:'center',marginTop:'5px',fontSize:'12px',color:'#6b7280'}},'↑ Break-even at '+r.bepUnits+' units')
                ),

                // Stat cards
                el('div',{style:{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom: (a.showContribution||a.showMarginRatio) ? '10px' : '0'}},
                    el('div',{style:statStyle},
                        el('div',{style:{fontSize:'20px',fontWeight:700,color:profitable?profitClr:lossClr}},
                            (r.profitAtUnits<0?'-':'')+fmt(r.profitAtUnits,cur)),
                        el('div',{style:{fontSize:'11px',color:'#6b7280',marginTop:'3px'}},
                            profitable?'Profit at '+units+' units':'Loss at '+units+' units')
                    ),
                    el('div',{style:statStyle},
                        el('div',{style:{fontSize:'20px',fontWeight:700,color:'#111827'}},fmt(r.revenue,cur)),
                        el('div',{style:{fontSize:'11px',color:'#6b7280',marginTop:'3px'}},'Total Revenue')
                    ),
                    el('div',{style:statStyle},
                        el('div',{style:{fontSize:'20px',fontWeight:700,color:'#111827'}},fmt(r.totalCosts,cur)),
                        el('div',{style:{fontSize:'11px',color:'#6b7280',marginTop:'3px'}},'Total Costs')
                    )
                ),

                (a.showContribution||a.showMarginRatio) && el('div',{style:{display:'flex',gap:'10px',flexWrap:'wrap'}},
                    a.showContribution && el('div',{style:statStyle},
                        el('div',{style:{fontSize:'20px',fontWeight:700,color:accent}},fmt(r.contribution,cur)),
                        el('div',{style:{fontSize:'11px',color:'#6b7280',marginTop:'3px'}},'Contribution Margin / Unit')
                    ),
                    a.showMarginRatio && el('div',{style:statStyle},
                        el('div',{style:{fontSize:'20px',fontWeight:700,color:accent}},r.marginRatio.toFixed(1)+'%'),
                        el('div',{style:{fontSize:'11px',color:'#6b7280',marginTop:'3px'}},'Contribution Margin Ratio')
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/break-even-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({}, _tv(a.typoTitle, '--bkbg-bep-title-'), _tv(a.typoSubtitle, '--bkbg-bep-sub-')) });
            var colorSettings = [
                {value:a.accentColor,  onChange:function(v){set({accentColor:v});},  label:'Accent Color'},
                {value:a.cardBg,       onChange:function(v){set({cardBg:v});},        label:'Card Background'},
                {value:a.resultBg,     onChange:function(v){set({resultBg:v});},      label:'Result Card Background'},
                {value:a.resultColor,  onChange:function(v){set({resultColor:v});},   label:'Result Card Text'},
                {value:a.profitColor,  onChange:function(v){set({profitColor:v});},   label:'Profit Color'},
                {value:a.lossColor,    onChange:function(v){set({lossColor:v});},     label:'Loss Color'},
                {value:a.barBg,        onChange:function(v){set({barBg:v});},         label:'Progress Bar Track'},
                {value:a.statBg,       onChange:function(v){set({statBg:v});},        label:'Stat Card Background'},
                {value:a.statBorder,   onChange:function(v){set({statBorder:v});},    label:'Stat Card Border'},
                {value:a.inputBorder,  onChange:function(v){set({inputBorder:v});},   label:'Input Border'},
                {value:a.labelColor,   onChange:function(v){set({labelColor:v});},    label:'Label Color'},
                {value:a.titleColor,   onChange:function(v){set({titleColor:v});},    label:'Title Color'},
                {value:a.subtitleColor,onChange:function(v){set({subtitleColor:v});}, label:'Subtitle Color'},
                {value:a.sectionBg,    onChange:function(v){set({sectionBg:v});},     label:'Section Background'}
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody,{title:'Header',initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,   onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle,onChange:function(v){set({subtitle:v});}})
                    ),
                    el(PanelBody,{title:'Calculator Defaults',initialOpen:true},
                        el(TextControl,{label:'Currency Symbol',    value:a.currency,           onChange:function(v){set({currency:v});}}),
                        el(TextControl,{label:'Default Fixed Costs',value:String(a.defaultFixedCosts),  type:'number',onChange:function(v){set({defaultFixedCosts:parseFloat(v)||0});}}),
                        el(TextControl,{label:'Default Price/Unit', value:String(a.defaultPricePerUnit), type:'number',onChange:function(v){set({defaultPricePerUnit:parseFloat(v)||0});}}),
                        el(TextControl,{label:'Default Var Cost/Unit',value:String(a.defaultVarCostUnit),type:'number',onChange:function(v){set({defaultVarCostUnit:parseFloat(v)||0});}}),
                        el(TextControl,{label:'Default Units to Sell',value:String(a.defaultUnitsToSell),type:'number',onChange:function(v){set({defaultUnitsToSell:parseFloat(v)||0});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Profit Zone Bar',     checked:a.showProfitZone,   onChange:function(v){set({showProfitZone:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Contribution Margin', checked:a.showContribution, onChange:function(v){set({showContribution:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Margin Ratio',        checked:a.showMarginRatio,  onChange:function(v){set({showMarginRatio:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { set({ typoSubtitle: v }); } }),
                        el(RangeControl,{label:'Result Font Size',   value:a.resultSize,  min:24,max:72,step:2,  onChange:function(v){set({resultSize:v});}})
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius', value:a.cardRadius,  min:0,max:40,step:1,   onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius, min:0,max:20,step:1,   onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',     value:a.maxWidth,    min:340,max:960,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)',   value:a.paddingTop,  min:0,max:160,step:4,  onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',value:a.paddingBottom,min:0,max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(BEPPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', {className:'bkbg-bep-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
