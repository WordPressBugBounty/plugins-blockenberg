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

    var BADGES = ["Editor's Pick", "Best Value", "Premium", "Budget Pick", "Most Popular", "Best Overall", ""];

    var _tc; function getTypoControl(){ return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars(){ return _tv || (_tv = window.bkbgTypoCssVars); }

    function stars(rating, color) {
        var full = Math.floor(rating);
        var half = rating - full >= 0.5;
        var html = '';
        for (var i = 0; i < 5; i++) {
            if (i < full) html += '★';
            else if (i === full && half) html += '½';
            else html += '☆';
        }
        return el('span', { style: { color: color, fontSize: '15px', letterSpacing: '1px' } }, html,
            el('span', { style: { fontSize: '12px', color: '#94a3b8', marginLeft: '4px' } }, '(' + rating.toFixed(1) + ')')
        );
    }

    function updateProduct(products, idx, key, val) {
        return products.map(function (p, i) {
            if (i !== idx) return p;
            var c = Object.assign({}, p); c[key] = val; return c;
        });
    }

    function updateProsConsItem(products, idx, field, itemIdx, val) {
        return products.map(function (p, i) {
            if (i !== idx) return p;
            var arr = (p[field] || []).map(function (s, j) { return j === itemIdx ? val : s; });
            return Object.assign({}, p, { [field]: arr });
        });
    }

    registerBlockType('blockenberg/product-roundup', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var products = attr.products || [];
            var TC = getTypoControl();

            var blockProps = useBlockProps((function(){
                var fn = getTypoCssVars();
                var s = { padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px', background: attr.bgColor, borderRadius: attr.borderRadius + 'px' };
                if(fn){
                    Object.assign(s, fn(attr.titleTypo||{}, '--bkbg-pru-tt-'));
                    Object.assign(s, fn(attr.subtitleTypo||{}, '--bkbg-pru-st-'));
                    Object.assign(s, fn(attr.nameTypo||{}, '--bkbg-pru-nm-'));
                    Object.assign(s, fn(attr.summaryTypo||{}, '--bkbg-pru-sm-'));
                }
                return { style: s };
            })());

            function addProduct() {
                set({ products: products.concat([{ rank: products.length + 1, name: 'Product #' + (products.length + 1), image: '', imageId: 0, badge: "Editor's Pick", showBadge: false, rating: 4.0, summary: '', pros: [''], cons: [''], price: '', ctaLabel: 'Check Price', ctaUrl: '' }]) });
            }
            function removeProduct(idx) {
                set({ products: products.filter(function (_, i) { return i !== idx; }).map(function (p, i) { return Object.assign({}, p, { rank: i + 1 }); }) });
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout & Display', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout, __nextHasNoMarginBottom: true,
                        options: [{ label: 'List (vertical)', value: 'list' }, { label: 'Grid (2 columns)', value: 'grid' }],
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: attr.showSubtitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSubtitle: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Rank Badge', 'blockenberg'), checked: attr.showRank, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showRank: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Product Image', 'blockenberg'), checked: attr.showImage, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showImage: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Star Rating', 'blockenberg'), checked: attr.showRating, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showRating: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Pros', 'blockenberg'), checked: attr.showPros, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPros: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Cons', 'blockenberg'), checked: attr.showCons, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showCons: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Price', 'blockenberg'), checked: attr.showPrice, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPrice: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Open Links in New Tab', 'blockenberg'), checked: attr.openInNewTab, __nextHasNoMarginBottom: true, onChange: function (v) { set({ openInNewTab: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Card Radius', 'blockenberg'), value: attr.cardRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cardRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, {title:__('Typography','blockenberg'),initialOpen:false},
                    TC && el(TC, {label:__('Section Title','blockenberg'),typo:attr.titleTypo||{},onChange:function(v){set({titleTypo:v});}}),
                    TC && el(TC, {label:__('Subtitle','blockenberg'),typo:attr.subtitleTypo||{},onChange:function(v){set({subtitleTypo:v});}}),
                    TC && el(TC, {label:__('Product Name','blockenberg'),typo:attr.nameTypo||{},onChange:function(v){set({nameTypo:v});}}),
                    TC && el(TC, {label:__('Summary','blockenberg'),typo:attr.summaryTypo||{},onChange:function(v){set({summaryTypo:v});}})
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Section Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#0f172a' }); } },
                        { label: __('Subtitle', 'blockenberg'), value: attr.subtitleColor, onChange: function (v) { set({ subtitleColor: v || '#64748b' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Rank Badge BG', 'blockenberg'), value: attr.rankBg, onChange: function (v) { set({ rankBg: v || '#0f172a' }); } },
                        { label: __('Rank Badge Text', 'blockenberg'), value: attr.rankColor, onChange: function (v) { set({ rankColor: v || '#ffffff' }); } },
                        { label: __('Pick Badge BG', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { set({ badgeBg: v || '#f59e0b' }); } },
                        { label: __('Pick Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { set({ badgeColor: v || '#ffffff' }); } },
                        { label: __('Product Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { set({ nameColor: v || '#0f172a' }); } },
                        { label: __('Rating Stars', 'blockenberg'), value: attr.ratingColor, onChange: function (v) { set({ ratingColor: v || '#f59e0b' }); } },
                        { label: __('Summary Text', 'blockenberg'), value: attr.summaryColor, onChange: function (v) { set({ summaryColor: v || '#475569' }); } },
                        { label: __('Pros Color', 'blockenberg'), value: attr.prosColor, onChange: function (v) { set({ prosColor: v || '#16a34a' }); } },
                        { label: __('Cons Color', 'blockenberg'), value: attr.consColor, onChange: function (v) { set({ consColor: v || '#dc2626' }); } },
                        { label: __('Price', 'blockenberg'), value: attr.priceColor, onChange: function (v) { set({ priceColor: v || '#0f172a' }); } },
                        { label: __('CTA Button BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { set({ ctaBg: v || '#0f172a' }); } },
                        { label: __('CTA Button Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } }
                    ]
                })
            );

            var headerEl = el('div', { style: { marginBottom: '24px' } },
                el(RichText, { tagName: 'h2', className: 'bkbg-pru-title', value: attr.sectionTitle, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Section Title', 'blockenberg'), style: { margin: '0 0 6px', color: attr.headingColor }, onChange: function (v) { set({ sectionTitle: v }); } }),
                attr.showSubtitle && el(RichText, { tagName: 'p', className: 'bkbg-pru-subtitle', value: attr.sectionSubtitle, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Optional subtitle…', 'blockenberg'), style: { margin: 0, color: attr.subtitleColor }, onChange: function (v) { set({ sectionSubtitle: v }); } })
            );

            var gridStyle = attr.layout === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }
                : { display: 'flex', flexDirection: 'column', gap: '16px' };

            var productCards = el('div', { style: gridStyle },
                products.map(function (prod, idx) {
                    var cardStyle = { background: attr.cardBg, border: '1px solid ' + attr.cardBorder, borderRadius: attr.cardRadius + 'px', overflow: 'hidden' };
                    if (idx === 0 && attr.showRank) { cardStyle.borderTop = '3px solid #f59e0b'; }

                    var headerRow = el('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px 0' } },
                        attr.showRank && el('div', { style: { background: attr.rankBg, color: attr.rankColor, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 } }, '#' + prod.rank),
                        attr.showImage && el('div', { style: { flexShrink: 0 } },
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (media) { set({ products: products.map(function (p, i) { return i !== idx ? p : Object.assign({}, p, { image: media.url, imageId: media.id }); }) }); },
                                    allowedTypes: ['image'],
                                    value: prod.imageId,
                                    render: function (ref) {
                                        return el(Button, { onClick: ref.open, style: { padding: 0, border: '1px dashed #94a3b8', borderRadius: '4px', overflow: 'hidden', display: 'block', width: '64px', height: '64px', background: prod.image ? 'transparent' : '#f8fafc' } },
                                            prod.image
                                                ? el('img', { src: prod.image, style: { width: '64px', height: '64px', objectFit: 'cover', display: 'block' } })
                                                : el('span', { style: { fontSize: '10px', color: '#94a3b8', padding: '4px', textAlign: 'center', display: 'block', lineHeight: '1.2' } }, '+ Photo')
                                        );
                                    }
                                })
                            )
                        ),
                        el('div', { style: { flex: 1, minWidth: 0 } },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' } },
                                el(RichText, { tagName: 'span', className: 'bkbg-pru-name', value: prod.name, allowedFormats: [], placeholder: __('Product Name', 'blockenberg'), style: { color: attr.nameColor }, onChange: function (v) { set({ products: updateProduct(products, idx, 'name', v) }); } }),
                                prod.showBadge && prod.badge && el('span', { style: { background: attr.badgeBg, color: attr.badgeColor, padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' } }, prod.badge)
                            ),
                            attr.showRating && el('div', {}, stars(prod.rating || 0, attr.ratingColor))
                        )
                    );

                    var bodyEl = el('div', { style: { padding: '10px 16px 4px' } },
                        el(RichText, { tagName: 'p', className: 'bkbg-pru-summary', value: prod.summary, allowedFormats: ['core/bold', 'core/italic', 'core/link'], placeholder: __('Short product description…', 'blockenberg'), style: { margin: '0 0 10px', color: attr.summaryColor }, onChange: function (v) { set({ products: updateProduct(products, idx, 'summary', v) }); } }),
                        (attr.showPros || attr.showCons) && el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' } },
                            attr.showPros && el('div', {},
                                el('div', { style: { fontSize: '11px', fontWeight: 700, color: attr.prosColor, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' } }, '✓ Pros'),
                                (prod.pros || []).map(function (pro, pIdx) {
                                    return el('div', { key: pIdx, style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' } },
                                        el(TextControl, { value: pro, placeholder: __('Pro', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '12px' }, onChange: function (v) { set({ products: updateProsConsItem(products, idx, 'pros', pIdx, v) }); } }),
                                        el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { var arr = (prod.pros || []).filter(function (_, i) { return i !== pIdx; }); set({ products: updateProduct(products, idx, 'pros', arr) }); } }, '×')
                                    );
                                }),
                                el(Button, { variant: 'link', style: { fontSize: '11px' }, onClick: function () { set({ products: updateProduct(products, idx, 'pros', (prod.pros || []).concat([''])) }); } }, '+')
                            ),
                            attr.showCons && el('div', {},
                                el('div', { style: { fontSize: '11px', fontWeight: 700, color: attr.consColor, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' } }, '✗ Cons'),
                                (prod.cons || []).map(function (con, cIdx) {
                                    return el('div', { key: cIdx, style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' } },
                                        el(TextControl, { value: con, placeholder: __('Con', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '12px' }, onChange: function (v) { set({ products: updateProsConsItem(products, idx, 'cons', cIdx, v) }); } }),
                                        el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { var arr = (prod.cons || []).filter(function (_, i) { return i !== cIdx; }); set({ products: updateProduct(products, idx, 'cons', arr) }); } }, '×')
                                    );
                                }),
                                el(Button, { variant: 'link', style: { fontSize: '11px' }, onClick: function () { set({ products: updateProduct(products, idx, 'cons', (prod.cons || []).concat([''])) }); } }, '+')
                            )
                        )
                    );

                    var footerEl = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 14px', borderTop: '1px solid ' + attr.cardBorder, marginTop: '8px', flexWrap: 'wrap', gap: '8px' } },
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
                            attr.showPrice && el(TextControl, { label: '', value: prod.price, placeholder: '$0.00', __nextHasNoMarginBottom: true, style: { fontWeight: 700, color: attr.priceColor, fontSize: '16px', width: '90px' }, onChange: function (v) { set({ products: updateProduct(products, idx, 'price', v) }); } }),
                            el(ToggleControl, { label: __('Badge', 'blockenberg'), checked: prod.showBadge, __nextHasNoMarginBottom: true, onChange: function (v) { set({ products: updateProduct(products, idx, 'showBadge', v) }); } }),
                            prod.showBadge && el(TextControl, { value: prod.badge, placeholder: "Editor's Pick", __nextHasNoMarginBottom: true, style: { width: '130px' }, onChange: function (v) { set({ products: updateProduct(products, idx, 'badge', v) }); } })
                        ),
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                            el(TextControl, { value: prod.ctaLabel, placeholder: __('CTA Label', 'blockenberg'), __nextHasNoMarginBottom: true, style: { width: '120px' }, onChange: function (v) { set({ products: updateProduct(products, idx, 'ctaLabel', v) }); } }),
                            el(TextControl, { value: prod.ctaUrl, placeholder: __('URL', 'blockenberg'), __nextHasNoMarginBottom: true, style: { width: '160px' }, onChange: function (v) { set({ products: updateProduct(products, idx, 'ctaUrl', v) }); } }),
                            attr.showRating && el(RangeControl, { label: __('Rating', 'blockenberg'), value: prod.rating, min: 0, max: 5, step: 0.1, __nextHasNoMarginBottom: true, style: { width: '160px' }, onChange: function (v) { set({ products: updateProduct(products, idx, 'rating', v) }); } }),
                            el(Button, { variant: 'link', isDestructive: true, style: { fontSize: '11px' }, onClick: function () { removeProduct(idx); } }, __('Remove Product', 'blockenberg'))
                        )
                    );

                    return el('div', { key: idx, style: cardStyle },
                        headerRow,
                        bodyEl,
                        footerEl
                    );
                })
            );

            var addBtn = el('div', { style: { textAlign: 'center', marginTop: '16px' } },
                el(Button, { variant: 'secondary', onClick: addProduct }, __('+ Add Product', 'blockenberg'))
            );

            return el('div', blockProps,
                controls,
                el('div', { className: 'bkbg-pru-wrap', style: { padding: '24px' } },
                    headerEl,
                    productCards,
                    addBtn
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-pru-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
