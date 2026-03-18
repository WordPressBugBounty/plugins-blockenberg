( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, TextControl, ToggleControl, Button } = window.wp.components;
  var { __ } = window.wp.i18n;
  var useBlockProps = window.wp.blockEditor.useBlockProps;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
  var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

  var DASHICONS = ['star-filled','heart','yes','smiley','wordpress-alt','admin-generic','format-image','portfolio','admin-site-alt3','welcome-widgets-menus','palmtree','awards','megaphone','lightbulb','shield-alt'];

  function TiltCardPreview(a) {
    var cardStyle = {
      background:a.cardBg, border:'1px solid '+a.cardBorder,
      borderRadius:a.cardRadius+'px',
      boxShadow:a.cardShadow?'0 20px 60px rgba(0,0,0,0.15)':'none',
      overflow:'hidden',
      width:a.cardWidth+'px', maxWidth:'100%',
      transform:'perspective('+a.perspective+'px) rotateX(0deg) rotateY(0deg)',
      transition:'transform 0.4s ease, box-shadow 0.4s ease',
      margin:'0 auto',
    };
    return el('div',{className:'bktc2-outer',style:{display:'flex',justifyContent:'center',padding:'32px 16px'}},
      el('div',{className:'bktc2-card',style:cardStyle,
        'data-tilt-max':a.tiltMax,'data-tilt-scale':a.tiltScale/100,
        'data-glare':a.glareEffect?'1':'0','data-glare-opacity':a.glareOpacity/100,
        'data-perspective':a.perspective,
      },
        a.imageUrl&&el('div',{className:'bktc2-img',style:{height:a.imgHeight+'px',background:'url('+a.imageUrl+') center/cover no-repeat',flexShrink:0}}),
        el('div',{className:'bktc2-body',style:{padding:a.cardPadding+'px'}},
          a.showIcon&&el('div',{style:{marginBottom:'12px'}},
            el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:a.iconSize+'px',width:a.iconSize+'px',height:a.iconSize+'px',color:a.iconColor,lineHeight:1}}),
          ),
          el('h3',{className:'bktc2-heading',style:{margin:'0 0 10px',color:a.headingColor}},a.heading),
          a.text&&el('p',{className:'bktc2-text',style:{margin:'0 0 16px',color:a.textColor}},a.text),
          a.showLink&&el('a',{href:a.linkUrl,className:'bktc2-link',style:{color:a.linkColor,textDecoration:'none'}},a.linkLabel),
        ),
        a.glareEffect&&el('div',{className:'bktc2-glare',style:{position:'absolute',inset:0,borderRadius:a.cardRadius+'px',pointerEvents:'none',background:'linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%)'}}),
      )
    );
  }

  registerBlockType('blockenberg/tilt-card', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var blockProps = useBlockProps((function () {
          var tv = Object.assign({}, _tvf(a.headingTypo, '--bktc2-ht-'), _tvf(a.bodyTypo, '--bktc2-bt-'));
          return { style: tv };
      })());
      return el(wp.element.Fragment, null,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Content'),initialOpen:true},
            el(TextControl,{label:__('Heading'),value:a.heading,onChange:v=>set({heading:v})}),
            el(TextControl,{label:__('Body Text'),value:a.text,onChange:v=>set({text:v})}),
            el(ToggleControl,{label:__('Show Link'),checked:a.showLink,onChange:v=>set({showLink:v}),__nextHasNoMarginBottom:true}),
            a.showLink&&el(TextControl,{label:__('Link Label'),value:a.linkLabel,onChange:v=>set({linkLabel:v})}),
            a.showLink&&el(TextControl,{label:__('Link URL'),value:a.linkUrl,onChange:v=>set({linkUrl:v})}),
          ),
          el(PanelBody,{title:__('Image & Icon'),initialOpen:false},
            el(MediaUploadCheck,null,
              el(MediaUpload,{onSelect:m=>set({imageUrl:m.url,imageId:m.id}),allowedTypes:['image'],value:a.imageId,
                render:({open})=>el(Button,{onClick:open,variant:'secondary',style:{width:'100%',justifyContent:'center',marginBottom:'8px'}},
                  a.imageUrl?__('Change Image'):__('Select Image'))
              })
            ),
            a.imageUrl&&el('div',null,
              el(RangeControl,{label:__('Image Height (px)'),value:a.imgHeight,min:80,max:400,onChange:v=>set({imgHeight:v})}),
              el(Button,{isDestructive:true,isSmall:true,onClick:()=>set({imageUrl:'',imageId:0})},__('Remove Image')),
            ),
            el(ToggleControl,{label:__('Show Icon'),checked:a.showIcon,onChange:v=>set({showIcon:v}),__nextHasNoMarginBottom:true}),
            a.showIcon && el('select',{value:a.icon,onChange:e=>set({icon:e.target.value}),style:{width:'100%',marginBottom:'8px'}},
              DASHICONS.map(i=>el('option',{key:i,value:i},i))
            ),
            a.showIcon&&el(RangeControl,{label:__('Icon Size (px)'),value:a.iconSize,min:20,max:80,onChange:v=>set({iconSize:v})}),
          ),
          el(PanelBody,{title:__('3D Tilt Effect'),initialOpen:false},
            el(RangeControl,{label:__('Max Tilt Angle (deg)'),value:a.tiltMax,min:2,max:30,onChange:v=>set({tiltMax:v})}),
            el(RangeControl,{label:__('Scale on Hover (%)'),value:a.tiltScale,min:100,max:120,onChange:v=>set({tiltScale:v})}),
            el(RangeControl,{label:__('Perspective (px)'),value:a.perspective,min:300,max:2000,onChange:v=>set({perspective:v})}),
            el(ToggleControl,{label:__('Glare Effect'),checked:a.glareEffect,onChange:v=>set({glareEffect:v}),__nextHasNoMarginBottom:true}),
            a.glareEffect&&el(RangeControl,{label:__('Glare Opacity (%)'),value:a.glareOpacity,min:5,max:80,onChange:v=>set({glareOpacity:v})}),
          ),
          el(PanelBody,{title:__('Card Style'),initialOpen:false},
            el(RangeControl,{label:__('Card Width (px)'),value:a.cardWidth,min:200,max:600,onChange:v=>set({cardWidth:v})}),
            el(RangeControl,{label:__('Card Padding (px)'),value:a.cardPadding,min:12,max:60,onChange:v=>set({cardPadding:v})}),
            el(RangeControl,{label:__('Border Radius (px)'),value:a.cardRadius,min:0,max:40,onChange:v=>set({cardRadius:v})}),
            el(ToggleControl,{label:__('Card Shadow'),checked:a.cardShadow,onChange:v=>set({cardShadow:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            getTypoControl() && el(getTypoControl(), {
                label: __('Heading Typography', 'blockenberg'),
                value: a.headingTypo || {},
                onChange: function (v) { set({ headingTypo: v }); }
            }),
            getTypoControl() && el(getTypoControl(), {
                label: __('Body Typography', 'blockenberg'),
                value: a.bodyTypo || {},
                onChange: function (v) { set({ bodyTypo: v }); }
            })
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),value:a.cardBg,onChange:v=>set({cardBg:v||'#ffffff'})},
            {label:__('Card Border'),value:a.cardBorder,onChange:v=>set({cardBorder:v||'#e5e7eb'})},
            {label:__('Heading Color'),value:a.headingColor,onChange:v=>set({headingColor:v||'#1f2937'})},
            {label:__('Text Color'),value:a.textColor,onChange:v=>set({textColor:v||'#6b7280'})},
            {label:__('Link Color'),value:a.linkColor,onChange:v=>set({linkColor:v||'#6c3fb5'})},
            {label:__('Icon Color'),value:a.iconColor,onChange:v=>set({iconColor:v||'#6c3fb5'})},
          ]}),
        ),
        el('div', blockProps, TiltCardPreview(a)),
      );
    },

    save: function({attributes:a}) {
      var bp = useBlockProps.save((function () {
          var tv = Object.assign({}, _tvf(a.headingTypo, '--bktc2-ht-'), _tvf(a.bodyTypo, '--bktc2-bt-'));
          return { style: tv };
      })());
      var cardStyle = {
        background:a.cardBg, border:'1px solid '+a.cardBorder,
        borderRadius:a.cardRadius+'px',
        boxShadow:a.cardShadow?'0 20px 60px rgba(0,0,0,0.15)':'none',
        overflow:'hidden', width:a.cardWidth+'px', maxWidth:'100%',
        position:'relative', transformStyle:'preserve-3d',
        transition:'transform 0.15s ease, box-shadow 0.15s ease',
      };
      return el('div', bp,
       el('div',{className:'bktc2-outer',style:{display:'flex',justifyContent:'center',padding:'32px 16px'}},
        el('div',{className:'bktc2-card',style:cardStyle,
          'data-tilt-max':a.tiltMax,
          'data-tilt-scale':a.tiltScale/100,
          'data-glare':a.glareEffect?'1':'0',
          'data-glare-opacity':a.glareOpacity/100,
          'data-perspective':a.perspective,
        },
          a.imageUrl&&el('div',{className:'bktc2-img',style:{height:a.imgHeight+'px',background:'url('+a.imageUrl+') center/cover no-repeat'}}),
          el('div',{className:'bktc2-body',style:{padding:a.cardPadding+'px'}},
            a.showIcon&&el('div',{style:{marginBottom:'12px'}},
              el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:a.iconSize+'px',width:a.iconSize+'px',height:a.iconSize+'px',color:a.iconColor,lineHeight:1}}),
            ),
            el('h3',{className:'bktc2-heading',style:{margin:'0 0 10px',color:a.headingColor}},a.heading),
            a.text&&el('p',{className:'bktc2-text',style:{margin:'0 0 16px',color:a.textColor}},a.text),
            a.showLink&&el('a',{href:a.linkUrl,className:'bktc2-link',style:{color:a.linkColor,textDecoration:'none'}},a.linkLabel),
          ),
          a.glareEffect&&el('div',{className:'bktc2-glare',style:{position:'absolute',inset:0,borderRadius:a.cardRadius+'px',pointerEvents:'none',opacity:0,transition:'opacity 0.15s'}}),
        )
      )
      );
    },
  });
}() );
