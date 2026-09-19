(function () {
	'use strict';

	document.querySelectorAll('.bkbg-gs-wrapper').forEach(function (wrap) {
		var mainEl = wrap.querySelector('.bkbg-gs-main');
		if (!mainEl) {
			return;
		}

		var slides = [].slice.call(wrap.querySelectorAll('.bkbg-gs-slide'));
		var thumbBtns = [].slice.call(wrap.querySelectorAll('.bkbg-gs-thumb'));
		var prevBtn = wrap.querySelector('.bkbg-gs-arrow--prev');
		var nextBtn = wrap.querySelector('.bkbg-gs-arrow--next');
		var counter = wrap.querySelector('.bkbg-gs-counter');
		var caption = wrap.querySelector('.bkbg-gs-caption');
		var belowCap = wrap.querySelector('.bkbg-gs-below-caption');
		var lbTrigger = wrap.querySelector('.bkbg-gs-lightbox-trigger');
		var enableLb = wrap.getAttribute('data-lightbox') === '1';
		var enableKbd = wrap.getAttribute('data-keyboard') === '1';

		var current = 0;
		var total = slides.length;
		if (!total) {
			return;
		}

		var captions = slides.map(function (s) {
			var img = s.querySelector('img');
			return (img && img.getAttribute('data-caption')) || (img && img.alt) || '';
		});

		function goTo(idx) {
			idx = ((idx % total) + total) % total;
			current = idx;

			slides.forEach(function (s, i) {
				s.classList.toggle('is-active', i === current);
			});
			thumbBtns.forEach(function (t, i) {
				t.classList.toggle('is-active', i === current);
			});

			if (counter) {
				counter.textContent = current + 1 + ' / ' + total;
			}

			var capText = captions[current] || '';
			if (caption) {
				caption.textContent = capText;
			}
			if (belowCap) {
				belowCap.textContent = capText;
			}

			if (lbEl && lbEl._updateLbImg) {
				lbEl._updateLbImg();
			}
		}

		thumbBtns.forEach(function (btn, i) {
			btn.addEventListener('click', function () {
				goTo(i);
			});
		});

		if (prevBtn) {
			prevBtn.addEventListener('click', function () {
				goTo(current - 1);
			});
		}
		if (nextBtn) {
			nextBtn.addEventListener('click', function () {
				goTo(current + 1);
			});
		}

		var lbEl = null;
		function openLightbox() {
			if (lbEl) {
				return;
			}
			lbEl = document.createElement('div');
			lbEl.className = 'bkbg-gs-lightbox';

			var img = document.createElement('img');
			var srcImg = slides[current] && slides[current].querySelector('img');
			img.src = srcImg ? srcImg.src : '';
			img.alt = captions[current] || '';

			var closeBtn = document.createElement('button');
			closeBtn.type = 'button';
			closeBtn.className = 'bkbg-gs-lightbox-close';
			closeBtn.setAttribute('aria-label', 'Close');
			closeBtn.textContent = '×';
			closeBtn.addEventListener('click', closeLightbox);

			var prevLb = document.createElement('button');
			prevLb.type = 'button';
			prevLb.className = 'bkbg-gs-arrow bkbg-gs-arrow--prev bkbg-gs-arrow--circle';
			prevLb.textContent = '‹';
			prevLb.addEventListener('click', function (e) {
				e.stopPropagation();
				goTo(current - 1);
			});

			var nextLb = document.createElement('button');
			nextLb.type = 'button';
			nextLb.className = 'bkbg-gs-arrow bkbg-gs-arrow--next bkbg-gs-arrow--circle';
			nextLb.textContent = '›';
			nextLb.addEventListener('click', function (e) {
				e.stopPropagation();
				goTo(current + 1);
			});

			function updateLbImg() {
				var s = slides[current] && slides[current].querySelector('img');
				img.src = s ? s.src : '';
				img.alt = captions[current] || '';
			}
			lbEl._updateLbImg = updateLbImg;

			lbEl.appendChild(img);
			lbEl.appendChild(closeBtn);
			lbEl.appendChild(prevLb);
			lbEl.appendChild(nextLb);
			lbEl.addEventListener('click', function (e) {
				if (e.target === lbEl) {
					closeLightbox();
				}
			});
			document.body.appendChild(lbEl);
			document.body.style.overflow = 'hidden';
		}

		function closeLightbox() {
			if (lbEl) {
				lbEl.remove();
				lbEl = null;
				document.body.style.overflow = '';
			}
		}

		if (enableLb && lbTrigger) {
			lbTrigger.addEventListener('click', openLightbox);
		}

		if (enableKbd) {
			document.addEventListener('keydown', function (e) {
				if (!wrap.isConnected) {
					return;
				}
				if (e.key === 'ArrowLeft') {
					goTo(current - 1);
				}
				if (e.key === 'ArrowRight') {
					goTo(current + 1);
				}
				if (e.key === 'Escape' && enableLb) {
					closeLightbox();
				}
			});
		}

		var touchStartX = 0;
		mainEl.addEventListener('touchstart', function (e) {
			touchStartX = e.touches[0].clientX;
		}, { passive: true });
		mainEl.addEventListener('touchend', function (e) {
			var dx = e.changedTouches[0].clientX - touchStartX;
			if (Math.abs(dx) > 40) {
				goTo(dx < 0 ? current + 1 : current - 1);
			}
		}, { passive: true });

		goTo(0);
	});
})();
