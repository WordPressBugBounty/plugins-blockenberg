(function () {
    function padZ(n) { return n < 10 ? '0' + n : String(n); }

    function getEndTime(wrap) {
        var isRelative = wrap.dataset.relative === '1';
        var endTime;
        if (isRelative) {
            var days = parseInt(wrap.dataset.days || '3', 10);
            // Store in sessionStorage so it stays stable on page reload
            var storageKey = 'bkbg-ctc-' + (wrap.closest('[id]') || { id: 'x' }).id + '-end';
            var stored = sessionStorage.getItem(storageKey);
            if (stored) {
                endTime = new Date(parseInt(stored, 10));
            } else {
                endTime = new Date(Date.now() + days * 86400000);
                sessionStorage.setItem(storageKey, endTime.getTime().toString());
            }
        } else {
            endTime = new Date(wrap.dataset.end || '');
        }
        return isNaN(endTime.getTime()) ? null : endTime;
    }

    function tick(wrap, units, endTime) {
        var now = Date.now();
        var diff = Math.max(0, endTime.getTime() - now);

        var totalSecs = Math.floor(diff / 1000);
        var days = Math.floor(totalSecs / 86400);
        var hours = Math.floor((totalSecs % 86400) / 3600);
        var minutes = Math.floor((totalSecs % 3600) / 60);
        var seconds = totalSecs % 60;

        var vals = { days: padZ(days), hours: padZ(hours), minutes: padZ(minutes), seconds: padZ(seconds) };

        units.forEach(function (u) {
            var numEl = u.querySelector('.bkbg-ctc-unit-num');
            if (numEl) numEl.textContent = vals[u.dataset.unit] || '00';
        });

        if (diff > 0) {
            setTimeout(function () { tick(wrap, units, endTime); }, 1000);
        }
    }

    document.querySelectorAll('.bkbg-ctc-wrap').forEach(function (wrap) {
        var endTime = getEndTime(wrap);
        if (!endTime) return;
        var units = Array.from(wrap.querySelectorAll('.bkbg-ctc-unit[data-unit]'));
        if (!units.length) return;
        tick(wrap, units, endTime);
    });
})();
