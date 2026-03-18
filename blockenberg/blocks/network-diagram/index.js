( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderNetwork( a ) {
        const nodes   = a.nodes || [];
        const links   = a.links || [];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const R  = a.nodeRadius;
        const AZ = a.arrowSize;

        const nodeMap = {};
        nodes.forEach( n => { nodeMap[ n.id ] = n; } );

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor, rx: 10 } ) );

        // Arrow marker definition
        if ( a.showArrows ) {
            svgEls.push( el( 'defs', { key: 'defs' },
                el( 'marker', { id: 'bkbg-nd-arrow', markerWidth: AZ, markerHeight: AZ, refX: R + AZ * a.linkWidth * 0.5, refY: AZ / 2, orient: 'auto', markerUnits: 'userSpaceOnUse' },
                    el( 'polygon', { points: `0 0, ${ AZ } ${ AZ / 2 }, 0 ${ AZ }`, fill: a.linkColor } )
                )
            ) );
        }

        // Links
        links.forEach( ( lnk, li ) => {
            const src = nodeMap[ lnk.from ];
            const tgt = nodeMap[ lnk.to ];
            if ( ! src || ! tgt ) return;
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt( dx * dx + dy * dy ) || 1;
            const ux = dx / dist;
            const uy = dy / dist;
            const x1 = src.x + ux * R;
            const y1 = src.y + uy * R;
            const x2 = tgt.x - ux * R;
            const y2 = tgt.y - uy * R;

            svgEls.push( el( 'line', {
                key: `lnk${ li }`,
                x1, y1, x2, y2,
                stroke: a.linkColor,
                strokeWidth: a.linkWidth,
                markerEnd: a.showArrows ? 'url(#bkbg-nd-arrow)' : undefined,
            } ) );

            // Edge label
            if ( lnk.label ) {
                svgEls.push( el( 'text', { key: `le${ li }`, x: ( x1 + x2 ) / 2, y: ( y1 + y2 ) / 2 - 5, textAnchor: 'middle', fill: '#64748b', fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, lnk.label ) );
            }
        } );

        // Nodes
        nodes.forEach( ( nd, ni ) => {
            // Drop shadow
            svgEls.push( el( 'circle', { key: `sh${ ni }`, cx: nd.x + 2, cy: nd.y + 3, r: R, fill: 'rgba(0,0,0,0.12)' } ) );
            svgEls.push( el( 'circle', { key: `nd${ ni }`, cx: nd.x, cy: nd.y, r: R, fill: nd.color || '#6366f1', stroke: '#fff', strokeWidth: a.nodeStroke } ) );

            if ( a.showLabels ) {
                // Wrap long labels
                const words = ( nd.label || '' ).split( ' ' );
                if ( words.length > 1 ) {
                    svgEls.push( el( 'text', { key: `nl${ ni }`, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: a.labelFontWeight || 600 },
                        el( 'tspan', { x: nd.x, y: nd.y - a.labelFontSize * 0.5, dy: '0' }, words[0] ),
                        el( 'tspan', { x: nd.x, dy: a.labelFontSize + 2 }, words.slice( 1 ).join( ' ' ) ),
                    ) );
                } else {
                    svgEls.push( el( 'text', { key: `nl${ ni }`, x: nd.x, y: nd.y, textAnchor: 'middle', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: a.labelFontWeight || 600 }, nd.label ) );
                }
            }
        } );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updNode( setAttributes, nodes, ni, field, val ) {
        setAttributes( { nodes: nodes.map( ( n, i ) => i === ni ? { ...n, [field]: val } : n ) } );
    }
    function updLink( setAttributes, links, li, field, val ) {
        setAttributes( { links: links.map( ( l, i ) => i === li ? { ...l, [field]: val } : l ) } );
    }

    registerBlockType( 'blockenberg/network-diagram', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkbg-nd-tt-')); }
                return { className: 'bkbg-network-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Labels', 'blockenberg' ), checked: a.showLabels, onChange: v => setAttributes( { showLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Arrows', 'blockenberg' ), checked: a.showArrows, onChange: v => setAttributes( { showArrows: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,     onChange: v => setAttributes( { svgWidth:     v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight,    onChange: v => setAttributes( { svgHeight:    v } ), min: 200, max: 800 } ),
                        el( RangeControl, { label: __( 'Node Radius', 'blockenberg' ),   value: a.nodeRadius,   onChange: v => setAttributes( { nodeRadius:   v } ), min: 12, max: 60 } ),
                        el( RangeControl, { label: __( 'Node Border', 'blockenberg' ),   value: a.nodeStroke,   onChange: v => setAttributes( { nodeStroke:   v } ), min: 1, max: 6 } ),
                        el( RangeControl, { label: __( 'Link Width', 'blockenberg' ),    value: a.linkWidth,    onChange: v => setAttributes( { linkWidth:    v } ), min: 1, max: 8 } ),
                        el( RangeControl, { label: __( 'Arrow Size', 'blockenberg' ),    value: a.arrowSize,    onChange: v => setAttributes( { arrowSize:    v } ), min: 5, max: 24 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20, __nextHasNoMarginBottom: true } ),
                        el( RangeControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight || 600, onChange: v => setAttributes( { labelFontWeight: v } ), min: 300, max: 900, step: 100, __nextHasNoMarginBottom: true } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#f8fafc' } ) },
                            { label: __( 'Link Color', 'blockenberg' ), value: a.linkColor,  onChange: v => setAttributes( { linkColor:  v || '#cbd5e1' } ) },
                            { label: __( 'Label Text', 'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#ffffff' } ) },
                            { label: __( 'Title',      'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Nodes', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => {
                            const ids = ( a.nodes || [] ).map( n => parseInt( n.id.replace( 'n', '' ) ) || 0 );
                            const nextId = 'n' + ( Math.max( 0, ...ids ) + 1 );
                            setAttributes( { nodes: [ ...( a.nodes || [] ), { id: nextId, label: 'New Node', color: '#6366f1', x: 200, y: 200 } ] } );
                        } }, __( '+ Add Node', 'blockenberg' ) ),
                        a.nodes.map( ( nd, ni ) =>
                            el( PanelBody, { key: ni, title: `${ nd.label } (${ nd.id })`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ), value: nd.label, onChange: v => updNode( setAttributes, a.nodes, ni, 'label', v ) } ),
                                el( TextControl,  { label: __( 'ID', 'blockenberg' ), value: nd.id, onChange: v => updNode( setAttributes, a.nodes, ni, 'id', v ) } ),
                                el( 'div', { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12 } }, __( 'Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: nd.color, style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updNode( setAttributes, a.nodes, ni, 'color', e.target.value ) } ),
                                ),
                                el( 'div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 } },
                                    el( TextControl, { label: 'X', value: String( nd.x ), type: 'number', onChange: v => updNode( setAttributes, a.nodes, ni, 'x', parseFloat( v ) || 0 ) } ),
                                    el( TextControl, { label: 'Y', value: String( nd.y ), type: 'number', onChange: v => updNode( setAttributes, a.nodes, ni, 'y', parseFloat( v ) || 0 ) } ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => {
                                    const filtered = a.nodes.filter( ( _, x ) => x !== ni );
                                    setAttributes( { nodes: filtered, links: a.links.filter( l => l.from !== nd.id && l.to !== nd.id ) } );
                                } }, __( 'Remove Node', 'blockenberg' ) ),
                            )
                        ),
                    ),

                    el( PanelBody, { title: __( 'Links', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { links: [ ...( a.links || [] ), { from: '', to: '', label: '' } ] } ) }, __( '+ Add Link', 'blockenberg' ) ),
                        a.links.map( ( lnk, li ) =>
                            el( 'div', { key: li, style: { display: 'flex', gap: 6, alignItems: 'flex-end', marginBottom: 6, flexWrap: 'wrap' } },
                                el( TextControl, { label: li === 0 ? 'From ID' : undefined, value: lnk.from, onChange: v => updLink( setAttributes, a.links, li, 'from', v ), style: { flex: 1, minWidth: 80 } } ),
                                el( TextControl, { label: li === 0 ? 'To ID'   : undefined, value: lnk.to,   onChange: v => updLink( setAttributes, a.links, li, 'to',   v ), style: { flex: 1, minWidth: 80 } } ),
                                el( TextControl, { label: li === 0 ? 'Label'   : undefined, value: lnk.label || '', onChange: v => updLink( setAttributes, a.links, li, 'label', v ), style: { flex: 1, minWidth: 60 } } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { links: a.links.filter( ( _, x ) => x !== li ) } ) }, '✕' ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-network-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-network-svg' }, renderNetwork( a ) ),
            );
        },

        deprecated: [
            {
                attributes: wp.blocks.getBlockType('blockenberg/network-diagram') ? wp.blocks.getBlockType('blockenberg/network-diagram').attributes : {},
                save: function ( { attributes: a } ) {
                    const blockProps = useBlockProps.save( { className: 'bkbg-network-wrap' } );
                    return el( 'div', blockProps,
                        a.showTitle && a.title ? el( 'h3', { className: 'bkbg-network-title', style: { color: a.titleColor, fontSize: ( a.titleFontSize || 20 ) + 'px', fontWeight: a.titleFontWeight || 700 } }, a.title ) : null,
                        el( 'div', { className: 'bkbg-network-svg' }, renderNetwork( a ) ),
                    );
                }
            }
        ],

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkbg-nd-tt-')); }
                return { className: 'bkbg-network-wrap', style: s };
            })());
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-network-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-network-svg' }, renderNetwork( a ) ),
            );
        },
    } );
}() );
