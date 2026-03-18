( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var __                 = wp.i18n.__;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var TextControl        = wp.components.TextControl;
    var TextareaControl    = wp.components.TextareaControl;
    var ToggleControl      = wp.components.ToggleControl;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var Button             = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var LAYOUTS = [
        { label: 'Alternating (above & below)', value: 'alternating' },
        { label: 'All above the line',          value: 'top' },
        { label: 'All below the line',          value: 'bottom' },
    ];

    function cloneItems(items) { return items.map(function (i) { return Object.assign({}, i); }); }

    function ItemEditor(props) {
        var items = props.items;
        var set   = props.set;

        function updateItem(idx, field, val) {
            var next = cloneItems(items);
            next[idx][field] = val;
            set(next);
        }
        function removeItem(idx) {
            var next = cloneItems(items);
            next.splice(idx, 1);
            set(next);
        }
        function addItem() {
            set(cloneItems(items).concat([{ date: '2025', title: 'New Milestone', description: 'Describe this milestone…', icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', imageUrl: '' }]));
        }
        function moveUp(idx) {
            if (idx === 0) return;
            var next = cloneItems(items);
            var tmp = next[idx - 1]; next[idx - 1] = next[idx]; next[idx] = tmp;
            set(next);
        }
        function moveDown(idx) {
            if (idx === items.length - 1) return;
            var next = cloneItems(items);
            var tmp = next[idx + 1]; next[idx + 1] = next[idx]; next[idx] = tmp;
            set(next);
        }

        return el('div', null,
            items.map(function (item, idx) {
                return el(PanelBody, { key: idx, title: (item.icon || '•') + ' ' + (item.title || 'Item ' + (idx + 1)), initialOpen: false },
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Date / Label', value: item.date, onChange: function (v) { updateItem(idx, 'date', v); } }),
                    IP() ? el(IP().IconPickerControl, {
                        iconType: item.iconType || 'custom-char',
                        customChar: item.icon || '',
                        dashicon: item.iconDashicon || '',
                        imageUrl: item.iconImageUrl || '',
                        onChangeType: function (v) { updateItem(idx, 'iconType', v); },
                        onChangeChar: function (v) { updateItem(idx, 'icon', v); },
                        onChangeDashicon: function (v) { updateItem(idx, 'iconDashicon', v); },
                        onChangeImageUrl: function (v) { updateItem(idx, 'iconImageUrl', v); },
                        label: 'Icon'
                    }) : el(TextControl, { __nextHasNoMarginBottom: true, label: 'Icon (emoji)', value: item.icon, onChange: function (v) { updateItem(idx, 'icon', v); } }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Title', value: item.title, onChange: function (v) { updateItem(idx, 'title', v); } }),
                    el(TextareaControl, { __nextHasNoMarginBottom: true, label: 'Description', value: item.description, onChange: function (v) { updateItem(idx, 'description', v); }, rows: 3 }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Image URL (optional)', value: item.imageUrl || '', onChange: function (v) { updateItem(idx, 'imageUrl', v); } }),
                    el('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                        el(Button, { isSmall: true, variant: 'secondary', onClick: function () { moveUp(idx); }, disabled: idx === 0 }, '↑ Up'),
                        el(Button, { isSmall: true, variant: 'secondary', onClick: function () { moveDown(idx); }, disabled: idx === items.length - 1 }, '↓ Down'),
                        el(Button, { isSmall: true, isDestructive: true, onClick: function () { removeItem(idx); } }, '✕ Remove'),
                    )
                );
            }),
            el(Button, { variant: 'secondary', onClick: addItem, style: { marginTop: '12px', width: '100%' } }, '+ Add Milestone')
        );
    }

    /* Editor preview */
    function TimelinePreview(props) {
        var a = props.attributes;
        var trackPadding = 48;
        var halfH = Math.round(a.containerHeight / 2);
        var _tv = getTypoCssVars();

        var wrapStyle = {
            background: a.sectionBg,
            padding: '20px 0',
            position: 'relative',
            overflow: 'hidden',
        };
        Object.assign(wrapStyle, _tv(a.titleTypo || {}, '--bkbg-ht-tt-'));
        Object.assign(wrapStyle, _tv(a.descTypo || {}, '--bkbg-ht-desc-'));
        Object.assign(wrapStyle, _tv(a.dateTypo || {}, '--bkbg-ht-date-'));
        if (a.titleFontSize && a.titleFontSize !== 13) wrapStyle['--bkbg-ht-tt-sz'] = a.titleFontSize + 'px';
        if (a.titleFontWeight && a.titleFontWeight !== '600') wrapStyle['--bkbg-ht-tt-fw'] = a.titleFontWeight;
        if (a.titleLineHeight && a.titleLineHeight !== 1.3) wrapStyle['--bkbg-ht-tt-lh'] = String(a.titleLineHeight);
        if (a.descFontSize && a.descFontSize !== 11) wrapStyle['--bkbg-ht-desc-sz'] = a.descFontSize + 'px';
        if (a.descLineHeight && a.descLineHeight !== 1.5) wrapStyle['--bkbg-ht-desc-lh'] = String(a.descLineHeight);
        if (a.dateFontSize && a.dateFontSize !== 11) wrapStyle['--bkbg-ht-date-sz'] = a.dateFontSize + 'px';
        var trackStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: a.itemGap + 'px',
            padding: '0 ' + trackPadding + 'px',
            height: a.containerHeight + 'px',
            position: 'relative',
            overflowX: 'auto',
            overflowY: 'visible',
        };
        var lineStyle = {
            position: 'absolute',
            left: 0,
            right: 0,
            top: halfH + 'px',
            height: a.lineThickness + 'px',
            background: a.lineColor,
            pointerEvents: 'none',
        };

        return el('div', { style: wrapStyle },
            el('div', { style: trackStyle },
                el('div', { style: lineStyle }),
                a.items.map(function (item, idx) {
                    var isTop = a.layout === 'top' || (a.layout === 'alternating' && idx % 2 === 0);
                    var cardStyle = {
                        background: a.cardBg,
                        border: '1px solid ' + a.cardBorderColor,
                        borderRadius: a.cardRadius + 'px',
                        padding: a.cardPadding + 'px',
                        width: a.itemWidth + 'px',
                        flexShrink: 0,
                        boxShadow: a.cardShadow ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                        position: 'relative',
                        alignSelf: isTop ? 'flex-start' : 'flex-end',
                        marginTop: isTop ? '0' : 'auto',
                    };
                    return el('div', { key: idx, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, position: 'relative', height: '100%' } },
                        /* card top */
                        isTop && el('div', { style: cardStyle },
                            a.showIcons && el('div', { style: { fontSize: a.iconSize + 'px', marginBottom: '8px' } }, (item.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(el, item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon),
                            a.showDates && el('div', { className: 'bkbg-ht-card-date', style: { color: a.dateColor, marginBottom: '4px' } }, item.date),
                            el('div', { className: 'bkbg-ht-card-title', style: { color: a.titleColor, marginBottom: '4px' } }, item.title),
                            el('div', { className: 'bkbg-ht-card-desc', style: { color: a.descColor } }, item.description),
                        ),
                        /* dot */
                        a.showConnectorDot && el('div', { style: {
                            width: a.dotSize + 'px',
                            height: a.dotSize + 'px',
                            borderRadius: '50%',
                            background: a.dotColor,
                            border: '3px solid ' + a.dotBorderColor,
                            boxShadow: '0 0 0 3px ' + a.dotColor + '33',
                            flexShrink: 0,
                            position: 'absolute',
                            top: halfH - Math.round(a.dotSize / 2) + 'px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 2,
                        }}),
                        /* card bottom */
                        !isTop && el('div', { style: Object.assign({}, cardStyle, { alignSelf: 'flex-end' }) },
                            a.showIcons && el('div', { style: { fontSize: a.iconSize + 'px', marginBottom: '8px' } }, (item.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(el, item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon),
                            a.showDates && el('div', { className: 'bkbg-ht-card-date', style: { color: a.dateColor, marginBottom: '4px' } }, item.date),
                            el('div', { className: 'bkbg-ht-card-title', style: { color: a.titleColor, marginBottom: '4px' } }, item.title),
                            el('div', { className: 'bkbg-ht-card-desc', style: { color: a.descColor } }, item.description),
                        )
                    );
                })
            )
        );
    }

    registerBlockType('blockenberg/horizontal-timeline', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* Items */
                    el(PanelBody, { title: 'Timeline Items', initialOpen: true },
                        el(ItemEditor, { items: a.items, set: function (v) { set({ items: v }); } })
                    ),
                    /* Layout */
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Item placement', value: a.layout, options: LAYOUTS, onChange: function (v) { set({ layout: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Container height (px)', value: a.containerHeight, min: 260, max: 700, step: 10, onChange: function (v) { set({ containerHeight: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Card width (px)', value: a.itemWidth, min: 140, max: 400, step: 10, onChange: function (v) { set({ itemWidth: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Gap between items (px)', value: a.itemGap, min: 8, max: 120, step: 4, onChange: function (v) { set({ itemGap: v }); } }),
                    ),
                    /* Card */
                    el(PanelBody, { title: 'Card Style', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Card radius (px)', value: a.cardRadius, min: 0, max: 32, onChange: function (v) { set({ cardRadius: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Card padding (px)', value: a.cardPadding, min: 8, max: 48, onChange: function (v) { set({ cardPadding: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Card shadow', checked: a.cardShadow, onChange: function (v) { set({ cardShadow: v }); } }),
                    ),
                    /* Line & Dots */
                    el(PanelBody, { title: 'Line & Dots', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Line thickness (px)', value: a.lineThickness, min: 1, max: 12, onChange: function (v) { set({ lineThickness: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show connector dots', checked: a.showConnectorDot, onChange: function (v) { set({ showConnectorDot: v }); } }),
                        a.showConnectorDot && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Dot size (px)', value: a.dotSize, min: 8, max: 32, onChange: function (v) { set({ dotSize: v }); } }),
                    ),
                    /* Display */
                    el(PanelBody, { title: 'Display Options', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show icons', checked: a.showIcons, onChange: function (v) { set({ showIcons: v }); } }),
                        a.showIcons && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Icon size (px)', value: a.iconSize, min: 16, max: 56, onChange: function (v) { set({ iconSize: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show date labels', checked: a.showDates, onChange: function (v) { set({ showDates: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Enable drag to scroll', checked: a.draggable, onChange: function (v) { set({ draggable: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show navigation arrows', checked: a.showArrows, onChange: function (v) { set({ showArrows: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Animate items on scroll-into-view', checked: a.animateOnScroll, onChange: function (v) { set({ animateOnScroll: v }); } }),
                    ),
                    /* Typography */
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Description Typography', 'blockenberg'), value: a.descTypo || {}, onChange: function (v) { set({ descTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Date Typography', 'blockenberg'), value: a.dateTypo || {}, onChange: function (v) { set({ dateTypo: v }); } })
                    ),
                    /* Colors */
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: a.sectionBg,      onChange: function (v) { set({ sectionBg: v || '#f8fafc' }); },      label: 'Section background' },
                            { value: a.lineColor,       onChange: function (v) { set({ lineColor: v || '#6366f1' }); },       label: 'Timeline line' },
                            { value: a.dotColor,        onChange: function (v) { set({ dotColor: v || '#6366f1' }); },        label: 'Dot fill' },
                            { value: a.dotBorderColor,  onChange: function (v) { set({ dotBorderColor: v || '#ffffff' }); },  label: 'Dot border' },
                            { value: a.cardBg,          onChange: function (v) { set({ cardBg: v || '#ffffff' }); },          label: 'Card background' },
                            { value: a.cardBorderColor, onChange: function (v) { set({ cardBorderColor: v || '#e2e8f0' }); }, label: 'Card border' },
                            { value: a.dateColor,       onChange: function (v) { set({ dateColor: v || '#6366f1' }); },       label: 'Date text' },
                            { value: a.titleColor,      onChange: function (v) { set({ titleColor: v || '#1e293b' }); },      label: 'Title text' },
                            { value: a.descColor,       onChange: function (v) { set({ descColor: v || '#64748b' }); },       label: 'Description text' },
                            { value: a.arrowBg,         onChange: function (v) { set({ arrowBg: v || '#6366f1' }); },         label: 'Arrow button background' },
                            { value: a.arrowColor,      onChange: function (v) { set({ arrowColor: v || '#ffffff' }); },      label: 'Arrow button icon' },
                        ],
                    }),
                ),
                el('div', useBlockProps(),
                    el(TimelinePreview, { attributes: a })
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-ht-app', 'data-opts': JSON.stringify(a) })
            );
        },
    });
}() );
