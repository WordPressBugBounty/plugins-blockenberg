(function () {
    'use strict';

    function halfStarHTML(color) {
        return '<span style="position:relative;display:inline-block;color:#d1d5db;line-height:1;">★<span style="position:absolute;left:0;top:0;width:50%;overflow:hidden;color:' + color + ';">★</span></span>';
    }

    function starsHTML(rating, max, color) {
        var full  = Math.floor(rating);
        var half  = rating - full >= 0.5;
        var empty = max - full - (half ? 1 : 0);
        var out   = '';
        var i;
        for (i = 0; i < full;  i++) out += '<span style="color:' + color + '">★</span>';
        if (half)                    out += halfStarHTML(color);
        for (i = 0; i < empty; i++) out += '<span style="color:#d1d5db">★</span>';
        return out;
    }

    function esc(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

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

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var cRadius = (opts.cardRadius || 16) + 'px';
        var bRadius = (opts.btnRadius  || 8)  + 'px';
        var maxW    = (opts.maxWidth   || 860) + 'px';
        var covW    = (opts.coverWidth || 160) + 'px';
        var titleSz = (opts.titleSize  || 24) + 'px';
        var bodySz  = (opts.bodySize   || 15) + 'px';
        var starClr = opts.starColor  || '#f59e0b';
        var rating  = opts.rating     || 4;
        var maxRat  = opts.maxRating  || 5;

        /* ── Card ── */
        var card = document.createElement('div');
        card.className = 'bkbg-br-card';
        card.style.cssText = [
            'border:1px solid ' + (opts.borderColor || '#e5e7eb'),
            'border-radius:' + cRadius,
            'overflow:hidden',
            'background:' + (opts.cardBg || '#ffffff'),
            'max-width:' + maxW,
            'margin:0 auto',
        ].join(';');

        /* ── Header ── */
        var header = document.createElement('div');
        header.className = 'bkbg-br-header';
        header.style.cssText = 'background:' + (opts.headerBg || '#f5f3ff') + ';padding:28px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap';

        /* Cover */
        if (opts.coverUrl) {
            var img = document.createElement('img');
            img.src = opts.coverUrl;
            img.alt = opts.coverAlt || opts.bookTitle || '';
            img.className = 'bkbg-br-cover';
            img.style.cssText = 'width:' + covW + ';border-radius:8px;display:block;object-fit:cover;flex-shrink:0';
            header.appendChild(img);
        } else {
            var placeholder = document.createElement('div');
            placeholder.className = 'bkbg-br-cover-placeholder';
            placeholder.style.cssText = 'width:' + covW + ';border-radius:8px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:220px;font-size:48px;flex-shrink:0';
            placeholder.textContent = '📖';
            header.appendChild(placeholder);
        }

        /* Meta */
        var meta = document.createElement('div');
        meta.className = 'bkbg-br-meta';
        meta.style.cssText = 'flex:1;min-width:0';

        var titleEl = document.createElement('h2');
        titleEl.className = 'bkbg-br-title';
        titleEl.style.cssText = 'color:' + (opts.titleColor || '#1e1b4b') + ';margin:0 0 4px;';
        titleEl.textContent = opts.bookTitle || '';
        meta.appendChild(titleEl);

        var authorEl = document.createElement('div');
        authorEl.className = 'bkbg-br-author';
        authorEl.style.cssText = 'color:' + (opts.authorColor || '#6c3fb5') + ';font-weight:600;font-size:15px;margin-bottom:12px';
        authorEl.textContent = opts.bookAuthor || '';
        meta.appendChild(authorEl);

        /* Rating */
        var ratingRow = document.createElement('div');
        ratingRow.className = 'bkbg-br-rating-row';
        ratingRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap';

        var starsSpan = document.createElement('span');
        starsSpan.className = 'bkbg-br-stars';
        starsSpan.style.cssText = 'letter-spacing:2px;font-size:22px;line-height:1';
        starsSpan.innerHTML = starsHTML(rating, maxRat, starClr);
        ratingRow.appendChild(starsSpan);

        var ratingLbl = document.createElement('span');
        ratingLbl.className = 'bkbg-br-rating-label';
        ratingLbl.style.cssText = 'font-size:14px;color:#6b7280';
        ratingLbl.textContent = rating + ' / ' + maxRat + (opts.ratingLabel ? ' — ' + opts.ratingLabel : '');
        ratingRow.appendChild(ratingLbl);
        meta.appendChild(ratingRow);

        /* Details */
        if (opts.showDetails !== false) {
            var det = document.createElement('div');
            var rows = [
                ['Genre',     opts.genre],
                ['Publisher', opts.publisher],
                ['Year',      opts.publishYear],
                ['Pages',     opts.pages],
                ['ISBN',      opts.isbn],
            ];
            rows.forEach(function (r) {
                if (!r[1]) return;
                var row = document.createElement('div');
                row.className = 'bkbg-br-detail-row';
                row.innerHTML = '<span class="bkbg-br-detail-label" style="color:' + (opts.detailLabelClr || '#9ca3af') + '">' + esc(r[0]) + ':</span>' +
                    '<span class="bkbg-br-detail-val" style="color:' + (opts.bodyColor || '#374151') + '">' + esc(r[1]) + '</span>';
                det.appendChild(row);
            });
            meta.appendChild(det);
        }

        header.appendChild(meta);
        card.appendChild(header);

        /* ── Body ── */
        var body = document.createElement('div');
        body.className = 'bkbg-br-body';
        body.style.cssText = 'padding:24px 28px;background:' + (opts.cardBg || '#ffffff');

        /* Summary */
        if (opts.summary) {
            var sumHead = document.createElement('p');
            sumHead.className = 'bkbg-br-section-title';
            sumHead.style.color = opts.titleColor || '#1e1b4b';
            sumHead.textContent = 'Review Summary';
            var sumText = document.createElement('div');
            sumText.className = 'bkbg-br-summary';
            sumText.style.cssText = 'color:' + (opts.bodyColor || '#374151') + ';margin-bottom:20px';
            sumText.innerHTML = opts.summary;
            body.appendChild(sumHead);
            body.appendChild(sumText);
        }

        /* Pros / Cons */
        var pros = opts.pros || [];
        var cons = opts.cons || [];
        var hasPros = opts.showPros !== false && pros.length > 0;
        var hasCons = opts.showCons !== false && cons.length > 0;

        if (hasPros || hasCons) {
            var pcGrid = document.createElement('div');
            pcGrid.className = 'bkbg-br-proscons';
            pcGrid.style.cssText = 'display:grid;grid-template-columns:' + (hasPros && hasCons ? '1fr 1fr' : '1fr') + ';gap:20px;margin-bottom:20px';

            function makeList(items, color, icon, label) {
                var col = document.createElement('div');
                var lh = document.createElement('div');
                lh.className = 'bkbg-br-list-head';
                lh.style.cssText = 'font-weight:700;font-size:14px;margin-bottom:8px;color:' + color;
                lh.textContent = icon + ' ' + label;
                col.appendChild(lh);
                var ul = document.createElement('ul');
                ul.className = 'bkbg-br-list';
                items.forEach(function (item) {
                    var li = document.createElement('li');
                    li.style.cssText = 'display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;color:' + (opts.bodyColor || '#374151');
                    li.innerHTML = '<span class="bkbg-br-list-icon" style="color:' + color + ';font-weight:700;flex-shrink:0;margin-top:1px">' + icon + '</span>' +
                        '<span>' + esc(item) + '</span>';
                    ul.appendChild(li);
                });
                col.appendChild(ul);
                return col;
            }

            if (hasPros) pcGrid.appendChild(makeList(pros, opts.prosColor || '#15803d', '✓', 'Pros'));
            if (hasCons) pcGrid.appendChild(makeList(cons, opts.consColor || '#b91c1c', '✗', 'Cons'));
            body.appendChild(pcGrid);
        }

        /* Button */
        if (opts.showBtn !== false && opts.btnText) {
            var btn = document.createElement('a');
            btn.className = 'bkbg-br-btn';
            btn.href    = opts.btnUrl || '#';
            btn.target  = opts.btnTarget !== false ? '_blank' : '_self';
            btn.rel     = opts.btnTarget !== false ? 'noopener noreferrer' : '';
            btn.textContent = opts.btnText;
            btn.style.cssText = [
                'display:inline-block',
                'background:' + (opts.btnBg || '#6c3fb5'),
                'color:' + (opts.btnColor || '#ffffff'),
                'border-radius:' + bRadius,
                'padding:12px 32px',
                'font-weight:700',
                'font-size:15px',
                'text-decoration:none',
            ].join(';');
            body.appendChild(btn);
        }

        card.appendChild(body);
        app.innerHTML = '';
        app.appendChild(card);

        typoCssVarsForEl(opts.typoTitle, '--bkbg-br-title-', app);
        typoCssVarsForEl(opts.typoBody, '--bkbg-br-body-', app);

        /* Schema.org JSON-LD */
        if (opts.showSchema !== false) {
            var schema = {
                '@context': 'https://schema.org',
                '@type': 'Review',
                'reviewRating': { '@type': 'Rating', 'ratingValue': String(opts.rating || 4), 'bestRating': String(opts.maxRating || 5) },
                'itemReviewed': {
                    '@type': 'Book',
                    'name': opts.bookTitle || '',
                    'author': { '@type': 'Person', 'name': opts.bookAuthor || '' },
                    'publisher': opts.publisher ? { '@type': 'Organization', 'name': opts.publisher } : undefined,
                    'datePublished': opts.publishYear || undefined,
                    'numberOfPages': opts.pages || undefined,
                    'isbn': opts.isbn || undefined,
                    'image': opts.coverUrl || undefined,
                },
                'reviewBody': opts.summary || undefined,
            };
            var script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            app.appendChild(script);
        }
    }

    document.querySelectorAll('.bkbg-br-app').forEach(buildApp);
})();
