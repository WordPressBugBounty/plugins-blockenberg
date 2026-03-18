(function () {
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
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) { el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu); el.style.setProperty(prefix + 'letter-spacing', typo.letterSpacingDesktop + lsu); }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) { el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu); el.style.setProperty(prefix + 'word-spacing', typo.wordSpacingDesktop + wsu); }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function init() {
        document.querySelectorAll('.bkbg-aff-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Partner Program',
                heading: 'Earn While You Share',
                subtext: 'Join our affiliate program and earn generous commissions for every customer you refer.',
                commission: '30%',
                commissionLabel: 'recurring commission',
                commissionNote: 'on every sale, every month, for life',
                steps: [
                    { icon: '🔗', title: 'Sign Up Free', description: 'Create your affiliate account in minutes.' },
                    { icon: '📢', title: 'Share Your Link', description: 'Promote via blog, email, social, or any channel.' },
                    { icon: '💰', title: 'Earn Commission', description: 'Get paid automatically every month.' }
                ],
                showBenefits: true,
                benefits: [
                    { text: '30-day cookie window' },
                    { text: 'Real-time tracking dashboard' },
                    { text: 'Monthly payouts via PayPal' },
                    { text: 'Dedicated affiliate manager' },
                    { text: 'Marketing materials provided' }
                ],
                showStats: true,
                stats: [
                    { number: '2,400+', label: 'Active Affiliates' },
                    { number: '$1.2M', label: 'Paid Out' },
                    { number: '4.8★', label: 'Affiliate Rating' }
                ],
                ctaLabel: 'Join the Program',
                ctaUrl: '#',
                ctaSecondaryLabel: 'Learn More',
                ctaSecondaryUrl: '#',
                showSecondary: true,
                layout: 'split',
                bgColor: '#0f172a',
                accentColor: '#6366f1',
                commissionBg: '#6366f1',
                commissionColor: '#ffffff',
                headingColor: '#ffffff',
                subColor: '#94a3b8',
                eyebrowColor: '#a5b4fc',
                stepCardBg: '#1e293b',
                stepTitleColor: '#f1f5f9',
                stepDescColor: '#94a3b8',
                benefitColor: '#e2e8f0',
                statNumColor: '#6366f1',
                statLabelColor: '#94a3b8',
                ctaBg: '#6366f1',
                ctaColor: '#ffffff',
                maxWidth: 1100,
                paddingTop: 80,
                paddingBottom: 80
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            /* Typography CSS vars */
            el.style.setProperty('--bkbg-aff-eyebrow-sz', (o.eyebrowFontSize || 13) + 'px');
            el.style.setProperty('--bkbg-aff-heading-sz', (o.headingFontSize || 38) + 'px');
            el.style.setProperty('--bkbg-aff-subtext-sz', (o.subtextFontSize || 18) + 'px');
            typoCssVarsForEl(o.eyebrowTypo, '--bkbg-aff-eyebrow-', el);
            typoCssVarsForEl(o.headingTypo, '--bkbg-aff-heading-', el);
            typoCssVarsForEl(o.subtextTypo, '--bkbg-aff-subtext-', el);

            var inner = document.createElement('div');
            inner.className = 'bkbg-aff-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Text block */
            var textBlock = document.createElement('div');
            textBlock.className = 'bkbg-aff-text-block';

            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-aff-eyebrow';
            eyebrow.style.cssText = 'color:' + o.eyebrowColor;
            eyebrow.innerHTML = o.eyebrow;

            var heading = document.createElement('h2');
            heading.className = 'bkbg-aff-heading';
            heading.style.cssText = 'color:' + o.headingColor;
            heading.innerHTML = o.heading;

            var sub = document.createElement('p');
            sub.className = 'bkbg-aff-sub';
            sub.style.cssText = 'color:' + o.subColor;
            sub.innerHTML = o.subtext;

            textBlock.appendChild(eyebrow);
            textBlock.appendChild(heading);
            textBlock.appendChild(sub);
            inner.appendChild(textBlock);

            /* Commission badge */
            var commDiv = document.createElement('div');
            commDiv.className = 'bkbg-aff-commission';

            var badge = document.createElement('div');
            badge.className = 'bkbg-aff-commission-badge';
            badge.style.cssText = 'background:' + o.commissionBg + ';color:' + o.commissionColor;

            var cval = document.createElement('div');
            cval.className = 'bkbg-aff-commission-value';
            cval.textContent = o.commission;

            var clbl = document.createElement('div');
            clbl.className = 'bkbg-aff-commission-label';
            clbl.textContent = o.commissionLabel;

            var cnote = document.createElement('div');
            cnote.className = 'bkbg-aff-commission-note';
            cnote.textContent = o.commissionNote;

            badge.appendChild(cval);
            badge.appendChild(clbl);
            badge.appendChild(cnote);
            commDiv.appendChild(badge);
            inner.appendChild(commDiv);

            /* Steps */
            var stepsGrid = document.createElement('div');
            stepsGrid.className = 'bkbg-aff-steps';

            (o.steps || []).forEach(function (step) {
                var card = document.createElement('div');
                card.className = 'bkbg-aff-step-card';
                card.style.background = o.stepCardBg;

                var icon = document.createElement('div');
                icon.className = 'bkbg-aff-step-icon';
                icon.textContent = step.icon;

                var title = document.createElement('div');
                title.className = 'bkbg-aff-step-title';
                title.style.color = o.stepTitleColor;
                title.textContent = step.title;

                var desc = document.createElement('div');
                desc.className = 'bkbg-aff-step-desc';
                desc.style.color = o.stepDescColor;
                desc.textContent = step.description;

                card.appendChild(icon);
                card.appendChild(title);
                card.appendChild(desc);
                stepsGrid.appendChild(card);
            });
            inner.appendChild(stepsGrid);

            /* Benefits */
            if (o.showBenefits && o.benefits && o.benefits.length) {
                var benWrap = document.createElement('div');
                benWrap.className = 'bkbg-aff-benefits';

                o.benefits.forEach(function (b) {
                    var item = document.createElement('span');
                    item.className = 'bkbg-aff-benefit';
                    item.style.color = o.benefitColor;

                    var check = document.createElement('em');
                    check.className = 'bkbg-aff-benefit-check';
                    check.style.color = o.accentColor;
                    check.textContent = '✓';

                    item.appendChild(check);
                    item.appendChild(document.createTextNode(' ' + b.text));
                    benWrap.appendChild(item);
                });
                inner.appendChild(benWrap);
            }

            /* Stats */
            if (o.showStats && o.stats && o.stats.length) {
                var statsRow = document.createElement('div');
                statsRow.className = 'bkbg-aff-stats';

                o.stats.forEach(function (s) {
                    var stat = document.createElement('div');
                    stat.className = 'bkbg-aff-stat';

                    var num = document.createElement('div');
                    num.className = 'bkbg-aff-stat-num';
                    num.style.color = o.statNumColor;
                    num.textContent = s.number;

                    var lbl = document.createElement('div');
                    lbl.className = 'bkbg-aff-stat-label';
                    lbl.style.color = o.statLabelColor;
                    lbl.textContent = s.label;

                    stat.appendChild(num);
                    stat.appendChild(lbl);
                    statsRow.appendChild(stat);
                });
                inner.appendChild(statsRow);
            }

            /* CTAs */
            var ctaRow = document.createElement('div');
            ctaRow.className = 'bkbg-aff-ctas';

            var primary = document.createElement('a');
            primary.className = 'bkbg-aff-cta-primary';
            primary.href = o.ctaUrl;
            primary.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
            primary.textContent = o.ctaLabel;
            ctaRow.appendChild(primary);

            if (o.showSecondary) {
                var secondary = document.createElement('a');
                secondary.className = 'bkbg-aff-cta-secondary';
                secondary.href = o.ctaSecondaryUrl;
                secondary.style.cssText = 'color:' + o.accentColor + ';border-color:' + o.accentColor;
                secondary.textContent = o.ctaSecondaryLabel;
                ctaRow.appendChild(secondary);
            }
            inner.appendChild(ctaRow);

            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
