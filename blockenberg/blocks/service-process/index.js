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
    function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function setPhase(phases, idx, key, val, setAttr) {
        var next = phases.map(function (p, i) { return i === idx ? Object.assign({}, p, { [key]: val }) : p; });
        setAttr({ phases: next });
    }

    function renderPhaseCard(phase, idx, attr, isSplit) {
        return el('div', { className: 'bkbg-spr-phase layout-' + attr.layout },
            /* Connector (before the card, except first) */
            idx > 0 && attr.layout === 'horizontal' && el('div', { className: 'bkbg-spr-connector connector-' + attr.connectorStyle, style: { borderColor: attr.connectorColor, background: attr.connectorColor } }),
            /* Number badge */
            el('div', { className: 'bkbg-spr-phase-inner', style: { background: attr.cardBg, borderColor: attr.cardBorder } },
                el('div', { className: 'bkbg-spr-phase-top' },
                    attr.showNumbers && el('div', { className: 'bkbg-spr-num', style: { background: attr.phaseNumBg, color: attr.phaseNumColor } }, String(idx + 1).padStart(2, '0')),
                    el('div', { className: 'bkbg-spr-icon' }, IP().buildEditorIcon(phase.iconType || 'custom-char', phase.icon, phase.iconDashicon, phase.iconImageUrl, phase.iconDashiconColor))
                ),
                el('div', { className: 'bkbg-spr-phase-name', style: { color: attr.phaseNameColor } }, phase.name),
                el('div', { className: 'bkbg-spr-phase-desc', style: { color: attr.phaseDescColor } }, phase.description),
                attr.showDeliverables && phase.deliverables && phase.deliverables.length > 0 && el('ul', { className: 'bkbg-spr-deliverables' },
                    phase.deliverables.map(function (d, di) {
                        return el('li', { key: di, className: 'bkbg-spr-deliverable', style: { color: attr.deliverableColor } },
                            el('span', { className: 'bkbg-spr-check', style: { color: attr.accentColor } }, '✓'),
                            d
                        );
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/service-process', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Heading', 'blockenberg'), value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Subtext', 'blockenberg'), value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: attr.layout, options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical Timeline', value: 'vertical' }, { label: 'Cards Grid', value: 'cards' }], onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        attr.layout !== 'cards' && el(SelectControl, { label: __('Connector Style', 'blockenberg'), value: attr.connectorStyle, options: [{ label: 'Solid Line', value: 'line' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'None', value: 'none' }], onChange: function (v) { setAttr({ connectorStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Phase Numbers', 'blockenberg'), checked: attr.showNumbers, onChange: function (v) { setAttr({ showNumbers: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Deliverables', 'blockenberg'), checked: attr.showDeliverables, onChange: function (v) { setAttr({ showDeliverables: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show CTA', 'blockenberg'), checked: attr.showCta, onChange: function (v) { setAttr({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showCta && el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1600, step: 20, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                            { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                            { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                            { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                            { label: __('Phase Number Bg', 'blockenberg'), value: attr.phaseNumBg, onChange: function (v) { setAttr({ phaseNumBg: v || '#6366f1' }); } },
                            { label: __('Phase Number Text', 'blockenberg'), value: attr.phaseNumColor, onChange: function (v) { setAttr({ phaseNumColor: v || '#ffffff' }); } },
                            { label: __('Phase Name', 'blockenberg'), value: attr.phaseNameColor, onChange: function (v) { setAttr({ phaseNameColor: v || '#111827' }); } },
                            { label: __('Phase Description', 'blockenberg'), value: attr.phaseDescColor, onChange: function (v) { setAttr({ phaseDescColor: v || '#6b7280' }); } },
                            { label: __('Deliverable', 'blockenberg'), value: attr.deliverableColor, onChange: function (v) { setAttr({ deliverableColor: v || '#374151' }); } },
                            { label: __('Connector', 'blockenberg'), value: attr.connectorColor, onChange: function (v) { setAttr({ connectorColor: v || '#c7d2fe' }); } },
                            { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#f8fafc' }); } },
                            { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                            { label: __('CTA Button', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#6366f1' }); } },
                            { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } }
                        ]
                    }),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTC(), { label: __('Heading', 'blockenberg'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        el(getTC(), { label: __('Phase Name', 'blockenberg'), value: attr.phaseNameTypo, onChange: function (v) { setAttr({ phaseNameTypo: v }); } }),
                        el(getTC(), { label: __('Phase Description', 'blockenberg'), value: attr.phaseDescTypo, onChange: function (v) { setAttr({ phaseDescTypo: v }); } })
                    ),
                    /* Phase management */
                    el(PanelBody, { title: __('Phases', 'blockenberg'), initialOpen: false },
                        attr.phases.map(function (phase, idx) {
                            return el(PanelBody, { key: idx, title: (phase.name || 'Phase ' + (idx + 1)), initialOpen: false },
                                el(IP().IconPickerControl, IP().iconPickerProps({ icon: phase.icon, iconType: phase.iconType, iconDashicon: phase.iconDashicon, iconImageUrl: phase.iconImageUrl }, function (patch) { var next = attr.phases.map(function (p, i) { if (i !== idx) return p; return Object.assign({}, p, patch); }); setAttr({ phases: next }); }, { label: __('Icon', 'blockenberg'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                                el(TextControl, { label: __('Phase Name', 'blockenberg'), value: phase.name, onChange: function (v) { setPhase(attr.phases, idx, 'name', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextareaControl, { label: __('Description', 'blockenberg'), value: phase.description, onChange: function (v) { setPhase(attr.phases, idx, 'description', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextareaControl, { label: __('Deliverables (one per line)', 'blockenberg'), value: (phase.deliverables || []).join('\n'), onChange: function (v) { setPhase(attr.phases, idx, 'deliverables', v.split('\n').filter(Boolean), setAttr); }, __nextHasNoMarginBottom: true }),
                                el(Button, { onClick: function () { setAttr({ phases: attr.phases.filter(function (_, i) { return i !== idx; }) }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove Phase', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: function () { setAttr({ phases: attr.phases.concat([{ icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', name: 'New Phase', description: 'Phase description here.', deliverables: ['Key deliverable'] }]) }); }, variant: 'secondary', style: { marginTop: 8 } }, __('+ Add Phase', 'blockenberg'))
                    )
                ),
                /* Editor Preview */
                el('div', Object.assign(useBlockProps((function () {
                    var _tv = getTV();
                    var s = { background: attr.bgColor };
                    Object.assign(s, _tv(attr.headingTypo, '--bkspr-ht-'));
                    Object.assign(s, _tv(attr.phaseNameTypo, '--bkspr-pnt-'));
                    Object.assign(s, _tv(attr.phaseDescTypo, '--bkspr-pdt-'));
                    return { className: 'bkbg-spr-editor', style: s };
                })())),
                    el('div', { className: 'bkbg-spr-inner', style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: attr.paddingTop + 'px 24px ' + attr.paddingBottom + 'px' } },
                        el('div', { className: 'bkbg-spr-header', style: { textAlign: 'center', marginBottom: 48 } },
                            el(RichText, { tagName: 'p', className: 'bkbg-spr-eyebrow', style: { color: attr.eyebrowColor }, value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, placeholder: __('Eyebrow…', 'blockenberg') }),
                            el(RichText, { tagName: 'h2', className: 'bkbg-spr-heading', style: { color: attr.headingColor }, value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', className: 'bkbg-spr-sub', style: { color: attr.subColor }, value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg') })
                        ),
                        el('div', { className: 'bkbg-spr-phases layout-' + attr.layout },
                            attr.phases.map(function (phase, idx) { return renderPhaseCard(phase, idx, attr, false); })
                        ),
                        attr.showCta && el('div', { className: 'bkbg-spr-cta-row' },
                            el('a', { href: '#', className: 'bkbg-spr-cta', style: { background: attr.ctaBg, color: attr.ctaColor } }, attr.ctaLabel)
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-spr-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
