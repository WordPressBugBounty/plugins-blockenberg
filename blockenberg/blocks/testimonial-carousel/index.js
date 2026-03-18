( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;
  const useState = window.wp.element.useState;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  function StarRating( { count, color } ) {
    return el( 'div', { className: 'bktc-stars' },
      [1,2,3,4,5].map( n =>
        el( 'span', { key: n, className: 'bktc-star', style: { color: n <= count ? color : '#ddd' } }, '★' )
      )
    );
  }

  function ItemEditor( { item, index, onChange, onRemove, showStars, starColor } ) {
    function upd( key, val ) {
      const next = Object.assign( {}, item, { [key]: val } );
      onChange( index, next );
    }
    return el( 'div', { className: 'bktc-item-editor', style: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fafafa' } },
      el( TextareaControl, {
        label: __( 'Quote' ) + ' ' + ( index + 1 ),
        value: item.quote,
        onChange: v => upd( 'quote', v ),
        rows: 3
      } ),
      el( TextControl, {
        label: __( 'Author Name' ),
        value: item.author,
        onChange: v => upd( 'author', v )
      } ),
      el( TextControl, {
        label: __( 'Role / Company' ),
        value: item.role,
        onChange: v => upd( 'role', v )
      } ),
      showStars && el( RangeControl, {
        label: __( 'Stars' ),
        value: item.stars,
        min: 1, max: 5,
        onChange: v => upd( 'stars', v )
      } ),
      el( 'label', { style: { fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' } }, __( 'Avatar' ) ),
      item.avatarUrl
        ? el( 'div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
            el( 'img', { src: item.avatarUrl, style: { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' } } ),
            el( Button, { isDestructive: true, isSmall: true, onClick: () => { upd( 'avatarUrl', '' ); upd( 'avatarId', 0 ); } }, __( 'Remove' ) )
          )
        : el( MediaUploadCheck, null,
            el( MediaUpload, {
              onSelect: m => { upd( 'avatarUrl', m.url ); upd( 'avatarId', m.id ); },
              allowedTypes: ['image'],
              value: item.avatarId,
              render: ( { open } ) => el( Button, { onClick: open, isSmall: true, variant: 'secondary' }, __( 'Upload Avatar' ) )
            } )
          ),
      el( Button, { isDestructive: true, isSmall: true, onClick: () => onRemove( index ) }, __( 'Remove Item' ) )
    );
  }

  function renderCard( item, showStars, starColor, cardAlign, cardBg, textColor, accentColor, cardPadding, borderRadius ) {
    const style = {
      '--bktc-card-bg': cardBg,
      '--bktc-text': textColor,
      '--bktc-accent': accentColor,
      '--bktc-pad': cardPadding + 'px',
      '--bktc-radius': borderRadius + 'px',
      textAlign: cardAlign,
    };
    return el( 'div', { className: 'bktc-card', style },
      el( 'div', { className: 'bktc-quote-mark' }, '\u201C' ),
      el( 'p', { className: 'bktc-quote' }, item.quote ),
      showStars && el( StarRating, { count: item.stars, color: starColor } ),
      el( 'div', { className: 'bktc-author-row' },
        item.avatarUrl
          ? el( 'img', { src: item.avatarUrl, alt: item.author, className: 'bktc-avatar' } )
          : el( 'div', { className: 'bktc-avatar bktc-avatar-initials' },
              el( 'span', null, ( item.author || 'A' ).charAt(0) )
            ),
        el( 'div', null,
          el( 'strong', { className: 'bktc-name' }, item.author ),
          el( 'span', { className: 'bktc-role' }, item.role )
        )
      )
    );
  }

  registerBlockType( 'blockenberg/testimonial-carousel', {
    edit: function ( props ) {
      const { attributes: attr, setAttributes } = props;
      const [activeIdx, setActiveIdx] = useState(0);

      function updateItem( idx, next ) {
        const items = attr.items.slice();
        items[idx] = next;
        setAttributes( { items } );
      }
      function removeItem( idx ) {
        const items = attr.items.filter( (_, i) => i !== idx );
        setAttributes( { items } );
        if ( activeIdx >= items.length ) setActiveIdx( Math.max(0, items.length - 1) );
      }
      function addItem() {
        setAttributes( { items: [ ...attr.items, { quote: 'New testimonial quote here.', author: 'New Author', role: 'Title', avatarUrl: '', avatarId: 0, stars: 5 } ] } );
      }

      const wrapStyle = (function () {
        var _tvf = getTypoCssVars();
        var s = {
          '--bktc-bg': attr.bgColor,
          '--bktc-accent': attr.accentColor,
          '--bktc-star': attr.starColor,
          background: attr.bgColor,
          borderRadius: attr.borderRadius + 'px',
          padding: '32px',
        };
        if (_tvf) {
          Object.assign(s, _tvf(attr.quoteTypo, '--bktc-qt-'));
          Object.assign(s, _tvf(attr.nameTypo, '--bktc-nm-'));
        }
        return s;
      })();

      const current = attr.items[ activeIdx ] || attr.items[0];

      return el( 'div', { className: 'bktc-wrap', style: wrapStyle },

        el( InspectorControls, null,

          el( PanelBody, { title: __( 'Testimonials' ), initialOpen: true },
            attr.items.map( (item, i) =>
              el( ItemEditor, { key: i, item, index: i, onChange: updateItem, onRemove: removeItem, showStars: attr.showStars, starColor: attr.starColor } )
            ),
            el( Button, { variant: 'secondary', onClick: addItem, style: { width: '100%', justifyContent: 'center' } }, __( '+ Add Testimonial' ) )
          ),

          el( PanelBody, { title: __( 'Carousel Settings' ), initialOpen: false },
            el( ToggleControl, { label: __( 'Autoplay' ), checked: attr.autoplay, onChange: v => setAttributes( { autoplay: v } ), __nextHasNoMarginBottom: true } ),
            attr.autoplay && el( RangeControl, { label: __( 'Autoplay Speed (ms)' ), value: attr.speed, min: 1000, max: 8000, step: 500, onChange: v => setAttributes( { speed: v } ) } ),
            el( ToggleControl, { label: __( 'Pause on Hover' ), checked: attr.pauseOnHover, onChange: v => setAttributes( { pauseOnHover: v } ), __nextHasNoMarginBottom: true } ),
            el( ToggleControl, { label: __( 'Loop' ), checked: attr.loop, onChange: v => setAttributes( { loop: v } ), __nextHasNoMarginBottom: true } ),
            el( ToggleControl, { label: __( 'Show Arrows' ), checked: attr.showArrows, onChange: v => setAttributes( { showArrows: v } ), __nextHasNoMarginBottom: true } ),
            el( ToggleControl, { label: __( 'Show Dots' ), checked: attr.showDots, onChange: v => setAttributes( { showDots: v } ), __nextHasNoMarginBottom: true } ),
            el( ToggleControl, { label: __( 'Show Stars' ), checked: attr.showStars, onChange: v => setAttributes( { showStars: v } ), __nextHasNoMarginBottom: true } ),
            el( SelectControl, {
              label: __( 'Card Alignment' ),
              value: attr.cardAlign,
              options: [ { label: 'Center', value: 'center' }, { label: 'Left', value: 'left' } ],
              onChange: v => setAttributes( { cardAlign: v } )
            } )
          ),

          el( PanelBody, { title: __( 'Card Style' ), initialOpen: false },
            el( RangeControl, { label: __( 'Border Radius (px)' ), value: attr.borderRadius, min: 0, max: 40, onChange: v => setAttributes( { borderRadius: v } ) } ),
            el( RangeControl, { label: __( 'Card Padding (px)' ), value: attr.cardPadding, min: 12, max: 80, onChange: v => setAttributes( { cardPadding: v } ) } )
          ),

          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              getTypoControl()({ label: __( 'Quote', 'blockenberg' ), value: attr.quoteTypo, onChange: v => setAttributes( { quoteTypo: v } ) }),
              getTypoControl()({ label: __( 'Author Name', 'blockenberg' ), value: attr.nameTypo, onChange: v => setAttributes( { nameTypo: v } ) })
          ),
el( PanelColorSettings, {
            title: __( 'Colors' ),
            initialOpen: false,
            colorSettings: [
              { label: __( 'Wrapper Background' ), value: attr.bgColor, onChange: v => setAttributes( { bgColor: v || '#f8f7ff' } ) },
              { label: __( 'Card Background' ), value: attr.cardBg, onChange: v => setAttributes( { cardBg: v || '#ffffff' } ) },
              { label: __( 'Text Color' ), value: attr.textColor, onChange: v => setAttributes( { textColor: v || '#222222' } ) },
              { label: __( 'Accent / Quote Mark' ), value: attr.accentColor, onChange: v => setAttributes( { accentColor: v || '#6c3fb5' } ) },
              { label: __( 'Star Color' ), value: attr.starColor, onChange: v => setAttributes( { starColor: v || '#f5a623' } ) },
            ]
          } )
        ),

        /* ── Editor preview ── */
        el( 'div', { className: 'bktc-preview' },
          current && renderCard( current, attr.showStars, attr.starColor, attr.cardAlign, attr.cardBg, attr.textColor, attr.accentColor, attr.cardPadding, attr.borderRadius ),

          attr.showArrows && el( 'div', { className: 'bktc-arrows bktc-arrows-editor' },
            el( 'button', { className: 'bktc-arrow bktc-prev', onClick: () => setActiveIdx( (activeIdx - 1 + attr.items.length) % attr.items.length ) }, '‹' ),
            el( 'button', { className: 'bktc-arrow bktc-next', onClick: () => setActiveIdx( (activeIdx + 1) % attr.items.length ) }, '›' )
          ),

          attr.showDots && el( 'div', { className: 'bktc-dots' },
            attr.items.map( (_, i) =>
              el( 'button', { key: i, className: 'bktc-dot' + ( i === activeIdx ? ' bktc-dot-active' : '' ), onClick: () => setActiveIdx(i) } )
            )
          )
        )
      );
    },

    save: function ( { attributes: attr } ) {
      const wrapStyle = (function () {
        var _tvf = getTypoCssVars();
        var s = {
          '--bktc-bg': attr.bgColor,
          '--bktc-card-bg': attr.cardBg,
          '--bktc-text': attr.textColor,
          '--bktc-accent': attr.accentColor,
          '--bktc-star': attr.starColor,
          '--bktc-pad': attr.cardPadding + 'px',
          '--bktc-radius': attr.borderRadius + 'px',
          '--bktc-speed': attr.speed + 'ms',
        };
        if (_tvf) {
          Object.assign(s, _tvf(attr.quoteTypo, '--bktc-qt-'));
          Object.assign(s, _tvf(attr.nameTypo, '--bktc-nm-'));
        }
        return s;
      })();

      return el( 'div', {
        className: 'bktc-wrap',
        style: wrapStyle,
        'data-autoplay': attr.autoplay ? '1' : '0',
        'data-speed': attr.speed,
        'data-loop': attr.loop ? '1' : '0',
        'data-hover': attr.pauseOnHover ? '1' : '0',
        'data-arrows': attr.showArrows ? '1' : '0',
        'data-dots': attr.showDots ? '1' : '0',
      },
        el( 'div', { className: 'bktc-track' },
          attr.items.map( (item, i) =>
            el( 'div', { key: i, className: 'bktc-slide' + ( i === 0 ? ' bktc-active' : '' ) },
              el( 'div', { className: 'bktc-card', style: { textAlign: attr.cardAlign } },
                el( 'div', { className: 'bktc-quote-mark' }, '\u201C' ),
                el( 'p', { className: 'bktc-quote' }, item.quote ),
                attr.showStars && el( 'div', { className: 'bktc-stars' },
                  [1,2,3,4,5].map( n =>
                    el( 'span', { key: n, className: 'bktc-star', style: { color: n <= item.stars ? attr.starColor : '#ddd' } }, '★' )
                  )
                ),
                el( 'div', { className: 'bktc-author-row' },
                  item.avatarUrl
                    ? el( 'img', { src: item.avatarUrl, alt: item.author, className: 'bktc-avatar' } )
                    : el( 'div', { className: 'bktc-avatar bktc-avatar-initials' },
                        el( 'span', null, (item.author || 'A').charAt(0) )
                      ),
                  el( 'div', null,
                    el( 'strong', { className: 'bktc-name' }, item.author ),
                    el( 'span', { className: 'bktc-role' }, item.role )
                  )
                )
              )
            )
          )
        ),
        attr.showArrows && el( 'div', { className: 'bktc-arrows' },
          el( 'button', { className: 'bktc-arrow bktc-prev', 'aria-label': 'Previous' }, '&#8249;' ),
          el( 'button', { className: 'bktc-arrow bktc-next', 'aria-label': 'Next' }, '&#8250;' )
        ),
        attr.showDots && el( 'div', { className: 'bktc-dots' } )
      );
    }
  } );
} )();
