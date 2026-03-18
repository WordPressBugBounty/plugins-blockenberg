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

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    var FREQ_OPTIONS = [
        { label: 'Annually (1×/year)',    value: '1'  },
        { label: 'Semi-annually (2×/yr)', value: '2'  },
        { label: 'Quarterly (4×/yr)',     value: '4'  },
        { label: 'Monthly (12×/yr)',      value: '12' },
        { label: 'Daily (365×/yr)',       value: '365'}
    ];

    function calcCompound(principal, monthly, rateAnn, years, freq) {
        var n = freq;
        var r = rateAnn / 100;
        var rows = [];
        var balance = principal;
        for (var y = 1; y <= years; y++) {
            var startBal = balance;
            // compound for full year
            balance = balance * Math.pow(1 + r / n, n) + monthly * 12 * ((Math.pow(1 + r / n, n) - 1) / (r / n));
            var contributed = principal + monthly * 12 * y;
            var interest    = balance - contributed;
            rows.push({ year: y, balance: balance, contributed: contributed, interest: interest > 0 ? interest : 0 });
        }
        return rows;
    }

    function fmtCur(sym, n) { return sym + Math.round(n).toLocaleString(); }

    function CompoundPreview(props) {
        var a  = props.attributes;
        var sym = a.currency || '$';
        var accent = a.accentColor || '#6c3fb5';

        var _p  = useState(String(a.defaultPrincipal || 10000)); var p = _p[0]; var setP = _p[1];
        var _m  = useState(String(a.defaultMonthly   || 200));   var m = _m[0]; var setM = _m[1];
        var _r  = useState(String(a.defaultRate      || 7));     var r = _r[0]; var setR = _r[1];
        var _y  = useState(String(a.defaultYears     || 20));    var y = _y[0]; var setY = _y[1];
        var _f  = useState(a.defaultFrequency || '12');           var f = _f[0]; var setF = _f[1];

        var principal = parseFloat(p) || 0;
        var monthly   = parseFloat(m) || 0;
        var rate      = parseFloat(r) || 0;
        var years     = Math.max(1, parseInt(y) || 1);
        var freq      = parseInt(f) || 12;

        var rows = calcCompound(principal, monthly, rate, years, freq);
        var last = rows[rows.length - 1] || { balance: 0, contributed: principal, interest: 0 };
        var contributed = principal + monthly * 12 * years;
        var interest    = Math.max(0, last.balance - contributed);

        function inp(lbl, val, set) {
            return el('div', { style:{ flex:1 } },
                el('label', { style:{ display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'.04em' }}, lbl),
                el('input', { type:'number', value:val, min:'0',
                    style:{ width:'100%',padding:'10px 12px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'15px',fontFamily:'inherit',outline:'none',boxSizing:'border-box' },
                    onChange: function(e){ set(e.target.value); }
                })
            );
        }

        var tableRows = a.showTable ? rows.slice(0, a.tableRows || 10) : [];

        return el('div', { style:{ paddingTop:a.paddingTop+'px',paddingBottom:a.paddingBottom+'px',background:a.sectionBg||undefined }},
            el('div', { style:{ background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||580)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,0.09)' }},

                (a.showTitle||a.showSubtitle) && el('div', {style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', {style:{fontSize:(a.titleSize||28)+'px',fontWeight:700,color:a.titleColor,marginBottom:'6px'}}, a.title),
                    a.showSubtitle && el('div', {style:{fontSize:'15px',color:a.subtitleColor,opacity:.75}}, a.subtitle)
                ),

                // Input grid
                el('div', {style:{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}},
                    inp('Initial Investment ('+sym+')', p, setP),
                    inp('Monthly Contribution ('+sym+')', m, setM)
                ),
                el('div', {style:{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}},
                    inp('Annual Rate (%)', r, setR),
                    inp('Years', y, setY)
                ),
                el('div', {style:{marginBottom:'20px'}},
                    el('label', {style:{display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'.04em'}}, 'Compound Frequency'),
                    el('select', {
                        value: f,
                        onChange: function(e){ setF(e.target.value); },
                        style:{ width:'100%',padding:'10px 12px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'15px',fontFamily:'inherit',outline:'none',background:'#fff',cursor:'pointer' }
                    }, FREQ_OPTIONS.map(function(o){ return el('option', {key:o.value,value:o.value}, o.label); }))
                ),

                // Results
                el('div', {style:{background:a.resultBg||accent,borderRadius:(a.inputRadius||8)+'px',padding:'24px',marginBottom:'16px'}},
                    el('div', {style:{fontSize:'13px',fontWeight:600,color:a.resultColor||'#fff',opacity:.8,marginBottom:'4px'}}, 'Future Value after '+years+' years'),
                    el('div', {style:{fontSize:(a.resultSize||48)+'px',fontWeight:800,color:a.resultColor||'#fff',lineHeight:1.1,marginBottom:'16px'}}, fmtCur(sym, last.balance)),
                    el('div', {style:{display:'flex',gap:'20px',flexWrap:'wrap'}},
                        el('div', null,
                            el('div', {style:{fontSize:'12px',color:a.resultColor||'#fff',opacity:.7}}, 'Principal + Contributions'),
                            el('div', {style:{fontSize:'18px',fontWeight:700,color:a.principalColor||'#93c5fd'}}, fmtCur(sym, contributed))
                        ),
                        el('div', null,
                            el('div', {style:{fontSize:'12px',color:a.resultColor||'#fff',opacity:.7}}, 'Interest Earned'),
                            el('div', {style:{fontSize:'18px',fontWeight:700,color:a.interestColor||'#6ee7b7'}}, fmtCur(sym, interest))
                        )
                    )
                ),

                // Growth bar
                last.balance > 0 && el('div', {style:{marginBottom:'20px'}},
                    el('div', {style:{height:'10px',borderRadius:'5px',background:a.tableBorder||'#e5e7eb',overflow:'hidden'}},
                        el('div', {style:{display:'flex',height:'100%'}},
                            el('div', {style:{width:(contributed/last.balance*100)+'%',background:a.principalColor||'#3b82f6',transition:'width .4s'}}),
                            el('div', {style:{flex:1,background:a.interestColor||'#10b981',transition:'width .4s'}})
                        )
                    ),
                    el('div', {style:{display:'flex',justifyContent:'space-between',fontSize:'12px',color:a.labelColor||'#6b7280',marginTop:'5px'}},
                        el('span', null, '■ Principal & Contributions (' + Math.round(contributed/last.balance*100) + '%)'),
                        el('span', null, '■ Interest (' + Math.round(interest/last.balance*100) + '%)')
                    )
                ),

                // Year-by-year table
                a.showTable && tableRows.length > 0 && el('div', {style:{overflowX:'auto'}},
                    el('table', {style:{width:'100%',borderCollapse:'collapse',fontSize:'13px',background:a.tableBg||'#f9fafb',borderRadius:'8px',overflow:'hidden'}},
                        el('thead', null,
                            el('tr', null,
                                ['Year','Balance','Contributed','Interest Earned'].map(function(h){
                                    return el('th', {key:h, style:{padding:'10px 12px',textAlign:'left',background:a.tableHeaderBg||'#f3f4f6',color:a.labelColor||'#374151',fontWeight:700,fontSize:'12px',textTransform:'uppercase',borderBottom:'1.5px solid '+(a.tableBorder||'#e5e7eb')}}, h);
                                })
                            )
                        ),
                        el('tbody', null,
                            tableRows.map(function(row) {
                                return el('tr', {key:row.year},
                                    [row.year, fmtCur(sym,row.balance), fmtCur(sym,row.contributed), fmtCur(sym,row.interest)].map(function(v,i){
                                        return el('td', {key:i, style:{padding:'9px 12px',borderBottom:'1px solid '+(a.tableBorder||'#e5e7eb'),color:i===0?a.labelColor:i===1?'#1f2937':i===2?(a.principalColor||'#3b82f6'):(a.interestColor||'#10b981'),fontWeight:i===1?700:400}}, v);
                                    })
                                );
                            })
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/compound-interest-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({}, _tv(a.typoTitle, '--bkcic-title-'), _tv(a.typoResult, '--bkcic-result-')) });
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){ set({accentColor:v}); },    label: 'Accent Color' },
                { value: a.cardBg,         onChange: function(v){ set({cardBg:v}); },          label: 'Card Background' },
                { value: a.resultBg,       onChange: function(v){ set({resultBg:v}); },        label: 'Result Card Background' },
                { value: a.resultColor,    onChange: function(v){ set({resultColor:v}); },     label: 'Result Text Color' },
                { value: a.principalColor, onChange: function(v){ set({principalColor:v}); },  label: 'Principal / Contributions Color' },
                { value: a.interestColor,  onChange: function(v){ set({interestColor:v}); },   label: 'Interest Earned Color' },
                { value: a.tableBg,        onChange: function(v){ set({tableBg:v}); },         label: 'Table Background' },
                { value: a.tableHeaderBg,  onChange: function(v){ set({tableHeaderBg:v}); },   label: 'Table Header Background' },
                { value: a.tableBorder,    onChange: function(v){ set({tableBorder:v}); },     label: 'Table Border' },
                { value: a.labelColor,     onChange: function(v){ set({labelColor:v}); },      label: 'Label Color' },
                { value: a.inputBorder,    onChange: function(v){ set({inputBorder:v}); },     label: 'Input Border' },
                { value: a.titleColor,     onChange: function(v){ set({titleColor:v}); },      label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v){ set({subtitleColor:v}); },   label: 'Subtitle Color' },
                { value: a.sectionBg,      onChange: function(v){ set({sectionBg:v}); },       label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Header', initialOpen: false},
                        el(ToggleControl, {__nextHasNoMarginBottom:true, label:'Show Title',    checked:a.showTitle,    onChange:function(v){set({showTitle:v}); }}),
                        el(ToggleControl, {__nextHasNoMarginBottom:true, label:'Show Subtitle', checked:a.showSubtitle, onChange:function(v){set({showSubtitle:v}); }}),
                        el(TextControl,   {label:'Title',    value:a.title,    onChange:function(v){set({title:v}); }}),
                        el(TextControl,   {label:'Subtitle', value:a.subtitle, onChange:function(v){set({subtitle:v}); }})
                    ),
                    el(PanelBody, {title:'Calculator Settings', initialOpen:true},
                        el(TextControl,  {label:'Currency Symbol',         value:a.currency,          onChange:function(v){set({currency:v}); }}),
                        el(TextControl,  {label:'Initial Investment',      value:String(a.defaultPrincipal), onChange:function(v){set({defaultPrincipal:parseFloat(v)||0}); }}),
                        el(TextControl,  {label:'Monthly Contribution',    value:String(a.defaultMonthly),   onChange:function(v){set({defaultMonthly:parseFloat(v)||0}); }}),
                        el(TextControl,  {label:'Annual Rate (%)',         value:String(a.defaultRate),      onChange:function(v){set({defaultRate:parseFloat(v)||0}); }}),
                        el(TextControl,  {label:'Years',                   value:String(a.defaultYears),     onChange:function(v){set({defaultYears:parseInt(v)||1}); }}),
                        el(SelectControl,{label:'Compound Frequency',      value:a.defaultFrequency,         options:FREQ_OPTIONS, onChange:function(v){set({defaultFrequency:v}); }}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true, label:'Show Year-by-Year Table', checked:a.showTable, onChange:function(v){set({showTable:v}); }}),
                        a.showTable && el(RangeControl, {label:'Table Rows to Show', value:a.tableRows, min:5, max:50, step:5, onChange:function(v){set({tableRows:v}); }})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Result Typography', 'blockenberg'), value: a.typoResult, onChange: function (v) { set({ typoResult: v }); } })
                    ),
el(PanelColorSettings, {title:'Colors', initialOpen:false, colorSettings:colorSettings}),
                    el(PanelBody, {title:'Sizing & Layout', initialOpen:false},
                        el(RangeControl, {label:'Card Border Radius',  value:a.cardRadius,    min:0,  max:40,  step:1,  onChange:function(v){set({cardRadius:v}); }}),
                        el(RangeControl, {label:'Input Border Radius', value:a.inputRadius,   min:0,  max:24,  step:1,  onChange:function(v){set({inputRadius:v}); }}),
                        el(RangeControl, {label:'Max Width (px)',       value:a.maxWidth,      min:340,max:960, step:10, onChange:function(v){set({maxWidth:v}); }}),
                        el(RangeControl, {label:'Padding Top (px)',     value:a.paddingTop,    min:0,  max:160, step:4,  onChange:function(v){set({paddingTop:v}); }}),
                        el(RangeControl, {label:'Padding Bottom (px)',  value:a.paddingBottom, min:0,  max:160, step:4,  onChange:function(v){set({paddingBottom:v}); }})
                    )
                ),
                el('div', blockProps, el(CompoundPreview, {attributes:a, setAttributes:set}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ style: Object.assign({}, _tv(a.typoTitle, '--bkcic-title-'), _tv(a.typoResult, '--bkcic-result-')) }), el('div', {className:'bkbg-cic-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
