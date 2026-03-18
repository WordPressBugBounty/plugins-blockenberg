( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Renderer (opts.inlineTypo = true for deprecated save) ────────────────
    function renderThread( a, opts ) {
        opts = opts || {};
        var it = opts.inlineTypo;
        var messages = a.messages || [];
        var R = a.bubbleRadius;

        return el( 'div', { className: 'bkbg-mt-thread', style: { display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 16px' } },
            messages.map( function( msg, mi ) {
                var isSelf = msg.side === 'self';
                var senderSt = { color: a.tsColor, paddingLeft: isSelf ? 0 : 4, paddingRight: isSelf ? 4 : 0 };
                if (it) { senderSt.fontSize = (a.senderNameFontSize || 11); senderSt.fontWeight = 600; }
                var bubbleSt = {
                    background: isSelf ? a.selfBg : a.otherBg,
                    color: isSelf ? a.selfText : a.otherText,
                    padding: '10px 14px',
                    borderRadius: isSelf
                        ? R + 'px ' + R + 'px 4px ' + R + 'px'
                        : R + 'px ' + R + 'px ' + R + 'px 4px',
                    boxShadow: isSelf ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                    wordBreak: 'break-word',
                };
                if (it) { bubbleSt.fontSize = a.fontSize + 'px'; bubbleSt.lineHeight = (a.lineHeight || 1.5); }
                var tsSt = { color: a.tsColor, paddingLeft: isSelf ? 0 : 4, paddingRight: isSelf ? 4 : 0 };
                if (it) { tsSt.fontSize = (a.timestampFontSize || 11); }

                return el( 'div', {
                    key: mi,
                    className: 'bkbg-mt-row',
                    style: { display: 'flex', flexDirection: isSelf ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 10 }
                },
                    a.showAvatars && el( 'div', {
                        className: 'bkbg-mt-avatar',
                        style: {
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: msg.avatarColor || ( isSelf ? a.selfBg : '#94a3b8' ),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 14, color: '#ffffff',
                        }
                    }, ( msg.avatar || msg.sender || '?' ).charAt( 0 ).toUpperCase() ),

                    el( 'div', { className: 'bkbg-mt-bubble-col', style: { display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '70%', alignItems: isSelf ? 'flex-end' : 'flex-start' } },
                        a.showSenderNames && el( 'span', { className: it ? undefined : 'bkbg-mt-sender', style: senderSt }, msg.sender ),
                        el( 'div', { className: 'bkbg-mt-bubble', style: bubbleSt }, msg.text ),
                        a.showTimestamps && msg.time && el( 'span', { className: it ? undefined : 'bkbg-mt-time', style: tsSt }, msg.time ),
                    ),
                );
            } )
        );
    }

    function updMsg( setAttributes, messages, mi, field, val ) {
        setAttributes( { messages: messages.map( ( m, i ) => i === mi ? { ...m, [field]: val } : m ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/message-thread', {
        deprecated: [{
            save: function ( { attributes: a } ) {
                var blockProps = useBlockProps.save( { className: 'bkbg-mt-wrap' } );
                return el( 'div', blockProps,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-mt-title', style: { color: a.titleColor, margin: '0 0 0', padding: '16px 16px 0', fontSize: (a.titleSize || 16), fontWeight: (a.titleFontWeight || 700) } }, a.title ) : null,
                    el( 'div', { className: 'bkbg-mt-container', style: { background: a.bgColor, borderRadius: 12, maxWidth: a.maxWidth + 'px', margin: '0 auto', overflow: 'hidden' } },
                        renderThread( a, { inlineTypo: true } ),
                    ),
                );
            },
        }],
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mt-tt-'));
                Object.assign(s, _tvf(a.bodyTypo, '--bkbg-mt-bd-'));
                Object.assign(s, _tvf(a.metaTypo, '--bkbg-mt-mt-'));
                return { className: 'bkbg-mt-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title (optional)', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),       checked: a.showTitle,       onChange: v => setAttributes( { showTitle:       v } ) } ),
                        el( ToggleControl, { label: __( 'Show Avatars', 'blockenberg' ),     checked: a.showAvatars,     onChange: v => setAttributes( { showAvatars:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Sender Names', 'blockenberg' ),checked: a.showSenderNames, onChange: v => setAttributes( { showSenderNames: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Timestamps', 'blockenberg' ),  checked: a.showTimestamps,  onChange: v => setAttributes( { showTimestamps:  v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Bubble Radius', 'blockenberg' ), value: a.bubbleRadius, onChange: v => setAttributes( { bubbleRadius: v } ), min: 4, max: 28 } ),
                        el( RangeControl, { label: __( 'Max Width', 'blockenberg' ),    value: a.maxWidth,     onChange: v => setAttributes( { maxWidth:     v } ), min: 300, max: 1200, step: 20 } ),
                    ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTypoControl(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el( getTypoControl(), { label: __( 'Body', 'blockenberg' ), value: a.bodyTypo, onChange: function (v) { setAttributes({ bodyTypo: v }); } }),
                        el( getTypoControl(), { label: __( 'Meta', 'blockenberg' ), value: a.metaTypo, onChange: function (v) { setAttributes({ metaTypo: v }); } })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),    value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#f1f5f9' } ) },
                            { label: __( 'Self Bubble', 'blockenberg' ),   value: a.selfBg,     onChange: v => setAttributes( { selfBg:     v || '#6366f1' } ) },
                            { label: __( 'Self Text', 'blockenberg' ),     value: a.selfText,   onChange: v => setAttributes( { selfText:   v || '#ffffff' } ) },
                            { label: __( 'Other Bubble', 'blockenberg' ),  value: a.otherBg,    onChange: v => setAttributes( { otherBg:    v || '#ffffff' } ) },
                            { label: __( 'Other Text', 'blockenberg' ),    value: a.otherText,  onChange: v => setAttributes( { otherText:  v || '#111827' } ) },
                            { label: __( 'Timestamp', 'blockenberg' ),     value: a.tsColor,    onChange: v => setAttributes( { tsColor:    v || '#94a3b8' } ) },
                            { label: __( 'Title', 'blockenberg' ),         value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Messages', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { messages: [ ...( a.messages || [] ), { sender: 'Alice', side: 'other', text: 'New message…', time: '', avatar: 'A', avatarColor: '#10b981' } ] } ) }, __( '+ Add Message', 'blockenberg' ) ),
                        a.messages.map( ( msg, mi ) =>
                            el( PanelBody, { key: mi, title: `${ msg.sender }: ${ ( msg.text || '' ).slice( 0, 24 ) }${ ( msg.text || '' ).length > 24 ? '…' : '' }`, initialOpen: false },
                                el( TextControl, { label: __( 'Sender Name', 'blockenberg' ), value: msg.sender, onChange: v => updMsg( setAttributes, a.messages, mi, 'sender', v ) } ),
                                el( SelectControl, {
                                    label: __( 'Side', 'blockenberg' ),
                                    value: msg.side,
                                    options: [ { label: __( 'Other (left)', 'blockenberg' ), value: 'other' }, { label: __( 'Self (right)', 'blockenberg' ), value: 'self' } ],
                                    onChange: v => updMsg( setAttributes, a.messages, mi, 'side', v ),
                                } ),
                                el( 'div', { style: { marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 } }, __( 'Message', 'blockenberg' ) ),
                                    el( 'textarea', {
                                        value: msg.text,
                                        rows: 3,
                                        onChange: e => updMsg( setAttributes, a.messages, mi, 'text', e.target.value ),
                                        style: { width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', resize: 'vertical', boxSizing: 'border-box' }
                                    } ),
                                ),
                                el( TextControl, { label: __( 'Time', 'blockenberg' ),        value: msg.time,        onChange: v => updMsg( setAttributes, a.messages, mi, 'time', v ) } ),
                                el( TextControl, { label: __( 'Avatar Initial', 'blockenberg' ), value: msg.avatar,   onChange: v => updMsg( setAttributes, a.messages, mi, 'avatar', v ) } ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12 } }, __( 'Avatar Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: msg.avatarColor || '#6b7280', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updMsg( setAttributes, a.messages, mi, 'avatarColor', e.target.value ) } ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { messages: a.messages.filter( ( _, x ) => x !== mi ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-mt-title', style: { color: a.titleColor, margin: '0 0 0', padding: '16px 16px 0' } }, a.title ),

                el( 'div', { className: 'bkbg-mt-container', style: { background: a.bgColor, borderRadius: 12, maxWidth: a.maxWidth + 'px', margin: '0 auto', overflow: 'hidden' } },
                    renderThread( a ),
                ),
            );
        },

        save: function ( { attributes: a } ) {
            var blockProps = useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mt-tt-'));
                Object.assign(s, _tvf(a.bodyTypo, '--bkbg-mt-bd-'));
                Object.assign(s, _tvf(a.metaTypo, '--bkbg-mt-mt-'));
                return { className: 'bkbg-mt-wrap', style: s };
            })());
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-mt-title', style: { color: a.titleColor, margin: '0 0 0', padding: '16px 16px 0' } }, a.title ) : null,
                el( 'div', { className: 'bkbg-mt-container', style: { background: a.bgColor, borderRadius: 12, maxWidth: a.maxWidth + 'px', margin: '0 auto', overflow: 'hidden' } },
                    renderThread( a ),
                ),
            );
        },
    } );
}() );
