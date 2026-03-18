( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var MediaUpload = wp.blockEditor.MediaUpload;
  var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
  var RichText = wp.blockEditor.RichText;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;
  var Button = wp.components.Button;

  function getTypographyControl() {
      return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
  }
  function getTypoCssVars() {
      return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
  }

  function renderGroup( attrs ) {
    var shown   = attrs.avatars.slice( 0, attrs.maxShown );
    var extra   = attrs.avatars.length - shown.length;
    var overlap = attrs.direction === 'left'
      ? attrs.overlap : -attrs.overlap;

    var _tv = getTypoCssVars();
    var wrapStyle = {
      '--bkag-size':  attrs.avatarSize + 'px',
      '--bkag-brd':   attrs.borderWidth + 'px solid ' + attrs.borderColor,
      '--bkag-cBg':   attrs.counterBg,
      '--bkag-cText': attrs.counterText
    };
    Object.assign( wrapStyle, _tv( attrs.counterTypo || {}, '--bkag-counter-' ) );
    Object.assign( wrapStyle, _tv( attrs.labelTypo || {}, '--bkag-label-' ) );

    return el( 'div', { className: 'bkag-wrap', style: wrapStyle },
      el( 'div', { className: 'bkag-group' },
        shown.map( function ( av, i ) {
          return el( 'img', {
            key: i,
            className: 'bkag-avatar',
            src: av.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Ccircle cx="24" cy="24" r="24" fill="%23ccc"/%3E%3C/svg%3E',
            alt: av.alt || '',
            title: av.alt || '',
            style: { marginLeft: i === 0 ? 0 : ( -attrs.overlap + 'px' ) }
          } );
        } ),
        extra > 0 && el( 'div', {
          className: 'bkag-counter',
          style: { marginLeft: -attrs.overlap + 'px' }
        }, '+' + extra )
      ),
      attrs.label && el( 'span', { className: 'bkag-label' }, attrs.label )
    );
  }

  registerBlockType( 'blockenberg/avatar-group', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Avatars', 'blockenberg' ), initialOpen: true },
            attrs.avatars.map( function ( av, i ) {
              return el( 'div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                av.url && el( 'img', { src: av.url, style: { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' } } ),
                el( TextControl, {
                  label: __( 'Alt Text', 'blockenberg' ),
                  value: av.alt || '',
                  onChange: function (v) {
                    var n = attrs.avatars.slice();
                    n[ i ] = Object.assign( {}, av, { alt: v } );
                    setAttr( { avatars: n } );
                  }
                } ),
                el( Button, { isSmall: true, isDestructive: true, onClick: function () {
                  setAttr( { avatars: attrs.avatars.filter( function ( _, j ) { return j !== i; } ) } );
                } }, '✕' )
              );
            } ),
            el( MediaUploadCheck, null,
              el( MediaUpload, {
                onSelect: function ( imgs ) {
                  var newAvs = ( Array.isArray( imgs ) ? imgs : [ imgs ] ).map( function (img) {
                    return { url: img.url, id: img.id, alt: img.alt || '' };
                  } );
                  setAttr( { avatars: attrs.avatars.concat( newAvs ) } );
                },
                allowedTypes: [ 'image' ],
                multiple: true,
                render: function ( ref ) {
                  return el( Button, { variant: 'secondary', onClick: ref.open, style: { marginTop: 8 } },
                    __( '+ Add Avatars', 'blockenberg' )
                  );
                }
              } )
            ),
            el( RangeControl, {
              label: __( 'Max Shown', 'blockenberg' ),
              value: attrs.maxShown, min: 1, max: Math.max( attrs.avatars.length, 10 ),
              onChange: function (v) { setAttr({ maxShown: v }); }
            } )
          ),
          el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
            el( SelectControl, {
              label: __( 'Stack Direction', 'blockenberg' ),
              value: attrs.direction,
              options: [
                { label: 'Right (left overlap)', value: 'right' },
                { label: 'Left (right overlap)', value: 'left' }
              ],
              onChange: function (v) { setAttr({ direction: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Avatar Size (px)', 'blockenberg' ),
              value: attrs.avatarSize, min: 24, max: 100,
              onChange: function (v) { setAttr({ avatarSize: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Overlap (px)', 'blockenberg' ),
              value: attrs.overlap, min: 0, max: attrs.avatarSize - 4,
              onChange: function (v) { setAttr({ overlap: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Border Width (px)', 'blockenberg' ),
              value: attrs.borderWidth, min: 0, max: 8,
              onChange: function (v) { setAttr({ borderWidth: v }); }
            } ),
            el( TextControl, {
              label: __( 'Label Text', 'blockenberg' ),
              value: attrs.label,
              onChange: function (v) { setAttr({ label: v }); }
            } )
          ),
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
            (function () {
                var TC = getTypographyControl();
                if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                return el(wp.element.Fragment, {},
                    el(TC, { label: __('Counter', 'blockenberg'), value: attrs.counterTypo || {}, onChange: function (v) { setAttr({ counterTypo: v }); } }),
                    el(TC, { label: __('Label', 'blockenberg'), value: attrs.labelTypo || {}, onChange: function (v) { setAttr({ labelTypo: v }); } })
                );
            })()
          ),
          el( PanelBody, { title: __( 'Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.borderColor, onChange: function(v){setAttr({borderColor:v||'#fff'});},      label: __('Avatar Border') },
                { value: attrs.counterBg,   onChange: function(v){setAttr({counterBg:v||'#6c3fb5'});},    label: __('Counter Background') },
                { value: attrs.counterText, onChange: function(v){setAttr({counterText:v||'#ffffff'});},   label: __('Counter Text') }
              ]
            } )
          )
        ),
        renderGroup( attrs )
      );
    },
    save: function ( props ) {
      return renderGroup( props.attributes );
    }
  } );
} )();
