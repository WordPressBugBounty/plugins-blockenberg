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

  var _cbTC, _cbTV;
  function _tc() { return _cbTC || (_cbTC = window.bkbgTypographyControl); }
  function _tv(obj, prefix) { var fn = _cbTV || (_cbTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

  registerBlockType( 'blockenberg/cta-band', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;

      var bg = attrs.useGradient
        ? 'linear-gradient(135deg, ' + attrs.bgColor + ', ' + attrs.bgColor2 + ')'
        : attrs.bgColor;

      var wrapStyle = Object.assign({
        '--bkcb-bg':      bg,
        '--bkcb-text':    attrs.textColor,
        '--bkcb-pv':      attrs.paddingV + 'px',
        '--bkcb-ph':      attrs.paddingH + 'px',
        '--bkcb-hSz':     attrs.headlineSz + 'px',
        '--bkcb-sSz':     attrs.subtextSz + 'px',
        '--bkcb-btnBg':   attrs.btnBg,
        '--bkcb-btnText': attrs.btnText,
        '--bkcb-btnR':    attrs.btnRadius + 'px'
      }, _tv(attrs.typoHeadline, '--bkcb-hdl-'), _tv(attrs.typoSubtext, '--bkcb-sub-'));

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Content', 'blockenberg' ), initialOpen: true },
            el( TextControl, {
              label: __( 'Button Label', 'blockenberg' ),
              value: attrs.btnLabel,
              onChange: function (v) { setAttr({ btnLabel: v }); }
            } ),
            el( TextControl, {
              label: __( 'Button URL', 'blockenberg' ),
              value: attrs.btnUrl,
              onChange: function (v) { setAttr({ btnUrl: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Open in New Tab', 'blockenberg' ),
              checked: attrs.btnNewTab,
              onChange: function (v) { setAttr({ btnNewTab: v }); },
              __nextHasNoMarginBottom: true
            } )
          ),
          el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
            el( SelectControl, {
              label: __( 'Content Alignment', 'blockenberg' ),
              value: attrs.layout,
              options: [
                { label: 'Center',          value: 'center' },
                { label: 'Text left, Btn right', value: 'side' }
              ],
              onChange: function (v) { setAttr({ layout: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Gradient Background', 'blockenberg' ),
              checked: attrs.useGradient,
              onChange: function (v) { setAttr({ useGradient: v }); },
              __nextHasNoMarginBottom: true
            } )
          ),
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
            _tc() && el(_tc(), { label: __('Headline', 'blockenberg'), value: attrs.typoHeadline, onChange: function (v) { setAttr({ typoHeadline: v }); } }),
            _tc() && el(_tc(), { label: __('Subtext', 'blockenberg'), value: attrs.typoSubtext, onChange: function (v) { setAttr({ typoSubtext: v }); } })
          ),
          el( PanelBody, { title: __( 'Appearance', 'blockenberg' ), initialOpen: false },
            el( RangeControl, {
              label: __( 'Vertical Padding (px)', 'blockenberg' ),
              value: attrs.paddingV, min: 20, max: 120,
              onChange: function (v) { setAttr({ paddingV: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Horizontal Padding (px)', 'blockenberg' ),
              value: attrs.paddingH, min: 16, max: 100,
              onChange: function (v) { setAttr({ paddingH: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Button Border Radius (px)', 'blockenberg' ),
              value: attrs.btnRadius, min: 0, max: 40,
              onChange: function (v) { setAttr({ btnRadius: v }); }
            } )
          ),
          el( PanelBody, { title: __( 'Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.bgColor,   onChange: function(v){setAttr({bgColor:v||'#1a73e8'});},   label: __('Background / Gradient Start') },
                { value: attrs.bgColor2,  onChange: function(v){setAttr({bgColor2:v||'#0d47a1'});},  label: __('Gradient End') },
                { value: attrs.textColor, onChange: function(v){setAttr({textColor:v||'#ffffff'});}, label: __('Text') },
                { value: attrs.btnBg,     onChange: function(v){setAttr({btnBg:v||'#ffffff'});},     label: __('Button Background') },
                { value: attrs.btnText,   onChange: function(v){setAttr({btnText:v||'#1a73e8'});},   label: __('Button Text') }
              ]
            } )
          )
        ),
        el( 'div', { className: 'bkcb-wrap bkcb-layout-' + attrs.layout, style: wrapStyle },
          el( 'div', { className: 'bkcb-text' },
            el( RichText, {
              tagName: 'h2',
              className: 'bkcb-headline',
              value: attrs.headline,
              onChange: function (v) { setAttr({ headline: v }); },
              placeholder: __( 'Your headline…', 'blockenberg' )
            } ),
            el( RichText, {
              tagName: 'p',
              className: 'bkcb-subtext',
              value: attrs.subtext,
              onChange: function (v) { setAttr({ subtext: v }); },
              placeholder: __( 'Supporting text…', 'blockenberg' )
            } )
          ),
          el( 'a', {
            className: 'bkcb-btn',
            href: attrs.btnUrl,
            target: attrs.btnNewTab ? '_blank' : '_self'
          }, attrs.btnLabel )
        )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      var bg = attrs.useGradient
        ? 'linear-gradient(135deg, ' + attrs.bgColor + ', ' + attrs.bgColor2 + ')'
        : attrs.bgColor;
      return el( 'div', {
        className: 'bkcb-wrap bkcb-layout-' + attrs.layout,
        style: Object.assign({
          '--bkcb-bg':      bg,
          '--bkcb-text':    attrs.textColor,
          '--bkcb-pv':      attrs.paddingV + 'px',
          '--bkcb-ph':      attrs.paddingH + 'px',
          '--bkcb-hSz':     attrs.headlineSz + 'px',
          '--bkcb-sSz':     attrs.subtextSz + 'px',
          '--bkcb-btnBg':   attrs.btnBg,
          '--bkcb-btnText': attrs.btnText,
          '--bkcb-btnR':    attrs.btnRadius + 'px'
        }, _tv(attrs.typoHeadline, '--bkcb-hdl-'), _tv(attrs.typoSubtext, '--bkcb-sub-'))
      },
        el( 'div', { className: 'bkcb-text' },
          el( RichText.Content, { tagName: 'h2', className: 'bkcb-headline', value: attrs.headline } ),
          el( RichText.Content, { tagName: 'p', className: 'bkcb-subtext', value: attrs.subtext } )
        ),
        el( 'a', {
          className: 'bkcb-btn',
          href: attrs.btnUrl,
          target: attrs.btnNewTab ? '_blank' : '_self',
          rel: attrs.btnNewTab ? 'noopener noreferrer' : null
        }, attrs.btnLabel )
      );
    }
  } );
} )();
