( function () {
    var el                = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody         = wp.components.PanelBody;
    var TextControl       = wp.components.TextControl;
    var TextareaControl   = wp.components.TextareaControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var RangeControl      = wp.components.RangeControl;
    var Button            = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

    // ── Item Editor: one top-level nav item ──
    function ItemEditor(props) {
        var item    = props.item;
        var idx     = props.idx;
        var setItem = props.setItem;
        var removeItem = props.removeItem;
        var attr    = props.attr;

        return el(PanelBody, {
            title: item.label || ('Item ' + (idx + 1)),
            initialOpen: false,
            className: 'bkbg-mm-item-panel'
        },
            // Basic
            el(TextControl, { label: 'Label', value: item.label, onChange: function(v){ setItem({ label: v }); }, __nextHasNoMarginBottom: true }),
            el(TextControl, { label: 'URL', value: item.url, onChange: function(v){ setItem({ url: v }); }, __nextHasNoMarginBottom: true }),
            el(ToggleControl, { label: 'Has mega dropdown', checked: item.hasMega, onChange: function(v){ setItem({ hasMega: v }); }, __nextHasNoMarginBottom: true }),

            item.hasMega && el('div', { style: { marginTop: 12 } },

                // Columns
                el('p', { style: { fontWeight: 600, marginBottom: 8, fontSize: 12, textTransform: 'uppercase', color: '#6366f1' } }, 'Columns'),
                (item.columns || []).map(function (col, ci) {
                    return el('div', { key: ci, style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 10 } },
                        el(TextControl, { label: 'Column Heading', value: col.heading, onChange: function(v){ var cols = deepClone(item.columns); cols[ci].heading = v; setItem({ columns: cols }); }, __nextHasNoMarginBottom: true }),

                        // Links in column
                        (col.links || []).map(function (lnk, li) {
                            return el('div', { key: li, style: { background: '#f8fafc', borderRadius: 6, padding: '6px 8px', marginTop: 8 } },
                                attr.showIcons && el(IP().IconPickerControl, {
                                    iconType: lnk.iconType || 'custom-char',
                                    customChar: lnk.icon || '',
                                    dashicon: lnk.iconDashicon || '',
                                    imageUrl: lnk.iconImageUrl || '',
                                    onChangeType: function (v) { var cols = deepClone(item.columns); cols[ci].links[li].iconType = v; setItem({ columns: cols }); },
                                    onChangeChar: function (v) { var cols = deepClone(item.columns); cols[ci].links[li].icon = v; setItem({ columns: cols }); },
                                    onChangeDashicon: function (v) { var cols = deepClone(item.columns); cols[ci].links[li].iconDashicon = v; setItem({ columns: cols }); },
                                    onChangeImageUrl: function (v) { var cols = deepClone(item.columns); cols[ci].links[li].iconImageUrl = v; setItem({ columns: cols }); },
                                    label: 'Icon'
                                }),
                                el(TextControl, { label: 'Link Label', value: lnk.label, onChange: function(v){ var cols = deepClone(item.columns); cols[ci].links[li].label = v; setItem({ columns: cols }); }, __nextHasNoMarginBottom: true }),
                                attr.showDescriptions && el(TextControl, { label: 'Description', value: lnk.desc, onChange: function(v){ var cols = deepClone(item.columns); cols[ci].links[li].desc = v; setItem({ columns: cols }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'URL', value: lnk.url, onChange: function(v){ var cols = deepClone(item.columns); cols[ci].links[li].url = v; setItem({ columns: cols }); }, __nextHasNoMarginBottom: true }),
                                el(Button, {
                                    variant: 'link', isDestructive: true, size: 'small',
                                    onClick: function() { var cols = deepClone(item.columns); cols[ci].links.splice(li, 1); setItem({ columns: cols }); }
                                }, '✕ Remove link')
                            );
                        }),

                        el(Button, {
                            variant: 'secondary', size: 'small', style: { marginTop: 8 },
                            onClick: function() { var cols = deepClone(item.columns); cols[ci].links.push({ icon: '🔗', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: 'New Link', desc: '', url: '#' }); setItem({ columns: cols }); }
                        }, '+ Add Link'),
                        el(Button, {
                            variant: 'link', isDestructive: true, size: 'small', style: { marginLeft: 8 },
                            onClick: function() { var cols = deepClone(item.columns); cols.splice(ci, 1); setItem({ columns: cols }); }
                        }, '✕ Remove column')
                    );
                }),

                el(Button, {
                    variant: 'secondary', size: 'small', style: { marginBottom: 16 },
                    onClick: function() { var cols = deepClone(item.columns || []); cols.push({ heading: 'New Column', links: [{ icon: '🔗', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: 'Link', desc: '', url: '#' }] }); setItem({ columns: cols }); }
                }, '+ Add Column'),

                // Featured panel
                el(ToggleControl, { label: 'Show featured panel', checked: item.showFeatured, onChange: function(v){ setItem({ showFeatured: v }); }, __nextHasNoMarginBottom: true }),
                item.showFeatured && el('div', { style: { marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 } },
                    el('p', { style: { fontWeight: 600, fontSize: 12, marginBottom: 8 } }, 'Featured Panel'),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function(m) { setItem({ featuredImageUrl: m.url }); },
                            allowedTypes: ['image'],
                            value: item.featuredImageUrl,
                            render: function(obj) {
                                return el(Button, { onClick: obj.open, variant: 'secondary', size: 'small' }, item.featuredImageUrl ? 'Change Image' : 'Set Image');
                            }
                        })
                    ),
                    el(TextControl, { label: 'Title', value: item.featuredTitle, onChange: function(v){ setItem({ featuredTitle: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextareaControl, { label: 'Description', value: item.featuredDesc, onChange: function(v){ setItem({ featuredDesc: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: 'CTA Label', value: item.featuredCta, onChange: function(v){ setItem({ featuredCta: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: 'CTA URL', value: item.featuredCtaUrl, onChange: function(v){ setItem({ featuredCtaUrl: v }); }, __nextHasNoMarginBottom: true })
                )
            ),

            el(Button, { variant: 'link', isDestructive: true, size: 'small', style: { marginTop: 12 }, onClick: removeItem }, '✕ Remove this item')
        );
    }

    registerBlockType('blockenberg/mega-menu', {
        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = (function(p){
                var v = getTypoCssVars() || function () { return {}; };
                p.style = Object.assign(p.style||{},
                    v(attr.navTypo,'--bkbg-mm-nv-'),
                    v(attr.colHeadingTypo,'--bkbg-mm-ch-'),
                    v(attr.linkTypo,'--bkbg-mm-lk-')
                ); return p;
            })(useBlockProps());

            function updateItem(idx, patch) {
                var items = deepClone(attr.items);
                Object.assign(items[idx], patch);
                setAttr({ items: items });
            }

            function removeItem(idx) {
                var items = deepClone(attr.items);
                items.splice(idx, 1);
                setAttr({ items: items });
            }

            // Editor preview: render simplified nav bar
            return el('div', blockProps,
                el(InspectorControls, {},

                    // Nav Items
                    el(PanelBody, { title: 'Navigation Items', initialOpen: true },
                        attr.items.map(function (item, idx) {
                            return el(ItemEditor, {
                                key: idx, item: item, idx: idx, attr: attr,
                                setItem: function(patch) { updateItem(idx, patch); },
                                removeItem: function() { removeItem(idx); }
                            });
                        }),
                        el(Button, {
                            variant: 'primary', size: 'small', style: { marginTop: 8 },
                            onClick: function() {
                                var items = deepClone(attr.items);
                                items.push({ label: 'New Item', url: '#', hasMega: false, columns: [], showFeatured: false, featuredTitle: '', featuredDesc: '', featuredCta: '', featuredCtaUrl: '', featuredImageUrl: '' });
                                setAttr({ items: items });
                            }
                        }, '+ Add Item')
                    ),

                    // Logo & CTA
                    el(PanelBody, { title: 'Logo & CTA', initialOpen: false },
                        el('p', { style: { fontSize: 11, color: '#64748b', margin: '0 0 6px' } }, 'Logo image:'),
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function(m){ setAttr({ logoUrl: m.url }); },
                                allowedTypes: ['image'],
                                value: attr.logoUrl,
                                render: function(obj) {
                                    return el('div', { style: { marginBottom: 12 } },
                                        el(Button, { onClick: obj.open, variant: 'secondary', size: 'small' }, attr.logoUrl ? 'Change Logo' : 'Set Logo'),
                                        attr.logoUrl && el(Button, { onClick: function(){ setAttr({ logoUrl: '' }); }, variant: 'link', isDestructive: true, size: 'small', style: { marginLeft: 8 } }, 'Remove')
                                    );
                                }
                            })
                        ),
                        el(TextControl, { label: 'Logo Alt Text', value: attr.logoAlt, onChange: function(v){ setAttr({ logoAlt: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Logo Width (px)', value: attr.logoWidth, min: 60, max: 300, onChange: function(v){ setAttr({ logoWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show CTA Button', checked: attr.showCta, onChange: function(v){ setAttr({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showCta && el(TextControl, { label: 'CTA Label', value: attr.ctaLabel, onChange: function(v){ setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showCta && el(TextControl, { label: 'CTA URL', value: attr.ctaUrl, onChange: function(v){ setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                        attr.showCta && el(SelectControl, { label: 'CTA Style', value: attr.ctaStyle, options: [{ label: 'Filled', value: 'filled' }, { label: 'Outline', value: 'outline' }], onChange: function(v){ setAttr({ ctaStyle: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Behaviour
                    el(PanelBody, { title: 'Menu Behaviour', initialOpen: false },
                        el(RangeControl, { label: 'Menu Bar Height (px)', value: attr.menuHeight, min: 48, max: 100, onChange: function(v){ setAttr({ menuHeight: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Sticky on scroll', checked: attr.sticky, onChange: function(v){ setAttr({ sticky: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Open panel on hover', checked: attr.openOnHover, onChange: function(v){ setAttr({ openOnHover: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show link icons', checked: attr.showIcons, onChange: function(v){ setAttr({ showIcons: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show link descriptions', checked: attr.showDescriptions, onChange: function(v){ setAttr({ showDescriptions: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Panel Max Width (px)', value: attr.panelWidth, min: 400, max: 1200, step: 20, onChange: function(v){ setAttr({ panelWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Panel Radius (px)', value: attr.panelRadius, min: 0, max: 32, onChange: function(v){ setAttr({ panelRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: 'Nav Item', value: attr.navTypo || {}, onChange: function(v){ setAttr({ navTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Column Heading', value: attr.colHeadingTypo || {}, onChange: function(v){ setAttr({ colHeadingTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Link Label', value: attr.linkTypo || {}, onChange: function(v){ setAttr({ linkTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Menu Bar Background', value: attr.menuBg,      onChange: function(v){ setAttr({ menuBg:      v || '#ffffff' }); } },
                            { label: 'Menu Text',           value: attr.menuText,    onChange: function(v){ setAttr({ menuText:    v || '#0f172a' }); } },
                            { label: 'Menu Border',         value: attr.menuBorder,  onChange: function(v){ setAttr({ menuBorder:  v || '#e2e8f0' }); } },
                            { label: 'Panel Background',    value: attr.panelBg,     onChange: function(v){ setAttr({ panelBg:     v || '#ffffff' }); } },
                            { label: 'Panel Text',          value: attr.panelText,   onChange: function(v){ setAttr({ panelText:   v || '#0f172a' }); } },
                            { label: 'Accent / Hover',      value: attr.accentColor, onChange: function(v){ setAttr({ accentColor: v || '#6366f1' }); } },
                            { label: 'CTA Background',      value: attr.ctaBg,       onChange: function(v){ setAttr({ ctaBg:       v || '#6366f1' }); } },
                            { label: 'CTA Text',            value: attr.ctaColor,    onChange: function(v){ setAttr({ ctaColor:    v || '#ffffff' }); } },
                            { label: 'Featured Panel BG',   value: attr.featuredBg,  onChange: function(v){ setAttr({ featuredBg:  v || '#ede9fe' }); } }
                        ]
                    })
                ),

                // Editor preview — simplified nav bar
                el('div', {
                    style: {
                        background: attr.menuBg,
                        borderBottom: '1px solid ' + attr.menuBorder,
                        display: 'flex',
                        alignItems: 'center',
                        height: attr.menuHeight + 'px',
                        padding: '0 24px',
                        gap: 32,
                        borderRadius: 8
                    }
                },
                    // Logo
                    attr.logoUrl
                        ? el('img', { src: attr.logoUrl, alt: attr.logoAlt, style: { height: Math.min(36, attr.menuHeight - 20) + 'px', objectFit: 'contain' } })
                        : el('div', { style: { fontWeight: 700, fontSize: 18, color: attr.menuText } }, attr.logoAlt || 'Logo'),

                    // Nav items
                    el('div', { style: { display: 'flex', gap: 24, flex: 1, alignItems: 'center' } },
                        attr.items.map(function (item, idx) {
                            return el('span', {
                                key: idx,
                                style: { color: attr.menuText, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }
                            }, item.label, item.hasMega && el('span', { style: { fontSize: 10, opacity: 0.6 } }, '▾'));
                        })
                    ),

                    // CTA
                    attr.showCta && el('div', {
                        style: {
                            background: attr.ctaStyle === 'filled' ? attr.ctaBg : 'transparent',
                            color: attr.ctaStyle === 'filled' ? attr.ctaColor : attr.ctaBg,
                            border: '2px solid ' + attr.ctaBg,
                            borderRadius: 8,
                            padding: '7px 18px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }
                    }, attr.ctaLabel),

                    // Mega panel preview hint
                    el('div', { style: { fontSize: 11, color: '#94a3b8', marginLeft: 8 } },
                        attr.items.filter(function(i){ return i.hasMega; }).length + ' mega panel(s)')
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var v = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
            var s = Object.assign({},
                v(attr.navTypo,'--bkbg-mm-nv-'),
                v(attr.colHeadingTypo,'--bkbg-mm-ch-'),
                v(attr.linkTypo,'--bkbg-mm-lk-')
            );
            var blockProps = (function(p){p.style=Object.assign(p.style||{},s);return p;})(useBlockProps.save());
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-mm-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
