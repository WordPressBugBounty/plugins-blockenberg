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
        Object.assign( v, fn( a.titleTypo || {}, '--bksg-tt-' ) );
        Object.assign( v, fn( a.bodyTypo  || {}, '--bksg-bt-' ) );
        return v;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderTable( a ) {
        const cols     = a.columns || [];
        const rows     = a.rows    || [];
        const hlCol    = a.showHighlight ? ( a.highlightCol || 0 ) : -1;
        const P        = a.cellPadding + 'px';
        const FS       = a.fontSize    + 'px';

        const thStyle = ( ci ) => ( {
            background: ci === hlCol ? a.highlightBg : a.headerBg,
            color:      ci === hlCol ? a.highlightText : a.headerText,
            padding: P,
            fontSize: FS,
            fontWeight: a.fontWeight||700,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            position: 'relative',
        } );

        const tdStyle = ( ci, ri ) => ( {
            background: ci === hlCol ? a.highlightBg : ri % 2 === 0 ? '#ffffff' : a.rowAltBg,
            color:      ci === hlCol ? a.highlightText : a.textColor,
            padding: P,
            fontSize: FS,
            textAlign: ci === 0 ? 'left' : 'center',
            borderBottom: `1px solid ${ a.borderColor }`,
            fontWeight:   ci === 0 ? 600 : 400,
        } );

        return el( 'div', { className: 'bkbg-sg-table-wrap', style: { overflowX: 'auto' } },
            el( 'table', { style: { borderCollapse: 'collapse', width: '100%', minWidth: 400, border: `1px solid ${ a.borderColor }`, borderRadius: a.borderRadius + 'px', overflow: 'hidden' } },
                el( 'thead', {},
                    el( 'tr', {},
                        cols.map( ( col, ci ) =>
                            el( 'th', { key: ci, style: thStyle( ci ) },
                                ci === hlCol && a.showHighlight && a.highlightLabel && el( 'span', { style: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: 2 } }, a.highlightLabel ),
                                col,
                            )
                        )
                    )
                ),
                el( 'tbody', {},
                    rows.map( ( row, ri ) =>
                        el( 'tr', { key: ri },
                            Array.from( { length: cols.length } ).map( ( _, ci ) =>
                                el( 'td', { key: ci, style: tdStyle( ci, ri ) }, row[ ci ] || '' )
                            )
                        )
                    )
                )
            )
        );
    }

    // ── Renderer (new – no inline font styles) ───────────────────────────────
    function renderTableNew( a ) {
        const cols  = a.columns || [];
        const rows  = a.rows    || [];
        const hlCol = a.showHighlight ? ( a.highlightCol || 0 ) : -1;
        const P     = a.cellPadding + 'px';

        const thStyle = ( ci ) => ( {
            background: ci === hlCol ? a.highlightBg : a.headerBg,
            color:      ci === hlCol ? a.highlightText : a.headerText,
            padding: P, textAlign: 'center', whiteSpace: 'nowrap', position: 'relative',
        } );

        const tdStyle = ( ci, ri ) => ( {
            background: ci === hlCol ? a.highlightBg : ri % 2 === 0 ? '#ffffff' : a.rowAltBg,
            color:      ci === hlCol ? a.highlightText : a.textColor,
            padding: P, textAlign: ci === 0 ? 'left' : 'center',
            borderBottom: `1px solid ${ a.borderColor }`,
        } );

        return el( 'div', { className: 'bkbg-sg-table-wrap', style: { overflowX: 'auto' } },
            el( 'table', { style: { borderCollapse: 'collapse', width: '100%', minWidth: 400, border: `1px solid ${ a.borderColor }`, borderRadius: a.borderRadius + 'px', overflow: 'hidden' } },
                el( 'thead', {},
                    el( 'tr', {},
                        cols.map( ( col, ci ) =>
                            el( 'th', { key: ci, style: thStyle( ci ) },
                                ci === hlCol && a.showHighlight && a.highlightLabel && el( 'span', { style: { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: 2 } }, a.highlightLabel ),
                                col,
                            )
                        )
                    )
                ),
                el( 'tbody', {},
                    rows.map( ( row, ri ) =>
                        el( 'tr', { key: ri },
                            Array.from( { length: cols.length } ).map( ( _, ci ) =>
                                el( 'td', { key: ci, style: tdStyle( ci, ri ) }, row[ ci ] || '' )
                            )
                        )
                    )
                )
            )
        );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/size-guide', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-sg-wrap', style: buildTypoVars( a ) } );

            const cols = a.columns || [];
            const rows = a.rows    || [];

            function setCell( ri, ci, val ) {
                const newRows = rows.map( ( r, i ) => {
                    if ( i !== ri ) return r;
                    const nr = [ ...r ];
                    nr[ ci ] = val;
                    return nr;
                } );
                setAttributes( { rows: newRows } );
            }

            function setColHeader( ci, val ) {
                setAttributes( { columns: cols.map( ( c, i ) => i === ci ? val : c ) } );
            }

            function addColumn() {
                setAttributes( {
                    columns: [ ...cols, 'New' ],
                    rows: rows.map( r => [ ...r, '' ] ),
                } );
            }

            function removeColumn( ci ) {
                setAttributes( {
                    columns: cols.filter( ( _, i ) => i !== ci ),
                    rows: rows.map( r => r.filter( ( _, i ) => i !== ci ) ),
                } );
            }

            function addRow() {
                setAttributes( { rows: [ ...rows, Array( cols.length ).fill( '' ) ] } );
            }

            function removeRow( ri ) {
                setAttributes( { rows: rows.filter( ( _, i ) => i !== ri ) } );
            }

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),      checked: a.showTitle,     onChange: v => setAttributes( { showTitle:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Note', 'blockenberg' ),       checked: a.showNote,      onChange: v => setAttributes( { showNote:      v } ) } ),
                        a.showNote && el( TextControl, { label: __( 'Note Text', 'blockenberg' ), value: a.note, onChange: v => setAttributes( { note: v } ) } ),
                        el( ToggleControl, { label: __( 'Highlight Column', 'blockenberg' ),checked: a.showHighlight, onChange: v => setAttributes( { showHighlight: v } ) } ),
                        a.showHighlight && el( RangeControl, { label: __( 'Highlight Col Index (0=first)', 'blockenberg' ), value: a.highlightCol, onChange: v => setAttributes( { highlightCol: v } ), min: 0, max: Math.max( 0, cols.length - 1 ) } ),
                        a.showHighlight && el( TextControl, { label: __( 'Highlight Badge Label', 'blockenberg' ), value: a.highlightLabel, onChange: v => setAttributes( { highlightLabel: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Cell Padding', 'blockenberg' ), value: a.cellPadding, onChange: v => setAttributes( { cellPadding: v } ), min: 4,  max: 28 } ),
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ),value: a.borderRadius,onChange: v => setAttributes( { borderRadius: v } ), min: 0,  max: 20 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTC(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function( v ) { setAttributes( { titleTypo: v } ); } } ),
                        el( getTC(), { label: __( 'Table', 'blockenberg' ), value: a.bodyTypo  || {}, onChange: function( v ) { setAttributes( { bodyTypo:  v } ); } } ),
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'BG', 'blockenberg' ),           value: a.bgColor,       onChange: v => setAttributes( { bgColor:       v || '#ffffff' } ) },
                            { label: __( 'Header BG', 'blockenberg' ),    value: a.headerBg,      onChange: v => setAttributes( { headerBg:      v || '#111827' } ) },
                            { label: __( 'Header Text', 'blockenberg' ),  value: a.headerText,    onChange: v => setAttributes( { headerText:    v || '#ffffff' } ) },
                            { label: __( 'Highlight BG', 'blockenberg' ), value: a.highlightBg,   onChange: v => setAttributes( { highlightBg:   v || '#eef2ff' } ) },
                            { label: __( 'Highlight Text', 'blockenberg' ),value: a.highlightText,onChange: v => setAttributes( { highlightText: v || '#4338ca' } ) },
                            { label: __( 'Alt Row BG', 'blockenberg' ),   value: a.rowAltBg,      onChange: v => setAttributes( { rowAltBg:      v || '#f9fafb' } ) },
                            { label: __( 'Border', 'blockenberg' ),       value: a.borderColor,   onChange: v => setAttributes( { borderColor:   v || '#e5e7eb' } ) },
                            { label: __( 'Text', 'blockenberg' ),         value: a.textColor,     onChange: v => setAttributes( { textColor:     v || '#374151' } ) },
                            { label: __( 'Title', 'blockenberg' ),        value: a.titleColor,    onChange: v => setAttributes( { titleColor:    v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Columns & Rows', 'blockenberg' ), initialOpen: false },
                        el( 'p', { style: { fontSize: 12, color: '#6b7280', margin: '0 0 8px' } }, __( 'Edit table content directly in the block canvas below. Use these controls to add/remove columns and rows.', 'blockenberg' ) ),
                        el( 'div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
                            el( Button, { variant: 'secondary', isSmall: true, onClick: addColumn },   __( '+ Column', 'blockenberg' ) ),
                            el( Button, { variant: 'secondary', isSmall: true, onClick: addRow },      __( '+ Row', 'blockenberg' ) ),
                            cols.length > 1 && el( Button, { isDestructive: true, isSmall: true, onClick: () => removeColumn( cols.length - 1 ) }, __( '- Last Col', 'blockenberg' ) ),
                            rows.length > 1 && el( Button, { isDestructive: true, isSmall: true, onClick: () => removeRow( rows.length - 1 ) }, __( '- Last Row', 'blockenberg' ) ),
                        )
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-sg-title', style: { color: a.titleColor, margin: '0 0 14px' } }, a.title ),

                // Editable table in editor
                el( 'div', { className: 'bkbg-sg-table-wrap', style: { overflowX: 'auto', background: a.bgColor, borderRadius: a.borderRadius + 'px', border: `1px solid ${ a.borderColor }`, overflow: 'hidden' } },
                    el( 'table', { style: { borderCollapse: 'collapse', width: '100%', minWidth: 400 } },
                        el( 'thead', {},
                            el( 'tr', {},
                                cols.map( ( col, ci ) =>
                                    el( 'th', { key: ci, style: { background: ci === ( a.showHighlight ? a.highlightCol : -1 ) ? a.highlightBg : a.headerBg, padding: a.cellPadding + 'px', border: 'none', position: 'relative' } },
                                        ci === a.highlightCol && a.showHighlight && a.highlightLabel && el( 'div', { style: { fontSize: 10, color: a.highlightText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: 2 } }, a.highlightLabel ),
                                        el( 'input', {
                                            value: col,
                                            onChange: e => setColHeader( ci, e.target.value ),
                                            style: { background: 'transparent', border: 'none', color: ci === ( a.showHighlight ? a.highlightCol : -1 ) ? a.highlightText : a.headerText, textAlign: 'center', width: '100%', cursor: 'text', outline: 'none', padding: 0 }
                                        } ),
                                    )
                                )
                            )
                        ),
                        el( 'tbody', {},
                            rows.map( ( row, ri ) =>
                                el( 'tr', { key: ri },
                                    Array.from( { length: cols.length } ).map( ( _, ci ) =>
                                        el( 'td', { key: ci, style: { background: ci === ( a.showHighlight ? a.highlightCol : -1 ) ? a.highlightBg : ri % 2 === 0 ? '#ffffff' : a.rowAltBg, padding: a.cellPadding + 'px', borderBottom: `1px solid ${ a.borderColor }` } },
                                            el( 'input', {
                                                value: row[ ci ] || '',
                                                onChange: e => setCell( ri, ci, e.target.value ),
                                                style: { background: 'transparent', border: 'none', width: '100%', textAlign: ci === 0 ? 'left' : 'center', color: ci === ( a.showHighlight ? a.highlightCol : -1 ) ? a.highlightText : ci === 0 ? a.textColor : a.textColor, cursor: 'text', outline: 'none', padding: 0 }
                                            } )
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),

                a.showNote && a.note && el( 'p', { className: 'bkbg-sg-note', style: { fontSize: 12, color: '#6b7280', marginTop: 10, marginBottom: 0 } }, a.note ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-sg-wrap', style: buildTypoVars( a ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-sg-title', style: { color: a.titleColor, margin: '0 0 14px' } }, a.title ) : null,
                renderTableNew( a ),
                a.showNote && a.note ? el( 'p', { className: 'bkbg-sg-note', style: { fontSize: 12, color: '#6b7280', marginTop: 10, marginBottom: 0 } }, a.note ) : null,
            );
        },

        deprecated: [ {
            save: function ( { attributes: a } ) {
                var bp = useBlockProps.save( { className: 'bkbg-sg-wrap' } );
                return el( 'div', bp,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-sg-title', style: { color: a.titleColor, margin: '0 0 14px', fontSize: ( a.fontSize + 4 ) + 'px' } }, a.title ) : null,
                    renderTable( a ),
                    a.showNote && a.note ? el( 'p', { className: 'bkbg-sg-note', style: { fontSize: 12, color: '#6b7280', marginTop: 10, marginBottom: 0 } }, a.note ) : null,
                );
            },
            migrate: function ( attrs ) {
                var n = Object.assign( {}, attrs );
                n.titleTypo = { sizeDesktop: ( attrs.fontSize || 14 ) + 4 };
                n.bodyTypo  = { sizeDesktop: attrs.fontSize || 14, weight: String( attrs.fontWeight || 700 ) };
                return n;
            },
        } ],
    } );
}() );
