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
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function calcROI(investment, returned, years) {
        var netProfit   = returned - investment;
        var roi         = investment > 0 ? (netProfit / investment) * 100 : 0;
        var annualized  = investment > 0 && years > 0
            ? (Math.pow(returned / investment, 1 / years) - 1) * 100
            : 0;
        var payback     = netProfit > 0 && investment > 0
            ? investment / (netProfit / years)
            : null;
        return { netProfit: netProfit, roi: roi, annualized: annualized, payback: payback };
    }

    function fmt(n, cur) {
        return cur + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    function fmtPct(n) {
        return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
    }

    function ROIPreview(props) {
        var a = props.attributes;
        var accent  = a.accentColor   || '#6c3fb5';
        var cur     = a.currency      || '$';
        var posClr  = a.positiveColor || '#10b981';
        var negClr  = a.negativeColor || '#ef4444';

        var _inv  = useState(a.defaultInvestment || 10000); var inv  = _inv[0];  var setInv  = _inv[1];
        var _ret  = useState(a.defaultReturn     || 15000); var ret  = _ret[0];  var setRet  = _ret[1];
        var _yrs  = useState(a.defaultYears      || 3);     var yrs  = _yrs[0];  var setYrs  = _yrs[1];

        var r = calcROI(parseFloat(inv)||0, parseFloat(ret)||0, parseFloat(yrs)||1);
        var positive = r.netProfit >= 0;
        var resultBg = positive ? (a.resultBg || accent) : negClr;

        var inputStyle = {
            padding:'10px 12px', borderRadius:(a.inputRadius||8)+'px',
            border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),
            fontSize:'15px', fontFamily:'inherit', outline:'none', width:'100%'
        };
        var lblStyle = { display:'block', fontSize:'12px', fontWeight:600, color:a.labelColor||'#374151', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.05em' };
        var statStyle = {
            background:a.statBg||'#f3f4f6', border:'1px solid '+(a.statBorder||'#e5e7eb'),
            borderRadius:'10px', padding:'14px 12px', textAlign:'center', flex:'1'
        };

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||560)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},
                (a.showTitle||a.showSubtitle) && el('div', {style:{marginBottom:'24px'}},
                    a.showTitle    && el('div', {className:'bkbg-roi-title',style:{color:a.titleColor}}, a.title),
                    a.showSubtitle && el('div', {className:'bkbg-roi-subtitle',style:{color:a.subtitleColor}}, a.subtitle)
                ),

                // Inputs
                el('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}},
                    el('div', null,
                        el('label', {style:lblStyle}, 'Initial Investment'),
                        el('div', {style:{position:'relative'}},
                            el('span', {style:{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',fontSize:'15px',color:'#6b7280',pointerEvents:'none'}}, cur),
                            el('input', {type:'number',value:inv,min:0,style:{...inputStyle,paddingLeft:'26px'},onChange:function(e){setInv(e.target.value);}})
                        )
                    ),
                    el('div', null,
                        el('label', {style:lblStyle}, 'Total Return'),
                        el('div', {style:{position:'relative'}},
                            el('span', {style:{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',fontSize:'15px',color:'#6b7280',pointerEvents:'none'}}, cur),
                            el('input', {type:'number',value:ret,min:0,style:{...inputStyle,paddingLeft:'26px'},onChange:function(e){setRet(e.target.value);}})
                        )
                    )
                ),
                el('div', {style:{marginBottom:'20px'}},
                    el('label', {style:lblStyle}, 'Investment Period (Years)'),
                    el('input', {type:'number',value:yrs,min:0.1,step:0.5,style:inputStyle,onChange:function(e){setYrs(e.target.value);}})
                ),

                // ROI result card
                el('div', {style:{background:resultBg,borderRadius:'12px',padding:'22px 24px',marginBottom:'18px',textAlign:'center',color:a.resultColor||'#fff'}},
                    el('div', {style:{fontSize:'13px',fontWeight:600,opacity:.8,marginBottom:'4px',textTransform:'uppercase',letterSpacing:'.06em'}}, 'Return on Investment'),
                    el('div', {style:{fontSize:(a.resultSize||48)+'px',fontWeight:800,lineHeight:1}}, fmtPct(r.roi)),
                    el('div', {style:{fontSize:'15px',opacity:.85,marginTop:'6px'}}, 'Net Profit: '+fmt(r.netProfit,cur))
                ),

                // Stat cards
                a.showBreakdown && el('div', {style:{display:'flex',gap:'10px',marginBottom:'14px',flexWrap:'wrap'}},
                    el('div', {style:statStyle},
                        el('div', {style:{fontSize:'22px',fontWeight:700,color:a.statValueColor||'#111827'}}, fmt(parseFloat(inv)||0,cur)),
                        el('div', {style:{fontSize:'11px',color:a.statLabelColor||'#6b7280',marginTop:'3px'}}, 'Invested')
                    ),
                    el('div', {style:statStyle},
                        el('div', {style:{fontSize:'22px',fontWeight:700,color:positive?posClr:negClr}}, fmt(r.netProfit,cur)),
                        el('div', {style:{fontSize:'11px',color:a.statLabelColor||'#6b7280',marginTop:'3px'}}, 'Net Profit')
                    ),
                    el('div', {style:statStyle},
                        el('div', {style:{fontSize:'22px',fontWeight:700,color:a.statValueColor||'#111827'}}, fmt(parseFloat(ret)||0,cur)),
                        el('div', {style:{fontSize:'11px',color:a.statLabelColor||'#6b7280',marginTop:'3px'}}, 'Total Return')
                    )
                ),

                el('div', {style:{display:'flex',gap:'10px',flexWrap:'wrap'}},
                    a.showAnnualized && el('div', {style:{...statStyle,flex:'1'}},
                        el('div', {style:{fontSize:'22px',fontWeight:700,color:positive?posClr:negClr}}, fmtPct(r.annualized)),
                        el('div', {style:{fontSize:'11px',color:a.statLabelColor||'#6b7280',marginTop:'3px'}}, 'Annualized ROI')
                    ),
                    a.showPayback && el('div', {style:{...statStyle,flex:'1'}},
                        el('div', {style:{fontSize:'22px',fontWeight:700,color:a.statValueColor||'#111827'}},
                            r.payback != null ? r.payback.toFixed(1)+' yr' : '—'),
                        el('div', {style:{fontSize:'11px',color:a.statLabelColor||'#6b7280',marginTop:'3px'}}, 'Payback Period')
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/roi-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo, '--bkroi-tt-'));
                    Object.assign(s, _tv(a.subtitleTypo, '--bkroi-st-'));
                }
                return { className: 'bkbg-roi-wrap', style: s };
            })());
            var colorSettings = [
                {value:a.accentColor,   onChange:function(v){set({accentColor:v});},   label:'Accent Color'},
                {value:a.cardBg,        onChange:function(v){set({cardBg:v});},         label:'Card Background'},
                {value:a.resultBg,      onChange:function(v){set({resultBg:v});},       label:'Result Card Background'},
                {value:a.resultColor,   onChange:function(v){set({resultColor:v});},    label:'Result Card Text'},
                {value:a.positiveColor, onChange:function(v){set({positiveColor:v});},  label:'Positive / Profit Color'},
                {value:a.negativeColor, onChange:function(v){set({negativeColor:v});},  label:'Negative / Loss Color'},
                {value:a.statBg,        onChange:function(v){set({statBg:v});},         label:'Stat Card Background'},
                {value:a.statBorder,    onChange:function(v){set({statBorder:v});},     label:'Stat Card Border'},
                {value:a.statValueColor,onChange:function(v){set({statValueColor:v});}, label:'Stat Value Color'},
                {value:a.statLabelColor,onChange:function(v){set({statLabelColor:v});}, label:'Stat Label Color'},
                {value:a.inputBorder,   onChange:function(v){set({inputBorder:v});},    label:'Input Border'},
                {value:a.labelColor,    onChange:function(v){set({labelColor:v});},     label:'Label Color'},
                {value:a.titleColor,    onChange:function(v){set({titleColor:v});},     label:'Title Color'},
                {value:a.subtitleColor, onChange:function(v){set({subtitleColor:v});},  label:'Subtitle Color'},
                {value:a.sectionBg,     onChange:function(v){set({sectionBg:v});},      label:'Section Background'}
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
                        el(TextControl,{label:'Currency Symbol',value:a.currency,onChange:function(v){set({currency:v});}}),
                        el(TextControl,{label:'Default Investment',value:String(a.defaultInvestment),type:'number',onChange:function(v){set({defaultInvestment:parseFloat(v)||0});}}),
                        el(TextControl,{label:'Default Total Return',value:String(a.defaultReturn),type:'number',onChange:function(v){set({defaultReturn:parseFloat(v)||0});}}),
                        el(TextControl,{label:'Default Years',value:String(a.defaultYears),type:'number',onChange:function(v){set({defaultYears:parseFloat(v)||1});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Payback Period',    checked:a.showPayback,    onChange:function(v){set({showPayback:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Annualized Return', checked:a.showAnnualized, onChange:function(v){set({showAnnualized:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Breakdown Cards',  checked:a.showBreakdown,  onChange:function(v){set({showBreakdown:v});}})
                    ),
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Subtitle Typography', 'blockenberg'),
                            value: a.subtitleTypo || {},
                            onChange: function (v) { set({ subtitleTypo: v }); }
                        }),
                        el(RangeControl, { label: 'ROI Result Size', value: a.resultSize, min: 24, max: 80, step: 2, onChange: function (v) { set({ resultSize: v }); } })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius, min:0,max:40,step:1,   onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius,min:0,max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',   value:a.maxWidth,    min:340,max:960,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)', value:a.paddingTop,  min:0,max:160,step:4,  onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',value:a.paddingBottom,min:0,max:160,step:4,onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(ROIPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', {className:'bkbg-roi-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
