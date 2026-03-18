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

    var _tc, _tvf;
    Object.defineProperty(window, '_tc', { get: function () { return _tc || (_tc = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(p, key, label) { return _tc ? _tc(p, key, label) : null; }
    function getTypoCssVars(a) {
        if (!_tvf) return {};
        var v = {};
        Object.assign(v, _tvf(a.titleTypo || {}, '--bktc-tt-'));
        Object.assign(v, _tvf(a.bodyTypo || {}, '--bktc-bt-'));
        return v;
    }

    // ── helpers ───────────────────────────────────────────────────
    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    var difficultyOptions = [
        { label: '🟢 Beginner',     value: 'beginner'     },
        { label: '🟡 Intermediate', value: 'intermediate' },
        { label: '🔴 Advanced',     value: 'advanced'     }
    ];

    function difficultyInfo(d) {
        if (d === 'beginner')     return { label: '🟢 Beginner',     bg: '#dcfce7', color: '#14532d' };
        if (d === 'advanced')     return { label: '🔴 Advanced',     bg: '#fee2e2', color: '#991b1b' };
        return                           { label: '🟡 Intermediate', bg: '#fef9c3', color: '#854d0e' };
    }

    function sectionHead(label, a) {
        return el('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 } },
            el('span', { style: { fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: a.accentColor } }, label),
            el('div',  { style: { flex: 1, height: 1, background: a.borderColor } })
        );
    }

    registerBlockType('blockenberg/tutorial-card', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars(a);
                var s = {};
                Object.assign(s, _tv);
                return { className: 'bkbg-tc-editor-wrap', style: s };
            })());
            var diff = difficultyInfo(a.difficulty);

            // ── preview ───────────────────────────────────────────
            var preview = el('div', { style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { style: { background: a.headerBg, color: a.headerColor, padding: '20px 24px' } },
                    el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 10 } },
                        el('span', { style: { background: diff.bg, color: diff.color, padding: '3px 10px', borderRadius: 100, fontSize: (a.subtitleSize || 11), fontWeight: 700 } }, diff.label),
                        a.showDuration && a.duration && el('span', { style: { fontSize: 12, opacity: .8 } }, '⏱ ' + a.duration),
                        a.showAuthor && a.author && el('span', { style: { fontSize: (a.authorSize || 12), opacity: .8 } }, '✍️ ' + a.author)
                    ),
                    el('h2', { className: 'bkbg-tc-title', style: { margin: '0 0 6px', color: a.headerColor, lineHeight: 1.25 } }, a.tutorialTitle),
                    a.subtitle && el('p', { className: 'bkbg-tc-subtitle', style: { margin: 0, opacity: .8, color: a.headerColor } }, a.subtitle),
                    a.showProgress && el('div', { style: { marginTop: 14 } },
                        el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, opacity: .8 } },
                            el('span', null, 'Progress'),
                            el('span', null, a.completionRate + '%')
                        ),
                        el('div', { style: { background: 'rgba(255,255,255,.2)', borderRadius: 100, height: 6 } },
                            el('div', { style: { background: a.progressFill, borderRadius: 100, height: '100%', width: a.completionRate + '%' } })
                        )
                    )
                ),
                // Body
                el('div', { style: { padding: '20px 24px' } },
                    // Outcomes
                    a.showOutcomes && a.outcomes.length > 0 && el('div', { style: { marginBottom: 18 } },
                        sectionHead(a.outcomesLabel || "What you'll learn", a),
                        el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                            a.outcomes.map(function (item, i) {
                                return el('li', { key: i, style: { display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 } },
                                    el('span', { style: { background: a.outcomeBg, color: a.outcomeColor, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 } }, '✓'),
                                    el('span', { className: 'bkbg-tc-body-text', style: { color: '#374151' } }, item.text)
                                );
                            })
                        )
                    ),
                    // Prerequisites & Materials row
                    (a.showPrerequisites || a.showMaterials) && el('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 } },
                        a.showPrerequisites && a.prerequisites.length > 0 && el('div', { style: { flex: '1 1 200px' } },
                            sectionHead(a.prerequisitesLabel || 'Prerequisites', a),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.prerequisites.map(function (item, i) {
                                    return el('li', { key: i, style: { background: a.prerequisiteBg, color: a.prerequisiteColor, padding: '4px 10px', borderRadius: 6, marginBottom: 4 } }, '→ ' + item.text);
                                })
                            )
                        ),
                        a.showMaterials && a.materials.length > 0 && el('div', { style: { flex: '1 1 200px' } },
                            sectionHead(a.materialsLabel || "What you'll need", a),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.materials.map(function (item, i) {
                                    return el('li', { key: i, style: { background: a.materialBg, color: a.materialColor, padding: '4px 10px', borderRadius: 6, marginBottom: 4 } }, '◈ ' + item.text);
                                })
                            )
                        )
                    ),
                    // Steps
                    a.showSteps && a.steps.length > 0 && el('div', null,
                        sectionHead(a.stepsLabel || 'Steps', a),
                        a.steps.map(function (step, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: i < a.steps.length - 1 ? '1px solid ' + a.stepBorderColor : 'none' } },
                                // Step number circle
                                el('div', { style: { background: a.stepNumberBg, color: a.stepNumberColor, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 } }, i + 1),
                                el('div', { style: { flex: 1 } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 } },
                                        el('strong', { className: 'bkbg-tc-step-title', style: { color: '#0f172a' } }, step.title || 'Step ' + (i + 1)),
                                        a.showStepDurations && step.duration && el('span', { style: { fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' } }, '⏱ ' + step.duration)
                                    ),
                                    el('p', { className: 'bkbg-tc-step-content', style: { margin: '0 0 8px', color: '#374151' } }, step.content),
                                    a.showTips && step.tip && el('div', { style: { background: a.stepTipBg, color: a.stepTipColor, borderLeft: '3px solid ' + a.stepTipBorderColor, padding: '6px 10px', borderRadius: '0 6px 6px 0' } },
                                        el('strong', null, '💡 Tip: '), step.tip
                                    )
                                )
                            );
                        })
                    )
                )
            );

            // ── Inspector ─────────────────────────────────────────
            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Tutorial Info
                    el(PanelBody, { title: 'Tutorial Info', initialOpen: true },
                        el(TextControl, { label: 'Title', value: a.tutorialTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ tutorialTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Subtitle', value: a.subtitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ subtitle: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Author', value: a.author, __nextHasNoMarginBottom: true, onChange: function (v) { set({ author: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Duration', value: a.duration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ duration: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Difficulty', value: a.difficulty, options: difficultyOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ difficulty: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
                            el(ToggleControl, { label: 'Show Author', checked: a.showAuthor, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showAuthor: v }); } }),
                            el(ToggleControl, { label: 'Show Duration', checked: a.showDuration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDuration: v }); } }),
                            el(ToggleControl, { label: 'Show Progress', checked: a.showProgress, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showProgress: v }); } })
                        ),
                        a.showProgress && el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Completion (%)', value: a.completionRate, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ completionRate: v }); } })
                        )
                    ),
                    // Learning Outcomes
                    el(PanelBody, { title: 'Learning Outcomes', initialOpen: false },
                        el(ToggleControl, { label: 'Show Outcomes', checked: a.showOutcomes, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showOutcomes: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.outcomesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ outcomesLabel: v }); } })
                        ),
                        a.outcomes.map(function (item, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 4, alignItems: 'center', marginTop: 8 } },
                                el('div', { style: { flex: 1 } },
                                    el(TextControl, { value: item.text, __nextHasNoMarginBottom: true, onChange: function (v) { set({ outcomes: upd(a.outcomes, i, 'text', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ outcomes: a.outcomes.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ outcomes: a.outcomes.concat([{ text: 'New learning outcome' }]) }); } }, '+ Add Outcome')
                    ),
                    // Prerequisites
                    el(PanelBody, { title: 'Prerequisites', initialOpen: false },
                        el(ToggleControl, { label: 'Show Prerequisites', checked: a.showPrerequisites, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPrerequisites: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.prerequisitesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ prerequisitesLabel: v }); } })
                        ),
                        a.prerequisites.map(function (item, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 4, alignItems: 'center', marginTop: 8 } },
                                el('div', { style: { flex: 1 } },
                                    el(TextControl, { value: item.text, __nextHasNoMarginBottom: true, onChange: function (v) { set({ prerequisites: upd(a.prerequisites, i, 'text', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ prerequisites: a.prerequisites.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ prerequisites: a.prerequisites.concat([{ text: 'New prerequisite' }]) }); } }, '+ Add Prerequisite')
                    ),
                    // Materials
                    el(PanelBody, { title: 'Materials', initialOpen: false },
                        el(ToggleControl, { label: 'Show Materials', checked: a.showMaterials, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMaterials: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.materialsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ materialsLabel: v }); } })
                        ),
                        a.materials.map(function (item, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 4, alignItems: 'center', marginTop: 8 } },
                                el('div', { style: { flex: 1 } },
                                    el(TextControl, { value: item.text, __nextHasNoMarginBottom: true, onChange: function (v) { set({ materials: upd(a.materials, i, 'text', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ materials: a.materials.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ materials: a.materials.concat([{ text: 'New material' }]) }); } }, '+ Add Material')
                    ),
                    // Steps
                    el(PanelBody, { title: 'Steps', initialOpen: false },
                        el(ToggleControl, { label: 'Show Steps', checked: a.showSteps, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSteps: v }); } }),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
                            el(ToggleControl, { label: 'Show Durations', checked: a.showStepDurations, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showStepDurations: v }); } }),
                            el(ToggleControl, { label: 'Show Tips', checked: a.showTips, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTips: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.stepsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ stepsLabel: v }); } })
                        ),
                        a.steps.map(function (step, i) {
                            return el('div', { key: i, style: { marginTop: 14, padding: '12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
                                    el('strong', { style: { fontSize: 12, color: '#374151' } }, 'Step ' + (i + 1)),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ steps: a.steps.filter(function (_, j) { return j !== i; }) }); } }, '✕ Remove')
                                ),
                                el(TextControl, { label: 'Title', value: step.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ steps: upd(a.steps, i, 'title', v) }); } }),
                                el('div', { style: { marginTop: 8 } },
                                    el(TextareaControl, { label: 'Content', value: step.content, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ steps: upd(a.steps, i, 'content', v) }); } })
                                ),
                                el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                                    el(TextControl, { label: 'Duration', value: step.duration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ steps: upd(a.steps, i, 'duration', v) }); } }),
                                    el(TextControl, { label: 'Tip (optional)', value: step.tip, __nextHasNoMarginBottom: true, onChange: function (v) { set({ steps: upd(a.steps, i, 'tip', v) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 10 }, onClick: function () { set({ steps: a.steps.concat([{ title: 'New Step', content: 'Describe this step...', duration: '5 min', tip: '' }]) }); } }, '+ Add Step')
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl(props, 'titleTypo', 'Title'),
                        getTypoControl(props, 'bodyTypo', 'Body'),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Badge Size (px)', value: a.subtitleSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ subtitleSize: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Author Size (px)', value: a.authorSize, min: 8, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ authorSize: v }); } })
                        )
                    ),
                    // Colors: Header & Structure
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Header & Structure Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Block Background', value: a.bgColor,          onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',           value: a.borderColor,      onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Header Background',value: a.headerBg,         onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',      value: a.headerColor,      onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Accent Color',     value: a.accentColor,      onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } },
                            { label: 'Progress Fill',    value: a.progressFill,     onChange: function (v) { set({ progressFill: v || '#3b82f6' }); } }
                        ]
                    }),
                    // Colors: Steps
                    el(PanelColorSettings, {
                        title: 'Step Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Step Number BG',   value: a.stepNumberBg,      onChange: function (v) { set({ stepNumberBg: v || '#3b82f6' }); } },
                            { label: 'Step Number Text', value: a.stepNumberColor,   onChange: function (v) { set({ stepNumberColor: v || '#ffffff' }); } },
                            { label: 'Step Divider',     value: a.stepBorderColor,   onChange: function (v) { set({ stepBorderColor: v || '#e5e7eb' }); } },
                            { label: 'Tip Background',   value: a.stepTipBg,         onChange: function (v) { set({ stepTipBg: v || '#fffbeb' }); } },
                            { label: 'Tip Text',         value: a.stepTipColor,      onChange: function (v) { set({ stepTipColor: v || '#92400e' }); } },
                            { label: 'Tip Border',       value: a.stepTipBorderColor, onChange: function (v) { set({ stepTipBorderColor: v || '#fcd34d' }); } }
                        ]
                    }),
                    // Colors: Lists
                    el(PanelColorSettings, {
                        title: 'List Item Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Prerequisite BG',  value: a.prerequisiteBg,   onChange: function (v) { set({ prerequisiteBg: v || '#f1f5f9' }); } },
                            { label: 'Prerequisite Text', value: a.prerequisiteColor, onChange: function (v) { set({ prerequisiteColor: v || '#334155' }); } },
                            { label: 'Material BG',      value: a.materialBg,       onChange: function (v) { set({ materialBg: v || '#f0f9ff' }); } },
                            { label: 'Material Text',    value: a.materialColor,    onChange: function (v) { set({ materialColor: v || '#0c4a6e' }); } },
                            { label: 'Outcome BG',       value: a.outcomeBg,        onChange: function (v) { set({ outcomeBg: v || '#f0fdf4' }); } },
                            { label: 'Outcome Text',     value: a.outcomeColor,     onChange: function (v) { set({ outcomeColor: v || '#14532d' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            var a = props.attributes;
            var bp = useBlockProps.save((function () {
                var _tv = getTypoCssVars(a);
                var s = {};
                Object.assign(s, _tv);
                return { style: s };
            })());
            return wp.element.createElement('div', bp,
                wp.element.createElement('div', {
                    className: 'bkbg-tutorial-card-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
