import Link from "next/link";
import { getLocale } from "@/i18n/server";
import { COMPANY, TERMS_VERSION } from "@/lib/legal";

export const metadata = { title: "Ön Bilgilendirme ve Hizmet Koşulları | Make Art Studio" };

const COPY = {
  tr: {
    back: "Ana sayfaya dön", title: "Ön Bilgilendirme ve Hizmet Koşulları", updated: "Son güncelleme",
    alert: "Önemli: Bu web sitesindeki rezervasyon/kayıt formu bağlayıcı bir sipariş değildir ve ödeme yükümlülüğü doğurmaz. Sözleşme ancak stüdyo gün, saat, toplam fiyat ve ödeme yöntemini kalıcı veri saklayıcısıyla teyit ettikten ve siz ayrıca kabul ettikten sonra kurulur.",
    sections: [
      ["Sağlayıcı", [`${COMPANY.legalName}, ${COMPANY.registeredSeat.join(" ")}. Atölye: ${COMPANY.atelier.join(" ")}. Telefon: ${COMPANY.phone}. E-posta: ${COMPANY.email}. Vergi dairesi/no: ${COMPANY.taxOffice} / ${COMPANY.taxNumber}.`]],
      ["Hukuki çerçeve", ["Bu bilgilendirme; 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un 48. maddesi, Mesafeli Sözleşmeler Yönetmeliği ve kişisel veriler bakımından 6698 sayılı KVKK dikkate alınarak hazırlanmıştır. Web formu tek başına mesafeli sözleşme kurmaz; bağlayıcı teklif ve kabul daha sonra kalıcı veri saklayıcısıyla ayrıca yapılır."]],
      ["Hizmetin temel nitelikleri", ["Resim, çizim, uygulamalı sanat, el sanatları, satranç ve birebir dersler çocuklar ve yetişkinler için sunulur. Paket, öğretmen, süre, başlangıç tarihi, kapasite ve kesin ders saatleri sözleşme öncesinde stüdyo tarafından ayrıca teyit edilir."]],
      ["Fiyat ve ödeme", ["Güncel satış fiyatı, vergiler ve varsa ek ücretler dâhil toplam tutar olarak Türk lirası (TL/₺) cinsinden sözleşme kurulmadan önce açıkça bildirilir. Bu sitede çevrimiçi ödeme alınmaz ve form düğmesi ödeme yükümlülüğü doğurmaz."]],
      ["Sözleşmenin kurulması ve ifa", ["Form gönderimi yalnızca iletişim/kayıt talebidir. Stüdyo teyidi ve tüketicinin ayrıca kabulü olmadan kontenjan veya ders saati garanti edilmez. Hizmet, kararlaştırılan stüdyo adresinde ve teyit edilen tarihlerde sunulur."]],
      ["Cayma hakkı", ["Mesafeli olarak bir hizmet sözleşmesi kurulursa tüketici, sözleşmenin kurulduğu tarihten itibaren 14 gün içinde gerekçe göstermeden cayabilir. Bildirim telefonla değil, e-posta veya diğer kalıcı veri saklayıcısıyla ${COMPANY.email} adresine yapılmalıdır.", "Hizmetin 14 günlük süre dolmadan başlaması istenirse bu talep ve cayma hakkının etkisine ilişkin kabul ayrıca alınır. Hizmet tüketicinin önceden açık onayıyla tamamen ifa edilmişse mevzuattaki cayma istisnası uygulanabilir."]],
      ["İptal, değişiklik ve uyuşmazlık", ["Ders değişikliği, dondurma ve iptal koşulları, seçilen pakete ilişkin sözleşmede açıkça teyit edilir. Şikâyetler önce stüdyoya iletilebilir; tüketici ayrıca parasal sınırlar dâhilinde Tüketici Hakem Heyetine veya Tüketici Mahkemesine başvurabilir."]],
      ["Kayıtların saklanması", ["Mesafeli sözleşme kurulursa ön bilgilendirme, onay, cayma ve işlem belgeleri mevzuat gereği en az 3 yıl saklanır. Kişisel veriler ayrıca KVKK Aydınlatma Metni'ne göre işlenir."]],
    ],
  },
  en: {
    back: "Back to homepage", title: "Pre-contract Information and Service Terms", updated: "Last updated",
    alert: "Important: submitting a booking or registration form is a non-binding enquiry and creates no payment obligation. A contract is formed only after the studio confirms the schedule, total price and payment method on a durable medium and you separately accept them.",
    sections: [
      ["Provider", [`${COMPANY.legalName}, ${COMPANY.registeredSeat.join(" ")}. Studio: ${COMPANY.atelier.join(" ")}. Phone: ${COMPANY.phone}. Email: ${COMPANY.email}. Tax office/no.: ${COMPANY.taxOffice} / ${COMPANY.taxNumber}.`]],
      ["Legal framework", ["This information reflects Article 48 of Turkish Consumer Protection Law No. 6502, the Distance Contracts Regulation and, for personal data, KVKK No. 6698. The web form alone does not create a distance contract; any binding offer and acceptance are completed separately on a durable medium."]],
      ["Service", ["Painting, drawing, applied arts, crafts, chess and individual lessons are offered for children and adults. Package, teacher, duration, start date, capacity and exact lesson times are separately confirmed before contract."]],
      ["Price and payment", ["The current total, including taxes and any additional charges, is disclosed in Turkish lira (TL/₺) before contract. The website does not take online payment and the form button does not create an obligation to pay."]],
      ["Contract and performance", ["A form submission is only a request. No place or time is guaranteed before studio confirmation and separate consumer acceptance. Services are supplied at the confirmed studio address and dates."]],
      ["Withdrawal", [`For a distance service contract, the consumer generally has 14 days from contract formation to withdraw without giving a reason. Notice should be sent on a durable medium, such as email to ${COMPANY.email}, rather than by telephone. A separate request and acknowledgment is obtained if performance should begin during that period; the statutory exception may apply after full performance with prior express approval.`]],
      ["Changes and disputes", ["Package-specific change, freeze and cancellation terms are confirmed in the contract. Consumers may contact the studio first and retain access to the competent Consumer Arbitration Committee or Consumer Court within applicable thresholds."]],
      ["Records", ["If a distance contract is formed, pre-information, acceptance, withdrawal and transaction records are retained for at least 3 years as required. Personal data is handled under the KVKK Privacy Notice."]],
    ],
  },
  ru: {
    back: "На главную", title: "Преддоговорная информация и условия услуг", updated: "Обновлено",
    alert: "Важно: отправка формы является необязывающим запросом и не создаёт обязанности платить. Договор заключается только после подтверждения студией расписания, полной цены и способа оплаты на долговечном носителе и вашего отдельного согласия.",
    sections: [
      ["Исполнитель", [`${COMPANY.legalName}, ${COMPANY.registeredSeat.join(" ")}. Студия: ${COMPANY.atelier.join(" ")}. Телефон: ${COMPANY.phone}. Email: ${COMPANY.email}. Налоговая/номер: ${COMPANY.taxOffice} / ${COMPANY.taxNumber}.`]],
      ["Правовая основа", ["Информация подготовлена с учётом статьи 48 турецкого Закона № 6502 о защите потребителей, Положения о дистанционных договорах и Закона KVKK № 6698. Отправка веб-формы сама по себе не заключает дистанционный договор; обязательные оферта и акцепт оформляются отдельно на долговечном носителе."]],
      ["Услуга", ["Живопись, рисунок, прикладное творчество, рукоделие, шахматы и индивидуальные занятия для детей и взрослых. Пакет, преподаватель, длительность, начало, вместимость и точное время отдельно подтверждаются до договора."]],
      ["Цена и оплата", ["Актуальная итоговая цена, включая налоги и дополнительные сборы, сообщается в турецких лирах (TL/₺) до договора. Онлайн-оплата на сайте не принимается, кнопка формы не создаёт обязанности платить."]],
      ["Заключение и оказание", ["Форма — только запрос. Место и время не гарантируются без подтверждения студии и отдельного принятия клиентом. Услуга оказывается по подтверждённому адресу и датам."]],
      ["Отказ", [`При дистанционном договоре на услугу потребитель обычно может отказаться в течение 14 дней с даты договора. Заявление направляется на долговечном носителе, например на ${COMPANY.email}, а не по телефону. Для начала услуги до истечения срока отдельно запрашиваются просьба и подтверждение; после полного исполнения с предварительным явным одобрением может применяться законное исключение.`]],
      ["Изменения и споры", ["Условия переноса, заморозки и отмены подтверждаются в договоре пакета. Сохраняется право обращения в компетентный потребительский арбитражный комитет или суд."]],
      ["Записи", ["При дистанционном договоре преддоговорная информация, принятие, отказ и документы операции хранятся не менее 3 лет. Данные обрабатываются по уведомлению KVKK."]],
    ],
  },
} as const;

export default async function TermsPage() {
  const locale = await getLocale();
  const t = COPY[locale] ?? COPY.tr;
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex text-sm text-[var(--pink-dark)] hover:underline">← {t.back}</Link>
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-9">
          <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">{t.updated}: {COMPANY.lastUpdated} · {TERMS_VERSION}</p>
          <p className="mt-6 rounded-2xl border border-[var(--pink)]/30 bg-[var(--pink-light)]/60 p-4 text-sm font-medium leading-relaxed">{t.alert}</p>
          <div className="mt-8 space-y-7 text-sm leading-relaxed text-[var(--muted)]">
            {t.sections.map(([heading, paragraphs]) => <section key={heading}><h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">{heading}</h2><div className="space-y-3">{paragraphs.map((p) => <p key={p}>{p}</p>)}</div></section>)}
          </div>
          <div className="mt-8 flex gap-4 border-t border-[var(--border)] pt-5 text-sm"><Link href="/privacy" className="text-[var(--pink-dark)] underline">KVKK</Link><Link href="/cookies" className="text-[var(--pink-dark)] underline">Cookies</Link><Link href="/imprint" className="text-[var(--pink-dark)] underline">Imprint</Link></div>
        </div>
      </article>
    </main>
  );
}
