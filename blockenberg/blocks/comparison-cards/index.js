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
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    function makeId() { return 'cpc' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-cpc-accent':       a.accentColor,
            '--bkbg-cpc-hl-bg':        a.highlightBg,
            '--bkbg-cpc-hl-color':     a.highlightColor,
            '--bkbg-cpc-hl-border':    a.highlightBorder,
            '--bkbg-cpc-card-bg':      a.cardBg,
            '--bkbg-cpc-card-border':  a.cardBorder,
            '--bkbg-cpc-check':        a.checkColor,
            '--bkbg-cpc-cross':        a.crossColor,
            '--bkbg-cpc-dash':         a.dashColor,
            '--bkbg-cpc-badge-bg':     a.badgeBg,
            '--bkbg-cpc-badge-color':  a.badgeColor,
            '--bkbg-cpc-title-color':  a.titleColor,
            '--bkbg-cpc-sect-title':   a.sectionTitleColor,
            '--bkbg-cpc-sub-color':    a.subtitleColor,
            '--bkbg-cpc-price-color':  a.priceColor,
            '--bkbg-cpc-period-color': a.periodColor,
            '--bkbg-cpc-feat-color':   a.featureColor,
            '--bkbg-cpc-cta-bg':       a.ctaBg,
            '--bkbg-cpc-cta-color':    a.ctaColor,
            '--bkbg-cpc-cta-hl-bg':    a.ctaHighlightBg,
            '--bkbg-cpc-cta-hl-color': a.ctaHighlightColor,
            '--bkbg-cpc-card-r':       a.cardRadius + 'px',
            '--bkbg-cpc-cta-r':        a.ctaRadius  + 'px',
            '--bkbg-cpc-badge-r':      a.badgeRadius + 'px',
            '--bkbg-cpc-gap':          a.gap + 'px',
            '--bkbg-cpc-price-sz':     a.priceSize     + 'px',
            '--bkbg-cpc-feat-sz':      a.featureSize   + 'px',
            '--bkbg-cpc-title-fw':     a.titleFontWeight,
            '--bkbg-cpc-title-lh':     a.titleLineHeight,
            '--bkbg-cpc-feat-fw':      a.featureFontWeight,
            '--bkbg-cpc-feat-lh':      a.featureLineHeight,
            paddingTop:    a.paddingTop    + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        }, _tv(a.typoTitle, '--bkcpc-title-'), _tv(a.typoFeature, '--bkcpc-feat-'));
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

    /* Feature icon + color by type */
    function featureIcon(type, a) {
        if (type === 'check') return el('span', { style: { color: a.checkColor, fontWeight: 700, fontSize: '15px', flexShrink: 0 } }, '✓');
        if (type === 'cross') return el('span', { style: { color: a.crossColor, fontWeight: 700, fontSize: '15px', flexShrink: 0 } }, '✗');
        return el('span', { style: { color: a.dashColor, fontWeight: 700, fontSize: '15px', flexShrink: 0 } }, '—');
    }

    /* ── Individual comparison card ───────────────────────────────── */
    function CompCard(props) {
        var item = props.item;
        var a    = props.a;
        var hl   = item.highlighted;

        var cardStyle = {
            flex: '1 1 0',
            minWidth: '220px',
            background: hl ? a.highlightBg : a.cardBg,
            border: '2px solid ' + (hl ? a.highlightBorder : a.cardBorder),
            borderRadius: a.cardRadius + 'px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: hl ? '0 8px 32px rgba(108,63,181,0.18)' : '0 2px 10px rgba(0,0,0,0.06)',
            transform: hl ? 'translateY(-8px)' : 'none',
            transition: 'box-shadow 0.2s, transform 0.2s',
        };

        return el('div', { style: cardStyle },
            /* Badge */
            item.badge && el('div', { style: { background: a.badgeBg, color: a.badgeColor, fontSize: '11px', fontWeight: 700, textAlign: 'center', padding: '4px 10px', borderRadius: a.badgeRadius + 'px 0 ' + a.badgeRadius + 'px 0', position: 'absolute', top: 0, right: 0, letterSpacing: '0.05em', textTransform: 'uppercase' } }, item.badge),

            /* Header */
            el('div', { style: { padding: '28px 24px 20px', flex: '0 0 auto' } },
                el('p', { style: { margin: 0, fontSize: a.cardTitleSize + 'px', fontWeight: 800, color: hl ? a.highlightColor : a.sectionTitleColor } }, item.title),
                item.subtitle && el('p', { style: { margin: '4px 0 0', fontSize: '13px', color: hl ? a.highlightColor : a.subtitleColor, opacity: 0.85 } }, item.subtitle)
            ),

            /* Price */
            el('div', { style: { padding: '0 24px 20px', flex: '0 0 auto', borderBottom: '1px solid ' + (hl ? a.highlightBorder : a.cardBorder) } },
                el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '4px' } },
                    el('span', { style: { fontSize: a.priceSize + 'px', fontWeight: 900, color: hl ? a.highlightColor : a.priceColor, lineHeight: 1 } },
                        a.currency + item.price
                    ),
                    item.period && el('span', { style: { fontSize: '13px', color: hl ? a.highlightColor : a.periodColor, marginBottom: '6px', opacity: 0.8 } }, '/' + item.period)
                )
            ),

            /* Features */
            el('div', { style: { padding: '20px 24px', flex: '1 1 auto' } },
                item.features.map(function (f, fi) {
                    return el('div', { key: fi, style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' } },
                        featureIcon(f.type, a),
                        el('span', { style: { fontSize: a.featureSize + 'px', color: hl ? a.highlightColor : a.featureColor, lineHeight: a.featureLineHeight, fontWeight: a.featureFontWeight } }, f.text)
                    );
                })
            ),

            /* CTA */
            item.ctaLabel && el('div', { style: { padding: '0 24px 28px', flex: '0 0 auto' } },
                el('a', { href: item.ctaUrl || '#', target: item.ctaNewTab ? '_blank' : '_self', rel: 'noopener noreferrer',
                    style: { display: 'block', textAlign: 'center', padding: '13px 20px', borderRadius: a.ctaRadius + 'px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', letterSpacing: '0.02em',
                        background: hl ? a.ctaHighlightBg : a.ctaBg,
                        color:      hl ? a.ctaHighlightColor : a.ctaColor,
                        border:     hl ? 'none' : '2px solid ' + a.cardBorder,
                    }
                }, item.ctaLabel)
            )
        );
    }

    registerBlockType('blockenberg/comparison-cards', {
        title: __('Comparison Cards', 'blockenberg'),
        icon: 'columns',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var editItemState = useState(null);
            var editItemId = editItemState[0];
            var setEditItemId = editItemState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateItem(id, key, val) {
                setAttributes({ items: a.items.map(function (it) {
                    if (it.id !== id) return it;
                    var u = Object.assign({}, it); u[key] = val; return u;
                }) });
            }

            function removeItem(id) {
                setAttributes({ items: a.items.filter(function (it) { return it.id !== id; }) });
            }

            function addItem() {
                var newId = makeId();
                setAttributes({ items: a.items.concat([{
                    id: newId, title: 'New Plan', subtitle: '', price: '49', period: 'mo',
                    badge: '', highlighted: false, ctaLabel: 'Get Started', ctaUrl: '', ctaNewTab: false,
                    features: [{ text: 'Feature one', type: 'check' }, { text: 'Feature two', type: 'cross' }]
                }]) });
                setEditItemId(newId);
            }

            function addFeature(id) {
                updateItem(id, 'features', (a.items.find(function (it) { return it.id === id; }).features || []).concat([{ text: 'New feature', type: 'check' }]));
            }

            function updateFeature(itemId, fi, key, val) {
                setAttributes({ items: a.items.map(function (it) {
                    if (it.id !== itemId) return it;
                    var feats = it.features.map(function (f, idx) {
                        if (idx !== fi) return f;
                        var u = Object.assign({}, f); u[key] = val; return u;
                    });
                    return Object.assign({}, it, { features: feats });
                }) });
            }

            function removeFeature(itemId, fi) {
                setAttributes({ items: a.items.map(function (it) {
                    if (it.id !== itemId) return it;
                    return Object.assign({}, it, { features: it.features.filter(function (_, idx) { return idx !== fi; }) });
                }) });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Cards', 'blockenberg'), initialOpen: true },
                        a.items.map(function (item) {
                            var isEdit = editItemId === item.id;
                            return el('div', { key: item.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } },
                                el('div', { onClick: function () { setEditItemId(isEdit ? null : item.id); },
                                    style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', cursor: 'pointer', background: isEdit ? '#f0e9ff' : '#fafafa' } },
                                    item.highlighted && el('span', { style: { background: '#6c3fb5', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '99px', textTransform: 'uppercase' } }, 'HL'),
                                    el('span', { style: { flex: 1, fontSize: '12px', fontWeight: 700 } }, item.title),
                                    el('span', { style: { fontSize: '12px', color: '#888' } }, a.currency + item.price)
                                ),
                                isEdit && el('div', { style: { padding: '10px', borderTop: '1px solid #e0e0e0' } },
                                    el(TextControl, { label: __('Plan title',  'blockenberg'), value: item.title,    onChange: function (v) { updateItem(item.id, 'title', v); } }),
                                    el(TextControl, { label: __('Subtitle',    'blockenberg'), value: item.subtitle, onChange: function (v) { updateItem(item.id, 'subtitle', v); } }),
                                    el(TextControl, { label: __('Price',       'blockenberg'), value: item.price,    onChange: function (v) { updateItem(item.id, 'price', v); } }),
                                    el(TextControl, { label: __('Period (e.g. mo / yr)', 'blockenberg'), value: item.period, onChange: function (v) { updateItem(item.id, 'period', v); } }),
                                    el(TextControl, { label: __('Badge text',  'blockenberg'), value: item.badge,    onChange: function (v) { updateItem(item.id, 'badge', v); }, placeholder: 'Most Popular' }),
                                    el(TextControl, { label: __('CTA label',   'blockenberg'), value: item.ctaLabel, onChange: function (v) { updateItem(item.id, 'ctaLabel', v); } }),
                                    el(TextControl, { label: __('CTA URL',     'blockenberg'), value: item.ctaUrl,   onChange: function (v) { updateItem(item.id, 'ctaUrl', v); } }),
                                    el(ToggleControl, { label: __('Highlighted (featured card)', 'blockenberg'), checked: item.highlighted, onChange: function (v) { updateItem(item.id, 'highlighted', v); }, __nextHasNoMarginBottom: true }),
                                    el(ToggleControl, { label: __('CTA opens in new tab', 'blockenberg'), checked: item.ctaNewTab, onChange: function (v) { updateItem(item.id, 'ctaNewTab', v); }, __nextHasNoMarginBottom: true }),

                                    /* Features sub-list */
                                    el('p', { style: { fontWeight: 700, fontSize: '12px', margin: '12px 0 6px', textTransform: 'uppercase', color: '#444', letterSpacing: '0.05em' } }, __('Features', 'blockenberg')),
                                    item.features.map(function (feat, fi) {
                                        return el('div', { key: fi, style: { border: '1px solid #eee', borderRadius: '6px', padding: '6px 8px', marginBottom: '6px' } },
                                            el(TextControl, { label: __('Text', 'blockenberg'), value: feat.text, onChange: function (v) { updateFeature(item.id, fi, 'text', v); } }),
                                            el(SelectControl, { label: __('Type', 'blockenberg'), value: feat.type, options: [{ label: '✓ Check', value: 'check' }, { label: '✗ Cross', value: 'cross' }, { label: '— Dash', value: 'dash' }], onChange: function (v) { updateFeature(item.id, fi, 'type', v); } }),
                                            el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { removeFeature(item.id, fi); } }, __('Remove', 'blockenberg'))
                                        );
                                    }),
                                    el(Button, { variant: 'secondary', size: 'compact', onClick: function () { addFeature(item.id); }, style: { marginBottom: '10px' } }, '+ ' + __('Add Feature', 'blockenberg')),
                                    el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { removeItem(item.id); } }, __('Remove card', 'blockenberg'))
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addItem, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Card', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show section title',    'blockenberg'), checked: a.showTitle,    onChange: function (v) { setAttributes({ showTitle:    v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show subtitle',         'blockenberg'), checked: a.showSubtitle, onChange: function (v) { setAttributes({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show "vs" badges',      'blockenberg'), checked: a.showVsBadge,  onChange: function (v) { setAttributes({ showVsBadge:  v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl,   { label: __('Currency symbol', 'blockenberg'), value: a.currency, onChange: function (v) { setAttributes({ currency: v }); } })
                    ),
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)',    'blockenberg'), value: a.cardRadius,    min: 0,  max: 32, onChange: function (v) { setAttributes({ cardRadius:    v }); } }),
                        el(RangeControl, { label: __('CTA radius (px)',     'blockenberg'), value: a.ctaRadius,     min: 0,  max: 32, onChange: function (v) { setAttributes({ ctaRadius:     v }); } }),
                        el(RangeControl, { label: __('Gap (px)',            'blockenberg'), value: a.gap,           min: 0,  max: 60, onChange: function (v) { setAttributes({ gap:           v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Feature Typography', 'blockenberg'), value: a.typoFeature, onChange: function (v) { setAttributes({ typoFeature: v }); } }),
                        el(RangeControl, { label: __('Card title size (px)','blockenberg'), value: a.cardTitleSize, min: 14, max: 36, onChange: function (v) { setAttributes({ cardTitleSize: v }); } }),
                        el(RangeControl, { label: __('Price size (px)',     'blockenberg'), value: a.priceSize,     min: 24, max: 72, onChange: function (v) { setAttributes({ priceSize:     v }); } })
                    ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',      __('Accent',           'blockenberg'), 'accentColor'),
                        cc('highlightBg',      __('Highlighted card bg',    'blockenberg'), 'highlightBg'),
                        cc('highlightColor',   __('Highlighted text',       'blockenberg'), 'highlightColor'),
                        cc('highlightBorder',  __('Highlighted border',     'blockenberg'), 'highlightBorder'),
                        cc('cardBg',           __('Card background',        'blockenberg'), 'cardBg'),
                        cc('cardBorder',       __('Card border',            'blockenberg'), 'cardBorder'),
                        cc('checkColor',       __('Check icon',             'blockenberg'), 'checkColor'),
                        cc('crossColor',       __('Cross icon',             'blockenberg'), 'crossColor'),
                        cc('dashColor',        __('Dash icon',              'blockenberg'), 'dashColor'),
                        cc('badgeBg',          __('Badge background',       'blockenberg'), 'badgeBg'),
                        cc('badgeColor',       __('Badge text',             'blockenberg'), 'badgeColor'),
                        cc('titleColor',       __('Section title',          'blockenberg'), 'titleColor'),
                        cc('sectionTitleColor',__('Card title',             'blockenberg'), 'sectionTitleColor'),
                        cc('subtitleColor',    __('Subtitle',               'blockenberg'), 'subtitleColor'),
                        cc('priceColor',       __('Price',                  'blockenberg'), 'priceColor'),
                        cc('periodColor',      __('Period',                 'blockenberg'), 'periodColor'),
                        cc('featureColor',     __('Feature text',           'blockenberg'), 'featureColor'),
                        cc('ctaBg',            __('CTA background',         'blockenberg'), 'ctaBg'),
                        cc('ctaColor',         __('CTA text',               'blockenberg'), 'ctaColor'),
                        cc('ctaHighlightBg',   __('CTA highlighted bg',     'blockenberg'), 'ctaHighlightBg'),
                        cc('ctaHighlightColor',__('CTA highlighted text',   'blockenberg'), 'ctaHighlightColor'),
                        cc('bgColor',          __('Section background',     'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    /* Section header */
                    el('div', { style: { textAlign: 'center', marginBottom: '40px' } },
                        a.showTitle && el(RichText, { tagName: 'h2', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Compare Plans', 'blockenberg'), className: 'bkcpc-title', style: { color: a.titleColor, margin: '0 0 10px' } }),
                        a.showSubtitle && el(RichText, { tagName: 'p', value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); }, placeholder: __('Choose the plan that works for you', 'blockenberg'), style: { fontSize: '17px', color: a.subtitleColor, margin: 0, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' } })
                    ),

                    /* Cards row */
                    el('div', { style: { display: 'flex', gap: a.gap + 'px', alignItems: 'flex-end', flexWrap: 'wrap', position: 'relative' } },
                        a.items.map(function (item, idx) {
                            return el(Fragment, { key: item.id },
                                el(CompCard, { item: item, a: a }),
                                /* vs badge between cards */
                                a.showVsBadge && idx < a.items.length - 1 && el('div', { style: { flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: a.accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, alignSelf: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 2 } }, 'vs')
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-cpc-wrapper', style: buildWrapStyle(a) }),
                el('div', { style: { textAlign: 'center', marginBottom: '40px' } },
                    a.showTitle    && el(RichText.Content, { tagName: 'h2', className: 'bkbg-cpc-title bkcpc-title', value: a.title }),
                    a.showSubtitle && el(RichText.Content, { tagName: 'p',  className: 'bkbg-cpc-subtitle', value: a.subtitle })
                ),
                el('div', { className: 'bkbg-cpc-grid', 'data-items': JSON.stringify(a.items), 'data-currency': a.currency, 'data-show-vs': a.showVsBadge ? '1' : '0' })
            );
        }
    });
}() );
