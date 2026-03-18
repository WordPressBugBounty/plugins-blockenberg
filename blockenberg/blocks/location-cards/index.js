( function () {
    var el               = wp.element.createElement;
    var useState         = wp.element.useState;
    var __               = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody         = wp.components.PanelBody;
    var Button            = wp.components.Button;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ColorPicker       = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var CARD_STYLE_OPTIONS = [
        { label: __('Card (border + shadow)', 'blockenberg'), value: 'card' },
        { label: __('Flat (border only)',     'blockenberg'), value: 'flat' },
        { label: __('Ghost (no border)',      'blockenberg'), value: 'ghost' },
    ];
    var HOVER_OPTIONS = [
        { label: __('Lift (shadow)',   'blockenberg'), value: 'lift' },
        { label: __('Border Glow',    'blockenberg'), value: 'glow' },
        { label: __('None',           'blockenberg'), value: 'none' },
    ];
    var RATIO_OPTIONS = [
        { label: __('16:9', 'blockenberg'), value: '16/9' },
        { label: __('4:3',  'blockenberg'), value: '4/3' },
        { label: __('1:1',  'blockenberg'), value: '1/1' },
        { label: __('3:2',  'blockenberg'), value: '3/2' },
    ];

    function makeId() { return 'lc' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-lc-columns':        a.columns,
            '--bkbg-lc-gap':            a.gap + 'px',
            '--bkbg-lc-name-color':     a.nameColor,
            '--bkbg-lc-address-color':  a.addressColor,
            '--bkbg-lc-meta-color':     a.metaColor,
            '--bkbg-lc-hours-color':    a.hoursColor,
            '--bkbg-lc-icon-color':     a.iconColor,
            '--bkbg-lc-dir-color':      a.directionsColor,
            '--bkbg-lc-dir-bg':         a.directionsBg,
            '--bkbg-lc-card-bg':        a.cardBg,
            '--bkbg-lc-border-color':   a.borderColor,
            '--bkbg-lc-card-r':         a.cardRadius + 'px',
            '--bkbg-lc-card-pad':       a.cardPadding + 'px',
            '--bkbg-lc-img-r':          a.imageRadius + 'px',
            '--bkbg-lc-btn-r':          a.btnRadius + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        var _tvFn = getTypoCssVars();
        if (_tvFn) {
            Object.assign(s, _tvFn(a.nameTypo,   '--bkbg-locc-n-'));
            Object.assign(s, _tvFn(a.detailTypo, '--bkbg-locc-d-'));
            Object.assign(s, _tvFn(a.btnTypo,    '--bkbg-locc-bt-'));
        }
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

    function LocationCardPreview(props) {
        var loc = props.loc;
        var a   = props.a;
        var cardShadow = a.cardStyle === 'card' ? '0 2px 12px rgba(0,0,0,0.08)' : 'none';
        var cardBorder = a.cardStyle !== 'ghost' ? '1px solid ' + a.borderColor : 'none';
        return el('div', { style: { background: a.cardBg, borderRadius: a.cardRadius + 'px', border: cardBorder, boxShadow: cardShadow, overflow: 'hidden', fontFamily: 'sans-serif' } },
            /* Image */
            a.showImage && el('div', { style: { aspectRatio: a.imageRatio, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: a.imageRadius + 'px' } },
                loc.imageUrl
                    ? el('img', { src: loc.imageUrl, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                    : el('span', { style: { fontSize: '40px', opacity: 0.3 } }, '📍')
            ),
            /* Body */
            el('div', { className: 'bkbg-lc-card-body', style: { padding: a.cardPadding + 'px' } },
                el('div', { className: 'bkbg-lc-name', style: { color: a.nameColor } }, loc.name || __('Location Name', 'blockenberg')),
                (loc.address || loc.city) && el('div', { className: 'bkbg-lc-address', style: { color: a.addressColor } },
                    loc.address && el('div', null, loc.address),
                    (loc.city || loc.state || loc.zip) && el('div', null, [loc.city, loc.state, loc.zip].filter(Boolean).join(', ') + (loc.country ? ', ' + loc.country : ''))
                ),
                /* Meta */
                el('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' } },
                    a.showPhone && loc.phone && el('div', { className: 'bkbg-lc-phone', style: { color: a.metaColor, display: 'flex', gap: '6px', alignItems: 'center' } },
                        el('span', { style: { color: a.iconColor } }, '📞'), loc.phone
                    ),
                    a.showEmail && loc.email && el('div', { className: 'bkbg-lc-email', style: { color: a.metaColor, display: 'flex', gap: '6px', alignItems: 'center' } },
                        el('span', { style: { color: a.iconColor } }, '✉️'), loc.email
                    ),
                    a.showWebsite && loc.website && el('div', { className: 'bkbg-lc-phone', style: { color: a.directionsColor, display: 'flex', gap: '6px', alignItems: 'center' } },
                        el('span', { style: { color: a.iconColor } }, '🌐'), loc.website
                    ),
                    a.showHours && loc.hoursSnippet && el('div', { className: 'bkbg-lc-phone', style: { color: a.hoursColor, display: 'flex', gap: '6px', alignItems: 'center' } },
                        el('span', { style: { color: a.iconColor } }, '🕐'), loc.hoursSnippet
                    )
                ),
                a.showDirectionsLink && el('a', { className: 'bkbg-lc-btn-directions', href: loc.mapUrl || '#', style: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: a.directionsBg, color: a.directionsColor, borderRadius: a.btnRadius + 'px', textDecoration: 'none' } },
                    '📌 ', a.directionsLabel
                )
            )
        );
    }

    registerBlockType('blockenberg/location-cards', {
        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;
            var openColor  = useState(null);
            var openKey    = openColor[0];
            var setOpenKey = openColor[1];

            function setColor(key) {
                return function (v) { var o = {}; o[key] = v; setA(o); };
            }
            function cc(key, label, val) {
                return renderColorControl(key, label, val, setColor(key), openKey, setOpenKey);
            }

            function updateLocField(id, field, val) {
                setA({ locations: a.locations.map(function (l) { return l.id === id ? Object.assign({}, l, { [field]: val }) : l; }) });
            }
            function removeLocation(id) {
                setA({ locations: a.locations.filter(function (l) { return l.id !== id; }) });
            }
            function addLocation() {
                setA({ locations: a.locations.concat([{ id: makeId(), name: 'New Location', address: '123 Main St', city: 'City', state: 'ST', zip: '00000', country: 'USA', phone: '', email: '', website: '', mapUrl: '#', hoursSnippet: 'Mon–Fri 9am–5pm', imageUrl: '', imageId: 0 }]) });
            }

            var inspector = el(InspectorControls, null,

                /* Display Settings */
                el(PanelBody, { title: __('Display Settings', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Location Image', 'blockenberg'), checked: a.showImage, onChange: function (v) { setA({ showImage: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Phone Number', 'blockenberg'), checked: a.showPhone, onChange: function (v) { setA({ showPhone: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Email', 'blockenberg'), checked: a.showEmail, onChange: function (v) { setA({ showEmail: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Website', 'blockenberg'), checked: a.showWebsite, onChange: function (v) { setA({ showWebsite: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Hours', 'blockenberg'), checked: a.showHours, onChange: function (v) { setA({ showHours: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Directions Button', 'blockenberg'), checked: a.showDirectionsLink, onChange: function (v) { setA({ showDirectionsLink: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Directions Button Label', 'blockenberg'), value: a.directionsLabel, onChange: function (v) { setA({ directionsLabel: v }); } })
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Columns (Desktop)', 'blockenberg'), value: a.columns, min: 1, max: 4, onChange: function (v) { setA({ columns: v }); } }),
                    el(RangeControl, { label: __('Columns (Tablet)', 'blockenberg'), value: a.columnsTablet, min: 1, max: 3, onChange: function (v) { setA({ columnsTablet: v }); } }),
                    el(RangeControl, { label: __('Columns (Mobile)', 'blockenberg'), value: a.columnsMobile, min: 1, max: 2, onChange: function (v) { setA({ columnsMobile: v }); } }),
                    el(RangeControl, { label: __('Gap Between Cards (px)', 'blockenberg'), value: a.gap, min: 0, max: 80, onChange: function (v) { setA({ gap: v }); } }),
                    el(SelectControl, { label: __('Card Style', 'blockenberg'), value: a.cardStyle, options: CARD_STYLE_OPTIONS, onChange: function (v) { setA({ cardStyle: v }); } }),
                    el(SelectControl, { label: __('Hover Effect', 'blockenberg'), value: a.hoverEffect, options: HOVER_OPTIONS, onChange: function (v) { setA({ hoverEffect: v }); } }),
                    el(SelectControl, { label: __('Image Aspect Ratio', 'blockenberg'), value: a.imageRatio, options: RATIO_OPTIONS, onChange: function (v) { setA({ imageRatio: v }); } }),
                    el(RangeControl, { label: __('Card Border Radius', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function (v) { setA({ cardRadius: v }); } }),
                    el(RangeControl, { label: __('Card Padding', 'blockenberg'), value: a.cardPadding, min: 8, max: 60, onChange: function (v) { setA({ cardPadding: v }); } }),
                    el(RangeControl, { label: __('Image Border Radius', 'blockenberg'), value: a.imageRadius, min: 0, max: 40, onChange: function (v) { setA({ imageRadius: v }); } }),
                    el(RangeControl, { label: __('Button Border Radius', 'blockenberg'), value: a.btnRadius, min: 0, max: 40, onChange: function (v) { setA({ btnRadius: v }); } })
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Location Name', 'blockenberg'), value: a.nameTypo || {}, onChange: function (v) { setA({ nameTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Details', 'blockenberg'), value: a.detailTypo || {}, onChange: function (v) { setA({ detailTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Button', 'blockenberg'), value: a.btnTypo || {}, onChange: function (v) { setA({ btnTypo: v }); } })
                ),

                /* Colors */
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    cc('bgColor',         __('Section Background', 'blockenberg'), a.bgColor),
                    cc('cardBg',          __('Card Background', 'blockenberg'),    a.cardBg),
                    cc('borderColor',     __('Border Color', 'blockenberg'),       a.borderColor),
                    cc('nameColor',       __('Location Name', 'blockenberg'),      a.nameColor),
                    cc('addressColor',    __('Address Text', 'blockenberg'),       a.addressColor),
                    cc('metaColor',       __('Contact Info', 'blockenberg'),       a.metaColor),
                    cc('hoursColor',      __('Hours Text', 'blockenberg'),         a.hoursColor),
                    cc('iconColor',       __('Icon Color', 'blockenberg'),         a.iconColor),
                    cc('directionsColor', __('Directions Button Text', 'blockenberg'), a.directionsColor),
                    cc('directionsBg',    __('Directions Button BG', 'blockenberg'),   a.directionsBg)
                ),

                /* Spacing */
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setA({ paddingTop: v }); } }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setA({ paddingBottom: v }); } })
                ),

                /* Locations */
                el(PanelBody, { title: __('Locations', 'blockenberg'), initialOpen: false },
                    a.locations.map(function (loc) {
                        return el(PanelBody, { key: loc.id, title: loc.name || __('Location', 'blockenberg'), initialOpen: false },
                            el(TextControl, { label: __('Name', 'blockenberg'), value: loc.name, onChange: function (v) { updateLocField(loc.id, 'name', v); } }),
                            el(TextControl, { label: __('Street Address', 'blockenberg'), value: loc.address, onChange: function (v) { updateLocField(loc.id, 'address', v); } }),
                            el(TextControl, { label: __('City', 'blockenberg'), value: loc.city, onChange: function (v) { updateLocField(loc.id, 'city', v); } }),
                            el(TextControl, { label: __('State / Province', 'blockenberg'), value: loc.state, onChange: function (v) { updateLocField(loc.id, 'state', v); } }),
                            el(TextControl, { label: __('ZIP / Postcode', 'blockenberg'), value: loc.zip, onChange: function (v) { updateLocField(loc.id, 'zip', v); } }),
                            el(TextControl, { label: __('Country', 'blockenberg'), value: loc.country, onChange: function (v) { updateLocField(loc.id, 'country', v); } }),
                            el(TextControl, { label: __('Phone', 'blockenberg'), value: loc.phone, onChange: function (v) { updateLocField(loc.id, 'phone', v); } }),
                            el(TextControl, { label: __('Email', 'blockenberg'), value: loc.email, onChange: function (v) { updateLocField(loc.id, 'email', v); } }),
                            el(TextControl, { label: __('Website', 'blockenberg'), value: loc.website, onChange: function (v) { updateLocField(loc.id, 'website', v); } }),
                            el(TextControl, { label: __('Google Maps URL', 'blockenberg'), value: loc.mapUrl, onChange: function (v) { updateLocField(loc.id, 'mapUrl', v); } }),
                            el(TextControl, { label: __('Hours Snippet', 'blockenberg'), value: loc.hoursSnippet, onChange: function (v) { updateLocField(loc.id, 'hoursSnippet', v); } }),
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (m) { updateLocField(loc.id, 'imageUrl', m.url); updateLocField(loc.id, 'imageId', m.id); },
                                    allowedTypes: ['image'],
                                    value: loc.imageId,
                                    render: function (ref) {
                                        return el('div', { style: { marginTop: '6px' } },
                                            loc.imageUrl && el('img', { src: loc.imageUrl, style: { width: '100%', borderRadius: '4px', marginBottom: '6px' } }),
                                            el(Button, { onClick: ref.open, variant: loc.imageId ? 'secondary' : 'primary' },
                                                loc.imageId ? __('Replace Image', 'blockenberg') : __('Set Location Image', 'blockenberg')
                                            ),
                                            loc.imageId && el(Button, { onClick: function () { updateLocField(loc.id, 'imageUrl', ''); updateLocField(loc.id, 'imageId', 0); }, variant: 'link', isDestructive: true }, __('Remove', 'blockenberg'))
                                        );
                                    }
                                })
                            ),
                            el(Button, { variant: 'link', isDestructive: true, onClick: function () { removeLocation(loc.id); } }, __('Delete Location', 'blockenberg'))
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addLocation }, __('+ Add Location', 'blockenberg'))
                )
            );

            /* — Preview grid — */
            var gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
                gap: a.gap + 'px',
            };

            return el('div', useBlockProps({ style: buildWrapStyle(a) }),
                inspector,
                el('div', { style: gridStyle },
                    a.locations.map(function (loc) {
                        return el('div', { key: loc.id },
                            el(LocationCardPreview, { loc: loc, a: a })
                        );
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', Object.assign({}, useBlockProps.save(), {
                className: 'bkbg-lc-wrap',
                style: buildWrapStyle(a),
                'data-columns-tablet': a.columnsTablet,
                'data-columns-mobile': a.columnsMobile,
                'data-card-style':     a.cardStyle,
                'data-hover':          a.hoverEffect,
            }),
                el('div', { className: 'bkbg-lc-grid' },
                    a.locations.map(function (loc) {
                        return el('div', { key: loc.id, className: 'bkbg-lc-card' },
                            a.showImage && el('div', { className: 'bkbg-lc-image-wrap' },
                                loc.imageUrl && el('img', { className: 'bkbg-lc-image', src: loc.imageUrl, alt: loc.name, loading: 'lazy' })
                            ),
                            el('div', { className: 'bkbg-lc-body' },
                                el('h3', { className: 'bkbg-lc-name' }, loc.name),
                                el('address', { className: 'bkbg-lc-address' },
                                    loc.address && el('span', { className: 'bkbg-lc-street' }, loc.address),
                                    (loc.city || loc.state) && el('span', { className: 'bkbg-lc-city-state' }, [loc.city, loc.state, loc.zip].filter(Boolean).join(', '))
                                ),
                                el('div', { className: 'bkbg-lc-meta' },
                                    a.showPhone && loc.phone && el('div', { className: 'bkbg-lc-meta-row' }, el('span', { className: 'bkbg-lc-icon' }, '📞'), el('a', { href: 'tel:' + loc.phone }, loc.phone)),
                                    a.showEmail && loc.email && el('div', { className: 'bkbg-lc-meta-row' }, el('span', { className: 'bkbg-lc-icon' }, '✉️'), el('a', { href: 'mailto:' + loc.email }, loc.email)),
                                    a.showWebsite && loc.website && el('div', { className: 'bkbg-lc-meta-row' }, el('span', { className: 'bkbg-lc-icon' }, '🌐'), el('a', { href: loc.website, target: '_blank', rel: 'noopener' }, loc.website)),
                                    a.showHours && loc.hoursSnippet && el('div', { className: 'bkbg-lc-meta-row' }, el('span', { className: 'bkbg-lc-icon' }, '🕐'), el('span', null, loc.hoursSnippet))
                                ),
                                a.showDirectionsLink && loc.mapUrl && el('a', { className: 'bkbg-lc-directions-btn', href: loc.mapUrl, target: '_blank', rel: 'noopener' }, '📌 ' + a.directionsLabel)
                            )
                        );
                    })
                )
            );
        },
    });
}() );
