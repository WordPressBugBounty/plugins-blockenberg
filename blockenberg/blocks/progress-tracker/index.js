( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    let _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    let _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderTracker( a ) {
        const steps = a.steps || [];
        if ( ! steps.length ) return el( 'svg', { width: '100%', viewBox: `0 0 ${ a.svgWidth } 60` } );

        const W     = a.svgWidth;
        const R     = a.dotRadius;
        const LW    = a.lineWidth;
        const PAD   = R + 20;
        const usableW = W - PAD * 2;
        const labelFS = (a.labelTypo && a.labelTypo.sizeDesktop) || 13;
        const labelFW = (a.labelTypo && a.labelTypo.weight) || 600;
        const descFS  = (a.descTypo && a.descTypo.sizeDesktop) || 11;
        const descFW  = (a.descTypo && a.descTypo.weight) || 400;
        const dotY    = a.showDates ? R + 28 : R + 8;
        const descH   = a.showDescriptions ? descFS + 8 : 0;
        const labelH  = labelFS + 6;
        const totalH  = dotY + R + labelH + descH + ( a.showDates ? 0 : 0 ) + 20;

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: totalH, fill: a.bgColor, rx: 8 } ) );

        const stepX = steps.map( ( _, i ) => PAD + ( i / Math.max( steps.length - 1, 1 ) ) * usableW );

        // Connector lines between dots
        steps.forEach( ( step, i ) => {
            if ( i === steps.length - 1 ) return;
            const x1 = stepX[ i ] + R;
            const x2 = stepX[ i + 1 ] - R;

            // Completed segment = both endpoints done
            const bothDone = step.status === 'done' && steps[ i + 1 ].status === 'done';
            const leftDone = step.status === 'done' && steps[ i + 1 ].status === 'active';
            const midX = ( x1 + x2 ) / 2;

            if ( bothDone ) {
                svgEls.push( el( 'line', { key: `ln${ i }`, x1, y1: dotY, x2, y2: dotY, stroke: a.completedColor, strokeWidth: LW } ) );
            } else if ( leftDone ) {
                svgEls.push( el( 'line', { key: `lna${ i }`, x1, y1: dotY, x2: midX, y2: dotY, stroke: a.completedColor, strokeWidth: LW } ) );
                svgEls.push( el( 'line', { key: `lnb${ i }`, x1: midX, y1: dotY, x2, y2: dotY, stroke: a.pendingColor, strokeWidth: LW } ) );
            } else {
                svgEls.push( el( 'line', { key: `ln${ i }`, x1, y1: dotY, x2, y2: dotY, stroke: a.pendingColor, strokeWidth: LW } ) );
            }
        } );

        // Dots + labels
        steps.forEach( ( step, i ) => {
            const cx = stepX[ i ];
            const fillColor = step.status === 'done' ? a.completedColor : step.status === 'active' ? a.activeColor : a.pendingColor;
            const iconColor = step.status === 'pending' ? '#9ca3af' : '#ffffff';

            // Date above
            if ( a.showDates && step.date ) {
                svgEls.push( el( 'text', { key: `dt${ i }`, x: cx, y: dotY - R - 6, textAnchor: 'middle', fill: a.textColor, className: 'bkbg-trk-step-date', fillOpacity: 0.7 }, step.date ) );
            }

            // Shadow
            svgEls.push( el( 'circle', { key: `sh${ i }`, cx: cx + 2, cy: dotY + 2, r: R, fill: 'rgba(0,0,0,0.10)' } ) );
            // Dot
            svgEls.push( el( 'circle', { key: `dot${ i }`, cx, cy: dotY, r: R, fill: fillColor, stroke: '#fff', strokeWidth: 2 } ) );

            // Icon: checkmark for done, number for others
            if ( step.status === 'done' ) {
                const csz = R * 0.55;
                svgEls.push( el( 'polyline', { key: `ck${ i }`, points: `${ cx - csz * 0.55 } ${ dotY }, ${ cx - csz * 0.1 } ${ dotY + csz * 0.5 }, ${ cx + csz * 0.65 } ${ dotY - csz * 0.55 }`, stroke: '#ffffff', strokeWidth: R * 0.18, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } ) );
            } else if ( step.status === 'active' ) {
                svgEls.push( el( 'circle', { key: `act${ i }`, cx, cy: dotY, r: R * 0.4, fill: '#ffffff', fillOpacity: 0.85 } ) );
            } else {
                svgEls.push( el( 'text', { key: `num${ i }`, x: cx, y: dotY, textAnchor: 'middle', dominantBaseline: 'middle', fill: iconColor, className: 'bkbg-trk-step-num' }, String( i + 1 ) ) );
            }

            // Step label
svgEls.push( el( 'text', { key: `lbl${ i }`, x: cx, y: dotY + R + labelFS, textAnchor: 'middle', fill: a.textColor, className: 'bkbg-trk-step-label' }, step.label ) );

            // Description
            if ( a.showDescriptions && step.description ) {
                svgEls.push( el( 'text', { key: `desc${ i }`, x: cx, y: dotY + R + labelFS + descFS + 4, textAnchor: 'middle', fill: a.textColor, className: 'bkbg-trk-step-desc', fillOpacity: 0.65 }, step.description ) );
            }
        } );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ totalH }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updStep( setAttributes, steps, si, field, val ) {
        setAttributes( { steps: steps.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }

    registerBlockType( 'blockenberg/progress-tracker', {
        deprecated: [{
            attributes: {
                title: { type: 'string', default: 'Q1 2025 Objectives' },
                showTitle: { type: 'boolean', default: true },
                svgWidth: { type: 'number', default: 680 },
                dotRadius: { type: 'number', default: 18 },
                lineWidth: { type: 'number', default: 5 },
                showDates: { type: 'boolean', default: true },
                showDescriptions: { type: 'boolean', default: true },
                labelFontSize: { type: 'number', default: 13 },
                labelFontWeight: { type: 'number', default: 600 },
                labelLineHeight: { type: 'number', default: 1.4 },
                descFontSize: { type: 'number', default: 11 },
                descFontWeight: { type: 'number', default: 400 },
                descLineHeight: { type: 'number', default: 1.4 },
                completedColor: { type: 'string', default: '#10b981' },
                activeColor: { type: 'string', default: '#6366f1' },
                pendingColor: { type: 'string', default: '#d1d5db' },
                bgColor: { type: 'string', default: '#ffffff' },
                textColor: { type: 'string', default: '#374151' },
                titleColor: { type: 'string', default: '#111827' },
                steps: { type: 'array', default: [
                    { label: 'Planning', description: 'Define scope & roadmap', date: 'Jan 5', status: 'done' },
                    { label: 'Design', description: 'UX mockups & prototypes', date: 'Jan 20', status: 'done' },
                    { label: 'Development', description: 'Build core features', date: 'Feb 15', status: 'active' },
                    { label: 'QA Testing', description: 'Bug fixes & performance', date: 'Mar 5', status: 'pending' },
                    { label: 'Launch', description: 'Deploy to production', date: 'Mar 20', status: 'pending' }
                ]}
            },
            save: function ( { attributes: a } ) {
                const blockProps = useBlockProps.save( { className: 'bkbg-tracker-wrap' } );
                function renderTrackerV1( a ) {
                    const steps = a.steps || [];
                    if ( ! steps.length ) return el( 'svg', { width: '100%', viewBox: `0 0 ${ a.svgWidth } 60` } );
                    const W = a.svgWidth, R = a.dotRadius, LW = a.lineWidth, PAD = R + 20;
                    const usableW = W - PAD * 2;
                    const dotY = a.showDates ? R + 28 : R + 8;
                    const descH = a.showDescriptions ? a.descFontSize + 8 : 0;
                    const labelH = a.labelFontSize + 6;
                    const totalH = dotY + R + labelH + descH + 20;
                    const svgEls = [];
                    svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: totalH, fill: a.bgColor, rx: 8 } ) );
                    const stepX = steps.map( ( _, i ) => PAD + ( i / Math.max( steps.length - 1, 1 ) ) * usableW );
                    steps.forEach( ( step, i ) => {
                        if ( i === steps.length - 1 ) return;
                        const x1 = stepX[ i ] + R, x2 = stepX[ i + 1 ] - R;
                        const bothDone = step.status === 'done' && steps[ i + 1 ].status === 'done';
                        const leftDone = step.status === 'done' && steps[ i + 1 ].status === 'active';
                        const midX = ( x1 + x2 ) / 2;
                        if ( bothDone ) {
                            svgEls.push( el( 'line', { key: `ln${ i }`, x1, y1: dotY, x2, y2: dotY, stroke: a.completedColor, strokeWidth: LW } ) );
                        } else if ( leftDone ) {
                            svgEls.push( el( 'line', { key: `lna${ i }`, x1, y1: dotY, x2: midX, y2: dotY, stroke: a.completedColor, strokeWidth: LW } ) );
                            svgEls.push( el( 'line', { key: `lnb${ i }`, x1: midX, y1: dotY, x2, y2: dotY, stroke: a.pendingColor, strokeWidth: LW } ) );
                        } else {
                            svgEls.push( el( 'line', { key: `ln${ i }`, x1, y1: dotY, x2, y2: dotY, stroke: a.pendingColor, strokeWidth: LW } ) );
                        }
                    } );
                    steps.forEach( ( step, i ) => {
                        const cx = stepX[ i ];
                        const fillColor = step.status === 'done' ? a.completedColor : step.status === 'active' ? a.activeColor : a.pendingColor;
                        const iconColor = step.status === 'pending' ? '#9ca3af' : '#ffffff';
                        if ( a.showDates && step.date ) {
                            svgEls.push( el( 'text', { key: `dt${ i }`, x: cx, y: dotY - R - 6, textAnchor: 'middle', fill: a.textColor, fontSize: a.descFontSize, fontFamily: 'inherit', fillOpacity: 0.7 }, step.date ) );
                        }
                        svgEls.push( el( 'circle', { key: `sh${ i }`, cx: cx + 2, cy: dotY + 2, r: R, fill: 'rgba(0,0,0,0.10)' } ) );
                        svgEls.push( el( 'circle', { key: `dot${ i }`, cx, cy: dotY, r: R, fill: fillColor, stroke: '#fff', strokeWidth: 2 } ) );
                        if ( step.status === 'done' ) {
                            const csz = R * 0.55;
                            svgEls.push( el( 'polyline', { key: `ck${ i }`, points: `${ cx - csz * 0.55 } ${ dotY }, ${ cx - csz * 0.1 } ${ dotY + csz * 0.5 }, ${ cx + csz * 0.65 } ${ dotY - csz * 0.55 }`, stroke: '#ffffff', strokeWidth: R * 0.18, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } ) );
                        } else if ( step.status === 'active' ) {
                            svgEls.push( el( 'circle', { key: `act${ i }`, cx, cy: dotY, r: R * 0.4, fill: '#ffffff', fillOpacity: 0.85 } ) );
                        } else {
                            svgEls.push( el( 'text', { key: `num${ i }`, x: cx, y: dotY, textAnchor: 'middle', dominantBaseline: 'middle', fill: iconColor, fontSize: a.descFontSize, fontFamily: 'inherit', fontWeight: a.descFontWeight }, String( i + 1 ) ) );
                        }
                        svgEls.push( el( 'text', { key: `lbl${ i }`, x: cx, y: dotY + R + a.labelFontSize, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: a.labelFontWeight }, step.label ) );
                        if ( a.showDescriptions && step.description ) {
                            svgEls.push( el( 'text', { key: `desc${ i }`, x: cx, y: dotY + R + a.labelFontSize + a.descFontSize + 4, textAnchor: 'middle', fill: a.textColor, fontSize: a.descFontSize, fontFamily: 'inherit', fillOpacity: 0.65 }, step.description ) );
                        }
                    } );
                    return el( 'svg', { viewBox: `0 0 ${ W } ${ totalH }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
                }
                return el( 'div', blockProps,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-tracker-title', style: { color: a.titleColor } }, a.title ) : null,
                    el( 'div', { className: 'bkbg-tracker-svg' }, renderTrackerV1( a ) ),
                );
            }
        }],

        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const TC = getTypoControl();
            const blockProps = useBlockProps((function () {
                const _tv = getTypoCssVars();
                const s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-trk-tt-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkbg-trk-lb-'));
                    Object.assign(s, _tv(a.descTypo || {}, '--bkbg-trk-ds-'));
                }
                return { className: 'bkbg-tracker-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),        checked: a.showTitle,        onChange: v => setAttributes( { showTitle:        v } ) } ),
                        el( ToggleControl, { label: __( 'Show Dates', 'blockenberg' ),        checked: a.showDates,        onChange: v => setAttributes( { showDates:        v } ) } ),
                        el( ToggleControl, { label: __( 'Show Descriptions', 'blockenberg' ), checked: a.showDescriptions, onChange: v => setAttributes( { showDescriptions: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),   value: a.svgWidth,     onChange: v => setAttributes( { svgWidth:     v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),     value: a.dotRadius,    onChange: v => setAttributes( { dotRadius:    v } ), min: 10, max: 40 } ),
                        el( RangeControl, { label: __( 'Line Width', 'blockenberg' ),     value: a.lineWidth,    onChange: v => setAttributes( { lineWidth:    v } ), min: 2, max: 12 } ),
                    ),


                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: v => setAttributes({ titleTypo: v }) }),
                        TC && el(TC, { label: __('Step Label', 'blockenberg'), value: a.labelTypo || {}, onChange: v => setAttributes({ labelTypo: v }) }),
                        TC && el(TC, { label: __('Step Description', 'blockenberg'), value: a.descTypo || {}, onChange: v => setAttributes({ descTypo: v }) })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),      value: a.bgColor,        onChange: v => setAttributes( { bgColor:        v || '#ffffff' } ) },
                            { label: __( 'Completed',  'blockenberg' ),      value: a.completedColor, onChange: v => setAttributes( { completedColor: v || '#10b981' } ) },
                            { label: __( 'Active',     'blockenberg' ),      value: a.activeColor,    onChange: v => setAttributes( { activeColor:    v || '#6366f1' } ) },
                            { label: __( 'Pending',    'blockenberg' ),      value: a.pendingColor,   onChange: v => setAttributes( { pendingColor:   v || '#d1d5db' } ) },
                            { label: __( 'Text',       'blockenberg' ),      value: a.textColor,      onChange: v => setAttributes( { textColor:      v || '#374151' } ) },
                            { label: __( 'Title',      'blockenberg' ),      value: a.titleColor,     onChange: v => setAttributes( { titleColor:     v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Steps', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { steps: [ ...( a.steps || [] ), { label: 'New Milestone', description: '', date: '', status: 'pending' } ] } ) }, __( '+ Add Step', 'blockenberg' ) ),
                        a.steps.map( ( step, si ) =>
                            el( PanelBody, { key: si, title: `${ si + 1 }. ${ step.label }`, initialOpen: false },
                                el( TextControl,   { label: __( 'Label', 'blockenberg' ),       value: step.label,       onChange: v => updStep( setAttributes, a.steps, si, 'label',       v ) } ),
                                el( TextControl,   { label: __( 'Date', 'blockenberg' ),        value: step.date,        onChange: v => updStep( setAttributes, a.steps, si, 'date',        v ) } ),
                                el( TextControl,   { label: __( 'Description', 'blockenberg' ), value: step.description, onChange: v => updStep( setAttributes, a.steps, si, 'description', v ) } ),
                                el( SelectControl, {
                                    label: __( 'Status', 'blockenberg' ),
                                    value: step.status,
                                    options: [ { label: __( 'Done', 'blockenberg' ), value: 'done' }, { label: __( 'Active', 'blockenberg' ), value: 'active' }, { label: __( 'Pending', 'blockenberg' ), value: 'pending' } ],
                                    onChange: v => updStep( setAttributes, a.steps, si, 'status', v ),
                                } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { steps: a.steps.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove Step', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-tracker-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-tracker-svg' }, renderTracker( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save((function () {
                const _tv = getTypoCssVars();
                const s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-trk-tt-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkbg-trk-lb-'));
                    Object.assign(s, _tv(a.descTypo || {}, '--bkbg-trk-ds-'));
                }
                return { className: 'bkbg-tracker-wrap', style: s };
            })());
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-tracker-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-tracker-svg' }, renderTracker( a ) ),
            );
        },
    } );
}() );
