( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    function EditableText(props) {
        var field = props.field;
        var value = props.value;
        var onChange = props.onChange;
        var tag = props.tag || 'div';
        var className = props.className || '';
        var style = props.style || {};
        var isEditing = props.isEditing;
        var onStartEdit = props.onStartEdit;
        var onEndEdit = props.onEndEdit;

        if (isEditing) {
            return el('input', {
                type: 'text',
                className: 'bkbg-cert-inline-input ' + className,
                value: value,
                autoFocus: true,
                style: style,
                onChange: function (e) { onChange(e.target.value); },
                onBlur: onEndEdit,
                onKeyDown: function (e) { if (e.key === 'Enter') onEndEdit(); }
            });
        }
        return el(tag, {
            className: 'bkbg-cert-clickable ' + className,
            style: style,
            onClick: onStartEdit
        }, value || '—');
    }

    function CertPreview(props) {
        var a = props.a;
        var setAttributes = props.setAttributes;
        var editField = props.editField;
        var startEdit = props.startEdit;
        var endEdit = props.endEdit;

        var fontFamily = a.fontFamily === 'serif'
            ? 'Georgia, "Times New Roman", serif'
            : 'system-ui, -apple-system, sans-serif';

        var wrapStyle = Object.assign({
            background: a.bgColor,
            border: a.borderWidth + 'px solid ' + a.borderColor,
            borderRadius: a.borderRadius + 'px',
            maxWidth: a.maxWidth + 'px',
            margin: '0 auto',
            padding: '48px 56px',
            position: 'relative',
            fontFamily: fontFamily,
            boxShadow: a.shadowSize > 0 ? '0 ' + (a.shadowSize * 4) + 'px ' + (a.shadowSize * 16) + 'px rgba(0,0,0,.' + (a.shadowSize * 4) + ')' : 'none',
            boxSizing: 'border-box'
        }, _tv(a.typoRecipient, '--bkbg-cert-r-'), _tv(a.typoCourseTitle, '--bkbg-cert-ct-'), _tv(a.typoBody, '--bkbg-cert-bd-'));

        var innerBorderStyle = a.innerBorder ? {
            position: 'absolute',
            inset: '10px',
            border: '1px solid ' + a.borderColor,
            pointerEvents: 'none',
            borderRadius: a.borderRadius + 'px'
        } : null;

        // Corner decorations for classic style
        var corners = a.style === 'classic' ? el('div', { className: 'bkbg-cert-corners' },
            el('span', { className: 'bkbg-cert-corner tl', style: { color: a.accentColor } }, '✦'),
            el('span', { className: 'bkbg-cert-corner tr', style: { color: a.accentColor } }, '✦'),
            el('span', { className: 'bkbg-cert-corner bl', style: { color: a.accentColor } }, '✦'),
            el('span', { className: 'bkbg-cert-corner br', style: { color: a.accentColor } }, '✦')
        ) : null;

        // Issuer logo
        var logoEl = null;
        if (a.issuerLogoUrl) {
            logoEl = el('img', { src: a.issuerLogoUrl, alt: a.issuerName, className: 'bkbg-cert-logo' });
        }

        // Badge
        var badgeEl = a.showBadge ? el('div', { className: 'bkbg-cert-badge', style: { borderColor: a.accentColor, color: a.accentColor } }, a.badgeEmoji) : null;

        // Pre-title
        var preTitleEl = el(EditableText, {
            field: 'preTitle', value: a.preTitle,
            tag: 'div', className: 'bkbg-cert-pretitle',
            style: { color: a.preTitleColor, letterSpacing: '0.12em' },
            isEditing: editField === 'preTitle',
            onChange: function (v) { setAttributes({ preTitle: v }); },
            onStartEdit: function () { startEdit('preTitle'); },
            onEndEdit: endEdit
        });

        // Awarded to text
        var awardedToEl = el(EditableText, {
            field: 'awardedTo', value: a.awardedTo,
            tag: 'div', className: 'bkbg-cert-awarded-to',
            style: { color: a.descColor },
            isEditing: editField === 'awardedTo',
            onChange: function (v) { setAttributes({ awardedTo: v }); },
            onStartEdit: function () { startEdit('awardedTo'); },
            onEndEdit: endEdit
        });

        // Recipient name
        var recipientEl = el(EditableText, {
            field: 'recipientName', value: a.recipientName,
            tag: 'div', className: 'bkbg-cert-recipient',
            style: { color: a.recipientColor },
            isEditing: editField === 'recipientName',
            onChange: function (v) { setAttributes({ recipientName: v }); },
            onStartEdit: function () { startEdit('recipientName'); },
            onEndEdit: endEdit
        });

        // Course title
        var courseTitleEl = el(EditableText, {
            field: 'courseTitle', value: a.courseTitle,
            tag: 'div', className: 'bkbg-cert-course',
            style: { color: a.courseTitleColor },
            isEditing: editField === 'courseTitle',
            onChange: function (v) { setAttributes({ courseTitle: v }); },
            onStartEdit: function () { startEdit('courseTitle'); },
            onEndEdit: endEdit
        });

        // Course description
        var courseDescEl = editField === 'courseDesc'
            ? el('textarea', {
                className: 'bkbg-cert-inline-input bkbg-cert-desc',
                value: a.courseDesc,
                autoFocus: true,
                rows: 3,
                style: { color: a.descColor, width: '100%', resize: 'vertical' },
                onChange: function (e) { setAttributes({ courseDesc: e.target.value }); },
                onBlur: endEdit
            })
            : el('div', {
                className: 'bkbg-cert-desc bkbg-cert-clickable',
                style: { color: a.descColor },
                onClick: function () { startEdit('courseDesc'); }
            }, a.courseDesc);

        // Divider
        var divider = el('div', { className: 'bkbg-cert-divider', style: { '--bkbg-cert-accent': a.accentColor } });

        // Signatures row
        var sig1El = a.showSignature1 ? el('div', { className: 'bkbg-cert-sig' },
            el('div', { className: 'bkbg-cert-sig-line', style: { borderColor: a.metaColor } }),
            el(EditableText, {
                field: 'signature1Name', value: a.signature1Name,
                tag: 'div', className: 'bkbg-cert-sig-name',
                style: { color: a.issuerColor },
                isEditing: editField === 'signature1Name',
                onChange: function (v) { setAttributes({ signature1Name: v }); },
                onStartEdit: function () { startEdit('signature1Name'); },
                onEndEdit: endEdit
            }),
            el(EditableText, {
                field: 'signature1Title', value: a.signature1Title,
                tag: 'div', className: 'bkbg-cert-sig-title',
                style: { color: a.metaColor },
                isEditing: editField === 'signature1Title',
                onChange: function (v) { setAttributes({ signature1Title: v }); },
                onStartEdit: function () { startEdit('signature1Title'); },
                onEndEdit: endEdit
            })
        ) : null;

        var sig2El = a.showSignature2 ? el('div', { className: 'bkbg-cert-sig' },
            el('div', { className: 'bkbg-cert-sig-line', style: { borderColor: a.metaColor } }),
            el(EditableText, {
                field: 'signature2Name', value: a.signature2Name,
                tag: 'div', className: 'bkbg-cert-sig-name',
                style: { color: a.issuerColor },
                isEditing: editField === 'signature2Name',
                onChange: function (v) { setAttributes({ signature2Name: v }); },
                onStartEdit: function () { startEdit('signature2Name'); },
                onEndEdit: endEdit
            }),
            el(EditableText, {
                field: 'signature2Title', value: a.signature2Title,
                tag: 'div', className: 'bkbg-cert-sig-title',
                style: { color: a.metaColor },
                isEditing: editField === 'signature2Title',
                onChange: function (v) { setAttributes({ signature2Title: v }); },
                onStartEdit: function () { startEdit('signature2Title'); },
                onEndEdit: endEdit
            })
        ) : null;

        // Issuer row
        var issuerRow = el('div', { className: 'bkbg-cert-issuer-row' },
            logoEl,
            el(EditableText, {
                field: 'issuerName', value: a.issuerName,
                tag: 'div', className: 'bkbg-cert-issuer-name',
                style: { color: a.issuerColor },
                isEditing: editField === 'issuerName',
                onChange: function (v) { setAttributes({ issuerName: v }); },
                onStartEdit: function () { startEdit('issuerName'); },
                onEndEdit: endEdit
            })
        );

        // Meta row (date + credential)
        var metaRow = el('div', { className: 'bkbg-cert-meta', style: { color: a.metaColor } },
            a.showDate && el('span', { className: 'bkbg-cert-date' },
                el('span', { className: 'bkbg-cert-meta-label' }, 'Date: '),
                editField === 'completionDate'
                    ? el('input', { type: 'text', className: 'bkbg-cert-inline-input', value: a.completionDate, autoFocus: true, onChange: function (e) { setAttributes({ completionDate: e.target.value }); }, onBlur: endEdit })
                    : el('span', { className: 'bkbg-cert-clickable', onClick: function () { startEdit('completionDate'); } }, a.completionDate)
            ),
            a.showCredentialId && el('span', { className: 'bkbg-cert-cred' },
                el('span', { className: 'bkbg-cert-meta-label' }, 'Credential ID: '),
                editField === 'credentialId'
                    ? el('input', { type: 'text', className: 'bkbg-cert-inline-input', value: a.credentialId, autoFocus: true, onChange: function (e) { setAttributes({ credentialId: e.target.value }); }, onBlur: endEdit })
                    : el('span', { className: 'bkbg-cert-clickable', onClick: function () { startEdit('credentialId'); } }, a.credentialId)
            )
        );

        return el('div', { className: 'bkbg-cert-wrap bkbg-cert-style-' + (a.style || 'classic'), style: wrapStyle },
            a.innerBorder && el('div', { className: 'bkbg-cert-inner-border', style: innerBorderStyle }),
            corners,
            el('div', { className: 'bkbg-cert-body' },
                badgeEl,
                preTitleEl,
                awardedToEl,
                recipientEl,
                courseTitleEl,
                courseDescEl,
                divider,
                el('div', { className: 'bkbg-cert-sigs-row' }, sig1El, sig2El),
                divider,
                issuerRow,
                metaRow
            )
        );
    }

    registerBlockType('blockenberg/certificate', {
        title: __('Certificate', 'blockenberg'),
        icon: 'awards',
        category: 'bkbg-business',
        description: __('Digital certificate or diploma with recipient, issuer, and credential details.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var editState = useState(null);
            var editField = editState[0]; var setEditField = editState[1];

            function startEdit(f) { setEditField(f); }
            function endEdit() { setEditField(null); }

            var styleOpts = [
                { label: 'Classic', value: 'classic' },
                { label: 'Modern', value: 'modern' },
                { label: 'Minimal', value: 'minimal' }
            ];
            var fontOpts = [
                { label: 'Serif (Traditional)', value: 'serif' },
                { label: 'Sans-serif (Modern)', value: 'sans' }
            ];

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Certificate Style', 'blockenberg'),
                        value: a.style,
                        options: styleOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ style: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: a.maxWidth,
                        min: 480, max: 1200,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.borderWidth,
                        min: 0, max: 20,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0, max: 20,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Shadow', 'blockenberg'),
                        value: a.shadowSize,
                        min: 0, max: 5,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ shadowSize: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Inner Border Frame', 'blockenberg'),
                        checked: a.innerBorder,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ innerBorder: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Badge / Emoji', 'blockenberg'),
                        checked: a.showBadge,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showBadge: v }); }
                    }),
                    a.showBadge && el(TextControl, {
                        label: __('Badge Emoji', 'blockenberg'),
                        value: a.badgeEmoji,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ badgeEmoji: v }); }
                    })
                ),
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Pre-title (e.g. "Certificate of Completion")', 'blockenberg'),
                        value: a.preTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ preTitle: v }); }
                    }),
                    el(TextControl, {
                        label: __('Awarded-to text', 'blockenberg'),
                        value: a.awardedTo,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ awardedTo: v }); }
                    }),
                    el(TextControl, {
                        label: __('Recipient Name', 'blockenberg'),
                        value: a.recipientName,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ recipientName: v }); }
                    }),
                    el(TextControl, {
                        label: __('Course / Achievement Title', 'blockenberg'),
                        value: a.courseTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ courseTitle: v }); }
                    }),
                    el(TextareaControl, {
                        label: __('Description', 'blockenberg'),
                        value: a.courseDesc,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ courseDesc: v }); }
                    }),
                    el(TextControl, {
                        label: __('Issuer Name', 'blockenberg'),
                        value: a.issuerName,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ issuerName: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Date', 'blockenberg'),
                        checked: a.showDate,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showDate: v }); }
                    }),
                    a.showDate && el(TextControl, {
                        label: __('Completion Date', 'blockenberg'),
                        value: a.completionDate,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ completionDate: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Credential ID', 'blockenberg'),
                        checked: a.showCredentialId,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCredentialId: v }); }
                    }),
                    a.showCredentialId && el(TextControl, {
                        label: __('Credential ID', 'blockenberg'),
                        value: a.credentialId,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ credentialId: v }); }
                    })
                ),
                el(PanelBody, { title: __('Issuer Logo', 'blockenberg'), initialOpen: false },
                    a.issuerLogoUrl && el('div', { style: { marginBottom: '8px' } },
                        el('img', { src: a.issuerLogoUrl, style: { maxHeight: '60px', display: 'block', marginBottom: '8px' }, alt: '' }),
                        el(Button, { isDestructive: true, isSmall: true, onClick: function () { setAttributes({ issuerLogoUrl: '', issuerLogoId: 0 }); } }, __('Remove', 'blockenberg'))
                    ),
                    el(MediaUpload, {
                        onSelect: function (media) { setAttributes({ issuerLogoUrl: media.url, issuerLogoId: media.id }); },
                        allowedTypes: ['image'],
                        value: a.issuerLogoId,
                        render: function (rp) {
                            return el(Button, { variant: 'secondary', onClick: rp.open }, a.issuerLogoUrl ? __('Change Logo', 'blockenberg') : __('Upload Logo', 'blockenberg'));
                        }
                    })
                ),
                el(PanelBody, { title: __('Signatures', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Signature 1', 'blockenberg'),
                        checked: a.showSignature1,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSignature1: v }); }
                    }),
                    a.showSignature1 && el(TextControl, {
                        label: __('Name', 'blockenberg'),
                        value: a.signature1Name,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ signature1Name: v }); }
                    }),
                    a.showSignature1 && el(TextControl, {
                        label: __('Title', 'blockenberg'),
                        value: a.signature1Title,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ signature1Title: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Signature 2', 'blockenberg'),
                        checked: a.showSignature2,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSignature2: v }); }
                    }),
                    a.showSignature2 && el(TextControl, {
                        label: __('Name', 'blockenberg'),
                        value: a.signature2Name,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ signature2Name: v }); }
                    }),
                    a.showSignature2 && el(TextControl, {
                        label: __('Title', 'blockenberg'),
                        value: a.signature2Title,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ signature2Title: v }); }
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(SelectControl, {
                        label: __('Font Family', 'blockenberg'),
                        value: a.fontFamily,
                        options: fontOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ fontFamily: v }); }
                    }),
                    el(getTypographyControl(), { label: __('Recipient Name', 'blockenberg'), value: a.typoRecipient, onChange: function (v) { setAttributes({ typoRecipient: v }); } }),
                    el(getTypographyControl(), { label: __('Course Title', 'blockenberg'), value: a.typoCourseTitle, onChange: function (v) { setAttributes({ typoCourseTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Body / Description', 'blockenberg'), value: a.typoBody, onChange: function (v) { setAttributes({ typoBody: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (c) { setAttributes({ bgColor: c || '#fffef7' }); }, label: __('Background', 'blockenberg') },
                        { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c || '#c9a84c' }); }, label: __('Border / Frame', 'blockenberg') },
                        { value: a.accentColor, onChange: function (c) { setAttributes({ accentColor: c || '#8b6914' }); }, label: __('Accent', 'blockenberg') },
                        { value: a.preTitleColor, onChange: function (c) { setAttributes({ preTitleColor: c || '#8b6914' }); }, label: __('Pre-title', 'blockenberg') },
                        { value: a.recipientColor, onChange: function (c) { setAttributes({ recipientColor: c || '#1e293b' }); }, label: __('Recipient Name', 'blockenberg') },
                        { value: a.courseTitleColor, onChange: function (c) { setAttributes({ courseTitleColor: c || '#1a3a6b' }); }, label: __('Course Title', 'blockenberg') },
                        { value: a.descColor, onChange: function (c) { setAttributes({ descColor: c || '#475569' }); }, label: __('Description', 'blockenberg') },
                        { value: a.issuerColor, onChange: function (c) { setAttributes({ issuerColor: c || '#1e293b' }); }, label: __('Issuer Name', 'blockenberg') },
                        { value: a.metaColor, onChange: function (c) { setAttributes({ metaColor: c || '#64748b' }); }, label: __('Meta / Signature Title', 'blockenberg') }
                    ]
                })
            );

            var blockProps = useBlockProps({ className: 'bkbg-editor-wrap', 'data-block-label': 'Certificate' });

            return el('div', blockProps,
                inspector,
                el(CertPreview, {
                    a: a,
                    setAttributes: setAttributes,
                    editField: editField,
                    startEdit: startEdit,
                    endEdit: endEdit
                })
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cert-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
