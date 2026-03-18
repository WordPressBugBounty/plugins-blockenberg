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

    var _clTC, _clTV;
    function _tc() { return _clTC || (_clTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _clTV || (_clTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    var difficultyOptions = [
        { label: '🟢 Beginner',     value: 'beginner'     },
        { label: '🟡 Intermediate', value: 'intermediate' },
        { label: '🔴 Advanced',     value: 'advanced'     }
    ];

    var sectionTypeOptions = [
        { label: 'Text',    value: 'text'    },
        { label: '💡 Tip',  value: 'tip'     },
        { label: '⚠️ Warning', value: 'warning' },
        { label: '📝 Note', value: 'note'    }
    ];

    var resourceTypeOptions = [
        { label: '📄 Article',  value: 'article'  },
        { label: '🎥 Video',    value: 'video'    },
        { label: '⬇️ Download', value: 'download' },
        { label: '✏️ Exercise', value: 'exercise' },
        { label: '🔗 Link',     value: 'link'     }
    ];

    var resourceIcon = { article: '📄', video: '🎥', download: '⬇️', exercise: '✏️', link: '🔗' };
    var diffInfo = {
        beginner:     { label: '🟢 Beginner',     bg: '#dcfce7', color: '#14532d' },
        intermediate: { label: '🟡 Intermediate', bg: '#fef9c3', color: '#713f12' },
        advanced:     { label: '🔴 Advanced',     bg: '#fee2e2', color: '#991b1b' }
    };

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function sectionBoxStyle(type, a) {
        if (type === 'tip')     return { background: a.tipBg,     color: a.tipColor,     borderLeft: '4px solid ' + a.tipBorder,     borderRadius: 8 };
        if (type === 'warning') return { background: a.warningBg, color: a.warningColor, borderLeft: '4px solid ' + a.warningBorder, borderRadius: 8 };
        if (type === 'note')    return { background: a.noteBg,    color: a.noteColor,    borderLeft: '4px solid ' + a.noteBorder,    borderRadius: 8 };
        return {};
    }

    function sectionIcon(type) {
        if (type === 'tip')     return '💡 ';
        if (type === 'warning') return '⚠️ ';
        if (type === 'note')    return '📝 ';
        return '';
    }

    function labelPill(text, bg, color) {
        return el('span', { style: { background: bg, color: color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' } }, text);
    }

    function sectionHead(label, a) {
        return el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: a.accentColor, borderBottom: '2px solid ' + a.accentColor, paddingBottom: 5, marginBottom: 10 } }, label);
    }

    registerBlockType('blockenberg/course-lesson', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-cl-editor-wrap', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-cles-ttl-'), _tv(a.typoBody, '--bkbg-cles-body-')) });
            var diff = diffInfo[a.difficulty] || diffInfo.intermediate;

            var preview = el('div', { className: 'bkbg-cl-wrap', style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { style: { background: a.headerBg, padding: '20px 26px' } },
                    // Breadcrumb row
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' } },
                        a.showModule && el('span', { style: { fontSize: a.moduleTitleSize || 11, color: a.metaColor, fontWeight: 600 } }, a.moduleTitle),
                        a.showModule && a.showLessonNumber && el('span', { style: { color: a.metaColor, opacity: .4 } }, '/'),
                        a.showLessonNumber && el('span', { style: { fontSize: 11, color: a.metaColor } }, a.lessonNumber)
                    ),
                    el('h2', { className: 'bkbg-cl-title', style: { color: a.headerColor } }, a.lessonTitle),
                    // Meta pills
                    el('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                        a.showDuration && labelPill('⏱ ' + a.duration, 'rgba(255,255,255,.1)', '#cbd5e1'),
                        a.showDifficulty && labelPill(diff.label, diff.bg, diff.color),
                        a.showInstructor && labelPill('👤 ' + a.instructor, 'rgba(255,255,255,.1)', '#cbd5e1')
                    )
                ),
                // Body
                el('div', { style: { padding: '20px 26px', display: 'grid', gap: 20 } },
                    // Intro
                    a.showIntro && a.intro && el('div', { style: { background: a.introBg, borderRadius: 8, padding: '14px 18px' } },
                        el('p', { style: { margin: 0, color: a.introColor, lineHeight: (a.lineHeight / 100).toFixed(2) } }, a.intro)
                    ),
                    // Objectives + Prerequisites side-by-side
                    el('div', { style: { display: 'grid', gridTemplateColumns: a.showPrerequisites ? '1fr 1fr' : '1fr', gap: 16 } },
                        a.showObjectives && el('div', { style: { background: a.objectiveBg, padding: 16, borderRadius: 8 } },
                            sectionHead(a.objectivesLabel, a),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.objectives.map(function (obj, i) {
                                    return el('li', { key: i, style: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' } },
                                        el('span', { style: { color: a.objectiveDot, flexShrink: 0, marginTop: 1, fontWeight: 700 } }, '✓'),
                                        el('span', { style: { color: a.objectiveColor } }, obj)
                                    );
                                })
                            )
                        ),
                        a.showPrerequisites && el('div', { style: { background: a.prereqBg, padding: 16, borderRadius: 8 } },
                            sectionHead(a.prerequisitesLabel, a),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.prerequisites.map(function (p, i) {
                                    return el('li', { key: i, style: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' } },
                                        el('span', { style: { color: a.prereqDot, flexShrink: 0, marginTop: 1 } }, '•'),
                                        el('span', { style: { color: a.prereqColor } }, p)
                                    );
                                })
                            )
                        )
                    ),
                    // Content Sections
                    a.showSections && el('div', null,
                        sectionHead('Lesson Content', a),
                        el('div', { style: { display: 'grid', gap: 16 } },
                            a.sections.map(function (sec, i) {
                                var isBox = sec.type !== 'text';
                                var boxStyle = Object.assign({ padding: isBox ? '12px 16px' : '0' }, sectionBoxStyle(sec.type, a));
                                return el('div', { key: i, style: boxStyle },
                                    el('h4', { style: { margin: '0 0 6px', color: isBox ? 'inherit' : a.headingColor, fontSize: a.fontSize + 'px' } }, sectionIcon(sec.type) + sec.heading),
                                    el('p', { style: { margin: 0, color: isBox ? 'inherit' : a.textColor, fontSize: a.fontSize + 'px', lineHeight: (a.lineHeight / 100).toFixed(2) } }, sec.content)
                                );
                            })
                        )
                    ),
                    // Resources
                    a.showResources && el('div', null,
                        sectionHead(a.resourcesLabel, a),
                        el('div', { style: { display: 'grid', gap: 6 } },
                            a.resources.map(function (r, i) {
                                return el('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: a.resourceBg, borderRadius: 8, borderLeft: '3px solid ' + a.accentColor } },
                                    el('span', { style: { flexShrink: 0 } }, resourceIcon[r.type] || '🔗'),
                                    el('span', { style: { color: a.accentColor, fontWeight: 500 } }, r.title)
                                );
                            })
                        )
                    )
                ),
                // Prev/Next Nav
                a.showNav && el('div', { style: { background: a.navBg, borderTop: '1px solid ' + a.borderColor, padding: '14px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                    el('div', { style: { maxWidth: '45%' } },
                        el('div', { style: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 } }, '← Previous'),
                        el('div', { style: { fontSize: a.fontSize + 'px', color: a.accentColor, fontWeight: 600 } }, a.prevLesson)
                    ),
                    el('div', { style: { textAlign: 'right', maxWidth: '45%' } },
                        el('div', { style: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 } }, 'Next →'),
                        el('div', { style: { fontSize: a.fontSize + 'px', color: a.accentColor, fontWeight: 600 } }, a.nextLesson)
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Lesson Info
                    el(PanelBody, { title: 'Lesson Info', initialOpen: true },
                        el(TextControl, { label: 'Lesson Title', value: a.lessonTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ lessonTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Module Title', value: a.moduleTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ moduleTitle: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(ToggleControl, { label: 'Show Module', checked: a.showModule, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showModule: v }); } }),
                            el(ToggleControl, { label: 'Show Lesson #', checked: a.showLessonNumber, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLessonNumber: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Lesson Number (e.g. Lesson 3 of 8)', value: a.lessonNumber, __nextHasNoMarginBottom: true, onChange: function (v) { set({ lessonNumber: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Duration', value: a.duration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ duration: v }); } }),
                            el(TextControl, { label: 'Instructor', value: a.instructor, __nextHasNoMarginBottom: true, onChange: function (v) { set({ instructor: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Difficulty', value: a.difficulty, options: difficultyOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ difficulty: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 } },
                            el(ToggleControl, { label: 'Duration', checked: a.showDuration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDuration: v }); } }),
                            el(ToggleControl, { label: 'Difficulty', checked: a.showDifficulty, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDifficulty: v }); } }),
                            el(ToggleControl, { label: 'Instructor', checked: a.showInstructor, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showInstructor: v }); } })
                        )
                    ),
                    // Introduction
                    el(PanelBody, { title: 'Introduction', initialOpen: false },
                        el(ToggleControl, { label: 'Show Introduction', checked: a.showIntro, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIntro: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Intro Text', value: a.intro, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ intro: v }); } })
                        )
                    ),
                    // Objectives
                    el(PanelBody, { title: 'Learning Objectives', initialOpen: false },
                        el(ToggleControl, { label: 'Show Objectives', checked: a.showObjectives, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showObjectives: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.objectivesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ objectivesLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.objectives.map(function (obj, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                    el(TextControl, { label: '', value: obj, __nextHasNoMarginBottom: true, onChange: function (v) { set({ objectives: a.objectives.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ objectives: a.objectives.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ objectives: a.objectives.concat(['New objective']) }); } }, '+ Add Objective')
                        )
                    ),
                    // Prerequisites
                    el(PanelBody, { title: 'Prerequisites', initialOpen: false },
                        el(ToggleControl, { label: 'Show Prerequisites', checked: a.showPrerequisites, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPrerequisites: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.prerequisitesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ prerequisitesLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.prerequisites.map(function (p, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                    el(TextControl, { label: '', value: p, __nextHasNoMarginBottom: true, onChange: function (v) { set({ prerequisites: a.prerequisites.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ prerequisites: a.prerequisites.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ prerequisites: a.prerequisites.concat(['New prerequisite']) }); } }, '+ Add Prerequisite')
                        )
                    ),
                    // Content Sections
                    el(PanelBody, { title: 'Content Sections', initialOpen: false },
                        el(ToggleControl, { label: 'Show Content Sections', checked: a.showSections, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSections: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            a.sections.map(function (sec, i) {
                                return el('div', { key: i, style: { marginBottom: 12, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
                                        el('strong', { style: { fontSize: 11, color: '#374151' } }, 'Section ' + (i + 1)),
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ sections: a.sections.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(SelectControl, { label: 'Type', value: sec.type, options: sectionTypeOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sections: upd(a.sections, i, 'type', v) }); } }),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextControl, { label: 'Heading', value: sec.heading, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sections: upd(a.sections, i, 'heading', v) }); } })
                                    ),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextareaControl, { label: 'Content', value: sec.content, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sections: upd(a.sections, i, 'content', v) }); } })
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ sections: a.sections.concat([{ heading: 'New Section', content: '', type: 'text' }]) }); } }, '+ Add Section')
                        )
                    ),
                    // Resources
                    el(PanelBody, { title: 'Resources', initialOpen: false },
                        el(ToggleControl, { label: 'Show Resources', checked: a.showResources, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showResources: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.resourcesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resourcesLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.resources.map(function (r, i) {
                                return el('div', { key: i, style: { marginBottom: 10, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 6 } },
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ resources: a.resources.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(SelectControl, { label: 'Type', value: r.type, options: resourceTypeOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resources: upd(a.resources, i, 'type', v) }); } }),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextControl, { label: 'Title', value: r.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resources: upd(a.resources, i, 'title', v) }); } })
                                    ),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextControl, { label: 'URL', value: r.url, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resources: upd(a.resources, i, 'url', v) }); } })
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ resources: a.resources.concat([{ title: 'New Resource', url: '#', type: 'article' }]) }); } }, '+ Add Resource')
                        )
                    ),
                    // Navigation
                    el(PanelBody, { title: 'Lesson Navigation', initialOpen: false },
                        el(ToggleControl, { label: 'Show Prev/Next Navigation', checked: a.showNav, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNav: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Previous Lesson Title', value: a.prevLesson, __nextHasNoMarginBottom: true, onChange: function (v) { set({ prevLesson: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Previous URL', value: a.prevLessonUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ prevLessonUrl: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Next Lesson Title', value: a.nextLesson, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextLesson: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Next URL', value: a.nextLessonUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextLessonUrl: v }); } })
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        _tc() && el(_tc(), { label: 'Lesson Title', value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        _tc() && el(_tc(), { label: 'Body Text', value: a.typoBody, onChange: function (v) { set({ typoBody: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Module Title Size (px)', value: a.moduleTitleSize, min: 9, max: 18, __nextHasNoMarginBottom: true, onChange: function (v) { set({ moduleTitleSize: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    // Colors
                    el(PanelColorSettings, {
                        title: 'Header Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header BG',   value: a.headerBg,    onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text', value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Meta Text',   value: a.metaColor,   onChange: function (v) { set({ metaColor: v || '#94a3b8' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Body & Section Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Block BG',        value: a.bgColor,      onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',          value: a.borderColor,  onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Accent',          value: a.accentColor,  onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } },
                            { label: 'Body Text',       value: a.textColor,    onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Section Heading', value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                            { label: 'Intro BG',        value: a.introBg,      onChange: function (v) { set({ introBg: v || '#f0f9ff' }); } },
                            { label: 'Intro Text',      value: a.introColor,   onChange: function (v) { set({ introColor: v || '#0369a1' }); } },
                            { label: 'Objectives BG',   value: a.objectiveBg,  onChange: function (v) { set({ objectiveBg: v || '#f0fdf4' }); } },
                            { label: 'Objectives Text', value: a.objectiveColor,onChange: function (v) { set({ objectiveColor: v || '#14532d' }); } },
                            { label: 'Prereq BG',       value: a.prereqBg,     onChange: function (v) { set({ prereqBg: v || '#f8fafc' }); } },
                            { label: 'Resource BG',     value: a.resourceBg,   onChange: function (v) { set({ resourceBg: v || '#f8fafc' }); } },
                            { label: 'Nav BG',          value: a.navBg,        onChange: function (v) { set({ navBg: v || '#f8fafc' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Callout Block Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Tip BG',        value: a.tipBg,        onChange: function (v) { set({ tipBg: v || '#fefce8' }); } },
                            { label: 'Tip Text',      value: a.tipColor,     onChange: function (v) { set({ tipColor: v || '#713f12' }); } },
                            { label: 'Tip Border',    value: a.tipBorder,    onChange: function (v) { set({ tipBorder: v || '#fbbf24' }); } },
                            { label: 'Warning BG',    value: a.warningBg,    onChange: function (v) { set({ warningBg: v || '#fff7ed' }); } },
                            { label: 'Warning Text',  value: a.warningColor, onChange: function (v) { set({ warningColor: v || '#9a3412' }); } },
                            { label: 'Warning Border',value: a.warningBorder,onChange: function (v) { set({ warningBorder: v || '#f97316' }); } },
                            { label: 'Note BG',       value: a.noteBg,       onChange: function (v) { set({ noteBg: v || '#eff6ff' }); } },
                            { label: 'Note Text',     value: a.noteColor,    onChange: function (v) { set({ noteColor: v || '#1e40af' }); } },
                            { label: 'Note Border',   value: a.noteBorder,   onChange: function (v) { set({ noteBorder: v || '#3b82f6' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-course-lesson-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
