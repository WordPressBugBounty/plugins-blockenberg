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

    /* ── updateItem helper (ES5 safe) ── */
    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    /* ── util ── */
    function timestamp() {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
    }

    var _fchtTC, _fchtTV;
    function _tc() { return _fchtTC || (_fchtTC = window.bkbgTypographyControl); }
    function _tv(o, p) { if (!_fchtTV) _fchtTV = window.bkbgTypoCssVars; return _fchtTV ? _fchtTV(o, p) : {}; }

    /* ── editor preview component ── */
    function ChatPreview(props) {
        var a = props.attributes;
        var ts = timestamp();
        var isRounded = a.chatStyle !== 'sharp';
        var bubbleR = a.chatStyle === 'bubble' ? '20px' : (isRounded ? '12px' : '4px');
        var botBubbleStyle = {
            background: a.botBubbleBg,
            color: a.botBubbleColor,
            borderRadius: bubbleR,
            padding: '10px 14px',
            display: 'inline-block',
            maxWidth: '78%',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        };
        var userBubbleStyle = {
            background: a.userBubbleBg,
            color: a.userBubbleColor,
            borderRadius: bubbleR,
            padding: '10px 14px',
            display: 'inline-block',
            maxWidth: '78%'
        };

        return el('div', {
            style: {
                background: a.chatBg,
                borderRadius: (a.borderRadius - 2) + 'px',
                padding: '16px',
                minHeight: '200px',
                fontFamily: 'system-ui, sans-serif',
                overflowY: 'auto'
            }
        },
            /* initial bot message */
            el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '14px' } },
                el('div', {
                    style: {
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: a.avatarBg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '16px', lineHeight: 1
                    }
                }, a.botAvatar),
                el('div', {},
                    el('div', { style: { fontSize: '11px', color: a.timestampColor, marginBottom: '3px', fontWeight: 600 } }, a.botName),
                    el('div', { className: 'bkbg-faqc-bubble bot-bubble', style: botBubbleStyle }, a.initialMessage || 'Hi! Click any question below.')
                )
            ),

            /* example user question */
            el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' } },
                el('div', { className: 'bkbg-faqc-bubble user-bubble', style: userBubbleStyle }, a.faqs.length ? a.faqs[0].question : 'Sample question?')
            ),

            /* typing indicator */
            el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '14px' } },
                el('div', {
                    style: {
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: a.avatarBg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '16px', lineHeight: 1
                    }
                }, a.botAvatar),
                el('div', {},
                    el('div', { style: { fontSize: '11px', color: a.timestampColor, marginBottom: '3px', fontWeight: 600 } }, a.botName),
                    el('div', { className: 'bkbg-faqc-bubble bot-bubble', style: Object.assign({}, botBubbleStyle, { fontStyle: 'italic', color: a.timestampColor }) }, '...')
                )
            ),

            /* example answer */
            el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '8px' } },
                el('div', {
                    style: {
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: a.avatarBg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '16px', lineHeight: 1
                    }
                }, a.botAvatar),
                el('div', {},
                    el('div', { style: { fontSize: '11px', color: a.timestampColor, marginBottom: '3px', fontWeight: 600 } },
                        a.botName + (a.showTimestamp ? '  ' + ts : '')
                    ),
                    el('div', { className: 'bkbg-faqc-bubble bot-bubble', style: botBubbleStyle },
                        a.faqs.length ? a.faqs[0].answer.substring(0, 80) + (a.faqs[0].answer.length > 80 ? '…' : '') : 'Answer preview.'
                    )
                )
            )
        );
    }

    /* ── FAQ list editor ── */
    function FaqEditor(props) {
        var faqs = props.faqs;
        var setFaqs = props.setFaqs;
        var expanded = props.expanded;
        var setExpanded = props.setExpanded;

        return el('div', {},
            faqs.map(function (faq, i) {
                var isOpen = expanded === i;
                return el('div', {
                    key: i,
                    style: {
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        overflow: 'hidden',
                        background: isOpen ? '#fafafa' : '#fff'
                    }
                },
                    /* header row */
                    el('div', {
                        onClick: function () { setExpanded(isOpen ? -1 : i); },
                        style: {
                            padding: '8px 10px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: '6px',
                            borderBottom: isOpen ? '1px solid #e5e7eb' : 'none'
                        }
                    },
                        el('span', { style: { fontSize: '10px', color: '#9ca3af', fontWeight: 700 } }, 'Q' + (i + 1)),
                        el('span', {
                            style: {
                                flex: 1, fontSize: '12px', color: '#374151',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }
                        }, faq.question || '(empty)'),
                        el('span', { style: { color: '#9ca3af', fontSize: '11px' } }, isOpen ? '▲' : '▼'),
                        el('button', {
                            onClick: function (e) {
                                e.stopPropagation();
                                if (faqs.length < 2) return;
                                var next = faqs.filter(function (_, j) { return j !== i; });
                                setFaqs(next);
                                setExpanded(-1);
                            },
                            title: 'Remove',
                            style: {
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#ef4444', fontSize: '14px', padding: '0 2px', lineHeight: 1
                            }
                        }, '×')
                    ),

                    /* expanded body */
                    isOpen ? el('div', { style: { padding: '10px' } },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Question', 'blockenberg'),
                            value: faq.question,
                            onChange: function (v) { setFaqs(updateItem(faqs, i, 'question', v)); }
                        }),
                        el('div', { style: { marginTop: '10px' } },
                            el('label', { style: { display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#757575' } },
                                __('Answer', 'blockenberg')
                            ),
                            el('textarea', {
                                value: faq.answer,
                                rows: 4,
                                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' },
                                onChange: function (e) { setFaqs(updateItem(faqs, i, 'answer', e.target.value)); }
                            })
                        ),
                        el('div', { style: { marginTop: '8px', display: 'flex', gap: '6px' } },
                            el(Button, {
                                variant: 'secondary',
                                style: { fontSize: '11px' },
                                onClick: function () {
                                    var copy = Object.assign({}, faq, { question: faq.question + ' (copy)' });
                                    var next = faqs.slice(); next.splice(i + 1, 0, copy);
                                    setFaqs(next);
                                    setExpanded(i + 1);
                                }
                            }, __('Duplicate', 'blockenberg')),
                            i > 0 ? el(Button, {
                                variant: 'secondary',
                                style: { fontSize: '11px' },
                                onClick: function () {
                                    var next = faqs.slice();
                                    var tmp = next[i - 1]; next[i - 1] = next[i]; next[i] = tmp;
                                    setFaqs(next); setExpanded(i - 1);
                                }
                            }, __('↑ Move up', 'blockenberg')) : null,
                            i < faqs.length - 1 ? el(Button, {
                                variant: 'secondary',
                                style: { fontSize: '11px' },
                                onClick: function () {
                                    var next = faqs.slice();
                                    var tmp = next[i + 1]; next[i + 1] = next[i]; next[i] = tmp;
                                    setFaqs(next); setExpanded(i + 1);
                                }
                            }, __('↓ Move down', 'blockenberg')) : null
                        )
                    ) : null
                );
            }),

            /* add button */
            el('div', { style: { marginTop: '8px' } },
                el(Button, {
                    variant: 'primary',
                    style: { width: '100%', justifyContent: 'center' },
                    onClick: function () {
                        var next = faqs.slice();
                        next.push({ question: 'New question?', answer: 'Your answer goes here.' });
                        setFaqs(next);
                        setExpanded(next.length - 1);
                    }
                }, __('+ Add FAQ', 'blockenberg'))
            )
        );
    }

    /* ── register ── */
    registerBlockType('blockenberg/faq-chat', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var expanded = useState(-1);
            var expandedIdx = expanded[0];
            var setExpanded = expanded[1];

            var blockProps = useBlockProps({ className: 'bkbg-faqc-editor-wrap', style: Object.assign({}, _tv(a.typoQuestion, '--bkbg-fcht-qt-'), _tv(a.typoAnswer, '--bkbg-fcht-an-')) });

            function setFaqs(v) { setAttributes({ faqs: v }); }

            return el(Fragment, {},

                el(InspectorControls, {},

                    /* ── FAQ Items ── */
                    el(PanelBody, { title: __('FAQ Items', 'blockenberg'), initialOpen: true },
                        el(FaqEditor, {
                            faqs: a.faqs,
                            setFaqs: setFaqs,
                            expanded: expandedIdx,
                            setExpanded: setExpanded
                        })
                    ),

                    /* ── Bot Settings ── */
                    el(PanelBody, { title: __('Bot & Greeting', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Bot name', 'blockenberg'),
                            value: a.botName,
                            onChange: function (v) { setAttributes({ botName: v }); }
                        }),
                        el('div', { style: { marginTop: '10px' } },
                            el(TextControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Bot avatar (emoji or initials)', 'blockenberg'),
                                value: a.botAvatar,
                                onChange: function (v) { setAttributes({ botAvatar: v.slice(0, 4) }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el('label', { style: { display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#757575' } },
                                __('Initial greeting message', 'blockenberg')
                            ),
                            el('textarea', {
                                value: a.initialMessage,
                                rows: 2,
                                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' },
                                onChange: function (e) { setAttributes({ initialMessage: e.target.value }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(ToggleControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Show message timestamps', 'blockenberg'),
                                checked: a.showTimestamp,
                                onChange: function (v) { setAttributes({ showTimestamp: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '10px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Typing delay (ms)', 'blockenberg'),
                                value: a.typingDelay,
                                min: 200, max: 2500, step: 100,
                                onChange: function (v) { setAttributes({ typingDelay: v }); }
                            })
                        )
                    ),

                    /* ── Appearance ── */
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Chat style', 'blockenberg'),
                            value: a.chatStyle,
                            options: [
                                { label: 'Rounded',    value: 'rounded' },
                                { label: 'Bubble',     value: 'bubble' },
                                { label: 'Sharp',      value: 'sharp' }
                            ],
                            onChange: function (v) { setAttributes({ chatStyle: v }); }
                        }),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Max width (px)', 'blockenberg'),
                                value: a.maxWidth,
                                min: 300, max: 900,
                                onChange: function (v) { setAttributes({ maxWidth: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Chat area max height (px)', 'blockenberg'),
                                value: a.maxHeight,
                                min: 200, max: 800,
                                onChange: function (v) { setAttributes({ maxHeight: v }); }
                            })
                        ),
                        el('div', { style: { marginTop: '12px' } },
                            el(RangeControl, {
                                __nextHasNoMarginBottom: true,
                                label: __('Border radius (px)', 'blockenberg'),
                                value: a.borderRadius,
                                min: 0, max: 32,
                                onChange: function (v) { setAttributes({ borderRadius: v }); }
                            })
                        ),
                    ),

                    /* ── Colors ── */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && _tc()({ label: __('Question', 'blockenberg'), typo: a.typoQuestion, onChange: function (v) { setAttributes({ typoQuestion: v }); } }),
                        _tc() && _tc()({ label: __('Answer', 'blockenberg'), typo: a.typoAnswer, onChange: function (v) { setAttributes({ typoAnswer: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Header background', 'blockenberg'), value: a.headerBg, onChange: function (v) { setAttributes({ headerBg: v || '#6366f1' }); } },
                            { label: __('Header text', 'blockenberg'), value: a.headerColor, onChange: function (v) { setAttributes({ headerColor: v || '#ffffff' }); } },
                            { label: __('Avatar background', 'blockenberg'), value: a.avatarBg, onChange: function (v) { setAttributes({ avatarBg: v || '#6366f1' }); } },
                            { label: __('Chat area background', 'blockenberg'), value: a.chatBg, onChange: function (v) { setAttributes({ chatBg: v || '#f1f5f9' }); } },
                            { label: __('Bot bubble background', 'blockenberg'), value: a.botBubbleBg, onChange: function (v) { setAttributes({ botBubbleBg: v || '#ffffff' }); } },
                            { label: __('Bot bubble text', 'blockenberg'), value: a.botBubbleColor, onChange: function (v) { setAttributes({ botBubbleColor: v || '#1f2937' }); } },
                            { label: __('User bubble background', 'blockenberg'), value: a.userBubbleBg, onChange: function (v) { setAttributes({ userBubbleBg: v || '#6366f1' }); } },
                            { label: __('User bubble text', 'blockenberg'), value: a.userBubbleColor, onChange: function (v) { setAttributes({ userBubbleColor: v || '#ffffff' }); } },
                            { label: __('Questions area background', 'blockenberg'), value: a.questionsBg, onChange: function (v) { setAttributes({ questionsBg: v || '#ffffff' }); } },
                            { label: __('Question button background', 'blockenberg'), value: a.btnBg, onChange: function (v) { setAttributes({ btnBg: v || '#f3f4f6' }); } },
                            { label: __('Question button text', 'blockenberg'), value: a.btnColor, onChange: function (v) { setAttributes({ btnColor: v || '#374151' }); } },
                            { label: __('Question button border', 'blockenberg'), value: a.btnBorder, onChange: function (v) { setAttributes({ btnBorder: v || '#e5e7eb' }); } },
                            { label: __('Answered button background', 'blockenberg'), value: a.btnActiveBg, onChange: function (v) { setAttributes({ btnActiveBg: v || '#e0e7ff' }); } },
                            { label: __('Answered button text', 'blockenberg'), value: a.btnActiveColor, onChange: function (v) { setAttributes({ btnActiveColor: v || '#4338ca' }); } },
                            { label: __('Widget border', 'blockenberg'), value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Timestamp color', 'blockenberg'), value: a.timestampColor, onChange: function (v) { setAttributes({ timestampColor: v || '#9ca3af' }); } }
                        ]
                    })
                ),

                /* ────── canvas ────── */
                el('div', blockProps,
                    el('div', {
                        style: {
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            maxWidth: a.maxWidth + 'px',
                            margin: '0 auto',
                            border: '1px solid ' + a.borderColor,
                            borderRadius: a.borderRadius + 'px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
                        }
                    },
                        /* header */
                        el('div', {
                            style: {
                                background: a.headerBg,
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }
                        },
                            el('div', {
                                style: {
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '18px', flexShrink: 0
                                }
                            }, a.botAvatar),
                            el('div', {},
                                el('div', { style: { color: a.headerColor, fontWeight: 700, fontSize: '15px', lineHeight: 1.2 } }, a.botName),
                                el('div', { style: { color: a.headerColor, opacity: 0.75, fontSize: '12px' } },
                                    el('span', { style: { display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', marginRight: '4px', verticalAlign: 'middle' } }),
                                    'Online · ' + a.faqs.length + ' topics'
                                )
                            )
                        ),

                        /* chat preview */
                        el('div', { style: { maxHeight: a.maxHeight * 0.55 + 'px', overflowY: 'auto' } },
                            el(ChatPreview, { attributes: a })
                        ),

                        /* question buttons */
                        el('div', {
                            style: {
                                background: a.questionsBg,
                                borderTop: '1px solid ' + a.borderColor,
                                padding: '12px 14px'
                            }
                        },
                            el('div', { style: { fontSize: '11px', color: a.timestampColor, marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' } },
                                '📋 Frequently Asked Questions'
                            ),
                            el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
                                a.faqs.slice(0, 4).map(function (faq, i) {
                                    return el('button', {
                                        key: i,
                                        className: 'bkbg-faqc-q-btn',
                                        style: {
                                            background: a.btnBg, color: a.btnColor,
                                            borderColor: a.btnBorder,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }
                                    }, faq.question);
                                }),
                                a.faqs.length > 4 ? el('button', {
                                    style: {
                                        background: 'transparent', color: a.timestampColor,
                                        border: '1px dashed ' + a.btnBorder,
                                        borderRadius: '20px', padding: '6px 12px',
                                        fontSize: '13px', cursor: 'default',
                                        fontFamily: 'inherit', lineHeight: 1.4
                                    }
                                }, '+' + (a.faqs.length - 4) + ' more') : null
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-faqc-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
