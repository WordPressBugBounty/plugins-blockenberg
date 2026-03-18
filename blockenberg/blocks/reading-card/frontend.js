(function () {
    var TYPE_ICONS = { book: '📚', article: '📄', podcast: '🎙️', course: '🎓', video: '🎬' };
    var TYPE_LABELS = { book: 'Book', article: 'Article', podcast: 'Podcast', course: 'Course', video: 'Video' };

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

    document.querySelectorAll('.bkbg-rdc-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var coverUrl = opts.coverUrl || '';
        var coverAlt = opts.coverAlt || '';
        var contentType = opts.contentType || 'book';
        var badge = opts.badge || TYPE_LABELS[contentType] || 'Book';
        var title = opts.title || '';
        var author = opts.author || '';
        var description = opts.description || '';
        var rating = opts.rating !== undefined ? opts.rating : 0;
        var showRating = opts.showRating !== false;
        var ctaLabel = opts.ctaLabel || 'Read more →';
        var ctaUrl = opts.ctaUrl || '#';
        var ctaIsExternal = opts.ctaIsExternal || false;
        var layout = opts.layout || 'horizontal';
        var badgeBg = opts.badgeBg || '#7c3aed';
        var badgeColor = opts.badgeColor || '#ffffff';
        var titleColor = opts.titleColor || '#111827';
        var authorColor = opts.authorColor || '#6b7280';
        var descColor = opts.descColor || '#374151';
        var ratingColor = opts.ratingColor || '#f59e0b';
        var ctaColor = opts.ctaColor || '#7c3aed';
        var bgColor = opts.bgColor || '#ffffff';
        var borderColor = opts.borderColor || '#e5e7eb';
        var borderRadius = opts.borderRadius !== undefined ? opts.borderRadius : 12;
        var coverWidth = opts.coverWidth || 120;
        var maxWidth = opts.maxWidth || 720;
        var paddingTop = opts.paddingTop !== undefined ? opts.paddingTop : 32;
        var paddingBottom = opts.paddingBottom !== undefined ? opts.paddingBottom : 32;

        /* outer wrap */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-rdc-wrap';
        wrap.style.cssText = 'padding-top:' + paddingTop + 'px;padding-bottom:' + paddingBottom + 'px;';
        typoCssVarsForEl(wrap, opts.titleTypo || {}, '--bkrdc-tt-');
        typoCssVarsForEl(wrap, opts.authorTypo || {}, '--bkrdc-at-');
        typoCssVarsForEl(wrap, opts.descTypo || {}, '--bkrdc-dt-');

        /* card */
        var card = document.createElement('div');
        card.className = 'bkbg-rdc-card bkbg-rdc-card--' + layout;
        card.style.cssText = [
            'background:' + bgColor,
            'border-color:' + borderColor,
            'border-radius:' + borderRadius + 'px',
            'max-width:' + maxWidth + 'px'
        ].join(';');
        if (layout === 'minimal') {
            card.style.borderBottomColor = borderColor;
        }

        /* cover */
        if (layout !== 'minimal' && coverUrl) {
            var img = document.createElement('img');
            img.className = 'bkbg-rdc-cover';
            img.src = coverUrl;
            img.alt = coverAlt;
            img.style.cssText = layout === 'vertical'
                ? 'width:100%;height:200px;'
                : 'width:' + coverWidth + 'px;min-width:' + coverWidth + 'px;height:' + Math.round(coverWidth * 1.4) + 'px;';
            card.appendChild(img);
        } else if (layout !== 'minimal' && !coverUrl) {
            var ph = document.createElement('div');
            ph.className = 'bkbg-rdc-cover-placeholder';
            ph.style.cssText = layout === 'vertical'
                ? 'width:100%;height:200px;'
                : 'width:' + coverWidth + 'px;min-width:' + coverWidth + 'px;height:' + Math.round(coverWidth * 1.4) + 'px;';
            ph.textContent = TYPE_ICONS[contentType] || '📚';
            card.appendChild(ph);
        }

        /* content */
        var content = document.createElement('div');
        content.className = 'bkbg-rdc-content';

        /* badge row */
        var bRow = document.createElement('div');
        bRow.className = 'bkbg-rdc-badge-row';
        var b = document.createElement('span');
        b.className = 'bkbg-rdc-badge';
        b.style.cssText = 'background:' + badgeBg + ';color:' + badgeColor;
        b.textContent = badge.toUpperCase();
        bRow.appendChild(b);
        if (layout !== 'minimal') {
            var ico = document.createElement('span');
            ico.className = 'bkbg-rdc-type-icon';
            ico.textContent = TYPE_ICONS[contentType] || '📚';
            bRow.appendChild(ico);
        }
        content.appendChild(bRow);

        /* title */
        var t = document.createElement('h3');
        t.className = 'bkbg-rdc-title';
        if (titleColor) t.style.color = titleColor;
        t.textContent = title;
        content.appendChild(t);

        /* author */
        var a = document.createElement('p');
        a.className = 'bkbg-rdc-author';
        if (authorColor) a.style.color = authorColor;
        a.textContent = author;
        content.appendChild(a);

        /* rating */
        if (showRating && rating > 0 && layout !== 'minimal') {
            var rRow = document.createElement('div');
            rRow.className = 'bkbg-rdc-rating';
            for (var s = 0; s < 5; s++) {
                var star = document.createElement('span');
                star.className = 'bkbg-rdc-star';
                star.style.color = s < rating ? ratingColor : '#d1d5db';
                star.textContent = '★';
                rRow.appendChild(star);
            }
            content.appendChild(rRow);
        }

        /* description */
        if (description && layout !== 'minimal') {
            var d = document.createElement('p');
            d.className = 'bkbg-rdc-desc';
            if (descColor) d.style.color = descColor;
            d.textContent = description;
            content.appendChild(d);
        }

        /* cta */
        var cta = document.createElement('a');
        cta.className = 'bkbg-rdc-cta';
        cta.href = ctaUrl;
        cta.style.color = ctaColor;
        if (ctaIsExternal) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
        cta.textContent = ctaLabel;
        content.appendChild(cta);

        card.appendChild(content);
        wrap.appendChild(card);
        app.replaceWith(wrap);
    });
})();
