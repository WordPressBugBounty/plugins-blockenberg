( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var useState          = wp.element.useState;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var RichText          = wp.blockEditor.RichText;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var ColorPicker       = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var JOB_TYPES = [
        { label: 'Full‑time',   value: 'full-time' },
        { label: 'Part‑time',   value: 'part-time' },
        { label: 'Contract',    value: 'contract' },
        { label: 'Freelance',   value: 'freelance' },
        { label: 'Internship',  value: 'internship' },
        { label: 'Temporary',   value: 'temporary' },
    ];

    var LOCATION_TYPES = [
        { label: 'On‑site',   value: 'onsite' },
        { label: 'Remote',    value: 'remote' },
        { label: 'Hybrid',    value: 'hybrid' },
    ];

    var PERIODS = [
        { label: 'per year',   value: 'year' },
        { label: 'per month',  value: 'month' },
        { label: 'per hour',   value: 'hour' },
        { label: 'per project', value: 'project' },
    ];

    function jobTypeLabel(v) {
        var f = JOB_TYPES.find(function (t) { return t.value === v; });
        return f ? f.label : v;
    }

    function locationIcon(v) {
        if (v === 'remote') { return '🌐'; }
        if (v === 'hybrid') { return '🔀'; }
        return '📍';
    }

    /* ── meta pill ──────────────────────────────────────────────────────────── */
    function Pill(props) {
        var ls = props.ls;
        return el('span', {
            className: ls ? undefined : 'bkjl-pill',
            style: {
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: props.bg || '#f3f4f6',
                color: props.color || '#374151',
                padding: '3px 10px', borderRadius: '999px',
                fontSize: ls ? '12px' : undefined,
                fontWeight: ls ? 600 : undefined,
                whiteSpace: 'nowrap',
            }
        }, props.icon && el('span', null, props.icon), props.label);
    }

    /* ── card preview used in both edit & save ──────────────────────────────── */
    function JobCard(props) {
        var a       = props.a;
        var isEdit  = props.isEdit;
        var ls      = props.legacyStyles;

        var skills = (a.skills || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

        var cardStyle = {
            background: a.cardBg,
            borderRadius: a.cardBorderRadius + 'px',
            padding: a.cardPadding + 'px',
            boxShadow: a.showShadow ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
            border: a.showBorder ? '1px solid ' + a.borderColor : 'none',
            position: 'relative',
            overflow: 'hidden',
        };

        return el('div', { className: 'bkjl-card', style: cardStyle },
            /* featured stripe */
            a.featured && el('div', {
                className: 'bkjl-featured-stripe',
                style: { position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: a.featuredColor }
            }),

            /* header row */
            el('div', { className: 'bkjl-header', style: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' } },
                a.showLogo && el('div', { className: 'bkjl-logo-wrap', style: { flexShrink: 0 } },
                    a.logoUrl
                        ? el('img', {
                            src: a.logoUrl, alt: a.logoAlt,
                            style: { width: a.logoSize + 'px', height: a.logoSize + 'px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'block' }
                        })
                        : el('div', {
                            style: { width: a.logoSize + 'px', height: a.logoSize + 'px', borderRadius: '8px', background: '#ece9f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.companyColor, fontWeight: 700, fontSize: '20px' }
                        }, (a.company || 'C').charAt(0).toUpperCase())
                ),

                el('div', { style: { flex: 1, minWidth: 0 } },
                    /* badges row */
                    el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px', alignItems: 'center' } },
                        a.featured && el('span', {
                            className: 'bkjl-badge-featured',
                            style: { background: a.featuredColor, color: a.featuredTextColor, padding: '2px 8px', borderRadius: '4px',
                                fontSize: ls ? '11px' : undefined, fontWeight: ls ? 700 : undefined, letterSpacing: ls ? '.3px' : undefined }
                        }, (a.featuredLabel || 'Featured').toUpperCase()),
                        a.urgent && el('span', {
                            className: 'bkjl-badge-urgent',
                            style: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px',
                                fontSize: ls ? '11px' : undefined, fontWeight: ls ? 700 : undefined }
                        }, 'URGENT')
                    ),

                    /* title */
                    isEdit
                        ? el(RichText, {
                            tagName: 'h3', className: 'bkjl-title',
                            value: a.jobTitle,
                            onChange: function (v) { props.setAttr({ jobTitle: v }); },
                            style: { margin: '0 0 4px', color: a.titleColor },
                            placeholder: __('Job Title', 'blockenberg'),
                        })
                        : el(RichText.Content, { tagName: 'h3', className: 'bkjl-title', value: a.jobTitle, style: { margin: '0 0 4px', color: a.titleColor } }),

                    /* company */
                    el('p', { className: 'bkjl-company', style: { margin: '0 0 8px', color: a.companyColor, fontWeight: ls ? 600 : undefined, fontSize: ls ? '14px' : undefined } },
                        isEdit
                            ? el(RichText, { tagName: 'span', value: a.company, onChange: function (v) { props.setAttr({ company: v }); }, placeholder: __('Company', 'blockenberg') })
                            : el(RichText.Content, { tagName: 'span', value: a.company }),
                        a.department && el('span', { style: { color: a.metaColor, fontWeight: 400, marginLeft: '6px' } }, '· ' + a.department)
                    ),

                    /* meta pills row */
                    el('div', { className: 'bkjl-meta', style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
                        el(Pill, { bg: a.jobTypeBg, color: a.jobTypeText, label: jobTypeLabel(a.jobType), ls: ls }),
                        el(Pill, { bg: '#f0fdf4', color: '#16a34a', icon: locationIcon(a.locationType), label: a.location || 'Location', ls: ls }),
                        a.locationType !== 'onsite' && el(Pill, { bg: '#eff6ff', color: '#2563eb', label: a.locationType === 'remote' ? 'Remote' : 'Hybrid', ls: ls }),
                        a.showSalary && a.salaryMin && el(Pill, { bg: '#fef9c3', color: '#854d0e', icon: '💰', label: a.salaryCurrency + a.salaryMin + (a.salaryMax ? '–' + a.salaryCurrency + a.salaryMax : '') + ' / ' + a.salaryPeriod, ls: ls })
                    )
                )
            ),

            /* divider */
            a.showDivider && el('hr', { style: { border: 'none', borderTop: '1px solid ' + a.dividerColor, margin: '14px 0' } }),

            /* description */
            a.showDescription && (
                isEdit
                    ? el(RichText, {
                        tagName: 'p', className: 'bkjl-desc',
                        value: a.description,
                        onChange: function (v) { props.setAttr({ description: v }); },
                        style: { margin: '0 0 14px', color: a.bodyColor, fontSize: ls ? '14px' : undefined, lineHeight: ls ? 1.65 : undefined },
                        placeholder: __('Job description...', 'blockenberg'),
                    })
                    : el(RichText.Content, { tagName: 'p', className: 'bkjl-desc', value: a.description, style: { margin: '0 0 14px', color: a.bodyColor, fontSize: ls ? '14px' : undefined, lineHeight: ls ? 1.65 : undefined } })
            ),

            /* skills */
            a.showSkills && skills.length > 0 && el('div', { className: 'bkjl-skills', style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' } },
                skills.map(function (s, i) {
                    return el('span', {
                        key: i,
                        className: 'bkjl-skill',
                        style: { background: a.skillBg, color: a.skillText, padding: '3px 10px', borderRadius: '4px',
                            fontSize: ls ? '12px' : undefined, fontWeight: ls ? 500 : undefined }
                    }, s);
                })
            ),

            /* footer row */
            el('div', { className: 'bkjl-footer', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' } },
                el('div', { className: 'bkjl-dates', style: { display: 'flex', gap: '16px', flexWrap: 'wrap' } },
                    a.showPostedDate && a.postedDate && el('span', { className: 'bkjl-posted', style: { color: a.metaColor, fontSize: ls ? '12px' : undefined, display: 'flex', alignItems: 'center', gap: '4px' } }, '🗓 Posted: ' + a.postedDate),
                    a.showDeadline && a.deadline && el('span', { className: 'bkjl-deadline', style: { color: '#ef4444', fontSize: ls ? '12px' : undefined, display: 'flex', alignItems: 'center', gap: '4px' } }, '⏰ Deadline: ' + a.deadline)
                ),
                el('div', { className: 'bkjl-cta', style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                    a.showSecondaryBtn && a.secondaryLabel && el('a', {
                        href: isEdit ? undefined : (a.secondaryUrl || '#'),
                        className: 'bkjl-btn-secondary',
                        style: { padding: '9px 20px', borderRadius: a.primaryBtnRadius + 'px', border: '1px solid ' + a.primaryBtnBg, color: a.primaryBtnBg,
                            fontWeight: ls ? 600 : undefined, fontSize: ls ? '14px' : undefined, textDecoration: 'none', display: 'inline-block', transition: 'all .2s ease' }
                    }, a.secondaryLabel),
                    a.showApplyBtn && el('a', {
                        href: isEdit ? undefined : (a.applyUrl || '#'),
                        target: a.applyNewTab && !isEdit ? '_blank' : undefined,
                        rel: a.applyNewTab && !isEdit ? 'noopener noreferrer' : undefined,
                        className: 'bkjl-btn-apply',
                        style: { padding: '9px 22px', borderRadius: a.primaryBtnRadius + 'px', background: a.primaryBtnBg, color: a.primaryBtnText,
                            fontWeight: ls ? 700 : undefined, fontSize: ls ? '14px' : undefined, textDecoration: 'none', display: 'inline-block', transition: 'all .2s ease' }
                    }, a.applyLabel || 'Apply Now')
                )
            )
        );
    }

    /* ── edit ───────────────────────────────────────────────────────────────── */
    function Edit(props) {
        var attributes    = props.attributes;
        var setAttributes = props.setAttributes;
        var a             = attributes;

        var blockProps = useBlockProps((function () {
            var _tv = getTypoCssVars();
            var s = {};
            Object.assign(s,
                _tv(a.titleTypo,   '--bkjl-tt-'),
                _tv(a.typoCompany, '--bkjl-co-'),
                _tv(a.typoDesc,    '--bkjl-de-'),
                _tv(a.typoSkill,   '--bkjl-sk-'),
                _tv(a.typoBadge,   '--bkjl-ba-'),
                _tv(a.typoPill,    '--bkjl-pi-'),
                _tv(a.typoMeta,    '--bkjl-mt-'),
                _tv(a.typoBtn,     '--bkjl-bt-')
            );
            return { style: s };
        })());

        function setAttr(obj) { setAttributes(obj); }

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Job Details */
                el(PanelBody, { title: __('Job Details', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Job Title', 'blockenberg'), value: a.jobTitle, onChange: function (v) { setAttr({ jobTitle: v }); } }),
                    el(TextControl, { label: __('Company', 'blockenberg'), value: a.company, onChange: function (v) { setAttr({ company: v }); } }),
                    el(TextControl, { label: __('Department', 'blockenberg'), value: a.department, onChange: function (v) { setAttr({ department: v }); } }),
                    el(TextControl, { label: __('Location', 'blockenberg'), value: a.location, onChange: function (v) { setAttr({ location: v }); } }),
                    el(SelectControl, {
                        label: __('Location Type', 'blockenberg'), value: a.locationType, options: LOCATION_TYPES,
                        onChange: function (v) { setAttr({ locationType: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Job Type', 'blockenberg'), value: a.jobType, options: JOB_TYPES,
                        onChange: function (v) { setAttr({ jobType: v }); }
                    })
                ),

                /* Salary */
                el(PanelBody, { title: __('Salary', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Salary', 'blockenberg'), checked: a.showSalary, onChange: function (v) { setAttr({ showSalary: v }); }, __nextHasNoMarginBottom: true }),
                    a.showSalary && el(Fragment, null,
                        el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.salaryCurrency, onChange: function (v) { setAttr({ salaryCurrency: v }); } }),
                        el(TextControl, { label: __('Min Salary', 'blockenberg'), value: a.salaryMin, onChange: function (v) { setAttr({ salaryMin: v }); } }),
                        el(TextControl, { label: __('Max Salary', 'blockenberg'), value: a.salaryMax, onChange: function (v) { setAttr({ salaryMax: v }); } }),
                        el(SelectControl, {
                            label: __('Period', 'blockenberg'), value: a.salaryPeriod, options: PERIODS,
                            onChange: function (v) { setAttr({ salaryPeriod: v }); }
                        })
                    )
                ),

                /* Dates */
                el(PanelBody, { title: __('Dates', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Posted Date', 'blockenberg'), checked: a.showPostedDate, onChange: function (v) { setAttr({ showPostedDate: v }); }, __nextHasNoMarginBottom: true }),
                    a.showPostedDate && el(TextControl, { label: __('Posted Date', 'blockenberg'), value: a.postedDate, placeholder: 'e.g. Jan 15, 2026', onChange: function (v) { setAttr({ postedDate: v }); } }),
                    el(ToggleControl, { label: __('Show Deadline', 'blockenberg'), checked: a.showDeadline, onChange: function (v) { setAttr({ showDeadline: v }); }, __nextHasNoMarginBottom: true }),
                    a.showDeadline && el(TextControl, { label: __('Application Deadline', 'blockenberg'), value: a.deadline, placeholder: 'e.g. Feb 28, 2026', onChange: function (v) { setAttr({ deadline: v }); } })
                ),

                /* Content */
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Description', 'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Skills', 'blockenberg'), checked: a.showSkills, onChange: function (v) { setAttr({ showSkills: v }); }, __nextHasNoMarginBottom: true }),
                    a.showSkills && el(TextControl, {
                        label: __('Skills (comma-separated)', 'blockenberg'), value: a.skills,
                        placeholder: 'React, Node.js, CSS',
                        onChange: function (v) { setAttr({ skills: v }); }
                    })
                ),

                /* CTA */
                el(PanelBody, { title: __('Buttons', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Apply Button', 'blockenberg'), checked: a.showApplyBtn, onChange: function (v) { setAttr({ showApplyBtn: v }); }, __nextHasNoMarginBottom: true }),
                    a.showApplyBtn && el(Fragment, null,
                        el(TextControl, { label: __('Apply Label', 'blockenberg'), value: a.applyLabel, onChange: function (v) { setAttr({ applyLabel: v }); } }),
                        el(TextControl, { label: __('Apply URL', 'blockenberg'), value: a.applyUrl, placeholder: 'https://', onChange: function (v) { setAttr({ applyUrl: v }); } }),
                        el(ToggleControl, { label: __('Open in New Tab', 'blockenberg'), checked: a.applyNewTab, onChange: function (v) { setAttr({ applyNewTab: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(ToggleControl, { label: __('Show Secondary Button', 'blockenberg'), checked: a.showSecondaryBtn, onChange: function (v) { setAttr({ showSecondaryBtn: v }); }, __nextHasNoMarginBottom: true }),
                    a.showSecondaryBtn && el(Fragment, null,
                        el(TextControl, { label: __('Secondary Label', 'blockenberg'), value: a.secondaryLabel, onChange: function (v) { setAttr({ secondaryLabel: v }); } }),
                        el(TextControl, { label: __('Secondary URL', 'blockenberg'), value: a.secondaryUrl, placeholder: 'https://', onChange: function (v) { setAttr({ secondaryUrl: v }); } })
                    ),
                    el(RangeControl, { label: __('Button Border Radius', 'blockenberg'), value: a.primaryBtnRadius, min: 0, max: 50, onChange: function (v) { setAttr({ primaryBtnRadius: v }); } })
                ),

                /* Logo */
                el(PanelBody, { title: __('Company Logo', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Logo', 'blockenberg'), checked: a.showLogo, onChange: function (v) { setAttr({ showLogo: v }); }, __nextHasNoMarginBottom: true }),
                    a.showLogo && el(Fragment, null,
                        el(RangeControl, { label: __('Logo Size (px)', 'blockenberg'), value: a.logoSize, min: 32, max: 100, onChange: function (v) { setAttr({ logoSize: v }); } }),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ logoUrl: m.url, logoId: m.id, logoAlt: m.alt || '' }); },
                                allowedTypes: ['image'],
                                value: a.logoId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        a.logoUrl && el('div', { style: { margin: '8px 0' } },
                                            el('img', { src: a.logoUrl, style: { width: '64px', height: '64px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e5e7eb' } })
                                        ),
                                        el(Button, { onClick: r.open, isSecondary: true, isSmall: true }, a.logoUrl ? __('Change Logo', 'blockenberg') : __('Select Logo', 'blockenberg')),
                                        a.logoUrl && el(Button, { onClick: function () { setAttr({ logoUrl: '', logoId: 0, logoAlt: '' }); }, isDestructive: true, isSmall: true, style: { marginLeft: '6px' } }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        )
                    )
                ),

                /* Badges */
                el(PanelBody, { title: __('Badges', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Featured', 'blockenberg'), checked: a.featured, onChange: function (v) { setAttr({ featured: v }); }, __nextHasNoMarginBottom: true }),
                    a.featured && el(TextControl, { label: __('Featured Label', 'blockenberg'), value: a.featuredLabel, onChange: function (v) { setAttr({ featuredLabel: v }); } }),
                    el(ToggleControl, { label: __('Mark as Urgent', 'blockenberg'), checked: a.urgent, onChange: function (v) { setAttr({ urgent: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Card Style */
                el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.cardBorderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ cardBorderRadius: v }); } }),
                    el(RangeControl, { label: __('Padding (px)', 'blockenberg'), value: a.cardPadding, min: 12, max: 60, onChange: function (v) { setAttr({ cardPadding: v }); } }),
                    el(ToggleControl, { label: __('Show Shadow', 'blockenberg'), checked: a.showShadow, onChange: function (v) { setAttr({ showShadow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Border', 'blockenberg'), checked: a.showBorder, onChange: function (v) { setAttr({ showBorder: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Divider', 'blockenberg'), checked: a.showDivider, onChange: function (v) { setAttr({ showDivider: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'),   value: a.titleTypo,   onChange: function (v) { setAttr({ titleTypo: v }); } }),
                    el(getTypographyControl(), { label: __('Company', 'blockenberg'), value: a.typoCompany, onChange: function (v) { setAttr({ typoCompany: v }); } }),
                    el(getTypographyControl(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { setAttr({ typoDesc: v }); } }),
                    el(getTypographyControl(), { label: __('Skills', 'blockenberg'),  value: a.typoSkill,   onChange: function (v) { setAttr({ typoSkill: v }); } }),
                    el(getTypographyControl(), { label: __('Badges', 'blockenberg'),  value: a.typoBadge,   onChange: function (v) { setAttr({ typoBadge: v }); } }),
                    el(getTypographyControl(), { label: __('Meta Pills', 'blockenberg'), value: a.typoPill,  onChange: function (v) { setAttr({ typoPill: v }); } }),
                    el(getTypographyControl(), { label: __('Meta / Dates', 'blockenberg'), value: a.typoMeta, onChange: function (v) { setAttr({ typoMeta: v }); } }),
                    el(getTypographyControl(), { label: __('Buttons', 'blockenberg'), value: a.typoBtn,     onChange: function (v) { setAttr({ typoBtn: v }); } })
                ),

                /* Colors */
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                        { label: __('Title', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#1e1e1e' }); } },
                        { label: __('Company', 'blockenberg'), value: a.companyColor, onChange: function (v) { setAttr({ companyColor: v || '#6c3fb5' }); } },
                        { label: __('Body Text', 'blockenberg'), value: a.bodyColor, onChange: function (v) { setAttr({ bodyColor: v || '#374151' }); } },
                        { label: __('Meta Text', 'blockenberg'), value: a.metaColor, onChange: function (v) { setAttr({ metaColor: v || '#6b7280' }); } },
                        { label: __('Apply Button Bg', 'blockenberg'), value: a.primaryBtnBg, onChange: function (v) { setAttr({ primaryBtnBg: v || '#6c3fb5' }); } },
                        { label: __('Apply Button Text', 'blockenberg'), value: a.primaryBtnText, onChange: function (v) { setAttr({ primaryBtnText: v || '#ffffff' }); } },
                        { label: __('Job Type Badge Bg', 'blockenberg'), value: a.jobTypeBg, onChange: function (v) { setAttr({ jobTypeBg: v || '#ede9fe' }); } },
                        { label: __('Job Type Badge Text', 'blockenberg'), value: a.jobTypeText, onChange: function (v) { setAttr({ jobTypeText: v || '#6c3fb5' }); } },
                        { label: __('Skill Bg', 'blockenberg'), value: a.skillBg, onChange: function (v) { setAttr({ skillBg: v || '#f3f4f6' }); } },
                        { label: __('Skill Text', 'blockenberg'), value: a.skillText, onChange: function (v) { setAttr({ skillText: v || '#374151' }); } },
                        { label: __('Featured Color', 'blockenberg'), value: a.featuredColor, onChange: function (v) { setAttr({ featuredColor: v || '#f59e0b' }); } },
                        { label: __('Border / Divider', 'blockenberg'), value: a.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                    ]
                })
            ),

            el('div', blockProps,
                el(JobCard, { a: a, isEdit: true, setAttr: setAttributes })
            )
        );
    }

    /* ── save ───────────────────────────────────────────────────────────────── */
    function Save(props) {
        var a = props.attributes;
        var _tv = getTypoCssVars();
        var s = {};
        Object.assign(s,
            _tv(a.titleTypo,   '--bkjl-tt-'),
            _tv(a.typoCompany, '--bkjl-co-'),
            _tv(a.typoDesc,    '--bkjl-de-'),
            _tv(a.typoSkill,   '--bkjl-sk-'),
            _tv(a.typoBadge,   '--bkjl-ba-'),
            _tv(a.typoPill,    '--bkjl-pi-'),
            _tv(a.typoMeta,    '--bkjl-mt-'),
            _tv(a.typoBtn,     '--bkjl-bt-')
        );
        var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkjl-wrap', style: s });
        return el('div', blockProps,
            el(JobCard, { a: a, isEdit: false })
        );
    }

    /* ── deprecated ─────────────────────────────────────────────────────────── */
    var deprecated = [
        {
            save: function (props) {
                var a = props.attributes;
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(a.titleTypo, '--bkjl-tt-'));
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkjl-wrap', style: s });
                return el('div', blockProps,
                    el(JobCard, { a: a, isEdit: false, legacyStyles: true })
                );
            }
        }
    ];

    registerBlockType('blockenberg/job-listing', {
        edit: Edit,
        save: Save,
        deprecated: deprecated,
    });
}() );
