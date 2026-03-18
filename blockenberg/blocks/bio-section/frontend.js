wp.domReady(function () {
    var SOCIAL_ICONS = { twitter: '𝕏', linkedin: 'in', instagram: '◉', website: '🌐', youtube: '▶', tiktok: '♪', facebook: 'f' };

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
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    document.querySelectorAll('.bkbg-bios-app').forEach(function (el) {
        var a = JSON.parse(el.dataset.opts || '{}');
        var isCentered = a.layout === 'centered';
        var isRight = a.layout === 'image-right';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-bios-wrap';
        wrap.style.background = a.bgColor || '#ffffff';
        wrap.style.paddingTop = (a.paddingTop || 80) + 'px';
        wrap.style.paddingBottom = (a.paddingBottom || 80) + 'px';

        var inner = document.createElement('div');
        inner.className = 'bkbg-bios-inner' + (isCentered ? ' bkbg-bios-inner--centered' : isRight ? ' bkbg-bios-inner--right' : '');
        inner.style.maxWidth = (a.maxWidth || 1060) + 'px';
        inner.style.margin = '0 auto';
        inner.style.padding = '0 24px';

        /* === Photo === */
        var photoWrap = document.createElement('div');
        photoWrap.className = 'bkbg-bios-photo-wrap';
        photoWrap.style.width = (isCentered ? 280 : (a.imageWidth || 380)) + 'px';
        if (isCentered) { photoWrap.style.margin = '0 auto 32px'; }

        if (a.showDecorator) {
            var deco = document.createElement('div');
            deco.className = 'bkbg-bios-decorator';
            deco.style.background = a.decoratorColor || '#f3f0ff';
            deco.style.borderRadius = ((a.imageRadius || 16) + 16) + 'px';
            photoWrap.appendChild(deco);
        }

        var shapeRadius = '';
        if (a.imageShape === 'circle') shapeRadius = '50%';
        else if (a.imageShape === 'rounded') shapeRadius = (a.imageRadius || 16) + 'px';

        if (a.imageUrl) {
            var photo = document.createElement('img');
            photo.src = a.imageUrl;
            photo.alt = a.imageAlt || '';
            photo.className = 'bkbg-bios-photo bkbg-bios-photo--' + (a.imageShape || 'rounded');
            if (shapeRadius) { photo.style.borderRadius = shapeRadius; }
            photoWrap.appendChild(photo);
        } else {
            var placeholder = document.createElement('div');
            placeholder.className = 'bkbg-bios-photo-placeholder bkbg-bios-photo--' + (a.imageShape || 'rounded');
            if (shapeRadius) { placeholder.style.borderRadius = shapeRadius; }
            placeholder.textContent = '🧑';
            photoWrap.appendChild(placeholder);
        }

        /* === Text === */
        var textEl = document.createElement('div');
        textEl.className = 'bkbg-bios-text';
        textEl.style.flex = '1';

        var nameEl = document.createElement('h2');
        nameEl.className = 'bkbg-bios-name';
        nameEl.style.cssText = 'color:' + (a.nameColor || '#111827') + ';margin:0 0 6px;';
        nameEl.innerHTML = a.name || '';
        textEl.appendChild(nameEl);

        var titleEl = document.createElement('p');
        titleEl.className = 'bkbg-bios-title';
        titleEl.style.cssText = 'color:' + (a.titleColor || '#7c3aed') + ';margin:0 0 8px;';
        titleEl.innerHTML = a.title || '';
        textEl.appendChild(titleEl);

        if (a.showSubtitle && a.subtitle) {
            var subEl = document.createElement('p');
            subEl.className = 'bkbg-bios-subtitle';
            subEl.style.cssText = 'color:' + (a.subtitleColor || '#6b7280') + ';margin:0 0 20px;';
            subEl.innerHTML = a.subtitle;
            textEl.appendChild(subEl);
        }

        if (a.showCredentials && a.credentials && a.credentials.length) {
            var credWrap = document.createElement('div');
            credWrap.className = 'bkbg-bios-credentials' + (isCentered ? ' bkbg-bios-credentials--centered' : '');
            a.credentials.forEach(function (c) {
                if (!c.text) return;
                var chip = document.createElement('span');
                chip.className = 'bkbg-bios-credential';
                chip.style.background = a.credentialBg || '#f3f0ff';
                chip.style.color = a.credentialColor || '#5b21b6';
                chip.innerHTML = c.text;
                credWrap.appendChild(chip);
            });
            textEl.appendChild(credWrap);
        }

        if (a.bio) {
            var bioEl = document.createElement('div');
            bioEl.className = 'bkbg-bios-bio';
            bioEl.style.cssText = 'color:' + (a.bioColor || '#374151') + ';margin-bottom:20px;';
            bioEl.innerHTML = a.bio;
            textEl.appendChild(bioEl);
        }

        if (a.showQuote && a.highlightQuote) {
            var quoteEl = document.createElement('blockquote');
            quoteEl.className = 'bkbg-bios-quote';
            quoteEl.style.borderLeftColor = a.quoteBorderColor || '#7c3aed';
            var quoteP = document.createElement('p');
            quoteP.style.cssText = 'color:' + (a.quoteColor || '#111827') + ';margin:0;';
            quoteP.innerHTML = a.highlightQuote;
            quoteEl.appendChild(quoteP);
            textEl.appendChild(quoteEl);
        }

        /* Actions row */
        var actionsEl = document.createElement('div');
        actionsEl.className = 'bkbg-bios-actions';

        if (a.ctaEnabled && a.ctaLabel) {
            var ctaEl = document.createElement('a');
            ctaEl.className = 'bkbg-bios-cta';
            ctaEl.href = a.ctaUrl || '#';
            ctaEl.style.background = a.ctaBg || '#7c3aed';
            ctaEl.style.color = a.ctaColor || '#ffffff';
            if (a.ctaIsExternal) { ctaEl.target = '_blank'; ctaEl.rel = 'noopener noreferrer'; }
            ctaEl.innerHTML = a.ctaLabel;
            actionsEl.appendChild(ctaEl);
        }

        if (a.showSocials && a.socials && a.socials.length) {
            var socialsEl = document.createElement('div');
            socialsEl.className = 'bkbg-bios-socials';
            a.socials.forEach(function (s) {
                if (!s.url) return;
                var link = document.createElement('a');
                link.className = 'bkbg-bios-social-link';
                link.href = s.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.title = s.label || s.platform;
                link.style.color = a.socialColor || '#6b7280';
                link.textContent = SOCIAL_ICONS[s.platform] || (s.platform ? s.platform[0].toUpperCase() : '?');
                socialsEl.appendChild(link);
            });
            actionsEl.appendChild(socialsEl);
        }

        textEl.appendChild(actionsEl);

        inner.appendChild(photoWrap);
        inner.appendChild(textEl);
        wrap.appendChild(inner);
        typoCssVarsForEl(a.typoName, '--bkbg-bios-name-', wrap);
        typoCssVarsForEl(a.typoTitle, '--bkbg-bios-title-', wrap);
        typoCssVarsForEl(a.typoSubtitle, '--bkbg-bios-subtitle-', wrap);
        typoCssVarsForEl(a.typoBio, '--bkbg-bios-bio-', wrap);
        typoCssVarsForEl(a.typoQuote, '--bkbg-bios-quote-', wrap);
        el.replaceWith(wrap);
    });
});
