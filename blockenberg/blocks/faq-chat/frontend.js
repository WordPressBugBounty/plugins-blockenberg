(function () {
    'use strict';

    /* ── typography CSS-var helper ── */
    var _tKeys = ['font-family','font-weight','text-transform','font-style','text-decoration'];
    var _rKeys = ['font-size','line-height','letter-spacing','word-spacing'];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', transform:'text-transform',
            style:'font-style', decoration:'text-decoration'
        };
        var rMap = {
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k]) el.style.setProperty(prefix + map[k], typo[k]);
        });
        Object.keys(rMap).forEach(function (k) {
            var v = typo[k];
            if (v !== undefined && v !== '') {
                var unit = '';
                if (k.indexOf('size') === 0) unit = typo.sizeUnit || 'px';
                else if (k.indexOf('lineHeight') === 0) unit = typo.lineHeightUnit || '';
                else if (k.indexOf('letterSpacing') === 0) unit = typo.letterSpacingUnit || 'px';
                else if (k.indexOf('wordSpacing') === 0) unit = typo.wordSpacingUnit || 'px';
                el.style.setProperty(prefix + rMap[k], v + unit);
            }
        });
    }

    /* ── helpers ── */
    function timestamp() {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
    }

    function scrollBottom(el) {
        el.scrollTop = el.scrollHeight;
    }

    /* ── build avatar element ── */
    function makeAvatar(botAvatar, avatarBg) {
        var av = document.createElement('div');
        av.className = 'bkbg-faqc-row-avatar';
        av.style.background = avatarBg;
        av.textContent = botAvatar;
        return av;
    }

    /* ── append a bot message row ── */
    function appendBotRow(messagesEl, text, o, isBubble, extraClass) {
        var row = document.createElement('div');
        row.className = 'bkbg-faqc-row bot-row';
        if (extraClass) row.className += ' ' + extraClass;

        var av = makeAvatar(o.botAvatar, o.avatarBg);

        var right = document.createElement('div');

        if (o.showTimestamp) {
            var meta = document.createElement('div');
            meta.className = 'bkbg-faqc-meta';
            meta.style.color = o.timestampColor;
            meta.textContent = o.botName + '  ' + timestamp();
            right.appendChild(meta);
        }

        var bubble = document.createElement('div');
        bubble.className = 'bkbg-faqc-bubble bot-bubble';
        bubble.style.background = o.botBubbleBg;
        bubble.style.color = o.botBubbleColor;

        if (isBubble) {
            /* typing indicator */
            bubble.className += ' bkbg-faqc-typing';
            ['bg1', 'bg2', 'bg3'].forEach(function () {
                var dot = document.createElement('span');
                dot.className = 'bkbg-faqc-dot';
                dot.style.background = o.botBubbleColor;
                bubble.appendChild(dot);
            });
        } else {
            bubble.textContent = text;
        }

        right.appendChild(bubble);
        row.appendChild(av);
        row.appendChild(right);

        messagesEl.appendChild(row);
        scrollBottom(messagesEl);

        return { row: row, bubble: bubble };
    }

    /* ── append a user message row ── */
    function appendUserRow(messagesEl, text, o) {
        var row = document.createElement('div');
        row.className = 'bkbg-faqc-row user-row';

        var left = document.createElement('div');

        if (o.showTimestamp) {
            var meta = document.createElement('div');
            meta.className = 'bkbg-faqc-meta';
            meta.style.color = o.timestampColor;
            meta.textContent = 'You  ' + timestamp();
            left.appendChild(meta);
        }

        var bubble = document.createElement('div');
        bubble.className = 'bkbg-faqc-bubble user-bubble';
        bubble.style.background = o.userBubbleBg;
        bubble.style.color = o.userBubbleColor;
        bubble.textContent = text;

        left.appendChild(bubble);
        row.appendChild(left);

        messagesEl.appendChild(row);
        scrollBottom(messagesEl);
    }

    /* ── bubble radius by style ── */
    function bubbleRadius(chatStyle) {
        if (chatStyle === 'bubble')  return '20px';
        if (chatStyle === 'sharp')   return '4px';
        return '12px';
    }

    /* ── build full widget DOM ── */
    function buildWidget(o) {
        var widget = document.createElement('div');
        widget.className = 'bkbg-faqc-widget bkbg-faqc-style-' + o.chatStyle;
        widget.style.borderColor = o.borderColor;
        widget.style.borderRadius = o.borderRadius + 'px';
        widget.style.maxWidth = o.maxWidth + 'px';
        widget.style.margin = '0 auto';

        /* set typography CSS custom properties */
        typoCssVarsForEl(o.typoQuestion, '--bkbg-fcht-qt-', widget);
        typoCssVarsForEl(o.typoAnswer, '--bkbg-fcht-an-', widget);

        /* ── header ── */
        var header = document.createElement('div');
        header.className = 'bkbg-faqc-header';
        header.style.background = o.headerBg;

        var av = document.createElement('div');
        av.className = 'bkbg-faqc-avatar';
        av.style.background = 'rgba(255,255,255,0.18)';
        av.textContent = o.botAvatar;

        var info = document.createElement('div');

        var botName = document.createElement('div');
        botName.className = 'bkbg-faqc-bot-name';
        botName.style.color = o.headerColor;
        botName.textContent = o.botName;

        var statusWrap = document.createElement('div');
        statusWrap.className = 'bkbg-faqc-status';
        statusWrap.style.color = o.headerColor;

        var dot = document.createElement('span');
        dot.className = 'bkbg-faqc-status-dot';

        var statusTxt = document.createElement('span');
        statusTxt.textContent = 'Online · ' + o.faqs.length + ' topics';

        statusWrap.appendChild(dot);
        statusWrap.appendChild(statusTxt);
        info.appendChild(botName);
        info.appendChild(statusWrap);
        header.appendChild(av);
        header.appendChild(info);

        /* ── messages area ── */
        var messages = document.createElement('div');
        messages.className = 'bkbg-faqc-messages';
        messages.style.background = o.chatBg;
        messages.style.maxHeight = o.maxHeight + 'px';

        /* ── questions panel ── */
        var questionsPanel = document.createElement('div');
        questionsPanel.className = 'bkbg-faqc-questions';
        questionsPanel.style.background = o.questionsBg;
        questionsPanel.style.borderTopColor = o.borderColor;

        var qLabel = document.createElement('div');
        qLabel.className = 'bkbg-faqc-questions-label';
        qLabel.style.color = o.timestampColor;
        qLabel.textContent = '📋 Frequently Asked Questions';

        var btnsWrap = document.createElement('div');
        btnsWrap.className = 'bkbg-faqc-btns';

        widget.appendChild(header);
        widget.appendChild(messages);
        questionsPanel.appendChild(qLabel);
        questionsPanel.appendChild(btnsWrap);
        widget.appendChild(questionsPanel);

        /* ── helpers for inline bubble styling ── */
        var bR = bubbleRadius(o.chatStyle);

        /* ── initial bot greeting ── */
        var initRow = appendBotRow(messages, o.initialMessage || 'Hi! Click any question.', o, false);
        initRow.bubble.style.borderRadius = bR;

        /* ── wire question buttons ── */
        o.faqs.forEach(function (faq, idx) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-faqc-q-btn';
            btn.style.background = o.btnBg;
            btn.style.color = o.btnColor;
            btn.style.borderColor = o.btnBorder;
            btn.textContent = faq.question;

            btn.addEventListener('click', function () {
                if (btn.classList.contains('is-answered')) return;
                btn.classList.add('is-answered');
                btn.style.background = o.btnActiveBg;
                btn.style.color = o.btnActiveColor;
                btn.style.borderColor = o.btnActiveBg;

                /* user question bubble */
                appendUserRow(messages, faq.question, o);
                var userBubble = messages.querySelector('.user-row:last-child .user-bubble');
                if (userBubble) userBubble.style.borderRadius = bR;

                /* typing indicator */
                var typingRes = appendBotRow(messages, '', o, true);
                typingRes.bubble.style.borderRadius = bR;

                /* after delay → show answer */
                setTimeout(function () {
                    if (typingRes.row.parentNode) {
                        typingRes.row.parentNode.removeChild(typingRes.row);
                    }

                    var answerRes = appendBotRow(messages, faq.answer, o, false);
                    answerRes.bubble.style.borderRadius = bR;

                    /* scroll again after answer appears */
                    scrollBottom(messages);
                }, o.typingDelay || 700);
            });

            btnsWrap.appendChild(btn);
        });

        return widget;
    }

    /* ── main init ── */
    function init() {
        document.querySelectorAll('.bkbg-faqc-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                faqs: [],
                botName: 'Support Bot',
                botAvatar: '🤖',
                avatarBg: '#6366f1',
                initialMessage: 'Hi! 👋 Click any question below to get started.',
                showTimestamp: true,
                typingDelay: 700,
                chatStyle: 'rounded',
                maxWidth: 620,
                maxHeight: 500,
                borderRadius: 16,
                questionSize: 14,
                answerSize: 14,
                headerBg: '#6366f1',
                headerColor: '#ffffff',
                chatBg: '#f1f5f9',
                botBubbleBg: '#ffffff',
                botBubbleColor: '#1f2937',
                userBubbleBg: '#6366f1',
                userBubbleColor: '#ffffff',
                questionsBg: '#ffffff',
                btnBg: '#f3f4f6',
                btnColor: '#374151',
                btnBorder: '#e5e7eb',
                btnActiveBg: '#e0e7ff',
                btnActiveColor: '#4338ca',
                borderColor: '#e5e7eb',
                timestampColor: '#9ca3af'
            }, opts);

            var widget = buildWidget(o);
            appEl.parentNode.insertBefore(widget, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
