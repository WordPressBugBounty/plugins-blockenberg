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

    var _ddTC, _ddTV;
    function _tc() { return _ddTC || (_ddTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _ddTV || (_ddTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    function diffDates(from, to) {
        var d1 = new Date(from), d2 = new Date(to);
        if (isNaN(d1) || isNaN(d2)) return null;
        var swapped = false;
        if (d1 > d2) { var t = d1; d1 = d2; d2 = t; swapped = true; }
        var totalMs   = d2 - d1;
        var totalDays = Math.floor(totalMs / 86400000);
        var totalWeeks= Math.floor(totalDays / 7);
        var totalHours= Math.floor(totalMs / 3600000);
        var totalMins = Math.floor(totalMs / 60000);

        /* Calendar years/months/days */
        var y = d2.getFullYear() - d1.getFullYear();
        var m = d2.getMonth()    - d1.getMonth();
        var d = d2.getDate()     - d1.getDate();
        if (d < 0) { m--; var prev = new Date(d2.getFullYear(), d2.getMonth(), 0); d += prev.getDate(); }
        if (m < 0) { y--; m += 12; }

        /* Working days */
        var wdays = 0, cur = new Date(d1);
        while (cur < d2) { var dow = cur.getDay(); if (dow !== 0 && dow !== 6) wdays++; cur.setDate(cur.getDate()+1); }

        return { years:y, months:m, days:d, totalDays:totalDays, totalWeeks:totalWeeks, totalHours:totalHours, totalMins:totalMins, workingDays:wdays, swapped:swapped };
    }

    function todayStr() {
        var d = new Date(); var m = d.getMonth()+1; var day = d.getDate();
        return d.getFullYear() + '-' + (m<10?'0'+m:m) + '-' + (day<10?'0'+day:day);
    }

    function DateDiffPreview(props) {
        var a       = props.attributes;
        var setAttr = props.setAttributes;
        var today   = todayStr();
        var _s      = useState({ from: today, to: today });
        var state   = _s[0], setState = _s[1];
        function set(k, v) { setState(function(p){ var o=Object.assign({},p); o[k]=v; return o; }); }

        var diff    = diffDates(state.from, state.to);
        var accent  = a.accentColor || '#6c3fb5';
        var cRadius = (a.cardRadius || 16) + 'px';
        var iRadius = (a.inputRadius|| 8)  + 'px';
        var maxW    = (a.maxWidth   || 620) + 'px';
        var ptop    = (a.paddingTop || 60) + 'px';
        var pbot    = (a.paddingBottom || 60) + 'px';
        var numSize = (a.numSize    || 40) + 'px';
        var lclr    = a.labelColor || '#374151';

        var inpStyle  = { width:'100%', padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:iRadius, fontSize:'15px', boxSizing:'border-box', outline:'none', background:'#fff', color:lclr };
        var lblStyle  = { fontSize:(a.inputLabelFontSize||13)+'px', fontWeight:600, color:lclr, display:'block', marginBottom:'4px' };

        function statCard(label, value, unit, color) {
            return el('div', { style:{ textAlign:'center', background:'#fff', borderRadius:'10px', padding:'16px 8px', border:'1.5px solid #e5e7eb' } },
                el('div', { style:{ fontSize:(a.statLabelFontSize||11)+'px', textTransform:'uppercase', letterSpacing:'0.05em', color:'#9ca3af', marginBottom:'4px' } }, label),
                el('div', { className:'bkbg-dd-stat-num', style:{ color:color, lineHeight:1, marginBottom:'2px' } }, value),
                el('div', { style:{ fontSize:(a.statUnitFontSize||12)+'px', color:'#9ca3af' } }, unit)
            );
        }

        var noResult = !diff || (state.from === state.to);

        /* YMD summary */
        var ymdSummary = diff && (a.showYMD !== false) && el('div', { style:{ textAlign:'center', padding:'20px', background:a.resultBg||'#f5f3ff', border:'1.5px solid '+(a.resultBorder||'#ede9fe'), borderRadius:cRadius, marginBottom:'16px' } },
            el('div', { style:{ fontSize:'13px', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' } }, 'Duration'),
            el('div', { style:{ fontSize:'22px', fontWeight:800, color:a.ymdColor||accent, lineHeight:1.3 } },
                [diff.years > 0 && diff.years + ' yr', diff.months > 0 && diff.months + ' mo', diff.days > 0 && diff.days + ' day'].filter(Boolean).join('  ') || '0 days'
            ),
            diff.swapped && el('div', { style:{ fontSize:'12px', color:'#9ca3af', marginTop:'8px' } }, '(dates swapped — showing absolute difference)')
        );

        /* Stat cards */
        var statCards = [];
        if (diff && a.showTotalDays   !== false) statCards.push({ label:'Total Days',    val:diff.totalDays.toLocaleString(),  unit:'days',    color:a.daysColor  ||'#3b82f6' });
        if (diff && a.showWeeks       !== false) statCards.push({ label:'Total Weeks',   val:diff.totalWeeks.toLocaleString(), unit:'weeks',   color:a.weeksColor ||'#10b981' });
        if (diff && a.showHours       !== false) statCards.push({ label:'Total Hours',   val:diff.totalHours.toLocaleString(), unit:'hours',   color:a.hoursColor ||'#f59e0b' });
        if (diff && a.showMinutes     !== false) statCards.push({ label:'Total Minutes', val:diff.totalMins.toLocaleString(),  unit:'minutes', color:'#8b5cf6' });
        if (diff && a.showWorkingDays !== false) statCards.push({ label:'Working Days',  val:diff.workingDays.toLocaleString(),unit:'Mon–Fri', color:a.wdaysColor ||'#ef4444' });

        var cols = statCards.length <= 2 ? '1fr '.repeat(statCards.length).trim()
                 : statCards.length <= 4 ? '1fr 1fr'
                 : '1fr 1fr 1fr';

        return el('div', { className:'bkbg-dd-card', style:{ background:a.cardBg||'#fff', borderRadius:cRadius, maxWidth:maxW, margin:'0 auto', paddingTop:ptop, paddingBottom:pbot, paddingLeft:'32px', paddingRight:'32px', fontFamily:'inherit' } },
            a.showTitle !== false && a.title && el('h2', { className:'bkbg-dd-title', style:{ color:a.titleColor||'#1e1b4b', textAlign:'center', marginTop:0, marginBottom:'8px' } }, a.title),
            a.showSubtitle !== false && a.subtitle && el('p', { className:'bkbg-dd-subtitle', style:{ color:a.subtitleColor||'#6b7280', textAlign:'center', marginTop:0, marginBottom:'24px' } }, a.subtitle),

            /* Date pickers */
            el('div', { style:{ display:'flex', gap:'12px', alignItems:'flex-end', marginBottom:'20px', flexWrap:'wrap' } },
                el('div', { style:{ flex:1 } },
                    el('label', { style:lblStyle }, a.labelFrom || 'From Date'),
                    el('input', { type:'date', value:state.from, style:inpStyle, onChange:function(e){set('from',e.target.value);} })
                ),
                a.showSwapBtn !== false && el('button', {
                    onClick: function () { setState(function(p){ return { from:p.to, to:p.from }; }); },
                    style:{ padding:'10px 14px', border:'1.5px solid '+accent, borderRadius:iRadius, background:'#fff', color:accent, cursor:'pointer', fontWeight:600, fontSize:'18px', flexShrink:0 }
                }, '⇄'),
                el('div', { style:{ flex:1 } },
                    el('label', { style:lblStyle }, a.labelTo || 'To Date'),
                    el('input', { type:'date', value:state.to, style:inpStyle, onChange:function(e){set('to',e.target.value);} })
                )
            ),

            noResult
                ? el('div', { style:{ textAlign:'center', padding:'32px', color:'#9ca3af', background:a.resultBg||'#f5f3ff', borderRadius:cRadius, border:'1.5px solid '+(a.resultBorder||'#ede9fe') } }, 'Select two different dates to see the difference.')
                : el(Fragment, null,
                    ymdSummary,
                    statCards.length > 0 && el('div', { style:{ display:'grid', gridTemplateColumns:cols, gap:'10px' } },
                        statCards.map(function(s,i){ return el(Fragment,{key:i}, statCard(s.label,s.val,s.unit,s.color)); })
                    )
                  )
        );
    }

    registerBlockType('blockenberg/date-difference', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({
                className: 'bkbg-date-difference-block',
                style: Object.assign({
                    '--bkbg-dd-ttl-fs': (a.titleSize || 26) + 'px',
                    '--bkbg-dd-sub-fs': (a.subtitleFontSize || 14) + 'px',
                    '--bkbg-dd-num-fs': (a.numSize || 40) + 'px'
                }, _tv(a.typoTitle || {}, '--bkbg-dd-ttl-'), _tv(a.typoSubtitle || {}, '--bkbg-dd-sub-'), _tv(a.typoNumber || {}, '--bkbg-dd-num-'))
            });

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label:'Title',    value:a.title,    onChange:function(v){setAttr({title:v});} }),
                        el(ToggleControl, { label:'Show title',    checked:a.showTitle,    onChange:function(v){setAttr({showTitle:v});},    __nextHasNoMarginBottom:true }),
                        el(TextControl, { label:'Subtitle', value:a.subtitle, onChange:function(v){setAttr({subtitle:v});} }),
                        el(ToggleControl, { label:'Show subtitle', checked:a.showSubtitle, onChange:function(v){setAttr({showSubtitle:v});}, __nextHasNoMarginBottom:true }),
                        el(TextControl, { label:'From label', value:a.labelFrom, onChange:function(v){setAttr({labelFrom:v});} }),
                        el(TextControl, { label:'To label',   value:a.labelTo,   onChange:function(v){setAttr({labelTo:v});} }),
                        el(ToggleControl, { label:'Show swap button', checked:a.showSwapBtn, onChange:function(v){setAttr({showSwapBtn:v});}, __nextHasNoMarginBottom:true }),
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label:'Years / months / days', checked:a.showYMD,         onChange:function(v){setAttr({showYMD:v});},         __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:'Total days',            checked:a.showTotalDays,   onChange:function(v){setAttr({showTotalDays:v});},   __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:'Total weeks',           checked:a.showWeeks,       onChange:function(v){setAttr({showWeeks:v});},       __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:'Total hours',           checked:a.showHours,       onChange:function(v){setAttr({showHours:v});},       __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:'Total minutes',         checked:a.showMinutes,     onChange:function(v){setAttr({showMinutes:v});},     __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:'Working days (Mon–Fri)',checked:a.showWorkingDays, onChange:function(v){setAttr({showWorkingDays:v});}, __nextHasNoMarginBottom:true }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title', 'blockenberg'),    value: a.typoTitle,    onChange: function(v){ setAttr({typoTitle:v}); } }),
                        _tc() && el(_tc(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function(v){ setAttr({typoSubtitle:v}); } }),
                        _tc() && el(_tc(), { label: __('Number', 'blockenberg'),   value: a.typoNumber,   onChange: function(v){ setAttr({typoNumber:v}); } }),
                        el(RangeControl, { label:'Stat label size', value:a.statLabelFontSize, min:9, max:16, onChange:function(v){setAttr({statLabelFontSize:v});}, __nextHasNoMarginBottom:true }),
                        el(RangeControl, { label:'Stat unit size', value:a.statUnitFontSize, min:9, max:16, onChange:function(v){setAttr({statUnitFontSize:v});}, __nextHasNoMarginBottom:true }),
                        el(RangeControl, { label:'Input label size', value:a.inputLabelFontSize, min:10, max:18, onChange:function(v){setAttr({inputLabelFontSize:v});}, __nextHasNoMarginBottom:true })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false, colorSettings: [
                            { label:'Accent',           value:a.accentColor,  onChange:function(v){setAttr({accentColor:v});} },
                            { label:'Card background',  value:a.cardBg,       onChange:function(v){setAttr({cardBg:v});} },
                            { label:'Result background',value:a.resultBg,     onChange:function(v){setAttr({resultBg:v});} },
                            { label:'Result border',    value:a.resultBorder, onChange:function(v){setAttr({resultBorder:v});} },
                            { label:'YMD number',       value:a.ymdColor,     onChange:function(v){setAttr({ymdColor:v});} },
                            { label:'Total days',       value:a.daysColor,    onChange:function(v){setAttr({daysColor:v});} },
                            { label:'Weeks',            value:a.weeksColor,   onChange:function(v){setAttr({weeksColor:v});} },
                            { label:'Hours',            value:a.hoursColor,   onChange:function(v){setAttr({hoursColor:v});} },
                            { label:'Working days',     value:a.wdaysColor,   onChange:function(v){setAttr({wdaysColor:v});} },
                            { label:'Title',            value:a.titleColor,   onChange:function(v){setAttr({titleColor:v});} },
                            { label:'Subtitle',         value:a.subtitleColor,onChange:function(v){setAttr({subtitleColor:v});} },
                        ],
                    }),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label:'Max width (px)',   value:a.maxWidth,      min:300, max:900, step:10, onChange:function(v){setAttr({maxWidth:v});} }),
                        el(RangeControl, { label:'Padding top',      value:a.paddingTop,    min:0,   max:120,          onChange:function(v){setAttr({paddingTop:v});} }),
                        el(RangeControl, { label:'Padding bottom',   value:a.paddingBottom, min:0,   max:120,          onChange:function(v){setAttr({paddingBottom:v});} }),
                        el(RangeControl, { label:'Card radius (px)', value:a.cardRadius,    min:0,   max:32,           onChange:function(v){setAttr({cardRadius:v});} }),
                        el(RangeControl, { label:'Input radius (px)',value:a.inputRadius,   min:0,   max:20,           onChange:function(v){setAttr({inputRadius:v});} }),
                    )
                ),
                el(DateDiffPreview, { attributes: a, setAttributes: setAttr })
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-date-difference-block' });
            return el('div', Object.assign({}, blockProps, {
                className: (blockProps.className || '') + ' bkbg-dd-app',
                'data-opts': JSON.stringify(a),
            }));
        },
    });
}() );
