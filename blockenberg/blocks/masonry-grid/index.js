( function () {
  var el = window.wp.element.createElement;
  var Fragment = window.wp.element.Fragment;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings, useBlockProps } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var HOVER_EFFECTS = [
    {label:'Zoom',value:'zoom'},
    {label:'Fade',value:'fade'},
    {label:'Lift (shadow)',value:'lift'},
    {label:'None',value:'none'},
  ];

  function parseHex(hex, alpha) {
    hex = (hex||'#6c3fb5').replace('#','');
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+(alpha/100).toFixed(2)+')';
  }

  function GridPreview(a) {
    var items = a.items || [];
    var overlayRgba = parseHex(a.overlayColor, a.overlayOpacity);
    return el('div',{className:'bkmg-grid',style:{columnCount:a.columns,columnGap:a.gap+'px'}},
      items.map(function(item, i) {
        var wrapStyle = {
          breakInside:'avoid',marginBottom:a.gap+'px',
          borderRadius:a.imageRadius+'px',overflow:'hidden',
          position:'relative',display:'block',
          background:'#f3f4f6',cursor:'pointer',
        };
        return el('div',{key:i,className:'bkmg-item',style:wrapStyle},
          item.url
            ? el('img',{src:item.url,alt:item.alt||'',style:{width:'100%',display:'block',borderRadius:a.imageRadius+'px'}})
            : el('div',{style:{height:'160px',background:'linear-gradient(135deg,#e5e7eb 0%,#d1d5db 100%)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:a.imageRadius+'px'}},
                el('span',{className:'dashicons dashicons-format-image',style:{fontSize:'48px',width:'48px',height:'48px',color:'#9ca3af',lineHeight:1}})),
          a.showOverlay&&el('div',{className:'bkmg-overlay',style:{position:'absolute',inset:0,background:overlayRgba,opacity:0,transition:'opacity 0.3s',borderRadius:a.imageRadius+'px',display:'flex',alignItems:'flex-end',justifyContent:'flex-start',padding:'16px'}},
            a.showCaption&&item.caption&&el('span',{className:'bkmg-caption',style:{color:a.captionColor,textShadow:'0 1px 4px rgba(0,0,0,0.3)'}},item.caption),
          ),
        );
      })
    );
  }

  function ItemsList(a, set) {
    var items = a.items || [];
    function setItems(newItems) { set({items: newItems}); }
    return el('div',null,
      items.map(function(item,i) {
        return el('div',{key:i,style:{border:'1px solid #e5e7eb',borderRadius:'8px',padding:'10px',marginBottom:'10px',background:'#fafafa'}},
          el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}},
            el('strong',{style:{fontSize:'12px'}},__('Item ')+(i+1)),
            el(Button,{isDestructive:true,isSmall:true,onClick:function(){var d=[...items];d.splice(i,1);setItems(d);}},__('Remove'))
          ),
          el(MediaUploadCheck,null,
            el(MediaUpload,{onSelect:function(m){var d=[...items];d[i]={...d[i],url:m.url,id:m.id,alt:m.alt||''};setItems(d);},
              allowedTypes:['image'],value:item.id||0,
              render:function(ref){var open=ref.open;return el(Button,{onClick:open,variant:'secondary',isSmall:true,style:{width:'100%',justifyContent:'center',marginBottom:'6px'}},
                item.url?__('Change Image'):__('Select Image'));
              }
            })
          ),
          el(TextControl,{label:__('Caption'),value:item.caption||'',onChange:function(v){var d=[...items];d[i]={...d[i],caption:v};setItems(d);}}),
          el(TextControl,{label:__('Link URL'),value:item.link||'',onChange:function(v){var d=[...items];d[i]={...d[i],link:v};setItems(d);}}),
        );
      }),
      el(Button,{variant:'secondary',style:{width:'100%',justifyContent:'center'},onClick:function(){setItems([...items,{id:0,url:'',alt:'',caption:'New Item',link:''}]);}},__('+ Add Item')),
    );
  }

  registerBlockType('blockenberg/masonry-grid', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var blockProps = useBlockProps((function () {
          var tv = getTypoCssVars();
          var s = {};
          Object.assign(s, tv(a.captionTypo, '--bkmg-cp-'));
          return { className: 'bkmg-wrap bkmg-effect-' + a.hoverEffect, style: s };
      })());
      return el(Fragment,null,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Items'),initialOpen:true},
            ItemsList(a, set),
          ),
          el(PanelBody,{title:__('Grid Layout'),initialOpen:false},
            el(RangeControl,{label:__('Columns'),value:a.columns,min:1,max:6,onChange:v=>set({columns:v})}),
            el(RangeControl,{label:__('Gap (px)'),value:a.gap,min:0,max:60,onChange:v=>set({gap:v})}),
            el(RangeControl,{label:__('Image Radius (px)'),value:a.imageRadius,min:0,max:32,onChange:v=>set({imageRadius:v})}),
            el(SelectControl,{label:__('Hover Effect'),value:a.hoverEffect,options:HOVER_EFFECTS,onChange:v=>set({hoverEffect:v})}),
          ),
          el(PanelBody,{title:__('Overlay & Caption'),initialOpen:false},
            el(ToggleControl,{label:__('Show Overlay on Hover'),checked:a.showOverlay,onChange:v=>set({showOverlay:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Show Caption'),checked:a.showCaption,onChange:v=>set({showCaption:v}),__nextHasNoMarginBottom:true}),
            a.showOverlay&&el(RangeControl,{label:__('Overlay Opacity %'),value:a.overlayOpacity,min:10,max:100,onChange:v=>set({overlayOpacity:v})}),
            el(ToggleControl,{label:__('Lightbox on Click'),checked:a.lightbox,onChange:v=>set({lightbox:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Overlay Color'),value:a.overlayColor,onChange:v=>set({overlayColor:v||'#6c3fb5'})},
            {label:__('Caption Color'),value:a.captionColor,onChange:v=>set({captionColor:v||'#ffffff'})},
            {label:__('Accent Color'),value:a.accentColor,onChange:v=>set({accentColor:v||'#6c3fb5'})},
          ]}),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            getTypoControl() && el(getTypoControl(),{label:__('Caption'),value:a.captionTypo||{},onChange:function(v){set({captionTypo:v});}}),
          ),
        ),
        el('div',blockProps,GridPreview(a)),
      );
    },

    save: function({attributes:a}) {
      var items = a.items || [];
      var overlayRgba = parseHex(a.overlayColor, a.overlayOpacity);
      var _tv = getTypoCssVars();
      var wrapStyle = {
          '--bkmg-overlay':overlayRgba,
          '--bkmg-radius':a.imageRadius+'px',
          '--bkmg-gap':a.gap+'px',
          '--bkmg-cols':a.columns,
          '--bkmg-accent':a.accentColor,
        };
      Object.assign(wrapStyle, _tv(a.captionTypo, '--bkmg-cp-'));
      return el('div',{className:'bkmg-wrap bkmg-effect-'+a.hoverEffect,
        'data-lightbox':a.lightbox?'1':'0',
        style: wrapStyle},
        el('div',{className:'bkmg-grid',style:{columnCount:a.columns,columnGap:a.gap+'px'}},
          items.map(function(item,i) {
            var inner = el('div',{key:i,className:'bkmg-item',style:{breakInside:'avoid',marginBottom:a.gap+'px',borderRadius:a.imageRadius+'px',overflow:'hidden',position:'relative',display:'block',background:'#f3f4f6'}},
              item.url&&el('img',{src:item.url,alt:item.alt||'',loading:'lazy',style:{width:'100%',display:'block'}}),
              a.showOverlay&&el('div',{className:'bkmg-overlay',style:{position:'absolute',inset:0,background:overlayRgba,opacity:0,transition:'opacity 0.3s',display:'flex',alignItems:'flex-end',padding:'16px'}},
                a.showCaption&&item.caption&&el('span',{className:'bkmg-caption',style:{color:a.captionColor,textShadow:'0 1px 4px rgba(0,0,0,0.3)'}},item.caption),
              ),
            );
            return item.link
              ? el('a',{key:i,href:item.link,className:'bkmg-link',style:{display:'block',textDecoration:'none'}},inner)
              : inner;
          })
        ),
      );
    }
  });

  function parseHex(hex, alpha) {
    hex = (hex||'#6c3fb5').replace('#','');
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+(alpha/100).toFixed(2)+')';
  }
}() );
