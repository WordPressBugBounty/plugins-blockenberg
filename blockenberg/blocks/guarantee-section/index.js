( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    /* ── typography lazy-getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars || function () { return {}; }; }

    var IP = function () { return window.bkbgIconPicker; };

    registerBlockType('blockenberg/guarantee-section', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-gs-editor', style: Object.assign({}, _tv()(attr.typoHeading, '--bkbg-guar-hl-'), _tv()(attr.typoBody, '--bkbg-guar-bd-')) });

            function updateBullet(i, val) {
                var next = attr.bullets.map(function (b, j) { return j === i ? val : b; });
                setAttr({ bullets: next });
            }

            var previewStyle = { background: attr.bgColor, padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px' };
            var innerStyle = { maxWidth: attr.maxWidth + 'px', margin: '0 auto', display: 'flex', flexDirection: attr.layout === 'centered' ? 'column' : 'row', alignItems: 'center', gap: 64, justifyContent: 'center' };

            var sealStyle = {
                width: attr.sealSize + 'px', height: attr.sealSize + 'px',
                borderRadius: '50%', background: attr.sealBg,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: attr.sealColor, flexShrink: 0, boxShadow: '0 0 0 12px rgba(124,58,237,.15)',
                textAlign: 'center', gap: 4
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Seal', 'blockenberg'), initialOpen: true },
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'sealIcon', typeAttr: 'sealIconType', dashiconAttr: 'sealIconDashicon', imageUrlAttr: 'sealIconImageUrl', colorAttr: 'sealIconDashiconColor' })),
                        el(TextControl, { label: __('Large Label (e.g. 30-Day)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.sealLabel, onChange: function (v) { setAttr({ sealLabel: v }); } }),
                        el(TextControl, { label: __('Sub Label (2 lines)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.sealSub, onChange: function (v) { setAttr({ sealSub: v }); } }),
                        el(RangeControl, { label: __('Seal Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.sealSize, min: 100, max: 320, onChange: function (v) { setAttr({ sealSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Bullet Points', 'blockenberg'), initialOpen: false },
                        attr.bullets.map(function (b, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' } },
                                el(TextControl, { label: null, __nextHasNoMarginBottom: true, value: b, onChange: function (v) { updateBullet(i, v); }, style: { flex: 1 } }),
                                attr.bullets.length > 1 && el(Button, { onClick: function () { setAttr({ bullets: attr.bullets.filter(function (_, j) { return j !== i; }) }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, '✕')
                            );
                        }),
                        el(Button, { onClick: function () { setAttr({ bullets: attr.bullets.concat(['New guarantee point']) }); }, variant: 'secondary', __nextHasNoMarginBottom: true }, __('+ Add Point', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('CTA', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show CTA', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCta, onChange: function (v) { setAttr({ showCta: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); } })
                    ),
                    el(PanelBody, { title: __('Layout & Sizing', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.layout,
                            options: [{ label: 'Split (seal + text)', value: 'split' }, { label: 'Centered', value: 'centered' }],
                            onChange: function (v) { setAttr({ layout: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 400, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label:__('Heading','blockenberg'), value:attr.typoHeading, onChange:function(v){ setAttr({typoHeading:v}); } }),
                        _tc() && el(_tc(), { label:__('Body','blockenberg'), value:attr.typoBody, onChange:function(v){ setAttr({typoBody:v}); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,      onChange: function (v) { setAttr({ bgColor: v || '#f5f3ff' }); },      label: __('Background', 'blockenberg') },
                            { value: attr.sealBg,       onChange: function (v) { setAttr({ sealBg: v || '#7c3aed' }); },       label: __('Seal Background', 'blockenberg') },
                            { value: attr.sealColor,    onChange: function (v) { setAttr({ sealColor: v || '#ffffff' }); },    label: __('Seal Text', 'blockenberg') },
                            { value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); }, label: __('Heading', 'blockenberg') },
                            { value: attr.textColor,    onChange: function (v) { setAttr({ textColor: v || '#374151' }); },    label: __('Body Text', 'blockenberg') },
                            { value: attr.bulletColor,  onChange: function (v) { setAttr({ bulletColor: v || '#16a34a' }); },  label: __('Bullet Checkmark', 'blockenberg') },
                            { value: attr.ctaBg,        onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); },        label: __('CTA Background', 'blockenberg') },
                            { value: attr.ctaColor,     onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); },     label: __('CTA Text', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: previewStyle },
                        el('div', { style: innerStyle },
                            // Seal
                            el('div', { style: sealStyle },
                                el('div', { style: { fontSize: attr.sealSize * 0.2 + 'px', lineHeight: 1 }, className: 'bkbg-gs-seal-icon' }, IP().buildEditorIcon(attr.sealIconType, attr.sealIcon, attr.sealIconDashicon, attr.sealIconImageUrl, attr.sealIconDashiconColor)),
                                el('div', { style: { fontSize: attr.sealSize * 0.17 + 'px', fontWeight: 800, lineHeight: 1.1 } }, attr.sealLabel),
                                el('div', { style: { fontSize: attr.sealSize * 0.1 + 'px', lineHeight: 1.3, whiteSpace: 'pre-line', opacity: .9 } }, attr.sealSub)
                            ),
                            // Text
                            el('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 } },
                                el(RichText, { tagName: 'h2', className: 'bkbg-gs-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, style: { color: attr.headingColor, margin: 0 }, placeholder: __('Guarantee heading…', 'blockenberg') }),
                                el(RichText, { tagName: 'p', className: 'bkbg-gs-body', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, style: { color: attr.textColor, margin: 0 }, placeholder: __('Description…', 'blockenberg') }),
                                el('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 } },
                                    attr.bullets.map(function (b, i) {
                                        return el('li', { key: i, className: 'bkbg-gs-bullet', style: { display: 'flex', alignItems: 'flex-start', gap: 10, color: attr.textColor } },
                                            el('span', { className: 'bkbg-gs-check', style: { color: attr.bulletColor } }, '✓'),
                                            el('span', null, b)
                                        );
                                    })
                                ),
                                attr.showCta && el('a', { href: '#', className: 'bkbg-gs-cta', style: { background: attr.ctaBg, color: attr.ctaColor, textDecoration: 'none' } }, attr.ctaLabel, el('span', null, '→'))
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-guarantee-section-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
