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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    function setInteg(arr, idx, key, val, setAttr) {
        var next = arr.map(function (it, i) { return i === idx ? Object.assign({}, it, { [key]: val }) : it; });
        setAttr({ integrations: next });
    }

    var LOGO_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function logoLetter(name) { return (name || '?').charAt(0).toUpperCase(); }

    function renderCard(integ, o) {
        return el('div', { className: 'bkbg-igw-card', style: { background: o.cardBg, borderColor: o.cardBorder } },
            integ.logoUrl
                ? el('img', { src: integ.logoUrl, className: 'bkbg-igw-logo-img', alt: integ.name })
                : el('div', { className: 'bkbg-igw-logo-fallback', style: { background: o.logoBg, color: o.logoColor } }, logoLetter(integ.name)),
            el('div', { className: 'bkbg-igw-card-body' },
                el('div', { className: 'bkbg-igw-integ-name', style: { color: o.nameColor } }, integ.name),
                o.showDesc && integ.description && el('div', { className: 'bkbg-igw-integ-desc', style: { color: o.descColor } }, integ.description)
            )
        );
    }

    registerBlockType('blockenberg/integration-wall', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            /* Derive categories for filter preview */
            var cats = ['All'];
            attr.integrations.forEach(function (it) { if (it.category && cats.indexOf(it.category) === -1) cats.push(it.category); });

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Heading', 'blockenberg'), value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Subtext', 'blockenberg'), value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Card Style', 'blockenberg'), value: attr.cardStyle, options: [{ label: 'Card with description', value: 'card' }, { label: 'Logo & Name only', value: 'compact' }, { label: 'Pill tags', value: 'pill' }], onChange: function (v) { setAttr({ cardStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: attr.columns, min: 2, max: 8, onChange: function (v) { setAttr({ columns: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Category Filter', 'blockenberg'), checked: attr.showFilter, onChange: function (v) { setAttr({ showFilter: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Description', 'blockenberg'), checked: attr.showDesc, onChange: function (v) { setAttr({ showDesc: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Browse All CTA', 'blockenberg'), checked: attr.showCta, onChange: function (v) { setAttr({ showCta: v }); }, __nextHasNoMarginBottom: true }),
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
                            { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#f8fafc' }); } },
                            { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                            { label: __('Integration Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { setAttr({ nameColor: v || '#111827' }); } },
                            { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); } },
                            { label: __('Logo Background', 'blockenberg'), value: attr.logoBg, onChange: function (v) { setAttr({ logoBg: v || '#e0e7ff' }); } },
                            { label: __('Logo Letter', 'blockenberg'), value: attr.logoColor, onChange: function (v) { setAttr({ logoColor: v || '#4338ca' }); } },
                            { label: __('Filter Background', 'blockenberg'), value: attr.filterBg, onChange: function (v) { setAttr({ filterBg: v || '#f1f5f9' }); } },
                            { label: __('Active Filter', 'blockenberg'), value: attr.filterActiveBg, onChange: function (v) { setAttr({ filterActiveBg: v || '#6366f1' }); } },
                            { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6366f1' }); } }
                        ]
                    }),
                    /* Integration management */
                    el(PanelBody, { title: __('Integrations', 'blockenberg'), initialOpen: false },
                        attr.integrations.map(function (integ, idx) {
                            return el(PanelBody, { key: idx, title: (integ.name || 'Integration ' + (idx + 1)), initialOpen: false },
                                el(TextControl, { label: __('Name', 'blockenberg'), value: integ.name, onChange: function (v) { setInteg(attr.integrations, idx, 'name', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Category', 'blockenberg'), value: integ.category, onChange: function (v) { setInteg(attr.integrations, idx, 'category', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Description', 'blockenberg'), value: integ.description, onChange: function (v) { setInteg(attr.integrations, idx, 'description', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Link URL', 'blockenberg'), value: integ.url, onChange: function (v) { setInteg(attr.integrations, idx, 'url', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el('p', { style: { marginBottom: 4, fontSize: 11, textTransform: 'uppercase', color: '#888' } }, __('Logo Image', 'blockenberg')),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (m) { setInteg(attr.integrations, idx, 'logoUrl', m.url, setAttr); },
                                        allowedTypes: ['image'], value: integ.logoUrl,
                                        render: function (rp) {
                                            return el('div', null,
                                                integ.logoUrl && el('img', { src: integ.logoUrl, style: { maxHeight: 36, marginBottom: 6, display: 'block' } }),
                                                el(Button, { onClick: rp.open, variant: 'secondary', size: 'small' }, integ.logoUrl ? __('Change', 'blockenberg') : __('Upload Logo', 'blockenberg')),
                                                integ.logoUrl && el(Button, { onClick: function () { setInteg(attr.integrations, idx, 'logoUrl', '', setAttr); }, variant: 'link', isDestructive: true, size: 'small', style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                el(Button, { onClick: function () { setAttr({ integrations: attr.integrations.filter(function (_, i) { return i !== idx; }) }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove Integration', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: function () { setAttr({ integrations: attr.integrations.concat([{ name: 'New App', category: 'Category', logoUrl: '', url: '#', description: 'Short description' }]) }); }, variant: 'secondary', style: { marginTop: 8 } }, __('+ Add Integration', 'blockenberg'))
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: 'Heading', value: attr.headingTypo, onChange: function(v){ setAttr({ headingTypo: v }); } }),
                        el(getTypographyControl(), { label: 'Subtext', value: attr.subtextTypo, onChange: function(v){ setAttr({ subtextTypo: v }); } }),
                        el(getTypographyControl(), { label: 'Item Name', value: attr.nameTypo, onChange: function(v){ setAttr({ nameTypo: v }); } })
                    )
                ),
                /* Editor Preview */
                el('div', Object.assign(useBlockProps({ className: 'bkbg-igw-editor', style: (function(){ var _tv = getTypoCssVars(); var s = { background: attr.bgColor }; Object.assign(s, _tv(attr.headingTypo, '--bkbg-igw-h-')); Object.assign(s, _tv(attr.subtextTypo, '--bkbg-igw-st-')); Object.assign(s, _tv(attr.nameTypo, '--bkbg-igw-nm-')); return s; })() })),
                    el('div', { className: 'bkbg-igw-inner', style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: attr.paddingTop + 'px 24px ' + attr.paddingBottom + 'px' } },
                        el('div', { className: 'bkbg-igw-header', style: { textAlign: 'center', marginBottom: 40 } },
                            el(RichText, { tagName: 'p', className: 'bkbg-igw-eyebrow', style: { color: attr.eyebrowColor }, value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, placeholder: __('Eyebrow…', 'blockenberg') }),
                            el(RichText, { tagName: 'h2', className: 'bkbg-igw-heading', style: { color: attr.headingColor }, value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', className: 'bkbg-igw-sub', style: { color: attr.subColor }, value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg') })
                        ),
                        attr.showFilter && el('div', { className: 'bkbg-igw-filter' },
                            cats.map(function (cat, idx) {
                                return el('button', { key: idx, className: 'bkbg-igw-pill', style: idx === 0 ? { background: attr.filterActiveBg, color: attr.filterActiveColor } : { background: attr.filterBg, color: attr.filterColor } }, cat);
                            })
                        ),
                        el('div', { className: 'bkbg-igw-grid card-style-' + attr.cardStyle, style: { gridTemplateColumns: 'repeat(' + attr.columns + ',1fr)' } },
                            attr.integrations.map(function (integ, idx) { return el(wp.element.Fragment, { key: idx }, renderCard(integ, attr)); })
                        ),
                        attr.showCta && el('div', { className: 'bkbg-igw-cta-row' },
                            el('a', { href: '#', className: 'bkbg-igw-cta', style: { color: attr.accentColor } }, attr.ctaLabel)
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-igw-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
