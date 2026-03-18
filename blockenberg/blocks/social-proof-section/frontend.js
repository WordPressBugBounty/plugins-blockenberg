wp.domReady(function () {
    document.querySelectorAll('.bkbg-sps-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var logos = (opts.logos || []).filter(function (l) { return l.imageUrl; });
        var stats = opts.stats || [];

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-sps-wrap';
        wrap.style.background    = opts.bgColor    || '#f9fafb';
        wrap.style.paddingTop    = (opts.paddingTop    || 64) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 64) + 'px';
        wrap.style.setProperty('--bkbg-sps-divider', opts.dividerColor || '#e5e7eb');

        var inner = document.createElement('div');
        inner.className = 'bkbg-sps-inner';
        inner.style.maxWidth = (opts.maxWidth || 1000) + 'px';

        // Eyebrow
        if (opts.showEyebrow !== false && opts.eyebrow) {
            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-sps-eyebrow';
            eyebrow.style.fontSize = (opts.eyebrowSize || 13) + 'px';
            eyebrow.style.color    = opts.eyebrowColor || '#7c3aed';
            eyebrow.textContent    = opts.eyebrow;
            inner.appendChild(eyebrow);
        }

        // Heading
        if (opts.showHeading && opts.heading) {
            var heading = document.createElement('h2');
            heading.className = 'bkbg-sps-heading';
            heading.style.fontSize = (opts.headingSize || 32) + 'px';
            heading.style.color    = opts.headingColor || '#111827';
            heading.innerHTML      = opts.heading;
            inner.appendChild(heading);
        }

        // Subtext
        if (opts.showSubtext && opts.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-sps-subtext';
            sub.style.fontSize = '18px';
            sub.style.color    = opts.subtextColor || '#6b7280';
            sub.innerHTML      = opts.subtext;
            inner.appendChild(sub);
        }

        // Logos
        if (opts.showLogos !== false && logos.length > 0) {
            var filterClass = opts.logoFilter || 'grayscale-hover';
            var logoStrip = document.createElement('div');
            logoStrip.className = 'bkbg-sps-logos bkbg-sps-logos--' + filterClass;

            logos.forEach(function (logo) {
                var item = document.createElement('div');
                item.className = 'bkbg-sps-logo';
                var img = document.createElement('img');
                img.src    = logo.imageUrl;
                img.alt    = logo.imageAlt || '';
                img.height = opts.logoHeight || 36;
                img.style.height = (opts.logoHeight || 36) + 'px';
                img.loading = 'lazy';
                item.appendChild(img);
                logoStrip.appendChild(item);
            });
            inner.appendChild(logoStrip);
        }

        // Stats
        if (opts.showStats !== false && stats.length > 0) {
            var statsRow = document.createElement('div');
            statsRow.className = 'bkbg-sps-stats';

            stats.forEach(function (stat, i) {
                var statEl = document.createElement('div');
                statEl.className = 'bkbg-sps-stat';

                var val = document.createElement('div');
                val.className = 'bkbg-sps-stat-value';
                val.style.fontSize = (opts.statValueSize || 32) + 'px';
                val.style.color    = opts.statValueColor || '#111827';
                val.textContent    = stat.value || '';
                statEl.appendChild(val);

                var label = document.createElement('div');
                label.className = 'bkbg-sps-stat-label';
                label.style.fontSize = (opts.statLabelSize || 14) + 'px';
                label.style.color    = opts.statLabelColor || '#6b7280';
                label.textContent    = stat.label || '';
                statEl.appendChild(label);

                statsRow.appendChild(statEl);
            });
            inner.appendChild(statsRow);
        }

        // Quote
        if (opts.showQuote !== false && opts.quote) {
            var card = document.createElement('div');
            card.className      = 'bkbg-sps-quote-card';
            card.style.background = opts.quoteBg || '#ffffff';

            var qMark = document.createElement('div');
            qMark.className   = 'bkbg-sps-quote-mark';
            qMark.style.color = opts.accentColor || '#7c3aed';
            qMark.textContent = '\u201C';
            card.appendChild(qMark);

            var qText = document.createElement('p');
            qText.className = 'bkbg-sps-quote-text';
            qText.style.fontSize = (opts.quoteSize || 18) + 'px';
            qText.style.color    = opts.quoteColor || '#1f2937';
            qText.innerHTML      = opts.quote;
            card.appendChild(qText);

            var authorRow = document.createElement('div');
            authorRow.className = 'bkbg-sps-author-row';

            if (opts.quoteAvatarUrl) {
                var av = document.createElement('img');
                av.className = 'bkbg-sps-author-avatar';
                av.src = opts.quoteAvatarUrl;
                av.alt = opts.quoteAuthor || '';
                authorRow.appendChild(av);
            } else {
                var avPh = document.createElement('div');
                avPh.className      = 'bkbg-sps-author-avatar-ph';
                avPh.style.background = (opts.accentColor || '#7c3aed') + '22';
                authorRow.appendChild(avPh);
            }

            var authorInfo = document.createElement('div');
            var authorName = document.createElement('div');
            authorName.className = 'bkbg-sps-author-name';
            authorName.style.color    = opts.authorColor || '#111827';
            authorName.textContent    = opts.quoteAuthor || '';
            authorInfo.appendChild(authorName);

            if (opts.quoteRole) {
                var authorRole = document.createElement('div');
                authorRole.className = 'bkbg-sps-author-role';
                authorRole.style.color    = opts.roleColor || '#6b7280';
                authorRole.textContent    = opts.quoteRole;
                authorInfo.appendChild(authorRole);
            }
            authorRow.appendChild(authorInfo);
            card.appendChild(authorRow);
            inner.appendChild(card);
        }

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
});
