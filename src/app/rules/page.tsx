import Link from "next/link";
import { getLocale } from "@/i18n/server";
import { COMPANY, RULES_VERSION } from "@/lib/legal";
import { LegalLangSwitcher } from "@/components/legal/LegalLangSwitcher";

export const metadata = {
  title: "Katılım Sözleşmesi ve Stüdyo Kuralları · Participation Agreement | Make Art Studio Alanya",
};

const SEAT = COMPANY.registeredSeat.join(", ");
const ATELIER = COMPANY.atelier.join(", ");

type Section = { id: string; h: string; p: string[] };

const COPY: Record<
  "tr" | "en" | "ru",
  { back: string; title: string; updated: string; intro: string; sections: Section[] }
> = {
  tr: {
    back: "Ana sayfaya dön",
    title: "Katılım Sözleşmesi ve Stüdyo Kuralları",
    updated: "Son güncelleme",
    intro:
      "Bu metin, atölyede imzalanan «Yaratıcı Hizmetlerin Sunulmasına İlişkin Sözleşme»nin güncel içeriğidir. Kayıt olmadan önce okumanız için burada yayımlanır. Bu sayfa ile imzalanan nüsha arasında fark bulunması hâlinde tüketici lehine olan hüküm uygulanır.",
    sections: [
      {
        id: "parties",
        h: "1. Taraflar ve kapsam",
        p: [
          `Sözleşme, ${COMPANY.legalName} (bundan böyle «Stüdyo») ile katılımcının velisi veya yasal temsilcisi (bundan böyle «Müşteri») arasında kurulur. Kayıtlı merkez: ${SEAT}. Atölye: ${ATELIER}. Vergi dairesi / VKN: ${COMPANY.taxOffice} Vergi Dairesi / ${COMPANY.taxNumber}. Telefon: ${COMPANY.phone}. E-posta: ${COMPANY.email}.`,
          "Sözleşme; hizmetin sunulma koşullarını, katılımcı bilgilerini ve gerekli onayları düzenler. Katılımcı reşit bir yetişkin ise Müşteri ve katılımcı aynı kişidir.",
          "Sözleşme Türkiye Cumhuriyeti hukukuna tabidir ve hizmet Alanya'daki atölyede sunulur.",
        ],
      },
      {
        id: "participant",
        h: "2. Katılımcı bilgileri",
        p: [
          "Kayıt sırasında şu bilgiler alınır: çocuğun adı soyadı ve doğum tarihi; velinin adı soyadı, telefonu ve e-postası; acil durumda aranacak kişi; çocuğu ders sonunda kimlerin alabileceği.",
          "Sağlık durumu, alerjiler veya dikkate alınması gereken öneriler yalnızca isteğe bağlı olarak bildirilir. Bu bilgiler 6698 sayılı KVKK m.6 anlamında özel nitelikli kişisel veridir; sadece ayrı ve açık rızanızla ve yalnızca ders güvenliği amacıyla işlenir. Alanı boş bırakmanız kaydı, ders hakkını veya ücreti etkilemez.",
          "Müşteri, verdiği bilgilerin doğru ve güncel olmasından sorumludur ve değişiklikleri gecikmeksizin Stüdyo'ya bildirir.",
        ],
      },
      {
        id: "services",
        h: "3. Hizmetin konusu ve yürütülmesi",
        p: [
          "3.1. Stüdyo; resim, çizim, uygulamalı sanat ve el sanatları dersleri, atölye çalışmaları, kamplar ve benzeri etkinlikleri seçilen programa ve güncel ders çizelgesine uygun olarak düzenler.",
          "3.2. Dersin türü, süresi, ücreti ve ödeme biçimi; güncel fiyat listesi, seçilen abonman, etkinlik programı veya tarafların ayrı mutabakatı ile belirlenir. Ücretler, vergiler dâhil toplam tutar olarak Türk lirası (TL/₺) cinsinden ve sözleşme kurulmadan önce bildirilir.",
          "3.3. Gruptaki veya etkinlikteki yer; kaydın teyit edilmesi ve — seçilen hizmet için öngörülmüşse — ödemenin ya da ön ödemenin yapılması ile ayrılmış sayılır.",
          "3.4. Stüdyo, dersleri yürütmek için gerekli öğretmenleri ve diğer uzmanları görevlendirebilir.",
          "3.5. Stüdyo, ders çizelgesinde değişiklik yapabilir veya öğretmeni değiştirebilir; Müşteri'yi uygun bir yolla önceden bilgilendirir. Değişiklik hizmetin esaslı unsurlarını (gün, saat, seviye veya biçim) Müşteri aleyhine etkiliyorsa Müşteri sözleşmeyi ücretsiz sona erdirebilir ve henüz ifa edilmemiş kısmın bedeli iade edilir.",
        ],
      },
      {
        id: "obligations",
        h: "4. Tarafların hak ve yükümlülükleri",
        p: [
          "4.1. Stüdyo, dersleri güvenli ve destekleyici bir ortamda düzenlemeyi ve programda öngörülen malzemeleri sağlamayı taahhüt eder.",
          "4.2. Müşteri; ücretleri zamanında ödemeyi, katılımcı hakkında doğru bilgi vermeyi, alerji ve sağlık durumlarını bildirmeyi ve bu kuralları gözetmeyi kabul eder.",
          "4.3. Bulaşıcı hastalık belirtisi, ateş, kusma, belirgin öksürük, döküntü veya diğer katılımcılar için risk oluşturabilecek başka bir durum varsa derse katılım iyileşene kadar ertelenmelidir. Bu nedenle kaçırılan dersler, aşağıdaki telafi kuralları kapsamında değerlendirilir.",
          "4.4. Çocuğun sağlığı ders sırasında kötüleşirse Stüdyo personeli veliyle iletişime geçer ve çocuğun güvenliği doğrultusunda hareket eder. Gecikmesinde sakınca bulunan hâllerde 112 acil sağlık hizmetleri aranır.",
          "4.5. Müşteri, çocuğun derse zamanında getirilmesini ve ders bitiminde teslim alınmasını sağlar. Çocuk, yalnızca kayıt formunda belirtilen kişilere teslim edilir.",
        ],
      },
      {
        id: "payment",
        h: "5. Ödeme, abonman süresi, telafi ve iade",
        p: [
          "5.1. Ödeme, kayıt tarihinde seçilen hizmet için geçerli olan tutar ve usulde yapılır. Bu web sitesi üzerinden çevrimiçi ödeme alınmaz.",
          "5.2. 8 derslik abonman, ilk dersin tarihinden itibaren 1 (bir) takvim ayı boyunca geçerlidir.",
          "5.3. Abonman süresi içinde, dersin başlamasına en az 6 (altı) saat kala stüdyo yönetimine bildirmek koşuluyla en fazla 2 (iki) ders ertelenebilir. Ertelenen dersler, abonman süresi içinde yaşa uygun bir grupta boş kontenjanda veya telafi için ayrılan derslerde kullanılır.",
          "5.4. Önceden bildirilmeyen devamsızlıklar ve belirlenen sınırı aşan ertelemeler telafi edilmez. Katılımcının geç gelmesi dersin süresini uzatmaz.",
          "5.5. Abonman süresinin sonunda kullanılmayan dersler kural olarak düşer. Bununla birlikte 6502 sayılı Tüketicinin Korunması Hakkında Kanun'dan doğan haklarınız saklıdır: sözleşmeyi sona erdirmeniz hâlinde, henüz ifa edilmemiş derslere düşen ön ödeme, Stüdyo'nun fiilen yaptığı ve belgelenebilir masrafları mahsup edilerek 14 gün içinde iade edilir. Tüketici ile müzakere edilmeden tek taraflı olarak konulan ve tüketici aleyhine dengesizlik yaratan kayıtlar, Tüketici Sözleşmelerindeki Haksız Şartlar Hakkında Yönetmelik uyarınca tüketiciyi bağlamaz.",
          "5.6. Malzemesi önceden temin edilen ders ve etkinliklerde Stüdyo, iade sırasında fiilen yapılan ve belgelenen masrafları mahsup edebilir.",
          "5.7. Ders Stüdyo'nun kararıyla iptal edilirse Müşteri'ye telafi dersi, eşdeğer bir ders veya iptal edilen hizmetin bedelinin iadesi seçenekleri sunulur; seçim Müşteri'ye aittir.",
        ],
      },
      {
        id: "withdrawal",
        h: "6. Cayma hakkı",
        p: [
          "6.1. Sözleşme internet, telefon veya iş yeri dışında kurulmuşsa tüketici, sözleşmenin kurulduğu tarihten itibaren 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden cayabilir.",
          `6.2. Cayma bildirimi bu süre içinde e-posta gibi kalıcı bir veri saklayıcısıyla ${COMPANY.email} adresine yapılır; yalnızca telefonla yapılan bildirim yeterli değildir.`,
          "6.3. Hizmetin 14 günlük süre dolmadan başlamasını isterseniz bu talebiniz ayrıca alınır. Bu durumda cayma hâlinde, bildirime kadar fiilen ifa edilen hizmetin orantılı bedeli tahsil edilir. Hizmet, açık onayınızla tamamen ifa edilmişse cayma hakkı sona erer.",
          "6.4. İade, cayma bildirimi Stüdyo'ya ulaştıktan sonra en geç 14 gün içinde ve ödemenin yapıldığı yöntemle gerçekleştirilir.",
        ],
      },
      {
        id: "studio-rules",
        h: "7. Stüdyo kuralları",
        p: [
          "7.1. Lütfen dersin başlamasından 5 dakika önce gelin.",
          "7.2. Ders süresince çocuklar öğretmenin gözetimindedir. Veliler atölyede yalnızca Stüdyo ile mutabık kalınarak bulunabilir.",
          "7.3. Katılımcılar mobilya, ekipman, araç ve malzemeleri özenle kullanır.",
          "7.4. Kişisel eşyalar ders sonunda alınmalıdır. Stüdyo, gözetimsiz bırakılan eşyalardan kendi kusuru bulunmadıkça sorumlu değildir.",
          "7.5. Atölyede saygılı, kapsayıcı ve güvenli bir ortamın korunması esastır.",
        ],
      },
      {
        id: "liability",
        h: "8. Sorumluluk ve uyuşmazlıkların çözümü",
        p: [
          "8.1. Taraflar, bu sözleşme ve Türkiye Cumhuriyeti mevzuatı çerçevesinde sorumludur. Stüdyo'nun kastından veya ağır kusurundan doğan sorumluluğu ile can ve beden bütünlüğüne ilişkin sorumluluğu önceden sınırlandırılamaz veya kaldırılamaz (6098 sayılı Türk Borçlar Kanunu m.115).",
          "8.2. Veliler, çocuğun kasıtlı davranışı sonucu stüdyo eşyasında oluşan zarardan sorumludur. Zararın miktarı ve giderilme biçimi, hasarın niteliği ve yürürlükteki mevzuat dikkate alınarak taraflarca birlikte belirlenir.",
          "8.3. Stüdyo, katılımcının sağlık durumu veya alerjileri hakkında Müşteri tarafından bildirilmeyen bilgilerden kaynaklanan sonuçlardan sorumlu tutulamaz.",
          "8.4. Taraflar uyuşmazlıkları öncelikle görüşerek çözmeye çalışır. Tüketici, parasal sınırlara göre yerleşim yerindeki Tüketici Hakem Heyeti'ne veya Tüketici Mahkemesi'ne başvurma hakkını her hâlde saklı tutar.",
        ],
      },
      {
        id: "data",
        h: "9. Kişisel verilerin işlenmesi",
        p: [
          `9.1. Kayıt, iletişim, yoklama takibi, ödemelerin düzenlenmesi ve güvenlik amaçlarıyla verilen bilgiler, ${COMPANY.legalName} tarafından veri sorumlusu sıfatıyla işlenir.`,
          "9.2. İşleme, kural olarak sözleşmenin kurulması ve ifası (KVKK m.5/2-c) ile hukuki yükümlülükler (m.5/2-ç) kapsamında yürütülür. Sözleşmenin imzalanması bir açık rıza beyanı değildir ve öyle yorumlanamaz. Açık rıza gerektiren hâller — sağlık notları, fotoğraf ve video kullanımı, tanıtım iletişimi — ayrı, isteğe bağlı ve önceden işaretlenmemiş onaylarla alınır; verilmemesi veya geri çekilmesi kaydı, dersleri, ücreti veya hizmeti etkilemez.",
          "9.3. Veriler pazarlama amacıyla üçüncü kişilere satılmaz veya devredilmez. Barındırma, veritabanı, e-posta ve bildirim sağlayıcıları yalnızca veri işleyen sıfatıyla ve amaçla sınırlı olarak devreye girer. Kanunen yetkili kamu kurum ve kuruluşlarına yapılan aktarımlar saklıdır.",
          "9.4. Saklama süreleri, yurt dışına aktarım ve KVKK m.11 kapsamındaki haklarınız (bilgi talebi, düzeltme, silme, itiraz ve zararın giderilmesi) için Aydınlatma Metni'ne bakın.",
        ],
      },
      {
        id: "media",
        h: "10. Fotoğraf ve video",
        p: [
          "10.1. Derslerde, atölye çalışmalarında, sergilerde, kamplarda ve diğer etkinliklerde; yaratıcı anları belgelemek ve Make Art Studio'nun faaliyetlerini tanıtmak amacıyla fotoğraf ve video çekimi yapılabilir.",
          "10.2. Bu kayıtların tanıtım amacıyla kullanılması ayrı ve isteğe bağlı bir açık rızaya bağlıdır; sözleşmenin imzalanmasıyla verilmiş sayılmaz. Web sitesinde yayın ile stüdyonun resmi sosyal medya hesaplarında yayın ayrı ayrı seçilir ve önceden işaretli kutu kullanılmaz.",
          `10.3. Rıza her zaman, gerekçe göstermeden ve ücretsiz olarak ${COMPANY.email} adresine yazılarak geri çekilebilir. Stüdyo, talebi aldıktan sonra 10 iş günü içinde ilgili materyalin kendi web sitesindeki ve sosyal medya hesaplarındaki yayınına son verir ve yeni kullanım yapmaz. Yalnızca geri çekme tarihinden önce fiziksel olarak basılmış ve dağıtılmış materyalin toplanması mümkün olmayabilir; üçüncü kişilerin daha önce kaydettiği veya paylaştığı kopyalar üzerinde tam kontrol garanti edilemez.`,
          "10.4. Materyaller yalnızca Make Art Studio faaliyetleriyle bağlantılı olarak kullanılır; katılımcının onurunu, güvenliğini veya itibarını zedeleyebilecek bilgilerle birlikte yayımlanmaz. Çocuğun makul itirazı ve üstün yararı her hâlde gözetilir.",
        ],
      },
      {
        id: "term",
        h: "11. Süre, değişiklik ve son hükümler",
        p: [
          "11.1. Sözleşme imza tarihinde yürürlüğe girer ve katılımcı, Stüdyo'nun ders ve etkinliklerine devam ettiği sürece geçerlidir. Ödemelere, belgelerin saklanmasına ve veri korumasına ilişkin hükümler, yükümlülükler tamamen yerine getirilene kadar yürürlükte kalır.",
          "11.2. Stüdyo, kuralları ve hizmet ücretlerini güncelleyebilir. Yeni koşullar yalnızca bildirimden sonraki satın alma ve yenilemelere uygulanır; yürürlükteki bir abonmanın koşulları tek taraflı olarak Müşteri aleyhine değiştirilemez.",
          "11.3. Sözleşme iki nüsha hâlinde düzenlenir ve bir nüshası imza anında Müşteri'ye verilir (6502 sayılı Kanun m.4). Talep hâlinde elektronik kopya da gönderilir.",
          "11.4. Müşteri, hizmet koşulları hakkında anlaşılır bilgi aldığını, soru sorma imkânı bulduğunu ve bu koşulları kabul ettiğini beyan eder.",
        ],
      },
    ],
  },

  en: {
    back: "Back to homepage",
    title: "Participation Agreement and Studio Rules",
    updated: "Last updated",
    intro:
      "This is the current content of the “Agreement on the Provision of Creative Services” signed at the studio, published here so you can read it before registering. If this page and the signed copy differ, the provision more favourable to the consumer applies.",
    sections: [
      {
        id: "parties",
        h: "1. Parties and scope",
        p: [
          `The agreement is concluded between ${COMPANY.legalName} (the “Studio”) and the participant's parent or legal guardian (the “Client”). Registered seat: ${SEAT}. Atelier: ${ATELIER}. Tax office / tax no.: ${COMPANY.taxOffice} Tax Office / ${COMPANY.taxNumber}. Phone: ${COMPANY.phone}. Email: ${COMPANY.email}.`,
          "It governs how services are provided, the participant's details and the consents required. Where the participant is an adult, the Client and the participant are the same person.",
          "The agreement is governed by the law of the Republic of Türkiye and the service is provided at the atelier in Alanya.",
        ],
      },
      {
        id: "participant",
        h: "2. Participant details",
        p: [
          "At registration we collect: the child's full name and date of birth; the parent's full name, phone and email; an emergency contact; and who is authorised to collect the child after class.",
          "Health conditions, allergies or recommendations we should take into account are provided on an optional basis only. This is special-category personal data under Article 6 of Law No. 6698 (KVKK); it is processed solely on your separate explicit consent and only to keep your child safe during class. Leaving the field blank does not affect registration, your place in class or the price.",
          "The Client is responsible for the accuracy of the information provided and informs the Studio of any change without delay.",
        ],
      },
      {
        id: "services",
        h: "3. Subject of the service and how it is delivered",
        p: [
          "3.1. The Studio runs creative, fine-art and applied-art classes, workshops, camps and similar events in line with the chosen programme and the current timetable.",
          "3.2. The type of class, its duration, price and payment format follow the current price list, the chosen subscription, the event programme or a separate agreement between the parties. Prices are stated as a total including taxes, in Turkish lira (TL/₺), before the contract is concluded.",
          "3.3. A place in a group or at an event is reserved once the registration is confirmed and — where the chosen service requires it — payment or prepayment has been made.",
          "3.4. The Studio may engage the teachers and other specialists needed to run the classes.",
          "3.5. The Studio may change the timetable or substitute a teacher, notifying the Client in advance by a convenient means. If a change affects an essential element of the service (day, time, level or format) to the Client's disadvantage, the Client may terminate at no cost and the price of the part not yet performed is refunded.",
        ],
      },
      {
        id: "obligations",
        h: "4. Rights and obligations of the parties",
        p: [
          "4.1. The Studio undertakes to run classes in a safe and supportive creative environment and to provide the materials included in the programme.",
          "4.2. The Client undertakes to pay on time, to give accurate information about the participant, to inform the Studio of allergies and other health considerations, and to observe these rules.",
          "4.3. Attendance must be postponed until recovery in the case of signs of infectious illness, fever, vomiting, a marked cough, a rash or any other condition that may put other participants at risk. Classes missed for this reason are handled under the make-up rules below.",
          "4.4. If a child becomes unwell during class, Studio staff contact the parent or guardian and act in the child's best interests and safety. Where any delay would be dangerous, the 112 emergency medical service is called.",
          "4.5. The Client ensures the child arrives on time and is collected at the end of class. The child is released only to the people named on the registration form.",
        ],
      },
      {
        id: "payment",
        h: "5. Payment, subscription validity, make-ups and refunds",
        p: [
          "5.1. Payment is made in the amount and manner applicable to the chosen service on the date of registration. No online payment is taken through this website.",
          "5.2. An 8-lesson subscription is valid for 1 (one) calendar month from the date of the first lesson.",
          "5.3. Within the validity period, up to 2 (two) lessons may be rescheduled, provided the studio administration is notified no later than 6 (six) hours before the lesson starts. Rescheduled lessons are used within the validity period, in an age-appropriate group with free places or in lessons set aside for make-ups.",
          "5.4. Absences without prior notice, and reschedules beyond the stated limit, are not compensated. A participant arriving late does not extend the lesson.",
          "5.5. Lessons left unused when the subscription expires lapse as a rule. Your rights under Consumer Protection Law No. 6502 are nevertheless reserved: if you terminate, the prepayment attributable to lessons not yet delivered is refunded within 14 days, less the Studio's actually incurred and documented costs. A term drafted unilaterally, not individually negotiated, and creating an imbalance to the consumer's detriment does not bind the consumer under the Regulation on Unfair Terms in Consumer Contracts.",
          "5.6. For classes and events where materials are purchased in advance, the Studio may deduct costs actually incurred and evidenced when refunding.",
          "5.7. If the Studio cancels a lesson, the Client is offered a make-up lesson, an equivalent lesson or a refund of the price of the cancelled service; the choice is the Client's.",
        ],
      },
      {
        id: "withdrawal",
        h: "6. Right of withdrawal",
        p: [
          "6.1. Where the contract is concluded online, by telephone or away from business premises, the consumer may withdraw within 14 days of its conclusion without giving a reason and without paying a penalty.",
          `6.2. Notice of withdrawal is given within that period on a durable medium, such as an email to ${COMPANY.email}; notice by telephone alone is not sufficient.`,
          "6.3. If you ask for the service to begin before the 14 days expire, that request is recorded separately. In that case, on withdrawal, a proportionate amount for the service actually performed up to the notice is payable. Once the service has been fully performed with your express prior approval, the right of withdrawal ends.",
          "6.4. Refunds are made within 14 days of the withdrawal notice reaching the Studio, using the payment method originally used.",
        ],
      },
      {
        id: "studio-rules",
        h: "7. Studio rules",
        p: [
          "7.1. Please arrive 5 minutes before the lesson starts.",
          "7.2. During the lesson children are supervised by the teacher. Parents may remain in the room only by agreement with the Studio.",
          "7.3. Participants treat the furniture, equipment, tools and materials with care.",
          "7.4. Personal belongings should be taken after class. The Studio is not liable for items left unattended, unless the loss is due to its own fault.",
          "7.5. A respectful, inclusive and safe atmosphere in the atelier is essential.",
        ],
      },
      {
        id: "liability",
        h: "8. Liability and resolution of disputes",
        p: [
          "8.1. The parties are liable within the limits set by this agreement and the law of the Republic of Türkiye. Liability arising from the Studio's intent or gross fault, and liability relating to life and bodily integrity, cannot be limited or excluded in advance (Article 115 of the Turkish Code of Obligations No. 6098).",
          "8.2. Parents and guardians are responsible for damage caused to studio property by a child's deliberate acts. The amount and manner of compensation are agreed between the parties, taking into account the nature of the damage and the applicable law.",
          "8.3. The Studio is not responsible for consequences arising from material information about the participant's health or allergies that the Client did not disclose.",
          "8.4. The parties seek to resolve disagreements through discussion first. The consumer retains, in all cases, the right to apply to the Consumer Arbitration Committee or the Consumer Court with jurisdiction, according to the applicable monetary thresholds.",
        ],
      },
      {
        id: "data",
        h: "9. Processing of personal data",
        p: [
          `9.1. Information provided for registration, contact, attendance records, organising payment and safety is processed by ${COMPANY.legalName} as data controller.`,
          "9.2. Processing is carried out, as a rule, for the conclusion and performance of this contract (KVKK Art. 5/2(c)) and for legal obligations (Art. 5/2(ç)). Signing the contract is not, and may not be construed as, a declaration of explicit consent. Where explicit consent is required — health notes, use of photographs and video, promotional communication — it is taken separately, optionally and with no pre-ticked boxes; refusing or withdrawing it does not affect registration, classes, price or service.",
          "9.3. Data is not sold or passed to third parties for marketing. Hosting, database, email and notification providers act only as data processors and only for the stated purposes. Disclosures to public authorities that are legally competent to require them are reserved.",
          "9.4. See the Privacy Notice for retention periods, overseas transfers and your rights under KVKK Art. 11 (information, rectification, erasure, objection and compensation).",
        ],
      },
      {
        id: "media",
        h: "10. Photography and video",
        p: [
          "10.1. Photographs and video may be taken during classes, workshops, exhibitions, camps and other events to record creative moments and to present the activities of Make Art Studio.",
          "10.2. Using those recordings for promotion depends on a separate, optional explicit consent; it is not given by signing the agreement. Publication on the website and publication on the studio's official social-media accounts are chosen separately, with no pre-ticked box.",
          `10.3. Consent may be withdrawn at any time, without giving a reason and at no cost, by writing to ${COMPANY.email}. Within 10 working days of receiving the request the Studio stops publishing the material on its own website and social-media accounts and makes no new use of it. Only physical print material produced and distributed before the withdrawal may be impossible to recall; full control cannot be guaranteed over copies previously saved or shared by third parties.`,
          "10.4. Material is used only in connection with Make Art Studio's activities and is never published alongside information capable of harming a participant's dignity, safety or reputation. A child's reasonable objection and best interests are respected in all cases.",
        ],
      },
      {
        id: "term",
        h: "11. Term, changes and final provisions",
        p: [
          "11.1. The agreement takes effect on the date of signature and applies while the participant attends the Studio's classes and events. Provisions on payments, retention of documents and data protection remain in force until all obligations have been fully performed.",
          "11.2. The Studio may update its rules and prices. New terms apply only to purchases and renewals made after notice; the terms of a subscription already running cannot be changed unilaterally to the Client's disadvantage.",
          "11.3. The agreement is drawn up in two copies and one is handed to the Client at the moment of signature (Article 4 of Law No. 6502). An electronic copy is also sent on request.",
          "11.4. The Client confirms that they received clear information about the terms of service, had the opportunity to ask questions, and accept these terms.",
        ],
      },
    ],
  },

  ru: {
    back: "На главную",
    title: "Договор об участии и правила студии",
    updated: "Обновлено",
    intro:
      "Здесь опубликовано действующее содержание «Договора об оказании творческих услуг», который подписывается в студии, — чтобы вы могли прочитать его до записи. Если текст на этой странице расходится с подписанным экземпляром, применяется положение, более выгодное для потребителя.",
    sections: [
      {
        id: "parties",
        h: "1. Стороны и предмет",
        p: [
          `Договор заключается между ${COMPANY.legalName} (далее — «Студия») и родителем либо законным представителем участника занятий (далее — «Клиент»). Юридический адрес: ${SEAT}. Студия: ${ATELIER}. Налоговый орган / VKN: ${COMPANY.taxOffice} Vergi Dairesi / ${COMPANY.taxNumber}. Телефон: ${COMPANY.phone}. Электронная почта: ${COMPANY.email}.`,
          "Документ определяет условия оказания услуг, содержит сведения об участнике и необходимые согласия. Если участник — совершеннолетний, Клиент и участник совпадают.",
          "Договор регулируется правом Турецкой Республики; услуги оказываются в студии в Аланье.",
        ],
      },
      {
        id: "participant",
        h: "2. Сведения об участнике",
        p: [
          "При записи предоставляются: ФИО и дата рождения ребёнка; ФИО, телефон и e-mail родителя; контакт для экстренной связи; кто может забирать ребёнка после занятия.",
          "Особенности здоровья, аллергии или рекомендации сообщаются исключительно по желанию. Это специальная категория персональных данных по ст. 6 Закона № 6698 (KVKK): они обрабатываются только на основании вашего отдельного явного согласия и исключительно для безопасности ребёнка на занятии. Незаполненное поле не влияет на запись, место в группе и стоимость.",
          "Клиент отвечает за достоверность и актуальность предоставленных сведений и без промедления сообщает Студии об изменениях.",
        ],
      },
      {
        id: "services",
        h: "3. Предмет договора и порядок оказания услуг",
        p: [
          "3.1. Студия проводит творческие, художественные и прикладные занятия, мастер-классы, лагеря и иные мероприятия в соответствии с выбранной программой и действующим расписанием.",
          "3.2. Вид занятий, продолжительность, стоимость и формат оплаты определяются действующим прайс-листом, выбранным абонементом, программой мероприятия либо отдельной договорённостью сторон. Стоимость сообщается до заключения договора как итоговая сумма с учётом налогов в турецких лирах (TL/₺).",
          "3.3. Место в группе или на мероприятии считается забронированным после подтверждения записи и внесения оплаты или предоплаты, если она предусмотрена условиями выбранной услуги.",
          "3.4. Студия вправе привлекать преподавателей и иных специалистов, необходимых для проведения занятий.",
          "3.5. Студия вправе вносить изменения в расписание или заменять преподавателя, предварительно уведомив Клиента удобным способом. Если изменение затрагивает существенные условия услуги (день, время, уровень или формат) не в пользу Клиента, Клиент вправе расторгнуть договор без каких-либо расходов, а стоимость неоказанной части возвращается.",
        ],
      },
      {
        id: "obligations",
        h: "4. Права и обязанности сторон",
        p: [
          "4.1. Студия обязуется организовать занятия в безопасной и доброжелательной творческой среде и предоставить материалы в объёме, предусмотренном программой.",
          "4.2. Клиент обязуется своевременно оплачивать услуги, сообщать достоверные сведения об участнике, информировать Студию об аллергиях и иных особенностях здоровья, а также соблюдать настоящие правила.",
          "4.3. При признаках инфекционного заболевания, повышенной температуре, рвоте, выраженном кашле, сыпи или ином состоянии, которое может представлять риск для других участников, посещение занятия необходимо отложить до улучшения состояния. Пропуски по этой причине рассматриваются по правилам переноса, приведённым ниже.",
          "4.4. В случае ухудшения самочувствия ребёнка сотрудники Студии связываются с родителем (законным представителем) и действуют исходя из интересов и безопасности ребёнка. При угрозе, не терпящей отлагательства, вызывается экстренная медицинская служба 112.",
          "4.5. Клиент обеспечивает своевременное прибытие ребёнка и получение его после завершения занятия. Ребёнок передаётся только лицам, указанным в анкете.",
        ],
      },
      {
        id: "payment",
        h: "5. Оплата, срок абонемента, перенос и возврат",
        p: [
          "5.1. Оплата производится в размере и порядке, действующих для выбранной услуги на дату записи. Онлайн-оплата на этом сайте не принимается.",
          "5.2. Абонемент на 8 занятий действует в течение 1 (одного) календарного месяца с даты первого занятия.",
          "5.3. В течение срока действия абонемента допускается перенос не более 2 (двух) занятий при условии уведомления администрации студии не позднее чем за 6 (шесть) часов до начала занятия. Перенесённые занятия используются в течение срока действия абонемента на свободных местах в подходящей по возрасту группе либо на специально выделенных занятиях для отработки.",
          "5.4. Пропуски без предварительного уведомления, а также переносы сверх установленного лимита не компенсируются. Опоздание участника не увеличивает продолжительность занятия.",
          "5.5. По истечении срока действия абонемента неиспользованные занятия по общему правилу аннулируются. При этом сохраняются ваши права по Закону № 6502 о защите потребителей: при расторжении договора предоплата, приходящаяся на неоказанные занятия, возвращается в течение 14 дней за вычетом фактически понесённых и документально подтверждённых расходов Студии. Условие, включённое в договор в одностороннем порядке без индивидуального согласования и создающее дисбаланс в ущерб потребителю, не связывает потребителя в силу Положения о несправедливых условиях в потребительских договорах.",
          "5.6. Для занятий и мероприятий с предварительной закупкой материалов Студия вправе удержать при возврате фактически понесённые и подтверждённые расходы.",
          "5.7. При отмене занятия по инициативе Студии Клиенту предлагается перенос, равноценное занятие либо возврат стоимости отменённой услуги; выбор остаётся за Клиентом.",
        ],
      },
      {
        id: "withdrawal",
        h: "6. Право на отказ от договора",
        p: [
          "6.1. Если договор заключён через интернет, по телефону или вне помещения студии, потребитель вправе отказаться от него в течение 14 дней с даты заключения без объяснения причин и без уплаты неустойки.",
          `6.2. Уведомление об отказе направляется в этот срок на долговечном носителе, например письмом на ${COMPANY.email}; сообщения только по телефону недостаточно.`,
          "6.3. Если вы просите начать оказание услуги до истечения 14 дней, эта просьба фиксируется отдельно. В таком случае при отказе оплачивается соразмерная стоимость фактически оказанной до уведомления услуги. После полного оказания услуги с вашего предварительного явного согласия право на отказ прекращается.",
          "6.4. Возврат производится в течение 14 дней с даты получения Студией уведомления об отказе тем же способом, которым была произведена оплата.",
        ],
      },
      {
        id: "studio-rules",
        h: "7. Правила посещения",
        p: [
          "7.1. Просим приходить за 5 минут до начала занятия.",
          "7.2. Во время занятия дети находятся под руководством преподавателя. Родители могут находиться в помещении только по согласованию со Студией.",
          "7.3. Участники бережно относятся к мебели, оборудованию, инструментам и материалам.",
          "7.4. Личные вещи необходимо забирать после занятия. Студия не несёт ответственности за вещи, оставленные без присмотра, если только утрата не вызвана её собственной виной.",
          "7.5. В студии поддерживается уважительная, доброжелательная и безопасная атмосфера.",
        ],
      },
      {
        id: "liability",
        h: "8. Ответственность и урегулирование разногласий",
        p: [
          "8.1. Стороны несут ответственность в пределах, установленных настоящим договором и законодательством Турецкой Республики. Ответственность Студии за умысел или грубую неосторожность, а также ответственность, связанная с жизнью и здоровьем, не может быть заранее ограничена или исключена (ст. 115 Обязательственного кодекса Турции № 6098).",
          "8.2. Родители (законные представители) несут ответственность за ущерб, причинённый ребёнком имуществу студии вследствие умышленных действий. Размер и порядок возмещения определяются по соглашению сторон с учётом характера повреждений и действующего законодательства.",
          "8.3. Студия не отвечает за последствия, связанные с непредоставлением Клиентом существенной информации о здоровье, аллергиях или иных особенностях участника.",
          "8.4. Стороны стремятся урегулировать разногласия путём переговоров. Потребитель в любом случае сохраняет право обратиться в Комиссию по потребительским спорам (Tüketici Hakem Heyeti) или в Потребительский суд по месту жительства в пределах установленных денежных порогов.",
        ],
      },
      {
        id: "data",
        h: "9. Обработка персональных данных",
        p: [
          `9.1. Сведения, предоставленные для записи, связи, учёта посещений, организации оплаты и обеспечения безопасности, обрабатываются ${COMPANY.legalName} в качестве оператора данных.`,
          "9.2. Обработка осуществляется, как правило, для заключения и исполнения договора (ст. 5/2(c) KVKK) и для исполнения обязанностей по закону (ст. 5/2(ç)). Подписание договора не является и не может толковаться как явное согласие. Там, где требуется явное согласие — сведения о здоровье, использование фото и видео, рекламные сообщения, — оно берётся отдельно, добровольно и без заранее отмеченных полей; отказ или отзыв не влияют на запись, занятия, стоимость и услуги.",
          "9.3. Данные не продаются и не передаются третьим лицам в маркетинговых целях. Поставщики хостинга, базы данных, электронной почты и уведомлений выступают только как обработчики и только в заявленных целях. Передача государственным органам, законно уполномоченным её требовать, сохраняется.",
          "9.4. Сроки хранения, передача за рубеж и ваши права по ст. 11 KVKK (получение информации, исправление, удаление, возражение и возмещение) описаны в Уведомлении о конфиденциальности.",
        ],
      },
      {
        id: "media",
        h: "10. Фото- и видеосъёмка",
        p: [
          "10.1. Во время занятий, мастер-классов, выставок, лагерей и других мероприятий могут проводиться фото- и видеосъёмка для сохранения творческих моментов и информирования о деятельности Make Art Studio.",
          "10.2. Использование этих материалов в информационных и рекламных целях зависит от отдельного добровольного явного согласия и не считается данным в силу подписания договора. Публикация на сайте и публикация в официальных аккаунтах студии в социальных сетях выбираются отдельно, без заранее отмеченных полей.",
          `10.3. Согласие можно отозвать в любое время, без объяснения причин и бесплатно, направив сообщение на ${COMPANY.email}. В течение 10 рабочих дней с момента получения обращения Студия прекращает публикацию соответствующих материалов на своём сайте и в своих аккаунтах в социальных сетях и не использует их заново. Только физически напечатанная и распространённая до отзыва продукция может быть невозвратимой; полный контроль над копиями, ранее сохранёнными или распространёнными третьими лицами, гарантировать невозможно.`,
          "10.4. Материалы используются исключительно в связи с деятельностью Make Art Studio и не сопровождаются сведениями, способными нанести вред достоинству, безопасности или репутации участника. Обоснованное возражение ребёнка и его наилучшие интересы учитываются в любом случае.",
        ],
      },
      {
        id: "term",
        h: "11. Срок действия, изменения и заключительные положения",
        p: [
          "11.1. Договор вступает в силу с даты подписания и действует в период посещения участником занятий и мероприятий Студии. Положения о расчётах, хранении документов и защите данных сохраняют силу до полного исполнения обязательств сторон.",
          "11.2. Студия вправе обновлять правила и стоимость услуг. Новые условия применяются только к покупкам и продлениям после уведомления; условия уже действующего абонемента не могут быть изменены в одностороннем порядке в ущерб Клиенту.",
          "11.3. Договор составляется в двух экземплярах, один из которых передаётся Клиенту в момент подписания (ст. 4 Закона № 6502). По запросу также направляется электронная копия.",
          "11.4. Клиент подтверждает, что получил понятную информацию об условиях услуг, имел возможность задать вопросы и принимает настоящие условия.",
        ],
      },
    ],
  },
};

export default async function RulesPage() {
  const locale = await getLocale();
  const t = COPY[locale] ?? COPY.tr;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6">
      <article className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex text-sm text-[var(--pink-dark)] hover:underline">
            ← {t.back}
          </Link>
          <LegalLangSwitcher current={locale} />
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-9">
          <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {t.updated}: {COMPANY.lastUpdated} · {RULES_VERSION}
          </p>
          <p className="mt-6 rounded-2xl bg-[var(--pink-light)]/55 p-4 text-sm leading-relaxed">{t.intro}</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--muted)]">
            {t.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">{section.h}</h2>
                <div className="space-y-3">
                  {section.p.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 border-t border-[var(--border)] pt-5 text-sm">
            <Link href="/handbook" className="text-[var(--pink-dark)] underline">Handbook</Link>
            <Link href="/privacy" className="text-[var(--pink-dark)] underline">KVKK</Link>
            <Link href="/terms" className="text-[var(--pink-dark)] underline">Terms</Link>
            <Link href="/cookies" className="text-[var(--pink-dark)] underline">Cookies</Link>
            <Link href="/imprint" className="text-[var(--pink-dark)] underline">Imprint</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
