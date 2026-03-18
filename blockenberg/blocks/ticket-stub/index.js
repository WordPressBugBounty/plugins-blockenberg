( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, TextControl, ToggleControl } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };
    const IP = function () { return window.bkbgIconPicker; };

    function renderIconPart(type, charVal, dashicon, imageUrl, dashiconColor, forSave) {
        if (!type || type === 'custom-char') return charVal;
        var fn = forSave ? IP().buildSaveIcon : IP().buildEditorIcon;
        return fn(type, charVal, dashicon, imageUrl, dashiconColor);
    }

    // ── Barcode generator (deterministic from ticket number string) ───────────
    function makeBarcode( str ) {
        const src  = ( str || 'TICKET' ).replace( /\W/g, '' ).toUpperCase().padEnd( 20, '0' );
        const bars = [];
        for ( let i = 0; i < 32; i++ ) {
            const code = src.charCodeAt( i % src.length );
            bars.push( {
                w:    ( ( code * 7 + i * 13 ) % 3 ) + 1,      // width 1–3
                dark: ( ( code + i * 5 ) % 4 ) !== 0,          // ~75% dark
            } );
        }
        return bars;
    }

    // ── Render ticket ─────────────────────────────────────────────────────────
    function renderTicket( a, forSave ) {
        const barcode = makeBarcode( a.ticketNumber );

        const detailItem = ( label, value ) =>
            el( 'div', { className: 'bkbg-ts-detail' },
                el( 'span', { className: 'bkbg-ts-detail-label' }, label ),
                el( 'span', { className: 'bkbg-ts-detail-value' }, value ),
            );

        const stubRow = ( label, value ) =>
            el( 'div', { className: 'bkbg-ts-stub-row' },
                el( 'span', { className: 'bkbg-ts-stub-label' }, label ),
                el( 'span', { className: 'bkbg-ts-stub-value' }, value ),
            );

        return el( 'div', { className: 'bkbg-ticket', style: { background: a.bgColor, color: a.textColor } },

            // ── Main body ────────────────────────────────────────────────────
            el( 'div', { className: 'bkbg-ts-main' },

                // Header: emoji logo + event name
                el( 'div', { className: 'bkbg-ts-header' },
                    el( 'div', { className: 'bkbg-ts-logo', style: { background: a.accentColor } }, renderIconPart(a.logoEmojiType, a.logoEmoji || '🎫', a.logoEmojiDashicon, a.logoEmojiImageUrl, a.logoEmojiDashiconColor, forSave) ),
                    el( 'div', { className: 'bkbg-ts-event' },
                        el( 'h2', { className: 'bkbg-ts-event-name' }, a.eventName || '' ),
                        a.tagline && el( 'p', { className: 'bkbg-ts-tagline', style: { color: a.accentColor } }, a.tagline ),
                    ),
                ),

                // Accent stripe
                el( 'div', { className: 'bkbg-ts-stripe', style: { background: `linear-gradient(90deg, ${ a.accentColor } 0%, transparent 100%)` } } ),

                // Details grid
                el( 'div', { className: 'bkbg-ts-details' },
                    detailItem( __( 'DATE', 'blockenberg' ),  a.eventDate ),
                    detailItem( __( 'TIME', 'blockenberg' ),  a.eventTime ),
                    detailItem( __( 'VENUE', 'blockenberg' ), a.venue ),
                    a.showPrice && detailItem( __( 'PRICE', 'blockenberg' ), a.price ),
                ),
            ),

            // ── Perforated divider ───────────────────────────────────────────
            el( 'div', { className: 'bkbg-ts-perf', style: { borderColor: a.accentColor } },
                el( 'div', { className: 'bkbg-ts-notch bkbg-ts-notch-top',    style: { background: 'inherit' } } ),
                el( 'div', { className: 'bkbg-ts-notch bkbg-ts-notch-bottom', style: { background: 'inherit' } } ),
            ),

            // ── Stub ─────────────────────────────────────────────────────────
            el( 'div', { className: 'bkbg-ts-stub', style: { background: a.stubBg } },

                // Seat info
                el( 'div', { className: 'bkbg-ts-stub-info' },
                    a.showSection && stubRow( __( 'SEC', 'blockenberg' ),  a.seatSection ),
                    stubRow( __( 'ROW', 'blockenberg' ),  a.seatRow ),
                    stubRow( __( 'SEAT', 'blockenberg' ), a.seatNumber ),
                ),

                // Barcode
                a.showBarcode && el( 'div', { className: 'bkbg-ts-barcode' },
                    barcode.map( ( bar, i ) =>
                        el( 'div', {
                            key: i,
                            className: 'bkbg-ts-bar',
                            style: {
                                width: bar.w + 'px',
                                background: bar.dark ? a.textColor : 'transparent',
                            }
                        } )
                    )
                ),

                // Ticket number
                el( 'div', { className: 'bkbg-ts-num', style: { color: a.accentColor } }, a.ticketNumber ),
            ),
        );
    }

    // ── Block registration ────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/ticket-stub', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktks-tt-'), _tvf(a.bodyTypo, '--bktks-bt-'));
                return { className: 'bkbg-ticket-stub-wrap', style: tv };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Event Info', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Event Name', 'blockenberg' ),   value: a.eventName,    onChange: v => setAttributes( { eventName: v } ) } ),
                        el( TextControl, { label: __( 'Tagline', 'blockenberg' ),      value: a.tagline,      onChange: v => setAttributes( { tagline: v } ) } ),
                        el( TextControl, { label: __( 'Date', 'blockenberg' ),         value: a.eventDate,    onChange: v => setAttributes( { eventDate: v } ) } ),
                        el( TextControl, { label: __( 'Time', 'blockenberg' ),         value: a.eventTime,    onChange: v => setAttributes( { eventTime: v } ) } ),
                        el( TextControl, { label: __( 'Venue', 'blockenberg' ),        value: a.venue,        onChange: v => setAttributes( { venue: v } ) } ),
                        el( TextControl, { label: __( 'Price', 'blockenberg' ),        value: a.price,        onChange: v => setAttributes( { price: v } ) } ),
                        el( IP().IconPickerControl, IP().iconPickerProps( a, setAttributes, { charAttr: 'logoEmoji', typeAttr: 'logoEmojiType', dashiconAttr: 'logoEmojiDashicon', imageUrlAttr: 'logoEmojiImageUrl', colorAttr: 'logoEmojiDashiconColor' } ) ),
                    ),

                    el( PanelBody, { title: __( 'Stub / Seat', 'blockenberg' ), initialOpen: false },
                        el( TextControl, { label: __( 'Section', 'blockenberg' ),      value: a.seatSection,  onChange: v => setAttributes( { seatSection: v } ) } ),
                        el( TextControl, { label: __( 'Row', 'blockenberg' ),          value: a.seatRow,      onChange: v => setAttributes( { seatRow: v } ) } ),
                        el( TextControl, { label: __( 'Seat', 'blockenberg' ),         value: a.seatNumber,   onChange: v => setAttributes( { seatNumber: v } ) } ),
                        el( TextControl, { label: __( 'Ticket Number', 'blockenberg' ), value: a.ticketNumber, onChange: v => setAttributes( { ticketNumber: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Price', 'blockenberg' ),   checked: a.showPrice,   onChange: v => setAttributes( { showPrice: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Section', 'blockenberg' ), checked: a.showSection, onChange: v => setAttributes( { showSection: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Barcode', 'blockenberg' ), checked: a.showBarcode, onChange: v => setAttributes( { showBarcode: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Event Name Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { setAttributes({ titleTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Body Typography', 'blockenberg'),
                            value: a.bodyTypo || {},
                            onChange: function (v) { setAttributes({ bodyTypo: v }); }
                        })
                    ),

                    el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ),
                        initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),    value: a.bgColor,     onChange: v => setAttributes( { bgColor:     v || '#1e1b4b' } ) },
                            { label: __( 'Stub Background', 'blockenberg' ), value: a.stubBg,    onChange: v => setAttributes( { stubBg:     v || '#4c1d95' } ) },
                            { label: __( 'Accent Color', 'blockenberg' ),  value: a.accentColor, onChange: v => setAttributes( { accentColor: v || '#6d28d9' } ) },
                            { label: __( 'Text Color', 'blockenberg' ),    value: a.textColor,   onChange: v => setAttributes( { textColor:   v || '#ffffff' } ) },
                        ]
                    } ),
                ),

                renderTicket( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( (function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktks-tt-'), _tvf(a.bodyTypo, '--bktks-bt-'));
                return { className: 'bkbg-ticket-stub-wrap', style: tv };
            })() );
            return el( 'div', blockProps, renderTicket( a, true ) );
        },
    } );
}() );
