/**
 * Источник каталога:
 * "avito" — объявления и цены из data/avito-items.json (файл собирает tools/sync-avito.mjs).
 *            Если файл пуст или недоступен — автоматический откат на локальные фотографии.
 * "photos" — только локальные фотографии из assets/images/
 * "feed"   — загрузка объявлений с защищённого backend endpoint (SITE_CONFIG.avitoFeedUrl)
 */
export const CATALOG_SOURCE = "avito";

export const SITE_CONFIG = {
  phone: "+79312992222",
  avitoProfileUrl: "https://www.avito.ru/brands/i205036214",
  galleryUrl: "https://ellenutelle.gallery.photo/gallery/maksim-kostumy-14rmew/",
  // JSON с объявлениями и ценами, который собирает tools/sync-avito.mjs
  avitoDataUrl: "data/avito-items.json",
  // Заполняется после создания backend endpoint. Не вставлять client_secret сюда.
  avitoFeedUrl: "",
};

export const PHOTO_ITEMS = [
  { image: "assets/images/suit-01.webp", name: "Тёмно-серый костюм", alt: "Тёмно-серый мужской костюм" },
  { image: "assets/images/suit-02.webp", name: "Коричневый костюм", alt: "Коричневый мужской костюм" },
  { image: "assets/images/suit-03.webp", name: "Тёмно-синий костюм", alt: "Тёмно-синий мужской костюм" },
  { image: "assets/images/suit-04.webp", name: "Светло-голубой костюм", alt: "Светло-голубой мужской костюм" },
  { image: "assets/images/suit-05.webp", name: "Графитовый костюм", alt: "Графитовый мужской костюм" },
  { image: "assets/images/suit-06.webp", name: "Синий костюм", alt: "Синий мужской костюм" },
  { image: "assets/images/suit-07.webp", name: "Серый костюм", alt: "Серый мужской костюм" },
  { image: "assets/images/suit-08.webp", name: "Тёмно-синий костюм", alt: "Тёмно-синий мужской костюм" },
  { image: "assets/images/suit-09.webp", name: "Коричневый костюм", alt: "Коричневый мужской костюм" },
  { image: "assets/images/suit-10.webp", name: "Светлый костюм", alt: "Светлый мужской костюм" },
  { image: "assets/images/suit-11.webp", name: "Костюм в клетку", alt: "Мужской костюм в клетку" },
  { image: "assets/images/suit-12.webp", name: "Классический синий костюм", alt: "Классический синий мужской костюм" },
  { image: "assets/images/suit-13.webp", name: "Тёмно-синий костюм в полоску", alt: "Тёмно-синий мужской костюм в светлую полоску" },
  { image: "assets/images/suit-14.webp", name: "Коричневый костюм с платком", alt: "Коричневый мужской костюм с нагрудным платком" },
  { image: "assets/images/suit-15.webp", name: "Бежевый костюм с платком", alt: "Бежевый мужской костюм с нагрудным платком" },
  { image: "assets/images/suit-16.webp", name: "Голубой костюм в клетку", alt: "Голубой мужской костюм в клетку" },
  { image: "assets/images/suit-17.webp", name: "Серый костюм в полоску", alt: "Серый мужской костюм в тонкую полоску" },
  { image: "assets/images/suit-18.webp", name: "Графитовый костюм с бордовым галстуком", alt: "Графитовый мужской костюм с бордовым галстуком" },
  { image: "assets/images/suit-19.webp", name: "Синий костюм с голубым галстуком", alt: "Синий мужской костюм с голубым галстуком" },
  { image: "assets/images/suit-20.webp", name: "Тёмно-синий костюм с платком", alt: "Тёмно-синий мужской костюм с нагрудным платком" },
  { image: "assets/images/suit-21.webp", name: "Светло-серый костюм с красным галстуком", alt: "Светло-серый мужской костюм с красным галстуком" },
  { image: "assets/images/suit-22.webp", name: "Костюм в тёмную клетку", alt: "Мужской костюм в тёмную клетку" },
  { image: "assets/images/suit-23.webp", name: "Синий костюм в клетку", alt: "Синий мужской костюм в клетку" },
  { image: "assets/images/suit-24.webp", name: "Чёрный смокинг", alt: "Чёрный мужской смокинг с бабочкой" },
];
