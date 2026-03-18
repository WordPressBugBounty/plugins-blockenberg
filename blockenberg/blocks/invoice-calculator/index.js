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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var DEFAULT_ITEMS = [
        { id: 1, desc: 'Website Design', qty: 1,  price: 1200 },
        { id: 2, desc: 'SEO Optimization', qty: 3, price: 150 },
        { id: 3, desc: 'Monthly Support', qty: 12, price: 80  }
    ];

    function uid() { return Date.now() + Math.random(); }
    function fmt(sym, n) { return sym + Number(n || 0).toFixed(2); }

    function InvoicePreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;
        var sym = a.currencySymbol || '$';
        var accent = a.accentColor || '#6c3fb5';

        var _items = useState(DEFAULT_ITEMS.map(function(i){ return Object.assign({},i); }));
        var items = _items[0]; var setItems = _items[1];
        var _tax  = useState(a.defaultTax || 10);      var tax = _tax[0]; var setTax = _tax[1];
        var _disc = useState(a.defaultDiscount || 0);  var disc = _disc[0]; var setDisc = _disc[1];
        var _invNo = useState('INV-001');               var invNo = _invNo[0]; var setInvNo = _invNo[1];

        var subtotal = items.reduce(function(s, i){ return s + (parseFloat(i.qty)||0) * (parseFloat(i.price)||0); }, 0);
        var discAmt  = subtotal * (parseFloat(disc)||0) / 100;
        var taxAmt   = (subtotal - discAmt) * (parseFloat(tax)||0) / 100;
        var total    = subtotal - discAmt + taxAmt;

        function updateItem(id, field, val) {
            setItems(items.map(function(it){ return it.id === id ? Object.assign({}, it, { [field]: val }) : it; }));
        }
        function addItem() {
            setItems([...items, { id: uid(), desc: '', qty: 1, price: 0 }]);
        }
        function removeItem(id) {
            setItems(items.filter(function(it){ return it.id !== id; }));
        }

        var thStyle = { padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.04em', color: a.headerColor || '#6c3fb5', background: a.headerBg || '#f5f3ff', border: 'none' };
        var tdStyle = { padding: '10px 12px', fontSize: '14px', color: a.labelColor, border: 'none', verticalAlign: 'middle' };

        function cellInput(val, onChange, type, width) {
            return el('input', { type: type || 'text', value: val, style: { width: width || '100%', padding: '6px 8px', border: '1.5px solid ' + (a.borderColor||'#e5e7eb'), borderRadius: (a.inputRadius||6) + 'px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }, onChange: function(e){ onChange(e.target.value); } });
        }

        return el('div', { style: { paddingTop: a.paddingTop+'px', paddingBottom: a.paddingBottom+'px', background: a.sectionBg||undefined } },
            el('div', { style: { background: a.cardBg, borderRadius: a.cardRadius+'px', padding: '36px 32px', maxWidth: a.maxWidth+'px', margin: '0 auto', boxShadow:'0 4px 24px rgba(0,0,0,0.09)' } },

                // Header row
                el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }},
                    el('div', null,
                        a.showTitle    && el('div', { className: 'bkbg-inv-title', style:{ color:a.titleColor, marginBottom:'4px' }}, a.title),
                        a.showSubtitle && el('div', { style:{ fontSize:'14px', color:a.subtitleColor }}, a.subtitle)
                    ),
                    a.showInvoiceNo && el('div', { style:{ textAlign:'right' }},
                        el('div', { style:{ fontSize:'12px', color:a.labelColor, fontWeight:600, marginBottom:'4px' }}, 'Invoice #'),
                        el('input', { value: invNo, style:{ border:'1.5px solid '+(a.borderColor||'#e5e7eb'), borderRadius:(a.inputRadius||6)+'px', padding:'5px 10px', fontSize:'14px', fontFamily:'inherit', outline:'none', width:'120px', textAlign:'right' }, onChange: function(e){ setInvNo(e.target.value); } })
                    )
                ),

                // From/To
                a.showFromTo && el('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'24px' }},
                    ['From', 'To'].map(function(lbl, i) {
                        return el('div', { key:lbl, style:{ padding:'14px 16px', background: a.headerBg || '#f5f3ff', borderRadius:(a.inputRadius||6)+'px' }},
                            el('div', { style:{ fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em', color:a.headerColor||accent, marginBottom:'6px' }}, lbl),
                            el('div', { style:{ fontSize:'14px', fontWeight:600, color:a.labelColor }}, i===0 ? a.fromName : a.toName)
                        );
                    })
                ),

                // Items table
                el('div', { style:{ overflowX:'auto', borderRadius:(a.inputRadius||6)+'px', border:'1.5px solid '+(a.borderColor||'#e5e7eb'), marginBottom:'16px' }},
                    el('table', { style:{ width:'100%', borderCollapse:'collapse' }},
                        el('thead', null, el('tr', null,
                            el('th', { style: Object.assign({}, thStyle, { width:'44%' }) }, 'Description'),
                            el('th', { style: Object.assign({}, thStyle, { width:'14%', textAlign:'center' }) }, 'Qty'),
                            el('th', { style: Object.assign({}, thStyle, { width:'20%', textAlign:'right' }) }, 'Price'),
                            el('th', { style: Object.assign({}, thStyle, { width:'18%', textAlign:'right' }) }, 'Total'),
                            el('th', { style: Object.assign({}, thStyle, { width:'4%' }) }, '')
                        )),
                        el('tbody', null,
                            items.map(function(it, idx) {
                                var rowBg = idx % 2 === 0 ? (a.rowOddBg||'#ffffff') : (a.rowEvenBg||'#f9fafb');
                                var lineTotal = (parseFloat(it.qty)||0) * (parseFloat(it.price)||0);
                                return el('tr', { key: String(it.id), style:{ background: rowBg }},
                                    el('td', { style: tdStyle }, cellInput(it.desc, function(v){ updateItem(it.id,'desc',v); })),
                                    el('td', { style: Object.assign({}, tdStyle, {textAlign:'center'}) }, cellInput(it.qty, function(v){ updateItem(it.id,'qty',v); }, 'number', '60px')),
                                    el('td', { style: Object.assign({}, tdStyle, {textAlign:'right'}) }, cellInput(it.price, function(v){ updateItem(it.id,'price',v); }, 'number', '80px')),
                                    el('td', { style: Object.assign({}, tdStyle, {textAlign:'right', fontWeight:600}) }, fmt(sym, lineTotal)),
                                    el('td', { style: Object.assign({}, tdStyle, {textAlign:'center'}) },
                                        el('button', { onClick: function(){ removeItem(it.id); }, style:{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'16px', lineHeight:1, padding:'2px 4px' }}, '×')
                                    )
                                );
                            })
                        )
                    )
                ),

                // Add row button
                el('button', { onClick: addItem, style:{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'1.5px dashed '+(a.borderColor||'#e5e7eb'), borderRadius:(a.inputRadius||6)+'px', padding:'8px 14px', color:accent, fontWeight:600, fontSize:'13px', cursor:'pointer', fontFamily:'inherit', width:'100%', justifyContent:'center', marginBottom:'20px' }},
                    '+ Add Line Item'
                ),

                // Totals panel
                el('div', { style:{ marginLeft:'auto', maxWidth:'280px' }},
                    el('div', { style:{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid '+(a.borderColor||'#e5e7eb'), fontSize:'14px', color:a.labelColor }},
                        el('span', null, 'Subtotal'), el('span', { style:{fontWeight:600} }, fmt(sym, subtotal))
                    ),
                    el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid '+(a.borderColor||'#e5e7eb'), fontSize:'14px', color:a.labelColor }},
                        el('span', null, 'Discount (%)'),
                        el('div', { style:{display:'flex', alignItems:'center', gap:'8px'}},
                            el('input', { type:'number',min:0,max:100,value:disc, onChange:function(e){setDisc(e.target.value);}, style:{width:'60px',padding:'4px 8px',border:'1.5px solid '+(a.borderColor||'#e5e7eb'),borderRadius:(a.inputRadius||6)+'px',fontSize:'13px',outline:'none',fontFamily:'inherit'} }),
                            el('span', { style:{fontWeight:600, color:'#ef4444'} }, '-' + fmt(sym, discAmt))
                        )
                    ),
                    el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid '+(a.borderColor||'#e5e7eb'), fontSize:'14px', color:a.labelColor }},
                        el('span', null, 'Tax (%)'),
                        el('div', { style:{display:'flex', alignItems:'center', gap:'8px'}},
                            el('input', { type:'number',min:0,max:100,value:tax, onChange:function(e){setTax(e.target.value);}, style:{width:'60px',padding:'4px 8px',border:'1.5px solid '+(a.borderColor||'#e5e7eb'),borderRadius:(a.inputRadius||6)+'px',fontSize:'13px',outline:'none',fontFamily:'inherit'} }),
                            el('span', { style:{fontWeight:600} }, '+' + fmt(sym, taxAmt))
                        )
                    ),
                    el('div', { style:{ display:'flex', justifyContent:'space-between', padding:'14px 16px', background: a.totalBg||accent, borderRadius:(a.inputRadius||6)+'px', marginTop:'8px', color:a.totalColor||'#fff' }},
                        el('span', { style:{fontSize:'15px', fontWeight:700} }, 'Total'),
                        el('span', { style:{fontSize:'20px', fontWeight:800} }, fmt(sym, total))
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/invoice-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(a.titleTypo, '--bkbg-inv-tt-'));
                return { style: s };
            })());
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){ set({accentColor:v}); },    label: 'Accent Color' },
                { value: a.cardBg,         onChange: function(v){ set({cardBg:v}); },          label: 'Card Background' },
                { value: a.headerBg,       onChange: function(v){ set({headerBg:v}); },        label: 'Table Header Background' },
                { value: a.headerColor,    onChange: function(v){ set({headerColor:v}); },     label: 'Table Header Text' },
                { value: a.rowOddBg,       onChange: function(v){ set({rowOddBg:v}); },        label: 'Row (Odd) Background' },
                { value: a.rowEvenBg,      onChange: function(v){ set({rowEvenBg:v}); },       label: 'Row (Even) Background' },
                { value: a.totalBg,        onChange: function(v){ set({totalBg:v}); },         label: 'Total Row Background' },
                { value: a.totalColor,     onChange: function(v){ set({totalColor:v}); },      label: 'Total Row Text' },
                { value: a.borderColor,    onChange: function(v){ set({borderColor:v}); },     label: 'Border Color' },
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
                    el(PanelBody, { title: 'Invoice Settings', initialOpen: true },
                        el(TextControl,   { label: 'Currency Symbol', value: a.currencySymbol, onChange: function(v){ set({currencySymbol:v}); } }),
                        el(TextControl,   { label: 'Default Tax (%)', value: String(a.defaultTax),      onChange: function(v){ set({defaultTax:parseFloat(v)||0}); } }),
                        el(TextControl,   { label: 'Default Discount (%)', value: String(a.defaultDiscount), onChange: function(v){ set({defaultDiscount:parseFloat(v)||0}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show From / To Info', checked: a.showFromTo,    onChange: function(v){ set({showFromTo:v}); } }),
                        a.showFromTo && el(TextControl, { label: 'From Name', value: a.fromName, onChange: function(v){ set({fromName:v}); } }),
                        a.showFromTo && el(TextControl, { label: 'To Name',   value: a.toName,   onChange: function(v){ set({toName:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Invoice Number', checked: a.showInvoiceNo, onChange: function(v){ set({showInvoiceNo:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: 'Title', value: a.titleTypo, onChange: function(v){ set({ titleTypo: v }); } })
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius,    min:0,  max:40,  step:1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Input Border Radius',value: a.inputRadius,   min:0,  max:20,  step:1,  onChange: function(v){ set({inputRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',     value: a.maxWidth,      min:320,max:900, step:10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)',   value: a.paddingTop,    min:0,  max:160, step:4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)',value: a.paddingBottom, min:0,  max:160, step:4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(InvoicePreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            var _tv = getTypoCssVars();
            var s = {};
            Object.assign(s, _tv(a.titleTypo, '--bkbg-inv-tt-'));
            return el('div', wp.blockEditor.useBlockProps.save({ style: s }), el('div', { className: 'bkbg-inv-app', 'data-opts': JSON.stringify(a) }));
        }
    });
}() );
