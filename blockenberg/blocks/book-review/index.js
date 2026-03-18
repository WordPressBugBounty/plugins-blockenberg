( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    /* ── Helpers ─────────────────────────────────────────────────────── */

    function halfStarEl(starColor, key) {
        return el('span', { key: key, style:{ position:'relative', display:'inline-block', color:'#d1d5db', lineHeight:1 } },
            '★',
            el('span', { style:{ position:'absolute', left:0, top:0, width:'50%', overflow:'hidden', color: starColor } }, '★')
        );
    }

    function renderStars(rating, max, starColor) {
        var full     = Math.floor(rating);
        var half     = rating - full >= 0.5;
        var empty    = max - full - (half ? 1 : 0);
        var stars    = [];
        var i;
        for (i = 0; i < full; i++)  stars.push(el('span', { key:'f'+i, style:{ color: starColor } }, '★'));
        if (half)                    stars.push(halfStarEl(starColor, 'h'));
        for (i = 0; i < empty; i++) stars.push(el('span', { key:'e'+i, style:{ color:'#d1d5db'  } }, '★'));
        return el('span', { className:'bkbg-br-stars', style:{ letterSpacing:'2px', fontSize:'22px' } }, stars);
    }

    /* ── Editor preview component ──────────────────────────────────────── */
    function BookReviewPreview(props) {
        var a       = props.attributes;
        var setAttr = props.setAttributes;
        var cRadius = (a.cardRadius || 16) + 'px';
        var bRadius = (a.btnRadius  || 8)  + 'px';
        var maxW    = (a.maxWidth   || 860) + 'px';
        var covW    = (a.coverWidth || 160) + 'px';

        /* Cover image or placeholder */
        var cover = a.coverUrl
            ? el('img', { src: a.coverUrl, alt: a.coverAlt, className: 'bkbg-br-cover',
                style: { width: covW, flexShrink: 0, borderRadius: '8px', display: 'block', objectFit: 'cover' } })
            : el('div', { className: 'bkbg-br-cover-placeholder',
                style: { width: covW, flexShrink: 0, borderRadius: '8px', background: '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '220px', color: '#9ca3af', fontSize: '36px' } },
                '📖');

        /* Detail row helper */
        function detailRow(label, value) {
            if (!value) return null;
            return el('div', { className: 'bkbg-br-detail-row', style: { display:'flex', gap:'8px', marginBottom:'4px' } },
                el('span', { style: { color: a.detailLabelClr, fontSize:'13px', minWidth:'82px' } }, label + ':'),
                el('span', { style: { color: a.bodyColor, fontSize:'13px', fontWeight:600 } }, value)
            );
        }

        /* List editor (pros / cons) */
        function renderEditableList(key, items, color, icon) {
            return el('div', { className: 'bkbg-br-list' },
                items.map(function (item, idx) {
                    return el('div', { key: idx, style: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' } },
                        el('span', { style: { color: color, fontSize:'16px', flexShrink:0 } }, icon),
                        el('span', {
                            className: 'bkbg-br-list-text',
                            style: { color: a.bodyColor, flexGrow:1, display:'block' },
                            contentEditable: true,
                            suppressContentEditableWarning: true,
                            onBlur: function (e) {
                                var updated = items.slice();
                                updated[idx] = e.target.innerText.trim();
                                var obj = {};
                                obj[key] = updated;
                                setAttr(obj);
                            },
                            dangerouslySetInnerHTML: { __html: item }
                        }),
                        el(Button, {
                            icon: 'no-alt', isSmall: true,
                            style: { color:'#dc2626', flexShrink:0 },
                            onClick: function () {
                                var upd = items.filter(function (_, i) { return i !== idx; });
                                var obj = {}; obj[key] = upd; setAttr(obj);
                            }
                        })
                    );
                }),
                el(Button, {
                    variant: 'link', style: { marginTop:'4px', color: color, fontSize:'13px' },
                    onClick: function () { var upd = items.concat(['']); var obj={}; obj[key]=upd; setAttr(obj); }
                }, '+ Add item')
            );
        }

        return el('div', { style: { maxWidth: maxW, margin: '0 auto', border: '1px solid ' + a.borderColor, borderRadius: cRadius, overflow: 'hidden', background: a.cardBg, fontFamily: 'inherit' } },
            /* Header */
            el('div', { style: { background: a.headerBg, padding: '28px', display: 'flex', gap: '24px', alignItems: 'flex-start' } },
                cover,
                el('div', { style: { flex: 1, minWidth: 0 } },
                    /* Title */
                    el('div', {
                        className: 'bkbg-br-title',
                        contentEditable: true, suppressContentEditableWarning: true,
                        onBlur: function (e) { setAttr({ bookTitle: e.target.innerText.trim() }); },
                        dangerouslySetInnerHTML: { __html: a.bookTitle },
                        style: { color: a.titleColor, marginBottom: '4px', outline: 'none' }
                    }),
                    /* Author */
                    el('div', {
                        contentEditable: true, suppressContentEditableWarning: true,
                        onBlur: function (e) { setAttr({ bookAuthor: e.target.innerText.trim() }); },
                        dangerouslySetInnerHTML: { __html: a.bookAuthor },
                        style: { color: a.authorColor, fontWeight: 600, fontSize: '15px', marginBottom: '12px', outline: 'none' }
                    }),
                    /* Stars + label */
                    el('div', { style: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' } },
                        renderStars(a.rating, a.maxRating, a.starColor),
                        el('span', { style: { color: a.bodyColor, fontSize:'14px' } }, a.rating + ' / ' + a.maxRating + ' — ' + a.ratingLabel)
                    ),
                    /* Details grid */
                    a.showDetails && el('div', { style: { marginBottom:'8px' } },
                        detailRow('Genre',     a.genre),
                        detailRow('Publisher', a.publisher),
                        detailRow('Year',      a.publishYear),
                        detailRow('Pages',     a.pages),
                        a.isbn && detailRow('ISBN', a.isbn)
                    )
                )
            ),
            /* Body */
            el('div', { style: { padding: '24px 28px', background: a.cardBg } },
                /* Summary */
                el('div', { style: { marginBottom:'20px' } },
                    el('div', { style: { fontWeight:700, color: a.titleColor, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' } }, 'Review Summary'),
                    el('div', {
                        className: 'bkbg-br-summary',
                        contentEditable: true, suppressContentEditableWarning: true,
                        onBlur: function (e) { setAttr({ summary: e.target.innerHTML }); },
                        dangerouslySetInnerHTML: { __html: a.summary },
                        style: { color: a.bodyColor, outline:'none' }
                    })
                ),
                /* Pros / Cons */
                (a.showPros || a.showCons) && el('div', { style: { display:'grid', gridTemplateColumns: (a.showPros && a.showCons) ? '1fr 1fr' : '1fr', gap:'20px', marginBottom:'20px' } },
                    a.showPros && el('div', null,
                        el('div', { style: { fontWeight:700, color: a.prosColor, marginBottom:'8px', fontSize:'14px' } }, '✓ Pros'),
                        renderEditableList('pros', a.pros, a.prosColor, '✓')
                    ),
                    a.showCons && el('div', null,
                        el('div', { style: { fontWeight:700, color: a.consColor, marginBottom:'8px', fontSize:'14px' } }, '✗ Cons'),
                        renderEditableList('cons', a.cons, a.consColor, '✗')
                    )
                ),
                /* Button */
                a.showBtn && el('a', {
                    href: '#', className: 'bkbg-br-btn',
                    style: { display:'inline-block', background: a.btnBg, color: a.btnColor, borderRadius: bRadius,
                        padding:'12px 32px', fontWeight:700, fontSize:'15px', textDecoration:'none', cursor:'pointer' }
                }, a.btnText)
            )
        );
    }

    /* ── Register block ──────────────────────────────────────────────── */
    registerBlockType('blockenberg/book-review', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-book-review-block', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-br-title-'), _tv(a.typoBody, '--bkbg-br-body-')) });

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Book Details', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: 'Book title',   value: a.bookTitle,   onChange: function (v) { setAttr({ bookTitle: v }); } }),
                        el(TextControl, { label: 'Author',       value: a.bookAuthor,  onChange: function (v) { setAttr({ bookAuthor: v }); } }),
                        el(TextControl, { label: 'Genre',        value: a.genre,       onChange: function (v) { setAttr({ genre: v }); } }),
                        el(TextControl, { label: 'Publisher',    value: a.publisher,   onChange: function (v) { setAttr({ publisher: v }); } }),
                        el(TextControl, { label: 'Publish year', value: a.publishYear, onChange: function (v) { setAttr({ publishYear: v }); } }),
                        el(TextControl, { label: 'Pages',        value: a.pages,       onChange: function (v) { setAttr({ pages: v }); } }),
                        el(TextControl, { label: 'ISBN (optional)', value: a.isbn,     onChange: function (v) { setAttr({ isbn: v }); } }),
                        el(TextControl, { label: 'Cover image URL', value: a.coverUrl, onChange: function (v) { setAttr({ coverUrl: v }); } }),
                        el(TextControl, { label: 'Cover alt text',  value: a.coverAlt, onChange: function (v) { setAttr({ coverAlt: v }); } }),
                    ),
                    el(PanelBody, { title: __('Rating', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: 'Rating', value: a.rating, min: 0.5, max: 5, step: 0.5, onChange: function (v) { setAttr({ rating: v }); } }),
                        el(RangeControl, { label: 'Max rating', value: a.maxRating, min: 5, max: 10, step: 1, onChange: function (v) { setAttr({ maxRating: v }); } }),
                        el(TextControl, { label: 'Rating label', value: a.ratingLabel, onChange: function (v) { setAttr({ ratingLabel: v }); } }),
                    ),
                    el(PanelBody, { title: __('Buy Button', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: 'Show button', checked: a.showBtn, onChange: function (v) { setAttr({ showBtn: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBtn && el(TextControl, { label: 'Button text', value: a.btnText, onChange: function (v) { setAttr({ btnText: v }); } }),
                        a.showBtn && el(TextControl, { label: 'Button URL',  value: a.btnUrl,  onChange: function (v) { setAttr({ btnUrl: v }); } }),
                        a.showBtn && el(ToggleControl, { label: 'Open in new tab', checked: a.btnTarget, onChange: function (v) { setAttr({ btnTarget: v }); }, __nextHasNoMarginBottom: true }),
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: 'Show book details', checked: a.showDetails, onChange: function (v) { setAttr({ showDetails: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show pros',         checked: a.showPros,    onChange: function (v) { setAttr({ showPros: v }); },    __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show cons',         checked: a.showCons,    onChange: function (v) { setAttr({ showCons: v }); },    __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Inject Schema.org JSON-LD', checked: a.showSchema, onChange: function (v) { setAttr({ showSchema: v }); }, __nextHasNoMarginBottom: true }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Body Text', 'blockenberg'), value: a.typoBody, onChange: function (v) { setAttr({ typoBody: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false, colorSettings: [
                            { label: 'Accent',         value: a.accentColor,    onChange: function (v) { setAttr({ accentColor: v }); } },
                            { label: 'Card background',value: a.cardBg,         onChange: function (v) { setAttr({ cardBg: v }); } },
                            { label: 'Header background',value: a.headerBg,     onChange: function (v) { setAttr({ headerBg: v }); } },
                            { label: 'Border',         value: a.borderColor,    onChange: function (v) { setAttr({ borderColor: v }); } },
                            { label: 'Title',          value: a.titleColor,     onChange: function (v) { setAttr({ titleColor: v }); } },
                            { label: 'Author',         value: a.authorColor,    onChange: function (v) { setAttr({ authorColor: v }); } },
                            { label: 'Body text',      value: a.bodyColor,      onChange: function (v) { setAttr({ bodyColor: v }); } },
                            { label: 'Stars',          value: a.starColor,      onChange: function (v) { setAttr({ starColor: v }); } },
                            { label: 'Pros',           value: a.prosColor,      onChange: function (v) { setAttr({ prosColor: v }); } },
                            { label: 'Cons',           value: a.consColor,      onChange: function (v) { setAttr({ consColor: v }); } },
                            { label: 'Button bg',      value: a.btnBg,          onChange: function (v) { setAttr({ btnBg: v }); } },
                            { label: 'Button text',    value: a.btnColor,       onChange: function (v) { setAttr({ btnColor: v }); } },
                        ],
                    }),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: 'Max width (px)',  value: a.maxWidth,   min: 400, max: 1200, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Cover width (px)',value: a.coverWidth, min: 80,  max: 300,  step: 10, onChange: function (v) { setAttr({ coverWidth: v }); } }),
                        el(RangeControl, { label: 'Card radius (px)',value: a.cardRadius, min: 0,   max: 32,   onChange: function (v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Button radius (px)',value: a.btnRadius, min: 0,  max: 50,   onChange: function (v) { setAttr({ btnRadius: v }); } }),
                    )
                ),
                el(BookReviewPreview, { attributes: a, setAttributes: setAttr })
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-book-review-block' });
            return el('div', Object.assign({}, blockProps, {
                className: (blockProps.className || '') + ' bkbg-br-app',
                'data-opts': JSON.stringify(a),
            }));
        },
    });
}() );
