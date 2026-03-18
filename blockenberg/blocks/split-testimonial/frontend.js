(function () {
    var _typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform']
    ];
    var _sizeKeys = [['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m']];
    var _lhKeys   = [['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m']];
    var _lsKeys   = [['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m']];
    var _wsKeys   = [['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']];
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        var all = _typoKeys.concat(_sizeKeys,_lhKeys,_lsKeys,_wsKeys);
        for (var i = 0; i < all.length; i++) {
            var v = obj[all[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + '-' + all[i][1], String(v));
        }
    }

    document.querySelectorAll('.bkbg-split-testimonial-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-split-testimonial-wrap';
        wrap.style.cssText = 'background:' + (opts.bgColor || '#1e1b4b') + ';padding:' + (opts.paddingTop || 80) + 'px 40px ' + (opts.paddingBottom || 80) + 'px;';
        wrap.style.setProperty('--bkbg-st-max', (opts.maxWidth || 1100) + 'px');
        wrap.style.setProperty('--bkst-qt-sz', (opts.quoteSize || 28) + 'px');
        wrap.style.setProperty('--bkst-qt-w', String(opts.quoteFontWeight || 400));
        wrap.style.setProperty('--bkst-nm-sz', ((opts.authorSize || 16) + 2) + 'px');
        wrap.style.setProperty('--bkst-mt-sz', (opts.authorSize || 16) + 'px');
        typoCssVarsForEl(wrap, opts.quoteTypo, '--bkst-qt');
        typoCssVarsForEl(wrap, opts.nameTypo, '--bkst-nm');
        typoCssVarsForEl(wrap, opts.metaTypo, '--bkst-mt');

        if (opts.showQuoteMark !== false) {
            var qm = document.createElement('div');
            qm.className = 'bkbg-st-quote-mark';
            qm.style.color = opts.quoteMarkColor || 'rgba(124,58,237,.45)';
            qm.textContent = '\u201C';
            wrap.appendChild(qm);
        }

        var avatarRadius = opts.avatarShape === 'circle' ? '50%' : opts.avatarShape === 'rounded' ? '20%' : '0';
        var avatarSz = (opts.avatarSize || 120) + 'px';
        var isLeftPhoto = (opts.layout || 'left-photo') === 'left-photo';

        var inner = document.createElement('div');
        inner.className = 'bkbg-st-inner';
        inner.style.gridTemplateColumns = isLeftPhoto ? '1fr 2fr' : '2fr 1fr';

        // Photo column
        var photoCol = document.createElement('div');
        photoCol.className = 'bkbg-st-photo-col';
        photoCol.style.order = isLeftPhoto ? '0' : '1';

        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'bkbg-st-avatar';
        avatarDiv.style.cssText = 'width:' + avatarSz + ';height:' + avatarSz + ';border-radius:' + avatarRadius + ';background:' + (opts.accentBg || '#7c3aed') + ';box-shadow:0 0 0 6px ' + (opts.accentBg || '#7c3aed') + '44;';

        if (opts.authorImageUrl) {
            var img = document.createElement('img');
            img.src = opts.authorImageUrl;
            img.alt = opts.authorAlt || '';
            avatarDiv.appendChild(img);
        }
        photoCol.appendChild(avatarDiv);

        var authorWrap = document.createElement('div');
        authorWrap.style.textAlign = 'center';
        var authorName = document.createElement('div');
        authorName.className = 'bkbg-st-author-name';
        authorName.textContent = opts.authorName || '';
        var authorMeta = document.createElement('div');
        authorMeta.className = 'bkbg-st-author-meta';
        authorMeta.style.color = opts.authorColor || '#c4b5fd';
        authorMeta.textContent = opts.authorTitle + (opts.showCompany && opts.authorCompany ? ', ' + opts.authorCompany : '');
        authorWrap.appendChild(authorName);
        authorWrap.appendChild(authorMeta);
        photoCol.appendChild(authorWrap);

        // Quote column
        var quoteCol = document.createElement('div');
        quoteCol.className = 'bkbg-st-quote-col';
        quoteCol.style.order = isLeftPhoto ? '1' : '0';

        if (opts.showStars !== false) {
            var stars = document.createElement('div');
            stars.className = 'bkbg-st-stars';
            stars.style.cssText = 'font-size:24px;color:' + (opts.starColor || '#fbbf24') + ';';
            var n = opts.stars || 5;
            stars.textContent = '★'.repeat(n) + '☆'.repeat(5 - n);
            quoteCol.appendChild(stars);
        }

        var blockquote = document.createElement('blockquote');
        blockquote.className = 'bkbg-st-quote';
        blockquote.style.color = opts.quoteColor || '#fff';
        blockquote.innerHTML = opts.quote || '';
        quoteCol.appendChild(blockquote);

        inner.appendChild(photoCol);
        inner.appendChild(quoteCol);
        wrap.appendChild(inner);
        root.parentNode.replaceChild(wrap, root);
    });
})();
