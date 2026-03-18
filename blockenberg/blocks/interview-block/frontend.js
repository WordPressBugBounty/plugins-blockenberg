wp.domReady(function () {
    /* ── typography CSS-var helper ──────────────────────────── */
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

    document.querySelectorAll('.bkbg-ib-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var layout  = opts.layout  || 'classic';
        var items   = opts.items   || [];
        var radius  = (opts.borderRadius || 12) + 'px';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ib-wrap bkbg-ib-wrap--' + layout;
        wrap.style.setProperty('--bkbg-ib-accent',      opts.accentColor   || '#7c3aed');
        wrap.style.setProperty('--bkbg-ib-divider',     opts.dividerColor  || '#f3f4f6');
        wrap.style.setProperty('--bkbg-ib-radius',      radius);
        wrap.style.setProperty('--bkbg-ib-card-border', opts.cardBorderColor || '#e5e7eb');
        if (opts.bgColor) wrap.style.background = opts.bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 48) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 48) + 'px';

        typoCssVarsForEl(wrap, opts.questionTypo, '--bkbg-ib-q-');
        typoCssVarsForEl(wrap, opts.answerTypo, '--bkbg-ib-a-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-ib-inner';
        inner.style.maxWidth = (opts.maxWidth || 800) + 'px';

        // Speaker header
        if (opts.showSpeakerHeader !== false) {
            var header = document.createElement('div');
            header.className = 'bkbg-ib-header';
            header.style.background    = opts.headerBg    || '#f9fafb';
            header.style.borderRadius  = radius;

            if (opts.intervieweeAvatarUrl) {
                var img = document.createElement('img');
                img.className = 'bkbg-ib-avatar';
                img.src = opts.intervieweeAvatarUrl;
                img.alt = opts.intervieweeName || '';
                header.appendChild(img);
            } else {
                var ph = document.createElement('div');
                ph.className   = 'bkbg-ib-avatar-placeholder';
                ph.style.background = opts.prefixBg || '#7c3aed';
                ph.style.color      = opts.prefixColor || '#fff';
                ph.textContent = (opts.intervieweeName || 'I').charAt(0).toUpperCase();
                header.appendChild(ph);
            }

            var info = document.createElement('div');
            if (opts.intervieweeName) {
                var name = document.createElement('div');
                name.className = 'bkbg-ib-name';
                name.style.fontSize = (opts.nameSize || 18) + 'px';
                name.style.color    = opts.nameColor || '#111827';
                name.textContent    = opts.intervieweeName;
                info.appendChild(name);
            }
            if (opts.intervieweeRole) {
                var role = document.createElement('div');
                role.className = 'bkbg-ib-role';
                role.style.color = opts.roleColor || '#6b7280';
                role.textContent = opts.intervieweeRole;
                info.appendChild(role);
            }
            if (opts.interviewerName) {
                var iwr = document.createElement('div');
                iwr.className = 'bkbg-ib-interviewer';
                iwr.textContent = 'Interviewed by: ' + opts.interviewerName;
                info.appendChild(iwr);
            }
            header.appendChild(info);
            inner.appendChild(header);
        }

        // Q&A items
        items.forEach(function (item, i) {
            var itemEl = document.createElement('div');
            itemEl.className = 'bkbg-ib-item';
            if (layout === 'card') {
                itemEl.style.background = opts.cardBg || '#ffffff';
            }

            function buildRow(text, isQ) {
                var row = document.createElement('div');
                row.className = 'bkbg-ib-row ' + (isQ ? 'bkbg-ib-q-row' : 'bkbg-ib-a-row');

                if (opts.showPrefixLabel !== false && layout !== 'minimal') {
                    var prefix = document.createElement('span');
                    prefix.className = 'bkbg-ib-prefix ' + (isQ ? 'bkbg-ib-prefix-q' : 'bkbg-ib-prefix-a');

                    if (layout === 'magazine') {
                        prefix.style.color = isQ ? (opts.accentColor || '#7c3aed') : (opts.answerColor || '#374151');
                    } else {
                        prefix.style.background = isQ ? (opts.prefixBg || '#7c3aed') : 'transparent';
                        prefix.style.color       = isQ ? (opts.prefixColor || '#fff') : (opts.accentColor || '#7c3aed');
                        if (!isQ) prefix.style.border = '2px solid ' + (opts.accentColor || '#7c3aed');
                        prefix.style.fontSize    = (opts.prefixSize || 13) + 'px';
                    }
                    prefix.textContent = isQ ? (opts.questionPrefix || 'Q') : (opts.answerPrefix || 'A');
                    row.appendChild(prefix);
                }

                var p = document.createElement('p');
                p.className   = isQ ? 'bkbg-ib-q-text' : 'bkbg-ib-a-text';
                p.style.color      = isQ ? (opts.questionColor || '#111827') : (opts.answerColor || '#374151');
                p.innerHTML = text || '';
                row.appendChild(p);
                return row;
            }

            itemEl.appendChild(buildRow(item.question, true));
            itemEl.appendChild(buildRow(item.answer, false));

            inner.appendChild(itemEl);

            if (opts.showDivider !== false && layout !== 'card' && i < items.length - 1) {
                var div = document.createElement('hr');
                div.className = 'bkbg-ib-divider';
                inner.appendChild(div);
            }
        });

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
});
