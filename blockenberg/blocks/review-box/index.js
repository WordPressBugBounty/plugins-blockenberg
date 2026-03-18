(function () {
    var el = window.wp.element.createElement;
    var __ = function (s) { return s; };
    var registerBlockType  = window.wp.blocks.registerBlockType;
    var InspectorControls  = window.wp.blockEditor.InspectorControls;
    var MediaUpload        = window.wp.blockEditor.MediaUpload;
    var MediaUploadCheck   = window.wp.blockEditor.MediaUploadCheck;
    var PanelBody          = window.wp.components.PanelBody;
    var ToggleControl      = window.wp.components.ToggleControl;
    var SelectControl      = window.wp.components.SelectControl;
    var RangeControl       = window.wp.components.RangeControl;
    var TextControl        = window.wp.components.TextControl;
    var TextareaControl    = window.wp.components.TextareaControl;
    var Button             = window.wp.components.Button;
    var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;
    var Fragment = window.wp.element.Fragment;
    var useBlockProps = window.wp.blockEditor.useBlockProps;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function genId() { return 'r' + Math.random().toString(36).slice(2,8); }

    function renderStars(score, max, color) {
        var stars = [];
        for (var i = 1; i <= max; i++) {
            var pct = Math.min(1, Math.max(0, score - (i-1))) * 100;
            stars.push(
                el('span', { key: i, style: { position:'relative', display:'inline-block', fontSize: 20, lineHeight:1 } },
                    el('span', { style: { color: '#d1d5db' } }, '★'),
                    el('span', { style: { position:'absolute', left:0, top:0, overflow:'hidden', width: pct+'%', color: color } }, '★')
                )
            );
        }
        return el('div', { style: { display:'flex', gap: 2 } }, stars);
    }

    registerBlockType('blockenberg/review-box', {
        title: __('Review Box'),
        description: __('Professional review card with score, pros/cons, and Schema.org markup.'),
        category: 'bkbg-blog',
        icon: el('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 24, height: 24 },
            el('path', { d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' })
        ),

        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;

            function updateList(list, key, id, val) {
                setA({ [key]: list.map(function (it) { return it.id === id ? Object.assign({}, it, { text: val }) : it; }) });
            }
            function removeFromList(list, key, id) {
                setA({ [key]: list.filter(function (it) { return it.id !== id; }) });
            }
            function addToList(list, key, placeholder) {
                setA({ [key]: list.concat([{ id: genId(), text: placeholder }]) });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Product Details'), initialOpen: true },
                    el(TextControl, { label: __('Product Name'),   value: a.productName, onChange: function (v) { setA({ productName: v }); } }),
                    el(TextControl, { label: __('Review Title'),   value: a.reviewTitle, onChange: function (v) { setA({ reviewTitle: v }); } }),
                    el(TextareaControl, { label: __('Summary / Verdict'), value: a.summary, rows: 3, onChange: function (v) { setA({ summary: v }); } }),
                    el(TextControl, { label: __('Price'),          value: a.price,       onChange: function (v) { setA({ price: v }); } }),
                    el(TextControl, { label: __('Price Label'),    value: a.priceLabel,  onChange: function (v) { setA({ priceLabel: v }); } })
                ),
                el(PanelBody, { title: __('Score'), initialOpen: false },
                    el(RangeControl, { label: __('Score'), value: a.score, min: 0, max: a.maxScore, step: 0.1, onChange: function (v) { setA({ score: v }); } }),
                    el(RangeControl, { label: __('Max Score'), value: a.maxScore, min: 5, max: 10, step: 1, onChange: function (v) { setA({ maxScore: v }); } }),
                    el(TextControl, { label: __('Score Label'), value: a.scoreLabel, onChange: function (v) { setA({ scoreLabel: v }); } })
                ),
                el(PanelBody, { title: __('Button'), initialOpen: false },
                    el(TextControl, { label: __('Button Label'), value: a.buttonLabel, onChange: function (v) { setA({ buttonLabel: v }); } }),
                    el(TextControl, { label: __('Button URL'),   value: a.buttonUrl,   onChange: function (v) { setA({ buttonUrl: v }); } }),
                    el(SelectControl, {
                        label: __('Button Style'), value: a.buttonStyle,
                        options: [
                            { label: 'Primary', value: 'primary' },
                            { label: 'Outline', value: 'outline' },
                            { label: 'Ghost',   value: 'ghost' },
                        ],
                        onChange: function (v) { setA({ buttonStyle: v }); },
                    })
                ),
                el(PanelBody, { title: __('Image'), initialOpen: false },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function (m) { setA({ imageUrl: m.url, imageId: m.id }); },
                            allowedTypes: ['image'],
                            value: a.imageId,
                            render: function (ref) {
                                return el('div', null,
                                    a.imageUrl && el('img', { src: a.imageUrl, style: { width: '100%', borderRadius: 6, marginBottom: 8 } }),
                                    el(Button, { onClick: ref.open, variant: a.imageId ? 'secondary' : 'primary', style: { marginBottom: 6 } },
                                        a.imageId ? __('Replace Image') : __('Select Image')),
                                    a.imageId && el(Button, { onClick: function () { setA({ imageUrl: '', imageId: 0 }); }, variant: 'link', isDestructive: true }, __('Remove Image'))
                                );
                            }
                        })
                    )
                ),
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    (function () { var TC = getTypoControl(); return TC ? [
                        el(TC, { key: 'tt', label: __('Product Name'), value: a.titleTypo, onChange: function (v) { setA({ titleTypo: v }); } }),
                        el(TC, { key: 'bt', label: __('Body Text'), value: a.bodyTypo, onChange: function (v) { setA({ bodyTypo: v }); } }),
                    ] : null; })()
                ),
                el(PanelBody, { title: __('Sizing'), initialOpen: false },
                    el(RangeControl, { label: __('Score Badge Size'), value: a.scoreSize, min: 32, max: 80, onChange: function (v) { setA({ scoreSize: v }); } }),
                    el(RangeControl, { label: __('Score Label Size (px)'), value: a.scoreLabelSize, min: 8, max: 18, __nextHasNoMarginBottom: true, onChange: function (v) { setA({ scoreLabelSize: v }); } }),
                    el(RangeControl, { label: __('Price Size (px)'), value: a.priceSize, min: 10, max: 32, __nextHasNoMarginBottom: true, onChange: function (v) { setA({ priceSize: v }); } }),
                    el(RangeControl, { label: __('Price Label Size (px)'), value: a.priceLabelSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { setA({ priceLabelSize: v }); } })
                ),
                el(PanelBody, { title: __('Schema & Style'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Enable Schema.org markup'), checked: a.schemaEnabled,
                        onChange: function (v) { setA({ schemaEnabled: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    a.schemaEnabled && el(SelectControl, {
                        label: __('Schema Type'), value: a.schemaType,
                        options: [
                            { label: 'Product',              value: 'Product' },
                            { label: 'Software Application', value: 'SoftwareApplication' },
                            { label: 'Book',                 value: 'Book' },
                            { label: 'Local Business',       value: 'LocalBusiness' },
                        ],
                        onChange: function (v) { setA({ schemaType: v }); },
                    }),
                    el(SelectControl, {
                        label: __('Skin'), value: a.skin,
                        options: [
                            { label: 'Bordered', value: 'bordered' },
                            { label: 'Shadow',   value: 'shadow'   },
                            { label: 'Gradient', value: 'gradient' },
                            { label: 'Flat',     value: 'flat'     },
                        ],
                        onChange: function (v) { setA({ skin: v }); },
                    }),
                    el(RangeControl, { label: __('Border Radius'), value: a.borderRadius, min: 0, max: 30, onChange: function (v) { setA({ borderRadius: v }); } }),
                    el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Card BG'),       value: a.bgColor,     onChange: function (v) { setA({ bgColor:     v || '#ffffff' }); } },
                            { label: __('Header BG'),     value: a.headerBg,    onChange: function (v) { setA({ headerBg:    v || '#f9fafb' }); } },
                            { label: __('Border'),        value: a.borderColor, onChange: function (v) { setA({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Star Color'),    value: a.starColor,   onChange: function (v) { setA({ starColor:   v || '#f59e0b' }); } },
                            { label: __('Pro Color'),     value: a.proColor,    onChange: function (v) { setA({ proColor:    v || '#10b981' }); } },
                            { label: __('Con Color'),     value: a.conColor,    onChange: function (v) { setA({ conColor:    v || '#ef4444' }); } },
                            { label: __('Score Badge BG'), value: a.scoreBg,   onChange: function (v) { setA({ scoreBg:     v || '#2563eb' }); } },
                            { label: __('Score Text'),    value: a.scoreColor,  onChange: function (v) { setA({ scoreColor:  v || '#ffffff' }); } },
                        ],
                    })
                )
            );

            /* Pros/Cons edit */
            var prosEdit = el(PanelBody, { title: __('Pros'), initialOpen: true },
                a.pros.map(function (p) {
                    return el('div', { key: p.id, style: { display:'flex', gap:6, marginBottom:6 } },
                        el(TextControl, { value: p.text, onChange: function (v) { updateList(a.pros, 'pros', p.id, v); }, style: { flex: 1 } }),
                        el(Button, { onClick: function () { removeFromList(a.pros, 'pros', p.id); }, icon: 'trash', isDestructive: true, label: 'Remove' })
                    );
                }),
                el(Button, { variant: 'secondary', onClick: function () { addToList(a.pros, 'pros', 'New pro point'); } }, '+ Add Pro')
            );
            var consEdit = el(PanelBody, { title: __('Cons'), initialOpen: true },
                a.cons.map(function (c) {
                    return el('div', { key: c.id, style: { display:'flex', gap:6, marginBottom:6 } },
                        el(TextControl, { value: c.text, onChange: function (v) { updateList(a.cons, 'cons', c.id, v); } }),
                        el(Button, { onClick: function () { removeFromList(a.cons, 'cons', c.id); }, icon: 'trash', isDestructive: true, label: 'Remove' })
                    );
                }),
                el(Button, { variant: 'secondary', onClick: function () { addToList(a.cons, 'cons', 'New con point'); } }, '+ Add Con')
            );

            /* ── Editor preview ── */
            var skinBorder = a.skin === 'bordered' ? '1px solid ' + a.borderColor : 'none';
            var skinShadow = a.skin === 'shadow'   ? '0 8px 24px rgba(0,0,0,0.12)' : 'none';

            var pct = (a.score / a.maxScore) * 100;

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {
                    background:    a.bgColor,
                    border:        skinBorder,
                    boxShadow:     skinShadow,
                    borderRadius:  a.borderRadius + 'px',
                    overflow:      'hidden',
                };
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrvb-tt-'));
                    Object.assign(s, _tvFn(a.bodyTypo || {}, '--bkrvb-bt-'));
                }
                return { className: 'bkbg-rvb-wrap bkbg-rvb-skin--' + a.skin, style: s };
            })());

            var preview = el('div', blockProps,
                /* Header */
                el('div', { style: { background: a.headerBg, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid ' + a.borderColor } },
                    el('div', null,
                        el('div', { style: { fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'#6b7280', marginBottom:4 } }, a.reviewTitle),
                        el('div', { className: 'bkbg-rvb-product-name' }, a.productName)
                    ),
                    el('div', { style: { textAlign:'center' } },
                        el('div', { style: { background: a.scoreBg, color: a.scoreColor, borderRadius: 10, padding: '8px 16px', fontSize: a.scoreSize * 0.6, fontWeight: 800 } },
                            a.score.toFixed(1)
                        ),
                        el('div', { style: { fontSize: (a.scoreLabelSize || 10), color:'#9ca3af', marginTop:4 } }, a.scoreLabel)
                    )
                ),
                /* Stars + bar */
                el('div', { style: { padding: '16px 24px', borderBottom: '1px solid ' + a.borderColor } },
                    renderStars(a.score, a.maxScore, a.starColor),
                    el('div', { style: { marginTop:8, background:'#e5e7eb', borderRadius:99, height:8, overflow:'hidden' } },
                        el('div', { style: { width: pct+'%', height:'100%', background: a.scoreBg, borderRadius:'inherit' } })
                    )
                ),
                /* Image + summary */
                el('div', { style: { padding: '16px 24px', display:'flex', gap:16, borderBottom: '1px solid ' + a.borderColor } },
                    a.imageUrl && el('img', { src: a.imageUrl, style: { width:100, height:100, objectFit:'cover', borderRadius:8, flexShrink:0 } }),
                    el('div', { className: 'bkbg-rvb-summary' },
                        a.summary && el('p', { style: { margin:'0 0 8px', color:'#374151' } }, a.summary),
                        a.price && el('div', { className: 'bkbg-rvb-price', style: { color:'#111827' } }, a.priceLabel + ': ' + a.price)
                    )
                ),
                /* Pros & Cons */
                el('div', { style: { padding:'16px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, borderBottom: '1px solid ' + a.borderColor } },
                    el('div', null,
                        el('div', { style: { fontWeight:700, fontSize:13, color: a.proColor, marginBottom:8 } }, '✓ Pros'),
                        a.pros.map(function (p) { return el('div', { key:p.id, style:{fontSize:13, color:'#374151', marginBottom:4, display:'flex', gap:6 } }, el('span',{style:{color:a.proColor}},'✓'), p.text); })
                    ),
                    el('div', null,
                        el('div', { style: { fontWeight:700, fontSize:13, color: a.conColor, marginBottom:8 } }, '✗ Cons'),
                        a.cons.map(function (c) { return el('div', { key:c.id, style:{fontSize:13, color:'#374151', marginBottom:4, display:'flex', gap:6 } }, el('span',{style:{color:a.conColor}},'✗'), c.text); })
                    )
                ),
                /* CTA */
                a.buttonLabel && a.buttonUrl && el('div', { style: { padding:'16px 24px' } },
                    el('a', {
                        href: a.buttonUrl,
                        style: {
                            display:'inline-flex', alignItems:'center', gap:6,
                            padding: '10px 22px', borderRadius:8,
                            background: a.buttonStyle === 'primary' ? a.scoreBg : 'transparent',
                            color:      a.buttonStyle === 'primary' ? '#ffffff' : a.scoreBg,
                            border:    '2px solid ' + a.scoreBg,
                            fontWeight:700, fontSize:14, textDecoration:'none',
                        }
                    }, a.buttonLabel, ' →')
                )
            );

            return el(Fragment, null,
                el(InspectorControls, null, prosEdit, consEdit, inspector.props.children),
                preview
            );
        },

        save: function (props) {
            var a = props.attributes;
            var pct = (a.score / a.maxScore) * 100;

            function starHTML(score, max, color) {
                var html = '';
                for (var i = 1; i <= max; i++) {
                    var p = Math.min(100, Math.max(0, (score - (i-1))) * 100);
                    html += '<span class="bkbg-rvb-star" style="--pct:' + p + '%;--color:' + color + '">★</span>';
                }
                return html;
            }

            var savStyle = {
                '--bkbg-rvb-bg':       a.bgColor,
                '--bkbg-rvb-hbg':      a.headerBg,
                '--bkbg-rvb-border':   a.borderColor,
                '--bkbg-rvb-radius':   a.borderRadius + 'px',
                '--bkbg-rvb-star':     a.starColor,
                '--bkbg-rvb-pro':      a.proColor,
                '--bkbg-rvb-con':      a.conColor,
                '--bkbg-rvb-score-bg': a.scoreBg,
                '--bkbg-rvb-score-c':  a.scoreColor,
            };
            var _tvFn = getTypoCssVars();
            if (_tvFn) {
                Object.assign(savStyle, _tvFn(a.titleTypo || {}, '--bkrvb-tt-'));
                Object.assign(savStyle, _tvFn(a.bodyTypo || {}, '--bkrvb-bt-'));
            }

            return el('div', {
                className: 'bkbg-rvb-wrap bkbg-rvb-skin--' + a.skin,
                style: savStyle,
                'data-schema':    a.schemaEnabled ? '1' : '0',
                'data-schema-type': a.schemaType,
                'data-name':      a.productName,
                'data-score':     a.score,
                'data-max-score': a.maxScore,
                'data-price':     a.price,
            },
                /* Header */
                el('div', { className: 'bkbg-rvb-header' },
                    el('div', { className: 'bkbg-rvb-header-text' },
                        el('div', { className: 'bkbg-rvb-pretitle' }, a.reviewTitle),
                        el('div', { className: 'bkbg-rvb-product-name' }, a.productName)
                    ),
                    el('div', { className: 'bkbg-rvb-score-badge' },
                        el('div', { className: 'bkbg-rvb-score-num', style: { fontSize: a.scoreSize * 0.6 + 'px' } }, a.score.toFixed(1)),
                        el('div', { className: 'bkbg-rvb-score-label', style: { fontSize: (a.scoreLabelSize || 10) + 'px' } }, a.scoreLabel)
                    )
                ),
                /* Stars */
                el('div', { className: 'bkbg-rvb-stars-row' },
                    el('div', { className: 'bkbg-rvb-stars', dangerouslySetInnerHTML: { __html: starHTML(a.score, a.maxScore, a.starColor) } }),
                    el('div', { className: 'bkbg-rvb-bar-wrap' },
                        el('div', { className: 'bkbg-rvb-bar', style: { width: pct + '%' } })
                    )
                ),
                /* Image + summary */
                el('div', { className: 'bkbg-rvb-body' },
                    a.imageUrl && el('img', { className: 'bkbg-rvb-thumb', src: a.imageUrl, alt: a.productName, loading: 'lazy' }),
                    el('div', { className: 'bkbg-rvb-summary' },
                        a.summary && el('p', null, a.summary),
                        a.price && el('div', { className: 'bkbg-rvb-price' }, a.priceLabel + ': ' + a.price)
                    )
                ),
                /* Pros & Cons */
                el('div', { className: 'bkbg-rvb-pros-cons' },
                    el('div', { className: 'bkbg-rvb-pros' },
                        el('div', { className: 'bkbg-rvb-pros-title' }, '✓ Pros'),
                        el('ul', null,
                            a.pros.map(function (p) { return el('li', { key: p.id }, p.text); })
                        )
                    ),
                    el('div', { className: 'bkbg-rvb-cons' },
                        el('div', { className: 'bkbg-rvb-cons-title' }, '✗ Cons'),
                        el('ul', null,
                            a.cons.map(function (c) { return el('li', { key: c.id }, c.text); })
                        )
                    )
                ),
                /* CTA */
                a.buttonLabel && a.buttonUrl && el('div', { className: 'bkbg-rvb-cta' },
                    el('a', {
                        href:      a.buttonUrl,
                        className: 'bkbg-rvb-btn bkbg-rvb-btn--' + a.buttonStyle,
                        target:    '_blank',
                        rel:       'noopener noreferrer nofollow',
                    }, a.buttonLabel + ' →')
                )
            );
        },

        deprecated: [{
            attributes: {
                productName: { type: 'string', default: 'Product Name' },
                reviewTitle: { type: 'string', default: 'Our Verdict' },
                summary: { type: 'string', default: '' },
                score: { type: 'number', default: 4.5 },
                maxScore: { type: 'number', default: 5 },
                scoreLabel: { type: 'string', default: 'Overall Score' },
                pros: { type: 'array', default: [{ id: 'pro-1', text: 'Excellent build quality' }, { id: 'pro-2', text: 'Great value for money' }, { id: 'pro-3', text: 'Easy to use' }] },
                cons: { type: 'array', default: [{ id: 'con-1', text: 'Limited color options' }, { id: 'con-2', text: 'Battery life could be better' }] },
                imageUrl: { type: 'string', default: '' },
                imageId: { type: 'number', default: 0 },
                price: { type: 'string', default: '' },
                priceLabel: { type: 'string', default: 'Price' },
                buttonLabel: { type: 'string', default: 'Buy Now' },
                buttonUrl: { type: 'string', default: '' },
                buttonStyle: { type: 'string', default: 'primary' },
                schemaType: { type: 'string', default: 'Product' },
                schemaEnabled: { type: 'boolean', default: true },
                skin: { type: 'string', default: 'bordered' },
                starColor: { type: 'string', default: '#f59e0b' },
                proColor: { type: 'string', default: '#10b981' },
                conColor: { type: 'string', default: '#ef4444' },
                headerBg: { type: 'string', default: '#f9fafb' },
                bgColor: { type: 'string', default: '#ffffff' },
                borderColor: { type: 'string', default: '#e5e7eb' },
                borderRadius: { type: 'number', default: 12 },
                scoreBg: { type: 'string', default: '#2563eb' },
                scoreColor: { type: 'string', default: '#ffffff' },
                scoreSize: { type: 'number', default: 48 },
                summarySize: { type: 'number', default: 14 },
                priceSize: { type: 'number', default: 14 },
                priceLabelSize: { type: 'number', default: 14 },
                scoreLabelSize: { type: 'number', default: 10 },
                productNameSize: { type: 'number', default: 22 },
            },
            save: function (props) {
                var a = props.attributes;
                var pct = (a.score / a.maxScore) * 100;
                function starHTML(score, max, color) {
                    var html = '';
                    for (var i = 1; i <= max; i++) {
                        var p = Math.min(100, Math.max(0, (score - (i-1))) * 100);
                        html += '<span class="bkbg-rvb-star" style="--pct:' + p + '%;--color:' + color + '">★</span>';
                    }
                    return html;
                }
                return el('div', {
                    className: 'bkbg-rvb-wrap bkbg-rvb-skin--' + a.skin,
                    style: {
                        '--bkbg-rvb-bg':       a.bgColor,
                        '--bkbg-rvb-hbg':      a.headerBg,
                        '--bkbg-rvb-border':   a.borderColor,
                        '--bkbg-rvb-radius':   a.borderRadius + 'px',
                        '--bkbg-rvb-star':     a.starColor,
                        '--bkbg-rvb-pro':      a.proColor,
                        '--bkbg-rvb-con':      a.conColor,
                        '--bkbg-rvb-score-bg': a.scoreBg,
                        '--bkbg-rvb-score-c':  a.scoreColor,
                    },
                    'data-schema':    a.schemaEnabled ? '1' : '0',
                    'data-schema-type': a.schemaType,
                    'data-name':      a.productName,
                    'data-score':     a.score,
                    'data-max-score': a.maxScore,
                    'data-price':     a.price,
                },
                    el('div', { className: 'bkbg-rvb-header' },
                        el('div', { className: 'bkbg-rvb-header-text' },
                            el('div', { className: 'bkbg-rvb-pretitle' }, a.reviewTitle),
                            el('div', { className: 'bkbg-rvb-product-name' }, a.productName)
                        ),
                        el('div', { className: 'bkbg-rvb-score-badge' },
                            el('div', { className: 'bkbg-rvb-score-num', style: { fontSize: a.scoreSize * 0.6 + 'px' } }, a.score.toFixed(1)),
                            el('div', { className: 'bkbg-rvb-score-label', style: { fontSize: (a.scoreLabelSize || 10) + 'px' } }, a.scoreLabel)
                        )
                    ),
                    el('div', { className: 'bkbg-rvb-stars-row' },
                        el('div', { className: 'bkbg-rvb-stars', dangerouslySetInnerHTML: { __html: starHTML(a.score, a.maxScore, a.starColor) } }),
                        el('div', { className: 'bkbg-rvb-bar-wrap' },
                            el('div', { className: 'bkbg-rvb-bar', style: { width: pct + '%' } })
                        )
                    ),
                    el('div', { className: 'bkbg-rvb-body' },
                        a.imageUrl && el('img', { className: 'bkbg-rvb-thumb', src: a.imageUrl, alt: a.productName, loading: 'lazy' }),
                        el('div', { className: 'bkbg-rvb-summary' },
                            a.summary && el('p', null, a.summary),
                            a.price && el('div', { className: 'bkbg-rvb-price' }, a.priceLabel + ': ' + a.price)
                        )
                    ),
                    el('div', { className: 'bkbg-rvb-pros-cons' },
                        el('div', { className: 'bkbg-rvb-pros' },
                            el('div', { className: 'bkbg-rvb-pros-title' }, '✓ Pros'),
                            el('ul', null,
                                a.pros.map(function (p) { return el('li', { key: p.id }, p.text); })
                            )
                        ),
                        el('div', { className: 'bkbg-rvb-cons' },
                            el('div', { className: 'bkbg-rvb-cons-title' }, '✗ Cons'),
                            el('ul', null,
                                a.cons.map(function (c) { return el('li', { key: c.id }, c.text); })
                            )
                        )
                    ),
                    a.buttonLabel && a.buttonUrl && el('div', { className: 'bkbg-rvb-cta' },
                        el('a', {
                            href:      a.buttonUrl,
                            className: 'bkbg-rvb-btn bkbg-rvb-btn--' + a.buttonStyle,
                            target:    '_blank',
                            rel:       'noopener noreferrer nofollow',
                        }, a.buttonLabel + ' →')
                    )
                );
            }
        }],
    });
})();
