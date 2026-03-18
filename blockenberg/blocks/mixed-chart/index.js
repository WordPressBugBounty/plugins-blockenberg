( function () {
  var el = window.wp.element.createElement;
  var Fragment = window.wp.element.Fragment;
  var useState = window.wp.element.useState;
  var useEffect = window.wp.element.useEffect;
  var useRef = window.wp.element.useRef;
  var registerBlockType = window.wp.blocks.registerBlockType;
  var InspectorControls = window.wp.blockEditor.InspectorControls;
  var useBlockProps = window.wp.blockEditor.useBlockProps;
  var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;
  var PanelBody      = window.wp.components.PanelBody;
  var RangeControl   = window.wp.components.RangeControl;
  var SelectControl  = window.wp.components.SelectControl;
  var TextControl    = window.wp.components.TextControl;
  var TextareaControl= window.wp.components.TextareaControl;
  var ToggleControl  = window.wp.components.ToggleControl;
  var Button         = window.wp.components.Button;
  var __ = window.wp.i18n.__;

  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

  function loadChart(cb) {
    if (window.Chart) { cb(window.Chart); return; }
    var s = document.createElement('script');
    s.src = CDN;
    s.onload = function () { cb(window.Chart); };
    document.head.appendChild(s);
  }

  function parseLines(text) {
    if (!text) return [];
    return text.trim().split('\n').map(function (l) { return parseFloat(l.trim()); }).filter(function (n) { return !isNaN(n); });
  }

  function parseLabels(text) {
    if (!text) return [];
    return text.trim().split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  }

  function hexToRgba(hex, alpha) {
    hex = (hex || '#6c3fb5').replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function makeId() { return 'mc' + Math.random().toString(36).substr(2, 5); }

  /* ── Dataset row editor ─────────────────────────────────────────── */
  function DatasetEditor(props) {
    var a = props.a;
    var setAttributes = props.set;
    var datasets = [];
    try { datasets = JSON.parse(a.datasetsJson || '[]'); } catch (e) {}

    function update(id, key, val) {
      var next = datasets.map(function (d) {
        if (d.id !== id) return d;
        var u = Object.assign({}, d); u[key] = val; return u;
      });
      setAttributes({ datasetsJson: JSON.stringify(next) });
    }
    function remove(id) {
      setAttributes({ datasetsJson: JSON.stringify(datasets.filter(function (d) { return d.id !== id; })) });
    }
    function add() {
      var d = { id: makeId(), label: 'Series ' + (datasets.length + 1), type: 'bar', color: '#6c3fb5', yAxis: 'y', data: '10\n20\n30\n40\n50\n60\n70\n80\n90\n100\n110\n120' };
      setAttributes({ datasetsJson: JSON.stringify(datasets.concat([d])) });
    }

    return el('div', null,
      datasets.map(function (ds, idx) {
        return el('div', { key: ds.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px', marginBottom: '8px' } },
          el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
            el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: ds.color, flexShrink: 0 } }),
            el('span', { style: { fontWeight: 700, fontSize: '12px', flex: 1 } }, ds.label),
            el('span', { style: { fontSize: '10px', color: '#888', background: ds.type === 'bar' ? '#dbeafe' : '#d1fae5', padding: '2px 6px', borderRadius: '99px' } }, ds.type)
          ),
          el(TextControl,    { label: __('Label', 'blockenberg'),     value: ds.label, onChange: function (v) { update(ds.id, 'label', v); } }),
          el(SelectControl,  { label: __('Chart type', 'blockenberg'), value: ds.type, options: [{ label: 'Bar', value: 'bar' }, { label: 'Line', value: 'line' }], onChange: function (v) { update(ds.id, 'type', v); } }),
          a.dualAxis && el(SelectControl, { label: __('Y-axis', 'blockenberg'), value: ds.yAxis, options: [{ label: 'Left (Y)', value: 'y' }, { label: 'Right (Y1)', value: 'y1' }], onChange: function (v) { update(ds.id, 'yAxis', v); } }),
          el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
            el('span', { style: { fontSize: '12px', fontWeight: 600 } }, __('Color:', 'blockenberg')),
            el('input', { type: 'color', value: ds.color, onChange: function (e) { update(ds.id, 'color', e.target.value); }, style: { width: '32px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' } })
          ),
          el(TextareaControl, { label: __('Values (one per line)', 'blockenberg'), value: ds.data, rows: 6, onChange: function (v) { update(ds.id, 'data', v); } }),
          el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { remove(ds.id); } }, __('Remove series', 'blockenberg'))
        );
      }),
      el(Button, { variant: 'secondary', onClick: add, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Series', 'blockenberg'))
    );
  }

  /* ── Live chart preview ─────────────────────────────────────────── */
  function MixedPreview(props) {
    var a = props.a;
    var canvasRef = useRef(null);
    var chartRef  = useRef(null);

    useEffect(function () {
      var canvas = canvasRef.current;
      if (!canvas) return;

      loadChart(function (ChartJS) {
        if (chartRef.current) { try { chartRef.current.destroy(); } catch(e){} }

        var datasets = [];
        try { datasets = JSON.parse(a.datasetsJson || '[]'); } catch (e) {}
        var labels = parseLabels(a.labels);

        var chartDatasets = datasets.map(function (ds) {
          var vals = parseLines(ds.data);
          var alpha = (a.fillAlpha || 85) / 100;
          var base = {
            label: ds.label,
            data: vals,
            backgroundColor: hexToRgba(ds.color, alpha),
            borderColor: ds.color,
            borderWidth: 2,
            yAxisID: ds.yAxis || 'y',
          };
          if (ds.type === 'bar') {
            base.borderRadius = a.barRadius || 4;
            base.type = 'bar';
          } else {
            base.type = 'line';
            base.pointRadius = a.dotSize || 4;
            base.pointHoverRadius = (a.dotSize || 4) + 2;
            base.borderWidth = a.lineWidth || 2;
            base.fill = false;
            base.tension = 0.35;
          }
          return base;
        });

        var scales = {
          x: { grid: { display: !!a.showGrid } },
          y: { position: 'left', title: { display: !!a.yLabel, text: a.yLabel || '' }, grid: { display: !!a.showGrid } },
        };
        if (a.dualAxis) {
          scales.y1 = { position: 'right', title: { display: !!a.y1Label, text: a.y1Label || '' }, grid: { drawOnChartArea: false } };
        }

        chartRef.current = new ChartJS(canvas, {
          type: 'bar',
          data: { labels: labels, datasets: chartDatasets },
          options: {
            responsive: true,
            animation: { duration: a.animate ? 800 : 0 },
            plugins: {
              legend: { display: !!a.showLegend, position: a.legendPos || 'bottom' },
            },
            scales: scales,
          }
        });
      });

      return function () { if (chartRef.current) { try { chartRef.current.destroy(); } catch(e){} chartRef.current = null; } };
    }, [a.datasetsJson, a.labels, a.showGrid, a.showLegend, a.legendPos, a.animate, a.dualAxis, a.yLabel, a.y1Label, a.barRadius, a.lineWidth, a.dotSize, a.fillAlpha]);

    return el('div', { style: { position: 'relative', width: '100%' } },
      el('canvas', { ref: canvasRef, height: a.chartHeight || 400 })
    );
  }

  registerBlockType('blockenberg/mixed-chart', {
    title: __('Mixed Chart', 'blockenberg'),
    icon: 'chart-bar',
    category: 'bkbg-charts',

    deprecated: [{
      save: function (props) {
        var a = props.attributes;
        return el(window.wp.blockEditor.useBlockProps.save({
          className: 'bkbg-mc-wrapper',
          style: {
            background: a.bgColor || undefined,
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
          }
        }),
          el('div', {
            className: 'bkbg-mc-card',
            'data-chart': JSON.stringify({
              title: a.chartTitle, subtitle: a.chartSubtitle,
              showTitle: a.showTitle, showSubtitle: a.showSubtitle,
              labels: a.labels, datasetsJson: a.datasetsJson,
              showGrid: a.showGrid, showLegend: a.showLegend, legendPos: a.legendPos,
              animate: a.animate, dualAxis: a.dualAxis,
              yLabel: a.yLabel, y1Label: a.y1Label,
              barRadius: a.barRadius, lineWidth: a.lineWidth, dotSize: a.dotSize, fillAlpha: a.fillAlpha,
            }),
            'data-height': a.chartHeight,
            style: { borderRadius: a.borderRadius + 'px' }
          },
            el('canvas', { className: 'bkbg-mc-canvas' })
          )
        );
      }
    }],

    edit: function (props) {
      var a = props.attributes;
      var set = props.setAttributes;

      var blockProps = useBlockProps((function () {
        var _tvf = getTypoCssVars();
        var s = {
          background: a.bgColor || undefined,
          borderRadius: a.borderRadius + 'px',
          paddingTop: a.paddingTop + 'px',
          paddingBottom: a.paddingBottom + 'px',
        };
        Object.assign(s, _tvf(a.titleTypo, '--bkbg-mxc-tt-'));
        Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-mxc-st-'));
        return { style: s };
      })());

      return el(Fragment, null,
        el(InspectorControls, null,
          el(PanelBody, { title: __('Datasets', 'blockenberg'), initialOpen: true },
            el(DatasetEditor, { a: a, set: set })
          ),
          el(PanelBody, { title: __('Labels (X-axis)', 'blockenberg'), initialOpen: false },
            el(TextareaControl, { label: __('Labels (one per line)', 'blockenberg'), value: a.labels, rows: 8, onChange: function (v) { set({ labels: v }); } })
          ),
          el(PanelBody, { title: __('Chart Options', 'blockenberg'), initialOpen: false },
            el(ToggleControl, { label: __('Show title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
            el(ToggleControl, { label: __('Show subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
            a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.chartTitle, onChange: function (v) { set({ chartTitle: v }); } }),
            a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.chartSubtitle, onChange: function (v) { set({ chartSubtitle: v }); } }),
            el(RangeControl, { label: __('Chart height (px)', 'blockenberg'), value: a.chartHeight, min: 200, max: 800, onChange: function (v) { set({ chartHeight: v }); } }),
            el(RangeControl, { label: __('Bar corner radius', 'blockenberg'), value: a.barRadius, min: 0, max: 20, onChange: function (v) { set({ barRadius: v }); } }),
            el(RangeControl, { label: __('Line width (px)', 'blockenberg'), value: a.lineWidth, min: 1, max: 6, onChange: function (v) { set({ lineWidth: v }); } }),
            el(RangeControl, { label: __('Dot size (px)', 'blockenberg'), value: a.dotSize, min: 0, max: 12, onChange: function (v) { set({ dotSize: v }); } }),
            el(RangeControl, { label: __('Fill opacity (%)', 'blockenberg'), value: a.fillAlpha, min: 0, max: 100, onChange: function (v) { set({ fillAlpha: v }); } }),
            el(ToggleControl, { label: __('Show grid lines', 'blockenberg'), checked: a.showGrid, onChange: function (v) { set({ showGrid: v }); }, __nextHasNoMarginBottom: true }),
            el(ToggleControl, { label: __('Show legend', 'blockenberg'), checked: a.showLegend, onChange: function (v) { set({ showLegend: v }); }, __nextHasNoMarginBottom: true }),
            a.showLegend && el(SelectControl, { label: __('Legend position', 'blockenberg'), value: a.legendPos, options: [{ label: 'Bottom', value: 'bottom' }, { label: 'Top', value: 'top' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }], onChange: function (v) { set({ legendPos: v }); } }),
            el(ToggleControl, { label: __('Entrance animation', 'blockenberg'), checked: a.animate, onChange: function (v) { set({ animate: v }); }, __nextHasNoMarginBottom: true })
          ),
          el(PanelBody, { title: __('Axes', 'blockenberg'), initialOpen: false },
            el(ToggleControl, { label: __('Dual Y-axis', 'blockenberg'), checked: a.dualAxis, onChange: function (v) { set({ dualAxis: v }); }, __nextHasNoMarginBottom: true }),
            el(TextControl, { label: __('Left Y-axis label', 'blockenberg'), value: a.yLabel, onChange: function (v) { set({ yLabel: v }); } }),
            a.dualAxis && el(TextControl, { label: __('Right Y-axis label', 'blockenberg'), value: a.y1Label, onChange: function (v) { set({ y1Label: v }); } })
          ),
          el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
            el(RangeControl, { label: __('Border radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 40, onChange: function (v) { set({ borderRadius: v }); } }),
            el(PanelColorSettings, { title: __('Background', 'blockenberg'), initialOpen: false, colorSettings: [{ value: a.bgColor, onChange: function (v) { set({ bgColor: v || '' }); }, label: __('Card background', 'blockenberg') }] })
          ),
          el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { set({ paddingTop: v }); } }),
            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { set({ paddingBottom: v }); } })
          ),
          el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
            el( getTypoControl(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
            el( getTypoControl(), { label: __( 'Subtitle', 'blockenberg' ), value: a.subtitleTypo, onChange: function (v) { set({ subtitleTypo: v }); } })
          )
        ),

        el('div', blockProps,
          el('div', { className: 'bkbg-mc-card', style: { background: '#fff', borderRadius: a.borderRadius + 'px', padding: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' } },
            (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '16px' } },
              a.showTitle && el('h3', { className: 'bkbg-mc-title', style: { margin: 0, color: '#111827' } }, a.chartTitle),
              a.showSubtitle && el('p', { className: 'bkbg-mc-subtitle', style: { margin: '4px 0 0', color: '#6b7280' } }, a.chartSubtitle)
            ),
            el(MixedPreview, { a: a })
          )
        )
      );
    },

    save: function (props) {
      var a = props.attributes;
      var blockProps = window.wp.blockEditor.useBlockProps.save((function () {
        var _tvf = getTypoCssVars();
        var s = {
          background: a.bgColor || undefined,
          paddingTop: a.paddingTop + 'px',
          paddingBottom: a.paddingBottom + 'px',
        };
        Object.assign(s, _tvf(a.titleTypo, '--bkbg-mxc-tt-'));
        Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-mxc-st-'));
        return { className: 'bkbg-mc-wrapper', style: s };
      })());
      return el('div', blockProps,
        el('div', {
          className: 'bkbg-mc-card',
          'data-chart': JSON.stringify({
            title: a.chartTitle, subtitle: a.chartSubtitle,
            showTitle: a.showTitle, showSubtitle: a.showSubtitle,
            labels: a.labels, datasetsJson: a.datasetsJson,
            showGrid: a.showGrid, showLegend: a.showLegend, legendPos: a.legendPos,
            animate: a.animate, dualAxis: a.dualAxis,
            yLabel: a.yLabel, y1Label: a.y1Label,
            barRadius: a.barRadius, lineWidth: a.lineWidth, dotSize: a.dotSize, fillAlpha: a.fillAlpha,
          }),
          'data-height': a.chartHeight,
          style: { borderRadius: a.borderRadius + 'px' }
        },
          el('canvas', { className: 'bkbg-mc-canvas' })
        )
      );
    }
  });
}() );
