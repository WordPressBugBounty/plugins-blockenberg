( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var useRef = wp.element.useRef;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    // ── CSS vars ──────────────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        var style = {
            '--bkbg-at-static-color'    : a.staticColor,
            '--bkbg-at-animated-color'  : a.animatedColor,
            '--bkbg-at-cursor-color'    : a.cursorColor,
            '--bkbg-at-font-size'       : a.fontSize + 'px',
            '--bkbg-at-font-weight'     : a.fontWeight,
            '--bkbg-at-line-height'     : a.lineHeight,
            '--bkbg-at-letter-spacing'  : a.letterSpacing + 'px',
            '--bkbg-at-text-align'      : a.textAlign,
            '--bkbg-at-cursor-blink'    : a.cursorBlinkSpeed + 'ms',
            '--bkbg-at-highlight-bg'    : a.highlightBg || 'transparent',
            '--bkbg-at-highlight-pad'   : a.highlightPadding + 'px',
            '--bkbg-at-highlight-radius': a.highlightRadius + 'px',
            '--bkbg-at-pad-top'         : a.wrapperPaddingTop + 'px',
            '--bkbg-at-pad-bottom'      : a.wrapperPaddingBottom + 'px'
        };
        if (a.maxWidth) { style['--bkbg-at-max-width'] = a.maxWidth + 'px'; }
        var _tv = getTypoCssVars();
        Object.assign(style, _tv(a.headingTypo || {}, '--bkbg-at-heading-'));
        return style;
    }

    // ── Color swatch ──────────────────────────────────────────────────────────
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button',
                    title: value || 'none',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: {
                        width: '28px', height: '28px', borderRadius: '4px',
                        border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                        cursor: 'pointer', padding: 0, display: 'block',
                        background: value || '#fff'
                    }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    // ── Live preview typewriter in the editor ─────────────────────────────────
    function EditorPreview(props) {
        var a = props.attributes;
        var displayWordState = useState(a.words[0] || '');
        var displayWord = displayWordState[0];
        var setDisplayWord = displayWordState[1];
        var indexRef = useRef(0);
        var timerRef = useRef(null);

        useEffect(function () {
            if (a.effect !== 'typewriter' || a.words.length < 2) return;
            function cycle() {
                var next = (indexRef.current + 1) % a.words.length;
                indexRef.current = next;
                setDisplayWord(a.words[next] || '');
                timerRef.current = setTimeout(cycle, 1800);
            }
            timerRef.current = setTimeout(cycle, 1800);
            return function () { clearTimeout(timerRef.current); };
        }, [a.words, a.effect]);

        var wordToShow = a.effect === 'typewriter' ? displayWord : (a.words[0] || '');

        return el('span', { className: 'bkbg-at-animated-word bkbg-at-effect-' + a.effect },
            el('span', { className: 'bkbg-at-word-text' }, wordToShow),
            a.showCursor && el('span', { className: 'bkbg-at-cursor', 'aria-hidden': 'true' }, a.cursorChar)
        );
    }

    // ── Register ──────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/animated-text', {
        title: __('Animated Text', 'blockenberg'),
        icon: 'editor-textcolor',
        category: 'bkbg-effects',
        description: __('Animated cycling headline with typewriter, fade, slide, or flip effects.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateWord(i, val) {
                var w = a.words.slice();
                w[i] = val;
                setAttributes({ words: w });
            }

            function addWord() { setAttributes({ words: a.words.concat(['new word']) }); }
            function removeWord(i) {
                if (a.words.length <= 1) return;
                setAttributes({ words: a.words.filter(function (_, idx) { return idx !== i; }) });
            }
            function moveWord(i, dir) {
                var ni = i + dir;
                if (ni < 0 || ni >= a.words.length) return;
                var w = a.words.slice(); var tmp = w[i]; w[i] = w[ni]; w[ni] = tmp;
                setAttributes({ words: w });
            }

            var blockProps = useBlockProps({ className: 'bkbg-at-wrapper bkbg-at-align-' + a.textAlign, style: buildWrapStyle(a) });

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},
                // Words
                el(PanelBody, { title: __('Words / Phrases', 'blockenberg'), initialOpen: true },
                    el('p', { style: { fontSize: '12px', color: '#757575', marginTop: 0 } },
                        __('Each word/phrase will be animated in cycle.', 'blockenberg')
                    ),
                    a.words.map(function (word, i) {
                        return el('div', {
                            key: i,
                            style: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }
                        },
                            el(TextControl, {
                                value: word, style: { flex:1, margin: 0 },
                                onChange: function (v) { updateWord(i, v); }
                            }),
                            el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveWord(i, -1); }, disabled: i === 0 }, '↑'),
                            el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveWord(i, 1); }, disabled: i === a.words.length - 1 }, '↓'),
                            el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { removeWord(i); }, disabled: a.words.length <= 1 }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addWord, style: { width: '100%', justifyContent: 'center' } },
                        '+ ' + __('Add Word', 'blockenberg')
                    )
                ),

                // Animation
                el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Effect', 'blockenberg'), value: a.effect,
                        options: [
                            { label: __('Typewriter', 'blockenberg'), value: 'typewriter' },
                            { label: __('Fade', 'blockenberg'), value: 'fade' },
                            { label: __('Slide Up', 'blockenberg'), value: 'slide-up' },
                            { label: __('Slide Down', 'blockenberg'), value: 'slide-down' },
                            { label: __('Flip / Rotate', 'blockenberg'), value: 'flip' },
                            { label: __('Zoom', 'blockenberg'), value: 'zoom' },
                            { label: __('Blur', 'blockenberg'), value: 'blur' }
                        ],
                        onChange: function (v) { setAttributes({ effect: v }); }
                    }),
                    a.effect === 'typewriter' && el(Fragment, {},
                        el(RangeControl, {
                            label: __('Typing Speed (ms/char)', 'blockenberg'), value: a.typingSpeed, min: 20, max: 300,
                            onChange: function (v) { setAttributes({ typingSpeed: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Deleting Speed (ms/char)', 'blockenberg'), value: a.deletingSpeed, min: 10, max: 200,
                            onChange: function (v) { setAttributes({ deletingSpeed: v }); }
                        })
                    ),
                    el(RangeControl, {
                        label: __('Pause Duration (ms)', 'blockenberg'), value: a.pauseDuration, min: 500, max: 6000, step: 100,
                        onChange: function (v) { setAttributes({ pauseDuration: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Loop Continuously', 'blockenberg'), checked: a.loop,
                        onChange: function (v) { setAttributes({ loop: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Cursor', 'blockenberg'), checked: a.showCursor,
                        onChange: function (v) { setAttributes({ showCursor: v }); }
                    }),
                    a.showCursor && el(Fragment, {},
                        el(TextControl, {
                            label: __('Cursor Character', 'blockenberg'), value: a.cursorChar,
                            onChange: function (v) { setAttributes({ cursorChar: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Cursor Blink Speed (ms)', 'blockenberg'), value: a.cursorBlinkSpeed, min: 200, max: 1500,
                            onChange: function (v) { setAttributes({ cursorBlinkSpeed: v }); }
                        }),
                        cc('cursorColor', __('Cursor Color', 'blockenberg'), 'cursorColor')
                    )
                ),

                // Text layout
                el(PanelBody, { title: __('Text & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('HTML Tag', 'blockenberg'), value: a.tag,
                        options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'].map(function (t) { return { label: t.toUpperCase(), value: t }; }),
                        onChange: function (v) { setAttributes({ tag: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'), value: a.textAlign,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('Right', 'blockenberg'), value: 'right' }
                        ],
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Word Placement', 'blockenberg'), value: a.wordPlacement,
                        options: [
                            { label: __('Inline (same line)', 'blockenberg'), value: 'inline' },
                            { label: __('New Line (block)', 'blockenberg'), value: 'block' }
                        ],
                        onChange: function (v) { setAttributes({ wordPlacement: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (px, 0 = none)', 'blockenberg'), value: a.maxWidth, min: 0, max: 1400,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'), value: a.wrapperPaddingTop, min: 0, max: 120,
                        onChange: function (v) { setAttributes({ wrapperPaddingTop: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'), value: a.wrapperPaddingBottom, min: 0, max: 120,
                        onChange: function (v) { setAttributes({ wrapperPaddingBottom: v }); }
                    }),
                    cc('staticColor', __('Static Text Color', 'blockenberg'), 'staticColor'),
                    cc('animatedColor', __('Animated Word Color', 'blockenberg'), 'animatedColor')
                ),

                // Word Highlight
                el(PanelBody, { title: __('Word Highlight', 'blockenberg'), initialOpen: false },
                    el('p', { style: { fontSize: '12px', color: '#757575', marginTop: 0 } },
                        __('Optionally add a background highlight behind the animated word.', 'blockenberg')
                    ),
                    cc('highlightBg', __('Highlight Background', 'blockenberg'), 'highlightBg'),
                    el(RangeControl, {
                        label: __('Highlight Padding (px)', 'blockenberg'), value: a.highlightPadding, min: 0, max: 24,
                        onChange: function (v) { setAttributes({ highlightPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Highlight Border Radius (px)', 'blockenberg'), value: a.highlightRadius, min: 0, max: 20,
                        onChange: function (v) { setAttributes({ highlightRadius: v }); }
                    })
                ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', null, 'Typography control not loaded.');
                        return el(TC, { label: __('Heading Typography', 'blockenberg'), value: a.headingTypo || {}, onChange: function (v) { setAttributes({ headingTypo: v }); } });
                    })()
                )
            );

            // ── Block render ──────────────────────────────────────────────────
            var isBlock = a.wordPlacement === 'block';
            var headingContent = isBlock
                ? el(Fragment, {},
                    a.beforeText && el(RichText, {
                        tagName: 'span', className: 'bkbg-at-static bkbg-at-before',
                        value: a.beforeText, onChange: function (v) { setAttributes({ beforeText: v }); },
                        placeholder: __('Before text…', 'blockenberg')
                    }),
                    el('br', { className: 'bkbg-at-break' }),
                    el(EditorPreview, { attributes: a }),
                    a.afterText && el(Fragment, {},
                        el('br', { className: 'bkbg-at-break' }),
                        el(RichText, {
                            tagName: 'span', className: 'bkbg-at-static bkbg-at-after',
                            value: a.afterText, onChange: function (v) { setAttributes({ afterText: v }); },
                            placeholder: __('After text…', 'blockenberg')
                        })
                    )
                  )
                : el(Fragment, {},
                    a.beforeText && el(RichText, {
                        tagName: 'span', className: 'bkbg-at-static bkbg-at-before',
                        value: a.beforeText, onChange: function (v) { setAttributes({ beforeText: v }); },
                        placeholder: __('Before text…', 'blockenberg')
                    }),
                    a.beforeText && el('span', {}, ' '),
                    el(EditorPreview, { attributes: a }),
                    a.afterText && el('span', {}, ' '),
                    a.afterText && el(RichText, {
                        tagName: 'span', className: 'bkbg-at-static bkbg-at-after',
                        value: a.afterText, onChange: function (v) { setAttributes({ afterText: v }); },
                        placeholder: __('After text…', 'blockenberg')
                    })
                  );

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el(a.tag, { className: 'bkbg-at-heading' }, headingContent)
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var isBlock = a.wordPlacement === 'block';

            var headingContent = isBlock
                ? [
                    a.beforeText && el(RichText.Content, { key: 'before', tagName: 'span', className: 'bkbg-at-static bkbg-at-before', value: a.beforeText }),
                    el('br', { key: 'br1', className: 'bkbg-at-break' }),
                    el('span', {
                        key: 'anim',
                        className: 'bkbg-at-animated-word bkbg-at-effect-' + a.effect,
                        'data-words': JSON.stringify(a.words),
                        'data-effect': a.effect,
                        'data-typing-speed': a.typingSpeed,
                        'data-deleting-speed': a.deletingSpeed,
                        'data-pause': a.pauseDuration,
                        'data-loop': a.loop ? '1' : '0',
                        'data-cursor': a.showCursor ? '1' : '0',
                        'data-cursor-char': a.cursorChar
                    },
                        el('span', { className: 'bkbg-at-word-text' }, a.words[0] || ''),
                        a.showCursor && el('span', { className: 'bkbg-at-cursor', 'aria-hidden': 'true' }, a.cursorChar)
                    ),
                    a.afterText && el('br', { key: 'br2', className: 'bkbg-at-break' }),
                    a.afterText && el(RichText.Content, { key: 'after', tagName: 'span', className: 'bkbg-at-static bkbg-at-after', value: a.afterText })
                  ]
                : [
                    a.beforeText && el(RichText.Content, { key: 'before', tagName: 'span', className: 'bkbg-at-static bkbg-at-before', value: a.beforeText }),
                    a.beforeText && el('span', { key: 'sp1' }, ' '),
                    el('span', {
                        key: 'anim',
                        className: 'bkbg-at-animated-word bkbg-at-effect-' + a.effect,
                        'data-words': JSON.stringify(a.words),
                        'data-effect': a.effect,
                        'data-typing-speed': a.typingSpeed,
                        'data-deleting-speed': a.deletingSpeed,
                        'data-pause': a.pauseDuration,
                        'data-loop': a.loop ? '1' : '0',
                        'data-cursor': a.showCursor ? '1' : '0',
                        'data-cursor-char': a.cursorChar
                    },
                        el('span', { className: 'bkbg-at-word-text' }, a.words[0] || ''),
                        a.showCursor && el('span', { className: 'bkbg-at-cursor', 'aria-hidden': 'true' }, a.cursorChar)
                    ),
                    a.afterText && el('span', { key: 'sp2' }, ' '),
                    a.afterText && el(RichText.Content, { key: 'after', tagName: 'span', className: 'bkbg-at-static bkbg-at-after', value: a.afterText })
                  ];

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-at-wrapper bkbg-at-align-' + a.textAlign, style: buildWrapStyle(a) }),
                el(a.tag, { className: 'bkbg-at-heading' }, headingContent)
            );
        }
    });
}() );
