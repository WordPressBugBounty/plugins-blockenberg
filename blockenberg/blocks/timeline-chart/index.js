( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderTimeline( a ) {
        const events  = a.events || [];
        const W       = a.svgWidth;
        const PT      = a.padTop;
        const PL      = a.padLeft;
        const PR      = a.padRight;
        const PB      = a.padBottom;
        const RH      = a.rowHeight;
        const BH      = a.barHeight;
        const tStart  = a.timeStart;
        const tEnd    = a.timeEnd;
        const tRange  = ( tEnd - tStart ) || 1;
        const chartW  = W - PL - PR;
        const H       = PT + events.length * RH + PB;

        function tx( v ) { return PL + ( ( v - tStart ) / tRange ) * chartW; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Vertical grid lines + time axis labels
        const tickCount = Math.min( tRange, 12 );
        for ( let t = 0; t <= tickCount; t++ ) {
            const tv = tStart + ( t / tickCount ) * tRange;
            const gx = tx( tv );
            if ( a.showGrid ) {
                svgEls.push( el( 'line', { key: `vg${ t }`, x1: gx, y1: PT, x2: gx, y2: H - PB, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
            }
            svgEls.push( el( 'line', { key: `tick${ t }`, x1: gx, y1: PT - 6, x2: gx, y2: PT, stroke: a.axisColor || '#e5e7eb', strokeWidth: 1 } ) );
            svgEls.push( el( 'text', { key: `tlbl${ t }`, x: gx, y: PT - 10, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 2, fontFamily: 'inherit' }, Math.round( tv ) ) );
        }

        // Axis title (time unit)
        svgEls.push( el( 'text', { key: 'tunit', x: PL + chartW / 2, y: PT - 28, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: 600 }, a.timeUnit ) );

        // Axis baseline
        svgEls.push( el( 'line', { key: 'xax', x1: PL, y1: PT, x2: W - PR, y2: PT, stroke: a.axisColor || '#e5e7eb', strokeWidth: 1.5 } ) );

        // Event bars
        events.forEach( ( ev, ei ) => {
            const cy   = PT + ei * RH + RH / 2;
            const x1   = tx( Math.max( tStart, ev.start || 0 ) );
            const x2   = tx( Math.min( tEnd,   ev.end   || tEnd ) );
            const bw   = Math.max( 2, x2 - x1 );
            const by   = cy - BH / 2;
            const clr  = ev.color || '#6366f1';

            // Row stripe
            if ( ei % 2 === 1 ) {
                svgEls.push( el( 'rect', { key: `stripe${ ei }`, x: PL, y: PT + ei * RH, width: chartW, height: RH, fill: a.gridColor || '#f3f4f6', fillOpacity: 0.5 } ) );
            }

            // Row label
            svgEls.push( el( 'text', { key: `rlbl${ ei }`, x: PL - 8, y: cy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: 500 }, ev.label ) );

            // Bar
            svgEls.push( el( 'rect', { key: `bar${ ei }`, x: x1, y: by, width: bw, height: BH, fill: clr, rx: 4, fillOpacity: 0.9 } ) );

            // Bar label (inside bar if wide enough)
            if ( a.showValues ) {
                const durationLabel = `${ parseFloat( ( ev.end - ev.start ).toFixed(1) ) } ${ a.timeUnit }`;
                if ( bw > 50 ) {
                    svgEls.push( el( 'text', { key: `bval${ ei }`, x: x1 + bw / 2, y: cy, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffff', fontSize: a.barFontSize, fontFamily: 'inherit', fontWeight: 600 }, durationLabel ) );
                } else {
                    svgEls.push( el( 'text', { key: `bval${ ei }`, x: x2 + 4, y: cy, dominantBaseline: 'middle', fill: clr, fontSize: a.barFontSize, fontFamily: 'inherit', fontWeight: 600 }, durationLabel ) );
                }
            }
        } );

        // Horizontal row separators
        for ( let i = 0; i <= events.length; i++ ) {
            svgEls.push( el( 'line', { key: `hsep${ i }`, x1: 0, y1: PT + i * RH, x2: W, y2: PT + i * RH, stroke: a.axisColor || '#e5e7eb', strokeWidth: 0.5, strokeOpacity: 0.6 } ) );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updEv( setAttributes, events, ei, field, val ) {
        setAttributes( { events: events.map( ( e, i ) => i === ei ? { ...e, [field]: val } : e ) } );
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

    registerBlockType( 'blockenberg/timeline-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktlc-tt-'));
                return { className: 'bkbg-timeline-wrap', style: tv };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),    checked: a.showTitle,    onChange: v => setAttributes( { showTitle:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGrid,   onChange: v => setAttributes( { showGrid:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Duration Labels', 'blockenberg' ), checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( TextControl,  { label: __( 'Time Unit Label', 'blockenberg' ), value: a.timeUnit, onChange: v => setAttributes( { timeUnit: v } ) } ),
                        el( RangeControl, { label: __( 'Time Start', 'blockenberg' ), value: a.timeStart, onChange: v => setAttributes( { timeStart: v } ), min: -100, max: 10000 } ),
                        el( RangeControl, { label: __( 'Time End', 'blockenberg' ),   value: a.timeEnd,   onChange: v => setAttributes( { timeEnd:   v } ), min: -100, max: 10000 } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),   value: a.svgWidth,      onChange: v => setAttributes( { svgWidth:      v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Row Height', 'blockenberg' ),     value: a.rowHeight,     onChange: v => setAttributes( { rowHeight:     v } ), min: 24, max: 80 } ),
                        el( RangeControl, { label: __( 'Bar Height', 'blockenberg' ),     value: a.barHeight,     onChange: v => setAttributes( { barHeight:     v } ), min: 10, max: 50 } ),
                        el( RangeControl, { label: __( 'Label Column Width', 'blockenberg' ), value: a.padLeft,   onChange: v => setAttributes( { padLeft:       v } ), min: 60, max: 260 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: v => setAttributes( { titleTypo: v } )
                        }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } ),
                        el( RangeControl, { label: __( 'Bar Font Size', 'blockenberg' ),   value: a.barFontSize,   onChange: v => setAttributes( { barFontSize:   v } ), min: 7, max: 16 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid',       'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Axis lines', 'blockenberg' ), value: a.axisColor,  onChange: v => setAttributes( { axisColor:  v || '#e5e7eb' } ) },
                            { label: __( 'Title',      'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text',       'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Events', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { events: [ ...a.events, { label: 'New Event', color: '#8b5cf6', start: a.timeStart, end: a.timeEnd } ] } ) }, __( '+ Add Event', 'blockenberg' ) ),
                        a.events.map( ( ev, ei ) =>
                            el( PanelBody, { key: ei, title: ev.label || `Event ${ ei + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ),      value: ev.label, onChange: v => updEv( setAttributes, a.events, ei, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: ev.color, onChange: v => updEv( setAttributes, a.events, ei, 'color', v ) } ),
                                el( TextControl,  { label: __( 'Start', 'blockenberg' ), value: String( ev.start ), type: 'number', onChange: v => updEv( setAttributes, a.events, ei, 'start', parseFloat( v ) || 0 ) } ),
                                el( TextControl,  { label: __( 'End', 'blockenberg' ),   value: String( ev.end ),   type: 'number', onChange: v => updEv( setAttributes, a.events, ei, 'end',   parseFloat( v ) || 0 ) } ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 6 }, onClick: () => setAttributes( { events: a.events.filter( ( _, x ) => x !== ei ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-timeline-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-timeline-svg' }, renderTimeline( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( (function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktlc-tt-'));
                return { className: 'bkbg-timeline-wrap', style: tv };
            })() );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-timeline-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-timeline-svg' }, renderTimeline( a ) ),
            );
        },
    } );
}() );
