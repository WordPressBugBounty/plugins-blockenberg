( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _divbarTC, _divbarTV;
    function _tc() { return _divbarTC || (_divbarTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_divbarTV || (_divbarTV = window.bkbgTypoCssVars)) ? _divbarTV(t, p) : {}; }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderDivergingBar( a ) {
        const items = a.items || [];
        const W   = a.svgWidth;
        const RH  = a.rowHeight;
        const PT  = a.padTop;
        const PL  = a.padLeft;
        const PR  = a.padRight;
        const BH  = a.barHeight;

        const maxPos = Math.max( ...items.map( it => it.positive || 0 ), 1 );
        const maxNeg = Math.max( ...items.map( it => it.negative || 0 ), 1 );
        const maxVal = Math.max( maxPos, maxNeg );

        const H       = PT + items.length * RH + 20;
        const halfW   = ( W - PL - PR ) / 2;
        const cx      = PL + halfW;   // x of zero baseline

        function scalePos( v ) { return ( v / maxVal ) * halfW; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines (symmetric)
        if ( a.showGridLines ) {
            const ticks = 4;
            for ( let i = 1; i <= ticks; i++ ) {
                const offset = scalePos( maxVal * i / ticks );
                [ cx + offset, cx - offset ].forEach( ( gx, li ) => {
                    svgEls.push( el( 'line', { key: `gl${ i }${ li }`, x1: gx, y1: PT - 4, x2: gx, y2: H - 10, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                } );
                // tick labels at top
                const tv = Math.round( maxVal * i / ticks );
                svgEls.push( el( 'text', { key: `gtr${ i }`, x: cx + offset, y: PT - 8, textAnchor: 'middle', fill: '#9ca3af', fontSize: 10, fontFamily: 'inherit' }, `+${ tv }` ) );
                svgEls.push( el( 'text', { key: `gtl${ i }`, x: cx - offset, y: PT - 8, textAnchor: 'middle', fill: '#9ca3af', fontSize: 10, fontFamily: 'inherit' }, `-${ tv }` ) );
            }
        }

        // Zero line
        if ( a.showZeroLine ) {
            svgEls.push( el( 'line', { key: 'zero', x1: cx, y1: PT - 8, x2: cx, y2: H - 10, stroke: '#6b7280', strokeWidth: 2 } ) );
        }

        // Rows
        items.forEach( ( item, i ) => {
            const cy   = PT + i * RH + RH / 2;
            const posW = scalePos( item.positive || 0 );
            const negW = scalePos( item.negative || 0 );

            // Positive bar (right of centre)
            svgEls.push( el( 'rect', { key: `bp${ i }`, x: cx, y: cy - BH / 2, width: posW, height: BH, fill: a.posColor || '#4f46e5', rx: 3 } ) );
            // Negative bar (left of centre)
            svgEls.push( el( 'rect', { key: `bn${ i }`, x: cx - negW, y: cy - BH / 2, width: negW, height: BH, fill: a.negColor || '#dc2626', rx: 3 } ) );

            // Value labels
            if ( a.showValues ) {
                if ( item.positive > 0 ) {
                    svgEls.push( el( 'text', { key: `vp${ i }`, x: cx + posW + 4, y: cy, dominantBaseline: 'middle', fill: a.posColor, fontSize: a.valueFontSize, fontFamily: 'inherit' }, String( item.positive ) ) );
                }
                if ( item.negative > 0 ) {
                    svgEls.push( el( 'text', { key: `vn${ i }`, x: cx - negW - 4, y: cy, dominantBaseline: 'middle', textAnchor: 'end', fill: a.negColor, fontSize: a.valueFontSize, fontFamily: 'inherit' }, String( item.negative ) ) );
                }
            }

            // Row label
            svgEls.push( el( 'text', { key: `lbl${ i }`, x: PL - 10, y: cy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.labelColor || '#374151', fontSize: a.labelFontSize, fontWeight: a.labelFontWeight || '400', fontFamily: 'inherit' }, item.label || '' ) );
        } );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updItem( setAttributes, items, idx, field, val ) {
        setAttributes( { items: items.map( ( it, i ) => i === idx ? { ...it, [field]: val } : it ) } );
    }

    registerBlockType( 'blockenberg/diverging-bar', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-divbar-wrap', style: Object.assign(
                { '--bkbg-divbar-ttl-fs': (a.titleFontSize || 18) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-divbar-ttl-')
            ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),      checked: a.showTitle,     onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),     checked: a.showValues,    onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Zero Line', 'blockenberg' ),  checked: a.showZeroLine,  onChange: v => setAttributes( { showZeroLine: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),      min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Row Height', 'blockenberg' ),      value: a.rowHeight,     onChange: v => setAttributes( { rowHeight: v } ),     min: 24, max: 90 } ),
                        el( RangeControl, { label: __( 'Bar Height', 'blockenberg' ),      value: a.barHeight,     onChange: v => setAttributes( { barHeight: v } ),     min: 8,  max: 56 } ),
                        el( RangeControl, { label: __( 'Label Column Width', 'blockenberg' ), value: a.padLeft,    onChange: v => setAttributes( { padLeft: v } ),       min: 60, max: 300 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: v => setAttributes( { typoTitle: v } ), defaultSize: a.titleFontSize || 18 }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el( wp.components.SelectControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight || '400',
                            options: [{label:'Normal (400)',value:'400'},{label:'Medium (500)',value:'500'},{label:'Bold (700)',value:'700'}],
                            onChange: v => setAttributes( { labelFontWeight: v } ) } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 7, max: 16 } ),
                        el( wp.components.SelectControl, { label: __( 'Value Font Weight', 'blockenberg' ), value: a.valueFontWeight || '400',
                            options: [{label:'Normal (400)',value:'400'},{label:'Bold (700)',value:'700'}],
                            onChange: v => setAttributes( { valueFontWeight: v } ) } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Positive Bar', 'blockenberg' ), value: a.posColor,   onChange: v => setAttributes( { posColor:   v || '#4f46e5' } ) },
                            { label: __( 'Negative Bar', 'blockenberg' ), value: a.negColor,   onChange: v => setAttributes( { negColor:   v || '#dc2626' } ) },
                            { label: __( 'Background',   'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid Lines',   'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Title Color',  'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Label Color',  'blockenberg' ), value: a.labelColor, onChange: v => setAttributes( { labelColor: v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Data', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { items: [ ...a.items, { label: 'New Row', positive: 20, negative: 10 } ] } ) }, __( '+ Add Row', 'blockenberg' ) ),
                        a.items.map( ( item, i ) =>
                            el( PanelBody, { key: i, title: item.label || `Row ${ i + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),    value: item.label,    onChange: v => updItem( setAttributes, a.items, i, 'label',    v ) } ),
                                el( RangeControl, { label: __( 'Positive', 'blockenberg' ), value: item.positive, onChange: v => updItem( setAttributes, a.items, i, 'positive', v ), min: 0, max: 500 } ),
                                el( RangeControl, { label: __( 'Negative', 'blockenberg' ), value: item.negative, onChange: v => updItem( setAttributes, a.items, i, 'negative', v ), min: 0, max: 500 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-divbar-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-divbar-svg' }, renderDivergingBar( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-divbar-wrap', style: Object.assign(
                { '--bkbg-divbar-ttl-fs': (a.titleFontSize || 18) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-divbar-ttl-')
            ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-divbar-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-divbar-svg' }, renderDivergingBar( a ) ),
            );
        },
    } );
}() );
