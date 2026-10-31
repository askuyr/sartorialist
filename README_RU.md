# THE SARTORIALIST CLUB — README_RU

Основная документация находится в [README.md](README.md).

Кратко:

- Одностраничный редакционный лендинг для GitHub Pages.
- Палитра и шрифты сохранены по брендбуку.
- Фотографии локальные, в `assets/images/`.
- Настройки ссылок — в `assets/js/config.js` (`phone`, `avitoProfileUrl`, `galleryUrl`, `avitoDataUrl`).
- Каталог работает в режиме `avito`: сайт читает `data/avito-items.json`, который собирает `node tools/sync-avito.mjs` (без API-ключа, через вход в Avito в браузере). Пока файл пуст — показываются 24 локальных фото.
- Цены, размеры, отзывы, рейтинги и неподтверждённые сведения не добавлены: цены берутся только из реальных объявлений Авито.
- Публикация: **Settings → Pages → Deploy from a branch → main → / (root)**.
