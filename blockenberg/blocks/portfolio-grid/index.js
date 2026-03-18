( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var RichText = wp.blockEditor.RichText;
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

    var HOVER_OPTIONS = [
        { label: __('Overlay',  'blockenberg'), value: 'overlay' },
        { label: __('Slide up', 'blockenberg'), value: 'slide-up' },
        { label: __('Lift',     'blockenberg'), value: 'lift' },
    ];
    var RATIO_OPTIONS = [
        { label: '3:2',  value: '3/2' },
        { label: '4:3',  value: '4/3' },
        { label: '1:1',  value: '1/1' },
        { label: '16:9', value: '16/9' },
    ];
    var SHADOW_OPTIONS = [
        { label: __('None',   'blockenberg'), value: 'none' },
        { label: __('Small',  'blockenberg'), value: 'sm' },
        { label: __('Medium', 'blockenberg'), value: 'md' },
        { label: __('Large',  'blockenberg'), value: 'lg' },
    ];
    var FILTER_OPTIONS = [
        { label: __('Pills', 'blockenberg'), value: 'pills' },
        { label: __('Tabs',  'blockenberg'), value: 'tabs' },
    ];

    function makeId() { return 'pw' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        var shadow = a.cardShadow === 'sm' ? '0 1px 4px rgba(0,0,0,0.08)' :
                     a.cardShadow === 'md' ? '0 4px 16px rgba(0,0,0,0.1)' :
                     a.cardShadow === 'lg' ? '0 8px 32px rgba(0,0,0,0.14)' : 'none';
        var s = {
            '--bkbg-pg-cols':         a.columns,
            '--bkbg-pg-gap':          a.gap + 'px',
            '--bkbg-pg-radius':       a.borderRadius + 'px',
            '--bkbg-pg-shadow':       shadow,
            '--bkbg-pg-card-bg':      a.cardBg,
            '--bkbg-pg-title-color':  a.titleColor,
            '--bkbg-pg-desc-color':   a.descColor,
            '--bkbg-pg-tag-bg':       a.tagBg,
            '--bkbg-pg-tag-color':    a.tagColor,
            '--bkbg-pg-tag-size':     a.tagSize + 'px',
            '--bkbg-pg-accent':       a.accentColor,
            '--bkbg-pg-overlay-bg':   a.overlayCoverBg,
            '--bkbg-pg-overlay-text': a.overlayTextColor,
            paddingTop:   a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined
        };
        if (a.titleSize !== undefined) s['--bkbg-pg-title-size'] = a.titleSize + 'px';
        if (a.descSize !== undefined) s['--bkbg-pg-desc-size'] = a.descSize + 'px';
        return s;
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

    /* ── Get unique categories from items ─────────────────────────────────── */
    function getCategories(items) {
        var seen = {};
        var cats = [];
        (items || []).forEach(function (item) {
            var c = (item.category || '').trim();
            if (c && !seen[c]) { seen[c] = true; cats.push(c); }
        });
        return cats;
    }

    /* ── Single project card preview ──────────────────────────────────────── */
    function ProjectCard(props) {
        var item = props.item;
        var a = props.a;
        var techTags = (item.techTags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
        var aspectParts = a.imageRatio.split('/');
        var aspectPadding = ((parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10)) * 100) + '%';

        return el('div', { className: 'bkbg-pg-card bkbg-pg-hover-' + a.hoverStyle + (a.animate ? ' bkbg-pg-anim' : ''), style: { background: 'var(--bkbg-pg-card-bg)', borderRadius: 'var(--bkbg-pg-radius)', overflow: 'hidden', boxShadow: 'var(--bkbg-pg-shadow)', display: 'flex', flexDirection: 'column' } },
            /* image */
            el('div', { className: 'bkbg-pg-img-wrap', style: { position: 'relative', paddingBottom: aspectPadding, background: '#e5e7eb', overflow: 'hidden', flexShrink: 0 } },
                item.imageUrl && el('img', { src: item.imageUrl, alt: item.title || '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }),
                !item.imageUrl && el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' } }, __('No image', 'blockenberg')),
                /* overlay */
                el('div', { className: 'bkbg-pg-overlay', style: { position: 'absolute', inset: 0, background: 'var(--bkbg-pg-overlay-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s ease', padding: '20px' } },
                    a.showCta && el('span', { style: { color: 'var(--bkbg-pg-overlay-text)', fontWeight: 600, fontSize: a.ctaSize + 'px', border: '2px solid var(--bkbg-pg-overlay-text)', borderRadius: '8px', padding: '8px 20px' } }, item.linkLabel || __('View project', 'blockenberg'))
                ),
                item.category && el('span', { style: { position: 'absolute', top: '12px', left: '12px', background: 'var(--bkbg-pg-accent)', color: '#fff', fontSize: '11px', fontWeight: 700, borderRadius: '99px', padding: '3px 10px', letterSpacing: '0.04em' } }, item.category)
            ),
            /* body */
            el('div', { className: 'bkbg-pg-body', style: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' } },
                el(RichText, { tagName: 'h3', className: 'bkbg-pg-title', value: item.title, placeholder: __('Project title…', 'blockenberg'), onChange: function (v) { props.onUpdate('title', v); }, style: { color: 'var(--bkbg-pg-title-color)', margin: 0 } }),
                a.showDescription && el(RichText, { tagName: 'p', className: 'bkbg-pg-desc', value: item.description, placeholder: __('Project description…', 'blockenberg'), onChange: function (v) { props.onUpdate('description', v); }, style: { color: 'var(--bkbg-pg-desc-color)', margin: 0 } }),
                a.showTechTags && techTags.length > 0 && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' } },
                    techTags.map(function (tag, i) {
                        return el('span', { key: i, style: { background: 'var(--bkbg-pg-tag-bg)', color: 'var(--bkbg-pg-tag-color)', fontSize: 'var(--bkbg-pg-tag-size)', borderRadius: '4px', padding: '2px 8px', fontWeight: 500 } }, tag);
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/portfolio-grid', {
        title: __('Portfolio Grid', 'blockenberg'),
        icon: 'portfolio',
        category: 'bkbg-business',
        description: __('Project cards with filter, hover overlay, and tech tags.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var selectedItemState = useState(0);
            var selectedItem = selectedItemState[0];
            var setSelectedItem = selectedItemState[1];

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = buildWrapStyle(a);
                Object.assign(s, _tv(a.titleTypo, '--bkbg-pg-tt-'));
                Object.assign(s, _tv(a.descTypo, '--bkbg-pg-ds-'));
                return { style: s };
            })());

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateItem(idx, key, val) {
                var items = a.items.map(function (it, i) {
                    if (i !== idx) return it;
                    var updated = Object.assign({}, it); updated[key] = val; return updated;
                });
                setAttributes({ items: items });
            }

            function addItem() {
                setAttributes({ items: a.items.concat([{ id: makeId(), imageUrl: '', imageId: 0, title: 'New Project', category: 'Design', description: 'Project description goes here.', techTags: 'Tool A, Tool B', linkUrl: '#', linkLabel: 'View project', linkTarget: false, featured: false }]) });
            }

            function removeItem(idx) {
                if (a.items.length <= 1) return;
                setAttributes({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            var cats = getCategories(a.items);

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Grid', 'blockenberg'), initialOpen: true },
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 4, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 60, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(SelectControl, { label: __('Image ratio', 'blockenberg'), value: a.imageRatio, options: RATIO_OPTIONS, onChange: function (v) { setAttributes({ imageRatio: v }); } }),
                        el(RangeControl, { label: __('Border radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                        el(SelectControl, { label: __('Card shadow', 'blockenberg'), value: a.cardShadow, options: SHADOW_OPTIONS, onChange: function (v) { setAttributes({ cardShadow: v }); } }),
                        el(SelectControl, { label: __('Hover style', 'blockenberg'), value: a.hoverStyle, options: HOVER_OPTIONS, onChange: function (v) { setAttributes({ hoverStyle: v }); } }),
                        el(ToggleControl, { label: __('Animate on scroll', 'blockenberg'), checked: a.animate, onChange: function (v) { setAttributes({ animate: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Filter Bar', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show filter bar', 'blockenberg'), checked: a.filterEnabled, onChange: function (v) { setAttributes({ filterEnabled: v }); }, __nextHasNoMarginBottom: true }),
                        a.filterEnabled && el(Fragment, null,
                            el(SelectControl, { label: __('Filter style', 'blockenberg'), value: a.filterStyle, options: FILTER_OPTIONS, onChange: function (v) { setAttributes({ filterStyle: v }); } }),
                            el(TextControl, { label: __('"All" label', 'blockenberg'), value: a.showAllLabel, onChange: function (v) { setAttributes({ showAllLabel: v }); } })
                        )
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show description', 'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttributes({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show tech tags', 'blockenberg'), checked: a.showTechTags, onChange: function (v) { setAttributes({ showTechTags: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show CTA link', 'blockenberg'), checked: a.showCta, onChange: function (v) { setAttributes({ showCta: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function () {
                            var TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading\u2026');
                            return el(Fragment, null,
                                el(TC, { label: 'Title Typography', value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                                el(TC, { label: 'Description Typography', value: a.descTypo, onChange: function (v) { setAttributes({ descTypo: v }); } })
                            );
                        })(),
                        el(RangeControl, { label: __('Tag size (px)', 'blockenberg'), value: a.tagSize, min: 9, max: 16, onChange: function (v) { setAttributes({ tagSize: v }); } }),
                        el(RangeControl, { label: __('CTA size (px)', 'blockenberg'), value: a.ctaSize, min: 11, max: 20, onChange: function (v) { setAttributes({ ctaSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accent',       __('Accent / filter active', 'blockenberg'),   'accentColor'),
                        cc('titleColor',   __('Title',                  'blockenberg'),   'titleColor'),
                        cc('descColor',    __('Description',            'blockenberg'),   'descColor'),
                        cc('cardBg',       __('Card background',        'blockenberg'),   'cardBg'),
                        cc('tagBg',        __('Tag background',         'blockenberg'),   'tagBg'),
                        cc('tagColor',     __('Tag text',               'blockenberg'),   'tagColor'),
                        cc('overlayBg',    __('Hover overlay bg',       'blockenberg'),   'overlayCoverBg'),
                        cc('overlayText',  __('Overlay text',           'blockenberg'),   'overlayTextColor'),
                        cc('bgColor',      __('Section background',     'blockenberg'),   'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Projects', 'blockenberg'), initialOpen: false },
                        a.items.map(function (item, idx) {
                            return el(PanelBody, { key: item.id || idx, title: item.title || (__('Project', 'blockenberg') + ' ' + (idx + 1)), initialOpen: selectedItem === idx },
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setAttributes({ items: a.items.map(function (it, i) { return i !== idx ? it : Object.assign({}, it, { imageUrl: media.url, imageId: media.id }); }) }); },
                                        allowedTypes: ['image'],
                                        value: item.imageId,
                                        render: function (p) {
                                            return el('div', { style: { marginBottom: '12px' } },
                                                item.imageUrl && el('img', { src: item.imageUrl, style: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' } }),
                                                el(Button, { onClick: p.open, variant: item.imageUrl ? 'secondary' : 'primary', size: 'compact' }, item.imageUrl ? __('Replace image', 'blockenberg') : __('Select image', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                el(TextControl, { label: __('Title', 'blockenberg'), value: item.title, onChange: function (v) { updateItem(idx, 'title', v); } }),
                                el(TextControl, { label: __('Category', 'blockenberg'), value: item.category, onChange: function (v) { updateItem(idx, 'category', v); } }),
                                el(TextControl, { label: __('Description', 'blockenberg'), value: item.description, onChange: function (v) { updateItem(idx, 'description', v); } }),
                                el(TextControl, { label: __('Tech tags (comma-separated)', 'blockenberg'), value: item.techTags, onChange: function (v) { updateItem(idx, 'techTags', v); } }),
                                el(TextControl, { label: __('Link URL', 'blockenberg'), value: item.linkUrl, onChange: function (v) { updateItem(idx, 'linkUrl', v); } }),
                                el(TextControl, { label: __('Link label', 'blockenberg'), value: item.linkLabel, onChange: function (v) { updateItem(idx, 'linkLabel', v); } }),
                                el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: item.linkTarget, onChange: function (v) { updateItem(idx, 'linkTarget', v); }, __nextHasNoMarginBottom: true }),
                                a.items.length > 1 && el(Button, { onClick: function () { removeItem(idx); }, variant: 'tertiary', isDestructive: true, size: 'compact', style: { marginTop: '8px' } }, __('Remove project', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addItem, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Project', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    /* filter bar preview */
                    a.filterEnabled && cats.length > 0 && el('div', { className: 'bkbg-pg-filters bkbg-pg-filter-' + a.filterStyle, style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' } },
                        el('button', { className: 'bkbg-pg-filter-btn bkbg-pg-filter-active', style: { padding: '7px 18px', borderRadius: '99px', border: 'none', background: a.accentColor, color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' } }, a.showAllLabel),
                        cats.map(function (cat) {
                            return el('button', { key: cat, className: 'bkbg-pg-filter-btn', style: { padding: '7px 18px', borderRadius: '99px', border: '2px solid #e5e7eb', background: 'transparent', fontWeight: 500, fontSize: '14px', cursor: 'pointer', color: a.titleColor } }, cat);
                        })
                    ),
                    /* grid */
                    el('div', { className: 'bkbg-pg-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                        a.items.map(function (item, idx) {
                            return el(ProjectCard, { key: item.id || idx, item: item, a: a, onUpdate: function (key, val) { updateItem(idx, key, val); } });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var cats = getCategories(a.items);

            return el('div', wp.blockEditor.useBlockProps.save((function () {
                var _tv = window.bkbgTypoCssVars;
                var s = buildWrapStyle(a);
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo, '--bkbg-pg-tt-'));
                    Object.assign(s, _tv(a.descTypo, '--bkbg-pg-ds-'));
                }
                return {
                    className: 'bkbg-pg-wrapper bkbg-pg-hover-' + a.hoverStyle + (a.filterEnabled ? ' bkbg-pg-filterable' : ''),
                    style: s
                };
            })()),
                a.filterEnabled && cats.length > 0 && el('div', { className: 'bkbg-pg-filters bkbg-pg-filter-' + a.filterStyle },
                    el('button', { className: 'bkbg-pg-filter-btn bkbg-pg-filter-active', 'data-filter': 'all' }, a.showAllLabel),
                    cats.map(function (cat) {
                        return el('button', { key: cat, className: 'bkbg-pg-filter-btn', 'data-filter': cat }, cat);
                    })
                ),
                el('div', { className: 'bkbg-pg-grid' },
                    a.items.map(function (item, idx) {
                        var techTags = (item.techTags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
                        var aspectParts = a.imageRatio.split('/');
                        var aspectPadding = ((parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10)) * 100) + '%';
                        return el('div', { key: item.id || idx, className: 'bkbg-pg-card' + (a.animate ? ' bkbg-pg-anim' : ''), 'data-category': item.category || '' },
                            el('div', { className: 'bkbg-pg-img-wrap', style: { position: 'relative', paddingBottom: aspectPadding } },
                                item.imageUrl && el('img', { src: item.imageUrl, alt: item.title || '', loading: 'lazy' }),
                                el('div', { className: 'bkbg-pg-overlay' },
                                    a.showCta && el('a', { className: 'bkbg-pg-cta', href: item.linkUrl || '#', target: item.linkTarget ? '_blank' : undefined, rel: item.linkTarget ? 'noopener noreferrer' : undefined }, item.linkLabel || __('View project', 'blockenberg'))
                                ),
                                item.category && el('span', { className: 'bkbg-pg-cat-badge' }, item.category)
                            ),
                            el('div', { className: 'bkbg-pg-body' },
                                el(RichText.Content, { tagName: 'h3', className: 'bkbg-pg-title', value: item.title }),
                                a.showDescription && el(RichText.Content, { tagName: 'p', className: 'bkbg-pg-desc', value: item.description }),
                                a.showTechTags && techTags.length > 0 && el('div', { className: 'bkbg-pg-tags' },
                                    techTags.map(function (tag, i) { return el('span', { key: i, className: 'bkbg-pg-tag' }, tag); })
                                )
                            )
                        );
                    })
                )
            );
        },

        deprecated: [{
            attributes: {
                "items": { "type": "array", "default": [{"id":"pg1","imageUrl":"","imageId":0,"title":"Brand Identity Design","category":"Design","description":"A complete visual identity system for a tech startup \u2014 logo, typography, color, and motion.","techTags":"Figma, Illustrator","linkUrl":"#","linkLabel":"View project","linkTarget":false,"featured":false},{"id":"pg2","imageUrl":"","imageId":0,"title":"E-commerce Platform","category":"Development","description":"Full-stack storefront with real-time inventory and Stripe checkout integration.","techTags":"React, Node.js, Stripe","linkUrl":"#","linkLabel":"View project","linkTarget":false,"featured":false},{"id":"pg3","imageUrl":"","imageId":0,"title":"Mobile Banking App","category":"Design","description":"UX/UI design for a neobank: onboarding flows, transaction history and dark mode.","techTags":"Figma, Principle","linkUrl":"#","linkLabel":"View project","linkTarget":false,"featured":true},{"id":"pg4","imageUrl":"","imageId":0,"title":"SaaS Dashboard","category":"Development","description":"Analytics dashboard with real-time charts, role-based access and CSV export.","techTags":"Vue, D3.js, Laravel","linkUrl":"#","linkLabel":"View project","linkTarget":false,"featured":false}], "items": { "type": "object" } },
                "columns": { "type": "number", "default": 2 },
                "columnsTablet": { "type": "number", "default": 2 },
                "gap": { "type": "number", "default": 24 },
                "filterEnabled": { "type": "boolean", "default": true },
                "filterStyle": { "type": "string", "default": "pills" },
                "showAllLabel": { "type": "string", "default": "All" },
                "showDescription": { "type": "boolean", "default": true },
                "showTechTags": { "type": "boolean", "default": true },
                "showCta": { "type": "boolean", "default": true },
                "hoverStyle": { "type": "string", "default": "overlay" },
                "imageRatio": { "type": "string", "default": "3/2" },
                "borderRadius": { "type": "number", "default": 14 },
                "cardShadow": { "type": "string", "default": "md" },
                "titleSize": { "type": "number", "default": 20 },
                "descSize": { "type": "number", "default": 14 },
                "tagSize": { "type": "number", "default": 11 },
                "ctaSize": { "type": "number", "default": 14 },
                "accentColor": { "type": "string", "default": "#6c3fb5" },
                "titleColor": { "type": "string", "default": "#111827" },
                "descColor": { "type": "string", "default": "#6b7280" },
                "cardBg": { "type": "string", "default": "#ffffff" },
                "tagBg": { "type": "string", "default": "#f3f4f6" },
                "tagColor": { "type": "string", "default": "#374151" },
                "overlayCoverBg": { "type": "string", "default": "rgba(17,24,39,0.82)" },
                "overlayTextColor": { "type": "string", "default": "#ffffff" },
                "animate": { "type": "boolean", "default": true },
                "bgColor": { "type": "string", "default": "" },
                "paddingTop": { "type": "number", "default": 40 },
                "paddingBottom": { "type": "number", "default": 40 },
                "titleFontWeight": { "type": "string", "default": "700" },
                "descFontWeight": { "type": "string", "default": "400" }
            },
            save: function (props) {
                var a = props.attributes;
                var cats = getCategories(a.items);
                return el('div', wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-pg-wrapper bkbg-pg-hover-' + a.hoverStyle + (a.filterEnabled ? ' bkbg-pg-filterable' : ''),
                    style: buildWrapStyle(a)
                }),
                    a.filterEnabled && cats.length > 0 && el('div', { className: 'bkbg-pg-filters bkbg-pg-filter-' + a.filterStyle },
                        el('button', { className: 'bkbg-pg-filter-btn bkbg-pg-filter-active', 'data-filter': 'all' }, a.showAllLabel),
                        cats.map(function (cat) {
                            return el('button', { key: cat, className: 'bkbg-pg-filter-btn', 'data-filter': cat }, cat);
                        })
                    ),
                    el('div', { className: 'bkbg-pg-grid' },
                        a.items.map(function (item, idx) {
                            var techTags = (item.techTags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
                            var aspectParts = a.imageRatio.split('/');
                            var aspectPadding = ((parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10)) * 100) + '%';
                            return el('div', { key: item.id || idx, className: 'bkbg-pg-card' + (a.animate ? ' bkbg-pg-anim' : ''), 'data-category': item.category || '' },
                                el('div', { className: 'bkbg-pg-img-wrap', style: { position: 'relative', paddingBottom: aspectPadding } },
                                    item.imageUrl && el('img', { src: item.imageUrl, alt: item.title || '', loading: 'lazy' }),
                                    el('div', { className: 'bkbg-pg-overlay' },
                                        a.showCta && el('a', { className: 'bkbg-pg-cta', href: item.linkUrl || '#', target: item.linkTarget ? '_blank' : undefined, rel: item.linkTarget ? 'noopener noreferrer' : undefined }, item.linkLabel || __('View project', 'blockenberg'))
                                    ),
                                    item.category && el('span', { className: 'bkbg-pg-cat-badge' }, item.category)
                                ),
                                el('div', { className: 'bkbg-pg-body' },
                                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-pg-title', value: item.title }),
                                    a.showDescription && el(RichText.Content, { tagName: 'p', className: 'bkbg-pg-desc', value: item.description }),
                                    a.showTechTags && techTags.length > 0 && el('div', { className: 'bkbg-pg-tags' },
                                        techTags.map(function (tag, i) { return el('span', { key: i, className: 'bkbg-pg-tag' }, tag); })
                                    )
                                )
                            );
                        })
                    )
                );
            }
        }]
    });
}() );
