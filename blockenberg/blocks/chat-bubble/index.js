(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var MediaUpload = wp.blockEditor.MediaUpload;
        var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var TextareaControl = wp.components.TextareaControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
        function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
        function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

        var CHAT_STYLE_OPTIONS = [
            { label: 'Modern (rounded, colored right)', value: 'modern' },
            { label: 'Classic (minimal borders)', value: 'classic' },
            { label: 'Dark (dark background)', value: 'dark' },
        ];

        function makeId() { return 'm' + Math.random().toString(36).substr(2, 6); }

        function Avatar(props) {
            var msg = props.msg;
            var size = props.size;
            var avatarBg = props.avatarBg;
            if (msg.avatarUrl) {
                return el('img', { src: msg.avatarUrl, alt: msg.senderName, style: { width: size + 'px', height: size + 'px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } });
            }
            return el('div', { style: { width: size + 'px', height: size + 'px', borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.38) + 'px', fontWeight: 700, color: '#374151', flexShrink: 0 } }, (msg.senderInitials || (msg.senderName || 'U').charAt(0)).toUpperCase());
        }

        registerBlockType('blockenberg/chat-bubble', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var messages = attributes.messages;

                var blockProps = useBlockProps({
                    style: Object.assign({ paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined }, _tv(attributes.typoBubble, '--bkbg-cb-b-'))
                });

                function setMsg(id, patch) {
                    setAttributes({ messages: messages.map(function (m) { return m.id === id ? Object.assign({}, m, patch) : m; }) });
                }
                function addMsg() {
                    var isRight = messages.length % 2 !== 0;
                    setAttributes({ messages: messages.concat([{ id: makeId(), side: isRight ? 'right' : 'left', senderName: isRight ? 'Customer' : 'Support', senderInitials: isRight ? 'C' : 'S', avatarUrl: '', avatarId: 0, text: 'New message…', time: '' }]) });
                }
                function removeMsg(id) {
                    if (messages.length <= 1) return;
                    setAttributes({ messages: messages.filter(function (m) { return m.id !== id; }) });
                }

                var isDark = attributes.chatStyle === 'dark';
                var containerBg = isDark ? '#1f2937' : attributes.chatBg;

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Chat Style', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Style preset', 'blockenberg'), value: attributes.chatStyle, options: CHAT_STYLE_OPTIONS, onChange: function (v) { setAttributes({ chatStyle: v }); } }),
                            el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: attributes.maxWidth, min: 280, max: 900, onChange: function (v) { setAttributes({ maxWidth: v }); } }),
                            el(RangeControl, { label: __('Bubble border radius (px)', 'blockenberg'), value: attributes.bubbleRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ bubbleRadius: v }); } }),
                            el(RangeControl, { label: __('Container border radius (px)', 'blockenberg'), value: attributes.containerRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ containerRadius: v }); } }),
                            el(RangeControl, { label: __('Message gap (px)', 'blockenberg'), value: attributes.messageGap, min: 4, max: 40, onChange: function (v) { setAttributes({ messageGap: v }); } }),
                            el(RangeControl, { label: __('Avatar size (px)', 'blockenberg'), value: attributes.avatarSize, min: 24, max: 64, onChange: function (v) { setAttributes({ avatarSize: v }); } }),
                            el(ToggleControl, { label: __('Show avatars', 'blockenberg'), checked: attributes.showAvatars, onChange: function (v) { setAttributes({ showAvatars: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show sender names', 'blockenberg'), checked: attributes.showSenderName, onChange: function (v) { setAttributes({ showSenderName: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show timestamps', 'blockenberg'), checked: attributes.showTimestamp, onChange: function (v) { setAttributes({ showTimestamp: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Typing indicator at end', 'blockenberg'), checked: attributes.typingIndicator, onChange: function (v) { setAttributes({ typingIndicator: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show container border', 'blockenberg'), checked: attributes.showBorder, onChange: function (v) { setAttributes({ showBorder: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        
                        el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                            el(getTypographyControl(), { label: __('Bubble Text', 'blockenberg'), value: attributes.typoBubble, onChange: function (v) { setAttributes({ typoBubble: v }); } })
                        ),
el(PanelColorSettings, {
                            title: __('Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: attributes.leftBubbleBg, onChange: function (v) { setAttributes({ leftBubbleBg: v || '' }); }, label: __('Left bubble background', 'blockenberg') },
                                { value: attributes.leftBubbleColor, onChange: function (v) { setAttributes({ leftBubbleColor: v || '' }); }, label: __('Left bubble text', 'blockenberg') },
                                { value: attributes.rightBubbleBg, onChange: function (v) { setAttributes({ rightBubbleBg: v || '' }); }, label: __('Right bubble background', 'blockenberg') },
                                { value: attributes.rightBubbleColor, onChange: function (v) { setAttributes({ rightBubbleColor: v || '' }); }, label: __('Right bubble text', 'blockenberg') },
                                { value: attributes.avatarBg, onChange: function (v) { setAttributes({ avatarBg: v || '' }); }, label: __('Avatar background', 'blockenberg') },
                                { value: attributes.chatBg, onChange: function (v) { setAttributes({ chatBg: v || '' }); }, label: __('Chat container background', 'blockenberg') },
                                { value: attributes.timeColor, onChange: function (v) { setAttributes({ timeColor: v || '' }); }, label: __('Timestamp color', 'blockenberg') },
                                { value: attributes.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '' }); }, label: __('Container border color', 'blockenberg') },
                                { value: attributes.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '' }); }, label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelBody, { title: __('Messages', 'blockenberg'), initialOpen: false },
                            messages.map(function (msg, idx) {
                                return el(PanelBody, { key: msg.id, title: (msg.senderName || 'Message') + ' #' + (idx + 1), initialOpen: false },
                                    el(SelectControl, { label: __('Side', 'blockenberg'), value: msg.side, options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }], onChange: function (v) { setMsg(msg.id, { side: v }); } }),
                                    el(TextControl, { label: __('Sender name', 'blockenberg'), value: msg.senderName, onChange: function (v) { setMsg(msg.id, { senderName: v }); } }),
                                    el(TextControl, { label: __('Initials (fallback avatar)', 'blockenberg'), value: msg.senderInitials, onChange: function (v) { setMsg(msg.id, { senderInitials: v }); } }),
                                    el(TextareaControl, { label: __('Message text', 'blockenberg'), value: msg.text, rows: 2, onChange: function (v) { setMsg(msg.id, { text: v }); } }),
                                    el(TextControl, { label: __('Timestamp', 'blockenberg'), value: msg.time, placeholder: '9:41 AM', onChange: function (v) { setMsg(msg.id, { time: v }); } }),
                                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Avatar image (optional)', 'blockenberg')),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) { setMsg(msg.id, { avatarUrl: media.url, avatarId: media.id }); },
                                            allowedTypes: ['image'],
                                            value: msg.avatarId,
                                            render: function (ref) {
                                                return el(Button, { onClick: ref.open, variant: 'secondary', size: 'compact', style: { marginBottom: '6px' } },
                                                    msg.avatarUrl ? __('Change avatar', 'blockenberg') : __('Upload avatar', 'blockenberg')
                                                );
                                            }
                                        })
                                    ),
                                    msg.avatarUrl && el(Button, { onClick: function () { setMsg(msg.id, { avatarUrl: '', avatarId: 0 }); }, variant: 'tertiary', size: 'compact', isDestructive: true, style: { display: 'block', marginBottom: '6px' } }, __('Remove avatar', 'blockenberg')),
                                    el(Button, { onClick: function () { removeMsg(msg.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove message', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addMsg, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Message', 'blockenberg'))
                        )
                    ),
                    el('div', blockProps,
                        el('div', { style: { display: 'flex', justifyContent: 'center' } },
                            el('div', {
                                className: 'bkbg-chat-container bkbg-chat-container--' + attributes.chatStyle,
                                style: {
                                    maxWidth: attributes.maxWidth + 'px',
                                    width: '100%',
                                    background: containerBg,
                                    borderRadius: attributes.containerRadius + 'px',
                                    padding: '24px',
                                    border: attributes.showBorder ? '1px solid ' + (isDark ? 'rgba(255,255,255,0.1)' : attributes.borderColor) : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: attributes.messageGap + 'px',
                                }
                            },
                                messages.map(function (msg) {
                                    var isRight = msg.side === 'right';
                                    var bubbleBg = isRight ? attributes.rightBubbleBg : attributes.leftBubbleBg;
                                    var bubbleColor = isRight ? attributes.rightBubbleColor : attributes.leftBubbleColor;
                                    if (isDark && !isRight) { bubbleBg = '#374151'; bubbleColor = '#f9fafb'; }
                                    return el('div', { key: msg.id, className: 'bkbg-chat-msg' + (isRight ? ' bkbg-chat-msg--right' : ''), style: { display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px' } },
                                        attributes.showAvatars && el(Avatar, { msg: msg, size: attributes.avatarSize, avatarBg: attributes.avatarBg }),
                                        el('div', { style: { maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', gap: '3px' } },
                                            attributes.showSenderName && msg.senderName && el('p', { style: { fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : attributes.timeColor, margin: 0, fontWeight: 600 } }, msg.senderName),
                                            el('div', { className: 'bkbg-chat-bubble', style: { background: bubbleBg, color: bubbleColor, borderRadius: attributes.bubbleRadius + 'px', padding: '10px 14px' } }, msg.text),
                                            attributes.showTimestamp && msg.time && el('p', { style: { fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.4)' : attributes.timeColor, margin: 0 } }, msg.time)
                                        )
                                    );
                                }),
                                attributes.typingIndicator && el('div', { className: 'bkbg-chat-msg', style: { display: 'flex', alignItems: 'flex-end', gap: '8px' } },
                                    el('div', { style: { width: attributes.avatarSize + 'px', height: attributes.avatarSize + 'px', borderRadius: '50%', background: isDark ? '#374151' : attributes.avatarBg } }),
                                    el('div', { className: 'bkbg-typing-indicator', style: { background: isDark ? '#374151' : attributes.leftBubbleBg, borderRadius: attributes.bubbleRadius + 'px', padding: '10px 16px', display: 'flex', gap: '4px', alignItems: 'center' } },
                                        el('span', { className: 'bkbg-dot' }),
                                        el('span', { className: 'bkbg-dot' }),
                                        el('span', { className: 'bkbg-dot' })
                                    )
                                )
                            )
                        )
                    )
                );
            },

            save: function (props) {
                var attributes = props.attributes;
                var messages = attributes.messages;
                var isDark = attributes.chatStyle === 'dark';
                var containerBg = isDark ? '#1f2937' : attributes.chatBg;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-chat-bubble-wrap' });

                return el('div', Object.assign({}, blockProps, { style: Object.assign({ paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined }, _tv(attributes.typoBubble, '--bkbg-cb-b-')) }),
                    el('div', { style: { display: 'flex', justifyContent: 'center' } },
                        el('div', {
                            className: 'bkbg-chat-container bkbg-chat-container--' + attributes.chatStyle,
                            style: {
                                maxWidth: attributes.maxWidth + 'px',
                                width: '100%',
                                background: containerBg,
                                borderRadius: attributes.containerRadius + 'px',
                                padding: '24px',
                                border: attributes.showBorder ? '1px solid ' + (isDark ? 'rgba(255,255,255,0.1)' : attributes.borderColor) : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: attributes.messageGap + 'px',
                            }
                        },
                            messages.map(function (msg) {
                                var isRight = msg.side === 'right';
                                var bubbleBg = isRight ? attributes.rightBubbleBg : attributes.leftBubbleBg;
                                var bubbleColor = isRight ? attributes.rightBubbleColor : attributes.leftBubbleColor;
                                if (isDark && !isRight) { bubbleBg = '#374151'; bubbleColor = '#f9fafb'; }
                                var avatarEl = attributes.showAvatars
                                    ? (msg.avatarUrl
                                        ? el('img', { src: msg.avatarUrl, alt: msg.senderName, className: 'bkbg-chat-avatar', style: { width: attributes.avatarSize + 'px', height: attributes.avatarSize + 'px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } })
                                        : el('div', { className: 'bkbg-chat-avatar', style: { width: attributes.avatarSize + 'px', height: attributes.avatarSize + 'px', borderRadius: '50%', background: attributes.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(attributes.avatarSize * 0.38) + 'px', fontWeight: 700, color: '#374151', flexShrink: 0 } }, (msg.senderInitials || (msg.senderName || 'U').charAt(0)).toUpperCase()))
                                    : null;
                                return el('div', { key: msg.id, className: 'bkbg-chat-msg' + (isRight ? ' bkbg-chat-msg--right' : ''), style: { display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px' } },
                                    avatarEl,
                                    el('div', { style: { maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isRight ? 'flex-end' : 'flex-start', gap: '3px' } },
                                        attributes.showSenderName && msg.senderName && el('p', { className: 'bkbg-chat-sender', style: { fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : attributes.timeColor, margin: 0, fontWeight: 600 } }, msg.senderName),
                                        el('div', { className: 'bkbg-chat-bubble', style: { background: bubbleBg, color: bubbleColor, borderRadius: attributes.bubbleRadius + 'px', padding: '10px 14px' } }, msg.text),
                                        attributes.showTimestamp && msg.time && el('p', { className: 'bkbg-chat-time', style: { fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.4)' : attributes.timeColor, margin: 0 } }, msg.time)
                                    )
                                );
                            }),
                            attributes.typingIndicator && el('div', { className: 'bkbg-chat-msg', style: { display: 'flex', alignItems: 'flex-end', gap: '8px' } },
                                el('div', { style: { width: attributes.avatarSize + 'px', height: attributes.avatarSize + 'px', borderRadius: '50%', background: isDark ? '#374151' : attributes.avatarBg } }),
                                el('div', { className: 'bkbg-typing-indicator', style: { background: isDark ? '#374151' : attributes.leftBubbleBg, borderRadius: attributes.bubbleRadius + 'px', padding: '10px 16px', display: 'flex', gap: '4px', alignItems: 'center' } },
                                    el('span', { className: 'bkbg-dot' }),
                                    el('span', { className: 'bkbg-dot' }),
                                    el('span', { className: 'bkbg-dot' })
                                )
                            )
                        )
                    )
                );
            }
        });
}());
