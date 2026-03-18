( function () {
  var el = window.wp.element.createElement;
  var Fragment = window.wp.element.Fragment;
  var useState = window.wp.element.useState;
  var useEffect = window.wp.element.useEffect;
  var useRef = window.wp.element.useRef;
  var registerBlockType = window.wp.blocks.registerBlockType;
  var InspectorControls  = window.wp.blockEditor.InspectorControls;
  var useBlockProps = window.wp.blockEditor.useBlockProps;
  var PanelBody      = window.wp.components.PanelBody;
  var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;
  var RangeControl   = window.wp.components.RangeControl;
  var SelectControl  = window.wp.components.SelectControl;
  var TextControl    = window.wp.components.TextControl;
  var TextareaControl = window.wp.components.TextareaControl;
  var ToggleControl  = window.wp.components.ToggleControl;
  var Button         = window.wp.components.Button;
  var ColorPicker    = window.wp.components.ColorPicker;
  var Popover        = window.wp.components.Popover;
  var __             = window.wp.i18n.__;

  var LEG_POS = [
    { label: 'Top',    value: 'top'    },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Left',   value: 'left'   },
    { label: 'Right',  value: 'right'  },
  ];

  var POINT_STYLES = [
    { label: 'Circle',   value: 'circle'   },
    { label: 'Cross',    value: 'cross'    },
    { label: 'Triangle', value: 'triangle' },
    { label: 'Rect',     value: 'rect'     },
    { label: 'Star',     value: 'star'     },
  ];

  var CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

  function parseHex(hex, alpha) {
    hex = (hex || '#6c3fb5').replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2),16);
    var g = parseInt(hex.substring(2,4),16);
    var b = parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+(alpha/100).toFixed(2)+')';
  }

  function parsePoints(text) {
    return (text || '').split('\n').filter(Boolean).map(function (line) {
      var parts = line.split(',').map(function (s) { return parseFloat(s.trim()) || 0; });
      return { x: parts[0] || 0, y: parts[1] || 0 };
    });
  }

  function loadChart(cb) {
    if (window.Chart) { cb(window.Chart); return; }
    var s = document.createElement('script');
    s.src = CDN;
    s.onload = function () { cb(window.Chart); };
    document.head.appendChild(s);
  }

  /* ── Editor chart preview ─────────────────────────────────────────── */
  function ScatterPreview(a) {
    var canvasRef = useRef(null);
    var chartRef  = useRef(null);

    useEffect(function () {
      var canvas = canvasRef.current;
      if (!canvas) return;

      function render(ChartJS) {
        if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

        var datasets;
        try { datasets = JSON.parse(a.datasetsJson || '[]'); } catch (e) { datasets = []; }

        var dsData = datasets.map(function (ds) {
          return {
            label: ds.label || '',
            data: parsePoints(ds.points),
            backgroundColor: parseHex(ds.color || '#6c3fb5', a.fillAlpha),
            borderColor: ds.color || '#6c3fb5',
            borderWidth: 1.5,
            pointRadius: a.pointSize,
            pointStyle: a.pointStyle,
            pointHoverRadius: a.pointSize + 2,
          };
        });

        var xMin = a.xMin !== '' ? parseFloat(a.xMin) : undefined;
        var xMax = a.xMax !== '' ? parseFloat(a.xMax) : undefined;
        var yMin = a.yMin !== '' ? parseFloat(a.yMin) : undefined;
        var yMax = a.yMax !== '' ? parseFloat(a.yMax) : undefined;

        canvas.style.height = a.chartHeight + 'px';
        chartRef.current = new ChartJS(canvas, {
          type: 'scatter',
          data: { datasets: dsData },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: { display: !!a.showLegend, position: a.legendPos, labels: { font: { size: a.labelFontSize } } },
              title:  { display: !!(a.showTitle && a.chartTitle), text: a.chartTitle, font: { size: a.titleFontSize } },
              subtitle: { display: !!(a.showSubtitle && a.chartSubtitle), text: a.chartSubtitle, padding: { bottom: 10 }, font: { size: a.labelFontSize } },
            },
            scales: {
              x: {
                type: 'linear',
                grid: { display: !!a.showGrid },
                min: xMin, max: xMax,
                title: { display: !!a.xLabel, text: a.xLabel, font: { size: a.labelFontSize } },
                ticks: { font: { size: a.labelFontSize } },
              },
              y: {
                grid: { display: !!a.showGrid },
                min: yMin, max: yMax,
                title: { display: !!a.yLabel, text: a.yLabel, font: { size: a.labelFontSize } },
                ticks: { font: { size: a.labelFontSize } },
              },
            },
          },
        });
      }

      loadChart(render);
      return function () {
        if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      };
    }, [
      a.datasetsJson, a.fillAlpha, a.chartHeight, a.showLegend, a.legendPos,
      a.showTitle, a.chartTitle, a.showSubtitle, a.chartSubtitle, a.showGrid,
      a.pointSize, a.pointStyle, a.xLabel, a.yLabel, a.xMin, a.xMax, a.yMin, a.yMax,
      a.titleFontSize, a.labelFontSize,
    ]);

    return el('div', { style: { background: a.bgColor, borderRadius: a.borderRadius + 'px', padding: '24px' } },
      el('div', { style: { position: 'relative', height: a.chartHeight + 'px' } },
        el('canvas', { ref: canvasRef, style: { height: a.chartHeight + 'px' } })
      )
    );
  }

  /* ── Datasets panel ───────────────────────────────────────────────── */
  function DatasetEditor(a, set) {
    var datasets;
    try { datasets = JSON.parse(a.datasetsJson || '[]'); } catch (e) { datasets = []; }

    function save(ds) { set({ datasetsJson: JSON.stringify(ds) }); }

    return el('div', null,
      datasets.map(function (ds, i) {
        return el('div', { key: i, style: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '12px' } },
          el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
            el('strong', null, ds.label || ('Series ' + (i + 1))),
            el(Button, { isDestructive: true, isSmall: true, onClick: function () { var d = datasets.slice(); d.splice(i, 1); save(d); } }, __('Remove', 'blockenberg'))
          ),
          el(TextControl, { label: __('Label', 'blockenberg'), value: ds.label || '', onChange: function (v) { var d = datasets.slice(); d[i] = Object.assign({}, d[i], { label: v }); save(d); } }),
          el(BkbgColorSwatch, { label: __('Color', 'blockenberg'), value: ds.color || '#6c3fb5', onChange: function (v) { var d = datasets.slice(); d[i] = Object.assign({}, d[i], { color: v }); save(d); } }),
          el('p', { style: { margin: '0 0 4px', fontSize: '11px', color: '#757575' } }, __('Points: x,y — one per line', 'blockenberg')),
          el(TextareaControl, {
            label: __('Data points (x,y)', 'blockenberg'),
            value: ds.points || '',
            rows: 6,
            onChange: function (v) { var d = datasets.slice(); d[i] = Object.assign({}, d[i], { points: v }); save(d); },
          })
        );
      }),
      el(Button, { variant: 'secondary', onClick: function () {
        var d = datasets.concat([{ label: 'Series ' + (datasets.length + 1), color: '#10b981', points: '5,10\n20,35\n40,25\n60,50\n80,40' }]);
        save(d);
      }}, __('+ Add Series', 'blockenberg'))
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

  registerBlockType('blockenberg/scatter-chart', {
    icon: el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', width: 24, height: 24 },
      el('path', { d: 'M3 3v18h18', stroke: 'currentColor', strokeWidth: 1.5, fill: 'none' }),
      el('circle', { cx: 7, cy: 15, r: 1.5, fill: 'currentColor' }),
      el('circle', { cx: 10, cy: 10, r: 1.5, fill: 'currentColor' }),
      el('circle', { cx: 14, cy: 13, r: 1.5, fill: 'currentColor' }),
      el('circle', { cx: 13, cy: 7, r: 1.5, fill: 'currentColor' }),
      el('circle', { cx: 17, cy: 5, r: 1.5, fill: 'currentColor' }),
      el('circle', { cx: 18, cy: 11, r: 1.5, fill: 'currentColor' })
    ),
    edit: function (props) {
      var a   = props.attributes;
      var set = props.setAttributes;
      var blockProps = useBlockProps({ style: { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined } });

      return el(Fragment, null,
        el(InspectorControls, null,
          el(PanelBody, { title: __('Datasets', 'blockenberg'), initialOpen: true },
            DatasetEditor(a, set)
          ),
          el(PanelBody, { title: __('Chart Options', 'blockenberg'), initialOpen: false },
            el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
            a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.chartTitle, onChange: function (v) { set({ chartTitle: v }); } }),
            el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
            a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.chartSubtitle, onChange: function (v) { set({ chartSubtitle: v }); } }),
            el(RangeControl, { label: __('Chart Height (px)', 'blockenberg'), value: a.chartHeight, min: 200, max: 700, onChange: function (v) { set({ chartHeight: v }); } }),
            el(RangeControl, { label: __('Point Size', 'blockenberg'), value: a.pointSize, min: 2, max: 20, onChange: function (v) { set({ pointSize: v }); } }),
            el(RangeControl, { label: __('Fill Opacity %', 'blockenberg'), value: a.fillAlpha, min: 10, max: 100, onChange: function (v) { set({ fillAlpha: v }); } }),
            el(SelectControl, { label: __('Point Style', 'blockenberg'), value: a.pointStyle, options: POINT_STYLES, onChange: function (v) { set({ pointStyle: v }); } }),
            el(ToggleControl, { label: __('Show Grid', 'blockenberg'), checked: a.showGrid, onChange: function (v) { set({ showGrid: v }); }, __nextHasNoMarginBottom: true }),
            el(ToggleControl, { label: __('Show Legend', 'blockenberg'), checked: a.showLegend, onChange: function (v) { set({ showLegend: v }); }, __nextHasNoMarginBottom: true }),
            a.showLegend && el(SelectControl, { label: __('Legend Position', 'blockenberg'), value: a.legendPos, options: LEG_POS, onChange: function (v) { set({ legendPos: v }); } }),
            el(ToggleControl, { label: __('Animate on load', 'blockenberg'), checked: a.animate, onChange: function (v) { set({ animate: v }); }, __nextHasNoMarginBottom: true })
          ),
          el(PanelBody, { title: __('Axes', 'blockenberg'), initialOpen: false },
            el(TextControl, { label: __('X Axis Label', 'blockenberg'), value: a.xLabel, onChange: function (v) { set({ xLabel: v }); } }),
            el(TextControl, { label: __('Y Axis Label', 'blockenberg'), value: a.yLabel, onChange: function (v) { set({ yLabel: v }); } }),
            el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' } },
              el(TextControl, { label: __('X Min', 'blockenberg'), type: 'number', value: a.xMin, onChange: function (v) { set({ xMin: v }); } }),
              el(TextControl, { label: __('X Max', 'blockenberg'), type: 'number', value: a.xMax, onChange: function (v) { set({ xMax: v }); } }),
              el(TextControl, { label: __('Y Min', 'blockenberg'), type: 'number', value: a.yMin, onChange: function (v) { set({ yMin: v }); } }),
              el(TextControl, { label: __('Y Max', 'blockenberg'), type: 'number', value: a.yMax, onChange: function (v) { set({ yMax: v }); } })
            )
          ),
          el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
            el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 32, onChange: function (v) { set({ borderRadius: v }); } })
          ),
          el(PanelColorSettings, { title: __('Colors', 'blockenberg'), initialOpen: false, colorSettings: [
            { label: __('Card Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
          ]}),
          el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
            el(RangeControl, { label: __('Title Font Size (px)', 'blockenberg'), value: a.titleFontSize, min: 10, max: 32, onChange: function (v) { set({ titleFontSize: v }); }, __nextHasNoMarginBottom: true }),
            el(RangeControl, { label: __('Label / Axis Font Size (px)', 'blockenberg'), value: a.labelFontSize, min: 8, max: 24, onChange: function (v) { set({ labelFontSize: v }); }, __nextHasNoMarginBottom: true })
          ),
          el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
            el(RangeControl, { label: __('Padding Top', 'blockenberg'),    value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { set({ paddingTop:    v }); } }),
            el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { set({ paddingBottom: v }); } })
          )
        ),
        el('div', blockProps,
          el(ScatterPreview, a)
        )
      );
    },

    save: function (props) {
      var a = props.attributes;
      var chartData = {
        datasetsJson: a.datasetsJson,
        fillAlpha: a.fillAlpha,
        showLegend: a.showLegend,
        legendPos: a.legendPos,
        showTitle: a.showTitle,
        chartTitle: a.chartTitle,
        showSubtitle: a.showSubtitle,
        chartSubtitle: a.chartSubtitle,
        showGrid: a.showGrid,
        pointSize: a.pointSize,
        pointStyle: a.pointStyle,
        animate: a.animate,
        xLabel: a.xLabel,
        yLabel: a.yLabel,
        xMin: a.xMin,
        xMax: a.xMax,
        yMin: a.yMin,
        yMax: a.yMax,
        titleFontSize: a.titleFontSize,
        labelFontSize: a.labelFontSize,
      };
      return el(
        window.wp.blockEditor.useBlockProps.save({
          className: 'bkbg-sc-wrapper',
          style: { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined },
        }),
        el('div', {
          className: 'bkbg-sc-card',
          'data-chart': JSON.stringify(chartData),
          'data-height': a.chartHeight,
          style: { background: a.bgColor, borderRadius: a.borderRadius + 'px', padding: '24px' },
        },
          el('div', { style: { position: 'relative', height: a.chartHeight + 'px' } },
            el('canvas', { className: 'bkbg-sc-canvas', style: { height: a.chartHeight + 'px' } })
          )
        )
      );
    },
  });
}() );
