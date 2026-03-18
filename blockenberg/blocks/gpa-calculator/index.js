( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _gpaTC, _gpaTV;
    function _tc() { return _gpaTC || (_gpaTC = window.bkbgTypographyControl); }
    function _tv() { return _gpaTV || (_gpaTV = window.bkbgTypoCssVars); }

    /* ── Grade point conversions (standard 4.0 scale) ── */
    var GRADE_POINTS = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
    };
    var GRADE_OPTIONS = Object.keys(GRADE_POINTS).map(function (g) {
        return { label: g + ' (' + GRADE_POINTS[g].toFixed(1) + ')', value: g };
    });

    function calcGPA(courses) {
        var totalCredits = 0, totalPoints = 0;
        courses.forEach(function (c) {
            var pts = GRADE_POINTS[c.grade];
            if (pts !== undefined && c.credits > 0) {
                totalCredits += c.credits;
                totalPoints  += pts * c.credits;
            }
        });
        return {
            gpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
            totalCredits: totalCredits,
            totalPoints: totalPoints
        };
    }

    function gradeClass(gpa) {
        if (gpa >= 3.9) return 'Summa Cum Laude';
        if (gpa >= 3.7) return 'Magna Cum Laude';
        if (gpa >= 3.5) return 'Cum Laude';
        if (gpa >= 3.0) return 'Good Standing';
        if (gpa >= 2.0) return 'Satisfactory';
        if (gpa > 0)    return 'Probation Risk';
        return '—';
    }

    function gradeClassColor(gpa, accent) {
        if (gpa >= 3.5) return '#15803d';
        if (gpa >= 3.0) return accent;
        if (gpa >= 2.0) return '#d97706';
        return '#dc2626';
    }

    /* ── Editor Preview ──────────────────────────────── */
    function GPAPreview(props) {
        var a = props.attrs;
        var courses = a.defaultCourses;
        var res = calcGPA(courses);
        var gpa = res.gpa.toFixed(2);

        var wrapStyle = {
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            background: a.sectionBg || undefined
        };

        var cardStyle = {
            background: a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding: 32,
            maxWidth: a.maxWidth + 'px',
            margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        };

        /* result box */
        var resultBox = el('div', {
            style: {
                background: a.resultBg, border: '2px solid ' + a.resultBorder,
                borderRadius: a.cardRadius + 'px', padding: '24px 32px',
                textAlign: 'center', marginBottom: 24
            }
        },
            el('div', { className: 'bkbg-gpa-number', style: { color: a.gpaColor } }, gpa),
            el('div', { style: { color: a.subtitleColor, marginTop: 4 } }, 'GPA (4.0 scale)'),
            a.showGradeClass ? el('div', { style: { marginTop: 8, fontWeight: 700, color: gradeClassColor(res.gpa, a.accentColor) } }, gradeClass(res.gpa)) : null,
            a.showTotals ? el('div', { style: { display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16 } },
                el('div', { style: { textAlign: 'center' } },
                    el('div', { style: { fontSize: 22, fontWeight: 700, color: a.labelColor } }, res.totalCredits),
                    el('div', { style: { fontSize: 12, color: a.subtitleColor } }, 'Credits')
                ),
                el('div', { style: { textAlign: 'center' } },
                    el('div', { style: { fontSize: 22, fontWeight: 700, color: a.labelColor } }, res.totalPoints.toFixed(1)),
                    el('div', { style: { fontSize: 12, color: a.subtitleColor } }, 'Grade Points')
                )
            ) : null
        );

        /* courses table */
        var tableHeader = el('div', {
            style: {
                display: 'grid', gridTemplateColumns: '1fr 80px 60px',
                background: a.tableHeaderBg, borderRadius: '8px 8px 0 0',
                padding: '8px 12px', fontWeight: 600, fontSize: 13, color: a.subtitleColor
            }
        }, el('span', null, 'Course'), el('span', { style: { textAlign: 'center' } }, 'Grade'), el('span', { style: { textAlign: 'center' } }, 'Credits'));

        var tableRows = courses.map(function (c, i) {
            return el('div', {
                key: i,
                style: {
                    display: 'grid', gridTemplateColumns: '1fr 80px 60px',
                    padding: '8px 12px', borderBottom: '1px solid #f3f4f6',
                    fontSize: 14, color: a.labelColor,
                    background: i % 2 === 0 ? '#fff' : '#fafafa'
                }
            },
                el('span', null, c.name || 'Course ' + (i + 1)),
                el('span', { style: { textAlign: 'center', fontWeight: 600, color: a.accentColor } }, c.grade),
                el('span', { style: { textAlign: 'center' } }, c.credits)
            );
        });

        return el('div', { style: wrapStyle },
            (a.showTitle || a.showSubtitle) ? el('div', { style: { textAlign: 'center', marginBottom: 32, maxWidth: a.maxWidth + 'px', margin: '0 auto 32px' } },
                a.showTitle   ? el('h3', { className: 'bkbg-gpa-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title) : null,
                a.showSubtitle ? el('p',  { style: { color: a.subtitleColor, margin: 0 } }, a.subtitle) : null
            ) : null,
            el('div', { style: cardStyle },
                resultBox,
                tableHeader,
                tableRows,
                el('div', { style: { textAlign: 'center', marginTop: 16, color: a.subtitleColor, fontSize: 13 } },
                    a.defaultCourses.length + ' courses (editable in settings)'
                )
            )
        );
    }

    /* ── Edit ────────────────────────────────────────── */
    function GPAEdit(props) {
        var a = props.attributes;
        var set = props.setAttributes;
        var blockProps = useBlockProps({ className: 'bkbg-gpa-editor', style: Object.assign({}, _tv()(a.typoTitle, '--bkbg-gpa-tt-'), _tv()(a.typoGpa, '--bkbg-gpa-gp-')) });

        function s(key)  { return function (v) { var o = {}; o[key] = v; set(o); }; }
        function n(key)  { return function (v) { var o = {}; o[key] = Number(v) || 0; set(o); }; }
        function t(key)  { return function (v) { var o = {}; o[key] = v; set(o); }; }

        function updateCourse(i, field, val) {
            var c = a.defaultCourses.slice();
            c[i] = Object.assign({}, c[i]);
            c[i][field] = field === 'credits' ? (Number(val) || 0) : val;
            set({ defaultCourses: c });
        }
        function addCourse()    { set({ defaultCourses: a.defaultCourses.concat([{ name: 'New Course', grade: 'B', credits: 3 }]) }); }
        function removeCourse(i){ set({ defaultCourses: a.defaultCourses.filter(function (_, idx) { return idx !== i; }) }); }

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Header */
                el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: t('showTitle'), __nextHasNoMarginBottom: true }),
                    a.showTitle    ? el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: s('title') }) : null,
                    el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: t('showSubtitle'), __nextHasNoMarginBottom: true }),
                    a.showSubtitle ? el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: s('subtitle') }) : null
                ),

                /* Default Courses */
                el(PanelBody, { title: __('Default Courses', 'blockenberg'), initialOpen: true },
                    el('p', { style: { margin: '0 0 12px', color: '#6b7280', fontSize: 12 } },
                        __('These pre-fill the calculator. Users can edit and add more.', 'blockenberg')
                    ),
                    a.defaultCourses.map(function (c, i) {
                        return el('div', { key: i, style: { background: '#f9f9f9', borderRadius: 8, padding: '8px 12px', marginBottom: 8 } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
                                el('strong', { style: { fontSize: 12 } }, 'Course ' + (i + 1)),
                                el(Button, { isDestructive: true, isSmall: true, onClick: function () { removeCourse(i); } }, '✕')
                            ),
                            el(TextControl, { label: __('Course Name', 'blockenberg'), value: c.name, onChange: function (v) { updateCourse(i, 'name', v); } }),
                            el(SelectControl, { label: __('Grade', 'blockenberg'), value: c.grade, options: GRADE_OPTIONS, onChange: function (v) { updateCourse(i, 'grade', v); } }),
                            el(TextControl, { label: __('Credit Hours', 'blockenberg'), value: String(c.credits), onChange: function (v) { updateCourse(i, 'credits', v); }, type: 'number' })
                        );
                    }),
                    el(Button, { isPrimary: true, onClick: addCourse, style: { marginTop: 8 } }, __('+ Add Course', 'blockenberg'))
                ),

                /* Display */
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Classification (Cum Laude etc.)', 'blockenberg'), checked: a.showGradeClass, onChange: t('showGradeClass'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Totals (Credits & Points)', 'blockenberg'), checked: a.showTotals, onChange: t('showTotals'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Grade Scale Help', 'blockenberg'), checked: a.showHelp, onChange: t('showHelp'), __nextHasNoMarginBottom: true })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc()({ label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                    _tc()({ label: __('GPA Number', 'blockenberg'), value: a.typoGpa, onChange: function (v) { set({ typoGpa: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor,   onChange: s('accentColor'),   label: __('Accent', 'blockenberg') },
                        { value: a.cardBg,         onChange: s('cardBg'),         label: __('Card Background', 'blockenberg') },
                        { value: a.resultBg,       onChange: s('resultBg'),       label: __('Result Box BG', 'blockenberg') },
                        { value: a.resultBorder,   onChange: s('resultBorder'),   label: __('Result Box Border', 'blockenberg') },
                        { value: a.gpaColor,       onChange: s('gpaColor'),       label: __('GPA Number', 'blockenberg') },
                        { value: a.tableHeaderBg,  onChange: s('tableHeaderBg'),  label: __('Table Header BG', 'blockenberg') },
                        { value: a.titleColor,     onChange: s('titleColor'),     label: __('Title Color', 'blockenberg') },
                        { value: a.subtitleColor,  onChange: s('subtitleColor'),  label: __('Subtitle Color', 'blockenberg') },
                        { value: a.labelColor,     onChange: s('labelColor'),     label: __('Label Color', 'blockenberg') },
                        { value: a.sectionBg,      onChange: s('sectionBg'),      label: __('Section Background', 'blockenberg') }
                    ]
                }),

                /* Sizing */
                el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, onChange: n('cardRadius'), min: 0, max: 32 }),
                    el(RangeControl, { label: __('Input Radius (px)', 'blockenberg'), value: a.inputRadius, onChange: n('inputRadius'), min: 0, max: 20 }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, onChange: n('maxWidth'), min: 360, max: 1000, step: 20 }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, onChange: n('paddingTop'), min: 0, max: 160 }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, onChange: n('paddingBottom'), min: 0, max: 160 })
                )
            ),

            el('div', blockProps,
                el(GPAPreview, { attrs: a })
            )
        );
    }

    registerBlockType('blockenberg/gpa-calculator', {
        edit: GPAEdit,
        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-gpa-app',
                'data-opts': JSON.stringify(a)
            }));
        }
    });
}() );
