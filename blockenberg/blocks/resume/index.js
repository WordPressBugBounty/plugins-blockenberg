( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl(){ return _tc || (_tc = (window.bkbgTypographyControl || function(){return null})); }
    var _tv; function getTypoCssVars(){ return _tv || (_tv = (window.bkbgTypoCssVars || function(){return {}})); }

    var LAYOUT_OPTIONS = [
        { label: 'Classic (single column)', value: 'classic' },
        { label: 'Sidebar (header left, content right)', value: 'sidebar' },
        { label: 'Modern (header full-width, two-col bottom)', value: 'modern' },
    ];

    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function SectionHeading(title, accentColor) {
        return el('div', {
            style: {
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 16, paddingBottom: 8,
            }
        },
            el('span', {
                style: {
                    display: 'inline-block', width: 3, height: 18,
                    background: accentColor, borderRadius: 2, flexShrink: 0,
                }
            }),
            el('h3', {
                style: {
                    margin: 0, fontSize: 13, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: '#374151',
                }
            }, title)
        );
    }

    function ExperiencePreview(exp, a) {
        return el('div', {
            style: {
                display: 'flex', gap: 16, paddingBottom: 20,
                borderBottom: '1px solid ' + a.dividerColor,
                marginBottom: 20,
            }
        },
            // Timeline dot
            el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 } },
                el('div', {
                    style: {
                        width: 12, height: 12, borderRadius: '50%',
                        background: a.accentColor, flexShrink: 0, marginTop: 3,
                    }
                }),
                el('div', { style: { width: 2, flexGrow: 1, background: a.dividerColor, marginTop: 4 } })
            ),
            el('div', { style: { flexGrow: 1 } },
                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 } },
                    el('div', null,
                        el('div', { style: { fontWeight: 700, fontSize: 15, color: a.sectionHeadingColor } }, exp.role),
                        el('div', { style: { fontSize: 13, color: a.accentColor, fontWeight: 600 } }, exp.company + (exp.location ? ' · ' + exp.location : ''))
                    ),
                    el('div', { style: { fontSize: 12, color: a.subtextColor, whiteSpace: 'nowrap' } },
                        exp.startDate + ' – ' + (exp.isCurrent ? 'Present' : exp.endDate)
                    )
                ),
                exp.description && el('p', { className: 'bkbg-rv-exp-desc', style: { margin: '8px 0 0', color: a.textColor } }, exp.description)
            )
        );
    }

    function EducationPreview(edu, a) {
        return el('div', {
            style: { paddingBottom: 16, borderBottom: '1px solid ' + a.dividerColor, marginBottom: 16 }
        },
            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                el('div', null,
                    el('div', { style: { fontWeight: 700, fontSize: 15, color: a.sectionHeadingColor } }, edu.degree),
                    el('div', { style: { fontSize: 13, color: a.accentColor, fontWeight: 500 } }, edu.institution)
                ),
                el('div', { style: { fontSize: 12, color: a.subtextColor } }, edu.startYear + (edu.endYear && edu.endYear !== edu.startYear ? ' – ' + edu.endYear : ''))
            ),
            edu.description && el('p', { className: 'bkbg-rv-edu-desc', style: { margin: '6px 0 0', color: a.textColor } }, edu.description)
        );
    }

    registerBlockType('blockenberg/resume', {
        title: __('Resume / CV', 'blockenberg'),
        icon: 'id-alt',
        category: 'bkbg-business',
        description: __('Professional CV/resume with experience, education, and skills.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var panelSt = useState('experience');
            var activePanel = panelSt[0];
            var setActivePanel = panelSt[1];

            var blockProps = useBlockProps((function(){
                var _tv = getTypoCssVars();
                var s = { background: a.bgColor || undefined };
                Object.assign(s, _tv(a.nameTypo, '--bkrv-nm-'));
                Object.assign(s, _tv(a.bodyTypo, '--bkrv-bt-'));
                return { style: s };
            })());

            var container = {
                maxWidth: a.maxWidth + 'px',
                margin: '0 auto',
                border: '1px solid ' + a.dividerColor,
                borderRadius: a.borderRadius + 'px',
                overflow: 'hidden',
                background: a.bgColor,
            };

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Sections toggle
                    el(PanelBody, { title: 'Sections', initialOpen: true },
                        el(ToggleControl, { label: 'Show photo', checked: a.showPhoto, onChange: function (v) { set({ showPhoto: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show summary', checked: a.showSummary, onChange: function (v) { set({ showSummary: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show experience', checked: a.showExperience, onChange: function (v) { set({ showExperience: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show education', checked: a.showEducation, onChange: function (v) { set({ showEducation: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show skills', checked: a.showSkills, onChange: function (v) { set({ showSkills: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show contact info', checked: a.showContact, onChange: function (v) { set({ showContact: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Header / Identity
                    el(PanelBody, { title: 'Header Info', initialOpen: false },
                        el(TextControl, { label: 'Full name', value: a.name, onChange: function (v) { set({ name: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Job title', value: a.jobTitle, onChange: function (v) { set({ jobTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        a.showSummary && el(Fragment, null,
                            el(TextControl, { label: 'Summary title', value: a.summaryTitle, onChange: function (v) { set({ summaryTitle: v }); }, __nextHasNoMarginBottom: true }),
                            el('div', { style: { height: 8 } }),
                            el(TextareaControl, { label: 'Summary text', value: a.summary, rows: 4, onChange: function (v) { set({ summary: v }); }, __nextHasNoMarginBottom: true }),
                            el('div', { style: { height: 8 } })
                        ),
                        el(TextControl, { label: 'Email', value: a.email, onChange: function (v) { set({ email: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Phone', value: a.phone, onChange: function (v) { set({ phone: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Location', value: a.location, onChange: function (v) { set({ location: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Website', value: a.website, onChange: function (v) { set({ website: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        a.showPhoto && el(Fragment, null,
                            el('div', { style: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7280', marginBottom: 6 } }, 'Photo'),
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (m) { set({ photoUrl: m.url, photoId: m.id }); },
                                    allowedTypes: ['image'],
                                    value: a.photoId,
                                    render: function (ref) {
                                        return el(Button, { onClick: ref.open, variant: a.photoUrl ? 'secondary' : 'primary', __nextHasNoMarginBottom: true }, a.photoUrl ? 'Change Photo' : 'Upload Photo');
                                    }
                                })
                            ),
                            a.photoUrl && el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ photoUrl: '', photoId: 0 }); }, __nextHasNoMarginBottom: true }, 'Remove Photo')
                        )
                    ),

                    // Experience
                    a.showExperience && el(PanelBody, { title: 'Experience (' + a.experience.length + ')', initialOpen: false },
                        el(TextControl, { label: 'Section title', value: a.experienceTitle, onChange: function (v) { set({ experienceTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        a.experience.map(function (exp, i) {
                            return el('div', {
                                key: i,
                                style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8, background: '#fafafa' }
                            },
                                el('div', { style: { fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 6 } }, (i + 1) + '. ' + (exp.role || 'Role')),
                                el(TextControl, { label: 'Role / Position', value: exp.role, onChange: function (v) { set({ experience: updateItem(a.experience, i, 'role', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Company', value: exp.company, onChange: function (v) { set({ experience: updateItem(a.experience, i, 'company', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Location', value: exp.location, onChange: function (v) { set({ experience: updateItem(a.experience, i, 'location', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Start date', value: exp.startDate, placeholder: 'Jan 2021', onChange: function (v) { set({ experience: updateItem(a.experience, i, 'startDate', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(ToggleControl, { label: 'Current position', checked: exp.isCurrent, onChange: function (v) { set({ experience: updateItem(a.experience, i, 'isCurrent', v) }); }, __nextHasNoMarginBottom: true }),
                                !exp.isCurrent && el(Fragment, null,
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'End date', value: exp.endDate, placeholder: 'Dec 2023', onChange: function (v) { set({ experience: updateItem(a.experience, i, 'endDate', v) }); }, __nextHasNoMarginBottom: true })
                                ),
                                el('div', { style: { height: 6 } }),
                                el(TextareaControl, { label: 'Description', value: exp.description, rows: 3, onChange: function (v) { set({ experience: updateItem(a.experience, i, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(Button, { isDestructive: true, variant: 'link', size: 'small', onClick: function () { set({ experience: a.experience.filter(function (_, idx) { return idx !== i; }) }); }, __nextHasNoMarginBottom: true }, 'Remove')
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: function () { set({ experience: a.experience.concat([{ role: 'Job Title', company: 'Company Name', startDate: '', endDate: '', isCurrent: false, location: '', description: '' }]) }); }, style: { width: '100%', justifyContent: 'center' }, __nextHasNoMarginBottom: true }, '+ Add Experience')
                    ),

                    // Education
                    a.showEducation && el(PanelBody, { title: 'Education (' + a.education.length + ')', initialOpen: false },
                        el(TextControl, { label: 'Section title', value: a.educationTitle, onChange: function (v) { set({ educationTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        a.education.map(function (edu, i) {
                            return el('div', {
                                key: i,
                                style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8, background: '#fafafa' }
                            },
                                el(TextControl, { label: 'Degree / Qualification', value: edu.degree, onChange: function (v) { set({ education: updateItem(a.education, i, 'degree', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Institution', value: edu.institution, onChange: function (v) { set({ education: updateItem(a.education, i, 'institution', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Start year', value: edu.startYear, onChange: function (v) { set({ education: updateItem(a.education, i, 'startYear', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'End year', value: edu.endYear, onChange: function (v) { set({ education: updateItem(a.education, i, 'endYear', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextareaControl, { label: 'Description (optional)', value: edu.description, rows: 2, onChange: function (v) { set({ education: updateItem(a.education, i, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(Button, { isDestructive: true, variant: 'link', size: 'small', onClick: function () { set({ education: a.education.filter(function (_, idx) { return idx !== i; }) }); }, __nextHasNoMarginBottom: true }, 'Remove')
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: function () { set({ education: a.education.concat([{ degree: 'Degree', institution: 'University', startYear: '', endYear: '', description: '' }]) }); }, style: { width: '100%', justifyContent: 'center' }, __nextHasNoMarginBottom: true }, '+ Add Education')
                    ),

                    // Skills
                    a.showSkills && el(PanelBody, { title: 'Skills', initialOpen: false },
                        el(TextControl, { label: 'Section title', value: a.skillsTitle, onChange: function (v) { set({ skillsTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        a.skills.map(function (skill, i) {
                            return el('div', {
                                key: i,
                                style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8, background: '#fafafa' }
                            },
                                el(TextControl, { label: 'Category', value: skill.category, onChange: function (v) { set({ skills: updateItem(a.skills, i, 'category', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextareaControl, { label: 'Skills (comma-separated)', value: skill.items, rows: 2, onChange: function (v) { set({ skills: updateItem(a.skills, i, 'items', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(Button, { isDestructive: true, variant: 'link', size: 'small', onClick: function () { set({ skills: a.skills.filter(function (_, idx) { return idx !== i; }) }); }, __nextHasNoMarginBottom: true }, 'Remove')
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: function () { set({ skills: a.skills.concat([{ category: 'Category', items: '' }]) }); }, style: { width: '100%', justifyContent: 'center' }, __nextHasNoMarginBottom: true }, '+ Add Skill Group')
                    ),

                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { label: 'Layout', value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 500, max: 1200, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Container padding (px)', value: a.containerPadding, min: 16, max: 64, onChange: function (v) { set({ containerPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Border radius (px)', value: a.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Avatar size (px)', value: a.avatarSize, min: 48, max: 140, onChange: function (v) { set({ avatarSize: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Section gap (px)', value: a.sectionGap, min: 16, max: 60, onChange: function (v) { set({ sectionGap: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Typography
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function(){ var TC = getTypoControl(); return TC ? el(TC, { label: __('Name', 'blockenberg'), value: a.nameTypo, onChange: function(v){ set({nameTypo:v}); } }) : null; })(),
                        (function(){ var TC = getTypoControl(); return TC ? el(TC, { label: __('Body Text', 'blockenberg'), value: a.bodyTypo, onChange: function(v){ set({bodyTypo:v}); } }) : null; })()
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Accent Color',         value: a.accentColor,          onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                            { label: 'Card Background',      value: a.bgColor,              onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Header Background',    value: a.headerBg,             onChange: function (v) { set({ headerBg: v || '#f8fafc' }); } },
                            { label: 'Heading Color',        value: a.sectionHeadingColor,  onChange: function (v) { set({ sectionHeadingColor: v || '#111827' }); } },
                            { label: 'Body Text',            value: a.textColor,            onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Subtext / Meta',       value: a.subtextColor,         onChange: function (v) { set({ subtextColor: v || '#6b7280' }); } },
                            { label: 'Skill Tag Background', value: a.tagBg,               onChange: function (v) { set({ tagBg: v || '#f1f5f9' }); } },
                            { label: 'Skill Tag Text',       value: a.tagColor,             onChange: function (v) { set({ tagColor: v || '#475569' }); } },
                            { label: 'Divider Color',        value: a.dividerColor,         onChange: function (v) { set({ dividerColor: v || '#e5e7eb' }); } },
                            { label: 'Timeline Dot',         value: a.timelineDotColor,     onChange: function (v) { set({ timelineDotColor: v || '#6366f1' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('div', { style: container },

                        // Header
                        el('div', { className: 'bkbg-rv-header',
                            style: {
                                background: a.headerBg,
                                padding: a.containerPadding + 'px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 20,
                                borderBottom: '1px solid ' + a.dividerColor,
                            }
                        },
                            a.showPhoto && el('div', {
                                style: {
                                    width: a.avatarSize + 'px',
                                    height: a.avatarSize + 'px',
                                    borderRadius: '50%',
                                    background: a.accentColor,
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: Math.round(a.avatarSize * 0.38) + 'px',
                                    fontWeight: 700,
                                }
                            }, a.photoUrl
                                ? el('img', { src: a.photoUrl, alt: a.name, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                                : (a.name || 'A').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('')
                            ),
                            el('div', { style: { flexGrow: 1 } },
                                el('h2', { className: 'bkbg-rv-name', style: { margin: '0 0 4px', color: a.sectionHeadingColor } }, a.name),
                                el('p', { style: { margin: '0 0 12px', fontSize: 16, color: a.accentColor, fontWeight: 600 } }, a.jobTitle),
                                a.showContact && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 13, color: a.subtextColor } },
                                    a.email && el('span', null, '✉ ' + a.email),
                                    a.phone && el('span', null, '📞 ' + a.phone),
                                    a.location && el('span', null, '📍 ' + a.location),
                                    a.website && el('span', null, '🌐 ' + a.website)
                                )
                            )
                        ),

                        // Body
                        el('div', { style: { padding: a.containerPadding + 'px' } },

                            // Summary
                            a.showSummary && el('div', { style: { marginBottom: a.sectionGap + 'px' } },
                                SectionHeading(a.summaryTitle, a.accentColor),
                                el('p', { className: 'bkbg-rv-summary', style: { margin: 0, color: a.textColor } }, a.summary)
                            ),

                            // Experience
                            a.showExperience && el('div', { style: { marginBottom: a.sectionGap + 'px' } },
                                SectionHeading(a.experienceTitle, a.accentColor),
                                a.experience.map(function (exp, i) { return el(Fragment, { key: i }, ExperiencePreview(exp, a)); })
                            ),

                            // Education
                            a.showEducation && el('div', { style: { marginBottom: a.sectionGap + 'px' } },
                                SectionHeading(a.educationTitle, a.accentColor),
                                a.education.map(function (edu, i) { return el(Fragment, { key: i }, EducationPreview(edu, a)); })
                            ),

                            // Skills
                            a.showSkills && el('div', null,
                                SectionHeading(a.skillsTitle, a.accentColor),
                                a.skills.map(function (skill, i) {
                                    return el('div', { key: i, style: { marginBottom: 14 } },
                                        el('div', { style: { fontSize: 13, fontWeight: 700, color: a.sectionHeadingColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' } }, skill.category),
                                        el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
                                            (skill.items || '').split(',').map(function (item, j) {
                                                var t = item.trim();
                                                if (!t) return null;
                                                return el('span', {
                                                    key: j,
                                                    style: {
                                                        background: a.tagBg, color: a.tagColor,
                                                        borderRadius: 99, padding: '3px 10px', fontSize: 13,
                                                    }
                                                }, t);
                                            })
                                        )
                                    );
                                })
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-rv-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
