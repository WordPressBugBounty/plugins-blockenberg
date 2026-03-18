( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var _fscTC, _fscTV;
    function _tc() { return (_fscTC = _fscTC || window.bkbgTypographyControl); }
    function _tv() { return (_fscTV = _fscTV || window.bkbgTypoCssVars); }
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
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var TAG_OPTIONS = [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' },
    ];
    var POSITION_OPTIONS = [
        { label: __('Image right', 'blockenberg'), value: 'right' },
        { label: __('Image left',  'blockenberg'), value: 'left' },
    ];
    var RATIO_OPTIONS = [
        { label: '4:3',  value: '4/3' }, { label: '3:2',  value: '3/2' },
        { label: '1:1',  value: '1/1' }, { label: '16:9', value: '16/9' },
    ];
    var BULLET_OPTIONS = [
        { label: __('Checkmark', 'blockenberg'), value: 'check' },
        { label: __('Arrow',     'blockenberg'), value: 'arrow' },
        { label: __('Dot',       'blockenberg'), value: 'dot' },
    ];
    var CTA_STYLE_OPTIONS = [
        { label: __('Filled',  'blockenberg'), value: 'filled' },
        { label: __('Outline', 'blockenberg'), value: 'outline' },
        { label: __('Link',    'blockenberg'), value: 'link' },
    ];

    function makeId() { return 'fs' + Math.random().toString(36).substr(2, 6); }
    function makeBId() { return 'fb' + Math.random().toString(36).substr(2, 6); }

    function bulletChar(icon) {
        if (icon === 'arrow') return '→';
        if (icon === 'dot')   return '•';
        return '✓';
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

    /* ── Single row preview ───────────────────────────────────────────────── */
    function ShowcaseRow(props) {
        var row = props.row;
        var a = props.a;
        var isLeft = row.imagePosition === 'left';
        var aspectParts = a.imageRatio.split('/');
        var aspectPadding = ((parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10)) * 100) + '%';

        var imageSide = el('div', { className: 'bkbg-fsc-img-col', style: { flex: (100 - a.imageWidth) + ' 0 0', maxWidth: (100 - a.imageWidth) + '%' } },
            el('div', { style: { position: 'relative', paddingBottom: aspectPadding, borderRadius: a.imageRadius + 'px', overflow: 'hidden', background: '#e5e7eb', boxShadow: a.imageShadow ? '0 20px 60px rgba(0,0,0,0.14)' : 'none' } },
                row.imageUrl && el('img', { src: row.imageUrl, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }),
                !row.imageUrl && el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#9ca3af' } },
                    el('span', { style: { fontSize: '32px' } }, '🖼️'),
                    el('span', { style: { fontSize: '12px' } }, __('Select image', 'blockenberg'))
                )
            )
        );

        var contentSide = el('div', { className: 'bkbg-fsc-text-col', style: { flex: a.imageWidth + ' 0 0', maxWidth: a.imageWidth + '%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' } },
            a.showBadge && row.badge && el('span', { className: 'bkbg-fsc-badge', style: { alignSelf: 'flex-start', background: a.badgeBg, color: a.badgeColor } }, row.badge),
            el(RichText, { tagName: a.headlineTag, className: 'bkbg-fsc-headline', value: row.headline, placeholder: __('Section headline…', 'blockenberg'), onChange: function (v) { props.onUpdateRow('headline', v); }, style: { color: a.headlineColor, margin: 0 } }),
            el('p', { className: 'bkbg-fsc-body', style: { color: a.bodyColor, margin: 0 } }, row.body || __('Section body text…', 'blockenberg')),
            a.showBullets && row.bullets && row.bullets.length > 0 && el('ul', { className: 'bkbg-fsc-bullets', style: { listStyle: 'none', padding: 0, margin: 0 } },
                row.bullets.map(function (b) {
                    return el('li', { key: b.id, className: 'bkbg-fsc-bullet', style: { color: a.bulletColor } },
                        el('span', { className: 'bkbg-fsc-bullet-icon', style: { color: a.bulletIconColor } }, bulletChar(a.bulletIcon)),
                        el('span', null, b.text)
                    );
                })
            ),
            row.ctaLabel && el('a', {
                href: '#',
                className: 'bkbg-fsc-cta',
                style: Object.assign({ alignSelf: 'flex-start', borderRadius: a.ctaRadius + 'px', pointerEvents: 'none', cursor: 'default' },
                    row.ctaStyle === 'filled'  ? { background: a.ctaBg, color: a.ctaColor } :
                    row.ctaStyle === 'outline' ? { border: '2px solid ' + a.ctaBg, color: a.ctaBg } :
                    { color: a.ctaBg, textDecoration: 'underline' }
                )
            }, row.ctaLabel)
        );

        return el('div', { className: 'bkbg-fsc-row bkbg-fsc-img-' + row.imagePosition, style: { display: 'flex', alignItems: 'center', gap: '5%', flexDirection: isLeft ? 'row' : 'row-reverse' } },
            imageSide, contentSide
        );
    }

    function buildWrapStyle(a) {
        return Object.assign(
            { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined },
            _tv()(a.typoHeadline, '--bkbg-fsc-hl-'),
            _tv()(a.typoBody, '--bkbg-fsc-bd-'),
            _tv()(a.typoBullet, '--bkbg-fsc-bl-'),
            _tv()(a.typoBadge, '--bkbg-fsc-bg-')
        );
    }

    registerBlockType('blockenberg/feature-showcase', {
        title: __('Feature Showcase', 'blockenberg'),
        icon: 'align-left',
        category: 'bkbg-marketing',
        description: __('Alternating zigzag image + text rows with bullets and CTA.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ className: 'bkbg-fsc-wrapper', style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateRow(rowId, key, val) {
                setAttributes({ rows: a.rows.map(function (r) { if (r.id !== rowId) return r; var u = Object.assign({}, r); u[key] = val; return u; }) });
            }
            function addBullet(rowId) {
                setAttributes({ rows: a.rows.map(function (r) { if (r.id !== rowId) return r; return Object.assign({}, r, { bullets: (r.bullets || []).concat([{ id: makeBId(), text: 'Bullet point' }]) }); }) });
            }
            function removeBullet(rowId, bId) {
                setAttributes({ rows: a.rows.map(function (r) { if (r.id !== rowId) return r; return Object.assign({}, r, { bullets: r.bullets.filter(function (b) { return b.id !== bId; }) }); }) });
            }
            function updateBullet(rowId, bId, text) {
                setAttributes({ rows: a.rows.map(function (r) { if (r.id !== rowId) return r; return Object.assign({}, r, { bullets: r.bullets.map(function (b) { return b.id === bId ? Object.assign({}, b, { text: text }) : b; }) }); }) });
            }
            function addRow() {
                var pos = a.rows.length % 2 === 0 ? 'right' : 'left';
                setAttributes({ rows: a.rows.concat([{ id: makeId(), imageUrl: '', imageId: 0, imagePosition: pos, badge: 'New Feature', headline: 'Another headline here', body: 'Describe this feature in one or two sentences.', bullets: [{ id: makeBId(), text: 'Benefit one' }, { id: makeBId(), text: 'Benefit two' }], ctaLabel: 'Learn more', ctaUrl: '#', ctaTarget: false, ctaStyle: 'filled' }]) });
            }
            function removeRow(rowId) {
                if (a.rows.length <= 1) return;
                setAttributes({ rows: a.rows.filter(function (r) { return r.id !== rowId; }) });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(RangeControl, { label: __('Row gap (px)', 'blockenberg'), value: a.gap, min: 32, max: 200, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(RangeControl, { label: __('Image width (%)', 'blockenberg'), value: a.imageWidth, min: 30, max: 70, onChange: function (v) { setAttributes({ imageWidth: v }); } }),
                        el(SelectControl, { label: __('Image ratio', 'blockenberg'), value: a.imageRatio, options: RATIO_OPTIONS, onChange: function (v) { setAttributes({ imageRatio: v }); } }),
                        el(RangeControl, { label: __('Image radius (px)', 'blockenberg'), value: a.imageRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ imageRadius: v }); } }),
                        el(ToggleControl, { label: __('Image shadow', 'blockenberg'), checked: a.imageShadow, onChange: function (v) { setAttributes({ imageShadow: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Headline tag', 'blockenberg'), value: a.headlineTag, options: TAG_OPTIONS, onChange: function (v) { setAttributes({ headlineTag: v }); } }),
                        el(ToggleControl, { label: __('Show badge', 'blockenberg'), checked: a.showBadge, onChange: function (v) { setAttributes({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show bullets', 'blockenberg'), checked: a.showBullets, onChange: function (v) { setAttributes({ showBullets: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBullets && el(SelectControl, { label: __('Bullet icon', 'blockenberg'), value: a.bulletIcon, options: BULLET_OPTIONS, onChange: function (v) { setAttributes({ bulletIcon: v }); } }),
                        el(RangeControl, { label: __('CTA border radius (px)', 'blockenberg'), value: a.ctaRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ ctaRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Headline', 'blockenberg'), value: a.typoHeadline, onChange: function (v) { setAttributes({ typoHeadline: v }); } }),
                        _tc() && el(_tc(), { label: __('Body', 'blockenberg'), value: a.typoBody, onChange: function (v) { setAttributes({ typoBody: v }); } }),
                        _tc() && el(_tc(), { label: __('Bullet / CTA', 'blockenberg'), value: a.typoBullet, onChange: function (v) { setAttributes({ typoBullet: v }); } }),
                        _tc() && el(_tc(), { label: __('Badge', 'blockenberg'), value: a.typoBadge, onChange: function (v) { setAttributes({ typoBadge: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('headlineColor',   __('Headline',      'blockenberg'), 'headlineColor'),
                        cc('bodyColor',       __('Body text',     'blockenberg'), 'bodyColor'),
                        cc('bulletColor',     __('Bullet text',   'blockenberg'), 'bulletColor'),
                        cc('bulletIconColor', __('Bullet icon',   'blockenberg'), 'bulletIconColor'),
                        cc('badgeColor',      __('Badge text',    'blockenberg'), 'badgeColor'),
                        cc('badgeBg',         __('Badge bg',      'blockenberg'), 'badgeBg'),
                        cc('ctaBg',           __('CTA fill',      'blockenberg'), 'ctaBg'),
                        cc('ctaColor',        __('CTA text',      'blockenberg'), 'ctaColor'),
                        cc('bgColor',         __('Section bg',    'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Rows', 'blockenberg'), initialOpen: false },
                        a.rows.map(function (row, ri) {
                            return el(PanelBody, { key: row.id, title: (ri + 1) + '. ' + (row.headline || __('Row', 'blockenberg')), initialOpen: false },
                                el(SelectControl, { label: __('Image position', 'blockenberg'), value: row.imagePosition, options: POSITION_OPTIONS, onChange: function (v) { updateRow(row.id, 'imagePosition', v); } }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setAttributes({ rows: a.rows.map(function (r) { return r.id !== row.id ? r : Object.assign({}, r, { imageUrl: media.url, imageId: media.id }); }) }); },
                                        allowedTypes: ['image'], value: row.imageId,
                                        render: function (p) {
                                            return el('div', { style: { marginBottom: '8px' } },
                                                row.imageUrl && el('img', { src: row.imageUrl, style: { width: '100%', height: '70px', objectFit: 'cover', borderRadius: '6px', marginBottom: '4px' } }),
                                                el(Button, { onClick: p.open, variant: row.imageUrl ? 'secondary' : 'primary', size: 'compact' }, row.imageUrl ? __('Replace', 'blockenberg') : __('Select image', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                el(TextControl, { label: __('Badge text', 'blockenberg'), value: row.badge, onChange: function (v) { updateRow(row.id, 'badge', v); } }),
                                el(TextControl, { label: __('Headline', 'blockenberg'), value: row.headline, onChange: function (v) { updateRow(row.id, 'headline', v); } }),
                                el(TextareaControl, { label: __('Body text', 'blockenberg'), value: row.body, onChange: function (v) { updateRow(row.id, 'body', v); } }),
                                el('p', { style: { fontWeight: 600, fontSize: '12px', margin: '8px 0 4px' } }, __('Bullets', 'blockenberg')),
                                (row.bullets || []).map(function (b) {
                                    return el('div', { key: b.id, style: { display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' } },
                                        el(TextControl, { value: b.text, onChange: function (v) { updateBullet(row.id, b.id, v); }, style: { flex: 1 } }),
                                        el(Button, { onClick: function () { removeBullet(row.id, b.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, '✕')
                                    );
                                }),
                                el(Button, { onClick: function () { addBullet(row.id); }, variant: 'secondary', size: 'compact', style: { marginBottom: '8px' } }, __('+ Add bullet', 'blockenberg')),
                                el(TextControl, { label: __('CTA label', 'blockenberg'), value: row.ctaLabel, onChange: function (v) { updateRow(row.id, 'ctaLabel', v); } }),
                                el(TextControl, { label: __('CTA URL', 'blockenberg'), value: row.ctaUrl, onChange: function (v) { updateRow(row.id, 'ctaUrl', v); } }),
                                el(SelectControl, { label: __('CTA style', 'blockenberg'), value: row.ctaStyle, options: CTA_STYLE_OPTIONS, onChange: function (v) { updateRow(row.id, 'ctaStyle', v); } }),
                                el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: row.ctaTarget, onChange: function (v) { updateRow(row.id, 'ctaTarget', v); }, __nextHasNoMarginBottom: true }),
                                a.rows.length > 1 && el(Button, { onClick: function () { removeRow(row.id); }, variant: 'tertiary', isDestructive: true, size: 'compact', style: { marginTop: '6px' } }, __('Remove row', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addRow, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Row', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-fsc-rows', style: { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' } },
                        a.rows.map(function (row) {
                            return el(ShowcaseRow, { key: row.id, row: row, a: a, onUpdateRow: function (key, val) { updateRow(row.id, key, val); } });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-fsc-wrapper',
                style: buildWrapStyle(a)
            }),
                el('div', { className: 'bkbg-fsc-rows', style: { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' } },
                    a.rows.map(function (row) {
                        var isLeft = row.imagePosition === 'left';
                        var imgW = (100 - a.imageWidth) + '%';
                        var txtW = a.imageWidth + '%';
                        var aspectParts = a.imageRatio.split('/');
                        var aspectPadding = ((parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10)) * 100) + '%';
                        var ctaStyle = {};
                        if (row.ctaStyle === 'filled')  { ctaStyle = { background: a.ctaBg, color: a.ctaColor }; }
                        if (row.ctaStyle === 'outline') { ctaStyle = { border: '2px solid ' + a.ctaBg, color: a.ctaBg }; }
                        if (row.ctaStyle === 'link')    { ctaStyle = { color: a.ctaBg, textDecoration: 'underline' }; }
                        return el('div', { key: row.id, className: 'bkbg-fsc-row bkbg-fsc-img-' + row.imagePosition },
                            el('div', { className: 'bkbg-fsc-img-col', style: { flex: '0 0 ' + imgW, maxWidth: imgW } },
                                el('div', { className: 'bkbg-fsc-img-wrap', style: { position: 'relative', paddingBottom: aspectPadding, borderRadius: a.imageRadius + 'px', overflow: 'hidden', boxShadow: a.imageShadow ? '0 20px 60px rgba(0,0,0,0.14)' : 'none' } },
                                    row.imageUrl && el('img', { src: row.imageUrl, alt: '', loading: 'lazy', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                                )
                            ),
                            el('div', { className: 'bkbg-fsc-text-col', style: { flex: '0 0 ' + txtW, maxWidth: txtW } },
                                a.showBadge && row.badge && el('span', { className: 'bkbg-fsc-badge', style: { background: a.badgeBg, color: a.badgeColor } }, row.badge),
                                el(RichText.Content, { tagName: a.headlineTag, className: 'bkbg-fsc-headline', value: row.headline, style: { color: a.headlineColor } }),
                                el('p', { className: 'bkbg-fsc-body', style: { color: a.bodyColor } }, row.body),
                                a.showBullets && row.bullets && row.bullets.length > 0 && el('ul', { className: 'bkbg-fsc-bullets' },
                                    row.bullets.map(function (b) {
                                        return el('li', { key: b.id, className: 'bkbg-fsc-bullet' },
                                            el('span', { className: 'bkbg-fsc-bullet-icon', style: { color: a.bulletIconColor } }, bulletChar(a.bulletIcon)),
                                            el('span', { style: { color: a.bulletColor } }, b.text)
                                        );
                                    })
                                ),
                                row.ctaLabel && el('a', { className: 'bkbg-fsc-cta bkbg-fsc-cta-' + row.ctaStyle, href: row.ctaUrl || '#', target: row.ctaTarget ? '_blank' : undefined, rel: row.ctaTarget ? 'noopener noreferrer' : undefined, style: Object.assign({ borderRadius: a.ctaRadius + 'px' }, ctaStyle) }, row.ctaLabel)
                            )
                        );
                    })
                )
            );
        }
    });
}() );
