( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var IP = function () { return window.bkbgIconPicker; };

    var _dmsTC, _dmsTV;
    function _tc() { return _dmsTC || (_dmsTC = window.bkbgTypographyControl); }
    function _tv(typo, prefix) { return (_dmsTV || (_dmsTV = window.bkbgTypoCssVars))(typo, prefix); }

    function setItem(items, idx, key, val, setAttr, attrKey) {
        var next = items.map(function (it, i) { return i === idx ? Object.assign({}, it, { [key]: val }) : it; });
        setAttr({ [attrKey]: next });
    }
    function addItem(items, template, setAttr, attrKey) { setAttr({ [attrKey]: items.concat([template]) }); }
    function removeItem(items, idx, setAttr, attrKey) { setAttr({ [attrKey]: items.filter(function (_, i) { return i !== idx; }) }); }

    registerBlockType('blockenberg/demo-section', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var isSplit = attr.layout === 'split-left' || attr.layout === 'split-right';

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,
                    /* Content */
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Badge Text', 'blockenberg'), value: attr.badge, onChange: function (v) { setAttr({ badge: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Heading', 'blockenberg'), value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Subtext', 'blockenberg'), value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    /* CTA */
                    el(PanelBody, { title: __('CTA', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('CTA Mode', 'blockenberg'), value: attr.ctaMode, options: [{ label: 'Button', value: 'button' }, { label: 'Email Form', value: 'form' }], onChange: function (v) { setAttr({ ctaMode: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'button' && el(TextControl, { label: __('Primary Button Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'button' && el(TextControl, { label: __('Primary Button URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'button' && el(ToggleControl, { label: __('Show Secondary Button', 'blockenberg'), checked: attr.showCtaSec, onChange: function (v) { setAttr({ showCtaSec: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'button' && attr.showCtaSec && el(TextControl, { label: __('Secondary Label', 'blockenberg'), value: attr.ctaSecLabel, onChange: function (v) { setAttr({ ctaSecLabel: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'button' && attr.showCtaSec && el(TextControl, { label: __('Secondary URL', 'blockenberg'), value: attr.ctaSecUrl, onChange: function (v) { setAttr({ ctaSecUrl: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'form' && el(TextControl, { label: __('Form Placeholder', 'blockenberg'), value: attr.formPlaceholder, onChange: function (v) { setAttr({ formPlaceholder: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'form' && el(TextControl, { label: __('Submit Label', 'blockenberg'), value: attr.formSubmitLabel, onChange: function (v) { setAttr({ formSubmitLabel: v }); }, __nextHasNoMarginBottom: true }),
                        attr.ctaMode === 'form' && el(TextControl, { label: __('Form Action URL', 'blockenberg'), value: attr.formAction, onChange: function (v) { setAttr({ formAction: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    /* Trust items */
                    el(PanelBody, { title: __('Trust Signals', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Trust Signals', 'blockenberg'), checked: attr.showTrust, onChange: function (v) { setAttr({ showTrust: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showTrust && attr.trustItems.map(function (item, idx) {
                            return el(PanelBody, { key: idx, title: (item.text || 'Trust ' + (idx + 1)), initialOpen: false },
                                el(IP().IconPickerControl, {
                                    iconType: item.iconType, customChar: item.icon, dashicon: item.iconDashicon, imageUrl: item.iconImageUrl,
                                    onChangeType: function (v) { setItem(attr.trustItems, idx, 'iconType', v, setAttr, 'trustItems'); },
                                    onChangeChar: function (v) { setItem(attr.trustItems, idx, 'icon', v, setAttr, 'trustItems'); },
                                    onChangeDashicon: function (v) { setItem(attr.trustItems, idx, 'iconDashicon', v, setAttr, 'trustItems'); },
                                    onChangeImageUrl: function (v) { setItem(attr.trustItems, idx, 'iconImageUrl', v, setAttr, 'trustItems'); }
                                }),
                                el(TextControl, { label: __('Text', 'blockenberg'), value: item.text, onChange: function (v) { setItem(attr.trustItems, idx, 'text', v, setAttr, 'trustItems'); }, __nextHasNoMarginBottom: true }),
                                el(Button, { onClick: function () { removeItem(attr.trustItems, idx, setAttr, 'trustItems'); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                            );
                        }),
                        attr.showTrust && el(Button, { onClick: function () { addItem(attr.trustItems, { icon: '✅', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', text: 'New signal' }, setAttr, 'trustItems'); }, variant: 'secondary', style: { marginTop: 8 } }, __('+ Add Trust Signal', 'blockenberg'))
                    ),
                    /* Stats */
                    el(PanelBody, { title: __('Social Proof Stats', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Stats', 'blockenberg'), checked: attr.showStats, onChange: function (v) { setAttr({ showStats: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showStats && attr.socialStats.map(function (stat, idx) {
                            return el(PanelBody, { key: idx, title: (stat.number + ' ' + stat.label), initialOpen: false },
                                el(TextControl, { label: __('Number', 'blockenberg'), value: stat.number, onChange: function (v) { setItem(attr.socialStats, idx, 'number', v, setAttr, 'socialStats'); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Label', 'blockenberg'), value: stat.label, onChange: function (v) { setItem(attr.socialStats, idx, 'label', v, setAttr, 'socialStats'); }, __nextHasNoMarginBottom: true }),
                                el(Button, { onClick: function () { removeItem(attr.socialStats, idx, setAttr, 'socialStats'); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                            );
                        }),
                        attr.showStats && el(Button, { onClick: function () { addItem(attr.socialStats, { number: '0', label: 'Label' }, setAttr, 'socialStats'); }, variant: 'secondary', style: { marginTop: 8 } }, __('+ Add Stat', 'blockenberg'))
                    ),
                    /* Image */
                    el(PanelBody, { title: __('Product Image', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Image', 'blockenberg'), checked: attr.showImage, onChange: function (v) { setAttr({ showImage: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showImage && el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ imageUrl: m.url, imageId: m.id }); },
                                allowedTypes: ['image'], value: attr.imageId,
                                render: function (rp) {
                                    return el('div', null,
                                        attr.imageUrl && el('img', { src: attr.imageUrl, style: { maxWidth: '100%', borderRadius: 6, marginBottom: 6 } }),
                                        el(Button, { onClick: rp.open, variant: 'secondary', size: 'small' }, attr.imageUrl ? __('Change Image', 'blockenberg') : __('Upload Image', 'blockenberg')),
                                        attr.imageUrl && el(Button, { onClick: function () { setAttr({ imageUrl: '', imageId: 0 }); }, variant: 'link', isDestructive: true, size: 'small', style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        )
                    ),
                    /* Layout */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: attr.layout, options: [{ label: 'Centered', value: 'centered' }, { label: 'Split – Text Left', value: 'split-left' }, { label: 'Split – Text Right', value: 'split-right' }], onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1600, step: 20, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); } },
                            { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#f8fafc' }); } },
                            { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#94a3b8' }); } },
                            { label: __('Badge Background', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { setAttr({ badgeBg: v || 'rgba(99,102,241,0.15)' }); } },
                            { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { setAttr({ badgeColor: v || '#a5b4fc' }); } },
                            { label: __('CTA Button', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#6366f1' }); } },
                            { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } },
                            { label: __('Secondary Button Text', 'blockenberg'), value: attr.ctaSecColor, onChange: function (v) { setAttr({ ctaSecColor: v || '#a5b4fc' }); } },
                            { label: __('Trust Text', 'blockenberg'), value: attr.trustColor, onChange: function (v) { setAttr({ trustColor: v || '#94a3b8' }); } },
                            { label: __('Stat Number', 'blockenberg'), value: attr.statNumColor, onChange: function (v) { setAttr({ statNumColor: v || '#f8fafc' }); } },
                            { label: __('Stat Label', 'blockenberg'), value: attr.statLabelColor, onChange: function (v) { setAttr({ statLabelColor: v || '#64748b' }); } },
                            { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6366f1' }); } }
                        ]
                    }),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Badge font size (px)', 'blockenberg'), value: attr.badgeFontSize, min: 10, max: 20, onChange: function (v) { setAttr({ badgeFontSize: v }); }, __nextHasNoMarginBottom: true }),
                        _tc() && el(_tc(), { label: __('Heading'), typo: attr.typoHeading || {}, onChange: function (v) { setAttr({ typoHeading: v }); }, defaultSize: attr.headingFontSize || 36 }),
                        _tc() && el(_tc(), { label: __('Subtext'), typo: attr.typoSubtext || {}, onChange: function (v) { setAttr({ typoSubtext: v }); }, defaultSize: attr.subtextFontSize || 18 }),
                        el(RangeControl, { label: __('CTA button font size (px)', 'blockenberg'), value: attr.ctaFontSize, min: 11, max: 24, onChange: function (v) { setAttr({ ctaFontSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Stat number font size (px)', 'blockenberg'), value: attr.statNumFontSize, min: 16, max: 48, onChange: function (v) { setAttr({ statNumFontSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Stat label font size (px)', 'blockenberg'), value: attr.statLabelFontSize, min: 10, max: 18, onChange: function (v) { setAttr({ statLabelFontSize: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),
                /* Editor Preview */
                el('div', Object.assign(useBlockProps({ className: 'bkbg-dms-editor', style: Object.assign({ background: attr.bgColor, '--bkbg-dms-hdg-fs': (attr.headingFontSize || 36) + 'px', '--bkbg-dms-sub-fs': (attr.subtextFontSize || 18) + 'px' }, _tv(attr.typoHeading || {}, '--bkbg-dms-hdg-'), _tv(attr.typoSubtext || {}, '--bkbg-dms-sub-')) })),
                    el('div', { className: 'bkbg-dms-inner layout-' + attr.layout, style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: attr.paddingTop + 'px 24px ' + attr.paddingBottom + 'px' } },
                        /* Text column */
                        el('div', { className: 'bkbg-dms-text' },
                            attr.badge && el('div', { className: 'bkbg-dms-badge', style: { background: attr.badgeBg, color: attr.badgeColor, fontSize: (attr.badgeFontSize || 13) + 'px' } }, attr.badge),
                            el(RichText, { tagName: 'h2', className: 'bkbg-dms-heading', style: { color: attr.headingColor }, value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', className: 'bkbg-dms-sub', style: { color: attr.subColor }, value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg') }),
                            /* CTA */
                            el('div', { className: 'bkbg-dms-cta-row' },
                                attr.ctaMode === 'button'
                                    ? el(wp.element.Fragment, null,
                                        el('a', { className: 'bkbg-dms-btn-primary', style: { background: attr.ctaBg, color: attr.ctaColor, fontSize: (attr.ctaFontSize || 16) + 'px' }, href: '#' }, attr.ctaLabel),
                                        attr.showCtaSec && el('a', { className: 'bkbg-dms-btn-sec', style: { color: attr.ctaSecColor, border: '1px solid ' + attr.ctaSecColor + '88', fontSize: (attr.ctaFontSize || 16) + 'px' }, href: '#' }, attr.ctaSecLabel)
                                    )
                                    : el('div', { className: 'bkbg-dms-form-preview' },
                                        el('div', { className: 'bkbg-dms-input-fake', style: { color: attr.trustColor } }, attr.formPlaceholder),
                                        el('div', { className: 'bkbg-dms-submit-fake', style: { background: attr.ctaBg, color: attr.ctaColor } }, attr.formSubmitLabel)
                                    )
                            ),
                            /* Trust */
                            attr.showTrust && el('div', { className: 'bkbg-dms-trust' },
                                attr.trustItems.map(function (item, idx) {
                                    return el('span', { key: idx, className: 'bkbg-dms-trust-item', style: { color: attr.trustColor } },
                                        el('span', { className: 'bkbg-dms-trust-icon' },
                                            (item.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon
                                        ),
                                        item.text
                                    );
                                })
                            ),
                            /* Stats */
                            attr.showStats && el('div', { className: 'bkbg-dms-stats' },
                                attr.socialStats.map(function (stat, idx) {
                                    return el('div', { key: idx, className: 'bkbg-dms-stat' },
                                        el('div', { className: 'bkbg-dms-stat-num', style: { color: attr.statNumColor, fontSize: (attr.statNumFontSize || 28) + 'px' } }, stat.number),
                                        el('div', { className: 'bkbg-dms-stat-label', style: { color: attr.statLabelColor, fontSize: (attr.statLabelFontSize || 13) + 'px' } }, stat.label)
                                    );
                                })
                            )
                        ),
                        /* Image column */
                        attr.showImage && isSplit && el('div', { className: 'bkbg-dms-image-col', style: { background: attr.imageBg } },
                            attr.imageUrl
                                ? el('img', { src: attr.imageUrl, className: 'bkbg-dms-screenshot', alt: '' })
                                : el('div', { className: 'bkbg-dms-img-placeholder', style: { background: attr.accentColor + '22', color: attr.accentColor } }, '🖥')
                        ),
                        /* Centered image (below content) */
                        attr.showImage && !isSplit && el('div', { className: 'bkbg-dms-image-centered', style: { background: attr.imageBg } },
                            attr.imageUrl
                                ? el('img', { src: attr.imageUrl, className: 'bkbg-dms-screenshot', alt: '' })
                                : el('div', { className: 'bkbg-dms-img-placeholder', style: { background: attr.accentColor + '22', color: attr.accentColor } }, '🖥')
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-dms-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
