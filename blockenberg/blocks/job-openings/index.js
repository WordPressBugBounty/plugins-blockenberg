( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];

    registerBlockType('blockenberg/job-openings', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = { backgroundColor: a.bgColor, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' };
                Object.assign(s, _tv(a.headingTypo,  '--bkbg-jo-h-'));
                Object.assign(s, _tv(a.eyebrowTypo,  '--bkbg-jo-ew-'));
                Object.assign(s, _tv(a.subtextTypo,  '--bkbg-jo-st-'));
                Object.assign(s, _tv(a.jobTitleTypo, '--bkbg-jo-jt-'));
                Object.assign(s, _tv(a.jobDescTypo,  '--bkbg-jo-jd-'));
                return { className: 'bkbg-job-wrap', style: s };
            })());

            function updateJob(idx, key, val) {
                setAttributes({ jobs: a.jobs.map(function (j, i) { return i === idx ? Object.assign({}, j, { [key]: val }) : j; }) });
            }
            function addJob() {
                setAttributes({ jobs: a.jobs.concat([{ title: 'New Position', department: 'Department', location: 'Remote', type: 'Full-time', url: '#', description: '' }]) });
            }
            function removeJob(idx) {
                setAttributes({ jobs: a.jobs.filter(function (_, i) { return i !== idx; }) });
            }

            var innerStyle = { maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' };

            function jobCard(j, idx) {
                return el('div', { key: idx, className: 'bkbg-job-card', style: { background: a.jobCardBg, border: '1px solid ' + a.jobCardBorder, borderRadius: 12, padding: '24px 28px', position: 'relative', marginBottom: a.layout === 'list' ? 16 : 0 } },
                    el(Button, { isDestructive: true, size: 'small', onClick: function () { removeJob(idx); }, style: { position: 'absolute', top: 12, right: 12, fontSize: 10 } }, '✕'),
                    // Tags row
                    el('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' } },
                        el('span', { style: { background: a.deptBg, color: a.deptColor, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 } }, j.department),
                        el('span', { style: { background: a.typeBg, color: a.typeColor, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 } }, j.type),
                        el('span', { style: { color: a.locationColor, fontSize: 13 } }, '📍 ', j.location)
                    ),
                    el(RichText, { tagName: 'h3', className: 'bkbg-job-title', value: j.title, onChange: function (v) { updateJob(idx, 'title', v); }, placeholder: __('Job Title…', 'blockenberg'), style: { color: a.jobTitleColor, margin: '0 0 8px' } }),
                    a.showDescription && el(RichText, { tagName: 'p', className: 'bkbg-job-desc', value: j.description, onChange: function (v) { updateJob(idx, 'description', v); }, placeholder: __('Job description…', 'blockenberg'), style: { color: a.jobDescColor, margin: '0 0 16px' } }),
                    // Inline edit fields
                    el('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 } },
                        el(TextControl, { label: __('Dept', 'blockenberg'), value: j.department, onChange: function (v) { updateJob(idx, 'department', v); }, style: { flex: 1 }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Location', 'blockenberg'), value: j.location, onChange: function (v) { updateJob(idx, 'location', v); }, style: { flex: 1 }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: __('Type', 'blockenberg'), value: j.type, options: JOB_TYPES.map(function (t) { return { label: t, value: t }; }), onChange: function (v) { updateJob(idx, 'type', v); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Apply URL', 'blockenberg'), value: j.url, onChange: function (v) { updateJob(idx, 'url', v); }, style: { flex: 2 }, __nextHasNoMarginBottom: true })
                    ),
                    el('a', { href: '#', style: { display: 'inline-block', marginTop: 12, background: a.applyBg, color: a.applyColor, fontWeight: 700, fontSize: 14, padding: '10px 22px', borderRadius: 6, textDecoration: 'none' } }, a.applyLabel)
                );
            }

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: a.showEyebrow, onChange: function (v) { setAttributes({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        a.showEyebrow && el(TextControl, { label: __('Eyebrow', 'blockenberg'), value: a.eyebrow, onChange: function (v) { setAttributes({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: a.showSubtext, onChange: function (v) { setAttributes({ showSubtext: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Description', 'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttributes({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Filter Tabs', 'blockenberg'), checked: a.showFilter, onChange: function (v) { setAttributes({ showFilter: v }); }, __nextHasNoMarginBottom: true }),
                        a.showFilter && el(SelectControl, { label: __('Filter By', 'blockenberg'), value: a.filterBy, options: [{ label: 'Department', value: 'department' }, { label: 'Job Type', value: 'type' }, { label: 'Location', value: 'location' }], onChange: function (v) { setAttributes({ filterBy: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Apply Button Label', 'blockenberg'), value: a.applyLabel, onChange: function (v) { setAttributes({ applyLabel: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Open in New Tab', 'blockenberg'), checked: a.openInNewTab, onChange: function (v) { setAttributes({ openInNewTab: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'List', value: 'list' }, { label: 'Grid (2 col)', value: 'grid' }], onChange: function (v) { setAttributes({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 600, max: 1400, onChange: function (v) { setAttributes({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Heading', 'blockenberg'),      value: a.headingTypo,  onChange: function (v) { setAttributes({ headingTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Eyebrow', 'blockenberg'),      value: a.eyebrowTypo,  onChange: function (v) { setAttributes({ eyebrowTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Subtext', 'blockenberg'),      value: a.subtextTypo,  onChange: function (v) { setAttributes({ subtextTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Job Title', 'blockenberg'),    value: a.jobTitleTypo, onChange: function (v) { setAttributes({ jobTitleTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Job Description', 'blockenberg'), value: a.jobDescTypo, onChange: function (v) { setAttributes({ jobDescTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                            { label: __('Eyebrow Color', 'blockenberg'), value: a.eyebrowColor, onChange: function (v) { setAttributes({ eyebrowColor: v || '#7c3aed' }); } },
                            { label: __('Heading Color', 'blockenberg'), value: a.headingColor, onChange: function (v) { setAttributes({ headingColor: v || '#111827' }); } },
                            { label: __('Card BG', 'blockenberg'), value: a.jobCardBg, onChange: function (v) { setAttributes({ jobCardBg: v || '#f9fafb' }); } },
                            { label: __('Dept Tag Color', 'blockenberg'), value: a.deptColor, onChange: function (v) { setAttributes({ deptColor: v || '#7c3aed' }); } },
                            { label: __('Type Tag Color', 'blockenberg'), value: a.typeColor, onChange: function (v) { setAttributes({ typeColor: v || '#15803d' }); } },
                            { label: __('Filter Active BG', 'blockenberg'), value: a.filterActiveBg, onChange: function (v) { setAttributes({ filterActiveBg: v || '#7c3aed' }); } },
                            { label: __('Apply Button BG', 'blockenberg'), value: a.applyBg, onChange: function (v) { setAttributes({ applyBg: v || '#7c3aed' }); } }
                        ]
                    })
                ),

                el('div', { style: innerStyle },
                    // Header
                    el('div', { style: { textAlign: 'center', marginBottom: 48 } },
                        a.showEyebrow && el('span', { className: 'bkbg-job-eyebrow', style: { display: 'inline-block', background: a.eyebrowBg, color: a.eyebrowColor, padding: '5px 14px', borderRadius: 999, marginBottom: 16 } }, a.eyebrow),
                        el(RichText, { tagName: 'h2', className: 'bkbg-job-heading', value: a.heading, onChange: function (v) { setAttributes({ heading: v }); }, placeholder: __('Heading…', 'blockenberg'), style: { color: a.headingColor, margin: '0 0 16px' } }),
                        a.showSubtext && el(RichText, { tagName: 'p', className: 'bkbg-job-subtext', value: a.subtext, onChange: function (v) { setAttributes({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg'), style: { color: a.subtextColor, margin: '0 auto', maxWidth: 600 } })
                    ),

                    // Filter tabs preview
                    a.showFilter && el('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, justifyContent: 'center' } },
                        el('button', { style: { background: a.filterActiveBg, color: a.filterActiveColor, border: 'none', padding: '8px 18px', borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: 'default' } }, 'All'),
                        Array.from(new Set(a.jobs.map(function (j) { return j[a.filterBy]; }))).map(function (val, idx) {
                            return el('button', { key: idx, style: { background: a.filterBg, color: a.filterColor, border: 'none', padding: '8px 18px', borderRadius: 999, fontWeight: 600, fontSize: 13, cursor: 'default' } }, val);
                        })
                    ),

                    // Job listings
                    el('div', {
                        style: a.layout === 'grid'
                            ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }
                            : { display: 'flex', flexDirection: 'column', gap: 0 }
                    },
                        a.jobs.map(function (j, idx) { return jobCard(j, idx); }),
                        el('div', {
                            onClick: addJob,
                            style: { border: '2px dashed #d1d5db', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', marginTop: a.layout === 'list' ? 16 : 0 }
                        },
                            el('span', { style: { fontSize: 13, color: '#9ca3af' } }, '+ Add Job Posting')
                        )
                    )
                )
            );
        },
        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            var a = props.attributes;
            var _tv = getTypoCssVars();
            var s = {};
            Object.assign(s, _tv(a.headingTypo,  '--bkbg-jo-h-'));
            Object.assign(s, _tv(a.eyebrowTypo,  '--bkbg-jo-ew-'));
            Object.assign(s, _tv(a.subtextTypo,  '--bkbg-jo-st-'));
            Object.assign(s, _tv(a.jobTitleTypo, '--bkbg-jo-jt-'));
            Object.assign(s, _tv(a.jobDescTypo,  '--bkbg-jo-jd-'));
            return el('div', useBlockProps.save({ style: s }),
                el('div', { className: 'bkbg-job-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
