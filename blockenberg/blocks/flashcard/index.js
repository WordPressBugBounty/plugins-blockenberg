( function () {
    var el                 = wp.element.createElement;
    var useEffect          = wp.element.useEffect;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _flTC, _flTV;
    function _tc() { return _flTC || (_flTC = window.bkbgTypographyControl); }
    function _tv() { return _flTV || (_flTV = window.bkbgTypoCssVars); }

    var DEFAULT_CARDS = [
        { id: '1', front: 'What is the capital of France?', back: 'Paris', known: false },
        { id: '2', front: 'What is 7 × 8?', back: '56', known: false },
        { id: '3', front: 'Who wrote Romeo and Juliet?', back: 'William Shakespeare', known: false },
        { id: '4', front: 'What is H₂O?', back: 'Water', known: false },
        { id: '5', front: 'What year did WWII end?', back: '1945', known: false }
    ];

    /**
     * Cards used to be stored as a JSON string. Accept both shapes so older
     * posts keep working and can migrate cleanly.
     */
    function normalizeCards( cards ) {
        if ( Array.isArray( cards ) ) {
            return cards;
        }
        if ( typeof cards === 'string' && cards ) {
            try {
                var parsed = JSON.parse( cards );
                if ( Array.isArray( parsed ) ) {
                    return parsed;
                }
            } catch ( e ) { /* fall through */ }
        }
        return DEFAULT_CARDS.slice();
    }

    /**
     * Only frontend-relevant block attributes — never dump Advanced (bkbg*)
     * attrs or other editor-only noise into data-opts. A full JSON.stringify(a)
     * breaks block validation whenever attributes are added or defaults change.
     */
    function buildFrontendOpts( a ) {
        return {
            title: a.title,
            subtitle: a.subtitle,
            showTitle: a.showTitle,
            showSubtitle: a.showSubtitle,
            cards: normalizeCards( a.cards ),
            showProgress: a.showProgress,
            showShuffleBtn: a.showShuffleBtn,
            showKnownBtn: a.showKnownBtn,
            enableKeyboardShortcuts: a.enableKeyboardShortcuts !== false,
            showKeyboardHint: a.showKeyboardHint,
            cardHeight: a.cardHeight,
            accentColor: a.accentColor,
            cardFrontBg: a.cardFrontBg,
            cardBackBg: a.cardBackBg,
            cardBackColor: a.cardBackColor,
            knownColor: a.knownColor,
            sectionBg: a.sectionBg,
            cardBg: a.cardBg,
            titleColor: a.titleColor,
            subtitleColor: a.subtitleColor,
            labelColor: a.labelColor,
            titleFontSize: a.titleFontSize,
            titleFontWeight: a.titleFontWeight,
            titleLineHeight: a.titleLineHeight,
            subtitleFontSize: a.subtitleFontSize,
            subtitleFontWeight: a.subtitleFontWeight,
            subtitleLineHeight: a.subtitleLineHeight,
            cardFontSize: a.cardFontSize,
            cardFontWeight: a.cardFontWeight,
            cardLineHeight: a.cardLineHeight,
            contentMaxWidth: a.contentMaxWidth,
            typoTitle: a.typoTitle || {},
            typoSubtitle: a.typoSubtitle || {},
            typoCard: a.typoCard || {}
        };
    }

    function saveElement( a ) {
        return el( 'div', useBlockProps.save(),
            el( 'div', {
                className: 'bkbg-fc-app',
                'data-opts': JSON.stringify( buildFrontendOpts( a ) )
            } )
        );
    }

    /**
     * Legacy save: dumped every attribute (including Advanced bkbg* fields).
     * Kept for deprecation matching / migrate path. Still fragile — new saves
     * must never use this.
     */
    function legacySaveAllAttrs( props ) {
        var a = props.attributes;
        var opts = {};
        Object.keys( a ).forEach( function ( key ) {
            // Strip injected Advanced attrs so we can match older dumps that
            // predate / postdate Advanced inconsistently less often.
            if ( key.indexOf( 'bkbg' ) === 0 ) {
                return;
            }
            opts[ key ] = a[ key ];
        } );
        // Legacy posts stored cards as a JSON string inside data-opts.
        if ( Array.isArray( opts.cards ) ) {
            opts.cards = JSON.stringify( opts.cards );
        }
        return el( 'div', useBlockProps.save(),
            el( 'div', {
                className: 'bkbg-fc-app',
                'data-opts': JSON.stringify( opts )
            } )
        );
    }

    registerBlockType( 'blockenberg/flashcard', {
        edit: function ( props ) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var keyboardShortcutsEnabled = a.enableKeyboardShortcuts !== false;
            var wrapStyle = Object.assign( {},
                _tv()( a.typoTitle, '--bkbg-flash-tt-' ),
                _tv()( a.typoSubtitle, '--bkbg-flash-ts-' ),
                _tv()( a.typoCard, '--bkbg-flash-tc-' )
            );
            var blockProps = useBlockProps( { className: 'bkbg-fc-editor-wrap', style: wrapStyle } );

            var cards = normalizeCards( a.cards );

            // One-time migrate: string cards → array attribute.
            useEffect( function () {
                if ( typeof a.cards === 'string' ) {
                    setAttributes( { cards: normalizeCards( a.cards ) } );
                }
            }, [] );

            var containerStyle = {
                background: a.sectionBg,
                borderRadius: '12px',
                padding: '28px',
                maxWidth: a.contentMaxWidth + 'px',
                margin: '0 auto'
            };

            var cardPreviewStyle = {
                background: a.cardFrontBg,
                borderRadius: '12px',
                height: a.cardHeight + 'px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(99,102,241,0.15)',
                color: a.labelColor,
                cursor: 'pointer',
                position: 'relative'
            };

            function addCard() {
                setAttributes( {
                    cards: cards.concat( [ { id: Date.now().toString(), front: 'New question', back: 'Answer', known: false } ] )
                } );
            }

            function removeCard( id ) {
                setAttributes( { cards: cards.filter( function ( c ) { return c.id !== id; } ) } );
            }

            function updateCard( id, field, value ) {
                var updated = cards.map( function ( c ) {
                    if ( c.id !== id ) return c;
                    var n = {};
                    Object.keys( c ).forEach( function ( k ) { n[ k ] = c[ k ]; } );
                    n[ field ] = value;
                    return n;
                } );
                setAttributes( { cards: updated } );
            }

            var TC = _tc();

            return el(
                Fragment,
                null,
                el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: __( 'Content', 'blockenberg' ), initialOpen: true },
                        el( TextControl, {
                            label: __( 'Title', 'blockenberg' ),
                            value: a.title,
                            onChange: function ( v ) { setAttributes( { title: v } ); }
                        } ),
                        el( TextControl, {
                            label: __( 'Subtitle', 'blockenberg' ),
                            value: a.subtitle,
                            onChange: function ( v ) { setAttributes( { subtitle: v } ); }
                        } ),
                        el( ToggleControl, {
                            label: __( 'Show Title', 'blockenberg' ),
                            checked: a.showTitle,
                            onChange: function ( v ) { setAttributes( { showTitle: v } ); },
                            __nextHasNoMarginBottom: true
                        } ),
                        el( ToggleControl, {
                            label: __( 'Show Subtitle', 'blockenberg' ),
                            checked: a.showSubtitle,
                            onChange: function ( v ) { setAttributes( { showSubtitle: v } ); },
                            __nextHasNoMarginBottom: true
                        } )
                    ),
                    el(
                        PanelBody,
                        { title: __( 'Cards', 'blockenberg' ), initialOpen: true },
                        cards.map( function ( card ) {
                            return el(
                                'div',
                                { key: card.id, style: { background: '#f9f9f9', borderRadius: '8px', padding: '12px', marginBottom: '10px', border: '1px solid #e5e7eb' } },
                                el( TextControl, {
                                    label: __( 'Front', 'blockenberg' ),
                                    value: card.front,
                                    onChange: function ( v ) { updateCard( card.id, 'front', v ); }
                                } ),
                                el( TextControl, {
                                    label: __( 'Back', 'blockenberg' ),
                                    value: card.back,
                                    onChange: function ( v ) { updateCard( card.id, 'back', v ); }
                                } ),
                                el(
                                    'button',
                                    {
                                        style: { background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' },
                                        onClick: function () { removeCard( card.id ); }
                                    },
                                    __( 'Remove', 'blockenberg' )
                                )
                            );
                        } ),
                        el(
                            'button',
                            {
                                style: { background: a.accentColor, color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', width: '100%', fontWeight: '600' },
                                onClick: addCard
                            },
                            __( '+ Add Card', 'blockenberg' )
                        )
                    ),
                    el(
                        PanelBody,
                        { title: __( 'Options', 'blockenberg' ), initialOpen: false },
                        el( ToggleControl, {
                            label: __( 'Show Progress Bar', 'blockenberg' ),
                            checked: a.showProgress,
                            onChange: function ( v ) { setAttributes( { showProgress: v } ); },
                            __nextHasNoMarginBottom: true
                        } ),
                        el( ToggleControl, {
                            label: __( 'Show Shuffle Button', 'blockenberg' ),
                            checked: a.showShuffleBtn,
                            onChange: function ( v ) { setAttributes( { showShuffleBtn: v } ); },
                            __nextHasNoMarginBottom: true
                        } ),
                        el( ToggleControl, {
                            label: __( 'Show "Mark Known" Button', 'blockenberg' ),
                            checked: a.showKnownBtn,
                            onChange: function ( v ) { setAttributes( { showKnownBtn: v } ); },
                            __nextHasNoMarginBottom: true
                        } ),
                        el( ToggleControl, {
                            label: __( 'Enable keyboard shortcuts', 'blockenberg' ),
                            checked: keyboardShortcutsEnabled,
                            onChange: function ( v ) { setAttributes( { enableKeyboardShortcuts: v } ); },
                            __nextHasNoMarginBottom: true
                        } ),
                        el( ToggleControl, {
                            label: __( 'Show Keyboard Hint', 'blockenberg' ),
                            checked: a.showKeyboardHint,
                            onChange: function ( v ) { setAttributes( { showKeyboardHint: v } ); },
                            __nextHasNoMarginBottom: true
                        } ),
                        el( RangeControl, {
                            label: __( 'Card Height (px)', 'blockenberg' ),
                            value: a.cardHeight,
                            min: 120,
                            max: 500,
                            onChange: function ( v ) { setAttributes( { cardHeight: v } ); }
                        } )
                    ),
                    el(
                        PanelBody,
                        { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el( TC, { label: __( 'Title', 'blockenberg' ), value: a.typoTitle || {}, onChange: function ( v ) { setAttributes( { typoTitle: v } ); } } ),
                        TC && el( TC, { label: __( 'Subtitle', 'blockenberg' ), value: a.typoSubtitle || {}, onChange: function ( v ) { setAttributes( { typoSubtitle: v } ); } } ),
                        TC && el( TC, { label: __( 'Card Text', 'blockenberg' ), value: a.typoCard || {}, onChange: function ( v ) { setAttributes( { typoCard: v } ); } } )
                    ),
                    el(
                        PanelBody,
                        { title: __( 'Appearance', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, {
                            label: __( 'Max Width (px)', 'blockenberg' ),
                            value: a.contentMaxWidth,
                            min: 320,
                            max: 1200,
                            onChange: function ( v ) { setAttributes( { contentMaxWidth: v } ); }
                        } )
                    ),
                    el(
                        PanelColorSettings,
                        {
                            title: __( 'Colors', 'blockenberg' ),
                            initialOpen: false,
                            colorSettings: [
                                { value: a.accentColor,   onChange: function ( v ) { setAttributes( { accentColor: v || '#6366f1' } ); },   label: __( 'Accent Color', 'blockenberg' ) },
                                { value: a.cardFrontBg,   onChange: function ( v ) { setAttributes( { cardFrontBg: v || '#ffffff' } ); },   label: __( 'Card Front Background', 'blockenberg' ) },
                                { value: a.cardBackBg,    onChange: function ( v ) { setAttributes( { cardBackBg: v || '#4f46e5' } ); },    label: __( 'Card Back Background', 'blockenberg' ) },
                                { value: a.cardBackColor, onChange: function ( v ) { setAttributes( { cardBackColor: v || '#ffffff' } ); }, label: __( 'Card Back Text', 'blockenberg' ) },
                                { value: a.knownColor,    onChange: function ( v ) { setAttributes( { knownColor: v || '#22c55e' } ); },    label: __( 'Known Color', 'blockenberg' ) },
                                { value: a.sectionBg,     onChange: function ( v ) { setAttributes( { sectionBg: v || '#f5f3ff' } ); },     label: __( 'Section Background', 'blockenberg' ) },
                                { value: a.cardBg,        onChange: function ( v ) { setAttributes( { cardBg: v || '#ffffff' } ); },        label: __( 'Controls Background', 'blockenberg' ) },
                                { value: a.titleColor,    onChange: function ( v ) { setAttributes( { titleColor: v || '#3730a3' } ); },    label: __( 'Title Color', 'blockenberg' ) },
                                { value: a.subtitleColor, onChange: function ( v ) { setAttributes( { subtitleColor: v || '#6b7280' } ); }, label: __( 'Subtitle Color', 'blockenberg' ) },
                                { value: a.labelColor,    onChange: function ( v ) { setAttributes( { labelColor: v || '#374151' } ); },    label: __( 'Label Color', 'blockenberg' ) }
                            ]
                        }
                    )
                ),
                el(
                    'div',
                    blockProps,
                    el(
                        'div',
                        { style: containerStyle },
                        a.showTitle && el( 'div', {
                            className: 'bkbg-fc-title',
                            style: { color: a.titleColor, marginBottom: '6px' }
                        }, a.title ),
                        a.showSubtitle && el( 'div', {
                            className: 'bkbg-fc-subtitle',
                            style: { color: a.subtitleColor, marginBottom: '20px' }
                        }, a.subtitle ),
                        a.showProgress && el( 'div', {
                            style: { marginBottom: '16px' }
                        },
                            el( 'div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: a.labelColor, marginBottom: '6px' } },
                                el( 'span', null, __( 'Progress', 'blockenberg' ) ),
                                el( 'span', null, '0 / ' + cards.length + ' known' )
                            ),
                            el( 'div', { style: { height: '8px', background: '#e5e7eb', borderRadius: '4px' } },
                                el( 'div', { style: { height: '100%', width: '0%', background: a.accentColor, borderRadius: '4px' } } )
                            )
                        ),
                        el( 'div', { className: 'bkbg-fc-front', style: cardPreviewStyle },
                            el( 'span', null, cards[ 0 ] ? cards[ 0 ].front : 'No cards yet' )
                        ),
                        el( 'div', { style: { display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px', flexWrap: 'wrap' } },
                            el( 'button', { style: { background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '20px' } }, '←' ),
                            a.showKnownBtn && el( 'button', { style: { background: a.knownColor, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', cursor: 'pointer', fontWeight: '600' } }, '✓ Know it' ),
                            el( 'button', { style: { background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '20px' } }, '→' )
                        ),
                        el( 'div', { style: { textAlign: 'center', marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' } },
                            el( 'span', { style: { color: a.subtitleColor, fontSize: '13px' } }, '1 / ' + cards.length ),
                            a.showShuffleBtn && el( 'button', { style: { background: 'transparent', border: '1px solid ' + a.accentColor, color: a.accentColor, borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' } }, '⇌ Shuffle' ),
                            el( 'button', { style: { background: 'transparent', border: '1px solid #e5e7eb', color: a.subtitleColor, borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' } }, '↺ Reset' )
                        ),
                        keyboardShortcutsEnabled && a.showKeyboardHint && el( 'div', { style: { textAlign: 'center', marginTop: '12px', color: a.subtitleColor, fontSize: '12px' } },
                            '← → Arrow keys to navigate • Space to flip'
                        )
                    )
                )
            );
        },

        save: function ( props ) {
            return saveElement( props.attributes );
        },

        deprecated: [
            {
                attributes: {
                    title: { type: 'string', default: 'Flashcard Deck' },
                    subtitle: { type: 'string', default: 'Click a card to reveal the answer' },
                    showTitle: { type: 'boolean', default: true },
                    showSubtitle: { type: 'boolean', default: true },
                    cards: { type: 'string' },
                    showProgress: { type: 'boolean', default: true },
                    showShuffleBtn: { type: 'boolean', default: true },
                    showKnownBtn: { type: 'boolean', default: true },
                    enableKeyboardShortcuts: { type: 'boolean', default: true },
                    showKeyboardHint: { type: 'boolean', default: true },
                    cardHeight: { type: 'number', default: 220 },
                    accentColor: { type: 'string', default: '#6366f1' },
                    cardFrontBg: { type: 'string', default: '#ffffff' },
                    cardBackBg: { type: 'string', default: '#4f46e5' },
                    cardBackColor: { type: 'string', default: '#ffffff' },
                    knownColor: { type: 'string', default: '#22c55e' },
                    sectionBg: { type: 'string', default: '#f5f3ff' },
                    cardBg: { type: 'string', default: '#ffffff' },
                    titleColor: { type: 'string', default: '#3730a3' },
                    subtitleColor: { type: 'string', default: '#6b7280' },
                    labelColor: { type: 'string', default: '#374151' },
                    titleFontSize: { type: 'number', default: 26 },
                    titleFontWeight: { type: 'string', default: '700' },
                    titleLineHeight: { type: 'number', default: 1.2 },
                    subtitleFontSize: { type: 'number', default: 15 },
                    subtitleFontWeight: { type: 'string', default: '400' },
                    subtitleLineHeight: { type: 'number', default: 1.5 },
                    cardFontSize: { type: 'number', default: 18 },
                    cardFontWeight: { type: 'string', default: '500' },
                    cardLineHeight: { type: 'number', default: 1.5 },
                    contentMaxWidth: { type: 'number', default: 660 },
                    typoTitle: { type: 'object', default: {} },
                    typoSubtitle: { type: 'object', default: {} },
                    typoCard: { type: 'object', default: {} }
                },
                isEligible: function ( attributes ) {
                    return typeof attributes.cards === 'string';
                },
                migrate: function ( attributes ) {
                    var next = {};
                    Object.keys( attributes ).forEach( function ( k ) { next[ k ] = attributes[ k ]; } );
                    next.cards = normalizeCards( attributes.cards );
                    return next;
                },
                save: legacySaveAllAttrs
            },
            {
                attributes: {
                    title: { type: 'string', default: 'Flashcard Deck' },
                    subtitle: { type: 'string', default: 'Click a card to reveal the answer' },
                    showTitle: { type: 'boolean', default: true },
                    showSubtitle: { type: 'boolean', default: true },
                    cards: { type: 'array' },
                    showProgress: { type: 'boolean', default: true },
                    showShuffleBtn: { type: 'boolean', default: true },
                    showKnownBtn: { type: 'boolean', default: true },
                    enableKeyboardShortcuts: { type: 'boolean', default: true },
                    showKeyboardHint: { type: 'boolean', default: true },
                    cardHeight: { type: 'number', default: 220 },
                    accentColor: { type: 'string', default: '#6366f1' },
                    cardFrontBg: { type: 'string', default: '#ffffff' },
                    cardBackBg: { type: 'string', default: '#4f46e5' },
                    cardBackColor: { type: 'string', default: '#ffffff' },
                    knownColor: { type: 'string', default: '#22c55e' },
                    sectionBg: { type: 'string', default: '#f5f3ff' },
                    cardBg: { type: 'string', default: '#ffffff' },
                    titleColor: { type: 'string', default: '#3730a3' },
                    subtitleColor: { type: 'string', default: '#6b7280' },
                    labelColor: { type: 'string', default: '#374151' },
                    titleFontSize: { type: 'number', default: 26 },
                    titleFontWeight: { type: 'string', default: '700' },
                    titleLineHeight: { type: 'number', default: 1.2 },
                    subtitleFontSize: { type: 'number', default: 15 },
                    subtitleFontWeight: { type: 'string', default: '400' },
                    subtitleLineHeight: { type: 'number', default: 1.5 },
                    cardFontSize: { type: 'number', default: 18 },
                    cardFontWeight: { type: 'string', default: '500' },
                    cardLineHeight: { type: 'number', default: 1.5 },
                    contentMaxWidth: { type: 'number', default: 660 },
                    typoTitle: { type: 'object', default: {} },
                    typoSubtitle: { type: 'object', default: {} },
                    typoCard: { type: 'object', default: {} }
                },
                migrate: function ( attributes ) {
                    var next = {};
                    Object.keys( attributes ).forEach( function ( k ) { next[ k ] = attributes[ k ]; } );
                    next.cards = normalizeCards( attributes.cards );
                    return next;
                },
                save: legacySaveAllAttrs
            }
        ]
    } );
}() );
