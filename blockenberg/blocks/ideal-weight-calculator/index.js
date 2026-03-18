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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    // All formulas take height in cm, return kg
    function hamwi(heightCm, gender) {
        var inches = (heightCm - 152.4) / 2.54;
        var base = gender === 'male' ? 48 : 45.4;
        var per  = gender === 'male' ? 2.7 : 2.25;
        return base + per * Math.max(inches, 0);
    }
    function devine(heightCm, gender) {
        var inches = (heightCm - 152.4) / 2.54;
        var base = gender === 'male' ? 50 : 45.5;
        return base + 2.3 * Math.max(inches, 0);
    }
    function robinson(heightCm, gender) {
        var inches = (heightCm - 152.4) / 2.54;
        var base = gender === 'male' ? 52 : 49;
        var per  = gender === 'male' ? 1.9 : 1.7;
        return base + per * Math.max(inches, 0);
    }
    function miller(heightCm, gender) {
        var inches = (heightCm - 152.4) / 2.54;
        var base = gender === 'male' ? 56.2 : 53.1;
        var per  = gender === 'male' ? 1.41 : 1.36;
        return base + per * Math.max(inches, 0);
    }
    // Healthy BMI range 18.5–24.9
    function bmiRange(heightCm) {
        var hm = heightCm/100;
        return {low: 18.5*hm*hm, high: 24.9*hm*hm};
    }

    function IWCPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        var _unit   = useState(a.defaultUnit   || 'metric');
        var _gender = useState(a.defaultGender || 'male');
        var _heightCm = useState(a.defaultHeight || 170);
        var _ft = useState(5); var _in = useState(7);

        var unit     = _unit[0];     var setUnit    = _unit[1];
        var gender   = _gender[0];   var setGender  = _gender[1];
        var heightCm = _heightCm[0]; var setHeightCm = _heightCm[1];
        var ft       = _ft[0];       var setFt      = _ft[1];
        var inches   = _in[0];       var setIn      = _in[1];

        var hcm = unit==='metric' ? heightCm : Math.round((ft*12+inches)*2.54);

        var formulas = [
            {key:'hamwi',    label:'Hamwi',    color:a.hamwiColor   ||'#8b5cf6', kg:hamwi(hcm,gender)},
            {key:'devine',   label:'Devine',   color:a.devineColor  ||'#3b82f6', kg:devine(hcm,gender)},
            {key:'robinson', label:'Robinson', color:a.robinsonColor||'#10b981', kg:robinson(hcm,gender)},
            {key:'miller',   label:'Miller',   color:a.millerColor  ||'#f59e0b', kg:miller(hcm,gender)}
        ];
        var avg = formulas.reduce(function(s,f){return s+f.kg;},0)/formulas.length;
        var bmi = bmiRange(hcm);

        function toLbs(kg) { return kg * 2.2046; }
        function fmtW(kg) { return unit==='metric' ? kg.toFixed(1)+' kg' : toLbs(kg).toFixed(1)+' lbs'; }

        var minW = Math.min.apply(null,formulas.map(function(f){return f.kg;}))-3;
        var maxW = Math.max.apply(null,formulas.map(function(f){return f.kg;}))+3;
        var barW = function(kg){ return Math.max(5,Math.min(100,((kg-minW)/(maxW-minW))*100)); };

        var lblStyle = {fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',display:'block',marginBottom:'4px'};
        var inpStyle = {padding:'8px 12px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderRadius:(a.inputRadius||8)+'px',fontSize:'16px',fontFamily:'inherit',outline:'none',width:'100%',boxSizing:'border-box'};

        return el('div',{style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div',{style:{background:a.cardBg||'#fff',borderRadius:(a.cardRadius||16)+'px',padding:'28px',maxWidth:(a.maxWidth||600)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'20px'}},
                    a.showTitle    && el('div',{className:'bkbg-iwc-title',style:{color:a.titleColor}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-iwc-subtitle',style:{color:a.subtitleColor}},a.subtitle)
                ),

                // Unit + Gender toggles
                el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}},
                    el('div',null,
                        el('label',{style:lblStyle},'Unit System'),
                        el('div',{style:{display:'flex',gap:'4px',background:'#f3f4f6',borderRadius:'8px',padding:'3px'}},
                            ['metric','imperial'].map(function(u){
                                var active=unit===u;
                                return el('button',{key:u,onClick:function(){setUnit(u);},style:{flex:1,padding:'7px',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:active?700:500,fontSize:'13px',fontFamily:'inherit',background:active?accent:'transparent',color:active?'#fff':'#6b7280',transition:'all .2s'}},u==='metric'?'Metric':'Imperial');
                            })
                        )
                    ),
                    el('div',null,
                        el('label',{style:lblStyle},'Biological Sex'),
                        el('div',{style:{display:'flex',gap:'4px',background:'#f3f4f6',borderRadius:'8px',padding:'3px'}},
                            [{id:'male',label:'♂ Male',color:a.maleColor||'#3b82f6'},{id:'female',label:'♀ Female',color:a.femaleColor||'#ec4899'}].map(function(g){
                                var active=gender===g.id;
                                return el('button',{key:g.id,onClick:function(){setGender(g.id);},style:{flex:1,padding:'7px',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:active?700:500,fontSize:'13px',fontFamily:'inherit',background:active?g.color:'transparent',color:active?'#fff':'#6b7280',transition:'all .2s'}},g.label);
                            })
                        )
                    )
                ),

                // Height input
                el('div',{style:{marginBottom:'20px'}},
                    el('label',{style:lblStyle},'Height'),
                    unit==='metric'
                        ? el('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
                            el('input',{type:'range',min:140,max:220,value:heightCm,onChange:function(e){setHeightCm(parseInt(e.target.value));},style:{flex:1,accentColor:accent}}),
                            el('span',{style:{fontSize:'18px',fontWeight:700,color:accent,minWidth:'60px'}},heightCm+' cm')
                          )
                        : el('div',{style:{display:'flex',gap:'12px'}},
                            el('div',{style:{flex:1}},
                                el('label',{style:lblStyle},'Feet'),
                                el('input',{type:'number',value:ft,min:4,max:7,style:inpStyle,onChange:function(e){setFt(parseInt(e.target.value)||5);}})
                            ),
                            el('div',{style:{flex:1}},
                                el('label',{style:lblStyle},'Inches'),
                                el('input',{type:'number',value:inches,min:0,max:11,style:inpStyle,onChange:function(e){setIn(parseInt(e.target.value)||0);}})
                            )
                          )
                ),

                // Average result
                el('div',{style:{background:a.resultBg||'#f5f3ff',border:'1px solid '+(a.resultBorder||'#ede9fe'),borderRadius:'12px',padding:'20px',textAlign:'center',marginBottom:'16px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:700,color:accent,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'6px'}},'Average Ideal Weight'),
                    el('div',{style:{fontSize:(a.resultSize||52)+'px',fontWeight:800,color:accent,lineHeight:1}},fmtW(avg)),
                    el('div',{style:{fontSize:'14px',color:'#6b7280',marginTop:'6px'}},'Average of 4 medical formulas')
                ),

                // Chart
                a.showChart && el('div',{style:{marginBottom:'16px'}},
                    formulas.map(function(f){
                        return el('div',{key:f.key,style:{marginBottom:'10px'}},
                            el('div',{style:{display:'flex',justifyContent:'space-between',fontSize:'13px',fontWeight:600,color:f.color,marginBottom:'3px'}},
                                el('span',null,f.label),
                                el('span',null,fmtW(f.kg))
                            ),
                            el('div',{style:{height:'10px',background:'#f3f4f6',borderRadius:'5px',overflow:'hidden'}},
                                el('div',{style:{height:'100%',width:barW(f.kg)+'%',background:f.color,borderRadius:'5px',transition:'width .4s'}})
                            )
                        );
                    })
                ),

                // Formulas detail
                a.showFormulas && el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}},
                    formulas.map(function(f){
                        return el('div',{key:f.key,style:{background:f.color+'12',border:'2px solid '+f.color+'44',borderRadius:'10px',padding:'12px',textAlign:'center'}},
                            el('div',{style:{fontWeight:800,fontSize:'14px',color:f.color}},(f.label)),
                            el('div',{style:{fontSize:'20px',fontWeight:800,color:'#1f2937',margin:'4px 0'}},fmtW(f.kg)),
                            el('div',{style:{fontSize:'12px',color:'#6b7280'}},(unit==='metric'?toLbs(f.kg).toFixed(1)+' lbs':f.kg.toFixed(1)+' kg'))
                        );
                    })
                ),

                // BMI healthy range
                a.showBMIRange && el('div',{style:{background:(a.bmiRangeColor||'#22c55e')+'14',border:'1.5px solid '+(a.bmiRangeColor||'#22c55e')+'55',borderRadius:'10px',padding:'14px 16px'}},
                    el('div',{style:{fontWeight:700,fontSize:'13px',color:a.bmiRangeColor||'#22c55e',marginBottom:'4px'}},'✓ Healthy BMI Range (18.5–24.9)'),
                    el('div',{style:{fontSize:'15px',fontWeight:800,color:'#1f2937'}},fmtW(bmi.low)+' – '+fmtW(bmi.high)),
                    el('div',{style:{fontSize:'12px',color:'#6b7280',marginTop:'2px'}},'Based on your height of '+(unit==='metric'?(hcm+' cm'):((ft)+"' "+(inches)+'"')))
                )
            )
        );
    }

    registerBlockType('blockenberg/ideal-weight-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var _tv2 = getTypoCssVars();
            var wrapStyle = {};
            if (a.titleSize) wrapStyle['--bkbg-iwc-title-sz'] = a.titleSize + 'px';
            if (_tv2) {
                Object.assign(wrapStyle, _tv2(a.titleTypo, '--bkbg-iwc-tt-'));
                Object.assign(wrapStyle, _tv2(a.subtitleTypo, '--bkbg-iwc-st-'));
            }
            var blockProps = useBlockProps({ style: wrapStyle });
            var colorSettings = [
                {value:a.accentColor,    onChange:function(v){set({accentColor:v});},    label:'Accent Color'},
                {value:a.cardBg,         onChange:function(v){set({cardBg:v});},          label:'Card Background'},
                {value:a.resultBg,       onChange:function(v){set({resultBg:v});},        label:'Result Background'},
                {value:a.resultBorder,   onChange:function(v){set({resultBorder:v});},    label:'Result Border'},
                {value:a.hamwiColor,     onChange:function(v){set({hamwiColor:v});},      label:'Hamwi Formula Color'},
                {value:a.devineColor,    onChange:function(v){set({devineColor:v});},     label:'Devine Formula Color'},
                {value:a.robinsonColor,  onChange:function(v){set({robinsonColor:v});},   label:'Robinson Formula Color'},
                {value:a.millerColor,    onChange:function(v){set({millerColor:v});},     label:'Miller Formula Color'},
                {value:a.bmiRangeColor,  onChange:function(v){set({bmiRangeColor:v});},  label:'BMI Range Color'},
                {value:a.maleColor,      onChange:function(v){set({maleColor:v});},       label:'Male Button Color'},
                {value:a.femaleColor,    onChange:function(v){set({femaleColor:v});},     label:'Female Button Color'},
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
                        el(SelectControl,{label:'Default Unit',value:a.defaultUnit,options:[{label:'Metric (cm/kg)',value:'metric'},{label:'Imperial (ft/lbs)',value:'imperial'}],onChange:function(v){set({defaultUnit:v});}}),
                        el(SelectControl,{label:'Default Gender',value:a.defaultGender,options:[{label:'Male',value:'male'},{label:'Female',value:'female'}],onChange:function(v){set({defaultGender:v});}}),
                        el(RangeControl,{label:'Default Height (cm)',value:a.defaultHeight,min:140,max:220,step:1,onChange:function(v){set({defaultHeight:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Formula Details',checked:a.showFormulas,onChange:function(v){set({showFormulas:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Bar Chart',       checked:a.showChart,    onChange:function(v){set({showChart:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show BMI Range',       checked:a.showBMIRange, onChange:function(v){set({showBMIRange:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypographyControl() && el( getTypographyControl(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function(v){ set({ titleTypo: v }); } }),
                        getTypographyControl() && el( getTypographyControl(), { label: __( 'Subtitle', 'blockenberg' ), value: a.subtitleTypo || {}, onChange: function(v){ set({ subtitleTypo: v }); } }),
                        el(RangeControl,{label:'Result Number Size',  value:a.resultSize,  min:24,max:80,step:2,  onChange:function(v){set({resultSize:v});}})
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',  value:a.cardRadius,  min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius', value:a.inputRadius, min:0, max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',      value:a.maxWidth,    min:320,max:900,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',         value:a.paddingTop,  min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',      value:a.paddingBottom,min:0,max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div',blockProps, el(IWCPreview,{attributes:a}))
            );
        },
        save: function(props){
            var a = props.attributes;
            return el('div',wp.blockEditor.useBlockProps.save(),
                el('div',{className:'bkbg-iwc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
