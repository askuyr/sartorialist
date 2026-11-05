/**
 * Галерея собирается вручную из локальных фотографий assets/images/.
 * Сайт показывает галерею, а не карточки товаров: лоты, цены и наличие
 * остаются в профиле магазина на Авито. Синхронизации с Авито нет.
 * Кадры взяты из фотогалереи gallery.photo (galleryUrl) и сохранены локально.
 */
export const SITE_CONFIG = {
  phone: "+79312992222",
  avitoProfileUrl: "https://www.avito.ru/brands/i205036214",
  galleryUrl: "https://ellenutelle.gallery.photo/gallery/maksim-kostumy-14rmew/",
};

export const PHOTO_ITEMS = [
  { image: "assets/images/gallery-01.webp", alt: "Максим в клетчатом костюме и бордовом галстуке" },
  { image: "assets/images/gallery-02.webp", alt: "Петля и пуговица на рукаве синего пиджака" },
  { image: "assets/images/gallery-03.webp", alt: "Серый костюм с белой рубашкой на манекене" },
  { image: "assets/images/gallery-04.webp", wide: true, alt: "Рейлы с мужскими костюмами в торговом зале" },
  { image: "assets/images/gallery-05.webp", alt: "Брюки в тонкую полоску, задний карман" },
  { image: "assets/images/gallery-06.webp", alt: "Синий костюм с серым галстуком на манекене" },
  { image: "assets/images/gallery-07.webp", alt: "Серое двубортное пальто на манекене" },
  { image: "assets/images/gallery-08.webp", wide: true, alt: "Кресло и столик с кофе в торговом зале" },
  { image: "assets/images/gallery-09.webp", alt: "Внутренний ярлык пиджака с ручной вышивкой" },
  { image: "assets/images/gallery-10.webp", alt: "Тёмный костюм в полоску с бордовым галстуком" },
  { image: "assets/images/gallery-11.webp", alt: "Тёмно-синий костюм с нагрудным платком на манекене" },
  { image: "assets/images/gallery-12.webp", wide: true, alt: "Два кресла и столик в торговом зале" },
  { image: "assets/images/gallery-13.webp", alt: "Петли и пуговицы на рукаве тёмно-синего пиджака" },
  { image: "assets/images/gallery-14.webp", alt: "Пуговицы и петли на рукаве светлого пиджака" },
  { image: "assets/images/gallery-15.webp", wide: true, alt: "Рейлы с костюмами и кресло в зале магазина" },
  { image: "assets/images/gallery-16.webp", alt: "Максим в костюме сидит в кресле в зале магазина" },
];
