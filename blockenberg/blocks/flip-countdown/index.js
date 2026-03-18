( function () {
    var el                = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText          = wp.blockEditor.RichText;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;

    var _fcdTC, _fcdTV;
    function _tc() { return _fcdTC || (_fcdTC = window.bkbgTypographyControl); }
    function _tv() { return _fcdTV || (_fcdTV = window.bkbgTypoCssVars); }

    var DEMO = { days: '05', hours: '14', minutes: '38', seconds: '27' };

    function FlipCard(val, unit, a) {
        var digits = String(val).padStart(2, '0').split('');
        return el('div', { className: 'bkbg-fc-unit' },
            el('div', { className: 'bkbg-fc-pair' },
                digits.map(function (d, i) {
                    return el('div', { key: i, className: 'bkbg-fc-card',
                        style: {
                            background: a.flipBg || '#1e1b4b',
                            borderRadius: (a.cardRadius || 8) + 'px',
                            color: a.flipColor || '#ffffff'
                        }
                    },
                        el('div', { className: 'bkbg-fc-upper' }, d),
                        el('div', { className: 'bkbg-fc-hinge',
                            style: { background: a.flipHingeBg || '#0f0e17' } }),
                        el('div', { className: 'bkbg-fc-lower' }, d)
                    );
                })
            ),
            a.showLabels !== false && el('div', { className: 'bkbg-fc-label',
                style: { color: a.labelColor || '#64748b' }
            }, unit)
        );
    }

    function Separator(a) {
        return el('div', { className: 'bkbg-fc-sep',
            style: { color: a.separatorColor || '#6366f1' }
        }, ':');
    }

    function EditorPreview(props) {
        var a = props.attributes;
        var units = [];
        if (a.showDays    !== false) { units.push({ val: DEMO.days,     label: 'Days' }); }
        if (a.showHours   !== false) { units.push({ val: DEMO.hours,    label: 'Hours' }); }
        if (a.showMinutes !== false) { units.push({ val: DEMO.minutes,  label: 'Minutes' }); }
        if (a.showSeconds !== false) { units.push({ val: DEMO.seconds,  label: 'Seconds' }); }

        return el('div', { className: 'bkbg-fc-app', style: { background: a.sectionBg || '#f8fafc', padding: '40px 24px', borderRadius: 14,
            textAlign: 'center', fontFamily: 'inherit' } },
            el(RichText, {
                tagName: 'h3', className: 'bkbg-fc-title', value: a.title, placeholder: 'Coming Soon',
                style: { margin: '0 0 8px',
                    color: a.titleColor || '#1e1b4b' },
                onChange: function (v) { props.setAttributes({ title: v }); }
            }),
            el(RichText, {
                tagName: 'p', className: 'bkbg-fc-subtitle', value: a.subtitle, placeholder: 'Add a subtitle...',
                style: { margin: '0 0 32px',
                    color: a.titleColor || '#1e1b4b', opacity: 0.65 },
                onChange: function (v) { props.setAttributes({ subtitle: v }); }
            }),
            el('div', { className: 'bkbg-fc-row', style: { gap: (a.cardGap || 16) + 'px' } },
                units.reduce(function (acc, u, i) {
                    if (i > 0 && a.showSeparators !== false) acc.push(Separator(a));
                    acc.push(FlipCard(u.val, u.label, a));
                    return acc;
                }, [])
            ),
            a.targetDate && el('p', { style: { marginTop: 16, fontSize: 12, opacity: 0.45,
                color: a.titleColor || '#1e1b4b' } }, '📅 Target: ' + a.targetDate)
        );
    }

    registerBlockType('blockenberg/flip-countdown', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-fc-editor-wrap', style: Object.assign({},
                _tv()(a.typoTitle, '--bkbg-fcd-tt-'),
                _tv()(a.typoSubtitle, '--bkbg-fcd-ts-'),
                _tv()(a.typoDigit, '--bkbg-fcd-td-'),
                _tv()(a.typoLabel, '--bkbg-fcd-tl-')
            ) });

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        ),
                    el(PanelBody, { title: 'Countdown Settings', initialOpen: false },
                        el(TextControl, { label: 'Target date & time (ISO format)', value: a.targetDate || '',
                            help: 'e.g. 2026-12-31T23:59:59',
                            onChange: function (v) { set({ targetDate: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'End message', value: a.endMessage || '',
                            onChange: function (v) { set({ endMessage: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'When countdown ends', value: a.endAction || 'message',
                            options: [
                                { label: 'Show end message', value: 'message' },
                                { label: 'Hide the block', value: 'hide' },
                                { label: 'Keep showing zeros', value: 'zero' }
                            ],
                            onChange: function (v) { set({ endAction: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Days', checked: a.showDays !== false,
                            onChange: function (v) { set({ showDays: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Hours', checked: a.showHours !== false,
                            onChange: function (v) { set({ showHours: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Minutes', checked: a.showMinutes !== false,
                            onChange: function (v) { set({ showMinutes: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Seconds', checked: a.showSeconds !== false,
                            onChange: function (v) { set({ showSeconds: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show unit labels', checked: a.showLabels !== false,
                            onChange: function (v) { set({ showLabels: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show separators', checked: a.showSeparators !== false,
                            onChange: function (v) { set({ showSeparators: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Card Style', initialOpen: false },
                        el(RangeControl, { label: 'Card border radius', value: a.cardRadius || 8,
                            onChange: function (v) { set({ cardRadius: v }); }, min: 0, max: 30, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Gap between units', value: a.cardGap || 16,
                            onChange: function (v) { set({ cardGap: v }); }, min: 4, max: 60, __nextHasNoMarginBottom: true }),
                        ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        _tc()({ label: 'Title', value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                        _tc()({ label: 'Subtitle', value: a.typoSubtitle, onChange: function (v) { set({ typoSubtitle: v }); } }),
                        _tc()({ label: 'Digit', value: a.typoDigit, onChange: function (v) { set({ typoDigit: v }); } }),
                        _tc()({ label: 'Label', value: a.typoLabel, onChange: function (v) { set({ typoLabel: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Card background', value: a.flipBg, onChange: function (v) { set({ flipBg: v || '#1e1b4b' }); } },
                            { label: 'Digit color',     value: a.flipColor, onChange: function (v) { set({ flipColor: v || '#ffffff' }); } },
                            { label: 'Hinge color',     value: a.flipHingeBg, onChange: function (v) { set({ flipHingeBg: v || '#0f0e17' }); } },
                            { label: 'Label color',     value: a.labelColor, onChange: function (v) { set({ labelColor: v || '#64748b' }); } },
                            { label: 'Separator color', value: a.separatorColor, onChange: function (v) { set({ separatorColor: v || '#6366f1' }); } },
                            { label: 'Section background', value: a.sectionBg, onChange: function (v) { set({ sectionBg: v || '#f8fafc' }); } },
                            { label: 'Title color',     value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#1e1b4b' }); } }
                        ],
                        disableCustomGradients: true
                    })
                ),
                el(EditorPreview, { attributes: a, setAttributes: props.setAttributes })
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                targetDate: a.targetDate || '',
                showDays: a.showDays !== false,
                showHours: a.showHours !== false,
                showMinutes: a.showMinutes !== false,
                showSeconds: a.showSeconds !== false,
                showLabels: a.showLabels !== false,
                showSeparators: a.showSeparators !== false,
                endMessage: a.endMessage || '🎉 The wait is over!',
                endAction: a.endAction || 'message',
                cardRadius: a.cardRadius || 8,
                cardGap: a.cardGap || 16,
                digitSize: a.digitSize || 56,
                labelFontSize: a.labelFontSize || 12,
                labelFontWeight: a.labelFontWeight || '400',
                titleFontSize: a.titleFontSize || 30,
                titleFontWeight: a.titleFontWeight || '800',
                titleLineHeight: a.titleLineHeight || 1.2,
                subtitleSize: a.subtitleSize || 15,
                subtitleFontWeight: a.subtitleFontWeight || '400',
                subtitleLineHeight: a.subtitleLineHeight || 1.5,
                flipBg: a.flipBg || '#1e1b4b',
                flipColor: a.flipColor || '#ffffff',
                flipHingeBg: a.flipHingeBg || '#0f0e17',
                labelColor: a.labelColor || '#64748b',
                separatorColor: a.separatorColor || '#6366f1',
                sectionBg: a.sectionBg || '#f8fafc',
                titleColor: a.titleColor || '#1e1b4b',
                typoTitle: a.typoTitle || {},
                typoSubtitle: a.typoSubtitle || {},
                typoDigit: a.typoDigit || {},
                typoLabel: a.typoLabel || {}
            };
            return el('div', blockProps,
                el('div', { className: 'bkbg-fc-app', 'data-opts': JSON.stringify(opts) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-fc-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-fc-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
