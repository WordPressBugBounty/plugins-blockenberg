(function () {
    function init() {
        document.querySelectorAll('.bkbg-ts-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                heading: '', showHeading: false,
                members: [], perView: 3,
                autoplay: false, autoplayDelay: 4000,
                showArrows: true, showDots: true,
                showBio: true, showSocials: true, showTag: true,
                cardStyle: 'default', avatarSize: 80, avatarRadius: 50, cardRadius: 12,
                paddingTop: 0, paddingBottom: 0,
                bgColor: '', cardBg: '#ffffff', cardBorder: '#e5e7eb',
                nameColor: '#111827', roleColor: '#6366f1', bioColor: '#6b7280',
                tagBg: '#ede9fe', tagColor: '#6366f1', socialColor: '#6b7280',
                dotColor: '#d1d5db', dotActive: '#6366f1',
                arrowBg: '#ffffff', arrowColor: '#374151', accentColor: '#6366f1'
            }, opts);

            var members = o.members || [];
            if (!members.length) { appEl.style.display = 'none'; return; }

            function mk(tag, cls, style, text) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                if (text != null) n.textContent = text;
                return n;
            }

            var section = mk('div', 'bkbg-ts-section', {
                background: o.bgColor || undefined,
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });

            if (o.showHeading && o.heading) {
                section.appendChild(mk('h2', 'bkbg-ts-heading', { color: o.nameColor }, o.heading));
            }

            /* responsive perView */
            var perView = parseInt(o.perView, 10) || 3;

            var viewport = mk('div', 'bkbg-ts-viewport');
            var track = mk('div', 'bkbg-ts-track');

            members.forEach(function (m) {
                var slide = mk('div', 'bkbg-ts-slide');
                slide.style.width = (100 / perView) + '%';

                var isCentered = o.cardStyle === 'centered';
                var isHorizontal = o.cardStyle === 'horizontal';

                var card = mk('div', 'bkbg-ts-card bkbg-ts-' + o.cardStyle, {
                    background: o.cardBg,
                    borderColor: o.cardBorder,
                    borderRadius: o.cardRadius + 'px'
                });

                var body = mk('div', 'bkbg-ts-card-body');

                /* avatar */
                var avatarWrap = mk('div', 'bkbg-ts-avatar-wrap', {
                    width: o.avatarSize + 'px',
                    height: o.avatarSize + 'px',
                    borderRadius: o.avatarRadius + '%'
                });
                if (m.imageUrl) {
                    var img = document.createElement('img');
                    img.src = m.imageUrl;
                    img.alt = m.imageAlt || m.name || '';
                    avatarWrap.appendChild(img);
                } else {
                    avatarWrap.textContent = '👤';
                }

                var textWrap = mk('div', 'bkbg-ts-text', { flex: 1 });

                if (o.showTag && m.tag) {
                    textWrap.appendChild(mk('span', 'bkbg-ts-tag', { background: o.tagBg, color: o.tagColor }, m.tag));
                }

                var nameEl = mk('h3', 'bkbg-ts-name', { color: o.nameColor }, m.name || '');
                textWrap.appendChild(nameEl);

                if (m.role) {
                    textWrap.appendChild(mk('p', 'bkbg-ts-role', { color: o.roleColor }, m.role));
                }

                if (o.showBio && m.bio) {
                    var bio = mk('p', 'bkbg-ts-bio', { color: o.bioColor }, '');
                    bio.innerHTML = m.bio;
                    textWrap.appendChild(bio);
                }

                if (o.showSocials && (m.linkedin || m.twitter || m.email || m.website)) {
                    var socials = mk('div', 'bkbg-ts-socials');
                    var addSocial = function (url, icon, label) {
                        if (!url) return;
                        var link = mk('a', 'bkbg-ts-social', { color: o.socialColor, border: '1px solid ' + o.cardBorder }, icon);
                        link.href = url.indexOf('@') > -1 ? 'mailto:' + url : url;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.title = label;
                        socials.appendChild(link);
                    };
                    addSocial(m.linkedin, 'in', 'LinkedIn');
                    addSocial(m.twitter, '𝕏', 'Twitter/X');
                    addSocial(m.email, '✉', 'Email');
                    addSocial(m.website, '🌐', 'Website');
                    textWrap.appendChild(socials);
                }

                if (isHorizontal) {
                    body.appendChild(avatarWrap);
                    body.appendChild(textWrap);
                } else {
                    body.appendChild(avatarWrap);
                    body.appendChild(textWrap);
                }
                card.appendChild(body);
                slide.appendChild(card);
                track.appendChild(slide);
            });

            viewport.appendChild(track);
            section.appendChild(viewport);

            /* navigation */
            var current = 0;
            var maxSlide = Math.max(0, members.length - perView);

            var nav = mk('div', 'bkbg-ts-nav');
            var prevBtn, nextBtn, dots;

            function goTo(idx) {
                current = Math.max(0, Math.min(idx, maxSlide));
                track.style.transform = 'translateX(-' + (current * (100 / perView)) + '%)';
                if (prevBtn) { prevBtn.classList.toggle('disabled', current === 0); }
                if (nextBtn) { nextBtn.classList.toggle('disabled', current >= maxSlide); }
                if (dots) {
                    dots.querySelectorAll('.bkbg-ts-dot').forEach(function (d, i) {
                        d.classList.toggle('active', i === current);
                        d.style.background = i === current ? o.dotActive : o.dotColor;
                        d.style.width = i === current ? '22px' : '8px';
                    });
                }
            }

            if (o.showArrows) {
                prevBtn = mk('div', 'bkbg-ts-arrow', { background: o.arrowBg, color: o.arrowColor, borderColor: o.cardBorder }, '←');
                prevBtn.addEventListener('click', function () { goTo(current - 1); });
                nav.appendChild(prevBtn);
            }

            if (o.showDots) {
                dots = mk('div', 'bkbg-ts-dots');
                members.forEach(function (_, i) {
                    var d = mk('div', 'bkbg-ts-dot' + (i === 0 ? ' active' : ''), { background: i === 0 ? o.dotActive : o.dotColor });
                    if (i === 0) { d.style.width = '22px'; }
                    d.addEventListener('click', function () { goTo(i); });
                    dots.appendChild(d);
                });
                nav.appendChild(dots);
            }

            if (o.showArrows) {
                nextBtn = mk('div', 'bkbg-ts-arrow', { background: o.arrowBg, color: o.arrowColor, borderColor: o.cardBorder }, '→');
                nextBtn.addEventListener('click', function () { goTo(current + 1); });
                nav.appendChild(nextBtn);
            }

            goTo(0);
            section.appendChild(nav);

            /* autoplay */
            if (o.autoplay) {
                setInterval(function () {
                    goTo(current >= maxSlide ? 0 : current + 1);
                }, o.autoplayDelay || 4000);
            }

            /* responsive: reduce perView on small screens */
            function handleResize() {
                var w = viewport.offsetWidth;
                var rPV = perView;
                if (w < 480) rPV = 1;
                else if (w < 768) rPV = Math.min(2, perView);
                track.querySelectorAll('.bkbg-ts-slide').forEach(function (s) { s.style.width = (100 / rPV) + '%'; });
            }
            window.addEventListener('resize', handleResize);
            handleResize();

            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
