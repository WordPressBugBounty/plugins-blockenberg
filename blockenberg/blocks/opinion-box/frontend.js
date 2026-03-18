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
        document.querySelectorAll('.bkbg-opb-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                badgeText: 'My Take',
                opinion: '',
                authorName: '',
                authorTitle: '',
                avatarUrl: '',
                avatarAlt: '',
                style: 'featured',
                showAvatar: true,
                showBadge: true,
                bgColor: '#fefce8',
                borderColor: '#fde047',
                accentColor: '#ca8a04',
                badgeBg: '#ca8a04',
                badgeColor: '#ffffff',
                textColor: '#1c1917',
                authorColor: '#57534e',
                titleColor: '#78716c',
                avatarBg: '#d97706',
                avatarColor: '#ffffff',
                quoteMarkColor: '#fde047',
                borderRadius: 10,
                paddingTop: 4,
                paddingBottom: 4
            }, opts);

            var outer = document.createElement('div');
            outer.style.cssText = 'padding:' + (o.paddingTop * 8) + 'px 0 ' + (o.paddingBottom * 8) + 'px;';

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-opb-wrap bkbg-opb-' + o.style;

            typoCssVarsForEl(wrap, o.opinionTypo, '--bkbg-opb-op-');
            typoCssVarsForEl(wrap, o.authorNameTypo, '--bkbg-opb-an-');
            typoCssVarsForEl(wrap, o.authorTitleTypo, '--bkbg-opb-at-');

            if (o.style === 'featured') {
                wrap.style.cssText = 'background:' + o.bgColor + ';border:1px solid ' + o.borderColor + ';border-radius:' + o.borderRadius + 'px;padding:20px 24px;position:relative;overflow:hidden;box-sizing:border-box;font-family:inherit;';
            } else if (o.style === 'inline') {
                wrap.style.cssText = 'border-left:4px solid ' + o.accentColor + ';padding:4px 16px 4px 20px;box-sizing:border-box;font-family:inherit;';
            } else {
                /* quote */
                wrap.style.cssText = 'background:' + o.bgColor + ';border-radius:' + o.borderRadius + 'px;padding:24px 28px 20px;position:relative;box-sizing:border-box;font-family:inherit;';
            }

            /* Badge */
            if (o.showBadge && o.badgeText) {
                var badge = document.createElement('span');
                badge.className = 'bkbg-opb-badge';
                badge.style.cssText = 'display:inline-block;background:' + o.badgeBg + ';color:' + o.badgeColor + ';padding:3px 10px;border-radius:20px;margin-bottom:10px;';
                badge.textContent = o.badgeText;
                wrap.appendChild(badge);
            }

            /* Quote mark decoration */
            if (o.style === 'quote') {
                var qm = document.createElement('div');
                qm.className = 'bkbg-opb-quote-mark';
                qm.style.cssText = 'font-size:80px;line-height:.8;font-family:Georgia,serif;margin-bottom:12px;user-select:none;color:' + o.quoteMarkColor + ';';
                qm.textContent = '\u201C';
                wrap.appendChild(qm);
            }

            /* Opinion text */
            if (o.opinion) {
                var p = document.createElement('p');
                p.className = 'bkbg-opb-text';
                p.style.cssText = 'margin:0 0 12px;color:' + o.textColor + ';';
                p.innerHTML = o.opinion;
                wrap.appendChild(p);
            }

            /* Author row */
            if (o.authorName || o.authorTitle) {
                var row = document.createElement('div');
                row.className = 'bkbg-opb-author-row';
                row.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:12px;';

                if (o.showAvatar) {
                    var av = document.createElement('div');
                    av.className = 'bkbg-opb-avatar';
                    av.style.cssText = 'width:44px;height:44px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:' + o.avatarBg + ';border:2px solid ' + o.accentColor + ';';

                    if (o.avatarUrl) {
                        var img = document.createElement('img');
                        img.src = o.avatarUrl;
                        img.alt = o.avatarAlt || o.authorName;
                        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
                        av.appendChild(img);
                    } else {
                        var initials = (o.authorName || 'A').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
                        var ini = document.createElement('span');
                        ini.className = 'bkbg-opb-avatar-initials';
                        ini.style.cssText = 'font-weight:700;font-size:16px;color:' + o.avatarColor + ';';
                        ini.textContent = initials;
                        av.appendChild(ini);
                    }
                    row.appendChild(av);
                }

                var info = document.createElement('div');
                if (o.authorName) {
                    var an = document.createElement('p');
                    an.className = 'bkbg-opb-author-name';
                    an.style.cssText = 'margin:0;color:' + o.authorColor + ';';
                    an.textContent = o.authorName;
                    info.appendChild(an);
                }
                if (o.authorTitle) {
                    var at = document.createElement('p');
                    at.className = 'bkbg-opb-author-title';
                    at.style.cssText = 'margin:0;color:' + o.titleColor + ';';
                    at.textContent = o.authorTitle;
                    info.appendChild(at);
                }
                row.appendChild(info);
                wrap.appendChild(row);
            }

            outer.appendChild(wrap);
            el.parentNode.insertBefore(outer, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
