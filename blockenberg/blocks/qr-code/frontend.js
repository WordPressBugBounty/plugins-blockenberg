/* QR Code — frontend */
(function () {
    function renderAll() {
        document.querySelectorAll('.bkqr-box[data-content]').forEach(function (box) {
            if (box._bkqrDone) return;
            box._bkqrDone = true;
            var canvas = box.querySelector('.bkqr-canvas');
            if (!canvas) return;
            try {
                var qr = new window.QRCode(canvas, {
                    text:         box.getAttribute('data-content') || 'https://example.com',
                    width:        parseInt(box.getAttribute('data-size'),  10) || 200,
                    height:       parseInt(box.getAttribute('data-size'),  10) || 200,
                    colorDark:    box.getAttribute('data-fg')    || '#1f2937',
                    colorLight:   box.getAttribute('data-bg')    || '#ffffff',
                    correctLevel: window.QRCode.CorrectLevel[box.getAttribute('data-level') || 'M'],
                });

                /* download button */
                var btn = box.querySelector('.bkqr-download');
                if (btn) {
                    btn.addEventListener('click', function () {
                        var cvs = canvas.querySelector('canvas');
                        if (!cvs) return;
                        var link = document.createElement('a');
                        link.download = 'qrcode.png';
                        link.href = cvs.toDataURL('image/png');
                        link.click();
                    });
                }
            } catch (e) { console.warn('bkqr error', e); }
        });
    }

    function init() {
        if (typeof window.QRCode !== 'undefined') { renderAll(); return; }
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.onload = renderAll;
        document.head.appendChild(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
