( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkwfc-tt-');
        return v;
    }

    /* ── updateItem (ES5 safe) ── */
    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    /* ── abbreviate large numbers ── */
    function abbr(n, prefix, suffix, doAbbr) {
        var abs = Math.abs(n);
        var sign = n < 0 ? '-' : '';
        var str;
        if (!doAbbr || abs < 1000) {
            str = abs.toLocaleString();
        } else if (abs < 1000000) {
            str = (abs / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else if (abs < 1000000000) {
            str = (abs / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else {
            str = (abs / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        return sign + prefix + str + suffix;
    }

    /* ── type label ── */
    var TYPE_LABELS = {
        start:    __('Starting value', 'blockenberg'),
        increase: __('Increase (+)', 'blockenberg'),
        decrease: __('Decrease (−)', 'blockenberg'),
        total:    __('Total / Net', 'blockenberg')
    };
    var TYPE_OPTIONS = [
        { label: __('Starting value', 'blockenberg'), value: 'start' },
        { label: __('Increase (+)', 'blockenberg'),   value: 'increase' },
        { label: __('Decrease (−)', 'blockenberg'),  value: 'decrease' },
        { label: __('Total / Net', 'blockenberg'),    value: 'total' }
    ];

    /* ── color for type ── */
    function typeColor(type, a) {
        if (type === 'start')    return a.startColor;
        if (type === 'increase') return a.increaseColor;
        if (type === 'decrease') return a.decreaseColor;
        return a.totalColor;
    }

    /* ── compute bar segments for preview ── */
    /* Returns array of { label, type, base, top, barColor, displayValue } */
    function computeSegments(items, a) {
        var running = 0;
        return items.map(function (item) {
            var v = parseFloat(item.value) || 0;
            var type = item.type || 'increase';
            var base, top;

            if (type === 'start') {
                base = 0; top = v; running = v;
            } else if (type === 'total') {
                base = 0; top = running; /* running stays same */
            } else if (type === 'increase') {
                base = running; top = running + v; running = top;
            } else { /* decrease */
                top = running; base = running + v; running = base;
            }

            return {
                label: item.label,
                type: type,
                base: base,
                top: top,
                barColor: typeColor(type, a),
                displayValue: v,
                runningAfter: running
            };
        });
    }

    /* ── SVG bar chart preview in editor ── */
    function WaterfallPreview(props) {
        var a = props.attributes;
        var items = a.items;
        if (!items || !items.length) return el('div', {}, 'No data.');

        var segs = computeSegments(items, a);
        var allVals = segs.map(function (s) { return s.top; }).concat(segs.map(function (s) { return s.base; }));
        var maxVal = Math.max.apply(null, allVals);
        var minVal = Math.min.apply(null, allVals.concat([0]));
        var range = maxVal - minVal || 1;

        var svgW = 600, svgH = Math.min(a.height, 320);
        var padLeft = 55, padRight = 16, padTop = 20, padBottom = 36;
        var chartW = svgW - padLeft - padRight;
        var chartH = svgH - padTop - padBottom;
        var barW = Math.min(a.barThickness, Math.floor(chartW / items.length) - 6);
        var step = chartW / items.length;

        function yPx(v) { return padTop + chartH - ((v - minVal) / range) * chartH; }

        var bars = segs.map(function (s, i) {
            var x = padLeft + i * step + (step - barW) / 2;
            var y1 = yPx(Math.max(s.base, s.top));
            var y2 = yPx(Math.min(s.base, s.top));
            var bh = Math.max(y2 - y1, 2);
            return { x: x, y: y1, width: barW, height: bh, seg: s, cx: x + barW / 2 };
        });

        var gridLines = [];
        var gridCount = 5;
        for (var g = 0; g <= gridCount; g++) {
            var gv = minVal + (range / gridCount) * g;
            var gy = yPx(gv);
            gridLines.push(el('line', { key: 'gl' + g, x1: padLeft, x2: svgW - padRight, y1: gy, y2: gy, stroke: a.gridColor, strokeWidth: 1, strokeDasharray: '4,3' }));
            gridLines.push(el('text', { key: 'glt' + g, x: padLeft - 4, y: gy + 4, textAnchor: 'end', fontSize: 9, fill: a.labelColor },
                abbr(gv, a.valuePrefix, a.valueSuffix, a.abbreviate)
            ));
        }

        var connectors = [];
        if (a.showConnectors) {
            for (var ci = 0; ci < bars.length - 1; ci++) {
                var curr = bars[ci];
                var next = bars[ci + 1];
                var connY = yPx(segs[ci].type === 'decrease' ? segs[ci].base : segs[ci].top);
                connectors.push(el('line', {
                    key: 'conn' + ci,
                    x1: curr.x + curr.width, x2: next.x,
                    y1: connY, y2: connY,
                    stroke: a.connectorColor, strokeWidth: 1.5, strokeDasharray: '4,3'
                }));
            }
        }

        return el('div', { style: { background: a.bgColor, borderRadius: '8px' } },
            a.showTitle && a.title ? el('div', {
                className: 'bkbg-wfc-title',
                style: { color: a.titleColor, padding: '0 0 12px' }
            }, a.title) : null,
            el('svg', { width: '100%', viewBox: '0 0 600 ' + svgH, style: { display: 'block', maxWidth: '100%' } },
                a.showGrid ? el('g', {}, gridLines) : null,
                el('line', { x1: padLeft, x2: svgW - padRight, y1: yPx(0), y2: yPx(0), stroke: a.gridColor, strokeWidth: 1.5 }),
                el('g', {}, connectors),
                el('g', {},
                    bars.map(function (b, i) {
                        return el('g', { key: i },
                            el('rect', {
                                x: b.x, y: b.y, width: b.width, height: b.height,
                                fill: b.seg.barColor, rx: a.borderRadius
                            }),
                            a.showDataLabels ? el('text', {
                                x: b.cx, y: b.y - 4, textAnchor: 'middle',
                                fontSize: a.valueSize, fill: b.seg.barColor, fontWeight: 700, fontFamily: 'system-ui,sans-serif'
                            }, abbr(b.seg.displayValue, a.valuePrefix, a.valueSuffix, a.abbreviate)) : null,
                            el('text', {
                                x: b.cx, y: svgH - 4, textAnchor: 'middle',
                                fontSize: a.labelSize, fill: a.labelColor, fontFamily: 'system-ui,sans-serif'
                            }, b.seg.label.length > 10 ? b.seg.label.slice(0, 9) + '…' : b.seg.label)
                        );
                    })
                )
            ),
            a.showLegend ? el('div', {
                style: { display: 'flex', flexWrap: 'wrap', gap: '10px 18px', padding: '10px 0 0', fontFamily: 'system-ui,sans-serif' }
            },
                [['start', 'Start', a.startColor], ['increase', 'Increase', a.increaseColor], ['decrease', 'Decrease', a.decreaseColor], ['total', 'Total', a.totalColor]].map(function (row) {
                    return el('div', { key: row[0], style: { display: 'flex', alignItems: 'center', gap: '5px' } },
                        el('span', { style: { width: '12px', height: '12px', borderRadius: '3px', background: row[2], display: 'inline-block', flexShrink: 0 } }),
                        el('span', { style: { fontSize: '12px', color: a.labelColor } }, row[1])
                    );
                })
            ) : null
        );
    }

    /* ── item list editor ── */
    function ItemEditor(props) {
        var items = props.items;
        var setItems = props.setItems;
        var expanded = props.expanded;
        var setExpanded = props.setExpanded;

        return el('div', {},
            items.map(function (item, i) {
                var isOpen = expanded === i;
                var col = {start:'#6366f1',increase:'#10b981',decrease:'#ef4444',total:'#8b5cf6'}[item.type] || '#6b7280';
                return el('div', {
                    key: i,
                    style: { border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '5px', overflow: 'hidden' }
                },
                    el('div', {
                        onClick: function () { setExpanded(isOpen ? -1 : i); },
                        style: {
                            padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            background: isOpen ? '#f9fafb' : '#fff',
                            borderBottom: isOpen ? '1px solid #e5e7eb' : 'none'
                        }
                    },
                        el('span', { style: { width: '10px', height: '10px', borderRadius: '2px', background: col, flexShrink: 0 } }),
                        el('span', { style: { flex: 1, fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                            item.label || '(empty)'
                        ),
                        el('span', { style: { fontSize: '11px', color: '#9ca3af', marginRight: '4px' } },
                            (item.value > 0 ? '+' : '') + (item.value || 0)
                        ),
                        el('button', {
                            onClick: function (e) {
                                e.stopPropagation();
                                if (items.length <= 2) return;
                                setItems(items.filter(function (_, j) { return j !== i; }));
                                setExpanded(-1);
                            },
                            style: { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', padding: '0 2px', lineHeight: 1 }
                        }, '×'),
                        el('span', { style: { color: '#9ca3af', fontSize: '10px' } }, isOpen ? '▲' : '▼')
                    ),
                    isOpen ? el('div', { style: { padding: '10px' } },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Label', 'blockenberg'),
                            value: item.label,
                            onChange: function (v) { setItems(updateItem(items, i, 'label', v)); }
                        }),
                        el('div', { style: { marginTop: '8px' } },
                            el(TextControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Value (negative = decrease)', 'blockenberg'),
                                type: 'number',
                                value: item.value,
                                onChange: function (v) { setItems(updateItem(items, i, 'value', parseFloat(v) || 0)); }
                            })
                        ),
                        el('div', { style: { marginTop: '8px' } },
                            el(SelectControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Type', 'blockenberg'),
                                value: item.type,
                                options: TYPE_OPTIONS,
                                onChange: function (v) { setItems(updateItem(items, i, 'type', v)); }
                            })
                        ),
                        el('div', { style: { display: 'flex', gap: '6px', marginTop: '8px' } },
                            i > 0 ? el(Button, {
                                variant: 'secondary', style: { fontSize: '11px' },
                                onClick: function () {
                                    var arr = items.slice(); var tmp = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = tmp;
                                    setItems(arr); setExpanded(i - 1);
                                }
                            }, '↑') : null,
                            i < items.length - 1 ? el(Button, {
                                variant: 'secondary', style: { fontSize: '11px' },
                                onClick: function () {
                                    var arr = items.slice(); var tmp = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = tmp;
                                    setItems(arr); setExpanded(i + 1);
                                }
                            }, '↓') : null,
                            el(Button, {
                                variant: 'secondary', style: { fontSize: '11px' },
                                onClick: function () {
                                    var copy = Object.assign({}, item, { label: item.label + ' (copy)' });
                                    var arr = items.slice(); arr.splice(i + 1, 0, copy);
                                    setItems(arr); setExpanded(i + 1);
                                }
                            }, __('Dup', 'blockenberg'))
                        )
                    ) : null
                );
            }),
            el('div', { style: { marginTop: '8px', display: 'flex', gap: '6px' } },
                el(Button, {
                    variant: 'primary', style: { flex: 1, justifyContent: 'center' },
                    onClick: function () {
                        var arr = items.slice();
                        arr.push({ label: 'New item', value: 0, type: 'increase' });
                        setItems(arr); setExpanded(arr.length - 1);
                    }
                }, __('+ Add Item', 'blockenberg')),
                el(Button, {
                    variant: 'secondary', style: { justifyContent: 'center' },
                    onClick: function () {
                        var arr = items.slice();
                        arr.push({ label: 'Total', value: 0, type: 'total' });
                        setItems(arr); setExpanded(arr.length - 1);
                    }
                }, __('+ Total', 'blockenberg'))
            )
        );
    }

    /* ── register ── */
    registerBlockType('blockenberg/waterfall-chart', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var expState = useState(-1);
            var expanded = expState[0];
            var setExpanded = expState[1];

            function setItems(v) { setAttributes({ items: v }); }

            var blockProps = useBlockProps({ className: 'bkbg-wfc-editor-wrap' });

            return el(Fragment, {},

                el(InspectorControls, {},

                    /* ── Data ── */
                    el(PanelBody, { title: __('Chart Data', 'blockenberg'), initialOpen: true },
                        el(ItemEditor, {
                            items: a.items,
                            setItems: setItems,
                            expanded: expanded,
                            setExpanded: setExpanded
                        })
                    ),

                    /* ── Labels ── */
                    el(PanelBody, { title: __('Labels & Format', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Chart title', 'blockenberg'),
                            value: a.title,
                            onChange: function (v) { setAttributes({ title: v }); }
                        }),
                        el('div', { style: { marginTop: '10px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show title', 'blockenberg'),
                                checked: a.showTitle,
                                onChange: function (v) { setAttributes({ showTitle: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px', display: 'flex', gap: '8px' } },
                            el('div', { style: { flex: 1 } },
                                el(TextControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Value prefix', 'blockenberg'),
                                    value: a.valuePrefix,
                                    onChange: function (v) { setAttributes({ valuePrefix: v }); }
                                })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(TextControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Value suffix', 'blockenberg'),
                                    value: a.valueSuffix,
                                    onChange: function (v) { setAttributes({ valueSuffix: v }); }
                                })
                            )
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Abbreviate large values (K, M, B)', 'blockenberg'),
                                checked: a.abbreviate,
                                onChange: function (v) { setAttributes({ abbreviate: v }); }
                            })
                        )
                    ),

                    /* ── Appearance ── */
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Chart height (px)', 'blockenberg'),
                            value: a.height, min: 200, max: 700,
                            onChange: function (v) { setAttributes({ height: v }); }
                        }),
                        el('div', { style: { marginTop: '10px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Bar max thickness (px)', 'blockenberg'),
                                value: a.barThickness, min: 20, max: 100,
                                onChange: function (v) { setAttributes({ barThickness: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Bar border radius (px)', 'blockenberg'),
                                value: a.borderRadius, min: 0, max: 20,
                                onChange: function (v) { setAttributes({ borderRadius: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Max width (px)', 'blockenberg'),
                                value: a.maxWidth, min: 400, max: 1400,
                                onChange: function (v) { setAttributes({ maxWidth: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show connector lines', 'blockenberg'),
                                checked: a.showConnectors,
                                onChange: function (v) { setAttributes({ showConnectors: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '4px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show data labels', 'blockenberg'),
                                checked: a.showDataLabels,
                                onChange: function (v) { setAttributes({ showDataLabels: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '4px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show grid lines', 'blockenberg'),
                                checked: a.showGrid,
                                onChange: function (v) { setAttributes({ showGrid: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '4px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show legend', 'blockenberg'),
                                checked: a.showLegend,
                                onChange: function (v) { setAttributes({ showLegend: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px', display: 'flex', gap: '8px' } },
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Padding top', 'blockenberg'),
                                    value: a.paddingTop, min: 0, max: 120,
                                    onChange: function (v) { setAttributes({ paddingTop: v }); }
                                })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Padding bottom', 'blockenberg'),
                                    value: a.paddingBottom, min: 0, max: 120,
                                    onChange: function (v) { setAttributes({ paddingBottom: v }); }
                                })
                            )
                        )
                    ),

                    /* ── Colors ── */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl( __( 'Title', 'blockenberg' ), 'titleTypo', a, setAttributes ),
                        el('div', { style: { marginTop: '10px', display: 'flex', gap: '8px' } },
                                                    el('div', { style: { flex: 1 } },
                                                        el(RangeControl, {
                                                            __nextHasNoMarginBottom: true,
                                                            label: __('Label size', 'blockenberg'),
                                                            value: a.labelSize, min: 8, max: 18,
                                                            onChange: function (v) { setAttributes({ labelSize: v }); }
                                                        })
                                                    ),
                                                    el('div', { style: { flex: 1 } },
                                                        el(RangeControl, {
                                                            __nextHasNoMarginBottom: true,
                                                            label: __('Value size', 'blockenberg'),
                                                            value: a.valueSize, min: 8, max: 18,
                                                            onChange: function (v) { setAttributes({ valueSize: v }); }
                                                        })
                                                    )
                                                )
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'),       value: a.bgColor,        onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                            { label: __('Title', 'blockenberg'),            value: a.titleColor,     onChange: function (v) { setAttributes({ titleColor: v || '#111827' }); } },
                            { label: __('Labels / axis', 'blockenberg'),    value: a.labelColor,     onChange: function (v) { setAttributes({ labelColor: v || '#6b7280' }); } },
                            { label: __('Grid lines', 'blockenberg'),       value: a.gridColor,      onChange: function (v) { setAttributes({ gridColor: v || '#e5e7eb' }); } },
                            { label: __('Connectors', 'blockenberg'),       value: a.connectorColor, onChange: function (v) { setAttributes({ connectorColor: v || '#9ca3af' }); } },
                            { label: __('Start bars', 'blockenberg'),       value: a.startColor,     onChange: function (v) { setAttributes({ startColor: v || '#6366f1' }); } },
                            { label: __('Increase bars', 'blockenberg'),    value: a.increaseColor,  onChange: function (v) { setAttributes({ increaseColor: v || '#10b981' }); } },
                            { label: __('Decrease bars', 'blockenberg'),    value: a.decreaseColor,  onChange: function (v) { setAttributes({ decreaseColor: v || '#ef4444' }); } },
                            { label: __('Total bars', 'blockenberg'),       value: a.totalColor,     onChange: function (v) { setAttributes({ totalColor: v || '#8b5cf6' }); } }
                        ]
                    })
                ),

                /* ── canvas ── */
                el('div', blockProps,
                    el('div', {
                        style: {
                            background: a.bgColor,
                            borderRadius: '10px',
                            padding: '24px',
                            paddingTop: a.paddingTop ? a.paddingTop + 'px' : '24px',
                            paddingBottom: a.paddingBottom ? a.paddingBottom + 'px' : '24px',
                            maxWidth: a.maxWidth + 'px',
                            margin: '0 auto',
                            fontFamily: 'system-ui, sans-serif'
                        }
                    },
                        el(WaterfallPreview, { attributes: a })
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save({ style: getTypoCssVars(props.attributes) }),
                el('div', {
                    className: 'bkbg-wfc-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
