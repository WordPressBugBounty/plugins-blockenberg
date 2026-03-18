( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var useState = wp.element.useState;

    var _gcTC, _gcTV;
    function _tc() { return _gcTC || (_gcTC = window.bkbgTypographyControl); }
    function _tv() { return _gcTV || (_gcTV = window.bkbgTypoCssVars); }

    // --- SVG helpers ---

    // angle=0 → left (min), angle=180 → right (max), going through top
    function polarToCartesian(cx, cy, r, angleDeg) {
        var rad = (angleDeg * Math.PI) / 180;
        return {
            x: cx - r * Math.cos(rad),
            y: cy - r * Math.sin(rad)
        };
    }

    // Compute layout metrics for the semicircle gauge
    function gaugeMetrics(size, strokeWidth) {
        var W  = size;
        var H  = Math.round(size / 2 + strokeWidth + 8);
        var cx = W / 2;
        var cy = H - Math.round(strokeWidth / 2) - 4;
        var r  = cx - strokeWidth * 1.5 - 2;
        var perimeter = Math.PI * r;
        return { W: W, H: H, cx: cx, cy: cy, r: r, perimeter: perimeter };
    }

    // SVG arc path from left through top to right (counterclockwise in SVG)
    function arcPath(cx, cy, r) {
        return (
            'M ' + (cx - r) + ' ' + cy +
            ' A ' + r + ' ' + r + ' 0 1 0 ' + (cx + r) + ' ' + cy
        );
    }

    // Find the zone colour for a given 0-100 percentage
    function zoneColor(zones, pct) {
        var color = '#6c3fb5';
        for (var i = 0; i < zones.length; i++) {
            if (pct <= zones[i].to) { color = zones[i].color; break; }
            color = zones[i].color; // last zone wins if over max
        }
        return color;
    }

    // --- Editor SVG preview (shows static, fully-drawn arc at current value) ---
    function GaugePreview(props) {
        var a   = props.attrs;
        var sz  = a.size || 260;
        var sw  = a.strokeWidth || 18;
        var m   = gaugeMetrics(sz, sw);
        var p   = arcPath(m.cx, m.cy, m.r);
        var min = a.minValue || 0;
        var max = a.maxValue || 100;
        var f   = Math.min(1, Math.max(0, (a.value - min) / (max - min)));
        var pct = f * 100;
        var zones = a.colorZones || [];
        var fillColor = zoneColor(zones, pct);
        var lnfs = (a.typoLabel && a.typoLabel.sizeDesktop) || a.labelFontSize || 14;

        var children = [];

        // Track
        children.push(el('path', {
            key: 'track', d: p, fill: 'none',
            stroke: a.trackColor || '#e5e7eb',
            strokeWidth: sw, strokeLinecap: 'round'
        }));

        // Zone arcs
        zones.forEach(function (zone, zi) {
            var zLen = (zone.to - zone.from) / 100 * m.perimeter;
            var zOff = -(zone.from / 100) * m.perimeter;
            children.push(el('path', {
                key: 'z' + zi, d: p, fill: 'none', stroke: zone.color,
                strokeWidth: sw, strokeLinecap: 'butt',
                strokeDasharray: zLen + ' ' + m.perimeter,
                strokeDashoffset: zOff
            }));
        });

        // Ticks
        if (a.showTicks) {
            var tc = a.tickCount || 10;
            for (var t = 0; t <= tc; t++) {
                var pt1 = polarToCartesian(m.cx, m.cy, m.r - sw / 2 - 2, t / tc * 180);
                var pt2 = polarToCartesian(m.cx, m.cy, m.r + sw / 2 + 2, t / tc * 180);
                children.push(el('line', {
                    key: 'tk' + t,
                    x1: pt1.x, y1: pt1.y, x2: pt2.x, y2: pt2.y,
                    stroke: '#9ca3af', strokeWidth: 1.5
                }));
            }
        }

        // Fill arc (editor: fully drawn to current value)
        children.push(el('path', {
            key: 'fill', d: p, fill: 'none', stroke: fillColor,
            strokeWidth: sw, strokeLinecap: 'round',
            strokeDasharray: m.perimeter + ' ' + m.perimeter,
            strokeDashoffset: (1 - f) * m.perimeter
        }));

        // Needle
        if (a.showNeedle) {
            var nTip = polarToCartesian(m.cx, m.cy, m.r - sw - 4, f * 180);
            children.push(el('line', {
                key: 'ndle',
                x1: m.cx, y1: m.cy, x2: nTip.x, y2: nTip.y,
                stroke: a.needleColor || '#374151',
                strokeWidth: 3, strokeLinecap: 'round'
            }));
            children.push(el('circle', {
                key: 'nhub', cx: m.cx, cy: m.cy,
                r: sw / 2, fill: a.needleColor || '#374151'
            }));
        }

        // Value
        if (a.showValue !== false) {
            children.push(el('text', {
                key: 'val',
                className: 'bkgc-value-text',
                x: m.cx,
                y: m.cy - (a.showNeedle ? sw + 2 : 0),
                textAnchor: 'middle',
                dominantBaseline: 'auto',
                fill: a.valueColor || '#111827'
            }, a.value + (a.unit || '')));
        }

        // Label
        if (a.showLabel !== false && a.label) {
            children.push(el('text', {
                key: 'lbl',
                className: 'bkgc-label-text',
                x: m.cx, y: m.cy + lnfs + 2,
                textAnchor: 'middle', dominantBaseline: 'hanging',
                fill: a.labelColor || '#6b7280'
            }, a.label));
        }

        return el('svg', {
            viewBox: '0 0 ' + m.W + ' ' + m.H,
            width: m.W, height: m.H,
            style: { display: 'block', overflow: 'visible', margin: '0 auto' }
        }, children);
    }

    // --- Register ---
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

    registerBlockType('blockenberg/gauge-chart', {

        edit: function (props) {
            var attrs  = props.attributes;
            var setAttr = props.setAttributes;
            var zones  = attrs.colorZones || [];

            function updateZone(idx, key, val) {
                var newZones = zones.map(function (z, i) {
                    if (i !== idx) return z;
                    var updated = {};
                    Object.keys(z).forEach(function (k) { updated[k] = z[k]; });
                    updated[key] = val;
                    return updated;
                });
                setAttr({ colorZones: newZones });
            }

            function addZone() {
                setAttr({ colorZones: zones.concat([{ from: 0, to: 100, color: '#6c3fb5' }]) });
            }

            function removeZone(idx) {
                setAttr({ colorZones: zones.filter(function (_, i) { return i !== idx; }) });
            }

            var wrapStyle = Object.assign({},
                attrs.bgColor ? { background: attrs.bgColor } : {},
                _tv()(attrs.typoValue, '--bkgc-vl-'),
                _tv()(attrs.typoLabel, '--bkgc-lb-')
            );
            var blockProps = useBlockProps({ className: 'bkgc-wrap', style: wrapStyle });

            return el(Fragment, null,
                el(InspectorControls, null,

                    // ── Value ──
                    el(PanelBody, { title: __('Value', 'blockenberg'), initialOpen: true },
                        el(RangeControl, {
                            label: __('Value', 'blockenberg'),
                            value: attrs.value, min: attrs.minValue, max: attrs.maxValue,
                            onChange: function (v) { setAttr({ value: v }); }
                        }),
                        el(TextControl, {
                            label: __('Label', 'blockenberg'),
                            value: attrs.label,
                            onChange: function (v) { setAttr({ label: v }); }
                        }),
                        el(TextControl, {
                            label: __('Unit', 'blockenberg'),
                            value: attrs.unit,
                            onChange: function (v) { setAttr({ unit: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Min Value', 'blockenberg'),
                            value: attrs.minValue, min: -9999, max: attrs.value - 1,
                            onChange: function (v) { setAttr({ minValue: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Max Value', 'blockenberg'),
                            value: attrs.maxValue, min: attrs.value + 1, max: 99999,
                            onChange: function (v) { setAttr({ maxValue: v }); }
                        })
                    ),

                    // ── Color Zones ──
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc()({ label: __('Value', 'blockenberg'), value: attrs.typoValue, onChange: function (v) { setAttr({ typoValue: v }); } }),
                        _tc()({ label: __('Label', 'blockenberg'), value: attrs.typoLabel, onChange: function (v) { setAttr({ typoLabel: v }); } })
                    ),
el(PanelBody, { title: __('Color Zones', 'blockenberg'), initialOpen: false },
                        zones.map(function (zone, idx) {
                            return el(PanelBody, {
                                key: 'zone-' + idx,
                                title: __('Zone', 'blockenberg') + ' ' + (idx + 1),
                                initialOpen: idx === 0
                            },
                                el(RangeControl, {
                                    label: __('From (%)', 'blockenberg'),
                                    value: zone.from, min: 0, max: 99,
                                    onChange: function (v) { updateZone(idx, 'from', v); }
                                }),
                                el(RangeControl, {
                                    label: __('To (%)', 'blockenberg'),
                                    value: zone.to, min: 1, max: 100,
                                    onChange: function (v) { updateZone(idx, 'to', v); }
                                }),
                                el(BkbgColorSwatch, {
                                    label: __('Color', 'blockenberg'),
                                    value: zone.color,
                                    onChange: function (v) { updateZone(idx, 'color', v); }
                                }),
                                zones.length > 1 && el(Button, {
                                    variant: 'secondary',
                                    isDestructive: true,
                                    onClick: function () { removeZone(idx); }
                                }, __('Remove Zone', 'blockenberg'))
                            );
                        }),
                        el(Button, {
                            variant: 'secondary',
                            style: { marginTop: '8px' },
                            onClick: addZone
                        }, __('+ Add Zone', 'blockenberg'))
                    ),

                    // ── Visual ──
                    el(PanelBody, { title: __('Visual', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Size (px)', 'blockenberg'),
                            value: attrs.size, min: 100, max: 600,
                            onChange: function (v) { setAttr({ size: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Stroke Width', 'blockenberg'),
                            value: attrs.strokeWidth, min: 4, max: 50,
                            onChange: function (v) { setAttr({ strokeWidth: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Needle', 'blockenberg'),
                            checked: attrs.showNeedle,
                            onChange: function (v) { setAttr({ showNeedle: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Value', 'blockenberg'),
                            checked: attrs.showValue,
                            onChange: function (v) { setAttr({ showValue: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Label', 'blockenberg'),
                            checked: attrs.showLabel,
                            onChange: function (v) { setAttr({ showLabel: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Tick Marks', 'blockenberg'),
                            checked: attrs.showTicks,
                            onChange: function (v) { setAttr({ showTicks: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        attrs.showTicks && el(RangeControl, {
                            label: __('Tick Count', 'blockenberg'),
                            value: attrs.tickCount, min: 2, max: 20,
                            onChange: function (v) { setAttr({ tickCount: v }); }
                        }),
                        ),

                    // ── Animation ──
                    el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Animate Duration (ms)', 'blockenberg'),
                            value: attrs.animateDuration, min: 200, max: 5000, step: 100,
                            onChange: function (v) { setAttr({ animateDuration: v }); }
                        })
                    ),

                    // ── Colors ──
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Track Color', 'blockenberg'), value: attrs.trackColor, onChange: function (v) { setAttr({ trackColor: v || '#e5e7eb' }); } },
                            { label: __('Value Color', 'blockenberg'), value: attrs.valueColor, onChange: function (v) { setAttr({ valueColor: v || '#111827' }); } },
                            { label: __('Label Color', 'blockenberg'), value: attrs.labelColor, onChange: function (v) { setAttr({ labelColor: v || '#6b7280' }); } },
                            { label: __('Needle Color', 'blockenberg'), value: attrs.needleColor, onChange: function (v) { setAttr({ needleColor: v || '#374151' }); } },
                            { label: __('Background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    el(GaugePreview, { attrs: attrs })
                )
            );
        },

        save: function (props) {
            var a   = props.attributes;
            var sw  = a.strokeWidth;
            var m   = gaugeMetrics(a.size, sw);
            var p   = arcPath(m.cx, m.cy, m.r);
            var min = a.minValue;
            var max = a.maxValue;
            var zones = a.colorZones || [];
            var valPct = Math.min(100, Math.max(0, (a.value - min) / (max - min) * 100));
            var fillColor = zoneColor(zones, valPct);
            var lnfs = (a.typoLabel && a.typoLabel.sizeDesktop) || a.labelFontSize || 14;

            var wrapStyle = Object.assign({},
                a.bgColor ? { background: a.bgColor } : {},
                _tv()(a.typoValue, '--bkgc-vl-'),
                _tv()(a.typoLabel, '--bkgc-lb-')
            );

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkgc-wrap',
                style:      wrapStyle,
                'data-value':      a.value,
                'data-min':        min,
                'data-max':        max,
                'data-duration':   a.animateDuration,
                'data-perimeter':  m.perimeter,
                'data-unit':       a.unit,
                'data-show-needle': a.showNeedle ? '1' : '0',
                'data-r':          m.r,
                'data-cx':         m.cx,
                'data-cy':         m.cy,
                'data-needle-color': a.needleColor || '#374151',
                'data-fill-color':   fillColor
            });

            var svgChildren = [];

            // Track
            svgChildren.push(el('path', {
                key: 'track', d: p, fill: 'none',
                stroke: a.trackColor || '#e5e7eb',
                strokeWidth: sw, strokeLinecap: 'round'
            }));

            // Zone arcs
            zones.forEach(function (zone, zi) {
                var zLen = (zone.to - zone.from) / 100 * m.perimeter;
                var zOff = -(zone.from / 100) * m.perimeter;
                svgChildren.push(el('path', {
                    key: 'z' + zi, d: p, fill: 'none', stroke: zone.color,
                    strokeWidth: sw, strokeLinecap: 'butt',
                    strokeDasharray: zLen + ' ' + m.perimeter,
                    strokeDashoffset: zOff
                }));
            });

            // Ticks
            if (a.showTicks) {
                for (var t = 0; t <= a.tickCount; t++) {
                    var pt1 = polarToCartesian(m.cx, m.cy, m.r - sw / 2 - 2, t / a.tickCount * 180);
                    var pt2 = polarToCartesian(m.cx, m.cy, m.r + sw / 2 + 2, t / a.tickCount * 180);
                    svgChildren.push(el('line', {
                        key: 'tk' + t,
                        x1: pt1.x, y1: pt1.y, x2: pt2.x, y2: pt2.y,
                        stroke: '#9ca3af', strokeWidth: 1.5
                    }));
                }
            }

            // Fill arc — starts empty (dashoffset = perimeter), JS animates it
            svgChildren.push(el('path', {
                key: 'fill',
                className: 'bkgc-fill',
                d: p, fill: 'none', stroke: fillColor,
                strokeWidth: sw, strokeLinecap: 'round',
                strokeDasharray: m.perimeter + ' ' + m.perimeter,
                strokeDashoffset: m.perimeter
            }));

            // Needle pivot at min position (angle=0 = left)
            if (a.showNeedle) {
                var nBase = polarToCartesian(m.cx, m.cy, m.r - sw - 4, 0);
                svgChildren.push(el('line', {
                    key: 'ndle', className: 'bkgc-needle',
                    x1: m.cx, y1: m.cy, x2: nBase.x, y2: nBase.y,
                    stroke: a.needleColor || '#374151',
                    strokeWidth: 3, strokeLinecap: 'round'
                }));
                svgChildren.push(el('circle', {
                    key: 'nhub', cx: m.cx, cy: m.cy,
                    r: sw / 2, fill: a.needleColor || '#374151'
                }));
            }

            // Value text — starts at 0, JS counts up
            if (a.showValue) {
                svgChildren.push(el('text', {
                    key: 'val',
                    className: 'bkgc-value-text',
                    x: m.cx,
                    y: m.cy - (a.showNeedle ? sw + 2 : 0),
                    textAnchor: 'middle',
                    dominantBaseline: 'auto',
                    fill: a.valueColor || '#111827'
                }, '0' + (a.unit || '')));
            }

            // Label
            if (a.showLabel && a.label) {
                svgChildren.push(el('text', {
                    key: 'lbl',
                    className: 'bkgc-label-text',
                    x: m.cx, y: m.cy + lnfs + 2,
                    textAnchor: 'middle', dominantBaseline: 'hanging',
                    fill: a.labelColor || '#6b7280'
                }, a.label));
            }

            return el('div', blockProps,
                el('svg', {
                    viewBox: '0 0 ' + m.W + ' ' + m.H,
                    width: m.W, height: m.H,
                    style: { display: 'block', margin: '0 auto', overflow: 'visible' }
                }, svgChildren)
            );
        }
    });
}() );
