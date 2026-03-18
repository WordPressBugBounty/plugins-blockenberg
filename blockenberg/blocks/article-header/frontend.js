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

    document.querySelectorAll('.bkbg-arh-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var category = opts.category || '';
        var categoryColor = opts.categoryColor || '#ffffff';
        var categoryBg = opts.categoryBg || '#7c3aed';
        var showCategory = opts.showCategory !== false;
        var headline = opts.headline || '';
        var subheadline = opts.subheadline || '';
        var showSubheadline = opts.showSubheadline !== false;
        var headlineTag = opts.headlineTag || 'h1';
        var headlineSize = opts.headlineSize || 48;
        var authorName = opts.authorName || '';
        var authorRole = opts.authorRole || '';
        var authorAvatarUrl = opts.authorAvatarUrl || '';
        var publishDate = opts.publishDate || '';
        var readingTime = opts.readingTime || '';
        var showAuthor = opts.showAuthor !== false;
        var showDate = opts.showDate !== false;
        var showReadingTime = opts.showReadingTime !== false;
        var heroImageUrl = opts.heroImageUrl || '';
        var heroImageAlt = opts.heroImageAlt || '';
        var showHeroImage = opts.showHeroImage !== false;
        var heroRadius = opts.heroRadius !== undefined ? opts.heroRadius : 12;
        var layout = opts.layout || 'simple';
        var bgColor = opts.bgColor || '#ffffff';
        var headlineColor = opts.headlineColor || '#111827';
        var subColor = opts.subColor || '#6b7280';
        var metaColor = opts.metaColor || '#9ca3af';
        var dividerColor = opts.dividerColor || '#e5e7eb';
        var subSize = opts.subSize || 20;
        var maxWidth = opts.maxWidth || 860;
        var paddingTop = opts.paddingTop !== undefined ? opts.paddingTop : 64;
        var paddingBottom = opts.paddingBottom !== undefined ? opts.paddingBottom : 48;
        var isCentered = layout === 'centered';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-arh-wrap';
        wrap.style.cssText = 'background:' + bgColor + ';padding-top:' + paddingTop + 'px;padding-bottom:' + paddingBottom + 'px;';
        wrap.style.setProperty('--bkbg-arh-headline-sz', headlineSize + 'px');
        wrap.style.setProperty('--bkbg-arh-sub-sz', subSize + 'px');
        typoCssVarsForEl(opts.headlineTypo, '--bkbg-arh-headline-', wrap);
        typoCssVarsForEl(opts.subTypo, '--bkbg-arh-sub-', wrap);

        var inner = document.createElement('div');
        inner.className = 'bkbg-arh-inner' + (isCentered ? ' bkbg-arh-inner--centered' : '');
        inner.style.cssText = 'max-width:' + maxWidth + 'px;';
        wrap.appendChild(inner);

        /* category */
        if (showCategory && category) {
            var catRow = document.createElement('div');
            catRow.className = 'bkbg-arh-category-row';
            var cat = document.createElement('span');
            cat.className = 'bkbg-arh-category';
            cat.style.cssText = 'background:' + categoryBg + ';color:' + categoryColor;
            cat.textContent = category;
            catRow.appendChild(cat);
            inner.appendChild(catRow);
        }

        /* headline */
        if (headline) {
            var h = document.createElement(headlineTag);
            h.className = 'bkbg-arh-headline';
            h.style.color = headlineColor;
            h.textContent = headline;
            inner.appendChild(h);
        }

        /* subheadline */
        if (showSubheadline && subheadline) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-arh-sub';
            sub.style.color = subColor;
            sub.textContent = subheadline;
            inner.appendChild(sub);
        }

        /* meta bar */
        if (showAuthor || showDate || showReadingTime) {
            var meta = document.createElement('div');
            meta.className = 'bkbg-arh-meta';
            meta.style.borderTopColor = dividerColor;

            if (showAuthor) {
                var authorWrap = document.createElement('div');
                authorWrap.className = 'bkbg-arh-author';

                if (authorAvatarUrl) {
                    var av = document.createElement('img');
                    av.className = 'bkbg-arh-avatar';
                    av.src = authorAvatarUrl;
                    av.alt = authorName;
                    authorWrap.appendChild(av);
                } else {
                    var avPh = document.createElement('div');
                    avPh.className = 'bkbg-arh-avatar-placeholder';
                    avPh.textContent = '👤';
                    authorWrap.appendChild(avPh);
                }

                var authorInfo = document.createElement('div');
                var nameEl = document.createElement('p');
                nameEl.className = 'bkbg-arh-author-name';
                nameEl.style.color = headlineColor;
                nameEl.textContent = authorName;
                authorInfo.appendChild(nameEl);
                if (authorRole) {
                    var roleEl = document.createElement('p');
                    roleEl.className = 'bkbg-arh-author-role';
                    roleEl.style.color = metaColor;
                    roleEl.textContent = authorRole;
                    authorInfo.appendChild(roleEl);
                }
                authorWrap.appendChild(authorInfo);
                meta.appendChild(authorWrap);
            }

            if (showDate || showReadingTime) {
                var aside = document.createElement('div');
                aside.className = 'bkbg-arh-meta-aside';
                aside.style.color = metaColor;

                if (showDate && publishDate) {
                    var dateEl = document.createElement('span');
                    dateEl.textContent = publishDate;
                    aside.appendChild(dateEl);
                }
                if (showDate && showReadingTime && publishDate && readingTime) {
                    var sep = document.createElement('span');
                    sep.className = 'bkbg-arh-sep';
                    sep.textContent = '·';
                    aside.appendChild(sep);
                }
                if (showReadingTime && readingTime) {
                    var rtEl = document.createElement('span');
                    rtEl.textContent = readingTime;
                    aside.appendChild(rtEl);
                }
                meta.appendChild(aside);
            }
            inner.appendChild(meta);
        }

        /* hero image */
        if (showHeroImage && heroImageUrl) {
            var hero = document.createElement('img');
            hero.className = 'bkbg-arh-hero';
            hero.src = heroImageUrl;
            hero.alt = heroImageAlt;
            hero.style.borderRadius = heroRadius + 'px';
            inner.appendChild(hero);
        }

        app.replaceWith(wrap);
    });
})();
