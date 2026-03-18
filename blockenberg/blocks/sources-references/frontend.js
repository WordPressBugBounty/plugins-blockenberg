(function () {
    var _typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size','-d'],['sizeTablet','font-size','-t'],['sizeMobile','font-size','-m'],
        ['lineHeightDesktop','line-height','-d'],['lineHeightTablet','line-height','-t'],['lineHeightMobile','line-height','-m'],
        ['letterSpacingDesktop','letter-spacing','-d'],['letterSpacingTablet','letter-spacing','-t'],['letterSpacingMobile','letter-spacing','-m'],
        ['wordSpacingDesktop','word-spacing','-d'],['wordSpacingTablet','word-spacing','-t'],['wordSpacingMobile','word-spacing','-m']
    ];
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj) return;
        _typoKeys.forEach(function (k) {
            var v = obj[k[0]];
            if (v !== undefined && v !== '') el.style.setProperty(prefix + k[1] + (k[2] || ''), String(v));
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-src-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                references: [],
                style: 'academic',
                label: 'Sources & References',
                showLabel: true,
                showAuthor: true,
                showPublication: true,
                showDate: true,
                showUrl: true,
                openInNewTab: true,
                bgColor: '#f8fafc',
                labelColor: '#111827',
                numberColor: '#6366f1',
                titleColor: '#111827',
                authorColor: '#374151',
                pubColor: '#6b7280',
                urlColor: '#6366f1',
                borderColor: '#e2e8f0',
                cardBg: '#ffffff',
                borderRadius: 8,
                paddingTop: 40,
                paddingBottom: 40
            }, opts);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-src-wrap bkbg-src-' + o.style;
            wrap.style.cssText = 'background:' + o.bgColor + ';padding:' + o.paddingTop + 'px 0 ' + o.paddingBottom + 'px;box-sizing:border-box;';

            /* ── typography CSS vars ── */
            typoCssVarsForEl(wrap, o.labelTypo, '--bksrc-lb-');
            typoCssVarsForEl(wrap, o.refTypo, '--bksrc-rf-');

            if (o.showLabel && o.label) {
                var lbl = document.createElement('h3');
                lbl.className = 'bkbg-src-label';
                lbl.style.cssText = 'color:' + o.labelColor + ';border-bottom:2px solid ' + o.borderColor + ';margin:0 0 20px;padding-bottom:10px;';
                lbl.textContent = o.label;
                wrap.appendChild(lbl);
            }

            var target = o.openInNewTab ? '_blank' : '_self';
            var refs = o.references || [];

            if (o.style === 'academic') {
                refs.forEach(function (r, i) {
                    var item = document.createElement('div');
                    item.className = 'bkbg-src-item';
                    item.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;line-height:1.65;align-items:flex-start;';

                    var num = document.createElement('span');
                    num.className = 'bkbg-src-num';
                    num.style.cssText = 'flex-shrink:0;min-width:28px;color:' + o.numberColor + ';';
                    num.textContent = '[' + (i + 1) + ']';
                    item.appendChild(num);

                    var body = document.createElement('div');
                    var parts = [];
                    if (o.showAuthor && r.author) parts.push('<span class="bkbg-src-author" style="font-style:italic;color:' + o.authorColor + '">' + esc(r.author) + '.</span> ');
                    parts.push('<span class="bkbg-src-title" style="color:' + o.titleColor + '">"' + esc(r.title) + '."</span>');
                    if (o.showPublication && r.publication) parts.push(' <span style="color:' + o.pubColor + '">' + esc(r.publication) + '.</span>');
                    if (o.showDate && r.accessDate) parts.push(' <span style="color:' + o.pubColor + '">Accessed ' + esc(r.accessDate) + '.</span>');
                    if (o.showUrl && r.url) parts.push(' <a href="' + esc(r.url) + '" target="' + target + '" rel="noopener noreferrer" class="bkbg-src-url" style="color:' + o.urlColor + ';word-break:break-all;">' + esc(r.url) + '</a>');
                    body.innerHTML = parts.join('');
                    item.appendChild(body);
                    wrap.appendChild(item);
                });
            } else if (o.style === 'cards') {
                refs.forEach(function (r, i) {
                    var card = document.createElement('div');
                    card.className = 'bkbg-src-item';
                    card.style.cssText = 'display:flex;gap:12px;padding:14px 16px;margin-bottom:10px;border-radius:' + o.borderRadius + 'px;border:1px solid ' + o.borderColor + ';background:' + o.cardBg + ';';

                    var num = document.createElement('span');
                    num.className = 'bkbg-src-num';
                    num.style.cssText = 'flex-shrink:0;color:' + o.numberColor + ';align-self:flex-start;margin-top:2px;';
                    num.textContent = i + 1;
                    card.appendChild(num);

                    var cbody = document.createElement('div');
                    cbody.className = 'bkbg-src-card-body';
                    cbody.style.cssText = 'flex:1;min-width:0;';

                    var ctitle = document.createElement('p');
                    ctitle.className = 'bkbg-src-card-title';
                    ctitle.style.cssText = 'margin:0 0 3px;color:' + o.titleColor + ';';
                    ctitle.textContent = r.title;
                    cbody.appendChild(ctitle);

                    var metaParts = [];
                    if (o.showAuthor && r.author) metaParts.push('<span style="color:' + o.authorColor + '">' + esc(r.author) + '</span>');
                    if (o.showPublication && r.publication) metaParts.push('<span style="color:' + o.pubColor + '">' + esc(r.publication) + '</span>');
                    if (o.showDate && r.accessDate) metaParts.push('<span style="color:' + o.pubColor + '">' + esc(r.accessDate) + '</span>');
                    if (metaParts.length) {
                        var meta = document.createElement('p');
                        meta.className = 'bkbg-src-card-meta';
                        meta.style.cssText = 'margin:0 0 4px;display:flex;flex-wrap:wrap;gap:4px;';
                        meta.innerHTML = metaParts.join('<span class="bkbg-src-sep" style="opacity:.4;">·</span>');
                        cbody.appendChild(meta);
                    }
                    if (o.showUrl && r.url) {
                        var link = document.createElement('a');
                        link.className = 'bkbg-src-card-url';
                        link.href = r.url;
                        link.target = target;
                        link.rel = 'noopener noreferrer';
                        link.style.cssText = 'display:block;word-break:break-all;color:' + o.urlColor + ';margin-top:4px;';
                        link.textContent = r.url;
                        cbody.appendChild(link);
                    }
                    card.appendChild(cbody);
                    wrap.appendChild(card);
                });
            } else {
                /* minimal */
                var ul = document.createElement('ul');
                ul.className = 'bkbg-src-list';
                ul.style.cssText = 'list-style:none;padding:0;margin:0;';
                refs.forEach(function (r, i) {
                    var li = document.createElement('li');
                    li.className = 'bkbg-src-item';
                    li.style.cssText = 'margin-bottom:8px;line-height:1.6;color:' + o.titleColor + ';';
                    var parts = [];
                    parts.push('<span class="bkbg-src-num" style="margin-right:4px;color:' + o.numberColor + '">' + (i + 1) + '.</span>');
                    if (o.showAuthor && r.author) parts.push('<span style="color:' + o.authorColor + '">' + esc(r.author) + '. </span>');
                    parts.push('<span class="bkbg-src-title" style="color:' + o.titleColor + '">' + esc(r.title) + '</span>');
                    if (o.showPublication && r.publication) parts.push('<span style="color:' + o.pubColor + '">, ' + esc(r.publication) + '</span>');
                    if (o.showUrl && r.url) parts.push(' — <a href="' + esc(r.url) + '" target="' + target + '" rel="noopener noreferrer" style="color:' + o.urlColor + '">' + esc(r.url) + '</a>');
                    li.innerHTML = parts.join('');
                    ul.appendChild(li);
                });
                wrap.appendChild(ul);
            }

            el.parentNode.insertBefore(wrap, el);
        });
    }

    function esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
