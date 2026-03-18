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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var v1Attributes = {
        title:           { type: 'string',  default: 'Recipe Scaler' },
        subtitle:        { type: 'string',  default: 'Adjust serving size and all ingredient quantities update automatically' },
        recipeName:      { type: 'string',  default: 'Classic Pancakes' },
        defaultServings: { type: 'number',  default: 4 },
        maxServings:     { type: 'number',  default: 24 },
        showQuickBtns:   { type: 'boolean', default: true },
        showNotes:       { type: 'boolean', default: true },
        recipeNotes:     { type: 'string',  default: 'Do not over-mix the batter \u2014 a few lumps are fine!' },
        accentColor:     { type: 'string',  default: '#f97316' },
        sectionBg:       { type: 'string',  default: '#fff7ed' },
        cardBg:          { type: 'string',  default: '#ffffff' },
        inputBg:         { type: 'string',  default: '#fafafa' },
        ingredientBg:    { type: 'string',  default: '#fef3c7' },
        titleColor:      { type: 'string',  default: '#111827' },
        subtitleColor:   { type: 'string',  default: '#6b7280' },
        labelColor:      { type: 'string',  default: '#374151' },
        titleFontSize:   { type: 'integer', default: 26 },
        contentMaxWidth: { type: 'integer', default: 660 },
        titleFontWeight: { type: 'integer', default: 700 },
        titleLineHeight: { type: 'number',  default: 1.2 }
    };

    var SAMPLE_INGREDIENTS = [
        { qty: 2,   unit: 'cups',   name: 'All-purpose flour' },
        { qty: 2,   unit: 'tsp',    name: 'Baking powder' },
        { qty: 0.5, unit: 'tsp',    name: 'Salt' },
        { qty: 2,   unit: 'tbsp',   name: 'Sugar' },
        { qty: 2,   unit: '',       name: 'Large eggs' },
        { qty: 1.5, unit: 'cups',   name: 'Milk' },
        { qty: 3,   unit: 'tbsp',   name: 'Butter, melted' }
    ];

    var QUICK_BTNS = [1, 2, 4, 6, 8, 12];

    function fmtQty(n) {
        if (n === Math.round(n)) return String(Math.round(n));
        var f = Math.round(n * 100) / 100;
        // nice fractions for common values
        var fracs = [[0.25,'¼'],[0.5,'½'],[0.75,'¾'],[0.33,'⅓'],[0.67,'⅔'],[0.125,'⅛']];
        var whole = Math.floor(f);
        var rem   = Math.round((f - whole) * 100) / 100;
        for (var i=0;i<fracs.length;i++) {
            if (Math.abs(rem - fracs[i][0]) < 0.01) {
                return (whole > 0 ? whole + ' ' : '') + fracs[i][1];
            }
        }
        return f.toFixed(2).replace(/\.?0+$/, '');
    }

    function EditorPreview(props) {
        var a       = props.attributes;
        var servings= a.defaultServings;
        var base    = a.defaultServings;

        var wrapStyle = {
            background: a.sectionBg, borderRadius:'14px', padding:'32px 24px',
            maxWidth: a.contentMaxWidth+'px', margin:'0 auto', fontFamily:'inherit', boxSizing:'border-box'
        };

        return el('div', { style: wrapStyle },
            el(RichText, { tagName:'h3', className:'bkbg-rsc-title', value:a.title, onChange:function(v){ props.setAttributes({title:v}); },
                style:{ color:a.titleColor, margin:'0 0 4px 0' }, placeholder:'Block title...' }),
            el(RichText, { tagName:'p', value:a.subtitle, onChange:function(v){ props.setAttributes({subtitle:v}); },
                style:{ fontSize:'14px', color:a.subtitleColor, margin:'0 0 20px 0' }, placeholder:'Subtitle...' }),

            // Recipe name
            el('div', { style:{ background:a.cardBg, borderRadius:'12px', padding:'14px 18px', border:'1.5px solid #e5e7eb', marginBottom:'18px', display:'flex', alignItems:'center', gap:'12px' } },
                el('span', { style:{ fontSize:'24px' } }, '🍽️'),
                el('span', { style:{ fontSize:'18px', fontWeight:'700', color:a.titleColor } }, a.recipeName || 'Recipe')
            ),

            // Servings control
            el('div', { style:{ background:a.cardBg, borderRadius:'12px', padding:'14px 18px', border:'1.5px solid #e5e7eb', marginBottom:'18px' } },
                el('div', { style:{ fontSize:'12px', fontWeight:'700', color:a.labelColor, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' } }, 'Servings'),
                el('div', { style:{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' } },
                    el('button', { style:{ width:'36px', height:'36px', borderRadius:'8px', border:'2px solid '+a.accentColor, background:'none', color:a.accentColor, fontSize:'20px', fontWeight:'700', cursor:'pointer' } }, '−'),
                    el('span', { style:{ fontSize:'28px', fontWeight:'700', color:a.accentColor, minWidth:'40px', textAlign:'center' } }, servings),
                    el('button', { style:{ width:'36px', height:'36px', borderRadius:'8px', border:'2px solid '+a.accentColor, background:'none', color:a.accentColor, fontSize:'20px', fontWeight:'700', cursor:'pointer' } }, '+'),
                    el('span', { style:{ fontSize:'14px', color:a.labelColor } }, 'servings')
                ),
                a.showQuickBtns && el('div', { style:{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'12px' } },
                    QUICK_BTNS.map(function(n) {
                        var active = n === servings;
                        return el('button', { key:n, style:{ padding:'5px 13px', borderRadius:'6px', border:'1.5px solid '+(active?a.accentColor:'#e5e7eb'), background:active?a.accentColor:'transparent', color:active?'#fff':a.labelColor, fontSize:'13px', fontWeight:active?'700':'400', cursor:'pointer' } }, n + 'x');
                    })
                )
            ),

            // Ingredients list preview
            el('div', { style:{ marginBottom:'16px' } },
                el('div', { style:{ fontSize:'12px', fontWeight:'700', color:a.labelColor, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' } }, 'Ingredients'),
                SAMPLE_INGREDIENTS.map(function(ing) {
                    var scaled = fmtQty(ing.qty * servings / base);
                    return el('div', { key:ing.name, style:{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 12px', background:a.ingredientBg, borderRadius:'8px', marginBottom:'6px' } },
                        el('span', { style:{ fontWeight:'700', color:a.accentColor, minWidth:'45px', fontSize:'15px' } }, scaled),
                        el('span', { style:{ color:'#6b7280', fontSize:'14px', minWidth:'38px' } }, ing.unit),
                        el('span', { style:{ flex:1, fontSize:'14px', color:a.labelColor } }, ing.name)
                    );
                }),
                el('div', { style:{ color:a.accentColor, fontSize:'13px', fontWeight:'600', marginTop:'8px', cursor:'pointer', opacity:0.7 } }, '+ Add ingredient (frontend)')
            ),

            // Notes
            a.showNotes && a.recipeNotes && el('div', { style:{ background:'#fef9c3', border:'1.5px solid #fde047', borderRadius:'10px', padding:'12px 16px' } },
                el('div', { style:{ fontSize:'12px', fontWeight:'700', color:'#854d0e', marginBottom:'4px' } }, '📝 Recipe Notes'),
                el('div', { style:{ fontSize:'13px', color:'#78350f' } }, a.recipeNotes)
            )
        );
    }

    registerBlockType('blockenberg/recipe-scaler', {
        edit: function(props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var TC  = getTypoControl();

            var colorSettings = [
                { value:a.accentColor,    onChange:function(v){ set({accentColor:    v||'#f97316'}); }, label:'Accent color'       },
                { value:a.sectionBg,      onChange:function(v){ set({sectionBg:      v||'#fff7ed'}); }, label:'Section background' },
                { value:a.cardBg,         onChange:function(v){ set({cardBg:         v||'#ffffff'}); }, label:'Card background'    },
                { value:a.inputBg,        onChange:function(v){ set({inputBg:        v||'#fafafa'}); }, label:'Input background'   },
                { value:a.ingredientBg,   onChange:function(v){ set({ingredientBg:   v||'#fef3c7'}); }, label:'Ingredient row bg'  },
                { value:a.titleColor,     onChange:function(v){ set({titleColor:     v||'#111827'}); }, label:'Title color'        },
                { value:a.subtitleColor,  onChange:function(v){ set({subtitleColor:  v||'#6b7280'}); }, label:'Subtitle color'     },
                { value:a.labelColor,     onChange:function(v){ set({labelColor:     v||'#374151'}); }, label:'Label color'        }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Recipe Settings', initialOpen:true },
                        el(TextControl,  { label:'Recipe Name',          value:a.recipeName,      onChange:function(v){ set({recipeName:v}); } }),
                        el(RangeControl, { label:'Default Servings',     value:a.defaultServings, min:1, max:24,  onChange:function(v){ set({defaultServings:v}); } }),
                        el(RangeControl, { label:'Maximum Servings',     value:a.maxServings,     min:4, max:100, onChange:function(v){ set({maxServings:v}); } }),
                        el(ToggleControl,{ __nextHasNoMarginBottom:true, label:'Show quick serving buttons', checked:a.showQuickBtns, onChange:function(v){ set({showQuickBtns:v}); } }),
                        el(ToggleControl,{ __nextHasNoMarginBottom:true, label:'Show recipe notes',          checked:a.showNotes,     onChange:function(v){ set({showNotes:v}); } }),
                        a.showNotes && el(TextControl, { label:'Recipe Notes', value:a.recipeNotes, onChange:function(v){ set({recipeNotes:v}); } })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max Width (px)',  value:a.contentMaxWidth, min:400, max:1100, step:20, onChange:function(v){ set({contentMaxWidth:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', useBlockProps((function() {
                    var _tvFn = getTypoCssVars();
                    var s = {};
                    if (_tvFn) Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrsc-tt-'));
                    return { style: s };
                })()),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-rsc-app',
                    'data-opts': JSON.stringify({
                        title:          a.title,
                        subtitle:       a.subtitle,
                        recipeName:     a.recipeName,
                        defaultServings:a.defaultServings,
                        maxServings:    a.maxServings,
                        showQuickBtns:  a.showQuickBtns,
                        showNotes:      a.showNotes,
                        recipeNotes:    a.recipeNotes,
                        accentColor:    a.accentColor,
                        sectionBg:      a.sectionBg,
                        cardBg:         a.cardBg,
                        inputBg:        a.inputBg,
                        ingredientBg:   a.ingredientBg,
                        titleColor:     a.titleColor,
                        subtitleColor:  a.subtitleColor,
                        labelColor:     a.labelColor,
                        titleTypo:      a.titleTypo || {},
                        contentMaxWidth:a.contentMaxWidth
                    })
                })
            );
        },

        deprecated: [{
            attributes: v1Attributes,
            save: function(props) {
                var a = props.attributes;
                return el('div', useBlockProps.save(),
                    el('div', {
                        className:   'bkbg-rsc-app',
                        'data-opts': JSON.stringify({
                            title:          a.title,
                            subtitle:       a.subtitle,
                            recipeName:     a.recipeName,
                            defaultServings:a.defaultServings,
                            maxServings:    a.maxServings,
                            showQuickBtns:  a.showQuickBtns,
                            showNotes:      a.showNotes,
                            recipeNotes:    a.recipeNotes,
                            accentColor:    a.accentColor,
                            sectionBg:      a.sectionBg,
                            cardBg:         a.cardBg,
                            inputBg:        a.inputBg,
                            ingredientBg:   a.ingredientBg,
                            titleColor:     a.titleColor,
                            subtitleColor:  a.subtitleColor,
                            labelColor:     a.labelColor,
                            titleFontSize:  a.titleFontSize,
                            contentMaxWidth:a.contentMaxWidth
                        })
                    })
                );
            }
        }]
    });
}() );
