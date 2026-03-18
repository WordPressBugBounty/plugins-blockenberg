( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc; function getTypoControl(){ return _tc || (_tc = (window.bkbgTypographyControl || function(){return null})); }
    var _tv; function getTypoCssVars(){ return _tv || (_tv = (window.bkbgTypoCssVars || function(){return {}})); }
    var IP = function () { return window.bkbgIconPicker; };

    var LAYOUT_OPTIONS = [
        { label: __('Category tabs',     'blockenberg'), value: 'tabs' },
        { label: __('Sections (scroll)', 'blockenberg'), value: 'sections' },
    ];
    var CURRENCY_POS_OPTIONS = [
        { label: __('Before price ($9)', 'blockenberg'), value: 'before' },
        { label: __('After price (9$)',  'blockenberg'), value: 'after' },
    ];
    var ITEM_STYLE_OPTIONS = [
        { label: __('List',  'blockenberg'), value: 'list' },
        { label: __('Cards', 'blockenberg'), value: 'card' },
    ];
    var SEPARATOR_OPTIONS = [
        { label: __('Line',  'blockenberg'), value: 'line' },
        { label: __('Dots',  'blockenberg'), value: 'dots' },
        { label: __('None',  'blockenberg'), value: 'none' },
    ];
    var BADGE_LABELS = { V: 'V',  VG: 'VG',  GF: 'GF',  DF: 'DF',  HOT: '🌶', NEW: 'NEW' };
    var ALL_BADGES   = ['V', 'VG', 'GF', 'DF', 'HOT', 'NEW'];

    function makeId() { return 'rm' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return {
            '--bkbg-rm-accent':           a.accentColor,
            '--bkbg-rm-active-tab-bg':    a.activeTabBg,
            '--bkbg-rm-active-tab-color': a.activeTabColor,
            '--bkbg-rm-inactive-tab-bg':  a.inactiveTabBg,
            '--bkbg-rm-inactive-tab-color': a.inactiveTabColor,
            '--bkbg-rm-item-name-color':  a.itemNameColor,
            '--bkbg-rm-desc-color':       a.descColor,
            '--bkbg-rm-price-color':      a.priceColor,
            '--bkbg-rm-card-bg':          a.cardBg,
            '--bkbg-rm-card-border':      a.cardBorderColor,
            '--bkbg-rm-separator-color':  a.separatorColor,
            '--bkbg-rm-cat-name-sz':      a.categoryNameSize + 'px',
            '--bkbg-rm-item-name-sz':     a.itemNameSize + 'px',
            '--bkbg-rm-desc-sz':          a.descSize + 'px',
            '--bkbg-rm-price-sz':         a.priceSize + 'px',
            '--bkbg-rm-badge-sz':         a.badgeSize + 'px',
            '--bkbg-rm-card-r':           a.cardRadius + 'px',
            '--bkbg-rm-card-pad':         a.cardPadding + 'px',
            '--bkbg-rm-badge-r':          a.badgeRadius + 'px',
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
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Price badge ────────────────────────────────────────────────── */
    var BADGE_COLORS = { V: '#16a34a', VG: '#059669', GF: '#ca8a04', DF: '#0ea5e9', HOT: '#ef4444', NEW: '#6c3fb5' };

    function BadgeEl(props) {
        var b = props.badge;
        var a = props.a;
        return el('span', { className: 'bkbg-rm-badge bkbg-rm-badge--' + b.toLowerCase(), style: { display: 'inline-block', padding: '2px 7px', borderRadius: a.badgeRadius + 'px', fontSize: a.badgeSize + 'px', fontWeight: 700, background: (BADGE_COLORS[b] || '#6c3fb5') + '1a', color: BADGE_COLORS[b] || '#6c3fb5', marginRight: '4px' } }, BADGE_LABELS[b] || b);
    }

    /* ── Menu item row ──────────────────────────────────────────────── */
    function MenuItem(props) {
        var item    = props.item;
        var a       = props.a;
        var isEditor = props.isEditor;
        var onUpdate = props.onUpdate;
        var priceStr = a.currencyPosition === 'before' ? (a.currency + item.price) : (item.price + a.currency);

        var rowStyle = {
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: a.itemStyle === 'card' ? (a.cardPadding + 'px') : '14px 0',
            background: a.itemStyle === 'card' ? a.cardBg : 'transparent',
            borderRadius: a.itemStyle === 'card' ? (a.cardRadius + 'px') : '0',
            border: a.itemStyle === 'card' ? ('1px solid ' + a.cardBorderColor) : 'none',
            borderBottom: a.itemStyle === 'list' && a.separator === 'line' ? ('1px solid ' + a.separatorColor) : undefined,
        };

        return el('div', { className: 'bkbg-rm-item bkbg-rm-item--' + a.itemStyle, style: rowStyle },
            el('div', { className: 'bkbg-rm-item-info', style: { flex: 1, minWidth: 0 } },
                isEditor
                    ? el(RichText, { tagName: 'span', className: 'bkbg-rm-item-name', value: item.name, onChange: function (v) { onUpdate('name', v); }, placeholder: __('Item name', 'blockenberg'), style: { display: 'block', color: a.itemNameColor, marginBottom: a.showDescription ? '4px' : '0' } })
                    : el(RichText.Content, { tagName: 'span', className: 'bkbg-rm-item-name', value: item.name }),
                a.showDescription && (isEditor
                    ? el(RichText, { tagName: 'p', className: 'bkbg-rm-item-desc', value: item.description, onChange: function (v) { onUpdate('description', v); }, placeholder: __('Description…', 'blockenberg'), style: { margin: 0, color: a.descColor } })
                    : el(RichText.Content, { tagName: 'p', className: 'bkbg-rm-item-desc', value: item.description })
                ),
                a.showBadges && item.badges && item.badges.length > 0 && el('div', { className: 'bkbg-rm-badges', style: { marginTop: '6px' } },
                    item.badges.map(function (b) { return el(BadgeEl, { key: b, badge: b, a: a }); })
                )
            ),
            el('div', { className: 'bkbg-rm-item-price', style: { flexShrink: 0, color: a.priceColor, whiteSpace: 'nowrap' } }, priceStr)
        );
    }

    /* ── Category section ───────────────────────────────────────────── */
    function CategorySection(props) {
        var cat     = props.cat;
        var a       = props.a;
        var isEditor = props.isEditor;
        var onUpdate = props.onUpdate;

        return el('div', { className: 'bkbg-rm-category-section', 'data-cat': cat.id },
            el('div', { className: 'bkbg-rm-category-header', style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' } },
                a.showCategoryIcon && (cat.icon || cat.iconDashicon || cat.iconImageUrl) && el('span', { className: 'bkbg-rm-cat-icon', style: { fontSize: '28px' } }, IP().buildEditorIcon(cat.iconType || 'custom-char', cat.icon, cat.iconDashicon, cat.iconImageUrl, cat.iconDashiconColor)),
                isEditor
                    ? el(RichText, { tagName: 'h3', className: 'bkbg-rm-cat-name', value: cat.name, onChange: function (v) { onUpdate('name', v); }, placeholder: __('Category name', 'blockenberg'), style: { color: a.itemNameColor, margin: 0 } })
                    : el(RichText.Content, { tagName: 'h3', className: 'bkbg-rm-cat-name', value: cat.name })
            ),
            el('div', { className: 'bkbg-rm-items', style: a.itemStyle === 'card' ? { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: '12px' } : {} },
                cat.items.map(function (item) {
                    return el(MenuItem, { key: item.id, item: item, a: a, isEditor: isEditor, onUpdate: function (key, val) {
                        if (!isEditor) return;
                        var newCat = Object.assign({}, cat, { items: cat.items.map(function (it) { if (it.id !== item.id) return it; var u = Object.assign({}, it); u[key] = val; return u; }) });
                        onUpdate(null, null, newCat);
                    } });
                })
            )
        );
    }

    /* ── v1 save-only menu item (for deprecated) ──────────────────── */
    function v1MenuItemSave(props) {
        var item = props.item;
        var a    = props.a;
        var priceStr = a.currencyPosition === 'before' ? (a.currency + item.price) : (item.price + a.currency);
        var rowStyle = {
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: a.itemStyle === 'card' ? (a.cardPadding + 'px') : '14px 0',
            background: a.itemStyle === 'card' ? a.cardBg : 'transparent',
            borderRadius: a.itemStyle === 'card' ? (a.cardRadius + 'px') : '0',
            border: a.itemStyle === 'card' ? ('1px solid ' + a.cardBorderColor) : 'none',
            borderBottom: a.itemStyle === 'list' && a.separator === 'line' ? ('1px solid ' + a.separatorColor) : undefined,
        };
        return el('div', { className: 'bkbg-rm-item bkbg-rm-item--' + a.itemStyle, style: rowStyle },
            el('div', { className: 'bkbg-rm-item-info', style: { flex: 1, minWidth: 0 } },
                el(RichText.Content, { tagName: 'span', className: 'bkbg-rm-item-name', value: item.name }),
                a.showDescription && el(RichText.Content, { tagName: 'p', className: 'bkbg-rm-item-desc', value: item.description }),
                a.showBadges && item.badges && item.badges.length > 0 && el('div', { className: 'bkbg-rm-badges', style: { marginTop: '6px' } },
                    item.badges.map(function (b) { return el(BadgeEl, { key: b, badge: b, a: a }); })
                )
            ),
            el('div', { className: 'bkbg-rm-item-price', style: { flexShrink: 0, fontSize: a.priceSize + 'px', fontWeight: 800, color: a.priceColor, whiteSpace: 'nowrap' } }, priceStr)
        );
    }

    var v1Attributes = {
        categories:      { type: 'array', default: [] },
        layout:          { type: 'string', default: 'tabs' },
        currency:        { type: 'string', default: '$' },
        currencyPosition:{ type: 'string', default: 'before' },
        itemStyle:       { type: 'string', default: 'list' },
        columns:         { type: 'integer', default: 1 },
        showDescription: { type: 'boolean', default: true },
        showBadges:      { type: 'boolean', default: true },
        showCategoryIcon:{ type: 'boolean', default: true },
        separator:       { type: 'string', default: 'line' },
        badgeRadius:     { type: 'integer', default: 4 },
        cardRadius:      { type: 'integer', default: 12 },
        cardPadding:     { type: 'integer', default: 18 },
        categoryNameSize:{ type: 'integer', default: 13 },
        itemNameSize:    { type: 'integer', default: 16 },
        descSize:        { type: 'integer', default: 14 },
        priceSize:       { type: 'integer', default: 16 },
        badgeSize:       { type: 'integer', default: 11 },
        accentColor:     { type: 'string', default: '#6c3fb5' },
        activeTabBg:     { type: 'string', default: '#6c3fb5' },
        activeTabColor:  { type: 'string', default: '#ffffff' },
        inactiveTabBg:   { type: 'string', default: '#f3f4f6' },
        inactiveTabColor:{ type: 'string', default: '#374151' },
        itemNameColor:   { type: 'string', default: '#111827' },
        descColor:       { type: 'string', default: '#6b7280' },
        priceColor:      { type: 'string', default: '#6c3fb5' },
        cardBg:          { type: 'string', default: '#ffffff' },
        cardBorderColor: { type: 'string', default: '#e5e7eb' },
        separatorColor:  { type: 'string', default: '#f3f4f6' },
        bgColor:         { type: 'string', default: '' },
        paddingTop:      { type: 'integer', default: 64 },
        paddingBottom:   { type: 'integer', default: 64 }
    };

    registerBlockType('blockenberg/restaurant-menu', {
        title: __('Restaurant Menu', 'blockenberg'),
        icon: 'food',
        category: 'bkbg-business',

        deprecated: [{
            attributes: v1Attributes,
            save: function(props) {
                var a = props.attributes;
                return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-rm-wrapper bkbg-rm--' + a.layout + ' bkbg-rm-items--' + a.itemStyle, style: buildWrapStyle(a) }),
                    a.layout === 'tabs' && el('nav', { className: 'bkbg-rm-tab-bar', role: 'tablist' },
                        a.categories.map(function (cat, ci) {
                            return el('button', { key: cat.id, type: 'button', role: 'tab', className: 'bkbg-rm-tab-btn' + (ci === 0 ? ' is-active' : ''), 'data-cat': cat.id, 'aria-selected': ci === 0 ? 'true' : 'false' },
                                a.showCategoryIcon && el('span', { className: 'bkbg-rm-tab-icon', 'aria-hidden': 'true' }, cat.icon),
                                el('span', null, cat.name)
                            );
                        })
                    ),
                    el('div', { className: 'bkbg-rm-body' },
                        a.categories.map(function (cat, ci) {
                            return el('div', { key: cat.id, className: 'bkbg-rm-category-section' + (ci === 0 ? ' is-active' : ''), 'data-cat': cat.id, role: 'tabpanel', 'aria-hidden': ci === 0 ? 'false' : 'true' },
                                a.layout === 'sections' && el('div', { className: 'bkbg-rm-category-header' },
                                    a.showCategoryIcon && el('span', { className: 'bkbg-rm-cat-icon', 'aria-hidden': 'true' }, cat.icon),
                                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-rm-cat-name', value: cat.name })
                                ),
                                el('div', { className: 'bkbg-rm-items' },
                                    cat.items.map(function (item) {
                                        return el(v1MenuItemSave, { key: item.id, item: item, a: a, isEditor: false });
                                    })
                                )
                            );
                        })
                    )
                );
            }
        }],

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var activeTabState = useState(0);
            var activeTab = activeTabState[0];
            var setActiveTab = activeTabState[1];

            var blockProps = useBlockProps((function(){
                var _tv = getTypoCssVars();
                var s = buildWrapStyle(a);
                Object.assign(s, _tv(a.catNameTypo || {}, '--bkrm-cn-'));
                Object.assign(s, _tv(a.itemNameTypo || {}, '--bkrm-in-'));
                Object.assign(s, _tv(a.descTypo || {}, '--bkrm-ds-'));
                Object.assign(s, _tv(a.priceTypo || {}, '--bkrm-pr-'));
                return { style: s };
            })());

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateCategory(id, key, val, newCatObj) {
                setAttributes({ categories: a.categories.map(function (c) {
                    if (c.id !== id) return c;
                    if (newCatObj) return newCatObj;
                    var u = Object.assign({}, c); u[key] = val; return u;
                }) });
            }

            function addItemToCategory(catId) {
                setAttributes({ categories: a.categories.map(function (c) {
                    if (c.id !== catId) return c;
                    return Object.assign({}, c, { items: c.items.concat([{ id: makeId(), name: __('New Item', 'blockenberg'), description: __('Item description', 'blockenberg'), price: '0.00', badges: [] }]) });
                }) });
            }

            var safeActive = Math.min(activeTab, a.categories.length - 1);
            var currentCat = a.categories[safeActive];

            /* Tab bar for tab layout */
            var tabBar = a.layout === 'tabs' && el('div', { className: 'bkbg-rm-tab-bar', style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '32px' } },
                a.categories.map(function (cat, ci) {
                    var isActive = ci === safeActive;
                    return el('button', { key: cat.id, type: 'button', className: 'bkbg-rm-tab-btn' + (isActive ? ' is-active' : ''), onClick: function () { setActiveTab(ci); }, style: { display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '99px', border: 'none', cursor: 'pointer', background: isActive ? a.activeTabBg : a.inactiveTabBg, color: isActive ? a.activeTabColor : a.inactiveTabColor, transition: 'all 0.2s' } },
                        a.showCategoryIcon && el('span', { className: 'bkbg-rm-tab-icon' }, IP().buildEditorIcon(cat.iconType || 'custom-char', cat.icon, cat.iconDashicon, cat.iconImageUrl, cat.iconDashiconColor)),
                        el('span', null, cat.name)
                    );
                })
            );

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl,  { label: __('Display style',      'blockenberg'), value: a.layout,           options: LAYOUT_OPTIONS,       onChange: function (v) { setAttributes({ layout:           v }); } }),
                        el(SelectControl,  { label: __('Item style',         'blockenberg'), value: a.itemStyle,        options: ITEM_STYLE_OPTIONS,   onChange: function (v) { setAttributes({ itemStyle:        v }); } }),
                        el(SelectControl,  { label: __('Currency position',  'blockenberg'), value: a.currencyPosition, options: CURRENCY_POS_OPTIONS, onChange: function (v) { setAttributes({ currencyPosition: v }); } }),
                        el(TextControl,    { label: __('Currency symbol',    'blockenberg'), value: a.currency,         onChange: function (v) { setAttributes({ currency: v }); } }),
                        a.itemStyle === 'list' && el(SelectControl, { label: __('Item separator', 'blockenberg'), value: a.separator, options: SEPARATOR_OPTIONS, onChange: function (v) { setAttributes({ separator: v }); } }),
                        a.itemStyle === 'card' && el(RangeControl, { label: __('Card columns', 'blockenberg'), value: a.columns, min: 1, max: 3, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl,   { label: __('Card radius (px)',   'blockenberg'), value: a.cardRadius, min: 0, max: 24, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(RangeControl,   { label: __('Card padding (px)',  'blockenberg'), value: a.cardPadding, min: 8, max: 40, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                        el(RangeControl,   { label: __('Badge radius (px)',  'blockenberg'), value: a.badgeRadius, min: 0, max: 12, onChange: function (v) { setAttributes({ badgeRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show category icons',  'blockenberg'), checked: a.showCategoryIcon, onChange: function (v) { setAttributes({ showCategoryIcon: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show descriptions',    'blockenberg'), checked: a.showDescription,  onChange: function (v) { setAttributes({ showDescription:  v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show dietary badges',  'blockenberg'), checked: a.showBadges,       onChange: function (v) { setAttributes({ showBadges:       v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function(){ var TC = getTypoControl(); return TC ? el(TC, { label: __('Category Name', 'blockenberg'), value: a.catNameTypo, onChange: function(v){ setAttributes({catNameTypo:v}); } }) : null; })(),
                        (function(){ var TC = getTypoControl(); return TC ? el(TC, { label: __('Item Name', 'blockenberg'), value: a.itemNameTypo, onChange: function(v){ setAttributes({itemNameTypo:v}); } }) : null; })(),
                        (function(){ var TC = getTypoControl(); return TC ? el(TC, { label: __('Description', 'blockenberg'), value: a.descTypo, onChange: function(v){ setAttributes({descTypo:v}); } }) : null; })(),
                        (function(){ var TC = getTypoControl(); return TC ? el(TC, { label: __('Price', 'blockenberg'), value: a.priceTypo, onChange: function(v){ setAttributes({priceTypo:v}); } }) : null; })(),
                        el(RangeControl, { label: __('Badge (px)',       'blockenberg'), value: a.badgeSize,    min: 9,  max: 14, onChange: function (v) { setAttributes({ badgeSize:    v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',       __('Accent',                'blockenberg'), 'accentColor'),
                        cc('activeTabBg',       __('Active tab background', 'blockenberg'), 'activeTabBg'),
                        cc('activeTabColor',    __('Active tab text',       'blockenberg'), 'activeTabColor'),
                        cc('inactiveTabBg',     __('Inactive tab bg',       'blockenberg'), 'inactiveTabBg'),
                        cc('inactiveTabColor',  __('Inactive tab text',     'blockenberg'), 'inactiveTabColor'),
                        cc('itemNameColor',     __('Item name',             'blockenberg'), 'itemNameColor'),
                        cc('descColor',         __('Description',           'blockenberg'), 'descColor'),
                        cc('priceColor',        __('Price',                 'blockenberg'), 'priceColor'),
                        cc('cardBg',            __('Card background',       'blockenberg'), 'cardBg'),
                        cc('cardBorderColor',   __('Card border',           'blockenberg'), 'cardBorderColor'),
                        cc('separatorColor',    __('Separator line',        'blockenberg'), 'separatorColor'),
                        cc('bgColor',           __('Section background',    'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Categories & Items', 'blockenberg'), initialOpen: false },
                        a.categories.map(function (cat, ci) {
                            return el(PanelBody, { key: cat.id, title: (cat.icon || '🍽') + ' ' + (cat.name || 'Category ' + (ci + 1)), initialOpen: false },
                                el(IP().IconPickerControl, IP().iconPickerProps(cat, function (key, val) { updateCategory(cat.id, key, val); }, { label: __('Icon', 'blockenberg'), typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                                el(TextControl, { label: __('Category name',   'blockenberg'), value: cat.name, onChange: function (v) { updateCategory(cat.id, 'name', v); } }),
                                el('p', { style: { fontSize: '12px', fontWeight: 600, margin: '8px 0 4px' } }, __('Items', 'blockenberg')),
                                cat.items.map(function (item, ii) {
                                    return el(PanelBody, { key: item.id, title: (item.name ? item.name.replace(/<[^>]+>/g,'').substring(0,24) : 'Item ' + (ii+1)), initialOpen: false },
                                        el(TextControl, { label: __('Name',        'blockenberg'), value: item.name,        onChange: function (v) { updateCategory(cat.id, null, null, Object.assign({}, cat, { items: cat.items.map(function (it) { if (it.id !== item.id) return it; return Object.assign({}, it, { name: v }); }) })); } }),
                                        el(TextareaControl, { label: __('Description', 'blockenberg'), value: item.description, onChange: function (v) { updateCategory(cat.id, null, null, Object.assign({}, cat, { items: cat.items.map(function (it) { if (it.id !== item.id) return it; return Object.assign({}, it, { description: v }); }) })); }, rows: 2 }),
                                        el(TextControl, { label: __('Price',       'blockenberg'), value: item.price, onChange: function (v) { updateCategory(cat.id, null, null, Object.assign({}, cat, { items: cat.items.map(function (it) { if (it.id !== item.id) return it; return Object.assign({}, it, { price: v }); }) })); } }),
                                        el('p', { style: { fontSize: '12px', fontWeight: 600, margin: '6px 0 4px' } }, __('Dietary badges', 'blockenberg')),
                                        el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
                                            ALL_BADGES.map(function (b) {
                                                var active = (item.badges || []).indexOf(b) !== -1;
                                                return el(Button, { key: b, variant: active ? 'primary' : 'secondary', size: 'compact', onClick: function () {
                                                    var newBadges = active ? (item.badges || []).filter(function (x) { return x !== b; }) : (item.badges || []).concat([b]);
                                                    updateCategory(cat.id, null, null, Object.assign({}, cat, { items: cat.items.map(function (it) { if (it.id !== item.id) return it; return Object.assign({}, it, { badges: newBadges }); }) }));
                                                } }, b);
                                            })
                                        ),
                                        el(Button, { onClick: function () { updateCategory(cat.id, null, null, Object.assign({}, cat, { items: cat.items.filter(function (it) { return it.id !== item.id; }) })); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '6px' } }, __('Remove item', 'blockenberg'))
                                    );
                                }),
                                el(Button, { variant: 'secondary', size: 'compact', onClick: function () { addItemToCategory(cat.id); }, style: { marginTop: '6px' } }, __('+ Add Item', 'blockenberg')),
                                el(Button, { onClick: function () { setAttributes({ categories: a.categories.filter(function (c) { return c.id !== cat.id; }) }); if (activeTab >= ci) setActiveTab(Math.max(0, activeTab - 1)); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '6px', display: 'block' } }, __('Remove category', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttributes({ categories: a.categories.concat([{ id: makeId(), icon: '🍽', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', name: __('New Category', 'blockenberg'), items: [] }]) }); }, style: { marginTop: '8px' } }, __('+ Add Category', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    tabBar,
                    a.layout === 'tabs' && currentCat && el(CategorySection, { cat: currentCat, a: a, isEditor: true,
                        onUpdate: function (key, val, newCatObj) { updateCategory(currentCat.id, key, val, newCatObj); }
                    }),
                    a.layout === 'sections' && a.categories.map(function (cat) {
                        return el(CategorySection, { key: cat.id, cat: cat, a: a, isEditor: true, onUpdate: function (key, val, newCatObj) { updateCategory(cat.id, key, val, newCatObj); } });
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tv = getTypoCssVars();
            var s = buildWrapStyle(a);
            Object.assign(s, _tv(a.catNameTypo || {}, '--bkrm-cn-'));
            Object.assign(s, _tv(a.itemNameTypo || {}, '--bkrm-in-'));
            Object.assign(s, _tv(a.descTypo || {}, '--bkrm-ds-'));
            Object.assign(s, _tv(a.priceTypo || {}, '--bkrm-pr-'));
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-rm-wrapper bkbg-rm--' + a.layout + ' bkbg-rm-items--' + a.itemStyle, style: s }),
                a.layout === 'tabs' && el('nav', { className: 'bkbg-rm-tab-bar', role: 'tablist' },
                    a.categories.map(function (cat, ci) {
                        return el('button', { key: cat.id, type: 'button', role: 'tab', className: 'bkbg-rm-tab-btn' + (ci === 0 ? ' is-active' : ''), 'data-cat': cat.id, 'aria-selected': ci === 0 ? 'true' : 'false' },
                            a.showCategoryIcon && el('span', { className: 'bkbg-rm-tab-icon', 'aria-hidden': 'true' }, IP().buildSaveIcon(cat.iconType || 'custom-char', cat.icon, cat.iconDashicon, cat.iconImageUrl, cat.iconDashiconColor)),
                            el('span', null, cat.name)
                        );
                    })
                ),
                el('div', { className: 'bkbg-rm-body' },
                    a.categories.map(function (cat, ci) {
                        return el('div', { key: cat.id, className: 'bkbg-rm-category-section' + (ci === 0 ? ' is-active' : ''), 'data-cat': cat.id, role: 'tabpanel', 'aria-hidden': ci === 0 ? 'false' : 'true' },
                            a.layout === 'sections' && el('div', { className: 'bkbg-rm-category-header' },
                                a.showCategoryIcon && el('span', { className: 'bkbg-rm-cat-icon', 'aria-hidden': 'true' }, IP().buildSaveIcon(cat.iconType || 'custom-char', cat.icon, cat.iconDashicon, cat.iconImageUrl, cat.iconDashiconColor)),
                                el(RichText.Content, { tagName: 'h3', className: 'bkbg-rm-cat-name', value: cat.name })
                            ),
                            el('div', { className: 'bkbg-rm-items' },
                                cat.items.map(function (item) {
                                    return el(MenuItem, { key: item.id, item: item, a: a, isEditor: false });
                                })
                            )
                        );
                    })
                )
            );
        }
    });
}() );
