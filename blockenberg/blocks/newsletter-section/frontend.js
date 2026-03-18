(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }
    function init() {
        document.querySelectorAll('.bkbg-nls-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Weekly Newsletter', heading: 'Join 12,000+ Marketers Getting Smarter Every Week',
                subtext: 'No fluff. Just actionable strategies, tools, and case studies every Tuesday.',
                subscriberCount: '12,000+ subscribers', showSubscriberBadge: true,
                formPlaceholder: 'Your email address', formSubmitLabel: 'Subscribe Free',
                formAction: '#', successMessage: '🎉 You\'re in! Check your inbox for a confirmation.',
                privacyNote: 'No spam. Unsubscribe anytime.',
                benefits: ['Proven marketing strategies that actually work', 'Tool reviews and comparisons (unbiased)', 'Real-world case studies with numbers', 'Exclusive subscriber-only resources'],
                showBenefits: true, sampleIssues: [], showSamples: true,
                maxWidth: 1100, paddingTop: 100, paddingBottom: 100,
                bgColor: '#0f172a', eyebrowColor: '#818cf8', headingColor: '#f8fafc',
                subColor: '#94a3b8', benefitColor: '#cbd5e1', checkColor: '#22d3ee',
                inputBg: '#1e293b', inputBorder: '#334155', inputColor: '#f1f5f9',
                submitBg: '#6366f1', submitColor: '#ffffff', privacyColor: '#64748b',
                issueBg: '#1e293b', issueBorder: '#334155', issueTitleColor: '#f1f5f9',
                issueDateColor: '#818cf8', issueExcerptColor: '#94a3b8',
                subscriberBadgeBg: '#1e293b', subscriberBadgeColor: '#94a3b8', accentColor: '#6366f1'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-nls-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-nls-header';

            var ey = document.createElement('span'); ey.className = 'bkbg-nls-eyebrow'; ey.style.color = o.eyebrowColor; ey.textContent = o.eyebrow;
            header.appendChild(ey);

            if (o.showSubscriberBadge) {
                var badge = document.createElement('div'); badge.className = 'bkbg-nls-subscriber-badge';
                badge.style.cssText = 'background:' + o.subscriberBadgeBg + ';color:' + o.subscriberBadgeColor;
                badge.innerHTML = '👥 ' + o.subscriberCount;
                header.appendChild(badge);
            }

            var h2 = document.createElement('h2'); h2.className = 'bkbg-nls-heading'; h2.style.color = o.headingColor; h2.innerHTML = o.heading;
            var sub = document.createElement('p'); sub.className = 'bkbg-nls-sub'; sub.style.color = o.subColor; sub.innerHTML = o.subtext;
            header.appendChild(h2); header.appendChild(sub);
            inner.appendChild(header);

            /* Grid */
            var grid = document.createElement('div'); grid.className = 'bkbg-nls-grid';

            /* Left column */
            var left = document.createElement('div');

            if (o.showBenefits && o.benefits && o.benefits.length) {
                var ul = document.createElement('ul'); ul.className = 'bkbg-nls-benefits';
                o.benefits.forEach(function (b) {
                    var li = document.createElement('li'); li.className = 'bkbg-nls-benefit'; li.style.color = o.benefitColor;
                    var check = document.createElement('span'); check.className = 'bkbg-nls-check'; check.style.color = o.checkColor; check.textContent = '✓';
                    li.appendChild(check); li.appendChild(document.createTextNode(b));
                    ul.appendChild(li);
                });
                left.appendChild(ul);
            }

            var form = document.createElement('form');
            form.className = 'bkbg-nls-form'; form.action = o.formAction; form.method = 'post';

            var input = document.createElement('input');
            input.type = 'email'; input.name = 'email'; input.required = true;
            input.className = 'bkbg-nls-input'; input.placeholder = o.formPlaceholder;
            input.style.cssText = 'background:' + o.inputBg + ';border-color:' + o.inputBorder + ';color:' + o.inputColor;

            var submit = document.createElement('button');
            submit.type = 'submit'; submit.className = 'bkbg-nls-submit';
            submit.style.cssText = 'background:' + o.submitBg + ';color:' + o.submitColor;
            submit.textContent = o.formSubmitLabel;

            form.appendChild(input); form.appendChild(submit);
            left.appendChild(form);

            var privacy = document.createElement('p'); privacy.className = 'bkbg-nls-privacy'; privacy.style.color = o.privacyColor; privacy.textContent = o.privacyNote;
            left.appendChild(privacy);

            var success = document.createElement('p'); success.className = 'bkbg-nls-success';
            success.style.cssText = 'background:' + o.accentColor + '22;color:' + o.headingColor;
            success.textContent = o.successMessage;
            left.appendChild(success);

            form.addEventListener('submit', function (e) {
                if (o.formAction === '#' || o.formAction === '') {
                    e.preventDefault(); form.style.display = 'none'; success.classList.add('visible');
                }
            });

            grid.appendChild(left);

            /* Right column — issues */
            if (o.showSamples && o.sampleIssues && o.sampleIssues.length) {
                var right = document.createElement('div');
                var issuesLabel = document.createElement('span'); issuesLabel.className = 'bkbg-nls-issues-label'; issuesLabel.style.color = o.eyebrowColor; issuesLabel.textContent = 'Recent Issues';
                right.appendChild(issuesLabel);

                o.sampleIssues.forEach(function (issue) {
                    var card = document.createElement('div'); card.className = 'bkbg-nls-issue';
                    card.style.cssText = 'background:' + o.issueBg + ';border-color:' + o.issueBorder;
                    var date = document.createElement('p'); date.className = 'bkbg-nls-issue-date'; date.style.color = o.issueDateColor; date.textContent = issue.date;
                    var title = document.createElement('p'); title.className = 'bkbg-nls-issue-title'; title.style.color = o.issueTitleColor; title.textContent = issue.title;
                    var excerpt = document.createElement('p'); excerpt.className = 'bkbg-nls-issue-excerpt'; excerpt.style.color = o.issueExcerptColor; excerpt.textContent = issue.excerpt;
                    card.appendChild(date); card.appendChild(title); card.appendChild(excerpt);
                    right.appendChild(card);
                });

                grid.appendChild(right);
            }

            inner.appendChild(grid);
            el.appendChild(inner);

            if (el.parentElement) {
                typoCssVarsForEl(el.parentElement, o.headingTypo, '--bkbg-nls-ht-');
                typoCssVarsForEl(el.parentElement, o.subtextTypo, '--bkbg-nls-st-');
            }
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
