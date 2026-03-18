(function () {
    'use strict';

    function badgeColors(badge) {
        if (badge === 'skip')         return { bg: '#fee2e2', color: '#991b1b' };
        if (badge === 'best-value')   return { bg: '#dcfce7', color: '#14532d' };
        if (badge === 'top-pick')     return { bg: '#eff6ff', color: '#1e40af' };
        if (badge === 'award-winner') return { bg: '#fef9c3', color: '#713f12' };
        return { bg: '#fbbf24', color: '#451a03' }; // recommended / default
    }

    function badgeLabel(badge) {
        var map = {
            'recommended':  '⭐ Recommended',
            'best-value':   '💰 Best Value',
            'top-pick':     '🏅 Top Pick',
            'award-winner': '🏆 Award Winner',
            'skip':         '⚠️ Skip It',
            'none':         ''
        };
        return map[badge] || '';
    }

    function scoreFill(score, max) {
        return Math.min(100, Math.max(0, (score / max) * 100));
    }

    function el(tag, attrs) {
        var node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'textContent') { node.textContent = attrs[k]; return; }
                if (k === 'innerHTML')   { node.innerHTML   = attrs[k]; return; }
                if (k === 'style') {
                    Object.keys(attrs.style).forEach(function (s) {
                        node.style[s] = attrs.style[s];
                    });
                    return;
                }
                node.setAttribute(k, attrs[k]);
            });
        }
        return node;
    }

    function append(parent) {
        var children = Array.prototype.slice.call(arguments, 1);
        children.forEach(function (c) { if (c) parent.appendChild(c); });
        return parent;
    }

    function buildScore(o) {
        var display = o.scoreDisplay || 'circle';

        if (display === 'circle') {
            var circle = el('div', {
                className: 'bkbg-vb-score-circle',
                style: {
                    background: o.scoreCircleBg || '#6366f1',
                    color:      o.scoreCircleColor || '#fff'
                }
            });
            append(circle,
                el('span', { className: 'bkbg-vb-score-value', textContent: parseFloat(o.overallScore).toFixed(1) }),
                el('span', { className: 'bkbg-vb-score-max',   textContent: '/' + (o.scoreMax || 10) })
            );
            return circle;
        }

        if (display === 'bar') {
            var wrap = el('div', {
                className: 'bkbg-vb-score-bar-wrap',
                style: { color: o.headerColor || '#fff' }
            });
            var numRow = el('div', { style: { display: 'flex', alignItems: 'baseline', gap: '2px' } });
            append(numRow,
                el('span', { className: 'bkbg-vb-score-bar-num', textContent: parseFloat(o.overallScore).toFixed(1) }),
                el('span', { className: 'bkbg-vb-score-bar-max', textContent: '/' + (o.scoreMax || 10) })
            );
            var track = el('div', { className: 'bkbg-vb-score-bar-track' });
            var fill  = el('div', {
                className: 'bkbg-vb-score-bar-fill',
                style: {
                    width:      scoreFill(o.overallScore, o.scoreMax) + '%',
                    background: o.scoreCircleBg || '#6366f1'
                }
            });
            append(track, fill);
            append(wrap, numRow, track);
            return wrap;
        }

        // numeric
        var numeric = el('div', { style: { color: o.headerColor || '#fff', flexShrink: '0' } });
        append(numeric,
            el('div', {
                style: { fontSize: '36px', fontWeight: '900', lineHeight: '1' },
                textContent: parseFloat(o.overallScore).toFixed(1)
            }),
            el('div', {
                style: { fontSize: '12px', opacity: '.7' },
                textContent: o.scoreLabel || 'Overall Score'
            })
        );
        return numeric;
    }

    function buildHeader(o) {
        var header = el('div', {
            className: 'bkbg-vb-header',
            style: {
                background: o.headerBg || '#0f172a',
                color:      o.headerColor || '#fff'
            }
        });

        // Score
        append(header, buildScore(o));

        // Product info
        var info = el('div', { style: { flex: '1', minWidth: '180px' } });

        var nameEl = el('h3', {
            className: 'bkbg-vb-product-name',
            style: {
                color:    o.headerColor || '#fff'
            },
            textContent: o.productName || ''
        });
        append(info, nameEl);

        if (o.showTagline && o.productTagline) {
            append(info, el('div', {
                className: 'bkbg-vb-tagline',
                textContent: o.productTagline
            }));
        }

        if (o.badge && o.badge !== 'none') {
            var bColors = badgeColors(o.badge);
            var badge = el('span', {
                className: 'bkbg-vb-badge',
                style: { background: bColors.bg, color: bColors.color },
                textContent: badgeLabel(o.badge)
            });
            append(info, badge);
        }

        append(header, info);
        return header;
    }

    function buildProsCons(o) {
        var wrapper = el('div', { className: 'bkbg-vb-proscons' + (o.layout === 'stacked' ? ' is-stacked' : '') });

        // Pros
        var prosDiv = el('div', {
            className: 'bkbg-vb-pros',
            style: {
                background:  o.prosBg     || '#f0fdf4',
                color:       o.prosColor  || '#14532d',
                borderRight: '1px solid ' + (o.prosBorderColor || '#bbf7d0')
            }
        });
        append(prosDiv, el('span', {
            className: 'bkbg-vb-pros-label',
            textContent: o.prosLabel || '✅ Pros'
        }));
        var prosUl = el('ul');
        (o.pros || []).forEach(function (text) {
            if (!text) return;
            var li = el('li');
            append(li,
                el('i', { className: 'bkbg-vb-icon', style: { color: o.prosIconColor || '#22c55e' }, textContent: '✓' }),
                el('span', { textContent: text })
            );
            append(prosUl, li);
        });
        append(prosDiv, prosUl);

        // Cons
        var consDiv = el('div', {
            className: 'bkbg-vb-cons',
            style: {
                background: o.consBg    || '#fef2f2',
                color:      o.consColor || '#7f1d1d'
            }
        });
        append(consDiv, el('span', {
            className: 'bkbg-vb-cons-label',
            textContent: o.consLabel || '❌ Cons'
        }));
        var consUl = el('ul');
        (o.cons || []).forEach(function (text) {
            if (!text) return;
            var li = el('li');
            append(li,
                el('i', { className: 'bkbg-vb-icon', style: { color: o.consIconColor || '#ef4444' }, textContent: '✗' }),
                el('span', { textContent: text })
            );
            append(consUl, li);
        });
        append(consDiv, consUl);

        append(wrapper, prosDiv, consDiv);
        return wrapper;
    }

    function buildVerdict(o) {
        var verdictWrap = el('div', {
            className: 'bkbg-vb-verdict',
            style: {
                background:  o.verdictBg           || '#f8fafc',
                color:       o.verdictColor        || '#374151',
                borderTop:   '1px solid ' + (o.verdictBorderColor || '#e2e8f0')
            }
        });
        append(verdictWrap,
            el('span', { className: 'bkbg-vb-verdict-icon', textContent: '💬' }),
            el('p',    { className: 'bkbg-vb-verdict-text', textContent: o.verdictText || '' })
        );
        return verdictWrap;
    }

    function buildCtas(o) {
        var ctasDiv = el('div', {
            className: 'bkbg-vb-ctas',
            style: { borderTop: '1px solid ' + (o.borderColor || '#e2e8f0') }
        });

        if (o.showCta && o.ctaText) {
            var primary = el('a', {
                className: 'bkbg-vb-cta-primary',
                href:      o.ctaUrl || '#',
                style: {
                    background:   o.ctaBg    || '#6366f1',
                    color:        o.ctaColor || '#fff',
                    borderRadius: (o.borderRadius || 12) + 'px'
                },
                textContent: o.ctaText
            });
            append(ctasDiv, primary);
        }

        if (o.showSecondaryCta && o.ctaSecondaryText) {
            var secondary = el('a', {
                className: 'bkbg-vb-cta-secondary',
                href:      o.ctaSecondaryUrl || '#',
                style: {
                    background:   'transparent',
                    color:        o.ctaSecondaryColor || '#6366f1',
                    border:       '2px solid ' + (o.ctaSecondaryColor || '#6366f1'),
                    borderRadius: (o.borderRadius || 12) + 'px'
                },
                textContent: o.ctaSecondaryText
            });
            append(ctasDiv, secondary);
        }

        return ctasDiv;
    }

    function init() {
        document.querySelectorAll('.bkbg-verdict-box-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                productName:       'Product',
                productTagline:    '',
                showTagline:       true,
                overallScore:      8.7,
                scoreMax:          10,
                scoreLabel:        'Overall Score',
                scoreDisplay:      'circle',
                badge:             'recommended',
                pros:              [],
                cons:              [],
                prosLabel:         '✅ Pros',
                consLabel:         '❌ Cons',
                verdictText:       '',
                showVerdict:       true,
                ctaText:           '',
                ctaUrl:            '#',
                showCta:           false,
                ctaSecondaryText:  '',
                ctaSecondaryUrl:   '#',
                showSecondaryCta:  false,
                layout:            'split',
                borderRadius:      12,
                fontSize:          15,
                productNameSize:   24,
                bgColor:           '#fff',
                borderColor:       '#e2e8f0',
                headerBg:          '#0f172a',
                headerColor:       '#fff',
                scoreCircleBg:     '#6366f1',
                scoreCircleColor:  '#fff',
                prosBg:            '#f0fdf4',
                prosColor:         '#14532d',
                prosIconColor:     '#22c55e',
                consBg:            '#fef2f2',
                consColor:         '#7f1d1d',
                consIconColor:     '#ef4444',
                verdictBg:         '#f8fafc',
                verdictColor:      '#374151',
                verdictBorderColor:'#e2e8f0',
                ctaBg:             '#6366f1',
                ctaColor:          '#fff',
                ctaSecondaryColor: '#6366f1'
            }, opts);

            var block = el('div', {
                className: 'bkbg-vb-block',
                style: {
                    background:   o.bgColor     || '#fff',
                    border:       '1px solid ' + (o.borderColor || '#e2e8f0'),
                    borderRadius: (o.borderRadius || 12) + 'px',
                    overflow:     'hidden'
                }
            });

            // Set CSS variable for responsive breakpoint border
            block.style.setProperty('--bkbg-vb-border', o.borderColor || '#e2e8f0');

            append(block, buildHeader(o));
            append(block, buildProsCons(o));

            if (o.showVerdict && o.verdictText) {
                append(block, buildVerdict(o));
            }

            if ((o.showCta && o.ctaText) || (o.showSecondaryCta && o.ctaSecondaryText)) {
                append(block, buildCtas(o));
            }

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
