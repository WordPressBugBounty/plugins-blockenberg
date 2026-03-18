( function () {
    var el = React.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var COLOR_MODES = [
        { value: 'gradient', label: 'Gradient (depth-based)' },
        { value: 'solid',    label: 'Solid color' },
        { value: 'multi',    label: 'Multi-color (random)' }
    ];

    /** Place N items on a sphere using Fibonacci spiral */
    function fibonacciSphere(n, r) {
        var points = [];
        var phi = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < n; i++) {
            var y = 1 - (i / (n - 1)) * 2;
            var radius = Math.sqrt(1 - y * y);
            var theta = phi * i;
            points.push({
                x: Math.cos(theta) * radius * r,
                y: y * r,
                z: Math.sin(theta) * radius * r
            });
        }
        return points;
    }

    function CloudPreview(props) {
        var a = props.attr;
        var items = a.items || [];
        var r = a.cloudRadius || 220;
        var pts = fibonacciSphere(items.length, r);
        var perspective = a.perspective || 900;

        return el('div', {
            style: { position:'relative', width:'100%', height:(a.cloudHeight||500)+'px', background:a.showBackground && a.bgColor ? a.bgColor : 'transparent', overflow:'hidden', borderRadius:12 }
        },
            el('div', {
                style: { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }
            },
                items.map(function(item, i) {
                    var pt = pts[i] || {x:0,y:0,z:0};
                    var cx = 0, cy = 0;
                    var persp = perspective / (perspective - pt.z);
                    var x2d = pt.x * persp + cx;
                    var y2d = pt.y * persp + cy;
                    var depth = (pt.z + r) / (2 * r); /* 0=back 1=front */
                    var opacity = a.depthFade ? (0.3 + depth * 0.7) : 1;
                    var scale = 0.6 + depth * 0.6;
                    var color = a.colorMode === 'gradient'
                        ? lerpColor(a.colorFrom||'#7c3aed', a.colorTo||'#ec4899', depth)
                        : a.colorFrom||'#7c3aed';

                    return el('div', {
                        key:i,
                        style: {
                            position:'absolute',
                            left:'50%', top:'50%',
                            transform:'translate(-50%,-50%) translate('+x2d+'px,'+y2d+'px) scale('+scale+')',
                            opacity:opacity,
                            background:a.itemBg||'#1e1b4b',
                            border:'1px solid '+(a.itemBorder||'#7c3aed44'),
                            color:color,
                            fontSize:(a.fontSize||14)+'px',
                            fontWeight:a.fontWeight||'600',
                            lineHeight:a.lineHeight||1.4,
                            padding:(a.itemPadding||6)+'px '+(((a.itemPadding||6)+6))+'px',
                            borderRadius:(a.itemBorderRadius||6)+'px',
                            whiteSpace:'nowrap',
                            cursor:'default',
                            userSelect:'none',
                            zIndex:Math.round(depth*100)
                        }
                    }, item);
                })
            )
        );
    }

    function lerpColor(a, b, t) {
        if (!a || !b) return a||b||'#fff';
        var ah = a.replace('#',''), bh = b.replace('#','');
        var ar=parseInt(ah.substr(0,2),16), ag=parseInt(ah.substr(2,2),16), ab2=parseInt(ah.substr(4,2),16);
        var br=parseInt(bh.substr(0,2),16), bg=parseInt(bh.substr(2,2),16), bb2=parseInt(bh.substr(4,2),16);
        var rr=Math.round(ar+(br-ar)*t), rg=Math.round(ag+(bg-ag)*t), rb2=Math.round(ab2+(bb2-ab2)*t);
        return 'rgba('+rr+','+rg+','+rb2+',1)';
    }

    registerBlockType('blockenberg/icon-cloud', {
        title: 'Icon Cloud',
        icon: 'cloud',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;

            function updateItem(i, val) {
                var arr = (attr.items||[]).slice(); arr[i] = val; setAttr({items:arr});
            }
            function addItem() { setAttr({items:(attr.items||[]).concat(['New Item'])}); }
            function removeItem(i) { setAttr({items:(attr.items||[]).filter(function(_,j){return j!==i;})}); }

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Items', initialOpen:true},
                        (attr.items||[]).map(function(item, i){
                            return el('div',{key:i,style:{display:'flex',gap:8,marginBottom:4,alignItems:'center'}},
                                el(TextControl,{__nextHasNoMarginBottom:true,value:item,onChange:function(v){updateItem(i,v);},style:{flex:1}}),
                                el(Button,{variant:'tertiary',isSmall:true,isDestructive:true,onClick:function(){removeItem(i);}},'✕')
                            );
                        }),
                        el(Button,{variant:'secondary',isSmall:true,style:{marginTop:4},onClick:addItem},'+ Add Item')
                    ),
                    el(PanelBody, {title:'Cloud Shape', initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Cloud Radius (px)',value:attr.cloudRadius,min:100,max:500,onChange:function(v){setAttr({cloudRadius:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Container Height (px)',value:attr.cloudHeight,min:200,max:900,onChange:function(v){setAttr({cloudHeight:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Perspective (px)',value:attr.perspective,min:300,max:2000,onChange:function(v){setAttr({perspective:v});}})
                    ),
                    el(PanelBody, {title:'Animation', initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Auto-Rotate X Speed',value:attr.autoRotateX,min:0,max:0.02,step:0.001,onChange:function(v){setAttr({autoRotateX:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Auto-Rotate Y Speed',value:attr.autoRotateY,min:0,max:0.02,step:0.001,onChange:function(v){setAttr({autoRotateY:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Mouse Interaction',checked:attr.mouseEffect,onChange:function(v){setAttr({mouseEffect:v});}}),
                        attr.mouseEffect && el(RangeControl,{__nextHasNoMarginBottom:true,label:'Mouse Strength',value:attr.mouseStrength,min:0.01,max:0.2,step:0.01,onChange:function(v){setAttr({mouseStrength:v});}})
                    ),
                    el(PanelBody, {title:'Item Style', initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding (px)',value:attr.itemPadding,min:2,max:20,onChange:function(v){setAttr({itemPadding:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Border Radius (px)',value:attr.itemBorderRadius,min:0,max:50,onChange:function(v){setAttr({itemBorderRadius:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Depth Fade',checked:attr.depthFade,onChange:function(v){setAttr({depthFade:v});}})
                    ),
                    el(PanelBody, {title:'Background', initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Background',checked:attr.showBackground,onChange:function(v){setAttr({showBackground:v});}})
                    ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: 'Item Text', typo: attr.itemTypo || {}, onChange: function(v){ setAttr({ itemTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title:'Colors',initialOpen:false,
                        colorSettings:[
                            {value:attr.colorFrom,  onChange:function(v){setAttr({colorFrom:v||'#7c3aed'});},label:'Color From (front)'},
                            {value:attr.colorTo,    onChange:function(v){setAttr({colorTo:v||'#ec4899'});},label:'Color To (back)'},
                            {value:attr.itemBg,     onChange:function(v){setAttr({itemBg:v||'#1e1b4b'});},label:'Item Background'},
                            {value:attr.textColor,  onChange:function(v){setAttr({textColor:v||'#e2e8f0'});},label:'Text (solid mode)'},
                            {value:attr.hoverBg,    onChange:function(v){setAttr({hoverBg:v||'#7c3aed'});},label:'Hover Background'},
                            {value:attr.hoverColor, onChange:function(v){setAttr({hoverColor:v||'#ffffff'});},label:'Hover Text'},
                            attr.showBackground && {value:attr.bgColor, onChange:function(v){setAttr({bgColor:v||'#000'});},label:'Section Background'}
                        ].filter(Boolean)
                    })
                ),
                el('div', useBlockProps(), el(CloudPreview, {attr:attr}))
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className:'bkbg-ic-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });
}() );
