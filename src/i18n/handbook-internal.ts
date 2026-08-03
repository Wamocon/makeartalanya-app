/**
 * Internal operations manual served at /admin/handbook — behind the admin gate,
 * never linked publicly.
 *
 * Scope: what studio staff and whoever maintains this site need in order to run
 * registrations, messaging, consents and refunds without breaching the rules the
 * public documents promise. It restates the operational half of /rules plus the
 * handling duties that only staff see (health notes, Telegram limits, data
 * subject requests, the open compliance items).
 *
 * It is not legal advice. The "open items" section tracks what still needs a
 * Turkish lawyer or the company's own paperwork; keep it current rather than
 * letting it rot.
 */

import { COMPANY } from "@/lib/legal";
import type { HandbookDoc } from "./handbook-types";

const SEAT = COMPANY.registeredSeat.join(", ");
const ATELIER = COMPANY.atelier.join(", ");

export const internalHandbook: Record<"en" | "tr" | "ru", HandbookDoc> = {
  en: {
    back: "Back to dashboard",
    title: "Internal Operations Manual",
    subtitle: "For studio staff and site maintainers. Not for clients.",
    updated: "Last updated",
    contents: "Contents",
    printLabel: "Print / save as PDF",
    intro:
      "This manual covers how we run registrations, messaging, consents, attendance and refunds. The public family handbook is the client-facing version; the participation agreement at /rules is the binding text. Where this manual and /rules appear to disagree, /rules wins and the manual needs fixing.",
    sections: [
      {
        id: "scope",
        nav: "Scope",
        h: "1. What this manual is",
        blocks: [
          {
            type: "list",
            items: [
              "Audience: studio staff, instructors handling registrations, and whoever maintains this application.",
              "It is an operating guide, not legal advice. Anything marked as an open item needs a Turkish lawyer or a company document before it is settled.",
              "Client-facing wording belongs in the family handbook at /handbook. Do not paste sections of this manual to clients.",
              "When an operational rule changes, change it in /rules first, then in /handbook and here, in the same commit.",
            ],
          },
        ],
      },
      {
        id: "identity",
        nav: "Company identity",
        h: "2. Company identity",
        blocks: [
          {
            type: "p",
            text: "Use exactly these details on contracts, invoices and any written quote. Law No. 6563 on E-Commerce requires the service provider to be identifiable before a contract is concluded.",
          },
          {
            type: "table",
            head: ["Field", "Value"],
            rows: [
              ["Legal name", COMPANY.legalName],
              ["Registered seat", SEAT],
              ["Atelier", ATELIER],
              ["Tax office / tax no.", `${COMPANY.taxOffice} / ${COMPANY.taxNumber}`],
              ["Phone", COMPANY.phone],
              ["Email", COMPANY.email],
              ["MERSİS no.", COMPANY.mersisNo ?? "— not yet supplied (open item)"],
              ["Trade registry no.", COMPANY.tradeRegistryNo ?? "— not yet supplied (open item)"],
              ["Managing director", COMPANY.managingDirector ?? "— not yet supplied (open item)"],
            ],
          },
          {
            type: "note",
            text: "MERSİS number, trade registry number and managing director are read from environment variables and are hidden on the public imprint while empty. Until they are supplied, the imprint is incomplete against Art. 3 of Law No. 6563.",
          },
        ],
      },
      {
        id: "offer",
        nav: "The offer",
        h: "3. The offer and how we quote it",
        blocks: [
          {
            type: "list",
            items: [
              "Formats: painting and drawing (acrylic, oil, pencil, pastel, watercolour), applied art and crafts, chess, and individual lessons.",
              "Groups: formed by age and level, up to 8 participants. Languages: Turkish, English, Russian.",
              "Packages: 1, 2, 4, 8, 12 and 16 lessons. The 8-lesson package is the standard offer.",
              "All lesson materials are provided by the studio. Never tell a client to buy materials in advance.",
            ],
          },
          {
            type: "p",
            text: "Quote prices only as a total amount including taxes, in Turkish lira (₺), and always before the contract is concluded. Never quote a net figure and add tax afterwards.",
          },
          {
            type: "note",
            text: "No online payment runs through the website. Payment is arranged with the studio directly — do not promise a payment link.",
          },
        ],
      },
      {
        id: "pipeline",
        nav: "Registration intake",
        h: "4. Registration intake",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Request arrives",
                text: "The client submits the form at /kayit. It is a non-binding request — it creates no payment obligation, and we must not treat it as a concluded contract.",
              },
              {
                title: "New",
                text: "The request appears under Registrations in this dashboard with status New. Someone has to pick it up; it is not a queue that clears itself.",
              },
              {
                title: "Contacted",
                text: "Reply on the WhatsApp number given in the form. Agree the day, time, group and package. Set the status to Contacted so nobody messages the same family twice.",
              },
              {
                title: "Enrolled",
                text: "Once the place is confirmed and — where the chosen service requires it — payment or a deposit is made, set Enrolled. The place counts as reserved from this point.",
              },
              {
                title: "Archived",
                text: "Use Archived for requests that came to nothing. Do not delete a record just to tidy the list; retention is a legal question, not a housekeeping one.",
              },
            ],
          },
          {
            type: "note",
            text: "The client is told the studio will reply on WhatsApp shortly. Treat that as the promise it is and reply the same working day where possible.",
          },
        ],
      },
      {
        id: "channels",
        nav: "WhatsApp and Telegram",
        h: "5. WhatsApp and Telegram",
        blocks: [
          {
            type: "list",
            items: [
              "WhatsApp is the normal channel for arranging days, times and packages. Use the number the client gave on the form, not a number found elsewhere.",
              "Telegram updates are opt-in. If the client did not opt in, nothing goes to Telegram.",
              "Never send the child's name or any health or allergy information over Telegram. The notification code already excludes them — do not work around it by typing them manually.",
              "Telegram and WhatsApp are providers outside Türkiye. Keep messages to what is needed for the arrangement; they are not a place for records.",
              "Never put health information in a group message on any channel.",
            ],
          },
        ],
      },
      {
        id: "consents",
        nav: "Consents",
        h: "6. Consent handling",
        blocks: [
          {
            type: "p",
            text: "Registration data is processed on the basis of concluding and performing the contract (Art. 5(2)(c) KVKK) and legal obligations (Art. 5(2)(ç)) — not consent. A signature on the contract is not a consent declaration and must never be presented as one.",
          },
          {
            type: "table",
            head: ["Item", "Type", "Rule"],
            rows: [
              ["KVKK privacy notice read", "Required acknowledgement", "Cannot be waived; not a consent."],
              [
                "Non-binding request understood",
                "Required acknowledgement",
                "Pre-contract information duty under Law No. 6502.",
              ],
              [
                "Health / allergy notes",
                "Explicit consent, optional",
                "Separate tick. Special category data under Art. 6 KVKK.",
              ],
              [
                "Photo / video on website",
                "Explicit consent, optional",
                "Separate tick, never pre-ticked, independent of social media.",
              ],
              [
                "Photo / video on social media",
                "Explicit consent, optional",
                "Separate tick, never pre-ticked, independent of the website.",
              ],
            ],
          },
          {
            type: "list",
            items: [
              "Never pre-tick an optional consent, on paper or on screen.",
              "Refusal or withdrawal of any optional consent must not change the registration, the place, the schedule or the price. If a colleague implies otherwise to a client, correct it.",
              `Withdrawals arrive by email to ${COMPANY.email}. Act within 10 business days: stop publishing the material on the website and on the studio's social-media accounts, and make no further use of it.`,
              "Record what was withdrawn and when. A withdrawal you cannot evidence is a withdrawal you did not honour.",
            ],
          },
        ],
      },
      {
        id: "health",
        nav: "Health notes",
        h: "7. Health and allergy notes",
        blocks: [
          {
            type: "list",
            items: [
              "The field is optional. If a parent leaves it blank, that is the end of it — do not chase them for it and do not treat it as an incomplete registration.",
              "Health data may only be processed with the separate explicit consent, and only for the child's safety during lessons.",
              "Share it only with the instructor who actually teaches that child. It is not general staff information.",
              "Keep it out of Telegram, out of group messages and out of anything published.",
              "The online form refuses to submit health notes without the separate consent. Do not enter health information into another field to get around that.",
            ],
          },
        ],
      },
      {
        id: "attendance",
        nav: "Attendance and catch-up",
        h: "8. Attendance, rescheduling and catch-up",
        blocks: [
          {
            type: "list",
            items: [
              "The 8-lesson subscription runs for one calendar month from the date of the first lesson.",
              "Up to 2 lessons per subscription may be moved, if the client notifies the studio at least 6 hours before the lesson starts. Log the notification time — the 6 hours is the whole test.",
              "Moved lessons are used inside the same subscription period, in an age-appropriate group with a free place or in a lesson kept for catch-up.",
              "Absences not announced in advance, and reschedules beyond 2, are not made up. Late arrival does not extend the lesson.",
              "Illness with signs of infection: the child stays home, and the missed lesson is handled under the rescheduling rules — do not treat it as a plain no-show.",
            ],
          },
        ],
      },
      {
        id: "cancellation",
        nav: "Studio cancellations",
        h: "9. When the studio cancels",
        blocks: [
          {
            type: "list",
            items: [
              "Offer all three options and let the client choose: a catch-up lesson, an equivalent lesson, or a refund of that lesson's price. The choice is theirs, not ours.",
              "Schedule or instructor changes are notified in advance by a suitable channel.",
              "If a change affects an essential element — day, time, level or format — to the client's disadvantage, they may end the contract free of charge and the unperformed part is refunded.",
              "The terms of a subscription already running cannot be changed unilaterally to the client's disadvantage. New terms apply only to purchases and renewals after notice.",
            ],
          },
        ],
      },
      {
        id: "withdrawal",
        nav: "Withdrawal and refunds",
        h: "10. Withdrawal and refund workflow",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Check how the contract was concluded",
                text: "Distance (website, phone, messenger) or off-premises means a 14-day right of withdrawal from the date of conclusion, with no reason and no penalty.",
              },
              {
                title: "Accept it on a durable medium",
                text: `Written notice to ${COMPANY.email} within the 14 days. A phone call alone is not enough — but if a client calls, tell them how to put it in writing rather than letting the deadline pass.`,
              },
              {
                title: "Check for an early-start request",
                text: "If the client asked for lessons to start before the 14 days elapsed, that request is recorded separately. On withdrawal, charge the proportional value of lessons actually held.",
              },
              {
                title: "Refund within 14 days",
                text: "Pay back within 14 days of the notice reaching us, using the same payment method. For a contract ended mid-subscription, refund the prepayment for lessons not yet held, less actual and documented costs.",
              },
              {
                title: "Document the deduction",
                text: "Any deduction has to be an actual, documented cost. An undocumented deduction is not defensible before a consumer arbitration committee.",
              },
            ],
          },
          {
            type: "note",
            text: "Rights under Consumer Protection Law No. 6502 cannot be signed away. Never tell a client that prepaid lessons are simply forfeited.",
          },
        ],
      },
      {
        id: "emergency",
        nav: "Emergencies and pickup",
        h: "11. Emergencies and pickup",
        blocks: [
          {
            type: "list",
            items: [
              "Children are supervised by the instructor for the whole lesson.",
              "A child is released only to the people named on that child's registration form. No exceptions on a verbal request from someone at the door — call the parent.",
              "If a child becomes unwell, contact the parent and act in the child's interest. Where there is immediate danger, call 112 first.",
              "Use the emergency contact on the form when the parent cannot be reached.",
              "Write up what happened the same day, including times and who was informed.",
            ],
          },
        ],
      },
      {
        id: "data",
        nav: "Data protection duties",
        h: "12. Data protection duties",
        blocks: [
          {
            type: "list",
            items: [
              `${COMPANY.legalName} is the data controller. Registration, contact, attendance, payments and safety are the purposes — nothing collected for those may be reused for something else without checking first.`,
              "Client data is never sold or transferred to third parties for marketing.",
              "Hosting, database, email and notification providers act as processors only, limited to that purpose.",
              `Data subject requests under Art. 11 KVKK arrive at ${COMPANY.email}: what is held, correction, deletion, objection, compensation. Under Art. 13 KVKK a response is due within 30 days at the latest — start it the day it arrives, do not sit on it.`,
              "Do not export client lists to personal devices, personal email or private spreadsheets.",
              "Several providers we use are outside Türkiye. Cross-border transfers need the Authority's standard contractual clauses, notified through the Data Transfer Module within 5 business days of signature — see the open items.",
            ],
          },
          {
            type: "note",
            text: "VERBİS: the studio is below both registration thresholds (50 employees / 100m TRY balance sheet), so the exemption should apply. It falls away if the main activity involves special-category data — confirm with the lawyer and re-check yearly.",
          },
        ],
      },
      {
        id: "docs",
        nav: "Documents and versions",
        h: "13. Documents and version discipline",
        blocks: [
          {
            type: "p",
            text: "The published legal texts and their version markers live in src/lib/legal.ts. Every published document carries a version so we can prove what a client actually agreed to.",
          },
          {
            type: "list",
            items: [
              "/rules — Participation agreement and studio rules. The binding operational text.",
              "/privacy — KVKK privacy notice. Print a copy as an annex to the paper contract and have receipt acknowledged.",
              "/terms — Pre-contract information and service terms.",
              "/cookies — Cookie policy. /imprint — Imprint.",
              "/handbook — the client-facing family handbook.",
            ],
          },
          {
            type: "note",
            text: "When you change a legal text, bump its version constant and COMPANY.lastUpdated in the same commit. An edited document with a stale version number is worse than no version number.",
          },
        ],
      },
      {
        id: "open",
        nav: "Open items",
        h: "14. Open compliance items",
        blocks: [
          {
            type: "table",
            head: ["Item", "Owner"],
            rows: [
              [
                "Confirm the binding legal name against the Trade Registry Gazette — the paper contract says 'Ticaret', the site says 'Turizm ve Ticaret'. Only one can be right.",
                "Team",
              ],
              ["Obtain MERSİS number and trade registry number, then set the environment variables", "Team"],
              ["Name the managing director and add it to the contract signature block", "Team"],
              [
                "Decide whether ETBİS registration applies: the site takes non-binding requests with no online payment, which is a grey zone",
                "Lawyer",
              ],
              [
                "Put the standard contractual clauses in place for providers outside Türkiye and notify the Authority within 5 business days of signature",
                "Lawyer + Team",
              ],
              [
                "Bring the paper contract in line with the published /rules text (withdrawal right, refunds, separate consents, two copies)",
                "Lawyer",
              ],
              [
                "Produce the separate consent annex for the paper form: health data, photo on website, photo on social media, marketing — each ticked individually, none pre-filled",
                "Lawyer + Team",
              ],
              ["Fix the process for handing the client their copy of the contract at signature", "Studio management"],
              [
                "Correct the landing-page package copy: it advertises 'no expiry' while /rules gives the 8-lesson subscription one calendar month",
                "Team",
              ],
              [
                "Review the package prices shown in euros (€45/€42/€40 per lesson) on the landing page: /rules §3.2 and the Price Tag Regulation require the total including taxes in Turkish lira. A 'reference price, TRY confirmed before contract' footnote may not be enough",
                "Lawyer + Team",
              ],
            ],
          },
        ],
      },
      {
        id: "dashboard",
        nav: "Dashboard map",
        h: "15. Dashboard map",
        blocks: [
          {
            type: "list",
            items: [
              "Overview — Dashboard, Today: what is happening now.",
              "Classes — Schedule, Sessions, Attendance: the teaching week and who turned up.",
              "Clients — Registrations, Clients, Subscriptions, Payments: the intake pipeline and money.",
              "System — Messages, Notifications, Content, Media, Settings: site content and communications.",
              "Language: the switcher at the bottom of the sidebar changes the dashboard language, not the public site language.",
            ],
          },
        ],
      },
    ],
  },

  tr: {
    back: "Panele dön",
    title: "İç İşleyiş El Kitabı",
    subtitle: "Stüdyo ekibi ve siteyi yönetenler için. Müşterilere gönderilmez.",
    updated: "Son güncelleme",
    contents: "İçindekiler",
    printLabel: "Yazdır / PDF olarak kaydet",
    intro:
      "Bu el kitabı kayıt, iletişim, onaylar, yoklama ve iade süreçlerinin nasıl yürütüldüğünü anlatır. Müşteriye verilecek metin /handbook adresindeki Aile El Kitabı'dır; bağlayıcı metin ise /rules adresindeki Katılım Sözleşmesi'dir. Bu el kitabı ile /rules çelişiyorsa /rules geçerlidir ve düzeltilmesi gereken bu metindir.",
    sections: [
      {
        id: "scope",
        nav: "Kapsam",
        h: "1. Bu el kitabı nedir",
        blocks: [
          {
            type: "list",
            items: [
              "Kimler için: stüdyo ekibi, kayıtlarla ilgilenen eğitmenler ve bu uygulamayı yönetenler.",
              "Bu bir işleyiş kılavuzudur, hukuki görüş değildir. «Açık madde» olarak işaretlenen her konu, sonuçlanmadan önce türk hukuk danışmanlığına veya bir şirket belgesine ihtiyaç duyar.",
              "Müşteriye söylenecek ifadeler /handbook adresindeki Aile El Kitabı'nda yer alır. Bu metnin bölümlerini müşteriye kopyalayıp göndermeyin.",
              "Bir işleyiş kuralı değiştiğinde önce /rules, sonra /handbook, sonra bu metin — aynı commit içinde güncellenir.",
            ],
          },
        ],
      },
      {
        id: "identity",
        nav: "Şirket bilgileri",
        h: "2. Şirket bilgileri",
        blocks: [
          {
            type: "p",
            text: "Sözleşmelerde, faturalarda ve yazılı her teklifte tam olarak bu bilgileri kullanın. 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun, hizmet sağlayıcının sözleşme kurulmadan önce açıkça belirlenebilir olmasını gerektirir.",
          },
          {
            type: "table",
            head: ["Alan", "Değer"],
            rows: [
              ["Ticaret ünvanı", COMPANY.legalName],
              ["Kayıtlı merkez", SEAT],
              ["Atölye", ATELIER],
              ["Vergi dairesi / VKN", `${COMPANY.taxOffice} / ${COMPANY.taxNumber}`],
              ["Telefon", COMPANY.phone],
              ["E-posta", COMPANY.email],
              ["MERSİS no", COMPANY.mersisNo ?? "— henüz verilmedi (açık madde)"],
              ["Ticaret sicil no", COMPANY.tradeRegistryNo ?? "— henüz verilmedi (açık madde)"],
              ["Şirket müdürü", COMPANY.managingDirector ?? "— henüz verilmedi (açık madde)"],
            ],
          },
          {
            type: "note",
            text: "MERSİS numarası, ticaret sicil numarası ve şirket müdürü ortam değişkenlerinden okunur ve boş olduklarında künyede gizlenir. Bu bilgiler sağlanana kadar künye, 6563 sayılı Kanun m.3 karşısında eksiktir.",
          },
        ],
      },
      {
        id: "offer",
        nav: "Hizmet ve fiyat",
        h: "3. Hizmet ve fiyatın bildirilmesi",
        blocks: [
          {
            type: "list",
            items: [
              "Formatlar: resim ve çizim (akrilik, yağlı boya, kurşun kalem, pastel, suluboya), uygulamalı sanat ve el sanatları, satranç ve bireysel dersler.",
              "Gruplar: yaşa ve seviyeye göre, en fazla 8 katılımcı. Diller: Türkçe, İngilizce, Rusça.",
              "Paketler: 1, 2, 4, 8, 12 ve 16 ders. 8 derslik paket standart tekliftir.",
              "Derste kullanılan tüm malzemeler stüdyo tarafından sağlanır. Müşteriye asla önceden malzeme almasını söylemeyin.",
            ],
          },
          {
            type: "p",
            text: "Fiyatı yalnızca vergiler dâhil toplam tutar olarak, Türk lirası (₺) cinsinden ve her zaman sözleşme kurulmadan önce bildirin. Net tutar söyleyip sonradan vergi eklemeyin.",
          },
          {
            type: "note",
            text: "Web sitesi üzerinden çevrimiçi ödeme alınmaz. Ödeme doğrudan stüdyo ile yapılır — müşteriye ödeme bağlantısı vaat etmeyin.",
          },
        ],
      },
      {
        id: "pipeline",
        nav: "Kayıt akışı",
        h: "4. Kayıt taleplerinin işleyişi",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Talep gelir",
                text: "Müşteri /kayit formunu gönderir. Bu bağlayıcı olmayan bir taleptir; ödeme yükümlülüğü doğurmaz ve kurulmuş bir sözleşme gibi işlem görmemelidir.",
              },
              {
                title: "Yeni",
                text: "Talep, panelde Kayıtlar bölümünde «Yeni» durumuyla görünür. Birinin sahiplenmesi gerekir; kendiliğinden temizlenen bir kuyruk değildir.",
              },
              {
                title: "İletişim kuruldu",
                text: "Formdaki WhatsApp numarasından dönüş yapın. Günü, saati, grubu ve paketi netleştirin. Aynı aileye iki kez yazılmasın diye durumu «İletişim kuruldu» olarak işaretleyin.",
              },
              {
                title: "Kaydedildi",
                text: "Yer teyit edildiğinde ve — seçilen hizmet için öngörülmüşse — ödeme ya da ön ödeme yapıldığında «Kaydedildi» olarak işaretleyin. Yer bu andan itibaren ayrılmış sayılır.",
              },
              {
                title: "Arşivlendi",
                text: "Sonuçlanmayan talepler için «Arşivlendi» kullanılır. Listeyi düzenlemek için kayıt silmeyin; saklama süresi hukuki bir konudur, düzen meselesi değil.",
              },
            ],
          },
          {
            type: "note",
            text: "Müşteriye «stüdyo en kısa sürede WhatsApp'tan dönüş yapacak» deniyor. Bunu verilmiş bir söz olarak kabul edin ve mümkünse aynı iş günü içinde yanıt verin.",
          },
        ],
      },
      {
        id: "channels",
        nav: "WhatsApp ve Telegram",
        h: "5. WhatsApp ve Telegram",
        blocks: [
          {
            type: "list",
            items: [
              "Gün, saat ve paket ayarlamak için olağan kanal WhatsApp'tır. Müşterinin formda verdiği numarayı kullanın, başka yerden bulunan numarayı değil.",
              "Telegram bildirimleri isteğe bağlıdır. Müşteri onay vermediyse Telegram'a hiçbir şey gönderilmez.",
              "Çocuğun adını ve sağlık/alerji bilgilerini Telegram üzerinden asla göndermeyin. Bildirim kodu bunları hâlihazırda dışarıda bırakıyor — elle yazarak bu korumayı aşmayın.",
              "Telegram ve WhatsApp Türkiye dışında yerleşik sağlayıcılardır. Mesajları yalnızca gerekli olanla sınırlı tutun; kayıt tutulacak yerler değildir.",
              "Hiçbir kanalda sağlık bilgisini grup mesajına yazmayın.",
            ],
          },
        ],
      },
      {
        id: "consents",
        nav: "Onaylar",
        h: "6. Onayların yönetimi",
        blocks: [
          {
            type: "p",
            text: "Kayıt verileri, kural olarak sözleşmenin kurulması ve ifası (KVKK m.5/2-c) ile hukuki yükümlülükler (m.5/2-ç) kapsamında işlenir — açık rızaya dayanmaz. Sözleşmedeki imza bir açık rıza beyanı değildir ve öyle sunulamaz.",
          },
          {
            type: "table",
            head: ["Kalem", "Türü", "Kural"],
            rows: [
              ["Aydınlatma Metni okundu", "Zorunlu bilgilendirme onayı", "Vazgeçilemez; rıza değildir."],
              [
                "Bağlayıcı olmayan talep anlaşıldı",
                "Zorunlu bilgilendirme onayı",
                "6502 sayılı Kanun kapsamında ön bilgilendirme yükümlülüğü.",
              ],
              [
                "Sağlık / alerji notları",
                "Açık rıza, isteğe bağlı",
                "Ayrı kutu. KVKK m.6 anlamında özel nitelikli veri.",
              ],
              [
                "Web sitesinde fotoğraf / video",
                "Açık rıza, isteğe bağlı",
                "Ayrı kutu, önceden işaretli değil, sosyal medyadan bağımsız.",
              ],
              [
                "Sosyal medyada fotoğraf / video",
                "Açık rıza, isteğe bağlı",
                "Ayrı kutu, önceden işaretli değil, web sitesinden bağımsız.",
              ],
            ],
          },
          {
            type: "list",
            items: [
              "İsteğe bağlı bir onayı ne kâğıtta ne ekranda önceden işaretlemeyin.",
              "İsteğe bağlı onayların verilmemesi veya geri çekilmesi kaydı, yeri, programı veya ücreti değiştirmez. Bir çalışan müşteriye bunun aksini ima ederse düzeltin.",
              `Geri çekme bildirimleri ${COMPANY.email} adresine e-posta ile gelir. 10 iş günü içinde harekete geçin: materyalin web sitesindeki ve stüdyonun sosyal medya hesaplarındaki yayınına son verin ve yeni kullanım yapmayın.`,
              "Neyin, ne zaman geri çekildiğini kayda geçirin. Belgeleyemediğiniz bir geri çekme, yerine getirilmemiş sayılır.",
            ],
          },
        ],
      },
      {
        id: "health",
        nav: "Sağlık notları",
        h: "7. Sağlık ve alerji notları",
        blocks: [
          {
            type: "list",
            items: [
              "Alan isteğe bağlıdır. Veli boş bıraktıysa konu kapanmıştır — peşine düşmeyin ve kaydı eksik saymayın.",
              "Sağlık verisi yalnızca ayrı açık rıza ile ve yalnızca çocuğun ders güvenliği amacıyla işlenebilir.",
              "Yalnızca o çocuğa fiilen ders veren öğretmenle paylaşın. Genel ekip bilgisi değildir.",
              "Telegram'dan, grup mesajlarından ve yayımlanan hiçbir içerikten uzak tutun.",
              "Online form, ayrı rıza olmadan sağlık notu göndermeyi reddeder. Bunu aşmak için sağlık bilgisini başka bir alana yazmayın.",
            ],
          },
        ],
      },
      {
        id: "attendance",
        nav: "Yoklama ve telafi",
        h: "8. Yoklama, erteleme ve telafi",
        blocks: [
          {
            type: "list",
            items: [
              "8 derslik abonman, ilk dersin tarihinden itibaren 1 takvim ayı boyunca geçerlidir.",
              "Abonman başına en fazla 2 ders ertelenebilir; müşteri dersin başlamasına en az 6 saat kala bildirmek zorundadır. Bildirim saatini kayda geçirin — ölçüt tamamen bu 6 saattir.",
              "Ertelenen dersler aynı abonman süresi içinde, yaşa uygun bir grupta boş kontenjanda veya telafi için ayrılan derslerde kullanılır.",
              "Önceden bildirilmeyen devamsızlıklar ve 2 dersi aşan ertelemeler telafi edilmez. Geç gelmek dersi uzatmaz.",
              "Bulaşıcı hastalık belirtisi olan çocuk evde kalır ve kaçırdığı ders erteleme kuralları kapsamında değerlendirilir — düz bir devamsızlık gibi işlem görmez.",
            ],
          },
        ],
      },
      {
        id: "cancellation",
        nav: "Stüdyo iptalleri",
        h: "9. Dersi stüdyo iptal ederse",
        blocks: [
          {
            type: "list",
            items: [
              "Üç seçeneği birlikte sunun ve müşteri seçsin: telafi dersi, eşdeğer bir ders veya o dersin bedelinin iadesi. Seçim bizim değil, müşterinindir.",
              "Ders çizelgesi veya öğretmen değişiklikleri uygun bir yolla önceden bildirilir.",
              "Değişiklik hizmetin esaslı bir unsurunu — gün, saat, seviye veya biçim — müşteri aleyhine etkiliyorsa müşteri sözleşmeyi ücretsiz sona erdirebilir ve ifa edilmemiş kısım iade edilir.",
              "Yürürlükteki bir abonmanın koşulları tek taraflı olarak müşteri aleyhine değiştirilemez. Yeni koşullar yalnızca bildirimden sonraki satın alma ve yenilemelere uygulanır.",
            ],
          },
        ],
      },
      {
        id: "withdrawal",
        nav: "Cayma ve iade",
        h: "10. Cayma ve iade süreci",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Sözleşmenin nasıl kurulduğunu tespit edin",
                text: "İnternet, telefon veya mesajlaşma uygulaması ya da iş yeri dışında kurulduysa, kurulma tarihinden itibaren 14 gün cayma hakkı vardır; gerekçe ve cezai şart aranmaz.",
              },
              {
                title: "Kalıcı veri saklayıcısıyla kabul edin",
                text: `14 gün içinde ${COMPANY.email} adresine yazılı bildirim. Yalnızca telefon yeterli değildir — ama müşteri telefonla ararsa, süre kaçmasın diye bunu nasıl yazılı hâle getireceğini anlatın.`,
              },
              {
                title: "Erken başlama talebini kontrol edin",
                text: "Müşteri 14 gün dolmadan derslerin başlamasını istediyse bu talep ayrıca kayıtlıdır. Cayma hâlinde fiilen verilen derslerin orantılı bedelini tahsil edin.",
              },
              {
                title: "14 gün içinde iade edin",
                text: "Bildirim bize ulaştıktan sonra 14 gün içinde, ödemenin yapıldığı yöntemle iade edin. Abonman ortasında sona eren sözleşmede, henüz verilmemiş derslere düşen ön ödeme, fiilen yapılan ve belgelenen masraflar mahsup edilerek iade edilir.",
              },
              {
                title: "Mahsubu belgeleyin",
                text: "Her mahsup, fiilen yapılmış ve belgelenebilir bir masrafa dayanmalıdır. Belgesiz mahsup, tüketici hakem heyeti önünde savunulamaz.",
              },
            ],
          },
          {
            type: "note",
            text: "6502 sayılı Kanun'dan doğan haklar sözleşmeyle ortadan kaldırılamaz. Müşteriye ön ödemeli derslerin öylece yandığını asla söylemeyin.",
          },
        ],
      },
      {
        id: "emergency",
        nav: "Acil durum ve teslim",
        h: "11. Acil durumlar ve çocuğun teslimi",
        blocks: [
          {
            type: "list",
            items: [
              "Çocuklar ders boyunca öğretmenin gözetimindedir.",
              "Çocuk yalnızca o çocuğun kayıt formunda adı geçen kişilere teslim edilir. Kapıdaki birinin sözlü talebiyle istisna yapılmaz — veliyi arayın.",
              "Çocuğun sağlığı bozulursa veliyle iletişime geçin ve çocuğun yararına hareket edin. Gecikmesinde sakınca bulunan hâllerde önce 112'yi arayın.",
              "Veliye ulaşılamadığında formdaki acil durum kişisini arayın.",
              "Olayı aynı gün içinde, saatleri ve bilgilendirilen kişileri de yazarak kayda geçirin.",
            ],
          },
        ],
      },
      {
        id: "data",
        nav: "Veri koruma",
        h: "12. Veri koruma yükümlülükleri",
        blocks: [
          {
            type: "list",
            items: [
              `Veri sorumlusu ${COMPANY.legalName}'dir. Amaçlar kayıt, iletişim, yoklama, ödemeler ve güvenliktir — bu amaçlarla toplanan hiçbir veri, önce kontrol edilmeden başka bir amaçla kullanılamaz.`,
              "Müşteri verisi pazarlama amacıyla üçüncü kişilere satılmaz veya devredilmez.",
              "Barındırma, veritabanı, e-posta ve bildirim sağlayıcıları yalnızca veri işleyen sıfatıyla, amaçla sınırlı olarak devreye girer.",
              `KVKK m.11 kapsamındaki başvurular ${COMPANY.email} adresine gelir: hangi verilerin işlendiği, düzeltme, silme, itiraz, zararın giderilmesi. KVKK m.13 uyarınca en geç 30 gün içinde yanıt verilmelidir — geldiği gün başlayın, bekletmeyin.`,
              "Müşteri listelerini kişisel cihazlara, kişisel e-postaya veya özel tablolara aktarmayın.",
              "Kullandığımız sağlayıcıların bir kısmı Türkiye dışındadır. Yurt dışına aktarım için Kurul'un standart sözleşme metinleri gerekir ve imzadan itibaren 5 iş günü içinde Veri Aktarım Modülü üzerinden bildirilmelidir — açık maddelere bakın.",
            ],
          },
          {
            type: "note",
            text: "VERBİS: stüdyo her iki kayıt eşiğinin de altındadır (50 çalışan / 100 milyon TL bilanço), dolayısıyla istisnanın uygulanması beklenir. Ana faaliyet özel nitelikli veri işlemeyi içeriyorsa istisna düşer — hukuk danışmanına doğrulatın ve yıllık olarak yeniden kontrol edin.",
          },
        ],
      },
      {
        id: "docs",
        nav: "Belgeler ve sürümler",
        h: "13. Belgeler ve sürüm disiplini",
        blocks: [
          {
            type: "p",
            text: "Yayımlanan hukuki metinler ve sürüm işaretleri src/lib/legal.ts dosyasındadır. Her yayımlanan belge bir sürüm taşır; böylece müşterinin fiilen neyi kabul ettiği kanıtlanabilir.",
          },
          {
            type: "list",
            items: [
              "/rules — Katılım Sözleşmesi ve Stüdyo Kuralları. Bağlayıcı işleyiş metni.",
              "/privacy — KVKK Aydınlatma Metni. Bir çıktısını kâğıt sözleşmeye ek olarak koyun ve teslim alındığını imzalatın.",
              "/terms — Ön Bilgilendirme ve Hizmet Koşulları.",
              "/cookies — Çerez Politikası. /imprint — Künye.",
              "/handbook — müşteriye verilen Aile El Kitabı.",
            ],
          },
          {
            type: "note",
            text: "Bir hukuki metni değiştirdiğinizde, aynı commit içinde sürüm sabitini ve COMPANY.lastUpdated değerini de güncelleyin. Sürüm numarası eskimiş bir belge, hiç sürüm numarası olmayandan kötüdür.",
          },
        ],
      },
      {
        id: "open",
        nav: "Açık maddeler",
        h: "14. Açık uyum maddeleri",
        blocks: [
          {
            type: "table",
            head: ["Madde", "Sorumlu"],
            rows: [
              [
                "Bağlayıcı ticaret ünvanını Ticaret Sicil Gazetesi'nden doğrulayın — kâğıt sözleşmede «Ticaret», sitede «Turizm ve Ticaret» yazıyor. Yalnızca biri doğru olabilir.",
                "Ekip",
              ],
              ["MERSİS numarası ve ticaret sicil numarasını temin edip ortam değişkenlerine ekleyin", "Ekip"],
              ["Şirket müdürünü belirleyip sözleşmenin imza bloğuna yazın", "Ekip"],
              [
                "ETBİS kaydının gerekip gerekmediğine karar verilmesi: site bağlayıcı olmayan talep alıyor ve çevrimiçi ödeme yok — bu bir gri alan",
                "Hukuk danışmanı",
              ],
              [
                "Türkiye dışındaki sağlayıcılar için standart sözleşme metinlerinin imzalanması ve imzadan itibaren 5 iş günü içinde Kurum'a bildirilmesi",
                "Hukuk danışmanı + Ekip",
              ],
              [
                "Kâğıt sözleşmenin yayımlanan /rules metniyle uyumlu hâle getirilmesi (cayma hakkı, iadeler, ayrı onaylar, iki nüsha)",
                "Hukuk danışmanı",
              ],
              [
                "Kâğıt form için ayrı onay beyanı hazırlanması: sağlık verileri, web sitesinde fotoğraf, sosyal medyada fotoğraf, tanıtım iletişimi — her biri tek tek işaretlenecek, hiçbiri önceden işaretli olmayacak",
                "Hukuk danışmanı + Ekip",
              ],
              ["Sözleşmenin ikinci nüshasının imza anında müşteriye verilme usulünün belirlenmesi", "Stüdyo yönetimi"],
              [
                "Ana sayfadaki paket metninin düzeltilmesi: «geçerlilik süresi yok» yazıyor, oysa /rules 8 derslik abonmana 1 takvim ayı veriyor",
                "Ekip",
              ],
              [
                "Ana sayfada euro cinsinden gösterilen paket fiyatlarının (ders başına €45/€42/€40) gözden geçirilmesi: /rules m.3.2 ve Fiyat Etiketi Yönetmeliği, vergiler dâhil toplam tutarın Türk lirası olarak gösterilmesini gerektirir. «Referans fiyat, TL tutarı sözleşmeden önce teyit edilir» dipnotu yeterli olmayabilir",
                "Hukuk danışmanı + Ekip",
              ],
            ],
          },
        ],
      },
      {
        id: "dashboard",
        nav: "Panel haritası",
        h: "15. Panel haritası",
        blocks: [
          {
            type: "list",
            items: [
              "Genel bakış — Panel, Bugün: şu an ne olduğu.",
              "Dersler — Program, Seanslar, Yoklama: ders haftası ve kimin geldiği.",
              "Müşteriler — Kayıtlar, Müşteriler, Abonmanlar, Ödemeler: kayıt akışı ve para.",
              "Sistem — Mesajlar, Bildirimler, İçerik, Medya, Ayarlar: site içeriği ve iletişim.",
              "Dil: kenar çubuğunun altındaki seçici panelin dilini değiştirir, herkese açık sitenin dilini değiştirmez.",
            ],
          },
        ],
      },
    ],
  },

  ru: {
    back: "Назад в панель",
    title: "Внутреннее руководство",
    subtitle: "Для сотрудников студии и тех, кто поддерживает сайт. Клиентам не отправляется.",
    updated: "Последнее обновление",
    contents: "Содержание",
    printLabel: "Печать / сохранить в PDF",
    intro:
      "Это руководство описывает, как мы ведём запись, переписку, согласия, посещаемость и возвраты. Клиентская версия — «Справочник для родителей» по адресу /handbook; обязывающий текст — Договор об участии по адресу /rules. При расхождении этого руководства и /rules действует /rules, а исправлять нужно это руководство.",
    sections: [
      {
        id: "scope",
        nav: "Область",
        h: "1. Что это за руководство",
        blocks: [
          {
            type: "list",
            items: [
              "Для кого: сотрудники студии, преподаватели, работающие с записями, и те, кто поддерживает это приложение.",
              "Это операционное руководство, а не юридическая консультация. Всё, что отмечено как открытый пункт, требует турецкого юриста или документа компании.",
              "Формулировки для клиентов находятся в справочнике по адресу /handbook. Не копируйте разделы этого руководства клиентам.",
              "При изменении операционного правила меняйте сначала /rules, затем /handbook, затем этот текст — в одном коммите.",
            ],
          },
        ],
      },
      {
        id: "identity",
        nav: "Данные компании",
        h: "2. Данные компании",
        blocks: [
          {
            type: "p",
            text: "Используйте именно эти данные в договорах, счетах и любом письменном предложении. Закон № 6563 об электронной торговле требует, чтобы поставщик услуг был однозначно идентифицируем до заключения договора.",
          },
          {
            type: "table",
            head: ["Поле", "Значение"],
            rows: [
              ["Юридическое наименование", COMPANY.legalName],
              ["Юридический адрес", SEAT],
              ["Студия", ATELIER],
              ["Налоговая инспекция / ИНН", `${COMPANY.taxOffice} / ${COMPANY.taxNumber}`],
              ["Телефон", COMPANY.phone],
              ["Email", COMPANY.email],
              ["Номер MERSİS", COMPANY.mersisNo ?? "— пока не предоставлен (открытый пункт)"],
              ["Номер в торговом реестре", COMPANY.tradeRegistryNo ?? "— пока не предоставлен (открытый пункт)"],
              ["Директор", COMPANY.managingDirector ?? "— пока не предоставлен (открытый пункт)"],
            ],
          },
          {
            type: "note",
            text: "Номер MERSİS, номер в торговом реестре и директор считываются из переменных окружения и скрыты в выходных данных, пока пусты. До их предоставления выходные данные неполны по ст. 3 Закона № 6563.",
          },
        ],
      },
      {
        id: "offer",
        nav: "Услуги и цены",
        h: "3. Услуги и как сообщать цену",
        blocks: [
          {
            type: "list",
            items: [
              "Форматы: живопись и рисунок (акрил, масло, карандаш, пастель, акварель), прикладное творчество и рукоделие, шахматы, индивидуальные занятия.",
              "Группы: по возрасту и уровню, до 8 участников. Языки: турецкий, английский, русский.",
              "Пакеты: 1, 2, 4, 8, 12 и 16 занятий. Пакет на 8 занятий — стандартное предложение.",
              "Все материалы для занятия предоставляет студия. Никогда не говорите клиенту покупать материалы заранее.",
            ],
          },
          {
            type: "p",
            text: "Сообщайте цену только как итоговую сумму с учётом налогов в турецких лирах (₺) и всегда до заключения договора. Не называйте сумму без налога с добавлением его потом.",
          },
          {
            type: "note",
            text: "Через сайт оплата не проходит. Оплата производится напрямую в студии — не обещайте клиенту платёжную ссылку.",
          },
        ],
      },
      {
        id: "pipeline",
        nav: "Обработка заявок",
        h: "4. Обработка заявок на запись",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Заявка поступает",
                text: "Клиент отправляет форму /kayit. Это необязывающая заявка: она не создаёт обязанности платить, и её нельзя рассматривать как заключённый договор.",
              },
              {
                title: "Новая",
                text: "Заявка появляется в разделе «Записи» со статусом «Новая». Её должен кто-то взять — очередь не разбирается сама.",
              },
              {
                title: "Связались",
                text: "Ответьте на номер WhatsApp, указанный в форме. Согласуйте день, время, группу и пакет. Поставьте статус «Связались», чтобы одной семье не написали дважды.",
              },
              {
                title: "Записан",
                text: "После подтверждения места и — если это предусмотрено для выбранной услуги — оплаты или предоплаты поставьте «Записан». С этого момента место считается закреплённым.",
              },
              {
                title: "В архиве",
                text: "Используйте «В архиве» для заявок, которые ничем не завершились. Не удаляйте записи ради порядка в списке: срок хранения — юридический вопрос, а не вопрос аккуратности.",
              },
            ],
          },
          {
            type: "note",
            text: "Клиенту сказано, что студия свяжется с ним в WhatsApp в ближайшее время. Считайте это обещанием и отвечайте по возможности в тот же рабочий день.",
          },
        ],
      },
      {
        id: "channels",
        nav: "WhatsApp и Telegram",
        h: "5. WhatsApp и Telegram",
        blocks: [
          {
            type: "list",
            items: [
              "WhatsApp — обычный канал для согласования дней, времени и пакетов. Используйте номер из формы, а не найденный где-то ещё.",
              "Уведомления в Telegram — только по желанию клиента. Если согласия не было, в Telegram ничего не отправляется.",
              "Никогда не отправляйте через Telegram имя ребёнка и сведения о здоровье или аллергиях. Код уведомлений уже их исключает — не обходите это, набирая вручную.",
              "Telegram и WhatsApp — поставщики за пределами Турции. Ограничивайте сообщения необходимым: это не место для хранения записей.",
              "Ни в одном канале не пишите сведения о здоровье в групповое сообщение.",
            ],
          },
        ],
      },
      {
        id: "consents",
        nav: "Согласия",
        h: "6. Работа с согласиями",
        blocks: [
          {
            type: "p",
            text: "Данные записи обрабатываются на основании заключения и исполнения договора (ст. 5(2)(c) KVKK) и правовых обязанностей (ст. 5(2)(ç)), а не согласия. Подпись в договоре не является выражением согласия и не может подаваться как таковое.",
          },
          {
            type: "table",
            head: ["Пункт", "Тип", "Правило"],
            rows: [
              ["Уведомление KVKK прочитано", "Обязательное подтверждение", "Не может быть отменено; это не согласие."],
              [
                "Понимание необязывающего характера заявки",
                "Обязательное подтверждение",
                "Преддоговорная обязанность по Закону № 6502.",
              ],
              [
                "Сведения о здоровье / аллергиях",
                "Явное согласие, необязательное",
                "Отдельная отметка. Особая категория данных по ст. 6 KVKK.",
              ],
              [
                "Фото / видео на сайте",
                "Явное согласие, необязательное",
                "Отдельная отметка, не проставлена заранее, независимо от соцсетей.",
              ],
              [
                "Фото / видео в соцсетях",
                "Явное согласие, необязательное",
                "Отдельная отметка, не проставлена заранее, независимо от сайта.",
              ],
            ],
          },
          {
            type: "list",
            items: [
              "Никогда не проставляйте необязательное согласие заранее — ни на бумаге, ни на экране.",
              "Отказ или отзыв любого необязательного согласия не меняет запись, место, расписание или цену. Если коллега намекает клиенту на обратное — поправьте.",
              `Отзывы приходят письмом на ${COMPANY.email}. Действуйте в течение 10 рабочих дней: прекратите публикацию материала на сайте и в аккаунтах студии в соцсетях и не используйте его далее.`,
              "Фиксируйте, что и когда было отозвано. Отзыв, который вы не можете подтвердить, считается неисполненным.",
            ],
          },
        ],
      },
      {
        id: "health",
        nav: "Сведения о здоровье",
        h: "7. Сведения о здоровье и аллергиях",
        blocks: [
          {
            type: "list",
            items: [
              "Поле необязательное. Если родитель оставил его пустым — вопрос закрыт: не выпрашивайте и не считайте запись неполной.",
              "Данные о здоровье можно обрабатывать только при отдельном явном согласии и только для безопасности ребёнка на занятии.",
              "Передавайте их только преподавателю, который фактически ведёт этого ребёнка. Это не общая информация для персонала.",
              "Не допускайте их в Telegram, в групповые сообщения и в любые публикации.",
              "Онлайн-форма не отправит сведения о здоровье без отдельного согласия. Не вписывайте их в другое поле, чтобы это обойти.",
            ],
          },
        ],
      },
      {
        id: "attendance",
        nav: "Посещаемость и отработки",
        h: "8. Посещаемость, переносы и отработки",
        blocks: [
          {
            type: "list",
            items: [
              "Абонемент на 8 занятий действует один календарный месяц с даты первого занятия.",
              "На один абонемент можно перенести не более 2 занятий, если клиент уведомил студию не позднее чем за 6 часов до начала. Фиксируйте время уведомления — эти 6 часов и есть весь критерий.",
              "Перенесённые занятия используются в пределах того же срока абонемента: в подходящей по возрасту группе при свободном месте либо в занятиях для отработки.",
              "Пропуски без предварительного уведомления и переносы сверх 2 не отрабатываются. Опоздание не продлевает занятие.",
              "Ребёнок с признаками инфекции остаётся дома, а пропущенное занятие рассматривается по правилам переноса — это не обычная неявка.",
            ],
          },
        ],
      },
      {
        id: "cancellation",
        nav: "Отмены студией",
        h: "9. Если занятие отменяет студия",
        blocks: [
          {
            type: "list",
            items: [
              "Предложите все три варианта и дайте клиенту выбрать: отработка, равноценное занятие или возврат стоимости этого занятия. Выбор за клиентом, не за нами.",
              "Об изменениях расписания или преподавателя сообщается заранее подходящим способом.",
              "Если изменение затрагивает существенный элемент — день, время, уровень или формат — в ущерб клиенту, он может расторгнуть договор бесплатно, а неисполненная часть возвращается.",
              "Условия уже действующего абонемента нельзя изменить в одностороннем порядке в ущерб клиенту. Новые условия применяются только к покупкам и продлениям после уведомления.",
            ],
          },
        ],
      },
      {
        id: "withdrawal",
        nav: "Отказ и возврат",
        h: "10. Порядок отказа и возврата",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "Определите, как был заключён договор",
                text: "Дистанционно (сайт, телефон, мессенджер) или вне помещения — значит 14 дней на отказ с даты заключения, без причин и без штрафа.",
              },
              {
                title: "Примите отказ на долговременном носителе",
                text: `Письменное уведомление на ${COMPANY.email} в течение 14 дней. Только звонка недостаточно — но если клиент звонит, объясните, как оформить письменно, чтобы срок не истёк.`,
              },
              {
                title: "Проверьте просьбу о раннем начале",
                text: "Если клиент просил начать занятия до истечения 14 дней, эта просьба зафиксирована отдельно. При отказе взимайте пропорциональную стоимость фактически проведённых занятий.",
              },
              {
                title: "Верните в течение 14 дней",
                text: "Возврат в течение 14 дней с получения уведомления, тем же способом оплаты. При расторжении в середине абонемента возвращается предоплата за непроведённые занятия за вычетом фактических документально подтверждённых расходов.",
              },
              {
                title: "Документируйте вычет",
                text: "Любой вычет должен быть фактическим документально подтверждённым расходом. Недокументированный вычет невозможно защитить в комиссии по потребительским спорам.",
              },
            ],
          },
          {
            type: "note",
            text: "Права по Закону № 6502 нельзя отменить договором. Никогда не говорите клиенту, что предоплаченные занятия просто сгорели.",
          },
        ],
      },
      {
        id: "emergency",
        nav: "Экстренные ситуации",
        h: "11. Экстренные ситуации и передача ребёнка",
        blocks: [
          {
            type: "list",
            items: [
              "Дети находятся под присмотром преподавателя всё занятие.",
              "Ребёнок передаётся только людям, указанным в форме записи этого ребёнка. Никаких исключений по устной просьбе человека в дверях — позвоните родителю.",
              "Если ребёнку стало плохо, свяжитесь с родителем и действуйте в интересах ребёнка. При непосредственной опасности сначала звоните 112.",
              "Если родитель недоступен, звоните по экстренному контакту из формы.",
              "Опишите произошедшее в тот же день, указав время и кого проинформировали.",
            ],
          },
        ],
      },
      {
        id: "data",
        nav: "Защита данных",
        h: "12. Обязанности по защите данных",
        blocks: [
          {
            type: "list",
            items: [
              `Оператор данных — ${COMPANY.legalName}. Цели: запись, связь, посещаемость, платежи и безопасность. Ничего собранного для этих целей нельзя использовать для другой цели без предварительной проверки.`,
              "Данные клиентов не продаются и не передаются третьим лицам в маркетинговых целях.",
              "Поставщики хостинга, базы данных, почты и уведомлений выступают только как обработчики в пределах этой цели.",
              `Запросы по ст. 11 KVKK приходят на ${COMPANY.email}: какие данные обрабатываются, исправление, удаление, возражение, возмещение. По ст. 13 KVKK ответить нужно не позднее 30 дней — начинайте в день поступления, не откладывайте.`,
              "Не выгружайте списки клиентов на личные устройства, в личную почту или частные таблицы.",
              "Часть наших поставщиков находится за пределами Турции. Для передачи за рубеж нужны стандартные договорные условия Управления с уведомлением через Модуль передачи данных в течение 5 рабочих дней с подписания — см. открытые пункты.",
            ],
          },
          {
            type: "note",
            text: "VERBİS: студия ниже обоих порогов регистрации (50 сотрудников / 100 млн TRY баланс), поэтому исключение должно применяться. Оно перестаёт действовать, если основная деятельность связана с особыми категориями данных — подтвердите у юриста и перепроверяйте ежегодно.",
          },
        ],
      },
      {
        id: "docs",
        nav: "Документы и версии",
        h: "13. Документы и дисциплина версий",
        blocks: [
          {
            type: "p",
            text: "Опубликованные юридические тексты и их версии находятся в src/lib/legal.ts. Каждый опубликованный документ несёт версию, чтобы можно было доказать, с чем именно согласился клиент.",
          },
          {
            type: "list",
            items: [
              "/rules — Договор об участии и правила студии. Обязывающий операционный текст.",
              "/privacy — Уведомление KVKK. Печатную копию прикладывайте к бумажному договору и берите подпись о получении.",
              "/terms — Преддоговорная информация и условия услуг.",
              "/cookies — Политика cookies. /imprint — Выходные данные.",
              "/handbook — клиентский справочник для родителей.",
            ],
          },
          {
            type: "note",
            text: "Меняя юридический текст, в том же коммите обновляйте константу версии и COMPANY.lastUpdated. Изменённый документ со старым номером версии хуже, чем документ без версии.",
          },
        ],
      },
      {
        id: "open",
        nav: "Открытые пункты",
        h: "14. Открытые пункты соответствия",
        blocks: [
          {
            type: "table",
            head: ["Пункт", "Ответственный"],
            rows: [
              [
                "Подтвердить обязывающее наименование по «Ticaret Sicil Gazetesi»: в бумажном договоре «Ticaret», на сайте «Turizm ve Ticaret». Верным может быть только одно.",
                "Команда",
              ],
              ["Получить номер MERSİS и номер в торговом реестре, затем задать переменные окружения", "Команда"],
              ["Указать директора и добавить его в блок подписи договора", "Команда"],
              [
                "Решить, требуется ли регистрация в ETBİS: сайт принимает необязывающие заявки без онлайн-оплаты — это серая зона",
                "Юрист",
              ],
              [
                "Оформить стандартные договорные условия для поставщиков за пределами Турции и уведомить Управление в течение 5 рабочих дней с подписания",
                "Юрист + Команда",
              ],
              [
                "Привести бумажный договор в соответствие с опубликованным текстом /rules (право на отказ, возвраты, отдельные согласия, два экземпляра)",
                "Юрист",
              ],
              [
                "Подготовить отдельное приложение с согласиями для бумажной формы: данные о здоровье, фото на сайте, фото в соцсетях, рекламная коммуникация — каждое отмечается отдельно, ничего не проставлено заранее",
                "Юрист + Команда",
              ],
              ["Определить порядок передачи клиенту второго экземпляра договора при подписании", "Руководство студии"],
              [
                "Исправить текст о пакетах на главной странице: там указано «без срока действия», тогда как /rules даёт абонементу на 8 занятий один календарный месяц",
                "Команда",
              ],
              [
                "Проверить цены пакетов, указанные на главной странице в евро (€45/€42/€40 за занятие): ст. 3.2 /rules и Регламент о ценниках требуют указывать итоговую сумму с налогами в турецких лирах. Сноски «справочная цена, сумма в TRY подтверждается до договора» может быть недостаточно",
                "Юрист + Команда",
              ],
            ],
          },
        ],
      },
      {
        id: "dashboard",
        nav: "Карта панели",
        h: "15. Карта панели",
        blocks: [
          {
            type: "list",
            items: [
              "Обзор — Панель, Сегодня: что происходит сейчас.",
              "Занятия — Расписание, Сессии, Посещаемость: учебная неделя и кто пришёл.",
              "Клиенты — Записи, Клиенты, Абонементы, Платежи: воронка записи и деньги.",
              "Система — Сообщения, Уведомления, Контент, Медиа, Настройки: содержимое сайта и коммуникации.",
              "Язык: переключатель внизу боковой панели меняет язык панели, а не язык публичного сайта.",
            ],
          },
        ],
      },
    ],
  },
};
