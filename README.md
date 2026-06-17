# DumansStudio — Tanıtım Sitesi (dumansstudio.com)

Sakarya/Adapazarı'ndaki DumansStudio'nun halka açık tanıtım sitesi.
Reformer Pilates · EMS · Yoga · Eğitmen Merve Duman.

## Bu depo nasıl çalışır?

Site **tek bir dosyadan** oluşur: `index.html`. Tüm fotoğraflar, yazılar, tasarım
ve kod bu dosyanın içine gömülüdür — ayrı CSS veya görsel klasörü yoktur. Bu yüzden
yüklemesi kusursuzdur; eksik dosya / 404 sorunu yaşanmaz.

## Yayınlama

Bu depoyu Netlify'a bağlayın; `index.html`'e her değişiklik yapıldığında site otomatik
güncellenir. Adım adım kurulum için (sadece site sahibi içindir, depoya yüklemeyin)
ayrı verilen **`REHBER.html`** dosyasını tarayıcıda açın.

Kısaca:
1. Bu depoyu [app.netlify.com](https://app.netlify.com) → *Import an existing project* ile bağlayın.
2. Netlify'da `dumansstudio.com` alan adını ekleyin, Namecheap DNS kayıtlarını girin.

Alternatif: `index.html`'i doğrudan [app.netlify.com/drop](https://app.netlify.com/drop)'a sürükleyin.

## Alan adı yapısı

| Adres | Ne barındırır |
| --- | --- |
| `dumansstudio.com` | **Bu site** (tanıtım / ana sayfa) |
| `ogrenci.dumansstudio.com` | Öğrenci paneli (giriş) |
| `yonetici.dumansstudio.com` | Yönetici paneli |

## Güncelleme

Fotoğraf veya yazı değişikliği için tasarımcınıza yeni `index.html` hazırlatın ve buraya
yükleyin (dosyaya tıkla → kalem ikonu / sil-yükle → *Commit*). Site 1 dakikada güncellenir.

> Teknik not: Site, React'i tarayıcıda derler; statiktir, sunucu gerektirmez.
