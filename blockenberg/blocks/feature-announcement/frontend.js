(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = {
            family: 'font-family', weight: 'font-weight',
            transform: 'text-transform', style: 'font-style', decoration: 'text-decoration'
        };
        Object.keys(m).forEach(function (k) {
            if (typo[k]) el.style.setProperty(prefix + m[k], typo[k]);
        });
        var r = {
            size: 'font-size', lineHeight: 'line-height',
            letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
        };
        Object.keys(r).forEach(function (k) {
            ['Desktop', 'Tablet', 'Mobile'].forEach(function (d, i) {
                var v = typo[k + d];
                if (v === undefined || v === '') return;
                var suffix = ['-d', '-t', '-m'][i];
                var unit = typo[k + 'Unit'] || ('size' === k ? 'px' : (k === 'lineHeight' ? '' : 'px'));
                el.style.setProperty(prefix + r[k] + suffix, v + unit);
            });
        });
    }

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function tx(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }
    function ap(parent) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) parent.appendChild(c); });
        return parent;
    }

    var categoryLabels = {
        'new-feature':  '🆕 New Feature',
        'improvement':  '⚡ Improvement',
        'bugfix':       '🐛 Bug Fix',
        'deprecation':  '⚠️ Deprecation',
        'security':     '🔒 Security',
        'integration':  '📦 Integration'
    };
    var statusLabels = {
        'available':   '✅ Available Now',
        'beta':        '🧪 Beta',
        'coming-soon': '🚀 Coming Soon',
        'deprecated':  '⚠️ Deprecated'
    };

    function init() {
        document.querySelectorAll('.bkbg-feature-announcement-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                featureName: 'Feature Name', version: 'v1.0', showVersion: true,
                releaseDate: '', showDate: false,
                category: 'new-feature', status: 'available',
                featureIcon: '✨', showIcon: true,
                tagline: '', description: '', showDescription: true,
                highlights: [], showHighlights: true, highlightsLabel: "What's new",
                availablePlans: [], showPlans: true, plansLabel: 'Available on',
                ctaText: '', ctaUrl: '#', showCta: true,
                ctaSecondaryText: '', ctaSecondaryUrl: '#', showSecondaryCta: false,
                accentPosition: 'top',
                fontSize: 15, featureNameSize: 26, taglineSize: 16,
                lineHeight: 170, borderRadius: 12,
                bgColor: '#ffffff', borderColor: '#e2e8f0',
                accentColor: '#7c3aed', accentStripe: '#7c3aed',
                featureNameColor: '#0f172a', taglineColor: '#374151', textColor: '#4b5563',
                versionBg: '#ede9fe', versionColor: '#5b21b6',
                categoryBg: '#f0fdf4', categoryColor: '#14532d',
                statusBg: '#dcfce7', statusColor: '#14532d',
                highlightIconColor: '#7c3aed',
                planBg: '#f5f3ff', planColor: '#5b21b6',
                ctaBg: '#7c3aed', ctaColor: '#ffffff',
                ctaSecondaryColor: '#7c3aed'
            }, opts);

            // ── Block container ───────────────────────────────────
            var block = mk('div', 'bkbg-fan-block' + (o.accentPosition === 'left' ? ' has-accent-left' : ''), {
                background: o.bgColor,
                border: '1px solid ' + o.borderColor,
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden',
                position: 'relative'
            });
            typoCssVarsForEl(o.typoName, '--bkbg-fan-nm-', block);
            typoCssVarsForEl(o.typoTagline, '--bkbg-fan-tl-', block);
            typoCssVarsForEl(o.typoBody, '--bkbg-fan-bd-', block);

            // ── Accent stripes ────────────────────────────────────
            if (o.accentPosition === 'top') {
                ap(block, mk('div', 'bkbg-fan-accent-top', { background: o.accentStripe }));
            } else if (o.accentPosition === 'left') {
                ap(block, mk('div', 'bkbg-fan-accent-left', { background: o.accentStripe }));
            }

            // ── Inner ─────────────────────────────────────────────
            var inner = mk('div', 'bkbg-fan-inner');

            // Meta badges row
            var meta = mk('div', 'bkbg-fan-meta');
            if (o.showIcon && o.featureIcon) {
                var fanIconType = o.featureIconType || 'custom-char';
                var fanIconSpan = mk('span', 'bkbg-fan-icon');
                if (fanIconType !== 'custom-char' && window.bkbgIconPicker) {
                    fanIconSpan.appendChild(window.bkbgIconPicker.buildFrontendIcon(fanIconType, o.featureIcon, o.featureIconDashicon, o.featureIconImageUrl, o.featureIconDashiconColor));
                } else {
                    fanIconSpan.textContent = o.featureIcon;
                }
                ap(meta, fanIconSpan);
            }
            // Category badge
            var catLabel = categoryLabels[o.category] || o.category;
            var catBadge = tx('span', 'bkbg-fan-badge', catLabel, { background: o.categoryBg, color: o.categoryColor });
            ap(meta, catBadge);
            // Version badge
            if (o.showVersion && o.version) {
                ap(meta, tx('span', 'bkbg-fan-badge', o.version, { background: o.versionBg, color: o.versionColor }));
            }
            // Status badge
            var stLabel = statusLabels[o.status] || o.status;
            ap(meta, tx('span', 'bkbg-fan-badge', stLabel, { background: o.statusBg, color: o.statusColor }));
            // Date
            if (o.showDate && o.releaseDate) {
                ap(meta, tx('span', 'bkbg-fan-date', o.releaseDate));
            }
            ap(inner, meta);

            // Feature name
            ap(inner, tx('h2', 'bkbg-fan-name', o.featureName, {
                color: o.featureNameColor
            }));

            // Tagline
            if (o.tagline) {
                ap(inner, tx('p', 'bkbg-fan-tagline', o.tagline, {
                    color: o.taglineColor
                }));
            }

            // Description
            if (o.showDescription && o.description) {
                ap(inner, tx('p', 'bkbg-fan-description', o.description, {
                    color: o.textColor
                }));
            }

            // Highlights
            if (o.showHighlights && o.highlights && o.highlights.length > 0) {
                var hlWrap = mk('div');
                var hlLabel = tx('div', 'bkbg-fan-highlights-label', o.highlightsLabel || "What's new", { color: o.accentColor });
                var hlList = mk('ul', 'bkbg-fan-highlights');
                o.highlights.forEach(function (h) {
                    if (!h) return;
                    var li = mk('li', 'bkbg-fan-highlight');
                    var icon = tx('span', 'bkbg-fan-highlight-icon', '✦', { color: o.highlightIconColor });
                    var text = tx('span', '', h, { color: o.textColor });
                    ap(li, icon, text);
                    ap(hlList, li);
                });
                ap(hlWrap, hlLabel, hlList);
                ap(inner, hlWrap);
            }

            // Plans
            if (o.showPlans && o.availablePlans && o.availablePlans.length > 0) {
                var plansRow = mk('div', 'bkbg-fan-plans');
                ap(plansRow, tx('span', 'bkbg-fan-plans-label', (o.plansLabel || 'Available on') + ':'));
                o.availablePlans.forEach(function (plan) {
                    if (!plan) return;
                    ap(plansRow, tx('span', 'bkbg-fan-plan-badge', plan, { background: o.planBg, color: o.planColor }));
                });
                ap(inner, plansRow);
            }

            // CTAs
            var ctas = mk('div', 'bkbg-fan-ctas');
            if (o.showCta && o.ctaText) {
                var primaryCta = mk('a', 'bkbg-fan-cta', {
                    background: o.ctaBg,
                    color: o.ctaColor,
                    padding: '11px 22px',
                    borderRadius: o.borderRadius + 'px'
                });
                primaryCta.textContent = o.ctaText;
                primaryCta.href = o.ctaUrl || '#';
                ap(ctas, primaryCta);
            }
            if (o.showSecondaryCta && o.ctaSecondaryText) {
                var secondaryCta = mk('a', 'bkbg-fan-cta is-secondary', {
                    borderColor: o.ctaSecondaryColor,
                    color: o.ctaSecondaryColor,
                    padding: '9px 22px',
                    borderRadius: o.borderRadius + 'px'
                });
                secondaryCta.textContent = o.ctaSecondaryText;
                secondaryCta.href = o.ctaSecondaryUrl || '#';
                ap(ctas, secondaryCta);
            }
            if (ctas.children.length > 0) {
                ap(inner, ctas);
            }

            ap(block, inner);
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
