#!/usr/bin/env node
/**
 * Синхронизация объявлений с профиля Avito без API-ключа.
 *
 * Как это работает:
 *  1. Скрипт открывает обычное окно браузера с отдельным профилем (tools/.avito-profile).
 *  2. Вы входите в Avito и открываете «Мои объявления» (или страницу бренда).
 *  3. Скрипт собирает названия, цены, ссылки и фотографии, скачивает фото в assets/images/avito/.
 *  4. Результат пишется в data/avito-items.json — сайт читает этот файл.
 *
 * Запуск:
 *   node tools/sync-avito.mjs            # только собрать данные
 *   node tools/sync-avito.mjs --push     # собрать и закоммитить в git
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROFILE_DIR = path.join(ROOT, "tools", ".avito-profile");
const DATA_FILE = path.join(ROOT, "data", "avito-items.json");
const IMAGE_DIR = path.join(ROOT, "assets", "images", "avito");
const PORT = Number(process.env.AVITO_CDP_PORT || 9333);
const TIMEOUT_MIN = Number(process.env.AVITO_TIMEOUT_MIN || 12);
const MAX_PAGES = 10;

const args = process.argv.slice(2);
const SHOULD_PUSH = args.includes("--push");
const urlArg = args.find((arg) => arg.startsWith("--url="));
const START_URL = urlArg ? urlArg.slice("--url=".length) : "https://www.avito.ru/profile/items";
const BRAND_URL = "https://www.avito.ru/brands/i205036214";

const log = (...parts) => console.log(...parts);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Browser ---------- */

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || "";
}

async function waitForCdp(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return await response.json();
    } catch {
      /* browser not ready yet */
    }
    await sleep(500);
  }
  throw new Error(`Браузер не запустился на порту ${PORT}`);
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = () => reject(new Error("Не удалось подключиться к браузеру"));
    });
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handler = this.pending.get(message.id);
      if (!handler) return;
      this.pending.delete(message.id);
      if (message.error) handler.reject(new Error(JSON.stringify(message.error)));
      else handler.resolve(message.result);
    };
    return this;
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, awaitPromise = false) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise,
      userGesture: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Ошибка в браузере");
    return result.result.value;
  }
}

/* ---------- Page helpers ---------- */

const EXTRACT_ITEMS = `(() => {
  const clean = (value) => (value || "").replace(/\\s+/g, " ").trim();
  const isItemUrl = (href) => /avito\\.ru\\/[a-z0-9_\\-]+\\/[a-z0-9_\\-]+\\/\\d+/i.test(href || "");

  let cards = [...document.querySelectorAll('[data-marker="item"], [data-marker="catalog-serp-item"], [data-marker="item-card"]')];
  if (!cards.length) {
    const anchors = [...document.querySelectorAll('a[href]')].filter((a) => isItemUrl(a.href));
    cards = anchors.map((anchor) => {
      let node = anchor;
      for (let step = 0; step < 4 && node.parentElement; step += 1) {
        node = node.parentElement;
        if (node.querySelector('img')) break;
      }
      return node;
    });
  }

  const seen = new Set();
  const items = [];
  for (const node of cards) {
    const link = node.querySelector('a[data-marker="item-title"]')
      || node.querySelector('a[itemprop="url"]')
      || (node.matches('a[href]') ? node : node.querySelector('a[href]'));
    const url = link ? link.href : "";
    if (!url || !/avito\\.ru/.test(url)) continue;
    const id = (url.match(/_(\\d+)/) || [])[1] || "";
    const key = id || url;
    if (seen.has(key)) continue;
    seen.add(key);

    let title = clean(link ? link.textContent : "");
    if (!title) title = clean((node.querySelector('[data-marker="item-title"]') || node.querySelector('[itemprop="name"]') || {}).textContent);
    if (!title) {
      const img = node.querySelector('img');
      title = clean(img ? img.getAttribute("alt") : "");
    }
    if (!title) title = "Объявление на Авито";

    let priceText = "";
    const priceNode = node.querySelector('[data-marker="item-price"]') || node.querySelector('[itemprop="price"]') || node.querySelector('meta[itemprop="price"]');
    if (priceNode) priceText = clean(priceNode.getAttribute("content") || priceNode.textContent);
    if (!priceText) {
      const match = clean(node.textContent).match(/(\\d[\\d\\s\\u00a0]{2,})\\s*(?:\\u20bd|руб\\.?)/i);
      if (match) priceText = match[1].replace(/\\s+/g, " ").trim() + " \\u20bd";
    }

    let image = "";
    const img = node.querySelector('img');
    if (img) {
      image = img.currentSrc || img.getAttribute("src") || img.getAttribute("data-src") || "";
      if (!image) {
        const srcset = img.getAttribute("srcset") || "";
        const best = srcset.split(",").map((part) => part.trim().split(/\\s+/)).sort((a, b) => parseInt(b[1] || 0, 10) - parseInt(a[1] || 0, 10))[0];
        if (best && best[0]) image = best[0];
      }
    }
    if (image && image.startsWith("//")) image = "https:" + image;

    items.push({ id, title, url, priceText, image });
  }
  return JSON.stringify(items);
})()`;

async function collectPage(cdp) {
  await cdp.evaluate(`(() => { window.scrollTo(0, 0); return true; })()`);
  await sleep(600);
  const raw = await cdp.evaluate(EXTRACT_ITEMS);
  return JSON.parse(raw || "[]");
}

async function hasItems(cdp) {
  const raw = await cdp.evaluate(EXTRACT_ITEMS);
  const items = JSON.parse(raw || "[]");
  return items.length > 0;
}

const LOGIN_CHECK = `(() => {
  const body = document.body ? document.body.innerText : "";
  if (/Вход и регистрация/i.test(body)) return false;
  if (/Объявления пользователя скрыты/i.test(body)) return false;
  if (/(user_id|sessid|avito_uid)/i.test(document.cookie || "")) return true;
  return /Мои объявления|Выйти|Личный кабинет/i.test(body);
})()`;

async function isLoggedIn(cdp) {
  try {
    return await cdp.evaluate(LOGIN_CHECK);
  } catch {
    return false;
  }
}

async function pageState(cdp) {
  return cdp.evaluate(`(() => JSON.stringify({
    title: document.title || "",
    url: location.href,
    body: (document.body ? document.body.innerText : "").slice(0, 1500)
  }))()`).then((raw) => JSON.parse(raw || "{}")).catch(() => ({ title: "", url: "", body: "" }));
}

async function navigate(cdp, url) {
  await cdp.send("Page.navigate", { url });
  await sleep(4000);
}

async function gotoNextPage(cdp) {
  const clicked = await cdp.evaluate(`(() => {
    const candidates = [
      document.querySelector('[data-marker="pagination-button/nextPage"]'),
      document.querySelector('button[data-marker*="nextPage"]'),
      document.querySelector('[data-marker="pagination-next"]'),
      document.querySelector('a[aria-label*="Следующая"]'),
    ].filter(Boolean);
    const button = candidates.find((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
    if (!button) return false;
    button.scrollIntoView({ block: "center" });
    button.click();
    return true;
  })()`);
  if (!clicked) return false;
  await sleep(2500);
  return true;
}

/* ---------- Images ---------- */

const EXT_BY_TYPE = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

async function downloadImage(url, id) {
  if (!url) return "";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Referer: "https://www.avito.ru/",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) return url;
    const type = (response.headers.get("content-type") || "").split(";")[0].trim();
    const ext = EXT_BY_TYPE[type] || ".jpg";
    const name = `${id || Date.now()}${ext}`;
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(path.join(IMAGE_DIR, name), buffer);
    return `assets/images/avito/${name}`;
  } catch {
    return url;
  }
}

/* ---------- Main ---------- */

async function main() {
  const browser = findBrowser();
  if (!browser) throw new Error("Не найден Chrome или Edge. Укажите путь через переменную CHROME_PATH.");

  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  log("Запускаю браузер:", browser);
  const child = spawn(browser, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE_DIR}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--start-maximized",
    "about:blank",
  ], { stdio: "ignore", detached: false });

  let cdp;
  try {
    await waitForCdp();
    const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(START_URL)}`, { method: "PUT" })).json();
    cdp = await new Cdp(target.webSocketDebuggerUrl).connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    log("");
    log("Открылось окно браузера. Войдите в Avito и откройте «Мои объявления».");
    log("Если страница требует проверку IP — пройдите её в этом окне.");
    log("Жду объявления…");
    log("");

    const deadline = Date.now() + TIMEOUT_MIN * 60 * 1000;
    const startedAt = Date.now();
    const shown = new Set();
    let ready = false;
    let switched = false;

    while (Date.now() < deadline) {
      await sleep(2000);
      try {
        const signedIn = await isLoggedIn(cdp);
        if (signedIn && await hasItems(cdp)) { ready = true; break; }
        const state = await pageState(cdp);
        const hint = /Доступ ограничен|проверк/i.test(`${state.title} ${state.body}`)
          ? "Avito требует проверку IP — пройдите её в открытомся окне."
          : /Объявления пользователя скрыты|Вход и регистрация|войдите в свой профиль/i.test(state.body)
            ? "Войдите в аккаунт Avito в открытомся окне — без входа объявления скрыты."
            : "";
        if (hint && !shown.has(hint)) {
          shown.add(hint);
          log(hint);
        }
        if (Date.now() - startedAt > 20000 && Date.now() - startedAt < 23000) log(`Сейчас открыто: ${state.url}`);

        const half = startedAt + (deadline - startedAt) / 2;
        if (!switched && Date.now() > half) {
          switched = true;
          log("Пробую страницу бренда…");
          await navigate(cdp, BRAND_URL);
        }
      } catch {
        /* страница перезагружается */
      }
    }
    if (!ready) throw new Error("Объявления не найдены: проверьте, что вы вошли в Avito и открыли «Мои объявления».");

    const collected = new Map();
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const items = await collectPage(cdp);
      items.forEach((item) => {
        const key = item.id || item.url;
        if (!collected.has(key)) collected.set(key, item);
      });
      log(`Страница ${page}: всего найдено ${collected.size}`);
      const hasNext = await gotoNextPage(cdp);
      if (!hasNext) break;
    }

    const items = [...collected.values()].filter((item) => item.title);
    if (!items.length) throw new Error("Не удалось получить данные объявлений.");

    log("");
    log("Найденные объявления:");
    items.forEach((item, index) => {
      log(`  ${index + 1}. ${item.priceText || "цена не указана"} — ${item.title}`);
      log(`     ${item.url}`);
    });
    log("");

    log("Скачиваю фотографии…");
    const output = [];
    for (const item of items) {
      const priceValue = Number(String(item.priceText || "").replace(/[^\d]/g, "")) || null;
      output.push({
        id: item.id || "",
        title: item.title,
        price: priceValue,
        priceText: item.priceText || "",
        url: item.url,
        image: await downloadImage(item.image, item.id || item.url.split("/").pop()),
      });
    }

    const payload = {
      updatedAt: new Date().toISOString(),
      source: BRAND_URL,
      count: output.length,
      items: output,
    };

    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    log(`Готово: ${output.length} объявлений → data/avito-items.json`);

    if (SHOULD_PUSH) {
      await runGit([
        "add", "data/avito-items.json", "assets/images/avito",
      ]);
      await runGit(["commit", "-m", `chore: sync ${output.length} listings from Avito`]);
      await runGit(["push", "origin", "HEAD"]);
      log("Изменения отправлены в репозиторий.");
    } else {
      log("");
      log("Дальше:");
      log("  git add data/avito-items.json assets/images/avito");
      log("  git commit -m \"chore: update Avito listings\"");
      log("  git push origin main");
    }
  } finally {
    await closeBrowser();
    child.kill();
  }
}

async function closeBrowser() {
  try {
    const version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    if (!version.webSocketDebuggerUrl) return;
    const browser = await new Cdp(version.webSocketDebuggerUrl).connect();
    await browser.send("Browser.close").catch(() => {});
    browser.socket.close();
  } catch {
    /* ignore */
  }
}

function runGit(command) {
  return new Promise((resolve, reject) => {
    const proc = spawn("git", command, { cwd: ROOT, stdio: "inherit", shell: true });
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`git ${command.join(" ")} → ${code}`))));
  });
}

main().catch((error) => {
  console.error("Ошибка:", error.message);
  process.exitCode = 1;
});
