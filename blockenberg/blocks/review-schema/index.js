( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var Button            = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function Stars(rating, best, starSize, starColor, starEmpty) {
        var stars = [];
        for (var i = 1; i <= best; i++) {
            var filled = i <= Math.round(rating);
            stars.push(el('span', { key: i, style: {
                fontSize: starSize + 'px',
                color: filled ? starColor : starEmpty,
                lineHeight: 1
            }}, filled ? '★' : '☆'));
        }
        return el('div', { style: { display: 'flex', gap: 2, alignItems: 'center' }}, stars);
    }

    registerBlockType('blockenberg/review-schema', {
        title:    __('Review Schema'),
        icon:     'star-filled',
        category: 'bkbg-blog',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(attr.headingTypo, '--bkrs-ht-'));
                    Object.assign(s, _tv(attr.bodyTypo, '--bkrs-bt-'));
                }
                return { className: 'bkbg-rs-wrap', style: s };
            })());

            function updateReview(idx, field, val) {
                var reviews = attr.reviews.map(function (r, i) {
                    return i === idx ? Object.assign({}, r, { [field]: val }) : r;
                });
                setAttr({ reviews: reviews });
            }
            function addReview() {
                setAttr({ reviews: attr.reviews.concat([{
                    author: 'New Reviewer', date: new Date().toISOString().slice(0, 10),
                    rating: 5, body: 'Great product!'
                }]) });
            }
            function removeReview(idx) {
                setAttr({ reviews: attr.reviews.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                /* Item Info */
                el(PanelBody, { title: __('Item Info'), initialOpen: true },
                    el(TextControl, { label: __('Item Name'), value: attr.itemName,
                        onChange: function (v) { setAttr({ itemName: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Item Type'), value: attr.itemType,
                        options: ['Product','LocalBusiness','Organization','SoftwareApplication','Book','Movie','Restaurant'].map(function (v) {
                            return { label: v, value: v };
                        }),
                        onChange: function (v) { setAttr({ itemType: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(TextareaControl, { label: __('Description'), value: attr.description,
                        onChange: function (v) { setAttr({ description: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ imageUrl: m.url }); },
                            allowedTypes: ['image'], value: attr.imageUrl,
                            render: function (ref) {
                                return el(Button, { variant: attr.imageUrl ? 'secondary' : 'primary', onClick: ref.open },
                                    attr.imageUrl ? __('Change Image') : __('Choose Image (schema)'));
                            }
                        })
                    )
                ),

                /* Rating */
                el(PanelBody, { title: __('Aggregate Rating'), initialOpen: false },
                    el(RangeControl, { label: __('Rating Value'), value: attr.ratingValue,
                        min: 1, max: 5, step: 0.1,
                        onChange: function (v) { setAttr({ ratingValue: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Rating Count'), value: attr.ratingCount,
                        min: 1, max: 100000,
                        onChange: function (v) { setAttr({ ratingCount: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Best Rating'), value: attr.bestRating,
                        min: 5, max: 10,
                        onChange: function (v) { setAttr({ bestRating: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Rating Size (px)'), value: attr.ratingSize,
                        min: 24, max: 96,
                        onChange: function (v) { setAttr({ ratingSize: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Star Size (px)'), value: attr.starSize,
                        min: 16, max: 56,
                        onChange: function (v) { setAttr({ starSize: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Reviews */
                el(PanelBody, { title: __('Reviews'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Reviews'), checked: attr.showReviews,
                        onChange: function (v) { setAttr({ showReviews: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Columns'), value: String(attr.reviewColumns),
                        options: ['1','2','3'].map(function (v) { return { label: v, value: v }; }),
                        onChange: function (v) { setAttr({ reviewColumns: Number(v) }); },
                        __nextHasNoMarginBottom: true }),
                    attr.reviews.map(function (r, idx) {
                        return el(PanelBody, { key: idx, title: (r.author || 'Review ' + (idx + 1)), initialOpen: false },
                            el(TextControl, { label: __('Author'), value: r.author || '',
                                onChange: function (v) { updateReview(idx, 'author', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Date (YYYY-MM-DD)'), value: r.date || '',
                                onChange: function (v) { updateReview(idx, 'date', v); },
                                __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Rating'), value: r.rating || 5,
                                min: 1, max: attr.bestRating,
                                onChange: function (v) { updateReview(idx, 'rating', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextareaControl, { label: __('Review Text'), value: r.body || '',
                                onChange: function (v) { updateReview(idx, 'body', v); },
                                __nextHasNoMarginBottom: true }),
                            el(Button, { isDestructive: true, variant: 'secondary',
                                onClick: function () { removeReview(idx); },
                                style: { marginTop: 8 }
                            }, __('Remove Review'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addReview,
                        style: { marginTop: 8, width: '100%' }
                    }, __('+ Add Review'))
                ),

                /* Schema */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () { var TC = getTypoControl(); return TC ? [
                        el(TC, { key: 'ht', label: __('Item Name'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        el(TC, { key: 'bt', label: __('Body Text'), value: attr.bodyTypo, onChange: function (v) { setAttr({ bodyTypo: v }); } })
                    ] : null; })()
                ),
                el(PanelBody, { title: __('Schema & Layout'), initialOpen: false },
                    el(ToggleControl, { label: __('Output JSON-LD Schema'), checked: attr.showSchema,
                        onChange: function (v) { setAttr({ showSchema: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Layout'), value: attr.layout,
                        options: [
                            { label: __('Card'), value: 'card' },
                            { label: __('Compact'), value: 'compact' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Radius (px)'), value: attr.cardRadius,
                        min: 0, max: 24,
                        onChange: function (v) { setAttr({ cardRadius: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Star Filled'), value: attr.starColor,
                          onChange: function (v) { setAttr({ starColor: v || '#f59e0b' }); } },
                        { label: __('Star Empty'), value: attr.starEmpty,
                          onChange: function (v) { setAttr({ starEmpty: v || '#e2e8f0' }); } },
                        { label: __('Section BG'), value: attr.sectionBg,
                          onChange: function (v) { setAttr({ sectionBg: v || '' }); } },
                        { label: __('Card BG'), value: attr.cardBg,
                          onChange: function (v) { setAttr({ cardBg: v || '#f8fafc' }); } },
                        { label: __('Card Border'), value: attr.cardBorder,
                          onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Heading'), value: attr.headingColor,
                          onChange: function (v) { setAttr({ headingColor: v || '#0f172a' }); } },
                        { label: __('Body Text'), value: attr.bodyColor,
                          onChange: function (v) { setAttr({ bodyColor: v || '#475569' }); } }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', { style: { background: attr.sectionBg || 'transparent', padding: attr.sectionBg ? '40px' : '0' }},
                        /* Aggregate summary */
                        el('div', { className: 'bkbg-rs-summary', style: {
                            background: attr.bgColor || '#ffffff',
                            borderRadius: attr.cardRadius + 'px',
                            padding: '32px', marginBottom: 32,
                            border: '1px solid ' + attr.cardBorder,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                            textAlign: 'center'
                        }},
                            el('h3', { className: 'bkbg-rs-item-name', style: { margin: 0, color: attr.headingColor }}, attr.itemName),
                            Stars(attr.ratingValue, attr.bestRating, attr.starSize, attr.starColor, attr.starEmpty),
                            el('div', { style: { fontSize: attr.ratingSize + 'px', fontWeight: 900, color: attr.headingColor, lineHeight: 1 }},
                                attr.ratingValue.toFixed(1)
                            ),
                            el('p', { style: { margin: 0, color: attr.authorColor || '#64748b', fontSize: 14 }},
                                __('Based on ') + attr.ratingCount + __(' reviews')
                            )
                        ),
                        /* Review cards */
                        attr.showReviews && attr.reviews.length > 0 && el('div', { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(' + attr.reviewColumns + ', 1fr)',
                            gap: 16
                        }},
                            attr.reviews.map(function (r, i) {
                                return el('div', { key: i, style: {
                                    background: attr.cardBg,
                                    border: '1px solid ' + attr.cardBorder,
                                    borderRadius: attr.cardRadius + 'px',
                                    padding: '20px'
                                }},
                                    Stars(r.rating || 5, attr.bestRating, 18, attr.starColor, attr.starEmpty),
                                    el('p', { className: 'bkbg-rs-body', style: { margin: '10px 0 12px', color: attr.bodyColor }}, r.body),
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }},
                                        el('strong', { style: { fontSize: 13, color: attr.headingColor }}, r.author),
                                        el('span', { style: { fontSize: 11, color: attr.authorColor || '#94a3b8' }}, r.date)
                                    )
                                );
                            })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            return el('div', bp,
                el('div', { className: 'bkbg-rs-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
