( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function degToRad( d ) { return d * Math.PI / 180; }

    // Arc path for thick stroke — returns SVG 'd' for a stroked path
    function arcD( cx, cy, r, startDeg, endDeg ) {
        const s = degToRad( startDeg );
        const e = degToRad( endDeg );
        const x1 = cx + r * Math.cos( s );
        const y1 = cy + r * Math.sin( s );
        const x2 = cx + r * Math.cos( e );
        const y2 = cy + r * Math.sin( e );
        const large = ( endDeg - startDeg ) > 180 ? 1 : 0;
        return `M ${ x1 } ${ y1 } A ${ r } ${ r } 0 ${ large } 1 ${ x2 } ${ y2 }`;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderSpeedometer( a ) {
        const zones  = a.zones || [];
        const W      = a.svgWidth;
        const H      = a.svgHeight;
        const cx     = W / 2;
        const cy     = H * 0.62;
        const r      = Math.min( W, H ) * 0.36;
        const AT     = a.arcThickness;
        const range  = ( a.maxValue - a.minValue ) || 1;

        // Gauge spans 180° — from 180° to 0° (left → right in SVG coords)
        const START_DEG = 180;
        const END_DEG   = 0;

        function valToDeg( v ) {
            const pct = Math.min( 1, Math.max( 0, ( v - a.minValue ) / range ) );
            return START_DEG + pct * 180; // 180 → 360 (=0)
        }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Track background
        svgEls.push( el( 'path', { key: 'track', d: arcD( cx, cy, r, 180, 360 ), fill: 'none', stroke: '#e5e7eb', strokeWidth: AT, strokeLinecap: 'butt' } ) );

        // Zone arcs
        zones.forEach( ( z, zi ) => {
            const fromDeg = valToDeg( z.from );
            const toDeg   = valToDeg( z.to );
            if ( toDeg <= fromDeg ) return;
            svgEls.push( el( 'path', { key: `zone${ zi }`, d: arcD( cx, cy, r, fromDeg, toDeg ), fill: 'none', stroke: z.color || '#6366f1', strokeWidth: AT, strokeLinecap: 'butt' } ) );
        } );

        // Zone labels (optional, outside arc)
        if ( a.showZoneLabels ) {
            zones.forEach( ( z, zi ) => {
                const midDeg = valToDeg( ( z.from + z.to ) / 2 );
                const rad    = degToRad( midDeg );
                const lx     = cx + ( r + AT + 14 ) * Math.cos( rad );
                const ly     = cy + ( r + AT + 14 ) * Math.sin( rad );
                svgEls.push( el( 'text', { key: `zlbl${ zi }`, x: lx, y: ly, textAnchor: 'middle', dominantBaseline: 'middle', fill: z.color, fontSize: a.labelFontSize - 2, fontFamily: 'inherit' }, z.label ) );
            } );
        }

        // Tick marks
        if ( a.showTicks ) {
            const tickCount = 10;
            for ( let t = 0; t <= tickCount; t++ ) {
                const td  = START_DEG + ( t / tickCount ) * 180;
                const rad = degToRad( td );
                const major = ( t % 2 === 0 );
                const r1  = r - AT / 2 - 2;
                const r2  = r1 - ( major ? 10 : 6 );
                svgEls.push( el( 'line', {
                    key: `tick${ t }`,
                    x1: cx + r1 * Math.cos( rad ), y1: cy + r1 * Math.sin( rad ),
                    x2: cx + r2 * Math.cos( rad ), y2: cy + r2 * Math.sin( rad ),
                    stroke: a.textColor, strokeWidth: major ? 2 : 1,
                } ) );
                if ( major ) {
                    const tv  = a.minValue + ( t / tickCount ) * range;
                    const r3  = r2 - 12;
                    svgEls.push( el( 'text', {
                        key: `ticklbl${ t }`,
                        x: cx + r3 * Math.cos( rad ), y: cy + r3 * Math.sin( rad ),
                        textAnchor: 'middle', dominantBaseline: 'middle',
                        fill: a.textColor, fontSize: a.labelFontSize - 2, fontFamily: 'inherit',
                    }, Math.round( tv ) ) );
                }
            }
        }

        // Needle
        const needleDeg = valToDeg( a.value );
        const needleRad = degToRad( needleDeg );
        const NL  = a.needleLength;
        const NW  = a.needleWidth;
        const tip = { x: cx + NL * Math.cos( needleRad ), y: cy + NL * Math.sin( needleRad ) };
        const lft = { x: cx + ( NW / 2 ) * Math.cos( needleRad + Math.PI / 2 ), y: cy + ( NW / 2 ) * Math.sin( needleRad + Math.PI / 2 ) };
        const rgt = { x: cx + ( NW / 2 ) * Math.cos( needleRad - Math.PI / 2 ), y: cy + ( NW / 2 ) * Math.sin( needleRad - Math.PI / 2 ) };
        svgEls.push( el( 'polygon', {
            key: 'needle',
            points: `${ tip.x },${ tip.y } ${ lft.x },${ lft.y } ${ rgt.x },${ rgt.y }`,
            fill: a.needleColor || '#111827',
        } ) );

        // Centre hub
        svgEls.push( el( 'circle', { key: 'hub', cx, cy, r: NW * 1.6, fill: a.needleColor || '#111827' } ) );
        svgEls.push( el( 'circle', { key: 'hubInner', cx, cy, r: NW * 0.8, fill: a.centerColor || '#ffffff' } ) );

        // Value text
        if ( a.showValue ) {
            svgEls.push( el( 'text', { key: 'valText', x: cx, y: cy + 36, textAnchor: 'middle', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.valueFontSize, fontWeight: a.valueFontWeight, fontFamily: 'inherit' }, `${ a.value }${ a.unit }` ) );
        }

        // Min / Max labels
        if ( a.showLabel ) {
            const minRad = degToRad( 180 );
            const maxRad = degToRad( 360 );
            const lOff   = AT + 10;
            svgEls.push( el( 'text', { key: 'minLbl', x: cx + ( r - lOff ) * Math.cos( minRad ), y: cy + ( r - lOff ) * Math.sin( minRad ) - 4, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, a.minValue ) );
            svgEls.push( el( 'text', { key: 'maxLbl', x: cx + ( r - lOff ) * Math.cos( maxRad ), y: cy + ( r - lOff ) * Math.sin( maxRad ) - 4, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, a.maxValue ) );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updZone( setAttributes, zones, zi, field, val ) {
        setAttributes( { zones: zones.map( ( z, i ) => i === zi ? { ...z, [field]: val } : z ) } );
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

    registerBlockType( 'blockenberg/speedometer', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps((function () {
                var s = { className: 'bkbg-speedometer-wrap' };
                var tv = getTypoCssVars();
                if (tv) { s.style = Object.assign({}, tv(a.titleTypo, '--bkspm-tt-')); }
                return s;
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),        checked: a.showTitle,      onChange: v => setAttributes( { showTitle:      v } ) } ),
                        el( ToggleControl, { label: __( 'Show Value', 'blockenberg' ),        checked: a.showValue,      onChange: v => setAttributes( { showValue:      v } ) } ),
                        el( ToggleControl, { label: __( 'Show Min/Max Labels', 'blockenberg' ), checked: a.showLabel,    onChange: v => setAttributes( { showLabel:      v } ) } ),
                        el( ToggleControl, { label: __( 'Show Ticks', 'blockenberg' ),        checked: a.showTicks,      onChange: v => setAttributes( { showTicks:      v } ) } ),
                        el( ToggleControl, { label: __( 'Show Zone Labels', 'blockenberg' ),  checked: a.showZoneLabels, onChange: v => setAttributes( { showZoneLabels: v } ) } ),
                        el( RangeControl, { label: __( 'Value', 'blockenberg' ),    value: a.value,    onChange: v => setAttributes( { value:    v } ), min: a.minValue, max: a.maxValue, step: 0.1 } ),
                        el( RangeControl, { label: __( 'Min Value', 'blockenberg' ), value: a.minValue, onChange: v => setAttributes( { minValue: v } ), min: -10000, max: 0 } ),
                        el( RangeControl, { label: __( 'Max Value', 'blockenberg' ), value: a.maxValue, onChange: v => setAttributes( { maxValue: v } ), min: 1, max: 10000 } ),
                        el( TextControl,  { label: __( 'Unit suffix', 'blockenberg' ), value: a.unit, onChange: v => setAttributes( { unit: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),   value: a.svgWidth,     onChange: v => setAttributes( { svgWidth:     v } ), min: 200, max: 900, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ),  value: a.svgHeight,    onChange: v => setAttributes( { svgHeight:    v } ), min: 140, max: 600 } ),
                        el( RangeControl, { label: __( 'Arc Thickness', 'blockenberg' ),  value: a.arcThickness, onChange: v => setAttributes( { arcThickness: v } ), min: 8, max: 60 } ),
                        el( RangeControl, { label: __( 'Needle Length', 'blockenberg' ),  value: a.needleLength, onChange: v => setAttributes( { needleLength: v } ), min: 40, max: 220 } ),
                        el( RangeControl, { label: __( 'Needle Width', 'blockenberg' ),   value: a.needleWidth,  onChange: v => setAttributes( { needleWidth:  v } ), min: 2, max: 18 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }) : null,
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 22 } ),
                        el( RangeControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight, onChange: v => setAttributes( { labelFontWeight: v } ), min: 300, max: 900, step: 100 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),  value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize:  v } ), min: 14, max: 72 } ),
                        el( RangeControl, { label: __( 'Value Font Weight', 'blockenberg' ), value: a.valueFontWeight, onChange: v => setAttributes( { valueFontWeight: v } ), min: 300, max: 900, step: 100, __nextHasNoMarginBottom: true } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Needle',     'blockenberg' ), value: a.needleColor, onChange: v => setAttributes( { needleColor: v || '#111827' } ) },
                            { label: __( 'Hub centre', 'blockenberg' ), value: a.centerColor, onChange: v => setAttributes( { centerColor: v || '#ffffff' } ) },
                            { label: __( 'Background', 'blockenberg' ), value: a.bgColor,     onChange: v => setAttributes( { bgColor:     v || '#ffffff' } ) },
                            { label: __( 'Title',      'blockenberg' ), value: a.titleColor,  onChange: v => setAttributes( { titleColor:  v || '#111827' } ) },
                            { label: __( 'Text',       'blockenberg' ), value: a.textColor,   onChange: v => setAttributes( { textColor:   v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Zones', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { zones: [ ...a.zones, { label: 'Zone', from: 0, to: 100, color: '#8b5cf6' } ] } ) }, __( '+ Add Zone', 'blockenberg' ) ),
                        a.zones.map( ( z, zi ) =>
                            el( PanelBody, { key: zi, title: z.label || `Zone ${ zi + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),  value: z.label, onChange: v => updZone( setAttributes, a.zones, zi, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: z.color, onChange: v => updZone( setAttributes, a.zones, zi, 'color', v ) } ),
                                el( RangeControl, { label: __( 'From', 'blockenberg' ), value: z.from, onChange: v => updZone( setAttributes, a.zones, zi, 'from', v ), min: a.minValue, max: a.maxValue } ),
                                el( RangeControl, { label: __( 'To', 'blockenberg' ),   value: z.to,   onChange: v => updZone( setAttributes, a.zones, zi, 'to',   v ), min: a.minValue, max: a.maxValue } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { zones: a.zones.filter( ( _, x ) => x !== zi ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-speedometer-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-speedometer-svg' }, renderSpeedometer( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-speedometer-wrap' } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-speedometer-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-speedometer-svg' }, renderSpeedometer( a ) ),
            );
        },
    } );
}() );
