(function () {
    'use strict';

    document.querySelectorAll('.bkbg-wbn-app').forEach(function (root) {
        var a;
        try { a = JSON.parse(root.dataset.opts || '{}'); } catch (e) { return; }

        var bg = a.bgColor || '#0f172a';
        var ptop = a.paddingTop !== undefined ? a.paddingTop : 80;
        var pbot = a.paddingBottom !== undefined ? a.paddingBottom : 80;
        var maxW = a.maxWidth || 1100;
        var isSplit = a.layout === 'split';

        root.style.backgroundColor = bg;
        root.style.paddingTop = ptop + 'px';
        root.style.paddingBottom = pbot + 'px';

        var inner = document.createElement('div');
        inner.className = 'bkbg-wbn-inner';
        inner.style.maxWidth = maxW + 'px';

        // === Left column ===
        var left = document.createElement('div');
        left.className = 'bkbg-wbn-left';

        // Badge
        if (a.showBadge !== false && a.badge) {
            var badge = document.createElement('span');
            badge.className = 'bkbg-wbn-badge';
            badge.style.cssText = 'background:' + (a.badgeBg || '#7c3aed') + ';color:' + (a.badgeColor || '#ffffff') + ';';
            badge.textContent = a.badge;
            left.appendChild(badge);
        }

        // Heading
        var heading = document.createElement('h2');
        heading.className = 'bkbg-wbn-heading';
        heading.style.color = a.headingColor || '#ffffff';
        heading.innerHTML = a.heading || '';
        left.appendChild(heading);

        // Subtext
        if (a.showSubtext !== false && a.subtext) {
            var subtext = document.createElement('p');
            subtext.className = 'bkbg-wbn-subtext';
            subtext.style.cssText = 'color:' + (a.subtextColor || '#94a3b8') + ';margin:0 0 28px;';
            subtext.innerHTML = a.subtext;
            left.appendChild(subtext);
        }

        // Date/time blocks
        if (a.showDateTime !== false) {
            var dateRow = document.createElement('div');
            dateRow.className = 'bkbg-wbn-date-row';

            [
                { label: 'Date', value: a.eventDate || '' },
                { label: 'Time', value: (a.eventTime || '2:00 PM') + ' ' + (a.eventTimezone || 'EST') }
            ].forEach(function (item) {
                if (!item.value) return;
                var block = document.createElement('div');
                block.className = 'bkbg-wbn-date-block';
                block.style.cssText = 'background:' + (a.dateBg || '#1e293b') + ';border-color:' + (a.dateBorder || '#334155') + ';';
                var lbl = document.createElement('p');
                lbl.className = 'bkbg-wbn-date-block__label';
                lbl.style.color = a.subtextColor || '#94a3b8';
                lbl.textContent = item.label;
                var val = document.createElement('p');
                val.className = 'bkbg-wbn-date-block__value';
                val.style.color = a.dateColor || '#e2e8f0';
                val.textContent = item.value;
                block.appendChild(lbl);
                block.appendChild(val);
                dateRow.appendChild(block);
            });

            left.appendChild(dateRow);
        }

        // Topics
        if (a.showTopics !== false && a.topics && a.topics.length) {
            var topicsWrap = document.createElement('div');
            topicsWrap.className = 'bkbg-wbn-topics';

            var topicsHeadingEl = document.createElement('h3');
            topicsHeadingEl.className = 'bkbg-wbn-topics-heading';
            topicsHeadingEl.style.color = a.headingColor || '#ffffff';
            topicsHeadingEl.textContent = a.topicsHeading || "What You'll Learn";
            topicsWrap.appendChild(topicsHeadingEl);

            var ul = document.createElement('ul');
            ul.className = 'bkbg-wbn-topic-list';

            a.topics.forEach(function (t) {
                var li = document.createElement('li');
                li.className = 'bkbg-wbn-topic-item';
                li.style.color = a.topicColor || '#e2e8f0';

                var check = document.createElement('span');
                check.className = 'bkbg-wbn-topic-check';
                check.style.color = a.checkColor || '#a78bfa';
                check.textContent = '✓';
                li.appendChild(check);

                var txt = document.createElement('span');
                txt.textContent = t.text;
                li.appendChild(txt);
                ul.appendChild(li);
            });

            topicsWrap.appendChild(ul);
            left.appendChild(topicsWrap);
        }

        // CTA
        var ctaWrap = document.createElement('div');
        ctaWrap.className = 'bkbg-wbn-cta-wrap';

        var ctaLink = document.createElement('a');
        ctaLink.className = 'bkbg-wbn-cta';
        ctaLink.href = a.ctaUrl || '#';
        ctaLink.textContent = a.ctaLabel || 'Reserve My Free Spot →';
        ctaLink.style.cssText = 'background:' + (a.ctaBg || '#7c3aed') + ';color:' + (a.ctaColor || '#ffffff') + ';';
        ctaWrap.appendChild(ctaLink);

        if (a.showCtaSubtext !== false && a.ctaSubtext) {
            var ctaNote = document.createElement('p');
            ctaNote.className = 'bkbg-wbn-cta-note';
            ctaNote.style.color = a.ctaSubtextColor || '#64748b';
            ctaNote.textContent = a.ctaSubtext;
            ctaWrap.appendChild(ctaNote);
        }

        left.appendChild(ctaWrap);

        // === Right column ===
        var right = document.createElement('div');
        right.className = 'bkbg-wbn-right';

        // Speakers
        if (a.showSpeakers !== false && a.speakers && a.speakers.length) {
            var speakersWrap = document.createElement('div');
            speakersWrap.className = 'bkbg-wbn-speakers';

            var speakersHeading = document.createElement('p');
            speakersHeading.className = 'bkbg-wbn-speakers-heading';
            speakersHeading.style.color = a.headingColor || '#ffffff';
            speakersHeading.textContent = 'Your Hosts';
            speakersWrap.appendChild(speakersHeading);

            var spList = document.createElement('div');
            spList.className = 'bkbg-wbn-speaker-list';

            a.speakers.forEach(function (s) {
                var card = document.createElement('div');
                card.className = 'bkbg-wbn-speaker-card';
                card.style.background = a.speakerCardBg || '#1e293b';

                var avatarEl;
                if (s.avatarUrl) {
                    avatarEl = document.createElement('img');
                    avatarEl.className = 'bkbg-wbn-speaker-avatar';
                    avatarEl.src = s.avatarUrl;
                    avatarEl.alt = s.name || '';
                } else {
                    avatarEl = document.createElement('div');
                    avatarEl.className = 'bkbg-wbn-speaker-avatar-placeholder';
                    avatarEl.textContent = '🎤';
                }
                card.appendChild(avatarEl);

                var info = document.createElement('div');
                var nameEl = document.createElement('p');
                nameEl.className = 'bkbg-wbn-speaker-name';
                nameEl.style.color = a.speakerNameColor || '#f1f5f9';
                nameEl.textContent = s.name;
                info.appendChild(nameEl);

                var titleEl = document.createElement('p');
                titleEl.className = 'bkbg-wbn-speaker-title';
                titleEl.style.color = a.speakerTitleColor || '#94a3b8';
                titleEl.textContent = s.title;
                info.appendChild(titleEl);

                if (s.bio) {
                    var bioEl = document.createElement('p');
                    bioEl.className = 'bkbg-wbn-speaker-bio';
                    bioEl.style.color = a.subtextColor || '#94a3b8';
                    bioEl.textContent = s.bio;
                    info.appendChild(bioEl);
                }

                card.appendChild(info);
                spList.appendChild(card);
            });

            speakersWrap.appendChild(spList);
            right.appendChild(speakersWrap);
        }

        // Countdown
        if (a.showCountdown !== false) {
            var countdownWrap = document.createElement('div');
            countdownWrap.className = 'bkbg-wbn-countdown';
            countdownWrap.style.background = a.countdownBg || '#1e293b';

            var cdLabel = document.createElement('p');
            cdLabel.className = 'bkbg-wbn-countdown-label';
            cdLabel.style.color = a.subtextColor || '#94a3b8';
            cdLabel.textContent = 'Starts In';
            countdownWrap.appendChild(cdLabel);

            var cdRow = document.createElement('div');
            cdRow.className = 'bkbg-wbn-countdown-row';

            var units = ['Days', 'Hours', 'Mins', 'Secs'];
            var numEls = [];
            units.forEach(function (unit) {
                var unitEl = document.createElement('div');
                unitEl.className = 'bkbg-wbn-countdown-unit';

                var numEl = document.createElement('span');
                numEl.className = 'bkbg-wbn-countdown-num';
                numEl.style.color = a.countdownNumColor || '#ffffff';
                numEl.textContent = '00';
                numEls.push(numEl);

                var unitLabel = document.createElement('span');
                unitLabel.className = 'bkbg-wbn-countdown-unit-label';
                unitLabel.style.color = a.countdownLabelColor || '#64748b';
                unitLabel.textContent = unit;

                unitEl.appendChild(numEl);
                unitEl.appendChild(unitLabel);
                cdRow.appendChild(unitEl);
            });

            countdownWrap.appendChild(cdRow);
            right.appendChild(countdownWrap);

            // Live countdown if end date is set
            if (a.countdownEnd) {
                var endDate = new Date(a.countdownEnd).getTime();

                function tick() {
                    var now = Date.now();
                    var diff = endDate - now;
                    if (diff <= 0) {
                        numEls.forEach(function (el) { el.textContent = '00'; });
                        return;
                    }
                    var d = Math.floor(diff / 86400000);
                    var h = Math.floor((diff % 86400000) / 3600000);
                    var m = Math.floor((diff % 3600000) / 60000);
                    var s = Math.floor((diff % 60000) / 1000);
                    [d, h, m, s].forEach(function (v, i) {
                        numEls[i].textContent = String(v).padStart(2, '0');
                    });
                }

                tick();
                setInterval(tick, 1000);
            }
        }

        // === Assemble layout ===
        if (isSplit) {
            var grid = document.createElement('div');
            grid.className = 'bkbg-wbn-grid';
            grid.style.gridTemplateColumns = '1fr 420px';
            grid.appendChild(left);
            grid.appendChild(right);
            inner.appendChild(grid);
        } else {
            var centered = document.createElement('div');
            centered.className = 'bkbg-wbn-centered';
            centered.appendChild(left);
            inner.appendChild(centered);
        }

        root.appendChild(inner);
    });
})();
