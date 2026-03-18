( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _fctaTC, _fctaTV;
  function _tc() { return _fctaTC || (_fctaTC = window.bkbgTypographyControl); }
  function _tv() { return _fctaTV || (_fctaTV = window.bkbgTypoCssVars); }

  var POSITIONS = [
    {label:'Bottom Right',value:'bottom-right'},
    {label:'Bottom Left',value:'bottom-left'},
    {label:'Bottom Center',value:'bottom-center'},
    {label:'Top Right',value:'top-right'},
    {label:'Top Left',value:'top-left'},
  ];
  var ICONS = ['megaphone','admin-comments','email-alt','phone','format-chat','tickets-alt','cart','heart','star-filled','arrow-right-alt'].map(i=>({label:i,value:i}));

  function BtnPreview(a) {
    var btnStyle = {
      display:'inline-flex', alignItems:'center', gap:'8px',
      background:a.btnBg, color:a.btnColor,
      padding:a.paddingY+'px '+a.paddingX+'px',
      borderRadius:a.btnRadius+'px',
      boxShadow:a.btnShadow?'0 8px 24px rgba(0,0,0,0.2)':'none',
      textDecoration:'none', cursor:'pointer',
    };
    return el('a',{className:'bkfcta-btn',href:a.url,style:btnStyle},
      a.showIcon&&el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:a.iconSize+'px',width:a.iconSize+'px',height:a.iconSize+'px',lineHeight:1}}),
      a.showLabel&&el('span',null,a.label),
    );
  }

  registerBlockType('blockenberg/floating-cta', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var wrapStyle = Object.assign({}, _tv()(a.typoBtn, '--bkbg-fcta-btn-'));
      return el('div',{ style: wrapStyle },
        el(InspectorControls,null,
          el(PanelBody,{title:__('Button'),initialOpen:true},
            el(TextControl,{label:__('Label'),value:a.label,onChange:v=>set({label:v})}),
            el(TextControl,{label:__('URL / Link'),value:a.url,onChange:v=>set({url:v})}),
            el(ToggleControl,{label:__('Open in New Tab'),checked:a.openInNew,onChange:v=>set({openInNew:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Show Label Text'),checked:a.showLabel,onChange:v=>set({showLabel:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Show Icon'),checked:a.showIcon,onChange:v=>set({showIcon:v}),__nextHasNoMarginBottom:true}),
            a.showIcon&&el(SelectControl,{label:__('Icon'),value:a.icon,options:ICONS,onChange:v=>set({icon:v})}),
            a.showIcon&&el(RangeControl,{label:__('Icon Size (px)'),value:a.iconSize,min:12,max:40,onChange:v=>set({iconSize:v})}),
          ),
          el(PanelBody,{title:__('Position'),initialOpen:false},
            el(SelectControl,{label:__('Screen Position'),value:a.position,options:POSITIONS,onChange:v=>set({position:v})}),
            el(RangeControl,{label:__('Offset X (px)'),value:a.offsetX,min:0,max:100,onChange:v=>set({offsetX:v})}),
            el(RangeControl,{label:__('Offset Y (px)'),value:a.offsetY,min:0,max:200,onChange:v=>set({offsetY:v})}),
            el(RangeControl,{label:__('Scroll to Show (px)'),value:a.scrollTrigger,min:0,max:2000,step:50,onChange:v=>set({scrollTrigger:v}),help:__('Show after scrolling this many pixels (0 = always visible)')}),
            el(RangeControl,{label:__('Z-index'),value:a.zIndex,min:100,max:100000,onChange:v=>set({zIndex:v})}),
          ),
          el(PanelBody,{title:__('Style'),initialOpen:false},
            el(RangeControl,{label:__('Padding X (px)'),value:a.paddingX,min:8,max:60,onChange:v=>set({paddingX:v})}),
            el(RangeControl,{label:__('Padding Y (px)'),value:a.paddingY,min:4,max:40,onChange:v=>set({paddingY:v})}),
            el(RangeControl,{label:__('Border Radius (px)'),value:a.btnRadius,min:0,max:60,onChange:v=>set({btnRadius:v})}),
            el(ToggleControl,{label:__('Button Shadow'),checked:a.btnShadow,onChange:v=>set({btnShadow:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Pulsing Ring'),checked:a.pulsing,onChange:v=>set({pulsing:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Show Dismiss (×)'),checked:a.showDismiss,onChange:v=>set({showDismiss:v}),__nextHasNoMarginBottom:true}),
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              _tc()({ label: __('Button', 'blockenberg'), value: a.typoBtn, onChange: function (v) { set({ typoBtn: v }); } })
          ),
el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Button Background'),value:a.btnBg,onChange:v=>set({btnBg:v||'#6c3fb5'})},
            {label:__('Button Text'),value:a.btnColor,onChange:v=>set({btnColor:v||'#ffffff'})},
          ]}),
        ),

        el('div',{style:{background:'#f9fafb',border:'1px dashed #c4b5fd',borderRadius:'10px',padding:'20px',textAlign:'center',color:'#6b7280',fontSize:'13px'}},
          el('p',{style:{margin:'0 0 12px',fontWeight:600,color:'#6c3fb5'}},__('⚓ Floating CTA — Fixed Position on Frontend')),
          el('p',{style:{margin:'0 0 12px',fontSize:'12px'}},__('Position: ')+a.position+' | Scroll trigger: '+a.scrollTrigger+'px'),
          BtnPreview(a),
        ),
      );
    },

    save: function({attributes:a}) {
      var posStyle = {};
      if (a.position==='bottom-right')  { posStyle.bottom=a.offsetY+'px'; posStyle.right=a.offsetX+'px'; }
      else if (a.position==='bottom-left')   { posStyle.bottom=a.offsetY+'px'; posStyle.left=a.offsetX+'px'; }
      else if (a.position==='bottom-center') { posStyle.bottom=a.offsetY+'px'; posStyle.left='50%'; posStyle.transform='translateX(-50%)'; }
      else if (a.position==='top-right')     { posStyle.top=a.offsetY+'px';    posStyle.right=a.offsetX+'px'; }
      else if (a.position==='top-left')      { posStyle.top=a.offsetY+'px';    posStyle.left=a.offsetX+'px'; }

      var wrapStyle = Object.assign({ position:'fixed', zIndex:a.zIndex, transition:'opacity 0.3s, transform 0.3s' }, posStyle, _tv()(a.typoBtn, '--bkbg-fcta-btn-'));

      return el('div',{
        className:'bkfcta-wrap'+(a.pulsing?' bkfcta-pulsing':''),
        style:wrapStyle,
        'data-scroll-trigger':a.scrollTrigger,
        'data-dismiss':a.showDismiss?'1':'0',
      },
        a.pulsing&&el('div',{className:'bkfcta-ring',style:{
          position:'absolute', inset:0, borderRadius:a.btnRadius+'px',
          background:a.btnBg+'4d', animation:'bkfctaPulse 2s ease-out infinite',
        }}),
        el('a',{className:'bkfcta-btn',href:a.url,
          target:a.openInNew?'_blank':undefined,
          rel:a.openInNew?'noopener noreferrer':undefined,
          style:{
            position:'relative', display:'inline-flex', alignItems:'center', gap:'8px',
            background:a.btnBg, color:a.btnColor,
            padding:a.paddingY+'px '+a.paddingX+'px',
            borderRadius:a.btnRadius+'px',
            boxShadow:a.btnShadow?'0 8px 24px rgba(0,0,0,0.2)':'none',
            textDecoration:'none',
          }},
          a.showIcon&&el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:a.iconSize+'px',width:a.iconSize+'px',height:a.iconSize+'px',lineHeight:1}}),
          a.showLabel&&el('span',null,a.label),
        ),
        a.showDismiss&&el('button',{className:'bkfcta-dismiss',style:{
          position:'absolute',top:'-8px',right:'-8px',
          width:'22px',height:'22px',borderRadius:'50%',
          background:'#374151',color:'#fff',border:'none',cursor:'pointer',
          fontSize:'12px',fontWeight:700,lineHeight:'22px',textAlign:'center',padding:0,
        }},'×'),
      );
    }
  });
}() );
