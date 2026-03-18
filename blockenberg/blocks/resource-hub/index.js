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

    var typeIcons = { guide: '📖', video: '🎬', template: '📋', tool: '🛠', podcast: '🎙', other: '📌' };

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/resource-hub', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var TC = getTypoControl();

            function updateResource(idx, key, val) {
                var resources = (attr.resources || []).map(function (r, i) {
                    return i === idx ? Object.assign({}, r, {[key]: val}) : r;
                });
                setAttr({ resources: resources });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Layout', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Grid', value: 'grid' },
                            { label: 'List', value: 'list' },
                            { label: 'Featured First (large + grid)', value: 'featured' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Columns', 'blockenberg'), value: attr.columns, min: 2, max: 4, onChange: function (v) { setAttr({ columns: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Category Filter', 'blockenberg'), checked: attr.showFilter, onChange: function (v) { setAttr({ showFilter: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Resource Type Badge', 'blockenberg'), checked: attr.showType, onChange: function (v) { setAttr({ showType: v }); } }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: __('Card CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1600, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TC && el(TC, { label: __('Heading', 'blockenberg'), value: attr.headingTypo || {}, onChange: function(v) { setAttr({ headingTypo: v }); } }),
                    TC && el(TC, { label: __('Subtext', 'blockenberg'), value: attr.subtextTypo || {}, onChange: function(v) { setAttr({ subtextTypo: v }); } })
                ),
                el(PanelBody, { title: __('Resources', 'blockenberg'), initialOpen: false },
                    (attr.resources || []).map(function (r, idx) {
                        return el(PanelBody, { key: idx, title: (r.title || 'Resource ' + (idx + 1)), initialOpen: false },
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Title', 'blockenberg'), value: r.title, onChange: function (v) { updateResource(idx, 'title', v); } }),
                            el(TextareaControl, { __nextHasNoMarginBottom: true, label: __('Description', 'blockenberg'), value: r.description, onChange: function (v) { updateResource(idx, 'description', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Category', 'blockenberg'), value: r.category, onChange: function (v) { updateResource(idx, 'category', v); } }),
                            el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Type', 'blockenberg'), value: r.type, options: [{ label: 'Guide', value: 'guide' }, { label: 'Video', value: 'video' }, { label: 'Template', value: 'template' }, { label: 'Tool', value: 'tool' }, { label: 'Podcast', value: 'podcast' }, { label: 'Other', value: 'other' }], onChange: function (v) { updateResource(idx, 'type', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('URL', 'blockenberg'), value: r.url, onChange: function (v) { updateResource(idx, 'url', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Image URL (optional)', 'blockenberg'), value: r.imageUrl, onChange: function (v) { updateResource(idx, 'imageUrl', v); } }),
                            el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Featured (large card)', 'blockenberg'), checked: !!r.featured, onChange: function (v) { updateResource(idx, 'featured', v); } }),
                            el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ resources: (attr.resources || []).filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                        );
                    }),
                    el(Button, { isPrimary: true, variant: 'primary', onClick: function () { setAttr({ resources: (attr.resources || []).concat([{ title: 'New Resource', description: 'Description', category: 'Guides', type: 'guide', imageUrl: '', url: '#', featured: false }]) }); } }, __('+ Add Resource', 'blockenberg'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                        { label: __('Card BG', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#f8fafc' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Filter Pill BG', 'blockenberg'), value: attr.filterBg, onChange: function (v) { setAttr({ filterBg: v || '#f1f5f9' }); } },
                        { label: __('Filter Active BG', 'blockenberg'), value: attr.filterActiveBg, onChange: function (v) { setAttr({ filterActiveBg: v || '#6366f1' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#6366f1' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } }
                    ]
                })
            );

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.headingTypo || {}, '--bkrh-ht-'));
                    Object.assign(s, _tvFn(attr.subtextTypo || {}, '--bkrh-st-'));
                }
                return { className: 'bkbg-rhb-editor', style: s };
            })());

            /* Unique categories for filter preview */
            var cats = ['All'].concat((attr.resources || []).reduce(function (acc, r) {
                if (r.category && acc.indexOf(r.category) === -1) acc.push(r.category);
                return acc;
            }, []));

            return el('div', blockProps,
                inspector,
                el('div', { style: { background: attr.bgColor, padding: '40px', borderRadius: '8px', fontFamily: 'sans-serif' } },
                    el('div', { style: { textAlign: 'center', marginBottom: '40px' } },
                        el(RichText, { tagName: 'p', value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, placeholder: __('Eyebrow…', 'blockenberg'), style: { color: attr.eyebrowColor, fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' } }),
                        el(RichText, { tagName: 'h2', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg'), className: 'bkbg-rhb-heading', style: { color: attr.headingColor, margin: '0 0 12px' } }),
                        el(RichText, { tagName: 'p', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg'), className: 'bkbg-rhb-sub', style: { color: attr.subColor, maxWidth: '600px', margin: '0 auto' } })
                    ),
                    /* Filter pills */
                    attr.showFilter && el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' } },
                        cats.map(function (cat, i) {
                            var isAll = cat === 'All';
                            return el('span', { key: i, style: { background: isAll ? attr.filterActiveBg : attr.filterBg, color: isAll ? attr.filterActiveColor : attr.filterColor, borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' } }, cat);
                        })
                    ),
                    /* Resource cards */
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ',1fr)', gap: '20px' } },
                        (attr.resources || []).map(function (r, i) {
                            return el('div', { key: i, style: { background: attr.cardBg, border: '1px solid ' + attr.cardBorder, borderRadius: '12px', overflow: 'hidden' } },
                                r.imageUrl && el('img', { src: r.imageUrl, style: { width: '100%', height: '140px', objectFit: 'cover', display: 'block' }, alt: '' }),
                                !r.imageUrl && el('div', { style: { height: '100px', background: 'linear-gradient(135deg,' + attr.accentColor + '22,' + attr.accentColor + '44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' } }, typeIcons[r.type] || '📌'),
                                el('div', { style: { padding: '16px' } },
                                    attr.showType && el('span', { style: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: attr.accentColor, letterSpacing: '0.08em' } }, (typeIcons[r.type] || '') + ' ' + (r.type || 'resource')),
                                    el('div', { style: { color: attr.titleColor, fontWeight: 700, fontSize: '15px', margin: '6px 0 4px' } }, r.title),
                                    el('div', { style: { color: attr.descColor, fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' } }, r.description),
                                    el('a', { href: r.url, style: { display: 'inline-block', background: attr.ctaBg, color: attr.ctaColor, borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' } }, attr.ctaLabel)
                                )
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-rhb-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
