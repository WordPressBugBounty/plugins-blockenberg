( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, PanelColorSettings, useBlockProps } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;

  var _dcTC, _dcTV;
  function _tc() { return _dcTC || (_dcTC = window.bkbgTypographyControl); }
  function _tv(t, p) { return (_dcTV || (_dcTV = window.bkbgTypoCssVars)) ? _dcTV(t, p) : {}; }

  function SliceEditor({slice,index,onChange,onRemove}) {
    function upd(k,v){onChange(index,Object.assign({},slice,{[k]:v}));}
    return el('div',{style:{border:'1px solid #ddd',borderRadius:'8px',padding:'10px',marginBottom:'8px',background:'#fafafa'}},
      el(TextControl,{label:__('Label'),value:slice.label,onChange:v=>upd('label',v)}),
      el(RangeControl,{label:__('Value'),value:slice.value,min:1,max:1000,onChange:v=>upd('value',v)}),
      el('label',{style:{fontSize:'11px',fontWeight:600,display:'block',marginBottom:'4px'}},__('Slice Color')),
      el('input',{type:'color',value:slice.color,onChange:e=>upd('color',e.target.value),style:{width:'100%',height:'34px',border:'1px solid #ccc',borderRadius:'4px',cursor:'pointer'}}),
      el(Button,{isDestructive:true,isSmall:true,onClick:()=>onRemove(index),style:{marginTop:'8px'}},__('Remove Slice'))
    );
  }

  registerBlockType('blockenberg/doughnut-chart', {
    edit: function(props) {
      const {attributes:attr,setAttributes}=props;
      function updateSlice(i,next){const s=attr.slices.slice();s[i]=next;setAttributes({slices:s});}
      function removeSlice(i){setAttributes({slices:attr.slices.filter((_,x)=>x!==i)});}

      const wrapStyle=Object.assign({background:attr.bgColor,borderRadius:attr.borderRadius+'px',padding:'20px',textAlign:'center',display:'inline-block',width:'100%','--bkdc-title-size':(attr.titleFontSize||18)+'px'},_tv(attr.typoTitle||{},'--bkbg-dc-ttl-'));
      const previewStyle={display:'flex',alignItems:'center',justifyContent:'center',height:attr.size+'px',width:attr.size+'px',margin:'0 auto',background:'#f5f5f5',borderRadius:'50%',color:'#888',fontSize:'13px',flexDirection:'column',gap:'8px'};

      return el('div',{className:'bkdc-wrap',style:wrapStyle},
        el(InspectorControls,null,
          el(PanelBody,{title:__('Slices'),initialOpen:true},
            attr.slices.map((slice,i)=>el(SliceEditor,{key:i,slice,index:i,onChange:updateSlice,onRemove:removeSlice})),
            el(Button,{variant:'secondary',onClick:()=>setAttributes({slices:[...attr.slices,{label:'New Slice',value:10,color:'#3b82f6'}]}),
              style:{width:'100%',justifyContent:'center',marginTop:'8px'}},__('+ Add Slice'))
          ),
          el(PanelBody,{title:__('Chart Style'),initialOpen:false},
            el(TextControl,{label:__('Title (optional)'),value:attr.title,onChange:v=>setAttributes({title:v})}),
            el(RangeControl,{label:__('Cutout % (0=pie, 60=doughnut)'),value:attr.cutout,min:0,max:90,onChange:v=>setAttributes({cutout:v})}),
            el(RangeControl,{label:__('Chart Size (px)'),value:attr.size,min:160,max:600,onChange:v=>setAttributes({size:v})}),
            el(TextControl,{label:__('Center Label'),value:attr.centerLabel,onChange:v=>setAttributes({centerLabel:v})}),
            el(TextControl,{label:__('Center Sub-Label'),value:attr.centerSubLabel,onChange:v=>setAttributes({centerSubLabel:v})}),
            el(ToggleControl,{label:__('Show Legend'),checked:attr.showLegend,onChange:v=>setAttributes({showLegend:v}),__nextHasNoMarginBottom:true}),
            el(SelectControl,{label:__('Legend Position'),value:attr.legendPos,options:[{label:'Top',value:'top'},{label:'Bottom',value:'bottom'},{label:'Left',value:'left'},{label:'Right',value:'right'}],onChange:v=>setAttributes({legendPos:v})}),
            el(RangeControl,{label:__('Card Border Radius (px)'),value:attr.borderRadius,min:0,max:32,onChange:v=>setAttributes({borderRadius:v})})
          ),
          el(PanelColorSettings,{title:__('Background'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),value:attr.bgColor,onChange:v=>setAttributes({bgColor:v||'#ffffff'})},
          ]}),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            _tc() && el(_tc(), { label: __('Title'), typo: attr.typoTitle || {}, onChange: v => setAttributes({ typoTitle: v }), defaultSize: attr.titleFontSize || 18 })
          )
        ),
        attr.title && el('h3',{className:'bkdc-title'},attr.title),
        el('div',{style:previewStyle},
          el('span',{className:'dashicons dashicons-chart-pie',style:{fontSize:'64px',width:'64px',height:'64px',opacity:0.25}}),
          el('small',null,__('Doughnut — renders on frontend'))
        )
      );
    },

    save: function({attributes:attr}) {
      const wrapStyle=Object.assign({background:attr.bgColor,borderRadius:attr.borderRadius+'px',padding:'20px',textAlign:'center','--bkdc-title-size':(attr.titleFontSize||18)+'px'},_tv(attr.typoTitle||{},'--bkbg-dc-ttl-'));
      return el('div',{
        className:'bkdc-wrap',style:wrapStyle,
        'data-type':'doughnut',
        'data-slices':JSON.stringify(attr.slices),
        'data-cutout':attr.cutout,
        'data-size':attr.size,
        'data-center':attr.centerLabel,
        'data-center-sub':attr.centerSubLabel,
        'data-legend':attr.showLegend?'1':'0',
        'data-legend-pos':attr.legendPos,
      },
        attr.title && el('h3',{className:'bkdc-title'},attr.title),
        el('div',{className:'bkdc-canvas-wrap',style:{position:'relative',width:attr.size+'px',height:attr.size+'px',margin:'0 auto'}},
          el('canvas',{className:'bkdc-canvas'}),
          (attr.centerLabel||attr.centerSubLabel)&&el('div',{className:'bkdc-center'},
            attr.centerLabel&&el('div',{className:'bkdc-center-label'},attr.centerLabel),
            attr.centerSubLabel&&el('div',{className:'bkdc-center-sub'},attr.centerSubLabel)
          )
        )
      );
    }
  });
}() );
