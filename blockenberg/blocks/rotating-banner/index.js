( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function moveItem(arr, from, to) {
        var a = arr.slice();
        var item = a.splice(from, 1)[0];
        a.splice(to, 0, item);
        return a;
    }

    /* ── BannerPreview – shows the active message ── */
    function BannerPreview(props) {
        var a = props.attributes;
        var activeIdx = props.activeIdx;
        var setActiveIdx = props.setActiveIdx;
        var msgs = a.messages || [];

        if (msgs.length === 0) {
            return el('div', { style: { height: a.height + 'px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px' } }, 'Add a message in the sidebar');
        }

        var msg = msgs[Math.min(activeIdx, msgs.length - 1)];

        return el('div', {
            style: {
                background: msg.bgColor || '#6366f1',
                color: msg.textColor || '#fff',
                height: a.height + 'px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                padding: '0 ' + (a.showArrows ? '48px' : '16px'),
                boxSizing: 'border-box'
            }
        },
            /* Left arrow */
            a.showArrows && msgs.length > 1 && el('button', {
                onClick: function () { setActiveIdx((activeIdx - 1 + msgs.length) % msgs.length); },
                style: {
                    position: 'absolute', left: '8px',
                    background: a.arrowBg || 'rgba(0,0,0,0.15)',
                    color: a.arrowColor || '#fff',
                    border: 'none', borderRadius: '50%',
                    width: '28px', height: '28px',
                    cursor: 'pointer', fontSize: '16px', lineHeight: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }
            }, '‹'),

            /* Message */
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
                el('span', null, msg.text || ''),
                msg.linkLabel && msg.linkUrl && a.linkStyle === 'inline' && el('a', {
                    href: msg.linkUrl, onClick: function (e) { e.preventDefault(); },
                    style: { color: 'inherit', fontWeight: '700', textDecoration: 'underline', whiteSpace: 'nowrap' }
                }, msg.linkLabel),
                msg.linkLabel && msg.linkUrl && a.linkStyle === 'button' && el('a', {
                    href: msg.linkUrl, onClick: function (e) { e.preventDefault(); },
                    style: { color: msg.bgColor || '#6366f1', background: msg.textColor || '#fff', padding: '3px 10px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: (a.fontSize - 1) + 'px', whiteSpace: 'nowrap' }
                }, msg.linkLabel)
            ),

            /* Dots */
            a.showDots && msgs.length > 1 && el('div', {
                style: { position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }
            },
                msgs.map(function (_, di) {
                    return el('div', {
                        key: di,
                        onClick: function () { setActiveIdx(di); },
                        style: {
                            width: '6px', height: '6px', borderRadius: '50%', cursor: 'pointer',
                            background: di === activeIdx ? (a.dotActiveColor || '#fff') : (a.dotColor || 'rgba(255,255,255,0.4)'),
                            transition: 'background 0.15s'
                        }
                    });
                })
            ),

            /* Right arrow */
            a.showArrows && msgs.length > 1 && el('button', {
                onClick: function () { setActiveIdx((activeIdx + 1) % msgs.length); },
                style: {
                    position: 'absolute', right: a.showClose ? '36px' : '8px',
                    background: a.arrowBg || 'rgba(0,0,0,0.15)',
                    color: a.arrowColor || '#fff',
                    border: 'none', borderRadius: '50%',
                    width: '28px', height: '28px',
                    cursor: 'pointer', fontSize: '16px', lineHeight: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }
            }, '›'),

            /* Close */
            a.showClose && el('button', {
                style: {
                    position: 'absolute', right: '8px',
                    background: a.closeBg || 'rgba(0,0,0,0.15)',
                    color: a.closeColor || '#fff',
                    border: 'none', borderRadius: '50%',
                    width: '24px', height: '24px',
                    cursor: 'pointer', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }
            }, '×')
        );
    }

    /* ── MessageEditor ── */
    function MessageEditor(props) {
        var msgs = props.messages;
        var onChange = props.onChange;
        var activeIdx = props.activeIdx;
        var setActiveIdx = props.setActiveIdx;

        function addMsg() {
            var colors = ['#6366f1', '#0ea5e9', '#ef4444', '#f59e0b', '#10b981'];
            var c = colors[msgs.length % colors.length];
            onChange(msgs.concat([{ text: 'New announcement message', linkLabel: 'Learn More', linkUrl: '#', linkTarget: '_self', bgColor: c, textColor: '#ffffff', countdownTo: '' }]));
            setActiveIdx(msgs.length);
        }

        return el(Fragment, null,
            msgs.map(function (msg, idx) {
                var isOpen = idx === activeIdx;
                return el('div', {
                    key: idx,
                    style: {
                        border: '1px solid ' + (isOpen ? '#6366f1' : '#e5e7eb'),
                        borderRadius: '6px',
                        marginBottom: '6px',
                        overflow: 'hidden'
                    }
                },
                    /* header row */
                    el('div', {
                        style: {
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 10px',
                            background: isOpen ? '#f0f0ff' : '#f9fafb',
                            cursor: 'pointer'
                        },
                        onClick: function () { setActiveIdx(isOpen ? -1 : idx); }
                    },
                        el('div', { style: { width: '12px', height: '12px', borderRadius: '3px', background: msg.bgColor || '#6366f1', flexShrink: 0 } }),
                        el('span', { style: { flex: 1, fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, msg.text ? msg.text.slice(0, 40) : 'Message ' + (idx + 1)),
                        el(Button, { icon: 'arrow-up-alt2', isSmall: true, disabled: idx === 0, onClick: function (e) { e.stopPropagation(); onChange(moveItem(msgs, idx, idx - 1)); setActiveIdx(idx - 1); } }),
                        el(Button, { icon: 'arrow-down-alt2', isSmall: true, disabled: idx === msgs.length - 1, onClick: function (e) { e.stopPropagation(); onChange(moveItem(msgs, idx, idx + 1)); setActiveIdx(idx + 1); } }),
                        el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var a = msgs.slice(); a.splice(idx, 1); onChange(a); setActiveIdx(-1); } })
                    ),

                    isOpen && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                        el('div', null,
                            el('label', { style: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' } }, __('Message Text', 'blockenberg')),
                            el('textarea', {
                                value: msg.text || '',
                                onChange: function (e) { onChange(updateItem(msgs, idx, 'text', e.target.value)); },
                                style: { width: '100%', minHeight: '60px', fontSize: '12px', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }
                            })
                        ),
                        el(TextControl, { label: __('Link Label', 'blockenberg'), value: msg.linkLabel || '', onChange: function (v) { onChange(updateItem(msgs, idx, 'linkLabel', v)); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Link URL', 'blockenberg'), value: msg.linkUrl || '', onChange: function (v) { onChange(updateItem(msgs, idx, 'linkUrl', v)); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, {
                            label: __('Link Target', 'blockenberg'),
                            value: msg.linkTarget || '_self',
                            options: [{ value: '_self', label: 'Same tab' }, { value: '_blank', label: 'New tab' }],
                            onChange: function (v) { onChange(updateItem(msgs, idx, 'linkTarget', v)); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { display: 'flex', gap: '10px' } },
                            el('div', { style: { flex: 1 } },
                                el('label', { style: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' } }, __('Background', 'blockenberg')),
                                el('input', { type: 'color', value: msg.bgColor || '#6366f1', onChange: function (e) { onChange(updateItem(msgs, idx, 'bgColor', e.target.value)); }, style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' } })
                            ),
                            el('div', { style: { flex: 1 } },
                                el('label', { style: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' } }, __('Text Color', 'blockenberg')),
                                el('input', { type: 'color', value: msg.textColor || '#ffffff', onChange: function (e) { onChange(updateItem(msgs, idx, 'textColor', e.target.value)); }, style: { width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' } })
                            )
                        ),
                        el(TextControl, { label: __('Countdown To (ISO date, optional)', 'blockenberg'), value: msg.countdownTo || '', placeholder: '2025-12-31T23:59:59', onChange: function (v) { onChange(updateItem(msgs, idx, 'countdownTo', v)); }, __nextHasNoMarginBottom: true })
                    )
                );
            }),
            el(Button, { variant: 'secondary', onClick: addMsg, style: { marginTop: '6px', width: '100%', justifyContent: 'center' } }, __('+ Add Message', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/rotating-banner', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var msgIdxState = useState(0);
            var msgIdx = msgIdxState[0];
            var setMsgIdx = msgIdxState[1];
            var editorIdxState = useState(-1);
            var editorIdx = editorIdxState[0];
            var setEditorIdx = editorIdxState[1];

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = { overflow: 'hidden' };
                if (_tv) {
                    Object.assign(s, _tv(a.messageTypo, '--bkrbnr-mt-'));
                }
                return { style: s };
            })());

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Messages', 'blockenberg'), initialOpen: true },
                    el(MessageEditor, {
                        messages: a.messages,
                        onChange: function (v) { set({ messages: v }); },
                        activeIdx: editorIdx,
                        setActiveIdx: setEditorIdx
                    })
                ),

                el(PanelBody, { title: __('Rotation & Behaviour', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Auto-play', 'blockenberg'), checked: a.autoPlay, onChange: function (v) { set({ autoPlay: v }); }, __nextHasNoMarginBottom: true }),
                    a.autoPlay && el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Interval (ms)', 'blockenberg'), value: a.interval, min: 1000, max: 15000, step: 500, onChange: function (v) { set({ interval: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Animation', 'blockenberg'),
                            value: a.animationType,
                            options: [{ value: 'slide', label: 'Slide' }, { value: 'fade', label: 'Fade' }],
                            onChange: function (v) { set({ animationType: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(ToggleControl, { label: __('Show Arrows', 'blockenberg'), checked: a.showArrows, onChange: function (v) { set({ showArrows: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Dot Indicators', 'blockenberg'), checked: a.showDots, onChange: function (v) { set({ showDots: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Close Button', 'blockenberg'), checked: a.showClose, onChange: function (v) { set({ showClose: v }); }, __nextHasNoMarginBottom: true }),
                    a.showClose && el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Cookie Dismiss Duration (days)', 'blockenberg'), value: a.cookieDays, min: 0, max: 365, onChange: function (v) { set({ cookieDays: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Message Typography', 'blockenberg'),
                        value: a.messageTypo || {},
                        onChange: function (v) { set({ messageTypo: v }); }
                    })
                ),

                el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Banner Height (px)', 'blockenberg'), value: a.height, min: 32, max: 120, onChange: function (v) { set({ height: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Link Style', 'blockenberg'),
                            value: a.linkStyle,
                            options: [{ value: 'inline', label: 'Inline underline' }, { value: 'button', label: 'Pill button' }, { value: 'none', label: 'No link' }],
                            onChange: function (v) { set({ linkStyle: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    )
                ),

                el(PanelColorSettings, {
                    title: __('Navigation Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.arrowBg, onChange: function (v) { set({ arrowBg: v }); }, label: __('Arrow Background', 'blockenberg') },
                        { value: a.arrowColor, onChange: function (v) { set({ arrowColor: v }); }, label: __('Arrow Color', 'blockenberg') },
                        { value: a.dotColor, onChange: function (v) { set({ dotColor: v }); }, label: __('Dot Color', 'blockenberg') },
                        { value: a.dotActiveColor, onChange: function (v) { set({ dotActiveColor: v }); }, label: __('Active Dot Color', 'blockenberg') },
                        { value: a.closeBg, onChange: function (v) { set({ closeBg: v }); }, label: __('Close Button Background', 'blockenberg') },
                        { value: a.closeColor, onChange: function (v) { set({ closeColor: v }); }, label: __('Close Button Color', 'blockenberg') }
                    ]
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el(BannerPreview, { attributes: a, activeIdx: msgIdx, setActiveIdx: setMsgIdx })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-rbnr-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
