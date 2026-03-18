(function () {
    'use strict';

    function uuidV4() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function uuidV1() {
        var now = Date.now();
        var timeHex = now.toString(16).padStart(12, '0');
        var hi = timeHex.slice(0, 8);
        var lo = timeHex.slice(8, 12);
        var rand1 = Math.floor(Math.random() * 0x3fff | 0x8000).toString(16);
        var rand2 = Array.from({ length: 12 }, function () { return Math.floor(Math.random() * 16).toString(16); }).join('');
        return lo + '-' + hi.slice(4, 8) + '-1' + hi.slice(1, 4) + '-' + rand1 + '-' + rand2;
    }

    function rgbFromHex(hex) {
        var c = hex.replace('#', '');
        return {
            r: parseInt(c.slice(0, 2), 16),
            g: parseInt(c.slice(2, 4), 16),
            b: parseInt(c.slice(4, 6), 16)
        };
    }

    function luminance(hex) {
        var rgb = rgbFromHex(hex);
        return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    }

    function textOn(bg) { return luminance(bg) > 140 ? '#0f172a' : '#f8fafc'; }

    function copyText(text, btn) {
        navigator.clipboard && navigator.clipboard.writeText(text).catch(function () {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        });
        var orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = orig; }, 1500);
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        var a = opts;
        var version   = a.defaultVersion || 'v4';
        var count     = parseInt(a.defaultCount) || 5;
        var uppercase = !!a.showUppercase;
        var history   = [];
        var uuids     = [];

        // Build UI
        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-uuid-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-uuid-title';
            h.style.color = a.titleColor || '';
            h.textContent = a.title;
            wrap.appendChild(h);
        }

        if (a.showSubtitle) {
            var s = document.createElement('div');
            s.className = 'bkbg-uuid-subtitle';
            s.style.color = a.subtitleColor;
            s.textContent = a.subtitle;
            wrap.appendChild(s);
        }

        var card = document.createElement('div');
        card.className = 'bkbg-uuid-card';
        card.style.background = a.cardBg;
        wrap.appendChild(card);

        // Version tabs
        var tabs = document.createElement('div');
        tabs.className = 'bkbg-uuid-tabs';
        card.appendChild(tabs);

        function renderTabBtn(ver) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-uuid-tab-btn';
            btn.textContent = 'UUID ' + ver.toUpperCase();
            updateTabStyle(btn, ver === version);
            btn.addEventListener('click', function () {
                version = ver;
                tabs.querySelectorAll('.bkbg-uuid-tab-btn').forEach(function (b, i) {
                    updateTabStyle(b, ['v4', 'v1'][i] === version);
                });
            });
            return btn;
        }

        function updateTabStyle(btn, active) {
            btn.style.cssText = 'background:' + (active ? a.accentColor : '#e5e7eb') + ';color:' + (active ? '#fff' : '#374151') + ';';
        }

        tabs.appendChild(renderTabBtn('v4'));
        tabs.appendChild(renderTabBtn('v1'));

        // Count buttons
        var countWrap = document.createElement('div');
        countWrap.className = 'bkbg-uuid-count-btns';
        card.appendChild(countWrap);

        [1, 5, 10, 25, 50].forEach(function (n) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-uuid-count-btn';
            btn.textContent = n;
            updateCountStyle(btn, n === count);
            btn.addEventListener('click', function () {
                count = n;
                countWrap.querySelectorAll('.bkbg-uuid-count-btn').forEach(function (b, i) {
                    updateCountStyle(b, [1, 5, 10, 25, 50][i] === count);
                });
            });
            countWrap.appendChild(btn);
        });

        function updateCountStyle(btn, active) {
            btn.style.cssText = 'background:' + (active ? a.accentColor : '#e5e7eb') + ';color:' + (active ? '#fff' : '#374151') + ';border-color:' + (active ? a.accentColor : 'transparent') + ';';
        }

        // Options row
        var optRow = document.createElement('div');
        optRow.className = 'bkbg-uuid-options';
        card.appendChild(optRow);

        var ucLabel = document.createElement('label');
        ucLabel.className = 'bkbg-uuid-opt-label';
        ucLabel.style.color = a.labelColor;
        var ucCheck = document.createElement('input');
        ucCheck.type = 'checkbox';
        ucCheck.checked = uppercase;
        ucLabel.appendChild(ucCheck);
        ucLabel.appendChild(document.createTextNode(' Uppercase'));
        ucCheck.addEventListener('change', function () { uppercase = ucCheck.checked; });
        optRow.appendChild(ucLabel);

        // UUID list container
        var listEl = document.createElement('div');
        listEl.className = 'bkbg-uuid-list';
        card.appendChild(listEl);

        // Actions
        var actionsRow = document.createElement('div');
        actionsRow.className = 'bkbg-uuid-actions';
        card.appendChild(actionsRow);

        var genBtn = document.createElement('button');
        genBtn.className = 'bkbg-uuid-btn';
        genBtn.style.cssText = 'background:' + a.accentColor + ';color:#fff;';
        genBtn.textContent = 'Generate';
        actionsRow.appendChild(genBtn);

        var copyAllBtn = document.createElement('button');
        copyAllBtn.className = 'bkbg-uuid-btn bkbg-uuid-btn-outline';
        copyAllBtn.style.cssText = 'color:' + a.accentColor + ';border-color:' + a.accentColor + ';';
        copyAllBtn.textContent = 'Copy All';
        actionsRow.appendChild(copyAllBtn);

        var copyMsg = document.createElement('span');
        copyMsg.className = 'bkbg-uuid-copy-msg';
        copyMsg.style.color = a.accentColor;
        copyMsg.textContent = 'Copied to clipboard!';
        actionsRow.appendChild(copyMsg);

        function showCopyMsg() {
            copyMsg.classList.add('bkbg-uuid-show');
            setTimeout(function () { copyMsg.classList.remove('bkbg-uuid-show'); }, 2000);
        }

        function generate() {
            uuids = [];
            for (var i = 0; i < count; i++) {
                uuids.push(version === 'v1' ? uuidV1() : uuidV4());
            }
            renderList();
            if (a.showHistory) {
                history = uuids.concat(history).slice(0, 20);
                renderHistory();
            }
        }

        function renderList() {
            listEl.innerHTML = '';
            uuids.forEach(function (uuid) {
                var display = uppercase ? uuid.toUpperCase() : uuid;
                var item = document.createElement('div');
                item.className = 'bkbg-uuid-item';
                item.style.cssText = 'background:' + a.uuidBg + ';color:' + a.uuidColor + ';';

                var val = document.createElement('span');
                val.className = 'bkbg-uuid-val';
                val.textContent = display;
                item.appendChild(val);

                var copyBtn = document.createElement('button');
                copyBtn.className = 'bkbg-uuid-copy-one';
                copyBtn.style.cssText = 'color:' + a.uuidColor + ';border-color:' + a.uuidColor + ';background:rgba(0,0,0,0.2);';
                copyBtn.textContent = 'Copy';
                copyBtn.addEventListener('click', function () { copyText(display, copyBtn); });
                item.appendChild(copyBtn);

                listEl.appendChild(item);
            });
        }

        genBtn.addEventListener('click', generate);

        copyAllBtn.addEventListener('click', function () {
            if (uuids.length === 0) { generate(); }
            var text = uuids.map(function (u) { return uppercase ? u.toUpperCase() : u; }).join('\n');
            copyText(text, copyAllBtn);
            showCopyMsg();
        });

        // History
        var histEl = null;
        if (a.showHistory) {
            histEl = document.createElement('div');
            histEl.className = 'bkbg-uuid-history';
            histEl.style.background = a.cardBg;
            var histTitle = document.createElement('div');
            histTitle.className = 'bkbg-uuid-history-title';
            histTitle.style.color = a.labelColor;
            histTitle.textContent = 'History';
            histEl.appendChild(histTitle);
            var histList = document.createElement('ul');
            histList.className = 'bkbg-uuid-history-list';
            histEl.appendChild(histList);
            wrap.appendChild(histEl);
        }

        function renderHistory() {
            if (!histEl) return;
            var histList = histEl.querySelector('.bkbg-uuid-history-list');
            histList.innerHTML = '';
            history.forEach(function (u) {
                var li = document.createElement('li');
                li.className = 'bkbg-uuid-history-item';
                li.style.color = a.labelColor;
                li.textContent = uppercase ? u.toUpperCase() : u;
                histList.appendChild(li);
            });
        }

        // Generate on load
        generate();
    }

    function init() {
        document.querySelectorAll('.bkbg-uuid-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
