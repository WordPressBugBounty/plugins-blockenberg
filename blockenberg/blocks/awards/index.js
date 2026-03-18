( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;
    var IP = function () { return window.bkbgIconPicker; };

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    function makeId() { return 'aw' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        var _tv = getTypoCssVars();
        var s = {
            '--bkbg-aw-accent':       a.accentColor,
            '--bkbg-aw-card-bg':      a.cardBg,
            '--bkbg-aw-card-border':  a.cardBorder,
            '--bkbg-aw-title-color':  a.titleColor,
            '--bkbg-aw-sect-title':   a.sectionTitleColor,
            '--bkbg-aw-sub-color':    a.subtitleColor,
            '--bkbg-aw-award-title':  a.awardTitleColor,
            '--bkbg-aw-issuer':       a.issuerColor,
            '--bkbg-aw-year':         a.yearColor,
            '--bkbg-aw-desc':         a.descColor,
            '--bkbg-aw-card-r':       a.cardRadius  + 'px',
            '--bkbg-aw-icon-r':       a.iconBgRadius + 'px',
            '--bkbg-aw-gap':          a.gap          + 'px',
            '--bkbg-aw-cols':         a.columns,
            '--bkbg-aw-title-sz':     a.titleSize      + 'px',
            '--bkbg-aw-award-sz':     a.awardTitleSize + 'px',
            '--bkbg-aw-issuer-sz':    a.issuerSize     + 'px',
            '--bkbg-aw-desc-sz':      a.descSize       + 'px',
            '--bkbg-aw-icon-sz':      a.iconSize        + 'px',
            paddingTop:    a.paddingTop    + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        Object.assign(s, _tv(a.sectionTitleTypo || {}, '--bkbg-aw-stitle-'));
        Object.assign(s, _tv(a.subtitleTypo     || {}, '--bkbg-aw-sub-'));
        Object.assign(s, _tv(a.awardTitleTypo   || {}, '--bkbg-aw-atitle-'));
        Object.assign(s, _tv(a.issuerTypo       || {}, '--bkbg-aw-iss-'));
        Object.assign(s, _tv(a.descTypo         || {}, '--bkbg-aw-dsc-'));
        return s;
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

    /* ── Single award card ────────────────────────────────────────── */
    function AwardCard(props) {
        var award = props.award;
        var a     = props.a;
        var iconBgColor = award.color || a.accentColor;

        /* Luminance-based contrast for icon bg text */
        function hexLuma(hex) {
            var c = hex.replace('#','');
            if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
            var r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
            return 0.299*r + 0.587*g + 0.114*b;
        }
        var iconTextColor = hexLuma(iconBgColor) > 140 ? '#333' : '#fff';

        return el('div', { className: 'bkbg-aw-card', style: {
            background: a.cardBg,
            border: '1.5px solid ' + a.cardBorder,
            borderRadius: a.cardRadius + 'px',
            padding: '28px 22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            transition: 'box-shadow 0.2s, transform 0.2s',
        }},
            /* Icon / image */
            el('div', { style: {
                width: a.iconSize + 'px', height: a.iconSize + 'px',
                borderRadius: a.iconBgRadius + 'px',
                background: iconBgColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: Math.round(a.iconSize * 0.52) + 'px',
                overflow: 'hidden', color: iconTextColor,
            }},
                award.imageUrl
                    ? el('img', { src: award.imageUrl, alt: award.title, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                    : (award.iconType || 'custom-char') !== 'custom-char'
                        ? IP().buildEditorIcon(award.iconType, award.icon, award.iconDashicon, award.iconImageUrl, award.iconDashiconColor)
                        : el('span', null, award.icon || '🏆')
            ),

            /* Content */
            el('div', { style: { flex: 1, minWidth: 0, width: '100%' } },
                el('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' } },
                    el('p', { className: 'bkbg-aw-award-title', style: { margin: 0, color: a.awardTitleColor, flex: 1, minWidth: 0 } }, award.title),
                    a.showYear && award.year && el('span', { className: 'bkbg-aw-year', style: { color: a.yearColor, background: a.yearColor + '18', padding: '2px 8px', borderRadius: '99px', flexShrink: 0, whiteSpace: 'nowrap' } }, award.year)
                ),
                a.showIssuer && award.issuer && el('p', { className: 'bkbg-aw-issuer', style: { margin: '0 0 6px', color: a.issuerColor } }, award.issuer),
                a.showDescription && award.description && el('p', { className: 'bkbg-aw-desc', style: { margin: 0, color: a.descColor } }, award.description)
            )
        );
    }

    registerBlockType('blockenberg/awards', {
        title: __('Awards & Recognition', 'blockenberg'),
        icon: 'awards',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var editAwardState = useState(null);
            var editAwardId = editAwardState[0];
            var setEditAwardId = editAwardState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateAward(id, key, val) {
                setAttributes({ awards: a.awards.map(function (aw) {
                    if (aw.id !== id) return aw;
                    var u = Object.assign({}, aw); u[key] = val; return u;
                }) });
            }

            function removeAward(id) {
                setAttributes({ awards: a.awards.filter(function (aw) { return aw.id !== id; }) });
            }

            function addAward() {
                var newId = makeId();
                setAttributes({ awards: a.awards.concat([{ id: newId, title: 'New Award', issuer: 'Organization', year: new Date().getFullYear().toString(), description: 'Award description.', icon: '🏆', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', imageUrl: '', imageId: 0, color: '', url: '' }]) });
                setEditAwardId(newId);
            }

            /* Grid style for editor preview */
            var gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
                gap: a.gap + 'px',
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Awards', 'blockenberg'), initialOpen: true },
                        a.awards.map(function (aw) {
                            var isEdit = editAwardId === aw.id;
                            return el('div', { key: aw.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } },
                                el('div', { onClick: function () { setEditAwardId(isEdit ? null : aw.id); },
                                    style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', cursor: 'pointer', background: isEdit ? '#f0e9ff' : '#fafafa' } },
                                    el('span', { style: { fontSize: '20px', flexShrink: 0 } }, aw.icon || '🏆'),
                                    el('div', { style: { flex: 1, overflow: 'hidden' } },
                                        el('p', { style: { margin: 0, fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, aw.title),
                                        el('p', { style: { margin: 0, fontSize: '11px', color: '#888' } }, aw.issuer + (aw.year ? ' · ' + aw.year : ''))
                                    )
                                ),
                                isEdit && el('div', { style: { padding: '10px', borderTop: '1px solid #e0e0e0' } },
                                    el(TextControl,     { label: __('Award title',  'blockenberg'), value: aw.title,       onChange: function (v) { updateAward(aw.id, 'title', v); } }),
                                    el(TextControl,     { label: __('Issuer',       'blockenberg'), value: aw.issuer,      onChange: function (v) { updateAward(aw.id, 'issuer', v); } }),
                                    el(TextControl,     { label: __('Year',         'blockenberg'), value: aw.year,        onChange: function (v) { updateAward(aw.id, 'year', v); } }),
                                    el(IP().IconPickerControl, {
                                        iconType: aw.iconType, customChar: aw.icon, dashicon: aw.iconDashicon, imageUrl: aw.iconImageUrl,
                                        onChangeType: function (v) { updateAward(aw.id, 'iconType', v); },
                                        onChangeChar: function (v) { updateAward(aw.id, 'icon', v); },
                                        onChangeDashicon: function (v) { updateAward(aw.id, 'iconDashicon', v); },
                                        onChangeImageUrl: function (v) { updateAward(aw.id, 'iconImageUrl', v); }
                                    }),
                                    el(TextareaControl, { label: __('Description',  'blockenberg'), value: aw.description, onChange: function (v) { updateAward(aw.id, 'description', v); }, rows: 3 }),
                                    el(TextControl,     { label: __('Link URL (optional)', 'blockenberg'), value: aw.url,  onChange: function (v) { updateAward(aw.id, 'url', v); } }),
                                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                                        el('span', { style: { fontSize: '12px', fontWeight: 600 } }, __('Icon bg color:', 'blockenberg')),
                                        el('input', { type: 'color', value: aw.color || a.accentColor, onChange: function (e) { updateAward(aw.id, 'color', e.target.value); }, style: { width: '32px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' } })
                                    ),
                                    /* Image upload */
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, { onSelect: function (m) { updateAward(aw.id, 'imageUrl', m.url); updateAward(aw.id, 'imageId', m.id); }, allowedTypes: ['image'], value: aw.imageId,
                                            render: function (mp) {
                                                return el(Fragment, null,
                                                    aw.imageUrl && el('img', { src: aw.imageUrl, style: { width: '48px', height: '48px', borderRadius: aw.color ? a.iconBgRadius + 'px' : '50%', objectFit: 'cover', display: 'block', marginBottom: '6px' } }),
                                                    el(Button, { variant: 'secondary', size: 'compact', onClick: mp.open }, aw.imageUrl ? __('Change image', 'blockenberg') : __('Upload image', 'blockenberg')),
                                                    aw.imageUrl && el(Button, { variant: 'tertiary', size: 'compact', isDestructive: true, onClick: function () { updateAward(aw.id, 'imageUrl', ''); updateAward(aw.id, 'imageId', 0); }, style: { marginLeft: '6px' } }, __('Remove', 'blockenberg'))
                                                );
                                            }
                                        })
                                    ),
                                    el('div', { style: { marginTop: '10px' } },
                                        el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { removeAward(aw.id); } }, __('Remove award', 'blockenberg'))
                                    )
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addAward, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Award', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: __('Grid', 'blockenberg'), value: 'grid' }, { label: __('List', 'blockenberg'), value: 'list' }], onChange: function (v) { setAttributes({ layout: v }); } }),
                        a.layout === 'grid' && el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 4, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 60, onChange: function (v) { setAttributes({ gap: v }); } })
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show section title',    'blockenberg'), checked: a.showTitle,       onChange: function (v) { setAttributes({ showTitle:       v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show subtitle',         'blockenberg'), checked: a.showSubtitle,    onChange: function (v) { setAttributes({ showSubtitle:    v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show year',             'blockenberg'), checked: a.showYear,        onChange: function (v) { setAttributes({ showYear:        v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show issuer',           'blockenberg'), checked: a.showIssuer,      onChange: function (v) { setAttributes({ showIssuer:      v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show description',      'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttributes({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: a.iconSize, min: 24, max: 80, onChange: function (v) { setAttributes({ iconSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)',   'blockenberg'), value: a.cardRadius,     min: 0,  max: 32, onChange: function (v) { setAttributes({ cardRadius:     v }); } }),
                        el(RangeControl, { label: __('Icon bg radius (px)','blockenberg'), value: a.iconBgRadius,   min: 0,  max: 32, onChange: function (v) { setAttributes({ iconBgRadius:   v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(wp.element.Fragment, {},
                                el(TC, { label: __('Section Title', 'blockenberg'), value: a.sectionTitleTypo || {}, onChange: function (v) { setAttributes({ sectionTitleTypo: v }); } }),
                                el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { setAttributes({ subtitleTypo: v }); } }),
                                el(TC, { label: __('Award Title', 'blockenberg'), value: a.awardTitleTypo || {}, onChange: function (v) { setAttributes({ awardTitleTypo: v }); } }),
                                el(TC, { label: __('Issuer', 'blockenberg'), value: a.issuerTypo || {}, onChange: function (v) { setAttributes({ issuerTypo: v }); } }),
                                el(TC, { label: __('Description', 'blockenberg'), value: a.descTypo || {}, onChange: function (v) { setAttributes({ descTypo: v }); } })
                            );
                        })()
                    ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',      __('Accent',            'blockenberg'), 'accentColor'),
                        cc('cardBg',           __('Card background',   'blockenberg'), 'cardBg'),
                        cc('cardBorder',       __('Card border',       'blockenberg'), 'cardBorder'),
                        cc('titleColor',       __('Section title',     'blockenberg'), 'titleColor'),
                        cc('sectionTitleColor',__('Section subtitle',  'blockenberg'), 'sectionTitleColor'),
                        cc('subtitleColor',    __('Subtitle text',     'blockenberg'), 'subtitleColor'),
                        cc('awardTitleColor',  __('Award title',       'blockenberg'), 'awardTitleColor'),
                        cc('issuerColor',      __('Issuer text',       'blockenberg'), 'issuerColor'),
                        cc('yearColor',        __('Year badge',        'blockenberg'), 'yearColor'),
                        cc('descColor',        __('Description',       'blockenberg'), 'descColor'),
                        cc('bgColor',          __('Section background','blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    /* Section header */
                    el('div', { style: { textAlign: 'center', marginBottom: '40px' } },
                        a.showTitle    && el(RichText, { tagName: 'h2', className: 'bkbg-aw-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Awards & Recognition', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 10px' } }),
                        a.showSubtitle && el(RichText, { tagName: 'p', className: 'bkbg-aw-subtitle', value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); }, placeholder: __('Our achievements and certifications', 'blockenberg'), style: { color: a.subtitleColor, margin: '8px 0 0', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' } })
                    ),

                    /* Grid */
                    el('div', { style: a.layout === 'list'
                        ? { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' }
                        : gridStyle },
                        a.awards.map(function (aw) {
                            return el(AwardCard, { key: aw.id, award: aw, a: a });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-aw-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-aw-header', style: { textAlign: 'center', marginBottom: '40px' } },
                    a.showTitle    && el(RichText.Content, { tagName: 'h2', className: 'bkbg-aw-title',    value: a.title }),
                    a.showSubtitle && el(RichText.Content, { tagName: 'p',  className: 'bkbg-aw-subtitle', value: a.subtitle })
                ),
                el('div', {
                    className: 'bkbg-aw-grid',
                    'data-awards': JSON.stringify(a.awards),
                    'data-layout': a.layout,
                    'data-show-year': a.showYear ? '1' : '0',
                    'data-show-issuer': a.showIssuer ? '1' : '0',
                    'data-show-desc': a.showDescription ? '1' : '0',
                })
            );
        }
    });
}() );
