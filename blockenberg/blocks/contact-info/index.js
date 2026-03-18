(function () {
    var el = window.wp.element.createElement;
    var __ = function (s) { return s; };
    var registerBlockType  = window.wp.blocks.registerBlockType;
    var InspectorControls  = window.wp.blockEditor.InspectorControls;
    var PanelBody          = window.wp.components.PanelBody;
    var PanelRow           = window.wp.components.PanelRow;
    var ToggleControl      = window.wp.components.ToggleControl;
    var SelectControl      = window.wp.components.SelectControl;
    var RangeControl       = window.wp.components.RangeControl;
    var TextControl        = window.wp.components.TextControl;
    var Button             = window.wp.components.Button;
    var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function () { return {}; };
    }
    function _tv(typoObj, prefix) { return getTypoCssVars()(typoObj || {}, prefix); }

    var TYPE_ICONS = {
        address: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 019.5 9 2.5 2.5 0 0112 6.5 2.5 2.5 0 0114.5 9 2.5 2.5 0 0112 11.5z"/></svg>',
        phone:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.4 11.4 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z"/></svg>',
        email:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        website: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54A1.99 1.99 0 0016 14h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V5.07c3.95.49 7 3.85 7 7.93 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        hours:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>',
        fax:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16zM9 7h6v2H9zm0 4h6v2H9zm0 4h4v2H9z"/></svg>',
        custom:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    };

    function generateId() {
        return 'cti-' + Math.random().toString(36).slice(2, 9);
    }

    function updateItem(items, id, key, value, setA) {
        var newItems = items.map(function (it) {
            if (it.id !== id) return it;
            var clone = Object.assign({}, it);
            clone[key] = value;
            return clone;
        });
        setA({ items: newItems });
    }

    function renderIcon(type, iconStyle, iconBg, iconColor, iconSize, boxSize, radius) {
        var svgStr = TYPE_ICONS[type] || TYPE_ICONS.custom;
        var noBox  = iconStyle === 'none';
        if (noBox) {
            return el('span', {
                className: 'bkbg-cti-icon bkbg-cti-icon--plain',
                style: { color: iconColor, width: iconSize + 'px', height: iconSize + 'px', display: 'flex', flexShrink: 0 },
                dangerouslySetInnerHTML: { __html: svgStr }
            });
        }
        return el('span', {
            className: 'bkbg-cti-icon bkbg-cti-icon--box',
            style: {
                background:   iconBg,
                color:        iconColor,
                width:        boxSize + 'px',
                height:       boxSize + 'px',
                borderRadius: radius + 'px',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
                flexShrink:   0,
                padding:      ((boxSize - iconSize) / 2) + 'px',
            },
            dangerouslySetInnerHTML: { __html: svgStr }
        });
    }

    registerBlockType('blockenberg/contact-info', {
        title: __('Contact Info'),
        description: __('Display contact details with icons and optional schema markup.'),
        category: 'bkbg-business',
        icon: el('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 24, height: 24 },
            el('path', { d: 'M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.4 11.4 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z' })
        ),

        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout'), value: a.layout,
                        options: [
                            { label: 'Stacked (vertical)',  value: 'stacked' },
                            { label: 'Inline (horizontal)', value: 'inline'  },
                            { label: 'Grid',                value: 'grid'    },
                        ],
                        onChange: function (v) { setA({ layout: v }); },
                    }),
                    a.layout === 'grid' && el(RangeControl, {
                        label: __('Columns'), value: a.columns, min: 2, max: 4,
                        onChange: function (v) { setA({ columns: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Item Spacing (px)'), value: a.itemSpacing, min: 8, max: 60,
                        onChange: function (v) { setA({ itemSpacing: v }); },
                    }),
                    el(ToggleControl, {
                        label: __('Show Labels'), checked: a.showLabel,
                        onChange: function (v) { setA({ showLabel: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label: __('Inject Schema.org markup'), checked: a.schemaEnabled,
                        onChange: function (v) { setA({ schemaEnabled: v }); },
                        __nextHasNoMarginBottom: true,
                    })
                ),
                el(PanelBody, { title: __('Icon Style'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Icon Style'), value: a.iconStyle,
                        options: [
                            { label: 'Filled box', value: 'filled'  },
                            { label: 'Outline box', value: 'outline' },
                            { label: 'No box',      value: 'none'    },
                        ],
                        onChange: function (v) { setA({ iconStyle: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Icon Size'), value: a.iconSize, min: 12, max: 36,
                        onChange: function (v) { setA({ iconSize: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Box Size'), value: a.iconBoxSize, min: 24, max: 80,
                        onChange: function (v) { setA({ iconBoxSize: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Box Radius'), value: a.iconRadius, min: 0, max: 40,
                        onChange: function (v) { setA({ iconRadius: v }); },
                    }),
                    el(PanelColorSettings, {
                        title: __('Icon Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Icon Color'),  value: a.iconColor, onChange: function (v) { setA({ iconColor: v || '#2563eb' }); } },
                            { label: __('Box BG'),      value: a.iconBg,    onChange: function (v) { setA({ iconBg:    v || '#eff6ff' }); } },
                        ],
                    })
                ),
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, 'Typography control loading…');
                        return el(window.wp.element.Fragment, {},
                            el(TC, {
                                label: 'Label',
                                value: a.typoLabel || {},
                                onChange: function (v) { setA({ typoLabel: v }); }
                            }),
                            el(TC, {
                                label: 'Value',
                                value: a.typoValue || {},
                                onChange: function (v) { setA({ typoValue: v }); }
                            })
                        );
                    })(),
                    el(PanelColorSettings, {
                        title: __('Text Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Label Color'), value: a.labelColor, onChange: function (v) { setA({ labelColor: v || '#6b7280' }); } },
                            { label: __('Value Color'), value: a.valueColor, onChange: function (v) { setA({ valueColor: v || '#111827' }); } },
                            { label: __('Link Color'),  value: a.linkColor,  onChange: function (v) { setA({ linkColor:  v || '#2563eb' }); } },
                        ],
                    })
                )
            );

            /* ── Item editor panels ── */
            var itemPanels = el(PanelBody, { title: __('Contact Items'), initialOpen: true },
                a.items.map(function (item, idx) {
                    return el('div', {
                        key:   item.id,
                        style: { border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, marginBottom: 12 }
                    },
                        el(SelectControl, {
                            label:   __('Type'),
                            value:   item.type,
                            options: Object.keys(TYPE_ICONS).map(function (t) { return { label: t.charAt(0).toUpperCase() + t.slice(1), value: t }; }),
                            onChange: function (v) { updateItem(a.items, item.id, 'type', v, setA); },
                        }),
                        el(TextControl, {
                            label:    __('Label'),
                            value:    item.label,
                            onChange: function (v) { updateItem(a.items, item.id, 'label', v, setA); },
                        }),
                        el(TextControl, {
                            label:    __('Value'),
                            value:    item.value,
                            onChange: function (v) { updateItem(a.items, item.id, 'value', v, setA); },
                        }),
                        el(ToggleControl, {
                            label:    __('Make value a link'),
                            checked:  item.linkEnabled,
                            onChange: function (v) { updateItem(a.items, item.id, 'linkEnabled', v, setA); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el(Button, {
                            variant: 'link',
                            isDestructive: true,
                            onClick: function () {
                                setA({ items: a.items.filter(function (it) { return it.id !== item.id; }) });
                            }
                        }, __('Remove'))
                    );
                }),
                el(Button, {
                    variant: 'secondary',
                    onClick: function () {
                        setA({ items: a.items.concat([{ id: generateId(), type: 'custom', label: 'Label', value: 'Value', linkEnabled: false }]) });
                    }
                }, __('+ Add Item'))
            );

            /* ── Preview ── */
            var wrapStyle = Object.assign({
                display:       a.layout === 'inline' ? 'flex' : a.layout === 'grid' ? 'grid' : 'flex',
                flexDirection: a.layout === 'stacked' ? 'column' : undefined,
                flexWrap:      a.layout === 'inline' ? 'wrap' : undefined,
                gridTemplateColumns: a.layout === 'grid' ? 'repeat(' + a.columns + ', 1fr)' : undefined,
                gap:           a.itemSpacing + 'px',
            }, _tv(a.typoLabel, '--bkcti-label-'), _tv(a.typoValue, '--bkcti-value-'));

            var preview = el('div', { style: wrapStyle },
                a.items.map(function (item) {
                    var linkHref = item.type === 'phone' ? 'tel:' + item.value
                        : item.type === 'email' ? 'mailto:' + item.value
                        : item.value;
                    return el('div', { key: item.id, className: 'bkbg-cti-item', style: { display: 'flex', alignItems: 'center', gap: 12 } },
                        renderIcon(item.type, a.iconStyle, a.iconBg, a.iconColor, a.iconSize, a.iconBoxSize, a.iconRadius),
                        el('div', { style: { display: 'flex', flexDirection: 'column' } },
                            a.showLabel && el('span', { className: 'bkbg-cti-label', style: { color: a.labelColor, textTransform: 'uppercase', letterSpacing: '0.05em' } }, item.label),
                            item.linkEnabled
                                ? el('a', { href: linkHref, className: 'bkbg-cti-link', style: { color: a.linkColor, textDecoration: 'none' } }, item.value)
                                : el('span', { className: 'bkbg-cti-value', style: { color: a.valueColor } }, item.value)
                        )
                    );
                })
            );

            return el('div', null,
                el(InspectorControls, null, itemPanels, inspector.props.children),
                preview
            );
        },

        save: function (props) {
            var a = props.attributes;

            function getLinkHref(item) {
                if (item.type === 'phone')   return 'tel:' + item.value.replace(/\s/g, '');
                if (item.type === 'email')   return 'mailto:' + item.value;
                if (item.type === 'website') return item.value;
                return item.value;
            }

            var svgMap = {
                address: TYPE_ICONS ? undefined : '',
            };

            return el('div', {
                className: 'bkbg-cti-wrap bkbg-cti-layout--' + a.layout,
                style: Object.assign({
                    '--bkbg-cti-cols':    a.columns,
                    '--bkbg-cti-gap':     a.itemSpacing + 'px',
                    '--bkbg-cti-icon-c':  a.iconColor,
                    '--bkbg-cti-icon-bg': a.iconBg,
                    '--bkbg-cti-label-c': a.labelColor,
                    '--bkbg-cti-value-c': a.valueColor,
                    '--bkbg-cti-link-c':  a.linkColor,
                    '--bkbg-cti-ls':      a.labelSize + 'px',
                    '--bkbg-cti-lw':      a.labelWeight,
                    '--bkbg-cti-vs':      a.valueSize + 'px',
                    '--bkbg-cti-vw':      a.valueWeight,
                    '--bkbg-cti-icon-sz': a.iconSize + 'px',
                    '--bkbg-cti-box-sz':  a.iconBoxSize + 'px',
                    '--bkbg-cti-box-r':   a.iconRadius + 'px',
                }, _tv(a.typoLabel, '--bkcti-label-'), _tv(a.typoValue, '--bkcti-value-')),
                'data-schema':  a.schemaEnabled ? '1' : '0',
                'data-items':   JSON.stringify(a.items),
                'data-icon-style': a.iconStyle,
                'data-show-label': a.showLabel ? '1' : '0',
            });
        },
    });
})();
