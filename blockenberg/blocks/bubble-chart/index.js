( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button, ColorPicker, Popover } = window.wp.components;
  var { __ } = window.wp.i18n;
  var { useEffect, useRef, useState } = window.wp.element;

  var LEG_POS = [{label:'Top',value:'top'},{label:'Bottom',value:'bottom'},{label:'Left',value:'left'},{label:'Right',value:'right'}];

  function parseHex(hex, alpha) {
    hex = (hex||'#6c3fb5').replace('#','');
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+(alpha/100).toFixed(2)+')';
  }

  function parseBubbles(text) {
    return (text||'').split('\n').filter(Boolean).map(function(line) {
      var parts = line.split(',').map(function(s){return parseFloat(s)||0;});
      return { x: parts[0]||0, y: parts[1]||0, r: parts[2]||8 };
    });
  }

  function BubblePreview(a) {
    var canvasRef = useRef(null);
    var chartRef = useRef(null);
    useEffect(function() {
      var canvas = canvasRef.current; if (!canvas) return;
      function render(ChartJS) {
        if (chartRef.current) { chartRef.current.destroy(); chartRef.current=null; }
        var datasets;
        try { datasets = JSON.parse(a.datasetsJson||'[]'); } catch(e){ datasets=[]; }
        var dsData = datasets.map(function(ds) {
          return {
            label: ds.label||'',
            data: parseBubbles(ds.bubbles),
            backgroundColor: parseHex(ds.color||'#6c3fb5', a.fillAlpha),
            borderColor: ds.color||'#6c3fb5',
            borderWidth: 2
          };
        });
        var h = a.chartHeight;
        canvas.style.height = h+'px';
        chartRef.current = new ChartJS(canvas, {
          type: 'bubble',
          data: { datasets: dsData },
          options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            plugins: {
              legend: { display: !!a.showLegend, position: a.legendPos, labels: { font: { size: a.labelFontSize||12 } } },
              title: { display: !!(a.showTitle&&a.chartTitle), text: a.chartTitle, font: { size: a.titleFontSize||16 } }
            },
            scales: {
              x: { grid: { display: !!a.showGrid } },
              y: { grid: { display: !!a.showGrid } }
            }
          }
        });
      }
      if (window.Chart) { render(window.Chart); return function(){if(chartRef.current){chartRef.current.destroy();chartRef.current=null;}};}
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
      s.onload = function(){ render(window.Chart); };
      document.head.appendChild(s);
      return function(){ if(chartRef.current){chartRef.current.destroy();chartRef.current=null;} };
    }, [a.datasetsJson, a.fillAlpha, a.chartHeight, a.showLegend, a.legendPos, a.showTitle, a.chartTitle, a.showGrid, a.titleFontSize, a.labelFontSize]);

    return el('div',{style:{background:a.bgColor,borderRadius:a.borderRadius+'px',padding:'24px'}},
      el('div',{style:{position:'relative',height:a.chartHeight+'px'}},
        el('canvas',{ref:canvasRef,style:{height:a.chartHeight+'px'}})));
  }

  function DatasetEditor(a, set) {
    var datasets;
    try { datasets = JSON.parse(a.datasetsJson||'[]'); } catch(e){ datasets=[]; }
    function save(ds) { set({datasetsJson: JSON.stringify(ds)}); }
    return el('div',null,
      datasets.map(function(ds,i) {
        return el('div',{key:i,style:{border:'1px solid #e5e7eb',borderRadius:'8px',padding:'12px',marginBottom:'12px'}},
          el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}},
            el('strong',null,(ds.label||__('Dataset '+(i+1)))),
            el(Button,{isDestructive:true,isSmall:true,onClick:function(){var d=[...datasets];d.splice(i,1);save(d);}},__('Remove')),
          ),
          el(TextControl,{label:__('Label'),value:ds.label||'',onChange:function(v){var d=[...datasets];d[i]={...d[i],label:v};save(d);}}),
          el(BkbgColorSwatch,{label:__('Color'),value:ds.color||'#6c3fb5',onChange:function(v){var d=[...datasets];d[i]={...d[i],color:v};save(d);}}),
          el('p',{style:{margin:'0 0 4px',fontSize:'11px',color:'#757575'}},__('Bubbles: x,y,radius — one per line')),
          el(TextareaControl,{label:__('Bubbles (x,y,r per line)'),value:ds.bubbles||'',rows:5,onChange:function(v){var d=[...datasets];d[i]={...d[i],bubbles:v};save(d);}}),
        );
      }),
      el(Button,{variant:'secondary',onClick:function(){var d=[...datasets,{label:'Dataset '+(datasets.length+1),color:'#10b981',bubbles:'10,10,8\n20,30,15'}];save(d);}},__('+ Add Dataset')),
    );
  }

  /* ── colour-swatch + popover ── */
  function BkbgColorSwatch(p) {
      var st = useState(false), open = st[0], setOpen = st[1];
      return el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', gap:'8px' } },
          el('span', { style:{ fontSize:'12px', color:'#1e1e1e', flex:1, lineHeight:1.4 } }, p.label),
          el('div', { style:{ position:'relative', flexShrink:0 } },
              el('button', { type:'button', title: p.value||'none', onClick: function(){ setOpen(!open); },
                  style:{ width:'28px', height:'28px', borderRadius:'4px', border: open ? '2px solid #007cba' : '2px solid #ddd', cursor:'pointer', padding:0, display:'block', background: p.value||'#ffffff', flexShrink:0 } }),
              open && el(Popover, { position:'bottom left', onClose: function(){ setOpen(false); } },
                  el('div', { style:{ padding:'8px' }, onMouseDown: function(e){ e.stopPropagation(); } },
                      el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' } },
                          el('strong', { style:{ fontSize:'12px' } }, p.label),
                          el(Button, { icon:'no-alt', isSmall:true, onClick: function(){ setOpen(false); } })
                      ),
                      el(ColorPicker, { color: p.value, enableAlpha:true, onChange: p.onChange })
                  )
              )
          )
      );
  }

  registerBlockType('blockenberg/bubble-chart', {
    icon: el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', width: 24, height: 24 },
      el('circle', { cx: 8, cy: 14, r: 5, fill: 'currentColor', opacity: 0.3 }),
      el('circle', { cx: 16, cy: 8, r: 4, fill: 'currentColor', opacity: 0.5 }),
      el('circle', { cx: 14, cy: 16, r: 3, fill: 'currentColor', opacity: 0.7 }),
      el('circle', { cx: 6, cy: 7, r: 2, fill: 'currentColor' })
    ),
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      return el('div',null,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Datasets'),initialOpen:true},
            DatasetEditor(a, set),
          ),
          el(PanelBody,{title:__('Chart Options'),initialOpen:false},
            el(ToggleControl,{label:__('Show Title'),checked:a.showTitle,onChange:v=>set({showTitle:v}),__nextHasNoMarginBottom:true}),
            a.showTitle&&el(TextControl,{label:__('Title'),value:a.chartTitle,onChange:v=>set({chartTitle:v})}),
            el(RangeControl,{label:__('Chart Height (px)'),value:a.chartHeight,min:200,max:700,onChange:v=>set({chartHeight:v})}),
            el(RangeControl,{label:__('Fill Opacity %'),value:a.fillAlpha,min:10,max:100,onChange:v=>set({fillAlpha:v})}),
            el(ToggleControl,{label:__('Show Grid'),checked:a.showGrid,onChange:v=>set({showGrid:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Show Legend'),checked:a.showLegend,onChange:v=>set({showLegend:v}),__nextHasNoMarginBottom:true}),
            a.showLegend&&el(SelectControl,{label:__('Legend Position'),value:a.legendPos,options:LEG_POS,onChange:v=>set({legendPos:v})}),
            el(RangeControl,{label:__('Border Radius (px)'),value:a.borderRadius,min:0,max:32,onChange:v=>set({borderRadius:v})}),
          ),
          el(PanelBody,{title:__('Typography','blockenberg'),initialOpen:false},
            el(RangeControl,{label:__('Title Font Size (px)','blockenberg'),value:a.titleFontSize,min:12,max:36,onChange:v=>set({titleFontSize:v})}),
            el(RangeControl,{label:__('Legend Font Size (px)','blockenberg'),value:a.labelFontSize,min:10,max:24,onChange:v=>set({labelFontSize:v})}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),value:a.bgColor,onChange:v=>set({bgColor:v||'#ffffff'})},
          ]}),
        ),
        el(BubblePreview,a),
      );
    },

    save: function({attributes:a}) {
      var chartData = {datasetsJson:a.datasetsJson,fillAlpha:a.fillAlpha,showLegend:a.showLegend,legendPos:a.legendPos,showTitle:a.showTitle,chartTitle:a.chartTitle,showGrid:a.showGrid};
      return el('div',{className:'bkbbl-wrap','data-chart':JSON.stringify(chartData),'data-height':a.chartHeight,style:{background:a.bgColor,borderRadius:a.borderRadius+'px',padding:'24px'}},
        el('div',{style:{position:'relative',height:a.chartHeight+'px'}},
          el('canvas',{className:'bkbbl-canvas',style:{height:a.chartHeight+'px'}})));
    }
  });
}() );
