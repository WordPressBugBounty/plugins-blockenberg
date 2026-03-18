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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // Demo puzzle for editor preview (0 = empty)
    var DEMO = [
        [5,3,0, 0,7,0, 0,0,0],
        [6,0,0, 1,9,5, 0,0,0],
        [0,9,8, 0,0,0, 0,6,0],

        [8,0,0, 0,6,0, 0,0,3],
        [4,0,0, 8,0,3, 0,0,1],
        [7,0,0, 0,2,0, 0,0,6],

        [0,6,0, 0,0,0, 2,8,0],
        [0,0,0, 4,1,9, 0,0,5],
        [0,0,0, 0,8,0, 0,7,9]
    ];

    function SudokuGrid(props) {
        var a = props;
        var rows = [];
        for (var r = 0; r < 9; r++) {
            var cells = [];
            for (var c = 0; c < 9; c++) {
                var val = DEMO[r][c];
                var borderRight  = (c === 2 || c === 5) ? '2px solid ' + a.givenColor : '1px solid #d1d5db';
                var borderBottom = (r === 2 || r === 5) ? '2px solid ' + a.givenColor : '1px solid #d1d5db';
                cells.push(el('div', {
                    key: c,
                    style: {
                        width: 40, height: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: val ? 700 : 400,
                        color: val ? a.givenColor : a.enteredColor,
                        background: val ? a.gridBg : a.highlightBg,
                        borderRight: borderRight, borderBottom: borderBottom,
                        cursor: 'pointer', userSelect: 'none',
                        transition: 'background 0.15s'
                    }
                }, val || ''));
            }
            rows.push(el('div', { key: r, style: { display: 'flex' } }, cells));
        }
        return el('div', {
            style: {
                display: 'inline-block',
                border: '2px solid ' + a.givenColor,
                borderRadius: 8,
                overflow: 'hidden',
                background: a.gridBg
            }
        }, rows);
    }

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var blockProps = useBlockProps((function () {
            var _tvf = getTypoCssVars();
            var s = { background: a.sectionBg, borderRadius: 16, padding: '28px 20px', textAlign: 'center' };
            if (_tvf) {
                Object.assign(s, _tvf(a.titleTypo, '--bksdk-tt-'));
                Object.assign(s, _tvf(a.subtitleTypo, '--bksdk-st-'));
            }
            return { className: 'bkbg-sdk-wrap', style: s };
        })());

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Game Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Default Difficulty', 'blockenberg'),
                        value: a.defaultDifficulty,
                        options: [
                            { label: 'Easy', value: 'easy' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'Hard', value: 'hard' },
                            { label: 'Expert', value: 'expert' }
                        ],
                        onChange: function (v) { setAttributes({ defaultDifficulty: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Mistakes Allowed', 'blockenberg'),
                        value: a.maxMistakes, min: 1, max: 10,
                        onChange: function (v) { setAttributes({ maxMistakes: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Hints Allowed', 'blockenberg'),
                        value: a.hintsAllowed, min: 0, max: 10,
                        onChange: function (v) { setAttributes({ hintsAllowed: v }); }
                    }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Timer', 'blockenberg'), checked: a.showTimer, onChange: function (v) { setAttributes({ showTimer: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Mistake Counter', 'blockenberg'), checked: a.showMistakes, onChange: function (v) { setAttributes({ showMistakes: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Highlight Related Cells', 'blockenberg'), checked: a.highlightRelated, onChange: function (v) { setAttributes({ highlightRelated: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Highlight Same Number', 'blockenberg'), checked: a.highlightSameNumber, onChange: function (v) { setAttributes({ highlightSameNumber: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                    getTypoControl()({ label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { setAttributes({ subtitleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Accent', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } },
                        { label: __('Given Numbers', 'blockenberg'), value: a.givenColor, onChange: function (v) { setAttributes({ givenColor: v || '#1e1b4b' }); } },
                        { label: __('Entered Numbers', 'blockenberg'), value: a.enteredColor, onChange: function (v) { setAttributes({ enteredColor: v || '#6366f1' }); } },
                        { label: __('Error Color', 'blockenberg'), value: a.errorColor, onChange: function (v) { setAttributes({ errorColor: v || '#ef4444' }); } },
                        { label: __('Related Highlight', 'blockenberg'), value: a.highlightBg, onChange: function (v) { setAttributes({ highlightBg: v || '#e0e7ff' }); } },
                        { label: __('Selected Cell', 'blockenberg'), value: a.selectedBg, onChange: function (v) { setAttributes({ selectedBg: v || '#c7d2fe' }); } },
                        { label: __('Grid Background', 'blockenberg'), value: a.gridBg, onChange: function (v) { setAttributes({ gridBg: v || '#ffffff' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f5f3ff' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, {
                    tagName: 'h3', className: 'bkbg-sdk-title',
                    value: a.title, onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Sudoku', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 4px' }
                }),
                el(RichText, {
                    tagName: 'p', className: 'bkbg-sdk-subtitle',
                    value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Subtitle', 'blockenberg'),
                    style: { color: a.titleColor + 'bb', margin: '0 0 18px' }
                }),
                // Stats bar
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' } },
                    ['Easy','Medium','Hard','Expert'].map(function (d) {
                        var active = d.toLowerCase() === a.defaultDifficulty;
                        return el('button', {
                            key: d,
                            style: {
                                padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                border: '2px solid ' + a.accentColor, cursor: 'default',
                                background: active ? a.accentColor : 'transparent',
                                color: active ? '#fff' : a.accentColor
                            }
                        }, d);
                    })
                ),
                // Info row
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 14 } },
                    a.showTimer && el('div', { style: { fontWeight: 700, color: a.titleColor } }, '⏱ 0:00'),
                    a.showMistakes && el('div', { style: { fontWeight: 700, color: a.errorColor } }, '✕ 0 / ' + a.maxMistakes),
                    el('div', { style: { fontWeight: 700, color: a.accentColor } }, '💡 ' + a.hintsAllowed)
                ),
                el('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 14 } },
                    el(SudokuGrid, a)
                ),
                // Number pad
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' } },
                    [1,2,3,4,5,6,7,8,9].map(function (n) {
                        return el('button', {
                            key: n,
                            style: {
                                width: 40, height: 40, borderRadius: 8, border: '2px solid ' + a.accentColor,
                                background: 'transparent', color: a.accentColor, fontSize: 18, fontWeight: 700, cursor: 'default'
                            }
                        }, n);
                    }),
                    el('button', {
                        style: {
                            width: 40, height: 40, borderRadius: 8, border: '2px solid #9ca3af',
                            background: 'transparent', color: '#9ca3af', fontSize: 18, cursor: 'default'
                        }
                    }, '✕')
                ),
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' } },
                    el('button', { style: { background: a.accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: 'default' } }, 'New Game'),
                    el('button', { style: { background: 'transparent', border: '2px solid ' + a.accentColor, color: a.accentColor, borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'default' } }, '💡 Hint')
                )
            )
        );
    }

    registerBlockType('blockenberg/sudoku', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-sdk-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-sdk-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-sdk-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
