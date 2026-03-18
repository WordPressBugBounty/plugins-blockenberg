( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    /* ── Typography helpers (lazy) ──────────────────────────────────── */
    var _tc, _tvf;
    Object.defineProperty(window, '__bkwfr_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '__bkwfr_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, typoObj, setAttributes, attrName) {
        var fn = window.__bkwfr_tc;
        return fn ? fn({ label: label, value: typoObj || {}, onChange: function (v) { var o = {}; o[attrName] = v; setAttributes(o); } }) : null;
    }
    function getTypoCssVars(a) {
        var fn = window.__bkwfr_tvf;
        var s = {};
        if (fn) {
            Object.assign(s, fn(a.titleTypo || {}, '--bkwfr-tt-'));
            Object.assign(s, fn(a.labelTypo || {}, '--bkwfr-lb-'));
            Object.assign(s, fn(a.valueTypo || {}, '--bkwfr-vl-'));
        }
        return s;
    }

    // ── Render bar chart ──────────────────────────────────────────────────────
    function renderChart( a ) {
        const sorted = a.sortDesc
            ? [ ...( a.words || [] ) ].sort( ( x, y ) => ( y.count || 0 ) - ( x.count || 0 ) )
            : [ ...( a.words || [] ) ];

        const maxCount = Math.max( ...sorted.map( w => w.count || 0 ), 1 );

        return el( 'div', { className: 'bkbg-wf-bars', style: { background: a.bgColor || '#ffffff', padding: '4px 0' } },
            sorted.map( ( word, i ) => {
                const count = word.count || 0;
                const pct   = ( ( count / maxCount ) * 100 ).toFixed( 1 );
                const label = a.showPercent ? pct + '%' : String( count );

                return el( 'div', { key: i, className: 'bkbg-wf-row' },

                    // Rank badge
                    a.showRank && el( 'span', {
                        className: 'bkbg-wf-rank',
                        style: { color: word.color || '#4f46e5' }
                    }, String( i + 1 ) ),

                    // Word label
                    a.showLabels && el( 'span', {
                        className: 'bkbg-wf-label',
                        style: { width: a.labelWidth + 'px', color: a.textColor }
                    }, word.word || '' ),

                    // Bar track + fill
                    el( 'div', { className: 'bkbg-wf-track', style: { background: a.trackColor || '#f3f4f6', height: a.barHeight + 'px' } },
                        el( 'div', {
                            className: 'bkbg-wf-fill',
                            style: {
                                width: pct + '%',
                                height: '100%',
                                background: word.color || '#4f46e5',
                                borderRadius: a.barRadius + 'px',
                                transition: 'width 0.6s ease',
                            }
                        } )
                    ),

                    // Value label
                    a.showValues && el( 'span', {
                        className: 'bkbg-wf-val',
                        style: { color: a.textColor }
                    }, label ),

                );
            } )
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function updWord( setAttributes, words, idx, field, val ) {
        const next = words.map( ( w, i ) => i === idx ? { ...w, [field]: val } : w );
        setAttributes( { words: next } );
    }

    // ── Block registration ────────────────────────────────────────────────────    /* ── colour-swatch + popover ── */
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
    registerBlockType( 'blockenberg/word-frequency', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-word-frequency-wrap', style: getTypoCssVars( a ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),     checked: a.showTitle,  onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),    checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show As Percent', 'blockenberg' ), checked: a.showPercent, onChange: v => setAttributes( { showPercent: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Rank Numbers', 'blockenberg' ), checked: a.showRank, onChange: v => setAttributes( { showRank: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Labels', 'blockenberg' ),    checked: a.showLabels, onChange: v => setAttributes( { showLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Sort High → Low', 'blockenberg' ), checked: a.sortDesc, onChange: v => setAttributes( { sortDesc: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Appearance', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Bar Height', 'blockenberg' ),      value: a.barHeight,     onChange: v => setAttributes( { barHeight: v } ),     min: 16, max: 80 } ),
                        el( RangeControl, { label: __( 'Row Gap', 'blockenberg' ),         value: a.barGap,        onChange: v => setAttributes( { barGap: v } ),        min: 0, max: 30 } ),
                        el( RangeControl, { label: __( 'Bar Radius', 'blockenberg' ),      value: a.barRadius,     onChange: v => setAttributes( { barRadius: v } ),     min: 0, max: 20 } ),
                        el( RangeControl, { label: __( 'Label Column Width', 'blockenberg' ), value: a.labelWidth,  onChange: v => setAttributes( { labelWidth: v } ),   min: 60, max: 300 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl( 'Title', a.titleTypo, setAttributes, 'titleTypo' ),
                        getTypoControl( 'Label', a.labelTypo, setAttributes, 'labelTypo' ),
                        getTypoControl( 'Value', a.valueTypo, setAttributes, 'valueTypo' )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ),
                        initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),   value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Track Color', 'blockenberg' ),  value: a.trackColor, onChange: v => setAttributes( { trackColor: v || '#f3f4f6' } ) },
                            { label: __( 'Title Color', 'blockenberg' ),  value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color', 'blockenberg' ),   value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Data', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 10 },
                            onClick: () => setAttributes( { words: [ ...a.words, { word: 'New Item', count: 10, color: '#6b7280' } ] } )
                        }, __( '+ Add Item', 'blockenberg' ) ),

                        a.words.map( ( word, i ) =>
                            el( PanelBody, { key: i, title: ( word.word || `Item ${ i + 1 }` ) + ` (${ word.count })`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),       value: word.word,  onChange: v => updWord( setAttributes, a.words, i, 'word', v ) } ),
                                el( RangeControl, { label: __( 'Value / Count', 'blockenberg' ), value: word.count, onChange: v => updWord( setAttributes, a.words, i, 'count', v ), min: 0, max: 10000 } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: word.color, onChange: v => updWord( setAttributes, a.words, i, 'color', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { words: a.words.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-wf-title', style: { color: a.titleColor } }, a.title ),
                renderChart( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-word-frequency-wrap', style: getTypoCssVars( a ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-wf-title', style: { color: a.titleColor } }, a.title ) : null,
                renderChart( a ),
            );
        },
    } );
}() );
