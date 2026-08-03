export type AdminLocale = "en" | "tr" | "ru";

export const adminTranslations: Record<AdminLocale, {
  greeting: { morning: string; afternoon: string; evening: string };
  metrics: {
    totalBookings: string;
    allTime: string;
    pending: string;
    confirmed: string;
    cancelled: string;
    completed: string;
    ofTotal: string;
    cancelRate: string;
  };
  analytics: string;
  recentBookings: string;
  bookings: string;
  table: { guest: string; phone: string; status: string; actions: string; search: string; filter: string; allStatuses: string; noMatch: string; noBookings: string; confirm: string; cancel: string; delete: string };
  sidebar: {
    overview: string;
    dashboard: string;
    today: string;
    classes: string;
    schedule: string;
    sessions: string;
    attendance: string;
    clients: string;
    registrations: string;
    subscriptions: string;
    payments: string;
    system: string;
    messages: string;
    notifications: string;
    content: string;
    media: string;
    settings: string;
    handbook: string;
    language: string;
  };
  viewSite: string;
  signOut: string;
  charts: { statusDistribution: string; last7Days: string; byLanguage: string; total: string; pending: string; confirmed: string; cancelled: string; completed: string };
}> = {
  en: {
    greeting: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
    metrics: {
      // These cards are fed from `registrations`, not from bookings — the
      // wording follows that pipeline (new → contacted → enrolled → archived).
      totalBookings: "Registrations",
      allTime: "All time",
      pending: "New",
      confirmed: "Enrolled",
      cancelled: "Archived",
      completed: "contacted",
      ofTotal: "awaiting reply",
      cancelRate: "archived",
    },
    analytics: "Analytics",
    recentBookings: "Recent Bookings",
    bookings: "bookings",
    table: { guest: "Guest", phone: "Phone", status: "Status", actions: "Actions", search: "Search bookings...", filter: "Filter", allStatuses: "All statuses", noMatch: "No bookings match your search", noBookings: "No booking requests yet", confirm: "Confirm", cancel: "Cancel", delete: "Delete" },
    sidebar: {
      overview: "Overview",
      dashboard: "Dashboard",
      today: "Today",
      classes: "Classes",
      schedule: "Schedule",
      sessions: "Sessions",
      attendance: "Attendance",
      clients: "Clients",
      registrations: "Registrations",
      subscriptions: "Subscriptions",
      payments: "Payments",
      system: "System",
      messages: "Messages",
      notifications: "Notifications",
      content: "Content",
      media: "Media",
      settings: "Settings",
      handbook: "Manual",
      language: "Language",
    },
    viewSite: "View Site",
    signOut: "Sign Out",
    charts: { statusDistribution: "Status Distribution", last7Days: "Last 7 Days", byLanguage: "By Language", total: "total", pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed" },
  },
  tr: {
    greeting: { morning: "Günaydın", afternoon: "İyi günler", evening: "İyi akşamlar" },
    metrics: {
      totalBookings: "Kayıtlar",
      allTime: "Tüm zamanlar",
      pending: "Yeni",
      confirmed: "Kayıtlı",
      cancelled: "Arşiv",
      completed: "iletişime geçildi",
      ofTotal: "yanıt bekliyor",
      cancelRate: "arşivlendi",
    },
    analytics: "Analitik",
    recentBookings: "Son Rezervasyonlar",
    bookings: "rezervasyon",
    table: { guest: "Misafir", phone: "Telefon", status: "Durum", actions: "İşlemler", search: "Rezervasyon ara...", filter: "Filtre", allStatuses: "Tüm durumlar", noMatch: "Aramanızla eşleşen rezervasyon yok", noBookings: "Henüz rezervasyon yok", confirm: "Onayla", cancel: "İptal", delete: "Sil" },
    sidebar: {
      overview: "Genel Bakış",
      dashboard: "Panel",
      today: "Bugün",
      classes: "Dersler",
      schedule: "Takvim",
      sessions: "Seanslar",
      attendance: "Katılım",
      clients: "Müşteriler",
      registrations: "Kayıtlar",
      subscriptions: "Abonelikler",
      payments: "Ödemeler",
      system: "Sistem",
      messages: "Mesajlar",
      notifications: "Bildirimler",
      content: "İçerik",
      media: "Medya",
      settings: "Ayarlar",
      handbook: "El Kitabı",
      language: "Dil",
    },
    viewSite: "Siteyi Gör",
    signOut: "Çıkış",
    charts: { statusDistribution: "Durum Dağılımı", last7Days: "Son 7 Gün", byLanguage: "Dile Göre", total: "toplam", pending: "Bekleyen", confirmed: "Onaylı", cancelled: "İptal", completed: "Tamamlandı" },
  },
  ru: {
    greeting: { morning: "Доброе утро", afternoon: "Добрый день", evening: "Добрый вечер" },
    metrics: {
      totalBookings: "Заявки",
      allTime: "За всё время",
      pending: "Новые",
      confirmed: "Зачислены",
      cancelled: "В архиве",
      completed: "связались",
      ofTotal: "ждут ответа",
      cancelRate: "в архиве",
    },
    analytics: "Аналитика",
    recentBookings: "Последние бронирования",
    bookings: "бронирований",
    table: { guest: "Гость", phone: "Телефон", status: "Статус", actions: "Действия", search: "Поиск бронирований...", filter: "Фильтр", allStatuses: "Все статусы", noMatch: "Нет совпадений", noBookings: "Бронирований пока нет", confirm: "Подтвердить", cancel: "Отменить", delete: "Удалить" },
    sidebar: {
      overview: "Обзор",
      dashboard: "Панель",
      today: "Сегодня",
      classes: "Занятия",
      schedule: "Расписание",
      sessions: "Сеансы",
      attendance: "Посещаемость",
      clients: "Клиенты",
      registrations: "Заявки",
      subscriptions: "Подписки",
      payments: "Платежи",
      system: "Система",
      messages: "Сообщения",
      notifications: "Уведомления",
      content: "Контент",
      media: "Медиа",
      settings: "Настройки",
      handbook: "Руководство",
      language: "Язык",
    },
    viewSite: "Сайт",
    signOut: "Выйти",
    charts: { statusDistribution: "Распределение статусов", last7Days: "Последние 7 дней", byLanguage: "По языку", total: "всего", pending: "Ожидают", confirmed: "Подтверждено", cancelled: "Отменено", completed: "Завершено" },
  },
};
