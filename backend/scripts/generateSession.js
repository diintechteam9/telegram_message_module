const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");
require("dotenv").config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

if (!apiId || !apiHash) {
  console.error("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in .env");
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (q) => new Promise((resolve) => rl.question(q, (ans) => resolve(ans.trim())));

(async () => {
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });

  try {
    await client.start({
      phoneNumber: async () => await ask("Enter your phone number: "),
      password: async () => await ask("Enter 2FA password (if any): "),
      phoneCode: async () => await ask("Enter the code you received: "),
      onError: (err) => console.error(err),
    });

    const session = client.session.save();
    console.log("\nLogin successful!\n");
    console.log("Add this to your .env file as TELEGRAM_SESSION=\n");
    console.log(session);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    rl.close();
    try { await client.disconnect(); } catch (_) {}
  }
})();


