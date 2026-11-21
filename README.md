# Kişisel Harcamalarım — Masaüstü Programı

Aylık gelir / gider / yatırım / kasa takibi yapan bütçe programı. **İnternet bağlantısı gerektirmez**; tüm veriler yalnızca senin bilgisayarında saklanır.

Bu program, claude.ai'deki "Kişisel Harcamalarım" sayfasının birebir aynısıdır (aynı ekran, aynı özellikler: aylar, kategoriler, limitler, PIN kilidi, gelir gizleme, yatırım, kasa ve birikim hedefi, gün gün görünüm, kredi kartı ekstresi PDF okuma, Excel/CSV dışa aktarma, JSON yedek). Farkı: bulut senkronu yerine veriler bilgisayardaki bir dosyaya yazılır.

## Kurulum (Windows)

**Seçenek 1 — Kurulum dosyası (önerilen)**
1. GitHub'da bu deponun **Actions** sekmesine gir → "Masaüstü programını derle" → en son başarılı çalıştırma.
2. Sayfanın altındaki **Artifacts** bölümünden `Kisisel-Harcamalarim-Windows` dosyasını indir, zip'i aç.
3. `Kisisel-Harcamalarim-Kurulum-1.0.0.exe` dosyasını çalıştır. Masaüstüne ve Başlat menüsüne kısayol eklenir.
   - Windows "bilinmeyen yayımcı" uyarısı verirse: **Ek bilgi → Yine de çalıştır**.
   - Aynı yerde kurulum gerektirmeyen `Kisisel-Harcamalarim-Tasinabilir-1.0.0.exe` de vardır (USB'den bile çalışır).

**Seçenek 2 — Kendin derle**
1. [Node.js](https://nodejs.org) (LTS) kur.
2. Bu klasörde: `npm install` ve ardından `npm run dist:win`
3. Kurulum dosyası `dist/` klasöründe oluşur.

Sadece denemek için: `npm install` → `npm start`

macOS için: `npm run dist:mac` (ya da Actions'taki `Kisisel-Harcamalarim-macOS` çıktısı).

## Mevcut verilerimi nasıl taşırım?

1. claude.ai'deki "Kişisel Harcamalarım" sayfasında **⬇ Yedek** butonuna bas → `butce-yedek-....json` iner.
2. Masaüstü programında **⬆ Yükle** butonuna bas → o dosyayı seç → onayla.

Tüm aylar, ayarlar, limitler, PIN, hedef ve ekstre kuralları aktarılır.

## Veriler nerede?

- Windows: `%APPDATA%\KisiselHarcamalarim\veri\butce.json`
- macOS: `~/Library/Application Support/KisiselHarcamalarim/veri/butce.json`

Program her gün otomatik yedek alır (`veri/otomatik-yedekler`, son 60 gün). Menüden **Dosya → Veri klasörünü aç** ile klasöre ulaşabilirsin. Bilgisayar değiştirirken **⬇ Yedek** dosyasını alıp yeni bilgisayarda **⬆ Yükle** demen yeterli.

## Dosyalar

| Dosya | Görevi |
|---|---|
| `src/index.html` | Programın ekranı ve tüm hesaplamalar |
| `src/vendor/` | Ekstre PDF'lerini internetsiz okumak için pdf.js |
| `main.js` | Pencere, menü, verinin diske yazılması, otomatik yedek |
| `preload.js` | Ekran ile disk arasındaki güvenli köprü |
| `package.json` | Sürüm ve kurulum paketi ayarları |
