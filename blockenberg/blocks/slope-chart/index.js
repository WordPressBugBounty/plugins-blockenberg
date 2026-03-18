( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc; function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildTypoVars( a ) {
        var fn = getTV();
        if ( !fn ) return {};
        var v = {};
        Object.assign( v, fn( a.titleTypo || {}, '--bksc-tt-' ) );
        return v;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderSlopeChart( a ) {
        const items = a.items || [];
        const W   = a.svgWidth;
        const H   = a.svgHeight;
        const PT  = a.padTop;
        const PL  = a.padLeft;
        const PR  = a.padRight;
        const PB  = a.padBottom;
        const DR  = a.dotRadius;

        const allVals = items.flatMap( it => [ it.a || 0, it.b || 0 ] );
        const minVal  = Math.min( ...allVals ) * 0.95;
        const maxVal  = Math.max( ...allVals ) * 1.05 || 1;
        const range   = maxVal - minVal || 1;
        const chartH  = H - PT - PB;

        const xA  = PL;
        const xB  = W - PR;

        function yAt( v ) { return H - PB - ( ( v - minVal ) / range ) * chartH; }
        function lineColor( diff ) {
            if ( diff > 0.001 ) return a.posColor || '#10b981';
            if ( diff < -0.001 ) return a.negColor || '#ef4444';
            return a.neuColor || '#9ca3af';
        }
        function fmt( v ) { return String( parseFloat( v.toFixed( 1 ) ) ); }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Column header lines and labels
        [ [ xA, a.labelA || '2020' ], [ xB, a.labelB || '2024' ] ].forEach( ( [ x, lbl ], ci ) => {
            svgEls.push( el( 'line', { key: `col${ ci }`, x1: x, y1: PT - 6, x2: x, y2: H - PB, stroke: '#d1d5db', strokeWidth: 1 } ) );
            svgEls.push( el( 'text', { key: `clt${ ci }`, x, y: PT - 14, textAnchor: 'middle', fill: a.textColor || '#374151', fontSize: a.labelFontSize, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, lbl ) );
        } );

        // Lines and dots
        items.forEach( ( item, i ) => {
            const va   = item.a || 0;
            const vb   = item.b || 0;
            const diff = vb - va;
            const clr  = lineColor( diff );
            const ya   = yAt( va );
            const yb   = yAt( vb );

            svgEls.push( el( 'line', { key: `ln${ i }`, x1: xA, y1: ya, x2: xB, y2: yb, stroke: clr, strokeWidth: a.lineThickness, strokeLinecap: 'round', opacity: 0.85 } ) );
            svgEls.push( el( 'circle', { key: `dA${ i }`, cx: xA, cy: ya, r: DR, fill: clr } ) );
            svgEls.push( el( 'circle', { key: `dB${ i }`, cx: xB, cy: yb, r: DR, fill: clr } ) );

            // Left labels & values
            svgEls.push( el( 'text', { key: `lblA${ i }`, x: xA - DR - 6, y: ya, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, item.label || '' ) );
            if ( a.showValues ) {
                svgEls.push( el( 'text', { key: `valA${ i }`, x: xA + DR + 5, y: ya, dominantBaseline: 'middle', fill: clr, fontSize: a.valueFontSize, fontWeight: a.valueFontWeight, fontFamily: 'inherit' }, fmt( va ) ) );
            }

            // Right values & labels
            if ( a.showValues ) {
                svgEls.push( el( 'text', { key: `valB${ i }`, x: xB - DR - 5, y: yb, textAnchor: 'end', dominantBaseline: 'middle', fill: clr, fontSize: a.valueFontSize, fontWeight: a.valueFontWeight, fontFamily: 'inherit' }, fmt( vb ) ) );
            }
            svgEls.push( el( 'text', { key: `lblB${ i }`, x: xB + DR + 6, y: yb, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' },
                a.showDiff ? `${ diff > 0 ? '+' : '' }${ fmt( diff ) }` : item.label || ''
            ) );
        } );

        // Legend
        [ ['▲ Increase', a.posColor], ['▼ Decrease', a.negColor], ['— No change', a.neuColor] ].forEach( ( [ lbl, clr ], li ) => {
            svgEls.push( el( 'text', { key: `leg${ li }`, x: xA + li * 120, y: PT - 34, fill: clr, fontSize: 11, fontFamily: 'inherit' }, lbl ) );
        } );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updItem( setAttributes, items, idx, field, val ) {
        setAttributes( { items: items.map( ( it, i ) => i === idx ? { ...it, [field]: val } : it ) } );
    }

    registerBlockType( 'blockenberg/slope-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-slope-wrap', style: buildTypoVars( a ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ), checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Right label = difference (Δ)', 'blockenberg' ), checked: a.showDiff, onChange: v => setAttributes( { showDiff: v } ) } ),
                        el( TextControl,  { label: __( 'Left Column Label', 'blockenberg' ),  value: a.labelA, onChange: v => setAttributes( { labelA: v } ) } ),
                        el( TextControl,  { label: __( 'Right Column Label', 'blockenberg' ), value: a.labelB, onChange: v => setAttributes( { labelB: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),      min: 280, max: 900, step: 10 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ),   value: a.svgHeight,     onChange: v => setAttributes( { svgHeight: v } ),     min: 150, max: 700 } ),
                        el( RangeControl, { label: __( 'Left/Right padding', 'blockenberg' ), value: a.padLeft,    onChange: v => setAttributes( { padLeft: v, padRight: v } ), min: 60, max: 280 } ),
                        el( RangeControl, { label: __( 'Line Thickness', 'blockenberg' ),  value: a.lineThickness, onChange: v => setAttributes( { lineThickness: v } ),  min: 1, max: 10 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),      value: a.dotRadius,     onChange: v => setAttributes( { dotRadius: v } ),      min: 2, max: 18 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTC(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function( v ) { setAttributes( { titleTypo: v } ); } } ),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ),  min: 9, max: 22 } ),
                        el( RangeControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight, onChange: v => setAttributes( { labelFontWeight: v } ), min: 300, max: 900, step: 100 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ),  min: 7, max: 16 } ),
                        el( RangeControl, { label: __( 'Value Font Weight', 'blockenberg' ), value: a.valueFontWeight, onChange: v => setAttributes( { valueFontWeight: v } ), min: 300, max: 900, step: 100, __nextHasNoMarginBottom: true } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Increase Color', 'blockenberg' ), value: a.posColor,   onChange: v => setAttributes( { posColor:   v || '#10b981' } ) },
                            { label: __( 'Decrease Color', 'blockenberg' ), value: a.negColor,   onChange: v => setAttributes( { negColor:   v || '#ef4444' } ) },
                            { label: __( 'Neutral Color',  'blockenberg' ), value: a.neuColor,   onChange: v => setAttributes( { neuColor:   v || '#9ca3af' } ) },
                            { label: __( 'Background',     'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Title Color',    'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color',     'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Items', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { items: [ ...a.items, { label: 'New Item', a: 10, b: 20 } ] } ) }, __( '+ Add Item', 'blockenberg' ) ),
                        a.items.map( ( item, i ) =>
                            el( PanelBody, { key: i, title: item.label || `Item ${ i + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),             value: item.label, onChange: v => updItem( setAttributes, a.items, i, 'label', v ) } ),
                                el( RangeControl, { label: `${ a.labelA || 'Before' } value`, value: item.a, onChange: v => updItem( setAttributes, a.items, i, 'a', v ), min: -10000, max: 100000, step: 0.1 } ),
                                el( RangeControl, { label: `${ a.labelB || 'After' } value`,  value: item.b, onChange: v => updItem( setAttributes, a.items, i, 'b', v ), min: -10000, max: 100000, step: 0.1 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-slope-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-slope-svg' }, renderSlopeChart( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-slope-wrap', style: buildTypoVars( a ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-slope-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-slope-svg' }, renderSlopeChart( a ) ),
            );
        },

        deprecated: [ {
            save: function ( { attributes: a } ) {
                var bp = useBlockProps.save( { className: 'bkbg-slope-wrap' } );
                return el( 'div', bp,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-slope-title', style: { color: a.titleColor } }, a.title ) : null,
                    el( 'div', { className: 'bkbg-slope-svg' }, renderSlopeChart( a ) ),
                );
            },
        } ],
    } );
}() );
