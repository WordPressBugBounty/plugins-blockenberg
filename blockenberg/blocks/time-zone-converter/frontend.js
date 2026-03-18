(function () {
    'use strict';

    var POPULAR_ZONES = [
        'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
        'America/Toronto','America/Mexico_City','America/Sao_Paulo','Europe/London',
        'Europe/Paris','Europe/Berlin','Europe/Moscow','Africa/Lagos','Asia/Dubai',
        'Asia/Kolkata','Asia/Shanghai','Asia/Tokyo','Asia/Singapore','Australia/Sydney',
        'Pacific/Auckland','Pacific/Honolulu','UTC'
    ];

    function fmtZoneName(tz) {
        return tz.replace(/_/g, ' ').replace('/', ' / ');
    }

    function getDisplayTime(dateObj, tz, use12, showDate) {
        try {
            var opts = { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: !!use12 };
            if (showDate) {
                opts.weekday = 'short';
                opts.month   = 'short';
                opts.day     = 'numeric';
            }
            return dateObj.toLocaleString('en-US', opts);
        } catch (e) { return '—'; }
    }

    function getOffset(dateObj, tz) {
        try {
            var inZone = new Date(dateObj.toLocaleString('en-US', {timeZone: tz}));
            var inUtc  = new Date(dateObj.toLocaleString('en-US', {timeZone: 'UTC'}));
            var diff   = Math.round((inZone - inUtc) / 60000);
            var sign   = diff >= 0 ? '+' : '-';
            var abs    = Math.abs(diff);
            return 'UTC' + sign + Math.floor(abs / 60) + (abs % 60 ? ':' + String(abs % 60).padStart(2, '0') : '');
        } catch (e) { return ''; }
    }

    function getNowLocal() {
        var d = new Date(); d.setSeconds(0, 0);
        var pad = function (n) { return String(n).padStart(2, '0'); };
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function init(app) {
        var a;
        try { a = JSON.parse(app.getAttribute('data-opts')); } catch (e) { return; }

        var accent  = a.accentColor || '#6c3fb5';
        var targets = String(a.targetZones || 'Europe/London,Europe/Paris,Asia/Tokyo,America/Los_Angeles,Australia/Sydney')
            .split(',').map(function (s) { return s.trim(); }).filter(Boolean);

        app.style.paddingTop    = (a.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (a.paddingBottom || 60) + 'px';
        if (a.sectionBg) app.style.background = a.sectionBg;
        app.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className       = 'bkbg-tzc-wrap';
        wrap.style.maxWidth  = (a.maxWidth    || 540) + 'px';
        wrap.style.borderRadius = (a.cardRadius || 16) + 'px';
        wrap.style.background = a.cardBg || '#fff';
        app.appendChild(wrap);

        if (a.showTitle || a.showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-tzc-header';
            if (a.showTitle && a.title) {
                var title = document.createElement('div'); title.className = 'bkbg-tzc-title';
                title.textContent = a.title;
                if (a.titleColor) title.style.color = a.titleColor;
                header.appendChild(title);
            }
            if (a.showSubtitle && a.subtitle) {
                var sub = document.createElement('div'); sub.className = 'bkbg-tzc-subtitle';
                sub.textContent = a.subtitle; if (a.subtitleColor) sub.style.color = a.subtitleColor;
                header.appendChild(sub);
            }
            wrap.appendChild(header);
        }

        // Source card
        var sourceCard = document.createElement('div');
        sourceCard.className    = 'bkbg-tzc-source';
        sourceCard.style.background   = a.sourceBg || accent;
        sourceCard.style.borderRadius = (a.rowRadius || 10) + 'px';

        var inputsRow = document.createElement('div');
        inputsRow.className = 'bkbg-tzc-source-inputs';

        // Datetime input
        var dtGroup = document.createElement('div'); dtGroup.className = 'bkbg-tzc-source-group';
        var dtLabel = document.createElement('label'); dtLabel.className = 'bkbg-tzc-source-label'; dtLabel.style.color = a.sourceColor||'#fff'; dtLabel.textContent = 'Date & Time';
        var dtInput = document.createElement('input'); dtInput.style.colorScheme = 'dark'; dtInput.type = 'datetime-local'; dtInput.className = 'bkbg-tzc-dt-input'; dtInput.style.color = a.sourceColor||'#fff'; dtInput.value = getNowLocal();
        dtGroup.appendChild(dtLabel); dtGroup.appendChild(dtInput);

        // Timezone select
        var tzGroup = document.createElement('div'); tzGroup.className = 'bkbg-tzc-source-group';
        var tzLabel = document.createElement('label'); tzLabel.className = 'bkbg-tzc-source-label'; tzLabel.style.color = a.sourceColor||'#fff'; tzLabel.textContent = 'Source Time Zone';
        var tzSel   = document.createElement('select'); tzSel.className = 'bkbg-tzc-tz-select'; tzSel.style.color = a.sourceColor||'#fff';
        POPULAR_ZONES.forEach(function (z) {
            var opt = document.createElement('option'); opt.value = z; opt.textContent = fmtZoneName(z);
            if (z === (a.sourceZone || 'America/New_York')) opt.selected = true;
            tzSel.appendChild(opt);
        });
        tzGroup.appendChild(tzLabel); tzGroup.appendChild(tzSel);

        inputsRow.appendChild(dtGroup); inputsRow.appendChild(tzGroup);

        var srcTimeEl   = document.createElement('div'); srcTimeEl.className = 'bkbg-tzc-source-time';   srcTimeEl.style.color = a.sourceColor||'#fff';
        var srcOffsetEl = document.createElement('div'); srcOffsetEl.className = 'bkbg-tzc-source-offset'; srcOffsetEl.style.color = a.sourceColor||'#fff';
        if (!a.showOffset) srcOffsetEl.style.display = 'none';

        sourceCard.appendChild(inputsRow);
        sourceCard.appendChild(srcTimeEl);
        sourceCard.appendChild(srcOffsetEl);
        wrap.appendChild(sourceCard);

        // Target rows
        var rowsContainer = document.createElement('div'); rowsContainer.className = 'bkbg-tzc-rows';
        var rowEls = targets.map(function (tz) {
            var row     = document.createElement('div'); row.className = 'bkbg-tzc-row'; row.style.background = a.rowBg||'#f9fafb'; row.style.borderColor = a.rowBorder||'#e5e7eb'; row.style.borderRadius = (a.rowRadius||10)+'px';
            var info    = document.createElement('div');
            var zoneEl  = document.createElement('div'); zoneEl.className = 'bkbg-tzc-row-zone'; zoneEl.style.color = a.rowZoneColor||'#6b7280'; zoneEl.textContent = fmtZoneName(tz);
            var offEl   = document.createElement('div'); offEl.className  = 'bkbg-tzc-row-offset'; if (!a.showOffset) offEl.style.display = 'none';
            var timeEl  = document.createElement('div'); timeEl.className = 'bkbg-tzc-row-time'; timeEl.style.color = a.rowTimeColor||'#1f2937';
            info.appendChild(zoneEl); info.appendChild(offEl);
            row.appendChild(info); row.appendChild(timeEl);
            rowsContainer.appendChild(row);
            return { tz: tz, timeEl: timeEl, offEl: offEl };
        });
        wrap.appendChild(rowsContainer);

        function update() {
            var val = dtInput.value;
            if (!val) return;
            // Build the date as if the user's typed time is in the source zone
            // We interpret dtInput value naively as a local Date then display via Intl
            var dateObj = new Date(val.replace('T', ' ')); // naive local datetime
            if (isNaN(dateObj.getTime())) dateObj = new Date();

            var srcZone = tzSel.value;
            srcTimeEl.textContent   = getDisplayTime(dateObj, srcZone, a.use12Hour, a.showDate);
            srcOffsetEl.textContent = fmtZoneName(srcZone) + ' · ' + getOffset(dateObj, srcZone);

            rowEls.forEach(function (r) {
                r.timeEl.textContent = getDisplayTime(dateObj, r.tz, a.use12Hour, a.showDate);
                r.offEl.textContent  = getOffset(dateObj, r.tz);
            });
        }

        dtInput.addEventListener('input', update);
        tzSel.addEventListener('change', update);
        update();
    }

    document.querySelectorAll('.bkbg-tzc-app').forEach(init);
})();
