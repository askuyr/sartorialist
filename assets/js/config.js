/**
 * Быстрое переключение источника каталога:
 * "photos" — фотографии из assets/images/ (сейчас включено)
 * "avito" — объявления из защищённого JSON endpoint (подключим позднее)
 */
export const CATALOG_SOURCE = "photos";

export const SITE_CONFIG = {
  avitoProfileUrl: "https://www.avito.ru/brands/i205036214",
  // Заполняется после создания backend endpoint. Не вставлять client_secret сюда.
  avitoFeedUrl: "",
};

export const PHOTO_ITEMS = [
  { image: "assets/images/suit-01.webp", alt: "Тёмно-серый мужской костюм" },
  { image: "assets/images/suit-02.webp", alt: "Коричневый мужской костюм" },
  { image: "assets/images/suit-03.webp", alt: "Тёмно-синий мужской костюм" },
  { image: "assets/images/suit-04.webp", alt: "Светло-голубой мужской костюм" },
  { image: "assets/images/suit-05.webp", alt: "Графитовый мужской костюм" },
  { image: "assets/images/suit-06.webp", alt: "Синий мужской костюм" },
  { image: "assets/images/suit-07.webp", alt: "Серый мужской костюм" },
  { image: "assets/images/suit-08.webp", alt: "Тёмно-синий мужской костюм" },
  { image: "assets/images/suit-09.webp", alt: "Коричневый мужской костюм" },
  { image: "assets/images/suit-10.webp", alt: "Светлый мужской костюм" },
  { image: "assets/images/suit-11.webp", alt: "Мужской костюм в клетку" },
  { image: "assets/images/suit-12.webp", alt: "Классический синий мужской костюм" },
];
