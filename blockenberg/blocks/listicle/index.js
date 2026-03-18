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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var LAYOUT_OPTIONS = [
        { value: 'list',     label: 'List (one per row)' },
        { value: 'grid',     label: 'Grid (2 columns)' },
        { value: 'magazine', label: 'Magazine (alternating)' }
    ];
    var NUMBER_STYLES = [
        { value: 'badge',   label: 'Badge (filled circle)' },
        { value: 'circle',  label: 'Circle (outline)' },
        { value: 'large',   label: 'Large (background)' },
        { value: 'minimal', label: 'Minimal (just number)' }
    ];
    var RATIO_OPTIONS = [
        { value: '16:9', label: '16:9' },
        { value: '4:3',  label: '4:3' },
        { value: '1:1',  label: '1:1 Square' },
        { value: '3:4',  label: '3:4 Portrait' }
    ];

    function ratioPad(r) {
        var map = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%', '3:4': '133.333%' };
        return map[r] || '56.25%';
    }

    function emptyItem() {
        return { title: '', subtitle: '', description: '', imageUrl: '', imageId: 0, imageAlt: '', tag: '', verdict: '', rating: 5 };
    }

    function Stars(rating, color) {
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            stars.push(el('span', { key: i, style: { color: i <= rating ? color : '#d1d5db', fontSize: '14px' } }, '★'));
        }
        return el('div', { style: { display: 'flex', gap: '1px', marginTop: '4px' } }, stars);
    }

    registerBlockType('blockenberg/listicle', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var items = attr.items || [emptyItem()];

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {
                    background: attr.bgColor || undefined,
                    paddingTop: attr.paddingTop + 'px',
                    paddingBottom: attr.paddingBottom + 'px'
                };
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.headingTypo, '--bkbg-lis-h-'));
                    Object.assign(s, _tvFn(attr.titleTypo,   '--bkbg-lis-tt-'));
                    Object.assign(s, _tvFn(attr.descTypo,    '--bkbg-lis-d-'));
                }
                return { className: 'bkbg-lis-section', style: s };
            })());

            function updateItem(idx, field, val) {
                var updated = items.map(function (it, i) {
                    if (i !== idx) return it;
                    var patch = {}; patch[field] = val;
                    return Object.assign({}, it, patch);
                });
                set({ items: updated });
            }

            function numBadge(n, attr) {
                var numTxt = attr.countDown ? (items.length - n + 1) : n;
                if (attr.numberStyle === 'badge') {
                    return el('div', { style: { minWidth: '40px', height: '40px', background: attr.numberBg, color: attr.numberColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 } }, numTxt);
                } else if (attr.numberStyle === 'circle') {
                    return el('div', { style: { minWidth: '40px', height: '40px', border: '2px solid ' + attr.numberBg, color: attr.numberBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 } }, numTxt);
                } else if (attr.numberStyle === 'large') {
                    return el('div', { style: { fontWeight: 900, fontSize: '72px', lineHeight: 1, color: attr.numberBg + '22', minWidth: '70px', textAlign: 'center', flexShrink: 0, fontFamily: 'Georgia, serif', userSelect: 'none' } }, numTxt);
                } else {
                    return el('div', { style: { fontWeight: 900, fontSize: '20px', color: attr.numberBg, minWidth: '32px', flexShrink: 0 } }, '#' + numTxt);
                }
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('List Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: attr.layout, options: LAYOUT_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ layout: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(SelectControl, { label: __('Number Style', 'blockenberg'), value: attr.numberStyle, options: NUMBER_STYLES, __nextHasNoMarginBottom: true, onChange: function (v) { set({ numberStyle: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Numbers', 'blockenberg'), checked: attr.showNumbers, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNumbers: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Count Down (10, 9, 8…)', 'blockenberg'), checked: attr.countDown, __nextHasNoMarginBottom: true, onChange: function (v) { set({ countDown: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Images', 'blockenberg'), checked: attr.showImages, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showImages: v }); } })
                    ),
                    attr.showImages && el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, { label: __('Image Ratio', 'blockenberg'), value: attr.imageRatio, options: RATIO_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ imageRatio: v }); } })
                    ),
                    attr.showImages && el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Image Radius', 'blockenberg'), value: attr.imageRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ imageRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Tags', 'blockenberg'), checked: attr.showTags, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTags: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Verdict Badge', 'blockenberg'), checked: attr.showVerdicts, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showVerdicts: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Star Rating', 'blockenberg'), checked: attr.showRatings, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showRatings: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Section Heading', 'blockenberg'), checked: attr.showHeading, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHeading: v }); } }),
                    attr.showHeading && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Heading Text', 'blockenberg'), value: attr.heading, __nextHasNoMarginBottom: true, onChange: function (v) { set({ heading: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Style & Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Card Radius', 'blockenberg'), value: attr.cardRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cardRadius: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Gap Between Items', 'blockenberg'), value: attr.gap, min: 4, max: 80, __nextHasNoMarginBottom: true, onChange: function (v) { set({ gap: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e5e7eb' }); } },
                        { label: __('Number Background', 'blockenberg'), value: attr.numberBg, onChange: function (v) { set({ numberBg: v || '#6366f1' }); } },
                        { label: __('Number Text', 'blockenberg'), value: attr.numberColor, onChange: function (v) { set({ numberColor: v || '#ffffff' }); } },
                        { label: __('Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); } },
                        { label: __('Subtitle', 'blockenberg'), value: attr.subtitleColor, onChange: function (v) { set({ subtitleColor: v || '#6b7280' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { set({ descColor: v || '#374151' }); } },
                        { label: __('Tag Background', 'blockenberg'), value: attr.tagBg, onChange: function (v) { set({ tagBg: v || '#ede9fe' }); } },
                        { label: __('Tag Text', 'blockenberg'), value: attr.tagColor, onChange: function (v) { set({ tagColor: v || '#6366f1' }); } },
                        { label: __('Verdict Background', 'blockenberg'), value: attr.verdictBg, onChange: function (v) { set({ verdictBg: v || '#dcfce7' }); } },
                        { label: __('Verdict Text', 'blockenberg'), value: attr.verdictColor, onChange: function (v) { set({ verdictColor: v || '#15803d' }); } },
                        { label: __('Stars', 'blockenberg'), value: attr.starColor, onChange: function (v) { set({ starColor: v || '#f59e0b' }); } }
                    ]
                }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Heading', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Item Title', 'blockenberg'), value: attr.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Description', 'blockenberg'), value: attr.descTypo || {}, onChange: function (v) { set({ descTypo: v }); } })
                    ),

            );

            var wrapStyle = {};
            if (attr.layout === 'grid') { wrapStyle = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: attr.gap + 'px' }; }
            else { wrapStyle = { display: 'flex', flexDirection: 'column', gap: attr.gap + 'px' }; }

            return el('div', blockProps,
                controls,
                attr.showHeading && attr.heading && el('h2', { className: 'bkbg-lis-heading', style: { color: attr.titleColor } }, attr.heading),
                el('div', { style: wrapStyle },
                    items.map(function (item, idx) {
                        var cardinal = attr.countDown ? (items.length - idx) : (idx + 1);
                        var isEven = attr.layout === 'magazine' && idx % 2 === 1;

                        return el('div', {
                            key: idx,
                            style: {
                                background: attr.cardBg,
                                border: '1px solid ' + attr.cardBorder,
                                borderRadius: attr.cardRadius + 'px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: attr.layout === 'list' ? 'row' : 'column',
                                alignItems: attr.layout === 'list' ? 'flex-start' : undefined
                            }
                        },
                            /* image area */
                            attr.showImages && el('div', { style: { position: 'relative', flexShrink: 0, width: attr.layout === 'list' ? '220px' : '100%' } },
                                el('div', { style: { paddingBottom: attr.layout === 'list' ? '0' : ratioPad(attr.imageRatio), height: attr.layout === 'list' ? '160px' : undefined, position: 'relative', background: '#f3f4f6', overflow: 'hidden', borderRadius: attr.layout === 'list' ? attr.imageRadius + 'px 0 0 ' + attr.imageRadius + 'px' : '0' } },
                                    item.imageUrl
                                        ? el('img', { src: item.imageUrl, alt: item.imageAlt, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                                        : el(MediaUploadCheck, {},
                                            el(MediaUpload, {
                                                onSelect: function (m) { updateItem(idx, 'imageUrl', m.url); updateItem(idx, 'imageId', m.id); updateItem(idx, 'imageAlt', m.alt || ''); },
                                                allowedTypes: ['image'], value: item.imageId,
                                                render: function (r) { return el(Button, { onClick: r.open, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '13px' } }, '+ Add Image'); }
                                            })
                                        ),
                                    /* number badge overlay on image */
                                    attr.showNumbers && attr.numberStyle !== 'large' && el('div', { style: { position: 'absolute', top: '10px', left: '10px' } }, numBadge(cardinal, attr))
                                )
                            ),

                            /* content */
                            el('div', { style: { padding: '16px 20px', flex: 1 } },
                                /* number (large style) inside content */
                                attr.showNumbers && (!attr.showImages || attr.numberStyle === 'large') && el('div', { style: { marginBottom: '8px' } }, numBadge(cardinal, attr)),

                                /* number inline when no image and badge */
                                attr.showNumbers && !attr.showImages && attr.numberStyle !== 'large' && el('div', { style: { marginBottom: '10px' } }, numBadge(cardinal, attr)),

                                /* top row: tag + verdict */
                                el('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' } },
                                    attr.showTags && el(TextControl, { value: item.tag, label: '', placeholder: __('Tag…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '11px', width: '100px' }, onChange: function (v) { updateItem(idx, 'tag', v); } }),
                                    attr.showVerdicts && el(TextControl, { value: item.verdict, label: '', placeholder: __('Verdict…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '11px', width: '120px' }, onChange: function (v) { updateItem(idx, 'verdict', v); } })
                                ),

                                el(RichText, { tagName: 'h3', className: 'bkbg-lis-title', value: item.title, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Item title…', 'blockenberg'), style: { color: attr.titleColor }, onChange: function (v) { updateItem(idx, 'title', v); } }),
                                el(TextControl, { value: item.subtitle, label: '', placeholder: __('Subtitle / category…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '13px', color: attr.subtitleColor }, onChange: function (v) { updateItem(idx, 'subtitle', v); } }),
                                attr.showRatings && Stars(item.rating, attr.starColor),
                                el(RichText, { tagName: 'p', className: 'bkbg-lis-desc', value: item.description, allowedFormats: ['core/bold', 'core/italic', 'core/link'], placeholder: __('Description…', 'blockenberg'), style: { color: attr.descColor }, onChange: function (v) { updateItem(idx, 'description', v); } }),

                                el('div', { style: { marginTop: '12px', display: 'flex', gap: '6px' } },
                                    el(Button, { isSmall: true, variant: 'secondary', onClick: function () {
                                        var copy = Object.assign({}, item);
                                        set({ items: items.concat([copy]) });
                                    } }, '⧉'),
                                    el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { set({ items: items.filter(function (_, i) { return i !== idx; }) }); } }, '×')
                                )
                            )
                        );
                    })
                ),
                el('div', { style: { marginTop: '16px', textAlign: 'center' } },
                    el(Button, { variant: 'primary', isSmall: true, onClick: function () { set({ items: items.concat([emptyItem()]) }); } }, '+ Add Item')
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-lis-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
