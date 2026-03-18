( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var useBlockProps = wp.blockEditor.useBlockProps;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var v1Attributes = {
    relation:{type:'string',default:'category'},
    count:{type:'number',default:3},
    layout:{type:'string',default:'grid'},
    columns:{type:'number',default:3},
    showImage:{type:'boolean',default:true},
    showExcerpt:{type:'boolean',default:false},
    showDate:{type:'boolean',default:true},
    imageRatio:{type:'string',default:'16/9'},
    heading:{type:'string',default:'Related Posts'},
    headingTag:{type:'string',default:'h3'},
    cardBg:{type:'string',default:'#ffffff'},
    cardBorder:{type:'string',default:'#e5e7eb'},
    cardRadius:{type:'number',default:10},
    cardShadow:{type:'boolean',default:true},
    gap:{type:'number',default:20},
    placeholderColor:{type:'string',default:'#e5e7eb'},
    headingFontSize:{type:'number',default:20},
    headingFontWeight:{type:'number',default:700},
    headingLineHeight:{type:'number',default:1.3}
  };

  function EditorPreview( attrs ) {
    var wrapStyle = {
      '--bkrp-cols':   attrs.columns,
      '--bkrp-gap':    attrs.gap + 'px',
      '--bkrp-cBg':    attrs.cardBg,
      '--bkrp-cBrd':   attrs.cardBorder,
      '--bkrp-cR':     attrs.cardRadius + 'px',
      '--bkrp-ph':     attrs.placeholderColor,
      '--bkrp-shadow': attrs.cardShadow ? '0 4px 16px rgba(0,0,0,.08)' : 'none'
    };
    var cards = [];
    for ( var i = 0; i < attrs.count; i++ ) {
      cards.push( el( 'div', { key: i, className: 'bkrp-card' },
        attrs.showImage && el( 'div', { className: 'bkrp-img-ph' } ),
        el( 'div', { className: 'bkrp-body' },
          attrs.showDate && el( 'div', { className: 'bkrp-date-ph' } ),
          el( 'div', { className: 'bkrp-title-ph' } ),
          attrs.showExcerpt && el( 'div', { className: 'bkrp-exc-ph' } )
        )
      ) );
    }
    return el( 'div', { className: 'bkrp-wrap bkrp-layout-' + attrs.layout, style: wrapStyle },
      attrs.heading && el( attrs.headingTag || 'h3', { className: 'bkrp-heading' }, attrs.heading ),
      el( 'div', { className: 'bkrp-grid' }, cards ),
      el( 'p', { className: 'bkrp-note' }, __( 'Related posts load dynamically on the frontend.', 'blockenberg' ) )
    );
  }

  registerBlockType( 'blockenberg/related-posts', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      var TC = getTypoControl();

      var blockProps = useBlockProps((function () {
        var _tvFn = getTypoCssVars();
        var s = {};
        if (_tvFn) Object.assign(s, _tvFn(attrs.headingTypo || {}, '--bkrp-ht-'));
        return { style: s };
      })());

      return el( 'div', blockProps,
        el( InspectorControls, null,
          el( PanelBody, { title: __('Query','blockenberg'), initialOpen: true },
            el( SelectControl, { label:__('Relation','blockenberg'), value:attrs.relation,
              options:[
                {label:'Category',      value:'category'},
                {label:'Tag',           value:'tag'},
                {label:'Both (and)',     value:'both'}
              ],
              onChange:function(v){setAttr({relation:v});}
            } ),
            el( RangeControl, { label:__('Number of Posts','blockenberg'), value:attrs.count, min:1, max:12, onChange:function(v){setAttr({count:v});} } )
          ),
          el( PanelBody, { title: __('Display','blockenberg'), initialOpen: false },
            el( TextControl, { label:__('Section Heading','blockenberg'), value:attrs.heading, onChange:function(v){setAttr({heading:v});} } ),
            el( SelectControl, { label:__('Heading Tag','blockenberg'), value:attrs.headingTag, options:['h2','h3','h4','p'].map(function(t){return{label:t,value:t};}), onChange:function(v){setAttr({headingTag:v});} } ),
            el( SelectControl, { label:__('Layout','blockenberg'), value:attrs.layout, options:[{label:'Grid',value:'grid'},{label:'List',value:'list'},{label:'Carousel',value:'carousel'}], onChange:function(v){setAttr({layout:v});} } ),
            attrs.layout === 'grid' && el( RangeControl, { label:__('Columns','blockenberg'), value:attrs.columns, min:1, max:4, onChange:function(v){setAttr({columns:v});} } ),
            el( RangeControl, { label:__('Gap (px)','blockenberg'), value:attrs.gap, min:8, max:48, onChange:function(v){setAttr({gap:v});} } ),
            el( ToggleControl, { label:__('Show Image','blockenberg'), checked:attrs.showImage, onChange:function(v){setAttr({showImage:v});}, __nextHasNoMarginBottom:true } ),
            el( ToggleControl, { label:__('Show Excerpt','blockenberg'), checked:attrs.showExcerpt, onChange:function(v){setAttr({showExcerpt:v});}, __nextHasNoMarginBottom:true } ),
            el( ToggleControl, { label:__('Show Date','blockenberg'), checked:attrs.showDate, onChange:function(v){setAttr({showDate:v});}, __nextHasNoMarginBottom:true } ),
            el( SelectControl, { label:__('Image Ratio','blockenberg'), value:attrs.imageRatio, options:[{label:'16:9',value:'16/9'},{label:'4:3',value:'4/3'},{label:'1:1',value:'1/1'},{label:'3:2',value:'3/2'}], onChange:function(v){setAttr({imageRatio:v});} } ),
            el( RangeControl, { label:__('Card Radius (px)','blockenberg'), value:attrs.cardRadius, min:0, max:24, onChange:function(v){setAttr({cardRadius:v});} } ),
            el( ToggleControl, { label:__('Card Shadow','blockenberg'), checked:attrs.cardShadow, onChange:function(v){setAttr({cardShadow:v});}, __nextHasNoMarginBottom:true } )
          ),
          el( PanelBody, { title: __('Typography','blockenberg'), initialOpen: false },
            TC && el(TC, { label: __('Heading','blockenberg'), value: attrs.headingTypo || {}, onChange: function(v) { setAttr({ headingTypo: v }); } })
          ),
          el( PanelBody, { title: __('Colors','blockenberg'), initialOpen: false },
            el( PanelColorSettings, { title:__('Colors','blockenberg'), colorSettings:[
              { value:attrs.cardBg,          onChange:function(v){setAttr({cardBg:v||'#fff'});},          label:__('Card Background') },
              { value:attrs.cardBorder,      onChange:function(v){setAttr({cardBorder:v||'#e5e7eb'});},    label:__('Card Border') },
              { value:attrs.placeholderColor,onChange:function(v){setAttr({placeholderColor:v||'#e5e7eb'});},label:__('Placeholder Shimmer') }
            ] } )
          )
        ),
        EditorPreview( attrs )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      var _tvFn = window.bkbgTypoCssVars;
      var wrapStyle = {
        '--bkrp-cols':   attrs.columns,
        '--bkrp-gap':    attrs.gap + 'px',
        '--bkrp-cBg':    attrs.cardBg,
        '--bkrp-cBrd':   attrs.cardBorder,
        '--bkrp-cR':     attrs.cardRadius + 'px',
        '--bkrp-ph':     attrs.placeholderColor,
        '--bkrp-shadow': attrs.cardShadow ? '0 4px 16px rgba(0,0,0,.08)' : 'none'
      };
      if (_tvFn) Object.assign(wrapStyle, _tvFn(attrs.headingTypo || {}, '--bkrp-ht-'));

      return el( 'div', {
        className: 'bkrp-wrap bkrp-layout-' + attrs.layout,
        style: wrapStyle,
        'data-relation':  attrs.relation,
        'data-count':     attrs.count,
        'data-show-image':   attrs.showImage ? '1' : '0',
        'data-show-excerpt': attrs.showExcerpt ? '1' : '0',
        'data-show-date':    attrs.showDate ? '1' : '0',
        'data-image-ratio':  attrs.imageRatio
      },
        attrs.heading && el( attrs.headingTag || 'h3', { className: 'bkrp-heading' }, attrs.heading ),
        el( 'div', { className: 'bkrp-grid bkrp-loading' } )
      );
    },
    deprecated: [
      {
        attributes: v1Attributes,
        save: function ( props ) {
          var attrs = props.attributes;
          return el( 'div', {
            className: 'bkrp-wrap bkrp-layout-' + attrs.layout,
            style: {
              '--bkrp-cols':   attrs.columns,
              '--bkrp-gap':    attrs.gap + 'px',
              '--bkrp-cBg':    attrs.cardBg,
              '--bkrp-cBrd':   attrs.cardBorder,
              '--bkrp-cR':     attrs.cardRadius + 'px',
              '--bkrp-ph':     attrs.placeholderColor,
              '--bkrp-shadow': attrs.cardShadow ? '0 4px 16px rgba(0,0,0,.08)' : 'none',
              '--bkrp-heading-fs': (attrs.headingFontSize || 20) + 'px',
              '--bkrp-heading-fw': attrs.headingFontWeight || 700,
              '--bkrp-heading-lh': attrs.headingLineHeight || 1.3
            },
            'data-relation':  attrs.relation,
            'data-count':     attrs.count,
            'data-show-image':   attrs.showImage ? '1' : '0',
            'data-show-excerpt': attrs.showExcerpt ? '1' : '0',
            'data-show-date':    attrs.showDate ? '1' : '0',
            'data-image-ratio':  attrs.imageRatio
          },
            attrs.heading && el( attrs.headingTag || 'h3', { className: 'bkrp-heading', style: { fontSize: (attrs.headingFontSize || 20) + 'px', fontWeight: attrs.headingFontWeight || 700, lineHeight: attrs.headingLineHeight || 1.3 } }, attrs.heading ),
            el( 'div', { className: 'bkrp-grid bkrp-loading' } )
          );
        }
      }
    ]
  } );
} )();
