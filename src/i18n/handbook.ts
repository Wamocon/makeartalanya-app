/**
 * Public handbook published at /handbook — the document a parent reads before
 * registering.
 *
 * Every operational rule here is taken from the participation agreement at
 * /rules so the two cannot drift: subscription validity, the 6-hour reschedule
 * notice, the 14-day withdrawal window and the 10-business-day media takedown
 * are quoted, not paraphrased loosely. If a rule changes in /rules it has to
 * change here in the same commit.
 *
 * This handbook deliberately does not restate prices. There is no price list in
 * the codebase and Art. 3 of the Distance Contracts Regulation requires the
 * total price including taxes to be given before the contract is concluded —
 * a stale number on a public page is worse than no number.
 */

import { COMPANY } from "@/lib/legal";
import type { HandbookDoc } from "./handbook-types";

const ATELIER = COMPANY.atelier.join(", ");

export const handbook: Record<"tr" | "en" | "ru", HandbookDoc> = {
  tr: {
    back: "Ana sayfaya dön",
    title: "Aile El Kitabı",
    subtitle:
      "Make Art Studio Alanya hakkında bilmeniz gereken her şey: dersler, kayıt, abonman, ödeme ve haklarınız.",
    updated: "Son güncelleme",
    contents: "İçindekiler",
    printLabel: "Yazdır / PDF olarak kaydet",
    intro:
      "Bu el kitabı, kayıt olmadan önce okumanız için hazırlandı. Derslerimizi, kayıt akışını ve uygulanan kuralları günlük dille anlatır. Hukuken bağlayıcı metin, imzalanan Katılım Sözleşmesi'dir; bu sayfa ile sözleşme arasında fark bulunması hâlinde tüketici lehine olan hüküm uygulanır.",
    sections: [
      {
        id: "welcome",
        nav: "Hoş geldiniz",
        h: "1. Hoş geldiniz",
        blocks: [
          {
            type: "p",
            text: "Make Art Studio, Alanya'nın Mahmutlar mahallesinde, denize birkaç adım mesafede bir sanat atölyesidir. Resim ve çizim, uygulamalı sanat ve el sanatları ile satranç dersleri veriyoruz — çocuklar ve yetişkinler için. Dersler Türkçe, İngilizce ve Rusça yürütülür.",
          },
          {
            type: "p",
            text: "Amacımız çocuğun elinden tutup bir eseri bitirmesini sağlamak: teknik adım adım öğretilir, herkes kendi işini tamamlar. Küçük gruplarla çalışıyoruz, çünkü öğretmenin her katılımcıya ayıracak zamanı olması gerekiyor.",
          },
          {
            type: "note",
            text: `Hizmeti sunan şirket: ${COMPANY.legalName}. Hizmet, Alanya'daki atölyede fiilen sunulur ve Türkiye Cumhuriyeti hukukuna tabidir.`,
          },
        ],
      },
      {
        id: "what-we-do",
        nav: "Dersler",
        h: "2. Ne öğretiyoruz",
        blocks: [
          {
            type: "list",
            items: [
              "Resim ve çizim — akrilik, yağlı boya, kurşun kalem, pastel ve suluboya. Teknik adım adım gösterilir; her katılımcı kendi eserini bitirir.",
              "Uygulamalı sanat ve el sanatları — farklı malzemelerle elle yapılan projeler.",
              "Satranç — hamle üzerinden düşünmeyi seven çocuklar için strateji ve oyun pratiği.",
              "Bireysel dersler — grup formatı uygun değilse birebir çalışma.",
            ],
          },
          {
            type: "p",
            text: "Derste kullanılan tüm malzemeler stüdyo tarafından sağlanır. Önceden hiçbir şey satın almanız gerekmez.",
          },
        ],
      },
      {
        id: "who-for",
        nav: "Kimler için",
        h: "3. Kimler katılabilir",
        blocks: [
          {
            type: "list",
            items: [
              "Çocuklar ve yetişkinler. Gruplar yaşa ve seviyeye göre oluşturulur.",
              "Gruplar küçüktür — en fazla 8 katılımcı.",
              "Öğretmenler Türkçe, İngilizce ve Rusça konuşur; kayıt sırasında tercih ettiğiniz dili belirtin.",
              "Hiçbir formatımız için önceden deneyim gerekmez.",
            ],
          },
        ],
      },
      {
        id: "visit",
        nav: "Bizi bulun",
        h: "4. Nerede, ne zaman",
        blocks: [
          {
            type: "table",
            head: ["", ""],
            rows: [
              ["Atölye", ATELIER],
              ["Çalışma saatleri", "Pazartesi – Cumartesi: 10:00 – 20:00"],
              ["Telefon / WhatsApp", COMPANY.phone],
              ["E-posta", COMPANY.email],
              ["Instagram", `@${COMPANY.instagram}`],
            ],
          },
          {
            type: "note",
            text: "Şirketin kayıtlı merkez adresi atölye adresinden farklıdır ve yalnızca resmî yazışmalar için kullanılır. Her iki adresi de Künye sayfasında bulabilirsiniz.",
          },
        ],
      },
      {
        id: "packages",
        nav: "Paketler ve ücretler",
        h: "5. Ders paketleri ve ücretler",
        blocks: [
          {
            type: "p",
            text: "Dersler tek tek veya paket hâlinde alınabilir. Paket büyüdükçe ders başına ücret düşer.",
          },
          {
            type: "table",
            head: ["Paket", "Ders sayısı"],
            rows: [
              ["Tek ders", "1"],
              ["İkili", "2"],
              ["Küçük paket", "4"],
              ["Standart paket (en çok tercih edilen)", "8"],
              ["Büyük paket", "12"],
              ["Geniş paket", "16"],
            ],
          },
          {
            type: "p",
            text: "Ücretler, vergiler dâhil toplam tutar olarak Türk lirası (₺) cinsinden ve sözleşme kurulmadan önce bildirilir. Güncel fiyat listesini stüdyodan yüz yüze, telefonla veya WhatsApp üzerinden alırsınız.",
          },
          {
            type: "p",
            text: "8 derslik abonman, ilk dersinizin tarihinden itibaren 1 (bir) takvim ayı boyunca geçerlidir.",
          },
          {
            type: "note",
            text: "Bu web sitesi üzerinden çevrimiçi ödeme alınmaz. Ödeme doğrudan stüdyo ile yapılır.",
          },
        ],
      },
      {
        id: "register",
        nav: "Nasıl kayıt olunur",
        h: "6. Kayıt nasıl yapılır",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Format ve paket seçin",
                text: "Hangi ders ilginizi çekiyor ve kaç ders almak istiyorsunuz? Emin değilseniz kayıt formundaki mesaj alanına yazın veya WhatsApp'tan sorun — birlikte karar veririz.",
              },
              {
                title: "Kayıt talebini gönderin",
                text: "Sitedeki kayıt formunu doldurun. Form ücretsizdir ve ödeme yükümlülüğü doğurmaz; yalnızca bir taleptir.",
              },
              {
                title: "Size WhatsApp'tan dönüş yaparız",
                text: "Stüdyo, formda verdiğiniz numaradan sizinle iletişime geçer; günü, saati, grubu ve paketi birlikte netleştiririz.",
              },
              {
                title: "Yeriniz ayrılır",
                text: "Gruptaki yer, kaydın teyit edilmesi ve — seçilen hizmet için öngörülmüşse — ödemenin ya da ön ödemenin yapılması ile ayrılmış sayılır.",
              },
              {
                title: "İlk dersinize gelin",
                text: "Dersten 5 dakika önce atölyede olun. Tüm malzemeler hazırdır.",
              },
            ],
          },
          {
            type: "note",
            text: "Telefonla veya doğrudan atölyeye gelerek de kayıt olabilirsiniz. Online form yalnızca en pratik yoldur, tek yol değildir.",
          },
        ],
      },
      {
        id: "form-fields",
        nav: "Formda ne sorulur",
        h: "7. Kayıt formunda ne sorulur",
        blocks: [
          {
            type: "p",
            text: "Form Türkçe, İngilizce ve Rusça doldurulabilir ve şunları sorar:",
          },
          {
            type: "list",
            items: [
              "Veli / vasi: ad soyad, T.C. kimlik veya pasaport numarası, çocukla yakınlık, e-posta, WhatsApp telefonu, adres.",
              "Çocuk: ad soyad, doğum tarihi, cinsiyet.",
              "Acil durum kişisi: size ulaşamadığımızda arayacağımız bir ad ve telefon.",
              "Çocuğu almaya yetkili kişiler: ders sonunda çocuğu kimler alabilir. Çocuk yalnızca burada belirttiğiniz kişilere teslim edilir.",
              "Branş ve paket ile eklemek istediğiniz mesaj.",
              "İsteğe bağlı: sağlık veya alerji notları (aşağıya bakın).",
            ],
          },
          {
            type: "p",
            text: "Zorunlu olan iki onay vardır: KVKK Aydınlatma Metni'ni okuduğunuz ve formun ödeme yükümlülüğü doğurmayan bir kayıt talebi olduğunu anladığınız. Formdaki diğer her şey — sağlık notları, fotoğraf ve video izinleri — isteğe bağlıdır, tek tek işaretlenir ve hiçbiri önceden işaretli gelmez.",
          },
          {
            type: "note",
            text: "İsteğe bağlı onayların hiçbirini vermemeniz kaydınızı, çocuğunuzun yerini veya ödediğiniz ücreti etkilemez.",
          },
        ],
      },
      {
        id: "first-lesson",
        nav: "İlk ders",
        h: "8. İlk dersinizde neler olur",
        blocks: [
          {
            type: "list",
            items: [
              "Dersin başlamasından 5 dakika önce gelin.",
              "Ders süresince çocuklar öğretmenin gözetimindedir.",
              "Veliler, stüdyo ile önceden mutabık kalarak atölyede bulunabilir.",
              "Malzeme, araç ve önlükler stüdyo tarafından verilir.",
              "Geç gelmek dersin süresini uzatmaz.",
              "Kişisel eşyalarınızı ders sonunda yanınıza alın.",
            ],
          },
        ],
      },
      {
        id: "subscription",
        nav: "Abonman ve telafi",
        h: "9. Abonman, erteleme ve kaçırılan dersler",
        blocks: [
          {
            type: "list",
            items: [
              "8 derslik abonman, ilk dersinizden itibaren 1 takvim ayı geçerlidir.",
              "Abonman süresi içinde en fazla 2 ders ertelenebilir — dersin başlamasına en az 6 saat kala stüdyo yönetimine bildirmek koşuluyla.",
              "Ertelenen dersler, aynı abonman süresi içinde yaşa uygun bir grupta boş kontenjanda veya telafi için ayrılan derslerde kullanılır.",
              "Önceden bildirilmeyen devamsızlıklar ve 2 ders sınırını aşan ertelemeler telafi edilmez.",
              "Çocuğunuzda bulaşıcı hastalık belirtisi — ateş, kusma, belirgin öksürük, döküntü — varsa lütfen evde kalsın. Bu nedenle kaçırılan dersler yukarıdaki erteleme kuralları kapsamında değerlendirilir.",
              "Dersi stüdyo iptal ederse seçim sizde: telafi dersi, eşdeğer bir ders veya o dersin bedelinin iadesi.",
            ],
          },
        ],
      },
      {
        id: "withdrawal",
        nav: "Cayma ve iade",
        h: "10. Ödeme, cayma hakkı ve iade",
        blocks: [
          {
            type: "p",
            text: "Sözleşme internet, telefon veya mesajlaşma uygulaması üzerinden ya da iş yeri dışında kurulmuşsa, kurulduğu tarihten itibaren 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden cayabilirsiniz.",
          },
          {
            type: "list",
            items: [
              `Cayma bildirimini bu süre içinde yazılı olarak ${COMPANY.email} adresine gönderin. Yalnızca telefonla yapılan bildirim yeterli değildir; kalıcı bir veri saklayıcısı gerekir.`,
              "Hizmetin 14 gün dolmadan başlamasını istediyseniz bu talebiniz ayrıca kayda alınır. Bu durumda cayma hâlinde, bildirime kadar fiilen verilen derslerin orantılı bedeli tahsil edilir.",
              "Hizmet, açık onayınızla tamamen ifa edilmişse cayma hakkı sona erer.",
              "İade, bildiriminiz stüdyoya ulaştıktan sonra en geç 14 gün içinde ve ödemeyi yaptığınız yöntemle gerçekleştirilir.",
            ],
          },
          {
            type: "p",
            text: "Sözleşmeyi sona erdirmeniz hâlinde, henüz verilmemiş derslere düşen ön ödeme, stüdyonun fiilen yaptığı ve belgelenebilir masrafları mahsup edilerek 14 gün içinde iade edilir. 6502 sayılı Tüketicinin Korunması Hakkında Kanun'dan doğan haklarınız her hâlde saklıdır.",
          },
        ],
      },
      {
        id: "health",
        nav: "Sağlık bilgileri",
        h: "11. Sağlık ve alerji bilgileri",
        blocks: [
          {
            type: "p",
            text: "Kayıt formundaki sağlık / alerji alanı isteğe bağlıdır. Boş bırakabilirsiniz; bu, kaydınızı, çocuğunuzun grubundaki yerini veya ücreti etkilemez.",
          },
          {
            type: "list",
            items: [
              "Sağlık verisi, 6698 sayılı KVKK m.6 anlamında özel nitelikli kişisel veridir. Yazdıklarınızı yalnızca ayrı ve açık rızanızla, yalnızca çocuğunuzun ders güvenliği amacıyla işleriz.",
              "Sağlık bilgileri Telegram bildirimlerine veya grup mesajlarına hiçbir şekilde dâhil edilmez.",
              "Çocuğunuzun sağlığı ders sırasında kötüleşirse sizinle iletişime geçer ve çocuğun güvenliği doğrultusunda hareket ederiz. Gecikmesinde sakınca bulunan hâllerde 112 acil sağlık hizmetleri aranır.",
            ],
          },
        ],
      },
      {
        id: "media",
        nav: "Fotoğraf ve video",
        h: "12. Fotoğraf ve video",
        blocks: [
          {
            type: "p",
            text: "Derslerde, atölye çalışmalarında, sergilerde ve kamplarda; yaratıcı anları belgelemek ve stüdyonun faaliyetlerini tanıtmak amacıyla fotoğraf ve video çekilebilir.",
          },
          {
            type: "list",
            items: [
              "Web sitesinde yayın ile stüdyonun sosyal medya hesaplarında yayın iki ayrı izindir. Ayrı ayrı işaretlenir ve hiçbiri önceden işaretli değildir.",
              "İkisi de tamamen gönüllüdür. Rıza vermemeniz kaydı, dersleri veya ücreti etkilemez.",
              `Rızanızı her zaman, gerekçe göstermeden ve ücretsiz olarak ${COMPANY.email} adresine yazarak geri çekebilirsiniz. Talebi aldıktan sonra 10 iş günü içinde ilgili materyalin web sitemizdeki ve sosyal medya hesaplarımızdaki yayınına son verir ve yeni kullanım yapmayız.`,
              "Geri çekme tarihinden önce fiziksel olarak basılmış ve dağıtılmış materyalin toplanması mümkün olmayabilir; üçüncü kişilerin daha önce kaydettiği veya paylaştığı kopyalar üzerinde tam kontrol garanti edemeyiz.",
              "Materyaller yalnızca stüdyo faaliyetleriyle bağlantılı olarak kullanılır; katılımcının onurunu, güvenliğini veya itibarını zedeleyebilecek bilgilerle birlikte yayımlanmaz. Çocuğun makul itirazı ve üstün yararı her hâlde gözetilir.",
            ],
          },
        ],
      },
      {
        id: "data",
        nav: "Verileriniz",
        h: "13. Verileriniz ve haklarınız",
        blocks: [
          {
            type: "p",
            text: `Veri sorumlusu ${COMPANY.legalName}'dir. Kayıt, iletişim, yoklama, ödeme kayıtları ve güvenlik; kural olarak sözleşmenin kurulması ve ifası (KVKK m.5/2-c) ile hukuki yükümlülükler (m.5/2-ç) kapsamında yürütülür — açık rızaya dayanmaz. Sözleşmeyi imzalamanız bir açık rıza beyanı değildir.`,
          },
          {
            type: "list",
            items: [
              "Verileriniz pazarlama amacıyla üçüncü kişilere satılmaz veya devredilmez.",
              "Barındırma, veritabanı, e-posta ve bildirim sağlayıcıları yalnızca veri işleyen sıfatıyla ve amaçla sınırlı olarak devreye girer.",
              "Telegram üzerinden bildirim almak tamamen isteğe bağlıdır. Kullanmazsanız oraya hiçbir şey gönderilmez. Çocuğunuzun adı ve sağlık verileri hiçbir koşulda Telegram üzerinden iletilmez.",
              `KVKK m.11 uyarınca hangi verilerinizin işlendiğini öğrenme, düzeltilmesini veya silinmesini isteme, işlemeye itiraz etme ve zararınızın giderilmesini talep etme hakkınız vardır. Başvurunuzu ${COMPANY.email} adresine iletin.`,
            ],
          },
          {
            type: "p",
            text: "Saklama süreleri, yurt dışına aktarım ve işleme amaçlarının tam listesi için KVKK Aydınlatma Metni'ne bakın.",
          },
        ],
      },
      {
        id: "rules",
        nav: "Stüdyo kuralları",
        h: "14. Stüdyo kuralları",
        blocks: [
          {
            type: "list",
            items: [
              "Lütfen dersten 5 dakika önce gelin.",
              "Mobilya, ekipman, araç ve malzemeler özenle kullanılır.",
              "Çocuğun kasıtlı davranışı sonucu stüdyo eşyasında oluşan zarardan veliler sorumludur; zararın miktarı ve giderilme biçimi taraflarca birlikte belirlenir.",
              "Kişisel eşyalar ders sonunda alınmalıdır. Stüdyo, kendi kusuru bulunmadıkça gözetimsiz bırakılan eşyalardan sorumlu değildir.",
              "Atölyede saygılı, kapsayıcı ve güvenli bir ortamın korunması pazarlık konusu değildir.",
            ],
          },
        ],
      },
      {
        id: "help",
        nav: "Sorular ve şikâyetler",
        h: "15. Sorularınız ve şikâyetleriniz",
        blocks: [
          {
            type: "p",
            text: "Aklınıza gelen her şeyi Türkçe, İngilizce veya Rusça sorabilirsiniz — telefonla, WhatsApp'tan veya e-postayla. Bir şey ters gittiyse önce bize söyleyin; çoğu konu bir görüşmeyle çözülür.",
          },
          {
            type: "p",
            text: "Yasal başvuru yolunuz her hâlde saklıdır: parasal sınırlara göre yerleşim yerinizdeki Tüketici Hakem Heyeti'ne veya Tüketici Mahkemesi'ne başvurabilirsiniz. Bu hak sözleşmeyle ortadan kaldırılamaz.",
          },
        ],
      },
      {
        id: "documents",
        nav: "Belgeler",
        h: "16. Belgeler",
        blocks: [
          {
            type: "p",
            text: "Bu el kitabı bir özet metindir. Bağlayıcı ve tam metinler şunlardır:",
          },
          {
            type: "links",
            items: [
              { href: "/rules", label: "Katılım Sözleşmesi ve Stüdyo Kuralları" },
              { href: "/privacy", label: "KVKK Aydınlatma Metni" },
              { href: "/terms", label: "Ön Bilgilendirme ve Hizmet Koşulları" },
              { href: "/cookies", label: "Çerez Politikası" },
              { href: "/imprint", label: "Künye" },
              { href: "/kayit", label: "Kayıt formu" },
            ],
          },
        ],
      },
    ],
  },

  en: {
    back: "Back to homepage",
    title: "Family Handbook",
    subtitle:
      "Everything you need to know about Make Art Studio Alanya: the classes, registration, subscriptions, payment and your rights.",
    updated: "Last updated",
    contents: "Contents",
    printLabel: "Print / save as PDF",
    intro:
      "This handbook is written to be read before you register. It explains our classes, how registration works and which rules apply, in plain language. The legally binding text is the signed Participation Agreement; where this page and the agreement differ, the provision more favourable to the consumer applies.",
    sections: [
      {
        id: "welcome",
        nav: "Welcome",
        h: "1. Welcome",
        blocks: [
          {
            type: "p",
            text: "Make Art Studio is an art atelier in Mahmutlar, Alanya, a few steps from the sea. We teach painting and drawing, applied art and crafts, and chess — to children and to adults. Lessons run in Turkish, English and Russian.",
          },
          {
            type: "p",
            text: "Our aim is that everyone finishes something of their own: technique is taught step by step and each participant completes their own piece. We work in small groups, because the instructor needs time for every person in the room.",
          },
          {
            type: "note",
            text: `Operated by ${COMPANY.legalName}. Services are provided at the atelier in Alanya and are governed by the law of the Republic of Türkiye.`,
          },
        ],
      },
      {
        id: "what-we-do",
        nav: "Classes",
        h: "2. What we teach",
        blocks: [
          {
            type: "list",
            items: [
              "Painting and drawing — acrylic, oil, pencil, pastel and watercolour. Technique is shown step by step; every participant finishes their own work.",
              "Applied art and crafts — hands-on projects with mixed materials.",
              "Chess — strategy and game practice for children who enjoy thinking in moves.",
              "Individual lessons — one-to-one, if a group format does not fit.",
            ],
          },
          {
            type: "p",
            text: "All materials used in a lesson are provided by the studio. Nothing needs to be bought in advance.",
          },
        ],
      },
      {
        id: "who-for",
        nav: "Who it's for",
        h: "3. Who can join",
        blocks: [
          {
            type: "list",
            items: [
              "Children and adults. Groups are formed by age and level.",
              "Groups are small — up to 8 participants.",
              "Instructors speak Turkish, English and Russian; tell us your preferred language when you register.",
              "No previous experience is needed for any of our formats.",
            ],
          },
        ],
      },
      {
        id: "visit",
        nav: "Find us",
        h: "4. Where and when",
        blocks: [
          {
            type: "table",
            head: ["", ""],
            rows: [
              ["Atelier", ATELIER],
              ["Opening hours", "Monday – Saturday: 10:00 – 20:00"],
              ["Phone / WhatsApp", COMPANY.phone],
              ["Email", COMPANY.email],
              ["Instagram", `@${COMPANY.instagram}`],
            ],
          },
          {
            type: "note",
            text: "The registered company address differs from the atelier address and is used for official correspondence only. Both are listed in the Imprint.",
          },
        ],
      },
      {
        id: "packages",
        nav: "Packages and prices",
        h: "5. Lesson packages and prices",
        blocks: [
          {
            type: "p",
            text: "Lessons are sold singly or as packages. The larger the package, the lower the price per lesson.",
          },
          {
            type: "table",
            head: ["Package", "Lessons"],
            rows: [
              ["Single lesson", "1"],
              ["Duo", "2"],
              ["Small package", "4"],
              ["Standard package (most popular)", "8"],
              ["Large package", "12"],
              ["Extended package", "16"],
            ],
          },
          {
            type: "p",
            text: "Prices are given as a total amount including taxes, in Turkish lira (₺), before any contract is concluded. You receive the current price list from the studio in person, by phone or on WhatsApp.",
          },
          {
            type: "p",
            text: "The 8-lesson subscription is valid for one calendar month from the date of your first lesson.",
          },
          {
            type: "note",
            text: "No online payment is taken through this website. Payment is arranged directly with the studio.",
          },
        ],
      },
      {
        id: "register",
        nav: "How to register",
        h: "6. How to register",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Choose a format and a package",
                text: "Which class interests you, and how many lessons do you want? If you are unsure, write it in the message field of the form or ask on WhatsApp — we will work it out together.",
              },
              {
                title: "Send the registration request",
                text: "Fill in the registration form on this site. It is free and creates no obligation to pay; it is a request, nothing more.",
              },
              {
                title: "We reply on WhatsApp",
                text: "The studio contacts you on the number you gave, and together we settle the day, the time, the group and the package.",
              },
              {
                title: "Your place is reserved",
                text: "A place in the group counts as reserved once your registration is confirmed and — where the chosen service requires it — payment or a deposit has been made.",
              },
              {
                title: "Come to your first lesson",
                text: "Be at the atelier 5 minutes before the lesson. All materials are ready.",
              },
            ],
          },
          {
            type: "note",
            text: "You can also register by phone or in person at the atelier. The online form is simply the most convenient route, not the only one.",
          },
        ],
      },
      {
        id: "form-fields",
        nav: "What the form asks",
        h: "7. What the registration form asks",
        blocks: [
          {
            type: "p",
            text: "The form can be filled in in Turkish, English or Russian, and asks for:",
          },
          {
            type: "list",
            items: [
              "Parent / guardian: full name, ID or passport number, relationship to the child, email, WhatsApp number, address.",
              "Child: full name, date of birth, gender.",
              "Emergency contact: a name and phone number we can call if we cannot reach you.",
              "Authorised pickup: who may collect the child after the lesson. Your child is released only to the people you name here.",
              "Class and package, plus any message you want to add.",
              "Optional: health or allergy notes (see below).",
            ],
          },
          {
            type: "p",
            text: "Two confirmations are required: that you have read the KVKK privacy notice, and that you understand the form is a non-binding registration request with no payment obligation. Everything else on the form — health notes, photo and video permissions — is optional, ticked separately, and never pre-ticked.",
          },
          {
            type: "note",
            text: "Giving none of the optional consents does not affect your registration, your child's place or the price you pay.",
          },
        ],
      },
      {
        id: "first-lesson",
        nav: "First lesson",
        h: "8. What happens at your first lesson",
        blocks: [
          {
            type: "list",
            items: [
              "Arrive 5 minutes before the lesson starts.",
              "Children are supervised by the instructor throughout the lesson.",
              "Parents may stay in the atelier by prior arrangement with the studio.",
              "Materials, tools and aprons are provided by the studio.",
              "Arriving late does not extend the lesson.",
              "Take personal belongings with you at the end.",
            ],
          },
        ],
      },
      {
        id: "subscription",
        nav: "Subscription and catch-up",
        h: "9. Subscription, rescheduling and missed lessons",
        blocks: [
          {
            type: "list",
            items: [
              "The 8-lesson subscription is valid for one calendar month from your first lesson.",
              "Up to 2 lessons per subscription may be moved — provided you tell the studio at least 6 hours before the lesson starts.",
              "Moved lessons are used within the same subscription period, in an age-appropriate group with a free place or in a lesson set aside for catch-up.",
              "Absences not announced in advance, and reschedules beyond the limit of 2, are not made up.",
              "If your child shows signs of an infectious illness — fever, vomiting, a marked cough, a rash — please keep them at home. Lessons missed for that reason are handled under the rescheduling rules above.",
              "If the studio cancels a lesson, you choose: a catch-up lesson, an equivalent lesson, or a refund of that lesson's price.",
            ],
          },
        ],
      },
      {
        id: "withdrawal",
        nav: "Withdrawal and refunds",
        h: "10. Payment, right of withdrawal and refunds",
        blocks: [
          {
            type: "p",
            text: "If the contract was concluded at a distance — through this website, by phone or by messenger — or away from the atelier, you may withdraw within 14 days of concluding it, without giving a reason and without any penalty.",
          },
          {
            type: "list",
            items: [
              `Send the withdrawal in writing within those 14 days to ${COMPANY.email}. A phone call alone is not sufficient; it has to be on a durable medium.`,
              "If you asked for the lessons to start before the 14 days were up, that request is recorded separately. On withdrawal you then pay the proportional value of the lessons actually held up to your notice.",
              "Once the service has been fully performed with your express consent, the right of withdrawal ends.",
              "Refunds are made within 14 days of your notice reaching the studio, using the same payment method you used.",
            ],
          },
          {
            type: "p",
            text: "If you end the contract, the prepayment attributable to lessons not yet held is refunded within 14 days, less the studio's actual and documented costs. Your rights under Consumer Protection Law No. 6502 remain unaffected in every case.",
          },
        ],
      },
      {
        id: "health",
        nav: "Health information",
        h: "11. Health and allergy information",
        blocks: [
          {
            type: "p",
            text: "The health / allergy field on the registration form is optional. You may leave it empty; that does not affect your registration, your child's place in the group or the price.",
          },
          {
            type: "list",
            items: [
              "Health data is a special category of personal data under Art. 6 of Law No. 6698 (KVKK). We process what you write only with your separate, explicit consent, and only to keep your child safe during lessons.",
              "Health information is never included in Telegram notifications or in group messages.",
              "If your child becomes unwell during a lesson, we contact you and act in your child's interest. Where there is immediate danger, we call the emergency service 112.",
            ],
          },
        ],
      },
      {
        id: "media",
        nav: "Photos and video",
        h: "12. Photos and video",
        blocks: [
          {
            type: "p",
            text: "We may photograph or film lessons, workshops, exhibitions and camps to document creative moments and to present what the studio does.",
          },
          {
            type: "list",
            items: [
              "Publishing on our website and publishing on the studio's social-media accounts are two separate permissions. They are ticked separately and neither is pre-ticked.",
              "Both are entirely voluntary. Refusing does not affect registration, lessons or price.",
              `You may withdraw consent at any time, free of charge and without giving a reason, by writing to ${COMPANY.email}. Within 10 business days of receiving your request we stop publishing the material on our website and social-media accounts and make no further use of it.`,
              "Material physically printed and distributed before the date of withdrawal may not be recoverable, and we cannot guarantee full control over copies third parties saved or shared earlier.",
              "Material is used only in connection with studio activity and is never published alongside information that could harm a participant's dignity, safety or reputation. A child's reasonable objection and best interests are respected in every case.",
            ],
          },
        ],
      },
      {
        id: "data",
        nav: "Your data",
        h: "13. Your data and your rights",
        blocks: [
          {
            type: "p",
            text: `The data controller is ${COMPANY.legalName}. Registration, contact, attendance, payment records and safety are handled on the basis of concluding and performing the contract (Art. 5(2)(c) KVKK) and of legal obligations (Art. 5(2)(ç)) — not on consent. Signing the contract is not a declaration of consent.`,
          },
          {
            type: "list",
            items: [
              "Your data is not sold or transferred to third parties for marketing.",
              "Hosting, database, email and notification providers act only as processors, limited to that purpose.",
              "Receiving updates on Telegram is entirely optional. If you do not use it, nothing is sent there. Your child's name and health data are never transmitted over Telegram.",
              `Under Art. 11 KVKK you may ask which of your data is processed, request correction or deletion, object to processing and claim compensation for damage. Send your request to ${COMPANY.email}.`,
            ],
          },
          {
            type: "p",
            text: "Retention periods, transfers abroad and the full list of processing purposes are set out in the KVKK privacy notice.",
          },
        ],
      },
      {
        id: "rules",
        nav: "Studio rules",
        h: "14. Studio rules",
        blocks: [
          {
            type: "list",
            items: [
              "Please arrive 5 minutes before the lesson.",
              "Furniture, equipment, tools and materials are handled with care.",
              "Parents are responsible for damage to studio property caused deliberately by a child; the amount and the way it is settled are determined together.",
              "Personal items are taken home at the end of the lesson. The studio is not liable for unattended items unless the loss is its own fault.",
              "Maintaining a respectful, inclusive and safe atmosphere in the atelier is not negotiable.",
            ],
          },
        ],
      },
      {
        id: "help",
        nav: "Questions and complaints",
        h: "15. Questions and complaints",
        blocks: [
          {
            type: "p",
            text: "Ask us anything, in Turkish, English or Russian — by phone, on WhatsApp or by email. If something goes wrong, tell us first; most things are settled in a conversation.",
          },
          {
            type: "p",
            text: "Your statutory route always remains open: depending on the amount in dispute, you may apply to the Consumer Arbitration Committee (Tüketici Hakem Heyeti) or the Consumer Court (Tüketici Mahkemesi) where you live. That right cannot be excluded by contract.",
          },
        ],
      },
      {
        id: "documents",
        nav: "Documents",
        h: "16. Documents",
        blocks: [
          {
            type: "p",
            text: "This handbook is a summary. The binding and complete texts are:",
          },
          {
            type: "links",
            items: [
              { href: "/rules", label: "Participation Agreement and Studio Rules" },
              { href: "/privacy", label: "KVKK Privacy Notice" },
              { href: "/terms", label: "Pre-contract Information and Service Terms" },
              { href: "/cookies", label: "Cookie Policy" },
              { href: "/imprint", label: "Imprint" },
              { href: "/kayit", label: "Registration form" },
            ],
          },
        ],
      },
    ],
  },

  ru: {
    back: "Вернуться на главную",
    title: "Справочник для родителей",
    subtitle:
      "Всё, что нужно знать о Make Art Studio в Алании: занятия, запись, абонементы, оплата и ваши права.",
    updated: "Последнее обновление",
    contents: "Содержание",
    printLabel: "Печать / сохранить в PDF",
    intro:
      "Этот справочник написан для чтения до записи. Он простым языком объясняет наши занятия, порядок записи и действующие правила. Юридически обязывающий текст — подписанный Договор об участии; при расхождении между этой страницей и договором применяется положение, более выгодное для потребителя.",
    sections: [
      {
        id: "welcome",
        nav: "Добро пожаловать",
        h: "1. Добро пожаловать",
        blocks: [
          {
            type: "p",
            text: "Make Art Studio — художественная студия в районе Махмутлар в Алании, в нескольких шагах от моря. Мы преподаём живопись и рисунок, прикладное творчество и рукоделие, а также шахматы — детям и взрослым. Занятия проходят на турецком, английском и русском языках.",
          },
          {
            type: "p",
            text: "Наша цель — чтобы каждый закончил свою собственную работу: техника показывается шаг за шагом, и каждый участник доводит работу до конца. Мы работаем малыми группами, потому что у преподавателя должно быть время на каждого.",
          },
          {
            type: "note",
            text: `Услуги оказывает ${COMPANY.legalName}. Занятия проводятся в студии в Алании и регулируются правом Республики Турция.`,
          },
        ],
      },
      {
        id: "what-we-do",
        nav: "Занятия",
        h: "2. Чему мы учим",
        blocks: [
          {
            type: "list",
            items: [
              "Живопись и рисунок — акрил, масло, карандаш, пастель и акварель. Техника показывается пошагово; каждый участник завершает свою работу.",
              "Прикладное творчество и рукоделие — проекты своими руками из разных материалов.",
              "Шахматы — стратегия и игровая практика для детей, которым нравится думать ходами.",
              "Индивидуальные занятия — один на один, если групповой формат не подходит.",
            ],
          },
          {
            type: "p",
            text: "Все материалы для занятия предоставляет студия. Ничего покупать заранее не нужно.",
          },
        ],
      },
      {
        id: "who-for",
        nav: "Для кого",
        h: "3. Кто может записаться",
        blocks: [
          {
            type: "list",
            items: [
              "Дети и взрослые. Группы формируются по возрасту и уровню.",
              "Группы небольшие — до 8 участников.",
              "Преподаватели говорят на турецком, английском и русском; укажите предпочитаемый язык при записи.",
              "Предварительный опыт не требуется ни для одного из наших форматов.",
            ],
          },
        ],
      },
      {
        id: "visit",
        nav: "Как нас найти",
        h: "4. Где и когда",
        blocks: [
          {
            type: "table",
            head: ["", ""],
            rows: [
              ["Студия", ATELIER],
              ["Часы работы", "Понедельник – Суббота: 10:00 – 20:00"],
              ["Телефон / WhatsApp", COMPANY.phone],
              ["Email", COMPANY.email],
              ["Instagram", `@${COMPANY.instagram}`],
            ],
          },
          {
            type: "note",
            text: "Юридический адрес компании отличается от адреса студии и используется только для официальной переписки. Оба адреса указаны в разделе «Выходные данные».",
          },
        ],
      },
      {
        id: "packages",
        nav: "Пакеты и цены",
        h: "5. Пакеты занятий и цены",
        blocks: [
          {
            type: "p",
            text: "Занятия можно брать по одному или пакетом. Чем больше пакет, тем ниже цена за занятие.",
          },
          {
            type: "table",
            head: ["Пакет", "Занятий"],
            rows: [
              ["Одно занятие", "1"],
              ["Два занятия", "2"],
              ["Малый пакет", "4"],
              ["Стандартный пакет (самый популярный)", "8"],
              ["Большой пакет", "12"],
              ["Расширенный пакет", "16"],
            ],
          },
          {
            type: "p",
            text: "Цены сообщаются как итоговая сумма с учётом налогов в турецких лирах (₺) и до заключения договора. Актуальный прайс вы получаете в студии лично, по телефону или в WhatsApp.",
          },
          {
            type: "p",
            text: "Абонемент на 8 занятий действует 1 (один) календарный месяц с даты первого занятия.",
          },
          {
            type: "note",
            text: "Через этот сайт оплата не принимается. Оплата производится напрямую в студии.",
          },
        ],
      },
      {
        id: "register",
        nav: "Как записаться",
        h: "6. Как записаться",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Выберите формат и пакет",
                text: "Какое занятие вам интересно и сколько занятий вы хотите? Если не уверены — напишите в поле «сообщение» в форме или спросите в WhatsApp, решим вместе.",
              },
              {
                title: "Отправьте заявку на запись",
                text: "Заполните форму записи на сайте. Это бесплатно и не создаёт обязанности платить — это только заявка.",
              },
              {
                title: "Мы отвечаем в WhatsApp",
                text: "Студия связывается с вами по указанному номеру, и мы вместе согласуем день, время, группу и пакет.",
              },
              {
                title: "Место закрепляется за вами",
                text: "Место в группе считается зарезервированным после подтверждения записи и — если это предусмотрено для выбранной услуги — внесения оплаты или предоплаты.",
              },
              {
                title: "Приходите на первое занятие",
                text: "Будьте в студии за 5 минут до начала. Все материалы уже готовы.",
              },
            ],
          },
          {
            type: "note",
            text: "Записаться можно также по телефону или лично в студии. Онлайн-форма — просто самый удобный путь, но не единственный.",
          },
        ],
      },
      {
        id: "form-fields",
        nav: "Что спрашивает форма",
        h: "7. Что спрашивает форма записи",
        blocks: [
          {
            type: "p",
            text: "Форму можно заполнить на турецком, английском или русском языке. В ней указываются:",
          },
          {
            type: "list",
            items: [
              "Родитель / опекун: имя и фамилия, номер удостоверения личности или паспорта, кем приходится ребёнку, email, номер WhatsApp, адрес.",
              "Ребёнок: имя и фамилия, дата рождения, пол.",
              "Контакт для экстренной связи: имя и телефон человека, которому мы позвоним, если не сможем связаться с вами.",
              "Кто может забирать ребёнка после занятия. Ребёнок передаётся только тем людям, которых вы укажете здесь.",
              "Занятие и пакет, а также любое сообщение, которое вы хотите добавить.",
              "По желанию: сведения о здоровье или аллергиях (см. ниже).",
            ],
          },
          {
            type: "p",
            text: "Обязательных подтверждений два: что вы прочитали уведомление KVKK и что понимаете — форма является необязывающей заявкой без обязанности платить. Всё остальное в форме — сведения о здоровье, разрешения на фото и видео — необязательно, отмечается отдельно и никогда не проставлено заранее.",
          },
          {
            type: "note",
            text: "Отказ от любых необязательных согласий не влияет ни на запись, ни на место ребёнка в группе, ни на цену.",
          },
        ],
      },
      {
        id: "first-lesson",
        nav: "Первое занятие",
        h: "8. Что происходит на первом занятии",
        blocks: [
          {
            type: "list",
            items: [
              "Приходите за 5 минут до начала занятия.",
              "Во время занятия дети находятся под присмотром преподавателя.",
              "Родители могут находиться в студии по предварительной договорённости со студией.",
              "Материалы, инструменты и фартуки предоставляет студия.",
              "Опоздание не продлевает занятие.",
              "Личные вещи забирайте с собой по окончании занятия.",
            ],
          },
        ],
      },
      {
        id: "subscription",
        nav: "Абонемент и отработки",
        h: "9. Абонемент, перенос и пропущенные занятия",
        blocks: [
          {
            type: "list",
            items: [
              "Абонемент на 8 занятий действует один календарный месяц с даты первого занятия.",
              "В течение срока абонемента можно перенести не более 2 занятий — при условии уведомления администрации студии не позднее чем за 6 часов до начала занятия.",
              "Перенесённые занятия используются в пределах того же срока абонемента — в подходящей по возрасту группе при наличии свободного места либо в занятиях, выделенных для отработки.",
              "Пропуски без предварительного уведомления и переносы сверх лимита в 2 занятия не отрабатываются.",
              "Если у ребёнка есть признаки инфекционного заболевания — температура, рвота, выраженный кашель, сыпь, — пожалуйста, оставьте его дома. Пропущенные по этой причине занятия рассматриваются по правилам переноса выше.",
              "Если занятие отменяет студия, выбор за вами: отработка, равноценное занятие или возврат стоимости этого занятия.",
            ],
          },
        ],
      },
      {
        id: "withdrawal",
        nav: "Отказ и возврат",
        h: "10. Оплата, право на отказ и возврат",
        blocks: [
          {
            type: "p",
            text: "Если договор был заключён дистанционно — через этот сайт, по телефону или в мессенджере — либо вне помещения студии, вы можете отказаться от него в течение 14 дней с даты заключения, без объяснения причин и без штрафа.",
          },
          {
            type: "list",
            items: [
              `Направьте уведомление об отказе в письменной форме в течение этих 14 дней на адрес ${COMPANY.email}. Только телефонного звонка недостаточно — нужен долговременный носитель.`,
              "Если вы просили начать занятия до истечения 14 дней, эта просьба фиксируется отдельно. При отказе вы оплачиваете пропорциональную стоимость фактически проведённых до уведомления занятий.",
              "Если услуга полностью оказана с вашего явного согласия, право на отказ прекращается.",
              "Возврат производится в течение 14 дней с момента получения студией вашего уведомления тем же способом оплаты.",
            ],
          },
          {
            type: "p",
            text: "При прекращении договора предоплата за ещё не проведённые занятия возвращается в течение 14 дней с зачётом фактически понесённых и документально подтверждённых расходов студии. Ваши права по Закону № 6502 «О защите потребителей» сохраняются в любом случае.",
          },
        ],
      },
      {
        id: "health",
        nav: "Сведения о здоровье",
        h: "11. Сведения о здоровье и аллергиях",
        blocks: [
          {
            type: "p",
            text: "Поле о здоровье и аллергиях в форме записи заполняется по желанию. Его можно оставить пустым — это не влияет на запись, место ребёнка в группе или цену.",
          },
          {
            type: "list",
            items: [
              "Данные о здоровье относятся к особым категориям персональных данных по ст. 6 Закона № 6698 (KVKK). Мы обрабатываем указанное вами только на основании отдельного явного согласия и только для безопасности ребёнка на занятии.",
              "Сведения о здоровье никогда не включаются в уведомления Telegram и в групповые сообщения.",
              "Если самочувствие ребёнка ухудшится во время занятия, мы связываемся с вами и действуем в интересах ребёнка. При наличии непосредственной опасности вызывается служба экстренной помощи 112.",
            ],
          },
        ],
      },
      {
        id: "media",
        nav: "Фото и видео",
        h: "12. Фото и видео",
        blocks: [
          {
            type: "p",
            text: "На занятиях, мастер-классах, выставках и в лагерях может проводиться фото- и видеосъёмка, чтобы зафиксировать творческие моменты и рассказать о деятельности студии.",
          },
          {
            type: "list",
            items: [
              "Публикация на сайте и публикация в социальных сетях студии — два отдельных разрешения. Они отмечаются по отдельности, и ни одно не проставлено заранее.",
              "Оба разрешения полностью добровольны. Отказ не влияет на запись, занятия или цену.",
              `Согласие можно отозвать в любое время, бесплатно и без объяснения причин, написав на ${COMPANY.email}. В течение 10 рабочих дней с момента получения запроса мы прекращаем публикацию материала на сайте и в аккаунтах студии в социальных сетях и не используем его далее.`,
              "Материалы, физически отпечатанные и распространённые до даты отзыва, могут быть невозвратны; мы не можем гарантировать полный контроль над копиями, сохранёнными или распространёнными третьими лицами ранее.",
              "Материалы используются только в связи с деятельностью студии и никогда не публикуются вместе со сведениями, способными задеть достоинство, безопасность или репутацию участника. Обоснованное возражение ребёнка и его наилучшие интересы учитываются в любом случае.",
            ],
          },
        ],
      },
      {
        id: "data",
        nav: "Ваши данные",
        h: "13. Ваши данные и ваши права",
        blocks: [
          {
            type: "p",
            text: `Оператор данных — ${COMPANY.legalName}. Запись, связь, учёт посещаемости, платёжные записи и безопасность обрабатываются на основании заключения и исполнения договора (ст. 5(2)(c) KVKK) и правовых обязанностей (ст. 5(2)(ç)), а не на основании согласия. Подписание договора не является выражением согласия.`,
          },
          {
            type: "list",
            items: [
              "Ваши данные не продаются и не передаются третьим лицам в маркетинговых целях.",
              "Поставщики хостинга, базы данных, электронной почты и уведомлений выступают только как обработчики и в пределах этой цели.",
              "Получение уведомлений в Telegram полностью добровольно. Если вы им не пользуетесь, туда ничего не отправляется. Имя ребёнка и данные о его здоровье не передаются через Telegram ни при каких условиях.",
              `По ст. 11 KVKK вы вправе узнать, какие ваши данные обрабатываются, требовать их исправления или удаления, возражать против обработки и требовать возмещения ущерба. Направляйте запросы на ${COMPANY.email}.`,
            ],
          },
          {
            type: "p",
            text: "Сроки хранения, передача за рубеж и полный перечень целей обработки указаны в уведомлении KVKK.",
          },
        ],
      },
      {
        id: "rules",
        nav: "Правила студии",
        h: "14. Правила студии",
        blocks: [
          {
            type: "list",
            items: [
              "Пожалуйста, приходите за 5 минут до занятия.",
              "С мебелью, оборудованием, инструментами и материалами обращаются бережно.",
              "Родители отвечают за ущерб имуществу студии, причинённый ребёнком умышленно; размер и порядок возмещения определяются сторонами совместно.",
              "Личные вещи забираются по окончании занятия. Студия не отвечает за оставленные без присмотра вещи, если утрата произошла не по её вине.",
              "Уважительная, дружелюбная и безопасная атмосфера в студии не подлежит обсуждению.",
            ],
          },
        ],
      },
      {
        id: "help",
        nav: "Вопросы и жалобы",
        h: "15. Вопросы и жалобы",
        blocks: [
          {
            type: "p",
            text: "Спрашивайте о чём угодно — на турецком, английском или русском, по телефону, в WhatsApp или по электронной почте. Если что-то пошло не так, скажите сначала нам: большинство вопросов решается в разговоре.",
          },
          {
            type: "p",
            text: "Ваш законный путь всегда остаётся открытым: в зависимости от суммы спора вы можете обратиться в Комиссию по потребительским спорам (Tüketici Hakem Heyeti) или в Потребительский суд (Tüketici Mahkemesi) по месту жительства. Это право нельзя исключить договором.",
          },
        ],
      },
      {
        id: "documents",
        nav: "Документы",
        h: "16. Документы",
        blocks: [
          {
            type: "p",
            text: "Этот справочник — краткое изложение. Обязывающие и полные тексты:",
          },
          {
            type: "links",
            items: [
              { href: "/rules", label: "Договор об участии и правила студии" },
              { href: "/privacy", label: "Уведомление KVKK" },
              { href: "/terms", label: "Преддоговорная информация и условия услуг" },
              { href: "/cookies", label: "Политика cookies" },
              { href: "/imprint", label: "Выходные данные" },
              { href: "/kayit", label: "Форма записи" },
            ],
          },
        ],
      },
    ],
  },
};
