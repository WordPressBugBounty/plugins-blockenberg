( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings, useBlockProps } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var LINE_STYLES = [{label:'Solid',value:'solid'},{label:'Dashed',value:'dashed'},{label:'Dotted',value:'dotted'},{label:'Double',value:'double'}];
  var LABEL_STYLES = [{label:'Text',value:'text'},{label:'Badge',value:'badge'},{label:'Icon',value:'icon'}];
  var ALIGNS = [{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}];
  var DASHICONS = ['star-filled','heart','yes','info','warning','tag','admin-links','minus','plus','arrow-right','arrow-down','format-quote'].map(i=>({label:i,value:i}));

  function renderDivider(a) {
    var lineStyle = { borderTopStyle: a.lineStyle, borderTopWidth: a.lineThickness+'px', borderTopColor: a.lineColor, flex: 1 };

    var labelNode = null;
    if (a.showLabel) {
      var inner;
      if (a.labelStyle === 'icon' && a.showIcon) {
        inner = el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:a.iconSize+'px',width:a.iconSize+'px',height:a.iconSize+'px',color:a.iconColor,lineHeight:1,verticalAlign:'middle'}});
      } else {
        inner = el('span',{className:'bktd-text',style:{
          color:a.labelColor,verticalAlign:'middle',
        }},a.label);
      }
      labelNode = el('span',{className:'bktd-label',style:{
        display:'inline-flex',alignItems:'center',padding:a.labelPaddingY+'px '+a.labelPaddingX+'px',
        background:a.labelBg,borderRadius:a.labelRadius+'px',
        border: a.labelBorder ? '1px solid '+a.labelBorderColor : 'none',
        lineHeight:1.2, flexShrink:0,
      }},inner);
    }

    var wrapStyle = { display:'flex', alignItems:'center', gap:'12px', width: a.lineWidth+'%',
      marginTop: a.marginTop+'px', marginBottom: a.marginBottom+'px',
      marginLeft: a.align==='center'?'auto': a.align==='right'?'auto':'0',
      marginRight: a.align==='center'?'auto': a.align==='left'?'auto':'0',
    };

    return el('div',{className:'bktd-wrap',style:wrapStyle},
      a.showLabel && el('div',{style:{...lineStyle}}),
      labelNode,
      el('div',{style:{...lineStyle}}),
    );
  }

  registerBlockType('blockenberg/text-divider', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      return el('div',useBlockProps((function () {
        var s = {};
        var _tvf = getTypoCssVars();
        if (_tvf) { Object.assign(s, _tvf(a.labelTypo, '--bktd-lb-')); }
        return { style: s };
      })()),
        el(InspectorControls,null,
          el(PanelBody,{title:__('Label'),initialOpen:true},
            el(ToggleControl,{label:__('Show Label'),checked:a.showLabel,onChange:v=>set({showLabel:v}),__nextHasNoMarginBottom:true}),
            a.showLabel && el(SelectControl,{label:__('Label Style'),value:a.labelStyle,options:LABEL_STYLES,onChange:v=>set({labelStyle:v})}),
            a.showLabel && a.labelStyle !== 'icon' && el(TextControl,{label:__('Label Text'),value:a.label,onChange:v=>set({label:v})}),
            a.showLabel && a.labelStyle === 'icon' && el(SelectControl,{label:__('Dashicon'),value:a.icon,options:DASHICONS,onChange:v=>set({icon:v})}),
            a.showLabel && a.labelStyle === 'icon' && el(RangeControl,{label:__('Icon Size (px)'),value:a.iconSize,min:10,max:60,onChange:v=>set({iconSize:v})}),
            a.showLabel && el(RangeControl,{label:__('Padding X (px)'),value:a.labelPaddingX,min:0,max:40,onChange:v=>set({labelPaddingX:v})}),
            a.showLabel && el(RangeControl,{label:__('Padding Y (px)'),value:a.labelPaddingY,min:0,max:20,onChange:v=>set({labelPaddingY:v})}),
            a.showLabel && el(RangeControl,{label:__('Border Radius (px)'),value:a.labelRadius,min:0,max:60,onChange:v=>set({labelRadius:v})}),
            a.showLabel && el(ToggleControl,{label:__('Show Border'),checked:a.labelBorder,onChange:v=>set({labelBorder:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelBody,{title:__('Line'),initialOpen:false},
            el(SelectControl,{label:__('Line Style'),value:a.lineStyle,options:LINE_STYLES,onChange:v=>set({lineStyle:v})}),
            el(RangeControl,{label:__('Thickness (px)'),value:a.lineThickness,min:1,max:10,onChange:v=>set({lineThickness:v})}),
            el(RangeControl,{label:__('Width (%)'),value:a.lineWidth,min:10,max:100,onChange:v=>set({lineWidth:v})}),
            el(SelectControl,{label:__('Alignment'),value:a.align,options:ALIGNS,onChange:v=>set({align:v})}),
          ),
          el(PanelBody,{title:__('Spacing'),initialOpen:false},
            el(RangeControl,{label:__('Margin Top (px)'),value:a.marginTop,min:0,max:100,onChange:v=>set({marginTop:v})}),
            el(RangeControl,{label:__('Margin Bottom (px)'),value:a.marginBottom,min:0,max:100,onChange:v=>set({marginBottom:v})}),
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              getTypoControl() && getTypoControl()({
                  label: __('Label', 'blockenberg'),
                  value: a.labelTypo || {},
                  onChange: function (v) { set({ labelTypo: v }); }
              })
          ),
el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Line Color'),         value:a.lineColor,        onChange:v=>set({lineColor:v||'#e5e7eb'})},
            {label:__('Label Text Color'),   value:a.labelColor,       onChange:v=>set({labelColor:v||'#6b7280'})},
            {label:__('Label Background'),   value:a.labelBg,          onChange:v=>set({labelBg:v||'#ffffff'})},
            {label:__('Label Border Color'), value:a.labelBorderColor, onChange:v=>set({labelBorderColor:v||'#e5e7eb'})},
            {label:__('Icon Color'),         value:a.iconColor,        onChange:v=>set({iconColor:v||'#9ca3af'})},
          ]}),
        ),
        renderDivider(a),
      );
    },

    save: function({attributes:a}) {
      var _tvf = getTypoCssVars();
      var lineStyle = {borderTopStyle:a.lineStyle,borderTopWidth:a.lineThickness+'px',borderTopColor:a.lineColor,flex:1};
      var showIcon = a.labelStyle === 'icon';

      var wrapStyle = {
        display:'flex', alignItems:'center', gap:'12px',
        width:a.lineWidth+'%',
        marginTop:a.marginTop+'px', marginBottom:a.marginBottom+'px',
        marginLeft:a.align==='center'||a.align==='right'?'auto':'0',
        marginRight:a.align==='center'||a.align==='left'?'auto':'0',
      };

      return el('div',useBlockProps.save((function () {
        var s = Object.assign({}, wrapStyle);
        if (_tvf) { Object.assign(s, _tvf(a.labelTypo, '--bktd-lb-')); }
        return { className: 'bktd-wrap', style: s };
      })()),
        a.showLabel && el('div',{className:'bktd-line bktd-line-left',style:lineStyle}),
        a.showLabel && el('span',{className:'bktd-label',style:{
          display:'inline-flex',alignItems:'center',padding:a.labelPaddingY+'px '+a.labelPaddingX+'px',
          background:a.labelBg,borderRadius:a.labelRadius+'px',
          border:a.labelBorder?'1px solid '+a.labelBorderColor:'none',
          lineHeight:1.2, flexShrink:0,
        }},
          showIcon
            ? el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:a.iconSize+'px',width:a.iconSize+'px',height:a.iconSize+'px',color:a.iconColor,lineHeight:1}})
            : el('span',{className:'bktd-text',style:{color:a.labelColor}},a.label)
        ),
        el('div',{className:'bktd-line bktd-line-right',style:lineStyle}),
      );
    }
  });
}() );
