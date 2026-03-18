(function () {
    var _typoKeys = [['family','font-family'],['weight','font-weight'],['style','font-style'],['decoration','text-decoration'],['transform','text-transform'],['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],['sizeUnit','*unit'],['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']];
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        var unit = obj.sizeUnit || 'px';
        for (var i = 0; i < _typoKeys.length; i++) {
            var k = _typoKeys[i][0], p = _typoKeys[i][1];
            if (p === '*unit' || obj[k] == null || obj[k] === '') continue;
            var v = obj[k];
            if (p === 'font-size-d' || p === 'font-size-t' || p === 'font-size-m') v = v + unit;
            el.style.setProperty(prefix + p, '' + v);
        }
    }
    function init() {
        document.querySelectorAll('.bkbg-spk-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Expert Speakers',
                heading: 'Learn From the Best',
                subtext: 'World-class speakers sharing their expertise and actionable strategies.',
                speakers: [
                    { name: 'Sarah Johnson', title: 'CEO', company: 'TechVentures', topic: 'Future of AI in Business', bio: 'Sarah has 15 years of experience leading high-growth tech startups.', avatarUrl: '', twitterUrl: '', linkedinUrl: '' }
                ],
                layout: 'grid',
                columns: 3,
                cardStyle: 'card',
                showBio: true,
                showTopic: true,
                showSocials: true,
                bgColor: '#ffffff',
                headingColor: '#111827',
                subColor: '#6b7280',
                eyebrowColor: '#6366f1',
                cardBg: '#f8fafc',
                cardBorder: '#e2e8f0',
                nameColor: '#111827',
                titleColor: '#6b7280',
                topicBg: '#ede9fe',
                topicColor: '#5b21b6',
                bioColor: '#4b5563',
                socialColor: '#6366f1',
                accentColor: '#6366f1',
                maxWidth: 1200,
                paddingTop: 80,
                paddingBottom: 80
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-spk-inner';
            wrap.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';
            typoCssVarsForEl(wrap, o.eyebrowTypo, '--bkspk-ey-');
            typoCssVarsForEl(wrap, o.headingTypo, '--bkspk-hd-');
            typoCssVarsForEl(wrap, o.subtextTypo, '--bkspk-st-');
            typoCssVarsForEl(wrap, o.nameTypo, '--bkspk-nm-');
            typoCssVarsForEl(wrap, o.descTypo, '--bkspk-ds-');

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-spk-header';

            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-spk-eyebrow';
            eyebrow.style.color = o.eyebrowColor;
            eyebrow.innerHTML = o.eyebrow;

            var heading = document.createElement('h2');
            heading.className = 'bkbg-spk-heading';
            heading.style.cssText = 'color:' + o.headingColor;
            heading.innerHTML = o.heading;

            var sub = document.createElement('p');
            sub.className = 'bkbg-spk-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;

            header.appendChild(eyebrow);
            header.appendChild(heading);
            header.appendChild(sub);
            wrap.appendChild(header);

            /* Grid */
            var isList = o.layout === 'list';
            var isFeatured = o.layout === 'featured';

            var grid = document.createElement('div');
            grid.className = 'bkbg-spk-grid' + (isList ? ' bkbg-spk-list' : '') + (isFeatured ? ' bkbg-spk-featured' : '');
            if (!isList) {
                grid.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';
            }

            (o.speakers || []).forEach(function (s) {
                var card = document.createElement('div');
                card.className = 'bkbg-spk-card style-' + o.cardStyle;
                if (o.cardStyle === 'card') {
                    card.style.cssText = 'background:' + o.cardBg + ';box-shadow:0 2px 12px rgba(0,0,0,0.06);text-align:center;';
                } else if (o.cardStyle === 'bordered') {
                    card.style.cssText = 'border-color:' + o.cardBorder + ';text-align:center;';
                } else {
                    card.style.cssText = 'text-align:center;';
                }

                /* Inner container for list layout */
                var cardInner = document.createElement('div');
                cardInner.className = 'bkbg-spk-card-inner';

                /* Avatar */
                var avatarWrap = document.createElement('div');
                avatarWrap.className = 'bkbg-spk-avatar-wrap';
                avatarWrap.style.background = o.accentColor;

                if (s.avatarUrl) {
                    var img = document.createElement('img');
                    img.src = s.avatarUrl;
                    img.alt = s.name;
                    avatarWrap.appendChild(img);
                } else {
                    avatarWrap.textContent = (s.name || 'S').charAt(0).toUpperCase();
                    avatarWrap.style.cssText += ';color:#fff;font-weight:700;font-size:32px;justify-content:center;';
                }

                /* Info block for list layout */
                var infoDiv = document.createElement('div');
                infoDiv.className = 'bkbg-spk-info';

                var name = document.createElement('div');
                name.className = 'bkbg-spk-name';
                name.style.color = o.nameColor;
                name.textContent = s.name;

                var titleCo = document.createElement('div');
                titleCo.className = 'bkbg-spk-title-co';
                titleCo.style.color = o.titleColor;
                titleCo.textContent = s.title + (s.company ? ' · ' + s.company : '');

                infoDiv.appendChild(name);
                infoDiv.appendChild(titleCo);

                if (o.showTopic && s.topic) {
                    var badge = document.createElement('div');
                    badge.className = 'bkbg-spk-topic-badge';
                    badge.style.cssText = 'background:' + o.topicBg + ';color:' + o.topicColor;
                    badge.textContent = s.topic;
                    infoDiv.appendChild(badge);
                }

                if (o.showBio && s.bio) {
                    var bio = document.createElement('p');
                    bio.className = 'bkbg-spk-bio';
                    bio.style.color = o.bioColor;
                    bio.textContent = s.bio;
                    infoDiv.appendChild(bio);
                }

                if (o.showSocials && (s.twitterUrl || s.linkedinUrl)) {
                    var socials = document.createElement('div');
                    socials.className = 'bkbg-spk-socials';

                    if (s.twitterUrl) {
                        var tw = document.createElement('a');
                        tw.className = 'bkbg-spk-social-link';
                        tw.href = s.twitterUrl;
                        tw.target = '_blank';
                        tw.rel = 'noopener noreferrer';
                        tw.style.color = o.socialColor;
                        tw.textContent = '𝕏';
                        tw.title = 'Twitter/X';
                        socials.appendChild(tw);
                    }
                    if (s.linkedinUrl) {
                        var li = document.createElement('a');
                        li.className = 'bkbg-spk-social-link';
                        li.href = s.linkedinUrl;
                        li.target = '_blank';
                        li.rel = 'noopener noreferrer';
                        li.style.color = o.socialColor;
                        li.textContent = 'in';
                        li.title = 'LinkedIn';
                        socials.appendChild(li);
                    }
                    infoDiv.appendChild(socials);
                }

                if (isList) {
                    cardInner.appendChild(avatarWrap);
                    cardInner.appendChild(infoDiv);
                    card.appendChild(cardInner);
                } else {
                    card.appendChild(avatarWrap);
                    card.appendChild(infoDiv);
                }

                grid.appendChild(card);
            });

            wrap.appendChild(grid);
            el.appendChild(wrap);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
