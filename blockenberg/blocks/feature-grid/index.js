( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _fgTC, _fgTV;
    function _tc() { return _fgTC || (_fgTC = window.bkbgTypographyControl); }
    function _tv() { return _fgTV || (_fgTV = window.bkbgTypoCssVars); }

    var DASHICONS = ['star-filled','admin-site','admin-media','admin-appearance','admin-tools','admin-users','admin-network','admin-home','admin-generic','admin-comments','shield','heart','awards','chart-bar','share','editor-code','format-gallery','format-audio','format-video','format-quote','format-image','format-aside','format-status','format-chat','camera','images-alt2','video-alt3','media-audio','media-code','media-spreadsheet','media-text','media-interactive','media-archive','media-default','media-video','media-document'];

    /* ── CSS vars ─────────────────────────────────────────────────────────── */
    function buildWrapStyle(a) {
        var shadow = a.cardShadow === 'sm' ? '0 1px 4px rgba(0,0,0,0.07)' :
                     a.cardShadow === 'md' ? '0 2px 12px rgba(0,0,0,0.1)' :
                     a.cardShadow === 'lg' ? '0 8px 32px rgba(0,0,0,0.13)' : 'none';
        return Object.assign({
            '--bkbg-fg-cols'       : a.columns,
            '--bkbg-fg-cols-tab'   : a.columnsTablet,
            '--bkbg-fg-cols-mob'   : a.columnsMobile,
            '--bkbg-fg-gap'        : a.gap + 'px',
            '--bkbg-fg-pad'        : a.cardPadding + 'px',
            '--bkbg-fg-radius'     : a.borderRadius + 'px',
            '--bkbg-fg-icon-size'  : a.iconSize + 'px',
            '--bkbg-fg-shape-size' : a.iconShapeSize + 'px',
            '--bkbg-fg-icon-color' : a.iconColor,
            '--bkbg-fg-icon-bg'    : a.iconBg,
            '--bkbg-fg-title-color': a.titleColor,
            '--bkbg-fg-text-color' : a.textColor,
            '--bkbg-fg-link-color' : a.linkColor,
            '--bkbg-fg-card-bg'    : a.cardBg,
            '--bkbg-fg-card-border': a.cardBorderColor,
            '--bkbg-fg-shadow'     : shadow,
            '--bkbg-fg-text-align' : a.textAlign
        }, _tv()(a.typoTitle, '--bkbg-fg-tt-'), _tv()(a.typoText, '--bkbg-fg-tx-'), _tv()(a.typoLink, '--bkbg-fg-lk-'));
    }

    /* ── Color picker ─────────────────────────────────────────────────────── */
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button', title: value || 'default',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Icon renderer ─────────────────────────────────────────────────────── */
    function renderIcon(item, a) {
        var shapeStyle = {};
        if (a.iconShape !== 'none') {
            shapeStyle = {
                width: a.iconShapeSize + 'px',
                height: a.iconShapeSize + 'px',
                background: a.iconBg,
                borderRadius: a.iconShape === 'circle' ? '50%' : (a.borderRadius + 'px'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            };
        }
        var iconEl;
        if (item.iconType === 'emoji') {
            iconEl = el('span', { style: { fontSize: a.iconSize + 'px', lineHeight: 1, display: 'block' } }, item.iconChar || '⭐');
        } else if (item.iconType === 'dashicon') {
            iconEl = el('span', { className: 'dashicons dashicons-' + (item.iconDashicon || 'star-filled'), style: { fontSize: a.iconSize + 'px', color: a.iconColor, display: 'block', width: a.iconSize + 'px', height: a.iconSize + 'px' } });
        } else {
            return null;
        }
        return el('div', { className: 'bkbg-fg-icon-wrap', style: a.iconShape !== 'none' ? shapeStyle : { display: 'flex', alignItems: 'center', justifyContent: 'center' } }, iconEl);
    }

    /* ── Register ─────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/feature-grid', {
        title: __('Feature Grid', 'blockenberg'),
        icon: 'grid-view',
        category: 'bkbg-marketing',
        description: __('Responsive grid of feature cards with icons, titles and text.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var selectedItemState = useState(0);
            var selectedItem = selectedItemState[0];
            var setSelectedItem = selectedItemState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateItem(idx, key, val) {
                var updated = (a.items || []).map(function (item, i) {
                    if (i !== idx) return item;
                    var n = Object.assign({}, item); n[key] = val; return n;
                });
                setAttributes({ items: updated });
            }

            function addItem() {
                setAttributes({ items: (a.items || []).concat([{ iconType: 'emoji', iconChar: '✨', iconDashicon: 'star-filled', title: 'New Feature', text: 'Describe this feature here.', linkLabel: '', linkUrl: '', linkTarget: false }]) });
                setSelectedItem((a.items || []).length);
            }

            function removeItem(idx) {
                setAttributes({ items: (a.items || []).filter(function (_, i) { return i !== idx; }) });
                setSelectedItem(Math.max(0, idx - 1));
            }

            function moveItem(idx, dir) {
                var arr = (a.items || []).slice();
                var target = idx + dir;
                if (target < 0 || target >= arr.length) return;
                var tmp = arr[idx]; arr[idx] = arr[target]; arr[target] = tmp;
                setAttributes({ items: arr });
                setSelectedItem(target);
            }

            var blockProps = useBlockProps({
                className: 'bkbg-fg-wrapper bkbg-fg-icon-pos-' + a.iconPosition + ' bkbg-fg-card-' + a.cardStyle + ' bkbg-fg-hover-' + a.hoverEffect,
                style: buildWrapStyle(a)
            });

            var items = a.items || [];
            var curItem = items[selectedItem] || {};

            /* ── Inspector ──────────────────────────────────────────────────── */
            var inspector = el(InspectorControls, {},
                // Items management
                el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: true },
                    el('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' } },
                        items.map(function (item, idx) {
                            var isSelected = idx === selectedItem;
                            return el('div', {
                                key: idx,
                                style: { display: 'flex', alignItems: 'center', gap: '6px', background: isSelected ? '#e8f0fe' : '#f5f5f5', border: isSelected ? '1px solid #4285f4' : '1px solid #ddd', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' },
                                onClick: function () { setSelectedItem(idx); }
                            },
                                el('span', { style: { fontSize: '18px', minWidth: '24px' } }, item.iconChar || '⭐'),
                                el('span', { style: { flex: 1, fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.title || __('Untitled', 'blockenberg')),
                                el('button', { type: 'button', onClick: function (e) { e.stopPropagation(); moveItem(idx, -1); }, disabled: idx === 0, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 2px', opacity: idx === 0 ? 0.3 : 1 } }, '↑'),
                                el('button', { type: 'button', onClick: function (e) { e.stopPropagation(); moveItem(idx, 1); }, disabled: idx === items.length - 1, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 2px', opacity: idx === items.length - 1 ? 0.3 : 1 } }, '↓'),
                                el('button', { type: 'button', onClick: function (e) { e.stopPropagation(); removeItem(idx); }, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#cc1818', padding: '0 2px' } }, '×')
                            );
                        })
                    ),
                    el(Button, { variant: 'secondary', onClick: addItem, style: { width: '100%', justifyContent: 'center', marginBottom: '16px' } },
                        '+ ' + __('Add Item', 'blockenberg')
                    ),
                    items.length > 0 && el(Fragment, {},
                        el('div', { style: { borderTop: '1px solid #e0e0e0', paddingTop: '12px' } },
                            el('strong', { style: { fontSize: '12px', display: 'block', marginBottom: '8px' } },
                                __('Edit Item', 'blockenberg') + ' #' + (selectedItem + 1)
                            ),
                            el(SelectControl, {
                                label: __('Icon Type', 'blockenberg'), value: curItem.iconType || 'emoji',
                                options: [
                                    { label: __('Emoji', 'blockenberg'), value: 'emoji' },
                                    { label: __('Dashicon', 'blockenberg'), value: 'dashicon' },
                                    { label: __('None', 'blockenberg'), value: 'none' }
                                ],
                                onChange: function (v) { updateItem(selectedItem, 'iconType', v); }
                            }),
                            curItem.iconType === 'emoji' && el(TextControl, {
                                label: __('Emoji / Icon Character', 'blockenberg'),
                                value: curItem.iconChar || '',
                                onChange: function (v) { updateItem(selectedItem, 'iconChar', v); }
                            }),
                            curItem.iconType === 'dashicon' && el(SelectControl, {
                                label: __('Dashicon', 'blockenberg'),
                                value: curItem.iconDashicon || 'star-filled',
                                options: DASHICONS.map(function (d) { return { label: d, value: d }; }),
                                onChange: function (v) { updateItem(selectedItem, 'iconDashicon', v); }
                            }),
                            el(TextControl, {
                                label: __('Title', 'blockenberg'), value: curItem.title || '',
                                onChange: function (v) { updateItem(selectedItem, 'title', v); }
                            }),
                            el(TextControl, {
                                label: __('Description', 'blockenberg'), value: curItem.text || '',
                                onChange: function (v) { updateItem(selectedItem, 'text', v); }
                            }),
                            el(TextControl, {
                                label: __('Link Label (optional)', 'blockenberg'), value: curItem.linkLabel || '',
                                onChange: function (v) { updateItem(selectedItem, 'linkLabel', v); }
                            }),
                            curItem.linkLabel && el(Fragment, {},
                                el(TextControl, {
                                    label: __('Link URL', 'blockenberg'), value: curItem.linkUrl || '',
                                    onChange: function (v) { updateItem(selectedItem, 'linkUrl', v); }
                                }),
                                el(ToggleControl, {
                                    label: __('Open in new tab', 'blockenberg'), checked: !!curItem.linkTarget,
                                    onChange: function (v) { updateItem(selectedItem, 'linkTarget', v); }
                                })
                            )
                        )
                    )
                ),

                // Layout
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Columns (Desktop)', 'blockenberg'), value: a.columns, min: 1, max: 6,
                        onChange: function (v) { setAttributes({ columns: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Columns (Tablet)', 'blockenberg'), value: a.columnsTablet, min: 1, max: 4,
                        onChange: function (v) { setAttributes({ columnsTablet: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Columns (Mobile)', 'blockenberg'), value: a.columnsMobile, min: 1, max: 3,
                        onChange: function (v) { setAttributes({ columnsMobile: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 0, max: 80,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'), value: a.textAlign,
                        options: [{ label: __('Left', 'blockenberg'), value: 'left' }, { label: __('Center', 'blockenberg'), value: 'center' }, { label: __('Right', 'blockenberg'), value: 'right' }],
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'), value: a.iconPosition,
                        options: [{ label: __('Top (above title)', 'blockenberg'), value: 'top' }, { label: __('Left (inline)', 'blockenberg'), value: 'left' }],
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    })
                ),

                // Card Style
                el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: a.cardStyle,
                        options: [
                            { label: __('Shadow', 'blockenberg'), value: 'shadow' },
                            { label: __('Outlined', 'blockenberg'), value: 'outlined' },
                            { label: __('Flat', 'blockenberg'), value: 'flat' },
                            { label: __('Plain (no card)', 'blockenberg'), value: 'plain' }
                        ],
                        onChange: function (v) { setAttributes({ cardStyle: v }); }
                    }),
                    a.cardStyle === 'shadow' && el(SelectControl, {
                        label: __('Shadow Size', 'blockenberg'), value: a.cardShadow,
                        options: [{ label: __('Small', 'blockenberg'), value: 'sm' }, { label: __('Medium', 'blockenberg'), value: 'md' }, { label: __('Large', 'blockenberg'), value: 'lg' }],
                        onChange: function (v) { setAttributes({ cardShadow: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Hover Effect', 'blockenberg'), value: a.hoverEffect,
                        options: [
                            { label: __('Lift (translateY)', 'blockenberg'), value: 'lift' },
                            { label: __('Scale', 'blockenberg'), value: 'scale' },
                            { label: __('Glow (accent border)', 'blockenberg'), value: 'glow' },
                            { label: __('None', 'blockenberg'), value: 'none' }
                        ],
                        onChange: function (v) { setAttributes({ hoverEffect: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Card Padding (px)', 'blockenberg'), value: a.cardPadding, min: 8, max: 80,
                        onChange: function (v) { setAttributes({ cardPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 40,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Animate on Scroll', 'blockenberg'), checked: a.animate,
                        onChange: function (v) { setAttributes({ animate: v }); }
                    })
                ),

                // Icon
                el(PanelBody, { title: __('Icon Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Icon Shape Background', 'blockenberg'), value: a.iconShape,
                        options: [{ label: __('Circle', 'blockenberg'), value: 'circle' }, { label: __('Square (rounded)', 'blockenberg'), value: 'square' }, { label: __('None', 'blockenberg'), value: 'none' }],
                        onChange: function (v) { setAttributes({ iconShape: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'), value: a.iconSize, min: 16, max: 80,
                        onChange: function (v) { setAttributes({ iconSize: v }); }
                    }),
                    a.iconShape !== 'none' && el(RangeControl, {
                        label: __('Shape Size (px)', 'blockenberg'), value: a.iconShapeSize, min: 40, max: 120,
                        onChange: function (v) { setAttributes({ iconShapeSize: v }); }
                    }),
                    cc('iconColor', __('Icon Color', 'blockenberg'), 'iconColor'),
                    a.iconShape !== 'none' && cc('iconBg', __('Icon Background', 'blockenberg'), 'iconBg')
                ),

                // Typography & Colors
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), {
                        label: __('Title Typography', 'blockenberg'),
                        value: a.typoTitle,
                        onChange: function (v) { setAttributes({ typoTitle: v }); }
                    }),
                    _tc() && el(_tc(), {
                        label: __('Text Typography', 'blockenberg'),
                        value: a.typoText,
                        onChange: function (v) { setAttributes({ typoText: v }); }
                    }),
                    _tc() && el(_tc(), {
                        label: __('Link Typography', 'blockenberg'),
                        value: a.typoLink,
                        onChange: function (v) { setAttributes({ typoLink: v }); }
                    })
                ),
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    cc('titleColor', __('Title Color', 'blockenberg'), 'titleColor'),
                    cc('textColor', __('Text Color', 'blockenberg'), 'textColor'),
                    cc('linkColor', __('Link Color', 'blockenberg'), 'linkColor'),
                    cc('cardBg', __('Card Background', 'blockenberg'), 'cardBg'),
                    a.cardStyle === 'outlined' && cc('cardBorderColor', __('Card Border Color', 'blockenberg'), 'cardBorderColor')
                )
            );

            /* ── Preview ─────────────────────────────────────────────────── */
            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-fg-grid' },
                        items.map(function (item, idx) {
                            return el('div', { key: idx, className: 'bkbg-fg-card' + (a.animate ? ' bkbg-fg-anim' : '') },
                                item.iconType !== 'none' && el('div', {
                                    className: 'bkbg-fg-icon-area'
                                }, renderIcon(item, a)),
                                el('div', { className: 'bkbg-fg-body' },
                                    el(RichText, {
                                        tagName: 'h3', className: 'bkbg-fg-title',
                                        value: item.title, placeholder: __('Feature Title', 'blockenberg'),
                                        onChange: function (v) { updateItem(idx, 'title', v); },
                                        allowedFormats: ['core/bold', 'core/italic']
                                    }),
                                    el(RichText, {
                                        tagName: 'p', className: 'bkbg-fg-text',
                                        value: item.text, placeholder: __('Feature description…', 'blockenberg'),
                                        onChange: function (v) { updateItem(idx, 'text', v); },
                                        allowedFormats: ['core/bold', 'core/italic', 'core/link']
                                    }),
                                    item.linkLabel && el('a', { className: 'bkbg-fg-link', href: item.linkUrl || '#', style: { pointerEvents: 'none' } },
                                        item.linkLabel,
                                        el('span', { className: 'bkbg-fg-link-arrow' }, ' →')
                                    )
                                )
                            );
                        })
                    )
                )
            );
        },

        /* ── Save ───────────────────────────────────────────────────────── */
        save: function (props) {
            var a = props.attributes;
            var items = a.items || [];

            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-fg-wrapper bkbg-fg-icon-pos-' + a.iconPosition + ' bkbg-fg-card-' + a.cardStyle + ' bkbg-fg-hover-' + a.hoverEffect,
                style: buildWrapStyle(a)
            }),
                el('div', { className: 'bkbg-fg-grid' },
                    items.map(function (item, idx) {
                        var iconEl = null;
                        if (item.iconType === 'emoji') {
                            iconEl = el('span', { style: { fontSize: a.iconSize + 'px', lineHeight: 1, display: 'block' } }, item.iconChar || '⭐');
                        } else if (item.iconType === 'dashicon') {
                            iconEl = el('span', { className: 'dashicons dashicons-' + (item.iconDashicon || 'star-filled') });
                        }

                        return el('div', {
                            key: idx,
                            className: 'bkbg-fg-card' + (a.animate ? ' bkbg-fg-anim' : '')
                        },
                            item.iconType !== 'none' && iconEl && el('div', { className: 'bkbg-fg-icon-area' },
                                el('div', { className: 'bkbg-fg-icon-wrap' }, iconEl)
                            ),
                            el('div', { className: 'bkbg-fg-body' },
                                el(RichText.Content, { tagName: 'h3', className: 'bkbg-fg-title', value: item.title }),
                                el(RichText.Content, { tagName: 'p', className: 'bkbg-fg-text', value: item.text }),
                                item.linkLabel && el('a', {
                                    className: 'bkbg-fg-link',
                                    href: item.linkUrl || '#',
                                    target: item.linkTarget ? '_blank' : undefined,
                                    rel: item.linkTarget ? 'noopener noreferrer' : undefined
                                }, item.linkLabel, el('span', { className: 'bkbg-fg-link-arrow', 'aria-hidden': 'true' }, ' →'))
                            )
                        );
                    })
                )
            );
        }
    });
}() );
