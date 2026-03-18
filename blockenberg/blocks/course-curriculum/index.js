( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _ccrTC, _ccrTV;
    function _tc() { return _ccrTC || (_ccrTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _ccrTV || (_ccrTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    var LESSON_TYPE_OPTIONS = [
        { label: __('Video',    'blockenberg'), value: 'video'    },
        { label: __('Quiz',     'blockenberg'), value: 'quiz'     },
        { label: __('Exercise', 'blockenberg'), value: 'exercise' },
        { label: __('Article',  'blockenberg'), value: 'article'  },
    ];

    var LESSON_ICONS = { video: '▶', quiz: '📝', exercise: '💪', article: '📖' };

    function makeId() { return 'cc' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-cc-accent':           a.accentColor,
            '--bkbg-cc-card-bg':          a.cardBg,
            '--bkbg-cc-card-border':      a.cardBorder,
            '--bkbg-cc-section-bg':       a.sectionBg,
            '--bkbg-cc-section-border':   a.sectionBorder,
            '--bkbg-cc-section-hover':    a.sectionHoverBg,
            '--bkbg-cc-lesson-bg':        a.lessonBg,
            '--bkbg-cc-lesson-hover':     a.lessonHoverBg,
            '--bkbg-cc-free-bg':          a.freeBg,
            '--bkbg-cc-free-color':       a.freeColor,
            '--bkbg-cc-locked-color':     a.lockedColor,
            '--bkbg-cc-title-color':      a.titleColor,
            '--bkbg-cc-sec-title-color':  a.sectionTitleColor,
            '--bkbg-cc-lesson-color':     a.lessonTitleColor,
            '--bkbg-cc-meta-color':       a.metaColor,
            '--bkbg-cc-btn-bg':           a.btnBg,
            '--bkbg-cc-btn-color':        a.btnColor,
            '--bkbg-cc-card-r':           a.cardRadius + 'px',
            '--bkbg-cc-sec-r':            a.sectionRadius + 'px',
            '--bkbg-cc-btn-r':            a.btnRadius + 'px',
            '--bkbg-cc-title-sz':         a.titleSize + 'px',
            '--bkbg-cc-sec-title-sz':     a.sectionTitleSize + 'px',
            '--bkbg-cc-lesson-sz':        a.lessonTitleSize + 'px',
            paddingTop:    a.paddingTop    + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        }, _tv(a.typoTitle, '--bkbg-ccr-ttl-'), _tv(a.typoSection, '--bkbg-ccr-sec-'), _tv(a.typoLesson, '--bkbg-ccr-les-'));
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Lesson row in editor ────────────────────────────────────────── */
    function LessonRow(props) {
        var lesson = props.lesson;
        var sectionId = props.sectionId;
        var a = props.a;
        var onUpdate = props.onUpdate;
        var onRemove = props.onRemove;
        var showEdit = props.showEdit;
        var setShowEdit = props.setShowEdit;
        var icon = LESSON_ICONS[lesson.type] || '▶';

        return el('div', { className: 'bkbg-cc-lesson-row', style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderBottom: '1px solid ' + a.cardBorder, background: a.lessonBg } },
            el('span', { style: { fontSize: '14px', flexShrink: 0, minWidth: '20px' } }, icon),
            el('input', { type: 'text', className: 'bkbg-cc-lesson-title', value: lesson.title, onChange: function (e) { onUpdate('title', e.target.value); },
                placeholder: __('Lesson title…', 'blockenberg'),
                style: { flex: 1, border: 'none', outline: 'none', color: a.lessonTitleColor, background: 'transparent', padding: 0 }
            }),
            el('select', { value: lesson.type, onChange: function (e) { onUpdate('type', e.target.value); }, style: { fontSize: '11px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', color: '#555', cursor: 'pointer', padding: '1px 4px', flexShrink: 0 } },
                LESSON_TYPE_OPTIONS.map(function (opt) { return el('option', { key: opt.value, value: opt.value }, opt.label); })
            ),
            el('input', { type: 'text', value: lesson.duration, onChange: function (e) { onUpdate('duration', e.target.value); },
                placeholder: '5:00',
                style: { width: '46px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '11px', color: '#555', textAlign: 'center', padding: '2px 4px', flexShrink: 0 }
            }),
            el('label', { style: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: a.freeColor, cursor: 'pointer', flexShrink: 0 } },
                el('input', { type: 'checkbox', checked: lesson.free, onChange: function (e) { onUpdate('free', e.target.checked); }, style: { accentColor: a.freeColor, width: '12px', height: '12px' } }),
                __('Free', 'blockenberg')
            ),
            el('button', { type: 'button', onClick: onRemove, style: { border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', padding: '0 2px', flexShrink: 0 } }, '×')
        );
    }

    /* ── Section block in editor ─────────────────────────────────────── */
    function SectionBlock(props) {
        var section = props.section;
        var a       = props.a;
        var isOpen  = props.isOpen;
        var onToggle = props.onToggle;
        var onUpdateSection = props.onUpdateSection;
        var onRemoveSection = props.onRemoveSection;
        var onAddLesson     = props.onAddLesson;
        var onUpdateLesson  = props.onUpdateLesson;
        var onRemoveLesson  = props.onRemoveLesson;
        var editLessonState = useState(null);
        var setEditLesson   = editLessonState[1];
        var showEditLesson  = editLessonState[0];

        return el('div', { className: 'bkbg-cc-section', style: { border: '1px solid ' + a.sectionBorder, borderRadius: a.sectionRadius + 'px', marginBottom: '8px', overflow: 'hidden' } },
            /* Section header row */
            el('div', { className: isOpen ? 'bkbg-cc-sec-hdr is-open' : 'bkbg-cc-sec-hdr', style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: a.sectionBg, cursor: 'pointer' } },
                el('span', { style: { fontSize: '14px', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, color: a.accentColor } }, '▶'),
                el('input', { type: 'text', className: 'bkbg-cc-sec-title', value: section.title, onChange: function (e) { onUpdateSection('title', e.target.value); },
                    onClick: function (e) { e.stopPropagation(); },
                    placeholder: __('Section title…', 'blockenberg'),
                    style: { flex: 1, border: 'none', outline: 'none', background: 'transparent', color: a.sectionTitleColor }
                }),
                el('span', { style: { fontSize: '12px', color: a.metaColor, flexShrink: 0 } }, section.lessons.length + ' ' + (section.lessons.length === 1 ? __('lesson', 'blockenberg') : __('lessons', 'blockenberg'))),
                el('button', { type: 'button', onClick: function (e) { e.stopPropagation(); onRemoveSection(); }, style: { border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', padding: '0 2px', flexShrink: 0 } }, '×'),
                /* toggle icon */
                el('div', { onClick: function () { onToggle(); }, style: { position: 'absolute', inset: 0 } })
            ),
            /* Lessons */
            isOpen && el('div', { className: 'bkbg-cc-sec-body' },
                section.lessons.map(function (lesson) {
                    return el(LessonRow, { key: lesson.id, lesson: lesson, sectionId: section.id, a: a,
                        showEdit: showEditLesson === lesson.id,
                        setShowEdit: setEditLesson,
                        onUpdate: function (key, val) { onUpdateLesson(lesson.id, key, val); },
                        onRemove: function () { onRemoveLesson(lesson.id); }
                    });
                }),
                el('button', { type: 'button', onClick: onAddLesson, style: { display: 'block', width: '100%', padding: '8px', background: 'none', border: 'none', borderTop: '1px solid ' + a.cardBorder, cursor: 'pointer', fontSize: '12px', color: a.accentColor, fontWeight: 700, textAlign: 'center' } },
                    '+ ' + __('Add Lesson', 'blockenberg')
                )
            )
        );
    }

    registerBlockType('blockenberg/course-curriculum', {
        title: __('Course Curriculum', 'blockenberg'),
        icon: 'welcome-learn-more',
        category: 'bkbg-blog',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var openSectionState = useState(0);
            var openSection = openSectionState[0];
            var setOpenSection = openSectionState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateSection(sectionId, key, val) {
                setAttributes({ sections: a.sections.map(function (s) {
                    if (s.id !== sectionId) return s;
                    var u = Object.assign({}, s); u[key] = val; return u;
                }) });
            }

            function addSection() {
                var newId = makeId();
                setAttributes({ sections: a.sections.concat([{
                    id: newId,
                    title: __('New Section', 'blockenberg'),
                    lessons: []
                }]) });
                setOpenSection(a.sections.length); /* open the new one */
            }

            function removeSection(sectionId) {
                setAttributes({ sections: a.sections.filter(function (s) { return s.id !== sectionId; }) });
            }

            function addLesson(sectionId) {
                setAttributes({ sections: a.sections.map(function (s) {
                    if (s.id !== sectionId) return s;
                    return Object.assign({}, s, { lessons: s.lessons.concat([{ id: makeId(), title: __('New Lesson', 'blockenberg'), duration: '5:00', type: 'video', free: false }]) });
                }) });
            }

            function updateLesson(sectionId, lessonId, key, val) {
                setAttributes({ sections: a.sections.map(function (s) {
                    if (s.id !== sectionId) return s;
                    return Object.assign({}, s, { lessons: s.lessons.map(function (l) {
                        if (l.id !== lessonId) return l;
                        var u = Object.assign({}, l); u[key] = val; return u;
                    }) });
                }) });
            }

            function removeLesson(sectionId, lessonId) {
                setAttributes({ sections: a.sections.map(function (s) {
                    if (s.id !== sectionId) return s;
                    return Object.assign({}, s, { lessons: s.lessons.filter(function (l) { return l.id !== lessonId; }) });
                }) });
            }

            var totalLessons = a.sections.reduce(function (sum, s) { return sum + s.lessons.length; }, 0);

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Course Info', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Course meta line', 'blockenberg'), value: a.courseMeta, onChange: function (v) { setAttributes({ courseMeta: v }); }, help: __('e.g. "12 sections • 48 lessons • 24h"', 'blockenberg') }),
                        el(ToggleControl, { label: __('Show course meta', 'blockenberg'), checked: a.showCourseMeta, onChange: function (v) { setAttributes({ showCourseMeta: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show search bar', 'blockenberg'), checked: a.showSearch, onChange: function (v) { setAttributes({ showSearch: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Expand all by default', 'blockenberg'), checked: a.expandAll, onChange: function (v) { setAttributes({ expandAll: v }); }, __nextHasNoMarginBottom: true }),
                        !a.expandAll && el(RangeControl, { label: __('Default open section (0 = first)', 'blockenberg'), value: a.defaultOpen, min: 0, max: Math.max(0, a.sections.length - 1), onChange: function (v) { setAttributes({ defaultOpen: v }); } })
                    ),
                    el(PanelBody, { title: __('CTA Button', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show CTA button', 'blockenberg'), checked: a.showCta, onChange: function (v) { setAttributes({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                        a.showCta && el(TextControl, { label: __('Button label', 'blockenberg'), value: a.ctaLabel, onChange: function (v) { setAttributes({ ctaLabel: v }); } }),
                        a.showCta && el(TextControl, { label: __('Button URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { setAttributes({ ctaUrl: v }); } })
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)',    'blockenberg'), value: a.cardRadius,        min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius:        v }); } }),
                        el(RangeControl, { label: __('Section radius (px)', 'blockenberg'), value: a.sectionRadius,     min: 0, max: 20, onChange: function (v) { setAttributes({ sectionRadius:     v }); } }),
                        el(RangeControl, { label: __('Button radius (px)',  'blockenberg'), value: a.btnRadius,         min: 0, max: 99, onChange: function (v) { setAttributes({ btnRadius:         v }); } }),
                        ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Course Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        _tc() && el(_tc(), { label: __('Section Title', 'blockenberg'), value: a.typoSection, onChange: function (v) { setAttributes({ typoSection: v }); } }),
                        _tc() && el(_tc(), { label: __('Lesson Title', 'blockenberg'), value: a.typoLesson, onChange: function (v) { setAttributes({ typoLesson: v }); } })
                    ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',        __('Accent',          'blockenberg'), 'accentColor'),
                        cc('titleColor',         __('Course title',    'blockenberg'), 'titleColor'),
                        cc('sectionTitleColor',  __('Section title',   'blockenberg'), 'sectionTitleColor'),
                        cc('lessonTitleColor',   __('Lesson text',     'blockenberg'), 'lessonTitleColor'),
                        cc('metaColor',          __('Meta / count',    'blockenberg'), 'metaColor'),
                        cc('cardBg',             __('Card bg',         'blockenberg'), 'cardBg'),
                        cc('cardBorder',         __('Card border',     'blockenberg'), 'cardBorder'),
                        cc('sectionBg',          __('Section header bg','blockenberg'), 'sectionBg'),
                        cc('sectionBorder',      __('Section border',  'blockenberg'), 'sectionBorder'),
                        cc('sectionHoverBg',     __('Section hover',   'blockenberg'), 'sectionHoverBg'),
                        cc('lessonBg',           __('Lesson row bg',   'blockenberg'), 'lessonBg'),
                        cc('lessonHoverBg',      __('Lesson hover',    'blockenberg'), 'lessonHoverBg'),
                        cc('freeBg',             __('Free badge bg',   'blockenberg'), 'freeBg'),
                        cc('freeColor',          __('Free badge text', 'blockenberg'), 'freeColor'),
                        cc('lockedColor',        __('Locked icon',     'blockenberg'), 'lockedColor'),
                        cc('btnBg',              __('Button bg',       'blockenberg'), 'btnBg'),
                        cc('btnColor',           __('Button text',     'blockenberg'), 'btnColor'),
                        cc('bgColor',            __('Section bg',      'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    /* Card */
                    el('div', { className: 'bkbg-cc-card', style: { background: a.cardBg, border: '1px solid ' + a.cardBorder, borderRadius: a.cardRadius + 'px', overflow: 'hidden' } },
                        /* Card header */
                        el('div', { className: 'bkbg-cc-card-hdr', style: { padding: '24px 28px', borderBottom: '1px solid ' + a.cardBorder } },
                            el(RichText, { tagName: 'h2', className: 'bkbg-cc-course-title', value: a.courseTitle, onChange: function (v) { setAttributes({ courseTitle: v }); }, placeholder: __('Course title…', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 6px' } }),
                            a.showCourseMeta && el('p', { className: 'bkbg-cc-course-meta', style: { fontSize: '13px', color: a.metaColor, margin: 0 } }, a.courseMeta || (a.sections.length + ' sections • ' + totalLessons + ' lessons'))
                        ),
                        /* Sections */
                        el('div', { className: 'bkbg-cc-sections-list', style: { padding: '16px 20px' } },
                            a.sections.map(function (section, idx) {
                                return el(SectionBlock, { key: section.id, section: section, a: a,
                                    isOpen: openSection === idx,
                                    onToggle: function () { setOpenSection(openSection === idx ? -1 : idx); },
                                    onUpdateSection: function (key, val) { updateSection(section.id, key, val); },
                                    onRemoveSection: function () { removeSection(section.id); },
                                    onAddLesson:     function () { addLesson(section.id); },
                                    onUpdateLesson:  function (lid, key, val) { updateLesson(section.id, lid, key, val); },
                                    onRemoveLesson:  function (lid) { removeLesson(section.id, lid); }
                                });
                            }),
                            el(Button, { variant: 'secondary', onClick: addSection, style: { width: '100%', justifyContent: 'center', marginTop: '8px' } }, '+ ' + __('Add Section', 'blockenberg'))
                        ),
                        /* CTA */
                        a.showCta && el('div', { className: 'bkbg-cc-cta-wrap', style: { padding: '20px 28px', borderTop: '1px solid ' + a.cardBorder, textAlign: 'center' } },
                            el('a', { href: a.ctaUrl, className: 'bkbg-cc-cta-btn', style: { display: 'inline-block', padding: '14px 36px', borderRadius: a.btnRadius + 'px', background: a.btnBg, color: a.btnColor, fontWeight: 800, fontSize: '16px', textDecoration: 'none' } }, a.ctaLabel)
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var totalLessons = a.sections.reduce(function (sum, s) { return sum + s.lessons.length; }, 0);

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-cc-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-cc-card', 'data-expand-all': a.expandAll ? '1' : '0', 'data-default-open': a.defaultOpen },
                    el('div', { className: 'bkbg-cc-card-hdr' },
                        el(RichText.Content, { tagName: 'h2', className: 'bkbg-cc-course-title', value: a.courseTitle }),
                        a.showCourseMeta && el('p', { className: 'bkbg-cc-course-meta' }, a.courseMeta || (a.sections.length + ' sections • ' + totalLessons + ' lessons'))
                    ),
                    el('div', { className: 'bkbg-cc-sections-list' },
                        a.sections.map(function (section, idx) {
                            var videoCount = section.lessons.filter(function (l) { return l.type === 'video'; }).length;
                            return el('div', { key: section.id, className: 'bkbg-cc-section', 'data-section-idx': idx },
                                el('button', { type: 'button', className: 'bkbg-cc-sec-hdr', 'aria-expanded': a.expandAll || a.defaultOpen === idx ? 'true' : 'false' },
                                    el('span', { className: 'bkbg-cc-sec-arrow', 'aria-hidden': 'true' }, '▶'),
                                    el('span', { className: 'bkbg-cc-sec-title' }, section.title),
                                    el('span', { className: 'bkbg-cc-sec-meta' }, section.lessons.length + ' ' + __('lessons', 'blockenberg') + (videoCount ? ' • ' + videoCount + ' ' + __('videos', 'blockenberg') : ''))
                                ),
                                el('div', { className: 'bkbg-cc-lessons', 'aria-hidden': a.expandAll || a.defaultOpen === idx ? 'false' : 'true' },
                                    section.lessons.map(function (lesson) {
                                        var icon = LESSON_ICONS[lesson.type] || '▶';
                                        return el('div', { key: lesson.id, className: 'bkbg-cc-lesson ' + (lesson.free ? 'is-free' : 'is-locked'), 'data-type': lesson.type },
                                            el('div', { className: 'bkbg-cc-lesson-left' },
                                                el('span', { className: 'bkbg-cc-lesson-icon', 'aria-hidden': 'true' }, icon),
                                                el('span', { className: 'bkbg-cc-lesson-title' }, lesson.title)
                                            ),
                                            el('div', { className: 'bkbg-cc-lesson-right' },
                                                lesson.free
                                                    ? el('span', { className: 'bkbg-cc-free-badge' }, __('Free', 'blockenberg'))
                                                    : el('span', { className: 'bkbg-cc-locked-icon', 'aria-label': __('Locked', 'blockenberg') }, '🔒'),
                                                lesson.duration && el('span', { className: 'bkbg-cc-lesson-dur' }, lesson.duration)
                                            )
                                        );
                                    })
                                )
                            );
                        })
                    ),
                    a.showCta && el('div', { className: 'bkbg-cc-cta-wrap' },
                        el('a', { href: a.ctaUrl, className: 'bkbg-cc-cta-btn' }, a.ctaLabel)
                    )
                )
            );
        }
    });
}() );
