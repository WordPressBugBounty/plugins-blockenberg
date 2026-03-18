( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;

  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  function previewPages( range ) {
    var pages = [];
    /* show: prev, 1, ... , current-range .. current+range, ..., last, next */
    for ( var i = Math.max(1, 3 - range); i <= Math.min(10, 3 + range); i++ ) {
      pages.push(i);
    }
    return pages;
  }

  function renderPagination( attrs, isEditor ) {
    var pages = previewPages( attrs.pageRange );
    var current = 3;
    var tv = getTypoCssVars();
    var wrapStyle = {
      '--bkpg-aBg':    attrs.activeBg,
      '--bkpg-aTxt':   attrs.activeText,
      '--bkpg-nBg':    attrs.normalBg,
      '--bkpg-nTxt':   attrs.normalText,
      '--bkpg-hBg':    attrs.hoverBg,
      '--bkpg-size':   attrs.itemSize + 'px',
      '--bkpg-gap':    attrs.gap + 'px',
      '--bkpg-fs':     attrs.fontSize + 'px',
      '--bkpg-align':  attrs.alignment === 'center' ? 'center' : attrs.alignment === 'right' ? 'flex-end' : 'flex-start'
    };
    Object.assign(wrapStyle, tv(attrs.itemTypo, '--bkpg-it-'));
    var styleClass = 'bkpg-style-' + attrs.style;
    return el( 'nav', {
      className: 'bkpg-wrap ' + styleClass,
      'aria-label': 'Pagination',
      style: wrapStyle,
      'data-range': attrs.pageRange,
      'data-style': attrs.style,
      'data-prev': attrs.prevLabel,
      'data-next': attrs.nextLabel
    },
      el( 'a', { className: 'bkpg-item bkpg-prev', href: isEditor ? null : '#' }, attrs.prevLabel ),
      pages[0] > 1 && [ el( 'a', { key: 'p1', className: 'bkpg-item', href: isEditor ? null : '#' }, '1' ), el( 'span', { key: 'e1', className: 'bkpg-ellipsis' }, '…' ) ],
      pages.map( function (p) {
        return el( 'a', {
          key: p,
          className: 'bkpg-item' + ( p === current ? ' bkpg-active' : '' ),
          href: isEditor ? null : '#',
          'aria-current': p === current ? 'page' : null
        }, String(p) );
      } ),
      pages[ pages.length - 1 ] < 10 && [ el( 'span', { key: 'e2', className: 'bkpg-ellipsis' }, '…' ), el( 'a', { key: 'p10', className: 'bkpg-item', href: isEditor ? null : '#' }, '10' ) ],
      el( 'a', { className: 'bkpg-item bkpg-next', href: isEditor ? null : '#' }, attrs.nextLabel )
    );
  }

  registerBlockType( 'blockenberg/pagination', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __('Labels','blockenberg'), initialOpen: true },
            el( TextControl, { label:__('Previous Label','blockenberg'), value:attrs.prevLabel, onChange:function(v){setAttr({prevLabel:v});} } ),
            el( TextControl, { label:__('Next Label','blockenberg'), value:attrs.nextLabel, onChange:function(v){setAttr({nextLabel:v});} } ),
            el( RangeControl, { label:__('Page Range (around current)','blockenberg'), value:attrs.pageRange, min:1, max:4, onChange:function(v){setAttr({pageRange:v});} } )
          ),
          el( PanelBody, { title: __('Style','blockenberg'), initialOpen: false },
            el( SelectControl, { label:__('Alignment','blockenberg'), value:attrs.alignment, options:[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}], onChange:function(v){setAttr({alignment:v});} } ),
            el( SelectControl, { label:__('Item Style','blockenberg'), value:attrs.style,
              options:[
                {label:'Rounded',   value:'rounded'},
                {label:'Square',    value:'square'},
                {label:'Minimal',   value:'minimal'},
                {label:'Outline',   value:'outline'}
              ],
              onChange:function(v){setAttr({style:v});}
            } ),
            el( RangeControl, { label:__('Item Size (px)','blockenberg'), value:attrs.itemSize, min:28, max:60, onChange:function(v){setAttr({itemSize:v});} } ),
            el( RangeControl, { label:__('Gap (px)','blockenberg'), value:attrs.gap, min:2, max:20, onChange:function(v){setAttr({gap:v});} } ),
            ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              el( getTypoControl(), { label: __('Items','blockenberg'), value: attrs.itemTypo, onChange: function(v){ setAttr({ itemTypo: v }); } })
          ),
el( PanelBody, { title: __('Colors','blockenberg'), initialOpen: false },
            el( PanelColorSettings, { title:__('Colors','blockenberg'), colorSettings:[
              { value:attrs.activeBg,   onChange:function(v){setAttr({activeBg:v||'#6c3fb5'});},   label:__('Active Background') },
              { value:attrs.activeText, onChange:function(v){setAttr({activeText:v||'#ffffff'});}, label:__('Active Text') },
              { value:attrs.normalBg,   onChange:function(v){setAttr({normalBg:v||'#f3f4f6'});},   label:__('Normal Background') },
              { value:attrs.normalText, onChange:function(v){setAttr({normalText:v||'#374151'});}, label:__('Normal Text') },
              { value:attrs.hoverBg,    onChange:function(v){setAttr({hoverBg:v||'#ede9fe'});},   label:__('Hover Background') }
            ] } )
          )
        ),
        el( 'p', { style: { color:'#6b7280', fontSize:12, marginBottom:4 } }, __('Preview — actual pages render on the frontend.','blockenberg') ),
        renderPagination( attrs, true )
      );
    },
    save: function ( props ) {
      return renderPagination( props.attributes, false );
    }
  } );
} )();
