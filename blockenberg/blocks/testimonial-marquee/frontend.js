(function () {
    var AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

    function strHash(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) { h = (h + s.charCodeAt(i)) | 0; }
        return Math.abs(h);
    }

    function buildCard(item, o) {
        var shadow = o.cardShadow === 'sm' ? '0 1px 6px rgba(0,0,0,0.07)'
            : o.cardShadow === 'md' ? '0 4px 16px rgba(0,0,0,0.10)'
            : o.cardShadow === 'lg' ? '0 8px 32px rgba(0,0,0,0.13)' : 'none';

        var card = document.createElement('div');
        card.className = 'bkbg-tm-card';
        card.style.cssText = [
            'width:' + o.cardWidth + 'px',
            'background:' + (o.cardBg || '#fff'),
            'border:1px solid ' + (o.cardBorder || '#e5e7eb'),
            'border-radius:' + o.cardRadius + 'px',
            'padding:' + o.cardPadding + 'px',
            'box-shadow:' + shadow,
            'gap:12px',
        ].join(';');

        // Big quote icon in background
        var qIcon = document.createElement('div');
        qIcon.className = 'bkbg-tm-quote-bg';
        qIcon.textContent = '\u201C';
        qIcon.style.color = o.quoteIconColor || '#e0e7ff';
        card.appendChild(qIcon);

        // Stars
        if (o.showStars) {
            var starsDiv = document.createElement('div');
            starsDiv.className = 'bkbg-tm-stars';
            for (var s = 1; s <= 5; s++) {
                var star = document.createElement('span');
                star.textContent = '\u2605';
                star.style.color = s <= item.rating ? (o.starColor || '#f59e0b') : '#e5e7eb';
                star.style.fontSize = '14px';
                star.style.lineHeight = '1';
                starsDiv.appendChild(star);
            }
            card.appendChild(starsDiv);
        }

        // Quote text
        var quoteEl = document.createElement('p');
        quoteEl.className = 'bkbg-tm-quote';
        quoteEl.textContent = item.quote;
        quoteEl.style.color = o.quoteColor || '#374151';
        card.appendChild(quoteEl);

        // Author row
        var authorRow = document.createElement('div');
        authorRow.className = 'bkbg-tm-author-row';
        authorRow.style.gap = '10px';

        if (o.showAvatar) {
            if (item.avatarUrl) {
                var img = document.createElement('img');
                img.className = 'bkbg-tm-avatar';
                img.src = item.avatarUrl;
                img.alt = item.author;
                img.style.width = o.avatarSize + 'px';
                img.style.height = o.avatarSize + 'px';
                authorRow.appendChild(img);
            } else {
                var initials = (item.author || 'A').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
                var fallback = document.createElement('div');
                fallback.className = 'bkbg-tm-avatar-fallback';
                fallback.textContent = initials;
                fallback.style.width = o.avatarSize + 'px';
                fallback.style.height = o.avatarSize + 'px';
                fallback.style.fontSize = Math.round(o.avatarSize * 0.38) + 'px';
                fallback.style.background = AVATAR_COLORS[strHash(item.author || '') % AVATAR_COLORS.length];
                authorRow.appendChild(fallback);
            }
        }

        var info = document.createElement('div');
        info.className = 'bkbg-tm-author-info';

        var nameEl = document.createElement('div');
        nameEl.className = 'bkbg-tm-author-name';
        nameEl.textContent = item.author;
        nameEl.style.color = o.authorColor || '#111827';
        info.appendChild(nameEl);

        var metaParts = [];
        if (o.showRole && item.role) metaParts.push(item.role);
        if (o.showCompany && item.company) metaParts.push(item.company);
        if (metaParts.length) {
            var metaEl = document.createElement('div');
            metaEl.className = 'bkbg-tm-author-meta';
            metaEl.textContent = metaParts.join(', ');
            metaEl.style.color = o.roleColor || '#6b7280';
            info.appendChild(metaEl);
        }

        authorRow.appendChild(info);
        card.appendChild(authorRow);
        return card;
    }

    function buildTrack(items, o, direction) {
        // Duplicate items for seamless loop
        var allItems = items.concat(items);
        var track = document.createElement('div');
        track.className = 'bkbg-tm-track dir-' + direction;
        track.style.gap = o.cardGap + 'px';
        track.style.animationDuration = o.speed + 's';

        allItems.forEach(function (item) {
            track.appendChild(buildCard(item, o));
        });
        return track;
    }

    function buildRow(items, o, direction) {
        var row = document.createElement('div');
        row.className = 'bkbg-tm-row';
        var viewport = document.createElement('div');
        viewport.className = 'bkbg-tm-viewport' + (o.fadeEdges ? ' fade-edges' : '');
        var track = buildTrack(items, o, direction);
        viewport.appendChild(track);
        row.appendChild(viewport);
        return row;
    }

    function init() {
        document.querySelectorAll('.bkbg-tm-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                items: [],
                rows: 1,
                speed: 60,
                direction: 'left',
                pauseOnHover: true,
                fadeEdges: true,
                showStars: true,
                showAvatar: true,
                showRole: true,
                showCompany: true,
                cardWidth: 340,
                cardGap: 20,
                cardRadius: 14,
                cardPadding: 24,
                quoteSize: 15,
                avatarSize: 44,
                paddingY: 40,
                cardShadow: 'sm',
                wrapperBg: '',
                cardBg: '#ffffff',
                cardBorder: '#e5e7eb',
                quoteColor: '#374151',
                starColor: '#f59e0b',
                authorColor: '#111827',
                roleColor: '#6b7280',
                quoteIconColor: '#e0e7ff',
            }, opts);

            if (!o.items || !o.items.length) return;

            var outer = document.createElement('div');
            outer.className = 'bkbg-tm-outer';
            if (o.wrapperBg) outer.style.background = o.wrapperBg;
            outer.style.padding = o.paddingY + 'px 0';

            var rowGap = o.cardGap;
            if (o.rows === 2) {
                outer.style.display = 'flex';
                outer.style.flexDirection = 'column';
                outer.style.gap = rowGap + 'px';
            }

            // Row 1
            outer.appendChild(buildRow(o.items, o, o.direction));

            // Row 2 — opposite direction
            if (o.rows === 2) {
                var dir2 = o.direction === 'left' ? 'right' : 'left';
                outer.appendChild(buildRow(o.items, o, dir2));
            }

            // Pause on hover
            if (o.pauseOnHover) {
                outer.addEventListener('mouseenter', function () { outer.classList.add('paused'); });
                outer.addEventListener('mouseleave', function () { outer.classList.remove('paused'); });
            }

            appEl.parentNode.insertBefore(outer, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
