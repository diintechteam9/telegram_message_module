const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
require("dotenv").config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

let client;

// Default message template to be sent to users
const DEFAULT_MESSAGE = `Great speaking with you today!
At *Pragati Institute of Computer (MKCL-certified, Airoli)* we offer:

✨ MS-CIT (Computer Basics)
✨ Advanced Excel
✨ Graphic & Web Designing
✨ Basics of AI

📌 Flexible timings | Experienced faculty | 20+ years of trust

👉 Full details here:
https://pragatiinstituteofcomputers.wordpress.com/

– Team Pragati Institute of Computer
📞 98210313212`;

const initClient = async () => {
  if (!client) {
    client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    if (!process.env.TELEGRAM_SESSION) {
      throw new Error(
        "TELEGRAM_SESSION is not set. Generate a session string locally and set TELEGRAM_SESSION in your .env before starting the server."
      );
    }

    await client.connect();
  }
  return client;
};

const sendPragatiMessage = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }

    const tgClient = await initClient();

    // Resolve phone number to a Telegram user (expects +<countrycode><number>)
    let entity;
    try {
      entity = await tgClient.getEntity(phone);
    } catch (resolveErr) {
      // If not found via direct resolution, try importing as a contact
      try {
        const importResult = await tgClient.invoke(
          new Api.contacts.ImportContacts({
            contacts: [
              new Api.InputPhoneContact({
                clientId: BigInt(Date.now()),
                phone: String(phone),
                firstName: "",
                lastName: "",
              }),
            ],
            replace: false,
          })
        );

        // importResult.users is an array of Api.User
        const importedUser = (importResult && importResult.users && importResult.users[0]) || null;
        if (!importedUser || !importedUser.accessHash) {
          throw new Error(`Cannot find any entity corresponding to "${phone}"`);
        }

        entity = new Api.InputPeerUser({ userId: importedUser.id, accessHash: importedUser.accessHash });
      } catch (importErr) {
        throw importErr;
      }
    }

    // Send default message to the resolved/imported entity (Markdown formatting enabled)
    await tgClient.sendMessage(entity, { message: DEFAULT_MESSAGE, parseMode: "markdown" });

    res.json({ success: true, message: `Message sent to ${phone}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendPragatiMessage };
