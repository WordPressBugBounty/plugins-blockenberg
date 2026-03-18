(function () {
    function init() {
        document.querySelectorAll('.bkbg-cnv-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                seriesTitle: 'Series',
                currentPart: 1,
                totalParts: 1,
                currentTitle: 'Current Chapter',
                prevTitle: '',
                prevUrl: '',
                nextTitle: '',
                nextUrl: '',
                chapters: [],
                showChapterList: true,
                chapterListOpen: false,
                showProgress: true,
                style: 'card',
                openInNewTab: false,
                partLabel: 'Part',
                bgColor: '#ffffff',
                borderColor: '#e2e8f0',
                accentColor: '#6366f1',
                seriesTitleColor: '#374151',
                currentTitleColor: '#111827',
                progressBg: '#e2e8f0',
                progressFill: '#6366f1',
                btnBg: '#f1f5f9',
                btnColor: '#374151',
                pillBg: '#eef2ff',
                pillColor: '#4f46e5',
                chapterListBg: '#f8fafc',
                activeChapterBg: '#eef2ff',
                activeChapterColor: '#4f46e5',
                borderRadius: 10,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

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

            var target = o.openInNewTab ? '_blank' : '_self';
            var progress = Math.round((o.currentPart / o.totalParts) * 100);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-cnv-wrap bkbg-cnv-' + o.style;
            wrap.style.cssText = 'background:' + o.bgColor + ';padding-top:' + o.paddingTop + 'px;padding-bottom:' + o.paddingBottom + 'px;';

            if (o.style === 'card') {
                wrap.style.cssText += 'border:1px solid ' + o.borderColor + ';border-radius:' + o.borderRadius + 'px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;';
            } else if (o.style === 'banner') {
                wrap.style.cssText += 'border-left:4px solid ' + o.accentColor + ';border:1px solid ' + o.borderColor + ';border-left-width:4px;border-radius:' + o.borderRadius + 'px;overflow:hidden;';
            } else {
                wrap.style.cssText += 'border-top:2px solid ' + o.accentColor + ';padding-top:16px;';
            }

            /* Header */
            var hdr = document.createElement('div');
            hdr.className = 'bkbg-cnv-header';
            hdr.style.cssText = 'padding:16px 20px;' + (o.style !== 'minimal' ? 'border-bottom:1px solid ' + o.borderColor + ';' : '');

            var meta = document.createElement('div');
            meta.className = 'bkbg-cnv-meta';
            meta.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;';

            var pill = document.createElement('span');
            pill.className = 'bkbg-cnv-pill';
            pill.style.cssText = 'background:' + o.pillBg + ';color:' + o.pillColor + ';padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;';
            pill.textContent = o.partLabel + ' ' + o.currentPart + ' of ' + o.totalParts;

            var series = document.createElement('span');
            series.className = 'bkbg-cnv-series';
            series.style.cssText = 'font-size:13px;color:' + o.seriesTitleColor + ';';
            series.textContent = o.seriesTitle;

            meta.appendChild(pill);
            meta.appendChild(series);
            hdr.appendChild(meta);

            var cTitle = document.createElement('h3');
            cTitle.className = 'bkbg-cnv-current-title';
            cTitle.style.cssText = 'margin:0;color:' + o.currentTitleColor + ';';
            cTitle.textContent = o.currentTitle;
            hdr.appendChild(cTitle);

            if (o.showProgress) {
                var pWrap = document.createElement('div');
                pWrap.className = 'bkbg-cnv-progress-wrap';
                pWrap.style.marginTop = '10px';

                var pBar = document.createElement('div');
                pBar.className = 'bkbg-cnv-progress-bar';
                pBar.style.cssText = 'background:' + o.progressBg + ';border-radius:4px;height:6px;overflow:hidden;';

                var pFill = document.createElement('div');
                pFill.className = 'bkbg-cnv-progress-fill';
                pFill.style.cssText = 'background:' + o.progressFill + ';width:' + progress + '%;height:100%;border-radius:4px;';

                var pLbl = document.createElement('div');
                pLbl.className = 'bkbg-cnv-progress-label';
                pLbl.style.cssText = 'font-size:11px;margin-top:4px;opacity:.8;color:' + o.seriesTitleColor + ';';
                pLbl.textContent = progress + '% through the series';

                pBar.appendChild(pFill);
                pWrap.appendChild(pBar);
                pWrap.appendChild(pLbl);
                hdr.appendChild(pWrap);
            }

            wrap.appendChild(hdr);

            /* Nav row */
            var nav = document.createElement('div');
            nav.className = 'bkbg-cnv-nav';
            nav.style.cssText = 'display:flex;gap:10px;padding:14px 20px;flex-wrap:wrap;';

            if (o.prevTitle) {
                var prevBtn = document.createElement('a');
                prevBtn.className = 'bkbg-cnv-btn';
                prevBtn.href = o.prevUrl || '#';
                prevBtn.target = target;
                if (o.openInNewTab) prevBtn.rel = 'noopener noreferrer';
                prevBtn.style.cssText = 'flex:1;min-width:160px;background:' + o.btnBg + ';color:' + o.btnColor + ';padding:10px 14px;border-radius:6px;font-size:13px;text-decoration:none;display:flex;flex-direction:column;gap:2px;';
                prevBtn.innerHTML = '<span style="font-size:11px;opacity:.7;">← Previous</span><span style="font-weight:600;">' + esc(o.prevTitle) + '</span>';
                nav.appendChild(prevBtn);
            }
            if (o.nextTitle) {
                var nextBtn = document.createElement('a');
                nextBtn.className = 'bkbg-cnv-btn bkbg-cnv-btn-next';
                nextBtn.href = o.nextUrl || '#';
                nextBtn.target = target;
                if (o.openInNewTab) nextBtn.rel = 'noopener noreferrer';
                nextBtn.style.cssText = 'flex:1;min-width:160px;background:' + o.accentColor + ';color:#fff;padding:10px 14px;border-radius:6px;font-size:13px;text-decoration:none;display:flex;flex-direction:column;gap:2px;text-align:right;';
                nextBtn.innerHTML = '<span style="font-size:11px;opacity:.8;">Next →</span><span style="font-weight:600;">' + esc(o.nextTitle) + '</span>';
                nav.appendChild(nextBtn);
            }
            wrap.appendChild(nav);

            /* Chapter list */
            if (o.showChapterList && o.chapters && o.chapters.length) {
                var details = document.createElement('details');
                if (o.chapterListOpen) details.open = true;
                details.style.cssText = 'border-top:1px solid ' + o.borderColor + ';';

                var summary = document.createElement('summary');
                summary.className = 'bkbg-cnv-summary';
                summary.style.cssText = 'padding:12px 20px;cursor:pointer;font-size:13px;font-weight:600;list-style:none;display:flex;align-items:center;justify-content:space-between;background:' + o.chapterListBg + ';color:' + o.seriesTitleColor + ';';
                summary.innerHTML = '<span>All ' + o.totalParts + ' chapters</span><span class="bkbg-cnv-arrow" style="transition:transform .25s;font-style:normal;display:inline-block;">▾</span>';

                var ul = document.createElement('ol');
                ul.className = 'bkbg-cnv-list';
                ul.style.cssText = 'margin:0;padding:8px 0;list-style:none;background:' + o.chapterListBg + ';';

                o.chapters.forEach(function (ch, i) {
                    var isActive = (i + 1) === o.currentPart;
                    var li = document.createElement('li');
                    li.className = 'bkbg-cnv-list-item';
                    li.style.cssText = 'padding:8px 20px 8px 44px;position:relative;font-size:13px;' + (isActive ? 'background:' + o.activeChapterBg + ';' : '');

                    var num = document.createElement('span');
                    num.className = 'bkbg-cnv-item-num';
                    num.style.cssText = 'position:absolute;left:20px;font-weight:700;color:' + (isActive ? o.activeChapterColor : o.seriesTitleColor) + ';';
                    num.textContent = (i + 1) + '.';
                    li.appendChild(num);

                    if (ch.url && !isActive) {
                        var link = document.createElement('a');
                        link.className = 'bkbg-cnv-item-link';
                        link.href = ch.url;
                        link.target = target;
                        if (o.openInNewTab) link.rel = 'noopener noreferrer';
                        link.style.cssText = 'color:' + o.seriesTitleColor + ';text-decoration:none;';
                        link.textContent = ch.title;
                        li.appendChild(link);
                    } else {
                        var span = document.createElement('span');
                        span.style.cssText = 'color:' + (isActive ? o.activeChapterColor : o.seriesTitleColor) + ';font-weight:' + (isActive ? '600' : '400') + ';';
                        span.textContent = ch.title;
                        li.appendChild(span);
                    }

                    if (isActive) {
                        var badge = document.createElement('span');
                        badge.className = 'bkbg-cnv-current-badge';
                        badge.style.cssText = 'margin-left:8px;font-size:11px;padding:1px 7px;background:' + o.accentColor + ';color:#fff;border-radius:10px;font-weight:600;';
                        badge.textContent = 'Current';
                        li.appendChild(badge);
                    }
                    ul.appendChild(li);
                });

                details.appendChild(summary);
                details.appendChild(ul);
                wrap.appendChild(details);
            }

            typoCssVarsForEl(o.typoTitle, '--bkbg-cnv-tt-', wrap);

            el.parentNode.insertBefore(wrap, el);
        });
    }

    function esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
