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
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var moodOptions = [
        { label: '🚀 Great',  value: 'great' },
        { label: '😊 Good',   value: 'good'  },
        { label: '😐 Okay',   value: 'okay'  },
        { label: '😓 Tough',  value: 'tough' }
    ];
    var moodEmoji = { great: '🚀', good: '😊', okay: '😐', tough: '😓' };
    var moodLabel = { great: 'Great', good: 'Good', okay: 'Okay', tough: 'Tough' };
    var moodStyle = {
        great: { bg: '#dcfce7', color: '#14532d' },
        good:  { bg: '#dbeafe', color: '#1e40af' },
        okay:  { bg: '#fef9c3', color: '#713f12' },
        tough: { bg: '#fee2e2', color: '#991b1b' }
    };
    var priorityOptions = [
        { label: '🔴 High',   value: 'high'   },
        { label: '🟡 Medium', value: 'medium' },
        { label: '🟢 Low',    value: 'low'    }
    ];

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function prioBadge(p, a) {
        if (p === 'high')   return { label: '🔴 High',   bg: a.highBg,   color: a.highColor };
        if (p === 'medium') return { label: '🟡 Med',     bg: a.medBg,    color: a.medColor  };
        return                     { label: '🟢 Low',    bg: a.lowBg,    color: a.lowColor  };
    }

    function colHead(label, bg, border) {
        return el('div', { style: { padding: '10px 14px', background: bg, borderBottom: '3px solid ' + border, fontWeight: 700, fontSize: 13, borderRadius: '8px 8px 0 0' } }, label);
    }

    registerBlockType('blockenberg/sprint-retrospective', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {
                    '--bkspr-tt-sz': a.titleFontSize + 'px',
                    '--bkspr-bd-sz': a.fontSize + 'px',
                    '--bkspr-bd-w': String(a.fontWeight || '400'),
                    '--bkspr-bd-lh': lh
                };
                Object.assign(s, tv(a.titleTypo, '--bkspr-tt-'));
                Object.assign(s, tv(a.bodyTypo, '--bkspr-bd-'));
                return { className: 'bkbg-sr-editor-wrap', style: s };
            })());
            var lh = (a.lineHeight / 100).toFixed(2);
            var velPct = a.velocityPlanned > 0 ? Math.min(100, Math.round((a.velocityActual / a.velocityPlanned) * 100)) : 0;
            var ms = moodStyle[a.mood] || moodStyle.good;

            var preview = el('div', { className: 'bkbg-spr-wrap', style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { className: 'bkbg-spr-header', style: { background: a.headerBg, padding: '20px 24px' } },
                    el('div', { className: 'bkbg-spr-header-top', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' } },
                        el('div', null,
                            el('h2', { className: 'bkbg-spr-title', style: { margin: '0 0 6px', color: a.headerColor } }, a.sprintNumber),
                            a.sprintGoal && el('div', { style: { fontSize: 12, color: a.metaColor, lineHeight: 1.4 } }, '🎯 ' + a.sprintGoal),
                            (a.startDate || a.endDate) && el('div', { style: { fontSize: 12, color: a.metaColor, marginTop: 6 } }, [a.startDate, a.endDate].filter(Boolean).join(' → '))
                        ),
                        a.showMood && el('div', { style: { textAlign: 'center', background: ms.bg, color: ms.color, padding: '10px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12 } },
                            el('div', { style: { fontSize: 20 } }, moodEmoji[a.mood] || '😊'),
                            el('div', { style: { marginTop: 2 } }, 'Team Mood: ' + (moodLabel[a.mood] || a.mood))
                        )
                    ),
                    // Velocity bar
                    a.showVelocity && el('div', { style: { marginTop: 14 } },
                        el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: a.metaColor, marginBottom: 4 } },
                            el('span', null, 'Velocity: ' + a.velocityActual + ' / ' + a.velocityPlanned + ' pts'),
                            el('span', null, velPct + '%')
                        ),
                        el('div', { style: { background: a.velocityBgColor, borderRadius: 100, height: 8, overflow: 'hidden' } },
                            el('div', { style: { width: velPct + '%', height: '100%', background: a.velocityFillColor, borderRadius: 100, transition: 'width .3s' } })
                        )
                    )
                ),
                // Three-column retro board
                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '1px solid ' + a.borderColor } },
                    // Went Well
                    el('div', { style: { borderRight: '1px solid ' + a.borderColor } },
                        colHead(a.wentWellLabel, a.wellHeadBg, a.wellBorder),
                        el('ul', { style: { margin: 0, padding: '10px 14px 10px 26px', listStyle: 'disc', color: a.wellColor, background: a.wellBg } },
                            a.wentWell.map(function (w, i) { return el('li', { key: i, style: { marginBottom: 8, lineHeight: lh } }, w); })
                        )
                    ),
                    // To Improve
                    el('div', { style: { borderRight: '1px solid ' + a.borderColor } },
                        colHead(a.toImproveLabel, a.improveHeadBg, a.improveBorder),
                        el('ul', { style: { margin: 0, padding: '10px 14px 10px 26px', listStyle: 'disc', color: a.improveColor, background: a.improveBg } },
                            a.toImprove.map(function (t, i) { return el('li', { key: i, style: { marginBottom: 8, lineHeight: lh } }, t); })
                        )
                    ),
                    // Action Items
                    el('div', null,
                        colHead(a.actionItemsLabel, a.actionHeadBg, a.actionBorder),
                        el('div', { style: { padding: '10px 14px', background: a.actionBg } },
                            a.actionItems.map(function (act, i) {
                                var pb = prioBadge(act.priority, a);
                                return el('div', { key: i, style: { marginBottom: 10, paddingBottom: 10, borderBottom: i < a.actionItems.length - 1 ? '1px dashed ' + a.borderColor : 'none' } },
                                    el('div', { style: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 } },
                                        el('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: pb.bg, color: pb.color } }, pb.label)
                                    ),
                                    el('div', { style: { fontSize: a.fontSize + 'px', color: a.actionColor, lineHeight: lh, marginBottom: 4 } }, act.task),
                                    act.owner && el('div', { style: { fontSize: 11, color: a.metaColor } }, '→ ' + act.owner)
                                );
                            })
                        )
                    )
                ),
                // Team members footer
                a.showTeam && a.teamMembers.length > 0 && el('div', { style: { padding: '10px 20px', borderTop: '1px solid ' + a.borderColor, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
                    el('span', { style: { fontSize: 11, color: a.metaColor, marginRight: 4 } }, 'Team:'),
                    a.teamMembers.map(function (m, i) {
                        return el('span', { key: i, style: { fontSize: 11, padding: '2px 8px', borderRadius: 100, background: a.teamBg, color: a.teamColor } }, m);
                    })
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Sprint Info', initialOpen: true },
                        el(TextControl, { label: 'Sprint Name / Number', value: a.sprintNumber, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sprintNumber: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Sprint Goal', value: a.sprintGoal, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sprintGoal: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Start Date', value: a.startDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ startDate: v }); } }),
                            el(TextControl, { label: 'End Date', value: a.endDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ endDate: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Velocity & Mood', initialOpen: false },
                        el(ToggleControl, { label: 'Show Velocity Bar', checked: a.showVelocity, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showVelocity: v }); } }),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Planned (pts)', value: String(a.velocityPlanned), type: 'number', __nextHasNoMarginBottom: true, onChange: function (v) { set({ velocityPlanned: parseInt(v, 10) || 0 }); } }),
                            el(TextControl, { label: 'Actual (pts)', value: String(a.velocityActual), type: 'number', __nextHasNoMarginBottom: true, onChange: function (v) { set({ velocityActual: parseInt(v, 10) || 0 }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Team Mood', checked: a.showMood, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMood: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Mood', value: a.mood, options: moodOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ mood: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Team Members', initialOpen: false },
                        el(ToggleControl, { label: 'Show Team Members', checked: a.showTeam, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTeam: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            a.teamMembers.map(function (m, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                    el(TextControl, { label: '', value: m, __nextHasNoMarginBottom: true, onChange: function (v) { set({ teamMembers: a.teamMembers.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ teamMembers: a.teamMembers.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ teamMembers: a.teamMembers.concat(['Team Member']) }); } }, '+ Add Member')
                        )
                    ),
                    el(PanelBody, { title: 'Went Well', initialOpen: false },
                        el(TextControl, { label: 'Column Label', value: a.wentWellLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ wentWellLabel: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            a.wentWell.map(function (w, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' } },
                                    el(TextControl, { label: '', value: w, __nextHasNoMarginBottom: true, onChange: function (v) { set({ wentWell: a.wentWell.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { flexShrink: 0 }, onClick: function () { set({ wentWell: a.wentWell.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ wentWell: a.wentWell.concat(['What went well'] ) }); } }, '+ Add Item')
                        )
                    ),
                    el(PanelBody, { title: 'To Improve', initialOpen: false },
                        el(TextControl, { label: 'Column Label', value: a.toImproveLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ toImproveLabel: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            a.toImprove.map(function (t, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' } },
                                    el(TextControl, { label: '', value: t, __nextHasNoMarginBottom: true, onChange: function (v) { set({ toImprove: a.toImprove.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { flexShrink: 0 }, onClick: function () { set({ toImprove: a.toImprove.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ toImprove: a.toImprove.concat(['Area to improve']) }); } }, '+ Add Item')
                        )
                    ),
                    el(PanelBody, { title: 'Action Items', initialOpen: false },
                        el(TextControl, { label: 'Column Label', value: a.actionItemsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItemsLabel: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            a.actionItems.map(function (act, i) {
                                return el('div', { key: i, style: { marginBottom: 10, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' } },
                                        el(SelectControl, { label: '', value: act.priority, options: priorityOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItems: upd(a.actionItems, i, 'priority', v) }); } }),
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ actionItems: a.actionItems.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextControl, { label: 'Task', value: act.task, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItems: upd(a.actionItems, i, 'task', v) }); } }),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextControl, { label: 'Owner', value: act.owner, __nextHasNoMarginBottom: true, onChange: function (v) { set({ actionItems: upd(a.actionItems, i, 'owner', v) }); } })
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ actionItems: a.actionItems.concat([{ task: 'New action item', owner: '', priority: 'medium' }]) }); } }, '+ Add Action Item')
                        )
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl()({ label: 'Title', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl()({ label: 'Body Text', value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                        )
                    ),
                    el(PanelColorSettings, {
                        title: 'Header & Velocity',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header BG',       value: a.headerBg,          onChange: function (v) { set({ headerBg: v || '#1e293b' }); } },
                            { label: 'Header Text',     value: a.headerColor,        onChange: function (v) { set({ headerColor: v || '#f8fafc' }); } },
                            { label: 'Meta Text',       value: a.metaColor,          onChange: function (v) { set({ metaColor: v || '#94a3b8' }); } },
                            { label: 'Accent',          value: a.accentColor,        onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                            { label: 'Velocity Fill',   value: a.velocityFillColor,  onChange: function (v) { set({ velocityFillColor: v || '#6366f1' }); } },
                            { label: 'Velocity Track',  value: a.velocityBgColor,    onChange: function (v) { set({ velocityBgColor: v || '#e2e8f0' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Column Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Well BG',         value: a.wellBg,       onChange: function (v) { set({ wellBg: v || '#f0fdf4' }); } },
                            { label: 'Well Border',     value: a.wellBorder,   onChange: function (v) { set({ wellBorder: v || '#16a34a' }); } },
                            { label: 'Well Text',       value: a.wellColor,    onChange: function (v) { set({ wellColor: v || '#166534' }); } },
                            { label: 'Improve BG',      value: a.improveBg,    onChange: function (v) { set({ improveBg: v || '#fffbeb' }); } },
                            { label: 'Improve Border',  value: a.improveBorder,onChange: function (v) { set({ improveBorder: v || '#d97706' }); } },
                            { label: 'Improve Text',    value: a.improveColor, onChange: function (v) { set({ improveColor: v || '#78350f' }); } },
                            { label: 'Action BG',       value: a.actionBg,     onChange: function (v) { set({ actionBg: v || '#f5f3ff' }); } },
                            { label: 'Action Border',   value: a.actionBorder, onChange: function (v) { set({ actionBorder: v || '#7c3aed' }); } },
                            { label: 'Action Text',     value: a.actionColor,  onChange: function (v) { set({ actionColor: v || '#4c1d95' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Priority Badge Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'High BG',   value: a.highBg,   onChange: function (v) { set({ highBg: v || '#fee2e2' }); } },
                            { label: 'High Text', value: a.highColor, onChange: function (v) { set({ highColor: v || '#991b1b' }); } },
                            { label: 'Med BG',    value: a.medBg,    onChange: function (v) { set({ medBg: v || '#fef3c7' }); } },
                            { label: 'Med Text',  value: a.medColor,  onChange: function (v) { set({ medColor: v || '#78350f' }); } },
                            { label: 'Low BG',    value: a.lowBg,    onChange: function (v) { set({ lowBg: v || '#dcfce7' }); } },
                            { label: 'Low Text',  value: a.lowColor,  onChange: function (v) { set({ lowColor: v || '#14532d' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-sprint-retrospective-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
