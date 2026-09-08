const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "🤖 Моделі ШІ" }, { text: "💰 Тарифи" }],
    [{ text: "🎯 Який ШІ обрати?" }, { text: "🧰 Для чого підходять" }],
    [{ text: "📚 Словник ШІ" }, { text: "ℹ️ Про бота" }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

const BACK_KEYBOARD = {
  keyboard: [[{ text: "⬅️ Головне меню" }]],
  resize_keyboard: true
};

async function tg(method, payload) {
  if (!TELEGRAM_API) throw new Error("TELEGRAM_BOT_TOKEN is not configured");

  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

function sendMessage(chatId, text, extra = {}) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra
  });
}

function mainMenu(chatId) {
  return sendMessage(
    chatId,
    "<b>AI Guide</b> 🤖\n\nЯ допоможу швидко розібратися, який ШІ краще підійде для навчання, коду, текстів, пошуку, зображень та інших задач.\n\nОбери розділ нижче 👇",
    { reply_markup: MAIN_KEYBOARD }
  );
}

function modelMenu(chatId) {
  return sendMessage(
    chatId,
    "<b>Популярні AI-сервіси</b>\n\nОбери сервіс, щоб побачити його сильні сторони:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "ChatGPT", callback_data: "model_chatgpt" }, { text: "Claude", callback_data: "model_claude" }],
          [{ text: "Gemini", callback_data: "model_gemini" }, { text: "Grok", callback_data: "model_grok" }],
          [{ text: "Perplexity", callback_data: "model_perplexity" }, { text: "Copilot", callback_data: "model_copilot" }]
        ]
      }
    }
  );
}

function tariffsMenu(chatId) {
  return sendMessage(
    chatId,
    "<b>Тарифи AI-сервісів</b> 💰\n\nЦіни й ліміти часто змінюються, тому нижче — орієнтир, а перед оплатою краще перевірити офіційний сайт.\n\nОбери сервіс:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "ChatGPT", callback_data: "price_chatgpt" }, { text: "Claude", callback_data: "price_claude" }],
          [{ text: "Gemini", callback_data: "price_gemini" }, { text: "Grok", callback_data: "price_grok" }],
          [{ text: "Perplexity", callback_data: "price_perplexity" }]
        ]
      }
    }
  );
}

const TEXTS = {
  model_chatgpt: `<b>ChatGPT</b>\n\n✅ Добре підходить для:\n• навчання та пояснення складних тем;\n• програмування й пошуку помилок у коді;\n• роботи з файлами;\n• написання та редагування текстів;\n• ідей, планів, аналізу;\n• генерації зображень та роботи з інструментами.\n\n<b>Перевага:</b> універсальний помічник для дуже різних задач.`,

  model_claude: `<b>Claude</b>\n\n✅ Сильні сторони:\n• робота з великими текстами та документами;\n• написання й редагування текстів;\n• аналіз інформації;\n• програмування;\n• акуратні довгі відповіді.\n\n<b>Кому підійде:</b> тим, хто часто працює з документами, текстами та кодом.`,

  model_gemini: `<b>Google Gemini</b>\n\n✅ Добре підходить для:\n• роботи в екосистемі Google;\n• навчання та пошуку ідей;\n• текстів, фото та мультимодальних задач;\n• аналізу інформації;\n• повсякденних питань.\n\n<b>Перевага:</b> тісна інтеграція з сервісами Google.`,

  model_grok: `<b>Grok</b>\n\n✅ Добре підходить для:\n• запитань про актуальні події;\n• пошуку в інтернеті та X;\n• програмування;\n• аналізу файлів;\n• генерації зображень і відео в доступних тарифах.\n\n<b>Перевага:</b> сильний акцент на актуальній інформації та веб-пошуку.`,

  model_perplexity: `<b>Perplexity</b>\n\n✅ Найкраще використовувати як AI-пошуковик:\n• швидкий пошук інформації;\n• відповіді з посиланнями на джерела;\n• підготовка рефератів і досліджень;\n• порівняння інформації з кількох сайтів.\n\n<b>Перевага:</b> зручно перевіряти, звідки взята інформація.`,

  model_copilot: `<b>Microsoft Copilot</b>\n\n✅ Добре підходить для:\n• роботи з продуктами Microsoft;\n• офісних задач;\n• створення текстів та ідей;\n• програмування — окремо популярний GitHub Copilot.\n\n<b>Перевага:</b> корисний користувачам Windows, Microsoft 365 та GitHub.`,

  price_chatgpt: `<b>ChatGPT — тарифи</b>\n\n• Free — безкоштовний базовий доступ.\n• Go — дешевший платний рівень у доступних регіонах.\n• Plus — близько $20/міс.\n• Pro — вищі ліміти та розширений доступ; доступні дорожчі рівні Pro.\n• Business / Enterprise — для команд та компаній.\n\n⚠️ Конкретні моделі й ліміти можуть змінюватися.`,

  price_claude: `<b>Claude — тарифи</b>\n\nClaude має безкоштовний доступ і платні плани для активніших користувачів та команд. Ціни, доступні моделі й ліміти залежать від поточного тарифу та регіону.\n\n⚠️ Перед оплатою перевіряй актуальні умови на офіційному сайті Anthropic.`,

  price_gemini: `<b>Gemini — тарифи</b>\n\nЄ безкоштовний доступ, а розширені можливості входять до платних Google AI-планів. Вони можуть включати більше лімітів, розширені моделі та додаткові функції Google.\n\n⚠️ Ціна та доступність можуть відрізнятися залежно від країни.`,

  price_grok: `<b>Grok — тарифи</b>\n\n• Free — $0/міс. з обмеженнями.\n• SuperGrok — близько $30/міс.\n• Є дорожчі рівні з вищими лімітами та додатковими можливостями.\n\nУ платних планах можуть бути вищі ліміти, генерація зображень/відео та доступ до потужніших моделей.`,

  price_perplexity: `<b>Perplexity — тарифи</b>\n\nЄ безкоштовна версія та Perplexity Pro. Pro дає більше можливостей для пошуку, більше роботи з файлами та доступ до розширених AI-функцій.\n\n⚠️ Точну поточну ціну краще перевіряти в самому Perplexity.`,

  choose: `<b>Який ШІ обрати?</b> 🎯\n\n📚 <b>Навчання:</b> ChatGPT / Gemini\n💻 <b>Код:</b> ChatGPT / Claude / GitHub Copilot\n🔎 <b>Пошук із джерелами:</b> Perplexity\n📰 <b>Актуальні події:</b> Grok / Perplexity\n📄 <b>Великі документи:</b> Claude / ChatGPT\n✍️ <b>Тексти:</b> Claude / ChatGPT\n🖼 <b>Креатив і зображення:</b> ChatGPT / Gemini / Grok\n🏢 <b>Microsoft 365:</b> Copilot\n\nНемає одного ШІ, який завжди найкращий: вибір залежить від задачі.`,

  usecases: `<b>Для чого використовують ШІ?</b> 🧰\n\n• пояснення уроків і створення конспектів;\n• написання та перевірка коду;\n• переклад і вивчення мов;\n• пошук і структурування інформації;\n• створення презентацій, планів та ідей;\n• аналіз документів і таблиць;\n• генерація зображень;\n• допомога з контентом для YouTube, TikTok і соцмереж.\n\n⚠️ Важливі факти краще перевіряти за надійними джерелами.`,

  glossary: `<b>Міні-словник ШІ</b> 📚\n\n<b>AI / ШІ</b> — штучний інтелект.\n<b>LLM</b> — велика мовна модель.\n<b>Prompt</b> — запит або інструкція для ШІ.\n<b>Token</b> — маленька частина тексту, яку обробляє модель.\n<b>Context window</b> — обсяг інформації, який модель може врахувати за один раз.\n<b>Multimodal</b> — модель, яка працює не лише з текстом, а й, наприклад, із фото чи аудіо.\n<b>API</b> — спосіб підключити модель до власного сайту, бота або програми.`,

  about: `<b>Про бота</b> ℹ️\n\nAI Guide — навчальний Telegram-бот про популярні системи штучного інтелекту. Він пояснює, для чого вони потрібні, у чому їхні переваги та як вибрати сервіс під конкретну задачу.\n\nДані про тарифи є орієнтовними, бо AI-сервіси часто змінюють ціни, моделі та ліміти.`
};

async function handleCallback(callback) {
  const chatId = callback.message?.chat?.id;
  if (!chatId) return;

  await tg("answerCallbackQuery", { callback_query_id: callback.id });

  const text = TEXTS[callback.data];
  if (text) {
    await sendMessage(chatId, text, { reply_markup: BACK_KEYBOARD });
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();

  if (["/start", "/menu", "⬅️ Головне меню"].includes(text)) return mainMenu(chatId);
  if (text === "/help") {
    return sendMessage(chatId, "<b>Команди:</b>\n/start — запуск\n/menu — меню\n/help — допомога\n/models — моделі\n/prices — тарифи", { reply_markup: MAIN_KEYBOARD });
  }
  if (text === "/models" || text === "🤖 Моделі ШІ") return modelMenu(chatId);
  if (text === "/prices" || text === "💰 Тарифи") return tariffsMenu(chatId);
  if (text === "🎯 Який ШІ обрати?") return sendMessage(chatId, TEXTS.choose, { reply_markup: BACK_KEYBOARD });
  if (text === "🧰 Для чого підходять") return sendMessage(chatId, TEXTS.usecases, { reply_markup: BACK_KEYBOARD });
  if (text === "📚 Словник ШІ") return sendMessage(chatId, TEXTS.glossary, { reply_markup: BACK_KEYBOARD });
  if (text === "ℹ️ Про бота") return sendMessage(chatId, TEXTS.about, { reply_markup: BACK_KEYBOARD });

  return sendMessage(
    chatId,
    "Не знайшов таку команду 🙂\nСкористайся меню нижче або введи /help.",
    { reply_markup: MAIN_KEYBOARD }
  );
}

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!BOT_TOKEN) {
    return Response.json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 500 });
  }

  if (token !== BOT_TOKEN) {
    return Response.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  return Response.json({ ok: true, message: "Telegram webhook endpoint is ready" });
}

export async function POST(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!BOT_TOKEN) {
    return Response.json({ ok: false, error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 500 });
  }

  if (token !== BOT_TOKEN) {
    return Response.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  try {
    const update = await request.json();

    if (update.callback_query) await handleCallback(update.callback_query);
    if (update.message) await handleMessage(update.message);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, error: "Webhook handler failed" }, { status: 500 });
  }
}
