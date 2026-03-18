( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var Button            = wp.components.Button;
    var useState          = wp.element.useState;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    var DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // ── Calendar preview ──
    function CalendarPreview(props) {
        var attr   = props.attr;
        var today  = new Date(2026, 1, 23); // Fixed demo date
        var year   = today.getFullYear();
        var month  = today.getMonth();
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var blocked = attr.blockedDays || [0, 6];

        var cells = [];
        for (var pad = 0; pad < firstDay; pad++) {
            cells.push(el('div', { key: 'p' + pad, style: { padding: '8px 4px', fontSize: 13, color: 'transparent' } }, '·'));
        }
        for (var d = 1; d <= daysInMonth; d++) {
            var dow = (firstDay + d - 1) % 7;
            var isBlocked = blocked.indexOf(dow) !== -1;
            var isSel = d === today.getDate();
            cells.push(el('div', {
                key: d,
                style: {
                    padding: '8px 4px', textAlign: 'center', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: isSel ? attr.selectedDayBg : 'transparent',
                    color: isSel ? attr.selectedDayColor : isBlocked ? '#cbd5e1' : attr.textColor,
                    cursor: isBlocked ? 'default' : 'pointer',
                    opacity: isBlocked ? 0.4 : 1
                }
            }, d));
        }

        return el('div', { style: { background: attr.calendarBg, borderRadius: attr.calendarRadius + 'px', overflow: 'hidden', marginBottom: 20 } },
            // Header
            el('div', { style: { background: attr.calendarHeaderBg, color: attr.calendarHeaderColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' } },
                el('button', { style: { background: 'none', border: 'none', color: 'inherit', fontSize: 18, cursor: 'pointer', padding: '0 4px' } }, '‹'),
                el('span', { style: { fontWeight: 700, fontSize: 15 } }, MONTHS[month] + ' ' + year),
                el('button', { style: { background: 'none', border: 'none', color: 'inherit', fontSize: 18, cursor: 'pointer', padding: '0 4px' } }, '›')
            ),
            // Day names
            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 12px 0', gap: 2 } },
                DAYS_SHORT.map(function(d) { return el('div', { key: d, style: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: attr.mutedColor, padding: '4px 0' } }, d); })
            ),
            // Cells
            el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 12px 12px', gap: 2 } }, ...cells)
        );
    }

    registerBlockType('blockenberg/booking-form', {
        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({ background: attr.sectionBg || undefined }, _tv(attr.typoTitle, '--bkbg-bfm-title-'), _tv(attr.typoSubtitle, '--bkbg-bfm-sub-')) });

            // Service list editor
            function ServiceRow(srProps) {
                var s   = srProps.s;
                var idx = srProps.idx;
                function update(patch) {
                    var svc = JSON.parse(JSON.stringify(attr.services));
                    Object.assign(svc[idx], patch);
                    setAttr({ services: svc });
                }
                return el('div', { style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', marginBottom: 8 } },
                    el(TextControl, { label: 'Service name', value: s.label, onChange: function(v){ update({ label: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 } },
                        el(TextControl, { label: 'Duration (min)', value: String(s.duration), onChange: function(v){ update({ duration: parseInt(v) || 0 }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Price', value: s.price, onChange: function(v){ update({ price: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(Button, {
                        variant: 'link', isDestructive: true, size: 'small', style: { marginTop: 6 },
                        onClick: function() { var svc = JSON.parse(JSON.stringify(attr.services)); svc.splice(idx, 1); setAttr({ services: svc }); }
                    }, '✕ Remove service')
                );
            }

            // Time slots editor
            function updateSlots(rawText) {
                var slots = rawText.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
                setAttr({ timeSlots: slots });
            }

            return el('div', blockProps,
                el(InspectorControls, {},

                    // Content
                    el(PanelBody, { title: 'Form Content', initialOpen: true },
                        el(TextControl, { label: 'Form Title', value: attr.formTitle, onChange: function(v){ setAttr({ formTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Form Subtitle', value: attr.formSubtitle, onChange: function(v){ setAttr({ formSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Submit Button Label', value: attr.submitLabel, onChange: function(v){ setAttr({ submitLabel: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Confirmation Title', value: attr.confirmationTitle, onChange: function(v){ setAttr({ confirmationTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextareaControl, { label: 'Confirmation Message', value: attr.confirmationMsg, onChange: function(v){ setAttr({ confirmationMsg: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Services
                    el(PanelBody, { title: 'Services', initialOpen: false },
                        el(ToggleControl, { label: 'Show service selector', checked: attr.showServiceSelect, onChange: function(v){ setAttr({ showServiceSelect: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show price', checked: attr.showPrice, onChange: function(v){ setAttr({ showPrice: v }); }, __nextHasNoMarginBottom: true }),
                        el('hr', { style: { borderColor: '#e2e8f0', margin: '8px 0' } }),
                        attr.services.map(function(s, i) { return el(ServiceRow, { key: i, s: s, idx: i }); }),
                        el(Button, {
                            variant: 'secondary', size: 'small',
                            onClick: function() { var svc = JSON.parse(JSON.stringify(attr.services)); svc.push({ label: 'New Service', duration: 60, price: '' }); setAttr({ services: svc }); }
                        }, '+ Add Service')
                    ),

                    // Time slots
                    el(PanelBody, { title: 'Time Slots', initialOpen: false },
                        el(TextareaControl, {
                            label: 'Time slots (one per line, HH:MM)',
                            value: (attr.timeSlots || []).join('\n'),
                            onChange: updateSlots,
                            rows: 8,
                            __nextHasNoMarginBottom: true
                        }),
                        el('p', { style: { fontSize: 11, color: '#64748b', margin: '4px 0 0' } }, 'Blocked days (0=Sun, 6=Sat): ' + (attr.blockedDays || []).join(', '))
                    ),

                    // Fields
                    el(PanelBody, { title: 'Form Fields', initialOpen: false },
                        el(ToggleControl, { label: 'Name field', checked: attr.showNameField, onChange: function(v){ setAttr({ showNameField: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Email field', checked: attr.showEmailField, onChange: function(v){ setAttr({ showEmailField: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Phone field', checked: attr.showPhoneField, onChange: function(v){ setAttr({ showPhoneField: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Notes / message field', checked: attr.showNotes, onChange: function(v){ setAttr({ showNotes: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(RangeControl, { label: 'Form Width (px)', value: attr.formWidth, min: 360, max: 900, step: 10, onChange: function(v){ setAttr({ formWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Form Radius (px)', value: attr.formRadius, min: 0, max: 40, onChange: function(v){ setAttr({ formRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Input Radius (px)', value: attr.inputRadius, min: 0, max: 24, onChange: function(v){ setAttr({ inputRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Calendar Radius (px)', value: attr.calendarRadius, min: 0, max: 24, onChange: function(v){ setAttr({ calendarRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: attr.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: attr.typoSubtitle, onChange: function (v) { setAttr({ typoSubtitle: v }); } })
                    ),

                    // Colors
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Form Background',      value: attr.formBg,             onChange: function(v){ setAttr({ formBg:             v || '#ffffff' }); } },
                            { label: 'Form Border',          value: attr.formBorder,         onChange: function(v){ setAttr({ formBorder:         v || '#e2e8f0' }); } },
                            { label: 'Calendar Background',  value: attr.calendarBg,         onChange: function(v){ setAttr({ calendarBg:         v || '#f8fafc' }); } },
                            { label: 'Calendar Header BG',   value: attr.calendarHeaderBg,   onChange: function(v){ setAttr({ calendarHeaderBg:   v || '#6366f1' }); } },
                            { label: 'Calendar Header Text', value: attr.calendarHeaderColor,onChange: function(v){ setAttr({ calendarHeaderColor:v || '#ffffff' }); } },
                            { label: 'Selected Day BG',      value: attr.selectedDayBg,      onChange: function(v){ setAttr({ selectedDayBg:      v || '#6366f1' }); } },
                            { label: 'Selected Day Text',    value: attr.selectedDayColor,   onChange: function(v){ setAttr({ selectedDayColor:   v || '#ffffff' }); } },
                            { label: 'Time Slot BG',         value: attr.slotBg,             onChange: function(v){ setAttr({ slotBg:             v || '#f1f5f9' }); } },
                            { label: 'Selected Slot BG',     value: attr.slotSelectedBg,     onChange: function(v){ setAttr({ slotSelectedBg:     v || '#6366f1' }); } },
                            { label: 'Selected Slot Text',   value: attr.slotSelectedColor,  onChange: function(v){ setAttr({ slotSelectedColor:  v || '#ffffff' }); } },
                            { label: 'Input Background',     value: attr.inputBg,            onChange: function(v){ setAttr({ inputBg:            v || '#f8fafc' }); } },
                            { label: 'Input Border',         value: attr.inputBorder,        onChange: function(v){ setAttr({ inputBorder:        v || '#e2e8f0' }); } },
                            { label: 'Submit Button BG',     value: attr.btnBg,              onChange: function(v){ setAttr({ btnBg:              v || '#6366f1' }); } },
                            { label: 'Submit Button Text',   value: attr.btnColor,           onChange: function(v){ setAttr({ btnColor:           v || '#ffffff' }); } },
                            { label: 'Text Color',           value: attr.textColor,          onChange: function(v){ setAttr({ textColor:          v || '#0f172a' }); } },
                            { label: 'Muted Color',          value: attr.mutedColor,         onChange: function(v){ setAttr({ mutedColor:         v || '#64748b' }); } },
                            { label: 'Section Background',   value: attr.sectionBg,          onChange: function(v){ setAttr({ sectionBg:          v || '' }); } }
                        ]
                    })
                ),

                // ── Editor preview ──
                el('div', { style: { maxWidth: attr.formWidth + 'px', margin: '0 auto', fontFamily: 'system-ui,sans-serif' } },
                    el('div', { style: { background: attr.formBg, border: '1px solid ' + attr.formBorder, borderRadius: attr.formRadius + 'px', padding: '28px 28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' } },
                        // Header
                        el('h2', { className: 'bkbg-bfm-title', style: { color: attr.textColor, margin: '0 0 6px' } }, attr.formTitle),
                        el('p', { className: 'bkbg-bfm-subtitle', style: { color: attr.mutedColor, margin: '0 0 24px' } }, attr.formSubtitle),

                        // Service select preview
                        attr.showServiceSelect && el('div', { style: { marginBottom: 18 } },
                            el('label', { style: { display: 'block', fontSize: 13, fontWeight: 600, color: attr.textColor, marginBottom: 6 } }, 'Select Service'),
                            el('select', { style: { width: '100%', padding: '11px 13px', borderRadius: attr.inputRadius + 'px', border: '1px solid ' + attr.inputBorder, background: attr.inputBg, color: attr.textColor, fontSize: 14 } },
                                attr.services.map(function(s, i) {
                                    return el('option', { key: i }, s.label + (attr.showPrice && s.price ? ' — ' + s.price : ''));
                                })
                            )
                        ),

                        // Calendar preview
                        el(CalendarPreview, { attr: attr }),

                        // Time slots
                        el('div', { style: { marginBottom: 18 } },
                            el('p', { style: { fontSize: 13, fontWeight: 600, color: attr.textColor, margin: '0 0 10px' } }, 'Available Times'),
                            el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
                                (attr.timeSlots || []).slice(0, 8).map(function(t, i) {
                                    return el('div', {
                                        key: i,
                                        style: {
                                            padding: '7px 14px', borderRadius: attr.inputRadius + 'px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                            background: i === 0 ? attr.slotSelectedBg : attr.slotBg,
                                            color: i === 0 ? attr.slotSelectedColor : attr.textColor
                                        }
                                    }, t);
                                }),
                                (attr.timeSlots || []).length > 8 && el('div', { style: { padding: '7px 14px', fontSize: 12, color: attr.mutedColor } }, '+' + ((attr.timeSlots.length - 8)) + ' more')
                            )
                        ),

                        // Submit
                        el('button', { style: { width: '100%', padding: '13px', background: attr.btnBg, color: attr.btnColor, border: 'none', borderRadius: attr.inputRadius + 'px', fontSize: 15, fontWeight: 700, cursor: 'pointer' } }, attr.submitLabel)
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-bf-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
