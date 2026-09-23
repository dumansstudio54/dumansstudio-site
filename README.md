# DumansStudio — Tanıtım Sitesi (dumansstudio.com)

Sakarya/Adapazarı'ndaki DumansStudio'nun halka açık tanıtım sitesi.
Reformer Pilates · EMS · Yoga · Eğitmen Merve Duman.

## Klasör yapısı

Site artık tek dosya değil; `index.html` yanındaki klasörlerle birlikte çalışır.
**Bir dosyayı güncellerken diğerlerini silmeyin.**

| Dosya / klasör | Ne işe yarar |
| --- | --- |
| `index.html` | Ana sayfa |
| `assets/css/site.css` | Tüm sayfaların tasarımı |
| `assets/js/` | Menü, animasyon, galeri ve etkinlik takvimi |
| `assets/js/etkinlikler.js` | **Etkinlik takvimi verisi — yeni etkinlik buradan eklenir** |
| `assets/img/` | Görseller (`etkinlik-1`, `etkinlik-2` = etkinlik fotoğrafları) |
| `assets/fonts/` | Yazı tipleri |
| `reformer-pilates-nedir/`, `ems-antrenmani-nedir/` | Rehber sayfaları (Google aramaları için) |
| `sitemap.xml`, `robots.txt` | Google için site haritası |
| `_headers`, `_redirects` | Netlify ayarları (önbellek, www → alan adı yönlendirmesi) |

## Yeni etkinlik eklemek

1. `assets/js/etkinlikler.js` dosyasını açın → kalem ikonu.
2. Dosyanın başındaki örnek bloğu kopyalayıp tarih, saat, başlık ve yeri yazın.
3. **Commit changes**. Takvim, geri sayım ve Google etkinlik bilgisi otomatik güncellenir.

## Yayınlama

Bu depo Netlify'a bağlıdır; her commit'ten ~1 dakika sonra site güncellenir.
GitHub web arayüzü tek seferde en fazla 100 dosya yükler; daha fazlası için birkaç parça halinde yükleyin.

## Alan adı yapısı

| Adres | Ne barındırır |
| --- | --- |
| `dumansstudio.com` | **Bu site** (tanıtım / ana sayfa) |
| `ogrenci.dumansstudio.com` | Öğrenci paneli (giriş) |
| `yonetici.dumansstudio.com` | Yönetici paneli |
