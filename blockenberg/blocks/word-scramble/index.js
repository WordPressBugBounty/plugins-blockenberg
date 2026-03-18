( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;

    /* ── Typography helpers (lazy) ───────────────────────────────── */
    var _tc, _tvf;
    Object.defineProperty(window, '__bkwsc_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '__bkwsc_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, typoObj, setAttributes, attrName) {
        var fn = window.__bkwsc_tc;
        return fn ? fn({ label: label, value: typoObj || {}, onChange: function (v) { var o = {}; o[attrName] = v; setAttributes(o); } }) : null;
    }
    function getTypoCssVars(a) {
        var fn = window.__bkwsc_tvf;
        var s = {};
        if (fn) {
            Object.assign(s, fn(a.titleTypo || {}, '--bkwsc-tt-'));
            Object.assign(s, fn(a.subtitleTypo || {}, '--bkwsc-st-'));
        }
        return s;
    }

    var CATEGORIES = {
        animals:   'Animals',
        countries: 'Countries',
        foods:     'Foods',
        tech:      'Technology'
    };

    var DIFFICULTIES = { easy: 'Easy (4–5 letters)', medium: 'Medium (6–8)', hard: 'Hard (9+)' };

    function sampleWords(cat, diff) {
        var all = {
            animals:   { easy: ['BEAR','WOLF','FROG','DUCK','LION'], medium: ['PARROT','JAGUAR','DONKEY'], hard: ['ALLIGATOR','CHAMELEON'] },
            countries: { easy: ['PERU','CUBA','IRAN','IRAQ','MALI'], medium: ['FRANCE','BRAZIL','CANADA'], hard: ['AUSTRALIA','INDONESIA'] },
            foods:     { easy: ['RICE','BEEF','CORN','MILK','CAKE'], medium: ['POTATO','CARROT','TOMATO'], hard: ['CROISSANT','STRAWBERRY'] },
            tech:      { easy: ['CODE','DATA','WIFI','BYTE','CHIP'], medium: ['PYTHON','DOCKER','GITHUB'], hard: ['ALGORITHM','JAVASCRIPT'] }
        };
        var pool = (all[cat] || all['animals'])[diff] || all['animals']['medium'];
        return pool[0];
    }

    function scramble(word) {
        var arr = word.split('');
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        var s = arr.join('');
        return s === word ? scramble(word) : s;
    }

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var blockProps = useBlockProps((function () {
            var s = getTypoCssVars(a);
            s.background = a.sectionBg;
            s.borderRadius = 16;
            s.padding = '28px 20px';
            return { style: s };
        })());

        var word = sampleWords(a.defaultCategory, a.defaultDifficulty);
        var scrambled = scramble(word);

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Game Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Default Category', 'blockenberg'),
                        value: a.defaultCategory,
                        options: Object.keys(CATEGORIES).map(function (k) { return { label: CATEGORIES[k], value: k }; }),
                        onChange: function (v) { setAttributes({ defaultCategory: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Default Difficulty', 'blockenberg'),
                        value: a.defaultDifficulty,
                        options: Object.keys(DIFFICULTIES).map(function (k) { return { label: DIFFICULTIES[k], value: k }; }),
                        onChange: function (v) { setAttributes({ defaultDifficulty: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Time Limit (seconds)', 'blockenberg'),
                        value: a.timeLimit, min: 20, max: 300,
                        onChange: function (v) { setAttributes({ timeLimit: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Hints Allowed', 'blockenberg'),
                        value: a.hintsAllowed, min: 0, max: 10,
                        onChange: function (v) { setAttributes({ hintsAllowed: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Timer', 'blockenberg'),
                        checked: a.showTimer,
                        onChange: function (v) { setAttributes({ showTimer: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Score', 'blockenberg'),
                        checked: a.showScore,
                        onChange: function (v) { setAttributes({ showScore: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Streak', 'blockenberg'),
                        checked: a.showStreak,
                        onChange: function (v) { setAttributes({ showStreak: v }); }
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl( 'Title', a.titleTypo, setAttributes, 'titleTypo' ),
                    getTypoControl( 'Subtitle', a.subtitleTypo, setAttributes, 'subtitleTypo' )
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#f59e0b' }); } },
                        { label: __('Correct Color', 'blockenberg'), value: a.correctColor, onChange: function (v) { setAttributes({ correctColor: v || '#22c55e' }); } },
                        { label: __('Wrong Color', 'blockenberg'), value: a.wrongColor, onChange: function (v) { setAttributes({ wrongColor: v || '#ef4444' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#fffbeb' }); } },
                        { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#92400e' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, {
                    tagName: 'h3', className: 'bkbg-wsc-title',
                    value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Title', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 4px', textAlign: 'center' }
                }),
                el(RichText, {
                    tagName: 'p', className: 'bkbg-wsc-subtitle',
                    value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Subtitle', 'blockenberg'),
                    style: { color: a.titleColor + 'bb', textAlign: 'center', margin: '0 0 16px' }
                }),
                // Stats bar
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' } },
                    a.showScore && el('div', {
                        style: { background: a.cardBg, borderRadius: 10, padding: '8px 18px', textAlign: 'center', borderTop: '4px solid ' + a.accentColor }
                    },
                        el('div', { style: { fontSize: 22, fontWeight: 900, color: a.accentColor } }, '0'),
                        el('div', { style: { fontSize: 12, color: a.titleColor } }, 'Score')
                    ),
                    a.showStreak && el('div', {
                        style: { background: a.cardBg, borderRadius: 10, padding: '8px 18px', textAlign: 'center', borderTop: '4px solid #f97316' }
                    },
                        el('div', { style: { fontSize: 22, fontWeight: 900, color: '#f97316' } }, '🔥 0'),
                        el('div', { style: { fontSize: 12, color: a.titleColor } }, 'Streak')
                    ),
                    a.showTimer && el('div', {
                        style: { background: a.cardBg, borderRadius: 10, padding: '8px 18px', textAlign: 'center', borderTop: '4px solid #6366f1' }
                    },
                        el('div', { style: { fontSize: 22, fontWeight: 900, color: '#6366f1' } }, a.timeLimit + 's'),
                        el('div', { style: { fontSize: 12, color: a.titleColor } }, 'Time')
                    )
                ),
                // Scrambled word display
                el('div', {
                    style: {
                        background: a.cardBg, borderRadius: 14, padding: '20px 24px', marginBottom: 14,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                    }
                },
                    el('div', { style: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: a.titleColor + '88', marginBottom: 8 } }, CATEGORIES[a.defaultCategory] || 'Category'),
                    el('div', { style: { display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 } },
                        scrambled.split('').map(function (ch, i) {
                            return el('div', {
                                key: i,
                                style: {
                                    width: 38, height: 44, borderRadius: 8, border: '2px solid ' + a.accentColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22, fontWeight: 900, color: a.accentColor, background: a.sectionBg
                                }
                            }, ch);
                        })
                    ),
                    el('input', {
                        type: 'text', readOnly: true, placeholder: 'Type your answer…',
                        style: {
                            width: '100%', padding: '10px 14px', borderRadius: 8,
                            border: '2px solid #e5e7eb', fontSize: 15, textAlign: 'center',
                            fontFamily: 'monospace', boxSizing: 'border-box'
                        }
                    })
                ),
                // Buttons
                el('div', { style: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' } },
                    el('button', {
                        style: { background: a.accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'default' }
                    }, 'Check'),
                    el('button', {
                        style: { background: 'transparent', color: a.accentColor, border: '2px solid ' + a.accentColor, borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'default' }
                    }, '💡 Hint (' + a.hintsAllowed + ')')
                )
            )
        );
    }

    registerBlockType('blockenberg/word-scramble', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save({ style: getTypoCssVars(a) }),
                el('div', { className: 'bkbg-wsc-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-wsc-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p',  className: 'bkbg-wsc-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
