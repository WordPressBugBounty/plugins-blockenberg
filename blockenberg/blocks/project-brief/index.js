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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var statusOptions = [
        { label: '📋 Planning',  value: 'planning' },
        { label: '🚀 Active',    value: 'active'   },
        { label: '🔍 In Review', value: 'review'   },
        { label: '✅ Complete',  value: 'complete'  },
        { label: '⏸ On Hold',   value: 'on-hold'  }
    ];
    var levelOptions = [
        { label: 'Low',    value: 'low'    },
        { label: 'Medium', value: 'medium' },
        { label: 'High',   value: 'high'   }
    ];

    function statusInfo(s) {
        var map = {
            'planning': { label: '📋 Planning',  bg: '#dbeafe', color: '#1e3a8a' },
            'active':   { label: '🚀 Active',    bg: '#dcfce7', color: '#14532d' },
            'review':   { label: '🔍 In Review', bg: '#fef9c3', color: '#713f12' },
            'complete': { label: '✅ Complete',  bg: '#e0e7ff', color: '#3730a3' },
            'on-hold':  { label: '⏸ On Hold',   bg: '#fee2e2', color: '#991b1b' }
        };
        return map[s] || map['planning'];
    }

    function riskColor(level) {
        if (level === 'high')   return { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' };
        if (level === 'medium') return { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' };
        return                         { bg: '#f0fdf4', color: '#14532d', dot: '#22c55e' };
    }

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function sectionHead(label, a) {
        return el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: a.accentColor, borderBottom: '2px solid ' + a.accentColor, paddingBottom: 6, marginBottom: 12 } }, label);
    }

    registerBlockType('blockenberg/project-brief', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-pjb-tt-'));
                    Object.assign(s, _tv(a.bodyTypo || {}, '--bkbg-pjb-bd-'));
                }
                return { className: 'bkbg-pb-editor-wrap', style: s };
            })());
            var si = statusInfo(a.status);

            var preview = el('div', { className: 'bkbg-pb-wrap', style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { style: { background: a.headerBg, padding: '20px 24px' } },
                    el('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' } },
                        el('div', null,
                            el('h2', { className: 'bkbg-pb-title', style: { margin: '0 0 4px', color: a.headerColor } }, a.projectName),
                            el('div', { style: { fontSize: 12, color: a.metaColor } }, a.projectType)
                        ),
                        el('span', { style: { background: si.bg, color: si.color, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' } }, si.label)
                    ),
                    el('div', { style: { marginTop: 12, display: 'flex', gap: 20, flexWrap: 'wrap' } },
                        el('span', { style: { fontSize: 12, color: a.metaColor } }, '👤 Owner: ' + a.owner),
                        el('span', { style: { fontSize: 12, color: a.metaColor } }, '🏢 Client: ' + a.client),
                        a.showDates && el('span', { style: { fontSize: 12, color: a.metaColor } }, '📅 ' + a.startDate + ' → ' + a.endDate),
                        a.showBudget && a.budget && el('span', { style: { fontSize: 12, color: a.metaColor } }, '💰 ' + a.budget)
                    )
                ),
                // Body
                el('div', { style: { padding: '20px 24px', display: 'grid', gap: 20 } },
                    // Overview
                    el('div', null,
                        sectionHead('Project Overview', a),
                        el('p', { style: { margin: 0, color: a.bodyTextColor } }, a.overview)
                    ),
                    // Goals + Deliverables side by side
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } },
                        el('div', { style: { background: a.sectionBg, padding: 16, borderRadius: 8 } },
                            sectionHead('Goals', a),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.goals.map(function (g, i) {
                                    return el('li', { key: i, style: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' } },
                                        el('span', { style: { color: a.goalDotColor, fontWeight: 800, marginTop: 1, flexShrink: 0 } }, '✓'),
                                        el('span', { style: { color: a.bodyTextColor } }, g)
                                    );
                                })
                            )
                        ),
                        el('div', { style: { background: a.sectionBg, padding: 16, borderRadius: 8 } },
                            sectionHead('Deliverables', a),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.deliverables.map(function (d, i) {
                                    return el('li', { key: i, style: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' } },
                                        el('span', { style: { color: a.delivDotColor, fontWeight: 800, marginTop: 1, flexShrink: 0 } }, '→'),
                                        el('span', { style: { color: a.bodyTextColor } }, d)
                                    );
                                })
                            )
                        )
                    ),
                    // Stakeholders
                    el('div', null,
                        sectionHead('Stakeholders', a),
                        el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 } },
                            a.stakeholders.map(function (s, i) {
                                return el('div', { key: i, style: { background: a.sectionBg, padding: '10px 14px', borderRadius: 8, borderLeft: '3px solid ' + a.accentColor } },
                                    el('div', { style: { fontWeight: 700, color: a.sectionTitleColor } }, s.name),
                                    el('div', { style: { color: a.bodyTextColor, opacity: .75 } }, s.role)
                                );
                            })
                        )
                    ),
                    // Risks
                    a.risks.length > 0 && el('div', null,
                        sectionHead('Risks', a),
                        el('div', { style: { display: 'grid', gap: 6 } },
                            a.risks.map(function (r, i) {
                                var lc = riskColor(r.likelihood);
                                var ic = riskColor(r.impact);
                                return el('div', { key: i, style: { display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 8, padding: '8px 14px', background: a.sectionBg, borderRadius: 8, alignItems: 'center', borderLeft: '3px solid ' + lc.dot } },
                                    el('span', { style: { color: a.bodyTextColor } }, r.risk),
                                    el('span', { style: { background: lc.bg, color: lc.color, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700, textAlign: 'center' } }, 'L: ' + r.likelihood),
                                    el('span', { style: { background: ic.bg, color: ic.color, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700, textAlign: 'center' } }, 'I: ' + r.impact)
                                );
                            })
                        )
                    ),
                    // Notes
                    a.showNotes && a.notes && el('div', null,
                        sectionHead('Additional Notes', a),
                        el('p', { style: { margin: 0, color: a.bodyTextColor, fontStyle: 'italic' } }, a.notes)
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Project Info
                    el(PanelBody, { title: 'Project Info', initialOpen: true },
                        el(TextControl, { label: 'Project Name', value: a.projectName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ projectName: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Project Type', value: a.projectType, __nextHasNoMarginBottom: true, onChange: function (v) { set({ projectType: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Status', value: a.status, options: statusOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ status: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Client', value: a.client, __nextHasNoMarginBottom: true, onChange: function (v) { set({ client: v }); } }),
                            el(TextControl, { label: 'Owner', value: a.owner, __nextHasNoMarginBottom: true, onChange: function (v) { set({ owner: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Dates', checked: a.showDates, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDates: v }); } })
                        ),
                        a.showDates && el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Start Date', value: a.startDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ startDate: v }); } }),
                            el(TextControl, { label: 'End Date', value: a.endDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ endDate: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Budget', checked: a.showBudget, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBudget: v }); } })
                        ),
                        a.showBudget && el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Budget', value: a.budget, __nextHasNoMarginBottom: true, onChange: function (v) { set({ budget: v }); } })
                        )
                    ),
                    // Overview
                    el(PanelBody, { title: 'Overview', initialOpen: false },
                        el(TextareaControl, { label: 'Project Overview', value: a.overview, rows: 5, __nextHasNoMarginBottom: true, onChange: function (v) { set({ overview: v }); } })
                    ),
                    // Goals
                    el(PanelBody, { title: 'Goals', initialOpen: false },
                        a.goals.map(function (g, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                el(TextControl, { label: '', value: g, __nextHasNoMarginBottom: true, onChange: function (v) { set({ goals: a.goals.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ goals: a.goals.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ goals: a.goals.concat(['New goal']) }); } }, '+ Add Goal')
                    ),
                    // Deliverables
                    el(PanelBody, { title: 'Deliverables', initialOpen: false },
                        a.deliverables.map(function (d, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                el(TextControl, { label: '', value: d, __nextHasNoMarginBottom: true, onChange: function (v) { set({ deliverables: a.deliverables.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ deliverables: a.deliverables.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ deliverables: a.deliverables.concat(['New deliverable']) }); } }, '+ Add Deliverable')
                    ),
                    // Stakeholders
                    el(PanelBody, { title: 'Stakeholders', initialOpen: false },
                        a.stakeholders.map(function (s, i) {
                            return el('div', { key: i, style: { padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc', marginBottom: 8 } },
                                el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ stakeholders: a.stakeholders.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                ),
                                el(TextControl, { label: 'Name', value: s.name, __nextHasNoMarginBottom: true, onChange: function (v) { set({ stakeholders: upd(a.stakeholders, i, 'name', v) }); } }),
                                el('div', { style: { marginTop: 8 } },
                                    el(TextControl, { label: 'Role', value: s.role, __nextHasNoMarginBottom: true, onChange: function (v) { set({ stakeholders: upd(a.stakeholders, i, 'role', v) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ stakeholders: a.stakeholders.concat([{ name: 'Name', role: 'Role' }]) }); } }, '+ Add Stakeholder')
                    ),
                    // Risks
                    el(PanelBody, { title: 'Risks', initialOpen: false },
                        a.risks.map(function (r, i) {
                            return el('div', { key: i, style: { padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc', marginBottom: 8 } },
                                el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ risks: a.risks.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                ),
                                el(TextareaControl, { label: 'Risk', value: r.risk, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ risks: upd(a.risks, i, 'risk', v) }); } }),
                                el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                                    el(SelectControl, { label: 'Likelihood', value: r.likelihood, options: levelOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ risks: upd(a.risks, i, 'likelihood', v) }); } }),
                                    el(SelectControl, { label: 'Impact', value: r.impact, options: levelOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ risks: upd(a.risks, i, 'impact', v) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ risks: a.risks.concat([{ risk: 'New risk', likelihood: 'low', impact: 'medium' }]) }); } }, '+ Add Risk')
                    ),
                    // Notes
                    el(PanelBody, { title: 'Additional Notes', initialOpen: false },
                        el(ToggleControl, { label: 'Show Notes', checked: a.showNotes, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNotes: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Notes', value: a.notes, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ notes: v }); } })
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        TC && el(TC, { label: 'Title', value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                        TC && el(TC, { label: 'Body Text', value: a.bodyTypo || {}, onChange: function (v) { set({ bodyTypo: v }); } })
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    // Colors
                    el(PanelColorSettings, {
                        title: 'Header Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header BG',    value: a.headerBg,    onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',  value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Meta Text',    value: a.metaColor,   onChange: function (v) { set({ metaColor: v || '#94a3b8' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Body Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Block BG',        value: a.bgColor,          onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',          value: a.borderColor,      onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Section BG',      value: a.sectionBg,        onChange: function (v) { set({ sectionBg: v || '#f8fafc' }); } },
                            { label: 'Section Heading', value: a.sectionTitleColor,onChange: function (v) { set({ sectionTitleColor: v || '#111827' }); } },
                            { label: 'Body Text',       value: a.bodyTextColor,    onChange: function (v) { set({ bodyTextColor: v || '#374151' }); } },
                            { label: 'Accent',          value: a.accentColor,      onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } },
                            { label: 'Goal Check',      value: a.goalDotColor,     onChange: function (v) { set({ goalDotColor: v || '#3b82f6' }); } },
                            { label: 'Deliverable →',   value: a.delivDotColor,    onChange: function (v) { set({ delivDotColor: v || '#10b981' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-project-brief-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
