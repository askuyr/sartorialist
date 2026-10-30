/**
 * НАСТРОЙКИ САЙТА
 * Для переключения источника каталога поменяйте только CATALOG_SOURCE:
 *   "photos" — фотографии из PHOTO_ITEMS (режим включён сейчас)
 *   "avito"  — JSON-лента с вашего серверного endpoint
 *
 * ВАЖНО: GitHub Pages — статический хостинг. Не помещайте client_secret Авито
 * в этот файл или любой другой frontend-код. Для API понадобится отдельный
 * безопасный backend/serverless endpoint, который вернёт JSON с товарами.
 */
export const CATALOG_SOURCE = "photos";

export const SITE_CONFIG = {
  avitoProfileUrl: "https://www.avito.ru/brands/i205036214?gdlkerfdnwq=101&page_from=from_item_header&iid=8242877395&page_from=from_item_card&iid=8242877395",
  galleryUrl: "https://ellenutelle.gallery.photo/gallery/maksim-kostumy-14rmew/",
  // Заполнить адресом backend endpoint при подключении Avito API.
  // Endpoint должен возвращать массив объектов: { title, image, url }.
  avitoFeedUrl: "",
};

// Сейчас из переданной галереи доступно одно изображение с деталями костюма.
// После получения остальных фото добавляйте их сюда, лучше как локальные файлы
// в assets/images/, чтобы сайт не зависел от сторонней фотогалереи.
export const PHOTO_ITEMS = [
  {
    image: "https://storage.vigbo.tech/p/w1440/gallery-photo/159b739a-54a8-43a5-8bfe-60c70a3631d8/8095d2fd-0609-465d-89c0-8b25c8460548/original/7AxxRTrYqxiQ5x3CpnGe_.jpg",
    alt: "Деталь тёмного костюма в тонкую полоску",
  },
];
