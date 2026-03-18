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

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var v1Attributes = {
    message: { type: 'string', default: '\ud83c\udf89 Limited time offer \u2014 Save 20% today!' },
    linkLabel: { type: 'string', default: 'Shop Now' },
    linkUrl: { type: 'string', default: '#' },
    linkNewTab: { type: 'boolean', default: false },
    showLink: { type: 'boolean', default: true },
    showClose: { type: 'boolean', default: true },
    cookieDays: { type: 'number', default: 3 },
    position: { type: 'string', default: 'top' },
    bgColor: { type: 'string', default: '#6c3fb5' },
    bgColor2: { type: 'string', default: '#e91e8c' },
    useGradient: { type: 'boolean', default: true },
    textColor: { type: 'string', default: '#ffffff' },
    fontSize: { type: 'number', default: 15 },
    paddingV: { type: 'number', default: 12 },
    animation: { type: 'string', default: 'slideDown' },
    fontWeight: { type: 'number', default: 400 },
    lineHeight: { type: 'number', default: 1.5 }
  };

  registerBlockType( 'blockenberg/promo-banner', {
    deprecated: [{
      attributes: v1Attributes,
      save: function (props) {
        var attrs = props.attributes;
        var RichText = wp.blockEditor.RichText;
        var bg = attrs.useGradient
          ? 'linear-gradient(90deg, ' + attrs.bgColor + ', ' + attrs.bgColor2 + ')'
          : attrs.bgColor;
        return el( 'div', {
          className: 'bkpb-wrap bkpb-pos-' + attrs.position,
          style: {
            '--bkpb-bg':   bg,
            '--bkpb-text': attrs.textColor,
            '--bkpb-pv':   attrs.paddingV + 'px',
            '--bkpb-fs':   attrs.fontSize + 'px',
            '--bkpb-fw':   attrs.fontWeight,
            '--bkpb-lh':   attrs.lineHeight
          },
          'data-cookie': attrs.cookieDays,
          'data-animation': attrs.animation
        },
          el( RichText.Content, { tagName: 'span', className: 'bkpb-message', value: attrs.message } ),
          attrs.showLink && el( 'a', {
            className: 'bkpb-btn',
            href: attrs.linkUrl,
            target: attrs.linkNewTab ? '_blank' : '_self',
            rel: attrs.linkNewTab ? 'noopener noreferrer' : null
          }, attrs.linkLabel ),
          attrs.showClose && el( 'button', { className: 'bkpb-close', 'aria-label': 'Close' }, '\u00d7' )
        );
      }
    }],
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      var TC = getTypoControl();

      var bg = attrs.useGradient
        ? 'linear-gradient(90deg, ' + attrs.bgColor + ', ' + attrs.bgColor2 + ')'
        : attrs.bgColor;

      var wrapStyle = (function () {
        var _tv = getTypoCssVars();
        var s = {
          '--bkpb-bg':   bg,
          '--bkpb-text': attrs.textColor,
          '--bkpb-pv':   attrs.paddingV + 'px'
        };
        if (_tv) {
          Object.assign(s, _tv(attrs.msgTypo || {}, '--bkpb-msg-'));
        }
        return s;
      })();

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Content', 'blockenberg' ), initialOpen: true },
            el( ToggleControl, {
              label: __( 'Show Button / Link', 'blockenberg' ),
              checked: attrs.showLink,
              onChange: function (v) { setAttr({ showLink: v }); },
              __nextHasNoMarginBottom: true
            } ),
            attrs.showLink && el( TextControl, {
              label: __( 'Button Label', 'blockenberg' ),
              value: attrs.linkLabel,
              onChange: function (v) { setAttr({ linkLabel: v }); }
            } ),
            attrs.showLink && el( TextControl, {
              label: __( 'Button URL', 'blockenberg' ),
              value: attrs.linkUrl,
              onChange: function (v) { setAttr({ linkUrl: v }); }
            } ),
            attrs.showLink && el( ToggleControl, {
              label: __( 'Open in New Tab', 'blockenberg' ),
              checked: attrs.linkNewTab,
              onChange: function (v) { setAttr({ linkNewTab: v }); },
              __nextHasNoMarginBottom: true
            } ),
            el( ToggleControl, {
              label: __( 'Show Close Button', 'blockenberg' ),
              checked: attrs.showClose,
              onChange: function (v) { setAttr({ showClose: v }); },
              __nextHasNoMarginBottom: true
            } ),
            attrs.showClose && el( RangeControl, {
              label: __( 'Remember Close (days)', 'blockenberg' ),
              value: attrs.cookieDays, min: 0, max: 30,
              onChange: function (v) { setAttr({ cookieDays: v }); }
            } )
          ),
          el( PanelBody, { title: __( 'Appearance', 'blockenberg' ), initialOpen: false },
            el( SelectControl, {
              label: __( 'Position', 'blockenberg' ),
              value: attrs.position,
              options: [
                { label: 'Top Fixed',    value: 'top' },
                { label: 'Bottom Fixed', value: 'bottom' },
                { label: 'Inline',       value: 'inline' }
              ],
              onChange: function (v) { setAttr({ position: v }); }
            } ),
            el( SelectControl, {
              label: __( 'Entrance Animation', 'blockenberg' ),
              value: attrs.animation,
              options: [
                { label: 'Slide Down', value: 'slideDown' },
                { label: 'Fade In',    value: 'fadeIn' },
                { label: 'None',       value: 'none' }
              ],
              onChange: function (v) { setAttr({ animation: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Vertical Padding (px)', 'blockenberg' ),
              value: attrs.paddingV, min: 6, max: 32,
              onChange: function (v) { setAttr({ paddingV: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Use Gradient Background', 'blockenberg' ),
              checked: attrs.useGradient,
              onChange: function (v) { setAttr({ useGradient: v }); },
              __nextHasNoMarginBottom: true
            } )
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
            TC && el(TC, { label: __('Message', 'blockenberg'), value: attrs.msgTypo || {}, onChange: function(v) { setAttr({ msgTypo: v }); } })
          ),
el( PanelBody, { title: __( 'Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.bgColor,   onChange: function(v){setAttr({bgColor:v||'#6c3fb5'});},   label: __('Background / Gradient Start') },
                { value: attrs.bgColor2,  onChange: function(v){setAttr({bgColor2:v||'#e91e8c'});},  label: __('Gradient End') },
                { value: attrs.textColor, onChange: function(v){setAttr({textColor:v||'#ffffff'});}, label: __('Text Color') }
              ]
            } )
          )
        ),
        el( 'div', {
          className: 'bkpb-wrap bkpb-pos-' + attrs.position,
          style: wrapStyle
        },
          el( RichText, {
            tagName: 'span',
            className: 'bkpb-message',
            value: attrs.message,
            onChange: function (v) { setAttr({ message: v }); },
            placeholder: __( 'Your announcement text…', 'blockenberg' )
          } ),
          attrs.showLink && el( 'a', {
            className: 'bkpb-btn',
            href: attrs.linkUrl,
            target: attrs.linkNewTab ? '_blank' : '_self'
          }, attrs.linkLabel ),
          attrs.showClose && el( 'button', {
            className: 'bkpb-close',
            'aria-label': 'Close'
          }, '×' )
        )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      var bg = attrs.useGradient
        ? 'linear-gradient(90deg, ' + attrs.bgColor + ', ' + attrs.bgColor2 + ')'
        : attrs.bgColor;
      return el( 'div', {
        className: 'bkpb-wrap bkpb-pos-' + attrs.position,
        style: (function () {
          var _tv = getTypoCssVars();
          var s = {
            '--bkpb-bg':   bg,
            '--bkpb-text': attrs.textColor,
            '--bkpb-pv':   attrs.paddingV + 'px'
          };
          if (_tv) {
            Object.assign(s, _tv(attrs.msgTypo || {}, '--bkpb-msg-'));
          }
          return s;
        })(),
        'data-cookie': attrs.cookieDays,
        'data-animation': attrs.animation
      },
        el( RichText.Content, { tagName: 'span', className: 'bkpb-message', value: attrs.message } ),
        attrs.showLink && el( 'a', {
          className: 'bkpb-btn',
          href: attrs.linkUrl,
          target: attrs.linkNewTab ? '_blank' : '_self',
          rel: attrs.linkNewTab ? 'noopener noreferrer' : null
        }, attrs.linkLabel ),
        attrs.showClose && el( 'button', { className: 'bkpb-close', 'aria-label': 'Close' }, '×' )
      );
    }
  } );
} )();
