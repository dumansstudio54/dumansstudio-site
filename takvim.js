/* DumansStudio — Etkinlik takvimi. Veriler etkinlikler.js dosyasından gelir;
   bu dosyayı düzenlemeye gerek yoktur. */
(function () {
  'use strict';
  var cal = document.getElementById('cal');
  var spot = document.getElementById('spot');
  var join = document.getElementById('spot-join');
  if (!cal || !spot) return;

  var AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var AY_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  var GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var WA = 'https://wa.me/905345239963?text=';
  var JOIN_DEFAULT = { href: join.getAttribute('href'), text: join.textContent };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function mkey(y, m) { return y * 12 + m; }

  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ── Parse events ──
  var events = (window.DUMANS_EVENTS || []).map(function (e) {
    var p = String(e.tarih || '').split('-').map(Number);
    if (p.length !== 3 || !p[0] || !p[1] || !p[2] || !e.baslik) return null;
    var d = new Date(p[0], p[1] - 1, p[2]);
    return {
      date: d, key: key(d), title: e.baslik, place: e.yer || '', district: e.ilce || '',
      start: e.baslangic || '', end: e.bitis || '', desc: e.aciklama || '',
      type: e.tur === 'ozel' ? 'ozel' : 'etkinlik', gallery: e.galeri || '',
      past: d < today
    };
  }).filter(Boolean).sort(function (a, b) { return a.date - b.date; });

  var byDay = {};
  events.forEach(function (e) { (byDay[e.key] = byDay[e.key] || []).push(e); });
  var upcoming = events.filter(function (e) { return !e.past; });
  var next = upcoming[0] || null;
  var lastPast = events.filter(function (e) { return e.past; }).pop() || null;

  // ── Month range: earliest event (or this month) → 12 months ahead (or the last event) ──
  var cur = mkey(today.getFullYear(), today.getMonth());
  var lo = Math.min(cur, events.length ? mkey(events[0].date.getFullYear(), events[0].date.getMonth()) : cur);
  var last = events.length ? events[events.length - 1].date : today;
  var hi = Math.max(cur + 11, mkey(last.getFullYear(), last.getMonth()));
  var view = cur;
  var selected = next ? next.key : null;

  var strip = cal.querySelector('.cal-strip');
  var title = cal.querySelector('.cal-month');
  var days = cal.querySelector('.cal-days');
  var list = cal.querySelector('.cal-list');
  var prevBtn = cal.querySelector('[data-step="-1"]');
  var nextBtn = cal.querySelector('[data-step="1"]');

  // ── Month strip ──
  var monthsWithEvents = {};
  events.forEach(function (e) { monthsWithEvents[mkey(e.date.getFullYear(), e.date.getMonth())] = true; });
  for (var k = lo; k <= hi; k++) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.m = k;
    b.innerHTML = AY_KISA[k % 12] + '<small>' + Math.floor(k / 12) + '</small>';
    b.setAttribute('aria-label', AY[k % 12] + ' ' + Math.floor(k / 12) + (monthsWithEvents[k] ? ', etkinlik var' : ''));
    if (monthsWithEvents[k]) b.classList.add('has');
    strip.appendChild(b);
  }
  strip.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) go(+b.dataset.m);
  });
  prevBtn.addEventListener('click', function () { go(view - 1); });
  nextBtn.addEventListener('click', function () { go(view + 1); });

  function go(m) {
    if (m < lo || m > hi || m === view) return;
    var dir = m > view ? 'slide-l' : 'slide-r';
    view = m;
    render();
    days.classList.remove('slide-l', 'slide-r'); void days.offsetWidth; days.classList.add(dir);
  }

  // ── Month grid ──
  function render() {
    var y = Math.floor(view / 12), m = view % 12;
    title.textContent = AY[m] + ' ' + y;
    prevBtn.disabled = view <= lo;
    nextBtn.disabled = view >= hi;

    strip.querySelectorAll('button').forEach(function (b) {
      var on = +b.dataset.m === view;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: b.offsetLeft - strip.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
    });

    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;            // Monday-first week
    var count = new Date(y, m + 1, 0).getDate();
    var html = '';
    for (var i = 0; i < offset; i++) html += '<span></span>';
    for (var d = 1; d <= count; d++) {
      var date = new Date(y, m, d), dk = key(date), evs = byDay[dk];
      var wd = date.getDay();
      var cls = 'cal-d' + (wd === 0 || wd === 6 ? ' we' : '') + (date < today ? ' past-day' : '') + (+date === +today ? ' today' : '');
      if (evs) {
        var e0 = evs[0];
        cls += e0.past ? ' past' : (e0.type === 'ozel' ? ' oz' : ' ev upcoming');
        if (dk === selected) cls += ' sel';
        html += '<button type="button" class="' + cls + '" data-day="' + dk + '" aria-label="' + d + ' ' + AY[m] + ': ' + esc(evs.map(function (e) { return e.title; }).join(', ')) + '">' + d + '</button>';
      } else {
        html += '<span class="' + cls + '"' + (+date === +today ? ' aria-current="date"' : '') + '>' + d + '</span>';
      }
    }
    days.innerHTML = html;

    var monthEvents = events.filter(function (e) { return e.date.getFullYear() === y && e.date.getMonth() === m; });
    list.innerHTML = monthEvents.length
      ? monthEvents.map(function (e) {
          return '<li><button type="button" data-day="' + e.key + '"><b>' + e.date.getDate() + '</b><span>' + esc(e.title) + (e.past ? ' · <em style="opacity:.6">geçmiş</em>' : '') + '</span></button></li>';
        }).join('')
      : '<li>' + AY[m] + ' ayında planlanmış etkinlik yok' + (next ? ' · sıradaki: <a href="#" data-jump="' + next.key + '" style="color:var(--gold-300)">' + next.date.getDate() + ' ' + AY[next.date.getMonth()] + '</a>' : '.') + '</li>';
  }

  cal.addEventListener('click', function (e) {
    var b = e.target.closest('[data-day]');
    if (b) { select(b.dataset.day); return; }
    var j = e.target.closest('[data-jump]');
    if (j) {
      e.preventDefault();
      var ev = byDay[j.dataset.jump][0];
      go(mkey(ev.date.getFullYear(), ev.date.getMonth()));
      select(j.dataset.jump);
    }
  });

  function select(dk) {
    selected = dk;
    render();
    showSpot(byDay[dk][0]);
  }

  // ── Spotlight card ──
  function when(e) {
    var s = GUN[e.date.getDay()] + (e.start ? ' · ' + e.start + (e.end ? '–' + e.end : '') : '');
    return s;
  }
  function showSpot(e) {
    spot.classList.toggle('past', !!(e && e.past));
    if (!e) {
      spot.innerHTML = '<div class="spot-anim"><span class="spot-kicker">Sıradaki Etkinlik</span>' +
        '<b class="spot-title">Yeni tarih çok yakında</b>' +
        '<p>Bir sonraki buluşmamızın tarihi netleşince burada ve Instagram\'da duyuracağız. Listeye katılın, davetiniz ilk size gelsin.</p>' +
        (lastPast ? '<div class="spot-links"><button type="button" data-spot-past>Son etkinlik: ' + lastPast.date.getDate() + ' ' + AY[lastPast.date.getMonth()] + ' · ' + esc(lastPast.title) + '</button></div>' : '') +
        '</div>';
      setJoin(null);
      return;
    }
    var diff = Math.round((e.date - today) / 86400000);
    var count = e.past ? '' :
      diff === 0 ? '<span class="spot-count today"><b>Bugün</b> görüşüyoruz</span>' :
      diff === 1 ? '<span class="spot-count"><b>Yarın</b></span>' :
      '<span class="spot-count"><b>' + diff + '</b> gün kaldı</span>';
    var links = e.past
      ? (e.gallery ? '<button type="button" data-open-gallery="' + esc(e.gallery) + '">Fotoğrafları gör →</button>' : '')
      : '<button type="button" data-ics>Takvimime ekle</button>' +
        '<a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.place + ' ' + (e.district || '') + ' Sakarya') + '" target="_blank" rel="noopener">Yol tarifi</a>';
    spot.innerHTML = '<div class="spot-anim">' +
      '<span class="spot-kicker">' + (e.past ? 'Geçmiş Etkinlik' : (e === next ? 'Sıradaki Etkinlik' : 'Yaklaşan Etkinlik')) + '</span>' +
      '<div class="spot-row"><div class="spot-date"><b>' + e.date.getDate() + '</b><small>' + AY[e.date.getMonth()].toLocaleUpperCase('tr-TR') + '</small></div>' +
      '<div><b class="spot-title">' + esc(e.title) + '</b><div class="spot-meta">' + esc(e.place) + (e.district ? ', ' + esc(e.district) : '') + '<br>' + esc(when(e)) + '</div></div></div>' +
      (e.desc ? '<p class="spot-desc">' + esc(e.desc) + '</p>' : '') +
      count +
      (links ? '<div class="spot-links">' + links + '</div>' : '') +
      '</div>';
    spot._ev = e;
    setJoin(e.past ? null : e);
  }
  function setJoin(e) {
    if (!e) { join.href = JOIN_DEFAULT.href; join.textContent = JOIN_DEFAULT.text; return; }
    join.href = WA + encodeURIComponent('Merhaba, ' + e.date.getDate() + ' ' + AY[e.date.getMonth()] + ' tarihindeki "' + e.title + '" etkinliğine katılmak istiyorum.');
    join.textContent = 'Katılmak İstiyorum';
  }
  spot.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-ics]')) downloadIcs(spot._ev);
    var g = ev.target.closest('[data-open-gallery]');
    if (g) {
      var opener = document.querySelector('.ev-open[data-gallery="' + g.dataset.openGallery + '"]');
      if (opener) opener.click();
    }
    if (ev.target.closest('[data-spot-past]') && lastPast) {
      go(mkey(lastPast.date.getFullYear(), lastPast.date.getMonth()));
      select(lastPast.key);
    }
  });

  // ── "Takvimime ekle" (.ics — works with iPhone, Android, Google & Outlook calendars) ──
  function icsDate(e, t) {
    var d = e.date.getFullYear() + pad(e.date.getMonth() + 1) + pad(e.date.getDate());
    return t ? d + 'T' + t.replace(':', '') + '00' : d;
  }
  // Escape text for .ics fields (RFC 5545): backslash, semicolon, comma, newline.
  function txt(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function downloadIcs(e) {
    if (!e) return;
    var nextDay = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate() + 1);
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DumansStudio//Etkinlik Takvimi//TR', 'CALSCALE:GREGORIAN',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Istanbul', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0300', 'TZOFFSETTO:+0300', 'TZNAME:+03', 'END:STANDARD', 'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:' + e.key + '-' + e.title.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) + '@dumansstudio.com',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''),
      e.start ? 'DTSTART;TZID=Europe/Istanbul:' + icsDate(e, e.start) : 'DTSTART;VALUE=DATE:' + icsDate(e),
      e.start ? 'DTEND;TZID=Europe/Istanbul:' + icsDate(e, e.end || e.start) : 'DTEND;VALUE=DATE:' + icsDate({ date: nextDay }),
      'SUMMARY:' + txt(e.title + ' · DumansStudio'),
      'LOCATION:' + txt(e.place + (e.district ? ', ' + e.district : '') + ', Sakarya'),
      'DESCRIPTION:' + txt((e.desc ? e.desc + '\n\n' : '') + 'Bilgi: 0534 523 99 63 · dumansstudio.com'),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Yarın DumansStudio etkinliği var', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dumansstudio-' + e.key + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  // ── Google: structured data for upcoming events (read when Google renders the page) ──
  if (upcoming.length) {
    var ld = { '@context': 'https://schema.org', '@graph': upcoming.map(function (e) {
      var o = {
        '@type': 'Event', name: e.title, description: e.desc || (e.title + ' · DumansStudio Sakarya pilates etkinliği'),
        startDate: e.key + (e.start ? 'T' + e.start + ':00+03:00' : ''),
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        image: ['https://dumansstudio.com/dumansstudio-sakarya-pilates-og.jpg'],
        location: { '@type': 'Place', name: e.place, address: { '@type': 'PostalAddress', addressLocality: e.district || 'Adapazarı', addressRegion: 'Sakarya', addressCountry: 'TR' } },
        organizer: { '@type': 'Organization', name: 'DumansStudio', url: 'https://dumansstudio.com/' }
      };
      if (e.start && e.end) o.endDate = e.key + 'T' + e.end + ':00+03:00';
      return o;
    }) };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  cal.hidden = false;
  render();
  showSpot(next);
})();
