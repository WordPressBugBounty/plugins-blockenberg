( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;
    var TextControl        = wp.components.TextControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var THEMES = {
        animals:  ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸'],
        food:     ['🍕','🍔','🍟','🌮','🌯','🍜','🍣','🍩','🍪','🎂','🍦','🍫'],
        nature:   ['🌸','🌺','🌻','🌹','🌷','🍀','🍁','🍂','🌿','🎋','🌵','🌴'],
        space:    ['🚀','🌍','🌙','⭐','☀️','🪐','🌟','💫','🌌','🔭','👨‍🚀','🛸'],
        sports:   ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🎯'],
        symbols:  ['❤️','⚡','🔥','💎','🎵','🌈','💡','🔑','🎭','🎨','🎪','🎲']
    };

    var GRID_SIZES = { easy: 4, medium: 4, hard: 6 };
    var PAIR_COUNTS = { easy: 6, medium: 8, hard: 12 };

    function EditorPreview(props) {
        var a = props.attributes;
        var pairs = PAIR_COUNTS[a.defaultDifficulty] || 8;
        var gridCols = GRID_SIZES[a.defaultDifficulty] || 4;
        var icons = (THEMES[a.defaultTheme] || THEMES.animals).slice(0, pairs);
        var cards = icons.concat(icons).sort(function () { return Math.random() - 0.5; });

        var cellSize = Math.min(70, Math.floor(((a.contentMaxWidth || 620) - 48) / gridCols - 8));

        return el('div', {
            style: {
                background: a.sectionBg, borderRadius: '16px', padding: '28px 20px',
                maxWidth: a.contentMaxWidth + 'px', margin: '0 auto', fontFamily: 'inherit', boxSizing: 'border-box'
            }
        },
            a.showTitle && el(RichText, {
                tagName: 'h3', className: 'bkbg-mem-title', value: a.title,
                onChange: function (v) { props.setAttributes({ title: v }); },
                style: { color: a.titleColor, textAlign: 'center' },
                placeholder: 'Title…'
            }),
            a.showSubtitle && el(RichText, {
                tagName: 'p', className: 'bkbg-mem-subtitle', value: a.subtitle,
                onChange: function (v) { props.setAttributes({ subtitle: v }); },
                style: { color: a.subtitleColor, textAlign: 'center' },
                placeholder: 'Subtitle…'
            }),

            /* Stats bar */
            el('div', { style: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' } },
                a.showTimer && el('div', { style: { background: a.cardBg, borderRadius: '8px', padding: '8px 16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } },
                    el('div', { style: { fontSize: '20px', fontWeight: '800', color: a.accentColor } }, '0:00'),
                    el('div', { style: { fontSize: '11px', color: a.subtitleColor } }, 'Time')
                ),
                a.showMoves && el('div', { style: { background: a.cardBg, borderRadius: '8px', padding: '8px 16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } },
                    el('div', { style: { fontSize: '20px', fontWeight: '800', color: a.accentColor } }, '0'),
                    el('div', { style: { fontSize: '11px', color: a.subtitleColor } }, 'Moves')
                ),
                a.showBestScore && el('div', { style: { background: a.cardBg, borderRadius: '8px', padding: '8px 16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } },
                    el('div', { style: { fontSize: '20px', fontWeight: '800', color: a.accentColor } }, '—'),
                    el('div', { style: { fontSize: '11px', color: a.subtitleColor } }, 'Best')
                )
            ),

            /* Card grid */
            el('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(' + gridCols + ', 1fr)',
                    gap: '8px',
                    marginBottom: '16px'
                }
            },
                cards.map(function (icon, i) {
                    var isFlipped = i < 3;
                    return el('div', {
                        key: i,
                        style: {
                            height: cellSize + 'px', borderRadius: '10px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: cellSize * 0.45 + 'px',
                            background: isFlipped ? a.cardFront : a.cardBack,
                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: isFlipped ? '2px solid ' + a.accentColor + '44' : 'none',
                            transition: 'transform 0.3s'
                        }
                    }, isFlipped ? icon : '?')
                })
            ),

            /* Start button */
            el('div', { style: { textAlign: 'center' } },
                el('button', {
                    style: {
                        background: a.accentColor, color: '#fff', border: 'none',
                        borderRadius: '10px', padding: '12px 32px', fontSize: '16px',
                        fontWeight: '700', cursor: 'pointer'
                    }
                }, '▶ Start Game')
            )
        );
    }

    registerBlockType('blockenberg/memory-game', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = (function(p){
                var v = getTypoCssVars() || function () { return {}; };
                p.style = Object.assign(p.style||{},
                    v(a.titleTypo,'--bkbg-mem-tt-'),
                    v(a.subtitleTypo,'--bkbg-mem-st-')
                ); return p;
            })(useBlockProps({ className: 'bkbg-mem-root' }));

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(ToggleControl, { label: 'Show Title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Subtitle', checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Game Settings', initialOpen: false },
                        el(SelectControl, {
                            label: 'Default Difficulty',
                            value: a.defaultDifficulty,
                            options: [
                                { label: 'Easy (6 pairs, 4×3)', value: 'easy' },
                                { label: 'Medium (8 pairs, 4×4)', value: 'medium' },
                                { label: 'Hard (12 pairs, 6×4)', value: 'hard' }
                            ],
                            onChange: function (v) { set({ defaultDifficulty: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(SelectControl, {
                            label: 'Card Theme',
                            value: a.defaultTheme,
                            options: [
                                { label: 'Animals 🐶', value: 'animals' },
                                { label: 'Food 🍕', value: 'food' },
                                { label: 'Nature 🌸', value: 'nature' },
                                { label: 'Space 🚀', value: 'space' },
                                { label: 'Sports ⚽', value: 'sports' },
                                { label: 'Symbols ❤️', value: 'symbols' }
                            ],
                            onChange: function (v) { set({ defaultTheme: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(RangeControl, {
                            label: 'Flip Delay (ms)',
                            value: a.flipDelay, min: 400, max: 2000, step: 100,
                            onChange: function (v) { set({ flipDelay: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(ToggleControl, { label: 'Show Timer', checked: a.showTimer, onChange: function (v) { set({ showTimer: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Move Counter', checked: a.showMoves, onChange: function (v) { set({ showMoves: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Best Score', checked: a.showBestScore, onChange: function (v) { set({ showBestScore: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(RangeControl, {
                            label: 'Max Width (px)', value: a.contentMaxWidth, min: 320, max: 900, step: 10,
                            onChange: function (v) { set({ contentMaxWidth: v }); }, __nextHasNoMarginBottom: true
                        })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: 'Title', value: a.titleTypo || {}, onChange: function(v){ set({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Subtitle', value: a.subtitleTypo || {}, onChange: function(v){ set({ subtitleTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Accent Color',    value: a.accentColor,   onChange: function (v) { set({ accentColor:   v || '#8b5cf6' }); } },
                            { label: 'Card Back',       value: a.cardBack,      onChange: function (v) { set({ cardBack:      v || '#8b5cf6' }); } },
                            { label: 'Card Front',      value: a.cardFront,     onChange: function (v) { set({ cardFront:     v || '#ffffff' }); } },
                            { label: 'Matched Card',    value: a.cardMatched,   onChange: function (v) { set({ cardMatched:   v || '#22c55e' }); } },
                            { label: 'Section Background', value: a.sectionBg,  onChange: function (v) { set({ sectionBg:     v || '#f5f3ff' }); } },
                            { label: 'Card Background', value: a.cardBg,        onChange: function (v) { set({ cardBg:        v || '#ffffff' }); } },
                            { label: 'Title Color',     value: a.titleColor,    onChange: function (v) { set({ titleColor:    v || '#4c1d95' }); } },
                            { label: 'Subtitle Color',  value: a.subtitleColor, onChange: function (v) { set({ subtitleColor: v || '#6b7280' }); } }
                        ]
                    })
                ),
                el('div', blockProps, el(EditorPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function (props) {
            var a   = props.attributes;
            var ubp = wp.blockEditor.useBlockProps;
            var v = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
            var s = Object.assign({},
                v(a.titleTypo,'--bkbg-mem-tt-'),
                v(a.subtitleTypo,'--bkbg-mem-st-')
            );
            return el('div', (function(p){p.style=Object.assign(p.style||{},s);return p;})(ubp.save()),
                el('div', { className: 'bkbg-mem-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
