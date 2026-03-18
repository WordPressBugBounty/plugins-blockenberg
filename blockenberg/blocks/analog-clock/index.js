( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var TIMEZONES = [
        { label: 'Local (device)', value: 'local' },
        { label: 'UTC', value: 'UTC' },
        { label: 'New York (ET)', value: 'America/New_York' },
        { label: 'Chicago (CT)', value: 'America/Chicago' },
        { label: 'Los Angeles (PT)', value: 'America/Los_Angeles' },
        { label: 'London (GMT/BST)', value: 'Europe/London' },
        { label: 'Paris (CET)', value: 'Europe/Paris' },
        { label: 'Berlin (CET)', value: 'Europe/Berlin' },
        { label: 'Moscow (MSK)', value: 'Europe/Moscow' },
        { label: 'Dubai (GST)', value: 'Asia/Dubai' },
        { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
        { label: 'Bangkok (ICT)', value: 'Asia/Bangkok' },
        { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
        { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
        { label: 'Sydney (AEST)', value: 'Australia/Sydney' }
    ];

    function ClockFace(props) {
        var a = props;
        var now = new Date();
        var h  = now.getHours()   % 12;
        var m  = now.getMinutes();
        var s  = now.getSeconds();

        var r  = 46; // radius within 100-unit viewBox
        var cx = 50, cy = 50;

        var hAngle   = (h * 30) + (m * 0.5); // degrees, 0 at top
        var mAngle   = m * 6;
        var sAngle   = s * 6;

        function toRad(deg) { return (deg - 90) * Math.PI / 180; }
        function handEnd(angle, length) {
            return { x: cx + length * Math.cos(toRad(angle)), y: cy + length * Math.sin(toRad(angle)) };
        }

        var hEnd = handEnd(hAngle, 28);
        var mEnd = handEnd(mAngle, 36);
        var sEnd = handEnd(sAngle, 40);

        // Tick marks
        var ticks = [];
        for (var i = 0; i < 60; i++) {
            var isBig = i % 5 === 0;
            var ang = (i * 6 - 90) * Math.PI / 180;
            var innerR = isBig ? r - 8 : r - 5;
            ticks.push(el('line', {
                key: i,
                x1: cx + innerR * Math.cos(ang), y1: cy + innerR * Math.sin(ang),
                x2: cx + r  * Math.cos(ang),     y2: cy + r  * Math.sin(ang),
                stroke: a.tickColor, strokeWidth: isBig ? 2 : 0.8,
                strokeLinecap: 'round'
            }));
        }

        // Hour numbers
        var numbers = [];
        if (a.showNumbers) {
            for (var j = 1; j <= 12; j++) {
                var nAng = ((j * 30) - 90) * Math.PI / 180;
                numbers.push(el('text', {
                    key: 'n' + j,
                    x: cx + (r - 15) * Math.cos(nAng),
                    y: cy + (r - 15) * Math.sin(nAng),
                    textAnchor: 'middle', dominantBaseline: 'middle',
                    fontSize: 7, fontWeight: 700, fill: a.numberColor,
                    fontFamily: 'system-ui'
                }, j));
            }
        }

        var sz = a.clockSize || 240;
        var borderW = a.clockStyle === 'minimal' ? 2 : a.clockStyle === 'bold' ? 8 : 4;

        return el('svg', {
            width: sz, height: sz,
            viewBox: '0 0 100 100',
            style: { display: 'block', maxWidth: '100%' }
        },
            // Face
            el('circle', { cx: cx, cy: cy, r: 49, fill: a.clockBorder }),
            el('circle', { cx: cx, cy: cy, r: 49 - borderW, fill: a.clockFace }),

            // Ticks
            a.showTicks && ticks,

            // Numbers
            numbers,

            // Hour hand
            el('line', { x1: cx, y1: cy, x2: hEnd.x, y2: hEnd.y, stroke: a.hourHandColor, strokeWidth: 3.5, strokeLinecap: 'round' }),
            // Minute hand
            el('line', { x1: cx, y1: cy, x2: mEnd.x, y2: mEnd.y, stroke: a.minuteHandColor, strokeWidth: 2.5, strokeLinecap: 'round' }),
            // Second hand
            a.showSecondHand && el('line', { x1: cx, y1: cy, x2: sEnd.x, y2: sEnd.y, stroke: a.secondHandColor, strokeWidth: 1.5, strokeLinecap: 'round' }),
            // Counter weight
            a.showSecondHand && el('line', { x1: cx, y1: cy, x2: cx + (-sEnd.x + cx)*0.25, y2: cy + (-sEnd.y + cy)*0.25, stroke: a.secondHandColor, strokeWidth: 1.5, strokeLinecap: 'round' }),
            // Center dot
            el('circle', { cx: cx, cy: cy, r: 3, fill: a.centerDotColor }),
            el('circle', { cx: cx, cy: cy, r: 1.5, fill: '#fff' })
        );
    }

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var blockProps = useBlockProps({ style: { background: a.sectionBg || 'transparent', padding: '28px 20px', textAlign: 'center' } });
        var state = useState(0);
        var tick  = state[1];

        useEffect(function () {
            var t = setInterval(function () { tick(function (n) { return n + 1; }); }, 1000);
            return function () { clearInterval(t); };
        }, []);

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Clock Settings', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Clock Size (px)', 'blockenberg'),
                        value: a.clockSize, min: 100, max: 500,
                        onChange: function (v) { setAttributes({ clockSize: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Clock Style', 'blockenberg'),
                        value: a.clockStyle,
                        options: [
                            { label: 'Classic', value: 'classic' },
                            { label: 'Minimal', value: 'minimal' },
                            { label: 'Bold', value: 'bold' }
                        ],
                        onChange: function (v) { setAttributes({ clockStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Timezone', 'blockenberg'),
                        value: a.timezone,
                        options: TIMEZONES,
                        onChange: function (v) { setAttributes({ timezone: v }); }
                    }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Numbers', 'blockenberg'), checked: a.showNumbers, onChange: function (v) { setAttributes({ showNumbers: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Tick Marks', 'blockenberg'), checked: a.showTicks, onChange: function (v) { setAttributes({ showTicks: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Second Hand', 'blockenberg'), checked: a.showSecondHand, onChange: function (v) { setAttributes({ showSecondHand: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Date Below', 'blockenberg'), checked: a.showDate, onChange: function (v) { setAttributes({ showDate: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Digital Time', 'blockenberg'), checked: a.showDigitalTime, onChange: function (v) { setAttributes({ showDigitalTime: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                    el(getTypographyControl(), { label: __('Subtitle Typography', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { setAttributes({ subtitleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Clock Face', 'blockenberg'), value: a.clockFace, onChange: function (v) { setAttributes({ clockFace: v || '#ffffff' }); } },
                        { label: __('Clock Border', 'blockenberg'), value: a.clockBorder, onChange: function (v) { setAttributes({ clockBorder: v || '#1e1b4b' }); } },
                        { label: __('Hour Hand', 'blockenberg'), value: a.hourHandColor, onChange: function (v) { setAttributes({ hourHandColor: v || '#1e1b4b' }); } },
                        { label: __('Minute Hand', 'blockenberg'), value: a.minuteHandColor, onChange: function (v) { setAttributes({ minuteHandColor: v || '#374151' }); } },
                        { label: __('Second Hand', 'blockenberg'), value: a.secondHandColor, onChange: function (v) { setAttributes({ secondHandColor: v || '#ef4444' }); } },
                        { label: __('Tick Marks', 'blockenberg'), value: a.tickColor, onChange: function (v) { setAttributes({ tickColor: v || '#374151' }); } },
                        { label: __('Numbers', 'blockenberg'), value: a.numberColor, onChange: function (v) { setAttributes({ numberColor: v || '#1e1b4b' }); } },
                        { label: __('Center Dot', 'blockenberg'), value: a.centerDotColor, onChange: function (v) { setAttributes({ centerDotColor: v || '#ef4444' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } }
                    ]
                })
            ),
            el('div', (function () { var p = blockProps; var _tv = getTypoCssVars(); var s = Object.assign({}, p.style || {}); Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-clk-title-')); Object.assign(s, _tv(a.subtitleTypo || {}, '--bkbg-clk-subtitle-')); p.style = s; return p; })(),
                a.title && el(RichText, {
                    tagName: 'h3', className: 'bkbg-clk-title',
                    value: a.title, onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Clock Title (optional)', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 4px' }
                }),
                (!a.title) && el(RichText, {
                    tagName: 'h3', className: 'bkbg-clk-title',
                    value: a.title, onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Clock Title (optional)', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 4px' }
                }),
                a.subtitle && el(RichText, {
                    tagName: 'p', className: 'bkbg-clk-subtitle',
                    value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Subtitle (optional)', 'blockenberg'),
                    style: { color: a.titleColor + 'bb', margin: '0 0 12px' }
                }),
                el('div', { style: { display: 'flex', justifyContent: 'center' } },
                    el(ClockFace, a)
                ),
                a.showDate && el('div', { style: { marginTop: 10, fontSize: 15, fontWeight: 600, color: a.titleColor } },
                    new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                ),
                a.showDigitalTime && el('div', { style: { marginTop: 6, fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: a.titleColor } },
                    new Date().toLocaleTimeString()
                )
            )
        );
    }

    registerBlockType('blockenberg/analog-clock', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-clk-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-clk-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-clk-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
