/* ====================================================
   Post Meta Bar Block — editor (index.js)
   Block: blockenberg/post-meta
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var __                 = wp.i18n.__;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    function renderIconPart(type, charVal, dashicon, imageUrl, dashiconColor, forSave) {
        if (!type || type === 'custom-char') return charVal;
        var fn = forSave ? IP().buildSaveIcon : IP().buildEditorIcon;
        return fn(type, charVal, dashicon, imageUrl, dashiconColor);
    }

    function buildWrapStyle(a) {
        var _tvFn = getTypoCssVars();
        var s = {
            '--bkbg-pm-avatar-size': a.avatarSize + 'px',
            '--bkbg-pm-gap':         a.gap + 'px',
            '--bkbg-pm-pad-v':       a.paddingV + 'px',
            '--bkbg-pm-pad-h':       a.paddingH + 'px',
            '--bkbg-pm-radius':      a.borderRadius + 'px',
            '--bkbg-pm-tag-pv':      a.tagPaddingV + 'px',
            '--bkbg-pm-tag-ph':      a.tagPaddingH + 'px',
            '--bkbg-pm-tag-r':       a.tagRadius + 'px',
            '--bkbg-pm-text':        a.textColor,
            '--bkbg-pm-link':        a.linkColor,
            '--bkbg-pm-link-hover':  a.linkColorHover,
            '--bkbg-pm-sep-color':   a.separatorColor,
            '--bkbg-pm-bg':          a.bgColor,
            '--bkbg-pm-avatar-border': a.avatarBorderColor,
            '--bkbg-pm-tag-bg':      a.tagBg,
            '--bkbg-pm-tag-color':   a.tagColor,
        };
        Object.assign(s, _tvFn(a.textTypo, '--bkbg-pm-tx-'));
        return s;
    }

    var SEP_OPTIONS = [
        { label: '• Bullet',  value: '•'  },
        { label: '| Pipe',    value: '|'  },
        { label: '— Em dash', value: '—'  },
        { label: '/ Slash',   value: '/'  },
        { label: 'Custom',    value: '__custom__' },
    ];

    /* ── Render a single meta item ── */
    function renderItem(key, a, editorMode) {
        var sep = a.separator === '__custom__' ? (a.customSeparator || '•') : a.separator;
        var sepEl = el('span', { className: 'bkbg-pm-sep', 'aria-hidden': 'true' }, sep);

        switch (key) {
            case 'avatar':
                if (!a.showAvatar || !a.showAuthor) return null;
                return el('span', { key: 'avatar', className: 'bkbg-pm-item bkbg-pm-avatar' },
                    a.authorAvatarUrl
                        ? el('img', { src: a.authorAvatarUrl, alt: a.authorName, className: 'bkbg-pm-avatar-img' })
                        : el('span', { className: 'bkbg-pm-avatar-placeholder' }, (a.authorName || 'A').charAt(0).toUpperCase())
                );
            case 'author':
                if (!a.showAuthor) return null;
                return el('span', { key: 'author', className: 'bkbg-pm-item bkbg-pm-author' },
                    a.authorLabel ? el('span', { className: 'bkbg-pm-label' }, a.authorLabel + ' ') : null,
                    el('a', { className: 'bkbg-pm-author-link', href: a.authorUrl, onClick: editorMode ? function(e){ e.preventDefault(); } : undefined }, a.authorName)
                );
            case 'date':
                if (!a.showDate) return null;
                var dateIcon = renderIconPart(a.dateLabelType, a.dateLabel, a.dateLabelDashicon, a.dateLabelImageUrl, a.dateLabelDashiconColor, !editorMode);
                return el('span', { key: 'date', className: 'bkbg-pm-item bkbg-pm-date' },
                    dateIcon ? el('span', { className: 'bkbg-pm-icon' }, dateIcon, ' ') : null,
                    el('time', { className: 'bkbg-pm-date-value' }, a.dateValue)
                );
            case 'readingTime':
                if (!a.showReadingTime) return null;
                var rtIcon = renderIconPart(a.readingTimeLabelType, a.readingTimeLabel, a.readingTimeLabelDashicon, a.readingTimeLabelImageUrl, a.readingTimeLabelDashiconColor, !editorMode);
                return el('span', { key: 'readingTime', className: 'bkbg-pm-item bkbg-pm-reading-time' },
                    rtIcon ? el('span', { className: 'bkbg-pm-icon' }, rtIcon, ' ') : null,
                    el('span', null, a.readingTimeValue)
                );
            case 'categories':
                if (!a.showCategories || !a.categories.length) return null;
                var catIcon = renderIconPart(a.categoriesLabelType, a.categoriesLabel, a.categoriesLabelDashicon, a.categoriesLabelImageUrl, a.categoriesLabelDashiconColor, !editorMode);
                return el('span', { key: 'categories', className: 'bkbg-pm-item bkbg-pm-categories' },
                    catIcon ? el('span', { className: 'bkbg-pm-icon' }, catIcon, ' ') : null,
                    a.categories.map(function(cat, i) {
                        return el(Fragment, { key: i },
                            el('a', { className: 'bkbg-pm-tag', href: cat.url, onClick: editorMode ? function(e){ e.preventDefault(); } : undefined }, cat.label),
                            i < a.categories.length - 1 ? el('span', { className: 'bkbg-pm-tag-sep' }, ', ') : null
                        );
                    })
                );
            case 'tags':
                if (!a.showTags || !a.tags.length) return null;
                return el('span', { key: 'tags', className: 'bkbg-pm-item bkbg-pm-tags' },
                    a.tags.map(function(tag, i) {
                        return el('a', { key: i, className: 'bkbg-pm-tag bkbg-pm-tag--pill', href: tag.url, onClick: editorMode ? function(e){ e.preventDefault(); } : undefined }, '#' + tag.label);
                    })
                );
            case 'comments':
                if (!a.showComments) return null;
                var cmtIcon = renderIconPart(a.commentsLabelType, a.commentsLabel, a.commentsLabelDashicon, a.commentsLabelImageUrl, a.commentsLabelDashiconColor, !editorMode);
                return el('span', { key: 'comments', className: 'bkbg-pm-item bkbg-pm-comments' },
                    cmtIcon ? el('span', { className: 'bkbg-pm-icon' }, cmtIcon, ' ') : null,
                    el('a', { className: 'bkbg-pm-comments-link', href: a.commentsUrl, onClick: editorMode ? function(e){ e.preventDefault(); } : undefined }, a.commentsCount)
                );
            default:
                return null;
        }
    }

    /* ── Build list of visible items with separators ── */
    function buildItems(a, editorMode) {
        var order   = a.itemOrder || ['avatar', 'author', 'date', 'readingTime', 'categories', 'tags', 'comments'];
        var sep     = a.separator === '__custom__' ? (a.customSeparator || '•') : a.separator;
        var result  = [];
        var visibleCount = 0;

        order.forEach(function(key) {
            var rendered = renderItem(key, a, editorMode);
            if (!rendered) return;
            if (visibleCount > 0 && key !== 'avatar') {
                result.push(el('span', { key: 'sep-' + key, className: 'bkbg-pm-sep', 'aria-hidden': 'true' }, sep));
            }
            result.push(rendered);
            if (key !== 'avatar') visibleCount++;
        });
        return result;
    }

    /* ── Categories editor ── */
    function CatsEditor(props) {
        var cats      = props.cats;
        var onChange  = props.onChange;
        var addLabel  = props.addLabel;
        return el(Fragment, null,
            cats.map(function(cat, i) {
                return el('div', { key: i, style: { display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'flex-end' } },
                    el(TextControl, { label: i === 0 ? __('Label', 'blockenberg') : undefined, value: cat.label, onChange: function(v){ var n = cats.slice(); n[i] = Object.assign({}, cat, {label:v}); onChange(n); }, style: { flex: 2 } }),
                    el(TextControl, { label: i === 0 ? __('URL', 'blockenberg') : undefined, value: cat.url, onChange: function(v){ var n = cats.slice(); n[i] = Object.assign({}, cat, {url:v}); onChange(n); }, style: { flex: 2 } }),
                    el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, label: __('Remove', 'blockenberg'), onClick: function(){ onChange(cats.filter(function(_,j){ return j!==i; })); } })
                );
            }),
            el(Button, { variant: 'secondary', isSmall: true, onClick: function(){ onChange(cats.concat([{label: 'Category', url: '#'}])); } }, addLabel)
        );
    }

    /* ── REGISTER ── */
    registerBlockType('blockenberg/post-meta', {
        deprecated: [{
            attributes: {
                layout:          { type: 'string',  default: 'horizontal' },
                separator:       { type: 'string',  default: '•' },
                customSeparator: { type: 'string',  default: '' },
                showAvatar:      { type: 'boolean', default: true },
                showAuthor:      { type: 'boolean', default: true },
                showDate:        { type: 'boolean', default: true },
                showReadingTime: { type: 'boolean', default: true },
                showCategories:  { type: 'boolean', default: true },
                showTags:        { type: 'boolean', default: false },
                showComments:    { type: 'boolean', default: true },
                itemOrder:       { type: 'array',   default: ['avatar','author','date','readingTime','categories','tags','comments'] },
                authorLabel:     { type: 'string',  default: 'By' },
                authorName:      { type: 'string',  default: 'Jane Doe' },
                authorUrl:       { type: 'string',  default: '#' },
                authorAvatarUrl: { type: 'string',  default: '' },
                dateLabel:       { type: 'string',  default: '📅' },
                dateValue:       { type: 'string',  default: 'June 12, 2025' },
                readingTimeLabel:{ type: 'string',  default: '⏱' },
                readingTimeValue:{ type: 'string',  default: '5 min read' },
                categoriesLabel: { type: 'string',  default: '🏷' },
                categories:      { type: 'array',   default: [{label:'Design',url:'#'},{label:'Typography',url:'#'}] },
                tags:            { type: 'array',   default: [{label:'ux',url:'#'},{label:'branding',url:'#'}] },
                commentsLabel:   { type: 'string',  default: '💬' },
                commentsCount:   { type: 'string',  default: '14 comments' },
                commentsUrl:     { type: 'string',  default: '#' },
                fontSize:        { type: 'number',  default: 14 },
                fontWeight:      { type: 'string',  default: '400' },
                avatarSize:      { type: 'number',  default: 32 },
                gap:             { type: 'number',  default: 14 },
                paddingV:        { type: 'number',  default: 0 },
                paddingH:        { type: 'number',  default: 0 },
                borderRadius:    { type: 'number',  default: 0 },
                tagPaddingV:     { type: 'number',  default: 2 },
                tagPaddingH:     { type: 'number',  default: 8 },
                tagRadius:       { type: 'number',  default: 50 },
                textColor:       { type: 'string',  default: '#64748b' },
                linkColor:       { type: 'string',  default: '#6c3fb5' },
                linkColorHover:  { type: 'string',  default: '#4f2d99' },
                separatorColor:  { type: 'string',  default: '#cbd5e1' },
                bgColor:         { type: 'string',  default: 'transparent' },
                avatarBorderColor:{ type: 'string', default: '#e2e8f0' },
                tagBg:           { type: 'string',  default: '#f1f5f9' },
                tagColor:        { type: 'string',  default: '#475569' }
            },
            save: function (props) {
                var a = props.attributes;
                var oldWrapStyle = {
                    '--bkbg-pm-font':        a.fontSize + 'px',
                    '--bkbg-pm-weight':      a.fontWeight,
                    '--bkbg-pm-avatar-size': a.avatarSize + 'px',
                    '--bkbg-pm-gap':         a.gap + 'px',
                    '--bkbg-pm-pad-v':       a.paddingV + 'px',
                    '--bkbg-pm-pad-h':       a.paddingH + 'px',
                    '--bkbg-pm-radius':      a.borderRadius + 'px',
                    '--bkbg-pm-tag-pv':      a.tagPaddingV + 'px',
                    '--bkbg-pm-tag-ph':      a.tagPaddingH + 'px',
                    '--bkbg-pm-tag-r':       a.tagRadius + 'px',
                    '--bkbg-pm-text':        a.textColor,
                    '--bkbg-pm-link':        a.linkColor,
                    '--bkbg-pm-link-hover':  a.linkColorHover,
                    '--bkbg-pm-sep-color':   a.separatorColor,
                    '--bkbg-pm-bg':          a.bgColor,
                    '--bkbg-pm-avatar-border': a.avatarBorderColor,
                    '--bkbg-pm-tag-bg':      a.tagBg,
                    '--bkbg-pm-tag-color':   a.tagColor,
                };
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-pm-wrap bkbg-pm-layout--' + a.layout,
                    style: oldWrapStyle
                });
                return el('div', blockProps,
                    el('div', { className: 'bkbg-pm-inner' },
                        buildItems(a, false)
                    )
                );
            }
        }],
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var style   = buildWrapStyle(a);
            var blockProps = useBlockProps({
                className: 'bkbg-pm-wrap bkbg-pm-layout--' + a.layout,
                style: style
            });

            var inspector = el(InspectorControls, null,
                /* Visibility */
                el(PanelBody, { title: __('Visible Items', 'blockenberg'), initialOpen: true },
                    el('p', { style: { color: '#64748b', fontSize: '12px' } }, __('Toggle which meta items appear in the bar.', 'blockenberg')),
                    el(ToggleControl, { label: __('Author avatar',   'blockenberg'), checked: a.showAvatar,      onChange: function(v){ setAttr({ showAvatar: v }); } }),
                    el(ToggleControl, { label: __('Author name',     'blockenberg'), checked: a.showAuthor,      onChange: function(v){ setAttr({ showAuthor: v }); } }),
                    el(ToggleControl, { label: __('Date',            'blockenberg'), checked: a.showDate,        onChange: function(v){ setAttr({ showDate: v }); } }),
                    el(ToggleControl, { label: __('Reading time',    'blockenberg'), checked: a.showReadingTime, onChange: function(v){ setAttr({ showReadingTime: v }); } }),
                    el(ToggleControl, { label: __('Categories',      'blockenberg'), checked: a.showCategories,  onChange: function(v){ setAttr({ showCategories: v }); } }),
                    el(ToggleControl, { label: __('Tags',            'blockenberg'), checked: a.showTags,        onChange: function(v){ setAttr({ showTags: v }); } }),
                    el(ToggleControl, { label: __('Comment count',   'blockenberg'), checked: a.showComments,    onChange: function(v){ setAttr({ showComments: v }); } })
                ),

                /* Demo values */
                el(PanelBody, { title: __('Demo Values', 'blockenberg'), initialOpen: false },
                    el('p', { style: { color: '#64748b', fontSize: '12px' } }, __('These values appear in the editor preview. In production, replace with dynamic data from your theme.', 'blockenberg')),
                    el(TextControl, { label: __('Author label',              'blockenberg'), value: a.authorLabel,     onChange: function(v){ setAttr({ authorLabel: v }); } }),
                    el(TextControl, { label: __('Author name',               'blockenberg'), value: a.authorName,      onChange: function(v){ setAttr({ authorName: v }); } }),
                    el(TextControl, { label: __('Author URL',                'blockenberg'), value: a.authorUrl,       onChange: function(v){ setAttr({ authorUrl: v }); } }),
                    el(TextControl, { label: __('Avatar URL (leave blank for initial)', 'blockenberg'), value: a.authorAvatarUrl, onChange: function(v){ setAttr({ authorAvatarUrl: v }); } }),
                    el('hr', null),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'dateLabel', typeAttr: 'dateLabelType', dashiconAttr: 'dateLabelDashicon', imageUrlAttr: 'dateLabelImageUrl', colorAttr: 'dateLabelDashiconColor' })),
                    el(TextControl, { label: __('Date value',                'blockenberg'), value: a.dateValue,        onChange: function(v){ setAttr({ dateValue: v }); } }),
                    el('hr', null),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'readingTimeLabel', typeAttr: 'readingTimeLabelType', dashiconAttr: 'readingTimeLabelDashicon', imageUrlAttr: 'readingTimeLabelImageUrl', colorAttr: 'readingTimeLabelDashiconColor' })),
                    el(TextControl, { label: __('Reading time value',        'blockenberg'), value: a.readingTimeValue, onChange: function(v){ setAttr({ readingTimeValue: v }); } }),
                    el('hr', null),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'categoriesLabel', typeAttr: 'categoriesLabelType', dashiconAttr: 'categoriesLabelDashicon', imageUrlAttr: 'categoriesLabelImageUrl', colorAttr: 'categoriesLabelDashiconColor' })),
                    el(CatsEditor, { cats: a.categories, onChange: function(v){ setAttr({ categories: v }); }, addLabel: __('+ Add Category', 'blockenberg') }),
                    el('hr', null),
                    el(CatsEditor, { cats: a.tags, onChange: function(v){ setAttr({ tags: v }); }, addLabel: __('+ Add Tag', 'blockenberg') }),
                    el('hr', null),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'commentsLabel', typeAttr: 'commentsLabelType', dashiconAttr: 'commentsLabelDashicon', imageUrlAttr: 'commentsLabelImageUrl', colorAttr: 'commentsLabelDashiconColor' })),
                    el(TextControl, { label: __('Comments value',            'blockenberg'), value: a.commentsCount,    onChange: function(v){ setAttr({ commentsCount: v }); } }),
                    el(TextControl, { label: __('Comments URL',              'blockenberg'), value: a.commentsUrl,      onChange: function(v){ setAttr({ commentsUrl: v }); } })
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout & Separator', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [
                        { label: __('Horizontal',  'blockenberg'), value: 'horizontal' },
                        { label: __('Vertical',    'blockenberg'), value: 'vertical'   },
                        { label: __('Minimal',     'blockenberg'), value: 'minimal'    },
                    ], onChange: function(v){ setAttr({ layout: v }); } }),
                    el(SelectControl, { label: __('Separator', 'blockenberg'), value: a.separator, options: SEP_OPTIONS, onChange: function(v){ setAttr({ separator: v }); } }),
                    a.separator === '__custom__' ? el(TextControl, { label: __('Custom separator', 'blockenberg'), value: a.customSeparator, onChange: function(v){ setAttr({ customSeparator: v }); } }) : null
                ),

                /* Spacing */
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Gap between items (px)', 'blockenberg'), value: a.gap,         min: 0,  max: 60, onChange: function(v){ setAttr({ gap: v }); } }),
                    el(RangeControl, { label: __('Padding vertical (px)',  'blockenberg'), value: a.paddingV,    min: 0,  max: 40, onChange: function(v){ setAttr({ paddingV: v }); } }),
                    el(RangeControl, { label: __('Padding horizontal (px)','blockenberg'), value: a.paddingH,    min: 0,  max: 60, onChange: function(v){ setAttr({ paddingH: v }); } }),
                    el(RangeControl, { label: __('Border radius (px)',     'blockenberg'), value: a.borderRadius, min: 0,  max: 50, onChange: function(v){ setAttr({ borderRadius: v }); } })
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading…');
                        return el(TC, { label: 'Text Typography', value: a.textTypo, onChange: function (v) { setAttr({ textTypo: v }); } });
                    })(),
                    el(RangeControl, { label: __('Avatar size (px)',       'blockenberg'), value: a.avatarSize,    min: 20, max: 64, onChange: function(v){ setAttr({ avatarSize: v }); } }),
                    el(RangeControl, { label: __('Tag padding V (px)',     'blockenberg'), value: a.tagPaddingV,   min: 0,  max: 12, onChange: function(v){ setAttr({ tagPaddingV: v }); } }),
                    el(RangeControl, { label: __('Tag padding H (px)',     'blockenberg'), value: a.tagPaddingH,   min: 0,  max: 20, onChange: function(v){ setAttr({ tagPaddingH: v }); } }),
                    el(RangeControl, { label: __('Tag border radius (px)', 'blockenberg'), value: a.tagRadius,     min: 0,  max: 50, onChange: function(v){ setAttr({ tagRadius: v }); } })
                ),

                /* Colors */
                el(PanelColorSettings, { title: __('Colors', 'blockenberg'), initialOpen: false, colorSettings: [
                    { label: __('Text color',         'blockenberg'), value: a.textColor,        onChange: function(v){ setAttr({ textColor: v||'' }); } },
                    { label: __('Link color',         'blockenberg'), value: a.linkColor,        onChange: function(v){ setAttr({ linkColor: v||'' }); } },
                    { label: __('Link hover color',   'blockenberg'), value: a.linkColorHover,   onChange: function(v){ setAttr({ linkColorHover: v||'' }); } },
                    { label: __('Separator color',    'blockenberg'), value: a.separatorColor,   onChange: function(v){ setAttr({ separatorColor: v||'' }); } },
                    { label: __('Background',         'blockenberg'), value: a.bgColor,          onChange: function(v){ setAttr({ bgColor: v||'' }); } },
                    { label: __('Avatar border',      'blockenberg'), value: a.avatarBorderColor,onChange: function(v){ setAttr({ avatarBorderColor: v||'' }); } },
                    { label: __('Tag background',     'blockenberg'), value: a.tagBg,            onChange: function(v){ setAttr({ tagBg: v||'' }); } },
                    { label: __('Tag text color',     'blockenberg'), value: a.tagColor,         onChange: function(v){ setAttr({ tagColor: v||'' }); } },
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-pm-inner' },
                        buildItems(a, true)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-pm-wrap bkbg-pm-layout--' + a.layout,
                style: buildWrapStyle(a)
            });

            return el('div', blockProps,
                el('div', { className: 'bkbg-pm-inner' },
                    buildItems(a, false)
                )
            );
        }
    });
}() );
