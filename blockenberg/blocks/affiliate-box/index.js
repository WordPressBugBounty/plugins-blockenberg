( function () {
    var el               = wp.element.createElement;
    var useState         = wp.element.useState;
    var __               = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
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

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    var LAYOUT_OPTIONS = [
        { label: __('Horizontal (image left)', 'blockenberg'), value: 'horizontal' },
        { label: __('Vertical (image top)',    'blockenberg'), value: 'vertical' },
    ];
    var CTA_TARGET_OPTIONS = [
        { label: __('New Tab', 'blockenberg'), value: '_blank' },
        { label: __('Same Tab', 'blockenberg'), value: '_self' },
    ];

    function makeId() { return 'ab' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-ab-score-bg':         a.scoreBg,
            '--bkbg-ab-score-color':       a.scoreColor,
            '--bkbg-ab-pros-hd-color':     a.prosHeaderColor,
            '--bkbg-ab-pros-icon':         a.prosIconColor,
            '--bkbg-ab-pros-bg':           a.prosBg,
            '--bkbg-ab-cons-hd-color':     a.consHeaderColor,
            '--bkbg-ab-cons-icon':         a.consIconColor,
            '--bkbg-ab-cons-bg':           a.consBg,
            '--bkbg-ab-cta-bg':            a.ctaBg,
            '--bkbg-ab-cta-color':         a.ctaColor,
            '--bkbg-ab-verdict-bg':        a.verdictBg,
            '--bkbg-ab-verdict-border':    a.verdictBorderColor,
            '--bkbg-ab-verdict-color':     a.verdictColor,
            '--bkbg-ab-name-color':        a.nameColor,
            '--bkbg-ab-tagline-color':     a.taglineColor,
            '--bkbg-ab-card-bg':           a.cardBg,
            '--bkbg-ab-border-color':      a.borderColor,
            '--bkbg-ab-name-sz':           a.namSize + 'px',
            '--bkbg-ab-tagline-sz':        a.taglineSize + 'px',
            '--bkbg-ab-score-sz':          a.scoreSize + 'px',
            '--bkbg-ab-verdict-sz':        a.verdictSize + 'px',
            '--bkbg-ab-list-sz':           a.listItemSize + 'px',
            '--bkbg-ab-card-r':            a.cardRadius + 'px',
            '--bkbg-ab-card-pad':          a.cardPadding + 'px',
            '--bkbg-ab-score-r':           a.scoreRadius + 'px',
            '--bkbg-ab-verdict-r':         a.verdictRadius + 'px',
            '--bkbg-ab-cta-r':             a.ctaRadius + 'px',
            '--bkbg-ab-img-r':             a.imageRadius + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        var _tv = getTypoCssVars();
        Object.assign(s, _tv(a.nameTypo     || {}, '--bkbg-ab-name-'));
        Object.assign(s, _tv(a.taglineTypo  || {}, '--bkbg-ab-tagline-'));
        Object.assign(s, _tv(a.listTypo     || {}, '--bkbg-ab-list-'));
        Object.assign(s, _tv(a.verdictTypo  || {}, '--bkbg-ab-verdict-'));
        return s;
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

    registerBlockType('blockenberg/affiliate-box', {
        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;
            var openColor  = useState(null);
            var openKey    = openColor[0];
            var setOpenKey = openColor[1];

            function setColor(key) {
                return function (v) { var o = {}; o[key] = v; setA(o); };
            }
            function cc(key, label, val) {
                return renderColorControl(key, label, val, setColor(key), openKey, setOpenKey);
            }

            function updateListItem(listKey, list, id, val) {
                var o = {}; o[listKey] = list.map(function (it) { return it.id === id ? Object.assign({}, it, { text: val }) : it; }); setA(o);
            }
            function removeListItem(listKey, list, id) {
                var o = {}; o[listKey] = list.filter(function (it) { return it.id !== id; }); setA(o);
            }
            function addListItem(listKey, list, placeholder) {
                var o = {}; o[listKey] = list.concat([{ id: makeId(), text: placeholder }]); setA(o);
            }

            var inspector = el(InspectorControls, null,

                /* Product Info */
                el(PanelBody, { title: __('Product Info', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Product Name', 'blockenberg'), value: a.productName, onChange: function (v) { setA({ productName: v }); } }),
                    el(TextControl, { label: __('Tagline', 'blockenberg'), value: a.tagline, onChange: function (v) { setA({ tagline: v }); } }),
                    el(ToggleControl, { label: __('Show Product Image', 'blockenberg'), checked: a.showImage, onChange: function (v) { setA({ showImage: v }); }, __nextHasNoMarginBottom: true }),
                    a.showImage && el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function (m) { setA({ imageUrl: m.url, imageId: m.id }); },
                            allowedTypes: ['image'],
                            value: a.imageId,
                            render: function (ref) {
                                return el('div', null,
                                    a.imageUrl && el('img', { src: a.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '8px' } }),
                                    el(Button, { onClick: ref.open, variant: a.imageId ? 'secondary' : 'primary', style: { marginBottom: '4px' } },
                                        a.imageId ? __('Replace Image', 'blockenberg') : __('Select Image', 'blockenberg')
                                    ),
                                    a.imageId && el(Button, { onClick: function () { setA({ imageUrl: '', imageId: 0 }); }, variant: 'link', isDestructive: true }, __('Remove', 'blockenberg'))
                                );
                            }
                        })
                    )
                ),

                /* Score */
                el(PanelBody, { title: __('Score & Verdict', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Score Badge', 'blockenberg'), checked: a.showScore, onChange: function (v) { setA({ showScore: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Overall Score', 'blockenberg'), value: a.overallScore, min: 0, max: a.maxScore, step: 0.1, onChange: function (v) { setA({ overallScore: v }); } }),
                    el(RangeControl, { label: __('Max Score', 'blockenberg'), value: a.maxScore, min: 5, max: 10, step: 1, onChange: function (v) { setA({ maxScore: v }); } }),
                    el(TextControl, { label: __('Score Label', 'blockenberg'), value: a.scoreLabel, onChange: function (v) { setA({ scoreLabel: v }); } }),
                    el(ToggleControl, { label: __('Show Verdict Box', 'blockenberg'), checked: a.showVerdict, onChange: function (v) { setA({ showVerdict: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Verdict Label', 'blockenberg'), value: a.verdictLabel, onChange: function (v) { setA({ verdictLabel: v }); } }),
                    el(TextControl, { label: __('Verdict Text', 'blockenberg'), value: a.verdict, onChange: function (v) { setA({ verdict: v }); } })
                ),

                /* Pros */
                el(PanelBody, { title: __('Pros', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Section Label', 'blockenberg'), value: a.prosLabel, onChange: function (v) { setA({ prosLabel: v }); } }),
                    a.pros.map(function (p) {
                        return el('div', { key: p.id, style: { display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' } },
                            el(TextControl, { value: p.text, onChange: function (v) { updateListItem('pros', a.pros, p.id, v); }, style: { flex: 1, margin: 0 } }),
                            el(Button, { onClick: function () { removeListItem('pros', a.pros, p.id); }, icon: 'trash', isDestructive: true, label: __('Remove', 'blockenberg') })
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: function () { addListItem('pros', a.pros, 'New advantage'); } }, __('+ Add Pro', 'blockenberg'))
                ),

                /* Cons */
                el(PanelBody, { title: __('Cons', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Section Label', 'blockenberg'), value: a.consLabel, onChange: function (v) { setA({ consLabel: v }); } }),
                    a.cons.map(function (c) {
                        return el('div', { key: c.id, style: { display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' } },
                            el(TextControl, { value: c.text, onChange: function (v) { updateListItem('cons', a.cons, c.id, v); }, style: { flex: 1, margin: 0 } }),
                            el(Button, { onClick: function () { removeListItem('cons', a.cons, c.id); }, icon: 'trash', isDestructive: true, label: __('Remove', 'blockenberg') })
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: function () { addListItem('cons', a.cons, 'New disadvantage'); } }, __('+ Add Con', 'blockenberg'))
                ),

                /* Price & CTA */
                el(PanelBody, { title: __('Price & CTA', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Price', 'blockenberg'), checked: a.showPrice, onChange: function (v) { setA({ showPrice: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.currency, onChange: function (v) { setA({ currency: v }); } }),
                    el(TextControl, { label: __('Price', 'blockenberg'), value: a.price, onChange: function (v) { setA({ price: v }); } }),
                    el(TextControl, { label: __('Original Price', 'blockenberg'), value: a.originalPrice, onChange: function (v) { setA({ originalPrice: v }); } }),
                    el(ToggleControl, { label: __('Show Strikethrough Price', 'blockenberg'), checked: a.showOriginalPrice, onChange: function (v) { setA({ showOriginalPrice: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('CTA Button Label', 'blockenberg'), value: a.ctaLabel, onChange: function (v) { setA({ ctaLabel: v }); } }),
                    el(TextControl, { label: __('CTA URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { setA({ ctaUrl: v }); } }),
                    el(SelectControl, { label: __('Open Link In', 'blockenberg'), value: a.ctaTarget, options: CTA_TARGET_OPTIONS, onChange: function (v) { setA({ ctaTarget: v }); } }),
                    el(ToggleControl, { label: __('Show Affiliate Disclosure', 'blockenberg'), checked: a.showAffiliateNote, onChange: function (v) { setA({ showAffiliateNote: v }); }, __nextHasNoMarginBottom: true }),
                    a.showAffiliateNote && el(TextControl, { label: __('Disclosure Text', 'blockenberg'), value: a.affiliateNote, onChange: function (v) { setA({ affiliateNote: v }); } })
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setA({ layout: v }); } }),
                    el(RangeControl, { label: __('Card Border Radius', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function (v) { setA({ cardRadius: v }); } }),
                    el(RangeControl, { label: __('Card Padding', 'blockenberg'), value: a.cardPadding, min: 8, max: 80, onChange: function (v) { setA({ cardPadding: v }); } }),
                    el(RangeControl, { label: __('Image Border Radius', 'blockenberg'), value: a.imageRadius, min: 0, max: 40, onChange: function (v) { setA({ imageRadius: v }); } }),
                    el(RangeControl, { label: __('Score Badge Radius', 'blockenberg'), value: a.scoreRadius, min: 0, max: 40, onChange: function (v) { setA({ scoreRadius: v }); } }),
                    el(RangeControl, { label: __('Verdict Box Radius', 'blockenberg'), value: a.verdictRadius, min: 0, max: 40, onChange: function (v) { setA({ verdictRadius: v }); } }),
                    el(RangeControl, { label: __('Button Radius', 'blockenberg'), value: a.ctaRadius, min: 0, max: 40, onChange: function (v) { setA({ ctaRadius: v }); } })
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                        return el(wp.element.Fragment, {},
                            el(TC, { label: __('Product Name', 'blockenberg'), value: a.nameTypo || {}, onChange: function (v) { setA({ nameTypo: v }); } }),
                            el(TC, { label: __('Tagline', 'blockenberg'), value: a.taglineTypo || {}, onChange: function (v) { setA({ taglineTypo: v }); } }),
                            el(TC, { label: __('List Items', 'blockenberg'), value: a.listTypo || {}, onChange: function (v) { setA({ listTypo: v }); } }),
                            el(TC, { label: __('Verdict', 'blockenberg'), value: a.verdictTypo || {}, onChange: function (v) { setA({ verdictTypo: v }); } }),
                            el(RangeControl, { label: __('Score Number Size', 'blockenberg'), value: a.scoreSize, min: 28, max: 80, onChange: function (v) { setA({ scoreSize: v }); } })
                        );
                    })()
                ),

                /* Colors */
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    cc('bgColor',          __('Section Background', 'blockenberg'),  a.bgColor),
                    cc('cardBg',           __('Card Background', 'blockenberg'),     a.cardBg),
                    cc('borderColor',      __('Border Color', 'blockenberg'),        a.borderColor),
                    cc('nameColor',        __('Product Name', 'blockenberg'),        a.nameColor),
                    cc('taglineColor',     __('Tagline', 'blockenberg'),             a.taglineColor),
                    cc('scoreBg',          __('Score Badge Background', 'blockenberg'), a.scoreBg),
                    cc('scoreColor',       __('Score Badge Text', 'blockenberg'),    a.scoreColor),
                    cc('prosBg',           __('Pros Box Background', 'blockenberg'), a.prosBg),
                    cc('prosHeaderColor',  __('Pros Label Color', 'blockenberg'),    a.prosHeaderColor),
                    cc('prosIconColor',    __('Pros Check Icon', 'blockenberg'),     a.prosIconColor),
                    cc('consBg',           __('Cons Box Background', 'blockenberg'), a.consBg),
                    cc('consHeaderColor',  __('Cons Label Color', 'blockenberg'),    a.consHeaderColor),
                    cc('consIconColor',    __('Cons X Icon', 'blockenberg'),         a.consIconColor),
                    cc('verdictBg',        __('Verdict Box Background', 'blockenberg'), a.verdictBg),
                    cc('verdictBorderColor', __('Verdict Border', 'blockenberg'),   a.verdictBorderColor),
                    cc('verdictColor',     __('Verdict Text', 'blockenberg'),        a.verdictColor),
                    cc('ctaBg',            __('Button Background', 'blockenberg'),   a.ctaBg),
                    cc('ctaColor',         __('Button Text', 'blockenberg'),         a.ctaColor)
                ),

                /* Spacing */
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setA({ paddingTop: v }); } }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setA({ paddingBottom: v }); } })
                )
            );

            /* — Preview — */
            var isHorizontal = a.layout === 'horizontal';

            var scorePct = Math.round((a.overallScore / a.maxScore) * 100);

            var previewStyle = {
                background:    a.cardBg,
                border:        '1px solid ' + a.borderColor,
                borderRadius:  a.cardRadius + 'px',
                overflow:      'hidden',
                fontFamily:    'sans-serif',
            };

            /* Top header row: image + name/tagline + score */
            var headerRow = el('div', { style: { display: 'flex', gap: '20px', alignItems: 'center', padding: a.cardPadding + 'px', borderBottom: '1px solid ' + a.borderColor, flexDirection: isHorizontal ? 'row' : 'column' } },
                a.showImage && a.imageUrl && el('img', { src: a.imageUrl, style: { width: isHorizontal ? '140px' : '100%', height: isHorizontal ? '140px' : '200px', objectFit: 'cover', borderRadius: a.imageRadius + 'px', flexShrink: 0 } }),
                el('div', { style: { flex: 1, minWidth: 0 } },
                    el('div', { className: 'bkbg-ab-name', style: { color: a.nameColor, marginBottom: '6px' } }, a.productName),
                    a.tagline && el('div', { className: 'bkbg-ab-tagline', style: { color: a.taglineColor } }, a.tagline)
                ),
                a.showScore && el('div', { style: { textAlign: 'center', flexShrink: 0 } },
                    el('div', { style: { background: a.scoreBg, color: a.scoreColor, borderRadius: a.scoreRadius + 'px', padding: '12px 20px', marginBottom: '4px' } },
                        el('span', { style: { fontSize: a.scoreSize + 'px', fontWeight: 900, lineHeight: 1 } }, a.overallScore.toFixed(1)),
                        el('span', { style: { fontSize: (a.scoreSize * 0.45) + 'px', opacity: 0.8 } }, '/' + a.maxScore)
                    ),
                    el('div', { style: { fontSize: '11px', color: a.taglineColor, fontWeight: 600 } }, a.scoreLabel),
                    el('div', { style: { height: '6px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden', marginTop: '6px', width: '80px', marginLeft: 'auto', marginRight: 'auto' } },
                        el('div', { style: { width: scorePct + '%', height: '100%', background: a.scoreBg, borderRadius: 'inherit' } })
                    )
                )
            );

            /* Pros / Cons two columns */
            var prosConsRow = el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderBottom: '1px solid ' + a.borderColor } },
                el('div', { style: { background: a.prosBg, padding: a.cardPadding + 'px', borderRight: '1px solid ' + a.borderColor } },
                    el('div', { className: 'bkbg-ab-pros-header', style: { color: a.prosHeaderColor, marginBottom: '10px' } }, '✓ ' + a.prosLabel),
                    el('ul', { className: 'bkbg-ab-list', style: { margin: 0, padding: 0, listStyle: 'none' } },
                        a.pros.map(function (p) {
                            return el('li', { key: p.id, style: { display: 'flex', gap: '8px', color: '#374151', marginBottom: '7px' } },
                                el('span', { style: { color: a.prosIconColor, fontWeight: 700, flexShrink: 0 } }, '✓'),
                                p.text
                            );
                        })
                    )
                ),
                el('div', { style: { background: a.consBg, padding: a.cardPadding + 'px' } },
                    el('div', { className: 'bkbg-ab-cons-header', style: { color: a.consHeaderColor, marginBottom: '10px' } }, '✗ ' + a.consLabel),
                    el('ul', { className: 'bkbg-ab-list', style: { margin: 0, padding: 0, listStyle: 'none' } },
                        a.cons.map(function (c) {
                            return el('li', { key: c.id, style: { display: 'flex', gap: '8px', color: '#374151', marginBottom: '7px' } },
                                el('span', { style: { color: a.consIconColor, fontWeight: 700, flexShrink: 0 } }, '✗'),
                                c.text
                            );
                        })
                    )
                )
            );

            /* Verdict */
            var verdictBox = a.showVerdict && el('div', { style: { padding: a.cardPadding + 'px', borderBottom: '1px solid ' + a.borderColor } },
                el('div', { style: { background: a.verdictBg, borderLeft: '4px solid ' + a.verdictBorderColor, borderRadius: a.verdictRadius + 'px', padding: '14px 18px' } },
                    el('div', { style: { fontSize: '11px', fontWeight: 700, color: a.verdictBorderColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' } }, a.verdictLabel),
                    el('div', { className: 'bkbg-ab-verdict-text', style: { color: a.verdictColor } }, a.verdict)
                )
            );

            /* CTA */
            var ctaRow = el('div', { style: { padding: a.cardPadding + 'px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' } },
                a.showPrice && el('div', null,
                    el('span', { style: { fontSize: '26px', fontWeight: 800, color: a.nameColor } }, a.currency + a.price),
                    a.showOriginalPrice && a.originalPrice && el('span', { style: { fontSize: '16px', color: a.taglineColor, textDecoration: 'line-through', marginLeft: '10px' } }, a.currency + a.originalPrice)
                ),
                el('a', { href: a.ctaUrl || '#', style: { display: 'inline-block', padding: '12px 28px', background: a.ctaBg, color: a.ctaColor, borderRadius: a.ctaRadius + 'px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' } }, a.ctaLabel)
            );

            var affiliateNote = a.showAffiliateNote && el('div', { style: { padding: '8px ' + a.cardPadding + 'px', fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', borderTop: '1px solid ' + a.borderColor } }, a.affiliateNote);

            return el('div', useBlockProps({ className: 'bkbg-ab-wrap', style: buildWrapStyle(a) }),
                inspector,
                el('div', { style: previewStyle },
                    headerRow,
                    prosConsRow,
                    verdictBox,
                    ctaRow,
                    affiliateNote
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', Object.assign({}, useBlockProps.save(), {
                className: 'bkbg-ab-wrap',
                style: buildWrapStyle(a),
                'data-layout': a.layout,
            }),
                el('div', { className: 'bkbg-ab-card' },
                    /* Header */
                    el('div', { className: 'bkbg-ab-header bkbg-ab-header--' + a.layout },
                        a.showImage && a.imageUrl && el('img', { className: 'bkbg-ab-image', src: a.imageUrl, alt: a.productName, loading: 'lazy' }),
                        el('div', { className: 'bkbg-ab-product-info' },
                            el('h3', { className: 'bkbg-ab-name' }, a.productName),
                            a.tagline && el('p', { className: 'bkbg-ab-tagline' }, a.tagline)
                        ),
                        a.showScore && el('div', { className: 'bkbg-ab-score-wrap' },
                            el('div', { className: 'bkbg-ab-score-badge' },
                                el('span', { className: 'bkbg-ab-score-num' }, a.overallScore.toFixed(1)),
                                el('span', { className: 'bkbg-ab-score-denom' }, '/' + a.maxScore)
                            ),
                            el('div', { className: 'bkbg-ab-score-label' }, a.scoreLabel),
                            el('div', { className: 'bkbg-ab-score-bar-wrap' },
                                el('div', { className: 'bkbg-ab-score-bar', style: { width: Math.round((a.overallScore / a.maxScore) * 100) + '%' } })
                            )
                        )
                    ),
                    /* Pros & Cons */
                    el('div', { className: 'bkbg-ab-pros-cons' },
                        el('div', { className: 'bkbg-ab-pros' },
                            el('div', { className: 'bkbg-ab-pros-header' }, '✓ ' + a.prosLabel),
                            el('ul', { className: 'bkbg-ab-list' },
                                a.pros.map(function (p) { return el('li', { key: p.id }, el('span', { className: 'bkbg-ab-list-icon bkbg-ab-list-icon--pro' }, '✓'), p.text); })
                            )
                        ),
                        el('div', { className: 'bkbg-ab-cons' },
                            el('div', { className: 'bkbg-ab-cons-header' }, '✗ ' + a.consLabel),
                            el('ul', { className: 'bkbg-ab-list' },
                                a.cons.map(function (c) { return el('li', { key: c.id }, el('span', { className: 'bkbg-ab-list-icon bkbg-ab-list-icon--con' }, '✗'), c.text); })
                            )
                        )
                    ),
                    /* Verdict */
                    a.showVerdict && el('div', { className: 'bkbg-ab-verdict-wrap' },
                        el('div', { className: 'bkbg-ab-verdict-box' },
                            el('div', { className: 'bkbg-ab-verdict-label' }, a.verdictLabel),
                            el('p', { className: 'bkbg-ab-verdict-text' }, a.verdict)
                        )
                    ),
                    /* CTA */
                    el('div', { className: 'bkbg-ab-cta-row' },
                        a.showPrice && el('div', { className: 'bkbg-ab-price-display' },
                            el('span', { className: 'bkbg-ab-price' }, a.currency + a.price),
                            a.showOriginalPrice && a.originalPrice && el('span', { className: 'bkbg-ab-orig-price' }, a.currency + a.originalPrice)
                        ),
                        el('a', { href: a.ctaUrl || '#', className: 'bkbg-ab-cta-btn', target: a.ctaTarget, rel: 'noopener noreferrer nofollow' }, a.ctaLabel)
                    ),
                    /* Affiliate note */
                    a.showAffiliateNote && el('p', { className: 'bkbg-ab-affiliate-note' }, a.affiliateNote)
                )
            );
        },
    });
}() );
