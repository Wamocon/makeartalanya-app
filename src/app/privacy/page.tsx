import Link from "next/link";
import { getLocale } from "@/i18n/server";
import { COMPANY, PRIVACY_NOTICE_VERSION } from "@/lib/legal";

export const metadata = {
  title: "KVKK Aydınlatma Metni · Privacy | Make Art Studio Alanya",
};

const COPY = {
  tr: {
    back: "Ana sayfaya dön",
    title: "KVKK Aydınlatma Metni ve Gizlilik Politikası",
    updated: "Son güncelleme",
    intro: "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (KVKK) 10. maddesi kapsamında kişisel verilerinizi nasıl işlediğimizi açıklar. Aydınlatma metni bir açık rıza metni değildir; açık rıza gereken işlemler için ayrı ve isteğe bağlı onay alınır.",
    sections: [
      ["1. Veri sorumlusu", [`Veri sorumlusu ${COMPANY.legalName}'dir. Kayıtlı adres: ${COMPANY.registeredSeat.join(" ")}. İletişim: ${COMPANY.email}, ${COMPANY.phone}.`]],
      ["2. İşlenen veri kategorileri", ["Rezervasyon ve kayıt taleplerinde veli adı, iletişim bilgileri, tercih edilen dil, çocuk adı, doğum tarihi ve seçilen ders/paket bilgileri; yalnızca isteğe bağlı olarak girildiğinde sağlık/alerji notları; ayrıca rıza ve aydınlatma kayıtları (metin sürümü, tarih/saat ve güvenlik amacıyla IP kaydı) işlenebilir.", "Site güvenliği için sınırlı teknik günlük verileri işlenebilir. Yapay zekâ sohbetine yazmayı seçtiğiniz mesajlar yalnızca asistan yanıtı üretmek amacıyla işlenir. Sohbete kimlik, iletişim, adres veya sağlık bilgisi yazılmamalıdır."]],
      ["3. Amaçlar ve hukuki sebepler", ["Talebinizi yanıtlamak, deneme dersi/kayıt sürecini yürütmek ve sözleşme öncesi adımları yerine getirmek için KVKK m.5/2(c); hukuki yükümlülükler ve kayıtların saklanması için m.5/2(ç); sistem güvenliği ve kötüye kullanımın önlenmesi için temel haklarınıza zarar vermeyen meşru menfaat kapsamında veri işlenir.", "Çocuğa ait sağlık/alerji notları özel nitelikli kişisel veridir ve yalnızca ayrı, bilgilendirilmiş açık rıza verilerek yazıldığında işlenir. Fotoğraf/video kullanımı ve pazarlama iletişimi de hizmetin şartı değildir ve ayrı açık rıza gerektirir."]],
      ["4. Toplama yöntemi", ["Veriler; web formları, kullanıcı hesabı, WhatsApp/telefon/e-posta iletişimi ve güvenlik günlükları üzerinden elektronik olarak doğrudan sizden elde edilir. Zorunlu olmayan alanları boş bırakabilirsiniz."]],
      ["5. Aktarım ve hizmet sağlayıcılar", ["Veriler, yalnızca amaçla sınırlı olarak yetkili stüdyo personeline ve barındırma/veritabanı, e-posta ve bildirim hizmeti sunan veri işleyenlere aktarılabilir. Çocuk sağlık notları Telegram veya genel bildirim metinlerine eklenmez.", "Yurt dışına aktarım yapılacaksa KVKK m.9 kapsamındaki yeterlilik kararı veya uygun güvence (örneğin Kurul standart sözleşmesi ve gerekli bildirim) tamamlanmadan aktarım etkinleştirilmez. İstisnai bir açık rıza akışı, genel ve sürekli aktarım için uygun güvencenin yerine geçtiği şeklinde yorumlanmaz."]],
      ["6. Saklama süreleri", ["Sonuçlanmayan rezervasyon/kayıt talepleri en fazla 2 yıl; sözleşme ve tüketici işlemi kayıtları ilgili mevzuatta öngörülen süre boyunca; rıza/aydınlatma ispat kayıtları 3 yıl; güvenlik günlükları amaç için gerekli olan kısa süre boyunca saklanır. Süre sonunda veriler silinir, yok edilir veya anonimleştirilir."]],
      ["7. Haklarınız", ["KVKK m.11 kapsamında verinizin işlenip işlenmediğini öğrenme, bilgi ve aktarılan alıcıları isteme, düzeltme, silme/yok etme, bu işlemlerin alıcılara bildirilmesini isteme, yalnızca otomatik analize itiraz etme ve kanuna aykırı işlem nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz.", `Başvurunuzu kimliğinizi doğrulamaya yetecek bilgilerle ${COMPANY.email} adresine veya kayıtlı merkez adresine iletebilirsiniz. Başvurular en kısa sürede ve en geç 30 gün içinde sonuçlandırılır.`]],
      ["8. Yazılı görüşler, fotoğraf, ses ve video kayıtları", ["Kimliği belirli veya belirlenebilir bir kişiye ait yazılı görüş/alıntı, fotoğraf, ses ve video kaydı kişisel veridir. Stüdyo bu içerikleri ancak ilgili yetişkinin veya çocuk için yetkili veli/vasinin ayrı, belirli, bilgilendirilmiş ve özgür iradeyle verdiği açık rıza kapsamında; stüdyo faaliyetlerini tanıtma amacıyla oluşturabilir, kaydedebilir, seçebilir, düzenleyebilir, saklayabilir ve yayımlayabilir.", "Web sitesinde yayımlama ile stüdyonun resmi sosyal medya hesaplarında yayımlama ayrı tercihlerdir ve kutular önceden işaretli değildir. Her iki rıza da isteğe bağlıdır; vermemek veya sonradan geri çekmek kayıt, ders, fiyat ya da hizmeti etkilemez. Veli/vasi, çocuk adına işlem yapma yetkisini beyan eder; çocuğun üstün yararı ve makul itirazı ayrıca gözetilir.", `Rızanızı ${COMPANY.email} adresine yazarak geleceğe etkili biçimde istediğiniz zaman geri çekebilirsiniz. Stüdyo kendi kanallarındaki içeriği makul sürede kaldırır ve yeni kullanım yapmaz; ancak kaldırmadan önce üçüncü kişilerce kaydedilen, paylaşılan veya yeniden yayımlanan kopyalar üzerinde tam kontrol garanti edilemez. Rıza ispat kaydı, hukuki uyuşmazlıklara karşı gerekli süreyle sınırlı olarak saklanabilir.`, "Sosyal medya platformları içerik, hesap, cihaz ve etkileşim verilerini kendi koşulları kapsamında ayrıca işleyebilir. Yurt dışına aktarım söz konusuysa, açık rıza tek başına sistematik aktarım güvencesi olarak kullanılmaz; KVKK m.9 kapsamındaki uygun aktarım mekanizması ayrıca tamamlanır."], "media-consent"],
      ["9. Çerezler ve harici içerik", ["Dil ve oturum gibi açıkça talep ettiğiniz işlevler için zorunlu/işlevsel depolama kullanılır. Google Haritalar gibi harici medya, siz izin vermeden yüklenmez. Ayrıntılar için Çerez Politikası'nı okuyabilir ve tercihinizi harita alanından değiştirebilirsiniz."]],
      ["10. Yapay zekâ asistanı", ["Asistan yalnızca Make Art Studio dersleri, paketleri, konumu ve kayıt süreci hakkında genel bilgi verir; canlı müsaitlik göremez, kayıt yapamaz, ödeme alamaz ve sağlık/hukuk tavsiyesi vermez.", "Harici bir yapay zekâ sağlayıcısı kullanılıyorsa, mesaj gönderilmeden önce sağlayıcının adı ve yurt dışı işleme açıkça gösterilir ve ayrı tercih alınır. Make Art Studio sohbet geçmişini kendi veritabanına kaydetmez. Kimlik, telefon, e-posta, adres, bağlantı ve sağlık verileri teknik olarak engellenmeye çalışılır; yine de bu verileri sohbete yazmayın."], "ai-assistant"],
    ],
  },
  en: {
    back: "Back to homepage", title: "KVKK Privacy Notice", updated: "Last updated",
    intro: "This notice explains processing under Article 10 of Turkey's Personal Data Protection Law No. 6698 (KVKK). A privacy notice is not consent; any processing that requires explicit consent is presented separately and remains optional.",
    sections: [
      ["1. Data controller", [`The controller is ${COMPANY.legalName}. Registered address: ${COMPANY.registeredSeat.join(" ")}. Contact: ${COMPANY.email}, ${COMPANY.phone}.`]],
      ["2. Data we process", ["Booking and registration data may include the parent/guardian's name and contact details, language, the child's name and date of birth, class/package choices, optional health/allergy notes, and evidence records such as notice version, time and security IP address. Limited technical logs may be processed for security. AI chat processes only the messages you choose to send."]],
      ["3. Purposes and legal grounds", ["We process requests and pre-contract steps under KVKK Art. 5/2(c), legal records under Art. 5/2(ç), and proportionate security data for legitimate interests that do not override your rights. A child's optional health notes are special-category data and require separate explicit guardian consent. Media and marketing consent are optional and are never a condition of service."]],
      ["4. Collection", ["Data is collected directly from you through website forms, accounts, WhatsApp/phone/email communication and limited security logs. Optional fields may be left blank."]],
      ["5. Recipients and transfers", ["Access is limited to authorised studio staff and necessary hosting, database, email and notification processors. Child health notes are excluded from Telegram and general notification text.", "An overseas transfer is not enabled until an Article 9 transfer mechanism, such as an adequacy decision or the appropriate KVKK standard contract and notification, has been completed. A consent screen is not treated as a substitute for safeguards for systematic transfers."]],
      ["6. Retention", ["Uncompleted enquiries are kept for up to 2 years; contract and consumer records for the applicable statutory period; notice/consent evidence for 3 years; and security logs only for the short period needed. Data is then deleted, destroyed or anonymised."]],
      ["7. Your rights", [`You have the rights listed in KVKK Art. 11, including access, correction, deletion, recipient information, objection to solely automated adverse analysis and compensation for unlawful processing. Apply at ${COMPANY.email} or the registered address; requests are answered as soon as possible and within 30 days.`]],
      ["8. Written testimonials, photographs, audio and video", ["A written testimonial or quotation, photograph, audio or video recording relating to an identified or identifiable person is personal data. The studio may create, record, select, edit, store and publish this material to present its activities only under separate, specific, informed and freely given explicit consent from the adult concerned or an authorised parent/guardian for a child.", "Publication on the website and publication on the studio's official social-media accounts are separate, unchecked choices. Both are optional. Refusing or later withdrawing either choice does not affect registration, classes, price or service. The parent/guardian represents that they may act for the child; the child's best interests and reasonable objection are also respected.", `You may withdraw consent for future use at any time by writing to ${COMPANY.email}. The studio will stop new use and remove material from channels it controls within a reasonable period, but cannot guarantee control over copies saved, shared or republished by others before removal. A limited consent evidence record may be retained where needed for legal claims.`, "Social-media platforms may separately process content, account, device and interaction data under their own terms. Where overseas transfer is involved, explicit consent is not treated as the sole safeguard for systematic transfers; the applicable KVKK Article 9 transfer mechanism must also be completed."], "media-consent"],
      ["9. Cookies and external content", ["Storage needed for a requested language or authenticated session is used for essential functionality. External media such as Google Maps does not load before your choice. See the Cookie Policy for details."]],
      ["10. AI assistant", ["The assistant is limited to studio information. It cannot see live availability, enrol, charge, or provide medical/legal advice. If an external AI processor is enabled, its name and overseas processing are shown before chat. Make Art Studio does not save the chat history in its own database. Do not enter names, contact details, IDs, addresses or health information."], "ai-assistant"],
    ],
  },
  ru: {
    back: "На главную", title: "Уведомление KVKK о конфиденциальности", updated: "Обновлено",
    intro: "Здесь описана обработка данных по статье 10 турецкого Закона № 6698 (KVKK). Уведомление не является согласием; отдельное явное согласие запрашивается только там, где оно действительно требуется.",
    sections: [
      ["1. Оператор данных", [`Оператор: ${COMPANY.legalName}. Юридический адрес: ${COMPANY.registeredSeat.join(" ")}. Контакты: ${COMPANY.email}, ${COMPANY.phone}.`]],
      ["2. Какие данные", ["Для заявки могут обрабатываться имя и контакты родителя, язык, имя и дата рождения ребёнка, выбранное занятие/пакет, необязательные сведения об аллергии/здоровье, а также версия уведомления, время и IP для подтверждения и безопасности. ИИ обрабатывает только сообщения, которые вы решили отправить."]],
      ["3. Цели и основания", ["Заявки и преддоговорные действия обрабатываются по ст. 5/2(c) KVKK, обязательные записи по ст. 5/2(ç), безопасность — на основании соразмерного законного интереса. Сведения о здоровье ребёнка относятся к специальным категориям и вводятся только при отдельном явном согласии опекуна. Фото/видео и маркетинг всегда добровольны."]],
      ["4. Сбор", ["Данные поступают непосредственно от вас через формы, аккаунт, WhatsApp/телефон/email и ограниченные журналы безопасности. Необязательные поля можно оставить пустыми."]],
      ["5. Получатели и передача", ["Доступ имеют только уполномоченные сотрудники и необходимые поставщики хостинга, базы данных, email и уведомлений. Сведения о здоровье ребёнка не отправляются в Telegram или общие уведомления.", "Передача за рубеж не включается до оформления механизма по ст. 9 KVKK, например решения об адекватности или стандартного договора KVKK и уведомления. Экран согласия не заменяет гарантии для систематической передачи."]],
      ["6. Хранение", ["Незавершённые заявки хранятся до 2 лет, договорные/потребительские записи — установленный законом срок, подтверждения уведомлений и согласий — 3 года, журналы безопасности — только необходимый короткий срок. Затем данные удаляются или обезличиваются."]],
      ["7. Ваши права", [`Права по ст. 11 KVKK включают доступ, исправление, удаление, сведения о получателях, возражение против неблагоприятного исключительно автоматического анализа и возмещение при незаконной обработке. Обращайтесь по адресу ${COMPANY.email} или на юридический адрес; ответ предоставляется не позднее 30 дней.`]],
      ["8. Письменные отзывы, фотографии, аудио и видео", ["Письменный отзыв или цитата, фотография, аудио- или видеозапись, относящиеся к определённому или определяемому лицу, являются персональными данными. Студия может создавать, записывать, отбирать, редактировать, хранить и публиковать такие материалы для представления своей деятельности только на основании отдельного, конкретного, информированного и добровольного явного согласия взрослого либо уполномоченного родителя/опекуна ребёнка.", "Публикация на сайте и в официальных аккаунтах студии в социальных сетях — два отдельных, заранее не отмеченных выбора. Оба необязательны. Отказ или последующий отзыв не влияют на запись, занятия, цену или услуги. Родитель/опекун подтверждает полномочия действовать за ребёнка; также учитываются наилучшие интересы и обоснованное возражение ребёнка.", `Согласие на дальнейшее использование можно отозвать в любое время по адресу ${COMPANY.email}. Студия прекратит новое использование и в разумный срок удалит материал из контролируемых ею каналов, но не может гарантировать контроль над копиями, сохранёнными, распространёнными или повторно опубликованными другими лицами до удаления. Ограниченная запись о согласии может храниться для защиты законных требований.`, "Социальные платформы могут отдельно обрабатывать контент, данные аккаунта, устройства и взаимодействий по своим условиям. При передаче за рубеж явное согласие не считается единственной гарантией систематических передач; также оформляется применимый механизм по ст. 9 KVKK."], "media-consent"],
      ["9. Cookies и внешние материалы", ["Хранилище для выбранного языка и авторизованной сессии используется для необходимых функций. Google Maps не загружается без вашего выбора. Подробнее в Политике cookies."]],
      ["10. ИИ-ассистент", ["Ассистент отвечает только о студии и не видит свободные места, не записывает, не принимает оплату и не даёт медицинских/юридических советов. При внешнем ИИ до чата показываются поставщик и обработка за рубежом. История чата не сохраняется в базе Make Art Studio. Не вводите имена, контакты, документы, адреса или сведения о здоровье."], "ai-assistant"],
    ],
  },
} as const;

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = COPY[locale] ?? COPY.tr;
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex text-sm text-[var(--pink-dark)] hover:underline">← {t.back}</Link>
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-9">
          <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">{t.updated}: {COMPANY.lastUpdated} · {PRIVACY_NOTICE_VERSION}</p>
          <p className="mt-6 rounded-2xl bg-[var(--pink-light)]/55 p-4 text-sm leading-relaxed">{t.intro}</p>
          <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--muted)]">
            {t.sections.map((section) => {
              const [heading, paragraphs] = section;
              const id = section.length === 3 ? section[2] : undefined;
              return (
                <section key={heading} id={id} className="scroll-mt-8">
                  <h2 className="mb-3 text-base font-semibold text-[var(--foreground)]">{heading}</h2>
                  <div className="space-y-3">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                </section>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 border-t border-[var(--border)] pt-5 text-sm">
            <Link href="/cookies" className="text-[var(--pink-dark)] underline">Cookie Policy</Link>
            <Link href="/terms" className="text-[var(--pink-dark)] underline">Service terms</Link>
            <Link href="/imprint" className="text-[var(--pink-dark)] underline">Imprint</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
