( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button, ColorPicker, Popover } = window.wp.components;
  var { __ } = window.wp.i18n;
  var { useEffect, useRef, useState, createElement: _el } = window.wp.element;
  var Fragment = window.wp.element.Fragment;

  var LEG_POS = [{label:'Top',value:'top'},{label:'Bottom',value:'bottom'},{label:'Left',value:'left'},{label:'Right',value:'right'}];

  function parseHex(hex, alpha) {
    hex = hex.replace('#','');
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+(alpha/100).toFixed(2)+')';
  }

  function PolarPreview(a) {
    var canvasRef = useRef(null);
    var chartRef = useRef(null);
    useEffect(function() {
      var canvas = canvasRef.current; if (!canvas) return;
      function render(ChartJS) {
        if (chartRef.current) {chartRef.current.destroy(); chartRef.current=null;}
        var labels = a.labels.split(',').map(function(s){return s.trim();});
        var vals = a.values.split(',').map(function(s){return parseFloat(s.trim())||0;});
        var cols = a.colors.split(',').map(function(s){return s.trim();});
        var bgColors = cols.map(function(c){return parseHex(c, a.fillAlpha);});
        chartRef.current = new ChartJS(canvas, {
          type: 'polarArea',
          data: { labels: labels, datasets: [{ data: vals, backgroundColor: bgColors, borderColor: cols, borderWidth: 2 }] },
          options: { responsive:false, animation:false, plugins:{ legend:{ display:a.showLegend, position:a.legendPos, labels:{ font:{ size: a.legendFontSize||12 } } }, title:{ display:a.showTitle&&!!a.chartTitle, text:a.chartTitle, font:{ size: a.titleFontSize||14 } } } }
        });
      }
      if (window.Chart) { render(window.Chart); return; }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
      s.onload = function(){ render(window.Chart); };
      document.head.appendChild(s);
      return function(){ if (chartRef.current){chartRef.current.destroy();chartRef.current=null;} };
    },[a.labels,a.values,a.colors,a.fillAlpha,a.size,a.showLegend,a.legendPos,a.showTitle,a.chartTitle]);

    return el('div',{style:{background:a.bgColor,borderRadius:a.borderRadius+'px',padding:'24px',textAlign:'center',display:'flex',justifyContent:'center'}},
      el('canvas',{ref:canvasRef,width:a.size,height:a.size}));
  }

  /* ── BkbgMultiColorControl ────────────────────────────────────────── */
  function BkbgMultiColorControl(props) {
      var label = props.label;
      var value = props.value || '';
      var onChange = props.onChange;
      var colors = value.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
      var st = useState(-1); var openIdx = st[0]; var setOpenIdx = st[1];
      return el(Fragment, null,
          el('div', { style: { marginBottom: '8px' } },
              el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: '4px' } }, label),
              el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
                  colors.map(function (c, i) {
                      return el('div', { key: i, style: { position: 'relative', display: 'inline-flex' } },
                          el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: c, cursor: 'pointer', padding: 0 }, onClick: function () { setOpenIdx(openIdx === i ? -1 : i); } }),
                          el('button', { type: 'button', 'aria-label': 'Remove', style: { position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#d00', color: '#fff', fontSize: '10px', lineHeight: '14px', cursor: 'pointer', padding: 0, textAlign: 'center' }, onClick: function () { var n = colors.slice(); n.splice(i, 1); onChange(n.join(',')); } }, '×'),
                          openIdx === i && el(Popover, { onClose: function () { setOpenIdx(-1); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: c, enableAlpha: true, onChange: function (v) { var n = colors.slice(); n[i] = v; onChange(n.join(',')); } })))
                      );
                  }),
                  el(Button, { isSmall: true, variant: 'secondary', onClick: function () { onChange(value ? value + ',#6c3fb5' : '#6c3fb5'); }, style: { height: 28, minWidth: 28 } }, '+')
              )
          )
      );
  }

  registerBlockType('blockenberg/polar-chart', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      return el('div',null,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Chart Data'),initialOpen:true},
            el(ToggleControl,{label:__('Show Title'),checked:a.showTitle,onChange:v=>set({showTitle:v}),__nextHasNoMarginBottom:true}),
            a.showTitle&&el(TextControl,{label:__('Title'),value:a.chartTitle,onChange:v=>set({chartTitle:v})}),
            el('p',{style:{margin:'0 0 4px',fontSize:'11px',color:'#757575'}},'Labels — comma-separated'),
            el(TextControl,{label:__('Labels'),value:a.labels,onChange:v=>set({labels:v})}),
            el(TextControl,{label:__('Values'),value:a.values,onChange:v=>set({values:v})}),
            el(BkbgMultiColorControl,{label:__('Colors (hex, comma-separated)'),value:a.colors,onChange:v=>set({colors:v})}),
            el(RangeControl,{label:__('Fill Opacity %'),value:a.fillAlpha,min:10,max:100,onChange:v=>set({fillAlpha:v})}),
          ),
          el(PanelBody,{title:__('Display'),initialOpen:false},
            el(RangeControl,{label:__('Chart Size (px)'),value:a.size,min:200,max:700,onChange:v=>set({size:v})}),
            el(ToggleControl,{label:__('Show Legend'),checked:a.showLegend,onChange:v=>set({showLegend:v}),__nextHasNoMarginBottom:true}),
            a.showLegend&&el(SelectControl,{label:__('Legend Position'),value:a.legendPos,options:LEG_POS,onChange:v=>set({legendPos:v})}),
            el(RangeControl,{label:__('Border Radius (px)'),value:a.borderRadius,min:0,max:32,onChange:v=>set({borderRadius:v})}),
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            el(RangeControl,{label:__('Title Font Size (px)'),value:a.titleFontSize,min:10,max:32,onChange:v=>set({titleFontSize:v}),__nextHasNoMarginBottom:true}),
            el(SelectControl,{__nextHasNoMarginBottom:true,label:__('Title Weight'),value:a.titleFontWeight,options:[{label:'SemiBold',value:'600'},{label:'Bold',value:'700'},{label:'ExtraBold',value:'800'},{label:'Black',value:'900'}],onChange:v=>set({titleFontWeight:v})}),
            el(RangeControl,{label:__('Legend Font Size (px)'),value:a.legendFontSize,min:8,max:24,onChange:v=>set({legendFontSize:v}),__nextHasNoMarginBottom:true}),
            el(SelectControl,{__nextHasNoMarginBottom:true,label:__('Legend Weight'),value:a.legendFontWeight,options:[{label:'Normal',value:'400'},{label:'Medium',value:'500'},{label:'SemiBold',value:'600'},{label:'Bold',value:'700'},{label:'ExtraBold',value:'800'}],onChange:v=>set({legendFontWeight:v})}),
          ),
                    el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),value:a.bgColor,onChange:v=>set({bgColor:v||'#ffffff'})},
          ]}),
        ),
        el(PolarPreview,a),
      );
    },

    save: function({attributes:a}) {
      var data = {labels:a.labels,values:a.values,colors:a.colors,fillAlpha:a.fillAlpha,showLegend:a.showLegend,legendPos:a.legendPos,showTitle:a.showTitle,chartTitle:a.chartTitle};
      return el('div',{className:'bkpca-wrap','data-chart':JSON.stringify(data),style:{background:a.bgColor,borderRadius:a.borderRadius+'px',padding:'24px',textAlign:'center',display:'flex',justifyContent:'center'}},
        el('canvas',{className:'bkpca-canvas','data-size':a.size,width:a.size,height:a.size}));
    }
  });
}() );
