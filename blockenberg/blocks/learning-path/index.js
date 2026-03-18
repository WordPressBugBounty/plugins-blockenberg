( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var typeOptions = [
        { label: '📖 Lesson', value: 'lesson' },
        { label: '🔨 Project', value: 'project' },
        { label: '✏️ Quiz', value: 'quiz' },
        { label: '📄 Reading', value: 'reading' },
        { label: '🎬 Video', value: 'video' }
    ];
    var difficultyOptions = [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' }
    ];
    var typeIcons = { lesson: '📖', project: '🔨', quiz: '✏️', reading: '📄', video: '🎬' };

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function typeColor(t, a) {
        var map = { lesson: a.lessonColor, project: a.projectColor, quiz: a.quizColor, reading: a.readingColor, video: a.videoColor };
        return map[t] || a.lessonColor;
    }

    function renderStep(step, idx, total, a) {
        var tc = typeColor(step.type, a);
        return el('div', { className: 'bkbg-lp-step', key: idx },
            el('div', { className: 'bkbg-lp-step-left' },
                a.showStepNumbers && el('div', { className: 'bkbg-lp-step-num', style: { background: a.stepNumBg, color: a.stepNumColor } }, idx + 1),
                idx < total - 1 && el('div', { className: 'bkbg-lp-connector', style: { background: a.connectorColor } })
            ),
            el('div', { className: 'bkbg-lp-step-card', style: { background: a.stepBg, border: '1px solid ' + a.stepBorderColor } },
                el('div', { className: 'bkbg-lp-step-header' },
                    el('div', { className: 'bkbg-lp-step-title-row' },
                        el('span', { className: 'bkbg-lp-type-icon', style: { color: tc } }, typeIcons[step.type] || '📖'),
                        el('span', { className: 'bkbg-lp-step-title', style: { color: a.stepTitleColor } }, step.title)
                    ),
                    a.showDuration && step.duration && el('span', { className: 'bkbg-lp-duration', style: { color: a.durationColor } }, '⏱ ' + step.duration)
                ),
                step.description && el('p', { className: 'bkbg-lp-step-desc', style: { color: a.stepDescColor } }, step.description),
                a.showSkills && step.skills && step.skills.length > 0 &&
                    el('div', { className: 'bkbg-lp-skills' },
                        step.skills.map(function (s, j) {
                            return el('span', { key: j, className: 'bkbg-lp-skill-tag', style: { background: a.skillBg, color: a.skillColor } }, s);
                        })
                    )
            )
        );
    }

    wp.blocks.registerBlockType('blockenberg/learning-path', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var lh = (a.lineHeight / 100).toFixed(2);

            var difficultyLabels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = { background: a.bgColor, borderRadius: a.borderRadius + 'px', border: '1px solid ' + a.borderColor, overflow: 'hidden', fontSize: a.fontSize + 'px', lineHeight: lh };
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo, '--bkbg-lp-tt-'));
                    Object.assign(s, _tvFn(a.descTypo, '--bkbg-lp-d-'));
                    Object.assign(s, _tvFn(a.stepTitleTypo, '--bkbg-lp-st-'));
                }
                return { className: 'bkbg-lp-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Path Settings'), initialOpen: true },
                        el(TextControl, { label: __('Path Title'), value: a.pathTitle, onChange: function (v) { setAttr({ pathTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextareaControl, { label: __('Description'), value: a.description, onChange: function (v) { setAttr({ description: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Description'), checked: a.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Total Duration'), value: a.totalDuration, onChange: function (v) { setAttr({ totalDuration: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: __('Difficulty'), value: a.difficulty, options: difficultyOptions, onChange: function (v) { setAttr({ difficulty: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Skills'), checked: a.showSkills, onChange: function (v) { setAttr({ showSkills: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Duration'), checked: a.showDuration, onChange: function (v) { setAttr({ showDuration: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Step Numbers'), checked: a.showStepNumbers, onChange: function (v) { setAttr({ showStepNumbers: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Steps'), initialOpen: false },
                        a.steps.map(function (step, i) {
                            return el('div', { key: i, style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fafafa' } },
                                el('strong', { style: { display: 'block', marginBottom: 6 } }, (typeIcons[step.type] || '📖') + ' ' + (step.title || 'Step ' + (i + 1))),
                                el(TextControl, { label: __('Title'), value: step.title, onChange: function (v) { setAttr({ steps: upd(a.steps, i, 'title', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextareaControl, { label: __('Description'), value: step.description, onChange: function (v) { setAttr({ steps: upd(a.steps, i, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                el(SelectControl, { label: __('Type'), value: step.type, options: typeOptions, onChange: function (v) { setAttr({ steps: upd(a.steps, i, 'type', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Duration'), value: step.duration, onChange: function (v) { setAttr({ steps: upd(a.steps, i, 'duration', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Skills (comma-separated)'), value: (step.skills || []).join(', '), onChange: function (v) { setAttr({ steps: upd(a.steps, i, 'skills', v.split(',').map(function (s) { return s.trim(); }).filter(Boolean)) }); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ steps: a.steps.filter(function (_, j) { return j !== i; }) }); } }, __('Remove'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttr({ steps: a.steps.concat([{ title: 'New Step', description: '', duration: '1 week', type: 'lesson', skills: [], completed: false }]) }); } }, __('+ Add Step'))
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title'), value: a.titleTypo || {}, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Description'), value: a.descTypo || {}, onChange: function (v) { setAttr({ descTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Step Title'), value: a.stepTitleTypo || {}, onChange: function (v) { setAttr({ stepTitleTypo: v }); } }),
                        el(RangeControl, { label: __('Base Font Size'), value: a.fontSize, min: 10, max: 22, onChange: function (v) { setAttr({ fontSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Line Height (%)'), value: a.lineHeight, min: 120, max: 220, onChange: function (v) { setAttr({ lineHeight: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Border Radius'), value: a.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Layout Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                            { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#111827' }); } },
                            { label: __('Description'), value: a.descColor, onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); } },
                            { label: __('Meta Bar BG'), value: a.metaBg, onChange: function (v) { setAttr({ metaBg: v || '#f8fafc' }); } },
                            { label: __('Meta Bar Border'), value: a.metaBorderColor, onChange: function (v) { setAttr({ metaBorderColor: v || '#e2e8f0' }); } },
                            { label: __('Difficulty BG'), value: a.difficultyBg, onChange: function (v) { setAttr({ difficultyBg: v || '#ede9fe' }); } },
                            { label: __('Difficulty Text'), value: a.difficultyColor, onChange: function (v) { setAttr({ difficultyColor: v || '#5b21b6' }); } },
                            { label: __('Step Card BG'), value: a.stepBg, onChange: function (v) { setAttr({ stepBg: v || '#ffffff' }); } },
                            { label: __('Step Card Border'), value: a.stepBorderColor, onChange: function (v) { setAttr({ stepBorderColor: v || '#e5e7eb' }); } },
                            { label: __('Step Title'), value: a.stepTitleColor, onChange: function (v) { setAttr({ stepTitleColor: v || '#1f2937' }); } },
                            { label: __('Step Description'), value: a.stepDescColor, onChange: function (v) { setAttr({ stepDescColor: v || '#6b7280' }); } },
                            { label: __('Step Number BG'), value: a.stepNumBg, onChange: function (v) { setAttr({ stepNumBg: v || '#0f172a' }); } },
                            { label: __('Step Number Text'), value: a.stepNumColor, onChange: function (v) { setAttr({ stepNumColor: v || '#ffffff' }); } },
                            { label: __('Connector Line'), value: a.connectorColor, onChange: function (v) { setAttr({ connectorColor: v || '#e5e7eb' }); } },
                            { label: __('Duration Text'), value: a.durationColor, onChange: function (v) { setAttr({ durationColor: v || '#6b7280' }); } },
                            { label: __('Skill Tag BG'), value: a.skillBg, onChange: function (v) { setAttr({ skillBg: v || '#f1f5f9' }); } },
                            { label: __('Skill Tag Text'), value: a.skillColor, onChange: function (v) { setAttr({ skillColor: v || '#475569' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Step Type Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('📖 Lesson'), value: a.lessonColor, onChange: function (v) { setAttr({ lessonColor: v || '#2563eb' }); } },
                            { label: __('🔨 Project'), value: a.projectColor, onChange: function (v) { setAttr({ projectColor: v || '#d97706' }); } },
                            { label: __('✏️ Quiz'), value: a.quizColor, onChange: function (v) { setAttr({ quizColor: v || '#7c3aed' }); } },
                            { label: __('📄 Reading'), value: a.readingColor, onChange: function (v) { setAttr({ readingColor: v || '#059669' }); } },
                            { label: __('🎬 Video'), value: a.videoColor, onChange: function (v) { setAttr({ videoColor: v || '#dc2626' }); } }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { className: 'bkbg-lp-header', style: { borderBottom: '1px solid ' + a.borderColor } },
                        el('h2', { className: 'bkbg-lp-title', style: { color: a.titleColor } }, a.pathTitle),
                        a.showDescription && el('p', { className: 'bkbg-lp-desc', style: { color: a.descColor } }, a.description)
                    ),
                    el('div', { className: 'bkbg-lp-meta', style: { background: a.metaBg, borderBottom: '1px solid ' + a.metaBorderColor } },
                        el('span', { className: 'bkbg-lp-meta-item' }, '⏱ ' + a.totalDuration),
                        el('span', { className: 'bkbg-lp-meta-item' }, '📚 ' + a.steps.length + ' steps'),
                        el('span', { className: 'bkbg-lp-difficulty', style: { background: a.difficultyBg, color: a.difficultyColor } }, { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[a.difficulty] || a.difficulty)
                    ),
                    el('div', { className: 'bkbg-lp-steps' },
                        a.steps.map(function (step, i) { return renderStep(step, i, a.steps.length, a); })
                    )
                )
            );
        },
        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-learning-path-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
