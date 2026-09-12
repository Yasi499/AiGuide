const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const TELEGRAM_API = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : null;

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "🤖 Моделі ШІ" }, { text: "💰 Тарифи" }],
    [{ text: "🌤 Погода" }, { text: "🕒 Час" }],
    [{ text: "💱 Валюта" }, { text: "💬 Чат з ШІ" }],
    [{ text: "🎯 Який ШІ обрати?" }, { text: "ℹ️ Про бота" }]
  ],
  resize_keyboard: true,
  is_persistent: true
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
    const text = await response.text();
    throw new Error(`Telegram API error: ${text}`);
  }

  return response.json();
}

function sendMessage(chatId, text, extra = {}) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    ...extra
  });
}

function mainMenu(chatId) {
  return sendMessage(
    chatId,
    `🤖 AI Guide

Можеш користуватися кнопками або просто написати питання звичайними словами.

Наприклад:
• Яка погода в Токіо?
• Погода завтра в Парижі
• Скільки часу в Нью-Йорку?
• 100 USD в EUR
• Поясни Python`,
    { reply_markup: MAIN_KEYBOARD }
  );
}

async function findLocation(city) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(city)}` +
    `&count=1&language=uk&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Geocoding failed");
  }

  const data = await response.json();

  if (!data.results?.length) {
    return null;
  }

  return data.results[0];
}

function weatherEmoji(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈";
  return "🌡";
}

async function getWeather(city, tomorrow = false) {
  const location = await findLocation(city);

  if (!location) {
    return `Не знайшов місто "${city}".`;
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${location.latitude}` +
    `&longitude=${location.longitude}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=auto&forecast_days=3`;

  const response = await fetch(url);

  if (!response.ok) {
    return "Не вдалося отримати погоду.";
  }

  const data = await response.json();

  const place = `${location.name}, ${location.country || ""}`;

  if (tomorrow) {
    const i = 1;

    return (
      `${weatherEmoji(data.daily.weather_code[i])} Погода завтра\n\n` +
      `📍 ${place}\n` +
      `🌡 ${data.daily.temperature_2m_min[i]}°C — ${data.daily.temperature_2m_max[i]}°C\n` +
      `🌧 Ймовірність опадів: ${data.daily.precipitation_probability_max[i]}%`
    );
  }

  return (
    `${weatherEmoji(data.current.weather_code)} Погода зараз\n\n` +
    `📍 ${place}\n` +
    `🌡 Температура: ${data.current.temperature_2m}°C\n` +
    `🤔 Відчувається як: ${data.current.apparent_temperature}°C\n` +
    `💨 Вітер: ${data.current.wind_speed_10m} км/год\n\n` +
    `📈 Сьогодні: ${data.daily.temperature_2m_min[0]}°C — ${data.daily.temperature_2m_max[0]}°C\n` +
    `🌧 Опади: ${data.daily.precipitation_probability_max[0]}%`
  );
}

async function getWorldTime(city) {
  const location = await findLocation(city);

  if (!location) {
    return `Не знайшов місто "${city}".`;
  }

  if (!location.timezone) {
    return "Не вдалося визначити часовий пояс.";
  }

  const time = new Intl.DateTimeFormat("uk-UA", {
    timeZone: location.timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());

  const date = new Intl.DateTimeFormat("uk-UA", {
    timeZone: location.timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "long"
  }).format(new Date());

  return (
    `🕒 ${location.name}, ${location.country || ""}\n\n` +
    `Час: ${time}\n` +
    `Дата: ${date}\n` +
    `🌍 Часовий пояс: ${location.timezone}`
  );
}

async function convertCurrency(amount, from, to) {
  from = from.toUpperCase();
  to = to.toUpperCase();

  const url =
    `https://api.frankfurter.dev/v2/rate/` +
    `${encodeURIComponent(from)}/${encodeURIComponent(to)}`;

  const response = await fetch(url);

  if (!response.ok) {
    return `Не вдалося знайти курс ${from} → ${to}.`;
  }

  const data = await response.json();

  const rate = data.rate;

  if (!rate) {
    return "Не вдалося отримати курс.";
  }

  const result = amount * rate;

  return (
    `💱 Конвертація валют\n\n` +
    `${amount} ${from} ≈ ${result.toFixed(2)} ${to}\n` +
    `Курс: 1 ${from} ≈ ${Number(rate).toFixed(4)} ${to}`
  );
}

async function askAI(userText) {
  if (!OPENROUTER_API_KEY) {
    return "OPENROUTER_API_KEY не налаштований.";
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
              "Ти корисний AI-помічник. Відповідай мовою користувача. Пиши зрозуміло і не занадто довго. Якщо користувач питає про погоду, поточний час або курс валют, не вигадуй актуальні дані."
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
    console.error("OpenRouter:", errorText);

    return "ШІ зараз не зміг відповісти.";
  }

  const data = await response.json();

  return (
    data.choices?.[0]?.message?.content ||
    "Не вдалося отримати відповідь."
  );
}

function extractWeatherCity(text) {
  let city = text
    .replace(/яка\s+погода/gi, "")
    .replace(/какая\s+погода/gi, "")
    .replace(/погода/gi, "")
    .replace(/завтра/gi, "")
    .replace(/сьогодні/gi, "")
    .replace(/сегодня/gi, "")
    .replace(/\?/g, "")
    .trim();

  city = city.replace(/^(в|у|во)\s+/i, "");

  return city;
}

function extractTimeCity(text) {
  let city = text
    .replace(/скільки\s+(зараз\s+)?часу/gi, "")
    .replace(/сколько\s+(сейчас\s+)?времени/gi, "")
    .replace(/который\s+час/gi, "")
    .replace(/котра\s+година/gi, "")
    .replace(/время/gi, "")
    .replace(/час/gi, "")
    .replace(/\?/g, "")
    .trim();

  city = city.replace(/^(в|у|во)\s+/i, "");

  return city;
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();

  if (!text) return;

  const lower = text.toLowerCase();

  if (["/start", "/menu", "⬅️ головне меню"].includes(lower)) {
    return mainMenu(chatId);
  }

  if (text === "💬 Чат з ШІ") {
    return sendMessage(
      chatId,
      "🤖 Напиши будь-яке питання."
    );
  }

  if (text === "🌤 Погода") {
    return sendMessage(
      chatId,
      "🌤 Напиши, наприклад:\n\nПогода Лондон\nПогода завтра Токіо"
    );
  }

  if (text === "🕒 Час") {
    return sendMessage(
      chatId,
      "🕒 Напиши, наприклад:\n\nСкільки часу в Нью-Йорку?\nВремя Токио"
    );
  }

  if (text === "💱 Валюта") {
    return sendMessage(
      chatId,
      "💱 Напиши, наприклад:\n\n100 USD в EUR\n50 EUR в USD"
    );
  }

  const currencyMatch = text.match(
    /(\d+(?:[.,]\d+)?)\s*([A-Za-z]{3})\s+(?:в|у|to|in)\s+([A-Za-z]{3})/i
  );

  if (currencyMatch) {
    const amount = Number(currencyMatch[1].replace(",", "."));
    const from = currencyMatch[2];
    const to = currencyMatch[3];

    return sendMessage(
      chatId,
      await convertCurrency(amount, from, to)
    );
  }

  if (
    lower.includes("погода") ||
    lower.includes("weather")
  ) {
    const tomorrow =
      lower.includes("завтра") ||
      lower.includes("tomorrow");

    const city = extractWeatherCity(text);

    if (!city) {
      return sendMessage(
        chatId,
        "Напиши місто. Наприклад: Погода в Лондоні"
      );
    }

    await tg("sendChatAction", {
      chat_id: chatId,
      action: "typing"
    });

    return sendMessage(
      chatId,
      await getWeather(city, tomorrow)
    );
  }

  if (
    lower.includes("скільки часу") ||
    lower.includes("сколько времени") ||
    lower.includes("время") ||
    lower.includes("котра година") ||
    lower.includes("который час")
  ) {
    const city = extractTimeCity(text);

    if (!city) {
      return sendMessage(
        chatId,
        "Напиши місто. Наприклад: Скільки часу в Токіо?"
      );
    }

    return sendMessage(
      chatId,
      await getWorldTime(city)
    );
  }

  if (text === "🤖 Моделі ШІ") {
    return sendMessage(
      chatId,
      "🤖 ChatGPT, Claude, Gemini, Grok, Perplexity та Copilot — популярні AI-сервіси."
    );
  }

  if (text === "💰 Тарифи") {
    return sendMessage(
      chatId,
      "💰 У більшості AI-сервісів є безкоштовні та платні тарифи."
    );
  }

  if (text === "🎯 Який ШІ обрати?") {
    return sendMessage(
      chatId,
      `🎯 Коротко:

Навчання — ChatGPT / Gemini
Код — ChatGPT / Claude
Пошук — Perplexity
Документи — Claude
Microsoft — Copilot`
    );
  }

  if (text === "ℹ️ Про бота") {
    return sendMessage(
      chatId,
      `ℹ️ AI Guide

Бот уміє:
🌤 показувати погоду по світу
🕒 показувати час у різних містах
💱 конвертувати валюти
🤖 відповідати через ШІ`
    );
  }

  await tg("sendChatAction", {
    chat_id: chatId,
    action: "typing"
  });

  const answer = await askAI(text);

  return sendMessage(chatId, answer, {
    reply_markup: MAIN_KEYBOARD
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
