( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var TETROMINOES = {
        I: { cells: [[0,1],[1,1],[2,1],[3,1]], color: '#06b6d4' },
        O: { cells: [[0,0],[0,1],[1,0],[1,1]], color: '#f59e0b' },
        T: { cells: [[0,1],[1,0],[1,1],[1,2]], color: '#a855f7' },
        S: { cells: [[0,1],[0,2],[1,0],[1,1]], color: '#22c55e' },
        Z: { cells: [[0,0],[0,1],[1,1],[1,2]], color: '#ef4444' },
        L: { cells: [[0,2],[1,0],[1,1],[1,2]], color: '#f97316' },
        J: { cells: [[0,0],[1,0],[1,1],[1,2]], color: '#3b82f6' }
    };

    var PIECES = Object.keys(TETROMINOES);

    // Demo board for editor preview — show a partially filled board
    var DEMO_BOARD = (function () {
        var board = [];
        for (var r = 0; r < 20; r++) {
            board.push([]);
            for (var c = 0; c < 10; c++) {
                var filled = false;
                if (r >= 16 && c !== 4 && c !== 5) filled = true;
                if (r === 15 && (c <= 2 || c >= 8)) filled = true;
                board[r].push(filled ? (r % 7 === 0 ? '#06b6d4' : r % 5 === 0 ? '#ef4444' : r % 3 === 0 ? '#22c55e' : '#a855f7') : null);
            }
        }
        // Place a falling T piece
        [[2,4],[2,5],[2,6],[3,5]].forEach(function (pos) { board[pos[0]][pos[1]] = '#a855f7'; });
        return board;
    })();

    // Demo next piece
    var NEXT_PREVIEW = [ [false, true, false], [true, true, false], [false, false, false] ];

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var cs = a.cellSize || 30;
        var W  = 10 * cs;
        var H  = 20 * cs;

        var blockProps = (function () {
            var s = { background: a.sectionBg || '#0f0e17', padding: '28px 16px' };
            var _tvf = getTypoCssVars();
            if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkttr-tt-'), _tvf(a.subtitleTypo, '--bkttr-st-')); }
            return useBlockProps({ style: s });
        })();

        function StatBox(label, val) {
            return el('div', { style: { background: a.bgColor, border: '1px solid ' + a.accentColor + '44', borderRadius: 8, padding: '10px 14px', marginBottom: 8 } },
                el('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: a.accentColor, textTransform: 'uppercase', marginBottom: 2 } }, label),
                el('div', { style: { fontSize: 24, fontWeight: 700, color: a.titleColor } }, val)
            );
        }

        var boardCells = [];
        for (var r = 0; r < 20; r++) {
            for (var c = 0; c < 10; c++) {
                var cellColor = DEMO_BOARD[r][c];
                boardCells.push(el('div', {
                    key: r + '_' + c,
                    style: {
                        width: cs, height: cs,
                        background: cellColor || a.boardBg,
                        border: '1px solid ' + (a.gridColor || '#16213e'),
                        boxSizing: 'border-box',
                        borderRadius: cellColor ? 3 : 0,
                        boxShadow: cellColor ? 'inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.25)' : 'none'
                    }
                }));
            }
        }

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Game Settings', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Starting Level', 'blockenberg'), value: a.startLevel, min: 1, max: 15,
                        onChange: function (v) { setAttributes({ startLevel: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Ghost Piece', 'blockenberg'), checked: a.showGhost, onChange: function (v) { setAttributes({ showGhost: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Next Piece', 'blockenberg'), checked: a.showNext, onChange: function (v) { setAttributes({ showNext: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Score', 'blockenberg'), checked: a.showScore, onChange: function (v) { setAttributes({ showScore: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Level', 'blockenberg'), checked: a.showLevel, onChange: function (v) { setAttributes({ showLevel: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Lines', 'blockenberg'), checked: a.showLines, onChange: function (v) { setAttributes({ showLines: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && getTypoControl()({
                        label: __('Title', 'blockenberg'),
                        value: a.titleTypo || {},
                        onChange: function (v) { setAttributes({ titleTypo: v }); }
                    }),
                    getTypoControl() && getTypoControl()({
                        label: __('Subtitle', 'blockenberg'),
                        value: a.subtitleTypo || {},
                        onChange: function (v) { setAttributes({ subtitleTypo: v }); }
                    }),
                    el(RangeControl, { label: __('Cell Size (px)', 'blockenberg'), value: a.cellSize, min: 18, max: 40,
                                            onChange: function (v) { setAttributes({ cellSize: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#0f0e17' }); } },
                        { label: __('UI Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#0f0e17' }); } },
                        { label: __('Board Background', 'blockenberg'), value: a.boardBg, onChange: function (v) { setAttributes({ boardBg: v || '#1a1a2e' }); } },
                        { label: __('Grid Lines', 'blockenberg'), value: a.gridColor, onChange: function (v) { setAttributes({ gridColor: v || '#16213e' }); } },
                        { label: __('Ghost Piece', 'blockenberg'), value: a.ghostColor, onChange: function (v) { setAttributes({ ghostColor: v || 'rgba(255,255,255,0.12)' }); } },
                        { label: __('Title / Text', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#fffffe' }); } },
                        { label: __('Accent', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#ff8906' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, { tagName: 'h3', className: 'bkbg-ttr-title', value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: 'Tetris',
                    style: { color: a.titleColor, textAlign: 'center', margin: '0 0 4px' } }),
                el(RichText, { tagName: 'p', className: 'bkbg-ttr-subtitle', value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: 'Clear lines to score points!',
                    style: { color: a.titleColor, opacity: 0.65, textAlign: 'center', margin: '0 0 16px' } }),
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
                    // Board
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', width: W, height: H, flexShrink: 0, border: '2px solid ' + a.accentColor + '55', borderRadius: 4, overflow: 'hidden' } },
                        boardCells
                    ),
                    // Side panel
                    el('div', { style: { display: 'flex', flexDirection: 'column', minWidth: 110 } },
                        a.showNext && el('div', { style: { background: a.bgColor, border: '1px solid ' + a.accentColor + '44', borderRadius: 8, padding: 10, marginBottom: 8 } },
                            el('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: a.accentColor, textTransform: 'uppercase', marginBottom: 6 } }, __('Next', 'blockenberg')),
                            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,18px)', gap: 2 } },
                                [0,1,2,3,4,5,6,7,8,9,10,11].map(function (i) {
                                    var r2 = Math.floor(i / 4), c2 = i % 4;
                                    var show = (r2 === 0 && c2 >= 1 && c2 <= 2) || (r2 === 1 && c2 >= 0 && c2 <= 2) || (r2 === 2 && false);
                                    return el('div', { key: i, style: { width: 18, height: 18, background: show ? '#a855f7' : 'transparent', borderRadius: 2, boxShadow: show ? 'inset 0 2px 0 rgba(255,255,255,0.25)' : 'none' } });
                                })
                            )
                        ),
                        a.showScore && StatBox(__('Score', 'blockenberg'), '0'),
                        a.showLevel && StatBox(__('Level', 'blockenberg'), a.startLevel),
                        a.showLines && StatBox(__('Lines', 'blockenberg'), '0'),
                        el('div', { style: { fontSize: 11, color: a.titleColor, opacity: 0.5, marginTop: 6, lineHeight: 1.6 } },
                            el('div', null, '← → Move'),
                            el('div', null, '↑ Rotate'),
                            el('div', null, '↓ Soft drop'),
                            el('div', null, 'Space: Drop')
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/tetris', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            var _tvf = getTypoCssVars();
            return el('div', (function () {
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkttr-tt-'), _tvf(a.subtitleTypo, '--bkttr-st-')); }
                return useBlockProps.save({ style: s });
            })(),
                el('div', { className: 'bkbg-ttr-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-ttr-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-ttr-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
