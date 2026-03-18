( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var DIRECTIONS = ['up', 'down', 'down-good', 'neutral'];

    function trendIcon(dir) {
        if (dir === 'up')        return '↑';
        if (dir === 'down')      return '↓';
        if (dir === 'down-good') return '↓';
        return '→';
    }

    function trendClass(dir) {
        if (dir === 'up')        return 'bkbg-kpi-trend-up';
        if (dir === 'down')      return 'bkbg-kpi-trend-down';
        if (dir === 'down-good') return 'bkbg-kpi-trend-downgood';
        return 'bkbg-kpi-trend-neutral';
    }

    /* ── Sparkline SVG ─────────────────────────────────────────────── */
    function SparklineEl(sparkStr, color, fill, width, height) {
        var nums = (sparkStr || '').split(',').map(Number).filter(function (n) { return !isNaN(n); });
        if (nums.length < 2) return null;
        var minV = Math.min.apply(null, nums);
        var maxV = Math.max.apply(null, nums);
        var range = maxV - minV || 1;
        var w = width;  var h = height;
        var step = w / (nums.length - 1);
        var points = nums.map(function (n, i) {
            return (i * step).toFixed(1) + ',' + ((1 - (n - minV) / range) * (h - 4) + 2).toFixed(1);
        }).join(' ');
        var fillPath = 'M ' + points.split(' ').join(' L ') +
            ' L ' + w + ',' + h + ' L 0,' + h + ' Z';
        return el('svg', {
            viewBox: '0 0 ' + w + ' ' + h,
            width: w, height: h,
            xmlns: 'http://www.w3.org/2000/svg',
            className: 'bkbg-kpi-spark',
            style: { display: 'block', overflow: 'visible' }
        },
            el('path', { d: fillPath, fill: fill, stroke: 'none' }),
            el('polyline', {
                points: points,
                fill: 'none',
                stroke: color,
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
            })
        );
    }

    /* ── Single tile preview ───────────────────────────────────────── */
    function TilePreview(tile, a) {
        var dir = tile.direction || 'up';
        return el('div', {
            className: 'bkbg-kpi-tile',
            style: {
                background: a.cardBg,
                borderRadius: a.cardRadius + 'px',
                padding: a.cardPadding + 'px',
                border: '1px solid ' + (a.borderColor || 'transparent'),
                boxShadow: '0 2px 16px ' + (a.cardShadow || 'rgba(0,0,0,0.08)')
            }
        },
            /* top row: icon + trend */
            el('div', { className: 'bkbg-kpi-top' },
                a.showIcon !== false && el('span', {
                    className: 'bkbg-kpi-icon',
                    style: { fontSize: a.iconSize + 'px' }
                }, (tile.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(tile.iconType, tile.icon, tile.iconDashicon, tile.iconImageUrl, tile.iconDashiconColor) : (tile.icon || '📊')),
                a.showTrend !== false && el('span', {
                    className: 'bkbg-kpi-trend ' + trendClass(dir)
                }, trendIcon(dir) + ' ' + (tile.trend || ''))
            ),
            /* value */
            el('div', {
                className: 'bkbg-kpi-value',
                style: { color: a.valueColor }
            }, tile.value || '—'),
            /* label */
            el('div', {
                className: 'bkbg-kpi-label',
                style: { color: a.labelColor }
            }, tile.label || ''),
            /* sparkline */
            a.showSparkline !== false && SparklineEl(
                tile.sparkline, a.sparklineColor, a.sparklineFill,
                a.sparklineWidth || 120, a.sparklineHeight || 48
            )
        );
    }

    registerBlockType('blockenberg/kpi-tiles', {
        title:    __('KPI Tiles'),
        icon:     'chart-bar',
        category: 'bkbg-business',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.valueTypo, '--bkbg-kpi-v-'));
                    Object.assign(s, _tvFn(attr.labelTypo, '--bkbg-kpi-l-'));
                    Object.assign(s, _tvFn(attr.trendTypo, '--bkbg-kpi-tr-'));
                }
                return { className: 'bkbg-kpi-wrap', style: s };
            })());

            function updateTile(idx, field, val) {
                var tiles = attr.tiles.map(function (t, i) {
                    return i === idx ? Object.assign({}, t, { [field]: val }) : t;
                });
                setAttr({ tiles: tiles });
            }
            function addTile() {
                setAttr({ tiles: attr.tiles.concat([{
                    label: 'New Metric', value: '0', trend: '+0%',
                    direction: 'up', sparkline: '10,20,15,30,25,40', icon: '📊',
                    iconType: 'custom-char', iconDashicon: '', iconImageUrl: ''
                }]) });
            }
            function removeTile(idx) {
                setAttr({ tiles: attr.tiles.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                /* Tiles management */
                el(PanelBody, { title: __('Tiles'), initialOpen: true },
                    attr.tiles.map(function (tile, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: (tile.label || 'Tile ' + (idx + 1)),
                            initialOpen: false
                        },
                            IP() && el(IP().IconPickerControl, {
                                iconType: tile.iconType || 'custom-char',
                                customChar: tile.icon || '',
                                dashicon: tile.iconDashicon || '',
                                imageUrl: tile.iconImageUrl || '',
                                onChangeType: function (v) { updateTile(idx, 'iconType', v); },
                                onChangeChar: function (v) { updateTile(idx, 'icon', v); },
                                onChangeDashicon: function (v) { updateTile(idx, 'iconDashicon', v); },
                                onChangeImageUrl: function (v) { updateTile(idx, 'iconImageUrl', v); }
                            }),
                            el(TextControl, { label: __('Label'), value: tile.label || '',
                                onChange: function (v) { updateTile(idx, 'label', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Value'), value: tile.value || '',
                                onChange: function (v) { updateTile(idx, 'value', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Trend (e.g. +18%)'), value: tile.trend || '',
                                onChange: function (v) { updateTile(idx, 'trend', v); },
                                __nextHasNoMarginBottom: true }),
                            el(SelectControl, {
                                label: __('Trend Direction'),
                                value: tile.direction || 'up',
                                options: [
                                    { label: 'Up (good)',   value: 'up' },
                                    { label: 'Down (bad)',  value: 'down' },
                                    { label: 'Down (good)', value: 'down-good' },
                                    { label: 'Neutral',     value: 'neutral' }
                                ],
                                onChange: function (v) { updateTile(idx, 'direction', v); },
                                __nextHasNoMarginBottom: true
                            }),
                            el(TextControl, {
                                label: __('Sparkline data (comma-separated numbers)'),
                                value: tile.sparkline || '',
                                onChange: function (v) { updateTile(idx, 'sparkline', v); },
                                __nextHasNoMarginBottom: true
                            }),
                            attr.tiles.length > 1 && el(Button, {
                                isDestructive: true, variant: 'secondary',
                                onClick: function () { removeTile(idx); },
                                style: { marginTop: '8px' }
                            }, __('Remove Tile'))
                        );
                    }),
                    el(Button, {
                        variant: 'primary', onClick: addTile,
                        style: { marginTop: '8px', width: '100%' }
                    }, __('+ Add Tile'))
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Columns'),
                        value: String(attr.columns),
                        options: [
                            { label: '2', value: '2' },
                            { label: '3', value: '3' },
                            { label: '4', value: '4' }
                        ],
                        onChange: function (v) { setAttr({ columns: Number(v) }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Card Radius (px)'), value: attr.cardRadius,
                        min: 0, max: 32,
                        onChange: function (v) { setAttr({ cardRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Padding (px)'), value: attr.cardPadding,
                        min: 12, max: 48,
                        onChange: function (v) { setAttr({ cardPadding: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Display */
                el(PanelBody, { title: __('Display Options'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Sparkline'), checked: attr.showSparkline,
                        onChange: function (v) { setAttr({ showSparkline: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Icon'), checked: attr.showIcon,
                        onChange: function (v) { setAttr({ showIcon: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Trend'), checked: attr.showTrend,
                        onChange: function (v) { setAttr({ showTrend: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Animate Numbers on Scroll'), checked: attr.animateNumbers,
                        onChange: function (v) { setAttr({ animateNumbers: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Icon Size'), value: attr.iconSize,
                        min: 18, max: 56,
                        onChange: function (v) { setAttr({ iconSize: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Sparkline Height (px)'), value: attr.sparklineHeight,
                        min: 24, max: 96,
                        onChange: function (v) { setAttr({ sparklineHeight: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Sparkline Width (px)'), value: attr.sparklineWidth,
                        min: 60, max: 240,
                        onChange: function (v) { setAttr({ sparklineWidth: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Value'), value: attr.valueTypo || {}, onChange: function (v) { setAttr({ valueTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Label'), value: attr.labelTypo || {}, onChange: function (v) { setAttr({ labelTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Trend'), value: attr.trendTypo || {}, onChange: function (v) { setAttr({ trendTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Section BG'), value: attr.sectionBg,
                          onChange: function (v) { setAttr({ sectionBg: v || 'transparent' }); } },
                        { label: __('Card BG'), value: attr.cardBg,
                          onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Shadow'), value: attr.cardShadow,
                          onChange: function (v) { setAttr({ cardShadow: v || 'rgba(0,0,0,0.08)' }); } },
                        { label: __('Card Border'), value: attr.borderColor,
                          onChange: function (v) { setAttr({ borderColor: v || 'transparent' }); } },
                        { label: __('Value Color'), value: attr.valueColor,
                          onChange: function (v) { setAttr({ valueColor: v || '#0f172a' }); } },
                        { label: __('Label Color'), value: attr.labelColor,
                          onChange: function (v) { setAttr({ labelColor: v || '#64748b' }); } },
                        { label: __('Up Trend Color'), value: attr.upColor,
                          onChange: function (v) { setAttr({ upColor: v || '#10b981' }); } },
                        { label: __('Down Trend Color'), value: attr.downColor,
                          onChange: function (v) { setAttr({ downColor: v || '#ef4444' }); } },
                        { label: __('Down (Good) Color'), value: attr.downGoodColor,
                          onChange: function (v) { setAttr({ downGoodColor: v || '#10b981' }); } },
                        { label: __('Sparkline Line'), value: attr.sparklineColor,
                          onChange: function (v) { setAttr({ sparklineColor: v || '#6366f1' }); } },
                        { label: __('Sparkline Fill'), value: attr.sparklineFill,
                          onChange: function (v) { setAttr({ sparklineFill: v || 'rgba(99,102,241,0.12)' }); } }
                    ]
                })
            );

            var gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)',
                gap: '20px',
                background: attr.sectionBg || 'transparent',
                padding: '8px 0'
            };

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', { className: 'bkbg-kpi-grid', style: gridStyle },
                        attr.tiles.map(function (tile, i) {
                            return el('div', { key: i }, TilePreview(tile, attr));
                        })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            var opts = {
                tiles:          attr.tiles,
                columns:        attr.columns,
                showSparkline:  attr.showSparkline,
                showIcon:       attr.showIcon,
                showTrend:      attr.showTrend,
                animateNumbers: attr.animateNumbers,
                cardRadius:     attr.cardRadius,
                cardPadding:    attr.cardPadding,
                sparklineHeight: attr.sparklineHeight,
                sparklineWidth:  attr.sparklineWidth,
                valueSize:      attr.valueSize,
                labelSize:      attr.labelSize,
                trendSize:      attr.trendSize,
                iconSize:       attr.iconSize,
                cardBg:         attr.cardBg,
                cardShadow:     attr.cardShadow,
                valueColor:     attr.valueColor,
                labelColor:     attr.labelColor,
                upColor:        attr.upColor,
                downColor:      attr.downColor,
                downGoodColor:  attr.downGoodColor,
                sparklineColor: attr.sparklineColor,
                sparklineFill:  attr.sparklineFill,
                sectionBg:      attr.sectionBg,
                borderColor:    attr.borderColor,
                valueTypo:      attr.valueTypo,
                labelTypo:      attr.labelTypo,
                trendTypo:      attr.trendTypo
            };
            return el('div', bp,
                el('div', { className: 'bkbg-kpi-app', 'data-opts': JSON.stringify(opts) })
            );
        }
    });
}() );
