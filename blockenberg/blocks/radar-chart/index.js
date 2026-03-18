( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;
  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  function DatasetEditor({ds,index,onChange,onRemove}) {
    function upd(k,v){onChange(index,Object.assign({},ds,{[k]:v}));}
    return el('div',{style:{border:'1px solid #ddd',borderRadius:'8px',padding:'10px',marginBottom:'8px',background:'#fafafa'}},
      el(TextControl,{label:__('Label'),value:ds.label,onChange:v=>upd('label',v)}),
      el(TextControl,{label:__('Data (CSV, must match axis count)'),value:ds.data,onChange:v=>upd('data',v)}),
      el('label',{style:{display:'block',marginBottom:'4px'}},__('Color')),
      el('input',{type:'color',value:ds.color,onChange:e=>upd('color',e.target.value),style:{width:'100%',height:'34px',border:'1px solid #ccc',borderRadius:'4px',cursor:'pointer'}}),
      el(RangeControl,{label:__('Fill Opacity (0–1)'),value:Math.round((ds.fillAlpha||0.2)*100),min:0,max:100,onChange:v=>upd('fillAlpha',v/100)}),
      el(Button,{isDestructive:true,isSmall:true,onClick:()=>onRemove(index),style:{marginTop:'8px'}},__('Remove Dataset'))
    );
  }

  var v1Attributes = {
    "labels":{"type":"string","default":"Speed,Power,Range,Accuracy,Endurance,Agility"},
    "datasets":{"type":"array","default":[{"label":"Team A","data":"65,80,75,90,60,85","color":"#6c3fb5","fillAlpha":0.2},{"label":"Team B","data":"80,55,90,70,85,65","color":"#e040fb","fillAlpha":0.2}]},
    "size":{"type":"number","default":340},
    "scaleMin":{"type":"number","default":0},
    "scaleMax":{"type":"number","default":100},
    "gridLines":{"type":"number","default":5},
    "showLegend":{"type":"boolean","default":true},
    "legendPos":{"type":"string","default":"top"},
    "bgColor":{"type":"string","default":"#ffffff"},
    "borderRadius":{"type":"number","default":12},
    "title":{"type":"string","default":""},
    "fontSize":{"type":"number","default":12},
    "fontWeight":{"type":"number","default":600},
    "lineHeight":{"type":"number","default":1.3}
  };

  registerBlockType('blockenberg/radar-chart',{
    edit: function(props){
      const {attributes:attr,setAttributes}=props;
      var TC = getTypoControl();
      function updateDs(i,next){const d=attr.datasets.slice();d[i]=next;setAttributes({datasets:d});}
      function removeDs(i){setAttributes({datasets:attr.datasets.filter((_,x)=>x!==i)});}

      var _tvFn = getTypoCssVars();
      var wrapStyle = (function() {
          var s = {background:attr.bgColor,borderRadius:attr.borderRadius+'px',padding:'20px',textAlign:'center',width:'100%'};
          if (_tvFn) Object.assign(s, _tvFn(attr.titleTypo || {}, '--bkrc-tt-'));
          return s;
      })();
      const previewStyle={display:'flex',alignItems:'center',justifyContent:'center',height:attr.size+'px',width:attr.size+'px',margin:'0 auto',background:'#f5f5f5',borderRadius:'50%',color:'#888',fontSize:'13px',flexDirection:'column',gap:'8px'};

      return el('div',{className:'bkrc-wrap',style:wrapStyle},
        el(InspectorControls,null,
          el(PanelBody,{title:__('Axes & Data'),initialOpen:true},
            el(TextControl,{label:__('Axis Labels (CSV)'),value:attr.labels,onChange:v=>setAttributes({labels:v}),help:'e.g. Speed,Power,Range'}),
            attr.datasets.map((ds,i)=>el(DatasetEditor,{key:i,ds,index:i,onChange:updateDs,onRemove:removeDs})),
            el(Button,{variant:'secondary',onClick:()=>setAttributes({datasets:[...attr.datasets,{label:'Series '+(attr.datasets.length+1),data:'50,50,50,50,50,50',color:'#22c55e',fillAlpha:0.2}]}),
              style:{width:'100%',justifyContent:'center',marginTop:'8px'}},__('+ Add Dataset'))
          ),
          el(PanelBody,{title:__('Typography','blockenberg'),initialOpen:false},
            TC && el(TC,{label:__('Title','blockenberg'),value:attr.titleTypo||{},onChange:function(v){setAttributes({titleTypo:v});}})
          ),
          el(PanelBody,{title:__('Chart Options'),initialOpen:false},
            el(TextControl,{label:__('Title (optional)'),value:attr.title,onChange:v=>setAttributes({title:v})}),
            el(RangeControl,{label:__('Chart Size (px)'),value:attr.size,min:200,max:700,onChange:v=>setAttributes({size:v})}),
            el(RangeControl,{label:__('Scale Min'),value:attr.scaleMin,min:0,max:100,onChange:v=>setAttributes({scaleMin:v})}),
            el(RangeControl,{label:__('Scale Max'),value:attr.scaleMax,min:10,max:1000,onChange:v=>setAttributes({scaleMax:v})}),
            el(RangeControl,{label:__('Grid Lines'),value:attr.gridLines,min:2,max:10,onChange:v=>setAttributes({gridLines:v})}),
            el(ToggleControl,{label:__('Show Legend'),checked:attr.showLegend,onChange:v=>setAttributes({showLegend:v}),__nextHasNoMarginBottom:true}),
            el(SelectControl,{label:__('Legend Position'),value:attr.legendPos,options:[{label:'Top',value:'top'},{label:'Bottom',value:'bottom'}],onChange:v=>setAttributes({legendPos:v})}),
            el(RangeControl,{label:__('Card Border Radius (px)'),value:attr.borderRadius,min:0,max:32,onChange:v=>setAttributes({borderRadius:v})})
          ),
          el(PanelColorSettings,{title:__('Background'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),value:attr.bgColor,onChange:v=>setAttributes({bgColor:v||'#ffffff'})},
          ]})
        ),
        attr.title && el('h3',{className:'bkrc-title'},attr.title),
        el('div',{style:previewStyle},
          el('span',{className:'dashicons dashicons-chart-area',style:{fontSize:'64px',width:'64px',height:'64px',opacity:0.25}}),
          el('small',null,__('Radar Chart — renders on frontend'))
        )
      );
    },

    deprecated: [{
      attributes: v1Attributes,
      save: function({attributes:attr}){
        const wrapStyle={background:attr.bgColor,borderRadius:attr.borderRadius+'px',padding:'20px',textAlign:'center'};
        return el('div',{
          className:'bkrc-wrap',style:wrapStyle,
          'data-type':'radar',
          'data-labels':attr.labels,
          'data-datasets':JSON.stringify(attr.datasets),
          'data-size':attr.size,
          'data-scale-min':attr.scaleMin,
          'data-scale-max':attr.scaleMax,
          'data-grid-lines':attr.gridLines,
          'data-legend':attr.showLegend?'1':'0',
          'data-legend-pos':attr.legendPos,
        },
          attr.title && el('h3',{className:'bkrc-title'},attr.title),
          el('canvas',{className:'bkrc-canvas',style:{width:attr.size+'px',height:attr.size+'px',maxWidth:'100%'}})
        );
      }
    }],

    save: function({attributes:attr}){
      var _tv = window.bkbgTypoCssVars;
      var wrapStyle = {background:attr.bgColor,borderRadius:attr.borderRadius+'px',padding:'20px',textAlign:'center'};
      if (_tv) Object.assign(wrapStyle, _tv(attr.titleTypo || {}, '--bkrc-tt-'));
      return el('div',{
        className:'bkrc-wrap',style:wrapStyle,
        'data-type':'radar',
        'data-labels':attr.labels,
        'data-datasets':JSON.stringify(attr.datasets),
        'data-size':attr.size,
        'data-scale-min':attr.scaleMin,
        'data-scale-max':attr.scaleMax,
        'data-grid-lines':attr.gridLines,
        'data-legend':attr.showLegend?'1':'0',
        'data-legend-pos':attr.legendPos,
      },
        attr.title && el('h3',{className:'bkrc-title'},attr.title),
        el('canvas',{className:'bkrc-canvas',style:{width:attr.size+'px',height:attr.size+'px',maxWidth:'100%'}})
      );
    }
  });
}() );
