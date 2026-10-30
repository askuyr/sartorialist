/**
 * НАСТРОЙКИ САЙТА
 *
 * Быстрое переключение источника каталога:
 *   "photos" — локальные фотографии в assets/images/ (включено)
 *   "avito"  — объявления из JSON endpoint (подключим позже)
 *
 * Для GitHub Pages нельзя помещать client_secret Авито в браузерный код.
 * При подключении API используйте отдельный backend/serverless endpoint.
 */
export const CATALOG_SOURCE = "photos";

export const SITE_CONFIG = {
  avitoProfileUrl: "https://www.avito.ru/brands/i205036214",
  heroImage: "assets/images/editorial-hero.webp",
  // Заполнить URL защищённого endpoint при подключении Авито API.
  // Endpoint должен возвращать JSON-массив объектов { title, image, url }.
  avitoFeedUrl: "",
};

export const PHOTO_ITEMS = [
  { image: "assets/images/suit-01.webp", alt: "Тёмно-серый костюм с галстуком" },
  { image: "assets/images/suit-02.webp", alt: "Коричневый костюм в тонкую полоску" },
  { image: "assets/images/suit-03.webp", alt: "Тёмно-синий классический костюм" },
  { image: "assets/images/suit-04.webp", alt: "Светло-голубой костюм" },
  { image: "assets/images/suit-05.webp", alt: "Графитовый костюм" },
  { image: "assets/images/suit-06.webp", alt: "Синий костюм" },
  { image: "assets/images/suit-07.webp", alt: "Серый костюм в клетку" },
  { image: "assets/images/suit-08.webp", alt: "Тёмно-синий костюм с галстуком" },
  { image: "assets/images/suit-09.webp", alt: "Коричневый костюм" },
  { image: "assets/images/suit-10.webp", alt: "Светлый бежевый костюм" },
  { image: "assets/images/suit-11.webp", alt: "Голубой костюм в клетку" },
  { image: "assets/images/suit-12.webp", alt: "Тёмно-синий костюм" },
];
