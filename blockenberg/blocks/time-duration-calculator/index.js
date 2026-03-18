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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    function pad2(n) { return String(Math.abs(Math.floor(n))).padStart(2,'0'); }
    function fmtHMS(totalSec) {
        var neg = totalSec < 0;
        var s = Math.abs(totalSec);
        var h = Math.floor(s/3600); s -= h*3600;
        var m = Math.floor(s/60);   s -= m*60;
        return (neg?'−':'')+pad2(h)+':'+pad2(m)+':'+pad2(s);
    }
    function calcTotal(h,m,s){ return (parseInt(h)||0)*3600+(parseInt(m)||0)*60+(parseInt(s)||0); }

    function TDCPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        var _op = useState(a.defaultOp||'add'); var op = _op[0]; var setOp = _op[1];
        var _h1 = useState(a.defaultH1||1); var h1=_h1[0]; var setH1=_h1[1];
        var _m1 = useState(a.defaultM1||30); var m1=_m1[0]; var setM1=_m1[1];
        var _s1 = useState(a.defaultS1||0); var s1=_s1[0]; var setS1=_s1[1];
        var _h2 = useState(a.defaultH2||0); var h2=_h2[0]; var setH2=_h2[1];
        var _m2 = useState(a.defaultM2||45); var m2=_m2[0]; var setM2=_m2[1];
        var _s2 = useState(a.defaultS2||0); var s2=_s2[0]; var setS2=_s2[1];

        var t1 = calcTotal(h1,m1,s1);
        var t2 = calcTotal(h2,m2,s2);
        var total = op === 'add' ? t1+t2 : t1-t2;
        var absTotal = Math.abs(total);
        var days  = Math.floor(absTotal/86400);
        var hours = Math.floor((absTotal%86400)/3600);
        var mins  = Math.floor((absTotal%3600)/60);
        var secs  = absTotal%60;

        var fnStat = function(val,label) { return el('div',{style:{background:a.statBg||'#f3f4f6',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'10px',padding:'12px',textAlign:'center',flex:1}},
            el('div',{style:{fontSize:'22px',fontWeight:800,color:a.statValue||'#111827'}},''+val),
            el('div',{style:{fontSize:'12px',color:a.statLabel||'#6b7280',marginTop:'3px'}},label)
        );};

        var inpStyle={padding:'8px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderRadius:(a.inputRadius||8)+'px',fontSize:'16px',fontFamily:'inherit',textAlign:'center',outline:'none',width:'100%'};
        var lblStyle={display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'4px',textAlign:'center'};

        function durationRow(hval,mval,sval,onH,onM,onS) {
            return el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr '+(a.showSeconds?'1fr':''),gap:'8px'}},
                el('div',null, el('label',{style:lblStyle},'Hours'),   el('input',{type:'number',value:hval,min:0,style:inpStyle,onChange:function(e){onH(parseInt(e.target.value)||0);}})),
                el('div',null, el('label',{style:lblStyle},'Minutes'),  el('input',{type:'number',value:mval,min:0,max:59,style:inpStyle,onChange:function(e){onM(parseInt(e.target.value)||0);}})),
                a.showSeconds && el('div',null, el('label',{style:lblStyle},'Seconds'),  el('input',{type:'number',value:sval,min:0,max:59,style:inpStyle,onChange:function(e){onS(parseInt(e.target.value)||0);}}))
            );
        }

        var opButton = function(val, icon, active) { return el('button',{onClick:function(){setOp(val);},style:{flex:1,padding:'9px',border:'none',cursor:'pointer',fontWeight:700,fontSize:'18px',fontFamily:'inherit',transition:'all .15s',background:active?(a.opActiveBg||accent):(a.opInactiveBg||'#f3f4f6'),color:active?(a.opActiveColor||'#fff'):(a.opInactiveColor||'#374151')}}, icon); };

        return el('div',{style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div',{style:{background:a.cardBg||'#fff',borderRadius:(a.cardRadius||16)+'px',padding:'32px',maxWidth:(a.maxWidth||560)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'22px'}},
                    a.showTitle    && el('div',{className:'bkbg-tdc-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-tdc-subtitle',style:{color:a.subtitleColor,opacity:.75}},a.subtitle)
                ),

                // Operation toggle
                el('div',{style:{display:'flex',borderRadius:'10px',overflow:'hidden',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),marginBottom:'20px'}},
                    opButton('add',  '+ Add Durations',      op==='add'),
                    opButton('sub', '− Subtract Durations', op==='sub')
                ),

                // Duration 1
                el('div',{style:{marginBottom:'12px',background:a.statBg||'#f8f7ff',borderRadius:'10px',padding:'14px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:700,color:a.labelColor||'#374151',marginBottom:'10px'}},'Duration A'),
                    durationRow(h1,m1,s1,setH1,setM1,setS1)
                ),

                // Operator symbol
                el('div',{style:{textAlign:'center',fontSize:'22px',fontWeight:800,color:accent,margin:'4px 0'}}, op==='add' ? '+' : '−'),

                // Duration 2
                el('div',{style:{marginBottom:'18px',background:a.statBg||'#f8f7ff',borderRadius:'10px',padding:'14px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:700,color:a.labelColor||'#374151',marginBottom:'10px'}},'Duration B'),
                    durationRow(h2,m2,s2,setH2,setM2,setS2)
                ),

                // Result card
                el('div',{style:{background:a.resultBg||accent,borderRadius:'12px',padding:'20px',textAlign:'center',color:a.resultColor||'#fff',marginBottom:'16px'}},
                    el('div',{style:{fontSize:'13px',opacity:.8,marginBottom:'6px',fontWeight:600}},op==='add'?'Total Duration':'Difference'),
                    el('div',{className:'bkbg-tdc-result-time',style:{letterSpacing:'.04em',lineHeight:1,fontFamily:'monospace'}},
                        fmtHMS(total))
                ),

                // Stat breakdown
                el('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
                    a.showDaysBreakdown && fnStat(days,'Days'),
                    fnStat(hours,'Hours'),
                    fnStat(mins,'Minutes'),
                    a.showSeconds && fnStat(secs,'Seconds'),
                    a.showTotalSec && fnStat(Math.abs(total).toLocaleString(),'Total Seconds')
                )
            )
        );
    }

    registerBlockType('blockenberg/time-duration-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktdc-tt-'), _tvf(a.resultTypo, '--bktdc-rt-'));
                return { style: tv };
            })());
            var colorSettings = [
                {value:a.accentColor,    onChange:function(v){set({accentColor:v});},    label:'Accent Color'},
                {value:a.cardBg,         onChange:function(v){set({cardBg:v});},          label:'Card Background'},
                {value:a.resultBg,       onChange:function(v){set({resultBg:v});},        label:'Result Card Background'},
                {value:a.resultColor,    onChange:function(v){set({resultColor:v});},     label:'Result Card Text'},
                {value:a.statBg,         onChange:function(v){set({statBg:v});},          label:'Stat Card Background'},
                {value:a.statBorder,     onChange:function(v){set({statBorder:v});},      label:'Stat Card Border'},
                {value:a.statValue,      onChange:function(v){set({statValue:v});},       label:'Stat Value Color'},
                {value:a.statLabel,      onChange:function(v){set({statLabel:v});},       label:'Stat Label Color'},
                {value:a.opActiveBg,     onChange:function(v){set({opActiveBg:v});},      label:'Active Op Background'},
                {value:a.opActiveColor,  onChange:function(v){set({opActiveColor:v});},   label:'Active Op Text'},
                {value:a.opInactiveBg,   onChange:function(v){set({opInactiveBg:v});},    label:'Inactive Op Background'},
                {value:a.opInactiveColor,onChange:function(v){set({opInactiveColor:v});}, label:'Inactive Op Text'},
                {value:a.inputBorder,    onChange:function(v){set({inputBorder:v});},     label:'Input Border'},
                {value:a.labelColor,     onChange:function(v){set({labelColor:v});},      label:'Label Color'},
                {value:a.titleColor,     onChange:function(v){set({titleColor:v});},      label:'Title Color'},
                {value:a.subtitleColor,  onChange:function(v){set({subtitleColor:v});},   label:'Subtitle Color'},
                {value:a.sectionBg,      onChange:function(v){set({sectionBg:v});},       label:'Section Background'}
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
                        el(SelectControl,{label:'Default Operation',value:a.defaultOp,options:[{label:'+ Add',value:'add'},{label:'− Subtract',value:'sub'}],onChange:function(v){set({defaultOp:v});}}),
                        el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}},
                            el(TextControl,{label:'Duration A – Hours',  value:String(a.defaultH1),type:'number',onChange:function(v){set({defaultH1:parseInt(v)||0});}}),
                            el(TextControl,{label:'Minutes', value:String(a.defaultM1),type:'number',onChange:function(v){set({defaultM1:parseInt(v)||0});}}),
                            el(TextControl,{label:'Seconds', value:String(a.defaultS1),type:'number',onChange:function(v){set({defaultS1:parseInt(v)||0});}})
                        ),
                        el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}},
                            el(TextControl,{label:'Duration B – Hours',  value:String(a.defaultH2),type:'number',onChange:function(v){set({defaultH2:parseInt(v)||0});}}),
                            el(TextControl,{label:'Minutes', value:String(a.defaultM2),type:'number',onChange:function(v){set({defaultM2:parseInt(v)||0});}}),
                            el(TextControl,{label:'Seconds', value:String(a.defaultS2),type:'number',onChange:function(v){set({defaultS2:parseInt(v)||0});}})
                        ),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Seconds Input',    checked:a.showSeconds,      onChange:function(v){set({showSeconds:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Total Seconds Stat',checked:a.showTotalSec,    onChange:function(v){set({showTotalSec:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Days Breakdown',   checked:a.showDaysBreakdown,onChange:function(v){set({showDaysBreakdown:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Result Typography', 'blockenberg'),
                            value: a.resultTypo || {},
                            onChange: function (v) { set({ resultTypo: v }); }
                        })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius, min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius,min:0,max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',    value:a.maxWidth,   min:300,max:900,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',       value:a.paddingTop, min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',    value:a.paddingBottom,min:0,max:160,step:4,onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(TDCPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            var bp = wp.blockEditor.useBlockProps.save((function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktdc-tt-'), _tvf(a.resultTypo, '--bktdc-rt-'));
                return { style: tv };
            })());
            return el('div', bp,
                el('div',{className:'bkbg-tdc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
