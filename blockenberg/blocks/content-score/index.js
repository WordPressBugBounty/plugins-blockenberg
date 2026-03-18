( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _bkbgCSgetTC, _bkbgCSgetTV;
    function getTC() { return _bkbgCSgetTC || (_bkbgCSgetTC = window.bkbgTypographyControl); }
    function getTV() { return _bkbgCSgetTV || (_bkbgCSgetTV = window.bkbgTypoCssVars); }
    function tv(obj, prefix) { var fn = getTV(); return fn ? fn(obj, prefix) : {}; }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function overallScore( criteria ) {
        if ( ! criteria || ! criteria.length ) return 0;
        const total = criteria.reduce( ( s, c ) => s + ( ( c.score || 0 ) / ( c.max || 100 ) ) * 100, 0 );
        return Math.round( total / criteria.length );
    }

    function scoreGrade( n ) {
        if ( n >= 90 ) return 'A';
        if ( n >= 80 ) return 'B';
        if ( n >= 70 ) return 'C';
        if ( n >= 60 ) return 'D';
        return 'F';
    }

    function scoreColor( n, a ) {
        if ( n >= 75 ) return a.passColor;
        if ( n >= 50 ) return a.warnColor;
        return a.failColor;
    }

    // ── Circular gauge ────────────────────────────────────────────────────────
    function renderGauge( a, score ) {
        const S   = a.gaugeSize;
        const SW  = a.strokeWidth;
        const r   = ( S - SW * 2 ) / 2;
        const cx  = S / 2;
        const cy  = S / 2;
        const circ = 2 * Math.PI * r;
        // Arc from -90° (top), goes clockwise
        const offset = circ - ( score / 100 ) * circ;
        const clr = scoreColor( score, a );
        const grade = a.showGrade ? scoreGrade( score ) : '';

        return el( 'div', { className: 'bkbg-cs-gauge', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 } },
            a.label && el( 'div', { className: 'bkbg-cs-gauge-label', style: { color: a.mutedColor, textAlign: 'center' } }, a.label ),
            el( 'svg', { width: S, height: S, viewBox: `0 0 ${ S } ${ S }`, style: { display: 'block' } },
                // Track
                el( 'circle', { cx, cy, r, fill: 'none', stroke: a.trackColor, strokeWidth: SW } ),
                // Progress arc
                el( 'circle', {
                    cx, cy, r,
                    fill: 'none',
                    stroke: clr,
                    strokeWidth: SW,
                    strokeDasharray: circ,
                    strokeDashoffset: offset,
                    strokeLinecap: 'round',
                    transform: `rotate(-90 ${ cx } ${ cy })`,
                    style: { transition: 'stroke-dashoffset 0.5s' }
                } ),
                // Score number
                el( 'text', { x: cx, y: cy - ( grade ? 10 : 0 ), textAnchor: 'middle', dominantBaseline: 'middle', fontSize: S * 0.22, fontWeight: 800, fill: clr }, score ),
                // Grade
                grade && el( 'text', { x: cx, y: cy + S * 0.14, textAnchor: 'middle', dominantBaseline: 'middle', fontSize: S * 0.12, fontWeight: 700, fill: a.mutedColor }, `Grade ${ grade }` ),
            ),
        );
    }

    // ── Criteria list ─────────────────────────────────────────────────────────
    function renderCriteria( a ) {
        const criteria = a.criteria || [];
        return el( 'div', { className: 'bkbg-cs-criteria', style: { display: 'flex', flexDirection: 'column', gap: 10, flex: 1 } },
            criteria.map( ( c, ci ) => {
                const pct = Math.min( 100, Math.round( ( ( c.score || 0 ) / ( c.max || 100 ) ) * 100 ) );
                const clr = scoreColor( pct, a );
                return el( 'div', { key: ci, className: 'bkbg-cs-criterion' },
                    el( 'div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
                        el( 'span', { className: 'bkbg-cs-crit-label', style: { color: a.textColor } }, c.label ),
                        el( 'span', { className: 'bkbg-cs-crit-score', style: { color: clr, minWidth: 36, textAlign: 'right' } }, `${ c.score }/${ c.max }` ),
                    ),
                    el( 'div', { style: { height: 6, background: a.trackColor, borderRadius: 99, overflow: 'hidden', marginBottom: c.note ? 3 : 0 } },
                        el( 'div', { style: { height: '100%', width: pct + '%', background: clr, borderRadius: 99 } } )
                    ),
                    c.note && el( 'span', { className: 'bkbg-cs-crit-note', style: { color: a.mutedColor } }, c.note ),
                );
            } )
        );
    }

    // ── Combined render ───────────────────────────────────────────────────────
    function renderScore( a ) {
        const score = overallScore( a.criteria );
        const isStack = a.layout !== 'side';
        const containerStyle = {
            display: 'flex',
            flexDirection: isStack ? 'column' : 'row',
            gap: 28,
            alignItems: isStack ? 'center' : 'flex-start',
        };
        return el( 'div', { className: 'bkbg-cs-inner', style: containerStyle },
            a.showGauge && renderGauge( a, score ),
            a.showCriteria && renderCriteria( a ),
        );
    }

    function updCriterion( setAttributes, criteria, ci, field, val ) {
        setAttributes( { criteria: criteria.map( ( c, i ) => i === ci ? { ...c, [field]: val } : c ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/content-score', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-cs-wrap', style: Object.assign({ background: a.bgColor, padding: '20px', borderRadius: a.borderRadius + 'px', boxSizing: 'border-box', '--bkcs-label-sz': (a.labelSize || 13) + 'px' }, tv(a.typoTitle, '--bkcs-title-'), tv(a.typoBody, '--bkcs-body-')) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ),       value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,   onChange: v => setAttributes( { showTitle:   v } ) } ),
                        el( TextControl,   { label: __( 'Gauge Label', 'blockenberg' ), value: a.label, onChange: v => setAttributes( { label: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Gauge', 'blockenberg' ),    checked: a.showGauge,    onChange: v => setAttributes( { showGauge:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grade', 'blockenberg' ),    checked: a.showGrade,    onChange: v => setAttributes( { showGrade:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Criteria', 'blockenberg' ), checked: a.showCriteria, onChange: v => setAttributes( { showCriteria: v } ) } ),
                        el( SelectControl, {
                            label: __( 'Layout', 'blockenberg' ),
                            value: a.layout,
                            options: [ { label: __( 'Side by Side', 'blockenberg' ), value: 'side' }, { label: __( 'Stacked', 'blockenberg' ), value: 'stack' } ],
                            onChange: v => setAttributes( { layout: v } ),
                        } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Gauge Size', 'blockenberg' ),  value: a.gaugeSize,   onChange: v => setAttributes( { gaugeSize:   v } ), min: 80, max: 260, step: 10 } ),
                        el( RangeControl, { label: __( 'Ring Width', 'blockenberg' ),  value: a.strokeWidth, onChange: v => setAttributes( { strokeWidth: v } ), min: 5, max: 30 } ),
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ),value: a.borderRadius,onChange: v => setAttributes( { borderRadius:v } ), min: 0, max: 28 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTC() && el( getTC(), { label: __( 'Title', 'blockenberg' ), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        getTC() && el( getTC(), { label: __( 'Body Text', 'blockenberg' ), value: a.typoBody, onChange: function (v) { setAttributes({ typoBody: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Label Size (px)', 'blockenberg'), value: a.labelSize, min: 10, max: 24, onChange: function (v) { setAttributes({ labelSize: v }); } })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Card BG', 'blockenberg' ),    value: a.cardBg,     onChange: v => setAttributes( { cardBg:     v || '#f9fafb' } ) },
                            { label: __( 'Title', 'blockenberg' ),      value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text', 'blockenberg' ),       value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                            { label: __( 'Muted', 'blockenberg' ),      value: a.mutedColor, onChange: v => setAttributes( { mutedColor: v || '#6b7280' } ) },
                            { label: __( 'Track', 'blockenberg' ),      value: a.trackColor, onChange: v => setAttributes( { trackColor: v || '#e5e7eb' } ) },
                            { label: __( 'Pass (≥75%)', 'blockenberg' ),value: a.passColor,  onChange: v => setAttributes( { passColor:  v || '#10b981' } ) },
                            { label: __( 'Warn (50–74%)', 'blockenberg' ),value: a.warnColor,onChange: v => setAttributes( { warnColor:  v || '#f59e0b' } ) },
                            { label: __( 'Fail (<50%)', 'blockenberg' ), value: a.failColor, onChange: v => setAttributes( { failColor:  v || '#ef4444' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Criteria', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { criteria: [ ...( a.criteria || [] ), { label: 'New Criterion', score: 70, max: 100, note: '' } ] } ) }, __( '+ Add Criterion', 'blockenberg' ) ),
                        a.criteria.map( ( c, ci ) =>
                            el( PanelBody, { key: ci, title: `${ c.label } (${ c.score }/${ c.max })`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ), value: c.label, onChange: v => updCriterion( setAttributes, a.criteria, ci, 'label', v ) } ),
                                el( RangeControl, { label: __( 'Score', 'blockenberg' ), value: c.score, onChange: v => updCriterion( setAttributes, a.criteria, ci, 'score', v ), min: 0, max: c.max || 100 } ),
                                el( RangeControl, { label: __( 'Max', 'blockenberg' ),   value: c.max,   onChange: v => updCriterion( setAttributes, a.criteria, ci, 'max',   v ), min: 1, max: 200 } ),
                                el( TextControl,  { label: __( 'Note', 'blockenberg' ),  value: c.note,  onChange: v => updCriterion( setAttributes, a.criteria, ci, 'note',  v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { criteria: a.criteria.filter( ( _, x ) => x !== ci ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-cs-title', style: { color: a.titleColor } }, a.title ),
                renderScore( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-cs-wrap', style: Object.assign({ background: a.bgColor, padding: '20px', borderRadius: a.borderRadius + 'px', boxSizing: 'border-box', '--bkcs-label-sz': (a.labelSize || 13) + 'px' }, tv(a.typoTitle, '--bkcs-title-'), tv(a.typoBody, '--bkcs-body-')) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-cs-title', style: { color: a.titleColor } }, a.title ) : null,
                renderScore( a ),
            );
        },
    } );
}() );
