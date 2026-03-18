(function () {
    var FORMAT_LABELS = { pdf: 'PDF', epub: 'EPUB', course: 'Course', template: 'Template', toolkit: 'Toolkit', guide: 'Guide', checklist: 'Checklist' };

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
        document.querySelectorAll('.bkbg-ebk-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                coverUrl: '', coverAlt: '',
                title: 'The Complete SEO Handbook',
                subtitle: 'Everything you need to rank #1 in Google.',
                authorName: '',
                format: 'pdf', formatLabel: '', pageCount: '',
                whatInside: [],
                showTestimonial: true,
                testimonialQuote: '',
                testimonialName: '',
                ctaLabel: 'Download Free →', ctaUrl: '#',
                price: 'Free', originalPrice: '',
                openInNewTab: false,
                layout: 'split', show3D: true,
                bgColor: '#f0f4ff',
                titleColor: '#111827', subtitleColor: '#374151', authorColor: '#6b7280',
                formatBadgeBg: '#6366f1', formatBadgeColor: '#ffffff',
                itemColor: '#374151',
                testimonialBg: '#ffffff', testimonialColor: '#374151', quoteColor: '#6366f1',
                ctaBg: '#6366f1', ctaColor: '#ffffff',
                priceColor: '#16a34a', origPriceColor: '#9ca3af',
                coverShadow: '#6366f160',
                borderRadius: 12, paddingTop: 60, paddingBottom: 60
            }, opts);

            var target = o.openInNewTab ? '_blank' : '_self';
            var fmtLabel = o.formatLabel || FORMAT_LABELS[o.format] || o.format.toUpperCase();

            var section = document.createElement('div');
            section.className = 'bkbg-ebk-section';
            section.style.cssText = 'background:' + o.bgColor + ';padding:' + o.paddingTop + 'px 0 ' + o.paddingBottom + 'px;box-sizing:border-box;font-family:inherit;';

            typoCssVarsForEl(o.typoTitle, '--bkbg-ebk-ttl-', section);
            typoCssVarsForEl(o.typoSubtitle, '--bkbg-ebk-sub-', section);
            typoCssVarsForEl(o.typoPrice, '--bkbg-ebk-prc-', section);
            typoCssVarsForEl(o.typoCta, '--bkbg-ebk-cta-', section);

            var inner = document.createElement('div');
            inner.className = 'bkbg-ebk-inner';
            inner.style.cssText = 'max-width:960px;margin:0 auto;padding:0 20px;';

            var layout = document.createElement('div');
            layout.className = 'bkbg-ebk-' + o.layout;

            if (o.layout === 'split') {
                layout.style.cssText = 'display:flex;gap:40px;align-items:center;flex-wrap:wrap;';
            } else if (o.layout === 'centered') {
                layout.style.cssText = 'display:flex;flex-direction:column;align-items:center;text-align:center;max-width:520px;margin:0 auto;';
            }

            /* Cover */
            if (o.layout !== 'minimal' && o.coverUrl) {
                var coverWrap = document.createElement('div');
                coverWrap.className = 'bkbg-ebk-cover-wrap';
                coverWrap.style.cssText = 'position:relative;flex-shrink:0;perspective:600px;';

                var img = document.createElement('img');
                img.className = 'bkbg-ebk-cover' + (o.show3D ? ' bkbg-ebk-cover-3d' : '');
                img.src = o.coverUrl;
                img.alt = o.coverAlt || o.title;
                img.style.cssText = 'width:220px;max-width:100%;border-radius:6px;display:block;' + (o.show3D ? 'transform:rotateY(-8deg);box-shadow:8px 8px 24px ' + o.coverShadow + ';' : 'box-shadow:4px 4px 16px ' + o.coverShadow + ';');

                var badge = document.createElement('span');
                badge.className = 'bkbg-ebk-format-badge';
                badge.style.cssText = 'position:absolute;top:6px;right:6px;background:' + o.formatBadgeBg + ';color:' + o.formatBadgeColor + ';font-size:11px;padding:2px 8px;border-radius:4px;font-weight:700;';
                badge.textContent = fmtLabel;

                coverWrap.appendChild(img);
                coverWrap.appendChild(badge);
                layout.appendChild(coverWrap);
            }

            /* Content */
            var content = document.createElement('div');
            content.className = 'bkbg-ebk-content';
            content.style.cssText = 'flex:1;min-width:280px;';

            /* Format badge above title */
            var topBadge = document.createElement('span');
            topBadge.className = 'bkbg-ebk-badge';
            topBadge.style.cssText = 'display:inline-block;background:' + o.formatBadgeBg + ';color:' + o.formatBadgeColor + ';font-size:12px;padding:3px 10px;border-radius:20px;font-weight:700;margin-bottom:8px;';
            topBadge.textContent = fmtLabel;
            content.appendChild(topBadge);

            var title = document.createElement('h2');
            title.className = 'bkbg-ebk-title';
            title.style.color = o.titleColor;
            title.innerHTML = o.title;
            content.appendChild(title);

            if (o.subtitle) {
                var sub = document.createElement('p');
                sub.className = 'bkbg-ebk-subtitle';
                sub.style.color = o.subtitleColor;
                sub.innerHTML = o.subtitle;
                content.appendChild(sub);
            }

            var priceRow = document.createElement('div');
            priceRow.className = 'bkbg-ebk-price-row';
            priceRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;';

            if (o.price) {
                var pr = document.createElement('span');
                pr.className = 'bkbg-ebk-price';
                pr.style.color = o.priceColor;
                pr.textContent = o.price;
                priceRow.appendChild(pr);
            }
            if (o.originalPrice) {
                var op = document.createElement('span');
                op.style.cssText = 'font-size:16px;text-decoration:line-through;color:' + o.origPriceColor + ';';
                op.textContent = o.originalPrice;
                priceRow.appendChild(op);
            }
            if (o.pageCount) {
                var pc = document.createElement('span');
                pc.style.cssText = 'font-size:12px;color:' + o.authorColor + ';';
                pc.textContent = '· ' + o.pageCount;
                priceRow.appendChild(pc);
            }
            content.appendChild(priceRow);

            /* Feature list */
            if (o.whatInside && o.whatInside.length) {
                var ul = document.createElement('ul');
                ul.className = 'bkbg-ebk-list';
                ul.style.cssText = 'list-style:none;padding:0;margin:0 0 16px;';
                var _IP = window.bkbgIconPicker;
                o.whatInside.forEach(function (it) {
                    var li = document.createElement('li');
                    li.className = 'bkbg-ebk-list-item';
                    li.style.cssText = 'display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;font-size:14px;line-height:1.5;color:' + o.itemColor + ';';
                    var iconSpan = document.createElement('span');
                    iconSpan.style.cssText = 'flex-shrink:0;font-size:15px;margin-top:1px;';
                    var _iType = it.iconType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor);
                        if (_in) iconSpan.appendChild(_in);
                        else iconSpan.textContent = it.icon || '✅';
                    } else {
                        iconSpan.textContent = it.icon || '✅';
                    }
                    li.appendChild(iconSpan);
                    var textSpan = document.createElement('span');
                    textSpan.textContent = it.item || '';
                    li.appendChild(textSpan);
                    ul.appendChild(li);
                });
                content.appendChild(ul);
            }

            /* Testimonial */
            if (o.showTestimonial && o.testimonialQuote) {
                var tbox = document.createElement('div');
                tbox.className = 'bkbg-ebk-testimonial';
                tbox.style.cssText = 'background:' + o.testimonialBg + ';border-radius:8px;padding:14px 16px;margin-bottom:16px;';
                tbox.innerHTML =
                    '<div style="font-size:28px;line-height:1;margin-bottom:4px;color:' + o.quoteColor + ';font-family:Georgia,serif;">"</div>' +
                    '<p style="margin:0 0 8px;font-size:13px;font-style:italic;line-height:1.6;color:' + o.testimonialColor + ';">' + esc(o.testimonialQuote) + '</p>' +
                    '<div style="font-size:12px;font-weight:600;color:' + o.authorColor + ';">' + esc(o.testimonialName) + '</div>';
                content.appendChild(tbox);
            }

            /* CTA */
            var cta = document.createElement('a');
            cta.className = 'bkbg-ebk-cta';
            cta.href = o.ctaUrl || '#';
            cta.target = target;
            if (o.openInNewTab) cta.rel = 'noopener noreferrer';
            cta.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor + ';';
            cta.textContent = o.ctaLabel;
            cta.addEventListener('mouseenter', function () { this.style.opacity = '0.9'; this.style.transform = 'translateY(-1px)'; });
            cta.addEventListener('mouseleave', function () { this.style.opacity = '1'; this.style.transform = ''; });
            content.appendChild(cta);

            layout.appendChild(content);
            inner.appendChild(layout);
            section.appendChild(inner);
            el.parentNode.insertBefore(section, el);
        });
    }

    function esc(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
