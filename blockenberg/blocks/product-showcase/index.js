( function () {
    var el               = wp.element.createElement;
    var useState         = wp.element.useState;
    var __               = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText          = wp.blockEditor.RichText;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody         = wp.components.PanelBody;
    var Button            = wp.components.Button;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ColorPicker       = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;

    var _tc; function getTypoControl(){ return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars(){ return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var IMAGE_POSITION_OPTIONS = [
        { label: __('Left',  'blockenberg'), value: 'left' },
        { label: __('Right', 'blockenberg'), value: 'right' },
    ];
    var RATIO_OPTIONS = [
        { label: __('Square (1:1)',       'blockenberg'), value: '1/1' },
        { label: __('Portrait (3:4)',     'blockenberg'), value: '3/4' },
        { label: __('Landscape (4:3)',    'blockenberg'), value: '4/3' },
        { label: __('Wide (16:9)',        'blockenberg'), value: '16/9' },
    ];
    var CURRENCY_POS_OPTIONS = [
        { label: __('Before price ($99)', 'blockenberg'), value: 'before' },
        { label: __('After price (99$)',  'blockenberg'), value: 'after' },
    ];
    var VARIANT_TYPE_OPTIONS = [
        { label: __('Color Swatches', 'blockenberg'), value: 'color' },
        { label: __('Button Labels',  'blockenberg'), value: 'button' },
    ];

    function makeId() { return 'ps' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        return {
            '--bkbg-ps-name-color':    a.nameColor,
            '--bkbg-ps-tagline-color': a.taglineColor,
            '--bkbg-ps-price-color':   a.priceColor,
            '--bkbg-ps-orig-price-c':  a.originalPriceColor,
            '--bkbg-ps-rating-star':   a.ratingStarColor,
            '--bkbg-ps-instock-color': a.inStockColor,
            '--bkbg-ps-outstock-color':a.outStockColor,
            '--bkbg-ps-feature-color': a.featureColor,
            '--bkbg-ps-feature-icon':  a.featureIconColor,
            '--bkbg-ps-cta-bg':        a.ctaBg,
            '--bkbg-ps-cta-color':     a.ctaColor,
            '--bkbg-ps-sec-cta-bg':    a.secCtaBg,
            '--bkbg-ps-sec-cta-color': a.secCtaColor,
            '--bkbg-ps-tab-active-bg': a.tabActiveBg,
            '--bkbg-ps-tab-active-c':  a.tabActiveColor,
            '--bkbg-ps-tab-idle-bg':   a.tabIdleBg,
            '--bkbg-ps-tab-idle-c':    a.tabIdleColor,
            '--bkbg-ps-card-bg':       a.cardBg,
            '--bkbg-ps-border-color':  a.borderColor,
            '--bkbg-ps-badge-bg':      a.badgeBg,
            '--bkbg-ps-badge-color':   a.badgeColor,
            '--bkbg-ps-gap':           a.gap + 'px',
            '--bkbg-ps-card-r':        a.cardRadius + 'px',
            '--bkbg-ps-card-pad':      a.cardPadding + 'px',
            '--bkbg-ps-img-r':         a.imageRadius + 'px',
            '--bkbg-ps-cta-r':         a.ctaRadius + 'px',
            '--bkbg-ps-badge-r':       a.badgeRadius + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    function StarRating(props) {
        var score = props.score || 0;
        var color = props.color || '#f59e0b';
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            var pct = Math.min(1, Math.max(0, score - (i - 1))) * 100;
            stars.push(
                el('span', { key: i, style: { position: 'relative', display: 'inline-block', fontSize: '16px', lineHeight: 1 } },
                    el('span', { style: { color: '#d1d5db' } }, '★'),
                    el('span', { style: { position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: pct + '%', color: color } }, '★')
                )
            );
        }
        return el('div', { style: { display: 'flex', gap: '2px' } }, stars);
    }

    /* ── deprecated: v1 save (old scalar typo attrs, old CSS vars) ── */
    function buildWrapStyleV1(a) {
        return {
            '--bkbg-ps-name-color':    a.nameColor,
            '--bkbg-ps-tagline-color': a.taglineColor,
            '--bkbg-ps-price-color':   a.priceColor,
            '--bkbg-ps-orig-price-c':  a.originalPriceColor,
            '--bkbg-ps-rating-star':   a.ratingStarColor,
            '--bkbg-ps-instock-color': a.inStockColor,
            '--bkbg-ps-outstock-color':a.outStockColor,
            '--bkbg-ps-feature-color': a.featureColor,
            '--bkbg-ps-feature-icon':  a.featureIconColor,
            '--bkbg-ps-cta-bg':        a.ctaBg,
            '--bkbg-ps-cta-color':     a.ctaColor,
            '--bkbg-ps-sec-cta-bg':    a.secCtaBg,
            '--bkbg-ps-sec-cta-color': a.secCtaColor,
            '--bkbg-ps-tab-active-bg': a.tabActiveBg,
            '--bkbg-ps-tab-active-c':  a.tabActiveColor,
            '--bkbg-ps-tab-idle-bg':   a.tabIdleBg,
            '--bkbg-ps-tab-idle-c':    a.tabIdleColor,
            '--bkbg-ps-card-bg':       a.cardBg,
            '--bkbg-ps-border-color':  a.borderColor,
            '--bkbg-ps-badge-bg':      a.badgeBg,
            '--bkbg-ps-badge-color':   a.badgeColor,
            '--bkbg-ps-name-sz':       (a.nameSize||28) + 'px',
            '--bkbg-ps-tagline-sz':    (a.taglineSize||15) + 'px',
            '--bkbg-ps-price-sz':      (a.priceSize||36) + 'px',
            '--bkbg-ps-feature-sz':    (a.featureSize||14) + 'px',
            '--bkbg-ps-rating-sz':     (a.ratingSize||13) + 'px',
            '--bkbg-ps-tab-label-sz':  (a.tabLabelSize||14) + 'px',
            '--bkbg-ps-gap':           a.gap + 'px',
            '--bkbg-ps-card-r':        a.cardRadius + 'px',
            '--bkbg-ps-card-pad':      a.cardPadding + 'px',
            '--bkbg-ps-img-r':         a.imageRadius + 'px',
            '--bkbg-ps-cta-r':         a.ctaRadius + 'px',
            '--bkbg-ps-badge-r':       a.badgeRadius + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
    }

    var v1Attributes = {
        mainImageUrl:{type:'string',default:''},mainImageId:{type:'integer',default:0},
        gallery:{type:'array',default:[],items:{type:'object'}},
        productName:{type:'string',default:'Premium Wireless Headphones'},
        tagline:{type:'string',default:'Studio-quality sound, redefined.'},
        sku:{type:'string',default:'SKU-WH-001'},showSku:{type:'boolean',default:false},
        price:{type:'string',default:'249.00'},originalPrice:{type:'string',default:'349.00'},
        showOriginalPrice:{type:'boolean',default:true},
        currency:{type:'string',default:'$'},currencyPos:{type:'string',default:'before'},
        rating:{type:'number',default:4.7},reviewCount:{type:'integer',default:2134},showRating:{type:'boolean',default:true},
        inStock:{type:'boolean',default:true},stockText:{type:'string',default:'In Stock \u2013 ships in 24h'},showStock:{type:'boolean',default:true},
        badge:{type:'string',default:'Best Seller'},showBadge:{type:'boolean',default:true},
        features:{type:'array',default:[],items:{type:'object'}},showFeatures:{type:'boolean',default:true},
        featuresTitle:{type:'string',default:'Why you\'ll love it'},featureIcon:{type:'string',default:'\u2713'},
        tabs:{type:'array',default:[],items:{type:'object'}},showTabs:{type:'boolean',default:true},
        variantGroups:{type:'array',default:[],items:{type:'object'}},showVariants:{type:'boolean',default:true},
        trustBadges:{type:'array',default:[],items:{type:'object'}},showTrustBadges:{type:'boolean',default:true},
        ctaLabel:{type:'string',default:'Add to Cart'},ctaUrl:{type:'string',default:'#'},
        showSecCta:{type:'boolean',default:true},secCtaLabel:{type:'string',default:'Add to Wishlist'},secCtaUrl:{type:'string',default:'#'},
        imagePosition:{type:'string',default:'left'},imageRatio:{type:'string',default:'1/1'},
        gap:{type:'integer',default:48},cardRadius:{type:'integer',default:20},cardPadding:{type:'integer',default:40},
        imageRadius:{type:'integer',default:16},ctaRadius:{type:'integer',default:10},badgeRadius:{type:'integer',default:99},
        nameSize:{type:'integer',default:28},taglineSize:{type:'integer',default:15},
        priceSize:{type:'integer',default:36},featureSize:{type:'integer',default:14},
        ratingSize:{type:'integer',default:13},tabLabelSize:{type:'integer',default:14},
        nameColor:{type:'string',default:'#111827'},priceColor:{type:'string',default:'#6c3fb5'},
        originalPriceColor:{type:'string',default:'#9ca3af'},taglineColor:{type:'string',default:'#6b7280'},
        ratingStarColor:{type:'string',default:'#f59e0b'},inStockColor:{type:'string',default:'#16a34a'},
        outStockColor:{type:'string',default:'#dc2626'},featureColor:{type:'string',default:'#374151'},
        featureIconColor:{type:'string',default:'#6c3fb5'},
        ctaBg:{type:'string',default:'#6c3fb5'},ctaColor:{type:'string',default:'#ffffff'},
        secCtaBg:{type:'string',default:'#f3f4f6'},secCtaColor:{type:'string',default:'#374151'},
        tabActiveBg:{type:'string',default:'#6c3fb5'},tabActiveColor:{type:'string',default:'#ffffff'},
        tabIdleBg:{type:'string',default:'#f3f4f6'},tabIdleColor:{type:'string',default:'#374151'},
        cardBg:{type:'string',default:'#ffffff'},borderColor:{type:'string',default:'#e5e7eb'},
        badgeBg:{type:'string',default:'#6c3fb5'},badgeColor:{type:'string',default:'#ffffff'},
        bgColor:{type:'string',default:''},
        paddingTop:{type:'integer',default:64},paddingBottom:{type:'integer',default:64},
        nameFontWeight:{type:'string',default:'800'},taglineFontWeight:{type:'string',default:'400'},
    };

    var deprecated = [{
        attributes: v1Attributes,
        save: function(props) {
            var a = props.attributes;
            return el('div', Object.assign({}, useBlockProps.save(), {
                className: 'bkbg-ps-wrap',
                style: buildWrapStyleV1(a),
                'data-image-position': a.imagePosition,
                'data-image-ratio':    a.imageRatio,
                'data-show-tabs':      a.showTabs ? '1' : '0',
                'data-tabs':           JSON.stringify(a.tabs),
                'data-variants':       JSON.stringify(a.variantGroups),
                'data-gallery':        JSON.stringify(a.gallery),
            }),
                el('div', { className: 'bkbg-ps-layout bkbg-ps-img-' + a.imagePosition },
                    el('div', { className: 'bkbg-ps-image-col' },
                        el('div', { className: 'bkbg-ps-main-image-wrap' },
                            a.mainImageUrl && el('img', { className: 'bkbg-ps-main-img', src: a.mainImageUrl, alt: a.productName, loading: 'lazy' })
                        ),
                        a.gallery.length > 0 && el('div', { className: 'bkbg-ps-gallery' },
                            a.gallery.map(function (g, idx) {
                                return el('img', { key: idx, className: 'bkbg-ps-thumb' + (idx === 0 ? ' bkbg-ps-thumb--active' : ''), src: g.url, alt: (a.productName + ' ' + (idx + 1)), loading: 'lazy', 'data-full': g.url });
                            })
                        )
                    ),
                    el('div', { className: 'bkbg-ps-info-col' },
                        a.showBadge && a.badge && el('span', { className: 'bkbg-ps-badge' }, a.badge),
                        el('h2', { className: 'bkbg-ps-name' }, a.productName),
                        a.tagline && el('p', { className: 'bkbg-ps-tagline' }, a.tagline),
                        a.showRating && el('div', { className: 'bkbg-ps-rating', 'data-score': a.rating, 'data-count': a.reviewCount }),
                        el('div', { className: 'bkbg-ps-price-row' },
                            el('span', { className: 'bkbg-ps-price' }, a.currencyPos === 'before' ? a.currency + a.price : a.price + a.currency),
                            a.showOriginalPrice && a.originalPrice && el('span', { className: 'bkbg-ps-orig-price' }, a.currencyPos === 'before' ? a.currency + a.originalPrice : a.originalPrice + a.currency)
                        ),
                        a.showSku && a.sku && el('div', { className: 'bkbg-ps-sku' }, 'SKU: ' + a.sku),
                        a.showStock && el('div', { className: 'bkbg-ps-stock bkbg-ps-stock--' + (a.inStock ? 'in' : 'out') }, a.stockText),
                        a.showVariants && a.variantGroups.length > 0 && el('div', { className: 'bkbg-ps-variants' }),
                        el('div', { className: 'bkbg-ps-ctas' },
                            a.ctaLabel && el('a', { href: a.ctaUrl || '#', className: 'bkbg-ps-cta bkbg-ps-cta--primary' }, a.ctaLabel),
                            a.showSecCta && a.secCtaLabel && el('a', { href: a.secCtaUrl || '#', className: 'bkbg-ps-cta bkbg-ps-cta--secondary' }, a.secCtaLabel)
                        ),
                        a.showTrustBadges && a.trustBadges.length > 0 && el('div', { className: 'bkbg-ps-trust-badges' },
                            a.trustBadges.map(function (b) {
                                return el('div', { key: b.id, className: 'bkbg-ps-trust-badge' },
                                    el('span', { className: 'bkbg-ps-trust-icon' }, b.icon),
                                    el('span', { className: 'bkbg-ps-trust-text' }, b.text)
                                );
                            })
                        ),
                        a.showFeatures && a.features.length > 0 && el('div', { className: 'bkbg-ps-features' },
                            a.featuresTitle && el('div', { className: 'bkbg-ps-features-title' }, a.featuresTitle),
                            el('ul', { className: 'bkbg-ps-feature-list' },
                                a.features.map(function (f) {
                                    return el('li', { key: f.id },
                                        el('span', { className: 'bkbg-ps-feature-icon' }, a.featureIcon),
                                        f.text
                                    );
                                })
                            )
                        ),
                        a.showTabs && a.tabs.length > 0 && el('div', { className: 'bkbg-ps-tabs-wrap' },
                            el('div', { className: 'bkbg-ps-tab-bar' },
                                a.tabs.map(function (t, idx) {
                                    return el('button', { key: t.id, className: 'bkbg-ps-tab-btn' + (idx === 0 ? ' bkbg-ps-tab-btn--active' : ''), 'data-tab': t.id }, t.label);
                                })
                            ),
                            el('div', { className: 'bkbg-ps-tab-panels' },
                                a.tabs.map(function (t, idx) {
                                    return el('div', { key: t.id, className: 'bkbg-ps-tab-panel' + (idx === 0 ? ' bkbg-ps-tab-panel--active' : ''), 'data-tab-panel': t.id }, t.content);
                                })
                            )
                        )
                    )
                )
            );
        }
    }];

    registerBlockType('blockenberg/product-showcase', {
        deprecated: deprecated,
        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;
            var TC = getTypoControl();
            var openColor = useState(null);
            var openColorKey = openColor[0];
            var setOpenColorKey = openColor[1];
            var activeTab = useState(0);
            var activeTabIdx = activeTab[0];
            var setActiveTabIdx = activeTab[1];

            function setColor(key) {
                return function (v) { var o = {}; o[key] = v; setA(o); };
            }
            function cc(key, label, val) {
                return renderColorControl(key, label, val, setColor(key), openColorKey, setOpenColorKey);
            }

            /* — Array helpers — */
            function updateFeature(id, val) {
                setA({ features: a.features.map(function (f) { return f.id === id ? Object.assign({}, f, { text: val }) : f; }) });
            }
            function removeFeature(id) {
                setA({ features: a.features.filter(function (f) { return f.id !== id; }) });
            }
            function addFeature() {
                setA({ features: a.features.concat([{ id: makeId(), text: 'New feature point' }]) });
            }
            function updateTabField(id, field, val) {
                setA({ tabs: a.tabs.map(function (t) { return t.id === id ? Object.assign({}, t, { [field]: val }) : t; }) });
            }
            function removeTab(id) {
                setA({ tabs: a.tabs.filter(function (t) { return t.id !== id; }) });
            }
            function addTab() {
                setA({ tabs: a.tabs.concat([{ id: makeId(), label: 'New Tab', content: 'Tab content goes here.' }]) });
            }
            function updateTrustBadge(id, field, val) {
                setA({ trustBadges: a.trustBadges.map(function (b) { return b.id === id ? Object.assign({}, b, { [field]: val }) : b; }) });
            }
            function removeTrustBadge(id) {
                setA({ trustBadges: a.trustBadges.filter(function (b) { return b.id !== id; }) });
            }
            function addTrustBadge() {
                setA({ trustBadges: a.trustBadges.concat([{ id: makeId(), icon: '🔒', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', text: 'Trust Point' }]) });
            }
            function updateVariantGroupField(id, field, val) {
                setA({ variantGroups: a.variantGroups.map(function (g) { return g.id === id ? Object.assign({}, g, { [field]: val }) : g; }) });
            }
            function removeVariantGroup(id) {
                setA({ variantGroups: a.variantGroups.filter(function (g) { return g.id !== id; }) });
            }
            function addVariantGroup() {
                setA({ variantGroups: a.variantGroups.concat([{ id: makeId(), label: 'Option', type: 'button', options: [{ id: makeId(), label: 'A', value: '#cccccc' }] }]) });
            }
            function addVariantOption(groupId) {
                setA({ variantGroups: a.variantGroups.map(function (g) {
                    if (g.id !== groupId) return g;
                    return Object.assign({}, g, { options: (g.options || []).concat([{ id: makeId(), label: 'Option', value: '#cccccc' }]) });
                }) });
            }
            function updateVariantOption(groupId, optId, field, val) {
                setA({ variantGroups: a.variantGroups.map(function (g) {
                    if (g.id !== groupId) return g;
                    return Object.assign({}, g, { options: (g.options || []).map(function (o) { return o.id === optId ? Object.assign({}, o, { [field]: val }) : o; }) });
                }) });
            }
            function removeVariantOption(groupId, optId) {
                setA({ variantGroups: a.variantGroups.map(function (g) {
                    if (g.id !== groupId) return g;
                    return Object.assign({}, g, { options: (g.options || []).filter(function (o) { return o.id !== optId; }) });
                }) });
            }
            function updateGalleryItem(idx, field, val) {
                var newGallery = a.gallery.slice();
                newGallery[idx] = Object.assign({}, newGallery[idx], { [field]: val });
                setA({ gallery: newGallery });
            }
            function removeGalleryItem(idx) {
                setA({ gallery: a.gallery.filter(function (_, i) { return i !== idx; }) });
            }

            /* − Inspector − */
            var inspector = el(InspectorControls, null,

                /* Product Info */
                el(PanelBody, { title: __('Product Info', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Product Name', 'blockenberg'), value: a.productName, onChange: function (v) { setA({ productName: v }); } }),
                    el(TextControl, { label: __('Tagline', 'blockenberg'), value: a.tagline, onChange: function (v) { setA({ tagline: v }); } }),
                    el(TextControl, { label: __('Badge Text', 'blockenberg'), value: a.badge, onChange: function (v) { setA({ badge: v }); } }),
                    el(ToggleControl, { label: __('Show Badge', 'blockenberg'), checked: a.showBadge, onChange: function (v) { setA({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('SKU', 'blockenberg'), value: a.sku, onChange: function (v) { setA({ sku: v }); } }),
                    el(ToggleControl, { label: __('Show SKU', 'blockenberg'), checked: a.showSku, onChange: function (v) { setA({ showSku: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Pricing */
                el(PanelBody, { title: __('Pricing', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.currency, onChange: function (v) { setA({ currency: v }); } }),
                    el(SelectControl, { label: __('Currency Position', 'blockenberg'), value: a.currencyPos, options: CURRENCY_POS_OPTIONS, onChange: function (v) { setA({ currencyPos: v }); } }),
                    el(TextControl, { label: __('Price', 'blockenberg'), value: a.price, onChange: function (v) { setA({ price: v }); } }),
                    el(TextControl, { label: __('Original Price (strikethrough)', 'blockenberg'), value: a.originalPrice, onChange: function (v) { setA({ originalPrice: v }); } }),
                    el(ToggleControl, { label: __('Show Original Price', 'blockenberg'), checked: a.showOriginalPrice, onChange: function (v) { setA({ showOriginalPrice: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Rating & Stock */
                el(PanelBody, { title: __('Rating & Stock', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Rating (out of 5)', 'blockenberg'), value: a.rating, min: 0, max: 5, step: 0.1, onChange: function (v) { setA({ rating: v }); } }),
                    el(TextControl, { label: __('Review Count', 'blockenberg'), value: String(a.reviewCount), onChange: function (v) { setA({ reviewCount: parseInt(v) || 0 }); } }),
                    el(ToggleControl, { label: __('Show Rating', 'blockenberg'), checked: a.showRating, onChange: function (v) { setA({ showRating: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('In Stock', 'blockenberg'), checked: a.inStock, onChange: function (v) { setA({ inStock: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Stock Label', 'blockenberg'), value: a.stockText, onChange: function (v) { setA({ stockText: v }); } }),
                    el(ToggleControl, { label: __('Show Stock Status', 'blockenberg'), checked: a.showStock, onChange: function (v) { setA({ showStock: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Features */
                el(PanelBody, { title: __('Features List', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Section Title', 'blockenberg'), value: a.featuresTitle, onChange: function (v) { setA({ featuresTitle: v }); } }),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setA, { charAttr: 'featureIcon', typeAttr: 'featureIconType', dashiconAttr: 'featureIconDashicon', imageUrlAttr: 'featureIconImageUrl', colorAttr: 'featureIconDashiconColor' })),
                    el(ToggleControl, { label: __('Show Features', 'blockenberg'), checked: a.showFeatures, onChange: function (v) { setA({ showFeatures: v }); }, __nextHasNoMarginBottom: true }),
                    a.features.map(function (f) {
                        return el('div', { key: f.id, style: { display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' } },
                            el(TextControl, { value: f.text, onChange: function (v) { updateFeature(f.id, v); }, style: { flex: 1, margin: 0 } }),
                            el(Button, { onClick: function () { removeFeature(f.id); }, icon: 'trash', isDestructive: true, label: __('Remove', 'blockenberg') })
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addFeature }, __('+ Add Feature', 'blockenberg'))
                ),

                /* Tabs */
                el(PanelBody, { title: __('Product Tabs', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Tabs', 'blockenberg'), checked: a.showTabs, onChange: function (v) { setA({ showTabs: v }); }, __nextHasNoMarginBottom: true }),
                    a.tabs.map(function (t) {
                        return el(PanelBody, { key: t.id, title: t.label || __('Tab', 'blockenberg'), initialOpen: false },
                            el(TextControl, { label: __('Tab Label', 'blockenberg'), value: t.label, onChange: function (v) { updateTabField(t.id, 'label', v); } }),
                            el(TextControl, { label: __('Content', 'blockenberg'), value: t.content, onChange: function (v) { updateTabField(t.id, 'content', v); } }),
                            el(Button, { variant: 'link', isDestructive: true, onClick: function () { removeTab(t.id); } }, __('Remove Tab', 'blockenberg'))
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addTab }, __('+ Add Tab', 'blockenberg'))
                ),

                /* Variants */
                el(PanelBody, { title: __('Variant Selectors', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Variants', 'blockenberg'), checked: a.showVariants, onChange: function (v) { setA({ showVariants: v }); }, __nextHasNoMarginBottom: true }),
                    a.variantGroups.map(function (g) {
                        return el(PanelBody, { key: g.id, title: g.label || __('Variant Group', 'blockenberg'), initialOpen: false },
                            el(TextControl, { label: __('Group Label', 'blockenberg'), value: g.label, onChange: function (v) { updateVariantGroupField(g.id, 'label', v); } }),
                            el(SelectControl, { label: __('Display Style', 'blockenberg'), value: g.type, options: VARIANT_TYPE_OPTIONS, onChange: function (v) { updateVariantGroupField(g.id, 'type', v); } }),
                            (g.options || []).map(function (o) {
                                return el('div', { key: o.id, style: { display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' } },
                                    el(TextControl, { label: g.type === 'color' ? __('Name', 'blockenberg') : __('Label', 'blockenberg'), value: o.label, onChange: function (v) { updateVariantOption(g.id, o.id, 'label', v); }, style: { flex: 1, margin: 0 } }),
                                    g.type === 'color' && el(TextControl, { label: __('Hex', 'blockenberg'), value: o.value, onChange: function (v) { updateVariantOption(g.id, o.id, 'value', v); }, style: { width: '80px', margin: 0 } }),
                                    el(Button, { onClick: function () { removeVariantOption(g.id, o.id); }, icon: 'trash', isDestructive: true, label: __('Remove', 'blockenberg') })
                                );
                            }),
                            el(Button, { variant: 'secondary', onClick: function () { addVariantOption(g.id); } }, __('+ Add Option', 'blockenberg')),
                            el(Button, { variant: 'link', isDestructive: true, onClick: function () { removeVariantGroup(g.id); } }, __('Remove Group', 'blockenberg'))
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addVariantGroup }, __('+ Add Variant Group', 'blockenberg'))
                ),

                /* Trust Badges */
                el(PanelBody, { title: __('Trust Badges', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Trust Badges', 'blockenberg'), checked: a.showTrustBadges, onChange: function (v) { setA({ showTrustBadges: v }); }, __nextHasNoMarginBottom: true }),
                    a.trustBadges.map(function (b) {
                        return el('div', { key: b.id, style: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px', marginBottom: '6px' } },
                            el(IP().IconPickerControl, {
                                iconType: b.iconType || 'custom-char',
                                customChar: b.icon,
                                dashicon: b.iconDashicon || '',
                                imageUrl: b.iconImageUrl || '',
                                onChangeType: function (v) { updateTrustBadge(b.id, 'iconType', v); },
                                onChangeChar: function (v) { updateTrustBadge(b.id, 'icon', v); },
                                onChangeDashicon: function (v) { updateTrustBadge(b.id, 'iconDashicon', v); },
                                onChangeImageUrl: function (v) { updateTrustBadge(b.id, 'iconImageUrl', v); }
                            }),
                            el(TextControl, { label: __('Text', 'blockenberg'), value: b.text, onChange: function (v) { updateTrustBadge(b.id, 'text', v); } }),
                            el(Button, { variant: 'link', isDestructive: true, onClick: function () { removeTrustBadge(b.id); } }, __('Remove', 'blockenberg'))
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addTrustBadge }, __('+ Add Badge', 'blockenberg'))
                ),

                /* CTAs */
                el(PanelBody, { title: __('Call to Action Buttons', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Primary Button Label', 'blockenberg'), value: a.ctaLabel, onChange: function (v) { setA({ ctaLabel: v }); } }),
                    el(TextControl, { label: __('Primary Button URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { setA({ ctaUrl: v }); } }),
                    el(ToggleControl, { label: __('Show Secondary Button', 'blockenberg'), checked: a.showSecCta, onChange: function (v) { setA({ showSecCta: v }); }, __nextHasNoMarginBottom: true }),
                    a.showSecCta && el(TextControl, { label: __('Secondary Button Label', 'blockenberg'), value: a.secCtaLabel, onChange: function (v) { setA({ secCtaLabel: v }); } }),
                    a.showSecCta && el(TextControl, { label: __('Secondary Button URL', 'blockenberg'), value: a.secCtaUrl, onChange: function (v) { setA({ secCtaUrl: v }); } })
                ),

                /* Image Gallery */
                el(PanelBody, { title: __('Product Images', 'blockenberg'), initialOpen: false },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function (m) { setA({ mainImageUrl: m.url, mainImageId: m.id }); },
                            allowedTypes: ['image'],
                            value: a.mainImageId,
                            render: function (ref) {
                                return el('div', { style: { marginBottom: '12px' } },
                                    a.mainImageUrl && el('img', { src: a.mainImageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '8px' } }),
                                    el(Button, { onClick: ref.open, variant: a.mainImageId ? 'secondary' : 'primary', style: { marginBottom: '6px' } },
                                        a.mainImageId ? __('Replace Main Image', 'blockenberg') : __('Select Main Image', 'blockenberg')
                                    ),
                                    a.mainImageId && el(Button, { onClick: function () { setA({ mainImageUrl: '', mainImageId: 0 }); }, variant: 'link', isDestructive: true }, __('Remove', 'blockenberg'))
                                );
                            }
                        })
                    ),
                    el('hr', { style: { margin: '8px 0' } }),
                    el('p', { style: { fontSize: '12px', color: '#6b7280', margin: '0 0 8px' } }, __('Gallery thumbnails', 'blockenberg')),
                    a.gallery.map(function (g, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' } },
                            g.url && el('img', { src: g.url, style: { width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' } }),
                            el(Button, { variant: 'link', isDestructive: true, onClick: function () { removeGalleryItem(idx); } }, __('Remove', 'blockenberg'))
                        );
                    }),
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function (m) { setA({ gallery: a.gallery.concat([{ url: m.url, id: m.id }]) }); },
                            allowedTypes: ['image'],
                            render: function (ref) {
                                return el(Button, { variant: 'secondary', onClick: ref.open }, __('+ Add Gallery Image', 'blockenberg'));
                            }
                        })
                    )
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Image Position', 'blockenberg'), value: a.imagePosition, options: IMAGE_POSITION_OPTIONS, onChange: function (v) { setA({ imagePosition: v }); } }),
                    el(SelectControl, { label: __('Image Aspect Ratio', 'blockenberg'), value: a.imageRatio, options: RATIO_OPTIONS, onChange: function (v) { setA({ imageRatio: v }); } }),
                    el(RangeControl, { label: __('Column Gap (px)', 'blockenberg'), value: a.gap, min: 0, max: 120, onChange: function (v) { setA({ gap: v }); } }),
                    el(RangeControl, { label: __('Card Border Radius', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function (v) { setA({ cardRadius: v }); } }),
                    el(RangeControl, { label: __('Card Padding', 'blockenberg'), value: a.cardPadding, min: 8, max: 80, onChange: function (v) { setA({ cardPadding: v }); } }),
                    el(RangeControl, { label: __('Image Border Radius', 'blockenberg'), value: a.imageRadius, min: 0, max: 40, onChange: function (v) { setA({ imageRadius: v }); } }),
                    el(RangeControl, { label: __('Button Radius', 'blockenberg'), value: a.ctaRadius, min: 0, max: 40, onChange: function (v) { setA({ ctaRadius: v }); } }),
                    el(RangeControl, { label: __('Badge Radius', 'blockenberg'), value: a.badgeRadius, min: 0, max: 99, onChange: function (v) { setA({ badgeRadius: v }); } })
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TC && el(TC, {label:__('Product Name','blockenberg'),typo:a.nameTypo||{},onChange:function(v){setA({nameTypo:v});}}),
                    TC && el(TC, {label:__('Tagline','blockenberg'),typo:a.taglineTypo||{},onChange:function(v){setA({taglineTypo:v});}}),
                    TC && el(TC, {label:__('Price','blockenberg'),typo:a.priceTypo||{},onChange:function(v){setA({priceTypo:v});}}),
                    TC && el(TC, {label:__('Feature Items','blockenberg'),typo:a.featureTypo||{},onChange:function(v){setA({featureTypo:v});}}),
                    TC && el(TC, {label:__('CTA Buttons','blockenberg'),typo:a.ctaTypo||{},onChange:function(v){setA({ctaTypo:v});}})
                ),

                /* Colors */
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    cc('bgColor',            __('Section Background', 'blockenberg'),   a.bgColor),
                    cc('cardBg',             __('Card Background', 'blockenberg'),      a.cardBg),
                    cc('borderColor',        __('Border Color', 'blockenberg'),         a.borderColor),
                    cc('nameColor',          __('Product Name', 'blockenberg'),         a.nameColor),
                    cc('taglineColor',       __('Tagline', 'blockenberg'),              a.taglineColor),
                    cc('priceColor',         __('Price', 'blockenberg'),                a.priceColor),
                    cc('originalPriceColor', __('Original Price', 'blockenberg'),       a.originalPriceColor),
                    cc('ratingStarColor',    __('Rating Stars', 'blockenberg'),         a.ratingStarColor),
                    cc('inStockColor',       __('In Stock Text', 'blockenberg'),        a.inStockColor),
                    cc('outStockColor',      __('Out of Stock Text', 'blockenberg'),    a.outStockColor),
                    cc('featureColor',       __('Feature Text', 'blockenberg'),         a.featureColor),
                    cc('featureIconColor',   __('Feature Icon', 'blockenberg'),         a.featureIconColor),
                    cc('badgeBg',            __('Badge Background', 'blockenberg'),     a.badgeBg),
                    cc('badgeColor',         __('Badge Text', 'blockenberg'),           a.badgeColor),
                    cc('tabActiveBg',        __('Active Tab Background', 'blockenberg'),a.tabActiveBg),
                    cc('tabActiveColor',     __('Active Tab Text', 'blockenberg'),      a.tabActiveColor),
                    cc('tabIdleBg',          __('Idle Tab Background', 'blockenberg'),  a.tabIdleBg),
                    cc('tabIdleColor',       __('Idle Tab Text', 'blockenberg'),        a.tabIdleColor),
                    cc('ctaBg',              __('Primary Button BG', 'blockenberg'),    a.ctaBg),
                    cc('ctaColor',           __('Primary Button Text', 'blockenberg'),  a.ctaColor),
                    cc('secCtaBg',           __('Secondary Button BG', 'blockenberg'),  a.secCtaBg),
                    cc('secCtaColor',        __('Secondary Button Text', 'blockenberg'),a.secCtaColor)
                ),

                /* Spacing */
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setA({ paddingTop: v }); } }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setA({ paddingBottom: v }); } })
                )
            );

            /* — Preview — */
            var formatPrice = function (p) {
                if (!p) return '';
                return a.currencyPos === 'before' ? a.currency + p : p + a.currency;
            };

            var isRight = a.imagePosition === 'right';

            var imageCol = el('div', { className: 'bkbg-ps-image-col' },
                el('div', { className: 'bkbg-ps-main-image-wrap', style: { aspectRatio: a.imageRatio, borderRadius: a.imageRadius + 'px', overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    a.mainImageUrl
                        ? el('img', { src: a.mainImageUrl, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                        : el('span', { style: { fontSize: '48px', opacity: 0.3 } }, '🖼')
                ),
                a.gallery.length > 0 && el('div', { style: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' } },
                    a.gallery.map(function (g, idx) {
                        return el('img', { key: idx, src: g.url, style: { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '2px solid ' + a.borderColor, cursor: 'pointer' } });
                    })
                )
            );

            var infoCol = el('div', { className: 'bkbg-ps-info-col', style: { flex: 1, minWidth: 0 } },
                /* Badge */
                a.showBadge && a.badge && el('span', { style: { display: 'inline-block', background: a.badgeBg, color: a.badgeColor, borderRadius: a.badgeRadius + 'px', fontSize: '12px', fontWeight: 700, padding: '4px 12px', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' } }, a.badge),
                /* Name */
                el('div', { className: 'bkbg-ps-name', style: { color: a.nameColor, lineHeight: 1.2, marginBottom: '8px' } }, a.productName),
                /* Tagline */
                a.tagline && el('div', { className: 'bkbg-ps-tagline', style: { color: a.taglineColor, marginBottom: '12px' } }, a.tagline),
                /* Rating */
                a.showRating && el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                    el(StarRating, { score: a.rating, color: a.ratingStarColor }),
                    el('span', { style: { fontSize: '13px', color: a.taglineColor } }, a.rating.toFixed(1) + ' (' + a.reviewCount.toLocaleString() + ' reviews)')
                ),
                /* Price row */
                el('div', { style: { display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' } },
                    el('span', { className: 'bkbg-ps-price', style: { color: a.priceColor } }, formatPrice(a.price)),
                    a.showOriginalPrice && a.originalPrice && el('span', { style: { fontSize: (a.priceSize * 0.62) + 'px', color: a.originalPriceColor, textDecoration: 'line-through' } }, formatPrice(a.originalPrice))
                ),
                /* SKU */
                a.showSku && a.sku && el('div', { style: { fontSize: '12px', color: a.taglineColor, marginBottom: '8px' } }, 'SKU: ' + a.sku),
                /* Stock */
                a.showStock && el('div', { style: { fontSize: '13px', fontWeight: 600, color: a.inStock ? a.inStockColor : a.outStockColor, marginBottom: '16px' } },
                    (a.inStock ? '● ' : '○ ') + a.stockText
                ),
                /* Variants */
                a.showVariants && a.variantGroups.length > 0 && el('div', { style: { marginBottom: '16px' } },
                    a.variantGroups.map(function (g) {
                        return el('div', { key: g.id, style: { marginBottom: '10px' } },
                            el('div', { style: { fontSize: '13px', fontWeight: 600, color: a.nameColor, marginBottom: '6px' } }, g.label + ':'),
                            el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                                (g.options || []).map(function (o, oidx) {
                                    return g.type === 'color'
                                        ? el('div', { key: o.id, title: o.label, style: { width: '28px', height: '28px', borderRadius: '50%', background: o.value, border: oidx === 0 ? '3px solid ' + a.ctaBg : '2px solid ' + a.borderColor, cursor: 'pointer' } })
                                        : el('button', { key: o.id, style: { padding: '5px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', background: oidx === 0 ? a.ctaBg : 'transparent', color: oidx === 0 ? a.ctaColor : a.nameColor, border: oidx === 0 ? '2px solid ' + a.ctaBg : '2px solid ' + a.borderColor, fontWeight: 600 } }, o.label);
                                })
                            )
                        );
                    })
                ),
                /* CTAs */
                el('div', { style: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' } },
                    a.ctaLabel && el('a', { href: a.ctaUrl || '#', className: 'bkbg-ps-cta bkbg-ps-cta--primary', style: { display: 'inline-block', padding: '12px 28px', background: a.ctaBg, color: a.ctaColor, borderRadius: a.ctaRadius + 'px' } }, a.ctaLabel),
                    a.showSecCta && a.secCtaLabel && el('a', { href: a.secCtaUrl || '#', className: 'bkbg-ps-cta bkbg-ps-cta--secondary', style: { display: 'inline-block', padding: '12px 28px', background: a.secCtaBg, color: a.secCtaColor, borderRadius: a.ctaRadius + 'px' } }, a.secCtaLabel)
                ),
                /* Trust Badges */
                a.showTrustBadges && a.trustBadges.length > 0 && el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid ' + a.borderColor, paddingTop: '16px', marginBottom: '20px' } },
                    a.trustBadges.map(function (b) {
                        return el('div', { key: b.id, style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: a.featureColor } },
                            el('span', { className: 'bkbg-ps-trust-icon' }, (b.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(b.iconType, b.icon, b.iconDashicon, b.iconImageUrl, b.iconDashiconColor) : b.icon),
                            el('span', null, b.text)
                        );
                    })
                ),
                /* Features */
                a.showFeatures && a.features.length > 0 && el('div', { style: { marginBottom: '20px' } },
                    a.featuresTitle && el('div', { style: { fontSize: '13px', fontWeight: 700, color: a.nameColor, marginBottom: '10px' } }, a.featuresTitle),
                    el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                        a.features.map(function (f) {
                            return el('li', { key: f.id, style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: a.featureColor, marginBottom: '6px' } },
                                el('span', { style: { color: a.featureIconColor, fontWeight: 700, flexShrink: 0 } }, (a.featureIconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(a.featureIconType, a.featureIcon, a.featureIconDashicon, a.featureIconImageUrl, a.featureIconDashiconColor) : a.featureIcon),
                                el('span', null, f.text)
                            );
                        })
                    )
                ),
                /* Tabs */
                a.showTabs && a.tabs.length > 0 && el('div', { style: { borderTop: '1px solid ' + a.borderColor, paddingTop: '16px' } },
                    el('div', { style: { display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' } },
                        a.tabs.map(function (t, idx) {
                            var isActive = idx === activeTabIdx;
                            return el('button', { key: t.id, onClick: function () { setActiveTabIdx(idx); }, style: { padding: '6px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', background: isActive ? a.tabActiveBg : a.tabIdleBg, color: isActive ? a.tabActiveColor : a.tabIdleColor } }, t.label);
                        })
                    ),
                    a.tabs[activeTabIdx] && el('div', { style: { fontSize: '14px', color: a.featureColor, lineHeight: 1.7 } }, a.tabs[activeTabIdx].content)
                )
            );

            var blockProps = useBlockProps((function(){
                var fn = getTypoCssVars();
                var s = Object.assign({}, buildWrapStyle(a), { maxWidth: '100%' });
                if(fn){
                    Object.assign(s, fn(a.nameTypo||{}, '--bkbg-ps-nm-'));
                    Object.assign(s, fn(a.taglineTypo||{}, '--bkbg-ps-tg-'));
                    Object.assign(s, fn(a.priceTypo||{}, '--bkbg-ps-pr-'));
                    Object.assign(s, fn(a.featureTypo||{}, '--bkbg-ps-ft-'));
                    Object.assign(s, fn(a.ctaTypo||{}, '--bkbg-ps-ct-'));
                }
                return { style: s };
            })());

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-ps-layout bkbg-ps-img-' + a.imagePosition, style: { display: 'flex', gap: a.gap + 'px', alignItems: 'flex-start', flexDirection: isRight ? 'row-reverse' : 'row' } },
                    imageCol,
                    infoCol
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var fn = getTypoCssVars();
            var s = Object.assign({}, buildWrapStyle(a));
            if(fn){
                Object.assign(s, fn(a.nameTypo||{}, '--bkbg-ps-nm-'));
                Object.assign(s, fn(a.taglineTypo||{}, '--bkbg-ps-tg-'));
                Object.assign(s, fn(a.priceTypo||{}, '--bkbg-ps-pr-'));
                Object.assign(s, fn(a.featureTypo||{}, '--bkbg-ps-ft-'));
                Object.assign(s, fn(a.ctaTypo||{}, '--bkbg-ps-ct-'));
            }
            return el('div', Object.assign({}, useBlockProps.save(), {
                className: 'bkbg-ps-wrap',
                style: s,
                'data-image-position': a.imagePosition,
                'data-image-ratio':    a.imageRatio,
                'data-show-tabs':      a.showTabs ? '1' : '0',
                'data-tabs':           JSON.stringify(a.tabs),
                'data-variants':       JSON.stringify(a.variantGroups),
                'data-gallery':        JSON.stringify(a.gallery),
            }),
                el('div', { className: 'bkbg-ps-layout bkbg-ps-img-' + a.imagePosition },
                    /* Image column */
                    el('div', { className: 'bkbg-ps-image-col' },
                        el('div', { className: 'bkbg-ps-main-image-wrap' },
                            a.mainImageUrl && el('img', { className: 'bkbg-ps-main-img', src: a.mainImageUrl, alt: a.productName, loading: 'lazy' })
                        ),
                        a.gallery.length > 0 && el('div', { className: 'bkbg-ps-gallery' },
                            a.gallery.map(function (g, idx) {
                                return el('img', { key: idx, className: 'bkbg-ps-thumb' + (idx === 0 ? ' bkbg-ps-thumb--active' : ''), src: g.url, alt: (a.productName + ' ' + (idx + 1)), loading: 'lazy', 'data-full': g.url });
                            })
                        )
                    ),
                    /* Info column */
                    el('div', { className: 'bkbg-ps-info-col' },
                        a.showBadge && a.badge && el('span', { className: 'bkbg-ps-badge' }, a.badge),
                        el('h2', { className: 'bkbg-ps-name' }, a.productName),
                        a.tagline && el('p', { className: 'bkbg-ps-tagline' }, a.tagline),
                        a.showRating && el('div', { className: 'bkbg-ps-rating', 'data-score': a.rating, 'data-count': a.reviewCount }),
                        el('div', { className: 'bkbg-ps-price-row' },
                            el('span', { className: 'bkbg-ps-price' }, a.currencyPos === 'before' ? a.currency + a.price : a.price + a.currency),
                            a.showOriginalPrice && a.originalPrice && el('span', { className: 'bkbg-ps-orig-price' }, a.currencyPos === 'before' ? a.currency + a.originalPrice : a.originalPrice + a.currency)
                        ),
                        a.showSku && a.sku && el('div', { className: 'bkbg-ps-sku' }, 'SKU: ' + a.sku),
                        a.showStock && el('div', { className: 'bkbg-ps-stock bkbg-ps-stock--' + (a.inStock ? 'in' : 'out') }, a.stockText),
                        a.showVariants && a.variantGroups.length > 0 && el('div', { className: 'bkbg-ps-variants' }),
                        el('div', { className: 'bkbg-ps-ctas' },
                            a.ctaLabel && el('a', { href: a.ctaUrl || '#', className: 'bkbg-ps-cta bkbg-ps-cta--primary' }, a.ctaLabel),
                            a.showSecCta && a.secCtaLabel && el('a', { href: a.secCtaUrl || '#', className: 'bkbg-ps-cta bkbg-ps-cta--secondary' }, a.secCtaLabel)
                        ),
                        a.showTrustBadges && a.trustBadges.length > 0 && el('div', { className: 'bkbg-ps-trust-badges' },
                            a.trustBadges.map(function (b) {
                                return el('div', { key: b.id, className: 'bkbg-ps-trust-badge' },
                                    el('span', { className: 'bkbg-ps-trust-icon' }, (b.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(b.iconType, b.icon, b.iconDashicon, b.iconImageUrl, b.iconDashiconColor) : b.icon),
                                    el('span', { className: 'bkbg-ps-trust-text' }, b.text)
                                );
                            })
                        ),
                        a.showFeatures && a.features.length > 0 && el('div', { className: 'bkbg-ps-features' },
                            a.featuresTitle && el('div', { className: 'bkbg-ps-features-title' }, a.featuresTitle),
                            el('ul', { className: 'bkbg-ps-feature-list' },
                                a.features.map(function (f) {
                                    return el('li', { key: f.id },
                                        el('span', { className: 'bkbg-ps-feature-icon' }, (a.featureIconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(a.featureIconType, a.featureIcon, a.featureIconDashicon, a.featureIconImageUrl, a.featureIconDashiconColor) : a.featureIcon),
                                        f.text
                                    );
                                })
                            )
                        ),
                        a.showTabs && a.tabs.length > 0 && el('div', { className: 'bkbg-ps-tabs-wrap' },
                            el('div', { className: 'bkbg-ps-tab-bar' },
                                a.tabs.map(function (t, idx) {
                                    return el('button', { key: t.id, className: 'bkbg-ps-tab-btn' + (idx === 0 ? ' bkbg-ps-tab-btn--active' : ''), 'data-tab': t.id }, t.label);
                                })
                            ),
                            el('div', { className: 'bkbg-ps-tab-panels' },
                                a.tabs.map(function (t, idx) {
                                    return el('div', { key: t.id, className: 'bkbg-ps-tab-panel' + (idx === 0 ? ' bkbg-ps-tab-panel--active' : ''), 'data-tab-panel': t.id }, t.content);
                                })
                            )
                        )
                    )
                )
            );
        },
    });
}() );
