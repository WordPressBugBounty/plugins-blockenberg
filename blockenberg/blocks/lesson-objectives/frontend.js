(function () {
    var _typoKeys = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
    };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(typo).forEach(function (k) {
            var v = typo[k]; if (v === '' || v == null) return;
            var css = _typoKeys[k]; if (!css) return;
            if ((k === 'letterSpacing' || k === 'wordSpacing') && typeof v === 'number') v = v + 'px';
            if ((/^(sizeDesktop|sizeTablet|sizeMobile)$/).test(k) && typeof v === 'number') v = v + 'px';
            el.style.setProperty(prefix + css, '' + v);
        });
    }

    var BULLETS = { check: '✓', arrow: '→', circle: '●', star: '★' };
    var LEVELS = { beginner: '🟢 Beginner', intermediate: '🟡 Intermediate', advanced: '🔴 Advanced', all: '🔵 All Levels' };

    function init() {
        document.querySelectorAll('.bkbg-lob-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                heading: 'What You\'ll Learn', headingIcon: '🎯', showIcon: true,
                objectives: [],
                showLevel: true, level: 'beginner',
                showReadTime: true, readTime: '',
                bulletStyle: 'check', customBullet: '✓',
                style: 'card', columns: 1,
                bgColor: '#f0fdf4', borderColor: '#86efac', accentColor: '#16a34a',
                headingColor: '#14532d', bulletBg: '#dcfce7', bulletColor: '#16a34a',
                textColor: '#166534', metaColor: '#4b7a5a',
                levelBg: '#16a34a', levelColor: '#ffffff',
                borderRadius: 10, paddingTop: 0, paddingBottom: 0
            }, opts);

            var bullet = o.bulletStyle === 'custom' ? (o.customBullet || '✓') : (BULLETS[o.bulletStyle] || '✓');

            var outer = document.createElement('div');
            outer.style.cssText = 'padding:' + o.paddingTop + 'px 0 ' + o.paddingBottom + 'px;';

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-lob-wrap';

            typoCssVarsForEl(wrap, o.headingTypo, '--bkbg-lob-h-');
            typoCssVarsForEl(wrap, o.objectiveTypo, '--bkbg-lob-o-');
            var wrapCss = 'padding:20px 24px;box-sizing:border-box;font-family:inherit;';
            if (o.style === 'card') {
                wrapCss += 'background:' + o.bgColor + ';border:1px solid ' + o.borderColor + ';border-radius:' + o.borderRadius + 'px;';
            } else if (o.style === 'left-border') {
                wrapCss += 'background:' + o.bgColor + ';border:1px solid ' + o.borderColor + ';border-left:4px solid ' + o.accentColor + ';border-radius:' + o.borderRadius + 'px;';
            } else if (o.style === 'top-border') {
                wrapCss += 'background:' + o.bgColor + ';border:1px solid ' + o.borderColor + ';border-top:4px solid ' + o.accentColor + ';border-radius:0 0 ' + o.borderRadius + 'px ' + o.borderRadius + 'px;';
            } else {
                wrapCss += 'background:transparent;padding:0;';
            }
            wrap.style.cssText = wrapCss;

            /* Header */
            var hdr = document.createElement('div');
            hdr.className = 'bkbg-lob-header';
            hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;';

            var titleRow = document.createElement('div');
            titleRow.style.cssText = 'display:flex;align-items:center;gap:10px;';
            if (o.showIcon && o.headingIcon) {
                var icon = document.createElement('span');
                icon.className = 'bkbg-lob-icon';
                icon.style.cssText = 'font-size:24px;line-height:1;flex-shrink:0;';
                var _IP = window.bkbgIconPicker;
                if (_IP && o.headingIconType && o.headingIconType !== 'custom-char') {
                    var _iconNode = _IP.buildFrontendIcon(o.headingIconType, o.headingIcon, o.headingIconDashicon, o.headingIconImageUrl, o.headingIconDashiconColor);
                    if (_iconNode) icon.appendChild(_iconNode);
                    else icon.textContent = o.headingIcon;
                } else {
                    icon.textContent = o.headingIcon;
                }
                titleRow.appendChild(icon);
            }
            var h3 = document.createElement('h3');
            h3.className = 'bkbg-lob-heading';
            h3.style.color = o.headingColor;
            h3.innerHTML = o.heading;
            titleRow.appendChild(h3);
            hdr.appendChild(titleRow);

            var meta = document.createElement('div');
            meta.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
            if (o.showLevel && o.level) {
                var lvl = document.createElement('span');
                lvl.style.cssText = 'background:' + o.levelBg + ';color:' + o.levelColor + ';font-size:11px;padding:3px 9px;border-radius:20px;font-weight:600;';
                lvl.textContent = LEVELS[o.level] || o.level;
                meta.appendChild(lvl);
            }
            if (o.showReadTime && o.readTime) {
                var rt = document.createElement('span');
                rt.style.cssText = 'font-size:12px;color:' + o.metaColor + ';';
                rt.textContent = '⏱ ' + o.readTime;
                meta.appendChild(rt);
            }
            hdr.appendChild(meta);
            wrap.appendChild(hdr);

            /* Objectives */
            var grid = document.createElement('div');
            grid.className = 'bkbg-lob-grid';
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + (o.columns || 1) + ',1fr);gap:10px;';
            (o.objectives || []).forEach(function (obj) {
                var item = document.createElement('div');
                item.className = 'bkbg-lob-item';
                item.style.cssText = 'display:flex;align-items:flex-start;gap:10px;';

                var bul = document.createElement('span');
                bul.className = 'bkbg-lob-bullet';
                bul.style.cssText = 'background:' + o.bulletBg + ';color:' + o.bulletColor + ';width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;margin-top:1px;';
                bul.textContent = bullet;

                var txt = document.createElement('p');
                txt.className = 'bkbg-lob-text';
                txt.style.color = o.textColor;
                txt.innerHTML = obj.text || '';

                item.appendChild(bul);
                item.appendChild(txt);
                grid.appendChild(item);
            });
            wrap.appendChild(grid);

            outer.appendChild(wrap);
            el.parentNode.insertBefore(outer, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
