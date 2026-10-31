/* I Filarmonici di Trento - funzioni del sito (senza dipendenze)
   1. Video YouTube caricati solo al clic (youtube-nocookie.com)
   2. Immagini delle pagine ingrandibili a tutto schermo                 */
(function () {
  'use strict';

  /* ---------- 1. Video YouTube al clic ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a.yt-lite') : null;
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey) return; // nuova scheda: lascia fare al browser
    e.preventDefault();
    var id = link.getAttribute('data-id');
    var start = link.getAttribute('data-start');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0' + (start ? '&start=' + encodeURIComponent(start) : '');
    iframe.title = link.getAttribute('data-title') || 'Video YouTube';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    var box = document.createElement('div');
    box.className = 'yt-lite yt-lite-active';
    box.appendChild(iframe);
    link.parentNode.replaceChild(box, link);
    iframe.focus();
  });

  /* ---------- 2. Immagini ingrandibili ---------- */
  function setupLightbox() {
    var content = document.querySelector('.entry-content');
    if (!content) return;
    var imgs = Array.prototype.filter.call(content.querySelectorAll('img'), function (img) {
      return !img.closest('.yt-lite') && !img.closest('a');
    });
    if (!imgs.length) return;

    var box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Immagine ingrandita');
    box.hidden = true;
    box.innerHTML =
      '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Chiudi">&times;</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Immagine precedente">&#8249;</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Immagine successiva">&#8250;</button>' +
      '<div class="lb-count" aria-live="polite"></div>';
    document.body.appendChild(box);

    var stage = box.querySelector('.lb-stage');
    var big = box.querySelector('.lb-img');
    var count = box.querySelector('.lb-count');
    var prev = box.querySelector('.lb-prev');
    var next = box.querySelector('.lb-next');
    var current = 0, lastFocus = null;

    function show(i) {
      current = (i + imgs.length) % imgs.length;
      box.classList.remove('lb-zoom');
      big.src = imgs[current].currentSrc || imgs[current].src;
      big.alt = imgs[current].alt || '';
      count.textContent = imgs.length > 1 ? (current + 1) + ' / ' + imgs.length : '';
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      document.documentElement.classList.add('lb-open');
      box.querySelector('.lb-close').focus();
    }
    function close() {
      box.hidden = true;
      box.classList.remove('lb-zoom');
      document.documentElement.classList.remove('lb-open');
      if (lastFocus) lastFocus.focus();
    }

    var multi = imgs.length > 1;
    prev.hidden = next.hidden = !multi;

    imgs.forEach(function (img, i) {
      img.classList.add('lb-trigger');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Ingrandisci immagine' + (img.alt ? ': ' + img.alt : ''));
      img.addEventListener('click', function () { open(i); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    box.querySelector('.lb-close').addEventListener('click', close);
    prev.addEventListener('click', function () { show(current - 1); });
    next.addEventListener('click', function () { show(current + 1); });

    // clic sull'immagine: zoom a grandezza naturale; clic sullo sfondo: chiude
    big.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!box.classList.contains('lb-zoom') &&
          big.naturalWidth <= stage.clientWidth && big.naturalHeight <= stage.clientHeight) return;
      box.classList.toggle('lb-zoom');
    });
    stage.addEventListener('click', function (e) { if (e.target === stage) close(); });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && multi) show(current - 1);
      else if (e.key === 'ArrowRight' && multi) show(current + 1);
      else if (e.key === 'Tab') { // tiene il focus dentro la finestra
        var f = Array.prototype.filter.call(box.querySelectorAll('button'), function (b) { return !b.hidden; });
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    // scorrimento col dito (solo se non è ingrandita)
    var x0 = null;
    stage.addEventListener('touchstart', function (e) {
      x0 = (e.touches.length === 1 && !box.classList.contains('lb-zoom')) ? e.touches[0].clientX : null;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null || !multi) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupLightbox);
  else setupLightbox();
})();
