/**
 * Быстрое переключение источника каталога:
 * "photos" — фотографии из assets/images/ (сейчас включено)
 * "avito" — объявления из защищённого JSON endpoint (подключается позднее)
 */
export const CATALOG_SOURCE = "photos";

export const SITE_CONFIG = {
  phone: "+79312992222",
  avitoProfileUrl: "https://www.avito.ru/brands/i205036214",
  galleryUrl: "https://ellenutelle.gallery.photo/gallery/maksim-kostumy-14rmew/",
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
];
