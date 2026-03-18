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

    /* ── lazy typography helpers ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    Object.defineProperty(window, '__bkG48_tvf', { get: function () { delete window.__bkG48_tvf; return (window.__bkG48_tvf = window.bkbgTypoCssVars || function () { return {}; }); } });
    function getTypoCssVars(a) {
        var o = {};
        Object.assign(o, window.__bkG48_tvf(a.titleTypo || {}, '--bkg48-tt-'));
        Object.assign(o, window.__bkG48_tvf(a.subtitleTypo || {}, '--bkg48-st-'));
        return o;
    }

    var TILE_COLORS = {
        0:    { bg: '#cdc1b4', text: '#776e65' },
        2:    { bg: '#eee4da', text: '#776e65' },
        4:    { bg: '#ede0c8', text: '#776e65' },
        8:    { bg: '#f2b179', text: '#f9f6f2' },
        16:   { bg: '#f59563', text: '#f9f6f2' },
        32:   { bg: '#f67c5f', text: '#f9f6f2' },
        64:   { bg: '#f65e3b', text: '#f9f6f2' },
        128:  { bg: '#edcf72', text: '#f9f6f2' },
        256:  { bg: '#edcc61', text: '#f9f6f2' },
        512:  { bg: '#edc850', text: '#f9f6f2' },
        1024: { bg: '#edc53f', text: '#f9f6f2' },
        2048: { bg: '#edc22e', text: '#f9f6f2' }
    };

    var DEMO = [
        [2,    4,    8,    16   ],
        [32,   64,   128,  256  ],
        [0,    0,    512,  1024 ],
        [0,    0,    0,    2048 ]
    ];

    function TileGrid(props) {
        var a = props;
        var sz    = a.boardSize || 380;
        var gap   = a.gridGap  || 10;
        var rad   = a.tileRadius || 8;
        var cells = [];

        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                var val = DEMO[r][c];
                var tc  = TILE_COLORS[val] || { bg: '#3c3a32', text: '#f9f6f2' };
                var fs  = val < 100 ? 36 : val < 1000 ? 26 : val < 10000 ? 20 : 16;
                cells.push(el('div', {
                    key: r + '_' + c,
                    style: {
                        background: tc.bg,
                        color: tc.text,
                        borderRadius: rad,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: fs, fontWeight: 700,
                        fontFamily: "'Helvetica Neue', Arial, sans-serif"
                    }
                }, val > 0 ? val : null));
            }
        }

        return el('div', { style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: gap,
            background: a.gridBg || '#bbada0',
            padding: gap,
            borderRadius: rad + gap,
            width: sz, height: sz, boxSizing: 'border-box',
            userSelect: 'none'
        } }, cells);
    }

    function ScoreBox(label, value, bg) {
        return el('div', { style: { background: bg || '#bbada0', borderRadius: 6, padding: '6px 14px', textAlign: 'center', minWidth: 70 } },
            el('div', { style: { fontSize: 11, fontWeight: 700, color: '#eee4da', letterSpacing: 1, textTransform: 'uppercase' } }, label),
            el('div', { style: { fontSize: 22, fontWeight: 700, color: '#fff' } }, value)
        );
    }

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var blockProps = useBlockProps((function () {
            var s = getTypoCssVars(a);
            s.background = a.sectionBg || '#fef9ee';
            s.padding = '28px 20px';
            return { style: s };
        })());

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Board Settings', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Board Size (px)', 'blockenberg'), value: a.boardSize, min: 260, max: 560,
                        onChange: function (v) { setAttributes({ boardSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Tile Radius (px)', 'blockenberg'), value: a.tileRadius, min: 0, max: 24,
                        onChange: function (v) { setAttributes({ tileRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Grid Gap (px)', 'blockenberg'), value: a.gridGap, min: 4, max: 20,
                        onChange: function (v) { setAttributes({ gridGap: v }); }
                    }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Score', 'blockenberg'), checked: a.showScore, onChange: function (v) { setAttributes({ showScore: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Best Score', 'blockenberg'), checked: a.showBestScore, onChange: function (v) { setAttributes({ showBestScore: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Animate Tiles', 'blockenberg'), checked: a.animateTiles, onChange: function (v) { setAttributes({ animateTiles: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                    _tc() && el(_tc(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { setAttributes({ subtitleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Grid Background', 'blockenberg'),    value: a.gridBg,       onChange: function (v) { setAttributes({ gridBg: v || '#bbada0' }); } },
                        { label: __('Empty Tile', 'blockenberg'),         value: a.tileBg,       onChange: function (v) { setAttributes({ tileBg: v || '#cdc1b4' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg,    onChange: function (v) { setAttributes({ sectionBg: v || '#fef9ee' }); } },
                        { label: __('Title / Text', 'blockenberg'),       value: a.titleColor,   onChange: function (v) { setAttributes({ titleColor: v || '#776e65' }); } },
                        { label: __('Score Header', 'blockenberg'),       value: a.scoreHeaderBg,onChange: function (v) { setAttributes({ scoreHeaderBg: v || '#bbada0' }); } },
                        { label: __('New Game Button', 'blockenberg'),    value: a.newGameBg,    onChange: function (v) { setAttributes({ newGameBg: v || '#8f7a66' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                // Header row
                el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 } },
                    el('div', null,
                        el(RichText, {
                            tagName: 'h2', className: 'bkbg-g48-title', value: a.title,
                            onChange: function (v) { setAttributes({ title: v }); },
                            placeholder: '2048',
                            style: { color: a.titleColor, margin: 0 }
                        }),
                        el(RichText, {
                            tagName: 'p', className: 'bkbg-g48-subtitle', value: a.subtitle,
                            onChange: function (v) { setAttributes({ subtitle: v }); },
                            placeholder: 'Combine tiles to reach 2048!',
                            style: { color: a.titleColor, margin: '2px 0 0', opacity: 0.75 }
                        })
                    ),
                    el('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } },
                        a.showScore     && ScoreBox('Score', '0', a.scoreHeaderBg),
                        a.showBestScore && ScoreBox('Best', '0', a.scoreHeaderBg),
                        el('button', { style: { background: a.newGameBg, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer' } }, 'New Game')
                    )
                ),
                // Board preview
                el('div', { style: { display: 'flex', justifyContent: 'center' } },
                    el(TileGrid, a)
                ),
                el('p', { style: { textAlign: 'center', fontSize: 13, color: a.titleColor, opacity: 0.6, marginTop: 10 } },
                    '← → ↑ ↓ arrow keys or swipe to play'
                )
            )
        );
    }

    registerBlockType('blockenberg/game-2048', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            var sv = getTypoCssVars(a);
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-g48-app', 'data-opts': JSON.stringify(a), style: sv },
                    el(RichText.Content, { tagName: 'h2', className: 'bkbg-g48-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-g48-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
