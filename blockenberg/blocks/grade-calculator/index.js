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
    var Button             = wp.components.Button;

    var DEFAULT_SUBJECTS = [
        {id:1, name:'Math',    score:'90', max:'100', weight:'30'},
        {id:2, name:'English', score:'85', max:'100', weight:'30'},
        {id:3, name:'Science', score:'78', max:'100', weight:'20'},
        {id:4, name:'History', score:'92', max:'100', weight:'20'}
    ];

    var GRADE_SCALE = [
        {letter:'A+',min:97,color:'gradeAColor',dflt:'#059669'},
        {letter:'A', min:93,color:'gradeAColor',dflt:'#10b981'},
        {letter:'A−',min:90,color:'gradeAColor',dflt:'#34d399'},
        {letter:'B+',min:87,color:'gradeBColor',dflt:'#2563eb'},
        {letter:'B', min:83,color:'gradeBColor',dflt:'#3b82f6'},
        {letter:'B−',min:80,color:'gradeBColor',dflt:'#60a5fa'},
        {letter:'C+',min:77,color:'gradeCColor',dflt:'#d97706'},
        {letter:'C', min:73,color:'gradeCColor',dflt:'#f59e0b'},
        {letter:'C−',min:70,color:'gradeCColor',dflt:'#fbbf24'},
        {letter:'D+',min:67,color:'gradeDColor',dflt:'#dc2626'},
        {letter:'D', min:63,color:'gradeDColor',dflt:'#ef4444'},
        {letter:'D−',min:60,color:'gradeDColor',dflt:'#f87171'},
        {letter:'F', min:0, color:'gradeFColor',dflt:'#6b7280'}
    ];

    function getLetter(pct, a) {
        for (var i=0; i<GRADE_SCALE.length; i++) {
            if (pct >= GRADE_SCALE[i].min) {
                return {letter: GRADE_SCALE[i].letter, color: a[GRADE_SCALE[i].color] || GRADE_SCALE[i].dflt};
            }
        }
        return {letter:'F', color: a.gradeFColor||'#6b7280'};
    }

    function calcWeighted(subjects) {
        var totalWeight = 0, weightedSum = 0;
        subjects.forEach(function(s) {
            var sc = parseFloat(s.score)||0, mx = parseFloat(s.max)||100, wt = parseFloat(s.weight)||0;
            var pct = mx > 0 ? (sc/mx)*100 : 0;
            weightedSum += pct * wt;
            totalWeight += wt;
        });
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    function calcSimple(subjects) {
        if (!subjects.length) return 0;
        var sum = 0, total = 0;
        subjects.forEach(function(s){
            var sc=parseFloat(s.score)||0, mx=parseFloat(s.max)||100;
            sum+=sc; total+=mx;
        });
        return total > 0 ? (sum/total)*100 : 0;
    }

    var nextId = 10;

    /* ── Typography lazy getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars       || function () { return {}; }; }

    function GCPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';
        var _subs = useState(DEFAULT_SUBJECTS.map(function(s){return Object.assign({},s);}));
        var subs = _subs[0]; var setSubs = _subs[1];

        var pct = a.gradeMode === 'simple' ? calcSimple(subs) : calcWeighted(subs);
        var gInfo = getLetter(pct, a);

        var inpStyle = {padding:'6px 8px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderRadius:(a.inputRadius||8)+'px',fontSize:'14px',fontFamily:'inherit',outline:'none',width:'100%',boxSizing:'border-box'};
        var lblStyle = {fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',display:'block',marginBottom:'3px'};

        function updateSub(id, field, val) {
            setSubs(subs.map(function(s){ return s.id===id ? Object.assign({},s,{[field]:val}) : s; }));
        }

        var wrapS = Object.assign({paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined},_tv()(a.typoTitle,'--bkbg-grc-tt-'),_tv()(a.typoResult,'--bkbg-grc-rs-'),_tv()(a.typoLetter,'--bkbg-grc-lt-'));
        return el('div',{style:wrapS},
            el('div',{style:{background:a.cardBg||'#fff',borderRadius:(a.cardRadius||16)+'px',padding:'32px',maxWidth:(a.maxWidth||640)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'22px'}},
                    a.showTitle    && el('div',{className:'bkbg-grc-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                    a.showSubtitle && el('div',{style:{fontSize:'15px',color:a.subtitleColor,opacity:.75}},a.subtitle)
                ),

                // Result card
                el('div',{style:{background:a.resultBg||accent,borderRadius:'12px',padding:'20px',textAlign:'center',color:a.resultColor||'#fff',marginBottom:'20px',display:'flex',alignItems:'center',justifyContent:'center',gap:'24px'}},
                    el('div',null,
                        el('div',{className:'bkbg-grc-result-pct'},pct.toFixed(1)+'%'),
                        el('div',{style:{fontSize:'14px',opacity:.8,marginTop:'4px'}},a.gradeMode==='simple'?'Simple Average':'Weighted Average')
                    ),
                    a.showLetterGrade && el(Fragment,null,
                        el('div',{style:{width:'1px',height:'60px',background:'rgba(255,255,255,.25)'}}),
                        el('div',{style:{textAlign:'center'}},
                            el('div',{className:'bkbg-grc-result-letter',style:{background:'rgba(255,255,255,.15)',borderRadius:'12px',padding:'0 16px'}},gInfo.letter),
                            el('div',{style:{fontSize:'13px',opacity:.8,marginTop:'4px'}},'Letter Grade')
                        )
                    )
                ),

                // Subjects table header
                a.showBreakdown && el('div',null,
                    el('div',{style:{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',gap:'6px',padding:'6px 10px',marginBottom:'4px'}},
                        el('div',{style:lblStyle},'Subject'),
                        el('div',{style:lblStyle},'Score'),
                        el('div',{style:lblStyle},'Max'),
                        el('div',{style:{...lblStyle}},'Weight %'),
                        el('div',{style:lblStyle},'')
                    ),

                    subs.map(function(s) {
                        var spct = parseFloat(s.max)>0 ? (parseFloat(s.score)||0)/(parseFloat(s.max)||100)*100 : 0;
                        var sg = getLetter(spct, a);
                        return el('div',{key:s.id,style:{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',gap:'6px',alignItems:'center',background:a.rowBg||'#f9fafb',border:'1px solid '+(a.rowBorder||'#e5e7eb'),borderRadius:'8px',padding:'8px 10px',marginBottom:'6px'}},
                            el('input',{type:'text',value:s.name,placeholder:'Subject',style:inpStyle,onChange:function(e){updateSub(s.id,'name',e.target.value);}}),
                            el('input',{type:'number',value:s.score,min:0,style:inpStyle,onChange:function(e){updateSub(s.id,'score',e.target.value);}}),
                            el('input',{type:'number',value:s.max,min:1,style:inpStyle,onChange:function(e){updateSub(s.id,'max',e.target.value);}}),
                            el('input',{type:'number',value:s.weight,min:0,max:100,style:inpStyle,onChange:function(e){updateSub(s.id,'weight',e.target.value);}}),
                            el('div',{style:{display:'flex',gap:'6px',alignItems:'center'}},
                                el('span',{style:{fontWeight:700,fontSize:'13px',color:sg.color}},sg.letter),
                                el('button',{onClick:function(){setSubs(subs.filter(function(x){return x.id!==s.id;}));},style:{border:'none',background:'#fee2e2',color:'#ef4444',borderRadius:'6px',cursor:'pointer',padding:'3px 8px',fontWeight:700,fontSize:'13px',fontFamily:'inherit'}},'×')
                            )
                        );
                    }),

                    el('button',{onClick:function(){nextId++;setSubs(subs.concat({id:nextId,name:'',score:'',max:'100',weight:'0'}));},style:{marginTop:'8px',padding:'8px 16px',background:accent,color:'#fff',border:'none',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}}, '+ Add Subject')
                ),

                // Grade scale
                a.showGradeScale && el('div',{style:{marginTop:'20px',background:a.scaleBg||'#f3f4f6',border:'1px solid '+(a.scaleBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 16px'}},
                    el('div',{style:{fontSize:'12px',fontWeight:700,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'10px'}},'Grade Scale'),
                    el('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px'}},
                        GRADE_SCALE.map(function(gs){
                            return el('div',{key:gs.letter,style:{background:'#fff',border:'2px solid '+(a[gs.color]||gs.dflt),borderRadius:'6px',padding:'4px 10px',textAlign:'center',minWidth:'50px'}},
                                el('div',{style:{fontWeight:800,fontSize:'14px',color:a[gs.color]||gs.dflt}},gs.letter),
                                el('div',{style:{fontSize:'11px',color:'#6b7280'}},gs.min+'%+')
                            );
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/grade-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps();
            var colorSettings = [
                {value:a.accentColor,  onChange:function(v){set({accentColor:v});},  label:'Accent Color'},
                {value:a.cardBg,       onChange:function(v){set({cardBg:v});},        label:'Card Background'},
                {value:a.resultBg,     onChange:function(v){set({resultBg:v});},      label:'Result Card Background'},
                {value:a.resultColor,  onChange:function(v){set({resultColor:v});},   label:'Result Card Text'},
                {value:a.gradeAColor,  onChange:function(v){set({gradeAColor:v});},   label:'Grade A Color'},
                {value:a.gradeBColor,  onChange:function(v){set({gradeBColor:v});},   label:'Grade B Color'},
                {value:a.gradeCColor,  onChange:function(v){set({gradeCColor:v});},   label:'Grade C Color'},
                {value:a.gradeDColor,  onChange:function(v){set({gradeDColor:v});},   label:'Grade D Color'},
                {value:a.gradeFColor,  onChange:function(v){set({gradeFColor:v});},   label:'Grade F Color'},
                {value:a.rowBg,        onChange:function(v){set({rowBg:v});},         label:'Table Row Background'},
                {value:a.rowBorder,    onChange:function(v){set({rowBorder:v});},     label:'Table Row Border'},
                {value:a.scaleBg,      onChange:function(v){set({scaleBg:v});},       label:'Scale Background'},
                {value:a.scaleBorder,  onChange:function(v){set({scaleBorder:v});},   label:'Scale Border'},
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
                    el(PanelBody,{title:'Calculator Settings',initialOpen:true},
                        el(SelectControl,{label:'Grade Mode',value:a.gradeMode,options:[{label:'Weighted Average',value:'weighted'},{label:'Simple Average',value:'simple'}],onChange:function(v){set({gradeMode:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Letter Grade',  checked:a.showLetterGrade,onChange:function(v){set({showLetterGrade:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Grade Scale',   checked:a.showGradeScale, onChange:function(v){set({showGradeScale:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subject Breakdown',checked:a.showBreakdown,onChange:function(v){set({showBreakdown:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label:'Title', value:a.typoTitle, onChange:function(v){ set({typoTitle:v}); } }),
                        _tc() && el(_tc(), { label:'Result %', value:a.typoResult, onChange:function(v){ set({typoResult:v}); } }),
                        _tc() && el(_tc(), { label:'Letter Grade', value:a.typoLetter, onChange:function(v){ set({typoLetter:v}); } })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Letter Grade Size', value:a.letterSize, min:24,max:80,step:2,  onChange:function(v){set({letterSize:v});}}),
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius, min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius,min:0,max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',    value:a.maxWidth,   min:360,max:1100,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',       value:a.paddingTop, min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',    value:a.paddingBottom,min:0,max:160,step:4,onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(GCPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div',{className:'bkbg-grc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
