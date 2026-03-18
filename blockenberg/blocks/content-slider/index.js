( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button, __experimentalGradientPicker: GradientPicker } = window.wp.components;
  const { __ } = window.wp.i18n;
  const useState = window.wp.element.useState;

  var _bkbgCSLgetTC, _bkbgCSLgetTV;
  function getTC() { return _bkbgCSLgetTC || (_bkbgCSLgetTC = window.bkbgTypographyControl); }
  function getTV() { return _bkbgCSLgetTV || (_bkbgCSLgetTV = window.bkbgTypoCssVars); }
  function tv(obj, prefix) { var fn = getTV(); return fn ? fn(obj, prefix) : {}; }

  function slideBg(slide) {
    if (slide.bgType==='image'&&slide.bgImageUrl) return {backgroundImage:`url(${slide.bgImageUrl})`,backgroundSize:'cover',backgroundPosition:'center'};
    if (slide.bgType==='gradient') return {backgroundImage:slide.bgGradient};
    return {backgroundColor:slide.bgColor};
  }

  function SlideEditor({ slide, index, onChange, onRemove }) {
    function upd(k,v){ onChange(index,Object.assign({},slide,{[k]:v})); }
    return el('div',{style:{border:'1px solid #ddd',borderRadius:'8px',padding:'12px',marginBottom:'10px',background:'#fafafa'}},
      el('strong',{style:{display:'block',marginBottom:'8px'}},__('Slide ') + (index+1)),
      el(SelectControl,{label:__('Background Type'),value:slide.bgType,
        options:[{label:'Solid Color',value:'color'},{label:'Gradient',value:'gradient'},{label:'Image',value:'image'}],
        onChange:v=>upd('bgType',v)}),
      slide.bgType==='color' && el('div',null,
        el('label',{style:{fontSize:'11px',fontWeight:600,display:'block',marginBottom:'4px'}},__('BG Color')),
        el('input',{type:'color',value:slide.bgColor,onChange:e=>upd('bgColor',e.target.value),style:{width:'100%',height:'36px',border:'1px solid #ccc',borderRadius:'4px',cursor:'pointer'}})
      ),
      slide.bgType==='gradient' && el('div',{style:{marginBottom:'8px'}},
        el('p',{style:{fontSize:'11px',fontWeight:600,margin:'0 0 6px',textTransform:'uppercase',color:'#757575'}},__('Gradient')),
        el(GradientPicker,{value:slide.bgGradient,onChange:v=>upd('bgGradient',v)})
      ),
      slide.bgType==='image' && (
        slide.bgImageUrl
          ? el('div',{style:{marginBottom:'6px'}},
              el('img',{src:slide.bgImageUrl,style:{width:'100%',height:'80px',objectFit:'cover',borderRadius:'6px'}}),
              el(Button,{isDestructive:true,isSmall:true,onClick:()=>{upd('bgImageUrl','');upd('bgImageId',0);}},__('Remove'))
            )
          : el(MediaUploadCheck,null,
              el(MediaUpload,{onSelect:m=>{upd('bgImageUrl',m.url);upd('bgImageId',m.id);},allowedTypes:['image'],value:slide.bgImageId,
                render:({open})=>el(Button,{onClick:open,isSmall:true,variant:'secondary'},__('Upload BG Image'))})
            )
      ),
      slide.bgType==='image' && el(RangeControl,{label:__('Overlay Opacity'),value:slide.overlayOpacity,min:0,max:90,step:5,onChange:v=>upd('overlayOpacity',v)}),
      el(TextControl,{label:__('Heading'),value:slide.heading,onChange:v=>upd('heading',v)}),
      el(TextareaControl,{label:__('Subtext'),value:slide.subtext,onChange:v=>upd('subtext',v),rows:2}),
      el(ToggleControl,{label:__('Show Button'),checked:slide.btnShow,onChange:v=>upd('btnShow',v),__nextHasNoMarginBottom:true}),
      slide.btnShow && el(TextControl,{label:__('Button Label'),value:slide.btnLabel,onChange:v=>upd('btnLabel',v)}),
      slide.btnShow && el(TextControl,{label:__('Button URL'),value:slide.btnUrl,onChange:v=>upd('btnUrl',v)}),
      el(SelectControl,{label:__('Content Alignment'),value:slide.contentAlign,
        options:[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}],
        onChange:v=>upd('contentAlign',v)}),
      el('label',{style:{fontSize:'11px',fontWeight:600,display:'block',marginTop:'8px',marginBottom:'4px'}},__('Text Color')),
      el('input',{type:'color',value:slide.textColor,onChange:e=>upd('textColor',e.target.value),style:{width:'100%',height:'36px',border:'1px solid #ccc',borderRadius:'4px',cursor:'pointer'}}),
      el(Button,{isDestructive:true,isSmall:true,onClick:()=>onRemove(index),style:{marginTop:'8px'}},__('Remove Slide'))
    );
  }

  registerBlockType('blockenberg/content-slider',{
    edit: function(props){
      const {attributes:attr,setAttributes}=props;
      const [activeIdx,setActiveIdx]=useState(0);

      function updateSlide(idx,next){const s=attr.slides.slice();s[idx]=next;setAttributes({slides:s});}
      function removeSlide(idx){const s=attr.slides.filter((_,i)=>i!==idx);setAttributes({slides:s});setActiveIdx(Math.min(activeIdx,s.length-1));}

      const current=attr.slides[activeIdx]||attr.slides[0]||{};
      const bg=slideBg(current);

      const wrapStyle=Object.assign({
        '--bkcs-height': attr.height+'px',
        '--bkcs-radius': attr.borderRadius+'px',
        borderRadius: attr.borderRadius+'px',
        overflow: 'hidden',
      }, tv(attr.typoHeading, '--bkcs-head-'), tv(attr.typoSubtext, '--bkcs-sub-'), tv(attr.typoButton, '--bkcs-btn-'));

      const slideStyle={
        ...bg,
        height: attr.height+'px',
        display:'flex',alignItems:'center',justifyContent:'center',
        position:'relative',
      };

      const alignMap={center:'center',right:'flex-end',left:'flex-start'};

      return el('div',{className:'bkcs-wrap',style:wrapStyle},

        el(InspectorControls,null,
          el(PanelBody,{title:__('Slides'),initialOpen:true},
            attr.slides.map((slide,i)=>el(SlideEditor,{key:i,slide,index:i,onChange:updateSlide,onRemove:removeSlide})),
            el(Button,{variant:'secondary',onClick:()=>setAttributes({slides:[...attr.slides,{bgType:'color',bgColor:'#6c3fb5',bgGradient:'linear-gradient(135deg,#6c3fb5,#e040fb)',bgImageUrl:'',bgImageId:0,overlayOpacity:0,heading:'New Slide',subtext:'',btnLabel:'Learn More',btnUrl:'#',btnShow:true,textColor:'#ffffff',contentAlign:'center'}]}),
              style:{width:'100%',justifyContent:'center',marginTop:'8px'}},__('+ Add Slide'))
          ),
          el(PanelBody,{title:__('Slider Settings'),initialOpen:false},
            el(RangeControl,{label:__('Height (px)'),value:attr.height,min:200,max:900,onChange:v=>setAttributes({height:v})}),
            el(RangeControl,{label:__('Border Radius (px)'),value:attr.borderRadius,min:0,max:40,onChange:v=>setAttributes({borderRadius:v})}),
            el(SelectControl,{label:__('Transition'),value:attr.transition,options:[{label:'Fade',value:'fade'},{label:'Slide',value:'slide'}],onChange:v=>setAttributes({transition:v})}),
            el(ToggleControl,{label:__('Autoplay'),checked:attr.autoplay,onChange:v=>setAttributes({autoplay:v}),__nextHasNoMarginBottom:true}),
            attr.autoplay&&el(RangeControl,{label:__('Speed (ms)'),value:attr.speed,min:1500,max:9000,step:500,onChange:v=>setAttributes({speed:v})}),
            el(ToggleControl,{label:__('Show Arrows'),checked:attr.showArrows,onChange:v=>setAttributes({showArrows:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Show Dots'),checked:attr.showDots,onChange:v=>setAttributes({showDots:v}),__nextHasNoMarginBottom:true})
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            getTC() && el(getTC(),{label:__('Heading'),value:attr.typoHeading,onChange:function(v){setAttributes({typoHeading:v});}}),
            getTC() && el(getTC(),{label:__('Subtext'),value:attr.typoSubtext,onChange:function(v){setAttributes({typoSubtext:v});}}),
            getTC() && el(getTC(),{label:__('Button'),value:attr.typoButton,onChange:function(v){setAttributes({typoButton:v});}})
          )
        ),

        /* Editor preview */
        el('div',{style:slideStyle},
          current.bgType==='image'&&current.bgImageUrl&&current.overlayOpacity>0&&
            el('div',{style:{position:'absolute',inset:0,background:'rgba(0,0,0,'+(current.overlayOpacity/100)+')'}}),
          el('div',{className:'bkcs-caption',style:{color:current.textColor||'#fff',textAlign:current.contentAlign,alignItems:alignMap[current.contentAlign]||'center',zIndex:2}},
            el('h2',{className:'bkcs-heading',style:{color:current.textColor||'#fff'}},current.heading),
            current.subtext&&el('p',{className:'bkcs-subtext',style:{color:current.textColor||'#fff'}},current.subtext),
            current.btnShow&&current.btnLabel&&el('span',{className:'bkcs-btn'},current.btnLabel)
          )
        ),
        attr.showArrows&&el('div',{className:'bkcs-arrows'},
          el('button',{className:'bkcs-arrow bkcs-prev',onClick:()=>setActiveIdx((activeIdx-1+attr.slides.length)%attr.slides.length)},'‹'),
          el('button',{className:'bkcs-arrow bkcs-next',onClick:()=>setActiveIdx((activeIdx+1)%attr.slides.length)},'›')
        ),
        attr.showDots&&el('div',{className:'bkcs-dots'},
          attr.slides.map((_,i)=>el('button',{key:i,className:'bkcs-dot'+(i===activeIdx?' bkcs-dot-active':''),onClick:()=>setActiveIdx(i)}))
        )
      );
    },

    save: function({attributes:attr}){
      const wrapStyle=Object.assign({
        '--bkcs-height': attr.height+'px',
        '--bkcs-radius': attr.borderRadius+'px',
      }, tv(attr.typoHeading, '--bkcs-head-'), tv(attr.typoSubtext, '--bkcs-sub-'), tv(attr.typoButton, '--bkcs-btn-'));
      return el('div',{
        className:'bkcs-wrap bkcs-transition-'+attr.transition,
        style:wrapStyle,
        'data-autoplay':attr.autoplay?'1':'0',
        'data-speed':attr.speed,
      },
        el('div',{className:'bkcs-track'},
          attr.slides.map((slide,i)=>{
            const bg=slideBg(slide);
            const alignMap={center:'center',right:'flex-end',left:'flex-start'};
            return el('div',{key:i,className:'bkcs-slide'+(i===0?' bkcs-active':''),style:bg},
              slide.bgType==='image'&&slide.bgImageUrl&&slide.overlayOpacity>0&&
                el('div',{style:{position:'absolute',inset:0,background:'rgba(0,0,0,'+(slide.overlayOpacity/100)+')'}}),
              el('div',{className:'bkcs-caption',style:{color:slide.textColor||'#fff',textAlign:slide.contentAlign,alignItems:alignMap[slide.contentAlign]||'center'}},
                el('h2',{className:'bkcs-heading',style:{color:slide.textColor||'#fff'}},slide.heading),
                slide.subtext&&el('p',{className:'bkcs-subtext',style:{color:slide.textColor||'#fff'}},slide.subtext),
                slide.btnShow&&slide.btnLabel&&el('a',{href:slide.btnUrl,className:'bkcs-btn'},slide.btnLabel)
              )
            );
          })
        ),
        attr.showArrows&&el('div',{className:'bkcs-arrows'},
          el('button',{className:'bkcs-arrow bkcs-prev','aria-label':'Previous'},'‹'),
          el('button',{className:'bkcs-arrow bkcs-next','aria-label':'Next'},'›')
        ),
        attr.showDots&&el('div',{className:'bkcs-dots'})
      );
    }
  });
}() );
