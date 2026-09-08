export const metadata = {
  title: "AI Guide Telegram Bot",
  description: "Telegram bot webhook on Next.js 16"
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
