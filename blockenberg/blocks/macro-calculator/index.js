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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var ACTIVITY_OPTS = [
        {label:'Sedentary (little/no exercise)',    value:'sedentary'},
        {label:'Light (1-3 days/week)',             value:'light'},
        {label:'Moderate (3-5 days/week)',          value:'moderate'},
        {label:'Active (6-7 days/week)',            value:'active'},
        {label:'Very Active (twice/day, athlete)',  value:'very_active'}
    ];
    var GOAL_OPTS = [
        {label:'Lose weight (fast – deficit 25%)',  value:'lose_fast'},
        {label:'Lose weight (slow – deficit 15%)',  value:'lose_slow'},
        {label:'Maintain weight',                   value:'maintain'},
        {label:'Gain muscle (slow – surplus 10%)',  value:'gain_slow'},
        {label:'Gain muscle (fast – surplus 20%)',  value:'gain_fast'}
    ];
    var ACTIVITY_MULT = {sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9};
    var GOAL_MULT     = {lose_fast:0.75, lose_slow:0.85, maintain:1, gain_slow:1.1, gain_fast:1.2};
    // Macro ratios per goal (protein%/carb%/fat%)
    var MACRO_RATIOS  = {
        lose_fast: [0.40, 0.30, 0.30],
        lose_slow: [0.35, 0.35, 0.30],
        maintain:  [0.30, 0.40, 0.30],
        gain_slow: [0.30, 0.45, 0.25],
        gain_fast: [0.30, 0.50, 0.20]
    };

    function calcMacros(gender, age, weightKg, heightCm, activity, goal) {
        // Mifflin-St Jeor BMR
        var bmr = gender === 'female'
            ? 10*weightKg + 6.25*heightCm - 5*age - 161
            : 10*weightKg + 6.25*heightCm - 5*age + 5;
        var tdee     = bmr * (ACTIVITY_MULT[activity] || 1.55);
        var calories = Math.round(tdee * (GOAL_MULT[goal] || 1));
        var ratio    = MACRO_RATIOS[goal] || MACRO_RATIOS['maintain'];
        var protein  = Math.round((calories * ratio[0]) / 4);
        var carbs    = Math.round((calories * ratio[1]) / 4);
        var fat      = Math.round((calories * ratio[2]) / 9);
        return {calories:calories, protein:protein, carbs:carbs, fat:fat, bmr:Math.round(bmr), tdee:Math.round(tdee)};
    }

    function MacroPreview(props) {
        var a = props.attributes;
        var accent   = a.accentColor  || '#6c3fb5';
        var protClr  = a.proteinColor || '#3b82f6';
        var carbClr  = a.carbColor    || '#f59e0b';
        var fatClr   = a.fatColor     || '#ef4444';

        var _unit    = useState(a.defaultUnit     || 'metric'); var unit    = _unit[0];    var setUnit    = _unit[1];
        var _gender  = useState(a.defaultGender   || 'male');   var gender  = _gender[0];  var setGender  = _gender[1];
        var _age     = useState(a.defaultAge      || 30);       var age     = _age[0];     var setAge     = _age[1];
        var _weight  = useState(a.defaultWeight   || 75);       var weight  = _weight[0];  var setWeight  = _weight[1];
        var _height  = useState(a.defaultHeight   || 175);      var height  = _height[0];  var setHeight  = _height[1];
        var _activity= useState(a.defaultActivity || 'moderate');var activity=_activity[0];var setActivity=_activity[1];
        var _goal    = useState(a.defaultGoal     || 'maintain');var goal    =_goal[0];     var setGoal    =_goal[1];

        var weightKg = unit==='imperial' ? weight*0.453592 : weight;
        var heightCm = unit==='imperial' ? height*2.54     : height;
        var r = calcMacros(gender, parseFloat(age)||25, weightKg, heightCm, activity, goal);

        var inputStyle = {padding:'9px 12px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'14px',fontFamily:'inherit',outline:'none',width:'100%',background:'#fff'};
        var lblStyle   = {display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.05em'};
        var statStyle  = {background:a.statBg||'#f3f4f6',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 12px',flex:'1',textAlign:'center'};

        // SVG donut (simple, 3 arcs)
        function DonutChart() {
            var total = r.protein*4 + r.carbs*4 + r.fat*9;
            function arc(pct, offset, color) {
                var c  = 2*Math.PI*40;
                var sd = c*(1-pct);
                return el('circle',{cx:50,cy:50,r:40,fill:'none',stroke:color,strokeWidth:18,
                    strokeDasharray:c,strokeDashoffset:sd,strokeLinecap:'butt',
                    transform:'rotate('+(offset*360-90)+' 50 50)'});
            }
            var p1 = total>0?(r.protein*4/total):0.33;
            var p2 = total>0?(r.carbs*4/total):0.34;
            var p3 = total>0?(r.fat*9/total):0.33;
            return el('svg',{viewBox:'0 0 100 100',style:{width:'120px',height:'120px'}},
                arc(p1, 0,       protClr),
                arc(p2, p1,      carbClr),
                arc(p3, p1+p2,   fatClr),
                el('text',{x:50,y:48,textAnchor:'middle',fontSize:'12',fill:'#374151',fontWeight:700},r.calories),
                el('text',{x:50,y:60,textAnchor:'middle',fontSize:'7',fill:'#6b7280'},'kcal/day')
            );
        }

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||580)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                    (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'22px'}},
                    a.showTitle    && el('div',{className:'bkbg-mcr-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-mcr-subtitle',style:{color:a.subtitleColor}},a.subtitle)
                ),

                // Unit + gender toggles
                el('div',{style:{display:'flex',gap:'10px',marginBottom:'16px'}},
                    el('div',{style:{flex:1}},
                        el('label',{style:lblStyle},'Unit'),
                        el('div',{style:{display:'flex',borderRadius:'8px',overflow:'hidden',border:'1.5px solid '+(a.inputBorder||'#e5e7eb')}},
                            ['metric','imperial'].map(function(u){ return el('button',{key:u,onClick:function(){setUnit(u);},
                                style:{flex:1,padding:'8px',border:'none',background:unit===u?accent:'#fff',color:unit===u?'#fff':'#374151',fontWeight:600,fontSize:'13px',fontFamily:'inherit',cursor:'pointer'}},
                                u.charAt(0).toUpperCase()+u.slice(1)); })
                        )
                    ),
                    el('div',{style:{flex:1}},
                        el('label',{style:lblStyle},'Gender'),
                        el('div',{style:{display:'flex',borderRadius:'8px',overflow:'hidden',border:'1.5px solid '+(a.inputBorder||'#e5e7eb')}},
                            ['male','female'].map(function(g){ return el('button',{key:g,onClick:function(){setGender(g);},
                                style:{flex:1,padding:'8px',border:'none',background:gender===g?accent:'#fff',color:gender===g?'#fff':'#374151',fontWeight:600,fontSize:'13px',fontFamily:'inherit',cursor:'pointer'}},
                                g.charAt(0).toUpperCase()+g.slice(1)); })
                        )
                    )
                ),

                // Age / Weight / Height row
                el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'12px'}},
                    el('div',null, el('label',{style:lblStyle},'Age'), el('input',{type:'number',value:age,min:10,max:100,style:inputStyle,onChange:function(e){setAge(e.target.value);}})),
                    el('div',null, el('label',{style:lblStyle},unit==='imperial'?'Weight (lbs)':'Weight (kg)'), el('input',{type:'number',value:weight,min:30,style:inputStyle,onChange:function(e){setWeight(e.target.value);}})),
                    el('div',null, el('label',{style:lblStyle},unit==='imperial'?'Height (in)':'Height (cm)'), el('input',{type:'number',value:height,min:50,style:inputStyle,onChange:function(e){setHeight(e.target.value);}}))
                ),

                // Activity + Goal
                el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'20px'}},
                    el('div',null, el('label',{style:lblStyle},'Activity Level'),
                        el('select',{value:activity,style:{...inputStyle},onChange:function(e){setActivity(e.target.value);}},
                            ACTIVITY_OPTS.map(function(o){return el('option',{key:o.value,value:o.value},o.label);}))
                    ),
                    el('div',null, el('label',{style:lblStyle},'Goal'),
                        el('select',{value:goal,style:{...inputStyle},onChange:function(e){setGoal(e.target.value);}},
                            GOAL_OPTS.map(function(o){return el('option',{key:o.value,value:o.value},o.label);}))
                    )
                ),

                // Calorie result
                el('div',{style:{background:a.calorieBg||accent,borderRadius:'12px',padding:'20px 24px',textAlign:'center',color:a.calorieColor||'#fff',marginBottom:'18px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:600,opacity:.8,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'4px'}},'Daily Calories'),
                    el('div',{style:{fontSize:(a.calorieSize||52)+'px',fontWeight:800,lineHeight:1}},r.calories),
                    el('div',{style:{fontSize:'13px',opacity:.8,marginTop:'5px'}},'BMR: '+r.bmr+' · TDEE: '+r.tdee+' kcal')
                ),

                // Macro cards + optional donut
                el('div',{style:{display:'flex',gap:'12px',alignItems:'center',marginBottom:'14px'}},
                    a.showPieChart && el('div',{style:{flexShrink:0}}, el(DonutChart)),
                    el('div',{style:{flex:1,display:'flex',flexDirection:'column',gap:'10px'}},
                        [[r.protein,'Protein','g','(4 kcal/g)',protClr],
                         [r.carbs,  'Carbohydrates','g','(4 kcal/g)',carbClr],
                         [r.fat,    'Fat','g','(9 kcal/g)',fatClr]].map(function(row){
                            return el('div',{key:row[1],style:{display:'flex',alignItems:'center',justifyContent:'space-between',background:a.statBg||'#f3f4f6',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'8px',padding:'10px 14px'}},
                                el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
                                    el('div',{style:{width:'12px',height:'12px',borderRadius:'50%',background:row[4],flexShrink:0}}),
                                    el('span',{style:{fontWeight:600,fontSize:'14px',color:a.labelColor||'#374151'}},row[1]),
                                    el('span',{style:{fontSize:'11px',color:'#9ca3af'}},row[3])
                                ),
                                el('span',{style:{fontWeight:800,fontSize:'20px',color:row[4]}},row[0]+row[2])
                            );
                        })
                    )
                ),

                // TDEE context row
                el('div',{style:{display:'flex',gap:'10px'}},
                    el('div',{style:{...statStyle}}, el('div',{style:{fontSize:'20px',fontWeight:700,color:'#111827'}},r.bmr), el('div',{style:{fontSize:'11px',color:'#6b7280',marginTop:'3px'}},'BMR (base metabolic rate)')),
                    el('div',{style:{...statStyle}}, el('div',{style:{fontSize:'20px',fontWeight:700,color:'#111827'}},r.tdee), el('div',{style:{fontSize:'11px',color:'#6b7280',marginTop:'3px'}},'TDEE (maintenance calories)'))
                )
            )
        );
    }

    registerBlockType('blockenberg/macro-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo, '--bkbg-mcr-tt-'));
                    Object.assign(s, _tvFn(a.subtitleTypo, '--bkbg-mcr-st-'));
                }
                return { style: s };
            })());
            var colorSettings = [
                {value:a.accentColor,   onChange:function(v){set({accentColor:v});},   label:'Accent Color'},
                {value:a.cardBg,        onChange:function(v){set({cardBg:v});},         label:'Card Background'},
                {value:a.calorieBg,     onChange:function(v){set({calorieBg:v});},      label:'Calorie Card Background'},
                {value:a.calorieColor,  onChange:function(v){set({calorieColor:v});},   label:'Calorie Card Text'},
                {value:a.proteinColor,  onChange:function(v){set({proteinColor:v});},   label:'Protein Color'},
                {value:a.carbColor,     onChange:function(v){set({carbColor:v});},      label:'Carbs Color'},
                {value:a.fatColor,      onChange:function(v){set({fatColor:v});},       label:'Fat Color'},
                {value:a.statBg,        onChange:function(v){set({statBg:v});},         label:'Macro Card Background'},
                {value:a.statBorder,    onChange:function(v){set({statBorder:v});},     label:'Macro Card Border'},
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
                        el(SelectControl,{label:'Default Unit System',value:a.defaultUnit,options:[{label:'Metric (kg/cm)',value:'metric'},{label:'Imperial (lbs/in)',value:'imperial'}],onChange:function(v){set({defaultUnit:v});}}),
                        el(SelectControl,{label:'Default Gender',value:a.defaultGender,options:[{label:'Male',value:'male'},{label:'Female',value:'female'}],onChange:function(v){set({defaultGender:v});}}),
                        el(SelectControl,{label:'Default Activity',value:a.defaultActivity,options:ACTIVITY_OPTS,onChange:function(v){set({defaultActivity:v});}}),
                        el(SelectControl,{label:'Default Goal',value:a.defaultGoal,options:GOAL_OPTS,onChange:function(v){set({defaultGoal:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Donut Chart',    checked:a.showPieChart,    onChange:function(v){set({showPieChart:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Food Examples',  checked:a.showFoodExamples,onChange:function(v){set({showFoodExamples:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () { var C = getTypoControl(); return C ? el(C, { label: 'Title', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }) : null; })(),
                        (function () { var C = getTypoControl(); return C ? el(C, { label: 'Subtitle', value: a.subtitleTypo, onChange: function (v) { set({ subtitleTypo: v }); } }) : null; })(),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Calorie Size',        value:a.calorieSize,         min:24,max:80,step:2,   onChange:function(v){set({calorieSize:v});}})
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
                el('div', blockProps, el(MacroPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            var _tvFn = getTypoCssVars();
            var saveProps = wp.blockEditor.useBlockProps.save((function () {
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo, '--bkbg-mcr-tt-'));
                    Object.assign(s, _tvFn(a.subtitleTypo, '--bkbg-mcr-st-'));
                }
                return { style: s };
            })());
            return el('div', saveProps,
                el('div', {className:'bkbg-mcr-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
