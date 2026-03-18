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
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var STYLE_OPTIONS = [
        { label: __('Cards',   'blockenberg'), value: 'cards' },
        { label: __('Minimal', 'blockenberg'), value: 'minimal' },
        { label: __('Inline',  'blockenberg'), value: 'inline' },
    ];
    var HOVER_OPTIONS = [
        { label: __('Lift', 'blockenberg'), value: 'lift' },
        { label: __('Glow', 'blockenberg'), value: 'glow' },
        { label: __('None', 'blockenberg'), value: 'none' },
    ];
    var SHADOW_OPTIONS = [
        { label: __('None',   'blockenberg'), value: 'none' },
        { label: __('Small',  'blockenberg'), value: 'sm' },
        { label: __('Medium', 'blockenberg'), value: 'md' },
    ];
    var PROF_OPTIONS = [
        { label: __('Dots',   'blockenberg'), value: 'dots' },
        { label: __('Bar',    'blockenberg'), value: 'bar' },
        { label: __('Label',  'blockenberg'), value: 'label' },
    ];
    var PROF_LABELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

    function makeId() { return 'ts' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        var shadow = a.cardShadow === 'sm' ? '0 1px 4px rgba(0,0,0,0.07)'
                   : a.cardShadow === 'md' ? '0 4px 16px rgba(0,0,0,0.1)' : 'none';
        return {
            '--bkbg-ts-shadow':       shadow,
            '--bkbg-ts-radius':       a.cardRadius + 'px',
            '--bkbg-ts-pad':          a.cardPadding + 'px',
            '--bkbg-ts-card-bg':      a.cardBg,
            '--bkbg-ts-border':       a.cardBorderColor,
            '--bkbg-ts-label-color':  a.labelColor,
            '--bkbg-ts-desc-color':   a.descColor,
            '--bkbg-ts-cat-color':    a.categoryLabelColor,
            '--bkbg-ts-cat-size':     a.categoryLabelSize + 'px',
            '--bkbg-ts-accent':       a.accentColor,
            '--bkbg-ts-icon-size':    a.iconSize + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined
        };
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Proficiency indicator ─────────────────────────────────────────────── */
    function ProfIndicator(props) {
        var level = props.level || 0; /* 1-5 */
        var style = props.style;
        var color = props.color;
        if (!level || level < 1) return null;

        if (style === 'dots') {
            return el('div', { style: { display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '6px' } },
                [1,2,3,4,5].map(function (n) {
                    return el('div', { key: n, style: { width: '6px', height: '6px', borderRadius: '50%', background: n <= level ? color : '#e5e7eb' } });
                })
            );
        }
        if (style === 'bar') {
            return el('div', { style: { height: '3px', background: '#e5e7eb', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' } },
                el('div', { style: { height: '100%', width: ((level / 5) * 100) + '%', background: color, borderRadius: '3px' } })
            );
        }
        if (style === 'label') {
            return el('span', { style: { fontSize: '10px', color: color, fontWeight: 600, background: color + '18', padding: '2px 6px', borderRadius: '99px', display: 'inline-block', marginTop: '6px' } }, PROF_LABELS[level - 1] || '');
        }
        return null;
    }

    /* ── Single tech item ─────────────────────────────────────────────────── */
    function TechItem(props) {
        var item = props.item;
        var a = props.a;
        var isCards = a.displayStyle === 'cards';
        var isInline = a.displayStyle === 'inline';

        var cardStyle = Object.assign({
            display: 'flex',
            flexDirection: isInline ? 'row' : 'column',
            alignItems: 'center',
            gap: isInline ? '10px' : '6px',
            textDecoration: 'none',
            transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        }, isCards ? {
            background: 'var(--bkbg-ts-card-bg)',
            borderRadius: 'var(--bkbg-ts-radius)',
            padding: 'var(--bkbg-ts-pad)',
            boxShadow: 'var(--bkbg-ts-shadow)',
            border: a.showBorder ? '1px solid var(--bkbg-ts-border)' : 'none',
        } : {});

        var imgEl = item.imageUrl
            ? el('img', { src: item.imageUrl, alt: item.name || '', style: { width: 'var(--bkbg-ts-icon-size)', height: 'var(--bkbg-ts-icon-size)', objectFit: 'contain', filter: a.grayscale ? 'grayscale(100%)' : 'none', transition: 'filter 0.22s ease', display: 'block', flexShrink: 0 } })
            : el('div', { style: { width: 'var(--bkbg-ts-icon-size)', height: 'var(--bkbg-ts-icon-size)', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af', flexShrink: 0 } }, __('Logo', 'blockenberg'));

        return el('div', { className: 'bkbg-ts-item bkbg-ts-hover-' + a.hoverEffect + (a.animate ? ' bkbg-ts-anim' : ''), style: cardStyle },
            imgEl,
            el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: isInline ? 'flex-start' : 'center' } },
                a.showLabel && el('span', { className: 'bkbg-ts-label', style: { color: 'var(--bkbg-ts-label-color)', textAlign: 'center' } }, item.name),
                a.showDescription && item.description && el('span', { className: 'bkbg-ts-desc', style: { color: 'var(--bkbg-ts-desc-color)', textAlign: 'center' } }, item.description),
                a.showProficiency && item.proficiency
                    ? el(ProfIndicator, { level: item.proficiency, style: a.proficiencyStyle, color: a.accentColor })
                    : null
            )
        );
    }

    registerBlockType('blockenberg/tech-stack', {
        title: __('Tech Stack', 'blockenberg'),
        icon: 'admin-tools',
        category: 'bkbg-business',
        description: __('Showcase your technology stack with category grouping, logos, and proficiency levels.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, buildWrapStyle(a));
                if (_tvf) {
                    Object.assign(s, _tvf(a.labelTypo, '--bktst-lb-'));
                    Object.assign(s, _tvf(a.descTypo, '--bktst-ds-'));
                }
                return { style: s };
            })());

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function setCat(catId, patch) {
                setAttributes({ categories: a.categories.map(function (c) { return c.id === catId ? Object.assign({}, c, patch) : c; }) });
            }
            function addCat() {
                setAttributes({ categories: a.categories.concat([{ id: makeId(), label: 'New Category', items: [{ id: makeId(), name: 'New Tool', imageUrl: '', imageId: 0, url: '', linkTarget: false, description: '', proficiency: 3 }] }]) });
            }
            function removeCat(catId) {
                if (a.categories.length <= 1) return;
                setAttributes({ categories: a.categories.filter(function (c) { return c.id !== catId; }) });
            }
            function addItem(catId) {
                setCat(catId, { items: (a.categories.find(function (c) { return c.id === catId; }).items || []).concat([{ id: makeId(), name: 'New Tool', imageUrl: '', imageId: 0, url: '', linkTarget: false, description: '', proficiency: 3 }]) });
            }
            function updateItem(catId, itemId, key, val) {
                setCat(catId, { items: a.categories.find(function (c) { return c.id === catId; }).items.map(function (it) { if (it.id !== itemId) return it; var u = Object.assign({}, it); u[key] = val; return u; }) });
            }
            function removeItem(catId, itemId) {
                var cat = a.categories.find(function (c) { return c.id === catId; });
                if ((cat.items || []).length <= 1) return;
                setCat(catId, { items: cat.items.filter(function (it) { return it.id !== itemId; }) });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Display style', 'blockenberg'), value: a.displayStyle, options: STYLE_OPTIONS, onChange: function (v) { setAttributes({ displayStyle: v }); } }),
                        el(SelectControl, { label: __('Hover effect', 'blockenberg'), value: a.hoverEffect, options: HOVER_OPTIONS, onChange: function (v) { setAttributes({ hoverEffect: v }); } }),
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 2, max: 8, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 48, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(RangeControl, { label: __('Category gap (px)', 'blockenberg'), value: a.categoryGap, min: 16, max: 80, onChange: function (v) { setAttributes({ categoryGap: v }); } }),
                        el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: a.iconSize, min: 24, max: 96, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                        el(ToggleControl, { label: __('Show label', 'blockenberg'), checked: a.showLabel, onChange: function (v) { setAttributes({ showLabel: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show description', 'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttributes({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show category headers', 'blockenberg'), checked: a.showCategories, onChange: function (v) { setAttributes({ showCategories: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Grayscale logos', 'blockenberg'), checked: a.grayscale, onChange: function (v) { setAttributes({ grayscale: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Color on hover', 'blockenberg'), checked: a.colorOnHover, onChange: function (v) { setAttributes({ colorOnHover: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Animate on scroll', 'blockenberg'), checked: a.animate, onChange: function (v) { setAttributes({ animate: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Proficiency', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show proficiency', 'blockenberg'), checked: a.showProficiency, onChange: function (v) { setAttributes({ showProficiency: v }); }, __nextHasNoMarginBottom: true }),
                        a.showProficiency && el(SelectControl, { label: __('Style', 'blockenberg'), value: a.proficiencyStyle, options: PROF_OPTIONS, onChange: function (v) { setAttributes({ proficiencyStyle: v }); } })
                    ),
                    a.displayStyle === 'cards' && el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Padding (px)', 'blockenberg'), value: a.cardPadding, min: 8, max: 48, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                        el(SelectControl, { label: __('Shadow', 'blockenberg'), value: a.cardShadow, options: SHADOW_OPTIONS, onChange: function (v) { setAttributes({ cardShadow: v }); } }),
                        el(ToggleControl, { label: __('Show border', 'blockenberg'), checked: a.showBorder, onChange: function (v) { setAttributes({ showBorder: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl()({ label: __('Label', 'blockenberg'), value: a.labelTypo, onChange: function (v) { setAttributes({ labelTypo: v }); } }),
                        getTypoControl()({ label: __('Description', 'blockenberg'), value: a.descTypo, onChange: function (v) { setAttributes({ descTypo: v }); } }),
                        el(RangeControl, { label: __('Category label size (px)', 'blockenberg'), value: a.categoryLabelSize, min: 9, max: 16, onChange: function (v) { setAttributes({ categoryLabelSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',    __('Accent / proficiency', 'blockenberg'), 'accentColor'),
                        cc('cardBg',         __('Card background',     'blockenberg'), 'cardBg'),
                        cc('labelColor',     __('Label text',          'blockenberg'), 'labelColor'),
                        cc('descColor',      __('Description',         'blockenberg'), 'descColor'),
                        cc('catColor',       __('Category label',      'blockenberg'), 'categoryLabelColor'),
                        cc('cardBorder',     __('Card border',         'blockenberg'), 'cardBorderColor'),
                        cc('bgColor',        __('Section background',  'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Categories & Tools', 'blockenberg'), initialOpen: false },
                        a.categories.map(function (cat) {
                            return el(PanelBody, { key: cat.id, title: cat.label || __('Category', 'blockenberg'), initialOpen: false },
                                el(TextControl, { label: __('Category name', 'blockenberg'), value: cat.label, onChange: function (v) { setCat(cat.id, { label: v }); } }),
                                (cat.items || []).map(function (item) {
                                    return el('div', { key: item.id, style: { background: '#f9fafb', borderRadius: '8px', padding: '10px', marginBottom: '8px' } },
                                        el(MediaUploadCheck, null,
                                            el(MediaUpload, {
                                                onSelect: function (media) { setCat(cat.id, { items: (a.categories.find(function (c) { return c.id === cat.id; }).items || []).map(function (it) { return it.id !== item.id ? it : Object.assign({}, it, { imageUrl: media.url, imageId: media.id }); }) }); },
                                                allowedTypes: ['image'], value: item.imageId,
                                                render: function (p) {
                                                    return el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' } },
                                                        item.imageUrl && el('img', { src: item.imageUrl, style: { width: '36px', height: '36px', objectFit: 'contain' } }),
                                                        el(Button, { onClick: p.open, variant: item.imageUrl ? 'secondary' : 'primary', size: 'compact' }, item.imageUrl ? __('Replace logo', 'blockenberg') : __('Upload logo', 'blockenberg'))
                                                    );
                                                }
                                            })
                                        ),
                                        el(TextControl, { label: __('Name', 'blockenberg'), value: item.name, onChange: function (v) { updateItem(cat.id, item.id, 'name', v); } }),
                                        a.showDescription && el(TextControl, { label: __('Short description', 'blockenberg'), value: item.description, onChange: function (v) { updateItem(cat.id, item.id, 'description', v); } }),
                                        a.showProficiency && el(RangeControl, { label: __('Proficiency (1-5)', 'blockenberg'), value: item.proficiency, min: 1, max: 5, onChange: function (v) { updateItem(cat.id, item.id, 'proficiency', v); } }),
                                        el(TextControl, { label: __('Link URL (optional)', 'blockenberg'), value: item.url, onChange: function (v) { updateItem(cat.id, item.id, 'url', v); } }),
                                        (cat.items || []).length > 1 && el(Button, { onClick: function () { removeItem(cat.id, item.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove tool', 'blockenberg'))
                                    );
                                }),
                                el(Button, { onClick: function () { addItem(cat.id); }, variant: 'secondary', size: 'compact', style: { marginBottom: '8px' } }, __('+ Add Tool', 'blockenberg')),
                                a.categories.length > 1 && el(Button, { onClick: function () { removeCat(cat.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove category', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addCat, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Category', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-ts bkbg-ts--' + a.displayStyle, style: { display: 'flex', flexDirection: 'column', gap: a.categoryGap + 'px' } },
                        a.categories.map(function (cat) {
                            return el('div', { key: cat.id, className: 'bkbg-ts-cat' },
                                a.showCategories && el('p', { style: { fontSize: 'var(--bkbg-ts-cat-size)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--bkbg-ts-cat-color)', margin: '0 0 16px' } }, cat.label),
                                el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                                    (cat.items || []).map(function (item) {
                                        return el(TechItem, { key: item.id, item: item, a: a });
                                    })
                                )
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, buildWrapStyle(a));
                if (_tvf) {
                    Object.assign(s, _tvf(a.labelTypo, '--bktst-lb-'));
                    Object.assign(s, _tvf(a.descTypo, '--bktst-ds-'));
                }
                return { className: 'bkbg-ts-wrapper bkbg-ts--' + a.displayStyle, style: s };
            })()),
                el('div', { className: 'bkbg-ts', style: { display: 'flex', flexDirection: 'column', gap: a.categoryGap + 'px' } },
                    a.categories.map(function (cat) {
                        return el('div', { key: cat.id, className: 'bkbg-ts-cat' },
                            a.showCategories && el('p', { className: 'bkbg-ts-cat-label', style: { fontSize: 'var(--bkbg-ts-cat-size)', color: 'var(--bkbg-ts-cat-color)' } }, cat.label),
                            el('div', { className: 'bkbg-ts-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                                (cat.items || []).map(function (item) {
                                    var isInline = a.displayStyle === 'inline';
                                    var isCards = a.displayStyle === 'cards';
                                    var tagName = item.url ? 'a' : 'div';
                                    var linkProps = item.url ? { href: item.url, target: item.linkTarget ? '_blank' : undefined, rel: item.linkTarget ? 'noopener noreferrer' : undefined } : {};
                                    return el(tagName, Object.assign({ key: item.id, className: 'bkbg-ts-item bkbg-ts-hover-' + a.hoverEffect + (a.animate ? ' bkbg-ts-anim' : '') }, linkProps),
                                        item.imageUrl && el('img', { src: item.imageUrl, alt: item.name || '', loading: 'lazy', style: { width: 'var(--bkbg-ts-icon-size)', height: 'var(--bkbg-ts-icon-size)', objectFit: 'contain', filter: a.grayscale ? 'grayscale(100%)' : 'none' } }),
                                        el('div', { className: 'bkbg-ts-label-wrap' },
                                            a.showLabel && el('span', { className: 'bkbg-ts-label', style: { color: 'var(--bkbg-ts-label-color)' } }, item.name),
                                            a.showDescription && item.description && el('span', { className: 'bkbg-ts-desc', style: { color: 'var(--bkbg-ts-desc-color)' } }, item.description),
                                            a.showProficiency && item.proficiency && (function () {
                                                if (a.proficiencyStyle === 'dots') {
                                                    return el('div', { className: 'bkbg-ts-prof-dots' },
                                                        [1,2,3,4,5].map(function (n) { return el('div', { key: n, style: { background: n <= item.proficiency ? a.accentColor : '#e5e7eb' } }); })
                                                    );
                                                }
                                                if (a.proficiencyStyle === 'bar') {
                                                    return el('div', { className: 'bkbg-ts-prof-bar' },
                                                        el('div', { style: { width: ((item.proficiency / 5) * 100) + '%', background: a.accentColor } })
                                                    );
                                                }
                                                return el('span', { className: 'bkbg-ts-prof-label', style: { color: a.accentColor, background: a.accentColor + '18' } }, PROF_LABELS[item.proficiency - 1] || '');
                                            })()
                                        )
                                    );
                                })
                            )
                        );
                    })
                )
            );
        }
    });
}() );
