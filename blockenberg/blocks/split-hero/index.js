( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
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

    var SIDE_OPTIONS = [
        { label: __('Content left',  'blockenberg'), value: 'left' },
        { label: __('Content right', 'blockenberg'), value: 'right' },
    ];
    var RATIO_OPTIONS = [
        { label: '40 / 60', value: '40' },
        { label: '50 / 50', value: '50' },
        { label: '60 / 40', value: '60' },
    ];
    var BADGE_OPTIONS = [
        { label: __('Pill',   'blockenberg'), value: 'pill' },
        { label: __('Badge',  'blockenberg'), value: 'badge' },
        { label: __('Label',  'blockenberg'), value: 'label' },
    ];
    var MEDIA_OPTIONS = [
        { label: __('Image', 'blockenberg'), value: 'image' },
        { label: __('Video', 'blockenberg'), value: 'video' },
    ];
    var TAG_OPTIONS = [
        { label: 'h1', value: 'h1' },
        { label: 'h2', value: 'h2' },
        { label: 'h3', value: 'h3' },
        { label: 'p',  value: 'p'  },
    ];

    /* Lazy typography helpers */
    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildWrapStyle(a) {
        var tv = getTypoCssVars();
        var s = {
            '--bkbg-sh-min-height':  a.minHeight + 'px',
            '--bkbg-sh-accent':      a.accentColor,
            '--bkbg-sh-h-color':     a.headlineColor,
            '--bkbg-sh-sub-color':   a.subtextColor,
            '--bkbg-sh-badge-color': a.badgeColor,
            '--bkbg-sh-badge-bg':    a.badgeBg,
            '--bkbg-sh-cta1-bg':     a.ctaPrimaryBg,
            '--bkbg-sh-cta1-color':  a.ctaPrimaryColor,
            '--bkbg-sh-cta2-color':  a.ctaSecondaryColor,
            '--bkbg-sh-star-color':  a.starColor,
            '--bkbg-sh-proof-color': a.socialProofColor,
            '--bkbg-sh-content-bg':  a.contentBg,
            '--bkbg-sh-media-bg':    a.mediaBg,
            '--bkbg-sh-cta-radius':  a.ctaRadius + 'px',
            '--bkbg-sh-h-size':      a.headlineSize + 'px',
            '--bkbg-sh-h-w':         String(a.headlineFontWeight || 800),
            '--bkbg-sh-sub-size':    a.subtextSize + 'px',
            '--bkbg-sh-badge-size':  a.badgeSize + 'px',
            '--bkbg-sh-rating-size': a.ratingSize + 'px',
            '--bkbg-sh-cta1-size':   a.ctaPrimarySize + 'px',
            '--bkbg-sh-cta2-size':   a.ctaSecondarySize + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        if (tv) {
            Object.assign(s, tv(a.headlineTypo, '--bksh-hl-'));
            Object.assign(s, tv(a.subtextTypo,  '--bksh-st-'));
            Object.assign(s, tv(a.badgeTypo,    '--bksh-bd-'));
            Object.assign(s, tv(a.ratingTypo,   '--bksh-rt-'));
            Object.assign(s, tv(a.proofTypo,    '--bksh-sp-'));
            Object.assign(s, tv(a.cta1Typo,     '--bksh-c1-'));
            Object.assign(s, tv(a.cta2Typo,     '--bksh-c2-'));
        }
        return s;
    }

    function SvgStar(props) {
        return el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: props.filled ? props.color : '#e5e7eb' },
            el('polygon', { points: '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26' })
        );
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

    registerBlockType('blockenberg/split-hero', {
        title: __('Split Hero', 'blockenberg'),
        icon: 'align-pull-left',
        category: 'bkbg-layout',
        description: __('Purpose-built hero with headline, CTAs, social proof, and a full-height media panel.', 'blockenberg'),

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

            var contentRatio = parseInt(a.splitRatio, 10);
            var mediaRatio   = 100 - contentRatio;
            var isLeft       = a.contentSide === 'left';

            var badgeDecor = a.showBadge ? el('span', {
                className: 'bkbg-sh-badge bkbg-sh-badge--' + a.badgeStyle,
                style: {
                    display:      'inline-block',
                    color:        'var(--bkbg-sh-badge-color)',
                    background:   'var(--bkbg-sh-badge-bg)',
                    borderRadius: a.badgeStyle === 'pill' ? '99px' : a.badgeStyle === 'badge' ? '6px' : '0',
                    padding:      a.badgeStyle === 'label' ? '2px 0' : '4px 14px',
                    marginBottom: '18px',
                }
            }, a.badge) : null;

            var headlineEl = el(RichText, {
                tagName: a.headlineTag || 'h1',
                className: 'bkbg-sh-headline',
                value:   a.headline,
                onChange: function (v) { setAttributes({ headline: v }); },
                placeholder: __('Your powerful headline…', 'blockenberg'),
                style: { color: 'var(--bkbg-sh-h-color)', margin: '0 0 18px' }
            });

            var subtextEl = el(RichText, {
                tagName: 'p',
                className: 'bkbg-sh-subtext',
                value:   a.subtext,
                onChange: function (v) { setAttributes({ subtext: v }); },
                placeholder: __('Supporting subtext…', 'blockenberg'),
                style: { color: 'var(--bkbg-sh-sub-color)', margin: '0 0 28px' }
            });

            var ctaRow = el('div', { className: 'bkbg-sh-cta-row', style: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px', alignItems: 'center' } },
                el('a', { href: a.ctaPrimaryUrl || '#', className: 'bkbg-sh-cta1', style: { display: 'inline-flex', alignItems: 'center', background: 'var(--bkbg-sh-cta1-bg)', color: 'var(--bkbg-sh-cta1-color)', padding: '12px 28px', borderRadius: 'var(--bkbg-sh-cta-radius)' } }, a.ctaPrimaryLabel || 'Get Started'),
                a.showSecondaryCta && el('a', { href: a.ctaSecondaryUrl || '#', className: 'bkbg-sh-cta2', style: { display: 'inline-flex', alignItems: 'center', color: 'var(--bkbg-sh-cta2-color)', padding: '11px 20px', borderRadius: 'var(--bkbg-sh-cta-radius)', border: '1.5px solid currentColor' } }, a.ctaSecondaryLabel || 'Learn more')
            );

            var ratingRow = a.showRating ? el('div', { className: 'bkbg-sh-rating', style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' } },
                el('div', { style: { display: 'flex', gap: '2px' } },
                    [1,2,3,4,5].map(function (n) { return el(SvgStar, { key: n, filled: n <= a.ratingStars, color: a.starColor || '#f59e0b' }); })
                ),
                el('span', { className: 'bkbg-sh-score', style: { color: 'var(--bkbg-sh-sub-color)' } }, a.ratingScore + '/5'),
                a.ratingText && el('span', { className: 'bkbg-sh-rating-text', style: { color: 'var(--bkbg-sh-proof-color)' } }, a.ratingText)
            ) : null;

            var proofRow = a.showSocialProof && a.socialProofText ? el('p', { className: 'bkbg-sh-proof', style: { color: 'var(--bkbg-sh-proof-color)', margin: '8px 0 0' } }, a.socialProofText) : null;

            var contentCol = el('div', { className: 'bkbg-sh-content', style: { width: contentRatio + '%', background: 'var(--bkbg-sh-content-bg)', padding: a.contentPaddingV + 'px ' + a.contentPaddingH + 'px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--bkbg-sh-min-height)' } },
                badgeDecor,
                headlineEl,
                subtextEl,
                ctaRow,
                ratingRow,
                proofRow
            );

            var mediaEl;
            if (a.mediaType === 'video' && a.videoUrl) {
                mediaEl = el('iframe', { src: a.videoUrl, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }, allow: 'autoplay; fullscreen' });
            } else if (a.imageUrl) {
                mediaEl = el('img', { src: a.imageUrl, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: a.imageRadius + 'px', boxShadow: a.imageShadow ? '0 20px 60px rgba(0,0,0,0.15)' : 'none' } });
            } else {
                mediaEl = el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' } }, __('Media panel', 'blockenberg'));
            }

            var mediaCol = el('div', { className: 'bkbg-sh-media', style: { width: mediaRatio + '%', background: 'var(--bkbg-sh-media-bg)', position: 'relative', minHeight: 'var(--bkbg-sh-min-height)', overflow: 'hidden' } },
                mediaEl
            );

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Hero Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Content side', 'blockenberg'), value: a.contentSide, options: SIDE_OPTIONS, onChange: function (v) { setAttributes({ contentSide: v }); } }),
                        el(SelectControl, { label: __('Split ratio (content %)', 'blockenberg'), value: a.splitRatio, options: RATIO_OPTIONS, onChange: function (v) { setAttributes({ splitRatio: v }); } }),
                        el(RangeControl, { label: __('Min height (px)', 'blockenberg'), value: a.minHeight, min: 400, max: 900, onChange: function (v) { setAttributes({ minHeight: v }); } })
                    ),
                    el(PanelBody, { title: __('Badge', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show badge', 'blockenberg'), checked: a.showBadge, onChange: function (v) { setAttributes({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBadge && el(TextControl, { label: __('Badge text', 'blockenberg'), value: a.badge, onChange: function (v) { setAttributes({ badge: v }); } }),
                        a.showBadge && el(SelectControl, { label: __('Badge style', 'blockenberg'), value: a.badgeStyle, options: BADGE_OPTIONS, onChange: function (v) { setAttributes({ badgeStyle: v }); } })
                    ),
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Headline tag', 'blockenberg'), value: a.headlineTag, options: TAG_OPTIONS, onChange: function (v) { setAttributes({ headlineTag: v }); } }),
                        el(RangeControl, { label: __('Horizontal padding (px)', 'blockenberg'), value: a.contentPaddingH, min: 20, max: 120, onChange: function (v) { setAttributes({ contentPaddingH: v }); } }),
                        el(RangeControl, { label: __('Vertical padding (px)', 'blockenberg'), value: a.contentPaddingV, min: 20, max: 120, onChange: function (v) { setAttributes({ contentPaddingV: v }); } }),
                        el(RangeControl, { label: __('CTA border radius (px)', 'blockenberg'), value: a.ctaRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ ctaRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Primary CTA', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Label', 'blockenberg'), value: a.ctaPrimaryLabel, onChange: function (v) { setAttributes({ ctaPrimaryLabel: v }); } }),
                        el(TextControl, { label: __('URL', 'blockenberg'), value: a.ctaPrimaryUrl, onChange: function (v) { setAttributes({ ctaPrimaryUrl: v }); } }),
                        el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: a.ctaPrimaryTarget, onChange: function (v) { setAttributes({ ctaPrimaryTarget: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Secondary CTA', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show secondary CTA', 'blockenberg'), checked: a.showSecondaryCta, onChange: function (v) { setAttributes({ showSecondaryCta: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSecondaryCta && el(TextControl, { label: __('Label', 'blockenberg'), value: a.ctaSecondaryLabel, onChange: function (v) { setAttributes({ ctaSecondaryLabel: v }); } }),
                        a.showSecondaryCta && el(TextControl, { label: __('URL', 'blockenberg'), value: a.ctaSecondaryUrl, onChange: function (v) { setAttributes({ ctaSecondaryUrl: v }); } }),
                        a.showSecondaryCta && el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: a.ctaSecondaryTarget, onChange: function (v) { setAttributes({ ctaSecondaryTarget: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Social Proof', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show rating', 'blockenberg'), checked: a.showRating, onChange: function (v) { setAttributes({ showRating: v }); }, __nextHasNoMarginBottom: true }),
                        a.showRating && el(RangeControl, { label: __('Rating score', 'blockenberg'), value: a.ratingScore, min: 1, max: 5, step: 0.1, onChange: function (v) { setAttributes({ ratingScore: v }); } }),
                        a.showRating && el(RangeControl, { label: __('Stars filled', 'blockenberg'), value: a.ratingStars, min: 1, max: 5, onChange: function (v) { setAttributes({ ratingStars: v }); } }),
                        a.showRating && el(TextControl, { label: __('Rating label', 'blockenberg'), value: a.ratingText, onChange: function (v) { setAttributes({ ratingText: v }); } }),
                        el(ToggleControl, { label: __('Show social proof text', 'blockenberg'), checked: a.showSocialProof, onChange: function (v) { setAttributes({ showSocialProof: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSocialProof && el(TextControl, { label: __('Social proof text', 'blockenberg'), value: a.socialProofText, onChange: function (v) { setAttributes({ socialProofText: v }); } })
                    ),
                    el(PanelBody, { title: __('Media', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Media type', 'blockenberg'), value: a.mediaType, options: MEDIA_OPTIONS, onChange: function (v) { setAttributes({ mediaType: v }); } }),
                        a.mediaType === 'image' && el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) { setAttributes({ imageUrl: media.url, imageId: media.id }); },
                                allowedTypes: ['image'], value: a.imageId,
                                render: function (p) { return el(Button, { onClick: p.open, variant: a.imageUrl ? 'secondary' : 'primary', style: { marginBottom: '8px' } }, a.imageUrl ? __('Replace image', 'blockenberg') : __('Upload hero image', 'blockenberg')); }
                            })
                        ),
                        a.mediaType === 'image' && el(RangeControl, { label: __('Image radius (px)', 'blockenberg'), value: a.imageRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ imageRadius: v }); } }),
                        a.mediaType === 'image' && el(ToggleControl, { label: __('Drop shadow', 'blockenberg'), checked: a.imageShadow, onChange: function (v) { setAttributes({ imageShadow: v }); }, __nextHasNoMarginBottom: true }),
                        a.mediaType === 'video' && el(TextControl, { label: __('Embed video URL', 'blockenberg'), value: a.videoUrl, placeholder: 'https://…/embed/…', onChange: function (v) { setAttributes({ videoUrl: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: __('Headline', 'blockenberg'), value: a.headlineTypo, onChange: function (v) { setAttributes({ headlineTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Subtext', 'blockenberg'), value: a.subtextTypo, onChange: function (v) { setAttributes({ subtextTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Badge', 'blockenberg'), value: a.badgeTypo, onChange: function (v) { setAttributes({ badgeTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Rating', 'blockenberg'), value: a.ratingTypo, onChange: function (v) { setAttributes({ ratingTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Social proof', 'blockenberg'), value: a.proofTypo, onChange: function (v) { setAttributes({ proofTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Primary CTA', 'blockenberg'), value: a.cta1Typo, onChange: function (v) { setAttributes({ cta1Typo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Secondary CTA', 'blockenberg'), value: a.cta2Typo, onChange: function (v) { setAttributes({ cta2Typo: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',   __('Accent',            'blockenberg'), 'accentColor'),
                        cc('headlineColor', __('Headline',          'blockenberg'), 'headlineColor'),
                        cc('subtextColor',  __('Subtext',           'blockenberg'), 'subtextColor'),
                        cc('badgeColor',    __('Badge text',        'blockenberg'), 'badgeColor'),
                        cc('badgeBg',       __('Badge background',  'blockenberg'), 'badgeBg'),
                        cc('cta1Bg',        __('Primary CTA bg',    'blockenberg'), 'ctaPrimaryBg'),
                        cc('cta1Color',     __('Primary CTA text',  'blockenberg'), 'ctaPrimaryColor'),
                        cc('cta2Color',     __('Secondary CTA',     'blockenberg'), 'ctaSecondaryColor'),
                        cc('starColor',     __('Stars',             'blockenberg'), 'starColor'),
                        cc('proofColor',    __('Social proof text', 'blockenberg'), 'socialProofColor'),
                        cc('contentBg',     __('Content panel bg',  'blockenberg'), 'contentBg'),
                        cc('mediaBg',       __('Media panel bg',    'blockenberg'), 'mediaBg'),
                        cc('bgColor',       __('Outer background',  'blockenberg'), 'bgColor')
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-sh-inner', style: { display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', minHeight: 'var(--bkbg-sh-min-height)' } },
                        contentCol,
                        mediaCol
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var contentRatio = parseInt(a.splitRatio, 10);
            var mediaRatio   = 100 - contentRatio;
            var isLeft = a.contentSide === 'left';

            var badgeEl = a.showBadge ? el('span', { className: 'bkbg-sh-badge bkbg-sh-badge--' + a.badgeStyle, style: { display: 'inline-block', color: 'var(--bkbg-sh-badge-color)', background: 'var(--bkbg-sh-badge-bg)', borderRadius: a.badgeStyle === 'pill' ? '99px' : a.badgeStyle === 'badge' ? '6px' : '0', padding: a.badgeStyle === 'label' ? '2px 0' : '4px 14px' } }, a.badge) : null;

            var headline = a.headline ? el(RichText.Content, { tagName: a.headlineTag || 'h1', value: a.headline, className: 'bkbg-sh-headline', style: { color: 'var(--bkbg-sh-h-color)' } }) : null;
            var subtext  = a.subtext ? el(RichText.Content, { tagName: 'p', value: a.subtext, className: 'bkbg-sh-subtext', style: { color: 'var(--bkbg-sh-sub-color)' } }) : null;

            var ctaRow = el('div', { className: 'bkbg-sh-cta-row' },
                el('a', { href: a.ctaPrimaryUrl || '#', target: a.ctaPrimaryTarget ? '_blank' : undefined, rel: a.ctaPrimaryTarget ? 'noopener noreferrer' : undefined, className: 'bkbg-sh-cta1', style: { background: 'var(--bkbg-sh-cta1-bg)', color: 'var(--bkbg-sh-cta1-color)', borderRadius: 'var(--bkbg-sh-cta-radius)' } }, a.ctaPrimaryLabel || 'Get Started'),
                a.showSecondaryCta && el('a', { href: a.ctaSecondaryUrl || '#', target: a.ctaSecondaryTarget ? '_blank' : undefined, rel: a.ctaSecondaryTarget ? 'noopener noreferrer' : undefined, className: 'bkbg-sh-cta2', style: { color: 'var(--bkbg-sh-cta2-color)', borderRadius: 'var(--bkbg-sh-cta-radius)' } }, a.ctaSecondaryLabel || 'Learn more')
            );

            var ratingEl = a.showRating ? el('div', { className: 'bkbg-sh-rating' },
                el('div', { className: 'bkbg-sh-stars' },
                    [1,2,3,4,5].map(function (n) {
                        return el('svg', { key: n, width: 16, height: 16, viewBox: '0 0 24 24', fill: n <= a.ratingStars ? a.starColor : '#e5e7eb' },
                            el('polygon', { points: '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26' })
                        );
                    })
                ),
                el('span', { className: 'bkbg-sh-score', style: { color: 'var(--bkbg-sh-sub-color)' } }, a.ratingScore + '/5'),
                a.ratingText && el('span', { className: 'bkbg-sh-rating-text', style: { color: 'var(--bkbg-sh-proof-color)' } }, a.ratingText)
            ) : null;

            var proofEl = a.showSocialProof && a.socialProofText ? el('p', { className: 'bkbg-sh-proof', style: { color: 'var(--bkbg-sh-proof-color)' } }, a.socialProofText) : null;

            var contentCol = el('div', { className: 'bkbg-sh-content', style: { width: contentRatio + '%', background: 'var(--bkbg-sh-content-bg)', padding: a.contentPaddingV + 'px ' + a.contentPaddingH + 'px' } },
                badgeEl, headline, subtext, ctaRow, ratingEl, proofEl
            );

            var mediaInner;
            if (a.mediaType === 'video' && a.videoUrl) {
                mediaInner = el('iframe', { src: a.videoUrl, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }, allow: 'autoplay; fullscreen', loading: 'lazy' });
            } else if (a.imageUrl) {
                mediaInner = el('img', { src: a.imageUrl, alt: '', loading: 'lazy', className: 'bkbg-sh-img', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: a.imageRadius + 'px', boxShadow: a.imageShadow ? '0 20px 60px rgba(0,0,0,0.15)' : 'none' } });
            } else {
                mediaInner = null;
            }
            var mediaCol = el('div', { className: 'bkbg-sh-media', style: { width: mediaRatio + '%', background: 'var(--bkbg-sh-media-bg)', position: 'relative', overflow: 'hidden' } }, mediaInner);

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-sh-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-sh-inner bkbg-sh-side--' + a.contentSide, style: { display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', minHeight: 'var(--bkbg-sh-min-height)' } },
                    contentCol,
                    mediaCol
                )
            );
        }
    });
}() );
