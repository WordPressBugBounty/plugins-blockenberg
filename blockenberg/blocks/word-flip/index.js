( function () {
    var el = React.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'headingTypo', attrs, '--bkwf-hd-');
        return v;
    }
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;

    var FLIP_MODES = [
        { value: 'roll',      label: 'Roll — slides up continuously' },
        { value: 'flip-3d',   label: 'Flip 3D — rotateX perspective' },
        { value: 'fade-up',   label: 'Fade + Slide Up' },
        { value: 'zoom',      label: 'Zoom In' }
    ];

    var UNDERLINES = [
        { value: 'none',      label: 'None' },
        { value: 'solid',     label: 'Solid Line' },
        { value: 'wavy',      label: 'Wavy' },
        { value: 'dashed',    label: 'Dashed' },
        { value: 'highlight', label: 'Highlight Block' }
    ];

    var TAGS = ['h1','h2','h3','h4','h5','h6','p'].map(function(t){ return { value: t, label: t.toUpperCase() }; });

    function WordFlipPreview(props) {
        var attr = props.attr;
        var words = (attr.words && attr.words.length) ? attr.words : ['designers'];
        var _s = React.useState(0);
        var idx = _s[0]; var setIdx = _s[1];

        React.useEffect(function () {
            var t = setInterval(function () { setIdx(function(i){ return (i+1)%words.length; }); }, attr.interval || 2200);
            return function(){ clearInterval(t); };
        }, [words.length, attr.interval]);

        var flipStyle = {
            display: 'inline-block',
            color: attr.flipColor || '#7c3aed',
            backgroundColor: attr.flipBg || 'transparent',
            borderRadius: (attr.flipBorderRadius || 4) + 'px',
            padding: '0 ' + (attr.flipPaddingH || 8) + 'px',
            marginLeft: '0.25em',
            transition: 'all 0.35s ease',
            textDecoration: attr.underlineStyle !== 'none' && attr.underlineStyle !== 'highlight' ? 'underline' : 'none',
            textDecorationStyle: attr.underlineStyle !== 'none' && attr.underlineStyle !== 'highlight' ? attr.underlineStyle : undefined,
            textDecorationColor: attr.underlineColor || '#7c3aed'
        };

        return el('div', {
            style: {
                padding: (attr.paddingV||32)+'px '+(attr.paddingH||24)+'px',
                backgroundColor: attr.showBg ? (attr.bgColor||'#fff') : 'transparent',
                borderRadius: (attr.borderRadius||0)+'px',
                textAlign: attr.textAlign||'center'
            }
        },
            el(attr.tag||'h2', {
                className: 'bkbg-wf-heading',
                style: { margin:0, padding:0, color:attr.staticColor||'#0f172a' }
            },
                attr.staticBefore && el('span', null, attr.staticBefore),
                el('span', { style: flipStyle }, words[idx]),
                attr.staticAfter && el('span', null, ' '+attr.staticAfter)
            )
        );
    }

    registerBlockType('blockenberg/word-flip', {
        title: 'Word Flip',
        icon: 'sort',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;

            function updateWord(i, val){ var w=attr.words.slice(); w[i]=val; setAttr({words:w}); }
            function addWord(){ setAttr({words:attr.words.concat(['new'])}); }
            function removeWord(i){ var w=attr.words.slice(); w.splice(i,1); setAttr({words:w}); }

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Words List', initialOpen:true },
                        el('p',{style:{fontSize:12,color:'#6b7280',margin:'0 0 8px'}},'Words that flip into the heading:'),
                        attr.words.map(function(w,i) {
                            return el('div',{key:i,style:{display:'flex',gap:6,marginBottom:6}},
                                el(TextControl,{__nextHasNoMarginBottom:true,value:w,onChange:function(v){updateWord(i,v);}}),
                                el(Button,{variant:'tertiary',isSmall:true,isDestructive:true,onClick:function(){removeWord(i);},disabled:attr.words.length<=1},'✕')
                            );
                        }),
                        el(Button,{variant:'secondary',isSmall:true,onClick:addWord,style:{marginTop:4}},'+ Add Word')
                    ),
                    el(PanelBody, { title:'Static Text', initialOpen:false },
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Before',value:attr.staticBefore,onChange:function(v){setAttr({staticBefore:v});}}),
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'After',value:attr.staticAfter,onChange:function(v){setAttr({staticAfter:v});}})
                    ),
                    el(PanelBody, { title:'Animation', initialOpen:true },
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Flip Mode',value:attr.flipMode,options:FLIP_MODES,onChange:function(v){setAttr({flipMode:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Interval (ms)',value:attr.interval,min:500,max:8000,step:100,onChange:function(v){setAttr({interval:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Flip Speed (ms)',value:attr.flipSpeed,min:100,max:1200,step:20,onChange:function(v){setAttr({flipSpeed:v});}})
                    ),
                    el(PanelBody, { title:'Typography', initialOpen:false },
                        getTypoControl('Heading', 'headingTypo', attr, setAttr),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'HTML Tag',value:attr.tag,options:TAGS,onChange:function(v){setAttr({tag:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Text Align',value:attr.textAlign,options:[{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}],onChange:function(v){setAttr({textAlign:v});}})
                    ),
                    el(PanelBody, { title:'Flip Word Style', initialOpen:false },
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Underline / Decoration',value:attr.underlineStyle,options:UNDERLINES,onChange:function(v){setAttr({underlineStyle:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Horizontal (px)',value:attr.flipPaddingH,min:0,max:40,onChange:function(v){setAttr({flipPaddingH:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Border Radius (px)',value:attr.flipBorderRadius,min:0,max:40,onChange:function(v){setAttr({flipBorderRadius:v});}})
                    ),
                    el(PanelBody, { title:'Background', initialOpen:false },
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Background',checked:attr.showBg,onChange:function(v){setAttr({showBg:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding V (px)',value:attr.paddingV,min:0,max:120,onChange:function(v){setAttr({paddingV:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding H (px)',value:attr.paddingH,min:0,max:120,onChange:function(v){setAttr({paddingH:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Block Radius (px)',value:attr.borderRadius,min:0,max:60,onChange:function(v){setAttr({borderRadius:v});}})
                    ),
                    el(PanelColorSettings, {
                        title:'Colors', initialOpen: false,
                        colorSettings:[
                            {value:attr.staticColor,onChange:function(v){setAttr({staticColor:v||'#0f172a'});},label:'Static Text'},
                            {value:attr.flipColor,  onChange:function(v){setAttr({flipColor:  v||'#7c3aed'});},label:'Flip Word Color'},
                            {value:attr.flipBg,     onChange:function(v){setAttr({flipBg:     v||''       });},label:'Flip Word Background'},
                            {value:attr.underlineColor,onChange:function(v){setAttr({underlineColor:v||'#7c3aed'});},label:'Decoration Color'},
                            attr.showBg && {value:attr.bgColor,onChange:function(v){setAttr({bgColor:v||'#fff'});},label:'Block Background'}
                        ].filter(Boolean)
                    })
                ),
                el('div', useBlockProps({ style: getTypoCssVars(attr) }), el(WordFlipPreview, {attr:attr}))
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save({ style: getTypoCssVars(props.attributes) }),
                el('div', { className:'bkbg-wf-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });
}() );
