function typoCssVarsForEl(typo, prefix, el) {
    if (!typo || typeof typo !== 'object') return;
    var m = {
        family: 'font-family',
        weight: 'font-weight',
        style: 'font-style',
        decoration: 'text-decoration',
        transform: 'text-transform',
        sizeDesktop: 'font-size-d',
        sizeTablet: 'font-size-t',
        sizeMobile: 'font-size-m',
        lineHeightDesktop: 'line-height-d',
        lineHeightTablet: 'line-height-t',
        lineHeightMobile: 'line-height-m',
        letterSpacingDesktop: 'letter-spacing-d',
        letterSpacingTablet: 'letter-spacing-t',
        letterSpacingMobile: 'letter-spacing-m',
        wordSpacingDesktop: 'word-spacing-d',
        wordSpacingTablet: 'word-spacing-t',
        wordSpacingMobile: 'word-spacing-m'
    };
    Object.keys(m).forEach(function (k) {
        var v = typo[k];
        if (v !== undefined && v !== '' && v !== null) {
            el.style.setProperty(prefix + m[k], String(v));
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkbg-ht-app').forEach(function (root) {
        var opts = JSON.parse(root.dataset.opts || '{}');
        initHorizontalTimeline(root, opts);
    });
});

function initHorizontalTimeline(root, a) {
    var items = a.items || [];
    if (!items.length) return;

    var containerH = a.containerHeight || 420;
    var halfH      = Math.round(containerH / 2);
    var itemWidth  = a.itemWidth  || 220;
    var itemGap    = a.itemGap    || 40;
    var dotSize    = a.dotSize    || 16;
    var trackPad   = 48;

    /* CSS vars */
    root.style.setProperty('--ht-line-color',   a.lineColor   || '#6366f1');
    root.style.setProperty('--ht-section-bg',   a.sectionBg   || '#f8fafc');

    /* typography CSS vars */
    typoCssVarsForEl(a.titleTypo, '--bkbg-ht-tt-', root);
    typoCssVarsForEl(a.descTypo,  '--bkbg-ht-desc-', root);
    typoCssVarsForEl(a.dateTypo,  '--bkbg-ht-date-', root);
    /* legacy fallback vars */
    if (a.titleFontSize && a.titleFontSize !== 13) root.style.setProperty('--bkbg-ht-tt-sz', a.titleFontSize + 'px');
    if (a.titleFontWeight && a.titleFontWeight !== '600') root.style.setProperty('--bkbg-ht-tt-fw', a.titleFontWeight);
    if (a.titleLineHeight && a.titleLineHeight !== 1.3) root.style.setProperty('--bkbg-ht-tt-lh', String(a.titleLineHeight));
    if (a.descFontSize && a.descFontSize !== 11) root.style.setProperty('--bkbg-ht-desc-sz', a.descFontSize + 'px');
    if (a.descLineHeight && a.descLineHeight !== 1.5) root.style.setProperty('--bkbg-ht-desc-lh', String(a.descLineHeight));
    if (a.dateFontSize && a.dateFontSize !== 11) root.style.setProperty('--bkbg-ht-date-sz', a.dateFontSize + 'px');

    /* section */
    var section = document.createElement('div');
    section.className = 'bkbg-ht-section';
    section.style.cssText = 'background:' + (a.sectionBg || '#f8fafc') + ';padding:20px 0;';

    /* track wrap */
    var trackWrap = document.createElement('div');
    trackWrap.className = 'bkbg-ht-track-wrap';
    trackWrap.style.height = containerH + 'px';

    /* line */
    var line = document.createElement('div');
    line.className = 'bkbg-ht-line';
    line.style.cssText = 'top:' + halfH + 'px;height:' + (a.lineThickness || 3) + 'px;background:' + (a.lineColor || '#6366f1') + ';';
    trackWrap.appendChild(line);

    /* track */
    var track = document.createElement('div');
    track.className = 'bkbg-ht-track';
    track.style.cssText = 'gap:' + itemGap + 'px;padding:0 ' + trackPad + 'px;height:' + containerH + 'px;min-width:max-content;';
    trackWrap.appendChild(track);

    /* build items */
    items.forEach(function (item, idx) {
        var isTop = a.layout === 'top' || (a.layout === 'alternating' ? idx % 2 === 0 : false);
        if (a.layout === 'bottom') isTop = false;

        var col = document.createElement('div');
        col.className = 'bkbg-ht-item-col ' + (isTop ? 'bkbg-ht-top' : 'bkbg-ht-bottom');
        col.style.cssText = 'height:' + containerH + 'px;width:' + itemWidth + 'px;';

        /* card half-height = from center to top/bottom edge minus dot */
        var cardAvailH = halfH - Math.round(dotSize / 2) - 8;

        /* card */
        var card = document.createElement('div');
        card.className = 'bkbg-ht-card' + (a.animateOnScroll ? ' bkbg-ht-hidden' : '');
        card.style.cssText = [
            'width:' + itemWidth + 'px',
            'max-height:' + (cardAvailH - 24) + 'px',
            'overflow:hidden',
            'background:' + (a.cardBg || '#fff'),
            'border:1px solid ' + (a.cardBorderColor || '#e2e8f0'),
            'border-radius:' + (a.cardRadius || 16) + 'px',
            'padding:' + (a.cardPadding || 20) + 'px',
            a.cardShadow ? 'box-shadow:0 4px 16px rgba(0,0,0,0.08)' : '',
            'box-sizing:border-box',
        ].filter(Boolean).join(';');

        if (item.imageUrl) {
            var img = document.createElement('img');
            img.src = item.imageUrl;
            img.className = 'bkbg-ht-card-img';
            img.alt = item.title || '';
            img.style.maxHeight = '80px';
            card.appendChild(img);
        }

        if (a.showIcons && item.icon) {
            var iconEl = document.createElement('div');
            iconEl.className = 'bkbg-ht-card-icon';
            iconEl.style.fontSize = (a.iconSize || 28) + 'px';
            var _IP = window.bkbgIconPicker;
            var _iType = item.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor);
                if (_in) iconEl.appendChild(_in); else iconEl.textContent = item.icon || '';
            } else {
                iconEl.textContent = item.icon || '';
            }
            card.appendChild(iconEl);
        }

        if (a.showDates && item.date) {
            var dateEl = document.createElement('div');
            dateEl.className = 'bkbg-ht-card-date';
            dateEl.style.color = a.dateColor || '#6366f1';
            dateEl.textContent = item.date;
            card.appendChild(dateEl);
        }

        if (item.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-ht-card-title';
            titleEl.style.color = a.titleColor || '#1e293b';
            titleEl.textContent = item.title;
            card.appendChild(titleEl);
        }

        if (item.description) {
            var descEl = document.createElement('div');
            descEl.className = 'bkbg-ht-card-desc';
            descEl.style.color = a.descColor || '#64748b';
            descEl.textContent = item.description;
            card.appendChild(descEl);
        }

        /* connector rod */
        var rod = document.createElement('div');
        rod.className = 'bkbg-ht-connector';
        rod.style.height = '8px';

        /* dot */
        var dot = document.createElement('div');
        dot.className = 'bkbg-ht-dot';
        dot.style.cssText = [
            'width:' + dotSize + 'px',
            'height:' + dotSize + 'px',
            'background:' + (a.dotColor || '#6366f1'),
            'border:3px solid ' + (a.dotBorderColor || '#fff'),
            'box-shadow:0 0 0 3px ' + (a.dotColor || '#6366f1') + '33',
        ].join(';');

        if (isTop) {
            col.appendChild(card);
            col.appendChild(rod);
            col.appendChild(dot);
        } else {
            col.appendChild(dot);
            col.appendChild(rod);
            col.appendChild(card);
        }

        /* spacer to fill remaining height */
        col.style.justifyContent = isTop ? 'flex-start' : 'flex-end';

        track.appendChild(col);
    });

    section.appendChild(trackWrap);

    /* arrows */
    if (a.showArrows) {
        var arrowsDiv = document.createElement('div');
        arrowsDiv.className = 'bkbg-ht-arrows';

        var btnLeft  = document.createElement('button');
        var btnRight = document.createElement('button');
        [btnLeft, btnRight].forEach(function (btn) {
            btn.className = 'bkbg-ht-arrow';
            btn.style.cssText = 'background:' + (a.arrowBg || '#6366f1') + ';color:' + (a.arrowColor || '#fff') + ';';
        });
        btnLeft.textContent  = '←';
        btnRight.textContent = '→';

        btnLeft.addEventListener('click', function () {
            trackWrap.scrollBy({ left: -(itemWidth + itemGap) * 2, behavior: 'smooth' });
        });
        btnRight.addEventListener('click', function () {
            trackWrap.scrollBy({ left: (itemWidth + itemGap) * 2, behavior: 'smooth' });
        });

        arrowsDiv.appendChild(btnLeft);
        arrowsDiv.appendChild(btnRight);
        section.appendChild(arrowsDiv);
    }

    root.appendChild(section);

    /* drag-to-scroll */
    if (a.draggable !== false) {
        var dragState = { active: false, startX: 0, scrollLeft: 0 };
        trackWrap.addEventListener('mousedown', function (e) {
            dragState.active     = true;
            dragState.startX     = e.pageX - trackWrap.offsetLeft;
            dragState.scrollLeft = trackWrap.scrollLeft;
            trackWrap.classList.add('bkbg-ht-dragging');
        });
        document.addEventListener('mouseup', function () {
            dragState.active = false;
            trackWrap.classList.remove('bkbg-ht-dragging');
        });
        trackWrap.addEventListener('mousemove', function (e) {
            if (!dragState.active) return;
            e.preventDefault();
            var x    = e.pageX - trackWrap.offsetLeft;
            var walk = (x - dragState.startX) * 1.4;
            trackWrap.scrollLeft = dragState.scrollLeft - walk;
        });
        /* touch */
        var touchStartX = 0, touchScrollLeft = 0;
        trackWrap.addEventListener('touchstart', function (e) {
            touchStartX    = e.touches[0].pageX;
            touchScrollLeft = trackWrap.scrollLeft;
        }, { passive: true });
        trackWrap.addEventListener('touchmove', function (e) {
            var dx = touchStartX - e.touches[0].pageX;
            trackWrap.scrollLeft = touchScrollLeft + dx;
        }, { passive: true });
    }

    /* scroll-reveal */
    if (a.animateOnScroll) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var idx = Array.from(track.children).indexOf(entry.target);
                    setTimeout(function () {
                        var card = entry.target.querySelector('.bkbg-ht-card');
                        if (card) { card.classList.remove('bkbg-ht-hidden'); card.classList.add('bkbg-ht-visible'); }
                    }, idx * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        track.querySelectorAll('.bkbg-ht-item-col').forEach(function (col) { observer.observe(col); });
    }
}
