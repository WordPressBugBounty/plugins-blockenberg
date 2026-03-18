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

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo',    attrs, '--bkwic-tt-');
        _tvf(v, 'subtitleTypo', attrs, '--bkwic-st-');
        return v;
    }

    var ACTIVITY_OPTIONS = [
        { label: 'Sedentary (little or no exercise)',   value: 'sedentary' },
        { label: 'Light (light exercise 1-3 days/wk)',  value: 'light' },
        { label: 'Moderate (exercise 3-5 days/wk)',     value: 'moderate' },
        { label: 'Active (hard exercise 6-7 days/wk)',  value: 'active' },
        { label: 'Very Active (athlete / physical job)', value: 'very_active' }
    ];
    var CLIMATE_OPTIONS = [
        { label: 'Temperate (cool/mild climate)',    value: 'temperate' },
        { label: 'Hot / Humid Climate',              value: 'hot' },
        { label: 'Cold / Dry Climate',               value: 'cold' }
    ];

    var ACTIVITY_FACTOR = { sedentary:30, light:33, moderate:35, active:38, very_active:42 };
    var CLIMATE_FACTOR  = { temperate:0, hot:500, cold:-200 };

    function calcWater(weightKg, activity, climate) {
        var base = weightKg * (ACTIVITY_FACTOR[activity] || 35); // ml
        base += (CLIMATE_FACTOR[climate] || 0);
        return Math.max(500, base);
    }

    function tips(activity, climate) {
        var list = ['Drink a glass of water first thing in the morning.', 'Carry a reusable water bottle throughout the day.'];
        if (activity === 'active' || activity === 'very_active') list.push('Drink 500 ml extra for every hour of intense exercise.');
        if (climate === 'hot') list.push('Hot climates increase sweat loss — drink more frequently.');
        if (climate === 'cold') list.push('Cold weather can reduce thirst sensation — stay mindful of drinking.');
        list.push('Herbal teas and water-rich foods count toward your daily intake.');
        return list;
    }

    function WaterPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#3b82f6';

        var _unit   = useState(a.defaultUnit     || 'kg');      var unit = _unit[0];   var setUnit = _unit[1];
        var _wt     = useState(String(a.defaultWeight || 70));  var wt = _wt[0];       var setWt   = _wt[1];
        var _act    = useState(a.defaultActivity  || 'moderate');var act = _act[0];    var setAct  = _act[1];
        var _cli    = useState(a.defaultClimate   || 'temperate');var cli=_cli[0];     var setCli  = _cli[1];

        var weightNum = parseFloat(wt) || 70;
        var weightKg  = unit === 'lbs' ? weightNum * 0.453592 : weightNum;
        var mlTotal   = calcWater(weightKg, act, cli);
        var liters    = (mlTotal / 1000).toFixed(1);
        var oz        = Math.round(mlTotal / 29.574);
        var glasses   = Math.round(mlTotal / (a.glassSize || 250));
        var tipList   = tips(act, cli);

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||500)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div', {style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', {className:'bkbg-wic-title',style:{color:a.titleColor}}, a.title),
                    a.showSubtitle && el('div', {className:'bkbg-wic-subtitle',style:{color:a.subtitleColor}}, a.subtitle)
                ),

                // Weight + unit toggle
                el('div', {style:{marginBottom:'14px'}},
                    el('label', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'6px'}},
                        el('span', null, 'Body Weight'),
                        el('span', {style:{display:'flex',gap:'4px'}},
                            ['kg','lbs'].map(function(u) {
                                var active = unit === u;
                                return el('button', {key:u, onClick:function(){setUnit(u);},
                                    style:{padding:'3px 10px',borderRadius:'6px',border:'none',fontSize:'12px',fontWeight:600,cursor:'pointer',
                                        background:active?accent:'#e5e7eb',color:active?'#fff':'#374151',fontFamily:'inherit'}}, u);
                            })
                        )
                    ),
                    el('input', {type:'number',value:wt,min:'1',
                        style:{width:'100%',padding:'11px 14px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'16px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'},
                        onChange:function(e){setWt(e.target.value);}})
                ),

                el('div', {style:{marginBottom:'14px'}},
                    el('label', {style:{display:'block',fontSize:'13px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'6px'}}, 'Activity Level'),
                    el('select', {value:act, onChange:function(e){setAct(e.target.value);},
                        style:{width:'100%',padding:'11px 14px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'15px',fontFamily:'inherit',outline:'none',background:'#fff',cursor:'pointer'}},
                        ACTIVITY_OPTIONS.map(function(o){return el('option',{key:o.value,value:o.value},o.label);}))
                ),

                el('div', {style:{marginBottom:'20px'}},
                    el('label', {style:{display:'block',fontSize:'13px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'6px'}}, 'Climate'),
                    el('select', {value:cli, onChange:function(e){setCli(e.target.value);},
                        style:{width:'100%',padding:'11px 14px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'15px',fontFamily:'inherit',outline:'none',background:'#fff',cursor:'pointer'}},
                        CLIMATE_OPTIONS.map(function(o){return el('option',{key:o.value,value:o.value},o.label);}))
                ),

                // Result
                el('div', {style:{background:a.resultBg||accent,borderRadius:(a.inputRadius||8)+'px',padding:'24px',textAlign:'center',marginBottom:'16px'}},
                    el('div', {style:{fontSize:'13px',fontWeight:600,color:a.resultColor||'#fff',opacity:.8,marginBottom:'4px'}}, 'Daily Water Recommendation'),
                    el('div', {style:{fontSize:(a.resultSize||56)+'px',fontWeight:800,color:a.resultColor||'#fff',lineHeight:1,marginBottom:'4px'}}, liters + ' L'),
                    el('div', {style:{fontSize:'16px',color:a.resultColor||'#fff',opacity:.85}}, oz + ' fl oz · ' + Math.round(mlTotal) + ' ml')
                ),

                // Glasses
                a.showGlasses && el('div', {style:{background:a.glassBg||'#eff6ff',borderRadius:(a.inputRadius||8)+'px',padding:'16px 20px',marginBottom:'16px',textAlign:'center'}},
                    el('div', {style:{fontSize:'13px',fontWeight:600,color:a.glassColor||accent,marginBottom:'8px'}}, '= ' + glasses + ' glasses of ' + (a.glassSize||250) + ' ml'),
                    el('div', {style:{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'6px'}},
                        Array.from({length:Math.min(glasses,16)}).map(function(_,i){
                            return el('span', {key:i, style:{fontSize:'22px',lineHeight:1}}, '💧');
                        }),
                        glasses > 16 && el('span', {style:{fontSize:'13px',color:a.glassColor||accent,alignSelf:'center'}}, '+' + (glasses-16) + ' more')
                    )
                ),

                // Tips
                a.showTips && el('div', {style:{background:a.tipsBg||'#f0fdf4',border:'1.5px solid '+(a.tipsBorder||'#bbf7d0'),borderRadius:(a.inputRadius||8)+'px',padding:'16px 20px'}},
                    el('div', {style:{fontWeight:700,fontSize:'13px',color:a.tipsColor||'#166534',marginBottom:'10px'}}, '💡 Hydration Tips'),
                    el('ul', {style:{margin:0,paddingLeft:'18px',display:'flex',flexDirection:'column',gap:'5px'}},
                        tipList.map(function(t,i){
                            return el('li', {key:i, style:{fontSize:'13px',color:a.tipsColor||'#166534',lineHeight:1.5}}, t);
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/water-intake-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps();
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){set({accentColor:v});},    label: 'Accent Color' },
                { value: a.cardBg,         onChange: function(v){set({cardBg:v});},          label: 'Card Background' },
                { value: a.resultBg,       onChange: function(v){set({resultBg:v});},        label: 'Result Background' },
                { value: a.resultColor,    onChange: function(v){set({resultColor:v});},     label: 'Result Text' },
                { value: a.glassColor,     onChange: function(v){set({glassColor:v});},      label: 'Glass Icon Color' },
                { value: a.glassBg,        onChange: function(v){set({glassBg:v});},         label: 'Glasses Section Background' },
                { value: a.tipsBg,         onChange: function(v){set({tipsBg:v});},          label: 'Tips Background' },
                { value: a.tipsBorder,     onChange: function(v){set({tipsBorder:v});},      label: 'Tips Border' },
                { value: a.tipsColor,      onChange: function(v){set({tipsColor:v});},       label: 'Tips Text Color' },
                { value: a.labelColor,     onChange: function(v){set({labelColor:v});},      label: 'Label Color' },
                { value: a.inputBorder,    onChange: function(v){set({inputBorder:v});},     label: 'Input Border' },
                { value: a.titleColor,     onChange: function(v){set({titleColor:v});},      label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v){set({subtitleColor:v});},   label: 'Subtitle Color' },
                { value: a.sectionBg,      onChange: function(v){set({sectionBg:v});},       label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Header', initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,   onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle,onChange:function(v){set({subtitle:v});}})
                    ),
                    el(PanelBody, {title:'Calculator Settings', initialOpen:true},
                        el(SelectControl,{label:'Default Weight Unit',   value:a.defaultUnit,     options:[{label:'Kilograms (kg)',value:'kg'},{label:'Pounds (lbs)',value:'lbs'}], onChange:function(v){set({defaultUnit:v});}}),
                        el(TextControl,  {label:'Default Weight',         value:String(a.defaultWeight),  onChange:function(v){set({defaultWeight:parseFloat(v)||70});}}),
                        el(SelectControl,{label:'Default Activity Level', value:a.defaultActivity, options:ACTIVITY_OPTIONS, onChange:function(v){set({defaultActivity:v});}}),
                        el(SelectControl,{label:'Default Climate',        value:a.defaultClimate,  options:CLIMATE_OPTIONS,  onChange:function(v){set({defaultClimate:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Glass Count',checked:a.showGlasses,onChange:function(v){set({showGlasses:v});}}),
                        a.showGlasses && el(RangeControl,{label:'Glass Size (ml)',value:a.glassSize,min:100,max:500,step:50,onChange:function(v){set({glassSize:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Hydration Tips',checked:a.showTips,onChange:function(v){set({showTips:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(RangeControl,{label:'Result Font Size',   value:a.resultSize,   min:24,max:96, step:2,  onChange:function(v){set({resultSize:v});}}),
                        getTypoControl( __( 'Title', 'blockenberg' ),    'titleTypo',    a, set ),
                        getTypoControl( __( 'Subtitle', 'blockenberg' ), 'subtitleTypo', a, set ),
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius', value:a.cardRadius,   min:0, max:40, step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius,  min:0, max:24, step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',     value:a.maxWidth,     min:300,max:900,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)',   value:a.paddingTop,   min:0, max:160,step:4,  onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',value:a.paddingBottom,min:0, max:160,step:4,  onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(WaterPreview, {attributes:a, setAttributes:set}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ style: getTypoCssVars(a) }), el('div', {className:'bkbg-wic-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
