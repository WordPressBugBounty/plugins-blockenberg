(function () {
    'use strict';

    var _typoKeys = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        sizeUnit: null,
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
        wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m'
    };

    function typoCssVarsForEl(el, typoObj, prefix) {
        if (!typoObj || typeof typoObj !== 'object') return;
        var unit = typoObj.sizeUnit || 'px';
        Object.keys(typoObj).forEach(function (k) {
            var v = typoObj[k]; if (v === undefined || v === '' || v === null) return;
            var prop = _typoKeys[k]; if (!prop) return;
            var val = (prop.indexOf('font-size') === 0 || prop.indexOf('letter-spacing') === 0 || prop.indexOf('word-spacing') === 0 || prop.indexOf('line-height') === 0)
                ? v + unit : String(v);
            el.style.setProperty(prefix + prop, val);
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-spop-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                entries: [],
                position: 'bottom-left',
                displayTime: 4000,
                pauseBetween: 3000,
                animationType: 'slide',
                showAvatar: true,
                showTime: true,
                showClose: true,
                loop: true,
                startDelay: 2000,
                borderRadius: 12,
                shadow: true,
                maxWidth: 300,
                bgColor: '#ffffff',
                textColor: '#1e293b',
                nameColor: '#0f172a',
                actionColor: '#475569',
                timeColor: '#94a3b8',
                borderColor: '#e2e8f0',
                avatarBg: '#f0f9ff',
                closeBtnColor: '#94a3b8'
            }, opts);

            if (!o.entries || o.entries.length === 0) return;

            // Create fixed container
            var container = document.createElement('div');
            container.className = 'bkbg-spop-container pos-' + o.position;
            container.dataset.pos = o.position;
            container.dataset.anim = o.animationType;
            document.body.appendChild(container);

            // Apply typography CSS vars on the container
            typoCssVarsForEl(container, o.nameTypo, '--bkspop-nm-');
            typoCssVarsForEl(container, o.actionTypo, '--bkspop-ac-');

            // Build a popup DOM element
            function makePopup(entry) {
                var popup = document.createElement('div');
                popup.className = 'bkbg-spop-popup';
                popup.style.background = o.bgColor;
                popup.style.color = o.textColor;
                popup.style.borderColor = o.borderColor;
                popup.style.borderRadius = o.borderRadius + 'px';
                popup.style.maxWidth = o.maxWidth + 'px';
                popup.style.boxShadow = o.shadow ? '0 4px 24px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08)' : 'none';
                popup.style.transition = 'opacity .35s ease, transform .35s ease';
                popup.style.border = '1px solid ' + o.borderColor;

                if (o.showAvatar) {
                    var avatar = document.createElement('div');
                    avatar.className = 'bkbg-spop-avatar';
                    avatar.style.background = o.avatarBg;
                    if (entry.emoji) {
                        var emojiSpan = document.createElement('span');
                        emojiSpan.className = 'bkbg-spop-emoji';
                        emojiSpan.textContent = entry.emoji;
                        avatar.appendChild(emojiSpan);
                    } else {
                        var initial = document.createElement('span');
                        initial.className = 'bkbg-spop-initial';
                        initial.textContent = (entry.name || 'U').charAt(0).toUpperCase();
                        avatar.appendChild(initial);
                    }
                    popup.appendChild(avatar);
                }

                var content = document.createElement('div');
                content.className = 'bkbg-spop-content';

                var nameLine = document.createElement('div');
                nameLine.className = 'bkbg-spop-name';
                nameLine.style.color = o.nameColor;
                nameLine.textContent = entry.name || '';
                if (entry.location) {
                    var locSpan = document.createElement('span');
                    locSpan.className = 'bkbg-spop-location';
                    locSpan.textContent = ' · ' + entry.location;
                    nameLine.appendChild(locSpan);
                }
                content.appendChild(nameLine);

                var actionLine = document.createElement('div');
                actionLine.className = 'bkbg-spop-action';
                actionLine.style.color = o.actionColor;
                actionLine.textContent = entry.action || '';
                content.appendChild(actionLine);

                if (o.showTime && entry.timeAgo) {
                    var timeLine = document.createElement('div');
                    timeLine.className = 'bkbg-spop-time';
                    timeLine.style.color = o.timeColor;
                    timeLine.textContent = entry.timeAgo;
                    content.appendChild(timeLine);
                }

                popup.appendChild(content);

                if (o.showClose) {
                    var closeBtn = document.createElement('button');
                    closeBtn.className = 'bkbg-spop-close';
                    closeBtn.textContent = '×';
                    closeBtn.style.color = o.closeBtnColor;
                    closeBtn.addEventListener('click', function () {
                        hidePopup(popup);
                    });
                    popup.appendChild(closeBtn);
                }

                return popup;
            }

            function showPopup(popup) {
                container.appendChild(popup);
                // Force reflow
                popup.getBoundingClientRect();
                popup.classList.add('is-visible');
            }

            function hidePopup(popup) {
                popup.classList.remove('is-visible');
                setTimeout(function () {
                    if (popup.parentNode) popup.parentNode.removeChild(popup);
                }, 400);
            }

            var currentIdx = 0;
            var timer = null;
            var dismissed = false;

            function showNext() {
                if (dismissed || o.entries.length === 0) return;

                var entry = o.entries[currentIdx];
                var popup = makePopup(entry);
                showPopup(popup);

                // Auto-hide after displayTime
                var hideTimer = setTimeout(function () {
                    hidePopup(popup);
                    // Schedule next
                    timer = setTimeout(function () {
                        currentIdx++;
                        if (currentIdx >= o.entries.length) {
                            if (o.loop) currentIdx = 0;
                            else return; // done
                        }
                        showNext();
                    }, o.pauseBetween);
                }, o.displayTime);

                // If close button was clicked, cancel the main timers
                popup.addEventListener('click', function (e) {
                    if (e.target.classList.contains('bkbg-spop-close')) {
                        clearTimeout(hideTimer);
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            currentIdx++;
                            if (currentIdx >= o.entries.length) {
                                if (o.loop) currentIdx = 0;
                                else return;
                            }
                            showNext();
                        }, o.pauseBetween);
                    }
                });
            }

            // Start after delay
            setTimeout(function () {
                showNext();
            }, o.startDelay);

            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
