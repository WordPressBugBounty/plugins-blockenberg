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
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'headingTypo',   attrs, '--bkvms-hd-');
        _tvf(v, 'eyebrowTypo',   attrs, '--bkvms-ey-');
        _tvf(v, 'statementTypo', attrs, '--bkvms-sm-');
        _tvf(v, 'valueTitleTypo', attrs, '--bkvms-vt-');
        _tvf(v, 'valueDescTypo',  attrs, '--bkvms-vd-');
        return v;
    }
    var IP = function () { return window.bkbgIconPicker; };

    registerBlockType('blockenberg/vision-mission', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            function updateValue(idx, key, val) {
                setAttributes({ values: a.values.map(function (v, i) { return i === idx ? Object.assign({}, v, { [key]: val }) : v; }) });
            }
            function addValue() {
                setAttributes({ values: a.values.concat([{ icon: '⭐', title: 'New Value', description: 'Describe this value…' }]) });
            }
            function removeValue(idx) {
                setAttributes({ values: a.values.filter(function (_, i) { return i !== idx; }) });
            }

            var wrapStyle = getTypoCssVars(a);
            wrapStyle.backgroundColor = a.bgColor;
            wrapStyle.paddingTop = a.paddingTop + 'px';
            wrapStyle.paddingBottom = a.paddingBottom + 'px';
            var innerStyle = { maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' };

            var isSplit = a.layout === 'split';

            function missionBlock() {
                return a.showMission && el('div', { style: { background: a.missionBg, borderLeft: '4px solid ' + a.missionBorder, borderRadius: '0 12px 12px 0', padding: '28px 32px' } },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 } },
                        el('span', { className: 'bkbg-vms-statement-icon', style: { fontSize: 24 } }, (a.missionIconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(a.missionIconType, a.missionIcon, a.missionIconDashicon, a.missionIconImageUrl, a.missionIconDashiconColor) : a.missionIcon),
                        el('span', { className: 'bkbg-vms-statement-label', style: { color: a.missionLabelColor } }, a.missionLabel)
                    ),
                    el(RichText, { tagName: 'p', className: 'bkbg-vms-statement-text', value: a.missionText, onChange: function (v) { setAttributes({ missionText: v }); }, placeholder: __('Mission statement…', 'blockenberg'), style: { color: a.missionTextColor, margin: 0 } })
                );
            }

            function visionBlock() {
                return a.showVision && el('div', { style: { background: a.visionBg, borderLeft: '4px solid ' + a.visionBorder, borderRadius: '0 12px 12px 0', padding: '28px 32px' } },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 } },
                        el('span', { className: 'bkbg-vms-statement-icon', style: { fontSize: 24 } }, (a.visionIconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(a.visionIconType, a.visionIcon, a.visionIconDashicon, a.visionIconImageUrl, a.visionIconDashiconColor) : a.visionIcon),
                        el('span', { className: 'bkbg-vms-statement-label', style: { color: a.visionLabelColor } }, a.visionLabel)
                    ),
                    el(RichText, { tagName: 'p', className: 'bkbg-vms-statement-text', value: a.visionText, onChange: function (v) { setAttributes({ visionText: v }); }, placeholder: __('Vision statement…', 'blockenberg'), style: { color: a.visionTextColor, margin: 0 } })
                );
            }

            return el('div', useBlockProps({ className: 'bkbg-vms-wrap', style: wrapStyle }),
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: a.showEyebrow, onChange: function (v) { setAttributes({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        a.showEyebrow && el(TextControl, { label: __('Eyebrow Text', 'blockenberg'), value: a.eyebrow, onChange: function (v) { setAttributes({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: a.showHeading, onChange: function (v) { setAttributes({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Mission', 'blockenberg'), checked: a.showMission, onChange: function (v) { setAttributes({ showMission: v }); }, __nextHasNoMarginBottom: true }),
                        a.showMission && el(TextControl, { label: __('Mission Label', 'blockenberg'), value: a.missionLabel, onChange: function (v) { setAttributes({ missionLabel: v }); }, __nextHasNoMarginBottom: true }),
                        a.showMission && el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'missionIcon', typeAttr: 'missionIconType', dashiconAttr: 'missionIconDashicon', imageUrlAttr: 'missionIconImageUrl', colorAttr: 'missionIconDashiconColor' })),
                        el(ToggleControl, { label: __('Show Vision', 'blockenberg'), checked: a.showVision, onChange: function (v) { setAttributes({ showVision: v }); }, __nextHasNoMarginBottom: true }),
                        a.showVision && el(TextControl, { label: __('Vision Label', 'blockenberg'), value: a.visionLabel, onChange: function (v) { setAttributes({ visionLabel: v }); }, __nextHasNoMarginBottom: true }),
                        a.showVision && el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'visionIcon', typeAttr: 'visionIconType', dashiconAttr: 'visionIconDashicon', imageUrlAttr: 'visionIconImageUrl', colorAttr: 'visionIconDashiconColor' })),
                        el(ToggleControl, { label: __('Show Values', 'blockenberg'), checked: a.showValues, onChange: function (v) { setAttributes({ showValues: v }); }, __nextHasNoMarginBottom: true }),
                        a.showValues && el(TextControl, { label: __('Values Section Label', 'blockenberg'), value: a.valuesLabel, onChange: function (v) { setAttributes({ valuesLabel: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Mission/Vision Top', value: 'mission-top' }, { label: 'Split (mission|vision + values)', value: 'split' }, { label: 'Cards (all)', value: 'cards' }], onChange: function (v) { setAttributes({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Values Columns', 'blockenberg'), value: a.valuesColumns, min: 1, max: 4, onChange: function (v) { setAttributes({ valuesColumns: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 600, max: 1400, onChange: function (v) { setAttributes({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Heading', 'blockenberg'), 'headingTypo', a, setAttributes),
                        getTypoControl(__('Eyebrow', 'blockenberg'), 'eyebrowTypo', a, setAttributes),
                        getTypoControl(__('Statement Text', 'blockenberg'), 'statementTypo', a, setAttributes),
                        getTypoControl(__('Value Title', 'blockenberg'), 'valueTitleTypo', a, setAttributes),
                        getTypoControl(__('Value Description', 'blockenberg'), 'valueDescTypo', a, setAttributes)
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                            { label: __('Heading', 'blockenberg'), value: a.headingColor, onChange: function (v) { setAttributes({ headingColor: v || '#111827' }); } },
                            { label: __('Mission BG', 'blockenberg'), value: a.missionBg, onChange: function (v) { setAttributes({ missionBg: v || '#f8f5ff' }); } },
                            { label: __('Mission Accent', 'blockenberg'), value: a.missionBorder, onChange: function (v) { setAttributes({ missionBorder: v || '#7c3aed' }); } },
                            { label: __('Vision BG', 'blockenberg'), value: a.visionBg, onChange: function (v) { setAttributes({ visionBg: v || '#eff6ff' }); } },
                            { label: __('Vision Accent', 'blockenberg'), value: a.visionBorder, onChange: function (v) { setAttributes({ visionBorder: v || '#3b82f6' }); } },
                            { label: __('Value Card BG', 'blockenberg'), value: a.valueCardBg, onChange: function (v) { setAttributes({ valueCardBg: v || '#f9fafb' }); } },
                            { label: __('Value Title', 'blockenberg'), value: a.valueTitleColor, onChange: function (v) { setAttributes({ valueTitleColor: v || '#111827' }); } }
                        ]
                    })
                ),

                el('div', { style: innerStyle },
                    // Header
                    el('div', { style: { textAlign: 'center', marginBottom: 48 } },
                        a.showEyebrow && el('span', { className: 'bkbg-vms-eyebrow', style: { display: 'inline-block', background: a.eyebrowBg, color: a.eyebrowColor, padding: '5px 14px', borderRadius: 999, marginBottom: 16 } }, a.eyebrow),
                        a.showHeading && el(RichText, { tagName: 'h2', className: 'bkbg-vms-heading', value: a.heading, onChange: function (v) { setAttributes({ heading: v }); }, placeholder: __('Heading…', 'blockenberg'), style: { color: a.headingColor, margin: 0 } })
                    ),

                    // Mission / Vision
                    isSplit
                        ? el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 } }, missionBlock(), visionBlock())
                        : el('div', { style: { display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 48 } }, missionBlock(), visionBlock()),

                    // Values
                    a.showValues && el('div', null,
                        el('h3', { className: 'bkbg-vms-values-heading', style: { color: a.valuesLabelColor, margin: '0 0 28px' } }, a.valuesLabel),
                        el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.valuesColumns + ', 1fr)', gap: 20 } },
                            a.values.map(function (v, idx) {
                                var _iType = v.iconType || 'custom-char';
                                var _iconContent = (_iType !== 'custom-char' && IP()) ? IP().buildEditorIcon(_iType, v.icon, v.iconDashicon, v.iconImageUrl, v.iconDashiconColor) : v.icon;
                                return el('div', { key: idx, style: { background: a.valueCardBg, border: '1px solid ' + a.valueCardBorder, borderRadius: 12, padding: '24px 20px', position: 'relative' } },
                                    el(Button, { isDestructive: true, size: 'small', onClick: function () { removeValue(idx); }, style: { position: 'absolute', top: 10, right: 10, fontSize: 10 } }, '✕'),
                                    el(IP().IconPickerControl, IP().iconPickerProps(v, function(patch) {
                                        setAttributes({ values: a.values.map(function(val, i) { return i === idx ? Object.assign({}, val, patch) : val; }) });
                                    }, { label: __('Icon', 'blockenberg'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                                    el('span', { style: { fontSize: 28, display: 'block', marginBottom: 12 } }, _iconContent),
                                    el(RichText, { tagName: 'h4', className: 'bkbg-vms-value-title', value: v.title, onChange: function (val) { updateValue(idx, 'title', val); }, placeholder: __('Value title…', 'blockenberg'), style: { color: a.valueTitleColor, margin: '0 0 8px' } }),
                                    el(RichText, { tagName: 'p', className: 'bkbg-vms-value-desc', value: v.description, onChange: function (val) { updateValue(idx, 'description', val); }, placeholder: __('Value description…', 'blockenberg'), style: { color: a.valueDescColor, margin: 0 } })
                                );
                            }),
                            el('div', { onClick: addValue, style: { border: '2px dashed #d1d5db', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                                el('span', { style: { fontSize: 13, color: '#9ca3af' } }, '+ Add Value')
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            var a = props.attributes;
            var s = getTypoCssVars(a);
            s.backgroundColor = a.bgColor;
            s.paddingTop = a.paddingTop + 'px';
            s.paddingBottom = a.paddingBottom + 'px';
            return el('div', useBlockProps.save({ style: s }),
                el('div', { className: 'bkbg-vms-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
