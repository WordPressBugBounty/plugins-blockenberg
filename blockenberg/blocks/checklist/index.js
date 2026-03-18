( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;
    var Button             = wp.components.Button;

    var EMOJI_POOL = ['✅','📌','🔖','⭐','💡','🎯','📝','🔑','🏆','💎','🌟','🔥'];

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

    function EditorPreview(props) {
        var a   = props.attributes;
        var set = props.setAttributes;
        var items = a.items || [];
        var total = items.length;
        var done  = items.filter(function (i) { return i.done; }).length;
        var pct   = total ? Math.round((done / total) * 100) : 0;

        var wrapStyle = Object.assign({
            background:  a.sectionBg,
            borderRadius:'16px',
            padding:     '32px 24px',
            maxWidth:    a.contentMaxWidth + 'px',
            margin:      '0 auto',
            fontFamily:  'inherit',
            boxSizing:   'border-box'
        }, _tv(a.typoTitle, '--bkbg-cl-tt-'), _tv(a.typoItem, '--bkbg-cl-it-'));

        function toggleItem(id) {
            set({ items: items.map(function (i) { return i.id === id ? Object.assign({}, i, { done: !i.done }) : i; }) });
        }
        function removeItem(id) {
            set({ items: items.filter(function (i) { return i.id !== id; }) });
        }
        function addItem() {
            var next = { id:genId(), text:'New item', done:false, icon:EMOJI_POOL[items.length % EMOJI_POOL.length] };
            set({ items: items.concat([next]) });
        }
        function updateText(id, txt) {
            set({ items: items.map(function (i) { return i.id === id ? Object.assign({}, i, { text: txt }) : i; }) });
        }

        return el('div', { style: wrapStyle },
            a.showTitle && el(RichText, {
                tagName:'h3', value:a.title,
                className:'bkbg-cl-title',
                onChange:function(v){ set({title:v}); },
                style: { color:a.titleColor, margin:'0 0 5px 0' },
                placeholder:'Checklist title…'
            }),
            a.showSubtitle && el(RichText, {
                tagName:'p', value:a.subtitle,
                onChange:function(v){ set({subtitle:v}); },
                style: { fontSize:'14px', color:a.subtitleColor, margin:'0 0 16px 0' },
                placeholder:'Subtitle…'
            }),

            // Progress bar
            a.showProgress && el('div', { style:{ marginBottom:'18px' } },
                el('div', { style:{ display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:'600', color:a.labelColor, marginBottom:'6px' } },
                    el('span', null, 'Progress'),
                    el('span', { style:{ color:a.accentColor } }, pct + '% (' + done + '/' + total + ')')
                ),
                el('div', { style:{ height:'8px', borderRadius:'10px', background:a.progressBg, overflow:'hidden' } },
                    el('div', { style:{ height:'100%', width:pct+'%', background:a.accentColor, borderRadius:'10px', transition:'width .3s' } })
                )
            ),

            // Items
            el('div', { style:{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' } },
                items.map(function (item) {
                    return el('div', { key:item.id, className:'bkbg-cl-item'+(item.done?' is-done':''),
                        style:{ display:'flex', alignItems:'center', gap:'10px', background:item.done?a.sectionBg:a.itemBg, borderRadius:'10px', padding:'10px 14px', border:'1.5px solid '+(item.done?a.accentColor:'#e5e7eb'), transition:'all .15s' } },
                        // Checkbox
                        el('button', {
                            onClick: function () { toggleItem(item.id); },
                            style:{ width:'22px', height:'22px', borderRadius:a.checkStyle==='square'?'5px':'50%', border:'2px solid '+(item.done?a.accentColor:'#d1d5db'), background:item.done?a.accentColor:'transparent', color:a.checkColor, fontSize:'13px', cursor:'pointer', flexShrink:'0', display:'flex', alignItems:'center', justifyContent:'center' }
                        }, item.done ? '✓' : ''),
                        el('span', { style:{ fontSize:'16px', flexShrink:'0' } }, item.icon),
                        el('input', {
                            type:'text', value:item.text,
                            className:'bkbg-cl-text',
                            onChange:function(e){ updateText(item.id, e.target.value); },
                            style:{ flex:'1', border:'none', background:'transparent', color:item.done?a.doneTextColor:a.labelColor, outline:'none' }
                        }),
                        a.allowDelete && el('button', {
                            onClick: function () { removeItem(item.id); },
                            style:{ background:'none', border:'none', color:'#d1d5db', cursor:'pointer', fontSize:'16px', padding:'0', lineHeight:'1', flexShrink:'0' }
                        }, '×')
                    );
                })
            ),

            // Add item button
            a.showAddItem && el('button', {
                onClick: addItem,
                style:{ width:'100%', padding:'10px', borderRadius:'10px', border:'2px dashed '+a.accentColor, background:'transparent', color:a.accentColor, fontWeight:'600', fontSize:'14px', cursor:'pointer' }
            }, '+ Add item')
        );
    }

    registerBlockType('blockenberg/checklist', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { value:a.accentColor,   onChange:function(v){set({accentColor:   v||'#10b981'});}, label:'Accent / progress color' },
                { value:a.checkColor,    onChange:function(v){set({checkColor:    v||'#ffffff'});}, label:'Checkmark color'          },
                { value:a.doneTextColor, onChange:function(v){set({doneTextColor: v||'#9ca3af'});}, label:'Done item text color'     },
                { value:a.progressBg,   onChange:function(v){set({progressBg:    v||'#d1fae5'});}, label:'Progress bar background'  },
                { value:a.sectionBg,    onChange:function(v){set({sectionBg:     v||'#f0fdf4'});}, label:'Section background'       },
                { value:a.cardBg,       onChange:function(v){set({cardBg:        v||'#ffffff'});}, label:'Card background'          },
                { value:a.itemBg,       onChange:function(v){set({itemBg:        v||'#f9fafb'});}, label:'Item background'          },
                { value:a.titleColor,   onChange:function(v){set({titleColor:    v||'#111827'});}, label:'Title color'              },
                { value:a.subtitleColor,onChange:function(v){set({subtitleColor: v||'#6b7280'});}, label:'Subtitle color'           },
                { value:a.labelColor,   onChange:function(v){set({labelColor:    v||'#374151'});}, label:'Label color'              }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Checklist Settings', initialOpen:true },
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show title',       checked:a.showTitle,     onChange:function(v){set({showTitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show subtitle',    checked:a.showSubtitle,  onChange:function(v){set({showSubtitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show progress bar',checked:a.showProgress,  onChange:function(v){set({showProgress:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Allow adding items',checked:a.showAddItem,  onChange:function(v){set({showAddItem:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Allow deleting items',checked:a.allowDelete,onChange:function(v){set({allowDelete:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Remember checked state (localStorage)',checked:a.rememberState,onChange:function(v){set({rememberState:v});} }),
                        el(SelectControl, {
                            label:'Checkbox style',
                            value:a.checkStyle,
                            options:[ {label:'Circle',value:'circle'}, {label:'Square',value:'square'} ],
                            onChange:function(v){set({checkStyle:v});}
                        })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max width (px)',  value:a.contentMaxWidth, min:320, max:1000, step:20, onChange:function(v){set({contentMaxWidth:v});} })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Item', 'blockenberg'), value: a.typoItem, onChange: function (v) { set({ typoItem: v }); } })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', useBlockProps(),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-cl-app',
                    'data-opts': JSON.stringify({
                        title:          a.title,
                        subtitle:       a.subtitle,
                        showTitle:      a.showTitle,
                        showSubtitle:   a.showSubtitle,
                        showProgress:   a.showProgress,
                        showAddItem:    a.showAddItem,
                        allowDelete:    a.allowDelete,
                        rememberState:  a.rememberState,
                        checkStyle:     a.checkStyle,
                        items:          a.items,
                        accentColor:    a.accentColor,
                        checkColor:     a.checkColor,
                        doneTextColor:  a.doneTextColor,
                        progressBg:     a.progressBg,
                        sectionBg:      a.sectionBg,
                        cardBg:         a.cardBg,
                        itemBg:         a.itemBg,
                        titleColor:     a.titleColor,
                        subtitleColor:  a.subtitleColor,
                        labelColor:     a.labelColor,
                        titleFontSize:  a.titleFontSize,
                        titleFontWeight: a.titleFontWeight,
                        titleLineHeight: a.titleLineHeight,
                        itemFontSize:   a.itemFontSize,
                        itemFontWeight: a.itemFontWeight,
                        typoTitle:      a.typoTitle,
                        typoItem:       a.typoItem,
                        contentMaxWidth:a.contentMaxWidth
                    })
                })
            );
        }
    });
}() );
