(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _tc, _tv;
        function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
        function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

        var CARD_STYLE_OPTIONS = [
            { label: 'Shadow',  value: 'shadow' },
            { label: 'Glass',   value: 'glass' },
            { label: 'Flat',    value: 'flat' },
        ];
        var TREND_OPTIONS = [
            { label: 'Up (positive)',   value: 'up' },
            { label: 'Down (negative)', value: 'down' },
            { label: 'Neutral',         value: 'neutral' },
        ];
        var COLUMN_OPTIONS = [
            { label: '2 columns', value: '2' },
            { label: '3 columns', value: '3' },
            { label: '4 columns', value: '4' },
        ];

        var ICON_PATHS = {
            chart:    'M18 20V10M12 20V4M6 20v-6',
            users:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
            shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
            clock:    'M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2',
            bolt:     'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
            heart:    'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
            star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            dollar:   'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
        };
        var ICON_OPTIONS = [
            { label: 'Bar chart', value: 'chart' },
            { label: 'Users',     value: 'users' },
            { label: 'Shield',    value: 'shield' },
            { label: 'Clock',     value: 'clock' },
            { label: 'Lightning', value: 'bolt' },
            { label: 'Heart',     value: 'heart' },
            { label: 'Star',      value: 'star' },
            { label: 'Dollar',    value: 'dollar' },
        ];

        function makeId() { return 'm' + Math.random().toString(36).substr(2, 6); }

        /* Build SVG polyline from comma-separated numbers */
        function buildSparklinePath(dataStr, width, height) {
            var nums = dataStr.split(',').map(function (s) { return parseFloat(s.trim()); }).filter(function (n) { return !isNaN(n); });
            if (nums.length < 2) return '';
            var min = Math.min.apply(null, nums);
            var max = Math.max.apply(null, nums);
            var range = max - min || 1;
            var pad = 2;
            var w = width - pad * 2;
            var h = height - pad * 2;
            var points = nums.map(function (n, i) {
                var x = pad + (i / (nums.length - 1)) * w;
                var y = pad + h - ((n - min) / range) * h;
                return x.toFixed(1) + ',' + y.toFixed(1);
            });
            return points.join(' ');
        }

        function SparklineSVG(props) {
            var dataStr = props.dataStr || '';
            var width = props.width || 80;
            var height = props.height || 32;
            var color = props.color || '#6c3fb5';
            var points = buildSparklinePath(dataStr, width, height);
            if (!points) return null;
            return el('svg', { width: width, height: height, viewBox: '0 0 ' + width + ' ' + height, style: { display: 'block', overflow: 'visible', marginTop: '8px' } },
                el('polyline', { points: points, fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
                el('polyline', { points: points + ' ' + (width - 2) + ',' + height + ' 2,' + height, fill: color, fillOpacity: 0.12, stroke: 'none' })
            );
        }

        function TrendArrow(props) {
            var trend = props.trend;
            var color = props.color;
            if (trend === 'up') {
                return el('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'inline', verticalAlign: 'middle', marginRight: '2px' } },
                    el('polyline', { points: '18 15 12 9 6 15' }));
            }
            if (trend === 'down') {
                return el('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'inline', verticalAlign: 'middle', marginRight: '2px' } },
                    el('polyline', { points: '6 9 12 15 18 9' }));
            }
            return null;
        }

        function MetricCard(props) {
            var metric = props.metric;
            var a = props.a;
            var trendColor = metric.trend === 'up' ? (a.upColor || '#16a34a') : metric.trend === 'down' ? (a.downColor || '#dc2626') : '#6b7280';
            var cardBg = metric.bgColor || a.globalCardBg;
            var textColor = metric.textColor || a.globalTextColor;
            var accent = metric.accentColor || '#6c3fb5';
            var boxShadow = a.cardStyle === 'shadow' ? '0 4px 24px rgba(0,0,0,0.10)' : 'none';
            var border = a.cardStyle === 'bordered' ? '1.5px solid rgba(108,63,181,0.15)' : 'none';
            var backdropFilter = a.cardStyle === 'glass' ? 'blur(12px)' : undefined;
            var iconPath = ICON_PATHS[metric.icon] || ICON_PATHS.chart;

            return el('div', { className: 'bkbg-metric-card', style: { background: cardBg, color: textColor, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', boxShadow: boxShadow, border: border, backdropFilter: backdropFilter, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
                a.showIcon && el('div', { style: { position: 'absolute', top: a.cardPadding + 'px', right: a.cardPadding + 'px', color: accent, opacity: 0.6 } },
                    el('svg', { viewBox: '0 0 24 24', width: a.iconSize, height: a.iconSize, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
                        el('path', { d: iconPath }))
                ),
                el('p', { className: 'bkbg-mtc-label', style: { margin: '0 0 4px', color: a.labelColor || undefined, opacity: 0.75 } }, metric.label),
                el('p', { className: 'bkbg-metric-value', style: { margin: '0' } }, metric.value),
                a.showTrend && el('div', { className: 'bkbg-mtc-trend', style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: trendColor } },
                    el(TrendArrow, { trend: metric.trend, color: trendColor }),
                    el('span', null, metric.trendValue),
                    a.showTrendPeriod && metric.trendPeriod && el('span', { style: { opacity: 0.6, fontWeight: 400 } }, metric.trendPeriod)
                ),
                a.showSparkline && metric.sparkline && el(SparklineSVG, { dataStr: metric.sparkline, width: 80, height: a.sparklineHeight, color: accent })
            );
        }

        registerBlockType('blockenberg/metric-cards', {
            deprecated: [{
                attributes: JSON.parse(JSON.stringify(wp.blocks.getBlockType ? {} : {})),
                save: function (props) {
                    var a = props.attributes;
                    var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-metric-cards-wrap' });
                    var cols = parseInt(a.columns, 10) || 3;

                    return el('div', Object.assign({}, blockProps, { style: { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined } }),
                        el('div', { className: 'bkbg-metric-cards', style: { display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', 1fr)', gap: a.gap + 'px' } },
                            a.metrics.map(function (metric) {
                                var trendColor = metric.trend === 'up' ? (a.upColor || '#16a34a') : metric.trend === 'down' ? (a.downColor || '#dc2626') : '#6b7280';
                                var cardBg = metric.bgColor || a.globalCardBg;
                                var textColor = metric.textColor || a.globalTextColor;
                                var accent = metric.accentColor || '#6c3fb5';
                                var boxShadow = a.cardStyle === 'shadow' ? '0 4px 24px rgba(0,0,0,0.10)' : 'none';
                                var backdropFilter = a.cardStyle === 'glass' ? 'blur(12px)' : undefined;
                                var iconPath = ICON_PATHS[metric.icon] || ICON_PATHS.chart;

                                return el('div', { key: metric.id, className: 'bkbg-metric-card', 'data-trend': metric.trend, 'data-value': metric.value, style: { background: cardBg, color: textColor, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', boxShadow: boxShadow, backdropFilter: backdropFilter, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
                                    a.showIcon && el('div', { style: { position: 'absolute', top: a.cardPadding + 'px', right: a.cardPadding + 'px', color: accent, opacity: 0.6 } },
                                        el('svg', { viewBox: '0 0 24 24', width: a.iconSize, height: a.iconSize, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                                            el('path', { d: iconPath }))
                                    ),
                                    el('p', { style: { margin: '0 0 4px', fontSize: a.labelSize + 'px', fontWeight: (a.labelFontWeight || 600), lineHeight: (a.lineHeight || 1.3), color: a.labelColor || undefined, opacity: 0.75 } }, metric.label),
                                    el('p', { className: 'bkbg-metric-value', style: { margin: '0', fontSize: a.valueSize + 'px', fontWeight: a.valueFontWeight, lineHeight: 1.1 } }, metric.value),
                                    a.showTrend && el('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: a.trendSize + 'px', color: trendColor, fontWeight: 600 } },
                                        metric.trend !== 'neutral' && el('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: trendColor, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                                            el('polyline', { points: metric.trend === 'up' ? '18 15 12 9 6 15' : '6 9 12 15 18 9' })),
                                        el('span', null, metric.trendValue),
                                        a.showTrendPeriod && metric.trendPeriod && el('span', { style: { opacity: 0.6, fontWeight: 400 } }, metric.trendPeriod)
                                    ),
                                    a.showSparkline && metric.sparkline && (function () {
                                        var points = buildSparklinePath(metric.sparkline, 80, a.sparklineHeight);
                                        return points ? el('svg', { width: 80, height: a.sparklineHeight, viewBox: '0 0 80 ' + a.sparklineHeight, style: { display: 'block', overflow: 'visible', marginTop: '8px' } },
                                            el('polyline', { points: points, fill: 'none', stroke: accent, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
                                            el('polyline', { points: points + ' 78,' + a.sparklineHeight + ' 2,' + a.sparklineHeight, fill: accent, fillOpacity: 0.12, stroke: 'none' })
                                        ) : null;
                                    })()
                                );
                            })
                        )
                    );
                }
            }],
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var metrics = attributes.metrics;
                var blockProps = useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined };
                    Object.assign(s, _tvf(attributes.valueTypo, '--bkbg-mtc-vl-'));
                    Object.assign(s, _tvf(attributes.labelTypo, '--bkbg-mtc-lb-'));
                    Object.assign(s, _tvf(attributes.trendTypo, '--bkbg-mtc-tr-'));
                    return { style: s };
                })());

                function setMetric(id, patch) { setAttributes({ metrics: metrics.map(function (m) { return m.id === id ? Object.assign({}, m, patch) : m; }) }); }
                function addMetric() {
                    setAttributes({ metrics: metrics.concat([{ id: makeId(), label: 'New Metric', value: '0', trend: 'up', trendValue: '+0%', trendPeriod: 'vs last month', icon: 'chart', sparkline: '10,20,15,30,25,40,35', accentColor: '#6c3fb5', bgColor: '', textColor: '' }]) });
                }
                function removeMetric(id) { if (metrics.length <= 1) return; setAttributes({ metrics: metrics.filter(function (m) { return m.id !== id; }) }); }

                var cols = parseInt(attributes.columns, 10) || 3;

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Columns', 'blockenberg'), value: attributes.columns, options: COLUMN_OPTIONS, onChange: function (v) { setAttributes({ columns: v }); } }),
                            el(SelectControl, { label: __('Card style', 'blockenberg'), value: attributes.cardStyle, options: CARD_STYLE_OPTIONS, onChange: function (v) { setAttributes({ cardStyle: v }); } }),
                            el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: attributes.gap, min: 8, max: 60, onChange: function (v) { setAttributes({ gap: v }); } }),
                            el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: attributes.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                            el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: attributes.cardPadding, min: 8, max: 64, onChange: function (v) { setAttributes({ cardPadding: v }); } })
                        ),
                        el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                            el(ToggleControl, { label: __('Show icon', 'blockenberg'), checked: attributes.showIcon, onChange: function (v) { setAttributes({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: attributes.iconSize, min: 16, max: 48, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                            el(ToggleControl, { label: __('Show sparkline', 'blockenberg'), checked: attributes.showSparkline, onChange: function (v) { setAttributes({ showSparkline: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Sparkline height (px)', 'blockenberg'), value: attributes.sparklineHeight, min: 16, max: 80, onChange: function (v) { setAttributes({ sparklineHeight: v }); } }),
                            el(ToggleControl, { label: __('Show trend', 'blockenberg'), checked: attributes.showTrend, onChange: function (v) { setAttributes({ showTrend: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show trend period', 'blockenberg'), checked: attributes.showTrendPeriod, onChange: function (v) { setAttributes({ showTrendPeriod: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                            el(getTypoControl(), { label: __('Value', 'blockenberg'), value: attributes.valueTypo, onChange: function (v) { setAttributes({ valueTypo: v }); } }),
                            el(getTypoControl(), { label: __('Label', 'blockenberg'), value: attributes.labelTypo, onChange: function (v) { setAttributes({ labelTypo: v }); } }),
                            el(getTypoControl(), { label: __('Trend', 'blockenberg'), value: attributes.trendTypo, onChange: function (v) { setAttributes({ trendTypo: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Colors', 'blockenberg'), initialOpen: false,
                            colorSettings: [
                                { value: attributes.upColor,       onChange: function (v) { setAttributes({ upColor: v || '' }); },       label: __('Trend up', 'blockenberg') },
                                { value: attributes.downColor,     onChange: function (v) { setAttributes({ downColor: v || '' }); },     label: __('Trend down', 'blockenberg') },
                                { value: attributes.globalCardBg,  onChange: function (v) { setAttributes({ globalCardBg: v || '' }); },  label: __('Card background', 'blockenberg') },
                                { value: attributes.globalTextColor,onChange: function (v) { setAttributes({ globalTextColor: v || '' }); }, label: __('Card text', 'blockenberg') },
                                { value: attributes.labelColor,    onChange: function (v) { setAttributes({ labelColor: v || '' }); },    label: __('Label color', 'blockenberg') },
                                { value: attributes.bgColor,       onChange: function (v) { setAttributes({ bgColor: v || '' }); },       label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelBody, { title: __('Metrics', 'blockenberg'), initialOpen: false },
                            metrics.map(function (metric, idx) {
                                return el(PanelBody, { key: metric.id, title: (metric.label || 'Metric') + ' #' + (idx + 1), initialOpen: false },
                                    el(TextControl, { label: __('Label', 'blockenberg'), value: metric.label, onChange: function (v) { setMetric(metric.id, { label: v }); } }),
                                    el(TextControl, { label: __('Value', 'blockenberg'), value: metric.value, onChange: function (v) { setMetric(metric.id, { value: v }); } }),
                                    el(SelectControl, { label: __('Trend direction', 'blockenberg'), value: metric.trend, options: TREND_OPTIONS, onChange: function (v) { setMetric(metric.id, { trend: v }); } }),
                                    el(TextControl, { label: __('Trend value (e.g. +12%)', 'blockenberg'), value: metric.trendValue, onChange: function (v) { setMetric(metric.id, { trendValue: v }); } }),
                                    el(TextControl, { label: __('Trend period (e.g. vs last month)', 'blockenberg'), value: metric.trendPeriod, onChange: function (v) { setMetric(metric.id, { trendPeriod: v }); } }),
                                    el(SelectControl, { label: __('Icon', 'blockenberg'), value: metric.icon, options: ICON_OPTIONS, onChange: function (v) { setMetric(metric.id, { icon: v }); } }),
                                    el(TextControl, { label: __('Sparkline data (comma-separated numbers)', 'blockenberg'), value: metric.sparkline, onChange: function (v) { setMetric(metric.id, { sparkline: v }); } }),
                                    el(PanelColorSettings, {
                                        title: __('Card Colors', 'blockenberg'), initialOpen: false,
                                        colorSettings: [
                                            { value: metric.accentColor, onChange: function (v) { setMetric(metric.id, { accentColor: v || '' }); }, label: __('Accent / Sparkline', 'blockenberg') },
                                            { value: metric.bgColor,     onChange: function (v) { setMetric(metric.id, { bgColor: v || '' }); },     label: __('Background', 'blockenberg') },
                                            { value: metric.textColor,   onChange: function (v) { setMetric(metric.id, { textColor: v || '' }); },   label: __('Text', 'blockenberg') },
                                        ]
                                    }),
                                    metrics.length > 1 && el(Button, { onClick: function () { removeMetric(metric.id); }, variant: 'tertiary', size: 'compact', isDestructive: true }, __('Remove metric', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addMetric, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Metric', 'blockenberg'))
                        )
                    ),

                    el('div', blockProps,
                        el('div', { className: 'bkbg-metric-cards', style: { display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', 1fr)', gap: attributes.gap + 'px' } },
                            metrics.map(function (metric) {
                                return el(MetricCard, { key: metric.id, metric: metric, a: attributes });
                            })
                        )
                    )
                );
            },

            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save((function () {
                    var _tvf = getTypoCssVars();
                    var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                    Object.assign(s, _tvf(a.valueTypo, '--bkbg-mtc-vl-'));
                    Object.assign(s, _tvf(a.labelTypo, '--bkbg-mtc-lb-'));
                    Object.assign(s, _tvf(a.trendTypo, '--bkbg-mtc-tr-'));
                    return { className: 'bkbg-metric-cards-wrap', style: s };
                })());
                var cols = parseInt(a.columns, 10) || 3;

                return el('div', blockProps,
                    el('div', { className: 'bkbg-metric-cards', style: { display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', 1fr)', gap: a.gap + 'px' } },
                        a.metrics.map(function (metric) {
                            var trendColor = metric.trend === 'up' ? (a.upColor || '#16a34a') : metric.trend === 'down' ? (a.downColor || '#dc2626') : '#6b7280';
                            var cardBg = metric.bgColor || a.globalCardBg;
                            var textColor = metric.textColor || a.globalTextColor;
                            var accent = metric.accentColor || '#6c3fb5';
                            var boxShadow = a.cardStyle === 'shadow' ? '0 4px 24px rgba(0,0,0,0.10)' : 'none';
                            var backdropFilter = a.cardStyle === 'glass' ? 'blur(12px)' : undefined;
                            var iconPath = ICON_PATHS[metric.icon] || ICON_PATHS.chart;

                            return el('div', { key: metric.id, className: 'bkbg-metric-card', 'data-trend': metric.trend, 'data-value': metric.value, style: { background: cardBg, color: textColor, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', boxShadow: boxShadow, backdropFilter: backdropFilter, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
                                a.showIcon && el('div', { style: { position: 'absolute', top: a.cardPadding + 'px', right: a.cardPadding + 'px', color: accent, opacity: 0.6 } },
                                    el('svg', { viewBox: '0 0 24 24', width: a.iconSize, height: a.iconSize, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                                        el('path', { d: iconPath }))
                                ),
                                el('p', { className: 'bkbg-mtc-label', style: { margin: '0 0 4px', color: a.labelColor || undefined, opacity: 0.75 } }, metric.label),
                                el('p', { className: 'bkbg-metric-value', style: { margin: '0' } }, metric.value),
                                a.showTrend && el('div', { className: 'bkbg-mtc-trend', style: { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: trendColor } },
                                    metric.trend !== 'neutral' && el('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: trendColor, strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                                        el('polyline', { points: metric.trend === 'up' ? '18 15 12 9 6 15' : '6 9 12 15 18 9' })),
                                    el('span', null, metric.trendValue),
                                    a.showTrendPeriod && metric.trendPeriod && el('span', { style: { opacity: 0.6, fontWeight: 400 } }, metric.trendPeriod)
                                ),
                                a.showSparkline && metric.sparkline && (function () {
                                    var points = buildSparklinePath(metric.sparkline, 80, a.sparklineHeight);
                                    return points ? el('svg', { width: 80, height: a.sparklineHeight, viewBox: '0 0 80 ' + a.sparklineHeight, style: { display: 'block', overflow: 'visible', marginTop: '8px' } },
                                        el('polyline', { points: points, fill: 'none', stroke: accent, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
                                        el('polyline', { points: points + ' 78,' + a.sparklineHeight + ' 2,' + a.sparklineHeight, fill: accent, fillOpacity: 0.12, stroke: 'none' })
                                    ) : null;
                                })()
                            );
                        })
                    )
                );
            }
        });
}());
