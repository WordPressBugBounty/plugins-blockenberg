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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── helpers ────────────────────────────────────────────────────
    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    var statusOptions = [
        { label: '🔵 Open', value: 'open' },
        { label: '🟡 In Progress', value: 'in-progress' },
        { label: '✅ Done', value: 'done' }
    ];

    function statusStyle(status, o) {
        if (status === 'in-progress') return { bg: o.taskInProgressBg, color: o.taskInProgressColor };
        if (status === 'done')        return { bg: o.taskDoneBg,        color: o.taskDoneColor };
        return                               { bg: o.taskOpenBg,        color: o.taskOpenColor };
    }

    registerBlockType('blockenberg/meeting-recap', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var blockProps = (function(p){
                var v = getTypoCssVars() || function () { return {}; };
                p.style = Object.assign(p.style||{},
                    v(a.titleTypo,'--bkbg-mr-tt-'),
                    v(a.bodyTypo,'--bkbg-mr-bd-'),
                    v(a.sectionLabelTypo,'--bkbg-mr-sl-')
                ); return p;
            })(useBlockProps({ className: 'bkbg-mr-editor-wrap' }));

            // shared section header style
            function sectionHead(label) {
                return el('div', { className: 'bkbg-mr-section-head', style: { color: a.accentColor, borderBottomColor: a.accentColor } }, label);
            }

            return el(Fragment, null,
                el('div', blockProps,
                    // ── Header ─────────────────────────────────────
                    el('div', { className: 'bkbg-mr-header', style: { background: a.headerBg, color: a.headerColor, borderRadius: (a.borderRadius || 10) + 'px ' + (a.borderRadius || 10) + 'px 0 0', padding: '20px 24px' } },
                        el('div', { className: 'bkbg-mr-kicker', style: { marginBottom: 4 } }, '📋 MEETING RECAP'),
                        el('h2', { className: 'bkbg-mr-title', style: { color: a.headerColor } }, a.meetingTitle),
                        a.showMeta && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, opacity: .85 } },
                            a.meetingDate && el('span', null, '📅 ' + a.meetingDate),
                            a.meetingTime && el('span', null, '⏰ ' + a.meetingTime),
                            a.location    && el('span', null, '📍 ' + a.location),
                            a.facilitator && el('span', null, '👤 ' + a.facilitator)
                        )
                    ),
                    // ── Body ───────────────────────────────────────
                    el('div', { className: 'bkbg-mr-body', style: { background: a.bgColor, border: '1px solid ' + a.borderColor, borderTop: 'none', borderRadius: '0 0 ' + (a.borderRadius || 10) + 'px ' + (a.borderRadius || 10) + 'px', padding: '20px 24px', color: a.textColor } },
                        // Attendees
                        a.showAttendees && el('div', { style: { marginBottom: 20 } },
                            sectionHead(a.attendeesLabel || 'Attendees'),
                            el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
                                a.attendees.map(function (att, i) {
                                    return el('div', { key: i, style: { background: att.present ? a.attendeePresentBg : a.attendeeAbsentBg, color: att.present ? a.attendeePresentColor : a.attendeeAbsentColor, padding: '4px 12px', borderRadius: 100, fontSize: 13 } },
                                        el('strong', null, att.name),
                                        att.role ? el('span', { style: { opacity: .75, fontSize: 12 } }, ' · ' + att.role) : null,
                                        !att.present ? el('span', { style: { fontSize: 11, marginLeft: 4 } }, '(absent)') : null
                                    );
                                })
                            )
                        ),
                        // Agenda
                        a.showAgenda && el('div', { style: { marginBottom: 20 } },
                            sectionHead(a.agendaLabel || 'Agenda'),
                            el('ol', { style: { margin: 0, paddingLeft: 20 } },
                                a.agendaItems.map(function (ag, i) {
                                    return el('li', { key: i, style: { marginBottom: 6 } },
                                        ag.item,
                                        ag.duration && el('span', { style: { marginLeft: 8, fontSize: 12, opacity: .6 } }, '— ' + ag.duration)
                                    );
                                })
                            )
                        ),
                        // Decisions
                        a.showDecisions && el('div', { style: { marginBottom: 20 } },
                            sectionHead(a.decisionsLabel || 'Decisions Made'),
                            el('ul', { style: { margin: 0, paddingLeft: 0, listStyle: 'none' } },
                                a.decisions.map(function (d, i) {
                                    return el('li', { key: i, style: { display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 } },
                                        el('span', { style: { color: a.decisionIconColor, fontWeight: 700, marginTop: 1, flexShrink: 0 } }, '✓'),
                                        el('span', null, d)
                                    );
                                })
                            )
                        ),
                        // Action Items
                        a.showActionItems && el('div', { style: { marginBottom: 20 } },
                            sectionHead(a.actionItemsLabel || 'Action Items'),
                            el('div', null,
                                a.actionItems.map(function (ai, i) {
                                    var ss = statusStyle(ai.status, a);
                                    return el('div', { key: i, style: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, borderLeft: '3px solid ' + a.accentColor } },
                                        el('span', { style: { background: ss.bg, color: ss.color, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' } }, ai.status === 'in-progress' ? 'In Progress' : ai.status === 'done' ? 'Done' : 'Open'),
                                        el('span', { style: { flex: 1 } }, ai.task),
                                        ai.owner && el('span', { style: { fontSize: 12, opacity: .7, whiteSpace: 'nowrap' } }, ai.owner),
                                        ai.due && el('span', { style: { fontSize: 12, opacity: .7, whiteSpace: 'nowrap' } }, '📅 ' + ai.due)
                                    );
                                })
                            )
                        ),
                        // Next Meeting
                        a.showNextMeeting && a.nextMeetingDate && el('div', { style: { marginBottom: 20, background: a.nextMeetingBg, color: a.nextMeetingColor, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 } },
                            el('span', { style: { fontWeight: 700, fontSize: a.nextMeetingLabelSize || 13 } }, a.nextMeetingLabel || 'Next Meeting:'),
                            el('span', null, '📅 ' + a.nextMeetingDate)
                        ),
                        // Notes
                        a.showNotes && a.notes && el('div', null,
                            sectionHead(a.notesLabel || 'Additional Notes'),
                            el('p', { className: 'bkbg-mr-notes-text', style: { margin: 0 } }, a.notes)
                        )
                    )
                ),
                // ── Inspector ──────────────────────────────────────
                el(InspectorControls, null,
                    // Meeting Info
                    el(PanelBody, { title: 'Meeting Details', initialOpen: true },
                        el(TextControl, { label: 'Meeting Title', value: a.meetingTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ meetingTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Date', value: a.meetingDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ meetingDate: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Time', value: a.meetingTime, __nextHasNoMarginBottom: true, onChange: function (v) { set({ meetingTime: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Location / Platform', value: a.location, __nextHasNoMarginBottom: true, onChange: function (v) { set({ location: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Facilitator', value: a.facilitator, __nextHasNoMarginBottom: true, onChange: function (v) { set({ facilitator: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Meta Row', checked: a.showMeta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMeta: v }); } })
                        )
                    ),
                    // Attendees
                    el(PanelBody, { title: 'Attendees (' + a.attendees.length + ')', initialOpen: false },
                        el(ToggleControl, { label: 'Show Attendees', checked: a.showAttendees, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showAttendees: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.attendeesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ attendeesLabel: v }); } })
                        ),
                        a.attendees.map(function (att, i) {
                            return el('div', { key: i, style: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' } },
                                el(TextControl, { label: 'Name', value: att.name, __nextHasNoMarginBottom: true, onChange: function (v) { set({ attendees: upd(a.attendees, i, 'name', v) }); } }),
                                el('div', { style: { marginTop: 4 } },
                                    el(TextControl, { label: 'Role', value: att.role, __nextHasNoMarginBottom: true, onChange: function (v) { set({ attendees: upd(a.attendees, i, 'role', v) }); } })
                                ),
                                el('div', { style: { marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                    el(ToggleControl, { label: 'Present', checked: att.present, __nextHasNoMarginBottom: true, onChange: function (v) { set({ attendees: upd(a.attendees, i, 'present', v) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ attendees: a.attendees.filter(function (_, j) { return j !== i; }) }); } }, '✕ Remove')
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 10 }, onClick: function () { set({ attendees: a.attendees.concat([{ name: 'New Attendee', role: '', present: true }]) }); } }, '+ Add Attendee')
                    ),
                    // Agenda
                    el(PanelBody, { title: 'Agenda', initialOpen: false },
                        el(ToggleControl, { label: 'Show Agenda', checked: a.showAgenda, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showAgenda: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.agendaLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ agendaLabel: v }); } })
                        ),
                        a.agendaItems.map(function (ag, i) {
                            return el('div', { key: i, style: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' } },
                                el(TextControl, { label: 'Agenda Item ' + (i + 1), value: ag.item, __nextHasNoMarginBottom: true, onChange: function (v) { set({ agendaItems: upd(a.agendaItems, i, 'item', v) }); } }),
                                el('div', { style: { marginTop: 4 } },
                                    el(TextControl, { label: 'Duration', value: ag.duration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ agendaItems: upd(a.agendaItems, i, 'duration', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11, marginTop: 4 }, onClick: function () { set({ agendaItems: a.agendaItems.filter(function (_, j) { return j !== i; }) }); } }, '✕ Remove')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 10 }, onClick: function () { set({ agendaItems: a.agendaItems.concat([{ item: 'New agenda item', duration: '' }]) }); } }, '+ Add Item')
                    ),
                    // Decisions
                    el(PanelBody, { title: 'Decisions', initialOpen: false },
                        el(ToggleControl, { label: 'Show Decisions', checked: a.showDecisions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDecisions: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.decisionsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ decisionsLabel: v }); } })
                        ),
                        a.decisions.map(function (d, i) {
                            return el('div', { key: i, style: { marginTop: 8, display: 'flex', gap: 4, alignItems: 'flex-start' } },
                                el('div', { style: { flex: 1 } },
                                    el(TextareaControl, { value: d, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ decisions: a.decisions.map(function (x, j) { return j === i ? v : x; }) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11, paddingTop: 4 }, onClick: function () { set({ decisions: a.decisions.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ decisions: a.decisions.concat(['New decision made.']) }); } }, '+ Add Decision')
                    ),
                    // Action Items
                    el(PanelBody, { title: 'Action Items (' + a.actionItems.length + ')', initialOpen: false },
                        el(ToggleControl, { label: 'Show Action Items', checked: a.showActionItems, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showActionItems: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.actionItemsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItemsLabel: v }); } })
                        ),
                        a.actionItems.map(function (ai, i) {
                            return el('div', { key: i, style: { marginTop: 10, paddingTop: 10, borderTop: '1px solid #e5e7eb' } },
                                el(TextareaControl, { label: 'Task ' + (i + 1), value: ai.task, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItems: upd(a.actionItems, i, 'task', v) }); } }),
                                el('div', { style: { marginTop: 4 } },
                                    el(TextControl, { label: 'Owner', value: ai.owner, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItems: upd(a.actionItems, i, 'owner', v) }); } })
                                ),
                                el('div', { style: { marginTop: 4 } },
                                    el(TextControl, { label: 'Due Date', value: ai.due, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItems: upd(a.actionItems, i, 'due', v) }); } })
                                ),
                                el('div', { style: { marginTop: 4 } },
                                    el(SelectControl, { label: 'Status', value: ai.status, options: statusOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItems: upd(a.actionItems, i, 'status', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11, marginTop: 4 }, onClick: function () { set({ actionItems: a.actionItems.filter(function (_, j) { return j !== i; }) }); } }, '✕ Remove')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 10 }, onClick: function () { set({ actionItems: a.actionItems.concat([{ task: 'New action item', owner: '', due: '', status: 'open' }]) }); } }, '+ Add Action Item')
                    ),
                    // Next Meeting & Notes
                    el(PanelBody, { title: 'Next Meeting & Notes', initialOpen: false },
                        el(ToggleControl, { label: 'Show Next Meeting', checked: a.showNextMeeting, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNextMeeting: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Next Meeting Label', value: a.nextMeetingLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextMeetingLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Next Meeting Date & Time', value: a.nextMeetingDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextMeetingDate: v }); } })
                        ),
                        el('div', { style: { marginTop: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12 } },
                            el(ToggleControl, { label: 'Show Additional Notes', checked: a.showNotes, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNotes: v }); } }),
                            el('div', { style: { marginTop: 8 } },
                                el(TextControl, { label: 'Notes Label', value: a.notesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ notesLabel: v }); } })
                            ),
                            el('div', { style: { marginTop: 8 } },
                                el(TextareaControl, { label: 'Notes', value: a.notes, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ notes: v }); } })
                            )
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: 'Title', value: a.titleTypo || {}, onChange: function(v){ set({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Body Text', value: a.bodyTypo || {}, onChange: function(v){ set({ bodyTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Section Label', value: a.sectionLabelTypo || {}, onChange: function(v){ set({ sectionLabelTypo: v }); } })
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    // Colors
                    el(PanelColorSettings, {
                        title: 'Header Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header Background', value: a.headerBg,    onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',       value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Accent',            value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Body Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Background',       value: a.bgColor,           onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Text',             value: a.textColor,         onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Section Labels',   value: a.sectionLabelColor, onChange: function (v) { set({ sectionLabelColor: v || '#0f172a' }); } },
                            { label: 'Borders',          value: a.sectionBorderColor,onChange: function (v) { set({ sectionBorderColor: v || '#e5e7eb' }); } },
                            { label: 'Block Border',     value: a.borderColor,       onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Attendee & Status Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Present Background',  value: a.attendeePresentBg,    onChange: function (v) { set({ attendeePresentBg:    v || '#dcfce7' }); } },
                            { label: 'Present Text',        value: a.attendeePresentColor, onChange: function (v) { set({ attendeePresentColor: v || '#14532d' }); } },
                            { label: 'Absent Background',   value: a.attendeeAbsentBg,     onChange: function (v) { set({ attendeeAbsentBg:     v || '#f1f5f9' }); } },
                            { label: 'Absent Text',         value: a.attendeeAbsentColor,  onChange: function (v) { set({ attendeeAbsentColor:  v || '#64748b' }); } },
                            { label: 'Decision Icon',       value: a.decisionIconColor,    onChange: function (v) { set({ decisionIconColor:    v || '#16a34a' }); } },
                            { label: 'Open BG',             value: a.taskOpenBg,           onChange: function (v) { set({ taskOpenBg:           v || '#eff6ff' }); } },
                            { label: 'Open Text',           value: a.taskOpenColor,        onChange: function (v) { set({ taskOpenColor:        v || '#1d4ed8' }); } },
                            { label: 'In Progress BG',      value: a.taskInProgressBg,     onChange: function (v) { set({ taskInProgressBg:     v || '#fef9c3' }); } },
                            { label: 'In Progress Text',    value: a.taskInProgressColor,  onChange: function (v) { set({ taskInProgressColor:  v || '#854d0e' }); } },
                            { label: 'Done BG',             value: a.taskDoneBg,           onChange: function (v) { set({ taskDoneBg:           v || '#dcfce7' }); } },
                            { label: 'Done Text',           value: a.taskDoneColor,        onChange: function (v) { set({ taskDoneColor:        v || '#14532d' }); } },
                            { label: 'Next Meeting BG',     value: a.nextMeetingBg,        onChange: function (v) { set({ nextMeetingBg:        v || '#f0f9ff' }); } },
                            { label: 'Next Meeting Text',   value: a.nextMeetingColor,     onChange: function (v) { set({ nextMeetingColor:     v || '#0369a1' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            var v = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
            var s = Object.assign({},
                v(a.titleTypo,'--bkbg-mr-tt-'),
                v(a.bodyTypo,'--bkbg-mr-bd-'),
                v(a.sectionLabelTypo,'--bkbg-mr-sl-')
            );
            return wp.element.createElement('div', (function(p){p.style=Object.assign(p.style||{},s);return p;})(useBlockProps.save()),
                wp.element.createElement('div', {
                    className: 'bkbg-meeting-recap-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
