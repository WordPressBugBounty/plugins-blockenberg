(function () {
    var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], String(typo[k]));
        });
    }
    var MEDIA_ICONS = { video: '▶', audio: '🎙️', image: '🖼️' };

    document.querySelectorAll('.bkbg-mqu-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var quote = opts.quote || '';
        var videoUrl = opts.videoUrl || '';
        var thumbnailUrl = opts.thumbnailUrl || '';
        var showVideo = opts.showVideo !== false;
        var mediaType = opts.mediaType || 'video';
        var mediaLabel = opts.mediaLabel || '';
        var showMediaLabel = opts.showMediaLabel !== false;
        var speakerName = opts.speakerName || '';
        var speakerTitle = opts.speakerTitle || '';
        var speakerAvatarUrl = opts.speakerAvatarUrl || '';
        var layout = opts.layout || 'media-left';
        var cardStyle = opts.style || 'card';
        var quoteColor = opts.quoteColor || '#111827';
        var speakerColor = opts.speakerColor || '#374151';
        var bgColor = opts.bgColor || '#ffffff';
        var accentColor = opts.accentColor || '#7c3aed';
        var borderColor = opts.borderColor || '#e5e7eb';
        var cardBg = opts.cardBg || '#f9fafb';
        var playBtnBg = opts.playBtnBg || '#ffffff';
        var playBtnColor = opts.playBtnColor || '#7c3aed';
        var quoteSize = opts.quoteSize || 20;
        var showQuoteIcon = opts.showQuoteIcon !== false;
        var mediaRadius = opts.mediaRadius !== undefined ? opts.mediaRadius : 12;
        var borderRadius = opts.borderRadius !== undefined ? opts.borderRadius : 16;
        var maxWidth = opts.maxWidth || 900;
        var paddingTop = opts.paddingTop !== undefined ? opts.paddingTop : 64;
        var paddingBottom = opts.paddingBottom !== undefined ? opts.paddingBottom : 64;

        var isTop = layout === 'media-top';
        var isRight = layout === 'media-right';
        var isOnly = layout === 'quote-only';

        /* wrap */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-mqu-wrap';
        wrap.style.cssText = 'background:' + bgColor + ';padding-top:' + paddingTop + 'px;padding-bottom:' + paddingBottom + 'px;';

        typoCssVarsForEl(wrap, opts.quoteTypo, '--bkbg-mqu-qt-');
        typoCssVarsForEl(wrap, opts.speakerNameTypo, '--bkbg-mqu-sn-');
        typoCssVarsForEl(wrap, opts.speakerTitleTypo, '--bkbg-mqu-st-');

        /* card */
        var card = document.createElement('div');
        card.className = 'bkbg-mqu-card bkbg-mqu-card--' + cardStyle;
        card.style.maxWidth = maxWidth + 'px';
        if (cardStyle === 'card') {
            card.style.cssText += ';background:' + cardBg + ';border-radius:' + borderRadius + 'px;';
        } else if (cardStyle === 'bordered') {
            card.style.cssText += ';border-color:' + borderColor + ';border-radius:' + borderRadius + 'px;';
        } else if (cardStyle === 'minimal') {
            card.style.borderLeftColor = accentColor;
        }

        /* inner */
        var inner = document.createElement('div');
        inner.className = 'bkbg-mqu-inner bkbg-mqu-inner--' + layout;
        if (isOnly) inner.className = 'bkbg-mqu-inner bkbg-mqu-inner--quote-only';

        /* media column */
        if (!isOnly && showVideo) {
            var mediaCol = document.createElement('div');
            mediaCol.className = 'bkbg-mqu-media-col';

            var thumbWrap = document.createElement(videoUrl ? 'a' : 'div');
            thumbWrap.className = 'bkbg-mqu-thumbnail-wrap';
            thumbWrap.style.borderRadius = mediaRadius + 'px';
            thumbWrap.style.overflow = 'hidden';
            if (videoUrl) {
                thumbWrap.href = videoUrl;
                thumbWrap.target = '_blank';
                thumbWrap.rel = 'noopener noreferrer';
            }

            if (thumbnailUrl) {
                var thumb = document.createElement('img');
                thumb.className = 'bkbg-mqu-thumbnail';
                thumb.src = thumbnailUrl;
                thumb.alt = speakerName ? 'Watch: ' + speakerName : 'Watch';
                thumb.style.borderRadius = mediaRadius + 'px';
                thumbWrap.appendChild(thumb);

                /* play overlay */
                var overlay = document.createElement('div');
                overlay.className = 'bkbg-mqu-play-overlay';
                var playBtn = document.createElement('div');
                playBtn.className = 'bkbg-mqu-play-btn';
                playBtn.style.cssText = 'background:' + playBtnBg + ';color:' + playBtnColor;
                playBtn.textContent = MEDIA_ICONS[mediaType] || '▶';
                overlay.appendChild(playBtn);
                thumbWrap.appendChild(overlay);
            } else {
                thumbWrap.style.cssText += ';background:#f3f4f6;height:200px;display:flex;align-items:center;justify-content:center;font-size:40px;color:#d1d5db;';
                thumbWrap.textContent = MEDIA_ICONS[mediaType] || '▶';
            }
            mediaCol.appendChild(thumbWrap);

            if (showMediaLabel && mediaLabel) {
                var lbl = document.createElement('a');
                lbl.className = 'bkbg-mqu-media-label';
                lbl.textContent = mediaLabel;
                lbl.style.color = accentColor;
                if (videoUrl) { lbl.href = videoUrl; lbl.target = '_blank'; lbl.rel = 'noopener noreferrer'; } else { lbl.href = '#'; }
                mediaCol.appendChild(lbl);
            }
            inner.appendChild(mediaCol);
        }

        /* quote column */
        var quoteCol = document.createElement('div');
        quoteCol.className = 'bkbg-mqu-quote-col';

        if (showQuoteIcon) {
            var ico = document.createElement('span');
            ico.className = 'bkbg-mqu-icon';
            ico.style.color = accentColor;
            ico.textContent = '\u201c';
            quoteCol.appendChild(ico);
        }

        var bq = document.createElement('blockquote');
        bq.className = 'bkbg-mqu-blockquote';
        bq.style.color = quoteColor;
        bq.textContent = quote;
        quoteCol.appendChild(bq);

        /* speaker */
        var speaker = document.createElement('div');
        speaker.className = 'bkbg-mqu-speaker';
        if (speakerAvatarUrl) {
            var av = document.createElement('img');
            av.className = 'bkbg-mqu-avatar';
            av.src = speakerAvatarUrl;
            av.alt = speakerName;
            av.style.borderColor = borderColor;
            speaker.appendChild(av);
        } else {
            var avPh = document.createElement('div');
            avPh.className = 'bkbg-mqu-avatar-placeholder';
            avPh.textContent = '👤';
            speaker.appendChild(avPh);
        }
        var spInfo = document.createElement('div');
        var spName = document.createElement('p');
        spName.className = 'bkbg-mqu-speaker-name';
        spName.style.color = quoteColor;
        spName.textContent = speakerName;
        spInfo.appendChild(spName);
        if (speakerTitle) {
            var spRole = document.createElement('p');
            spRole.className = 'bkbg-mqu-speaker-title';
            spRole.style.color = speakerColor;
            spRole.textContent = speakerTitle;
            spInfo.appendChild(spRole);
        }
        speaker.appendChild(spInfo);
        quoteCol.appendChild(speaker);

        inner.appendChild(quoteCol);
        card.appendChild(inner);
        wrap.appendChild(card);
        app.replaceWith(wrap);
    });
})();
