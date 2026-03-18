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

    var overallStatusOptions = [
        { label: '✅ All Systems Operational', value: 'operational' },
        { label: '⚠️ Partial Outage',          value: 'partial'     },
        { label: '🔴 Major Outage',            value: 'major'       },
        { label: '🔧 Under Maintenance',       value: 'maintenance' }
    ];
    var componentStatusOptions = [
        { label: '✅ Operational',  value: 'operational'  },
        { label: '⚠️ Degraded',    value: 'degraded'     },
        { label: '🔴 Outage',      value: 'outage'       },
        { label: '🔧 Maintenance', value: 'maintenance'  }
    ];
    var severityOptions = [
        { label: '🔴 Major',  value: 'major'  },
        { label: '🟡 Minor',  value: 'minor'  },
        { label: 'ℹ️ Notice', value: 'notice' }
    ];
    var updateStatusOptions = [
        { label: 'Investigating', value: 'investigating' },
        { label: 'Identified',    value: 'identified'   },
        { label: 'Monitoring',    value: 'monitoring'   },
        { label: 'Resolved',      value: 'resolved'     }
    ];

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function statusInfo(s, a) {
        var map = {
            operational:  { label: 'Operational',  bg: a.operationalBg,  color: a.operationalColor,  dot: '#16a34a' },
            degraded:     { label: 'Degraded',      bg: a.degradedBg,     color: a.degradedColor,     dot: '#d97706' },
            outage:       { label: 'Outage',        bg: a.outageBg,       color: a.outageColor,       dot: '#dc2626' },
            maintenance:  { label: 'Maintenance',   bg: a.maintenanceBg,  color: a.maintenanceColor,  dot: '#6366f1' }
        };
        return map[s] || map.operational;
    }

    function overallBanner(s) {
        if (s === 'operational') return { text: '✅ All Systems Operational', bg: '#14532d', color: '#dcfce7' };
        if (s === 'partial')     return { text: '⚠️ Partial Service Disruption', bg: '#78350f', color: '#fef9c3' };
        if (s === 'major')       return { text: '🔴 Major Outage in Progress', bg: '#991b1b', color: '#fee2e2' };
        return                          { text: '🔧 Scheduled Maintenance', bg: '#3730a3', color: '#e0e7ff' };
    }

    function updateDotColor(status, a) {
        if (status === 'investigating') return a.updateDotInvestigating;
        if (status === 'identified')    return a.updateDotIdentified;
        if (status === 'monitoring')    return a.updateDotMonitoring;
        return a.updateDotResolved;
    }

    function incidentBorderColor(severity, a) {
        if (severity === 'major')  return a.incidentBorderMajor;
        if (severity === 'minor')  return a.incidentBorderMinor;
        return a.incidentBorderNotice;
    }

    registerBlockType('blockenberg/status-page', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var tv = getTypoCssVars();
            var lh = (a.lineHeight / 100).toFixed(2);
            var blockProps = useBlockProps({ className: 'bkbg-sp-editor-wrap', style: (function () {
                var s = {
                    '--bksp-tt-sz': a.titleFontSize + 'px',
                    '--bksp-bd-sz': a.fontSize + 'px',
                    '--bksp-bd-lh': lh,
                    '--bksp-bd-wt': a.fontWeight
                };
                Object.assign(s, tv(a.titleTypo, '--bksp-tt-'));
                Object.assign(s, tv(a.bodyTypo, '--bksp-bd-'));
                Object.assign(s, tv(a.sectionHeadTypo, '--bksp-sh-'));
                Object.assign(s, tv(a.componentNameTypo, '--bksp-cn-'));
                Object.assign(s, tv(a.incidentTitleTypo, '--bksp-it-'));
                return s;
            }()) });
            var ob = overallBanner(a.overallStatus);

            var preview = el('div', { className: 'bkbg-sp-wrap', style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { className: 'bkbg-sp-header', style: { background: a.headerBg, padding: '24px 28px' } },
                    el('h2', { className: 'bkbg-sp-title', style: { margin: '0 0 6px', color: a.headerColor } }, a.pageTitle),
                    a.showLastUpdated && el('div', { style: { fontSize: 11, color: a.metaColor } }, 'Last updated: ' + a.lastUpdated)
                ),
                // Overall status banner
                el('div', { style: { background: ob.bg, color: ob.color, padding: '12px 28px', fontWeight: 700, fontSize: 14 } }, ob.text),
                // Components
                el('div', { style: { padding: '20px 28px' } },
                    el('h3', { style: { margin: '0 0 14px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: a.sectionHeadColor } }, a.componentsLabel),
                    el('div', { style: { border: '1px solid ' + a.borderColor, borderRadius: 8, overflow: 'hidden' } },
                        a.components.map(function (comp, i) {
                            var si = statusInfo(comp.status, a);
                            return el('div', { key: i, style: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '11px 16px', borderBottom: i < a.components.length - 1 ? '1px solid ' + a.borderColor : 'none', gap: 12 } },
                                el('div', null,
                                    el('div', { style: { fontWeight: 600, fontSize: a.fontSize + 'px', color: a.componentNameColor } }, comp.name),
                                    a.showDescription && comp.description && el('div', { style: { fontSize: 11, color: a.componentDescColor, marginTop: 2 } }, comp.description)
                                ),
                                el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 } },
                                    a.showUptime && el('span', { style: { fontSize: 11, color: a.uptimeColor, fontVariantNumeric: 'tabular-nums' } }, comp.uptime + '%'),
                                    el('span', { style: { background: si.bg, color: si.color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 } },
                                        el('span', { style: { width: 7, height: 7, borderRadius: '50%', background: si.dot, display: 'inline-block', flexShrink: 0 } }),
                                        si.label
                                    )
                                )
                            );
                        })
                    )
                ),
                // Incidents
                a.showIncidents && a.incidents.length > 0 && el('div', { style: { padding: '0 28px 24px' } },
                    el('h3', { style: { margin: '0 0 14px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: a.sectionHeadColor } }, a.incidentsLabel),
                    el('div', { style: { display: 'grid', gap: 12 } },
                        a.incidents.map(function (inc, i) {
                            var borderC = incidentBorderColor(inc.severity, a);
                            return el('div', { key: i, style: { border: '1px solid ' + a.borderColor, borderLeft: '4px solid ' + borderC, borderRadius: 8, padding: '14px 16px', background: '#fafafa' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 } },
                                    el('strong', { style: { fontSize: a.fontSize + 'px', color: a.componentNameColor } }, inc.title),
                                    el('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                                        el('span', { style: { fontSize: 11, color: a.componentDescColor } }, inc.date),
                                        el('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: borderC + '22', color: borderC } }, inc.severity.toUpperCase())
                                    )
                                ),
                                el('div', { style: { display: 'grid', gap: 8 } },
                                    (inc.updates || []).map(function (u, j) {
                                        var dotColor = updateDotColor(u.status, a);
                                        return el('div', { key: j, style: { display: 'grid', gridTemplateColumns: '12px 60px 1fr', gap: 8, alignItems: 'flex-start' } },
                                            el('div', { style: { width: 10, height: 10, borderRadius: '50%', background: dotColor, marginTop: 3, flexShrink: 0 } }),
                                            el('span', { style: { fontSize: 11, color: a.componentDescColor, fontVariantNumeric: 'tabular-nums', flexShrink: 0 } }, u.time),
                                            el('span', { style: { fontSize: (a.fontSize - 1) + 'px', color: a.componentNameColor, lineHeight: lh } }, u.message)
                                        );
                                    })
                                )
                            );
                        })
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Page Info
                    el(PanelBody, { title: 'Page Info', initialOpen: true },
                        el(TextControl, { label: 'Page Title', value: a.pageTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ pageTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Overall Status', value: a.overallStatus, options: overallStatusOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ overallStatus: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show "Last Updated"', checked: a.showLastUpdated, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLastUpdated: v }); } })
                        ),
                        a.showLastUpdated && el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Last Updated Text', value: a.lastUpdated, __nextHasNoMarginBottom: true, onChange: function (v) { set({ lastUpdated: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Components Heading', value: a.componentsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ componentsLabel: v }); } })
                        )
                    ),
                    // Components
                    el(PanelBody, { title: 'Components', initialOpen: false },
                        el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 } },
                            el(ToggleControl, { label: 'Show Uptime %', checked: a.showUptime, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showUptime: v }); } }),
                            el(ToggleControl, { label: 'Show Descriptions', checked: a.showDescription, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDescription: v }); } })
                        ),
                        a.components.map(function (comp, i) {
                            return el('div', { key: i, style: { marginBottom: 10, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' } },
                                    el('strong', { style: { fontSize: 11 } }, 'Component ' + (i + 1)),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ components: a.components.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                ),
                                el(TextControl, { label: 'Name', value: comp.name, __nextHasNoMarginBottom: true, onChange: function (v) { set({ components: upd(a.components, i, 'name', v) }); } }),
                                el('div', { style: { marginTop: 8 } },
                                    el(TextControl, { label: 'Description', value: comp.description, __nextHasNoMarginBottom: true, onChange: function (v) { set({ components: upd(a.components, i, 'description', v) }); } })
                                ),
                                el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, alignItems: 'flex-end' } },
                                    el(SelectControl, { label: 'Status', value: comp.status, options: componentStatusOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ components: upd(a.components, i, 'status', v) }); } }),
                                    el(TextControl, { label: 'Uptime %', value: String(comp.uptime), type: 'number', __nextHasNoMarginBottom: true, onChange: function (v) { set({ components: upd(a.components, i, 'uptime', parseFloat(v) || 0) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () {
                            set({ components: a.components.concat([{ name: 'New Service', status: 'operational', uptime: 99.9, description: '' }]) });
                        } }, '+ Add Component')
                    ),
                    // Incidents
                    el(PanelBody, { title: 'Incidents', initialOpen: false },
                        el(ToggleControl, { label: 'Show Incidents Section', checked: a.showIncidents, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIncidents: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Incidents Heading', value: a.incidentsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ incidentsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 10 } },
                            a.incidents.map(function (inc, i) {
                                return el('div', { key: i, style: { marginBottom: 12, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' } },
                                        el('strong', { style: { fontSize: 11 } }, 'Incident ' + (i + 1)),
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ incidents: a.incidents.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextControl, { label: 'Title', value: inc.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ incidents: upd(a.incidents, i, 'title', v) }); } }),
                                    el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                                        el(SelectControl, { label: 'Severity', value: inc.severity, options: severityOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ incidents: upd(a.incidents, i, 'severity', v) }); } }),
                                        el(TextControl, { label: 'Date', value: inc.date, __nextHasNoMarginBottom: true, onChange: function (v) { set({ incidents: upd(a.incidents, i, 'date', v) }); } })
                                    ),
                                    el('div', { style: { marginTop: 8 } },
                                        el('label', { style: { fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 } }, 'Updates'),
                                        (inc.updates || []).map(function (u, j) {
                                            return el('div', { key: j, style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 8px', marginBottom: 6 } },
                                                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 4 } },
                                                    el(TextControl, { label: 'Time (UTC)', value: u.time, __nextHasNoMarginBottom: true, onChange: function (v) {
                                                        var newUpd = (inc.updates || []).map(function (x, k) { return k === j ? Object.assign({}, x, { time: v }) : x; });
                                                        set({ incidents: upd(a.incidents, i, 'updates', newUpd) });
                                                    } }),
                                                    el(SelectControl, { label: 'Status', value: u.status, options: updateStatusOptions, __nextHasNoMarginBottom: true, onChange: function (v) {
                                                        var newUpd = (inc.updates || []).map(function (x, k) { return k === j ? Object.assign({}, x, { status: v }) : x; });
                                                        set({ incidents: upd(a.incidents, i, 'updates', newUpd) });
                                                    } })
                                                ),
                                                el(TextareaControl, { label: 'Message', value: u.message, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) {
                                                    var newUpd = (inc.updates || []).map(function (x, k) { return k === j ? Object.assign({}, x, { message: v }) : x; });
                                                    set({ incidents: upd(a.incidents, i, 'updates', newUpd) });
                                                } })
                                            );
                                        }),
                                        el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () {
                                            var newUpd = (inc.updates || []).concat([{ time: '00:00 UTC', status: 'investigating', message: 'Update message.' }]);
                                            set({ incidents: upd(a.incidents, i, 'updates', newUpd) });
                                        } }, '+ Add Update')
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () {
                                set({ incidents: a.incidents.concat([{ title: 'New Incident', severity: 'minor', date: '', updates: [] }]) });
                            } }, '+ Add Incident')
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl()({ label: __('Body', 'blockenberg'), value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } }),
                        getTypoControl()({ label: __('Section Heading', 'blockenberg'), value: a.sectionHeadTypo, onChange: function (v) { set({ sectionHeadTypo: v }); } }),
                        getTypoControl()({ label: __('Component Name', 'blockenberg'), value: a.componentNameTypo, onChange: function (v) { set({ componentNameTypo: v }); } }),
                        getTypoControl()({ label: __('Incident Title', 'blockenberg'), value: a.incidentTitleTypo, onChange: function (v) { set({ incidentTitleTypo: v }); } })
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    // Colors
                    el(PanelColorSettings, {
                        title: 'Header & Layout',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Block BG',       value: a.bgColor,           onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',         value: a.borderColor,       onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Header BG',      value: a.headerBg,          onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',    value: a.headerColor,       onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Meta Text',      value: a.metaColor,         onChange: function (v) { set({ metaColor: v || '#94a3b8' }); } },
                            { label: 'Section Head',   value: a.sectionHeadColor,  onChange: function (v) { set({ sectionHeadColor: v || '#111827' }); } },
                            { label: 'Component Name', value: a.componentNameColor,onChange: function (v) { set({ componentNameColor: v || '#1f2937' }); } },
                            { label: 'Component Desc', value: a.componentDescColor,onChange: function (v) { set({ componentDescColor: v || '#6b7280' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Status Badge Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Operational BG',   value: a.operationalBg,   onChange: function (v) { set({ operationalBg: v || '#dcfce7' }); } },
                            { label: 'Operational Text', value: a.operationalColor, onChange: function (v) { set({ operationalColor: v || '#14532d' }); } },
                            { label: 'Degraded BG',      value: a.degradedBg,      onChange: function (v) { set({ degradedBg: v || '#fef9c3' }); } },
                            { label: 'Degraded Text',    value: a.degradedColor,   onChange: function (v) { set({ degradedColor: v || '#713f12' }); } },
                            { label: 'Outage BG',        value: a.outageBg,        onChange: function (v) { set({ outageBg: v || '#fee2e2' }); } },
                            { label: 'Outage Text',      value: a.outageColor,     onChange: function (v) { set({ outageColor: v || '#991b1b' }); } },
                            { label: 'Maintenance BG',   value: a.maintenanceBg,   onChange: function (v) { set({ maintenanceBg: v || '#e0e7ff' }); } },
                            { label: 'Maintenance Text', value: a.maintenanceColor,onChange: function (v) { set({ maintenanceColor: v || '#3730a3' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Incident & Update Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Major Border',       value: a.incidentBorderMajor,    onChange: function (v) { set({ incidentBorderMajor: v || '#ef4444' }); } },
                            { label: 'Minor Border',       value: a.incidentBorderMinor,    onChange: function (v) { set({ incidentBorderMinor: v || '#f59e0b' }); } },
                            { label: 'Notice Border',      value: a.incidentBorderNotice,   onChange: function (v) { set({ incidentBorderNotice: v || '#3b82f6' }); } },
                            { label: 'Dot: Investigating', value: a.updateDotInvestigating, onChange: function (v) { set({ updateDotInvestigating: v || '#f59e0b' }); } },
                            { label: 'Dot: Identified',    value: a.updateDotIdentified,    onChange: function (v) { set({ updateDotIdentified: v || '#ef4444' }); } },
                            { label: 'Dot: Monitoring',    value: a.updateDotMonitoring,    onChange: function (v) { set({ updateDotMonitoring: v || '#3b82f6' }); } },
                            { label: 'Dot: Resolved',      value: a.updateDotResolved,      onChange: function (v) { set({ updateDotResolved: v || '#22c55e' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-status-page-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
