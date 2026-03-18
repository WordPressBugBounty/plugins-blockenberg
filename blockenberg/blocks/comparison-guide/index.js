( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }
    var IP = function () { return window.bkbgIconPicker; };

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    var winnerOptions = [
        { label: 'A wins',  value: 'A'   },
        { label: 'B wins',  value: 'B'   },
        { label: 'Tie',     value: 'tie' }
    ];

    var verdictOptions = [
        { label: 'A is recommended', value: 'A'   },
        { label: 'B is recommended', value: 'B'   },
        { label: 'Tie / Depends',    value: 'tie' }
    ];

    function winnerBadge(winner, nameA, nameB, a) {
        if (winner === 'tie') return el('span', { style: { background: a.tieBg, color: a.tieColor, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700 } }, '— Tie');
        var name = winner === 'A' ? nameA : nameB;
        return el('span', { style: { background: a.winnerBadgeBg, color: a.winnerBadgeColor, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700 } }, '🏆 ' + name);
    }

    function scoreBar(score) {
        return el('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
            el('div', { style: { flex: 1, height: 6, background: '#e5e7eb', borderRadius: 100 } },
                el('div', { style: { width: score * 10 + '%', height: '100%', background: '#3b82f6', borderRadius: 100, transition: 'width .3s' } })
            ),
            el('span', { style: { fontSize: 11, fontWeight: 700, color: '#374151', minWidth: 20 } }, score)
        );
    }

    registerBlockType('blockenberg/comparison-guide', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-cg-editor-wrap' });

            var verdictName = a.verdictWinner === 'A' ? a.nameA : (a.verdictWinner === 'B' ? a.nameB : 'Tie');

            var preview = el('div', { style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Guide header
                el('div', { style: { background: a.headerBg, padding: '22px 28px 18px', borderBottom: '1px solid ' + a.borderColor } },
                    el('h2', { style: { margin: '0 0 8px', fontSize: a.titleFontSize + 'px', color: a.titleColor, lineHeight: 1.2 } }, a.guideTitle),
                    a.showIntro && a.intro && el('p', { style: { margin: 0, fontSize: a.fontSize + 'px', color: a.introColor, lineHeight: (a.lineHeight / 100).toFixed(2), fontWeight: a.fontWeight } }, a.intro)
                ),
                // Two-column header (A vs B)
                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'stretch', borderBottom: '1px solid ' + a.borderColor } },
                    // Column A
                    el('div', { style: { background: a.colABg, padding: '18px 22px', textAlign: 'center' } },
                        el('div', { className: 'bkbg-cg-emoji', style: { fontSize: 32, marginBottom: 6 } }, IP().buildEditorIcon(a.emojiAType || 'custom-char', a.emojiA, a.emojiADashicon, a.emojiAImageUrl, a.emojiADashiconColor)),
                        el('div', { style: { fontWeight: 800, fontSize: 20, color: a.colAColor, marginBottom: 4 } }, a.nameA),
                        el('div', { style: { fontSize: 12, color: a.introColor, marginBottom: a.showScores ? 10 : 0 } }, a.descA),
                        a.showScores && el('div', null,
                            el('div', { style: { fontSize: 28, fontWeight: 800, color: a.colAColor } }, a.scoreA),
                            el('div', { style: { fontSize: 10, color: a.introColor, textTransform: 'uppercase', letterSpacing: '.06em' } }, 'Overall Score')
                        )
                    ),
                    // VS divider
                    el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', background: '#0f172a', color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '.05em', writingMode: 'vertical-lr', textOrientation: 'mixed' } }, 'VS'),
                    // Column B
                    el('div', { style: { background: a.colBBg, padding: '18px 22px', textAlign: 'center' } },
                        el('div', { className: 'bkbg-cg-emoji', style: { fontSize: 32, marginBottom: 6 } }, IP().buildEditorIcon(a.emojiBType || 'custom-char', a.emojiB, a.emojiBDashicon, a.emojiBImageUrl, a.emojiBDashiconColor)),
                        el('div', { style: { fontWeight: 800, fontSize: 20, color: a.colBColor, marginBottom: 4 } }, a.nameB),
                        el('div', { style: { fontSize: 12, color: a.introColor, marginBottom: a.showScores ? 10 : 0 } }, a.descB),
                        a.showScores && el('div', null,
                            el('div', { style: { fontSize: 28, fontWeight: 800, color: a.colBColor } }, a.scoreB),
                            el('div', { style: { fontSize: 10, color: a.introColor, textTransform: 'uppercase', letterSpacing: '.06em' } }, 'Overall Score')
                        )
                    )
                ),
                // Criteria table header
                el('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: '#0f172a', padding: '8px 16px', gap: 4 } },
                    el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8' } }, 'Criterion'),
                    el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', textAlign: 'center' } }, a.nameA),
                    el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', textAlign: 'center' } }, a.nameB),
                    el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#94a3b8', textAlign: 'center' } }, 'Winner')
                ),
                // Criteria rows
                el('div', null,
                    a.criteria.map(function (crit, i) {
                        var isAlt = i % 2 === 1;
                        return el('div', { key: i },
                            el('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', gap: 4, background: isAlt ? a.rowAltBg : a.bgColor, borderBottom: '1px solid ' + a.borderColor, alignItems: 'center' } },
                                el('div', { style: { fontWeight: 600, fontSize: a.fontSize + 'px', color: a.titleColor } }, crit.name),
                                a.showCritScores
                                    ? el('div', { style: { textAlign: 'center', fontWeight: 700, fontSize: 16, color: a.colAColor } }, crit.scoreA)
                                    : el('div'),
                                a.showCritScores
                                    ? el('div', { style: { textAlign: 'center', fontWeight: 700, fontSize: 16, color: a.colBColor } }, crit.scoreB)
                                    : el('div'),
                                el('div', { style: { textAlign: 'center' } }, winnerBadge(crit.winner, a.nameA, a.nameB, a))
                            ),
                            a.showNotes && crit.notes && el('div', { style: { padding: '0 16px 10px', background: isAlt ? a.rowAltBg : a.bgColor, fontSize: (a.fontSize - 1) + 'px', color: a.notesColor, lineHeight: (a.lineHeight / 100).toFixed(2), fontStyle: 'italic', borderBottom: '1px solid ' + a.borderColor } }, crit.notes)
                        );
                    })
                ),
                // Verdict
                a.showVerdict && el('div', { style: { background: a.verdictBg, padding: '18px 24px', color: a.verdictColor } },
                    el('div', { style: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', opacity: .55, marginBottom: 6 } }, 'Verdict'),
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } },
                        el('span', { style: { fontWeight: 800, fontSize: 20 } }, verdictName + ' wins'),
                        a.verdictWinner !== 'tie' && el('span', { className: 'bkbg-cg-emoji', style: { fontSize: 20 } }, a.verdictWinner === 'A'
                            ? IP().buildEditorIcon(a.emojiAType || 'custom-char', a.emojiA, a.emojiADashicon, a.emojiAImageUrl, a.emojiADashiconColor)
                            : IP().buildEditorIcon(a.emojiBType || 'custom-char', a.emojiB, a.emojiBDashicon, a.emojiBImageUrl, a.emojiBDashiconColor)
                        )
                    ),
                    a.verdictSummary && el('p', { style: { margin: 0, fontSize: a.fontSize + 'px', opacity: .85, lineHeight: (a.lineHeight / 100).toFixed(2), fontWeight: a.fontWeight } }, a.verdictSummary)
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Guide Info
                    el(PanelBody, { title: 'Guide Info', initialOpen: true },
                        el(TextControl, { label: 'Guide Title', value: a.guideTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ guideTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Introduction', checked: a.showIntro, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIntro: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Introduction', value: a.intro, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ intro: v }); } })
                        )
                    ),
                    // Item A
                    el(PanelBody, { title: 'Item A', initialOpen: false },
                        el(TextControl, { label: 'Name', value: a.nameA, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nameA: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(IP().IconPickerControl, IP().iconPickerProps(a, set, { charAttr: 'emojiA', typeAttr: 'emojiAType', dashiconAttr: 'emojiADashicon', imageUrlAttr: 'emojiAImageUrl', colorAttr: 'emojiADashiconColor' }))
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Description', value: a.descA, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ descA: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Overall Scores', checked: a.showScores, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showScores: v }); } })
                        ),
                        a.showScores && el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Score A (out of 100)', value: a.scoreA, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ scoreA: v }); } })
                        )
                    ),
                    // Item B
                    el(PanelBody, { title: 'Item B', initialOpen: false },
                        el(TextControl, { label: 'Name', value: a.nameB, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nameB: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(IP().IconPickerControl, IP().iconPickerProps(a, set, { charAttr: 'emojiB', typeAttr: 'emojiBType', dashiconAttr: 'emojiBDashicon', imageUrlAttr: 'emojiBImageUrl', colorAttr: 'emojiBDashiconColor' }))
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Description', value: a.descB, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ descB: v }); } })
                        ),
                        a.showScores && el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Score B (out of 100)', value: a.scoreB, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ scoreB: v }); } })
                        )
                    ),
                    // Criteria
                    el(PanelBody, { title: 'Criteria', initialOpen: false },
                        el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 } },
                            el(ToggleControl, { label: 'Show Scores', checked: a.showCritScores, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showCritScores: v }); } }),
                            el(ToggleControl, { label: 'Show Notes', checked: a.showNotes, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNotes: v }); } })
                        ),
                        a.criteria.map(function (crit, i) {
                            return el('div', { key: i, style: { marginBottom: 12, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' } },
                                    el('strong', { style: { fontSize: 11, color: '#374151' } }, 'Criterion ' + (i + 1)),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ criteria: a.criteria.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                ),
                                el(TextControl, { label: 'Name', value: crit.name, __nextHasNoMarginBottom: true, onChange: function (v) { set({ criteria: upd(a.criteria, i, 'name', v) }); } }),
                                el('div', { style: { marginTop: 8 } },
                                    el(SelectControl, { label: 'Winner', value: crit.winner, options: winnerOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ criteria: upd(a.criteria, i, 'winner', v) }); } })
                                ),
                                a.showCritScores && el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                                    el(RangeControl, { label: a.nameA + ' Score', value: crit.scoreA, min: 0, max: 10, __nextHasNoMarginBottom: true, onChange: function (v) { set({ criteria: upd(a.criteria, i, 'scoreA', v) }); } }),
                                    el(RangeControl, { label: a.nameB + ' Score', value: crit.scoreB, min: 0, max: 10, __nextHasNoMarginBottom: true, onChange: function (v) { set({ criteria: upd(a.criteria, i, 'scoreB', v) }); } })
                                ),
                                a.showNotes && el('div', { style: { marginTop: 8 } },
                                    el(TextareaControl, { label: 'Notes', value: crit.notes, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ criteria: upd(a.criteria, i, 'notes', v) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () {
                            set({ criteria: a.criteria.concat([{ name: 'New Criterion', winner: 'tie', scoreA: 5, scoreB: 5, notes: '' }]) });
                        } }, '+ Add Criterion')
                    ),
                    // Verdict
                    el(PanelBody, { title: 'Verdict', initialOpen: false },
                        el(ToggleControl, { label: 'Show Verdict', checked: a.showVerdict, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showVerdict: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Recommended Winner', value: a.verdictWinner, options: verdictOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ verdictWinner: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Verdict Summary', value: a.verdictSummary, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ verdictSummary: v }); } })
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Body Typography', 'blockenberg'), value: a.typoBody, onChange: function (v) { set({ typoBody: v }); } })
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    // Colors
                    el(PanelColorSettings, {
                        title: 'Layout Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Background',  value: a.bgColor,     onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',      value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Header BG',   value: a.headerBg,   onChange: function (v) { set({ headerBg: v || '#f8fafc' }); } },
                            { label: 'Title',       value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#0f172a' }); } },
                            { label: 'Intro Text',  value: a.introColor, onChange: function (v) { set({ introColor: v || '#374151' }); } },
                            { label: 'Row Alt BG',  value: a.rowAltBg,   onChange: function (v) { set({ rowAltBg: v || '#f8fafc' }); } },
                            { label: 'Notes Text',  value: a.notesColor, onChange: function (v) { set({ notesColor: v || '#6b7280' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Item & Badge Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'A Column BG',      value: a.colABg,         onChange: function (v) { set({ colABg: v || '#eff6ff' }); } },
                            { label: 'A Column Text',    value: a.colAColor,      onChange: function (v) { set({ colAColor: v || '#1e3a8a' }); } },
                            { label: 'B Column BG',      value: a.colBBg,         onChange: function (v) { set({ colBBg: v || '#f0fdf4' }); } },
                            { label: 'B Column Text',    value: a.colBColor,      onChange: function (v) { set({ colBColor: v || '#14532d' }); } },
                            { label: 'Winner Badge BG',  value: a.winnerBadgeBg,  onChange: function (v) { set({ winnerBadgeBg: v || '#fef9c3' }); } },
                            { label: 'Winner Badge Text',value: a.winnerBadgeColor,onChange: function (v) { set({ winnerBadgeColor: v || '#713f12' }); } },
                            { label: 'Tie Badge BG',     value: a.tieBg,          onChange: function (v) { set({ tieBg: v || '#f1f5f9' }); } },
                            { label: 'Tie Badge Text',   value: a.tieColor,       onChange: function (v) { set({ tieColor: v || '#475569' }); } },
                            { label: 'Verdict BG',       value: a.verdictBg,      onChange: function (v) { set({ verdictBg: v || '#0f172a' }); } },
                            { label: 'Verdict Text',     value: a.verdictColor,   onChange: function (v) { set({ verdictColor: v || '#ffffff' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            var sv = Object.assign({}, _tv(a.typoTitle, '--bkcg-title-'), _tv(a.typoBody, '--bkcg-body-'));
            return wp.element.createElement('div', useBlockProps.save({ style: sv }),
                wp.element.createElement('div', {
                    className: 'bkbg-comparison-guide-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
