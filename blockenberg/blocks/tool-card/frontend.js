(function () {
    function halfStarHTML(color) {
        return '<span style="position:relative;display:inline-block;color:#d1d5db;line-height:1;">★<span style="position:absolute;left:0;top:0;width:50%;overflow:hidden;color:' + color + ';">★</span></span>';
    }

    function buildStars(rating, starColor) {
        var out = '';
        for (var i = 1; i <= 5; i++) {
            if (rating >= i) out += '<span style="color:' + starColor + '">★</span>';
            else if (rating >= i - 0.5) out += halfStarHTML(starColor);
            else out += '<span style="color:#d1d5db">☆</span>';
        }
        return out;
    }

    function init() {
        document.querySelectorAll('.bkbg-tlc-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                toolName: 'Notion', tagline: 'All-in-one workspace for notes, wikis, and projects',
                logoUrl: '', logoAlt: '', rating: 4.5, ratingCount: '2,300+ reviews',
                showRating: true, pricing: 'freemium', pricingNote: 'Free plan available · Paid from $8/mo',
                showPricing: true, description: 'Notion is a flexible all-in-one workspace that replaces your notes, wikis, tasks, and databases.',
                features: ['Unlimited pages and blocks', 'Real-time collaboration', 'Database views', 'API and integrations'],
                ctaLabel: 'Try Notion Free', ctaUrl: '#', badgeText: "Editor's Pick", showBadge: true,
                layout: 'horizontal', borderRadius: 12,
                bgColor: '#ffffff', borderColor: '#e2e8f0', accentColor: '#6366f1',
                nameColor: '#111827', taglineColor: '#6b7280', descColor: '#374151', featureColor: '#374151',
                starColor: '#f59e0b', pricingColor: '#374151',
                badgeBg: '#fef3c7', badgeColor: '#92400e', ctaBg: '#6366f1', ctaColor: '#ffffff'
            }, opts);

            var card = document.createElement('div');
            card.className = 'bkbg-tlc-card layout-' + o.layout;
            card.style.cssText = 'background:' + o.bgColor + ';border-color:' + o.borderColor + ';border-radius:' + o.borderRadius + 'px;';

            /* Sidebar */
            var sidebar = document.createElement('div');
            sidebar.className = 'bkbg-tlc-sidebar';

            if (o.logoUrl) {
                var logo = document.createElement('img');
                logo.className = 'bkbg-tlc-logo'; logo.src = o.logoUrl; logo.alt = o.logoAlt;
                logo.style.borderColor = o.borderColor;
                sidebar.appendChild(logo);
            } else {
                var placeholder = document.createElement('div');
                placeholder.className = 'bkbg-tlc-logo-placeholder';
                placeholder.style.background = o.accentColor + '22';
                placeholder.textContent = '🔧';
                sidebar.appendChild(placeholder);
            }

            if (o.showRating && o.layout !== 'compact') {
                var ratingDiv = document.createElement('div'); ratingDiv.className = 'bkbg-tlc-rating';
                var stars = document.createElement('span'); stars.className = 'bkbg-tlc-stars'; stars.innerHTML = buildStars(o.rating, o.starColor);
                var rc = document.createElement('span'); rc.className = 'bkbg-tlc-rating-count'; rc.style.color = o.taglineColor; rc.textContent = o.ratingCount;
                ratingDiv.appendChild(stars); ratingDiv.appendChild(rc);
                sidebar.appendChild(ratingDiv);
            }

            if (o.showPricing && o.layout !== 'compact') {
                var pill = document.createElement('div'); pill.className = 'bkbg-tlc-pricing-pill';
                pill.style.cssText = 'background:' + o.bgColor + ';border:1px solid ' + o.borderColor + ';';
                var pModel = document.createElement('span'); pModel.className = 'bkbg-tlc-pricing-model'; pModel.style.color = o.accentColor; pModel.textContent = o.pricing;
                var pNote = document.createElement('span'); pNote.className = 'bkbg-tlc-pricing-note'; pNote.style.color = o.pricingColor; pNote.textContent = o.pricingNote;
                pill.appendChild(pModel); pill.appendChild(pNote);
                sidebar.appendChild(pill);
            }

            var cta = document.createElement('a'); cta.className = 'bkbg-tlc-cta-btn';
            cta.href = o.ctaUrl; cta.textContent = o.ctaLabel;
            cta.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
            sidebar.appendChild(cta);
            card.appendChild(sidebar);

            /* Content */
            var content = document.createElement('div');
            content.className = 'bkbg-tlc-content';

            var header = document.createElement('div'); header.className = 'bkbg-tlc-header';
            var name = document.createElement('h3'); name.className = 'bkbg-tlc-name'; name.style.color = o.nameColor; name.textContent = o.toolName;
            header.appendChild(name);
            if (o.showBadge && o.badgeText) {
                var badge = document.createElement('span'); badge.className = 'bkbg-tlc-badge';
                badge.style.cssText = 'background:' + o.badgeBg + ';color:' + o.badgeColor;
                badge.textContent = o.badgeText;
                header.appendChild(badge);
            }
            content.appendChild(header);

            var tagline = document.createElement('p'); tagline.className = 'bkbg-tlc-tagline'; tagline.style.color = o.taglineColor; tagline.textContent = o.tagline;
            content.appendChild(tagline);

            var desc = document.createElement('p'); desc.className = 'bkbg-tlc-desc'; desc.style.color = o.descColor; desc.textContent = o.description;
            content.appendChild(desc);

            var ul = document.createElement('ul'); ul.className = 'bkbg-tlc-features';
            (o.features || []).forEach(function (f) {
                var li = document.createElement('li'); li.style.color = o.featureColor;
                var check = document.createElement('span'); check.className = 'bkbg-tlc-check'; check.style.color = o.accentColor; check.textContent = '✓';
                li.appendChild(check); li.appendChild(document.createTextNode(f));
                ul.appendChild(li);
            });
            content.appendChild(ul);
            card.appendChild(content);

            el.appendChild(card);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
