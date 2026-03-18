( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    registerBlockType('blockenberg/onboarding-steps', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function updateStep(idx, key, val) {
                var steps = (attr.steps || []).map(function (s, i) {
                    return i === idx ? Object.assign({}, s, {[key]: val}) : s;
                });
                setAttr({ steps: steps });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Layout', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Horizontal (side by side)', value: 'horizontal' },
                            { label: 'Vertical (stacked)', value: 'vertical' },
                            { label: 'Cards Grid', value: 'cards' },
                            { label: 'Numbered List', value: 'numbered' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Connector Style', 'blockenberg'),
                        value: attr.connectorStyle,
                        options: [
                            { label: 'Line', value: 'line' },
                            { label: 'Dots', value: 'dots' },
                            { label: 'None', value: 'none' }
                        ],
                        onChange: function (v) { setAttr({ connectorStyle: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Step Numbers', 'blockenberg'),
                        checked: attr.showNumbers,
                        onChange: function (v) { setAttr({ showNumbers: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Step Icons', 'blockenberg'),
                        checked: attr.showIcons,
                        onChange: function (v) { setAttr({ showIcons: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Per-Step CTAs', 'blockenberg'),
                        checked: attr.showStepCtas,
                        onChange: function (v) { setAttr({ showStepCtas: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth, min: 600, max: 1400,
                        onChange: function (v) { setAttr({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingTop: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingBottom: v }); }
                    })
                ),
                el(PanelBody, { title: __('Main CTA', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Main CTA Button', 'blockenberg'),
                        checked: attr.showMainCta,
                        onChange: function (v) { setAttr({ showMainCta: v }); }
                    }),
                    attr.showMainCta && el(TextControl, { __nextHasNoMarginBottom: true, label: __('CTA Label', 'blockenberg'), value: attr.mainCtaLabel, onChange: function (v) { setAttr({ mainCtaLabel: v }); } }),
                    attr.showMainCta && el(TextControl, { __nextHasNoMarginBottom: true, label: __('CTA URL', 'blockenberg'), value: attr.mainCtaUrl, onChange: function (v) { setAttr({ mainCtaUrl: v }); } })
                ),
                el(PanelBody, { title: __('Steps', 'blockenberg'), initialOpen: false },
                    (attr.steps || []).map(function (step, idx) {
                        return el(PanelBody, { key: idx, title: (step.number + '. ' + step.title), initialOpen: false },
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Number', 'blockenberg'), value: step.number, onChange: function (v) { updateStep(idx, 'number', v); } }),
                            el(IP().IconPickerControl, { iconType: step.iconType || 'custom-char', customChar: step.icon || '', dashicon: step.iconDashicon || '', imageUrl: step.iconImageUrl || '', onChangeType: function (v) { updateStep(idx, 'iconType', v); }, onChangeChar: function (v) { updateStep(idx, 'icon', v); }, onChangeDashicon: function (v) { updateStep(idx, 'iconDashicon', v); }, onChangeImageUrl: function (v) { updateStep(idx, 'iconImageUrl', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Title', 'blockenberg'), value: step.title, onChange: function (v) { updateStep(idx, 'title', v); } }),
                            el(TextareaControl, { __nextHasNoMarginBottom: true, label: __('Description', 'blockenberg'), value: step.description, onChange: function (v) { updateStep(idx, 'description', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('CTA Label (optional)', 'blockenberg'), value: step.ctaLabel, onChange: function (v) { updateStep(idx, 'ctaLabel', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('CTA URL', 'blockenberg'), value: step.ctaUrl, onChange: function (v) { updateStep(idx, 'ctaUrl', v); } }),
                            el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ steps: (attr.steps || []).filter(function (_, i) { return i !== idx; }) }); } }, __('Remove Step', 'blockenberg'))
                        );
                    }),
                    el(Button, { isPrimary: true, variant: 'primary', onClick: function () {
                        var n = (attr.steps || []).length + 1;
                        setAttr({ steps: (attr.steps || []).concat([{ number: String(n).padStart(2, '0'), icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'Step ' + n, description: 'Step description goes here.', ctaLabel: '', ctaUrl: '' }]) });
                    }}, __('+ Add Step', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TypoCtrl && el(TypoCtrl, { label: __('Heading', 'blockenberg'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    TypoCtrl && el(TypoCtrl, { label: __('Subtext', 'blockenberg'), value: attr.subtextTypo, onChange: function (v) { setAttr({ subtextTypo: v }); } }),
                    TypoCtrl && el(TypoCtrl, { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                    TypoCtrl && el(TypoCtrl, { label: __('Step Title', 'blockenberg'), value: attr.stepTitleTypo, onChange: function (v) { setAttr({ stepTitleTypo: v }); } }),
                    TypoCtrl && el(TypoCtrl, { label: __('Step Description', 'blockenberg'), value: attr.stepDescTypo, onChange: function (v) { setAttr({ stepDescTypo: v }); } })
                ),
                                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                        { label: __('Step Number BG', 'blockenberg'), value: attr.stepNumBg, onChange: function (v) { setAttr({ stepNumBg: v || '#6366f1' }); } },
                        { label: __('Step Number Text', 'blockenberg'), value: attr.stepNumColor, onChange: function (v) { setAttr({ stepNumColor: v || '#ffffff' }); } },
                        { label: __('Step Title', 'blockenberg'), value: attr.stepTitleColor, onChange: function (v) { setAttr({ stepTitleColor: v || '#111827' }); } },
                        { label: __('Step Description', 'blockenberg'), value: attr.stepDescColor, onChange: function (v) { setAttr({ stepDescColor: v || '#6b7280' }); } },
                        { label: __('Connector', 'blockenberg'), value: attr.connectorColor, onChange: function (v) { setAttr({ connectorColor: v || '#e5e7eb' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#f9fafb' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#6366f1' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } }
                    ]
                })
            );

            var TypoCtrl = getTypoControl();
            var blockProps = (function () {
                var bp = useBlockProps({ className: 'bkbg-obs-wrap bkbg-obs-editor' });
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(attr.headingTypo, '--bkbg-obs-hd-'));
                    Object.assign(s, _tvf(attr.subtextTypo, '--bkbg-obs-st-'));
                    Object.assign(s, _tvf(attr.eyebrowTypo, '--bkbg-obs-ey-'));
                    Object.assign(s, _tvf(attr.stepTitleTypo, '--bkbg-obs-stt-'));
                    Object.assign(s, _tvf(attr.stepDescTypo, '--bkbg-obs-sd-'));
                }
                if (Object.keys(s).length) bp.style = Object.assign(s, bp.style || {});
                return bp;
            }());
            var colCount = (attr.steps || []).length || 3;
            var isHoriz = attr.layout === 'horizontal';

            return el('div', blockProps,
                inspector,
                el('div', { style: { background: attr.bgColor, padding: '40px', borderRadius: '8px', fontFamily: 'sans-serif' } },
                    el('div', { style: { textAlign: 'center', marginBottom: '48px' } },
                        el(RichText, { tagName: 'p', className: 'bkbg-obs-eyebrow', value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, placeholder: __('Eyebrow…', 'blockenberg'), style: { color: attr.eyebrowColor, margin: '0 0 8px' } }),
                        el(RichText, { tagName: 'h2', className: 'bkbg-obs-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg'), style: { color: attr.headingColor, margin: '0 0 12px' } }),
                        el(RichText, { tagName: 'p', className: 'bkbg-obs-sub', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg'), style: { color: attr.subColor, maxWidth: '600px', margin: '0 auto' } })
                    ),
                    el('div', { style: { display: isHoriz ? 'grid' : 'block', gridTemplateColumns: isHoriz ? ('repeat(' + colCount + ',1fr)') : undefined, gap: '24px', position: 'relative' } },
                        (attr.steps || []).map(function (step, i) {
                            return el('div', { key: i, style: { background: attr.cardBg, borderRadius: '12px', padding: '28px 24px', textAlign: isHoriz ? 'center' : 'left', marginBottom: isHoriz ? 0 : '24px', display: !isHoriz ? 'flex' : 'block', alignItems: 'flex-start', gap: '16px' } },
                                el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: isHoriz ? 'center' : 'flex-start', gap: '12px', marginBottom: '12px' } },
                                    attr.showNumbers && el('span', { style: { background: attr.stepNumBg, color: attr.stepNumColor, borderRadius: '50%', width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 } }, step.number),
                                    attr.showIcons && el('span', { style: { fontSize: '28px' } }, (step.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : step.icon)
                                ),
                                el('div', null,
                                    el('div', { className: 'bkbg-obs-step-title', style: { color: attr.stepTitleColor, marginBottom: '8px' } }, step.title),
                                    el('div', { className: 'bkbg-obs-step-desc', style: { color: attr.stepDescColor } }, step.description)
                                )
                            );
                        })
                    ),
                    attr.showMainCta && el('div', { style: { textAlign: 'center', marginTop: '40px' } },
                        el('a', { href: attr.mainCtaUrl, style: { display: 'inline-block', background: attr.ctaBg, color: attr.ctaColor, padding: '14px 36px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '16px' } }, attr.mainCtaLabel)
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-obs-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
