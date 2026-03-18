/* Image Magnifier — frontend */
(function () {
    function init() {
        document.querySelectorAll('.bkmag-container[data-zoom]').forEach(function (container) {
            if (container._bkmagInit) return;
            container._bkmagInit = true;

            var img = container.querySelector('.bkmag-img');
            if (!img) return;

            var zoom       = parseInt(container.getAttribute('data-zoom'), 10) || 250;
            var lensSize   = parseInt(container.getAttribute('data-lens-size'), 10) || 150;
            var lensShape  = container.getAttribute('data-lens-shape') || 'circle';
            var lensBorder = container.getAttribute('data-lens-border') || '#6c3fb5';
            var lensBorderW = parseInt(container.getAttribute('data-lens-border-w'), 10) || 2;
            var lensShadow = container.getAttribute('data-lens-shadow') !== '0';
            var effect     = container.getAttribute('data-effect') || 'lens';
            var previewW   = parseInt(container.getAttribute('data-preview-w'), 10) || 300;
            var previewH   = parseInt(container.getAttribute('data-preview-h'), 10) || 300;
            var previewBorder = container.getAttribute('data-preview-border') || '#e5e7eb';
            var previewRadius = parseInt(container.getAttribute('data-preview-radius'), 10) || 8;

            var helpers;

            if (effect === 'lens') {
                var lens = document.createElement('div');
                lens.className = 'bkmag-lens';
                Object.assign(lens.style, {
                    width: lensSize + 'px',
                    height: lensSize + 'px',
                    borderRadius: lensShape === 'circle' ? '50%' : previewRadius + 'px',
                    border: lensBorderW + 'px solid ' + lensBorder,
                    boxShadow: lensShadow ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                    backgroundImage: 'url(' + img.src + ')',
                });
                container.appendChild(lens);

                container.addEventListener('mousemove', function (e) {
                    var rect = img.getBoundingClientRect();
                    var containerRect = container.getBoundingClientRect();
                    var imgW = img.offsetWidth;
                    var imgH = img.offsetHeight;
                    var cx = e.clientX - rect.left;
                    var cy = e.clientY - rect.top;

                    var ratio = zoom / 100;
                    var bgW  = imgW * ratio;
                    var bgH  = imgH * ratio;
                    var bgX  = -(cx * ratio - lensSize / 2);
                    var bgY  = -(cy * ratio - lensSize / 2);

                    lens.style.backgroundSize = bgW + 'px ' + bgH + 'px';
                    lens.style.backgroundPosition = bgX + 'px ' + bgY + 'px';

                    var lensX = cx - lensSize / 2;
                    var lensY = cy - lensSize / 2;
                    lens.style.left = lensX + 'px';
                    lens.style.top  = lensY + 'px';
                    lens.style.display = 'block';
                });

                container.addEventListener('mouseleave', function () {
                    lens.style.display = 'none';
                });

            } else {
                /* side preview box */
                var preview = document.createElement('div');
                preview.className = 'bkmag-preview';
                Object.assign(preview.style, {
                    width: previewW + 'px',
                    height: previewH + 'px',
                    border: '1px solid ' + previewBorder,
                    borderRadius: previewRadius + 'px',
                    backgroundImage: 'url(' + img.src + ')',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                });
                container.appendChild(preview);

                container.addEventListener('mousemove', function (e) {
                    var rect = img.getBoundingClientRect();
                    var imgW = img.offsetWidth;
                    var imgH = img.offsetHeight;
                    var cx = e.clientX - rect.left;
                    var cy = e.clientY - rect.top;

                    var ratio = zoom / 100;
                    var bgW  = imgW * ratio;
                    var bgH  = imgH * ratio;
                    var bgX  = -(cx * ratio - previewW / 2);
                    var bgY  = -(cy * ratio - previewH / 2);

                    preview.style.backgroundSize = bgW + 'px ' + bgH + 'px';
                    preview.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
                    preview.style.display = 'block';
                    preview.style.top = Math.min(imgH - previewH, Math.max(0, cy - previewH / 2)) + 'px';
                });

                container.addEventListener('mouseleave', function () {
                    preview.style.display = 'none';
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
