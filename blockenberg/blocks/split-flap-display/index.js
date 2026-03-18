( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;
    var RangeControl = wp.components.RangeControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var CHAR_SETS = [
        { label: 'Alpha (A–Z + space)',        value: 'alpha' },
        { label: 'Alphanumeric (A–Z, 0–9)',    value: 'alnum' },
        { label: 'Full (A–Z, 0–9, symbols)',   value: 'full' },
        { label: 'Numeric only (0–9)',         value: 'numeric' }
    ];

    var FONTS = [
        { label: 'Monospace',  value: 'mono' },
        { label: 'Sans-serif', value: 'sans' },
        { label: 'Slab Serif', value: 'slab' }
    ];

    var FONT_FAMILIES = {
        mono: '"Courier New", "Lucida Console", monospace',
        sans: '"Arial", "Helvetica Neue", sans-serif',
        slab: '"Rockwell", "Georgia", serif'
    };

    // Build a static flap-board preview using pure HTML elements
    function BoardPreview(props) {
        var attr = props.attr;
        var text = attr.messages && attr.messages.length ? attr.messages[0] : 'DEPARTURES';
        var chars = text.split('');
        var font = FONT_FAMILIES[attr.fontFamily || 'mono'];

        var boardStyle = {
            backgroundColor: attr.boardBg,
            borderRadius: attr.boardRadius + 'px',
            padding: attr.boardPadding + 'px',
            display: 'inline-block',
            maxWidth: '100%',
            overflow: 'hidden'
        };

        if (attr.showLabel) {
            boardStyle.paddingTop = (attr.boardPadding / 2) + 'px';
        }

        return el('div', { style: { textAlign: 'center' } },
            el('div', { style: boardStyle },
                attr.showLabel && el('div', {
                    className: 'bkbg-sfd-label',
                    style: {
                        color: attr.labelColor, marginBottom: '12px'
                    }
                }, attr.label),
                el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: attr.charGap + 'px', justifyContent: 'center' } },
                    chars.map(function (ch, i) {
                        var isSpace = ch === ' ';
                        return el('div', {
                            key: i,
                            className: 'bkbg-sfd-char',
                            style: {
                                width: attr.charWidth + 'px',
                                height: attr.charHeight + 'px',
                                backgroundColor: isSpace ? 'transparent' : attr.charBg,
                                borderRadius: attr.borderRadius + 'px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: attr.charColor,
                                position: 'relative', overflow: 'hidden',
                                boxShadow: attr.glowColor ? '0 0 12px ' + attr.glowColor : '0 2px 8px rgba(0,0,0,0.5)'
                            }
                        },
                            !isSpace && el('div', {
                                style: {
                                    position: 'absolute', left: 0, top: '50%', width: '100%',
                                    height: '1px', background: attr.dividerColor, zIndex: 2
                                }
                            }),
                            el('span', { className: 'bkbg-sfd-char-text', style: { position: 'relative', zIndex: 1 } }, isSpace ? '' : ch)
                        );
                    })
                ),
                attr.messages.length > 1 && el('div', {
                    style: {
                        display: 'flex', justifyContent: 'center', gap: '6px',
                        marginTop: '12px'
                    }
                },
                    attr.messages.map(function (_, idx) {
                        return el('div', {
                            key: idx,
                            style: {
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: idx === 0 ? attr.charColor : attr.labelColor,
                                opacity: idx === 0 ? 1 : 0.4
                            }
                        });
                    })
                )
            )
        );
    }

    wp.blocks.registerBlockType('blockenberg/split-flap-display', {
        title: 'Split-Flap Display',
        icon: 'editor-table',
        category: 'bkbg-effects',
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ style: (function () {
                var s = {
                    '--bksfd-ch-font-family': FONT_FAMILIES[attr.fontFamily || 'mono'],
                    '--bksfd-ch-font-size-d': attr.fontSize + 'px',
                    '--bksfd-ch-font-weight': String(attr.fontWeight),
                    '--bksfd-lb-font-family': FONT_FAMILIES[attr.fontFamily || 'mono'],
                };
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(attr.charTypo, '--bksfd-ch-'));
                    Object.assign(s, tv(attr.labelTypo, '--bksfd-lb-'));
                }
                return s;
            })() });

            function updateMessage(idx, val) {
                var msgs = attr.messages.slice();
                msgs[idx] = val;
                setAttr({ messages: msgs });
            }
            function addMessage() {
                setAttr({ messages: attr.messages.concat(['']) });
            }
            function removeMessage(idx) {
                var msgs = attr.messages.slice();
                msgs.splice(idx, 1);
                setAttr({ messages: msgs });
            }

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Messages', 'blockenberg'), initialOpen: true },
                        attr.messages.map(function (msg, idx) {
                            return el('div', { key: idx, style: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' } },
                                el(TextControl, {
                                    __nextHasNoMarginBottom: true,
                                    label: __('Row ', 'blockenberg') + (idx + 1),
                                    value: msg,
                                    onChange: function (v) { updateMessage(idx, v.toUpperCase()); }
                                }),
                                attr.messages.length > 1 && el(Button, {
                                    isDestructive: true,
                                    isSmall: true,
                                    onClick: function () { removeMessage(idx); }
                                }, '✕')
                            );
                        }),
                        el(Button, {
                            __nextHasNoMarginBottom: true,
                            isSecondary: true, isSmall: true,
                            onClick: addMessage
                        }, __('+ Add Message', 'blockenberg')),
                        el('p', { style: { color: '#888', fontSize: '12px', marginTop: '8px' } },
                            __('Characters are uppercased automatically.', 'blockenberg')
                        )
                    ),
                    el(PanelBody, { title: __('Character Set & Font', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Character Set', 'blockenberg'), value: attr.charSet, options: CHAR_SETS, onChange: function (v) { setAttr({ charSet: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Font Style', 'blockenberg'), value: attr.fontFamily, options: FONTS, onChange: function (v) { setAttr({ fontFamily: v }); } }),
                        ),
                    el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Ticker Mode (cycle messages)', 'blockenberg'), checked: attr.tickerMode, onChange: function (v) { setAttr({ tickerMode: v }); } }),
                        attr.tickerMode && el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Ticker Delay (ms)', 'blockenberg'), value: attr.tickerDelay, min: 1000, max: 10000, step: 500, onChange: function (v) { setAttr({ tickerDelay: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Animate on Scroll Into View', 'blockenberg'), checked: attr.flipOnScroll, onChange: function (v) { setAttr({ flipOnScroll: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Auto-Play on Load', 'blockenberg'), checked: attr.autoPlay, onChange: function (v) { setAttr({ autoPlay: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Flip Speed (ms/step)', 'blockenberg'), value: attr.flipSpeed, min: 20, max: 200, onChange: function (v) { setAttr({ flipSpeed: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Character Stagger (ms)', 'blockenberg'), value: attr.flipStagger, min: 0, max: 200, onChange: function (v) { setAttr({ flipStagger: v }); } })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Char Width (px)', 'blockenberg'), value: attr.charWidth, min: 20, max: 120, onChange: function (v) { setAttr({ charWidth: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Char Height (px)', 'blockenberg'), value: attr.charHeight, min: 30, max: 160, onChange: function (v) { setAttr({ charHeight: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Char Gap (px)', 'blockenberg'), value: attr.charGap, min: 0, max: 20, onChange: function (v) { setAttr({ charGap: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Row Gap (px)', 'blockenberg'), value: attr.rowGap, min: 0, max: 40, onChange: function (v) { setAttr({ rowGap: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Char Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 20, onChange: function (v) { setAttr({ borderRadius: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Board Padding (px)', 'blockenberg'), value: attr.boardPadding, min: 8, max: 60, onChange: function (v) { setAttr({ boardPadding: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Board Border Radius', 'blockenberg'), value: attr.boardRadius, min: 0, max: 40, onChange: function (v) { setAttr({ boardRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Label', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Board Label', 'blockenberg'), checked: attr.showLabel, onChange: function (v) { setAttr({ showLabel: v }); } }),
                        attr.showLabel && el(TextControl, { __nextHasNoMarginBottom: true, label: __('Label Text', 'blockenberg'), value: attr.label, onChange: function (v) { setAttr({ label: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label: __('Character Typography', 'blockenberg'), value: attr.charTypo || {}, onChange: function (v) { setAttr({ charTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Label Typography', 'blockenberg'), value: attr.labelTypo || {}, onChange: function (v) { setAttr({ labelTypo: v }); } }) : null
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Board Background', 'blockenberg'), value: attr.boardBg,       onChange: function (v) { setAttr({ boardBg: v || '' }); } },
                            { label: __('Character Background', 'blockenberg'), value: attr.charBg,   onChange: function (v) { setAttr({ charBg: v || '' }); } },
                            { label: __('Character Color', 'blockenberg'), value: attr.charColor,     onChange: function (v) { setAttr({ charColor: v || '' }); } },
                            { label: __('Divider Line', 'blockenberg'), value: attr.dividerColor,     onChange: function (v) { setAttr({ dividerColor: v || '' }); } },
                            { label: __('Label Color', 'blockenberg'), value: attr.labelColor,        onChange: function (v) { setAttr({ labelColor: v || '' }); } },
                            { label: __('Glow Color', 'blockenberg'), value: attr.glowColor,          onChange: function (v) { setAttr({ glowColor: v || '' }); } }
                        ]
                    })
                ),
                el(BoardPreview, { attr: attr })
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-sfd-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
