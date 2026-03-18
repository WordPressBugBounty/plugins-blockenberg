( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Arc helpers ───────────────────────────────────────────────────────────
    function degToRad( d ) { return d * Math.PI / 180; }

    function arcPath( cx, cy, r, startDeg, endDeg ) {
        const s    = degToRad( startDeg );
        const e    = degToRad( endDeg );
        const span = endDeg - startDeg;
        const large = span >= 180 ? 1 : 0;
        const x1 = cx + r * Math.cos( s );
        const y1 = cy + r * Math.sin( s );
        const x2 = cx + r * Math.cos( e );
        const y2 = cy + r * Math.sin( e );
        const f  = v => v.toFixed( 3 );
        if ( Math.abs( span ) >= 359.9 ) {
            // Full circle — draw as two semicircular arcs
            const mx = cx + r * Math.cos( s + Math.PI );
            const my = cy + r * Math.sin( s + Math.PI );
            return `M ${ f(x1) } ${ f(y1) } A ${ f(r) } ${ f(r) } 0 1 1 ${ f(mx) } ${ f(my) } A ${ f(r) } ${ f(r) } 0 1 1 ${ f(x1) } ${ f(y1) }`;
        }
        return `M ${ f(x1) } ${ f(y1) } A ${ f(r) } ${ f(r) } 0 ${ large } 1 ${ f(x2) } ${ f(y2) }`;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderRadialBar( a ) {
        const series    = a.series || [];
        const S         = a.svgSize;
        const cx        = S / 2;
        const cy        = S / 2;
        const TW        = a.trackWidth;
        const TG        = a.trackGap;
        const maxVal    = a.maxValue || 100;
        const startDeg  = a.startAngle || -90;
        const capsType  = a.roundedCaps ? 'round' : 'butt';

        // Outermost ring radius, shrinking per ring
        const outerR = Math.min( cx, cy ) - 10;
        const legH   = a.showLegend ? Math.ceil( series.length / 2 ) * 22 + 16 : 0;
        const svgH   = S + legH;

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: S, height: svgH, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        series.forEach( ( ser, i ) => {
            const r       = outerR - i * ( TW + TG );
            if ( r - TW / 2 < 10 ) return; // no room
            const clr     = ser.color || '#6366f1';
            const ratio   = Math.min( ( ser.value || 0 ) / maxVal, 1 );
            const endDeg  = startDeg + ratio * 360;

            // Track (background circle)
            svgEls.push( el( 'path', { key: `tr${ i }`, d: arcPath( cx, cy, r, startDeg, startDeg + 360 ), fill: 'none', stroke: a.trackBgColor || '#f3f4f6', strokeWidth: TW } ) );

            // Value arc
            if ( ratio > 0 ) {
                svgEls.push( el( 'path', { key: `arc${ i }`, d: arcPath( cx, cy, r, startDeg, endDeg ), fill: 'none', stroke: clr, strokeWidth: TW, strokeLinecap: capsType } ) );
            }

            // Label just before the 12-o'clock start point
            if ( a.showLabels ) {
                const lrad = degToRad( startDeg - 6 );
                const lr   = r + TW / 2 + 2;
                const lx   = cx + lr * Math.cos( lrad );
                const ly   = cy + lr * Math.sin( lrad );
                svgEls.push( el( 'text', { key: `ilbl${ i }`, x: lx, y: ly, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, ser.label || '' ) );
            }
        } );

        // Centre value display — show the first/only series value prominently
        if ( series.length === 1 && a.showValues ) {
            svgEls.push( el( 'text', { key: 'cv', x: cx, y: cy - 6, textAnchor: 'middle', fill: series[0].color, fontSize: a.valueFontSize || 32, fontWeight: a.valueFontWeight || 700, fontFamily: 'inherit' }, String( series[0].value || 0 ) ) );
            svgEls.push( el( 'text', { key: 'cl', x: cx, y: cy + 16, textAnchor: 'middle', fill: a.textColor, fontSize: 12, fontFamily: 'inherit' }, `/ ${ a.maxValue }` ) );
        }

        // Legend
        if ( a.showLegend ) {
            const perRow = 2;
            const lBase  = S + 12;
            series.forEach( ( ser, i ) => {
                const lx = 10 + ( i % perRow ) * ( S / perRow );
                const ly = lBase + Math.floor( i / perRow ) * 22;
                svgEls.push( el( 'rect',   { key: `lr${ i }`, x: lx, y: ly, width: 12, height: 12, fill: ser.color, rx: 6 } ) );
                svgEls.push( el( 'text',   { key: `lt${ i }`, x: lx + 16, y: ly + 6, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' },
                    a.showValues ? `${ ser.label } — ${ ser.value }${ a.maxValue === 100 ? '%' : '' }` : ser.label
                ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ S } ${ svgH }`, width: '100%', style: { display: 'block', maxWidth: S + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSer( setAttributes, series, si, field, val ) {
        setAttributes( { series: series.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
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

    registerBlockType( 'blockenberg/radial-bar', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrb-tt-'));
                return { className: 'bkbg-radialbar-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),   checked: a.showTitle,   onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),  checked: a.showLegend,  onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Labels', 'blockenberg' ),  checked: a.showLabels,  onChange: v => setAttributes( { showLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),  checked: a.showValues,  onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Rounded Caps', 'blockenberg' ), checked: a.roundedCaps, onChange: v => setAttributes( { roundedCaps: v } ) } ),
                        el( RangeControl, { label: __( 'Max Value', 'blockenberg' ),    value: a.maxValue,   onChange: v => setAttributes( { maxValue: v } ),   min: 1, max: 10000 } ),
                        el( RangeControl, { label: __( 'Start Angle (°)', 'blockenberg' ), value: a.startAngle, onChange: v => setAttributes( { startAngle: v } ), min: -180, max: 180 } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Size (px)', 'blockenberg' ), value: a.svgSize,    onChange: v => setAttributes( { svgSize: v } ),    min: 200, max: 800 } ),
                        el( RangeControl, { label: __( 'Track Width', 'blockenberg' ),      value: a.trackWidth, onChange: v => setAttributes( { trackWidth: v } ), min: 6, max: 60 } ),
                        el( RangeControl, { label: __( 'Gap Between Rings', 'blockenberg' ), value: a.trackGap,  onChange: v => setAttributes( { trackGap: v } ),   min: 0, max: 30 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el( TC, { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function(v) { setAttributes({ titleTypo: v }); } }),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize || 32, onChange: v => setAttributes( { valueFontSize: v } ), min: 16, max: 72 } ),
                        el( RangeControl, { label: __( 'Value Font Weight', 'blockenberg' ), value: a.valueFontWeight || 700, min: 100, max: 900, step: 100, onChange: v => setAttributes( { valueFontWeight: v } ) } ),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 22 } ),
                        el( RangeControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight || 600, min: 100, max: 900, step: 100, onChange: v => setAttributes( { labelFontWeight: v } ) } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background',       'blockenberg' ), value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Track Background', 'blockenberg' ), value: a.trackBgColor, onChange: v => setAttributes( { trackBgColor: v || '#f3f4f6' } ) },
                            { label: __( 'Title Color',      'blockenberg' ), value: a.titleColor,   onChange: v => setAttributes( { titleColor:   v || '#111827' } ) },
                            { label: __( 'Text Color',       'blockenberg' ), value: a.textColor,    onChange: v => setAttributes( { textColor:    v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Series', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New Metric', value: 50, color: '#6366f1' } ] } ) }, __( '+ Add Ring', 'blockenberg' ) ),
                        a.series.map( ( ser, si ) =>
                            el( PanelBody, { key: si, title: ser.label || `Ring ${ si + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ),       value: ser.label, onChange: v => updSer( setAttributes, a.series, si, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: ser.color, onChange: v => updSer( setAttributes, a.series, si, 'color', v ) } ),
                                el( RangeControl, { label: __( 'Value', 'blockenberg' ),        value: ser.value, onChange: v => updSer( setAttributes, a.series, si, 'value', v ), min: 0, max: a.maxValue || 100 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-radialbar-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-radialbar-svg' }, renderRadialBar( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            var _tvFn = window.bkbgTypoCssVars;
            var saveStyle = {};
            if (_tvFn) Object.assign(saveStyle, _tvFn(a.titleTypo || {}, '--bkrb-tt-'));
            var blockProps = useBlockProps.save( { className: 'bkbg-radialbar-wrap', style: saveStyle } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-radialbar-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-radialbar-svg' }, renderRadialBar( a ) ),
            );
        },

        deprecated: [{
            attributes: {
                "title":{"type":"string","default":"Q4 Performance Metrics"},
                "showTitle":{"type":"boolean","default":true},
                "svgSize":{"type":"integer","default":460},
                "trackWidth":{"type":"integer","default":22},
                "trackGap":{"type":"integer","default":10},
                "startAngle":{"type":"integer","default":-90},
                "maxValue":{"type":"integer","default":100},
                "showValues":{"type":"boolean","default":true},
                "showLabels":{"type":"boolean","default":true},
                "showLegend":{"type":"boolean","default":true},
                "roundedCaps":{"type":"boolean","default":true},
                "labelFontSize":{"type":"integer","default":12},
                "valueFontSize":{"type":"integer","default":11},
                "bgColor":{"type":"string","default":"#ffffff"},
                "trackBgColor":{"type":"string","default":"#f3f4f6"},
                "titleColor":{"type":"string","default":"#111827"},
                "textColor":{"type":"string","default":"#374151"},
                "series":{"type":"array","default":[{"label":"Revenue","value":87,"color":"#6366f1"},{"label":"Users","value":73,"color":"#10b981"},{"label":"Conversion","value":61,"color":"#f59e0b"},{"label":"Retention","value":94,"color":"#ef4444"},{"label":"NPS Score","value":56,"color":"#8b5cf6"}]},
                "labelFontWeight":{"type":"number","default":600},
                "valueFontWeight":{"type":"number","default":700},
                "labelLineHeight":{"type":"number","default":1.4}
            },
            save: function ( { attributes: a } ) {
                var blockProps = useBlockProps.save( { className: 'bkbg-radialbar-wrap' } );
                return el( 'div', blockProps,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-radialbar-title', style: { color: a.titleColor } }, a.title ) : null,
                    el( 'div', { className: 'bkbg-radialbar-svg' }, renderRadialBar( a ) ),
                );
            }
        }],
    } );
}() );
