const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const TELEGRAM_API = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : null;

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "🤖 Моделі ШІ" }, { text: "💰 Тарифи" }],
    [{ text: "🎯 Який ШІ обрати?" }, { text: "🧰 Для чого підходять" }],
    [{ text: "📚 Словник ШІ" }, { text: "ℹ️ Про бота" }],
    [{ text: "💬 Чат з ШІ" }]
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
    "<b>AI Guide</b> 🤖\n\nЯ допоможу розібратися у популярних нейромережах.\n\nМожеш вибрати розділ нижче або просто написати мені будь-яке питання.",
    { reply_markup: MAIN_KEYBOARD }
  );
}

function modelMenu(chatId) {
  return sendMessage(
    chatId,
    "<b>Популярні AI-сервіси</b>\n\nОбери сервіс:",
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
    "<b>Тарифи AI-сервісів</b> 💰\n\nОбери сервіс:",
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
• навчання;
• програмування;
• текстів;
• ідей;
• аналізу;
• роботи з файлами.

<b>Перевага:</b> універсальний AI-помічник.`,

  model_claude: `<b>Claude</b>

✅ Добре підходить для:
• великих текстів;
• документів;
• програмування;
• аналізу інформації.

<b>Перевага:</b> добре працює з довгими текстами.`,

  model_gemini: `<b>Google Gemini</b>

✅ Добре підходить для:
• навчання;
• роботи з Google-сервісами;
• текстів;
• фото;
• пошуку ідей.

<b>Перевага:</b> інтеграція з Google.`,

  model_grok: `<b>Grok</b>

✅ Добре підходить для:
• актуальних подій;
• пошуку інформації;
• програмування;
• аналізу.

<b>Перевага:</b> добре працює з актуальною інформацією.`,

  model_perplexity: `<b>Perplexity</b>

✅ Добре підходить для:
• пошуку інформації;
• відповідей із джерелами;
• рефератів;
• досліджень.

<b>Перевага:</b> показує джерела.`,

  model_copilot: `<b>Microsoft Copilot</b>

✅ Добре підходить для:
• Windows;
• Microsoft 365;
• програмування;
• офісних задач.

<b>Перевага:</b> інтеграція з Microsoft.`,

  price_chatgpt: `<b>ChatGPT — тарифи</b>

• Free — безкоштовний.
• Є платні тарифи з більшими лімітами.

⚠️ Ціни можуть змінюватися.`,

  price_claude: `<b>Claude — тарифи</b>

Є безкоштовний доступ і платні тарифи.

⚠️ Умови можуть змінюватися.`,

  price_gemini: `<b>Gemini — тарифи</b>

Є безкоштовна версія та платні Google AI-плани.`,

  price_grok: `<b>Grok — тарифи</b>

Є безкоштовний доступ та платні тарифи.`,

  price_perplexity: `<b>Perplexity — тарифи</b>

Є безкоштовна версія та платний Pro.`,

  choose: `<b>Який ШІ обрати?</b> 🎯

📚 Навчання — ChatGPT / Gemini
💻 Код — ChatGPT / Claude / Copilot
🔎 Пошук — Perplexity
📰 Актуальні події — Grok
📄 Документи — Claude / ChatGPT
✍️ Тексти — Claude / ChatGPT`,

  usecases: `<b>Для чого використовують ШІ?</b> 🧰

• навчання;
• програмування;
• переклад;
• пошук інформації;
• створення текстів;
• ідеї;
• аналіз;
• допомога з контентом.`,

  glossary: `<b>Міні-словник ШІ</b> 📚

<b>AI / ШІ</b> — штучний інтелект.
<b>LLM</b> — велика мовна модель.
<b>Prompt</b> — запит до ШІ.
<b>Token</b> — частина тексту.
<b>API</b> — спосіб підключити ШІ до програми або бота.`,

  about: `<b>Про бота</b> ℹ️

AI Guide — Telegram-бот про штучний інтелект.

У ньому можна дізнатися про популярні AI-сервіси та поспілкуватися з ШІ.`
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
              "Ти AI-помічник Telegram-бота AI Guide. Відповідай зрозуміло, корисно і не надто довго. Відповідай мовою користувача."
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
      "<b>Команди:</b>\n\n/start — запуск\n/menu — меню\n/help — допомога\n/models — моделі\n/prices — тарифи\n\nТакож можеш просто написати будь-яке питання.",
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

  if (text === "💬 Чат з ШІ") {
    return sendMessage(
      chatId,
      "🤖 <b>Чат з ШІ</b>\n\nНапиши мені будь-яке питання нижче 👇",
      { reply_markup: MAIN_KEYBOARD }
    );
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
