(function () {
    'use strict';

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function mkText(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }
    function mkA(cls, href, styles) {
        var a = mk('a', cls, styles);
        a.href = href || '#';
        return a;
    }

    function init() {
        document.querySelectorAll('.bkbg-value-proposition-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                eyebrow:          opts.eyebrow          || '',
                showEyebrow:      opts.showEyebrow       !== false,
                headline:         opts.headline          || '',
                subheadline:      opts.subheadline       || '',
                showSubheadline:  opts.showSubheadline   !== false,
                benefits:         opts.benefits          || [],
                badges:           opts.badges            || [],
                showBadges:       opts.showBadges        !== false,
                ctaText:          opts.ctaText           || 'Get Started',
                ctaUrl:           opts.ctaUrl            || '#',
                ctaSecondaryText: opts.ctaSecondaryText  || '',
                ctaSecondaryUrl:  opts.ctaSecondaryUrl   || '#',
                showCta:          opts.showCta           !== false,
                showSecondaryCta: opts.showSecondaryCta  !== false,
                layout:           opts.layout            || 'center',
                benefitColumns:   opts.benefitColumns    || 2,
                style:            opts.style             || 'clean',
                borderRadius:     opts.borderRadius      !== undefined ? opts.borderRadius : 12,
                gap:              opts.gap               !== undefined ? opts.gap : 20,
                paddingV:         opts.paddingV          !== undefined ? opts.paddingV : 64,
                paddingH:         opts.paddingH          !== undefined ? opts.paddingH : 32,
                headlineFontSize: opts.headlineFontSize  !== undefined ? opts.headlineFontSize : 40,
                subFontSize:      opts.subFontSize       !== undefined ? opts.subFontSize : 18,
                benefitTitleSize: opts.benefitTitleSize  !== undefined ? opts.benefitTitleSize : 16,
                benefitTextSize:  opts.benefitTextSize   !== undefined ? opts.benefitTextSize : 14,
                bgColor:          opts.bgColor           || '#f8fafc',
                accentColor:      opts.accentColor       || '#6366f1',
                headlineColor:    opts.headlineColor     || '#0f172a',
                subColor:         opts.subColor          || '#475569',
                eyebrowColor:     opts.eyebrowColor      || '#6366f1',
                benefitBg:        opts.benefitBg         || '#ffffff',
                benefitBorderColor:opts.benefitBorderColor || '#e2e8f0',
                benefitTitleColor:opts.benefitTitleColor || '#1e293b',
                benefitTextColor: opts.benefitTextColor  || '#64748b',
                iconBg:           opts.iconBg            || '#ede9fe',
                badgeBg:          opts.badgeBg           || '#ffffff',
                badgeColor:       opts.badgeColor        || '#475569',
                ctaBg:            opts.ctaBg             || '#6366f1',
                ctaColor:         opts.ctaColor          || '#ffffff',
                ctaSecondaryColor:opts.ctaSecondaryColor || '#6366f1'
            };

            var textAlign   = o.layout === 'center' ? 'center' : 'left';
            var justifyContent = o.layout === 'center' ? 'center' : 'flex-start';
            var marginAuto  = o.layout === 'center' ? 'auto' : '0';
            var colTemplate = o.benefitColumns === 1 ? '1fr'
                            : o.benefitColumns === 3 ? '1fr 1fr 1fr'
                            : '1fr 1fr';

            /* ── Outer block ─────────────────────────────────── */
            var block = mk('div', 'bkbg-vp-block', {
                background: o.bgColor,
                padding: o.paddingV + 'px ' + o.paddingH + 'px',
                textAlign: textAlign,
                boxSizing: 'border-box'
            });

            /* ── Eyebrow ─────────────────────────────────────── */
            if (o.showEyebrow && o.eyebrow) {
                var eyebrow = mkText('div', 'bkbg-vp-eyebrow', o.eyebrow, {
                    background: o.accentColor + '18',
                    color: o.eyebrowColor
                });
                block.appendChild(eyebrow);
            }

            /* ── Headline ────────────────────────────────────── */
            if (o.headline) {
                var headline = mkText('h2', 'bkbg-vp-headline', o.headline, {
                    color: o.headlineColor,
                    maxWidth: '760px',
                    marginLeft: marginAuto,
                    marginRight: marginAuto
                });
                block.appendChild(headline);
            }

            /* ── Subheadline ─────────────────────────────────── */
            if (o.showSubheadline && o.subheadline) {
                var sub = mkText('p', 'bkbg-vp-sub', o.subheadline, {
                    color: o.subColor,
                    maxWidth: '620px',
                    marginLeft: marginAuto,
                    marginRight: marginAuto
                });
                block.appendChild(sub);
            }

            /* ── CTA buttons ─────────────────────────────────── */
            if (o.showCta || o.showSecondaryCta) {
                var ctas = mk('div', 'bkbg-vp-ctas', { justifyContent: justifyContent });

                if (o.showCta && o.ctaText) {
                    var ctaA = mkA('bkbg-vp-cta-primary', o.ctaUrl, {
                        background: o.ctaBg,
                        color: o.ctaColor,
                        borderRadius: o.borderRadius + 'px'
                    });
                    ctaA.textContent = o.ctaText;
                    ctas.appendChild(ctaA);
                }

                if (o.showSecondaryCta && o.ctaSecondaryText) {
                    var ctaB = mkA('bkbg-vp-cta-secondary', o.ctaSecondaryUrl, { color: o.ctaSecondaryColor });
                    ctaB.textContent = o.ctaSecondaryText;
                    ctas.appendChild(ctaB);
                }

                block.appendChild(ctas);
            }

            /* ── Benefits grid ───────────────────────────────── */
            if (o.benefits.length) {
                var grid = mk('div', 'bkbg-vp-benefits', {
                    gridTemplateColumns: colTemplate,
                    gap: o.gap + 'px'
                });

                o.benefits.forEach(function (ben) {
                    var card = mk('div', 'bkbg-vp-benefit', {
                        background: o.benefitBg,
                        borderRadius: o.borderRadius + 'px'
                    });

                    if (o.style === 'card') {
                        card.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
                        card.style.border = '1px solid ' + o.benefitBorderColor;
                    } else if (o.style === 'bordered') {
                        card.style.border = '1px solid ' + o.benefitBorderColor;
                    }

                    if (ben.icon) {
                        var iconWrap = mkText('div', 'bkbg-vp-benefit-icon', ben.icon, { background: o.iconBg });
                        card.appendChild(iconWrap);
                    }

                    var title = mkText('div', 'bkbg-vp-benefit-title', ben.title || '', {
                        color: o.benefitTitleColor
                    });
                    card.appendChild(title);

                    if (ben.description) {
                        var desc = mkText('div', 'bkbg-vp-benefit-text', ben.description, {
                            color: o.benefitTextColor
                        });
                        card.appendChild(desc);
                    }

                    grid.appendChild(card);
                });

                block.appendChild(grid);
            }

            /* ── Badges ──────────────────────────────────────── */
            if (o.showBadges && o.badges.length) {
                var badgesRow = mk('div', 'bkbg-vp-badges', { justifyContent: justifyContent });

                o.badges.forEach(function (badge) {
                    var b = mk('div', 'bkbg-vp-badge', {
                        background: o.badgeBg,
                        color: o.badgeColor,
                        borderColor: o.benefitBorderColor
                    });
                    if (badge.icon) {
                        var bIcon = document.createElement('span');
                        bIcon.textContent = badge.icon;
                        b.appendChild(bIcon);
                    }
                    var bText = document.createElement('span');
                    bText.textContent = badge.text || '';
                    b.appendChild(bText);
                    badgesRow.appendChild(b);
                });

                block.appendChild(badgesRow);
            }

            /* ── Insert ──────────────────────────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
