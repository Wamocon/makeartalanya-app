# KVKK Uyum Dosyası — Make Art Studio Alanya

Bu klasör, **Make Art Resim Atölyesi Turizm ve Ticaret Limited Şirketi**'nin 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki uyum dokümantasyonunu içerir. Odak noktası, uygulamanın veri altyapısının Türkiye dışında (İrlanda, Almanya, ABD) bulunması nedeniyle her işlemde gerçekleşen **yurt dışına kişisel veri aktarımıdır**.

> **Uyarı:** Bu dokümanlar hukuki mütalaa değildir. Türkiye'de yerleşik, veri koruma alanında yetkin bir avukat tarafından şirketin ticaret sicil kayıtları ve fiilî iş süreçleriyle karşılaştırılarak onaylanmadan yürürlüğe konulmamalıdır.

---

## Dosyalar

| No | Dosya | İçerik | Kime |
|----|-------|--------|------|
| **MAS-KVKK-01** | [`01-KVKK-Veri-Koruma-ve-Yurt-Disi-Aktarim-Dokumani.html`](01-KVKK-Veri-Koruma-ve-Yurt-Disi-Aktarim-Dokumani.html) | Ana uyum dokümanı: mevzuat çerçevesi, veri envanteri, amaç/hukuki sebep matrisi, **yurt dışına aktarım rejimi ve hizmet sağlayıcı bazında aktarım envanteri**, teknik/idari tedbirler, saklama süreleri, ihlal prosedürü, VERBİS değerlendirmesi, 2026 ceza tutarları, EK-A envanter, EK-B aktarım kayıt tablosu, **EK-C doldurulmuş Standart Sözleşme-2 ek setleri**, EK-D aksiyon planı, EK-E İngilizce özet | Şirket içi + denetim makamı |
| **MAS-KVKK-02** | [`02-Aydinlatma-Metni-ve-Acik-Riza-Beyanlari.html`](02-Aydinlatma-Metni-ve-Acik-Riza-Beyanlari.html) | Bölüm A: Aydınlatma metni (TR/EN/RU), yurt dışı aktarım bölümü ayrıntılı. Bölüm B: Ayrı, önceden işaretsiz **açık rıza beyanları** (sağlık, medya, ticari ileti, Telegram, yapay zekâ) + imza alanı | Veli/vasi — web sitesi ve basılı ek |
| **MAS-KVKK-03** | [`03-Ilgili-Kisi-Basvuru-Formu.html`](03-Ilgili-Kisi-Basvuru-Formu.html) | KVKK m.11/13 başvuru formu; 13 talep tipi (yurt dışı alıcılar ve **standart sözleşme nüshası talebi** dâhil); Stüdyo tarafından doldurulacak işlem bölümü; EN/RU özet | İlgili kişi + Stüdyo |
| **MAS-KVKK-04** | [`04-Gizlilik-ve-Kisisel-Veri-Isleme-Taahhutnamesi.html`](04-Gizlilik-ve-Kisisel-Veri-Isleme-Taahhutnamesi.html) | Çalışan/eğitmen/stajyer için imzaya hazır gizlilik ve veri işleme taahhütnamesi + erişim yetkisi ve görev sonu teslim tutanağı | Personel |

Dosyalar tarayıcıda açılır ve **Ctrl+P → Hedef: PDF olarak kaydet** ile A4 baskıya hazır PDF'e dönüştürülür. Sayfa kenar boşlukları, sayfa sonu kırılmaları ve tablo bütünlüğü baskı için ayarlanmıştır.

**Kurumsal renkler:** metin `#140B0B` · zemin `#FFFFFF` · vurgu `#F40E0E`

---

## Neden bu dosya gerekliydi — üç cümlelik özet

1. Stüdyo Türkiye'de yerleşik bir veri sorumlusudur, ancak veritabanı ve yedekleri **İrlanda'da** (Supabase / AWS `eu-west-1`), uygulama çalışma zamanı Vercel'de, e-posta Resend ve STRATO (Almanya) üzerinde, DNS/güvenlik Cloudflare'da, kaynak kodu GitHub'dadır — yani **her kayıt işlemi bir yurt dışına aktarımdır**.
2. Kişisel Verileri Koruma Kurulu **bugüne kadar hiçbir ülke hakkında yeterlilik kararı vermemiştir**; AB'nin GDPR kapsamındaki yeterlilik kararları Türkiye bakımından sonuç doğurmaz.
3. Bu aktarımlar sürekli ve olağan faaliyet akışı içinde olduğundan **arızi değildir**; dolayısıyla açık rıza istisnası kullanılamaz ve her alıcı için **Kurul'un ilan ettiği Standart Sözleşme-2 (Veri Sorumlusundan Veri İşleyene)** imzalanıp **imzadan itibaren 5 iş günü içinde Kuruma bildirilmelidir**.

---

## En kritik aksiyonlar

Tam liste MAS-KVKK-01 → EK-D'dedir. Aciliyet sırasıyla:

1. **Ticaret sicilinden şirket unvanını kesinleştirin.** Basılı sözleşmede "Make Art Resim Atölyesi **Ticaret** Ltd. Şti.", web sitesinde "Make Art Resim Atölyesi **Turizm ve** Ticaret Ltd. Şti." yazıyor. Yanlış unvanla imzalanan standart sözleşme bildirimde geçersizlik riski taşır. MERSİS ve ticaret sicil numaraları da eksik.
2. **Standart Sözleşme-2'yi Supabase, Vercel, Resend, Cloudflare ve STRATO ile imzalayın ve 5 iş günü içinde Kuruma bildirin.** Sözleşme gövdesi Kurumun sitesinden indirilen resmî Türkçe metin olmalı ve **üzerinde hiçbir değişiklik yapılmamalıdır**; yalnızca ekler doldurulur (hazır ek setleri MAS-KVKK-01 EK-C'de).
3. **Sağlayıcının kendi DPA'sı veya AB Standart Sözleşme Hükümleri (EU SCC) KVKK m.9 bakımından yeterli değildir.** Bunlar GDPR belgeleridir. Yalnızca Kurul'un Türkçe metni geçerlidir.
4. **Sağlayıcı yazışmalarını dosyalayın.** İmza talebine gelen kabul/ret/sessizlik yanıtları, Kurul denetiminde "makul çaba" kanıtıdır.
5. **KEP adresi edinin** (bildirim kanalı) ve **KVKK irtibat noktası atayın**.
6. **Vercel fonksiyon bölgesini bir AB bölgesine sabitleyin**, **Resend AB bölgesini** açın.
7. **GitHub kararı:** ya sözleşme imzalayın ya da depoda hiç kişisel veri bulunmayacağını teknik olarak garanti edin (secret scanning + push protection + gerçek veriyle test yasağı). İkincisi tercih edilirse GitHub envanterden düşer.
8. **VERBİS eşiklerini mali müşavirden teyit ettirin** (< 50 çalışan **ve** < 100 milyon TL bilanço). Muhtemelen istisna kapsamındasınız, ancak bu VERBİS dışındaki hiçbir yükümlülüğü kaldırmaz.

---

## 2026 idari para cezaları (KVKK m.18)

2026 yeniden değerleme oranı **%25,49**; tutarlar 1 Ocak 2026'dan itibaren işlenen ihlaller için geçerlidir.

| Aykırılık | Alt sınır | Üst sınır |
|-----------|-----------|-----------|
| Aydınlatma yükümlülüğü | 85.437 ₺ | 1.709.200 ₺ |
| Veri güvenliği | 256.357 ₺ | 17.092.242 ₺ |
| Kurul kararlarına aykırılık | 427.263 ₺ | 17.092.242 ₺ |
| VERBİS | 341.809 ₺ | 17.092.242 ₺ |
| **Standart sözleşmenin bildirilmemesi** | **90.308 ₺** | **1.806.377 ₺** |

Ayrıca TCK m.135–140 uyarınca hapis cezası gerektiren suçlar ve ilgili kişinin tazminat hakkı saklıdır.

---

## Kaynaklar

Bu dosya, aşağıdaki birincil kaynakların tam metinleri okunarak hazırlanmıştır:

- [6698 sayılı Kişisel Verilerin Korunması Kanunu](https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law) — 7499 sayılı Kanunla değişik hâli
- [Kişisel Verilerin Yurt Dışına Aktarılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik](https://kvkk.gov.tr/SharedFolderServer/CMSFiles/aaf0eeec-9599-4c68-8b7a-33039059ca41.pdf) — RG 10/7/2024, 32598 (tam metin okundu)
- [Standart Sözleşmeler (1–4)](https://www.kvkk.gov.tr/Icerik/7929/Standart-Sozlesmeler) — özellikle [Standart Sözleşme-2 (Veri Sorumlusundan Veri İşleyene)](https://www.kvkk.gov.tr/SharedFolderServer/CMSFiles/b531d656-9cea-4cdb-84ce-1ab92198c9b1.pdf) (tam metin okundu) ve kullanıcının gönderdiği [Standard Contract-1 İngilizce metni](https://www.kvkk.gov.tr/SharedFolderServer/CMSFiles/d4577ac6-d2cd-4ff4-839f-4218812c3cdc.pdf) (tam metin okundu)
- [Yurt Dışına Aktarım — Kurum sayfası](https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim) — *"Bu konuda Kurul tarafından henüz bir belirleme yapılmamıştır"* (yeterlilik kararı yokluğunun resmî teyidi)
- [Kişisel Verilerin Yurt Dışına Aktarılması Rehberi (KVKK Yayınları No: 48)](https://www.kvkk.gov.tr/Icerik/8142/Kisisel-Verilerin-Yurt-Disina-Aktarilmasi-Rehberi)
- [Standart sözleşmelerde dikkat edilmesi gereken hususlara ilişkin kamuoyu duyurusu](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu)
- [Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ](https://kvkk.gov.tr/Icerik/5443/AYDINLATMA-YUKUMLULUGUNUN-YERINE-GETIRILMESINDE-UYULACAK-USUL-VE-ESASLAR-HAKKINDA-TEBLIG) — RG 10/3/2018, 30356 (m.4 ve m.5 tam metin okundu)
- [Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hâle Getirilmesi Hakkında Yönetmelik](https://www.kvkk.gov.tr/Icerik/5441/KISISEL-VERILERIN-SILINMESI-YOK-EDILMESI-VEYA-ANONIM-HALE-GETIRILMESI-HAKKINDA-YONETMELIK)
- [Veri ihlali bildirimi — Kurul kararı 24/1/2019, 2019/10 (72 saat)](https://www.kvkk.gov.tr/Icerik/5362/Veri-Ihlali-Bildirimi)
- [Yeterli korumaya sahip ülkelerin belirlenmesinde esas alınacak kriterler](https://www.kvkk.gov.tr/Icerik/5470/Kisisel-Verileri-Koruma-Kurulu-nun-Yeni-Yayinlanan-Karari)
- [2026 KVKK idari para cezaları ve yeniden değerleme oranı (%25,49)](https://www.cottgroup.com/tr/mevzuat/item/yeniden-degerleme-oranina-gore-2026-yili-kvkk-idari-para-cezalari)
- [2026 VERBİS kayıt istisnaları — 50 çalışan / 100 milyon TL eşiği](https://www.mondaq.com/turkey/data-protection/1736820/2026-verb%C4%B0s-kay%C4%B1t-%C4%B0stisnalar%C4%B1-100-milyon-tl-e%C5%9Fi%C4%9Fi-ve-g%C3%BCncel-kurallar)
- [6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6563.pdf) ve İYS yükümlülüğü
- [5580 sayılı Özel Öğretim Kurumları Kanunu](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.5580.pdf) — kurum açma izni değerlendirmesi

Teknik tespitler doğrudan kod tabanından doğrulanmıştır: Supabase projesi `vnldsyjkhofofellwuiq`, bölge `eu-west-1` (AWS İrlanda); `registrations` tablosu şeması (migration 0009 + 0018–0022); e-posta katmanı `src/lib/notifications/email.ts` (Resend HTTP API, STRATO SMTP yedek); yapay zekâ sağlayıcı çözümleyicisi `src/lib/ai/provider.ts`; harici harita rıza kapısı `src/components/privacy/ExternalMap.tsx`.

---

## Diğer legal dokümanlarla ilişkisi

- `../Vertragspruefung-DE.md` — basılı Rusça sözleşmenin Almanca inceleme raporu. Bu dosyadaki tespitlerle uyumludur; özellikle **rızanın sözleşme imzasına bağlanamayacağı**, **sağlık verisinin ayrı rıza gerektirdiği** ve **cayma hakkının eksikliği** noktaları burada da tekrarlanmaktadır.
- Web sitesindeki canlı metinler: `/privacy`, `/terms`, `/cookies`, `/rules`, `/imprint` (`src/app/…/page.tsx`). MAS-KVKK-02'nin yurt dışı aktarım bölümü, `/privacy` sayfasının 5 inci bölümünün yerini alacak şekilde genişletilmiştir.
