( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings, useBlockProps } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var DISPLAY_STYLES = [{label:'Badge (pill)',value:'badge'},{label:'Inline text',value:'inline'},{label:'Icon only + text',value:'icon'}];
  var ALIGNS = [{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}];
  var ICONS = ['clock','backup','visibility','media-text'].map(i=>({label:i,value:i}));

  var v1Attributes = {
    wpm: { type: 'number', default: 200 },
    prefix: { type: 'string', default: '' },
    suffix: { type: 'string', default: 'min read' },
    showIcon: { type: 'boolean', default: true },
    icon: { type: 'string', default: 'clock' },
    displayStyle: { type: 'string', default: 'badge' },
    textAlign: { type: 'string', default: 'left' },
    fontSize: { type: 'number', default: 14 },
    fontWeight: { type: 'number', default: 600 },
    bgColor: { type: 'string', default: '#ede9fc' },
    textColor: { type: 'string', default: '#6c3fb5' },
    borderRadius: { type: 'number', default: 40 },
    paddingX: { type: 'number', default: 14 },
    paddingY: { type: 'number', default: 6 },
  };

  function BadgePreview(a, readTime) {
    var badgeStyle = {
      display:'inline-flex', alignItems:'center', gap:'5px',
      background: a.displayStyle==='inline'?'transparent':a.bgColor,
      color:a.textColor, padding:a.displayStyle==='inline'?'0':a.paddingY+'px '+a.paddingX+'px',
      borderRadius:a.borderRadius+'px',
    };
    return el('div',{style:{textAlign:a.textAlign}},
      el('span',{className:'bkrt-badge',style:badgeStyle},
        a.showIcon&&el('span',{className:'dashicons dashicons-'+a.icon,style:{lineHeight:1}}),
        el('span',null,(a.prefix?a.prefix+' ':'')+readTime+' '+(a.suffix||'')),
      )
    );
  }

  registerBlockType('blockenberg/reading-time', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var TC = getTypoControl();
      var blockProps = useBlockProps((function() {
        var _tvFn = getTypoCssVars();
        var s = {};
        if (_tvFn) Object.assign(s, _tvFn(a.badgeTypo || {}, '--bkrt-bt-'));
        return { style: s };
      })());
      // Editor preview: estimate from the current post content
      var postContent = (window.wp.data && window.wp.data.select('core/editor') ? window.wp.data.select('core/editor').getEditedPostContent() : '') || '';
      var wordCount = postContent.replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(Boolean).length;
      var readTime = Math.max(1, Math.ceil(wordCount / (a.wpm||200)));

      return el('div',blockProps,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Reading Time Settings'),initialOpen:true},
            el(RangeControl,{label:__('Words Per Minute'),value:a.wpm,min:50,max:500,onChange:v=>set({wpm:v})}),
            el(TextControl,{label:__('Prefix'),value:a.prefix,onChange:v=>set({prefix:v}),placeholder:'e.g.: About'}),
            el(TextControl,{label:__('Suffix'),value:a.suffix,onChange:v=>set({suffix:v}),placeholder:'e.g.: min read'}),
            el(SelectControl,{label:__('Display Style'),value:a.displayStyle,options:DISPLAY_STYLES,onChange:v=>set({displayStyle:v})}),
            el(SelectControl,{label:__('Alignment'),value:a.textAlign,options:ALIGNS,onChange:v=>set({textAlign:v})}),
            el(ToggleControl,{label:__('Show Icon'),checked:a.showIcon,onChange:v=>set({showIcon:v}),__nextHasNoMarginBottom:true}),
            a.showIcon&&el(SelectControl,{label:__('Icon'),value:a.icon,options:ICONS,onChange:v=>set({icon:v})}),
          ),
          el(PanelBody,{title:__('Typography','blockenberg'),initialOpen:false},
            TC && el(TC, { label: __('Badge Text','blockenberg'), value: a.badgeTypo || {}, onChange: function(v) { set({ badgeTypo: v }); } })
          ),
          el(PanelBody,{title:__('Badge Style','blockenberg'),initialOpen:false},
            el(RangeControl,{label:__('Border Radius (px)'),value:a.borderRadius,min:0,max:50,onChange:v=>set({borderRadius:v})}),
            el(RangeControl,{label:__('Padding X (px)'),value:a.paddingX,min:0,max:40,onChange:v=>set({paddingX:v})}),
            el(RangeControl,{label:__('Padding Y (px)'),value:a.paddingY,min:0,max:20,onChange:v=>set({paddingY:v})}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Background'),value:a.bgColor,onChange:v=>set({bgColor:v||'#ede9fc'})},
            {label:__('Text / Icon'),value:a.textColor,onChange:v=>set({textColor:v||'#6c3fb5'})},
          ]}),
        ),
        el('div',{style:{padding:'4px 0'}},
          BadgePreview(a, readTime),
          el('div',{style:{marginTop:'6px',fontSize:'11px',color:'#9ca3af'}},__('Word count: ')+wordCount+' → '+readTime+' min (updates on frontend)')
        )
      );
    },

    save: function({attributes:a}) {
      var _tvFn = getTypoCssVars();
      var wrapStyle = { textAlign: a.textAlign };
      if (_tvFn) Object.assign(wrapStyle, _tvFn(a.badgeTypo || {}, '--bkrt-bt-'));

      return el('div',{
        className:'bkrt-wrap',
        style: wrapStyle,
        'data-wpm':a.wpm,
        'data-prefix':a.prefix,
        'data-suffix':a.suffix,
      },
        el('span',{className:'bkrt-badge',style:{
          display:'inline-flex',alignItems:'center',gap:'5px',
          background:a.displayStyle==='inline'?'transparent':a.bgColor,
          color:a.textColor,
          padding:a.displayStyle==='inline'?'0':a.paddingY+'px '+a.paddingX+'px',
          borderRadius:a.borderRadius+'px',
        }},
          a.showIcon&&el('span',{className:'dashicons dashicons-'+a.icon,style:{lineHeight:1}}),
          el('span',{className:'bkrt-text'},(a.prefix ? a.prefix+' ' : '')+'…'+' '+(a.suffix||'')),
        )
      );
    },

    deprecated: [{
      attributes: v1Attributes,
      save: function({attributes:a}) {
        return el('div',{
          className:'bkrt-wrap',
          style:{textAlign:a.textAlign},
          'data-wpm':a.wpm,
          'data-prefix':a.prefix,
          'data-suffix':a.suffix,
        },
          el('span',{className:'bkrt-badge',style:{
            display:'inline-flex',alignItems:'center',gap:'5px',
            background:a.displayStyle==='inline'?'transparent':a.bgColor,
            color:a.textColor,
            padding:a.displayStyle==='inline'?'0':a.paddingY+'px '+a.paddingX+'px',
            borderRadius:a.borderRadius+'px',
            fontSize:a.fontSize+'px', fontWeight:a.fontWeight,
          }},
            a.showIcon&&el('span',{className:'dashicons dashicons-'+a.icon,style:{fontSize:a.fontSize+'px',width:a.fontSize+'px',height:a.fontSize+'px',lineHeight:1}}),
            el('span',{className:'bkrt-text'},(a.prefix ? a.prefix+' ' : '')+'…'+' '+(a.suffix||'')),
          )
        );
      }
    }]
  });
}() );
