( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _ctcTC, _ctcTV;
    function _tc() { return _ctcTC || (_ctcTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _ctcTV || (_ctcTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    registerBlockType('blockenberg/cta-countdown', {
        title: __('CTA with Countdown', 'blockenberg'),
        icon: 'clock',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-ctc-bg': a.bgColor,
                    '--bkbg-ctc-text': a.textColor,
                    '--bkbg-ctc-heading-c': a.headingColor,
                    '--bkbg-ctc-heading-sz': a.headingSize + 'px',
                    '--bkbg-ctc-heading-w': a.headingWeight,
                    '--bkbg-ctc-sub-c': a.subColor,
                    '--bkbg-ctc-sub-sz': a.subSize + 'px',
                    '--bkbg-ctc-eyebrow-c': a.eyebrowColor,
                    '--bkbg-ctc-eyebrow-sz': a.eyebrowSize + 'px',
                    '--bkbg-ctc-accent': a.accentColor,
                    '--bkbg-ctc-timer-bg': a.timerBg,
                    '--bkbg-ctc-timer-border': a.timerBorder,
                    '--bkbg-ctc-num-c': a.timerNumColor,
                    '--bkbg-ctc-num-sz': a.numberSize + 'px',
                    '--bkbg-ctc-num-w': a.numberWeight,
                    '--bkbg-ctc-label-c': a.timerLabelColor,
                    '--bkbg-ctc-label-sz': a.labelSize + 'px',
                    '--bkbg-ctc-btn-bg': a.btnBg,
                    '--bkbg-ctc-btn-text': a.btnText,
                    '--bkbg-ctc-btn2-bg': a.btn2Bg,
                    '--bkbg-ctc-btn2-text': a.btn2Text,
                    '--bkbg-ctc-btn2-border': a.btn2Border,
                    '--bkbg-ctc-btn-r': a.buttonRadius + 'px',
                    '--bkbg-ctc-btn-sz': a.buttonSize + 'px',
                    '--bkbg-ctc-timer-gap': a.timerGap + 'px',
                    '--bkbg-ctc-r': a.borderRadius + 'px',
                    '--bkbg-ctc-pt': a.paddingTop + 'px',
                    '--bkbg-ctc-pb': a.paddingBottom + 'px',
                }, _tv(a.typoHeading, '--bkbg-ctc-hdg-'), _tv(a.typoSub, '--bkbg-ctc-sub-'), _tv(a.typoEyebrow, '--bkbg-ctc-eye-'), _tv(a.typoNumber, '--bkbg-ctc-num-'));
            }

            var styleOptions = [
                { label: __('Dark', 'blockenberg'), value: 'dark' },
                { label: __('Light', 'blockenberg'), value: 'light' },
                { label: __('Gradient', 'blockenberg'), value: 'gradient' },
                { label: __('Banner', 'blockenberg'), value: 'banner' },
            ];

            var layoutOptions = [
                { label: __('Centered', 'blockenberg'), value: 'centered' },
                { label: __('Split', 'blockenberg'), value: 'split' },
            ];

            var timerStyleOptions = [
                { label: __('Box', 'blockenberg'), value: 'box' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' },
                { label: __('Outlined', 'blockenberg'), value: 'outlined' },
            ];

            // Preview countdown — static values for editor
            var units = [
                { key: 'days', label: a.labelDays, show: a.showDays, val: '0' + a.daysFromNow },
                { key: 'hours', label: a.labelHours, show: a.showHours, val: '12' },
                { key: 'minutes', label: a.labelMinutes, show: a.showMinutes, val: '34' },
                { key: 'seconds', label: a.labelSeconds, show: a.showSeconds, val: '56' },
            ].filter(function (u) { return u.show; });

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Eyebrow', 'blockenberg'), checked: a.showEyebrow, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showEyebrow: v }); }
                    }),
                    a.showEyebrow && el(TextControl, { label: __('Eyebrow Text', 'blockenberg'), value: a.eyebrow, onChange: function (v) { set({ eyebrow: v }); } }),
                    el(ToggleControl, {
                        label: __('Show Subheading', 'blockenberg'), checked: a.showSubheading, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheading: v }); }
                    })
                ),

                el(PanelBody, { title: __('CTA Buttons', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Primary Button Text', 'blockenberg'), value: a.ctaText, onChange: function (v) { set({ ctaText: v }); } }),
                    el(TextControl, { label: __('Primary Button URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { set({ ctaUrl: v }); } }),
                    el(ToggleControl, {
                        label: __('Show Secondary Button', 'blockenberg'), checked: a.showSecondaryCta, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSecondaryCta: v }); }
                    }),
                    a.showSecondaryCta && el(TextControl, { label: __('Secondary Button Text', 'blockenberg'), value: a.ctaSecondaryText, onChange: function (v) { set({ ctaSecondaryText: v }); } }),
                    a.showSecondaryCta && el(TextControl, { label: __('Secondary Button URL', 'blockenberg'), value: a.ctaSecondaryUrl, onChange: function (v) { set({ ctaSecondaryUrl: v }); } })
                ),

                el(PanelBody, { title: __('Countdown Timer', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Use Relative Time (days from now)', 'blockenberg'), checked: a.useRelative, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ useRelative: v }); }
                    }),
                    a.useRelative && el(RangeControl, { label: __('Days from Now', 'blockenberg'), value: a.daysFromNow, onChange: function (v) { set({ daysFromNow: v }); }, min: 0, max: 365 }),
                    !a.useRelative && el(TextControl, { label: __('End Date (ISO format)', 'blockenberg'), value: a.endDate, placeholder: '2026-12-31T23:59:59', onChange: function (v) { set({ endDate: v }); } }),
                    el('p', { style: { marginBottom: 8, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' } }, __('Show Units', 'blockenberg')),
                    el(ToggleControl, { label: __('Days', 'blockenberg'), checked: a.showDays, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDays: v }); } }),
                    el(ToggleControl, { label: __('Hours', 'blockenberg'), checked: a.showHours, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHours: v }); } }),
                    el(ToggleControl, { label: __('Minutes', 'blockenberg'), checked: a.showMinutes, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMinutes: v }); } }),
                    el(ToggleControl, { label: __('Seconds', 'blockenberg'), checked: a.showSeconds, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSeconds: v }); } }),
                    el(ToggleControl, { label: __('Show Labels', 'blockenberg'), checked: a.showLabels, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLabels: v }); } }),
                    a.showLabels && el(TextControl, { label: __('Days Label', 'blockenberg'), value: a.labelDays, onChange: function (v) { set({ labelDays: v }); } }),
                    a.showLabels && el(TextControl, { label: __('Hours Label', 'blockenberg'), value: a.labelHours, onChange: function (v) { set({ labelHours: v }); } }),
                    a.showLabels && el(TextControl, { label: __('Minutes Label', 'blockenberg'), value: a.labelMinutes, onChange: function (v) { set({ labelMinutes: v }); } }),
                    a.showLabels && el(TextControl, { label: __('Seconds Label', 'blockenberg'), value: a.labelSeconds, onChange: function (v) { set({ labelSeconds: v }); } })
                ),

                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Style', 'blockenberg'), value: a.style, options: styleOptions, onChange: function (v) { set({ style: v }); } }),
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: layoutOptions, onChange: function (v) { set({ layout: v }); } }),
                    el(SelectControl, { label: __('Timer Style', 'blockenberg'), value: a.timerStyle, options: timerStyleOptions, onChange: function (v) { set({ timerStyle: v }); } }),
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: a.borderRadius, onChange: function (v) { set({ borderRadius: v }); }, min: 0, max: 48 }),
                    el(RangeControl, { label: __('Timer Gap', 'blockenberg'), value: a.timerGap, onChange: function (v) { set({ timerGap: v }); }, min: 4, max: 32 }),
                    el(RangeControl, { label: __('Button Radius', 'blockenberg'), value: a.buttonRadius, onChange: function (v) { set({ buttonRadius: v }); }, min: 0, max: 99 }),
                    ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Heading', 'blockenberg'), value: a.typoHeading, onChange: function (v) { set({ typoHeading: v }); } }),
                    _tc() && el(_tc(), { label: __('Subheading', 'blockenberg'), value: a.typoSub, onChange: function (v) { set({ typoSub: v }); } }),
                    _tc() && el(_tc(), { label: __('Eyebrow', 'blockenberg'), value: a.typoEyebrow, onChange: function (v) { set({ typoEyebrow: v }); } }),
                    _tc() && el(_tc(), { label: __('Timer Number', 'blockenberg'), value: a.typoNumber, onChange: function (v) { set({ typoNumber: v }); } }),
                    el(RangeControl, { label: __('Timer Label Size', 'blockenberg'), value: a.labelSize, onChange: function (v) { set({ labelSize: v }); }, min: 9, max: 18 }),
                    el(RangeControl, { label: __('Button Font Size', 'blockenberg'), value: a.buttonSize, onChange: function (v) { set({ buttonSize: v }); }, min: 12, max: 24 })
                ),

                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, onChange: function (v) { set({ paddingTop: v }); }, min: 0, max: 240 }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, onChange: function (v) { set({ paddingBottom: v }); }, min: 0, max: 240 })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#0f172a' }); }, label: __('Background', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6c3fb5' }); }, label: __('Accent', 'blockenberg') },
                        { value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#ffffff' }); }, label: __('Heading Color', 'blockenberg') },
                        { value: a.subColor, onChange: function (v) { set({ subColor: v || 'rgba(255,255,255,0.7)' }); }, label: __('Subheading Color', 'blockenberg') },
                        { value: a.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#a78bfa' }); }, label: __('Eyebrow Color', 'blockenberg') },
                        { value: a.timerBg, onChange: function (v) { set({ timerBg: v || 'rgba(255,255,255,0.08)' }); }, label: __('Timer Box Background', 'blockenberg') },
                        { value: a.timerBorder, onChange: function (v) { set({ timerBorder: v || 'rgba(255,255,255,0.12)' }); }, label: __('Timer Box Border', 'blockenberg') },
                        { value: a.timerNumColor, onChange: function (v) { set({ timerNumColor: v || '#ffffff' }); }, label: __('Timer Number Color', 'blockenberg') },
                        { value: a.timerLabelColor, onChange: function (v) { set({ timerLabelColor: v || 'rgba(255,255,255,0.5)' }); }, label: __('Timer Label Color', 'blockenberg') },
                        { value: a.btnBg, onChange: function (v) { set({ btnBg: v || '#6c3fb5' }); }, label: __('Primary Button BG', 'blockenberg') },
                        { value: a.btnText, onChange: function (v) { set({ btnText: v || '#ffffff' }); }, label: __('Primary Button Text', 'blockenberg') },
                        { value: a.btn2Text, onChange: function (v) { set({ btn2Text: v || '#ffffff' }); }, label: __('Secondary Button Text', 'blockenberg') },
                    ]
                })
            );

            var blockProps = useBlockProps({
                className: 'bkbg-ctc-wrap bkbg-ctc-style--' + a.style + ' bkbg-ctc-layout--' + a.layout,
                style: wrapStyle(a)
            });

            var contentEl = el('div', { className: 'bkbg-ctc-content' },
                a.showEyebrow && a.eyebrow && el('div', { className: 'bkbg-ctc-eyebrow' }, a.eyebrow),
                el(RichText, {
                    tagName: 'h2', className: 'bkbg-ctc-heading',
                    value: a.heading, placeholder: __('Your compelling headline…', 'blockenberg'),
                    onChange: function (v) { set({ heading: v }); }
                }),
                a.showSubheading && el(RichText, {
                    tagName: 'p', className: 'bkbg-ctc-sub',
                    value: a.subheading, placeholder: __('Supporting text…', 'blockenberg'),
                    onChange: function (v) { set({ subheading: v }); }
                }),
                el('div', { className: 'bkbg-ctc-buttons' },
                    el('a', { className: 'bkbg-ctc-btn bkbg-ctc-btn--primary', href: a.ctaUrl }, a.ctaText),
                    a.showSecondaryCta && el('a', { className: 'bkbg-ctc-btn bkbg-ctc-btn--secondary', href: a.ctaSecondaryUrl }, a.ctaSecondaryText)
                )
            );

            var timerEl = el('div', { className: 'bkbg-ctc-timer bkbg-ctc-timer--' + a.timerStyle },
                units.map(function (u, i) {
                    return el('div', { key: i, className: 'bkbg-ctc-unit' },
                        el('div', { className: 'bkbg-ctc-unit-num' }, u.val),
                        a.showLabels && el('div', { className: 'bkbg-ctc-unit-label' }, u.label)
                    );
                })
            );

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-ctc-inner' },
                    a.layout === 'split' ? el('div', { className: 'bkbg-ctc-split' }, contentEl, timerEl) :
                        el('div', { className: 'bkbg-ctc-centered' }, contentEl, timerEl)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var el = wp.element.createElement;

            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-ctc-bg': a.bgColor,
                    '--bkbg-ctc-text': a.textColor,
                    '--bkbg-ctc-heading-c': a.headingColor,
                    '--bkbg-ctc-heading-sz': a.headingSize + 'px',
                    '--bkbg-ctc-heading-w': a.headingWeight,
                    '--bkbg-ctc-sub-c': a.subColor,
                    '--bkbg-ctc-sub-sz': a.subSize + 'px',
                    '--bkbg-ctc-eyebrow-c': a.eyebrowColor,
                    '--bkbg-ctc-eyebrow-sz': a.eyebrowSize + 'px',
                    '--bkbg-ctc-accent': a.accentColor,
                    '--bkbg-ctc-timer-bg': a.timerBg,
                    '--bkbg-ctc-timer-border': a.timerBorder,
                    '--bkbg-ctc-num-c': a.timerNumColor,
                    '--bkbg-ctc-num-sz': a.numberSize + 'px',
                    '--bkbg-ctc-num-w': a.numberWeight,
                    '--bkbg-ctc-label-c': a.timerLabelColor,
                    '--bkbg-ctc-label-sz': a.labelSize + 'px',
                    '--bkbg-ctc-btn-bg': a.btnBg,
                    '--bkbg-ctc-btn-text': a.btnText,
                    '--bkbg-ctc-btn2-bg': a.btn2Bg,
                    '--bkbg-ctc-btn2-text': a.btn2Text,
                    '--bkbg-ctc-btn2-border': a.btn2Border,
                    '--bkbg-ctc-btn-r': a.buttonRadius + 'px',
                    '--bkbg-ctc-btn-sz': a.buttonSize + 'px',
                    '--bkbg-ctc-timer-gap': a.timerGap + 'px',
                    '--bkbg-ctc-r': a.borderRadius + 'px',
                    '--bkbg-ctc-pt': a.paddingTop + 'px',
                    '--bkbg-ctc-pb': a.paddingBottom + 'px',
                }, _tv(a.typoHeading, '--bkbg-ctc-hdg-'), _tv(a.typoSub, '--bkbg-ctc-sub-'), _tv(a.typoEyebrow, '--bkbg-ctc-eye-'), _tv(a.typoNumber, '--bkbg-ctc-num-'));
            }

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-ctc-wrap bkbg-ctc-style--' + a.style + ' bkbg-ctc-layout--' + a.layout,
                style: wrapStyle(a),
                'data-days': a.daysFromNow,
                'data-end': a.endDate,
                'data-relative': a.useRelative ? '1' : '0',
                'data-show-days': a.showDays ? '1' : '0',
                'data-show-hours': a.showHours ? '1' : '0',
                'data-show-minutes': a.showMinutes ? '1' : '0',
                'data-show-seconds': a.showSeconds ? '1' : '0'
            });

            var labelsMap = { days: a.labelDays, hours: a.labelHours, minutes: a.labelMinutes, seconds: a.labelSeconds };
            var unitKeys = ['days', 'hours', 'minutes', 'seconds'].filter(function (k) {
                return (k === 'days' && a.showDays) || (k === 'hours' && a.showHours) || (k === 'minutes' && a.showMinutes) || (k === 'seconds' && a.showSeconds);
            });

            return el('div', blockProps,
                el('div', { className: 'bkbg-ctc-inner' },
                    a.layout === 'split' ?
                        el('div', { className: 'bkbg-ctc-split' },
                            el('div', { className: 'bkbg-ctc-content' },
                                a.showEyebrow && a.eyebrow && el('div', { className: 'bkbg-ctc-eyebrow' }, a.eyebrow),
                                el(RichText.Content, { tagName: 'h2', className: 'bkbg-ctc-heading', value: a.heading }),
                                a.showSubheading && el(RichText.Content, { tagName: 'p', className: 'bkbg-ctc-sub', value: a.subheading }),
                                el('div', { className: 'bkbg-ctc-buttons' },
                                    el('a', { className: 'bkbg-ctc-btn bkbg-ctc-btn--primary', href: a.ctaUrl }, a.ctaText),
                                    a.showSecondaryCta && el('a', { className: 'bkbg-ctc-btn bkbg-ctc-btn--secondary', href: a.ctaSecondaryUrl }, a.ctaSecondaryText)
                                )
                            ),
                            el('div', { className: 'bkbg-ctc-timer bkbg-ctc-timer--' + a.timerStyle },
                                unitKeys.map(function (k, i) {
                                    return el('div', { key: k, className: 'bkbg-ctc-unit', 'data-unit': k },
                                        el('div', { className: 'bkbg-ctc-unit-num' }, '00'),
                                        a.showLabels && el('div', { className: 'bkbg-ctc-unit-label' }, labelsMap[k])
                                    );
                                })
                            )
                        ) :
                        el('div', { className: 'bkbg-ctc-centered' },
                            el('div', { className: 'bkbg-ctc-content' },
                                a.showEyebrow && a.eyebrow && el('div', { className: 'bkbg-ctc-eyebrow' }, a.eyebrow),
                                el(RichText.Content, { tagName: 'h2', className: 'bkbg-ctc-heading', value: a.heading }),
                                a.showSubheading && el(RichText.Content, { tagName: 'p', className: 'bkbg-ctc-sub', value: a.subheading })
                            ),
                            el('div', { className: 'bkbg-ctc-timer bkbg-ctc-timer--' + a.timerStyle },
                                unitKeys.map(function (k, i) {
                                    return el('div', { key: k, className: 'bkbg-ctc-unit', 'data-unit': k },
                                        el('div', { className: 'bkbg-ctc-unit-num' }, '00'),
                                        a.showLabels && el('div', { className: 'bkbg-ctc-unit-label' }, labelsMap[k])
                                    );
                                })
                            ),
                            el('div', { className: 'bkbg-ctc-buttons' },
                                el('a', { className: 'bkbg-ctc-btn bkbg-ctc-btn--primary', href: a.ctaUrl }, a.ctaText),
                                a.showSecondaryCta && el('a', { className: 'bkbg-ctc-btn bkbg-ctc-btn--secondary', href: a.ctaSecondaryUrl }, a.ctaSecondaryText)
                            )
                        )
                )
            );
        }
    });
}() );
