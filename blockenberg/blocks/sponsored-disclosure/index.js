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

    var DISCLOSURE_TYPES = [
        { value: 'sponsored',        label: '📢 Sponsored' },
        { value: 'paid-partnership', label: '🤝 Paid Partnership' },
        { value: 'advertisement',    label: '📰 Advertisement' },
        { value: 'native-ad',        label: '🔗 Native Ad' },
        { value: 'affiliate',        label: '💰 Affiliate' },
        { value: 'custom',           label: '✏️  Custom Label' }
    ];

    var DEFAULT_LABELS = {
        'sponsored':        'Sponsored',
        'paid-partnership': 'Paid Partnership',
        'advertisement':    'Advertisement',
        'native-ad':        'Native Ad',
        'affiliate':        'Affiliate'
    };

    function getLabel(attr) {
        if (attr.disclosureType === 'custom') return attr.customLabel || 'Custom';
        return DEFAULT_LABELS[attr.disclosureType] || 'Sponsored';
    }

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var _IP;
    function IP() { return _IP || (_IP = window.bkbgIconPicker); }

    function buildWrapStyle(a) {
        var tv = getTypoCssVars();
        var s = {
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            textAlign: a.align || 'left',
            '--bksd-lb-sz': a.fontSize + 'px',
            '--bksd-lb-w': String(a.fontWeight || '600'),
            '--bksd-lb-lh': String(a.lineHeight || 1.5),
            '--bksd-tx-sz': a.fontSize + 'px',
            '--bksd-tx-w': String(a.fontWeight || '600'),
            '--bksd-tx-lh': String(a.lineHeight || 1.5)
        };
        Object.assign(s, tv(a.labelTypo, '--bksd-lb-'));
        Object.assign(s, tv(a.textTypo, '--bksd-tx-'));
        return s;
    }

    registerBlockType('blockenberg/sponsored-disclosure', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps({ style: buildWrapStyle(attr) });

            var label = getLabel(attr);

            var pillStyle = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
            };

            var bannerStyle = {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px'
            };

            var boxStyle = {
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 14px'
            };

            var isBanner = attr.style === 'banner';
            var isBox = attr.style === 'box';
            var isPill = attr.style === 'pill';

            var containerStyle = Object.assign(
                {},
                isPill ? pillStyle : isBanner ? bannerStyle : boxStyle,
                {
                    background: attr.bgColor,
                    border: '1px solid ' + attr.borderColor,
                    borderRadius: (isPill ? attr.borderRadius : isBox ? 8 : 4) + 'px',
                    color: attr.textColor
                }
            );

            var labelChip = el('span', { className: 'bkbg-spd-label-chip', style: { background: attr.labelBg, color: attr.labelColor, padding: isPill ? '2px 8px' : '1px 8px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' } },
                attr.showIcon && IP().buildEditorIcon(attr.iconType, attr.icon, attr.iconDashicon, attr.iconImageUrl, { dashiconColor: attr.iconDashiconColor, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontSize: 'inherit' } }),
                label
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Disclosure', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Type', 'blockenberg'), value: attr.disclosureType, __nextHasNoMarginBottom: true,
                        options: DISCLOSURE_TYPES,
                        onChange: function (v) { set({ disclosureType: v }); }
                    }),
                    attr.disclosureType === 'custom' && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Custom Label', 'blockenberg'), value: attr.customLabel, placeholder: __('Your label…', 'blockenberg'), __nextHasNoMarginBottom: true, onChange: function (v) { set({ customLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIcon: v }); } })
                    ),
                    attr.showIcon && el('div', { style: { marginTop: '8px' } },
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, set))
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Extra Text', 'blockenberg'), checked: attr.showText, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showText: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Pill (compact)', value: 'pill' }, { label: 'Banner (full bar)', value: 'banner' }, { label: 'Box (with text)', value: 'box' }],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Alignment', 'blockenberg'), value: attr.align, __nextHasNoMarginBottom: true,
                            options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }],
                            onChange: function (v) { set({ align: v }); }
                        })
                    ),
                    isPill && el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 999, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 60, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 60, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Label', 'blockenberg'), value: attr.labelTypo, onChange: function (v) { set({ labelTypo: v }); } }),
                    getTypoControl()({ label: __('Text', 'blockenberg'), value: attr.textTypo, onChange: function (v) { set({ textTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Container Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#fff7ed' }); } },
                        { label: __('Container Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#fed7aa' }); } },
                        { label: __('Text', 'blockenberg'), value: attr.textColor, onChange: function (v) { set({ textColor: v || '#9a3412' }); } },
                        { label: __('Label Background', 'blockenberg'), value: attr.labelBg, onChange: function (v) { set({ labelBg: v || '#f97316' }); } },
                        { label: __('Label Text', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#ffffff' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: containerStyle },
                    labelChip,
                    attr.showText && el(RichText, {
                        tagName: 'span',
                        className: 'bkbg-spd-text',
                        value: attr.text,
                        allowedFormats: ['core/italic', 'core/link'],
                        placeholder: __('Additional disclosure text…', 'blockenberg'),
                        style: { color: attr.textColor },
                        onChange: function (v) { set({ text: v }); }
                    })
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-spd-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
