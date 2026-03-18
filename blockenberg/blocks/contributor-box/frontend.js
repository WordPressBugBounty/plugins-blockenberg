(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function initials(name) {
        return (name || '?').split(' ').map(function (w) { return w[0] || ''; }).filter(Boolean).slice(0, 2).join('').toUpperCase();
    }

    function buildAvatar(c, sz, o) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ctb-avatar';
        wrap.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;overflow:hidden;flex-shrink:0;';
        if (c.avatarUrl) {
            var img = document.createElement('img');
            img.src = c.avatarUrl;
            img.alt = esc(c.name || '');
            img.loading = 'lazy';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;';
            wrap.appendChild(img);
        } else {
            var init = document.createElement('div');
            init.className = 'bkbg-ctb-avatar-initials';
            init.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + o.avatarBg + ';color:' + o.avatarColor + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:' + Math.round(sz * 0.35) + 'px;';
            init.textContent = initials(c.name);
            wrap.appendChild(init);
        }
        return wrap;
    }

    function init() {
        document.querySelectorAll('.bkbg-ctb-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                label: 'Written by',
                showLabel: true,
                contributors: [],
                layout: 'grid',
                showBio: true,
                showSocial: true,
                avatarSize: 60,
                bgColor: '#f8fafc',
                borderColor: '#e2e8f0',
                cardBg: '#ffffff',
                cardBorder: '#e2e8f0',
                labelColor: '#94a3b8',
                avatarBg: '#e2e8f0',
                avatarColor: '#64748b',
                nameColor: '#0f172a',
                titleColor: '#64748b',
                bioColor: '#475569',
                socialColor: '#94a3b8',
                accentColor: '#2563eb',
                borderRadius: 12,
                cardRadius: 8,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-ctb-wrap';
            wrap.style.cssText = [
                'background:' + o.bgColor,
                'border-radius:' + o.borderRadius + 'px',
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px'
            ].join(';');

            typoCssVarsForEl(o.typoName, '--bkbg-ctb-name-', wrap);
            typoCssVarsForEl(o.typoRole, '--bkbg-ctb-role-', wrap);
            typoCssVarsForEl(o.typoBio, '--bkbg-ctb-bio-', wrap);

            if (o.showLabel && o.label) {
                var labelEl = document.createElement('div');
                labelEl.className = 'bkbg-ctb-label';
                labelEl.style.color = o.labelColor;
                labelEl.textContent = o.label;
                wrap.appendChild(labelEl);
            }

            var isCompact = o.layout === 'compact';
            var isList = o.layout === 'list';
            var container = document.createElement('div');
            container.className = isCompact ? 'bkbg-ctb-compact' : isList ? 'bkbg-ctb-list' : 'bkbg-ctb-grid';

            (o.contributors || []).forEach(function (c) {
                var sz = o.avatarSize || 60;
                var avatar = buildAvatar(c, sz, o);

                if (isCompact) {
                    var item = document.createElement('div');
                    item.className = 'bkbg-ctb-compact-item';
                    item.title = c.name + (c.title ? ' — ' + c.title : '');
                    item.appendChild(avatar);
                    var compNameEl = document.createElement('div');
                    compNameEl.className = 'bkbg-ctb-compact-name';
                    compNameEl.style.cssText = 'color:' + o.nameColor + ';max-width:' + sz + 'px;';
                    compNameEl.textContent = c.name || '';
                    item.appendChild(compNameEl);
                    container.appendChild(item);
                    return;
                }

                var card = document.createElement('div');
                card.className = 'bkbg-ctb-card';
                card.style.cssText = 'background:' + o.cardBg + ';border:1px solid ' + o.cardBorder + ';border-radius:' + o.cardRadius + 'px;';

                if (o.layout !== 'grid') {
                    card.style.display = 'flex';
                    card.style.alignItems = 'flex-start';
                    card.style.gap = '14px';
                } else {
                    avatar.style.marginBottom = '10px';
                }
                card.appendChild(avatar);

                var body = document.createElement('div');
                body.className = 'bkbg-ctb-body';
                body.style.flex = '1';

                var nameEl = document.createElement('p');
                nameEl.className = 'bkbg-ctb-name';
                nameEl.style.color = o.nameColor;
                nameEl.textContent = c.name || '';
                body.appendChild(nameEl);

                if (c.title) {
                    var roleEl = document.createElement('p');
                    roleEl.className = 'bkbg-ctb-title';
                    roleEl.style.color = o.titleColor;
                    roleEl.textContent = c.title;
                    body.appendChild(roleEl);
                }

                if (o.showBio && c.bio) {
                    var bioEl = document.createElement('p');
                    bioEl.className = 'bkbg-ctb-bio';
                    bioEl.style.color = o.bioColor;
                    bioEl.textContent = c.bio;
                    body.appendChild(bioEl);
                }

                if (o.showSocial && (c.twitter || c.linkedin || c.website)) {
                    var social = document.createElement('div');
                    social.className = 'bkbg-ctb-social';

                    function socialLink(url, label) {
                        if (!url) return;
                        var a = document.createElement('a');
                        a.className = 'bkbg-ctb-social-link';
                        a.href = url;
                        a.textContent = label;
                        a.style.color = o.accentColor;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        social.appendChild(a);
                    }

                    socialLink(c.twitter, '𝕏 Twitter');
                    socialLink(c.linkedin, 'LinkedIn');
                    socialLink(c.website, '🌐 Website');
                    body.appendChild(social);
                }

                card.appendChild(body);
                container.appendChild(card);
            });

            wrap.appendChild(container);
            el.parentNode.insertBefore(wrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
