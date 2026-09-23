/* ─────────────────────────────────────────────────────────────
   DUMANSSTUDIO ETKİNLİK TAKVİMİ — sadece bu dosyayı düzenleyin.

   Yeni etkinlik eklemek için aşağıdaki listeye bir blok ekleyin
   (en üstteki örneği kopyalayıp değiştirmeniz yeterli), sonra
   web klasörünü Netlify'a yeniden yükleyin. Takvim, geri sayım,
   "Takvimime Ekle" dosyası ve Google için etkinlik bilgisi
   otomatik oluşur. Tarihi geçen etkinlikler kendiliğinden
   "geçmiş" olarak işaretlenir; silmenize gerek yok.

   Alanlar:
     tarih     : "YYYY-AA-GG"  (örn. "2026-10-18")      — zorunlu
     baslangic : "SS:DD"       (örn. "19:00")           — isteğe bağlı
     bitis     : "SS:DD"       (örn. "21:30")           — isteğe bağlı
     baslik    : etkinlik adı                           — zorunlu
     yer       : mekân adı                              — zorunlu
     ilce      : ilçe (Google için, örn. "Arifiye")     — isteğe bağlı
     aciklama  : kısa açıklama (1–2 cümle)              — isteğe bağlı
     tur       : "etkinlik" (altın) veya "ozel" (çerçeveli; örn. atölye, özel ders günü)
     galeri    : geçmiş etkinliğin galerisi varsa "gal-1", "gal-2" gibi

   Dikkat: her bloğun sonunda virgül olsun, tırnakları silmeyin.
   ───────────────────────────────────────────────────────────── */
window.DUMANS_EVENTS = [

  // ÖRNEK — yeni etkinlik eklerken bu bloğu kopyalayıp başındaki // işaretlerini kaldırın:
  // {
  //   tarih: "2026-10-18", baslangic: "11:00", bitis: "13:00",
  //   baslik: "Sonbahar Pilates Buluşması",
  //   yer: "Mekân adı", ilce: "Adapazarı",
  //   aciklama: "Açık havada pilates ve sağlıklı atıştırmalıklar.",
  //   tur: "etkinlik"
  // },

  {
    tarih: "2026-08-26", baslangic: "19:00", bitis: "21:30",
    baslik: "Göl Kenarında Wellness Akşamı",
    yer: "Picasso Sakarya", ilce: "Arifiye",
    aciklama: "Sapanca göl kenarında pilates, fitness, beslenme ve sağlıklı yaşam akşamı.",
    tur: "etkinlik", galeri: "gal-2"
  },
  {
    tarih: "2026-07-31",
    baslik: "Kadınlara Özel Pilates Buluşması",
    yer: "Sakarya Tenis Akademisi",
    aciklama: "Havuz başında kadınlara özel pilates akşamı.",
    tur: "etkinlik", galeri: "gal-1"
  },

];
