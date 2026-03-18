( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } = window.wp.components;
  var { __ } = window.wp.i18n;

  var POSITIONS = [
    {label:'Bottom Right',value:'bottom-right'},
    {label:'Bottom Left',value:'bottom-left'},
    {label:'Bottom Center',value:'bottom-center'},
  ];
  var ICONS = [
    {label:'Arrow Up',value:'arrow-up-alt2'},
    {label:'Chevron Up',value:'arrow-up-alt'},
    {label:'Upload',value:'upload'},
    {label:'Migrate',value:'migrate'},
    {label:'Sort',value:'sort'},
  ];

  function posStyle(position, offsetX, offsetY) {
    var s = {position:'fixed',bottom:offsetY+'px'};
    if (position==='bottom-right') s.right = offsetX+'px';
    else if (position==='bottom-left') s.left = offsetX+'px';
    else { s.left='50%'; s.transform='translateX(-50%)'; }
    return s;
  }

  function BtnPreview(a) {
    var btnStyle = Object.assign({
      width:a.btnSize+'px', height:a.btnSize+'px',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      background:a.btnBg, color:a.btnColor,
      borderRadius:a.btnRadius+'px',
      boxShadow:a.shadow?'0 4px 16px rgba(0,0,0,0.18)':'none',
      cursor:'pointer', border:'none', fontFamily:'inherit',
      gap:'6px', fontSize:'15px', fontWeight:700,
      flexDirection:'column',
    }, a.showLabel&&a.label?{height:'auto',padding:'10px 14px',flexDirection:'column'}:{});

    return el('div',{style:{padding:'24px',background:'#f3f4f6',borderRadius:'12px',minHeight:'80px',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px'}},
      el('p',{style:{margin:0,color:'#9ca3af',fontSize:'12px',textAlign:'center'}},__('Fixed position: ')+a.position+' (+'+a.offsetY+'px from '+(a.position==='bottom-right'?'right':'left')+')'),
      el('button',{style:btnStyle},
        el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:Math.round(a.btnSize*0.45)+'px',width:Math.round(a.btnSize*0.45)+'px',height:Math.round(a.btnSize*0.45)+'px',lineHeight:1}}),
        a.showLabel&&a.label&&el('span',{style:{fontSize:a.labelFontSize+'px',fontWeight:a.labelFontWeight,lineHeight:1,letterSpacing:'0.5px'}},a.label),
      ),
      a.pulsing&&el('p',{style:{margin:0,color:'#a855f7',fontSize:'12px'}},__('⚡ Pulsing ring enabled')),
    );
  }

  registerBlockType('blockenberg/scroll-to-top', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      return el('div',null,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Button'),initialOpen:true},
            el(SelectControl,{label:__('Icon'),value:a.icon,options:ICONS,onChange:v=>set({icon:v})}),
            el(ToggleControl,{label:__('Show Label'),checked:a.showLabel,onChange:v=>set({showLabel:v}),__nextHasNoMarginBottom:true}),
            a.showLabel&&el(TextControl,{label:__('Label Text'),value:a.label,onChange:v=>set({label:v})}),
            el(RangeControl,{label:__('Button Size (px)'),value:a.btnSize,min:32,max:80,onChange:v=>set({btnSize:v})}),
            el(RangeControl,{label:__('Border Radius (px)'),value:a.btnRadius,min:0,max:50,onChange:v=>set({btnRadius:v})}),
            el(ToggleControl,{label:__('Drop Shadow'),checked:a.shadow,onChange:v=>set({shadow:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Pulsing Ring'),checked:a.pulsing,onChange:v=>set({pulsing:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelBody,{title:__('Position & Behavior'),initialOpen:false},
            el(SelectControl,{label:__('Position'),value:a.position,options:POSITIONS,onChange:v=>set({position:v})}),
            a.position!=='bottom-center'&&el(RangeControl,{label:__('Horizontal Offset (px)'),value:a.offsetX,min:8,max:120,onChange:v=>set({offsetX:v})}),
            el(RangeControl,{label:__('Vertical Offset (px)'),value:a.offsetY,min:8,max:120,onChange:v=>set({offsetY:v})}),
            el(RangeControl,{label:__('Scroll Trigger (px)'),value:a.scrollTrigger,min:50,max:2000,onChange:v=>set({scrollTrigger:v})}),
            el(ToggleControl,{label:__('Smooth Scroll'),checked:a.smooth,onChange:v=>set({smooth:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Z-Index'),value:a.zIndex,min:100,max:99999,onChange:v=>set({zIndex:v})}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Button Background'),value:a.btnBg,onChange:v=>set({btnBg:v||'#6c3fb5'})},
            {label:__('Button Icon / Text'),value:a.btnColor,onChange:v=>set({btnColor:v||'#ffffff'})},
          ]}),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            el(RangeControl,{label:__('Label Font Size (px)'),value:a.labelFontSize,min:9,max:24,onChange:v=>set({labelFontSize:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Label Font Weight'),value:a.labelFontWeight,min:300,max:900,step:100,onChange:v=>set({labelFontWeight:v}),__nextHasNoMarginBottom:true}),
          ),
        ),
        BtnPreview(a),
      );
    },

    save: function({attributes:a}) {
      var btnStyle = {
        width:a.btnSize+'px',height:a.btnSize+'px',
        display:'inline-flex',alignItems:'center',justifyContent:'center',
        background:a.btnBg,color:a.btnColor,
        borderRadius:a.btnRadius+'px',
        boxShadow:a.shadow?'0 4px 16px rgba(0,0,0,0.18)':'none',
        cursor:'pointer',border:'none',fontFamily:'inherit',
        gap:'6px',flexDirection:a.showLabel&&a.label?'column':'row',
        padding:a.showLabel&&a.label?'10px 14px':undefined,
        height:a.showLabel&&a.label?'auto':undefined,
      };
      var posStyleObj = posStyle(a.position, a.offsetX, a.offsetY);
      var wrapStyle = Object.assign({},posStyleObj,{
        zIndex:a.zIndex, opacity:0, transform:(posStyleObj.transform||'')+' translateY(16px)',
        transition:'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents:'none',
      });
      return el('div',{className:'bkstt-wrap',
        'data-trigger':a.scrollTrigger,
        'data-smooth':a.smooth?'1':'0',
        'data-position':a.position,
        style:wrapStyle,
      },
        a.pulsing&&el('span',{className:'bkstt-pulse',style:{position:'absolute',inset:'-6px',borderRadius:a.btnRadius+'px',border:'2px solid '+a.btnBg,animation:'bksttPulse 1.8s ease-out infinite',opacity:0.6}}),
        el('button',{className:'bkstt-btn','aria-label':'Scroll to top',style:btnStyle},
          el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:Math.round(a.btnSize*0.45)+'px',width:Math.round(a.btnSize*0.45)+'px',height:Math.round(a.btnSize*0.45)+'px',lineHeight:1},"aria-hidden":"true"}),
          a.showLabel&&a.label&&el('span',{style:{fontSize:a.labelFontSize+'px',fontWeight:a.labelFontWeight,lineHeight:1,letterSpacing:'0.5px'}},a.label),
        ),
      );
    }
  });
}() );
