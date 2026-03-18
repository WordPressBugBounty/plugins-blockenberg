( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;
  const useState = window.wp.element.useState;
  const Fragment = window.wp.element.Fragment;
  let _tc; const getTypoControl = () => _tc || (_tc = window.bkbgTypographyControl);
  let _tv; const getTypoCssVars = () => _tv || (_tv = window.bkbgTypoCssVars);

  function SlideEditor( { slide, index, onChange, onRemove } ) {
    function upd(k,v){ onChange(index, Object.assign({}, slide, {[k]:v})); }
    return el('div', { style:{border:'1px solid #ddd',borderRadius:'8px',padding:'12px',marginBottom:'8px',background:'#fafafa'} },
      el('strong', { style:{display:'block',marginBottom:'8px'} }, __('Slide ') + (index+1)),
      el('label', {style:{fontSize:'11px',fontWeight:600,display:'block',marginBottom:'4px'}}  , __('Background Image')),
      slide.imageUrl
        ? el('div', {style:{marginBottom:'8px'}},
            el('img', {src:slide.imageUrl, style:{width:'100%',height:'80px',objectFit:'cover',borderRadius:'6px',display:'block',marginBottom:'4px'}}),
            el(Button, {isDestructive:true, isSmall:true, onClick:()=>{upd('imageUrl','');upd('imageId',0);}}, __('Remove'))
          )
        : el(MediaUploadCheck, null,
            el(MediaUpload, {
              onSelect: m=>{upd('imageUrl',m.url);upd('imageId',m.id);},
              allowedTypes:['image'], value:slide.imageId,
              render:({open})=>el(Button,{onClick:open,isSmall:true,variant:'secondary'}, __('Upload Image'))
            })
          ),
      el(TextControl, {label:__('Title'), value:slide.title, onChange:v=>upd('title',v)}),
      el(TextareaControl, {label:__('Excerpt'), value:slide.excerpt, onChange:v=>upd('excerpt',v), rows:2}),
      el(TextControl, {label:__('Button Label'), value:slide.btnLabel, onChange:v=>upd('btnLabel',v)}),
      el(TextControl, {label:__('Button URL'), value:slide.btnUrl, onChange:v=>upd('btnUrl',v)}),
      el(Button, {isDestructive:true, isSmall:true, onClick:()=>onRemove(index)}, __('Remove Slide'))
    );
  }

  registerBlockType('blockenberg/post-slider', {
    edit: function(props) {
      const { attributes: attr, setAttributes } = props;
      const [activeIdx, setActiveIdx] = useState(0);

      function updateSlide(idx, next){ const s=attr.slides.slice(); s[idx]=next; setAttributes({slides:s}); }
      function removeSlide(idx){ const s=attr.slides.filter((_,i)=>i!==idx); setAttributes({slides:s}); setActiveIdx(Math.min(activeIdx, s.length-1)); }
      function addSlide(){ setAttributes({slides:[...attr.slides,{imageUrl:'',imageId:0,title:'New Slide',excerpt:'Caption here.',btnLabel:'Read More',btnUrl:'#'}]}); }

      const current = attr.slides[activeIdx] || attr.slides[0] || {};
      const heightVal = attr.height + attr.heightUnit;

      const _tvFn = getTypoCssVars();
      const wrapStyle = Object.assign({
        '--bkps-height': heightVal,
        '--bkps-overlay': attr.overlayBg,
        '--bkps-text': attr.textColor,
        '--bkps-accent': attr.accentColor,
        '--bkps-radius': attr.borderRadius + 'px',
        borderRadius: attr.borderRadius + 'px',
        overflow: 'hidden',
        position: 'relative',
      }, _tvFn(attr.titleTypo, '--bkps-tt-'), _tvFn(attr.excerptTypo, '--bkps-ex-'));

      const slideStyle = {
        backgroundImage: current.imageUrl ? `url(${current.imageUrl})` : 'none',
        backgroundColor: current.imageUrl ? 'transparent' : '#1e0a3c',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: heightVal,
      };

      const boxAlign = attr.captionAlign === 'center' ? 'center' : attr.captionAlign === 'right' ? 'flex-end' : 'flex-start';

      return el('div', { className:'bkps-wrap', style: wrapStyle },

        el(InspectorControls, null,
          el(PanelBody, {title:__('Slides'), initialOpen:true},
            attr.slides.map((slide,i)=>el(SlideEditor,{key:i,slide,index:i,onChange:updateSlide,onRemove:removeSlide})),
            el(Button,{variant:'secondary',onClick:addSlide,style:{width:'100%',justifyContent:'center',marginTop:'8px'}}, __('+ Add Slide'))
          ),
          el(PanelBody, {title:__('Slider Settings'), initialOpen:false},
            el(RangeControl, {label:__('Height (px)'), value:attr.height, min:200, max:900, onChange:v=>setAttributes({height:v})}),
            el(SelectControl, {label:__('Transition'), value:attr.transition, options:[{label:'Fade',value:'fade'},{label:'Slide',value:'slide'}], onChange:v=>setAttributes({transition:v})}),
            el(ToggleControl, {label:__('Autoplay'), checked:attr.autoplay, onChange:v=>setAttributes({autoplay:v}), __nextHasNoMarginBottom:true}),
            attr.autoplay && el(RangeControl, {label:__('Speed (ms)'), value:attr.speed, min:1500, max:9000, step:500, onChange:v=>setAttributes({speed:v})}),
            el(ToggleControl, {label:__('Show Arrows'), checked:attr.showArrows, onChange:v=>setAttributes({showArrows:v}), __nextHasNoMarginBottom:true}),
            el(ToggleControl, {label:__('Show Dots'), checked:attr.showDots, onChange:v=>setAttributes({showDots:v}), __nextHasNoMarginBottom:true}),
            el(SelectControl, {label:__('Caption Alignment'), value:attr.captionAlign, options:[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}], onChange:v=>setAttributes({captionAlign:v})})
          ),
          el(PanelBody, {title:__('Typography'), initialOpen:false},
            (() => {
                const TC = getTypoControl();
                if (!TC) return el('p', null, 'Loading…');
                return el(Fragment, null,
                    el(TC, { label: 'Title Typography', value: attr.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                    el(TC, { label: 'Excerpt Typography', value: attr.excerptTypo, onChange: v => setAttributes({ excerptTypo: v }) })
                );
            })(),
            el(RangeControl, {label:__('Border Radius (px)'), value:attr.borderRadius, min:0, max:32, onChange:v=>setAttributes({borderRadius:v})})
          ),
          el(PanelColorSettings, {
            title:__('Colors'), initialOpen:false,
            colorSettings:[
              {label:__('Overlay Color'), value:attr.overlayBg, onChange:v=>setAttributes({overlayBg:v||'rgba(0,0,0,0.45)'})},
              {label:__('Text Color'), value:attr.textColor, onChange:v=>setAttributes({textColor:v||'#ffffff'})},
              {label:__('Accent / Button'), value:attr.accentColor, onChange:v=>setAttributes({accentColor:v||'#6c3fb5'})},
            ]
          })
        ),

        /* Editor preview */
        el('div', {className:'bkps-slide bkps-active', style: slideStyle},
          el('div', {className:'bkps-overlay'}),
          el('div', {className:'bkps-caption', style:{alignItems: boxAlign, textAlign: attr.captionAlign}},
            el('h2', {className:'bkps-title'}, current.title),
            el('p',  {className:'bkps-excerpt'}, current.excerpt),
            current.btnLabel && el('span', {className:'bkps-btn'}, current.btnLabel)
          )
        ),

        attr.showArrows && el('div', {className:'bkps-arrows'},
          el('button', {className:'bkps-arrow bkps-prev', onClick:()=>setActiveIdx((activeIdx-1+attr.slides.length)%attr.slides.length)}, '‹'),
          el('button', {className:'bkps-arrow bkps-next', onClick:()=>setActiveIdx((activeIdx+1)%attr.slides.length)}, '›')
        ),
        attr.showDots && el('div', {className:'bkps-dots'},
          attr.slides.map((_,i)=>el('button',{key:i, className:'bkps-dot'+(i===activeIdx?' bkps-dot-active':''), onClick:()=>setActiveIdx(i)}))
        )
      );
    },

    deprecated: [{
      attributes: {
        slides:           { type: 'array',   default: [{imageUrl:'',imageId:0,title:'Slide One Headline',excerpt:'A short caption describing this featured post or section.',btnLabel:'Read More',btnUrl:'#'},{imageUrl:'',imageId:0,title:'Slide Two Headline',excerpt:'A short caption describing this featured post or section.',btnLabel:'Read More',btnUrl:'#'}] },
        height:           { type: 'number',  default: 500 },
        heightUnit:       { type: 'string',  default: 'px' },
        transition:       { type: 'string',  default: 'fade' },
        autoplay:         { type: 'boolean', default: true },
        speed:            { type: 'number',  default: 4000 },
        overlayBg:        { type: 'string',  default: 'rgba(0,0,0,0.45)' },
        captionAlign:     { type: 'string',  default: 'left' },
        textColor:        { type: 'string',  default: '#ffffff' },
        accentColor:      { type: 'string',  default: '#6c3fb5' },
        showArrows:       { type: 'boolean', default: true },
        showDots:         { type: 'boolean', default: true },
        titleSz:          { type: 'number',  default: 42 },
        excerptSz:        { type: 'number',  default: 16 },
        borderRadius:     { type: 'number',  default: 0 },
        titleFontWeight:  { type: 'string',  default: '700' },
        excerptFontWeight:{ type: 'string',  default: '400' }
      },
      save: function({ attributes: attr }) {
        const wrapStyle = {
          '--bkps-height': attr.height + attr.heightUnit,
          '--bkps-overlay': attr.overlayBg,
          '--bkps-text': attr.textColor,
          '--bkps-accent': attr.accentColor,
          '--bkps-title-sz': attr.titleSz + 'px',
          '--bkps-excerpt-sz': attr.excerptSz + 'px',
          '--bkps-radius': attr.borderRadius + 'px',
        };
        return el('div', {
          className: 'bkps-wrap bkps-transition-' + attr.transition,
          style: wrapStyle,
          'data-autoplay': attr.autoplay ? '1' : '0',
          'data-speed': attr.speed,
          'data-arrows': attr.showArrows ? '1' : '0',
          'data-dots': attr.showDots ? '1' : '0',
        },
          el('div', {className:'bkps-track'},
            attr.slides.map((slide, i)=>
              el('div', {key:i, className:'bkps-slide'+(i===0?' bkps-active':''),
                style:{backgroundImage: slide.imageUrl ? `url(${slide.imageUrl})` : 'none', backgroundColor: slide.imageUrl ? 'transparent':'#1e0a3c'}
              },
                el('div', {className:'bkps-overlay'}),
                el('div', {className:'bkps-caption', style:{textAlign:attr.captionAlign, alignItems:attr.captionAlign==='center'?'center':attr.captionAlign==='right'?'flex-end':'flex-start'}},
                  el('h2', {className:'bkps-title'}, slide.title),
                  el('p',  {className:'bkps-excerpt'}, slide.excerpt),
                  slide.btnLabel && el('a', {href:slide.btnUrl, className:'bkps-btn'}, slide.btnLabel)
                )
              )
            )
          ),
          attr.showArrows && el('div', {className:'bkps-arrows'},
            el('button', {className:'bkps-arrow bkps-prev','aria-label':'Previous'}, '\u2039'),
            el('button', {className:'bkps-arrow bkps-next','aria-label':'Next'}, '\u203A')
          ),
          attr.showDots && el('div', {className:'bkps-dots'})
        );
      }
    }],

    save: function({ attributes: attr }) {
      const _tvFn = getTypoCssVars();
      const wrapStyle = Object.assign({
        '--bkps-height': attr.height + attr.heightUnit,
        '--bkps-overlay': attr.overlayBg,
        '--bkps-text': attr.textColor,
        '--bkps-accent': attr.accentColor,
        '--bkps-radius': attr.borderRadius + 'px',
      }, _tvFn(attr.titleTypo, '--bkps-tt-'), _tvFn(attr.excerptTypo, '--bkps-ex-'));
      return el('div', {
        className: 'bkps-wrap bkps-transition-' + attr.transition,
        style: wrapStyle,
        'data-autoplay': attr.autoplay ? '1' : '0',
        'data-speed': attr.speed,
        'data-arrows': attr.showArrows ? '1' : '0',
        'data-dots': attr.showDots ? '1' : '0',
      },
        el('div', {className:'bkps-track'},
          attr.slides.map((slide, i)=>
            el('div', {key:i, className:'bkps-slide'+(i===0?' bkps-active':''),
              style:{backgroundImage: slide.imageUrl ? `url(${slide.imageUrl})` : 'none', backgroundColor: slide.imageUrl ? 'transparent':'#1e0a3c'}
            },
              el('div', {className:'bkps-overlay'}),
              el('div', {className:'bkps-caption', style:{textAlign:attr.captionAlign, alignItems:attr.captionAlign==='center'?'center':attr.captionAlign==='right'?'flex-end':'flex-start'}},
                el('h2', {className:'bkps-title'}, slide.title),
                el('p',  {className:'bkps-excerpt'}, slide.excerpt),
                slide.btnLabel && el('a', {href:slide.btnUrl, className:'bkps-btn'}, slide.btnLabel)
              )
            )
          )
        ),
        attr.showArrows && el('div', {className:'bkps-arrows'},
          el('button', {className:'bkps-arrow bkps-prev','aria-label':'Previous'}, '‹'),
          el('button', {className:'bkps-arrow bkps-next','aria-label':'Next'}, '›')
        ),
        attr.showDots && el('div', {className:'bkps-dots'})
      );
    }
  });
}() );
