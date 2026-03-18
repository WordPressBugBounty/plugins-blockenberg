(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', style:'font-style',
            transform:'text-transform', decoration:'text-decoration',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', sizeUnit:'font-size-unit',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', lineHeightUnit:'line-height-unit',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', letterSpacingUnit:'letter-spacing-unit',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m', wordSpacingUnit:'word-spacing-unit' };
        var su = typo.sizeUnit || 'px', lu = typo.lineHeightUnit || '', lsu = typo.letterSpacingUnit || 'px', wu = typo.wordSpacingUnit || 'px';
        for (var k in m) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], css = m[k];
                if (css === 'font-size-d' || css === 'font-size-t' || css === 'font-size-m') v = v + su;
                else if ((css === 'line-height-d' || css === 'line-height-t' || css === 'line-height-m') && lu) v = v + lu;
                else if (css === 'letter-spacing-d' || css === 'letter-spacing-t' || css === 'letter-spacing-m') v = v + lsu;
                else if (css === 'word-spacing-d' || css === 'word-spacing-t' || css === 'word-spacing-m') v = v + wu;
                el.style.setProperty(prefix + css, '' + v);
            }
        }
    }

    var VERDICTS = {
        'true':         { icon: '✅', label: 'True',         color: '#15803d', bg: '#f0fdf4', border: '#86efac', scaleIdx: 0 },
        'mostly-true':  { icon: '🟢', label: 'Mostly True',  color: '#166534', bg: '#dcfce7', border: '#4ade80', scaleIdx: 1 },
        'mixed':        { icon: '🟡', label: 'Mixed',         color: '#92400e', bg: '#fffbeb', border: '#fcd34d', scaleIdx: 2 },
        'mostly-false': { icon: '🟠', label: 'Mostly False', color: '#9a3412', bg: '#fff7ed', border: '#fdba74', scaleIdx: 3 },
        'false':        { icon: '❌', label: 'False',         color: '#991b1b', bg: '#fef2f2', border: '#fca5a5', scaleIdx: 4 },
        'unverified':   { icon: '❓', label: 'Unverified',   color: '#1e3a5f', bg: '#eff6ff', border: '#93c5fd', scaleIdx: 2 },
        'misleading':   { icon: '⚠️', label: 'Misleading',   color: '#713f12', bg: '#fefce8', border: '#fde047', scaleIdx: 3 },
        'satire':       { icon: '🎭', label: 'Satire',        color: '#4c1d95', bg: '#f5f3ff', border: '#c4b5fd', scaleIdx: -1 }
    };
    var SCALE_COLORS = ['#15803d', '#166534', '#a16207', '#9a3412', '#991b1b'];

    function init() {
        document.querySelectorAll('.bkbg-fck-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                claim: '', verdict: 'mostly-false', explanation: '',
                sources: [], showSources: true, showRatingScale: true,
                showReviewer: false, reviewerName: '', reviewerTitle: '', reviewDate: '',
                openInNewTab: true,
                bgColor: '#ffffff', borderColor: '#e2e8f0', claimBg: '#f8fafc',
                claimColor: '#1e293b', labelColor: '#64748b', explanationColor: '#374151',
                sourceTitleColor: '#374151', sourceLinkColor: '#3b82f6', reviewerColor: '#6b7280',
                borderRadius: 10, paddingTop: 0, paddingBottom: 0
            }, opts);

            var v = VERDICTS[o.verdict] || VERDICTS['mostly-false'];
            var target = o.openInNewTab ? '_blank' : '_self';

            var outer = document.createElement('div');
            outer.style.cssText = 'padding:' + o.paddingTop + 'px 0 ' + o.paddingBottom + 'px;';

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-fck-wrap';
            wrap.style.cssText = 'background:' + o.bgColor + ';border:1px solid ' + o.borderColor + ';border-radius:' + o.borderRadius + 'px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.06);box-sizing:border-box;font-family:inherit;';
            typoCssVarsForEl(o.typoClaim || {}, '--bkbg-fck-cl-', wrap);
            typoCssVarsForEl(o.typoExplanation || {}, '--bkbg-fck-ex-', wrap);

            /* Verdict banner */
            var banner = document.createElement('div');
            banner.className = 'bkbg-fck-banner';
            banner.style.cssText = 'background:' + v.bg + ';border-bottom:1px solid ' + v.border + ';padding:16px 20px;display:flex;align-items:center;gap:14px;';
            banner.innerHTML =
                '<span class="bkbg-fck-icon" style="font-size:32px;line-height:1;flex-shrink:0;">' + v.icon + '</span>' +
                '<div><div class="bkbg-fck-verdict-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:' + o.labelColor + ';margin-bottom:2px;">Verdict</div>' +
                '<div class="bkbg-fck-verdict-text" style="font-size:20px;font-weight:800;color:' + v.color + ';">' + esc(v.label) + '</div></div>';
            wrap.appendChild(banner);

            /* Rating scale */
            if (o.showRatingScale) {
                var scale = document.createElement('div');
                scale.className = 'bkbg-fck-scale';
                scale.style.cssText = 'display:flex;gap:4px;padding:12px 20px;background:#f8fafc;border-bottom:1px solid ' + o.borderColor + ';';
                for (var si = 0; si < 5; si++) {
                    var seg = document.createElement('div');
                    seg.style.cssText = 'flex:1;height:8px;border-radius:4px;background:' + (si === v.scaleIdx ? SCALE_COLORS[si] : (si < (v.scaleIdx || 0) ? SCALE_COLORS[si] + '55' : '#e2e8f0')) + ';';
                    scale.appendChild(seg);
                }
                wrap.appendChild(scale);
            }

            /* Claim */
            if (o.claim) {
                var claimSec = document.createElement('div');
                claimSec.className = 'bkbg-fck-claim';
                claimSec.style.cssText = 'background:' + o.claimBg + ';border-bottom:1px solid ' + o.borderColor + ';padding:14px 20px;';
                claimSec.innerHTML =
                    '<div class="bkbg-fck-section-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:' + o.labelColor + ';margin-bottom:6px;">Claim</div>' +
                    '<p class="bkbg-fck-claim-text" style="color:' + o.claimColor + ';margin:0;">' + o.claim + '</p>';
                wrap.appendChild(claimSec);
            }

            /* Analysis */
            if (o.explanation) {
                var hasSources = o.showSources && o.sources && o.sources.length > 0;
                var expSec = document.createElement('div');
                expSec.className = 'bkbg-fck-explanation';
                expSec.style.cssText = 'padding:16px 20px;' + (hasSources ? 'border-bottom:1px solid ' + o.borderColor + ';' : '');
                expSec.innerHTML =
                    '<div class="bkbg-fck-section-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:' + o.labelColor + ';margin-bottom:8px;">Our Analysis</div>' +
                    '<div class="bkbg-fck-explanation-body" style="color:' + o.explanationColor + ';">' + o.explanation + '</div>';
                wrap.appendChild(expSec);
            }

            /* Sources */
            if (o.showSources && o.sources && o.sources.length) {
                var srcSec = document.createElement('div');
                srcSec.className = 'bkbg-fck-sources';
                srcSec.style.cssText = 'padding:14px 20px;background:#fafafa;' + (o.showReviewer && (o.reviewerName || o.reviewDate) ? 'border-bottom:1px solid ' + o.borderColor + ';' : '');
                var srcHtml = '<div class="bkbg-fck-section-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:' + o.labelColor + ';margin-bottom:8px;">Sources</div><ol style="margin:0;padding-left:18px;">';
                o.sources.forEach(function (s) {
                    srcHtml += '<li style="margin-bottom:4px;font-size:13px;">';
                    if (s.url) {
                        srcHtml += '<a href="' + esc(s.url) + '" target="' + target + '" rel="noopener noreferrer" class="bkbg-fck-source-link" style="color:' + o.sourceLinkColor + ';text-decoration:none;">' + esc(s.title) + '</a>';
                    } else {
                        srcHtml += '<span style="color:' + o.sourceTitleColor + ';">' + esc(s.title) + '</span>';
                    }
                    srcHtml += '</li>';
                });
                srcHtml += '</ol>';
                srcSec.innerHTML = srcHtml;
                wrap.appendChild(srcSec);
            }

            /* Reviewer */
            if (o.showReviewer && (o.reviewerName || o.reviewDate)) {
                var rev = document.createElement('div');
                rev.className = 'bkbg-fck-reviewer';
                rev.style.cssText = 'padding:10px 20px;background:#f8fafc;border-top:1px solid ' + o.borderColor + ';display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;color:' + o.reviewerColor + ';';
                var nameStr = o.reviewerName + (o.reviewerTitle ? ' · ' + o.reviewerTitle : '');
                rev.innerHTML = '<span>' + esc(nameStr) + '</span>' + (o.reviewDate ? '<span>📅 ' + esc(o.reviewDate) + '</span>' : '');
                wrap.appendChild(rev);
            }

            outer.appendChild(wrap);
            el.parentNode.insertBefore(outer, el);
        });
    }

    function esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
