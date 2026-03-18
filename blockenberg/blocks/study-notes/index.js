( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── helpers ────────────────────────────────────────────────────
    function updateNote(notes, idx, field, val) {
        return notes.map(function (n, i) {
            if (i !== idx) return n;
            var u = {}; u[field] = val;
            return Object.assign({}, n, u);
        });
    }
    function addNote(notes) {
        return notes.concat([{ cue: 'New cue / question', content: 'Notes for this cue…' }]);
    }
    function removeNote(notes, idx) {
        return notes.filter(function (_, i) { return i !== idx; });
    }
    function updateTerm(terms, idx, field, val) {
        return terms.map(function (t, i) {
            if (i !== idx) return t;
            var u = {}; u[field] = val;
            return Object.assign({}, t, u);
        });
    }
    function addTerm(terms) {
        return terms.concat([{ term: 'New Term', definition: 'Definition goes here.' }]);
    }
    function removeTerm(terms, idx) {
        return terms.filter(function (_, i) { return i !== idx; });
    }

    registerBlockType('blockenberg/study-notes', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var lhState = useState(null);
            var lhIdx = lhState[0]; var setLhIdx = lhState[1];

            var layoutOptions = [
                { label: 'Cornell (Cue | Notes)',    value: 'cornell' },
                { label: 'Linear (stacked)',          value: 'linear' },
                { label: 'Cards',                     value: 'cards'  }
            ];

            // preview row for cornell
            function noteRow(note, idx) {
                var isExpanded = lhIdx === idx;
                var cueW = (a.cueWidth || 30) + '%';
                return el('div', {
                    key: idx,
                    style: {
                        display: 'flex',
                        borderBottom: '1px solid ' + a.rowBorderColor,
                        fontSize: (a.fontSize || 14) + 'px'
                    }
                },
                    // cue column
                    el('div', { style: { width: cueW, flexShrink: 0, padding: '12px 14px', background: a.cueBg, borderRight: '1px solid ' + a.cueBorderColor, color: a.cueColor, fontWeight: 600, lineHeight: 1.5, cursor: 'pointer' }, onClick: function () { setLhIdx(isExpanded ? null : idx); } },
                        el('div', { style: { marginBottom: 8 } }, note.cue),
                        el(TextareaControl, { value: note.cue, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ notes: updateNote(a.notes, idx, 'cue', v) }); } })
                    ),
                    // notes column
                    el('div', { style: { flex: 1, padding: '12px 14px', background: a.notesBg, color: a.notesColor } },
                        el(TextareaControl, { value: note.content, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ notes: updateNote(a.notes, idx, 'content', v) }); } }),
                        el(Button, { isDestructive: true, variant: 'link', style: { marginTop: 4, fontSize: 11 }, onClick: function () { set({ notes: removeNote(a.notes, idx) }); } }, '✕ Remove row')
                    )
                );
            }

            function cardRow(note, idx) {
                return el('div', {
                    key: idx,
                    style: {
                        background: a.notesBg,
                        border: '1px solid ' + a.rowBorderColor,
                        borderRadius: 8,
                        padding: '14px 16px',
                        fontSize: (a.fontSize || 14) + 'px'
                    }
                },
                    el('div', { style: { fontWeight: 700, color: a.cueColor, marginBottom: 6 } }, note.cue),
                    el(TextControl, { label: 'Cue / Keyword', value: note.cue, __nextHasNoMarginBottom: true, onChange: function (v) { set({ notes: updateNote(a.notes, idx, 'cue', v) }); } }),
                    el('div', { style: { marginTop: 8 } },
                        el(TextareaControl, { label: 'Notes', value: note.content, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ notes: updateNote(a.notes, idx, 'content', v) }); } })
                    ),
                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11, marginTop: 6 }, onClick: function () { set({ notes: removeNote(a.notes, idx) }); } }, '✕ Remove')
                );
            }

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bksn-tt-'));
                Object.assign(s, _tvf(a.textTypo,  '--bksn-tx-'));
                return { className: 'bkbg-sn-editor-wrap', style: s };
            })());

            return el(Fragment, null,
                el('div', blockProps,
                    // ── Header preview ─────────────────────────────
                    el('div', { style: { background: a.headerBg, color: a.headerColor, borderRadius: (a.borderRadius || 10) + 'px ' + (a.borderRadius || 10) + 'px 0 0', padding: '16px 20px' } },
                        el('div', { style: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 } },
                            el('h3', { className: 'bkbg-sn-topic', style: { margin: 0, color: a.headerColor } }, a.topic || 'Topic'),
                            a.showSubject && el('span', { style: { background: 'rgba(255,255,255,.2)', padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 } }, a.subject)
                        ),
                        el('div', { style: { display: 'flex', gap: 16, marginTop: 6, fontSize: 13, opacity: .8 } },
                            a.showSource && el('span', null, '📖 ' + a.source),
                            a.showDate   && el('span', null, '📅 ' + a.noteDate)
                        )
                    ),
                    // ── Cornell column headers ─────────────────────
                    a.layout === 'cornell' && el('div', { style: { display: 'flex', background: a.accentColor, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' } },
                        el('div', { style: { width: (a.cueWidth || 30) + '%', padding: '6px 14px', borderRight: '1px solid rgba(255,255,255,.3)' } }, 'Cues / Questions'),
                        el('div', { style: { flex: 1, padding: '6px 14px' } }, 'Notes')
                    ),
                    // ── Notes rows ────────────────────────────────
                    el('div', { style: { border: '1px solid ' + a.borderColor, borderTop: 'none', background: a.layout === 'cards' ? 'transparent' : a.notesBg } },
                        a.layout === 'cards'
                            ? el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12, padding: 14 } },
                                a.notes.map(function (n, i) { return cardRow(n, i); })
                              )
                            : a.notes.map(function (n, i) { return noteRow(n, i); })
                    ),
                    el('div', { style: { marginTop: 8 } },
                        el(Button, { variant: 'secondary', onClick: function () { set({ notes: addNote(a.notes) }); } }, '+ Add Row')
                    ),
                    // ── Summary ────────────────────────────────────
                    a.showSummary && el('div', { style: { marginTop: 12, background: a.summaryBg, border: '1px solid ' + a.summaryBorderColor, borderRadius: 8, padding: '14px 16px' } },
                        el('div', { style: { fontWeight: 700, fontSize: (a.summarySize || 12), textTransform: 'uppercase', letterSpacing: '0.06em', color: a.summaryColor, marginBottom: 6 } }, a.summaryLabel || 'Summary'),
                        el(TextareaControl, { value: a.summary, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ summary: v }); } })
                    ),
                    // ── Key Terms ──────────────────────────────────
                    a.showKeyTerms && el('div', { style: { marginTop: 12, background: a.keyTermsBg, border: '1px solid ' + a.keyTermsBorderColor, borderRadius: 8, padding: '14px 16px' } },
                        el('div', { style: { fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: a.keyTermsColor, marginBottom: 10 } }, a.keyTermsLabel || 'Key Terms'),
                        a.keyTerms.map(function (t, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' } },
                                el('div', { style: { flex: '0 0 36%' } },
                                    el(TextControl, { placeholder: 'Term', value: t.term, __nextHasNoMarginBottom: true, onChange: function (v) { set({ keyTerms: updateTerm(a.keyTerms, i, 'term', v) }); } })
                                ),
                                el('div', { style: { flex: 1 } },
                                    el(TextControl, { placeholder: 'Definition', value: t.definition, __nextHasNoMarginBottom: true, onChange: function (v) { set({ keyTerms: updateTerm(a.keyTerms, i, 'definition', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11, paddingTop: 4 }, onClick: function () { set({ keyTerms: removeTerm(a.keyTerms, i) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 4 }, onClick: function () { set({ keyTerms: addTerm(a.keyTerms) }); } }, '+ Add Term')
                    ),
                    // ── Tags ────────────────────────────────────────
                    a.showTags && a.tags.length > 0 && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 } },
                        a.tags.map(function (tag, i) {
                            return el('span', { key: i, style: { background: a.tagBg, color: a.tagColor, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 } }, tag);
                        })
                    )
                ),
                // ── Inspector ──────────────────────────────────────
                el(InspectorControls, null,
                    // Note Info
                    el(PanelBody, { title: 'Note Details', initialOpen: true },
                        el(TextControl, { label: 'Topic / Title', value: a.topic, __nextHasNoMarginBottom: true, onChange: function (v) { set({ topic: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Subject', value: a.subject, __nextHasNoMarginBottom: true, onChange: function (v) { set({ subject: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Source / Professor', value: a.source, __nextHasNoMarginBottom: true, onChange: function (v) { set({ source: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Date', value: a.noteDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ noteDate: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Subject Badge', checked: a.showSubject, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSubject: v }); } })
                        ),
                        el(ToggleControl, { label: 'Show Source', checked: a.showSource, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSource: v }); } }),
                        el(ToggleControl, { label: 'Show Date', checked: a.showDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDate: v }); } })
                    ),
                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { label: 'Notes Layout', value: a.layout, options: layoutOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ layout: v }); } }),
                        a.layout === 'cornell' && el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Cue Column Width (%)', value: a.cueWidth, min: 20, max: 45, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cueWidth: v }); } })
                        )
                    ),
                    // Summary & Key Terms
                    el(PanelBody, { title: 'Summary & Key Terms', initialOpen: false },
                        el(ToggleControl, { label: 'Show Summary', checked: a.showSummary, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSummary: v }); } }),
                        el('div', { style: { marginTop: 6 } },
                            el(TextControl, { label: 'Summary Label', value: a.summaryLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ summaryLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Key Terms', checked: a.showKeyTerms, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showKeyTerms: v }); } })
                        ),
                        el('div', { style: { marginTop: 6 } },
                            el(TextControl, { label: 'Key Terms Label', value: a.keyTermsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ keyTermsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Tags', checked: a.showTags, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTags: v }); } })
                        ),
                        a.showTags && el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Tags (comma-separated)', value: a.tags.join(', '), __nextHasNoMarginBottom: true, onChange: function (v) { set({ tags: v.split(',').map(function (t) { return t.trim(); }).filter(Boolean) }); } })
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl()({ label: 'Title', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl()({ label: 'Text / Notes', value: a.textTypo, onChange: function (v) { set({ textTypo: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Summary Size (px)', value: a.summarySize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ summarySize: v }); } })
                        )
                    ),
                    // Colors — Header
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Header Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header Background', value: a.headerBg,    onChange: function (v) { set({ headerBg: v || '#1e3a5f' }); } },
                            { label: 'Header Text',       value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Accent / Stripe',   value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } }
                        ]
                    }),
                    // Colors — Notes
                    el(PanelColorSettings, {
                        title: 'Notes Area Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Block Background',  value: a.bgColor,         onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',            value: a.borderColor,     onChange: function (v) { set({ borderColor: v || '#d1d5db' }); } },
                            { label: 'Cue Column BG',     value: a.cueBg,           onChange: function (v) { set({ cueBg: v || '#f8fafc' }); } },
                            { label: 'Cue Text / Keywords', value: a.cueColor,      onChange: function (v) { set({ cueColor: v || '#1e40af' }); } },
                            { label: 'Cue Border',        value: a.cueBorderColor,  onChange: function (v) { set({ cueBorderColor: v || '#e2e8f0' }); } },
                            { label: 'Notes Background',  value: a.notesBg,         onChange: function (v) { set({ notesBg: v || '#ffffff' }); } },
                            { label: 'Notes Text',        value: a.notesColor,      onChange: function (v) { set({ notesColor: v || '#374151' }); } },
                            { label: 'Row Divider',       value: a.rowBorderColor,  onChange: function (v) { set({ rowBorderColor: v || '#e5e7eb' }); } }
                        ]
                    }),
                    // Colors — Summary & Terms
                    el(PanelColorSettings, {
                        title: 'Summary & Key Terms Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Summary Background',    value: a.summaryBg,          onChange: function (v) { set({ summaryBg: v || '#fefce8' }); } },
                            { label: 'Summary Text',         value: a.summaryColor,        onChange: function (v) { set({ summaryColor: v || '#1c1917' }); } },
                            { label: 'Summary Border',       value: a.summaryBorderColor,  onChange: function (v) { set({ summaryBorderColor: v || '#fde68a' }); } },
                            { label: 'Key Terms Background', value: a.keyTermsBg,          onChange: function (v) { set({ keyTermsBg: v || '#f0f9ff' }); } },
                            { label: 'Key Terms Text',       value: a.keyTermsColor,       onChange: function (v) { set({ keyTermsColor: v || '#0f172a' }); } },
                            { label: 'Key Terms Border',     value: a.keyTermsBorderColor, onChange: function (v) { set({ keyTermsBorderColor: v || '#bae6fd' }); } },
                            { label: 'Term Word Color',      value: a.termColor,           onChange: function (v) { set({ termColor: v || '#0369a1' }); } },
                            { label: 'Tag Background',       value: a.tagBg,               onChange: function (v) { set({ tagBg: v || '#e0e7ff' }); } },
                            { label: 'Tag Text',             value: a.tagColor,            onChange: function (v) { set({ tagColor: v || '#3730a3' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-study-notes-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
