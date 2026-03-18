( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Helpers ───────────────────────────────────────────────────────────────
    const STATUS_COLORS = { 'done': '#10b981', 'on-track': '#6366f1', 'at-risk': '#f59e0b', 'off-track': '#ef4444' };
    const STATUS_LABELS = { 'done': 'Done', 'on-track': 'On Track', 'at-risk': 'At Risk', 'off-track': 'Off Track' };

    function avgProgress( krs ) {
        if ( ! krs || ! krs.length ) return 0;
        return Math.round( krs.reduce( ( s, kr ) => s + ( kr.progress || 0 ), 0 ) / krs.length );
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderOKR( a ) {
        const objectives = a.objectives || [];

        return el( 'div', { className: 'bkbg-okr-objectives', style: { display: 'flex', flexDirection: 'column', gap: 16 } },
            objectives.map( ( obj, oi ) => {
                const avg = avgProgress( obj.keyResults );
                const clr = obj.color || '#6366f1';

                return el( 'div', {
                    key: oi,
                    className: 'bkbg-okr-objective',
                    style: {
                        background: a.cardBg,
                        borderRadius: a.borderRadius + 'px',
                        padding: a.cardPadding + 'px',
                        boxSizing: 'border-box',
                        borderLeft: `4px solid ${ clr }`,
                    }
                },
                    // Objective header
                    el( 'div', { className: 'bkbg-okr-obj-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
                        el( 'span', { className: 'bkbg-okr-obj-label', style: { color: a.titleColor } }, obj.label ),
                        el( 'span', { className: 'bkbg-okr-obj-pct', style: { color: clr } }, avg + '%' ),
                    ),

                    // Objective progress bar
                    a.showProgress && el( 'div', { style: { marginBottom: 14 } },
                        el( 'div', { style: { height: a.barHeight + 'px', background: a.trackColor, borderRadius: 99 + 'px', overflow: 'hidden' } },
                            el( 'div', { style: { height: '100%', width: avg + '%', background: clr, borderRadius: 99 + 'px', transition: 'width 0.4s' } } )
                        )
                    ),

                    // Key Results
                    el( 'div', { className: 'bkbg-okr-krs', style: { display: 'flex', flexDirection: 'column', gap: 10 } },
                        ( obj.keyResults || [] ).map( ( kr, ki ) => {
                            const stClr = STATUS_COLORS[ kr.status ] || '#6b7280';
                            return el( 'div', { key: ki, className: 'bkbg-okr-kr' },
                                el( 'div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
                                    el( 'span', { className: 'bkbg-okr-kr-label', style: { color: a.textColor } }, kr.label ),
                                    el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 } },
                                        el( 'span', { style: { fontSize: 12, color: a.mutedColor, fontWeight: 600 } }, ( kr.progress || 0 ) + '%' ),
                                        a.showStatus && el( 'span', { style: { fontSize: 11, fontWeight: 600, color: stClr, background: stClr + '18', borderRadius: 99 + 'px', padding: '2px 8px', whiteSpace: 'nowrap' } }, STATUS_LABELS[ kr.status ] || kr.status ),
                                    ),
                                ),
                                a.showProgress && el( 'div', { style: { height: ( a.barHeight - 2 ) + 'px', background: a.trackColor, borderRadius: 99 + 'px', overflow: 'hidden' } },
                                    el( 'div', { style: { height: '100%', width: ( kr.progress || 0 ) + '%', background: stClr, borderRadius: 99 + 'px' } } )
                                ),
                            );
                        } )
                    ),
                );
            } )
        );
    }

    // ── Mutations ─────────────────────────────────────────────────────────────
    function updObj( setAttributes, objectives, oi, field, val ) {
        setAttributes( { objectives: objectives.map( ( o, i ) => i === oi ? { ...o, [field]: val } : o ) } );
    }
    function updKR( setAttributes, objectives, oi, ki, field, val ) {
        setAttributes( { objectives: objectives.map( ( o, i ) => i !== oi ? o : {
            ...o,
            keyResults: ( o.keyResults || [] ).map( ( kr, j ) => j === ki ? { ...kr, [field]: val } : kr ),
        } ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/okr-tracker', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = (function () {
                var bp = useBlockProps( { className: 'bkbg-okr-wrap' } );
                var _tvf = getTypoCssVars();
                var s = { background: a.bgColor, padding: '16px', borderRadius: 8, boxSizing: 'border-box' };
                if (_tvf) {
                    Object.assign(s, _tvf(a.titleTypo, '--bkbg-okr-tt-'));
                    Object.assign(s, _tvf(a.objLabelTypo, '--bkbg-okr-ol-'));
                    Object.assign(s, _tvf(a.krTypo, '--bkbg-okr-kr-'));
                }
                bp.style = Object.assign(s, bp.style || {});
                return bp;
            }());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),    checked: a.showTitle,    onChange: v => setAttributes( { showTitle:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Period', 'blockenberg' ),   checked: a.showPeriod,   onChange: v => setAttributes( { showPeriod:   v } ) } ),
                        a.showPeriod && el( TextControl, { label: __( 'Period Label', 'blockenberg' ), value: a.period, onChange: v => setAttributes( { period: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Progress Bars', 'blockenberg' ), checked: a.showProgress, onChange: v => setAttributes( { showProgress: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Status Badges', 'blockenberg' ),checked: a.showStatus,  onChange: v => setAttributes( { showStatus:  v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Bar Height', 'blockenberg' ),     value: a.barHeight,     onChange: v => setAttributes( { barHeight:     v } ), min: 4, max: 20 } ),
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ),  value: a.borderRadius,  onChange: v => setAttributes( { borderRadius:  v } ), min: 0, max: 24 } ),
                        el( RangeControl, { label: __( 'Card Padding', 'blockenberg' ),   value: a.cardPadding,   onChange: v => setAttributes( { cardPadding:   v } ), min: 8, max: 48 } ),
                    ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTypoControl(), { label: __( 'Title' ), value: a.titleTypo, onChange: v => setAttributes( { titleTypo: v } ) } ),
                        el( getTypoControl(), { label: __( 'Objective Label' ), value: a.objLabelTypo, onChange: v => setAttributes( { objLabelTypo: v } ) } ),
                        el( getTypoControl(), { label: __( 'Key Result' ), value: a.krTypo, onChange: v => setAttributes( { krTypo: v } ) } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Wrapper BG', 'blockenberg' ),  value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Card BG', 'blockenberg' ),     value: a.cardBg,     onChange: v => setAttributes( { cardBg:     v || '#f9fafb' } ) },
                            { label: __( 'Title', 'blockenberg' ),       value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text', 'blockenberg' ),        value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                            { label: __( 'Muted', 'blockenberg' ),       value: a.mutedColor, onChange: v => setAttributes( { mutedColor: v || '#6b7280' } ) },
                            { label: __( 'Track', 'blockenberg' ),       value: a.trackColor, onChange: v => setAttributes( { trackColor: v || '#e5e7eb' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Objectives', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { objectives: [ ...( a.objectives || [] ), { label: 'New Objective', color: '#6366f1', keyResults: [ { label: 'Key Result 1', progress: 0, status: 'on-track' } ] } ] } ) }, __( '+ Add Objective', 'blockenberg' ) ),

                        a.objectives.map( ( obj, oi ) =>
                            el( PanelBody, { key: oi, title: obj.label.length > 30 ? obj.label.slice( 0, 28 ) + '…' : obj.label, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ), value: obj.label, onChange: v => updObj( setAttributes, a.objectives, oi, 'label', v ) } ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12 } }, __( 'Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: obj.color, style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updObj( setAttributes, a.objectives, oi, 'color', e.target.value ) } ),
                                ),
                                el( 'strong', { style: { display: 'block', fontSize: 12, marginBottom: 6 } }, __( 'Key Results', 'blockenberg' ) ),
                                el( Button, { variant: 'secondary', isSmall: true, style: { marginBottom: 8 }, onClick: () => updObj( setAttributes, a.objectives, oi, 'keyResults', [ ...( obj.keyResults || [] ), { label: 'New Key Result', progress: 0, status: 'on-track' } ] ) }, __( '+ Add KR', 'blockenberg' ) ),
                                ( obj.keyResults || [] ).map( ( kr, ki ) =>
                                    el( 'div', { key: ki, style: { background: '#f3f4f6', borderRadius: 6, padding: '10px', marginBottom: 6 } },
                                        el( TextControl, { label: __( 'Label', 'blockenberg' ), value: kr.label, onChange: v => updKR( setAttributes, a.objectives, oi, ki, 'label', v ) } ),
                                        el( RangeControl, { label: __( 'Progress %', 'blockenberg' ), value: kr.progress, onChange: v => updKR( setAttributes, a.objectives, oi, ki, 'progress', v ), min: 0, max: 100 } ),
                                        el( SelectControl, {
                                            label: __( 'Status', 'blockenberg' ),
                                            value: kr.status,
                                            options: [
                                                { label: __( 'On Track', 'blockenberg' ),  value: 'on-track'  },
                                                { label: __( 'At Risk', 'blockenberg' ),   value: 'at-risk'   },
                                                { label: __( 'Off Track', 'blockenberg' ), value: 'off-track' },
                                                { label: __( 'Done', 'blockenberg' ),      value: 'done'      },
                                            ],
                                            onChange: v => updKR( setAttributes, a.objectives, oi, ki, 'status', v ),
                                        } ),
                                        el( Button, { isDestructive: true, isSmall: true, onClick: () => updObj( setAttributes, a.objectives, oi, 'keyResults', ( obj.keyResults || [] ).filter( ( _, j ) => j !== ki ) ) }, __( 'Remove KR', 'blockenberg' ) ),
                                    )
                                ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 6 }, onClick: () => setAttributes( { objectives: a.objectives.filter( ( _, x ) => x !== oi ) } ) }, __( 'Remove Objective', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                // Title & period
                el( 'div', { className: 'bkbg-okr-header', style: { marginBottom: 20 } },
                    a.showTitle && a.title && el( 'h3', { className: 'bkbg-okr-title', style: { color: a.titleColor, margin: '0 0 4px' } }, a.title ),
                    a.showPeriod && a.period && el( 'div', { className: 'bkbg-okr-period', style: { color: a.mutedColor } }, a.period ),
                ),

                renderOKR( a ),
            );
        },

        save: function ( { attributes: a } ) {
            var _tvf = getTypoCssVars();
            var s = { background: a.bgColor, padding: '16px', borderRadius: 8, boxSizing: 'border-box' };
            if (_tvf) {
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-okr-tt-'));
                Object.assign(s, _tvf(a.objLabelTypo, '--bkbg-okr-ol-'));
                Object.assign(s, _tvf(a.krTypo, '--bkbg-okr-kr-'));
            }
            const blockProps = useBlockProps.save( { className: 'bkbg-okr-wrap', style: s } );
            return el( 'div', blockProps,
                el( 'div', { className: 'bkbg-okr-header', style: { marginBottom: 20 } },
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-okr-title', style: { color: a.titleColor, margin: '0 0 4px' } }, a.title ) : null,
                    a.showPeriod && a.period ? el( 'div', { className: 'bkbg-okr-period', style: { color: a.mutedColor } }, a.period ) : null,
                ),
                renderOKR( a ),
            );
        },

        deprecated: [{
            save: function ( { attributes: a } ) {
                const blockProps = useBlockProps.save( { className: 'bkbg-okr-wrap', style: { background: a.bgColor, padding: '16px', borderRadius: 8, boxSizing: 'border-box' } } );
                return el( 'div', blockProps,
                    el( 'div', { className: 'bkbg-okr-header', style: { marginBottom: 20 } },
                        a.showTitle && a.title ? el( 'h3', { className: 'bkbg-okr-title', style: { color: a.titleColor, margin: '0 0 4px', fontSize: ( a.labelFontSize + 4 ) + 'px' } }, a.title ) : null,
                        a.showPeriod && a.period ? el( 'div', { style: { fontSize: a.periodSize || 13, color: a.mutedColor } }, a.period ) : null,
                    ),
                    renderOKR( a ),
                );
            }
        }],
    } );
}() );
