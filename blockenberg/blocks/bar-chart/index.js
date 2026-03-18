( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;

  function getTypographyControl() {
      return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
  }
  function getTypoCssVars() {
      return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
  }

  function buildWrapStyle(attr) {
      var _tv = getTypoCssVars();
      var s = { background: attr.bgColor, borderRadius: attr.borderRadius + 'px', padding: '20px' };
      Object.assign(s, _tv(attr.titleTypo || {}, '--bkbc-title-'));
      return s;
  }

  function DatasetEditor({ ds, index, onChange, onRemove }) {
    function upd(k,v){ onChange(index, Object.assign({},ds,{[k]:v})); }
    return el('div',{style:{border:'1px solid #ddd',borderRadius:'8px',padding:'10px',marginBottom:'8px',background:'#fafafa'}},
      el(TextControl, {label:__('Label'), value:ds.label, onChange:v=>upd('label',v)}),
      el(TextControl, {label:__('Data (CSV)'), value:ds.data, onChange:v=>upd('data',v), help:'e.g. 10,20,35,18'}),
      el('label',{style:{fontSize:'11px',fontWeight:600,display:'block',marginBottom:'4px'}},__('Color')),
      el('input',{type:'color',value:ds.color,onChange:e=>upd('color',e.target.value),style:{width:'100%',height:'34px',border:'1px solid #ccc',borderRadius:'4px',cursor:'pointer'}}),
      el(Button,{isDestructive:true,isSmall:true,onClick:()=>onRemove(index),style:{marginTop:'8px'}},__('Remove'))
    );
  }

  registerBlockType('blockenberg/bar-chart', {
    edit: function(props) {
      const {attributes:attr,setAttributes}=props;
      function updateDs(i,next){const d=attr.datasets.slice();d[i]=next;setAttributes({datasets:d});}
      function removeDs(i){setAttributes({datasets:attr.datasets.filter((_,x)=>x!==i)});}

      const wrapStyle=buildWrapStyle(attr);
      const previewStyle={display:'flex',alignItems:'center',justifyContent:'center',height:attr.height+'px',background:'#f5f5f5',borderRadius:'8px',color:'#888',fontSize:'13px',flexDirection:'column',gap:'8px'};
      var TC = getTypographyControl();

      return el('div',{className:'bkbc-wrap',style:wrapStyle},
        el(InspectorControls,null,
          el(PanelBody,{title:__('Chart Title'),initialOpen:true},
            el(TextControl,{label:__('Title (optional)'),value:attr.title,onChange:v=>setAttributes({title:v})})
          ),
          el(PanelBody,{title:__('Labels & Data'),initialOpen:true},
            el(TextControl,{label:__('Category Labels (CSV)'),value:attr.labels,onChange:v=>setAttributes({labels:v})}),
            attr.datasets.map((ds,i)=>el(DatasetEditor,{key:i,ds,index:i,onChange:updateDs,onRemove:removeDs})),
            el(Button,{variant:'secondary',onClick:()=>setAttributes({datasets:[...attr.datasets,{label:'Series '+(attr.datasets.length+1),data:'0,0,0,0',color:'#f5a623'}]}),
              style:{width:'100%',justifyContent:'center',marginTop:'8px'}},__('+ Add Dataset'))
          ),
          el(PanelBody,{title:__('Chart Options'),initialOpen:false},
            el(SelectControl,{label:__('Orientation'),value:attr.orientation,options:[{label:'Vertical',value:'vertical'},{label:'Horizontal',value:'horizontal'}],onChange:v=>setAttributes({orientation:v})}),
            el(ToggleControl,{label:__('Stacked'),checked:attr.stacked,onChange:v=>setAttributes({stacked:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Bar Border Radius'),value:attr.barRadius,min:0,max:20,onChange:v=>setAttributes({barRadius:v})}),
            el(RangeControl,{label:__('Height (px)'),value:attr.height,min:160,max:700,onChange:v=>setAttributes({height:v})}),
            el(ToggleControl,{label:__('Show Grid'),checked:attr.showGrid,onChange:v=>setAttributes({showGrid:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Show Legend'),checked:attr.showLegend,onChange:v=>setAttributes({showLegend:v}),__nextHasNoMarginBottom:true}),
            el(SelectControl,{label:__('Legend Position'),value:attr.legendPos,options:[{label:'Top',value:'top'},{label:'Bottom',value:'bottom'},{label:'Left',value:'left'},{label:'Right',value:'right'}],onChange:v=>setAttributes({legendPos:v})}),
            el(RangeControl,{label:__('Card Border Radius (px)'),value:attr.borderRadius,min:0,max:32,onChange:v=>setAttributes({borderRadius:v})})
          ),
          el(PanelColorSettings,{title:__('Background'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),value:attr.bgColor,onChange:v=>setAttributes({bgColor:v||'#ffffff'})},
          ]}),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            TC && el(TC, { label: __('Title', 'blockenberg'), value: attr.titleTypo || {}, onChange: function(v){ setAttributes({titleTypo: v}); } }),
            el(RangeControl,{label:__('Legend Font Size (px)'),value:attr.legendFontSize,min:8,max:20,onChange:v=>setAttributes({legendFontSize:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Axis Label Font Size (px)'),value:attr.axisLabelFontSize,min:8,max:18,onChange:v=>setAttributes({axisLabelFontSize:v}),__nextHasNoMarginBottom:true})
          )
        ),
        attr.title && el('h3',{className:'bkbc-title'},attr.title),
        el('div',{style:previewStyle},
          el('span',{className:'dashicons dashicons-chart-bar',style:{fontSize:'48px',width:'48px',height:'48px',opacity:0.3}}),
          el('span',null,__('Bar Chart — renders on the frontend')),
          el('small',null,attr.datasets.map(d=>d.label).join(' · '))
        )
      );
    },

    save: function({attributes:attr}) {
      const wrapStyle=buildWrapStyle(attr);
      return el('div',{
        className:'bkbc-wrap',style:wrapStyle,
        'data-type':'bar',
        'data-labels':attr.labels,
        'data-datasets':JSON.stringify(attr.datasets),
        'data-orientation':attr.orientation,
        'data-stacked':attr.stacked?'1':'0',
        'data-bar-radius':attr.barRadius,
        'data-height':attr.height,
        'data-grid':attr.showGrid?'1':'0',
        'data-legend':attr.showLegend?'1':'0',
        'data-legend-pos':attr.legendPos,
        'data-title-size':attr.chartTitleFontSize,
        'data-legend-size':attr.legendFontSize,
        'data-axis-label-size':attr.axisLabelFontSize,
      },
        attr.title && el('h3',{className:'bkbc-title'},attr.title),
        el('canvas',{className:'bkbc-canvas',height:attr.height})
      );
    }
  });
}() );
