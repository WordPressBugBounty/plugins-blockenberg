(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-ss-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                sidebarSide: 'left',
                sidebarWidth: '30',
                stickyTop: 80,
                sidebarStyle: 'card',
                gap: 40,
                containerPadding: 0,
                mainContent: '',
                imageUrl: '',
                imageAlt: '',
                imageStyle: 'rounded',
                imageSize: 80,
                showImage: false,
                heading: '',
                showHeading: true,
                headingTag: 'h3',
                subText: '',
                showSubText: true,
                bullets: [],
                showBullets: true,
                bulletIcon: '✓',
                showCta: true,
                ctaLabel: 'Get Started',
                ctaUrl: '#',
                ctaNewTab: false,
                ctaStyle: 'filled',
                showRatingBox: false,
                ratingStars: 5,
                ratingCount: '4.9 / 5',
                ratingLabel: 'based on 120 reviews',
                showContactInfo: false,
                contactPhone: '',
                contactEmail: '',
                borderRadius: 12,
                sidebarPadding: 24,
                containerBg: '',
                mainBg: '',
                sidebarBg: '#f8fafc',
                sidebarBorderColor: '#e2e8f0',
                headingColor: '#111827',
                textColor: '#374151',
                bulletIconColor: '#6366f1',
                ctaBg: '#6366f1',
                ctaColor: '#ffffff',
                starColor: '#f59e0b',
                linkColor: '#6366f1',
            }, opts);

            var sidebarFlex = parseInt(o.sidebarWidth) || 30;

            // Outer wrapper
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-ss-wrap';
            wrap.style.display = 'flex';
            wrap.style.gap = o.gap + 'px';
            wrap.style.padding = o.containerPadding + 'px';
            wrap.style.alignItems = 'flex-start';
            if (o.containerBg) wrap.style.background = o.containerBg;

            typoCssVarsForEl(wrap, o.headingTypo, '--bkssb-hd-');
            typoCssVarsForEl(wrap, o.subTextTypo, '--bkssb-st-');
            wrap.style.setProperty('--bkssb-heading-color', o.headingColor || '#111827');
            wrap.style.setProperty('--bkssb-text-color', o.textColor || '#374151');
            wrap.style.setProperty('--bkssb-st-fw', o.subTextFontWeight || '400');
            wrap.style.setProperty('--bkssb-st-lh', String(o.subTextLineHeight || 1.5));

            // ── Sidebar ──
            var sidebar = document.createElement('div');
            sidebar.className = 'bkbg-ss-sidebar is-sticky style-' + o.sidebarStyle;
            sidebar.style.flex = '0 0 ' + sidebarFlex + '%';
            sidebar.style.maxWidth = sidebarFlex + '%';
            sidebar.style.top = o.stickyTop + 'px';
            sidebar.style.padding = o.sidebarPadding + 'px';
            sidebar.style.borderRadius = o.borderRadius + 'px';
            sidebar.style.display = 'flex';
            sidebar.style.flexDirection = 'column';
            sidebar.style.gap = '16px';
            sidebar.style.boxSizing = 'border-box';

            if (o.sidebarStyle === 'card') {
                sidebar.style.background = o.sidebarBg;
                sidebar.style.boxShadow = '0 1px 12px rgba(0,0,0,0.08)';
                sidebar.style.border = '1px solid ' + o.sidebarBorderColor;
            } else if (o.sidebarStyle === 'border') {
                sidebar.style.border = '1px solid ' + o.sidebarBorderColor;
            }

            // Image
            if (o.showImage && o.imageUrl) {
                var imgWrap = document.createElement('div');
                imgWrap.className = 'bkbg-ss-img-wrap';
                imgWrap.style.display = 'flex';
                imgWrap.style.justifyContent = 'center';
                var img = document.createElement('img');
                img.className = 'bkbg-ss-img';
                img.src = o.imageUrl;
                img.alt = o.imageAlt;
                img.style.display = 'block';
                img.style.objectFit = 'cover';
                if (o.imageStyle === 'full') {
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = o.borderRadius + 'px';
                } else {
                    img.style.width = o.imageSize + 'px';
                    img.style.height = o.imageSize + 'px';
                    img.style.borderRadius = o.imageStyle === 'circle' ? '50%' : o.imageStyle === 'rounded' ? '10px' : '0';
                }
                imgWrap.appendChild(img);
                sidebar.appendChild(imgWrap);
            }

            // Heading
            if (o.showHeading && o.heading) {
                var headingEl = document.createElement(o.headingTag);
                headingEl.className = 'bkbg-ss-heading';
                headingEl.textContent = o.heading;
                headingEl.style.margin = '0';
                headingEl.style.color = o.headingColor;
                sidebar.appendChild(headingEl);
            }

            // Sub-text
            if (o.showSubText && o.subText) {
                var subEl = document.createElement('p');
                subEl.className = 'bkbg-ss-subtext';
                subEl.textContent = o.subText;
                subEl.style.margin = '0';
                subEl.style.color = o.textColor;
                sidebar.appendChild(subEl);
            }

            // Rating
            if (o.showRatingBox) {
                var ratingBox = document.createElement('div');
                ratingBox.className = 'bkbg-ss-rating';
                ratingBox.style.background = 'rgba(0,0,0,0.04)';
                ratingBox.style.borderRadius = '8px';
                ratingBox.style.padding = '10px 14px';

                var stars = document.createElement('div');
                stars.className = 'bkbg-ss-stars';
                stars.textContent = '★'.repeat(Math.round(o.ratingStars)) + '☆'.repeat(5 - Math.round(o.ratingStars));
                stars.style.color = o.starColor;
                stars.style.fontSize = '18px';
                stars.style.letterSpacing = '2px';
                ratingBox.appendChild(stars);

                var score = document.createElement('div');
                score.className = 'bkbg-ss-rating-score';
                score.textContent = o.ratingCount;
                score.style.fontWeight = '700';
                score.style.color = o.headingColor;
                score.style.fontSize = '15px';
                score.style.marginTop = '4px';
                ratingBox.appendChild(score);

                var rlabel = document.createElement('div');
                rlabel.className = 'bkbg-ss-rating-label';
                rlabel.textContent = o.ratingLabel;
                rlabel.style.fontSize = '12px';
                rlabel.style.opacity = '0.7';
                rlabel.style.color = o.textColor;
                ratingBox.appendChild(rlabel);

                sidebar.appendChild(ratingBox);
            }

            // Bullets
            if (o.showBullets && o.bullets && o.bullets.length > 0) {
                var ul = document.createElement('ul');
                ul.className = 'bkbg-ss-bullets';
                ul.style.listStyle = 'none';
                ul.style.margin = '0';
                ul.style.padding = '0';
                ul.style.display = 'flex';
                ul.style.flexDirection = 'column';
                ul.style.gap = '8px';
                o.bullets.forEach(function (b) {
                    var li = document.createElement('li');
                    li.className = 'bkbg-ss-bullet';
                    li.style.display = 'flex';
                    li.style.alignItems = 'flex-start';
                    li.style.gap = '8px';
                    li.style.fontSize = '14px';
                    li.style.color = o.textColor;
                    li.style.lineHeight = '1.5';
                    var icon = document.createElement('span');
                    icon.className = 'bkbg-ss-bullet-icon';
                    icon.textContent = o.bulletIcon;
                    icon.style.color = o.bulletIconColor;
                    icon.style.fontWeight = '700';
                    icon.style.flexShrink = '0';
                    var text = document.createElement('span');
                    text.textContent = b.text;
                    li.appendChild(icon);
                    li.appendChild(text);
                    ul.appendChild(li);
                });
                sidebar.appendChild(ul);
            }

            // Contact info
            if (o.showContactInfo && (o.contactPhone || o.contactEmail)) {
                var contact = document.createElement('div');
                contact.className = 'bkbg-ss-contact';
                contact.style.display = 'flex';
                contact.style.flexDirection = 'column';
                contact.style.gap = '6px';
                contact.style.fontSize = '14px';
                if (o.contactPhone) {
                    var phone = document.createElement('a');
                    phone.href = 'tel:' + o.contactPhone.replace(/\s+/g, '');
                    phone.textContent = '📞 ' + o.contactPhone;
                    phone.style.color = o.textColor;
                    phone.style.textDecoration = 'none';
                    contact.appendChild(phone);
                }
                if (o.contactEmail) {
                    var email = document.createElement('a');
                    email.href = 'mailto:' + o.contactEmail;
                    email.textContent = '✉️ ' + o.contactEmail;
                    email.style.color = o.linkColor;
                    email.style.textDecoration = 'none';
                    contact.appendChild(email);
                }
                sidebar.appendChild(contact);
            }

            // CTA button
            if (o.showCta && o.ctaLabel) {
                var cta = document.createElement('a');
                cta.className = 'bkbg-ss-cta';
                cta.href = o.ctaUrl || '#';
                cta.textContent = o.ctaLabel;
                if (o.ctaNewTab) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
                cta.style.display = 'block';
                cta.style.textAlign = 'center';
                cta.style.padding = '10px 20px';
                cta.style.borderRadius = '8px';
                cta.style.fontWeight = '600';
                cta.style.fontSize = '15px';
                cta.style.textDecoration = 'none';
                cta.style.boxSizing = 'border-box';
                cta.style.borderWidth = '2px';
                cta.style.borderStyle = 'solid';
                cta.style.borderColor = o.ctaBg;
                if (o.ctaStyle === 'filled') {
                    cta.style.background = o.ctaBg;
                    cta.style.color = o.ctaColor;
                } else if (o.ctaStyle === 'outline') {
                    cta.style.background = 'transparent';
                    cta.style.color = o.ctaBg;
                } else {
                    cta.style.background = 'transparent';
                    cta.style.color = o.ctaBg;
                    cta.style.borderColor = 'transparent';
                }
                sidebar.appendChild(cta);
            }

            // ── Main content ──
            var main = document.createElement('div');
            main.className = 'bkbg-ss-main';
            main.style.flex = '1';
            main.style.minWidth = '0';
            main.style.boxSizing = 'border-box';
            if (o.mainBg) main.style.background = o.mainBg;

            var mainContent = document.createElement('div');
            mainContent.className = 'bkbg-ss-main-content';
            mainContent.style.lineHeight = '1.7';
            mainContent.innerHTML = o.mainContent;
            main.appendChild(mainContent);

            // Assemble sidebar side
            if (o.sidebarSide === 'left') {
                wrap.appendChild(sidebar);
                wrap.appendChild(main);
            } else {
                wrap.appendChild(main);
                wrap.appendChild(sidebar);
            }

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
