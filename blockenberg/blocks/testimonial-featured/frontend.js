(function () {
    'use strict';

    document.querySelectorAll('.bkbg-tft-app').forEach(function (root) {
        var a;
        try { a = JSON.parse(root.dataset.opts || '{}'); } catch (e) { return; }

        var isDark = a.cardStyle === 'dark';
        var isCard = a.cardStyle === 'card';
        var bg = a.bgColor || '#ffffff';
        var cardBgVal = isDark ? '#1f2937' : isCard ? (a.cardBg || '#f9fafb') : 'transparent';
        var borderVal = isCard ? (a.borderColor || '#e5e7eb') : 'transparent';
        var quoteTxtColor = isDark ? '#ffffff' : (a.textColor || '#111827');
        var nameTxtColor = isDark ? '#f9fafb' : (a.nameColor || '#111827');
        var titleTxtColor = isDark ? '#9ca3af' : (a.titleColor || '#6b7280');
        var centered = (a.layout || 'centered') === 'centered';
        var sideBySide = a.layout === 'side-by-side';
        var maxW = a.maxWidth || 860;
        var ptop = a.paddingTop !== undefined ? a.paddingTop : 80;
        var pbot = a.paddingBottom !== undefined ? a.paddingBottom : 80;
        var avatarSz = a.avatarSize || 64;
        var qmSize = a.quotemarkSize || 120;

        // === Outer wrap ===
        root.style.backgroundColor = bg;
        root.style.paddingTop = ptop + 'px';
        root.style.paddingBottom = pbot + 'px';

        // === Inner container ===
        var inner = document.createElement('div');
        inner.className = 'bkbg-tft-inner' + (sideBySide ? ' bkbg-tft-inner--side' : '');
        inner.style.maxWidth = maxW + 'px';
        if (centered && !sideBySide) inner.style.textAlign = 'center';

        // === Card === 
        var card = document.createElement('div');
        var cardClass = 'bkbg-tft-card';
        if (isCard) cardClass += ' bkbg-tft-card--card';
        if (isDark) cardClass += ' bkbg-tft-card--dark';
        card.className = cardClass;
        card.style.backgroundColor = cardBgVal;
        if (isCard) card.style.borderColor = borderVal;

        // === Decorative quotemark ===
        if (a.showQuotemark !== false) {
            var qm = document.createElement('span');
            qm.className = 'bkbg-tft-quotemark';
            qm.textContent = '\u201C';
            qm.style.fontSize = qmSize + 'px';
            qm.style.color = a.quotemarkColor || '#ede9fe';
            card.appendChild(qm);
        }

        var content = document.createElement('div');
        content.className = 'bkbg-tft-content';

        // === Side-by-side: separate column for avatar ===
        var sideAvatarCol = null;
        if (sideBySide) {
            sideAvatarCol = document.createElement('div');
            sideAvatarCol.className = 'bkbg-tft-side-avatar';
        }

        // === Company logo ===
        if ((a.showCompanyLogo !== false) && a.companyLogoUrl) {
            var cLogo = document.createElement('img');
            cLogo.className = 'bkbg-tft-company-logo';
            cLogo.src = a.companyLogoUrl;
            cLogo.alt = a.companyLogoAlt || '';
            content.appendChild(cLogo);
        }

        // === Stars ===
        if (a.showRating !== false) {
            var starsRow = document.createElement('div');
            starsRow.className = 'bkbg-tft-stars';
            if (centered && !sideBySide) starsRow.style.justifyContent = 'center';
            for (var s = 1; s <= 5; s++) {
                var star = document.createElement('span');
                star.textContent = '\u2605';
                star.style.fontSize = '20px';
                star.style.color = s <= (a.rating || 5) ? (a.starColor || '#f59e0b') : '#d1d5db';
                starsRow.appendChild(star);
            }
            content.appendChild(starsRow);
        }

        // === Quote ===
        var quote = document.createElement('blockquote');
        quote.className = 'bkbg-tft-quote';
        quote.style.color = quoteTxtColor;
        quote.innerHTML = a.quote || '';
        content.appendChild(quote);

        // === Attribution row ===
        var attrRow = document.createElement('div');
        attrRow.className = 'bkbg-tft-attribution';
        if (centered && !sideBySide) attrRow.style.justifyContent = 'center';

        if (!sideBySide) {
            // Avatar inline
            var avatarEl;
            if (a.personAvatarUrl) {
                avatarEl = document.createElement('img');
                avatarEl.className = 'bkbg-tft-avatar';
                avatarEl.src = a.personAvatarUrl;
                avatarEl.alt = a.personAvatarAlt || a.personName || '';
                avatarEl.style.width = avatarSz + 'px';
                avatarEl.style.height = avatarSz + 'px';
            } else {
                avatarEl = document.createElement('div');
                avatarEl.className = 'bkbg-tft-avatar-placeholder';
                avatarEl.style.width = avatarSz + 'px';
                avatarEl.style.height = avatarSz + 'px';
                avatarEl.textContent = '\ud83e\uddd1';
            }
            attrRow.appendChild(avatarEl);
        }

        // Name + title
        var personInfo = document.createElement('div');

        var nameEl = document.createElement('p');
        nameEl.className = 'bkbg-tft-name';
        nameEl.style.color = nameTxtColor;
        nameEl.textContent = a.personName || '';
        personInfo.appendChild(nameEl);

        var titleEl = document.createElement('p');
        titleEl.className = 'bkbg-tft-title';
        titleEl.style.color = titleTxtColor;
        titleEl.textContent = a.personTitle || '';
        personInfo.appendChild(titleEl);
        attrRow.appendChild(personInfo);

        // Result metric badge
        if (a.showResultMetric && a.resultMetric) {
            var badge = document.createElement('span');
            badge.className = 'bkbg-tft-result';
            badge.style.backgroundColor = a.resultBg || '#f0fdf4';
            badge.style.color = a.resultColor || '#15803d';
            badge.textContent = a.resultMetric;
            if (centered && !sideBySide) badge.style.marginLeft = '0';
            attrRow.appendChild(badge);
        }

        content.appendChild(attrRow);
        card.appendChild(content);

        // Side-by-side: avatar in separate left column
        if (sideBySide && sideAvatarCol) {
            var sideAvatar;
            if (a.personAvatarUrl) {
                sideAvatar = document.createElement('img');
                sideAvatar.className = 'bkbg-tft-avatar';
                sideAvatar.src = a.personAvatarUrl;
                sideAvatar.alt = a.personAvatarAlt || a.personName || '';
                sideAvatar.style.width = '120px';
                sideAvatar.style.height = '120px';
            } else {
                sideAvatar = document.createElement('div');
                sideAvatar.className = 'bkbg-tft-avatar-placeholder';
                sideAvatar.style.width = '120px';
                sideAvatar.style.height = '120px';
                sideAvatar.style.fontSize = '40px';
                sideAvatar.textContent = '\ud83e\uddd1';
            }
            sideAvatarCol.appendChild(sideAvatar);

            var sideNameEl = document.createElement('p');
            sideNameEl.className = 'bkbg-tft-name';
            sideNameEl.style.color = nameTxtColor;
            sideNameEl.textContent = a.personName || '';
            sideAvatarCol.appendChild(sideNameEl);

            var sideTitleEl = document.createElement('p');
            sideTitleEl.className = 'bkbg-tft-title';
            sideTitleEl.style.color = titleTxtColor;
            sideTitleEl.textContent = a.personTitle || '';
            sideAvatarCol.appendChild(sideTitleEl);

            card.insertBefore(sideAvatarCol, content);
        }

        inner.appendChild(card);
        root.appendChild(inner);
    });
})();
