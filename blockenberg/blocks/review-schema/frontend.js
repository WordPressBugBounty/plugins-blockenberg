(function () {
    'use strict';

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

    function buildStars(rating, best, starSize, starColor, starEmpty) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-rs-stars';
        for (var i = 1; i <= best; i++) {
            var s = document.createElement('span');
            s.className = 'bkbg-rs-star';
            s.style.fontSize = starSize + 'px';
            s.style.color    = i <= Math.round(rating) ? starColor : starEmpty;
            s.textContent    = i <= Math.round(rating) ? '★' : '☆';
            wrap.appendChild(s);
        }
        return wrap;
    }

    document.querySelectorAll('.bkbg-rs-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var itemName      = o.itemName      || 'Our Product';
        var itemType      = o.itemType      || 'Product';
        var description   = o.description   || '';
        var imageUrl      = o.imageUrl      || '';
        var ratingValue   = o.ratingValue   || 4.8;
        var ratingCount   = o.ratingCount   || 127;
        var bestRating    = o.bestRating    || 5;
        var worstRating   = o.worstRating   || 1;
        var reviews       = Array.isArray(o.reviews) ? o.reviews : [];
        var showReviews   = !!o.showReviews;
        var showSchema    = !!o.showSchema;
        var starSize      = o.starSize      || 32;
        var reviewColumns = o.reviewColumns || 3;
        var cardRadius    = o.cardRadius    || 16;
        var starColor     = o.starColor     || '#f59e0b';
        var starEmpty     = o.starEmpty     || '#e2e8f0';
        var bgColor       = o.bgColor       || '#ffffff';
        var cardBg        = o.cardBg        || '#f8fafc';
        var cardBorder    = o.cardBorder    || '#e2e8f0';
        var headingColor  = o.headingColor  || '#0f172a';
        var bodyColor     = o.bodyColor     || '#475569';
        var authorColor   = o.authorColor   || '#64748b';
        var ratingSize    = o.ratingSize    || 56;
        var sectionBg     = o.sectionBg     || '';

        if (sectionBg) app.style.background = sectionBg;

        typoCssVarsForEl(app, o.headingTypo, '--bkrs-ht-');
        typoCssVarsForEl(app, o.bodyTypo, '--bkrs-bt-');

        var inner = document.createElement('div');
        if (sectionBg) { inner.style.padding = '40px'; }

        /* ── Aggregate summary ── */
        var summary = document.createElement('div');
        summary.className = 'bkbg-rs-summary';
        summary.style.background   = bgColor;
        summary.style.borderRadius = cardRadius + 'px';
        summary.style.border       = '1px solid ' + cardBorder;
        summary.style.padding      = '32px';
        summary.style.marginBottom = '32px';

        var nameEl = document.createElement('h3');
        nameEl.className   = 'bkbg-rs-item-name';
        nameEl.style.color = headingColor;
        nameEl.textContent = itemName;
        summary.appendChild(nameEl);

        summary.appendChild(buildStars(ratingValue, bestRating, starSize, starColor, starEmpty));

        var rv = document.createElement('div');
        rv.className  = 'bkbg-rs-rating-value';
        rv.style.fontSize = ratingSize + 'px';
        rv.style.color    = headingColor;
        rv.textContent    = ratingValue.toFixed(1);
        summary.appendChild(rv);

        var countEl = document.createElement('p');
        countEl.className  = 'bkbg-rs-count';
        countEl.style.color = authorColor;
        countEl.textContent = 'Based on ' + ratingCount + ' reviews';
        summary.appendChild(countEl);

        inner.appendChild(summary);

        /* ── Review cards ── */
        if (showReviews && reviews.length > 0) {
            var grid = document.createElement('div');
            grid.className = 'bkbg-rs-grid';
            grid.style.gridTemplateColumns = 'repeat(' + reviewColumns + ', 1fr)';

            reviews.forEach(function (r) {
                var card = document.createElement('div');
                card.className         = 'bkbg-rs-card';
                card.style.background  = cardBg;
                card.style.border      = '1px solid ' + cardBorder;
                card.style.borderRadius = cardRadius + 'px';

                var cardStars = buildStars(r.rating || 5, bestRating, 18, starColor, starEmpty);
                cardStars.className = 'bkbg-rs-card-stars';
                card.appendChild(cardStars);

                var body = document.createElement('p');
                body.className  = 'bkbg-rs-body';
                body.style.color = bodyColor;
                body.textContent = r.body || '';
                card.appendChild(body);

                var meta = document.createElement('div');
                meta.className = 'bkbg-rs-meta';

                var author = document.createElement('strong');
                author.className  = 'bkbg-rs-author';
                author.style.color = headingColor;
                author.textContent = r.author || '';

                var date = document.createElement('span');
                date.className  = 'bkbg-rs-date';
                date.style.color = authorColor;
                date.textContent = r.date || '';

                meta.appendChild(author);
                meta.appendChild(date);
                card.appendChild(meta);

                grid.appendChild(card);
            });

            inner.appendChild(grid);
        }

        app.appendChild(inner);

        /* ── JSON-LD Schema ── */
        if (showSchema) {
            var schema = {
                '@context': 'https://schema.org',
                '@type': itemType,
                'name': itemName
            };

            if (description) schema['description'] = description;
            if (imageUrl)    schema['image']       = imageUrl;

            schema['aggregateRating'] = {
                '@type': 'AggregateRating',
                'ratingValue': String(ratingValue),
                'reviewCount': String(ratingCount),
                'bestRating':  String(bestRating),
                'worstRating': String(worstRating)
            };

            if (reviews.length > 0) {
                schema['review'] = reviews.map(function (r) {
                    return {
                        '@type': 'Review',
                        'author': { '@type': 'Person', 'name': r.author || '' },
                        'datePublished': r.date || '',
                        'reviewBody': r.body || '',
                        'reviewRating': {
                            '@type': 'Rating',
                            'ratingValue': String(r.rating || 5),
                            'bestRating':  String(bestRating),
                            'worstRating': String(worstRating)
                        }
                    };
                });
            }

            var script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    });
}());
