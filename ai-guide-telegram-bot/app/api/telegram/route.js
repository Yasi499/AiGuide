const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const TELEGRAM_API = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : null;

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
  if (!TELEGRAM_API) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Telegram API error: ${response.status} ${errorText}`
    );
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
    "<b>AI Guide</b> 🤖\n\nЯ допоможу швидко розібратися, який ШІ краще підійде для навчання, коду, текстів, пошуку, зображень та інших задач.\n\nТакож можеш просто написати мені будь-яке питання — і я відповім за допомогою ШІ.\n\nОбери розділ нижче 👇",
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
          [
            { text: "ChatGPT", callback_data: "model_chatgpt" },
            { text: "Claude", callback_data: "model_claude" }
          ],
          [
            { text: "Gemini", callback_data: "model_gemini" },
            { text: "Grok", callback_data: "model_grok" }
          ],
          [
            { text: "Perplexity", callback_data: "model_perplexity" },
            { text: "Copilot", callback_data: "model_copilot" }
          ]
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
          [
            { text: "ChatGPT", callback_data: "price_chatgpt" },
            { text: "Claude", callback_data: "price_claude" }
          ],
          [
            { text: "Gemini", callback_data: "price_gemini" },
            { text: "Grok", callback_data: "price_grok" }
          ],
          [
            { text: "Perplexity", callback_data: "price_perplexity" }
          ]
        ]
      }
    }
  );
}

const TEXTS = {
  model_chatgpt: `<b>ChatGPT</b>

✅ Добре підходить для:
• навчання та пояснення складних тем;
• програмування й пошуку помилок у коді;
• роботи з файлами;
• написання та редагування текстів;
• ідей, планів, аналізу;
• генерації зображень та роботи з інструментами.

<b>Перевага:</b> універсальний помічник для дуже різних задач.`,

  model_claude: `<b>Claude</b>

✅ Сильні сторони:
• робота з великими текстами та документами;
• написання й редагування текстів;
• аналіз інформації;
• програмування;
• акуратні довгі відповіді.

<b>Кому підійде:</b> тим, хто часто працює з документами, текстами та кодом.`,

  model_gemini: `<b>Google Gemini</b>

✅ Добре підходить для:
• роботи в екосистемі Google;
• навчання та пошуку ідей;
• текстів, фото та мультимодальних задач;
• аналізу інформації;
• повсякденних питань.

<b>Перевага:</b> тісна інтеграція з сервісами Google.`,

  model_grok: `<b>Grok</b>

✅ Добре підходить для:
• запитань про актуальні події;
• пошуку в інтернеті та X;
• програмування;
• аналізу файлів.

<b>Перевага:</b> сильний акцент на актуальній інформації.`,

  model_perplexity: `<b>Perplexity</b>

✅ Найкраще використовувати як AI-пошуковик:
• швидкий пошук інформації;
• відповіді з посиланнями на джерела;
• підготовка рефератів і досліджень;
• порівняння інформації з кількох сайтів.

<b>Перевага:</b> зручно перевіряти, звідки взята інформація.`,

  model_copilot: `<b>Microsoft Copilot</b>

✅ Добре підходить для:
• роботи з продуктами Microsoft;
• офісних задач;
• створення текстів та ідей;
• програмування.

<b>Перевага:</b> корисний користувачам Windows, Microsoft 365 та GitHub.`,

  price_chatgpt: `<b>ChatGPT — тарифи</b>

• Free — безкоштовний базовий доступ.
• Є платні тарифи з більшими лімітами та можливостями.

⚠️ Ціни та доступні моделі можуть змінюватися.`,

  price_claude: `<b>Claude — тарифи</b>

Claude має безкоштовний доступ і платні плани.

⚠️ Перед оплатою перевіряй актуальні умови на офіційному сайті Anthropic.`,

  price_gemini: `<b>Gemini — тарифи</b>

Є безкоштовний доступ і платні Google AI-плани.

⚠️ Ціна та доступність можуть залежати від країни.`,

  price_grok: `<b>Grok — тарифи</b>

Є безкоштовний доступ з обмеженнями та платні тарифи з більшими лімітами.`,

  price_perplexity: `<b>Perplexity — тарифи</b>

Є безкоштовна версія та платний Perplexity Pro.

⚠️ Точну поточну ціну краще перевіряти в самому Perplexity.`,

  choose: `<b>Який ШІ обрати?</b> 🎯

📚 <b>Навчання:</b> ChatGPT / Gemini
💻 <b>Код:</b> ChatGPT / Claude / GitHub Copilot
🔎 <b>Пошук із джерелами:</b> Perplexity
📰 <b>Актуальні події:</b> Grok / Perplexity
📄 <b>Великі документи:</b> Claude / ChatGPT
✍️ <b>Тексти:</b> Claude / ChatGPT
🖼 <b>Креатив:</b> ChatGPT / Gemini
🏢 <b>Microsoft 365:</b> Copilot`,

  usecases: `<b>Для чого використовують ШІ?</b> 🧰

• пояснення уроків і створення конспектів;
• написання та перевірка коду;
• переклад і вивчення мов;
• пошук і структурування інформації;
• створення презентацій, планів та ідей;
• аналіз документів;
• допомога з контентом.`,

  glossary: `<b>Міні-словник ШІ</b> 📚

<b>AI / ШІ</b> — штучний інтелект.
<b>LLM</b> — велика мовна модель.
<b>Prompt</b> — запит або інструкція для ШІ.
<b>Token</b> — маленька частина тексту, яку обробляє модель.
<b>API</b> — спосіб підключити модель до власного сайту, бота або програми.`,

  about: `<b>Про бота</b> ℹ️

AI Guide — Telegram-бот про штучний інтелект.

Він містить інформацію про популярні AI-сервіси, а також може відповідати на звичайні запитання за допомогою безкоштовної AI-моделі.`
};

async function askAI(userText) {
  if (!OPENROUTER_API_KEY) {
    return "⚠️ OPENROUTER_API_KEY не налаштований у Vercel.";
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content:
              "Ти дружній AI-помічник Telegram-бота AI Guide. Відповідай зрозуміло, коротко і корисно. Відповідай мовою користувача."
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter error:", response.status, errorText);

    return "⚠️ ШІ зараз не зміг відповісти. Спробуй ще раз трохи пізніше.";
  }

  const data = await response.json();

  return (
    data.choices?.[0]?.message?.content ||
    "Не вдалося отримати відповідь від ШІ."
  );
}

async function handleCallback(callback) {
  const chatId = callback.message?.chat?.id;

  if (!chatId) return;

  await tg("answerCallbackQuery", {
    callback_query_id: callback.id
  });

  const text = TEXTS[callback.data];

  if (text) {
    await sendMessage(chatId, text, {
      reply_markup: BACK_KEYBOARD
    });
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();

  if (!text) return;

  if (
    ["/start", "/menu", "⬅️ Головне меню"].includes(text)
  ) {
    return mainMenu(chatId);
  }

  if (text === "/help") {
    return sendMessage(
      chatId,
      "<b>Команди:</b>\n/start — запуск\n/menu — меню\n/help — допомога\n/models — моделі\n/prices — тарифи\n\nАбо просто напиши будь-яке питання.",
      { reply_markup: MAIN_KEYBOARD }
    );
  }

  if (text === "/models" || text === "🤖 Моделі ШІ") {
    return modelMenu(chatId);
  }

  if (text === "/prices" || text === "💰 Тарифи") {
    return tariffsMenu(chatId);
  }

  if (text === "🎯 Який ШІ обрати?") {
    return sendMessage(chatId, TEXTS.choose, {
      reply_markup: BACK_KEYBOARD
    });
  }

  if (text === "🧰 Для чого підходять") {
    return sendMessage(chatId, TEXTS.usecases, {
      reply_markup: BACK_KEYBOARD
    });
  }

  if (text === "📚 Словник ШІ") {
    return sendMessage(chatId, TEXTS.glossary, {
      reply_markup: BACK_KEYBOARD
    });
  }

  if (text === "ℹ️ Про бота") {
    return sendMessage(chatId, TEXTS.about, {
      reply_markup: BACK_KEYBOARD
    });
  }

  await tg("sendChatAction", {
    chat_id: chatId,
    action: "typing"
  });

  const answer = await askAI(text);

  return sendMessage(chatId, answer, {
    reply_markup: MAIN_KEYBOARD,
    parse_mode: undefined
  });
}

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!BOT_TOKEN) {
    return Response.json(
      {
        ok: false,
        error: "TELEGRAM_BOT_TOKEN is not set"
      },
      { status: 500 }
    );
  }

  if (token !== BOT_TOKEN) {
    return Response.json(
      {
        ok: false,
        error: "Invalid token"
      },
      { status: 401 }
    );
  }

  return Response.json({
    ok: true,
    message: "Telegram webhook endpoint is ready"
  });
}

export async function POST(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!BOT_TOKEN) {
    return Response.json(
      {
        ok: false,
        error: "TELEGRAM_BOT_TOKEN is not set"
      },
      { status: 500 }
    );
  }

  if (token !== BOT_TOKEN) {
    return Response.json(
      {
        ok: false,
        error: "Invalid token"
      },
      { status: 401 }
    );
  }

  try {
    const update = await request.json();

    if (update.callback_query) {
      await handleCallback(update.callback_query);
    }

    if (update.message) {
      await handleMessage(update.message);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        ok: false,
        error: "Webhook handler failed"
      },
      { status: 500 }
    );
  }
}
