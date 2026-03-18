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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    function EditorPreview(props) {
        var a   = props.attributes;
        var set = props.setAttributes;

        var cellStyle = function (sym) {
            return {
                background: a.cellBg, border: '2px solid ' + a.gridLine, borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '38px', fontWeight: '900', cursor: 'pointer',
                aspectRatio: '1', color: sym === 'X' ? a.xColor : (sym === 'O' ? a.oColor : 'transparent'),
                transition: 'background 0.15s'
            };
        };

        var DEMO = ['X', '', 'O', '', 'X', '', 'O', '', ''];

        return el('div', {
            style: {
                background: a.sectionBg, borderRadius: '16px', padding: '28px 20px',
                maxWidth: a.contentMaxWidth + 'px', margin: '0 auto', fontFamily: 'inherit',
                boxSizing: 'border-box', textAlign: 'center'
            }
        },
            a.showTitle && el(RichText, {
                tagName: 'h3', value: a.title,
                className: 'bkbg-ttt-title',
                onChange: function (v) { set({ title: v }); },
                style: { color: a.titleColor, margin: '0 0 4px' },
                placeholder: 'Title…'
            }),
            a.showSubtitle && el(RichText, {
                tagName: 'p', value: a.subtitle,
                className: 'bkbg-ttt-subtitle',
                onChange: function (v) { set({ subtitle: v }); },
                style: { color: a.subtitleColor, margin: '0 0 16px' },
                placeholder: 'Subtitle…'
            }),

            /* Score */
            a.showScore && el('div', { style: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '18px' } },
                [
                    { l: a.playerSymbol || 'X', v: 3, c: a.xColor },
                    { l: 'Draw', v: 1, c: a.subtitleColor },
                    { l: a.aiSymbol || 'O',  v: 1, c: a.oColor }
                ].map(function (s, i) {
                    return el('div', { key: i, style: { background: a.cardBg, borderRadius: '10px', padding: '8px 18px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', minWidth: '70px' } },
                        el('div', { style: { fontSize: '22px', fontWeight: '900', color: s.c } }, s.v),
                        el('div', { style: { fontSize: '12px', color: a.subtitleColor } }, s.l)
                    );
                })
            ),

            /* Status */
            el('div', { style: { background: a.accentColor, color: '#fff', borderRadius: '10px', padding: '10px', marginBottom: '16px', fontWeight: '700', fontSize: '15px' } },
                '🎮 Your turn (' + (a.playerSymbol || 'X') + ')'
            ),

            /* Board */
            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', maxWidth: '280px', margin: '0 auto 18px' } },
                DEMO.map(function (s, i) {
                    return el('div', { key: i, style: cellStyle(s) }, s || '\u00a0');
                })
            ),

            /* Buttons */
            el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
                el('button', { style: { background: a.accentColor, color: '#fff', border: 'none', borderRadius: '9px', padding: '10px 24px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } }, '↺ New Game'),
                el('button', { style: { background: 'transparent', border: '2px solid ' + a.accentColor, color: a.accentColor, borderRadius: '9px', padding: '9px 18px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' } },
                    a.defaultMode === 'ai' ? '🤖 vs AI' : '👥 2 Players'
                )
            )
        );
    }

    registerBlockType('blockenberg/tic-tac-toe', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bkttt-tt-'), _tvf(a.subtitleTypo, '--bkttt-st-'));
                return { className: 'bkbg-ttt-root', style: tv };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(ToggleControl, { label: 'Show Title',    checked: a.showTitle,    onChange: function (v) { set({ showTitle: v }); },    __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Subtitle', checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Score',    checked: a.showScore,    onChange: function (v) { set({ showScore: v }); },    __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Game Settings', initialOpen: false },
                        el(SelectControl, {
                            label: 'Default Mode',
                            value: a.defaultMode,
                            options: [
                                { label: '🤖 Player vs AI',       value: 'ai' },
                                { label: '👥 Player vs Player',   value: 'pvp' }
                            ],
                            onChange: function (v) { set({ defaultMode: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { marginBottom: '16px' } }),
                        a.defaultMode === 'ai' && el(SelectControl, {
                            label: 'AI Difficulty',
                            value: a.aiDifficulty,
                            options: [
                                { label: 'Easy (random)',   value: 'easy' },
                                { label: 'Medium (smart)',  value: 'medium' },
                                { label: 'Hard (minimax)', value: 'hard' }
                            ],
                            onChange: function (v) { set({ aiDifficulty: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(TextControl, {
                            label: 'Player Symbol',
                            value: a.playerSymbol,
                            onChange: function (v) { set({ playerSymbol: v.slice(0, 2) || 'X' }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(TextControl, {
                            label: 'AI / P2 Symbol',
                            value: a.aiSymbol,
                            onChange: function (v) { set({ aiSymbol: v.slice(0, 2) || 'O' }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Subtitle Typography', 'blockenberg'),
                            value: a.subtitleTypo || {},
                            onChange: function (v) { set({ subtitleTypo: v }); }
                        }),
                        el(RangeControl, {
                            label: 'Max Width (px)', value: a.contentMaxWidth, min: 300, max: 800, step: 10,
                            onChange: function (v) { set({ contentMaxWidth: v }); }, __nextHasNoMarginBottom: true
                        })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Accent Color',        value: a.accentColor,   onChange: function (v) { set({ accentColor:   v || '#6366f1' }); } },
                            { label: 'X Symbol Color',      value: a.xColor,        onChange: function (v) { set({ xColor:        v || '#ef4444' }); } },
                            { label: 'O Symbol Color',      value: a.oColor,        onChange: function (v) { set({ oColor:        v || '#3b82f6' }); } },
                            { label: 'Cell Background',     value: a.cellBg,        onChange: function (v) { set({ cellBg:        v || '#ffffff' }); } },
                            { label: 'Win Line Color',      value: a.winLineBg,     onChange: function (v) { set({ winLineBg:     v || '#22c55e' }); } },
                            { label: 'Grid Lines',          value: a.gridLine,      onChange: function (v) { set({ gridLine:      v || '#d1d5db' }); } },
                            { label: 'Section Background',  value: a.sectionBg,     onChange: function (v) { set({ sectionBg:    v || '#eef2ff' }); } },
                            { label: 'Card Background',     value: a.cardBg,        onChange: function (v) { set({ cardBg:       v || '#ffffff' }); } },
                            { label: 'Title Color',         value: a.titleColor,    onChange: function (v) { set({ titleColor:   v || '#312e81' }); } }
                        ]
                    })
                ),
                el('div', blockProps, el(EditorPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function (props) {
            var a = props.attributes;
            var bp = wp.blockEditor.useBlockProps.save((function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bkttt-tt-'), _tvf(a.subtitleTypo, '--bkttt-st-'));
                return { style: tv };
            })());
            return el('div', bp,
                el('div', { className: 'bkbg-ttt-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
