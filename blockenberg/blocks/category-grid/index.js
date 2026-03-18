( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var useState          = wp.element.useState;
    var useEffect         = wp.element.useEffect;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var ColorPicker        = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;
    var Spinner           = wp.components.Spinner;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }
    var IP = function () { return window.bkbgIconPicker; };

    /* ── demo categories for editor preview ──────────────────────────────────── */
    var DEMO_CATS = [
        { id: 1, name: 'Technology', count: 42, description: 'The latest in tech news and reviews.', link: '#', emoji: '💻' },
        { id: 2, name: 'Design',     count: 28, description: 'UI/UX, branding, and visual art.',      link: '#', emoji: '🎨' },
        { id: 3, name: 'Business',   count: 35, description: 'Strategy, finance, and growth.',        link: '#', emoji: '📊' },
        { id: 4, name: 'Travel',     count: 19, description: 'Destinations and travel guides.',       link: '#', emoji: '✈️' },
        { id: 5, name: 'Food',       count: 24, description: 'Recipes, restaurants, and culture.',   link: '#', emoji: '🍕' },
        { id: 6, name: 'Science',    count: 16, description: 'Discoveries and research.',            link: '#', emoji: '🔬' },
    ];

    /* ── color picker helper ─────────────────────────────────────────────────── */
    function getCatColor(index, a) {
        if (a.colorMode === 'multi') {
            var cols = a.multiColors.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
            return cols[index % cols.length] || a.accentColor;
        }
        return a.accentColor;
    }

    /* ── single category card ────────────────────────────────────────────────── */
    function CatCard(props) {
        var cat   = props.cat;
        var index = props.index;
        var a     = props.attrs;
        var isEdit = props.isEdit;

        var accent = getCatColor(index, a);
        var useChar = !a.iconType || a.iconType === 'custom-char';
        var emoji  = useChar ? (cat.emoji || a.defaultIcon || '📁') : null;

        var cardStyle = {
            background: a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding: a.cardPadding + 'px',
            boxShadow: a.cardShadow ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
            border: a.cardBorder ? '1px solid ' + a.borderColor : 'none',
            textAlign: a.textAlign,
            display: 'flex',
            flexDirection: a.iconPosition === 'left' ? 'row' : 'column',
            alignItems: a.iconPosition === 'left' ? 'flex-start' : (a.textAlign === 'center' ? 'center' : 'flex-start'),
            gap: a.iconPosition === 'left' ? '12px' : '8px',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
        };

        /* top accent bar */
        var showBar = a.cardStyle === 'card-accent';

        return el('a', {
            href: isEdit ? undefined : (cat.link || '#'),
            className: 'bkcg-card',
            target: a.linkTarget,
            rel: a.linkTarget === '_blank' ? 'noopener noreferrer' : undefined,
            style: cardStyle,
            'data-bg-hover': a.cardBgHover,
            'data-bg': a.cardBg,
        },
            showBar && el('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent } }),

            a.showIcon && el('div', {
                className: 'bkcg-icon',
                style: {
                    fontSize: a.iconSize + 'px',
                    lineHeight: 1,
                    flexShrink: 0,
                    background: a.cardStyle === 'icon-circle' ? accent + '18' : 'transparent',
                    width: a.cardStyle === 'icon-circle' ? (a.iconSize * 1.8) + 'px' : undefined,
                    height: a.cardStyle === 'icon-circle' ? (a.iconSize * 1.8) + 'px' : undefined,
                    borderRadius: a.cardStyle === 'icon-circle' ? '50%' : undefined,
                    display: a.cardStyle === 'icon-circle' ? 'flex' : 'block',
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            }, useChar ? emoji : IP().buildEditorIcon(a.iconType, a.defaultIcon, a.iconDashicon, a.iconImageUrl, a.iconDashiconColor)),

            el('div', { className: 'bkcg-body', style: { flex: 1, minWidth: 0 } },
                el('p', {
                    className: 'bkcg-name',
                    style: { margin: '0 0 4px', color: a.nameColor }
                }, cat.name),

                a.showCount && el('span', {
                    className: 'bkcg-count',
                    style: {
                        display: 'inline-block', background: a.countBg, color: a.countColor,
                        borderRadius: '999px', padding: '1px 8px', fontSize: '11px', fontWeight: 600, marginBottom: '6px'
                    }
                }, cat.count + ' ' + (a.countLabel || 'posts')),

                a.showDescription && cat.description && el('p', {
                    className: 'bkcg-desc',
                    style: { margin: '4px 0 0', color: a.descColor, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }
                }, cat.description),

                a.showArrow && el('span', {
                    className: 'bkcg-arrow',
                    style: { display: 'block', marginTop: '8px', color: accent, fontSize: '18px', transition: 'transform 0.2s ease' }
                }, '→')
            )
        );
    }

    /* ── edit ───────────────────────────────────────────────────────────────── */
    function Edit(props) {
        var attributes   = props.attributes;
        var setAttributes = props.setAttributes;
        var a            = attributes;

        /* In editor: load real categories via apiFetch for live preview */
        var catsState  = useState(null);
        var cats       = catsState[0];
        var setCats    = catsState[1];
        var errorState = useState(null);
        var loadErr    = errorState[0];
        var setErr     = errorState[1];

        useEffect(function () {
            if (!wp.apiFetch) { setCats(DEMO_CATS); return; }
            var params = '?per_page=' + a.maxCategories + '&orderby=' + a.orderBy + '&order=' + a.order;
            if (a.hideEmpty) { params += '&hide_empty=true'; }
            if (a.excludeIds) { params += '&exclude=' + a.excludeIds; }
            if (a.includeIds) { params += '&include=' + a.includeIds; }

            wp.apiFetch({ path: '/wp/v2/categories' + params })
                .then(function (data) {
                    var mapped = data.map(function (c, i) {
                        return {
                            id: c.id,
                            name: c.name,
                            count: c.count,
                            description: c.description ? c.description.replace(/<[^>]+>/g, '').slice(0, a.maxDescriptionLength) : '',
                            link: c.link || '#',
                            emoji: DEMO_CATS[i % DEMO_CATS.length].emoji,
                        };
                    });
                    setCats(mapped.length ? mapped : DEMO_CATS);
                })
                .catch(function () {
                    setErr(true);
                    setCats(DEMO_CATS);
                });
        }, [a.maxCategories, a.orderBy, a.order, a.hideEmpty, a.excludeIds, a.includeIds]);

        var blockProps = useBlockProps({ style: Object.assign({ display: 'block' }, _tv(a.typoName, '--bkcg-n-'), _tv(a.typoDesc, '--bkcg-d-')) });

        var gridStyle = {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
            gap: a.gap + 'px',
        };

        var displayCats = (cats || DEMO_CATS).slice(0, a.maxCategories);

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Query */
                el(PanelBody, { title: __('Query', 'blockenberg'), initialOpen: true },
                    el(RangeControl, { label: __('Max Categories', 'blockenberg'), value: a.maxCategories, min: 1, max: 50, onChange: function (v) { setAttributes({ maxCategories: v }); } }),
                    el(SelectControl, {
                        label: __('Order By', 'blockenberg'), value: a.orderBy,
                        options: [
                            { label: __('Post Count', 'blockenberg'), value: 'count' },
                            { label: __('Name (A–Z)', 'blockenberg'), value: 'name' },
                            { label: __('ID', 'blockenberg'), value: 'id' },
                            { label: __('Slug', 'blockenberg'), value: 'slug' },
                        ],
                        onChange: function (v) { setAttributes({ orderBy: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Order', 'blockenberg'), value: a.order,
                        options: [
                            { label: __('Descending', 'blockenberg'), value: 'desc' },
                            { label: __('Ascending', 'blockenberg'), value: 'asc' },
                        ],
                        onChange: function (v) { setAttributes({ order: v }); }
                    }),
                    el(ToggleControl, { label: __('Hide Empty Categories', 'blockenberg'), checked: a.hideEmpty, onChange: function (v) { setAttributes({ hideEmpty: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Include IDs (comma-separated)', 'blockenberg'), value: a.includeIds, placeholder: '1,3,7', onChange: function (v) { setAttributes({ includeIds: v }); } }),
                    el(TextControl, { label: __('Exclude IDs (comma-separated)', 'blockenberg'), value: a.excludeIds, placeholder: '1,2', onChange: function (v) { setAttributes({ excludeIds: v }); } })
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 6, onChange: function (v) { setAttributes({ columns: v }); } }),
                    el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 0, max: 48, onChange: function (v) { setAttributes({ gap: v }); } }),
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: a.cardStyle,
                        options: [
                            { label: __('Card (shadow)', 'blockenberg'), value: 'card' },
                            { label: __('Card with accent bar', 'blockenberg'), value: 'card-accent' },
                            { label: __('Icon circle', 'blockenberg'), value: 'icon-circle' },
                            { label: __('Minimal (no background)', 'blockenberg'), value: 'minimal' },
                        ],
                        onChange: function (v) { setAttributes({ cardStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'), value: a.iconPosition,
                        options: [
                            { label: __('Top', 'blockenberg'), value: 'top' },
                            { label: __('Left (inline)', 'blockenberg'), value: 'left' },
                        ],
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'), value: a.textAlign,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('Right', 'blockenberg'), value: 'right' },
                        ],
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Link Target', 'blockenberg'), value: a.linkTarget,
                        options: [
                            { label: __('Same tab', 'blockenberg'), value: '_self' },
                            { label: __('New tab', 'blockenberg'), value: '_blank' },
                        ],
                        onChange: function (v) { setAttributes({ linkTarget: v }); }
                    })
                ),

                /* Content */
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Icon / Emoji', 'blockenberg'), checked: a.showIcon, onChange: function (v) { setAttributes({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                    a.showIcon && el(Fragment, null,
                        el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: a.iconSize, min: 16, max: 80, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                        el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'defaultIcon' }))
                    ),
                    el(ToggleControl, { label: __('Show Post Count', 'blockenberg'), checked: a.showCount, onChange: function (v) { setAttributes({ showCount: v }); }, __nextHasNoMarginBottom: true }),
                    a.showCount && el(TextControl, { label: __('Count Label', 'blockenberg'), value: a.countLabel, placeholder: 'posts', onChange: function (v) { setAttributes({ countLabel: v }); } }),
                    el(ToggleControl, { label: __('Show Description', 'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttributes({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                    a.showDescription && el(RangeControl, { label: __('Max Description Length', 'blockenberg'), value: a.maxDescriptionLength, min: 20, max: 200, onChange: function (v) { setAttributes({ maxDescriptionLength: v }); } }),
                    el(ToggleControl, { label: __('Show Arrow →', 'blockenberg'), checked: a.showArrow, onChange: function (v) { setAttributes({ showArrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Animate on Hover', 'blockenberg'), checked: a.animateOnHover, onChange: function (v) { setAttributes({ animateOnHover: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Card Style */
                el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                    el(RangeControl, { label: __('Padding (px)', 'blockenberg'), value: a.cardPadding, min: 8, max: 60, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                    el(ToggleControl, { label: __('Show Shadow', 'blockenberg'), checked: a.cardShadow, onChange: function (v) { setAttributes({ cardShadow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Border', 'blockenberg'), checked: a.cardBorder, onChange: function (v) { setAttributes({ cardBorder: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Color Mode */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Name', 'blockenberg'), value: a.typoName, onChange: function (v) { setAttributes({ typoName: v }); } }),
                    el(getTypographyControl(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { setAttributes({ typoDesc: v }); } })
                ),
el(PanelBody, { title: __('Color Mode', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Color Mode', 'blockenberg'), value: a.colorMode,
                        options: [
                            { label: __('Single accent', 'blockenberg'), value: 'single' },
                            { label: __('Multi-color', 'blockenberg'), value: 'multi' },
                        ],
                        onChange: function (v) { setAttributes({ colorMode: v }); }
                    }),
                    a.colorMode === 'multi' && el(BkbgMultiColorControl, {
                        label: __('Colors (comma-separated hex)', 'blockenberg'), value: a.multiColors,
                        onChange: function (v) { setAttributes({ multiColors: v }); }
                    })
                ),

                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Hover Background', 'blockenberg'), value: a.cardBgHover, onChange: function (v) { setAttributes({ cardBgHover: v || '#f5f3ff' }); } },
                        { label: __('Accent', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6c3fb5' }); } },
                        { label: __('Name Text', 'blockenberg'), value: a.nameColor, onChange: function (v) { setAttributes({ nameColor: v || '#1e1e1e' }); } },
                        { label: __('Post Count Badge', 'blockenberg'), value: a.countColor, onChange: function (v) { setAttributes({ countColor: v || '#6c3fb5' }); } },
                        { label: __('Count Badge Bg', 'blockenberg'), value: a.countBg, onChange: function (v) { setAttributes({ countBg: v || '#ede9fe' }); } },
                        { label: __('Description', 'blockenberg'), value: a.descColor, onChange: function (v) { setAttributes({ descColor: v || '#6b7280' }); } },
                        { label: __('Card Border', 'blockenberg'), value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e5e7eb' }); } },
                    ]
                })
            ),

            el('div', blockProps,
                !cats && el('div', { style: { textAlign: 'center', padding: '32px', color: '#888' } },
                    el(Spinner),
                    el('p', null, __('Loading categories…', 'blockenberg'))
                ),
                cats && el('div', {
                    className: 'bkcg-grid',
                    'data-columns': a.columns,
                    'data-gap': a.gap,
                    'data-animate': a.animateOnHover ? '1' : '0',
                    'data-bg-hover': a.cardBgHover,
                    'data-color-mode': a.colorMode,
                    'data-multi-colors': a.multiColors,
                    'data-accent': a.accentColor,
                    style: gridStyle
                },
                    displayCats.map(function (cat, idx) {
                        return el(CatCard, { key: cat.id || idx, cat: cat, index: idx, attrs: a, isEdit: true });
                    })
                ),
                loadErr && el('p', { style: { fontSize: '11px', color: '#888', marginTop: '4px' } }, __('Preview uses demo data. Real categories will show on the front end.', 'blockenberg'))
            )
        );
    }

    /* ── save ───────────────────────────────────────────────────────────────── */
    function Save(props) {
        var a = props.attributes;
        var blockProps = wp.blockEditor.useBlockProps.save({
            className: 'bkcg-wrap',
        });

        return el('div', blockProps,
            el('div', {
                className: 'bkcg-grid',
                'data-max': a.maxCategories,
                'data-order-by': a.orderBy,
                'data-order': a.order,
                'data-hide-empty': a.hideEmpty ? '1' : '0',
                'data-exclude': a.excludeIds,
                'data-include': a.includeIds,
                'data-columns': a.columns,
                'data-gap': a.gap,
                'data-card-style': a.cardStyle,
                'data-icon-pos': a.iconPosition,
                'data-show-icon': a.showIcon ? '1' : '0',
                'data-icon-size': a.iconSize,
                'data-default-icon': a.defaultIcon,
                'data-icon-type': a.iconType,
                'data-icon-dashicon': a.iconDashicon,
                'data-icon-image-url': a.iconImageUrl,
                'data-show-count': a.showCount ? '1' : '0',
                'data-count-label': a.countLabel,
                'data-show-desc': a.showDescription ? '1' : '0',
                'data-desc-len': a.maxDescriptionLength,
                'data-show-arrow': a.showArrow ? '1' : '0',
                'data-link-target': a.linkTarget,
                'data-text-align': a.textAlign,
                'data-animate': a.animateOnHover ? '1' : '0',
                'data-color-mode': a.colorMode,
                'data-multi-colors': a.multiColors,
                'data-accent': a.accentColor,
                'data-name-color': a.nameColor,
                'data-name-size': a.nameSize,
                'data-count-color': a.countColor,
                'data-count-bg': a.countBg,
                'data-desc-color': a.descColor,
                'data-desc-size': a.descSize,
                'data-card-bg': a.cardBg,
                'data-card-bg-hover': a.cardBgHover,
                'data-card-radius': a.cardRadius,
                'data-card-padding': a.cardPadding,
                'data-card-shadow': a.cardShadow ? '1' : '0',
                'data-card-border': a.cardBorder ? '1' : '0',
                'data-border-color': a.borderColor,
                'data-typo-name': JSON.stringify(a.typoName || {}),
                'data-typo-desc': JSON.stringify(a.typoDesc || {}),
            })
        );
    }

    /* ── BkbgMultiColorControl ──────────────────────────────────────── */
    function BkbgMultiColorControl(props) {
        var label = props.label;
        var value = props.value || '';
        var onChange = props.onChange;
        var colors = value.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
        var st = useState(-1); var openIdx = st[0]; var setOpenIdx = st[1];
        return el(Fragment, null,
            el('div', { style: { marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: '4px' } }, label),
                el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
                    colors.map(function (c, i) {
                        return el('div', { key: i, style: { position: 'relative', display: 'inline-flex' } },
                            el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: c, cursor: 'pointer', padding: 0 }, onClick: function () { setOpenIdx(openIdx === i ? -1 : i); } }),
                            el('button', { type: 'button', 'aria-label': 'Remove', style: { position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#d00', color: '#fff', fontSize: '10px', lineHeight: '14px', cursor: 'pointer', padding: 0, textAlign: 'center' }, onClick: function () { var n = colors.slice(); n.splice(i, 1); onChange(n.join(',')); } }, '×'),
                            openIdx === i && el(Popover, { onClose: function () { setOpenIdx(-1); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: c, enableAlpha: true, onChange: function (v) { var n = colors.slice(); n[i] = v; onChange(n.join(',')); } })))
                        );
                    }),
                    el(Button, { isSmall: true, variant: 'secondary', onClick: function () { onChange(value ? value + ',#6c3fb5' : '#6c3fb5'); }, style: { height: 28, minWidth: 28 } }, '+')
                )
            )
        );
    }

    registerBlockType('blockenberg/category-grid', {
        edit: Edit,
        save: Save,
    });
}() );
