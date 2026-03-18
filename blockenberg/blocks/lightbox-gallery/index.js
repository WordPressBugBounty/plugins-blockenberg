( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;

  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

  registerBlockType('blockenberg/lightbox-gallery', {
    edit: function(props) {
      const { attributes: attr, setAttributes } = props;

      function onSelectImages( mediaItems ) {
        const images = mediaItems.map( m => ({ id: m.id, url: m.url, alt: m.alt || '', caption: m.caption || '' }) );
        setAttributes({ images });
      }
      function removeImage(idx) {
        setAttributes({ images: attr.images.filter((_,i)=>i!==idx) });
      }
      function updateCaption(idx, caption) {
        const imgs = attr.images.slice();
        imgs[idx] = Object.assign({}, imgs[idx], { caption });
        setAttributes({ images: imgs });
      }

      const gridStyle = (function () {
        var _tvFn = getTypoCssVars();
        var s = {
          '--bklg-cols': attr.columns,
          '--bklg-gap': attr.gap + 'px',
          '--bklg-ratio': attr.imageRatio,
          '--bklg-radius': attr.borderRadius + 'px',
          '--bklg-overlay': attr.overlayBg,
        };
        if (_tvFn) Object.assign(s, _tvFn(attr.captionTypo, '--bklg-cap-'));
        return s;
      })();

      return el('div', {className:'bklg-wrap', style: gridStyle},

        el(InspectorControls, null,
          el(PanelBody, {title:__('Images'), initialOpen:true},
            el(MediaUploadCheck, null,
              el(MediaUpload, {
                onSelect: onSelectImages,
                allowedTypes:['image'],
                multiple: true,
                gallery: true,
                value: attr.images.map(i=>i.id),
                render:({open})=>el(Button, {onClick:open, variant:'primary', style:{width:'100%',justifyContent:'center',marginBottom:'12px'}}, __('Edit Gallery'))
              })
            ),
            attr.showCaptions && attr.images.map((img,i)=>
              el(TextControl, {key:i, label:__('Caption ') + (i+1), value:img.caption, onChange:v=>updateCaption(i,v)})
            ),
            attr.images.map((img,i)=>
              el('div', {key:i, style:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}},
                el('img', {src:img.url, style:{width:48,height:48,objectFit:'cover',borderRadius:'4px'}}),
                el(Button, {isDestructive:true, isSmall:true, onClick:()=>removeImage(i)}, '✕')
              )
            )
          ),
          el(PanelBody, {title:__('Layout'), initialOpen:false},
            el(RangeControl, {label:__('Columns'), value:attr.columns, min:1, max:6, onChange:v=>setAttributes({columns:v})}),
            el(RangeControl, {label:__('Gap (px)'), value:attr.gap, min:0, max:48, onChange:v=>setAttributes({gap:v})}),
            el(RangeControl, {label:__('Border Radius (px)'), value:attr.borderRadius, min:0, max:40, onChange:v=>setAttributes({borderRadius:v})}),
            el(SelectControl, {
              label:__('Image Ratio'), value:attr.imageRatio,
              options:[{label:'Square 1:1',value:'1/1'},{label:'Landscape 4:3',value:'4/3'},{label:'Landscape 16:9',value:'16/9'},{label:'Portrait 3:4',value:'3/4'}],
              onChange:v=>setAttributes({imageRatio:v})
            }),
            el(SelectControl, {
              label:__('Hover Effect'), value:attr.hoverEffect,
              options:[{label:'Zoom',value:'zoom'},{label:'Dim',value:'dim'},{label:'None',value:'none'}],
              onChange:v=>setAttributes({hoverEffect:v})
            }),
            el(ToggleControl, {label:__('Show Captions in Lightbox'), checked:attr.showCaptions, onChange:v=>setAttributes({showCaptions:v}), __nextHasNoMarginBottom:true})
          ),
          el(PanelColorSettings, {
            title:__('Colors'), initialOpen:false,
            colorSettings:[
              {label:__('Lightbox Overlay'), value:attr.overlayBg, onChange:v=>setAttributes({overlayBg:v||'rgba(0,0,0,0.92)'})},
            ]
          }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Caption'), value: attr.captionTypo || {}, onChange: function (v) { setAttributes({ captionTypo: v }); } })
                    ),

        ),

        attr.images.length === 0
          ? el('div', {className:'bklg-empty'},
              el(MediaUploadCheck, null,
                el(MediaUpload, {
                  onSelect:onSelectImages, allowedTypes:['image'], multiple:true, gallery:true, value:[],
                  render:({open})=>el('div', {onClick:open, className:'bklg-placeholder'},
                    el('span', {className:'dashicons dashicons-format-gallery'}),
                    el('p', null, __('Click to add images to the gallery'))
                  )
                })
              )
            )
          : el('div', {className:'bklg-grid bklg-hover-'+attr.hoverEffect},
              attr.images.map((img,i)=>
                el('div', {key:i, className:'bklg-item'},
                  el('div', {className:'bklg-thumb'},
                    el('img', {src:img.url, alt:img.alt, loading:'lazy'})
                  ),
                  attr.showCaptions && img.caption && el('p', {className:'bklg-caption'}, img.caption)
                )
              )
            )
      );
    },

    save: function({ attributes: attr }) {
      const wrapStyle = (function () {
        var _tvFn = getTypoCssVars();
        var s = {
          '--bklg-cols': attr.columns,
          '--bklg-gap': attr.gap + 'px',
          '--bklg-ratio': attr.imageRatio,
          '--bklg-radius': attr.borderRadius + 'px',
          '--bklg-overlay': attr.overlayBg,
        };
        if (_tvFn) Object.assign(s, _tvFn(attr.captionTypo, '--bklg-cap-'));
        return s;
      })();
      return el('div', {
        className:'bklg-wrap bklg-hover-'+attr.hoverEffect,
        style: wrapStyle,
        'data-lightbox': '1',
        'data-captions': attr.showCaptions ? '1' : '0',
      },
        el('div', {className:'bklg-grid'},
          attr.images.map((img,i)=>
            el('div', {key:i, className:'bklg-item', 'data-src':img.url, 'data-caption':img.caption||''},
              el('div', {className:'bklg-thumb'},
                el('img', {src:img.url, alt:img.alt, loading:'lazy'})
              ),
              attr.showCaptions && img.caption && el('p', {className:'bklg-caption'}, img.caption)
            )
          )
        )
      );
    }
  });
}() );
