( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
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
    var IP = function () { return window.bkbgIconPicker; };

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function () { return {}; };
    }
    function _tv(typoObj, prefix) { return getTypoCssVars()(typoObj || {}, prefix); }

    var LAYOUT_OPTIONS = [
        { label: __('Info left, form right',  'blockenberg'), value: 'info-left' },
        { label: __('Info right, form left',  'blockenberg'), value: 'info-right' },
        { label: __('Stacked (info top)',      'blockenberg'), value: 'stacked' },
    ];

    function makeId() { return 'cs' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-cs-accent':        a.accentColor,
            '--bkbg-cs-title-color':   a.titleColor,
            '--bkbg-cs-subtitle-color':a.subtitleColor,
            '--bkbg-cs-card-bg':       a.cardBg,
            '--bkbg-cs-icon-bg':       a.cardIconBg,
            '--bkbg-cs-lbl-color':     a.cardLabelColor,
            '--bkbg-cs-val-color':     a.cardValueColor,
            '--bkbg-cs-form-bg':       a.formBg,
            '--bkbg-cs-field-bg':      a.fieldBg,
            '--bkbg-cs-field-border':  a.fieldBorderColor,
            '--bkbg-cs-btn-bg':        a.btnBg,
            '--bkbg-cs-btn-color':     a.btnColor,
            '--bkbg-cs-card-radius':   a.cardRadius + 'px',
            '--bkbg-cs-form-radius':   a.formRadius + 'px',
            '--bkbg-cs-field-radius':  a.fieldRadius + 'px',
            '--bkbg-cs-btn-radius':    a.btnRadius + 'px',
            '--bkbg-cs-title-size':    a.titleSize + 'px',
            '--bkbg-cs-subtitle-size': a.subtitleSize + 'px',
            '--bkbg-cs-icon-size':     a.iconSize + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        }, _tv(a.typoTitle, '--bkcs-title-'), _tv(a.typoSubtitle, '--bkcs-sub-'));
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); },
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

    /* ── Info card ──────────────────────────────────────────────────────── */
    function InfoCard(props) {
        var card = props.card;
        var a    = props.a;
        return el('div', { className: 'bkbg-cs-info-card', style: { display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'var(--bkbg-cs-card-bg)', borderRadius: 'var(--bkbg-cs-card-radius)', padding: '16px 20px' } },
            el('div', { style: { width: a.iconSize + 'px', height: a.iconSize + 'px', borderRadius: '50%', background: 'var(--bkbg-cs-icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(a.iconSize * 0.55) + 'px', flexShrink: 0 } },
                (card.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(card.iconType, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor) : card.icon
            ),
            el('div', null,
                el('p', { style: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--bkbg-cs-lbl-color)', margin: '0 0 3px' } }, card.label),
                el('p', { style: { fontSize: '14px', color: 'var(--bkbg-cs-val-color)', margin: 0, lineHeight: 1.5 } }, card.value)
            )
        );
    }

    /* ── Contact form preview ────────────────────────────────────────────── */
    function FormPreview(props) {
        var a = props.a;
        var fieldStyle = { width: '100%', background: 'var(--bkbg-cs-field-bg)', border: '1.5px solid var(--bkbg-cs-field-border)', borderRadius: 'var(--bkbg-cs-field-radius)', padding: '10px 14px', fontSize: a.fieldSize + 'px', color: '#6b7280', boxSizing: 'border-box', display: 'block', fontFamily: 'inherit', outline: 'none' };
        var labelStyle = { fontSize: a.labelSize + 'px', fontWeight: 600, color: 'var(--bkbg-cs-lbl-color)', display: 'block', marginBottom: '6px' };
        var rowStyle   = { marginBottom: '16px' };

        return el('div', { className: 'bkbg-cs-form-preview', style: { background: 'var(--bkbg-cs-form-bg)', borderRadius: 'var(--bkbg-cs-form-radius)', padding: '32px' } },
            el('div', { style: { display: 'grid', gridTemplateColumns: a.showName ? '1fr 1fr' : '1fr', gap: '0 16px' } },
                a.showName && el('div', { style: rowStyle },
                    el('label', { style: labelStyle }, a.labelName),
                    el('input', { type: 'text', placeholder: a.labelName, style: fieldStyle, readOnly: true })
                ),
                el('div', { style: rowStyle },
                    el('label', { style: labelStyle }, a.labelEmail),
                    el('input', { type: 'email', placeholder: a.labelEmail, style: fieldStyle, readOnly: true })
                )
            ),
            a.showPhone && el('div', { style: rowStyle },
                el('label', { style: labelStyle }, a.labelPhone),
                el('input', { type: 'tel', placeholder: a.labelPhone, style: Object.assign({}, fieldStyle), readOnly: true })
            ),
            a.showSubject && el('div', { style: rowStyle },
                el('label', { style: labelStyle }, a.labelSubject),
                el('input', { type: 'text', placeholder: a.labelSubject, style: Object.assign({}, fieldStyle), readOnly: true })
            ),
            el('div', { style: rowStyle },
                el('label', { style: labelStyle }, a.labelMessage),
                el('textarea', { rows: 4, placeholder: a.labelMessage, style: Object.assign({}, fieldStyle, { resize: 'vertical' }), readOnly: true })
            ),
            el('button', { type: 'button', style: { background: 'var(--bkbg-cs-btn-bg)', color: 'var(--bkbg-cs-btn-color)', border: 'none', borderRadius: 'var(--bkbg-cs-btn-radius)', padding: '13px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', width: '100%' } }, a.submitLabel)
        );
    }

    registerBlockType('blockenberg/contact-section', {
        title: __('Contact Section', 'blockenberg'),
        icon: 'email-alt',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];
            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }
            function updateCard(id, key, val) {
                setAttributes({ infoCards: a.infoCards.map(function (c) { if (c.id !== id) return c; var u = Object.assign({}, c); u[key] = val; return u; }) });
            }
            function addCard() {
                setAttributes({ infoCards: a.infoCards.concat([{ id: makeId(), icon: '📌', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: 'New Contact', value: 'Details here' }]) });
            }
            function removeCard(id) {
                if (a.infoCards.length <= 1) return;
                setAttributes({ infoCards: a.infoCards.filter(function (c) { return c.id !== id; }) });
            }

            var isLeft    = a.layout === 'info-left';
            var isStacked = a.layout === 'stacked';

            var infoCol = a.showInfoCards ? el('div', { className: 'bkbg-cs-info-col', style: { display: 'flex', flexDirection: 'column', gap: a.cardGap + 'px', flex: '0 0 auto', minWidth: '280px' } },
                a.showTitle && el('div', null,
                    el(RichText, { tagName: 'h2', value: a.sectionTitle, onChange: function (v) { setAttributes({ sectionTitle: v }); }, placeholder: __('Contact title…', 'blockenberg'), className: 'bkbg-cs-title', style: { color: a.titleColor, margin: '0 0 10px' } }),
                    el(RichText, { tagName: 'p', value: a.sectionSubtitle, onChange: function (v) { setAttributes({ sectionSubtitle: v }); }, placeholder: __('Subtitle…', 'blockenberg'), className: 'bkbg-cs-subtitle', style: { color: a.subtitleColor, margin: 0 } })
                ),
                a.infoCards.map(function (card) { return el(InfoCard, { key: card.id, card: card, a: a }); }),
                a.showMap && a.mapEmbedUrl && el('div', { style: { borderRadius: a.cardRadius + 'px', overflow: 'hidden', marginTop: '8px' } },
                    el('iframe', { src: a.mapEmbedUrl, width: '100%', height: a.mapHeight, style: { border: 0, display: 'block' }, loading: 'lazy' })
                )
            ) : null;

            var formCol = a.showForm ? el('div', { className: 'bkbg-cs-form-col', style: { flex: '1 1 0', minWidth: 0 } },
                el(FormPreview, { a: a })
            ) : null;

            var inner = isStacked
                ? el('div', { style: { display: 'flex', flexDirection: 'column', gap: '32px' } }, infoCol, formCol)
                : el('div', { style: { display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' } }, infoCol, formCol);

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                        el(ToggleControl, { label: __('Show title & subtitle', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show info cards', 'blockenberg'), checked: a.showInfoCards, onChange: function (v) { setAttributes({ showInfoCards: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show contact form', 'blockenberg'), checked: a.showForm, onChange: function (v) { setAttributes({ showForm: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show embedded map', 'blockenberg'), checked: a.showMap, onChange: function (v) { setAttributes({ showMap: v }); }, __nextHasNoMarginBottom: true }),
                        a.showMap && el(TextControl, { label: __('Map embed URL', 'blockenberg'), value: a.mapEmbedUrl, help: __('Google Maps embed URL (share → embed)', 'blockenberg'), onChange: function (v) { setAttributes({ mapEmbedUrl: v }); } }),
                        a.showMap && el(RangeControl, { label: __('Map height (px)', 'blockenberg'), value: a.mapHeight, min: 160, max: 480, onChange: function (v) { setAttributes({ mapHeight: v }); } })
                    ),
                    el(PanelBody, { title: __('Form Fields', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Name field', 'blockenberg'), checked: a.showName, onChange: function (v) { setAttributes({ showName: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Phone field', 'blockenberg'), checked: a.showPhone, onChange: function (v) { setAttributes({ showPhone: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Subject field', 'blockenberg'), checked: a.showSubject, onChange: function (v) { setAttributes({ showSubject: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Submit button label', 'blockenberg'), value: a.submitLabel, onChange: function (v) { setAttributes({ submitLabel: v }); } }),
                        el(TextControl, { label: __('Recipient email', 'blockenberg'), value: a.recipientEmail, type: 'email', placeholder: 'hello@example.com', onChange: function (v) { setAttributes({ recipientEmail: v }); } }),
                        el(TextControl, { label: __('Success message', 'blockenberg'), value: a.successMessage, onChange: function (v) { setAttributes({ successMessage: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(Fragment, {},
                                el(TC, {
                                    label: __('Title', 'blockenberg'),
                                    value: a.typoTitle || {},
                                    onChange: function (v) { setAttributes({ typoTitle: v }); }
                                }),
                                el(TC, {
                                    label: __('Subtitle', 'blockenberg'),
                                    value: a.typoSubtitle || {},
                                    onChange: function (v) { setAttributes({ typoSubtitle: v }); }
                                })
                            );
                        })(),
                        el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: a.iconSize, min: 28, max: 64, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                        el(RangeControl, { label: __('Field size (px)', 'blockenberg'), value: a.fieldSize, min: 12, max: 18, onChange: function (v) { setAttributes({ fieldSize: v }); } }),
                        el(RangeControl, { label: __('Label size (px)', 'blockenberg'), value: a.labelSize, min: 10, max: 16, onChange: function (v) { setAttributes({ labelSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Radii', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Card gap (px)', 'blockenberg'), value: a.cardGap, min: 8, max: 32, onChange: function (v) { setAttributes({ cardGap: v }); } }),
                        el(RangeControl, { label: __('Form radius (px)', 'blockenberg'), value: a.formRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ formRadius: v }); } }),
                        el(RangeControl, { label: __('Field radius (px)', 'blockenberg'), value: a.fieldRadius, min: 0, max: 20, onChange: function (v) { setAttributes({ fieldRadius: v }); } }),
                        el(RangeControl, { label: __('Button radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ btnRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',    __('Accent',              'blockenberg'), 'accentColor'),
                        cc('titleColor',     __('Title',               'blockenberg'), 'titleColor'),
                        cc('subtitleColor',  __('Subtitle',            'blockenberg'), 'subtitleColor'),
                        cc('cardBg',         __('Info card background','blockenberg'), 'cardBg'),
                        cc('cardIconBg',     __('Icon background',     'blockenberg'), 'cardIconBg'),
                        cc('cardLabelColor', __('Info label',          'blockenberg'), 'cardLabelColor'),
                        cc('cardValueColor', __('Info value',          'blockenberg'), 'cardValueColor'),
                        cc('formBg',         __('Form background',     'blockenberg'), 'formBg'),
                        cc('fieldBg',        __('Field background',    'blockenberg'), 'fieldBg'),
                        cc('fieldBorderColor',__('Field border',       'blockenberg'), 'fieldBorderColor'),
                        cc('btnBg',          __('Button background',   'blockenberg'), 'btnBg'),
                        cc('btnColor',       __('Button text',         'blockenberg'), 'btnColor'),
                        cc('bgColor',        __('Section background',  'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Info Cards', 'blockenberg'), initialOpen: false },
                        a.infoCards.map(function (card) {
                            return el(PanelBody, { key: card.id, title: card.label || __('Card', 'blockenberg'), initialOpen: false },
                                el(IP().IconPickerControl, {
                                    iconType: card.iconType, customChar: card.icon, dashicon: card.iconDashicon, imageUrl: card.iconImageUrl,
                                    onChangeType: function (v) { updateCard(card.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateCard(card.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateCard(card.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateCard(card.id, 'iconImageUrl', v); }
                                }),
                                el(TextControl, { label: __('Label', 'blockenberg'), value: card.label, onChange: function (v) { updateCard(card.id, 'label', v); } }),
                                el(TextControl, { label: __('Value', 'blockenberg'), value: card.value, onChange: function (v) { updateCard(card.id, 'value', v); } }),
                                a.infoCards.length > 1 && el(Button, { onClick: function () { removeCard(card.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addCard, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Card', 'blockenberg'))
                    )
                ),

                el('div', blockProps, inner)
            );
        },

        save: function (props) {
            var a = props.attributes;
            var isLeft    = a.layout === 'info-left';
            var isStacked = a.layout === 'stacked';

            var infoCol = a.showInfoCards ? el('div', { className: 'bkbg-cs-info-col' },
                a.showTitle && el('div', { className: 'bkbg-cs-header' },
                    el(RichText.Content, { tagName: 'h2', value: a.sectionTitle, className: 'bkbg-cs-title', style: { color: a.titleColor } }),
                    el(RichText.Content, { tagName: 'p', value: a.sectionSubtitle, className: 'bkbg-cs-subtitle', style: { color: a.subtitleColor } })
                ),
                a.infoCards.map(function (card) {
                    return el('div', { key: card.id, className: 'bkbg-cs-info-card' },
                        el('div', { className: 'bkbg-cs-info-icon', style: { width: a.iconSize + 'px', height: a.iconSize + 'px', fontSize: Math.round(a.iconSize * 0.55) + 'px' } },
                            (card.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(card.iconType, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor) : card.icon
                        ),
                        el('div', { className: 'bkbg-cs-info-text' },
                            el('p', { className: 'bkbg-cs-info-label' }, card.label),
                            el('p', { className: 'bkbg-cs-info-value' }, card.value)
                        )
                    );
                }),
                a.showMap && a.mapEmbedUrl && el('div', { className: 'bkbg-cs-map', style: { borderRadius: a.cardRadius + 'px', overflow: 'hidden' } },
                    el('iframe', { src: a.mapEmbedUrl, width: '100%', height: a.mapHeight, style: { border: 0, display: 'block' }, loading: 'lazy', title: __('Map', 'blockenberg') })
                )
            ) : null;

            var formCol = a.showForm ? el('div', { className: 'bkbg-cs-form-col' },
                el('form', { className: 'bkbg-cs-form', 'data-recipient': a.recipientEmail, 'data-success': a.successMessage, style: { background: 'var(--bkbg-cs-form-bg)', borderRadius: 'var(--bkbg-cs-form-radius)', padding: '32px' } },
                    el('div', { className: 'bkbg-cs-form-row' },
                        a.showName && el('div', { className: 'bkbg-cs-field' },
                            el('label', null, a.labelName),
                            el('input', { type: 'text', name: 'contact_name', placeholder: a.labelName, required: true })
                        ),
                        el('div', { className: 'bkbg-cs-field' },
                            el('label', null, a.labelEmail),
                            el('input', { type: 'email', name: 'contact_email', placeholder: a.labelEmail, required: true })
                        )
                    ),
                    a.showPhone && el('div', { className: 'bkbg-cs-field' },
                        el('label', null, a.labelPhone),
                        el('input', { type: 'tel', name: 'contact_phone', placeholder: a.labelPhone })
                    ),
                    a.showSubject && el('div', { className: 'bkbg-cs-field' },
                        el('label', null, a.labelSubject),
                        el('input', { type: 'text', name: 'contact_subject', placeholder: a.labelSubject })
                    ),
                    el('div', { className: 'bkbg-cs-field' },
                        el('label', null, a.labelMessage),
                        el('textarea', { name: 'contact_message', rows: 5, placeholder: a.labelMessage, required: true })
                    ),
                    el('button', { type: 'submit', className: 'bkbg-cs-submit' }, a.submitLabel),
                    el('div', { className: 'bkbg-cs-form-msg', 'aria-live': 'polite' })
                )
            ) : null;

            var innerClass = isStacked ? 'bkbg-cs-inner bkbg-cs--stacked' : 'bkbg-cs-inner bkbg-cs--' + (isLeft ? 'info-left' : 'info-right');

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-cs-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: innerClass }, infoCol, formCol)
            );
        }
    });
}() );
