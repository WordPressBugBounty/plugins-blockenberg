( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var SHADOW_OPTIONS = [
        { label: 'None',   value: 'none' },
        { label: 'Small',  value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large',  value: 'lg' },
    ];

    function star(filled, color) {
        return el('span', { style: { color: filled ? color : '#e5e7eb', fontSize: 14, lineHeight: 1 } }, '★');
    }

    function updateItem(items, idx, field, val) {
        return items.map(function (it, i) {
            if (i !== idx) return it;
            var p = {}; p[field] = val;
            return Object.assign({}, it, p);
        });
    }

    function AvatarInitial(name, size) {
        var initials = (name || 'A').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
        var colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];
        var hash = name.split('').reduce(function (acc, c) { return acc + c.charCodeAt(0); }, 0);
        var bg = colors[hash % colors.length];
        return el('div', {
            style: {
                width: size + 'px', height: size + 'px', borderRadius: '50%',
                background: bg, color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: Math.round(size * 0.38) + 'px',
                flexShrink: 0,
            }
        }, initials);
    }

    function renderCard(item, a) {
        var shadow = a.cardShadow === 'sm' ? '0 1px 6px rgba(0,0,0,0.07)'
            : a.cardShadow === 'md' ? '0 4px 16px rgba(0,0,0,0.10)'
            : a.cardShadow === 'lg' ? '0 8px 32px rgba(0,0,0,0.13)' : 'none';
        return el('div', {
            style: {
                background: a.cardBg,
                border: '1px solid ' + a.cardBorder,
                borderRadius: a.cardRadius + 'px',
                padding: a.cardPadding + 'px',
                width: a.cardWidth + 'px',
                flexShrink: 0,
                boxShadow: shadow,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'relative',
                overflow: 'hidden',
            }
        },
            // Big quote mark
            el('div', {
                style: {
                    position: 'absolute', top: 14, right: 16,
                    fontSize: 56, lineHeight: 1, fontFamily: 'Georgia, serif',
                    color: a.quoteIconColor, pointerEvents: 'none', userSelect: 'none',
                }
            }, '\u201C'),
            // Stars
            a.showStars && el('div', { style: { display: 'flex', gap: 2 } },
                [1, 2, 3, 4, 5].map(function (n) { return star(n <= item.rating, a.starColor); })
            ),
            // Quote
            el('p', {
                className: 'bkbg-tm-quote',
                style: {
                    margin: 0, color: a.quoteColor,
                    flexGrow: 1,
                }
            }, item.quote),
            // Author row
            el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 } },
                a.showAvatar && (
                    item.avatarUrl
                        ? el('img', { src: item.avatarUrl, alt: item.author, style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } })
                        : AvatarInitial(item.author, a.avatarSize)
                ),
                el('div', null,
                    el('div', { className: 'bkbg-tm-author-name', style: { color: a.authorColor } }, item.author),
                    (a.showRole || a.showCompany) && el('div', { className: 'bkbg-tm-author-meta', style: { color: a.roleColor } },
                        [a.showRole ? item.role : '', a.showCompany ? item.company : ''].filter(Boolean).join(', ')
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/testimonial-marquee', {
        title: __('Testimonial Marquee', 'blockenberg'),
        icon: 'format-quote',
        category: 'bkbg-marketing',
        description: __('Infinite auto-scrolling testimonial ticker with ratings, avatars, and author details.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var activeSt = useState(0);
            var activeIdx = activeSt[0];
            var setActiveIdx = activeSt[1];
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = { background: a.wrapperBg || '', padding: a.paddingY + 'px 0', overflow: 'hidden' };
                if (_tvf) { Object.assign(s, _tvf(a.quoteTypo, '--bkmq-qt-'), _tvf(a.nameTypo, '--bkmq-nm-'), _tvf(a.roleTypo, '--bkmq-rl-')); }
                return { style: s };
            })());

            function addItem() {
                set({ items: a.items.concat([{ quote: 'A great testimonial goes here.', author: 'Happy Customer', role: 'Customer', company: '', avatarUrl: '', avatarId: 0, rating: 5, companyLogo: '', companyLogoId: 0 }]) });
            }
            function removeItem(i) {
                if (a.items.length <= 1) return;
                set({ items: a.items.filter(function (_, idx) { return idx !== i; }) });
                setActiveIdx(Math.max(0, activeIdx - 1));
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Testimonials
                    el(PanelBody, { title: 'Testimonials (' + a.items.length + ')', initialOpen: true },
                        a.items.map(function (item, i) {
                            return el('div', {
                                key: i,
                                style: {
                                    border: i === activeIdx ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                    borderRadius: 8, padding: 10, marginBottom: 8,
                                    background: i === activeIdx ? '#f5f3ff' : '#fff',
                                    cursor: 'pointer',
                                }
                            },
                                el('div', {
                                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                                    onClick: function () { setActiveIdx(i); }
                                },
                                    el('span', { style: { fontWeight: 600, fontSize: 12 } }, '★'.repeat(item.rating) + ' ' + item.author),
                                    el(Button, { isDestructive: true, variant: 'tertiary', size: 'small', onClick: function (e) { e.stopPropagation(); removeItem(i); }, __nextHasNoMarginBottom: true }, '✕')
                                ),
                                i === activeIdx && el(Fragment, null,
                                    el('div', { style: { height: 8 } }),
                                    el(TextControl, { label: 'Quote', value: item.quote, onChange: function (v) { set({ items: updateItem(a.items, i, 'quote', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Author name', value: item.author, onChange: function (v) { set({ items: updateItem(a.items, i, 'author', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Role / Title', value: item.role, onChange: function (v) { set({ items: updateItem(a.items, i, 'role', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Company', value: item.company, onChange: function (v) { set({ items: updateItem(a.items, i, 'company', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(RangeControl, { label: 'Star rating', value: item.rating, min: 1, max: 5, onChange: function (v) { set({ items: updateItem(a.items, i, 'rating', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el('div', { style: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7280', marginBottom: 4 } }, 'Avatar'),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) {
                                                var updated = updateItem(a.items, i, 'avatarUrl', media.url);
                                                updated = updateItem(updated, i, 'avatarId', media.id);
                                                set({ items: updated });
                                            },
                                            allowedTypes: ['image'],
                                            value: item.avatarId,
                                            render: function (ref) {
                                                return el(Button, {
                                                    onClick: ref.open,
                                                    variant: item.avatarUrl ? 'secondary' : 'primary',
                                                    size: 'small',
                                                    __nextHasNoMarginBottom: true,
                                                }, item.avatarUrl ? 'Change Avatar' : 'Add Avatar');
                                            }
                                        })
                                    ),
                                    item.avatarUrl && el(Button, {
                                        onClick: function () { set({ items: updateItem(a.items, i, 'avatarUrl', '') }); },
                                        isDestructive: true, variant: 'link', size: 'small',
                                        style: { display: 'block', marginTop: 4 },
                                        __nextHasNoMarginBottom: true,
                                    }, 'Remove Avatar')
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addItem, style: { width: '100%', justifyContent: 'center', marginTop: 4 }, __nextHasNoMarginBottom: true }, '+ Add Testimonial')
                    ),

                    // Display
                    el(PanelBody, { title: 'Display Options', initialOpen: false },
                        el(RangeControl, { label: 'Rows', value: a.rows, min: 1, max: 2, onChange: function (v) { set({ rows: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Direction', value: a.direction, options: [{ label: 'Left (→)', value: 'left' }, { label: 'Right (←)', value: 'right' }], onChange: function (v) { set({ direction: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Speed (higher = faster)', value: a.speed, min: 10, max: 200, onChange: function (v) { set({ speed: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Pause on hover', checked: a.pauseOnHover, onChange: function (v) { set({ pauseOnHover: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Fade edges', checked: a.fadeEdges, onChange: function (v) { set({ fadeEdges: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show stars', checked: a.showStars, onChange: function (v) { set({ showStars: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show avatar', checked: a.showAvatar, onChange: function (v) { set({ showAvatar: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show role', checked: a.showRole, onChange: function (v) { set({ showRole: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show company', checked: a.showCompany, onChange: function (v) { set({ showCompany: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Card dimensions
                    el(PanelBody, { title: 'Card Style', initialOpen: false },
                        el(RangeControl, { label: 'Card width (px)', value: a.cardWidth, min: 200, max: 600, onChange: function (v) { set({ cardWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card gap (px)', value: a.cardGap, min: 8, max: 60, onChange: function (v) { set({ cardGap: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card radius (px)', value: a.cardRadius, min: 0, max: 32, onChange: function (v) { set({ cardRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card padding (px)', value: a.cardPadding, min: 12, max: 48, onChange: function (v) { set({ cardPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Avatar size (px)', value: a.avatarSize, min: 28, max: 72, onChange: function (v) { set({ avatarSize: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Vertical padding (px)', value: a.paddingY, min: 0, max: 100, onChange: function (v) { set({ paddingY: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Card shadow', value: a.cardShadow, options: SHADOW_OPTIONS, onChange: function (v) { set({ cardShadow: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: __('Quote', 'blockenberg'), value: a.quoteTypo, onChange: function (v) { set({ quoteTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Author Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { set({ nameTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Role / Company', 'blockenberg'), value: a.roleTypo, onChange: function (v) { set({ roleTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Wrapper Background', value: a.wrapperBg, onChange: function (v) { set({ wrapperBg: v || '' }); } },
                            { label: 'Card Background', value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Card Border', value: a.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e5e7eb' }); } },
                            { label: 'Quote Text', value: a.quoteColor, onChange: function (v) { set({ quoteColor: v || '#374151' }); } },
                            { label: 'Star Color', value: a.starColor, onChange: function (v) { set({ starColor: v || '#f59e0b' }); } },
                            { label: 'Author Name', value: a.authorColor, onChange: function (v) { set({ authorColor: v || '#111827' }); } },
                            { label: 'Role / Company', value: a.roleColor, onChange: function (v) { set({ roleColor: v || '#6b7280' }); } },
                            { label: 'Quote Icon Color', value: a.quoteIconColor, onChange: function (v) { set({ quoteIconColor: v || '#e0e7ff' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('div', {
                        style: {
                            display: a.rows === 2 ? 'flex' : 'block',
                            flexDirection: 'column',
                            gap: a.rows === 2 ? a.cardGap + 'px' : 0,
                            overflow: 'hidden',
                        }
                    },
                        // Row 1
                        el('div', { style: { display: 'flex', gap: a.cardGap + 'px', overflowX: 'auto', paddingBottom: 8 } },
                            a.items.map(function (item, i) { return el(Fragment, { key: i }, renderCard(item, a)); })
                        ),
                        // Row 2 (reversed order preview)
                        a.rows === 2 && el('div', { style: { display: 'flex', gap: a.cardGap + 'px', overflowX: 'auto' } },
                            a.items.slice().reverse().map(function (item, i) { return el(Fragment, { key: i }, renderCard(item, a)); })
                        )
                    ),
                    el('p', { style: { textAlign: 'center', fontSize: 11, color: '#9ca3af', margin: '10px 0 0' } },
                        '🎞 Infinite scroll active on frontend · ' + a.items.length + ' testimonials · ' + a.rows + ' row(s)'
                    )
                )
            );
        },

        save: function (props) {
            var _tvf = getTypoCssVars();
            var a = props.attributes;
            return el('div', (function () {
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.quoteTypo, '--bkmq-qt-'), _tvf(a.nameTypo, '--bkmq-nm-'), _tvf(a.roleTypo, '--bkmq-rl-')); }
                return useBlockProps.save({ style: s });
            })(),
                el('div', { className: 'bkbg-tm-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
