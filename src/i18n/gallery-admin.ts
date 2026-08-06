import type { AdminLocale } from "./admin-translations";

/**
 * Strings for the gallery manager.
 *
 * A separate module rather than another branch of adminTranslations: that type
 * is one flat literal covering every screen, and adding thirty keys to it means
 * editing the same shape in four places for one feature.
 */
export interface GalleryAdminCopy {
  title: string;
  subtitle: string;
  upload: string;
  uploadHint: string;
  dropHere: string;
  preview: string;
  previewTitle: string;
  previewHint: string;
  exitPreview: string;
  empty: string;
  emptyHint: string;
  items: string;
  hidden: string;
  video: string;
  photo: string;
  selected: string;
  selectAll: string;
  clearSelection: string;
  show: string;
  hide: string;
  delete: string;
  edit: string;
  moveTo: string;
  cancel: string;
  save: string;
  saving: string;
  saved: string;
  close: string;
  undo: string;
  dragHint: string;
  keyboardHint: string;
  reordered: string;
  deleteConfirm: string;
  deleteConfirmMany: string;
  captions: string;
  captionHint: string;
  altText: string;
  altHint: string;
  category: string;
  group: string;
  noGroup: string;
  visibility: string;
  visibleOnSite: string;
  hiddenFromSite: string;
  uploading: string;
  processing: string;
  savingItem: string;
  uploadFailed: string;
  retry: string;
  dismiss: string;
  openOriginal: string;
  errorLoad: string;
  reload: string;
  unsaved: string;
  // Category management
  addingTo: string;
  newCategory: string;
  newCategoryTitle: string;
  renameCategory: string;
  categoryNameHint: string;
  categoryCreated: string;
  categoryRenamed: string;
  deleteCategory: string;
  deleteCategoryEmpty: string;
  deleteCategoryFull: string;
  moveItemsTo: string;
  categoryDeleted: string;
  categorySettings: string;
  categoryHidden: string;
  categoryHiddenNote: string;
  create: string;
  emptyUploadCta: string;
  lastCategory: string;
}

export const galleryAdminCopy: Record<AdminLocale, GalleryAdminCopy> = {
  en: {
    title: "Gallery",
    subtitle: "Arrange, edit and publish what visitors see on the website",
    upload: "Add photos or video",
    uploadHint: "JPEG, PNG, WebP, GIF or MP4/WebM video. Photos are resized in your browser before uploading.",
    dropHere: "Drop to add to this category",
    preview: "Preview site",
    previewTitle: "This is the live website",
    previewHint: "Exactly what visitors see, with your unsaved order applied.",
    exitPreview: "Back to editing",
    empty: "Nothing here yet",
    emptyHint: "Add the first photo or video to this category.",
    items: "items",
    hidden: "Hidden",
    video: "Video",
    photo: "Photo",
    selected: "selected",
    selectAll: "Select all",
    clearSelection: "Clear",
    show: "Show on site",
    hide: "Hide from site",
    delete: "Delete",
    edit: "Edit",
    moveTo: "Move to",
    cancel: "Cancel",
    save: "Save changes",
    saving: "Saving…",
    saved: "Saved",
    close: "Close",
    undo: "Undo",
    dragHint: "Drag a tile to reorder. The first tile appears first on the website.",
    keyboardHint: "Press Space to pick a tile up, arrow keys to move it, Space again to drop it.",
    reordered: "Order saved",
    deleteConfirm: "Delete this permanently? The file is removed and this cannot be undone.",
    deleteConfirmMany: "Delete these permanently? The files are removed and this cannot be undone.",
    captions: "Caption",
    captionHint: "Shown under the photo in the lightbox. Optional.",
    altText: "Alt text",
    altHint: "Describes the picture to screen readers and when images fail to load.",
    category: "Category",
    group: "Group",
    noGroup: "No group",
    visibility: "Visibility",
    visibleOnSite: "Visible on the website",
    hiddenFromSite: "Hidden from the website",
    uploading: "Uploading",
    processing: "Preparing",
    savingItem: "Finishing",
    uploadFailed: "Upload failed",
    retry: "Try again",
    dismiss: "Dismiss",
    openOriginal: "Open full size",
    errorLoad: "The gallery could not be loaded.",
    reload: "Reload",
    unsaved: "Saving your order…",
    addingTo: "New uploads go to",
    newCategory: "New category",
    newCategoryTitle: "Create a category",
    renameCategory: "Rename category",
    categoryNameHint: "This is the heading visitors see above the row. All three languages are required.",
    categoryCreated: "Category created",
    categoryRenamed: "Category renamed",
    deleteCategory: "Delete category",
    deleteCategoryEmpty: "Delete this category? It is empty, so nothing else changes.",
    deleteCategoryFull: "This category still has photos. Choose where to move them — they will be kept, not deleted.",
    moveItemsTo: "Move its photos to",
    categoryDeleted: "Category deleted",
    categorySettings: "Category settings",
    categoryHidden: "Hidden from the website",
    categoryHiddenNote: "The whole row disappears from the site. Photos are kept.",
    create: "Create",
    emptyUploadCta: "Add the first photo or video",
    lastCategory: "This is the only category — create another before deleting this one.",
  },
  tr: {
    title: "Galeri",
    subtitle: "Ziyaretçilerin sitede gördüklerini düzenleyin ve yayınlayın",
    upload: "Fotoğraf veya video ekle",
    uploadHint: "JPEG, PNG, WebP, GIF veya MP4/WebM video. Fotoğraflar yüklenmeden önce tarayıcınızda küçültülür.",
    dropHere: "Bu kategoriye eklemek için bırakın",
    preview: "Siteyi önizle",
    previewTitle: "Bu, yayındaki sitenin görünümü",
    previewHint: "Ziyaretçilerin gördüğünün aynısı, sizin sıralamanızla.",
    exitPreview: "Düzenlemeye dön",
    empty: "Burada henüz bir şey yok",
    emptyHint: "Bu kategoriye ilk fotoğrafı veya videoyu ekleyin.",
    items: "öğe",
    hidden: "Gizli",
    video: "Video",
    photo: "Fotoğraf",
    selected: "seçili",
    selectAll: "Tümünü seç",
    clearSelection: "Temizle",
    show: "Sitede göster",
    hide: "Siteden gizle",
    delete: "Sil",
    edit: "Düzenle",
    moveTo: "Taşı",
    cancel: "Vazgeç",
    save: "Değişiklikleri kaydet",
    saving: "Kaydediliyor…",
    saved: "Kaydedildi",
    close: "Kapat",
    undo: "Geri al",
    dragHint: "Sıralamak için bir kareyi sürükleyin. İlk kare sitede en başta görünür.",
    reordered: "Sıralama kaydedildi",
    keyboardHint: "Kareyi almak için Boşluk, taşımak için yön tuşları, bırakmak için tekrar Boşluk.",
    deleteConfirm: "Kalıcı olarak silinsin mi? Dosya kaldırılır ve bu geri alınamaz.",
    deleteConfirmMany: "Bunlar kalıcı olarak silinsin mi? Dosyalar kaldırılır ve bu geri alınamaz.",
    captions: "Açıklama",
    captionHint: "Büyük görünümde fotoğrafın altında gösterilir. İsteğe bağlı.",
    altText: "Alternatif metin",
    altHint: "Ekran okuyucular ve görsel yüklenmediğinde resmi tarif eder.",
    category: "Kategori",
    group: "Grup",
    noGroup: "Grup yok",
    visibility: "Görünürlük",
    visibleOnSite: "Sitede görünür",
    hiddenFromSite: "Siteden gizli",
    uploading: "Yükleniyor",
    processing: "Hazırlanıyor",
    savingItem: "Tamamlanıyor",
    uploadFailed: "Yükleme başarısız",
    retry: "Tekrar dene",
    dismiss: "Kapat",
    openOriginal: "Tam boyutta aç",
    errorLoad: "Galeri yüklenemedi.",
    reload: "Yenile",
    unsaved: "Sıralamanız kaydediliyor…",
    addingTo: "Yeni yüklemeler şuraya eklenir",
    newCategory: "Yeni kategori",
    newCategoryTitle: "Kategori oluştur",
    renameCategory: "Kategoriyi yeniden adlandır",
    categoryNameHint: "Bu, ziyaretçilerin satırın üstünde gördüğü başlıktır. Üç dil de gereklidir.",
    categoryCreated: "Kategori oluşturuldu",
    categoryRenamed: "Kategori yeniden adlandırıldı",
    deleteCategory: "Kategoriyi sil",
    deleteCategoryEmpty: "Bu kategori silinsin mi? Boş olduğu için başka bir şey değişmez.",
    deleteCategoryFull: "Bu kategoride hâlâ fotoğraf var. Nereye taşınacağını seçin — silinmezler, korunurlar.",
    moveItemsTo: "Fotoğraflarını şuraya taşı",
    categoryDeleted: "Kategori silindi",
    categorySettings: "Kategori ayarları",
    categoryHidden: "Siteden gizli",
    categoryHiddenNote: "Satırın tamamı siteden kaybolur. Fotoğraflar korunur.",
    create: "Oluştur",
    emptyUploadCta: "İlk fotoğrafı veya videoyu ekleyin",
    lastCategory: "Bu tek kategori — silmeden önce başka bir tane oluşturun.",
  },
  ru: {
    title: "Галерея",
    subtitle: "Расставьте, отредактируйте и опубликуйте то, что видят посетители",
    upload: "Добавить фото или видео",
    uploadHint: "JPEG, PNG, WebP, GIF или видео MP4/WebM. Фото уменьшаются в браузере перед загрузкой.",
    dropHere: "Отпустите, чтобы добавить в эту категорию",
    preview: "Предпросмотр сайта",
    previewTitle: "Так выглядит живой сайт",
    previewHint: "Ровно то, что видят посетители, в вашем порядке.",
    exitPreview: "Вернуться к редактированию",
    empty: "Здесь пока пусто",
    emptyHint: "Добавьте первое фото или видео в эту категорию.",
    items: "элементов",
    hidden: "Скрыто",
    video: "Видео",
    photo: "Фото",
    selected: "выбрано",
    selectAll: "Выбрать все",
    clearSelection: "Снять",
    show: "Показать на сайте",
    hide: "Скрыть с сайта",
    delete: "Удалить",
    edit: "Изменить",
    moveTo: "Переместить",
    cancel: "Отмена",
    save: "Сохранить",
    saving: "Сохранение…",
    saved: "Сохранено",
    close: "Закрыть",
    undo: "Вернуть",
    dragHint: "Перетащите плитку, чтобы изменить порядок. Первая плитка идёт первой на сайте.",
    keyboardHint: "Пробел — взять плитку, стрелки — переместить, пробел — отпустить.",
    reordered: "Порядок сохранён",
    deleteConfirm: "Удалить навсегда? Файл будет стёрт, отменить будет нельзя.",
    deleteConfirmMany: "Удалить это навсегда? Файлы будут стёрты, отменить будет нельзя.",
    captions: "Подпись",
    captionHint: "Показывается под фото в полноэкранном просмотре. Необязательно.",
    altText: "Альтернативный текст",
    altHint: "Описывает изображение для скринридеров и когда картинка не загрузилась.",
    category: "Категория",
    group: "Группа",
    noGroup: "Без группы",
    visibility: "Видимость",
    visibleOnSite: "Видно на сайте",
    hiddenFromSite: "Скрыто с сайта",
    uploading: "Загрузка",
    processing: "Подготовка",
    savingItem: "Завершение",
    uploadFailed: "Не удалось загрузить",
    retry: "Повторить",
    dismiss: "Закрыть",
    openOriginal: "Открыть оригинал",
    errorLoad: "Не удалось загрузить галерею.",
    reload: "Обновить",
    unsaved: "Сохраняем порядок…",
    addingTo: "Новые загрузки попадут в",
    newCategory: "Новая категория",
    newCategoryTitle: "Создать категорию",
    renameCategory: "Переименовать категорию",
    categoryNameHint: "Это заголовок над рядом, который видят посетители. Нужны все три языка.",
    categoryCreated: "Категория создана",
    categoryRenamed: "Категория переименована",
    deleteCategory: "Удалить категорию",
    deleteCategoryEmpty: "Удалить эту категорию? Она пуста, больше ничего не изменится.",
    deleteCategoryFull: "В этой категории ещё есть фото. Выберите, куда их перенести — они сохранятся, а не удалятся.",
    moveItemsTo: "Перенести фото в",
    categoryDeleted: "Категория удалена",
    categorySettings: "Настройки категории",
    categoryHidden: "Скрыто с сайта",
    categoryHiddenNote: "Весь ряд исчезнет с сайта. Фото сохранятся.",
    create: "Создать",
    emptyUploadCta: "Добавьте первое фото или видео",
    lastCategory: "Это единственная категория — создайте другую, прежде чем удалять эту.",
  },
};
