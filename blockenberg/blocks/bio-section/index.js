( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    var SOCIAL_ICONS = { twitter: '𝕏', linkedin: 'in', instagram: '◉', website: '🌐', youtube: '▶', tiktok: '♪', facebook: 'f' };

    registerBlockType('blockenberg/bio-section', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps();

            var isCentered = a.layout === 'centered';
            var isRight = a.layout === 'image-right';

            function updateCredential(idx, val) {
                var next = a.credentials.map(function (c, i) { return i === idx ? { text: val } : c; });
                set({ credentials: next });
            }

            function updateSocial(idx, key, val) {
                var next = a.socials.map(function (s, i) { return i === idx ? Object.assign({}, s, { [key]: val }) : s; });
                set({ socials: next });
            }

            /* Photo */
            var shapeStyle = {};
            if (a.imageShape === 'circle') shapeStyle.borderRadius = '50%';
            else if (a.imageShape === 'rounded') shapeStyle.borderRadius = a.imageRadius + 'px';

            var imageEl = el(MediaUploadCheck, {},
                el(MediaUpload, {
                    onSelect: function (media) { set({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); },
                    allowedTypes: ['image'],
                    value: a.imageId,
                    render: function (ref) {
                        return el('div', {
                            className: 'bkbg-bios-photo-wrap',
                            onClick: ref.open,
                            style: { position: 'relative', width: isCentered ? '280px' : a.imageWidth + 'px', margin: isCentered ? '0 auto 32px' : '0', cursor: 'pointer', flexShrink: 0 }
                        },
                            a.showDecorator && el('div', { className: 'bkbg-bios-decorator', style: { position: 'absolute', inset: '-16px', background: a.decoratorColor, borderRadius: (a.imageRadius + 16) + 'px', zIndex: 0 } }),
                            a.imageUrl
                                ? el('img', { src: a.imageUrl, alt: a.imageAlt, style: Object.assign({ width: '100%', display: 'block', position: 'relative', zIndex: 1 }, shapeStyle) })
                                : el('div', { style: Object.assign({ background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', aspectRatio: '3/4', position: 'relative', zIndex: 1 }, shapeStyle) }, '🧑')
                        );
                    }
                })
            );

            /* Text content */
            var textContent = el('div', { className: 'bkbg-bios-text', style: { flex: 1 } },
                el(RichText, { tagName: 'h2', className: 'bkbg-bios-name', value: a.name, style: { color: a.nameColor, margin: '0 0 6px' }, onChange: function (v) { set({ name: v }); } }),
                el(RichText, { tagName: 'p', className: 'bkbg-bios-title', value: a.title, style: { color: a.titleColor, margin: '0 0 8px' }, onChange: function (v) { set({ title: v }); } }),
                a.showSubtitle && el(RichText, { tagName: 'p', className: 'bkbg-bios-subtitle', value: a.subtitle, style: { color: a.subtitleColor, margin: '0 0 20px' }, onChange: function (v) { set({ subtitle: v }); } }),
                a.showCredentials && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' } },
                    a.credentials.map(function (c, idx) {
                        return el('span', { key: idx, style: { background: a.credentialBg, color: a.credentialColor, fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '999px' } },
                            el(RichText, { tagName: 'span', value: c.text, onChange: function (v) { updateCredential(idx, v); } })
                        ) }),
                    el(Button, { isSmall: true, isSecondary: true, onClick: function () { set({ credentials: a.credentials.concat([{ text: 'New badge' }]) }); } }, '+')
                ),
                el(RichText, { tagName: 'div', className: 'bkbg-bios-bio', multiline: 'p', value: a.bio, style: { color: a.bioColor, marginBottom: '20px' }, onChange: function (v) { set({ bio: v }); } }),
                a.showQuote && el('blockquote', { className: 'bkbg-bios-quote', style: { borderLeft: '4px solid ' + a.quoteBorderColor, paddingLeft: '20px', margin: '0 0 20px' } },
                    el(RichText, { tagName: 'p', value: a.highlightQuote, style: { color: a.quoteColor, margin: 0 }, onChange: function (v) { set({ highlightQuote: v }); } })
                ),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' } },
                    a.ctaEnabled && el('a', { href: '#editor', style: { background: a.ctaBg, color: a.ctaColor, padding: '12px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', textDecoration: 'none', display: 'inline-block' } },
                        el(RichText, { tagName: 'span', value: a.ctaLabel, onChange: function (v) { set({ ctaLabel: v }); } })
                    ),
                    a.showSocials && el('div', { style: { display: 'flex', gap: '10px' } },
                        a.socials.map(function (s, idx) {
                            return el('span', { key: idx, title: s.label, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid #e5e7eb', color: a.socialColor, fontSize: '13px', fontWeight: '700', cursor: 'pointer' } }, SOCIAL_ICONS[s.platform] || s.platform[0].toUpperCase()) })
                    )
                )
            );

            var layoutStyles = { display: 'flex', gap: '60px', alignItems: 'center' };
            if (isCentered) layoutStyles = { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' };
            if (isRight) layoutStyles.flexDirection = 'row-reverse';

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Image Left', value: 'image-left' }, { label: 'Image Right', value: 'image-right' }, { label: 'Centered', value: 'centered' }], onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Image Shape', 'blockenberg'), value: a.imageShape, options: [{ label: 'Rounded', value: 'rounded' }, { label: 'Circle', value: 'circle' }, { label: 'Square', value: 'square' }], onChange: function (v) { set({ imageShape: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Image Width (px)', 'blockenberg'), value: a.imageWidth, min: 200, max: 600, onChange: function (v) { set({ imageWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Image Radius (px)', 'blockenberg'), value: a.imageRadius, min: 0, max: 40, onChange: function (v) { set({ imageRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Decorator', 'blockenberg'), checked: a.showDecorator, onChange: function (v) { set({ showDecorator: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Credentials', 'blockenberg'), checked: a.showCredentials, onChange: function (v) { set({ showCredentials: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Quote', 'blockenberg'), checked: a.showQuote, onChange: function (v) { set({ showQuote: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show CTA', 'blockenberg'), checked: a.ctaEnabled, onChange: function (v) { set({ ctaEnabled: v }); }, __nextHasNoMarginBottom: true }),
                    a.ctaEnabled && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { set({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    a.ctaEnabled && el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: a.ctaIsExternal, onChange: function (v) { set({ ctaIsExternal: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Social Links', 'blockenberg'), checked: a.showSocials, onChange: function (v) { set({ showSocials: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 600, max: 1400, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                a.showSocials && el(PanelBody, { title: __('Social Links', 'blockenberg'), initialOpen: false },
                    a.socials.map(function (s, idx) {
                        return el('div', { key: idx, style: { borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' } },
                            el(TextControl, { label: s.platform.charAt(0).toUpperCase() + s.platform.slice(1) + ' URL', value: s.url, onChange: function (v) { updateSocial(idx, 'url', v); }, __nextHasNoMarginBottom: true })
                        ) })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Name', 'blockenberg'), value: a.typoName, onChange: function (v) { set({ typoName: v }); } }),
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { set({ typoSubtitle: v }); } }),
                    el(getTypographyControl(), { label: __('Bio Text', 'blockenberg'), value: a.typoBio, onChange: function (v) { set({ typoBio: v }); } }),
                    el(getTypographyControl(), { label: __('Quote', 'blockenberg'), value: a.typoQuote, onChange: function (v) { set({ typoQuote: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Name', 'blockenberg'), value: a.nameColor, onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                        { label: __('Title', 'blockenberg'), value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#7c3aed' }); } },
                        { label: __('Bio Text', 'blockenberg'), value: a.bioColor, onChange: function (v) { set({ bioColor: v || '#374151' }); } },
                        { label: __('Credential BG', 'blockenberg'), value: a.credentialBg, onChange: function (v) { set({ credentialBg: v || '#f3f0ff' }); } },
                        { label: __('Credential Text', 'blockenberg'), value: a.credentialColor, onChange: function (v) { set({ credentialColor: v || '#5b21b6' }); } },
                        { label: __('Quote', 'blockenberg'), value: a.quoteColor, onChange: function (v) { set({ quoteColor: v || '#111827' }); } },
                        { label: __('Quote Border', 'blockenberg'), value: a.quoteBorderColor, onChange: function (v) { set({ quoteBorderColor: v || '#7c3aed' }); } },
                        { label: __('Decorator', 'blockenberg'), value: a.decoratorColor, onChange: function (v) { set({ decoratorColor: v || '#f3f0ff' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: a.ctaBg, onChange: function (v) { set({ ctaBg: v || '#7c3aed' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: a.ctaColor, onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } },
                        { label: __('Social Icons', 'blockenberg'), value: a.socialColor, onChange: function (v) { set({ socialColor: v || '#6b7280' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: Object.assign({ background: a.bgColor, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' }, _tv(a.typoName, '--bkbg-bios-name-'), _tv(a.typoTitle, '--bkbg-bios-title-'), _tv(a.typoSubtitle, '--bkbg-bios-subtitle-'), _tv(a.typoBio, '--bkbg-bios-bio-'), _tv(a.typoQuote, '--bkbg-bios-quote-')) },
                    el('div', { style: Object.assign({ maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' }, layoutStyles) },
                        imageEl,
                        textContent
                    )
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-bios-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
