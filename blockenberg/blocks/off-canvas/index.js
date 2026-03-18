( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings, useBlockProps } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var POSITIONS = [{label:'Right',value:'right'},{label:'Left',value:'left'}];

  var ICONS = [
    {label:'Menu (hamburger)',value:'menu'},
    {label:'Arrow right',value:'arrow-right-alt'},
    {label:'Plus',value:'plus'},
    {label:'Settings',value:'admin-settings'},
    {label:'Info',value:'info'},
    {label:'Cart',value:'cart'},
    {label:'List',value:'list-view'},
    {label:'Share',value:'share'},
  ];

  function TriggerBtn(a) {
    return el('div',{className:'bkoc-trigger',style:{display:'inline-flex',alignItems:'center',gap:'8px',background:a.triggerBg,color:a.triggerColor,borderRadius:a.triggerRadius+'px',padding:a.triggerPadding+'px '+(a.triggerPadding*1.6)+'px',cursor:'pointer'}},
      a.showIcon&&el('span',{className:'dashicons dashicons-'+a.triggerIcon,style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1}}),
      a.triggerLabel
    );
  }

  function EditorPreview(a) {
    var isRight = a.position === 'right';
    return el('div',{style:{fontFamily:'inherit'}},
      el('div',{style:{marginBottom:'12px'}}, TriggerBtn(a)),
      el('div',{style:{position:'relative',overflow:'hidden',border:'1px dashed #c084fc',borderRadius:'8px',padding:'0'}},
        el('div',{style:{
          width:a.width+'px',maxWidth:'100%',background:a.drawerBg,
          border:'1px solid '+a.drawerBorder,
          borderRadius:'8px',
          padding:'24px',
          boxSizing:'border-box',
        }},
          el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',borderBottom:'1px solid '+a.drawerBorder,paddingBottom:'12px'}},
            a.showDrawerTitle&&el('h3',{className:'bkoc-drawer-title',style:{margin:0,color:a.titleColor}},a.drawerTitle),
            el('span',{className:'dashicons dashicons-no-alt',style:{color:a.closeIconColor,fontSize:'22px',width:'22px',height:'22px',lineHeight:1,cursor:'pointer'}}),
          ),
          el('div',{className:'bkoc-content',style:{color:a.contentColor}},a.content),
        ),
        el('p',{style:{textAlign:'center',color:'#9ca3af',fontSize:'12px',margin:'8px 0 4px'}},
          '← Preview: Drawer opens from '+a.position),
      ),
    );
  }

  registerBlockType('blockenberg/off-canvas', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      return el('div',(function(){
        var bp = useBlockProps();
        var _tvf = getTypoCssVars();
        var s = {};
        if (_tvf) {
          Object.assign(s, _tvf(a.triggerTypo, '--bkoc-trg-'));
          Object.assign(s, _tvf(a.titleTypo, '--bkoc-tt-'));
          Object.assign(s, _tvf(a.contentTypo, '--bkoc-ct-'));
        }
        bp.style = Object.assign(s, bp.style || {});
        bp.className = ((bp.className || '') + ' bkoc-wrap').trim();
        return bp;
      }()),
        el(InspectorControls,null,
          el(PanelBody,{title:__('Trigger Button'),initialOpen:true},
            el(TextControl,{label:__('Button Label'),value:a.triggerLabel,onChange:v=>set({triggerLabel:v})}),
            el(ToggleControl,{label:__('Show Icon'),checked:a.showIcon,onChange:v=>set({showIcon:v}),__nextHasNoMarginBottom:true}),
            a.showIcon&&el(SelectControl,{label:__('Icon'),value:a.triggerIcon,options:ICONS,onChange:v=>set({triggerIcon:v})}),
            el(RangeControl,{label:__('Button Radius (px)'),value:a.triggerRadius,min:0,max:50,onChange:v=>set({triggerRadius:v})}),
            el(RangeControl,{label:__('Button Padding (px)'),value:a.triggerPadding,min:4,max:30,onChange:v=>set({triggerPadding:v})}),
          ),
          el(PanelBody,{title:__('Drawer Content'),initialOpen:false},
            el(SelectControl,{label:__('Position'),value:a.position,options:POSITIONS,onChange:v=>set({position:v})}),
            el(RangeControl,{label:__('Drawer Width (px)'),value:a.width,min:200,max:700,onChange:v=>set({width:v})}),
            el(ToggleControl,{label:__('Show Drawer Title'),checked:a.showDrawerTitle,onChange:v=>set({showDrawerTitle:v}),__nextHasNoMarginBottom:true}),
            el(TextControl,{label:__('Drawer Title'),value:a.drawerTitle,onChange:v=>set({drawerTitle:v})}),
            el(TextareaControl,{label:__('Drawer Content (HTML supported)'),value:a.content,rows:6,onChange:v=>set({content:v})}),
          ),
          el(PanelBody,{title:__('Behavior'),initialOpen:false},
            el(ToggleControl,{label:__('Overlay'),checked:a.overlayEnabled,onChange:v=>set({overlayEnabled:v}),__nextHasNoMarginBottom:true}),
            a.overlayEnabled&&el(ToggleControl,{label:__('Close on Overlay Click'),checked:a.closeOnOverlay,onChange:v=>set({closeOnOverlay:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Close on Escape Key'),checked:a.closeOnEscape,onChange:v=>set({closeOnEscape:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Animation Speed (ms)'),value:a.animationSpeed,min:100,max:800,onChange:v=>set({animationSpeed:v})}),
            a.overlayEnabled&&el(RangeControl,{label:__('Overlay Opacity %'),value:a.overlayOpacity,min:10,max:90,onChange:v=>set({overlayOpacity:v})}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Button Background'),value:a.triggerBg,onChange:v=>set({triggerBg:v||'#6c3fb5'})},
            {label:__('Button Text'),value:a.triggerColor,onChange:v=>set({triggerColor:v||'#ffffff'})},
            {label:__('Drawer Background'),value:a.drawerBg,onChange:v=>set({drawerBg:v||'#ffffff'})},
            {label:__('Drawer Border'),value:a.drawerBorder,onChange:v=>set({drawerBorder:v||'#e5e7eb'})},
            {label:__('Title Color'),value:a.titleColor,onChange:v=>set({titleColor:v||'#1f2937'})},
            {label:__('Content Color'),value:a.contentColor,onChange:v=>set({contentColor:v||'#374151'})},
            {label:__('Close Icon'),value:a.closeIconColor,onChange:v=>set({closeIconColor:v||'#6b7280'})},
            {label:__('Overlay Color'),value:a.overlayColor,onChange:v=>set({overlayColor:v||'#000000'})},
          ]}),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            el(getTypoControl(),{label:__('Trigger Button'),value:a.triggerTypo,onChange:function(v){set({triggerTypo:v});}}),
            el(getTypoControl(),{label:__('Drawer Title'),value:a.titleTypo,onChange:function(v){set({titleTypo:v});}}),
            el(getTypoControl(),{label:__('Drawer Content'),value:a.contentTypo,onChange:function(v){set({contentTypo:v});}})
          ),
        ),
        EditorPreview(a),
      );
    },

    save: function({attributes:a}) {
      var triggerStyle = {
        display:'inline-flex',alignItems:'center',gap:'8px',
        background:a.triggerBg,color:a.triggerColor,
        borderRadius:a.triggerRadius+'px',
        padding:a.triggerPadding+'px '+(a.triggerPadding*1.6)+'px',
        cursor:'pointer',border:'none',
        fontFamily:'inherit',
      };
      var overlayHex = (a.overlayColor||'#000').replace('#','');
      if (overlayHex.length===3) overlayHex=overlayHex[0]+overlayHex[0]+overlayHex[1]+overlayHex[1]+overlayHex[2]+overlayHex[2];
      var r=parseInt(overlayHex.substring(0,2),16),g=parseInt(overlayHex.substring(2,4),16),b=parseInt(overlayHex.substring(4,6),16);
      var overlayRgba = 'rgba('+r+','+g+','+b+','+(a.overlayOpacity/100).toFixed(2)+')';

      var isRight = a.position === 'right';
      var drawerStyle = {
        position:'fixed',top:0,height:'100%',width:a.width+'px',maxWidth:'90vw',
        background:a.drawerBg,
        boxShadow:(isRight?'-4px':'4px')+' 0 32px rgba(0,0,0,0.15)',
        zIndex:9999,
        transform:'translateX('+(isRight?'100%':'-100%')+')',
        transition:'transform '+a.animationSpeed+'ms cubic-bezier(0.4,0,0.2,1)',
        overflowY:'auto',boxSizing:'border-box',
      };
      if (isRight) { drawerStyle.right = 0; } else { drawerStyle.left = 0; }

      var wrapStyle = {fontFamily:'inherit'};
      var _tvf = getTypoCssVars();
      if (_tvf) {
        Object.assign(wrapStyle, _tvf(a.triggerTypo, '--bkoc-trg-'));
        Object.assign(wrapStyle, _tvf(a.titleTypo, '--bkoc-tt-'));
        Object.assign(wrapStyle, _tvf(a.contentTypo, '--bkoc-ct-'));
      }

      return el('div',{className:'bkoc-wrap',
        'data-position':a.position,
        'data-width':a.width,
        'data-overlay':a.overlayEnabled?'1':'0',
        'data-close-overlay':a.closeOnOverlay?'1':'0',
        'data-close-escape':a.closeOnEscape?'1':'0',
        'data-speed':a.animationSpeed,
        'data-overlay-color':overlayRgba,
        style:wrapStyle,
      },
        el('button',{className:'bkoc-trigger','aria-expanded':'false','aria-controls':'bkoc-drawer',style:triggerStyle},
          a.showIcon&&el('span',{className:'dashicons dashicons-'+a.triggerIcon,style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1},"aria-hidden":"true"}),
          a.triggerLabel
        ),

        a.overlayEnabled&&el('div',{className:'bkoc-overlay',style:{position:'fixed',inset:0,background:overlayRgba,zIndex:9998,opacity:0,pointerEvents:'none',transition:'opacity '+a.animationSpeed+'ms ease'}}),

        el('div',{className:'bkoc-drawer',id:'bkoc-drawer',role:'dialog','aria-modal':'true','aria-label':a.drawerTitle,style:drawerStyle},
          el('div',{style:{padding:'24px'}},
            el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',borderBottom:'1px solid '+a.drawerBorder,paddingBottom:'12px'}},
              a.showDrawerTitle&&el('h3',{className:'bkoc-drawer-title',style:{margin:0,color:a.titleColor}},a.drawerTitle),
              el('button',{className:'bkoc-close','aria-label':'Close drawer',style:{background:'none',border:'none',cursor:'pointer',padding:'4px',lineHeight:1}},
                el('span',{className:'dashicons dashicons-no-alt',style:{color:a.closeIconColor,fontSize:'24px',width:'24px',height:'24px',lineHeight:1},"aria-hidden":"true"}),
              ),
            ),
            el('div',{className:'bkoc-content',style:{color:a.contentColor}},a.content),
          ),
        ),
      );
    },

    deprecated: [{
      save: function({attributes:a}) {
        var triggerStyle = {
          display:'inline-flex',alignItems:'center',gap:'8px',
          background:a.triggerBg,color:a.triggerColor,
          borderRadius:a.triggerRadius+'px',
          padding:a.triggerPadding+'px '+(a.triggerPadding*1.6)+'px',
          cursor:'pointer',fontWeight:700,fontSize:'15px',border:'none',
          fontFamily:'inherit',
        };
        var overlayHex = (a.overlayColor||'#000').replace('#','');
        if (overlayHex.length===3) overlayHex=overlayHex[0]+overlayHex[0]+overlayHex[1]+overlayHex[1]+overlayHex[2]+overlayHex[2];
        var r=parseInt(overlayHex.substring(0,2),16),g=parseInt(overlayHex.substring(2,4),16),b=parseInt(overlayHex.substring(4,6),16);
        var overlayRgba = 'rgba('+r+','+g+','+b+','+(a.overlayOpacity/100).toFixed(2)+')';
        var isRight = a.position === 'right';
        var drawerStyle = {
          position:'fixed',top:0,height:'100%',width:a.width+'px',maxWidth:'90vw',
          background:a.drawerBg,
          boxShadow:(isRight?'-4px':'4px')+' 0 32px rgba(0,0,0,0.15)',
          zIndex:9999,
          transform:'translateX('+(isRight?'100%':'-100%')+')',
          transition:'transform '+a.animationSpeed+'ms cubic-bezier(0.4,0,0.2,1)',
          overflowY:'auto',boxSizing:'border-box',
        };
        if (isRight) { drawerStyle.right = 0; } else { drawerStyle.left = 0; }
        return el('div',{className:'bkoc-wrap',
          'data-position':a.position,
          'data-width':a.width,
          'data-overlay':a.overlayEnabled?'1':'0',
          'data-close-overlay':a.closeOnOverlay?'1':'0',
          'data-close-escape':a.closeOnEscape?'1':'0',
          'data-speed':a.animationSpeed,
          'data-overlay-color':overlayRgba,
          style:{fontFamily:'inherit'},
        },
          el('button',{className:'bkoc-trigger','aria-expanded':'false','aria-controls':'bkoc-drawer',style:triggerStyle},
            a.showIcon&&el('span',{className:'dashicons dashicons-'+a.triggerIcon,style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1},"aria-hidden":"true"}),
            a.triggerLabel
          ),
          a.overlayEnabled&&el('div',{className:'bkoc-overlay',style:{position:'fixed',inset:0,background:overlayRgba,zIndex:9998,opacity:0,pointerEvents:'none',transition:'opacity '+a.animationSpeed+'ms ease'}}),
          el('div',{className:'bkoc-drawer',id:'bkoc-drawer',role:'dialog','aria-modal':'true','aria-label':a.drawerTitle,style:drawerStyle},
            el('div',{style:{padding:'24px'}},
              el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',borderBottom:'1px solid '+a.drawerBorder,paddingBottom:'12px'}},
                a.showDrawerTitle&&el('h3',{style:{margin:0,fontSize:'18px',fontWeight:700,color:a.titleColor}},a.drawerTitle),
                el('button',{className:'bkoc-close','aria-label':'Close drawer',style:{background:'none',border:'none',cursor:'pointer',padding:'4px',lineHeight:1}},
                  el('span',{className:'dashicons dashicons-no-alt',style:{color:a.closeIconColor,fontSize:'24px',width:'24px',height:'24px',lineHeight:1},"aria-hidden":"true"}),
                ),
              ),
              el('div',{className:'bkoc-content',style:{color:a.contentColor,fontSize:'15px',lineHeight:1.7}},a.content),
            ),
          ),
        );
      }
    }]
  });
}() );
