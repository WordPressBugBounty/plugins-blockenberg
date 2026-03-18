( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var LEGEND_POS_OPTIONS = [
        { label: __('Top',    'blockenberg'), value: 'top'    },
        { label: __('Bottom', 'blockenberg'), value: 'bottom' },
        { label: __('Left',   'blockenberg'), value: 'left'   },
        { label: __('Right',  'blockenberg'), value: 'right'  },
    ];

    function makeId() { return 'ac' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        var _tv = getTypoCssVars();
        var s = {
            '--bkbg-ac-bg':            a.bgColor     || '#ffffff',
            '--bkbg-ac-card-r':        a.cardRadius  + 'px',
            '--bkbg-ac-title-color':   a.titleColor,
            '--bkbg-ac-title-sz':      a.titleSize   + 'px',
            '--bkbg-ac-subtitle-color':a.subtitleColor,
            paddingTop:    a.paddingTop    + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-ac-title-'));
        Object.assign(s, _tv(a.subtitleTypo || {}, '--bkbg-ac-subtitle-'));
        return s;
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Dataset editor row ─────────────────────────────────────────── */
    function DatasetRow(props) {
        var ds = props.ds;
        var onUpdate = props.onUpdate;
        var onRemove = props.onRemove;
        var openKey  = props.openKey;
        var setOpenKey = props.setOpenKey;

        return el('div', { style: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px', marginBottom: '10px', background: '#fafafa' } },
            el(TextControl, { label: __('Label', 'blockenberg'), value: ds.label, onChange: function (v) { onUpdate('label', v); } }),
            el(TextControl, { label: __('Data (CSV)', 'blockenberg'), value: ds.data, onChange: function (v) { onUpdate('data', v); }, help: __('e.g. 40,55,72,65', 'blockenberg') }),
            renderColorControl('ds-' + ds.id + '-color', __('Color', 'blockenberg'), ds.color, function (v) { onUpdate('color', v); }, openKey, setOpenKey),
            el(ToggleControl, { label: __('Fill area', 'blockenberg'), checked: ds.fill, onChange: function (v) { onUpdate('fill', v); }, __nextHasNoMarginBottom: true }),
            el(RangeControl, { label: __('Line tension', 'blockenberg'), value: ds.tension, min: 0, max: 0.9, step: 0.05, onChange: function (v) { onUpdate('tension', v); } }),
            el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: onRemove, style: { marginTop: '6px' } }, __('Remove dataset', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/area-chart', {
        title: __('Area Chart', 'blockenberg'),
        icon: 'chart-area',
        category: 'bkbg-charts',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function updateDataset(id, key, val) {
                setAttributes({ datasets: a.datasets.map(function (ds) {
                    if (ds.id !== id) return ds;
                    var u = Object.assign({}, ds); u[key] = val; return u;
                }) });
            }

            function addDataset() {
                var idx = a.datasets.length + 1;
                setAttributes({ datasets: a.datasets.concat([{
                    id: makeId(), label: 'Series ' + idx,
                    data: '0,0,0,0,0,0,0,0', color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'),
                    fill: true, tension: 0.45
                }]) });
            }

            function removeDataset(id) {
                setAttributes({ datasets: a.datasets.filter(function (ds) { return ds.id !== id; }) });
            }

            /* Sparkline SVG preview */
            function buildSparklinePath(data, W, H, padX, padY) {
                var pts = data.split(',').map(function (v) { return parseFloat(v.trim()) || 0; });
                if (pts.length < 2) return '';
                var mn = Math.min.apply(null, pts);
                var mx = Math.max.apply(null, pts);
                var rng = mx - mn || 1;
                var xs = pts.map(function (_, i) { return padX + i * (W - 2*padX) / (pts.length - 1); });
                var ys = pts.map(function (v) { return padY + (1 - (v-mn)/rng) * (H - 2*padY); });
                var d = 'M ' + xs[0] + ' ' + ys[0];
                for (var i = 1; i < xs.length; i++) {
                    var cpx = (xs[i-1] + xs[i]) / 2;
                    d += ' C ' + cpx + ' ' + ys[i-1] + ' ' + cpx + ' ' + ys[i] + ' ' + xs[i] + ' ' + ys[i];
                }
                return d;
            }

            var svgW = 560; var svgH = a.height;
            var padX = 32; var padY = 24;

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Data', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('X-Axis Labels (CSV)', 'blockenberg'), value: a.labels, onChange: function (v) { setAttributes({ labels: v }); }, help: __('e.g. Jan,Feb,Mar,Apr', 'blockenberg') }),
                        a.datasets.map(function (ds) {
                            return el(DatasetRow, {
                                key: ds.id, ds: ds, openKey: openColorKey, setOpenKey: setOpenColorKey,
                                onUpdate: function (k, v) { updateDataset(ds.id, k, v); },
                                onRemove: function () { removeDataset(ds.id); },
                            });
                        }),
                        el(Button, { variant: 'secondary', onClick: addDataset, style: { width: '100%', justifyContent: 'center', marginTop: '4px' } }, '+ ' + __('Add Dataset', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Chart Options', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Height (px)', 'blockenberg'), value: a.height, min: 160, max: 700, onChange: function (v) { setAttributes({ height: v }); } }),
                        el(ToggleControl, { label: __('Gradient fill', 'blockenberg'), checked: a.gradientFill, onChange: function (v) { setAttributes({ gradientFill: v }); }, __nextHasNoMarginBottom: true }),
                        a.gradientFill && el(RangeControl, { label: __('Gradient alpha %', 'blockenberg'), value: a.gradientAlpha, min: 5, max: 60, onChange: function (v) { setAttributes({ gradientAlpha: v }); } }),
                        el(ToggleControl, { label: __('Show grid', 'blockenberg'),   checked: a.showGrid,   onChange: function (v) { setAttributes({ showGrid:   v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show legend', 'blockenberg'), checked: a.showLegend, onChange: function (v) { setAttributes({ showLegend: v }); }, __nextHasNoMarginBottom: true }),
                        a.showLegend && el(SelectControl, { label: __('Legend position', 'blockenberg'), value: a.legendPos, options: LEGEND_POS_OPTIONS, onChange: function (v) { setAttributes({ legendPos: v }); } }),
                        el(ToggleControl, { label: __('Show data points', 'blockenberg'), checked: a.showPoints, onChange: function (v) { setAttributes({ showPoints: v }); }, __nextHasNoMarginBottom: true }),
                        a.showPoints && el(RangeControl, { label: __('Point size (px)', 'blockenberg'), value: a.pointSize, min: 2, max: 10, onChange: function (v) { setAttributes({ pointSize: v }); } }),
                        el(RangeControl, { label: __('Line width (px)', 'blockenberg'), value: a.lineWidth, min: 1, max: 6, onChange: function (v) { setAttributes({ lineWidth: v }); } }),
                        el(ToggleControl, { label: __('Animate on load', 'blockenberg'), checked: a.animate, onChange: function (v) { setAttributes({ animate: v }); }, __nextHasNoMarginBottom: true }),
                        a.animate && el(RangeControl, { label: __('Animation duration (ms)', 'blockenberg'), value: a.animDuration, min: 200, max: 2000, step: 100, onChange: function (v) { setAttributes({ animDuration: v }); } })
                    ),
                    el(PanelBody, { title: __('Axes', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('X Axis label', 'blockenberg'), value: a.xLabel, onChange: function (v) { setAttributes({ xLabel: v }); } }),
                        el(TextControl, { label: __('Y Axis label', 'blockenberg'), value: a.yLabel, onChange: function (v) { setAttributes({ yLabel: v }); } }),
                        el(TextControl, { label: __('Y Min (leave blank for auto)', 'blockenberg'), value: a.yMin, onChange: function (v) { setAttributes({ yMin: v }); } }),
                        el(TextControl, { label: __('Y Max (leave blank for auto)', 'blockenberg'), value: a.yMax, onChange: function (v) { setAttributes({ yMax: v }); } })
                    ),
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        renderColorControl('bgColor', __('Card background', 'blockenberg'), a.bgColor, function (v) { setAttributes({ bgColor: v }); }, openColorKey, setOpenColorKey),
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Subtitle Typography', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { setAttributes({ subtitleTypo: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        renderColorControl('titleColor',    __('Title color',    'blockenberg'), a.titleColor,    function (v) { setAttributes({ titleColor:    v }); }, openColorKey, setOpenColorKey),
                        renderColorControl('subtitleColor', __('Subtitle color', 'blockenberg'), a.subtitleColor, function (v) { setAttributes({ subtitleColor: v }); }, openColorKey, setOpenColorKey)
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-ac-card', style: { background: a.bgColor || '#fff', borderRadius: a.cardRadius + 'px', padding: '24px', boxSizing: 'border-box' } },
                        (a.title || a.subtitle) && el('div', { className: 'bkbg-ac-header', style: { marginBottom: '16px' } },
                            el(RichText, { tagName: 'h3', className: 'bkbg-ac-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Chart title…', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 4px' } }),
                            el(RichText, { tagName: 'p', className: 'bkbg-ac-subtitle', value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); }, placeholder: __('Optional subtitle…', 'blockenberg'), style: { color: a.subtitleColor, margin: 0 } })
                        ),
                        /* SVG sparkline preview */
                        el('div', { className: 'bkbg-ac-preview', style: { position: 'relative', height: a.height + 'px', background: '#f9fafb', borderRadius: '8px', overflow: 'hidden' } },
                            el('svg', { viewBox: '0 0 ' + svgW + ' ' + svgH, preserveAspectRatio: 'none', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
                                a.datasets.map(function (ds) {
                                    var path = buildSparklinePath(ds.data, svgW, svgH, padX, padY);
                                    if (!path) return null;
                                    return el(Fragment, { key: ds.id },
                                        ds.fill && el('path', { d: path + ' L ' + (svgW-padX) + ' ' + (svgH-padY) + ' L ' + padX + ' ' + (svgH-padY) + ' Z', fill: ds.color, opacity: 0.15 }),
                                        el('path', { d: path, fill: 'none', stroke: ds.color, strokeWidth: a.lineWidth, strokeLinejoin: 'round', strokeLinecap: 'round' })
                                    );
                                })
                            ),
                            el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', pointerEvents: 'none' } },
                                a.datasets.map(function (ds) {
                                    return el('div', { key: ds.id, style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', background: 'rgba(255,255,255,0.85)', padding: '4px 10px', borderRadius: '99px' } },
                                        el('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: ds.color, flexShrink: 0 } }),
                                        ds.label
                                    );
                                })
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-ac-wrapper', style: buildWrapStyle(a) }),
                el('div', {
                    className: 'bkbg-ac-card',
                    'data-type': 'area',
                    'data-labels': a.labels,
                    'data-datasets': JSON.stringify(a.datasets),
                    'data-height': a.height,
                    'data-gradient': a.gradientFill ? 'true' : 'false',
                    'data-gradient-alpha': a.gradientAlpha,
                    'data-grid': a.showGrid ? '1' : '0',
                    'data-legend': a.showLegend ? '1' : '0',
                    'data-legend-pos': a.legendPos,
                    'data-points': a.showPoints ? '1' : '0',
                    'data-point-size': a.pointSize,
                    'data-line-width': a.lineWidth,
                    'data-animate': a.animate ? '1' : '0',
                    'data-anim-duration': a.animDuration,
                    'data-y-min': a.yMin,
                    'data-y-max': a.yMax,
                    'data-x-label': a.xLabel,
                    'data-y-label': a.yLabel,
                    style: { background: a.bgColor || '#fff', borderRadius: a.cardRadius + 'px', padding: '24px', boxSizing: 'border-box' },
                },
                    (a.title || a.subtitle) && el('div', { className: 'bkbg-ac-header' },
                        a.title    && el(RichText.Content, { tagName: 'h3', className: 'bkbg-ac-title',    value: a.title }),
                        a.subtitle && el(RichText.Content, { tagName: 'p',  className: 'bkbg-ac-subtitle', value: a.subtitle })
                    ),
                    el('div', { className: 'bkbg-ac-chart-wrap' },
                        el('canvas', { className: 'bkbg-ac-canvas', style: { height: a.height + 'px' } })
                    )
                )
            );
        }
    });
}() );
