( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, SelectControl } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderPyramid( a ) {
        const items = a.items || [];
        const W    = a.svgWidth;
        const PT   = a.padTop;
        const PL   = a.padLeft    || 20;
        const PR   = a.padRight   || 20;
        const PC   = a.padCenter  || 60;   // width reserved for centre labels
        const BH   = a.barHeight;
        const BG   = a.barGap;

        const rowH = BH + BG;
        const H    = PT + items.length * rowH + 30;
        const totalVal = items.reduce( ( s, it ) => s + ( it.a || 0 ) + ( it.b || 0 ), 0 ) || 1;

        const maxVal = Math.max( ...items.flatMap( it => [ it.a || 0, it.b || 0 ] ), 1 );
        const halfW  = ( W - PL - PR - PC ) / 2;
        const cx     = PL + halfW + PC / 2;

        function scaleBar( v ) { return ( v / maxVal ) * halfW; }
        function fmt( v, pct ) {
            if ( pct ) return ( ( v / totalVal ) * 100 ).toFixed( 1 ) + '%';
            return String( parseFloat( v.toFixed( 1 ) ) );
        }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines (symmetric ticks on both halves)
        if ( a.showGridLines ) {
            const ticks = 4;
            for ( let i = 1; i <= ticks; i++ ) {
                const offset = scaleBar( maxVal * i / ticks );
                [ cx + offset, cx - offset ].forEach( ( gx, li ) => {
                    svgEls.push( el( 'line', { key: `gl${ i }${ li }`, x1: gx, y1: PT - 4, x2: gx, y2: H - 20, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                } );
                const tv = parseFloat( ( maxVal * i / ticks ).toFixed( 1 ) );
                svgEls.push( el( 'text', { key: `gtr${ i }`, x: cx + offset, y: PT - 10, textAnchor: 'middle', fill: '#9ca3af', fontSize: 9, fontFamily: 'inherit' }, String( tv ) ) );
                svgEls.push( el( 'text', { key: `gtl${ i }`, x: cx - offset, y: PT - 10, textAnchor: 'middle', fill: '#9ca3af', fontSize: 9, fontFamily: 'inherit' }, String( tv ) ) );
            }
        }

        // Centre axis line
        svgEls.push( el( 'line', { key: 'axL', x1: cx, y1: PT - 4, x2: cx, y2: H - 20, stroke: '#9ca3af', strokeWidth: 1 } ) );

        // Legend labels at top
        svgEls.push( el( 'text', { key: 'legA', x: PL + halfW / 2, y: PT - 20, textAnchor: 'middle', fill: a.colorA || '#3b82f6', fontSize: a.labelFontSize, fontWeight: 700, fontFamily: 'inherit' }, a.labelA || 'Left' ) );
        svgEls.push( el( 'text', { key: 'legB', x: cx + PC / 2 + halfW / 2, y: PT - 20, textAnchor: 'middle', fill: a.colorB || '#ec4899', fontSize: a.labelFontSize, fontWeight: 700, fontFamily: 'inherit' }, a.labelB || 'Right' ) );

        // Rows
        items.forEach( ( item, i ) => {
            const by = PT + i * rowH;
            const wA = scaleBar( item.a || 0 );
            const wB = scaleBar( item.b || 0 );

            // Left bar (A) — extends leftward from centre
            svgEls.push( el( 'rect', { key: `bA${ i }`, x: cx - PC / 2 - wA, y: by, width: wA, height: BH, fill: a.colorA || '#3b82f6', rx: 3 } ) );
            // Right bar (B) — extends rightward from centre
            svgEls.push( el( 'rect', { key: `bB${ i }`, x: cx + PC / 2,       y: by, width: wB, height: BH, fill: a.colorB || '#ec4899', rx: 3 } ) );

            // Centre label
            svgEls.push( el( 'text', { key: `cl${ i }`, x: cx, y: by + BH / 2, textAnchor: 'middle', dominantBaseline: 'middle', fill: a.labelColor || '#374151', fontSize: a.labelFontSize, fontFamily: 'inherit' }, item.label || '' ) );

            // Value labels
            if ( a.showValues ) {
                const dispA = fmt( item.a || 0, a.showPercentage );
                const dispB = fmt( item.b || 0, a.showPercentage );
                svgEls.push( el( 'text', { key: `vA${ i }`, x: cx - PC / 2 - wA - 3, y: by + BH / 2, textAnchor: 'end', dominantBaseline: 'middle', fill: a.colorA, fontSize: a.valueFontSize, fontFamily: 'inherit' }, dispA ) );
                svgEls.push( el( 'text', { key: `vB${ i }`, x: cx + PC / 2 + wB + 3, y: by + BH / 2, dominantBaseline: 'middle', fill: a.colorB, fontSize: a.valueFontSize, fontFamily: 'inherit' }, dispB ) );
            }
        } );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updItem( setAttributes, items, idx, field, val ) {
        setAttributes( { items: items.map( ( it, i ) => i === idx ? { ...it, [field]: val } : it ) } );
    }

    registerBlockType( 'blockenberg/population-pyramid', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(a.titleTypo, '--bkbg-pyr-tt-'));
                return { className: 'bkbg-pyramid-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),       checked: a.showTitle,      onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),      checked: a.showValues,     onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show as Percentage', 'blockenberg' ), checked: a.showPercentage, onChange: v => setAttributes( { showPercentage: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ),  checked: a.showGridLines,  onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( TextControl,  { label: __( 'Left Group Label (A)', 'blockenberg' ),  value: a.labelA, onChange: v => setAttributes( { labelA: v } ) } ),
                        el( TextControl,  { label: __( 'Right Group Label (B)', 'blockenberg' ), value: a.labelB, onChange: v => setAttributes( { labelB: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),     value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),     min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Bar Height', 'blockenberg' ),       value: a.barHeight,     onChange: v => setAttributes( { barHeight: v } ),    min: 10, max: 58 } ),
                        el( RangeControl, { label: __( 'Bar Gap', 'blockenberg' ),          value: a.barGap,        onChange: v => setAttributes( { barGap: v } ),       min: 0, max: 24 } ),
                        el( RangeControl, { label: __( 'Centre Label Width', 'blockenberg' ), value: a.padCenter,  onChange: v => setAttributes( { padCenter: v } ),    min: 30, max: 180 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading…');
                            return el(wp.element.Fragment, null,
                                el(TC, { label: 'Title Typography', value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } })
                            );
                        })(),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 22 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 7, max: 16 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Left Bar (A)', 'blockenberg' ),  value: a.colorA,    onChange: v => setAttributes( { colorA:    v || '#3b82f6' } ) },
                            { label: __( 'Right Bar (B)', 'blockenberg' ), value: a.colorB,    onChange: v => setAttributes( { colorB:    v || '#ec4899' } ) },
                            { label: __( 'Background',    'blockenberg' ), value: a.bgColor,   onChange: v => setAttributes( { bgColor:   v || '#ffffff' } ) },
                            { label: __( 'Grid Lines',    'blockenberg' ), value: a.gridColor, onChange: v => setAttributes( { gridColor: v || '#f3f4f6' } ) },
                            { label: __( 'Title Color',   'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Label Color',   'blockenberg' ), value: a.labelColor, onChange: v => setAttributes( { labelColor: v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Data Rows', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { items: [ ...a.items, { label: 'New Row', a: 5, b: 5 } ] } ) }, __( '+ Add Row', 'blockenberg' ) ),
                        a.items.map( ( item, i ) =>
                            el( PanelBody, { key: i, title: item.label || `Row ${ i + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Age / Category', 'blockenberg' ), value: item.label, onChange: v => updItem( setAttributes, a.items, i, 'label', v ) } ),
                                el( RangeControl, { label: `${ a.labelA || 'A' } value`, value: item.a, onChange: v => updItem( setAttributes, a.items, i, 'a', v ), min: 0, max: 10000, step: 0.1 } ),
                                el( RangeControl, { label: `${ a.labelB || 'B' } value`, value: item.b, onChange: v => updItem( setAttributes, a.items, i, 'b', v ), min: 0, max: 10000, step: 0.1 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-pyramid-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-pyramid-svg' }, renderPyramid( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            var _tv = (typeof window !== 'undefined' && window.bkbgTypoCssVars) || function(){return {};};
            var s = {};
            Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-pyr-tt-'));
            const blockProps = useBlockProps.save( { className: 'bkbg-pyramid-wrap', style: s } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-pyramid-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-pyramid-svg' }, renderPyramid( a ) ),
            );
        },

        deprecated: [{
            attributes: {"title":{"type":"string","default":"Age Distribution: Male vs Female"},"showTitle":{"type":"boolean","default":true},"labelA":{"type":"string","default":"Male"},"labelB":{"type":"string","default":"Female"},"svgWidth":{"type":"integer","default":700},"padTop":{"type":"integer","default":36},"padLeft":{"type":"integer","default":20},"padRight":{"type":"integer","default":20},"padCenter":{"type":"integer","default":60},"barHeight":{"type":"integer","default":26},"barGap":{"type":"integer","default":4},"showValues":{"type":"boolean","default":true},"showPercentage":{"type":"boolean","default":false},"showGridLines":{"type":"boolean","default":true},"labelFontSize":{"type":"integer","default":12},"valueFontSize":{"type":"integer","default":10},"colorA":{"type":"string","default":"#3b82f6"},"colorB":{"type":"string","default":"#ec4899"},"bgColor":{"type":"string","default":"#ffffff"},"gridColor":{"type":"string","default":"#f3f4f6"},"titleColor":{"type":"string","default":"#111827"},"labelColor":{"type":"string","default":"#374151"},"items":{"type":"array","default":[{"label":"75+","a":2.1,"b":3.2},{"label":"65\u201374","a":4.8,"b":5.6},{"label":"55\u201364","a":6.9,"b":7.4},{"label":"45\u201354","a":8.2,"b":8.5},{"label":"35\u201344","a":8.7,"b":8.6},{"label":"25\u201334","a":9.1,"b":8.8},{"label":"15\u201324","a":8.4,"b":7.9},{"label":"5\u201314","a":7.6,"b":7.2},{"label":"0\u20134","a":4.3,"b":4.1}]},"labelFontWeight":{"type":"string","default":"400"},"valueFontWeight":{"type":"string","default":"700"}},
            save: function ( { attributes: a } ) {
                const blockProps = wp.blockEditor.useBlockProps.save( { className: 'bkbg-pyramid-wrap' } );
                return wp.element.createElement( 'div', blockProps,
                    a.showTitle && a.title ? wp.element.createElement( 'h3', { className: 'bkbg-pyramid-title', style: { color: a.titleColor } }, a.title ) : null,
                    wp.element.createElement( 'div', { className: 'bkbg-pyramid-svg' }, renderPyramid( a ) ),
                );
            }
        }]
    } );
}() );
