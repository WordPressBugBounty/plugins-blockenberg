( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var RichText = wp.blockEditor.RichText;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;
  var useBlockProps = wp.blockEditor.useBlockProps;

  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

  registerBlockType( 'blockenberg/number-box', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      var radius = attrs.shape === 'circle' ? '50%' : attrs.borderRadius + 'px';

      var blockProps = useBlockProps((function () {
          var _tvf = getTypoCssVars();
          var s = {};
          if (_tvf) { Object.assign(s, _tvf(attrs.numberTypo, '--bknb-num-')); Object.assign(s, _tvf(attrs.labelTypo, '--bknb-lbl-')); }
          return { style: s };
      })());

      var wrapStyle = {
        '--bknb-bg':       attrs.bgColor,
        '--bknb-text':     attrs.textColor,
        '--bknb-label':    attrs.labelColor || attrs.textColor,
        '--bknb-numSz':    attrs.numberSz + 'px',
        '--bknb-numFw':    attrs.numberFontWeight || 700,
        '--bknb-labelSz':  attrs.labelSz + 'px',
        '--bknb-labelFw':  attrs.labelFontWeight || 500,
        '--bknb-lh':       attrs.lineHeight || 1.2,
        '--bknb-size':     attrs.boxSize + 'px',
        '--bknb-radius':   radius,
        '--bknb-brd':      attrs.border ? attrs.borderWidth + 'px solid ' + attrs.borderColor : 'none',
        '--bknb-shadow':   attrs.shadow ? '0 8px 32px rgba(0,0,0,.18)' : 'none'
      };

      return el( 'div', blockProps,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Content', 'blockenberg' ), initialOpen: true },
            el( TextControl, {
              label: __( 'Prefix', 'blockenberg' ),
              value: attrs.prefix,
              onChange: function (v) { setAttr({ prefix: v }); }
            } ),
            el( TextControl, {
              label: __( 'Suffix', 'blockenberg' ),
              value: attrs.suffix,
              onChange: function (v) { setAttr({ suffix: v }); }
            } )
          ),
          el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
            el( SelectControl, {
              label: __( 'Shape', 'blockenberg' ),
              value: attrs.shape,
              options: [
                { label: 'Square',  value: 'square' },
                { label: 'Circle',  value: 'circle' }
              ],
              onChange: function (v) { setAttr({ shape: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Box Size (px)', 'blockenberg' ),
              value: attrs.boxSize, min: 80, max: 320,
              onChange: function (v) { setAttr({ boxSize: v }); }
            } ),
            attrs.shape !== 'circle' && el( RangeControl, {
              label: __( 'Border Radius (px)', 'blockenberg' ),
              value: attrs.borderRadius, min: 0, max: 60,
              onChange: function (v) { setAttr({ borderRadius: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Box Shadow', 'blockenberg' ),
              checked: attrs.shadow,
              onChange: function (v) { setAttr({ shadow: v }); },
              __nextHasNoMarginBottom: true
            } ),
            el( ToggleControl, {
              label: __( 'Border', 'blockenberg' ),
              checked: attrs.border,
              onChange: function (v) { setAttr({ border: v }); },
              __nextHasNoMarginBottom: true
            } ),
            attrs.border && el( RangeControl, {
              label: __( 'Border Width (px)', 'blockenberg' ),
              value: attrs.borderWidth, min: 1, max: 8,
              onChange: function (v) { setAttr({ borderWidth: v }); }
            } )
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              el( getTypoControl(), { label: __( 'Number Typography', 'blockenberg' ), value: attrs.numberTypo, onChange: function (v) { setAttr({ numberTypo: v }); } } ),
              el( getTypoControl(), { label: __( 'Label Typography', 'blockenberg' ), value: attrs.labelTypo, onChange: function (v) { setAttr({ labelTypo: v }); } } )
          ),
el( PanelBody, { title: __( 'Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.bgColor,     onChange: function(v){setAttr({bgColor:v||'#6c3fb5'});},     label: __('Background') },
                { value: attrs.textColor,   onChange: function(v){setAttr({textColor:v||'#ffffff'});},   label: __('Number & Text') },
                { value: attrs.labelColor,  onChange: function(v){setAttr({labelColor:v||''});},         label: __('Label (override)') },
                { value: attrs.borderColor, onChange: function(v){setAttr({borderColor:v||'#e0d7f8'});}, label: __('Border') }
              ]
            } )
          )
        ),
        el( 'div', { className: 'bknb-outer' },
          el( 'div', { className: 'bknb-box bknb-shape-' + attrs.shape, style: wrapStyle },
            el( 'div', { className: 'bknb-number' },
              attrs.prefix && el( 'span', { className: 'bknb-prefix' }, attrs.prefix ),
              el( RichText, {
                tagName: 'span',
                className: 'bknb-value',
                value: attrs.number,
                onChange: function (v) { setAttr({ number: v }); },
                placeholder: '42'
              } ),
              attrs.suffix && el( 'span', { className: 'bknb-suffix' }, attrs.suffix )
            ),
            el( RichText, {
              tagName: 'p',
              className: 'bknb-label',
              value: attrs.label,
              onChange: function (v) { setAttr({ label: v }); },
              placeholder: __( 'Label…', 'blockenberg' )
            } )
          )
        )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      var _tvf = window.bkbgTypoCssVars;
      var radius = attrs.shape === 'circle' ? '50%' : attrs.borderRadius + 'px';
      var boxStyle = {
            '--bknb-bg':      attrs.bgColor,
            '--bknb-text':    attrs.textColor,
            '--bknb-label':   attrs.labelColor || attrs.textColor,
            '--bknb-numSz':   attrs.numberSz + 'px',
            '--bknb-numFw':   attrs.numberFontWeight || 700,
            '--bknb-labelSz': attrs.labelSz + 'px',
            '--bknb-labelFw': attrs.labelFontWeight || 500,
            '--bknb-lh':      attrs.lineHeight || 1.2,
            '--bknb-size':    attrs.boxSize + 'px',
            '--bknb-radius':  radius,
            '--bknb-brd':     attrs.border ? attrs.borderWidth + 'px solid ' + attrs.borderColor : 'none',
            '--bknb-shadow':  attrs.shadow ? '0 8px 32px rgba(0,0,0,.18)' : 'none'
      };
      if (_tvf) { Object.assign(boxStyle, _tvf(attrs.numberTypo, '--bknb-num-')); Object.assign(boxStyle, _tvf(attrs.labelTypo, '--bknb-lbl-')); }
      return el( 'div', { className: 'bknb-outer' },
        el( 'div', {
          className: 'bknb-box bknb-shape-' + attrs.shape,
          style: boxStyle
        },
          el( 'div', { className: 'bknb-number' },
            attrs.prefix && el( 'span', { className: 'bknb-prefix' }, attrs.prefix ),
            el( RichText.Content, { tagName: 'span', className: 'bknb-value', value: attrs.number } ),
            attrs.suffix && el( 'span', { className: 'bknb-suffix' }, attrs.suffix )
          ),
          el( RichText.Content, { tagName: 'p', className: 'bknb-label', value: attrs.label } )
        )
      );
    },
    deprecated: [{
      attributes: wp.blocks.getBlockType ? undefined : undefined,
      save: function ( props ) {
        var attrs = props.attributes;
        var radius = attrs.shape === 'circle' ? '50%' : attrs.borderRadius + 'px';
        return el( 'div', { className: 'bknb-outer' },
          el( 'div', {
            className: 'bknb-box bknb-shape-' + attrs.shape,
            style: {
              '--bknb-bg':      attrs.bgColor,
              '--bknb-text':    attrs.textColor,
              '--bknb-label':   attrs.labelColor || attrs.textColor,
              '--bknb-numSz':   attrs.numberSz + 'px',
              '--bknb-numFw':   attrs.numberFontWeight || 700,
              '--bknb-labelSz': attrs.labelSz + 'px',
              '--bknb-labelFw': attrs.labelFontWeight || 500,
              '--bknb-lh':      attrs.lineHeight || 1.2,
              '--bknb-size':    attrs.boxSize + 'px',
              '--bknb-radius':  radius,
              '--bknb-brd':     attrs.border ? attrs.borderWidth + 'px solid ' + attrs.borderColor : 'none',
              '--bknb-shadow':  attrs.shadow ? '0 8px 32px rgba(0,0,0,.18)' : 'none'
            }
          },
            el( 'div', { className: 'bknb-number' },
              attrs.prefix && el( 'span', { className: 'bknb-prefix' }, attrs.prefix ),
              el( RichText.Content, { tagName: 'span', className: 'bknb-value', value: attrs.number } ),
              attrs.suffix && el( 'span', { className: 'bknb-suffix' }, attrs.suffix )
            ),
            el( RichText.Content, { tagName: 'p', className: 'bknb-label', value: attrs.label } )
          )
        );
      }
    }]
  } );
} )();
