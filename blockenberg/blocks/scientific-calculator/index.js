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
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var BTN_LAYOUT = [
        ['MC','MR','MS','M+','M−'],
        ['2nd','π','e','C','⌫'],
        ['x²','xʸ','√x','ʸ√x','1/x'],
        ['sin','cos','tan','log','ln'],
        ['sin⁻¹','cos⁻¹','tan⁻¹','10ˣ','eˣ'],
        ['(',')',  '%',  '÷',  ''],
        ['7',  '8',  '9',  '×',  ''],
        ['4',  '5',  '6',  '−',  ''],
        ['1',  '2',  '3',  '+',  ''],
        ['±',  '0',  '.',  '=',  '']
    ];

    function ScientificCalcPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        var _disp = useState('0');
        var display = _disp[0]; var setDisplay = _disp[1];

        var _expr = useState('');
        var expr = _expr[0]; var setExpr = _expr[1];

        var _hist = useState([]);
        var history = _hist[0]; var setHistory = _hist[1];

        var _mem = useState(0);
        var memory = _mem[0]; var setMemory = _mem[1];

        var _ang = useState(a.angleMode || 'deg');
        var angleMode = _ang[0]; var setAngleMode = _ang[1];

        var _shift = useState(false);
        var shift = _shift[0]; var setShift = _shift[1];

        function toRad(x) { return angleMode === 'deg' ? x * Math.PI / 180 : x; }

        function evaluate(e) {
            try {
                var safe = e
                    .replace(/×/g,'*').replace(/÷/g,'/')
                    .replace(/−/g,'-').replace(/π/g,'Math.PI')
                    .replace(/\be\b/g,'Math.E');
                var r = Function('"use strict"; return (' + safe + ')')();
                return isFinite(r) ? parseFloat(r.toPrecision(a.precision||10)).toString() : 'Error';
            } catch(err) { return 'Error'; }
        }

        function handleBtn(lbl) {
            if (lbl === '') return;
            if (lbl === 'C')  { setDisplay('0'); setExpr(''); return; }
            if (lbl === '⌫')  { setDisplay(function(d){ var s = d.slice(0,-1); return s===''||s==='-'?'0':s; }); return; }
            if (lbl === '±')  { setDisplay(function(d){ return d.startsWith('-')?d.slice(1):'-'+d; }); return; }
            if (lbl === '=')  {
                var full = expr + display;
                var res = evaluate(full);
                if (a.showHistory) setHistory(function(h){ return [{expr:full+'='+res}].concat(h).slice(0,a.historyMax||10); });
                setExpr(''); setDisplay(res); return;
            }
            if (lbl === 'MC') { setMemory(0); return; }
            if (lbl === 'MR') { setDisplay(memory.toString()); return; }
            if (lbl === 'MS') { setMemory(parseFloat(display)||0); return; }
            if (lbl === 'M+') { setMemory(function(m){ return m + (parseFloat(display)||0); }); return; }
            if (lbl === 'M−') { setMemory(function(m){ return m - (parseFloat(display)||0); }); return; }
            if (lbl === '2nd') { setShift(!shift); return; }
            var num = parseFloat(display);
            var unary = {
                'x²':    function(v){ return (v*v).toString(); },
                '√x':    function(v){ return Math.sqrt(v).toString(); },
                '1/x':   function(v){ return (1/v).toString(); },
                'sin':   function(v){ return Math.sin(toRad(v)).toPrecision(a.precision||10)*1+''; },
                'cos':   function(v){ return Math.cos(toRad(v)).toPrecision(a.precision||10)*1+''; },
                'tan':   function(v){ return Math.tan(toRad(v)).toPrecision(a.precision||10)*1+''; },
                'sin⁻¹': function(v){ return (angleMode==='deg'?Math.asin(v)*180/Math.PI:Math.asin(v)).toPrecision(a.precision||10)*1+''; },
                'cos⁻¹': function(v){ return (angleMode==='deg'?Math.acos(v)*180/Math.PI:Math.acos(v)).toPrecision(a.precision||10)*1+''; },
                'tan⁻¹': function(v){ return (angleMode==='deg'?Math.atan(v)*180/Math.PI:Math.atan(v)).toPrecision(a.precision||10)*1+''; },
                'log':   function(v){ return Math.log10(v).toPrecision(a.precision||10)*1+''; },
                'ln':    function(v){ return Math.log(v).toPrecision(a.precision||10)*1+''; },
                '10ˣ':   function(v){ return Math.pow(10,v).toString(); },
                'eˣ':    function(v){ return Math.exp(v).toPrecision(a.precision||10)*1+''; },
                '%':     function(v){ return (v/100).toString(); }
            };
            if (unary[lbl]) { setDisplay(unary[lbl](num)); return; }
            var ops = ['+','−','×','÷','xʸ','ʸ√x'];
            if (ops.includes(lbl)) {
                setExpr(expr + display + lbl);
                setDisplay('0');
                return;
            }
            if (lbl === 'π') { setDisplay(Math.PI.toPrecision(a.precision||10)*1+''); return; }
            if (lbl === 'e') { setDisplay(Math.E.toPrecision(a.precision||10)*1+''); return; }
            if (lbl === '(' || lbl === ')') { setExpr(expr+lbl); return; }
            setDisplay(function(d){ return d==='0'||d==='Error'?lbl:(d+lbl); });
        }

        function getBtnStyle(lbl) {
            var base = {padding:'0',border:'none',cursor:'pointer',fontWeight:600,fontSize:(a.btnSize||15)+'px',fontFamily:'inherit',borderRadius:(a.btnRadius||10)+'px',transition:'filter .15s, transform .1s',minHeight:'44px'};
            if (lbl === '=')                            return Object.assign({},base,{background:a.btnEqBg||accent,color:a.btnEqColor||'#fff'});
            if (['C','⌫'].includes(lbl))                return Object.assign({},base,{background:a.btnClearBg||'#7f1d1d',color:a.btnClearColor||'#fecaca'});
            if (['MC','MR','MS','M+','M−'].includes(lbl))return Object.assign({},base,{background:a.btnFnBg||'#1e2a4a',color:a.memColor||'#86efac'});
            if (['+','−','×','÷','=','%','xʸ','ʸ√x','(',')',].includes(lbl)) return Object.assign({},base,{background:a.btnOpBg||'#3d2d6a',color:a.btnOpColor||'#c4b5fd'});
            if (['0','1','2','3','4','5','6','7','8','9','.','±'].includes(lbl)) return Object.assign({},base,{background:a.btnNumBg||'#2d2d4a',color:a.btnNumColor||'#fff'});
            return Object.assign({},base,{background:a.btnFnBg||'#1e2a4a',color:a.btnFnColor||'#93c5fd'});
        }

        var wrapStyle = {paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined};
        var cardStyle = {background:a.cardBg||'#1a1a2e',borderRadius:(a.cardRadius||20)+'px',padding:'24px',maxWidth:(a.maxWidth||420)+'px',margin:'0 auto',boxShadow:'0 8px 40px rgba(0,0,0,.45)'};

        return el('div',{style:wrapStyle},
            (a.showTitle||a.showSubtitle) && el('div',{style:{textAlign:'center',marginBottom:'20px'}},
                a.showTitle    && el('div',{className:'bkbg-sc-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                a.showSubtitle && el('div',{className:'bkbg-sc-subtitle',style:{color:a.subtitleColor}},a.subtitle)
            ),
            el('div',{style:cardStyle},
                // Angle mode + memory indicator
                el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}},
                    el('div',{style:{display:'flex',gap:'4px'}},
                        ['deg','rad'].map(function(m){
                            return el('button',{key:m,onClick:function(){setAngleMode(m);},style:{padding:'3px 10px',border:'none',borderRadius:'6px',cursor:'pointer',fontWeight:700,fontSize:'12px',fontFamily:'inherit',background:angleMode===m?(a.accentColor||accent):'rgba(255,255,255,.1)',color:angleMode===m?'#fff':'rgba(255,255,255,.5)'}},m.toUpperCase());
                        })
                    ),
                    a.showMemory && el('div',{style:{fontSize:'12px',color:a.memColor||'#86efac',fontWeight:700}}, memory !== 0 ? 'M: '+memory : '')
                ),
                // Expression bar
                el('div',{style:{textAlign:'right',fontSize:'13px',color:'rgba(255,255,255,.4)',minHeight:'18px',marginBottom:'2px',fontFamily:'ui-monospace,monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},expr||'\u00a0'),
                // Display
                el('div',{style:{background:a.displayBg||'#0d0d1a',borderRadius:'10px',padding:'12px 16px',textAlign:'right',fontSize:(a.displaySize||36)+'px',fontWeight:700,color:a.displayColor||'#fff',fontFamily:'ui-monospace,monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:'14px',minHeight:'64px',display:'flex',alignItems:'center',justifyContent:'flex-end'}},display),
                // Button grid
                el('div',{style:{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'6px'}},
                    BTN_LAYOUT.flat().map(function(lbl,i){
                        if (lbl==='') return el('div',{key:i});
                        return el('button',{key:i,onClick:function(){handleBtn(lbl);},style:getBtnStyle(lbl)},lbl);
                    })
                ),
                // History
                a.showHistory && history.length > 0 && el('div',{style:{marginTop:'16px',background:a.historyBg||'#111128',borderRadius:'8px',padding:'10px 12px',maxHeight:'140px',overflowY:'auto'}},
                    el('div',{style:{fontSize:'11px',fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'6px'}},'History'),
                    history.map(function(h,i){
                        return el('div',{key:i,style:{fontSize:'13px',color:a.historyColor||'#9ca3af',fontFamily:'ui-monospace,monospace',padding:'2px 0',borderBottom:'1px solid rgba(255,255,255,.05)'}},h.expr);
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/scientific-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function(){
                var _tv = getTypoCssVars();
                var s = {};
                if(_tv) Object.assign(s, _tv(a.titleTypo||{}, '--bksc-tt-'));
                if(_tv) Object.assign(s, _tv(a.subtitleTypo||{}, '--bksc-st-'));
                return { style: s };
            })());
            var colorSettings = [
                {value:a.accentColor,  onChange:function(v){set({accentColor:v});},  label:'Accent / Equals Button'},
                {value:a.cardBg,       onChange:function(v){set({cardBg:v});},        label:'Calculator Body'},
                {value:a.displayBg,    onChange:function(v){set({displayBg:v});},     label:'Display Background'},
                {value:a.displayColor, onChange:function(v){set({displayColor:v});},  label:'Display Text'},
                {value:a.btnNumBg,     onChange:function(v){set({btnNumBg:v});},      label:'Number Button Background'},
                {value:a.btnNumColor,  onChange:function(v){set({btnNumColor:v});},   label:'Number Button Text'},
                {value:a.btnOpBg,      onChange:function(v){set({btnOpBg:v});},       label:'Operator Button Background'},
                {value:a.btnOpColor,   onChange:function(v){set({btnOpColor:v});},    label:'Operator Button Text'},
                {value:a.btnFnBg,      onChange:function(v){set({btnFnBg:v});},       label:'Function Button Background'},
                {value:a.btnFnColor,   onChange:function(v){set({btnFnColor:v});},    label:'Function Button Text'},
                {value:a.btnEqBg,      onChange:function(v){set({btnEqBg:v});},       label:'Equals Button Background'},
                {value:a.btnEqColor,   onChange:function(v){set({btnEqColor:v});},    label:'Equals Button Text'},
                {value:a.btnClearBg,   onChange:function(v){set({btnClearBg:v});},    label:'Clear Button Background'},
                {value:a.btnClearColor,onChange:function(v){set({btnClearColor:v});}, label:'Clear Button Text'},
                {value:a.historyBg,    onChange:function(v){set({historyBg:v});},     label:'History Background'},
                {value:a.historyColor, onChange:function(v){set({historyColor:v});},  label:'History Text'},
                {value:a.memColor,     onChange:function(v){set({memColor:v});},      label:'Memory Indicator'},
                {value:a.titleColor,   onChange:function(v){set({titleColor:v});},    label:'Title Color'},
                {value:a.subtitleColor,onChange:function(v){set({subtitleColor:v});}, label:'Subtitle Color'},
                {value:a.sectionBg,    onChange:function(v){set({sectionBg:v});},     label:'Section Background'}
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
                        el(SelectControl,{label:'Default Angle Mode',value:a.angleMode,options:[{label:'Degrees',value:'deg'},{label:'Radians',value:'rad'}],onChange:function(v){set({angleMode:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Memory Buttons',checked:a.showMemory,  onChange:function(v){set({showMemory:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show History',       checked:a.showHistory, onChange:function(v){set({showHistory:v});}}),
                        el(RangeControl,{label:'History Max Entries',value:a.historyMax,min:3,max:20,step:1,onChange:function(v){set({historyMax:v});}}),
                        el(RangeControl,{label:'Calculation Precision',value:a.precision,min:4,max:14,step:1,onChange:function(v){set({precision:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title Typography','blockenberg'), value: a.titleTypo||{}, onChange: function(v){ set({titleTypo:v}); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Subtitle Typography','blockenberg'), value: a.subtitleTypo||{}, onChange: function(v){ set({subtitleTypo:v}); } }),
                        el(RangeControl,{label:'Display Font Size',value:a.displaySize, min:18,max:64,step:2,  onChange:function(v){set({displaySize:v});}}),
                        el(RangeControl,{label:'Button Font Size', value:a.btnSize,     min:11,max:22,step:1,  onChange:function(v){set({btnSize:v});}})
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius, min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Button Radius',    value:a.btnRadius,   min:0, max:20,step:1,  onChange:function(v){set({btnRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',   value:a.maxWidth,    min:320,max:640,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',      value:a.paddingTop,  min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',   value:a.paddingBottom,min:0,max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div',blockProps, el(ScientificCalcPreview,{attributes:a}))
            );
        },
        save: function(props){
            var a = props.attributes;
            return el('div',wp.blockEditor.useBlockProps.save(),
                el('div',{className:'bkbg-sc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
