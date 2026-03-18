( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  function Stars( { count, color } ) {
    return el( 'div', { className: 'bktg-stars' },
      [1,2,3,4,5].map( n => el( 'span', { key: n, style: { color: n <= count ? color : '#ddd' } }, '★' ) )
    );
  }

  function ItemEditor( { item, index, onChange, onRemove, showStars, starColor, showAvatar } ) {
    function upd( key, val ) { onChange( index, Object.assign( {}, item, { [key]: val } ) ); }
    return el( 'div', { style: { border: '1px solid #ddd', borderRadius: '8px', padding: '12px', marginBottom: '8px', background: '#fafafa' } },
      el( TextareaControl, { label: __('Quote ') + (index+1), value: item.quote, onChange: v => upd('quote',v), rows: 3 } ),
      el( TextControl,     { label: __('Author'), value: item.author, onChange: v => upd('author',v) } ),
      el( TextControl,     { label: __('Role'), value: item.role, onChange: v => upd('role',v) } ),
      showStars && el( RangeControl, { label: __('Stars'), value: item.stars, min: 1, max: 5, onChange: v => upd('stars',v) } ),
      showAvatar && el( 'div', null,
        item.avatarUrl
          ? el( 'div', { style: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' } },
              el( 'img', { src: item.avatarUrl, style: { width:48, height:48, borderRadius:'50%', objectFit:'cover' } } ),
              el( Button, { isDestructive:true, isSmall:true, onClick: () => { upd('avatarUrl',''); upd('avatarId',0); } }, __('Remove') )
            )
          : el( MediaUploadCheck, null,
              el( MediaUpload, {
                onSelect: m => { upd('avatarUrl', m.url); upd('avatarId', m.id); },
                allowedTypes: ['image'], value: item.avatarId,
                render: ({ open }) => el( Button, { onClick: open, isSmall:true, variant:'secondary' }, __('Upload Avatar') )
              } )
            )
      ),
      el( Button, { isDestructive: true, isSmall: true, onClick: () => onRemove(index) }, __('Remove') )
    );
  }

  function renderCard( item, attr ) {
    const cardStyle = {
      background: attr.cardBg,
      borderRadius: attr.borderRadius + 'px',
      padding: attr.cardPadding + 'px',
      boxShadow: attr.shadow ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
      color: attr.textColor,
      textAlign: attr.quoteAlign,
    };
    return el( 'div', { className: 'bktg-card', style: cardStyle },
      el( 'div', { className: 'bktg-quote-mark', style: { color: attr.accentColor } }, '\u201C' ),
      el( 'p', { className: 'bktg-quote', style: { color: attr.textColor } }, item.quote ),
      attr.showStars && el( Stars, { count: item.stars, color: attr.starColor } ),
      el( 'div', { className: 'bktg-author-row', style: { justifyContent: attr.quoteAlign === 'center' ? 'center' : 'flex-start' } },
        attr.showAvatar && (
          item.avatarUrl
            ? el( 'img', { src: item.avatarUrl, alt: item.author, className: 'bktg-avatar', style: { borderColor: attr.accentColor } } )
            : el( 'div', { className: 'bktg-avatar bktg-avatar-init', style: { background: attr.accentColor } },
                el('span', null, (item.author||'A').charAt(0))
              )
        ),
        el( 'div', null,
          el( 'strong', { className: 'bktg-name', style: { color: attr.textColor } }, item.author ),
          el( 'span',  { className: 'bktg-role' }, item.role )
        )
      )
    );
  }

  registerBlockType( 'blockenberg/testimonial-grid', {
    edit: function ( props ) {
      const { attributes: attr, setAttributes } = props;

      function updateItem( idx, next ) { const items = attr.items.slice(); items[idx] = next; setAttributes({ items }); }
      function removeItem( idx ) { setAttributes({ items: attr.items.filter((_,i) => i !== idx) }); }

      const wrapStyle = (function () {
        var _tvf = getTypoCssVars();
        var s = {
          '--bktg-cols': attr.columns,
          '--bktg-gap': attr.gap + 'px',
          background: attr.bgColor,
          padding: '32px',
          borderRadius: '12px',
        };
        if (_tvf) {
          Object.assign(s, _tvf(attr.quoteTypo, '--bktg-qt-'));
          Object.assign(s, _tvf(attr.nameTypo, '--bktg-nm-'));
        }
        return s;
      })();

      return el( 'div', { className: 'bktg-wrap', style: wrapStyle },

        el( InspectorControls, null,
          el( PanelBody, { title: __('Testimonials'), initialOpen: true },
            attr.items.map( (item, i) => el( ItemEditor, { key: i, item, index: i, onChange: updateItem, onRemove: removeItem, showStars: attr.showStars, starColor: attr.starColor, showAvatar: attr.showAvatar } ) ),
            el( Button, { variant:'secondary', onClick: () => setAttributes({ items: [...attr.items, { quote:'New testimonial.', author:'New Author', role:'Title', avatarUrl:'', avatarId:0, stars:5 }] }), style:{ width:'100%', justifyContent:'center', marginTop:'8px' } }, __('+ Add Testimonial') )
          ),
          el( PanelBody, { title: __('Layout'), initialOpen: false },
            el( RangeControl, { label: __('Columns'), value: attr.columns, min: 1, max: 4, onChange: v => setAttributes({columns:v}) } ),
            el( RangeControl, { label: __('Gap (px)'), value: attr.gap, min: 8, max: 60, onChange: v => setAttributes({gap:v}) } ),
            el( SelectControl, { label: __('Quote Alignment'), value: attr.quoteAlign, options: [{label:'Left',value:'left'},{label:'Center',value:'center'}], onChange: v => setAttributes({quoteAlign:v}) } ),
            el( ToggleControl, { label: __('Show Stars'), checked: attr.showStars, onChange: v => setAttributes({showStars:v}), __nextHasNoMarginBottom: true } ),
            el( ToggleControl, { label: __('Show Avatars'), checked: attr.showAvatar, onChange: v => setAttributes({showAvatar:v}), __nextHasNoMarginBottom: true } ),
            el( ToggleControl, { label: __('Card Shadow'), checked: attr.shadow, onChange: v => setAttributes({shadow:v}), __nextHasNoMarginBottom: true } )
          ),
          el( PanelBody, { title: __('Card Style'), initialOpen: false },
            el( RangeControl, { label: __('Border Radius'), value: attr.borderRadius, min:0, max:40, onChange: v => setAttributes({borderRadius:v}) } ),
            el( RangeControl, { label: __('Card Padding'), value: attr.cardPadding, min:12, max:80, onChange: v => setAttributes({cardPadding:v}) } ),
            ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              getTypoControl()({ label: __('Quote', 'blockenberg'), value: attr.quoteTypo, onChange: v => setAttributes({quoteTypo:v}) }),
              getTypoControl()({ label: __('Author Name', 'blockenberg'), value: attr.nameTypo, onChange: v => setAttributes({nameTypo:v}) })
          ),
el( PanelColorSettings, {
            title: __('Colors'), initialOpen: false,
            colorSettings: [
              { label: __('Wrapper Background'), value: attr.bgColor, onChange: v => setAttributes({bgColor: v||'#f8f7ff'}) },
              { label: __('Card Background'), value: attr.cardBg, onChange: v => setAttributes({cardBg: v||'#ffffff'}) },
              { label: __('Text Color'), value: attr.textColor, onChange: v => setAttributes({textColor: v||'#222222'}) },
              { label: __('Accent / Quote Mark'), value: attr.accentColor, onChange: v => setAttributes({accentColor: v||'#6c3fb5'}) },
              { label: __('Star Color'), value: attr.starColor, onChange: v => setAttributes({starColor: v||'#f5a623'}) },
            ]
          } )
        ),

        el( 'div', { className: 'bktg-grid' },
          attr.items.map( (item, i) => el('div', {key:i, className:'bktg-grid-item'}, renderCard(item, attr)) )
        )
      );
    },

    save: function ( { attributes: attr } ) {
      const wrapStyle = (function () {
        var _tvf = getTypoCssVars();
        var s = {
          '--bktg-cols': attr.columns,
          '--bktg-gap': attr.gap + 'px',
          background: attr.bgColor,
        };
        if (_tvf) {
          Object.assign(s, _tvf(attr.quoteTypo, '--bktg-qt-'));
          Object.assign(s, _tvf(attr.nameTypo, '--bktg-nm-'));
        }
        return s;
      })();
      return el( 'div', { className: 'bktg-wrap', style: wrapStyle },
        el( 'div', { className: 'bktg-grid' },
          attr.items.map( (item, i) =>
            el( 'div', { key: i, className: 'bktg-grid-item' },
              el( 'div', {
                className: 'bktg-card',
                style: {
                  background: attr.cardBg,
                  borderRadius: attr.borderRadius + 'px',
                  padding: attr.cardPadding + 'px',
                  boxShadow: attr.shadow ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
                  textAlign: attr.quoteAlign,
                  color: attr.textColor,
                }
              },
                el('div', { className: 'bktg-quote-mark', style: { color: attr.accentColor } }, '\u201C'),
                el('p', { className: 'bktg-quote', style: { color: attr.textColor } }, item.quote),
                attr.showStars && el( 'div', { className: 'bktg-stars' },
                  [1,2,3,4,5].map(n => el('span', {key:n, style:{color: n<=item.stars ? attr.starColor : '#ddd'}}, '★'))
                ),
                el('div', { className: 'bktg-author-row' },
                  attr.showAvatar && (
                    item.avatarUrl
                      ? el('img', { src: item.avatarUrl, alt: item.author, className: 'bktg-avatar', style:{borderColor:attr.accentColor} })
                      : el('div', { className: 'bktg-avatar bktg-avatar-init', style:{background:attr.accentColor} }, el('span',null,(item.author||'A').charAt(0)))
                  ),
                  el('div', null,
                    el('strong', { className:'bktg-name', style:{color:attr.textColor} }, item.author),
                    el('span',   { className:'bktg-role' }, item.role)
                  )
                )
              )
            )
          )
        )
      );
    }
  });
}() );
