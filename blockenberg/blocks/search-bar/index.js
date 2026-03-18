( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;

  var SEARCH_ICON = el( 'svg', { viewBox:'0 0 24 24', fill:'currentColor', width:18, height:18, style:{display:'inline-block',verticalAlign:'middle'} },
    el( 'path', { d:'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z' } )
  );

  function renderBar( attrs, isEditor ) {
    var wrapStyle = {
      '--bksb-fieldBg':  attrs.fieldBg,
      '--bksb-fieldBrd': attrs.fieldBorder,
      '--bksb-fieldTxt': attrs.fieldText,
      '--bksb-btnBg':    attrs.btnBg,
      '--bksb-btnTxt':   attrs.btnText,
      '--bksb-radius':   attrs.borderRadius + 'px',
      '--bksb-h':        attrs.fieldHeight + 'px',
      '--bksb-fs':       attrs.fontSize + 'px',
      '--bksb-maxW':     attrs.maxWidth + 'px',
      '--bksb-align':    attrs.alignment === 'center' ? 'center' : attrs.alignment === 'right' ? 'flex-end' : 'flex-start'
    };
    return el( 'div', { className: 'bksb-wrap', style: wrapStyle },
      el( 'form', {
        className: 'bksb-form',
        role: 'search',
        action: isEditor ? null : '/',
        method: 'get',
        onSubmit: isEditor ? function(e){e.preventDefault();} : null
      },
        !isEditor && el( 'input', { type: 'hidden', name: 'post_type', value: 'any' } ),
        el( 'input', {
          className: 'bksb-input',
          type: 'search',
          name: isEditor ? null : 's',
          placeholder: attrs.placeholder,
          'data-live': attrs.liveSearch ? '1' : '0',
          readOnly: isEditor
        } ),
        attrs.showBtn && el( 'button', { className: 'bksb-btn', type: 'submit' },
          attrs.btnIcon && SEARCH_ICON,
          attrs.btnLabel && el( 'span', null, attrs.btnLabel )
        ),
        attrs.liveSearch && el( 'div', { className: 'bksb-results' } )
      )
    );
  }

  registerBlockType( 'blockenberg/search-bar', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __('Search Settings','blockenberg'), initialOpen: true },
            el( TextControl, { label:__('Placeholder','blockenberg'), value:attrs.placeholder, onChange:function(v){setAttr({placeholder:v});} } ),
            el( ToggleControl, { label:__('Show Button','blockenberg'), checked:attrs.showBtn, onChange:function(v){setAttr({showBtn:v});}, __nextHasNoMarginBottom:true } ),
            attrs.showBtn && el( ToggleControl, { label:__('Button Icon','blockenberg'), checked:attrs.btnIcon, onChange:function(v){setAttr({btnIcon:v});}, __nextHasNoMarginBottom:true } ),
            attrs.showBtn && el( TextControl, { label:__('Button Label','blockenberg'), value:attrs.btnLabel, onChange:function(v){setAttr({btnLabel:v});} } ),
            el( ToggleControl, { label:__('Live AJAX Search','blockenberg'), checked:attrs.liveSearch, onChange:function(v){setAttr({liveSearch:v});}, __nextHasNoMarginBottom:true } )
          ),
          el( PanelBody, { title: __('Style','blockenberg'), initialOpen: false },
            el( SelectControl, { label:__('Alignment','blockenberg'), value:attrs.alignment, options:[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'},{label:'Full Width',value:'full'}], onChange:function(v){setAttr({alignment:v});} } ),
            el( RangeControl, { label:__('Max Width (px)','blockenberg'), value:attrs.maxWidth, min:200, max:960, onChange:function(v){setAttr({maxWidth:v});} } ),
            el( RangeControl, { label:__('Field Height (px)','blockenberg'), value:attrs.fieldHeight, min:32, max:80, onChange:function(v){setAttr({fieldHeight:v});} } ),
            el( RangeControl, { label:__('Border Radius (px)','blockenberg'), value:attrs.borderRadius, min:0, max:40, onChange:function(v){setAttr({borderRadius:v});} } )
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              el( RangeControl, { label:__('Font Size (px)','blockenberg'), value:attrs.fontSize, min:12, max:24, onChange:function(v){setAttr({fontSize:v});} } )
          ),
el( PanelBody, { title: __('Colors','blockenberg'), initialOpen: false },
            el( PanelColorSettings, { title:__('Colors','blockenberg'), colorSettings:[
              { value:attrs.fieldBg,     onChange:function(v){setAttr({fieldBg:v||'#fff'});},      label:__('Field Background') },
              { value:attrs.fieldBorder, onChange:function(v){setAttr({fieldBorder:v||'#d1d5db'});},label:__('Field Border') },
              { value:attrs.fieldText,   onChange:function(v){setAttr({fieldText:v||'#111827'});},  label:__('Field Text') },
              { value:attrs.btnBg,       onChange:function(v){setAttr({btnBg:v||'#6c3fb5'});},      label:__('Button Background') },
              { value:attrs.btnText,     onChange:function(v){setAttr({btnText:v||'#ffffff'});},    label:__('Button Text') }
            ] } )
          )
        ),
        renderBar( attrs, true )
      );
    },
    save: function ( props ) {
      return renderBar( props.attributes, false );
    }
  } );
} )();
