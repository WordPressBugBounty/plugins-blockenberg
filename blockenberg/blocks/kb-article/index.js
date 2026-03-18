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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    // ── helpers ────────────────────────────────────────────────────
    function updateSection(sections, idx, field, val) {
        return sections.map(function (s, i) {
            if (i !== idx) return s;
            var u = {}; u[field] = val;
            return Object.assign({}, s, u);
        });
    }
    function addSection(sections) {
        return sections.concat([{ heading: 'New Section', content: 'Section content goes here.', type: 'normal' }]);
    }
    function removeSection(sections, idx) {
        return sections.filter(function (_, i) { return i !== idx; });
    }
    function updateRelated(arr, idx, field, val) {
        return arr.map(function (r, i) {
            if (i !== idx) return r;
            var u = {}; u[field] = val;
            return Object.assign({}, r, u);
        });
    }

    function difficultyBadge(diff) {
        var map = { beginner: { label: '🟢 Beginner', bg: '#dcfce7', color: '#14532d' }, intermediate: { label: '🟡 Intermediate', bg: '#fef9c3', color: '#713f12' }, advanced: { label: '🟠 Advanced', bg: '#ffedd5', color: '#9a3412' }, expert: { label: '🔴 Expert', bg: '#fee2e2', color: '#991b1b' } };
        return map[diff] || map.beginner;
    }

    var sectionTypeOptions = [
        { label: 'Normal', value: 'normal' },
        { label: 'Step', value: 'step' },
        { label: 'Info / Tip', value: 'info' },
        { label: 'Warning', value: 'warning' }
    ];

    var difficultyOptions = [
        { label: '🟢 Beginner', value: 'beginner' },
        { label: '🟡 Intermediate', value: 'intermediate' },
        { label: '🟠 Advanced', value: 'advanced' },
        { label: '🔴 Expert', value: 'expert' }
    ];

    registerBlockType('blockenberg/kb-article', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var db = difficultyBadge(a.difficulty);
            var stepNum = 0;

            function sectionPreview(s, idx) {
                var isStep = s.type === 'step';
                var isInfo = s.type === 'info';
                var isWarn = s.type === 'warning';
                if (isStep) stepNum++;

                var secStyle = {
                    marginBottom: 16,
                    padding: isInfo || isWarn ? '14px 16px' : '0',
                    borderLeft: isInfo ? '4px solid ' + a.infoBorderColor : isWarn ? '4px solid ' + a.warningBorderColor : 'none',
                    background: isInfo ? a.infoBg : isWarn ? a.warningBg : 'transparent',
                    borderRadius: isInfo || isWarn ? 6 : 0
                };

                return el('div', { key: idx, style: secStyle },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
                        isStep && el('span', { style: { width: 26, height: 26, borderRadius: '50%', background: a.stepNumberBg, color: a.stepNumberColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 } }, stepNum),
                        el('h4', { style: { margin: 0, fontSize: 16, fontWeight: 700, color: isInfo ? a.infoColor : isWarn ? a.warningColor : a.headingColor } },
                            isInfo ? '💡 ' : isWarn ? '⚠️ ' : '',
                            s.heading
                        )
                    ),
                    el('p', { style: { margin: 0, color: isInfo ? a.infoColor : isWarn ? a.warningColor : a.textColor } }, s.content)
                );
            }

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(a.titleTypo, '--bkbg-kba-tt-'));
                Object.assign(s, _tv(a.bodyTypo, '--bkbg-kba-bd-'));
                return { className: 'bkbg-kba-editor-wrap', style: s };
            })());

            return el(Fragment, null,
                el('div', blockProps,
                    // ── Header ─────────────────────────────────────
                    el('div', { style: { background: a.headerBg, padding: '20px 24px', borderRadius: (a.borderRadius || 10) + 'px ' + (a.borderRadius || 10) + 'px 0 0', borderBottom: '1px solid ' + a.borderColor } },
                        a.showCategory && el('div', { style: { fontSize: 12, color: a.categoryColor, marginBottom: 6 } },
                            a.category, a.subcategory ? el('span', null, ' › ' + a.subcategory) : null
                        ),
                        el('h2', { className: 'bkbg-kba-title', style: { margin: '0 0 10px', color: a.titleColor } }, a.articleTitle),
                        el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', fontSize: 13, color: a.categoryColor } },
                            a.showDifficulty && el('span', { style: { background: db.bg, color: db.color, padding: '2px 10px', borderRadius: 100, fontWeight: 600, fontSize: 12 } }, db.label),
                            a.showReadTime    && el('span', null, '⏱ ' + a.readTime),
                            a.showLastUpdated && el('span', null, '🗓 Updated ' + a.lastUpdated),
                            a.showAppliesTo   && el('span', null, '✅ ' + a.appliesTo)
                        )
                    ),
                    // ── Body ───────────────────────────────────────
                    el('div', { style: { padding: '20px 24px', background: a.bgColor, maxWidth: (a.maxWidth || 820) + 'px' } },
                        // Intro
                        a.showIntro && el('p', { className: 'bkbg-kba-intro', style: { margin: '0 0 18px', color: a.textColor } }, a.intro),
                        // TOC
                        a.showToc && a.sections.length > 0 && el('div', { style: { background: a.tocBg, borderRadius: 8, padding: '14px 18px', marginBottom: 20 } },
                            el('div', { style: { fontWeight: 700, fontSize: 13, color: a.tocColor, marginBottom: 8 } }, a.tocLabel || 'In this article'),
                            el('ol', { style: { margin: 0, paddingLeft: 20, color: a.tocLinkColor } },
                                a.sections.map(function (s, i) {
                                    return el('li', { key: i, style: { marginBottom: 4, fontSize: 14 } }, s.heading);
                                })
                            )
                        ),
                        // Sections
                        (function () { stepNum = 0; return a.sections.map(function (s, i) { return sectionPreview(s, i); }); })()
                    )
                ),
                // ── Inspector ──────────────────────────────────────
                el(InspectorControls, null,
                    // Article Info
                    el(PanelBody, { title: 'Article Info', initialOpen: true },
                        el(TextControl, { label: 'Article Title', value: a.articleTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ articleTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Category', value: a.category, __nextHasNoMarginBottom: true, onChange: function (v) { set({ category: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Subcategory', value: a.subcategory, __nextHasNoMarginBottom: true, onChange: function (v) { set({ subcategory: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Last Updated', value: a.lastUpdated, __nextHasNoMarginBottom: true, onChange: function (v) { set({ lastUpdated: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Read Time', value: a.readTime, __nextHasNoMarginBottom: true, onChange: function (v) { set({ readTime: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Applies To', value: a.appliesTo, __nextHasNoMarginBottom: true, onChange: function (v) { set({ appliesTo: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Difficulty', value: a.difficulty, options: difficultyOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ difficulty: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
                            el(ToggleControl, { label: 'Category', checked: a.showCategory, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showCategory: v }); } }),
                            el(ToggleControl, { label: 'Difficulty', checked: a.showDifficulty, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDifficulty: v }); } }),
                            el(ToggleControl, { label: 'Read Time', checked: a.showReadTime, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showReadTime: v }); } }),
                            el(ToggleControl, { label: 'Last Updated', checked: a.showLastUpdated, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLastUpdated: v }); } }),
                            el(ToggleControl, { label: 'Applies To', checked: a.showAppliesTo, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showAppliesTo: v }); } })
                        )
                    ),
                    // Intro
                    el(PanelBody, { title: 'Introduction', initialOpen: false },
                        el(ToggleControl, { label: 'Show Introduction', checked: a.showIntro, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIntro: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Intro Paragraph', value: a.intro, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ intro: v }); } })
                        )
                    ),
                    // Table of Contents
                    el(PanelBody, { title: 'Table of Contents', initialOpen: false },
                        el(ToggleControl, { label: 'Show Table of Contents', checked: a.showToc, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showToc: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'TOC Label', value: a.tocLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ tocLabel: v }); } })
                        )
                    ),
                    // Sections
                    el(PanelBody, { title: 'Sections (' + a.sections.length + ')', initialOpen: false },
                        a.sections.map(function (s, idx) {
                            return el('div', { key: idx, style: { marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' } },
                                el(TextControl, { label: 'Heading ' + (idx + 1), value: s.heading, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sections: updateSection(a.sections, idx, 'heading', v) }); } }),
                                el('div', { style: { marginTop: 6 } },
                                    el(TextareaControl, { label: 'Content', value: s.content, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sections: updateSection(a.sections, idx, 'content', v) }); } })
                                ),
                                el('div', { style: { marginTop: 6 } },
                                    el(SelectControl, { label: 'Type', value: s.type, options: sectionTypeOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sections: updateSection(a.sections, idx, 'type', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11, marginTop: 4 }, onClick: function () { set({ sections: removeSection(a.sections, idx) }); } }, '✕ Remove section')
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: function () { set({ sections: addSection(a.sections) }); } }, '+ Add Section')
                    ),
                    // Tags & Related
                    el(PanelBody, { title: 'Tags & Related Articles', initialOpen: false },
                        el(ToggleControl, { label: 'Show Tags', checked: a.showTags, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTags: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Tags (comma-separated)', value: a.tags.join(', '), __nextHasNoMarginBottom: true, onChange: function (v) { set({ tags: v.split(',').map(function (t) { return t.trim(); }).filter(Boolean) }); } })
                        ),
                        el('div', { style: { marginTop: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12 } },
                            el(ToggleControl, { label: 'Show Related Articles', checked: a.showRelated, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showRelated: v }); } }),
                            el('div', { style: { marginTop: 8 } },
                                el(TextControl, { label: 'Related Section Label', value: a.relatedLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ relatedLabel: v }); } })
                            ),
                            a.relatedArticles.map(function (r, i) {
                                return el('div', { key: i, style: { marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' } },
                                    el('div', { style: { flex: 1 } },
                                        el(TextControl, { placeholder: 'Article title', value: r.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ relatedArticles: updateRelated(a.relatedArticles, i, 'title', v) }); } })
                                    ),
                                    el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ relatedArticles: a.relatedArticles.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ relatedArticles: a.relatedArticles.concat([{ title: 'Related article', url: '#' }]) }); } }, '+ Add Related')
                        )
                    ),
                    // Helpful Votes
                    el(PanelBody, { title: 'Helpful Votes', initialOpen: false },
                        el(ToggleControl, { label: 'Show Helpful Votes Section', checked: a.showHelpful, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHelpful: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Helpful Label', value: a.helpfulLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ helpfulLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'flex', gap: 8 } },
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, { label: '👍 Yes', value: a.helpfulYes, min: 0, max: 999, __nextHasNoMarginBottom: true, onChange: function (v) { set({ helpfulYes: v }); } })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(RangeControl, { label: '👎 No', value: a.helpfulNo, min: 0, max: 999, __nextHasNoMarginBottom: true, onChange: function (v) { set({ helpfulNo: v }); } })
                            )
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: 'Title', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        el(getTypographyControl(), { label: 'Body', value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } })
                    ),
                    el(PanelBody, { title: 'Appearance', initialOpen: false },
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 500, max: 1200, step: 10, __nextHasNoMarginBottom: true, onChange: function (v) { set({ maxWidth: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                        )
                    ),
                    // Colors — Header
                    el(PanelColorSettings, {
                        title: 'Header Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header Background', value: a.headerBg,      onChange: function (v) { set({ headerBg: v || '#f8fafc' }); } },
                            { label: 'Title Color',       value: a.titleColor,    onChange: function (v) { set({ titleColor: v || '#0f172a' }); } },
                            { label: 'Category Text',     value: a.categoryColor, onChange: function (v) { set({ categoryColor: v || '#64748b' }); } },
                            { label: 'Border',            value: a.borderColor,   onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } }
                        ]
                    }),
                    // Colors — Body
                    el(PanelColorSettings, {
                        title: 'Body Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Background',      value: a.bgColor,           onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Text',            value: a.textColor,         onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Heading',         value: a.headingColor,      onChange: function (v) { set({ headingColor: v || '#0f172a' }); } },
                            { label: 'Accent',          value: a.accentColor,       onChange: function (v) { set({ accentColor: v || '#2563eb' }); } },
                            { label: 'Section Divider', value: a.sectionBorderColor,onChange: function (v) { set({ sectionBorderColor: v || '#e5e7eb' }); } },
                            { label: 'TOC Background',  value: a.tocBg,             onChange: function (v) { set({ tocBg: v || '#f1f5f9' }); } },
                            { label: 'TOC Text',        value: a.tocColor,          onChange: function (v) { set({ tocColor: v || '#1e293b' }); } },
                            { label: 'TOC Links',       value: a.tocLinkColor,      onChange: function (v) { set({ tocLinkColor: v || '#2563eb' }); } }
                        ]
                    }),
                    // Colors — Section Types
                    el(PanelColorSettings, {
                        title: 'Section Type Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Step # Background',  value: a.stepNumberBg,      onChange: function (v) { set({ stepNumberBg: v || '#2563eb' }); } },
                            { label: 'Step # Text',        value: a.stepNumberColor,   onChange: function (v) { set({ stepNumberColor: v || '#ffffff' }); } },
                            { label: 'Info Background',    value: a.infoBg,            onChange: function (v) { set({ infoBg: v || '#eff6ff' }); } },
                            { label: 'Info Text',          value: a.infoColor,         onChange: function (v) { set({ infoColor: v || '#1e40af' }); } },
                            { label: 'Info Border',        value: a.infoBorderColor,   onChange: function (v) { set({ infoBorderColor: v || '#93c5fd' }); } },
                            { label: 'Warning Background', value: a.warningBg,         onChange: function (v) { set({ warningBg: v || '#fffbeb' }); } },
                            { label: 'Warning Text',       value: a.warningColor,      onChange: function (v) { set({ warningColor: v || '#92400e' }); } },
                            { label: 'Warning Border',     value: a.warningBorderColor,onChange: function (v) { set({ warningBorderColor: v || '#fcd34d' }); } }
                        ]
                    }),
                    // Colors — Tags & Helpful
                    el(PanelColorSettings, {
                        title: 'Tags & Helpful Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Tag Background',   value: a.tagBg,          onChange: function (v) { set({ tagBg: v || '#f1f5f9' }); } },
                            { label: 'Tag Text',         value: a.tagColor,        onChange: function (v) { set({ tagColor: v || '#475569' }); } },
                            { label: '👍 Yes Background', value: a.helpfulYesBg,   onChange: function (v) { set({ helpfulYesBg: v || '#dcfce7' }); } },
                            { label: '👍 Yes Text',       value: a.helpfulYesColor, onChange: function (v) { set({ helpfulYesColor: v || '#14532d' }); } },
                            { label: '👎 No Background',  value: a.helpfulNoBg,    onChange: function (v) { set({ helpfulNoBg: v || '#fee2e2' }); } },
                            { label: '👎 No Text',        value: a.helpfulNoColor,  onChange: function (v) { set({ helpfulNoColor: v || '#991b1b' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-kb-article-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
