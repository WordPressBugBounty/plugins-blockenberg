( function () {
  var el = window.wp.element.createElement;
  var { useState } = window.wp.element;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, PanelRow, TabPanel, RangeControl, SelectControl, TextControl, ToggleControl, Button, __experimentalGradientPicker: GradientPicker } = window.wp.components;
  var { __ } = window.wp.i18n;

  var RATIOS = [
    {label:'50 / 50', value:'50-50'},
    {label:'40 / 60', value:'40-60'},
    {label:'60 / 40', value:'60-40'},
    {label:'33 / 67', value:'33-67'},
    {label:'67 / 33', value:'67-33'},
  ];
  var V_ALIGNS = [{label:'Top',value:'flex-start'},{label:'Center',value:'center'},{label:'Bottom',value:'flex-end'}];
  var TAGS = ['h1','h2','h3','h4','p'].map(t=>({label:t.toUpperCase(),value:t}));
  var BG_TYPES = [{label:'Color',value:'color'},{label:'Gradient',value:'gradient'},{label:'Image',value:'image'}];
  var ALIGNS = [{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}];

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

  function ratioToPct(ratio, side) {
    var parts = ratio.split('-');
    return side === 'left' ? parts[0]+'%' : parts[1]+'%';
  }

  function buildWrapStyle(a) {
    var leftW = ratioToPct(a.splitRatio,'left');
    var s = {
      '--bkss-left-w': leftW,
      '--bkss-gap': a.gap + 'px',
      '--bkss-min-h': a.minHeight + 'px',
      '--bkss-lh-sz': a.leftHeadingSize + 'px',
      '--bkss-lh-w': a.leftHeadingWeight,
      '--bkss-rh-sz': a.rightHeadingSize + 'px',
      '--bkss-rh-w': a.rightHeadingWeight,
    };
    var fn = getTypoCssVars();
    if (fn) {
      Object.assign(s, fn(a.leftHeadingTypo, '--bkss-lh'));
      Object.assign(s, fn(a.leftTextTypo, '--bkss-lt'));
      Object.assign(s, fn(a.leftBtnTypo, '--bkss-lb'));
      Object.assign(s, fn(a.rightHeadingTypo, '--bkss-rh'));
      Object.assign(s, fn(a.rightTextTypo, '--bkss-rt'));
      Object.assign(s, fn(a.rightBtnTypo, '--bkss-rb'));
    }
    return s;
  }

  function panelBg(a, side) {
    var bt = a[side+'BgType'];
    if (bt === 'gradient') return a[side+'BgGradient'];
    if (bt === 'image' && a[side+'BgImage']) return 'url('+a[side+'BgImage']+') '+a[side+'BgPosition']+'/cover no-repeat';
    return a[side+'BgColor'];
  }

  function PanelEditor({ a, set, side, label }) {
    var pfx = side;
    var bg = panelBg(a, side);
    var hasOverlay = a[pfx+'BgType'] === 'image' && a[pfx+'BgImage'];

    return el('div', null,
      el(PanelBody, { title: label + ' — Background', initialOpen: true },
        el(SelectControl, { label: __('Background Type'), value: a[pfx+'BgType'],
          options: BG_TYPES, onChange: v => set({[pfx+'BgType']:v}) }),
        a[pfx+'BgType'] === 'color' && el('div', null,
          el('label', {style:{fontSize:'11px',fontWeight:600,display:'block',marginBottom:'4px'}}, __('Color')),
          el('input', { type:'color', value:a[pfx+'BgColor'],
            onChange: e => set({[pfx+'BgColor']:e.target.value}),
            style:{width:'100%',height:'34px',borderRadius:'4px',border:'1px solid #ccc',cursor:'pointer'} })
        ),
        a[pfx+'BgType'] === 'gradient' && el('div', { style:{ marginBottom:'8px' } },
          el('p', { style:{ fontSize:'11px', fontWeight:600, margin:'0 0 6px', textTransform:'uppercase', color:'#757575' } }, __('Gradient')),
          el(GradientPicker, { value: a[pfx+'BgGradient'], onChange: v=>set({[pfx+'BgGradient']:v}) })
        ),
        a[pfx+'BgType'] === 'image' && el(MediaUploadCheck, null,
          el(MediaUpload, {
            onSelect: m => set({[pfx+'BgImage']:m.url, [pfx+'BgImageId']:m.id}),
            allowedTypes:['image'], value: a[pfx+'BgImageId'],
            render: ({open}) => el(Button, {onClick:open, variant:'secondary', style:{width:'100%',justifyContent:'center',marginBottom:'8px'}},
              a[pfx+'BgImage'] ? __('Change Image') : __('Select Image'))
          }),
          a[pfx+'BgImage'] && el(Button, {isDestructive:true,isSmall:true,onClick:()=>set({[pfx+'BgImage']:'', [pfx+'BgImageId']:0})}, __('Remove Image'))
        ),
        a[pfx+'BgType'] === 'image' && el(TextControl, { label:__('Image Position'), value:a[pfx+'BgPosition'], onChange:v=>set({[pfx+'BgPosition']:v}) }),
        hasOverlay && el('div',null,
          el('label',{style:{fontSize:'11px',fontWeight:600,display:'block',marginBottom:'4px'}},__('Overlay Color')),
          el('input',{type:'color',value:a[pfx+'Overlay']||'#000000',onChange:e=>set({[pfx+'Overlay']:e.target.value}),
            style:{width:'100%',height:'34px',borderRadius:'4px',border:'1px solid #ccc',cursor:'pointer'}}),
          el(RangeControl,{label:__('Overlay Opacity %'),value:a[pfx+'OverlayOpacity'],min:0,max:90,onChange:v=>set({[pfx+'OverlayOpacity']:v})})
        ),
        el(RangeControl, { label:__('Padding X (px)'), value:a[pfx+'PaddingX'], min:0, max:120, onChange:v=>set({[pfx+'PaddingX']:v}) }),
        el(RangeControl, { label:__('Padding Y (px)'), value:a[pfx+'PaddingY'], min:0, max:120, onChange:v=>set({[pfx+'PaddingY']:v}) }),
      ),
      el(PanelBody, { title: label + ' — Content', initialOpen: false },
        el(SelectControl,{label:__('Heading Tag'),value:a[pfx+'Tag'],options:TAGS,onChange:v=>set({[pfx+'Tag']:v})}),
        el(TextControl,{label:__('Heading'),value:a[pfx+'Heading'],onChange:v=>set({[pfx+'Heading']:v})}),
        el(TextControl,{label:__('Body Text'),value:a[pfx+'Text'],onChange:v=>set({[pfx+'Text']:v})}),
        el(SelectControl,{label:__('Text Align'),value:a[pfx+'TextAlign'],options:ALIGNS,onChange:v=>set({[pfx+'TextAlign']:v})}),
        el(ToggleControl,{label:__('Show Button'),checked:a[pfx+'ShowBtn'],onChange:v=>set({[pfx+'ShowBtn']:v}),__nextHasNoMarginBottom:true}),
        a[pfx+'ShowBtn'] && el(TextControl,{label:__('Button Label'),value:a[pfx+'BtnLabel'],onChange:v=>set({[pfx+'BtnLabel']:v})}),
        a[pfx+'ShowBtn'] && el(TextControl,{label:__('Button URL'),value:a[pfx+'BtnUrl'],onChange:v=>set({[pfx+'BtnUrl']:v})}),
        a[pfx+'ShowBtn'] && el(RangeControl,{label:__('Button Radius (px)'),value:a[pfx+'BtnRadius'],min:0,max:50,onChange:v=>set({[pfx+'BtnRadius']:v})}),
      ),
      
      el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
          getTypoControl() ? el(getTypoControl(), { label:__('Heading','blockenberg'), value:a[pfx+'HeadingTypo'], onChange:function(v){ set({[pfx+'HeadingTypo']:v}); } }) : null,
          getTypoControl() ? el(getTypoControl(), { label:__('Text','blockenberg'), value:a[pfx+'TextTypo'], onChange:function(v){ set({[pfx+'TextTypo']:v}); } }) : null,
          getTypoControl() ? el(getTypoControl(), { label:__('Button','blockenberg'), value:a[pfx+'BtnTypo'], onChange:function(v){ set({[pfx+'BtnTypo']:v}); } }) : null
      ),
el(PanelColorSettings, { title: label+' — Colors', initialOpen:false, colorSettings:[
        {label:__('Heading Color'),value:a[pfx+'HeadingColor'],onChange:v=>set({[pfx+'HeadingColor']:v||'#ffffff'})},
        {label:__('Text Color'),   value:a[pfx+'TextColor'],  onChange:v=>set({[pfx+'TextColor']:v||'#ffffff'})},
        {label:__('Button BG'),    value:a[pfx+'BtnBg'],      onChange:v=>set({[pfx+'BtnBg']:v||'#ffffff'})},
        {label:__('Button Text'),  value:a[pfx+'BtnColor'],   onChange:v=>set({[pfx+'BtnColor']:v||'#333333'})},
      ]}),
    );
  }

  function PanelPreview({ a, side }) {
    var bg = panelBg(a, side);
    var pfx = side;
    var hasOverlay = a[pfx+'BgType'] === 'image' && a[pfx+'BgImage'];

    var panelStyle = {
      background: bg,
      padding: a[pfx+'PaddingY']+'px '+a[pfx+'PaddingX']+'px',
      display:'flex', flexDirection:'column', justifyContent: a.verticalAlign || 'center',
      position:'relative', overflow:'hidden', boxSizing:'border-box',
      textAlign: a[pfx+'TextAlign'],
    };
    var contentStyle = { position:'relative', zIndex:1 };

    return el('div', {style:panelStyle},
      hasOverlay && el('div',{style:{
        position:'absolute',inset:0,
        background: a[pfx+'Overlay']||'#000',
        opacity:(a[pfx+'OverlayOpacity']||40)/100,
      }}),
      el('div',{style:contentStyle},
        el(a[pfx+'Tag']||'h2', {className:'bkss-heading',style:{color:a[pfx+'HeadingColor'],margin:'0 0 12px'}},
          a[pfx+'Heading']),
        a[pfx+'Text'] && el('p',{className:'bkss-text',style:{color:a[pfx+'TextColor'],margin:'0 0 20px'}},a[pfx+'Text']),
        a[pfx+'ShowBtn'] && el('a',{href:'#',className:'bkss-btn',
          style:{display:'inline-block',background:a[pfx+'BtnBg'],color:a[pfx+'BtnColor'],
            padding:'10px 24px',borderRadius:a[pfx+'BtnRadius']+'px'}},
          a[pfx+'BtnLabel']),
      )
    );
  }

  registerBlockType('blockenberg/split-screen', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var [activeTab, setActiveTab] = useState('left');

      var leftW = ratioToPct(a.splitRatio,'left');
      var rightW = ratioToPct(a.splitRatio,'right');

      return el('div',{className:'bkss-wrap',style:buildWrapStyle(a)},
        el(InspectorControls,null,
          el(PanelBody,{title:__('Layout'),initialOpen:true},
            el(SelectControl,{label:__('Split Ratio'),value:a.splitRatio,options:RATIOS,onChange:v=>set({splitRatio:v})}),
            el(RangeControl,{label:__('Min Height (px)'),value:a.minHeight,min:200,max:1000,onChange:v=>set({minHeight:v})}),
            el(SelectControl,{label:__('Vertical Align'),value:a.verticalAlign,options:V_ALIGNS,onChange:v=>set({verticalAlign:v})}),
            el(RangeControl,{label:__('Gap Between Panels (px)'),value:a.gap,min:0,max:60,onChange:v=>set({gap:v})}),
            el(ToggleControl,{label:__('Stack on Mobile'),checked:a.stackOnMobile,onChange:v=>set({stackOnMobile:v}),__nextHasNoMarginBottom:true}),
          ),
          el(TabPanel,{
            activeClass:'is-active',
            tabs:[{name:'left',title:__('Left Panel')},{name:'right',title:__('Right Panel')}],
          }, tab => el(PanelEditor,{a,set,side:tab.name,label:tab.name==='left'?__('Left'):__('Right')})),
        ),

        el('div',{className:'bkss-layout',style:{display:'flex',gap:a.gap+'px',minHeight:a.minHeight+'px'}},
          el('div',{className:'bkss-left',style:{width:leftW,flexShrink:0}},
            el(PanelPreview,{a,side:'left'})),
          el('div',{className:'bkss-right',style:{flex:1}},
            el(PanelPreview,{a,side:'right'})),
        )
      );
    },

    save: function({attributes:a}) {
      function panelHTML(side) {
        var pfx = side;
        var bg = panelBg(a, side);
        var hasOverlay = a[pfx+'BgType']==='image' && a[pfx+'BgImage'];

        return el('div',{
          className:'bkss-panel bkss-'+side,
          style:{
            background:bg,
            padding:a[pfx+'PaddingY']+'px '+a[pfx+'PaddingX']+'px',
            textAlign:a[pfx+'TextAlign'], position:'relative', overflow:'hidden', boxSizing:'border-box',
          }
        },
          hasOverlay && el('div',{className:'bkss-overlay',style:{
            position:'absolute',inset:0,
            background:a[pfx+'Overlay']||'#000',
            opacity:(a[pfx+'OverlayOpacity']||40)/100,
          }}),
          el('div',{style:{position:'relative',zIndex:1}},
            el(a[pfx+'Tag']||'h2',{className:'bkss-heading',style:{color:a[pfx+'HeadingColor'],margin:'0 0 12px'}},
              a[pfx+'Heading']),
            a[pfx+'Text'] && el('p',{className:'bkss-text',style:{color:a[pfx+'TextColor'],margin:'0 0 20px'}},a[pfx+'Text']),
            a[pfx+'ShowBtn'] && el('a',{className:'bkss-btn',href:a[pfx+'BtnUrl'],
              style:{display:'inline-block',background:a[pfx+'BtnBg'],color:a[pfx+'BtnColor'],
                padding:'10px 24px',borderRadius:a[pfx+'BtnRadius']+'px'}},
              a[pfx+'BtnLabel']),
          )
        );
      }
      return el('div',{
        className:'bkss-wrap'+(a.stackOnMobile?' bkss-stack-mobile':''),
        style:buildWrapStyle(a),
      },
        el('div',{className:'bkss-layout'},
          panelHTML('left'),
          panelHTML('right'),
        )
      );
    }
  });
}() );
