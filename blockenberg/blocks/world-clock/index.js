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
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    /* ── Typography helpers (lazy) ───────────────────────────────── */
    var _tc, _tvf;
    Object.defineProperty(window, '__bkwc_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '__bkwc_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, typoObj, setAttributes, attrName) {
        var fn = window.__bkwc_tc;
        return fn ? fn({ label: label, value: typoObj || {}, onChange: function (v) { var o = {}; o[attrName] = v; setAttributes(o); } }) : null;
    }
    function getTypoCssVars(a) {
        var fn = window.__bkwc_tvf;
        var s = {};
        if (fn) {
            Object.assign(s, fn(a.titleTypo || {}, '--bkwc-tt-'));
            Object.assign(s, fn(a.labelTypo || {}, '--bkwc-lb-'));
            Object.assign(s, fn(a.timeTypo || {}, '--bkwc-tm-'));
        }
        return s;
    }

    /* ── Common TZ list used for autocomplete hint ───── */
    var COMMON_TZ = [
        'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
        'America/Sao_Paulo','America/Mexico_City','America/Toronto',
        'Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow','Europe/Istanbul',
        'Asia/Dubai','Asia/Kolkata','Asia/Shanghai','Asia/Tokyo','Asia/Singapore','Asia/Seoul',
        'Africa/Cairo','Africa/Johannesburg','Australia/Sydney','Pacific/Auckland'
    ];

    /* ── helpers ──────────────────────────────────────── */
    function getTimeParts(tz, fmt, showSec) {
        try {
            var now = new Date();
            var opts12  = { timeZone: tz, hour: 'numeric', minute: '2-digit', second: showSec ? '2-digit' : undefined, hour12: fmt === '12h' };
            var optsDate = { timeZone: tz, month: 'short', day: 'numeric', weekday: 'short' };
            return {
                time: new Intl.DateTimeFormat('en-US', opts12).format(now),
                date: new Intl.DateTimeFormat('en-US', optsDate).format(now)
            };
        } catch (e) {
            return { time: '--:--', date: '' };
        }
    }

    function getAnglesParts(tz) {
        try {
            var now = new Date();
            var parts = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
            }).format(now).split(':').map(Number);
            var h = parts[0] % 12, m = parts[1], s = parts[2];
            return {
                hourAngle: (h * 30) + (m * 0.5),
                minAngle:  m * 6 + s * 0.1,
                secAngle:  s * 6
            };
        } catch (e) {
            return { hourAngle: 0, minAngle: 0, secAngle: 0 };
        }
    }

    /* ── Analog clock face SVG ──────────────────────── */
    function AnalogClock(props) {
        var a = props, size = a.size || 120, r = size / 2;
        var ang = getAnglesParts(a.tz);
        // tick marks
        var ticks = [];
        for (var i = 0; i < 12; i++) {
            var rad = (i * 30 - 90) * Math.PI / 180;
            var rIn = r * 0.82, rOut = r * 0.92;
            ticks.push(el('line', {
                key: i,
                x1: r + rIn * Math.cos(rad), y1: r + rIn * Math.sin(rad),
                x2: r + rOut * Math.cos(rad), y2: r + rOut * Math.sin(rad),
                stroke: a.accentColor, strokeWidth: 1.5
            }));
        }
        function hand(angle, length, color, width) {
            var rad = (angle - 90) * Math.PI / 180;
            return el('line', {
                x1: r, y1: r,
                x2: r + length * Math.cos(rad),
                y2: r + length * Math.sin(rad),
                stroke: color, strokeWidth: width, strokeLinecap: 'round'
            });
        }
        return el('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size },
            el('circle', { cx: r, cy: r, r: r - 2, fill: a.clockFace, stroke: a.accentColor, strokeWidth: 2 }),
            ticks,
            hand(ang.hourAngle, r * 0.5, a.handHour, 3),
            hand(ang.minAngle,  r * 0.7, a.handMin,  2),
            a.showSeconds !== false ? hand(ang.secAngle, r * 0.75, a.handSec, 1) : null,
            el('circle', { cx: r, cy: r, r: 3, fill: a.handSec })
        );
    }

    /* ── Single clock card ──────────────────────────── */
    function ClockCard(props) {
        var a = props.attrs, zone = props.zone;
        var parts = getTimeParts(zone.tz, a.timeFormat, a.showSeconds);
        var cardStyle = {
            background: a.cardBg,
            border: '1px solid ' + a.borderColor,
            borderRadius: a.cardRadius + 'px',
            padding: a.cardPadding + 'px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
        };
        return el('div', { className: 'bkbg-wc-card', style: cardStyle },
            a.clockStyle === 'analog' ? el(AnalogClock, {
                tz: zone.tz, size: a.analogSize,
                clockFace: a.clockFace, accentColor: a.accentColor,
                handHour: a.handHour, handMin: a.handMin, handSec: a.handSec,
                showSeconds: a.showSeconds
            }) : null,
            el('div', { className: 'bkbg-wc-label', style: { color: a.labelColor, textAlign: 'center' } }, zone.label),
            a.clockStyle === 'digital' ? el('div', { className: 'bkbg-wc-time', style: { color: a.timeColor } }, parts.time) : null,
            a.showDate ? el('div', { className: 'bkbg-wc-date', style: { color: a.dateColor } }, parts.date) : null
        );
    }

    /* ── Editor preview ───────────────────────────────── */
    function WorldClockPreview(props) {
        var a = props.attrs;
        var gridStyle = {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
            gap: a.gap + 'px',
            maxWidth: a.maxWidth + 'px',
            margin: '0 auto'
        };
        return el('div', { className: 'bkbg-wc-preview', style: { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', background: a.sectionBg || undefined } },
            (a.showTitle || a.showSubtitle) ? el('div', { style: { textAlign: 'center', marginBottom: 32, maxWidth: a.maxWidth + 'px', margin: '0 auto 32px' } },
                a.showTitle ? el('h3', { className: 'bkbg-wc-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title) : null,
                a.showSubtitle ? el('p', { className: 'bkbg-wc-subtitle', style: { color: a.subtitleColor, margin: 0 } }, a.subtitle) : null
            ) : null,
            el('div', { style: gridStyle },
                a.zones.map(function (zone, i) {
                    return el(ClockCard, { key: i, zone: zone, attrs: a });
                })
            )
        );
    }

    /* ── Edit component ───────────────────────────────── */
    function WorldClockEdit(props) {
        var a = props.attributes;
        var set = props.setAttributes;
        var blockProps = useBlockProps((function () {
            var s = getTypoCssVars(a);
            return { className: 'bkbg-wc-editor', style: s };
        })());

        function s(key) { return function (v) { var o = {}; o[key] = v; set(o); }; }
        function n(key) { return function (v) { var o = {}; o[key] = Number(v) || 0; set(o); }; }
        function t(key) { return function (v) { var o = {}; o[key] = v; set(o); }; }

        function updateZone(i, field, val) {
            var z = a.zones.slice();
            z[i] = Object.assign({}, z[i]);
            z[i][field] = val;
            set({ zones: z });
        }

        function addZone() {
            set({ zones: a.zones.concat([{ label: 'City', tz: 'UTC' }]) });
        }

        function removeZone(i) {
            if (a.zones.length <= 1) return;
            var z = a.zones.filter(function (_, idx) { return idx !== i; });
            set({ zones: z });
        }

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Title */
                el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: t('showTitle'), __nextHasNoMarginBottom: true }),
                    a.showTitle ? el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: s('title') }) : null,
                    el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: t('showSubtitle'), __nextHasNoMarginBottom: true }),
                    a.showSubtitle ? el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: s('subtitle') }) : null
                ),

                /* Zones */
                el(PanelBody, { title: __('Timezone Zones', 'blockenberg'), initialOpen: true },
                    a.zones.map(function (zone, i) {
                        return el('div', { key: i, style: { marginBottom: 16, background: '#f9f9f9', borderRadius: 8, padding: '8px 12px' } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
                                el('strong', null, 'Zone ' + (i + 1)),
                                el(Button, { isDestructive: true, isSmall: true, onClick: function () { removeZone(i); } }, '✕')
                            ),
                            el(TextControl, { label: __('Label', 'blockenberg'), value: zone.label, onChange: function (v) { updateZone(i, 'label', v); } }),
                            el(TextControl, { label: __('IANA Timezone', 'blockenberg'), value: zone.tz, onChange: function (v) { updateZone(i, 'tz', v); }, help: 'e.g. America/New_York, Europe/London' })
                        );
                    }),
                    el(Button, { isPrimary: true, onClick: addZone, style: { marginTop: 8 } }, __('+ Add Zone', 'blockenberg'))
                ),

                /* Clock Settings */
                el(PanelBody, { title: __('Clock Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Clock Style', 'blockenberg'), value: a.clockStyle, options: [{ label: 'Digital', value: 'digital' }, { label: 'Analog', value: 'analog' }], onChange: s('clockStyle') }),
                    el(SelectControl, { label: __('Time Format', 'blockenberg'), value: a.timeFormat, options: [{ label: '12-hour (AM/PM)', value: '12h' }, { label: '24-hour', value: '24h' }], onChange: s('timeFormat') }),
                    el(ToggleControl, { label: __('Show Date', 'blockenberg'), checked: a.showDate, onChange: t('showDate'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Seconds', 'blockenberg'), checked: a.showSeconds, onChange: t('showSeconds'), __nextHasNoMarginBottom: true })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl( 'Title', a.titleTypo, set, 'titleTypo' ),
                    getTypoControl( 'Label', a.labelTypo, set, 'labelTypo' ),
                    getTypoControl( 'Time', a.timeTypo, set, 'timeTypo' )
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor,   onChange: s('accentColor'),   label: __('Accent', 'blockenberg') },
                        { value: a.cardBg,         onChange: s('cardBg'),         label: __('Card Background', 'blockenberg') },
                        { value: a.borderColor,    onChange: s('borderColor'),    label: __('Card Border', 'blockenberg') },
                        { value: a.timeColor,      onChange: s('timeColor'),      label: __('Time Color', 'blockenberg') },
                        { value: a.labelColor,     onChange: s('labelColor'),     label: __('City Label', 'blockenberg') },
                        { value: a.dateColor,      onChange: s('dateColor'),      label: __('Date Color', 'blockenberg') },
                        { value: a.clockFace,      onChange: s('clockFace'),      label: __('Clock Face', 'blockenberg') },
                        { value: a.handHour,       onChange: s('handHour'),       label: __('Hour Hand', 'blockenberg') },
                        { value: a.handMin,        onChange: s('handMin'),        label: __('Minute Hand', 'blockenberg') },
                        { value: a.handSec,        onChange: s('handSec'),        label: __('Second Hand', 'blockenberg') },
                        { value: a.titleColor,     onChange: s('titleColor'),     label: __('Title Color', 'blockenberg') },
                        { value: a.subtitleColor,  onChange: s('subtitleColor'),  label: __('Subtitle Color', 'blockenberg') },
                        { value: a.sectionBg,      onChange: s('sectionBg'),      label: __('Section Background', 'blockenberg') }
                    ]
                }),

                /* Layout & Sizing */
                el(PanelBody, { title: __('Layout & Sizing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, onChange: n('columns'), min: 1, max: 6 }),
                    el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, onChange: n('gap'), min: 4, max: 48 }),
                    el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, onChange: n('cardRadius'), min: 0, max: 32 }),
                    el(RangeControl, { label: __('Card Padding (px)', 'blockenberg'), value: a.cardPadding, onChange: n('cardPadding'), min: 8, max: 64 }),
                    el(RangeControl, { label: __('Time Size (px)', 'blockenberg'), value: a.timeSize, onChange: n('timeSize'), min: 16, max: 64 }),
                    a.clockStyle === 'analog' ? el(RangeControl, { label: __('Analog Clock Size (px)', 'blockenberg'), value: a.analogSize, onChange: n('analogSize'), min: 60, max: 240 }) : null,
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, onChange: n('maxWidth'), min: 400, max: 1400, step: 20 }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, onChange: n('paddingTop'), min: 0, max: 160 }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, onChange: n('paddingBottom'), min: 0, max: 160 })
                )
            ),

            el('div', blockProps,
                el(WorldClockPreview, { attrs: a })
            )
        );
    }

    registerBlockType('blockenberg/world-clock', {
        edit: WorldClockEdit,
        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-wc-app',
                style: getTypoCssVars(a),
                'data-opts': JSON.stringify(a)
            }));
        }
    });
}() );
