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
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function fmt(sym, n) { return sym + n.toFixed(2); }

    function SplitBillPreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;
        var sym = a.currencySymbol || '$';
        var accent = a.accentColor || '#6c3fb5';

        var _bill   = useState(String(a.defaultBill || 100));     var bill = _bill[0];   var setBill = _bill[1];
        var _tip    = useState(a.defaultTip || 15);               var tip = _tip[0];    var setTip = _tip[1];
        var _people = useState(String(a.defaultPeople || 4));     var people = _people[0]; var setPeople = _people[1];

        var billN   = parseFloat(bill)   || 0;
        var tipN    = parseFloat(tip)    || 0;
        var peopleN = Math.max(1, parseInt(people) || 1);
        var tipAmt  = billN * tipN / 100;
        var total   = billN + tipAmt;
        var perPerson = a.roundUp ? Math.ceil(total / peopleN * 100) / 100 : total / peopleN;

        var tipPresets = String(a.tipPresets || '10,15,20,25').split(',').map(function(s){ return parseInt(s.trim()) || 0; });

        function inputRow(lbl, val, setVal, hint, type) {
            return el('div', { style:{ marginBottom:'16px' }},
                el('label', { style:{ display:'flex',justifyContent:'space-between',fontSize:'13px',fontWeight:600,color:a.labelColor,marginBottom:'5px' }},
                    el('span', null, lbl),
                    hint && el('span', { style:{ fontWeight:400,color:'#9ca3af',fontSize:'12px' }}, hint)
                ),
                el('input', { type: type||'number', value: val, min:0,
                    style:{ width:'100%',padding:'11px 14px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'16px',outline:'none',boxSizing:'border-box',fontFamily:'inherit' },
                    onChange: function(e){ setVal(e.target.value); }
                })
            );
        }

        return el('div', { style:{ paddingTop:a.paddingTop+'px',paddingBottom:a.paddingBottom+'px',background:a.sectionBg||undefined }},
            el('div', { style:{ background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||500)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,0.09)' }},

                (a.showTitle||a.showSubtitle) && el('div', { style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', { className: 'bkbg-sbc-title', style:{color:a.titleColor,marginBottom:'6px'} }, a.title),
                    a.showSubtitle && el('div', { className: 'bkbg-sbc-subtitle', style:{color:a.subtitleColor} }, a.subtitle)
                ),

                inputRow('Bill Amount', bill, setBill, sym),
                inputRow('Number of People', people, setPeople, 'persons', 'number'),

                // Tip %
                el('div', { style:{marginBottom:'16px'}},
                    el('label', { style:{display:'block',fontSize:'13px',fontWeight:600,color:a.labelColor,marginBottom:'5px' }}, 'Tip Percentage'),
                    a.showTipPresets && el('div', { style:{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'10px'}},
                        tipPresets.map(function(p) {
                            var active = tip === p;
                            return el('button', { key:p, onClick:function(){ setTip(p); }, style:{ flex:1, padding:'8px 6px', borderRadius:'8px', border:'2px solid '+(active?accent:'#e5e7eb'), background:active?(a.presetActiveBg||accent):(a.presetBg||'#f3f4f6'), color:active?(a.presetActiveColor||'#fff'):(a.presetColor||'#374151'), fontWeight:700, fontSize:'14px', cursor:'pointer', fontFamily:'inherit', minWidth:'48px' }}, p+'%');
                        }),
                        el('input', { type:'number', value:tip, min:0, max:100,
                            style:{width:'72px',padding:'8px 10px',borderRadius:'8px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'15px',outline:'none',fontFamily:'inherit'},
                            onChange: function(e){ setTip(parseFloat(e.target.value)||0); }
                        })
                    ),
                    !a.showTipPresets && el('input', { type:'number', value:tip, min:0, max:100,
                        style:{width:'100%',padding:'11px 14px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'16px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'},
                        onChange: function(e){ setTip(parseFloat(e.target.value)||0); }
                    })
                ),

                // Per-person result
                el('div', { style:{background:a.resultBg||accent,borderRadius:(a.inputRadius||8)+'px',padding:'24px',textAlign:'center',marginBottom:a.showBreakdown?'16px':'0' }},
                    el('div', { style:{fontSize:'13px',fontWeight:600,color:a.resultColor||'#fff',opacity:.8,marginBottom:'6px'} }, 'Each person pays'),
                    el('div', { className: 'bkbg-sbc-result-amount', style:{color:a.resultColor||'#fff'} }, sym + perPerson.toFixed(2))
                ),

                // Breakdown
                a.showBreakdown && el('div', { style:{background:a.breakdownBg||'#f5f3ff',border:'1.5px solid '+(a.breakdownBorder||'#ede9fe'),borderRadius:(a.inputRadius||8)+'px',padding:'16px 20px'} },
                    [
                        ['Bill Subtotal', fmt(sym, billN)],
                        ['Tip (' + tipN + '%)', '+' + fmt(sym, tipAmt)],
                        ['Total', fmt(sym, total)],
                        ['Split ' + peopleN + ' ways', fmt(sym, perPerson) + ' each']
                    ].map(function(row) {
                        return el('div', { key:row[0], style:{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:'14px',color:a.labelColor,borderBottom:'1px solid '+(a.breakdownBorder||'#ede9fe')} },
                            el('span', null, row[0]),
                            el('span', { style:{fontWeight:600} }, row[1])
                        );
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/split-bill-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = {};
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(a.titleTypo, '--bksbc-tt-'));
                    Object.assign(s, tv(a.subtitleTypo, '--bksbc-st-'));
                    Object.assign(s, tv(a.resultTypo, '--bksbc-rs-'));
                }
                return { style: s };
            })());
            var colorSettings = [
                { value: a.accentColor,       onChange: function(v){ set({accentColor:v}); },       label: 'Accent Color' },
                { value: a.cardBg,            onChange: function(v){ set({cardBg:v}); },             label: 'Card Background' },
                { value: a.resultBg,          onChange: function(v){ set({resultBg:v}); },           label: 'Result Background' },
                { value: a.resultColor,       onChange: function(v){ set({resultColor:v}); },        label: 'Result Text' },
                { value: a.presetBg,          onChange: function(v){ set({presetBg:v}); },           label: 'Tip Preset Background' },
                { value: a.presetColor,       onChange: function(v){ set({presetColor:v}); },        label: 'Tip Preset Text' },
                { value: a.presetActiveBg,    onChange: function(v){ set({presetActiveBg:v}); },     label: 'Active Preset Background' },
                { value: a.presetActiveColor, onChange: function(v){ set({presetActiveColor:v}); },  label: 'Active Preset Text' },
                { value: a.breakdownBg,       onChange: function(v){ set({breakdownBg:v}); },        label: 'Breakdown Background' },
                { value: a.breakdownBorder,   onChange: function(v){ set({breakdownBorder:v}); },    label: 'Breakdown Border' },
                { value: a.labelColor,        onChange: function(v){ set({labelColor:v}); },         label: 'Label Color' },
                { value: a.inputBorder,       onChange: function(v){ set({inputBorder:v}); },        label: 'Input Border' },
                { value: a.titleColor,        onChange: function(v){ set({titleColor:v}); },         label: 'Title Color' },
                { value: a.subtitleColor,     onChange: function(v){ set({subtitleColor:v}); },      label: 'Subtitle Color' },
                { value: a.sectionBg,         onChange: function(v){ set({sectionBg:v}); },          label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title',    checked: a.showTitle,    onChange: function(v){ set({showTitle:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v){ set({showSubtitle:v}); } }),
                        el(TextControl,   { label: 'Title',    value: a.title,    onChange: function(v){ set({title:v}); } }),
                        el(TextControl,   { label: 'Subtitle', value: a.subtitle, onChange: function(v){ set({subtitle:v}); } })
                    ),
                    el(PanelBody, { title: 'Calculator Settings', initialOpen: true },
                        el(TextControl,   { label: 'Currency Symbol',  value: a.currencySymbol, onChange: function(v){ set({currencySymbol:v}); } }),
                        el(TextControl,   { label: 'Default Bill Amount', value: String(a.defaultBill),  onChange: function(v){ set({defaultBill:parseFloat(v)||0}); } }),
                        el(TextControl,   { label: 'Default Tip (%)',     value: String(a.defaultTip),   onChange: function(v){ set({defaultTip:parseFloat(v)||0}); } }),
                        el(TextControl,   { label: 'Default People',  value: String(a.defaultPeople),onChange: function(v){ set({defaultPeople:parseInt(v)||1}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Tip Presets',  checked: a.showTipPresets,  onChange: function(v){ set({showTipPresets:v}); } }),
                        a.showTipPresets && el(TextControl, { label: 'Tip Presets (comma-separated %)', value: a.tipPresets, onChange: function(v){ set({tipPresets:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Breakdown',     checked: a.showBreakdown,   onChange: function(v){ set({showBreakdown:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Round Up Per Person', checked: a.roundUp,         onChange: function(v){ set({roundUp:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Subtitle Typography', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { set({ subtitleTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Result Typography', 'blockenberg'), value: a.resultTypo || {}, onChange: function (v) { set({ resultTypo: v }); } }) : null
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius,    min: 0,  max: 40,  step: 1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Input Border Radius',value: a.inputRadius,   min: 0,  max: 24,  step: 1,  onChange: function(v){ set({inputRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',     value: a.maxWidth,      min: 300,max: 900, step: 10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)',   value: a.paddingTop,    min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)',value: a.paddingBottom, min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(SplitBillPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', { className: 'bkbg-sbc-app', 'data-opts': JSON.stringify({ titleTypo: a.titleTypo, subtitleTypo: a.subtitleTypo, resultTypo: a.resultTypo, title: a.title, subtitle: a.subtitle, showTitle: a.showTitle, showSubtitle: a.showSubtitle, currencySymbol: a.currencySymbol, defaultBill: a.defaultBill, defaultTip: a.defaultTip, defaultPeople: a.defaultPeople, showTipPresets: a.showTipPresets, tipPresets: a.tipPresets, showBreakdown: a.showBreakdown, roundUp: a.roundUp, accentColor: a.accentColor, cardBg: a.cardBg, resultBg: a.resultBg, resultColor: a.resultColor, presetBg: a.presetBg, presetColor: a.presetColor, presetActiveBg: a.presetActiveBg, presetActiveColor: a.presetActiveColor, breakdownBg: a.breakdownBg, breakdownBorder: a.breakdownBorder, labelColor: a.labelColor, inputBorder: a.inputBorder, titleColor: a.titleColor, subtitleColor: a.subtitleColor, sectionBg: a.sectionBg, cardRadius: a.cardRadius, inputRadius: a.inputRadius, maxWidth: a.maxWidth, paddingTop: a.paddingTop, paddingBottom: a.paddingBottom }) }));
        }
    });
}() );
