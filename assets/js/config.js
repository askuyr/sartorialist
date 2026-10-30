/**
 * НАСТРОЙКИ САЙТА
 *
 * Быстрое переключение каталога:
 *   "photos" — локальные фотографии из assets/images/ (режим по умолчанию)
 *   "avito"  — объявления из JSON endpoint (подключим позже)
 *
 * Не размещайте client_secret Авито в публичном коде GitHub Pages.
 * Для API потребуется отдельный защищённый backend/serverless endpoint.
 */
export const CATALOG_SOURCE = "photos";

export const SITE_CONFIG = {
  avitoProfileUrl: "https://www.avito.ru/brands/i205036214",
  avitoFeedUrl: "",
};

export const PHOTO_ITEMS = [
  { title: "Модель 01", image: "assets/images/suit-01.webp", alt: "Классический серый костюм" },
  { title: "Модель 02", image: "assets/images/suit-02.webp", alt: "Коричневый костюм в тонкую полоску" },
  { title: "Модель 03", image: "assets/images/suit-03.webp", alt: "Тёмно-синий костюм" },
  { title: "Модель 04", image: "assets/images/suit-04.webp", alt: "Светло-голубой костюм" },
  { title: "Модель 05", image: "assets/images/suit-05.webp", alt: "Графитовый костюм" },
  { title: "Модель 06", image: "assets/images/suit-06.webp", alt: "Синий костюм" },
  { title: "Модель 07", image: "assets/images/suit-07.webp", alt: "Серый костюм" },
  { title: "Модель 08", image: "assets/images/suit-08.webp", alt: "Тёмно-синий костюм" },
  { title: "Модель 09", image: "assets/images/suit-09.webp", alt: "Коричневый костюм" },
  { title: "Модель 10", image: "assets/images/suit-10.webp", alt: "Светлый костюм" },
  { title: "Модель 11", image: "assets/images/suit-11.webp", alt: "Костюм в клетку" },
  { title: "Модель 12", image: "assets/images/suit-12.webp", alt: "Классический синий костюм" },
];
