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
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    var DAYS_OF_WEEK = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var ZODIAC = [
        { sign:'Capricorn', symbol:'♑', end:[1,19] },
        { sign:'Aquarius',  symbol:'♒', end:[2,18] },
        { sign:'Pisces',    symbol:'♓', end:[3,20] },
        { sign:'Aries',     symbol:'♈', end:[4,19] },
        { sign:'Taurus',    symbol:'♉', end:[5,20] },
        { sign:'Gemini',    symbol:'♊', end:[6,20] },
        { sign:'Cancer',    symbol:'♋', end:[7,22] },
        { sign:'Leo',       symbol:'♌', end:[8,22] },
        { sign:'Virgo',     symbol:'♍', end:[9,22] },
        { sign:'Libra',     symbol:'♎', end:[10,22] },
        { sign:'Scorpio',   symbol:'♏', end:[11,21] },
        { sign:'Sagittarius',symbol:'♐',end:[12,21] },
        { sign:'Capricorn', symbol:'♑', end:[12,31] },
    ];

    function getZodiac(month, day) {
        for (var i = 0; i < ZODIAC.length; i++) {
            var z = ZODIAC[i];
            if (month < z.end[0] || (month === z.end[0] && day <= z.end[1])) return z;
        }
        return ZODIAC[ZODIAC.length - 1];
    }

    function calcAge(birthDate, now) {
        var years  = now.getFullYear() - birthDate.getFullYear();
        var months = now.getMonth()    - birthDate.getMonth();
        var days   = now.getDate()     - birthDate.getDate();
        if (days < 0) {
            months--;
            var prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) { years--; months += 12; }
        var totalDays = Math.floor((now - birthDate) / 86400000);
        return { years: years, months: months, days: days, totalDays: totalDays };
    }

    function daysUntilBirthday(birthDate, now) {
        var next = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (next < now) next.setFullYear(now.getFullYear() + 1);
        return Math.ceil((next - now) / 86400000);
    }

    /* ── Preview component ────────────────────────────────────────────────── */
    function AgePreview(props) {
        var a      = props.attrs;
        var accent = a.accentColor || '#6c3fb5';
        var cRadius= (a.cardRadius     || 16) + 'px';
        var aRadius= (a.ageCardRadius  || 12) + 'px';

        var bdState = useState('1990-01-01');
        var bdValue = bdState[0];
        var setBD   = bdState[1];

        var now       = new Date();
        var birthDate = new Date(bdValue);
        var valid     = !isNaN(birthDate.getTime()) && birthDate < now;
        var age       = valid ? calcAge(birthDate, now) : null;
        var untilBd   = valid ? daysUntilBirthday(birthDate, now) : null;
        var zodiac    = valid ? getZodiac(birthDate.getMonth() + 1, birthDate.getDate()) : null;
        var bornDay   = valid ? DAYS_OF_WEEK[birthDate.getDay()] : null;

        var cardStyle = {
            background:    a.cardBg    || '#ffffff',
            borderRadius:  cRadius,
            padding:       '32px',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:      (a.maxWidth || 680) + 'px',
            margin:        '0 auto',
            paddingTop:    (a.paddingTop    || 60) + 'px',
            paddingBottom: (a.paddingBottom || 60) + 'px',
            boxSizing:     'border-box',
        };

        return el('div', { style: cardStyle },
            a.showTitle && el('h2', { className: 'bkbg-age-title', style: { color: a.titleColor || '#1e1b4b', textAlign: 'center', marginTop: 0, marginBottom: 8 } }, a.title || __('Age Calculator', 'blockenberg')),
            a.showSubtitle && el('p', { style: { color: a.subtitleColor || '#6b7280', textAlign: 'center', marginTop: 0, marginBottom: 28 } }, a.subtitle),

            /* Date input */
            el('div', { style: { marginBottom: '28px' } },
                el('label', { style: { display: 'block', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '8px', fontSize: '14px' } }, __('Date of Birth', 'blockenberg')),
                el('input', {
                    type: 'date',
                    value: bdValue,
                    max: now.toISOString().slice(0, 10),
                    onChange: function (e) { setBD(e.target.value); },
                    style: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box', outline: 'none', cursor: 'pointer' }
                })
            ),

            /* Age cards */
            valid && a.showAgeCards && el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' } },
                [
                    { val: age.years,  label: a.yearsLabel  || 'Years' },
                    { val: age.months, label: a.monthsLabel || 'Months' },
                    { val: age.days,   label: a.daysLabel   || 'Days' },
                ].map(function (item) {
                    return el('div', {
                        key: item.label,
                        style: {
                            background: a.ageCardBg || accent, borderRadius: aRadius,
                            padding: '20px 12px', textAlign: 'center',
                        }
                    },
                        el('div', { className: 'bkbg-age-num', style: { color: a.ageCardColor || '#fff' } }, item.val),
                        el('div', { style: { fontSize: '13px', color: a.ageCardColor || '#fff', opacity: 0.8, marginTop: '6px', fontWeight: 600 } }, item.label)
                    );
                })
            ),

            /* Birthday countdown */
            valid && a.showNextBirthday && el('div', {
                style: { background: a.resultBg || '#f5f3ff', border: '1.5px solid ' + (a.resultBorder || '#ede9fe'), borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }
            },
                el('span', { style: { fontSize: '28px' } }, '🎂'),
                el('div', null,
                    el('div', { style: { fontWeight: 700, color: a.titleColor || '#1e1b4b', fontSize: '15px' } },
                        untilBd === 0 ? '🎉 Happy Birthday!' : (__('Next birthday in', 'blockenberg') + ' ' + untilBd + ' ' + __('days', 'blockenberg'))
                    ),
                    el('div', { style: { color: a.subtitleColor || '#6b7280', fontSize: '13px', marginTop: '2px' } },
                        age.years + 1 + __('th birthday coming soon', 'blockenberg')
                    )
                )
            ),

            /* Zodiac & born day */
            valid && (a.showZodiac || a.showBornDay) && el('div', { style: { display: 'grid', gridTemplateColumns: a.showZodiac && a.showBornDay ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '14px' } },
                a.showZodiac && el('div', { style: { background: a.statsBg || '#fafafa', border: '1px solid ' + (a.statsBorder || '#e5e7eb'), borderRadius: '10px', padding: '14px 16px' } },
                    el('div', { style: { fontSize: '11px', fontWeight: 600, color: a.subtitleColor || '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' } }, __('Zodiac Sign', 'blockenberg')),
                    el('div', { style: { fontWeight: 700, color: a.titleColor || '#1e1b4b', fontSize: '16px' } }, zodiac.symbol + ' ' + zodiac.sign)
                ),
                a.showBornDay && el('div', { style: { background: a.statsBg || '#fafafa', border: '1px solid ' + (a.statsBorder || '#e5e7eb'), borderRadius: '10px', padding: '14px 16px' } },
                    el('div', { style: { fontSize: '11px', fontWeight: 600, color: a.subtitleColor || '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' } }, __('Born On', 'blockenberg')),
                    el('div', { style: { fontWeight: 700, color: a.titleColor || '#1e1b4b', fontSize: '16px' } }, '📅 ' + bornDay)
                )
            ),

            /* Life stats */
            valid && a.showLifeStats && el('div', { style: { background: a.statsBg || '#fafafa', border: '1px solid ' + (a.statsBorder || '#e5e7eb'), borderRadius: '10px', padding: '16px 20px' } },
                el('div', { style: { fontSize: '12px', fontWeight: 700, color: a.subtitleColor || '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' } }, __('Life Stats', 'blockenberg')),
                el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' } },
                    [
                        { label: __('Total Days', 'blockenberg'), val: age.totalDays.toLocaleString() },
                        { label: __('Total Weeks', 'blockenberg'), val: Math.floor(age.totalDays / 7).toLocaleString() },
                        { label: __('Total Hours', 'blockenberg'), val: (age.totalDays * 24).toLocaleString() },
                        { label: __('Heartbeats (est.)', 'blockenberg'), val: (age.totalDays * 24 * 60 * 72).toLocaleString() },
                    ].map(function (s) {
                        return el('div', { key: s.label },
                            el('div', { style: { fontSize: '11px', color: a.subtitleColor || '#6b7280', marginBottom: '2px' } }, s.label),
                            el('div', { style: { fontWeight: 700, color: accent, fontSize: '15px' } }, s.val)
                        );
                    })
                )
            ),

            /* Empty state */
            !valid && el('div', { style: { textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: '15px' } }, __('Enter your birth date above to see your age', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/age-calculator', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-age-wrap', style: (function () {
                var s = { background: a.bgColor || undefined };
                var _tv = getTypoCssVars();
                Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-age-title-'));
                Object.assign(s, _tv(a.ageNumTypo || {}, '--bkbg-age-num-'));
                s['--bkbg-age-title-sz'] = (a.titleSize || 28) + 'px';
                s['--bkbg-age-num-sz'] = (a.ageNumSize || 52) + 'px';
                return s;
            })() });

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function (v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function (v) { setAttr({ subtitle: v }); } }),
                        el(TextControl, { label: __('Years Label', 'blockenberg'), value: a.yearsLabel, onChange: function (v) { setAttr({ yearsLabel: v }); } }),
                        el(TextControl, { label: __('Months Label', 'blockenberg'), value: a.monthsLabel, onChange: function (v) { setAttr({ monthsLabel: v }); } }),
                        el(TextControl, { label: __('Days Label', 'blockenberg'), value: a.daysLabel, onChange: function (v) { setAttr({ daysLabel: v }); } })
                    ),

                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Age Cards', 'blockenberg'), checked: a.showAgeCards, onChange: function (v) { setAttr({ showAgeCards: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Next Birthday', 'blockenberg'), checked: a.showNextBirthday, onChange: function (v) { setAttr({ showNextBirthday: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Zodiac Sign', 'blockenberg'), checked: a.showZodiac, onChange: function (v) { setAttr({ showZodiac: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Day of Week Born', 'blockenberg'), checked: a.showBornDay, onChange: function (v) { setAttr({ showBornDay: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Life Stats', 'blockenberg'), checked: a.showLifeStats, onChange: function (v) { setAttr({ showLifeStats: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', null, 'Typography control not loaded.');
                            return el(Fragment, null,
                                el(TC, { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                                el(TC, { label: __('Age Number Typography', 'blockenberg'), value: a.ageNumTypo || {}, onChange: function (v) { setAttr({ ageNumTypo: v }); } })
                            );
                        })()
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),      value: a.accentColor,  onChange: function (v) { setAttr({ accentColor:  v || '#6c3fb5' }); } },
                            { label: __('Age Card Background', 'blockenberg'),value: a.ageCardBg,    onChange: function (v) { setAttr({ ageCardBg:    v || '#6c3fb5' }); } },
                            { label: __('Age Card Text', 'blockenberg'),      value: a.ageCardColor, onChange: function (v) { setAttr({ ageCardColor: v || '#ffffff' }); } },
                            { label: __('Result Background', 'blockenberg'),  value: a.resultBg,     onChange: function (v) { setAttr({ resultBg:     v || '#f5f3ff' }); } },
                            { label: __('Stats Background', 'blockenberg'),   value: a.statsBg,      onChange: function (v) { setAttr({ statsBg:      v || '#fafafa' }); } },
                            { label: __('Card Background', 'blockenberg'),    value: a.cardBg,       onChange: function (v) { setAttr({ cardBg:       v || '#ffffff' }); } },
                            { label: __('Title Color', 'blockenberg'),        value: a.titleColor,   onChange: function (v) { setAttr({ titleColor:   v || '#1e1b4b' }); } },
                            { label: __('Subtitle Color', 'blockenberg'),     value: a.subtitleColor,onChange: function (v) { setAttr({ subtitleColor:v || '#6b7280' }); } },
                            { label: __('Section Background', 'blockenberg'), value: a.bgColor,      onChange: function (v) { setAttr({ bgColor:      v || '' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'),    value: a.cardRadius,   min: 0,  max: 40, onChange: function (v) { setAttr({ cardRadius:   v }); } }),
                        el(RangeControl, { label: __('Age Card Radius (px)', 'blockenberg'),value: a.ageCardRadius,min: 0,  max: 32, onChange: function (v) { setAttr({ ageCardRadius:v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'),      value: a.maxWidth,     min: 320,max: 1200,onChange: function (v) { setAttr({ maxWidth:     v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'),    value: a.paddingTop,   min: 0,  max: 160,onChange: function (v) { setAttr({ paddingTop:   v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom,min: 0,  max: 160,onChange: function (v) { setAttr({ paddingBottom:v }); } })
                    )
                ),

                el('div', blockProps,
                    el(AgePreview, { attrs: a })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-age-wrap', style: { background: a.bgColor || undefined } });
            return el('div', blockProps,
                el('div', { className: 'bkbg-age-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-age-loading' }, __('Loading age calculator…', 'blockenberg'))
                )
            );
        }
    });
}() );
