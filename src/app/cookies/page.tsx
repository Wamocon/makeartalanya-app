import Link from "next/link";
import { getLocale } from "@/i18n/server";
import { COMPANY, COOKIE_NOTICE_VERSION } from "@/lib/legal";

export const metadata = { title: "Çerez Politikası · Cookie Policy | Make Art Studio" };

const COPY = {
  tr: {
    back: "Ana sayfaya dön",
    title: "Çerez ve Yerel Depolama Politikası",
    intro: "Sitede reklam veya davranışsal izleme çerezi kullanılmaz. Açıkça talep ettiğiniz işlevler için zorunlu depolama kullanılır; Google Haritalar gibi üçüncü taraf içerik yalnızca seçiminizden sonra yüklenir.",
    headers: ["Ad", "Amaç", "Teknoloji", "Süre", "Kategori"],
    rows: [
      ["lang", "Dil tercihi", "Birinci taraf çerez", "1 yıl", "İşlevsel"],
      ["Supabase auth", "Güvenli öğrenci/veli oturumu", "Birinci taraf oturum çerezleri", "Oturuma göre", "Kesinlikle gerekli"],
      ["admin_session", "Admin oturumu", "HttpOnly birinci taraf çerez", "8 saat", "Kesinlikle gerekli"],
      ["makeart_external_media_2026_07", "Google Haritalar yükleme tercihi", "Tarayıcı localStorage", "Tercih silinene kadar", "İsteğe bağlı"],
      ["makeart_ai_transfer_consent_2026_07", "Harici AI aktarım tercihi", "Tarayıcı localStorage", "Geri çekilene kadar", "İsteğe bağlı"],
    ],
    note: "Harici medya tercihinizi İletişim bölümündeki harita alanından geri çekebilirsiniz. AI tercihi sohbet penceresinden geri çekilebilir. Tarayıcı ayarlarından site verilerini silmek de tüm tarayıcı tercihlerini sıfırlar.",
    mediaTitle: "Fotoğraf, ses, video ve yazılı görüşler",
    media: [
      "Kayıt formunda verilen web sitesi veya sosyal medya yayın izni bir çerez tercihi değildir. Bu açık rıza sunucuda; seçilen kanal, metin sürümü ve ispat kaydıyla tutulur. Çerezleri silmek medya rızasını geri çekmez. Medya rızanızı makeartstudio.tr@gmail.com adresine yazarak geri çekebilirsiniz.",
      "Make Art Studio sunucularından doğrudan gösterilen fotoğraf/video tek başına üçüncü taraf çerez yerleştirmez. Instagram, YouTube veya başka bir sosyal ağ gömülü içeriği gelecekte eklenirse; IP, cihaz ve etkileşim verisi platforma gidebileceğinden içerik isteğe bağlı harici medya izni verilmeden yüklenmeyecektir. Yalnızca bir sosyal medya bağlantısına tıklamak sizi ilgili platforma götürür ve o andan itibaren platformun kendi çerez politikası uygulanır.",
    ],
  },
  en: {
    back: "Back to homepage",
    title: "Cookie and Local Storage Policy",
    intro: "The site does not use advertising or behavioural-tracking cookies. Essential storage supports features you request; third-party content such as Google Maps loads only after your choice.",
    headers: ["Name", "Purpose", "Technology", "Duration", "Category"],
    rows: [
      ["lang", "Language preference", "First-party cookie", "1 year", "Functional"],
      ["Supabase auth", "Secure student/parent session", "First-party session cookies", "Session-dependent", "Strictly necessary"],
      ["admin_session", "Admin session", "HttpOnly first-party cookie", "8 hours", "Strictly necessary"],
      ["makeart_external_media_2026_07", "Google Maps loading choice", "Browser localStorage", "Until cleared", "Optional"],
      ["makeart_ai_transfer_consent_2026_07", "External AI transfer choice", "Browser localStorage", "Until withdrawn", "Optional"],
    ],
    note: "Withdraw external-media permission in the map area of the Contact section and AI permission inside the assistant. Clearing this site's browser data also resets all browser choices.",
    mediaTitle: "Photographs, audio, video and written testimonials",
    media: [
      "A website or social-media publication choice made in the registration form is not a cookie choice. That explicit consent is stored server-side with the selected channel, wording version and evidence record. Clearing cookies does not withdraw media consent. Withdraw media consent by writing to makeartstudio.tr@gmail.com.",
      "Photos or videos served directly by Make Art Studio do not by themselves place third-party cookies. If embedded Instagram, YouTube or other social-network content is added later, it will not load before an optional external-media choice because the platform may receive IP, device and interaction data. Following a plain social-media link takes you to that platform, whose own cookie policy then applies.",
    ],
  },
  ru: {
    back: "На главную",
    title: "Политика cookies и локального хранилища",
    intro: "Сайт не использует рекламные или поведенческие cookies. Необходимое хранилище поддерживает запрошенные функции; Google Maps загружается только после вашего выбора.",
    headers: ["Название", "Цель", "Технология", "Срок", "Категория"],
    rows: [
      ["lang", "Выбранный язык", "Собственный cookie", "1 год", "Функциональный"],
      ["Supabase auth", "Защищённая сессия", "Сессионные cookies", "По сессии", "Необходимый"],
      ["admin_session", "Сессия администратора", "HttpOnly cookie", "8 часов", "Необходимый"],
      ["makeart_external_media_2026_07", "Разрешение Google Maps", "localStorage", "До удаления", "Необязательный"],
      ["makeart_ai_transfer_consent_2026_07", "Выбор внешнего ИИ", "localStorage", "До отзыва", "Необязательный"],
    ],
    note: "Разрешение карты отзывается в разделе контактов, разрешение ИИ — в окне ассистента. Удаление данных сайта в браузере сбрасывает все браузерные варианты.",
    mediaTitle: "Фотографии, аудио, видео и письменные отзывы",
    media: [
      "Выбор публикации на сайте или в социальных сетях в форме записи не является выбором cookies. Такое явное согласие хранится на сервере вместе с выбранным каналом, версией текста и записью для подтверждения. Удаление cookies не отзывает согласие на материалы. Для отзыва напишите на makeartstudio.tr@gmail.com.",
      "Фото и видео, загружаемые непосредственно с серверов Make Art Studio, сами по себе не устанавливают сторонние cookies. Если в будущем появится встроенный контент Instagram, YouTube или другой соцсети, он не будет загружаться без необязательного разрешения на внешние материалы, поскольку платформа может получить IP, данные устройства и взаимодействий. Обычная ссылка ведёт на платформу, после чего применяется её собственная политика cookies.",
    ],
  },
} as const;

export default async function CookiesPage() {
  const locale = await getLocale();
  const t = COPY[locale] ?? COPY.tr;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="mb-6 inline-flex text-sm text-[var(--pink-dark)] hover:underline">
          ← {t.back}
        </Link>
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-9">
          <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">{COMPANY.lastUpdated} · {COOKIE_NOTICE_VERSION}</p>
          <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">{t.intro}</p>

          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--foreground)]">
                  {t.headers.map((header) => <th key={header} className="p-3">{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-[var(--border)]/70 text-[var(--muted)]">
                    {row.map((cell) => <td key={cell} className="p-3 align-top">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 rounded-2xl bg-[var(--blue-light)]/50 p-4 text-sm leading-relaxed text-[var(--muted)]">{t.note}</p>

          <section className="mt-8 border-t border-[var(--border)] pt-7" aria-labelledby="media-and-cookies">
            <h2 id="media-and-cookies" className="text-lg font-semibold text-[var(--foreground)]">{t.mediaTitle}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
              {t.media.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>

          <div className="mt-7 flex flex-wrap gap-4 text-sm">
            <Link href="/privacy#media-consent" className="text-[var(--pink-dark)] underline">KVKK</Link>
            <Link href="/terms" className="text-[var(--pink-dark)] underline">Terms</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
