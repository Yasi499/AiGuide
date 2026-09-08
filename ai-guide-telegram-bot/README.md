# AI Guide Telegram Bot

Мінімальний Telegram-бот на Next.js 16 (App Router, JavaScript, без TypeScript і Tailwind), який працює на Vercel через webhook.

## 1. Встановлення

```bash
npm install
```

Створи `.env.local`:

```env
TELEGRAM_BOT_TOKEN=токен_від_BotFather
```

Запуск локально:

```bash
npm run dev
```

## 2. Deploy на Vercel

1. Завантаж проєкт у GitHub або імпортуй папку у Vercel.
2. У Vercel → Settings → Environment Variables додай:
   `TELEGRAM_BOT_TOKEN`
3. Зроби Deploy.

## 3. Встановлення webhook

Після деплою твій endpoint:

```text
https://YOUR-PROJECT.vercel.app/api/telegram?token=YOUR_BOT_TOKEN
```

Встановити webhook можна через браузер:

```text
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https%3A%2F%2FYOUR-PROJECT.vercel.app%2Fapi%2Ftelegram%3Ftoken%3DYOUR_BOT_TOKEN
```

Перевірити webhook:

```text
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

## Команди

- `/start` — запуск і головне меню
- `/menu` — головне меню
- `/help` — список команд
- `/models` — інформація про AI-сервіси
- `/prices` — інформація про тарифи

## Що є в боті

- Reply Keyboard меню
- Inline-кнопки
- ChatGPT, Claude, Gemini, Grok, Perplexity, Copilot
- Переваги й сценарії використання
- Орієнтовна інформація про тарифи
- Міні-словник термінів ШІ

> Тарифи та назви доступних моделей можуть змінюватися, тому для навчального проєкту в боті є попередження перевіряти актуальні дані на офіційних сайтах.
