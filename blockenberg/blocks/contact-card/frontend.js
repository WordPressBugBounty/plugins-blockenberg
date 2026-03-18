(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    var PLATFORM_ICONS = {
        github:    '</>',
        twitter:   'X',
        instagram: 'IG',
        youtube:   '▶',
        dribbble:  '●',
        behance:   'Bē',
        custom:    '🔗',
    };
    var CONTACT_ICONS = { email: '✉', phone: '☎', address: '📍', website: '🌐' };

    function initials(name) {
        return (name || '??').split(' ').map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
    }

    function init() {
        document.querySelectorAll('.bkbg-cc-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                name: 'Sarah Johnson',
                jobTitle: 'Lead Designer',
                company: 'Acme Studio',
                email: 'sarah@acme.studio',
                phone: '+1 (555) 234-5678',
                address: '',
                website: 'https://acme.studio',
                photoUrl: '',
                photoId: 0,
                showPhoto: true,
                links: [],
                showLinks: true,
                style: 'card',
                cardOrientation: 'vertical',
                maxWidth: 380,
                align: 'center',
                avatarSize: 88,
                borderRadius: 16,
                cardPadding: 28,
                showShadow: true,
                showDivider: true,
                cardBg: '#ffffff',
                cardBorder: '#e5e7eb',
                nameColor: '#111827',
                titleColor: '#6b7280',
                companyColor: '#374151',
                iconBg: '#f1f5f9',
                iconColor: '#374151',
                linkColor: '#6366f1',
                dividerColor: '#f1f5f9',
                accentBg: '#6366f1',
                metaSize: 14,
                nameSize: 20,
            }, opts);

            var isBadge  = o.style === 'badge';
            var isHoriz  = o.cardOrientation === 'horizontal';

            // ── Outer ──
            var outer = document.createElement('div');
            outer.className = 'bkbg-cc-outer align-' + o.align;

            // ── Card ──
            var card = document.createElement('div');
            card.className = 'bkbg-cc-card style-' + o.style + (o.showShadow && o.style === 'card' ? ' has-shadow' : '');
            card.style.maxWidth = o.maxWidth + 'px';
            card.style.borderRadius = o.borderRadius + 'px';
            card.style.background = o.cardBg;
            card.style.overflow = 'hidden';
            card.style.setProperty('--bkbg-cc-border',        o.cardBorder);
            card.style.setProperty('--bkbg-cc-accent',        o.accentBg);
            card.style.setProperty('--bkbg-cc-icon-bg',       o.iconBg);
            card.style.setProperty('--bkbg-cc-icon-color',    o.iconColor);
            card.style.setProperty('--bkbg-cc-link',          o.linkColor);
            card.style.setProperty('--bkbg-cc-divider',       o.dividerColor);

            // Badge header
            if (isBadge) {
                var badgeHeader = document.createElement('div');
                badgeHeader.className = 'bkbg-cc-badge-header';
                badgeHeader.style.background = o.accentBg;
                card.appendChild(badgeHeader);
            }

            // ── Body ──
            var body = document.createElement('div');
            body.className = 'bkbg-cc-body orient-' + o.cardOrientation + ' text-' + o.align;
            body.style.padding = o.cardPadding + 'px';
            body.style.flexDirection = isHoriz ? 'row' : 'column';
            body.style.alignItems = isHoriz ? 'center' : (o.align === 'center' ? 'center' : o.align === 'right' ? 'flex-end' : 'flex-start');
            if (isBadge && !isHoriz) {
                body.style.marginTop = -(o.avatarSize / 2) + 'px';
            }

            // ── Avatar ──
            var avatarEl = null;
            if (o.showPhoto) {
                if (o.photoUrl) {
                    avatarEl = document.createElement('img');
                    avatarEl.className = 'bkbg-cc-avatar';
                    avatarEl.src = o.photoUrl;
                    avatarEl.alt = o.name || '';
                    avatarEl.width = o.avatarSize;
                    avatarEl.height = o.avatarSize;
                    avatarEl.style.width = o.avatarSize + 'px';
                    avatarEl.style.height = o.avatarSize + 'px';
                    avatarEl.style.border = '3px solid ' + (isBadge ? '#fff' : o.cardBg);
                } else {
                    avatarEl = document.createElement('div');
                    avatarEl.className = 'bkbg-cc-avatar-placeholder';
                    avatarEl.style.width  = o.avatarSize + 'px';
                    avatarEl.style.height = o.avatarSize + 'px';
                    avatarEl.style.fontSize = Math.round(o.avatarSize * 0.38) + 'px';
                    avatarEl.style.background = o.accentBg;
                    avatarEl.style.border = '3px solid ' + (isBadge ? '#fff' : o.cardBg);
                    avatarEl.textContent = initials(o.name);
                }
            }

            // ── Text block ──
            var textEl = document.createElement('div');
            textEl.style.flex = '1';

            var nameEl = document.createElement('p');
            nameEl.className = 'bkbg-cc-name';
            nameEl.style.color = o.nameColor;
            nameEl.textContent = o.name || '';
            textEl.appendChild(nameEl);

            if (o.jobTitle || o.company) {
                var metaEl = document.createElement('p');
                metaEl.className = 'bkbg-cc-meta';
                metaEl.style.color = o.titleColor;
                metaEl.textContent = [o.jobTitle, o.company].filter(Boolean).join(' · ');
                textEl.appendChild(metaEl);
            }

            // Divider
            if (o.showDivider) {
                var divEl = document.createElement('hr');
                divEl.className = 'bkbg-cc-divider';
                divEl.style.background = o.dividerColor;
                textEl.appendChild(divEl);
            }

            // Contact details
            var contactDetails = [
                { field: 'email',   href: 'mailto:' + o.email },
                { field: 'phone',   href: 'tel:' + o.phone.replace(/\s/g, '') },
                { field: 'address', href: null },
                { field: 'website', href: o.website },
            ];

            var hasContact = contactDetails.some(function (c) { return !!o[c.field]; });
            if (hasContact) {
                var contacts = document.createElement('div');
                contacts.className = 'bkbg-cc-contacts';
                contacts.style.color = o.companyColor;

                contactDetails.forEach(function (c) {
                    if (!o[c.field]) return;
                    var row = document.createElement('div');
                    row.className = 'bkbg-cc-contact-row';

                    var icon = document.createElement('span');
                    icon.className = 'bkbg-cc-contact-icon';
                    icon.textContent = CONTACT_ICONS[c.field] || '';
                    row.appendChild(icon);

                    var valueEl;
                    if (c.href) {
                        valueEl = document.createElement('a');
                        valueEl.className = 'bkbg-cc-contact-link bkbg-cc-contact-value';
                        valueEl.href = c.href;
                        if (c.field === 'website') { valueEl.target = '_blank'; valueEl.rel = 'noopener noreferrer'; }
                        valueEl.textContent = o[c.field];
                    } else {
                        valueEl = document.createElement('span');
                        valueEl.className = 'bkbg-cc-contact-value';
                        valueEl.textContent = o[c.field];
                    }
                    row.appendChild(valueEl);
                    contacts.appendChild(row);
                });
                textEl.appendChild(contacts);
            }

            // Social links
            if (o.showLinks && o.links && o.links.length > 0) {
                var linksRow = document.createElement('div');
                linksRow.className = 'bkbg-cc-links links-' + o.align;

                o.links.forEach(function (lnk) {
                    var a = document.createElement('a');
                    a.className = 'bkbg-cc-link-btn';
                    a.href = lnk.url || '#';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.setAttribute('aria-label', lnk.label || lnk.platform);
                    a.title = lnk.label || lnk.platform;
                    a.textContent = PLATFORM_ICONS[lnk.platform] || '🔗';
                    linksRow.appendChild(a);
                });
                textEl.appendChild(linksRow);
            }

            // ── Assemble ──
            if (isBadge) {
                var badgeInner = document.createElement('div');
                badgeInner.className = 'bkbg-cc-badge-inner align-' + o.align;
                if (avatarEl) badgeInner.appendChild(avatarEl);
                badgeInner.appendChild(textEl);
                body.appendChild(badgeInner);
            } else {
                if (avatarEl) body.appendChild(avatarEl);
                body.appendChild(textEl);
            }

            card.appendChild(body);
            outer.appendChild(card);

            typoCssVarsForEl(o.typoName, '--bkcc-name-', outer);
            typoCssVarsForEl(o.typoMeta, '--bkcc-meta-', outer);

            appEl.parentNode.insertBefore(outer, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
