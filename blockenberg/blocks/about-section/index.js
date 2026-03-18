( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    /* ── lazy typography helpers ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    Object.defineProperty(window, '__bkAS_tvf', { get: function () { delete window.__bkAS_tvf; return (window.__bkAS_tvf = window.bkbgTypoCssVars || function () { return {}; }); } });
    function getTypoCssVars(a) {
        var o = {};
        Object.assign(o, window.__bkAS_tvf(a.headingTypo || {}, '--bkas-hd-'));
        Object.assign(o, window.__bkAS_tvf(a.bodyTypo || {}, '--bkas-bd-'));
        Object.assign(o, window.__bkAS_tvf(a.labelTypo || {}, '--bkas-lb-'));
        Object.assign(o, window.__bkAS_tvf(a.statValueTypo || {}, '--bkas-sv-'));
        Object.assign(o, window.__bkAS_tvf(a.statLabelTypo || {}, '--bkas-sl-'));
        return o;
    }

    registerBlockType('blockenberg/about-section', {
        title: __('About Section', 'blockenberg'),
        icon: 'admin-home',
        description: __('Ready-made About Us section with split image/video + text layout, optional company stats row, badge label, CTA buttons, and full background/color controls.', 'blockenberg'),
        category: 'bkbg-business',
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function updateStat(idx, key, val) {
                var next = attr.stats.map(function (s, i) {
                    return i === idx ? Object.assign({}, s, { [key]: val }) : s;
                });
                setAttr({ stats: next });
            }

            function addStat() {
                setAttr({ stats: attr.stats.concat([{ value: '100+', label: 'New stat' }]) });
            }

            function removeStat(idx) {
                setAttr({ stats: attr.stats.filter(function (_, i) { return i !== idx; }) });
            }

            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(attr);
                return { className: 'bkbg-about-section-editor', style: s };
            })());

            var previewStyle = {
                background: attr.bgColor,
                padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px',
                fontFamily: 'inherit'
            };
            var innerStyle = {
                maxWidth: attr.maxWidth + 'px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: attr.colGap + 'px',
                alignItems: attr.verticalAlign
            };
            var imgCol = { order: attr.imageLayout === 'left' ? 0 : 1 };
            var txtCol = { order: attr.imageLayout === 'left' ? 1 : 0 };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Label', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showLabel, onChange: function (v) { setAttr({ showLabel: v }); } }),
                        el(ToggleControl, { label: __('Show Stats Row', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showStats, onChange: function (v) { setAttr({ showStats: v }); } }),
                        el(ToggleControl, { label: __('Show Primary CTA', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCta, onChange: function (v) { setAttr({ showCta: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); } }),
                        attr.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); } }),
                        attr.showCta && el(SelectControl, { label: __('CTA Style', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ctaStyle,
                            options: [{ label: 'Filled', value: 'filled' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }],
                            onChange: function (v) { setAttr({ ctaStyle: v }); } }),
                        el(ToggleControl, { label: __('Show Second CTA', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCta2, onChange: function (v) { setAttr({ showCta2: v }); } }),
                        attr.showCta2 && el(TextControl, { label: __('CTA 2 Label', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.cta2Label, onChange: function (v) { setAttr({ cta2Label: v }); } }),
                        attr.showCta2 && el(TextControl, { label: __('CTA 2 URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.cta2Url, onChange: function (v) { setAttr({ cta2Url: v }); } }),
                        el(ToggleControl, { label: __('Show Signature', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showSignature, onChange: function (v) { setAttr({ showSignature: v }); } }),
                        attr.showSignature && el(TextControl, { label: __('Signature / Author', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.signatureName, onChange: function (v) { setAttr({ signatureName: v }); } })
                    ),
                    el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                                allowedTypes: ['image'],
                                value: attr.imageId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        attr.imageUrl && el('img', { src: attr.imageUrl, style: { width: '100%', borderRadius: 8, marginBottom: 8 } }),
                                        el(Button, { onClick: r.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.imageUrl ? __('Change Image', 'blockenberg') : __('Select Image', 'blockenberg')),
                                        attr.imageUrl && el(Button, { onClick: function () { setAttr({ imageUrl: '', imageId: 0 }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true, style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        ),
                        el(SelectControl, { label: __('Image Side', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.imageLayout,
                            options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }],
                            onChange: function (v) { setAttr({ imageLayout: v }); } }),
                        el(SelectControl, { label: __('Image Shape', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.imageStyle,
                            options: [{ label: 'Rounded', value: 'rounded' }, { label: 'Square', value: 'square' }, { label: 'Circle', value: 'circle' }, { label: 'Clipped', value: 'clipped' }],
                            onChange: function (v) { setAttr({ imageStyle: v }); } }),
                        el(ToggleControl, { label: __('Image Shadow', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.imageShadow, onChange: function (v) { setAttr({ imageShadow: v }); } })
                    ),
                    attr.showStats && el(PanelBody, { title: __('Stats', 'blockenberg'), initialOpen: false },
                        attr.stats.map(function (s, i) {
                            return el('div', { key: i, style: { borderLeft: '3px solid #7c3aed', paddingLeft: 8, marginBottom: 12 } },
                                el(TextControl, { label: __('Value', 'blockenberg') + ' ' + (i + 1), __nextHasNoMarginBottom: true, value: s.value, onChange: function (v) { updateStat(i, 'value', v); } }),
                                el(TextControl, { label: __('Label', 'blockenberg') + ' ' + (i + 1), __nextHasNoMarginBottom: true, value: s.label, onChange: function (v) { updateStat(i, 'label', v); } }),
                                attr.stats.length > 1 && el(Button, { onClick: function () { removeStat(i); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addStat, variant: 'secondary', __nextHasNoMarginBottom: true }, __('+ Add Stat', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Vertical Align', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.verticalAlign,
                            options: [{ label: 'Center', value: 'center' }, { label: 'Top', value: 'start' }, { label: 'Bottom', value: 'end' }],
                            onChange: function (v) { setAttr({ verticalAlign: v }); } }),
                        el(RangeControl, { label: __('Column Gap (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.colGap, min: 16, max: 128, onChange: function (v) { setAttr({ colGap: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 600, max: 1600, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Heading', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        _tc() && el(_tc(), { label: __('Body Text', 'blockenberg'), value: attr.bodyTypo || {}, onChange: function (v) { setAttr({ bodyTypo: v }); } }),
                        _tc() && el(_tc(), { label: __('Label', 'blockenberg'), value: attr.labelTypo || {}, onChange: function (v) { setAttr({ labelTypo: v }); } }),
                        _tc() && el(_tc(), { label: __('Stat Value', 'blockenberg'), value: attr.statValueTypo || {}, onChange: function (v) { setAttr({ statValueTypo: v }); } }),
                        _tc() && el(_tc(), { label: __('Stat Label', 'blockenberg'), value: attr.statLabelTypo || {}, onChange: function (v) { setAttr({ statLabelTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,        onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); },        label: __('Background', 'blockenberg') },
                            { value: attr.accentColor,    onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); },    label: __('Accent', 'blockenberg') },
                            { value: attr.headingColor,   onChange: function (v) { setAttr({ headingColor: v || '#111827' }); },   label: __('Heading', 'blockenberg') },
                            { value: attr.textColor,      onChange: function (v) { setAttr({ textColor: v || '#6b7280' }); },      label: __('Body Text', 'blockenberg') },
                            { value: attr.statValueColor, onChange: function (v) { setAttr({ statValueColor: v || '#111827' }); }, label: __('Stat Value', 'blockenberg') },
                            { value: attr.statLabelColor, onChange: function (v) { setAttr({ statLabelColor: v || '#6b7280' }); }, label: __('Stat Label', 'blockenberg') },
                            { value: attr.ctaBg,          onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); },          label: __('CTA Background', 'blockenberg') },
                            { value: attr.ctaColor,       onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); },       label: __('CTA Text', 'blockenberg') },
                            { value: attr.labelBg,        onChange: function (v) { setAttr({ labelBg: v || '#ede9fe' }); },        label: __('Label Background', 'blockenberg') },
                            { value: attr.labelColor,     onChange: function (v) { setAttr({ labelColor: v || '#7c3aed' }); },     label: __('Label Text', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: previewStyle },
                        el('div', { style: innerStyle },
                            el('div', { className: 'bkbg-as-image-col', style: imgCol },
                                attr.imageUrl
                                    ? el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: { width: '100%', display: 'block', borderRadius: attr.imageStyle === 'rounded' ? 16 : attr.imageStyle === 'circle' ? '50%' : 0, boxShadow: attr.imageShadow ? '0 20px 60px rgba(0,0,0,.15)' : 'none' } })
                                    : el('div', { style: { background: '#e5e7eb', borderRadius: 16, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 } }, __('Select an image in the panel', 'blockenberg'))
                            ),
                            el('div', { className: 'bkbg-as-text-col', style: Object.assign({}, txtCol, { display: 'flex', flexDirection: 'column', gap: 24 }) },
                                attr.showLabel && el('span', { className: 'bkbg-as-label', style: { background: attr.labelBg, color: attr.labelColor, alignSelf: 'flex-start' } }, attr.label),
                                el(RichText, { tagName: 'h2', className: 'bkbg-as-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, style: { color: attr.headingColor, margin: 0 }, placeholder: __('Heading…', 'blockenberg') }),
                                el(RichText, { tagName: 'p', className: 'bkbg-as-body', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, style: { color: attr.textColor, margin: 0 }, placeholder: __('Describe your company or story…', 'blockenberg') }),
                                attr.showStats && attr.stats.length > 0 && el('div', { style: { display: 'flex', gap: 32, flexWrap: 'wrap', paddingTop: 8 } },
                                    attr.stats.map(function (s, i) {
                                        return el('div', { key: i },
                                            el('div', { className: 'bkbg-as-stat-value', style: { color: attr.statValueColor } }, s.value),
                                            el('div', { className: 'bkbg-as-stat-label', style: { color: attr.statLabelColor } }, s.label)
                                        );
                                    })
                                ),
                                (attr.showCta || attr.showCta2 || attr.showSignature) && el('div', { style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 } },
                                    attr.showCta && el('a', { href: '#', style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, background: attr.ctaStyle === 'filled' ? attr.ctaBg : 'transparent', color: attr.ctaStyle === 'filled' ? attr.ctaColor : attr.accentColor, border: attr.ctaStyle === 'filled' ? 'none' : '2px solid ' + attr.accentColor, textDecoration: 'none' } }, attr.ctaLabel, el('span', null, '→')),
                                    attr.showCta2 && el('a', { href: '#', style: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, background: 'transparent', color: attr.headingColor, textDecoration: 'none' } }, attr.cta2Label),
                                    attr.showSignature && el('span', { style: { fontSize: 14, color: attr.textColor, fontStyle: 'italic' } }, '— ' + attr.signatureName)
                                )
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var sv = getTypoCssVars(attr);
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-about-section-app', 'data-opts': JSON.stringify(attr), style: sv })
            );
        }
    });
}() );
