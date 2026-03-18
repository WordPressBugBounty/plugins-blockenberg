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
    var Button            = wp.components.Button;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function parseItems(text, mode) {
        if (mode === 'comma') {
            return text.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
        }
        return text.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
    }

    function RandomPickerPreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;
        var accent = a.accentColor || '#6c3fb5';

        var _itemsText = useState(a.defaultItems || 'Alice\nBob\nCarol\nDave\nEve\nFrank');
        var itemsText = _itemsText[0]; var setItemsText = _itemsText[1];
        var _winner   = useState(null);   var winner = _winner[0]; var setWinner = _winner[1];
        var _highlight= useState(-1);     var highlight = _highlight[0]; var setHighlight = _highlight[1];
        var _history  = useState([]);     var history = _history[0]; var setHistory = _history[1];
        var _picking  = useState(false);  var picking = _picking[0]; var setPicking = _picking[1];

        var items = parseItems(itemsText, a.inputMode || 'lines');

        function pick() {
            if (items.length === 0 || picking) return;
            setPicking(true); setWinner(null);
            var steps = a.animSteps || 12;
            var speed = a.animSpeedMs || 60;
            var count = 0;
            function step() {
                var idx = Math.floor(Math.random() * items.length);
                setHighlight(idx);
                count++;
                if (count < steps) {
                    setTimeout(step, speed + count * 8);
                } else {
                    var finalIdx = Math.floor(Math.random() * items.length);
                    setHighlight(finalIdx);
                    setWinner(items[finalIdx]);
                    if (a.showHistory) setHistory(function(h){ return [items[finalIdx]].concat(h).slice(0,10); });
                    setPicking(false);
                }
            }
            step();
        }

        return el('div', { style:{ paddingTop:a.paddingTop+'px', paddingBottom:a.paddingBottom+'px', background:a.sectionBg||undefined } },
            el('div', { style:{ background:a.cardBg, borderRadius:a.cardRadius+'px', padding:'36px 32px', maxWidth:a.maxWidth+'px', margin:'0 auto', boxShadow:'0 4px 24px rgba(0,0,0,0.09)' }},

                (a.showTitle||a.showSubtitle) && el('div', { style:{marginBottom:'20px'}},
                    a.showTitle    && el('div', { className:'bkbg-rpk-title', style:{color:a.titleColor,marginBottom:'6px'} }, a.title),
                    a.showSubtitle && el('div', { className:'bkbg-rpk-subtitle', style:{color:a.subtitleColor} }, a.subtitle)
                ),

                // Items textarea
                el('div', { style:{marginBottom:'16px'} },
                    el('label', { style:{display:'block',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em',color:a.labelColor,marginBottom:'6px'} },
                        'Items (' + items.length + ')'
                    ),
                    el('textarea', {
                        rows: 6, value: itemsText,
                        style:{ width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:(a.itemRadius||8)+'px', fontSize:'14px', fontFamily:'monospace', resize:'vertical', outline:'none', boxSizing:'border-box' },
                        onChange: function(e){ setItemsText(e.target.value); setWinner(null); setHighlight(-1); }
                    })
                ),

                // Pick button
                el('button', {
                    onClick: pick,
                    disabled: picking || items.length === 0,
                    style:{ width:'100%', padding:'14px', borderRadius:(a.itemRadius||8)+'px', background: picking?'#9ca3af':accent, color:a.buttonColor||'#fff', border:'none', fontWeight:700, fontSize:'16px', cursor: items.length===0?'not-allowed':'pointer', fontFamily:'inherit', transition:'background .15s', marginBottom:'20px' }
                }, picking ? 'Picking…' : (a.buttonLabel||'Pick Random!')),

                // Item grid
                items.length > 0 && el('div', { style:{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'20px'} },
                    items.map(function(item, idx) {
                        var isWin = winner === item && highlight === idx;
                        var isHi  = highlight === idx && !winner;
                        return el('div', { key: String(idx) + item, style:{
                            padding:'8px 14px', borderRadius:(a.itemRadius||8)+'px', fontSize:'14px', fontWeight: isWin?700:500,
                            background: isWin ? (a.winnerBg||accent) : isHi ? (a.highlightBg||'#ede9fe') : (a.itemBg||'#f5f3ff'),
                            color: isWin ? (a.winnerColor||'#fff') : (a.itemColor||'#374151'),
                            transition:'background .1s,color .1s', cursor:'default'
                        }}, item);
                    })
                ),

                // Winner box
                winner && el('div', { style:{ background:a.winnerBg||accent, borderRadius:(a.itemRadius||8)+'px', padding:'20px', textAlign:'center', marginBottom:'16px' }},
                    el('div', { style:{fontSize:'13px',fontWeight:600,color:a.winnerColor||'#fff',opacity:.8,marginBottom:'6px'} }, '🎉 Winner!'),
                    el('div', { className:'bkbg-rpk-winner-text', style:{color:a.winnerColor||'#fff'} }, winner)
                ),

                // History
                a.showHistory && history.length > 0 && el('div', { style:{background:a.historyBg||'#f9fafb',borderRadius:(a.itemRadius||8)+'px',padding:'14px 16px'} },
                    el('div', { style:{fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',color:a.labelColor,marginBottom:'8px'} }, 'Pick History'),
                    el('div', { style:{display:'flex',flexWrap:'wrap',gap:'6px'} },
                        history.map(function(h, i) {
                            return el('span', { key:String(i)+h, style:{padding:'4px 10px',background:'#ffffff',borderRadius:'100px',fontSize:'13px',color:a.historyColor||'#6b7280',fontWeight:500,border:'1px solid #e5e7eb'} }, h);
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/random-picker', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrpk-tt-'));
                    Object.assign(s, _tvFn(a.subtitleTypo || {}, '--bkrpk-st-'));
                    Object.assign(s, _tvFn(a.winnerTypo || {}, '--bkrpk-wn-'));
                }
                return { style: s };
            })());
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){ set({accentColor:v}); },    label: 'Accent / Button' },
                { value: a.cardBg,         onChange: function(v){ set({cardBg:v}); },          label: 'Card Background' },
                { value: a.winnerBg,       onChange: function(v){ set({winnerBg:v}); },        label: 'Winner Background' },
                { value: a.winnerColor,    onChange: function(v){ set({winnerColor:v}); },     label: 'Winner Text' },
                { value: a.itemBg,         onChange: function(v){ set({itemBg:v}); },          label: 'Item Chip Background' },
                { value: a.itemColor,      onChange: function(v){ set({itemColor:v}); },       label: 'Item Chip Text' },
                { value: a.highlightBg,    onChange: function(v){ set({highlightBg:v}); },     label: 'Highlight Background' },
                { value: a.historyBg,      onChange: function(v){ set({historyBg:v}); },       label: 'History Background' },
                { value: a.historyColor,   onChange: function(v){ set({historyColor:v}); },    label: 'History Text' },
                { value: a.labelColor,     onChange: function(v){ set({labelColor:v}); },      label: 'Label Color' },
                { value: a.titleColor,     onChange: function(v){ set({titleColor:v}); },      label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v){ set({subtitleColor:v}); },   label: 'Subtitle Color' },
                { value: a.sectionBg,      onChange: function(v){ set({sectionBg:v}); },       label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title',    checked: a.showTitle,    onChange: function(v){ set({showTitle:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v){ set({showSubtitle:v}); } }),
                        el(TextControl, { label: 'Title',    value: a.title,    onChange: function(v){ set({title:v}); } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function(v){ set({subtitle:v}); } })
                    ),
                    el(PanelBody, { title: 'Picker Settings', initialOpen: true },
                        el(TextControl,   { label: 'Button Label', value: a.buttonLabel, onChange: function(v){ set({buttonLabel:v}); } }),
                        el(SelectControl, { label: 'Item Separator', value: a.inputMode, options:[{label:'One Per Line',value:'lines'},{label:'Comma Separated',value:'comma'}], onChange: function(v){ set({inputMode:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Allow Re-pick', checked: a.allowRepick, onChange: function(v){ set({allowRepick:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Pick History', checked: a.showHistory, onChange: function(v){ set({showHistory:v}); } }),
                        el(RangeControl,  { label: 'Animation Steps', value: a.animSteps,   min:4, max:30, step:1, onChange: function(v){ set({animSteps:v}); } }),
                        el(RangeControl,  { label: 'Animation Speed (ms)', value: a.animSpeedMs, min:20, max:200, step:10, onChange: function(v){ set({animSpeedMs:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } }),
                        TC && el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function(v) { set({ subtitleTypo: v }); } }),
                        TC && el(TC, { label: __('Winner', 'blockenberg'), value: a.winnerTypo || {}, onChange: function(v) { set({ winnerTypo: v }); } })
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Card Border Radius',value: a.cardRadius,    min:0,  max:40,  step:1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Item Border Radius', value: a.itemRadius,   min:0,  max:24,  step:1,  onChange: function(v){ set({itemRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',    value: a.maxWidth,      min:300,max:900, step:10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)',  value: a.paddingTop,    min:0,  max:160, step:4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)',value: a.paddingBottom, min:0, max:160, step:4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(RandomPickerPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', { className: 'bkbg-rpk-app', 'data-opts': JSON.stringify(a) }));
        }
    });
}() );
