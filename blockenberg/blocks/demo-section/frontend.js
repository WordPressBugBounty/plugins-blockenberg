(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-dms-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                badge: '✨ No credit card required',
                heading: 'See It in Action — Request a Demo',
                subtext: 'Get a personalised walkthrough from our team and discover how Blockenberg can transform your workflow in under 30 minutes.',
                ctaMode: 'button',
                ctaLabel: 'Book a Free Demo', ctaUrl: '#',
                ctaSecLabel: 'Start Free Trial', ctaSecUrl: '#', showCtaSec: true,
                formPlaceholder: 'Enter your work email', formSubmitLabel: 'Request Demo', formAction: '',
                trustItems: [{ icon: '✅', text: 'No credit card required' }, { icon: '⚡', text: '5-minute setup' }, { icon: '🔒', text: 'SOC 2 certified' }, { icon: '🎯', text: 'Cancel anytime' }],
                showTrust: true,
                socialStats: [{ number: '10,000+', label: 'Active teams' }, { number: '4.9/5', label: 'G2 rating' }, { number: '98%', label: 'Customer satisfaction' }],
                showStats: true,
                imageUrl: '', showImage: true,
                layout: 'centered', maxWidth: 1100, paddingTop: 100, paddingBottom: 100,
                bgColor: '#0f172a', headingColor: '#f8fafc', subColor: '#94a3b8',
                badgeBg: 'rgba(99,102,241,0.15)', badgeColor: '#a5b4fc',
                ctaBg: '#6366f1', ctaColor: '#ffffff',
                ctaSecBg: 'transparent', ctaSecColor: '#a5b4fc',
                trustColor: '#94a3b8', statNumColor: '#f8fafc', statLabelColor: '#64748b',
                imageBg: '#1e293b', accentColor: '#6366f1'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var isSplit = o.layout === 'split-left' || o.layout === 'split-right';

            var inner = document.createElement('div');
            inner.className = 'bkbg-dms-inner layout-' + o.layout;
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Typography CSS vars */
            inner.style.setProperty('--bkbg-dms-hdg-fs', (o.headingFontSize || 36) + 'px');
            inner.style.setProperty('--bkbg-dms-sub-fs', (o.subtextFontSize || 18) + 'px');
            if (opts.typoHeading) typoCssVarsForEl(opts.typoHeading, '--bkbg-dms-hdg-', inner);
            if (opts.typoSubtext) typoCssVarsForEl(opts.typoSubtext, '--bkbg-dms-sub-', inner);

            /* Text column */
            var textCol = document.createElement('div');
            textCol.className = 'bkbg-dms-text';

            if (o.badge) {
                var badge = document.createElement('div');
                badge.className = 'bkbg-dms-badge';
                badge.style.cssText = 'background:' + o.badgeBg + ';color:' + o.badgeColor;
                badge.textContent = o.badge;
                textCol.appendChild(badge);
            }

            var h2 = document.createElement('h2');
            h2.className = 'bkbg-dms-heading';
            h2.style.color = o.headingColor;
            h2.innerHTML = o.heading;
            textCol.appendChild(h2);

            var sub = document.createElement('p');
            sub.className = 'bkbg-dms-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;
            textCol.appendChild(sub);

            /* CTA */
            var ctaRow = document.createElement('div');
            ctaRow.className = 'bkbg-dms-cta-row';

            if (o.ctaMode === 'button') {
                var btn = document.createElement('a');
                btn.className = 'bkbg-dms-btn-primary';
                btn.href = o.ctaUrl;
                btn.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
                btn.textContent = o.ctaLabel;
                ctaRow.appendChild(btn);
                if (o.showCtaSec) {
                    var btnSec = document.createElement('a');
                    btnSec.className = 'bkbg-dms-btn-sec';
                    btnSec.href = o.ctaSecUrl;
                    btnSec.style.cssText = 'color:' + o.ctaSecColor + ';border:1px solid ' + o.ctaSecColor + '88';
                    btnSec.textContent = o.ctaSecLabel;
                    ctaRow.appendChild(btnSec);
                }
            } else {
                var form = document.createElement('form');
                form.className = 'bkbg-dms-form-preview';
                if (o.formAction) form.action = o.formAction;
                form.method = 'post';

                var input = document.createElement('input');
                input.type = 'email';
                input.className = 'bkbg-dms-input-fake';
                input.placeholder = o.formPlaceholder;
                input.style.color = o.subColor;
                form.appendChild(input);

                var submit = document.createElement('button');
                submit.type = 'submit';
                submit.className = 'bkbg-dms-submit-fake';
                submit.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
                submit.textContent = o.formSubmitLabel;
                form.appendChild(submit);
                ctaRow.appendChild(form);
            }
            textCol.appendChild(ctaRow);

            /* Trust */
            if (o.showTrust && o.trustItems.length) {
                var trust = document.createElement('div');
                trust.className = 'bkbg-dms-trust';
                var _IP = window.bkbgIconPicker;
                o.trustItems.forEach(function (item) {
                    var span = document.createElement('span');
                    span.className = 'bkbg-dms-trust-item';
                    span.style.color = o.trustColor;
                    var iconSpan = document.createElement('span');
                    iconSpan.className = 'bkbg-dms-trust-icon';
                    var _iType = item.iconType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor);
                        if (_in) iconSpan.appendChild(_in);
                        else iconSpan.textContent = item.icon;
                    } else {
                        iconSpan.textContent = item.icon;
                    }
                    span.appendChild(iconSpan);
                    span.appendChild(document.createTextNode(item.text));
                    trust.appendChild(span);
                });
                textCol.appendChild(trust);
            }

            /* Stats */
            if (o.showStats && o.socialStats.length) {
                var stats = document.createElement('div');
                stats.className = 'bkbg-dms-stats';
                o.socialStats.forEach(function (stat) {
                    var sd = document.createElement('div');
                    sd.className = 'bkbg-dms-stat';
                    var snum = document.createElement('div');
                    snum.className = 'bkbg-dms-stat-num';
                    snum.style.color = o.statNumColor;
                    snum.textContent = stat.number;
                    var slabel = document.createElement('div');
                    slabel.className = 'bkbg-dms-stat-label';
                    slabel.style.color = o.statLabelColor;
                    slabel.textContent = stat.label;
                    sd.appendChild(snum);
                    sd.appendChild(slabel);
                    stats.appendChild(sd);
                });
                textCol.appendChild(stats);
            }

            inner.appendChild(textCol);

            /* Image */
            if (o.showImage) {
                var imgCol = document.createElement('div');
                imgCol.className = isSplit ? 'bkbg-dms-image-col' : 'bkbg-dms-image-centered';
                imgCol.style.background = o.imageBg;
                if (o.imageUrl) {
                    var img = document.createElement('img');
                    img.className = 'bkbg-dms-screenshot';
                    img.src = o.imageUrl;
                    img.alt = '';
                    imgCol.appendChild(img);
                } else {
                    var ph = document.createElement('div');
                    ph.className = 'bkbg-dms-img-placeholder';
                    ph.style.cssText = 'background:' + o.accentColor + '22;color:' + o.accentColor;
                    ph.textContent = '🖥';
                    imgCol.appendChild(ph);
                }
                inner.appendChild(imgCol);
            }

            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
